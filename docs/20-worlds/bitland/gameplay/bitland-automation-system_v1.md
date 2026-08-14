---
status: PROPOSED
authority_level: 3
version: v1
last_ratified: 2026-08-14
supersedes:
  - _reference_gdd_reboot_v1/03_BITLAND_GDD_v0.1.md (sección 10 — Dificultad y evaluación; sección 7 — microgénero factory/automation; sección 15 — Bitácora de procesos)
depends_on:
  - ../../00-governance/ROXANA_GAME_DESIGN_PILLARS_v1.md
  - ../../00-governance/ROXANA_CANON_POLICY_v1.md
  - ../../00-governance/ROXANA_DESIGN_LANGUAGE_v1.md
  - ../vision/bitland-vision_v1.md
  - ../vision/bitland-world-metaphor_v1.md
  - ./bitland-programming-language-gameplay_v1.md
open_questions:
  - BL-AU-Q1 — ¿La energía del sistema es global, por barrio, o por agente? (afecta la economía visible)
  - BL-AU-Q2 — ¿Las automatizaciones "envenenadas" (las que nadie apagó) son las primeras que el jugador toca, o se introducen más tarde?
  - BL-AU-Q3 — ¿El jugador puede "pausar" una automatización heredada sin eliminarla? (afecta el ritmo del debugging)
  - BL-AU-Q4 — ¿Existen automatizaciones que el jugador *no debe* entender del todo para completar la campaña?
  - BL-AU-Q5 — ¿La optimización de una automatización se mide en tiempo real, en ciclos por entrega, o en una métrica que el jugador nombra?
---

# BITLAND — AUTOMATION SYSTEM · v1

> Documento de autoridad nivel 3. Biblia de mundo y sistemas. Define cómo
> la **automatización es jugable** en Bitland: cómo se diseña, cómo se
> despliega, cómo se monitorea, cómo se depura, cómo se optimiza, cómo se
> retira, y por qué automatizar mal es uno de los temas del mundo.
>
> No prescribe motor. No define puzzles. No cuenta historia.

---

## 1. Tesis del sistema de automatización

> Automatizar no es "escribir un loop y olvidarse". Es diseñar un proceso
> continuo que el jugador debe poder **observar, leer, ajustar y
> responsabilizarse**.

Tres consecuencias inmediatas:

1. Una automatización corre aunque el jugador no esté mirándola. Su
   efecto en el mundo es acumulativo: colas, energía consumida, paquetes
   entregados, paquetes perdidos, distritos sincronizados.
2. Toda automatización que el jugador diseña o hereda es *legible*. El
   jugador puede abrir su programa, leer su estado, ver su traza. Las
   automatizaciones no son cajas negras.
3. La automatización es donde la fantasía de Bitland cristaliza. Pasar
   de "dar instrucciones" a "construir comportamiento" se vive como un
   salto: el mundo empieza a *trabajar solo* bajo reglas que el jugador
   puede defender.

---

## 2. El "qué" se automatiza

Hay tres clases de automatización en Bitland. No son niveles, son
*dominios*:

| Clase | Qué se automatiza | Aparece desde | Ejemplos |
|---|---|---|---|
| **Rutina** | Comportamiento de un agente individual. | Etapa 1 + Etapa 3 (loop). | Repartidor que entrega N paquetes por turno. |
| **Orquestación** | Coordinación entre varios agentes. | Etapa 6 (concurrencia). | Tres repartidores alimentando un depósito. |
| **Servicio** | Contrato entre módulos. | Etapa 8 (arquitectura). | Servicio de reparto que cualquier barrio puede invocar. |

Una automatización puede *subir de clase*: una rutina puede ser
orquestada por varios agentes; una orquestación puede publicarse como
servicio. La subida de clase es *opt-in*: la campaña principal la
presenta cuando ya hay vocabulario; la maestría la explota.

---

## 3. El ciclo de vida de una automatización

Toda automatización pasa por cinco fases, todas jugables:

1. **Diseño.** El jugador decide *qué* debe ocurrir sin intervención.
2. **Despliegue.** La automatización se monta en el mundo y empieza a
   correr.
3. **Monitoreo.** El jugador observa la traza, el estado y el efecto.
4. **Ajuste.** Cambia un parámetro, una condición, un orden, una
   prioridad.
5. **Retiro o sucesión.** La automatización se apaga, se reemplaza o se
   delega a otra.

### Lo que el jugador ve en cada fase

