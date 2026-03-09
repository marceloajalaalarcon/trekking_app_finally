'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { ShieldAlert, UserPlus, Users, Activity, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function DeveloperPage() {
    const { user, getAccessToken, logout } = useAuth();
    const router = useRouter();

    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [successMsg, setSuccessMsg] = useState('');

    // States do Form
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('TREKKING_CREATOR');

    useEffect(() => {
        if (user && user.role !== 'DEVELOPER') {
            router.push('/');
        } else if (user) {
            fetchUsers();
        }
    }, [user, router]);

    const fetchUsers = async () => {
        try {
            const res = await fetch('http://localhost:3333/users', {
                headers: { Authorization: `Bearer ${getAccessToken()}` }
            });
            if (res.ok) {
                setUsers(await res.json());
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setSuccessMsg('');

        try {
            const res = await fetch('http://localhost:3333/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${getAccessToken()}`
                },
                body: JSON.stringify({ name, email, password_hash: password, role })
            });

            if (res.ok) {
                setSuccessMsg('Organizador adicionado ao Ecossistema!');
                setName(''); setEmail(''); setPassword('');
                fetchUsers();
            } else {
                alert('Erro ao criar usuário');
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Deletar essa conta permanentemente?')) return;
        try {
            await fetch(`http://localhost:3333/users/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${getAccessToken()}` }
            });
            fetchUsers();
        } catch (err) {
            console.error(err);
        }
    };

    if (!user || user.role !== 'DEVELOPER') return null;

    return (
        <div className="min-h-screen bg-[#040605] py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto space-y-8">

                {/* Header */}
                <header className="flex bg-[#0A0C0B] border border-[#1C2220] rounded-3xl p-6 items-center justify-between shadow-2xl">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center justify-center">
                            <ShieldAlert className="text-rose-500" size={24} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-white tracking-tight">Painel Master</h1>
                            <p className="text-sm font-bold text-slate-500">Acesso Restrito ao <span className="text-rose-400">Desenvolvedor do Ecosistema</span></p>
                        </div>
                    </div>
                    <button onClick={logout} className="px-5 py-2.5 bg-[#121615] hover:bg-[#1A201E] border border-[#1C2220] rounded-xl font-bold text-slate-300 transition-colors">
                        Desconectar
                    </button>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                    {/* Formulário de Criação */}
                    <div className="md:col-span-1 space-y-4">
                        <div className="bg-[#0A0C0B] border border-[#1C2220] rounded-3xl p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <UserPlus className="text-emerald-500" size={20} />
                                <h2 className="text-lg font-bold text-white">Novo Organizador</h2>
                            </div>

                            {successMsg && (
                                <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-3 text-emerald-400 text-sm font-bold">
                                    <CheckCircle2 size={16} /> {successMsg}
                                </div>
                            )}

                            <form onSubmit={handleCreateUser} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Nome da Agência</label>
                                    <input required value={name} onChange={e => setName(e.target.value)} type="text" className="w-full bg-[#121615] border border-[#1C2220] rounded-xl px-4 py-3 text-white outline-none focus:border-emerald-500 transition-colors" placeholder="Agência Tracking XYZ" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Email de Login</label>
                                    <input required value={email} onChange={e => setEmail(e.target.value)} type="email" className="w-full bg-[#121615] border border-[#1C2220] rounded-xl px-4 py-3 text-white outline-none focus:border-emerald-500 transition-colors" placeholder="login@agencia.com" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Senha Inicial</label>
                                    <input required value={password} onChange={e => setPassword(e.target.value)} type="password" className="w-full bg-[#121615] border border-[#1C2220] rounded-xl px-4 py-3 text-white outline-none focus:border-emerald-500 transition-colors" placeholder="••••••••" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Poder / Licença</label>
                                    <select value={role} onChange={e => setRole(e.target.value)} className="w-full bg-[#121615] border border-[#1C2220] rounded-xl px-4 py-3 text-white outline-none focus:border-emerald-500 transition-colors appearance-none font-bold">
                                        <option value="TREKKING_CREATOR">Criador de Trekking</option>
                                        <option value="STANDARD_CREATOR">Criador Padrão</option>
                                    </select>
                                </div>

                                <button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-400 text-[#040605] py-3.5 rounded-xl font-black mt-2 transition-colors">
                                    Cadastrar Cliente
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Lista de Contas */}
                    <div className="md:col-span-2">
                        <div className="bg-[#0A0C0B] border border-[#1C2220] rounded-3xl p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <Users className="text-blue-500" size={20} />
                                    <h2 className="text-lg font-bold text-white">Ecossistema Ativo ({users.length})</h2>
                                </div>
                            </div>

                            {loading ? (
                                <div className="text-center text-slate-500 py-10 font-bold">Carregando carteira de clientes...</div>
                            ) : (
                                <div className="space-y-3">
                                    {users.map(u => (
                                        <div key={u.id} className="bg-[#121615] border border-[#1C2220] p-4 rounded-2xl flex items-center justify-between hover:border-slate-700 transition-colors">
                                            <div>
                                                <div className="flex items-center gap-3 mb-1">
                                                    <h3 className="font-bold text-white text-lg">{u.name}</h3>
                                                    {u.role === 'DEVELOPER' && (
                                                        <span className="px-2 py-0.5 bg-rose-500/10 text-rose-500 border border-rose-500/20 text-[10px] font-black uppercase rounded">ROOT</span>
                                                    )}
                                                    {u.role !== 'DEVELOPER' && (
                                                        <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-black uppercase rounded">{u.role}</span>
                                                    )}
                                                </div>
                                                <p className="text-sm font-mono text-slate-500">{u.email}</p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="text-xs font-bold text-slate-600">Desde {new Date(u.created_at).toLocaleDateString()}</span>
                                                {u.role !== 'DEVELOPER' && (
                                                    <button onClick={() => handleDelete(u.id)} className="text-rose-500 hover:text-rose-400 text-xs font-bold px-3 py-1.5 bg-rose-500/5 hover:bg-rose-500/10 rounded-lg transition-colors">
                                                        Revogar
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
