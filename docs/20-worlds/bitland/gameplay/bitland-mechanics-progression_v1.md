---
status: PROPOSED
authority_level: 3
version: v1
last_ratified: 2026-08-14
supersedes:
  - _reference_gdd_reboot_v1/03_BITLAND_GDD_v0.1.md (sección 11 — Arcos propuestos)
depends_on:
  - ../../00-governance/ROXANA_GAME_DESIGN_PILLARS_v1.md
  - ../../00-governance/ROXANA_CANON_POLICY_v1.md
  - ../../00-governance/ROXANA_DESIGN_LANGUAGE_v1.md
  - ../vision/bitland-vision_v1.md
  - ../vision/bitland-world-metaphor_v1.md
  - ./bitland-programming-language-gameplay_v1.md
  - ./bitland-automation-system_v1.md
  - ./bitland-puzzle-grammar_v1.md
open_questions:
  - BL-MP-Q1 — ¿Cuántas "lecciones" tiene cada arco? Esto define el ritmo de aparición de cada Etapa.
  - BL-MP-Q2 — ¿El cambio entre arcos es por lugar (cada arco = un barrio) o por concepto (varios barrios exploran el mismo concepto)?
  - BL-MP-Q3 — ¿Los arcos se viven linealmente o el jugador puede regresar a un barrio a "repararlo" antes de seguir?
  - BL-MP-Q4 — ¿Qué pasa con la Etapa 8 (arquitectura) en una primera campaña: arco final o transversal?
  - BL-MP-Q5 — ¿La maestría (B12 + capa de optimización) vive al final del último arco o como capa transversal disponible desde el primero?
---

# BITLAND — MECHANICS PROGRESSION · v1

> Documento de autoridad nivel 3. Biblia de mundo y sistemas. Define cómo
> las mecánicas de Bitland **crecen a lo largo de la campaña**: qué se
> introduce, cuándo, cómo se conecta con las 8 etapas del lenguaje y con
> las 12 familias de puzzle, y cómo se sale de cada arco.
>
> No cuenta la historia. El *qué* se vive en cada arco vive en
> `bitland-arc-01_v1.md` (Arco I) y en futuros documentos de arco.

---

## 1. Tesis de progresión

> La progresión de Bitland no es una lista de conceptos. Es la historia
> jugable de **cómo se pasa de "dar instrucciones" a "construir
> comportamiento"**.
>
> Cada arco debe cerrar un ciclo pedagógico completo: el jugador
> experimenta el concepto, lo formaliza mínimamente, lo aplica a un
> sistema real y obtiene una **transformación del mundo** observable
> (P08).

### Cuatro reglas inviolables

1. **Concepto antes que formalización.** El jugador puede jugar todo
   un arco sin ver pseudocódigo. La Bitácora muestra la formalización
   cuando ya tiene evidencia (P02, P06).
2. **Un arco introduce un concepto, no cinco.** Si un arco parece
   contener varios, se subdivide.
3. **El cierre del arco es sistémico, no narrativo.** Un arco no
   termina con un diálogo; termina con un barrio, una calle, un
   servicio que cambia su comportamiento.
4. **La maestría es opcional, la comprensión no** (P13). Las
   optimizaciones viven en retos accesibles, no obligatorios.

---

## 2. Mapa arco → etapas → familias

| Arco | Concepto nuclear | Etapas del lenguaje | Familias dominantes | Familias de transferencia |
|---|---|---|---|---|
| **I — Instrucciones** | Secuenciar, decidir, iterar | 1, 2, 3 | B1, B3, B4 | B2 (introducción), B7 (introducción) |
| **II — Estado** | Recordar, persistir, decidir con memoria | 4 | B5 | B2, B3, B7 |
| **III — Abstracción** | Nombrar, reutilizar, generalizar | 5 | B6 | B1–B5, B7 |
| **IV — Muchos a la vez** | Coordinar, comunicar, sincronizar | 6, 7 | B9, B10 | B7, B8, B11 (introducción) |
| **V — Ciudad conectada** | Contratos, servicios, fallos | 8 | B11, B12 (intro) | B1–B10 |
| (Capa transversal) | Optimización | — | B12 | Todas |

### Lectura del mapa

- **Arco I** no se queda en B1: introduce B2 y B7 como preparación.
- **Arco II** puede jugarse con B5; el resto entra como transferencia.
- **Arco III** es el primero donde la *reutilización* se vuelve
  sistémica.
- **Arco IV** es el primero donde el jugador programa **varios
  agentes a la vez**.
- **Arco V** es el primero donde la *ciudad entera* responde a una
  decisión.
- La capa de **optimización (B12)** es transversal: cada arco tiene
  un reto opcional de optimización con su propia métrica.

---

## 3. Arco I — Instrucciones

### Concepto

Pasar de *moverne* por la ciudad a *dar instrucciones* a un agente y
luego a *programar su comportamiento*. El jugador descubre que el
orden importa, que la condición bifurca, que repetir manualmente es
absurdo.

### Lo que se vuelve jugable

- Tarjetas físicas para un agente.
- IF con sensor simple.
- REPEAT y WHILE incipiente.
- Step / pause / rewind del agente.

