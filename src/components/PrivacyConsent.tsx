import React, { useState, useEffect } from 'react';
import { Shield, MapPin, Video, Mic, Activity, ChevronDown, ChevronUp, Check, X } from 'lucide-react';

export interface ConsentOptions {
  essential: boolean; // IP, Network Performance (Always true if accepted)
  location: boolean; // Geolocation for ISP/Region verification
  media: boolean;    // Camera/Mic for WebRTC readiness check
}

interface PrivacyConsentProps {
  onAccept: (options: ConsentOptions) => void;
  onDeny: () => void;
}

export const PrivacyConsent: React.FC<PrivacyConsentProps> = ({ onAccept, onDeny }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [detailsOpen, setDetailsOpen] = useState(false);
  
  const [options, setOptions] = useState<ConsentOptions>({
    essential: true,
    location: false,
    media: false
  });

  const handleAcceptAll = () => {
    const all = { essential: true, location: true, media: true };
    setOptions(all);
    onAccept(all);
    setIsOpen(false);
  };

  const handleAcceptSelected = () => {
    onAccept(options);
    setIsOpen(false);
  };

  const handleDeny = () => {
    setIsOpen(false);
    onDeny();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 bg-slate-800/50 border-b border-slate-700 flex items-start gap-4">
          <div className="bg-blue-500/10 p-2 rounded-lg">
            <Shield className="text-blue-400" size={24} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Permissões de Diagnóstico</h2>
            <p className="text-sm text-slate-400 mt-1">
              Para realizar um diagnóstico completo da sua conexão e dispositivos, precisamos da sua permissão para acessar alguns recursos.
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto">
          
          <div className="space-y-4">
            {/* Essential */}
            <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-800/30 border border-slate-700/50">
              <div className="mt-0.5"><Activity size={18} className="text-green-400" /></div>
              <div className="flex-1">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-semibold text-slate-200">Dados Essenciais</h3>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 bg-slate-800 px-2 py-0.5 rounded">Obrigatório</span>
                </div>
                <p className="text-xs text-slate-400 mt-1">Endereço IP, latência, velocidade de download/upload e tipo de conexão.</p>
              </div>
            </div>

            {/* Location */}
            <label className="flex items-start gap-3 p-3 rounded-lg bg-slate-800/30 border border-slate-700/50 cursor-pointer hover:bg-slate-800/50 transition-colors">
              <div className="mt-0.5">
                <input 
                  type="checkbox" 
                  checked={options.location} 
                  onChange={(e) => setOptions({...options, location: e.target.checked})}
                  className="rounded border-slate-600 bg-slate-700 text-blue-500 focus:ring-blue-500/20"
                />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                   <MapPin size={18} className="text-purple-400" />
                   <h3 className="text-sm font-semibold text-slate-200">Localização Aproximada</h3>
                </div>
                <p className="text-xs text-slate-400 mt-1">Para identificar melhor seu provedor (ISP) e verificar servidores próximos.</p>
              </div>
            </label>

            {/* Media */}
            <label className="flex items-start gap-3 p-3 rounded-lg bg-slate-800/30 border border-slate-700/50 cursor-pointer hover:bg-slate-800/50 transition-colors">
              <div className="mt-0.5">
                <input 
                  type="checkbox" 
                  checked={options.media} 
                  onChange={(e) => setOptions({...options, media: e.target.checked})}
                  className="rounded border-slate-600 bg-slate-700 text-blue-500 focus:ring-blue-500/20"
                />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                   <div className="flex gap-1">
                     <Video size={18} className="text-orange-400" />
                     <Mic size={18} className="text-orange-400" />
                   </div>
                   <h3 className="text-sm font-semibold text-slate-200">Teste de Mídia (WebRTC)</h3>
                </div>
                <p className="text-xs text-slate-400 mt-1">Verifica se câmera e microfone estão acessíveis para videochamadas (não grava nada).</p>
              </div>
            </label>
          </div>

          <button 
            onClick={() => setDetailsOpen(!detailsOpen)}
            className="flex items-center gap-2 text-xs text-slate-500 hover:text-slate-300 mt-4 mx-auto"
          >
            {detailsOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            {detailsOpen ? 'Ocultar detalhes legais' : 'Ver detalhes de privacidade e conformidade'}
          </button>

          {detailsOpen && (
            <div className="mt-3 text-[10px] text-slate-500 bg-slate-950/30 p-3 rounded border border-slate-800 leading-relaxed">
              <p className="mb-2"><strong className="text-slate-400">Privacidade e GDPR/LGPD:</strong></p>
              <ul className="list-disc pl-4 space-y-1">
                <li>Os dados são coletados apenas para fins de diagnóstico técnico momentâneo.</li>
                <li>Nenhuma imagem ou áudio é gravado ou enviado ao servidor; apenas verificamos se os dispositivos respondem.</li>
                <li>A localização é usada apenas para sugerir servidores de teste otimizados.</li>
                <li>Você pode revogar estas permissões nas configurações do seu navegador a qualquer momento.</li>
              </ul>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-800/50 border-t border-slate-700 flex flex-col sm:flex-row gap-3 justify-end">
           <button 
             onClick={handleDeny}
             className="px-4 py-2 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
           >
             Recusar Tudo
           </button>
           <div className="flex gap-2 w-full sm:w-auto">
             <button 
               onClick={handleAcceptSelected}
               className="flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-medium bg-slate-700 text-white hover:bg-slate-600 transition-colors border border-slate-600"
             >
               Confirmar Seleção
             </button>
             <button 
               onClick={handleAcceptAll}
               className="flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-900/20 transition-colors flex items-center justify-center gap-2"
             >
               <Check size={16} /> Aceitar Tudo
             </button>
           </div>
        </div>

      </div>
    </div>
  );
};
