export interface Metrics {
  n: number;
  suma: number;
  media: number | null;
  performance: number | null;
}

/**
 * Fórmula de performance de la app: ((suma + 2n) / 4n) * 100 sobre la escala
 * de eficacia -2..+2. Compartida por partido, torneo y desarrollo del jugador.
 */
export function calculateMetrics(
  throws: { effectivenessScore: number }[],
): Metrics {
  const n = throws.length;
  if (n === 0) return { n: 0, suma: 0, media: null, performance: null };

  const suma = throws.reduce((acc, t) => acc + t.effectivenessScore, 0);
  const media = suma / n;
  const performance = ((suma + 2 * n) / (4 * n)) * 100;

  return {
    n,
    suma,
    media: parseFloat(media.toFixed(2)),
    performance: parseFloat(performance.toFixed(1)),
  };
}
