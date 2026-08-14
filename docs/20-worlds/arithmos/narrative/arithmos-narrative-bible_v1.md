---
status: PROPOSED
authority_level: 3
version: v1
last_ratified: 2026-08-14
supersedes:
  - _reference_gdd_reboot_v1/04_ARITHMOS_GDD_v0.1.md (sección 2 — premisa de lore; sección 9 — mundo y regiones, sólo como insumo; sección 10 — personajes, sólo como insumo; reescritos y reclasificados como PROPOSED)
depends_on:
  - ../../00-governance/ROXANA_GAME_DESIGN_PILLARS_v1.md
  - ../../00-governance/ROXANA_CANON_POLICY_v1.md
  - ../../00-governance/ROXANA_DESIGN_LANGUAGE_v1.md
  - ../../00-governance/ROXANA_DOCUMENT_ARCHITECTURE_v1.md
  - ../vision/arithmos-vision_v1.md
  - ../vision/arithmos-world-rules_v1.md
  - ./arithmos-transformation-system_v1.md
  - ./arithmos-representation-system_v1.md
  - ./arithmos-puzzle-grammar_v1.md
  - ./arithmos-mechanics-progression_v1.md
open_questions:
  - A-NB-Q1 — ¿Los nombres de regiones y personajes son definitivos o provisionales? Esta v1 los publica como PROPOSED con la advertencia "nombre provisional" cuando aplica
  - A-NB-Q2 — ¿Los Conservadores son antagonistas presentables (con presencia jugable) o una categoría diegética sin NPC?
  - A-NB-Q3 — ¿Nodo (pequeña entidad geométrica) es un companion persistente, una mecánica de invocación, o un NPC por arco?
  - A-NB-Q4 — ¿Tessa es jugable (como mentora) o puramente narrativa? (R11 — la narrativa no explica lo que el sistema muestra: si el sistema ya enseña, Tessa puede ser opcional)
  - A-NB-Q5 — ¿El "Taller del Cartógrafo" o equivalente entra como región del Arco I o como recurso narrativo transversal?
  - A-NB-Q6 — ¿Los nombres "Conservador", "Medidor", "Trazador", "Mapeador" son categorías fijas o por definir?
  - A-NB-Q7 — ¿La entrada desde el Instituto requiere una sola región de presentación o tres (aula → portal → primera región)?
---

# ARITHMOS · NARRATIVE BIBLE · v1

> ⚠ **Restricción de canon (la más fuerte de las cuatro sesiones de
> mundo).** La lore de Arithmos es prácticamente nueva. **TODO** lo
> que este documento introduce se etiqueta `status: PROPOSED` por
> default, sin excepción. La promoción a `CANON` requiere
> ratificación explícita de Manuel mediante un ADR posterior. Esta
> restricción se aplica a:
> - personajes,
> - lugares,
> - conflictos narrativos,
> - regiones fracturadas,
> - jardines, poliedros, teselaciones nombradas,
> - mecánicas que dependan de lore.

> **Relación con el resto del GDD.** Este documento define la
> **dimensión narrativa** del mundo. No prescribe sistemas (eso es
> el Transformation System), no prescribe reglas de espacio (eso es
> el World Rules) y no prescribe arcos específicos (eso es la bible
> de contenido).

---

## 1. Tesis y conflicto

### 1.1. Tesis

Arithmos es un mundo que se mantenía en pie gracias a la capacidad
de sus habitantes de **reconocer cuándo dos formas distintas
representan lo mismo**. La pérdida de esa capacidad —no la
pérdida de los números mismos— es lo que fracturó el mundo.

### 1.2. Tema

> Comprender matemática es poder cambiar de representación sin
> perder estructura.

### 1.3. Conflicto

> El conflicto no es "los malos rompieron el mundo". El conflicto
> es "el mundo dejó de traducirse a sí mismo".

Hay regiones que quedaron "congeladas" en una única interpretación
válida. No son villanas: son comunidades que aprendieron a
preservar una representación porque en algún momento fue útil y
dejaron de traducir entre lenguajes.

### 1.4. Frase guía

> Cambiar la forma no siempre cambia lo que es.

### 1.5. Lo que el conflicto NO es

- No es una guerra entre facciones.
- No es una profecía ni un apocalipsis.
- No es una búsqueda de un objeto mágico perdido.
- No tiene antagonista con nombre y cara. El antagonista es
  la *pérdida de relación* (P11, P04).

---

## 2. Regiones (PROPOSED, no definitivas)

> Todos los nombres y la geometría interna son PROPOSED. La
> cantidad y el orden definitivos se definen en el vertical slice
> (ver `content/arithmos-vertical-slice_v1.md`).

