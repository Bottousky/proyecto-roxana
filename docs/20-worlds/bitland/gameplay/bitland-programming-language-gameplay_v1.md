---
status: PROPOSED
authority_level: 3
version: v1
last_ratified: 2026-08-14
supersedes:
  - _reference_gdd_reboot_v1/03_BITLAND_GDD_v0.1.md (sección 6 — Mecánica de programación progresiva)
depends_on:
  - ../../00-governance/ROXANA_GAME_DESIGN_PILLARS_v1.md
  - ../../00-governance/ROXANA_CANON_POLICY_v1.md
  - ../../00-governance/ROXANA_DESIGN_LANGUAGE_v1.md
  - ../vision/bitland-vision_v1.md
  - ../vision/bitland-world-metaphor_v1.md
open_questions:
  - BL-PLG-Q1 — ¿La representación textual (pseudocódigo/código) es accesible desde la Etapa 1 o sólo desde la 4 en adelante?
  - BL-PLG-Q2 — ¿Cuántas instrucciones caben en un programa "pequeño" antes de que la pieza se llame "función"? (afecta cuándo se introduce la Etapa 5)
  - BL-PLG-Q3 — ¿Las subrutinas pueden recibir comportamiento (closures) o sólo datos y agentes? Esto es una decisión de profundidad, no de cobertura.
  - BL-PLG-Q4 — ¿La concurrencia introduce agentes NPC ya activos o el jugador los crea desde cero?
  - BL-PLG-Q5 — ¿La arquitectura (Etapa 8) se vive como servicio instalado por NPC, o como puzzle jugable? (afecta carga cognitiva del cierre)
---

# BITLAND — PROGRAMMING LANGUAGE GAMEPLAY · v1

> Documento de autoridad nivel 3. Biblia de mundo y sistemas. Define las
> **8 etapas del lenguaje de programación jugable** de Bitland, sus
> primitivas, su UI, sus límites y la regla de migración
> (bloques → pseudocódigo → código textual opcional).
>
> No prescribe motor ni framework. No incluye la *gramática de puzzles*
> (B1–B12), que vive en `bitland-puzzle-grammar_v1.md`.

---

## 1. Tesis del lenguaje

> Bitland no es un editor de código con estética urbana. Es una ciudad
> cuyo comportamiento se programa. El lenguaje es el medio, no el objeto.
>
> El jugador programa comportamiento **antes** de saber que lo que hace
> tiene nombre formal. La sintaxis llega después, como mapa.

Tres principios inviolables:

1. **Semántica antes que sintaxis.** El jugador puede resolver las
   primeras etapas sin ver una sola línea de pseudocódigo. La sintaxis
   aparece cuando la consecuencia observable ya está internalizada
   (P02, P06).
2. **Migración de representación, no de concepto.** El concepto
   "condicional" se introduce en la Etapa 2. Sucesivas capas (bloque,
   pseudocódigo, código textual) son la misma idea leída con anteojos
   distintos.
3. **La representación puede ser ignorada.** Un jugador puede completar
   el juego con bloques. La sintaxis textual es opcional y vive en la
   capa de formalización operada por la Bitácora.

---

## 2. Regla de migración de representación

Cada etapa puede leerse en tres modos:

| Modo | Vehículo | Quién lo ve | Cuándo |
|---|---|---|---|
| **Vivencia** | Bloques físicos (tarjetas, módulos, piezas) | Todos los jugadores | Camino crítico desde la Etapa 1. |
| **Formalización** | Pseudocódigo narrativo en la Bitácora | Jugador que pide ver "qué hizo" | Después de evidencia suficiente (P02). |
| **Código** | Texto opcional, equivalente a la vivencia | Jugador con interés en formalización | Activado por el jugador. No obligatorio. |

Reglas:

- Ningún jugador es forzado a leer pseudocódigo para avanzar.
- La Bitácora puede *mostrar* la formalización después (DL-§5 — modo
  "mostrada"). No la exige como paso previo.
- El modo Código no evalúa diferente al modo Bloques. La validación es
  por **condiciones** (P07), no por sintaxis.

