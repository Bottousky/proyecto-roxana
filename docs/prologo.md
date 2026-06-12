# Proyecto Roxana — Detalle del Prólogo

**Documento:** Guion y diseño narrativo del prólogo  
**Versión:** 0.2 — revisado contra el diseño general y el slice implementado (ver §28, Notas de revisión)  
**Estado:** Base de trabajo  
**Formato objetivo:** RPG 2D / aventura narrativa para web/mobile  
**Escenario principal:** Escuela Roxana  
**Primer mundo asociado:** Ohmdal / Electrónica  

---

## 1. Intención general del prólogo

El prólogo presenta al jugador como una persona que empieza la secundaria en una escuela antigua que no eligió. La Escuela Roxana fue asignada por descarte: no era la primera opción, ni la segunda, sino la institución disponible al final del proceso.

La escuela tuvo un pasado prestigioso, lleno de estudiantes, talleres activos, proyectos técnicos y una cultura educativa basada en la curiosidad. Sin embargo, en el presente casi nadie la elige. Los jóvenes y las familias prefieren escuelas más modernas, visibles o prometedoras. La Roxana quedó como una institución vieja, poco atractiva y casi vacía.

El prólogo debe instalar una tensión central:

> El jugador llega esperando poco, pero la escuela parece estar esperando algo de él.

La fantasía y el misterio no deben aparecer de forma explosiva al comienzo. Primero debe sentirse como una escuela real, vieja, algo abandonada, con trámites, preceptoría, dirección, aulas, carteleras y silencio. Lo extraño debe surgir gradualmente desde el interior de ese realismo.

---

## 2. Objetivos narrativos

### 2.1. Objetivo emocional

El jugador debe sentir:

- Resignación inicial.
- Extrañeza ante una escuela demasiado vacía.
- Curiosidad por el pasado de la institución.
- Incomodidad leve ante frases y objetos que no terminan de cerrar.
- Intriga al encontrar la Bitácora.

### 2.2. Objetivo de mundo

El prólogo debe comunicar que:

- La Escuela Roxana sigue funcionando, pero apenas.
- Antes fue una escuela importante.
- Su identidad estaba ligada a aprender explorando.
- Roxana fue una figura central en esa historia.
- La Bitácora es un objeto antiguo, raro y ligado a la leyenda de la escuela.
- El primer curso del jugador será Electrónica.
- El aula de Electrónica será la puerta inicial hacia Ohmdal.

### 2.3. Objetivo jugable

El prólogo debe enseñar sin tutorial pesado:

- Movimiento básico.
- Interacción con objetos y personajes.
- Lectura de textos ambientales.
- Actualización de objetivos.
- Uso inicial de la Bitácora como menú diegético.
- Primer desplazamiento guiado hacia un aula.

---

## 3. Tono general

El prólogo no debe sentirse como una aventura mágica clásica. Debe sentirse como:

> Primer día de secundaria en una escuela vieja que nadie quería, donde algo imposible empieza a filtrarse por las grietas de lo cotidiano.

### Claves de tono

- Melancólico, pero no deprimente.
- Misterioso, pero no terrorífico.
- Escolar, pero no burocrático en exceso.
- Técnico, pero no frío.
- Fantástico, pero contenido.
- Cálido, humano y con humor seco en algunos diálogos.

---

## 4. Estructura general del prólogo

1. Cinemática introductoria con imágenes estáticas.
2. Aparición del jugador en el Hall de la Escuela Roxana.
3. Búsqueda del preceptor.
4. Conversación con el único preceptor.
5. Indicación de ir a Dirección.
6. Exploración del despacho de Dirección.
7. Encuentro con la Bitácora.
8. Primera activación de la Bitácora como menú/guía escolar.
9. Regreso con el preceptor.
10. Reacción extraña del preceptor ante la Bitácora.
11. Asignación del primer curso: Taller de Electrónica.
12. Reacciones de estudiantes ante la Bitácora.
13. Camino hacia el Taller de Electrónica.
14. Entrada al aula.
15. Transición al Capítulo 1.

---

# 5. Cinemática introductoria

La cinemática inicial se compone de cuatro imágenes estáticas o semi-estáticas. Pueden tener una estética más ilustrada que el gameplay, pero deben mantener la identidad visual del juego: escuela técnica antigua, misterio cálido, abandono leve y memoria educativa.

