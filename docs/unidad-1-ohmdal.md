# Proyecto Roxana — Ohmdal (mundo + Unidad 1)
# “La corriente no es magia”

**Versión:** 0.3 — guion detallado + síntesis del mundo unificados  
**Alcance:** todo el canon de Ohmdal: lore del mundo, léxico, personajes, diseño de puzzles y guion completo de la Unidad 1 (desde el Aula de Electrónica hasta el cierre).  
**Uso recomendado:** fuente de verdad narrativa y de diseño para implementación Phaser y generación de assets. Las reglas de diseño generales del juego (Bitácora, anti-clase, formato, arquitectura) viven en `diseno-sintesis-v1.md`.  
**Estado:** propuesta avanzada para canonizar.

---

## A. Síntesis del mundo Ohmdal (canon)

### A.1. Qué es Ohmdal

Ohmdal es un **Mundo Aplicado**: un reino experimental *creado por el propio Instituto Roxana* para enseñar Electrónica («que la electricidad se aprenda caminándola»). El acceso es por el Aula/Taller de Electrónica; el proyector institucional lo establece en la transición. Los Mundos Aplicados se degradaron junto con la escuela que los mantenía — la pregunta de largo plazo (¿quién los construyó y por qué se abandonaron?) queda abierta.

Línea clave del lore: *«el mundo responde a la comprensión del estudiante; la incomprensión también deja huella»*.

**Simetría temática central:** el Instituto y Ohmdal tienen la misma enfermedad — conservan las formas del conocimiento pero perdieron la comprensión. Restaurar Ohmdal restaura, de a poco, al Instituto.

Último mantenimiento registrado: hace 43 años (establecido en la cinemática del proyector).

### A.2. Léxico diegético de la Unidad 1

El vocabulario técnico es spoiler. Nadie dice "voltaje" antes de la Puerta de Ohm.

| Técnico | Diegético | Momento de conversión |
|---|---|---|
| tensión | Empuje | Bitácora, tras la Puerta de Ohm |
| corriente | Río / Chispa | Bitácora, tras la Puerta de Ohm |
| resistencia | Piedra / Freno | Bitácora, tras la Puerta de Ohm |
| circuito cerrado | Camino completo | Bitácora, tras reactivar a Ohm |

I = V/R aparece solo tras la Puerta de Ohm. En Ohmdal la relación se llama **el Pacto de los Tres Signos** (Empuje · Río · Piedra), con el triángulo V/I/R como emblema degradado a amuleto.

### A.3. Piedras de Freno = código real de resistencias

Las piedras llevan bandas de color con el **código verdadero de resistencias** (marrón=1, rojo=2, amarillo=4, gris=8). En Ohmdal es «el código de los Maestros»; la entrada «La Piedra de Freno» de la Bitácora revela tras la formalización que es el código real (tabla 0–9 completa). El jugador llega a las resistencias físicas reconociendo las bandas.

### A.4. Diseño de puzzles — una variable nueva por puzzle

| Puzzle | Concepto | Manipulación | Feedback de fallo |
|---|---|---|---|
| Reactivar a Ohm | Camino completo | Conectar/cerrar | Nada ocurre; Ohm inerte |
| Piedra de Freno | Resistencia | Insertar/cambiar piedras | Humo, chispas, fusible; Ohm vibra |
| Puerta de Ohm | Relación V-I-R | Ajustar dos variables hacia corriente objetivo | Poco → no se mueve; mucho → se traba y humea |

**Puerta de Ohm (diseño fino):** indicador analógico (aguja en zona marcada, sin números), ~3 cristales de Empuje × ~4 Piedras de Freno, **múltiples soluciones válidas** (mucho empuje + mucho freno ≈ poco + poco) — eso ES la proporcionalidad descubierta con las manos. Ohm como medidor vivo redundante (aguja = precisión, Ohm = lectura emocional). El fallo produce información, nunca pérdida: reset diegético con fusibles rituales de Lumen y comentario distinto cada vez. Valores cualitativos o en unidades ficticias hasta la formalización; las unidades reales aparecen en la Bitácora como "el nombre verdadero de las cosas".

### A.5. Notas de diseño de personajes

(El detalle narrativo está en §2; esto es la capa de diseño.)

- Regla compartida: **ninguno explica; los tres reaccionan** — Edda al resultado, Lumen al método, Ohm al estado eléctrico.
- **Ohm** es reserva narrativa de largo plazo: un autómata antiguo *vio* cómo Ohmdal olvidó — no gastar su backstory en la Unidad 1.
- **Edda** modela la actitud científica sin dar respuestas; es el avatar de la pregunta del jugador.
- **Lumen** dice la frase guía citando a los antiguos: *«Donde otros ven magia, buscá camino.»* Sus misconcepciones (y las de los ciudadanos) mapean a misconcepciones reales de estudiantes (ej. "la corriente se gasta en el camino").

