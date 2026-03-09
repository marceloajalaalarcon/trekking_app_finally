'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ShieldAlert, ArrowLeft, Check } from 'lucide-react';

const AVAILABLE_PERMISSIONS = [
    { id: 'MANAGE_EVENT', value: 1, label: 'Gerenciar Detalhes do Evento', desc: 'Pode alterar o nome do evento, intervalos de rastreamento e configurações gerais.' },
    { id: 'MANAGE_ROLES', value: 2, label: 'Gerenciar Funções', desc: 'Pode criar novos níveis de acesso e atribuí-los a outros membros da equipe.' },
    { id: 'VALIDATE_TICKETS', value: 4, label: 'Validar Ingressos', desc: 'Pode executar check-ins e validar a entrada de usuários na porta do evento.' },
    { id: 'READ_CHECKPOINTS', value: 8, label: 'Ler Checkpoints', desc: 'Pode visualizar dados ao vivo de jogadores escaneando checkpoints durante o evento.' },
    { id: 'ISSUE_CERTIFICATES', value: 16, label: 'Emitir Certificados', desc: 'Pode gerar e enviar certificados de conclusão por email aos usuários.' }
];

export default function RolesPage() {
    const [roleName, setRoleName] = useState('');
    const [selectedPerms, setSelectedPerms] = useState<number>(0);

    const handleToggle = (val: number) => {
        if ((selectedPerms & val) === val) {
            setSelectedPerms(selectedPerms & ~val);
        } else {
            setSelectedPerms(selectedPerms | val);
        }
    };

    return (
        <div className="space-y-6 fade-in max-w-[1400px] mx-auto pb-6">
            <div className="flex items-center gap-3 mb-2">
                <Link href="/trekkings/1" className="w-8 h-8 rounded-full bg-[#121615] border border-[#1C2220] flex items-center justify-center text-slate-400 hover:text-white transition-colors">
                    <ArrowLeft size={16} />
                </Link>
                <span className="text-slate-500 font-medium text-sm">/ Events / Tracking Iniciantes #05 /</span>
                <span className="text-white font-medium text-sm">Criar Função de Equipe</span>
            </div>

            <header className="flex justify-between items-end pb-4 border-b border-[#1C2220]">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Criar Função de Equipe</h1>
                    <p className="text-slate-400 mt-1 text-sm font-medium">Configure níveis de acesso usando uma matriz bitmask eficiente.</p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-[#4F46E5]/10 flex items-center justify-center border border-[#4F46E5]/20 shadow-[0_0_20px_rgba(79,70,229,0.15)]">
                    <ShieldAlert size={24} className="text-[#A5B4FC]" />
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-4">
                <div className="lg:col-span-8">
                    <div className="bg-[#121615] p-8 rounded-3xl shadow-lg border border-[#1C2220] transition-all relative overflow-hidden">
                        <form className="space-y-8 relative z-10">
                            <div className="bg-[#0A0C0B] p-5 rounded-2xl border border-[#1C2220]">
                                <label className="block text-sm font-bold text-white mb-2">Título da Função</label>
                                <div className="flex bg-[#121615] border border-[#1C2220] rounded-xl focus-within:border-[#4F46E5]/50 focus-within:ring-1 focus-within:ring-[#4F46E5]/30 overflow-hidden transition-all">
                                    <input
                                        type="text"
                                        placeholder="ex. Supervisor de Área"
                                        value={roleName}
                                        onChange={(e) => setRoleName(e.target.value)}
                                        className="w-full px-5 py-3.5 bg-transparent text-white font-medium text-lg placeholder-slate-600 focus:outline-none"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-white mb-4">Matriz de Permissões</label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {AVAILABLE_PERMISSIONS.map(perm => {
                                        const isActive = (selectedPerms & perm.value) === perm.value;
                                        return (
                                            <label
                                                key={perm.id}
                                                className={`flex flex-col p-5 rounded-2xl border cursor-pointer transition-all group relative overflow-hidden h-full ${isActive ? 'bg-[#4F46E5]/10 border-[#4F46E5]/50 shadow-[0_0_15px_rgba(79,70,229,0.1)]' : 'bg-[#0A0C0B] border-[#1C2220] hover:border-slate-700'}`}
                                            >
                                                <div className="flex justify-between items-start mb-3">
                                                    <div className={`w-6 h-6 rounded flex items-center justify-center transition-colors ${isActive ? 'bg-[#4F46E5] text-white' : 'bg-[#121615] border border-slate-700 text-transparent group-hover:border-slate-500'}`}>
                                                        {isActive && <Check size={14} className="font-bold" />}
                                                    </div>
                                                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-[#1C2220] text-slate-500 bg-[#121615]">
                                                        +{perm.value}
                                                    </span>
                                                </div>

                                                <span className={`block font-bold tracking-wide transition-colors mb-2 ${isActive ? 'text-white' : 'text-slate-300 group-hover:text-white'}`}>
                                                    {perm.label}
                                                </span>
                                                <span className="block text-xs text-slate-500 font-medium leading-relaxed flex-1">
                                                    {perm.desc}
                                                </span>

                                                <input
                                                    type="checkbox"
                                                    className="hidden"
                                                    checked={isActive}
                                                    onChange={() => handleToggle(perm.value)}
                                                />
                                            </label>
                                        );
                                    })}
                                </div>
                            </div>
                        </form>
                    </div>
                </div>

                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-[#4F46E5]/5 p-8 rounded-3xl border border-[#4F46E5]/20 sticky top-6">
                        <h3 className="text-xs uppercase tracking-widest font-bold text-[#A5B4FC] mb-2">Hash de Segurança Compilado</h3>
                        <p className="text-sm text-slate-400 font-medium mb-8">O sistema usa operações Bitwise para computar permissões em um único inteiro altamente eficiente.</p>

                        <div className="bg-[#0A0C0B] border border-[#1C2220] rounded-2xl p-6 text-center mb-8 relative">
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#121615] px-3 py-1 rounded-full border border-[#1C2220] text-[10px] text-slate-500 font-mono tracking-widest font-bold text-center w-full max-w-[120px]">
                                VALOR INT
                            </div>
                            <span className="text-6xl font-black text-white font-mono tracking-tighter shadow-sm">{selectedPerms}</span>
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center text-xs font-medium border-b border-[#1C2220] pb-2">
                                <span className="text-slate-500">Forma Binária</span>
                                <span className="text-slate-300 font-mono">{selectedPerms.toString(2).padStart(8, '0')}</span>
                            </div>
                            <div className="flex justify-between items-center text-xs font-medium border-b border-[#1C2220] pb-2">
                                <span className="text-slate-500">Flags Atribuídas</span>
                                <span className="text-[#CFF073] font-bold">{AVAILABLE_PERMISSIONS.filter(p => (selectedPerms & p.value) === p.value).length}</span>
                            </div>
                        </div>

                        <button
                            type="button"
                            className="mt-8 bg-[#4F46E5] text-white w-full py-4 rounded-xl font-bold hover:bg-[#4338CA] shadow-[0_0_20px_rgba(79,70,229,0.3)] transition-all flex justify-center items-center gap-2"
                        >
                            <span>Salvar Função no Banco de Dados</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
