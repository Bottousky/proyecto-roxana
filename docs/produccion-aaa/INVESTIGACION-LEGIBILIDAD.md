# Legibilidad de escena en Ohmdal: jerarquía visual, decadencia y densidad de flora

*Investigación para el problema "lo importante se pierde" (personajes e instalaciones ahogados por verde, flores y matas). Octubre 2026.*

> Nota de método. Las fuentes se consultaron mediante búsqueda web (la descarga directa de páginas estaba bloqueada por la red del entorno). Por eso, cada cita resume lo que la fuente dice en sus extractos indexados. Las cifras marcadas **[propuesta]** no salen de una fuente: son umbrales que derivo de los principios citados y del código actual (`experiments/playcanvas/src/flora.js`, `src/world.js`) para que se puedan implementar y medir.

---

## 0. Diagnóstico en una línea

Ohmdal no tiene **jerarquía**: suelo, flora, personajes e instalaciones comparten la misma banda de valor y de saturación. Además, dos decisiones del código actual empeoran el problema:

1. **La flora se densifica junto a lo importante.** En `flora.js`, el pool `EDGE` (todo lo que está a menos de 0,9 m de un obstáculo, incluida la utilería y las instalaciones) siembra el 50 % de las celdas con matas de 0,6–1,3 m, y `GARDEN` (a menos de 1,3 m de un edificio) siembra el 70 % con flores de 1,15–1,3 m. Eso es lo contrario del "espacio negativo" alrededor de los elementos interactuables.
2. **La desaturación de "lugar olvidado" se aplica como post-proceso global** (`world.js`: `saturation = base * (0.58 + 0.42*v)`). Por eso también apaga a los personajes, al cobre y a los mandos. El mundo pierde color, pero lo jugable lo pierde en la misma proporción, así que el contraste relativo no cambia.

---

## 1. Principios clave con ejemplos

### 1.1 Primero el valor (claridad y oscuridad), después el color

