---
status: PROPOSED
authority_level: 3
version: v1
last_ratified: 2026-08-14
supersedes:
  - docs/sessions/v1/_reference_gdd_reboot_v1/01_OHMDAL_GDD_REBOOT_v1.md (sección 8 — sistema eléctrico jugable; sección 9 — capas)
  - draft "Borrador — Sistema eléctrico" contenido en B_OHMDAL_PRODUCTION_GDD_SESSION.md §6
depends_on:
  - docs/00-governance/ROXANA_GAME_DESIGN_PILLARS_v1.md
  - docs/00-governance/ROXANA_DESIGN_LANGUAGE_v1.md
  - docs/20-worlds/ohmdal/vision/ohmdal-vision_v1.md
  - docs/20-worlds/ohmdal/gameplay/ohmdal-core-gameplay_v1.md
  - docs/ohmdal-biblia/14_GLOSSARY.md
open_questions:
  - ES-Q1 — cuántas capas del sistema eléctrico debe atravesar el slice del Arco I sin saturar la curva pedagógica
  - ES-Q2 — si el "diodo" como elemento jugable requiere una representación espacial específica o admite un equivalente diegético (válvula, compuerta de un solo sentido)
  - ES-Q3 — si la capa 4 (tiempo) entra en el Arco I sólo como ritmo observable o si exige un capacitor como recurso explícito
  - ES-Q4 — cómo se representa la "reparación incompleta" (limpieza, ajuste, sustitución) sin multiplicar componentes en escena
  - ES-Q5 — si la incertidumbre de medición debe ser un valor jugable (rango visual) o un parámetro del modelo
  - ES-Q6 — si el jugador puede "ver" la topología durante un puzzle (overlay persistente) o sólo cuando activa el modo Lectura de red
---

# Ohmdal — Sistema eléctrico abstracto · v1

Acota el sistema eléctrico jugable en **siete capas crecientes (0–6)**. Cada capa introduce decisiones nuevas, no más números. La progresión sigue la pedagogía de la **biblia educativa** (`02_EDUCATIONAL_CONTENT_BIBLE.md`): fenómeno → manipulación → consecuencia → hipótesis → formalización.

> **Estado.** `PROPOSED`. Deriva de la visión y del core gameplay. La autoridad superior es la constitución (nivel 0). La promoción a `CANON` requiere validación en prototipo y ADR firmado por Manuel.

> **Principio rector.** No simulamos SPICE. Construimos un sistema coherente y pedagógicamente transferible. Cuando un fenómeno real no puede representarse con la fidelidad mínima necesaria, se documenta el límite y se prefiere una metáfora diegética explícita a un cálculo incorrecto.

---

## 1. Capas y decisiones que habilitan

| Capa | Nombre | Decisión nueva | Aparece en |
|---|---|---|---|
| **0** | Estado | ¿Hay energía aquí? ¿Continuidad? ¿Dirección? | Prólogo y Calzada |
| **1** | Magnitudes | ¿Cuánta tensión, cuánta corriente, cuánta oposición? | Calzada |
| **2** | Topología | ¿Serie, paralelo, nodo, reparto? | Calzada y Castillo |
| **3** | Potencia y protección | ¿Cuánta energía útil, cuánto calor, cuándo proteger? | Forja y Castillo |
| **4** | Tiempo | ¿Cuándo cargar, cuándo descargar, cómo temporizar? | Faro (si la ficha RC alcanza V2) |
| **5** | Dirección y control | ¿Por dónde puede circular y quién lo decide? | La Marea / La Señal |
| **6** | Sistema | Sensores, actuadores, motores, PWM, lógica, cruces con Bitland | La Decisión / El Empalme |

Cada capa se introduce **con su primera decisión**, no con un menú de magnitudes. El orden importa: no se salta a la capa N+1 antes de que el jugador haya ganado la decisión característica de N (P14, P02).

## 2. Capa 0 — Estado

**Decisión nueva:** el jugador aprende a distinguir "hay camino" de "no hay camino" sin medir nada.

**Variables cualitativas:**

- `alimentado` / `no alimentado` (presencia de energía en un nodo);
- `continuidad` (existencia de trayectoria conductora bajo el método del instrumento);
- `polaridad` (sentido efectivo del flujo cuando aplica);
- `carga activa` (presencia de un consumidor en el tramo).

**Reglas del modelo:**

