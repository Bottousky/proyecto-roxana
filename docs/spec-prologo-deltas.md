# Spec consolidada — deltas del prólogo

**Versión:** 0.1 — borrador para aprobación del Director
**Base:** `docs/prologo.md` §28.4 + slice actual (`src/game/rooms.ts` líneas 840–1093, `src/ui/bitacora.ts`, `src/state.ts`)
**Estándar de ejecución:** `docs/estandar-implementacion.md` (Fable arquitecto / Codex o Sonnet ejecutor / un hito por sesión)
**Idioma:** español neutro latinoamericano (tuteo).

---

## 0. Alcance y contraste con el slice actual

El slice implementado hoy es una versión comprimida del prólogo: hall → preceptor → despacho (retrato + Bitácora) → aula. La Bitácora es un **lector append-only de entradas pedagógicas** (`src/content/entries.ts`) y no tiene pestañas; el preceptor nunca reacciona al objeto; no hay cinemática; no hay estudiantes; las interacciones ambientales son mínimas.

Esta spec describe los deltas que llevan el slice al guion canónico (`docs/prologo.md` §1–§22), preservando la **regla pedagógica inviolable**: la Bitácora ordena la experiencia escolar e institucional, pero **no anticipa conocimiento conceptual** (eso lo siguen rigiendo las entradas existentes, que se desbloquean por flags de comprensión).

**Reglas de scope:**
- Nada de lo nuevo puede romper el flujo U1 → U5 que ya pasa los tests (`tests/m*.test.ts`, `f*.test.ts`, `t*.test.ts`, `l*.test.ts`).
- Las entradas pedagógicas de `src/content/entries.ts` se mantienen tal cual; el menú nuevo de la Bitácora las consume como una pestaña más (Registro), no las reemplaza.
- El "Instituto Roxana" del slice y la "Escuela Roxana" del guion son el mismo espacio. Para el prólogo canon usamos **Escuela Roxana** en pantalla; los nombres internos de rooms (`hall`, `despacho`, `aula`) se mantienen para no romper saves antiguos.

---

## 1. Inventario de flags nuevas

Todas las flags persisten en el save (`state.flags`, `KEY = 'roxana-slice-v1'`) salvo donde se aclare lo contrario. Se agregan a `Flags` y `DEFAULT_FLAGS` en `src/state.ts`. Convención: booleanas (`seenIntro`), salvo `cursoAsignado` que es un enum.

| Flag | Tipo | Se setea en | Se lee en | Persistencia |
|---|---|---|---|---|
| `seenIntro` | `boolean` | Al final de la cinemática (`src/game/IntroCinematic.ts` nuevo) o al saltarla | `main.ts` (decide si reproducir la cinemática antes de `startGame()`) | save |
| `bitacoraOpened` | `boolean` | Primera vez que `openBitacora()` muestra el menú diegético (`src/ui/bitacora.ts`) | `rooms.ts → hall.onEnter` (gatilla la reacción del preceptor) y `preceptor.onInteract` | save |
| `preceptorReprise` | `boolean` | Al cerrar el diálogo de la 2ª conversación con el preceptor (rooms.ts, `pickupBitacora` flow) | Gate del taller; condicional del prompt del preceptor | save |
| `cursoAsignado` | `'ninguno' \| 'electronica'` | Al cerrar el diálogo del preceptor que asigna el Taller | Bitácora-menú (pestaña Cursos), gate de la puerta del Taller | save |
| `salasVisitadas` | `string[]` (Set serializado) | `ExplorationScene.loadRoom()` cuando entra a una room marcada como "visitable del prólogo" | Bitácora-menú (pestaña Mapa escolar) | save |
| `bitacoraTab` | `'cursos' \| 'objetivos' \| 'mapa' \| 'archivo' \| 'registro'` | UI de Bitácora al cambiar de pestaña | UI (recuerda última pestaña en la sesión) | **volátil** (no se guarda) |
| `objetivoActual` | `string` (id de objetivo) | `setObjetivo()` (nuevo helper de `src/content/objetivos.ts`) | Bitácora-menú (pestaña Objetivos), HUD opcional | save |
| `objetivosHistorial` | `string[]` (ids) | `setObjetivo()` los va apilando | Bitácora-menú (pestaña Objetivos, sección "anteriores") | save |
| `cinematicaSkipped` | `boolean` | Al apretar skip en la cinemática | Telemetría / debug (no afecta gameplay) | save (opcional) |
| `vioMapaDespacho` | `boolean` | Interacción con el mapa antiguo del despacho (§14.3) | Condición de habilitación del cajón de la Bitácora (junto con `vioRetrato` o `vioNotaVieja`) | save |
| `vioNotaVieja` | `boolean` | Interacción con la nota vieja del despacho (§14.5) | Idem `vioMapaDespacho` | save |
| `estudiantesHablados` | `string[]` (ids) | Al cerrar el diálogo de cada estudiante del Hall | Evita re-disparo del diálogo principal | save |

