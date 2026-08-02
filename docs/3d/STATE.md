# Estado del ecosistema 3D

**Actualizado:** 2026-08-01

**Rama documental:** `codex/ohmdal-hd2d-biblia`

**Base estabilizada:** `c5b6dfc` (descendiente directo de `main`, previo al spike vnext)

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
- El sistema multiagente de Fase 1 está versionado en `.codex/agents/` y
  `docs/agent-runs/`: Director/integrador, Arquitectura, Asset Forge y Evaluador.
- `.codex/config.toml` limita a tres subagentes simultáneos y los contratos fijan dos rondas
  automáticas como máximo.
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

El próximo hito a autorizar es el vertical slice **Portal–Plaza–Edda–Ohm–Lumen–Puerta–Manantial**
de 25–35 minutos. Antes de producir requiere `docs/agent-runs/<hito>/tasks.json` con
`executionAuthorized: true`, commit base, ownership y contratos. Su alcance máximo es:

1. laboratorio Three.js aislado bajo `RuntimeHost`, sin alterar `/jugar`;
2. overworld mínimo sólo para demostrar entrada a la región;
3. diorama modular denso, cámara autoral y A/B de personajes 4/8 direcciones;
4. diagnóstico guiado auténtico de Lumen y transferencia en la Puerta;
5. validación educativa automatizada, Playwright desktop/mobile, accesibilidad, navegadores
   recientes, consola, métricas reales y Android medio de 2022 a 30 fps;
6. máximo dos rondas, con veredicto avanzar, corregir una vez o descartar dirección.

El hito `instituto-hall-v1` continúa como borrador con `executionAuthorized: false`. «La escuela
recuerda» queda postergado hasta el veredicto del slice de Ohmdal. No se autoriza Meshy, producción
masiva de assets, migración del runtime ni servicios generativos pagos.
