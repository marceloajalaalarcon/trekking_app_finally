'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ArrowLeft, Users, ShieldAlert, BadgeCheck, Plus } from 'lucide-react';
import { useAuth } from '../../../../contexts/AuthContext';

export default function TeamsRegistrationPage() {
    const params = useParams();
    const eventId = params.id as string;
    const [eventData, setEventData] = useState<any>(null);
    const [teams, setTeams] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const { authFetch } = useAuth();

    useEffect(() => {
        authFetch(`http://localhost:3333/trekkings/${eventId}`)
            .then(res => res.json())
            .then(data => {
                setEventData(data);
                setTeams(data.teams || []);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to fetch event", err);
                setLoading(false);
            });
    }, [eventId]);

    return (
        <div className="space-y-6 fade-in max-w-[1400px] mx-auto pb-6">
            <div className="flex items-center gap-3 mb-2">
                <Link href={`/trekkings/${eventId}`} className="w-8 h-8 rounded-full bg-[#121615] border border-[#1C2220] flex items-center justify-center text-slate-400 hover:text-white transition-colors">
                    <ArrowLeft size={16} />
                </Link>
                <span className="text-slate-500 font-medium text-sm">/ Events / {eventData?.name || 'Carregando...'} /</span>
                <span className="text-white font-medium text-sm">Teams & Registration</span>
            </div>

            <header className="flex justify-between items-end pb-4 border-b border-[#1C2220]">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Equipes & Competidores</h1>
                    <p className="text-slate-400 mt-1 text-sm font-medium">Gerencie equipes registradas.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 text-[#0A0C0B] font-bold rounded-xl hover:bg-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)] transition-all">
                        <Plus size={18} />
                        Adicionar Equipe
                    </button>
                </div>
            </header>

            <div className="bg-[#121615] rounded-3xl shadow-lg border border-[#1C2220] overflow-hidden mt-6">
                <table className="w-full text-left text-sm text-slate-400">
                    <thead className="bg-[#151917] text-slate-300 font-semibold border-b border-slate-800">
                        <tr>
                            <th className="px-6 py-5">Nome da Equipe</th>
                            <th className="px-6 py-5">Categoria</th>
                            <th className="px-6 py-5">Horário de Início</th>
                            <th className="px-6 py-5">Status</th>
                            <th className="px-6 py-5 text-right flex justify-end">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                        {loading ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-slate-500 font-medium">Carregando equipes...</td>
                            </tr>
                        ) : teams.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-slate-500 font-medium">Nenhuma equipe encontrada no banco de dados.</td>
                            </tr>
                        ) : teams.map((team, idx) => (
                            <tr key={idx} className="hover:bg-[#151917]/50 transition-colors group">
                                <td className="px-6 py-5 font-bold text-white flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-[#CFF073]/10 border border-[#CFF073]/20 flex items-center justify-center text-[#CFF073]">
                                        <Users size={14} />
                                    </div>
                                    {team.name}
                                </td>
                                <td className="px-6 py-5 font-medium">Geral</td>
                                <td className="px-6 py-5 text-emerald-400 font-mono">--:--:--</td>
                                <td className="px-6 py-5">
                                    <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full w-max text-xs font-bold uppercase">
                                        <BadgeCheck size={14} /> Ativo
                                    </span>
                                </td>
                                <td className="px-6 py-5 text-right">
                                    <button className="px-4 py-2 bg-[#1A201E] text-slate-300 border border-[#1C2220] rounded-xl font-bold hover:text-white transition-colors">
                                        Gerenciar
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {!loading && (
                    <div className="p-4 bg-[#151917] border-t border-[#1C2220] text-center text-xs text-slate-500 font-medium">
                        Exibindo {teams.length} equipes mapeadas para este evento.
                    </div>
                )}
            </div>
        </div>
    );
}
