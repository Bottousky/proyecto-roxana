---
status: PROPOSED
authority_level: 4
version: v1
last_ratified: 2026-08-14
supersedes:
  - _reference_gdd_reboot_v1/03_BITLAND_GDD_v0.1.md (sección 17 — Riesgos; parte de sección 13 — Dirección visual; parte de sección 16 — Accesibilidad; sección 18 — Criterio de éxito)
depends_on:
  - ../../00-governance/ROXANA_GAME_DESIGN_PILLARS_v1.md
  - ../../00-governance/ROXANA_CANON_POLICY_v1.md
  - ../../00-governance/ROXANA_DESIGN_LANGUAGE_v1.md
  - ../../00-governance/ROXANA_DESIGN_REVIEW_CHECKLIST_v1.md
  - ../vision/bitland-vision_v1.md
  - ../vision/bitland-world-metaphor_v1.md
  - ../gameplay/bitland-programming-language-gameplay_v1.md
  - ../gameplay/bitland-automation-system_v1.md
  - ../gameplay/bitland-puzzle-grammar_v1.md
  - ../gameplay/bitland-mechanics-progression_v1.md
  - ../narrative/bitland-narrative-bible_v1.md
  - ../content/bitland-arc-01_v1.md
  - ../content/bitland-vertical-slice_v1.md
open_questions:
  - BL-PE-Q1 — ¿Cuántos jugadores externos son necesarios para validar el vertical slice antes de promoverlo a CANON?
  - BL-PE-Q2 — ¿Las métricas se miden con sesión grabada, con entrevistas o con telemetría?
  - BL-PE-Q3 — ¿Una hipótesis "fallida" obliga a reescribir el GDD o sólo a reintentar el slice?
  - BL-PE-Q4 — ¿La accesibilidad se valida en el primer prototipo o se difiere a una segunda iteración?
  - BL-PE-Q5 — ¿Cuál es el umbral mínimo de jugadoras y jugadores no-técnicos para considerar que el lenguaje "no es para programadores" se cumple?
---

# BITLAND — PROTOTYPE EVALUATION · v1

> Documento de autoridad nivel 4. Diseño de contenido. Define **qué se
> valida en el primer prototipo de Bitland**, cómo se mide, qué
> umbrales se exigen y qué decisiones se toman a partir del resultado.
>
> Este documento no prescribe herramientas de evaluación ni
> presupuesto. Su función es definir las **hipótesis testeables** que
> el prototipo debe responder y los **criterios de éxito** que
> decidan si Bitland sigue, cambia o se replantea.

---

## 1. Tesis de la evaluación

> Un GDD de Bitland vale lo que vale su **capacidad de predecir lo
> que pasa cuando un jugador programa en una ciudad**. La evaluación
> del primer prototipo no es "se ve bien"; es **"¿se cumplieron las
> hipótesis?"**.

Tres consecuencias:

1. Cada decisión de diseño importante va acompañada de una hipótesis
   testeable. Si una decisión no tiene hipótesis, o no es importante o
   no se ha pensado lo suficiente.
2. Un resultado de prototipo **no** convierte una hipótesis en canon.
   Sólo la ratifica o la refuta. El canon requiere ADR (Canon
   Policy §5).
3. Las hipótesis se prueban en orden. Una hipótesis temprana
   fallida puede obligar a reescribir las siguientes antes de
   testearlas.

---

## 2. Hipótesis a testear

Las hipótesis se agrupan por familia. Una hipótesis "aprobada" se
ratifica por ADR antes de pasar a CANON.

### H1 — La fantasía se sostiene

- **H1.1.** Un jugador externo completa el vertical slice y dice con
  sus palabras "yo hice que la ciudad funcionara" o equivalente.
- **H1.2.** Un jugador externo nombra al menos una *transformación
  del mundo* sin que se le pregunte explícitamente.
- **H1.3.** Un jugador externo *se detiene a observar* al menos un
  beat del slice sin que se le pida.

### H2 — La programación se siente como poder

- **H2.1.** El jugador puede predecir el resultado de su programa
  *antes* de ejecutarlo en al menos 4 de 5 intentos del slice.
