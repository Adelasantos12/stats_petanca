'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Modality } from '@/types';
import { ChevronLeft, Play, UserPlus, Users, Settings } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

export default function NewMatch() {
  const router = useRouter();
  const [modality, setModality] = useState<Modality>('SINGLE');
  const [targetPoints, setTargetPoints] = useState(13);
  const [teamAName, setTeamAName] = useState('Equipo A');
  const [teamBName, setTeamBName] = useState('Equipo B');
  const [playersA, setPlayersA] = useState<string[]>(['']);
  const [playersB, setPlayersB] = useState<string[]>(['']);
  const [loading, setLoading] = useState(false);

  const handleModalityChange = (m: Modality) => {
    setModality(m);
    const count = m === 'SINGLE' ? 1 : m === 'DOUBLES' ? 2 : 3;
    setPlayersA(Array(count).fill('').map((_, i) => playersA[i] || ''));
    setPlayersB(Array(count).fill('').map((_, i) => playersB[i] || ''));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/matches', {
        modality,
        targetPoints,
        teamAName,
        teamBName,
        playersA: playersA.filter(p => p.trim() !== ''),
        playersB: playersB.filter(p => p.trim() !== ''),
      });
      router.push(`/matches/${res.data.id}`);
    } catch (err: unknown) {
      console.error(err);
      const message =
        typeof err === 'object' &&
        err !== null &&
        'response' in err &&
        typeof (err as { response?: { data?: { message?: string | string[] } } }).response?.data?.message !==
          'undefined'
          ? (Array.isArray((err as { response?: { data?: { message?: string | string[] } } }).response?.data?.message)
              ? (err as { response?: { data?: { message?: string[] } } }).response?.data?.message?.join(', ')
              : (err as { response?: { data?: { message?: string } } }).response?.data?.message)
          : 'Error al crear la partida';

      alert(message || 'Error al crear la partida');
      setLoading(false);
    }
  };

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

      <form onSubmit={handleSubmit} className="space-y-10">
        {/* Modality Selection */}
        <section className="bg-white/80 backdrop-blur-sm p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 space-y-6">
          <h3 className="font-black text-slate-800 flex items-center gap-2 text-lg">
            <Users size={20} className="text-indigo-600" /> Modalidad de Juego
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
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-lg shadow-indigo-100'
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
            <Settings size={20} className="text-indigo-600" /> Configuración
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
                className="flex-1 accent-indigo-600"
              />
              <span className="w-12 h-12 bg-indigo-600 text-white rounded-xl flex items-center justify-center font-black text-xl shadow-lg shadow-indigo-200">
                {targetPoints}
              </span>
            </div>
          </div>
        </section>

        {/* Teams and Players */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Team A */}
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

            <div className="space-y-5 pt-2">
              <AnimatePresence mode='popLayout'>
                {playersA.map((name, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                  >
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Jugador {i + 1}</label>
                    <input
                      required
                      placeholder={`Nombre Jugador ${i + 1}`}
                      value={name}
                      onChange={(e) => {
                        const newPlayers = [...playersA];
                        newPlayers[i] = e.target.value;
                        setPlayersA(newPlayers);
                      }}
                      className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl transition-all outline-none font-bold"
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.section>

          {/* Team B */}
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

            <div className="space-y-5 pt-2">
              <AnimatePresence mode='popLayout'>
                {playersB.map((name, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                  >
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Jugador {i + 1}</label>
                    <input
                      required
                      placeholder={`Nombre Jugador ${i + 1}`}
                      value={name}
                      onChange={(e) => {
                        const newPlayers = [...playersB];
                        newPlayers[i] = e.target.value;
                        setPlayersB(newPlayers);
                      }}
                      className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-rose-500 focus:bg-white rounded-2xl transition-all outline-none font-bold"
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.section>
        </div>

        <motion.button
          type="submit"
          disabled={loading}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full bg-indigo-600 text-white p-6 rounded-[2rem] font-black text-2xl flex items-center justify-center gap-3 shadow-2xl shadow-indigo-200 disabled:bg-slate-300 transition-all hover:bg-indigo-700 active:shadow-inner"
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