---

## 3. Las 8 etapas — vista global

| # | Etapa | Concepto nuclear | ¿Qué se vuelve jugable? | Gesto de programación |
|---|---|---|---|---|
| 1 | **Instrucciones** | Acción directa | El jugador mueve, toma, entrega, gira, espera. | Tarjetas físicas. |
| 2 | **Decisión** | Bifurcación condicional | El jugador hace que un agente elija entre dos caminos. | Tarjeta IF + sensor. |
| 3 | **Repetición** | Iteración | El jugador hace que un agente repita sin repetir código. | Tarjetas REPEAT / WHILE. |
| 4 | **Memoria** | Estado entre eventos | El jugador hace que un agente recuerde y use ese recuerdo. | Cajas de variable / slot. |
| 5 | **Abstracción** | Función / subrutina | El jugador nombra un comportamiento y lo reutiliza. | Pliego de subrutina con parámetros. |
| 6 | **Concurrencia** | Varios agentes a la vez | El jugador orquesta varios procesos que comparten tiempo. | Programar varios agentes a la vez. |
| 7 | **Comunicación** | Mensaje / evento | El jugador hace que un proceso hable con otro sin conocerlo. | Buzón, canal, evento. |
| 8 | **Arquitectura** | Servicio, interfaz, recurso compartido | El jugador define un contrato entre módulos y reescala. | Panel de servicio, contratos. |

La curva no es estricta: las Etapas 6 y 7 se entrelazan; la 8 aparece como
síntesis. Ver `bitland-mechanics-progression_v1.md` para el orden exacto
de aparición por arco.

---

## 4. Etapa 1 — Instrucciones físicas

### Concepto

Programar es *ordenar* acciones simples a un agente.

### Primitivas

- `MOVE(dir)`: avanzar un paso en una dirección cardinal.
- `TURN(dir)`: girar a la izquierda o a la derecha.
- `PICK(item)`: recoger un paquete del suelo o de un mostreador.
- `DROP(target)`: dejar el paquete en un mostreador, en una calle o frente
  a una puerta.
- `WAIT(n)`: esperar `n` pasos de clock.
- `ACTIVATE(target)`: activar un dispositivo (puerta, semáforo, portero).

### UI

- **Bloques físicos**: tarjetas con símbolo + texto breve.
- Se encastran en una **cinta de programa** visible en el panel del agente.
- Una cinta vacía equivale a "no hacer nada".
- Sin colores únicos para identificar estado; usar icono + texto (P05
  accesibilidad).

### Límites

- Sin condición, sin repetición, sin memoria entre eventos.
- El programa se ejecuta de arriba abajo, una vez.

### Debugging

- El jugador puede **step**: avanza un bloque por vez.
- La tarjeta que se está ejecutando brilla.
- Si una acción no es posible (no hay paquete para PICK, no hay
  mostreador para DROP), el sistema **dice qué bloque falló y por qué**,
  no "incorrecto".

### Migración

- **Vivencia:** tarjetas.
- **Formalización (sólo si el jugador la pide):**
  `MOVE(N); MOVE(N); PICK(B); DROP(mostrador_A)`
- **Código:** no se ofrece en esta etapa.

---

## 5. Etapa 2 — Decisión

### Concepto

Programar es hacer que un agente **responda a lo que ve**.

### Primitivas nuevas

- `IF(condición) { ... } ELSE { ... }`
- Sensores: `FRENTE_LIBRE`, `LLEVA_PAQUETE`, `EN_DESTINO`, `HORA_EN_RANGO`,
  `COLOR_EN_CELDA`, `MENSAJE_ESPERA`.
- Comparadores: `==`, `!=`, `<`, `>`, `IN`.

### UI

- La tarjeta `IF` tiene dos ranuras: condición y cuerpo.
- Las dos ramas (IF / ELSE) se ven en paralelo; la activa se ilumina al
  ejecutar.
- Sensores: una paleta lateral; cada sensor es una tarjeta con icono.

### Límites

