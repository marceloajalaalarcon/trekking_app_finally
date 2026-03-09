'use client';

import Link from 'next/link';
import { Filter, Calendar, Eye, MapPin } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';

export default function EventsListPage() {
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

    return (
        <div className="space-y-8 fade-in h-full flex flex-col">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Eventos Padrão</h1>
                    <p className="text-slate-400 mt-2 text-sm font-medium">Gerencie seus eventos e visualize detalhes de participantes.</p>
                </div>
                <div className="flex gap-3">
                    <Link href="/events/new" className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-xl font-bold text-sm shadow-[0_0_15px_rgba(59,130,246,0.2)] hover:bg-blue-400 transition-colors">
                        + Novo Evento
                    </Link>
                    <button className="flex items-center gap-2 px-4 py-2 border border-slate-700 bg-[#111614] rounded-xl text-slate-300 text-sm font-medium hover:bg-slate-800 hover:text-white transition-colors">
                        <Filter size={16} /> Filtrar
                    </button>
                </div>
            </div>

            <div className="bg-[#111614] rounded-2xl shadow-lg border border-slate-800/60 overflow-hidden flex-1 flex flex-col">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-400">
                        <thead className="bg-[#151917] text-slate-300 font-semibold border-b border-slate-800">
                            <tr>
                                <th className="px-6 py-5">Nome do Evento</th>
                                <th className="px-6 py-5">Data</th>
                                <th className="px-6 py-5">Participantes</th>
                                <th className="px-6 py-5">Status</th>
                                <th className="px-6 py-5 text-right flex justify-end">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500 font-medium">Carregando eventos...</td>
                                </tr>
                            ) : events.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500 font-medium">Nenhum evento encontrado. Crie seu primeiro evento!</td>
                                </tr>
                            ) : events.map((evt) => (
                                <tr key={evt.id} className="hover:bg-[#151917]/50 transition-colors group">
                                    <td className="px-6 py-5 font-bold text-white flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-blue-400 group-hover:scale-105 transition-transform">
                                            <MapPin size={14} />
                                        </div>
                                        {evt.name}
                                    </td>
                                    <td className="px-6 py-5 font-medium"><div className="flex items-center gap-2"><Calendar size={14} className="text-slate-500" /> {evt.date ? new Date(evt.date).toLocaleDateString('pt-BR') : 'A Definir'}</div></td>
                                    <td className="px-6 py-5">
                                        {evt._count?.participants || 0} <span className="text-slate-500">/ {evt.max_participants || '∞'}</span>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className={`px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider border ${evt.is_active ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-slate-500/10 text-slate-500 border-slate-500/20'}`}>
                                            {evt.is_active ? 'Ativo' : 'Inativo'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button className="p-2 text-slate-500 hover:text-white bg-slate-800/50 hover:bg-slate-700 rounded-lg transition-colors">
                                                <Eye size={16} />
                                            </button>
                                            <Link
                                                href={`/events/${evt.id}`}
                                                className="px-4 py-2 rounded-lg bg-blue-500/10 text-blue-400 font-bold hover:bg-blue-500 hover:text-white transition-all"
                                            >
                                                Gerenciar
                                            </Link>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
