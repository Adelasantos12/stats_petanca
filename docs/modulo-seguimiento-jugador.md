# Módulo de Seguimiento del Jugador (Método MERCI) — Investigación y Diseño

> Documento de investigación + propuesta de arquitectura para el CIEP.
> Convierte el marcador de rendimiento actual en una plataforma de **desarrollo
> longitudinal del jugador**: evaluaciones, niveles, planes de entrenamiento
> supervisados-pero-autónomos y seguimiento del progreso, inspirado en los
> modelos de desarrollo del tenis y en la psicología deportiva.

---

## 0. Resumen ejecutivo

Hoy la app es un **marcador analítico de partido**: registra lanzamientos con una
escala de eficacia de −2 a +2, calcula un *Performance %* por jugador/equipo y
distingue *point* vs *tir*. Es una base excelente — de hecho, esa escala −2..+2 ya
es el "corazón cuantitativo" de un método tipo MERCI — pero le faltan tres capas
para ser un sistema de seguimiento:

1. **Identidad persistente del jugador** (hoy se crea un jugador nuevo por partido).
2. **Un marco de competencias y niveles** (qué evaluar, cómo se sube de nivel).
3. **Un ciclo de entrenamiento** (plan → sesión → evaluación → progreso visible).

La propuesta es un **módulo "Desarrollo del Jugador"** que reutiliza todo lo que ya
tienes y añade esas tres capas, tomando prestada la estructura probada del tenis
(pathway por etapas, las 4 áreas Técnica/Táctica/Física/Mental, periodización y
evaluación por competencias) y anclándola en la psicología deportiva de la
autonomía (Teoría de la Autodeterminación) y la práctica deliberada.

---

## 1. El modelo análogo: cómo el tenis estructura el desarrollo del jugador

El tenis es el mejor referente porque, como la petanca, es un deporte de
**precisión + decisión táctica + gestión emocional bajo presión**, con un gesto
técnico repetible que se puede medir. La federación internacional (ITF) y los
sistemas nacionales llevan décadas formalizando el desarrollo del jugador. Cuatro
ideas son directamente trasladables:

### 1.1. Desarrollo a Largo Plazo del Deportista (LTAD) — progresión por etapas

El LTAD es un marco por etapas que desarrolla, en orden, la *alfabetización motriz*,
la condición física, la técnica, la táctica y la capacidad competitiva. Su
principio central es que **se avanza de etapa según el desarrollo real del jugador,
no por la edad ni por el tiempo transcurrido**. En tenis esto se concreta, por
ejemplo, en el programa *Play & Stay* (pelotas roja/naranja/verde con bote y
velocidad graduados): el jugador no "sube de pelota" hasta que domina la anterior.

> **Traslado a petanca:** define **niveles** (p.ej. Iniciación → Bronce → Plata →
> Oro → Élite) donde la promoción depende de superar una **evaluación objetiva**,
> no de la asistencia. Las "pelotas graduadas" del tenis se convierten en
> distancias y dificultades graduadas de pointer/tirer.

### 1.2. Las cuatro áreas de rendimiento (T-T-F-M)

En las academias de referencia (p.ej. Sánchez-Casal) el jugador se construye sobre
cuatro pilares evaluados por separado y luego integrados:

| Área | En tenis | Equivalente en petanca |
|------|----------|------------------------|
| **Técnica** | Empuñadura, golpeo, equilibrio | Postura, soltura de brazo, tipo de bola (plombée/roulette), tir au fer |
| **Táctica** | Anticipación, decisión, lectura del punto | Elegir pointer/tirer, leer el terreno, gestión del "trou", colocación |
| **Física** | Resistencia, movilidad, fuerza | Estabilidad, resistencia a la fatiga en torneos largos, movilidad de cadera |
| **Mental** | Concentración, gestión de presión, rutinas | Rutina pre-lanzamiento, control emocional tras un mal tiro, foco |