- La condición se evalúa en el momento del IF, no se memoza.
- Anidar IF está permitido pero la UI lo penaliza visualmente: un IF
  anidado ocupa más espacio y se ve "ancho".

### Debugging

- Step resalta qué rama se tomó.
- Inspección de sensor: el jugador puede preguntar "¿qué está viendo
  este sensor ahora?" y obtener una respuesta visual (p. ej., "LLEVA_PAQUETE:
  verdadero").

### Migración

- **Vivencia:** tarjetas.
- **Formalización:**
  `IF(FRENTE_LIBRE) { MOVE(N) } ELSE { TURN(E) }`
- **Código:** no se ofrece aún.

---

## 6. Etapa 3 — Repetición

### Concepto

Programar es **eliminar trabajo redundante**. La repetición manual se
vuelve absurda; aparece el loop.

### Primitivas nuevas

- `REPEAT(n) { ... }`: repite `n` veces.
- `WHILE(condición) { ... }`: repite mientras la condición sea verdadera.
- `BREAK`: salida temprana (sólo con WHILE).

### UI

- La tarjeta REPEAT/WHILE tiene un cuerpo "doblable": se cierra y se ve
  cuántas veces falta.
- Un REPEAT que se ha ejecutado `k` veces muestra `k/n` en una esquina.

### Límites

- No hay `FOR` clásico: se obtiene con `REPEAT` + variable de
  iteración en la Etapa 4.
- `WHILE` puede correr indefinidamente; el jugador debe poder interrumpir
  desde el panel (ver debugging).

### Debugging

- Step dentro de un loop itera de a un paso.
- El jugador ve el contador crecer.
- Una condición de WHILE que nunca se hace falsa se *señala* (luz roja +
  sugerencia de "esta condición podría no cambiar nunca").

### Migración

- **Vivencia:** tarjetas.
- **Formalización:**
  `REPEAT(5) { MOVE(N); DROP(celda) }`
- **Código:** no se ofrece aún.

---

## 7. Etapa 4 — Memoria

### Concepto

Programar es **recordar** información entre eventos. El estado del agente
se vuelve persistente.

### Primitivas nuevas

- `LET(nombre, valor)`: asigna.
- `INCR(nombre)`, `DECR(nombre)`: ajusta.
- `READ(nombre)`: lee en una expresión.
- **Slot visual:** caja de variable en la cabeza del agente, con un valor
  visible.

### UI

- Cajas de variable en una repisa al lado del programa.
- Una caja muestra su nombre y su valor. Se arrastra a una tarjeta `IF`
  o `REPEAT` para usarla como condición.
- Una variable sin asignar se ve "vacía" y produce error legible.

### Tipos

- **Contador:** entero no-negativo.
- **Booleano:** sí / no.
- **Etiqueta:** uno de un conjunto discreto (modo de un agente).
- **Cola corta:** hasta N elementos; visible como fila.

Los tipos se introducen por necesidad jugable, no por tabla. La
formalización matemática queda para la capa de Bitácora (DL-§5).

### Debugging

- La caja de variable muestra su valor en cada paso.
- "Inspeccionar este agente" abre un panel con su memoria completa.
- El jugador puede *resetear* una sola variable sin abortar el programa.

### Migración

- **Vivencia:** cajas + tarjetas.
- **Formalización:** el pseudocódigo admite `LET cont = 0; INCR(cont)`.
- **Código:** no se ofrece aún.

---

## 8. Etapa 5 — Abstracción (funciones)

### Concepto

Programar es **nombrar un comportamiento** y reutilizarlo. Aparece el
"más general" como meta.

### Primitivas nuevas

- `DEF nombre(parámetros) { ... }`: define una subrutina.
- `CALL nombre(argumentos)`: invoca.
- Las funciones tienen **nombre local**; pueden existir como hojas
  separadas en el panel.

### UI

- Una hoja-función se pliega/despliega. Encerrada en un "pliego" visual
  con su nombre.
- Una llamada a función se ve como una tarjeta `CALL` con el nombre y los
  argumentos cableados.
- Los argumentos son piezas que se *cablean* (no strings): `MOVE` recibe
  un tile o una variable, no un string.

