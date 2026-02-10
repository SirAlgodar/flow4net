
'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, Shield, User as UserIcon, X, Check, Loader2, Lock, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Types
interface User {
  id: string;
  name: string;
  email: string;
  username: string;
  role: 'ADMIN' | 'SUPERVISOR' | 'ATTENDANT';
  createdAt: string;
  failedLoginAttempts: number;
  lockoutUntil: string | null;
}

const userSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  email: z.string().email('Email inválido'),
  username: z.string().min(1, 'Username é obrigatório'),
  password: z.string().optional(),
  role: z.enum(['ADMIN', 'SUPERVISOR', 'ATTENDANT']),
}).refine(data => {
    // Password required for new users (we can't easily check "isNew" here in schema, 
    // so we'll handle this manually or just relax schema and check in submit)
    return true;
});

type UserFormData = z.infer<typeof userSchema>;

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Delete Confirmation
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
        role: 'ATTENDANT'
    }
  });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      if (res.ok) {
        setUsers(data);
      } else {
        console.error('Failed to fetch users:', data.error);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleOpenModal = (user?: User) => {
    setError('');
    if (user) {
      setEditingUser(user);
      setValue('name', user.name);
      setValue('email', user.email);
      setValue('username', user.username);
      setValue('role', user.role);
      setValue('password', ''); // Don't show password
    } else {
      setEditingUser(null);
      reset({
        name: '',
        email: '',
        username: '',
        password: '',
        role: 'ATTENDANT'
      });
    }
    setIsModalOpen(true);
  };

  const onSubmit = async (data: UserFormData) => {
    setSaving(true);
    setError('');

    try {
        // Validation for new user password
        if (!editingUser && (!data.password || data.password.length < 6)) {
            throw new Error('Senha é obrigatória para novos usuários (mínimo 6 caracteres)');
        }

        const url = editingUser 
            ? `/api/admin/users/${editingUser.id}` 
            : '/api/admin/users';
        
        const method = editingUser ? 'PUT' : 'POST';

        const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const result = await res.json();

        if (!res.ok) {
            throw new Error(result.error || 'Erro ao salvar usuário');
        }

        setIsModalOpen(false);
        fetchUsers();
    } catch (err: any) {
        setError(err.message);
    } finally {
        setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!userToDelete) return;
    
    try {
        const res = await fetch(`/api/admin/users/${userToDelete.id}`, {
            method: 'DELETE'
        });
        
        if (!res.ok) {
            const data = await res.json();
            alert(data.error || 'Erro ao excluir usuário');
        } else {
            fetchUsers();
        }
    } catch (error) {
        alert('Erro ao excluir usuário');
    } finally {
        setUserToDelete(null);
    }
  };

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Gerenciamento de Usuários</h1>
        <button
          onClick={() => handleOpenModal()}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Plus size={18} />
          Novo Usuário
        </button>
      </div>

      <div className="flex items-center gap-4 bg-card p-4 rounded-lg border border-border">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Buscar por nome, email ou usuário..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-md border border-gray-200 pl-10 pr-4 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-6 py-4 font-semibold text-gray-600">Usuário</th>
                <th className="px-6 py-4 font-semibold text-gray-600">Email</th>
                <th className="px-6 py-4 font-semibold text-gray-600">Função</th>
                <th className="px-6 py-4 font-semibold text-gray-600">Status</th>
                <th className="px-6 py-4 font-semibold text-gray-600">Criado em</th>
                <th className="px-6 py-4 text-right font-semibold text-gray-600">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                    <td colSpan={6} className="p-8 text-center text-gray-500">
                        <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                        Carregando usuários...
                    </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                    <td colSpan={6} className="p-8 text-center text-gray-500">
                        Nenhum usuário encontrado.
                    </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                          <UserIcon size={16} />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{user.name}</p>
                          <p className="text-xs text-gray-500">@{user.username}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{user.email}</td>
                    <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium
                            ${user.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 
                              user.role === 'SUPERVISOR' ? 'bg-blue-100 text-blue-700' : 
                              'bg-gray-100 text-gray-700'}`}>
                            <Shield size={12} />
                            {user.role}
                        </span>
                    </td>
                    <td className="px-6 py-4">
                        {user.lockoutUntil && new Date(user.lockoutUntil) > new Date() ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-700">
                                <Lock size={12} /> Bloqueado
                            </span>
                        ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700">
                                <Check size={12} /> Ativo
                            </span>
                        )}
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                        {format(new Date(user.createdAt), 'dd/MM/yyyy')}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                            onClick={() => handleOpenModal(user)}
                            className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            title="Editar"
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                            onClick={() => setUserToDelete(user)}
                            className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Excluir"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md bg-white rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between px-6 py-4 border-b">
                    <h2 className="text-lg font-semibold text-gray-900">
                        {editingUser ? 'Editar Usuário' : 'Novo Usuário'}
                    </h2>
                    <button 
                        onClick={() => setIsModalOpen(false)}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>
                
                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
                    {error && (
                        <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg flex items-center gap-2">
                            <AlertCircle size={16} />
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
                        <input
                            {...register('name')}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                            placeholder="Ex: João Silva"
                        />
                        {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                            {...register('email')}
                            type="email"
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                            placeholder="joao@exemplo.com"
                        />
                        {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Usuário (Login)</label>
                            <input
                                {...register('username')}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                                placeholder="joaosilva"
                            />
                            {errors.username && <p className="mt-1 text-xs text-red-500">{errors.username.message}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Função</label>
                            <select
                                {...register('role')}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                            >
                                <option value="ATTENDANT">Atendente</option>
                                <option value="SUPERVISOR">Supervisor</option>
                                <option value="ADMIN">Administrador</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            {editingUser ? 'Nova Senha (opcional)' : 'Senha'}
                        </label>
                        <input
                            {...register('password')}
                            type="password"
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                            placeholder={editingUser ? 'Deixe em branco para manter' : 'Mínimo 6 caracteres'}
                        />
                        {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
                    </div>

                    <div className="pt-4 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={() => setIsModalOpen(false)}
                            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
                        >
                            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                            {saving ? 'Salvando...' : 'Salvar Usuário'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
             <div className="w-full max-w-sm bg-white rounded-xl shadow-xl p-6 animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center gap-3 text-red-600 mb-4">
                    <div className="p-2 bg-red-100 rounded-full">
                        <Trash2 size={24} />
                    </div>
                    <h3 className="text-lg font-semibold">Excluir Usuário</h3>
                </div>
                <p className="text-gray-600 mb-6">
                    Tem certeza que deseja excluir o usuário <strong>{userToDelete.name}</strong>? 
                    Esta ação não pode ser desfeita.
                </p>
                <div className="flex justify-end gap-3">
                    <button
                        onClick={() => setUserToDelete(null)}
                        className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleDelete}
                        className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg"
                    >
                        Confirmar Exclusão
                    </button>
                </div>
             </div>
        </div>
      )}
    </div>
  );
}


