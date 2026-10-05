# Arithmos — estado

Actualizado: 2026-10-05 (iteración 1).

## Dónde

- Repositorio: `Bottousky/proyecto-roxana` (remoto `origin`). **Sin push.**
- Worktree aislado: `/Users/manuel/code/proyecto-roxana/.claude/worktrees/arithmos-graphic-adventure-065e68`
- Rama: `claude/arithmos-graphic-adventure-065e68` (base `f7984ca`).
- Juego: `experiments/arithmos/` · Documentos: `docs/arithmos/` · Evidencia: `artifacts/arithmos/itNN/`.
- Modelo: la sesión principal corre como Opus 5.5 (`claude-opus-5-5`, según el entorno). Los
  subagentes se lanzan con el alias `opus`; no puedo verificar desde adentro qué versión resolvió.

## Estado real

- **Capítulo activo: 1 — ¿Están todos?** Jugable de principio a fin (10 escenas), con guardado,
  reanudación, momentos rejugables, Bitácora basada en lo que hizo el jugador, ayudas graduadas,
  opciones de accesibilidad.
- Probado automáticamente (sistema, no aprendizaje): 15 pruebas unitarias; partida completa por
  interfaz en ruta "errores" (comprobar antes de tiempo, unión doble y deshacer, lecturas
  equivocadas, predicción errónea) y en ruta "directa"; recargas en 5 escenas y a mitad de anotar.
- Medido en escritorio (Apple M2, Chrome, headless con GPU, 1600×900): mediana 60 fps, mínimo
  muestreado 46,7 fps. **No medido en dispositivo táctil real.**
- Audio: generado y conectado; **no escuchado** por nadie todavía (no tengo escucha).
- Revisiones independientes del cap. 1: pendientes. Playtests humanos: ninguno.
- Capítulos 2–11: diseñados a nivel de recorrido (ARITHMOS_DESIGN.md), **no implementados**.

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

1. Revisiones independientes del capítulo 1 (matemática → narrativa/audiovisual → funcional), secuenciales, con el contrato, el juego y la evidencia; corregir hallazgos.
2. Pulido de actuación y ritmo a partir de la película de `it01`.
3. Capítulo 2 (agrupar, unidad, valor posicional, cero; suma y resta con significado), con el "1" de "14" como pregunta de entrada.
