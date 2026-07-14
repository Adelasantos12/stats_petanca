'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Minus, Plus, Share2, RotateCcw, Download, Crown, Undo2 } from 'lucide-react';

type Side = 'A' | 'B';

export default function Contador() {
  const [teamA, setTeamA] = useState('Nosotros');
  const [teamB, setTeamB] = useState('Ellos');
  const [scoreA, setScoreA] = useState(0);
  const [scoreB, setScoreB] = useState(0);
  const [target, setTarget] = useState(13);
  const [history, setHistory] = useState<Side[]>([]);
  const [sharing, setSharing] = useState(false);

  const winner: Side | null = scoreA >= target ? 'A' : scoreB >= target ? 'B' : null;
  const winnerName = winner === 'A' ? teamA : winner === 'B' ? teamB : '';

  const add = (side: Side, n: number) => {
    if (winner) return;
    if (side === 'A') setScoreA((s) => Math.max(0, s + n));
    else setScoreB((s) => Math.max(0, s + n));
    if (n > 0) setHistory((h) => [...h, side]);
  };

  const undo = () => {
    const last = history[history.length - 1];
    if (!last) return;
    if (last === 'A') setScoreA((s) => Math.max(0, s - 1));
    else setScoreB((s) => Math.max(0, s - 1));
    setHistory((h) => h.slice(0, -1));
  };

  const reset = (keepTeams = true) => {
    setScoreA(0); setScoreB(0); setHistory([]);
    if (!keepTeams) { setTeamA('Nosotros'); setTeamB('Ellos'); }
  };

  // --- Tarjeta compartible (canvas → imagen) ---
  const makeCard = (): Promise<Blob | null> =>
    new Promise((resolve) => {
      const S = 1080;
      const c = document.createElement('canvas');
      c.width = S; c.height = S;
      const g = c.getContext('2d');
      if (!g) return resolve(null);

      const ORANGE = '#DD5A2F';
      const center = S / 2;

      // fondo carboncillo (marca perform)
      g.fillStyle = '#26231F';
      g.fillRect(0, 0, S, S);
      g.globalAlpha = 0.06; g.fillStyle = ORANGE;
      g.beginPath(); g.arc(930, 150, 260, 0, Math.PI * 2); g.fill();
      g.beginPath(); g.arc(120, 980, 210, 0, Math.PI * 2); g.fill();
      g.globalAlpha = 1;

      // flecha de marca (↗) arriba
      g.strokeStyle = ORANGE;
      g.lineWidth = 26; g.lineCap = 'round'; g.lineJoin = 'round';
      g.beginPath(); g.moveTo(center - 34, 190); g.lineTo(center + 20, 136); g.stroke();
      g.beginPath(); g.moveTo(center - 16, 132); g.lineTo(center + 28, 132); g.lineTo(center + 28, 176); g.stroke();

      g.textAlign = 'center';
      g.fillStyle = 'rgba(255,255,255,0.55)';
      g.font = '700 28px system-ui, sans-serif';
      g.fillText('R E S U L T A D O', center, 268);

      // nombres de equipo
      const clip = (t: string) => (t.length > 18 ? t.slice(0, 17) + '…' : t);
      g.font = '800 52px system-ui, sans-serif';
      g.fillStyle = 'rgba(255,255,255,0.95)';
      g.fillText(`${clip(teamA)}   vs   ${clip(teamB)}`, center, 380);

      // marcador grande
      g.fillStyle = '#ffffff';
      g.font = '900 290px system-ui, sans-serif';
      g.fillText(`${scoreA} – ${scoreB}`, center, center + 130);

      // ganador
      if (winner) {
        g.fillStyle = ORANGE;
        g.font = '900 62px system-ui, sans-serif';
        g.fillText(`🏆  Ganó ${clip(winnerName)}`, center, center + 260);
      }

      // pie / marca "perform."
      g.font = '800 58px system-ui, sans-serif';
      g.fillStyle = '#ffffff';
      const word = 'perform';
      const wWord = g.measureText(word).width;
      const dot = g.measureText('.').width;
      const startX = center - (wWord + dot) / 2;
      g.textAlign = 'left';
      g.fillText(word, startX, S - 118);
      g.fillStyle = ORANGE;
      g.fillText('.', startX + wWord, S - 118);
      g.textAlign = 'center';
      g.fillStyle = 'rgba(255,255,255,0.5)';
      g.font = '600 30px system-ui, sans-serif';
      g.fillText('Entrenamiento de petanca', center, S - 66);

      c.toBlob((b) => resolve(b), 'image/png');
    });

  const share = async () => {
    setSharing(true);
    try {
      const blob = await makeCard();
      if (!blob) return;
      const file = new File([blob], 'petanca-resultado.png', { type: 'image/png' });
      const text = winner
        ? `${winnerName} ganó ${Math.max(scoreA, scoreB)}-${Math.min(scoreA, scoreB)} 🎯 · perform`
        : `${teamA} ${scoreA} - ${scoreB} ${teamB} · perform`;

      const nav = navigator as Navigator & { canShare?: (d: unknown) => boolean };
      if (nav.canShare && nav.canShare({ files: [file] })) {
        await nav.share({ files: [file], text } as ShareData);
      } else if (nav.share) {
        await nav.share({ text } as ShareData);
        downloadBlob(blob);
      } else {
        downloadBlob(blob);
      }
    } catch {
      /* usuario canceló el compartir */
    } finally {
      setSharing(false);
    }
  };

  const downloadBlob = (blob: Blob) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'petanca-resultado.png'; a.click();
    URL.revokeObjectURL(url);
  };

  const download = async () => {
    const b = await makeCard();
    if (b) downloadBlob(b);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 pb-24 select-none">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="glass p-3 rounded-2xl shadow-sm active:scale-90"><ChevronLeft size={22} className="text-slate-600" /></Link>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Contador rápido</h2>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={undo} disabled={!history.length} className="glass p-3 rounded-2xl text-slate-500 disabled:opacity-30 active:scale-90" title="Deshacer"><Undo2 size={18} /></button>
          <button onClick={() => reset()} className="glass p-3 rounded-2xl text-slate-500 active:scale-90" title="Reiniciar"><RotateCcw size={18} /></button>
        </div>
      </div>

      {/* objetivo */}
      <div className="flex items-center justify-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest">
        Juego a
        {[11, 13].map((t) => (
          <button key={t} onClick={() => setTarget(t)}
            className={`px-3 py-1 rounded-full ${target === t ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-400'}`}>{t}</button>
        ))}
        puntos
      </div>

      {/* marcadores */}
      <div className="grid grid-cols-2 gap-4">
        <TeamPanel name={teamA} setName={setTeamA} score={scoreA} color="brand" onAdd={(n) => add('A', n)} locked={!!winner} />
        <TeamPanel name={teamB} setName={setTeamB} score={scoreB} color="rose" onAdd={(n) => add('B', n)} locked={!!winner} />
      </div>

      <p className="text-center text-[11px] text-slate-400 font-semibold">Toca el marcador para +1 · el botón − corrige</p>

      {/* victoria + compartir */}
      <AnimatePresence>
        {winner && (
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="fixed inset-x-0 bottom-0 z-50 p-4">
            <div className="max-w-md mx-auto glass rounded-[2.5rem] p-6 shadow-2xl border border-white/60 text-center">
              <Crown size={34} className="text-amber-500 mx-auto" />
              <div className="text-[11px] font-black text-slate-400 uppercase tracking-widest mt-1">Ganador</div>
              <div className="text-2xl font-black text-slate-800">{winnerName}</div>
              <div className="text-4xl font-black text-brand-600 my-2 tabular-nums">{scoreA} – {scoreB}</div>
              <div className="grid grid-cols-3 gap-2 mt-4">
                <button onClick={share} disabled={sharing}
                  className="col-span-3 bg-brand-600 text-white font-black py-3.5 rounded-2xl flex items-center justify-center gap-2 hover:bg-brand-700 active:scale-95 disabled:opacity-60">
                  <Share2 size={18} /> {sharing ? 'Preparando…' : 'Compartir resultado'}
                </button>
                <button onClick={download} className="bg-slate-100 text-slate-600 font-bold py-3 rounded-2xl flex items-center justify-center gap-1 active:scale-95"><Download size={16} /></button>
                <button onClick={() => reset(true)} className="col-span-2 bg-slate-100 text-slate-600 font-black py-3 rounded-2xl flex items-center justify-center gap-2 active:scale-95"><RotateCcw size={16} /> Revancha</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function TeamPanel({
  name, setName, score, color, onAdd, locked,
}: {
  name: string; setName: (v: string) => void; score: number; color: 'brand' | 'rose'; onAdd: (n: number) => void; locked: boolean;
}) {
  const bg = color === 'brand' ? 'from-brand-500 to-brand-600 shadow-brand-200' : 'from-rose-500 to-rose-600 shadow-rose-200';
  return (
    <div className={`bg-gradient-to-br ${bg} rounded-[2.5rem] p-5 shadow-xl flex flex-col`}>
      <input value={name} onChange={(e) => setName(e.target.value)}
        className="bg-transparent text-white font-black text-center text-lg outline-none placeholder:text-white/50 w-full" />
      <button onClick={() => onAdd(1)} disabled={locked}
        className="flex-1 py-6 active:scale-95 transition-transform disabled:active:scale-100">
        <div className="text-white font-black tabular-nums leading-none" style={{ fontSize: '5.5rem' }}>{score}</div>
      </button>
      <div className="flex items-center justify-center gap-2">
        <button onClick={() => onAdd(-1)} className="w-11 h-11 rounded-2xl bg-white/20 text-white flex items-center justify-center active:scale-90"><Minus size={20} /></button>
        <button onClick={() => onAdd(1)} disabled={locked} className="flex-1 h-11 rounded-2xl bg-white/25 text-white flex items-center justify-center font-black active:scale-95 disabled:opacity-50"><Plus size={20} /></button>
      </div>
    </div>
  );
}
