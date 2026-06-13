# Proyecto Roxana — Ohmdal, Unidad 5
# “La chispa que se queda”

**Versión:** 0.2 — guion detallado listo para build (diálogos finales; los ejecutores copian textual)
**Alcance:** Unidad 5 completa: del Faro apagado (gancho de la U4) al cierre del **Arco I** — Ohmdal entero encendido y latiendo. Paga la anomalía plantada en la U2.
**Tema técnico:** el capacitor como almacén de carga, carga y descarga, la curva RC como *tiempo* (cualitativa), el destello periódico. Primera vez que un circuito tiene **memoria** y **ritmo**.
**Requisito narrativo:** Unidad 4 completada (`unit4Completed`, valle regado). Idealmente `sawStoredSpark` (la anomalía de la U2) en la Bitácora.
**Estado:** guion aprobado para construcción. Plan de hitos: `plan-implementacion-u5.md`.

---

## A. Síntesis de la unidad (canon)

### A.1. Premisa

Desde la U2 hay una anomalía sin pagar en la Bitácora: *algo brilló tres segundos sin camino*. Contradice TODO lo aprendido — y esa contradicción es el motor. La respuesta vive junto al lago: el **Faro**, que no alumbraba fijo sino que **latía**, y el **Reloj de Ohmdal**, parado desde los Maestros. Los dos esconden la misma pieza: el **Estanque** — el lugar donde la chispa se queda.

> **«Sin camino no pasa nada. Eso aprendimos. Y sin embargo, algo brilló.»**

La unidad introduce las dos ideas que el arco entero esperaba para cerrar: **memoria** (la chispa puede guardarse) y **tiempo** (llenar un estanque por un canal angosto tarda — y ese tardar se puede elegir). Un almacén que se llena despacio y se vuelca de golpe es un corazón que late: el Faro parpadea, el Reloj marca, y Ohmdal queda **vivo en el tiempo**.

Frase central:

> La chispa que se queda no rompe las reglas. Las espera.

### A.2. Léxico diegético de la Unidad 5

| Técnico | Diegético | Momento de conversión |
|---|---|---|
| capacitor | el Estanque | Bitácora, tras el Faro |
| carga / descarga | llenar / volcar | Bitácora, tras el Faro |
| constante de tiempo (RC) | el ritmo («estanque por canal») | Bitácora, tras el Faro |
| oscilador de relajación / destello | el latido | Bitácora, tras el Faro |
| capacidad | el tamaño del estanque (chico / mediano / grande) | físico, se ve |

**Sin instrumento nuevo:** se usan los dos modos de Ohm (río y brazos). La pieza nueva de banco es el **Estanque** (tres tamaños) y el **umbral de volcado** (al llenarse, vuelca de golpe).

### A.3. Matemática canónica (producto, enteros — los ejecutores no la cambian)

**Ritmo = Estanque × Freno.** Estanques: chico 1 / mediano 2 / grande 4. Frenos: piedras marrón 1 / roja 2 / amarilla 4 / gris 8.

- **El río que se duerme** (corazón conceptual): con Ohm en el canal de carga, la aguja del río arranca fuerte y **decae sola** mientras el estanque se llena (animación por tiempo real, no por input). El tiempo de llenado ∝ estanque × freno: estanque grande + canal angosto (freno grande) se duerme despacio; chico + ancho de golpe. **Es la primera pieza de banco animada por un reloj de simulación.**
- **El Reloj de Ohmdal:** tic objetivo = ritmo **4**. Tres soluciones equivalentes: estanque 1 × amarilla(4); estanque 2 × roja(2); estanque 4 × marrón(1). Ohm celebra: «Otro estanque. El mismo tiempo.» (eco del Repartidor y del reparto justo).
- **El Faro (evento mayor):** latido más lento = ritmo **8**. Soluciones: estanque 4 × roja(2); estanque 2 × amarilla(4); estanque 1 × gris(8). Y la **asimetría vivida**: llenar despacio (freno grande en el canal de carga), volcar de golpe (camino de descarga casi sin freno) — dos caminos distintos para la misma chispa. El banco acepta toda configuración que dé ritmo 8 con volcado breve.
- **Validación:** el Reloj/Faro «cantan» cuando el ritmo coincide con el objetivo; adelantan (ritmo < objetivo) o atrasan (ritmo > objetivo) de forma audible y visible.

