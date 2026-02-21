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
  User,
  Info
} from 'lucide-react';
import Link from 'next/link';
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

  if (loading || !performance || !match) return <div className="p-10 text-center">Cargando performance...</div>;

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

  // Evolution per hand (of each team)
  // We need to calculate this from match.throws and match.hands
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
    A: '#2563eb', // Blue
    B: '#dc2626', // Red
    POINT: '#8b5cf6', // Violet
    TIR: '#f59e0b', // Amber
  };

  return (
    <div className="space-y-8 pb-10">
      <div className="flex items-center gap-4">
        <Link href={`/matches/${id}`} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
          <ChevronLeft size={24} />
        </Link>
        <h2 className="text-2xl font-bold">Performance Técnico</h2>
      </div>

      {/* Team Summaries */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-2xl shadow-sm border-l-8 border-blue-600">
          <div className="text-xs font-bold text-slate-400 uppercase">{match.teamAName}</div>
          <div className="text-3xl font-black text-blue-600">{performance.teams.A.performance || '—'}%</div>
          <div className="text-[10px] text-slate-400 font-bold mt-1">TOTAL EQUIPO</div>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border-l-8 border-red-600">
          <div className="text-xs font-bold text-slate-400 uppercase">{match.teamBName}</div>
          <div className="text-3xl font-black text-red-600">{performance.teams.B.performance || '—'}%</div>
          <div className="text-[10px] text-slate-400 font-bold mt-1">TOTAL EQUIPO</div>
        </div>
      </div>

      {/* Individual Player Cards */}
      <div className="space-y-4">
        <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <User size={18} /> Performance por Jugador
        </h3>
        <div className="grid gap-4">
          {performance.players.map(p => (
            <div key={p.playerId} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="text-lg font-black text-slate-800">{p.playerName}</div>
                  <div className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block ${p.teamSide === 'A' ? 'bg-blue-50 text-blue-600' : 'bg-red-50 text-red-600'}`}>
                    {p.teamSide === 'A' ? match.teamAName : match.teamBName}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-black text-slate-800">{p.total.performance ?? '—'}%</div>
                  <div className="text-[10px] font-bold text-slate-400">GLOBAL</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-50">
                <div className="space-y-1">
                  <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
                    <Target size={12} className="text-violet-500" /> POINT
                  </div>
                  <div className="text-xl font-black text-slate-700">{p.point.performance ?? '—'}%</div>
                  <div className="text-[10px] text-slate-400">n = {p.point.n}</div>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
                    <Zap size={12} className="text-amber-500" /> TIR
                  </div>
                  <div className="text-xl font-black text-slate-700">{p.tir.performance ?? '—'}%</div>
                  <div className="text-[10px] text-slate-400">n = {p.tir.n}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Charts Section */}
      <div className="space-y-6">
        <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <TrendingUp size={18} /> Gráficos de Análisis
        </h3>

        {/* Comparison Chart */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
          <h4 className="text-xs font-bold text-slate-400 uppercase mb-6">Comparativa Performance Total</h4>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={playerComparisonData} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                <XAxis type="number" domain={[0, 100]} hide />
                <YAxis dataKey="name" type="category" width={80} style={{ fontSize: '12px', fontWeight: 'bold' }} />
                <Tooltip
                  formatter={(value) => [`${value}%`, 'Performance']}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="performance" radius={[0, 4, 4, 0]} barSize={30}>
                  {playerComparisonData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.side === 'A' ? COLORS.A : COLORS.B} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* POINT vs TIR Chart */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
          <h4 className="text-xs font-bold text-slate-400 uppercase mb-6">POINT vs TIR por Jugador</h4>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pointVsTirData} margin={{ bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" style={{ fontSize: '10px', fontWeight: 'bold' }} />
                <YAxis domain={[0, 100]} style={{ fontSize: '10px' }} />
                <Tooltip
                   contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Legend iconType="circle" />
                <Bar dataKey="POINT" fill={COLORS.POINT} radius={[4, 4, 0, 0]} />
                <Bar dataKey="TIR" fill={COLORS.TIR} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Evolution Chart */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
          <h4 className="text-xs font-bold text-slate-400 uppercase mb-6">Evolución por Mano (% de efectividad)</h4>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart margin={{ right: 30, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="hand" type="number" domain={['dataMin', 'dataMax']} style={{ fontSize: '10px' }} label={{ value: 'Mano', position: 'insideBottom', offset: -10 }} />
                <YAxis domain={[0, 100]} style={{ fontSize: '10px' }} />
                <Tooltip
                   contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Legend />
                <Line
                    data={evolutionA}
                    type="monotone"
                    dataKey="performance"
                    name={match.teamAName}
                    stroke={COLORS.A}
                    strokeWidth={3}
                    dot={{ r: 4, fill: COLORS.A }}
                />
                <Line
                    data={evolutionB}
                    type="monotone"
                    dataKey="performance"
                    name={match.teamBName}
                    stroke={COLORS.B}
                    strokeWidth={3}
                    dot={{ r: 4, fill: COLORS.B }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 flex items-start gap-2 bg-slate-50 p-3 rounded-lg">
            <Info size={14} className="text-slate-400 mt-0.5" />
            <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
                Este gráfico muestra el performance técnico individual de cada equipo en cada mano específica.
                Ayuda a visualizar rachas de efectividad y bajones técnicos durante la partida.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
