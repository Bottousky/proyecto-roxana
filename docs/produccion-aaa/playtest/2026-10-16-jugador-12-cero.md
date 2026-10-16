# Informe de playtest 12 (jugador desde cero)

Juego: Ohmdal · La Luz (http://localhost:4190/)
Perfil simulado: chico/chica de 12 a 15 años o adulto curioso, sin conocimientos de electricidad.
Pestañas: "seed" (abierta por navigate, luego desapareció mientras jugaba), "tab-2" (mía, creada con tabs_create al final). "tab-1" es de otro jugador y no la toqué.

## Resultado: playtest INCOMPLETO (bloqueado por estado compartido)

No llegué a jugar ninguna mesa. Se corta en el primer minuto por dos razones:

1. El origen http://localhost:4190 guarda la bitácora en el navegador y ese almacenamiento es compartido entre los jugadores de prueba. "Comenzar un nuevo viaje" reemplaza la bitácora de todos.
2. Mientras jugaba, otra sesión pisó mi partida: al reabrir el juego, la bitácora volvió a mostrar "Castillo de la Red · Tarde, día 1 · 4 de 9 luces encendidas · 16 min de viaje", que no es la partida que empecé. Mi partida nueva (2 min, bitácora en blanco) ya no estaba.

Decidí no volver a pisar el guardado compartido (no quiero borrar el progreso de otro tester) y no seguir jugando sobre el guardado ajeno, porque los resultados no serían de un jugador desde cero.

## Bitácora de lo que sí vi

- Pantalla de título "OHMDAL · LA LUZ": "Continuar el viaje", "Comenzar otro viaje", "Opciones". Tono claro, buena primera impresión: "El mundo no perdió su luz. Olvidó cómo encenderla."
- "Comenzar otro viaje" abre un diálogo "UN NUEVO COMIENZO" con tres botones: "Guardar una copia de mi bitácora", "Comenzar un nuevo viaje", "Conservar mi viaje". El texto avisa que reemplaza la bitácora de este navegador. Bien que lo avise; pero para un chico que lo abre por primera vez, "bitácora" no dice nada, y el aviso no explica qué se pierde.
- Al hacer clic en "Comenzar otro viaje" y en "Comenzar un nuevo viaje", la URL pasa a `/?tramo=castle` (parámetro de pruebas del desarrollo). Un jugador real no debería ver ese parámetro ni arrancar en el Castillo de la Red con "4 de 9 luces".
- Creación de personaje: campo "Tu nombre" (placeholder "Mateo"), selectores de pelo, piel, abrigo y bufanda, botón "Cruzar el Portal". Lo usé con "Lu", pelo oscuro, abrigo granate, bufanda roja. Se ve claro y simpático.
- Bug de la primera vez: al pulsar "Cruzar el Portal" con la referencia de la primera carga, el formulario se cerró sin empezar (la referencia quedó obsoleta). Reintentando todo, funcionó. Un jugador que haga clic en un lugar equivocado podría pensar que el juego se cayó.
- Tras "Cruzar el Portal" aparece "Abriendo los caminos de Ohmdal" y luego la escena: el Portal Ω sobre una piedra en un pueblo con casas de piedra, río y árboles. Bonito y claro.
- Primer diálogo (Bitácora, "OBSERVACIONES DE VIAJE"): "El Portal Ω te suelta sobre la piedra tibia... tu Bitácora todavía está en blanco." Entendible como introducción.
- Segundo diálogo: "???" (la muchacha de la escuela): "¡Cruzaste! ¡Alguien cruzó!" Luego "Lu - DEL INSTITUTO ROXANA: ¿Eso no pasa seguido?". Historia y tono bien; el retrato de los personajes ayuda.
- Diálogos avanzan con Enter. Funciona.
- Tras el tercer diálogo, la pestaña se cerró ("Preview tab seed is no longer open"). Se volvió a abrir como tab-2 y el guardado ya no era el mío (ver arriba).

## Lo que no pude evaluar (faltó jugar)
- Mesas de electricidad, puzzles, pistas, uso de la Bitácora en el juego, navegación con flechas dorada/discos de color, arte de interiores, ritmo, final en el Faro.

## Top a mejorar (provisional, sólo lo visto)
1. Estado compartido: la bitácora es un guardado único por origen, así que dos jugadores se pisan. Para pruebas hace falta un perfil o un origen separado por tester (o una partida por pestaña).
2. El parámetro `?tramo=castle` aparece al empezar un viaje nuevo y arranca en el Castillo con 4 luces. Revisar que un viaje nuevo no herede un tramo de prueba.
3. Al cerrarse la pestaña en medio de un diálogo, la sesión se pierde sin aviso ni recuperación.
4. El aviso de "Comenzar un nuevo viaje" usa la palabra "bitácora" sin explicarla al público de 12 a 15 años.
5. Al pulsar en "Cruzar el Portal" con un elemento obsoleto, el formulario se cierra sin avisar.

## Top de lo mejor (provisional)
1. Pantalla de título con tono y frase de entrada muy buenos.
2. Personalización del personaje clara y simpática.
3. Diálogos con retratos y nombre del hablante; fáciles de seguir con Enter.
4. Escena inicial del portal: bien iluminada y con buena profundidad.
5. Historia con gancho ("¡Cruzaste! ¡Alguien cruzó!").

## Pendiente
- Repetir el playtest con una partida aislada (otro origen o perfil) para seguir desde el Portal y llegar a las mesas y al Faro.
