# Blueprint de Producto — App de Petanca (Casual + MERCI)

> Estrategia integral construida con tres lentes: **negocio/marketing**, **flujo/UX**
> y **arquitectura técnica**, más una capa de **psicología social y diseño
> conductual**. Un solo producto, dos motores de negocio, tres idiomas (EN/ES/FR).
> Complementa a `docs/modulo-seguimiento-jugador.md` (método MERCI).

---

## 0. La tesis en una página

Construimos **un solo producto con dos motores**:

- **Motor de adquisición y volumen (Casual/Leisure):** para el jugador recreativo
  del mundo —el de terraza, camping y parque, que juega para socializar, picarse y
  **sentirse superior**—. Contador digital sin fricción + retos + estatus, con
  suscripción muy barata. Aquí no vendemos deporte: vendemos **estatus y diversión**.
- **Motor de valor y foso defensivo (Pro/MERCI):** seguimiento serio del jugador con
  el método MERCI del CIEP (homologado FIPJP). Otro modelo de negocio (tier premium
  + B2B a clubes y entrenadores). Aquí vendemos **progreso medible y método**.

**La apuesta (secuencia recomendada):** lanzar por el **Casual**, usando el
**contador y los torneos como gancho gratuito y viral** (obligan a que todo el grupo
instale la app), monetizar rápido con la suscripción barata, y **cosechar el foso**
activando Pro-MERCI y Club en fase 2 con el sello CIEP como credibilidad. Primero se
llena el embudo por arriba (masa casual), luego se cosecha por abajo (pro/club).

El pegamento entre ambos mundos es el **dato atómico que ya existe**: el `Throw` con
escala −2..+2. Alimenta a la vez la estadística vanidosa del casual, el marcador del
torneo y el radar MERCI del jugador serio. **Se construye una vez, se monetiza tres.**

---

## 1. Psicología social y diseño conductual: qué conecta, qué genera gusto e intención

Antes de las funciones, el *por qué* psicológico. Cada perfil se engancha por
palancas distintas; el diseño debe activarlas deliberadamente.

### 1.1. Qué mueve realmente a cada perfil

- **El casual "de terraza" no juega por la petanca; juega por el vínculo y el ego.**
  Su motivación primaria es la **pertenencia** (ritual social con el grupo) y el
  **estatus relativo** (ganar la discusión, presumir). No quiere entrenar; quiere
  **tener razón y que se note**. Palanca: **comparación social + identidad de grupo**.
- **El aspiracional** ya siente la **necesidad de competencia** (Self-Determination
  Theory): quiere ver que mejora. Palanca: **progreso visible + dominio**.
- **El competidor de club** busca **estatus formal y reconocimiento** dentro de una
  jerarquía real. Palanca: **ranking objetivo + validación externa**.
- **El coach/organizador** busca **eficacia y prestigio profesional**. Palanca:
  **herramienta que le hace quedar bien y le ahorra trabajo**.

### 1.2. Los cinco motores de "gusto" (liking) e intención

1. **Comparación social (Festinger).** El gusto del casual nace de compararse. La app
   debe hacer visible el ranking entre amigos, el "te han superado", el marco de
   avatar por estatus. *El estatus solo vale si los demás lo ven* → todo logro es,
   por defecto, **público y presumible** (feed, tarjeta compartible, ranking).
2. **Identidad y señalización tribal.** La gente adopta productos que **dicen algo de
   quién es**. Insignias, títulos ("Leyenda del parque"), tarjetas de resultado con
   branding: son **símbolos de identidad** que el usuario exhibe. El nombre y el tono
   de la marca deben dar orgullo de pertenencia ("yo uso *Carreau*").
