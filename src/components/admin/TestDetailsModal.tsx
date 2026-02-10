
'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { 
  X, 
  Download, 
  Share2, 
  Smartphone, 
  Monitor, 
  Wifi, 
  Activity,
  Calendar,
  User,
  Hash,
  FileText
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';

import { getIdentifierInfo } from '@/lib/identifier';

interface TestResult {
  id: string;
  createdAt: string;
  deviceType: string | null;
  os: string | null;
  browser: string | null;
  browserVersion: string | null;
  downloadAvg: number | null;
  uploadAvg: number | null;
  ping: number | null;
  packetLoss: number | null;
  jitter: number | null;
  provider: string | null;
  publicIp: string | null;
  userAgent: string | null;
  // New fields for detailed network info
  connectionType?: string | null;
  effectiveType?: string | null;
  rtt?: number | null;
  downlink?: number | null;
  signalStrength?: number | null;
  frequency?: number | null;
  // Hardware info
  ram?: string | null;
  cpuCores?: number | null;
  gpu?: string | null;
  // Advanced Network
  mtu?: number | null;
  mss?: number | null;
  localIp?: string | null;
  isIpv6?: boolean | null;
  // Identification
  cpfCnpj?: string | null;
  // Other
  ultraHdStatus?: boolean | null;
}

interface TestDetails {
  id: string;
  code: string;
  type: string;
  createdAt: string;
  isActive: boolean;
  creator: { name: string; email: string } | null;
  results: TestResult[];
  _count: { results: number };
  config: any;
}

interface TestDetailsModalProps {
  testId: string;
  onClose: () => void;
}

