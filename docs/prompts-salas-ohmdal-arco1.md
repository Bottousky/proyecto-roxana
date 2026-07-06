# Prompts de generación — salas del Arco 1 de Ohmdal (GPT-image)

**Qué genera este doc:** para cada sala del Arco 1, el **fondo base** (ambiente estático y
apagado, 960×540, cenital) + los **props aislados** (sprites con fondo transparente) que se
montan encima. Coordenadas y salidas salen de `docs/grilla-mundo-ohmdal.md` (CANON).

**Qué NO se genera (lo hace el motor):** transiciones, apertura de puertas, glow/luces,
partículas (chispas, brasas, haz del faro), penumbra por flags, agua/animaciones. Regla del
Director: **no animamos puertas**; los estados que sí importan (lámpara **encendida ↔ apagada**,
faro on/off, brasero on/off) se generan como **dos imágenes estáticas** y el motor cruza entre
ellas. El arte interno de los puzzles (aguja, banco, bandas) **no se toca**.

Base de técnica: guías de prompting de GPT-image (OpenAI cookbook · pixverse). Reglas que se
aplican abajo: (1) encabezar con el **tipo de entregable**; (2) **aspect ratio temprano**;
(3) cámara y luz explícitas; (4) **exclusiones duras**; (5) para props, fondo transparente con
“silueta nítida, sin halos ni fringing”; (6) **bloquear paleta, escala y dirección de luz** en
todo el set para consistencia; iterar con cambios chicos (“misma paleta y grano que la anterior”).

---

## 0. Bloques reutilizables (pegar en cada prompt)

**[ESTILO] (idéntico en TODO el set — no variar):**
> Pixel art 16-bit estilo RPG de consola portátil (GBA), grano fino y contorno legible.
> Vista **cenital 3/4** (top-down ligeramente inclinada), escala de tile 48 px. Luz **neutra,
> difusa y apagada** desde arriba (el mundo está “dormido”, sin restaurar). Paleta cálida
> medieval con acentos de **cobre y turquesa** (la electricidad-magia). Sin texto, sin logos,
> sin marca de agua, sin personajes, sin interfaz.

**[BASE] plantilla de fondo de sala:**
> Fondo de sala para juego RPG cenital, **relación de aspecto 16:9 (960×540)**. [ESTILO].
> Contenido: {DESCRIPCIÓN}. Composición: {SALIDAS/BORDES}, dejar zonas de calma (no saturar).
> La **red de cobre** (dos hilos paralelos, ida y retorno) corre por el suelo **apagada**
> (cobre con pátina) entrando por {BORDE} y saliendo por {BORDE OPUESTO}. **Estado apagado:**
> lámparas y máquinas sin luz, sin glow ni chispas. No incluir props movibles ni personajes
> (se montan aparte). Bordes que dan a mar/vacío/otra región **cerrados** con muralla o
> acantilado; los bordes de salida marcados quedan **abiertos y alineados** para ensamblar con
> la sala vecina.

**[PROP] plantilla de prop aislado:**
> Sprite de prop de juego, **fondo transparente**, silueta nítida, bordes limpios, **sin halos
> ni fringing**. [ESTILO]. Objeto: {DESCRIPCIÓN}, ~{ALTO} px de alto, apoyado (base al pie).
> Una sola pieza centrada, sin sombra proyectada (la sombra la pone el motor). {ESTADOS}.

> **Nota de exportación (todos):** generar a 2× y reducir con vecino más cercano; recortar;
> verificar transparencia; registrar en `data/asset_manifest.json`. Para dos estados, misma
> cámara/encuadre exactos y **cambiar solo lo indicado**.

---

## 1. U1 — Plaza / Puerta / Manantial

