---
status: PROPOSED
authority_level: 3
version: v1
last_ratified: 2026-08-14
supersedes:
  - _reference_gdd_reboot_v1/02_PHYSICA_GDD_REBOOT_v1.md (sección 1 — resumen ejecutivo; sección 2 — canon heredado conservable; sección 3 — premisa narrativa; sección 4 — género)
  - docs/physica/README.md (sección "El mundo" y "Gramática de puzzles" — la mitad de la sección es insumo de implementación ya cerrada por la sesión de Hito 1, no se reabre aquí)
depends_on:
  - ../../00-governance/ROXANA_GAME_DESIGN_PILLARS_v1.md
  - ../../00-governance/ROXANA_CANON_POLICY_v1.md
  - ../../00-governance/ROXANA_DESIGN_LANGUAGE_v1.md
  - ../../00-governance/ROXANA_DOCUMENT_ARCHITECTURE_v1.md
open_questions:
  - PHYS-VQ-1 — ¿La Metrópoli se juega en el mismo eje lateral 2.5D, o se permite un eje curado adicional? (decisión de Manuel, ligada a la decisión de motor; este doc no la toma)
  - PHYS-VQ-2 — ¿El personaje-protagonista de Physica tiene identidad compartida con el de Ohmdal (Roxana), o es un avatar local con cuerpo distinto? (implicación diegética + de control)
  - PHYS-VQ-3 — ¿La cascada ascendente debe leerse siempre como anomalía, o en algún arco se normaliza para mostrar que la "normalidad" es local y parcial?
  - PHYS-VQ-4 — ¿La recurrencia a un bioma ya estabilizado es parte del progreso o se considera reintroducción floja? (cruza GQ-3)
---

# PHYSICA — VISION · v1

Documento fundacional del mundo Physica dentro de Proyecto Roxana. Define la
fantasía del jugador, la promesa del juego, el tema narrativo, el verbo
nuclear, el norte pedagógico y la identidad que diferencia a Physica de una
"colección de simuladores escolares" o de un "Mario con fórmulas".

> **Estado del documento.** `PROPOSED` en v1. Nace de la sesión P3 sin
> ratificación autoral explícita. La promoción a `CANON` requiere un ADR.
> Véase `ROXANA_CANON_POLICY_v1.md` §5.

> **Alcance.** Este documento describe la identidad del mundo. No prescribe
> mecánicas concretas, no prescribe motor, no prescribe nivel de detalle
> artístico. Las mecánicas viven en los documentos de `gameplay/`. El nivel
> vive en `world/`. La narrativa detallada vive en `narrative/`.

---

## 1. North Star (reformulación operativa)

> **Antes de poder escribir una ecuación, el jugador debe haber sentido la
> relación con su cuerpo, un objeto o una máquina.**

Physica no es una colección de simuladores escolares. Es una **aventura
física en la que comprender leyes locales permite atravesar un mundo
imposible**.

El jugador no estudia física: **la física se le atraviesa en el camino**, y
el avance exige aprender a leerla antes de poder seguir.

### Lo que el North Star implica operativamente

- **Fenómeno antes que nombre.** El jugador ve una cascada subir antes de
  escuchar la palabra "gravedad invertida". El nombre llega después de la
  evidencia.
- **Cuerpo antes que fórmula.** La locomoción es excelente aunque no exista
  ningún puzzle. Saltar se siente bien porque el salto es legible, no
  porque enseñe algo.
- **Predicción antes que medición.** El jugador intenta, observa, compara
  y *después* se le entrega un instrumento que nombra lo que ya vio.
- **Local antes que universal.** Cada región obedece reglas que pueden
  contradecirse entre sí. La tarea del jugador es leer la regla local,
  no descubrir la fórmula única.

---

## 2. Verbo nuclear y loop

**Verbo nuclear:** `EXPERIMENTAR` (P03 — `ROXANA_GAME_DESIGN_PILLARS_v1.md`).

**Loop:**

