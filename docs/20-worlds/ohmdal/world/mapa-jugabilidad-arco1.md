# Mapa de jugabilidad de salas — Ohmdal, Arco I

Este documento acompaña `src/jugar/roomScenes.ts`. El PNG define la apariencia;
la ficha de escena define qué parte de esa apariencia se puede caminar.

## Convenciones

- Lienzo lógico: 960 × 540 px.
- `walkable`: unión de rectángulos transitables. Fuera de esa unión hay colisión.
- `collision`: obstáculos dentro del piso (pozos, maquinaria, distribuidores, mural).
- `doors`: zonas de transición alineadas con los umbrales visibles del render.
- `entries`: punto seguro de llegada según la sala de origen.
- `perspective`: escala interpolada por Y para protagonista y PNJ. Los exteriores
  lejanos usan 0,48–0,70; los espacios medios 0,64–0,86; los interiores 0,82–1.
- Los props horneados conservan interacción pero no duplican su cuerpo procedural.
- En desarrollo, la tecla `H` muestra verde = caminable, rojo = sólido y azul = puerta.

## Salas incorporadas

| Unidad | Salas | Tratamiento de cámara y gameplay |
|---|---|---|
| U1 | plaza, taller, puerta, manantial_ohm | Plaza/patio a escala media; taller interior; puerta y manantial con corredores ajustados a arcos y calzada. |
| U2 | castle_gate, castle_gallery, castle_branches, castle_heart | Explanada lejana; interiores progresivamente más cerrados; distribuidores integrados como obstáculos. |
| U3 | forge_yard, forge_infirmary, forge_longchannel, forge_hall | Patio y canal a escala lejana; enfermería/nave a escala media; maquinaria y hogares sólidos. |
| U4 | terraces_top, terraces_mid, terraces_mural, terraces_aqueduct | Todos exteriores lejanos; navegación por caminos, escalinatas y bordes de cultivo, no sobre parcelas. |
| U5 | lighthouse_hall, lighthouse_bench, clock_tower, lighthouse_lantern | Salas circulares con anillos caminables; pozo/reloj/lente centrales sólidos; accesos laterales alineados. |

## Efectos ligados al progreso

- `puertaDone`: puerta abierta, red y manantial con brillo/agua.
- `solvedGalleryChain`, `solvedBranches`, `castleRestored`: pulsos del castillo.
- `solvedFuseInfirmary`, `solvedLongChannel`, `forgeRestored`: luz y brasas de la forja.
- `valleyRestored`: reflejos de agua a lo largo de las terrazas y el acueducto.
- `solvedStoredSpark`, `solvedSleepingRiver`, `clockRestored`: pulsos del faro/reloj.
- `lighthouseRestored`: lente encendida y haz giratorio sobre el lago.

La prueba estricta de conectividad usa las colisiones reales, los props sólidos y
cada punto de entrada por separado. Desde cada llegada exige alcanzar todos los
umbrales y todas las interacciones de la sala. Resultado actual: 20 salas, 42
transiciones, 130 objetos runtime y 0 rutas bloqueadas.

## Continuidad global

- La Forja ocupa el oeste de la fila central: Patio → Enfermería → Canal Largo → Nave mayor.
- Castillo, Terrazas y Faro conservan recorridos de ida y vuelta hacia la Plaza.
- Al restaurar el Faro aparece un ferry diegético desde la Linterna hasta la Plaza.
- El mapa de zona muestra el mundo completo aun dentro de una sala pintada mediante
  un esquema espacial legible: conserva conexiones y orientación, sin comprimir las
  distancias literales de los distritos ni deformar el pergamino 4:3.
- Los acompañantes comunes entre dos salas recorren el piso hasta el umbral, cruzan
  con un fundido breve y vuelven a entrar por la puerta de origen; no se recrean a la
  vista del jugador.
- Los “bancos” técnicos de los puzzles no se montan como obstáculos independientes:
  su interacción se ancla a la máquina, canal, mural, compuerta, reloj o lente real.