### A.4. Misconcepciones que la unidad ataca

| Misconcepción | Dónde cae |
|---|---|
| «Sin camino cerrado no pasa nada, nunca» | la anomalía recreada: el estanque devuelve lo guardado |
| «El capacitor deja pasar la corriente» | Ohm en el canal: el río corre MIENTRAS se llena y muere al llenarse — pasa al principio, no siempre |
| «La carga es instantánea» | el río que se duerme: llenar tarda, y cuánto tarda se elige |
| «Un circuito o funciona o no funciona» | el Reloj que adelanta/atrasa: funciona MAL en el tiempo — el tiempo es variable de diseño |

### A.5. Personajes

- **El Farero** *(nuevo; propuesta de nombre: Ciro — pendiente del autor; el código usa el label «Farero»)* — viejo guardián medio sordo del trueno del lago, que mantuvo durante décadas un faro que no late: lustra la lente, da cuerda a un mecanismo muerto. El último ritualista del arco, pero al revés que Lumen: él NO cree en magia, cree en la **memoria** («latía así: la-aaa-tido. Yo me acuerdo. El ritmo lo tengo acá.»). Su oído ES la placa de calibración viva.
- **La Consejera** — cierre de su arco: viene a anotar la anomalía que en la U2 se negó a registrar («No pienso anotar eso»). Frente al estanque que brilla sin camino, abre el libro y la anota con fecha de la U2. La institución aprendiendo a registrar lo que no entiende todavía.
- **Edda** — la anomalía era SU pregunta. La unidad es su pago intelectual: conduce la recreación. Cierre del arco: su semilla de futuro («Quiero estar del otro lado. Quiero que alguien me lo pregunte a MÍ.»).
- **Maese Lumen** — cierre de arco: dona sus fusibles consagrados al museo de la Forja. Y una línea seria frente al mapa encendido.
- **Ohm** — beat mudo final: cuando el Faro late por primera vez, Ohm gira hacia la luz y su propio pecho parpadea **al mismo ritmo**, una vez. Edda lo ve. (El autómata también es un estanque que late: semilla del Arco II y del Empalme. Paga el beat de la U4.)

### A.6. Novedad técnica (para el plan)

El banco con **tick de simulación**: hasta ahora los bancos eran estáticos entre inputs; la U5 necesita un reloj que anime el Estanque (nivel que sube/vuelca), la aguja que decae sola, y el latido del Faro. Diseñar el tick reutilizable y con `requestAnimationFrame` o `setInterval` bien limpiado al cerrar el banco (sin fugas). Es el «delicado» de la unidad.

**Escala de tiempo (canon, aprendido en L3):** ninguna animación de banco debe hacer esperar al jugador más de **~5 segundos**. En L3 la unidad de tiempo quedó en 150 ms (`SLEEPING_RIVER_UNIT_MS`), de modo que la config más lenta (estanque 4 × freno 8 = 32) tarda ~4.8 s. Para el Reloj (L4) y el Faro (L5): cada tic/latido debe ser **perceptible pero ágil** (~1–2 s por ciclo visible a ritmo objetivo), nunca tedioso. La lección se comunica con la *diferencia* de ritmo, no con la espera absoluta.

---

## 1. NIVEL 0 — Aula (módulo cinco)

Con `unit4Completed`, el proyector ofrece el módulo cinco. 2 min.

**Proyector:**

> *clac* MUNDOS APLICADOS. UNIDAD CINCO.
>
> El Faro de Ohmdal: la luz que recuerda.
>
> Recuerde, estudiante: lo que sube y baja… a veces se queda un rato.

