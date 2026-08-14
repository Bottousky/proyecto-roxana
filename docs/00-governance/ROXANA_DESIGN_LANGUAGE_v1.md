---
status: PROPOSED
authority_level: 1
version: v1
last_ratified: 2026-08-14
supersedes:
  - _reference_gdd_reboot_v1/00_ROXANA_GDD_GLOBAL_REBOOT_v1.md (sección 7 — capas de profundidad; sección 8 — diseño de fallos)
  - draft "Borrador — Design Language" contenido en A_ROXANA_DESIGN_CONSTITUTION.md
depends_on:
  - ROXANA_GAME_DESIGN_PILLARS_v1.md
  - ROXANA_CANON_POLICY_v1.md
open_questions:
  - GQ-1 (transversal) — la capa de formalización convive o se separa entre mundos
  - GQ-4 (transversal) — cómo se mide la transferencia entre mundos sin diluir la identidad
  - DL-Q1 — qué affordance visual mínima es exigible en puzzles no espaciales (Bitland)
  - DL-Q2 — cómo se mide "optimización" sin terminar creando métricas arbitrarias
---

# ROXANA — DESIGN LANGUAGE · v1

El lenguaje de diseño traduce los pilares en herramientas operativas. No
describe campañas ni sistemas. Define cómo el equipo debe tomar decisiones
repetibles cuando aparece una idea nueva.

Todo lo que aquí se afirma aplica a Ohmdal, Physica, Bitland y Arithmos por
igual. Las excepciones se promueven a documento de autoridad propia.

> **Estado del documento.** `PROPOSED` en v1. Es un documento de
> `authority_level` 1: deriva de los pilares (nivel 0) y de la política de
> canon (nivel 0). La promoción a `CANON` requiere un ADR firmado por
> Manuel. Véase `ROXANA_CANON_POLICY_v1.md` §5.

> **Por qué level 1 y no level 0.** Los pilares y la política declaran
> *qué* debe ser cierto. El lenguaje de diseño declara *cómo* se
> operacionaliza. Es una herramienta derivada, no una fundación; cualquier
> cambio en pilares o política puede invalidarlo.

---

## 1. Escala de interacción

Toda idea nueva, cuando corresponda, debería poder recorrerse por estos
escalones. La escala es ascendente: pasar a un escalón superior no requiere
haber pasado por los anteriores, pero **producir sólo los últimos sin
soporte en los primeros es señal de teorización prematura** (P06, P14).

1. **Percibir.** Notar que algo ocurre.
2. **Manipular.** Cambiar una variable o relación.
3. **Predecir.** Anticipar el efecto antes de que ocurra.
4. **Representar.** Leer símbolo, diagrama, número o código.
5. **Combinar.** Usar la idea junto a otras.
6. **Optimizar.** Encontrar una solución mejor.
7. **Transferir.** Reconocer la misma idea en otro contexto.

### Aplicación

- Un concepto nuevo debe poder jugarse al menos en los escalones 1, 2 y 3
  antes de que aparezca cualquier formalización.
- El escalón 4 (representación) **no es prerrequisito** para combinar u
  optimizar; un jugador puede combinar sin ver símbolos.
- El escalón 7 se evalúa de forma explícita sólo en la campaña
  integradora (P15).

---

## 2. Tipos de recompensa

Prioridad operativa. Cuando un diseño ofrezca varias recompensas posibles,
se elige la más alta de esta tabla y se justifican las que se omitan.

| # | Recompensa | Característica |
|---|---|---|
| 1 | **Transformación del mundo** | Cambia qué existe, qué funciona o qué se puede alcanzar. |
| 2 | **Nueva capacidad** | Permite al jugador hacer algo que antes no podía. |
| 3 | **Acceso** | Abre regiones, salas, mecánicas o diálogos antes cerrados. |
| 4 | **Nueva lectura del sistema** | Cambia cómo se interpreta lo que ya estaba. |
| 5 | **Narrativa** | Avanza historia, dilema, relación o misterio. |
| 6 | **Cosmético / coleccionable** | Apariencia, skin, modelo, item sin efecto sistémico. |

### Aplicación

- Prohibido convertir puntos, experiencia acumulada o estrellas en la
  recompensa dominante. Si la motivación principal del jugador es subir un
  contador, el diseño está fallando P08 y P09.
- La recompensa de tipo 1 debe ser observable, no declarada. No cuenta
  como "transformación del mundo" un cartel que dice "restaurado".
- La recompensa narrativa (5) **no** sustituye la transformación (1). Si
  una aparece sin la otra, el sistema está postergando su cierre.
