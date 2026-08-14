---
status: PROPOSED
authority_level: 4
version: v1
last_ratified: 2026-08-14
supersedes:
  - _reference_gdd_reboot_v1/03_BITLAND_GDD_v0.1.md (sección 11 — Arcos propuestos — sólo el Arco I; sección 12 — Vertical slice)
depends_on:
  - ../../00-governance/ROXANA_GAME_DESIGN_PILLARS_v1.md
  - ../../00-governance/ROXANA_CANON_POLICY_v1.md
  - ../../00-governance/ROXANA_DESIGN_LANGUAGE_v1.md
  - ../vision/bitland-vision_v1.md
  - ../vision/bitland-world-metaphor_v1.md
  - ../gameplay/bitland-programming-language-gameplay_v1.md
  - ../gameplay/bitland-automation-system_v1.md
  - ../gameplay/bitland-puzzle-grammar_v1.md
  - ../gameplay/bitland-mechanics-progression_v1.md
  - ../narrative/bitland-narrative-bible_v1.md
open_questions:
  - BL-A1-Q1 — ¿Cuántos puzzles de cada familia en el Arco I? (afecta el ritmo)
  - BL-A1-Q2 — ¿El capítulo 0 es jugable o es cinemática? (afecta el tiempo de entrada)
  - BL-A1-Q3 — ¿La rutina heredada del capítulo 3 vive en un barrio con nombre o en un espacio abstracto?
  - BL-A1-Q4 — ¿El "Terminal de reparto" del final es un servicio publicado (Etapa 8) o una rutina estable (Etapa 1+3+4)?
  - BL-A1-Q5 — ¿Qué cinematica de cierre de Arco I justifica la entrada al Arco II?
---

# BITLAND — ARC 01 · INSTRUCCIONES · v1

> Documento de autoridad nivel 4. Diseño de contenido. Define el Arco I
> de Bitland — **Instrucciones** — sus cinco capítulos, sus puzzles, su
> transformación del mundo y sus ganchos.
>
> Todo lore introducido en este documento es **PROPOSED**. La
> aprobación de cualquier nombre, lugar o evento narrativo del arco
> requiere ratificación explícita de Manuel.
>
> El Arco I se propone jugable en **45–60 minutos** para un jugador en
> ritmo de campaña. Esta duración es una hipótesis a validar en
> prototipo (ver `bitland-prototype-evaluation_v1.md`).

---

## 1. Objetivo del arco

> Que el jugador sienta el salto: **"di instrucciones" →
> "construí comportamiento"**.
>
> Al terminar el Arco I, el jugador sabe que un programa se ejecuta en
> el mundo, que el orden y la condición importan, que repetir
> manualmente es absurdo, y que un bug heredado se lee antes de
> corregirse.

### Lo que el jugador aprende sin que se lo digan

- **Orden importa** (B1).
- **Un sensor cambia la decisión** (B3).
- **Un loop ahorra pasos** (B4).
- **Un sistema existente puede fallar por motivos no obvios** (B7).
- **Una rutina estable puede dejarse correr** (B8 — primera vez).
- **Una misma idea puede escribirse dos veces con la misma forma**
  (transferencia a B2).

### Lo que el jugador NO aprende en el Arco I

- Variables, estado, memoria. Quedan para el Arco II.
- Funciones y abstracción. Quedan para el Arco III.
- Concurrencia, mensajes, sincronización. Quedan para el Arco IV.
- Servicios, contratos, arquitectura. Quedan para el Arco V.
- Optimización forzada. La capa de optimización existe como reto
  opcional (ver §10) pero no bloquea el cierre.

---

## 2. Estructura general

| Capítulo | Concepto | Lugar (PROPOSED) | Familias | Cierre sistémico |
|---|---|---|---|---|
| 0 — El mensajero | Secuencia | Acceso + Explanada | B1 | Un paquete llega a su destino por primera vez. |
| 1 — La calle cambia | Condición | Calle del Cruce | B3 (con B1) | Una calle que se redirige queda transitable. |
| 2 — Cien cajas | Repetición | Depósito del Muelle | B4 (con B1) | Un depósito se vacía por primera vez. |
| 3 — El error que vuelve | Debugging | Taller del Relojero | B7 (con B1, B3, B4) | Un servicio defectuoso se restaura. |
| Final — Terminal de reparto | Automatización | Terminal del Reparto | B8 (con B1–B4) | Un servicio estable queda en marcha. |

