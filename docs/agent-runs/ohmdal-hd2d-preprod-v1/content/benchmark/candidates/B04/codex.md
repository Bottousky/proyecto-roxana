## Metadatos de ejecución

- `taskId: B04`
- Modalidad: propuesta documental read-only; no se editaron archivos, generaron imágenes, descargaron frames ni ejecutaron capturas o mediciones.
- Prompt congelado: commit `89159bc`. Baseline productivo contractual: `12d6f88d2a366da89ed91008013f42ba6295e42d`.
- Estado propuesto de ambos assets: `planned`; esta propuesta no afirma resultado alguno del A/B.
- Archivos consultados: `AGENTS.md`, `brief.md`, `visual-contract.md`, `08_VISUAL_DIRECTION_BIBLE.md`, `09_AI_ASSET_PIPELINE.md`, `10_VERTICAL_SLICE.md`, contratos del hito, schema de manifests y plan de benchmark.
- Esfuerzo estimado de integración posterior: 30–45 min, sin incluir dibujo, QA browser-visible ni correcciones.

## Límite legal

La referencia oficial de Dragon Quest III HD-2D sólo se usa para registrar cualidades observables: integración sprite–diorama, lectura de diagonales, oclusión, contraste y cámara. No se extraen, descargan, calcan, trazan ni reutilizan frames, personajes, mapas, UI, paletas, composiciones ni audio.

El personaje provisional será una silueta original, documentada como propiedad del proyecto. Toda observación de la referencia debe ser textual, con URL, fecha, finalidad crítica y exclusión expresa de material runtime protegido. No se usan generadores pagos, Meshy ni créditos API.

## Contrato compartido

| Campo | Fijación común |
|---|---|
| Personaje | Un estudiante provisional original, sin rasgos, atuendo ni composición derivados de franquicias ajenas |
| Unidad y escala | Metros; cuerpo visible de 1,72 m, ancho visual máximo 0,72 m; maniquí de referencia 1,72 m |
| Celda de sprite | 48 × 64 px RGBA; silueta objetivo 22–28 × 42 px; padding transparente obligatorio |
| Pivote de pies | `(24, 60)` en coordenadas de celda con origen arriba-izquierda; coincide con suelo, sombra y cápsula |
| Frente | `+Z` es el frente autoral; el billboard mira a cámara, pero la dirección visual procede del atlas y no de una rotación continua |
| Collider | Cápsula de runtime separada: radio 0,28 m, altura 1,72 m; no se infiere del alpha del sprite |
| Sombra | Blob/contact shadow compartida por escena, fuera del atlas y exactamente igual en 4 y 8 |
| Semilla y ruta | `ohmdal-hd2d-preprod-v1`; Portal → Plaza → acceso Taller → Puerta → Manantial |
| Cámaras | Misma cámara, encuadre y recorrido por variante; desktop 1440×900, DPR ≤2; mobile 390×844, DPR ≤1,5 |
| Escala de pantalla | A cámara aprobada, silueta legible de 42–56 px CSS desktop y 38–52 px CSS mobile; no cambiar la escala entre variantes |
| Punto de medición | `M1`: centro de la cápsula a 0,60 m del ancla de interacción `measurement_point_01`, con pies, instrumento y punto visibles; UI táctil no puede cubrirlos |
| Foreground | Oclusor situado entre cámara y avatar, cubriendo 25–50% del torso. Debe hacer fade sin perder pies, objetivo ni continuidad de exposición |
| Estados del atlas | `idle`, `walk`, `turn_135`, `inspect_lumen`, `measure` |
| Timing | `idle`: 300 ms/frame; `walk`: 100 ms/frame; `turn_135`: 100 ms/frame; `inspect_lumen` y `measure`: 125 ms/frame |
| Acciones obligatorias | Barrido direccional, caminar diagonal, giro de 135°, detenerse ante Lumen, rodear foreground y acercarse/medir en `M1` |

Orden de captura futuro, con carga limpia y estado determinista por variante: `C00` barrido de direcciones; `C01` caminata diagonal; `C02` giro de 135°; `C03` detención ante Lumen; `C04` foreground; `C05` acercamiento y medición M1; `C06` foreground al crepúsculo. Cada captura se repite en desktop y mobile antes de cambiar de variante.

## Variante 4