### A.6. Estado de implementación (junio 2026)

Vertical slice greybox **construido y verificado E2E**: título → hall → Bitácora → aula → proyector → portal → plaza → despertar a Ohm → taller → freno → Puerta de Ohm → formalización → campana → fin. Audio procedural WebAudio (música por zona + SFX). Pendiente respecto de este guion: la fuente de la plaza (puzzle de Empuje) se cortó del slice — el Empuje se introduce dentro de la Puerta; los mini-puzzles de aplicación (§13) y varios diálogos de este doc aún no están implementados.

---

## 0. Principios de esta unidad

Ohmdal no debe sentirse como “un nivel educativo sobre la Ley de Ohm”. Debe sentirse como un mundo vivo, antiguo y bello, que olvidó cómo funcionaba.

La enseñanza ocurre en tres capas:

1. El jugador observa un problema.
2. El jugador manipula el sistema y ve consecuencias.
3. La bitácora formaliza lo descubierto después.

La fórmula no aparece primero. Primero aparece el mundo.

Frase central de la unidad:

> La corriente no obedece rituales. Obedece relaciones.

---

## 1. Resumen narrativo completo

Después de encontrar la Bitácora de Roxana en el despacho, el jugador descubre que el mapa antiguo de la escuela señala el Aula de Electrónica. Al entrar, encuentra un aula técnica polvorienta pero todavía cargada de intención: bancos de trabajo, resistencias, fuentes de alimentación, osciloscopios, carteles viejos y un proyector institucional.

El proyector muestra una pieza educativa antigua sobre Ohmdal: un reino experimental donde la electricidad “toma forma” para que los estudiantes puedan aprender observando. La grabación muestra un Ohmdal brillante, lleno de lámparas, canales de cobre, molinos, estudiantes y autómatas. Pero al final el video falla: el último mantenimiento fue hace 43 años.

El portal del aula se abre.

Cuando el jugador entra a Ohmdal, descubre que el mundo real no se parece al video. La plaza está apagada. Los ciudadanos conservan símbolos eléctricos, pero los interpretan como supersticiones. El triángulo V/I/R aparece en amuletos, mosaicos y puertas, pero nadie lo entiende como relación entre tensión, corriente y resistencia.

Allí aparece **Edda**, una aprendiz de artificiera, joven, curiosa y desesperada porque los rituales ya no funcionan. Ella reconoce al jugador como alguien “de la Escuela”, no como elegido, sino como alguien que quizá todavía puede leer lo que ellos olvidaron.

Juntos encuentran a **Ohm**, un antiguo autómata apagado. Al reactivarlo cerrando un circuito simple, el jugador descubre el primer principio: la chispa necesita un camino completo. Ohm despierta, se suma al grupo y funciona como mascota, medidor viviente y recurso humorístico.

Edda conduce al jugador al taller de **Maese Lumen**, un artificiero viejo y terco que repite rituales sin comprenderlos. Lumen cree que los mecanismos fallan porque “la chispa está ofendida”. En su taller, el jugador descubre que un circuito puede estar cerrado y aun así no funcionar bien si algo lo frena demasiado: las piedras de freno, resistencias representadas con bandas de colores.

Luego, el grupo llega a la **Puerta de Ohm**, un mecanismo antiguo que alimenta la plaza. La puerta tiene tres símbolos: el Empuje, el Río y la Piedra. Los ciudadanos los interpretan como espíritus separados. Edda sospecha que forman parte de una sola regla. El jugador experimenta ajustando cristales de empuje, piedras de freno y fusibles hasta lograr una corriente adecuada.

Cuando la puerta se abre, una inscripción revela:

> La corriente no obedece a la voluntad. Obedece a la relación.

Solo en ese momento la bitácora formaliza la Ley de Ohm:

> La tensión empuja.  
> La resistencia dificulta.  
> La corriente resulta de esa relación.  
> I = V / R

Con la plaza parcialmente restaurada, el jugador resuelve mini-puzzles de aplicación: una lámpara débil, un motor con sobrecorriente y una campana alimentada por caminos distintos. Finalmente activa la **Campana de Ohmdal**, que restaura la plaza y deja abierto el próximo tema: circuitos con más de un camino.

La unidad termina con Edda preguntándose qué más entendieron mal, Lumen aceptando con incomodidad que los rituales quizá no alcanzan, y Ohm registrando que la restauración de Ohmdal apenas comenzó.

---

## 2. Personajes principales de la unidad

### 2.1. Protagonista

**Tipo:** avatar semi-silencioso, estilo RPG clásico / Pokémon.  
**Función:** proyección del jugador.  
**Tono:** curioso por acción, no por discurso.

