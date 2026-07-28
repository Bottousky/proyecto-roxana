---
name: roxana-3d-director
description: Orquesta tareas de producción 3D, assets, escenas, rendimiento, QA visual e impresión de Proyecto Roxana. Usar antes de img2threejs, Meshy, author-game-levels, build-hybrid-game-assets u optimize-threejs-games para elegir el pipeline, exigir manifiestos y frenar por coste, referencias, derechos, estabilidad o presupuesto.
---

# Roxana 3D Director

## Reunir la entrada

Antes de producir, registrar:

- objetivo jugable o narrativo;
- experiencia, cámara y distancia de observación;
- referencias disponibles y derechos;
- plataforma objetivo;
- presupuesto visual y de rendimiento;
- destino web, impresión o ambos.

Si falta un dato, conservar el asset como `planned`; no iniciar generación paga.

## Clasificar y enrutar

Leer [asset-routing.md](references/asset-routing.md) y elegir una ruta:

- arquitectura, módulo, hard-surface, mecanismo, pivotes o sockets: procedural o `img2threejs`;
- orgánico, escultórico o hero irregular: Meshy;
- personaje con cámara fija: comparar sprite con GLB;
- pieza funcional imprimible: CAD; Meshy sólo carcasa o concepto;
- escena completa: composición modular, nunca una malla generada única.

Invocar sólo las skills necesarias. No ejecutar generadores solapados sin una hipótesis A/B,
presupuesto y criterio de elección.

## Exigir el contrato

Antes de generar o integrar, crear o actualizar un manifiesto en `assets/manifests/` con:

- función, método y estado;
- referencias, derechos, licencia y origen;
- escala, frente, pivote, collider y sockets;
- presupuesto desktop/mobile;
- proveedor, prompt/spec, fecha, coste máximo y task ID cuando aplique;
- criterios visuales y de rendimiento.

Validar el archivo con:

```bash
node .agents/skills/roxana-3d-director/scripts/validate-manifest.mjs <manifest.json>
```

## Producir por gates

Leer [quality-gates.md](references/quality-gates.md). Ejecutar en este orden:

1. referencia y derechos;
2. escala, cámara y blockout;
3. silueta y estructura;
4. material y luz;
5. jerarquía de interacción;
6. variantes runtime;
7. integración en cámara real;
8. captura, métricas y registro.

Revisar forma antes de textura. No declarar `continue` en `img2threejs` sin sus artefactos
de assessment, spec, diagnóstico y comparación. No texturizar/refinar un hero asset de Meshy
sin aprobación humana.

## Medir y registrar

Leer [performance-budgets.md](references/performance-budgets.md). Medir desktop y mobile,
capturar `renderer.info`, consola, peso transferido y assets principales. Actualizar:

- manifiesto e índice;
- coste, task ID y hashes;
- capturas y métricas;
- `docs/3d/STATE.md`;
- riesgo o deuda si una variante aún comparte asset.

## Frenar

Detenerse y pedir una decisión cuando:

- falta una vista necesaria o los derechos no están claros;
- el asset excede coste o presupuesto;
- la pieza necesita ingeniería mecánica;
- una corrección sustancial no mejora el resultado;
- Meshy no puede informar balance antes de un lote;
- el runtime estable, Ohmdal o el comportamiento sin gate quedarían comprometidos.

Un freno no convierte la tarea en aprobada. Registrar qué falta y el siguiente paso exacto.
