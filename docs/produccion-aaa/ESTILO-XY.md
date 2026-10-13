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

## El viajero en 3D (ciclo 28)

El usuario pidió más calidad que el primer muñeco hecho con piezas geométricas. Ahora se arma así:

1. **Referencias** (`art-src/xy/viajero/generate.sh`, image_gen de Codex con la hoja HD-2D adjunta):
   el viajero de frente en pose A y una hoja de giro con frente, perfil y espalda.
2. **Forma** (`scripts/ia3d/forma.py`): Hunyuan3D-2mv, de Tencent, a partir de las tres vistas, en la
   GPU de la Mac (MPS). Tarda unos 17 minutos y da 305 mil caras. El entorno vive fuera del
   repositorio, en `~/code/ohmdal-3d`, con Python 3.11, PyTorch, `transformers` 4.46.3 y `diffusers`
   0.31.0 (las versiones nuevas rompen la carga). **Licencia:** Tencent Hunyuan Community; no vale en
   la Unión Europea, el Reino Unido ni Corea del Sur.
3. **Textura y esqueleto** (`scripts/blender/viajero-3d.py`):
   - normaliza la malla a 2 m y la simplifica a 16 mil caras;
   - le arma las UV;
   - hornea la textura proyectando las tres vistas, cada punto desde la que lo ve de frente y sin
     tapar (un rayo por vértice);
   - le pone un esqueleto de 12 huesos con pesos automáticos.
4. **En el juego** (`src/style.js`, `attachFigure` y `skinnedPose`): se mueve hueso por hueso con la
   fase de la caminata. Las piernas dan zancadas con flexión de rodilla, los brazos se balancean y la
   cabeza mira apenas hacia arriba. La cabeza va un 22 % más grande, que es la proporción de X e Y y
   además deja ver la cara desde la cámara alta. La luz ambiente y la base de color van atenuadas,
   porque la textura ya trae su luz pintada.

Para comparar (`scripts/qa-style.mjs` saca las cuatro):
- `?estilo=xy`: el sprite de siempre sobre el mundo nuevo;
- `?estilo=xy&gente=dibujo`: la hoja de sprites redibujada (opción 2);
- `?estilo=xy&gente=3d`: el viajero 3D (opción 1);
- `?estilo=xy&gente=3d&figura=bloques`: el muñeco anterior.

Pendientes del 3D:
- las puntas de los dedos salen con color de abrigo;
- una mancha marrón donde la correa cruza el pecho;
- falta una caminata más rica: la bufanda no flamea.

## Pelo y piel editables (para más adelante)

Conviene prepararlo ahora y construirlo más adelante. Al hornear la textura del 3D se saca también
una máscara de pelo y de piel, y un shader cambia el tono dentro de la máscara y conserva la luz
pintada. Solo para el viajero, con 6 u 8 colores elegidos a mano en la pantalla donde se pide el
nombre, y guardado en el registro del Instituto. Con sprites también se puede, pero hay que hacer
una máscara para cada uno de los 20 cuadros.

## Maestro, regiones, apariencia y kit de impresión (ciclo 28)

El usuario quiere más adelante productos físicos: figuras impresas en 3D, en una granja propia o de un
tercero, con colores de ropa, pelo y piel elegidos por cada uno. Por eso cada personaje se prepara
desde ya para tres destinos con un mismo modelo:

| Destino | Qué usa |
|---|---|
| El juego | Modelo de 16 mil caras, textura, mapa de regiones y esqueleto (`public/assets/xy/viajero-*`) |
| La personalización | El mapa de regiones y las paletas de `APPEARANCE` en `src/style.js` |
| La impresión | El maestro de 305 mil caras, separado en piezas por región (`~/code/ohmdal-3d/<personaje>/out/kit`) |

Cómo se hace:
1. **Maestro:** `viajero-3d.py` exporta la forma normalizada (2 m, pies en el suelo, frente a −Y)
   antes de simplificarla: `<personaje>-maestro.glb`.
2. **Regiones:** `regiones.py`. A cada cara del maestro le pone el color de las vistas, con
   oclusión. Con `explorar` agrupa los colores y deja un informe y una vista previa. Con `asignar`
   aplica la configuración del personaje (`personajes/<personaje>.json`): cada región con colores de
   muestra, una franja de alturas y cajas que deciden por forma (las manos debajo de los puños son
   piel). Al final limpia puntos sueltos por mayoría de vecinos.
3. **Juego:** `viajero-3d.py`, con `REGIONES=…npy`, pasa la región de cada cara del maestro al
   modelo del juego y hornea `<personaje>-regiones.png`. El shader de la figura tiñe cada región
   elegida conservando la luz pintada. La piel siempre se pinta desde su color de muestra, lo que
   además corrige las puntas de los dedos.
4. **Kit:** `kit.py` escala la figura a 90 mm y exporta una pieza STL por región, más el personaje
   entero en OBJ con un material por región, que Bambu Studio y PrusaSlicer asignan a filamentos.
   Hay un resumen en `kits/viajero/kit.json`.

