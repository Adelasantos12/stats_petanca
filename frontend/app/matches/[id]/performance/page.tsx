'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import api from '@/lib/api';
import { Match, PerformanceResponse } from '@/types';
import {
  ChevronLeft,
  Target,
  Zap,
  TrendingUp,
  Info,
  Medal,
  Activity,
  Award
} from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  Cell
} from 'recharts';

export default function Performance() {
  const { id } = useParams();
  const [match, setMatch] = useState<Match | null>(null);
  const [performance, setPerformance] = useState<PerformanceResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [matchRes, perfRes] = await Promise.all([
          api.get(`/matches/${id}`),
          api.get(`/matches/${id}/performance`)
        ]);
        setMatch(matchRes.data);
        setPerformance(perfRes.data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading || !performance || !match) return <div className="p-20 text-center font-black text-slate-300 animate-pulse">Analizando rendimiento técnico...</div>;

  // Prepare chart data
  const playerComparisonData = performance.players.map(p => ({
    name: p.playerName,
    performance: p.total.performance || 0,
    side: p.teamSide,
  }));

  const pointVsTirData = performance.players.map(p => ({
    name: p.playerName,
    POINT: p.point.performance || 0,
    TIR: p.tir.performance || 0,
  }));

  const calculatePlayerTrend = (playerId: string) => {
    const playerThrows = match.throws
      .filter(t => t.playerId === playerId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    if (playerThrows.length === 0) {
      return { start: null, end: null, delta: null, stability: null, trendLabel: 'Sin datos' };
    }

    const scores = playerThrows.map(t => t.effectivenessScore);
    const firstWindow = scores.slice(0, Math.min(3, scores.length));
    const lastWindow = scores.slice(Math.max(scores.length - 3, 0));
    const start = firstWindow.reduce((acc, value) => acc + value, 0) / firstWindow.length;
    const end = lastWindow.reduce((acc, value) => acc + value, 0) / lastWindow.length;
    const delta = end - start;
    const average = scores.reduce((acc, value) => acc + value, 0) / scores.length;
    const variance = scores.reduce((acc, value) => acc + (value - average) ** 2, 0) / scores.length;
    const stability = Math.sqrt(variance);

    let trendLabel = 'Estable';
    if (delta >= 0.6) trendLabel = 'Sube';
    if (delta <= -0.6) trendLabel = 'Baja';

    return { start, end, delta, stability, trendLabel };
  };

  const playerDecisionData = performance.players.map(player => ({
    ...player,
    trend: calculatePlayerTrend(player.playerId),
  }));

  const calculateEvolution = (side: 'A' | 'B') => {
    const hands = match.hands.filter(h => h.status === 'NORMAL').map(h => h.handNumber).sort((a,b) => a - b);
    return hands.map(hNum => {
      const handThrows = match.throws.filter(t => t.handNumber === hNum && t.teamSide === side);
      const n = handThrows.length;
      if (n === 0) return { hand: hNum, performance: 0 };
      const suma = handThrows.reduce((acc, t) => acc + t.effectivenessScore, 0);
      const perf = ((suma + 2 * n) / (4 * n)) * 100;
      return {
        hand: hNum,
        performance: parseFloat(perf.toFixed(1)),
      };
    });
  };

  const evolutionA = calculateEvolution('A');
  const evolutionB = calculateEvolution('B');

  const COLORS = {
    A: '#4f46e5', // Indigo
    B: '#f43f5e', // Rose
    POINT: '#10b981', // Emerald
    TIR: '#f59e0b', // Amber
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-10 pb-20"
    >
      <div className="flex items-center gap-4">
        <Link href={`/matches/${id}`} className="glass p-4 rounded-[1.5rem] shadow-sm hover:shadow-lg transition-all active:scale-90 flex items-center justify-center">
          <ChevronLeft size={24} className="text-slate-600" />
        </Link>
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">Performance Técnico</h2>
          <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">Reporte Analítico Final</p>
        </div>
      </div>

      {/* Team Summaries */}
      <div className="grid grid-cols-2 gap-4 md:gap-8">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileHover={{ scale: 1.02 }}
          className="bg-indigo-600 p-8 rounded-[2.5rem] shadow-2xl shadow-indigo-200/50 relative overflow-hidden"
        >
          <div className="absolute -right-4 -top-4 opacity-10 rotate-12">
            <Medal size={120} />
          </div>
          <div className="text-[10px] font-black text-indigo-200 uppercase tracking-[0.2em] mb-2">{match.teamAName}</div>
          <div className="text-4xl md:text-6xl font-black text-white">{performance.teams.A.performance || '0'}%</div>
          <div className="text-[10px] text-indigo-100 font-black mt-3 flex items-center gap-1">
             <Activity size={12} /> GLOBAL EQUIPO
          </div>
        </motion.div>

        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileHover={{ scale: 1.02 }}
          transition={{ delay: 0.1 }}
          className="bg-rose-600 p-8 rounded-[2.5rem] shadow-2xl shadow-rose-200/50 relative overflow-hidden"
        >
          <div className="absolute -right-4 -top-4 opacity-10 rotate-12">
            <Medal size={120} />
          </div>
          <div className="text-[10px] font-black text-rose-200 uppercase tracking-[0.2em] mb-2">{match.teamBName}</div>
          <div className="text-4xl md:text-6xl font-black text-white">{performance.teams.B.performance || '0'}%</div>
          <div className="text-[10px] text-rose-100 font-black mt-3 flex items-center gap-1">
             <Activity size={12} /> GLOBAL EQUIPO
          </div>
        </motion.div>
      </div>

      {/* Individual Player Cards */}
      <div className="space-y-6">
        <h3 className="font-black text-slate-800 flex items-center gap-2 text-xl tracking-tight">
            <Award size={24} className="text-indigo-600" /> Rendimiento Individual
        </h3>
        <div className="grid md:grid-cols-2 gap-6">
          {playerDecisionData.map((p, idx) => (
            <motion.div
              key={p.playerId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * idx }}
              className="glass p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/30 border border-white/50 hover:shadow-2xl transition-all duration-300"
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <div className="text-xl font-black text-slate-800 leading-none mb-1">{p.playerName}</div>
                  <div className={`text-[10px] font-black px-3 py-1 rounded-full inline-block uppercase tracking-widest ${p.teamSide === 'A' ? 'bg-indigo-50 text-indigo-600' : 'bg-rose-50 text-rose-600'}`}>
                    {p.teamSide === 'A' ? match.teamAName : match.teamBName}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-black text-slate-900">{p.total.performance ?? '0'}%</div>
                  <div className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Score Técnico</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-6 border-t border-slate-100">
                <div className="p-4 bg-emerald-50/30 rounded-2xl space-y-1">
                  <div className="flex items-center gap-1 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                    <Target size={10} className="text-emerald-500" /> Point
                  </div>
                  <div className="text-2xl font-black text-slate-800">{p.point.performance ?? '0'}%</div>
                  <div className="text-[9px] font-bold text-slate-400 italic">n = {p.point.n}</div>
                </div>
                <div className="p-4 bg-amber-50/30 rounded-2xl space-y-1">
                  <div className="flex items-center gap-1 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                    <Zap size={10} className="text-amber-500" /> Tir
                  </div>
                  <div className="text-2xl font-black text-slate-800">{p.tir.performance ?? '0'}%</div>
                  <div className="text-[9px] font-bold text-slate-400 italic">n = {p.tir.n}</div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 mt-4">
                <div className="bg-slate-50 rounded-2xl p-3">
                  <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Inicio</div>
                  <div className="text-lg font-black text-slate-700">{p.trend.start?.toFixed(1) ?? '-'}</div>
                </div>
                <div className="bg-slate-50 rounded-2xl p-3">
                  <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Final</div>
                  <div className="text-lg font-black text-slate-700">{p.trend.end?.toFixed(1) ?? '-'}</div>
                </div>
                <div className="bg-slate-50 rounded-2xl p-3">
                  <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Delta</div>
                  <div className={`text-lg font-black ${(p.trend.delta ?? 0) > 0 ? 'text-emerald-600' : (p.trend.delta ?? 0) < 0 ? 'text-rose-600' : 'text-slate-700'}`}>
                    {p.trend.delta !== null ? `${p.trend.delta > 0 ? '+' : ''}${p.trend.delta.toFixed(1)}` : '-'}
                  </div>
                </div>
              </div>

              <div className="mt-4 rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                  <span className="text-slate-500">Lectura coach</span>
                  <span className={p.trend.trendLabel === 'Sube' ? 'text-emerald-600' : p.trend.trendLabel === 'Baja' ? 'text-rose-600' : 'text-slate-500'}>
                    {p.trend.trendLabel}
                  </span>
                </div>
                <p className="mt-2 text-xs font-bold text-slate-600 leading-relaxed">
                  {p.trend.trendLabel === 'Sube'
                    ? 'Jugador en mejora. Mantener en situaciones de bola clave puede ser favorable.'
                    : p.trend.trendLabel === 'Baja'
                    ? 'Jugador en descenso. Evaluar cambio de rol o relevo en tramos de presión.'
                    : 'Jugador consistente. Perfil estable para sostener ritmo durante el partido.'}
                </p>
                <p className="mt-2 text-[11px] font-black text-slate-400">
                  Estabilidad (desviación): {p.trend.stability?.toFixed(2) ?? '-'}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Charts Section */}
      <div className="space-y-8">
        <h3 className="font-black text-slate-800 flex items-center gap-2 text-xl tracking-tight">
            <TrendingUp size={24} className="text-indigo-600" /> Visualización de Datos
        </h3>

        <div className="grid gap-8">
            {/* Comparison Chart */}
            <motion.div
                whileHover={{ scale: 1.01 }}
                className="glass p-8 rounded-[3rem] shadow-xl shadow-slate-200/30 border border-white/50"
            >
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-8">Comparativa de Rendimiento Total</h4>
                <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={playerComparisonData} layout="vertical" margin={{ left: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                        <XAxis type="number" domain={[0, 100]} hide />
                        <YAxis dataKey="name" type="category" width={100} axisLine={false} tickLine={false} style={{ fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', fill: '#64748b' }} />
                        <Tooltip
                            cursor={{ fill: '#f8fafc' }}
                            formatter={(value) => [`${value}%`, 'Eficiencia']}
                            contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontWeight: '900' }}
                        />
                        <Bar dataKey="performance" radius={[0, 10, 10, 0]} barSize={24}>
                        {playerComparisonData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.side === 'A' ? COLORS.A : COLORS.B} />
                        ))}
                        </Bar>
                    </BarChart>
                    </ResponsiveContainer>
                </div>
            </motion.div>

            {/* POINT vs TIR Chart */}
            <motion.div
                whileHover={{ scale: 1.01 }}
                className="glass p-8 rounded-[3rem] shadow-xl shadow-slate-200/30 border border-white/50"
            >
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-8">Eficacia Point vs Tir</h4>
                <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={pointVsTirData} margin={{ bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} style={{ fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', fill: '#64748b' }} />
                        <YAxis domain={[0, 100]} axisLine={false} tickLine={false} style={{ fontSize: '10px', fontWeight: 'bold', fill: '#cbd5e1' }} />
                        <Tooltip
                            contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontWeight: '900' }}
                        />
                        <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontWeight: '900', fontSize: '10px', textTransform: 'uppercase' }} />
                        <Bar dataKey="POINT" fill={COLORS.POINT} radius={[10, 10, 0, 0]} barSize={30} />
                        <Bar dataKey="TIR" fill={COLORS.TIR} radius={[10, 10, 0, 0]} barSize={30} />
                    </BarChart>
                    </ResponsiveContainer>
                </div>
            </motion.div>

            {/* Evolution Chart */}
            <motion.div
                whileHover={{ scale: 1.01 }}
                className="glass p-8 rounded-[3rem] shadow-xl shadow-slate-200/30 border border-white/50"
            >
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-8">Evolución de Eficacia por Mano</h4>
                <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                    <LineChart margin={{ right: 30, left: -20, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="hand" type="number" domain={['dataMin', 'dataMax']} axisLine={false} tickLine={false} style={{ fontSize: '10px', fontWeight: '900', fill: '#64748b' }} />
                        <YAxis domain={[0, 100]} axisLine={false} tickLine={false} style={{ fontSize: '10px', fontWeight: 'bold', fill: '#cbd5e1' }} />
                        <Tooltip
                            contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontWeight: '900' }}
                        />
                        <Legend wrapperStyle={{ paddingTop: '20px', fontWeight: '900', fontSize: '10px', textTransform: 'uppercase' }} />
                        <Line
                            data={evolutionA}
                            type="monotone"
                            dataKey="performance"
                            name={match.teamAName}
                            stroke={COLORS.A}
                            strokeWidth={4}
                            dot={{ r: 6, fill: COLORS.A, strokeWidth: 3, stroke: '#fff' }}
                            activeDot={{ r: 8, strokeWidth: 0 }}
                        />
                        <Line
                            data={evolutionB}
                            type="monotone"
                            dataKey="performance"
                            name={match.teamBName}
                            stroke={COLORS.B}
                            strokeWidth={4}
                            dot={{ r: 6, fill: COLORS.B, strokeWidth: 3, stroke: '#fff' }}
                            activeDot={{ r: 8, strokeWidth: 0 }}
                        />
                    </LineChart>
                    </ResponsiveContainer>
                </div>
                <div className="mt-8 flex items-start gap-4 bg-indigo-50/50 p-6 rounded-[2rem] border border-indigo-100/50">
                    <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 shrink-0">
                        <Info size={20} />
                    </div>
                    <p className="text-xs text-indigo-900/60 font-bold leading-relaxed">
                        Este análisis técnico avanzado muestra la consistencia de cada equipo. Las fluctuaciones indican periodos de fatiga o presión técnica durante el encuentro.
                    </p>
                </div>
            </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