- Cualquier trayectoria entre dos nodos calificados como `alimentado` se evalúa con un instrumento de continuidad, no por inspección visual.
- Un circuito abierto no se representa como "obstáculo físico": se representa como un componente ausente, un cable cortado o un interruptor abierto que el jugador ve y designa.
- La polaridad sólo se hace relevante cuando el sistema lo exige (capa 5).

**Afordance visible:**

- Líneas conductoras con flujo de partículas o color.
- Conductores en estado `sin energía` con tono apagado.
- Cargas activas: motores que giran, filamentos que brillan, timbres que suenan.

**Límite declarado:** la continuidad observada con un método no garantiza funcionamiento bajo carga (capa 1). El sistema puede "tener continuidad" y aun así no encender.

## 3. Capa 1 — Magnitudes

**Decisión nueva:** el jugador aprende que dos puntos pueden tener una diferencia medible y que la lectura depende del instrumento, la referencia y el rango.

**Magnitudes canónicas (DC canónico en el Arco I):**

| Magnitud | Símbolo | Unidad | Instrumento canónico |
|---|---|---|---|
| Tensión | `V` | voltio (`V`) | voltímetro (modo Intervención) |
| Corriente | `I` | amperio (`A`) | amperímetro (en serie) |
| Resistencia | `R` | ohmio (`Ω`) | óhmetro o derivación por ley de Ohm |

**Reglas del modelo:**

- Cada magnitud se lee entre dos puntos. El jugador elige referencia y rango. Elegir mal el rango produce lectura fuera de escala o saturada, no castigo.
- La ley de Ohm se introduce **después** de dos magnitudes medidas (P02, P06). En el camino crítico del Arco I, la fórmula aparece sólo cuando la herramienta ya no es opción.
- El modelo es ideal hasta donde el sistema lo exige. No se simula ruido térmico, deriva de referencia ni tolerancia de componentes en el camino crítico; esos fenómenos viven en la capa 6 o en la escuela opcional.

**Afordance visible:**

- Instrumentos con aguja, dígito o trazo.
- Unidades en pantalla, accesibles y configurables.
- Modo "sin unidades" (conceptual) y modo "con unidades" disponibles desde el mismo selector (canónico en `05_GAME_DESIGN_DOCUMENT.md` §"Matemática adaptativa").

**Límite declarado:** el modelo no es SPICE. Componentes con tolerancia, dependencia térmica o coeficientes no lineales no entran hasta la capa 5 ó 6.

## 4. Capa 2 — Topología

**Decisión nueva:** el jugador aprende a reorganizar la misma red en serie o paralelo y a leer la consecuencia sobre magnitudes y operación.

**Conceptos canónicos:**

- **Serie:** elementos que comparten una trayectoria sin derivaciones.
- **Paralelo:** elementos conectados entre los mismos pares de nodos.
- **Nodo:** conjunto de puntos al mismo potencial dentro de un modelo ideal.
- **Reparto:** consecuencia observable de la conservación en nodos y lazos.

**Reglas del modelo:**

- La topología es **físicamente reconfigurable** en escena cuando la escena lo permite (interruptores, conmutadores, puentes). No se pide al jugador dibujar un diagrama abstracto en el camino crítico.
- Las leyes de Kirchhoff se formalizan en la Bitácora cuando se han medido dos ejemplos cualitativos. En el camino crítico del Arco I se introduce primero la **consecuencia observable** (lo que cambia) y luego la **relación** (qué magnitudes se conservan).
- Una red mixta (serie + paralelo) se modela con nodos explícitos, no como caja negra.

**Afordance visible:**

- Rutas que se pueden designar y reorganizar.
- Diferencia visual entre conexión en serie y en paralelo (una sola línea con componentes; varias líneas que convergen).
- La consecuencia de reorganizar se ve antes de formalizar: motor cambia de velocidad, luz cambia de brillo, timbre cambia de ritmo.

**Límite declarado:** topologías que excedan tres o cuatro nodos en escena requieren close-up o focalización de cámara. El overworld nunca exige topología compleja.

## 5. Capa 3 — Potencia y protección

**Decisión nueva:** el jugador aprende que "funciona" no es suficiente; una instalación puede entregar energía y aun así dañar el sistema o la comunidad.

**Conceptos canónicos:**