> **observar → intentar → medir/estimar → modificar → ejecutar → comparar → dominar**

- **Observar.** El mundo ofrece un fenómeno visible. La cámara, el
  escenario y la luz lo encuadran.
- **Intentar.** El jugador modifica una variable: su posición, su
  velocidad, la masa de un objeto, el ángulo de un lanzamiento.
- **Medir/estimar.** El jugador compara mentalmente el resultado con su
  expectativa. La primera vez es pura intuición.
- **Modificar.** Ajusta una variable y reintenta. Aquí nace el
  experimento.
- **Ejecutar.** Dispara la consecuencia (lanza, empuja, suelta, ancla,
  espera).
- **Comparar.** El sistema muestra qué pasó. El fallo es informativo (P05).
- **Dominar.** No se trata de optimizar en abstracto: se trata de poder
  predecir el resultado antes de ejecutar. La maestría vive en predecir
  bien con el menor gasto posible.

### Verbos del cuerpo

Estos verbos son el vocabulario jugable de Physica. Cada uno abre una
familia de puzzles y un subconjunto de variables (ver
`physica-puzzle-grammar_v1.md`).

```
correr    saltar    caer       agarrar    empujar
tirar     lanzar    deslizar   balancear  acoplar
construir medir     redirigir
```

> **Regla de orden.** Los verbos de cuerpo se enseñan antes que los verbos
> de instrumento. El jugador corre, salta, cae, agarra, empuja, lanza
> antes de que el reloj-dispositivo entre a jugar.

---

## 3. Fantasía del jugador

> Soy explorador de un mundo que parece caprichoso hasta que empiezo a
> reconocer patrones. Puedo predecir movimiento, aprovechar fuerzas,
> construir soluciones y hacer que lo imposible se vuelva legible.

### Desglose de la fantasía

- **Explorador.** El mundo se recorre, no se resuelve por menús. Cada
  región tiene un acceso físico.
- **Caprichoso → con patrones.** La primera lectura del mundo es
  misteriosa; la segunda lectura es sistémica. El placer del juego es
  pasar de la primera a la segunda.
- **Predecir movimiento.** El verbo nuclear es anticipar. El premio
  inmediato de un experimento bien hecho es ver confirmarse la
  predicción.
- **Aprovechar fuerzas.** Las fuerzas del mundo no son obstáculo: son
  herramientas. Se aprende a usarlas, no a sufrirlas.
- **Construir soluciones.** El jugador combina elementos: un resorte
  almacena, una polea redirige, una rampa cambia la pendiente. La
  construcción es el medio, no el fin.
- **Lo imposible se vuelve legible.** El retorno emocional es la
  compresión del asombro: lo que parecía magia se vuelve mecánica.

---

## 4. Promesa de juego

> **Cada capítulo entrega un nuevo juguete físico que el jugador aprende
> a usar primero, y a leer después.**

- Un **juguete físico** es un objeto o un fenómeno que el jugador puede
  manipular y que cambia su relación con el mundo. La cascada ascendente
  no es un juguete: es un escenario. La polea sí.
- "Aprender a usar primero" significa que el juguete aparece en estado
  utilizable. El jugador lo prueba, lo equivoca, lo corrige.
- "Leer después" significa que un instrumento (reloj, Bitácora) entra
  después de que el jugador ya generó evidencia.
- La promesa **no es**: el jugador verá gráficos y fórmulas.
- La promesa **no es**: el jugador dominará la física del mundo real.
  Solo de Physica, y solo lo suficiente para atravesarlo.

---

## 5. Tema narrativo

> **Saber que algo ocurre no equivale a comprender qué variables lo
> gobiernan.**

Physica es un mundo donde el conocimiento de los habitantes se perdió
*porque el mundo seguía obedeciendo reglas que ya nadie recuerda haber
configurado*. El jugador no estudia el mundo: el jugador reconstruye las
condiciones bajo las cuales los fenómenos se producen.

### Tensiones del tema

