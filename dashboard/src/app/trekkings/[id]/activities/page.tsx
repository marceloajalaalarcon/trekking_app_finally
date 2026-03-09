'use client';

import Link from 'next/link';
import { ArrowLeft, Target, Plus, CheckCircle2, Clock, Trash2 } from 'lucide-react';

export default function ExtraActivitiesPage() {
    return (
        <div className="space-y-6 fade-in max-w-[1400px] mx-auto pb-6">
            <div className="flex items-center gap-3 mb-2">
                <Link href="/trekkings/1" className="w-8 h-8 rounded-full bg-[#121615] border border-[#1C2220] flex items-center justify-center text-slate-400 hover:text-white transition-colors">
                    <ArrowLeft size={16} />
                </Link>
                <span className="text-slate-500 font-medium text-sm">/ Events / Tracking Iniciantes #05 /</span>
                <span className="text-white font-medium text-sm">Atividades Extras</span>
            </div>

            <header className="flex justify-between items-end pb-4 border-b border-[#1C2220]">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Atividades Extras & Tarefas</h1>
                    <p className="text-slate-400 mt-1 text-sm font-medium">Crie tarefas fora da rota para as equipes ganharem pontos bônus ou deduções de tempo.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-5 py-2.5 bg-[#CFF073] text-[#0A0C0B] font-bold rounded-xl hover:bg-[#b8d665] shadow-[0_0_15px_rgba(207,240,115,0.2)] transition-all">
                        <Plus size={18} />
                        Nova Atividade
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4">
                {/* List of Activities */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="bg-[#121615] p-6 rounded-3xl shadow-lg border border-[#1C2220] flex flex-col sm:flex-row gap-6 relative overflow-hidden group hover:border-[#CFF073]/50 transition-colors">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-bl-[100px] -z-0"></div>

                        <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex flex-shrink-0 items-center justify-center text-emerald-400 z-10">
                            <CheckCircle2 size={24} />
                        </div>

                        <div className="flex-1 z-10">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="text-xl font-bold text-white">Doação de Alimentos (Social)</h3>
                                <span className="px-3 py-1 bg-[#1A201E] text-slate-300 border border-[#1C2220] rounded-lg text-xs font-bold uppercase tracking-wider">
                                    Obrigatória
                                </span>
                            </div>
                            <p className="text-sm text-slate-400 mb-4 leading-relaxed">
                                Entregar 2kg de alimento não perecível na largada. A equipe que não entregar ou esquecer sofrerá penalidade imediata.
                            </p>

                            <div className="flex items-center gap-4 border-t border-[#1C2220] pt-4">
                                <div className="flex items-center gap-2 text-emerald-400 font-mono text-sm">
                                    <Clock size={14} /> + 00:00:00 (Bônus)
                                </div>
                                <div className="flex items-center gap-2 text-rose-400 font-mono text-sm">
                                    <Clock size={14} /> - 00:15:00 (Penalidade)
                                </div>
                            </div>
                        </div>

                        <div className="flex sm:flex-col gap-2 justify-start sm:justify-start z-10">
                            <button className="px-4 py-2 bg-[#1A201E] text-slate-300 border border-[#1C2220] rounded-xl font-bold hover:text-white transition-colors text-sm">
                                Editar
                            </button>
                            <button className="px-4 py-2 bg-[#1A201E] text-rose-400 border border-[#1C2220] rounded-xl font-bold hover:bg-rose-500/10 transition-colors text-sm">
                                Excluir
                            </button>
                        </div>
                    </div>

                    <div className="bg-[#121615] p-6 rounded-3xl shadow-lg border border-[#1C2220] flex flex-col sm:flex-row gap-6 relative overflow-hidden group hover:border-[#CFF073]/50 transition-colors">
                        <div className="w-16 h-16 rounded-2xl bg-[#CFF073]/10 border border-[#CFF073]/20 flex flex-shrink-0 items-center justify-center text-[#CFF073] z-10">
                            <Target size={24} />
                        </div>

                        <div className="flex-1 z-10">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="text-xl font-bold text-white">Caça ao Tesouro Fotográfico</h3>
                                <span className="px-3 py-1 bg-[#1A201E] text-slate-500 border border-[#1C2220] rounded-lg text-xs font-bold uppercase tracking-wider">
                                    Opcional
                                </span>
                            </div>
                            <p className="text-sm text-slate-400 mb-4 leading-relaxed">
                                Tirar uma foto com a equipe inteira na praça da matriz e mostrar para a organização na chegada. Rende bônus de tempo.
                            </p>

                            <div className="flex items-center gap-4 border-t border-[#1C2220] pt-4">
                                <div className="flex items-center gap-2 text-[#CFF073] font-mono text-sm">
                                    <Clock size={14} /> - 00:03:00 (Dedução de bônus)
                                </div>
                            </div>
                        </div>

                        <div className="flex sm:flex-col gap-2 justify-start sm:justify-start z-10">
                            <button className="px-4 py-2 bg-[#1A201E] text-slate-300 border border-[#1C2220] rounded-xl font-bold hover:text-white transition-colors text-sm">
                                Editar
                            </button>
                            <button className="px-4 py-2 bg-[#1A201E] text-rose-400 border border-[#1C2220] rounded-xl font-bold hover:bg-rose-500/10 transition-colors text-sm">
                                Excluir
                            </button>
                        </div>
                    </div>
                </div>

                {/* Info Panel */}
                <div className="bg-[#121615] p-6 rounded-3xl shadow-lg border border-[#1C2220] h-max sticky top-6">
                    <h3 className="text-lg font-bold text-white mb-4">Como Funcionam as Atividades Extras</h3>
                    <div className="space-y-4 text-sm text-slate-400">
                        <p>As atividades extras não dependem de GPS ou Checkpoints físicos.</p>
                        <p>Elas geralmente são avaliadas pelo <strong className="text-white">Staff do Evento</strong> na Linha de Largada ou de Chegada.</p>
                        <div className="bg-[#0A0C0B] p-4 rounded-xl border border-[#1C2220]">
                            <ul className="list-disc pl-4 space-y-2">
                                <li><strong>Obrigatória:</strong> O não cumprimento resulta em uma penalidade (+ tempo adicionado).</li>
                                <li><strong>Opcional:</strong> Concluí-la com sucesso concede um bônus (- tempo deduzido).</li>
                            </ul>
                        </div>
                        <p className="text-xs text-[#CFF073] font-medium pt-2">Atualmente, as equipes são avaliadas centralmente pelo Painel de Administração. Em breve envio pelo aplicativo móvel.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