**Notas:**
- `talkedPreceptor` y `hasBitacora` ya existen y se reutilizan.
- `introSeen` del state actual NO es lo mismo que `seenIntro`: hoy `introSeen` marca el monólogo de entrada al Hall (líneas 926–936 de `rooms.ts`). Se renombra mentalmente al "onEnter del hall"; la cinemática usa `seenIntro` nuevo. Para evitar confusión, el hito H1 documenta esta distinción en un comentario sobre la declaración.
- `cursoAsignado` arranca en `'ninguno'`. El prólogo solo transita a `'electronica'`; otras unidades no lo tocan.
- `salasVisitadas` y `objetivosHistorial` son arrays porque el orden importa para mostrarlos.
- La regla del estándar (`docs/estandar-implementacion.md` §5) dice "sin dependencias nuevas": nada de `immer`, `zustand`, etc. El Set/array se serializa a mano.

---

## 2. Contrato de la Bitácora-menú

La Bitácora pasa a ser un **menú diegético** con 5 pestañas: **Cursos, Objetivos, Mapa escolar, Archivo bloqueado, Registro**. Las 4 primeras son nuevas; **Registro es la vista actual de entradas pedagógicas** (la que vive hoy en `src/ui/bitacora.ts`), renombrada y movida adentro de una pestaña.

### 2.1 Tipo raíz que consume la UI

```ts
// src/content/bitacora-data.ts (nuevo)

export interface BitacoraData {
  cursos: CursoView[];
  objetivos: ObjetivosView;
  mapa: MapaView;
  archivo: ArchivoView;
  registro: EntryView[]; // ya existe, se reusa de content/entries.ts
}

export function getBitacoraData(): BitacoraData;
```

`getBitacoraData()` se calcula on-demand a partir de `state.flags` (mismo patrón que `getEntries()`). No hay store reactivo: la UI llama a la función cada vez que se abre la Bitácora o se cambia de pestaña.

### 2.2 Pestaña Cursos

```ts
export interface CursoView {
  id: 'matematica' | 'fisica' | 'electronica' | 'programacion';
  nombre: string;          // 'Matemática' | 'Física' | 'Electrónica' | 'Programación'
  estado: CursoEstado;
  mundo: string | null;    // nombre del mundo asociado o null si no se reveló
  notaCorta: string;       // 1 línea descriptiva diegética
}

export type CursoEstado =
  | 'sin-asignar'   // estado por defecto en el prólogo
  | 'asignado'      // preceptor te mandó al Taller
  | 'en-curso'      // hay progreso en la unidad
  | 'completado';   // unidad cerrada
```

**Estado vacío (apenas se obtiene la Bitácora, antes de la 2ª conversación con el preceptor):** los 4 cursos aparecen con `estado: 'sin-asignar'` y `mundo: null`. Visualmente: lista con check vacíos, nota "Sin asignar".

**Estado lleno (post `preceptorReprise`):**
- Electrónica → `estado: 'asignado'`, `mundo: null` todavía (Ohmdal se revela dentro del aula, §22.2). Nota corta: "Primer bloque. Ir al Taller."
- Resto → `'sin-asignar'`.

**Eventos que actualizan:**
- `setFlag('hasBitacora')` → crea los 4 registros.
- Diálogo del preceptor que asigna el Taller → set `cursoAsignado = 'electronica'`.
- Apertura de cualquier portal/aula de mundo (existente en U2–U5) → `'en-curso'` y completa `mundo`. *(Fuera de scope del prólogo pero el contrato lo soporta.)*

**Regla pedagógica:** la pestaña Cursos solo muestra **datos administrativos** (nombre del curso, si fue asignado, qué mundo está activo). **Nunca** muestra el listado de conceptos del curso. Para eso está Registro.

### 2.3 Pestaña Objetivos

```ts
export interface ObjetivosView {
  actual: Objetivo | null;
  anteriores: Objetivo[];   // del más reciente al más viejo
}

export interface Objetivo {
  id: string;
  texto: string;            // textual del guion
  cumplido: boolean;
}
```