- **H2.2.** El jugador modifica un programa existente (Beat 6) sin
  pedir ayuda externa.
- **H2.3.** El jugador *explica* el bug que corrigió con sus
  palabras, no con la terminología del sistema.

### H3 — La complejidad escala sin abrumar

- **H3.1.** Con 3 agentes en paralelo, el panel sigue siendo
  legible.
- **H3.2.** El jugador encuentra una tarjeta específica en menos de
  8 segundos (mediana).
- **H3.3.** Una cinta de 15 instrucciones cabe en el panel sin
  scroll horizontal.

### H4 — La metáfora es honesta

- **H4.1.** Un jugador nombra al menos 3 equivalencias
  urbana↔sistema sin que se le muestren explícitamente.
- **H4.2.** El jugador detecta un caso donde la metáfora "no
  encaja" y la nombra como signo propio, no como falla.
- **H4.3.** El jugador *no* intenta manipular el clima ni el cielo
  en el slice (afordance respetada).

### H5 — El lenguaje se aprende sin sintaxis

- **H5.1.** Un jugador no-técnico completa el slice sin abrir la
  Bitácora.
- **H5.2.** Un jugador no-técnico, al ver la entrada de Bitácora al
  final, dice "ah, eso es lo que hice", no "ahora tengo que
  aprender esto".
- **H5.3.** Un jugador con experiencia en programación *no* se
  frustra por la representación de bloques.

### H6 — El debugging es jugable

- **H6.1.** El jugador usa al menos 2 de las 4 herramientas (step,
  pause, rewind, breakpoint) en el Beat 6.
- **H6.2.** El jugador detecta el bug con la traza antes de abrir
  el programa.
- **H6.3.** El jugador no usa el reset global del sistema para
  resolver el bug.

### H7 — La automatización es legible

- **H7.1.** El jugador entiende, al ver el Terminal del Reparto
  (Beat 8), que el servicio corre solo.
- **H7.2.** El jugador puede describir qué hace el servicio en una
  frase.
- **H7.3.** El jugador *no* intenta abrir el panel del servicio
  desde el balcón (afordance respetada).

### H8 — El tiempo y la curva de dificultad son correctos

- **H8.1.** El vertical slice se completa en 15–20 min (±3 min).
- **H8.2.** El jugador no se queda atorado más de 90 s en ningún
  beat.
- **H8.3.** El jugador no termina "con energía de más": no hay
  ganas de seguir ni ganas de parar a medias. Hay un cierre
  natural.

### H9 — La accesibilidad no bloquea

- **H9.1.** Un jugador con daltonismo completa el slice sin
  depender del color.
- **H9.2.** Un jugador con baja visión puede activar
  `x0.5`/`x0.25` y completar el slice.
- **H9.3.** Un jugador con experiencia en pantallas con ruido
  auditivo puede jugar sin audio y completar el slice.

### H10 — La lore no contamina

- **H10.1.** El jugador *no* pregunta "¿qué pasó aquí?" durante
  el slice. La lore se siente presente pero no se exige.
- **H10.2.** PATCH no genera rechazo. Se lee como observador, no
  como mascota ni como profesor.
- **H10.3.** El jugador no antropomorfiza a los procesos locales
  en el slice (no se le "coge cariño" a un repartidor
  individual).

---

## 3. Forma de medición

### Métodos

| Método | Para qué |
|---|---|
| **Sesión grabada con think-aloud** | H1, H2, H4, H5, H6, H7, H10. |
| **Cuestionario post-sesión** (≤ 8 preguntas abiertas) | H1.2, H2.3, H5.2, H7.2, H10.1, H10.2. |
| **Telemetría mínima** (eventos, no datos personales) | H3, H8, H9. |
| **Entrevista breve** (10 min, semi-estructurada) | H1.1, H2.3, H4, H5. |

### Sujetos

- Mínimo **5 jugadores externos** no-técnicos (sin experiencia en
  programación).
- Mínimo **3 jugadores externos** con experiencia en
  programación.
- Mínimo **1 jugador** con perfil accesibilidad (movilidad,
  visión, oído).
