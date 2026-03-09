'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, Trophy, Search, LayoutGrid, Download, Filter } from 'lucide-react';

export default function RankingPage() {
    const params = useParams();
    const eventId = params.id as string;

    // Static Mock Data for the ranking view based on user request (Enduro / Regularity)
    const mockRanking = [
        {
            id: 'team-1',
            name: 'Pé na Lama',
            basePoints: 10000,
            totalPoints: 9950,
            cps: [
                { id: 'largada', title: 'Largada', idealTime: '10:06:00', teamTime: '10:06:00', diff: '00:00', points: 0, status: 'perfect' },
                { id: 'cp1', title: 'PC 1', idealTime: '10:26:00', teamTime: '10:26:00', diff: '00:00', points: 0, status: 'perfect' },
                { id: 'cp2', title: 'PC 2', idealTime: '10:46:00', teamTime: '10:46:10', diff: '+00:10', points: -10, status: 'okay' },
                { id: 'cp3', title: 'PC 3', idealTime: '11:26:00', teamTime: '11:26:40', diff: '+00:40', points: -40, status: 'bad' },
                { id: 'cp4', title: 'PC 4', idealTime: '11:46:00', teamTime: '11:46:00', diff: '00:00', points: 0, status: 'perfect' },
                { id: 'final', title: 'Chegada', idealTime: '12:06:00', teamTime: '12:06:00', diff: '00:00', points: 0, status: 'perfect' },
            ],
            extraPenalties: 0,
            totalPenalties: -50
        },
        {
            id: 'team-2',
            name: 'Guerreiros do Mato',
            basePoints: 10000,
            totalPoints: 9380,
            cps: [
                { id: 'largada', title: 'Largada', idealTime: '10:09:00', teamTime: '10:09:50', diff: '+00:50', points: -50, status: 'bad' },
                { id: 'cp1', title: 'PC 1', idealTime: '10:29:00', teamTime: '10:29:15', diff: '+00:15', points: -15, status: 'okay' },
                { id: 'cp2', title: 'PC 2', idealTime: '10:49:00', teamTime: '10:50:00', diff: '+01:00', points: -60, status: 'bad' },
                { id: 'cp3', title: 'PC 3', idealTime: '11:29:00', teamTime: '11:29:35', diff: '+00:35', points: -35, status: 'bad' },
                { id: 'cp4', title: 'PC 4', idealTime: '11:49:00', teamTime: '11:50:00', diff: '+01:00', points: -60, status: 'bad' },
                { id: 'final', title: 'Chegada', idealTime: '12:09:00', teamTime: '12:09:00', diff: '00:00', points: 0, status: 'perfect' },
            ],
            extraPenalties: -400,
            totalPenalties: -220
        },
        {
            id: 'team-3',
            name: 'Sem Rumo Base',
            basePoints: 10000,
            totalPoints: 8600,
            cps: [
                { id: 'largada', title: 'Largada', idealTime: '10:12:00', teamTime: '10:15:00', diff: '+03:00', points: -180, status: 'bad' },
                { id: 'cp1', title: 'PC 1', idealTime: '10:32:00', teamTime: '10:39:00', diff: '+07:00', points: -420, status: 'bad' },
                { id: 'cp2', title: 'PC 2', idealTime: '10:52:00', teamTime: '10:52:00', diff: '00:00', points: 0, status: 'perfect' },
                { id: 'cp3', title: 'PC 3', idealTime: '11:32:00', teamTime: '11:38:40', diff: '+06:40', points: -400, status: 'bad' },
                { id: 'cp4', title: 'PC 4', idealTime: '11:52:00', teamTime: '11:52:00', diff: '00:00', points: 0, status: 'perfect' },
                { id: 'final', title: 'Chegada', idealTime: '12:12:00', teamTime: '12:12:00', diff: '00:00', points: 0, status: 'perfect' },
            ],
            extraPenalties: -400,
            totalPenalties: -1000
        }
    ];

    return (
        <div className="space-y-6 fade-in max-w-[1600px] mx-auto pb-6">
            {/* Header & Breadcrumb */}
            <div className="flex items-center gap-3 mb-2">
                <Link href={`/trekkings/${eventId}`} className="w-8 h-8 rounded-full bg-[#121615] border border-[#1C2220] flex items-center justify-center text-slate-400 hover:text-white transition-colors">
                    <ArrowLeft size={16} />
                </Link>
                <span className="text-slate-500 font-medium text-sm">/ Events / Trekking #{eventId} /</span>
                <span className="text-white font-medium text-sm">Ranking & Cronometragens</span>
            </div>

            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-[#1C2220]">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                        <Trophy className="text-blue-400" size={28} />
                        Ranking de Regularidade
                    </h1>
                    <p className="text-slate-400 mt-1 text-sm font-medium">Equipes começam com 10.000 pontos e perdem por atraso ou adiantamento no Tempo Ideal.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex bg-[#121615] border border-[#1C2220] rounded-xl overflow-hidden px-3 py-2">
                        <Search size={16} className="text-slate-500 mr-2" />
                        <input type="text" placeholder="Buscar equipe..." className="bg-transparent text-sm text-white outline-none w-32 md:w-48 placeholder:text-slate-600" />
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 bg-[#1A201E] text-slate-300 border border-[#1C2220] font-bold rounded-xl hover:bg-[#0A0C0B] hover:text-white transition-colors">
                        <Filter size={16} />
                        Filtros
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-[#0A0C0B] font-bold rounded-xl hover:bg-emerald-400 transition-colors shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                        <Download size={16} />
                        Exportar Relatório
                    </button>
                </div>
            </header>

            {/* Ranking Table Data - Horizontal Scrollable Area */}
            <div className="bg-[#121615] border border-[#1C2220] rounded-3xl shadow-lg overflow-hidden flex flex-col pt-2 mt-6">

                {/* Visual Header Matching the provided illustrative image */}
                <div className="overflow-x-auto w-full pb-4 scrollbar-thin scrollbar-thumb-emerald-500/20 scrollbar-track-transparent">
                    <table className="w-full text-left border-collapse min-w-[1200px]">
                        <thead>
                            <tr className="border-b border-[#1C2220]/50 text-xs uppercase tracking-wider text-slate-500 font-black">
                                <th className="p-5 font-bold sticky left-0 bg-[#121615] z-10 w-64 shadow-[10px_0_15px_-3px_rgba(0,0,0,0.5)]">
                                    <div className="flex items-center gap-2">
                                        <LayoutGrid size={16} className="text-emerald-500" />
                                        Times & Equipes
                                    </div>
                                </th>
                                {/* The table headers will be mapped dynamically from the first team's CPs for consistency */}
                                {mockRanking[0].cps.map(cp => (
                                    <th key={`header-${cp.id}`} className="p-4 border-l border-[#1C2220]/30 min-w-[200px]">
                                        <div className="flex flex-col gap-1.5">
                                            <span className="text-white text-sm">{cp.title}</span>
                                            <span className="text-[10px] text-slate-500 font-bold tracking-widest uppercase">Horário ou Tolerância</span>
                                        </div>
                                    </th>
                                ))}
                                <th className="p-4 border-l border-[#1C2220]/30 min-w-[150px] text-center">
                                    <div className="flex flex-col gap-1.5 items-center">
                                        <span className="text-rose-400 text-sm">Falta Atv Extra</span>
                                        <span className="px-2 py-0.5 bg-rose-500/10 text-rose-500 border border-rose-500/20 rounded w-max text-[10px]">Penalidade Fixa</span>
                                    </div>
                                </th>
                                <th className="p-4 border-l border-[#1C2220]/30 min-w-[160px] text-center">
                                    <div className="flex flex-col gap-1.5 items-center">
                                        <span className="text-blue-400 text-sm">Pontos</span>
                                        <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded w-max text-[10px]">Score Final Campeão</span>
                                    </div>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#1C2220]/50">
                            {mockRanking.map((team, index) => (
                                <tr key={team.id} className="hover:bg-[#1A201E]/30 transition-colors group">
                                    <td className="p-5 sticky left-0 bg-[#121615] group-hover:bg-[#151917] transition-colors z-10 shadow-[10px_0_15px_-3px_rgba(0,0,0,0.5)]">
                                        <div className="flex flex-col">
                                            <div className="flex items-center gap-3">
                                                <span className={`font-black text-lg ${index === 0 ? 'text-amber-400' : index === 1 ? 'text-slate-300' : index === 2 ? 'text-amber-700' : 'text-slate-600'}`}>
                                                    #{index + 1}
                                                </span>
                                                <span className="font-bold text-white text-base truncate max-w-[180px]">{team.name}</span>
                                            </div>
                                            {team.totalPenalties < 0 && (
                                                <span className="text-[10px] text-rose-400 font-bold mt-1 ml-6">Total Penalidade: {team.totalPenalties} pts</span>
                                            )}
                                        </div>
                                    </td>

                                    {team.cps.map((cp, cpIdx) => {
                                        return (
                                            <td key={cpIdx} className="p-4 border-l border-[#1C2220]/30 align-top">
                                                <div className="flex flex-col gap-1 bg-[#0A0C0B] p-2.5 rounded-xl border border-[#1C2220]/50 group-hover:border-slate-800 transition-colors">
                                                    <div className="flex justify-between items-center mb-1 pb-1 border-b border-[#1C2220]">
                                                        <span className="text-[10px] text-emerald-500 uppercase tracking-widest font-black">T. Ideal</span>
                                                        <span className="text-xs font-bold text-slate-300 tracking-tight font-mono">{cp.idealTime}</span>
                                                    </div>
                                                    <div className="flex justify-between items-center mb-1">
                                                        <span className="text-[10px] text-slate-500 uppercase tracking-widest font-black">Eqp Fez:</span>
                                                        <span className="text-sm font-bold text-white tracking-tight font-mono">{cp.teamTime}</span>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <div className="flex-1 flex justify-between items-center bg-[#151917] px-2 py-1.5 rounded-lg mt-1 border border-[#1C2220]/50">
                                                            <span className="text-[10px] text-slate-500 font-black uppercase">Diff</span>
                                                            <span className={`text-[11px] font-mono font-bold ${cp.diff === '00:00' ? 'text-emerald-400' : 'text-amber-400'}`}>{cp.diff}</span>
                                                        </div>
                                                        <div className="flex-1 flex justify-between items-center bg-[#151917] px-2 py-1.5 rounded-lg mt-1 border border-[#1C2220]/50">
                                                            <span className="text-[10px] text-slate-500 font-black uppercase">Pts</span>
                                                            <span className={`text-[11px] font-black ${cp.points === 0 ? 'text-emerald-400' : 'text-rose-500'}`}>
                                                                {cp.points === 0 ? '0' : cp.points}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                        );
                                    })}

                                    <td className="p-4 border-l border-[#1C2220]/30 text-center align-middle">
                                        <div className={`inline-flex items-center justify-center border px-3 py-2 rounded-xl font-black text-sm ${team.extraPenalties < 0 ? 'bg-rose-500/5 border-rose-500/10 text-rose-500' : 'bg-emerald-500/5 border-emerald-500/10 text-emerald-500'}`}>
                                            {team.extraPenalties < 0 ? team.extraPenalties : '0 (OK)'}
                                        </div>
                                    </td>

                                    <td className="p-4 border-l border-[#1C2220]/30 text-center align-middle bg-blue-500/5">
                                        <div className="text-xl font-black text-blue-400 drop-shadow-[0_0_8px_rgba(96,165,250,0.5)]">
                                            {team.totalPoints.toLocaleString()}
                                        </div>
                                        <div className="text-[10px] uppercase text-slate-500 font-black tracking-wider mt-1 block">
                                            (Base: {team.basePoints})
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="p-4 border-t border-[#1C2220] bg-[#0A0C0B] flex justify-between items-center text-xs text-slate-500 font-medium rounded-b-3xl">
                    <p>Cálculo de Ranking: <strong>(10.000 Pontos Iniciais) - (Penalidades por PC) - (Penalidades Pulo de Atividade Extra)</strong></p>
                    <div className="flex gap-4">
                        <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-400"></div> Cravado: Perde 0</span>
                        <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-rose-500"></div> Atraso/Adiantado/Falta: Subtrai Pontos</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
