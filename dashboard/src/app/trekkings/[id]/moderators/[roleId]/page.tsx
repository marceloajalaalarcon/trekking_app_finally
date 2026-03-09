'use client';

import Link from 'next/link';
import { ArrowLeft, UserCheck, ShieldAlert, Plus, Save, Check, Trash2, Mail, Users } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '../../../../../contexts/AuthContext';

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
    const router = useRouter();
    const eventId = params.id as string;
    const roleId = params.roleId as string;
    const { authFetch } = useAuth();

    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(true);
    const [roleName, setRoleName] = useState('Nova Função');
    const [members, setMembers] = useState<Member[]>([]);

    const [isInviting, setIsInviting] = useState(false);
    const [inviteEmail, setInviteEmail] = useState('');
    const [invitePassword, setInvitePassword] = useState('');
    const [submittingInvite, setSubmittingInvite] = useState(false);

    // Interactive Bitmask State
    const [permissions, setPermissions] = useState({
        manageAttendance: false,
        manageExtraActivities: false,
        manageCertificates: false,
        manageIdealTimes: false,
        admin: false
    });

    const PERMISSION_VALUES = {
        manageAttendance: { label: 'Bipar Ingresso do Evento (Presenças/Faltas)', value: 1 },
        manageExtraActivities: { label: 'Moderar Atividades Extras (Falta/Conclusão)', value: 2 },
        manageCertificates: { label: 'Gerar e Emitir Certificados', value: 4 },
        manageIdealTimes: { label: 'Gerenciar Tempos Ideais de PCs', value: 8 },
        admin: { label: 'Administrador (Configurações Gerais)', value: 16 }
    };

    useEffect(() => {
        if (roleId === 'new') {
            setLoading(false);
            return;
        }

        const loadData = async () => {
            try {
                const [rolesRes, membersRes] = await Promise.all([
                    authFetch(`http://localhost:3333/trekkings/${eventId}/roles`),
                    authFetch(`http://localhost:3333/trekkings/${eventId}/members`)
                ]);

                const rolesData = await rolesRes.json();
                const membersData = await membersRes.json();

                const role = rolesData.find((r: any) => r.id === roleId);
                if (role) {
                    setRoleName(role.name);
                    const perms = role.permissions;
                    setPermissions({
                        manageAttendance: (perms & 1) !== 0,
                        manageExtraActivities: (perms & 2) !== 0,
                        manageCertificates: (perms & 4) !== 0,
                        manageIdealTimes: (perms & 8) !== 0,
                        admin: (perms & 16) !== 0,
                    });
                }

                // Ensure membersData is an array before filtering (backend might return error object if endpoint missing)
                if (Array.isArray(membersData)) {
                    setMembers(membersData.filter((m: Member) => m.role_id === roleId));
                } else {
                    console.warn('membersData is not an array:', membersData);
                    setMembers([]);
                }
            } catch (error) {
                console.error('Failed to load role and members', error);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [eventId, roleId, authFetch]);

    const currentBitmask = Object.entries(permissions).reduce((sum, [key, isChecked]) => {
        return isChecked ? sum + PERMISSION_VALUES[key as keyof typeof PERMISSION_VALUES].value : sum;
    }, 0);

    const handleSaveRole = async () => {
        setSaving(true);
        try {
            if (roleId === 'new') {
                await authFetch(`http://localhost:3333/trekkings/${eventId}/roles`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name: roleName, permissions: currentBitmask })
                });
            } else {
                await authFetch(`http://localhost:3333/trekkings/${eventId}/roles/${roleId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name: roleName, permissions: currentBitmask })
                });
            }
            router.push(`/trekkings/${eventId}/settings`);
        } catch (err) {
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteRole = async () => {
        if (!confirm('Tem certeza que deseja deletar esta função?')) return;
        try {
            await authFetch(`http://localhost:3333/trekkings/${eventId}/roles/${roleId}`, {
                method: 'DELETE'
            });
            router.push(`/trekkings/${eventId}/settings`);
        } catch (err) {
            console.error(err);
        }
    };

    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inviteEmail || !invitePassword) {
            alert('Preencha o e-mail e uma senha/PIN');
            return;
        }

        setSubmittingInvite(true);
        try {
            const res = await authFetch(`http://localhost:3333/trekkings/${eventId}/members`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: inviteEmail, password: invitePassword, role_id: roleId })
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.message || 'Erro ao convidar moderador. O e-mail está correto?');
            }

            const newMember = await res.json();
            setMembers([...members, newMember]);
            setInviteEmail('');
            setInvitePassword('');
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

    if (loading) return <div className="p-8 text-center text-slate-400">Carregando Função...</div>;

    const isNew = roleId === 'new';

    return (
        <div className="space-y-6 fade-in max-w-[1400px] mx-auto pb-6">
            <div className="flex items-center gap-3 mb-2">
                <Link href={`/trekkings/${eventId}/settings`} className="w-8 h-8 rounded-full bg-[#121615] border border-[#1C2220] flex items-center justify-center text-slate-400 hover:text-white transition-colors">
                    <ArrowLeft size={16} />
                </Link>
                <span className="text-slate-500 font-medium text-sm">/ Settings /</span>
                <span className="text-white font-medium text-sm">Moderadores & Staff</span>
            </div>

            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-[#1C2220]">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Controle de Acesso & Staff</h1>
                    <p className="text-slate-400 mt-1 text-sm font-medium">Configurando restrições de operação para a equipe.</p>
                </div>
                {!isNew && (
                    <button onClick={handleDeleteRole} className="flex items-center gap-2 px-5 py-2.5 bg-rose-500/10 text-rose-500 border border-rose-500/20 font-bold rounded-xl hover:bg-rose-500 hover:text-white transition-all">
                        <Trash2 size={18} />
                        Deletar Função
                    </button>
                )}
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">

                {/* Configuration Panel */}
                <div className="bg-[#121615] rounded-3xl shadow-lg border border-[#1C2220] p-6 lg:p-8 self-start">
                    <h3 className="text-xl font-bold text-white mb-6">Definições da Função</h3>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-slate-300 mb-2">Nome da Função Exibida</label>
                            <input
                                type="text"
                                value={roleName}
                                onChange={(e) => setRoleName(e.target.value)}
                                className="w-full px-4 py-3 bg-[#0A0C0B] border border-[#1C2220] rounded-xl text-white focus:border-emerald-500 transition-colors outline-none"
                            />
                        </div>

                        <div className="bg-[#0A0C0B] p-5 rounded-2xl border border-[#1C2220]">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h4 className="font-bold text-white mb-1">Regras de Bitmask Offline</h4>
                                    <p className="text-xs text-slate-400">Selecione as permissões de sincronização permitidas para estes aparelhos.</p>
                                </div>
                                <div className="bg-[#1A201E] px-3 py-1.5 rounded-lg border border-[#1C2220] text-center">
                                    <p className="text-[10px] text-slate-500 font-bold tracking-wider mb-0.5">BITMASK</p>
                                    <p className="text-emerald-400 font-mono font-bold text-lg leading-none">{currentBitmask}</p>
                                </div>
                            </div>

                            <div className="space-y-2 mt-6">
                                {Object.entries(PERMISSION_VALUES).map(([key, item]) => (
                                    <label key={key} className="flex items-center justify-between p-3 rounded-xl border border-[#1C2220] hover:border-emerald-500/30 cursor-pointer transition-colors group">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${permissions[key as keyof typeof permissions] ? 'bg-emerald-500 border-emerald-500 text-[#0A0C0B]' : 'bg-[#121615] border-[#1C2220] text-transparent'}`}>
                                                <Check size={12} strokeWidth={3} />
                                            </div>
                                            <span className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors">{item.label}</span>
                                        </div>
                                        <span className="text-xs font-mono text-emerald-400/50 bg-emerald-400/10 px-2 py-0.5 rounded">+{item.value}</span>
                                        <input
                                            type="checkbox"
                                            className="hidden"
                                            checked={permissions[key as keyof typeof permissions]}
                                            onChange={(e) => setPermissions({ ...permissions, [key]: e.target.checked })}
                                        />
                                    </label>
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={handleSaveRole}
                            disabled={saving}
                            className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold transition-all disabled:opacity-50 ${isNew ? 'bg-[#4F46E5] text-white hover:bg-[#4338CA] shadow-[0_0_20px_rgba(79,70,229,0.3)]' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500 hover:text-[#0A0C0B]'}`}
                        >
                            {saving ? (
                                <><div className="animate-spin w-4 h-4 border-2 border-emerald-500 border-t-[#0A0C0B] rounded-full" /> Salvando...</>
                            ) : (
                                <><Save size={18} /> {isNew ? 'Salvar Configuração e Criar Função' : 'Atualizar Dados da Função'}</>
                            )}
                        </button>
                    </div>
                </div>

                {/* Team Members Panel */}
                {!isNew && (
                    <div className="space-y-6">

                        {/* Add Member Form */}
                        {isInviting && (
                            <form onSubmit={handleInvite} className="bg-[#121615] rounded-3xl shadow-lg border border-[#4F46E5]/30 p-6 lg:p-8">
                                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                    <Mail size={20} className="text-[#A5B4FC]" />
                                    Convidar Moderador para "{roleName}"
                                </h3>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-300 mb-2">E-mail do Staff</label>
                                        <input
                                            type="email"
                                            required
                                            value={inviteEmail}
                                            onChange={(e) => setInviteEmail(e.target.value)}
                                            placeholder="Ex: joao@equipe.com"
                                            className="w-full px-4 py-3 bg-[#0A0C0B] border border-[#1C2220] rounded-xl text-white focus:border-[#4F46E5] transition-colors outline-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-slate-300 mb-2 mt-4">Senha de Acesso (Staff Portal)</label>
                                        <input
                                            type="text"
                                            required
                                            value={invitePassword}
                                            onChange={(e) => setInvitePassword(e.target.value)}
                                            placeholder="Ex: 123456 ou CPF"
                                            className="w-full px-4 py-3 bg-[#0A0C0B] border border-[#1C2220] rounded-xl text-white focus:border-[#4F46E5] transition-colors outline-none"
                                        />
                                        <p className="text-xs text-slate-500 mt-2">Se o usuário já existir, a senha dele será atualizada para esta.</p>
                                    </div>

                                    <div className="flex gap-3 mt-4">
                                        <button
                                            type="button"
                                            onClick={() => setIsInviting(false)}
                                            className="flex-1 py-4 bg-[#1A201E] text-slate-300 border border-[#1C2220] rounded-xl font-bold hover:bg-[#0A0C0B] transition-colors"
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={submittingInvite}
                                            className="flex-[2] flex items-center justify-center gap-2 py-4 bg-[#4F46E5] text-white rounded-xl font-bold hover:bg-[#4338CA] transition-all disabled:opacity-50"
                                        >
                                            {submittingInvite ? 'Adicionando...' : 'Adicionar Staff'}
                                        </button>
                                    </div>
                                </div>
                            </form>
                        )}

                        {/* Members List */}
                        <div className="bg-[#121615] rounded-3xl shadow-lg border border-[#1C2220] overflow-hidden">
                            <div className="p-6 border-b border-[#1C2220] flex justify-between items-center bg-[#151917]">
                                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                    <Users size={20} className="text-[#A5B4FC]" />
                                    Membros Ativos ({members.length})
                                </h2>
                                {!isInviting && (
                                    <button
                                        onClick={() => setIsInviting(true)}
                                        className="flex items-center gap-2 px-4 py-2 bg-[#4F46E5]/10 text-[#A5B4FC] font-bold rounded-lg border border-[#4F46E5]/20 hover:bg-[#4F46E5] hover:text-white transition-colors text-sm"
                                    >
                                        <Plus size={16} /> Convidar
                                    </button>
                                )}
                            </div>

                            {members.length === 0 ? (
                                <div className="p-12 text-center text-slate-500">
                                    <UserCheck size={48} className="mx-auto mb-4 opacity-50" />
                                    <p className="font-medium text-lg text-slate-300 mb-1">Essa função ainda não possui Staffs.</p>
                                    <p className="text-sm">Clique em "Convidar" para dar acesso a outros usuários.</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-slate-800/50">
                                    {members.map(member => (
                                        <div key={member.user_id} className="p-6 flex items-center justify-between hover:bg-[#151917]/50 transition-colors">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-slate-700 border border-[#1C2220] flex items-center justify-center font-bold text-white text-sm">
                                                    {member.name.substring(0, 2).toUpperCase()}
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-white text-sm">{member.name}</h3>
                                                    <p className="text-xs text-slate-500 font-medium">{member.email}</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleRemoveMember(member.user_id)}
                                                className="w-8 h-8 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-colors border border-rose-500/20"
                                                title="Remover Staff"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
