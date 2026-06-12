# Proyecto Roxana — Ohmdal, Unidad 5
# “La chispa que se queda”

**Versión:** 0.1 — propuesta de diseño (nivel medio de detalle; guion línea por línea antes del build)
**Alcance:** Unidad 5 completa: del Faro apagado (gancho de la U4) al cierre del **Arco I** — Ohmdal entero encendido y latiendo. Paga la anomalía plantada en la U2.
**Tema técnico:** el capacitor como almacén de carga, carga y descarga, la curva RC como *tiempo* (cualitativa), el destello periódico. Primera vez que un circuito tiene **memoria** y **ritmo**.
**Requisito narrativo:** Unidad 4 completada (`unit4Completed`, valle regado). Idealmente `sawStoredSpark` (la anomalía de la U2) en la Bitácora.
**Estado:** borrador para revisar con el autor. Nada implementado.

---

## A. Síntesis de la unidad (canon propuesto)

### A.1. Premisa

Desde la U2 hay una anomalía sin pagar en la Bitácora: *algo brilló tres segundos sin camino*. Contradice TODO lo aprendido — y esa contradicción es el motor de la unidad. La respuesta vive junto al lago: el **Faro**, que no alumbraba fijo sino que **latía**, y el **Reloj de Ohmdal**, parado desde los Maestros. Los dos esconden la misma pieza: el **Estanque** — el lugar donde la chispa se queda.

> **«Sin camino no pasa nada. Eso aprendimos. Y sin embargo, algo brilló.»**

La unidad introduce las dos ideas que el arco entero estaba esperando para cerrar: **memoria** (la chispa puede guardarse) y **tiempo** (llenar un estanque por un canal angosto tarda — y ese tardar se puede elegir). Un almacén que se llena despacio y se vuelca de golpe es un corazón que late: el Faro parpadea, el Reloj marca, y Ohmdal queda **vivo en el tiempo**.

Frase central:

> La chispa que se queda no rompe las reglas. Las espera.

### A.2. Léxico diegético de la Unidad 5

| Técnico | Diegético | Momento de conversión |
|---|---|---|
| capacitor | el Estanque | Bitácora, tras el Faro |
| carga / descarga | llenar / volcar | Bitácora, tras el Faro |
| constante de tiempo (RC) | el ritmo («estanque por canal») | Bitácora, tras el Faro (solo como producto cualitativo) |
| oscilador de relajación / destello periódico | el latido | Bitácora, tras el Faro |
| capacidad | el tamaño del estanque (chico / mediano / grande) | físico, se ve |

**Sin instrumento nuevo**: se usan los dos modos de Ohm (río y brazos). La pieza nueva de banco es el **Estanque** (tres tamaños) y el **umbral de volcado** (el borde del estanque: al llenarse, vuelca de golpe).

### A.3. Diseño de puzzles — una variable nueva por puzzle

| Puzzle | Concepto | Manipulación | Feedback de fallo |
|---|---|---|---|
| La chispa que se queda | recrear la anomalía de la U2: el estanque guarda | cargar, cortar el camino, ver brillar | ninguno: asombro puro (tutorial) |
| El río que se duerme | la carga no es instantánea: el río decae al llenarse | mirar la aguja MIENTRAS se llena; cambiar estanque y canal | ninguno: observación — la aguja ES el contenido |
| El Reloj de Ohmdal | un llenado con umbral = un tic | elegir estanque y freno para el tic correcto | el Reloj adelanta o atrasa: se oye y se ve |
| El Faro (evento mayor) | el latido calibrado; equivalencia de ritmos | calibrar estanque + freno contra la placa del Faro | el Faro «tartamudea» o se queda fijo; los barcos del mural responden |

**Aritmética canónica** (cualitativa pero consistente — verificar en build):