> Los nombres de lugares son **PROVISIONALES**. Se confirman con un
> ADR.

---

## 3. Capítulo 0 — El mensajero

### Concepto

Programar es *ordenar* acciones simples. El jugador descubre que un
agente ejecutará, en orden, lo que el jugador le dé.

### Estado al entrar

- El jugador llega a la Explanada. Es un espacio abierto: un par de
  calles, un mostrador, un paquete en el suelo.
- Hay un agente de reparto detenido. Su cinta de programa está vacía.
- PATCH está cerca pero no habla: observa.

### Mecánicas que se vuelven jugables

- Panel del agente.
- Tarjetas: `MOVE`, `TURN`, `PICK`, `DROP`, `WAIT`, `ACTIVATE`.
- Step / play.
- Selección de tarjeta y conexión por arrastre.

### Familias de puzzle

- **B1 (Secuencia):** el jugador debe llevar el paquete al
  mostrador. Una sola solución "estructural"; varios órdenes válidos.

### Transformación del mundo

- El paquete llega al mostrador.
- La Explanada "se mueve": una luz cambia, un sonido breve, PATCH
  emite un tono.

### Ganchos

- Aparece una calle con un desvío (preparación para el capítulo 1).
- PATCH no se va.

### Criterio de éxito del capítulo

- El jugador ve la consecuencia de su programa y la explica con sus
  palabras: "yo le dije MOVE, luego PICK, luego MOVE, luego DROP".
  No se exige terminología formal.

---

## 4. Capítulo 1 — La calle cambia

### Concepto

El camino no es siempre igual. La condición bifurca.

### Estado al entrar

- Calle del Cruce. Dos caminos: uno con paquete, otro vacío. El
  jugador no sabe de antemano cuál tendrá paquete.
- A veces el desvío cambia; a veces no.
- El agente de reparto tiene una cinta con la secuencia del
  capítulo 0.

### Mecánicas que se vuelven jugables

- Tarjeta `IF`.
- Sensores: `LLEVA_PAQUETE`, `FRENTE_LIBRE`, `EN_DESTINO`.
- Tarjeta `ELSE` opcional.

### Familias de puzzle

- **B3 (Condición):** el jugador debe hacer que el repartidor elija.
- **B1 (transferencia):** la secuencia del capítulo 0 se reutiliza.
- **B2 (introducción):** un "probador" del sistema valida con 3
  inputs distintos; la cinta con IF los pasa todos.

### Transformación del mundo

- La Calle del Cruce deja de fallar: ya siempre hay un paquete
  entregado.
- Aparece el feedback de "probado 3/3 inputs".

### Ganchos

- Aparece un depósito con 100 paquetes (preparación para el
  capítulo 2).
- Un Operador aparece brevemente: "el muelle 4 dejó de
  desbordarse en..." (PROPOSED, abierto a edición).

### Criterio de éxito del capítulo

- El jugador puede predecir qué rama se toma en una configuración
  nueva sin ejecutar.

---

## 5. Capítulo 2 — Cien cajas

### Concepto

La repetición manual se vuelve absurda. Aparece el loop.

### Estado al entrar

- Depósito del Muelle. Un mostrador enorme con 100 paquetes
  apilados. Tres mostradores pequeños al otro lado de la calle.
- El jugador ve un agente que ya tiene una cinta larga: copia
  PICK/MOVE/DROP muchas veces. La cinta no entra en el panel.

### Mecánicas que se vuelven jugables

- Tarjetas `REPEAT(n)`, `WHILE(cond)`.
- Contador de iteración visible.
- `BREAK` (introducción muy leve).

### Familias de puzzle

- **B4 (Repetición):** el jugador aprende a envolver en REPEAT.
- **B1 (transferencia):** la cinta larga "casi" funciona; el
  problema es de escala, no de forma.
- **B2 (transferencia):** la misma solución con REPEAT funciona
  con 100, 50 o 200 paquetes.

### Transformación del mundo

