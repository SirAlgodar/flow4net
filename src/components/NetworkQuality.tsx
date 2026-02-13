
'use client';

import { Activity, Signal, Zap, BarChart2 } from 'lucide-react';
import { NetworkMetrics, QoEResult } from '@/lib/quality-calculator';

interface NetworkQualityProps {
  metrics: NetworkMetrics;
  qoe: QoEResult;
  history?: QoEResult[];
}

export function NetworkQuality({ metrics, qoe, history = [] }: NetworkQualityProps) {
  return (
    <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700 backdrop-blur-sm max-w-md w-full mx-auto my-4">
      <div className="flex items-center gap-2 mb-4 border-b border-slate-700 pb-2">
        <Activity className="text-purple-400 w-5 h-5" />
        <h3 className="font-semibold text-slate-200">Qualidade da Experiência (QoE)</h3>
      </div>

      <div className="flex flex-col items-center mb-6">
        <div className="relative w-32 h-32 flex items-center justify-center">
          {/* Circular Gauge (Simplified with CSS/SVG) */}
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="64"
              cy="64"
              r="56"
              stroke="currentColor"
              strokeWidth="12"
              fill="transparent"
              className="text-slate-700"
            />
            <circle
              cx="64"
              cy="64"
              r="56"
              stroke="currentColor"
              strokeWidth="12"
              fill="transparent"
              strokeDasharray={351.86} // 2 * PI * 56
              strokeDashoffset={351.86 - (351.86 * qoe.score) / 100}
              className={`${qoe.color} transition-all duration-1000 ease-out`}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute flex flex-col items-center">
            <span className={`text-3xl font-bold ${qoe.color}`}>{qoe.score}%</span>
            <span className="text-xs text-slate-400 uppercase tracking-wider">{qoe.rating}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-slate-900/50 p-3 rounded border border-slate-700/50 flex flex-col">
            <span className="text-xs text-slate-500 mb-1 flex items-center gap-1">
                <Zap size={12}/> Latência & Jitter
            </span>
            <div className="flex justify-between items-end">
                <span className="text-white font-mono text-sm">{metrics.latency.toFixed(0)}ms</span>
                <span className={`text-xs ${qoe.breakdown.latencyScore > 80 ? 'text-green-400' : 'text-yellow-400'}`}>
                    {qoe.breakdown.latencyScore}/100
                </span>
            </div>
            <span className="text-[10px] text-slate-600">Jitter: {metrics.jitter.toFixed(1)}ms</span>
        </div>

        <div className="bg-slate-900/50 p-3 rounded border border-slate-700/50 flex flex-col">
            <span className="text-xs text-slate-500 mb-1 flex items-center gap-1">
                <BarChart2 size={12}/> Velocidade
            </span>
            <div className="flex justify-between items-end">
                <span className="text-white font-mono text-sm">{(metrics.downloadSpeed).toFixed(1)} Mbps</span>
                <span className={`text-xs ${qoe.breakdown.speedScore > 80 ? 'text-green-400' : 'text-yellow-400'}`}>
                    {qoe.breakdown.speedScore}/100
                </span>
            </div>
             <span className="text-[10px] text-slate-600">Up: {(metrics.uploadSpeed).toFixed(1)} Mbps</span>
        </div>
      </div>

      {metrics.rssi !== undefined && (
          <div className="bg-blue-900/20 p-3 rounded border border-blue-800/30 flex items-center justify-between mb-4">
             <div className="flex items-center gap-2">
                <Signal className="w-4 h-4 text-blue-400" />
                <span className="text-sm text-blue-100">Sinal WiFi</span>
             </div>
             <div className="flex flex-col items-end">
                 <span className={`font-mono font-bold ${(qoe.breakdown.signalScore || 0) > 60 ? 'text-green-400' : 'text-yellow-400'}`}>
                    {metrics.rssi} dBm
                 </span>
                 <span className="text-[10px] text-blue-300/70">
                    Qualidade: {qoe.breakdown.signalScore}%
                 </span>
             </div>
          </div>
      )}

      {history.length > 0 && (
        <div className="mt-4 pt-4 border-t border-slate-700">
             <h4 className="text-xs text-slate-500 mb-2 uppercase tracking-wide font-semibold">Histórico (30 min)</h4>
             <div className="flex items-end justify-between h-16 gap-1">
                {history.slice(-10).map((h, i) => (
                    <div key={i} className="flex flex-col items-center gap-1 flex-1">
                        <div 
                            className={`w-full rounded-t ${h.color.replace('text-', 'bg-')}/60 hover:bg-opacity-100 transition-all`}
                            style={{ height: `${h.score}%` }}
                            title={`${h.rating} (${h.score}%)`}
                        />
                    </div>
                ))}
             </div>
        </div>
      )}
    </div>
  );
}
