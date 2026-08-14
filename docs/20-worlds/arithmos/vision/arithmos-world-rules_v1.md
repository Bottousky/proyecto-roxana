---
status: PROPOSED
authority_level: 3
version: v1
last_ratified: 2026-08-14
supersedes:
  - _reference_gdd_reboot_v1/04_ARITHMOS_GDD_v0.1.md (sección 9 — mundo y regiones, sólo como insumo; sección 14 — dirección visual, sólo como insumo)
depends_on:
  - ../../00-governance/ROXANA_GAME_DESIGN_PILLARS_v1.md
  - ../../00-governance/ROXANA_CANON_POLICY_v1.md
  - ../../00-governance/ROXANA_DESIGN_LANGUAGE_v1.md
  - ../../00-governance/ROXANA_DOCUMENT_ARCHITECTURE_v1.md
  - ./arithmos-vision_v1.md
open_questions:
  - A-WR-Q1 — ¿La cámara isométrica 2.5D es una restricción obligatoria o una hipótesis estética por defecto? (A-V-Q1 la duplica; aquí se documenta su impacto en el space layout)
  - A-WR-Q2 — ¿Las regiones "fracturadas" son contiguas en el mapa-mundo o se acceden por portales internos? La elección cambia la curva de exploración
  - A-WR-Q3 — ¿Existen regiones no fracturadas "verdes" que nunca se rompieron? Su ausencia o presencia cambia la jerarquía espacial
  - A-WR-Q4 — ¿La arquitectura imposible es por violación de la gravedad, por repetición modular, o por simetría no trivial? Tres estéticas distintas
  - A-WR-Q5 — ¿Cómo se navega entre regiones? ¿A pie, por teletransporte diegético, o por una ruta de puzzle largo?
  - A-WR-Q6 — ¿Hay ciclo día/noche, meteorología, o el tiempo es atemporal? Esto afecta el lenguaje visual y la affordance
---

# ARITHMOS · WORLD RULES · v1

> **Estado del documento.** `PROPOSED` en v1. Nace de la sesión P5.
> Todo el lore introducido requiere ratificación explícita de Manuel.

> **Relación con la Vision.** Este documento extiende
> `vision/arithmos-vision_v1.md` sin repetirla. La Vision declara
> identidad y fantasía; este documento declara las reglas del
> espacio y de la materia que habita ese espacio.

---

## 1. Qué regula este documento

World Rules define:

1. Las propiedades del **espacio** (cómo se mide, cómo se pliega,
   qué se puede atravesar y qué no).
2. Las propiedades de la **materia** (qué es un objeto matemático
   tangible, qué se conserva, qué cambia).
3. Las reglas de **arquitectura** (por qué un puente tiene el largo
   que tiene, por qué una plaza tesela de cierta manera).
4. Las reglas de **movimiento y exploración** (cómo se recorre el
   mundo sin entrar en la mecánica de puzzles).
5. Las reglas de **fracaso del mundo** (qué pasa cuando una
   equivalencia se pierde, cómo se ve, cómo se siente).

Este documento **no** decide puzzles (eso es
`gameplay/arithmos-puzzle-grammar_v1.md`), ni lore (eso es
`narrative/arithmos-narrative-bible_v1.md`).

---

## 2. Regla de consistencia del espacio

> **El espacio de Arithmos es discreto y reglado, no continuo.**

Esto se decide aquí y se propaga:

- Las longitudes se miden en **unidades** enteras (la unidad base
  está aún por definirse en prototipo, A-WR-Q-siguiente).
- Las superficies se miden en **celdas** de igual tamaño.
- Las áreas aceptadas por un mecanismo deben ser **exactamente
  iguales** a una cantidad de superficie explícita; no hay tolerancia
  flotante visible.
- Las rotaciones ocurren en **ángulos discretos** (90° / 45° / 30°)
  salvo que un sistema específico declare lo contrario.

**Por qué.** Si el espacio fuera continuo, cualquier objeto pequeño
casi-igual serviría. La representación se vuelve invisible. La
discreción hace que las **diferencias entre representaciones
equivalentes** sean legibles: 2×3 y 3×2 no son lo mismo en cuanto a
*forma*, aunque sí lo sean en cuanto a *cantidad*.

---

## 3. La materia: objetos matemáticos tangibles

### 3.1. Tres tipos primarios

1. **Cantidad física.** Un objeto cuya propiedad principal es un
   número natural (≥ 0). Ejemplos: bloque-masa `m=4`, haz de
   `n=12` unidades.