El protagonista no tiene largos monólogos ni una personalidad demasiado definida. Sus respuestas son breves y opcionales. El mundo reacciona a sus acciones.

Debe sentirse así:

> No es especial porque estaba destinado. Se vuelve importante porque presta atención.

Ejemplos de respuestas:

- “¿La magia?”
- “Estoy buscando mi aula.”
- “Creo que me equivoqué de puerta.”
- “Eso no parece seguro.”
- “Probemos otra vez.”

### 2.2. Edda

**Rol:** compañera humana de Ohmdal.  
**Edad sugerida:** similar al jugador o apenas mayor.  
**Oficio:** aprendiz de artificiera.  
**Personalidad:** curiosa, inteligente, práctica, irónica cuando se frustra.  
**Arco:** pasa de sospechar que los rituales esconden reglas a querer enseñar esas reglas.

Edda no sabe la Ley de Ohm como fórmula. Pero tiene intuición. Ella es quien empieza a cuestionar la explicación mágica.

Frase guía:

> “¿Y si no fuera un espíritu? ¿Y si fuera una regla que olvidamos leer?”

Relación con el jugador:

- Al inicio lo usa como última esperanza práctica.
- Luego se sorprende de que el jugador no haga rituales.
- Después lo respeta porque observa, prueba y aprende.
- Al final quiere cruzar algún día al aula de Electrónica.

Posible futuro:

Edda podría convertirse en profesora, guía o asistente del aula de Electrónica al restaurar más unidades de Ohmdal.

### 2.3. Ohm

**Rol:** mascota, autómata antiguo, medidor emocional y técnico.  
**Función jugable:** feedback visual de corriente.  
**Función narrativa:** gancho afectivo, humor y continuidad.

Descripción visual:

- pequeño autómata de cobre y cerámica;
- ojos cyan;
- antena corta;
- cuerpo redondeado;
- pecho con triángulo V/I/R gastado;
- manos/pinzas simples;
- patitas cortas o rueditas.

Estados:

| Estado | Visual | Sonido/Diálogo |
|---|---|---|
| Apagado | ojos oscuros, cuerpo inclinado | silencio |
| Baja corriente | ojos débiles, movimiento lento | “Río pequeño.” |
| Corriente correcta | ojos brillantes, animación alegre | “Camino completo.” |
| Sobrecorriente | humo, vibración, antena roja | “Empuje excesivo.” |
| Error | chispa débil | “Probabilidad de desastre: subiendo.” |

Frases recurrentes:

> Camino abierto. Chispa triste.

> Freno alto. Río pequeño.

> Empuje excesivo. Ohm recomienda no explotar.

> Portador de bitácora detectado. Probabilidad de desastre: moderada.

### 2.4. Maese Lumen

**Rol:** artificiero antiguo, cómico, terco.  
**Función temática:** representa tradición sin comprensión.  
**No es villano.**

Lumen tiene conocimiento práctico acumulado, pero ritualizado. Hace cosas que alguna vez tuvieron sentido técnico, aunque ya no sabe por qué.

Ejemplos:

- golpea generadores porque “despierta la chispa”;
- ordena piedras por color “porque lo hacían los maestros”;
- usa fusibles como “sacrificios de seguridad”;
- cree que la sopa puede ser conductora.

Su arco en esta unidad:

1. Cree que el problema es espiritual o ritual.
2. Ve que el jugador arregla algo sin rituales.
3. Se resiste.
4. Acepta parcialmente que hay una relación.
5. Termina incómodo pero intrigado.

Frase guía:

> “No digo que tengas razón. Digo que la puerta abrió justo cuando hiciste eso.”

### 2.5. Ciudadanos de Ohmdal

Funcionan como coro temático.

No son tontos. Son herederos de una cultura que perdió explicación y conservó práctica.

Ejemplos de comportamiento:

- llevan amuletos V/I/R;
- rezan ante lámparas;
- pintan bandas de colores en piedras sin saber leerlas;
- llaman “altares” a tableros eléctricos;
- temen a los fusibles porque “se sacrifican”.

Diálogo ambiental:

> “Que el Empuje mire nuestro altar.”

> “Mi abuela decía que si pintabas tres bandas en una piedra, la chispa pasaba más educada.”

> “El Río no corre. Quizás alguien ofendió a la Piedra.”

---

# NIVEL 0 — Aula de Electrónica

**ID sugerido:** `MAP_ELECTRONICS_CLASSROOM`  
**Duración:** 3–5 minutos  
**Función:** transición escuela → mundo.

## 3.1. Contexto

El jugador llega al Aula de Electrónica después de encontrar la bitácora y el mapa en el despacho de Roxana.

El aula no debe sentirse como dungeon. Debe sentirse como un aula técnica real, pero con algo latente.

## 3.2. Descripción visual

