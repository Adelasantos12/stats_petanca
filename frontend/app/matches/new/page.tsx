'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Modality } from '@/types';
import { ChevronLeft, Play, UserPlus, Users } from 'lucide-react';
import Link from 'next/link';

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
    } catch (err) {
      console.error(err);
      alert('Error al crear la partida');
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-10">
      <div className="flex items-center gap-4">
        <Link href="/" className="p-2 hover:bg-slate-100 rounded-full transition-colors">
          <ChevronLeft size={24} />
        </Link>
        <h2 className="text-2xl font-bold">Nueva Partida</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Modality Selection */}
        <section className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 space-y-4">
          <h3 className="font-bold text-slate-700 flex items-center gap-2">
            <Users size={18} /> Modalidad
          </h3>
          <div className="grid grid-cols-3 gap-2">
            {(['SINGLE', 'DOUBLES', 'TRIPLES'] as Modality[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => handleModalityChange(m)}
                className={`py-3 rounded-lg border-2 font-bold transition-all ${
                  modality === m
                    ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-sm'
                    : 'border-slate-100 bg-slate-50 text-slate-400'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </section>

        {/* Configuration */}
        <section className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 space-y-4">
          <h3 className="font-bold text-slate-700 flex items-center gap-2">
            ⚙️ Configuración
          </h3>
          <div>
            <label className="block text-sm font-semibold text-slate-500 mb-1">Puntos Objetivo</label>
            <input
              type="number"
              value={targetPoints}
              onChange={(e) => setTargetPoints(parseInt(e.target.value))}
              className="w-full p-3 bg-slate-50 border-0 rounded-lg focus:ring-2 focus:ring-blue-600 font-bold"
              min="1"
              max="50"
            />
          </div>
        </section>

        {/* Teams and Players */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Team A */}
          <section className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 space-y-4">
            <h3 className="font-bold text-blue-600 flex items-center gap-2 border-b pb-2">
              <UserPlus size={18} /> Equipo A
            </h3>
            <input
              placeholder="Nombre del equipo"
              value={teamAName}
              onChange={(e) => setTeamAName(e.target.value)}
              className="w-full p-2 text-lg font-bold border-b-2 border-slate-100 focus:border-blue-600 outline-none"
            />
            <div className="space-y-3 pt-2">
              {playersA.map((name, i) => (
                <div key={i}>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Jugador {i + 1}</label>
                  <input
                    required
                    placeholder={`Nombre Jugador ${i + 1}`}
                    value={name}
                    onChange={(e) => {
                      const newPlayers = [...playersA];
                      newPlayers[i] = e.target.value;
                      setPlayersA(newPlayers);
                    }}
                    className="w-full p-3 bg-slate-50 border-0 rounded-lg focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              ))}
            </div>
          </section>

          {/* Team B */}
          <section className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 space-y-4">
            <h3 className="font-bold text-red-600 flex items-center gap-2 border-b pb-2">
              <UserPlus size={18} /> Equipo B
            </h3>
            <input
              placeholder="Nombre del equipo"
              value={teamBName}
              onChange={(e) => setTeamBName(e.target.value)}
              className="w-full p-2 text-lg font-bold border-b-2 border-slate-100 focus:border-red-600 outline-none"
            />
            <div className="space-y-3 pt-2">
              {playersB.map((name, i) => (
                <div key={i}>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Jugador {i + 1}</label>
                  <input
                    required
                    placeholder={`Nombre Jugador ${i + 1}`}
                    value={name}
                    onChange={(e) => {
                      const newPlayers = [...playersB];
                      newPlayers[i] = e.target.value;
                      setPlayersB(newPlayers);
                    }}
                    className="w-full p-3 bg-slate-50 border-0 rounded-lg focus:ring-2 focus:ring-red-600"
                  />
                </div>
              ))}
            </div>
          </section>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white p-4 rounded-xl font-bold text-xl flex items-center justify-center gap-3 shadow-lg disabled:bg-slate-300 transition-all hover:bg-blue-700"
        >
          {loading ? 'Creando...' : (
            <>
              <Play size={24} fill="white" />
              INICIAR PARTIDA
            </>
          )}
        </button>
      </form>
    </div>
  );
}
