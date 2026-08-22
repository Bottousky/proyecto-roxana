# Estado del ecosistema 3D

**Actualizado:** 2026-08-02

**Rama documental:** `codex/ohmdal-hd2d-biblia`

**Base estabilizada:** `c5b6dfc` (descendiente directo de `main`, previo al spike vnext)

## Cierre H1+H2 Ohmdal HD-2D — 2026-08-02

- La investigación de producción desde fuentes oficiales y la auditoría del pipeline quedaron en
  `docs/ohmdal-biblia/15_DQ3_HD2D_RESEARCH_AND_APPLICATION.md`. El Arco I se desglosó en Jira serie
  en `16_ARC1_JIRA_BACKLOG.md`, que queda como enumeración histórica del trabajo del arco. El plan
  vigente es [`../../ROADMAP.md`](../../ROADMAP.md).

- La corrección post-H2 `CAM-FIX-001` quedó implementada y verificada automáticamente: la
  proyección usa el aspect ratio real sin deformar, y el seguimiento jugable incorpora una zona
  muerta antes de mover el encuadre. Hay evidencia 1440×900, 900×900 y 390×844 con consola limpia.
  Falta exclusivamente la aprobación visual humana; no se abrió H3 ni una tercera ronda Evaluador.

- `ohmdal-hd2d-preprod-v1` terminó sus dos rondas automáticas con estado
  `completed-conditional` y veredicto del Director **avanzar**.
- El pipeline promovido para el siguiente contrato es cámara casi ortográfica, estudiante pixel
  art de 4 direcciones y Ohm sprite. Las variantes de 8 direcciones, perspectiva suave y Ohm
  procedural quedan archivadas sólo como evidencia del spike.
- Las seis fichas educativas están en V2 `CANON-EDU`; el harness aislado cubre navegación,
  diagnóstico no bloqueante, teclado/táctil, reducción de movimiento y observabilidad Three.js.
- La segunda evaluación cerró los cuatro P1 de composición, silueta, jerarquía del diagnóstico e
  integración de Ohm. Desktop y mobile emulado pasaron con consola limpia.
- El estado es CONDITIONAL porque Android físico medio de 2022 no fue probado. `npm run verify`
  también permanece `not-run` por falta de una distribución WSL operativa.
- H3 continúa **sin autorización**. El veredicto sólo habilita preparar un contrato separado con
  nueva base, ownership, presupuesto, gates y aprobación humana; no autoriza producirlo.
- `/jugar`, el baseline Phaser, la generación paga y los servicios externos permanecieron intactos.

## Biblia canónica de Ohmdal HD-2D — 2026-08-01

- `docs/ohmdal-biblia/` fue promovida a fuente de verdad para narrativa, educación, mundo,
  dirección visual y contratos de producción de Ohmdal.
- El canon fija habitantes conscientes nacidos en Ohmdal, cuarenta años de desvinculación gradual
  del Instituto y una campaña base gratuita, **La Luz**, antes de expansiones avanzadas.
- **DRAGON QUEST III HD-2D REMAKE** es el norte de coherencia y pulido a menor escala, nunca una
  licencia para copiar propiedad intelectual. El contrato adopta overworld explorable en miniatura,
  dioramas densos Three.js, cámara autoral y personajes pixel art direccionales.
- El futuro vertical slice será un laboratorio Three.js aislado bajo `RuntimeHost`; Phaser vnext
  queda como baseline de causalidad y control. La selección de runtime requiere evidencia y ADR:
  no se autorizó migrar `/jugar`.
- No se generaron assets, no se consumieron servicios pagos y no se amplió el alcance del
  Instituto.
- Las decisiones de canon, protagonista, compañeros, alcance curricular, producto, monetización,
  accesibilidad y quality bar quedaron cerradas en la Biblia. Sólo persisten riesgos verificables.