### 2.1. Taller del Cartógrafo (PROPOSED) — región de entrada

Una región pequeña y reconstruida, con un puente calibrado y
mecanismos que aceptan piezas con la misma cantidad bajo
representaciones distintas. Es el primer espacio donde el jugador
ve que 12 = 3×4 = 2×6 = 6×2 = 4×3 = 12×1 *produce lo mismo*.

- **Tipo:** región restaurada.
- **Topología interna:** camino lineal con una bifurcación
  opcional al final.
- **Operaciones que se introducen:** C1.1, C1.2, C1.3.
- **Familias que aparecen:** A1, A2.
- **Cierre de ciclo (P08):** un puente recupera su segundo
  acceso cuando el jugador demuestra que 12 admite varias
  representaciones.

> El nombre "Taller del Cartógrafo" se publica como **PROPOSED,
> provisional**. La decisión final del nombre se toma cuando
> Manuel revise el lore.

### 2.2. Plaza de las Medidas (PROPOSED) — Arco I

Una plaza donde la cantidad de cada plataforma es un valor
discreto y la *equivalencia* entre plataformas se ha perdido. El
jugador debe agrupar y separar para devolver a la plaza su
lectura múltiple.

- **Tipo:** región fracturada.
- **Topología interna:** plaza con bifurcaciones.
- **Operaciones:** consolidación de C1; intro C1.4, C1.5.
- **Familias:** A1, A2, A3, A4 (introducción), A5 (introducción).
- **Cierre de ciclo (P08):** la plaza vuelve a tener dos
  plataformas equivalentes visibles.

### 2.3. Jardines Fraccionados (PROPOSED) — Arco I/II

Una región cuya estética dominante es **proporción y escala**.
Hay galerías, senderos, estanques y un teatro de simetrías. La
mayoría de las superficies acepta *fracciones* de un todo; el
jugador debe decidir qué fracción entra y por qué.

- **Tipo:** región fracturada.
- **Topología interna:** anillo con retorno (la salida re-entra
  por otro punto bajo otra escala).
- **Operaciones:** consolidación de C1; intro C2.2, C2.3,
  C2.4, C2.5.
- **Familias:** A4, A5; refuerzo A1, A2, A3.
- **Cierre de ciclo (P08):** un teatro de simetrías vuelve a
  tener su patrón completo; un estanque recupera su escala.

### 2.4. Ciudad Espejo (PROPOSED) — Arco II/III

Una ciudad de simetrías, rotaciones y reflejos. Algunos
edificios están *invertidos* respecto a sus originales; el
jugador debe decidir si la inversión es una equivalencia
(entonces se acepta) o un fallo (entonces se restaura).

- **Tipo:** región fracturada con sub-zonas restauradas.
- **Topología interna:** plaza con bifurcaciones + trayectos
  lineales.
- **Operaciones:** consolidación de C1–C2; intro C3.1, C3.2,
  C3.3, C3.4, C3.5.
- **Familias:** A6, A7; refuerzo A5.
- **Cierre de ciclo (P08):** un edificio-simetría se vuelve a
  reflejar correctamente; una avenida teselada recupera su
  motivo.

### 2.5. Talleres de Forma (PROPOSED) — Arco II/III

Una región de **construcción geométrica**. Los jugadores
construyen, rotan, reflejan, teselan y recomponen piezas para
encajar en huecos con contornos específicos.

- **Tipo:** región restaurada con sub-zonas fracturadas.
- **Topología interna:** varias plazas pequeñas conectadas
  por pasarelas.
- **Operaciones:** consolidación de C1–C3.
- **Familias:** A5, A6, A7; refuerzo A1–A4.
- **Cierre de ciclo (P08):** un taller recupera su techo
  teselado.

### 2.6. Distrito de las Incógnitas (PROPOSED) — Arco III

Una región de **variables**. Los mecanismos tienen una entrada
y una salida observables; la *función* interna es desconocida. El
jugador alimenta las máquinas y observa hasta inferir.

- **Tipo:** región fracturada.
- **Topología interna:** varios "salones de máquinas" conectados
  por pasillos.
- **Operaciones:** consolidación C1–C3; intro C4.1.
- **Familias:** A8 (introducción), A9, A10, A11 (introducción).
- **Cierre de ciclo (P08):** una máquina recupera su función y
  entrega un output conocido.

### 2.7. Máquinas de Función (PROPOSED) — Arco IV

Una región cuya estética dominante es la **función**. Hay
máquinas con input y output visibles, componibles e invertibles.