### `plaza` (0,0) — Campana · centro
**BASE:**
> {[BASE]} Contenido: **plaza medieval empedrada y apagada** de un reino que olvidó su
> electricidad; fuente técnica central de piedra (vacía, sin figura), mosaico circular con un
> patrón de **circuito** en el suelo, faroles apagados, un mosaico del triángulo V/I/R gastado.
> Salidas: **N** arco hacia la muralla (a la Puerta), **O** portón de castillo (cerrado con
> cordón), **E** umbral techado del taller, **S** un arco chico (portal) y un camino que baja.
> Cobre apagado cruzando de N a S y ramificando al E. Zonas de calma en las esquinas.

**Props aislados de esta sala:**
- **Farol de plaza** — [PROP], farol medieval de pie de cobre y vidrio, ~52 px.
  ESTADOS: **(a) apagado** (vidrio opaco, gris) · **(b) encendido** (vidrio ámbar cálido, sin
  añadir glow: el resplandor lo pone el motor). *(ya existe placeholder `prop_lamp_post`.)*
- **Fuente/pedestal de Ohm** — [PROP], pedestal circular de piedra tipo fuente técnica antigua,
  nudo central de cobre donde convergen 4 pares de canales, ~64 px. Estado apagado (sin la
  criatura Ohm, que es sprite aparte). *(placeholder `prop_pedestal`.)*
- **Campana de Ohmdal** — [PROP], campana de bronce sobre soporte de madera y cobre, ~80 px.
  Estado único, quieta (el tañido y las líneas de vibración las pone el motor).
  *(placeholder `prop_bell`.)*
- **Portal al Instituto** — [PROP], arco de piedra clara con marco de cobre y cortina de luz
  tenue, ~120 px. Estado único, en reposo (el shimmer lo pone el motor).
- **Umbral del taller de Lumen** — [PROP], fachada/umbral de taller de dos aguas con cartel
  colgante SIN texto (símbolo de una piedra/resistor estilizado), ~200 px.

### `puerta` (0,−1) — Puerta de Ohm · N
**BASE:**
> {[BASE]} Contenido: **patio estrecho contra la muralla norte**, calzada de cobre que sube
> hacia el centro-norte. Salidas: **S** abierto a la plaza (la calzada baja), **N** ocupado por
> la Puerta monumental (borde cerrado por la Puerta). Piedra oscura, solemne.

**Props:**
- **Puerta de Ohm** (pieza héroe) — [PROP], puerta monumental de dos hojas de piedra y cobre,
  ojo de aguja central y símbolo **Ω** grabado, canales de cobre en par subiendo por el marco,
  ~256×320 px. **Estado único: cerrada y apagada.** (La apertura y el río de chispa cruzando el
  vano los hace el motor; **no animar la puerta**.)

### `manantial_ohm` (0,−2) — N
**BASE:**
> {[BASE]} Contenido: **cámara del manantial**, una fuente/estanque técnico antiguo del que
> nace el cobre hacia el sur. Salidas: **S** a la Puerta. Musgo, piedra húmeda, quietud.

**Props:**
- **Boca del manantial** — [PROP], surtidor de piedra con anillo de cobre, ~90 px, apagado.

---

## 2. U2 — El Castillo (columna NO, ascenso)

Paleta local: **violetas profundos** + cobre. Luz aún más tenue (interior sellado).

### `castle_gate` (−1,0)
**BASE:**
> {[BASE]} Contenido: **portón interior del castillo**, muralla ceremonial de sillar violáceo,
> arco de cobre. Salidas: **E** a la plaza, **N** a la galería. Estandartes descoloridos.

### `castle_gallery` (−1,−1)
**BASE:**
> {[BASE]} Contenido: **galería en cadena**, hilera de columnas y un solo canal de cobre que
> las recorre en serie (apagado). Salidas: **S** al portón, **N** a los ramales.

### `castle_branches` (−1,−2)
**BASE:**
> {[BASE]} Contenido: **sala de los ramales**: un tronco/repartidor central de cobre del que
> salen varios canales paralelos. Salidas: **S** a la galería, **N** al corazón. Apagado.

