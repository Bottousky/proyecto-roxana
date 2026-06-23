# Especificación visual — Cinemática introductoria INTRO_02–04
# Proyecto Roxana

**Versión:** 1.0  
**Fecha:** 2026-06-22  
**Responsable:** Orquestador Claude Code  
**Estado:** Listos para generación con imagegen  

---

## 0. Contexto narrativo

La cinemática introductoria consta de 4 imágenes estáticas que enmarcan el prólogo del jugador:

1. **INTRO_01** — Asignación por descarte (ya existe como `hero-asignacion.png`)
2. **INTRO_02** — Roxana años atrás (dorada, llena de vida) ← **GENERAR**
3. **INTRO_03** — La leyenda de la Bitácora (archivo viejo, misterio) ← **GENERAR**
4. **INTRO_04** — Escuela actual vacía (hoy, silencio) ← **GENERAR**

**Regla de coherencia visual:**
- Las 3 nuevas imágenes muestran la **misma escuela** (Escuela Roxana) en 3 momentos del tiempo.
- Paleta de transición: dorada/cálida (INTRO_02) → sepia/misteriosa (INTRO_03) → gris/apagada (INTRO_04).
- La arquitectura del Hall (escalera central, estatua, puertas, proporciones) debe ser reconocible en todas ellas.

---

## 1. INTRO_02 — "Roxana años atrás"

### Descripción narrativa (del guion `prologo.md` §5.2)

> La Escuela Roxana en su época de esplendor. El Hall aparece lleno de estudiantes, docentes y movimiento. Hay talleres activos, mesas con circuitos, herramientas, lámparas, cuadernos, mapas, pizarrones, maquetas, máquinas pequeñas, motores y planos técnicos.
>
> No debe parecer una academia mágica genérica. Debe parecer una escuela técnica antigua, viva, prestigiosa, llena de curiosidad y trabajo práctico.

### Elementos visuales clave

- **Espacio:** Hall principal de escuela técnica de los 1980s–1990s.
- **Personajes:** ~15–25 personas (estudiantes, docentes) en movimiento y trabajo. NO rostros detallados; siluetas, vistas de espaldas, figuras difuminadas. Edades mixtas (adolescentes, adultos).
- **Talleres/mesas activas:**
  - Mesas de trabajo con circuitos electrónicos pequeños (no debe parecer futurista).
  - Soldadores, herramientas (alicates, destornilladores, llave inglesa).
  - Lámparas de escritorio antiguas (tipo escritorio de los 80s–90s).
  - Máquinas pequeñas: tornos, fresadoras manuales (de escala banco, no industriales).
  - Engranajes y piezas mecánicas dispersas.
  - Planos desplegados (blueprint azul clásico o papel marrón con diagramas).
  - Cuadernos y carpetas de trabajo.
