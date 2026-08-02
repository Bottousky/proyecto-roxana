# Biblia de dirección visual

**Estado:** canon visual; hipótesis técnicas requieren evidencia del slice
**Quality bar permanente:** DRAGON QUEST III HD-2D REMAKE — igual coherencia y pulido en menor
escala, identidad propia y cero copia de propiedad intelectual.

## Manifiesto

Ohmdal debe sentirse como una maqueta viva construida para comprenderse. Piedra, cobre, agua,
cerámica, madera y vidrio conservan huellas de uso. Los personajes pixel art no flotan sobre un
fondo: comparten perspectiva, oclusión, luz de contacto y atmósfera con el 3D. La restauración
reorganiza lectura, actividad y sonido; no consiste en saturar colores o encender neón.

La referencia oficial se conserva como fuente de lenguaje general desde [Square
Enix](https://dragonquest.square-enix-games.com/games/es-xl/dragon-quest-3-hd2d-remake/). Capturas
o footage usados en análisis deben registrar URL, fecha y finalidad crítica. No se redistribuyen
assets, música, UI, mapas, personajes ni composiciones de la referencia.

## Gramática de escala

- Unidad: metro; origen de cada módulo a nivel de suelo.
- Maniquí humano: 1,72 m; puerta cotidiana 2,1–2,4 m.
- Dioramas regionales compactos, con profundidad suficiente para tres planos de lectura.
- Overworld simbólico: landmarks exagerados y distancias comprimidas; no comparte escala física
  con interiores.
- Un mecanismo pedagógico importante debe poder leerse junto al personaje y su consecuencia.
- Microdetalle se concentra donde cámara/acción lo justifican; el reverso invisible no consume
  presupuesto.

## Composición

Cada encuadre tiene:

1. foco primario: personaje, mecanismo o transformación;
2. trayectoria de lectura: camino, cobre, agua, luz o gesto;
3. profundidad: foreground recortable, plano jugable y landmark;
4. información causal: fuente/intervención/consecuencia visibles o conectadas sin ambigüedad;
5. descanso visual para UI y subtítulos.

No usar clutter para simular calidad. La densidad se aprueba cuando cada prop explica oficio,
historia, escala o interacción.

## Cámara

- `PerspectiveCamera` suave o lente larga que se aproxime a una proyección ortográfica; la
  elección final se realiza por captura A/B.
- Encuadres autorales por volúmenes con transiciones suaves; sin rotación libre.
- Zoom limitado y accesible, sin revelar reversos no producidos.
- Oclusores de foreground se desvanecen o recortan; techos se gestionan por habitación.
- Puzzle: personaje, puntos de medición y respuesta deben permanecer legibles.
- Mobile: reencuadre específico; no limitarse a recortar el canvas desktop.
- Movimiento de cámara reducido respeta opción de accesibilidad.

## Personajes pixel art

### Contrato

- Pivote exacto en los pies y escala consistente.
- Billboard vertical o plano orientado por cámara; no gira continuamente mostrando papel.
- Idle, locomoción, inspección, instrumento, Bitácora, reacción y explicación.
- Sombra/contacto coherente, oclusión por profundidad y respuesta lumínica mínima.
- Retrato y sprite comparten silueta, colores y accesorios.
- Cuatro diseños completos del estudiante; no editor modular.

### Direcciones

No se fija «ocho» por ritual. Antes de producir atlas:

1. analizar footage oficial de la referencia en exterior, interior, diagonales, escaleras y giro;
2. registrar ángulos/cambios observables sin extraer assets;
3. montar el mismo recorrido con atlas de 4 y 8 direcciones;
4. probar todas las cámaras del slice, desktop y mobile;
5. elegir el mínimo sin snaps visibles, deslizamiento lateral falso ni pérdida de actuación.

Si cuatro pasa todos los encuadres, se descartan ocho. Si falla uno obligatorio, se adoptan ocho
para protagonistas; usar menos en NPC exige que la inconsistencia no sea visible en su cámara.

## Ohm

Comparar sprite/impostor con modelo procedural 3D. El 3D es preferible sólo si mejora lectura de
sensor, pivotes, brazos, tapa, contacto y luz sin romper el contraste HD-2D. Debe comunicar estado
por forma, animación, texto y sonido; color no basta.

## Arquitectura y kits

### Cuenca de Ohm

Piedra clara erosionada, cobre expuesto, agua detenida, mosaicos didácticos incompletos. Portal,
Plaza, Taller, Puerta y Manantial comparten piezas, pero cada landmark conserva silueta propia.

### Castillo de la Red

Masa institucional, repetición, lacres y conducciones distribuidas. La restauración abre rutas y
secciona sistemas; no vuelve el castillo lujoso.

### Forja y Terrazas

Gradiente vertical de calor a agua/tierra. Cerámica aislante, hierro, cobre grueso, canales y
vegetación condicionada por distribución. La seguridad se lee en distancia y protección.

### Faro y Lago

Vidrio, bronce, agua oscura y ritmos de luz. Nereo mantiene superficies de contacto impecables
dentro de una infraestructura detenida. El cierre sucede al crepúsculo/noche.

Cada kit define módulo, esquina, transición, zócalo, abertura, baranda, suelo, decal/daño,
conducción y prop repetible. Ninguna región se entrega como malla única.

## Materiales

- **Cobre:** oxidación localizada y continuidad visual; emissive sólo cuando representa estado.
- **Piedra:** variación por módulo, humedad y reparaciones; evitar ruido uniforme.
- **Cerámica:** aislación y componentes; bordes/roturas controlados.
- **Agua:** profundidad, flujo y reflejo adaptativos; su estado comunica sistema.
- **Madera:** taller, reparación y calor humano; no fantasía genérica medieval.
- **Vidrio:** instrumento, lente y lectura de señal; transparencia presupuestada.

Compartir materiales y atlases donde no destruya identidad. Los materiales de estado usan
parámetros/variantes, no duplicados opacos sin control.

## Luz y tiempo

El slice progresa de tarde a crepúsculo. La luz natural pierde protagonismo mientras el sistema
comprendido introduce luz motivada. Una región restaurada mantiene sombras, desgaste y zonas sin
servicio: comprender no vuelve perfecto el mundo.

- Mobile: 0–1 luz con sombra.
- Desktop: una principal; segunda sólo con evidencia.
- Luces de mecanismos pueden ser emissive/baked o sin sombra.
- Exposición y grading no esconden falta de contraste.
- Destellos cumplen límites de frecuencia y modo de reducción.

## VFX

Tres capas:

- **causal:** conducción, apertura, calor, protección, flujo, oscilación;
- **ambiental:** polvo, niebla, insectos, gotas, vegetación;
- **celebración:** transformación breve y localizada.

Los VFX causales tienen prioridad y equivalente accesible. Las partículas ambientales se reducen
primero en mobile. No usar electricidad arcana para un circuito DC normal.

## Agua

El agua es infraestructura y atmósfera. Estados: quieta/detenida, flujo parcial, flujo estable.
Reflejo y refracción escalan por calidad; mobile puede usar normal animada + color/profundidad.
Nunca se usa agua como analogía perfecta de carga sin que la Bitácora declare su límite.

## Posprocesado

Pipeline máximo candidato: tonemapping, bloom selectivo, fog, color grading y AO liviano si aporta
contacto. Profundidad de campo sólo en escenas sin interacción crítica. Cada pase puede apagarse
y debe justificar coste/comparación. No apilar efectos para «parecer AAA».

## UI y Bitácora

DOM nítido, papel/croquis propio y margen compatible con 200% de texto. La UI no copia marcos,
tipografía ni iconografía de Dragon Quest. Los elementos técnicos usan símbolos estándar cuando
corresponde y registran fuente/norma. La Bitácora mezcla dibujo, evidencia y formalización sin
hacer que una fórmula parezca decoración mágica.

## Audio asociado a imagen

Orquesta + electrónica: el motivo acústico existe antes de la reparación; pulsos/señales entran
al comprender. Voces parciales en escenas decisivas. Un evento visual crítico tiene sonido y
subtítulo descriptivo; un evento sonoro crítico tiene indicador visual.

## Presupuesto inicial

| Métrica | Mobile | Desktop |
|---|---:|---:|
| FPS | piso 30; objetivo 45–60 | objetivo 60 |
| Pixel ratio | ≤1,5 adaptativo | ≤2 adaptativo |
| Draw calls visibles | <150 | <250 |
| Triángulos visibles | 150k–300k | 400k–700k |
| Textura común | 512–1024 | 1024 |
| Textura hero | 1024 | 2048 con justificación |
| Luces con sombra | 0–1 | 1 principal |
| Carga inicial slice | objetivo ≤25 MB comprimidos | objetivo ≤25 MB comprimidos |

Android medio de 2022 gobierna el piso. Reducir efectos, densidad, DPR y resolución, nunca escenas
o aprendizaje. Las cifras son contratos hasta medir; no son resultados alcanzados.

## Quality bar

Puntuar 0–5; todos los obligatorios deben alcanzar el gate:

| Criterio | Gate |
|---|---:|
| Composición/cámara | 4 |
| Integración sprite–3D | 4 |
| Escala/silueta | 4 |
| Materiales/luz | 4 |
| Actuación/personajes | 4 |
| Causalidad/interacción | 4 |
| Audio/respuesta | 4 |
| Accesibilidad | 4 |
| Rendimiento desktop | 4 |
| Rendimiento mobile | 3 |
| Identidad propia/legal | 5 |

Evidencia: referencia legal, captura actual y comparación; desktop 1440×900 y mobile 390×844;
cámara/estado deterministas; `renderer.info`, peso, consola, frame time y lista de diferencias. No
ampliar alcance si composición, actuación o causalidad están debajo de 4.
