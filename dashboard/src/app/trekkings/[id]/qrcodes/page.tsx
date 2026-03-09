'use client';

import Link from 'next/link';
import { ArrowLeft, QrCode, Download, Printer } from 'lucide-react';
import { useState } from 'react';

export default function QRCodesPage() {
    const [generating, setGenerating] = useState(false);

    const handleDownloadAll = () => {
        setGenerating(true);
        setTimeout(() => {
            alert("QRCodes_Event_1.zip baixado (Início, 5 CPs, Fim)");
            setGenerating(false);
        }, 1500);
    };

    return (
        <div className="space-y-6 fade-in max-w-[1400px] mx-auto pb-6">
            <div className="flex items-center gap-3 mb-2">
                <Link href="/trekkings/1" className="w-8 h-8 rounded-full bg-[#121615] border border-[#1C2220] flex items-center justify-center text-slate-400 hover:text-white transition-colors">
                    <ArrowLeft size={16} />
                </Link>
                <span className="text-slate-500 font-medium text-sm">/ Events / Tracking Iniciantes #05 /</span>
                <span className="text-white font-medium text-sm">Terminal de QR Codes</span>
            </div>

            <header className="flex justify-between items-end pb-4 border-b border-[#1C2220]">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Terminal de QR Codes</h1>
                    <p className="text-slate-400 mt-1 text-sm font-medium">Gere, imprima e baixe os hashes físicos de destino para sua rota.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleDownloadAll}
                        disabled={generating}
                        className="flex items-center gap-2 px-5 py-2.5 bg-[#CFF073] text-[#0A0C0B] font-bold rounded-xl hover:bg-[#b8d665] shadow-[0_0_15px_rgba(207,240,115,0.2)] transition-all disabled:opacity-50"
                    >
                        {generating ? <div className="animate-spin w-4 h-4 border-2 border-[#0A0C0B] border-t-transparent rounded-full" /> : <Download size={18} />}
                        {generating ? 'Gerando ZIP...' : 'Baixar Tudo (.ZIP)'}
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                {/* Start Line */}
                <div className="bg-[#121615] p-6 rounded-3xl shadow-lg border border-[#1C2220] flex flex-col items-center text-center">
                    <div className="w-48 h-48 bg-white p-4 rounded-xl mb-6">
                        {/* Placeholder for actual QR code */}
                        <div className="w-full h-full border-4 border-black border-dashed flex items-center justify-center">
                            <QrCode size={64} className="text-black/20" />
                        </div>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-1">Linha de Largada</h3>
                    <p className="text-xs text-slate-500 font-mono mb-6 bg-[#0A0C0B] px-3 py-1 rounded-full border border-[#1C2220]">qr_hash: start_001</p>

                    <button className="w-full py-3 bg-[#1A201E] text-slate-300 border border-[#1C2220] rounded-xl font-bold hover:text-white hover:border-[#CFF073] transition-colors flex justify-center items-center gap-2">
                        <Printer size={16} /> Imprimir Folha
                    </button>
                </div>

                {/* Checkpoints List */}
                <div className="bg-[#121615] p-6 rounded-3xl shadow-lg border border-[#1C2220] md:col-span-2">
                    <h3 className="text-xl font-bold text-white mb-4">Checkpoints da Rota (CPs)</h3>
                    <div className="space-y-3">
                        {[1, 2, 3, 4, 5].map((cp) => (
                            <div key={cp} className="flex items-center justify-between p-4 bg-[#0A0C0B] rounded-2xl border border-[#1C2220]">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-white p-1 rounded-lg">
                                        <div className="w-full h-full border-2 border-black border-dashed"></div>
                                    </div>
                                    <div className="text-left">
                                        <p className="font-bold text-white">Checkpoint {cp}</p>
                                        <p className="text-[10px] text-slate-500 font-mono">qr_hash: cp_00{cp}</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button className="p-2 text-slate-400 hover:text-emerald-400 bg-[#121615] rounded-lg border border-[#1C2220] transition-colors">
                                        <Download size={16} />
                                    </button>
                                    <button className="p-2 text-slate-400 hover:text-white bg-[#121615] rounded-lg border border-[#1C2220] transition-colors">
                                        <Printer size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Finish Line */}
                <div className="bg-[#121615] p-6 rounded-3xl shadow-lg border border-[#1C2220] flex flex-col items-center text-center">
                    <div className="w-48 h-48 bg-white p-4 rounded-xl mb-6">
                        <div className="w-full h-full border-4 border-black border-dashed flex items-center justify-center">
                            <QrCode size={64} className="text-black/20" />
                        </div>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-1">Linha de Chegada</h3>
                    <p className="text-xs text-slate-500 font-mono mb-6 bg-[#0A0C0B] px-3 py-1 rounded-full border border-[#1C2220]">qr_hash: end_001</p>

                    <button className="w-full py-3 bg-[#1A201E] text-slate-300 border border-[#1C2220] rounded-xl font-bold hover:text-white hover:border-[#CFF073] transition-colors flex justify-center items-center gap-2">
                        <Printer size={16} /> Imprimir Folha
                    </button>
                </div>
            </div>
        </div>
    );
}
