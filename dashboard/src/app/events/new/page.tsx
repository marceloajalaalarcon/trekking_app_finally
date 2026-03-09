'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Users } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';

export default function NewEventPage() {
    const { authFetch } = useAuth();
    const router = useRouter();
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [form, setForm] = useState({
        name: '',
        description: '',
        location: '',
        date: '',
        end_date: '',
        max_participants: '',
        has_certificate: false,
        is_group_event: false,
        min_group_size: '',
        max_group_size: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSaving(true);
        try {
            const payload: any = {
                name: form.name,
                description: form.description || null,
                location: form.location || null,
                date: form.date || null,
                end_date: form.end_date || null,
                max_participants: form.max_participants ? parseInt(form.max_participants) : null,
                has_certificate: form.has_certificate,
                is_group_event: form.is_group_event,
                min_group_size: form.is_group_event && form.min_group_size ? parseInt(form.min_group_size) : null,
                max_group_size: form.is_group_event && form.max_group_size ? parseInt(form.max_group_size) : null,
            };

            const res = await authFetch('http://localhost:3333/events-standard', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                const data = await res.json();
                router.push(`/events/${data.id}`);
            } else {
                const errData = await res.json();
                setError(errData.message || 'Erro ao criar evento');
            }
        } catch (err) {
            console.error(err);
            setError('Falha na conexão com o servidor');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-6 fade-in max-w-2xl mx-auto pb-6">
            <div className="flex items-center gap-3 mb-2">
                <Link href="/events" className="w-8 h-8 rounded-full bg-[#121615] border border-[#1C2220] flex items-center justify-center text-slate-400 hover:text-white transition-colors">
                    <ArrowLeft size={16} />
                </Link>
                <span className="text-slate-500 font-medium text-sm">/ Eventos /</span>
                <span className="text-white font-medium text-sm">Novo Evento</span>
            </div>

            <header className="pb-4 border-b border-[#1C2220]">
                <h1 className="text-3xl font-black text-white tracking-tight">Criar Novo Evento</h1>
                <p className="text-slate-400 mt-1 text-sm">Preencha as informações do seu evento.</p>
            </header>

            {error && (
                <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 px-4 py-3 rounded-xl text-sm font-bold">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Informações Básicas */}
                <div className="bg-[#121615] border border-[#1C2220] rounded-3xl p-6 space-y-5">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Informações Básicas</h3>

                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Nome do Evento *</label>
                        <input required type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full bg-[#0A0C0B] border border-[#1C2220] rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500 transition-colors" placeholder="Workshop de UX Design" />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Descrição</label>
                        <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} className="w-full bg-[#0A0C0B] border border-[#1C2220] rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500 transition-colors resize-none" placeholder="Uma breve descrição do seu evento..." />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Local</label>
                            <input type="text" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} className="w-full bg-[#0A0C0B] border border-[#1C2220] rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500 transition-colors" placeholder="Sao Paulo, SP" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Max Participantes</label>
                            <input type="number" value={form.max_participants} onChange={e => setForm({ ...form, max_participants: e.target.value })} className="w-full bg-[#0A0C0B] border border-[#1C2220] rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500 transition-colors" placeholder="100" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Data Início</label>
                            <input type="datetime-local" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} className="w-full bg-[#0A0C0B] border border-[#1C2220] rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500 transition-colors" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Data Fim</label>
                            <input type="datetime-local" value={form.end_date} onChange={e => setForm({ ...form, end_date: e.target.value })} className="w-full bg-[#0A0C0B] border border-[#1C2220] rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500 transition-colors" />
                        </div>
                    </div>
                </div>

                {/* Configurações do Evento */}
                <div className="bg-[#121615] border border-[#1C2220] rounded-3xl p-6 space-y-5">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Configurações do Evento</h3>

                    {/* Certificado */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h4 className="font-bold text-white">Emitir Certificado</h4>
                            <p className="text-xs text-slate-400 mt-0.5">Gerar certificados de participação ao final do evento.</p>
                        </div>
                        <button type="button" onClick={() => setForm({ ...form, has_certificate: !form.has_certificate })} className={`w-12 h-6 shrink-0 rounded-full transition-colors relative ${form.has_certificate ? 'bg-blue-500' : 'bg-slate-700'}`}>
                            <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${form.has_certificate ? 'translate-x-7' : 'translate-x-1'}`} />
                        </button>
                    </div>

                    {/* Grupo ou Individual */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h4 className="font-bold text-white">Evento em Grupo</h4>
                            <p className="text-xs text-slate-400 mt-0.5">Participantes se inscrevem em grupos ao invés de individualmente.</p>
                        </div>
                        <button type="button" onClick={() => setForm({ ...form, is_group_event: !form.is_group_event })} className={`w-12 h-6 shrink-0 rounded-full transition-colors relative ${form.is_group_event ? 'bg-blue-500' : 'bg-slate-700'}`}>
                            <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${form.is_group_event ? 'translate-x-7' : 'translate-x-1'}`} />
                        </button>
                    </div>

                    {/* Tamanho do Grupo (só aparece se is_group_event) */}
                    {form.is_group_event && (
                        <div className="grid grid-cols-2 gap-4 p-4 bg-[#0A0C0B] rounded-xl border border-[#1C2220]">
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                                    <Users size={12} className="inline mr-1" />Min. por Grupo
                                </label>
                                <input type="number" min={2} value={form.min_group_size} onChange={e => setForm({ ...form, min_group_size: e.target.value })} className="w-full bg-[#121615] border border-[#1C2220] rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500 transition-colors" placeholder="2" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                                    <Users size={12} className="inline mr-1" />Max. por Grupo
                                </label>
                                <input type="number" min={2} value={form.max_group_size} onChange={e => setForm({ ...form, max_group_size: e.target.value })} className="w-full bg-[#121615] border border-[#1C2220] rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500 transition-colors" placeholder="5" />
                            </div>
                        </div>
                    )}
                </div>

                <button type="submit" disabled={saving} className="w-full flex items-center justify-center gap-2 py-4 bg-blue-500 hover:bg-blue-400 text-white rounded-xl font-black transition-all disabled:opacity-50">
                    {saving ? 'Criando...' : <><Save size={18} /> Criar Evento</>}
                </button>
            </form>
        </div>
    );
}
