# Ohmdal Plaza — adquisición e integración de assets genéricos

**Rama:** `explore/ohmdal-3D`  
**Catálogo machine-readable:** [`OHMDAL_PLAZA_ASSET_CATALOG.json`](OHMDAL_PLAZA_ASSET_CATALOG.json)  
**Objetivo:** que un agente pueda adquirir assets concretos, descargarlos a staging, seleccionar sólo lo útil, normalizarlo e integrarlo sin una búsqueda abierta de asset stores.

## Contrato

No se pide “buscar assets medievales”. Se ejecuta una lista curada. Si un asset listado ya no existe, cambió de licencia o falla visual/performance, recién entonces se busca un reemplazo y se documenta.

Genérico sí: pavimento, mampostería, revoque, madera, hierro secundario, paredes/techos modulares, barriles, cajas, bancos, herramientas, rocas, arbustos, pasto y vegetación de borde.

Genérico no: Ohm, pedestal, Galvanoscopio, Gran Puerta Ω, Portal, relés/mecanismos que enseñan electricidad y la gramática visual de conductores/aisladores. Esos elementos hacen reconocible a Ohmdal y se producen como assets propios.

## 1. Batch P0 — materiales de la Plaza

Poly Haven es la fuente primaria porque los assets son CC0 y su API pública entrega URLs, hashes y tamaños. El script local usa `GET /files/{id}`, un User-Agent identificable y guarda los crudos en `assets/source/vendor/polyhaven/`, que ya está fuera de Git.

Primero resolver sin descargar:

```bash
npm run 3d:fetch-polyhaven -- cobblestone_floor_001 --resolution 2k --maps diff,nor_gl,rough --dry-run
npm run 3d:fetch-polyhaven -- mossy_cobblestone --resolution 2k --maps diff,nor_gl,rough,ao --dry-run
npm run 3d:fetch-polyhaven -- stone_tile_wall --resolution 2k --maps diff,nor_gl,rough,ao --dry-run
npm run 3d:fetch-polyhaven -- medieval_wood --resolution 2k --maps diff,nor_gl,rough,ao --dry-run
```

Si la selección es correcta, repetir sin `--dry-run`. Para el primer art pass descargar exactamente:

| Slot | Asset ID | Fuente | Uso en Plaza | Runtime |
|---|---|---|---|---|
| piso principal | `cobblestone_floor_001` | https://polyhaven.com/a/cobblestone_floor_001 | 50–65% del suelo caminable | 1K |
| borde húmedo | `mossy_cobblestone` | https://polyhaven.com/a/mossy_cobblestone | juntas, desagües, pie de muros | 1K |
| piedra primaria | `stone_tile_wall` | https://polyhaven.com/a/stone_tile_wall | muros, arcos, contención | 1K |
| piedra vieja | `stone_wall_05` | https://polyhaven.com/a/stone_wall_05 | sectores antiguos/secundarios | 1K |
| revoque gastado | `medieval_wall_01` | https://polyhaven.com/a/medieval_wall_01 | Taller y caras protegidas | 1K |
| madera gastada | `medieval_wood` | https://polyhaven.com/a/medieval_wood | puertas, banco, contraventanas, carros | 1K |
| hierro envejecido | `rusty_metal_04` | https://polyhaven.com/a/rusty_metal_04 | bisagras, ménsulas, rejas, herramientas | 1K |

Comandos restantes:

```bash
npm run 3d:fetch-polyhaven -- stone_wall_05 --resolution 2k --maps diff,nor_gl,rough,ao
npm run 3d:fetch-polyhaven -- medieval_wall_01 --resolution 2k --maps diff,nor_gl,rough,ao
npm run 3d:fetch-polyhaven -- rusty_metal_04 --resolution 2k --maps diff,nor_gl,rough,metal
```

No descargar 4K/8K por reflejo. Para genéricos se parte de 2K de fuente y se promueve normalmente 1K al runtime. El displacement no se embarca por defecto: normal/roughness resuelven microdetalle y sólo la silueta importante merece geometría.

### Cobre de Ohmdal

No usar un acero oxidado teñido de verde como “cobre”. Crear una vez un material compartido `roxana-ohmdal-copper-aged-v1`: cobre metálico cálido como base y verdín localizado como capa de oxidación rugosa/no-metálica. El cobre sólo emite cuando una condición eléctrica real lo justifique; el material base no brilla.

## 2. Batch P0 — arquitectura modular

### Quaternius · Medieval Village MegaKit

- página canónica: https://quaternius.com/packs/medievalvillagemegakit.html
- descarga free/Standard: https://quaternius.itch.io/medieval-village-megakit
- licencia: CC0
- formatos publicados: glTF, FBX, OBJ; el autor indica que el Standard gratuito contiene aproximadamente 60–70% del pack.

Descargar el Standard gratuito a:

```text
assets/source/vendor/quaternius/medieval-village-megakit/
```

Luego inventariar, no importar a ciegas:

```bash
npm run 3d:inventory-pack -- assets/source/vendor/quaternius/medieval-village-megakit --contains wall,floor,stair,roof,door,window,arch,vine
```

Seleccionar como máximo 12 piezas para la prueba: muro recto, esquina, arco/abertura, escalera, 1–2 techos, puerta, ventana y 1–2 variantes de enredadera/trim. Preferir glTF. El pack compra velocidad y proporciones; no debe definir por sí solo la identidad visual del primer plano.

## 3. Batch P0 — props que hacen que el lugar parezca habitado

### Quaternius · Fantasy Props MegaKit

