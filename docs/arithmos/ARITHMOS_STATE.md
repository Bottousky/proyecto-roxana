# Arithmos — estado

Actualizado: 2026-10-05 (iteración 1).

## Dónde

- Repositorio: `Bottousky/proyecto-roxana` (remoto `origin`). **Sin push.**
- Worktree aislado: `/Users/manuel/code/proyecto-roxana/.claude/worktrees/arithmos-graphic-adventure-065e68`
- Rama: `claude/arithmos-graphic-adventure-065e68` (base `f7984ca`).
- Juego: `experiments/arithmos/` · Documentos: `docs/arithmos/` · Evidencia: `artifacts/arithmos/itNN/`.
- Modelo: la sesión principal corre como Opus 5.5 (`claude-opus-5-5`, según el entorno). Los
  subagentes se lanzan con el alias `opus`; no puedo verificar desde adentro qué versión resolvió.

## Estado real (ciclo 2 del loop, 2026-10-06)

- **Capítulos 1, 2 y 3 jugables y encadenados** (título → 1 → 2 → 3 → título con "volver a jugar").
- Cap. 1: tres revisiones independientes aplicadas (ARITHMOS_REVIEW.md). Segunda pasada matemática
  en curso (sin navegador). Segunda pasada narrativa: pendiente (el revisor se colgó por carga).
- Cap. 2: pasada de voz lacónica y consecuencias visibles (depósito de prueba de Punto). Sin
  revisión independiente todavía (la matemática en curso lo incluye).
- Cap. 3 "Menos que nada": implementado y recorrido por interfaz (ruta errores, 59 s, sin errores).
- Cap. 4 "Veces": diseñado (ARITHMOS_DESIGN.md) y con lógica probada (`src/logic/times.js`); escenas pendientes.
- Pruebas: 40 unitarias; `keyboard-check.mjs`; `touch-probe.mjs` (12/12 marcas y 11/11 puntos
  tocados con precisión en 844×390); partidas por interfaz de cada capítulo.
- **Entorno:** la máquina la comparten otras sesiones que corren Chrome (otros worktrees y el
  checkout principal). Las corridas largas y las mediciones de fps varían mucho con esa carga
  (una misma escena tardó 31 s o 15 min); dos revisores se colgaron esperando al navegador.
  No certificar rendimiento medido bajo carga.
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

1. Aplicar los hallazgos de la revisión matemática (caps. 1–3) cuando llegue.
2. Revisión narrativa de los caps. 2 y 3 (y segunda del 1), preferentemente sin navegador o con la máquina libre.
3. Capítulo 4 "Veces": escenas sobre la lógica ya probada.
4. Pasada visual del cap. 3 (línea, pozo) con películas por escena.
