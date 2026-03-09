'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ArrowLeft, Save, Image as ImageIcon, MapPin, Calendar, FileText, ToggleLeft, ToggleRight, FileUp } from 'lucide-react';

export default function NewEventPage() {
    const router = useRouter();
    const [saving, setSaving] = useState(false);

    // Form fields
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [location, setLocation] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    // Toggles
    const [isRegistrationOpen, setIsRegistrationOpen] = useState(false);
    const [isTracking, setIsTracking] = useState(true);
    const [hasExtraActivities, setHasExtraActivities] = useState(false);

    // Certificate
    const [hasCertificate, setHasCertificate] = useState(false);
    const [certificateFile, setCertificateFile] = useState<File | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setCertificateFile(e.target.files[0]);
        }
    };

    const handleCreateEvent = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            // In a real scenario, we would use FormData to upload the image and certificate document.
            // For now, mocking the standard event configuration save JSON.
            const res = await fetch('http://localhost:3333/trekkings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: name || 'Novo Evento',
                    description,
                    location,
                    checkpoints_count: 5,
                    teams_start_interval: 120,
                    start_date: startDate ? new Date(startDate).toISOString() : undefined,
                    end_date: endDate ? new Date(endDate).toISOString() : undefined,
                    is_registration_open: isRegistrationOpen,
                    is_tracking: isTracking,
                    has_extra_activities: hasExtraActivities
                })
            });
            const savedEvent = await res.json();

            if (savedEvent.id) {
                router.push(`/trekkings/${savedEvent.id}`); // Redirects to the new Analytical Dashboard
            } else {
                alert('Erro ao criar evento.');
            }
        } catch (error) {
            console.error(error);
            alert('Falha ao salvar o evento.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-6 fade-in max-w-[1000px] mx-auto pb-12">
            <div className="flex items-center gap-3 mb-2">
                <Link href="/trekkings/list" className="w-8 h-8 rounded-full bg-[#121615] border border-[#1C2220] flex items-center justify-center text-slate-400 hover:text-white transition-colors">
                    <ArrowLeft size={16} />
                </Link>
                <span className="text-slate-500 font-medium text-sm">/ Events /</span>
                <span className="text-white font-medium text-sm">Criar Evento de Organizador</span>
            </div>

            <header className="pb-4 border-b border-[#1C2220]">
                <h1 className="text-3xl font-bold text-white tracking-tight">Criar Novo Evento</h1>
                <p className="text-slate-400 mt-1 text-sm font-medium">Defina o escopo, datas e recursos do seu evento.</p>
            </header>

            <form onSubmit={handleCreateEvent} className="space-y-8 mt-6">
                {/* General Info */}
                <div className="bg-[#121615] p-8 rounded-3xl shadow-lg border border-[#1C2220]">
                    <h2 className="text-xl font-bold text-white mb-6 border-b border-[#1C2220] pb-4 flex items-center gap-2">
                        <FileText size={20} className="text-emerald-400" /> Detalhes Básicos
                    </h2>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-slate-300 mb-2">Nome do Evento *</label>
                            <input
                                required
                                type="text"
                                placeholder="ex. Enduro Master 2026"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                className="w-full px-4 py-3 bg-[#0A0C0B] border border-[#1C2220] rounded-xl text-white focus:border-emerald-500 transition-colors outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-300 mb-2">Descrição do Evento</label>
                            <textarea
                                rows={3}
                                placeholder="Breve visão geral da competição..."
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
                                    placeholder="Cidade, Estado"
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

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-slate-300 mb-2 flex items-center gap-2">
                                    <Calendar size={16} className="text-slate-400" /> Data e Hora de Início
                                </label>
                                <input
                                    type="datetime-local"
                                    value={startDate}
                                    onChange={e => setStartDate(e.target.value)}
                                    className="w-full px-4 py-3 bg-[#0A0C0B] border border-[#1C2220] rounded-xl text-white font-mono text-sm focus:border-emerald-500 transition-all outline-none [&::-webkit-calendar-picker-indicator]:filter-[invert(1)]"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-300 mb-2 flex items-center gap-2">
                                    <Calendar size={16} className="text-slate-400" /> Data e Hora de Término
                                </label>
                                <input
                                    type="datetime-local"
                                    value={endDate}
                                    onChange={e => setEndDate(e.target.value)}
                                    className="w-full px-4 py-3 bg-[#0A0C0B] border border-[#1C2220] rounded-xl text-white font-mono text-sm focus:border-emerald-500 transition-all outline-none [&::-webkit-calendar-picker-indicator]:filter-[invert(1)]"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Event Features & Toggles */}
                <div className="bg-[#121615] p-8 rounded-3xl shadow-lg border border-[#1C2220]">
                    <h2 className="text-xl font-bold text-white mb-6 border-b border-[#1C2220] pb-4 flex items-center gap-2">
                        <ToggleRight size={20} className="text-[#A5B4FC]" /> Regras e Recursos do Evento
                    </h2>

                    <div className="space-y-5">
                        <div className="flex items-center justify-between p-4 bg-[#0A0C0B] rounded-2xl border border-[#1C2220]">
                            <div>
                                <h4 className="font-bold text-white">Aberto para Inscrições</h4>
                                <p className="text-xs text-slate-500">Permitir que as equipes se inscrevam imediatamente após a criação.</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsRegistrationOpen(!isRegistrationOpen)}
                                className={`w-12 h-6 rounded-full transition-colors relative flex items-center ${isRegistrationOpen ? 'bg-emerald-500' : 'bg-slate-700'}`}
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
                                className={`w-12 h-6 rounded-full transition-colors relative flex items-center ${isTracking ? 'bg-[#A5B4FC]' : 'bg-slate-700'}`}
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
                                className={`w-12 h-6 rounded-full transition-colors relative flex items-center ${hasExtraActivities ? 'bg-amber-500' : 'bg-slate-700'}`}
                            >
                                <div className={`w-4 h-4 rounded-full bg-white absolute transition-transform ${hasExtraActivities ? 'translate-x-7' : 'translate-x-1'}`}></div>
                            </button>
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
                                    className={`w-12 h-6 rounded-full transition-colors relative flex items-center ${hasCertificate ? 'bg-rose-400' : 'bg-slate-700'}`}
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
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                    <Link href="/trekkings/list" className="px-6 py-3.5 bg-[#121615] text-slate-300 border border-[#1C2220] font-bold rounded-xl hover:bg-[#1A201E] hover:text-white transition-colors">
                        Cancelar
                    </Link>
                    <button
                        type="submit"
                        disabled={saving}
                        className="flex items-center gap-2 px-8 py-3.5 bg-emerald-500 text-[#0A0C0B] border border-emerald-400 font-bold rounded-xl hover:bg-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all disabled:opacity-50"
                    >
                        {saving ? 'Criando Evento...' : <><Save size={18} /> Publicar Novo Evento</>}
                    </button>
                </div>
            </form>
        </div>
    );
}
