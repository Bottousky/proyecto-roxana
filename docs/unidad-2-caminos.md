# Proyecto Roxana — Ohmdal, Unidad 2
# “El río se reparte”

**Versión:** 0.1 — propuesta de diseño y guion
**Alcance:** Unidad 2 completa: del regreso al Aula de Electrónica hasta la restauración del Castillo de Ohmdal y el gancho a la Unidad 3.
**Tema técnico:** circuitos con más de un camino — serie, paralelo, reparto de corriente (la ley de nudos como intuición, no como fórmula).
**Requisito narrativo:** Unidad 1 completada (campana sonando, plaza encendida, `learnedOhmsLaw`).
**Estado:** borrador para revisar con el autor. Nada implementado.

---

## A. Síntesis de la unidad (canon propuesto)

### A.1. Premisa

El Consejo de Ohmdal selló el Castillo hace décadas. El Castillo es el corazón de la red: de él salían todos los canales de cobre del reino. El motivo del sello es la misconcepción fundante de la unidad, institucionalizada como política:

> **«La chispa se gasta. Cada camino abierto es chispa perdida. Cerrar caminos es conservar la que queda.»**

Por eso Ohmdal está a oscuras incluso después de abrir la Puerta de Ohm: no falta río — sobran sellos. La unidad entera desmiente la idea de escasez con las manos: **el río no se gasta; se reparte. Y lo que entra en un cruce, sale del cruce.**

Simetría con el Instituto (columna vertebral del juego): el Consejo cerró el Castillo «para conservar» igual que la escuela se cerró sobre sí misma para conservar lo poco que le quedaba. Abrir caminos no gasta: distribuye.

Frase central de la unidad:

> El río no se gasta. Se reparte.

### A.2. Léxico diegético de la Unidad 2

El vocabulario técnico sigue siendo spoiler. Nadie dice "serie", "paralelo" ni "nodo" antes del Repartidor.

| Técnico | Diegético | Momento de conversión |
|---|---|---|
| circuito en serie | la Cadena / «en fila» | Bitácora, tras el Repartidor |
| circuito en paralelo | los Ramales / «caminos hermanos» | Bitácora, tras el Repartidor |
| nodo / nudo | el Cruce | Bitácora, tras el Repartidor |
| corriente total (de la fuente) | el río del Tronco | Bitácora, tras el Repartidor |
| ley de corrientes de Kirchhoff | la Regla del Cruce | Bitácora, tras el Repartidor (solo como intuición) |

El léxico de la U1 (Empuje, Río, Piedra, camino completo) ya está convertido: los personajes pueden alternar entre nombre diegético y verdadero, porque lo aprendieron junto al jugador.

### A.3. Diseño de puzzles — una variable nueva por puzzle

| Puzzle | Concepto | Manipulación | Feedback de fallo |
|---|---|---|---|
| La campana de dos cables | El cruce reparte; la suma se conserva | Medir con Ohm tramo por tramo; abrir/cerrar un camino | Ninguno: es medición pura (tutorial) |
| La Galería en Cadena | Serie: un solo río; los frenos se suman | Agregar/quitar lámparas de la fila | Todas tenues, o todas muertas a la vez |
| Los Ramales | Paralelo: cada rama según su freno; el Tronco paga la suma | Conectar ramas y elegir piedra por rama | Una rama ahoga a las demás… no: ¡quema el fusible del Tronco! |
| El Repartidor | Combinación serie+paralelo hacia caudales objetivo | Configurar la red completa del Castillo | Distritos hambrientos o fusibles inmolados; el fallo informa |

**El Repartidor (diseño fino):** tablero central del Castillo con un Empuje elegible (4 / 8 / 16, los cristales de la U1), tres distritos con necesidades distintas de caudal (forja = 4, campanario = 2, biblioteca = 1) y un **fusible de Tronco** que tolera hasta 8. El jugador arma una rama por distrito eligiendo piedras (marrón 1 / roja 2 / amarilla 4 / gris 8 — el código real de la U1 reutilizado). Con Empuje 8: forja→roja (8/2=4), campanario→amarilla (8/4=2), biblioteca→gris (8/8=1); Tronco = 4+2+1 = 7 ≤ 8 ✓. **Hay múltiples soluciones válidas** con otros Empujes — la proporcionalidad de la U1 reaparece sola, ahora multiplicada por ramas. Ohm sigue siendo el medidor vivo: ahora **camina por la red** y reporta el río del tramo donde está parado — esa mecánica ES la ley de nudos vivida.

**Regla de reuso:** los componentes (cristales, piedras, fusibles, aguja) son exactamente los de la U1. La unidad no agrega piezas: agrega **topología**. Eso comunica que el conocimiento viejo sigue valiendo en el mundo nuevo.

