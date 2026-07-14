// Definición oficial del método MERCI (CIEP México, dic. 2025).
export const MERCI_DIMENSIONS = [
  { code: 'M', name: 'Motricidad', description: 'Movimiento corporal correcto, minimizando errores y riesgo de lesión' },
  { code: 'E', name: 'Emociones', description: 'Gestión de emociones, foco en frustración y euforia' },
  { code: 'R', name: 'Relaciones', description: 'Conexión, comunicación y trabajo en equipo. Respeto ante todo' },
  { code: 'C', name: 'Cinco Sentidos', description: 'Uso consciente de vista, oído, tacto, propiocepción y equilibrio' },
  { code: 'I', name: 'Inteligencia', description: 'Resolver problemas, entender ideas y aprender de la experiencia' },
] as const;

export const MERCI_CODES = ['M', 'E', 'R', 'C', 'I'] as const;

// Ejercicios semilla, dos por dimensión, listos para asignar en un plan.
export const DEFAULT_DRILLS: {
  title: string;
  dimension: string;
  description: string;
  targetMetric: string;
}[] = [
  { title: 'Serie de tir enfocando postura estable', dimension: 'M', description: 'Tir a 7 m manteniendo alineación y equilibrio en cada bola.', targetMetric: '20 bolas · postura estable' },
  { title: 'Point cuidando el balanceo del brazo', dimension: 'M', description: 'Point a 6 m con backswing fluido y soltura controlada.', targetMetric: '20 bolas a 6 m' },
  { title: 'Respiración entre lanzamientos', dimension: 'E', description: 'Rutina de respiración para regular tensión antes de cada tiro.', targetMetric: '1 sesión · foco en calma' },
  { title: 'Bola de la victoria (presión)', dimension: 'E', description: 'Simular el lanzamiento decisivo y gestionar la euforia/frustración.', targetMetric: '10 situaciones de presión' },
  { title: 'Doblete comunicando cada decisión', dimension: 'R', description: 'Jugar en dupla verbalizando point/tir y colocación en voz alta.', targetMetric: '1 partida comunicada' },
  { title: 'Rol de líder de la ronda', dimension: 'R', description: 'Dirigir la estrategia del equipo respetando y escuchando a todos.', targetMetric: '1 ronda dirigida' },
  { title: 'Leer el terreno antes de lanzar', dimension: 'C', description: 'Observar distancias y posiciones (vista) antes de cada point.', targetMetric: '20 bolas con lectura previa' },
  { title: 'Tir propioceptivo (peso de la bola)', dimension: 'C', description: 'Ajustar la fuerza por tacto y propiocepción, sin fijarse en el reloj.', targetMetric: '15 bolas por sensación' },
  { title: 'Elegir point o tir (decisión)', dimension: 'I', description: 'Resolver 10 situaciones de juego eligiendo la mejor opción.', targetMetric: '10 decisiones' },
  { title: 'Anticipar la jugada del rival', dimension: 'I', description: 'Prever la respuesta del oponente en 5 configuraciones del terreno.', targetMetric: '5 anticipaciones' },
];

export function dimensionName(code: string): string {
  return MERCI_DIMENSIONS.find((d) => d.code === code)?.name ?? code;
}