No se busca mostrar fantasía explícita todavía. La cinemática debe construir el contraste entre la escuela que fue y la escuela que es.

---

## 5.1. Imagen 1 — `INTRO_01_ASIGNACION_POR_DESCARTE`

### Descripción visual

Una mesa cotidiana con papeles de inscripción, una mochila nueva, útiles escolares, un bolígrafo, una computadora o celular mostrando la asignación escolar.

En la pantalla o en un papel se lee, agregado luego en engine o composición final:

> Escuela asignada: Escuela Técnica Roxana

La escena debe sentirse realista, administrativa y un poco frustrante. No hay épica. Es una familia o estudiante resolviendo un trámite escolar.

### Sensación buscada

- Resignación.
- Inicio cotidiano.
- Algo que “tocó”, no algo elegido.

### Texto en pantalla

```text
No fue su primera opción.

Tampoco la segunda.

La Escuela Roxana apareció al final de la lista,
cuando ya no quedaban muchas puertas abiertas.
```

---

## 5.2. Imagen 2 — `INTRO_02_ROXANA_AÑOS_ATRAS`

### Descripción visual

La Escuela Roxana en su época de esplendor. El Hall aparece lleno de estudiantes, docentes y movimiento. Hay talleres activos, mesas con circuitos, herramientas, lámparas, cuadernos, mapas, pizarrones, maquetas, máquinas pequeñas, motores y planos técnicos.

No debe parecer una academia mágica genérica. Debe parecer una escuela técnica antigua, viva, prestigiosa, llena de curiosidad y trabajo práctico.

Puede insinuarse la presencia de Roxana mediante un mural, una foto, una figura docente o una placa, pero no es necesario destacarla como personaje todavía.

### Sensación buscada

- Vida.
- Prestigio.
- Calidez.
- Curiosidad.
- Aprendizaje práctico.

### Texto en pantalla

```text
Años atrás, la Roxana era distinta.

Sus pasillos estaban llenos.
Sus talleres hacían ruido.
Sus aulas abrían mundos.

Se decía que ahí no te enseñaban a repetir.
Te enseñaban a mirar.
```

---

## 5.3. Imagen 3 — `INTRO_03_LA_LEYENDA_DE_LA_BITACORA`

### Descripción visual

Una composición de recortes viejos, fotos amarillentas, una cartelera escolar, una vitrina con trofeos oxidados, papeles de archivo, planos del viejo programa educativo y referencias parciales a la Bitácora.

La Bitácora no debe mostrarse claramente. Puede aparecer como:

- Un dibujo borroso en un recorte.
- Una silueta de libro en una foto vieja.
- Una frase incompleta en una nota.
- Una mención en un documento escolar.

Posibles frases visibles, si luego se agregan manualmente:

- “La Bitácora de Roxana”
- “Proyecto de Mundos Aplicados”
- “Archivo perdido”
- “Solo registra a quienes preguntan”
- “Mito escolar”

### Sensación buscada

- Leyenda escolar.
- Archivo olvidado.
- Algo antiguo y no del todo creíble.
- Misterio todavía no comprobado.

### Texto en pantalla

```text
También había historias.

Sobre una directora que llenó la escuela de preguntas.
Sobre aulas que no eran solo aulas.
Sobre una bitácora que nadie pudo encontrar.

Con los años, todo eso quedó como una leyenda vieja.
Algo que los ingresantes escuchaban una vez…
y olvidaban rápido.
```

---

## 5.4. Imagen 4 — `INTRO_04_ESCUELA_ACTUAL_APAGADA`

### Descripción visual

La Escuela Roxana en el presente. Fachada antigua, portón abierto, patio vacío, ventanas oscuras, carteles gastados, hojas acumuladas, luces apagadas o titilando.

La imagen puede terminar insinuando el interior del Hall: bancos vacíos, estatua central, puertas cerradas, polvo, escaleras y una luz mínima.

Esta debe ser la última imagen antes de que el jugador aparezca en gameplay.

### Sensación buscada

- Escuela casi vacía.
- Institución que sigue abierta, pero perdió centralidad.
- Silencio.
- Abandono no destructivo.
- Expectativa.

### Texto en pantalla

```text
Pero ahora la escuela estaba casi vacía.

Los chicos ya no la elegían.
Las familias preguntaban por otras.
Los pasillos dejaron de sonar.

Y ese año, por descarte, le tocó entrar.

Primer día.
```

---

