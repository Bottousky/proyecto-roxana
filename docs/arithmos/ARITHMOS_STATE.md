# Arithmos — estado

Actualizado: 2026-10-05 (iteración 1).

## Dónde

- Repositorio: `Bottousky/proyecto-roxana` (remoto `origin`). **Sin push.**
- Worktree aislado: `/Users/manuel/code/proyecto-roxana/.claude/worktrees/arithmos-graphic-adventure-065e68`
- Rama: `claude/arithmos-graphic-adventure-065e68` (base `f7984ca`).
- Juego: `experiments/arithmos/` · Documentos: `docs/arithmos/` · Evidencia: `artifacts/arithmos/itNN/`.
- Modelo: la sesión principal corre como Opus 5.5 (`claude-opus-5-5`, según el entorno). Los
  subagentes se lanzan con el alias `opus`; no puedo verificar desde adentro qué versión resolvió.

## Estado real (fin de la sesión 1)

- **Capítulos 1 y 2 jugables y encadenados** (título → cap. 1 → cap. 2 → título con "volver a jugar").
- Cap. 1 pasó por tres revisiones independientes (matemática, narrativa/audiovisual, funcional);
  sus hallazgos están aplicados y registrados en ARITHMOS_REVIEW.md. Falta una **segunda pasada**
  de las tres sobre la versión corregida.
- Cap. 2 tiene sólo revisión del autor; falta su revisión independiente y aplicarle las lecciones
  del cap. 1 (voz lacónica, consecuencias visibles, primeros planos).
- Probado automáticamente: 25 pruebas unitarias; partida completa de ambos capítulos con recargas
  (sin errores, mín. 53 fps / mediana 60 en Mac M2); teclado y pausa (`scripts/keyboard-check.mjs`).
- **Abierto:** en 844×390 táctil, ruta "errores", la política del probador para deshacer la unión
  doble terminó triplicando un punto y se trabó (probable falla del probador con blancos de ~17 px,
  no confirmada). Verificar a mano y, si es del juego, separar más los puntos en pantallas bajas.
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

1. Reproducir el atasco táctil 844×390 (ruta errores, emparejar) y corregir.
2. Nueva película del cap. 1 y segunda pasada de revisores (mat → narr → func).
3. Revisión independiente del cap. 2 y pasada de dirección/voz.
4. Capítulo 3 (La línea): recta, orden, negativos ("menos que nada", gancho del cap. 2), distancia, |x|.
