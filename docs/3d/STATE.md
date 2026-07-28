# Estado del ecosistema 3D

**Actualizado:** 2026-07-28

**Rama:** `codex/setup-ecosistema-3d`

**Base elegida:** commit `2a9aea6` de `feature/school-voxel`, por autorización del Director.

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
- No se inició producción artística adicional durante este setup.

## Deuda y diferencias

1. La landing 3D preservada es hoy la vista predeterminada; vuelve a la anterior con
   `?view=classic`. Esto difiere del gate histórico `?school3d=1`.
2. Los assets activos continúan mezclados en `assets/school3d/`; moverlos rompería imports.
3. Existen usos de `GLTFLoader` en la landing y previews. Extraer un loader compartido sólo con
   pruebas de carga, Draco y disposal.
4. El overview completo supera el objetivo artístico inicial de 180k triángulos, aunque entra en
   el rango desktop general. Falta prueba en Android objetivo.
5. `npm run verify` requiere Bash y no corre en este Windows sin distribución WSL.
6. Meshy no tiene credencial disponible; balance y generación quedan pendientes.
7. Playwright y Meshy MCP requieren fusionar `.codex/config.toml.example` en la configuración
   activa y reiniciar Codex para descubrimiento completo.
8. Los perfiles multiagente y `AGENTS.md` también requieren una tarea nueva o reinicio para
   garantizar redescubrimiento.

## Próximo hito permitido

M4 — Laboratorio visual del hall:

1. aprobar o ajustar `docs/agent-runs/instituto-hall-v1/brief.md`;
2. confirmar la ruta propuesta `/labs/instituto-hall` y su gate sin afectar `/jugar`;
3. fijar cámara, seed, estado y commit base común;
4. cambiar `executionAuthorized` sólo con aprobación explícita;
5. ejecutar Arquitectura y Asset Forge en fronteras/worktrees separados;
6. integrar, exportar `renderer.info` y capturar desktop/mobile;
7. aprobar composición y escala antes de producir más ambientes.