# 6. Texto completo de la cinemática

```text
No fue su primera opción.

Tampoco la segunda.

La Escuela Roxana apareció al final de la lista,
cuando ya no quedaban muchas puertas abiertas.

Años atrás, la Roxana era distinta.

Sus pasillos estaban llenos.
Sus talleres hacían ruido.
Sus aulas abrían mundos.

Se decía que ahí no te enseñaban a repetir.
Te enseñaban a mirar.

También había historias.

Sobre una directora que llenó la escuela de preguntas.
Sobre aulas que no eran solo aulas.
Sobre una bitácora que nadie pudo encontrar.

Con los años, todo eso quedó como una leyenda vieja.
Algo que los ingresantes escuchaban una vez…
y olvidaban rápido.

Pero ahora la escuela estaba casi vacía.

Los chicos ya no la elegían.
Las familias preguntaban por otras.
Los pasillos dejaron de sonar.

Y ese año, por descarte, le tocó entrar.

Primer día.
```

---

# 7. Mapa inicial: Hall de la Escuela Roxana

## 7.1. ID sugerido

`MAP_SCHOOL_HALL_FIRST_DAY`

## 7.2. Descripción general

El jugador aparece en la entrada del Hall Principal de la Escuela Roxana. Es su primer día. La escuela está abierta, pero casi vacía.

El Hall debe ser grande, antiguo y demasiado silencioso para una escuela en funcionamiento. No está destruido. No es una ruina. Todavía hay señales de actividad institucional mínima: carteles, papeles, preceptoría, luces, bancos, alguna cartelera y algunos estudiantes aislados.

Debe sentirse como una institución que sigue funcionando por inercia.

## 7.3. Elementos visuales principales

- Entrada principal en la parte inferior del mapa.
- Hall amplio con piso antiguo.
- Estatua central de Roxana.
- Escalera central hacia Dirección.
- Preceptoría cerca del Hall.
- Cartelera de ingresantes.
- Puertas a aulas o pasillos.
- Puerta o pasillo hacia Taller de Electrónica.
- Puertas cerradas hacia Matemática, Física y Programación.
- Bancos viejos.
- Vitrinas con fotos/trofeos/proyectos antiguos.
- Luces apagadas o titilando.
- Polvo sutil.
- Murales técnicos deteriorados.

## 7.4. Estado del Hall al inicio

- La escuela parece activa administrativamente, pero no socialmente.
- No hay bullicio.
- Hay pocos personajes.
- Algunas puertas están cerradas.
- La Dirección parece accesible.
- El Taller de Electrónica no es el objetivo inicial todavía.

---

# 8. Inicio jugable

## 8.1. Aparición del jugador

El jugador aparece en la entrada inferior del Hall.

### Texto narrativo inicial

```text
El hall era más grande de lo que parecía desde afuera.

También estaba más vacío.
```

### Pensamiento del jugador

```text
Bueno… supongo que es acá.

¿Dónde se supone que me presento?
```

### Objetivo inicial

```text
Objetivo: Busca a alguien de la escuela.
```

---

# 9. Exploración inicial del Hall

Antes de hablar con el preceptor, el jugador puede inspeccionar algunos elementos.

---

## 9.1. Entrada principal

```text
La puerta quedó abierta detrás de ti.

Por alguna razón, eso no tranquiliza demasiado.
```

---

## 9.2. Cartelera de ingresantes

```text
Cartelera de ingresantes.

La mayoría de las hojas son viejas.

Una lista nueva tiene tu nombre escrito a mano.

Al lado, alguien dibujó una flecha hacia Preceptoría.
```

---

## 9.3. Banco del Hall

```text
El banco está marcado con nombres, fechas y frases viejas.

Una dice:

“Si la escuela te responde, no le creas a la primera.”
```

---

## 9.4. Estatua de Roxana

La estatua todavía no habla ni se activa.

```text
La estatua ocupa el centro del Hall.

La placa dice:

“Roxana”
“Directora fundadora del Programa de Mundos Aplicados.”

El resto de la placa está demasiado gastado para leerse.

Alguien dejó una flor seca en la base.
```

---

## 9.5. Vitrina antigua

```text
La vitrina está llena de fotos viejas, trofeos y objetos técnicos.

En casi todas las fotos, la escuela parece imposible de reconocer:
aulas llenas, talleres abiertos, estudiantes sonriendo frente a máquinas extrañas.

Una foto tiene una nota escrita al dorso:

“Roxana y la primera Bitácora.”

La foto está demasiado gastada para ver el objeto con claridad.
```

