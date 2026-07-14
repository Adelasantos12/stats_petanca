// Cuestionario oficial MERCI (CIEP México, dic. 2025): 30 preguntas, 6 por
// dimensión, cada una en escala 1-5. `d` va de la puntuación 5 (índice 0) a la 1.
export interface MerciQuestion {
  code: string;
  dimension: string; // M, E, R, C, I
  title: string;
  d: [string, string, string, string, string]; // descriptores para 5,4,3,2,1
}

export const MERCI_QUESTIONS: MerciQuestion[] = [
  // 1. MOTRICIDAD
  { code: '1.1', dimension: 'M', title: 'Posición del cuerpo', d: [
    'Postura estable, alineada y correcta en todo momento',
    'Buena postura en general, ajustes menores',
    'Inestabilidad ocasional, afecta el rendimiento',
    'Postura inadecuada, pérdida frecuente de equilibrio',
    'Postura incorrecta, riesgo de lesión'] },
  { code: '1.2', dimension: 'M', title: 'Backswing (brazo hacia atrás)', d: [
    'Movimiento fluido, controlado y consistente',
    'Movimiento adecuado, desviaciones ocasionales',
    'Movimiento irregular, afecta la precisión',
    'Poco control, desequilibrio evidente',
    'Movimiento deficiente, afecta gravemente el lanzamiento'] },
  { code: '1.3', dimension: 'M', title: 'Suelta de la bola', d: [
    'Suelta precisa con timing correcto',
    'Buena suelta, ligeras variaciones',
    'Suelta inconsistente, afecta la trayectoria',
    'Suelta prematura o tardía, baja la precisión',
    'Mala suelta, lanzamiento errático'] },
  { code: '1.4', dimension: 'M', title: 'Equilibrio', d: [
    'Mantiene equilibrio perfecto todo el tiempo',
    'Buen equilibrio, correcciones menores',
    'Pérdida de equilibrio ocasional',
    'Mal equilibrio, afecta el lanzamiento',
    'Pérdida continua de equilibrio'] },
  { code: '1.5', dimension: 'M', title: 'Coordinación corporal', d: [
    'Movimientos armónicos y bien sincronizados siempre',
    'Buena coordinación, pequeños fallos ocasionales',
    'Coordinación irregular, afecta algunos lanzamientos',
    'Falta evidente de coordinación, compromete la técnica',
    'Movimientos desorganizados, sin control corporal'] },
  { code: '1.6', dimension: 'M', title: 'Motricidad en tipos de tiro (point y tir)', d: [
    'Domina ambos con control',
    'Maneja bien ambos, más fuerte en uno',
    'Aceptable en uno, dificultades en el otro',
    'Limita su juego a un solo tipo',
    'Sin dominio de ninguno'] },

  // 2. EMOCIONES
  { code: '2.1', dimension: 'E', title: 'Tensión', d: [
    'Control total, se mantiene en calma',
    'Manejo adecuado, ligera tensión bajo presión',
    'Tensión moderada, afecta algunas decisiones',
    'Alta tensión, reduce el rendimiento',
    'Estrés incontrolable, afecta gravemente'] },
  { code: '2.2', dimension: 'E', title: 'Euforia', d: [
    'Celebra con mesura, mantiene el foco',
    'Expresa emoción sin perder el foco',
    'La euforia rompe la concentración a veces',
    'Euforia excesiva distrae al equipo',
    'Pierde el foco por completo por la euforia'] },
  { code: '2.3', dimension: 'E', title: 'Frustración', d: [
    'Gestiona la frustración, se recupera rápido',
    'Muestra frustración pero se ajusta bien',
    'La frustración afecta el siguiente tiro',
    'Pérdida emocional de control frecuente',
    'Frustración incontrolable, impacto severo'] },
  { code: '2.4', dimension: 'E', title: 'Motivación / Persistencia', d: [
    'Muy motivado, persevera ante la adversidad',
    'Motivado en general, ligeras bajadas',
    'Motivación inconsistente, distracciones',
    'Pierde la motivación con frecuencia',
    'Falta total de motivación'] },
  { code: '2.5', dimension: 'E', title: 'Autoconciencia emocional', d: [
    'Reconoce emociones y ajusta proactivamente',
    'Reconoce emociones, correcciones ocasionales',
    'Consciente pero rara vez actúa',
    'Poco control, no reconoce el impacto',
    'Desconexión total de las emociones'] },
  { code: '2.6', dimension: 'E', title: 'Regulación emocional entre tiros', d: [
    'Estabilidad emocional entre tiros, ajusta siempre',
    'Regula bien, fluctuaciones breves',
    'Cambios emocionales afectan algunos tiros',
    'Clara dificultad para regularse',
    'Incapaz de regularse, errores consecutivos'] },

  // 3. RELACIONES
  { code: '3.1', dimension: 'R', title: 'Liderazgo', d: [
    'Lidera con el ejemplo, motiva y dirige',
    'Toma iniciativa, colabora con eficacia',
    'Muestra liderazgo ocasionalmente',
    'Participa pero evita responsabilidad',
    'Sin liderazgo, actitud pasiva'] },
  { code: '3.2', dimension: 'R', title: 'Confianza', d: [
    'Plena confianza en sus decisiones',
    'Seguro, con dudas ocasionales',
    'Confianza inestable, afecta el rendimiento',
    'Inseguridad frecuente',
    'Sin confianza alguna'] },
  { code: '3.3', dimension: 'R', title: 'Respeto a jugadores y entrenadores', d: [
    'Siempre respetuoso',
    'Respetuoso, con raras excepciones',
    'Respeto intermitente, algunas actitudes inapropiadas',
    'Falta de respeto ocasional, afecta el ambiente',
    'Frecuentemente irrespetuoso'] },
  { code: '3.4', dimension: 'R', title: 'Comunicación con el equipo', d: [
    'Comunicación clara y eficaz, mejora la coordinación',
    'Buena comunicación, problemas menores',
    'Comunicación intermitente, afecta el entendimiento',
    'Comunicación pobre, dificulta el trabajo en equipo',
    'Sin comunicación, genera confusión'] },
  { code: '3.5', dimension: 'R', title: 'Trabajo en equipo bajo presión', d: [
    'Colabora activamente, decide en conjunto bajo presión',
    'Buena colaboración, problemas menores',
    'Colaboración limitada, afecta decisiones clave',
    'Evita colaborar, crea problemas de coordinación',
    'Bloquea el trabajo en equipo, actitud individualista'] },
  { code: '3.6', dimension: 'R', title: 'Aceptación de decisiones colectivas', d: [
    'Acepta y ejecuta con total compromiso',
    'Acepta en general, con reservas mínimas',
    'Acepta pero duda o muestra desacuerdo',
    'Cuestiona con frecuencia, afecta la dinámica',
    'Rechaza las decisiones colectivas'] },

  // 4. CINCO SENTIDOS
  { code: '4.1', dimension: 'C', title: 'Vista (terreno y bola)', d: [
    'Detecta distancias y posiciones con precisión',
    'Buena observación, errores de cálculo menores',
    'Observa pero con errores frecuentes',
    'Poca atención visual, afecta la elección del tiro',
    'No observa adecuadamente'] },
  { code: '4.2', dimension: 'C', title: 'Oído (instrucciones y entorno)', d: [
    'Escucha y sigue todas las instrucciones con precisión',
    'Escucha bien, omisiones leves',
    'Atención parcial, pierde información importante',
    'Frecuentemente distraído, escucha pobre',
    'No atiende al entorno ni a las instrucciones'] },
  { code: '4.3', dimension: 'C', title: 'Tacto y propiocepción', d: [
    'Control total, se ajusta al peso perfectamente',
    'Buen control, ligeras variaciones',
    'Control inconsistente, afecta la precisión',
    'Bajo control, no ajusta la fuerza',
    'Sin control perceptible'] },
  { code: '4.4', dimension: 'C', title: 'Equilibrio / sentido cinestésico', d: [
    'Excelente percepción corporal, siempre estable',
    'Buena percepción, errores menores',
    'Percepción irregular, afecta la ejecución',
    'Percepción débil, desequilibrio frecuente',
    'Sin percepción, mala ejecución'] },
  { code: '4.5', dimension: 'C', title: 'Rutina (calentar, escuchar, observar, aplicar, evaluar, mejorar)', d: [
    'Sigue una rutina completa antes y durante el juego',
    'Tiene una rutina clara, a veces salta pasos',
    'Rutina irregular, no siempre preparado',
    'Poca preparación, improvisa',
    'Sin rutina, sin hábitos de preparación'] },
  { code: '4.6', dimension: 'C', title: 'Visión estratégica', d: [
    'Anticipa jugadas y posiciones con precisión',
    'Anticipa bien, errores menores',
    'Anticipación irregular, afecta decisiones',
    'Dificultad para anticipar situaciones',
    'Sin anticipación, debilidad estratégica'] },

  // 5. INTELIGENCIA
  { code: '5.1', dimension: 'I', title: 'Resolución de problemas', d: [
    'Encuentra soluciones estratégicas y eficaces',
    'Resuelve con eficacia, con algo de demora',
    'Algunas soluciones, pero resuelve al final',
    'Le cuesta encontrar soluciones',
    'Incapaz de resolver problemas'] },
  { code: '5.2', dimension: 'I', title: 'Distracciones', d: [
    'Totalmente concentrado, ignora distracciones',
    'Ligeramente distraído, se recupera rápido',
    'Distracciones ocasionales, afectan el juego',
    'Distracciones frecuentes',
    'Constantemente distraído, sin foco'] },
  { code: '5.3', dimension: 'I', title: 'Concentración en el tiro', d: [
    'Foco máximo durante el tiro',
    'Buen foco, lapsos menores',
    'Pierde el foco en momentos clave',
    'Foco pobre, afecta la precisión',
    'Sin foco, mala ejecución'] },
  { code: '5.4', dimension: 'I', title: 'Resiliencia mental y física', d: [
    'Se recupera al instante, mantiene el nivel en partidos largos',
    'Buena recuperación, mantiene el foco casi siempre',
    'Recuperación parcial, arrastra errores',
    'Mala recuperación, pérdida prolongada de foco',
    'Incapaz de recuperarse, bajo rendimiento continuo'] },
  { code: '5.5', dimension: 'I', title: 'Capacidad de mejorar y adaptarse', d: [
    'Ajusta técnica y estrategia de inmediato tras el feedback',
    'Acepta la corrección, mejora rápido',
    'Mejora lenta, le cuesta ajustar',
    'Resistente al cambio, poca adaptación',
    'Rechaza correcciones, sin intención de mejorar'] },
  { code: '5.6', dimension: 'I', title: 'Autonomía mental', d: [
    'Decide de forma independiente y estratégica, mantiene el juicio',
    'Decide adecuadamente con mínima supervisión',
    'Requiere guía frecuente, decisiones inconsistentes',
    'Muy dependiente de otros, afecta el juego',
    'Incapaz de decidir, bloquea la estrategia'] },
];
