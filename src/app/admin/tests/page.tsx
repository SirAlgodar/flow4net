
'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { 
  Loader2, 
  Play, 
  Pause, 
  RefreshCw, 
  Eye, 
  Search,
  Filter
} from 'lucide-react';

interface TestLink {
  id: string;
  code: string;
  type: string;
  creator: string;
  createdAt: string;
  isActive: boolean;
  resultsCount: number;
  lastResultAt: string | null;
}

import { TestDetailsModal } from '@/components/admin/TestDetailsModal';

export default function TestsPanel() {
  const [tests, setTests] = useState<TestLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filterType, setFilterType] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [selectedTestId, setSelectedTestId] = useState<string | null>(null);

  const fetchTests = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        type: filterType,
        status: filterStatus
      });
      const res = await fetch(`/api/admin/tests?${params}`);
      const data = await res.json();
      if (data.data) {
        setTests(data.data);
        setTotalPages(data.meta.totalPages);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTests();
  }, [page, filterType, filterStatus]);

  const toggleStatus = async (id: string) => {
    try {
        await fetch('/api/admin/tests', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, action: 'TOGGLE_STATUS' })
        });
        fetchTests();
    } catch (e) {
        console.error(e);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Gerenciamento de Testes</h1>
        <button 
          onClick={fetchTests} 
          className="p-2 bg-gray-100 rounded hover:bg-gray-200"
        >
          <RefreshCw size={20} />
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border flex gap-4 flex-wrap">
        <div className="flex items-center gap-2">
            <Filter size={18} className="text-gray-500" />
            <span className="text-sm font-medium">Filtros:</span>
        </div>
        <select 
            value={filterType} 
            onChange={(e) => setFilterType(e.target.value)}
            className="border rounded p-2 text-sm"
        >
            <option value="ALL">Todos os Tipos</option>
            <option value="QUICK">Rápido</option>
            <option value="IDENTIFIED">Identificado</option>
            <option value="UNIDENTIFIED">Não Identificado</option>
        </select>
        <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border rounded p-2 text-sm"
        >
            <option value="ALL">Todos os Status</option>
            <option value="ACTIVE">Ativos</option>
            <option value="INACTIVE">Pausados</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th className="px-6 py-3">Código</th>
                <th className="px-6 py-3">Tipo</th>
                <th className="px-6 py-3">Criado Por</th>
                <th className="px-6 py-3">Data Criação</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Execuções</th>
                <th className="px-6 py-3">Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-8">
                    <Loader2 className="animate-spin mx-auto h-8 w-8 text-blue-500" />
                  </td>
                </tr>
              ) : tests.length === 0 ? (
                <tr>
                    <td colSpan={7} className="text-center py-8">Nenhum teste encontrado.</td>
                </tr>
              ) : (
                tests.map((test) => (
                  <tr key={test.id} className="bg-white border-b hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">
                        <a href={`/t/${test.code}`} target="_blank" className="text-blue-600 hover:underline">
                            {test.code}
                        </a>
                    </td>
                    <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold
                            ${test.type === 'QUICK' ? 'bg-blue-100 text-blue-800' : 
                              test.type === 'IDENTIFIED' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}
                        `}>
                            {test.type}
                        </span>
                    </td>
                    <td className="px-6 py-4">{test.creator}</td>
                    <td className="px-6 py-4">{format(new Date(test.createdAt), 'dd/MM/yyyy HH:mm')}</td>
                    <td className="px-6 py-4">
                        {test.isActive ? (
                            <span className="text-green-600 flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-green-600"></span> Ativo
                            </span>
                        ) : (
                            <span className="text-red-600 flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-red-600"></span> Pausado
                            </span>
                        )}
                    </td>
                    <td className="px-6 py-4">
                        {test.resultsCount} 
                        {test.lastResultAt && <span className="text-xs text-gray-400 block">Último: {format(new Date(test.lastResultAt), 'dd/MM')}</span>}
                    </td>
                    <td className="px-6 py-4 flex gap-2">
                        <button 
                            onClick={() => toggleStatus(test.id)}
                            className={`p-1 rounded hover:bg-gray-200 ${test.isActive ? 'text-amber-600' : 'text-green-600'}`}
                            title={test.isActive ? "Pausar" : "Retomar"}
                        >
                            {test.isActive ? <Pause size={18} /> : <Play size={18} />}
                        </button>
                        <button 
                            onClick={() => setSelectedTestId(test.id)}
                            className="p-1 text-blue-600 rounded hover:bg-gray-200" 
                            title="Ver Detalhes"
                        >
                            <Eye size={18} />
                        </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="p-4 flex justify-between items-center border-t">
            <button 
                disabled={page === 1} 
                onClick={() => setPage(p => p - 1)}
                className="px-3 py-1 border rounded disabled:opacity-50"
            >
                Anterior
            </button>
            <span className="text-sm text-gray-600">Página {page} de {totalPages}</span>
            <button 
                disabled={page === totalPages} 
                onClick={() => setPage(p => p + 1)}
                className="px-3 py-1 border rounded disabled:opacity-50"
            >
                Próxima
            </button>
        </div>
      </div>

      {selectedTestId && (
        <TestDetailsModal 
            testId={selectedTestId} 
            onClose={() => setSelectedTestId(null)} 
        />
      )}
    </div>
  );
}
