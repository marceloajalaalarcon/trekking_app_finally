'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Settings, ShieldAlert, Clock, Calendar, Search, MapPin, Activity, Zap, FileCheck, FileText, ArrowLeft, Image as ImageIcon, ToggleRight, FileUp, UserCheck } from 'lucide-react';
import { useAuth } from '../../../../contexts/AuthContext';

export default function EventSettingsPage() {
    const params = useParams();
    const eventId = params.id as string;
    const { authFetch } = useAuth();

    // Form fields mapped from Creation Page
    const [name, setName] = useState('Enduro Master 2026');
    const [description, setDescription] = useState('Anual Enduro Championship stage 1');
    const [location, setLocation] = useState('Bandeirantes, PR');

    // Toggles
    const [isRegistrationOpen, setIsRegistrationOpen] = useState(false);
    const [isRegularityMode, setIsRegularityMode] = useState(true);
    const [isTracking, setIsTracking] = useState(true);
    const [hasExtraActivities, setHasExtraActivities] = useState(false);

    // Certificate
    const [hasCertificate, setHasCertificate] = useState(false);
    const [certificateFile, setCertificateFile] = useState<File | null>(null);

    // Tracking rules
    const [teamsIntervalMinutes, setTeamsIntervalMinutes] = useState(2);
    const [checkpointsCount, setCheckpointsCount] = useState(5);
    const [startDate, setStartDate] = useState('2026-02-02T00:58');
    const [endDate, setEndDate] = useState('2026-03-02T00:58');

    // Capacity & Size limits
    const [limitCapacity, setLimitCapacity] = useState(false);
    const [maxTeams, setMaxTeams] = useState(50);
    const [limitTeamSize, setLimitTeamSize] = useState(false);
    const [minTeamSize, setMinTeamSize] = useState(2);
    const [maxTeamSize, setMaxTeamSize] = useState(4);

    const [roles, setRoles] = useState<any[]>([]);

    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        authFetch(`http://localhost:3333/trekkings/${eventId}`)
            .then(res => res.json())
            .then(data => {
                if (data.name) setName(data.name);
                if (data.description) setDescription(data.description);
                if (data.location) setLocation(data.location);
                if (data.teams_start_interval !== undefined) setTeamsIntervalMinutes(Math.max(1, Math.floor(data.teams_start_interval / 60)));
                if (data.checkpoints_count !== undefined) setCheckpointsCount(data.checkpoints_count);
                if (data.start_date) {
                    const sd = new Date(data.start_date);
                    setStartDate(new Date(sd.getTime() - sd.getTimezoneOffset() * 60000).toISOString().slice(0, 16));
                }
                if (data.end_date) {
                    const ed = new Date(data.end_date);
                    setEndDate(new Date(ed.getTime() - ed.getTimezoneOffset() * 60000).toISOString().slice(0, 16));
                }
                if (data.is_registration_open !== undefined) setIsRegistrationOpen(data.is_registration_open);
                if (data.is_tracking !== undefined) setIsTracking(data.is_tracking);
                if (data.has_extra_activities !== undefined) setHasExtraActivities(data.has_extra_activities);

                if (data.max_teams !== null) {
                    setLimitCapacity(true);
                    setMaxTeams(data.max_teams);
                }
                if (data.min_team_size !== null || data.max_team_size !== null) {
                    setLimitTeamSize(true);
                    if (data.min_team_size !== null) setMinTeamSize(data.min_team_size);
                    if (data.max_team_size !== null) setMaxTeamSize(data.max_team_size);
                }

                if (data.roles) {
                    setRoles(data.roles);
                }
            })
            .catch(console.error)
            .finally(() => setIsLoading(false));
    }, [eventId]);

    const handleSaveRules = async () => {
        try {
            const res = await authFetch(`http://localhost:3333/trekkings/${eventId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name,
                    description,
                    location,
                    start_date: startDate ? new Date(startDate).toISOString() : null,
                    end_date: endDate ? new Date(endDate).toISOString() : null,
                    teams_start_interval: teamsIntervalMinutes * 60,
                    checkpoints_count: checkpointsCount,
                    is_registration_open: isRegistrationOpen,
                    is_tracking: isTracking,
                    has_extra_activities: hasExtraActivities,
                    max_teams: limitCapacity ? maxTeams : null,
                    min_team_size: limitTeamSize ? minTeamSize : null,
                    max_team_size: limitTeamSize ? maxTeamSize : null,
                })
            });
            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.message || 'Erro ao salvar no servidor');
            }
            alert('Configuração de Ajustes Salva!');
        } catch (err: any) {
            console.error('Falha ao salvar', err);
            alert(`Falha ao salvar: ${err.message}`);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setCertificateFile(e.target.files[0]);
        }
    };

    return (
        <div className="space-y-6 fade-in max-w-[1400px] mx-auto pb-6">
            <div className="flex items-center gap-3 mb-2">
                <Link href={`/trekkings/${eventId}`} className="w-8 h-8 rounded-full bg-[#121615] border border-[#1C2220] flex items-center justify-center text-slate-400 hover:text-white transition-colors">
                    <ArrowLeft size={16} />
                </Link>
                <span className="text-slate-500 font-medium text-sm">/ Events / Novo Evento de Tracking /</span>
                <span className="text-white font-medium text-sm">Configurações</span>
            </div>

            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-[#1C2220]">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Configuração do Evento</h1>
                    <p className="text-slate-400 mt-1 text-sm font-medium">Gerencie configurações de rastreamento offline, regras e permissões de staff.</p>
                    <div className="mt-3 flex items-center gap-2">
                        <span className="px-2 py-1 bg-[#1A201E] text-slate-400 border border-[#1C2220] rounded text-xs font-mono">
                            Registrado em: 01/03/2026, 16:58:14
                        </span>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-xs font-bold uppercase tracking-wider">
                        STATUS: EM BREVE
                    </span>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">

                {/* Left Column - Main Forms */}
                <div className="lg:col-span-2 space-y-6">

                    {/* General Info */}
                    <div className="bg-[#121615] p-6 lg:p-8 rounded-3xl shadow-lg border border-[#1C2220]">
                        <h2 className="text-xl font-bold text-white mb-6 border-b border-[#1C2220] pb-4 flex items-center gap-2">
                            <FileText size={20} className="text-emerald-400" /> Detalhes Básicos
                        </h2>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-slate-300 mb-2">Nome do Evento *</label>
                                <input
                                    required
                                    type="text"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    className="w-full px-4 py-3 bg-[#0A0C0B] border border-[#1C2220] rounded-xl text-white focus:border-emerald-500 transition-colors outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-300 mb-2">Descrição do Evento</label>
                                <textarea
                                    rows={3}
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                    className="w-full px-4 py-3 bg-[#0A0C0B] border border-[#1C2220] rounded-xl text-white focus:border-emerald-500 transition-colors outline-none resize-none"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-slate-300 mb-2 flex items-center gap-2">
                                        <MapPin size={16} className="text-slate-400" /> Localização
                                    </label>
                                    <input
                                        type="text"
                                        value={location}
                                        onChange={e => setLocation(e.target.value)}
                                        className="w-full px-4 py-3 bg-[#0A0C0B] border border-[#1C2220] rounded-xl text-white focus:border-emerald-500 transition-colors outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-300 mb-2 flex items-center gap-2">
                                        <ImageIcon size={16} className="text-slate-400" /> Foto de Capa
                                    </label>
                                    <div className="flex bg-[#0A0C0B] border border-[#1C2220] rounded-xl overflow-hidden focus-within:border-emerald-500">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="w-full px-4 py-2.5 text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#1A201E] file:text-emerald-400 cursor-pointer"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-[#1C2220] flex justify-end">
                                <button type="button" onClick={handleSaveRules} className="px-6 py-2.5 bg-[#1A201E] text-slate-300 border border-[#1C2220] font-bold rounded-xl hover:bg-[#0A0C0B] hover:text-white transition-colors">
                                    Atualizar Detalhes
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Tracking Rules */}
                    <div className="bg-[#121615] p-6 lg:p-8 rounded-3xl shadow-lg border border-[#1C2220]">
                        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                            <Settings size={20} className="text-emerald-400" />
                            Regras de Rastreamento
                        </h2>

                        <div className="space-y-6">
                            <div className="flex flex-col p-5 bg-[#0A0C0B] rounded-2xl border border-[#1C2220] transition-all mb-4">
                                <div className="flex items-center justify-between">
                                    <div className="pr-4">
                                        <h4 className="font-bold text-white flex items-center gap-2">
                                            Sistema de Regularidade (Enduro a Pé)
                                            <span className="bg-amber-500/10 text-amber-500 text-[10px] px-2 py-0.5 rounded uppercase font-black tracking-wider border border-amber-500/20">Novo</span>
                                        </h4>
                                        <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                                            Equipes começam com 10.000 pontos e recebem <strong>penalidades cumulativas</strong> (perdem pontos) a cada segundo ou minuto adiantado ou atrasado do seu <strong>Tempo Ideal</strong> no cronograma de largada.
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setIsRegularityMode(!isRegularityMode)}
                                        className={`w-12 h-6 shrink-0 rounded-full transition-colors relative flex items-center ${isRegularityMode ? 'bg-amber-400' : 'bg-slate-700'}`}
                                    >
                                        <div className={`w-4 h-4 rounded-full bg-white absolute transition-transform ${isRegularityMode ? 'translate-x-7' : 'translate-x-1'}`}></div>
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-slate-300 mb-2">Intervalo de Largada</label>
                                    <p className="text-xs text-slate-500 mb-3">Atraso entre as largadas das equipes (minutos).</p>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            value={teamsIntervalMinutes}
                                            onChange={e => setTeamsIntervalMinutes(Number(e.target.value))}
                                            className="w-full px-4 py-3 bg-[#0A0C0B] border border-[#1C2220] rounded-xl text-white font-mono focus:border-emerald-500 transition-colors outline-none"
                                        />
                                        <span className="absolute right-4 top-3.5 text-xs font-bold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded">MINS</span>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-300 mb-2">Total de Checkpoints</label>
                                    <p className="text-xs text-slate-500 mb-3">Excluindo pontos de Início e Fim.</p>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            value={checkpointsCount}
                                            onChange={e => setCheckpointsCount(Number(e.target.value))}
                                            className="w-full px-4 py-3 bg-[#0A0C0B] border border-[#1C2220] rounded-xl text-white font-mono focus:border-emerald-500 transition-colors outline-none"
                                        />
                                        <span className="absolute right-4 top-3.5 text-xs font-bold text-slate-500 bg-[#1A201E] px-2 py-0.5 rounded border border-[#1C2220]">PTS</span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-slate-300 mb-2">Data de Início do Evento</label>
                                    <input
                                        type="datetime-local"
                                        value={startDate}
                                        onChange={e => setStartDate(e.target.value)}
                                        className="w-full px-4 py-3 bg-[#0A0C0B] border border-[#1C2220] rounded-xl text-white font-mono text-sm focus:border-emerald-500 transition-colors outline-none [&::-webkit-calendar-picker-indicator]:filter-[invert(1)]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-300 mb-2">Data de Término do Evento</label>
                                    <input
                                        type="datetime-local"
                                        value={endDate}
                                        onChange={e => setEndDate(e.target.value)}
                                        className="w-full px-4 py-3 bg-[#0A0C0B] border border-[#1C2220] rounded-xl text-white font-mono text-sm focus:border-emerald-500 transition-colors outline-none [&::-webkit-calendar-picker-indicator]:filter-[invert(1)]"
                                    />
                                </div>
                            </div>

                            <div className="pt-4 border-t border-[#1C2220] flex justify-end">
                                <button
                                    onClick={handleSaveRules}
                                    className="px-6 py-2.5 bg-emerald-500 text-[#0A0C0B] font-bold rounded-xl hover:bg-emerald-400 transition-colors shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                                >
                                    Salvar Configuração
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Event Features & Toggles */}
                    <div className="bg-[#121615] p-6 lg:p-8 rounded-3xl shadow-lg border border-[#1C2220]">
                        <h2 className="text-xl font-bold text-white mb-6 border-b border-[#1C2220] pb-4 flex items-center gap-2">
                            <ToggleRight size={20} className="text-[#A5B4FC]" /> Regras & Recursos do Evento
                        </h2>

                        <div className="space-y-5">
                            <div className="flex items-center justify-between p-4 bg-[#0A0C0B] rounded-2xl border border-[#1C2220]">
                                <div>
                                    <h4 className="font-bold text-white">Aberto para Inscrições</h4>
                                    <p className="text-xs text-slate-500">Permitir que as equipes se inscrevam imediatamente.</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setIsRegistrationOpen(!isRegistrationOpen)}
                                    className={`w-12 h-6 shrink-0 rounded-full transition-colors relative flex items-center ${isRegistrationOpen ? 'bg-emerald-500' : 'bg-slate-700'}`}
                                >
                                    <div className={`w-4 h-4 rounded-full bg-white absolute transition-transform ${isRegistrationOpen ? 'translate-x-7' : 'translate-x-1'}`}></div>
                                </button>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-[#0A0C0B] rounded-2xl border border-[#1C2220]">
                                <div>
                                    <h4 className="font-bold text-white">Motor de Rastreamento & Penalidades</h4>
                                    <p className="text-xs text-slate-500">Ativar GPS, Tempos Ideais, Checkpoints e Quadro de Resultados.</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setIsTracking(!isTracking)}
                                    className={`w-12 h-6 shrink-0 rounded-full transition-colors relative flex items-center ${isTracking ? 'bg-[#A5B4FC]' : 'bg-slate-700'}`}
                                >
                                    <div className={`w-4 h-4 rounded-full bg-white absolute transition-transform ${isTracking ? 'translate-x-7' : 'translate-x-1'}`}></div>
                                </button>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-[#0A0C0B] rounded-2xl border border-[#1C2220]">
                                <div>
                                    <h4 className="font-bold text-white">Atividades Extras</h4>
                                    <p className="text-xs text-slate-500">Permitir a criação de tarefas bônus fora da rota de rastreamento.</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setHasExtraActivities(!hasExtraActivities)}
                                    className={`w-12 h-6 shrink-0 rounded-full transition-colors relative flex items-center ${hasExtraActivities ? 'bg-amber-500' : 'bg-slate-700'}`}
                                >
                                    <div className={`w-4 h-4 rounded-full bg-white absolute transition-transform ${hasExtraActivities ? 'translate-x-7' : 'translate-x-1'}`}></div>
                                </button>
                            </div>

                            <div className="flex flex-col p-4 bg-[#0A0C0B] rounded-2xl border border-[#1C2220] transition-all">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="font-bold text-white">Limitar Capacidade de Equipes</h4>
                                        <p className="text-xs text-slate-500">Impedir novas inscrições após atingir um teto de vagas para equipes.</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setLimitCapacity(!limitCapacity)}
                                        className={`w-12 h-6 shrink-0 rounded-full transition-colors relative flex items-center ${limitCapacity ? 'bg-[#CFF073]' : 'bg-slate-700'}`}
                                    >
                                        <div className={`w-4 h-4 rounded-full bg-white absolute transition-transform ${limitCapacity ? 'translate-x-7' : 'translate-x-1'}`}></div>
                                    </button>
                                </div>
                                {limitCapacity && (
                                    <div className="mt-4 pt-4 border-t border-[#1C2220] animate-in slide-in-from-top-2 duration-300">
                                        <label className="block text-xs font-bold text-slate-400 mb-2 uppercase">Máximo de Equipes Aceitas</label>
                                        <input
                                            type="number"
                                            value={maxTeams}
                                            onChange={e => setMaxTeams(Number(e.target.value))}
                                            className="w-full px-4 py-2 bg-[#121615] border border-[#1C2220] rounded-xl text-white focus:border-[#CFF073] transition-colors outline-none"
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-col p-4 bg-[#0A0C0B] rounded-2xl border border-[#1C2220] transition-all">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="font-bold text-white">Limitar Tamanho das Equipes</h4>
                                        <p className="text-xs text-slate-500">Definir máximo e mínimo de integrantes para compor uma equipe (permite equipes reduzidas).</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setLimitTeamSize(!limitTeamSize)}
                                        className={`w-12 h-6 shrink-0 rounded-full transition-colors relative flex items-center ${limitTeamSize ? 'bg-[#CFF073]' : 'bg-slate-700'}`}
                                    >
                                        <div className={`w-4 h-4 rounded-full bg-white absolute transition-transform ${limitTeamSize ? 'translate-x-7' : 'translate-x-1'}`}></div>
                                    </button>
                                </div>
                                {limitTeamSize && (
                                    <div className="mt-4 pt-4 border-t border-[#1C2220] grid grid-cols-2 gap-4 animate-in slide-in-from-top-2 duration-300">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-400 mb-2 uppercase">Mínimo de Pessoas</label>
                                            <input
                                                type="number"
                                                value={minTeamSize}
                                                onChange={e => setMinTeamSize(Number(e.target.value))}
                                                className="w-full px-4 py-2 bg-[#121615] border border-[#1C2220] rounded-xl text-white focus:border-[#CFF073] transition-colors outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-400 mb-2 uppercase">Máximo de Pessoas</label>
                                            <input
                                                type="number"
                                                value={maxTeamSize}
                                                onChange={e => setMaxTeamSize(Number(e.target.value))}
                                                className="w-full px-4 py-2 bg-[#121615] border border-[#1C2220] rounded-xl text-white focus:border-[#CFF073] transition-colors outline-none"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-col p-4 bg-[#0A0C0B] rounded-2xl border border-[#1C2220] transition-all">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="font-bold text-white">Emitir Certificados</h4>
                                        <p className="text-xs text-slate-500">Gerar automaticamente certificados PDF/Word para os participantes.</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setHasCertificate(!hasCertificate)}
                                        className={`w-12 h-6 shrink-0 rounded-full transition-colors relative flex items-center ${hasCertificate ? 'bg-rose-400' : 'bg-slate-700'}`}
                                    >
                                        <div className={`w-4 h-4 rounded-full bg-white absolute transition-transform ${hasCertificate ? 'translate-x-7' : 'translate-x-1'}`}></div>
                                    </button>
                                </div>

                                {hasCertificate && (
                                    <div className="mt-4 pt-4 border-t border-[#1C2220] animate-in slide-in-from-top-2 duration-300">
                                        <label className="block text-sm font-bold text-rose-400 mb-2 flex items-center gap-2">
                                            <FileUp size={16} /> Enviar Documento Word (.docx)
                                        </label>
                                        <p className="text-xs text-slate-400 mb-3 leading-relaxed">
                                            Forneça um modelo do Microsoft Word. Certifique-se de que o documento contém exatamente estas variáveis para serem preenchidas automaticamente pelo sistema:
                                            <br />
                                            <span className="inline-block mt-2 font-mono text-[10px] bg-[#1A201E] text-rose-300 px-2 py-1 rounded border border-[#1C2220]">
                                                &#123;&#123;nome_participante&#125;&#125;
                                            </span>
                                            <span className="inline-block mt-2 ml-2 font-mono text-[10px] bg-[#1A201E] text-rose-300 px-2 py-1 rounded border border-[#1C2220]">
                                                &#123;&#123;evento_nome&#125;&#125;
                                            </span>
                                            <span className="inline-block mt-2 ml-2 font-mono text-[10px] bg-[#1A201E] text-rose-300 px-2 py-1 rounded border border-[#1C2220]">
                                                &#123;&#123;data_realizado&#125;&#125;
                                            </span>
                                            <span className="inline-block mt-2 ml-2 font-mono text-[10px] bg-[#1A201E] text-rose-300 px-2 py-1 rounded border border-[#1C2220]">
                                                &#123;&#123;tempo_oficial&#125;&#125;
                                            </span>
                                        </p>
                                        <div className="flex bg-[#121615] border border-[#1C2220] rounded-xl overflow-hidden focus-within:border-rose-400 p-1">
                                            <input
                                                type="file"
                                                accept=".docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                                                onChange={handleFileChange}
                                                className="w-full px-4 py-2 text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-rose-400/10 file:text-rose-400 hover:file:bg-rose-400/20 cursor-pointer"
                                            />
                                        </div>
                                        {certificateFile && (
                                            <p className="text-xs text-emerald-400 font-bold mt-2 ml-1">Modelo selecionado: {certificateFile.name}</p>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="pt-2 flex justify-end">
                                <button
                                    onClick={handleSaveRules}
                                    className="px-6 py-2.5 bg-[#1A201E] text-slate-300 border border-[#1C2220] font-bold rounded-xl hover:bg-[#0A0C0B] hover:text-white transition-colors"
                                >
                                    Atualizar Recursos
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Roles & Permissions */}
                    <div className="bg-[#121615] p-6 lg:p-8 rounded-3xl shadow-lg border border-[#1C2220]">
                        <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                            <ShieldAlert size={20} className="text-[#A5B4FC]" />
                            Funções & Permissões
                        </h2>
                        <p className="text-sm text-slate-400 mb-6 max-w-md">Crie funções baseadas em bitmask para delegar poderes de gerenciamento aos membros do seu staff para sincronizações offline e check-ins.</p>

                        <div className="space-y-4">
                            {roles.length === 0 ? (
                                <div className="text-center py-6 bg-[#0A0C0B] rounded-2xl border border-[#1C2220]">
                                    <p className="text-slate-400 text-sm">Nenhuma função configurada.</p>
                                </div>
                            ) : (
                                roles.map((role) => (
                                    <div key={role.id} className="flex justify-between items-center p-5 bg-[#0A0C0B] rounded-2xl border border-[#1C2220] hover:border-[#4F46E5]/50 transition-colors group/role">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-[#1A201E] border border-[#1C2220] flex items-center justify-center group-hover/role:bg-[#4F46E5]/10 group-hover/role:border-[#4F46E5]/30 transition-colors">
                                                <span className="font-black text-white text-lg">{role.name.charAt(0).toUpperCase()}</span>
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-white text-lg">{role.name}</h3>
                                                <div className="mt-1 flex gap-2">
                                                    <span className="text-[10px] font-bold text-slate-500 bg-[#1A201E] border border-[#1C2220] px-2 py-0.5 rounded">BITMASK: {role.permissions}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <Link href={`/trekkings/${eventId}/moderators/${role.id}`} className="px-5 py-2 bg-[#121615] border border-[#1C2220] rounded-xl text-slate-300 font-bold text-sm hover:text-white transition-colors">Gerenciar</Link>
                                    </div>
                                ))
                            )}
                        </div>

                        <Link href={`/trekkings/${eventId}/moderators/new`} className="w-full mt-6 py-4 border border-dashed border-[#1C2220] rounded-2xl text-slate-400 font-bold hover:text-white hover:border-[#4F46E5]/50 hover:bg-[#4F46E5]/5 transition-all flex items-center justify-center">
                            + Criar Nova Função de Staff
                        </Link>
                    </div>

                </div>

                {/* Right Column - Navigation Widgets */}
                <div className="space-y-6">

                    {/* Extra Activities Widget */}
                    <div className="bg-[#121615] p-6 rounded-3xl shadow-lg border border-[#1C2220] flex flex-col items-center text-center">
                        <div className="w-12 h-12 rounded-full bg-rose-500/10 flex items-center justify-center mb-4">
                            <Zap size={20} className="text-rose-400" />
                        </div>
                        <h3 className="font-bold text-white text-lg mb-1">Atividades Extras</h3>
                        <p className="text-xs text-slate-500 mb-6">Criar tarefas fora da rota.</p>
                        <Link href={`/trekkings/${eventId}/activities`} className="w-full py-2.5 bg-[#1A201E] border border-[#1C2220] rounded-xl text-white font-bold text-sm hover:bg-[#0A0C0B] transition-colors">
                            Gerenciar Tarefas
                        </Link>
                    </div>

                    {/* Ideal Times Widget */}
                    <div className="bg-[#121615] p-6 rounded-3xl shadow-lg border border-[#1C2220] flex flex-col items-center text-center">
                        <div className="w-12 h-12 rounded-full bg-[#A5B4FC]/10 flex items-center justify-center mb-4">
                            <Clock size={20} className="text-[#A5B4FC]" />
                        </div>
                        <h3 className="font-bold text-white text-lg mb-1">Tempos Ideais & QR Codes</h3>
                        <p className="text-xs text-slate-500 mb-6 px-4">Planilha de alvos por equipe e hashes de alvos físicos.</p>
                        <Link href={`/trekkings/${eventId}/ideal-times`} className="w-full py-2.5 bg-[#1A201E] border border-[#1C2220] rounded-xl text-white font-bold text-sm hover:bg-[#0A0C0B] transition-colors">
                            Abrir Planejador
                        </Link>
                    </div>

                    {/* Certificate Studio Widget */}
                    <div className="bg-[#121615] p-6 rounded-3xl shadow-lg border border-[#1C2220] flex flex-col items-center text-center">
                        <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center mb-4">
                            <FileCheck size={20} className="text-amber-500" />
                        </div>
                        <h3 className="font-bold text-white text-lg mb-1">Estúdio de Certificados</h3>
                        <p className="text-xs text-slate-500 mb-6">Projetar modelos de conclusão.</p>
                        <Link href={`/trekkings/${eventId}/certificates`} className="w-full py-2.5 bg-[#1A201E] border border-[#1C2220] rounded-xl text-white font-bold text-sm hover:bg-[#0A0C0B] transition-colors">
                            Abrir Estúdio
                        </Link>
                    </div>

                </div>
            </div>
        </div>
    );
}
