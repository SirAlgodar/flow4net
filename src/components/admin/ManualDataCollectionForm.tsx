'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { TestResultSchema, type TestResultFormData, type TestResultFormInput } from '@/lib/schemas/test-result';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Save, AlertCircle, Loader2 } from 'lucide-react';

export function ManualDataCollectionForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const form = useForm<TestResultFormInput, any, TestResultFormData>({
    resolver: zodResolver(TestResultSchema),
    defaultValues: {
      isIpv6: false,
      ultraHdStatus: false,
    }
  });

  const { register, handleSubmit, formState: { errors }, reset } = form;

  const onSubmit = async (data: TestResultFormData) => {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      // Convert booleans to strings if necessary for API/DB
      const payload = {
        ...data,
        ultraHdStatus: data.ultraHdStatus === true ? "OK" : (data.ultraHdStatus === false ? "Dificuldades" : data.ultraHdStatus),
      };

      const response = await fetch('/api/results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error('Falha ao salvar os dados.');
      }
      
      const result = await response.json();
      console.log('Saved ID:', result.id);
      
      alert('Dados salvos com sucesso!');
      reset();
    } catch (error: any) {
      console.error('Erro ao salvar:', error);
      setSubmitError(error.message || 'Erro desconhecido ao salvar.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-2">Coleta Manual de Dados</h2>
      
      {submitError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-md flex items-center gap-2">
            <AlertCircle size={20} />
            <span>{submitError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        
        {/* Seção 1: Identificação */}
        <section>
          <h3 className="text-lg font-semibold text-gray-700 mb-4 bg-gray-50 p-2 rounded">Identificação</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">CPF / CNPJ</label>
              <input 
                {...register('identificador')} 
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                placeholder="000.000.000-00"
              />
              {errors.identificador && <p className="text-red-500 text-xs mt-1">{errors.identificador.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Solicitante</label>
              <input 
                {...register('solicitante')} 
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
              />
            </div>
          </div>
        </section>

        {/* Seção 2: Hardware e Sistema */}
        <section>
          <h3 className="text-lg font-semibold text-gray-700 mb-4 bg-gray-50 p-2 rounded">Hardware e Sistema</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Navegador</label>
              <input 
                {...register('navegador')} 
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
              />
              {errors.navegador && <p className="text-red-500 text-xs mt-1">{errors.navegador.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Versão do Navegador</label>
              <input 
                {...register('versao')} 
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">SO (Sistema Operacional)</label>
              <input 
                {...register('plataforma')} 
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
              />
               {errors.plataforma && <p className="text-red-500 text-xs mt-1">{errors.plataforma.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Processadores</label>
              <input 
                type="number"
                {...register('processadores')} 
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Memória</label>
              <input 
                {...register('memoria')} 
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">GPU</label>
              <input 
                {...register('gpu')} 
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
              />
            </div>
          </div>
        </section>

        {/* Seção 3: Rede Avançada */}
        <section>
          <h3 className="text-lg font-semibold text-gray-700 mb-4 bg-gray-50 p-2 rounded">Rede Avançada</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
             <div>
              <label className="block text-sm font-medium text-gray-700">Provedor</label>
              <input 
                {...register('provedor')} 
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
              />
              {errors.provedor && <p className="text-red-500 text-xs mt-1">{errors.provedor.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">IP Público</label>
              <input 
                {...register('ip')} 
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
              />
               {errors.ip && <p className="text-red-500 text-xs mt-1">{errors.ip.message}</p>}
            </div>
             <div>
              <label className="block text-sm font-medium text-gray-700">IP Local</label>
              <input 
                {...register('localIp')} 
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">MTU</label>
              <input 
                type="number"
                {...register('mtu')} 
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
              />
              {errors.mtu && <p className="text-red-500 text-xs mt-1">{errors.mtu.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">MSS</label>
              <input 
                type="number"
                {...register('mss')} 
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
              />
               {errors.mss && <p className="text-red-500 text-xs mt-1">{errors.mss.message}</p>}
            </div>
            <div className="flex items-center mt-6">
              <input 
                type="checkbox"
                {...register('isIpv6')} 
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-900">É IPv6?</label>
            </div>
          </div>
        </section>

        {/* Seção 4: Performance */}
        <section>
          <h3 className="text-lg font-semibold text-gray-700 mb-4 bg-gray-50 p-2 rounded">Performance</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Download (Mbps)</label>
              <input 
                type="number" step="0.01"
                {...register('downloadAvg')} 
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
              />
              {errors.downloadAvg && <p className="text-red-500 text-xs mt-1">{errors.downloadAvg.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Upload (Mbps)</label>
              <input 
                type="number" step="0.01"
                {...register('uploadAvg')} 
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
              />
              {errors.uploadAvg && <p className="text-red-500 text-xs mt-1">{errors.uploadAvg.message}</p>}
            </div>
             <div>
              <label className="block text-sm font-medium text-gray-700">Ping (ms)</label>
              <input 
                type="number" step="1"
                {...register('ping')} 
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
              />
               {errors.ping && <p className="text-red-500 text-xs mt-1">{errors.ping.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Jitter (ms)</label>
              <input 
                type="number" step="1"
                {...register('jitter')} 
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
              />
               {errors.jitter && <p className="text-red-500 text-xs mt-1">{errors.jitter.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Perda de Pacotes (%)</label>
              <input 
                type="number" step="0.1"
                {...register('packetLoss')} 
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
              />
               {errors.packetLoss && <p className="text-red-500 text-xs mt-1">{errors.packetLoss.message}</p>}
            </div>
            <div className="flex items-center mt-6">
              <input 
                type="checkbox"
                {...register('ultraHdStatus')} 
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-900">Suporta 4K/Ultra HD?</label>
            </div>
          </div>
        </section>

        <div className="flex justify-end pt-6 border-t">
            <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded focus:outline-none focus:shadow-outline transition disabled:opacity-50"
            >
                {isSubmitting ? (
                    <>
                        <Loader2 className="animate-spin" size={20} />
                        Salvando...
                    </>
                ) : (
                    <>
                        <Save size={20} />
                        Salvar Resultado
                    </>
                )}
            </button>
        </div>

      </form>
    </div>
  );
}