- La mayoría de los fallos de legibilidad son fallos de **valor**: el jugador, las amenazas y los objetos interactuables deben ocupar una **banda de brillo distinta** de la del fondo. El control barato es la captura en escala de grises ([bugnet, "Readable game art: why clarity beats detail"](https://bugnet.io/blog/readable-game-art-why-clarity-beats-detail)).
- **Riot, Summoner's Rift (2014).** El mapa "competía visualmente" con los campeones. La solución fue controlar el color y el nivel de detalle, **acotar (clamp) los rangos de valor** y **acotar la saturación y el valor del plano del suelo**, además de reducir la oclusión de personajes. La jerarquía declarada es fondo abajo, después personajes y VFX, y la UI arriba ([PCGamesN](https://www.pcgamesn.com/how-riots-summoners-rift-update-is-improving-clarity-in-league-of-legends); [Surrender at 20, red posts](https://www.surrenderat20.net/2014/06/red-post-collection-more-on-summoners.html); [Destructoid](https://www.destructoid.com/riot-games-details-summoner-s-rift-update-in-exhaustive-dev-blog/)).
- **Guía de VFX de Riot.** Lo primario lleva un rango de valor alto y un contraste fuerte de valor o saturación. Lo secundario va en un rango más bajo. Hay que **evitar el 0 % y el 100 % de valor**, porque se confunden con el entorno o la UI. La atención que capta un elemento debe ser proporcional a su importancia ([Riot VFX Style Guide, PDF](https://nexus.leagueoflegends.com/wp-content/uploads/2017/10/VFX_Styleguide_final_public_hidpjqwx7lqyx0pjj3ss.pdf); [Riot, "Clarity in League"](https://riotgames.com/en/news/dev-clarity-in-league); [VFX Apprentice, resumen](https://www.vfxapprentice.com/blog/10-league-of-legends-vfx-design-tips)). La misma serie de Riot pide reducir el "busy-ness" de texturas con detalle fino innecesario.
- **Diablo III (GDC 2012, Christian Lichtner).** La legibilidad era el principio número uno. La escena se separa en fondo, acción en el plano medio y UI. El foco se guía **estilizando y oscureciendo el fondo** e **iluminando a los personajes con alto contraste**. Los entornos deben ser "un lienzo sobre el que brilla la jugabilidad" ([Game Developer, GDC 2012](https://www.gamedeveloper.com/design/gdc-2012-diablo-iii-s-art-director-shows-off-design-process); [GDC Vault](https://www.gdcvault.com/play/1015306/The-Art-of-Diablo)).
- **Diablo IV.** Su pilar "Old Masters" (Rembrandt) consiste en *detalle controlado, rango tonal y paleta*, y en decidir **dónde añadir o quitar detalle según la cámara icónica** para ayudar a la legibilidad. El otro pilar, "Return to Darkness", busca un mundo oscuro y "grounded" que deja **espacio visual para la jugabilidad** ([Gaming Trend](https://gamingtrend.com/news/first-diablo-iv-quarterly-update-of-the-year-released-details-the-art-direction-dungeons-and-areas-players-will-explore/); [Blizzard, "Peeling Back the Varnish"](https://news.blizzard.com/en-gb/article/23964183/peeling-back-the-varnish-the-graphics-of-diablo-iv)). La advertencia viene de la crítica: sin *ningún* acento de color "nada destaca" ([Substack, "The grayest game"](https://davidvstewart.substack.com/p/diablo-iv-the-grayest-game-i-ever)). Desaturar el mundo funciona solo si se reservan acentos.

### 1.2 La saturación es un presupuesto: poca superficie y mucha intención

- **Team Fortress 2 (Valve, NPAR 2007).** Los colores rozan el realismo, pero con más saturación y contraste de valor, **"dominan los colores apagados con áreas pequeñas de saturación"**. Las texturas del mundo son impresionistas: transmiten la impresión de repetición sin representar cada detalle, con poco ruido. Los personajes se leen por silueta y **rim highlights** ([paper de Valve, PDF](https://steamcdn-a.akamaihd.net/apps/valve/2007/NPAR07_IllustrativeRenderingInTeamFortress2.pdf)).
- **Guía de arte de personajes de Dota 2 (Valve).** La saturación más alta va en **áreas muy pequeñas**, porque las áreas grandes saturadas abruman. Se usan 2–3 colores por personaje. El valor va de oscuro en los pies a claro en la cabeza, para atraer la mirada a la parte superior. El detalle se concentra en pocos lugares ([Steam Support, Character Art Guide](https://support.steampowered.com/kb/9334-YDXV-8590/dota-2-workshop-character-art-guide)).
- **Regla 60/30/10** aplicada a escenas: 60 % color dominante (suelo y terreno), 30 % secundario (estructuras) y 10 % acento para **puntos de interacción**. Hay que validar por **luminancia**, no solo por tono, y dentro del motor, porque la iluminación cambia los tonos ([NYU, color palette for games](https://shibboleth.idm.home.nyu.edu/color-palette-for-games); [No Film School, 60-30-10](https://nofilmschool.com/60-30-10-color-rule)).
- **Hyper Light Drifter.** Su base son grises y verdes de mazmorra 16-bit, **"realzados con destellos de rosas vibrantes y rojos sangre"**, sobre colores planos con viñetas y degradados grandes ([análisis de dirección de arte](http://idrawwearinghats.blogspot.com/2014/04/art-direction-analysis-of-hyper-light.html); [Wikipedia](https://en.wikipedia.org/wiki/Hyper_Light_Drifter)).
- **Darkest Dungeon (Chris Bourassa).** Paleta cálida y unificada, con todo amarilleado como pergamino gastado. La línea fuerte le permite "salpicar golpes de color inesperados" sobre objetos concretos ([GameSpot](https://www.gamespot.com/articles/the-gothic-sensibilities-of-darkest-dungeon/1100-6424880/)).
- **Hollow Knight.** Su paleta es casi monocroma (grises, azules, blancos pálidos) y usa estallidos de color, como el naranja de la Infección, para los momentos clave. Una crítica frecuente sostiene que los fondos demasiado detallados para el tamaño de los elementos jugables los ahogan, y que la solución es bajar el contraste del fondo ([Pixune](https://pixune.com/blog/monochrome-art-style); [Team Cherry blog](https://www.teamcherry.com.au/blog/introducing-hollow-knight); [itch.io](https://itch.io/post/2773163)).

### 1.3 Silueta, contorno y luz propia del personaje

- **Ori and the Blind Forest (GDC 2015, Animating Ori).** Sobre fondos "súper detallados", Ori es una silueta casi blanca, **100 % autoiluminada y sin luz de escena**, "para leerlo con claridad en todo momento". Las reseñas destacan que las plataformas siempre se distinguen del fondo ([notas de la charla](https://zyzyz.github.io/en/2018/01/GDC2015-Animating-Ori/); [Cubed3](https://www.cubed3.com/games/reviews/pc/ori-and-the-blind-forest)).
- **Sprites en fondos cargados.** El contorno oscuro completo, en un tono muy oscuro del color local en vez de negro puro, separa al personaje del fondo. El contorno selectivo sirve para sprites grandes. Con todo, el contraste personaje-fondo importa más que el tipo de contorno ([pixel-editor.com](https://www.pixel-editor.com/articles/pixel-art-outlines); [the-pixel.art](https://the-pixel.art/articles/pixel-art-character-design/); [PixelJoint](https://pixeljoint.com/pixelart/81554.htm)).
- **Hades (Supergiant).** Usa contorno negro irregular y, en los bordes del escenario, la arena cae a negro casi total (claroscuro). Una versión temprana de Tártaro, más oscura y apagada, se corrigió porque no funcionaba ([Point'n Think](https://www.pointnthink.fr/en/the-art-of-hades-en/); [MCV/Develop](https://mcvuk.com/business-news/behind-the-art-of-hades-we-value-artistic-integrity-and-excellence-in-artistic-craft-at-supergiant-however-were-first-and-foremost-a-game-design-lead-team/)).
- **Overwatch, el contraejemplo.** Su diseño limpio rara vez construye separación fuerte de claro-oscuro, y algunos personajes se pierden en grupo ([80.lv](https://80.lv/articles/comparing-team-fortress-2-and-overwatch-art-direction)). En HDR exterior brillante, los contornos se lavan ([foro de Blizzard](https://us.forums.blizzard.com/en/overwatch/t/hdr-readability-character-outlines/697693)).

### 1.4 Espacio negativo, reducción de ruido y landmarks

- **The Witness.** La meta era un mundo **"silencioso, sin desorden visual, donde cada objeto tiene un propósito"**. Blow lo resume así: "no tenemos que poner focos sobre las cosas, porque no destacan a menos que queramos". Las diapositivas de GDC 2014 (Luis Antonio) proponen "realidad simplificada" y "minimizar el ruido que ponemos en la mente del jugador". Las regiones se diferencian por **cambios de vegetación**, con ayuda de paisajistas ([Fletcher Studio](https://www.fletcher.studio/blog/2017/5/26/the-witness-designing-video-game-environments); [slides GDC 2014](https://www.artofluis.com/wp-content/uploads/2014/03/gdc2014_luisantonio_theartofthewitness.pdf); [Game Developer, Q&A Blow](https://www.gamedeveloper.com/business/q-a-jonathan-blow-on-i-the-witness-i-and-the-state-of-indie-games)).
- **The Level Design Book.** A medida que se añade detalle, la geometría se vuelve más difícil de leer: el blockout es legible y el detalle lo vuelve "ruidoso". Solo los juegos de objetos ocultos quieren ese desorden ([Environment Art](https://book.leveldesignbook.com/process/env-art)).
- **Espacio negativo como jerarquía.** Rodear objetivos, puertas o mecanismos con espacio simple crea jerarquía natural. Las hogueras de Dark Souls están despejadas y por eso atraen la vista ([Wayline](https://www.wayline.io/blog/negative-space-in-video-game-design); [salivity](https://salivity.github.io/game-development/article/negative-space-in-action-game-level-design)). Otro autor recomienda elegir **uno o dos anclajes de alto impacto** y dejar respirar el resto del encuadre.
- **Totten, *An Architectural Approach to Level Design*.** Recoge los "weenies" arquitectónicos (landmarks que tiran del jugador) y la estructura de Kevin Lynch: hitos, sendas, nodos, bordes y distritos ([Routledge](https://www.routledge.com/Architectural-Approach-to-Level-Design-Second-edition/Totten/p/book/9781351116305)). Riot aplica lo mismo dando a cada cuadrante su estilo: zonas "destrozadas" junto a Baron y zonas exuberantes lejos de él.
- **Tunic.** El exceso de densidad visual "se ve mal" en un mundo simple ([TheXboxHub](https://www.thexboxhub.com/the-tunic-interview-an-exclusive-chat-with-polymath-designer-andrew-shouldice/)).

### 1.5 HD-2D y dioramas: lo específico de nuestro formato

- **Octopath Traveler (Famitsu, vía Siliconera y Twinfinite).** En los primeros intentos faltaba profundidad. Otro intento **"se pasó en resolución y saturación, y perdió el encanto del pixel art"**. Los sprites se veían "solitarios" en pantalla grande y lo resolvieron con más variedad de tiles y de color. Takahashi y Miyauchi advierten que demasiado detalle fino pierde lo que hace grande al pixel art ([Siliconera](https://www.siliconera.com/project-octopath-traveler-developers-answer-project-started-troubles-developing-hd-2d/); [Unreal Engine spotlight](https://www.unrealengine.com/en-US/spotlights/octopath-traveler-s-hd-2d-art-style-and-story-make-for-a-jrpg-dream-come-true); [Octopath II, UE](https://www.unrealengine.com/en-US/developer-interviews/octopath-traveler-ii-builds-a-bigger-bolder-world-in-its-stunning-hd-2d-style)). La lección es que la riqueza de un escenario HD-2D sale de la variación de tiles y de la luz, no de saturar ni de multiplicar objetos.
- **Triangle Strategy (demo).** RPGFan criticó que fondos y sprites "carecen de claridad por falta de contraste" y que las casillas seguras y de peligro se confundían sobre ciertos tiles ([RPGFan](https://www.rpgfan.com/2021/02/20/project-triangle-strategy-demo-impressions/)). Es nuestro mismo problema en el mismo estilo.
- **Link's Awakening (2019).** El tilt-shift desenfoca el primer plano y el fondo extremos, y el plano jugable queda nítido. El diorama funciona porque el desenfoque es una herramienta de foco ([Zelda Universe](https://zeldauniverse.net/features/review-links-awakening-switches-up-old-graphics-for-a-modern-day-appeal/)).
- **Sea of Stars.** Boulanger quería que todo "se lea bien con distintos niveles de altura, con la luz, y que sigas sabiendo adónde ir". Su iluminación dinámica, con ciclo día/noche, separa zonas y marca puzzles: hay puertas que solo abren con luz solar o lunar ([Screen Rant](https://screenrant.com/sea-stars-interview-thierry-boulanger/); [Sabotage](https://sabotagestudio.com/press-release/sea-of-stars-the-highly-anticipated-turn-based-rpg-from-sabotage-studio-primed-for-playstation-consoles-in-2023/)).
- **Eastward.** La crítica elogia la "unión meticulosa de píxeles e iluminación 3D". Sus ciudades están llenas de casas, plantas y cables "y aun así se sienten abiertas" ([PC Gamer](https://www.pcgamer.com/eastward-review); [NME](https://nme.com/reviews/game-reviews/eastward-review-an-artful-ode-to-classic-jrpgs-that-doesnt-know-when-to-stop-talking-3045111)). La densidad es tolerable cuando la luz separa los planos.

### 1.6 Decadencia y restauración como retroalimentación

- **Ico y Shadow of the Colossus.** Usan una paleta desaturada, luz sobreexpuesta y bloom en ruinas, con referencias de Piranesi y De Chirico. La melancolía sale de la *restricción*, no del gris total ([AesDes](https://aesdes.org/2017/01/25/aesthetic-explorations-fumito-uedas-video-games); [Cook & Becker](https://www.cookandbecker.com/en/artwork/2004/ico-sie-japan-studio.html)).
- **Okami.** Las zonas malditas tienen hierba "enfermiza, teñida de púrpura". Al restaurar, el verde "explota" con microrrecompensas (cada flor) y la panorámica final del árbol guardián ([PC Gamer](https://pcgamer.com/why-i-love-restoring-nature-in-okami); [GamesRadar](https://gamesradar.com/okami-hands-on)).
- **Gris.** Cada prueba devuelve un color al mundo, y con cada parte de la naturaleza restaurada surge una mecánica ([Game Informer](https://gameinformer.com/2019/01/16/gris-is-the-best-modern-game-about-overcoming-trauma); [Giant Bomb, Color Restoration](https://giantbomb.com/wiki/Concepts/Color_Restoration)).
- **Chrono Trigger.** Los tilesets de 600 y 1000 d. C. son el mismo arte con otra paleta ([TCRF](https://new.tcrf.net/Chrono_Trigger_(SNES)/Unused_Graphics)). Es la técnica barata para pasar del estado "olvidado" al "restaurado".
- **El debate de la "pintura amarilla" (Naughty Dog y otros).** Marcar en color los objetos interactuables ayuda cuando el realismo los esconde, pero se percibe como paternalista si es burdo ([Wikipedia](https://en.wikipedia.org/wiki/Yellow_paint_debate); [Game Rant](https://gamerant.com/naughty-dog-yellow-color-coding-environments-progression-design/)). En Ohmdal el "amarillo" puede ser diegético: **el cobre y la cerámica de los bornes**, que solo pertenecen a las instalaciones.

---

## 2. Cómo se ve un reino medieval olvidado (y no un jardín alegre)

1. **Cambiar el verde por ocres y oliva gris.** La mayor parte del suelo debe ser hierba seca, tierra y piedra. El verde vivo es la *recompensa* de la restauración (Okami, Gris), no el estado por defecto.
2. **Flores casi ausentes en zonas sin restaurar.** Que sean secas, con tallos pardos. Las flores vivas aparecen solo donde alguien cuida algo, como señal narrativa (la casa habitada o el taller), o tras restaurar.
3. **Las ruinas y la utilería en desuso cuentan la historia**, no la flora: ruedas paradas, faroles rotos, cables caídos y musgo apagado en la piedra.
4. **Restricción, no gris total** (la lección de Diablo IV). Un 10 % de acentos cálidos se reserva para personajes y cobre.
5. **Contraste entre zonas muertas y restauradas como progreso.** Las zonas restauradas recuperan saturación de flora, densidad de flor y luces encendidas. Las no restauradas siguen secas y frías. Esto debe vivir **en los materiales del entorno**, no en un post-proceso que también apague a los personajes.

**Paleta de referencia [propuesta]** (sRGB, con iluminación de mediodía neutra):

| Rol | Olvidado | Restaurado |
|---|---|---|
| Hierba dominante (60 %) | `#8C8559` paja, `#757556` oliva gris | `#6F8A4E`, `#7E9455` |
| Tierra y sendas | `#9A8466` (más clara que la hierba) | igual |
| Piedra y muros (30 %) | `#7D7A72`, `#6A6862` | igual, más limpia |
| Matas y árboles | `#5E6448`, `#6B5A43` (pardo) | `#4F6B3E` |
| Flor (≤ 3 % / ≤ 10 %) | tallos secos `#8E7A5A` | `#C9A23A`, `#B6563F`, `#8A7FB8` |
| Acento de instalación | cobre `#C27A3E`, cerámica `#E6DFCF`, pátina `#4F8F86` | cobre que emite `#FFB060` |
| Ropa de NPC y jugador | tierra roja `#9A3B2E`, índigo `#3E4F86`, mostaza `#C99A2E` | igual |

---

## 3. Densidad de flora y utilería: dónde sí y dónde no

Principios (Level Design Book, Witness, Riot, espacio negativo):

- **Bordes y marcos densos; centro jugable limpio.** Los setos y bosques ya enmarcan el valle, y eso está bien. El interior caminable debe ser un "plano de suelo" acotado en valor y saturación, como el *ground plane* de Riot.
- **Cada elemento interactuable lleva un anillo vacío**: "fondo sencillo alrededor de los objetivos" o el claro de la hoguera de Dark Souls.
- **Un foco primario por pantalla y dos secundarios como máximo** [propuesta, derivado de la jerarquía primario/secundario/terciario y de "uno o dos anclajes"]. El resto es terciario y no compite.

**Números [propuesta]** con sprites de 1,5 m:

| Zona | Regla |
|---|---|
| Anillo de instalación (poste con bornes, puente de cobre, regulador, palanca) | **r ≤ 2,0 m: nada de flora** (suelo o tierra pisada). **2,0–3,5 m: solo pasto bajo ≤ 0,35 m**, con densidad ≤ 15 %. Sin flores en r ≤ 4 m. |
| NPC en su posición de reposo | r ≤ 1,5 m sin flora; 1,5–2,5 m solo pasto ≤ 0,3 m. |
| Senda, plaza y área caminable | Altura de flora ≤ 0,35 m (≤ 25 % de la altura del personaje); densidad ≤ 20 % de celdas. |
| Borde no caminable | Matas de 1–1,9 m y densidad de 60–90 %. Aquí puede ir todo el detalle. |
| Pantalla | ≤ 30 % del área jugable visible con detalle de alta frecuencia (flores, matas mezcladas). ≤ 3 especies o sprites distintos en un radio de 4 m. |
| Flores | Olvidado: ≤ 3 % de las plantas, solo en 1–2 puntos narrativos por lugar. Restaurado: ≤ 10–12 %, en manchas (no salpicadas uniformemente). |

Correcciones directas en `flora.js`:
- **Invertir `EDGE` y `GARDEN` para instalaciones, NPCs y utilería**: en vez de "más y más altas al pie de la utilería", el entorno de lo interactuable se despeja. `EDGE` y `GARDEN` quedan solo para muros y edificios que *no* son interactuables.
- Crear la función `keepsClear(X,Z)` con las posiciones de instalaciones (del circuito exportado) y de los NPC, con los radios de la tabla, igual que `quietMountKeepsClear`.
- Bajar `LOW` (interior), que hoy siembra hasta ~42 % (`r > patch*.5-.08`), a ≤ 20 %, y `WILD` (fuera), que llega hasta ~74 %, a ≤ 55 % salvo en el borde.

---

## 4. Personajes legibles sobre suelo cargado

1. **Sombra de contacto (blob)** bajo cada actor: elipse de 1,0 × 0,5 veces el ancho del sprite, opacidad 0,40–0,55 y borde suave [propuesta]. Ancla al personaje al diorama y crea un halo oscuro que lo separa del pasto.
2. **Contorno de 1 px** en el tono oscuro del color local, no negro puro. Si el sprite ya lo tiene, conviene un **rim light** suave en el lado lejos de la cámara al anochecer, como hacen TF2 y Ori.
3. **Exentar a los actores del grading de "olvido"** y, a ser posible, de la desaturación nocturna: que mantengan la saturación ≥ 0,9 aunque el mundo esté a 0,55. Ori lleva este principio al extremo con su autoiluminación al 100 %.
4. **Contraste de valor actor-suelo de al menos 20 puntos L\*** en el anillo de 1,5 m [propuesta]. La ropa del personaje debe ser más cálida y saturada que cualquier planta (la saturación vive en el 10 %).
5. **Plano focal del tilt-shift en el jugador**, con el pasto del primer plano desenfocado (como en Link's Awakening). Nunca debe haber flora alta entre la cámara y el personaje. Ya existe la regla de "ni un árbol entre la cámara y un valle"; falta aplicarla a matas de más de 0,8 m a menos de 2 m al sur del actor.

---

## 5. Instalaciones: el sistema de acento

- **Color reservado**: el cobre, el azul apagado de retorno y la cerámica de los bornes **no aparecen en ningún otro objeto del escenario**. Es la versión diegética de la "pintura amarilla".
- **Charco de luz o suelo propio**: un decal de tierra pisada o losa más clara (+10–15 L\* respecto a la hierba) de 1,5–2 m de radio bajo cada instalación. De noche, un *light pool* cálido, como el fondo oscurecido y los personajes con luz propia de Diablo III.
- **Líneas guía**: sendas más claras que la hierba y cables de cobre que *apuntan* a la instalación y al receptor.
- **Landmarks** (weenies): el Faro, el castillo sellado y las ruedas de agua tienen silueta propia y son visibles desde lejos. Que la flora no los tape.

---

## 6. Checklist de implementación priorizada

**P0: alto impacto y poco coste**
1. [ ] **Mover la desaturación de "olvido" del post-proceso a los materiales del entorno** (suelo, flora, roca y edificios), con un uniforme `uForgotten` o multiplicando el color de vértice de la flora. Los actores y las instalaciones quedan fuera. Si hay que mantener el post-proceso, limitar su suelo a 0,8 y compensar a los actores (saturación ×1,25).
2. [ ] **Zonas libres alrededor de lo interactuable** en `flora.js` (r = 2 m en instalaciones y 1,5 m en NPCs; sin flores a menos de 4 m). Quitar `EDGE` y `GARDEN` en torno a la utilería interactuable.
3. [ ] **Paleta seca para la flora no restaurada**: reutilizar el multiplicador `DRY_CROP` (o similar, hacia paja y oliva) en el color de vértice de `flora-a`, `flora-b` y `bosque-*` cuando el área no está restaurada. Bajar el `tint` medio de 0,86–1,06 a 0,72–0,9 en el interior caminable para oscurecer el plano del suelo.
4. [ ] **Sombra blob** bajo jugador y NPCs.

**P1: jerarquía y progresión**
5. [ ] Reducir la densidad: interior ≤ 20 %, flores ≤ 3 % sin restaurar, altura ≤ 0,35 m en lo caminable.
6. [ ] **Restauración radial al estilo Okami**: al reparar, la flora del área pasa de seca a viva en una onda desde la instalación (≈ 6–8 m/s) y aparecen flores en manchas.
7. [ ] Decal de suelo y light pool por instalación; emisivo de cobre solo con corriente (ya existe).
8. [ ] Tilt-shift con el plano focal en el jugador; la flora alta del borde sur se recorta o se desvanece cuando está a menos de 2 m del actor.

**P2: control de calidad**
9. [ ] Modo `?qa=gray` (escala de grises) y `?qa=squint` (desenfoque de 8–12 px) en `qa-direction.html`. Prueba de aceptación: en ambos modos, el jugador, cada NPC y cada instalación se identifican en menos de 1 segundo.
10. [ ] Prueba automática: muestrear la luminancia media del sprite del actor frente al anillo de 1,5 m de suelo en las capturas de QA y fallar si ΔL\* < 20. Contar las plantas en el radio de cada instalación y fallar si alguna invade la zona libre.
11. [ ] Auditar 60/30/10 por lugar con un histograma de tono y saturación de la captura: ≤ 10 % de píxeles con saturación > 0,5, y que esos píxeles caigan sobre actores o instalaciones.

---

## 7. Resumen de números

| Parámetro | Valor [propuesta] |
|---|---|
| Saturación (HSV) de la flora sin restaurar | 0,15–0,30 |
| Saturación de la flora restaurada | 0,30–0,45 |
| Saturación de acentos (ropa, cobre) | 0,55–0,80 |
| Valor del suelo y la flora | banda media, L\* 35–60; nunca 0 % ni 100 % (Riot) |
| Contraste actor/instalación vs. suelo | ΔL\* ≥ 20 |
| Zona libre de instalación | 2,0 m sin flora; 3,5 m solo pasto ≤ 0,35 m; 4 m sin flores |
| Zona libre de NPC | 1,5 m; 2,5 m solo pasto bajo |
| Altura máxima de flora en zona caminable | 0,35 m |
| Densidad interior / borde | ≤ 20 % / 60–90 % |
| Flores sin restaurar / restauradas | ≤ 3 % / ≤ 10–12 % |
| Focos por pantalla | 1 primario + ≤ 2 secundarios |
| Detalle de alta frecuencia en pantalla | ≤ 30 % del área jugable |
| Sombra blob | 1,0 × 0,5 del ancho del sprite, α 0,40–0,55 |
| Suelo de la instalación | r 1,5–2 m, +10–15 L\* |
| Proporción de color | 60 suelo apagado / 30 piedra y madera / 10 acento jugable |
