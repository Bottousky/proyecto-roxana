# Arithmos — estado

Actualizado: 2026-10-05 (iteración 1).

## Dónde

- Repositorio: `Bottousky/proyecto-roxana` (remoto `origin`). **Sin push.**
- Worktree aislado: `/Users/manuel/code/proyecto-roxana/.claude/worktrees/arithmos-graphic-adventure-065e68`
- Rama: `claude/arithmos-graphic-adventure-065e68` (base `f7984ca`).
- Juego: `experiments/arithmos/` · Documentos: `docs/arithmos/` · Evidencia: `artifacts/arithmos/itNN/`.
- Modelo: la sesión principal corre como Opus 5.5 (`claude-opus-5-5`, según el entorno). Los
  subagentes se lanzan con el alias `opus`; no puedo verificar desde adentro qué versión resolvió.

## Estado real (ciclo 3 del loop, 2026-10-06)

- **Capítulos 1, 2, 3 y 4 jugables y encadenados** (el 4 recién implementado: en prueba).
- Segunda revisión matemática independiente (caps. 1–3) recibida y aplicada: 5 hallazgos altos y
  12 medios corregidos, salvo uno parcial (jugar una resta que da negativo, 2 − 5). Detalle en
  ARITHMOS_REVIEW.md. Commit `e105e6a`.
- Verificado por interfaz después de las correcciones: cap. 2 → 3 por la ruta con errores
  (200 s, sin errores) y por la directa con capturas; cap. 3 solo por las dos rutas. La partida
  automática ahora espera a que las opciones se activen (antes, varias respuestas equivocadas no
  se probaban de verdad).
- Cap. 4 "Veces": 7 escenas (grupos, girar, estirar la línea, repartir, medir, entre nadie,
  partir el rectángulo) sobre `src/logic/times.js`. Sin revisión independiente todavía.
- Pendiente de revisión independiente: narrativa de los caps. 2–4; matemática del cap. 4.
- **Entorno:** la máquina la comparten otras sesiones con Chrome; los tiempos y fps varían con esa carga.
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

1. Terminar de probar el cap. 4 por las dos rutas, con capturas, y corregir.
2. Revisión independiente matemática del cap. 4 y narrativa de los caps. 2–4.
3. M-k pendiente: una resta que da negativo jugada (2 − 5), quizá al inicio del cap. 4 o en el 6.
4. Cap. 5 "Partes de algo": diseño (fracciones como medida y como reparto de los 2 atados que sobraron).
