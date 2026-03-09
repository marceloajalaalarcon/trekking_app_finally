'use client';

import { Calendar, ChevronLeft, ChevronRight, MapPin } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function CalendarPage() {
    const [events, setEvents] = useState<any[]>([]);

    // Start with current date, but maybe default to the next upcoming event data
    const [currentDate, setCurrentDate] = useState(() => new Date());

    useEffect(() => {
        fetch('http://localhost:3333/trekkings')
            .then(res => res.json())
            .then(data => setEvents(data))
            .catch(err => console.error("Failed to fetch events", err));
    }, []);

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();

    const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

    const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
    const handleNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

    // Fill blanks for the first week
    const blanks = Array.from({ length: firstDayOfMonth }, (_, i) => i);
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    return (
        <div className="space-y-6 fade-in max-w-[1400px] mx-auto pb-6 h-full flex flex-col">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-[#1C2220]">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Calendário Global</h1>
                    <p className="text-slate-400 mt-1 text-sm font-medium">Visualize todos os eventos de rastreamento programados em toda a plataforma.</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={handlePrevMonth} className="px-3 py-2 bg-[#121615] border border-[#1C2220] rounded-lg text-slate-300 hover:text-white transition-colors">
                        <ChevronLeft size={16} />
                    </button>
                    <button className="px-4 py-2 bg-[#1A201E] text-white font-bold rounded-lg pointer-events-none capitalize">
                        {monthNames[month]} de {year}
                    </button>
                    <button onClick={handleNextMonth} className="px-3 py-2 bg-[#121615] border border-[#1C2220] rounded-lg text-slate-300 hover:text-white transition-colors">
                        <ChevronRight size={16} />
                    </button>
                </div>
            </header>

            <div className="flex-1 bg-[#121615] rounded-3xl border border-[#1C2220] overflow-hidden flex flex-col shadow-lg">
                <div className="grid grid-cols-7 border-b border-[#1C2220] bg-[#151917]">
                    {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
                        <div key={day} className="py-2 sm:py-4 text-center text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-widest border-r border-[#1C2220] last:border-0">
                            {day}
                        </div>
                    ))}
                </div>

                <div className="flex-1 grid grid-cols-7 auto-rows-fr">
                    {blanks.map((b) => (
                        <div key={`blank-${b}`} className="p-2 border-r border-b border-[#1C2220]/50 bg-[#0A0C0B]/30 min-h-[100px] sm:min-h-[120px]"></div>
                    ))}

                    {days.map((day) => {
                        const dayEvents = events.filter(e => {
                            if (!e.start_date) return false;
                            const d = new Date(e.start_date);
                            return d.getDate() === day && d.getMonth() === month && d.getFullYear() === year;
                        });

                        const isToday = new Date().getDate() === day && new Date().getMonth() === month && new Date().getFullYear() === year;

                        return (
                            <div key={day} className={`p-2 border-r border-b border-[#1C2220]/50 relative min-h-[100px] sm:min-h-[120px] hover:bg-[#1A201E]/50 transition-colors ${isToday ? 'bg-[#4F46E5]/10' : ''}`}>
                                <span className={`text-xs sm:text-sm font-medium ${isToday ? 'text-[#A5B4FC] font-bold' : 'text-slate-400'}`}>
                                    {day}
                                </span>

                                <div className="mt-2 space-y-1">
                                    {dayEvents.map(evt => (
                                        <div key={evt.id} className="text-[9px] sm:text-[10px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-1 sm:px-2 py-1 sm:py-1.5 rounded-md truncate cursor-pointer hover:bg-emerald-500/20 transition-colors font-semibold" title={evt.name}>
                                            {evt.name}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