**Estado inicial (al obtener la Bitácora):** `actual` = el objetivo que arrastra el preceptor ("Si alguien te contesta, avísame") — pero traducido a un objetivo accionable: **"Volver con el preceptor."** (texto exacto de §16.1).
`anteriores` = `[{ texto: 'Busca a alguien de la escuela.' }, { texto: 'Ir a Dirección.' }, { texto: 'Revisa el despacho.' }]`, todos `cumplido: true`.

**Estado lleno:** el `actual` se actualiza con `setObjetivo(id, texto)`; el anterior se mueve a `anteriores`.

**Eventos:**
- `onEnter hall` (primera vez): `setObjetivo('hall', 'Busca a alguien de la escuela.')`.
- Cierre del 1er diálogo con el preceptor: `setObjetivo('direccion', 'Ir a Dirección.')`.
- Entrar al despacho: `setObjetivo('despacho', 'Revisa el despacho.')`.
- Recoger la Bitácora: `setObjetivo('volver-preceptor', 'Volver con el preceptor.')`.
- Diálogo del preceptor que asigna el Taller: `setObjetivo('ir-taller', 'Ir al Taller de Electrónica.')`.
- Entrar al Taller: `setObjetivo('entrar-taller', 'Entrar al taller.')` y al avanzar se marca cumplido todo el bloque del prólogo.

**Regla pedagógica:** objetivos son **diegéticos y vividos**, jamás conceptuales ("entender la ley de Ohm" NO va aquí, va en Registro como `formal` cuando se desbloquea).

### 2.4 Pestaña Mapa escolar

```ts
export interface MapaView {
  detectadas: SalaView[];      // rooms visitadas o conocidas administrativamente
  bloqueadas: SalaView[];      // rooms mencionadas en cartelería pero no accesibles
}

export interface SalaView {
  id: string;                  // mismo id de ROOMS
  nombre: string;              // 'Hall', 'Dirección', 'Taller de Electrónica', etc.
  visitada: boolean;
  nota?: string;               // 'sin docente', 'puerta cerrada', etc.
}
```

**Estado inicial (apenas se obtiene la Bitácora):**

`detectadas`:
- `{ id: 'hall', nombre: 'Hall', visitada: true }`
- `{ id: 'preceptoria', nombre: 'Preceptoría', visitada: true, nota: 'mismo ambiente que el Hall' }` (la Preceptoría es el escritorio del preceptor dentro del Hall, no una room separada; se lista aparte por fidelidad al guion §17.1)
- `{ id: 'despacho', nombre: 'Dirección', visitada: true, nota: 'sin respuesta' }`
- `{ id: 'aula', nombre: 'Taller de Electrónica', visitada: false }`

`bloqueadas`:
- `{ id: 'biblioteca', nombre: 'Biblioteca', visitada: false }`
- `{ id: 'laboratorio-fisica', nombre: 'Laboratorio de Física', visitada: false, nota: 'no ingresar sin docente' }`
- `{ id: 'aula-matematica', nombre: 'Aula de Matemática', visitada: false, nota: 'puerta cerrada' }`
- `{ id: 'sala-programacion', nombre: 'Sala de Programación', visitada: false }`

Estas rooms "bloqueadas" **no existen como `RoomDef`**; son entradas literarias en el mapa, derivadas de las puertas/carteles del Hall (§9.6–§9.9). Codex no debe crear `ROOMS['biblioteca']`.

**Render:** lista simple (no grid), con icono o tipografía distintos para detectadas vs bloqueadas. Las visitadas en negrita, las no visitadas en gris.

**Eventos:**
- `ExplorationScene.loadRoom(id)` chequea si `id` está en la whitelist del prólogo (`['hall','despacho','aula']`) y lo agrega a `salasVisitadas`.

**Regla pedagógica:** el mapa **describe la escuela**, no su contenido conceptual. Las notas son administrativas o ambientales, no resúmenes de unidad.

### 2.5 Pestaña Archivo bloqueado

```ts
export interface ArchivoView {
  bloqueado: true;             // siempre true en el prólogo
  placeholders: string[];      // frases enigmáticas que se ven al intentar abrir
}
```

**Estado inicial y lleno (en el prólogo, ambos iguales):**

```
placeholders: [
  'Archivo no disponible.',
  'Se requiere restaurar acceso.',
  'Última entrada legible: « …el mapa no era de la escuela. Era de afuera. »',
  'Última firma: R.',
]
```

**Eventos:** ninguno en el prólogo. Queda como gancho de unidades futuras (que desbloquearían `bloqueado: false` y agregarían entradas).

