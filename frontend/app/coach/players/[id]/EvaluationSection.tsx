'use client';

import { useCallback, useEffect, useState } from 'react';
import api, { apiErrorMessage } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { ClipboardCheck, ChevronUp, CheckCircle2, XCircle, Trophy, History } from 'lucide-react';

interface Criterion {
  id: string;
  label: string;
  dimension: string | null;
  target: number;
  unit: string;
}
interface NextLevel {
  currentLevel: { id: string; name: string } | null;
  nextLevel: { id: string; name: string; description: string | null; criteria: Criterion[] } | null;
  atMax: boolean;
}
interface EvalItem {
  id: string;
  label: string;
  target: number;
  attempts: number;
  successes: number;
  score: number;
  met: boolean;
}
interface Evaluation {
  id: string;
  date: string;
  passed: boolean;
  notes: string | null;
  targetLevel: { name: string } | null;
  items: EvalItem[];
}

// { criterionId | index : { attempts, successes } }
type Form = Record<string, { attempts: string; successes: string }>;

export default function EvaluationSection({
  playerId,
  onPromoted,
}: {
  playerId: string;
  onPromoted: () => void;
}) {
  const [next, setNext] = useState<NextLevel | null>(null);
  const [evals, setEvals] = useState<Evaluation[]>([]);
  const [form, setForm] = useState<Form>({});
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ passed: boolean; promoted: boolean; newLevel: string | null } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const [n, h] = await Promise.all([
      api.get(`/players/${playerId}/next-level`),
      api.get(`/players/${playerId}/evaluations`),
    ]);
    setNext(n.data);
    setEvals(h.data);
    // prellena el formulario con los criterios del nivel objetivo
    const f: Form = {};
    (n.data.nextLevel?.criteria ?? []).forEach((c: Criterion) => {
      f[c.id] = { attempts: '', successes: '' };
    });
    setForm(f);
  }, [playerId]);

  useEffect(() => {
    load().catch(() => {});
  }, [load]);

  const submit = async () => {
    if (!next?.nextLevel) return;
    setError(null);
    const items = next.nextLevel.criteria.map((c) => ({
      criterionId: c.id,
      label: c.label,
      target: c.target,
      attempts: parseInt(form[c.id]?.attempts || '0', 10),
      successes: parseInt(form[c.id]?.successes || '0', 10),
    }));
    if (items.some((it) => it.attempts < 1)) {
      setError('Indica los intentos (al menos 1) en cada prueba.');
      return;
    }
    if (items.some((it) => it.successes > it.attempts)) {
      setError('Los aciertos no pueden superar los intentos.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await api.post(`/players/${playerId}/evaluations`, {
        targetLevelId: next.nextLevel.id,
        notes: notes.trim() || undefined,
        items,
      });
      setResult({ passed: res.data.passed, promoted: res.data.promoted, newLevel: res.data.newLevel });
      setNotes('');
      await load();
      if (res.data.promoted) onPromoted();
    } catch (e) {
      setError(apiErrorMessage(e) || 'No se pudo guardar la evaluación');
    } finally {
      setSubmitting(false);
    }
  };

  if (!next) return null;

  return (
    <div className="space-y-5">
      <h3 className="font-black text-slate-700 flex items-center gap-2 text-sm uppercase tracking-widest">
        <ClipboardCheck size={18} className="text-indigo-600" /> Evaluación de nivel
      </h3>

      {next.atMax ? (
        <div className="glass rounded-[2rem] p-6 border border-white/50 text-center">
          <Trophy size={28} className="text-amber-500 mx-auto mb-2" />
          <p className="font-bold text-slate-600">Este jugador ya está en el nivel máximo.</p>
        </div>
      ) : (
        <div className="glass rounded-[2rem] p-6 shadow-xl shadow-slate-200/30 border border-white/50 space-y-5">
          <div className="flex items-center gap-2 text-sm">
            <span className="font-bold text-slate-500">
              {next.currentLevel ? next.currentLevel.name : 'Sin nivel'}
            </span>
            <ChevronUp size={16} className="text-indigo-500 rotate-90" />
            <span className="font-black text-indigo-600">{next.nextLevel!.name}</span>
            {next.nextLevel!.description && (
              <span className="text-slate-400 text-xs">· {next.nextLevel!.description}</span>
            )}
          </div>

          {next.nextLevel!.criteria.length === 0 ? (
            <p className="text-sm text-slate-400 font-medium">
              Este nivel no tiene criterios definidos todavía. Puedes añadirlos desde el catálogo de niveles.
            </p>
          ) : (
            <div className="space-y-3">
              {next.nextLevel!.criteria.map((c) => {
                const val = form[c.id] || { attempts: '', successes: '' };
                const a = parseInt(val.attempts || '0', 10);
                const s = parseInt(val.successes || '0', 10);
                const pct = a > 0 ? Math.round((s / a) * 100) : null;
                const met = pct != null && pct >= c.target;
                return (
                  <div key={c.id} className="bg-white/60 rounded-2xl p-4 border border-slate-100">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="font-bold text-slate-700 text-sm">
                        {c.dimension && (
                          <span className="text-[9px] font-black text-indigo-500 mr-1.5 uppercase">{c.dimension}</span>
                        )}
                        {c.label}
                      </div>
                      <span className="text-[11px] font-black text-slate-400 whitespace-nowrap">
                        objetivo ≥ {c.target}
                        {c.unit}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <NumInput
                        placeholder="Intentos"
                        value={val.attempts}
                        onChange={(v) => setForm({ ...form, [c.id]: { ...val, attempts: v } })}
                      />
                      <NumInput
                        placeholder="Aciertos"
                        value={val.successes}
                        onChange={(v) => setForm({ ...form, [c.id]: { ...val, successes: v } })}
                      />
                      {pct != null && (
                        <span
                          className={`text-sm font-black whitespace-nowrap flex items-center gap-1 ${met ? 'text-emerald-600' : 'text-rose-500'}`}
                        >
                          {met ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                          {pct}
                          {c.unit}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}

              <input
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Notas del coach (opcional)"
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-white/70 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />

              {error && (
                <p className="text-sm font-bold text-rose-600 bg-rose-50 rounded-xl px-4 py-3">{error}</p>
              )}

              <button
                onClick={submit}
                disabled={submitting}
                className="w-full bg-indigo-600 text-white font-black py-3.5 rounded-2xl flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all active:scale-95 shadow-lg shadow-indigo-100 disabled:opacity-60"
              >
                <ClipboardCheck size={18} />
                {submitting ? 'Registrando…' : `Registrar evaluación de ${next.nextLevel!.name}`}
              </button>
            </div>
          )}

          <AnimatePresence>
            {result && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`rounded-2xl p-5 text-center ${result.passed ? 'bg-emerald-50' : 'bg-rose-50'}`}
              >
                {result.promoted ? (
                  <>
                    <Trophy size={28} className="text-amber-500 mx-auto mb-1" />
                    <p className="font-black text-emerald-700">¡Promovido a {result.newLevel}! 🎉</p>
                  </>
                ) : result.passed ? (
                  <p className="font-black text-emerald-700">Superó todas las pruebas.</p>
                ) : (
                  <p className="font-black text-rose-600">Aún no cumple todos los criterios. ¡A seguir entrenando!</p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {evals.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-black text-slate-400 text-[11px] uppercase tracking-widest flex items-center gap-1.5">
            <History size={13} /> Historial de evaluaciones
          </h4>
          {evals.map((ev) => (
            <div key={ev.id} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-700 text-sm flex items-center gap-2">
                  {ev.passed ? (
                    <CheckCircle2 size={16} className="text-emerald-500" />
                  ) : (
                    <XCircle size={16} className="text-rose-400" />
                  )}
                  {ev.targetLevel ? ev.targetLevel.name : 'Evaluación'}
                </div>
                <div className="text-[11px] font-semibold text-slate-400 mt-0.5">
                  {new Date(ev.date).toLocaleDateString()} · {ev.items.filter((i) => i.met).length}/{ev.items.length} pruebas superadas
                </div>
              </div>
              <span
                className={`text-[10px] font-black px-3 py-1 rounded-full uppercase ${ev.passed ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}
              >
                {ev.passed ? 'Superado' : 'No superado'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function NumInput({
  placeholder,
  value,
  onChange,
}: {
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <input
      type="number"
      min="0"
      inputMode="numeric"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
    />
  );
}