- **Diseño:** panel del agente o del servicio, con la cinta de programa
  editable. Si es una orquestación, paneles de varios agentes en
  paralelo.
- **Despliegue:** un efecto visible: el agente se pone en marcha, una
  luz cambia, una calle se habilita.
- **Monitoreo:** una vista de estado pasiva. Métricas visibles
  opcionales. La traza es accesible en cualquier momento.
- **Ajuste:** edición en caliente cuando la automatización es
  *segura*; requiere detenerla y reiniciarla si la edición cambia
  estructura.
- **Retiro:** la automatización se apaga con un gesto claro (no se
  borra en silencio).

### Las automatizaciones heredadas

Bitland está lleno de automatizaciones que el jugador **no diseñó**:

- Repartidores en loops infinitos.
- Porteros que sólo aceptan un tipo de paquete que ya no se produce.
- Servicios de barrio que llaman a servicios que ya no existen.
- Horarios de fábrica que se solapan con horarios de mantenimiento.

Estas automatizaciones son el material de los puzzles B7 (Debugging) y
B8 (Automatización). El jugador las lee, las entiende, las reescribe o
las apaga.

---

## 4. Recursos del sistema (economía de la automatización)

La automatización no es gratis. Tres recursos visibles, uno oculto en
esta sesión:

| Recurso | Significado | Cómo se ve | Quién lo paga |
|---|---|---|---|
| **Energía del distrito** | Capacidad de cómputo y electromecánica. | Tanques / medidores en cada barrio. | Toda automatización corre energía. |
| **Ancho de banda de calles** | Capacidad de mensajes y paquetes en ruta. | Sensores en intersecciones, contadores. | Cada paquete en tránsito. |
| **Memoria de depósito** | Cuánto puede esperar en cola. | Mostrador con marcas. | Paquetes sin consumir. |
| **Complejidad del programa** (oculto en v1) | Costo cognitivo, no económico. | No se muestra al jugador en campaña. | El jugador lo siente al mantener el programa. |

> **Nota:** la complejidad como métrica visible al jugador vive en
> `bitland-prototype-evaluation_v1.md` como hipótesis a validar. En v1
> no se muestra al jugador.

Reglas de recursos:

- La energía del distrito es *compartida*: si una automatización
  acapara, otra se ralentiza.
- La cola de un depósito llena bloquea al agente que intenta hacer DROP
  allí.
- El jugador nunca se queda sin energía de forma irreparable: siempre
  puede apagar automatizaciones para liberar capacidad.

---

## 5. Métricas de éxito y de optimización

Una automatización puede ser correcta y aún no ser "buena". Las
métricas jugables son cinco:

1. **Throughput.** Paquetes (u operaciones) por unidad de clock.
2. **Latencia.** Tiempo entre pedido y entrega.
3. **Robustez.** Qué tan bien se comporta con inputs nuevos.
4. **Costo.** Energía y memoria consumidas.
5. **Legibilidad.** Qué tan fácil es para otro jugador leer el programa.

La campaña principal exige **funcionalidad y seguridad básicas** (P13).
Las métricas 1–4 se exponen al jugador en la capa de optimización.
La métrica 5 es una observación estética, no un score.

> **Regla de oro (P07, DL-§2).** Una automatización correcta pero lenta,
> robusta pero cara, clara pero no óptima, **es válida para la campaña**.
> La optimización es la capa de maestría.

---

## 6. Modos de operación de una automatización

Una automatización puede correr en tres modos:

- **Manual.** El jugador la activa por gesto. Útil para aprender.
- **Automático local.** Se activa por evento del propio agente o
  servicio.
- **Automático global.** Se activa por un evento del distrito o del
  clock central.

El modo es visible. Cambiar de modo es un acto de diseño: pasar de
manual a local no siempre es trivial (puede introducir condiciones
que el jugador no consideró).

---

## 7. La automatización "mala" como material de juego

Bitland no enseña programación defendiendo que "todo lo automatizado
está bien". Enseña lo contrario. Las automatizaciones malas son:

- **El loop que no termina.** Acepta inputs y nunca cierra; consume
  energía hasta vaciar el distrito.
- **El servicio fantasma.** Recibe pedidos y nunca entrega; los
  pedidos se acumulan.
- **La condición que nunca es verdadera.** Un portero que nunca abre
  porque el evento que espera no existe.
- **La condición que siempre es verdadera.** Un agente que siempre
  intenta ir al norte hasta chocar contra un muro.
