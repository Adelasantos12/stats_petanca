'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import api, { apiErrorMessage } from '@/lib/api';
import { getToken } from '@/lib/auth';
import { motion } from 'framer-motion';
import { ChevronLeft, Plus, Trash2, Play, Crown } from 'lucide-react';
import Bracket from './Bracket';
import { PairingRow, Round } from './PairingRow';

interface Entry { id: string; name: string; played: number; wins: number; losses: number; pointsFor: number; pointsAgainst: number; }
interface Tournament {
  id: string; name: string; format: string; status: string;
  entries: Entry[]; rounds: Round[]; standings: Entry[];
}

export default function TournamentDetail() {
  const { id } = useParams();
  const router = useRouter();
  const [t, setT] = useState<Tournament | null>(null);
  const [loading, setLoading] = useState(true);
  const [entryName, setEntryName] = useState('');
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => api.get(`/tournaments/${id}`).then((r) => setT(r.data)).catch(() => {}), [id]);

  useEffect(() => {
    if (!getToken()) { router.replace('/login'); return; }
    load().finally(() => setLoading(false));
  }, [router, load]);

  const addEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!entryName.trim()) return;
    setError(null);
    try { await api.post(`/tournaments/${id}/entries`, { name: entryName.trim() }); setEntryName(''); await load(); }
    catch (err) { setError(apiErrorMessage(err) || 'Error'); }
  };
  const removeEntry = async (eid: string) => { await api.delete(`/tournaments/entries/${eid}`); await load(); };
  const start = async () => {
    setError(null);
    try { await api.post(`/tournaments/${id}/start`); await load(); }
    catch (err) { setError(apiErrorMessage(err) || 'No se pudo iniciar'); }
  };

  if (loading) return <div className="p-20 text-center font-black text-slate-300 animate-pulse">Cargando torneo…</div>;
  if (!t) return <div className="p-20 text-center font-bold text-slate-400">No se pudo cargar el torneo.</div>;

  const champion = t.status === 'FINISHED' && t.format === 'SINGLE_ELIM'
    ? t.rounds[t.rounds.length - 1]?.pairings[0]?.winnerName
    : t.status === 'FINISHED' && t.standings[0]?.name;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 pb-20">
      <div className="flex items-center gap-4">
        <Link href="/tournaments" className="glass p-3 rounded-2xl shadow-sm active:scale-90"><ChevronLeft size={22} className="text-slate-600" /></Link>
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight leading-none">{t.name}</h2>
          <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-1">
            {t.format === 'SINGLE_ELIM' ? 'Eliminatoria' : 'Liga'} · {t.status === 'FINISHED' ? 'Finalizado' : t.status === 'RUNNING' ? 'En juego' : 'Inscripción'}
          </p>
        </div>
      </div>

      {champion && (
        <div className="bg-gradient-to-br from-amber-400 to-amber-500 rounded-[2rem] p-6 text-center text-white shadow-xl shadow-amber-200">
          <Crown size={30} className="mx-auto mb-1" />
          <div className="text-[11px] font-black uppercase tracking-widest opacity-80">Campeón</div>
          <div className="text-2xl font-black">{champion}</div>
        </div>
      )}

      {error && <p className="text-sm font-bold text-rose-600 bg-rose-50 rounded-xl px-4 py-3">{error}</p>}

      {/* SETUP: inscripción */}
      {t.status === 'SETUP' && (
        <div className="glass rounded-[2rem] p-6 border border-white/50 space-y-4">
          <h3 className="font-black text-slate-700 text-sm uppercase tracking-widest">Participantes ({t.entries.length})</h3>
          <form onSubmit={addEntry} className="flex gap-2">
            <input value={entryName} onChange={(e) => setEntryName(e.target.value)} placeholder="Nombre de equipo o jugador"
              className="flex-1 px-4 py-3 rounded-2xl border border-slate-200 bg-white/70 font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            <button type="submit" className="bg-emerald-600 text-white px-5 rounded-2xl font-black active:scale-95"><Plus size={20} /></button>
          </form>
          <div className="grid gap-2">
            {t.entries.map((e, i) => (
              <div key={e.id} className="bg-white/60 rounded-xl px-4 py-2.5 flex items-center justify-between border border-slate-100">
                <span className="font-bold text-slate-700 text-sm"><span className="text-slate-300 mr-2">{i + 1}</span>{e.name}</span>
                <button onClick={() => removeEntry(e.id)} className="text-slate-300 hover:text-rose-500"><Trash2 size={16} /></button>
              </div>
            ))}
          </div>
          <button onClick={start} disabled={t.entries.length < 2}
            className="w-full bg-emerald-600 text-white font-black py-3.5 rounded-2xl flex items-center justify-center gap-2 hover:bg-emerald-700 transition-all active:scale-95 disabled:opacity-50">
            <Play size={18} /> Iniciar torneo {t.entries.length < 2 && '(mínimo 2)'}
          </button>
        </div>
      )}

      {/* RUNNING / FINISHED */}
      {t.status !== 'SETUP' && (
        <>
          {t.format === 'SINGLE_ELIM' ? (
            <Bracket rounds={t.rounds} onResult={load} />
          ) : (
            <>
              <Standings standings={t.standings} />
              <div className="space-y-6">
                {t.rounds.map((r) => (
                  <div key={r.id} className="space-y-2">
                    <h4 className="font-black text-slate-400 text-[11px] uppercase tracking-widest">Ronda {r.number}</h4>
                    {r.pairings.map((p) => <PairingRow key={p.id} p={p} onResult={load} />)}
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </motion.div>
  );
}

function Standings({ standings }: { standings: Entry[] }) {
  if (!standings.length) return null;
  return (
    <div className="glass rounded-[2rem] p-2 border border-white/50 overflow-x-auto">
      <table className="w-full text-sm min-w-[420px]">
        <thead>
          <tr className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
            <th className="text-left px-4 py-3">#</th><th className="text-left px-2 py-3">Equipo</th>
            <th className="px-2 py-3">PJ</th><th className="px-2 py-3">PG</th><th className="px-2 py-3">PP</th><th className="px-3 py-3">Dif</th>
          </tr>
        </thead>
        <tbody>
          {standings.map((s, i) => (
            <tr key={s.id} className="border-t border-slate-100">
              <td className="px-4 py-3 font-black text-slate-400">{i + 1}</td>
              <td className="px-2 py-3 font-bold text-slate-700">{s.name}</td>
              <td className="px-2 py-3 text-center font-semibold text-slate-500">{s.played}</td>
              <td className="px-2 py-3 text-center font-black text-emerald-600">{s.wins}</td>
              <td className="px-2 py-3 text-center font-semibold text-slate-500">{s.losses}</td>
              <td className="px-3 py-3 text-center font-black text-slate-700">{s.pointsFor - s.pointsAgainst > 0 ? '+' : ''}{s.pointsFor - s.pointsAgainst}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

