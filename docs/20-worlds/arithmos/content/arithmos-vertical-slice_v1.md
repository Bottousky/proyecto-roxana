---
status: PROPOSED
authority_level: 4
version: v1
last_ratified: 2026-08-14
supersedes:
  - _reference_gdd_reboot_v1/04_ARITHMOS_GDD_v0.1.md (sección 12 — vertical slice, reescrito y reclasificado)
  - _reference_gdd_reboot_v1/04_ARITHMOS_GDD_v0.1.md (sección 14 — prueba del vertical slice, reescrita como criterios de éxito formales)
depends_on:
  - ../../00-governance/ROXANA_GAME_DESIGN_PILLARS_v1.md
  - ../../00-governance/ROXANA_CANON_POLICY_v1.md
  - ../../00-governance/ROXANA_DESIGN_LANGUAGE_v1.md
  - ../../00-governance/ROXANA_DOCUMENT_ARCHITECTURE_v1.md
  - ../vision/arithmos-vision_v1.md
  - ../vision/arithmos-world-rules_v1.md
  - ../gameplay/arithmos-transformation-system_v1.md
  - ../gameplay/arithmos-representation-system_v1.md
  - ../gameplay/arithmos-puzzle-grammar_v1.md
  - ../gameplay/arithmos-mechanics-progression_v1.md
  - ../narrative/arithmos-narrative-bible_v1.md
  - ./arithmos-arc-01_v1.md
open_questions:
  - A-VS-Q1 — ¿El vertical slice se construye en 2D, isométrica 2.5D, o mockup? (recomendación: 2.5D isométrica para validar la affordance)
  - A-VS-Q2 — ¿El vertical slice se prueba con jugadores nuevos al género o con jugadores con experiencia previa en puzzles?
  - A-VS-Q3 — ¿La "primera entrada" desde el Instituto entra en el vertical slice o se documenta como pre-requisito?
  - A-VS-Q4 — ¿Qué métrica de "diversión" se usa si A-VS-Q-siguiente no se resuelve? (RC C8: debe sobrevivir sin etiqueta "educativo")
  - A-VS-Q5 — ¿El vertical slice se entrega con la cámara definitiva o con una cámara provisional, dado que la cámara es A-V-Q1?
---

# ARITHMOS · VERTICAL SLICE · v1

> **Estado del documento.** `PROPOSED` en v1. Nace de la sesión P5.
> Es `authority_level` 4 (diseño de contenido).

> **Relación con el Arco I.** El vertical slice es una **sub-muestra
> jugable** del Arco I, no un arco aparte. Se construye para
> **validar la regla fundamental de transformación** y el verbo
> nuclear antes de producir el arco completo.

---

## 1. Datos básicos del vertical slice (PROPOSED)

- **Duración objetivo:** 15–20 minutos de juego.
- **Región:** el **borde de entrada al Taller del Cartógrafo** y
  el **umbral de la Plaza de las Medidas**. (No el interior de
  la Plaza; sólo su primer mecanismo dual.)
- **Operaciones que se introducen:** C1.1, C1.2, C1.3; intro
  C1.5.
- **Familias que aparecen:** A1, A3 (introducción).
- **Representaciones:** R1, R4; R2 sólo al final, en la Bitácora.
- **Cierre de ciclo (P08):** un mecanismo (puente o fuente)
  recupera su equivalencia; el mundo cambia visiblemente.

---

## 2. Objetivos del vertical slice

1. **Validar la regla fundamental de transformación.** El
   jugador debe *experimentar* que cambiar de representación
   (mismo peso, otra forma) produce una consecuencia espacial.
2. **Validar el verbo nuclear.** El jugador debe *sentir* que
   su acción es **transformar**, no *contestar*.
3. **Validar el feedback geométrico.** El jugador debe *ver*
   qué se rompe cuando una transformación no conserva el
   invariante activo.
4. **Validar la affordance.** El jugador debe encontrar la
   sombra equivalente y el hueco con silueta *sin texto
   instructivo*.
5. **Validar la no dependencia de cuestionarios.** El vertical
   slice *no contiene* un solo menú de opciones ni una sola
   pregunta. La interacción es exclusivamente manipulación.
6. **Validar la curva de aprendizaje de C1.** El jugador debe
   llegar al final del slice dominando `agrupar`, `separar` y
   `duplicar`, y *sin haber visto todavía* la notación.

---

## 3. Escenario

### 3.1. Localización

- **Entrada al Taller del Cartógrafo** (sin pasar por el
  Aula de Matemática; ese pre-requisito se documenta aparte).
