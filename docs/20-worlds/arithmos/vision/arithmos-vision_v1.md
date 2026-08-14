---
status: PROPOSED
authority_level: 3
version: v1
last_ratified: 2026-08-14
supersedes:
  - _reference_gdd_reboot_v1/04_ARITHMOS_GDD_v0.1.md (sección 1 — resumen ejecutivo; sección 2 — premisa de lore; sección 5 — core loop; sección 14 — dirección visual; sección 19 — criterio de éxito; estos contenidos se reescriben y se reclasifican como PROPOSED)
depends_on:
  - ../../00-governance/ROXANA_GAME_DESIGN_PILLARS_v1.md
  - ../../00-governance/ROXANA_CANON_POLICY_v1.md
  - ../../00-governance/ROXANA_DESIGN_LANGUAGE_v1.md
  - ../../00-governance/ROXANA_DOCUMENT_ARCHITECTURE_v1.md
open_questions:
  - A-V-Q1 — ¿La cámara isométrica 2.5D es una restricción obligatoria o una decisión por defecto revisable? (queda como hipótesis estética, no como pilar fundacional)
  - A-V-Q2 — ¿Qué artefacto del Aula de Matemática protagoniza la entrada desde el Instituto? (compás, regla plegable, prisma, tablero)
  - A-V-Q3 — ¿Cuántas regiones se entregan en v1 del mundo? La cantidad óptima se decide en el vertical slice, no aquí
  - A-V-Q4 — ¿Arithmos admite cooperativo o se mantiene single-player? (debe responderse antes del GDD de campaña)
  - A-V-Q5 — ¿Los "Conservadores" son antagonistas presentables o una categoría de NPC no combatiente?
---

# ARITHMOS · VISION · v1

> **Estado del documento.** `PROPOSED` en v1. Nace de la sesión P5 y todo
> el lore aquí introducido requiere ratificación explícita de Manuel antes
> de ascender a `CANON`. Véase `../../00-governance/ROXANA_CANON_POLICY_v1.md`
> §5 y §1 (caso especial de v1).

> **Relación con gobernanza.** Este documento es de `authority_level` 3
> (biblia de mundo y sistemas). No contradice nivel 0 ni nivel 1: los
> pilares P01–P15 se aplican tal como están. Cualquier tensión entre
> Arithmos y un pilar se resuelve por ADR, no por implementación.

---

## 1. North Star

> Los números no son respuestas escritas sobre puertas: son propiedades
> transformables de objetos, espacios y relaciones.

Este North Star es la **única medida de éxito** de Arithmos. Si un
mecanismo, escena o puzzle no produce la sensación de que un número o
una relación *cambió físicamente el mundo*, ese mecanismo no pertenece
al sistema de Arithmos, por muy educativo que parezca en abstracto.

---

## 2. Fantasía del jugador

> Puedo ver estructuras ocultas detrás de las cosas. Si dos expresiones
> son equivalentes, puedo usar esa equivalencia para remodelar el mundo.

### 2.1. Capas de la fantasía

La fantasía tiene tres capas que el gameplay debe sostener de forma
simultánea:

1. **Lectura.** Ver que dos configuraciones distintas representan el
   mismo objeto matemático. Esto se entrena en el nivel 1 de la escala
   de interacción (percibir) y debe aparecer antes que cualquier
   notación.
2. **Manipulación.** Cambiar de representación a voluntad: agrupar 12
   como 3+3+3+3, 2+2+2+2+2+2, 3×4, 2×6, 4×3, 2²+2²+2²+2²+2²+2². Cada
   forma se traduce en una construcción espacial distinta.
3. **Consecuencia.** Que la elección de representación determine qué se
   puede construir, qué ruta se abre y qué mecanismo se acciona. El
   cambio de representación *produce* algo en el mundo, no es
   cosmético.

### 2.2. Lo que la fantasía NO es

- No es "ser bueno en matemáticas". Es ver estructura, no rendir.
- No es "resolver cuentas para abrir puertas". Las puertas no evalúan
  respuestas, aceptan representaciones.
- No es un minijuego de cálculo rápido. La velocidad de respuesta
  nunca es la restricción.

---

## 3. Verbo nuclear y operaciones

**Verbo nuclear:** TRANSFORMAR.

### 3.1. Operaciones primarias (curva inicial)

- **agrupar** — reunir varios objetos en uno sin cambiar cantidad.
- **separar** — dividir un objeto en partes que conservan cantidad.
- **combinar** — unir dos objetos bajo una operación explícita.
- **igualar** — declarar que dos configuraciones distintas representan
  lo mismo.
