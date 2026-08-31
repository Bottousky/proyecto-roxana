---
name: ohmdal-graphics-quality
description: Elevar y revisar la calidad visual de Ohmdal 3D en PlayCanvas usando sourcing curado, principios de technical art, visual harness y QA reproducible sin introducir Three.js como runtime.
---

# Ohmdal Graphics Quality

Usar sólo para art pass, lighting/material pass, asset integration, visual QA o claims `premium/AAA-like`.

Leer:

1. `AGENTS.md`
2. `docs/20-worlds/ohmdal/AGENTS.md`
3. `docs/20-worlds/ohmdal/production/OHMDAL_PLAZA_ART_PASS_01.md` si la tarea es la Plaza
4. `docs/3d/VISUAL_HARNESS.md`

## Regla central

```text
authored forms
  → materials
  → lighting/exposure
  → effects
  → measure
  → critic
  → fix
```

No maquillar blockout con glow, bloom, fog u oscuridad.

## Runtime

- Ohmdal usa **PlayCanvas** en esta rama.
- Three.js puede aportar algoritmos/checklists/authoring, nunca se agrega como dependencia de Ohmdal por esta skill.
- Cargar solamente la skill oficial de PlayCanvas necesaria (`inspect-glb`, `calibrate-model`, `assemble-scene`, `light-scene`, `add-effects`, etc.).

## Asset sourcing

Orden obligatorio:

1. catálogo curado CC0 de la Plaza;
2. Blender/procedural para gramática propia simple;
3. Meshy para hero assets si existe crédito/API aprobados;
4. Tripo sólo como A/B/fallback o cuando segmentación/retopo/batch compre valor.

No generar con IA un asset genérico que ya exista en la cantera CC0.

## Referencias Three útiles on-demand

No instalar los routers. Consultar sólo el archivo/skill que cambie la tarea:

- `scottstts/Threejs-Awesome-Graphics-Agent-Skills`: materials, architecture, vegetation, water optics, exposure/color grading, visual validation.
- `majidmanzarpour/threejs-game-skills`: technical-art, visual scorecard, QA/harness, asset sourcing gates.

Traducir mecanismo y parámetros a PlayCanvas/Blender.

## Gates visuales

Antes de cerrar:

- captura `active-play-desktop`;
- captura `active-play-mobile` si mobile está en scope;
- al menos una vista `no-post`;
- vistas canónicas afectadas por el cambio;
- consola/page errors revisados;
- renderer diagnostics registrados;
- scorecard de `docs/3d/VISUAL_HARNESS.md`;
- fresh-eyes review o revisión adversarial.

Automatic fail si la escena sigue dominada por primitivas, si glow/fog esconden falta de authored geometry, si un hero asset no fue calibrado o si performance se juzga sólo por sensación.

## Reporte

Entregar: assets/fuentes usados, cambios visibles, capturas, diagnostics, scorecard, automatic failures restantes y próximo pass exacto. No declarar `AAA-like` si queda un gate bloqueante.
