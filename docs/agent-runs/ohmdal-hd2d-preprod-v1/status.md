# Estado — Ohmdal HD-2D preproducción v1

**Fase:** H1+H2 cerrados

**Estado:** `completed-conditional`

**Veredicto del Director:** `avanzar`

**Ejecución autorizada:** agotada; comprendía H1+H2 y la corrección post-H2 `CAM-FIX-001`

**Rondas automáticas usadas:** 2/2

**Base común:** `12d6f88d2a366da89ed91008013f42ba6295e42d`

**Commit corregido evaluado:** `fd38f292ef93e9fc0f891e1cf1eedec6ecc35afc`

**Evaluación final integrada:** `e8f7bac` (origen Evaluador `ffc61b4`)

**Bloqueo vigente:** H3, Meshy, generación paga y `src/jugar/**`

## Corrección de cámara CAM-FIX-001

- Implementación y tests de Arquitectura: `e8faf3e`, integrado como `ade81bf`.
- Conexión del resize real y seguimiento con zona muerta: `0e39d06`.
- Capturas reproducibles: 1440×900, 900×900 y 390×844 en
  `evidence/camera-correction/`; consola Chrome con 0 errores y 0 warnings.
- `npm run build`, `npm test`, `npm run 3d:validate-manifests` y `git diff --check`: PASS.
- Estado: `implemented-awaiting-human-review`. No consume una tercera ronda automática y no abre H3.

## Resultado

- Las seis fichas educativas quedaron en V2 `CANON-EDU`, con 30 campos, fuentes primarias,
  límites didácticos explícitos y tests deterministas.
- El harness aislado demuestra Portal–Plaza–Taller–Puerta/Manantial con navegación plana,
  teclado, táctil, reducción de movimiento y diagnóstico no bloqueante.
- La selección promovida es cámara **casi ortográfica**, estudiante **4 direcciones** y Ohm
  **sprite**. Las alternativas siguen archivadas sólo como evidencia.
- Los cuatro P1 de la primera evaluación fueron corregidos y pasaron la segunda evaluación en
  desktop y mobile emulado.
- No hubo cambios en `src/jugar/**`, migración de runtime, Meshy ni consumo de generación paga.

## Tareas

| ID | Estado | Commit(s) |
|---|---|---|
| DIR-001 | COMPLETED | `16df1b5` |
| DIR-EDU-001 | COMPLETED | `585c302`, `697d23d`, `42c1262`, `64e0b92` |
| ARCH-001 | COMPLETED | `b4b15cf`, `f89b75b`, `12f2210` |
| ASSET-001 | COMPLETED | `1908e67`, `6d3a905` |
| DIR-INT-001 | COMPLETED | `64e0b92`, `697d23d`, `3b9f98a`, `fd38f29` |
| EVAL-001 R1 | COMPLETED — corregir una vez | `329c927` integrado como `f601eec` |
| EVAL-001 R2 | COMPLETED — CONDITIONAL/avanzar | `ffc61b4` integrado como `e8f7bac` |
| DIR-VERDICT-001 | COMPLETED — avanzar | este cierre documental |

## Evidencia final

- Desktop 1440×900: 60 fps smoke, 17 draw calls, 412 triángulos, 28 geometrías y 3 texturas.
- Mobile emulado 390×844: ~59,994 fps smoke, 18 draw calls, 388 triángulos, 28 geometrías y
  3 texturas; prueba táctil PASS.
- Chrome/Playwright: 0 errores y 0 warnings en desktop y mobile.
- Capturas y SHA-256: `review-round-02.md`; métricas observadas: `performance.json`.
- Android físico medio de 2022: `not-run`. Por ello el estado es CONDITIONAL y no PASS total.

## Gates

- `npm run build`: PASS, 185 módulos.
- `npm test`: PASS.
- `npm run 3d:validate-manifests`: PASS.
- `git diff --check`: PASS.
- `npm run verify`: no ejecutado; Windows no tiene una distribución WSL operativa. No se
  declara PASS.

## Frontera posterior

El veredicto favorable permite **proponer** el contrato H3, pero no lo autoriza. Comenzar el
vertical slice requiere un nuevo `tasks.json`, `executionAuthorized: true`, base común, ownership,
presupuesto y autorización explícita del usuario. La medición en Android físico debe formar parte
de sus gates antes de afirmar el piso de 30 fps.