- **Saber ≠ comprender.** El personaje-protagonista y los NPCs pueden
  *saber* que la cascada sube, pero no comprenden *bajo qué condiciones*
  lo hace. La tarea es restaurar la condición, no la leyenda.
- **Lo que se ve vs. lo que se mide.** El mundo se ve claro antes de
  poderse medir. El reloj entra cuando el jugador ya vio; no antes.
- **Una anomalía nunca es global.** Cada anomalía de Physica es local:
  afecta a un cuerpo, a una sustancia, a un rango. La generalización
  prematura es un error del jugador, y el sistema debe exponerlo.
- **Experimentar no es probar.** Probar es ejecutar sin hipótesis.
  Experimentar es ejecutar comparando. La Bitácora formaliza la
  hipótesis; el reloj la mide.

---

## 6. Identidad del mundo — qué es y qué no es

### Es

- Una **aventura física** con cámara lateral 2.5D controlada (ver
  `world/physica-world-structure_v1.md` §3 para las excepciones de eje
  curado y `physica-player-movement_v1.md` para el sistema de
  locomoción).
- Un **laboratorio a escala de mundo** donde la regla cambia de región
  en región, no de puzzle en puzzle.
- Un lugar donde la **curiosidad precede al cálculo** y la **medición
  precede a la formalización** (P02, P06).
- Un mundo donde la **físca es el lenguaje del mundo**, no el decorado.

### No es

- Un *Mario con fórmulas*. El plataformero existe, pero el desafío no es
  ejecutar inputs perfectos: es leer el sistema.
- Un *simulador universal*. Physica no simula todo. Modela lo que el
  jugador necesita para resolver; deja el resto fuera del modelo.
- Una *colección de bancos de laboratorio*. No hay clic en un panel
  para "activar gravedad invertida". La acción del jugador es corporal
  sobre el mundo.
- Un *juego de cuestionarios*. Nunca se pregunta "¿cuál es la fórmula
  de X?". La Bitácora no es un examen: es un registro de evidencia.
- Un *sandbox creativo*. Physica no es un Physics Sandbox. El
  experimento está acotado por el puzzle y por la región.

---

## 7. Lo que se hereda del legacy (estado reclasificado)

### Conservado (con reformulación)

| Idea legacy | Estado | Reformulación |
|---|---|---|
| Cascada ascendente como hito visual | **PROPOSED** (revalidar en P3) | Imagen de marca del mundo. Se mantiene como ancla narrativa del primer contacto. |
| Reloj-dispositivo analógico | **PROPOSED** (revalidar) | Se redefine como **instrumento de observación**, no menú omnisciente. Ver `physica-physics-interaction-system_v1.md` §6. |
| Acompañante modular / INSTRUMENTO | **PROPOSED** (revalidar) | El INSTRUMENTO existe como personaje de medición; **no es la voz didáctica** (P11). Emite fragmentos del guion, no teoría. |
| Mesa experimental / atómica | **PROPOSED** (revalidar) | Mecanismo de acceso desde el Instituto; queda en `world-structure` como decisión de portal, no de gameplay. |
| Mundo construido o intervenido por docentes del Instituto | **PROPOSED** (revalidar) | Premisa; debe subordinarse al gameplay (P11). |
| Pérdida de comprensión por superposición | **PROPOSED** (revalidar) | Convierte la cascada y las anomalías en "configuraciones olvidadas", no en magia. |
| Sin villano tradicional | **PROPOSED** (mantener) | El antagonismo es epistémico: la opacidad de las condiciones iniciales. |
| Bitácora posterior a la experiencia | **PROPOSED** (revalidar) | P02/P06 lo exigen ya. La Bitácora no anticipa; registra. |
| Metrópolis como promesa de expansión | **PROPOSED** con condiciones | No se concibe como salto a 3D libre. Lateral curado, Física Aplicada, mismo eje 2.5D. |
| Acceso por Aula de Física | **PROPOSED** (revalidar) | Portal desde el Instituto. Diseño en `world-structure`. |

### Reclasificado a `LEGACY` (no gobierna)

