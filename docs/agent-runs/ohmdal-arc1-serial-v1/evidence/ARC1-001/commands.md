# ARC1-001 — Comandos y resultados

**Fecha:** 2026-08-02
**Base:** `73fecae` (`codex/ohmdal-arc1-control-plane`)
**Árbol de trabajo:** limpio salvo `docs/agent-runs/ohmdal-arco1/` (no rastreado, propiedad del usuario,
no incorporado).

## Gates automáticos

| Comando | Resultado |
|---|---|
| `npm run build` | PASS — `✓ built in 7.48s` |
| `npm test` | PASS — `ℹ fail 0` |
| `npm run 3d:validate-manifests` | PASS — 5 manifests OK |
| `git diff --check` | PASS |

`npm run verify` continúa `not-run`: `bash scripts/verificar-hito.sh` depende de WSL y esta máquina
no tiene distribución instalada. No se declara PASS.

## Harness en vivo

- Servidor: `npm run dev -- --port 5199 --strictPort` (5173 estaba ocupado por otro proceso).
- Ruta: `http://localhost:5199/labs/ohmdal-hd2d-preprod/`.
- Consola: 0 errores, 0 warnings (sólo mensajes de conexión de Vite).
- `window.render_game_to_text()` responde: `camera: quasi-orthographic`, `directionVariant: 4`,
  `ohmVariant: sprite`, `zone: portal_plaza`, `occlusion.blockedIds: []`.

Las capturas en vivo no se pudieron tomar: el panel del navegador no estaba desplegado y la página
no compone frames. Se usó la evidencia ya versionada en
`docs/agent-runs/ohmdal-hd2d-preprod-v1/evidence/camera-correction/`, que es la que el ticket cita.

## Medición determinista de la cámara

Ejecutada contra los módulos reales `camera/cameraController.ts` y `camera/cameraConfig.ts`, sin
modificar el repositorio. Resultados en `metrics.json`.

### P1 — Proporciones al redimensionar

| Viewport | Alto visible | Ancho visible | Aspect mundo | Aspect pantalla | Distorsión |
|---|---:|---:|---:|---:|---:|
| 1440×900 | 13.50 m | 21.60 m | 1.6000 | 1.6000 | 0.0e+0 |
| 900×900 | 13.50 m | 13.50 m | 1.0000 | 1.0000 | 0.0e+0 |
| 1920×1080 | 13.50 m | 24.00 m | 1.7778 | 1.7778 | 0.0e+0 |
| 1280×720 | 13.50 m | 24.00 m | 1.7778 | 1.7778 | 0.0e+0 |
| 640×900 | 13.50 m | 9.60 m | 0.7111 | 0.7111 | 0.0e+0 |

El alto visible no depende del resize; sólo cambia el ancho. Recorta, no estira.

### P2 — Zona muerta, eje por eje

Semiejes para alto visible 13.5 m: lateral ±2.16 m, profundidad ±1.35 m, vertical ±0.54 m.

| Eje | 50 % | 90 % | 100 % | +0.20 m | +1.00 m |
|---|---|---|---|---|---|
| lateral (`CAMERA_RIGHT`) | quieta | quieta | quieta | corrige 0.200 m | corrige 1.000 m |
| profundidad (`anchor.forward`) | quieta | quieta | quieta | corrige 0.200 m | corrige 1.000 m |

La corrección iguala exactamente el excedente: deja al sujeto sobre el borde, sin overshoot.

### P3 — Anclajes C1/C2/C3 e histéresis

| Umbral | x | Histéresis | Duración | Cambios con jitter ±0.30 m |
|---|---:|---:|---:|---:|
| C1→C2 | −3.0 m | 0.75 m | 0.90 s | 1 (el cruce) + 0 extra |
| C2→C3 | 9.5 m | 0.75 m | 1.10 s | 1 (el cruce) + 0 extra |

Salida hacia atrás: sin cambio a −0.50, −0.74 y −0.75 m relativos; cambia recién a −0.76 m. La
histéresis absorbe el temblor sobre el umbral.

### P4 — Perfiles

| Perfil | C1 | C2 | C3 |
|---|---|---|---|
| desktop-1440x900 | 13.5 × 21.6 m | 9.0 × 14.4 m | 12.0 × 19.2 m |
| mobile-390x844 | 20.0 × 9.2 m | 14.5 × 6.7 m | 18.0 × 8.3 m |

Mobile amplía el alto visible en lugar de estirar; desktop angosto recorta a los lados.

## Nota metodológica

Las dos primeras versiones de las sondas P2 y P3 tenían defectos de diseño de la prueba —P2 movía el
sujeto sobre el eje Z asumiendo que correspondía a `forward`, cuando `CAMERA_RIGHT` es `(0,0,−1)`;
P3 aplicaba el jitter sobre el umbral C1→C2 mientras la máquina de estados ya estaba en C3—. Se
corrigieron antes de informar. Las tablas de arriba son de la corrida corregida.

## `renderer.info` en la evidencia visual

| Captura | Llamadas | Triángulos |
|---|---:|---:|
| 1440×900 | 13 | 150 |
| 900×900 | 12 | 138 |
| 390×844 | 8 | 90 |

El culling acompaña al recorte horizontal.
