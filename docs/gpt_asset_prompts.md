# Prompts GPT — vertical slice de Ohmdal

**Estado:** el vertical slice (`src/ohmdal/`) NO necesita ningún asset de GPT para ser jugable.
Todo el arte se resolvió por el orden pedido: assets existentes (retratos del proyecto) +
generación procedural (`scripts/generate-ohmdal-assets.mjs` → `assets/ohmdal/generated/`).

Los prompts de abajo son **upgrades opcionales** de calidad para una próxima iteración, no
bloqueantes. Formato listo para pegar. (Para el enfoque "vestir el greybox procedural" existe
otra lista, más amplia, en `docs/assets-faltantes-ohmdal.md`.)

---

## UPGRADE 1 — Héroe pixel de 4 direcciones más expresivo

ASSET FALTANTE:
Nombre del asset: `hero_v2` (reemplaza `assets/ohmdal/generated/hero.png`)

USO EN EL JUEGO:
Dónde aparece: personaje jugable en las 6 salas del Arco 1.
Qué función cumple: avatar del estudiante que llega por el portal.
Decorativo o interactivo: interactivo (protagonista).

PROMPT PARA GPT:
> Sprite sheet pixel art 16-bit estilo JRPG GBA de un estudiante adolescente: abrigo teal con
> ribetes de cobre, bufanda crema, cabello castaño rojizo, bolso. Vista top-down. Cuatro
> direcciones (sur, oeste, este, norte), 4 cuadros de caminata por dirección, cuadro de 16×24 px,
> grilla 4 columnas × 4 filas (fila = dirección en ese orden). Contorno legible, sin armas,
> fondo croma #ff00ff.

PARÁMETROS RECOMENDADOS:
Formato: PNG · Resolución: 64×96 (16×24 por cuadro) · Fondo: croma #ff00ff · Variantes: 1 hoja.
Notas de exportación: quitar croma, alinear pies a una línea de suelo común, nearest-neighbor.

POSTPROCESAMIENTO NECESARIO:
- limpiar fondo croma; separar frames; ajustar escala a 16×24; registrar en `data/asset_manifest.json`.
- BootScene ya carga `hero` como spritesheet 16×24, 4 filas: reemplazar el archivo alcanza.

---

## UPGRADE 2 — Tileset de terreno con más variedad

ASSET FALTANTE:
Nombre del asset: `tiles_v2` (reemplaza `assets/ohmdal/generated/tiles16.png`)

USO EN EL JUEGO:
Dónde aparece: suelo de las 6 salas (pasto, sendero, piedra interior, agua, muro, ruina, runa, seto, vacío).
Qué función cumple: base caminable + colisión (índices fijos).
Decorativo o interactivo: decorativo, con colisión derivada por índice.

PROMPT PARA GPT:
> Tileset top-down pixel art 16-bit, tiles de 16×16 px en una tira horizontal de 10 cuadros,
> EN ESTE ORDEN EXACTO: 0 pasto, 1 pasto con flores, 2 sendero de tierra, 3 piso de piedra
> interior, 4 agua, 5 muro de piedra (bloqueo), 6 piso de ruina agrietado, 7 losa rúnica con
> glow turquesa, 8 seto/arbusto (bloqueo), 9 vacío/negro. Paleta medieval cálida + acentos
> turquesa (la "magia" eléctrica). Tiles que teselan sin costura. Fondo transparente.

PARÁMETROS RECOMENDADOS:
Formato: PNG · Resolución: 160×16 · Fondo: transparente · Variantes: 1 tira.
Notas de exportación: mantener el ORDEN de índices (el mapa y la colisión dependen de él).

POSTPROCESAMIENTO NECESARIO:
- verificar teselado; conservar orden de frames; registrar en manifest. BootScene lo carga como
  spritesheet 16×16 y `SOLID_TILES` = {4,5,8,9} en `config.ts`: si cambia el orden, actualizar ese set.

---

## UPGRADE 3 — Props "eléctricos" con estado apagado/encendido pintado a mano

Los nodos, lámparas, llaves, conductos, puerta y portal hoy son formas blancas tintadas en
runtime (teal = encendido, gris = apagado). Un artista puede reemplazar cada PNG de
`assets/ohmdal/generated/` por versiones pintadas manteniendo el MISMO tamaño y nombre; el juego
las toma sin tocar código. Prioridad visual: `node`, `lamp`, `portal`, `door` (son las piezas
héroe del slice).
