---
status: PROPOSED
authority_level: 3
version: v1
last_ratified: 2026-08-14
supersedes:
  - docs/sessions/v1/_reference_gdd_reboot_v1/01_OHMDAL_GDD_REBOOT_v1.md (sección 11 — propuesta de progresión; sección 12 — curva de dificultad)
  - draft "Borrador — Progression Proposal" contenido en B_OHMDAL_PRODUCTION_GDD_SESSION.md §10, §11
depends_on:
  - docs/00-governance/ROXANA_GAME_DESIGN_PILLARS_v1.md
  - docs/00-governance/ROXANA_DESIGN_LANGUAGE_v1.md
  - docs/00-governance/ROXANA_DESIGN_REVIEW_CHECKLIST_v1.md
  - docs/20-worlds/ohmdal/vision/ohmdal-vision_v1.md
  - docs/20-worlds/ohmdal/gameplay/ohmdal-core-gameplay_v1.md
  - docs/20-worlds/ohmdal/gameplay/ohmdal-electrical-system_v1.md
  - docs/20-worlds/ohmdal/gameplay/ohmdal-puzzle-grammar_v1.md
  - docs/ohmdal-biblia/03_CURRICULUM_AND_ARCS.md
  - docs/ohmdal-biblia/05_GAME_DESIGN_DOCUMENT.md
open_questions:
  - MP-Q1 — si la "documentación" es una capacidad desbloqueada por separado o un meta-recurso disponible desde el primer puzzle
  - MP-Q2 — si la optimización (P11) entra como reto obligatorio en algún capítulo o sólo como capa opcional permanente
  - MP-Q3 — cómo se mide la "transferencia" como capacidad sin convertir el test en un puzzle adicional
  - MP-Q4 — si la progresión de Ohm (instrumentos que ofrece) debe estar atada a flags narrativos o a la comprensión demostrada en puzzles
  - MP-Q5 — si un jugador puede saltarse un capítulo sin perder la curva pedagógica (overworld abierto)
---

# Ohmdal — Progresión de mecánicas · v1

Declara **cómo se gana, cómo se demuestra y cómo se transfiere** cada capacidad jugable de Ohmdal, y **cómo crece la dificultad a lo largo de la campaña** sin recurrir a opacidad, reinicio opaco ni memorización.

> **Estado.** `PROPOSED`. Refina la tabla de capacidades del GDD canónico (`05_GAME_DESIGN_DOCUMENT.md` §"Progresión") y la articula con las 7 capas del sistema eléctrico y las 12 familias de puzzle. La promoción a `CANON` exige evidencia de prototipo.

---

## 1. Lo que la progresión NO es

- No es nivel de personaje. No hay stats, no hay XP, no hay daño que escala con la estadística.
- No es inventario acumulativo. El inventario es contextual: cambia con la región, no con el jugador.
- No es lineal obligatoria. El overworld permite revisitar regiones ya transformadas y abrir nuevas rutas por comprensión, no por nivel.
- No es权力的递增. La capacidad se gana por **comprensión demostrada**, no por tiempo de juego ni por moneda.

## 2. Las diez capacidades canónicas

Aplicación de `05_GAME_DESIGN_DOCUMENT.md` §"Progresión" y del pack P2 §10.