Aula rectangular, antigua, con bancos de trabajo. Luz tenue entrando por ventanas altas. Polvo sobre equipos. Un olor sugerido a madera vieja, metal y cables.

Elementos visuales:

- mesas largas de taller;
- fuentes de alimentación viejas;
- cajas de resistencias;
- osciloscopios apagados;
- cables enrollados;
- póster de seguridad eléctrica;
- pizarrón con restos de circuitos;
- proyector institucional;
- maqueta/panel de Ohmdal;
- puerta o arco técnico con símbolo V/I/R.

El símbolo V/I/R debe aparecer, pero sin explicación. Podría estar medio borrado en el pizarrón o en un póster.

## 3.3. Objetos interactivos

### Pizarrón

**Antes de la cinemática:**

> Hay un esquema borrado. Solo se distingue un triángulo con letras: V, I, R.

**Después de volver de Ohmdal:**

> Ahora el dibujo parece menos misterioso. O tal vez vos cambiaste.

### Frascos de resistencias

> Pequeñas piezas con bandas de colores. Parecen demasiado ordenadas para estar olvidadas.

### Fuente de alimentación

> Una fuente vieja. La perilla todavía gira, aunque no está conectada a nada visible.

### Proyector

> El proyector está cubierto de polvo. El cable desaparece detrás de la pared.

Opciones:

- “Activar proyector.”
- “Dejarlo.”

Al activarlo:

Flag: `playedOhmdalIntro = true`

Se apagan parcialmente las luces del aula.

## 3.4. Portal a Ohmdal

Visual:

- el panel V/I/R se ilumina en cyan;
- el proyector empieza a emitir luz aunque ya no apunta a la pared;
- los cables del aula parecen moverse apenas;
- la bitácora vibra.

Texto de bitácora opcional:

> Registro de aula detectado: Electrónica.  
> Módulo asociado: Ohmdal.

---

# 4. Cinemática — “Bienvenido a Ohmdal”

**ID:** `CINE_OHMDAL_INTRO`  
**Duración:** 20–40 segundos  
**Formato:** 4 imágenes estáticas con paneo/parallax leve.  
**Tono:** video institucional antiguo, casi publicitario, con falla al final.

## Imagen 1 — Ohmdal ideal

**Visual:**  
Reino medieval luminoso. Castillos de piedra cálida. Canales de cobre por calles y muros. Lámparas encendidas. Molinos movidos por energía. Pequeños autómatas ayudando a estudiantes.

**Narrador:**

> Bienvenido a Ohmdal, el reino donde la electricidad toma forma.

**Texto superpuesto:**

> Módulo experimental de Electrónica I

**Intención:**  
Mostrar el ideal. El jugador debe entender cómo debería verse Ohmdal.

## Imagen 2 — Estudiantes antiguos

**Visual:**  
Estudiantes del Instituto Roxana en uniformes o guardapolvos antiguos conectan cables, prueban lámparas y observan medidores en una plaza. Un autómata pequeño parecido a Ohm aparece al fondo.

**Narrador:**

> Aquí, cada puerta, lámpara y máquina responde a caminos, obstáculos y reglas.

**Texto:**

> Aprender observando. Comprender construyendo.

**Intención:**  
Conectar mundo y escuela. Ohmdal era una herramienta educativa.

## Imagen 3 — Pacto de los Tres Signos

**Visual:**  
Triángulo V/I/R tallado en piedra. Alrededor, cobre, luz cyan y símbolos medievales. Debe verse como emblema sagrado y técnico a la vez.

**Narrador:**

> Los antiguos llamaron a esa relación el Pacto de los Tres Signos.

**Texto:**

> Empuje. Río. Piedra.

**Intención:**  
Sembrar la Ley de Ohm sin explicarla.

## Imagen 4 — Glitch

**Visual:**  
La imagen ideal se distorsiona. Las lámparas se apagan. Los canales de cobre pierden brillo. El audio se corta.

**Narrador:**

> Ohmdal permanece activo, estable y disponible para toda práctica...

Glitch.

**Texto:**

> Último mantenimiento registrado: hace 43 años.

**Intención:**  
Contraste. Lo que el jugador verá no será lo prometido.

---

# NIVEL 1 — Plaza Apagada de Ohmdal

**ID:** `MAP_OHMDAL_PLAZA_OFF`  
**Duración:** 5–8 minutos  
**Función:** presentación del mundo, Edda y Ohm.

## 5.1. Entrada

El jugador aparece desde el portal en una esquina o plataforma de piedra.

El portal se cierra detrás con un sonido suave, no amenazante.

La plaza está apagada.

No debe sentirse terrorífica. Debe sentirse confundida, detenida y triste.

## 5.2. Descripción visual

Elementos:

- fuente central apagada;
- canales de cobre sin brillo;
- lámparas medievales sin luz;
- ciudadanos preocupados;
- altar/tablero eléctrico con velas alrededor;
- amuletos con triángulo V/I/R;
- cables cortados o desconectados;
- pedestal de Ohm;
- puerta bloqueada al fondo;
- camino al taller de Lumen.

El suelo puede tener mosaicos con forma de circuito.

## 5.3. Primer encuentro con Edda

Edda corre hacia el jugador.

**Edda:**

> ¡Por fin alguien de la Escuela!  
> Los altares dejaron de responder. El Consejo dice que la magia se ofendió.

Opciones jugador:

1. “¿La magia?”
2. “Estoy buscando mi aula.”
3. “Creo que me equivoqué de puerta.”

**Edda:**

> Si te equivocaste, hacelo otra vez. Necesitamos ayuda.

Si el jugador elige “¿La magia?”:

**Edda:**

> Eso dicen ellos. Yo digo que si una lámpara falla siempre por el mismo lado, quizás no está enojada. Quizás está rota.

Si elige “Estoy buscando mi aula”:

**Edda:**

> Excelente. Entonces sabés leer carteles. Eso ya te pone por encima del Consejo.

Si elige “Me equivoqué de puerta”:

**Edda:**

> En Ohmdal las puertas equivocadas suelen ser las más útiles.

Flag: `metEdda = true`

## 5.4. Objetivo inmediato

Edda señala el pedestal de Ohm.

**Edda:**

> Vení. Hay algo que nadie logró despertar.

El jugador puede explorar antes.

## 5.5. Diálogos ambientales de ciudadanos

Ciudadano 1:

> El Río no corre. Alguien debe haber ofendido a la Piedra.

Ciudadana 2:

> Mi abuela decía que tres bandas pintadas calman cualquier chispa.

Ciudadano 3:

> Antes el pequeño de cobre caminaba por la plaza. Ahora ni protesta.

Niño:

> Yo le hablé al altar y me hizo “bzzt”. ¿Eso es bueno?

## 5.6. Ohm apagado

Ohm está inclinado en un pedestal o junto a una fuente de empuje apagada.

Descripción:

> El pequeño autómata tiene el pecho abierto. Dentro, dos conectores no se tocan. Sus ojos están oscuros.

Edda:

> Ese es Ohm. Dicen que fue uno de los primeros autómatas de Ohmdal.  
> Antes medía el ánimo de la chispa. O eso dicen.

Jugador observa:

> Hay un tramo de cobre suelto cerca del pedestal.

---

# PUZZLE 1 — Reactivar a Ohm

**ID:** `PUZZLE_REACTIVATE_OHM`  
**Concepto:** circuito cerrado.  
**Fórmula visible:** ninguna.  
**Duración:** 2–4 minutos.

## 6.1. Componentes

- Fuente de empuje.
- Cable suelto.
- Conector A.
- Conector B.
- Cuerpo de Ohm.
- Lámpara de prueba opcional.

## 6.2. Estados

### Estado A — Circuito abierto

Ohm no responde.

Feedback:

- ojos apagados;
- sonido hueco;
- Edda mira al jugador.

**Edda:**

> Nada. Ni un chispazo.

### Estado B — Cable mal colocado

Chispas débiles en el suelo.

**Ohm, distorsionado:**

> Ca... mi... no... incom...

**Edda:**

> Eso fue casi una palabra. O una amenaza.

### Estado C — Circuito cerrado

El cable une ambos conectores.

Feedback:

- canales de cobre brillan;
- lámpara de prueba se enciende;
- ojos de Ohm se iluminan;
- Ohm se levanta de golpe.

**Ohm:**

> Camino completo. Hola.

Pausa.

**Ohm:**

> Portador de bitácora detectado. Probabilidad de desastre: moderada.

**Edda:**

> ¿Eso fue un saludo o una advertencia?

**Ohm:**

> Sí.

Flag: `reactivatedOhm = true`

## 6.3. Entrada de bitácora

Título:

> Camino completo

Texto:

> La chispa necesita un camino completo. No alcanza con tener una fuente y un objeto: debe existir un recorrido cerrado.

Nota:

No usar todavía palabras como “corriente eléctrica” de forma escolar salvo en modo opcional.

---

# NIVEL 2 — Camino al Taller

**ID:** puede ser transición dentro de plaza o mapa breve.  
**Duración:** 2–3 minutos.  
**Función:** reforzar superstición y preparar resistencia.

## 7.1. Edda guía al jugador

**Edda:**

> Si Ohm despertó, Maese Lumen va a querer verlo.  
> O discutir con él. Es casi lo mismo.

**Ohm:**

> Registro de Lumen: volumen alto. Precisión variable.

## 7.2. Diálogo de camino

Pasando junto a ciudadanos que rezan ante un tablero:

**Edda:**