La imagen muestra un destello que late —una vez, dos— y se apaga.

> (¿Se queda? Aprendimos que sin camino no se queda nada. …¿O sí?)

Re-interacción: **Proyector:** «*clac* Unidad cinco: en curso. Tenga paciencia. El tiempo es parte del circuito. *clac*»

Flag: `playedUnit5Intro`. En la plaza, el **Camino al Faro** está abierto (visible con `unit4Completed`; baja al lago, del lado de las Terrazas).

---

## 2. NIVEL 1 — El Faro: la chispa que se queda

**ID propuesto:** `MAP_LIGHTHOUSE_HALL` · 5–6 min · **Puzzle 1 (la anomalía domada)**

Sala impecable de máquina muerta: la lente lustrada, el bronce sin polvo, todo listo para un faro que no enciende. El **Farero** recibe al grupo. Sobre la mesa, la Bitácora abre sola su página vieja: *Anomalía: la chispa que se queda.*

**Farero:**

> ¿Vienen por la luz? La luz es lo de menos. Este faro no alumbraba: **avisaba**.
> Y para avisar hay que latir. La-aaa-tido. La-aaa-tido. Yo me acuerdo. El ritmo lo tengo acá. *(se toca la sien)*

**Edda:**

> Nosotros vimos algo imposible, hace tiempo. Una chispa que brilló sin camino. Lo anotamos y no lo entendimos.

**Farero:**

> Ah. Entonces ya conocen al Estanque. Solo que todavía no sabían su nombre.

### PUZZLE 1 — La chispa que se queda

**ID:** `PUZZLE_STORED_SPARK` · asombro puro, sin fallo · 4–5 min
**Vista de banco:** una fuente, un canal con llave, un **Estanque** (pieza nueva, nivel visible) y una lámpara. Acciones: cargar (abrir la llave: el estanque se llena, la lámpara apenas brilla), **cortar el camino** (cerrar la llave entre fuente y estanque), y observar.

Experiencias:

1. **Cargar y cortar:** se cierra el camino… y la lámpara **sigue brillando tres segundos**, sola, mientras el estanque se vacía. Recrea exactamente la anomalía de la U2.
   **Edda:** «Ahí está. EXACTAMENTE eso. Tres segundos sin camino.»
   **Ohm:** «Camino: cortado. Chispa: presente. Reglas: intactas. Paciencia: detectada.»
2. **Medir con Ohm el canal mientras se carga:** el río corre fuerte al principio y muere cuando el estanque se llena.
   **Ohm:** «El estanque no es una pared. Es una pared que primero deja pasar, y después se acuerda.»

La **Consejera** (que llegó sin que nadie la llamara) abre su libro de inventario:

> Registro fuera de término. Cuarenta años haciendo actas y la primera verdad la anoto tarde.
> *(escribe, con fecha vieja)* «La chispa que se queda.» …Que conste.

*(Cierra su arco: la institución registra por fin lo que se negó a registrar en la U2.)*

Flags: `solvedStoredSpark`, `consejeraNotedAnomaly`. Bitácora «La chispa que se queda» (completa la anomalía).

---

## 3. NIVEL 2 — El banco del Farero: el río que se duerme

**ID propuesto:** `MAP_LIGHTHOUSE_BENCH` · 5–7 min · **Puzzle 2 (el tiempo entra al banco)**

El taller del Farero. Acá el tiempo se vuelve, por primera vez, una variable que se ve.

**Farero:**

> Mírenlo llenarse. No es magia. Es paciencia con forma de agua.
> Un estanque grande por un canal fino tarda. Uno chico por un canal ancho, casi nada. El tiempo lo eligen ustedes.

### PUZZLE 2 — El río que se duerme

