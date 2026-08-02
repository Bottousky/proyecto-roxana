# Pipeline de assets, procedural e IA

**Estado:** contrato canónico; no autoriza generación, gasto ni integración
**Principio:** elegir la representación por función, cámara, editabilidad y presupuesto. «IA» no
es una categoría de calidad ni una autorización implícita.

## Fronteras

| Familia | Ruta primaria | Ruta alternativa | Evidencia antes de producir |
|---|---|---|---|
| Arquitectura y kits | Blender modular/procedural | `img2threejs` con medidas | planta, escala, cámara y sockets |
| Puertas/mecanismos | procedural/`img2threejs` | CAD si hay función física | estados, pivotes, collider y animación |
| Ohm | procedural 3D A/B sprite | impostor/sprite | cámara real, contacto, actuación y coste |
| Humanos | pixel art direccional | impostor sólo como prueba | silueta, atlas 4/8, pivote de pies y escala |
| Props repetidos | módulos/instancing | asset importado con licencia | densidad y draw calls |
| Orgánico hero | Meshy con aprobación | modelado manual | referencia legal, presupuesto y preview |
| Vegetación | procedural/atlas/instancing | modelos importados | silueta, alpha overdraw y densidad |
| VFX | Three.js/shader/sprite propio | textura generada trazable | función causal y equivalente accesible |
| UI/Bitácora | ilustración/vector/DOM | imagen generada como referencia | legibilidad, derechos y 200% de texto |
| Pieza mecánica imprimible | CAD paramétrico | Meshy sólo carcasa | tolerancias y prueba física separada |

Una región es composición de módulos. Está prohibido generar Plaza, Castillo o academia como una
malla única.

## Estados de asset

`planned → referenced → blockout → shape-approved → material-approved → runtime-candidate →
validated → shipped`.

- `planned`: puede carecer de referencia; no puede generar gasto.
- `referenced`: origen/derechos y exclusiones de IP completos.
- `blockout`: escala, pivote, frente, cámara y collider verificables.
- `shape-approved`: silueta/estructura aprobadas antes de textura.
- `material-approved`: materiales/luz pasan captura real.
- `runtime-candidate`: variante optimizada y manifest completo.
- `validated`: GLB/atlas, rendimiento, accesibilidad y cámara pasan gates.
- `shipped`: hash, licencia, versión y consumidores registrados.

## Manifest obligatorio

Cada asset en `assets/manifests/` declara:

- `asset_id`, familia, función, región, owner y estado;
- fuente runtime y fuente editable separadas;
- método: manual, procedural, importado, IA, sprite, VFX o híbrido;
- referencias, URL/archivo, autor, fecha, derechos, licencia y uso permitido;
- prompt/spec/proveedor/modelo/fecha cuando aplique;
- coste máximo, coste real, créditos/balance y aprobación;
- escala métrica, dimensiones, origen, frente, pivote y unidades;
- collider, sockets, partes móviles y estados;
- cámaras/distancias donde debe funcionar;
- presupuesto desktop/mobile: tris, materiales, texturas, draw calls, peso y memoria;
- LOD/variantes, compresión y fallback;
- criterios visuales, educativos, accesibles y de rendimiento;
- task ID, hashes, capturas, métricas, licencia final y QA.

Un asset sin dato conserva `planned`; no se inventa un valor para pasarlo de estado.

## Referencias y propiedad intelectual

- DRAGON QUEST III HD-2D REMAKE se usa para analizar cualidades, no para extraer assets,
  reconstruir mapas, calcar composición, imitar UI o pedir «hazlo igual» a un generador.
- Cada moodboard separa composición, material, luz, sprite, VFX y audio, y añade referencias
  propias/históricas con licencia.
- Prompts incluyen exclusiones: nombres de franquicia/personajes, logos, UI, música y mapas.
- Una imagen generada para concepto no se presenta como fuente original ni como geometría runtime.
- Retratos de personas reales exigen permiso y alcance de uso.

## Pipeline de arquitectura