Direcciones: `N`, `E`, `S`, `W`. El heading de movimiento usa `0° = +Z`, aumentando en sentido horario:

| Dirección | Sector de entrada |
|---|---|
| `N` | 315°–45° |
| `E` | 45°–135° |
| `S` | 135°–225° |
| `W` | 225°–315° |

Atlas propuesto: `960 × 256 px`, cuatro filas direccionales y veinte celdas por fila.

Orden de celdas por fila:

```text
idle_00 idle_01
walk_00 walk_01 walk_02 walk_03 walk_04 walk_05
turn135_00 turn135_01 turn135_02 turn135_03
inspectLumen_00 inspectLumen_01 inspectLumen_02 inspectLumen_03
measure_00 measure_01 measure_02 measure_03
```

El giro de prueba parte de `S (180°)` y recibe destino `NE (45°)`: diferencia angular de 135°. La variante 4 puede resolverlo mediante su transición autoral entre poses cardinales, pero falla si se percibe un salto, deslizamiento lateral falso o pérdida de intención.

## Variante 8

Direcciones: `N`, `NE`, `E`, `SE`, `S`, `SW`, `W`, `NW`.

| Dirección | Sector de entrada |
|---|---|
| `N` | 337,5°–22,5° |
| `NE` | 22,5°–67,5° |
| `E` | 67,5°–112,5° |
| `SE` | 112,5°–157,5° |
| `S` | 157,5°–202,5° |
| `SW` | 202,5°–247,5° |
| `W` | 247,5°–292,5° |
| `NW` | 292,5°–337,5° |

Atlas propuesto: `960 × 512 px`, ocho filas direccionales y el mismo orden de veinte celdas por fila que la variante 4. Conserva celda, pivote, escala, estados, timing, recorrido, cámaras, collider y sombra compartida.

No añade acciones ni detalle visual: sólo multiplica la cobertura direccional para aislar el coste de orientación.

## Manifest propuesto

Se persisten dos manifests independientes, uno por variante: `rx_ohmdal_student_sprite_ab4` y `rx_ohmdal_student_sprite_ab8`. Esta plantilla describe un asset `planned`; las rutas sólo se materializan al producir arte original y deben validarse con el schema canónico.

```json
{
  "id": "rx_ohmdal_student_sprite_ab4",
  "displayName": "Estudiante provisional original — A/B 4 direcciones",
  "world": "ohmdal",
  "category": "sprite",
  "sourceMethod": "sprite",
  "status": "planned",
  "references": [
    "assets/references/ohmdal-hd2d-preprod/student-original-spec.md"
  ],
  "generation": {
    "provider": "none",
    "taskId": "B04",
    "promptFile": "assets/source/ohmdal-hd2d-preprod/student-sprite-b04-spec.md",
    "creditsSpent": 0,
    "generatedAt": "2026-08-02"
  },
  "license": {
    "owner": "Proyecto Roxana",
    "referenceRightsVerified": true,
    "notes": "Diseño provisional original. La referencia oficial sólo puede constar como observación textual; no contiene ni autoriza assets protegidos."
  },
  "scale": {
    "unit": "meter",
    "height": 1.72,
    "humanRatio": 1
  },
  "frontAxis": "+Z",
  "pivot": "bottom-center",
  "collider": {
    "type": "capsule",
    "radius": 0.28,
    "height": 1.72
  },
  "sockets": [
    "feet_anchor",
    "hand_instrument"
  ],
  "runtime": {
    "desktop": {
      "path": "assets/runtime/ohmdal-hd2d-preprod/student-sprite-ab4.png",
      "maxTriangles": 2,
      "maxTexture": 1024,
      "maxMaterials": 1,
      "maxDrawCalls": 1
    },
    "mobile": {
      "path": "assets/runtime/ohmdal-hd2d-preprod/student-sprite-ab4.png",
      "maxTriangles": 2,
      "maxTexture": 1024,
      "maxMaterials": 1,
      "maxDrawCalls": 1
    }
  },
  "notes": "B04. Atlas 960x256; 4 direcciones; 20 celdas por dirección; transferencia máxima prescrita 256 KiB; memoria RGBA calculada máxima 0,94 MiB; una sola variante activa."
}
```