- El 2026-08-01 se incorporaron como fuente institucional primaria las páginas oficiales del
  Primer Ciclo y Electrónica del Otto Krause y sus programas enlazados de 1.º a 6.º. El plan ya
  está relevado; agentes pueden validarlo con fuentes, cálculos y tests. Se escala únicamente una
  contradicción, un riesgo de seguridad o incertidumbre real.
- Baseline y cierre documental de esta promoción: `npm run build`, `npm test` y
  `npm run 3d:validate-manifests` pasaron el 2026-08-01. `git diff --check` no reportó errores.
  `npm run verify` permanece bloqueado porque este Windows no tiene una distribución WSL
  operativa; no se declara aprobado.

## Vigente

- TypeScript + Vite + Phaser + Three.js y `RuntimeHost` preservados.
- Ohmdal no fue reescrito.
- La landing escolar usa GLB + Draco y expone métricas de renderer.
- La escuela y Electrónica tienen fuentes Blender, GLB y evidencia visual preservada.
- El manifiesto de experiencias del juego todavía mantiene Instituto en `topdown-phaser`.
- No se inició producción artística adicional ni se consumieron servicios generativos.
- La decisión vigente está consolidada en `docs/START_HERE.md`: Instituto Three.js; Ohmdal futuro
  como experiencia HD-2D híbrida bajo demanda; Phaser preservado como base estable; UI/Bitácora en
  DOM y runtimes bajo demanda.

## Deuda y diferencias

1. Los assets activos continúan mezclados en `assets/school3d/`; moverlos rompería imports.
2. Existen usos de `GLTFLoader` en la landing y previews. Extraer un loader compartido sólo con
   pruebas de carga, Draco y disposal.
3. El overview completo supera el objetivo artístico inicial de 180k triángulos, aunque entra en
   el rango desktop general. Falta prueba en Android objetivo.
4. `npm run verify` requiere Bash y no corre en este Windows sin distribución WSL.
5. Los assets
   activos aún necesitan manifiestos reales antes de declararse listos para producción.
6. Las mediciones automatizadas no sustituyen una prueba en el dispositivo físico objetivo.

## Frontera de autorización

El hito Phaser `ohmdal-vnext-spike` conserva sus contratos históricos y su evidencia. La promoción
documental no autoriza ejecutarlo de nuevo ni lo convierte en la dirección final.

La preproducción H1+H2 produjo: fichas educativas V2, blockout Portal–Manantial, comparación A/B de
cámaras, sprites de 4 y 8 direcciones, y Ohm en versión sprite y procedural. La generación paga
tuvieron presupuesto cero. El veredicto fue **avanzar**, condicionado a medir Android físico —que
sigue sin medirse.

El plan de trabajo vigente es [`../../ROADMAP.md`](../../ROADMAP.md).

El slice objetivo sigue siendo **Portal–Plaza–Edda–Ohm–Lumen–Puerta–Manantial**, de 25–35 minutos,
con este alcance máximo:

1. runtime Three.js bajo `RuntimeHost`, sin alterar `/jugar`;
2. overworld mínimo sólo para demostrar entrada a la región;
3. diorama modular denso, cámara casi ortográfica, personajes de cuatro direcciones y Ohm sprite;
4. diagnóstico guiado auténtico de Lumen y transferencia en la Puerta;
5. validación educativa automatizada, desktop y mobile, accesibilidad, consola limpia, métricas
   reales y Android medio de 2022 a 30 fps;
6. veredicto humano: avanzar, corregir una vez o descartar la dirección.

Sigue sin autorizarse producción masiva de assets ni servicios generativos pagos.

**Hecho desde entonces:** el prototipo HD-2D pasó a `src/ohmdal/` y se sirve en `/ohmdal`, con
cámara frontal y post-procesado (bloom, tilt-shift, grado de color). El canon visual del arco vive
en [`../arco1/`](../arco1/). Lo que falta para el slice es arte: la escena son 474 triángulos y cero
texturas.
