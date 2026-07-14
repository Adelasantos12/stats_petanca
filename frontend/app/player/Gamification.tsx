'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Flame, Star, Award, Lock } from 'lucide-react';

interface Badge { code: string; name: string; tier: string; description: string; earned: boolean; progress: string | null; }
interface Gami {
  status: { tier: string; xp: number; nextTier: string | null; xpToNext: number; progress: number };
  streak: { current: number; best: number };
  stats: { matchesPlayed: number; throwsLogged: number; badgesEarned: number };
  badges: Badge[];
}

const TIER_COLOR: Record<string, string> = {
  BRONZE: 'from-amber-600 to-amber-700',
  SILVER: 'from-slate-400 to-slate-500',
  GOLD: 'from-yellow-400 to-amber-500',
};

export default function Gamification() {
  const [g, setG] = useState<Gami | null>(null);

  useEffect(() => {
    api.get('/player-auth/me/gamification').then((r) => setG(r.data)).catch(() => {});
  }, []);

  if (!g) return null;

  return (
    <div className="space-y-4">
      {/* Estatus + racha */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="sm:col-span-2 bg-gradient-to-br from-amber-500 to-orange-500 rounded-[2rem] p-6 text-white shadow-xl shadow-amber-200">
          <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest opacity-80">
            <Star size={13} /> Estatus
          </div>
          <div className="text-2xl font-black mt-1">{g.status.tier}</div>
          {g.status.nextTier ? (
            <>
              <div className="mt-3 h-2 bg-white/25 rounded-full overflow-hidden">
                <div className="h-full bg-white rounded-full" style={{ width: `${g.status.progress}%` }} />
              </div>
              <div className="text-[11px] font-bold mt-1.5 opacity-80">
                {g.status.xpToNext} XP para {g.status.nextTier}
              </div>
            </>
          ) : (
            <div className="text-[11px] font-bold mt-2 opacity-80">¡Máximo estatus! · {g.status.xp} XP</div>
          )}
        </div>
        <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center">
          <Flame size={30} className={g.streak.current > 0 ? 'text-orange-500' : 'text-slate-300'} />
          <div className="text-3xl font-black text-slate-800 mt-1">{g.streak.current}</div>
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">días de racha</div>
          {g.streak.best > g.streak.current && (
            <div className="text-[10px] font-bold text-slate-400 mt-0.5">récord: {g.streak.best}</div>
          )}
        </div>
      </div>

      {/* Insignias */}
      <div className="glass rounded-[2rem] p-6 border border-white/50">
        <h3 className="font-black text-slate-700 flex items-center gap-2 text-sm uppercase tracking-widest mb-4">
          <Award size={18} className="text-amber-500" /> Insignias · {g.stats.badgesEarned}/{g.badges.length}
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {g.badges.map((b) => (
            <div key={b.code}
              className={`rounded-2xl p-3 border text-center ${b.earned ? 'bg-white border-slate-100 shadow-sm' : 'bg-slate-50 border-slate-100 opacity-70'}`}>
              <div className={`w-10 h-10 mx-auto rounded-xl flex items-center justify-center text-white bg-gradient-to-br ${b.earned ? TIER_COLOR[b.tier] : 'from-slate-300 to-slate-400'}`}>
                {b.earned ? <Award size={20} /> : <Lock size={16} />}
              </div>
              <div className={`text-[11px] font-black mt-1.5 ${b.earned ? 'text-slate-800' : 'text-slate-400'}`}>{b.name}</div>
              <div className="text-[9px] font-medium text-slate-400 leading-tight mt-0.5">{b.description}</div>
              {!b.earned && b.progress && (
                <div className="text-[9px] font-black text-amber-600 mt-1">{b.progress}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
