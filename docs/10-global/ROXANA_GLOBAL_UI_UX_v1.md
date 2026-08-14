---
status: PROPOSED
authority_level: 2
version: v1
last_ratified: 2026-08-14
supersedes: []
depends_on:
  - docs/00-governance/ROXANA_GAME_DESIGN_PILLARS_v1.md (P01, P02, P05, P08, P09, P11, P12, P15)
  - docs/00-governance/ROXANA_DESIGN_LANGUAGE_v1.md (DL §3 tutorialización; §4 dificultad; §5 forma de la formalización; §6 voz y tono del feedback)
  - docs/00-governance/ROXANA_CANON_POLICY_v1.md
  - docs/00-governance/ROXANA_DOCUMENT_ARCHITECTURE_v1.md
  - docs/00-governance/ROXANA_DESIGN_REVIEW_CHECKLIST_v1.md
  - docs/10-global/ROXANA_INSTITUTE_BIBLE_v1.md
  - docs/10-global/ROXANA_BITACORA_SYSTEM_v1.md
  - docs/10-global/ROXANA_METAPROGRESSION_v1.md
  - docs/10-global/ROXANA_GLOBAL_NARRATIVE_v1.md
  - docs/10-global/ROXANA_PLAYER_PROFILE_v1.md
  - docs/20-worlds/ohmdal/vision/ohmdal-vision_v1.md
  - docs/20-worlds/physica/vision/physica-vision_v1.md
  - docs/20-worlds/bitland/vision/bitland-vision_v1.md
  - docs/20-worlds/arithmos/vision/arithmos-vision_v1.md
open_questions:
  - UX-Q1 — si la UI común vive en `src/ui/` (Phaser overlays) o en una capa de DOM independiente del motor
  - UX-Q2 — si los marcadores visuales de los seis estados de Bitácora (P06) son íconos únicos o una escala tipográfica
  - UX-Q3 — cómo se renderiza la Red conceptual: como grafo interactivo, como índice navegable, o como lista filtrable
  - UX-Q4 — qué grado de personalización de tamaño/tema está obligado por accesibilidad mínima
  - UX-Q5 — si el "lenguaje de objetivos" admite objetivos múltiples simultáneos o un único objetivo activo
  - UX-Q6 — si el "retorno al Instituto" tiene animación dedicada o se delega a la cámara del hub
  - UX-Q7 — qué pasa con la UI durante un desafío interdisciplinario: ¿se muestra la UI de los dos mundos o una UI "de cruce"?

---

# ROXANA — GLOBAL UI/UX · v1

Documento de autoridad nivel 2. Biblia global. Define la
**capa común de UI/UX** del proyecto: navegación,
lenguaje de objetivos, feedback de descubrimiento,
accesibilidad, perfil, retorno al Instituto. Declara
también **qué queda fuera de la capa común** y vive en
cada mundo.

> **Estado.** `PROPOSED` en v1. Nace de la sesión P6 sin
> ratificación autoral explícita. La promoción a `CANON`
> requiere un ADR firmado por Manuel (Canon Policy §5).

> **Tesis central.** P12 — *El Instituto une; no
> uniforma* — se aplica a la UI/UX. La consistencia no es
> uniformidad: la UI/UX común es un **contrato de
> comportamiento**, no un **look-and-feel único**.

> **Referencia de implementación.** La Bitácora se
> renderiza como DOM sobre el canvas (decisión vigente
> desde `docs/diseno-sintesis-v1.md` §9). La UI/UX común
> **no** se implementa desde este documento: se
> **delega** a producción.

---

## 1. Las dos capas de la UI/UX

| Capa | Comportamiento | Look-and-feel |
|---|---|---|
| **Común** | Idéntico en todos los mundos y en el Instituto. | Adopta el del mundo o el del Instituto donde corre. |
| **Específico** | Vive sólo en el mundo al que pertenece. | Diseñado por el GDD de ese mundo. |

> **Regla de cruce.** Cuando un jugador está en un desafío
> interdisciplinario (ver `roxana-cross-world-challenges_v1.md`),
> la UI/UX es la del **destino** del desafío. El origen
> aporta su lectura como **instrumento**, no como HUD.