> Cuando algo falla, el Consejo agrega velas.  
> Cuando sigue fallando, agrega más velas.

Jugador opción:

- “¿Y funciona?”
- “Parece peligroso.”
- “¿Nunca revisan los cables?”

**Edda:**

> Revisar cables es casi una herejía.  
> Por eso me cae bien.

---

# NIVEL 3 — Taller de Maese Lumen

**ID:** `MAP_LUMEN_WORKSHOP`  
**Duración:** 6–8 minutos  
**Función:** introducir resistencia / piedras de freno.

## 8.1. Descripción visual

Taller cálido, caótico, lleno de objetos.

Elementos:

- mesa central;
- bobinas;
- generadores;
- piedras con bandas de colores;
- fusibles colgados como medallas;
- puerta mecánica trabada;
- aguja medidora;
- sopa en una mesa;
- herramientas;
- planos viejos;
- triángulo V/I/R en escudo de artificiero.

## 8.2. Entrada

Lumen está golpeando un generador.

**Lumen:**

> ¡Despertá, chispa miserable! ¡En nombre del segundo rey y del tornillo fundador!

Edda entra.

**Edda:**

> Maese Lumen.

**Lumen:**

> Si venís a decirme que no golpee el generador, llegaste tarde.

**Edda:**

> Traje a alguien de la Escuela.

Lumen mira al jugador.

**Lumen:**

> Muy bajo para ser inspector. Muy limpio para ser artificiero. Muy silencioso para ser del Consejo.

Ohm se acerca.

**Ohm:**

> Lumen detectado. Ruido estable.

**Lumen:**

> ¡El calderito camina!

## 8.3. Problema de la puerta

La puerta del taller no abre.

**Lumen:**

> La puerta no abre porque la chispa está débil.  
> Ya golpeé el generador tres veces y recité los nombres de los antiguos reyes.

**Edda:**

> También le tiró sopa caliente.

**Lumen:**

> Era sopa conductora.

**Ohm:**

> Análisis: sopa innecesaria.

---

# PUZZLE 2 — Piedra de Freno

**ID:** `PUZZLE_BRAKE_STONE_DOOR`  
**Concepto:** resistencia.  
**Fórmula visible:** ninguna.  
**Duración:** 3–5 minutos.

## 9.1. Setup

El circuito de la puerta está cerrado, pero la aguja está baja.

Hay una piedra de freno enorme en el zócalo.

Tres piedras disponibles:

1. Piedra pesada con bandas oscuras.
2. Piedra media con bandas claras.
3. Piedra liviana con bandas brillantes.

## 9.2. Estados

### Piedra alta

La puerta apenas tiembla.

**Ohm:**

> Río pequeño. Piedra grande.

**Lumen:**

> Esa piedra perteneció a mi maestro. Siempre frenó con dignidad.

**Edda:**

> Frenó demasiado.

### Piedra baja

La aguja sube mucho. Un fusible vibra.

**Ohm:**

> Empuje excesivo. Recomendación: no explotar.

**Lumen:**

> ¡El sacrificio del fusible se aproxima!

**Edda:**

> Nadie va a sacrificar nada.

### Piedra media

La aguja entra en zona correcta. La puerta abre.

**Edda:**

> El camino estaba cerrado… pero algo lo frenaba demasiado.

**Lumen:**

> Entonces no era que la chispa estaba débil.

**Ohm:**

> Chispa normal. Piedra exagerada.

**Lumen:**

> Me reservo el derecho de sentirme ofendido.

Flag: `solvedBrakeStonePuzzle = true`

## 9.3. Bitácora

Título:

> Piedras de freno

Texto:

> Algunas piezas no cortan el camino, pero lo dificultan. En Ohmdal las llaman piedras de freno.

---

# NIVEL 4 — La Puerta de Ohm

**ID:** `MAP_GATE_OF_OHM`  
**Duración:** 8–10 minutos  
**Función:** primer evento importante de Ley de Ohm.

## 10.1. Contexto

La puerta alimenta la plaza principal. Si se abre, Ohmdal recupera parte de su flujo de energía.

Los ciudadanos creen que la puerta exige tres ofrendas.

## 10.2. Descripción visual

Puerta monumental de piedra y cobre.

Tres símbolos:

- Corona luminosa: Empuje.
- Río de chispas: Río.
- Piedra rugosa: Piedra.

En el suelo, un mosaico triangular V/I/R.

A los lados, espacios para:

- cristal de empuje;
- piedra de freno;
- fusible.

Aguja central.

## 10.3. Diálogo inicial

**Lumen:**

> El Empuje, el Río y la Piedra.  
> Tres espíritus. Tres ofrendas. Tres dolores de cabeza.

**Edda:**

> ¿Y si no fueran tres espíritus?  
> ¿Y si fueran partes de la misma regla?

**Lumen:**

