# Ohmdal Arco I — Visual Bible (rebuild)

> Documento de trabajo. Es la constitución visual para el rebuild del Arco I.
> Todo asset generado debe responder a esta constitución. Si un asset rompe
> la constitución, se regenera.

## 1. Resolución y unidad básica

- **Tile lógico**: 16×16 px (mundo del juego, base de todo el tilemap).
- **Tile renderizado**: 32×32 px (2× upscale, nearest-neighbor). Una unidad
  de mundo = 1 metro. La grilla del mapa es 1 metro = 1 tile.
- **Sprite de personaje**: 24×32 px lógico (≈1.5 m de alto a la unidad del
  mundo). Pivot en pies.
- **Viewport**: 480×270 px lógico (16:9). Se ajusta a la ventana con integer
  scale (2×, 3×, 4×...) para preservar pixel art crisp.
- **Profundidad lógica**: una unidad = 1 m. La cámara es cenital pero con
  sesgo 3/4 (no ortográfica pura): el horizonte está a 240 unidades
  verticales arriba del jugador.

## 2. Paleta canónica

### Familia Cuenca de Ohm (apagado)

| Uso | Color | Hex | Notas |
|---|---|---|---|
| Sombra dura | ink | `#0e1620` | Sombra de edificios, debajo de NPC |
| Piedra oscura | stone-d | `#2a3540` | Bases de muros, contornos |
| Piedra media | stone | `#3a4654` | Muros principales, empedrado |
| Piedra clara | stone-l | `#525e6e` | Highlights, ladrillos |
| Piedra cálida | stone-w | `#6a5a48` | Suelos con historia, taller |
| Cobre apagado | copper-d | `#3a2a1c` | Tubería vieja, sin energía |
| Cobre medio | copper | `#7a5232` | Cobre expuesto, ligeramente oxidado |
| Cobre highlight | copper-l | `#a87850` | Reflejo tenue, sin energía |
| Agua detenida | water-d | `#1a2530` | Canales y fuentes dormidos |
| Agua viva | water | `#3a6a82` | Cuando el sistema se enciende |
| Agua clara | water-l | `#7ab0c8` | Highlight del agua viva |
| Follaje muerto | moss-d | `#2a3528` | Vegetación seca, terrazas |
| Follaje vivo | moss | `#5a7a48` | Cuando llega energía/agua |
| Cielo dormido | sky-d | `#1a2230` | Cielo nocturno, sin luna |
| Cielo crepúsculo | sky | `#2a3850` | Atardecer |
| Cielo claro | sky-l | `#3a4a68` | Cielo con luna |
| Luz cálida | light-w | `#e8a868` | Filamentos, antorchas (apagado) |
| Luz fría | light-c | `#7ac8e8` | Lámparas eléctricas (apagado) |

### Acentos de energía (cuando el mundo se enciende)

| Uso | Color | Hex | Notas |
|---|---|---|---|
| Cobre vivo | copper-glow | `#e8a050` | Cables activos, emissive |
| Luz cálida viva | light-w-on | `#ffd28a` | Lámparas con filamento |
| Luz fría viva | light-c-on | `#a8e8ff` | Lámparas eléctricas, LED |
| Chispa | spark | `#fff4d8` | Contacto, interruptor, partículas |
| Halo de carga | halo | `#fff4d844` | Aura alrededor de nodo energizado |

Regla: el cobre apagado y la piedra ocupan el 80% del frame. Los acentos
de energía entran al activarse y ocupan máximo 8%. El resto es
atmósfera (cielo, niebla, agua).

## 3. Forma y arquitectura

Ohmdal fue construido como un **Mundo Aplicado del Instituto** hace 40 años.
Su arquitectura es **didáctica, no estilizada**: lo importante es legible, no
bonito. Edificios repetidos, módulos, esquinas funcionales, señales
sencillas.

**Geometría dominante**: cuadrados y rectángulos. No hay curvas gratuitas.
Las excepciones son:

- La fuente de la Plaza (circunferencia, central).
- El Ojo de la Puerta de Ohm (arco ojival con un Ω al centro).
- El Manantial (estanque natural con borde irregular pero contenida por
  piedra rectangular).
- Los cables de cobre: siempre rectos o con un codo de 90°.

**Materiales**:

- **Piedra local**: gris-azulada, erosionada, juntas visibles.
- **Cobre**: tubos rectangulares, sin decoración, soldados con plata.
- **Madera**: solo en puertas, muebles, taller. Color miel oscuro.
- **Cerámica**: baldosas del Taller, azul-gris.
- **Agua**: oscura por defecto, clara cuando fluye.

**Altura y profundidad**:

- Edificios de 1 planta (3 m) por defecto. La Puerta de Ohm sobresale
  (8 m). El Manantial está contenido en un patio hundido (−1 m).
- Cada nivel de altura se distingue por una fila de tiles + sombra
  proyectada.

## 4. Personajes

### Prota (estudiante)

- 24×32 px, 4 direcciones, 2 frames de caminata + idle.
- Chaqueta azul oscuro, mochila, pelo castaño, sin expresión facial
  marcada (silueta limpia).
- Edad: 15-17. Constitución: delgada.
- Color secundario: cobrizo en la mochila (detalle de pertenencia al
  Instituto).