---

## 9.6. Puerta de Electrónica

Todavía no es el objetivo principal.

```text
Taller de Electrónica.

El cartel está torcido.

Del otro lado no se escucha nada.

Aunque por un segundo creíste oír un zumbido.
```

---

## 9.7. Puerta de Matemática

```text
Aula de Matemática.

La puerta está cerrada.

En el vidrio hay figuras geométricas dibujadas con marcador viejo.
```

---

## 9.8. Laboratorio de Física

```text
Laboratorio de Física.

Hay una nota pegada:

“Material inventariado. No ingresar sin docente.”

La nota parece tener años.
```

---

## 9.9. Sala de Programación

```text
Sala de Computación.

El cartel fue cambiado varias veces:
“Informática”, “Computación”, “Programación”.

El último papel está escrito a mano.
```

---

# 10. Encuentro con el preceptor

## 10.1. ID sugerido

`NPC_PRECEPTOR`

## 10.2. Ubicación

Preceptoría o escritorio cercano al Hall.

## 10.3. Descripción del personaje

El preceptor es el único adulto visible al inicio. Mantiene la escuela funcionando con carpetas, llaves, papeles y cierta resignación. No es hostil. Tampoco parece sorprendido por lo extraño. Tiene un humor seco y habla como alguien que ya vio demasiadas cosas raras en esa escuela.

El preceptor no tiene nombre propio: en pantalla y en diálogos es siempre **“el preceptor”**. Decisión deliberada — refuerza la escuela despersonalizada y evita anclar el texto a una región.

---

## 10.4. Primera conversación

```text
Jugador:
Hola… vengo por el ingreso a primer año.

Preceptor:
¿Nombre?

Jugador:
[Nombre del jugador]

Preceptor:
A ver…
Primer año… ingresante nuevo…

Sí. Acá estás.

Llegaste temprano.

Jugador:
¿Temprano?

Preceptor:
No.
Bueno… sí.

En esta escuela esas dos cosas suelen ser parecidas.
```

---

## 10.5. Indicación hacia Dirección

```text
Preceptor:
Como eres nuevo, primero tienes que pasar por Dirección.

Jugador:
¿Dirección?

Preceptor:
Subiendo la escalera central. Puerta grande. No tiene pérdida.

O no debería.

Jugador:
¿Tengo que hablar con la directora?

Preceptor:
Si alguien te contesta, avísame.

Jugador:
¿Cómo?

Preceptor:
Nada. Cosas de la escuela.

Anda. Después vuelves y te digo a qué aula tienes que ir.
```

### Objetivo actualizado

```text
Objetivo actualizado: Ir a Dirección.
```

---

# 11. Camino hacia Dirección

## 11.1. Transición sugerida

El jugador sube por la escalera central del Hall.

### Texto ambiental durante la subida

```text
La escalera cruje con cada paso.

En las paredes hay retratos de promociones antiguas.

En las fotos, la escuela parece más llena que cualquier escuela que hayas visto.
```

---

# 12. Mapa: Despacho de Dirección

## 12.1. ID sugerido

`MAP_ROXANA_OFFICE_FIRST_VISIT`

## 12.2. Descripción general

El despacho de Dirección está abierto, pero vacío. No hay directora. El lugar parece detenido en el tiempo.

Debe sentirse como una mezcla entre:

- Dirección escolar.
- Biblioteca personal.
- Archivo técnico.
- Despacho de una fundadora.
- Santuario institucional abandonado.

No debe parecer una oficina moderna ni una habitación mágica. Lo raro aparece por detalles: notas, mapas, objetos, polvo que parece moverse, luces que titilan, libros demasiado conservados.

## 12.3. Elementos visuales principales

- Escritorio grande de madera.
- Sillón vacío detrás del escritorio.
- Cajones cerrados o entreabiertos.
- Estantes con libros y carpetas.
- Mapas de la escuela y de los mundos aplicados.
- Vitrinas con prototipos técnicos.
- Fotos antiguas.
- Lámpara que titila.
- Ventanas altas.
- Polvo acumulado.
- Planos enrollados.
- Notas antiguas.
- Un cajón donde se encuentra la Bitácora.

---

# 13. Ingreso al despacho

### Texto narrativo