### A.4. Misconcepciones reales que la unidad ataca

| Misconcepción documentada en estudiantes | Dónde se desmiente jugando |
|---|---|
| «La corriente se gasta a lo largo del circuito» | Ohm mide el MISMO río antes y después de cada lámpara de la Cadena |
| «La lámpara más cercana a la fuente brilla más» | Las lámparas de la Cadena brillan exactamente igual (todas tenues, o todas bien) |
| «Abrir más caminos debilita la chispa» | Dogma del Consejo; cae con la campana y los Ramales |
| «Agregar ramas en paralelo es gratis» | Cada rama nueva exige más río al Tronco: fusible del Tronco |
| «Si un camino se corta, todo muere» | En la Cadena sí; en los Ramales no — y esa diferencia es el corazón de la unidad |

### A.5. Personajes

Trío de la U1 continúa (medidor / escéptica / tradición), con arcos avanzados:

- **Edda** — ya no solo sospecha: quiere **enseñar lo que entendió**, y descubre que enseñar es más difícil que entender. Su fricción nueva no es con Lumen sino con el Consejo. Regla intacta: no explica; pregunta mejor.
- **Maese Lumen** — converso a medias. Defiende «la cuenta hermosa» ante la Consejera con el fervor del recién llegado, mezclando todavía ritual y razón («¡La cuenta no falla! …Igual traje fusibles consagrados.»). Es el puente entre tradiciones: el Consejo lo respeta.
- **Ohm** — mecánica nueva: medidor móvil sobre la red. Una (1) línea de backstory al entrar al Castillo, sin gastar el resto: reconoce el lugar.
- **La Consejera** *(personaje nuevo, sin nombre propio — coherente con el canon: el preceptor tampoco lo tiene)* — guardiana del sello del Castillo. **No es villana**: es la administradora de una escasez que no existe. Burocracia solemne: inventarios de chispa, formularios de apertura, lacres. Arco: de «cada camino abierto es chispa perdida» a romper ella misma el último sello. Su conversión no es por discurso sino por **evidencia medible** — igual que la de Lumen en la U1.

Frase guía de la Consejera (su dogma, para invertirlo al final):

> «El Consejo no cierra puertas. Conserva aperturas futuras.»

### A.6. Estado de implementación

Sin construir. Para el greybox de esta unidad se reutiliza el patrón U1: salas top-down (Phaser) + vistas de banco (DOM/SVG) + entradas de Bitácora. Piezas de banco nuevas necesarias: lámpara-en-fila (componente repetible), cruce/bifurcación, fusible de Tronco con tolerancia visible, y el modo «Ohm caminante» (botón por tramo: «llamar a Ohm aquí»).

---

## 1. Resumen narrativo completo

Tras el final de la U1, la Bitácora registró la anomalía: *caminos múltiples*. De regreso en el Aula de Electrónica, el proyector reconoce el avance y proyecta el módulo dos: el Castillo de Ohmdal, corazón de la red, «de donde salen todos los ríos». La grabación se corta con un sello superpuesto: **CLAUSURADO POR ORDEN DEL CONSEJO**.

En la plaza, Edda espera junto a la campana: nadie le explicó por qué los Maestros le pusieron DOS cables. El jugador, con Ohm como medidor, descubre el primer principio midiendo: por cada cable corre **medio río**, y por el tronco, el río entero. Si se abre un cable, el otro lleva todo — y la campana sigue sonando. Los Maestros no desperdiciaban: **duplicaban caminos para que la campana nunca callara**.

Con esa evidencia van a la puerta del Castillo, donde la Consejera custodia el sello. Su negativa es doctrinal: abrir el Castillo «gastaría la chispa que queda». Lumen aboga («yo también creía que la chispa se ofendía; resultó que hacía cuentas»), Edda presenta la medición de la campana, y la Consejera concede una **inspección supervisada**: entran con ella. Ohm cruza el umbral y se queda un segundo quieto: *«Registro antiguo encontrado. Este lugar. Origen: este lugar.»* (No se desarrolla. Todavía.)

Dentro, la **Galería en Cadena**: el pasillo ceremonial del Castillo, con sus lámparas en una sola fila interminable — así la dejó el Consejo, convencido de que una sola fila «ahorra». Todas brillan igual de tenue, y si una se quita, mueren todas. Ohm, caminando la fila, mide lo imposible para la doctrina: **el mismo río en cada punto**. La corriente no se gasta en el camino; la fila entera comparte un único río, frenado por la suma de todos los frenos.

