# Biblia de estilo — Instituto (Escuela Roxana)
*Imagen ancla 1: Hall principal*

## Cámara (canon — Director, 2026-06-30)

**¾ top-down (oblicuo, ~55°), estilo Pokémon / Zelda clásico.** La cámara mira desde arriba pero **inclinada**: se ven las **caras** de los personajes y los **frentes** de los edificios, nunca solo coronillas ni techos. NO es **90° cenital estricto** (se leería plano, como un mapa) y NO es **isométrico** (grilla en diamante a 45°).

Compatible con el motor **sin tocar código**: `ExplorationScene.ts` usa colisión por rectángulos alineados a ejes, y el ¾ conserva esa grilla ortogonal recta (exactamente como Pokémon). Coincide con `biblia-arte-produccion-v0.md` («cámara alta de tres cuartos»). **Deroga** la nota previa de «cámara cenital 90°»: era más estricta de lo que el motor exige — lo que rompía la colisión era el isométrico, no el ¾.

## Estado

- **v1 (isométrica):** generada por Codex, guardada como referencia de paleta/mood únicamente. Descartada como fondo jugable: el motor (`ExplorationScene.ts`) usa colisión por rectángulos alineados a ejes (grilla ortogonal), incompatible con la grilla en diamante del isométrico; adoptarlo exigiría reescribir movimiento/colisión en todas las salas. La cámara canónica es **¾ top-down** (ver §Cámara), que sí es compatible con esta colisión.
- **v2 (¾ top-down):** se habían generado 2 variantes con un prompt de **90° estricto** (ahora derogado), así que deben **regenerarse en ¾** con el prompt de abajo. Pendiente: Director elige cuál es canon (o pide ajustes).
  - Variante A: luz más dorada/rica, vitrinas con más variedad de objetos.
  - Variante B: tono más gris/plano, pero tiene un libro abierto sobre el escritorio del preceptor (guiño visual a la Bitácora sin nombrarla — buen worldbuilding sin spoiler).
  - **Pendiente técnico:** guardar el archivo elegido en `assets/biblia-estilo/hall-v2.png` (no tengo acceso de archivo a las imágenes pegadas en el chat; hay que bajarlas manualmente desde Codex e indicarme la ruta).
  - Una vez elegida: reposicionar en `rooms.ts` las hitboxes de escritorio/estatua/vitrinas/puertas del Hall para que coincidan en x/y con la imagen real (hoy son rectángulos de color genéricos).

## Hall central 3D — escala y jerarquía canónicas (2026-07-25)

Estas reglas aplican a `ROOM_hall` en la escuela 3D de la landing. No cambian la
cámara ¾ ni las colisiones del hall 2D jugable descritas en las secciones
anteriores.

### Hoja de escala institucional

**1 NPC adulto = 1 unidad base.** Las relaciones se auditan visualmente en el
encuadre final; las unidades de Blender son instrumentales y pueden compensar
la proyección ortográfica.

| Elemento | Medida canónica |
|---|---:|
| NPC adulto | 1 NPC |
| Puerta interior | 2,2 NPC |
| Baranda | 0,6 NPC |
| Escritorio | 0,8 NPC |
| Biblioteca | 1,8 NPC |
| Estatua de Roxana sin pedestal | 2,2–2,8 NPC |
| Pedestal | 0,8–1,2 NPC |
| Estatua total | 3–4 NPC |
| Escalera principal, ancho útil | 4–6 NPC |
| Altura entre niveles visibles | 3–4 NPC |

Implementación verificada del hall 3D: monumento **3,21 NPC** (figura ≈**2,2**
NPC y pedestal ≈**1 NPC**), escalera **4,00–4,24 NPC** de ancho y baranda
**0,60 NPC**. Puertas, escritorios y bibliotecas conservan esta tabla como
criterio de aceptación cuando se audite cada sala; no se reescalan globalmente
desde el hall.

