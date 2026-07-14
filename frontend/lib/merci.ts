// Dimensiones del método MERCI (CIEP).
export const MERCI: Record<string, { name: string; color: string }> = {
  M: { name: 'Motricidad', color: 'text-indigo-600' },
  E: { name: 'Emociones', color: 'text-rose-600' },
  R: { name: 'Relaciones', color: 'text-emerald-600' },
  C: { name: 'Cinco Sentidos', color: 'text-amber-600' },
  I: { name: 'Inteligencia', color: 'text-sky-600' },
};

export const MERCI_ORDER = ['M', 'E', 'R', 'C', 'I'];

export function merciName(code: string): string {
  return MERCI[code]?.name ?? code;
}