2. **Forma física.** Un objeto cuya propiedad principal es geométrica
   (longitud, área, perímetro, ángulo). Ejemplos: losa de área 6,
   varilla de longitud 4.
3. **Relación física.** Un objeto cuya propiedad principal es la
   conexión entre otros (factor común, razón, equivalencia, función).
   Ejemplos: puente que sólo conduce si la masa del emisor y del
   receptor son equivalentes; mecanismo que abre si dos
   configuraciones representan el mismo valor.

### 3.2. Propiedades observables (sin notación)

Un objeto muestra sus propiedades en su **silueta** y en cómo
reacciona ante una operación. La notación numérica es un mapa
posterior, no el objeto mismo (P06).

- **Cantidad.** Se ve en la cantidad de partes discretas, en su
  volumen, en su peso al manipularlo.
- **Forma.** Se ve en el contorno, en la cantidad de lados, en el
  tipo de encastre.
- **Relación.** Se ve en qué otros objetos acepta, cuáles rechaza,
  y por qué. Un puente que sólo conduce a piezas de área 6 tiene
  un hueco con silueta de área 6, no un cartel que diga "área 6".

### 3.3. Conservación visible

Cuando una operación **conserva** una propiedad, el mundo debe
hacerlo visible. Tres affordances mínimas:

- **Masa.** El peso del objeto no cambia de forma "mágica" al
  fraccionarse: se redistribuye entre los hijos.
- **Área.** La huella visible del objeto no se encoge al
  reagruparse; se redistribuye.
- **Equivalencia.** Si dos configuraciones son equivalentes bajo
  una propiedad, ambas activan el mismo mecanismo, producen el
  mismo sonido y desbloquean el mismo acceso. La equivalencia es
  un *comportamiento del mundo*, no un cartel.

---

## 4. La arquitectura imposible pero reglada

### 4.1. Hipótesis estética de partida

La arquitectura es **imposible en términos de física newtoniana
cotidiana** pero **reglada en términos matemáticos**. Es decir: lo
que parece "imposible" lo es por una razón que el jugador puede
reconocer.

Tres familias estéticas compatibles, una sola entra en v1:

- **A. Plegado modular.** El espacio se pliega sobre sí mismo por
  repetición modular (espejos, simetrías, teselaciones).
- **B. Inconsistencia gravitacional dirigida.** Algunas plataformas
  ignoran la gravedad porque su *peso simbólico* (factor común,
  cantidad compartida) las ancla. Esta familia es la más cercana al
  "mundo roto" y se prefiere para regiones fracturadas.
- **C. Inversión por representación.** Una forma vista desde un
  ángulo es otra forma vista desde otro; los mecanismos
  aprovechan la ambigüedad visual.

> Decisión PROPOSED: en v1 conviven A (por defecto) y B (en
> regiones fracturadas). La familia C queda como contenido opcional
> de mastery (P13).

### 4.2. Lo que la arquitectura NO hace

- No usa "números flotando" como decoración principal.
- No usa estética de pizarra o de hoja cuadriculada como única
  lectura.
- No convierte cada pared en un teorema.

---

## 5. Regiones y fractura

> ⚠ Los nombres de regiones son PROPOSED. La cantidad y el orden
> son PROPOSED. La geometría interna de cada región es PROPOSED.
> Todo esto se valida en prototipo y se promueve por ADR.

### 5.1. Tipos de región

- **Región restaurada.** Región que el jugador encuentra ya
  funcional. Sirve como espacio de aprendizaje temprano (P02, P05).
- **Región fracturada.** Región con equivalencias perdidas. El
  puzzle es *recomponer* la equivalencia. El feedback visual es
  coherente: lo que está fracturado se ve fracturado.
- **Región de maestría.** Región opcional que pone a prueba
  optimización, elegancia o generalidad (P13).

### 5.2. Topología interna

La topología interna de las regiones fracturadas admite tres
configuraciones, una sola por región:

- **Camino lineal.** Entrada → puzzle → salida. Útil para los
  primeros compases del Arco I.
- **Plaza con bifurcaciones.** Varias rutas convergen en un espacio
  común. La elección de ruta es una elección de *representación*.
- **Anillo con retorno.** La salida de la región re-entra por su
  propio inicio bajo otra forma. Reserva de mastery.

### 5.3. El continuum de fractura

El mundo no se divide en "antes" y "después" en términos
narrativos. Las regiones fracturadas conviven con regiones
restauradas en cualquier momento de la campaña. La fractura es una
propiedad local, no un estado global.

---

## 6. Movimiento y exploración

### 6.1. Locomoción base (PROPOSED)

