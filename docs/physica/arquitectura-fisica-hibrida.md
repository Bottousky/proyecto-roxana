# Physica — Arquitectura de física híbrida (Havok + analítica)

**Fecha:** 2026-08-07
**Decisión:** Director Manuel — hybrid physics architecture para Physica Arc 1.

## Regla de oro

> **Deterministic analytic physics are authoritative for pedagogical phenomena
> and altered laws of Physica. Use Havok for general game-world physics where
> appropriate: collisions, rigid bodies, contacts, pushable props, stacking,
> friction, environmental objects, debris, constraints and secondary physical
> interactions. Never let Havok and an analytic model integrate the same degree
> of freedom of the same object simultaneously. For hybrid objects, explicitly
> decide which system owns each physical property.**

## Distribución de autoridad

| Sistema | Modelo | Objetos que controla |
|---|---|---|
| **Analítica** | `models/cascadaAscendente.ts` (a = +g) | El agua de la cascada (Escena 2) |
| **Analítica** | `models/tiroParabolico.ts` (a = -g) | Piedras en vuelo (Escena 2, 4, 5) |
| **Analítica** | `models/caidaLibre.ts` | Caída libre de piedras, contrapeso |
| **Analítica** | `models/equilibrio.ts` | INSTRUMENTO suspendido (Escena 3, suma vectorial nula) |
| **Analítica** | `models/vector.ts` | Composición de vectores (Escena 5, saquitos) |
| **Analítica** | `models/referenciaMovil.ts` | Plataformas a la deriva (Escena 4) |
| **Analítica** | `models/planoInclinado.ts` | Roca subiendo por la rampa (Escena 6) |
| **Havok** | `physics.ts` | Avatar ↔ plataformas, losas, rocas grandes (pushable), debris futuro |

## Patrón de transición

Cuando una analítica "entrega" un objeto (piedra cae al suelo), Havok toma
el control de su posición de reposo para evitar atravesar la malla:

1. Piedra: la trayectoria analítica la lleva en el aire hasta `y < sueloY`.
2. En ese instante, Havok recibe la piedra como `PhysicsMotionType.DYNAMIC`
   en reposo con velocidad 0.
3. A partir de ahí, Havok gestiona contactos con plataformas y rocas.

## Frontera del archivo

- `src/experiences/physica/physics.ts` — única entrada a Havok.
- Los modelos puros en `models/*.ts` no importan Babylon ni Havok.

## Contradicciones detectadas con documentación previa

1. **`CLAUDE.md` declara Phaser 4 + Three.js como stack único.**
   El nuevo arco (Physica) usa Babylon.js + Havok. La decisión del
   Director 2026-08-07 manda: Physica va en Babylon, el Instituto/Ohmdal
   sigue en Phaser + Three. Es un proyecto multi-engine, no una
   sustitución.

2. **`docs/physica/spec-hito1-cascada-babylon.md` prohíbe Havok.**
   "NO instalar `@babylonjs/havok` ni ningún motor de físicas". Esto
   era válido para el Hito 1 (solo Escena 2 con agua y piedra). Para
   el Arco 1 completo (Escenas 2-8 + pushable props + colliders),
   la regla híbrida del Director lo reemplaza. El Hito 1 no se
   reescribe: su cascada sigue analítica. La nueva regla añade Havok
   solo para los nuevos sistemas físicos que lo requieren.

3. **`docs/physica/spec-vertical-slice.md` dice "Sin Havok (canon: física
   analítica de forma cerrada)".** Misma razón: esa spec cubría
   Escenas 2-8 con modelos analíticos. La regla híbrida del Director
   la extiende, no la contradice: Havok es complementario, no sustituye.

## Garantías

- Los modelos puros siguen siendo testeables sin Babylon/Havok
  (`tests/p5-*.test.ts` corre con `node --experimental-strip-types`).
- Si Havok no carga (sin WASM), `physics.ts` devuelve `null` y el juego
  cae al modo "solo analítica" sin romper el build.
- El bundle del landing no descarga Babylon ni Havok.
