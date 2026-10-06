# Arithmos — estado

Actualizado: 2026-10-06 (ciclo 4 del loop).

## Dónde

- Repositorio: `Bottousky/proyecto-roxana` (remoto `origin`). **Sin push.**
- Worktree aislado: `/Users/manuel/code/proyecto-roxana/.claude/worktrees/arithmos-graphic-adventure-065e68`
- Rama: `claude/arithmos-graphic-adventure-065e68` (base `f7984ca`).
- Juego: `experiments/arithmos/` · Documentos: `docs/arithmos/` · Evidencia: `artifacts/arithmos/itNN/`.
- Modelo: la sesión principal corre como Opus 5.5 (`claude-opus-5-5`, según el entorno). Los
  subagentes se lanzan con el alias `opus`; no puedo verificar desde adentro qué versión resolvió.

## Estado real (ciclo 6 del loop, 2026-10-06)

- **Capítulos 1 a 9 jugables y encadenados.** El cap. 9 «Depende» tiene 8 escenas: flechas (función
  vs relación, con el largo de la sombra), la máquina de Mara (regla; la de Punto no es función),
  puntos que se paran (tabla → gráfico; unir o no; la Marea borra la ola decorativa de Punto), la
  recta parada, dónde se puede (dominio de la cuenta vs del reparto), lo que sale (imagen de x · x),
  tres maneras (cuenta, tabla y gráfico) y lo que vuelve (gancho al cap. 10); Bitácora.
- Cap. 8 corregido según rev-mat-7 (las 2 altas y casi todas las medias) y parte de rev-narr-6;
  pendientes en N8-R.
- Verificado por interfaz en este ciclo, sin errores: cap. 7 (directa y con errores), cap. 8 (directa,
  con errores, teléfono), cap. 9 (directa, con errores y teléfono 844×390).
- **Entorno:** las partidas del bot se corren de a una (dos en paralelo se traban).
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

1. Revisión independiente del cap. 9 (C9-R); aplicar.
2. Cap. 10 «Vueltas y flechas» (trigonometría, radianes, periodicidad, vectores, complejos como giro).
3. Pendientes narrativos N8-R, N7-R, N6-R, N2-R; cobertura C7b y C6b.