1. Brief con función jugable, cámara, footprint, altura y estados.
2. Blockout métrico con maniquí 1,72 m y rutas/colliders.
3. Captura en todas las cámaras obligatorias, desktop/mobile.
4. Despiece modular y declaración de pivotes/sockets.
5. Silueta y jerarquía de interacción.
6. Material/luz compartidos.
7. Variantes de estado y daño causal.
8. Optimización, instancing y LOD si la medición lo justifica.
9. Export GLB, validación, integración aislada y disposal.

## Pipeline de personajes pixel art

1. Hoja de escala/silueta de los cuatro estudiantes y reparto.
2. Paleta y accesorios que no dependan sólo del color.
3. Análisis de footage oficial para orientación observable.
4. A/B 4/8 direcciones con el mismo personaje, recorrido y cámaras.
5. Idle/walk antes de actuación adicional.
6. Pivote de pies, padding, atlas, naming, frame timing y versión.
7. Prueba de billboard, profundidad, oclusión, sombra/contacto y luz.
8. Acciones necesarias por Character Bible.
9. Retrato y sprite comparados.
10. Batch final sólo después del veredicto del slice.

No generar seis apariencias: la decisión canónica es cuatro diseños completos.

## Pipeline de Ohm

Prueba A procedural 3D y prueba B sprite/impostor bajo cámara, escala y presupuesto idénticos.
Puntuar lectura de instrumento, actuación, integración, editabilidad, pivotes, draw calls y memoria.
La variante perdedora se archiva como evidencia; no quedan dos runtimes activos.

## Uso de IA/Meshy

- Máximo tres previews por asset sin nueva autorización.
- Consultar balance y coste antes de un lote; una credencial no autoriza gasto.
- Hero asset requiere aprobación humana antes de texturizar/refinar.
- Meshy se reserva para orgánicos/escultóricos irregulares; no arquitectura, mecanismos o piezas
  con sockets exactos.
- Registrar prompt, proveedor, task ID, fecha, coste, licencia y archivos descargados.
- Si no se puede confirmar derechos, coste o balance, el asset queda `planned`.

Este documento no aprueba ningún uso de Meshy.

## Entrega runtime

- Reutilizar loader GLB/Draco de `src/landing/school3d.ts` antes de añadir otro.
- Separar `source`, `reference` y `runtime`; no mover `assets/school3d/` durante setup.
- Validar GLB con `npm run 3d:validate-glb -- <archivo.glb>`.
- Validar manifests e índice; registrar cinco assets principales por peso.
- No adoptar Draco/Meshopt/KTX2 conjuntamente sin comparación reproducible.
- Empaquetar por región/campaña para PWA; el shell no descarga assets de Ohmdal que no usa.
- Fallback mobile reduce resolución/efectos, no elimina contenido.
- `destroy()` libera geometrías, materiales, texturas, render targets, audio y listeners.

## Gates

1. Referencia y derechos.
2. Escala, cámara y blockout.
3. Silueta/estructura.
4. Material/luz.
5. Jerarquía e interacción.
6. Variantes runtime.
7. Integración en cámara real.
8. Captura, métricas, manifest e índice.

Desktop 1440×900 y mobile 390×844 son evidencia mínima. Un asset no compensa composición o
causalidad deficientes. Forma se valida antes de textura.

## Criterios de rechazo

- silueta genérica o derivativa;
- escala, pivote, frente, collider o derechos ausentes;
- detalle que no sobrevive a cámara real;
- sprite con efecto sticker, snap de orientación u oclusión rota;
- asset que excede presupuesto sin alternativa medida;
- material que vuelve magia una causalidad técnica;
- malla hero monolítica que impide estados, sockets o reutilización;
- output generativo sin prompt, coste, licencia o fuente.

## Archivo y reemplazo

Un asset rechazado se conserva fuera del runtime con motivo y hash si tiene valor de evidencia. No
se versionan cachés, previews redundantes, salidas temporales ni modelos pesados de prueba. Un
reemplazo mantiene `asset_id` si conserva función/contrato; cambia de versión y registra impacto.