- **Caminar.** Movimiento continuo en el plano isométrico.
- **Mirar.** Rotación de cámara en saltos discretos (90°).
- **Interactuar.** Una acción de proximidad que selecciona un
  objeto matemático y abre su menú de operaciones.
- **Cancelar.** Reversión de la última operación. **Ilimitada** por
  defecto (accesibilidad: P13 + guía de puzzles del proyecto).

### 6.2. Lo que la locomoción NO hace

- No incluye combate. No hay barra de vida ni daño.
- No incluye salto realista: el espacio está organizado como
  plataformas discretas, no como terreno continuo con relieve
  arbitrario.
- No incluye muerte. Una mala transformación *no* mata al jugador;
  *muestra* por qué no funcionó (P05, DL §6).

### 6.3. Exploración

La exploración se organiza como un **paisaje de regiones**. La
decisión entre top-down abierto y topología estrictamente dirigida
queda abierta hasta el vertical slice (A-WR-Q5).

> **Regla dura.** El jugador no debe poder perderse en una región
> fracturada de forma permanente. Si se atasca, el espacio expone la
> propiedad activa (qué se conserva, qué cambia) y el jugador puede
> inferir el siguiente paso (P05).

---

## 7. Cámara (PROPOSED, no fundacional)

### 7.1. Hipótesis por defecto

Cámara isométrica 2.5D, ángulo fijo, rotación en saltos de 90°,
sin paneo libre. Esta hipótesis:

- Refuerza la lectura de superficies y áreas (la familia A6 del
  puzzle grammar depende de esto).
- Hace que la **discreción** del espacio sea legible.
- Mantiene el género "aventura de puzzles" sin invadir el espacio
  del jugador con controles de cámara.

### 7.2. Riesgos conocidos

- Puede hacer que las relaciones verticales (alturas, caídas) sean
  difíciles de leer. Mitigación: las relaciones verticales se
  expresan por apilamiento modular, no por relieve libre.
- Puede dar la impresión de "diagrama técnico". Mitigación: la
  paleta y la materia son cálidas, no de pizarra.

> La decisión final sobre la cámara se toma en el vertical slice.
> Si la cámara no funciona, este documento se modifica por ADR
> (P14, A-V-Q1, A-WR-Q1).

---

## 8. Affordance: cómo el mundo indica qué se puede hacer

Siguiendo DL §3, la affordance es el primer idioma de
tutorialización. Arithmos usa cuatro familias:

1. **Sombra equivalente.** Un objeto proyecta una sombra cuya
   silueta es la de su *representación alternativa*. Indica "esto
   puede ser visto de otra forma".
2. **Hueco con silueta.** Un mecanismo espera un objeto; el hueco
   muestra la silueta y/o el rango de áreas aceptadas. Indica
   "esto entra aquí si su forma es compatible".
3. **Marca de invariante.** Una región u objeto tiene una marca
   (color, textura, marca de agua) que indica cuál es la
   *propiedad activa* del puzzle: cantidad, área, equivalencia,
   factor. Indica "esto se conserva".
4. **Ruta de consecuencia.** Una plataforma, puerta o mecanismo
   conectado muestra su *estado futuro* mediante un canal visual
   (línea de luz, sombra proyectada, etc.) cuando una operación
   previa cambia la propiedad activa. Indica "esto pasa si
   completo la transformación".

La affordance nunca aparece como un cartel con texto (P11, DL §3,
orden 7 es último recurso).

---

## 9. Fallo del mundo

El fallo se modela como **infracción del invariante activo**. El
mundo no dice "incorrecto"; el mundo **muestra** qué propiedad se
rompió.

- Si se conserva cantidad pero se pierde área → el objeto
  reorganizado no encaja; queda una pieza suelta que no entra en
  ningún hueco.
- Si se conserva área pero se pierde equivalencia → la silueta no
  calza en el hueco; el mecanismo vibra sin activarse.
- Si se conserva equivalencia pero se pierde consecuencia
  sistémica → no hay nada que *pase*; el jugador no obtiene
  acceso.

> El feedback siempre es geométrico, no verbal (P05, DL §6). Un NPC
> puede reaccionar al resultado, pero no dice "te equivocaste"
> (P11).

---

## 10. Lo que este documento NO es

- No decide puzzles.
- No decide lore.
- No decide cámara de forma cerrada.
- No decide escala de unidades definitiva.
- No prescribe paleta, tipografía ni estilo artístico.
- No prescribe motor, framework ni arquitectura técnica.

Cualquier inclusión de esos temas aquí es una señal de que algo se
escribió en el archivo equivocado.