```text
La puerta de Dirección estaba abierta.

Adentro no había nadie.
```

### Pensamiento del jugador

```text
¿Hola?

Me mandó el preceptor.
```

Silencio.

```text
Buenísimo.
```

### Objetivo

```text
Objetivo: Revisa el despacho.
```

---

# 14. Interacciones del despacho

---

## 14.1. Escritorio de Roxana

```text
El escritorio está cubierto de papeles, pero ninguno parece reciente.

Hay una lista de cursos, varios nombres tachados y una nota escrita con tinta azul:

“No cerrar los mundos. Solo dejarlos dormir.”
```

---

## 14.2. Sillón vacío

```text
El sillón detrás del escritorio está vacío.

Por cómo está acomodado, parece que alguien se hubiera levantado hace un minuto.

O hace muchos años.
```

---

## 14.3. Mapa antiguo

```text
Un mapa enorme ocupa casi toda la pared.

En el centro está dibujada la escuela.

Alrededor, cuatro regiones aparecen conectadas por líneas finas:

Matemática.
Física.
Electrónica.
Programación.

Algunas líneas están cortadas.
```

---

## 14.4. Foto antigua

```text
En la foto, Roxana aparece rodeada de estudiantes.

Todos sostienen cuadernos parecidos, pero uno de ellos lleva un libro distinto.

La imagen está borrosa justo donde debería verse la tapa.
```

---

## 14.5. Nota vieja

```text
“La Bitácora no enseña. Ordena el camino.”

“No reemplaza al aula. Recuerda lo que el aula despierta.”
```

---

## 14.6. Vitrina del Programa de Mundos Aplicados

```text
La vitrina guarda objetos pequeños: piezas de metal, circuitos, brújulas, lentes, engranajes y cuadernos cerrados.

Una placa oxidada menciona el Programa de Mundos Aplicados.

Hay un espacio vacío en el centro, como si faltara la pieza principal.
```

---

# 15. Encuentro con la Bitácora

## 15.1. Condición sugerida

La Bitácora puede encontrarse después de inspeccionar al menos dos elementos clave del despacho, por ejemplo:

- El mapa antiguo.
- La nota vieja.
- El escritorio.

Esto permite que el jugador entienda mínimamente el contexto antes de obtener el objeto.

## 15.2. Ubicación

Un cajón entreabierto del escritorio de Dirección.

---

## 15.3. Interacción con el cajón

```text
Hay un cajón entreabierto en el escritorio.

Adentro hay un libro viejo, demasiado bien conservado para el estado del despacho.

No tiene título.

Pero cuando acercás la mano, aparece una palabra en la tapa:

Bitácora.
```

---

## 15.4. Obtención

```text
Obtuviste: Bitácora.

El libro pesa menos de lo que debería.

Las páginas están vacías.

Hasta que una de ellas empieza a escribirse sola.
```

---

# 16. Primera activación de la Bitácora

La Bitácora no debe actuar como un personaje hablador en este momento. Debe funcionar como un sistema antiguo de registro escolar. Es rara, pero no explica demasiado.

## 16.1. Primera pantalla

```text
BITÁCORA ESCOLAR

Estudiante: [Nombre del jugador]
Año: 1.º
Estado de inscripción: incompleto
Escuela asignada: Roxana
Tutor institucional: no registrado
Dirección: sin respuesta
```

Luego aparece una línea nueva:

```text
Cursos detectados:

- Matemática: sin iniciar
- Física: sin iniciar
- Electrónica: sin iniciar
- Programación: sin iniciar
```

Después:

```text
Registro inicial creado.

Estudiante vinculado.

Inscripción pendiente de confirmación.

Vuelve a Preceptoría.
```

### Objetivo actualizado

```text
Objetivo actualizado: Volver con el preceptor.
```

---

# 17. La Bitácora como menú del juego

A partir de este momento, la Bitácora funciona como menú diegético. No es solo un objeto narrativo; también ordena el progreso del jugador.

## 17.1. Secciones iniciales

### Cursos

Lista de áreas principales:

- Matemática
- Física
- Electrónica
- Programación

Cada curso podrá tener:

- Estado.
- Capítulos.
- Conceptos descubiertos.
- Actividades completadas.
- Evaluaciones opcionales.
- Mundo asociado.

### Objetivos

Muestra el objetivo actual y objetivos recientes.

Ejemplo inicial:

```text
Objetivo actual:
Volver con el preceptor.
```

