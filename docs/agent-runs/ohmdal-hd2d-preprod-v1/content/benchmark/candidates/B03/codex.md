## Metadatos de ejecución

- `taskId: B03`
- Candidato: Codex, propuesta de contrato de cámara A/B.
- Paquete congelado: commit `89159bc`.
- Modalidad: `read-only`.
- Seed canónica: `ohmdal-hd2d-preprod-v1`.
- Escena: blockout Portal–Plaza–Taller–Puerta–Manantial.
- Escala: metros, eje vertical `Y`, suelo en `Y=0`, maniquí de `1,72 m`.
- Viewports canónicos:
  - Desktop: `1440×900`, DPR `2`.
  - Mobile: `390×844`, DPR `1,5`.
- Estado inicial: tarde, mecanismo apagado.
- Estado secundario: crepúsculo, restauración activa.
- Implementación, capturas, `renderer.info`, frame time y pruebas de disposal: `pendiente`.
- Exclusiones: sin cambios en `/src/jugar/**`, H3, dependencias, assets o integración estable.

## Invariantes compartidos

### Marco espacial y anchors

Cada anchor es un `Object3D` o transformación inmutable, con posición en metros y origen en suelo:

| ID | Función |
|---|---|
| `R0_PORTAL_SPAWN` | Aparición al salir del Portal |
| `R1_PLAZA_ENTRY` | Entrada al plano jugable de Plaza |
| `R2_PLAZA_DIAGONAL` | Final del tramo diagonal |
| `R3_TALLER_THRESHOLD` | Umbral del Taller |
| `R4_LUMEN_STOP` | Detención ante Lumen |
| `R5_FOREGROUND_BYPASS` | Rodeo del oclusor de primer plano |
| `R6_TALLER_MEASURE` | Punto de medición del Taller |
| `R7_DOOR_APPROACH` | Entrada al set Puerta–Manantial |
| `R8_DOOR_MEASURE` | Punto de medición de la Puerta |
| `R9_SPRING_EDGE` | Observación final del Manantial |

Los anchors de cámara definen:

```ts
type CameraAnchor = {
  id: "C1_PORTAL_PLAZA" | "C2_TALLER" | "C3_DOOR_SPRING";
  focus: Vector3;
  forward: Vector3;       // horizontal, normalizado
  targetBounds: Box3;     // coordenadas locales del anchor
  protectedSubjects: string[];
  verticalSpan: { desktop: number; mobile: number };
};
```

`up=(0,1,0)`, `right=normalize(forward×up)` y la dirección desde el objetivo hacia la cámara es común a ambas variantes:

```text
viewOffset = normalize(-0,70·forward + 0,55·right + 0,78·up)
```

Anchors autorales iniciales:

| Cámara | Foco explícito | `targetBounds` local `(right, forward, Y)` | Span desktop/mobile |
|---|---|---|---:|
| `C1_PORTAL_PLAZA` | `lerp(R0_PORTAL_SPAWN,R1_PLAZA_ENTRY,0,58)+(0,0,95,0)` | `[-3,3] × [-3,4] × [0,8,1,8] m` | `13,5 / 20 m` |
| `C2_TALLER` | `R3_TALLER_THRESHOLD+3·forward+(0,1,10,0)` | `[-2,2] × [-2,2] × [0,9,1,6] m` | `9 / 14,5 m` |
| `C3_DOOR_SPRING` | `lerp(R8_DOOR_MEASURE,R9_SPRING_EDGE,0,45)+(0,1,0)` | `[-3,3] × [-2,5,3] × [0,8,1,8] m` | `12 / 18 m` |

Los spans son valores iniciales, no mediciones. Antes del A/B se congelan en un único archivo/configuración compartida y se incluye su hash en toda evidencia.

### Objetivo autoritativo

Existe un solo `desiredLookTarget` por frame, calculado desde sockets de simulación, nunca desde posiciones interpoladas del render:

- Exploración: `0,65·personaje + 0,35·landmark`.
- Taller: `0,35·personaje + 0,35·puntoMedición + 0,30·respuesta`.
- Puerta: `0,30·personaje + 0,35·intervención + 0,35·consecuencia`.

El resultado se limita a `targetBounds`. Si un sujeto protegido sale del rectángulo seguro no se amplía el zoom durante la toma: se corrige el anchor para ambas variantes y se vuelve a congelar el contrato.

Rectángulos seguros:

- Desktop: `x=8–92%`, `y=8–88%`.
- Mobile: `x=8–92%`, `y=8–70%`; el `30%` inferior queda reservado para UI táctil.
- Pies, conectores y puntos de medición no pueden intersectar un rectángulo de control visible.

