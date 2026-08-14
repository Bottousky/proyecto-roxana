---
status: PROPOSED
authority_level: 3
version: v1
last_ratified: 2026-08-14
supersedes:
  - _reference_gdd_reboot_v1/03_BITLAND_GDD_v0.1.md (sección 7 — Mundo como computadora)
depends_on:
  - ../../00-governance/ROXANA_GAME_DESIGN_PILLARS_v1.md
  - ../../00-governance/ROXANA_CANON_POLICY_v1.md
  - ../../00-governance/ROXANA_DESIGN_LANGUAGE_v1.md
  - ./bitland-vision_v1.md
open_questions:
  - BL-WM-Q1 — ¿Hasta qué punto la ciudad mantiene un "cielo" y un clima, o se reduce a un plano legible de procesos?
  - BL-WM-Q2 — ¿La escala visual es barrio, manzana o sala? (afecta el conteo de agentes en pantalla)
  - BL-WM-Q3 — ¿Los agentes autómatas tienen rostro legible, o son siluetas distinguibles sólo por su rol?
  - BL-WM-Q4 — ¿El reloj central de la ciudad es un objeto que se visita, o sólo se "siente" por la desincronización?
  - BL-WM-Q5 — ¿La metáfora urbana admite "callejón sin salida" como representación natural de dead-lock?
---

# BITLAND — WORLD METAPHOR · v1

> Documento de autoridad nivel 3. Biblia de mundo y sistemas. Estabiliza la
> metáfora de **ciudad ejecutable** y define cómo el mundo *es* el sistema
> sin convertirse en decoración.
>
> Todo lore nuevo introducido en este documento es **PROPOSED**.

---

## 1. Tesis de la metáfora

> Bitland es una ciudad donde el espacio **es** el sistema: los ciudadanos
> son procesos, las calles son rutas de datos, las estaciones son funciones,
> los depósitos son memoria, las señales son eventos, y el reloj urbano
> es el clock del sistema. La metáfora no se aplica como esmalte; estructura
> el comportamiento del mundo.

### Regla de honestidad de la metáfora

Cada equivalencia urbana↔concepto debe ser **operativa, no decorativa**:

- Si la ciudad puede mostrar dos comportamientos distintos para la misma
  forma urbana, la metáfora no es honesta y se corrige.
- Si un concepto técnico no se traduce a una forma urbana sin perder
  precisión, **no se traduce**: se representa con un signo propio (un
  panel, una terminal, un indicador) y se nombra.

La metáfora no se fuerza. Cuando se rompe, el sistema lo dice.

---

## 2. Tabla canónica de equivalencias

| Elemento urbano | Concepto de sistema | Función jugable |
|---|---|---|
| **Ciudadano / autómata** | Proceso / agente | Ejecuta instrucciones; se lo puede inspeccionar, redirigir, reprogramar. |
| **Calle / avenida** | Ruta de datos | Conduce paquetes. Tiene dirección, capacidad, costo. |
| **Intersección** | Decisión / routing | Selecciona próximo nodo según señal o estado. |
| **Estación** | Función / servicio | Recibe entradas, produce salidas. Tiene un "firma" reconocible. |
| **Depósito / almacén** | Memoria | Guarda datos. Tiene capacidad, costo de acceso, política de retención. |
| **Paquete / caja** | Dato en tránsito | Viaja por calles, espera en colas, se entrega o se pierde. |
| **Semáforo / señal** | Evento / mensaje | Cambia estado al dispararse. El jugador lo ve como luz, sonido, vibración. |
| **Reloj urbano** | Clock global | Marca el tiempo del sistema; los distritos se desincronizan. |
| **Barrio** | Módulo / subsistema | Conjunto autocontenido con su propia configuración. |
| **Puente** | Interfaz entre módulos | Conecta dos barrios. Si se cae, dos barrios quedan incomunicados. |
| **Archivo municipal** | Persistencia | Lo que sobrevive a un reinicio. Lo que no, se pierde. |
| **Permiso / llave** | Control de acceso | Determina qué procesos pueden tocar qué recursos. |
| **Fábrica / cinta** | Pipeline | Secuencia ordenada de estaciones. |
| **Portero** | Validador de precondición | Acepta o rechaza un paquete según reglas. |
| **Limpieza municipal** | Garbage collector conceptual | Barre datos sin consumidor. Se observa cuando funciona mal. |
| **Callejón sin salida** | Deadlock visible | Un proceso queda esperando un recurso que no llega. |
| **Multitud / atasco** | Congestión / carrera | Varios agentes compiten por un mismo recurso. |
| **Bocina / sirena** | Interrupción / excepción | Señal audible que cambia el ritmo del sistema. |
| **Anomalía urbana** | Bug | Comportamiento emergente no intencional. No es monstruo: es un sistema fuera de propósito. |
| **Inspección / encuesta** | Step / breakpoint | El jugador detiene el tiempo y lee el estado. |

### Cuando la metáfora se rompe — signos propios

| Concepto que no encaja | Signo propio propuesto |
|---|---|
| Pila (stack) y cola (queue) como estructuras | Mostradores de dos tipos: apilable (LIFO) vs. encolable (FIFO). Distinguibles visualmente. |
| Recursión | Panel que se abre sobre sí mismo, con marca de profundidad. |
| Booleanos / compuertas | Tablero de relés en una sub-sala accesible. |
| Memoria virtual / paginación | Estanterías que se *desplazan* y reorganizan cuando un agente accede. |
| Protocolo inseguro | Puertas y puentes con sellos rojos que se desvanecen al ser intervenidos. |
| Costo algorítmico | Tamaño visible de la cola y duración de la espera (sin números hasta formalización). |