### Edda

- 24×32 px, 4 direcciones, 2 frames de caminata + idle + señalar.
- Pelo corto, chaqueta verde olivo, pantalones oscuros, libretita
  en mano (cuando está parada).
- Edad: 17-19. Rápida, mirada atenta.
- Acento: un prendedor de cobre en el cuello (símbolo de la Cuenca).

### Lumen

- 24×32 px, 4 direcciones, 2 frames de caminata + idle + trabajar.
- Mandil de cuero sobre camisa gris, gafas, manos grandes, pelo
  canoso recogido.
- Edad: 50-55. Postura ligeramente encorvada por el oficio.
- Acento: cinta métrica colgando del cuello.

### Ohm

- 24×32 px, 4 direcciones, 2 frames idle + 1 frame midiendo.
- Carcasa de cobre pulido con ventanas de cristal, ojos-lente, dos
  brazos con pinzas.
- Forma estable: cubo-base con cabeza esférica achatada.
- Cuando está dormido: ojos apagados, sin brillo, cabeza baja.

### Habitantes de fondo

- 3 siluetas reusables: figura con delantal (taller), figura con
  capa (Plaza), figura con sombrero de paja (terrazas).
- Animación mínima: idle + 1 frame de paso.

## 5. Iluminación y tiempo

- **Hora de inicio del juego**: crepúsculo. Cielo `sky-d` arriba,
  `sky` abajo, horizonte visible. Las fuentes de luz (todas eléctricas
  dormidas) están apagadas.
- **Post-encendido**: las lámparas y filamentos se encienden, el cielo
  pasa a `sky-l` con luna visible, la paleta cálida gana presencia
  en el suelo.
- **Sol**: el sol no se ve (es crepúsculo). La luz direccional es de
  luna + ambiente.
- **Sombras**: dirección NW. Duras, 1 px de ancho. Solo personajes,
  no tiles (las baldosas se autorepresentan con su propio tono).
- **Lámparas**: emissive + halo radial. Se activan/desactivan
  individualmente cuando su nodo recibe o pierde energía.

## 6. UI y tipografía

- Tipografía: monoespaciada para texto de juego (estilo
  `Press Start 2P` o pixel sans, 8-12 px). Con fallback a
  `monospace` del sistema.
- Bitácora (DOM): fondo papel viejo (#f0e8d0), tinta oscura
  (#1a1a1a), tachones en rojo, márgenes generosos.
- HUD: borde 1 px negro, esquinas redondeadas, fondo semitransparente
  con blur.
- Color de acentos UI: cobre apagado por defecto, cobre vivo cuando
  algo está activo.

## 7. Detalles que diferencian Ohmdal de un RPG genérico

1. **No hay NPCs con exclamación sobre la cabeza.** Toda la comunicación
   es por proximidad, gesto o diálogo directo.
2. **Los cables de cobre son un elemento narrativo.** Aparecen como
   líneas en el suelo (visibles cuando el jugador pasa por encima) o
   como tubos en muros. Cuando un nodo está activo, los cables cercanos
   emiten un pulso visual.
3. **Las herramientas yacen donde se usaron.** No hay cofres: hay
   bancos de trabajo, mesas con instrumentos, ganchos en la pared.
4. **El mundo envejece.** Las baldosas tienen grietas, el cobre tiene
   pátina, las paredes tienen manchas de agua. Esto se mantiene
   post-encendido: la luz vuelve, pero las cicatrices quedan.

## 8. Capas de render (back to front)

1. Suelo (tilemap capa 0, base).
2. Suelo decorado (tilemap capa 1, baldosas con patrón, fuentes de agua).
3. Cables de cobre en el suelo (tilemap capa 2, especiales).
4. Objetos de fondo (tilemap capa 3, mesas, máquinas, estantes
   contra la pared de fondo).
5. Sombras de personajes y props.
6. Personajes (sprites de NPC y prota).
7. Props del medio (tilemap capa 4, objetos que el jugador puede estar
   delante o detrás según Y).
8. Foreground (tilemap capa 5, oclusión frontal: toldos, ramas,
   pilares delgados).
9. Luces dinámicas (capa additive).
10. Partículas (capa additive).
11. HUD / UI / Bitácora.

## 9. Estilo de pixel art

- **Sin antialiasing**. Edges duras.
- **Sin outlines negros gruesos**. Las siluetas se definen por
  contraste de tono. Outlines solo en el heroe y 1-2 props clave.
- **3-4 tonos por material**. No más.
- **Sombras pintadas, no dinámicas**, excepto para personajes y
  nodos energizados.
- **Animación**: tweens de 6-8 frames (≈100-130 ms por frame). Sin
  squash and stretch, sin rotaciones intermedias.

## 10. No-go

- **No fondos detallados a 4K**. La escala es pixel art 32×32 tile.
- **No IA de upscale**. Si un asset generado sale a baja resolución
  y no es pixel art, se regenera con prompt correcto.
- **No objetos animados innecesariamente** (banderas al viento, agua
  con olas). Solo se anima lo que tiene causa eléctrica.
- **No emojis ni iconos modernos** en la UI in-game.
- **No copys literales** de DQ3, Eastward, Sea of Stars, Tunic o
  CrossCode. Se aprende el lenguaje, no se copia la firma.
