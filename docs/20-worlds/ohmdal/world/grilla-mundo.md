# Grilla maestra del mundo de Ohmdal — posicionamiento de salas/chunks

**Estado:** **CANON (2026-07-05).** El mapa isla (`assets/ohmdal/ohmdal-complete-map.png`) es la
fuente de verdad geográfica; esta grilla la baja a coordenadas de chunk. Las celdas del Arco II
y el Empalme son **reservadas/aproximadas** (se afinan al construir esos arcos).

**Arquitectura (decisión 2026-07-05):** cada sala es un **recinto cerrado con arcos**; los
enlaces entre salas son **transiciones** (`⟿`), no bordes caminados. Por eso cada fondo se
genera **autocontenido** (murallas propias + arcos), sin ensamblar bordes con la vecina. En el
motor: `RoomDef.background` (clave de textura) hace la sala **standalone** (ignora el mundo
continuo), llena el chunk 960×540 con el fondo pintado y usa `RoomDef.collision` para los muros;
las puertas de la sala pasan a transición. Los `═` de la tabla son la geografía conceptual (qué
sala limita con cuál), pero se **implementan como `⟿`**. Referencia viva: `plaza` (fondo
`assets/ohmdal/rooms/plaza.png`).

**Objetivo:** un plano único de coordenadas donde cada sala del RPG tiene una celda fija,
coherente con `assets/ohmdal/ohmdal-complete-map.png` (el mapa isla, fuente de verdad
geográfica) y abarcando **todos los arcos** (I, II y el Empalme). Sirve para (a) fijar la
geografía, salidas y continuidad de la red entre recintos y (b) fijar los offsets de
`world.ts`. Los fondos no cosen píxeles entre sí: cada salida termina en un arco de transición.

Encima de cada sala generada se montan luego **props** (sprites) y **efectos** (glow, partículas,
penumbra) por Phaser/CSS: el fondo generado es el **ambiente estático en estado apagado**.

---

## 1. Convención de coordenadas

- **Celda = 1 chunk = 960 × 540 px** (la cámara lógica). `ox = col × 960`, `oy = row × 540`.
- **Ejes:** `col+` = este, `row+` = sur. La plaza es el origen `(0,0)`.
- **Salidas** por borde: `N` (arriba), `S` (abajo), `E` (derecha), `O` (izquierda).
- **Tipo de enlace entre salas:**
  - **borde continuo (═)**: dos chunks ortogonalmente adyacentes; se camina cruzando el
    borde. Sus bordes dibujados **deben ensamblar sin costura** (mismo suelo/red de cobre).
  - **portal (⟿)**: transición con fundido (regiones no adyacentes, interiores, ferry). No
    necesitan ensamblar bordes.
  - **borde cerrado**: cualquier borde de una celda que NO aparezca en “Salidas” se dibuja
    cerrado (muralla, acantilado, mar o seto), aunque haya otra celda del otro lado. Dos
    regiones adyacentes que no comparten enlace (p. ej. Forja y Terrazas) se separan así.
- **Salas “héroe” multi-chunk:** por defecto cada sala es 1 chunk. Si una merece más aire
  (plaza, Corazón), se anota `2×1`, `1×2`, etc. y ocupa varias celdas.

---

## 2. Brújula del mapa isla (anclaje global)

```
                         N
              Castillo(U2)   Corazón(U9)            · · · Robot(Empalme, NE lejano)
        NO  ┌───────────┐  ┌──────────┐                        ┌────────┐
            │  U2 · NO  │  │  U9 · N  │        Balanza(U8, NE)  │Empalme │→ (portal a
            └───────────┘  └────┬─────┘        ┌──────────┐     └────────┘   Programación)
   Forja(U3)                    │              │  U8 · NE │
   O  ┌──────────┐         ┌────┴─────┐        └────┬─────┘
      │  U3 · O  │═════════│ U1 PLAZA │· · · · · · · │  Casa de Compuertas(U7, E)
      └──────────┘  (portal)│  (0,0)  │═(E)══ ┌──────┴───┐
            ║               └────┬─────┘      │  U7 · E  │
   Terrazas(U4)                  ║ (S)        └────┬─────┘
   SO ┌──────────┐         ┌─────┴────┐           │
      │  U4 · SO │         │ U4 baja  │       Esclusas(U6, SE)
      └────┬─────┘         └─────┬────┘       ┌─────┴────┐
           ║                     ║            │  U6 · SE │
           └─────── Faro+Reloj(U5, S) ════════└──────────┘
                    ┌──────────────────┐
                    │      U5 · S       │  ⟿ ferry a la plaza (línea punteada del mapa)
                    └──────────────────┘
                         Lago (centro-sur)
```

La **red de cobre** (los canales en el suelo) sigue las direcciones de los caminos del mapa:
al dibujar cada sala, el cobre entra por el borde que da al vecino y sale por el borde opuesto.

---

## 3. Grilla de celdas (ASCII, col −4…5 × row −3…4)