- **Ritmo = Estanque × Freno.** Estanques 1 / 2 / 4; frenos: las piedras de siempre (marrón 1 / roja 2 / amarilla 4 / gris 8).
- **El Reloj:** tic objetivo = ritmo 4 → estanque 1 × amarilla, estanque 2 × roja, estanque 4 × marrón: **tres soluciones válidas**, y Ohm celebra la equivalencia («Otro estanque. El mismo tiempo.») — el eco directo del Repartidor (U2) y del reparto justo (U4): la regla de la casa.
- **El Faro:** la placa de los Maestros pide un latido más lento (ritmo 8) y un volcado breve: estanque grande + freno de llenado vs. camino de volcado casi libre. Acá se vive la asimetría: **llenar despacio, volcar de golpe** — dos caminos distintos para la misma chispa, con dos frenos distintos. (Es, sin decirlo, el circuito de relajación: R de carga grande, descarga abrupta por umbral.)
- **El río que se duerme** (el corazón conceptual): con Ohm parado en el canal de carga, la aguja arranca fuerte y **muere sola** a medida que el estanque se llena — sin que nadie toque nada. Primera vez en el juego que una aguja se mueve sola en el tiempo. Edda: «No se rompió. Se está llenando. El río afloja cuando el estanque se acerca al borde.» Estanque grande + canal angosto = se duerme despacio; chico + ancho = casi de golpe. La curva RC vivida, jamás nombrada como exponencial.

**Regla de reuso:** piedras, cristales, agujas y los dos modos de Ohm, intactos. La unidad agrega UNA pieza (el Estanque) y con ella, una dimensión entera: el tiempo.

### A.4. Misconcepciones reales que la unidad ataca

| Misconcepción documentada | Dónde se desmiente jugando |
|---|---|
| «Sin camino cerrado no pasa nada, nunca» | la anomalía recreada: el estanque devuelve lo guardado |
| «El capacitor deja pasar la corriente» | Ohm en el canal: el río corre MIENTRAS se llena y muere al llenarse — pasa al principio, no siempre |
| «La carga es instantánea» | el río que se duerme: llenar tarda, y cuánto tarda se elige |
| «Un circuito o funciona o no funciona» | el Reloj que adelanta/atrasa: funciona MAL en el tiempo — el tiempo es una variable de diseño |

### A.5. Personajes

- **El Farero** *(personaje nuevo — propuesta de nombre: **Maese Ciro**; habitante de Ohmdal, mismo criterio pendiente que Brasa y Vega)* — viejo guardián del Faro, medio sordo del trueno del lago, que mantuvo durante décadas un faro que no funciona: lustra la lente, da cuerda a un mecanismo que no late. Es el último ritualista del arco — pero al revés que Lumen: él NO cree en la magia; cree en la **memoria** («latía así: la-aaa-tido… la-aaa-tido. Yo me acuerdo. El ritmo lo tengo acá.»). Su oído es la placa de calibración viva: el Farero reconoce el latido correcto cuando lo escucha. El instrumento final de la unidad es un viejo que se acuerda.
- **La Consejera** — cierre de su arco: viene a anotar la anomalía que en la U2 se negó a registrar («No pienso anotar eso», dijo). Frente al estanque que brilla sin camino, abre el libro y la anota — con fecha de la U2. Beat: la institución aprendiendo a registrar lo que no entiende todavía, que es la definición de la Bitácora. (Resuelve su pendiente de `unidad-2-caminos.md` §8.3.)
- **Edda** — la anomalía era SU pregunta («¿de DÓNDE salió ese río?»). La unidad es su pago intelectual: ella conduce la recreación de la anomalía en banco. Y al cierre del arco, su semilla de futuro: «Cinco lugares encendimos. Quiero que alguien me lo pregunte a MÍ, alguna vez. Quiero estar del otro lado.» (Maestra. Plantado desde U2; el Empalme lo paga.)
- **Maese Lumen** — beat de cierre de arco: dona sus fusibles consagrados al museo de la Forja («que aprendan los jóvenes lo que era el miedo»). Y una línea seria, frente al mapa encendido, que cierra SU historia: «Yo cuidé esto cuarenta años sin entenderlo. Ustedes lo entendieron en cinco lunas. …Gracias por no decirme eso en voz alta.»
- **Ohm** — beat mudo final (sin gastar la reserva): cuando el Faro late por primera vez, Ohm gira hacia la luz y su propio pecho parpadea **al mismo ritmo**, una sola vez. Edda lo ve. No se dice nada. (El autómata también es un estanque que late: semilla técnica y narrativa del Arco II y del Empalme.)

### A.6. Estado de implementación