> Las reglas no abren puertas antiguas.

La puerta emite un sonido.

**Ohm:**

> Registro histórico: comentario incorrecto.

---

# PUZZLE 3 — La Puerta de Ohm

**ID:** `PUZZLE_GATE_OF_OHM`  
**Concepto:** relación entre empuje, freno y río.  
**Fórmula visible:** aún no.  
**Duración:** 5–8 minutos.

## 11.1. Componentes

Cristales de empuje:

- bajo;
- medio;
- alto.

Piedras de freno:

- alta;
- media;
- baja.

Fusible:

- se activa si el río es demasiado alto.

Aguja:

- zona baja;
- zona correcta;
- zona peligrosa.

## 11.2. Experiencias deseadas

### Caso 1 — Poco empuje + mucha piedra

La aguja casi no se mueve.

**Edda:**

> Hay camino, pero no alcanza.

**Ohm:**

> Río pequeño.

### Caso 2 — Más empuje

La aguja sube.

**Lumen:**

> ¡Ajá! Más Empuje despierta más Río.

**Edda:**

> Eso sí parece una regla.

### Caso 3 — Mucho empuje + poca piedra

El fusible salta.

**Ohm:**

> Empuje excesivo. Río furioso.

**Lumen:**

> ¡El fusible dio su vida!

**Edda:**

> Era literalmente su trabajo.

### Caso 4 — Equilibrio correcto

La aguja queda en zona central.

La puerta se ilumina.

Los tres símbolos giran y se alinean.

## 11.3. Revelación

La puerta se abre lentamente.

Inscripción:

> La corriente no obedece a la voluntad.  
> Obedece a la relación.

Silencio breve.

**Edda:**

> Relación…  
> Entonces el Empuje, el Río y la Piedra no estaban separados.

**Ohm:**

> Cálculo antiguo encontrado. Nombre: Ley de Ohm.

**Lumen:**

> ¿Ley?  
> Qué manía de los antiguos de ponerle autoridad a todo.

Flag: `openedGateOfOhm = true`  
Flag: `learnedOhmsLaw = true`

## 11.4. Bitácora formal

Título:

> Ley de Ohm

Texto:

> La tensión empuja.  
> La resistencia dificulta.  
> La corriente resulta de esa relación.

Fórmula:

> I = V / R

Texto adicional:

> En Ohmdal la llamaban el Pacto de los Tres Signos. No era un hechizo. Era una forma de recordar cómo se relacionaban.

---

# NIVEL 5 — Plaza restaurada parcialmente

**ID:** `MAP_OHMDAL_PLAZA_ON`  
**Duración:** 4–6 minutos  
**Función:** aplicar lo aprendido en problemas pequeños.

## 12.1. Cambios visuales

- fuente central activa parcialmente;
- lámparas encendidas;
- ciudadanos reaccionando;
- cobre con brillo;
- música más viva;
- algunos sectores aún oscuros.

Ciudadana:

> El altar respondió sin velas.

Ciudadano:

> Quizás pusimos demasiadas velas.

Niño:

> El robot dijo que no explotáramos. Me cae bien.

---

# MINI-PUZZLES DE APLICACIÓN

## 13.1. Mini-puzzle A — Lámpara débil

**Concepto:** no siempre conviene subir empuje; a veces hay que reducir freno.

Setup:

Una lámpara prende muy poco.

Opciones:

- subir cristal de empuje;
- cambiar piedra de freno;
- agregar fusible.

Solución recomendada:

- cambiar piedra de freno alta por media.

Feedback:

**Edda:**

> No le diste más fuerza. Le sacaste obstáculo.

**Ohm:**

> Río agradecido.

## 13.2. Mini-puzzle B — Motor sobrecargado

**Concepto:** demasiada corriente también es problema.

Setup:

Un motor gira demasiado rápido y se bloquea.

Opciones:

- bajar empuje;
- agregar piedra de freno;
- quitar fusible.

Solución:

- agregar piedra de freno o bajar empuje.

Feedback:

**Lumen:**

> Es la primera vez que arreglamos algo frenándolo.

**Edda:**

> A veces frenar también es controlar.

## 13.3. Mini-puzzle C — Camino largo/corto

**Concepto:** el camino importa.

Setup:

Una campana pequeña puede conectarse por dos rutas:

- camino corto de cobre limpio;
- camino largo con piedra agrietada.

Solución:

- elegir camino corto o reparar el largo.

Feedback:

**Ohm:**

> Camino largo. Río cansado.

No formalizar serie/paralelo todavía.

---

# NIVEL 6 — Campana de Ohmdal

**ID:** `MAP_OHMDAL_BELL`  
**Duración:** 5 minutos  
**Función:** cierre emocional y mecánico.

## 14.1. Descripción visual

Un espacio elevado o plaza secundaria con una campana antigua conectada a canales de cobre.