Después, la **Sala de los Ramales**: la encrucijada que alimentaba los talleres del Castillo. El jugador conecta ramas y reparte piedras: cada rama recibe según su freno, las ramas no se roban entre sí… pero el **Tronco paga la suma**, y conectar ramas glotonas sin medida inmola el fusible mayor — frente a la Consejera, que anota en silencio. Fallar también es evidencia: los caminos no son gratis, son **contables**.

Al fondo, el **Corazón del Castillo: el Repartidor**, el tablero maestro que alimentaba los tres distritos (forja, campanario, biblioteca). El evento mayor: configurar la red completa para que cada distrito reciba su caudal justo sin quemar el Tronco. Cuando el Repartidor canta, el Castillo se enciende en cadena, distrito por distrito, y la inscripción del tablero queda a la vista:

> Lo que entra en el cruce, sale del cruce.
> Nada se pierde. Todo se reparte.

Solo entonces la Bitácora formaliza: serie, paralelo, la Regla del Cruce. La Consejera, frente al Castillo encendido **con la misma chispa que antes «se estaba acabando»**, rompe el último sello ella misma.

Cierre en dos mundos: en Ohmdal, los ciudadanos ven la luz del Castillo desde la plaza; en el Instituto, el jugador aplica lo aprendido a un viejo conocido — el **timbre de la escuela**, mudo hace años, que tiene dos caminos y uno cortado. El timbre suena. El preceptor se asoma al pasillo y mira el parlante como a un fantasma educado.

Gancho a la Unidad 3: en el Corazón del Castillo, al cortar el Tronco para la inspección final, un mecanismo **sigue brillando unos segundos sin camino**. Edda: «¿Y ESE río de dónde salió, si el camino estaba cortado?» La Bitácora registra: *Anomalía: la chispa que se queda.* (Tema futuro: almacenamiento — capacitores, energía y tiempo.)

---

## 2. NIVEL 0 — Aula de Electrónica (retorno)

**ID:** `MAP_ELECTRONICS_CLASSROOM` (reusada)
**Duración:** 2–3 minutos
**Función:** re-entrada, recompensa por la U1, planteo del módulo dos.

Cambios visibles respecto de la U1 (restauración del Instituto en marcha):

- una de las lámparas del aula ahora **funciona**;
- el pizarrón: la frase antes incompleta se lee entera: «Donde otros ven magia, busca camino»;
- el panel V/I/R del portal brilla estable, no intermitente.

### Proyector — módulo dos

> *clac* MUNDOS APLICADOS. UNIDAD DOS.
>
> El Castillo de Ohmdal: corazón de la red. De sus salas parten todos los ríos del reino.
>
> Recuerde, estudiante: un reino no se enciende con un solo camino.

La imagen se corta. Sobre la lente, un lacre proyectado:

> CLAUSURADO POR ORDEN DEL CONSEJO DE OHMDAL.
> «Conservación de chispa. Sin excepciones.»

Reacción del jugador (texto ambiente):

> ¿Un mundo de práctica… con zonas clausuradas por sus propios habitantes?

Flag: `playedUnit2Intro`

---

## 3. NIVEL 1 — La plaza, la campana de dos cables

**ID:** `MAP_OHMDAL_PLAZA_ON` (estado U2)
**Duración:** 4–6 minutos
**Función:** tutorial de reparto; retoma el gancho exacto del final de la U1.

Edda está junto a la campana, mirando los cables con las manos en la cintura.

**Edda:**

> Volviste. Bien. No dormí pensando en esto.
> DOS cables. Misma campana. Los Maestros no ponían nada por adorno.
> ¿Para qué dos caminos para un mismo río?

**Ohm:**

> Hipótesis disponible. Medición recomendada.

### PUZZLE 1 — La campana de dos cables

**ID:** `PUZZLE_BELL_TWO_PATHS`
**Concepto:** el cruce reparte; la suma se conserva; redundancia.
**Fórmula visible:** ninguna.
**Duración:** 3–4 minutos.
**Vista de banco:** la campana arriba; el Tronco baja de la fuente a un Cruce; del Cruce salen dos tramos gemelos que vuelven a juntarse antes de la campana. Cada tramo tiene una **llave** (abrir/cerrar) y un punto donde **llamar a Ohm** para que mida.

Estados deseados:

1. **Ambos caminos cerrados (completos):** la campana suena. Ohm en el tramo izquierdo: «Medio río.» En el derecho: «Medio río.» En el Tronco: «Río entero.»

   **Edda:** «Medio y medio… ¿y el Tronco lleva todo? A ver, ¿dónde se está gastando?»
   **Ohm:** «Gasto detectado: ninguno.»

2. **Se abre un camino:** la campana SIGUE sonando. Ohm en el tramo abierto: «Río: cero.» En el otro: «Río entero.»

   **Edda:** «…El río que iba por ahí no se perdió. Se mudó.»

