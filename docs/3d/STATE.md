# Estado del ecosistema 3D

**Actualizado:** 2026-07-30

**Rama:** `main`

**Base auditada:** `064801c` (`main`, cinco commits por delante de `origin/main` al iniciar).

## Vigente

- TypeScript + Vite + Phaser + Three.js y `RuntimeHost` preservados.
- Ohmdal no fue reescrito.
- La landing escolar 3D es la vista predeterminada, usa GLB + Draco y expone métricas y estado
  legible para pruebas mediante `render_game_to_text`.
- La portada clásica continúa disponible con `?view=classic`; ambos caminos se cargan ahora de
  forma excluyente y bajo demanda.
- La escuela y Electrónica tienen fuentes Blender, GLB y evidencia visual preservada.
- El manifiesto de experiencias del juego todavía mantiene Instituto en `topdown-phaser`.
- El sistema multiagente de Fase 1 está versionado en `.codex/agents/` y
  `docs/agent-runs/`: Director/integrador, Arquitectura, Asset Forge y Evaluador.
- `.codex/config.toml` limita a tres subagentes simultáneos y los contratos fijan dos rondas
  automáticas como máximo.
- No se inició producción artística adicional ni se consumieron servicios generativos.
- La decisión vigente está consolidada en `docs/START_HERE.md`: Instituto Three.js; Ohmdal
  top-down en rediseño con Phaser como candidato, no como obligación; UI/Bitácora en DOM y
  runtimes bajo demanda.
- Baseline del 30 de julio: `npm run build` y `npm test` pasan; los GLB activos de Instituto y
  estatua pasan el validador genérico y los GLTF históricos pasan el validador escolar.
- La limpieza retiró netos 815,09 MiB del workspace a un archivo externo recuperable. Diecisiete
  assets de runtimes históricos que estaban ignorados por error se conservaron y ahora pueden
  versionarse; el build final no tiene referencias de assets ausentes.
- En navegador headless, la vista general registró 66 draw calls y 286.002 triángulos en desktop,
  y 50 draw calls y 285.986 triángulos en mobile, sin errores de consola. El FPS de SwiftShader
  no representa hardware real y no se usa como aprobación de rendimiento.

## Deuda y diferencias

1. La landing 3D preservada es hoy la vista predeterminada; vuelve a la anterior con
   `?view=classic`. Esto difiere del gate histórico `?school3d=1`.
2. Los assets activos continúan mezclados en `assets/school3d/`; moverlos rompería imports.
3. Existen usos de `GLTFLoader` en la landing y previews. Extraer un loader compartido sólo con
   pruebas de carga, Draco y disposal.
4. El overview completo supera el objetivo artístico inicial de 180k triángulos y queda en el
   borde superior del presupuesto mobile. Falta prueba en Android físico objetivo.
5. `npm run verify` requiere Bash y no corre en este Windows sin distribución WSL.
6. `npm run 3d:validate-manifests` pasa, pero hoy sólo valida el manifiesto de ejemplo: los assets
   activos aún necesitan manifiestos reales antes de declararse listos para producción.
7. Los FPS automatizados históricos y los de esta auditoría no sustituyen una medición física.
8. La configuración del servidor MCP de documentación oficial de OpenAI fue agregada; Codex debe
   reiniciarse para que esta sesión descubra sus herramientas.
9. La historia Git ocupa aproximadamente 848 MiB. Reducirla exigiría una auditoría y posible
   reescritura de historia separada; no forma parte de esta limpieza.

## Próximo hito autorizado

Spike — «Ohmdal mundo vivo»:

1. ruta aislada `/labs/ohmdal-vnext`, sin alterar `/jugar`;
2. región top-down continua mayor que varias pantallas;
3. Plaza, Taller, río y Puerta como geografía orgánica, no chunks fijos;
4. un puzzle eléctrico resuelto dentro del escenario, sin banco modal obligatorio;
5. validación determinista, Playwright desktop/mobile, consola y Android físico.

El hito `instituto-hall-v1` continúa como borrador con `executionAuthorized: false`. «La escuela
recuerda» queda postergado hasta el veredicto del spike de Ohmdal. No se autoriza Meshy ni
producción masiva de assets.