### Límites

- Las funciones devuelven un valor simple (contador, etiqueta) o nada.
- Recursión: sí, pero acotada (ver Etapa 6 — concurrencia).

### Debugging

- Step dentro de una CALL muestra el frame actual de la subrutina.
- El jugador puede ver qué argumentos recibió.
- La pila de llamadas se muestra como una pila visible (no como string).

### Migración

- **Vivencia:** pliegos.
- **Formalización:**
  `DEF entregar_a(celda) { MOVE(N); DROP(celda); }`
- **Código:** opcional.

---

## 9. Etapa 6 — Concurrencia

### Concepto

Programar es **coordinar varios agentes** que comparten el mismo clock
del mundo.

### Primitivas nuevas

- `SPAWN(rol)`: crea un agente subordinado a partir de una plantilla.
- `JOIN`: espera a que varios agentes terminen.
- `LOCK(recurso)` / `UNLOCK(recurso)`: sincronización.
- **Tick visual:** la cámara muestra un paso de clock como un destello
  global.

### UI

- El panel del jugador puede mostrar **varios agentes** a la vez, cada
  uno con su programa.
- Una barra superior muestra el tick actual y qué agentes se ejecutan en
  este tick.
- Los locks se ven como llaves físicas: el recurso bloqueado se cierra,
  el agente que lo espera se ilumina.

### Reglas del mundo

- Todos los agentes comparten el mismo clock. No hay paralelismo real:
  hay intercalado.
- Un agente que espera un lock *no* gasta energía, pero bloquea su propio
  tick.
- El jugador aprende viendo race conditions *antes* de la lección: las ve
  como atasco y luego se las nombra.

### Debugging

- Step global: avanza un tick y muestra qué hizo cada agente.
- Step por agente: avanza un tick en un agente y pausa los otros.
- Inspección de lock: muestra quién lo tiene, quién lo espera.

### Migración

- **Vivencia:** múltiples paneles + barra de clock.
- **Formalización:** pseudocódigo puede tener varios programas, uno por
  agente.
- **Código:** opcional.

---

## 10. Etapa 7 — Comunicación (mensajes y eventos)

### Concepto

Programar es hacer que un proceso **le hable a otro** sin tener que
conocerlo. Aparece el acoplamiento débil.

### Primitivas nuevas

- `SEND(canal, mensaje)`: emite.
- `ON(canal) { ... }`: suscribe un handler.
- `EMIT(evento)`: dispara un evento local.
- `WAIT_FOR(evento)`: espera bloqueante.
- **Buzón visual:** canal = buzón físico con un cartel identificador.

### UI

- Buzones en la ciudad: cada buzón es un canal. Un agente que escucha
  tiene una antena encendida.
- Los mensajes en tránsito se ven como sobres volando por la calle. Si
  no hay destinatario, el sobre se acumula y se ilumina.

### Reglas del mundo

- Un mensaje no se pierde mientras haya memoria. Si nadie lo consume, se
  acumula y *eso* se vuelve un bug legible.
- Eventos asíncronos no interrumpen al agente activo salvo que tenga
  `ON(canal)` activo.

### Debugging

- Inspección de buzón: muestra cola de mensajes pendientes.
- Traza de un mensaje: desde qué agente, por qué canal, cuándo, a quién.
- El jugador puede *detener* la entrega de un mensaje específico.

### Migración

- **Vivencia:** buzones + sobres.
- **Formalización:** `SEND(reparto, "orden 12")` con canal literal.
- **Código:** opcional.

---

## 11. Etapa 8 — Arquitectura

### Concepto

Programar es **definir contratos** entre módulos. El jugador deja de
pensar en agentes y empieza a pensar en servicios.

### Primitivas nuevas

- `SERVICE nombre { recursos, contratos }`: declara un servicio.
- `REQUIRES(recurso)`: dependencia explícita.
- `INTERFACE nombre { ... }`: contrato.
- **Panel de servicio:** una sala específica del barrio donde se instala
  un servicio y se publica su contrato.
- **Gobernanza del barrio:** configuración que el jugador edita como
  parte de programar.

