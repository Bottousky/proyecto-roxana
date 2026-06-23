# Workflow: Nuevo mundo
# Invocar con: "workflow nuevo mundo: [nombre], fenómeno: [descripcion]"
#
# Este workflow orquesta la creación completa de un mundo nuevo
# desde cero hasta la primera unidad jugable.

## Fase 0 — Decisión de diseño (Director + Orquestador)

Antes de iniciar, confirmar con el Director:
1. ¿Qué mundo? (Matemática / Física / Programación / otro)
2. ¿Cuál es el fenómeno diegético central?
   (el equivalente del "río" de Ohmdal — algo visible, manipulable, que mapea al concepto)
3. ¿Cuál es la "enfermedad" del mundo? (qué forma sin comprensión conservan sus habitantes)

Sin respuesta a estas tres preguntas → no avanzar.

## Fase 1 — Diseño narrativo [Subagente: disenador]

Tareas en secuencia (cada una es una sesión separada del subagente):

### 1a. Diseño del mundo
Input: decisiones de la Fase 0 + docs/diseno-sintesis-v1.md + ruta-contenidos del mundo anterior
Output: docs/diseno-mundo-{nombre}.md

Contenido obligatorio:
- Fenómeno diegético + mapeo al concepto técnico
- Trío de personajes (medidor vivo / escéptico / guardián)
- La "enfermedad" del mundo
- Tabla de léxico: diegético / técnico / momento de conversión
- Vista de banco: cómo se ve el puzzle (equivalente del circuito de Ohmdal)
- Secuencia de unidades del Arco I (3-4 máximo para v1)

### 1b. Ruta de contenidos
Input: diseno-mundo-{nombre}.md
Output: docs/{nombre}-ruta-contenidos.md
(mapa completo del mundo, aunque solo se implemente el Arco I)

### 1c. Guion de la Unidad 1
Input: diseno-mundo + ruta-contenidos
Output: docs/unidad-1-{nombre}.md
(diálogos textuales, secuencia de escenas, comportamiento de puzzles, entradas de Bitácora)

### 1d. Plan de implementación
Input: guion U1 + estandar-implementacion.md
Output: docs/plan-implementacion-u1-{nombre}.md
(hitos M0-MN con spec, tabla de ruteo de modelo, plantilla de prompt)

## Fase 2 — Aprobación de diseño (Director)

El Director lee el guion de la U1 como si fuera el jugador y responde:
- ¿El fenómeno es visceralmente claro sin explicación?
- ¿Hay algún puzzle donde la única salida sea leer la Bitácora?
- ¿El léxico diegético aguanta 3 unidades sin volverse ridículo?

El Orquestador espera aprobación explícita antes de pasar a Fase 3.
**Cero código sin aprobación del Director.**

## Fase 3 — Implementación por hitos [Subagente: implementador + auditor]

Para cada hito del plan-implementacion:

```
1. Orquestador determina nivel del hito (mecánico/estándar/delicado)
2. Orquestador selecciona modelo ejecutor según tabla de ruteo
3. Subagente implementador ejecuta el hito con la spec
4. Subagente auditor verifica (mecánica + narrativa + preview)
5. Si ok → proponer commit al Director
6. Si no → escalar modelo o corregir spec
```

Hitos en orden de dependencia. Nunca en paralelo sobre los mismos archivos.

## Fase 4 — Assets visuales [Paralela a Fase 3, no bloqueante]

El Subagente disenador produce:
- Brief visual: paleta, referencias de mood, descripción de cada personaje
  (cómo se mueve, qué expresa físicamente)

Guardar en: docs/assets/{nombre}-brief-visual.md

Para generación:
- ChatGPT Plus: iteración creativa con juicio visual (conversación manual)
- OpenAI API: bulk/series de tiles o variaciones (via script bash)

Cuando haya consensus de look → prompt canónico en docs/assets/{nombre}-prompt-canonico.md
Los assets reemplazan formas planas una vez que el greybox está auditado.

## Criterio de finalización

La Fase 3 termina cuando:
- Todos los hitos M0-MN tienen commit con [build ✓] [tests ✓] [preview ✓]
- El E2E completo del plan de implementación pasa (checklist manual)
- La Bitácora tiene todas sus entradas completas y en dos capas
- npm run build verde en main

Después: mismo workflow para Unidad 2 del mismo mundo.
