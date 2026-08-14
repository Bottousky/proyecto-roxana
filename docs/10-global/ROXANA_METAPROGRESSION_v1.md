---
status: PROPOSED
authority_level: 2
version: v1
last_ratified: 2026-08-14
supersedes:
  - docs/diseno-sintesis-v1.md (sección 7 — formato visual/interactivo: la mención de "compartir shell, progreso y Bitácora" entre mundos se eleva a este documento; el detalle de cámara 2D + banco se delega a cada GDD de mundo y a `ROXANA_GLOBAL_UI_UX_v1.md`)
  - docs/vision-mundos-multilenguaje.md (insumo: la idea de "lenguajes múltiples" sobrevive como principio rector; la formalización de qué cruza y qué no cruza se hace en este documento)
depends_on:
  - docs/00-governance/ROXANA_GAME_DESIGN_PILLARS_v1.md (P08, P09, P12, P15)
  - docs/00-governance/ROXANA_DESIGN_LANGUAGE_v1.md (tipos de recompensa §2; tutorialización §3)
  - docs/00-governance/ROXANA_CANON_POLICY_v1.md
  - docs/00-governance/ROXANA_DOCUMENT_ARCHITECTURE_v1.md
  - docs/00-governance/ROXANA_DESIGN_REVIEW_CHECKLIST_v1.md
  - docs/10-global/ROXANA_INSTITUTE_BIBLE_v1.md (la metaprogresión se materializa en el Instituto)
  - docs/10-global/ROXANA_BITACORA_SYSTEM_v1.md (la metaprogresión se **mide** con la Bitácora, no con XP)
  - docs/20-worlds/ohmdal/vision/ohmdal-vision_v1.md (P12)
  - docs/20-worlds/physica/vision/physica-vision_v1.md (P12)
  - docs/20-worlds/bitland/vision/bitland-vision_v1.md (P12)
  - docs/20-worlds/arithmos/vision/arithmos-vision_v1.md (P12)
open_questions:
  - GQ-5 (transversal) — si los instrumentos cruzan físicamente o se vuelven a aprender (propuesta de P6 en §4.2)
  - GQ-6 (transversal) — qué forma toma la recompensa de transferencia sin XP (propuesta de P6 en §5)
  - MP-Q1 — si la metaprogresión tiene un contador visible o sólo transformación observable (propuesta: sin contador — §3.1)
  - MP-Q2 — si los "desafíos interdisciplinarios" viven en el menú principal del Instituto o como puerta al final de cada mundo
  - MP-Q3 — qué tipo de "instrumento" puede sobrevivir el cruce Bitland↔Arithmos sin que uno se vuelva tutorial del otro
  - MP-Q4 — si las "relaciones descubiertas" son con NPCs locales o con el Instituto y sus habitantes recurrentes
  - MP-Q5 — qué pasa con un desafío integrador resuelto **antes** de que ambos mundos estén en su primer ciclo (decidir si se bloquea por dependencia o si la dependencia sólo se valida a posteriori)

---

# ROXANA — METAPROGRESSION · v1

Documento de autoridad nivel 2. Biblia global. Define cómo
**progresa el jugador a través del proyecto entero**, sin
recaer en XP como recompensa dominante, sin destruir la
identidad de ningún mundo y sin diluir los verbos nucleares.

> **Estado.** `PROPOSED` en v1. Nace de la sesión P6 sin
> ratificación autoral explícita. La promoción a `CANON`
> requiere un ADR firmado por Manuel (Canon Policy §5).

> **Decisión de fondo.** Este documento propone cerrar las
> preguntas globales **GQ-5** y **GQ-6** mediante las reglas
> de §4.2 y §5. La decisión final de cierre queda en manos
> de Manuel, registrada como ADR.

---

## 1. Tesis

> **La metaprogresión de Roxana es la restauración acumulativa
> de la capacidad del jugador para leer sistemas. Se mide por
> transformación observable del Instituto y de la Bitácora, no
> por contadores.**

Tres consecuencias operativas:

- **Sin XP dominante.** El jugador no acumula experiencia
  numérica que se canjea por poder. La motivación primaria
  es la fantasía del mundo (P09) y la recompensa dominante
  es la transformación del mundo (P08, DL §2 tipo 1).
- **Sin unlock que destruya identidad.** Ningún desbloqueo
  global puede convertir un mundo en un submenú de otro
  (P12). Las herramientas, los instrumentos, los accesos y
  los espacios se transfieren con regla, no por defecto.
- **Sin progreso narrativo genérico.** La metaprogresión
  está **anclada** a la Bitácora (los seis estados de
  `ROXANA_BITACORA_SYSTEM_v1.md`) y a la transformación del
  Instituto (las ocho funciones de
  `ROXANA_INSTITUTE_BIBLE_v1.md` §3). No existe un contador
  flotante.

---

## 2. Lo que la metaprogresión NO es

| Idea | Por qué no entra |
|---|---|
| XP numérico canjeable | Viola P08, P09 y DL §2. Convierte la motivación en subida de barra. |
| Niveles de personaje | El protagonista **no** sube de nivel. Sube de comprensión. |
| Árbol de habilidades | Subordinaría los verbos nucleares a una jerarquía ajena. |
| Inventario creciente | El jugador **no** viaja con inventario entre mundos. |
| Moneda virtual | Convierte el Instituto en tienda. El Instituto no es un mercado. |
| Energy / stamina | Mecánica de retención; rompe P09. |
| Misiones paralelas ("daily quests") | Convierte el proyecto en live-service. Roxana es campaña. |
| Logros / achievements como meta final | La Bitácora ya marca `MASTERED` y `TRANSFERRED`. |
| Pase de temporada | Idem. |
| Ranking entre jugadores | No hay tabla de posiciones. La Bitácora es individual. |

---

## 3. Las siete dimensiones de la metaprogresión

La metaprogresión se mide en **siete dimensiones** observables.
Ninguna de las siete es un número. Cada dimensión se observa
en el Instituto, en la Bitácora o en el comportamiento del
jugador en los mundos.

### 3.1. Capacidad de observación

Qué: el jugador distingue más cosas en el mismo mundo que
antes. Cómo se observa: el sistema detecta que el jugador
identifica una variable o un detalle que ignoraba al inicio
del mundo. Vehículo: Bitácora, capa 1 → 2.

### 3.2. Instrumentos

Qué: el jugador accede a instrumentos más profundos. Cómo se
observa: el inventario de instrumentos disponibles en el
mundo crece. **No** significa "el jugador tiene más poder
destructivo": significa "el jugador tiene más lecturas".
Vehículo: desbloqueos en el mundo, Bitácora capa 5.

### 3.3. Accesos

Qué: regiones, salas, puertas, mecánicas o diálogos antes
cerrados se abren. Cómo se observa: el espacio se expande.
Vehículo: el Instituto (nuevas salas), el mundo (nuevas
regiones).

### 3.4. Relaciones descubiertas

Qué: el jugador identifica conexiones entre conceptos
dentro y entre mundos. Cómo se observa: la Red conceptual
de la Bitácora (capa 4) gana nodos y aristas que el jugador
no había trazado. **No** son relaciones con NPCs (esos
viven en cada mundo); son relaciones entre **conceptos**.

### 3.5. Espacios restaurados

Qué: el Instituto cambia materialmente. Cómo se observa: la
sala o el mecanismo que estaba cerrado, apagado o en obra
ahora está encendido, operativo o limpio. Vehículo: el
Instituto.

### 3.6. Herramientas compartidas (cuando la narrativa lo
permita)

Qué: un instrumento o una lectura de un mundo **ayuda** a
leer otro mundo, sin romper la identidad del otro. Cómo se
observa: el jugador aplica la lectura en un mundo distinto
y el sistema registra la transferencia (Bitácora estado
`TRANSFERRED`).

### 3.7. Desafíos interdisciplinarios