Para probar la apariencia: `?estilo=xy&gente=3d&pelo=rubio&piel=2&ropa=granate&bufanda=blanca`.
- **Pelo:** castaño, oscuro, rubio, pelirrojo, ceniza, azul.
- **Piel:** tonos del 1 al 6.
- **Ropa:** verde azulado, granate, bosque, azul, mostaza, grafito.
- **Bufanda:** mostaza, roja, blanca, verde, violeta, celeste.

Lo que falta para producir:
- pose de impresión, más compacta que la pose A;
- base;
- encastres entre piezas;
- espesor mínimo (dedos, flecos y rulos de al menos 1,5–2 mm);
- piezas sólidas en vez de superficies;
- formato 3MF multicolor;
- revisar la licencia de Hunyuan antes de vender.

En el juego falta la pantalla para elegir la apariencia y guardarla en el registro del Instituto.

Defectos del viajero a pulir:
- manchas de cuero en el borde de bolsillos y puños;
- pelo invadiendo las mejillas;
- puntitos en los bordes entre regiones del juego.

## Edda, el segundo personaje (ciclo 28)

Corre todo el proceso con un guion: `scripts/ia3d/personaje.sh edda forma modelo explorar` y, después
de escribir `personajes/edda.json`, `… regiones`. Las referencias salen con
`art-src/xy/referencias.sh edda "<descripción>"`. La forma tardó 15 minutos y dio 384 mil caras. En
el juego reemplaza a su sprite con `?gente=3d` (`FIGURES` en `src/style.js`).

Lo nuevo con Edda:
- **Colores compartidos.** Pelo y bombachos comparten el rojizo, y piel y camisa, el crema. Se
  separan con franjas de altura, que ahora admiten varias (la camisa y las medias).
- **La capa.** Es lo más difícil: debajo, la camisa y las mangas quedan mezcladas en las regiones
  del kit. En el juego no se nota, porque se ve la textura pintada. Para imprimir, la capa va a
  necesitar retoque a mano o una pieza aparte.

## El elenco completo, la interfaz y el Arco I jugado en X e Y (ciclo 28, 12–13 oct 2026)

- **Diez personajes en 3D:** el viajero, Edda, Lumen, Marín, Vega, Nereo, Tala, Yesca, Ivara y Ohm,
  cada uno con su esqueleto, sus regiones de color (`personajes/`) y su kit (`kits/`). Ohm es un
  robot, con cuerpo y dos pies, y camina balanceándose. La cola de formas (`scripts/ia3d/cola.sh`)
  trabaja de a uno, porque hay una sola GPU. Las texturas van en JPEG: los diez modelos pesan 22 MB.
- **Animaciones compartidas:** caminar; hablar (gesto de mano y asentir); festejar (brazos arriba y
  saltito); en reposo, respirar y mirar alrededor.
- **Bancos en X e Y** (`src/puzzles.css`, bloque final): paneles blancos redondeados, encabezado
  celeste, mesa de roble claro, botones con forma de píldora, cartel de éxito con sello verde,
  pista amarilla. Lo que está sobre la mesa conserva su tinta clara.
- **Interfaz del juego en X e Y** (`src/xy-ui.css`): diálogo con caja blanca y borde azul,
  instrumento de viaje y objetivo en tarjeta blanca, avisos E y Q como botones de píldora,
  botones redondos blancos, cartel de llegada.
- **Cielo y portada:** cielo azul de verdad. La portada es el reino real, sacado del juego
  (`scripts/portada.mjs`), con el viajero y Ohm en primer plano.
- **Saturación:** con la cámara cercana, las llegadas mostraban sobre todo los arbustos del camino.
  En X e Y la vegetación de relleno baja a cerca del 40 % y la cámara se abrió un poco (distancia
  0,6, inclinación 43°).
- **Interiores:** sin restaurar se ven, en penumbra pero legibles.
- **Errores encontrados y corregidos al jugar:**
  - Quien quedaba apoyado en una baranda (en el muelle del Lago, después de hablar con Nereo) no se
    podía mover. Ahora sale hacia el punto libre más cercano (`src/collision.js`, con su prueba).
  - El contorno pedía la profundidad antes de que existiera. Ahora usa una textura de reserva.
- **Verificado:** el recorrido completo en `?estilo=xy&gente=3d` pasa de punta a punta, sin errores
  (`output/pt-xy3`): 9 lugares, 9 bancos, 9 recuerdos, final y recarga. Flujo de bancos correcto.
  Pruebas: raíz 340/340, PlayCanvas 111/111.

**Pendiente:**
- los bancos en el teléfono (3 o 4 de 9 necesitan desplazarse);
- la pantalla para elegir pelo, piel y ropa del viajero;
- las caras de cerca, que dependen de la textura proyectada;
- simplificar la geometría de los personajes;
- decidir si el estilo X e Y pasa a ser el estilo por defecto.
