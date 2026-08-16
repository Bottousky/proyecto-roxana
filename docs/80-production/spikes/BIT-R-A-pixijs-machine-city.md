---
status: EXPERIMENTAL
authority_level: 6
version: v1
last_ratified: 2026-08-16
experiment_id: BIT-R-A
paired_with: BIT-R-B
---

# BIT-R-A — PixiJS Machine-City

## Question

¿PixiJS permite representar una **máquina-ciudad dentro de un microcontrolador** de forma más legible, pedagógica y sostenible para agentes que Phaser, bajo exactamente el mismo simulation core?

## Fairness lock

- Pair: `BIT-R-B`.
- Partir del mismo commit baseline.
- Builder: MiniMax M3 / MiniMax Code.
- Player Agent: GPT-5.6 Luna, protocolo blind-first.
- Repair: DeepSeek V4 Flash.
- Adversarial review: mismo GLM pin usado por B.
- Normal loops: 1–3; hard cap: 5.
- No leer/copiar código del spike B.
- Resolver y fijar versión exacta de PixiJS al iniciar el spike; registrarla en Result.
- Instalar/cargar skills oficiales PixiJS v8 relevantes según `GAME_DEV_AI_TOOLING.md`.

## Shared core contract

Crear primero un módulo TypeScript engine-neutral que también consumirá B:

- deterministic state;
- tick scheduler;
- one programmable agent;
- 6-instruction program;
- one `IF`;
- event/trace log;
- pause/play/step;
- snapshot/rewind mínimo;
- message bus event;
- 50–200 ambient process fixtures sin gameplay authority;
- validators.

El simulation core **no importa PixiJS**.

## Player fantasy

> Estás dentro de una máquina-ciudad. Cada pulso del sistema hace que rutas, procesos y dispositivos avancen. Puedes detener el tiempo de la máquina, observar un paso, detectar por qué una instrucción tomó una ruta y corregir el comportamiento.

No explicar “esto es un microcontrolador” mediante tutorial técnico inicial. La máquina debe leerse por comportamiento.

## Learning Contract

**Concepto principal:** secuencia + condición + estado observable + debugging.

- Percibe: el clock/tick y cambios de estado antes de leer sintaxis formal.
- Manipula: orden/condición del programa.
- Predice: qué hará el agente en el próximo tick y qué ruta tomará el `IF`.
- Consecuencia: movimiento/estado/traza de la ciudad cambia de forma visible.
- Fallo: un bug produce una consecuencia trazable, no “incorrecto”.
- Transferencia: cambiar un input/state hace que el jugador prediga correctamente una rama distinta.
- Formalización: nombres técnicos aparecen después de que el jugador haya usado los comportamientos.

## Required player-visible fixture

1. máquina/chip como espacio coherente;
2. agente programado visible;
3. clock/pulse legible;
4. step / play / pause;
5. `IF` visible como decisión, sin representar falsamente arquitectura electrónica;
6. bug reproducible;
7. execution trace visible;
8. message/bus event visible;
9. actividad ambiental suficiente para sentir ciudad viva sin ocultar el programa principal;
10. inspector/editor DOM compartible conceptualmente con B;
11. desktop + touch.

## Pixi-specific hypothesis

Probar si estas capacidades reducen complejidad y mejoran lectura:

- Graphics/primitives para buses y rutas;
- scene graph + zIndex/render layers;
- pooling/batching/ParticleContainer para pulsos repetidos;
- custom rendering sólo donde sea necesario;
- culling por distrito/zoom;
- Pixi ticker únicamente para presentación/interpolación, **nunca como simulation clock**.

## Acceptance criteria

- [ ] simulation core tiene tests sin Pixi.
- [ ] jugador puede decir qué ocurrirá en el próximo tick antes de Step.
- [ ] jugador identifica qué estado hizo que el `IF` tomara una rama.
- [ ] bug puede diagnosticarse desde consecuencia + trace sin leer solución interna.
- [ ] variante de input produce predicción correcta.
- [ ] 50–200 procesos ambientales no ocultan el proceso foco.
- [ ] desktop y touch completan el mismo objetivo.
- [ ] cero errores de consola relevantes.
- [ ] frame/performance baseline medido bajo fixture fijo.
- [ ] Player Agent sin BLOCKER/MAJOR.
- [ ] adversarial reviewer sin BLOCKER/MAJOR.

## Evidence

Registrar:

- commit baseline;
- Pixi version exacta;
- skills cargadas;
- loops;
- intervención humana;
- loc/archivos de infraestructura específica;
- FPS/frame time del fixture;
- bundle delta si es material;
- Player Agent findings;
- screenshots desktop/mobile;
- repro de bug/trace;
- residual risks.

## Stop

PASS, ESCALATE o hard cap 5. No polish artístico fuera de lo necesario para leer la máquina.