### Registro

Diario de eventos importantes.

Primera entrada:

```text
Primer día en la Escuela Roxana.
El preceptor me mandó a Dirección, pero no había nadie.
Encontré un libro viejo en el despacho.
Escribió mi nombre solo.
```

### Mapa escolar

Inicialmente incompleto.

Zonas detectadas:

- Hall
- Preceptoría
- Dirección
- Taller de Electrónica

Zonas bloqueadas o no registradas:

- Biblioteca
- Laboratorio de Física
- Aula de Matemática
- Sala de Programación

### Archivo de la escuela

Bloqueado al inicio.

```text
Archivo no disponible.
Se requiere restaurar acceso.
```

---

# 18. Regreso al Hall

El jugador baja de Dirección con la Bitácora.

## 18.1. Reacción ambiental opcional

Al volver al Hall, puede haber una leve alteración visual:

- La luz de la escalera titila.
- La estatua parece recibir una sombra distinta.
- La puerta de Electrónica emite un zumbido apenas perceptible.

No debe ser demasiado obvio.

---

# 19. Segunda conversación con el preceptor

## 19.1. Diálogo

```text
Preceptor:
¿Y?

Jugador:
No había nadie.

Preceptor:
Bien.

Digo… normal.
```

El preceptor mira al jugador.

```text
Preceptor:
¿Qué tienes ahí?

Jugador:
Un libro. Estaba en Dirección.

Preceptor:
¿En Dirección?

Jugador:
Sí.

Preceptor:
¿En el escritorio?

Jugador:
En un cajón.
```

Pausa.

```text
Preceptor:
Ah.

Jugador:
¿Pasa algo?

Preceptor:
No.

Bueno, sí.

Pero no hoy.
```

---

## 19.2. La Bitácora como registro escolar

```text
Preceptor:
A ver… si la Bitácora te registró, entonces ya no tengo que anotarte a mano.

Jugador:
¿Cómo que me registró?

Preceptor:
Cosas viejas de la escuela.

Tu primer bloque es Taller de Electrónica.

Jugador:
¿Ahora?

Preceptor:
Ahora.

Y llévate eso.
```

El preceptor mira la Bitácora.

```text
Preceptor:
Si te pregunta algo… no le respondas cualquier cosa.
```

### Objetivo actualizado

```text
Objetivo actualizado: Ir al Taller de Electrónica.
```

---

# 20. Reacciones de estudiantes ante la Bitácora

Aunque la escuela esté casi vacía, conviene que haya pocos estudiantes en el Hall o pasillos. Su función es mostrar que la Bitácora no es un objeto normal.

---

## 20.1. Estudiante curioso

```text
Estudiante:
¿Ese libro estaba en Dirección?

Jugador:
Sí. ¿Por?

Estudiante:
Nada.

Es que nadie entra ahí.
```

---

## 20.2. Estudiante incómodo

```text
Estudiante:
¿De dónde sacaste eso?

Jugador:
Del despacho.

Estudiante:
¿Y te lo dejaron sacar?

Jugador:
No había nadie.

Estudiante:
Claro.

Ese es el problema.
```

---

## 20.3. Estudiante burlón

```text
Estudiante:
Uh, mira. El nuevo ya encontró una reliquia.

Cuidado. A lo mejor te empieza a dar tarea.
```

Si el jugador vuelve a hablarle:

```text
Estudiante:
Igual, en serio… ese libro es raro.
```

---

# 21. Camino al Taller de Electrónica

## 21.1. Texto ambiental

Al acercarse al pasillo o puerta de Electrónica:

```text
La luz del pasillo falla.

Pero cada vez que se apaga,
algo detrás de la puerta parece responder.
```

## 21.2. Interacción con la puerta

```text
Taller de Electrónica.

La primera clase del día.

O lo que sea que esta escuela entienda por clase.
```

### Opción de interacción

```text
Entrar
```

---

# 22. Cierre del prólogo

Al entrar al Taller de Electrónica, el prólogo termina.

## 22.1. Transición sugerida

Primero parece que el jugador entra a un aula común.

Pantalla negra.

Se escucha un zumbido eléctrico bajo.

Luego aparece texto:

```text
No era un aula común.
```

Después:

```text
Capítulo 1
El taller apagado
```

O, si se quiere introducir Ohmdal de inmediato:

```text
Capítulo 1
Ohmdal: la ciudad sin corriente
```