**Props:**
- **Tronco/Repartidor** — [PROP], bloque-distribuidor de cobre y piedra con varias bocas de
  canal, ~140 px, apagado.

### `castle_heart` (−1,−3)
**BASE:**
> {[BASE]} Contenido: **corazón del castillo**, sala circular con mosaico radial y el viejo
> mecanismo repartidor al centro (apagado, derrochador). Salidas: **S** a los ramales, **N**
> portal sellado (al Corazón Nuevo, Arco II — borde cerrado por ahora).

---

## 3. U3 — La Forja (fila O, descenso industrial)

Paleta local: **ámbar/cobre** sobre piedra oscura. En apagado, el ámbar está **tibio-muerto**.

### `forge_yard` (−1,1)
**BASE:**
> {[BASE]} Contenido: **patio de la Forja**, piso de adoquín industrial, canales de cobre que
> entran por el suelo y **entibian** (glow ámbar NO: apagado), portón de fundición. Salidas:
> **E** portal a la plaza (camino), **O** a la enfermería. Cajas, hollín.

**Props:** barril cerámico, cajón de madera, pila de lingotes (todos [PROP], ~40–56 px, sin luz).

### `forge_infirmary` (−2,1)
**BASE:**
> {[BASE]} Contenido: **enfermería de fusibles**: pared con fusibles colgados como medallas,
> banco bajo, estantes. Salidas: **E** al patio, **O** al canal largo.

**Props:** **fusibles colgados** ([PROP], ristra de fusibles cerámicos, ~48 px).

### `forge_longchannel` (−3,1)
**BASE:**
> {[BASE]} Contenido: **canal largo** de cobre grueso que atraviesa la sala de E a O, tubería
> de servicio. Salidas: **E** a la enfermería, **O** a la nave. Vapor sugerido, apagado.

### `forge_hall` (−4,1) — pieza mayor (1 o 2×1)
**BASE:**
> {[BASE]} Contenido: **nave mayor de la fundición**: dos chimeneas, hogar central grande,
> canales gruesos. Salidas: **E** al canal largo (fondo O cerrado, muro exterior). Brasas
> **apagadas** (el fuego lo pone el motor).

**Props:**
- **Hogar/fragua** — [PROP], boca de fragua de piedra, ~120 px. ESTADOS: **(a) apagada**
  (carbón gris) · **(b) encendida** (carbón rojo tenue; el fuego/partículas los pone el motor).

---

## 4. U4 — Las Terrazas (columna S, descenso al valle)

Paleta local: **verdes/teal**, piedra clara. El agua va **apagada/quieta** (anima el motor).

### `terraces_top` (0,1)
**BASE:**
> {[BASE]} Contenido: **primera terraza del acueducto**: un canal de piedra con par de hilos de
> cobre por el borde y un **escalón** por el que el agua caería. Salidas: **N** a la plaza, **S**
> a la terraza siguiente. Cultivos secos a los lados.

### `terraces_mid` (0,2)
**BASE:**
> {[BASE]} Contenido: **terraza de reparto**, el canal se divide por niveles. Salidas: **N/S**.

### `terraces_mural` (0,3)
**BASE:**
> {[BASE]} Contenido: **muro-escalera resistiva**: una escalinata de piedra con canales en
> cascada. Salidas: **N/S**. Musgo entre juntas.

### `terraces_aqueduct` (0,4)
**BASE:**
> {[BASE]} Contenido: **acueducto bajo** que desemboca en la **orilla del lago** al este.
> Salidas: **N** a la terraza, **E** a la sala de máquinas del Faro. Borde S = orilla/agua.

**Props (compartidos U4):** **compuerta de madera** ([PROP], compuerta de esclusa de tablas y
herraje de cobre, ~56 px, cerrada).

---

## 5. U5 — Faro y Reloj (fila S, junto al lago)

Paleta local: **azules fríos**, piedra clara. Ferry (barca) reaparece al cierre.