- **Puente calibrado a masa 12** (Capítulo 0 del Arco I).
- **Una balanza de dos lados** (Capítulo 1 incipiente).
- **Mecanismo dual de la Plaza de las Medidas** (sólo su
  primer par; Capítulo 2 incipiente).

> Los nombres exactos de los mecanismos se ajustan en
> prototipo.

### 3.2. Recursos

- 6 piedras de masa 2.
- 4 piezas "masa 3" (sólo aparecen si el jugador llega al
  mecanismo dual).
- 2 mecanismos de plataforma que aceptan masa 12 con
  siluetas específicas (4·3 o 6·2 o 3·4 o 2·6).
- 1 mecanismo dual (entrada izquierda y entrada derecha).
- 1 balanza simple (mismo peso en ambos lados = nivelada).

---

## 4. Secuencia de beats (10 beats, 15–20 minutos)

> La duración por beat es estimativa. Se mide en test de
> usuario.

| Beat | Objetivo pedagógico | Acción del jugador | Cosa observable |
|---|---|---|---|
| 1. Llegada | Orientarse | Caminar, mirar, reconocer el puente | El puente aparece como estructura. No hay texto. |
| 2. Manipular piedras | `agrupar` (C1.1) | Tomar dos piedras de masa 2 y combinarlas en una de masa 4 | La piedra cambia de silueta. La sombra equivalente aparece. |
| 3. Predecir | Inferir la siguiente acción | Combinar otra vez para llegar a tres piedras de masa 4 | El jugador anticipa la silueta del segundo acceso. |
| 4. Equivalencia 1 (A1) | Conservación | Colocar tres piedras de masa 4 en el segundo acceso del puente | El puente se mueve. El jugador ve la misma masa, otra forma. |
| 5. Equivalencia 2 (A3) | Mismo valor, otra forma | Probar seis piedras de masa 2 en el primer acceso | El primer acceso se activa. El puente se mueve. El jugador ve que *dos* formas producen *una* consecuencia. |
| 6. Balanza | `separar` (C1.2) | Equilibrar la balanza: 5+3 a la izquierda, 8 a la derecha | El jugador ve que puede reagrupar y separar; la cantidad total no cambia. |
| 7. Mecanismo dual (A3) | Múltiples soluciones | Elegir entre alimentar el mecanismo izquierdo con 3·4 o el derecho con 6·2 | El mecanismo se activa con ambas elecciones. Aparece una ruta nueva. |
| 8. Cierre de ciclo (P08) | Restauración visible | La fuente cercana vuelve a funcionar; la Plaza de las Medidas recupera su equivalencia inicial | El mundo cambia. Hay un sonido, un movimiento, una sombra. |
| 9. Notación aparece (P02, P06) | Capa de formalización | La Bitácora muestra, *después*, una vista de equivalencia: 12 = 3·4 = 6·2 | El jugador ve por primera vez un símbolo. Lo lee como mapa, no como instrucción. |
| 10. Gancho | Próximo arco | Aparece un mecanismo nuevo (input + output) que el jugador todavía no puede comprender | El jugador lo mira. No intenta resolverlo. |

---

## 5. Criterios de éxito del vertical slice

> Esta sección convierte la "Prueba" del pack en criterios
> formales. Cada criterio tiene un test verificable.

### 5.1. Criterios cualitativos

| # | Pregunta | Test verificable |
|---|---|---|
| C-VS-1 | ¿Transformar es divertido? | ≥ 80% de los testers reporta que "transformar" fue la acción más disfrutada del slice (encuesta Likert 1–5, ≥ 4). |
| C-VS-2 | ¿La matemática se siente material? | ≥ 80% de los testers reporta que "los números se sentían como cosas" (encuesta Likert 1–5, ≥ 4). |
| C-VS-3 | ¿El jugador descubre equivalencia sin cuenta escolar? | Observación: el jugador prueba al menos dos configuraciones distintas antes de quedarse. ≥ 70% de los testers. |
| C-VS-4 | ¿Las representaciones son legibles? | El jugador identifica la sombra equivalente y el hueco con silueta sin ayuda externa en ≥ 80% de los casos. |
| C-VS-5 | ¿El isométrico aporta? | Comparativa 2D vs. 2.5D en un sub-grupo: ≥ 60% prefiere 2.5D (esto valida A-V-Q1). |
| C-VS-6 | ¿Varias soluciones no confunden? | ≥ 60% de los testers completa el slice *sin pedir* "cuál es la correcta". |

### 5.2. Criterios cuantitativos