export function TestDetailsModal({ testId, onClose }: TestDetailsModalProps) {
  const [data, setData] = useState<TestDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedResultId, setExpandedResultId] = useState<string | null>(null);

  useEffect(() => {
    let retryCount = 0;
    const maxRetries = 3;

    const fetchDetails = async () => {
      try {
        setLoading(true);
        console.log(`Fetching test details for ID: ${testId} (Attempt ${retryCount + 1})`);
        
        const res = await fetch(`/api/admin/tests/${testId}`);
        if (!res.ok) {
            // If server error, maybe retry
            if (res.status >= 500 && retryCount < maxRetries) {
                retryCount++;
                console.warn(`Fetch failed, retrying... (${retryCount}/${maxRetries})`);
                setTimeout(fetchDetails, 1000 * retryCount); // Exponential backoff-ish
                return;
            }
            throw new Error('Falha ao carregar detalhes do teste');
        }
        
        const json = await res.json();
        if (json.error) throw new Error(json.error);
        
        console.log('Test details loaded:', json);
        setData(json);
      } catch (err: any) {
        console.error('Error in fetchDetails:', err);
        setError(err.message);
      } finally {
        if (retryCount === 0 || retryCount >= maxRetries) {
             setLoading(false);
        }
      }
    };

    if (testId) {
      fetchDetails();
    }
  }, [testId]);

  const exportData = (formatType: 'csv' | 'json') => {
    if (!data) return;

    if (formatType === 'json') {
        const jsonString = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `test-report-${data.code}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } else {
        // Extended CSV export for results
        const headers = [
            'Data', 
            'Download (Mbps)', 
            'Upload (Mbps)', 
            'Ping (ms)', 
            'Jitter (ms)', 
            'Perda (%)', 
            'Dispositivo', 
            'Navegador',
            'IP Publico',
            'IP Local',
            'MTU',
            'MSS',
            'IPv6',
            'RAM',
            'CPU',
            'GPU',
            'CPF/CNPJ',
            'Ultra HD'
        ];
        
        const rows = data.results.map(r => [
            format(new Date(r.createdAt), 'dd/MM/yyyy HH:mm:ss'),
            r.downloadAvg || 0,
            r.uploadAvg || 0,
            r.ping || 0,
            r.jitter || 0,
            r.packetLoss || 0,
            `${r.deviceType || ''} - ${r.os || ''}`,
            `${r.browser || ''} ${r.browserVersion || ''}`.trim(),
            r.publicIp || '',
            r.localIp || '',
            r.mtu || '',
            r.mss || '',
            r.isIpv6 ? 'Sim' : 'Não',
            r.ram || '',
            r.cpuCores || '',
            r.gpu || '',
            r.cpfCnpj || '',
            r.ultraHdStatus ? 'Sim' : 'Não'
        ]);
        
        const csvContent = "data:text/csv;charset=utf-8," 
            + headers.join(",") + "\n" 
            + rows.map(e => e.map(cell => `"${cell}"`).join(",")).join("\n");
            
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `test-report-${data.code}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
  };

  if (!testId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-5xl max-h-[90vh] rounded-xl shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b bg-gray-50">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <FileText size={20} className="text-blue-600" />
              Detalhes do Teste
            </h2>
            <div className="flex items-center gap-3 mt-1">
                <p className="text-sm text-gray-500">ID: {testId}</p>
                {data && (
                    <span className={`text-xs px-2 py-0.5 rounded border font-medium ${getIdentifierInfo(data.type).color}`}>
                        Preenchido por: {getIdentifierInfo(data.type).label}
                    </span>
                )}
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-gray-500 hover:bg-gray-200 rounded-full transition"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="text-gray-500">Carregando relatório detalhado...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-64 text-red-500 bg-red-50 rounded-lg p-8">
              <Activity size={48} className="mb-4 opacity-50" />
              <p className="text-lg font-medium">Erro ao carregar dados</p>
              <p className="text-sm mt-2">{error}</p>
              <button 
                onClick={onClose}
                className="mt-6 px-4 py-2 bg-white border border-red-200 text-red-600 rounded-lg hover:bg-red-50"
              >
                Fechar
              </button>
            </div>
          ) : data ? (
            <div className="space-y-8">
              
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                    <div className="text-blue-600 mb-2"><Hash size={20} /></div>
                    <p className="text-xs text-blue-600 font-semibold uppercase">Código</p>
                    <p className="text-xl font-bold text-gray-900">{data.code}</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                    <div className="text-purple-600 mb-2"><Calendar size={20} /></div>
                    <p className="text-xs text-purple-600 font-semibold uppercase">Criado em</p>
                    <p className="text-lg font-bold text-gray-900">{format(new Date(data.createdAt), 'dd/MM/yyyy')}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                    <div className="text-green-600 mb-2"><User size={20} /></div>
                    <p className="text-xs text-green-600 font-semibold uppercase">Criado Por</p>
                    <p className="text-lg font-bold text-gray-900 truncate" title={data.creator?.name}>{data.creator?.name || 'Sistema'}</p>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg border border-orange-100">
                    <div className="text-orange-600 mb-2"><Activity size={20} /></div>
                    <p className="text-xs text-orange-600 font-semibold uppercase">Execuções</p>
                    <p className="text-xl font-bold text-gray-900">{data._count.results}</p>
                </div>
              </div>

              {/* Performance Chart */}
              {data.results.length > 0 && (
                <div className="bg-white p-4 rounded-lg border shadow-sm">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Performance Recente (Download/Upload)</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={[...data.results].reverse()}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis 
                                    dataKey="createdAt" 
                                    tickFormatter={(val) => format(new Date(val), 'dd/MM HH:mm')} 
                                    tick={{fontSize: 10}}
                                />
                                <YAxis />
                                <Tooltip 
                                    labelFormatter={(val) => format(new Date(val), 'dd/MM/yyyy HH:mm')}
                                    formatter={(val: any) => [`${Number(val).toFixed(2)} Mbps`, 'Velocidade']}
                                />
                                <Line type="monotone" dataKey="downloadAvg" stroke="#2563eb" strokeWidth={2} name="Download" dot={false} />
                                <Line type="monotone" dataKey="uploadAvg" stroke="#16a34a" strokeWidth={2} name="Upload" dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
              )}

              {/* Results Table */}
              <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b bg-gray-50 flex justify-between items-center">
                    <h3 className="font-bold text-gray-800">Histórico de Execuções</h3>
                    <div className="text-sm text-gray-500">Últimos {data.results.length} resultados</div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
                            <tr>
                                <th className="px-6 py-3">Data</th>
                                <th className="px-6 py-3">Dispositivo</th>
                                <th className="px-6 py-3">Conexão</th>
                                <th className="px-6 py-3">Download</th>
                                <th className="px-6 py-3">Upload</th>
                                <th className="px-6 py-3">Ping</th>
                                <th className="px-6 py-3">Perda</th>
                                <th className="px-6 py-3 text-center">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.results.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                                        Nenhum teste realizado ainda.
                                    </td>
                                </tr>
                            ) : (
                                data.results.map((res) => (
                                    <>
                                        <tr key={res.id} className="bg-white border-b hover:bg-gray-50">
                                            <td className="px-6 py-4">{format(new Date(res.createdAt), 'dd/MM/yyyy HH:mm')}</td>
                                            <td className="px-6 py-4 flex items-center gap-2">
                                                {res.deviceType === 'mobile' ? <Smartphone size={16} /> : <Monitor size={16} />}
                                                <span className="truncate max-w-[150px]" title={res.userAgent || ''}>
                                                    {res.os} - {res.browser}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="flex items-center gap-1">
                                                    {res.connectionType === 'wifi' ? <Wifi size={14} className="text-blue-500"/> : <Activity size={14} className="text-green-500"/>}
                                                    <span className="uppercase text-xs font-semibold text-gray-600">{res.connectionType || 'N/A'}</span>
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 font-medium text-blue-600">
                                                {res.downloadAvg?.toFixed(1) || '-'} <span className="text-xs text-gray-400">Mbps</span>
                                            </td>
                                            <td className="px-6 py-4 font-medium text-green-600">
                                                {res.uploadAvg?.toFixed(1) || '-'} <span className="text-xs text-gray-400">Mbps</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                {res.ping?.toFixed(0) || '-'} <span className="text-xs text-gray-400">ms</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                {res.packetLoss ? (
                                                    <span className={res.packetLoss > 1 ? 'text-red-500' : 'text-green-500'}>
                                                        {res.packetLoss.toFixed(1)}%
                                                    </span>
                                                ) : '-'}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <button 
                                                    onClick={() => setExpandedResultId(expandedResultId === res.id ? null : res.id)}
                                                    className="text-blue-600 hover:text-blue-800 text-sm font-medium underline"
                                                >
                                                    {expandedResultId === res.id ? 'Ocultar' : 'Ver Detalhes'}
                                                </button>
                                            </td>
                                        </tr>
                                        {expandedResultId === res.id && (
                                            <tr className="bg-blue-50/50">
                                                <td colSpan={8} className="p-6">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                        <div className="space-y-4">
                                                            <h4 className="font-semibold text-gray-900 border-b pb-2 flex items-center gap-2">
                                                                <Wifi size={18} /> Detalhes da Conexão
                                                            </h4>
                                                            {/* Responsive grid: 1 col on mobile, 2 on sm+ */}
                                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                                                                <div>
                                                                    <p className="text-gray-500">Tipo de Rede</p>
                                                                    <p className="font-medium uppercase">{res.connectionType || 'Desconhecido'}</p>
                                                                </div>
                                                                <div>
                                                                    <p className="text-gray-500">Tipo Efetivo</p>
                                                                    <p className="font-medium uppercase">{res.effectiveType || 'N/A'}</p>
                                                                </div>
                                                                <div>
                                                                    <p className="text-gray-500">RTT (Latência)</p>
                                                                    <p className="font-medium">{res.rtt != null ? `${res.rtt} ms` : 'N/A'}</p>
                                                                </div>
                                                                <div>
                                                                    <p className="text-gray-500">Downlink Estimado</p>
                                                                    <p className="font-medium">{res.downlink != null ? `${res.downlink} Mbps` : 'N/A'}</p>
                                                                </div>
                                                                {res.connectionType === 'wifi' && (
                                                                    <>
                                                                        <div>
                                                                            <p className="text-gray-500">Frequência Estimada</p>
                                                                            <p className="font-medium">{res.frequency ? `${res.frequency} GHz` : 'N/A'}</p>
                                                                        </div>
                                                                        <div>
                                                                            <p className="text-gray-500">Sinal Estimado</p>
                                                                            <div className="flex items-center gap-2">
                                                                                <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                                                                                    <div 
                                                                                        className={`h-full ${
                                                                                            (res.signalStrength || 0) > 70 ? 'bg-green-500' : 
                                                                                            (res.signalStrength || 0) > 40 ? 'bg-yellow-500' : 'bg-red-500'
                                                                                        }`} 
                                                                                        style={{ width: `${res.signalStrength || 0}%` }}
                                                                                    />
                                                                                </div>
                                                                                <span className="font-medium">{res.signalStrength != null ? `${res.signalStrength}%` : 'N/A'}</span>
                                                                            </div>
                                                                        </div>
                                                                    </>
                                                                )}
                                                                <div className="col-span-1 sm:col-span-2 mt-2 pt-2 border-t border-gray-100">
                                                                    <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Avançado</p>
                                                                    <div className="grid grid-cols-2 gap-4">
                                                                        <div>
                                                                            <p className="text-gray-500">MTU / MSS</p>
                                                                            <p className="font-medium">{res.mtu || '-'} / {res.mss || '-'}</p>
                                                                        </div>
                                                                        <div>
                                                                            <p className="text-gray-500">IP Local</p>
                                                                            <p className="font-medium">{res.localIp || '-'}</p>
                                                                        </div>
                                                                        <div>
                                                                            <p className="text-gray-500">Protocolo</p>
                                                                            <p className="font-medium">{res.isIpv6 ? 'IPv6' : 'IPv4'}</p>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        
                                                        <div className="space-y-4">
                                                            <h4 className="font-semibold text-gray-900 border-b pb-2 flex items-center gap-2">
                                                                <Activity size={18} /> Qualidade e Métricas
                                                            </h4>
                                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                                                                <div>
                                                                    <p className="text-gray-500">Ping</p>
                                                                    <p className="font-medium">{res.ping} ms</p>
                                                                </div>
                                                                <div>
                                                                    <p className="text-gray-500">Jitter</p>
                                                                    <p className="font-medium">{res.jitter} ms</p>
                                                                </div>
                                                                <div>
                                                                    <p className="text-gray-500">IP Público</p>
                                                                    <p className="font-medium">{res.publicIp || '-'}</p>
                                                                </div>
                                                                <div>
                                                                    <p className="text-gray-500">Provedor</p>
                                                                    <p className="font-medium">{res.provider || '-'}</p>
                                                                </div>
                                                                <div>
                                                                    <p className="text-gray-500">Suporte 4K</p>
                                                                    <p className={`font-medium ${res.ultraHdStatus ? 'text-green-600' : 'text-gray-500'}`}>
                                                                        {res.ultraHdStatus ? 'Sim' : 'Não'}
                                                                    </p>
                                                                </div>
                                                            </div>

                                                            {/* Hardware Section */}
                                                            <div className="pt-4 border-t border-gray-100">
                                                                <h4 className="font-semibold text-gray-900 border-b pb-2 flex items-center gap-2 mb-3">
                                                                    <Monitor size={18} /> Hardware e Sistema
                                                                </h4>
                                                                <div className="grid grid-cols-2 gap-4 text-sm">
                                                                    <div>
                                                                        <p className="text-gray-500">CPU / Núcleos</p>
                                                                        <p className="font-medium">{res.cpuCores ? `${res.cpuCores} Cores` : '-'}</p>
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-gray-500">Memória RAM</p>
                                                                        <p className="font-medium">{res.ram || '-'}</p>
                                                                    </div>
                                                                    <div className="col-span-2">
                                                                        <p className="text-gray-500">GPU</p>
                                                                        <p className="font-medium truncate" title={res.gpu || ''}>{res.gpu || '-'}</p>
                                                                    </div>
                                                                    <div className="col-span-2">
                                                                        <p className="text-gray-500">Navegador</p>
                                                                        <p className="font-medium">{res.browser} {res.browserVersion}</p>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* Identification Section */}
                                                            {res.cpfCnpj && (
                                                                <div className="pt-4 border-t border-gray-100">
                                                                    <h4 className="font-semibold text-gray-900 border-b pb-2 flex items-center gap-2 mb-3">
                                                                        <User size={18} /> Identificação
                                                                    </h4>
                                                                    <div>
                                                                        <p className="text-gray-500">CPF / CNPJ</p>
                                                                        <p className="font-medium">{res.cpfCnpj}</p>
                                                                    </div>
                                                                </div>
                                                            )}

                                                            <div className="mt-4 p-3 bg-white rounded border border-gray-200">
                                                                <p className="text-xs text-gray-500 mb-1">User Agent</p>
                                                                <p className="text-xs font-mono break-all text-gray-700">{res.userAgent}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
              </div>

            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50 flex justify-end gap-3">
          <button 
            onClick={() => exportData('csv')}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center gap-2"
            disabled={!data || data.results.length === 0}
          >
            <Download size={16} /> Exportar CSV
          </button>
          <button 
            onClick={() => exportData('json')}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center gap-2"
            disabled={!data}
          >
            <FileText size={16} /> Exportar JSON
          </button>
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Concluído
          </button>
        </div>
      </div>
    </div>
  );
}