Sin construir. Patrón U1/U2 + lo heredado (modo brazos, página de predicción). Piezas nuevas: el Estanque (componente con nivel visible que se llena/vuelca en tiempo real — la primera pieza de banco **animada por reloj**, no por input), el umbral de volcado, la lente del Faro. El banco necesita un tick de simulación (novedad técnica: hasta ahora los bancos eran estáticos entre inputs).

---

## 1. Resumen narrativo

El valle regado termina en el lago, y en el lago, el Faro de Vega: «latía, nadie supo nunca con qué corazón». El Farero recibe al grupo en una sala impecable de máquina muerta. Sobre la mesa, la Bitácora abre sola su página vieja: *Anomalía: la chispa que se queda.*

Primer acto (la anomalía, domada): en el banco del Farero se recrea la U2 — un estanque, un canal, cargar, **cortar el camino**… y la lámpara brilla, sola, tres segundos. La Consejera, sin que nadie se lo pida, abre el libro y anota la anomalía con fecha vieja. Ya no es anomalía: es la pieza que faltaba.

Segundo acto (el río que se duerme): la aguja que se mueve sola en el tiempo. Llenar tarda; cuánto tarda **se elige** con el tamaño del estanque y el freno del canal. El tiempo entra al banco como variable, y el juego cambia para siempre.

Tercer acto (el Reloj de Ohmdal): la torre del pueblo, parada desde los Maestros. Un llenado con umbral es un tic; tres soluciones válidas dan el mismo tic. Cuando el Reloj marca de nuevo, **todo Ohmdal lo oye**: es la restauración más pública desde la campana de la U1 (eco deliberado: la U1 le devolvió la voz a la plaza; la U5 le devuelve el pulso al reino).

Evento mayor (el Faro): calibrar el latido contra la única placa que queda — la memoria del Farero. Llenar despacio, volcar de golpe; el ritmo de los Maestros. Cuando el Faro late, el lago entero parpadea con él, y el Farero, de espaldas, dice la línea de la unidad: «Ese. Ese es. …Cuarenta años afinando el oído para esta noche.»

**Cierre del Arco I — la noche de Ohmdal:** secuencia contemplativa final: el mapa entero encendido de noche — la plaza, el Castillo, la Forja en ritmo, las Terrazas regadas, el Reloj marcando, el Faro latiendo sobre el lago. Los cinco lugares, las cinco unidades, visibles en una sola pantalla. La promesa de la U1 («la luz que vuelve») está **cumplida**, no interrumpida. La Bitácora cierra el arco con su entrada mayor.

Gancho al Arco II (plantado, sin urgencia): en lo alto del Faro, el Farero muestra un **ojo de cristal** que mueve una aguja cuando le da la luz. Nadie lo conectó a nada: lo hace solo. Edda: «¿Y a ESE quién lo empuja?» — Un rayo de luz que empuja un río: la materia que decide. (Semiconductores. Otra historia. El juego puede cortar acá con honor.)

---

## 2. Estructura de niveles (resumen — guion fino antes del build)

| Nivel | Mapa | Función | Duración |
|---|---|---|---|
| 0 | Aula de Electrónica (reuso) | proyector módulo 5: «EL TIEMPO. Lo que el río no sabe… todavía.» | 2 min |
| 1 | El Faro, sala del guardián | el Farero; **Puzzle 1: la chispa que se queda** (la anomalía domada); la Consejera anota | 5–6 min |
| 2 | Banco del Farero | **Puzzle 2: el río que se duerme** (tiempo real en banco) | 5–7 min |
| 3 | La torre del Reloj | **Puzzle 3: el Reloj de Ohmdal** (tres soluciones) | 6–8 min |
| 4 | La linterna del Faro | **Puzzle 4 (evento mayor): el latido** | 8–10 min |
| 5 | Cierre del arco | la noche de Ohmdal; el ojo de cristal; Bitácora mayor | 5–6 min |

**Beats de diálogo clave** (a desarrollar):

- Farero, presentación: «¿Vienen por la luz? La luz es lo de menos. Este faro no alumbraba: **avisaba**. Y para avisar hay que latir.»
- Consejera, anotando la anomalía: «Registro fuera de término. Cuarenta años haciendo actas y la primera verdad la anoto tarde. …Que conste.»
- Ohm, ante el estanque lleno: «Camino: cortado. Chispa: presente. Reglas: intactas. Paciencia: detectada.»
- Edda, el río que se duerme: «No se rompió. Se está llenando. ¡Mira la aguja, está RESPIRANDO!»
- Farero, calibración final: «Más lento. …Más lento. …Ese. Ese es. Cuarenta años afinando el oído para esta noche.»