| # | Capacidad | Capa eléctrica | Familia de puzzle que la demuestra | Cómo se transfiere |
|---|---|---|---|---|
| 1 | **Inspección** | 0 | P1, P2 | Distinguir conexión, material, daño visible en otra sala |
| 2 | **Continuidad** | 0 | P1, P4 | Aislar ramas y falsos contactos en sistemas mayores |
| 3 | **Medición DC** | 1 | P2, P5 | Elegir magnitud, referencia y rango antes de intervenir |
| 4 | **Modelado** | 1 | P5, P11 | Predecir tensión, corriente o resistencia antes de energizar |
| 5 | **Lectura de red** | 2 | P3, P4 | Reconocer serie, paralelo y subsistemas en una red mixta |
| 6 | **Potencia y seguridad** | 3 | P5, P6 | Anticipar calor, límite y protección en una carga nueva |
| 7 | **Equivalencia** | 2–3 | P4, P11 | Sustituir una red por un modelo útil sin perder comportamiento |
| 8 | **Tiempo** | 4 | P7 | Observar carga/descarga y sincronizar (si la ficha RC alcanza V2) |
| 9 | **Documentación** | transversal | P11, P12 | Dejar esquema, valores, decisión y prueba para que un NPC repita |
| 10 | **Enseñanza** | transversal | P12 | Transferir el método a otro contexto o a otra persona |

> **Ohm** materializa instrumentos disponibles, pero no habilita una capacidad hasta que el jugador la usó y explicó. Los instrumentos **no son premios cosméticos**: cada uno modifica qué evidencia puede obtenerse. Esta regla es del GDD canónico §"Progresión" y se eleva a autoridad en este documento.

## 3. Cómo se gana una capacidad

Cada capacidad se gana por **demostración**, no por entrega. La demostración exige tres condiciones simultáneas:

1. **Acción observable:** el jugador ejecuta un puzzle que requiere la capacidad como decisión dominante.
2. **Predicción previa:** el jugador anticipa el resultado antes de energizar (en capas ≥ 1).
3. **Explicación posterior:** la entrada de Bitácora que sigue registra qué se hizo, qué se predijo y por qué.

Si falta cualquiera, la capacidad no se registra como ganada. El juego no "avanza" por presencia, sino por comprensión.

## 4. Orden recomendado de aparición

| Orden | Capacidad | Capítulo del Arco I | Puzzle de transferencia |
|---|---|---|---|
| 1 | Inspección | Prólogo | Diagnóstico de Lumen |
| 2 | Continuidad | Prólogo / Calzada | Puerta de Ohm (transferencia sin instrumento) |
| 3 | Medición DC | Calzada | Diagnóstico de Lumen (instrumento explícito) |
| 4 | Lectura de red | Calzada | Distribución del Castillo (cuando se habilite) |
| 5 | Modelado | Calzada / Castillo | Verificación antes de energizar |
| 6 | Potencia y seguridad | Castillo / Forja | Forja caliente |
| 7 | Equivalencia | Forja / Terrazas | Sustitución documentada de una red |
| 8 | Tiempo | Faro (si V2) | Pulso y sincronización |
| 9 | Documentación | transversal, desde Calzada | Dejar esquema repetible por NPC |
| 10 | Enseñanza | Epílogo | Edda enseña a otra persona |

La progresión es **acumulativa**, no exclusiva. Una vez ganada una capacidad, el jugador sigue usándola; una capacidad nunca se "pierde" pero puede no ser necesaria en un puzzle dado.

## 5. Curva de dificultad — fuentes válidas

Aplicación de DL-§4 y Checklist C6. La dificultad crece cuando el sistema exige más de uno de los siguientes:

- **Más elementos observables.** Más nodos, más cargas, más rutas.
- **Causa-efecto más distante.** La acción del jugador y la consecuencia visible están separadas por uno o más subsistemas.
- **Más estados posibles por nodo.** Cada nodo puede estar en varios estados cualitativos.
- **Restricciones explícitas.** Componentes, tiempo, energía, recursos limitados.
- **Combinación de ideas.** El puzzle exige más de una capacidad ganada.
- **Perturbaciones.** Ruido, oscilación, variación externa que el jugador debe anticipar.
- **Optimización.** El objetivo deja de ser "funciona" y pasa a ser "funciona mejor".

### Regla de oro

> Un puzzle introduce **una variable de dificultad nueva** respecto del puzzle anterior de su arco. Si dos variables se incrementan, una es combinatoria y la otra es restricción explícita. Nunca se introducen cinco componentes nuevos a la vez (pack P2 §10).

