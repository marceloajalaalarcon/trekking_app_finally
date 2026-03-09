'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, UserPlus, Search } from 'lucide-react';

export default function EventParticipantsPage() {
    const params = useParams();
    const eventId = params.id as string;

    return (
        <div className="space-y-6 fade-in max-w-[1400px] mx-auto pb-6">
            <div className="flex items-center gap-3 mb-2">
                <Link href={`/events/${eventId}`} className="w-8 h-8 rounded-full bg-[#121615] border border-[#1C2220] flex items-center justify-center text-slate-400 hover:text-white transition-colors">
                    <ArrowLeft size={16} />
                </Link>
                <span className="text-slate-500 font-medium text-sm">/ Evento /</span>
                <span className="text-white font-medium text-sm">Participantes</span>
            </div>

            <header className="flex items-end justify-between pb-4 border-b border-[#1C2220]">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tight">Participantes</h1>
                    <p className="text-slate-400 mt-1 text-sm">Gerencie as inscrições do evento.</p>
                </div>
                <button className="flex items-center gap-2 px-5 py-2.5 bg-blue-500 hover:bg-blue-400 text-white font-bold rounded-xl transition-all">
                    <UserPlus size={18} /> Adicionar Participante
                </button>
            </header>

            {/* Search */}
            <div className="flex items-center bg-[#121615] border border-[#1C2220] rounded-xl px-4 py-3 max-w-md">
                <Search size={18} className="text-slate-500 mr-2" />
                <input type="text" placeholder="Buscar participante por nome ou email..." className="bg-transparent outline-none text-sm text-white w-full placeholder-slate-500" />
            </div>

            {/* Empty State */}
            <div className="bg-[#121615] border border-dashed border-[#1C2220] rounded-3xl p-12 text-center">
                <UserPlus className="mx-auto text-slate-600 mb-4" size={40} />
                <h3 className="text-xl font-bold text-white mb-2">Nenhum participante inscrito</h3>
                <p className="text-slate-500 max-w-sm mx-auto">Abra as inscrições nas configurações ou adicione participantes manualmente.</p>
            </div>
        </div>
    );
}