`[XX]` = celda ocupada. Arco I en el centro/oeste/sur; Arco II al este/norte; Empalme al NE.

```
        col-4   col-3   col-2   col-1    col0     col1    col2    col3    col4   col5
row -3                          castHrt  coraz9                   balan8c                robot
row -2                          castBrn  manant                   balan8b
row -1                          castGal  puerta                   balan8a
row  0                          castGat [PLAZA]           casa7a
row  1  frgHall frgLng  frgInf  frgYard  terTop           casa7b
row  2                                   terMid
row  3                                   terMur          escl6a  escl6b
row  4                                   terAqu  lhHall  lhBench  clockT  lhLant
```

> Delta con el código actual (`world.ts`): hoy la **Forja está al ESTE** (`col 1…4, row 0`).
> El mapa la pone al **OESTE**; esta grilla la mueve a `col −1…−4, row 1`. Es el único cambio
> de una sala ya construida. Todo lo demás de Arco I ya coincide.

---

## 4. Tabla maestra de salas

Estado: **✅** construida · **◻︎** por construir (Arco II / Empalme).

| Sala (id) | Arco·U | Ícono mapa | Compás | col,row | ox,oy | Chunks | Salidas (borde → destino · tipo) | Qué dibujar (fondo apagado) | Estado |
|---|---|---|---|---|---|---|---|---|---|
| `plaza` | I·U1 | Campana | Centro | 0,0 | 0,0 | 1 (o 2×2) | N═puerta · O═castle_gate (sellado hasta U2) · O⟿forge (Camino a la Forja, tras U2) · E⟿taller (U1) · E⟿casa U7 (Arco II) · S═terraces_top (sellado hasta U3) · S⟿Instituto (portal) · ⟿ferry a Faro | Plaza empedrada, fuente central, lámparas apagadas, mosaico circuito, arcos a cada salida | ✅ |
| `puerta` | I·U1 | Puerta (bajo campana) | N | 0,−1 | 0,−540 | 1 | S═plaza · N═manantial (traba hasta puertaDone) | Muralla con la Puerta de Ohm monumental (ojo de aguja, Ω), calzada de cobre | ✅ |
| `manantial_ohm` | I·U1 | — | N | 0,−2 | 0,−1080 | 1 | S═puerta | Manantial/fuente técnica antigua, cobre naciendo del norte | ✅ |
| `castle_gate` | I·U2 | Castillo | NO | −1,0 | −960,0 | 1 | E═plaza (sellado hasta U2) · N═castle_gallery · S═forge_yard (opcional continuo) | Portón del castillo, muralla ceremonial | ✅ |
| `castle_gallery` | I·U2 | Castillo | NO | −1,−1 | −960,−540 | 1 | S═gate · N═branches | Galería en cadena, columnas | ✅ |
| `castle_branches` | I·U2 | Castillo | NO | −1,−2 | −960,−1080 | 1 | S═gallery · N═heart | Sala de ramales (el Tronco/Repartidor) | ✅ |
| `castle_heart` | I·U2 | Castillo | NO | −1,−3 | −960,−1620 | 1 | S═branches · N⟿corazon_nuevo(U9) | Corazón del castillo, mosaicos, el viejo Repartidor | ✅ |
| `forge_yard` | I·U3 | Fragua | O | −1,1 | −960,540 | 1 | E⟿plaza(Camino a la Forja) · O═infirmary · N═castle_gate(opc) | Patio de la Forja, canales tibios (ámbar), portón industrial | ✅ (mover O) |
| `forge_infirmary` | I·U3 | Fragua | O | −2,1 | −1920,540 | 1 | E═yard · O═longchannel | Enfermería de fusibles | ✅ (mover O) |
| `forge_longchannel` | I·U3 | Fragua | O | −3,1 | −2880,540 | 1 | E═infirmary · O═hall | Canal largo caliente | ✅ (mover O) |
| `forge_hall` | I·U3 | Fragua | O | −4,1 | −3840,540 | 1 (o 2×1) | E═longchannel | Nave mayor de la fundición, brasas, chimeneas | ✅ (mover O) |
| `terraces_top` | I·U4 | Escalera | S/SO | 0,1 | 0,540 | 1 | N═plaza · S═mid | Primer nivel del acueducto, canal + escalón | ✅ |
| `terraces_mid` | I·U4 | Escalera | S | 0,2 | 0,1080 | 1 | N═top · S═mural | Reparto por niveles | ✅ |
| `terraces_mural` | I·U4 | Escalera | S | 0,3 | 0,1620 | 1 | N═mid · S═aqueduct | Mural/escalera resistiva | ✅ |
| `terraces_aqueduct` | I·U4 | Escalera | S | 0,4 | 0,2160 | 1 | N═mural · E═lighthouse_hall | Acueducto bajo, desemboca al lago | ✅ |
| `lighthouse_hall` | I·U5 | Faro+Reloj | S | 1,4 | 960,2160 | 1 | O═aqueduct · E═bench | Sala de máquinas del Faro, orilla del lago | ✅ |
| `lighthouse_bench` | I·U5 | Faro+Reloj | S | 2,4 | 1920,2160 | 1 | O═hall · E═clock_tower | Banco del estanque (capacitor) | ✅ |
| `clock_tower` | I·U5 | Faro+Reloj | S | 3,4 | 2880,2160 | 1 (o 1×2) | O═bench · E═lantern | Torre del reloj, engranajes, esfera de cobre | ✅ |
| `lighthouse_lantern` | I·U5 | Faro+Reloj | S | 4,4 | 3840,2160 | 1 | O═clock_tower · ⟿ferry a la plaza | Linterna del faro, lente, haz; muelle y barca | ✅ |
| `corazon_nuevo` | II·U9 | Corazón | N | 0,−3 | 0,−1620 | 1 (o 2×2) | S⟿castle_heart | El Corazón Nuevo (fuente switching) que late | ◻︎ |
| `tribunal_*` | II·U8 | Balanza | NE | 3,−1…−3 | 2880,−540… | 3 | O⟿corredor norte · S⟿casa | Tribunal de los Empujes, balanza monumental (op-amp) | ◻︎ |
| `casa_compuertas_*` | II·U7 | Casa | E | 2,0 / 2,1 | 1920,0… | 2–3 | O⟿plaza(este) · N⟿tribunal · S⟿esclusas | Casa de las Compuertas (transistor), compuertas comandadas | ◻︎ |
| `esclusas_*` | II·U6 | Compuerta | SE | 1,3 / 2,3 | 960,1620… | 2 | O═faro · N⟿casa | Esclusas del lago (diodo), válvulas de un solo sentido | ◻︎ |
| `empalme_robot` | Empalme | Robot | NE lejano | 5,−3 | 4800,−1620 | isla | ⟿puente desde el norte · ⟿portal a Programación (E) | Islote del Club de Robótica; puente y portal violeta | ◻︎ |

