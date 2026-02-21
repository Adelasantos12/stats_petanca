'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Match } from '@/types';
import {
  ChevronLeft,
  History,
  BarChart2,
  XCircle,
  CheckCircle2,
  Save,
  Trash2,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

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

      // Reset form (keep team and player for speed)
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

  if (loading || !match) return <div className="p-10 text-center">Cargando partida...</div>;

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
    <div className="flex flex-col gap-4 pb-24">
      {/* Header Info */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col gap-3">
        <div className="flex justify-between items-center">
          <Link href="/" className="text-slate-400"><ChevronLeft size={24} /></Link>
          <div className="text-sm font-bold bg-slate-100 px-3 py-1 rounded-full text-slate-600">
            MANO {currentHandNumber}
          </div>
          <Link href={`/matches/${id}/performance`} className="text-blue-600"><BarChart2 size={24} /></Link>
        </div>

        <div className="flex justify-between items-center gap-4">
          <div className="flex-1 text-center">
            <div className="text-xs font-bold text-slate-400 uppercase truncate">{match.teamAName}</div>
            <div className="text-4xl font-black text-blue-600">{scoreA}</div>
          </div>
          <div className="text-2xl font-black text-slate-300">vs</div>
          <div className="flex-1 text-center">
            <div className="text-xs font-bold text-slate-400 uppercase truncate">{match.teamBName}</div>
            <div className="text-4xl font-black text-red-600">{scoreB}</div>
          </div>
        </div>
      </div>

      {match.status === 'FINISHED' ? (
        <div className="bg-green-50 border-2 border-green-200 p-6 rounded-xl text-center space-y-4">
          <CheckCircle2 size={48} className="mx-auto text-green-500" />
          <div>
            <h3 className="text-xl font-bold text-green-800">PARTIDA FINALIZADA</h3>
            <p className="text-green-600">Motivo: {match.endReason}</p>
          </div>
          <Link
            href={`/matches/${id}/performance`}
            className="block w-full bg-green-600 text-white p-3 rounded-lg font-bold shadow-md"
          >
            VER PERFORMANCE FINAL
          </Link>
          <button
            onClick={() => {
                if(confirm("¿Deseas reabrir la partida para correcciones?")) {
                    api.post(`/matches/${id}/finish`, { status: 'IN_PROGRESS' }).then(() => fetchMatch());
                }
            }}
            className="text-xs text-green-700 underline"
          >
            Desbloquear edición (Modo corrección)
          </button>
        </div>
      ) : (
        <>
          {/* Throw Registration Form */}
          <div className="bg-white p-4 rounded-xl shadow-lg border-2 border-blue-50 space-y-5">
            {/* Team & Player Selection */}
            <div className="space-y-3">
              <div className="flex gap-2">
                <button
                  onClick={() => handleTeamChange('A')}
                  className={cn(
                    "flex-1 py-2 rounded-lg font-bold text-sm transition-all border-2",
                    selectedTeam === 'A' ? "bg-blue-600 text-white border-blue-600 shadow-md" : "bg-white text-slate-400 border-slate-100"
                  )}
                >
                  {match.teamAName}
                </button>
                <button
                  onClick={() => handleTeamChange('B')}
                  className={cn(
                    "flex-1 py-2 rounded-lg font-bold text-sm transition-all border-2",
                    selectedTeam === 'B' ? "bg-red-600 text-white border-red-600 shadow-md" : "bg-white text-slate-400 border-slate-100"
                  )}
                >
                  {match.teamBName}
                </button>
              </div>

              <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                {match.players
                  .filter(p => p.teamSide === selectedTeam)
                  .map(mp => {
                    const used = getBallsUsed(mp.playerId);
                    return (
                      <button
                        key={mp.playerId}
                        onClick={() => setSelectedPlayerId(mp.playerId)}
                        className={cn(
                          "flex-shrink-0 px-4 py-3 rounded-xl border-2 transition-all flex flex-col items-center min-w-[80px]",
                          selectedPlayerId === mp.playerId
                            ? (selectedTeam === 'A' ? "border-blue-600 bg-blue-50 text-blue-700 shadow-sm" : "border-red-600 bg-red-50 text-red-700 shadow-sm")
                            : "border-slate-100 bg-slate-50 text-slate-500"
                        )}
                      >
                        <span className="text-xs font-bold truncate w-20 text-center">{mp.player.name}</span>
                        <span className={cn(
                          "text-xs font-black mt-1",
                          used >= ballsPerPlayer ? "text-orange-500" : "text-slate-400"
                        )}>
                          {used}/{ballsPerPlayer}
                        </span>
                      </button>
                    );
                  })}
              </div>
            </div>

            {/* Type & Score */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setThrowType('POINT')}
                className={cn(
                  "py-3 rounded-lg font-black border-2 transition-all",
                  throwType === 'POINT' ? "bg-slate-800 text-white border-slate-800" : "bg-slate-50 text-slate-400 border-slate-100"
                )}
              >
                POINT
              </button>
              <button
                onClick={() => setThrowType('TIR')}
                className={cn(
                  "py-3 rounded-lg font-black border-2 transition-all",
                  throwType === 'TIR' ? "bg-slate-800 text-white border-slate-800" : "bg-slate-50 text-slate-400 border-slate-100"
                )}
              >
                TIR
              </button>
            </div>

            <div className="grid grid-cols-5 gap-1.5">
              {[-2, -1, 0, 1, 2].map(score => (
                <button
                  key={score}
                  onClick={() => setEffectiveness(score)}
                  className={cn(
                    "h-16 rounded-lg text-2xl font-black transition-all flex flex-col items-center justify-center border-2",
                    effectiveness === score
                      ? "bg-blue-600 text-white border-blue-600 scale-105 z-10 shadow-lg"
                      : "bg-slate-50 text-slate-600 border-slate-100"
                  )}
                >
                  {score > 0 ? `+${score}` : score}
                  <span className="text-[8px] font-bold opacity-70 mt-[-2px]">
                    {score === -2 ? 'PÉSIMO' : score === -1 ? 'MAL' : score === 0 ? 'NEUTRO' : score === 1 ? 'BIEN' : 'EXC.'}
                  </span>
                </button>
              ))}
            </div>

            <div className="flex gap-2">
                <input
                    type="number"
                    step="0.01"
                    placeholder="Distancia (d)"
                    value={distance}
                    onChange={(e) => setDistance(e.target.value)}
                    className="flex-1 p-3 bg-slate-50 rounded-lg text-sm border-0 focus:ring-2 focus:ring-blue-600"
                />
                <input
                    type="text"
                    placeholder="Nota"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="flex-[2] p-3 bg-slate-50 rounded-lg text-sm border-0 focus:ring-2 focus:ring-blue-600"
                />
            </div>

            <button
              onClick={handleSaveThrow}
              disabled={effectiveness === null}
              className="w-full bg-blue-600 text-white py-4 rounded-xl font-black text-xl shadow-blue-200 shadow-xl disabled:bg-slate-200 transition-all flex items-center justify-center gap-2"
            >
              <Save size={24} />
              GUARDAR BOLA
            </button>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setClosingHand(true)}
              className="bg-white border-2 border-slate-800 text-slate-800 p-4 rounded-xl font-bold flex flex-col items-center gap-1 shadow-sm"
            >
              <CheckCircle2 className="text-green-600" />
              CERRAR MANO
            </button>
            <button
              onClick={handleCancelHand}
              className="bg-white border-2 border-slate-200 text-slate-400 p-4 rounded-xl font-bold flex flex-col items-center gap-1"
            >
              <XCircle className="text-slate-400" />
              MANO ANULADA
            </button>
          </div>

          <button
            onClick={() => setFinishingMatch(true)}
            className="w-full bg-slate-100 text-slate-500 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2"
          >
            <AlertCircle size={18} />
            FINALIZAR PARTIDA
          </button>
        </>
      )}

      {/* History Toggle */}
      <button
        onClick={() => setShowHistory(!showHistory)}
        className="flex items-center gap-2 text-slate-500 font-bold px-2"
      >
        <History size={18} />
        {showHistory ? 'Ocultar historial' : 'Ver historial de lanzamientos'}
      </button>

      {showHistory && (
        <div className="space-y-4">
          {[...Array(currentHandNumber)].map((_, i) => {
            const hNum = currentHandNumber - i;
            const hThrows = match.throws.filter(t => t.handNumber === hNum);
            const handRecord = match.hands.find(h => h.handNumber === hNum);

            if (hThrows.length === 0 && !handRecord) return null;

            return (
              <div key={hNum} className="bg-white rounded-xl border border-slate-100 overflow-hidden shadow-sm">
                <div className="bg-slate-50 p-3 flex justify-between items-center border-b border-slate-100">
                  <span className="font-bold text-slate-700">MANO {hNum}</span>
                  {handRecord ? (
                    handRecord.status === 'CANCELED' ? (
                        <span className="text-xs font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded">ANULADA</span>
                    ) : (
                        <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded">
                            {handRecord.pointsTeam === 'A' ? match.teamAName : match.teamBName} +{handRecord.pointsValue}
                        </span>
                    )
                  ) : (
                    <span className="text-xs font-bold text-blue-500 bg-blue-50 px-2 py-0.5 rounded">EN CURSO</span>
                  )}
                </div>
                <div className="divide-y divide-slate-50">
                  {hThrows.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map(t => (
                    <div key={t.id} className="p-3 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 flex-1 overflow-hidden">
                        <div className={cn(
                          "w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm",
                          t.effectivenessScore > 0 ? "bg-green-100 text-green-700" : t.effectivenessScore < 0 ? "bg-red-100 text-red-700" : "bg-slate-100 text-slate-700"
                        )}>
                          {t.effectivenessScore > 0 ? `+${t.effectivenessScore}` : t.effectivenessScore}
                        </div>
                        <div className="overflow-hidden">
                          <div className="text-sm font-bold truncate">
                            {t.player?.name} <span className="text-[10px] text-slate-400">({t.throwType})</span>
                          </div>
                          {t.note && <div className="text-[10px] text-slate-400 italic truncate">{t.note}</div>}
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteThrow(t.id)}
                        className="text-slate-300 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      {closingHand && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 space-y-6 animate-in slide-in-from-bottom duration-300">
            <h3 className="text-xl font-black text-center">CERRAR MANO {currentHandNumber}</h3>

            <div className="space-y-4">
              <label className="block text-center font-bold text-slate-500">¿Quién ganó la mano?</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleCloseHand('A', 1)}
                  className="bg-blue-600 text-white p-4 rounded-xl font-bold shadow-lg"
                >
                  {match.teamAName}
                </button>
                <button
                  onClick={() => handleCloseHand('B', 1)}
                  className="bg-red-600 text-white p-4 rounded-xl font-bold shadow-lg"
                >
                  {match.teamBName}
                </button>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-[1px] bg-slate-100"></div>
                <span className="text-xs font-bold text-slate-300">O INGRESA PUNTOS</span>
                <div className="flex-1 h-[1px] bg-slate-100"></div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[1,2,3,4,5,6].map(v => (
                  <div key={v} className="flex flex-col gap-1">
                     <button onClick={() => handleCloseHand('A', v)} className="bg-blue-50 text-blue-600 p-2 rounded-lg font-bold text-xs">A +{v}</button>
                     <button onClick={() => handleCloseHand('B', v)} className="bg-red-50 text-red-600 p-2 rounded-lg font-bold text-xs">B +{v}</button>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => setClosingHand(false)}
              className="w-full p-4 text-slate-400 font-bold"
            >
              CANCELAR
            </button>
          </div>
        </div>
      )}

      {finishingMatch && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 space-y-6">
            <h3 className="text-xl font-black text-center text-slate-800">FINALIZAR PARTIDA</h3>
            <div className="space-y-3">
              <button
                onClick={() => handleFinishMatch('TARGET_REACHED')}
                className="w-full p-4 bg-slate-800 text-white rounded-xl font-bold"
              >
                PUNTUACIÓN ALCANZADA
              </button>
              <button
                onClick={() => handleFinishMatch('TIME')}
                className="w-full p-4 bg-slate-100 text-slate-700 rounded-xl font-bold"
              >
                POR TIEMPO
              </button>
              <button
                onClick={() => handleFinishMatch('MANUAL')}
                className="w-full p-4 bg-slate-100 text-slate-700 rounded-xl font-bold"
              >
                FINALIZADO MANUALMENTE
              </button>
            </div>
            <button
              onClick={() => setFinishingMatch(false)}
              className="w-full p-4 text-slate-400 font-bold"
            >
              CANCELAR
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
