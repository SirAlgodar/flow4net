
'use client';

import { useState, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart, 
  Pie, 
  Cell
} from 'recharts';
import { 
  Loader2, 
  Download, 
  Calendar, 
  Share2, 
  Activity, 
  Users, 
  CheckCircle,
  Clock
} from 'lucide-react';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export default function ReportsPanel() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState('30days');

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/reports?range=${range}`);
      const json = await res.json();
      setData(json);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [range]);

  const exportCSV = () => {
    if (!data || !data.chartData) return;
    
    const headers = ['Data', 'Testes Realizados'];
    const rows = data.chartData.map((item: any) => [item.date, item.count]);
    
    const csvContent = "data:text/csv;charset=utf-8," 
        + headers.join(",") + "\n" 
        + rows.map((e: any[]) => e.join(",")).join("\n");
        
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `relatorio_testes_${range}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
        <div className="flex h-96 items-center justify-center">
            <Loader2 className="animate-spin h-10 w-10 text-blue-600" />
        </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
            <h1 className="text-2xl font-bold text-gray-900">Relatórios & Analytics</h1>
            <p className="text-gray-500">Visão geral do desempenho do sistema</p>
        </div>
        
        <div className="flex gap-2">
            <select 
                value={range}
                onChange={(e) => setRange(e.target.value)}
                className="border rounded-lg px-3 py-2 bg-white text-sm"
            >
                <option value="7days">Últimos 7 dias</option>
                <option value="30days">Últimos 30 dias</option>
                <option value="90days">Últimos 3 meses</option>
            </select>
            
            <button 
                onClick={exportCSV}
                className="flex items-center gap-2 px-4 py-2 bg-white border rounded-lg hover:bg-gray-50 text-gray-700 text-sm font-medium"
            >
                <Download size={16} /> Exportar CSV
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
                <Share2 size={16} /> Compartilhar
            </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-sm font-medium text-gray-500">Total de Testes</p>
                    <h3 className="text-3xl font-bold text-gray-900 mt-2">{data?.summary.totalTests}</h3>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
                    <Activity size={24} />
                </div>
            </div>
            <span className="text-xs text-green-600 font-medium mt-4 block">+12% vs mês anterior</span>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-sm font-medium text-gray-500">Resultados Coletados</p>
                    <h3 className="text-3xl font-bold text-gray-900 mt-2">{data?.summary.totalResults}</h3>
                </div>
                <div className="p-3 bg-green-50 rounded-lg text-green-600">
                    <CheckCircle size={24} />
                </div>
            </div>
            <span className="text-xs text-green-600 font-medium mt-4 block">+5% vs mês anterior</span>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-sm font-medium text-gray-500">Testes Ativos</p>
                    <h3 className="text-3xl font-bold text-gray-900 mt-2">{data?.summary.activeTests}</h3>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg text-purple-600">
                    <Clock size={24} />
                </div>
            </div>
            <span className="text-xs text-gray-500 font-medium mt-4 block">Em tempo real</span>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-sm font-medium text-gray-500">Taxa de Conclusão</p>
                    <h3 className="text-3xl font-bold text-gray-900 mt-2">{data?.summary.completionRate}%</h3>
                </div>
                <div className="p-3 bg-orange-50 rounded-lg text-orange-600">
                    <Users size={24} />
                </div>
            </div>
            <span className="text-xs text-red-600 font-medium mt-4 block">-2% vs mês anterior</span>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activity Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Volume de Testes Diários</h3>
            <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data?.chartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="date" tick={{fontSize: 12}} />
                        <YAxis tick={{fontSize: 12}} />
                        <Tooltip />
                        <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Testes" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>

        {/* Distribution Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Distribuição por Tipo</h3>
            <div className="h-80 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data?.byType}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            fill="#8884d8"
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {data?.byType.map((entry: any, index: number) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip />
                        <Legend verticalAlign="bottom" height={36}/>
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
      </div>
    </div>
  );
}
