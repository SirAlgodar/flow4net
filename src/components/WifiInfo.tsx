'use client';

import { useState, useEffect } from 'react';
import { Wifi, Signal, Info, ShieldAlert, LocateFixed, CheckCircle2, AlertTriangle } from 'lucide-react';
import { ClientPermissions } from '@/lib/client-permissions';

interface NetworkDetails {
  type: string;
  effectiveType: string;
  downlink: number;
  rtt: number;
  saveData: boolean;
  ssid?: string; // Add optional backend data
  rssi?: number;
}

export function WifiInfo() {
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [networkInfo, setNetworkInfo] = useState<NetworkDetails | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const getNetworkData = async (forcePermission = false) => {
    setLoading(true);
    
    // 0. Explicitly request permissions if forced (important for Mobile Web)
    if (forcePermission) {
        try {
            // Note: This must be triggered by user interaction to work reliably on mobile
            const perm = await ClientPermissions.requestNetworkPermissions();
            if (perm.granted) {
                setPermissionGranted(true);
                setError(''); 
                console.log('Network permissions granted:', perm.data);
            } else {
                setPermissionGranted(false);
                setError(perm.error || 'Permissão de localização negada. Detalhes da rede podem estar limitados.');
            }
        } catch (e) {
            console.error('Error requesting permissions:', e);
            setError('Erro ao solicitar permissões.');
        }
    }

    // 1. Try to fetch Server-side WiFi info (Useful for Local/Kiosk mode)
    try {
        const res = await fetch('/api/network/wifi');
        if (res.ok) {
            const result = await res.json();
            if (result.connected && result.data) {
                console.log("Server WiFi Data:", result.data);
                
                const backendSsid = result.data.ssid === '<redacted>' ? 'WiFi Conectado (SSID Oculto)' : result.data.ssid;
                
                setNetworkInfo(prev => ({
                    ...prev!,
                    type: 'WiFi', // Force WiFi type since we have confirmation from backend
                    effectiveType: prev?.effectiveType || '4g',
                    downlink: prev?.downlink || 0,
                    rtt: prev?.rtt || 0,
                    saveData: prev?.saveData || false,
                    ssid: backendSsid,
                    rssi: result.data.signal_level,
                }));
                // If we got backend data, we consider it a "permission" equivalent success (we have data)
                setPermissionGranted(true);
            }
        }
    } catch (e) {
        console.warn("Failed to fetch backend WiFi info:", e);
    }

    // 2. Browser Network Information API
    const conn = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    
    if (conn) {
      const typeLabel = conn.type === 'wifi' ? 'WiFi' : 
                        conn.type === 'cellular' ? 'Dados Móveis' :
                        conn.type === 'ethernet' ? 'Cabo' :
                        conn.type === 'none' ? 'Sem Rede' : 
                        conn.type ? conn.type : 'Indefinido (Limitação Web)';

      setNetworkInfo(prev => {
        // If we already have backend WiFi confirmation, keep it as WiFi
        // But update other metrics like downlink/rtt which come from browser
        const currentType = prev?.ssid ? 'WiFi' : typeLabel;
        
        return {
            ...prev, // Keep backend data if any
            type: currentType,
            effectiveType: conn.effectiveType || 'unknown',
            downlink: conn.downlink || 0,
            rtt: conn.rtt || 0,
            saveData: conn.saveData || false
        };
      });
      
      // If we didn't force permission, check if we implicitly have it or if data is generic
      if (!forcePermission && !permissionGranted) {
          // If we have "generic" info, we still might want to ask for permission to be sure/get better info
          // But for now, let's say if we have backend data OR we explicitly asked, we are good.
      }
      
      // Add listener for changes
      const updateConnection = () => {
         const updatedTypeLabel = conn.type === 'wifi' ? 'WiFi' : 
                                  conn.type === 'cellular' ? 'Dados Móveis' :
                                  conn.type === 'ethernet' ? 'Cabo' :
                                  conn.type === 'none' ? 'Sem Rede' : 
                                  conn.type ? conn.type : 'Indefinido (Limitação Web)';

         setNetworkInfo(prev => {
            const currentType = prev?.ssid ? 'WiFi' : updatedTypeLabel;
            return {
                ...prev,
                type: currentType,
                effectiveType: conn.effectiveType || 'unknown',
                downlink: conn.downlink || 0,
                rtt: conn.rtt || 0,
                saveData: conn.saveData || false,
                // Preserves ssid/rssi if they exist
                ssid: prev?.ssid,
                rssi: prev?.rssi
            };
          });
      };
      
      conn.addEventListener('change', updateConnection);
      // Cleanup is tricky with async, but for this component it's fine
    } else {
       if (!networkInfo) {
           const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
           const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
           const inIframe = typeof window !== 'undefined' ? window.self !== window.top : false;
           const insecure = typeof window !== 'undefined' ? !window.isSecureContext : false;
           
           if (insecure && !isLocalhost) {
              setError('APIs de Navegador bloqueadas: o navegador exige HTTPS para liberar informações de rede. Abra via https ou localhost.');
           } else if (inIframe) {
              setError('APIs de Navegador bloqueadas em iframe. Abra o teste em uma nova aba/janela.');
           } else {
              setError('APIs de Navegador limitadas neste dispositivo/navegador.');
           }
       }
    }
    
    setLoading(false);
  };

  useEffect(() => {
    // Initial check (silent)
    getNetworkData(false);
  }, []);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 h-fit">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><Wifi className="text-blue-500"/> Rede</h3>
        
        {!permissionGranted && !networkInfo?.ssid && (
            <div className="mb-4 p-3 bg-yellow-900/20 border border-yellow-800/50 rounded-lg">
                <p className="text-yellow-400 text-sm mb-2 flex items-center gap-2 font-semibold">
                    <ShieldAlert size={16}/> Permissão Recomendada
                </p>
                <p className="text-slate-400 text-xs mb-3 leading-relaxed">
                    Para identificar com precisão se você está no WiFi ou Dados Móveis (4G/5G), o navegador requer permissão de localização.
                    <span className="block mt-1 text-slate-500 italic">Isso não compartilha sua posição GPS exata, apenas libera o acesso às interfaces de rede.</span>
                </p>
                <button 
                    onClick={() => getNetworkData(true)}
                    className="w-full py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2"
                >
                    <LocateFixed size={16}/> Permitir Acesso à Rede
                </button>
                {error && <p className="text-red-400 text-xs mt-2 text-center">{error}</p>}
            </div>
        )}

        <div className="space-y-4">
            {/* Connection Type */}
            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                <span className="text-slate-400">Tipo de Conexão</span>
                <span className="text-white font-medium flex items-center gap-2">
                    {networkInfo?.type === 'WiFi' ? <Wifi size={16} className="text-green-500"/> : 
                     networkInfo?.type === 'Dados Móveis' ? <Signal size={16} className="text-blue-500"/> : 
                     <Info size={16} className="text-slate-500"/>}
                    {networkInfo?.type || 'Verificando...'}
                </span>
            </div>

            {/* SSID (Backend/Simulated) */}
            {networkInfo?.ssid && (
                 <div className="bg-blue-950/30 border border-blue-900/50 rounded p-2">
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-xs text-blue-400">SSID (Rede Local)</span>
                        {networkInfo.rssi && (
                            <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                                networkInfo.rssi > -60 ? 'bg-green-500/20 text-green-400' : 
                                networkInfo.rssi > -75 ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'
                            }`}>
                                {networkInfo.rssi} dBm
                            </span>
                        )}
                    </div>
                    <span className="text-white font-mono text-sm truncate block" title={networkInfo.ssid}>
                        {networkInfo.ssid}
                    </span>
                 </div>
            )}

            {/* Technical Details (Web API) */}
            <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-slate-950 p-2 rounded border border-slate-800">
                    <span className="text-slate-500 block mb-1">Tecnologia (Est.)</span>
                    <span className="text-slate-300 font-mono uppercase">{networkInfo?.effectiveType || 'N/A'}</span>
                </div>
                <div className="bg-slate-950 p-2 rounded border border-slate-800">
                    <span className="text-slate-500 block mb-1">Downlink (Est.)</span>
                    <span className="text-slate-300 font-mono">{networkInfo?.downlink ? `${networkInfo.downlink} Mbps` : 'N/A'}</span>
                </div>
                <div className="bg-slate-950 p-2 rounded border border-slate-800">
                    <span className="text-slate-500 block mb-1">RTT (Ping Est.)</span>
                    <span className="text-slate-300 font-mono">{networkInfo?.rtt ? `${networkInfo.rtt} ms` : 'N/A'}</span>
                </div>
                <div className="bg-slate-950 p-2 rounded border border-slate-800">
                    <span className="text-slate-500 block mb-1">Economia de Dados</span>
                    <span className="text-slate-300 font-mono">{networkInfo?.saveData ? 'Sim' : 'Não'}</span>
                </div>
            </div>
            
            {!networkInfo?.ssid && networkInfo?.type === 'Indefinido (Limitação Web)' && (
                <div className="flex items-start gap-2 text-[10px] text-slate-500 mt-2">
                    <AlertTriangle size={12} className="mt-0.5 shrink-0"/>
                    <p>O navegador não permite acesso direto ao SSID/Sinal WiFi por motivos de privacidade. Dados estimados via API de Rede.</p>
                </div>
            )}
        </div>
    </div>
  );
}
