'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Trash2 } from 'lucide-react';
import { useAuth } from '../../../../contexts/AuthContext';

export default function EventSettingsPage() {
    const params = useParams();
    const eventId = params.id as string;
    const { authFetch } = useAuth();
    const router = useRouter();
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [event, setEvent] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        authFetch(`http://localhost:3333/events-standard/${eventId}`)
            .then(res => res.json())
            .then(data => { setEvent(data); setLoading(false); })
            .catch(err => { console.error(err); setLoading(false); });
    }, [eventId]);

    const handleSave = async () => {
        setSaving(true);
        try {
            await authFetch(`http://localhost:3333/events-standard/${eventId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: event.name,
                    description: event.description,
                    location: event.location,
                    date: event.date,
                    end_date: event.end_date,
                    max_participants: event.max_participants,
                    is_active: event.is_active,
                    is_registration_open: event.is_registration_open,
                }),
            });
        } catch (err) {
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        const confirmed = window.confirm('Tem certeza que deseja excluir este evento? Esta ação é irreversível e todos os dados serão perdidos.');
        if (!confirmed) return;

        setDeleting(true);
        try {
            const res = await authFetch(`http://localhost:3333/events-standard/${eventId}`, {
                method: 'DELETE',
            });
            if (res.ok) {
                router.push('/events');
            } else {
                alert('Erro ao excluir evento. Tente novamente.');
            }
        } catch (err) {
            console.error(err);
            alert('Falha na conexão.');
        } finally {
            setDeleting(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-slate-400">Carregando...</div>;
    if (!event) return null;

    return (
        <div className="space-y-6 fade-in max-w-2xl mx-auto pb-6">
            <div className="flex items-center gap-3 mb-2">
                <Link href={`/events/${eventId}`} className="w-8 h-8 rounded-full bg-[#121615] border border-[#1C2220] flex items-center justify-center text-slate-400 hover:text-white transition-colors">
                    <ArrowLeft size={16} />
                </Link>
                <span className="text-slate-500 font-medium text-sm">/ {event.name} /</span>
                <span className="text-white font-medium text-sm">Configurações</span>
            </div>

            <header className="pb-4 border-b border-[#1C2220]">
                <h1 className="text-3xl font-black text-white tracking-tight">Configurações do Evento</h1>
            </header>

            <div className="bg-[#121615] border border-[#1C2220] rounded-3xl p-6 space-y-5">
                <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Nome do Evento</label>
                    <input type="text" value={event.name} onChange={e => setEvent({ ...event, name: e.target.value })} className="w-full bg-[#0A0C0B] border border-[#1C2220] rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500 transition-colors" />
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Descrição</label>
                    <textarea value={event.description || ''} onChange={e => setEvent({ ...event, description: e.target.value })} rows={3} className="w-full bg-[#0A0C0B] border border-[#1C2220] rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500 transition-colors resize-none" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Início (Data e Hora)</label>
                        <input
                            type="datetime-local"
                            value={event.date ? new Date(new Date(event.date).getTime() - new Date(event.date).getTimezoneOffset() * 60000).toISOString().slice(0, 16) : ''}
                            onChange={e => setEvent({ ...event, date: e.target.value ? new Date(e.target.value).toISOString() : null })}
                            className="w-full bg-[#0A0C0B] border border-[#1C2220] rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500 transition-colors [color-scheme:dark]"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Término (Data e Hora)</label>
                        <input
                            type="datetime-local"
                            value={event.end_date ? new Date(new Date(event.end_date).getTime() - new Date(event.end_date).getTimezoneOffset() * 60000).toISOString().slice(0, 16) : ''}
                            onChange={e => setEvent({ ...event, end_date: e.target.value ? new Date(e.target.value).toISOString() : null })}
                            className="w-full bg-[#0A0C0B] border border-[#1C2220] rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500 transition-colors [color-scheme:dark]"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Local</label>
                        <input type="text" value={event.location || ''} onChange={e => setEvent({ ...event, location: e.target.value })} className="w-full bg-[#0A0C0B] border border-[#1C2220] rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500 transition-colors" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Max Participantes</label>
                        <input type="number" value={event.max_participants || ''} onChange={e => setEvent({ ...event, max_participants: e.target.value ? parseInt(e.target.value) : null })} className="w-full bg-[#0A0C0B] border border-[#1C2220] rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500 transition-colors" />
                    </div>
                </div>

                {/* Toggles */}
                <div className="space-y-4 pt-4 border-t border-[#1C2220]">
                    <div className="flex items-center justify-between">
                        <div>
                            <h4 className="font-bold text-white">Evento Ativo</h4>
                            <p className="text-xs text-slate-400 mt-0.5">Torna o evento visível publicamente.</p>
                        </div>
                        <button type="button" onClick={() => setEvent({ ...event, is_active: !event.is_active })} className={`w-12 h-6 shrink-0 rounded-full transition-colors relative ${event.is_active ? 'bg-blue-500' : 'bg-slate-700'}`}>
                            <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${event.is_active ? 'translate-x-7' : 'translate-x-1'}`} />
                        </button>
                    </div>
                    <div className="flex items-center justify-between">
                        <div>
                            <h4 className="font-bold text-white">Inscrições Abertas</h4>
                            <p className="text-xs text-slate-400 mt-0.5">Permite novos participantes se inscreverem.</p>
                        </div>
                        <button type="button" onClick={() => setEvent({ ...event, is_registration_open: !event.is_registration_open })} className={`w-12 h-6 shrink-0 rounded-full transition-colors relative ${event.is_registration_open ? 'bg-emerald-500' : 'bg-slate-700'}`}>
                            <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${event.is_registration_open ? 'translate-x-7' : 'translate-x-1'}`} />
                        </button>
                    </div>
                </div>
            </div>

            <button onClick={handleSave} disabled={saving} className="w-full flex items-center justify-center gap-2 py-4 bg-blue-500 hover:bg-blue-400 text-white rounded-xl font-black transition-all disabled:opacity-50">
                {saving ? 'Salvando...' : <><Save size={18} /> Salvar Configurações</>}
            </button>

            {/* Danger Zone */}
            <div className="bg-[#121615] border border-rose-500/20 rounded-3xl p-6 mt-8">
                <h3 className="text-lg font-bold text-rose-400 mb-2">Zona de Perigo</h3>
                <p className="text-sm text-slate-400 mb-4">Excluir este evento é uma ação irreversível. Todos os dados, participantes e certificados associados serão perdidos permanentemente.</p>
                <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="flex items-center gap-2 px-6 py-3 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-xl font-bold hover:bg-rose-500 hover:text-white transition-all disabled:opacity-50"
                >
                    <Trash2 size={16} />
                    {deleting ? 'Excluindo...' : 'Excluir Evento Permanentemente'}
                </button>
            </div>
        </div>
    );
}
