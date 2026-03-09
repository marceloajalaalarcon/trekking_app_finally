'use client';

import { ArrowUpRight, CheckCircle2, MoreHorizontal, Calendar as CalendarIcon, Play, Edit3, Check, MapPin } from 'lucide-react';
import { useEffect, useState } from 'react';
import Link from 'next/link';

import { useAuth } from '../../contexts/AuthContext';

export default function EventsOverviewPage() {
    const { authFetch } = useAuth();
    const [stats, setStats] = useState({
        activeTracking: null as any,
        totalTrekkings: 0,
        loading: true
    });

    useEffect(() => {
        authFetch('http://localhost:3333/trekkings')
            .then(res => res.json())
            .then(data => {
                if (!Array.isArray(data)) {
                    setStats(s => ({ ...s, loading: false }));
                    return;
                }
                const now = new Date();
                // Find an active or upcoming event
                let mainEvent = data.find((t: any) => t.start_date && new Date(t.start_date) >= now) || data[0];

                setStats({
                    activeTracking: mainEvent,
                    totalTrekkings: data.length,
                    loading: false
                });
            })
            .catch(err => {
                console.error("Failed to fetch events", err);
                setStats(s => ({ ...s, loading: false }));
            });
    }, []);

    if (stats.loading) {
        return <div className="p-8 text-center text-slate-400">Carregando painel principal...</div>;
    }

    const event = stats.activeTracking;

    return (
        <div className="space-y-6 fade-in max-w-[1400px] mx-auto pb-6">
            <div className="flex justify-between items-end mb-4">
                <div>
                    <h1 className="text-3xl font-medium text-white tracking-tight">Painel Principal</h1>
                    <p className="text-slate-400 mt-1 text-sm font-medium">Visão geral dos seus eventos de rastreamento</p>
                </div>
                {event && (
                    <Link href={`/trekkings/${event.id}`} className="px-4 py-2 bg-emerald-500/10 text-emerald-400 font-bold rounded-lg hover:bg-emerald-500 hover:text-[#0A0C0B] transition-colors text-sm">
                        Gerenciar Evento
                    </Link>
                )}
            </div>

            {event ? (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                    {/* BIG CARD: Current Main Event/Tracking */}
                    <div className="lg:col-span-5 bg-gradient-to-br from-[#4F46E5]/20 to-[#121615] rounded-3xl p-6 border border-[#4F46E5]/30 shadow-lg relative overflow-hidden flex flex-col justify-between min-h-[220px]">
                        <div className="absolute right-0 top-0 w-48 h-48 bg-[#4F46E5]/20 rounded-full blur-3xl"></div>

                        <div className="flex justify-between items-start relative z-10">
                            <div className="bg-[#4F46E5]/30 text-[#A5B4FC] px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 border border-[#4F46E5]/20">
                                <CheckCircle2 size={12} /> Exibindo Destaque
                            </div>
                            <p className="text-[#A5B4FC] font-bold text-xs">+{event.checkpoints_count || 0} checkpoints</p>
                        </div>

                        <div className="relative z-10 mt-6">
                            <h2 className="text-4xl font-bold text-white tracking-tight mb-2 truncate" title={event.name}>{event.name}</h2>
                            <div className="flex items-center gap-2 text-[#A5B4FC] text-sm font-medium mb-6">
                                <span>{event.start_date ? new Date(event.start_date).toLocaleDateString('pt-BR') : 'Sem data definida'}</span>
                                <span className="w-1 h-1 rounded-full bg-[#A5B4FC]"></span>
                                <span>{event.location || 'Local a definir'}</span>
                            </div>
                            <div className="flex gap-2 text-xs">
                                <span className="px-3 py-1.5 bg-[#121615]/80 text-[#A5B4FC] rounded-lg font-bold">{event._count?.teams || 0} Equipes</span>
                                <span className="px-3 py-1.5 bg-[#121615]/80 text-[#A5B4FC] rounded-lg font-bold">{event._count?.members || 0} Staffs</span>
                            </div>
                        </div>
                    </div>

                    {/* STATS: Active Teams Circular Progress */}
                    <div className="lg:col-span-3 bg-[#121615] rounded-3xl p-6 border border-[#1C2220] shadow-sm flex flex-col items-center justify-center relative">
                        <div className="text-left w-full mb-2">
                            <h3 className="text-white font-medium text-lg">Inscrições</h3>
                        </div>

                        <div className="relative flex items-center justify-center w-32 h-32 mt-2">
                            {/* SVG Circle */}
                            {(() => {
                                const teams = event._count?.teams || 0;
                                const capacity = 50; // default total capacity mock for calculation
                                const percentage = teams > 0 ? Math.min((teams / capacity) * 100, 100) : 0;
                                const circumference = 2 * Math.PI * 40; // ~251.2
                                const strokeDashoffset = circumference - (percentage / 100) * circumference;

                                return (
                                    <svg className="w-full h-full transform -rotate-90 transition-all duration-1000 ease-out" viewBox="0 0 100 100">
                                        <circle cx="50" cy="50" r="40" stroke="#1A201E" strokeWidth="12" fill="none" />
                                        <circle
                                            cx="50"
                                            cy="50"
                                            r="40"
                                            stroke={percentage > 0 ? "#CFF073" : "transparent"}
                                            strokeWidth="12"
                                            fill="none"
                                            strokeDasharray={circumference}
                                            strokeDashoffset={strokeDashoffset}
                                            strokeLinecap="round"
                                            className="transition-all duration-1000 ease-out"
                                        />
                                    </svg>
                                );
                            })()}
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-2xl font-bold text-white">{event._count?.teams || 0}</span>
                            </div>
                        </div>
                        <p className="text-emerald-400 mt-4 text-xs font-bold uppercase tracking-wider">Equipes Registradas</p>
                    </div>

                    {/* STATS: Checkpoints Bar Chart */}
                    <div className="lg:col-span-4 bg-[#121615] rounded-3xl p-6 border border-[#1C2220] shadow-sm">
                        <div className="flex justify-between items-start mb-6">
                            <h3 className="text-white font-medium text-lg">Métricas de Checkpoints</h3>
                        </div>

                        <div className="flex items-end justify-between h-32 gap-2 pb-2">
                            {Array.from({ length: Math.min(6, event.checkpoints_count || 5) }).map((_, i) => {
                                const h = Math.floor(Math.random() * 60) + 30; // Random height for mock visualization
                                return (
                                    <div key={i} className="w-full flex flex-col items-center gap-2 group">
                                        <div className="w-full h-full bg-[#1A201E] rounded-md relative flex items-end overflow-hidden">
                                            <div style={{ height: `${h}%` }} className={`w-full rounded-md transition-all ${i % 2 === 0 ? 'bg-[#CFF073]' : 'bg-[#1C6048]'}`}></div>
                                        </div>
                                        <span className="text-[10px] font-bold text-slate-500">CP{i + 1}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="bg-[#121615] border border-[#1C2220] rounded-3xl p-12 text-center flex flex-col items-center justify-center">
                    <MapPin size={48} className="text-slate-600 mb-4" />
                    <h2 className="text-xl font-bold text-white mb-2">Nenhum evento encontrado</h2>
                    <p className="text-slate-400 mb-6">Você ainda não tem nenhum trekking registrado no sistema.</p>
                    <Link href="/trekkings/new" className="px-6 py-3 bg-emerald-500 text-[#0A0C0B] font-bold rounded-xl hover:bg-emerald-400 transition-colors">
                        Criar Novo Evento
                    </Link>
                </div>
            )}

            {event && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                    {/* Daily Goals / Task List */}
                    <div className="lg:col-span-5 bg-[#121615] rounded-3xl p-6 border border-[#1C2220] shadow-sm">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-white font-medium text-lg">Progresso da Configuração</h3>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center gap-4 bg-[#1A201E] p-3.5 rounded-2xl">
                                <div className={`w-6 h-6 rounded flex items-center justify-center ${event.name ? 'bg-emerald-500 text-[#1A201E]' : 'bg-[#252E2B] border border-slate-700'}`}>
                                    {event.name && <Check size={14} className="font-bold" />}
                                </div>
                                <span className={`font-medium text-sm ${event.name ? 'text-slate-400 line-through' : 'text-slate-300'}`}>Detalhes Básicos Cadastrados</span>
                            </div>

                            <div className="flex items-center gap-4 bg-[#1A201E] p-3.5 rounded-2xl">
                                <div className={`w-6 h-6 rounded flex items-center justify-center ${event.start_date ? 'bg-emerald-500 text-[#1A201E]' : 'bg-[#252E2B] border border-slate-700'}`}>
                                    {event.start_date && <Check size={14} className="font-bold" />}
                                </div>
                                <span className={`font-medium text-sm ${event.start_date ? 'text-slate-400 line-through' : 'text-slate-300'}`}>Data do Evento Definida</span>
                            </div>

                            <div className="flex items-center gap-4 bg-[#1A201E] p-3.5 rounded-2xl">
                                <div className={`w-6 h-6 rounded flex items-center justify-center ${event._count?.teams > 0 ? 'bg-[#CFF073] text-[#1A201E] shadow-[0_0_10px_rgba(207,240,115,0.3)]' : 'bg-[#252E2B] border border-slate-700'}`}>
                                    {event._count?.teams > 0 && <Check size={14} className="font-bold" />}
                                </div>
                                <span className="text-white font-medium text-sm">Equipes Importadas</span>
                            </div>

                            <div className="flex items-center gap-4 py-3.5 px-3">
                                <div className={`w-6 h-6 rounded flex items-center justify-center ${event.is_registration_open ? 'bg-emerald-500 text-[#1A201E]' : 'bg-[#252E2B] border border-slate-700'}`}>
                                    {event.is_registration_open && <Check size={14} className="font-bold" />}
                                </div>
                                <span className="text-slate-300 font-medium text-sm">Inscrições Abertas</span>
                            </div>
                        </div>
                    </div>

                    {/* Schedule / Upcoming calendar info */}
                    <div className="lg:col-span-7 bg-[#121615] rounded-3xl p-6 border border-[#1C2220] shadow-sm flex flex-col justify-center text-center items-center">
                        <div className="w-16 h-16 rounded-full bg-[#1A201E] border border-[#1C2220] flex items-center justify-center mb-6">
                            <CalendarIcon size={24} className="text-emerald-400" />
                        </div>
                        <h3 className="text-white font-bold text-xl mb-2">Calendário de Largadas</h3>
                        <p className="text-slate-400 max-w-sm mb-6">A gestão de atividades e largadas do dia do evento ainda está sendo implementada no novo painel.</p>
                        <Link href="/trekkings/calendar" className="px-6 py-2.5 bg-[#1A201E] border border-[#1C2220] rounded-xl text-white font-bold hover:bg-[#252E2B] transition-colors">
                            Ver Calendário Global
                        </Link>
                    </div>

                </div>
            )}
        </div>
    );
}