**ID:** `PUZZLE_SLEEPING_RIVER` · observación, sin fallo · 5–7 min
**Vista de banco:** fuente, canal con piedra de freno elegible, Estanque elegible (chico 1 / mediano 2 / grande 4), Ohm parado en el canal con la aguja del río **animada en tiempo real**. Botón «Llenar» (arranca el tick).

Experiencias:

1. **Llenar y mirar la aguja:** arranca fuerte y **decae sola** hasta cero a medida que el estanque se llena. La primera aguja que se mueve sola en el tiempo.
   **Edda:** «No se rompió. Se está llenando. ¡Mira la aguja, está RESPIRANDO!»
2. **Estanque grande + canal angosto (freno grande):** se duerme despacio. **Chico + ancho:** casi de golpe.
   **Ohm:** «Tiempo de llenado: estanque por freno. Más estanque, más espera. Más freno, más espera.»
3. **Cuando el estanque está lleno, medir el canal:** río cero. El estanque lleno es una pared.
   **Farero:** «¿Ven? Primero deja pasar. Después dice basta. Como yo a la hora de dormir.»

Flags: `solvedSleepingRiver`. Bitácora «El río que se duerme» (vivencial).

---

## 4. NIVEL 3 — La torre del Reloj de Ohmdal

**ID propuesto:** `MAP_CLOCK_TOWER` · 6–8 min · **Puzzle 3**

La torre del pueblo, el Reloj parado desde los Maestros. Un llenado con umbral es un tic: el estanque se llena, vuelca de golpe, y el péndulo avanza un paso.

**Farero:**

> El Reloj y el Faro son hermanos. Los dos laten. Solo que el Reloj late despacio y cuenta; el Faro late y avisa.
> Devuélvanle el tic al pueblo. Un tic justo. Ni apurado ni dormido.

### PUZZLE 3 — El Reloj de Ohmdal

**ID:** `PUZZLE_CLOCK` · 6–8 min
**Vista de banco:** un Estanque con **umbral de volcado** (al llenarse, vuelca de golpe y reinicia: un tic), Estanque elegible (1/2/4), freno elegible (1/2/4/8), el péndulo que avanza con cada volcado, y una referencia de tic objetivo (ritmo 4). Tick de simulación en tiempo real.

- **Ritmo < 4 (rápido):** el Reloj adelanta, el péndulo va frenético. **Farero:** «Ese reloj tomó café. Más despacio.»
- **Ritmo > 4 (lento):** atrasa, arrastra. **Farero:** «Ese reloj está por jubilarse. Un poco más de brío.»
- **Ritmo = 4 — tres soluciones** (estanque 1 × amarilla, 2 × roja, 4 × marrón):
  **Ohm:** «Otro estanque. El mismo tiempo.»
  **Farero:** «Ese. Ese es el tic. Lo reconozco aunque me despierten a las tres.»

Al sonar el tic justo, **toda la plaza lo oye** (eco de la campana de la U1: la U1 le devolvió la voz al pueblo, la U5 le devuelve el pulso).

Flags: `solvedClock`, `clockRestored`. Bitácora «El tic» (vivencial).

---

## 5. NIVEL 4 — La linterna del Faro: el latido

**ID propuesto:** `MAP_LIGHTHOUSE_LANTERN` · 8–10 min · **Puzzle 4 — evento mayor**

La cima del Faro, la lente enorme apagada sobre el lago negro. La única placa de calibración que queda es **la memoria del Farero**.

**Farero:**

> No tengo planos. Tengo el oído. Mi padre me lo pasó, y a él el suyo.
> Ustedes ármenlo. Yo les digo cuándo. Cierro los ojos y escucho. Cuando el latido sea EL latido, lo van a saber porque se me van a llenar los ojos. No lo puedo evitar.

### PUZZLE 4 — El latido

**ID:** `PUZZLE_LIGHTHOUSE` · 7–9 min
**Vista de banco:** dos caminos sobre el Estanque — un **canal de carga** (llenar despacio: freno grande) y un **camino de volcado** (descargar de golpe: casi sin freno) — Estanque elegible (1/2/4), frenos elegibles para cada camino, la lente que destella con cada volcado, y la referencia de latido objetivo (ritmo 8). Tick de simulación. **Asimetría:** la lección física es llenar despacio / volcar de golpe.