---

## 2. La capa común (lo que se comparte)

La capa común se compone de **seis contratos**. Cada
contrato es un comportamiento; el look-and-feel se adapta
al contexto.

### 2.1. Navegación de Bitácora

La Bitácora se abre con la **misma jerarquía** en todos
los contextos:

1. **Archivo del Instituto** (entrada física).
2. **Índice** (lista de entradas, agrupadas por mundo y
   por capa).
3. **Entrada** (página individual con sus seis capas).
4. **Red conceptual** (vista transversal).

> La navegación es **misma estructura, distinto ritmo
> visual**. La estructura no cambia para no romper la
> lectura común; el ritmo visual cambia para no diluir la
> identidad del mundo (P12).

### 2.2. Lenguaje de objetivos

Los objetivos se expresan en **voz activa del jugador**,
no en imperativo del sistema. Tres formas válidas:

- **"Restaurar la luz del taller."** (verbo del mundo +
  objeto del Instituto).
- **"Comparar dos trayectorias antes de subir."**
  (acción + contexto).
- **"Hacer que el repartidor entregue a la puerta 4
  cada 14 segundos."** (condición medible).

> **Prohibido.** Objetivos en imperativo abstracto ("Pulsa
> el botón"), en pasiva ("La luz debe ser restaurada"), o
> en numérico ("Llega al 80 %"). El objetivo debe
> responder a "¿qué transformé en el mundo?" (P08).

### 2.3. Feedback de descubrimiento

El feedback de descubrimiento se sostiene sobre **tres
preguntas** (DL §6):

1. **Qué hizo** la solución propuesta.
2. **Qué cambió** en el mundo.
3. **Qué queda disponible** como siguiente paso.

> El feedback es **común en estructura, distinto en
> forma**. Cada mundo decide cómo muestra el "qué
> cambió": un sonido, una luz, una puerta, un agente que
> reacciona, una región que se expande. Lo que **no**
> cambia es la **triada de preguntas**.

### 2.4. Accesibilidad

La capa común respeta **cinco compromisos de
accesibilidad** (mínimos):

1. **Texto.** Tipografía con escala ajustable. La
   Bitácora, los diálogos, los letreros del Instituto y
   los HUD son texto y se rigen por la misma escala.
2. **Contraste.** Modo claro / modo oscuro disponible
   desde el primer ingreso.
3. **Movimiento.** Opción de reducir movimiento (cinemáticas,
   cámaras, transiciones de mundo).
4. **Audio.** Subtítulos y descripciones de audio
   esenciales; sin depender sólo del sonido para
  进步的un objetivo.
5. **Entrada.** Teclado, mouse, touch y gamepad. Sin
   obligar al jugador a un dispositivo.

> Estos compromisos son **mínimos**. La accesibilidad
> avanzada (TTS, navegación por voz, color-blind modes)
> se documenta en el plan de producción, no en este
> documento.

### 2.5. Perfil (resumen)

El perfil se abre desde **cualquier contexto** con un
acceso persistente. Lo que se ve:

- **Bitácora** (entrada directa al archivo).
- **Estado del Instituto** (salas, mecanismos, accesos).
- **Mundos visitados** (lista, no porcentaje).
- **Exportar material de estudio** (cuando esté
  disponible, ver `ROXANA_PLAYER_PROFILE_v1.md` §6).

> El perfil **no** muestra promedio, ranking, ni "nivel".
> Eso lo prohíbe P09 y la decisión de fondo del pack F
> §7.

### 2.6. Retorno al Instituto

El botón "Volver al Instituto" está disponible desde
**cualquier mundo** y desde **cualquier punto** (excepto
dentro de un puzzle no resuelto, donde el sistema pide
confirmación). El retorno:

- **No interrumpe** un puzzle activo sin confirmación.
- **No borra** estado del mundo.
- **No avanza** trama. El Instituto recibe al jugador
  en su estado actual, no en un "siguiente día".

---

## 3. La Bitácora como producto de UI (específico del
sistema, común en contrato)

La Bitácora tiene **una UI por capa** (ver
`ROXANA_BITACORA_SYSTEM_v1.md` §3). Las UI **varían en
forma**, pero respetan el contrato común de la sección
anterior.

