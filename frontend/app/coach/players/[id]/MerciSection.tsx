'use client';

import { useCallback, useEffect, useState } from 'react';
import api, { apiErrorMessage } from '@/lib/api';
import { MERCI } from '@/lib/merci';
import MerciRadar, { MerciScores } from '@/components/MerciRadar';
import { Radar as RadarIcon, ChevronDown } from 'lucide-react';

interface Question { code: string; dimension: string; title: string; d: [string, string, string, string, string]; }
interface Dimension { code: string; name: string; description: string; }
interface Assessment extends MerciScores { id: string; date: string; notes: string | null; }

export default function MerciSection({ playerId }: { playerId: string }) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [dimensions, setDimensions] = useState<Dimension[]>([]);
  const [history, setHistory] = useState<Assessment[]>([]);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [notes, setNotes] = useState('');
  const [openForm, setOpenForm] = useState(false);
  const [openDim, setOpenDim] = useState<string | null>('M');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const [q, h] = await Promise.all([
      api.get('/merci/questions'),
      api.get(`/players/${playerId}/merci`),
    ]);
    setQuestions(q.data.questions);
    setDimensions(q.data.dimensions);
    setHistory(h.data);
  }, [playerId]);

  useEffect(() => { load().catch(() => {}); }, [load]);

  const answered = Object.keys(scores).length;
  const setScore = (code: string, v: number) => setScores({ ...scores, [code]: v });

  const submit = async () => {
    setError(null);
    if (answered < questions.length) {
      setError(`Faltan ${questions.length - answered} preguntas por responder.`);
      return;
    }
    setSaving(true);
    try {
      await api.post(`/players/${playerId}/merci`, { notes: notes.trim() || undefined, scores });
      setScores({}); setNotes(''); setOpenForm(false);
      await load();
    } catch (e) {
      setError(apiErrorMessage(e) || 'No se pudo guardar la evaluación MERCI');
    } finally {
      setSaving(false);
    }
  };

  const latest = history[0];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="font-black text-slate-700 flex items-center gap-2 text-sm uppercase tracking-widest">
          <RadarIcon size={18} className="text-indigo-600" /> Evaluación MERCI
        </h3>
        <button onClick={() => setOpenForm(!openForm)} className="text-xs font-black text-indigo-600 hover:text-indigo-700">
          {openForm ? 'Cerrar' : latest ? 'Nueva evaluación' : 'Evaluar'}
        </button>
      </div>

      {/* Radar del último resultado */}
      {latest && !openForm && (
        <div className="glass rounded-[2rem] p-6 border border-white/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-400">{new Date(latest.date).toLocaleDateString()}</span>
            <span className="text-2xl font-black text-indigo-600">{latest.total}%</span>
          </div>
          <MerciRadar scores={latest} />
          <div className="grid grid-cols-5 gap-2 mt-3 text-center">
            {(['M', 'E', 'R', 'C', 'I'] as const).map((k) => (
              <div key={k}>
                <div className={`text-lg font-black ${MERCI[k].color}`}>{latest[`score${k}` as keyof MerciScores]}</div>
                <div className="text-[9px] font-bold text-slate-400 uppercase">{MERCI[k].name}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Formulario de 30 preguntas */}
      {openForm && (
        <div className="glass rounded-[2rem] p-6 border border-white/50 space-y-3">
          <div className="text-xs font-bold text-slate-400">{answered}/{questions.length} respondidas</div>
          {dimensions.map((dim) => {
            const qs = questions.filter((q) => q.dimension === dim.code);
            const done = qs.filter((q) => scores[q.code]).length;
            return (
              <div key={dim.code} className="border border-slate-100 rounded-2xl overflow-hidden">
                <button type="button" onClick={() => setOpenDim(openDim === dim.code ? null : dim.code)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-white/60">
                  <span className={`font-black text-sm ${MERCI[dim.code]?.color}`}>{dim.name}</span>
                  <span className="flex items-center gap-2 text-[11px] font-bold text-slate-400">
                    {done}/{qs.length}
                    <ChevronDown size={16} className={openDim === dim.code ? 'rotate-180 transition-transform' : 'transition-transform'} />
                  </span>
                </button>
                {openDim === dim.code && (
                  <div className="p-4 space-y-4">
                    {qs.map((q) => (
                      <div key={q.code}>
                        <div className="text-sm font-bold text-slate-700 mb-1">
                          <span className="text-slate-300 font-mono text-xs mr-1">{q.code}</span>{q.title}
                        </div>
                        <div className="flex gap-1.5">
                          {[5, 4, 3, 2, 1].map((v) => (
                            <button key={v} type="button" onClick={() => setScore(q.code, v)}
                              className={`flex-1 py-2 rounded-lg font-black text-sm transition-all ${scores[q.code] === v ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'}`}>{v}</button>
                          ))}
                        </div>
                        {scores[q.code] && (
                          <p className="text-[11px] text-slate-500 font-medium mt-1 italic">{q.d[5 - scores[q.code]]}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
          <input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notas (opcional)"
            className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-white/70 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          {error && <p className="text-sm font-bold text-rose-600 bg-rose-50 rounded-xl px-4 py-3">{error}</p>}
          <button onClick={submit} disabled={saving}
            className="w-full bg-indigo-600 text-white font-black py-3.5 rounded-2xl hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-60">
            {saving ? 'Guardando…' : `Guardar evaluación (${answered}/${questions.length})`}
          </button>
        </div>
      )}

      {/* Historial de totales */}
      {history.length > 1 && !openForm && (
        <div className="space-y-2">
          <h4 className="font-black text-slate-400 text-[11px] uppercase tracking-widest">Historial MERCI</h4>
          {history.map((a) => (
            <div key={a.id} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex items-center justify-between">
              <span className="text-sm font-bold text-slate-600">{new Date(a.date).toLocaleDateString()}</span>
              <span className="text-lg font-black text-indigo-600">{a.total}%</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