Para `ab8` cambian únicamente `id`, `displayName`, rutas runtime y `notes`: atlas `960×512`, ocho direcciones y memoria RGBA calculada máxima `1,88 MiB`. Ambos manifests deben añadir, antes de `runtime-candidate`, hash, captura, métricas medidas, QA, fecha real de producción y licencia final.

## Matriz de observación

| ID | Estado/acción | Dirección o trayectoria | Encuadre | Evidencia requerida | Rechazo |
|---|---|---|---|---|---|
| C00 | `idle` y `walk` | Todas las direcciones de la variante | Plaza | Cada celda existe, pivote estable y orientación inequívoca | Celda faltante, eje invertido o pies flotando |
| C01 | `walk` | Diagonal `SW` y diagonal opuesta `NE` | Portal–Plaza | Trayectoria, piernas y heading se perciben coherentes | Moonwalk, deriva lateral o snap visible |
| C02 | `turn_135` | `S → NE` | Plaza | Giro legible sin cambiar posición de pies | Salto perceptible, giro contrario o deslizamiento |
| C03 | `walk → idle → inspect_lumen` | Aproximación frontal a Lumen | Acceso Taller | Detención, mirada/intención y contacto con suelo | Idle orientado de forma errónea o pérdida de intención |
| C04 | `walk` | Rodeo diagonal de foreground | Plaza/Taller | Fade del oclusor, personaje y objetivo siguen legibles | Sticker, clipping, exposición abrupta o pies ocultos |
| C05 | `walk → measure` | Entrada a `M1` | Punto de medición | Pies, instrumento, `M1` y consecuencia comparten cuadro | UI tapa información, collider no coincide o no se lee acción |
| C06 | `idle` y `walk` | Misma situación que C04 | Crepúsculo | Orientación y contacto sobreviven al contraste secundario | Dirección ilegible o sombra/contacto desaparece |

Cada celda de la matriz se observa en ambos viewports y en ambas variantes bajo el mismo seed, cámara, estado del mecanismo y escala. La evaluación exige captura lado a lado, consola, `renderer.info`, peso transferido y frame time reales; esos datos quedan pendientes de implementación y no se infieren de esta propuesta.

## Decisión y descarte

La regla es binaria:

```text
Elegir 4 direcciones ⇔ C00–C06 pasan en desktop y mobile,
con todos los gates obligatorios ≥4/5 y sin snap, moonwalk,
pérdida de intención, fallo de foreground ni atlas fuera de presupuesto.

En cualquier otro caso, elegir 8 direcciones.
```

Si 8 tampoco pasa todos los casos obligatorios, el resultado es `blocked`: no se declara ganador ni se abre una tercera variante sin decisión humana.

La variante perdedora cambia a `archived` o `rejected`, se elimina de la carga runtime y se conserva sólo como evidencia con hash, capturas y motivo. No quedan ambos atlas activos en el slice.

| Presupuesto comparable | 4 direcciones | 8 direcciones |
|---|---:|---:|
| Celdas | 80 | 160 |
| Tamaño de atlas | 960×256 | 960×512 |
| Memoria RGBA calculada, no medida | 0,94 MiB | 1,88 MiB |
| Lado máximo de textura | 1024 px | 1024 px |
| Transferencia máxima prescrita | 256 KiB | 256 KiB |
| Sprite activo | 2 tris, 1 material, ≤1 draw call | 2 tris, 1 material, ≤1 draw call |
| Variantes activas simultáneas | 1 | 1 |

## Riesgos y autoauditoría

- El presupuesto de transferencia y la memoria descrita son límites de diseño; no son mediciones.
- La variante 4 puede fallar previsiblemente en diagonales o giro de 135°; el protocolo no fuerza su elección por ahorrar atlas.
- El punto `M1`, el oclusor y las cámaras deben vincularse al blockout integrado sin invadir la frontera de Arquitectura.
- Cualquier cambio de escala, pivote, timing, sombra, cámara o acción entre variantes invalida el A/B.
- Si el arte final no es inequívocamente original o no hay trazabilidad de derechos, ambos manifests permanecen `planned`.
- Antes de integrar: validar manifests, ejecutar build/tests aplicables y registrar capturas desktop/mobile, consola, peso, `renderer.info` y frame time. Ninguna de esas comprobaciones fue ejecutada en esta propuesta.
- No se propone Meshy, generación paga, dependencia nueva, modificación de `/jugar` ni uso de material protegido.