- **El acoplamiento rígido.** Un servicio que sólo funciona si su
  vecino funciona, sin manejo de fallo. Si el vecino cae, cae él.
- **La optimización local.** Un agente que vacía una cola local pero
  desborda la cola del barrio siguiente.
- **La rutina ritual.** Un proceso que limpia lo que ya no existe
  porque nadie actualizó su objetivo.

Ninguna de estas es un *monstruo*. Son sistemas con propósito perdido.
El jugador las lee, las diagnostica, las reescribe, las apaga, las
deja como están si sirven.

---

## 8. La automatización como restauración (P08)

Por P08, la recompensa dominante de Bitland es la **transformación del
mundo**. La automatización se valida por su efecto, no por su elegancia:

- El barrio que vuelve a entregar porque su servicio de despacho
  funciona.
- La fábrica que se vacía porque la cola se redirigió.
- La calle que se libera porque el portero aprendió a abrir cuando
  debe.
- El reloj de distrito que se vuelve a sincronizar porque el jugador
  corrigió la deriva de un agente de tiempo.

La automatización correcta **se ve en el mundo**, no en el panel.

---

## 9. Edición en caliente, seguridad y reversibilidad

- **Edición segura.** Cambiar un parámetro (umbral, color, calle de
  destino) sin detener la automatización. Se aplica al siguiente ciclo.
- **Edición estructural.** Cambiar la forma del programa (agregar una
  tarjeta, mover un IF, introducir un handler). Requiere detener y
  reiniciar.
- **Reversibilidad.** Toda edición tiene *undo* a nivel del jugador. Las
  automatizaciones heredadas no se borran: se reemplazan. La versión
  anterior se guarda en un archivo del barrio (diegético).

### Prohibido

- "Edición peligrosa sin aviso": si una edición estructural rompe un
  invariante, el sistema lo anuncia antes de aplicar.
- "Persistencia silenciosa": si el jugador apaga una automatización, el
  barrio la recuerda y la ofrece a la Bitácora como entrada (modo
  "operada").
- "Edición sin feedback": cada cambio muestra un diff breve (qué tarjeta
  cambió, qué condición nueva).

---

## 10. La automatización y la curva de juego

La automatización es un **eje de progresión** propio, transversal a las
8 etapas del lenguaje:

| Arco | Cuándo aparece la automatización como objetivo |
|---|---|
| **I — Instrucciones** | Una rutina única con un loop; el jugador la diseña y la deja correr. |
| **II — Decisión** | Una rutina con condición robusta: misma rutina funciona con inputs distintos. |
| **III — Estado** | Una rutina con memoria: el agente recuerda y decide. |
| **IV — Abstracción** | Una subrutina usada por varios agentes; reutilización real. |
| **V — Sistemas** | Orquestación: varios agentes coordinados, con mensajes, sincronización. |
| **VI — Arquitectura** | Un servicio publicado que cambia la dinámica del barrio entero. |

(El Arco V del brief original se ajusta aquí como **Sistemas** y el
Arco VI como **Arquitectura**, alineándose con `bitland-mechanics-progression_v1.md`.)

---

## 11. Lo que el jugador NO automatiza (en v1)

- El propio avatar del jugador. El jugador decide cuándo se mueve.
- La cámara. La cámara es una herramienta de observación, no un agente.
- El sistema de clock. El jugador no puede "ajustar" el reloj de distrito
  por sí solo: lo arregla arreglando la automatización que lo deriva.
- La persistencia: no hay "guardado automático" de automatizaciones; el
  jugador decide cuándo se archiva en el barrio.

---

## 12. Lo que este documento NO es

- No define la cámara ni la UI.
- No define la sintaxis del lenguaje (vive en
  `bitland-programming-language-gameplay_v1.md`).
- No define los puzzles concretos (viven en `bitland-puzzle-grammar_v1.md`).
- No cuenta la historia de las automatizaciones heredadas (vive en
  `bitland-narrative-bible_v1.md`).
- No prescribe cómo se modela el costo de la energía en producción.
- No es canon: es PROPOSED hasta ratificación.

---

## 13. Open questions del documento

Ver frontmatter. Resumen:

- **BL-AU-Q1.** Energía global, por barrio, o por agente.
- **BL-AU-Q2.** Cuándo entran las automatizaciones "envenenadas".
- **BL-AU-Q3.** Pausar sin eliminar como gesto jugable.
- **BL-AU-Q4.** ¿Hay automatizaciones que se completan sin entender del todo?
- **BL-AU-Q5.** Métrica de optimización visible.