**Regla pedagógica:** los placeholders son **misterio diegético**, no spoilers conceptuales. La frase "el mapa no era de la escuela. Era de afuera" evoca Mundos Aplicados sin nombrarlos como mecánica.

### 2.6 Pestaña Registro (existente)

Mantiene el comportamiento actual: lista de `EntryView` desbloqueadas por flags de comprensión. La diferencia es que ahora vive como una pestaña más, no como vista única. La primera entrada del prólogo (`hall`, ya existente en `entries.ts`) sigue siendo la que se desbloquea con `hasBitacora`.

### 2.7 Notas de implementación de UI

- La cabecera de pestañas reemplaza al actual `bita-index` con botones por entrada. La columna izquierda pasa a ser **un selector de pestaña** + (cuando la pestaña tiene sub-items, como Registro) una sub-lista.
- La función `wasBitacoraEntryOpened(entryId)` se mantiene para el Registro.
- Hotkeys: `Esc` cierra; `B` abre/cierra; los números `1–5` cambian de pestaña (opcional, ayuda en testing).
- Persistir la pestaña actual entre cierres dentro de la misma sesión (`bitacoraTab` volátil).

---

## 3. Datos iniciales de cursos

Único lugar canónico — `src/content/cursos.ts` (nuevo):

```ts
export interface CursoSeed {
  id: 'matematica' | 'fisica' | 'electronica' | 'programacion';
  nombre: string;
  notaInicial: string;     // se ve mientras está 'sin-asignar'
  notaAsignado: string;    // se ve cuando el preceptor lo asigna
  mundoAsociado: string | null;  // null en el prólogo
}

export const CURSOS_SEED: CursoSeed[] = [
  {
    id: 'matematica',
    nombre: 'Matemática',
    notaInicial: 'Sin asignar.',
    notaAsignado: 'Pendiente.',
    mundoAsociado: null,
  },
  {
    id: 'fisica',
    nombre: 'Física',
    notaInicial: 'Sin asignar.',
    notaAsignado: 'Pendiente.',
    mundoAsociado: null,
  },
  {
    id: 'electronica',
    nombre: 'Electrónica',
    notaInicial: 'Sin asignar.',
    notaAsignado: 'Primer bloque. Ir al Taller.',
    mundoAsociado: null,  // Ohmdal se revela DENTRO del taller, no acá
  },
  {
    id: 'programacion',
    nombre: 'Programación',
    notaInicial: 'Sin asignar.',
    notaAsignado: 'Pendiente.',
    mundoAsociado: null,
  },
];
```

**Transición a "asignado":**

```ts
// dentro del flow del preceptor (rooms.ts)
function asignarTallerElectronica(): void {
  state.flags.cursoAsignado = 'electronica';
  save();
  // gate de la puerta cambia: f().cursoAsignado === 'electronica'
}
```

La puerta del Taller del Hall pasa a usar `f().cursoAsignado === 'electronica'` en lugar de `f().hasBitacora` como gate (línea 858–865 de `rooms.ts`).

**Regla:** ningún otro evento del prólogo cambia el estado de Matemática/Física/Programación.

---

## 4. Mapa de salas visitadas

### 4.1 Tracking

- `salasVisitadas: string[]` en `state.flags`.
- `ExplorationScene.loadRoom()` ya recibe el `id` de la room. Se agrega al inicio:

```ts
if (PROLOGO_ROOMS_VISITABLES.has(id) && !state.flags.salasVisitadas.includes(id)) {
  state.flags.salasVisitadas.push(id);
  save();
}
```

donde `PROLOGO_ROOMS_VISITABLES = new Set(['hall', 'despacho', 'aula'])`.

- Para unidades posteriores, el set se puede ampliar; por ahora solo importan las 3 rooms del prólogo. Las rooms de Ohmdal (`plaza`, `puerta`, etc.) NO se trackean en el mapa escolar (son mundos, no salas).

### 4.2 Render en la pestaña Mapa

- Lista simple (`<ul>` con dos secciones: "Salas detectadas" y "Bloqueadas").
- Cada item: nombre + (si `visitada === false`) etiqueta gris "pendiente"; (si tiene `nota`) la nota entre paréntesis.
- No hay grid ni esquema espacial — el guion §17.1 lo describe como "zonas detectadas / zonas bloqueadas", sin layout 2D.
- En el prólogo todas las visitadas "detectadas" son tres (Hall, Dirección, Taller). El resto va en bloqueadas. La Preceptoría aparece como detectada con nota "mismo ambiente que el Hall" para honrar el guion sin crear una room nueva.