## 22.2. Recomendación

Conviene usar:

```text
Capítulo 1
El taller apagado
```

Y revelar Ohmdal unos minutos después, dentro del aula. Esto mantiene la progresión desde lo real hacia lo extraño.

---

# 23. Flujo resumido de objetivos

```text
1. Busca a alguien de la escuela.
2. Hablá con el preceptor.
3. Ir a Dirección.
4. Revisa el despacho.
5. Toma la Bitácora.
6. Volver con el preceptor.
7. Ir al Taller de Electrónica.
8. Entrar al taller.
```

---

# 24. Flujo resumido de escenas

```text
INTRO_01_ASIGNACION_POR_DESCARTE
INTRO_02_ROXANA_AÑOS_ATRAS
INTRO_03_LA_LEYENDA_DE_LA_BITACORA
INTRO_04_ESCUELA_ACTUAL_APAGADA
MAP_SCHOOL_HALL_FIRST_DAY
NPC_PRECEPTOR
MAP_ROXANA_OFFICE_FIRST_VISIT
BITACORA_FIRST_OPEN
MAP_SCHOOL_HALL_AFTER_BITACORA
MAP_ELECTRONICS_WORKSHOP_ENTRY
```

---

# 25. Notas de diseño importantes

## 25.1. La escuela primero debe ser escuela

El prólogo debe evitar empezar con demasiada fantasía. La Roxana debe sentirse primero como una secundaria real, vieja y poco elegida.

La rareza aparece por acumulación:

- Un preceptor que habla como si Dirección no debiera responder.
- Una directora ausente.
- Un despacho detenido en el tiempo.
- Un libro que escribe solo.
- Estudiantes que reaccionan raro.
- Una puerta de Electrónica que parece emitir un zumbido.

## 25.2. La Bitácora no debe explicar todo

La Bitácora funciona como menú, registro y guía, pero no debe contar todo el lore. Su función inicial es ordenar la experiencia.

Debe sentirse como:

> Un sistema escolar antiguo que todavía reconoce estudiantes, cursos y objetivos.

No como:

> Un tutorial mágico que te dice exactamente qué hacer y por qué.

## 25.3. El preceptor sabe más de lo que dice

El preceptor no debe explicar el misterio, pero sí debe actuar como alguien que reconoce señales antiguas de la escuela. Su reacción ante la Bitácora debe dejar claro que el libro no debería haber aparecido de forma normal.

## 25.4. Los estudiantes refuerzan el misterio

Los pocos estudiantes presentes deben cumplir una función narrativa:

- Mostrar que la escuela no está totalmente muerta.
- Reforzar que la Bitácora es rara.
- Introducir rumores sin exposición larga.

## 25.5. Electrónica debe ser un destino escolar antes que fantástico

El jugador va a Electrónica porque es su primer bloque de clase, no porque un portal lo llama directamente.

La transición a Ohmdal debe surgir después, dentro del aula/taller.

---

# 26. Assets narrativos necesarios para el prólogo

## 26.1. Cinemática

- Imagen de asignación escolar por descarte.
- Imagen de la escuela llena años atrás.
- Imagen de recortes sobre la leyenda de la Bitácora.
- Imagen de la escuela actual vacía y apagada.

## 26.2. Hall

- Piso modular.
- Paredes modulares.
- Puertas y marcos.
- Estatua de Roxana.
- Escalera central.
- Alfombra vieja.
- Preceptoría.
- Carteleras.
- Vitrinas.
- Bancos.
- Luces apagadas/titilantes.
- Puerta de Electrónica.

## 26.3. Dirección

- Despacho de Roxana.
- Escritorio.
- Sillón vacío.
- Cajón entreabierto.
- Mapa de mundos aplicados.
- Fotos antiguas.
- Vitrina con objetos técnicos.
- Notas antiguas.
- Bitácora cerrada.
- Bitácora abierta.

## 26.4. Personajes

- Jugador/a ingresante.
- Preceptor.
- 2 o 3 estudiantes secundarios.

---

# 27. Pendientes de definición

- Registro de español del texto (voseo rioplatense vs. neutro latinoamericano) — decisión pendiente que afecta todo el juego.
- Edad exacta del jugador.
- Si el jugador tendrá nombre fijo o configurable.
- Si la Bitácora tendrá voz textual propia o solo mensajes de sistema.
- Si Roxana hablará en el prólogo o recién más adelante.
- Nombre final del Capítulo 1.
- Momento exacto en que se revela el nombre Ohmdal.