- Latido demasiado rápido o demasiado lento: la lente «tartamudea» o se queda casi fija. El Farero comenta (oído vivo).
- **Ritmo 8 con volcado breve** — soluciones (estanque 4 × roja, 2 × amarilla, 1 × gris, en el canal de carga; descarga casi libre):
  Cuando el latido es el correcto, **el lago entero parpadea con la lente**, y el Farero, de espaldas, dice la línea de la unidad:
  **Farero:** «Ese. Ese es. …Cuarenta años afinando el oído para esta noche.» *(se le llenan los ojos, como prometió)*

**Ohm** *(gira hacia la luz; su propio pecho parpadea al mismo ritmo, una vez)*:

> *(silencio)*

**Edda:**

> ¿Ohm…? Tu pecho. Late igual que el Faro.

**Ohm:**

> Dato registrado. Sin explicación disponible. …Todavía.

*(Paga el beat de la U4. Semilla del Arco II / el Empalme: el autómata también es un estanque que late. La reserva no se gasta del todo.)*

Flags: `solvedLighthouse`, `lighthouseRestored`, `learnedCapacitor`.

### Resolución — la noche de Ohmdal (cierre del Arco I)

Secuencia contemplativa final. La cámara se aleja: el **mapa entero de Ohmdal encendido de noche** — la plaza con su campana, el Castillo con sus tres distritos, la Forja en ritmo, las Terrazas regadas, el Reloj marcando, el Faro latiendo sobre el lago. Los cinco lugares, las cinco unidades, en una sola pantalla. La promesa de la U1 («la luz que vuelve») está **cumplida**.

**Edda** (mirando el reino encendido):

> Cinco lugares. Cinco lecciones. Y la chispa que «se estaba acabando» encendió todo, sin gastarse.
> …Quiero estar del otro lado, alguna vez. Quiero que alguien me lo pregunte a MÍ. Con las manos, como hiciste vos.

**Maese Lumen** (dona sus fusibles consagrados, mira el mapa):

> Yo cuidé esto cuarenta años sin entenderlo. Ustedes lo entendieron en cinco lunas.
> …Gracias por no decírmelo en voz alta. *(pausa)* Mis mártires van al museo de la Forja. Que aprendan los jóvenes lo que era el miedo.

**La Consejera** (cierra su libro de inventario, lo guarda):

> Inventario final del Consejo: la chispa no disminuyó en cuarenta años. La estábamos guardando para nadie.
> Caso cerrado.

**Ohm:**

> Registro: red de Ohmdal completa. Estado: viva en el tiempo. Promesa de la primera lección: cumplida.

La Bitácora arde por última vez en el arco y se abre sola: la entrada mayor, **«El Arco del Río»**, con el mapa dibujado y las cinco reglas en limpio.

### Gancho al Arco II (plantado, sin urgencia — el corte v1 honra acá)

En lo alto del Faro, el Farero muestra un **ojo de cristal** que mueve una aguja cuando le da la luz. Nadie lo conectó a nada: lo hace solo.

**Edda:**

> ¿Y a ESE quién lo empuja? Un rayo de luz… ¿empujando un río?

**Farero:**

> Eso, jóvenes, es de otra noche. La materia que decide. Yo ya tengo bastante con mi latido.

*(Semiconductores. Otra historia. El juego puede cortar acá con honor: el ojo de cristal es promesa, no cliffhanger.)*

Flags: `arcOneCompleted`, `sawCrystalEye`, `unit5Completed`. Pantalla de cierre del **arco** (no solo de la unidad): título «Fin del Arco I — “El Río” · Ohmdal, cinco unidades», resumen del reino encendido, y el ojo de cristal como semilla. Botón Continuar → hall.

---

## 6. Entradas de Bitácora de la Unidad 5