### UI

- Cada servicio se ve como un edificio con un cartel de contrato.
- Los recursos compartidos (memoria, energía, ancho de banda) se ven
  como tuberías, tanques o cables visibles.
- Las interfaces (contratos) son formularios Diegéticos: el jugador
  completa campos en un panel, no escribe JSON.

### Reglas del mundo

- Un servicio publicado se vuelve *invocable* por cualquier agente del
  barrio con permiso.
- Un servicio que cae afecta a todos los que dependen de él — esto es
  observable (P08: la transformación del mundo es la primera recompensa).
- Recursos compartidos limitados: si dos servicios pelean por energía,
  uno se degrada visiblemente.

### Debugging

- Vista de "dependencias": mapa de quién requiere a quién.
- Inspección de contrato: muestra precondiciones, postcondiciones y
  efectos.
- El jugador puede *aislar* un servicio en un entorno seguro para
  probarlo.

### Migración

- **Vivencia:** edificio-servicio.
- **Formalización:** contratos en pseudocódigo con cláusulas de recurso.
- **Código:** opcional y explícitamente opt-in.

---

## 12. UI global: cómo se ve la programación en Bitland

Independiente de la etapa, el panel tiene siempre cuatro zonas:

1. **Lista de agentes / servicios** (izquierda). Quién está bajo control.
2. **Programa del agente activo** (centro). Cinta de tarjetas, plegable.
3. **Estado** (derecha). Variables, locks, mensajes pendientes, ticks.
4. **Clock / clock del distrito** (arriba). Diferencia con el central.

La cinta de programa es **scrollable verticalmente**, no anidable en
profundidad: la profundidad (funciones, handlers) se pliega en pestañas
laterales. La legibilidad prima sobre la compactación.

---

## 13. Errores de sintaxis y semántica

El lenguaje distingue dos clases de error:

- **Error de uso.** La tarjeta no encaja porque la condición es del
  tipo equivocado o falta un argumento. Se corrige sin reiniciar el
  programa. Aparece como un *aro rojo* alrededor de la tarjeta y un
  texto breve ("este sensor no acepta texto").
- **Error de ejecución.** El programa se ejecuta, pero la precondición
  falla en el mundo: no hay paquete, no hay recurso, hay deadlock. Se
  ve en la traza y se *debuggea* (P05, P08).

**Prohibido:**

- "Incorrecto" como mensaje único.
- Reinicio opaco del estado.
- Castigo por ensayo razonable (DL-§6).

---

## 14. Condiciones de paso entre etapas

Una etapa se da por *introducida* (no dominada) cuando el jugador:

1. Resolvió al menos un puzzle B-* del catálogo donde esa etapa es
   central (ver `bitland-puzzle-grammar_v1.md`).
2. Vio ejecutar al menos una vez un sistema que usaba esa primitiva.
3. Pudo *depurar* un error donde la primitiva estaba mal usada.
4. Si tiene modo Formalización, lo vio en la Bitácora al menos una vez.

La maestría de la etapa vive en retos opcionales y en la capa de
optimización del Arco correspondiente.

---

## 15. Lo que este documento NO es

- No define puzzles concretos.
- No prescribe la cámara ni el estilo visual del panel.
- No prescribe paleta ni tipografía.
- No decide la sintaxis textual exacta (eso es producción, no diseño).
- No cierra cómo se introduce cada etapa en la campaña: eso vive en
  `bitland-mechanics-progression_v1.md` y `bitland-arc-01_v1.md`.
- No es canon: es PROPOSED hasta ratificación.

---

## 16. Open questions del documento

Ver frontmatter. Resumen:

- **BL-PLG-Q1.** Cuándo se desbloquea la vista textual.
- **BL-PLG-Q2.** Umbral para que un subprograma sea función.
- **BL-PLG-Q3.** Alcance de las subrutinas (datos, agentes, comportamiento).
- **BL-PLG-Q4.** Concurrencia con agentes NPC previos o desde cero.
- **BL-PLG-Q5.** Arquitectura como puzzle o como servicio instalado.
