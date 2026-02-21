'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { Match } from '@/types';
import { PlusCircle, Trophy, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Partidas</h2>
        <Link
          href="/matches/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-semibold hover:bg-blue-700 transition-colors shadow-sm"
        >
          <PlusCircle size={20} />
          Nueva Partida
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-10 text-slate-500">Cargando partidas...</div>
      ) : matches.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border-2 border-dashed border-slate-200">
          <p className="text-slate-500 mb-4">No hay partidas registradas.</p>
          <Link href="/matches/new" className="text-blue-600 font-semibold underline">
            Crea tu primera partida
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {matches.map(match => (
            <Link
              key={match.id}
              href={`/matches/${match.id}`}
              className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col gap-3 hover:border-blue-200 transition-colors"
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-sm font-medium text-slate-500 mb-1 flex items-center gap-1">
                    <Clock size={14} />
                    {format(new Date(match.createdAt), "d 'de' MMMM, HH:mm", { locale: es })}
                  </div>
                  <div className="text-lg font-bold">
                    {match.teamAName} vs {match.teamBName}
                  </div>
                  <div className="text-xs font-semibold px-2 py-0.5 bg-slate-100 rounded-full inline-block mt-1 uppercase text-slate-600">
                    {match.modality}
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                  match.status === 'FINISHED' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                }`}>
                  {match.status === 'FINISHED' ? 'FINALIZADO' : 'EN PROGRESO'}
                </div>
              </div>

              <div className="flex items-center gap-2 mt-2">
                <Trophy size={16} className="text-yellow-500" />
                <span className="text-sm font-semibold">Puntos objetivo: {match.targetPoints}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