- página canónica: https://quaternius.com/packs/fantasypropsmegakit.html
- descarga free/Standard: https://quaternius.itch.io/fantasy-props-megakit
- licencia: CC0
- más de 200 props; el autor declara low-poly y cuatro sets de texturas compartidos para el pack completo.

Staging:

```text
assets/source/vendor/quaternius/fantasy-props-megakit/
```

Inventario:

```bash
npm run 3d:inventory-pack -- assets/source/vendor/quaternius/fantasy-props-megakit --contains barrel,crate,box,bench,stool,table,candle,lantern,hammer,tool,book,cart,market
```

Para la Plaza integrar **8–16 props**, agrupados por función, no por azar. Ejemplo de dressing objetivo: 2–3 contenedores cerca del Taller; banco/mesa o carro; 2–4 herramientas; libros/papeles en zona protegida; 1–2 elementos de luz no eléctrica; una pequeña familia de cajas/barriles repetidos por instancing. Desaturar/retexturizar donde haga falta para piedra taupe, madera umber y metales apagados.

## 4. Batch P1 — naturaleza y bordes

### Quaternius · Stylized Nature MegaKit

- página: https://quaternius.com/packs/stylizednaturemegakit.html
- descarga: https://quaternius.itch.io/stylized-nature-megakit
- licencia: CC0
- 116 modelos publicados: 40 árboles, 35 plantas/flores, 27 rocas y otros elementos.

Staging e inventario:

```text
assets/source/vendor/quaternius/stylized-nature-megakit/
```

```bash
npm run 3d:inventory-pack -- assets/source/vendor/quaternius/stylized-nature-megakit --contains rock,bush,grass,plant,tree
```

Primera selección: 3 rocas, 2 arbustos/plantas, una familia de pasto y como máximo 2 siluetas de árbol. Instanciar repetidos y bajar saturación de verdes. La Plaza central no es un jardín; la vegetación debe explicar abandono, humedad y bordes, no tapar circulación o landmarks.

## 5. Batch P2 — ruina controlada y blockout de respaldo

Sólo si el art pass lo necesita:

- Quaternius Ultimate Modular Ruins Pack — https://quaternius.com/packs/ultimatemodularruins.html — CC0, 90 modelos. Usar fragmentos puntuales de columna/muro/rubble; Ohmdal está detenido y olvidado, no destruido.
- Kenney Castle Kit — https://kenney.nl/assets/castle-kit — CC0, 75 archivos. Blockout/métricas.
- Kenney Fantasy Town Kit — https://kenney.nl/assets/fantasy-town-kit — CC0, 160 archivos. Proporciones urbanas/blockout.
- Kenney Prototype Kit — https://kenney.nl/assets/prototype-kit — CC0, 145 archivos. Debug de escala/circulación.

Kenney no es el look final. Si una pieza sobrevive, debe pasar la misma revisión de materialidad, escala, silhouette y cámara que cualquier otro asset.

## 6. De pack descargado a GLB de Ohmdal

Para cada pieza seleccionada:

```text
vendor pack (ignored)
  → seleccionar UNA pieza usada
  → Blender: metros / +Y / frente +Z / pivot al suelo
  → renombrar jerarquía y eliminar geometría/materiales inútiles
  → material Ohmdal o vendor material aprobado
  → collider simple si interactúa con navegación
  → export GLB
  → inspect-glb
  → calibrate-model
  → npm run 3d:validate-glb -- <glb>
  → integrar
  → captura desktop 1440×900 + mobile 390×844
  → medir
```

Destino recomendado:

```text
assets/runtime/ohmdal/plaza/
  modules/
  props/
  nature/
  materials/
```

No copiar el ZIP, `.blend` maestro del proveedor ni 300 modelos al runtime. El runtime sólo recibe derivados que la Plaza consume.

## 7. Política de selección visual

Antes de integrar, clasificar cada candidato como:

- **foreground**: está cerca de cámara o comunica gameplay → requiere adaptación fuerte o asset propio;
- **midground**: compra lectura/vida → vendor asset adaptado aceptable;
- **background**: silueta/masa → vendor asset casi directo aceptable si no rompe estilo.

Una Plaza “cara” no sale de tener muchos assets. Sale de composición, materiales consistentes, variación controlada, contacto con el suelo, sombras buenas, desgaste motivado, pequeños clusters funcionales y 3–5 elementos identitarios excelentes.

## 8. Qué debe hacer el agente en una corrida de ambientación

1. Leer `OHMDAL_PLAZA_ASSET_CATALOG.json` y no ampliar fuentes por iniciativa propia.
2. Ejecutar `--dry-run` de los materiales P0 y confirmar que el API resuelve mapas 2K.
3. Descargar los 4 materiales P0 iniciales.
4. Descargar sólo Standard/free de Medieval Village y Fantasy Props; extraer a `assets/source/vendor/...`.
5. Generar inventarios con `3d:inventory-pack` y guardar la selección concreta en su reporte de trabajo.
6. Construir/importar máximo 12 módulos + 16 props; nada de naturaleza todavía si arquitectura/materiales no pasaron revisión.
7. Normalizar y validar GLB; reutilizar materiales e instancing.
8. Integrar a Plaza sin cambiar gameplay, lore o puzzles.
9. Capturar desktop/mobile y medir antes/después.
10. Sólo después abrir Batch P1 de naturaleza y, más tarde, hero assets.

El agente debe reportar para cada asset sobreviviente: URL exacta, proveedor, licencia vista en la fecha de descarga, nombre original, archivo seleccionado, cambios aplicados, ruta runtime y coste de triángulos/materiales/texturas.