Qué: el jugador resolvió problemas que requerían dos o más
mundos. Cómo se observa: el contador de
`TRANSFERRED` en la Bitácora y los mecanismos híbridos del
Instituto (ver `roxana-cross-world-challenges_v1.md`).

> **Sin contador flotante.** Las siete dimensiones se
> observan en el mundo y en el Instituto. El proyecto no
> muestra un "65 % de metaprogresión". La Bitácora muestra
> los estados; el Instituto muestra la transformación.

---

## 4. Regla de cruce (la regla anti-dilución)

> **Un unlock global no debe destruir la identidad de otro
> mundo. Si una herramienta cruza, cruza como lectura
> adicional, no como mecánica nuclear.**

### 4.1. La regla de los tres filtros

Antes de que un instrumento, una mecánica o un concepto de un
mundo pueda ofrecerse como unlock global, debe pasar tres
filtros. Si falla uno, no cruza.

1. **Filtro de identidad.** El instrumento **no** contiene la
   mecánica nuclear del mundo origen. Cruzar el verbo
   nuclear **destruye** el destino. Ejemplo negativo: un
   "editor de bloques" de Bitland que se ofrezca dentro de
   Ohmdal reemplazando la conexión manual con cables sería
   cruzar el verbo nuclear — destruiría CONECTAR.
2. **Filtro de funcionalidad.** El instrumento **sí** agrega
   una lectura que el destino no tenía. Ejemplo positivo:
   un instrumento de medición que en Ohmdal sirve para
   contrastar V-I-R, en Physica sirve para contrastar
   trayectorias, en Bitland sirve para leer el estado de un
   proceso, en Arithmos sirve para comparar propiedades.
   La **misma herramienta**, cuatro **lecturas distintas**.
3. **Filtro narrativo.** El cruce debe tener **una razón
   diegética**, no ser una conveniencia técnica. La razón
   diegética se documenta en
   `ROXANA_GLOBAL_NARRATIVE_v1.md` §3 — hilo del Instituto.

### 4.2. Tabla de cruce (referencia, no exhaustiva)

| Concepto / instrumento | Cruza como… | No cruza como… | Mundo destino válido |
|---|---|---|---|
| **Instrumento de medición** (genérico) | Lectura adicional | Mecánica nuclear | Los cuatro |
| **Medición de tiempo / intervalo** | Lectura de cadencia | Sistema principal | Ohmdal, Bitland (con cuidado) |
| **Comparación antes-después** | Lectura experimental | Verbo nuclear | Cualquiera (es transversal) |
| **Editor de bloques / pseudocódigo** | Lectura opcional de un proceso | Reemplazo de la conexión manual | Ohmdal, Physica, Arithmos (sólo si no canibaliza el verbo destino) |
| **Múltiple representación** | Lectura de equivalencia | Reemplazo de transformación | Ohmdal, Bitland, Physica (con cuidado) |
| **Conexión física (cable, interruptor)** | Verbo nuclear CONECTAR | Herramienta genérica | Sólo Ohmdal |
| **Movimiento del cuerpo / salto / ancla** | Verbo nuclear EXPERIMENTAR | Herramienta genérica | Sólo Physica |
| **Proceso / estado / cola** | Verbo nuclear PROGRAMAR | Herramienta genérica | Sólo Bitland |
| **Equivalencia / simetría / factorización** | Verbo nuclear TRANSFORMAR | Herramienta genérica | Sólo Arithmos |

> **Regla de lectura.** "Cruza como" significa: el concepto
> puede ofrecerse al jugador **después** de que el mundo
> destino esté en su primer ciclo, **como lectura**, no como
> mecánica dominante. "No cruza como" significa: si la
> mecánica de origen invade el destino, viola P12.

### 4.3. Resolución de conflictos (cierre propuesto de GQ-5)

> **Decisión propuesta a Manuel (ver ADR candidato en
> `roxana-content-authority-map_v1.md` §4).** Los
> instrumentos **no** se transfieren físicamente como
> inventario. Lo que se transfiere es la **lectura**: el
> jugador re-aprende a usar el concepto en cada mundo, con
> la comprensión ya ganada, y el sistema reconoce esa
> re-aprendizaje con el estado `TRANSFERRED` de la Bitácora.

