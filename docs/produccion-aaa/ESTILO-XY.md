# Estilo X e Y · prototipo en la Plaza (ciclo 27, 12 oct 2026)

El usuario encontró la estética que quiere para Ohmdal: **Pokémon X e Y** tal como se ve en un
emulador con shaders. Decidió:
- probar primero en la Plaza;
- cámara más cercana, como en X e Y;
- decidir los personajes (modelos 3D o sprites) después de ver el prototipo.

## Cómo verlo

`npm run dev` y abrir:
- `http://127.0.0.1:4190/?estilo=xy`: mundo X e Y, personajes con sus sprites.
- `http://127.0.0.1:4190/?estilo=xy&gente=3d`: además, el viajero en 3D.
- `?estilo=hd2d`: vuelve al estilo actual. La elección se recuerda en el navegador.

Capturas de comparación en [estilo-xy/](estilo-xy/). `scripts/qa-style.mjs` saca el mismo lugar y el mismo punto en los tres modos, en plano general y de
cerca.

## Qué cambia (`src/style.js`)

| | HD-2D (actual) | X e Y (prototipo) |
|---|---|---|
| Cámara | Lente larga, inclinación 26°, lejos | Más cerca (distancia 0,52) e inclinación 40° |
| Luz | Lambert con sombras suaves | Dos tonos (cel): luz y sombra, la sombra al 38 % |
| Contorno | Ninguno | Tinta por saltos de profundidad, del color de abajo pero más oscuro y frío; se apaga a lo lejos |
| Desenfoque de maqueta | Sí | No |
| Color | Contenido, viñeta marcada | Limpio y saturado, sol casi blanco, cielo y ambiente azulados |
| Superficies | Pixel art 128 px, filtrado nítido | Pintadas a mano, 512 px, filtrado suave (`public/assets/xy`) |
| Plantas y árboles | Pixel art | Pintados, mismas celdas y orden (`plants-xy.json`) |
| Lugar olvidado | Paja y oliva grisáceos | Dorado otoñal: conserva el color |

Arte: se generó con image_gen de Codex (`art-src/xy/generate*.sh`, con el prompt en cada `.txt`), y se
procesó con `scripts/xy-textures.mjs` (bordes continuos y saturación) y `scripts/xy-plants.mjs`
(recortes, sangrado de color y recuadros). El viajero 3D se arma en Blender
(`scripts/blender/chibi.py`) con piezas simples y se anima por partes en el juego (`updateFigure`):
piernas y brazos con la fase de la caminata, respiración en reposo y giro hacia donde camina.

## Lo que falta para todo el reino

- **Personajes:** decidir si son modelos 3D o sprites. El viajero 3D es un primer boceto: cabeza
  grande, abrigo, bufanda y bolso, sin cara trabajada ni pelo con rulos marcados. Hacer los 17
  personajes en 3D es el trabajo más grande. Los sprites actuales también quedan bien sobre el
  mundo nuevo.
- **Cámara por lugar:** la cámara cercana sirve en la Plaza. Hay que revisar en cada lugar qué tapa al
  jugador (el monte, los muros del Castillo, las Terrazas) y el encuadre de las escenas.
- **Interiores, agua, cielo y noche:** se ajustaron por la paleta, sin trabajo propio.
- **Peso:** 7,9 MB de PNG. Para entregar hay que pasarlos a WebP.
- **Interfaz:** sigue con su tono actual (verde petróleo y dorado). Se podría acercar a la de X e Y.