3. **Se abren los dos:** silencio. (Reaprendizaje U1: sin camino completo, nada.)

Cierre del puzzle (con ambos cerrados de nuevo):

**Edda:**

> Dos caminos no era un lujo. Era una promesa: que la campana no se calle nunca, ni aunque un cable falle.
> Los Maestros no gastaban doble. **Confiaban doble.**

**Ohm:**

> Registro: lo que entró al cruce, salió del cruce. Diferencia: cero.

Flags: `solvedBellPaths`, entrada de Bitácora «Dos caminos» (vivencial; formal incompleta).

---

## 4. NIVEL 2 — La puerta del Castillo y la Consejera

**ID:** `MAP_CASTLE_GATE`
**Duración:** 3–4 minutos
**Función:** presentar a la Consejera y el dogma de la escasez; abrir el Castillo por evidencia, no por puzzle.

Puerta monumental, lacrada con sellos de cera y cobre. Carteles del Consejo:

> «La chispa que no se usa es chispa que se ahorra.»

> «Denuncie caminos abiertos sin permiso.»

**La Consejera** (junto a un atril con un libro de inventario):

> Alto. Este recinto está clausurado por conservación de chispa.
> El Consejo no cierra puertas: **conserva aperturas futuras.**

**Edda:**

> Medimos la campana. El río no se gasta: se reparte. Tenemos los números.

**Consejera:**

> Los números del Consejo dicen que la chispa disminuye desde hace cuarenta años.

**Lumen:**

> Los míos también lo decían, Consejera. Resultó que yo medía mi miedo, no el río.
> …Y mis fusibles murieron más dignamente desde entonces.

**Ohm:**

> Solicitud: inspección. Probabilidad de desastre: moderada.

**Consejera:**

> «Moderada.» Al menos el calderito es honesto.
> Inspección supervisada. Yo entro con ustedes. Yo anoto TODO.

Flag: `metConsejera`, `enteredCastle`

Al cruzar el umbral, Ohm se detiene un segundo. Sus ojos parpadean con una luz distinta:

**Ohm:**

> Registro antiguo encontrado. Este lugar. Origen: este lugar.

**Edda:**

> ¿Ohm…?

**Ohm:**

> Continuar.

*(No se desarrolla más. La backstory de Ohm sigue siendo reserva de largo plazo.)*

---

## 5. NIVEL 3 — La Galería en Cadena

**ID:** `MAP_CASTLE_GALLERY`
**Duración:** 6–8 minutos
**Función:** serie — un solo río, frenos que se suman, fragilidad de la fila.

Pasillo ceremonial. Una sola línea de cobre recorre el techo con lámparas **en fila**: encendidas, pero tenues, todas exactamente igual de tenues. Pedestales vacíos donde antes hubo más lámparas.

**Consejera:**

> La Galería en régimen de austeridad: una sola línea. Sin derroches.
> Antes había seis lámparas. Las reduje yo misma a cuatro para ahorrar chispa.

**Edda:**

> ¿Y brillan más desde entonces?

**Consejera:**

> …Brillan distinto.

**Ohm:**

> Distinto: sí. Más: no.

### PUZZLE 2 — La Cadena

**ID:** `PUZZLE_GALLERY_CHAIN`
**Concepto:** circuito en serie.
**Fórmula visible:** ninguna.
**Duración:** 4–6 minutos.
**Vista de banco:** la fila de lámparas (cada lámpara = un freno fijo), enchufes para agregar/quitar lámparas, la aguja, y puntos de medición para Ohm a lo largo de toda la fila.

Experiencias deseadas (en cualquier orden — el banco es de exploración):

1. **Medir la fila con Ohm, punto por punto:** antes de la primera lámpara, entre lámparas, después de la última: **siempre el mismo río.**

   **Edda:** «Esperaba que fuera bajando… Pensé que la primera lámpara se quedaba con la mejor parte.»
   **Ohm:** «Reparto en fila: no existe. Fila = un solo río.»
   **Consejera:** *(anotando, incómoda)* «El instrumento estará descalibrado.»
   **Ohm:** «El instrumento los escucha.»

2. **Quitar una lámpara cualquiera:** se apagan TODAS al instante.

   **Lumen:** «¡La fila entera muere por un soldado! En mis tiempos a eso lo llamábamos diseño solemne.»
   **Edda:** «Yo lo llamaría rehén.»

3. **Agregar lámparas a la fila:** todas más tenues por cada una nueva.

   **Ohm:** «Más frenos en fila: frenos sumados. Río menor para todos.»