- Mínimo **2 reviewers** del equipo de diseño.

### Lo que NO se mide en el primer prototipo

- Retención a 7 días.
- Monetización.
- Comparación con otros juegos del género.
- Métricas de marketing.

---

## 4. Umbrales de aprobación

### El slice se considera **aprobado** (autorizado para promover
contenido) si:

- ≥ 4 de 5 hipótesis H1, H2, H6, H7, H8 se cumplen al nivel
  definido en §2.
- H3, H4, H5, H10 se cumplen al nivel definido en §2 sin
  excepciones.
- H9 se cumple en al menos 2 de 3 perfiles.
- Ningún beat del slice genera atasco mayor a 90 s en más de 1
  jugador.
- La checklist de `ROXANA_DESIGN_REVIEW_CHECKLIST_v1.md` §2 pasa
  con 0 bloqueos.

### El slice se considera **devuelto** si:

- Una hipótesis de núcleo (H1, H2, H5) falla en más de 2
  jugadores.
- Un beat específico genera atasco sistemático.
- La UI se rompe con 3 agentes en paralelo.
- La checklist falla con 1 o más bloqueos en C1, C3, C5 o C8.

### El slice se considera **rechazado** (cambio de dirección) si:

- H1.1, H2.1, H5.1 o H6.2 fallan en más de 3 jugadores.
- La fantasía de "ciudad ejecutable" no emerge: el jugador
  describe el slice como "un editor con gráfico al fondo".
- La Bitácora se siente como clase y no como registro en más de
  2 jugadores.

---

## 5. Riesgos y plan de mitigación

| Riesgo | Hipótesis amenazada | Mitigación previa al prototipo | Mitigación durante el prototipo |
|---|---|---|---|
| El jugador lee la programación como "deber". | H1, H2, H5 | Diseño sin tutorial explícito; affordances. | Si falla, revisar el primer beat (sin cinemáticas, sin texto). |
| El IF se siente como magia. | H2, H5 | El sistema prueba 3 inputs *visiblemente*. | Si falla, agregar un cuarto input o hacer la traza del sensor más visible. |
| El REPEAT se siente atajo. | H2, H4, H5 | El jugador ve primero la cinta larga que no entra. | Si falla, reducir el número de paquetes a 30 para que la cinta larga *casi* quepa. |
| El bug del Beat 6 se siente tramposo. | H6, H10 | La traza se ofrece antes de la corrección. | Si falla, exponer la traza desde el inicio del beat. |
| El Pasillo del Reloj se siente misterioso sin propósito. | H1, H10 | La desincronización se *muestra* sin pedir arreglo. | Si falla, agregar una señal visual adicional (un proceso que se detiene). |
| El Terminal del Reparto se siente lejano. | H7, H1 | La métrica crece visiblemente. | Si falla, acercar la cámara o hacer un paneo explícito. |
| La Bitácora se siente clase. | H1, H5, H10 | Se presenta como "registro", no como lección. | Si falla, retirar la entrada y reemplazarla por un sonido + un cierre ambiental. |
| La UI se rompe con varios agentes. | H3 | Pruebas internas de carga. | Si falla, simplificar la barra de clock o reducir el número de agentes simultáneos. |
| La cámara cenital confunde a jugadores no-técnicos. | H1, H4 | Pruebas con vector cenital desde el inicio. | Si falla, ofrecer cámara isométrica como alternativa en el slice. |
| La lore se vuelve distractor. | H1, H10 | Sin cinemáticas narrativas en el slice. | Si falla, eliminar PATCH del slice (la lore puede esperar al Arco I completo). |

---

## 6. Métricas de prototipo — instrumentación mínima

> **No es telemetría invasiva.** El prototipo sólo registra eventos
> agregados, no datos personales. La instrumentación se describe en
> el documento de producción correspondiente; aquí se enumeran los
> eventos que el diseño necesita.