### Ruta y acciones deterministas

La navegación se resuelve una sola vez a una polilínea métrica serializada. Ambas cámaras reproducen exactamente su mismo hash; no se recalcula pathfinding por variante.

```text
R0 → R1 → R2 → R3 → R4 → R5 → R6 → R7 → R8 → R9
```

Traza canónica:

1. Esperar `1,5 s` en `R0`.
2. Caminar a `2,0 m/s` hasta `R1`.
3. Recorrer el tramo diagonal a `R2`.
4. Girar `135°` y entrar por `R3`.
5. Detenerse `1,0 s` ante Lumen en `R4`.
6. Rodear el foreground por `R5`.
7. Interactuar una vez en `R6`.
8. Avanzar por `R7` y detenerse en `R8`.
9. Interactuar una vez con la Puerta.
10. Activar el estado determinista de restauración.
11. Caminar hasta `R9` y esperar `2,0 s`.

La reproducción usa paso fijo de simulación `1/60 s`. Seed, transformaciones, orientación del sprite, velocidad, pausas, interacciones y tick de restauración son idénticos en A y B. La entrada táctil se registra como intención de mundo e ID de acción, no como coordenadas de pantalla.

### Reglas comunes

- Tres encuadres conectados por volúmenes; no hay órbita libre.
- Zoom accesible limitado a `0,90–1,10` del span autoral.
- El cambio de viewport selecciona un reencuadre explícito; no recorta el canvas desktop.
- `near=0,1 m`, `far=120 m`.
- Posición y objetivo mantienen estados y smoothing independientes.
- Ningún modificador de cámara altera lógica, navegación, seed o acciones.
- No se usa shake durante la prueba canónica.

## Variante A

### Ortográfica inclinada, cuasi-isométrica

- Cámara: `OrthographicCamera`.
- Altura de frustum: el `verticalSpan` del anchor y viewport activos.
- Ancho: `verticalSpan·aspect`.
- Posición:

```text
distance = verticalSpan / (2·tan(14°))
cameraPosition = focus + distance·viewOffset
```

La distancia no modifica la escala ortográfica, pero mantiene rayos, clipping y posición comparables con B.

| Anchor | Distancia desktop | Distancia mobile |
|---|---:|---:|
| `C1_PORTAL_PLAZA` | `27,1 m` | `40,1 m` |
| `C2_TALLER` | `18,0 m` | `29,1 m` |
| `C3_DOOR_SPRING` | `24,1 m` | `36,1 m` |

Objetivo de observación:

- Confirmar legibilidad métrica estable entre planos.
- Revisar si la ausencia de convergencia aplana Portal, Taller o Puerta.
- Detectar sprites que parezcan desacoplados del suelo o props sin jerarquía de profundidad.
- Verificar que foreground y arquitectura no produzcan solapamientos ambiguos.

Todos los resultados: `pendiente`.

## Variante B

### Perspectiva suave de lente larga

- Cámara: `PerspectiveCamera`.
- `fovY=28°`.
- `aspect=viewportWidth/viewportHeight`.
- Posición y distancias: idénticas a la fórmula y tabla de A.
- En el plano del foco autoral, la altura visible coincide con el `verticalSpan` de A.
- No se permite variar FOV por transición ni por velocidad.
- Zoom accesible:
  - `0,90×` span: dolly equivalente, sin cambiar FOV.
  - `1,10×` span: dolly equivalente, sin cambiar FOV.
- El dolly queda limitado al eje `viewOffset`; no expone reversos no producidos.

Objetivo de observación:

- Confirmar que la convergencia aporta profundidad sin deformar escala humana.
- Revisar cambios aparentes de tamaño entre foreground, personaje y landmark.
- Detectar respiración visual al avanzar en profundidad.
- Verificar que el Taller conserve simultáneamente personaje, medición y consecuencia.

Todos los resultados: `pendiente`.

## Transiciones y oclusión

### Volúmenes y transiciones

| Cruce | Volumen | Duración normal | Histeresis |
|---|---|---:|---:|
| `C1 → C2` | Interior del umbral `R3_TALLER_THRESHOLD` | `0,90 s` | `0,75 m` |
| `C2 → C3` | Entrada `R7_DOOR_APPROACH` | `1,10 s` | `0,75 m` |

- La transición comienza sólo al cruzar completamente el plano del volumen.
- La posición usa `smootherstep`; el objetivo usa `smoothstep`.
- No se aceptan reentradas hasta abandonar la banda de histéresis.
- El span interpola entre presets, sin overshoot.
- Después de la transición:
  - Posición: half-life `0,32 s`.
  - Objetivo: half-life `0,16 s`.
