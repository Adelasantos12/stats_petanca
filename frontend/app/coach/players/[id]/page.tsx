'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { getToken } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ChevronLeft, Target, Zap, Activity, TrendingUp, Award } from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

interface Metrics {
  n: number;
  suma: number;
  media: number | null;
  performance: number | null;
}
interface PerMatch extends Metrics {
  matchId: string;
  date: string | null;
  teams: string | null;
  status: string | null;
}
interface Development {
  player: { id: string; name: string; level: string | null; category: string | null; notes: string | null };
  matchesPlayed: number;
  total: Metrics;
  point: Metrics;
  tir: Metrics;
  perMatch: PerMatch[];
}

export default function PlayerDevelopment() {
  const { id } = useParams();
  const router = useRouter();
  const [data, setData] = useState<Development | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!getToken()) {
      router.replace('/login');
      return;
    }
    api
      .get(`/players/${id}/development`)
      .then((res) => setData(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id, router]);

  if (loading) {
    return <div className="p-20 text-center font-black text-slate-300 animate-pulse">Cargando desarrollo…</div>;
  }
  if (!data) {
    return <div className="p-20 text-center font-bold text-slate-400">No se pudo cargar el jugador.</div>;
  }

  const evolution = data.perMatch
    .filter((m) => m.performance !== null)
    .map((m, i) => ({ label: `#${i + 1}`, performance: m.performance }));

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 pb-20">
      <div className="flex items-center gap-4">
        <Link href="/coach" className="glass p-3 rounded-2xl shadow-sm active:scale-90">
          <ChevronLeft size={22} className="text-slate-600" />
        </Link>
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight leading-none">{data.player.name}</h2>
          <div className="flex gap-2 mt-2">
            {data.player.level && (
              <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-600 uppercase tracking-wide">
                {data.player.level}
              </span>
            )}
            {data.player.category && (
              <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-500 uppercase tracking-wide">
                {data.player.category}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Resumen acumulado */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Stat icon={<Award size={16} />} label="Performance global" value={data.total.performance != null ? `${data.total.performance}%` : '—'} big accent="bg-indigo-600 text-white" />
        <Stat icon={<Target size={16} className="text-emerald-500" />} label="Point" value={data.point.performance != null ? `${data.point.performance}%` : '—'} sub={`n = ${data.point.n}`} />
        <Stat icon={<Zap size={16} className="text-amber-500" />} label="Tir" value={data.tir.performance != null ? `${data.tir.performance}%` : '—'} sub={`n = ${data.tir.n}`} />
        <Stat icon={<Activity size={16} className="text-slate-400" />} label="Partidas" value={`${data.matchesPlayed}`} sub={`${data.total.n} lanzamientos`} />
      </div>

      {/* Evolución */}
      <div className="glass rounded-[2rem] p-6 shadow-xl shadow-slate-200/30 border border-white/50">
        <h3 className="font-black text-slate-700 flex items-center gap-2 mb-6">
          <TrendingUp size={18} className="text-indigo-600" /> Evolución por partida
        </h3>
        {evolution.length === 0 ? (
          <p className="text-slate-400 font-semibold text-sm py-8 text-center">
            Aún no hay lanzamientos registrados para este jugador. Juega una partida
            eligiéndolo del roster y su rendimiento empezará a acumularse aquí.
          </p>
        ) : (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={evolution} margin={{ left: -20, right: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="label" axisLine={false} tickLine={false} style={{ fontSize: '10px', fontWeight: 700, fill: '#94a3b8' }} />
                <YAxis domain={[0, 100]} axisLine={false} tickLine={false} style={{ fontSize: '10px', fill: '#cbd5e1' }} />
                <Tooltip formatter={(v) => [`${v}%`, 'Performance']} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)', fontWeight: 700 }} />
                <Line type="monotone" dataKey="performance" stroke="#4f46e5" strokeWidth={3} dot={{ r: 4, fill: '#4f46e5', strokeWidth: 2, stroke: '#fff' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Historial */}
      {data.perMatch.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-black text-slate-700 text-sm uppercase tracking-widest">Historial</h3>
          {data.perMatch
            .slice()
            .reverse()
            .map((m) => (
              <Link
                key={m.matchId}
                href={`/matches/${m.matchId}/performance`}
                className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex items-center justify-between hover:shadow-lg transition-all"
              >
                <div>
                  <div className="font-bold text-slate-700">{m.teams ?? 'Partida'}</div>
                  <div className="text-[11px] font-semibold text-slate-400">
                    {m.date ? new Date(m.date).toLocaleDateString() : ''} · {m.n} lanzamientos
                  </div>
                </div>
                <div className="text-2xl font-black text-indigo-600">
                  {m.performance != null ? `${m.performance}%` : '—'}
                </div>
              </Link>
            ))}
        </div>
      )}
    </motion.div>
  );
}

function Stat({
  icon,
  label,
  value,
  sub,
  big,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  big?: boolean;
  accent?: string;
}) {
  return (
    <div className={`rounded-3xl p-5 shadow-sm border border-slate-100 ${accent ?? 'bg-white'}`}>
      <div className={`flex items-center gap-1 text-[9px] font-black uppercase tracking-widest ${accent ? 'text-white/70' : 'text-slate-400'}`}>
        {icon} {label}
      </div>
      <div className={`font-black mt-2 ${big ? 'text-3xl' : 'text-2xl'} ${accent ? 'text-white' : 'text-slate-800'}`}>{value}</div>
      {sub && <div className={`text-[10px] font-bold mt-1 ${accent ? 'text-white/60' : 'text-slate-400'}`}>{sub}</div>}
    </div>
  );
}