- **escalar** — multiplicar o dividir un objeto y todas sus relaciones
  por un factor común.
- **sustituir** — reemplazar un objeto por otro equivalente bajo la
  propiedad activa.
- **mapear** — llevar una configuración a otra forma conservando una
  estructura interna.

### 3.2. Operaciones secundarias (curva intermedia y avanzada)

factorizar · repartir · rotar · reflejar · proyectar · ordenar ·
optimizar · contar · estimar · generalizar.

### 3.3. La regla fundamental de transformación

Una transformación del sistema debe cumplir las tres condiciones
siguientes de forma simultánea. Si falta cualquiera, no es una
transformación de Arithmos:

1. **Cambia la representación.** El objeto pasa de una forma visible a
   otra (de 3 grupos de 4 a 2 grupos de 6, de un triángulo a un
   paralelogramo equivalente, de un grafo a una matriz).
2. **Conserva una propiedad relevante.** Cantidad, área, perímetro,
   volumen, peso, distancia, grado, costo, cardinalidad, simetría, o
   cualquier propiedad explícita en el puzzle.
3. **Produce una consecuencia espacial o sistémica.** La nueva
   representación abre una ruta, libera una plataforma, libera un
   recurso, ajusta un balance, activa un mecanismo, cambia una
   jerarquía.

**Demostración de la regla con tres ejemplos, uno por nivel de la
curva de mecánicas** (este es el mismo conjunto que debe aparecer en
todo documento de Arithmos que invoque la regla, con el fin de
asegurarse de que la regla no se degrade por copia):

- **Nivel operaciones iniciales (agrupar/separar).** El jugador
  encuentra seis piedras de masa 2 cada una sobre un puente calibrado
  para soportar masa 12 (6×2 = 12, o 4×3 = 12, o 12×1 = 12).
  *Representación inicial:* seis piedras sueltas. *Propiedad
  conservada:* masa total = 12. *Consecuencia:* al reagruparlas como
  tres piedras de masa 4 mediante una operación `combinar` explícita,
  el puente cambia su silueta y habilita un pasadizo cuya
  *otra* entrada exige una silueta de cuatro piedras de masa 3.
  Conservar la cantidad (12) no basta: hay que elegir la
  representación compatible con la geometría del pasadizo.
- **Nivel operaciones intermedias (factorizar/escalar).** Un acueducto
  de sección triangular (área 6) debe pasar por una compuerta con
  tres huecos cuya suma de áreas admitidas es 6, pero los huecos
  aceptan sólo *representaciones* específicas: el primer hueco exige
  un triángulo rectángulo de base 3 y altura 4; el segundo, dos
  triángulos cuya suma de bases sea 4; el tercero, un paralelogramo
  equivalente. *Representación inicial:* triángulo único.
  *Propiedad conservada:* área = 6. *Consecuencia:* el acueducto se
  *fragmenta* y entra por los tres huecos; el sistema libera una
  plataforma que sólo aparece si las tres sub-áreas encajan en sus
  huecos sin solaparse.
- **Nivel operaciones espaciales (rotar/teselar/recomponer).** Una
  plaza hexagonal está teselada por 24 rombos. El jugador debe
  abrir una ruta dejando exactamente 12 rombos en la plaza original
  (mitad del área), pero la geometría exige que los otros 12
  reensamblen un cuadrado perfecto en un solar vecino. *Representación
  inicial:* romboide compacto. *Propiedad conservada:* área total
  (suma de los 24 rombos). *Consecuencia:* la plaza cambia su silueta
  (queda una "L" geométrica) y aparece un cuadrado en el solar
  vecino, cuya presencia es la llave que activa el siguiente
  mecanismo.

### 3.4. Frase guía

> Cambiar la forma no siempre cambia lo que es.

---

## 4. Identidad del mundo frente a los otros

| Aspecto | Ohmdal (CONECTAR) | Physica (EXPERIMENTAR) | Bitland (PROGRAMAR) | **Arithmos (TRANSFORMAR)** |
|---|---|---|---|---|
| Qué se manipula | Cargas y trayectorias | Cuerpos y campos | Procesos y datos | Relaciones y equivalencias |
| Lectura dominante | Diagrama de circuito | Diagrama de fuerzas | Pseudocódigo | Múltiples representaciones |
| Error típico a evitar | Evaluar al jugador con un número | Hacerlo simulador puro | Hacerlo tutorial de código | Convertirlo en cuestionario |
| Restauración típica (P08) | Red que vuelve a encenderse | Fenómeno que vuelve a ocurrir | Ciudad que vuelve a automatizar | Región que recupera equivalencias perdidas |

