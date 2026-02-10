'use client';
import { useState, useEffect } from 'react';
import { DiagnosticsEngine, DiagnosticResult } from '@/lib/diagnostics';
import { Loader2, CheckCircle, Wifi, Gauge, Smartphone, Globe, Play, AlertTriangle, XCircle, Monitor, Gamepad2, Video, Radio, Activity, ChevronDown, ChevronUp, Server } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function TestRunner({ code }: { code: string }) {
  const [loading, setLoading] = useState(true);
  const [linkData, setLinkData] = useState<any>(null);
  const [error, setError] = useState('');
  
  // Test State
  const [hasStarted, setHasStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [currentStep, setCurrentStep] = useState(0); 
  
  // Data State
  const [statusMsg, setStatusMsg] = useState('');
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<DiagnosticResult | null>(null);
  const [cpfCnpj, setCpfCnpj] = useState('');

  const [retryCount, setRetryCount] = useState(0);
  const [offlineMode, setOfflineMode] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const syncOfflineResults = async () => {
        const cached = localStorage.getItem('offline_results');
        if (cached) {
            try {
                const results = JSON.parse(cached);
                if (Array.isArray(results)) {
                    for (const r of results) {
                        await fetch('/api/results', {
                            method: 'POST',
                            body: JSON.stringify(r)
                        });
                    }
                    localStorage.removeItem('offline_results');
                    console.log('Synced offline results');
                }
            } catch (e) {
                console.error('Failed to sync offline results', e);
            }
        }
    };
    
    if (navigator.onLine) syncOfflineResults();
    window.addEventListener('online', () => {
        setOfflineMode(false);
        syncOfflineResults();
    });
    window.addEventListener('offline', () => setOfflineMode(true));
    return () => {
        window.removeEventListener('online', () => {});
        window.removeEventListener('offline', () => {});
    };
  }, []);

  useEffect(() => {
    fetch(`/api/links/${code}`)
      .then(res => {
        if (!res.ok) throw new Error('Link inválido ou expirado');
        return res.json();
      })
      .then(data => {
        setLinkData(data);
        if (data.cpfCnpj) setCpfCnpj(data.cpfCnpj);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [code]);

  const runTest = async () => {
    if (linkData.type !== 'UNIDENTIFIED' && !cpfCnpj) {
        alert('Por favor informe o CPF/CNPJ para continuar');
        return;
    }
    
    setHasStarted(true);
    setFinished(false);
    setCurrentStep(1);

    const engine = new DiagnosticsEngine((s, p) => {
        setStatusMsg(s);
        setProgress(p);
        if (p < 20) setCurrentStep(1); 
        else if (p < 40) setCurrentStep(2); 
        else if (p < 85) setCurrentStep(3); 
        else setCurrentStep(4); 
    });

    try {
        const res = await engine.run();
        setResult(res);
        setFinished(true);
        setCurrentStep(5);
        
        // Map DiagnosticResult to API Payload
        const payload = {
            linkId: linkData.id,
            cpfCnpj,
            
            // Device
            deviceType: "Mobile/Desktop", // Simplified
            os: res.device.platform,
            browser: res.device.browser,
            browserVersion: res.device.version,
            userAgent: res.device.userAgent,
            ram: res.device.ram,
            cpuCores: res.device.cores,
            gpu: res.device.gpu,

            // Network
            publicIp: res.network.ip,
            localIp: res.network.localIp,
            provider: res.network.provider,
            connectionType: res.network.connectionType,
            ipv6: res.network.ipv6,
            isIpv6: res.network.ipv6 !== "Não é IPv6",

            // MTU
            mtu: res.mtu.mtu,
            mss: res.mtu.mss,

            // Speed
            downloadAvg: res.speed.downloadAvg,
            downloadMax: res.speed.downloadMax,
            uploadAvg: res.speed.uploadAvg,
            uploadMax: res.speed.uploadMax,
            ping: res.speed.ping,
            jitter: res.speed.jitter,
            jitterStatus: res.speed.jitterStatus,

            // Streaming
            sdStatus: res.streaming.sd ? "OK" : "Dificuldades",
            hdStatus: res.streaming.hd ? "OK" : "Dificuldades",
            ultraHdStatus: res.streaming.ultraHd ? "OK" : "Dificuldades",
            liveStatus: res.streaming.live ? "OK" : "Dificuldades",
            status4k: res.streaming.k4 ? "OK" : "Dificuldades",

            // Bandwidth Quality
            qualitySpeed: res.bandwidth.speed,
            qualityLatency: res.bandwidth.latency,
            packetLoss: res.bandwidth.packetLoss,
            signalStatus: res.bandwidth.status,

            // Complex Data
            pageLoadMetrics: res.pageResponse, // API needs to handle array->json
            externalStatus: res.downdetector // API needs to handle array->json
        };

        try {
            await fetch('/api/results', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
        } catch (postError) {
            console.warn('Failed to send results, caching locally', postError);
            const cached = JSON.parse(localStorage.getItem('offline_results') || '[]');
            cached.push(payload);
            localStorage.setItem('offline_results', JSON.stringify(cached));
            setOfflineMode(true);
        }

    } catch (e) {
        console.error(e);
        if (retryCount < 3) {
            setRetryCount(prev => prev + 1);
            setTimeout(runTest, 1000);
        } else {
            setError('Erro ao executar teste. Verifique sua conexão.');
            setHasStarted(false);
        }
    }
  };

  if (loading) return <div className="flex h-screen items-center justify-center bg-slate-900 text-white"><Loader2 className="animate-spin h-10 w-10 text-blue-500" /></div>;
  if (error) return <div className="flex h-screen items-center justify-center bg-slate-900 text-red-500 font-bold text-xl">{error}</div>;

  if (finished && result) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center py-10 px-4">
        <div className="w-full max-w-5xl space-y-6">
            
            {/* Header / Summary Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-8 text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
                <CheckCircle className="h-20 w-20 text-green-500 mx-auto mb-4" />
                <h2 className="text-3xl font-bold mb-2 text-white">Teste Concluído!</h2>
                <p className="text-slate-400">Resultados enviados com sucesso.</p>
                {offlineMode && (
                    <div className="mt-4 inline-flex items-center gap-2 bg-yellow-900/30 text-yellow-500 px-4 py-2 rounded-full text-sm border border-yellow-800">
                        <AlertTriangle size={16} /> Modo Offline - Resultados salvos localmente
                    </div>
                )}
            </div>

            {/* Quality Score */}
            {result.quality && (
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className="p-4 bg-blue-500/10 rounded-full">
                            <Activity className="h-8 w-8 text-blue-500" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white">Qualidade da Conexão</h3>
                            <p className={`text-2xl font-black ${
                                result.quality.rating === 'Excelente' ? 'text-green-500' : 
                                result.quality.rating === 'Bom' ? 'text-blue-500' :
                                result.quality.rating === 'Regular' ? 'text-yellow-500' : 'text-red-500'
                            }`}>{result.quality.rating}</p>
                        </div>
                    </div>
                    <div className="flex-1 w-full md:w-auto">
                         {result.quality.issues.length > 0 ? (
                            <div className="bg-red-950/20 border border-red-900/50 rounded p-3">
                                <p className="text-red-400 text-sm font-semibold mb-1">Atenção Necessária:</p>
                                <ul className="list-disc list-inside text-xs text-red-300">
                                    {result.quality.issues.map((i, k) => <li key={k}>{i}</li>)}
                                </ul>
                            </div>
                         ) : (
                             <div className="text-green-500 text-sm flex items-center gap-2">
                                 <CheckCircle size={16}/> Nenhum problema detectado
                             </div>
                         )}
                    </div>
                </div>
            )}

            {/* Main Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard label="Download" value={result.speed.downloadAvg.toFixed(1)} unit="Mbps" icon={<Gauge className="text-cyan-400"/>} sub={`Max: ${result.speed.downloadMax.toFixed(1)}`} />
                <MetricCard label="Upload" value={result.speed.uploadAvg.toFixed(1)} unit="Mbps" icon={<Gauge className="text-purple-400"/>} sub={`Max: ${result.speed.uploadMax.toFixed(1)}`} />
                <MetricCard label="Ping" value={result.speed.ping.toFixed(0)} unit="ms" icon={<Activity className="text-yellow-400"/>} sub={`Jitter: ${result.speed.jitter.toFixed(0)}ms`} />
                <MetricCard label="Perda de Pacotes" value={result.bandwidth.packetLoss.toFixed(1)} unit="%" icon={<AlertTriangle className="text-red-400"/>} sub={result.bandwidth.status} />
            </div>

            {/* Expandable Details */}
            <button 
                onClick={() => setShowDetails(!showDetails)}
                className="w-full flex items-center justify-center gap-2 py-3 text-slate-400 hover:text-white transition-colors"
            >
                {showDetails ? <ChevronUp size={20}/> : <ChevronDown size={20}/>}
                {showDetails ? "Ocultar Detalhes Técnicos" : "Ver Detalhes Técnicos Completos"}
            </button>

            {showDetails && (
                <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-300">
                    
                    {/* Network & Device */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                            <h4 className="font-bold text-white mb-4 flex items-center gap-2"><Wifi size={18}/> Rede</h4>
                            <div className="space-y-2 text-sm">
                                <DetailRow label="Provedor" value={result.network.provider} />
                                <DetailRow label="IP Público" value={result.network.ip} />
                                <DetailRow label="IPv6" value={result.network.ipv6} />
                                <DetailRow label="Tipo" value={result.network.connectionType} />
                                <DetailRow label="MTU / MSS" value={`${result.mtu.mtu} / ${result.mtu.mss}`} />
                            </div>
                        </div>
                        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                            <h4 className="font-bold text-white mb-4 flex items-center gap-2"><Smartphone size={18}/> Dispositivo</h4>
                            <div className="space-y-2 text-sm">
                                <DetailRow label="Sistema" value={result.device.platform} />
                                <DetailRow label="Navegador" value={`${result.device.browser} ${result.device.version}`} />
                                <DetailRow label="Cores/RAM" value={`${result.device.cores} / ${result.device.ram}`} />
                                <DetailRow label="GPU" value={result.device.gpu} />
                            </div>
                        </div>
                    </div>

                    {/* Streaming Support */}
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                         <h4 className="font-bold text-white mb-4 flex items-center gap-2"><Video size={18}/> Streaming & Multimídia</h4>
                         <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                             <StatusBadge label="SD" active={result.streaming.sd} />
                             <StatusBadge label="HD" active={result.streaming.hd} />
                             <StatusBadge label="Ultra HD" active={result.streaming.ultraHd} />
                             <StatusBadge label="Live" active={result.streaming.live} />
                             <StatusBadge label="4K" active={result.streaming.k4} />
                         </div>
                    </div>

                    {/* Page Response Times */}
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                        <h4 className="font-bold text-white mb-4 flex items-center gap-2"><Globe size={18}/> Tempo de Resposta (Sites)</h4>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-slate-400 uppercase bg-slate-800/50">
                                    <tr>
                                        <th className="px-4 py-2">Site</th>
                                        <th className="px-4 py-2">Min</th>
                                        <th className="px-4 py-2">Méd</th>
                                        <th className="px-4 py-2">Max</th>
                                        <th className="px-4 py-2">Perda</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {result.pageResponse.map((site, i) => (
                                        <tr key={i} className="border-b border-slate-800 hover:bg-slate-800/30">
                                            <td className="px-4 py-2 font-medium">{site.name}</td>
                                            <td className="px-4 py-2">{Math.round(site.min)}ms</td>
                                            <td className="px-4 py-2 text-blue-400">{Math.round(site.avg)}ms</td>
                                            <td className="px-4 py-2">{Math.round(site.max)}ms</td>
                                            <td className={`px-4 py-2 ${site.packetLoss > 0 ? 'text-red-400' : 'text-green-500'}`}>{site.packetLoss.toFixed(0)}%</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Downdetector Status */}
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                        <h4 className="font-bold text-white mb-4 flex items-center gap-2"><Server size={18}/> Status de Serviços (Downdetector Simulado)</h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                            {result.downdetector.map((s, i) => (
                                <div key={i} className="flex items-center justify-between p-2 bg-slate-950 rounded border border-slate-800">
                                    <span className="text-xs font-medium text-slate-300">{s.name}</span>
                                    <span className={`h-2 w-2 rounded-full ${s.status === 'up' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-red-500'}`}></span>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            )}

            <div className="flex justify-center mt-8">
                <button 
                    onClick={() => window.location.reload()}
                    className="bg-blue-600 text-white px-8 py-3 rounded-full hover:bg-blue-500 font-bold shadow-lg shadow-blue-500/20 transition-all hover:scale-105"
                >
                    Realizar Novo Teste
                </button>
            </div>
        </div>
      </div>
    );
  }

  // Progress Screen
  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      <header className="border-b border-slate-800 bg-slate-900 py-4 px-6 flex items-center justify-between">
         <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-blue-600 text-white rounded flex items-center justify-center font-bold shadow-lg shadow-blue-500/20">F4</div>
            <span className="font-bold text-lg tracking-tight">Flow4Network</span>
         </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-4">
        {!hasStarted ? (
            <div className="text-center max-w-2xl">
                 <div className="mb-8 inline-flex p-6 rounded-full bg-blue-500/10 text-blue-500 animate-pulse">
                    <Wifi className="h-16 w-16" />
                </div>
                <h1 className="text-4xl md:text-5xl font-extrabold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                    Diagnóstico Avançado de Rede
                </h1>
                <p className="text-slate-400 text-lg mb-10 leading-relaxed">
                    Análise completa de velocidade, latência, rotas e qualidade de streaming em segundos.
                </p>

                {linkData && linkData.type !== 'UNIDENTIFIED' && !linkData.cpfCnpj && (
                    <div className="mb-8 max-w-sm mx-auto">
                        <input 
                            type="text" 
                            className="w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-3 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-600"
                            value={cpfCnpj}
                            onChange={e => setCpfCnpj(e.target.value)}
                            placeholder="Digite seu CPF ou CNPJ para iniciar"
                        />
                    </div>
                )}

                <button 
                    onClick={runTest}
                    className="group relative inline-flex items-center gap-3 bg-blue-600 hover:bg-blue-500 px-8 py-4 rounded-full text-xl font-bold transition-all transform hover:scale-105 shadow-xl shadow-blue-500/20"
                >
                    <Play className="h-6 w-6 fill-current" /> Iniciar Diagnóstico
                </button>
            </div>
        ) : (
            <div className="w-full max-w-md text-center">
                <div className="mb-8 relative h-48 w-48 mx-auto flex items-center justify-center">
                     {/* Circular Progress */}
                     <svg className="h-full w-full -rotate-90 transform" viewBox="0 0 100 100">
                        <circle className="text-slate-800" strokeWidth="8" stroke="currentColor" fill="transparent" r="40" cx="50" cy="50" />
                        <circle 
                            className="text-blue-500 transition-all duration-500 ease-out" 
                            strokeWidth="8" 
                            strokeDasharray={`${2 * Math.PI * 40}`} 
                            strokeDashoffset={`${2 * Math.PI * 40 * (1 - progress / 100)}`}
                            strokeLinecap="round" 
                            stroke="currentColor" 
                            fill="transparent" 
                            r="40" cx="50" cy="50" 
                        />
                     </svg>
                     <div className="absolute inset-0 flex items-center justify-center flex-col">
                         <span className="text-4xl font-bold">{Math.round(progress)}%</span>
                     </div>
                </div>
                
                <h3 className="text-2xl font-bold mb-2 animate-pulse">{statusMsg}</h3>
                <div className="flex justify-center gap-2 mt-4 text-slate-500">
                    <StepIndicator active={currentStep >= 1} />
                    <StepIndicator active={currentStep >= 2} />
                    <StepIndicator active={currentStep >= 3} />
                    <StepIndicator active={currentStep >= 4} />
                </div>
            </div>
        )}
      </main>
    </div>
  );
}

const StepIndicator = ({ active }: { active: boolean }) => (
    <div className={`h-2 w-12 rounded-full transition-colors duration-300 ${active ? 'bg-blue-500' : 'bg-slate-800'}`} />
);

const MetricCard = ({ label, value, unit, icon, sub }: any) => (
    <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl hover:border-slate-700 transition-colors">
        <div className="flex items-center justify-between mb-2">
            <span className="text-slate-400 text-sm font-medium">{label}</span>
            {icon}
        </div>
        <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold text-white">{value}</span>
            <span className="text-sm text-slate-500">{unit}</span>
        </div>
        {sub && <div className="mt-2 text-xs text-slate-500">{sub}</div>}
    </div>
);

const DetailRow = ({ label, value }: any) => (
    <div className="flex justify-between py-1 border-b border-slate-800 last:border-0">
        <span className="text-slate-400">{label}</span>
        <span className="font-medium text-white truncate max-w-[200px]">{value || '-'}</span>
    </div>
);

const StatusBadge = ({ label, active }: any) => (
    <div className={`flex flex-col items-center justify-center p-3 rounded-lg border ${active ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-slate-900 border-slate-800 text-slate-600'}`}>
        <span className="font-bold text-lg">{label}</span>
        <span className="text-[10px] uppercase mt-1">{active ? 'OK' : 'N/A'}</span>
    </div>
);