La campana tiene marcas V/I/R gastadas.

Está diseñada para sonar solo si la corriente es correcta.

## 14.2. Diálogo antes del puzzle

**Edda:**

> Esa campana despertaba los talleres cuando empezaban las prácticas.  
> Nadie la escucha desde antes de que yo naciera.

**Lumen:**

> Sonaba demasiado temprano.

**Ohm:**

> Registro: Lumen llegaba tarde.

**Lumen:**

> Registro: Ohm hablaba de más.

---

# PUZZLE FINAL — Campana

**ID:** `PUZZLE_OHMDAL_BELL`

Objetivo:

Ajustar empuje y freno para que la aguja quede en zona correcta.

Estados:

- baja: campana vibra pero no suena;
- alta: mecanismo se bloquea;
- correcta: campana suena.

## 14.3. Resolución

La campana suena.

La plaza se ilumina en cadena.

Los ciudadanos miran alrededor, sorprendidos.

La bitácora se abre sola.

Mensaje de Roxana, breve, como registro antiguo:

> Una regla entendida vale más que mil rituales repetidos.

No mostrar a Roxana físicamente de forma clara. Puede ser solo voz, texto, eco o registro.

## 14.4. Cierre de personajes

**Edda:**

> Si esto era solo una puerta… ¿qué más entendimos mal?

**Lumen:**

> Quizás podrías revisar el viejo mapa de circuitos del castillo.  
> Pero cuidado. Allí no hay una sola corriente. Hay muchas.

**Ohm:**

> Restauración parcial completada.  
> Probabilidad de nuevos problemas: alta.

**Edda:**

> Qué optimista.

**Ohm:**

> De nada.

Flag: `rangOhmdalBell = true`

## 14.5. Hook Unidad 2

La cámara muestra un castillo o distrito cerrado.

En sus muros hay múltiples canales de cobre que se dividen en varios caminos.

La bitácora registra:

> Próxima anomalía detectada: caminos múltiples.

Tema futuro:

- circuitos en serie;
- circuitos en paralelo;
- reparto de corriente;
- eventualmente Leyes de Kirchhoff.

---

## 15. Ritmo emocional de la unidad

| Momento | Emoción buscada |
|---|---|
| Aula de Electrónica | curiosidad, rareza |
| Cinemática | maravilla institucional |
| Plaza apagada | contraste, melancolía |
| Edda | urgencia con humor |
| Ohm apagado | ternura / misterio |
| Reactivar Ohm | satisfacción inmediata |
| Lumen | comedia y tradición |
| Piedra de freno | descubrimiento práctico |
| Puerta de Ohm | evento importante |
| Ley de Ohm | revelación, no clase |
| Plaza restaurada | recompensa visual |
| Campana | cierre emocional |
| Hook castillo | deseo de seguir |

---

## 16. Reglas de escritura para diálogos

1. Nadie debe dar una clase larga.
2. Edda pregunta y sospecha.
3. Ohm resume con frases cortas.
4. Lumen exagera y se resiste.
5. Los ciudadanos muestran la superstición.
6. La bitácora formaliza después.
7. El protagonista habla poco.
8. El humor no debe romper la emoción.

---

## 17. Lista de flags narrativos

```txt
playedOhmdalIntro
enteredOhmdal
metEdda
foundOhm
reactivatedOhm
journalClosedCircuitUnlocked
metLumen
solvedBrakeStonePuzzle
journalBrakeStoneUnlocked
reachedGateOfOhm
openedGateOfOhm
learnedOhmsLaw
journalOhmsLawUnlocked
restoredOhmdalPlaza
solvedLampMiniPuzzle
solvedMotorMiniPuzzle
solvedPathMiniPuzzle
rangOhmdalBell
ohmdalUnit1Completed
```

---

## 18. Criterios de aceptación narrativa

La Unidad 1 funciona si el jugador puede decir, sin haber recibido una clase:

- “Ah, algo necesita un camino completo.”
- “Esa piedra lo frena.”
- “Si empujo más, pasa más.”
- “Si freno más, pasa menos.”
- “Si me paso, se quema.”
- “Entonces hay una relación.”

Y recién después puede leer en la bitácora:

> Eso se llama Ley de Ohm.

---

## 19. Cambios para canonizar

- Ohmdal se presenta primero como video institucional ideal y luego como mundo deteriorado.
- Edda es la compañera humana principal y sospecha que los rituales esconden reglas.
- Ohm se reactiva con el primer puzzle de circuito cerrado.
- Lumen representa la tradición práctica que perdió comprensión.
- Las piedras de freno son resistencias con código visual de bandas.
- La Puerta de Ohm es el primer evento importante de Ley de Ohm.
- La Campana de Ohmdal cierra la unidad y abre el tema de caminos múltiples.
