# Dirección ambiental — salas de Ohmdal, Arco I

Este documento fija el contexto visual previo a generar cada chunk. Complementa la grilla y los prompts: `apagado` significa que la red eléctrica-mágica no emite luz, no que todos los espacios sean interiores ni negros.

## Regla temporal del arco

- U1: llegada nocturna a una plaza triste y detenida; luz ambiente fría, sin terror.
- U2: Castillo recorrido de noche; exterior frío y espacios interiores sellados.
- U3: Forja activa durante la noche; contraste entre aire nocturno y calor industrial todavía muerto en los fondos base.
- U4: Terrazas exteriores durante la tarde tardía y el atardecer; la resolución confirma “el valle verde al atardecer”.
- U5: Faro y lago de noche; la cima mira un lago negro y el cierre muestra todo Ohmdal encendido de noche.

Cada fondo representa la primera llegada, antes de la restauración de su unidad. Phaser agrega encendidos, agua animada, glow, chispas y cambios de estado simples.

## Matriz por chunk

| Sala | Tipo espacial | Momento y luz base | Contexto que debe verse | Lectura narrativa |
|---|---|---|---|---|
| `plaza` | exterior urbano | noche, ambiente frío de cielo cubierto/luna difusa | cielo en arcos, fachadas, murallas y caminos abiertos | reino detenido pero habitable, no terrorífico |
| `puerta` | patio exterior contra muralla | noche fría, cobre sin emisión | cielo sobre almenas y profundidad hacia la plaza al sur | umbral solemne que alimenta la ciudad |
| `manantial_ohm` | santuario exterior/patio de manantial | noche húmeda, reflejo natural tenue | cielo abierto, roca húmeda, vegetación y nacimiento del canal | origen antiguo del cobre, quietud viva |
| `castle_gate` | atrio exterior del Castillo | noche, fachada recortada contra cielo | fachada alta, cielo, acceso desde plaza; no cuatro paredes interiores | institución cerrada y vigilada |
| `castle_gallery` | interior | penumbra violeta, luz fría por ventanas altas | corredor ceremonial profundo, techo implícito, fila de lámparas apagadas/tenues como props | austeridad convertida en doctrina |
| `castle_branches` | interior | penumbra sellada, mínimos reflejos de cobre | tres bocas de taller clausuradas y tronco central | miedo real al exceso, remedio equivocado |
| `castle_heart` | interior monumental | penumbra profunda, luz cenital natural mínima | sala circular bajo cúpula, tres distritos sugeridos | corazón administrativo que dejó de repartir |
| `forge_yard` | exterior industrial | noche, cielo con humo tenue; ningún glow eléctrico | patio abierto, chimeneas y siluetas de naves; vista lejana al valle | trabajo detenido que todavía conserva calor material |
| `forge_infirmary` | interior/taller | luz cálida residual de velas rituales no eléctricas + penumbra | pared de fusibles, banco y estantes | cementerio práctico, íntimo y algo absurdo |
| `forge_longchannel` | exterior semicubierto | noche, luz lunar fría y estructura industrial oscura | canal que cruza patio viejo, tuberías y edificios encima/al fondo | distancia y peaje; no pasillo palaciego |
| `forge_hall` | interior industrial grande | penumbra cálida muerta, tragaluces nocturnos | nave alta, chimeneas, tres máquinas apagadas | escala productiva y ritmo ausente |
| `terraces_top` | exterior rural | tarde tardía, luz natural oblicua | ladera, cultivos secos, valle descendente | miedo inmóvil ante una red conectada |
| `terraces_mid` | exterior rural | atardecer temprano, dorado apagado | dos niveles: arriba encharcado, abajo reseco | reparto injusto visible en la tierra |
| `terraces_mural` | exterior arqueológico | atardecer, luz rasante | muro grabado en ladera, valle y vegetación | conocimiento antiguo expuesto al clima |
| `terraces_aqueduct` | exterior panorámico | crepúsculo, transición a azul nocturno | acueducto completo, tres niveles y lago al este/sur | primera predicción; el mundo se abre hacia el Faro |
| `lighthouse_hall` | interior costero | noche, luz lunar por vanos, máquinas apagadas | piedra clara, sala impecable, lago visible por aberturas | mecanismo cuidado que espera una idea |
| `lighthouse_bench` | interior/taller costero | noche fría, lámparas eléctricas apagadas | banco del Farero, ventana o galería al agua | paciencia y tiempo convertidos en espacio |
| `clock_tower` | interior vertical | noche, franjas de luna por ventanas | engranajes, altura, vacío vertical y esfera detenida | pulso mecánico ausente |
| `lighthouse_lantern` | exterior semicubierto en altura | noche cerrada, lago negro y cielo abierto | lente central, balconada, muelle/lago abajo; horizonte amplio | clímax contemplativo, el faro debe dominar el paisaje |
| `taller` | interior | noche, ventana alta azul; calidez no eléctrica muy tenue | cuarto cargado de objetos, paredes y umbral a plaza | refugio humano caótico dentro de un mundo apagado |

## Control previo a imagegen

Antes de cada prompt escribir explícitamente:

1. `Tipo espacial`.
2. `Hora y luz natural`.
3. `Qué se ve más allá del recinto`.
4. `Qué está apagado eléctricamente`.
5. `Qué emoción narrativa comunica el lugar`.

Si cualquiera de esos cinco puntos falta, el prompt no está listo.
