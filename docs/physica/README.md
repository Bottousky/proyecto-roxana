# Physica — dirección del mundo (Arco 1)

**Estado:** slice vertical M1 hecho (2026-08-05) en la rama `physica/main` (worktree
`C:/YO/Worktrees/roxana-physica`). La frontera con Ohmdal está en el plan aprobado por Manuel.

## La decisión de motor

**Three.js desde el día uno.** El canon termina en 3D («el mundo gira a una vista isométrica
para analizar y jugar en 3D»): la evolución es una transformación de cámara del mismo mundo,
no una segunda etapa. Elegir Phaser habría repetido la migración que Ohmdal está pagando
(H2–H6) sobre un mundo cuyo diseño termina en 3D.

- El arco 2D se juega con cámara de perspectiva de ángulo muy cerrado (fov 6, lejos): aspecto
  casi ortográfico, sin distorsión. El «giro» es un recorrido de cámara a isométrico (tecla C).
- Toda la física es analítica de forma cerrada (MRUV, tiro parabólico): nada de motor de
  físicas que pelee contra la pedagogía. El temario de 2º/3º de escuela técnica es exacto.

## El mundo

Naturaleza **sin humanos**, viva pero equivocada (fauna que se mueve mal: aves que no bajan,
peces que nadan en el aire). Un **acompañante no verbal** (la «sonda» viva): flota cuando la
ley está invertida, se asienta al restaurarla; es el sensor diegético del verbo *sentir*.
Su texto es `TODO(guion)` hasta que exista guion.

## Gramática de puzzles

Manipulación corporal del mundo (empujar, cargar, lanzar, soltar), no clic en un banco:

- **Predecir → observar → explicar:** la sonda dibuja la trayectoria prevista antes de lanzar.
- **Brillo primero:** la respuesta visible lidera (la roca cae, la placa se hunde, la puerta
  rechina); el número confirma (tiempo de caída medido).
- **≥2 soluciones** y reversible: la puerta se abre lanzando la piedra a la placa o empujando
  la piedra grande encima; la piedra grande sirve también de escalón.
- **Sin arcade:** lanzar es razonamiento espacial, no puntería (la guía de puzzles prohíbe
  precisión motriz fina).
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
  main.ts           boot: RuntimeHost + título
  physicaRuntime.ts único punto de entrada a three (import() dinámico) + harness de dev
  world.ts          escena, entidades, interacciones, cámara, UI DOM
  avatar.ts         control cinemático del avatar (puro)
  models/           cinemática analítica pura (caidaLibre, tiroParabolico)
  styles.css
tests/p0..p4-*.test.ts   registro, caída libre, tiro, avatar, ruta de escalada
```

Runtime nuevo: `platformer-three` (union de `types.ts`, `loaders.ts`, `manifests.ts`).
Harness de dev: `render_game_to_text()`, `advanceTime(ms)`, `__pxPress/__pxSnapshot/__pxTeleport`.

## Frontera de archivos

- **Compartidos (aditivos):** `types.ts`, `manifests.ts`, `loaders.ts`, `vite.config.ts`,
  `_redirects`, `schoolModel.ts`, `aulas.ts`, `tests/a0` y `w1`.
- **Prohibidos (zona Ohmdal en movimiento de Claude):** `src/ohmdal/**`, `src/jugar/**`,
  `runtimeHost.ts`, `registry.ts`, `main.ts`, `index.html`, `portal.ts`, `portalLink.ts`,
  `ROADMAP.md`, `docs/arco1/**`.

## Qué se puede jugar hoy (M1)

En `http://localhost:5174/physica` (o desde la puerta de Física en `/`): un valle con la
cascada que sube, plataformero (A/D + espacio), recoger y lanzar la piedra con preview de
trayectoria, empujar la piedra grande para escalar o abrir la puerta, medir el tiempo de
caída con el acompañante, reparar la fuente (la cascada cae) y girar la vista a isométrico.

## Deuda

- `TODO(guion)` en la capa formal de la Bitácora y en diálogos/piezas de texto.
- Movimiento y controles táctiles por verificar en dispositivo (hay botones, no probados en
  Android).
- El arco completo (U2–U5) usa el patrón de U1.