- El Depósito del Muelle se vacía.
- Aparece la noción de "ciclo": la cinta que antes era de
  ejecución única ahora es un *servicio que corre*.

### Ganchos

- Una sala al fondo, el Taller del Relojero, muestra un agente
  que *casi* funciona (preparación para el capítulo 3).
- El reloj de distrito del Depósito del Muelle no coincide con el
  reloj del siguiente barrio.

### Criterio de éxito del capítulo

- El jugador entiende que `REPEAT(100)` y `REPEAT(50)` y
  `REPEAT(200)` son la misma idea.

---

## 6. Capítulo 3 — El error que vuelve

### Concepto

Debugging. Un sistema existente no anda. El jugador debe leer la
traza antes de tocar.

### Estado al entrar

- Taller del Relojero. Un agente de mantenimiento con una rutina
  que "casi funciona": entrega paquetes, pero a veces entrega al
  mostrador equivocado. A veces vuelve sin entregar.
- El sistema expone: programa del agente, traza de las últimas 5
  ejecuciones, estado actual.

### Mecánicas que se vuelven jugables

- Step.
- Pause.
- Rewind corto.
- Highlight de la instrucción actual.
- Inspección de sensores en un instante dado.
- Breakpoint diegético (la ejecución se detiene en una tarjeta
  marcada).

### Familias de puzzle

- **B7 (Debugging):** el jugador identifica el bug (típicamente:
  un `MOVE` en lugar de `TURN`, o un `IF` sin `ELSE`).
- **B1, B3, B4 (transferencia):** la corrección usa las
  herramientas ya aprendidas.

### Variantes del bug (PROPUESTAS — la elección final se hace en
producción)

- **Variante A:** una tarjeta en posición equivocada.
- **Variante B:** una condición que está al revés.
- **Variante C:** un REPEAT que itera de menos.

Todas las variantes son equivalentes en términos pedagógicos; se
elige una por playthrough para evitar monotonía.

### Transformación del mundo

- El Taller del Relojero reanuda su trabajo.
- PATCH se detiene frente al agente corregido y emite una señal
  breve.
- La traza queda archivada en el Taller como "caso resuelto".

### Ganchos

- Aparece el Terminal del Reparto (preparación para el Final del
  Arco).
- Un Operador deja una nota: "queda un servicio por reescribir
  antes de..." (PROPOSED, abierto).

### Criterio de éxito del capítulo

- El jugador puede *explicar* el bug con sus palabras: qué
  condición se evaluó, qué decisión se tomó, por qué falló.

---

## 7. Final del Arco — Terminal del reparto

### Concepto

Automatización. El jugador diseña una rutina estable y la deja
correr.

### Estado al entrar

- Terminal del Reparto. Un servicio de barrio con un buzón de
  pedidos y un único mostrador.
- Hay un agente "modelo" que ya existe, pero sólo funciona
  manual. El jugador debe decidir cómo *automatizarlo*.
- Aparece por primera vez el gesto de "dejar correr".

### Mecánicas que se vuelven jugables

- Selector de modo: manual / automático local / automático global.
- Editor en caliente: cambiar un parámetro sin detener.
- Métrica observable: pedidos recibidos vs. pedidos entregados.

### Familias de puzzle

- **B8 (Automatización):** el jugador automatiza el servicio.
- **B1–B4 (transferencia):** la automatización usa todo lo
  aprendido.

### Transformación del mundo

- El Terminal del Reparto queda operando de noche.
- El barrio reanuda una rutina olvidada: cada vez que llega un
  pedido, un repartidor sale.
- La métrica de pedidos entregados comienza a crecer de forma
  sostenida.

### Ganchos

- Al fondo, un puente apagado hacia el siguiente barrio. La
  cámara lo muestra: un puente que necesita coordinación
  (preparación del Arco IV).
- El reloj central de Bitland se ve por primera vez como
  elemento distante: visible, no accesible.
- PATCH emite un sonido distinto: más largo, más grave. No
  explica.

### Criterio de éxito del arco

- El jugador ve la métrica crecer.
- El jugador puede *explicar* por qué su automatización
  funciona: "porque cuando llega un pedido, el agente lo ve, y
  como no hay otro, lo entrega solo".

---

## 8. Recursos de sistema empleados en el Arco I

