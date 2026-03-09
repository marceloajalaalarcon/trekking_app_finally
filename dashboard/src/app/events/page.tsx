'use client';

import { ArrowUpRight, CheckCircle2, Calendar as CalendarIcon, Play, Edit3, MapPin, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../contexts/AuthContext';

export default function EventsOverviewPage() {
    const { authFetch } = useAuth();
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        authFetch('http://localhost:3333/events-standard')
            .then(res => res.json())
            .then(data => {
                setEvents(Array.isArray(data) ? data : []);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to fetch events", err);
                setLoading(false);
            });
    }, []);

    if (loading) {
        return <div className="p-8 text-center text-slate-400">Carregando painel principal...</div>;
    }

    const activeEvents = events.filter(e => e.is_active);
    const mainEvent = activeEvents[0] || events[0];

    return (
        <div className="space-y-8 fade-in">
            {/* Welcome Header */}
            <div className="flex items-end justify-between">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tight">Dashboard de Eventos</h1>
                    <p className="text-slate-500 mt-1 font-medium">Gerencie seus eventos padrão da plataforma.</p>
                </div>
                <Link href="/events/new" className="flex items-center gap-2 px-5 py-3 bg-blue-500 hover:bg-blue-400 text-white font-black rounded-xl transition-all">
                    <Plus size={18} /> Novo Evento
                </Link>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-[#121615] border border-[#1C2220] rounded-3xl p-6">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Total de Eventos</p>
                    <p className="text-4xl font-black text-white">{events.length}</p>
                </div>
                <div className="bg-[#121615] border border-[#1C2220] rounded-3xl p-6">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Eventos Ativos</p>
                    <p className="text-4xl font-black text-blue-400">{activeEvents.length}</p>
                </div>
                <div className="bg-[#121615] border border-[#1C2220] rounded-3xl p-6">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Inscrições Abertas</p>
                    <p className="text-4xl font-black text-emerald-400">{events.filter(e => e.is_registration_open).length}</p>
                </div>
            </div>

            {/* Evento Destaque */}
            {mainEvent ? (
                <div className="bg-gradient-to-br from-[#121615] to-[#0A0C0B] border border-[#1C2220] rounded-3xl p-8">
                    <div className="flex items-start justify-between mb-6">
                        <div>
                            <p className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-2">
                                {mainEvent.is_active ? '🔵 Evento em Destaque' : 'Último Evento'}
                            </p>
                            <h2 className="text-2xl font-black text-white">{mainEvent.name}</h2>
                            {mainEvent.location && (
                                <div className="flex items-center gap-1.5 text-slate-500 mt-1">
                                    <MapPin size={14} />
                                    <span className="text-sm">{mainEvent.location}</span>
                                </div>
                            )}
                        </div>
                        <Link href={`/events/${mainEvent.id}`} className="flex items-center gap-2 px-5 py-2.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-xl font-bold hover:bg-blue-500 hover:text-white transition-all">
                            Gerenciar <ArrowUpRight size={16} />
                        </Link>
                    </div>
                    <div className="flex gap-8 text-sm">
                        <div>
                            <span className="text-slate-500 block text-xs font-bold mb-1">Max Participantes</span>
                            <span className="text-white font-black text-lg">{mainEvent.max_participants ?? '∞'}</span>
                        </div>
                        {mainEvent.date && (
                            <div>
                                <span className="text-slate-500 block text-xs font-bold mb-1">Data</span>
                                <span className="text-white font-black text-lg">{new Date(mainEvent.date).toLocaleDateString('pt-BR')}</span>
                            </div>
                        )}
                        <div>
                            <span className="text-slate-500 block text-xs font-bold mb-1">Status</span>
                            <span className={`font-black text-lg ${mainEvent.is_active ? 'text-blue-400' : 'text-slate-600'}`}>
                                {mainEvent.is_active ? 'Ativo' : 'Inativo'}
                            </span>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="bg-[#121615] border border-dashed border-[#1C2220] rounded-3xl p-12 text-center">
                    <CalendarIcon className="mx-auto text-slate-600 mb-4" size={40} />
                    <h3 className="text-xl font-bold text-white mb-2">Nenhum evento criado</h3>
                    <p className="text-slate-500 mb-6">Crie seu primeiro evento e comece a gerenciar participantes!</p>
                    <Link href="/events/new" className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 text-white font-black rounded-xl hover:bg-blue-400 transition-all">
                        <Plus size={18} /> Criar Primeiro Evento
                    </Link>
                </div>
            )}

            {/* Lista de Eventos */}
            {events.length > 1 && (
                <div>
                    <h3 className="text-lg font-bold text-white mb-4">Todos os Eventos</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {events.map((event: any) => (
                            <Link key={event.id} href={`/events/${event.id}`} className="bg-[#121615] border border-[#1C2220] rounded-2xl p-5 hover:border-blue-500/30 transition-all group">
                                <div className="flex items-start justify-between mb-3">
                                    <h4 className="font-bold text-white group-hover:text-blue-400 transition-colors">{event.name}</h4>
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase border ${event.is_active ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-slate-500/10 text-slate-500 border-slate-500/20'}`}>
                                        {event.is_active ? 'Ativo' : 'Inativo'}
                                    </span>
                                </div>
                                {event.location && <p className="text-xs text-slate-500 flex items-center gap-1"><MapPin size={11} /> {event.location}</p>}
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
