# Toolchain lock 3D

**Fecha de resolución:** 2026-07-28

**Destino:** `.agents/skills/`

| Skill | Origen | Commit | Licencia | Nota |
|---|---|---|---|---|
| `develop-web-game` | `openai/skills`, `skills/.curated/develop-web-game` | `30444aed500c00c85294d12074f6e3ee794f808a` | Apache-2.0 | último commit anterior a su retiro de `main` |
| `img2threejs` | `img2threejs/img2threejs`, raíz | `8b53125081c3798cf95bd517b64be024515a1c8d` | Apache-2.0 | skill 1.5.0, incluye `forge` y `grimoire` |
| `build-hybrid-game-assets` | `MengTo/Skills` | `46abf7860d716c33de8217b6ff9f75debf28afaf` | MIT, © 2026 Meng To | ruta `agent-skills/game-development/` |
| `author-game-levels` | `MengTo/Skills` | `46abf7860d716c33de8217b6ff9f75debf28afaf` | MIT, © 2026 Meng To | idem |
| `build-game-camera-controls` | `MengTo/Skills` | `46abf7860d716c33de8217b6ff9f75debf28afaf` | MIT, © 2026 Meng To | idem |
| `optimize-threejs-games` | `MengTo/Skills` | `46abf7860d716c33de8217b6ff9f75debf28afaf` | MIT, © 2026 Meng To | idem |
| `test-playable-web-games` | `MengTo/Skills` | `46abf7860d716c33de8217b6ff9f75debf28afaf` | MIT, © 2026 Meng To | idem |
| `meshy-3d-generation` | `meshy-dev/meshy-3d-agent` | `b1721fe1391afcb1c2b92789237f5d76e6d7f80a` | MIT, © 2026 Meshy | hardening local: no imprime, lee ni persiste la clave |
| `meshy-3d-printing` | `meshy-dev/meshy-3d-agent` | `b1721fe1391afcb1c2b92789237f5d76e6d7f80a` | MIT, © 2026 Meshy | invocar sólo para producto físico |
| `roxana-3d-director` | este repositorio | rama actual | interna | creada con `skill-creator` |

## MCP fijados

| Servidor | Paquete | Versión resuelta | Licencia |
|---|---|---:|---|
| Playwright | `@playwright/mcp` | `0.0.78` | Apache-2.0 |
| Meshy | `@meshy-ai/meshy-mcp-server` | `0.4.0` | MIT |

## Reproducción

Usar `skill-installer` con `--ref <commit> --dest .agents/skills`. No copiar sólo `SKILL.md`:
`img2threejs` depende de su árbol completo y `develop-web-game` incluye scripts y referencias.

OpenAI eliminó `develop-web-game` de la rama principal en el commit
`11c643813b4645ca9f25d49ca180697732e0141a` del 23 de abril de 2026. La copia queda
deliberadamente fijada; antes de actualizarla se debe elegir y probar un reemplazo.

La copia de `meshy-3d-generation` tiene un parche local deliberado sobre el commit fijado:
los ejemplos upstream que mostraban prefijos, leían `.env` o persistían la clave fueron
reemplazados por detección booleana de la variable. No cambia endpoints ni lógica de assets.

## Descubrimiento

Las diez carpetas contienen `SKILL.md`. Una sesión nueva de Codex debe releer las skills del
repositorio. Si no aparecen, reiniciar Codex desde esta raíz y comprobar el listado de skills.
