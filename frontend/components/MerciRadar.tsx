'use client';

import {
  ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip,
} from 'recharts';

export interface MerciScores {
  scoreM: number; scoreE: number; scoreR: number; scoreC: number; scoreI: number; total?: number;
}

export default function MerciRadar({ scores, color = '#4f46e5' }: { scores: MerciScores; color?: string }) {
  const data = [
    { dim: 'Motricidad', value: scores.scoreM },
    { dim: 'Emociones', value: scores.scoreE },
    { dim: 'Relaciones', value: scores.scoreR },
    { dim: 'Cinco Sentidos', value: scores.scoreC },
    { dim: 'Inteligencia', value: scores.scoreI },
  ];
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} outerRadius="72%">
          <PolarGrid stroke="#e2e8f0" />
          <PolarAngleAxis dataKey="dim" tick={{ fontSize: 11, fontWeight: 800, fill: '#64748b' }} />
          <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 9, fill: '#cbd5e1' }} axisLine={false} />
          <Radar dataKey="value" stroke={color} fill={color} fillOpacity={0.35} strokeWidth={2} />
          <Tooltip formatter={(v) => [`${v}%`, 'MERCI']} contentStyle={{ borderRadius: 14, border: 'none', boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.15)', fontWeight: 700 }} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