Este es exactamente el esqueleto que tu marco **MERCI** puede formalizar (ver §4).

### 1.3. Evaluación por competencias (no por sensaciones)

La investigación en tenis usa instrumentos validados —como el *Tactical Skills
Questionnaire in Tennis (TSQT)*, con subescalas de anticipación/posición,
inteligencia de juego, toma de decisiones y reconocimiento de situaciones— y
*modelos de competencias* para determinar el nivel técnico-táctico de un jugador de
forma reproducible. La idea clave: **cada competencia tiene descriptores
observables y una rúbrica**, de modo que dos entrenadores distintos puntúan
parecido.

> **Traslado a petanca:** cada nivel se define con una **rúbrica de competencias
> observables** (p.ej. "Plata en tir: ≥55% de carreau+palet a 7-8 m en 20 bolas").
> La evaluación deja de ser subjetiva.

### 1.4. Periodización

El entrenamiento del tenis se organiza en ciclos (modelos tradicional y ATR —
Acumulación/Transformación/Realización) que alternan volumen técnico, integración
táctica-física y puesta a punto competitiva. No se entrena "lo mismo todo el año":
hay bloques con objetivos distintos según la cercanía de la competición.

> **Traslado a petanca:** el plan de entrenamiento del jugador se estructura en
> **mesociclos** (bloques de 3-6 semanas) con un foco dominante (p.ej. "bloque de
> tir", "bloque táctico de dobletes", "puesta a punto pre-torneo").

---

## 2. Referentes dentro de la propia petanca (no partimos de cero)

La **FFPJP (Federación Francesa)** ya ha formalizado piezas de esto; conviene
alinearse con ellas para dar credibilidad al sistema del CIEP:

- **Livret de suivi du jeune joueur** — un cuadernillo de seguimiento del joven
  jugador organizado en **4 grandes competencias** desglosadas en sub-competencias,
  *savoir-faire*, conocimientos y actitudes, ligadas a categorías de edad y a etapas
  de aprendizaje/evaluación. Es, literalmente, el equivalente petanca del pathway
  del tenis.
- **Épreuves "buts-boules"** — pruebas estandarizadas de habilidad (colocar el
  boliche a distancias dadas, series de point y de tir) que sirven como **tests de
  nivel objetivos**. Son la fuente ideal para las rúbricas de promoción.
- **Manuel pédagogique (86 ejercicios)** — banco de ejercicios por nivel y por
  taller (lanzamiento de boliche, colocación, tir…), perfecto para poblar la
  **biblioteca de ejercicios** del plan de entrenamiento.
- **Logiciel "Pétanque Performance" (FFPJP)** — ya existe un software federativo de
  registro de rendimiento; tu app puede diferenciarse ofreciendo la **capa de
  desarrollo del jugador y autonomía** que ese software no cubre bien.

> **Nota sobre "MERCI" y el CIEP:** el **CIEP (Centre International d'Enseignement
> Pétanque)** es el único centro homologado por la **FIPJP** (federación
> internacional) para la formación y la entrega de diplomas internacionales. Su
> método ("notre méthode") se basa en la **postura corporal, el maniement de la
> boule y los lanzamientos** trabajados por talleres y partidos, e incluye
> **construir ciclos de entrenamiento y evaluar a los jugadores** — exactamente el
> ciclo que este módulo automatiza. La página que define el acrónimo MERCI está
> protegida contra acceso automatizado (devuelve 403), así que **no pude
> transcribir la definición literal de cada letra**. En §4 propongo una
> reconstrucción coherente con el método CIEP; **basta con que tu esposo pegue la
> definición oficial y solo cambiamos las etiquetas** — la arquitectura no cambia.

---

## 3. Psicología deportiva aplicada al seguimiento autónomo

Pediste explícitamente el foco psicológico. Tres cuerpos teóricos sostienen el
diseño de un plan "supervisado pero autónomo":

### 3.1. Teoría de la Autodeterminación (SDT) — el motor de la autonomía

Para que un jugador entrene por su cuenta y **persista**, deben cubrirse tres
necesidades psicológicas básicas: **autonomía, competencia y relación**. Cuando se
cubren, la motivación se vuelve *autónoma* (intrínseca), lo que se asocia a más
práctica deliberada, más persistencia y mejor rendimiento.

> **Cómo lo implementa el módulo:**
> - **Autonomía:** el jugador elige entre ejercicios equivalentes del plan y marca
>   sus propias sesiones (no todo lo impone el coach).
> - **Competencia:** feedback inmediato (tu Performance %), micro-metas y barra de
>   progreso hacia el siguiente nivel.
> - **Relación:** el coach valida evaluaciones y deja comentarios; ranking/insignias
>   de club.

### 3.2. Práctica deliberada

La mejora no viene del volumen, sino de práctica **con propósito, en el límite de la
habilidad, con feedback y repetición enfocada**. Por eso el plan no es "lanza 100
bolas", sino "20 bolas de tir a 8 m registrando eficacia, objetivo ≥60%".

> **Cómo lo implementa el módulo:** cada ejercicio tiene objetivo medible, número de
> intentos y se registra con la **misma escala −2..+2 que ya usas en partido**, de
> modo que entrenamiento y competición son comparables.

### 3.3. Habilidades mentales y rutinas

La preparación mental de élite se apoya en **imaginería/visualización, control
respiratorio, autodiálogo, gestión emocional y rutinas pre-ejecución**. En deportes
de precisión, la **rutina pre-lanzamiento** consistente es uno de los predictores
más robustos de rendimiento bajo presión.

> **Cómo lo implementa el módulo:** el área **Mental** del perfil incluye una
> "rutina pre-lanzamiento" definida por el jugador, un diario emocional breve
> post-sesión y ejercicios de visualización asignables. En el marcador de partido,
> la caída de eficacia por mano (que ya graficas) es una señal objetiva de gestión
> de presión/fatiga.

---

## 4. El marco MERCI: reconstrucción propuesta

Como la página oficial del CIEP está protegida y no pude transcribir la definición,
propongo un mapeo que (a) encaja con las 4 áreas del tenis y con el método CIEP
(postura/maniement/lanzamientos), (b) reutiliza tu escala −2..+2 y (c) forma el
acrónimo. **A confirmar con la definición oficial del CIEP** — si las siglas son
otras, solo cambian las etiquetas, no la arquitectura.

| Sigla | Dimensión propuesta | Qué mide | Fuente de datos |
|-------|--------------------|----------|-----------------|
| **M** | **Mental** | Concentración, gestión de presión, rutina, actitud | Auto-reporte + observación del coach + caída de eficacia intra-partido |
| **E** | **Eficacia técnica** | Calidad del gesto (point y tir) | Escala −2..+2 ya existente (Performance %) |
| **R** | **Regularidad / Constancia** | Consistencia bola a bola y sesión a sesión | Desviación de los scores −2..+2 en el tiempo |
| **C** | **Control táctico / Decisión** | Elegir bien point/tir, leer terreno | Etiqueta de acierto de decisión por lanzamiento (nuevo campo) |
| **I** | **Implicación / Iniciativa** | Adherencia al plan, autonomía, esfuerzo | Sesiones completadas vs planificadas |

Cada dimensión se puntúa 0–100 y alimenta un **perfil radar MERCI** del jugador que
evoluciona en el tiempo. Nivel de club = combinación de umbrales por dimensión.

---

## 5. Diseño del módulo "Desarrollo del Jugador"

### 5.1. Principio rector: **reutilizar, no reescribir**

El `Throw` con `effectivenessScore` (−2..+2) es la unidad atómica tanto en partido
como en entrenamiento. El módulo añade **contexto longitudinal** encima, sin tocar
la lógica de marcador que ya funciona.

### 5.2. Cambio arquitectónico imprescindible: identidad persistente del jugador

Hoy `matches.service.ts` crea un `Player` nuevo por cada nombre en cada partido
(no hay reutilización). Para "seguir a un jugador en el tiempo" necesitamos:

- Un **roster de jugadores del club** persistente (con `clubId`, categoría, nivel).
- Que al crear partido se **seleccione** de ese roster (o se cree y quede guardado).
- Idealmente, **login del jugador** (rol `PLAYER` vs `COACH`) para que cada quien vea
  su propio desarrollo. Empezar con acceso por PIN/enlace y evolucionar a auth real.

### 5.3. Modelo de datos propuesto (Prisma) — aditivo

```prisma
// --- Identidad y club (nuevo) ---
model Club {
  id       String   @id @default(uuid())
  name     String
  players  Player[]
  coaches  Coach[]
}

model Coach {
  id     String @id @default(uuid())
  name   String
  email  String @unique
  clubId String
  club   Club   @relation(fields: [clubId], references: [id])
}

// Player pasa a ser PERSISTENTE y del club (extiende el modelo actual)
model Player {
  id          String        @id @default(uuid())
  name        String
  clubId      String?
  club        Club?         @relation(fields: [clubId], references: [id])
  category    String?       // BENJAMIN, MINIME, SENIOR, VETERAN...
  levelId     String?       // nivel actual (ver PlayerLevel)
  accessPin   String?       // acceso simple del jugador (evoluciona a auth)
  matches     MatchPlayer[]
  throws      Throw[]
  evaluations Evaluation[]
  sessions    TrainingSession[]
  planId      String?
  createdAt   DateTime      @default(now())
}

// --- Niveles y evaluación (nuevo) ---
model Level {
  id          String  @id @default(uuid())
  name        String  // Iniciación, Bronce, Plata, Oro, Élite
  order       Int
  description String?
  criteria    LevelCriterion[]
}

model LevelCriterion {
  id          String @id @default(uuid())
  levelId     String
  level       Level  @relation(fields: [levelId], references: [id])
  dimension   String // M, E, R, C, I  (marco MERCI)
  label       String // "Tir a 7-8m ≥55% en 20 bolas"
  minScore    Float  // umbral 0-100
}

model Evaluation {
  id          String   @id @default(uuid())
  playerId    String
  player      Player   @relation(fields: [playerId], references: [id])
  coachId     String?
  date        DateTime @default(now())
  targetLevel String?  // nivel que se intenta superar
  merciM      Float?
  merciE      Float?
  merciR      Float?
  merciC      Float?
  merciI      Float?
  passed      Boolean  @default(false)
  notes       String?
  items       EvaluationItem[]  // resultado prueba a prueba (buts-boules)
}

model EvaluationItem {
  id           String  @id @default(uuid())
  evaluationId String
  evaluation   Evaluation @relation(fields: [evaluationId], references: [id])
  drillId      String?
  label        String
  attempts     Int
  successes    Int
  score        Float   // 0-100 o media -2..+2 normalizada
}

// --- Plan y entrenamiento (nuevo) ---
model TrainingPlan {
  id        String   @id @default(uuid())
  playerId  String?
  coachId   String?
  name      String
  focus     String   // "Bloque de tir", "Táctico dobletes"...
  startDate DateTime @default(now())
  endDate   DateTime?
  blocks    PlanBlock[]
}

model PlanBlock {
  id        String @id @default(uuid())
  planId    String
  plan      TrainingPlan @relation(fields: [planId], references: [id])
  week      Int
  dimension String        // MERCI
  drills    PlanDrill[]
}

model Drill {
  id          String @id @default(uuid())
  title       String
  dimension   String // M, E, R, C, I
  description  String
  targetMetric String? // "≥60% eficacia en 20 bolas de tir a 8m"
  minLevel    Int    @default(0)
}

model PlanDrill {
  id       String @id @default(uuid())
  blockId  String
  block    PlanBlock @relation(fields: [blockId], references: [id])
  drillId  String
  drill    Drill  @relation(fields: [drillId], references: [id])
  reps     Int
}

model TrainingSession {
  id         String   @id @default(uuid())
  playerId   String
  player     Player   @relation(fields: [playerId], references: [id])
  planId     String?
  date       DateTime @default(now())
  status     String   @default("PLANNED") // PLANNED, DONE, SKIPPED
  mood       Int?     // diario emocional 1-5 (área Mental)
  notes      String?
  drillResults DrillResult[]
}

model DrillResult {
  id         String @id @default(uuid())
  sessionId  String
  session    TrainingSession @relation(fields: [sessionId], references: [id])
  drillId    String
  attempts   Int
  successes  Int
  avgScore   Float  // media -2..+2 → reutiliza tu misma escala
}
```

> Todo es **aditivo**: no rompe `Match`, `Hand` ni `Throw`. La única migración
> "de fondo" es hacer `Player` persistente y seleccionable al crear partido.

### 5.4. API (NestJS) — nuevos módulos

- `players/` — CRUD del roster, `GET /players/:id/development` (perfil MERCI en el
  tiempo, agregando `Throw` de partidos + `DrillResult` de entrenamientos).
- `levels/` — catálogo de niveles y criterios; `POST /players/:id/evaluations`,
  `POST /evaluations/:id/close` (calcula MERCI, decide `passed`, promueve nivel).
- `plans/` — generar/asignar plan, `GET /players/:id/plan`.
- `sessions/` — `POST /players/:id/sessions`, registrar `DrillResult`.
- `drills/` — biblioteca de ejercicios (semilla con el *Manuel pédagogique* FFPJP).

El cálculo de eficacia **reutiliza `calculateMetrics`** (`matches.service.ts:183`)
extraído a un servicio compartido, para que partido y entrenamiento usen la misma
fórmula `((suma + 2n) / 4n) * 100`.

### 5.5. Pantallas (Next.js)

**Del jugador (autonomía):**
- *Mi desarrollo* — radar MERCI + barra de progreso al siguiente nivel + racha.
- *Mi plan* — sesiones de la semana; el jugador elige entre ejercicios equivalentes.
- *Registrar sesión* — mismo control de −2..+2 que el marcador, pero para drills.
- *Rutina & diario mental* — rutina pre-lanzamiento + estado de ánimo post-sesión.

**Del coach (supervisión):**
- *Roster* — lista de jugadores con nivel y última evaluación.
- *Evaluar* — rúbrica del nivel objetivo, registra prueba a prueba, promueve.
- *Diseñar plan* — arrastra ejercicios a bloques/semanas por dimensión.
- *Analítica de club* — evolución agregada (ya tienes base con Recharts).

### 5.6. Cómo se conecta con lo que YA tienes

- El botón "guardar torneo/juego" que te falta se resuelve con el mismo cambio:
  al persistir el `Match` con jugadores del roster, el histórico queda ligado a cada
  jugador → alimenta su dimensión **E** (eficacia) y **R** (regularidad) sin trabajo
  extra. **El seguimiento sale casi gratis del marcador.**
- La gráfica "Evolución de eficacia por mano" que ya tienes es el germen del área
  **Mental** (gestión de presión/fatiga intra-partido).

---

## 6. Roadmap por fases (incremental, sin romper lo desplegado)

| Fase | Entregable | Valor |
|------|-----------|-------|
| **0. Cierre del MVP actual** | Guardar partido/torneo en histórico; roster persistente de jugadores | Desbloquea todo lo demás |
| **1. Identidad + histórico por jugador** | Perfil de jugador con sus partidos y eficacia acumulada | El coach ya ve evolución real |
| **2. Marco MERCI + evaluaciones** | Radar MERCI, niveles, rúbricas, promoción | "Subir de nivel" con criterio objetivo |
| **3. Planes y sesiones** | Biblioteca de drills, plan por bloques, registro de sesión | Entrenamiento autónomo guiado |
| **4. Capa psicológica** | Rutina pre-lanzamiento, diario emocional, visualización, metas SDT | Autonomía + adherencia |
| **5. Vista jugador (login)** | Acceso del jugador a *su* desarrollo | Cierra el círculo supervisado-autónomo |

---

## 7. Decisiones que conviene confirmar con el coach

1. **¿Qué significan exactamente las siglas MERCI?** (para calcar sus dimensiones).
2. **¿Cuántos niveles y con qué nombres?** (¿alineados con categorías FFPJP?).
3. **¿El jugador tendrá login propio** o de momento solo el coach registra?
4. **¿Alcance:** solo jugadores del CIEP, o multi-club desde el inicio?
5. **¿Se adoptan las pruebas "buts-boules" de la FFPJP** como tests de nivel?

---

## Fuentes

**Petanca / CIEP / FFPJP**
- CIEP — Notre méthode (página protegida, 403 al acceso automatizado): https://www.ciep-petanque.com/stages/notre-méthode
- CIEP — El centro (homologación FIPJP): https://www.ciep-petanque.com/le-ciep/le-ciep
- FFPJP — Livret de suivi du jeune joueur et épreuves buts-boules: https://home.ffpjp.org/direction-technique-nationale/livret-de-suivi-du-jeune-joueur-et-epreuves-buts-boules
- FFPJP — Notice logiciel "Pétanque Performance": https://home.ffpjp.org/images/2022/NOTICE_UTILISATION_LOGICIEL__PETANQUE_PERFORMANCE.pdf
- Manuel pédagogique pétanque (86 exercices): https://www.petanque.qc.ca/Uploads/Manuel_p__dagogique_p__tanque.pdf
- Comment évaluer un joueur (détection): https://www.petanque-apprentissage.com/2016/04/le-detection-comment-evaluer-un-joueur.html
- Évaluation de son jeu: https://www.blogpetanque.com/passiondujeu/EVALUATION-DE-SON-JEU_a163.html

**Modelo del tenis (LTAD / desarrollo)**
- Human Kinetics — LTAD en 7 etapas: https://us.humankinetics.com/blogs/excerpt/long-term-athlete-development-follows-seven-stages
- Four-Stage Model of LTAD (tennis): https://longislandtennismagazine.com/article/four-stage-model-long-term-athlete-development/
- Tennis BC — Player pathways: https://www.tennisbc.org/youth-tennis/resources/pathways/
- Periodización táctica en tenis (introducción): https://www.researchgate.net/publication/299510868_Tactical_periodisation_in_tennis_An_introduction
- ATR vs periodización tradicional (tenis adolescente): https://revista-apunts.com/en/atr-versus-traditional-periodization-in-adolescent-amateur-tennis-players/
- Modelo de competencias técnico-táctico en tenis (revisión sistemática): https://www.frontiersin.org/journals/sports-and-active-living/articles/10.3389/fspor.2024.1406846/full
- Tactical Skills Questionnaire in Tennis (TSQT): https://www.ncbi.nlm.nih.gov/pmc/articles/PMC9552173/

**Psicología deportiva**
- Self-Determination Theory aplicada al deporte: https://thementalgame.me/blog/the-influence-of-self-determination-theory-on-athlete-motivation
- SDT en programación del entrenamiento: https://simplifaster.com/articles/self-determination-theory-strength-conditioning/
- Imaginería mental en el deporte de alto nivel: https://www.valdemarne.fr/newsletters/sport-sante-et-preparation-physique/limagerie-mentale-une-technique-pour-apprendre-sentrainer-et-performer
- Preparación mental (guía): https://sportmental.fr/preparation-mentale/
</content>
</invoke>