- **Tipo:** región restaurada con contenido opcional de mastery.
- **Topología interna:** circuito de salas conectadas.
- **Operaciones:** profundización C4.1, intro C4.2.
- **Familias:** A10, A11, A12 (profundización).
- **Cierre de ciclo (P08):** un sistema de máquinas coordinadas
  vuelve a producir un output sincronizado.

### 2.8. Laberinto Combinatorio (PROPOSED) — Arco V

Una región de **grafos y rutas**. Los caminos tienen costos; las
aristas pueden crearse o eliminarse; la meta exige una ruta que
cumpla varias restricciones a la vez.

- **Tipo:** región fracturada con sub-zonas de mastery.
- **Topología interna:** anillo con retorno + bifurcaciones.
- **Operaciones:** consolidación C1–C4; intro C4.3, C4.4,
  C4.5.
- **Familias:** A8, A9, A12 (consolidación).
- **Cierre de ciclo (P08):** una ruta mínima vuelve a ser
  disponible; un sistema modular recupera su periodicidad.

### 2.9. Archivo Modular (PROPOSED) — Arco V (mastery)

Una región de **teoría de números y modularidad**. Sólo aparece
en v1 como contenido opcional de mastery (P13). No es parte de
la campaña principal.

- **Tipo:** región de mastery.
- **Operaciones:** consolidación C1–C4; profundización C4.5.
- **Familias:** A7, A8, A9, A10, A11, A12 (consolidación).
- **Cierre de ciclo (P08):** un sistema modular recupera su
  periodicidad completa.

### 2.10. La Gran Medida (PROPOSED) — región narrativa

Una **construcción narrativa** que existe en el mapa mental del
mundo, no en la campaña. Se rumorea que existe; los personajes
la mencionan; no se visita en v1.

- **Tipo:** región de lore, no jugable en v1.
- **Función:** sostener el misterio y abrir la posibilidad de
  campañas futuras.

> La existencia de La Gran Medida es PROPOSED. Si Manuel decide
> que rompe la regla de canon mínimo, se reclasifica como
> REJECTED.

---

## 3. Personajes (PROPOSED, todos provisionales)

> **Regla dura.** Ningún personaje de Arithmos recita teoría
> (P11). Su reacción es de tipo 4 (reacción al resultado) en el
> orden de tutorialización, no de tipo 7 (explicación explícita).

### 3.1. Tessa — nombre provisional (PROPOSED)

Una cartógrafa que cree que todo problema puede resolverse con
una buena representación, pero a veces elige la incorrecta.

- **Rol narrativo:** mentora. No explica; **reacciona**.
- **Aparece en:** Arco I (entrada), Arco II (opcional),
  Arco V (opcional como rastros).
- **Lo que NO hace:** no dice "deberías haber agrupado primero".
  Dice "esto se ve raro" cuando el jugador toma una decisión
  que rompe un invariante.
- **Lo que SÍ hace:** trae instrumentos de medición; dibuja
  mapas; celebra cuando el jugador encuentra una equivalencia
  nueva.

> El nombre "Tessa" se publica como **PROVISIONAL, PROPOSED**.
> La decisión final es de Manuel.

### 3.2. Nodo — nombre provisional (PROPOSED)

Una pequeña entidad geométrica que puede cambiar de forma
conservando una propiedad central. Sirve como **demostración
viva** de equivalencia: el jugador lo ve, lo manipula, y
entiende que la misma "masa" admite formas distintas.

- **Rol jugable:** companion o mecánica de invocación. La
  decisión se delega al prototipo (A-NB-Q3).
- **Aparece en:** Arco I (entrada), y a lo largo de la campaña
  si se decide persistente.
- **Lo que NO hace:** no habla. No tiene líneas de diálogo.
- **Lo que SÍ hace:** cambia de forma cuando el jugador aplica
  una operación, conservando la propiedad activa.

> El nombre "Nodo" se publica como **PROVISIONAL, PROPOSED**.

### 3.3. Los Conservadores (PROPOSED, categoría)

Comunidades que aprendieron a preservar una representación
porque en algún momento fue útil y dejaron de traducir entre
lenguajes.

- **Rol:** no son antagonistas presentables. Son una
  **categoría diegética**: el jugador encuentra sus *huellas*
  (un mecanismo que sólo acepta una representación, un cartel
  que dice "esto es lo correcto" sin alternativa, una región
  que parece sellada).
- **Lo que NO son:** no son villanos con nombre. No aparecen
  como NPC con diálogo. No combaten.
