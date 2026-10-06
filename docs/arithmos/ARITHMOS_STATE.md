# Arithmos — estado

Actualizado: 2026-10-05 (iteración 1).

## Dónde

- Repositorio: `Bottousky/proyecto-roxana` (remoto `origin`). **Sin push.**
- Worktree aislado: `/Users/manuel/code/proyecto-roxana/.claude/worktrees/arithmos-graphic-adventure-065e68`
- Rama: `claude/arithmos-graphic-adventure-065e68` (base `f7984ca`).
- Juego: `experiments/arithmos/` · Documentos: `docs/arithmos/` · Evidencia: `artifacts/arithmos/itNN/`.
- Modelo: la sesión principal corre como Opus 5.5 (`claude-opus-5-5`, según el entorno). Los
  subagentes se lanzan con el alias `opus`; no puedo verificar desde adentro qué versión resolvió.

## Estado real (ciclo 3 del loop, 2026-10-06, tarde)

- **Capítulos 1 a 5 jugables y encadenados** (título → 1 → 2 → 3 → 4 → 5 → título).
- Revisiones independientes de este ciclo, todas sin navegador:
  - rev-mat-2 (caps. 1–3): aplicada.
  - rev-mat-3 (cap. 4): aplicada.
  - rev-narr-2 (caps. 2–4): altas aplicadas salvo A4, que quedó parcial; las medias quedan en parte pendientes (backlog N2-R).
- Cambios transversales:
  - El 4 de la tiza ya no se confunde con el 9 (familia "Tiza").
  - La Bitácora muestra primero lo que pasó.
  - Enter avanza el diálogo aunque el foco esté en un objeto tocable.
  - Chequeo estático de escenas: `npm run lint`.
  - La partida automática se detiene ante una falla del juego.
- Verificado por interfaz en este ciclo:
  - Partida completa caps. 1→4 con 8 recargas (454 s, sin errores; antes de la pasada narrativa).
  - Cap. 4, rutas directa y con errores (después de la pasada).
  - Cap. 5, ruta directa.
  - Cap. 4 en 844×390 táctil.
- Pendiente de este ciclo:
  - Rutas con errores de los caps. 2, 3 y 5 después de la pasada narrativa (en curso).
  - Revisión independiente del cap. 5.
- **Entorno:** máquina compartida con otras sesiones que usan Chrome.
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

1. Terminar de verificar los caps. 2, 3 y 5 por la ruta con errores y commitear.
2. Revisión independiente matemática y narrativa del cap. 5.
3. Pendientes de rev-narr-2 (N2-R), empezando por los que tocan comprensión (cierres con decisión, reglas antes de actuar).
4. Cap. 6 "Lo que no se ve": la ecuación como dos marcadores en la recta y el núcleo de "pasa sumando".
