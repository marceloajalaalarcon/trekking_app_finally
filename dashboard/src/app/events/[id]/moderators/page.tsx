'use client';

import Link from 'next/link';
import { ArrowLeft, UserCheck, ShieldAlert, Plus, Save, Check } from 'lucide-react';
import { useState } from 'react';
import { useParams } from 'next/navigation';

export default function EventModeratorsPage() {
    const params = useParams();
    const eventId = params.id as string;
    const [saving, setSaving] = useState(false);

    const [permissions, setPermissions] = useState({
        manageParticipants: true,
        manageCertificates: true,
        editEventDetails: false,
        fullAdmin: false
    });

    const PERMISSION_VALUES = {
        manageParticipants: { label: 'Gerenciar Participantes', value: 1 },
        manageCertificates: { label: 'Emitir Certificados', value: 2 },
        editEventDetails: { label: 'Editar Dados do Evento', value: 4 },
        fullAdmin: { label: 'Administrador Completo', value: 8 }
    };

    const currentBitmask = Object.entries(permissions).reduce((sum, [key, isChecked]) => {
        return isChecked ? sum + PERMISSION_VALUES[key as keyof typeof PERMISSION_VALUES].value : sum;
    }, 0);

    const handleSaveRole = () => {
        setSaving(true);
        setTimeout(() => {
            alert(`Função Salva com Bitmask: ${currentBitmask}`);
            setSaving(false);
        }, 1000);
    };

    return (
        <div className="space-y-6 fade-in max-w-[1400px] mx-auto pb-6">
            <div className="flex items-center gap-3 mb-2">
                <Link href={`/events/${eventId}`} className="w-8 h-8 rounded-full bg-[#121615] border border-[#1C2220] flex items-center justify-center text-slate-400 hover:text-white transition-colors">
                    <ArrowLeft size={16} />
                </Link>
                <span className="text-slate-500 font-medium text-sm">/ Eventos / Gestão /</span>
                <span className="text-white font-medium text-sm">Moderadores & Staff</span>
            </div>

            <header className="flex justify-between items-end pb-4 border-b border-[#1C2220]">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Controle de Acesso & Staff</h1>
                    <p className="text-slate-400 mt-1 text-sm font-medium">Atribua moderadores ao evento e gerencie permissões.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-5 py-2.5 bg-blue-500 text-white font-bold rounded-xl hover:bg-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.3)] transition-all">
                        <Plus size={18} />
                        Convidar Staff
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                {/* Staff List */}
                <div className="bg-[#121615] rounded-3xl shadow-lg border border-[#1C2220] overflow-hidden">
                    <div className="p-6 border-b border-[#1C2220] flex justify-between items-center bg-[#151917]">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <UserCheck size={20} className="text-[#A5B4FC]" />
                            Moderadores Ativos
                        </h2>
                    </div>

                    <div className="divide-y divide-slate-800/50">
                        <div className="p-6 flex items-center justify-between hover:bg-[#151917]/50 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-700 border-2 border-[#1C2220]">
                                    <img src="https://i.pravatar.cc/150?u=10" alt="Avatar" className="w-full h-full object-cover" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-white text-base">Organizador Principal</h3>
                                    <p className="text-xs text-slate-500 font-medium">Staff ID: #STAFF-001</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-full w-max text-xs font-bold uppercase mb-2">
                                    <ShieldAlert size={12} /> Master Admin
                                </span>
                                <p className="text-[10px] text-slate-500">Controle Total (255)</p>
                            </div>
                        </div>

                        <div className="p-6 flex items-center justify-between hover:bg-[#151917]/50 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-700 border-2 border-[#1C2220]">
                                    <img src="https://i.pravatar.cc/150?u=11" alt="Avatar" className="w-full h-full object-cover" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-white text-base">Assistente de Evento</h3>
                                    <p className="text-xs text-slate-500 font-medium">Staff ID: #STAFF-002</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full w-max text-xs font-bold uppercase mb-2">
                                    <UserCheck size={12} /> Moderador
                                </span>
                                <p className="text-[10px] text-slate-500">Participantes + Certificados (3)</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Configuration Panel */}
                <div className="bg-[#121615] rounded-3xl shadow-lg border border-[#1C2220] p-6 lg:p-8">
                    <h3 className="text-xl font-bold text-white mb-6">Configurador de Função</h3>

                    <div className="space-y-6">
                        <div className="bg-[#0A0C0B] p-5 rounded-2xl border border-[#1C2220]">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h4 className="font-bold text-white mb-1">Permissões do Staff</h4>
                                    <p className="text-xs text-slate-400">Selecione as permissões que esta função terá no evento.</p>
                                </div>
                                <div className="bg-[#1A201E] px-3 py-1.5 rounded-lg border border-[#1C2220] text-center">
                                    <p className="text-[10px] text-slate-500 font-bold tracking-wider mb-0.5">BITMASK</p>
                                    <p className="text-blue-400 font-mono font-bold text-lg leading-none">{currentBitmask}</p>
                                </div>
                            </div>

                            <div className="space-y-2 mt-6">
                                {Object.entries(PERMISSION_VALUES).map(([key, item]) => (
                                    <label key={key} className="flex items-center justify-between p-3 rounded-xl border border-[#1C2220] hover:border-blue-500/30 cursor-pointer transition-colors group">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${permissions[key as keyof typeof permissions] ? 'bg-blue-500 border-blue-500 text-white' : 'bg-[#121615] border-[#1C2220] text-transparent'}`}>
                                                <Check size={12} strokeWidth={3} />
                                            </div>
                                            <span className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors">{item.label}</span>
                                        </div>
                                        <span className="text-xs font-mono text-blue-400/50 bg-blue-400/10 px-2 py-0.5 rounded">+{item.value}</span>
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
                            className="w-full flex items-center justify-center gap-2 py-4 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-xl font-bold hover:bg-blue-500 hover:text-white transition-all disabled:opacity-50"
                        >
                            {saving ? (
                                <><div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-white rounded-full" /> Salvando...</>
                            ) : (
                                <><Save size={18} /> Salvar Configuração da Função</>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