Dos capas; las vivenciales nacen al resolver cada puzzle; las formales llegan con `learnedCapacitor` (tras el Faro).

1. **«La chispa que se queda»** (completa la anomalía de U2, `solvedStoredSpark`) — vivencial: el estanque cargado brilló sin camino; lo guardado se devuelve. Formal: **el capacitor**, almacén de carga. **Error común:** «el capacitor deja pasar el río» — pasa mientras se llena; lleno, es una pared que recuerda.
2. **«El río que se duerme»** (`solvedSleepingRiver`) — vivencial: la aguja muriendo sola; estanque grande y canal angosto tardan más. Formal: la **carga no es instantánea**; el tiempo de llenado crece con el estanque y con el freno. ✎ *¿Qué se llena despacio y se vuelca de golpe en tu casa? Pista: hay una en el baño.*
3. **«El tic»** (`solvedClock`) — vivencial: el Reloj y sus tres soluciones equivalentes. Formal: **llenado + umbral = ritmo**; elegir estanque y freno es elegir el tiempo. Nota al pie: *«Mucho después lo llamaron circuito RC. La R y la C son la piedra y el estanque. El tiempo siempre fue de ellos.»*
4. **«El Arco del Río»** (entrada mayor, cierre del arco, `learnedCapacitor`) — el mapa de Ohmdal dibujado completo con sus cinco restauraciones y las cinco reglas en limpio: la Ley de Ohm, la Regla del Cruce, la Entrega, la Regla de la Vuelta, la Chispa que se queda. Última línea: *«El río ya no es un misterio. Ahora es una herramienta. Lo que sigue no es más río: es enseñarle a decidir.»* ✎ *(página en blanco titulada: «El ojo de cristal»)*

---

## 7. Flags de la unidad

```txt
playedUnit5Intro
metFarero
solvedStoredSpark
consejeraNotedAnomaly
solvedSleepingRiver
solvedClock
clockRestored
solvedLighthouse
lighthouseRestored
learnedCapacitor
arcOneCompleted
sawCrystalEye
unit5Completed
```

---

## 8. Criterios de aceptación

El jugador puede decir, sin clase previa:

- «La chispa se puede guardar, y lo guardado se devuelve aunque cortes el camino después.»
- «Llenar el estanque tarda, y el río afloja solo mientras se llena.»
- «Cuánto tarda lo eligen el tamaño del estanque y el freno del canal.»
- «Un estanque que se llena despacio y vuelca de golpe es un ritmo: un reloj, un faro, un corazón.»

Y recién después leer: *eso se llama capacitor, y al ritmo se lo conoce como RC.*

**Criterio extra del arco:** al ver la noche de Ohmdal, el jugador debería poder nombrar qué regla encendió cada lugar.

---

## 9. Notas de coherencia y pendientes

1. **Nombre del Farero** (propuesta: Ciro) — pendiente del autor, junto con la Forjadora (Brasa) y la Guardiana (Vega). El código usa el label «Farero».
2. **El banco con tick de tiempo real** es la novedad técnica (§A.6): diseñar el tick reutilizable y limpiarlo al cerrar el banco (sin fugas de timers). Es el «delicado» de la unidad.
3. **La matemática de §A.3 es producto puro** (ritmo = estanque × freno), enteros garantizados. Contradicción ⇒ frenar y reportar (no debería haber).
4. **La noche de Ohmdal** pide más producción audiovisual que cualquier escena previa (mapa completo, luces, audio en capas). Es EL tráiler del juego: presupuestarla como tal. En greybox: una pantalla compuesta con los cinco lugares iluminados + audio en capas de los cinco ambientes.
5. **El corte v1 es acá:** esta unidad termina con sabor a final de temporada, no a pausa. El ojo de cristal es promesa, no cliffhanger.
6. **La pantalla de cierre del arco** reusa `showEnd` pero con peso especial (es el cierre del producto v1, no de una unidad más).
