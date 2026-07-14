# Sistema de arte de Ohmdal v1

**Estado:** contrato de producción para salas raster del Arco I. Complementa la grilla, la
dirección ambiental y los prompts; cuando un documento anterior contradiga este flujo,
prevalece este documento.

## Evaluación

La dirección visual actual es adecuada: el pixel art detallado, la piedra oscura, el cobre y
la restauración por luz le dan a Ohmdal identidad propia. Las mejores imágenes también
traducen bien el contenido narrativo en arquitectura. El problema no es la herramienta de
generación sino pedirle en una sola pasada que invente concepto, cámara, geometría jugable,
salidas y acabado final.

Los riesgos observados en el piloto son:

- cámara y escala aparente variables entre salas;
- zonas caminables definidas después de pintar, en vez de protegidas antes;
- documentos que todavía piden costura de bordes aunque el runtime usa transiciones;
- props finales con lienzos de máster muy grandes y mucho margen transparente;
- validación visual y técnica manual, sin un gate repetible.

## Decisión: pipeline híbrido, no generación libre de fondos finales

Imagegen sigue siendo útil para dirección, materiales, atmósfera, piezas héroe e integración.
La geometría jugable se bloquea antes con una guía de composición. Para cada sala:

1. Ejecutar `generate_room_art_guides.mjs` para extraer de `roomScenesData.ts` el rectángulo
   caminable, colisiones, entradas, interacción principal y reservas para NPC.
2. Preparar una guía 960×540 simple: caminable en blanco, sólido en negro, salidas en azul,
   pieza héroe en naranja y reservas de NPC/UI en magenta.
3. Generar o editar usando la guía como **referencia de composición**, no como imagen a
   reinterpretar libremente. La dirección ambiental fija hora, luz y paisaje.
4. Hacer una prueba a baja fidelidad. Primero se aprueban cámara, escala, silueta del piso y
   salidas; después se pide detalle final.
5. Derivar piezas duras y estados desde la base aprobada. No regenerar estados desde cero.
6. Normalizar, montar en una escena de prueba con protagonista/NPC y validar al 100% y 25%.

Esto conserva la riqueza generativa y vuelve deterministas las partes que afectan gameplay.

## Resolución y densidad visual

- `960×540` se conserva como viewport lógico, coordenadas de gameplay y archivo final.
- La resolución artística de salas pasa a ser `480×270`, ampliada exactamente 2× con vecino
  más cercano. Así cada píxel artístico ocupa un bloque 2×2 estable.
- El tile aparente sigue siendo 48 px en el viewport (24 px en el máster virtual). No hace
  falta migrar colisiones ni posiciones existentes.
- Un humano final de 64×96 se diseña como silueta de aproximadamente 32×48 en el máster
  virtual y se amplía 2×. Puertas, muebles y mecanismos usan esa figura como escala.
- El límite recomendado es 256 colores por fondo. La paleta local debe concentrarse en
  32–64 colores dominantes y reservar los acentos más brillantes para estados del motor.

`960×540` no provoca la sobrecarga: la provocan el microdetalle de un píxel lógico, la cámara
demasiado lejana y la falta de jerarquía. La grilla virtual reduce esos tres problemas sin
cambiar el runtime.

## Contrato de prompt por entregable

Todo prompt debe usar líneas breves y declarar:

```text
Use case: stylized-concept | precise-object-edit | background-extraction
Asset type: Ohmdal room base | integrated architecture | runtime prop | baked state
Input images: Image 1: composition guide; Image 2: approved style anchor; ...
Spatial contract: tipo espacial; cámara; piso caminable; salidas; reservas; pieza héroe
Environment: hora; luz natural; horizonte/contexto; emoción narrativa
Electrical state: qué está apagado; qué agregará el motor
Style: pixel art RPG 16-bit, cenital 3/4, tile aparente 48 px
Scale: humano 64×96 final; puertas y mecanismos proporcionados a esa silueta
Density: superficies amplias y simples; detalle solo en pieza héroe y bordes; sin ruido uniforme
Constraints: invariantes y elementos prohibidos
```

Para una edición, repetir siempre: `cambiar solo X; conservar guía, cámara, piso caminable,
salidas, escala, paleta y luz`. Las referencias se enumeran por rol; no se dice simplemente
“usar estas imágenes”.

## Clasificación obligatoria

| Clase | Qué contiene | Producción |
|---|---|---|
| `base` | arquitectura estática y ambiente apagado | guía + ancla, sin props removibles |
| `hard-integrated` | arco, reja, puerta o mecanismo que cambia oclusión/contacto | edición de la base |
| `detachable` | NPC, mueble u objeto reutilizable | croma + alfa + recorte + tamaño runtime |
| `engine-state` | glow, agua, haz, partículas, pulso | Phaser/CSS; no hornear |
| `baked-state` | cambio real de geometría u oclusión | variante de la integrada aprobada |

Un prop usado solo para componer puede conservar un máster grande en `_sources/`. Un prop
cargado por Phaser debe estar recortado, tener pivote documentado y exportarse cerca del
tamaño máximo real de pantalla (normalmente 1× o 2×, no el lienzo completo de imagegen).

## Orden del lote

Trabajar en lotes de 3–4 salas y respetar estos gates:

1. canon y contratos espaciales completos;
2. bases de todo el lote aprobadas juntas;
3. props aislados;
4. integraciones duras;
5. estados horneados;
6. normalización y validación;
7. prueba en Phaser con overlays de walkable/collision;
8. aprobación del Director antes de manifest o reemplazo.

No generar un lote completo antes de aprobar la composición de una sala exterior, una
interior y una semicubierta representativas.

## Transparencia y tamaño

Los props opacos simples se generan sobre croma plano y se procesan con el helper instalado
de imagegen. Después se recortan con margen controlado y se conservan dos archivos cuando
corresponda:

- `_sources/prop_<id>-chroma.png`: fuente/máster;
- `prop_<id>.png`: alfa real, recortado y dimensionado para integración o runtime.

Vidrio, humo, pelo, reflejos o materiales translúcidos requieren una decisión específica;
no se debe fingir transparencia compleja con un recorte defectuoso.

## Gate técnico

```powershell
node --experimental-strip-types scripts/generate_room_art_guides.mjs
python scripts/normalize_chunk.py <fuente> <destino>
python scripts/validate_room_assets.py assets/ohmdal/rooms/pilot-arco1 --style-gate
```

El generador produce un PNG y un JSON por sala en `output/art-guides/`. El normalizador
recorta pequeñas desviaciones de 16:9, reduce a 480×270, limita la paleta y amplía por vecino
más cercano sin deformar. El validador exige chunks 960×540 y alfa real en props; con
`--style-gate` también detecta fondos que no respetan los bloques 2×2. `--strict` convierte
las advertencias en errores para assets que vayan a runtime.

## Uso obligatorio de imagegen en estos chats

Las imágenes nuevas y las ediciones artísticas se producen con la llamada integrada de
imagegen dentro del chat. Los scripts locales solo generan guías geométricas, retiran croma,
recortan, reducen, limitan paleta y validan; no inventan ni pintan contenido artístico. Los
props que carga Phaser se derivan con `scripts/prepare_runtime_prop.py` al tamaño real de
pantalla y el máster de imagegen se conserva intacto. Cada entrega debe registrar el prompt
final, el rol de cada imagen adjunta y la ruta del resultado.

La validación automática no reemplaza estas comprobaciones: salidas correctas, protagonista
apoyado sobre el piso, pieza héroe legible al 25%, ausencia de texto/watermark y coherencia
de cámara al recorrer tres salas consecutivas.
