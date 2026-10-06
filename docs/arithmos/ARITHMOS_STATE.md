# Arithmos — estado

Actualizado: 2026-10-06 (ciclo 4 del loop).

## Dónde

- Repositorio: `Bottousky/proyecto-roxana` (remoto `origin`). **Sin push.**
- Worktree aislado: `/Users/manuel/code/proyecto-roxana/.claude/worktrees/arithmos-graphic-adventure-065e68`
- Rama: `claude/arithmos-graphic-adventure-065e68` (base `f7984ca`).
- Juego: `experiments/arithmos/` · Documentos: `docs/arithmos/` · Evidencia: `artifacts/arithmos/itNN/`.
- Modelo: la sesión principal corre como Opus 5.5 (`claude-opus-5-5`, según el entorno). Los
  subagentes se lanzan con el alias `opus`; no puedo verificar desde adentro qué versión resolvió.

## Estado real (ciclo 5 del loop, 2026-10-06)

- **Capítulos 1 a 8 jugables y encadenados.** El cap. 8 «Formas» tiene 8 escenas: la diagonal que
  no cae (√2 no es fracción, por descenso), la vuelta (180° con la paralela), copias (iguales y
  parecidas), el doble de grande (× 4 y × 8), la misma cerca (perímetro vs área), el tirante
  (Pitágoras por reacomodo, con contraejemplo), dónde está cada casa (coordenadas, distancia) y
  sombras (gancho al cap. 9: relación vs función); Bitácora.
- Cap. 7 corregido según rev-mat-6 (las 3 altas y casi todas las medias) y parte de rev-narr-5
  (A4, partes de A2, A3 y A5); pendientes en C7b y N7-R.
- Verificado por interfaz en este ciclo (sin errores): cap. 7 ruta directa (`it08/c71-trace`) y con
  errores (`it08/c7-errores2`); cap. 8 ruta directa (`it08/c8-directa`) y con errores (`it08/c8-errores`).
  Cap. 7 en 844×390 en el ciclo anterior (`it07/c7-telefono3`); el cap. 8 en teléfono falta.
- **Entorno:** dos partidas del bot en paralelo se trabaron (14 min en 7.1); correrlas de a una.
- Audio no escuchado; sin playtests humanos; sin dispositivo táctil real.

## Comandos

```sh
cd experiments/arithmos
node scripts/serve.mjs 4195                      # jugar en http://127.0.0.1:4195/
node --test tests/                               # pruebas unitarias
node scripts/playthrough.mjs <dir> --reload      # partida automática con recargas
node scripts/playthrough.mjs <dir> --watch --film --route=directa   # película a velocidad real
node scripts/shot.mjs lab/ <png>                 # laboratorio de tiza
```

## Bloqueos

- Sin ffmpeg (no se instalan binarios): las grabaciones son secuencias de cuadros + visor HTML.
- Sin acceso a escucha ni a personas: audio y comprensión no se certifican.
- Integración con la escuela (`experiments/playcanvas`) requiere tocar infraestructura compartida:
  se deja propuesta, no se hace sin acuerdo (backlog X-2).

## Siguiente acción

1. Revisión independiente del cap. 8 (C8-R) y cap. 8 en 844×390; aplicar.
2. Cap. 9 «Depende» (relación vs función, dominio, imagen, tablas, gráficos, expresiones).
3. Pendientes narrativos N7-R, N6-R y N2-R, empezando por los que tocan comprensión.
4. Cobertura pendiente: C7b (álgebra) y C6b (sistemas).
