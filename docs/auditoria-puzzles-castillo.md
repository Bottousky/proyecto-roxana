# Auditoría de claridad — puzzles del Castillo (Unidad 2)

**Versión:** 1.0 — jun 2026
**Autor:** Orquestador (Claude), a pedido del Director.
**Alcance:** los tres puzzles del Castillo — La Cadena (serie), Los Ramales (paralelo), El Repartidor (red).
**Disparador:** el Director reporta que "no queda claro qué se busca mostrar o experimentar" en la Cadena y los Ramales; el Repartidor gustó más.
**Decisión tomada:** rediseño completo P0+P1, empezando por la Cadena. Cada hito se aprueba antes de codear.

---

## 1. Diagnóstico — la causa raíz

Los tres puzzles son **matemáticamente correctos** (modelos auditados) pero **pedagógicamente apagados**. La didáctica establecida de circuitos converge en dos palancas que nuestros bancos invierten:

### 1.1. Liderar con el BRILLO, no con el número

Toda la literatura enseña corriente usando el **brillo de la lámpara como proxy visible** — el estudiante razona "cuál brilla más" y *después* confirma con instrumento. PhET muestra brillo + flujo primero, medidor después. Nuestros bancos hacen al revés: el número "Río: X" **es** el contenido y el brillo es decoración. Por eso el puzzle se lee como una caja de input abstracta con tema, no como un experimento.

- Brightness Rules (concepción alternativa): https://www.researchgate.net/publication/231047350_The_'Brightness_Rules'_alternative_conception_for_light_bulb_circuits
- PhET Circuit Construction Kit DC: https://phet.colorado.edu/en/simulations/circuit-construction-kit-dc

### 1.2. Falta el bucle predecir → observar → explicar

El aprendizaje vive en la **brecha entre una predicción comprometida y la sorpresa**. Nuestros puzzles son "tocar hasta que se ponga verde" o "tildar una lista de experiencias". El jugador nunca *apuesta*, así que el resultado contraintuitivo nunca aterriza como "ajá": llega como una línea de diálogo que se dispara al completar una tarea. **Nada le pide al jugador formar una expectativa, así que nada lo sorprende.** Ésa es la causa exacta del "no se sabe qué se busca experimentar".

- Ranking tasks / Predict-Observe-Explain: https://www.physport.org/curricula/ACORN/?Deliver=1&SID=216&SFID=1018

### 1.3. Misconcepciones documentadas que debemos atacar (con prevalencia)

| Misconcepción | Prevalencia aprox. | Puzzle que la ataca |
|---|---|---|
| Corriente/voltaje confundidos | ~75% | Vocabulario Empuje/Río/Freno (fortaleza a proteger) |
| Razonamiento secuencial ("la primera lámpara brilla más", "sólo afecta aguas abajo") | ~64% | La Cadena |
| La corriente se *consume* como material | ~33% | La Cadena |
| El río se reparte parejo en un cruce sin importar los frenos (razonamiento local) | alto | Los Ramales / Repartidor |
| "Agregar caminos es gratis" | — | Los Ramales (fusible del Tronco) |

Fuentes:
- Prevalencia de misconcepciones múltiples: https://www.researchgate.net/publication/329379844_Revealing_Student's_Multiple-Misconception_on_Electric_Circuits
- Corriente vs voltaje (IOP): https://spark.iop.org/few-students-can-clearly-distinguish-ideas-electric-current-and-potential-difference

### 1.4. Por qué el Repartidor se sintió más claro

Tiene **objetivos motivados** con sabor (la forja pide río fuerte y tose hollín; la biblioteca quiere un hilo y *aplaude la penumbra*) y un espacio de decisión real (Empuje 4/8/16, donde **16 no tiene solución**). Los objetivos motivados son la razón de que se lea claro. Es el modelo al que deben aspirar los otros dos.

### 1.5. Qué conservar (fortalezas)

- **El vocabulario de tres nombres Empuje/Río/Freno** separa limpio V/I/R y ataca de frente la misconcepción más común. Protegerlo: nunca mezclar "Empuje" y "Río" en diálogo.
- **El fusible que se inmola con piedras glotonas en paralelo** enseña "los ramales le cuestan al Tronco".
- **"El error informa, nunca castiga"** — alineado con la investigación de feedback.

### 1.6. ¿Existe algo mejor ya hecho?

No en un marco narrativo. PhET es un sandbox (sin objetivo ni historia); los juegos académicos (Circuit Smart, EDUPERES/GAMERES) son quiz / pattern-matching. **El bucle predecir-observar es la pieza probada que nos falta — no la topología.**

---

## 2. Rediseño de La Cadena (serie) — HITO 1 (spec para aprobar)

**Archivo modelo:** `src/puzzles/chainModel.ts` · **Vista:** `src/puzzles/chain.ts` · **Tests:** `tests/` (reescribir)
**Flag de salida:** `solvedGalleryChain` (sin cambios)
**Firma pública:** `abrirChain(onSolved, practica)` (sin cambios → cero cambios de motor)

### 2.1. El problema concreto del puzzle actual

1. La victoria es una **lista de tareas** (`measuredSameRiver && removedLamp && addedLamp && lampCount===2`).
2. **La victoria premia la austeridad:** se gana **cortando** de 4 a 2 lámparas para que las demás brillen. La línea de Edda intenta desdecirlo, pero *las manos del jugador acabaron de hacer "quitar lámparas = mejor"*, que es justo el dogma de escasez que la unidad existe para demoler.

### 2.2. Diseño nuevo

**Lección (sin cambios de concepto):** en serie hay un solo río en todo el camino (no se gasta); los frenos se suman; cortar uno apaga todos; más empuje = todos más brillantes por igual.

