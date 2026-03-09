'use client';

import Link from 'next/link';
import { ArrowLeft, FileUp, Zap, LayoutTemplate, FileText } from 'lucide-react';
import { useState } from 'react';
import { useParams } from 'next/navigation';

export default function CertificatesPage() {
    const params = useParams();
    const eventId = params.id as string;

    const [certificateFile, setCertificateFile] = useState<File | null>(null);
    const [generating, setGenerating] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setCertificateFile(e.target.files[0]);
        }
    };

    const handleGenerate = () => {
        if (!certificateFile) {
            alert('Por favor, selecione um modelo DOCX primeiro.');
            return;
        }
        setGenerating(true);
        // Simulate generation process
        setTimeout(() => {
            alert('Certificados gerados com sucesso! Verifique seu e-mail ou a pasta de downloads.');
            setGenerating(false);
        }, 2000);
    };

    return (
        <div className="space-y-6 fade-in max-w-[1400px] mx-auto pb-6 h-full flex flex-col">
            <div className="flex items-center gap-3 mb-2 shrink-0">
                <Link href={`/trekkings/${eventId}`} className="w-8 h-8 rounded-full bg-[#121615] border border-[#1C2220] flex items-center justify-center text-slate-400 hover:text-white transition-colors">
                    <ArrowLeft size={16} />
                </Link>
                <span className="text-slate-500 font-medium text-sm">/ Events / Gestão /</span>
                <span className="text-white font-medium text-sm">Estúdio de Certificados</span>
            </div>

            <header className="flex justify-between items-end pb-4 border-b border-[#1C2220] shrink-0">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Emissão de Certificados DOCX</h1>
                    <p className="text-slate-400 mt-1 text-sm font-medium">Faça upload de um modelo padrão do Word e deixe o sistema preencher e gerar os PDFs automaticamente.</p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-rose-500/10 flex items-center justify-center border border-rose-500/20 shadow-[0_0_20px_rgba(244,63,94,0.15)]">
                    <FileText size={24} className="text-rose-400" />
                </div>
            </header>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 pt-4 flex-1">

                {/* Left Panel - Upload & Instructions */}
                <div className="space-y-6 flex flex-col">
                    <div className="bg-[#121615] p-8 rounded-3xl border border-[#1C2220] shadow-lg relative overflow-hidden flex-1 group">
                        <div className="absolute -top-10 -left-10 w-32 h-32 bg-rose-500/10 rounded-full blur-2xl group-hover:bg-rose-500/20 transition-all"></div>

                        <h2 className="text-xl font-bold text-white mb-6 relative z-10 flex items-center gap-3 border-b border-[#1C2220] pb-4">
                            <LayoutTemplate size={20} className="text-rose-400" />
                            Configuração do Modelo Word
                        </h2>

                        <div className="relative z-10 space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-rose-400 mb-2 flex items-center gap-2">
                                    <FileUp size={16} /> Upload do Documento Base (.docx)
                                </label>
                                <p className="text-sm text-slate-400 mb-4 leading-relaxed">
                                    Prepare um documento no Microsoft Word com a identidade visual do evento. O sistema irá procurar e substituir automaticamente as seguintes chaves no texto:
                                </p>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                                    <div className="bg-[#0A0C0B] p-3 rounded-xl border border-[#1C2220]">
                                        <span className="block font-mono text-xs text-rose-300 mb-1">&#123;&#123;nome_participante&#125;&#125;</span>
                                        <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Nome Completo do Atleta</span>
                                    </div>
                                    <div className="bg-[#0A0C0B] p-3 rounded-xl border border-[#1C2220]">
                                        <span className="block font-mono text-xs text-rose-300 mb-1">&#123;&#123;evento_nome&#125;&#125;</span>
                                        <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Título do Trekking</span>
                                    </div>
                                    <div className="bg-[#0A0C0B] p-3 rounded-xl border border-[#1C2220]">
                                        <span className="block font-mono text-xs text-rose-300 mb-1">&#123;&#123;data_realizado&#125;&#125;</span>
                                        <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Data do Evento</span>
                                    </div>
                                    <div className="bg-[#0A0C0B] p-3 rounded-xl border border-[#1C2220]">
                                        <span className="block font-mono text-xs text-rose-300 mb-1">&#123;&#123;tempo_oficial&#125;&#125;</span>
                                        <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Tempo de Conclusão</span>
                                    </div>
                                </div>

                                <div className="flex bg-[#0A0C0B] border-2 border-dashed border-[#1C2220] rounded-2xl overflow-hidden hover:border-rose-500/50 transition-colors p-2 focus-within:border-rose-400">
                                    <input
                                        type="file"
                                        accept=".docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                                        onChange={handleFileChange}
                                        className="w-full px-4 py-4 text-sm text-slate-400 file:mr-4 file:py-2 file:px-6 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-rose-500/10 file:text-rose-400 hover:file:bg-rose-500/20 cursor-pointer"
                                    />
                                </div>
                                {certificateFile && (
                                    <div className="mt-4 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-bold text-emerald-400 flex items-center gap-2">
                                                <LayoutTemplate size={16} /> Arquivo Carregado
                                            </p>
                                            <p className="text-xs text-slate-400 mt-1">{certificateFile.name} ({(certificateFile.size / 1024).toFixed(1)} KB)</p>
                                        </div>
                                        <button onClick={() => setCertificateFile(null)} className="text-xs text-slate-400 hover:text-rose-400 font-bold transition-colors">
                                            Remover
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Panel - Action & Preview Info */}
                <div className="space-y-6 flex flex-col">
                    <div className="bg-gradient-to-br from-[#121615] to-[#0A0C0B] p-8 rounded-3xl border border-[#1C2220] shadow-lg flex-1 flex flex-col justify-center items-center text-center">
                        <div className="w-20 h-20 bg-[#1A201E] rounded-full border border-[#1C2220] flex items-center justify-center mb-6 shadow-xl">
                            <Zap size={32} className={certificateFile ? "text-emerald-400" : "text-slate-600"} />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2">Processamento em Lote</h3>
                        <p className="text-slate-400 max-w-sm mb-8">
                            {certificateFile
                                ? "O modelo está pronto. Ao iniciar, o sistema lerá os dados de todos os participantes aprovados, preencherá as variáveis no Word e converterá tudo em um único arquivo PDF/ZIP."
                                : "Faça o upload do documento Word ao lado para habilitar a emissão de certificados."}
                        </p>

                        <button
                            onClick={handleGenerate}
                            disabled={!certificateFile || generating}
                            className={`px-8 py-4 font-bold rounded-xl text-lg flex items-center gap-3 shadow-lg transition-all ${certificateFile
                                    ? generating
                                        ? 'bg-emerald-500/50 text-[#0A0C0B] cursor-not-allowed'
                                        : 'bg-emerald-500 text-[#0A0C0B] hover:bg-emerald-400 hover:scale-105 shadow-[0_0_20px_rgba(16,185,129,0.3)]'
                                    : 'bg-[#1A201E] text-slate-500 border border-[#1C2220] cursor-not-allowed'
                                }`}
                        >
                            {generating ? (
                                <>Gerando Certificados...</>
                            ) : (
                                <>
                                    <Zap size={20} />
                                    Gerar Todos os Certificados
                                </>
                            )}
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}
