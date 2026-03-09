import Link from 'next/link';
import {
    LayoutDashboard,
    Map,
    Users,
    Settings,
    Bell,
    Search,
    CalendarDays,
    Activity,
    Smartphone
} from 'lucide-react';
import { LogoutButton } from './LogoutButton';

export default function EventsLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex h-screen bg-[#0C0F0E] overflow-hidden text-slate-300 font-sans">
            {/* Sidebar - Matching the left panel concept */}
            <aside className="w-[260px] bg-[#121615] border-r border-[#1C2220] flex flex-col justify-between hidden lg:flex z-20 py-6">
                <div>
                    <div className="flex items-center gap-3 px-6 mb-8">
                        <div className="w-8 h-8 rounded-full bg-[#CFF073] flex items-center justify-center shadow-[0_0_15px_rgba(207,240,115,0.2)]">
                            <Activity size={18} className="text-[#0A0C0B]" />
                        </div>
                        <span className="font-bold text-lg text-white">TrekkingCore</span>
                    </div>

                    <div className="px-4">
                        <p className="px-4 text-[10px] font-bold text-slate-500 tracking-wider mb-2">MENU</p>
                        <nav className="space-y-1">
                            <Link href="/trekkings" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-500/10 text-emerald-400 font-medium transition-all group">
                                <LayoutDashboard size={18} className="group-hover:text-emerald-300 transition-colors" />
                                <span>Dashboard</span>
                            </Link>
                            <Link href="/trekkings/list" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-[#1A201E] font-medium transition-all group">
                                <Map size={18} className="group-hover:text-white transition-colors" />
                                <span>Eventos</span>
                            </Link>
                            <Link href="/trekkings/calendar" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-[#1A201E] font-medium transition-all group">
                                <CalendarDays size={18} className="group-hover:text-white transition-colors" />
                                <span>Calendário</span>
                            </Link>

                            <Link href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-[#1A201E] font-medium transition-all group">
                                <Users size={18} className="group-hover:text-white transition-colors" />
                                <span>Equipe</span>
                            </Link>
                        </nav>
                    </div>

                    <div className="px-4 mt-8">
                        <p className="px-4 text-[10px] font-bold text-slate-500 tracking-wider mb-2">GERAL</p>
                        <nav className="space-y-1">
                            <Link href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-[#1A201E] font-medium transition-all group">
                                <Settings size={18} className="group-hover:text-white transition-colors" />
                                <span>Configurações</span>
                            </Link>
                            <LogoutButton />
                        </nav>
                    </div>
                </div>

                {/* Download App Promo - Inspired by Donezo ref */}
                <div className="px-6 mt-4">
                    <div className="bg-gradient-to-br from-[#1A2220] to-[#0D1211] border border-[#252E2B] rounded-2xl p-5 relative overflow-hidden group">
                        <div className="absolute -right-4 -top-4 w-16 h-16 bg-emerald-500/20 rounded-full blur-xl group-hover:bg-emerald-500/30 transition-all"></div>
                        <div className="w-8 h-8 rounded-full bg-[#1A2220] flex items-center justify-center mb-3">
                            <Smartphone size={16} className="text-emerald-400" />
                        </div>
                        <h4 className="text-white font-bold text-sm mb-1 leading-tight">Baixe nosso<br />App Mobile</h4>
                        <p className="text-[10px] text-slate-400 mb-4">Rastreamento offline em qualquer lugar</p>
                        <button className="w-full py-2 bg-emerald-500/10 text-emerald-400 text-xs font-bold rounded-lg hover:bg-emerald-500 hover:text-[#0C0F0E] transition-all border border-emerald-500/20">
                            Visualizar Download
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col h-screen relative overflow-hidden bg-[#0C0F0E]">
                {/* Top Header */}
                <header className="h-[88px] flex flex-col justify-center px-8 z-10 shrink-0">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center bg-[#121615] px-4 py-2.5 rounded-2xl w-[320px] border border-[#1C2220] focus-within:border-[#CFF073]/50 focus-within:shadow-[0_0_15px_rgba(207,240,115,0.05)] transition-all">
                            <Search size={18} className="text-slate-500 mr-2" />
                            <input
                                type="text"
                                placeholder="Buscar evento, participante..."
                                className="bg-transparent border-none outline-none text-sm text-white w-full placeholder-slate-500"
                            />
                            <div className="px-1.5 py-0.5 bg-[#1C2220] rounded text-[10px] font-bold text-slate-400">⌘F</div>
                        </div>

                        <div className="flex items-center gap-4">
                            <button className="p-2.5 bg-[#121615] border border-[#1C2220] rounded-full text-slate-400 hover:text-white transition-colors">
                                <Bell size={18} />
                            </button>

                            <div className="flex items-center gap-3 pl-2 bg-[#121615] border border-[#1C2220] rounded-full pr-1.5 py-1.5">
                                <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-700">
                                    <img src="https://i.pravatar.cc/150?u=a042581f4e29026704d" alt="Avatar" className="w-full h-full object-cover" />
                                </div>
                                <div className="hidden sm:block pr-3">
                                    <p className="text-xs font-bold text-white leading-tight">Amelia Marie</p>
                                    <p className="text-[10px] text-slate-400">Admin do Evento</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto px-8 pb-8 relative z-0 hide-scrollbar">
                    {children}
                </div>
            </main>
        </div>
    );
}
