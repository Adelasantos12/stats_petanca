'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Match } from '@/types';
import {
  ChevronLeft,
  History,
  BarChart2,
  Save,
  Trash2,
  AlertCircle,
  Trophy,
  Target,
  Zap,
  RotateCcw
} from 'lucide-react';
import Link from 'next/link';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { motion, AnimatePresence } from 'framer-motion';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function LiveMatch() {
  const { id } = useParams();
  const router = useRouter();

  const [match, setMatch] = useState<Match | null>(null);
  const [loading, setLoading] = useState(true);

  // Throw form state
  const [selectedTeam, setSelectedTeam] = useState<'A' | 'B'>('A');
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>('');
  const [throwType, setThrowType] = useState<'POINT' | 'TIR'>('POINT');
  const [effectiveness, setEffectiveness] = useState<number | null>(null);
  const [distance, setDistance] = useState<string>('');
  const [note, setNote] = useState<string>('');

  const [showHistory, setShowHistory] = useState(false);
  const [closingHand, setClosingHand] = useState(false);
  const [finishingMatch, setFinishingMatch] = useState(false);

  const fetchMatch = useCallback(async () => {
    try {
      const res = await api.get(`/matches/${id}`);
      setMatch(res.data);
      setLoading(false);

      // Auto-select first player of selected team if not set
      if (res.data && !selectedPlayerId) {
        const teamPlayers = res.data.players.filter((p: { teamSide: string }) => p.teamSide === selectedTeam);
        if (teamPlayers.length > 0) setSelectedPlayerId(teamPlayers[0].playerId);
      }
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  }, [id, selectedTeam, selectedPlayerId]);

  useEffect(() => {
    fetchMatch();
  }, [fetchMatch]);

  const handleTeamChange = (side: 'A' | 'B') => {
    setSelectedTeam(side);
    if (match) {
      const teamPlayers = match.players.filter(p => p.teamSide === side);
      if (teamPlayers.length > 0) setSelectedPlayerId(teamPlayers[0].playerId);
    }
  };

  const handleSaveThrow = async () => {
    if (!match || effectiveness === null || !selectedPlayerId) return;

    try {
      await api.post(`/matches/${id}/throws`, {
        handNumber: match.hands.length + 1,
        teamSide: selectedTeam,
        playerId: selectedPlayerId,
        throwType,
        effectivenessScore: effectiveness,
        distanceD: distance ? parseFloat(distance) : undefined,
        note: note || undefined,
      });

      setEffectiveness(null);
      setDistance('');
      setNote('');

      fetchMatch();
    } catch (err) {
      console.error(err);
      alert('Error al guardar lanzamiento');
    }
  };

  const handleCloseHand = async (pointsTeam: 'A' | 'B' | null, pointsValue: number) => {
    try {
      await api.post(`/matches/${id}/hands/close`, {
        pointsTeam,
        pointsValue,
      });
      setClosingHand(false);
      fetchMatch();
    } catch (err) {
      console.error(err);
      alert('Error al cerrar mano');
    }
  };

  const handleCancelHand = async () => {
    if (!confirm('¿Seguro que quieres anular esta mano?')) return;
    try {
      await api.post(`/matches/${id}/hands/cancel`);
      fetchMatch();
    } catch (err) {
      console.error(err);
    }
  };

  const handleFinishMatch = async (reason: string) => {
    try {
      await api.post(`/matches/${id}/finish`, { endReason: reason });
      setFinishingMatch(false);
      fetchMatch();
      router.push(`/matches/${id}/performance`);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteThrow = async (throwId: string) => {
    if (!confirm('¿Eliminar lanzamiento?')) return;
    try {
      await api.delete(`/throws/${throwId}`);
      fetchMatch();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading || !match) return <div className="p-10 text-center font-black text-slate-400 animate-pulse">Cargando partida...</div>;

  const currentHandNumber = match.hands.length + 1;
  const currentHandThrows = match.throws.filter(t => t.handNumber === currentHandNumber);

  const scoreA = match.hands
    .filter(h => h.status === 'NORMAL' && h.pointsTeam === 'A')
    .reduce((acc, h) => acc + (h.pointsValue || 0), 0);
  const scoreB = match.hands
    .filter(h => h.status === 'NORMAL' && h.pointsTeam === 'B')
    .reduce((acc, h) => acc + (h.pointsValue || 0), 0);

  const ballsPerPlayer = match.modality === 'SINGLE' ? 3 : match.modality === 'DOUBLES' ? 3 : 2;

  const getBallsUsed = (playerId: string) => {
    return currentHandThrows.filter(t => t.playerId === playerId).length;
  };


  return (
    <div className="flex flex-col gap-6 pb-40">
      {/* Header Info */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass p-6 rounded-[2.5rem] shadow-xl shadow-slate-200/30 border border-white/50 flex flex-col gap-6"
      >
        <div className="flex justify-between items-center">
          <Link href="/" className="p-3 hover:bg-white/50 rounded-2xl transition-all active:scale-90"><ChevronLeft size={24} /></Link>
          <div className="text-[10px] font-black bg-brand-600 px-5 py-2.5 rounded-full text-white tracking-[0.2em] uppercase">
            Mano {currentHandNumber}
          </div>
          <Link href={`/matches/${id}/performance`} className="p-3 bg-brand-50 text-brand-600 rounded-2xl transition-all active:scale-90"><BarChart2 size={24} /></Link>
        </div>

        <div className="flex justify-between items-center gap-4">
          <div className="flex-1 text-center">
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 truncate">{match.teamAName}</div>
            <motion.div
              key={scoreA}
              initial={{ scale: 1.5, color: '#4f46e5' }}
              animate={{ scale: 1, color: '#4f46e5' }}
              className="text-6xl font-black tabular-nums"
            >
              {scoreA}
            </motion.div>
          </div>
          <div className="text-2xl font-black text-slate-200 italic">VS</div>
          <div className="flex-1 text-center">
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 truncate">{match.teamBName}</div>
            <motion.div
              key={scoreB}
              initial={{ scale: 1.5, color: '#f43f5e' }}
              animate={{ scale: 1, color: '#f43f5e' }}
              className="text-6xl font-black tabular-nums"
            >
              {scoreB}
            </motion.div>
          </div>
        </div>
      </motion.div>

      {match.status === 'FINISHED' ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-emerald-500 p-10 rounded-[3rem] text-center space-y-8 shadow-2xl shadow-emerald-200 relative overflow-hidden"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"
          />

          <div className="relative z-10 space-y-6">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto shadow-2xl">
              <Trophy size={48} className="text-emerald-500" />
            </div>
            <div>
              <h3 className="text-4xl font-black text-white tracking-tight uppercase leading-none">¡VICTORIA!</h3>
              <p className="text-emerald-100 font-black mt-4 text-2xl">
                {scoreA > scoreB ? match.teamAName : match.teamBName}
              </p>
            </div>

            <div className="pt-4 space-y-4">
              <Link
                href={`/matches/${id}/performance`}
                className="block w-full bg-white text-emerald-600 p-6 rounded-[2rem] font-black text-xl shadow-xl hover:bg-emerald-50 transition-all active:scale-95"
              >
                VER REPORTE FINAL
              </Link>
              <button
                onClick={() => {
                    if(confirm("¿Deseas reabrir la partida?")) {
                        api.post(`/matches/${id}/finish`, { status: 'IN_PROGRESS' }).then(() => fetchMatch());
                    }
                }}
                className="text-xs font-black text-white/60 hover:text-white underline uppercase tracking-widest transition-colors"
              >
                Reabrir para correcciones
              </button>
            </div>
          </div>
        </motion.div>
      ) : (
        <>
          {/* Throw Registration Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass p-6 rounded-[3rem] shadow-2xl shadow-slate-200/30 border border-white/50 space-y-8"
          >
            {/* Team & Player Selection */}
            <div className="space-y-4">
              <div className="flex p-1.5 bg-slate-100/50 rounded-[1.8rem] gap-1">
                <button
                  onClick={() => handleTeamChange('A')}
                  className={cn(
                    "flex-1 py-4 rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest transition-all",
                    selectedTeam === 'A' ? "bg-white text-brand-600 shadow-sm" : "text-slate-400"
                  )}
                >
                  {match.teamAName}
                </button>
                <button
                  onClick={() => handleTeamChange('B')}
                  className={cn(
                    "flex-1 py-4 rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest transition-all",
                    selectedTeam === 'B' ? "bg-white text-rose-600 shadow-sm" : "text-slate-400"
                  )}
                >
                  {match.teamBName}
                </button>
              </div>

              <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar px-1">
                {match.players
                  .filter(p => p.teamSide === selectedTeam)
                  .map(mp => {
                    const used = getBallsUsed(mp.playerId);
                    const isSelected = selectedPlayerId === mp.playerId;
                    return (
                      <motion.button
                        key={mp.playerId}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setSelectedPlayerId(mp.playerId)}
                        className={cn(
                          "flex-shrink-0 px-6 py-5 rounded-[2.2rem] border-2 transition-all flex flex-col items-center min-w-[110px]",
                          isSelected
                            ? (selectedTeam === 'A' ? "border-brand-600 bg-brand-50 text-brand-700 shadow-lg shadow-brand-100" : "border-rose-600 bg-rose-50 text-rose-700 shadow-lg shadow-rose-100")
                            : "border-transparent bg-slate-50 text-slate-400"
                        )}
                      >
                        <span className="text-[10px] font-black truncate w-24 text-center uppercase tracking-tight mb-3">{mp.player.name}</span>
                        <div className="flex gap-1.5">
                            {[...Array(ballsPerPlayer)].map((_, i) => (
                                <div key={i} className={cn(
                                    "w-2 h-2 rounded-full",
                                    i < used ? (selectedTeam === 'A' ? "bg-brand-600" : "bg-rose-600") : "bg-slate-200"
                                )} />
                            ))}
                        </div>
                      </motion.button>
                    );
                  })}
              </div>
            </div>

            {/* Type & Score */}
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setThrowType('POINT')}
                className={cn(
                  "py-5 rounded-[1.8rem] font-black text-xs uppercase tracking-widest border-2 transition-all flex items-center justify-center gap-2",
                  throwType === 'POINT' ? "bg-slate-900 text-white border-slate-900 shadow-xl" : "bg-slate-50 text-slate-400 border-transparent"
                )}
              >
                <Target size={16} /> Point
              </button>
              <button
                onClick={() => setThrowType('TIR')}
                className={cn(
                  "py-5 rounded-[1.8rem] font-black text-xs uppercase tracking-widest border-2 transition-all flex items-center justify-center gap-2",
                  throwType === 'TIR' ? "bg-slate-900 text-white border-slate-900 shadow-xl" : "bg-slate-50 text-slate-400 border-transparent"
                )}
              >
                <Zap size={16} /> Tir
              </button>
            </div>

            <div className="grid grid-cols-5 gap-2.5">
              {[-2, -1, 0, 1, 2].map(score => {
                const isSelected = effectiveness === score;
                const isPositive = score > 0;
                const isNegative = score < 0;

                return (
                  <motion.button
                    key={score}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setEffectiveness(score)}
                    className={cn(
                      "h-24 rounded-[1.8rem] text-3xl font-black transition-all flex flex-col items-center justify-center border-2",
                      isSelected
                        ? (isPositive ? "bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-200 scale-105 z-10" :
                           isNegative ? "bg-rose-500 text-white border-rose-500 shadow-lg shadow-rose-200 scale-105 z-10" :
                           "bg-slate-800 text-white border-slate-800 shadow-lg scale-105 z-10")
                        : "bg-slate-50 text-slate-400 border-transparent"
                    )}
                  >
                    {score > 0 ? `+${score}` : score}
                    <span className="text-[7px] font-black opacity-60 mt-1 uppercase tracking-tighter">
                      {score === -2 ? 'Pésimo' : score === -1 ? 'Mal' : score === 0 ? 'Neutro' : score === 1 ? 'Bien' : 'Exc.'}
                    </span>
                  </motion.button>
                );
              })}
            </div>

            <div className="flex gap-3">
                <div className="flex-1 bg-slate-50/50 rounded-2xl p-4 flex items-center gap-3 border-2 border-transparent focus-within:border-brand-400 focus-within:bg-white transition-all">
                    <span className="text-[10px] font-black text-slate-300 uppercase italic">Dist</span>
                    <input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={distance}
                        onChange={(e) => setDistance(e.target.value)}
                        className="w-full bg-transparent border-0 focus:ring-0 outline-none font-bold text-slate-700"
                    />
                </div>
                <div className="flex-[1.5] bg-slate-50/50 rounded-2xl p-4 flex items-center gap-3 border-2 border-transparent focus-within:border-brand-400 focus-within:bg-white transition-all">
                    <span className="text-[10px] font-black text-slate-300 uppercase italic">Nota</span>
                    <input
                        type="text"
                        placeholder="..."
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        className="w-full bg-transparent border-0 focus:ring-0 outline-none font-bold text-slate-700"
                    />
                </div>
            </div>
          </motion.div>

          {/* Floating Actions Container */}
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-md glass rounded-[2.5rem] p-4 shadow-2xl z-40 flex gap-4 ring-1 ring-white/50 backdrop-blur-2xl">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleSaveThrow}
              disabled={effectiveness === null}
              className="flex-[2.5] bg-brand-600 text-white py-6 rounded-[2rem] font-black text-xl shadow-xl shadow-brand-200 disabled:bg-slate-200 disabled:shadow-none transition-all flex items-center justify-center gap-3"
            >
              <Save size={24} />
              GUARDAR BOLA
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setClosingHand(true)}
              className="flex-1 bg-white border-2 border-slate-900 text-slate-900 py-6 rounded-[2rem] font-black text-[10px] uppercase tracking-widest flex items-center justify-center text-center leading-tight"
            >
              FIN<br/>MANO
            </motion.button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={handleCancelHand}
              className="glass border-white/50 text-slate-400 p-6 rounded-[2.5rem] font-black text-[10px] uppercase tracking-widest flex flex-col items-center gap-3 hover:bg-white hover:text-rose-500 transition-all shadow-sm"
            >
              <RotateCcw size={24} />
              Anular Mano
            </button>
            <button
              onClick={() => setFinishingMatch(true)}
              className="glass border-white/50 text-slate-400 p-6 rounded-[2.5rem] font-black text-[10px] uppercase tracking-widest flex flex-col items-center gap-3 hover:bg-white hover:text-brand-500 transition-all shadow-sm"
            >
              <AlertCircle size={24} />
              Terminar
            </button>
          </div>
        </>
      )}

      {/* History Section */}
      <div className="space-y-4 pt-10">
          <div className="flex items-center justify-between px-4">
            <h3 className="font-black text-slate-400 uppercase tracking-widest text-[10px] flex items-center gap-2">
                <History size={14} /> Historial
            </h3>
            <button
                onClick={() => setShowHistory(!showHistory)}
                className="text-[10px] font-black text-brand-600 uppercase tracking-widest"
            >
                {showHistory ? 'Ocultar' : 'Ver todo'}
            </button>
          </div>

          <AnimatePresence>
            {showHistory && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-4 overflow-hidden px-1"
                >
                {[...Array(currentHandNumber)].map((_, i) => {
                    const hNum = currentHandNumber - i;
                    const hThrows = match.throws.filter(t => t.handNumber === hNum);
                    const handRecord = match.hands.find(h => h.handNumber === hNum);

                    if (hThrows.length === 0 && !handRecord) return null;

                    return (
                    <div key={hNum} className="glass rounded-[2rem] border-white/50 overflow-hidden shadow-sm">
                        <div className="bg-slate-50/50 p-5 flex justify-between items-center border-b border-white/50">
                        <span className="font-black text-slate-800 text-xs">MANO {hNum}</span>
                        {handRecord ? (
                            handRecord.status === 'CANCELED' ? (
                                <span className="text-[10px] font-black text-rose-500 bg-rose-50 px-3 py-1 rounded-full uppercase">Anulada</span>
                            ) : (
                                <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-4 py-1.5 rounded-full uppercase">
                                    {handRecord.pointsTeam === 'A' ? match.teamAName : match.teamBName} +{handRecord.pointsValue}
                                </span>
                            )
                        ) : (
                            <span className="text-[10px] font-black text-brand-500 bg-brand-50 px-3 py-1 rounded-full uppercase animate-pulse">En Curso</span>
                        )}
                        </div>
                        <div className="divide-y divide-white/20">
                        {hThrows.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map(t => (
                            <div key={t.id} className="p-5 flex items-center justify-between gap-4">
                            <div className="flex items-center gap-4 flex-1 overflow-hidden">
                                <div className={cn(
                                "w-11 h-11 rounded-2xl flex items-center justify-center font-black text-sm shadow-sm",
                                t.effectivenessScore > 0 ? "bg-emerald-500 text-white" : t.effectivenessScore < 0 ? "bg-rose-500 text-white" : "bg-slate-200 text-slate-600"
                                )}>
                                {t.effectivenessScore > 0 ? `+${t.effectivenessScore}` : t.effectivenessScore}
                                </div>
                                <div className="overflow-hidden">
                                <div className="text-sm font-black text-slate-700 truncate">
                                    {t.player?.name}
                                </div>
                                <div className="flex items-center gap-2 mt-0.5">
                                    <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">{t.throwType}</span>
                                    {t.note && <span className="text-[9px] text-slate-400 font-medium truncate italic border-l border-slate-200 pl-2">{t.note}</span>}
                                </div>
                                </div>
                            </div>
                            <button
                                onClick={() => handleDeleteThrow(t.id)}
                                className="w-10 h-10 flex items-center justify-center text-slate-200 hover:text-rose-500 transition-colors active:scale-90"
                            >
                                <Trash2 size={18} />
                            </button>
                            </div>
                        ))}
                        </div>
                    </div>
                    );
                })}
                </motion.div>
            )}
          </AnimatePresence>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {closingHand && (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-end sm:items-center justify-center p-4">
            <motion.div
                initial={{ y: 200, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 200, opacity: 0 }}
                className="bg-white w-full max-w-md rounded-[3.5rem] p-10 space-y-10 shadow-2xl"
            >
                <div className="text-center">
                    <h3 className="text-3xl font-black text-slate-800 uppercase tracking-tight">Cerrar Mano {currentHandNumber}</h3>
                    <p className="text-slate-400 font-bold mt-2 text-sm">¿Quién sumó puntos en esta mano?</p>
                </div>

                <div className="space-y-8">
                <div className="grid grid-cols-2 gap-4">
                    <button
                        onClick={() => handleCloseHand('A', 1)}
                        className="bg-brand-600 text-white p-7 rounded-[2.5rem] font-black shadow-xl shadow-brand-100 hover:bg-brand-700 active:scale-95 transition-all text-sm uppercase tracking-widest"
                    >
                        {match.teamAName}
                    </button>
                    <button
                        onClick={() => handleCloseHand('B', 1)}
                        className="bg-rose-600 text-white p-7 rounded-[2.5rem] font-black shadow-xl shadow-rose-100 hover:bg-rose-700 active:scale-95 transition-all text-sm uppercase tracking-widest"
                    >
                        {match.teamBName}
                    </button>
                </div>

                <div className="bg-slate-50/50 p-8 rounded-[3rem] space-y-6 border border-slate-100">
                    <span className="block text-center text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Puntuación Específica</span>
                    <div className="grid grid-cols-3 gap-3">
                        {[1,2,3,4,5,6].map(v => (
                        <div key={v} className="flex flex-col gap-2">
                            <button onClick={() => handleCloseHand('A', v)} className="bg-white text-brand-600 py-3.5 rounded-2xl font-black text-xs shadow-sm active:bg-brand-50 border border-slate-100">+A {v}</button>
                            <button onClick={() => handleCloseHand('B', v)} className="bg-white text-rose-600 py-3.5 rounded-2xl font-black text-xs shadow-sm active:bg-rose-50 border border-slate-100">+B {v}</button>
                        </div>
                        ))}
                    </div>
                </div>
                </div>

                <button
                onClick={() => setClosingHand(false)}
                className="w-full py-4 text-slate-300 font-black uppercase tracking-widest text-xs hover:text-slate-500 transition-colors"
                >
                Volver
                </button>
            </motion.div>
            </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {finishingMatch && (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-end sm:items-center justify-center p-4">
            <motion.div
                initial={{ y: 200, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 200, opacity: 0 }}
                className="bg-white w-full max-w-md rounded-[3.5rem] p-10 space-y-10 shadow-2xl"
            >
                <div className="text-center">
                    <h3 className="text-3xl font-black text-slate-800 uppercase tracking-tight">Finalizar</h3>
                    <p className="text-slate-400 font-bold mt-2 text-sm">¿Deseas concluir la partida ahora?</p>
                </div>

                <div className="space-y-4">
                <button
                    onClick={() => handleFinishMatch('MANUAL')}
                    className="w-full p-7 bg-slate-900 text-white rounded-[2.5rem] font-black text-sm uppercase tracking-widest shadow-xl active:scale-95 transition-all"
                >
                    Finalizar Partida
                </button>
                <button
                    onClick={() => setFinishingMatch(false)}
                    className="w-full p-7 bg-slate-50 text-slate-400 rounded-[2.5rem] font-black text-sm uppercase tracking-widest active:scale-95 transition-all"
                >
                    Continuar Jugando
                </button>
                </div>
            </motion.div>
            </div>
        )}
      </AnimatePresence>
    </div>
  );
}