- **Potencia eléctrica:** `P = V · I` (DC). Ritmo de transferencia de energía. Unidad: watt (`W`).
- **Energía:** `E = P · t`. Capacidad transferida durante un intervalo. Unidad: joule (`J`) o watt-hora (`Wh`).
- **Efecto Joule:** conversión de energía eléctrica en térmica.
- **Protección:** dispositivo o estrategia que limita consecuencia de condición anormal.

**Reglas del modelo:**

- Toda carga tiene un límite declarado. Operar por encima del límite **degrada con observación**: humo, decoloración, fractura, olor (visual y sonoro), no daño irreversible.
- Las protecciones **aportan evidencia** cuando actúan. No son un castigo: son un mensaje del sistema.
- Dimensionar una fuente para una carga requiere estimar antes de calcular. La estimación se premia con una partida de energía útil visible; el cálculo exacto se premia con optimización.

**Afordance visible:**

- Disipación térmica como cambio de color y vibración.
- Protecciones con indicador de estado y tiempo desde la última actuación.
- Lectura de potencia en el instrumento cuando el jugador lo solicita.

**Límite declarado:** eficiencia, factor de potencia y armónicos no entran hasta capas 5–6. El modelo es DC ideal con pérdidas resistivas.

## 6. Capa 4 — Tiempo

**Decisión nueva:** el jugador aprende que un sistema puede almacenar energía y devolverla en otra escala temporal, y que la sincronización importa.

**Conceptos canónicos:**

- **Capacitor:** almacena carga separada y energía en un campo eléctrico; no "guarda corriente".
- **Constante de tiempo:** escala temporal característica de una respuesta de primer orden.
- **Pulso:** variación breve respecto del estado estable.
- **Retardo:** diferencia temporal entre causa y efecto esperada.

**Reglas del modelo:**

- El capacitor entra **sólo** si la ficha RC alcanza V2 en la biblia educativa. Si no, se reemplaza por una culminación DC validada (cf. `03_CURRICULUM_AND_ARCS.md` §"Juego base: La Luz" → Capítulo 4).
- La metáfora del agua se **declara limitada** explícitamente en la Bitácora la primera vez que aparece un capacitor. La carga no es agua; la energía no se "gasta al pasar" (C09 del canon audit).
- La constante de tiempo se introduce por observación (cuánto tarda en alcanzar X% del valor final) antes que por fórmula.

**Afordance visible:**

- Curva de carga y descarga como trazo visible.
- LED que se enciende cuando el capacitor llega a un umbral.
- Pulso generado al cruzar un umbral de tensión.

**Límite declarado:** inductores, magnetismo y AC quedan para la Marea (capa 5). Esta capa no los habilita.

## 7. Capa 5 — Dirección y control

**Decisión nueva:** el jugador aprende que un componente puede decidir por dónde y cuándo puede circular la corriente, y que esa decisión es gobernable.

**Conceptos canónicos:**

- **Diodo:** conducción en un sentido; caída de tensión directa; bloqueo inverso.
- **Transistor:** señal pequeña que gobierna flujo mayor; corte y saturación.
- **Conmutación:** cambio de estado entre dos rutas.
- **Señal:** variación que representa información.

**Reglas del modelo:**

- El diodo se introduce por **consecuencia** (un motor gira en un sentido y no en otro) antes que por símbolo.
- El transistor se introduce por **consecuencia** (una señal pequeña abre una carga grande) antes que por analogía con un interruptor.
- La polaridad y la dirección dejan de ser accesorios: se vuelven restricciones explícitas.

**Afordance visible:**

- Válvula o compuerta de un solo sentido en el mundo diegético.
- Relé o transistor como punto de control físico.
- LED indicador de dirección de flujo.

**Límite declarado:** amplificación, realimentación y op-amps se reservan para capas 6 y para `La Señal` (Arco III).

## 8. Capa 6 — Sistema

**Decisión nueva:** el jugador aprende que un sistema completo coordina sensores, actuadores, lógica y energía, y que esa coordinación puede transferirse a otro mundo (Bitland) sin perder identidad.

**Conceptos canónicos:**

- **Sensores:** transductores que convierten magnitud física en señal eléctrica.
- **Actuadores:** transductores que convierten señal eléctrica en efecto físico.
- **Motores:** actuadores rotativos; requieren fuente, protección y control.
- **PWM:** modulación por ancho de pulso como técnica de control.
- **Control lógico:** compuertas y secuencias que deciden un comportamiento.