### 4.3 Whitelist canónica del prólogo

| id (interno) | Nombre en mapa | Categoría inicial |
|---|---|---|
| `hall` | Hall | detectada, visitada |
| `preceptoria` (literario) | Preceptoría | detectada, visitada (auto) |
| `despacho` | Dirección | detectada, visitada al entrar |
| `aula` | Taller de Electrónica | detectada, visitada al entrar |
| `biblioteca` (literario) | Biblioteca | bloqueada |
| `laboratorio-fisica` (literario) | Laboratorio de Física | bloqueada |
| `aula-matematica` (literario) | Aula de Matemática | bloqueada |
| `sala-programacion` (literario) | Sala de Programación | bloqueada |

"Literario" = no existe como `RoomDef`, solo como entrada en el mapa de la Bitácora.

---

## 5. Payload del evento "preceptor-reacciona-a-bitácora"

### 5.1 Disparo

Al volver al Hall **después de** haber abierto la Bitácora-menú al menos una vez:

```ts
hall.onEnter = () => {
  if (state.flags.hasBitacora
      && state.flags.bitacoraOpened
      && !state.flags.preceptorReprise) {
    // mover al preceptor hacia el jugador (visual leve) o solo gatillar el diálogo
    dispararDialogoPreceptorReprise();
  }
  // ... resto del onEnter existente
};
```

Importante: la flag de disparo es `bitacoraOpened`, **no** `hasBitacora`. El jugador puede recoger la Bitácora y volver sin haberla abierto; el guion §19 requiere que la haya visto al menos como menú para que el preceptor reaccione. Si el flujo del despacho la abre automáticamente (caso `pickupBitacora()` actual usa `notifyNewEntry` pero NO abre el menú), se considera abierta solo cuando el jugador pulsa el botón.

**Alternativa de diseño abierta:** abrir el menú diegético **automáticamente** apenas se obtiene la Bitácora (parecido a `openBitacora('ley-de-ohm')` en `resolverPuerta`). Esto garantiza el disparo. Ver §7, riesgo R3.

### 5.2 Payload

```ts
interface PreceptorReprisePayload {
  trigger: 'volver-hall-con-bitacora-abierta';
  // Líneas textuales del guion §19.1 + §19.2 (transcripción literal en rooms.ts)
  lineas: Line[];
  // Efectos al cerrar el diálogo:
  efectos: {
    setFlags: ['preceptorReprise'];
    setEnum: { cursoAsignado: 'electronica' };
    setObjetivo: { id: 'ir-taller', texto: 'Ir al Taller de Electrónica.' };
    notifyNewEntry?: string; // opcional: una entrada nueva del Registro
  };
}
```

### 5.3 Diálogo (textual, del guion §19)

```
Preceptor: ¿Y?
Jugador (interno): No había nadie.
Preceptor: Bien. Digo… normal.
Preceptor: ¿Qué tienes ahí?
Jugador: Un libro. Estaba en Dirección.
Preceptor: ¿En Dirección?
Jugador: Sí.
Preceptor: ¿En el escritorio?
Jugador: En un cajón.
Preceptor: Ah.
Jugador: ¿Pasa algo?
Preceptor: No. Bueno, sí. Pero no hoy.

[pausa]

Preceptor: A ver… si la Bitácora te registró, entonces ya no tengo que anotarte a mano.
Jugador: ¿Cómo que me registró?
Preceptor: Cosas viejas de la escuela. Tu primer bloque es Taller de Electrónica.
Jugador: ¿Ahora?
Preceptor: Ahora. Y llévate eso.

[el preceptor mira la Bitácora]

Preceptor: Si te pregunta algo… no le respondas cualquier cosa.
```

**Regla del estándar (§5):** este texto es canon. Codex lo copia textual desde el guion (o desde esta spec). Si falta una línea: `// TODO(guion)` + placeholder, jamás inventar.

### 5.4 Cambios de mundo al cerrar el diálogo

1. `setFlag('preceptorReprise')`.
2. `state.flags.cursoAsignado = 'electronica'` + `save()`.
3. La puerta del Hall hacia `aula` (líneas 854–865 de rooms.ts) deja de estar trabada porque su `locked` ahora consulta `cursoAsignado`.
4. `setObjetivo('ir-taller', 'Ir al Taller de Electrónica.')`.
5. `notifyNewEntry` opcional con título "Si la escuela te responde…" (entrada del Registro a redactar por Fable, post-aprobación).
6. `hooks.refresh()` para que el visual del Hall reaccione (puerta del Taller pasa a verse abierta).