4. **Resolver:** dejar la fila con la cantidad justa (dos lámparas con el Empuje disponible) para brillo correcto.

   **Consejera:** «Quitaron lámparas… y las que quedan brillan bien. Eso es exactamente lo que el Consejo predica. Austeridad.»
   **Edda:** «No. Quitamos FRENOS de un mismo camino. Es otra cosa. Se lo voy a mostrar con los Ramales.»
   *(Edda intentando enseñar — y descubriendo que necesita mejores ejemplos. Su arco.)*

Flags: `solvedGalleryChain`, entrada de Bitácora «La Cadena» (vivencial; formal incompleta).

---

## 6. NIVEL 4 — La Sala de los Ramales

**ID:** `MAP_CASTLE_BRANCHES`
**Duración:** 6–8 minutos
**Función:** paralelo — ramas independientes, reparto por freno, y el costo real: el Tronco.

Encrucijada de canales de cobre: un Tronco grueso baja de lo alto y se abre en brazos hacia tres bocas de taller selladas. Sobre el Tronco, un **fusible mayor** del tamaño de un antebrazo, en una vitrina con honores.

**Lumen:**

> El Fusible del Tronco. El mártir más grande de Ohmdal.
> Cuando este se inmola, Consejera, no hay ritual que lo consuele.

**Consejera:**

> Por eso las bocas están selladas. Tres talleres abiertos vaciarían el Tronco.

**Edda:**

> ¿Vaciarlo? El río no es un balde…
> …¿O sí? Ohm: ¿es un balde?

**Ohm:**

> Balde: no. Contable: sí.

### PUZZLE 3 — Los Ramales

**ID:** `PUZZLE_BRANCHES`
**Concepto:** circuito en paralelo + el Tronco paga la suma.
**Fórmula visible:** ninguna.
**Duración:** 5–7 minutos.
**Vista de banco:** el Cruce con tres ramas conectables; cada rama acepta una piedra de freno (marrón 1 / roja 2 / amarilla 4 / gris 8); cada rama alimenta una lámpara de taller; la aguja del Tronco con su zona de tolerancia y el fusible mayor.

Experiencias deseadas:

1. **Conectar una rama:** su taller enciende según su piedra. Las otras bocas, muertas: las ramas no se prestan nada.

2. **Conectar la segunda:** la primera **no cambia su brillo**. Cada rama recibe según SU freno.

   **Edda:** «¡La primera ni se enteró! No se reparten la pobreza: cada camino cobra lo suyo.»
   **Consejera:** *(mirando la aguja del Tronco)* «…Pero el Tronco subió.»
   **Ohm:** «Correcto. Tronco = suma de ramas. Anótelo.»
   **Consejera:** «YA lo anoté.»

3. **Conectar las tres con piedras glotonas (marrón en todas):** la aguja del Tronco se clava al fondo, el Fusible mayor **se inmola** con un trueno. Todo muerto.

   **Lumen:** «¡EL MÁRTIR! …Perdón. Costumbre.»
   **Consejera:** «Esto. ESTO es lo que el Consejo teme.»
   **Edda:** «Y tiene razón en temerlo. Pero la respuesta no era sellar las bocas… era **elegir las piedras**.»

   *(Momento clave de la unidad: la Consejera no estaba loca — su miedo es real; su remedio era el equivocado. El fallo del jugador construye el puente con ella.)*

4. **Resolver:** tres ramas conectadas con piedras tales que cada taller reciba caudal razonable y el Tronco quede dentro de su tolerancia.

   **Consejera:** «Tres talleres. Tronco entero. Fusible vivo. …Repítanlo.»
   **Edda:** «¿Por qué?»
   **Consejera:** «Porque lo voy a anotar de nuevo, con mejor letra.»

Flags: `solvedBranches`, `burnedTrunkFuse` (si ocurrió), entrada de Bitácora «Los Ramales» (vivencial; formal incompleta).

---

## 7. NIVEL 5 — El Corazón del Castillo: el Repartidor

**ID:** `MAP_CASTLE_HEART`
**Duración:** 8–10 minutos
**Función:** evento mayor; combinación serie+paralelo; formalización.

Sala circular. En el centro, el **Repartidor**: un tablero maestro de cobre y piedra del que parten tres canales mayores, uno por distrito del Castillo — la **forja**, el **campanario**, la **biblioteca**. Cada canal tiene su emblema y su placa de caudal: la forja pide río fuerte; el campanario, medio; la biblioteca, apenas un hilo («los libros agradecen la penumbra»).

En el suelo, un mosaico: un río que entra a un cruce y sale en tres brazos, con la inscripción gastada que se revelará al final.

**Lumen:**

> El Repartidor. Mi maestro decía que aquí los Maestros «le enseñaban al río a contar».

**Consejera:**

> El Consejo lo selló primero. Dijimos: si el corazón no gasta, el cuerpo conserva.

**Edda:**