| Idea legacy | Motivo del descarte |
|---|---|
| Limitar Physica a 4 puzzles demostrativos | Viola P09 (debe sobrevivir sin etiqueta educativa) y P15 (cruces futuros). LEGACY. |
| "Demasiado énfasis inicial en visualizar vectores en vez de disfrutar el movimiento" | El pack P3 (§6–§7) lo confirma: el movimiento es bueno sin overlays; los vectores son instrumentos ganados. LEGACY explícito. |
| Concebir la Metrópolis como salto de género a 3D libre antes de validar el plataformero | La sesión P3 pide mantener el eje 2.5D lateral. LEGACY. |
| "Intentar una simulación universal" | P14 (toda complejidad debe comprar posibilidad jugable) y la propia nota del pack §16. LEGACY. |
| "Que el primer arco sea excesivamente conceptual y poco juguetón" | El pack P3 §16 lo prohíbe: "no diseñes un Mario con fórmulas". LEGACY. |

### Reclasificado a `REJECTED` (descartado con motivo)

Ninguna idea del legacy se rechaza a fondo. Todo lo que se descarta se
reclasifica a LEGACY para mantener trazabilidad sin
ensuciar el árbol de REJECTED global.

> **Nota de canon.** Las reclasificaciones aquí son **propuestas**. La
> reclasificación efectiva de documentos legacy a LEGACY se ejecuta por
> ADR separado, firmado por Manuel, según
> `ROXANA_DOCUMENT_ARCHITECTURE_v1.md` §2 ("Migración").

---

## 8. Recompensa dominante (P08 + Design Language §2)

Physica prioriza la recompensa de **tipo 1 (transformación del mundo)**
sobre cualquier otra. La cascada deja de subir cuando el jugador
comprende la condición. El río deja de empujar cuando el jugador
encuentra el anclaje correcto. La región se estabiliza (parcialmente)
cuando se completa el arco.

### Jerarquía operativa de recompensas en Physica

1. **Transformación del mundo.** Regiones se estabilizan, anomalías
   locales se resuelven, la cascada responde a la nueva configuración.
2. **Nueva capacidad.** Un nuevo juguete físico (resorte, polea, plano
   articulado) se habilita para uso libre en el bioma siguiente.
3. **Acceso.** Se abre una región, un atajo curado, un puzzle opcional.
4. **Nueva lectura del sistema.** El reloj gana un módulo (vectores,
   trayectorias, intervalos, comparación).
5. **Narrativa.** Avanza el misterio de las configuraciones perdidas.
6. **Cosmético.** Apariencia del INSTRUMENTO, marcas en la Bitácora
   extendida.

> **Prohibido** el XP como motivación dominante. P08 y Design Language §2
> lo vetan.

---

## 9. Lo que este documento NO es

- No prescribe controles, dificultad, ritmo ni assets.
- No prescribe motor ni framework. La decisión de motor ya está tomada
  para el Hito 1 (Babylon.js, decisión de Manuel 2026-08-05) y la
  arquitectura híbrida de física ya está ratificada para el arco
  (decisión de Manuel 2026-08-07). Este documento no reabre ni confirma
  ninguna de esas dos decisiones: las toma como insumo del estado de
  producción.
- No describe puzzles concretos: vive en
  `content/physica-arc-01_v1.md` y `gameplay/physica-puzzle-grammar_v1.md`.
- No describe el sistema de física: vive en
  `gameplay/physica-physics-interaction-system_v1.md`.

Cualquier inclusión aquí de uno de estos temas es una señal de que algo
se escribió en el archivo equivocado.

---

## 10. Vecino inmediato

Este documento se conecta hacia abajo con los cinco documentos de
`gameplay/`, `world/` y `narrative/`, y hacia los lados con la
documentación preexistente de implementación (sólo lectura). Su próxima
vecina de autoridad superior es la sesión P6, que definirá cómo Physica
se cruza con Ohmdal, Bitland y Arithmos en la campaña integradora.