### 5.5 Estado antes del disparo

Si el jugador vuelve al Hall **sin** haber abierto la Bitácora-menú: el preceptor mantiene su línea actual "¿Eso es… una Bitácora? Hacía años…", pero **no asigna el curso** ni abre la puerta. La línea se vuelve hint: "Abrila. Algo escribió tu nombre." *(propuesta — confirmar con el Director.)*

---

## 6. Breakdown de hitos

8 hitos. Cada uno es una sesión Codex/Sonnet en background. Numeración H1–H8 (no choca con M*/F*/T*/L* existentes).

### H1 — Flags y tipos base
- **Archivos:** `src/state.ts`.
- **Cambios:** agregar `seenIntro`, `bitacoraOpened`, `preceptorReprise`, `cursoAsignado` (enum string), `salasVisitadas` (string[]), `objetivoActual` (string), `objetivosHistorial` (string[]), `vioMapaDespacho`, `vioNotaVieja`, `estudiantesHablados` (string[]). Defaults y migración del save (mergear con `DEFAULT_FLAGS`, los arrays vacíos no rompen saves viejos porque ya existe el spread `{...DEFAULT_FLAGS, ...data.flags}`).
- **Tests nuevos:** `tests/p1-flags-prologo.test.ts` — verifica que los defaults existen y son de los tipos correctos, y que cargar un save viejo no rompe.
- **Criterio:** `npm run build` pasa; todos los tests existentes siguen pasando; nuevo test pasa.
- **Dependencias:** ninguna.
- **Ejecutor sugerido:** Haiku/Codex (mecánico).

### H2 — Helpers de objetivo y mapa
- **Archivos nuevos:** `src/content/objetivos.ts`, `src/content/cursos.ts`, `src/content/bitacora-data.ts`.
- **Cambios:** declarar `setObjetivo(id, texto)`, `getObjetivos()`, `CURSOS_SEED`, `getBitacoraData()`. `bitacora-data.ts` agrega ramas para "sin Bitácora aún" (devuelve `null` o arroja, definir) — vivirá con `hasBitacora === false` solo si se decide pre-abrir, ver R3.
- **Tests:** `tests/p2-bitacora-data.test.ts` verifica que `getBitacoraData()` con flags iniciales devuelve los 4 cursos `sin-asignar`, el objetivo actual correcto, el mapa con 3 detectadas / 4 bloqueadas, y el archivo con sus 4 placeholders.
- **Criterio:** test pasa; sin tocar `rooms.ts` aún.
- **Dependencias:** H1.
- **Ejecutor sugerido:** Sonnet/Codex (estándar).

### H3 — Bitácora como menú con pestañas
- **Archivos:** `src/ui/bitacora.ts`, `src/styles.css`, `index.html` (sólo si hace falta agregar un slot — probablemente no).
- **Cambios:** refactor de `openBitacora()` para renderizar 5 pestañas (Cursos, Objetivos, Mapa, Archivo, Registro). El selector de pestaña reemplaza al `bita-index` actual; dentro de cada pestaña se renderiza el contenido. La pestaña Registro contiene la UI actual de entradas. Setear `state.flags.bitacoraOpened = true` la primera vez que el menú se abre como menú (no como entrada específica). Soportar `openBitacora(entryId)` (uso existente desde `resolverPuerta`) abriendo directo en la pestaña Registro con esa entrada.
- **Tests:** `tests/p3-bitacora-menu.test.ts` — grep textual de los headers de pestaña; verifica que la función expone `setBitacoraTab(tab)` (testeable) y que el render no tira excepciones con flags iniciales.
- **Criterio:** todos los `m*.test.ts` siguen pasando (abrir desde `resolverPuerta` no se rompe); UI manual en preview muestra las 5 pestañas.
- **Dependencias:** H2.
- **Ejecutor sugerido:** Sonnet (delicado — toca módulo compartido y crea patrón nuevo de pestañas).

