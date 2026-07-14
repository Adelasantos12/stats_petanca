'use client';

import { useCallback, useEffect, useState } from 'react';
import api, { apiErrorMessage } from '@/lib/api';
import { MERCI } from '@/lib/merci';
import { Dumbbell, Check, Smile, CalendarCheck, Send } from 'lucide-react';

interface Drill { id: string; title: string; dimension: string; description: string | null; targetMetric: string | null; }
interface PlanItem { id: string; drill: Drill; }
interface Plan { id: string; name: string; focus: string | null; items: PlanItem[]; }
interface Session { id: string; date: string; mood: number | null; notes: string | null; results: { id: string }[]; }

export default function MyPlan() {
  const [plan, setPlan] = useState<Plan | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [done, setDone] = useState<Set<string>>(new Set());
  const [mood, setMood] = useState<number | null>(null);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const [p, s] = await Promise.all([
      api.get('/player-auth/me/plan'),
      api.get('/player-auth/me/sessions'),
    ]);
    setPlan(p.data);
    setSessions(s.data);
  }, []);

  useEffect(() => { load().catch(() => {}); }, [load]);

  const toggle = (id: string) => {
    const next = new Set(done);
    if (next.has(id)) next.delete(id); else next.add(id);
    setDone(next);
  };

  const submit = async () => {
    setError(null); setMsg(null);
    const results = (plan?.items ?? [])
      .filter((it) => done.has(it.drill.id))
      .map((it) => ({ drillId: it.drill.id, label: it.drill.title, done: true }));
    if (results.length === 0 && mood == null && !notes.trim()) {
      setError('Marca al menos un ejercicio, tu ánimo o una nota.');
      return;
    }
    setSaving(true);
    try {
      await api.post('/player-auth/me/sessions', {
        planId: plan?.id,
        mood: mood ?? undefined,
        notes: notes.trim() || undefined,
        results,
      });
      setDone(new Set()); setMood(null); setNotes('');
      setMsg('¡Sesión registrada! 💪');
      await load();
    } catch (e) {
      setError(apiErrorMessage(e) || 'No se pudo registrar la sesión');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      <h3 className="font-black text-slate-700 flex items-center gap-2 text-sm uppercase tracking-widest">
        <Dumbbell size={18} className="text-amber-500" /> Mi plan de entrenamiento
      </h3>

      {!plan ? (
        <div className="glass rounded-[2rem] p-6 border border-white/50 text-center">
          <p className="text-slate-400 font-semibold text-sm">Tu entrenador aún no te asignó un plan.</p>
        </div>
      ) : (
        <div className="glass rounded-[2rem] p-6 border border-white/50 space-y-4">
          <div className="flex items-center gap-2">
            <span className="font-black text-slate-800">{plan.name}</span>
            {plan.focus && <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 uppercase">{plan.focus}</span>}
          </div>

          <div className="space-y-2">
            {plan.items.map((it) => (
              <button key={it.id} type="button" onClick={() => toggle(it.drill.id)}
                className={`w-full text-left px-4 py-3 rounded-2xl border-2 transition-all ${done.has(it.drill.id) ? 'border-amber-500 bg-amber-50' : 'border-slate-100 bg-white/60'}`}>
                <div className="flex items-center gap-2">
                  <span className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 ${done.has(it.drill.id) ? 'bg-amber-500 text-white' : 'bg-slate-200'}`}>
                    {done.has(it.drill.id) && <Check size={13} />}
                  </span>
                  <span className={`text-[9px] font-black uppercase ${MERCI[it.drill.dimension]?.color ?? 'text-slate-400'}`}>{it.drill.dimension}</span>
                  <span className="font-bold text-slate-700 text-sm">{it.drill.title}</span>
                </div>
                {it.drill.description && <div className="text-[11px] text-slate-400 font-medium mt-1 pl-7">{it.drill.description}</div>}
                {it.drill.targetMetric && <div className="text-[11px] text-amber-600/80 font-bold mt-0.5 pl-7">🎯 {it.drill.targetMetric}</div>}
              </button>
            ))}
          </div>

          {/* Ánimo */}
          <div>
            <div className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1"><Smile size={13} /> ¿Cómo te sentiste?</div>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((m) => (
                <button key={m} type="button" onClick={() => setMood(mood === m ? null : m)}
                  className={`flex-1 py-2.5 rounded-xl font-black transition-all ${mood === m ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-400'}`}>{m}</button>
              ))}
            </div>
          </div>

          <input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notas (opcional)"
            className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-white/70 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500" />

          {error && <p className="text-sm font-bold text-rose-600 bg-rose-50 rounded-xl px-4 py-3">{error}</p>}
          {msg && <p className="text-sm font-bold text-emerald-700 bg-emerald-50 rounded-xl px-4 py-3">{msg}</p>}

          <button onClick={submit} disabled={saving}
            className="w-full bg-amber-500 text-white font-black py-3.5 rounded-2xl flex items-center justify-center gap-2 hover:bg-amber-600 transition-all active:scale-95 disabled:opacity-60">
            <Send size={17} /> {saving ? 'Registrando…' : 'Registrar sesión'}
          </button>
        </div>
      )}

      {sessions.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-black text-slate-400 text-[11px] uppercase tracking-widest flex items-center gap-1.5">
            <CalendarCheck size={13} /> Mis sesiones
          </h4>
          {sessions.map((s) => (
            <div key={s.id} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex items-center justify-between">
              <div className="text-sm font-bold text-slate-700">{new Date(s.date).toLocaleDateString()} · {s.results.length} ejercicios</div>
              {s.mood != null && <span className="text-[11px] font-black text-amber-600 flex items-center gap-1"><Smile size={14} /> {s.mood}/5</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