> **P12 — Instituto une, no uniforma.** Arithmos no debe parecerse a
> Ohmdal ni a Physica ni a Bitland en cámara, ritmo o género. La
> integración ocurre al final (P15), no al inicio por estética.

---

## 5. Premisa de lore (mínima y PROPOSED)

> ⚠ Todo el lore de Arithmos es nuevo. Se publica en estado
> `PROPOSED` y **no** se promueve a `CANON` sin ratificación explícita
> de Manuel (registrada como ADR). Esta restricción aplica a
> personajes, lugares, conflictos, regiones fracturadas, jardines,
> poliedros, teselaciones nombradas y mecánicas que dependan de lore.

### 5.1. Tesis

Arithmos es un mundo que se mantenía en pie gracias a la capacidad de
sus habitantes de **reconocer cuándo dos formas distintas representan
lo mismo**. La pérdida de esa capacidad —no la pérdida de los números
mismos— es lo que fracturó el mundo.

### 5.2. Tema

> Comprender matemática es poder cambiar de representación sin
> perder estructura.

### 5.3. Conflicto

Hay regiones que quedaron "congeladas" en una única interpretación
válida. No son villanas: son comunidades que aprendieron a preservar
una representación porque en algún momento fue útil y dejaron de
traducir entre lenguajes.

> El conflicto no es "los malos rompieron el mundo". El conflicto es
> "el mundo dejó de traducirse a sí mismo".

### 5.4. Lo que el lore NO hace

- No explica qué es un número.
- No asigna moraleja a las operaciones matemáticas.
- No convierte a los NPC en conferencistas.
- No contradice P11: la narrativa nunca explica lo que el sistema ya
  muestra.

---

## 6. Lo que este documento NO es

- No es un GDD técnico. No prescribe motor, framework, lenguaje ni
  pipeline.
- No es una biblia de arte. No prescribe paleta, iluminación ni
  estilo.
- No es un level design. Define identidad, no salas.
- No es un temario escolar. La cobertura curricular se evalúa en la
  bible de contenido (`content/arithmos-arc-01_v1.md`).

Cualquier inclusión de esos temas en este documento es una señal de
que algo se escribió en el archivo equivocado.

---

## 7. Lo que Arithmos ya decidió (PROPOSED)

1. El verbo es **TRANSFORMAR**. P03 obliga a reforzar este verbo en
   cada adición.
2. La **regla fundamental de transformación** (cambia representación +
   conserva propiedad + produce consecuencia) es la única definición
   operativa de lo que cuenta como "transformación" en el sistema.
3. La matemática aparece primero como **objeto físico** (P02, P06).
   La notación es un mapa, no un atajo.
4. El mundo **no usa cuestionarios ni multiple choice** en ningún
   momento. La interacción siempre es manipulación directa.
5. La **múltiple representación** del mismo objeto es la palanca
   mecánica principal (P07, P14).
6. La cámara por defecto es **isométrica 2.5D**, sin que esto sea
   Pilar fundacional. Se decide con prototipo (A-V-Q1).
7. El lore es **mínimo** y se construye en este GDD por primera vez.
   No se importa de versiones anteriores.

---

## 8. Lo que Arithmos todavía no decidió (pendiente de prototipo)

- El artefacto protagonista del Aula de Matemática (A-V-Q2).
- El número de regiones en v1 del mundo (A-V-Q3).
- Modalidad: single-player vs. cooperativo (A-V-Q4).
- Categoría de los Conservadores en la taxonomía de NPC (A-V-Q5).

Estas preguntas no bloquean el resto del GDD: bloquean únicamente la
transición de `PROPOSED` a `CANON` y la apertura de prototipado
serio.

---

## 9. Cómo se lee este documento en el resto del GDD

- Las **reglas de transformación** viven en
  `gameplay/arithmos-transformation-system_v1.md`.
- Las **representaciones múltiples** viven en
  `gameplay/arithmos-representation-system_v1.md`.
- Las **familias de puzzle** viven en
  `gameplay/arithmos-puzzle-grammar_v1.md`.
- La **curva de mecánicas** vive en
  `gameplay/arithmos-mechanics-progression_v1.md`.
- Las **reglas de mundo** (incluida la cámara y el espacio) viven en
  `vision/arithmos-world-rules_v1.md`.
- La **lore mínimo** vive en `narrative/arithmos-narrative-bible_v1.md`.
- El **Arco I** y el **vertical slice** viven en `content/`.
- Los **criterios de prototipo** viven en `production/`.

Este documento no repite lo que esos archivos deciden. Declara la
identidad y delega el resto.
