'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ArrowLeft, Settings, Users, MapPin, Activity, Calendar, Award, FileCheck, Shield } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';

export default function EventAnalyticalDashboard() {
    const params = useParams();
    const eventId = params.id as string;
    const { authFetch } = useAuth();

    const [eventData, setEventData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isRegistrationOpen, setIsRegistrationOpen] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        authFetch(`http://localhost:3333/events-standard/${eventId}`)
            .then(res => res.json())
            .then(data => {
                setEventData(data);
                setIsRegistrationOpen(data.is_registration_open || false);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to fetch event", err);
                setLoading(false);
            });
    }, [eventId]);

    if (loading) {
        return <div className="p-8 text-center text-slate-400">Carregando Painel...</div>
    }

    if (!eventData || eventData.statusCode) {
        return <div className="p-8 text-center text-rose-400">Evento não encontrado.</div>
    }

    const toggleRegistration = () => {
        setSaving(true);
        const newValue = !isRegistrationOpen;
        setIsRegistrationOpen(newValue);

        authFetch(`http://localhost:3333/events-standard/${eventId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ is_registration_open: newValue })
        })
            .then(res => res.json())
            .then(data => {
                setEventData(data);
            })
            .catch(err => {
                console.error(err);
                setIsRegistrationOpen(!newValue);
            })
            .finally(() => {
                setSaving(false);
            });
    };

    return (
        <div className="space-y-6 fade-in max-w-[1400px] mx-auto pb-6">
            <div className="flex items-center gap-3 mb-2">
                <Link href="/events" className="w-8 h-8 rounded-full bg-[#121615] border border-[#1C2220] flex items-center justify-center text-slate-400 hover:text-white transition-colors">
                    <ArrowLeft size={16} />
                </Link>
                <span className="text-slate-500 font-medium text-sm">/ Eventos /</span>
                <span className="text-white font-medium text-sm">{eventData?.name || 'Visão Geral'}</span>
            </div>

            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-[#1C2220]">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">{eventData?.name || 'Visão Geral do Evento'}</h1>
                    <p className="text-slate-400 mt-1 text-sm font-medium">Painel analítico e ações rápidas para seu evento.</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <span className={`px-3 py-1 border rounded-full text-xs font-bold uppercase tracking-wider ${eventData?.is_active ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-slate-500/10 text-slate-500 border-slate-500/20'}`}>
                        Status: {eventData?.is_active ? 'ATIVO' : 'INATIVO'}
                    </span>

                    <div className="flex items-center gap-3 mr-2 bg-[#1A201E] border border-[#1C2220] px-3 py-1.5 rounded-xl text-sm">
                        <span className="font-bold text-slate-300">
                            {saving ? '...' : (isRegistrationOpen ? 'Inscrições Abertas' : 'Inscrições Fechadas')}
                        </span>
                        <button
                            type="button"
                            onClick={toggleRegistration}
                            disabled={saving}
                            className={`w-10 h-5 shrink-0 rounded-full transition-colors relative flex items-center ${isRegistrationOpen ? 'bg-blue-500' : 'bg-slate-700'} ${saving ? 'opacity-50 cursor-wait' : ''}`}
                        >
                            <div className={`w-3 h-3 rounded-full bg-white absolute transition-transform ${isRegistrationOpen ? 'translate-x-6' : 'translate-x-1'}`}></div>
                        </button>
                    </div>

                    <Link href={`/events/${eventId}/settings`} className="flex items-center gap-2 px-4 py-2 bg-[#1A201E] border border-[#1C2220] hover:border-blue-500/30 text-white font-bold rounded-xl transition-all">
                        <Settings size={16} className="text-blue-400" />
                        Configurações
                    </Link>
                </div>
            </header>

            {/* Top Level KPIs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-4">
                <div className="bg-[#121615] p-6 rounded-3xl border border-[#1C2220] shadow-lg">
                    <div className="flex justify-between items-start mb-4">
                        <div className="w-10 h-10 rounded-xl bg-[#4F46E5]/10 flex items-center justify-center border border-[#4F46E5]/20">
                            <Users size={20} className="text-[#A5B4FC]" />
                        </div>
                    </div>
                    <p className="text-sm font-medium text-slate-400 mb-1">Participantes</p>
                    <h3 className="text-3xl font-black text-white">{eventData?._count?.participants || 0}</h3>
                </div>

                <div className="bg-[#121615] p-6 rounded-3xl border border-[#1C2220] shadow-lg">
                    <div className="flex justify-between items-start mb-4">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                            <Award size={20} className="text-amber-500" />
                        </div>
                    </div>
                    <p className="text-sm font-medium text-slate-400 mb-1">Certificados Emitidos</p>
                    <h3 className="text-3xl font-black text-white">0</h3>
                </div>

                <div className="bg-[#121615] p-6 rounded-3xl border border-[#1C2220] shadow-lg">
                    <div className="flex justify-between items-start mb-4">
                        <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center border border-rose-500/20">
                            <MapPin size={20} className="text-rose-400" />
                        </div>
                    </div>
                    <p className="text-sm font-medium text-slate-400 mb-1">Local</p>
                    <h3 className="text-xl font-black text-white truncate">{eventData?.location || '—'}</h3>
                </div>

                <div className="bg-[#121615] p-6 rounded-3xl border border-[#1C2220] shadow-lg">
                    <div className="flex justify-between items-start mb-4">
                        <div className="w-10 h-10 rounded-xl bg-[#73A9F0]/10 flex items-center justify-center border border-[#73A9F0]/20">
                            <Calendar size={20} className="text-[#73A9F0]" />
                        </div>
                    </div>
                    <p className="text-sm font-medium text-slate-400 mb-1">Dias para o Evento</p>
                    <h3 className="text-3xl font-black text-white">
                        {eventData?.date
                            ? Math.max(0, Math.ceil((new Date(eventData.date).getTime() - new Date().getTime()) / (1000 * 3600 * 24)))
                            : '—'}
                    </h3>
                </div>
            </div>

            {/* Quick Actions Grid */}
            <div className="mt-8">
                <h2 className="text-lg font-bold text-white mb-4">Ações Rápidas & Atalhos</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Link href={`/events/${eventId}/participants`} className="bg-[#0A0C0B] p-6 rounded-3xl border border-[#1C2220] hover:border-blue-500 group transition-all">
                        <div className="w-12 h-12 bg-[#121615] rounded-full flex items-center justify-center mb-4 border border-[#1C2220] group-hover:scale-110 transition-transform">
                            <Users size={20} className="text-slate-400 group-hover:text-blue-400" />
                        </div>
                        <h4 className="font-bold text-white mb-2">Participantes</h4>
                        <p className="text-xs text-slate-500">Gerencie inscrições e presenças do evento</p>
                    </Link>

                    <Link href={`/events/${eventId}/settings`} className="bg-[#0A0C0B] p-6 rounded-3xl border border-[#1C2220] hover:border-[#4F46E5] group transition-all">
                        <div className="w-12 h-12 bg-[#121615] rounded-full flex items-center justify-center mb-4 border border-[#1C2220] group-hover:scale-110 transition-transform">
                            <Settings size={20} className="text-slate-400 group-hover:text-[#A5B4FC]" />
                        </div>
                        <h4 className="font-bold text-white mb-2">Configurações do Evento</h4>
                        <p className="text-xs text-slate-500">Datas, regras e permissões de staff</p>
                    </Link>

                    <Link href={`/events/${eventId}/moderators`} className="bg-[#0A0C0B] p-6 rounded-3xl border border-[#1C2220] hover:border-emerald-500 group transition-all">
                        <div className="w-12 h-12 bg-[#121615] rounded-full flex items-center justify-center mb-4 border border-[#1C2220] group-hover:scale-110 transition-transform">
                            <Shield size={20} className="text-slate-400 group-hover:text-emerald-400" />
                        </div>
                        <h4 className="font-bold text-white mb-2">Moderadores & Staff</h4>
                        <p className="text-xs text-slate-500">Controle de acesso e equipe organizadora</p>
                    </Link>

                    <Link href={`/events/${eventId}/certificates`} className="bg-[#0A0C0B] p-6 rounded-3xl border border-[#1C2220] hover:border-amber-500 group transition-all">
                        <div className="w-12 h-12 bg-[#121615] rounded-full flex items-center justify-center mb-4 border border-[#1C2220] group-hover:scale-110 transition-transform">
                            <FileCheck size={20} className="text-slate-400 group-hover:text-amber-500" />
                        </div>
                        <h4 className="font-bold text-white mb-2">Estúdio de Certificados</h4>
                        <p className="text-xs text-slate-500">Parâmetros de design para certificados</p>
                    </Link>
                </div>
            </div>

            {/* Recent Activity / Log */}
            <div className="mt-8 bg-[#121615] rounded-3xl border border-[#1C2220] p-6 lg:p-8">
                <h3 className="font-bold text-white mb-6">Log de Atividade Recente</h3>
                <div className="space-y-4 text-center py-4">
                    <p className="text-slate-500 text-sm">Nenhuma atividade registrada recentemente.</p>
                </div>
            </div>

        </div>
    );
}
