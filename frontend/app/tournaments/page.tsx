'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api, { apiErrorMessage } from '@/lib/api';
import { getToken } from '@/lib/auth';
import { motion } from 'framer-motion';
import { Trophy, Plus, Users, ChevronRight, GitFork, ListOrdered } from 'lucide-react';

interface Tournament {
  id: string; name: string; format: string; status: string;
  _count?: { entries: number };
}

export default function TournamentsList() {
  const router = useRouter();
  const [items, setItems] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [format, setFormat] = useState('ROUND_ROBIN');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = () => api.get('/tournaments').then((r) => setItems(r.data)).catch(() => {});

  useEffect(() => {
    if (!getToken()) { router.replace('/login'); return; }
    load().finally(() => setLoading(false));
  }, [router]);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true); setError(null);
    try {
      const res = await api.post('/tournaments', { name: name.trim(), format });
      router.push(`/tournaments/${res.data.id}`);
    } catch (err) {
      setError(apiErrorMessage(err) || 'No se pudo crear el torneo');
      setCreating(false);
    }
  };

  const badge = (s: string) =>
    s === 'FINISHED' ? 'bg-slate-100 text-slate-500' : s === 'RUNNING' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700';
  const statusLabel = (s: string) => (s === 'FINISHED' ? 'Finalizado' : s === 'RUNNING' ? 'En juego' : 'Inscripción');

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-200">
          <Trophy size={24} />
        </div>
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight leading-none">Torneos</h2>
          <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-1">Organiza y sigue los resultados</p>
        </div>
      </div>

      <form onSubmit={create} className="glass rounded-[2rem] p-6 border border-white/50 space-y-4">
        <h3 className="font-black text-slate-700 flex items-center gap-2 text-sm"><Plus size={17} /> Nuevo torneo</h3>
        <input value={name} onChange={(e) => setName(e.target.value)} required placeholder="Nombre del torneo"
          className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-white/70 font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
        <div className="grid grid-cols-2 gap-3">
          <button type="button" onClick={() => setFormat('ROUND_ROBIN')}
            className={`p-4 rounded-2xl border-2 font-black text-sm flex items-center gap-2 transition-all ${format === 'ROUND_ROBIN' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-100 bg-slate-50 text-slate-400'}`}>
            <ListOrdered size={18} /> Liga (todos contra todos)
          </button>
          <button type="button" onClick={() => setFormat('SINGLE_ELIM')}
            className={`p-4 rounded-2xl border-2 font-black text-sm flex items-center gap-2 transition-all ${format === 'SINGLE_ELIM' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-100 bg-slate-50 text-slate-400'}`}>
            <GitFork size={18} className="rotate-90" /> Eliminatoria (bracket)
          </button>
        </div>
        {error && <p className="text-sm font-bold text-rose-600 bg-rose-50 rounded-xl px-4 py-3">{error}</p>}
        <button type="submit" disabled={creating}
          className="w-full bg-emerald-600 text-white font-black py-3.5 rounded-2xl hover:bg-emerald-700 transition-all active:scale-95 disabled:opacity-60">
          {creating ? 'Creando…' : 'Crear torneo'}
        </button>
      </form>

      {loading ? (
        <div className="grid gap-4">{[1, 2].map((i) => <div key={i} className="h-20 bg-slate-100 rounded-3xl animate-pulse" />)}</div>
      ) : items.length === 0 ? (
        <p className="text-slate-400 font-semibold text-center py-8">Aún no tienes torneos. Crea el primero arriba.</p>
      ) : (
        <div className="grid gap-3">
          {items.map((t) => (
            <motion.div key={t.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <Link href={`/tournaments/${t.id}`}
                className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 flex items-center justify-between hover:shadow-lg transition-all group">
                <div>
                  <div className="font-black text-slate-800 text-lg group-hover:text-emerald-600 transition-colors">{t.name}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase ${badge(t.status)}`}>{statusLabel(t.status)}</span>
                    <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                      {t.format === 'SINGLE_ELIM' ? <GitFork size={11} className="rotate-90" /> : <ListOrdered size={11} />}
                      {t.format === 'SINGLE_ELIM' ? 'Eliminatoria' : 'Liga'}
                    </span>
                    <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1"><Users size={11} /> {t._count?.entries ?? 0}</span>
                  </div>
                </div>
                <ChevronRight size={22} className="text-slate-300 group-hover:text-emerald-600 transition-colors" />
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
