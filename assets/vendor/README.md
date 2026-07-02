# Biblioteca externa de arte — Ohmdal

Recursos descargados el 2026-07-02 como material de producción y referencia. Todos los
packs seleccionados declaran licencia **CC0 / dominio público** y permiten modificación y
uso comercial. No contienen material extraído de Final Fantasy ni de otros juegos.

Los archivos todavía no están conectados al runtime. Deben pasar primero por adaptación de
paleta, escala y silueta para que Ohmdal conserve una identidad visual coherente.

## Packs

### Tiny RPG — Forest

- Autor: Luis Zuno / Ansimuz
- Fuente: https://opengameart.org/node/81239
- Licencia: CC0 / dominio público; el texto original está en `tiny-rpg-forest/LICENSE.txt`.
- Conservado: tileset, objetos y hojas de caminar/idle del héroe.
- Uso sugerido: árboles, cercas, terreno y animación de agua como base técnica para Ohmdal.
- Nota: se excluyeron música, demo, PSD y metadatos de macOS. La música tenía una licencia
  de atribución separada y no forma parte de esta biblioteca.

### Mushroom Village 16 px

- Autora: NettySvit
- Fuente: https://opengameart.org/content/mushroom-village-tileset
- Licencia: CC0; incluida por la autora en
  `mushroom-village/files/MushroomVillage_16px/0_license_CC0.txt`.
- Uso sugerido: mobiliario, vegetación, agua, piedra y módulos de interiores.
- Nota de arte: su paleta es más luminosa y fantástica; conviene recolorear antes de usar.

### Mythical Ruins

- Autor: voec
- Fuente: https://opengameart.org/content/mythical-ruins-tileset
- Licencia: CC0.
- Uso sugerido: referencia y piezas de ruina para el Castillo de Ohmdal.
- Nota de arte: trabaja a 32×32 y con una perspectiva distinta; no mezclar sin adaptación.

### RPG Sprite — 8 directions

- Autor: TheNess
- Fuente: https://opengameart.org/content/rpg-sprite-8-direction-human-male-16x16
- Licencia: CC0.
- Uso sugerido: plantilla de ciclos de marcha en ocho direcciones, no personaje final.

### Versatile 255-Tile Pixel Art Pack

- Autor: wareya
- Fuente: https://opengameart.org/content/versatile-255-tile-pixel-art-pack
- Licencia: CC0.
- Uso sugerido: prototipado de interiores, caminos, agua, árboles, objetos y UI.
- Nota de arte: es la hoja más amplia y modular del lote; buena candidata para un primer
  reemplazo de los props procedurales, después de recolorear a cobre/índigo/teal.

## Criterio de integración

1. Mantener una cuadrícula base única de 16×16, renderizada a 3× o 4× sin suavizado.
2. Crear derivados propios bajo `assets/ohmdal/`; no editar directamente `assets/vendor/`.
3. Unificar todos los derivados con la paleta de Ohmdal: índigo, cobre envejecido, oro cálido,
   verde musgo y chispa turquesa.
4. Probar primero una sola sala vertical: Plaza de Ohmdal. Si la mezcla funciona, extender
   por zona; si no, los packs siguen siendo referencia y no deuda técnica.
5. Aunque CC0 no exige crédito, mantener los autores en los créditos finales por cortesía.
