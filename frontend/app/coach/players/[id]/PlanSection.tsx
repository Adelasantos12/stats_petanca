'use client';

import { useCallback, useEffect, useState } from 'react';
import api, { apiErrorMessage } from '@/lib/api';
import { MERCI, MERCI_ORDER, merciName } from '@/lib/merci';
import { Dumbbell, Plus, Check, CalendarCheck, Smile } from 'lucide-react';

interface Drill { id: string; title: string; dimension: string; description: string | null; targetMetric: string | null; }
interface PlanItem { id: string; drill: Drill; reps: number; week: number; }
interface Plan { id: string; name: string; focus: string | null; status: string; createdAt: string; items: PlanItem[]; }
interface SessionResult { id: string; label: string; done: boolean; attempts: number | null; successes: number | null; avgScore: number | null; }
interface Session { id: string; date: string; mood: number | null; notes: string | null; results: SessionResult[]; }

export default function PlanSection({ playerId }: { playerId: string }) {
  const [drills, setDrills] = useState<Drill[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [name, setName] = useState('');
  const [focus, setFocus] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const load = useCallback(async () => {
    const [d, p, s] = await Promise.all([
      api.get('/drills'),
      api.get(`/players/${playerId}/plans`),
      api.get(`/players/${playerId}/sessions`),
    ]);
    setDrills(d.data);
    setPlans(p.data);
    setSessions(s.data);
  }, [playerId]);

  useEffect(() => { load().catch(() => {}); }, [load]);

  const toggle = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelected(next);
  };

  const create = async () => {
    setError(null);
    if (!name.trim() || selected.size === 0) {
      setError('Ponle nombre y elige al menos un ejercicio.');
      return;
    }
    setCreating(true);
    try {
      await api.post(`/players/${playerId}/plans`, {
        name: name.trim(),
        focus: focus.trim() || undefined,
        items: Array.from(selected).map((drillId) => ({ drillId })),
      });
      setName(''); setFocus(''); setSelected(new Set()); setOpen(false);
      await load();
    } catch (e) {
      setError(apiErrorMessage(e) || 'No se pudo crear el plan');
    } finally {
      setCreating(false);
    }
  };

  const active = plans.find((p) => p.status === 'ACTIVE');

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="font-black text-slate-700 flex items-center gap-2 text-sm uppercase tracking-widest">
          <Dumbbell size={18} className="text-indigo-600" /> Plan de entrenamiento
        </h3>
        <button
          onClick={() => setOpen(!open)}
          className="text-xs font-black text-indigo-600 flex items-center gap-1 hover:text-indigo-700"
        >
          <Plus size={15} /> {active ? 'Nuevo plan' : 'Asignar plan'}
        </button>
      </div>

      {/* Plan activo */}
      {active ? (
        <div className="glass rounded-[2rem] p-6 border border-white/50">
          <div className="flex items-center gap-2 mb-3">
            <span className="font-black text-slate-800">{active.name}</span>
            {active.focus && <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 uppercase">{active.focus}</span>}
            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 uppercase">Activo</span>
          </div>
          <ul className="space-y-2">
            {active.items.map((it) => (
              <li key={it.id} className="bg-white/60 rounded-xl px-4 py-3 border border-slate-100">
                <div className="flex items-center gap-2">
                  <span className={`text-[9px] font-black uppercase ${MERCI[it.drill.dimension]?.color ?? 'text-slate-400'}`}>{it.drill.dimension}</span>
                  <span className="font-bold text-slate-700 text-sm">{it.drill.title}</span>
                </div>
                {it.drill.targetMetric && <div className="text-[11px] text-slate-400 font-semibold mt-0.5">{it.drill.targetMetric}</div>}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        !open && <p className="text-sm text-slate-400 font-medium">Aún no tiene un plan asignado.</p>
      )}

      {/* Crear plan */}
      {open && (
        <div className="glass rounded-[2rem] p-6 border border-white/50 space-y-4">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nombre del plan (ej. Bloque de tir)"
            className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-white/70 font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          <input value={focus} onChange={(e) => setFocus(e.target.value)} placeholder="Foco (opcional, ej. M/E)"
            className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-white/70 font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          <div className="space-y-3">
            {MERCI_ORDER.filter((dim) => drills.some((d) => d.dimension === dim)).map((dim) => (
              <div key={dim}>
                <div className={`text-[10px] font-black uppercase tracking-widest mb-1 ${MERCI[dim]?.color}`}>{merciName(dim)}</div>
                <div className="grid gap-2">
                  {drills.filter((d) => d.dimension === dim).map((d) => (
                    <button key={d.id} type="button" onClick={() => toggle(d.id)}
                      className={`text-left px-4 py-2.5 rounded-xl border-2 text-sm font-bold flex items-center gap-2 transition-all ${selected.has(d.id) ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-slate-100 bg-white/60 text-slate-600'}`}>
                      <span className={`w-4 h-4 rounded flex items-center justify-center ${selected.has(d.id) ? 'bg-indigo-600 text-white' : 'bg-slate-200'}`}>
                        {selected.has(d.id) && <Check size={12} />}
                      </span>
                      {d.title}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          {error && <p className="text-sm font-bold text-rose-600 bg-rose-50 rounded-xl px-4 py-3">{error}</p>}
          <button onClick={create} disabled={creating}
            className="w-full bg-indigo-600 text-white font-black py-3.5 rounded-2xl hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-60">
            {creating ? 'Guardando…' : `Asignar plan (${selected.size} ejercicios)`}
          </button>
        </div>
      )}

      {/* Sesiones registradas por el jugador */}
      {sessions.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-black text-slate-400 text-[11px] uppercase tracking-widest flex items-center gap-1.5">
            <CalendarCheck size={13} /> Sesiones del jugador
          </h4>
          {sessions.map((s) => (
            <div key={s.id} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex items-center justify-between">
              <div>
                <div className="text-sm font-bold text-slate-700">{new Date(s.date).toLocaleDateString()} · {s.results.length} ejercicios</div>
                {s.notes && <div className="text-[11px] text-slate-400 font-medium">{s.notes}</div>}
              </div>
              {s.mood != null && (
                <span className="text-[11px] font-black text-amber-600 flex items-center gap-1"><Smile size={14} /> {s.mood}/5</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