- La lectura obligatoria es **plataforma central → estatua de Roxana → escalera → nivel superior**.
- El conjunto **estatua + pedestal** debe medir visualmente entre **3× y 4×** la altura de un NPC del hall.
- La estatua es el foco primario: debe dominar el centro tanto por altura como por silueta, sin quedar absorbida por el dibujo del piso.
- El pedestal debe sentirse institucional y arquitectónico. Debe apoyarse sobre un basamento propio, ancho y escalonado; nunca parecer un prop suelto sobre la alfombra.
- La escalera es protagonista secundaria. Su ancho debe ser menor que el campo visual de la plataforma central y sus escalones deben tener contrahuellas bajas, losas finas y una progresión creíble.
- Los pasamanos y postes no pueden tener el grosor visual de columnas ni superar la presencia de la estatua.
- Los NPCs funcionan como referencia de escala. Deben ser pequeños, esbeltos y subordinados; si distraen o compiten con el monumento, se reducen o se eliminan de esta vista.
- La vista conserva el lenguaje ortográfico/isométrico, voxel y low-poly de la escuela 3D, pero evita cabezas chibi, piezas sobredimensionadas y proporciones de juguete.
- Esta corrección queda limitada al hall. No se propagan escalas de NPC, escaleras ni mobiliario a otras salas hasta auditarlas por separado.

## Prompt para Codex (skill imagegen) — Hall principal, ¾ top-down

```
High-angle three-quarter top-down view (like classic 2D RPGs — Pokémon, The Legend of
Zelda: A Link to the Past — camera tilted roughly 55° above the floor, NOT a strict 90°
bird's-eye, NOT isometric and NO 45° diamond grid). Characters and the fronts of objects
are visible, not just their tops. Interior of an old technical school's main hall,
painterly illustrated style, warm but faded and melancholic palette (beige stone, dark
wood, dim gold lamplight against worn gray walls). Symmetrical room, straight
axis-aligned walls, floor read from a high three-quarter angle.

Elements (seen from a high three-quarter angle, showing their fronts):
- Ornate mosaic floor with a star pattern in warm terracotta and cream tones, worn and faded.
- A bronze/stone statue on a pedestal, centered in the room.
- A staircase against the far wall, its front and steps visible at a three-quarter angle (steps reading clearly, gentle recession, not flattened).
- Two large faded murals on the side walls: one showing electrical transmission towers, one showing a technical diagram of a motor/generator — old, painted, slightly mysterious, hinting the school once taught applied sciences.
- A preceptor's wooden desk near one wall, papers and a small lamp on it.
- Glass display cases along both side walls with old trophies/objects, faint interior light.
- Warm hanging lamps casting small pools of warm light, rest of the room dim and cool.
- Tall windows letting in pale light on one side.
- Wooden double doors at the bottom edge of the frame (entrance) and at the top (exit/stairs landing).
- A single small human figure (student, seen from a high three-quarter angle, facing roughly toward the camera) near the entrance, for scale only — no detailed face.

Mood: faded institutional grandeur, quiet, dusty, melancholic but not destroyed —
the school is intact and clean, just old, dim, and emptied of life. No fantasy
elements, no magic glow, no anachronistic tech. 1536×1024px, painterly illustration,
not photorealistic, not pixel art.
```

## Notas para auditar el resultado

- Verificar que la cámara sea **¾ top-down** (inclinada, se ven caras y frentes) y que NO derive a: (a) **isométrico** — paredes en diagonal formando diamante a 45° → relanzar con `"straight axis-aligned walls, not isometric, no 45° diamond grid"`; (b) **90° cenital plano** — solo se ven techos y coronillas → relanzar con `"tilt the camera to a high three-quarter angle so the fronts of walls and characters are visible"`.
- Paleta debe seguir cálida-melancólica (no debe derivar a frío/azulado ni a saturado/festivo).
- Los murales son worldbuilding visual (insinúan que el Instituto enseñaba ciencia aplicada) — no son spoiler textual, no rompen la regla de vocabulario técnico gateado.
- Esta imagen es la **primera de la biblia de estilo** (addendum de `docs/diseno-sintesis-v1.md`: 3–5 imágenes ancla antes de generar en volumen). Faltan: la plaza de Ohmdal y un banco de taller, como mínimo, antes de generar más contenido.
