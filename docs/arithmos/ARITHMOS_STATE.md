# Arithmos — estado

Actualizado: 2026-10-06 (ciclo 4 del loop).

## Dónde

- Repositorio: `Bottousky/proyecto-roxana` (remoto `origin`). **Sin push.**
- Worktree aislado: `/Users/manuel/code/proyecto-roxana/.claude/worktrees/arithmos-graphic-adventure-065e68`
- Rama: `claude/arithmos-graphic-adventure-065e68` (base `f7984ca`).
- Juego: `experiments/arithmos/` · Documentos: `docs/arithmos/` · Evidencia: `artifacts/arithmos/itNN/`.
- Modelo: la sesión principal corre como Opus 5.5 (`claude-opus-5-5`, según el entorno). Los
  subagentes se lanzan con el alias `opus`; no puedo verificar desde adentro qué versión resolvió.

## Estado real (ciclo 4 del loop, 2026-10-06, noche)

- **Capítulos 1 a 7 jugables y encadenados** (título → 1 → … → 7 → título). El cap. 7 «Crecer» tiene
  9 escenas: lado del cuadrado (√9, √2 armando dos cuadros), sumar o duplicar, contar los factores
  (2⁰, 2⁻¹ por patrón), muy grande/muy chico (Punto cuenta mal los ceros y se corrige), áreas con x,
  al revés (factorizar), completar el cuadrado, ¿cuántas veces? (logaritmo) y donde no se puede
  (1 ÷ (x − 2)); Bitácora y gancho al cap. 8.
- Revisiones independientes de este ciclo (sin navegador):
  - rev-mat-4 y rev-narr-3 (cap. 5): aplicadas salvo pendientes anotados.
  - rev-mat-5 (cap. 6): las 4 altas corregidas (6.8 con deshacer y camino de mitades; 3 = x ÷ 4
    comprobado en el 12; 6.7 con el conjunto solución dibujado; «para qué x coinciden»), y casi
    todas las medias.
  - rev-narr-4 (cap. 6): A4 corregida; A1, A3 y A5 parciales; A2 y A6 pendientes (backlog N6-R).
- Cambios transversales:
  - Los botones nuevos se ubican en el mismo cuadro en que se crean (antes, un toque rápido podía
    caer en otro: explicaba un registro raro del bot).
  - Los exponentes (2⁴, 10⁻³) se dibujan como cifras chicas y altas: la tiza no tenía esos signos.
  - Fracciones exactas en las cuentas («x/16», no «0,063x»).
- Verificado por interfaz en este ciclo:
  - Cap. 6 por la ruta con errores (`it07/c6-errores`) y caps. 6→7 por la ruta directa
    (`it07/c6c7-directa`), sin errores.
  - Cap. 7 escenas 7.3–7.9 por la ruta directa (`it07/c7b-directa2`).
- Pendiente de este ciclo:
  - Cap. 7 por la ruta con errores y en 844×390; revisión independiente del cap. 7 (C7-R).
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

1. Cap. 7: ruta con errores, teléfono 844×390, revisión matemática y narrativa independiente; aplicar.
2. Pendientes narrativos del cap. 6 (N6-R) y de los caps. 2–4 (N2-R), empezando por los que tocan
   comprensión.
3. Cap. 8 «Formas» (geometría, Pitágoras con el alcance de la prueba, coordenadas; la prueba de que √2
   no es una fracción).
4. Sistemas de ecuaciones (C6b).
