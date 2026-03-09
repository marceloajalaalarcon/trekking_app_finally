'use client';

import Link from 'next/link';
import { ArrowLeft, UserCheck, ShieldAlert, Plus, Save, Trash2, Mail, Users, MapPin } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '../../../../../contexts/AuthContext';

interface Role {
    id: string;
    name: string;
    permissions: number;
}

interface Member {
    user_id: string;
    name: string;
    email: string;
    role_id: string;
    role_name: string;
    permissions: number;
}

export default function ModeratorsPage() {
    const params = useParams();
    const eventId = params.id as string;
    const { authFetch } = useAuth();

    const [loading, setLoading] = useState(true);
    const [roles, setRoles] = useState<Role[]>([]);
    const [members, setMembers] = useState<Member[]>([]);

    const [isInviting, setIsInviting] = useState(false);
    const [inviteEmail, setInviteEmail] = useState('');
    const [selectedRole, setSelectedRole] = useState('');
    const [submittingInvite, setSubmittingInvite] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [rolesRes, membersRes] = await Promise.all([
                    authFetch(`http://localhost:3333/trekkings/${eventId}/roles`),
                    authFetch(`http://localhost:3333/trekkings/${eventId}/members`)
                ]);
                const rolesData = await rolesRes.json();
                const membersData = await membersRes.json();

                setRoles(rolesData);
                setMembers(membersData);
                if (rolesData.length > 0) {
                    setSelectedRole(rolesData[0].id);
                }
            } catch (error) {
                console.error('Failed to load roles and members', error);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [eventId, authFetch]);

    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inviteEmail || !selectedRole) return;

        setSubmittingInvite(true);
        try {
            const res = await authFetch(`http://localhost:3333/trekkings/${eventId}/members`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: inviteEmail, role_id: selectedRole })
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.message || 'Erro ao convidar moderador. O e-mail está correto?');
            }

            const newMember = await res.json();
            setMembers([...members, newMember]);
            setInviteEmail('');
            setIsInviting(false);
            alert('Moderador adicionado com sucesso!');
        } catch (error: any) {
            console.error(error);
            alert(error.message);
        } finally {
            setSubmittingInvite(false);
        }
    };

    const handleRemoveMember = async (userId: string) => {
        if (!confirm('Tem certeza que deseja remover este membro da equipe?')) return;
        try {
            await authFetch(`http://localhost:3333/trekkings/${eventId}/members/${userId}`, {
                method: 'DELETE'
            });
            setMembers(members.filter(m => m.user_id !== userId));
        } catch (error) {
            console.error('Failed to remove member', error);
            alert('Falha ao remover membro');
        }
    };

    if (loading) return <div className="p-8 text-center text-slate-400">Carregando Staff...</div>;

    return (
        <div className="space-y-6 fade-in max-w-[1400px] mx-auto pb-6">
            <div className="flex items-center gap-3 mb-2">
                <Link href={`/trekkings/${eventId}/settings`} className="w-8 h-8 rounded-full bg-[#121615] border border-[#1C2220] flex items-center justify-center text-slate-400 hover:text-white transition-colors">
                    <ArrowLeft size={16} />
                </Link>
                <span className="text-slate-500 font-medium text-sm">/ Event / Settings /</span>
                <span className="text-white font-medium text-sm">Moderadores & Staff</span>
            </div>

            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-[#1C2220]">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Equipe de Staff</h1>
                    <p className="text-slate-400 mt-1 text-sm font-medium">Convide membros para a equipe e atribua as Funções (papéis) a eles.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsInviting(!isInviting)}
                        className="flex items-center gap-2 px-5 py-2.5 bg-[#4F46E5] text-white font-bold rounded-xl hover:bg-[#6366f1] shadow-[0_0_15px_rgba(79,70,229,0.3)] transition-all"
                    >
                        {isInviting ? 'Cancelar' : <><Plus size={18} /> Convidar Staff</>}
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">

                {/* Form column (shows when inviting) */}
                {isInviting && (
                    <div className="lg:col-span-1">
                        <form onSubmit={handleInvite} className="bg-[#121615] rounded-3xl shadow-lg border border-emerald-500/30 p-6">
                            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                <Mail size={20} className="text-emerald-400" />
                                Adicionar Novo Staff
                            </h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-300 mb-2">E-mail do Usuário</label>
                                    <input
                                        type="email"
                                        required
                                        value={inviteEmail}
                                        onChange={(e) => setInviteEmail(e.target.value)}
                                        placeholder="Ex: joao@email.com"
                                        className="w-full px-4 py-3 bg-[#0A0C0B] border border-[#1C2220] rounded-xl text-white focus:border-emerald-500 transition-colors outline-none"
                                    />
                                    <p className="text-xs text-slate-500 mt-2">O usuário já precisa ter uma conta no aplicativo de Tracking.</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-300 mb-2">Função Atribuída</label>
                                    {roles.length === 0 ? (
                                        <div className="text-sm text-yellow-500 bg-yellow-500/10 p-3 rounded-lg border border-yellow-500/20">
                                            Você precisa criar uma Função lá nas Configurações do Evento antes de convidar alguém.
                                        </div>
                                    ) : (
                                        <select
                                            value={selectedRole}
                                            onChange={(e) => setSelectedRole(e.target.value)}
                                            className="w-full px-4 py-3 bg-[#0A0C0B] border border-[#1C2220] rounded-xl text-white focus:border-emerald-500 transition-colors outline-none cursor-pointer"
                                        >
                                            {roles.map(r => (
                                                <option key={r.id} value={r.id}>{r.name} (Bitmask: {r.permissions})</option>
                                            ))}
                                        </select>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    disabled={submittingInvite || roles.length === 0}
                                    className="w-full flex items-center justify-center gap-2 py-4 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl font-bold hover:bg-emerald-500 hover:text-[#0A0C0B] transition-all disabled:opacity-50 mt-4"
                                >
                                    {submittingInvite ? 'Convidando...' : 'Adicionar ao Staff'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Staff List */}
                <div className={`bg-[#121615] rounded-3xl shadow-lg border border-[#1C2220] overflow-hidden ${isInviting ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
                    <div className="p-6 border-b border-[#1C2220] flex justify-between items-center bg-[#151917]">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <Users size={20} className="text-[#A5B4FC]" />
                            Membros Ativos ({members.length})
                        </h2>
                    </div>

                    {members.length === 0 ? (
                        <div className="p-12 text-center text-slate-500">
                            <UserCheck size={48} className="mx-auto mb-4 opacity-50" />
                            <p className="font-medium text-lg text-slate-300 mb-1">Nenhum staff adicionado.</p>
                            <p className="text-sm">Clique em "Convidar Staff" para dar acesso a outros usuários.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-800/50">
                            {members.map(member => (
                                <div key={member.user_id} className="p-6 flex items-center justify-between hover:bg-[#151917]/50 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-700 border-2 border-[#1C2220] flex items-center justify-center font-bold text-white">
                                            {member.name.substring(0, 2).toUpperCase()}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-white text-base">{member.name}</h3>
                                            <p className="text-xs text-slate-500 font-medium">{member.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <div className="text-right">
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#4F46E5]/10 text-[#A5B4FC] border border-[#4F46E5]/20 rounded-full w-max text-xs font-bold uppercase mb-1">
                                                <ShieldAlert size={12} /> {member.role_name}
                                            </span>
                                            <p className="text-[10px] text-slate-500">Permissão Code: {member.permissions}</p>
                                        </div>
                                        <button
                                            onClick={() => handleRemoveMember(member.user_id)}
                                            className="w-10 h-10 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-colors border border-rose-500/20"
                                            title="Remover Staff"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}