- **Pared/pizarrones:** Diagramas técnicos dibujados (circuitos, ecuaciones simples, bocetos mecánicos).
- **Iluminación:** Cálida, dorada. Luz natural desde ventanas altas + lámparas de trabajo. Contraste suave, sin sombras duras.
- **Paleta de color:**
  - Dominantes: dorado cálido (#D4AF37–#FFD700), tierra (#8B6F47, #A0826D), madera clara (#D2B48C).
  - Acentos: verde oscuro suave (#3D5C3D), acero/gris cálido (#A9A9A9).
  - Tonos de piel: naturales (no saturados).
- **Atmósfera:** Energía controlada, curiosidad, orgullo institucional, presencia de "autoridad amable" (docentes supervisando).
- **Estilo visual:** Ilustración painterly o fotomontaje ligero. Líneas definidas pero suave, colores no saturados. Sensación de 1980s–1990s, escuela real, no anacrónica.
- **Indicios de "Roxana":** Opcional: mural con nombre, foto de la directora en pared, placa, o figura docente central (mujer, postura de liderazgo, no face-on).

### Dimensiones
1536 × 1024 px (16:10, horizontal).

### Paleta de referencia
```
Dorado cálido:     #D4AF37, #E6C200, #FFD700
Tierra/Madera:     #8B6F47, #A0826D, #D2B48C
Verde oscuro:      #3D5C3D, #556B55
Gris cálido:       #A9A9A9, #B8B8B8
Acentos técnicos:  Azul marino suave (#1C3555), rojo óxido (#8B4513)
```

### Prompt optimizado (ver §A)

---

## 2. INTRO_03 — "La leyenda de la Bitácora"

### Descripción narrativa (del guion `prologo.md` §5.3)

> Una composición de recortes viejos, fotos amarillentas, una cartelera escolar, una vitrina con trofeos oxidados, papeles de archivo, planos del viejo programa educativo y referencias parciales a la Bitácora.
>
> La Bitácora no debe mostrarse claramente. Puede aparecer como:
> - Un dibujo borroso en un recorte.
> - Una silueta de libro en una foto vieja.
> - Una frase incompleta en una nota.
> - Una mención en un documento escolar.

### Elementos visuales clave

- **Composición:** Collage de fotografías, documentos y objetos dispersos en una mesa de archivo polvoriento o fondo neutro.
- **Fotografías (4–5):**
  - Foto de promoción escolar de los 1980s–1990s (sepia, borde blanco clásico de foto).
  - Foto de estudiantes en taller (uno de ellos sostiene algo que parece un libro, pero está borroso).
  - Foto de grupo con docentes y Roxana (Roxana difuminada o parcialmente cubierta).
  - Fotos de proyectos técnicos (máquinas, circuitos).
- **Documentos:**
  - Cartelera escolar vieja con listados (parcialmente legible, tinta desvanecida).
  - Papeles de programa "Mundos Aplicados" (texto fragmentado: "Programa de Mundos Aplicados", "Registro de…").
  - Notas manuscritas antiguas.
  - Planos o diagramas (blueprint desvanecido).
- **Trofeos/objetos:** Vitrina con trofeos de bronce/latón oxidados, medallas de deportes/académicos.
- **Libro misterioso:** Silueta borrosa o contorno de un libro viejo (la Bitácora). NO mostrado claramente; debe estar en sombra, entre recortes, o cubierto parcialmente.
- **Texto diegético (fragmentado e ilegible o parcialmente cubierto):**
  - "La Bitácora de Roxana" (una palabra cubierta o borrosa).
  - "Programa de Mundos Aplicados" (parte ilegible).
  - "Solo registra a quienes preguntan" (difuminado).
  - "Archivo perdido" (parcialmente cubierto).
- **Iluminación:** Crepuscular (luz de fin de tarde o penumbra de archivo). Luces de cuadro focalizadas en fotos/documentos. Sombras suaves.
- **Paleta de color:**
  - Dominantes: sepia (#704214, #8B7355), gris topo (#808080, #696969), café oscuro (#3E2723).
  - Acentos: oro oxidado (#B8860B), azul marino desvanecido (#1C3555 con transparencia).
  - Tonos de papel: amarillento, marrón claro, blanco desteñido.
- **Atmósfera:** Misterio diegético, leyenda olvidada, documentos que el jugador está descubriendo. Sensación de "archivo secreto o perdido de la escuela".
- **Estilo visual:** Collage/fotomontaje. Fotografías viejas (ligeramente pixeladas o con grano). Bordes de fotos asimétricos. Documentos superpuestos. No debe parecer limpio ni digital; debe parecer que fue hecho a mano hace años.

### Dimensiones
1536 × 1024 px (16:10, horizontal).

### Paleta de referencia
```
Sepia cálido:      #704214, #8B7355, #A0826D
Gris topo:         #808080, #696969, #778899
Café oscuro:       #3E2723, #5C4033
Oro oxidado:       #B8860B, #DAA520
Tonos papel:       #F5DEB3, #D2B48C, #FFFACD (desvanecido)
```

### Prompt optimizado (ver §A)

---

## 3. INTRO_04 — "Escuela actual vacía"

### Descripción narrativa (del guion `prologo.md` §5.4)

> La Escuela Roxana en el presente. Fachada antigua, portón abierto, patio vacío, ventanas oscuras, carteles gastados, hojas acumuladas, luces apagadas o titilando.
>
> La imagen puede terminar insinuando el interior del Hall: bancos vacíos, estatua central, puertas cerradas, polvo, escaleras y una luz mínima.

### Elementos visuales clave

- **Exterior:**
  - Fachada de escuela de 4–5 pisos, arquitectura clásica escolar (ladrillo o piedra).
  - Portón de entrada principal abierto (metal oxidado suavemente, no herrumbroso).
  - Patio o plaza central vacío/despoblado.
  - Ventanas: oscuras, luz interior mínima.
  - Carteles de entrada, señales escolares (desgastados pero legibles).
  - Hojas/polvo en piso exterior (suave, no sucio).
- **Interior (visible a través de puertas/ventanas o transición gradual):**
  - Hall principal: piso de mosaico antiguo o madera (limpio, desgastado).
  - Bancos/asientos viejos de madera: vacíos, simétricos, creando perspectiva hacia el fondo.
  - Escalera central: acceso a pisos superiores, barandilla de metal antiguo.
  - Estatua central: escultura de mujer (Roxana, de mármol o bronce). Posición central, honrando el espacio.
  - Puertas de aulas/salas: cerradas, algunos vidrios translúcidos con carteles escolares.
  - Cartelera de anuncios: en pared, gastada, algunos papeles visibles pero no legibles.
  - Vitrinas/armarios escolares: vacíos o con objetos viejos (trofeos, fotos).
  - Luces: Lámparas de techo antiguas (encendidas o apagadas).
- **Iluminación:** Luz natural crepuscular (atardecer o amanecer temprano). Luz de ventanas altas cae en ángulo bajo, creando sombras alargadas. NO es de noche, pero sí está apagado. Luz fría.
- **Paleta de color:**
  - Dominantes: gris (#B0B0B0, #A9A9A9), azul frío tenue (#4A6FA5, #658BA3), marrón desteñido (#7A5C47).
  - Acentos: acero (#505050), borde metálico (#888888).
  - Luz de ventana: blanca fría (#E8E8E8).
- **Atmósfera:** Melancolía, abandono no destructivo, espera, primer día de clase solitario, silencio, presencia institucional pero ausencia humana.
- **Detalles de no-destrucción:** NO hay vidrio roto, NO hay graffiti, NO hay basura. Solo polvo, desgaste, luz baja. La escuela sigue siendo escuela; simplemente está vacía y envejecida.
- **Personajes:** Ninguno visible, o máximo 1 silueta muy lejana (a través de una ventana, difuminada, sugiriendo presencia mínima).
- **Estilo visual:** Ilustración realista o fotomontaje. Líneas definidas pero atmósfera tenue. Colores desaturados. Sensación de fotografía antigua o cuadro pintado (no CGI).

### Dimensiones
1536 × 1024 px (16:10, horizontal).

### Paleta de referencia
```
Gris principal:    #B0B0B0, #A9A9A9, #A0A0A0
Azul frío tenue:   #4A6FA5, #658BA3, #6B8FC7
Marrón desteñido:  #7A5C47, #8B6F47
Acero/Metal:       #505050, #666666, #888888
Luz ventana:       #E8E8E8, #F0F0F0
```

### Prompt optimizado (ver §A)

---

## A. Prompts optimizados para servicios de imagegen

### A.1 DALL-E (OpenAI)

**INTRO_02 — DALL-E:**
```
A warm, golden-lit technical school hallway from the 1980s at its peak. 
Bustling scene with students and teachers (seen from behind, in silhouette, or mid-work; no detailed faces) 
working at electronics benches. Visible active workshops: circuit boards, soldering irons, hand tools 
(pliers, screwdrivers, wrenches), desk lamps, small motors, gears, engineering blueprints, technical 
diagrams on blackboards in the background. Soft golden warm light from windows and work lamps. 
Natural wood furniture and desks. Deep green and warm earth tone accents. 
Atmosphere: energetic, curious, orderly. Illustrated painterly style, not photorealistic. 
No magic or anachronism. 1536×1024px.
```

**INTRO_03 — DALL-E:**
```
Vintage school archive composition: yellowed photographs (4-5 scattered on a table or archival surface), 
old school documents, promotion boards, tarnished brass trophies in a display case. 
Aged paper clippings and documents with fragmented text: "Applied Worlds Program", "Registry of...", 
"Only registers those who ask" (text blurred, partially covered, or faded). 
In shadows, a blurred silhouette of an old book (logbook/ledger). 
Sepia, gray, dark coffee tones. Crepuscular dusty archive lighting. 
Collage/archival style with overlapping photographs and papers. 
Atmosphere: mystery, forgotten legend, discovered secret. 1536×1024px.
```

**INTRO_04 — DALL-E:**
```
An old technical school building (exterior: stone facade, classical school architecture, 4-5 stories) 
with open main gate, empty courtyard. Transition to interior of grand central hallway: 
vacant wooden benches in rows, central staircase visible in the distance, statue of a woman in center, 
closed classroom doors on sides, faded bulletin board, tarnished brass fixtures. 
Minimal natural light from tall windows (cool, crepuscular). Dust visible but clean, worn floor and walls. 
No broken windows, no graffiti, no trash. Melancholic, waiting, empty but functional. 
Illustrated/matte photography style. Gray, cool blue, desaturated tones. 1536×1024px.
```

---

### A.2 Midjourney

**INTRO_02 — Midjourney:**
```
/imagine prompt: golden-lit 1980s technical school hallway, bustling with students and teachers (no faces, 
silhouettes and back views), active electronics workshops with circuit boards, soldering irons, hand tools, 
desk lamps, small motors, gears, blueprints, blackboards with technical diagrams, soft warm golden light, 
natural wood furniture, green and earth tone accents, energetic orderly atmosphere, painterly illustration 
style, no magic, 1536x1024 --ar 1.5 --niji 6 --q 2
```

**INTRO_03 — Midjourney:**
```
/imagine prompt: vintage school archive: scattered yellowed photographs, old documents, trophies, 
papers with fragmented text ("Applied Worlds Program", "Registry", "Only asks those who ask"), 
blurred book silhouette in shadows, sepia gray and dark coffee tones, crepuscular dusty archive 
lighting, collage style, mystery and forgotten legend atmosphere, 1536x1024 --ar 1.5 --niji 6 --q 2
```

**INTRO_04 — Midjourney:**
```
/imagine prompt: old technical school building exterior and interior hallway: stone facade, 
open gate, empty courtyard, interior with vacant benches, central staircase, woman statue in center, 
closed doors, faded bulletin board, minimal cool crepuscular light from windows, dust visible, 
clean worn surfaces, no damage, melancholic waiting empty atmosphere, illustrated realism style, 
gray cool blue desaturated, 1536x1024 --ar 1.5 --niji 6 --q 2
```

---

### A.3 Stable Diffusion (local or API)

**INTRO_02 — Stable Diffusion:**
```
A warm golden-lit technical school hallway from the 1980s at its peak, bustling with students 
and teachers (no detailed faces, silhouettes, back views), working at electronics benches. 
Active workshops: circuit boards, soldering irons, hand tools, desk lamps, small motors, gears, 
blueprints, blackboards with technical diagrams. Soft golden warm light. Natural wood, deep green, 
warm earth tones. Energetic orderly atmosphere. Painterly illustration, not photorealistic, 
no magic. 1536×1024.

negative prompt: photorealistic, fantasy, magic, anime, modern, bright neon, cartoon, 
CGI, 3D render, cartoon
```

**INTRO_03 — Stable Diffusion:**
```
Vintage school archive composition: scattered yellowed photographs, old documents, trophies, 
papers with fragmented text "Applied Worlds Program" and "Only registers those who ask" 
(text blurred or covered), blurred book silhouette in shadows. Sepia, gray, dark coffee tones. 
Crepuscular dusty archive lighting. Collage style with overlapping photographs. 
Mystery and forgotten legend atmosphere. 1536×1024.

negative prompt: photorealistic, bright, colorful, modern, digital, clean, contemporary, 
anime, cartoon, CGI
```

**INTRO_04 — Stable Diffusion:**
```
Old technical school building: stone facade, open main gate, empty courtyard. 
Interior hallway: vacant wooden benches in rows, central staircase, woman statue in center, 
closed doors, faded bulletin board. Minimal cool crepuscular light from windows. 
Dust visible, clean worn floor. No damage, no graffiti. Melancholic, waiting, empty but functional. 
Illustrated realism. Gray, cool blue, desaturated tones. 1536×1024.

negative prompt: bright, colorful, modern, CGI, 3D, photorealistic, fantasy, magical, 
anime, cartoon, contemporary
```

---

## B. Guía de verificación post-generación

Después de generar las 3 imágenes, verificar:

### Coherencia visual
- [ ] INTRO_02, 03, 04 muestran la MISMA escuela (Hall, escalera central, estatua, proporciones reconocibles).
- [ ] Paleta transita de dorada (INTRO_02) → sepia (INTRO_03) → gris (INTRO_04).
- [ ] La arquitectura del Hall es consistente entre imágenes.

### Narrativa
- [ ] INTRO_02: Atmósfera de energía, curiosidad, trabajo técnico. Luz cálida, muchas personas, talleres activos.
- [ ] INTRO_03: Atmósfera de misterio, archivo viejo, leyenda. Luz baja, colores desaturados, libro borroso.
- [ ] INTRO_04: Atmósfera de melancolía, silencio, espera. Luz crepuscular, vacío, abandono sin destrucción.

### Detalles visuales
- [ ] INTRO_02: Circuitos, herramientas, lámparas, diagramas en pizarrones visibles. NO rostros detallados.
- [ ] INTRO_03: Fotografías viejas, documentos, trofeos. Texto fragmentado/borroso. Libro difuminado.
- [ ] INTRO_04: Bancos vacíos, estatua central, escalera, puertas cerradas. Polvo pero no destrucción.

### Estilo
- [ ] Todas ilustración/fotomontaje, no CGI puro.
- [ ] Líneas claras, colores no saturados.
- [ ] Sensación académica, técnica, acogedora (INTRO_02) → misteriosa (INTRO_03) → melancólica (INTRO_04).

### Ajustes si aplica
Documentar cualquier desviación del ideal:
- Ejemplo: "INTRO_03: El texto está muy borroso; se recomienda agregar texto como overlay en engine."
- Ejemplo: "INTRO_02: Los personajes son siluetas sólidas; se aceptó porque preserva el misterio sin faces."

---

## C. Integración en engine (Phaser 4)

**Ubicación:** Guardar como:
```
assets/cinematic/INTRO_02.png
assets/cinematic/INTRO_03.png
assets/cinematic/INTRO_04.png
```

**Uso en código:** Ver `src/game/IntroCinematic.ts` (por implementar en hito H6).
```ts
const images = [
  'assets/cinematic/INTRO_01.png',  // ya existe
  'assets/cinematic/INTRO_02.png',  // nueva
  'assets/cinematic/INTRO_03.png',  // nueva
  'assets/cinematic/INTRO_04.png',  // nueva
];
```

**Texto overlay (en engine, no en imagen):**
Ver `src/content/intro-textos.ts` (por redactar en hito H6).

---

## D. Reproducibilidad

Para regenerar cualquier imagen con ajustes:

1. Tomar el prompt correspondiente de §A.
2. Si ajustar paleta: añadir "more golden" (INTRO_02), "sepia" (INTRO_03), "cool gray" (INTRO_04).
3. Si ajustar atmósfera: añadir "more bustling" (INTRO_02), "more mysterious" (INTRO_03), "more melancholic" (INTRO_04).
4. Si ajustar presencia de personas: añadir "more silhouettes" o "fewer people" según necesidad.

---

**Versión de especificación:** 1.0  
**Aprobación:** Pendiente de Director (Manuel Gonzalo Botto Docampo)  
**Siguiente:** Generación de imágenes en imagegen externos, integración en H6 (cinemática).