**Cambio de victoria (lo que invierte la austeridad):** se gana **encendiendo las SEIS lámparas a brillo "bien"**, alcanzado **subiendo el Empuje**, nunca cortando lámparas. La Consejera dejó cuatro lámparas y un cristal débil; el jugador restaura las seis con el cristal fuerte y brillan MÁS que las cuatro de ella. El cuerpo del jugador hace "más lámparas + más empuje = todo brilla" — la tesis de la unidad, no su opuesto.

**Modelo (números cerrados):**

```
LAMP_BRAKE = 2
pushes = {4, 8, 16}        // reutiliza los cristales de la U1
lampCount ∈ [1..6], inicio 4, push inicial 8
river(push, n) = push / (LAMP_BRAKE * n)   // mismo río en todo el camino
band(river):
  river ≥ 3   → 'demasiado'   (pocas lámparas: al borde de quemarse)
  river ≥ 1.2 → 'bien'
  river ≥ 0.6 → 'tenue'
  else        → 'casi-nada'
```

Tabla de verificación:

| lámparas | push 4 | push 8 | push 16 |
|---|---|---|---|
| 2 | 1.0 tenue | 2.0 bien | 4.0 demasiado |
| 4 (inicio) | 0.5 casi-nada | **1.0 tenue (estado inicial)** | 2.0 bien |
| 6 | 0.33 casi-nada | 0.67 tenue | **1.33 bien ← ÚNICA victoria** |

→ Las seis lámparas a "bien" **sólo** se logran con el cristal 16. La lección "una fila larga necesita más empuje" queda forzada por la mecánica, sin premiar el recorte.

**Condición de victoria:** `lampCount === 6 && band === 'bien'` (es decir, 6 lámparas + push 16), con las dos predicciones ya vividas (ver abajo, garantizadas por gating diegético, no por checklist).

**Brillo primero:** las lámparas muestran su **banda** ("bien"/"tenue"/"casi nada") como lectura principal; el **número** de río sólo aparece cuando Ohm mide un tramo — y ahí su valor sirve para probar que es **idéntico en todos los puntos**.

### 2.3. Las dos predicciones (predecir → observar → explicar)

Gateadas de forma diegética (no son una lista; son el modo natural de empezar):

**Predicción 1 — antes de poder medir libremente, Ohm pregunta una vez:**
> **Ohm:** «Antes de medir: ¿dónde corre más río?»
> Botones: `[Antes de la primera lámpara]` · `[Después de la última]` · `[Igual en todos lados]`

Luego el jugador mide y descubre que es igual en todos los tramos → dispara `MEASURED_DIALOGUE` (canon existente). Si apostó "igual", Ohm reconoce la intuición; si apostó a un extremo, la sorpresa aterriza.

**Predicción 2 — antes de la primera extracción, al tocar una lámpara:**
> **Ohm:** «Si saco ésta, ¿qué les pasa a las otras?»
> Botones: `[Siguen igual]` · `[Brillan más]` · `[Se apagan todas]`

Luego se saca y se apagan TODAS → dispara `REMOVED_DIALOGUE` (canon existente). Sorpresa para quien no apostó "se apagan todas".

### 2.4. Feedback de estados (siempre informa)

- 4 lámparas + push 16 (brillan bien, pero faltan dos): *"Cuatro brillan bien… pero faltan dos en sus pedestales. La Galería entera, no media."* → empuja a restaurar las seis, peleando con "menos está bien".
- 2 lámparas + push 16 (demasiado): *"Dos lámparas solas: el río las castiga, brillan al borde de quemarse. La fila quiere compañía."* → enseña el inverso.

### 2.5. Canon nuevo a aprobar (lo escribe el Orquestador)

Las prompts de predicción (§2.3) y un **SOLVED_DIALOGUE nuevo**, porque la resolución cambió de "cortar a 2" a "encender las seis con más empuje":

> **Consejera:** «Seis lámparas. Más que las cuatro que yo dejé… y brillan MÁS, no menos. ¿Cómo?»
> **Edda:** «No ahorraba quitando. Faltaba empuje, no sobraban lámparas. En la fila el río no se reparte: lo comparten entero. Más empuje, y todas brillan a la vez.»
> **Ohm:** «Gasto en el camino: cero. Siempre fue cero.»

Líneas conservadas sin cambio: `MEASURED_DIALOGUE`, `REMOVED_DIALOGUE`, `ADDED_DIALOGUE`.
Línea de la Consejera previa a la sala (doc U2 §5: "reduje yo misma a cuatro para ahorrar") **queda y ahora paga**: es el setup de la restauración.

### 2.6. Verificación

- Modelo testeable: nuevos tests de `chainModel` (river, band, victoria 6+bien, no-victoria 2/4, flags de predicción).
- Build verde + 25 suites.
- Jugado en preview: las dos predicciones aparecen, la fila comparte río, cortar una apaga todas, la victoria sólo entra con 6 lámparas + cristal 16.

---

## 3. Ramales y Repartidor — dirección acordada (spec al llegar al hito)

- **Los Ramales:** una experiencia sola y nítida — el jugador ve el brillo de UNA rama quedar *perfectamente constante* mientras conecta/desconecta las otras (independencia hecha carne) + el golpe del fusible ("el Tronco paga la suma"). Se le quita el gesto de "acertar 3 zonas verdes arbitrarias" (que no tiene historia) y ese gesto queda reservado al Repartidor.
- **El Repartidor:** se mantiene como capstone (orquestar la red hacia objetivos motivados + elección de Empuje). Se le aplican las mismas mejoras P0 (predicción + brillo primero) como referencia de claridad para los otros.

Specs finas cuando lleguemos a cada hito.