3. **Modelo del hábito (Hook, Eyal): disparador → acción → recompensa variable →
   inversión.** El **gancho diario** (reto del día + racha en riesgo + "un amigo te
   pasó") es el disparador; marcar una partida es la acción; la **recompensa
   variable** (¿subo en el ranking?, ¿desbloqueo insignia?, ¿mantengo la racha?)
   genera el retorno; y la **inversión** (historial, racha acumulada, amigos
   añadidos) sube el coste de irse. Recompensa *variable*, no fija: la
   incertidumbre es lo que engancha.
4. **Aversión a la pérdida (Kahneman) > deseo de ganar.** La **racha** es el retentor
   más potente porque duele romperla. Diseñar rachas con *streak freeze*, rankings
   que **se resetean semanalmente** (todos tienen revancha) y avisos "tu reto expira
   en 2h". El miedo a perder estatus trae de vuelta más que la promesa de ganarlo.
5. **Prueba social y efecto arrastre.** "Tu grupo jugó 4 partidas esta semana",
   "Marie desbloqueó *Fanny*". Ver a los pares actuar **normaliza y contagia** la
   conducta. El bucle viral del torneo (todos instalan para ver el marcador) es
   prueba social + FOMO en estado puro.

### 1.3. Cómo bajar la barrera a la acción (B = MAP, BJ Fogg)

Conducta = Motivación × Habilidad × Disparador. Con el casual **no subimos la
motivación, bajamos la fricción**: partida en <15 s, sin login obligatorio, ≤2 taps,
offline. Y ponemos **disparadores bien colocados** (notificación matinal del reto,
aviso vespertino de racha). Un casual con ganas pero tres pantallas de registro por
delante **no actúa**; la habilidad (facilidad) es la variable que controlamos.

### 1.4. De "gusto" a "intención de pagar"

La intención de compra se dispara en dos umbrales emocionales concretos:
- **Casual → pago** cuando el usuario **quiere ver su historial/ranking completo o
  proteger su racha/estatus** (vanidad y aversión a la pérdida ya instaladas). Se
  vende una emoción ya sentida, no una promesa.
- **Casual → Pro** cuando aparece la **envidia de competencia**: "quiero mejorar de
  verdad". Y sobre todo cuando **un coach o club adopta la app** y arrastra al
  jugador (autoridad + pertenencia a un grupo serio).

### 1.5. Ética del diseño (importante)

Estas palancas son potentes; usarlas con un público que la clienta describe como
"vago, para pasar el rato" exige **no ser predatorio**: rachas con perdón, sin
*dark patterns* de cancelación, notificaciones dosificadas (1-2/día), y precio
honesto. La retención sana viene del vínculo social real (jugar con amigos), no de
la ansiedad. Un producto que la gente **disfruta** retiene mejor que uno que la
**atrapa**.

---

## 2. Personas y alcance de mercado

*(síntesis del lente de negocio)*

Cinco arquetipos con motivaciones y disposición a pagar (WTP) muy distintas:

| Persona | Motivación real | WTP | Qué se le ofrece |
|---------|-----------------|-----|------------------|
| **El fanfarrón de terraza** (casual, masivo) | Vínculo social + presumir + picarse | Muy baja (1-3 €/mes) pero volumen enorme | Contador sin fricción, stats "vanidosas", retos, insignias, ranking de amigos, estatus |
| **El que quiere subir** (aspiracional) | Competencia y progreso medible | Media (5-10 €) | Puente a MERCI ligero: radar M-E-R-C-I, auto-evaluaciones, drills básicos |
| **El competidor de club** (federado) | Rendimiento, ranking objetivo | Media-alta (8-15 €) | Seguimiento longitudinal completo, evolución MERCI, benchmarking |
| **El coach CIEP** (profesional) | Herramienta que da rigor y ahorra trabajo | Alta, por asiento/club (B2B) | Evaluación por rúbricas, diseño de planes, promoción por niveles, analítica |
| **El organizador/club** (institucional) | Eficiencia y prestigio del evento | Institucional (anual/por torneo) | Gestión de torneos (suizo, mêlée, brackets, standings), roster |

**Alcance EN/ES/FR (orden de magnitud, alta incertidumbre):**
- **Francia (FR):** el corazón. ~300.000 licenciados FFPJP, pero **17-20 millones**
  juegan ocasionalmente.
- **España + LatAm (ES):** federados pocos (decenas de miles), recreativos en costa,
  camping y tercera edad = cientos de miles; LatAm disperso pero barato de escalar.
- **África francófona (FR):** Madagascar (potencia real), Senegal, Marruecos, Benín…
  cientos de miles, alta afición, baja capacidad de pago → **volumen y contenido
  viral**, no ingreso.
- **Tailandia/Asia y anglófonos (EN):** Tailandia con base competitiva grande;
  EE.UU./UK/Australia = nicho pequeño pero de **alto poder adquisitivo y sin
  competencia** de app seria.
- **Próximo idioma natural: italiano** (bochas/petanca, cultura de bar) — oportunidad.

Federados mundiales ~500.000-700.000; recreativos plausiblemente **>30-50 millones**.
Capturar 1-2% del casual a 1-3 €/mes ya es un negocio de siete cifras anuales.

### Packaging y precios

| Plan | Precio EU/US | Precio LatAm/África | Incluye |
|------|--------------|---------------------|---------|
| **Free** | 0 € | 0 € | Contador ilimitado, stat básica, unirse a torneos, perfil |
| **Casual "Pro del bar"** | 2,99 €/mes · 19,99 €/año | ~0,99 €/mes | Stats completas, retos, insignias, ranking de amigos, historial |
| **Pro-MERCI** | 8,99-12,99 €/mes | escalado | Seguimiento longitudinal, radar MERCI, evaluaciones, plan, drills |
| **Club/Organizador** | 149-399 €/año (o 29-49 €/torneo) | negociado | Torneos ilimitados, roster, asientos de coach, analítica |

Precios **regionalizados por paridad de poder adquisitivo** (imprescindible para
África/LatAm). Prueba de 14 días en Pro. El contador y los torneos son **gratis a
propósito**: son adquisición, no producto de pago.

### Naming y posicionamiento

Marca paraguas neutra y aspiracional para el casual — candidatas: **Carreau**,
**Pointer**, **Cochonnet**, **BouleStats** — y submarca **MERCI by CIEP** para el
modo Pro. Ángulos: casual = *"¿Quién manda en la terraza?"*; Pro = *"Del parque al
podio."*

### Growth y bucle viral

El activo nº1 es que **el contador y el torneo obligan a que todo el grupo instale la
app** (crear partida/torneo → invitar por link/QR → los demás descargan para ver
marcador/sorteo/standings). Canales: clubes y federaciones FR/ES, el **sello CIEP**
para el Pro, torneos de parque/camping en verano, TikTok/Reels de "petanca viral"
(carreaus imposibles, piques de terraza), comunidades anglófonas/tailandesas, y
**coaches como fuerza de ventas B2B2C**.

### Riesgos de negocio

Dependencia del acuerdo con el CIEP para el método; WTP del casual muy baja (quizá
haga falta publicidad no intrusiva); estacionalidad de verano; y el supuesto de que
parte del casual migrará a "quiere mejorar" — si el techo emocional es solo presumir,
el Pro no escala.

---

## 3. Estructura de la app y flujos (UX)

*(síntesis del lente de diseño de flujo)*

**Principio maestro:** el **Contador es la puerta universal**; los dos modos son
**capas de sentido sobre el mismo dato** (`Throw` −2..+2). Nada de "elige tu app al
abrir".

### Navegación — tab bar de 4-5 destinos, home adaptativo

| Tab | Casual ve | Pro ve (además) |
|-----|-----------|-----------------|
| **Jugar** | Contador rápido + partida | igual |
| **Progreso** | Retos, rachas, insignias, estatus | *conmuta* a "Mi desarrollo" (radar MERCI) |
| **Torneos** | Explorar/unirse | organizar |
| **Social** | Feed, ranking amigos, club | ranking de club/coach |
| **Perfil** | Stats, estatus, suscripción, idioma | + estado MERCI, coach asignado |

La tab **Progreso** es un *segmented control* `Casual | MERCI`: el modo Pro aparece
como una **capa que se desbloquea** (compra o vinculación de coach), no un universo
paralelo. Mismo esqueleto, distinta densidad; el casual nunca ve jerga técnica.

### Onboarding que enruta personas (máx. 4 pantallas, *skippable*)

1. Bienvenida + idioma (autodetectado EN/ES/FR).
2. **"¿Qué te trae a la petanca?"** → 3 tarjetas: *picarme con mis colegas* (Casual)
   · *ir en serio y entrenar* (Pro/MERCI) · *organizar torneos* (Organizador). No es
   excluyente ni definitivo: solo decide qué se muestra primero.
3. Micro-personalización según rama (frecuencia y rol de juego → semilla de retos; o
   código de vinculación de coach; o tamaño de torneo habitual).
4. Gancho + permiso de notificaciones enmarcado en valor.
Todos aterrizan en **Jugar** con un CTA gigante "Nueva partida".

### Bucle Casual (retención)

**Gancho diario:** reto del día + racha ("🔥 4 días") + envidia social ("Pierre te ha
pasado 😏"). **Retos** que se autocompletan leyendo los `Throw`/resultados normales
(cero fricción). Ejemplos: *Carreau del día*, *Rey del boliche* (mano en blanco al
rival), *Fanny!* (13-0, insignia dorada), *El francotirador* (60% en tir),
*Superviviente* (remontar 0-6), *Cabezota* (5 días de racha), *Sociable* (3 rivales
distintos)… **Rachas** con *freeze*, **insignias** coleccionables y presumibles, y un
**sistema de estatus con XP** (Novato → … → Leyenda del parque) con marco de avatar
visible en feed y ranking. Ranking semanal que **se resetea** (revancha para todos).

### Contador rápido (offline-first)

Partida en <15 s: elegir tête-à-tête/doblete/triplete y modo *rápido* (solo marcador)
o *detallado* (throws −2..+2). Marcador con botones **+1** por mano y feedback
háptico al llegar a 13. **Fin** → resumen + **tarjeta imagen compartible** con
branding (gancho viral) + *Revancha* / *Guardar en histórico*. Todo persiste local
sin red.

### Torneos (organizador) — wizard + consola

Crear torneo → **elegir formato** (Mêlée / Suizo / Eliminatoria / Round-robin) →
registrar jugadores sueltos o equipos fijos → **sorteo animado** → cruces de la ronda
→ capturar resultados (abre el mismo contador) → **standings en vivo** → **vista de
bracket estilo FIFA/Apple TV** (cuadro scrollable/zoomable, conectores, avance
animado, **modo presentación** para proyectar en el club) → **detalle de partido**
(cronología mano a mano + Performance % + gráfica de eficacia ya existente).

### Pro/MERCI (jugador y coach)

Jugador: **Mi desarrollo** (radar MERCI + progreso al siguiente nivel), **Mi plan**
(elegir entre ejercicios equivalentes = autonomía), **registrar sesión** con la misma
escala −2..+2, rutina y diario mental. Coach: **roster**, **evaluar** por rúbrica y
promover nivel, **diseñar plan**, **analítica de club**. Subir de nivel MERCI
**también inyecta XP/insignias** en el mundo casual → los dos mundos se refuerzan.

### Prioridad de pantallas

- **MVP:** onboarding · home/tab bar · nueva partida · contador · resumen/compartir ·
  retos (diarios + racha) · perfil con stats · crear torneo (mêlée + eliminatoria) ·
  sorteo · standings · detalle de partido.
- **V2:** bracket FIFA · suizo/round-robin · feed + ranking · insignias/estatus
  completos · radar MERCI · registrar sesión Pro.
- **Futuro:** plan con equivalencias · consola coach · analítica club · diario mental
  · modo presentación TV · ligas persistentes.

**Componentes reutilizables:** `ThrowInput(−2..+2)`, `ScoreBoard`/`HandTimeline`,
`PerformanceChart`, `ShareCard`, `ProgressRing`/`StreakBadge`/`LevelChip`,
`MatchWizard`/`PlayerPicker`, `RadarMERCI`/`RubricList`.

---

## 4. Arquitectura técnica

*(síntesis del lente de ingeniería)*

**Visión:** mantener el **monorepo actual** (NestJS+Prisma / Next.js 14) en Railway y
crecer **por adición**. El `Throw −2..+2` es la unidad atómica compartida entre
casual, MERCI y torneos. Nuevo workspace `packages/shared/` (tipos, DTOs Zod,
feature-flags, diccionarios i18n de dominio).

**Contador offline-first = PWA (no nativo aún):** service worker + IndexedDB, **IDs
UUID generados en cliente** (sincronización *conflict-free* porque las PK ya son
uuid), **cola de mutaciones append-only** y `POST /sync` **idempotente** (upsert por
`id`). Los partidos son append-only → no hacen falta CRDTs. React Native/Expo se
evalúa en **Fase 4+** si hacen falta push fiables en iOS o presencia en stores; el
frontend se diseña con capa `api-client`/`stores` desacoplada para reutilizar lógica.

**Identidad y auth:** separar **`User`** (autentica, roles `PLAYER`/`COACH`/
`ORGANIZER`/`ADMIN`) de **`Player`** (entidad deportiva). Hacer `Player`
**persistente** (buscar-o-crear por `(clubId, name)` en vez de crear uno por partido,
como hace hoy `matches.service.ts:31-42`). **Auth.js (NextAuth v5)** con adaptador
Prisma —corre dentro del monorepo en Railway, sin coste por MAU ni segundo
proveedor— verificado en NestJS por `JwtStrategy`. Migración **aditiva y nullable** +
script de backfill que deduplica `Player` y re-apunta `MatchPlayer.playerId` (sin
downtime).

**Modelo de datos aditivo (Prisma):** `User`/`UserRole`/`Subscription`;
`Challenge`/`PlayerChallenge`/`Badge`/`PlayerBadge`/`PlayerStreak` (casual);
`Tournament`/`Team`/`TeamMember`/`Round`/`Pairing`/`Standing` (torneos). **Cada
`Pairing` apunta a un `Match`** → el marcador, las stats MERCI y el detalle de torneo
comparten una sola fuente de verdad. *(Esquemas Prisma completos en el apéndice A.)*

**Algoritmos clave:** emparejamiento **suizo** (ordenar por puntos+Buchholz, evitar
repetir rival, BYE al de menor puntuación), **mêlée** (Fisher-Yates con seed,
penalizar repetir compañero, trocear en equipos efímeros y emparejar por puntos),
**bracket** (potencia de 2, byes a los mejores seeds, enlazar `nextPairingId` hacia
la raíz; doble eliminación = winners→losers + gran final).

**Pagos:** **Stripe Checkout + Billing Portal + webhooks**; `tier` en `Subscription`
actualizado por webhook idempotente (por `event.id`). **Entitlements por
feature-flags** en un mapa central `tier → capabilities`, leído por un guard NestJS
(`@RequireEntitlement('merci')`) y un hook `useEntitlement()`. Roles gobiernan
*acceso*; tier gobierna *funciones*. Si algún día hay nativo: **RevenueCat** sobre
IAP + Stripe.

**i18n EN/ES/FR:** frontend con **`next-intl`** (`/[locale]/...`, detección por
`Accept-Language` + `User.locale`); **contenido de dominio traducible en BD** (los
textos de `Challenge`/`Badge`/`Drill` viven como campo `Json` con claves por idioma,
para que el coach añada retos sin desplegar); errores de API con `nestjs-i18n`.

**Módulos NestJS nuevos:** `auth`, `users`, `subscriptions`, `challenges`, `badges`,
`streaks`, `tournaments`, `rounds`, `pairings`, `teams`, `standings`, `sync`, más los
de MERCI (`players`, `levels`, `plans`, `sessions`, `drills`). Un `scoring`
compartido extrae `calculateMetrics` (`matches.service.ts:183`) para partido, torneo
y entrenamiento.

**Bracket estilo FIFA/Apple:** árbol modelado con `Pairing.nextPairingId`; el front
renderiza columnas por ronda, conectores SVG y `PairingCard` (dos equipos + marcador
del `Match` + ganador resaltado); click abre el detalle de partido existente.

### Roadmap técnico unificado (sin romper lo desplegado)

| Fase | Entregable |
|------|-----------|
| **0** | `User`/`Subscription`/roles + `Player` persistente + backfill; **guardar partido/torneo en histórico** (lo que hoy falta) |
| **1** | Auth.js + guards de entitlement + PWA offline del contador |
| **2** | Stripe + tier **Casual**: retos, insignias, rachas, stats + capa de psicología social (ranking, feed, share cards) |
| **3** | Torneos **mêlée y round-robin** (formatos sin árbol; reutilizan `Match`) |
| **4** | **Suizo + brackets** (simple/doble) + **vista FIFA** |
| **5** | Tier **Pro/MERCI** + analítica de club B2B |
| **6** | i18n FR completo + evaluación Expo |

**Riesgos técnicos:** sincronización offline (mitigada con append-only + upsert
idempotente); doble identidad `User↔Player` (relación 1-a-1 opcional); fiabilidad de
webhooks Stripe en Railway (idempotencia + reconciliación); complejidad del motor de
emparejamiento (encapsulado con tests por formato); backfill de `Player` (probar en
staging, dedupe conservador).

---

## 5. Próximas decisiones para el coach/clienta

1. **Definición oficial de MERCI** (del CIEP) para calcar las 5 dimensiones.
2. **¿Acuerdo/licencia con el CIEP** para usar el método y su sello? Es el foso.
3. **Nombre de marca** (casual) — decidir entre las candidatas.
4. **¿Lanzar solo FR+ES primero**, o los tres idiomas desde el día 1?
5. **Modelo del casual:** ¿suscripción pura, o freemium con publicidad no intrusiva?
6. **Alcance del MVP:** ¿confirmamos Fase 0-2 (identidad + histórico + contador +
   casual) como primer entregable?

---

## Apéndice A — Esquemas Prisma propuestos (torneos, casual, usuarios)

Ver el detalle en la sección de arquitectura; los modelos aditivos clave son
`User`, `UserRole`, `Subscription`, `Challenge`, `PlayerChallenge`, `Badge`,
`PlayerBadge`, `PlayerStreak`, `Tournament`, `Team`, `TeamMember`, `Round`,
`Pairing` y `Standing`. Todos con campos nullable sobre los modelos existentes
(`Match`/`Hand`/`Throw`/`Player`) para permitir migraciones no destructivas.

## Fuentes de psicología social / conductual

- Teoría de la comparación social (Festinger) y estatus relativo.
- Self-Determination Theory (autonomía/competencia/relación) — ver
  `docs/modulo-seguimiento-jugador.md`, §3.
- Modelo Hook (Nir Eyal): disparador–acción–recompensa variable–inversión.
- Aversión a la pérdida (Kahneman & Tversky).
- Modelo de comportamiento B=MAP (BJ Fogg).
- Prueba social e influencia (Cialdini).
</content>