### H4 — Tracking de salas y objetivos automáticos
- **Archivos:** `src/game/ExplorationScene.ts`, `src/game/rooms.ts` (mínimo, solo onEnter de hall/despacho/aula para `setObjetivo`).
- **Cambios:** en `loadRoom()`, agregar el chequeo de `PROLOGO_ROOMS_VISITABLES`. En `hall.onEnter` (1ª vez), set objetivo "Busca a alguien de la escuela.". En el cierre del 1er diálogo del preceptor (donde ya setea `talkedPreceptor`), agregar `setObjetivo('direccion', 'Ir a Dirección.')`. En `despacho.onEnter` set objetivo "Revisa el despacho.". En `pickupBitacora()` (post-flag `hasBitacora`), set objetivo "Volver con el preceptor.".
- **Tests:** `tests/p4-objetivos-flow.test.ts` — simula la cadena de set y verifica que `objetivosHistorial` queda en el orden correcto.
- **Criterio:** tests existentes pasan; nuevo test pasa.
- **Dependencias:** H1, H2 (no necesita H3 para correr, pero la UI sin H3 no muestra los objetivos).
- **Ejecutor sugerido:** Codex (estándar).

### H5 — Reacción del preceptor a la Bitácora abierta + asignación de curso
- **Archivos:** `src/game/rooms.ts`.
- **Cambios:** modificar `hall.onEnter` para disparar `dispararDialogoPreceptorReprise()` cuando `hasBitacora && bitacoraOpened && !preceptorReprise`. Implementar la función con las líneas textuales de §19. Al cerrar: `preceptorReprise = true`, `cursoAsignado = 'electronica'`, `setObjetivo('ir-taller', ...)`, `hooks.refresh()`. Reescribir el `locked()` de la puerta del Taller (líneas 858–865) para usar `f().cursoAsignado === 'electronica'` en lugar de `f().hasBitacora`. Cuidar el caso `hasBitacora && !bitacoraOpened`: línea hint nueva.
- **Tests:** `tests/p5-preceptor-reprise.test.ts` — grep textual de las líneas clave del diálogo (al menos 3 frases identificables: "Si la Bitácora te registró…", "Tu primer bloque es Taller de Electrónica.", "Si te pregunta algo… no le respondas cualquier cosa.") y de la condición `cursoAsignado === 'electronica'`.
- **Criterio:** tests pasan; en preview, el flujo Hall → Despacho → Bitácora abierta → Hall dispara el diálogo y abre la puerta.
- **Dependencias:** H1, H3, H4.
- **Ejecutor sugerido:** Sonnet (delicado — toca rooms.ts, módulo central).

### H6 — Cinemática introductoria con skip
- **Archivos nuevos:** `src/game/IntroCinematic.ts`, `src/content/intro-textos.ts`, `assets/cinematic/INTRO_01.png` (ya generada como `INTRO_01_asignacion.png`), `INTRO_02.png`, `INTRO_03.png`, `INTRO_04.png`. `src/main.ts` (decide cuándo lanzar la cinemática).
- **Cambios:** flujo nuevo: tras click en "Empezar de nuevo", si `!seenIntro`, renderizar la cinemática (overlay DOM full-screen con imagen + texto + botón Saltar). Avance: click/tap/Enter/Space. Skip: tecla `Esc` o botón. Al terminar (o al saltar): set `seenIntro = true`, ocultar overlay, iniciar `startGame()`. Para "Continuar" (save existente), no reproducir cinemática.
- **Tests:** `tests/p6-intro-cinematica.test.ts` — grep textual de las 4 frases iniciales de cada imagen (§5.1–§5.4) en `intro-textos.ts`; verifica export de `playIntro(onDone, onSkip)`.
- **Criterio:** test pasa; en preview, "Empezar de nuevo" reproduce las 4 imágenes con texto y permite skip.
- **Dependencias:** H1.
- **Ejecutor sugerido:** Sonnet (delicado — UI nueva, integración con `main.ts`).

### H7 — Interacciones ambientales nuevas del Hall y el despacho
- **Archivos:** `src/game/rooms.ts`.
- **Cambios:** agregar `ThingDef`s al `hall`: entrada principal (§9.1), cartelera de ingresantes (§9.2), banco del Hall (§9.3), estatua de Roxana (§9.4), vitrina antigua (§9.5 — ya existe `vitrina` pero el texto canónico es distinto, decisión: extender el `onInteract` o reescribirlo según el guion), puertas de Matemática/Física/Programación (§9.7–§9.9) como things no caminables con diálogo de cartel. Agregar al `despacho`: sillón vacío (§14.2), mapa antiguo (§14.3, set `vioMapaDespacho`), foto antigua (§14.4), nota vieja (§14.5, set `vioNotaVieja`), vitrina de Mundos Aplicados (§14.6). Cambiar la condición de habilitación del cajón de la Bitácora a "al menos 2 de {vioRetrato, vioMapaDespacho, vioNotaVieja}" (§15.1).
- **Tests:** `tests/p7-ambiente-prologo.test.ts` — grep textual de frases clave de cada nueva interacción (al menos 1 frase identificable por thing) y de la nueva condición del cajón.
- **Criterio:** tests pasan; en preview, las nuevas interacciones funcionan y el cajón se habilita correctamente.
- **Dependencias:** H1.
- **Ejecutor sugerido:** Codex (estándar — patrón existente de `ThingDef`).

