'use client';

import { useState, useEffect } from 'react';
import { Wifi, Signal, Info, ShieldCheck, ShieldAlert } from 'lucide-react';

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

  const getNetworkData = async () => {
    // 1. Try to fetch Server-side WiFi info (Useful for Local/Kiosk mode)
    try {
        const res = await fetch('/api/network/wifi');
        if (res.ok) {
            const result = await res.json();
            if (result.connected && result.data) {
                // If we got valid WiFi data from backend, merge it
                // Note: In production (cloud), this will likely be null or server's network
                console.log("Server WiFi Data:", result.data);
                
                const backendSsid = result.data.ssid === '<redacted>' ? 'WiFi Conectado (SSID Oculto)' : result.data.ssid;
                
                setNetworkInfo(prev => ({
                    ...prev!,
                    ssid: backendSsid,
                    rssi: result.data.signal_level,
                    type: 'WiFi' // Force WiFi type since we have confirmation from backend
                }));
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
                        conn.type ? conn.type : 'Indefinido (Navegador)';

      setNetworkInfo(prev => {
        // If we already have backend WiFi confirmation, keep it as WiFi
        // But update other metrics like downlink/rtt which come from browser
        const currentType = prev?.type === 'WiFi' ? 'WiFi' : typeLabel;
        
        return {
            ...prev, // Keep backend data if any
            type: currentType,
            effectiveType: conn.effectiveType || 'unknown',
            downlink: conn.downlink || 0,
            rtt: conn.rtt || 0,
            saveData: conn.saveData || false
        };
      });
      setPermissionGranted(true);
      
      // Add listener for changes
      const updateConnection = () => {
         const updatedTypeLabel = conn.type === 'wifi' ? 'WiFi' : 
                                  conn.type === 'cellular' ? 'Dados Móveis' :
                                  conn.type === 'ethernet' ? 'Cabo' :
                                  conn.type === 'none' ? 'Sem Rede' : 
                                  conn.type ? conn.type : 'Indefinido (Navegador)';

         setNetworkInfo(prev => {
            const currentType = prev?.type === 'WiFi' ? 'WiFi' : updatedTypeLabel;
            return {
                ...prev,
                type: currentType,
                effectiveType: conn.effectiveType || 'unknown',
                downlink: conn.downlink || 0,
                rtt: conn.rtt || 0,
                saveData: conn.saveData || false
            };
          });
      };
      
      conn.addEventListener('change', updateConnection);
      return () => conn.removeEventListener('change', updateConnection);
    } else {
      // Even if browser API fails, we might have backend data
      setPermissionGranted(true); // Allow showing what we have
      setError('API de Navegador limitada. Tentando dados do sistema...');
    }
  };

  const requestPermission = async () => {
    try {
        // Try to request Geolocation permission as a proxy for "Network Access" intent
        // This sometimes triggers browser heuristics to allow more network info
        await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
        });
    } catch (e) {
        console.warn("Geolocation permission denied or timed out, proceeding with basic info");
    }
    
    getNetworkData();
  };

  return (
    <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700 backdrop-blur-sm max-w-md w-full mx-auto my-4">
      <div className="flex items-center gap-2 mb-3 border-b border-slate-700 pb-2">
        <Wifi className="text-blue-400 w-5 h-5" />
        <h3 className="font-semibold text-slate-200">Informações de Rede</h3>
      </div>

      {!permissionGranted ? (
        <div className="text-center py-4">
            <p className="text-slate-400 text-sm mb-4">
                Solicite permissão para tentar obter detalhes aprimorados da conexão. 
                (Nota: Em redes WiFi, '4G' pode aparecer indicando a velocidade estimada, não o sinal).
            </p>
            <button 
                onClick={requestPermission}
                className="flex items-center gap-2 mx-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium"
            >
                <ShieldCheck className="w-4 h-4" />
                Solicitar Acesso Completo
            </button>
            {error && <p className="text-red-400 text-xs mt-2 flex items-center justify-center gap-1"><ShieldAlert className="w-3 h-3"/> {error}</p>}
        </div>
      ) : (
        <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-900/50 p-2 rounded border border-slate-700/50">
                    <span className="text-xs text-slate-500 block">Tipo de Interface</span>
                    <span className="font-mono text-blue-300 capitalize">
                        {networkInfo?.type}
                    </span>
                </div>
                <div className="bg-slate-900/50 p-2 rounded border border-slate-700/50">
                    <span className="text-xs text-slate-500 block">Velocidade Estimada (Web)</span>
                    <span className="font-mono text-slate-300">
                        {networkInfo?.effectiveType?.toUpperCase()} ({networkInfo?.downlink} Mbps)
                    </span>
                </div>
                
                {networkInfo?.ssid && (
                    <div className="col-span-2 bg-blue-900/20 p-2 rounded border border-blue-800/50 mt-1">
                        <span className="text-xs text-blue-400 block mb-1">Dados de Sistema (Local/Backend)</span>
                        <div className="flex justify-between items-center">
                            <span className="font-bold text-white flex items-center gap-2">
                                <Wifi size={14} /> {networkInfo.ssid}
                            </span>
                            {networkInfo.rssi && (
                                <span className={`text-xs px-2 py-0.5 rounded ${
                                    networkInfo.rssi > -50 ? 'bg-green-500/20 text-green-400' :
                                    networkInfo.rssi > -70 ? 'bg-yellow-500/20 text-yellow-400' :
                                    'bg-red-500/20 text-red-400'
                                }`}>
                                    {networkInfo.rssi} dBm
                                </span>
                            )}
                        </div>
                        <p className="text-[10px] text-slate-500 mt-1 leading-tight">
                            * Estes dados vêm do hardware onde o servidor está rodando.
                        </p>
                    </div>
                )}
                <div className="bg-slate-900/50 p-2 rounded border border-slate-700/50">
                    <span className="text-xs text-slate-500 block">Latência Estimada</span>
                    <span className="font-mono text-yellow-300">{networkInfo?.rtt} ms</span>
                </div>
            </div>
            
            <div className="bg-blue-900/20 p-2 rounded border border-blue-900/30 flex gap-2 items-start">
                <Info className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                <p className="text-xs text-blue-200/80">
                    O indicador "Velocidade Estimada" (ex: 4G) refere-se à qualidade da banda, não ao tipo de sinal físico (WiFi/Dados).
                </p>
            </div>
        </div>
      )}
    </div>
  );
}