> Y el cuerpo se apagó entero. Qué manera de conservar.

### PUZZLE 4 — El Repartidor

**ID:** `PUZZLE_DISTRIBUTOR`
**Concepto:** red completa — reparto hacia objetivos distintos, con presupuesto de Tronco.
**Fórmula visible:** aún no.
**Duración:** 6–9 minutos.
**Vista de banco:** elegir cristal de Empuje (4 / 8 / 16); una rama por distrito con engaste de piedra; aguja por distrito (cada una con SU zona verde, distinta) + aguja de Tronco con tolerancia 8; Ohm caminante por toda la red; fusibles de repuesto de Lumen (reset diegético con comentario distinto cada vez, como la Puerta de Ohm).

Solución canónica (no única): Empuje 8 — forja con roja (4), campanario con amarilla (2), biblioteca con gris (1). Tronco: 7 de 8. **Solución alternativa válida** con Empuje 4 — forja con marrón (4), campanario con roja (2), biblioteca con amarilla (1), Tronco 7: el banco acepta ambas; Ohm celebra la equivalencia («Otra red. El mismo reparto.»). **Con Empuje 16 no existe solución** con una piedra por rama (la biblioteca pediría una piedra de 16): es deliberado — el cristal más fuerte no siempre es el mejor, y descubrirlo en el banco es parte de la lección. *(Corregido tras revisión de implementación: la versión anterior de este doc afirmaba erróneamente que el Empuje 16 tenía soluciones.)*

Feedback de fallo (siempre información, nunca castigo):

- Distrito hambriento: su emblema parpadea débil; la forja «tose» hollín; el campanario da una nota desafinada; la biblioteca… aplaude (a la biblioteca le gusta la penumbra: pista de que CADA distrito tiene su justo, no hay un único «más es mejor»).
- Tronco excedido: el fusible mayor avisa, vibra, y a la tercera insistencia se inmola. Lumen tiene repuestos. Siempre tiene repuestos.

### Resolución

Las tres agujas en verde, el Tronco dentro de su marca. El Repartidor «canta»: un acorde de cobre. El Castillo se enciende **en cadena visible**: forja, campanario, biblioteca, pasillos, almenas. Por las ventanas se ve la plaza de Ohmdal allá abajo, y a los ciudadanos dándose vuelta hacia el Castillo.

El mosaico del suelo se ilumina y la inscripción se completa:

> Lo que entra en el cruce, sale del cruce.
> Nada se pierde. Todo se reparte.

**Consejera:**

> Cuarenta años de inventarios…
> Yo custodiaba un tesoro que no se gastaba por usarlo.

*(Pausa. Cierra su libro de inventario.)*

> El último sello es mío. Lo rompo yo.

**Ohm:**

> Registro histórico: Consejo actualizado. Tiempo transcurrido: una tarde.

**Lumen:**

> Más rápido que yo. No se lo digan.

Flags: `solvedDistributor`, `castleRestored`, `learnedSeriesParallel`. La Bitácora arde y se abre sola: entrada formal «La Regla del Cruce».

---

## 8. NIVEL 6 — Cierre: dos mundos, un timbre

**Duración:** 4–5 minutos.

### 8.1. Ohmdal

La plaza de noche, el Castillo encendido al fondo. Diálogos ambientales de ciudadanos:

> «El Castillo tiene luz. ¿Y la chispa no se acabó?»

> «Mi abuela decía que ahí dentro el río sabía contar. Yo creía que era un cuento.»

> Niño: «El robot contó los ríos. Yo conté con él. Dio justo.»

**Edda** (mirando el Castillo):

> Primero una puerta. Ahora un castillo. ¿Qué sigue, el reino entero?
> …Quiero aprender a mostrárselo a los demás. Como hiciste conmigo: sin sermones. Con las manos.

*(Semilla del futuro de Edda: maestra. No se promete nada.)*

### 8.2. El Instituto — mini-puzzle de aplicación

De regreso, en el pasillo del Instituto: el viejo **timbre de la escuela**, mudo hace años. Caja abierta: dos caminos de cable — uno cortado, el otro con una piedra equivocada. Aplicación directa de la unidad en el mundo real del jugador (paralelo + freno justo, sin ayuda de Edda ni Lumen ni Ohm: el jugador ya no necesita andamios).

Al sonar el timbre:

> El preceptor se asoma al pasillo. Mira el parlante un rato largo, como a un fantasma educado.

**Preceptor:**

> Veinte años sin sonar.
> …Voy a tener que volver a llegar puntual.

*(El timbre que vuelve = la restauración del Instituto avanzando, audible para todos. Cambio permanente del hub.)*

Flags: `fixedSchoolBell`, `unit2Completed`.