- **Lo que SÍ son:** la *resistencia* que el jugador encuentra
  al expandir el conjunto de representaciones que domina. El
  "antagonista" del Arco I es un Conservador de la Plaza de
  las Medidas que sólo acepta una factorización.

> La categoría "Conservadores" se publica como **PROPOSED**. La
> decisión sobre si tener NPC concretos o sólo huellas es de
> Manuel (A-NB-Q2).

### 3.4. Roles comunitarios (PROPOSED, sin nombres propios)

- **Medidores.** Habitantes que observan y comparan. No
  construyen. Su rol es *testimonio*: aparecen y reaccionan
  cuando un mecanismo se restaura.
- **Trazadores.** Habitantes que dibujan mapas. Traen
  instrumentos. Celebran la elegancia.
- **Mapeadores.** Habitantes que traducen entre
  representaciones. Son los que sostienen la capacidad perdida.

> La taxonomía de roles es **PROPOSED**. Los nombres son
> provisionales (A-NB-Q6).

---

## 4. Línea narrativa mínima

> ⚠ La línea narrativa que sigue es **mínima por diseño** (P11
> + canon mínimo). No se expande aquí; se expande en la bible
> de contenido por arco.

### 4.1. Apertura (entrada desde el Instituto)

El jugador entra al Aula de Matemática. Un mecanismo de
proyección lo lleva al Taller del Cartógrafo. No hay "prólogo";
el mundo ya está ahí.

### 4.2. Primer compás (Arco I)

El jugador descubre que las piedras se pueden agrupar, que
agrupar conserva la cantidad, y que el mismo peso acepta
*muchas* configuraciones. Nodo cambia de forma ante sus
ojos. La Plaza de las Medidas le espera.

### 4.3. Cierre de arco (Arco I)

La Plaza de las Medidas recupera su equivalencia. Un mecanismo
urbano vuelve a funcionar. La Bitácora formaliza por primera
vez.

### 4.4. Línea ascendente

Cada arco termina con un cierre de ciclo (P08). No hay
"clímax" entre arcos. El clímax de la campaña se delega a la
sesión P6 (metagame).

### 4.5. Lo que la línea narrativa NO hace

- No explica qué es un número. El mundo lo muestra.
- No asigna moraleja. El jugador decide.
- No exige leer un diálogo obligatorio (DL §4).
- No convierte a los NPC en conferencistas (P11).

---

## 5. Voz y tono

### 5.1. Tono general

Cálido, no solemne. La matemática se trata como una cualidad
del mundo, no como un saber elevado. Los personajes tienen
humor, intereses y conflictos pequeños.

### 5.2. Diálogo

- **No recitar teoría.** Un personaje no dice "esto es una
  equivalencia" si el jugador ya lo vio en el sistema.
- **Reaccionar, no explicar.** Un personaje dice "¡otra vez!"
  cuando el jugador repite una transformación, no "estás
  optimizando".
- **Hablar de lo que importa al personaje, no al jugador.**
  Tessa menciona una vez que echa de menos un mapa que ya no
  puede dibujar; no explica la mecánica.

### 5.3. Lo que la voz NO hace

- No es condescendiente.
- No es humorística por defecto.
- No es solemne o épica.
- No recita la tesis del mundo.

---

## 6. Lo que este documento NO hace

- No decide puzzles específicos.
- No decide regiones definitivas (la cantidad y el orden se
  afinan en prototipo).
- No decide nombres definitivos de personajes o regiones
  (todo lo marcado como "provisional" se publica como
  PROPOSED).
- No introduce lore más allá de lo necesario para sostener la
  fantasía y los ciclos de restauración (P08).
- No convierte a los personajes en NPC que hablan para el
  jugador. El sistema muestra; los personajes reaccionan.

---

## 7. Lo que se reclasifica a LEGACY/REJECTED de la versión previa

- **Sección 9 — "Mundo y regiones" del legacy.** Se
  reclasifica como **LEGACY**. La lista de regiones se
  reescribe en este documento, manteniendo sólo la idea
  general de "región fracturada que recupera equivalencia"
  como PROPOSED.
- **Sección 10 — "Personajes" del legacy.** Se reclasifica
  como **LEGACY**. Los nombres "Tessa" y "Nodo" sobreviven
  sólo como **PROVISIONALES, PROPOSED**.
- **Sección 12 — "Vertical slice" del legacy.** Se
  reclasifica como **LEGACY**. La secuencia del vertical
  slice se reescribe en `content/arithmos-vertical-slice_v1.md`.

> El motivo de la reclasificación es que la lore de Arithmos
> se reconstruye en esta sesión; los contenidos del legacy
> sirven como insumo, no como canon.