- Integración independiente y estable respecto de `dt`:

```text
alpha = 1 - exp(-ln(2)·dt/halfLife)
state = lerp(state, desired, alpha)
```

### Reduced motion

Con `prefers-reduced-motion` o ajuste equivalente:

- No hay viaje animado entre anchors.
- El cambio se aplica en el tick de cruce.
- Posición y objetivo hacen snap al nuevo estado autoral.
- Se deshabilitan look-ahead, dolly expresivo, shake y zoom pulsante.
- Puede usarse un fundido de escena de hasta `100 ms`, sin modificar exposición.
- Las acciones, tiempos de simulación y capturas de estado permanecen comparables.

### Foreground y techos

Sujetos protegidos:

1. pies del personaje, `Y=0,05 m`;
2. torso, `Y=0,95 m`;
3. cabeza, `Y=1,72 m`;
4. socket del punto de medición;
5. socket de consecuencia activa.

Política:

- Raycast desde cámara a los cinco sockets.
- Sólo objetos etiquetados `cameraOccluder` o `cameraRoof` pueden reaccionar.
- Un oclusor entra en fade tras `2` frames consecutivos de bloqueo y se restaura tras `6` frames libres.
- Fade normal: `120 ms` hasta opacidad visual `0,18`; restauración `180 ms`.
- Reduced motion: cambio inmediato.
- Colliders, sombras causales, navegación e interacción no se desactivan.
- No se altera exposición, luz global ni materiales compartidos de otros objetos.
- Los techos se controlan por grupo de habitación; no por distancia arbitraria.
- Objetos estructurales no etiquetados nunca desaparecen globalmente.
- Si más de tres oclusores simultáneos requieren fade durante más de `1 s`, el encuadre se considera fallido y debe corregirse en ambas variantes.

### Táctil

- Movimiento: zona inferior izquierda.
- Acción: zona inferior derecha.
- Pinch de zoom: sólo en el área central superior, excluyendo controles y UI.
- Un toque o arrastre nunca rota la cámara.
- Botón “Reencuadrar”: restaura anchor y zoom autorales.
- `pointercancel`, pérdida de foco, pausa y cambio de orientación cancelan gestos sin dejar estado acumulado.
- Se valida que UI, dedos simulados y safe areas no cubran pies, conectores ni mediciones.

### Disposal

El controlador debe exponer `dispose()` idempotente que:

- elimine listeners de pointer, teclado, resize, visibilidad y media query;
- desconecte `ResizeObserver`;
- cancele transiciones y gestos activos;
- restaure oclusores y techos;
- libere únicamente materiales clonados y render targets propios;
- vacíe referencias a escena, cámara, anchors y sujetos;
- elimine callbacks del loop; no crea un segundo `requestAnimationFrame`;
- no libere geometrías o materiales compartidos que no posea;
- ejecute `renderer.renderLists.dispose()` al desmontar el laboratorio;
- permita diez ciclos mount/unmount sin multiplicar listeners ni objetos registrados.

Resultado del disposal: `pendiente`.

## Matriz de pruebas

### Instrumentación requerida

Cada ejecución debe emitir un sidecar JSON con:

- seed, variante, viewport, DPR, navegador y hash de configuración;
- hash de ruta, tick, waypoint, acción y estado del mecanismo;
- anchor activo, volumen, zoom/span, posición, quaternion y objetivo real/deseado;
- tiempos real y previsto de cada transición;
- NDC y bounding boxes de personaje, landmark, medición y consecuencia;
- intersección de sujetos protegidos con viewport, UI y safe areas;
- oclusor, sockets bloqueados, tiempo de fade y duración total oculto;
- `renderer.info.render.calls`, triángulos, líneas y puntos;
- `renderer.info.memory.geometries` y texturas;
- frame time `p50/p95/p99`, frames mayores a `16,7/33,3 ms` y periodo de muestreo;
- cantidad de listeners/controladores registrados antes y después de disposal;
- errores, warnings y rechazos no controlados de consola;
- estado de reduced motion y clase de entrada usada.

Las métricas se recogen después de `120` frames de estabilización. No se interpreta SwiftShader como evidencia de rendimiento. Toda clave sin observación usa `"pendiente"` o `null`, nunca `0`.

### Capturas canónicas

Convención: `B03-{A|B}-{1440x900|390x844}-{C01..C06}.png`.

| Captura | Estado |
|---|---|
| `C01` | Portal/Plaza, `1,5 s` después de aparición |
| `C02` | Mitad de transición `C1→C2` |
| `C03` | Taller, detenido ante Lumen |
| `C04` | Taller, punto de medición con foreground |
| `C05` | Puerta apagada, antes de la intervención |
| `C06` | Manantial restaurado al crepúsculo |

