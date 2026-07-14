'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { getToken, getPlayer, clearSession } from '@/lib/auth';
import { motion } from 'framer-motion';
import {
  Target, Zap, Award, Activity, TrendingUp, LogOut, ChevronUp, Trophy, ClipboardCheck, CheckCircle2, XCircle,
} from 'lucide-react';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
} from 'recharts';
import MyPlan from './MyPlan';
import MerciRadar, { MerciScores } from '@/components/MerciRadar';

interface Metrics { n: number; performance: number | null; }
interface PerMatch { matchId: string; date: string | null; teams: string | null; performance: number | null; n: number; }
interface Development {
  player: { name: string; level: string | null; category: string | null };
  matchesPlayed: number;
  total: Metrics; point: Metrics; tir: Metrics;
  perMatch: PerMatch[];
}
interface Criterion { id: string; label: string; dimension: string | null; target: number; unit: string; }
interface NextLevel {
  currentLevel: { name: string } | null;
  nextLevel: { name: string; description: string | null; criteria: Criterion[] } | null;
  atMax: boolean;
}
interface EvalItem { met: boolean; }
interface Evaluation { id: string; date: string; passed: boolean; targetLevel: { name: string } | null; items: EvalItem[]; }

export default function PlayerDashboard() {
  const router = useRouter();
  const [dev, setDev] = useState<Development | null>(null);
  const [next, setNext] = useState<NextLevel | null>(null);
  const [evals, setEvals] = useState<Evaluation[]>([]);
  const [merci, setMerci] = useState<(MerciScores & { date: string }) | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!getToken() || !getPlayer()) {
      router.replace('/player/login');
      return;
    }
    Promise.all([
      api.get('/player-auth/me/development'),
      api.get('/player-auth/me/next-level'),
      api.get('/player-auth/me/evaluations'),
      api.get('/player-auth/me/merci'),
    ])
      .then(([d, n, e, m]) => {
        setDev(d.data); setNext(n.data); setEvals(e.data);
        setMerci(m.data?.[0] ?? null);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [router]);

  const logout = () => { clearSession(); router.replace('/player/login'); };

  if (loading) return <div className="p-20 text-center font-black text-slate-300 animate-pulse">Cargando tu desarrollo…</div>;
  if (!dev) return <div className="p-20 text-center font-bold text-slate-400">No se pudo cargar tu perfil.</div>;

  const evolution = dev.perMatch.filter((m) => m.performance !== null).map((m, i) => ({ label: `#${i + 1}`, performance: m.performance }));

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-amber-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-amber-200">
            <Target size={24} />
          </div>
          <div>
            <h2 className="text-3xl font-black text-slate-800 tracking-tight leading-none">Hola, {dev.player.name}</h2>
            <div className="flex gap-2 mt-2">
              {dev.player.level ? (
                <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-700 uppercase tracking-wide">
                  Nivel {dev.player.level}
                </span>
              ) : (
                <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-500 uppercase tracking-wide">Sin nivel aún</span>
              )}
              {dev.player.category && (
                <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-500 uppercase tracking-wide">{dev.player.category}</span>
              )}
            </div>
          </div>
        </div>
        <button onClick={logout} className="glass p-3 rounded-2xl text-slate-500 hover:text-rose-600 transition-all active:scale-90" title="Cerrar sesión">
          <LogOut size={20} />
        </button>
      </div>

      {/* Rendimiento acumulado */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Stat icon={<Award size={16} />} label="Performance global" value={pct(dev.total.performance)} accent="bg-amber-500 text-white" big />
        <Stat icon={<Target size={16} className="text-emerald-500" />} label="Point" value={pct(dev.point.performance)} sub={`n = ${dev.point.n}`} />
        <Stat icon={<Zap size={16} className="text-amber-500" />} label="Tir" value={pct(dev.tir.performance)} sub={`n = ${dev.tir.n}`} />
        <Stat icon={<Activity size={16} className="text-slate-400" />} label="Partidas" value={`${dev.matchesPlayed}`} sub={`${dev.total.n} lanzamientos`} />
      </div>

      {/* Radar MERCI (última evaluación del coach) */}
      {merci && (
        <div className="glass rounded-[2rem] p-6 shadow-xl shadow-slate-200/30 border border-white/50">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-black text-slate-700 flex items-center gap-2 text-sm uppercase tracking-widest">Tu perfil MERCI</h3>
            <span className="text-2xl font-black text-amber-500">{merci.total}%</span>
          </div>
          <MerciRadar scores={merci} color="#f59e0b" />
          <p className="text-[11px] text-slate-400 font-medium text-center mt-1">
            Última evaluación de tu entrenador · {new Date(merci.date).toLocaleDateString()}
          </p>
        </div>
      )}

      {/* Qué te falta para subir */}
      {next && !next.atMax && next.nextLevel && (
        <div className="glass rounded-[2rem] p-6 shadow-xl shadow-slate-200/30 border border-white/50">
          <h3 className="font-black text-slate-700 flex items-center gap-2 text-sm uppercase tracking-widest mb-4">
            <ChevronUp size={18} className="text-amber-500" /> Para subir a {next.nextLevel.name}
          </h3>
          {next.nextLevel.criteria.length === 0 ? (
            <p className="text-sm text-slate-400 font-medium">Tu entrenador aún no definió los criterios de este nivel.</p>
          ) : (
            <ul className="space-y-2">
              {next.nextLevel.criteria.map((c) => (
                <li key={c.id} className="flex items-center justify-between bg-white/60 rounded-xl px-4 py-3 border border-slate-100">
                  <span className="font-bold text-slate-700 text-sm">
                    {c.dimension && <span className="text-[9px] font-black text-amber-600 mr-1.5 uppercase">{c.dimension}</span>}
                    {c.label}
                  </span>
                  <span className="text-[11px] font-black text-slate-400 whitespace-nowrap">≥ {c.target}{c.unit}</span>
                </li>
              ))}
            </ul>
          )}
          <p className="text-xs text-slate-400 font-medium mt-3">Tu entrenador registrará la evaluación cuando estés listo.</p>
        </div>
      )}
      {next?.atMax && (
        <div className="glass rounded-[2rem] p-6 border border-white/50 text-center">
          <Trophy size={26} className="text-amber-500 mx-auto mb-1" />
          <p className="font-black text-slate-600">¡Estás en el nivel máximo! 🏆</p>
        </div>
      )}

      {/* Mi plan de entrenamiento (MERCI) + registrar sesión */}
      <MyPlan />

      {/* Evolución */}
      <div className="glass rounded-[2rem] p-6 shadow-xl shadow-slate-200/30 border border-white/50">
        <h3 className="font-black text-slate-700 flex items-center gap-2 mb-6"><TrendingUp size={18} className="text-amber-500" /> Tu evolución</h3>
        {evolution.length === 0 ? (
          <p className="text-slate-400 font-semibold text-sm py-8 text-center">Aún no tienes lanzamientos registrados. Cuando juegues, tu rendimiento aparecerá aquí.</p>
        ) : (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={evolution} margin={{ left: -20, right: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="label" axisLine={false} tickLine={false} style={{ fontSize: '10px', fontWeight: 700, fill: '#94a3b8' }} />
                <YAxis domain={[0, 100]} axisLine={false} tickLine={false} style={{ fontSize: '10px', fill: '#cbd5e1' }} />
                <Tooltip formatter={(v) => [`${v}%`, 'Performance']} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)', fontWeight: 700 }} />
                <Line type="monotone" dataKey="performance" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4, fill: '#f59e0b', strokeWidth: 2, stroke: '#fff' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Historial de evaluaciones */}
      {evals.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-black text-slate-400 text-[11px] uppercase tracking-widest flex items-center gap-1.5">
            <ClipboardCheck size={13} /> Tus evaluaciones
          </h3>
          {evals.map((ev) => (
            <div key={ev.id} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
                {ev.passed ? <CheckCircle2 size={16} className="text-emerald-500" /> : <XCircle size={16} className="text-rose-400" />}
                {ev.targetLevel ? ev.targetLevel.name : 'Evaluación'}
                <span className="text-[11px] font-semibold text-slate-400">· {new Date(ev.date).toLocaleDateString()}</span>
              </div>
              <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase ${ev.passed ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                {ev.passed ? 'Superado' : 'No superado'}
              </span>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

function pct(v: number | null) { return v != null ? `${v}%` : '—'; }

function Stat({ icon, label, value, sub, big, accent }: {
  icon: React.ReactNode; label: string; value: string; sub?: string; big?: boolean; accent?: string;
}) {
  return (
    <div className={`rounded-3xl p-5 shadow-sm border border-slate-100 ${accent ?? 'bg-white'}`}>
      <div className={`flex items-center gap-1 text-[9px] font-black uppercase tracking-widest ${accent ? 'text-white/70' : 'text-slate-400'}`}>{icon} {label}</div>
      <div className={`font-black mt-2 ${big ? 'text-3xl' : 'text-2xl'} ${accent ? 'text-white' : 'text-slate-800'}`}>{value}</div>
      {sub && <div className={`text-[10px] font-bold mt-1 ${accent ? 'text-white/60' : 'text-slate-400'}`}>{sub}</div>}
    </div>
  );
}