### `lighthouse_hall` (1,4)
**BASE:**
> {[BASE]} Contenido: **sala de máquinas del Faro** sobre la orilla, bobinas y un estanque de
> piedra al centro (el capacitor, apagado). Salidas: **O** al acueducto, **E** al banco.

### `lighthouse_bench` (2,4)
**BASE:**
> {[BASE]} Contenido: **sala del banco del estanque**, marco de trabajo junto al agua (el arte
> del puzzle NO va aquí: solo el marco de la sala). Salidas: **O/E**.

### `clock_tower` (3,4) — pieza alta (1 o 1×2)
**BASE:**
> {[BASE]} Contenido: **base de la Torre del Reloj**: engranajes tras una ventana rota, columna
> que sube, esfera de cobre con una sola aguja (detenida). Salidas: **O** al banco, **E** a la
> linterna.

**Props:** **esfera del reloj** ([PROP], esfera de cobre con una aguja, ~120 px, detenida y
oxidada — el andar lo pone el motor); **engranaje** ([PROP], ~48 px).

### `lighthouse_lantern` (4,4)
**BASE:**
> {[BASE]} Contenido: **cámara de la linterna del Faro** en lo alto, lente facetada al centro,
> y abajo un **muelle** sobre el lago. Salidas: **O** al reloj, borde S/E = agua (ferry a la
> plaza). Cielo nocturno insinuado.

**Props:**
- **Lente/linterna** — [PROP], lente facetada con montura de cobre, ~90 px. ESTADOS:
  **(a) apagada** · **(b) encendida** (vidrio claro; el haz rotante lo pone el motor).
- **Muelle** — [PROP], muelle corto de madera con farol de cobre, ~192 px.
- **Barca** — [PROP], barca de remos con farolito, ~64 px, vista 3/4, apuntando a la derecha.

---

## 6. Interior — Taller de Maese Lumen (`taller`, U1, por portal)

**BASE:**
> Fondo de **interior** de sala para juego RPG cenital, 16:9 (960×540). [ESTILO]. Contenido:
> **taller de artificiero cálido y caótico** — mesa central, bancos de trabajo, bobinas y
> generadores, planos viejos en la pared, un escudo con el triángulo **V/I/R** gastado, un tazón
> de sopa sobre una mesa, ventana alta con luz tenue. Salidas: **S** umbral a la plaza (resto de
> bordes = paredes). Estado apagado, sin la Lámpara Eterna encendida.

**Props:** **banco de trabajo** ([PROP], ~170 px), **estantes con frascos** ([PROP], ~120 px),
**fusibles colgados** (reusar el de la Forja), **generador** ([PROP], bobina de cobre, ~80 px).

---

## 7. Tilesets de suelo/red (apagados; el “encendido” es overlay del motor)

- **Red de cobre 48 px** — tileset (recta H/V, curvas ×4, T ×4, cruce, terminal) en **PAR de dos
  hilos** separados 8 px; estado **apagado** (cobre pátina). El estado encendido (turquesa con
  glow) es un overlay que dibuja Phaser, no una imagen aparte de fondo.
- **Adoquín / piedra / césped / ruina** — ya cubiertos por los tilesets curados
  (`assets/ohmdal/tilesets/`); usar esos, no regenerar.

---

## 8. Checklist por sala (antes de dar por lista una imagen)

1. 960×540 (o múltiplo), cenital 3/4, paleta del set, luz apagada. ✅
2. Bordes de salida abiertos y **alineados** con el vecino (cotejar “Salidas” en la grilla). ✅
3. Bordes sin salida cerrados (muralla/acantilado/agua). ✅
4. Sin personajes, sin props movibles, sin lámparas encendidas/glow/chispas, sin texto. ✅
5. Props aislados con fondo transparente, sin halos; estados on/off con encuadre idéntico. ✅
6. Registrada en `data/asset_manifest.json` y ubicada por `ox,oy` de la grilla. ✅