Tres razones para esta decisión:

- **P12.** El inventario compartido borraría la identidad
  del destino.
- **P01.** La disciplina existe como regla del mundo: el
  mundo destino debe poder generar su propia lectura.
- **G08 / P15.** El cruce es un desafío, no una herencia:
  la transferencia se gana, no se recibe.

---

## 5. Recompensa de transferencia (cierre propuesto de GQ-6)

> **Decisión propuesta a Manuel (ver ADR candidato en
> `roxana-content-authority-map_v1.md` §4).** La
> transferencia no entrega XP, ni moneda, ni
> "experiencia acumulada". Entrega **cuatro recompensas
> simultáneas**, todas observables, ninguna numérica.

1. **Aparición de un mecanismo híbrido en el Instituto.**
   El Instituto gana un mecanismo (un ascensor, una red
   adaptativa, una compuerta, una estación) que **no existía
   antes** del desafío. El mecanismo es la prueba material
   de la transferencia.
2. **`TRANSFERRED` en la Bitácora.** La entrada del concepto
   en cuestión pasa al estado 6.
3. **Apertura de un acceso.** Una nueva sala del Instituto
   o una nueva región de un mundo se abre.
4. **Registro de la relación en la Red conceptual.** El
   nodo de la entrada se conecta a otro nodo de otro mundo.

> **Ninguna de las cuatro es un número. Las cuatro son
> observables.**

### 5.1. Por qué no XP

- P08 y DL §2 lo prohíben explícitamente.
- Convierte la motivación en puntaje.
- Hace que el jugador **mida** su aprendizaje, no lo
  **use**.
- Rompe el contrato emocional de P09: el proyecto debe
  sobrevivir sin la etiqueta "educativo".

### 5.2. Por qué no "barra de progreso"

- La Bitácora ya marca los seis estados.
- El Instituto ya muestra la transformación.
- Una tercera barra es redundante y miente sobre lo que el
  jugador hizo.

---

## 6. Curva de metaprogresión por campañas

La curva de metaprogresión sigue el árbol de
`ROXANA_CAMPAIGN_STRUCTURE_v1.md`. Resumen:

- **Prólogo.** Sin metaprogresión global. El jugador
  aprende a usar la Bitácora y a leer el Instituto.
- **Ciclo I (primer arco de cada mundo).** Se siembran las
  primeras entradas de Bitácora. El Instituto abre una
  primera sala por mundo. Sin desafíos interdisciplinarios.
- **Interludio I.** El Instituto cambia materialmente. La
  Red conceptual empieza a tener nodos cruzados.
- **Ciclo II (segundos arcos).** Los instrumentos se
  profundizan. El primer desafío interdisciplinario se
  habilita.
- **Proyecto Integrador I.** Primer `TRANSFERRED`. Primer
  mecanismo híbrido del Instituto.
- **Ciclos posteriores.** La curva crece por
  transferencia, no por repetición.

> **No se bloquea un mundo detrás de otro.** El jugador
> puede alternar para evitar fatiga de género. La
> metaprogresión mide transferencias, no orden de visita.

---

## 7. Lo que este documento NO es

- No prescribe UI. La metaprogresión se **ve** en el
  Instituto y en la Bitácora; cómo se ve se delega a
  `ROXANA_GLOBAL_UI_UX_v1.md`.
- No prescribe gamificación adicional. Una decisión de
  "agregar badges" se rechaza por defecto (DL §2 tipo 6:
  "cosméticos y coleccionables son legítimos, pero su
  volumen no debe superar al de las recompensas 1–4
  combinadas").
- No prescribe motor, framework ni almacenamiento. La
  persistencia de la metaprogresión se documenta en
  `ROXANA_PLAYER_PROFILE_v1.md`.
- No redefine los pilares. Si una sección entra en
  tensión con un pilar, el conflicto se eleva a ADR
  (Pillars §2).