| # | Métrica | Umbral |
|---|---|---|
| C-VS-7 | Tasa de compleción | ≥ 80% completa el slice sin ayuda. |
| C-VS-8 | Tiempo medio de compleción | 12–22 minutos (margen para jugadores inexpertos). |
| C-VS-9 | Recurrencia de undo | Mediana ≤ 1 undo por beat (el slice es legible sin ensayo-error masivo). |
| C-VS-10 | Tasa de solución múltiple | ≥ 50% de los testers encuentra al menos una solución alternativa. |
| C-VS-11 | Recurrencia de feedback "roto" | ≥ 60% de los testers experimenta al menos una vez un fallo geométrico y *entiende por qué se rompió*. |
| C-VS-12 | Recurrencia de consulta a la Bitácora | ≥ 70% de los testers abre la Bitácora al menos una vez *después* del beat 8. |

### 5.3. Criterios de canon (RC C1–C12)

El vertical slice debe pasar la Design Review Checklist
(`../../00-governance/ROXANA_DESIGN_REVIEW_CHECKLIST_v1.md`) §2
sin bloqueos. Cualquier "No" en una pregunta crítica
devuelve el slice a prototipo.

---

## 6. Lo que el vertical slice NO prueba

> Esto es importante para no inflar las expectativas del
> primer prototipo.

- **No prueba la familia A2 (descomposición) con factorización
  múltiple.** Eso se valida en el siguiente paso de prototipo.
- **No prueba la familia A4 (balance) con restricciones
  múltiples.** Sólo una balanza simple.
- **No prueba la familia A5 (escala) con razones no
  triviales.** Eso es Arco II.
- **No prueba la familia A6 (restricción geométrica).** Eso
  es Arco II.
- **No prueba la curva de operaciones C2 o C3.** Sólo C1.
- **No prueba la cámara definitiva.** Se acepta una cámara
  provisional, dado que la decisión de cámara es A-V-Q1.
- **No prueba el paso desde el Instituto.** Eso se prueba en
  P6 (metagame).
- **No prueba la lore completa.** Sólo los elementos mínimos
  del Taller del Cartógrafo y la Plaza de las Medidas.

---

## 7. Riesgos del vertical slice

1. **El feedback geométrico no es legible.** Si el jugador
   no entiende por qué una transformación falló, se
   rediseña la affordance. Mitigación: prototipar la
   affordance tipo 1 y tipo 2 *antes* del slice completo.
2. **El "puente" se siente como un ejercicio con respuesta
   única.** Si la sombra equivalente no comunica la
   multiplicidad, se rediseña la geometría del puente.
3. **La Bitácora llega antes de tiempo.** Si la notación
   aparece en el beat 5 o antes, se está enseñando teoría.
   Se revisa la curva de beats.
4. **El jugador busca "la" respuesta.** Si el slice
   comunica solución única, se rediseña el mecanismo
   dual para que dos configuraciones sean visualmente
   distintas.
5. **La cámara no funciona.** Si la cámara 2.5D provisional
   no permite leer la silueta, se reconsidera A-V-Q1 por
   ADR.

---

## 8. Plan de prototipo

### 8.1. Entregables del prototipo

- Una escena 2.5D isométrica del Taller del Cartógrafo con
  los mecanismos de los beats 1–10.
- Las affordances tipo 1 y tipo 2 implementadas como mínimo.
- Un undo ilimitado.
- Una Bitácora mínima con la capa de observación y la capa
  de formalización.
- Un NPC "Tessa" (o el personaje equivalente) con tres
  reacciones y sin diálogo instructivo.
- Telemetría: clicks por beat, tiempo por beat, undo por
  beat, apertura de Bitácora.

### 8.2. Plan de test

- 8–12 testers.
- Mitad con experiencia en puzzles, mitad sin experiencia.
- Sin交待 "esto es un juego educativo". El tester entra con
  el encuadre "esto es un juego de exploración".
- Encuesta Likert 1–5 al final.
- Entrevista corta de 5 minutos sobre los criterios C-VS-1
  a C-VS-6.

### 8.3. Decisión post-test

- Si ≥ 6 de 12 criterios C-VS-1 a C-VS-12 se cumplen, el
  slice se valida como **EXPERIMENTAL** (no CANON; el
  status del slice es siempre PROPOSED, pero el resultado
  del test es evidencia para ascender lore o mecánicas a
  CANON).
- Si < 6, se devuelve a prototipo con lista de bloqueos.

---

## 9. Lo que este documento NO es

- No es un level design final. El slice se construye con un
  mockup hasta que el GDD de campaña esté ratificado.
- No prescribe motor, framework ni lenguaje.
- No prescribe paleta ni estilo artístico.
- No convierte el slice en un *demo* promocional. Es un
  test, no un marketing asset.
- No es un temario. No se mapea contra un currículo.
