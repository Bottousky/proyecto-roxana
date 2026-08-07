# Physica — dirección del mundo (Arco 1)

**Estado:** hito 1 hecho (2026-08-05) en la rama `physica/main` (worktree
`C:/YO/Worktrees/roxana-physica`): la cascada ascendente (Escena 2 del slice v0.2)
jugable en Babylon.js. La frontera con Ohmdal está en el plan aprobado por Manuel.
El Aula de Física y el acceso desde el Instituto son de otro hito.

## La decisión de motor

**Babylon.js para los mundos** (GDD v0.2 §22.2, decisión de Manuel 2026-08-05, directa,
sin prototipo comparativo). El Instituto/landing permanece en el stack actual y Three.js.
El hito 1 se concentró en el desarrollo DENTRO de Physica; lo que pasa en el Instituto
(reloj, mesa atómica, micro-puzzle del anillo) es de otro hito.

- El arco 2D se juega con cámara lateral de fov cerrado (0.16 rad) y encuadres curados:
  cerca de la cornisa se juega de cerca; al acercarse a la cascada la cámara hace
  dolly-out y revela la escala monumental (referencias de montaje: Trine, INSIDE).
- Toda la física es analítica de forma cerrada (MRUV, tiro parabólico): nada de motor
  de físicas que pelee contra la pedagogía. El temario de 2º/3º de escuela técnica es
  exacto. **No se usa Havok ni plugin de físicas.**
- La M1 (Three.js, `world.ts`/`physicaRuntime.ts`) no se borra: es base de regresión y
  fuente de los modelos puros. Sigue jugable en dev con `/physica/?engine=three`.

## El mundo

Naturaleza **sin humanos**, viva pero equivocada: la cascada asciende desde el lago
hasta las nubes (a = +g) mientras una piedra arrojada cae con normalidad (a = -g). En
el mismo lugar conviven dos leyes: no es una inversión global simple. La observación
se registra en la Bitácora por condiciones sobre el mundo (arrojar + estar en el
lugar), no por un clic. El acompañante y el reloj-dispositivo llegan en hitos futuros.

## Gramática de puzzles

Manipulación corporal del mundo (empujar, cargar, lanzar, soltar), no clic en un banco:

- **Predecir → observar → explicar:** el mundo responde visible primero; el número
  confirma después.
- **Brillo primero:** la respuesta visible lidera; la cascada es el hito visual y se
  lee antes que el fondo.
- **≥2 soluciones** y reversible: dos piedras en la cornisa, recogibles y relanzables.
- **Sin arcade:** lanzar es razonamiento espacial, no puntería (la guía de puzzles
  prohíbe precisión motriz fina).
- **Bitácora después:** formaliza lo vivido, no lo anticipa.

## Arco inicial

| Unidad | Concepto | Fenómeno |
|---|---|---|
| U1 | gravedad / caída libre | la cascada que sube |
| U2 | MRU | el río que nunca frena |
| U3 | tiro vertical / MRUV | |
| U4 | plano inclinado | |
| U5 | resortes (movimiento armónico) | |

Después siguen tiro oblicuo, cargas y óptica en arcos posteriores.

## Arquitectura

```
src/experiences/physica/
  index.html        entrada multi-page (patrón src/ohmdal)
  main.ts           boot: RuntimeHost + título; ?engine=three monta la M1 en dev
  babylonRuntime.ts frontera única con babylonjs (import() dinámico) + harness de dev
  babylonWorld.ts   escena Babylon (Hito 1: cornisa, lago, cascada, piedras, cámara curada, Bitácora DOM)
  physicaRuntime.ts runtime de la M1 (Three.js) — regresión, no se toca
  world.ts          mundo de la M1 (Three.js) — regresión, no se toca
  avatar.ts         control cinemático del avatar (puro, compartido con la M1)
  models/           cinemática analítica pura (caidaLibre, tiroParabolico, cascadaAscendente)
  styles.css
tests/p0..p5-*.test.ts   registro, caída libre, tiro, avatar, ruta de escalada, cascada ascendente
```

Runtime nuevo: `platformer-babylon` (union de `types.ts`, `loaders.ts`, `manifests.ts`).
Harness de dev: `render_game_to_text()`, `advanceTime(ms)`, `__pxPress/__pxSnapshot/__pxTeleport`.

## Frontera de archivos

- **Compartidos (aditivos):** `types.ts`, `manifests.ts`, `loaders.ts`, `vite.config.ts`,
  `_redirects`, `schoolModel.ts`, `aulas.ts`, `tests/a0`, `tests/p0` y `w1`.
- **Prohibidos (zona Ohmdal en movimiento de Claude):** `src/ohmdal/**`, `src/jugar/**`,
  `runtimeHost.ts`, `registry.ts`, `main.ts`, `index.html`, `portal.ts`, `portalLink.ts`,
  `ROADMAP.md`, `docs/arco1/**`.

## Qué se puede jugar hoy (Hito 1)

En `http://localhost:5173/physica` (o desde la puerta de Física en `/`): una cornisa
frente a un lago con la cascada que sube hasta las nubes. Plataformero (A/D + espacio),
recoger (E) y arrojar (T) dos piedras: caen con normalidad mientras el agua sube. Al
arrojar y acercarse a la cascada, la Bitácora (B) registra la observación y persiste.
La cámara hace dolly-out frente a la cascada (la escala monumental se muestra sola).

## Deuda

- `TODO(guion)` en la capa formal de la Bitácora y en el título de la entrada
  (placeholder «Registro de llegada»).
- `babylonjs` se importa como bundle UMD completo (~1.8 MB gzip, chunk lazy que la
  landing no descarga): candidato a `@babylonjs/core` (tree-shaking) cuando el mundo
  crezca y el bundle importe.
- Movimiento y controles táctiles por verificar en dispositivo (hay botones, no
  probados en Android).
- El arco completo (U2–U5) usa el patrón de U1.