| Capa | UI dominante | Restricción |
|---|---|---|
| 1. Experiencia | Lista de páginas con marca de fecha, sin filtro. | No muestra nombres técnicos hasta que la entrada pase a `FORMALIZED`. |
| 2. Hipótesis | Vista de página con tachones y versiones. | Conserva la versión anterior; nunca borra. |
| 3. Formalización | Vista en paralelo: manuscrito + limpio. | Sólo aparece en entradas `FORMALIZED` o superior. |
| 4. Red conceptual | Grafo navegable o índice filtrable (decisión en `UX-Q3`). | No se adelanta; los nodos se crean tras la entrada. |
| 5. Herramienta | Acciones (recuperar, comparar, fijar objetivo, mostrar diagrama, registrar solución). | No incluye examen. |
| 6. Maestría | Sección opcional con variaciones y transferencias. | No es requerida para la campaña. |

---

## 4. La capa específica (lo que NO se comparte)

La UI/UX específica vive en cada mundo y respeta el verbo
nuclear. P12 obliga a que cada mundo tenga su **propia**
manera de leer su sistema; la UI/UX común no la
sustituye.

| Mundo | UI/UX específica | Razón de ser |
|---|---|---|
| **Ohmdal (CONECTAR)** | HUD de circuito (vista de banco), instrumentación eléctrica, medidor con unidades. | El jugador **conecta**; necesita ver trayectoria, magnitud y dirección. |
| **Physica (EXPERIMENTAR)** | Instrumentos físicos (cuerpo, resorte, plano, polea, ancla), reloj-dispositivo analógico. | El jugador **experimenta**; necesita medir tiempo, distancia, ángulo. |
| **Bitland (PROGRAMAR)** | Editor de bloques / pseudocódigo, inspector de procesos, panel de debugging. | El jugador **programa**; necesita ver el estado, el mensaje, la condición. |
| **Arithmos (TRANSFORMAR)** | Manipuladores de representación (geométricos, algebraicos, gráficos), cambiador de vista, comparador de propiedades. | El jugador **transforma**; necesita ver la equivalencia y la propiedad conservada. |

> **Regla.** La UI/UX específica **no** se mete en otros
> mundos. Si una pieza cruza, cruza como **instrumento**
> (ver `ROXANA_METAPROGRESSION_v1.md` §4), no como HUD
> invasivo.

---

## 5. Lo que la UI/UX común NO es

| Idea | Por qué no entra |
|---|---|
| Una sola UI para todo | Viola P12. La UI/UX común es un contrato de comportamiento, no un look-and-feel único. |
| HUD global permanente | Cada mundo tiene su propio HUD; el Instituto muestra el estado del espacio, no un HUD de combate. |
| Notificación constante de "logros" | P08 y DL §2 lo prohíben. |
| Tienda / mercado | El Instituto no es una tienda. |
| Tutoriales modales | DL §3: la explicación explícita es último recurso. |
| Botones de "skip" o "fast-forward" de cinemáticas | P11: la narrativa explica lo que el sistema no muestra, no se ataja. |

---

## 6. Relación con el motor y el pipeline

> La UI/UX común **no** prescribe motor, framework, ni
> pipeline. Las decisiones técnicas se documentan en el
> `START_HERE.md`, en el ROADMAP y en los planes de
> producción.

Estado actual de implementación (referencia, no canon):

- `src/landing/landing.css` define animaciones globales
  (`rx-float`, `rx-pulse`, `rx-rise`) y estilos responsive.
- `src/ui/overlay.ts` se usa desde la escuela 2D para
  abrir la Bitácora.
- `EscuelaHubScene.ts` carga el mapa desde
  `assets/hub/escuela.json` (Tiled) como fuente única del
  layout del hub 2D.

---

## 7. Lo que este documento NO es

- No prescribe tipografía, paleta, ni estilo artístico.
- No prescribe implementación de la Bitácora; sólo su
  contrato de UI.
- No redefine los pilares. Si una sección entra en
  tensión con un pilar, el conflicto se eleva a ADR
  (Pillars §2).
- No es canon: es `PROPOSED` hasta ratificación.
