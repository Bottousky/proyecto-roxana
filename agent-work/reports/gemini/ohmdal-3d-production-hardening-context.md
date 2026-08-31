# Informe de Contexto: Hardening de Producción Ohmdal 3D

**Destinatario:** Codex (Sol High)

**Origen:** Gemini 3.7 Flash High (Peer de Contexto / Fresh-Eyes Review)

**Carácter:** Independiente, *read-only*, no modificatorio
**Documento base:** `agent-work/tasks/ohmdal-3d-production-hardening.md`

## 1. Límites de arquitectura y hotspots

La experiencia concentra la escena en `playcanvasWorld.ts` (materiales, Plaza, Taller y paisaje de Manantial) y la coordinación en `playcanvasRuntime.ts` (input, movimiento, historia, diálogos, circuito, interacción y hooks). Eso vuelve probable que una zona futura toque internals de Plaza.

Hotspots verificados:

- `playcanvasWorld.ts`: materiales y texturas async; arte/batching de Plaza; Taller interior eager en `x=-60`; montaña/hidroeléctrica en `z=24..49`; retorno plano de más de 25 entidades.
- `playcanvasRuntime.ts`: mezcla controlador, máquina narrativa, diálogo, circuito, interacción y visual harness.
- El batching `OhmdalPlazaStaticArt`, el tratamiento diferenciado de humedad, el viewmodel mobile y el reparenting de `NeedleVisual` son puntos de regresión.

## 2. Extracción mínima H2/H3

Recomendación: módulos explícitos de Plaza, Taller, shell de Manantial y un contrato de zonas ligero, sin ECS, streaming framework ni reescritura. Plaza se activa al arranque; Taller se activa/precarga de forma desacoplada; futuros assets pesados de Manantial quedan detrás de `loadAssets()` y sólo se solicitan cuando el circuito abre Omega o se cruza el umbral norte.

El contrato debe ser determinista y testeable, con identidad de zona, estado cargado/activo y callbacks opcionales de carga/activación. No debe duplicar el harness existente.

## 3. Golden gameplay path y anti-cheating

Cadena observada:

1. Portal arrival.
2. Edda (`intro_portal_edda`).
3. Despertar a Ohm y reacción de Edda.
4. Taller (`workshop_exterior_door`, transición legítima a `x=-60`).
5. Lumen entrega Puente y Cepillo mediante diálogo.
6. Salida legítima del Taller.
7. Cerrar relé/campana, instalar Puente y limpiar óxido.
8. `solveCircuit()` abre Omega.
9. Interactuar con `puerta_ohm`; la transición legítima fija `inside_manantial`.

El test no puede mutar `storyStep`, inventario ni circuito; no puede teletransportar salvo por las puertas player-facing; debe avanzar diálogo y resolver el circuito mediante interacciones; los hooks sólo observan, resetean fixtures deterministas y diagnostican.

## 4. Brechas H7

- Faltan zonas activas/cargadas.
- Faltan conteos de luces y renderers con sombras.
- Renderer/software, transferencias, assets grandes, draw calls y triángulos ya existen.
- Consola/page errors están parcialmente en Playwright; el playtester y manifiesto deben fallar ante errores no permitidos.

## 5. Evidencia exacta para PASS

- H1: decisión repo-native de PlayCanvas Engine v2 + TypeScript + Vite y Blender como DCC master.
- H2: módulos con responsabilidades aisladas y cero regresiones.
- H3: tests de lifecycle y ausencia de requests Manantial pesados al llegar al Portal.
- H4: biblia normativa de materiales/iluminación Stage 5.
- H5: gate ejecutable y reproducible pack aprobado → Blender → GLB → multivista → validación.
- H6: playtester determinista con inputs reales y capturas de fallo.
- H7: diagnósticos extendidos y evidencia contra presupuestos.
- H8: validación mecánica, Visual Harness, GLBs y review final Gemini read-only.

## 6. DO NOT TOUCH

- `state.json` debe seguir `complete`; no reabrir stages.
- No modificar los GLB hero aceptados de Ohm, Galvanoscopio u Omega.
- No modificar tunings/layouts aceptados.
- No contaminar `circuitSolver.ts`, `galvanoscope.ts`, `bitacora.ts` ni `workbench.ts` con renderer.
- Preservar una sola generación de batching tras materiales; humedad localizada; encuadre mobile; jerarquía dinámica de la aguja.

## Routing

El runner repo-native terminó con `agy exited 1` antes de persistir el informe. Sol aplicó el fallback permitido al CLI Antigravity local, manteniendo exactamente `gemini-3.7-flash-high`, `effort high`, modo read-only/sandbox y sin API. Conversation: `e704f166-afab-4902-af41-7b38e42dec3a`.

*Fin del informe de contexto.*