---

## 3. Entradas de Bitácora de la Unidad 5

1. **«La chispa que se queda»** (completa la anomalía de la U2) — vivencial: el estanque cargado brilló sin camino; lo guardado se devuelve. Formal: **el capacitor**, almacén de carga. **Error común:** «el capacitor deja pasar el río» — pasa mientras se llena; lleno, es una pared que recuerda.
2. **«El río que se duerme»** — vivencial: la aguja muriendo sola; estanque grande y canal angosto tardan más. Formal: la **carga no es instantánea**; el tiempo de llenado crece con el estanque y con el freno (dicho como producto vivido, no como τ=RC). ✎ *¿Qué se llena despacio y se vuelca de golpe en tu casa? Pista: hay una en el baño.*
3. **«El tic»** — vivencial: el Reloj y sus tres soluciones equivalentes. Formal: **llenado + umbral = ritmo**; elegir estanque y freno es elegir el tiempo. Nota al pie: *«Mucho después lo llamaron circuito RC. La R y la C son la piedra y el estanque. El tiempo siempre fue de ellos.»*
4. **«El Arco del Río»** (entrada mayor, cierre del arco) — el mapa de Ohmdal dibujado completo con sus cinco restauraciones y las cinco reglas en limpio: la Ley de Ohm, la Regla del Cruce, la Entrega, la Regla de la Vuelta, la Chispa que se queda. Última línea: *«El río ya no es un misterio. Ahora es una herramienta. Lo que sigue no es más río: es enseñarle a decidir.»* ✎ *(página en blanco, titulada: «El ojo de cristal»)*

---

## 4. Flags de la unidad

```txt
playedUnit5Intro
metFarero
solvedStoredSpark
consejera ClosedLedgerArc   → consejeraNotedAnomaly
solvedSleepingRiver
solvedClock
clockRestored
solvedLighthouse
lighthouseRestored
arcOneCompleted            (gran flag de cierre: la noche de Ohmdal)
learnedCapacitor
sawCrystalEye              (gancho Arco II)
unit5Completed
```

---

## 5. Criterios de aceptación

El jugador puede decir, sin clase previa:

- «La chispa se puede guardar, y lo guardado se devuelve aunque cortes el camino después.»
- «Llenar el estanque tarda, y el río afloja solo mientras se llena.»
- «Cuánto tarda lo eligen el tamaño del estanque y el freno del canal.»
- «Un estanque que se llena despacio y vuelca de golpe es un ritmo: un reloj, un faro, un corazón.»

Y recién después leer: *eso se llama capacitor, y al ritmo se lo conoce como RC.*

**Criterio extra del arco:** al ver la noche de Ohmdal, el jugador debería poder nombrar qué regla encendió cada lugar. Si no puede, la Bitácora mayor se lo recuerda — pero el diseño aspira a que no haga falta.

---

## 6. Notas de coherencia y pendientes

1. **Nombre del Farero** (propuesta: Maese Ciro) — misma decisión que Brasa (U3) y Vega (U4): conviene decidir los tres juntos, con sonoridad de conjunto.
2. **El banco con tiempo real** es la novedad técnica de la unidad (tick de simulación, piezas animadas). Diseñar el tick reutilizable: el Arco II entero es señal y conmutación, y lo va a necesitar.
3. **El retorno de la Consejera** acá cierra su arco del libro; si el autor prefiere no traerla, su beat puede absorberlo Edda — pero se pierde el pago de «no pienso anotar eso» (U2 §8.3), que es de los mejores del arco.
4. **La noche de Ohmdal** pide más producción audiovisual que cualquier escena previa (mapa completo, luces, audio en capas). Es EL tráiler del juego: presupuestarla como tal.
5. **El corte v1 es acá** (`ohmdal-ruta-contenidos.md` §5): esta unidad debe terminar con sabor a final de temporada, no a pausa. El ojo de cristal es promesa, no cliffhanger.
