'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { Match } from '@/types';
import { PlusCircle, Trophy, Clock, ChevronRight, Activity, Zap, Share2 } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { motion } from 'framer-motion';

export default function Home() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/matches')
      .then(res => {
        setMatches(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="space-y-10">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-black text-slate-800 tracking-tight">Partidas</h2>
          <p className="text-slate-500 font-medium">Gestiona y analiza tus encuentros de petanca.</p>
        </div>
        <Link
          href="/matches/new"
          className="bg-brand-600 text-white p-4 rounded-2xl flex items-center gap-2 font-bold hover:bg-brand-700 transition-all shadow-xl shadow-brand-100 active:scale-95"
        >
          <PlusCircle size={24} />
          <span className="hidden sm:inline">Nueva Partida</span>
        </Link>
      </div>

      {/* Contador rápido del parque (gancho sin fricción) */}
      <Link href="/contador"
        className="block bg-gradient-to-br from-brand-600 to-brand-800 rounded-[2rem] p-6 shadow-xl shadow-brand-200/60 text-white relative overflow-hidden active:scale-[0.99] transition-transform">
        <div className="absolute -right-6 -top-6 opacity-15 rotate-12"><Zap size={130} /></div>
        <div className="flex items-center justify-between relative">
          <div>
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-200">Sin registro · sin conexión</div>
            <div className="text-2xl font-black mt-1">Contador rápido</div>
            <div className="text-brand-100 font-semibold text-sm mt-1 flex items-center gap-1.5">
              <Share2 size={14} /> Marca y comparte el resultado
            </div>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center shrink-0"><ChevronRight size={28} /></div>
        </div>
      </Link>

      {loading ? (
        <div className="grid gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-slate-100 rounded-3xl animate-pulse" />
          ))}
        </div>
      ) : matches.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-20 bg-white/50 backdrop-blur-sm rounded-[2rem] border-2 border-dashed border-slate-200"
        >
          <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-400">
            <Activity size={40} />
          </div>
          <p className="text-slate-500 mb-6 text-lg font-medium">No hay partidas registradas.</p>
          <Link href="/matches/new" className="text-brand-600 font-black text-lg underline-offset-4 hover:underline">
            Crea tu primera partida ahora
          </Link>
        </motion.div>
      ) : (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid gap-6"
        >
          {matches.map(match => (
            <motion.div key={match.id} variants={item}>
              <Link
                href={`/matches/${match.id}`}
                className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex items-center justify-between hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group"
              >
                <div className="flex flex-col gap-2">
                  <div className="text-xs font-black text-slate-400 flex items-center gap-1 uppercase tracking-widest">
                    <Clock size={12} className="text-brand-500" />
                    {format(new Date(match.createdAt), "d 'de' MMMM, HH:mm", { locale: es })}
                  </div>
                  <div className="text-2xl font-black text-slate-800 group-hover:text-brand-600 transition-colors">
                    {match.teamAName} <span className="text-slate-300 font-light mx-1">vs</span> {match.teamBName}
                  </div>
                  <div className="flex gap-2 items-center">
                    <span className="text-[10px] font-black px-3 py-1 bg-slate-100 rounded-full text-slate-500 uppercase">
                      {match.modality}
                    </span>
                    <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase ${
                      match.status === 'FINISHED' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {match.status === 'FINISHED' ? 'Finalizado' : 'En Progreso'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="hidden md:flex flex-col items-end">
                    <div className="flex items-center gap-1 text-slate-400 mb-1">
                      <Trophy size={14} />
                      <span className="text-[10px] font-bold uppercase">Objetivo</span>
                    </div>
                    <div className="text-xl font-black text-slate-800">{match.targetPoints}</div>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center group-hover:bg-brand-600 group-hover:text-white transition-all">
                    <ChevronRight size={24} />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
