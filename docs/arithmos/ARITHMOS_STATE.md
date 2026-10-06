# Arithmos — estado

Actualizado: 2026-10-06 (ciclo 4 del loop).

## Dónde

- Repositorio: `Bottousky/proyecto-roxana` (remoto `origin`). **Sin push.**
- Worktree aislado: `/Users/manuel/code/proyecto-roxana/.claude/worktrees/arithmos-graphic-adventure-065e68`
- Rama: `claude/arithmos-graphic-adventure-065e68` (base `f7984ca`).
- Juego: `experiments/arithmos/` · Documentos: `docs/arithmos/` · Evidencia: `artifacts/arithmos/itNN/`.
- Modelo: la sesión principal corre como Opus 5.5 (`claude-opus-5-5`, según el entorno). Los
  subagentes se lanzan con el alias `opus`; no puedo verificar desde adentro qué versión resolvió.

## Estado real (ciclo 7 del loop, 2026-10-07)

- **El recorrido completo, capítulos 1 a 12, es jugable y está encadenado** (título → 1 → … → 12 →
  tarjeta final «Arithmos — Lo que se entiende, resiste»). Cada capítulo pasa por la ruta directa y la
  ruta con errores del bot; los caps. 7–9 también en 844×390.
- Revisiones matemáticas independientes hechas para los 12 capítulos. Las altas de los caps. 9–12
  (rev-mat-8, 9 y 10) están corregidas en texto o datos (ver `ARITHMOS_REVIEW.md`); quedan medias
  pendientes en C9-R…C12-R, N9-R y N10-12.
- Revisión narrativa de los caps. 10–12: en curso (no hecha hasta ahora).
- Guarda nueva de interfaz (botones de texto que se pisan): encontró y corrigió un caso en 5.9; los
  caps. 6–9 no se volvieron a pasar con esa guarda a 1600×900.
- **Entorno:** máquina compartida; las partidas del bot se corren de a una y las capturas pueden tardar
  (el bot ahora tolera una captura fallida).
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

1. Revisión narrativa de los caps. 10–12 (en curso) y aplicar sus altas.
2. Pasada del bot por los caps. 6–9 con la guarda nueva (1600×900 y 844×390).
3. Pendientes de narrativa por capítulo (N2-R, N6-R … N10-12), empezando por agencia y legibilidad en
   teléfono, que se repiten en todas las revisiones.
4. Cobertura pendiente: C6b (identidad), C7b, familias que faltan en el cap. 12 (logarítmica, radical).
5. Lo que no se puede hacer en forma autónoma: escuchar el audio y probar con personas.