Cada captura se toma en el mismo tick para A y B, acompañada por sidecar y comparación lado a lado sin reescalado no uniforme.

### Casos

| ID | Viewport/modo | Verificación | A | B |
|---|---|---|---|---|
| `T01` | Ambos viewports | Seed, ruta, acciones, ticks y hashes idénticos | pendiente | pendiente |
| `T02` | Desktop normal | `C01–C06`, composición y escala humana | pendiente | pendiente |
| `T03` | Mobile normal | `C01–C06`, reencuadre y safe areas | pendiente | pendiente |
| `T04` | Ambos | Personaje, objetivo y consecuencia simultáneos en Taller/Puerta | pendiente | pendiente |
| `T05` | Ambos | Giro de `135°`, diagonal y detenciones sin pérdida de intención | pendiente | pendiente |
| `T06` | Ambos | Rodeo `R5`, fade sin popping ni salto de exposición | pendiente | pendiente |
| `T07` | Ambos | Inicio, mitad y fin de transiciones sin overshoot ni ping-pong | pendiente | pendiente |
| `T08` | Ambos | Bounds, esquinas y reversos no producidos | pendiente | pendiente |
| `T09` | Mobile táctil | Movimiento, acción, pinch limitado, cancelación y reencuadre | pendiente | pendiente |
| `T10` | Ambos reduced motion | Cambio de anchor sin viaje, shake o zoom expresivo | pendiente | pendiente |
| `T11` | Ambos | Pausa, pérdida de foco y reanudación sin salto | pendiente | pendiente |
| `T12` | Ambos | Diez mount/unmount; listeners, consola y memoria | pendiente | pendiente |
| `T13` | Desktop | `renderer.info`, frame time y objetivo 60 fps | pendiente | pendiente |
| `T14` | Mobile | `renderer.info`, presupuestos y piso en Android físico | pendiente | pendiente |
| `T15` | Chrome/Edge/Firefox/Safari | Smoke de proyección, resize y controles | pendiente | pendiente |

## Criterio de decisión

Cada criterio se califica `0–5` con captura, sidecar y observación reproducible. Un gate obligatorio fallido no se compensa con promedio.

| Criterio | Gate |
|---|---:|
| Composición/cámara en los tres encuadres | `4` |
| Escala humana y estabilidad aparente | `4` |
| Personaje–objetivo–consecuencia | `4` |
| Navegación y continuidad de transiciones | `4` |
| Oclusión/foreground/techos | `4` |
| Mobile, táctil y reduced motion | `4` |
| Rendimiento desktop medido | `4` |
| Rendimiento mobile medido | `3` |
| Estabilidad y disposal | `4` |

Orden de decisión:

1. Descartar toda variante que falle un gate obligatorio.
2. Entre variantes aprobadas, elegir la de mayor mínimo entre composición, causalidad y navegación.
3. Si empatan, elegir la que necesite menos tiempo acumulado de fade y menos correcciones autorales por viewport.
4. Si persiste el empate, usar menor `p95` de frame time y menor cantidad de draw calls, siempre con medición válida.
5. Si la diferencia está dentro del ruido de medición o falta evidencia obligatoria, registrar `bloqueado`, ejecutar como máximo una corrección común y repetir exactamente el protocolo.
6. No mantener ambas cámaras productivas ni usar el resultado para autorizar H3.

Veredicto actual: `pendiente`.

## Riesgos y autoauditoría

- Los anchors y spans son parámetros iniciales propuestos; todavía no fueron validados contra geometría renderizada.
- Una ortográfica real puede aplanar landmarks y dificultar lectura de profundidad.
- La perspectiva puede introducir cambios aparentes de escala y agrandar demasiado el foreground.
- El formato mobile vertical puede exigir revisar composición del set; no autoriza mover navegación, acciones o geometría sólo para favorecer una variante.
- Fades numerosos pueden ocultar un problema de silueta o layout. El límite de tres evita aprobar por invisibilización.
- Transparencia de oclusores puede aumentar overdraw; su coste está `pendiente`.
- La fórmula iguala el encuadre en el plano focal, no todos los planos de profundidad; esa diferencia es precisamente parte del A/B.
- Los bounds dependen de anchors correctamente ubicados y no sustituyen colliders.
- No se observaron capturas, consola, frame time, `renderer.info`, Android físico ni ciclos de disposal.
- No se afirma que ningún gate haya pasado.
- No se proponen cambios a `/src/jugar/**`, H3, dependencias o archivos de integración.