### 8.3. Ganchos salientes

**Hacia la U3 (potencia — la Forja):** con el Castillo encendido, la forja trabaja… y sus canales **entibian**. Lumen apoya la mano en el cobre y la retira rápido:

> Esto antes no pasaba. O pasaba y nadie tocaba los canales.
> El río no se gasta, de acuerdo. ¿Y entonces qué es lo que estoy sintiendo?

*(Algo SÍ se entrega en el camino — pero no es el río: es trabajo. Distinguir corriente de energía es la finura de la U3.)*

**Hacia la unidad del capacitor (anomalía de largo aliento):**

Durante la inspección final del Repartidor (cinemática corta o interacción), la Consejera pide cortar el Tronco «para el acta». Se corta. Y un mecanismo auxiliar del tablero **sigue brillando tres segundos, solo, sin camino.**

**Edda:**

> …El camino estaba cortado.
> ¿De DÓNDE salió ese río?

**Ohm:**

> Dato no contable. Repetición recomendada.

**Consejera:**

> *(reabriendo el libro de inventario)* No pienso anotar eso.

La Bitácora registra sola:

> Anomalía: la chispa que se queda.

*(Tema: almacenamiento — el capacitor. Se paga en la U5 «La chispa que se queda» según `ohmdal-ruta-contenidos.md`; la anomalía queda registrada en la Bitácora y se cocina a fuego lento durante U3 y U4. El gancho vive en el mundo: algo brilló sin camino, y eso contradice TODO lo aprendido hasta ahora. Esa contradicción aparente es el motor.)*

---

## 9. Entradas de Bitácora de la Unidad 2

Mismo formato de dos capas (vivencial / formal). Las tres primeras nacen incompletas y se completan tras el Repartidor.

### 9.1. «Dos caminos» (tras el puzzle de la campana)

**Vivencial:** medición de la campana: medio río y medio río; el tronco lleva todo; un camino abierto no pierde su río — se muda al hermano. Los Maestros duplicaban caminos como promesa, no como gasto.
**Formal (tras el Repartidor):** en un cruce, la corriente se reparte entre los caminos; la suma de lo que sale es igual a lo que entra. **Error común:** creer que la corriente «se gasta» al repartirse.

### 9.2. «La Cadena» (tras la Galería)

**Vivencial:** todas las lámparas igual de tenues; quitar una mata todas; Ohm midió el mismo río en cada punto de la fila.
**Formal:** eso se llama **circuito en serie**: un solo camino, una sola corriente, y las resistencias **se suman**. Las lámparas en serie no se reparten corriente: la comparten entera, frenándola entre todas. **Error común:** «la primera lámpara brilla más» — no: en serie no hay primera ni última para el río. **Pregunta:** ✎ ¿Las luces de tu casa estarán en fila? Pista: ¿qué pasa cuando se quema una sola?

### 9.3. «Los Ramales» (tras la Sala de los Ramales)

**Vivencial:** cada rama cobró según su piedra; conectar una rama no cambió a las otras; el Tronco pagó la suma y el Fusible mayor se inmoló cuando pedimos de más.
**Formal:** eso se llama **circuito en paralelo**: cada rama recibe el mismo Empuje y toma su propia corriente (I = V/R, ¡la de la Puerta!, una vez por rama). La fuente entrega la suma. **Error común:** «agregar ramas es gratis» — cada rama nueva es corriente nueva que el tronco debe poder llevar.

### 9.4. «La Regla del Cruce» (formal, tras el Repartidor)

La entrada mayor de la unidad:

> El río no se gasta. Se reparte.
> Lo que entra en un cruce, sale del cruce.

Con la red del Repartidor dibujada y las dos soluciones equivalentes anotadas. Nombres verdaderos: **serie**, **paralelo**, **nodo**. Nota al pie, en letra de la Bitácora: *«Mucho después, alguien le puso su apellido a la regla del cruce: Kirchhoff. Pero el cruce ya la sabía.»* **Pregunta:** ✎ El timbre de la escuela tiene dos caminos. ¿Para qué, ahora que lo sabes?

---

## 10. Ritmo emocional de la unidad

| Momento | Emoción buscada |
|---|---|
| Aula con lámpara nueva | recompensa, pertenencia |
| Proyector clausurado | intriga + indignación suave |
| Campana de dos cables | curiosidad resuelta con las manos |
| La Consejera | fricción institucional con humor |
| Umbral del Castillo (Ohm) | escalofrío breve, misterio mayor |
| Galería en Cadena | asombro contraintuitivo (el río no se gasta) |
| Fusible del Tronco | sobresalto + empatía con el miedo del Consejo |
| El Repartidor | dominio, orquestación |
| Castillo encendido | recompensa épica, la mayor del juego hasta aquí |
| La Consejera rompe el sello | conmoción tranquila |
| El timbre del Instituto | calidez, los dos mundos tocándose |
| La chispa que se queda | desconcierto fértil, deseo de U3 |

