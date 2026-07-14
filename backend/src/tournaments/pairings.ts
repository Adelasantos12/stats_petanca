// Algoritmos de emparejamiento puros (sin BD).

export interface PairPlan {
  slot: number;
  entryAId: string | null;
  entryBId: string | null;
}

/**
 * Round-robin (método del círculo). Devuelve una lista de rondas; en cada ronda,
 * los cruces. Un rival null = BYE (descanso). Con nº impar se añade un BYE.
 */
export function roundRobin(entryIds: string[]): PairPlan[][] {
  const ids: (string | null)[] = [...entryIds];
  if (ids.length % 2 === 1) ids.push(null); // BYE
  const n = ids.length;
  const arr = [...ids];
  const rounds: PairPlan[][] = [];

  for (let r = 0; r < n - 1; r++) {
    const pairs: PairPlan[] = [];
    for (let i = 0; i < n / 2; i++) {
      let a = arr[i];
      let b = arr[n - 1 - i];
      if (a === null && b !== null) [a, b] = [b, a]; // el real siempre en A
      pairs.push({ slot: i, entryAId: a, entryBId: b });
    }
    rounds.push(pairs);
    // rota manteniendo fijo el primero
    const fixed = arr[0];
    const rest = arr.slice(1);
    rest.unshift(rest.pop() as string | null);
    arr.splice(0, arr.length, fixed, ...rest);
  }
  return rounds;
}

/** Orden estándar de seeds para un cuadro de tamaño `size` (potencia de 2). */
export function seedOrder(size: number): number[] {
  let pols = [1, 2];
  const rounds = Math.log2(size);
  for (let r = 1; r < rounds; r++) {
    const out: number[] = [];
    const length = pols.length * 2 + 1;
    for (const p of pols) {
      out.push(p);
      out.push(length - p);
    }
    pols = out;
  }
  return pols;
}

/**
 * Eliminatoria simple: genera TODAS las rondas del cuadro (vacías salvo la 1ª).
 * Las posiciones de seed mayores que el nº de participantes quedan como BYE.
 * Devuelve rounds[r][slot]; el ganador de rounds[r][slot] avanza a
 * rounds[r+1][floor(slot/2)], en A si slot es par y en B si es impar.
 */
export function singleElim(seededEntryIds: string[]): PairPlan[][] {
  const n = seededEntryIds.length;
  let size = 1;
  while (size < n) size *= 2;
  const order = seedOrder(size); // posiciones de seed 1..size

  const first: PairPlan[] = [];
  for (let i = 0; i < size / 2; i++) {
    const seedA = order[i * 2];
    const seedB = order[i * 2 + 1];
    const entryAId = seedA <= n ? seededEntryIds[seedA - 1] : null;
    const entryBId = seedB <= n ? seededEntryIds[seedB - 1] : null;
    first.push({ slot: i, entryAId, entryBId });
  }

  const rounds: PairPlan[][] = [first];
  let count = size / 2;
  while (count > 1) {
    count = count / 2;
    const round: PairPlan[] = [];
    for (let i = 0; i < count; i++) {
      round.push({ slot: i, entryAId: null, entryBId: null });
    }
    rounds.push(round);
  }
  return rounds;
}