- Cosméticos y coleccionables (6) son legítimos, pero su volumen no debe
  superar al de las recompensas 1–4 combinadas.

---

## 3. Tipos de tutorialización

Orden preferido. Cuando un mismo concepto pueda enseñarse por varios de estos
medios, se elige el más temprano en la tabla y se justifica cualquier
excepción.

1. **Affordance visual.** El propio espacio del mundo indica la acción.
2. **Espacio seguro.** Un entorno controlado permite probar sin
   consecuencias duras.
3. **Consecuencia.** El sistema responde de forma que el jugador infiere la
   regla.
4. **Reacción de personaje.** Un NPC reacciona al resultado, no a la
   intención.
5. **Hint contextual.** Una pista breve, local, no modal.
6. **Bitácora.** Entrada escrita, siempre **después** de la experiencia.
7. **Explicación explícita.** Texto instructivo directo. **Último
   recurso.**

### Aplicación

- La explicación explícita (7) sólo se admite cuando los seis medios
  anteriores no alcanzan. Se marca como deuda de diseño.
- La Bitácora (6) no contiene texto instructivo: registra y nombra.
- Un personaje no puede recitar teoría (P11). Su reacción es de tipo 4, no
  de tipo 7.

---

## 4. Lenguaje de dificultad

La dificultad debe crecer a partir del sistema, no de la opacidad.

### Fuentes válidas de dificultad

- **Cantidad de variables.** Más elementos, más relaciones a la vez.
- **Distancia causa–efecto.** Más pasos entre acción y consecuencia.
- **Necesidad de anticipación.** El resultado depende de leer el futuro
  del sistema, no del momento.
- **Simultaneidad.** Varios sistemas interactúan al mismo tiempo.
- **Restricciones.** Límites explícitos (componentes, tiempo, energía,
  recursos).
- **Información incompleta pero inferible.** El jugador no ve todo, pero
  puede inferir lo que falta.
- **Combinación de conceptos.** Un puzzle exige más de una idea aprendida.
- **Cantidad de soluciones posibles.** Varias respuestas válidas, cada
  una con su propio coste.
- **Optimización.** El objetivo no es "funciona", sino "funciona mejor".

### Fuentes prohibidas de dificultad

- Esconder información sin que sea inferible.
- Castigar ensayo razonable.
- Recompensar memorización sin lectura de estado.
- Castigar por no leer un diálogo obligatorio.
- Reiniciar el sistema sin diagnóstico.

### Aplicación

- Si la única manera de subir la dificultad es complicar la interfaz, el
  diseño está malogrando la curva.
- Una subida de dificultad debe documentar cuál de las fuentes válidas
  está creciendo.

---

## 5. Forma de la formalización

La formalización (símbolos, unidades, fórmulas, pseudocódigo, diagramas)
tiene tres modos posibles. No son excluyentes entre sí dentro de un mismo
mundo.

| Modo | Cuándo | Vehículo |
|---|---|---|
| **Mostrada** | El jugador la ve en la Bitácora después de evidencia suficiente. | Entradas de Bitácora. |
| **Operable** | El jugador puede invocarla como acción (p. ej. leer un instrumento con unidades). | UI diegética. |
| **Maestría** | Sólo en contenido opcional de optimización. | Retos aislados, Bitácora extendida. |

### Reglas

- Una fórmula **nunca** aparece en el camino crítico antes de su
  consecuencia observable (P02, P06).
- La formalización puede ser ignorada por un jugador que no busca
  optimización. El mundo no le niega la progresión por eso.
- La formalización no se acumula: si un concepto ya está dominado, su
  re-formalización no se repite.

---

## 6. Voz y tono del feedback

El feedback del sistema debe responder tres preguntas cuando el jugador
falla:

1. **Qué hizo** la solución propuesta, no sólo si fue correcta.
2. **Qué cambió** en el mundo como consecuencia.
3. **Qué queda disponible** como siguiente paso.

Está prohibido:

- el texto "Incorrecto" como mensaje principal;
- el reinicio opaco;
- el castigo por ensayo razonable;
- la comparación con una respuesta "modelo" como verdad única.

---

## 7. Lo que este documento NO es

- No prescribe paleta, tipografía ni estilo artístico.
- No prescribe motor, framework ni arquitectura técnica.
- No reemplaza el lenguaje de cada mundo: Ohmdal, Physica, Bitland y
  Arithmos pueden tener glosarios internos propios.
- No define copy de diálogo. La voz de cada personaje vive en la biblia
  narrativa de su mundo.
- No reemplaza a los pilares. Toda regla de este documento debe poder
  trazarse hasta al menos un pilar o hasta una decisión explícita de
  canon policy.