- **Energía del distrito:** disponible, sin tensión. El Arco I no
  introduce restricciones de energía.
- **Colas de depósito:** un cuello de botella visible (cap. 2) que
  se resuelve con loop.
- **Permisos:** no se introducen en el Arco I.

> La economía de recursos se introduce en el Arco II y se vuelve
> tema en el Arco IV.

---

## 9. Retos opcionales (no bloquean el cierre)

| Reto | Familia | Métrica observable | Recompensa |
|---|---|---|---|
| "Cien cajas, en menos pasos" | B4 + B12 | Tamaño de la cinta final. | Insignia opcional. |
| "El agente del reloj" | B7 | Latencia de entrega del Taller del Relojero. | Insignia opcional. |
| "Tres mostradores" | B2 | Robustez ante 3 configuraciones. | Insignia opcional. |

Las insignias no son puntos. Son marcas de exploración, no de
dominio. P08 + DL-§2: la recompensa sigue siendo la
transformación del mundo, no un contador.

---

## 10. Estructura interna tentativa (mapa jugable)

```
[Aula/Lab. Computación — Instituto]
            ↓ (transición diegética)
       EXPLANADA        ← cap. 0
            ↓
   CALLE DEL CRUCE      ← cap. 1
            ↓
   DEPÓSITO DEL MUELLE  ← cap. 2
            ↓
   TALLER DEL RELOJERO  ← cap. 3
            ↓
   TERMINAL DEL REPARTO ← final del arco
            ↓
       [puente apagado hacia Arco II]
```

Los nombres son PROVISIONALES. La forma del mapa (línea con
bifurcaciones mínimas) es estable.

---

## 11. Lista explícita de lore introducida en el Arco I (PROPOSED)

Toda la lista siguiente es **PROPOSED** y requiere ratificación
explícita de Manuel para ascender:

- **Acceso desde el Instituto vía Aula/Laboratorio de Computación**
  con un terminal/rack encendido.
- **Explanada**, **Calle del Cruce**, **Depósito del Muelle**,
  **Taller del Relojero**, **Terminal del Reparto** como nombres de
  lugar.
- **PATCH** como agente de mantenimiento del Instituto que observa
  ejecución sin enseñar.
- **Operadores** como registros incompletos de antiguos
  estudiantes/docentes.
- **El Taller del Relojero** como barrio de mantenimiento donde
  un servicio defectuoso se restaura.
- **El puente apagado** como gancho hacia el Arco II/IV.
- **El reloj central** de Bitland como objeto distante visible
  desde el final del arco.
- **La métrica "pedidos entregados"** como primer indicador de
  salud de un servicio.

---

## 12. Criterios de éxito del Arco I (resumen)

- El jugador puede resolver un puzzle B1 sin ayuda.
- El jugador puede resolver un puzzle B3 con IF.
- El jugador puede resolver un puzzle B4 con REPEAT.
- El jugador puede identificar y corregir un bug B7 con
  traza + breakpoint.
- El jugador puede automatizar un servicio B8 y verlo correr.
- El jugador no necesitó leer pseudocódigo ni código para
  completar el arco.
- El jugador vio una transformación observable del mundo en
  cada capítulo.

---

## 13. Lo que este documento NO es

- No define puzzles concretos pieza por pieza (sólo la forma
  general). El detalle de puzzles vive en producción.
- No define cámara, arte ni sonido.
- No define la duración exacta: la hipótesis de 45–60 minutos se
  valida en `bitland-vertical-slice_v1.md` y
  `bitland-prototype-evaluation_v1.md`.
- No cuenta la historia del resto de Bitland. Eso vive en la
  `bitland-narrative-bible_v1.md` y en futuros arcos.
- No es canon: es PROPOSED hasta ratificación.

---

## 14. Open questions del documento

Ver frontmatter. Resumen:

- **BL-A1-Q1.** Conteo de puzzles por familia.
- **BL-A1-Q2.** Capítulo 0 jugable o cinemática.
- **BL-A1-Q3.** Nombres definitivos de lugares.
- **BL-A1-Q4.** Cierre de arco con servicio o con rutina.
- **BL-A1-Q5.** Cinemática de cierre hacia el Arco II.