| Evento | Para qué |
|---|---|
| `beat_started` | Análisis de flujo. |
| `beat_completed` | Tasa de éxito por beat. |
| `step_invoked` | H6.1. |
| `pause_invoked` | H6.1. |
| `rewind_invoked` | H6.1. |
| `breakpoint_set` | H6.1. |
| `program_edited` | H3.3, H2.2. |
| `panel_legible_lost` (manual, por observador) | H3.1. |
| `reset_global_invoked` | H6.3 (debería ser 0 o muy bajo). |
| `bitacora_opened` | H5.1. |
| `bitacora_closed` | Análisis de atención. |
| `idle_time` por beat | H8.2. |

---

## 7. Cierre de prototipo y criterios de promoción

### Qué pasa después del primer prototipo

1. El equipo de revisión pasa la
   `ROXANA_DESIGN_REVIEW_CHECKLIST_v1.md` sobre el slice.
2. Si pasa, el slice se considera **autorizado para iterar** sobre
   el contenido. NO se promueve a CANON.
3. Las hipótesis ratificadas se promueven a **CANON** mediante ADR
   individual.
4. El GDD de Bitland (esta v1) se mantiene en `PROPOSED` hasta que
   las hipótesis H1, H2, H5 y H6 estén todas ratificadas.

### Qué pasa si una hipótesis falla

| Resultado | Acción |
|---|---|
| Hipótesis H*, sub-hipótesis *.1 falla en ≤ 2 jugadores | Iterar el slice; re-evaluar. |
| Hipótesis H*, sub-hipótesis *.1 falla en ≥ 3 jugadores | Replantear la sub-hipótesis; posible ADR de revisión. |
| H1, H2, H5 o H6 fallan a nivel de hipótesis | ADR de revisión mayor; el GDD puede volver a PROPOSED. |
| H4, H7, H10 fallan a nivel de hipótesis | ADR de revisión de la metáfora, automatización o lore. |
| H3, H8, H9 fallan | Iteración técnica, sin tocar lore ni diseño de sistemas. |

### Regla dura

> **Un prototipo fallido no baja el `status` de un GDD. Un prototipo
> fallido obliga a un ADR que justifique la decisión de seguir,
> cambiar o descartar.**

---

## 8. Lista explícita de decisiones que requieren ratificación (ADR)

Cualquier ratificación de hipótesis requiere un ADR. La lista
preliminar de ADRs que esta sesión *recomienda* abrir:

- **ADR候选-0001.** Ratificar H1 tras primer prototipo.
- **ADR候选-0002.** Ratificar H2 tras primer prototipo.
- **ADR候选-0003.** Ratificar H3, H4 tras primer prototipo.
- **ADR候选-0004.** Ratificar H5, H6 tras primer prototipo.
- **ADR候选-0005.** Ratificar H7, H8, H9, H10 tras primer prototipo.
- **ADR候选-0006.** Promover `bitland-arc-01_v1.md` a CANON (cuando
  aplique).
- **ADR候选-0007.** Promover el vertical slice a CANON (cuando
  aplique).
- **ADR候选-0008.** Decidir el nombre definitivo del acceso desde
  el Instituto.
- **ADR候选-0009.** Decidir el nombre definitivo de los lugares del
  Arco I.
- **ADR候选-0010.** Decidir la identidad visual del terminal de
  acceso.

> Los números son **candidatos**. El correlativo real se asigna en
> `/docs/00-governance/adr/` siguiendo `ROXANA_DOCUMENT_ARCHITECTURE_v1.md`
> §3.

---

## 9. Lo que este documento NO es

- No es un plan de producción.
- No prescribe herramientas de evaluación, ni presupuesto, ni
  equipo.
- No decide el stack técnico del prototipo.
- No es canon: es PROPOSED hasta ratificación.

---

## 10. Open questions del documento

Ver frontmatter. Resumen:

- **BL-PE-Q1.** Tamaño de la muestra de validación.
- **BL-PE-Q2.** Métodos de medición.
- **BL-PE-Q3.** Reintento vs. reescritura ante hipótesis fallida.
- **BL-PE-Q4.** Accesibilidad en el primer prototipo o en la segunda
  iteración.
- **BL-PE-Q5.** Umbral de jugadoras y jugadores no-técnicos.
