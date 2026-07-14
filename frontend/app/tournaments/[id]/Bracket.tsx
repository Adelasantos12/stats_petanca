'use client';

import { Round, PairingRow } from './PairingRow';

function roundLabel(pairings: number, index: number, total: number): string {
  if (pairings === 1) return 'Final';
  if (pairings === 2) return 'Semifinal';
  if (pairings === 4) return 'Cuartos';
  if (pairings === 8) return 'Octavos';
  return `Ronda ${index + 1} de ${total}`;
}

export default function Bracket({ rounds, onResult }: { rounds: Round[]; onResult: () => void }) {
  return (
    <div className="overflow-x-auto pb-4">
      <div className="flex gap-4 min-w-min">
        {rounds.map((r, i) => (
          <div key={r.id} className="flex flex-col justify-around gap-3 min-w-[240px]">
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">
              {roundLabel(r.pairings.length, i, rounds.length)}
            </div>
            {r.pairings.map((p) => (
              <PairingRow key={p.id} p={p} onResult={onResult} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
