'use client';
import { useState, useEffect } from 'react';
import { DiagnosticsEngine, DiagnosticResult } from '@/lib/diagnostics';
import { Loader2, CheckCircle, Wifi, Gauge, Smartphone, Globe, Play, AlertTriangle, XCircle, Monitor, Gamepad2, Video, Radio, Activity } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

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
  const [currentStep, setCurrentStep] = useState(0); // 0: Idle, 1: Device, 2: Network, 3: Speed, 4: Results
  
  // Data State
  const [statusMsg, setStatusMsg] = useState('');
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<DiagnosticResult | null>(null);
  const [cpfCnpj, setCpfCnpj] = useState('');

  const [retryCount, setRetryCount] = useState(0);
  const [offlineMode, setOfflineMode] = useState(false);

  useEffect(() => {
    // Check for cached offline results and try to sync
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
    
    if (navigator.onLine) {
        syncOfflineResults();
    }
    
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
    setCurrentStep(1); // Device Info

    const engine = new DiagnosticsEngine((s, p) => {
        setStatusMsg(s);
        setProgress(p);
        
        // Simple logic to map progress to steps for visual feedback
        if (p < 20) setCurrentStep(1); // Device
        else if (p < 40) setCurrentStep(2); // Network
        else if (p < 85) setCurrentStep(3); // Speed
        else setCurrentStep(4); // Quality/External
    });

    try {
        const res = await engine.run();
        setResult(res);
        setFinished(true);
        setCurrentStep(5); // Done
        
        const payload = {
            linkId: linkData.id,
            cpfCnpj,
            device: res.device,
            network: res.network,
            speed: res.speed,
            streaming: res.streaming,
            externalStatus: res.externalStatus,
            // Pass quality analysis if available
            quality: res.quality
        };

        try {
            await fetch('/api/results', {
                method: 'POST',
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
            console.log(`Retrying test... (${retryCount + 1}/3)`);
            setRetryCount(prev => prev + 1);
            setTimeout(runTest, 2000 * Math.pow(2, retryCount)); // Exponential backoff
        } else {
            setError('Erro ao executar teste após múltiplas tentativas. Verifique sua conexão.');
            setHasStarted(false);
        }
    }
  };

  if (loading) return <div className="flex h-screen items-center justify-center bg-background text-foreground"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>;
  if (error) return <div className="flex h-screen items-center justify-center bg-background text-destructive font-semibold">{error}</div>;

  if (finished && result) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center py-10 px-4">
        <div className="bg-card border border-border rounded-lg shadow-lg p-8 max-w-2xl w-full">
            <div className="flex flex-col items-center mb-6">
                <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
                <h2 className="text-2xl font-bold">Teste Concluído!</h2>
                <p className="text-muted-foreground">Seus resultados foram enviados com sucesso.</p>
                {offlineMode && (
                    <div className="mt-2 bg-yellow-100 text-yellow-800 px-3 py-1 rounded text-sm flex items-center gap-2">
                        <AlertTriangle size={14} /> Resultados salvos offline. Serão enviados ao reconectar.
                    </div>
                )}
            </div>

            {/* Quality Alert Section */}
            {result.quality && (
                <div className={`mb-6 p-4 rounded-lg border ${
                    result.quality.rating === 'Excelente' || result.quality.rating === 'Bom' 
                        ? 'bg-green-50 border-green-200' 
                        : result.quality.rating === 'Regular' 
                            ? 'bg-yellow-50 border-yellow-200' 
                            : 'bg-red-50 border-red-200'
                }`}>
                    <h3 className="font-semibold text-lg flex items-center gap-2 mb-2">
                        <Activity size={20} /> Qualidade da Conexão: {result.quality.rating}
                    </h3>
                    
                    {result.quality.issues.length > 0 && (
                        <div className="mt-3">
                            <p className="font-medium text-sm mb-1">Problemas Detectados:</p>
                            <ul className="list-disc list-inside text-sm space-y-1">
                                {result.quality.issues.map((issue, idx) => (
                                    <li key={idx}>{issue}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                    
                    {result.quality.recommendations.length > 0 && (
                        <div className="mt-3">
                            <p className="font-medium text-sm mb-1">Sugestões:</p>
                            <ul className="list-disc list-inside text-sm space-y-1">
                                {result.quality.recommendations.map((rec, idx) => (
                                    <li key={idx}>{rec}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}

            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-4 bg-muted rounded">
                    <p className="text-sm text-muted-foreground">Download</p>
                    <p className="text-xl font-bold">{result.speed.download.toFixed(1)} Mbps</p>
                </div>
                <div className="p-4 bg-muted rounded">
                    <p className="text-sm text-muted-foreground">Upload</p>
                    <p className="text-xl font-bold">{result.speed.upload.toFixed(1)} Mbps</p>
                </div>
                <div className="p-4 bg-muted rounded">
                    <p className="text-sm text-muted-foreground">Ping</p>
                    <p className="text-xl font-bold">{result.speed.ping.toFixed(0)} ms</p>
                </div>
                <div className="p-4 bg-muted rounded">
                    <p className="text-sm text-muted-foreground">Jitter</p>
                    <p className="text-xl font-bold">{result.speed.jitter.toFixed(0)} ms</p>
                </div>
            </div>

            {/* Network Details */}
            <div className="mb-6 border-t pt-4">
                 <h4 className="font-semibold mb-3 flex items-center gap-2"><Wifi size={16}/> Detalhes da Rede</h4>
                 <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                        <span className="text-muted-foreground">Tipo:</span> <span className="uppercase font-medium">{result.network.connectionType || 'N/A'}</span>
                    </div>
                    {result.network.connectionType === 'wifi' && (
                        <>
                             <div>
                                <span className="text-muted-foreground">Frequência:</span> <span className="font-medium">{result.network.frequency || '2.4'} GHz</span>
                             </div>
                             <div>
                                <span className="text-muted-foreground">Sinal:</span> <span className="font-medium">{result.network.signalStrength || 0}%</span>
                             </div>
                        </>
                    )}
                 </div>
            </div>

            <div className="flex justify-center">
                <button 
                    onClick={() => window.location.reload()}
                    className="bg-primary text-primary-foreground px-6 py-2 rounded hover:bg-primary/90"
                >
                    Realizar Novo Teste
                </button>
            </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card py-4 px-6 flex items-center justify-between">
         <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-primary text-primary-foreground rounded flex items-center justify-center font-bold">F4</div>
            <span className="font-semibold text-lg">Flow4Network</span>
         </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-4xl">
            
            {/* Start Screen */}
            {!hasStarted && !finished && (
                <div className="bg-card border border-border rounded-xl p-8 md:p-12 text-center shadow-lg">
                    <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <Wifi className="h-10 w-10" />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold mb-4">Teste de Qualidade da Conexão</h1>
                    <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
                        Este teste analisa velocidade, latência e estabilidade da sua internet para identificar possíveis problemas de performance.
                    </p>

                    {linkData.type !== 'UNIDENTIFIED' && !linkData.cpfCnpj && (
                        <div className="mb-8 max-w-xs mx-auto text-left">
                            <label className="block text-sm font-medium text-muted-foreground mb-1">CPF ou CNPJ</label>
                            <input 
                                type="text" 
                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                value={cpfCnpj}
                                onChange={e => setCpfCnpj(e.target.value)}
                                placeholder="Digite seu CPF ou CNPJ"
                            />
                        </div>
                    )}

                    <button 
                        onClick={runTest}
                        className="inline-flex items-center gap-2 bg-primary text-primary-foreground hover:bg-blue-600 px-8 py-4 rounded-lg text-xl font-bold transition-all transform hover:scale-105"
                    >
                        <Play className="h-6 w-6" /> Iniciar Teste
                    </button>
                </div>
            )}

            {/* Progress Screen */}
            {hasStarted && !finished && (
                <div className="space-y-8">
                    {/* Stepper */}
                    <div className="flex justify-between items-center px-4 md:px-12">
                        <StepItem step={1} current={currentStep} label="Dispositivo" icon={Smartphone} />
                        <div className="h-1 flex-1 bg-muted mx-2 rounded overflow-hidden">
                             <div className={cn("h-full bg-primary transition-all duration-500", currentStep > 1 ? "w-full" : "w-0")} />
                        </div>
                        <StepItem step={2} current={currentStep} label="Rede" icon={Globe} />
                        <div className="h-1 flex-1 bg-muted mx-2 rounded overflow-hidden">
                             <div className={cn("h-full bg-primary transition-all duration-500", currentStep > 2 ? "w-full" : "w-0")} />
                        </div>
                        <StepItem step={3} current={currentStep} label="Velocidade" icon={Gauge} />
                        <div className="h-1 flex-1 bg-muted mx-2 rounded overflow-hidden">
                             <div className={cn("h-full bg-primary transition-all duration-500", currentStep > 3 ? "w-full" : "w-0")} />
                        </div>
                        <StepItem step={4} current={currentStep} label="Qualidade" icon={CheckCircle} />
                    </div>

                    <div className="bg-card border border-border rounded-xl p-8 md:p-12 text-center shadow-lg relative overflow-hidden">
                         <div className="absolute top-0 left-0 h-1 bg-primary transition-all duration-300" style={{ width: `${progress}%` }} />
                         
                         <div className="mb-6">
                             <Loader2 className="h-16 w-16 text-primary animate-spin mx-auto" />
                         </div>
                         <h2 className="text-2xl font-bold mb-2">{statusMsg}</h2>
                         <p className="text-muted-foreground">Aguarde enquanto analisamos sua conexão...</p>
                         <div className="mt-4 text-2xl font-mono font-bold text-primary">{Math.round(progress)}%</div>
                    </div>
                </div>
            )}

            {/* Results Screen */}
            {finished && result && (
                <div className="space-y-6 animate-in fade-in duration-700 slide-in-from-bottom-4">
                    {/* Status Header */}
                    <div className="bg-card border border-border rounded-xl p-6 flex flex-col md:flex-row items-center gap-6 shadow-lg">
                        <div className={cn(
                            "h-16 w-16 rounded-full flex items-center justify-center shrink-0",
                            result.speed.download > 10 && result.speed.packetLoss < 1 ? "bg-success/20 text-success" : "bg-warning/20 text-warning"
                        )}>
                            {result.speed.download > 10 && result.speed.packetLoss < 1 ? <CheckCircle className="h-8 w-8" /> : <AlertTriangle className="h-8 w-8" />}
                        </div>
                        <div className="text-center md:text-left">
                            <h2 className="text-2xl font-bold mb-1">
                                {result.speed.download > 10 && result.speed.packetLoss < 1 ? "Conexão Estável" : "Conexão com Instabilidade"}
                            </h2>
                            <p className="text-muted-foreground">
                                {result.speed.download > 10 && result.speed.packetLoss < 1 
                                    ? "Sua conexão está ótima para streaming em 4K, jogos online e chamadas de vídeo."
                                    : "Detectamos variações que podem afetar chamadas de vídeo e jogos online."}
                            </p>
                        </div>
                    </div>

                    {/* Main Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <MetricCard 
                            title="Download" 
                            value={result.speed.download.toFixed(1)} 
                            unit="Mbps" 
                            icon={Gauge} 
                            color="text-success"
                        />
                         <MetricCard 
                            title="Upload" 
                            value={result.speed.upload.toFixed(1)} 
                            unit="Mbps" 
                            icon={Gauge} 
                            color="text-primary"
                        />
                         <MetricCard 
                            title="Ping" 
                            value={result.speed.ping.toFixed(0)} 
                            unit="ms" 
                            icon={Zap} 
                            color="text-yellow-500"
                        />
                         <MetricCard 
                            title="Jitter" 
                            value={result.speed.jitter.toFixed(0)} 
                            unit="ms" 
                            icon={Zap} 
                            color="text-muted-foreground"
                        />
                    </div>

                    {/* Quality of Experience */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-card border border-border rounded-xl p-6">
                            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                                <Monitor className="h-5 w-5 text-primary" /> Experiência de Uso
                            </h3>
                            <div className="space-y-4">
                                <QualityRow 
                                    label="Streaming 4K / UHD" 
                                    status={result.streaming.uhd} 
                                    icon={Video}
                                />
                                <QualityRow 
                                    label="Jogos Online" 
                                    status={result.speed.ping < 50 && result.speed.jitter < 10} 
                                    icon={Gamepad2}
                                />
                                <QualityRow 
                                    label="Chamadas de Vídeo" 
                                    status={result.speed.upload > 2 && result.speed.jitter < 30} 
                                    icon={Radio}
                                />
                            </div>
                        </div>

                         <div className="bg-card border border-border rounded-xl p-6">
                            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                                <Globe className="h-5 w-5 text-primary" /> Serviços Externos
                            </h3>
                            <div className="space-y-3">
                                {result.externalStatus && JSON.parse(result.externalStatus).map((s: any) => (
                                    <div key={s.name} className="flex justify-between items-center p-2 rounded bg-background/50">
                                        <span className="font-medium">{s.name}</span>
                                        <div className="flex items-center gap-2">
                                            {s.status === 'up' 
                                                ? <span className="text-xs font-bold text-success bg-success/10 px-2 py-1 rounded">ONLINE</span>
                                                : <span className="text-xs font-bold text-destructive bg-destructive/10 px-2 py-1 rounded">OFFLINE</span>
                                            }
                                            {s.status === 'up' && <span className="text-xs text-muted-foreground">{Math.round(s.latency)}ms</span>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Technical Details Accordion (Simplified as a box for now) */}
                    <div className="bg-card border border-border rounded-xl p-6">
                        <details className="group">
                            <summary className="flex cursor-pointer items-center justify-between font-medium text-muted-foreground hover:text-foreground">
                                <span>Ver Detalhes Técnicos</span>
                                <span className="transition group-open:rotate-180">
                                    <svg fill="none" height="24" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
                                </span>
                            </summary>
                            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm pt-4 border-t border-border">
                                <div>
                                    <span className="block text-muted-foreground">IP Público</span>
                                    <span className="font-mono">{result.network.ip}</span>
                                </div>
                                <div>
                                    <span className="block text-muted-foreground">Sistema Operacional</span>
                                    <span>{result.device.os} ({result.device.browser})</span>
                                </div>
                                <div>
                                    <span className="block text-muted-foreground">Conexão</span>
                                    <span>{result.network.connectionType || 'Desconhecido'}</span>
                                </div>
                                 <div>
                                    <span className="block text-muted-foreground">User Agent</span>
                                    <span className="break-all text-xs text-muted-foreground">{result.device.userAgent}</span>
                                </div>
                            </div>
                        </details>
                    </div>

                    <div className="flex justify-center pt-4">
                        <button onClick={() => window.location.reload()} className="text-primary hover:underline">
                            Realizar novo teste
                        </button>
                    </div>
                </div>
            )}
        </div>
      </main>
    </div>
  );
}

// Subcomponents

function StepItem({ step, current, label, icon: Icon }: { step: number, current: number, label: string, icon: any }) {
    const isActive = current === step;
    const isCompleted = current > step;
    
    return (
        <div className="flex flex-col items-center gap-2">
            <div className={cn(
                "h-10 w-10 rounded-full flex items-center justify-center transition-all duration-300",
                isActive ? "bg-primary text-primary-foreground scale-110 shadow-lg ring-4 ring-primary/20" : 
                isCompleted ? "bg-success text-success-foreground" : "bg-muted text-muted-foreground"
            )}>
                {isCompleted ? <CheckCircle className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
            </div>
            <span className={cn(
                "text-sm font-medium transition-colors",
                isActive ? "text-primary" : isCompleted ? "text-success" : "text-muted-foreground"
            )}>{label}</span>
        </div>
    )
}

function MetricCard({ title, value, unit, icon: Icon, color }: { title: string, value: string, unit: string, icon: any, color: string }) {
    return (
        <div className="bg-card border border-border rounded-xl p-4 flex flex-col justify-between shadow-sm">
            <div className="flex justify-between items-start mb-2">
                <span className="text-muted-foreground text-sm font-medium">{title}</span>
                <Icon className={cn("h-4 w-4", color)} />
            </div>
            <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold">{value}</span>
                <span className="text-xs text-muted-foreground">{unit}</span>
            </div>
        </div>
    )
}

function QualityRow({ label, status, icon: Icon }: { label: string, status: boolean, icon: any }) {
    return (
        <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-background/50">
            <div className="flex items-center gap-3">
                <div className={cn("p-2 rounded-full", status ? "bg-success/10 text-success" : "bg-warning/10 text-warning")}>
                    <Icon className="h-4 w-4" />
                </div>
                <span className="font-medium">{label}</span>
            </div>
            {status ? (
                <span className="text-xs font-bold text-success bg-success/10 px-2 py-1 rounded-full">Excelente</span>
            ) : (
                <span className="text-xs font-bold text-warning bg-warning/10 px-2 py-1 rounded-full">Instável</span>
            )}
        </div>
    )
}

function Zap(props: any) {
    return (
         <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
    )
}
