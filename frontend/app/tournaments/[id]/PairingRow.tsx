'use client';

import { useState } from 'react';
import api from '@/lib/api';
import { Trophy } from 'lucide-react';

export interface Pairing {
  id: string; slot: number;
  entryAId: string | null; entryBId: string | null;
  entryAName: string | null; entryBName: string | null;
  scoreA: number | null; scoreB: number | null;
  winnerEntryId: string | null; winnerName: string | null;
  nextPairingId: string | null;
}
export interface Round { id: string; number: number; pairings: Pairing[]; }

export function PairingRow({ p, onResult }: { p: Pairing; onResult: () => void }) {
  const [a, setA] = useState(p.scoreA?.toString() ?? '');
  const [b, setB] = useState(p.scoreB?.toString() ?? '');
  const [saving, setSaving] = useState(false);
  const bye = !p.entryAId || !p.entryBId;

  const save = async () => {
    if (a === '' || b === '' || a === b) return;
    setSaving(true);
    try {
      await api.post(`/tournaments/pairings/${p.id}/result`, { scoreA: parseInt(a, 10), scoreB: parseInt(b, 10) });
      onResult();
    } catch {
      setSaving(false);
    }
  };

  if (bye) {
    return (
      <div className="bg-white/60 rounded-2xl px-4 py-3 border border-slate-100 text-sm font-bold text-slate-500">
        {p.entryAName ?? p.entryBName ?? '—'} <span className="text-slate-300 font-semibold">· pasa (BYE)</span>
      </div>
    );
  }

  const done = p.winnerEntryId != null;
  return (
    <div className="rounded-2xl px-4 py-3 border bg-white border-slate-100 flex items-center gap-3">
      <div className="flex-1 min-w-0">
        <Side name={p.entryAName} win={p.winnerEntryId === p.entryAId} />
        <Side name={p.entryBName} win={p.winnerEntryId === p.entryBId} />
      </div>
      {done ? (
        <div className="text-right font-black text-slate-800 tabular-nums">
          <div className={p.winnerEntryId === p.entryAId ? 'text-emerald-600' : ''}>{p.scoreA}</div>
          <div className={p.winnerEntryId === p.entryBId ? 'text-emerald-600' : ''}>{p.scoreB}</div>
        </div>
      ) : (
        <div className="flex items-center gap-1.5">
          <input value={a} onChange={(e) => setA(e.target.value)} type="number" min="0" placeholder="—"
            className="w-12 px-2 py-1.5 rounded-lg border border-slate-200 text-center font-black text-sm" />
          <input value={b} onChange={(e) => setB(e.target.value)} type="number" min="0" placeholder="—"
            className="w-12 px-2 py-1.5 rounded-lg border border-slate-200 text-center font-black text-sm" />
          <button onClick={save} disabled={saving || a === '' || b === '' || a === b}
            className="bg-emerald-600 text-white text-xs font-black px-3 py-2 rounded-lg disabled:opacity-40">OK</button>
        </div>
      )}
    </div>
  );
}

function Side({ name, win }: { name: string | null; win: boolean }) {
  return (
    <div className={`truncate text-sm font-bold ${win ? 'text-emerald-600' : 'text-slate-700'}`}>
      {win && <Trophy size={12} className="inline mr-1 -mt-0.5" />}
      {name ?? <span className="text-slate-300 italic">por definir</span>}
    </div>
  );
}