---

## 11. Flags de la unidad

```txt
playedUnit2Intro
solvedBellPaths
metConsejera
enteredCastle
ohmRecognizedCastle
solvedGalleryChain
solvedBranches
burnedTrunkFuse
solvedDistributor
castleRestored
learnedSeriesParallel
fixedSchoolBell
sawStoredSpark
unit2Completed
```

---

## 12. Criterios de aceptación

La Unidad 2 funciona si el jugador puede decir, sin haber recibido una clase:

- «En fila, si se corta uno, se apagan todos.»
- «En fila, el río es el mismo en todas partes: no se gasta.»
- «Más cosas en fila = más freno total = todo más débil.»
- «En ramales, cada camino recibe según su freno, sin robarle a los demás.»
- «Pero cada ramal nuevo le pide más río al tronco.»
- «Lo que entra al cruce, sale del cruce.»

Y recién después leer en la Bitácora: *eso se llama serie, paralelo, y la regla del cruce.*

---

## 13-bis. Líneas menores fijadas en implementación (v0.2)

Texto conectivo que el guion original no especificaba, escrito durante el build (canon desde ahora):

- **Proyector, re-interacción tras el módulo dos:** «*clac* Unidad dos: en curso. Consulte su Bitácora. …Y no firme nada sin medirlo antes. *clac*»
- **Camino al Castillo antes de la campana (puerta trabada):» «Un cordón lacrado del Consejo cruza el camino al Castillo: "PASO RESTRINGIDO POR CONSERVACIÓN DE CHISPA. Sin excepciones."» / «Sin evidencia, nadie va a mover ese cordón. La campana de los dos cables espera en la plaza.»
- **Gate Galería→Ramales (Consejera):** «Los Ramales siguen sellados. Primero la Galería: si el instrumento dice la verdad aquí, la dirá allá.»
- **Gate Ramales→Corazón (Consejera):** «El Corazón, todavía no. El Consejo selló de afuera hacia adentro; se abre al revés. …Y los Ramales aún no me convencen.»
- **Ohm en el Corazón (interacción):** «Tablero maestro. Tres salidas, un río. Función: contar. …Función recordada.» *(guiño mínimo a su origen, sin gastar reserva)*
- **Lumen, repuestos del fusible (Ramales):** «El Mártir tiene hermanos. Yo los traigo; ustedes traten de que no hagan falta.» / «Segundo repuesto. Mi maestro decía que al tercero ya no es accidente: es costumbre.» / «…Tengo más. No me miren así.»
- **Lumen, repuestos del fusible (Repartidor):** «Un fusible para el Corazón del Castillo. Si me lo decían de aprendiz, me desmayo.» / «Otro más. La Consejera anota; yo repongo. Cada cual su liturgia.» / «…Tengo más. No me miren así.»

## 13. Notas de coherencia y pendientes

1. **Continuidad numérica:** el doc de la U1 dice «último mantenimiento: hace 43 años» pero el juego implementado dice «34 años» ([rooms.ts](../src/game/rooms.ts), proyector). Unificar (propuesta: 43, y corregir el código). La Consejera dice «cuarenta años de inventarios»: compatible con cualquiera de los dos si el sello fue posterior a la decadencia.
2. **«Aula» vs «Taller» de Electrónica:** sigue pendiente de la revisión del prólogo (§28.3 de `prologo.md`): este doc usa «Aula» por coherencia con lo implementado; si se canoniza «Taller», cambiar aquí también.
3. **La Consejera no tiene nombre propio**, coherente con Roxana sin apellido y el preceptor sin nombre. Si esta regla se vuelve incómoda con más personajes institucionales, revisarla a nivel juego, no por personaje.
4. **Escala greybox sugerida** (si se construye como slice): NIVEL 0 reusa el aula; Castillo = 3 salas nuevas (galería, ramales, corazón) + puerta; la campana y el timbre reusan la plaza y el hall. 4 puzzles de banco nuevos, 4 entradas de Bitácora. Estimación gruesa: similar a la U1 (el motor, el banco y la Bitácora ya existen).
5. **Decisiones abiertas para el autor:**
   - ¿La Consejera regresa en unidades futuras (Consejo como hilo institucional de Ohmdal)?
   - ¿El timbre del Instituto suena de ahí en adelante en momentos fijos (diegético-ambiental)?
   - ¿Cuánto se muestra del «mapa de circuitos del castillo» que mencionó Lumen — es el mosaico del Repartidor o un objeto coleccionable aparte?
