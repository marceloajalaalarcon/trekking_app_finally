'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, Clock, Users, Calculator, Settings2, Plus, Trash2, MapPin, ChevronLeft, ChevronRight, QrCode, Download, Printer, Lock, Unlock, CheckCircle2, Loader2, Save } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../../contexts/AuthContext';
import QRCodeLib from 'qrcode';
import { jsPDF } from 'jspdf';

export default function IdealTimesPage() {
    const params = useParams();
    const eventId = params.id as string;
    const { authFetch } = useAuth();

    // Basic event info
    const [eventName, setEventName] = useState('Loading...');
    const [startDateStr, setStartDateStr] = useState<string | null>(null);

    const [baseStartTime, setBaseStartTime] = useState('10:00:00');
    const [teamIntervalMinutes, setTeamIntervalMinutes] = useState(50);
    const [teamCount, setTeamCount] = useState(5);
    const [defaultCpInterval, setDefaultCpInterval] = useState(20);
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 10;

    const [generating, setGenerating] = useState(false);
    const [checkpoints, setCheckpoints] = useState<any[]>([]);

    // Auto-save & Lock states
    const [isLocked, setIsLocked] = useState(false);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

    // Keep it synced with the actual average of checkpoints, unless user is typing
    useEffect(() => {
        if (checkpoints.length > 2) {
            const sum = checkpoints.slice(1, -1).reduce((acc, cp) => acc + (Number(cp.offsetFromPrevMinutes) || 0), 0);
            const avg = Math.round(sum / (checkpoints.length - 2));
            if (avg > 0 && avg !== defaultCpInterval) {
                setDefaultCpInterval(avg);
            }
        }
    }, [checkpoints]);

    const handleSave = async () => {
        setSaveStatus('saving');
        try {
            const cpsToSend = checkpoints.map((cp, idx) => {
                const accumMin = checkpoints.slice(0, idx + 1).reduce((sum, c) => sum + c.offsetFromPrevMinutes, 0);
                return { name: cp.name, ideal_time_offset: accumMin * 60 };
            });

            let newStartDate = startDateStr;
            if (!newStartDate) newStartDate = new Date().toISOString();
            const d = new Date(newStartDate);
            const [h, m, s] = baseStartTime.split(':').map(Number);
            if (!isNaN(h)) {
                d.setHours(h, m, s, 0);
                newStartDate = d.toISOString();
            }

            const res = await authFetch(`http://localhost:3333/trekkings/${eventId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    teams_start_interval: teamIntervalMinutes * 60,
                    checkpoints_count: checkpoints.length > 2 ? checkpoints.length - 2 : 0,
                    checkpoints: cpsToSend,
                    start_date: newStartDate,
                    max_teams: teamCount
                })
            });

            if (!res.ok) {
                const errText = await res.text();
                throw new Error(errText);
            }

            setSaveStatus('saved');
            setTimeout(() => setSaveStatus('idle'), 2000);
        } catch (error: any) {
            console.error(error);
            alert(`Erro ao salvar: ${error.message}`);
            setSaveStatus('idle');
        }
    };

    useEffect(() => {
        authFetch(`http://localhost:3333/trekkings/${eventId}`)
            .then(res => res.json())
            .then(data => {
                setEventName(data.name || 'Detalhes do Evento');

                if (data.teams_start_interval) {
                    // Convert seconds to minutes for this UI
                    setTeamIntervalMinutes(Math.max(1, Math.floor(data.teams_start_interval / 60)));
                } else {
                    setTeamIntervalMinutes(2); // Fallback to 120s from settings
                }

                const tCount = data.max_teams ?? data.accepted_teams_count ?? data._count?.teams ?? 0;
                setTeamCount(tCount);

                if (data.start_date) {
                    setStartDateStr(data.start_date);
                    const d = new Date(data.start_date);
                    const hh = String(d.getHours()).padStart(2, '0');
                    const mm = String(d.getMinutes()).padStart(2, '0');
                    const ss = String(d.getSeconds()).padStart(2, '0');
                    setBaseStartTime(`${hh}:${mm}:${ss}`);
                }

                if (data.checkpoints && data.checkpoints.length > 0) {
                    let prevAccumMins = 0;
                    const loadedCps = data.checkpoints.map((cp: any) => {
                        const accumMins = Math.floor((cp.ideal_time_offset || 0) / 60);
                        const diff = accumMins - prevAccumMins;
                        prevAccumMins = accumMins;
                        return { id: cp.id, name: cp.name, offsetFromPrevMinutes: Math.max(0, diff) };
                    });
                    setCheckpoints(loadedCps);
                } else {
                    const fallbackCount = data.checkpoints_count !== undefined ? data.checkpoints_count : 5;
                    const cps = [{ id: 1, name: 'Linha de Largada', offsetFromPrevMinutes: 0 }];
                    for (let i = 0; i < fallbackCount; i++) {
                        cps.push({ id: Date.now() + i, name: `CP ${i + 1}`, offsetFromPrevMinutes: 20 });
                    }
                    cps.push({ id: 9999, name: 'Linha de Chegada', offsetFromPrevMinutes: 60 });
                    setCheckpoints(cps);
                }
            })
            .catch(() => setEventName('Detalhes do Evento'));
    }, []);

    // Generate teams dynamically based on count
    const teams = Array.from({ length: teamCount }).map((_, i) => ({
        id: i + 1,
        number: i + 1,
        name: `Equipe #${i + 1}`,
        startOffsetMinutes: i * teamIntervalMinutes
    }));

    const totalPages = Math.ceil(teams.length / ITEMS_PER_PAGE) || 1;

    useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(totalPages);
        }
    }, [teamCount, totalPages, currentPage]);

    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginatedTeams = teams.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    // Calculate accumulated offset for a checkpoint (sum of all previous offsets)
    const getAccumulatedCpOffset = (cpIndex: number) => {
        return checkpoints.slice(0, cpIndex + 1).reduce((sum, cp) => sum + cp.offsetFromPrevMinutes, 0);
    };

    // Calculate absolute time
    const calculateAbsoluteTime = (teamStartOffsetMin: number, accumulatedCpOffsetMin: number) => {
        if (!baseStartTime) return '--:--:--';

        const [hours, minutes, seconds] = baseStartTime.split(':').map(Number);
        if (isNaN(hours) || isNaN(minutes) || isNaN(seconds)) return 'Invalid Time';

        const date = new Date();
        date.setHours(hours, minutes, seconds, 0);

        // Add team start delay and CP physical offset
        date.setMinutes(date.getMinutes() + teamStartOffsetMin + accumulatedCpOffsetMin);

        return date.toLocaleTimeString('pt-BR', { hour12: false });
    };

    const handleUpdateCpOffset = (index: number, val: string) => {
        const newCps = [...checkpoints];
        newCps[index].offsetFromPrevMinutes = Number(val) || 0;
        setCheckpoints(newCps);
    };

    const handleAddCp = () => {
        const newCps = [...checkpoints];
        const finishLine = newCps.pop();
        newCps.push({ id: Date.now(), name: `CP ${newCps.length}`, offsetFromPrevMinutes: 20 });
        if (finishLine) newCps.push(finishLine);
        setCheckpoints(newCps);
    };

    const handleRemoveCp = (index: number) => {
        if (index === 0 || index === checkpoints.length - 1) return;
        const newCps = [...checkpoints];
        newCps.splice(index, 1);
        setCheckpoints(newCps);
    };

    const handleUpdateTotalCps = (val: string) => {
        let newCount = parseInt(val, 10);
        if (isNaN(newCount) || newCount < 0) return;

        const currentIntermediateCount = checkpoints.length - 2;
        const diff = newCount - currentIntermediateCount;
        if (diff === 0) return;

        const newCps = [...checkpoints];
        const finishLine = newCps.pop(); // Save finish line

        if (diff > 0) {
            for (let i = 0; i < diff; i++) {
                newCps.push({ id: Date.now() + Math.random(), name: `CP ${newCps.length}`, offsetFromPrevMinutes: defaultCpInterval });
            }
        } else {
            const removeCount = Math.abs(diff);
            for (let i = 0; i < removeCount; i++) {
                if (newCps.length > 1) newCps.pop(); // Protect start line
            }
        }

        if (finishLine) newCps.push(finishLine);
        setCheckpoints(newCps);
    };

    const handleApplyDefaultCpInterval = () => {
        const newCps = checkpoints.map((cp, idx) => {
            if (idx === 0) return cp; // Linha de Largada
            return { ...cp, offsetFromPrevMinutes: defaultCpInterval }; // Applied to middle CPs and Finish Line too
        });
        setCheckpoints(newCps);
    };

    const getQrDataForCheckpoint = useCallback((cp: any, idx: number) => {
        let type: string;
        if (idx === 0) type = 'start';
        else if (idx === checkpoints.length - 1) type = 'end';
        else type = 'cp';
        const cpIdentifier = cp.id || `cp${idx}`;
        return `${type}_${eventId}_${cpIdentifier}`;
    }, [checkpoints, eventId]);

    const downloadSingleQR = useCallback(async (cp: any, idx: number) => {
        const qrData = getQrDataForCheckpoint(cp, idx);
        try {
            const dataUrl = await QRCodeLib.toDataURL(qrData, {
                width: 512,
                margin: 2,
                color: { dark: '#000000', light: '#FFFFFF' }
            });
            const link = document.createElement('a');
            link.download = `QR_${cp.name.replace(/\s+/g, '_')}_${eventId.slice(0, 6)}.png`;
            link.href = dataUrl;
            link.click();
        } catch (err) {
            console.error('QR generation failed', err);
        }
    }, [getQrDataForCheckpoint, eventId]);

    const handlePrintSingleQR = useCallback(async (cp: any, idx: number) => {
        const qrData = getQrDataForCheckpoint(cp, idx);
        try {
            const dataUrl = await QRCodeLib.toDataURL(qrData, {
                width: 512,
                margin: 2,
                color: { dark: '#000000', light: '#FFFFFF' }
            });
            const isStart = idx === 0;
            const isEnd = idx === checkpoints.length - 1;
            const titleLabel = isStart ? 'CP START' : (isEnd ? 'CP END' : (cp.name || `CP ${idx}`));

            const win = window.open('', '_blank');
            if (win) {
                win.document.write(`
                    <html><head><title>QR - ${titleLabel}</title>
                    <style>body{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;font-family:system-ui;margin:0}
                    img{width:300px;height:300px}h2{margin:0 0 8px}p{color:#666;font-size:14px;margin:4px 0}</style></head>
                    <body><h2>${titleLabel}</h2><p>${eventName}</p><img src="${dataUrl}"/></body></html>
                `);
                win.document.close();
                win.print();
            }
        } catch (err) {
            console.error('QR print failed', err);
        }
    }, [getQrDataForCheckpoint, eventName]);

    const handleDownloadAllQRs = useCallback(async () => {
        setGenerating(true);
        try {
            const doc = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            for (let i = 0; i < checkpoints.length; i++) {
                const cp = checkpoints[i];
                const qrData = getQrDataForCheckpoint(cp, i);

                const dataUrl = await QRCodeLib.toDataURL(qrData, {
                    width: 512,
                    margin: 2,
                    color: { dark: '#000000', light: '#FFFFFF' }
                });

                if (i > 0) {
                    doc.addPage();
                }

                // A4 dimensions: 210 x 297 mm
                const qrSize = 120;
                const xPos = (210 - qrSize) / 2;
                const yPos = 80;

                const isStart = i === 0;
                const isEnd = i === checkpoints.length - 1;
                const titleLabel = isStart ? 'CP START' : (isEnd ? 'CP END' : (cp.name || `CP ${i}`));

                doc.setFontSize(28);
                doc.setFont("helvetica", "bold");
                doc.text(titleLabel, 105, 40, { align: 'center' });

                doc.setFontSize(16);
                doc.setFont("helvetica", "normal");
                doc.text(eventName || 'Tracking Event', 105, 55, { align: 'center' });

                doc.addImage(dataUrl, 'PNG', xPos, yPos, qrSize, qrSize);
            }

            doc.save(`QRCodes_${eventName.replace(/\s+/g, '_')}_${eventId.slice(0, 6)}.pdf`);
        } catch (err) {
            console.error('Bulk QR PDF download failed', err);
        } finally {
            setGenerating(false);
        }
    }, [checkpoints, getQrDataForCheckpoint, eventName, eventId]);

    return (
        <div className="space-y-6 fade-in max-w-[1400px] mx-auto pb-6">
            <div className="flex items-center gap-3 mb-2">
                <Link href={`/trekkings/${eventId}`} className="w-8 h-8 rounded-full bg-[#121615] border border-[#1C2220] flex items-center justify-center text-slate-400 hover:text-white transition-colors">
                    <ArrowLeft size={16} />
                </Link>
                <span className="text-slate-500 font-medium text-sm">/ Events / {eventName} /</span>
                <span className="text-white font-medium text-sm">Planejador de Tempos Ideais</span>
            </div>

            <header className="flex justify-between items-end pb-4 border-b border-[#1C2220]">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Tempos Alvo Interativos</h1>
                    <p className="text-slate-400 mt-1 text-sm font-medium">Configure parâmetros para calcular os tempos de passagem físicos esperados.</p>
                </div>
                <div className="flex items-center gap-4">
                    {saveStatus === 'saving' && <span className="text-sm font-bold text-emerald-400 flex items-center gap-2"><Loader2 size={16} className="animate-spin" /> Salvando...</span>}
                    {saveStatus === 'saved' && <span className="text-sm font-bold text-emerald-400 flex items-center gap-2"><CheckCircle2 size={16} /> Salvo</span>}
                    <button
                        onClick={handleSave}
                        disabled={saveStatus === 'saving'}
                        className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 text-[#0A0C0B] font-bold rounded-xl hover:bg-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)] transition-all disabled:opacity-50"
                    >
                        <Save size={18} />
                        Salvar Alterações
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 pt-4">
                {/* Configuration Sidebar */}
                <div className="xl:col-span-1 space-y-6">
                    <div className="bg-[#121615] p-6 rounded-3xl shadow-lg border border-[#1C2220]">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-white flex items-center gap-2">
                                <Settings2 size={18} className="text-emerald-400" />
                                Regras de Cálculo
                            </h3>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setIsLocked(!isLocked)}
                                    className={`p-1.5 rounded-lg border transition-colors flex items-center justify-center ${isLocked ? 'bg-rose-500/10 border-rose-500/30 text-rose-400 hover:bg-rose-500/20' : 'bg-[#1A201E] border-[#1C2220] text-slate-400 hover:text-white'}`}
                                    title={isLocked ? "Desbloquear regras" : "Bloquear regras"}
                                >
                                    {isLocked ? <Lock size={15} /> : <Unlock size={15} />}
                                </button>
                            </div>
                        </div>

                        <div className="space-y-5">
                            <div>
                                <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide">Horário de Largada da Primeira Equipe (HH:MM:SS)</label>
                                <input
                                    type="time"
                                    step="1"
                                    value={baseStartTime}
                                    onChange={e => setBaseStartTime(e.target.value)}
                                    className="w-full bg-[#0A0C0B] border border-[#1C2220] rounded-xl px-4 py-3 text-white font-mono text-lg focus:outline-none focus:border-emerald-500 transition-colors [&::-webkit-calendar-picker-indicator]:filter-[invert(1)]"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide">Atraso entre Equipes</label>
                                <div className={`flex bg-[#0A0C0B] border border-[#1C2220] rounded-xl overflow-hidden transition-colors ${!isLocked ? 'focus-within:border-emerald-500' : 'opacity-60'}`}>
                                    <input
                                        type="number"
                                        value={teamIntervalMinutes}
                                        disabled={isLocked}
                                        onChange={e => setTeamIntervalMinutes(Number(e.target.value))}
                                        className={`w-full bg-transparent px-4 py-3 font-bold text-lg focus:outline-none ${isLocked ? 'text-slate-500 cursor-not-allowed' : 'text-[#CFF073]'}`}
                                    />
                                    <span className="flex items-center px-4 bg-[#1A201E] text-slate-500 border-l border-[#1C2220] font-bold text-xs uppercase tracking-widest">MINS</span>
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide">Equipes Aceitas</label>
                                </div>
                                <div className={`flex bg-[#0A0C0B] border border-[#1C2220] rounded-xl overflow-hidden transition-colors ${!isLocked ? 'focus-within:border-emerald-500' : 'opacity-60'}`}>
                                    <input
                                        type="number"
                                        value={teamCount}
                                        disabled={isLocked}
                                        onChange={e => setTeamCount(Number(e.target.value))}
                                        className={`w-full bg-transparent px-4 py-3 font-bold text-lg focus:outline-none ${isLocked ? 'text-slate-500 cursor-not-allowed' : 'text-white'}`}
                                    />
                                    <span className="flex items-center px-4 bg-[#1A201E] text-slate-500 border-l border-[#1C2220]"><Users size={16} /></span>
                                </div>
                            </div>

                            <div className="pt-2 border-t border-[#1C2220]">
                                <label className="block text-[15px] font-bold text-white mb-1 mt-4">Duração Média dos CPs</label>
                                <p className="text-[13px] text-slate-500 mb-3 font-medium">Preencher automaticamente todas as distâncias dos Checkpoints.</p>
                                <div className="flex gap-3">
                                    <div className={`flex-1 flex bg-[#0A0C0B] border border-[#1C2220] rounded-xl overflow-hidden transition-colors ${!isLocked ? 'focus-within:border-emerald-500' : 'opacity-60'}`}>
                                        <input
                                            type="number"
                                            value={defaultCpInterval}
                                            disabled={isLocked}
                                            onChange={e => setDefaultCpInterval(Number(e.target.value))}
                                            className={`w-full bg-transparent px-4 py-3 font-bold text-lg focus:outline-none ${isLocked ? 'text-slate-500 cursor-not-allowed' : 'text-emerald-400'}`}
                                        />
                                        <span className="flex items-center px-4 bg-[#1A201E] text-slate-500 border-l border-[#1C2220] font-bold text-xs uppercase tracking-widest">MINS</span>
                                    </div>
                                    <button
                                        onClick={handleApplyDefaultCpInterval}
                                        disabled={isLocked}
                                        className="px-4 py-3 bg-[#1A201E] text-emerald-400 font-bold rounded-xl border border-emerald-500/20 hover:bg-emerald-500 hover:text-[#0A0C0B] transition-colors whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Aplicar a Todos
                                    </button>
                                </div>
                            </div>

                            <div className="pt-2">
                                <label className="block text-[15px] font-bold text-white mb-1">Total de Checkpoints</label>
                                <p className="text-[13px] text-slate-500 mb-3 font-medium">Excluindo pontos geográficos de Início e Fim.</p>
                                <div className={`flex bg-[#121615] border border-[#1C2220] rounded-xl overflow-hidden shadow-inner transition-colors ${!isLocked ? 'focus-within:border-[#A5B4FC]' : 'opacity-60'}`}>
                                    <input
                                        type="number"
                                        value={checkpoints.length - 2}
                                        disabled={isLocked}
                                        onChange={e => handleUpdateTotalCps(e.target.value)}
                                        className={`w-full bg-transparent px-4 py-3 font-bold text-lg focus:outline-none ${isLocked ? 'text-slate-500 cursor-not-allowed' : 'text-white'}`}
                                    />
                                    <span className="flex items-center px-4 font-bold text-slate-400 bg-[#1A201E] border-l border-[#1C2220] tracking-widest text-sm">PTS</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-[#121615] p-6 rounded-3xl shadow-lg border border-[#1C2220] flex flex-col">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-white flex items-center gap-2">
                                <QrCode size={18} className="text-[#CFF073]" />
                                Checkpoints Físicos
                            </h3>
                            <div className="flex gap-2">
                                <button
                                    onClick={handleDownloadAllQRs}
                                    disabled={generating}
                                    className="px-3 py-1.5 bg-[#CFF073]/10 hover:bg-[#CFF073]/20 text-[#CFF073] rounded-lg transition-colors border border-[#CFF073]/20 flex items-center gap-2 text-xs font-bold disabled:opacity-50"
                                >
                                    {generating ? <div className="animate-spin w-3 h-3 border-2 border-[#CFF073] border-t-transparent rounded-full" /> : <Download size={14} />}
                                    Todos os QRs
                                </button>
                                <button onClick={handleAddCp} className="p-1.5 bg-[#1A201E] hover:bg-emerald-500/20 text-emerald-400 rounded-lg transition-colors border border-emerald-500/20" title="Adicionar Novo Checkpoint">
                                    <Plus size={16} />
                                </button>
                            </div>
                        </div>

                        <div className="space-y-3">
                            {checkpoints.map((cp, idx) => (
                                <div key={cp.id} className="bg-[#0A0C0B] border border-[#1C2220] p-3 rounded-xl flex items-center gap-3">
                                    <div className="flex-1">
                                        <input
                                            type="text"
                                            value={cp.name}
                                            onChange={e => {
                                                const newCps = [...checkpoints];
                                                newCps[idx].name = e.target.value;
                                                setCheckpoints(newCps);
                                            }}
                                            className="bg-transparent text-sm font-bold text-white w-full focus:outline-none"
                                        />
                                        <span className="text-[10px] text-slate-500 tracking-wide uppercase">Delta do anterior (min)</span>
                                    </div>
                                    <input
                                        type="number"
                                        value={cp.offsetFromPrevMinutes}
                                        onChange={e => handleUpdateCpOffset(idx, e.target.value)}
                                        className="w-16 bg-[#1A201E] border border-[#1C2220] text-emerald-400 font-mono text-center py-1.5 rounded focus:outline-none focus:border-emerald-500"
                                        title="Minutos do anterior"
                                    />
                                    <div className="flex gap-1 ml-1 pl-3 border-l border-[#1C2220]">
                                        <button onClick={() => downloadSingleQR(cp, idx)} className="p-1.5 text-slate-500 hover:text-[#CFF073] transition-colors" title="Baixar QR">
                                            <Download size={14} />
                                        </button>
                                        <button onClick={() => handlePrintSingleQR(cp, idx)} className="p-1.5 text-slate-500 hover:text-white transition-colors" title="Imprimir QR">
                                            <Printer size={14} />
                                        </button>
                                        {idx > 0 && idx < checkpoints.length - 1 && (
                                            <button onClick={() => handleRemoveCp(idx)} className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors ml-1" title="Excluir Controle">
                                                <Trash2 size={14} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Spreadsheet View */}
                <div className="xl:col-span-3">
                    <div className="bg-[#121615] rounded-3xl shadow-lg border border-[#1C2220] overflow-hidden overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-400 shrink-0">
                            <thead className="bg-[#151917] text-slate-300 font-semibold border-b border-slate-800">
                                <tr>
                                    <th className="px-6 py-5 sticky left-0 bg-[#151917] z-10 border-r border-[#1C2220]">Cronograma das Equipes</th>
                                    {checkpoints.map((cp, idx) => {
                                        const accumMin = getAccumulatedCpOffset(idx);
                                        return (
                                            <th key={cp.id} className="px-6 py-5 whitespace-nowrap bg-[#121615] border-r border-[#1C2220]/50">
                                                <div className="flex flex-col">
                                                    <span className="text-white font-bold">{cp.name}</span>
                                                    <span className="text-[10px] text-emerald-400 font-mono mt-1 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-max inline-block w-max">
                                                        Tempo Total: +{accumMin}m
                                                    </span>
                                                </div>
                                            </th>
                                        );
                                    })}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#1C2220]">
                                {paginatedTeams.map(team => (
                                    <tr key={team.id} className="hover:bg-[#151917]/50 transition-colors group">
                                        <td className="px-6 py-4 font-bold text-white flex items-center gap-3 sticky left-0 bg-[#0A0C0B] group-hover:bg-[#151917] z-10 border-r border-[#1C2220] transition-colors">
                                            <div className="w-8 h-8 rounded-lg bg-[#A5B4FC]/10 border border-[#A5B4FC]/20 flex items-center justify-center text-[#A5B4FC] flex-shrink-0">
                                                #{team.number}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="truncate max-w-[120px]" title={team.name}>{team.name}</span>
                                                <span className="text-[10px] text-slate-500 font-medium">Atraso: +{team.startOffsetMinutes}m</span>
                                            </div>
                                        </td>

                                        {checkpoints.map((cp, idx) => {
                                            const accumMin = getAccumulatedCpOffset(idx);
                                            return (
                                                <td key={cp.id} className="px-6 py-4 whitespace-nowrap font-mono text-sm border-r border-[#1C2220]/50">
                                                    <div className="flex items-center gap-2">
                                                        <Clock size={14} className="text-slate-600" />
                                                        <span className="text-white tracking-wider text-base">
                                                            {calculateAbsoluteTime(team.startOffsetMinutes, accumMin)}
                                                        </span>
                                                    </div>
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {totalPages > 1 && (
                            <div className="flex items-center justify-between px-6 py-4 bg-[#151917] border-t border-[#1C2220]">
                                <span className="text-sm text-slate-400">
                                    Mostrando <span className="text-white font-bold">{startIndex + 1}</span> a <span className="text-white font-bold">{Math.min(startIndex + ITEMS_PER_PAGE, teams.length)}</span> de <span className="text-white font-bold">{teams.length}</span> equipes
                                </span>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                        disabled={currentPage === 1}
                                        className="p-2 bg-[#1A201E] border border-[#1C2220] rounded-lg text-slate-400 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <ChevronLeft size={16} />
                                    </button>
                                    <span className="text-sm font-bold text-white px-2">
                                        {currentPage} / {totalPages}
                                    </span>
                                    <button
                                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                        disabled={currentPage === totalPages}
                                        className="p-2 bg-[#1A201E] border border-[#1C2220] rounded-lg text-slate-400 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <ChevronRight size={16} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
