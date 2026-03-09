export default function DeveloperLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex flex-col min-h-screen bg-[#070908]">
            {/* Horizontal Top Navbar for Developer / Super Admin */}
            <header className="bg-[#0A0C0B] border-b border-[#1A1F1C] py-4 px-6 md:px-10 flex items-center justify-between sticky top-0 z-50">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-indigo-500 flex items-center justify-center shadow-[0_0_20px_rgba(99,102,241,0.4)]">
                        <span className="text-white font-black text-xl">&#123; &#125;</span>
                    </div>
                    <div>
                        <h1 className="text-lg font-black text-white uppercase tracking-wider">Developer Center</h1>
                        <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest">Platform Administration</p>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <div className="hidden md:flex items-center gap-5 text-sm font-semibold text-slate-400">
                        <a href="#" className="text-indigo-400">Dashboard</a>
                        <a href="#" className="hover:text-white transition-colors">Tenants</a>
                        <a href="#" className="hover:text-white transition-colors">Audit Logs</a>
                        <a href="#" className="hover:text-white transition-colors">API Keys</a>
                    </div>
                    <div className="h-8 w-px bg-[#1A1F1C]"></div>
                    <a href="/trekkings" className="text-xs font-bold px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition">
                        Exit to Events &rarr;
                    </a>
                </div>
            </header>

            <main className="flex-1 w-full max-w-6xl mx-auto p-6 md:p-10 relative">
                <div className="absolute top-20 left-20 w-[600px] h-[600px] bg-indigo-500/[0.03] rounded-full blur-[120px] pointer-events-none"></div>
                {children}
            </main>
        </div>
    );
}
