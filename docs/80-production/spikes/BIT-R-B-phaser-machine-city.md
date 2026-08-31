---
status: EXPERIMENTAL
authority_level: 6
version: v1
last_ratified: 2026-08-16
experiment_id: BIT-R-B
paired_with: BIT-R-A
---

# BIT-R-B — Phaser 4 Machine-City

## Question

¿Phaser 4 permite representar la misma **máquina-ciudad dentro de un microcontrolador** con igual o mejor claridad y menos infraestructura propia que PixiJS?

## Fairness lock

- Pair: `BIT-R-A`.
- Partir del mismo commit baseline, no del resultado de A.
- Integración técnica: Codex.
- Mismo protocolo de playtest blind-first y revisión para A y B.
- Normal loops: 1–3; hard cap: 5.
- No leer/copiar código específico del spike A.
- Resolver y fijar versión exacta de Phaser 4 al iniciar el spike; no actualizar otra dependencia incidentalmente.
- Cargar tooling oficial Phaser 4 sólo si el spike lo necesita.

## Shared core contract

Consumir el mismo módulo TypeScript engine-neutral definido para BIT-R:

- deterministic state;
- tick scheduler;
- one programmable agent;
- 6-instruction program;
- one `IF`;
- event/trace log;
- pause/play/step;
- snapshot/rewind mínimo;
- message bus event;
- 50–200 ambient process fixtures;
- validators.

El simulation core **no importa Phaser**.

## Player fantasy

> Estás dentro de una máquina-ciudad. Cada pulso del sistema hace que rutas, procesos y dispositivos avancen. Puedes detener el tiempo de la máquina, observar un paso, detectar por qué una instrucción tomó una ruta y corregir el comportamiento.

## Learning Contract

Idéntico a A:

- Percibe: tick + estado antes de teoría.
- Manipula: secuencia/condición.
- Predice: próximo paso y rama del `IF`.
- Consecuencia: ciudad/agente/traza cambian visiblemente.
- Fallo: bug produce información trazable.
- Transferencia: nuevo input/state exige nueva predicción.
- Formalización: posterior a experiencia.

## Required player-visible fixture

El mismo resultado de A:

1. máquina/chip coherente;
2. agente programado;
3. clock/pulse;
4. step/play/pause;
5. `IF` legible;
6. bug reproducible;
7. execution trace;
8. message/bus event;
9. actividad ambiental;
10. inspector/editor DOM equivalente;
11. desktop + touch.

## Phaser-specific hypothesis

Medir si Phaser reduce coste gracias a:

- Scene lifecycle;
- camera/input;
- entities/containers;
- tilemap/Graphics cuando correspondan;
- tweens/audio;
- SpriteGPULayer/TilemapGPULayer sólo si el fixture realmente los necesita;
- official Agent Skills.

**Phaser update/time tampoco es el simulation clock.** El core avanza ticks deterministas y Phaser presenta/interpola.

### Phaser Editor v5 — no contaminar el primer resultado

El spike base debe poder implementarse sin comprar/adoptar Phaser Editor.

Si Phaser cumple pedagógicamente pero authoring espacial queda como bottleneck material, registrar un sub-experimento separado `BIT-TOOL-B1` para medir el Scene Editor + MCP (40+ tools). No usar el editor para darle a B una ventaja de tiempo que A no tuvo sin registrarlo por separado.

## Acceptance criteria

Los mismos que A:

- [ ] shared simulation core pasa tests sin Phaser.
- [ ] jugador predice próximo tick.
- [ ] identifica estado del `IF`.
- [ ] diagnostica bug desde consecuencia + trace.
- [ ] resuelve variante de input.
- [ ] 50–200 procesos no ocultan foco.
- [ ] desktop + touch completan objetivo.
- [ ] cero errores de consola relevantes.
- [ ] performance medida bajo fixture fijo.
- [ ] playtest blind-first sin BLOCKER/MAJOR.
- [ ] revisión comparativa sin BLOCKER/MAJOR.

## Evidence

Registrar exactamente las mismas categorías de A:

- baseline;
- Phaser version;
- skills cargadas;
- loops;
- intervención humana;
- infraestructura específica;
- FPS/frame time;
- bundle delta si material;
- informe de playtest;
- screenshots desktop/mobile;
- bug/trace repro;
- residual risks.

## Stop

PASS, ESCALATE o hard cap 5. No arte final ni features extra por “aprovechar Phaser”.