### Interiores y hubs (fuera del plano continuo, por portal)

| Sala | Enlace | Nota |
|---|---|---|
| `taller` (Taller de Lumen, U1) | ⟿ portal desde `plaza` (borde E) | Interior de cámara fija; no ocupa celda del plano |
| Salas de banco de puzzles | ⟿ desde su sala dueña | El arte de puzzles NO se toca (decisión del Director) |
| Instituto (hall/aulas) | ⟿ portal desde `plaza` (borde S) | Escena/mundo aparte; el portal siempre aterriza en la plaza |

---

## 5. Guía para generar cada sala en ChatGPT

1. **Formato:** top-down (cenital ligeramente inclinado, estilo GBA), **960 × 540 px** por chunk
   (o el múltiplo si la sala es 2×1, 2×2…). Generar a 2× (1920×1080) y reducir con vecino
   más cercano da bordes más limpios.
2. **Solo ambiente estático y APAGADO.** Nada de lámparas encendidas, glow, partículas ni
   personajes: eso se monta encima con Phaser/CSS y se enciende por flags. Dibujar el mundo
   “dormido”.
3. **Salidas canónicas:** cada enlace de la tabla debe aparecer como arco o umbral legible en
   el borde conceptual indicado. No hace falta que sus píxeles ensamblen con el fondo vecino:
   el motor usa una transición. Los bordes sin salida se cierran con arquitectura o paisaje.
4. **Red de cobre = guía de navegación:** dos hilos paralelos (ida y retorno) que entran por el
   borde del vecino indicado y cruzan hacia la salida opuesta. Apagados: cobre con pátina.
5. **Zonas de calma:** no llenar cada tile de detalle; dejar aire para leer la jerarquía
   (regla de `mapa-ohmdal-greybox.md`). Piezas héroe (Puerta, fuente, faro, corazón) legibles
   al 25 %.
6. **Paleta por zona:** plaza teal/cobre; Castillo violetas; Forja ámbar/cobre; Terrazas
   verdes/teal; Faro azules fríos; Corazón/Arco II según su emblema.
7. **Ancla de estilo:** adjuntar un tile/render ya aprobado y pedir “misma paleta y grano”.

Cada fondo entra al juego como imagen del chunk; los props (`ThingDef.sprite`) y la
penumbra/luz por flags se dibujan encima. Para nuevas producciones, el contrato de cámara,
guía jugable, prompts y validación vive en `docs/sistema-arte-ohmdal-v1.md`.

---

## 6. Deltas a aplicar en código (cuando se apruebe)

1. **Mover la Forja al oeste** en `world.ts` (`forge_*` de `col 1…4,row 0` → `col −1…−4,row 1`)
   y reorientar la puerta “Camino a la Forja” de la plaza (hoy borde E) al borde que
   corresponda. Es el único reacomodo de salas ya construidas.
2. Reservar las celdas del este/norte para Arco II y la del NE lejano para el Empalme.
3. Al generar cada fondo, reemplazar el pase procedural de esa sala por la imagen (capa nueva
   en el sistema `decor`/fondo), manteniendo props y efectos por encima.