**Reglas del modelo:**

- Esta capa habilita el cruce con Bitland: la lógica puede ser un sistema programable. La forma del cruce se decide en `El Empalme` (Arco VII), no antes (P12, P15).
- La calibración y la incertidumbre entran como parte del sistema. Un sensor sin calibración se modela explícitamente como lectura incierta.
- El sistema nunca se vuelve caja negra: cada decisión sigue siendo legible para un jugador que mira y mide.

**Afordance visible:**

- Diagrama vivo del sistema (modo Lectura de red ampliado) con sensores, actuadores y rutas lógicas.
- Control como gesto: mover una pieza, ajustar un umbral, configurar una rampa.

**Límite declarado:** redes, RF y modulación compleja viven en `La Voz` (Arco VI).

## 9. Reglas transversales del sistema

### 9.1 Fidelidad mínima

Cada capa se modela con la **fidelidad mínima necesaria** para ser coherente y pedagógicamente transferible. Cuando una capa exige más fidelidad, se documenta y se eleva a ADR.

### 9.2 Decisión antes que número

Cada variable introducida en escena debe **cambiar qué puede hacer el jugador** (P14). Si sólo agrega nomenclatura, está sobre-teorizando.

### 9.3 Metáfora diegética con límite explícito

Toda metáfora que ayude a entrar al fenómeno debe declarar **dónde deja de ser válida** (C09 del canon audit). El agua como analogía de carga se admite en la Calzada con su límite; en capas 4–6 se sustituye por lectura directa.

### 9.4 Inocuidad de operación

Ningún escenario de capa 0–3 expone al jugador a tensión o corriente real. Las magnitudes en escena son ficticias, no tomadas de valores de red domiciliaria. La calibración de seguridad se documenta en la ficha V0–V4 de cada contenido.

### 9.5 Validación por condiciones, no por solución fija

Una instalación se acepta cuando cumple:

- trayectoria completa con retorno verificado;
- magnitudes dentro de rango y de límite;
- protecciones dimensionadas;
- ninguna carga en sobrecarga;
- mantenibilidad local (un NPC puede repetir el procedimiento).

La elegancia, la economía de componentes y la optimización premiable son **méritos adicionales**, no requisitos.

## 10. Capacidades desbloqueadas por capa

Aplicación de `mechanics-progression_v1.md` (resumen operativo):

| Capa | Capacidad nueva | Cómo se gana |
|---|---|---|
| 0 | Inspección y continuidad | Cerrar el primer circuito completo en el slice |
| 1 | Medición DC con referencia y rango | Habilitar el primer instrumento |
| 2 | Lectura de red (serie/paralelo) | Diagnosticar una red mixta |
| 3 | Potencia, protección y dimensionamiento | Restaurar una instalación que dispara protección |
| 4 | Tiempo y almacenamiento | Sólo si la ficha RC alcanza V2 |
| 5 | Dirección y control | Activar una máquina con diodo/transistor |
| 6 | Sistema, sensores, actuadores | Restaurar un sistema lógico |

## 11. Riesgos abiertos y mitigación

| Riesgo | Mitigación de diseño | Decisión a tomar |
|---|---|---|
| Saturar la curva pedagógica con demasiadas capas | El Arco I sólo exige 0–3 firmes. Las capas 4–6 viven en arcos posteriores. | Confirmar en `arc-01_v1.md` qué capas se exigen. |
| Confundir al jugador con magnitudes y unidades demasiado pronto | Modo conceptual sin unidades disponible desde el principio | Modo conceptual como defecto en el primer cuarto de la campaña |
| Inconsistencia entre magnitudes en escena y en la Bitácora | Un solo modelo técnico: la Bitácora lee del mismo sistema | Verificación automática en tests de modelo |
| Metáfora hidráulica mal internalizada | Bitácora registra explícitamente los límites de la metáfora | Lección de Lección de Metáfora como entrada de Bitácora al pasar la Calzada |

## 12. Lo que este documento NO es

- No es un manual de electrónica. No enseña la materia; define cómo la materia se representa en el mundo.
- No es una simulación. El sistema se calibra para ser **jugable y pedagógicamente transferible**, no físicamente exacto.
- No prescribe la presentación visual. Cómo se ven los nodos, los cables y los instrumentos vive en la dirección visual canónica.
- No prescribe la implementación. La capa de runtime vive en `src/` y en el `START_HERE.md`.