### Lo que se gana (transformación del mundo)

- Un barrio detenido reanuda la entrega de paquetes.
- Una calle que cambiaba de dirección se vuelve transitable siempre.
- Una rutina de cien pasos se vuelve un loop.

### Familias de puzzle

- **Principal:** B1 (Secuencia), B3 (Condición), B4 (Repetición).
- **Transferencia:** B2 (introducción: "tu programa sólo sirvió para
  uno de tres casos"), B7 (introducción: "algo no anda, ¿qué pasó?").

### Forma de cierre

- El barrio del Arco I vuelve a operar con un servicio mínimo en
  marcha.
- La Bitácora formaliza Secuencia, Condición y Repetición.
- Aparece un *gancho*: el reloj de distrito no coincide con el central.

### Salida del arco

El jugador ha visto ejecutar un programa propio y entiende que
*funcionar* no es lo mismo que *servir al propósito*.

---

## 4. Arco II — Estado

### Concepto

Recordar. El agente que sólo ejecuta no aprende; el agente con
memoria puede decidir con información que no está en su sensor
actual.

### Lo que se vuelve jugable

- Cajas de variable (contador, booleano, etiqueta, cola corta).
- `LET`, `INCR`, `READ`.
- Condición sobre variable interna.
- WHILE robusto: el contador como condición de salida.

### Lo que se gana (transformación del mundo)

- Un servicio que rechazaba todo ahora abre cuando corresponde.
- Un agente que se perdía ahora sabe cuántos paquetes lleva.
- Una cola que se desbordaba ahora respeta un tope.

### Familias de puzzle

- **Principal:** B5 (Memoria).
- **Transferencia:** B2 (la memoria permite generalizar sin condicional
  externo), B3 (condición sobre estado), B7 (bug de inicialización).

### Forma de cierre

- Una máquina de estado visible: el agente pasa por modos
  (`esperando`, `cargando`, `entregando`, `descansando`) y el jugador
  los lee.
- La Bitácora formaliza Variable, Contador, Booleano, Estado.

### Salida del arco

El jugador entiende que *un sistema sin estado es un sistema que
repite el primer error para siempre*.

---

## 5. Arco III — Abstracción

### Concepto

Nombrar un comportamiento. Pasamos de "tengo tres repartidores con
programas largos parecidos" a "tengo un servicio que se llama
*entregar_a* y lo invocan todos".

### Lo que se vuelve jugable

- Pliego de subrutina.
- Parámetros cableados.
- CALL desde varios sitios.
- Inspección de pila de llamadas.
- DRY visible: la duplicación se ve como ocupación de panel.

### Lo que se gana (transformación del mundo)

- Tres repartidores con un solo programa compartido.
- Una subrutina de "verificar paquete" reusada por varios porteros.
- Una función de "formatear destino" que reduce un servicio de
  enrutamiento.

### Familias de puzzle

- **Principal:** B6 (Abstracción).
- **Transferencia:** B1–B5, B7 (bugs en funciones), B8 (automatizar
  vía abstracción).

### Forma de cierre

- Una subrutina del jugador queda instalada en un barrio como
  servicio compartido.
- La Bitácora formaliza Función, Parámetro, Reutilización.

### Salida del arco

El jugador entiende que *lo que se nombra se vuelve reusable* y que
*generalizar es encontrar el nombre correcto*.

---

## 6. Arco IV — Muchos a la vez

### Concepto

El clock es compartido. Lo que hace un agente afecta a otro. La
ciudad empieza a funcionar como ciudad.

### Lo que se vuelve jugable

- Programar varios agentes en paralelo.
- Barra de clock global.
- SPAWN, JOIN.
- LOCK / UNLOCK sobre recursos (puentes, mostradores, calles).
- SEND / ON sobre buzones.
- WAIT_FOR.

### Lo que se gana (transformación del mundo)

- Un puente angosto que antes generaba atasco ahora coordina.
- Tres repartidores que se peleaban por un mostrador ahora se
  turnan.
- Un servicio de despacho que no sabía cuándo enviar ahora escucha
  el buzón.

### Familias de puzzle

- **Principal:** B9 (Concurrencia), B10 (Sincronización).
- **Transferencia:** B7 (race conditions, deadlocks), B8
  (automatización de orquestación), B11 (introducción al enrutamiento
  bajo carga).

### Forma de cierre

- Un servicio de barrio publica un evento y tres agentes diferentes
  reaccionan.
- La Bitácora formaliza Concurrencia, Lock, Mensaje, Evento.

### Salida del arco

El jugador entiende que *varios procesos a la vez requieren reglas
explícitas para no romperse entre sí*.

---

## 7. Arco V — Ciudad conectada

### Concepto

El sistema ya no es un agente ni un servicio local. Es un **contrato
entre módulos**. La ciudad responde a una decisión de arquitectura.

### Lo que se vuelve jugable

- Panel de servicio con contrato (interfaz).
- Recursos compartidos (energía, memoria, ancho de banda).
- Permisos y control de acceso.
- Reescritura de automatizaciones heredadas.
- Tolerancia a fallos: el jugador diseña qué pasa cuando un
  servicio cae.

### Lo que se gana (transformación del mundo)

- Un servicio de despacho obsoleto se reemplaza por uno nuevo sin
  tirar el barrio.
- Un recurso compartido se reparte y dos servicios que peleaban
  conviven.
- Un fallo heredado se redirige a un fallback.
- El reloj de distrito se sincroniza con el central porque el
  jugador corrigió la automatización de tiempo.

### Familias de puzzle

- **Principal:** B11 (Routing), B12 (Optimización — introducción).
- **Transferencia:** todas las anteriores; la ciudad exige orquestar
  lo aprendido.

### Forma de cierre

- El jugador publica un servicio propio y otro barrio lo invoca.
- Una anomalía urbana de fondo se cierra: la ciudad se ve distinta
  al final.
- La Bitácora formaliza Servicio, Interfaz, Contrato, Recurso
  compartido.

### Salida del arco

El jugador entiende que *arquitectura es decidir qué puede fallar sin
que el resto se caiga*.

---

## 8. La capa transversal de optimización (B12)

Disponible desde el Arco I como reto opcional. No bloquea la
campaña. Características:

- Aparece como **reto al cierre de cada arco** y como **retos sueltos**
  entre arcos.
- El sistema expone la métrica objetivo de forma observable en el
  mundo (cola, energía, throughput, latencia, robustez).
- La métrica nunca se presenta como número "del 1 al 10"; se presenta
  como un *estado del mundo antes* y un *estado del mundo después*.
- Una solución correcta y subóptima es válida para la campaña; el
  reto de optimización premia mejorarla.

### Cómo se cierra un reto de optimización

- Mejora medible sin empeorar otras métricas.
- El sistema pregunta *por qué* mejoró (P04 — leer estado, no aplicar
  fórmula memorizada).

---

## 9. La capa transversal de debugging (B7)

Disponible desde el final del Arco I. Aparece cuando el jugador se
encuentra con una **automatización heredada** que no anda bien.

- La primera automatización heredada se introduce al final del
  Arco I como gancho narrativo.
- La densidad de B7 crece con cada arco: los sistemas heredados
  son más enredados.
- En el Arco V, el debugger es la principal herramienta del jugador
  para entender qué se rompió cuando algo cambió.

---

## 10. Ritmo intra-arco

Cada arco tiene tres tiempos:

1. **Introducción.** El jugador *ve* el concepto en acción sin tener
   que usarlo todavía. Un sistema del mundo lo muestra.
2. **Apropiación.** El jugador resuelve puzzles B-* donde el concepto
   es la herramienta principal.
3. **Cierre sistémico.** El jugador aplica el concepto a un sistema
   real del mundo y obtiene una transformación observable.

El **tiempo 1** nunca se salta: la primera vez que aparece un
concepto, el jugador lo ve ejecutar antes de tener que producirlo.
Esto protege P02 y P06.

---

## 11. Curva de dificultad agregada

| Arco | Dificultad dominante (de DL-§4) | Cómo se manifiesta |
|---|---|---|
| I | Cantidad de variables, distancia causa–efecto | Pasos entre acción y entrega, longitud de la cinta. |
| II | Cantidad de variables, anticipación | Más variables, condición sobre variable futura. |
| III | Anticipación, combinación de conceptos | Encontrar el nombre que generaliza. |
| IV | Simultaneidad, restricciones | Varios agentes, recursos limitados, deadlocks. |
| V | Combinación, información incompleta, optimización | Servicios cruzados, métricas, robustez. |

> La dificultad nunca proviene de opacidad o de información escondida
> sin inferencia (P05, DL-§4).

---

## 12. Lo que el jugador no aprende en esta v1

Esta v1 **no** introduce:

- Tipos abstractos avanzados (ADTs, polimorfismo).
- Manejo de errores con try/catch (Bitland tiene eventos y lock; el
  try/catch se difiere a maestría).
- Compilación, interpretación, garbage collection como jugable (sí
  son observables, pero no son puzzles).
- Redes de paquetes formales (sockets, IP, TCP): se difieren a
  contenidos opcionales.
- Computación cuántica, lambda calculus, lógica formal. No son
  objetivo.

> La lista es deliberada. La campaña principal no necesita esos
> conceptos para cerrar la fantasía de Bitland (P09, P13).

---

## 13. Lo que este documento NO es

- No cuenta la historia (vive en `bitland-narrative-bible_v1.md`).
- No define puzzles concretos (viven en
  `bitland-arc-01_v1.md` y futuros arcos).
- No define cámara ni UI.
- No es canon: es PROPOSED hasta ratificación.

---

## 14. Open questions del documento

Ver frontmatter. Resumen:

- **BL-MP-Q1.** Cuántas lecciones por arco.
- **BL-MP-Q2.** Arcos por lugar o por concepto.
- **BL-MP-Q3.** Linealidad o retorno.
- **BL-MP-Q4.** Arquitectura como arco final o transversal.
- **BL-MP-Q5.** Capa de optimización transversal desde el inicio.