---

## 3. Categorías jugables de la ciudad

Bitland tiene cuatro categorías jugables. Toda zona de la ciudad pertenece a
una:

1. **Calles y rutas.** Donde circulan paquetes. Visualmente: vías,
   veredas, cruces, semáforos.
2. **Estaciones y depósitos.** Donde se transforma o se guarda. Visualmente:
   edificios reconocibles con función identificable desde fuera.
3. **Salas de control.** Donde el jugador programa o inspecciona. Visualmente:
   salas más pequeñas, con un panel central (consola, pizarra, panel de
   relés).
4. **Plazas y pasarelas.** Espacios no programables. Sirven para respirar,
   para que el jugador camine, para localizar el siguiente objetivo.

La categoría debe poder leerse a la distancia. El jugador no necesita entrar
a una sala para saber si es control o estación.

---

## 4. Cámara y exploración

### Cámara

- **Vista cenital o isométrica ligera**, priorizando la legibilidad de
  rutas y agentes por encima del detalle de personaje.
- La cámara **no** es libre: la mueve el jugador por nodos o por *drag*
  limitado. Saltos bruscos no rompen la lectura del sistema.
- La cámara **puede detenerse** sobre un agente para seguir su traza.

### Movimiento del jugador

- El jugador controla a **un agente** (rol a definir en BL-V-Q1) que se
  mueve por la ciudad.
- El jugador **no es el sistema**: es un observador-actuante. Puede entrar
  a una estación, abrir un panel, *programar* y salir. La ciudad sigue
  ejecutándose con o sin su presencia.
- Hay **dos modos de juego** que el jugador alterna en el mismo espacio:
  1. **Modo de exploración.** Moverse, hablar, leer el mundo.
  2. **Modo de programación contextual.** Detenido frente a un panel, un
     agente, una calle o una intersección. Edita instrucciones o estados.

El cambio entre modos es **diegético**: abrir un panel, hablar con un
agente, detenerse frente a un cruce. Nunca un menú modal abstracto.

### Lo que el jugador puede ver a simple vista

- Estado de un agente (luz, color, forma) sin abrir un panel.
- Sentido del flujo de una calle (flechas sutiles, animados).
- Cola de espera de un depósito o estación.
- Reloj del distrito actual y diferencia con el reloj central.
- Señales pendientes (luz parpadeante donde un evento espera ser consumido).

### Lo que el jugador descubre al inspeccionar

- Contenido de un paquete.
- Estado interno de un agente (variables, contador, modo).
- Historia de instrucciones (traza) de un agente.
- Reglas activas de una intersección.
- Permisos efectivos sobre un recurso.

---

## 5. Tiempo y reloj

- El **reloj central** coordina los distritos. Se desincronizó; cada
  distrito tiene su propio offset.
- En modo de programación, el jugador puede **pausar, avanzar paso a paso,
  retroceder un trecho corto y reanudar**.
- En modo de exploración, la ciudad corre a su ritmo. El jugador puede
  acelerar la observación a `x1`, `x2` o `x0.5` pero el sistema no se
  congela: el jugador entra y sale del modo de programación cuando quiere
  congelar para leer.
- El reloj nunca se presenta como "tempo de juego". Es un objeto del
  mundo: se ve, se desincroniza, se arregla, se rompe de nuevo.

---

## 6. Topología y límites

- La ciudad no es continua: está particionada en **barrios** y **sectores**.
- Cada barrio tiene su propio gobierno (configuración, permisos,
  prioridades). El jugador aprende a leer la *política local* del barrio
  antes de programar.
- Cruzar de barrio a barrio es cruzar un **puente**: hay costo, hay
  protocolo, a veces hay permiso.
- Los callejones sin salida y los puentes cerrados son errores de sistema
  representables, no obstáculos de level design sin significado.

---

## 7. Errores y anomalías como material narrativo

- Una **anomalía urbana** (calle vacía, intersección que parpadea,
  fábrica que entrega a un lugar que no existe) es un bug legible.
- El jugador la aborda con la misma gramática de puzzles (B7 — Debugging)
  que cualquier sistema heredado.
- Las anomalías **no atacan al jugador**. No hay salud que perder. El coste
  de un bug no resuelto es la *consecuencia visible*: paquetes perdidos,
  distritos desincronizados, estaciones detenidas, colas que crecen.
- Algunas anomalías son *peligrosas* en sentido sistémico (p. ej., un
  distribuidor en bucle infinito que agota la energía del barrio). El
  jugador lo lee, no lo "combate".

---

## 8. Lo que este documento NO es

- No prescribe paleta ni estilo artístico.
- No prescribe cámara en términos de motor o implementación.
- No define la sintaxis del lenguaje. Eso vive en
  `bitland-programming-language-gameplay_v1.md`.
- No define la automatización. Eso vive en `bitland-automation-system_v1.md`.
- No define los puzzles. Eso vive en `bitland-puzzle-grammar_v1.md`.
- No define la progresión ni el arco. Eso vive en
  `bitland-mechanics-progression_v1.md` y `bitland-arc-01_v1.md`.
- No es canon: es PROPOSED hasta ratificación.

---

## 9. Open questions del documento

Ver frontmatter. Resumen:

- **BL-WM-Q1.** Cielo y clima, o plano legible.
- **BL-WM-Q2.** Escala visual: barrio, manzana o sala.
- **BL-WM-Q3.** Antropomorfismo de los agentes.
- **BL-WM-Q4.** Forma del reloj central.
- **BL-WM-Q5.** Callejón sin salida como deadlock.
