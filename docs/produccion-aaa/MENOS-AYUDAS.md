# Menos ayudas, un mundo más claro (2026-10-18)

Pedido del usuario después de 34 jugadores sin contexto: «¿realmente hacen falta tantas ayudas?
Pokémon no tiene tantas, porque el juego es claro en cuanto a historia». Las ayudas venían de
quejas de agentes que juegan leyendo texto en una pestaña lenta; cada una tapaba un problema del
mundo en lugar de arreglarlo.

## Qué cambió

| Ayuda o problema | Antes | Ahora |
|---|---|---|
| Flecha dorada | Siempre sobre el siguiente paso | Pista: aparece tras 75 s sin avance, o al abrir la Guía o el mapa (pedir ayuda). `?flecha=siempre` sólo en desarrollo, para `qa-flecha.mjs` |
| Discos de color y carteles | Los dos, y carteles largos («✓ Hecho · deshacer: reconectar el puente gastado») | Quedan los discos; los carteles son cortos («✓ Hecho», «Todavía no»). Deshacer sigue pidiendo dos usos |
| Manivelas del mundo | 19, casi todas «andá y tocá esto» antes de la mesa | 3 del jugador: el puente de cobre de la Calzada (el cortocircuito), el archivo mojado del Castillo (aislar una rama) y el retorno del Lago (cerrar el camino). Las otras 16 las opera quien cuida cada instalación, en su escena (`story: true` en `content.js`, `DIALOGUE_EFFECTS`): Lumen une su mesa, Edda los postes, Vega da agua a la rueda, Ivara reúne los servicios (y salta la protección), Yesca trae su horno, Vega abre el canal, Nereo prepara el Faro |
| Manivelas del jugador | Cajas chicas como las demás | Una vez y media más grandes, con un cartel de bronce y un disco más grande; las de los cuidadores son escenografía, sin disco ni cartel |
| Decoración que parecía usable | Dos engranajes a los lados del portón del Castillo (el jugador 29 los tomó por las manivelas) | Quitados |
| Gente en el paso | Edda, Nereo, Ivara, Tala y Marín esperaban entre dos cosas que el jugador usa | Corridos; `tests/inhabitants-paso.test.js` lo comprueba en todo el arco (nadie a menos de 1 m del camino recto entre dos cosas del jugador, ni a menos de 2 m de una manivela suya) |
| Diálogos | Indicaciones de lugar («la manivela de la izquierda, junto a…») | Historia: qué le pasa a cada uno y qué hizo; la acción del jugador la cuenta el mundo |
| Objetivos | Rutas («Entre la mesa I y la mesa II hay dos manivelas…») | El problema de alguien: «Ivara selló toda la red porque se mojó el archivo oeste. La enfermería y la cocina siguen a oscuras» |

## Un problema por lugar, contado por un personaje

| Lugar | Quién | Problema |
|---|---|---|
| Portal | Edda | Un pequeño de bronce que no despierta |
| Taller | Lumen | Cambió tres veces la lámpara y sigue sin encender |
| Calzada | Edda | Unió los postes como en el dibujo y las balizas no responden; en el medio hay un puente que el dibujo no tiene. Después, el cerrojo empuja para el lado equivocado |
| Manantial | Tala, Vega | ¿Dónde está la fuerza de un farol? La rueda gira y la bomba no sube el agua |
| Castillo | Ivara | Selló toda la red por una rama mojada; la enfermería y la cocina siguen a oscuras |
| Terrazas | Yesca, Vega | Un solo cable de la ladera para el horno y el riego |
| Lago | Nereo | Las balizas del muelle no contestan |
| Faro | Nereo | El núcleo se calla o se recalienta; la corona no gira; la linterna no sostiene la señal |

## Compatibilidad

Una partida guardada antes de este cambio recibe al entrar a un lugar las banderas que habrían
puesto las escenas que ya vio (`enterArea` en `src/game/main.js`).

## Pendiente

- NO VERIFICADO con personas: el próximo paso es una prueba con alguien de 12 a 15 años, desde cero.
- El mapa del reino no se volvió a hornear (los cambios de escena son chicos).
