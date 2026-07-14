'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api, { apiErrorMessage } from '@/lib/api';
import { getToken } from '@/lib/auth';
import { Modality } from '@/types';
import { ChevronLeft, Play, UserPlus, Users, Settings } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

interface RosterPlayer {
  id: string;
  name: string;
  level: string | null;
}

// Cada casilla de jugador: elegida del roster (id) o escrita a mano (name).
interface Slot {
  id: string; // id del roster o '' si es nombre libre
  name: string;
}

const CUSTOM = '__custom__';

export default function NewMatch() {
  const router = useRouter();
  const [modality, setModality] = useState<Modality>('SINGLE');
  const [targetPoints, setTargetPoints] = useState(13);
  const [teamAName, setTeamAName] = useState('Equipo A');
  const [teamBName, setTeamBName] = useState('Equipo B');
  const [playersA, setPlayersA] = useState<Slot[]>([{ id: '', name: '' }]);
  const [playersB, setPlayersB] = useState<Slot[]>([{ id: '', name: '' }]);
  const [roster, setRoster] = useState<RosterPlayer[]>([]);
  const [loading, setLoading] = useState(false);

  // Solo cargamos el roster si el coach tiene sesión (evita el 401 anónimo).
  useEffect(() => {
    if (!getToken()) return;
    api
      .get('/players')
      .then((res) => setRoster(res.data))
      .catch(() => {});
  }, []);

  const resize = (slots: Slot[], count: number): Slot[] =>
    Array(count)
      .fill(null)
      .map((_, i) => slots[i] || { id: '', name: '' });

  const handleModalityChange = (m: Modality) => {
    setModality(m);
    const count = m === 'SINGLE' ? 1 : m === 'DOUBLES' ? 2 : 3;
    setPlayersA(resize(playersA, count));
    setPlayersB(resize(playersB, count));
  };

  const toPayload = (slots: Slot[]) =>
    slots
      .filter((s) => s.id || s.name.trim() !== '')
      .map((s) => (s.id ? { id: s.id } : { name: s.name.trim() }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/matches', {
        modality,
        targetPoints,
        teamAName,
        teamBName,
        playersA: toPayload(playersA),
        playersB: toPayload(playersB),
      });
      router.push(`/matches/${res.data.id}`);
    } catch (err) {
      alert(apiErrorMessage(err) || 'Error al crear la partida');
      setLoading(false);
    }
  };

  const renderSlots = (
    slots: Slot[],
    setSlots: (s: Slot[]) => void,
    focusClass: string,
  ) => (
    <div className="space-y-5 pt-2">
      <AnimatePresence mode="popLayout">
        {slots.map((slot, i) => {
          const usingCustom = !slot.id;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">
                Jugador {i + 1}
              </label>

              {roster.length > 0 && (
                <select
                  value={slot.id || CUSTOM}
                  onChange={(e) => {
                    const v = e.target.value;
                    const next = [...slots];
                    if (v === CUSTOM) {
                      next[i] = { id: '', name: '' };
                    } else {
                      const p = roster.find((r) => r.id === v);
                      next[i] = { id: v, name: p?.name ?? '' };
                    }
                    setSlots(next);
                  }}
                  className={`w-full p-4 mb-2 bg-slate-50 border-2 border-transparent ${focusClass} focus:bg-white rounded-2xl transition-all outline-none font-bold`}
                >
                  <option value={CUSTOM}>✏️ Escribir nombre (invitado)</option>
                  {roster.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                      {r.level ? ` · ${r.level}` : ''}
                    </option>
                  ))}
                </select>
              )}

              {usingCustom && (
                <input
                  required
                  placeholder={`Nombre Jugador ${i + 1}`}
                  value={slot.name}
                  onChange={(e) => {
                    const next = [...slots];
                    next[i] = { id: '', name: e.target.value };
                    setSlots(next);
                  }}
                  className={`w-full p-4 bg-slate-50 border-2 border-transparent ${focusClass} focus:bg-white rounded-2xl transition-all outline-none font-bold`}
                />
              )}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-10 pb-20"
    >
      <div className="flex items-center gap-4">
        <Link href="/" className="p-3 hover:bg-white rounded-2xl transition-all shadow-sm active:scale-90">
          <ChevronLeft size={24} className="text-slate-600" />
        </Link>
        <h2 className="text-3xl font-black text-slate-800 tracking-tight text-balance">Nueva Partida</h2>
      </div>

      {roster.length > 0 && (
        <div className="bg-brand-50/60 border border-brand-100 rounded-2xl px-5 py-3 text-sm font-semibold text-brand-900/70">
          Elige jugadores de tu roster para que su rendimiento se acumule en su
          perfil, o escribe un nombre para un invitado.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-10">
        {/* Modality Selection */}
        <section className="bg-white/80 backdrop-blur-sm p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 space-y-6">
          <h3 className="font-black text-slate-800 flex items-center gap-2 text-lg">
            <Users size={20} className="text-brand-600" /> Modalidad de Juego
          </h3>
          <div className="grid grid-cols-3 gap-3">
            {(['SINGLE', 'DOUBLES', 'TRIPLES'] as Modality[]).map((m) => (
              <motion.button
                key={m}
                type="button"
                whileTap={{ scale: 0.95 }}
                onClick={() => handleModalityChange(m)}
                className={`py-4 rounded-2xl border-2 font-black transition-all ${
                  modality === m
                    ? 'border-brand-600 bg-brand-50 text-brand-700 shadow-lg shadow-brand-100'
                    : 'border-slate-50 bg-slate-50 text-slate-400'
                }`}
              >
                {m === 'SINGLE' ? 'Individual' : m === 'DOUBLES' ? 'Dupla' : 'Tripla'}
              </motion.button>
            ))}
          </div>
        </section>

        {/* Configuration */}
        <section className="bg-white/80 backdrop-blur-sm p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 space-y-6">
          <h3 className="font-black text-slate-800 flex items-center gap-2 text-lg">
            <Settings size={20} className="text-brand-600" /> Configuración
          </h3>
          <div className="max-w-xs">
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Puntos Objetivo</label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="1"
                max="30"
                value={targetPoints}
                onChange={(e) => setTargetPoints(parseInt(e.target.value))}
                className="flex-1 accent-brand-600"
              />
              <span className="w-12 h-12 bg-brand-600 text-white rounded-xl flex items-center justify-center font-black text-xl shadow-lg shadow-brand-200">
                {targetPoints}
              </span>
            </div>
          </div>
        </section>

        {/* Teams and Players */}
        <div className="grid md:grid-cols-2 gap-8">
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/80 backdrop-blur-sm p-8 rounded-[2.5rem] shadow-xl shadow-blue-100/50 border border-slate-100 space-y-6"
          >
            <div className="flex items-center gap-3 border-b border-slate-50 pb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
                <UserPlus size={20} />
              </div>
              <input
                placeholder="Nombre del equipo"
                value={teamAName}
                onChange={(e) => setTeamAName(e.target.value)}
                className="flex-1 text-xl font-black text-slate-800 bg-transparent border-0 focus:ring-0 outline-none placeholder:text-slate-300"
              />
            </div>
            {renderSlots(playersA, setPlayersA, 'focus:border-blue-500')}
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/80 backdrop-blur-sm p-8 rounded-[2.5rem] shadow-xl shadow-rose-100/50 border border-slate-100 space-y-6"
          >
            <div className="flex items-center gap-3 border-b border-slate-50 pb-4">
              <div className="w-10 h-10 bg-rose-100 rounded-xl flex items-center justify-center text-rose-600">
                <UserPlus size={20} />
              </div>
              <input
                placeholder="Nombre del equipo"
                value={teamBName}
                onChange={(e) => setTeamBName(e.target.value)}
                className="flex-1 text-xl font-black text-slate-800 bg-transparent border-0 focus:ring-0 outline-none placeholder:text-slate-300"
              />
            </div>
            {renderSlots(playersB, setPlayersB, 'focus:border-rose-500')}
          </motion.section>
        </div>

        <motion.button
          type="submit"
          disabled={loading}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full bg-brand-600 text-white p-6 rounded-[2rem] font-black text-2xl flex items-center justify-center gap-3 shadow-2xl shadow-brand-200 disabled:bg-slate-300 transition-all hover:bg-brand-700 active:shadow-inner"
        >
          {loading ? 'Creando...' : (
            <>
              <Play size={28} fill="white" />
              INICIAR PARTIDA
            </>
          )}
        </motion.button>
      </form>
    </motion.div>
  );
}