## 6. Fuentes prohibidas de dificultad

- Esconder información sin que sea inferible.
- Castigar ensayo razonable.
- Recompensar memorización sin lectura de estado.
- Castigar por no leer un diálogo obligatorio.
- Reiniciar el sistema sin diagnóstico.
- Subir la única manera de subir la dificultad es complicando la interfaz (DL-§4).

## 7. La progresión de la campaña — cuatro arcos temáticos

| Arco | Tema | Capacidades dominantes | Familias dominantes | Cierre de fantasía |
|---|---|---|---|---|
| **I — La Luz** | "puedo devolver energía estable a un lugar" | Inspección, continuidad, medición DC, modelado, lectura de red, potencia, equivalencia | P1, P2, P3, P4, P5, P6, P11, P12 | De "puedo encender algo" a "puedo diagnosticar y distribuir" |
| **II — La Marea** | "puedo medir lo que cambia" | Tiempo, modelado, equivalencia | P7, P8, P11, P12 | De "entiendo una red estable" a "sigo una variación en el tiempo" |
| **III — La Señal** | "puedo separar señal, ruido e interpretación" | Dirección, control, optimización | P8, P9, P10, P11, P12 | De "mido magnitudes" a "diseño comportamiento" |
| **IV — Las Máquinas** | "puedo producir y mover sin destruir" | Potencia, protección, tiempo, control, sistema abierto | P5, P6, P9, P10, P12 | De "reparo" a "produzco y sostengo" |

Cada arco se construye sobre las capacidades ganadas en el anterior. Las capacidades 9 y 10 (documentación y enseñanza) atraviesan todos los arcos como cierre.

## 8. Mecánicas meta — no son progresión

- **Bitácora** es transversal. Se desbloquea por comprensión, no por entrar a una sala.
- **Overworld** es contextual. Permite revisitar; no es medidor de progreso.
- **Marcador de región** es transformación observable: la luz vuelve, una ruta se abre, una comunidad retoma una tarea. Esto es recompensa, no capacidad.
- **Coleccionables** son legítimos pero subordinados a las recompensas 1–4 (DL-§2).

## 9. Riesgos y mitigación

| Riesgo | Mitigación de diseño |
|---|---|
| Jugador se atasca en un puzzle por falta de capacidad | Espacio seguro para probar; pista 1 por observación, pista 2 por comparación, pista 3 explícita opcional; NPC reacciona al resultado, no a la intención |
| Jugador avanza por inventario mágico | Validación por condición física/modelo, no por secuencia de clicks |
| Curva se vuelve opaca | Cada puzzle documenta su variable de dificultad activa y la fuente válida |
| Jugador esquiva capítulos | El overworld permite revisita; cada capítulo introduce **una** variable dominante nueva |
| Capacidad se "olvida" | La Bitácora registra la capacidad ganada; el sistema sigue exigiendo predicción antes de energizar |

## 10. Criterios de capítulo terminado (gate pedagógico)

Aplicación de `03_CURRICULUM_AND_ARCS.md` §"Gates educativos por capítulo":

- Contenidos centrales en V2 o superior.
- Existe al menos un error productivo observable y recuperable.
- El jugador predice antes de recibir el resultado crítico.
- La solución se transfiere a otra situación.
- La Bitácora diferencia evidencia, interpretación y metáfora.
- Una persona de la comunidad puede mantener lo restaurado sin el protagonista.
- Las pruebas automatizadas verifican el modelo técnico, no sólo la secuencia de UI.

## 11. Lo que este documento NO es

- No es la curva de dificultad detallada del Arco I. Ésa vive en `arc-01_v1.md`.
- No es la gramática de puzzles. Ésa vive en `puzzle-grammar_v1.md`.
- No prescribe UI, HUD ni notificación. El lenguaje de la notificación de capacidad es responsabilidad de la capa de producción.
- No es la curva comercial. La monetización no es motivación dominante (DL-§2, P08).
