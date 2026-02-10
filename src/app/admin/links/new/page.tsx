'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { Loader2, Link as LinkIcon, Save, Copy, Check, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const formSchema = z.object({
  type: z.enum(['QUICK', 'IDENTIFIED', 'UNIDENTIFIED']),
  code: z.string().optional(),
  expiresAt: z.string().optional(),
  cpfCnpj: z.string().optional(),
  config: z.object({
    allowSpeedTest: z.boolean(),
    allowPing: z.boolean(),
    allowTraceroute: z.boolean(),
    allowVideo: z.boolean(),
    allowVoip: z.boolean(),
    allowWeb: z.boolean(),
  }),
});

type FormData = z.infer<typeof formSchema>;

export default function NewLinkPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [createdLink, setCreatedLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: 'QUICK',
      config: {
        allowSpeedTest: true,
        allowPing: true,
        allowTraceroute: true,
        allowVideo: true,
        allowVoip: true,
        allowWeb: true,
      }
    }
  });

  const selectedType = watch('type');

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setError('');
    setCreatedLink(null);
    try {
      const res = await fetch('/api/admin/links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || 'Erro ao criar link');
      }

      const linkUrl = `${window.location.origin}/t/${result.link.code}`;
      setCreatedLink(linkUrl);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (createdLink) {
      navigator.clipboard.writeText(createdLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-6">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin" className="text-gray-500 hover:text-gray-700">
          <ArrowLeft size={24} />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Gerar Novo Link de Teste</h1>
      </div>

      {createdLink && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
          <h3 className="text-green-800 font-semibold mb-2 flex items-center gap-2">
            <Check className="w-5 h-5" />
            Link Criado com Sucesso!
          </h3>
          <div className="flex gap-2">
            <input 
              readOnly 
              value={createdLink} 
              className="flex-1 p-2 border border-green-300 rounded bg-white text-gray-700"
            />
            <button 
              onClick={copyToClipboard}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-2"
            >
              {copied ? <Check size={18} /> : <Copy size={18} />}
              {copied ? 'Copiado' : 'Copiar'}
            </button>
          </div>
          <button 
            onClick={() => { setCreatedLink(null); setError(''); }}
            className="mt-4 text-sm text-green-700 hover:underline"
          >
            Gerar outro link
          </button>
        </div>
      )}

      {!createdLink && (
        <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
          
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg border border-red-100">
              {error}
            </div>
          )}

          {/* Tipo de Link */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Link</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <label className={`
                relative flex flex-col p-4 border rounded-lg cursor-pointer transition-all
                ${selectedType === 'IDENTIFIED' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}
              `}>
                <input type="radio" value="IDENTIFIED" className="sr-only" {...register('type')} />
                <span className="font-semibold text-gray-900">Identificado pelo Operador</span>
                <span className="text-sm text-gray-500 mt-1">O operador insere o CPF/CNPJ agora.</span>
              </label>

              <label className={`
                relative flex flex-col p-4 border rounded-lg cursor-pointer transition-all
                ${selectedType === 'QUICK' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}
              `}>
                <input type="radio" value="QUICK" className="sr-only" {...register('type')} />
                <span className="font-semibold text-gray-900">Identificado pelo Cliente</span>
                <span className="text-sm text-gray-500 mt-1">O cliente informa seus dados ao acessar.</span>
              </label>

              <label className={`
                relative flex flex-col p-4 border rounded-lg cursor-pointer transition-all
                ${selectedType === 'UNIDENTIFIED' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}
              `}>
                <input type="radio" value="UNIDENTIFIED" className="sr-only" {...register('type')} />
                <span className="font-semibold text-gray-900">Não Identificado</span>
                <span className="text-sm text-gray-500 mt-1">Gera um link anônimo sem identificação.</span>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Código Customizado */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Código Personalizado (Opcional)</label>
              <div className="relative">
                <LinkIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                <input 
                  {...register('code')}
                  type="text" 
                  placeholder="Ex: cliente-vip-01"
                  className="pl-10 w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Deixe em branco para gerar automaticamente.</p>
            </div>

            {/* Expiração */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Expiração (Opcional)</label>
              <input 
                {...register('expiresAt')}
                type="datetime-local"
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* CPF/CNPJ Condicional */}
          {selectedType === 'IDENTIFIED' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">CPF/CNPJ do Cliente</label>
              <input 
                {...register('cpfCnpj')}
                type="text" 
                placeholder="000.000.000-00"
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {errors.cpfCnpj && <p className="text-red-500 text-sm mt-1">{errors.cpfCnpj.message}</p>}
            </div>
          )}

          {/* Configurações de Teste */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Configurações do Teste</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <label className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                <input type="checkbox" {...register('config.allowSpeedTest')} className="h-5 w-5 text-blue-600 rounded" />
                <span className="text-gray-700">Velocidade (Speedtest)</span>
              </label>
              <label className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                <input type="checkbox" {...register('config.allowPing')} className="h-5 w-5 text-blue-600 rounded" />
                <span className="text-gray-700">Latência (Ping)</span>
              </label>
              <label className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                <input type="checkbox" {...register('config.allowTraceroute')} className="h-5 w-5 text-blue-600 rounded" />
                <span className="text-gray-700">Rota (Traceroute)</span>
              </label>
              <label className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                <input type="checkbox" {...register('config.allowVideo')} className="h-5 w-5 text-blue-600 rounded" />
                <span className="text-gray-700">Streaming de Vídeo</span>
              </label>
              <label className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                <input type="checkbox" {...register('config.allowVoip')} className="h-5 w-5 text-blue-600 rounded" />
                <span className="text-gray-700">VoIP</span>
              </label>
              <label className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                <input type="checkbox" {...register('config.allowWeb')} className="h-5 w-5 text-blue-600 rounded" />
                <span className="text-gray-700">Navegação Web</span>
              </label>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? <Loader2 className="animate-spin" /> : <Save size={20} />}
              {loading ? 'Gerando...' : 'Gerar Link'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
