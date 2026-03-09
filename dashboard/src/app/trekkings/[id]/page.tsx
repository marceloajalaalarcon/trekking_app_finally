'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ArrowLeft, Settings, Users, MapPin, Activity, Clock, FileCheck, Calendar, Trophy } from 'lucide-react';
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
        authFetch(`http://localhost:3333/trekkings/${eventId}`)
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
    }, [eventId, authFetch]);

    if (loading) {
        return <div className="p-8 text-center text-slate-400">Carregando Painel...</div>
    }

    const toggleRegistration = () => {
        setSaving(true);
        const newValue = !isRegistrationOpen;
        setIsRegistrationOpen(newValue);

        authFetch(`http://localhost:3333/trekkings/${eventId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ is_registration_open: newValue })
        })
            .then(res => res.json())
            .then(data => {
                if (data.is_registration_open !== undefined) {
                    setEventData(data);
                } else {
                    console.error("Failed update");
                    setIsRegistrationOpen(!newValue);
                }
            })
            .catch(err => {
                console.error(err);
                setIsRegistrationOpen(!newValue); // revert on error
            })
            .finally(() => {
                setSaving(false);
            });
    };

    return (
        <div className="space-y-6 fade-in max-w-[1400px] mx-auto pb-6">
            <div className="flex items-center gap-3 mb-2">
                <Link href="/trekkings/list" className="w-8 h-8 rounded-full bg-[#121615] border border-[#1C2220] flex items-center justify-center text-slate-400 hover:text-white transition-colors">
                    <ArrowLeft size={16} />
                </Link>
                <span className="text-slate-500 font-medium text-sm">/ Events /</span>
                <span className="text-white font-medium text-sm">{eventData?.name || 'Visão Geral'}</span>
            </div>

            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-[#1C2220]">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">{eventData?.name || 'Visão Geral do Evento'}</h1>
                    <p className="text-slate-400 mt-1 text-sm font-medium">Painel analítico e ações rápidas para seu evento.</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-xs font-bold uppercase tracking-wider">
                        Status: {eventData?.status || 'EM BREVE'}
                    </span>

                    <div className="flex items-center gap-3 mr-2 bg-[#1A201E] border border-[#1C2220] px-3 py-1.5 rounded-xl text-sm">
                        <span className="font-bold text-slate-300">
                            {saving ? '...' : (isRegistrationOpen ? 'Inscrições Abertas' : 'Inscrições Fechadas')}
                        </span>
                        <button
                            type="button"
                            onClick={toggleRegistration}
                            disabled={saving}
                            className={`w-10 h-5 shrink-0 rounded-full transition-colors relative flex items-center ${isRegistrationOpen ? 'bg-emerald-500' : 'bg-slate-700'} ${saving ? 'opacity-50 cursor-wait' : ''}`}
                        >
                            <div className={`w-3 h-3 rounded-full bg-white absolute transition-transform ${isRegistrationOpen ? 'translate-x-6' : 'translate-x-1'}`}></div>
                        </button>
                    </div>

                    <Link href={`/trekkings/${eventId}/settings`} className="flex items-center gap-2 px-4 py-2 bg-[#1A201E] border border-[#1C2220] hover:border-emerald-500/30 text-white font-bold rounded-xl transition-all">
                        <Settings size={16} className="text-emerald-400" />
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
                        {eventData?.max_teams ? (
                            <span className="text-emerald-400 text-xs font-bold bg-emerald-400/10 px-2 py-0.5 rounded">
                                +{Math.round(((eventData?._count?.teams || 0) / eventData.max_teams) * 100)}%
                            </span>
                        ) : ((eventData?._count?.teams || 0) > 0 && (
                            <span className="text-emerald-400 text-xs font-bold bg-emerald-400/10 px-2 py-0.5 rounded">
                                +{eventData?._count?.teams || 0}
                            </span>
                        ))}
                    </div>
                    <p className="text-sm font-medium text-slate-400 mb-1">Total de Equipes</p>
                    <h3 className="text-3xl font-black text-white">{eventData?._count?.teams || 0}</h3>
                </div>

                <div className="bg-[#121615] p-6 rounded-3xl border border-[#1C2220] shadow-lg">
                    <div className="flex justify-between items-start mb-4">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                            <MapPin size={20} className="text-amber-500" />
                        </div>
                    </div>
                    <p className="text-sm font-medium text-slate-400 mb-1">Checkpoints</p>
                    <h3 className="text-3xl font-black text-white">{eventData?.checkpoints_count || 5}</h3>
                </div>

                <div className="bg-[#121615] p-6 rounded-3xl border border-[#1C2220] shadow-lg">
                    <div className="flex justify-between items-start mb-4">
                        <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center border border-rose-500/20">
                            <Activity size={20} className="text-rose-400" />
                        </div>
                        {/* <span className="text-rose-400 text-xs font-bold bg-rose-400/10 px-2 py-0.5 rounded">Ação Nece.</span> */}
                    </div>
                    <p className="text-sm font-medium text-slate-400 mb-1">Protestos Ativos</p>
                    <h3 className="text-3xl font-black text-white">0</h3>
                </div>

                <div className="bg-[#121615] p-6 rounded-3xl border border-[#1C2220] shadow-lg">
                    <div className="flex justify-between items-start mb-4">
                        <div className="w-10 h-10 rounded-xl bg-[#CFF073]/10 flex items-center justify-center border border-[#CFF073]/20">
                            <Calendar size={20} className="text-[#CFF073]" />
                        </div>
                    </div>
                    <p className="text-sm font-medium text-slate-400 mb-1">Dias para o Evento</p>
                    <h3 className="text-3xl font-black text-white">
                        {eventData?.start_date
                            ? Math.max(0, Math.ceil((new Date(eventData.start_date).getTime() - new Date().getTime()) / (1000 * 3600 * 24)))
                            : '-'}
                    </h3>
                </div>
            </div>

            {/* Quick Actions Grid */}
            <div className="mt-8">
                <h2 className="text-lg font-bold text-white mb-4">Ações Rápidas & Atalhos</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Link href={`/trekkings/${eventId}/ranking`} className="bg-[#0A0C0B] p-6 rounded-3xl border border-[#1C2220] hover:border-blue-500 group transition-all">
                        <div className="w-12 h-12 bg-[#121615] rounded-full flex items-center justify-center mb-4 border border-[#1C2220] group-hover:scale-110 transition-transform">
                            <Trophy size={20} className="text-slate-400 group-hover:text-blue-400" />
                        </div>
                        <h4 className="font-bold text-white mb-2">Ranking & Resultados</h4>
                        <p className="text-xs text-slate-500">Tabela de pontos, tempos e penalidades das equipes</p>
                    </Link>

                    <Link href={`/trekkings/${eventId}/settings`} className="bg-[#0A0C0B] p-6 rounded-3xl border border-[#1C2220] hover:border-[#4F46E5] group transition-all">
                        <div className="w-12 h-12 bg-[#121615] rounded-full flex items-center justify-center mb-4 border border-[#1C2220] group-hover:scale-110 transition-transform">
                            <Settings size={20} className="text-slate-400 group-hover:text-[#A5B4FC]" />
                        </div>
                        <h4 className="font-bold text-white mb-2">Configurações do Evento</h4>
                        <p className="text-xs text-slate-500">Datas, regras e permissões de staff</p>
                    </Link>

                    <Link href={`/trekkings/${eventId}/ideal-times`} className="bg-[#0A0C0B] p-6 rounded-3xl border border-[#1C2220] hover:border-emerald-500 group transition-all">
                        <div className="w-12 h-12 bg-[#121615] rounded-full flex items-center justify-center mb-4 border border-[#1C2220] group-hover:scale-110 transition-transform">
                            <Clock size={20} className="text-slate-400 group-hover:text-emerald-400" />
                        </div>
                        <h4 className="font-bold text-white mb-2">Planejador de Tempos Ideais</h4>
                        <p className="text-xs text-slate-500">Configurar tempos alvo de rastreamento e QRs</p>
                    </Link>

                    <Link href={`/trekkings/${eventId}/certificates`} className="bg-[#0A0C0B] p-6 rounded-3xl border border-[#1C2220] hover:border-amber-500 group transition-all">
                        <div className="w-12 h-12 bg-[#121615] rounded-full flex items-center justify-center mb-4 border border-[#1C2220] group-hover:scale-110 transition-transform">
                            <FileCheck size={20} className="text-slate-400 group-hover:text-amber-500" />
                        </div>
                        <h4 className="font-bold text-white mb-2">Estúdio de Certificados</h4>
                        <p className="text-xs text-slate-500">Parâmetros de design para diplomas</p>
                    </Link>
                </div>
            </div>

            {/* Recent Activity / Telemetry */}
            <div className="mt-8 bg-[#121615] rounded-3xl border border-[#1C2220] p-6 lg:p-8">
                <h3 className="font-bold text-white mb-6">Log de Atividade Recente</h3>
                <div className="space-y-4 text-center py-4">
                    <p className="text-slate-500 text-sm">Nenhuma atividade registrada recentemente.</p>
                </div>
            </div>

        </div>
    );
}
