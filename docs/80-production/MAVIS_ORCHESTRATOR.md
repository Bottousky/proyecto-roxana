# Orquestador histórico

El despacho automático de Mavis está **desactivado** en
`agent-work/orchestrator/config.json` desde la limpieza de septiembre de 2026.
Las etapas y ramas anteriores se retiraron; sus commits siguen en Git.

Se conservan los runners para uso explícito. `npm run orchestrator:status` informa
el estado y los launchers deben terminar sin llamar proveedores si `enabled` no
es `true`. Una reactivación requiere configurar un encargo vigente y workers reales;
no reutilices defaults de las etapas antiguas.

Para el desarrollo actual sigue [AGENTS.md](../../AGENTS.md). No es necesario
activar un daemon para implementar, probar o revisar un cambio.