---

# 28. Notas de revisión v0.2 (contra diseño general y slice implementado)

## 28.1. Riesgo de duración

La síntesis de diseño fija **prólogo 5–8 min máx.** Este guion, con cinemática + ida a Dirección + vuelta al preceptor + estudiantes, probablemente dé 10–12 min. La vuelta al preceptor **se queda** (su reacción a la Bitácora es el mejor beat del prólogo y la asignación del curso necesita ese cierre), pero para cuidar el ritmo:

- Los tres estudiantes (§20) son estrictamente opcionales: nunca bloquean el camino, y como mucho uno está entre el Hall y Electrónica.
- La exploración del despacho exige solo 2 elementos antes de habilitar el cajón (ya está así en §15.1) — no subir ese número.
- La cinemática debe poder saltarse (tap/tecla) desde la primera imagen.
- Medir la duración real en playtest; si excede ~9 min, el primer recorte es acortar diálogo del preceptor, no las interacciones opcionales (son las que dan personalidad).

## 28.2. Regla de la Bitácora: precisar la distinción

La regla inviolable es "la Bitácora nunca anticipa **conocimiento** no vivido". La primera activación (§16) lista cursos y zonas no visitadas: no la viola, porque es **registro administrativo escolar** — la Bitácora es un sistema de la escuela y sabe de la escuela. La distinción que hay que sostener: *puede saber de la institución; nunca del contenido conceptual que el jugador no experimentó*. Las secciones "Conceptos descubiertos" y entradas de Registro siguen siendo estrictamente post-vivencia.

## 28.3. Nomenclatura a unificar: "Taller" vs "Aula" de Electrónica

Este doc usa **Taller de Electrónica**; el guion de la Unidad 1 (`unidad-1-ohmdal.md`, NIVEL 0) y el juego implementado usan **Aula de Electrónica**. Propuesta: canonizar **Taller** (es escuela técnica; "taller" suena a manos en la mesa, que es el tema del juego) y ajustar guion U1 + textos del juego cuando se toque esa escena.

## 28.4. Delta contra el slice implementado

El greybox actual implementa una versión comprimida: hall → preceptor → despacho → Bitácora → aula (sin cinemática, sin vuelta al preceptor, sin estudiantes, y la Bitácora es solo entradas, no menú con cursos/objetivos/mapa). Este guion es la **spec objetivo**; el delta a implementar:

1. Cinemática de 4 imágenes (`INTRO_01`–`INTRO_04`) con skip.
2. Vuelta al preceptor + diálogo de la Bitácora + asignación de curso.
3. 2–3 estudiantes opcionales en el Hall.
4. Bitácora como menú diegético (cursos, objetivos, mapa escolar, archivo bloqueado) — coordinar con la mejora visual/contenido de la Bitácora ya identificada como oportunidad.
5. Interacciones ambientales nuevas del Hall y el despacho (§9, §14).

## 28.5. Canon nuevo que este doc establece

- **Roxana** (sin apellido — el resto de la placa está gastado), directora fundadora del **Programa de Mundos Aplicados** (placa de la estatua, §9.4).
- Cuatro mundos/cursos: **Matemática, Física, Electrónica, Programación** (mapa del despacho, §14.3). La síntesis de diseño ya quedó alineada a esto.
- El **preceptor** queda sin nombre propio (decisión deliberada, ver §10.3).
- La Bitácora como leyenda escolar previa al jugador ("Solo registra a quienes preguntan").

---

# 29. Versión corta de referencia

El jugador empieza la secundaria en la Escuela Roxana, una institución antigua que le fue asignada por descarte. La escuela, alguna vez prestigiosa y llena de talleres vivos, hoy está casi vacía. Al llegar, el único preceptor le indica que debe pasar por Dirección y agrega una frase inquietante: “Si alguien te contesta, avísame”.

En el despacho de Dirección no hay nadie. Al explorar, el jugador encuentra una Bitácora antigua que se registra con su nombre y funciona como menú escolar: cursos, objetivos, mapa, registros y progreso. Al volver, el preceptor reacciona con incomodidad, pero lo envía a su primer bloque: Taller de Electrónica.

Otros estudiantes notan el libro y reaccionan de forma extraña. El jugador se dirige al taller, donde termina el prólogo y comienza el primer capítulo.

