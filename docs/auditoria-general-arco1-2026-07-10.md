# Auditoría general de jugabilidad — Arco I

Fecha de cierre: 10 de julio de 2026.

## Resultado

El Arco I queda conectado de punta a punta en 20 salas pintadas. Las cinco unidades
tienen ida y regreso, los accesos se corresponden con el mapa global y ninguna
entrada deja al jugador encerrado por colisiones, props o hitboxes de puzzles.

## Correcciones aplicadas

### Mundo y navegación

- Se corrigió la geografía global de la Forja para respetar la grilla canónica.
- El mapa de zona ya no colapsa a una sola sala cuando se usa un fondo pintado.
- Se validan por separado todas las entradas de cada sala contra todas sus salidas.
- Los puntos ilegales de aparición se corrigen al punto navegable más cercano, no al
  centro arbitrario de la sala.
- Se agregó el ferry de regreso Linterna → Plaza después de restaurar el Faro.
- Los acompañantes usan rutas sobre las colisiones reales al salir y entrar de sala.

### Escena, personajes y props

- La escala de protagonistas y PNJ interpola por profundidad: exteriores lejanos,
  espacios medios e interiores usan rangos distintos.
- Los PNJ de U3 y del Manantial que hablaban sin cuerpo visible ahora tienen sprite.
- Se impide que flags históricos repueblen con la comitiva unidades ya terminadas.
- Se corrigieron posiciones fuera de piso, superposiciones de spawn y PNJ solapados.
- Se incorporaron campana, barril, cajón y lingotes como props de escena.
- Se retiraron carteles, atriles y estanterías sin correlato visual o función narrativa.

### Interacciones y puzzles

- Los bancos técnicos duplicados fueron retirados. Cada puzzle se abre desde su
  elemento diegético: lámparas, ramales, repartidor, canal, pared de fusibles,
  tablero, compuerta, terraza, mural, acueducto, máquina, reloj o lente.
- Los prompts ya describen el objeto real y no muestran “Usar el banco”.
- Los primeros puzzles de U3, U4 y U5 exigen haber conocido antes a Yesca, la
  Guardiana o el Farero.
- El Timbre prueba A y B por separado y representa redundancia real: cualquiera de
  los dos caminos correctos puede hacerlo sonar.
- El cierre de U2 se reevalúa sin importar si se resolvió primero el Timbre o la
  anomalía de la chispa guardada.
- El Faro exige predecir y observar un ciclo completo antes de validar; la capacidad
  del depósito modifica de verdad el tiempo de descarga.
- Se eliminaron fondos genéricos de banco dentro de las interfaces de puzzle.

## Verificación automatizada

- `npm test`: suite completa aprobada.
- R4: 20 salas, 42 transiciones, 130 objetos runtime, sin rutas bloqueadas.
- R8: cinco unidades y cierre final con camino de ida y regreso a la Plaza.
- `npm run build`: TypeScript y bundle de producción aprobados.

## Verificación en navegador

Se comprobó a 1440 × 900:

- Patio de la Forja nocturno con escala lejana y elenco de U3 correcto.
- Mapa completo desde una sala pintada, con la Forja ubicada al oeste.
- Cruce Patio → Enfermería con cuatro acompañantes caminando por el umbral.
- Enfermería sin banco fantasma y con la interacción anclada a la pared de fusibles.
- Linterna restaurada con salida Torre del Reloj + ferry a la Plaza.
- Consola del navegador sin errores de juego.