### H8 — Estudiantes opcionales en el Hall
- **Archivos:** `src/game/rooms.ts`, posible `src/content/estudiantes.ts` para el texto.
- **Cambios:** agregar 2 estudiantes al `hall.things` con `visible: () => f().hasBitacora && !f().preceptorReprise || f().preceptorReprise` (visibles a partir de tener la Bitácora; uno opcional aparece SOLO post-reprise rumbo al Taller). Diálogos textuales del guion §20.1, §20.2, §20.3 (curioso, incómodo, burlón). Nunca bloquean el paso (`solid: false`). Trackear `estudiantesHablados`.
- **Tests:** `tests/p8-estudiantes-hall.test.ts` — grep textual de líneas clave de los 3 estudiantes (aunque solo aparezcan 2 simultáneamente, el código debe contener los 3 diálogos para que el guion sea cazable).
- **Criterio:** tests pasan; en preview, los estudiantes aparecen y son opcionales.
- **Dependencias:** H1, H5 (la condición de visibilidad depende de `preceptorReprise`).
- **Ejecutor sugerido:** Codex (estándar).

### Orden recomendado de ejecución

```
H1 → H2 → H3 → H4 → H5 → H6 (paralelizable con H7/H8 si H5 ya cerró) → H7 → H8
```

Reglas duras: H3 no se ejecuta sin H2; H5 no se ejecuta sin H3 (necesita `bitacoraOpened` real); H8 no se ejecuta sin H5 (depende de `preceptorReprise`).

---

## 7. Riesgos y decisiones abiertas

**R1 — "Instituto Roxana" vs "Escuela Roxana".**
El slice usa "Instituto Roxana" en HUD y mensajes (rooms.ts línea 845, entries.ts línea 25, etc.). El guion canónico dice "Escuela Roxana / Escuela Técnica Roxana". Propuesta: cambiar pantalla a "Escuela Roxana" en el prólogo y reformular los lugares donde dice "Instituto". Esto **toca texto canónico vivo**; no avanzo sin el OK del Director.

**R2 — Apertura automática de la Bitácora al recogerla.**
El guion §16 muestra la Bitácora abriéndose sola ("Registro inicial creado… Vuelve a Preceptoría"). Eso satisface `bitacoraOpened` sin obligar al jugador a apretar B. Propuesta: en `pickupBitacora()`, después del flag, llamar `openBitacora()` directamente (no `openBitacora(entryId)`, que abre Registro; sí el menú diegético en pestaña Objetivos o Cursos). Decisión abierta: ¿abrir solo o esperar al jugador? Si esperamos, hay un dead-end posible si nunca aprieta B.

**R3 — Visibilidad de la Bitácora-menú antes de obtenerla.**
Hoy el botón `#bitacora-btn` aparece con `showBitacoraButton()` post-flag. Confirmar: la Bitácora-menú **nunca** se ve hasta tenerla físicamente. `getBitacoraData()` no debe llamarse si `!hasBitacora`. OK pero documentarlo.

**R4 — Assets de la cinemática.**
Calibración INTRO_01 ya hecha (jun 2026): `assets/cinematic/INTRO_01_asignacion.png`, 1536×1024, generada con built-in `image_gen` desde Codex+skill imagegen. Resultado utilizable; ajustar prompt para INTRO_02–04 sumando: luz dorada más marcada, espacio negativo más limpio, mochila inequívocamente nueva.

**R5 — Cuántos estudiantes simultáneos en el Hall.**
El guion (§20 + §28.1) dice "2-3 estudiantes, opcionales, máximo uno entre Hall y Electrónica". Propuesta: 2 estudiantes pre-reprise (curioso + incómodo, ambos visibles), 1 estudiante post-reprise (burlón, "rumbo al Taller"). ¿Está bien la asignación? ¿O preferís 1 pre + 1 post para que sea menos denso?

**R6 — Pestaña Mapa: lista vs esquema visual.**
Propuesta actual: lista simple. El guion no exige más, pero un mini-esquema (cajas con líneas) podría ser un upgrade visual. ¿Lo dejamos como lista en este pase y queda como mejora futura, o el Director quiere esquema desde el primer corte?

---

Pendiente de aprobación del usuario antes de pasar a Codex.
