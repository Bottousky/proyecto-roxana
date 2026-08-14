---
status: PROPOSED
authority_level: 3
version: v1
last_ratified: 2026-08-14
supersedes:
  - _reference_gdd_reboot_v1/04_ARITHMOS_GDD_v0.1.md (sección 6 — entidades matemáticas como objetos; sección 8 — invariantes, sólo la idea general; reescrito y reclasificado)
depends_on:
  - ../../00-governance/ROXANA_GAME_DESIGN_PILLARS_v1.md
  - ../../00-governance/ROXANA_CANON_POLICY_v1.md
  - ../../00-governance/ROXANA_DESIGN_LANGUAGE_v1.md
  - ../../00-governance/ROXANA_DOCUMENT_ARCHITECTURE_v1.md
  - ../vision/arithmos-vision_v1.md
  - ../vision/arithmos-world-rules_v1.md
open_questions:
  - A-TS-Q1 — ¿Cuál es la unidad base del mundo? (célula, unidad, paso) Su definición se delega al prototipo
  - A-TS-Q2 — ¿La operación "escalar" admite sólo factores enteros o también fraccionarios desde el inicio?
  - A-TS-Q3 — ¿Una operación puede componerse consigo misma (orden superior) o eso se reserva para mastery?
  - A-TS-Q4 — ¿Qué pasa con el invariante cuando dos operaciones compiten por conservarlo? (precedencia explícita vs. inferencia del jugador)
  - A-TS-Q5 — ¿La consecuencia sistémica (tercer punto de la regla) es siempre local o puede ser a distancia (tele-transferencia)?
---

# ARITHMOS · TRANSFORMATION SYSTEM · v1

> **Estado del documento.** `PROPOSED` en v1. Nace de la sesión P5.

> **Relación con la Vision.** La Vision declara la regla fundamental
> ("cambia representación + conserva propiedad + produce
> consecuencia"). Este documento la **operacionaliza**: define el
> conjunto cerrado de operaciones, su comportamiento legal y la
> gramática de combinación.

---

## 1. Definición operativa de transformación

Una **transformación del sistema** es una acción del jugador que
cumple, en simultáneo, las tres condiciones siguientes:

1. **Cambia la representación** del objeto o de la configuración
   objetivo. La forma visible antes y después de la acción no es la
   misma, aunque el objeto siga siendo el mismo *ante* el invariante
   activo.
2. **Conserva una propiedad explícita** declarada por el puzzle
   (cantidad, área, perímetro, factor común, equivalencia,
   cardinalidad, etc.). El invariante activo debe estar marcado en
   el mundo mediante affordance (ver `vision/arithmos-world-rules_v1.md`
   §8).
3. **Produce una consecuencia espacial o sistémica**: abre una
   ruta, libera una plataforma, activa un mecanismo, ajusta un
   balance, redistribuye un recurso, etc. La consecuencia debe ser
   *visible*, no declarada (DL §2 — recompensa tipo 1).

Si una "transformación" no cumple las tres, **no es una
transformación del sistema** y no se admite como herramienta
disponible. Puede existir como interacción decorativa, pero en ese
caso se reclasifica explícitamente.

### 1.1. Test de las tres condiciones

Cualquier feature candidato a transformación debe pasar este test
frente al equipo de diseño y/o el revisor (RC C1, C2, C3, C4):

- **C1 — ¿Cambia la representación?** Si la salida visual es
  idéntica a la entrada, no es una transformación; es un no-op.
- **C2 — ¿Conserva la propiedad activa?** Si la propiedad activa
  no se preserva (masa, área, equivalencia, etc.), la acción es un
  *fallo* y debe ser rechazada por el sistema con feedback
  geométrico (P05).
- **C3 — ¿Produce consecuencia espacial/sistémica?** Si la acción
  no genera nada en el mundo, no es una herramienta: es un
  cosmético (DL §2 — recompensa tipo 6).

---

## 2. Conjunto cerrado de operaciones

Las operaciones se dividen en cuatro curvas, en orden pedagógico.
Cada operación es **una herramienta de transformación**; el
jugador no contesta, **transforma**.

### 2.1. Curva 1 — Operaciones iniciales (Arco I, base)

| # | Operación | Representación inicial | Representación final | Propiedad conservada (por defecto) | Consecuencia típica |
|---|---|---|---|---|---|
| C1.1 | `agrupar` | varios objetos sueltos | un objeto agregado | cantidad total | aparece un objeto con silueta distinta que encaja en un hueco antes inaccesible |
| C1.2 | `separar` | un objeto agregado | varios objetos sueltos | cantidad total | cada objeto nuevo puede ocupar un hueco propio; un mecanismo antes saturado ahora se distribuye |
| C1.3 | `duplicar` | un objeto | dos objetos idénticos | forma; el factor (cantidad) se duplica | una plataforma gana alcance o altura; un puente se bifurca |
| C1.4 | `repartir` | un objeto | varios objetos en partes iguales | cantidad total; el factor común define la partición | una carga se distribuye entre varias plataformas; una ruta se ramifica |
| C1.5 | `comparar` | dos objetos | ninguno cambia, pero el sistema *declara* si son equivalentes bajo una propiedad | la propiedad activa de la comparación | un mecanismo dual reconoce si los dos lados "valen lo mismo" y abre una ruta |

> **Nota.** `comparar` es la única operación de la curva 1 que no
> cambia la representación. Cumple la regla fundamental porque
> *produce consecuencia sistémica* (el mecanismo dual se
> activa) y *opera sobre la propiedad activa* (la conservación
> está implícita en el resultado del mecanismo, no en un cambio
> visual del objeto). Se documenta aquí para evitar que se
> confunda con un *no-op*.

### 2.2. Curva 2 — Operaciones intermedias (Arco I final, Arco II)

| # | Operación | Representación inicial | Representación final | Propiedad conservada | Consecuencia típica |
|---|---|---|---|---|---|
| C2.1 | `factorizar` | un objeto o una configuración | módulos compatibles | cantidad o área | un mecanismo modular se activa cuando los factores encajan |
| C2.2 | `escalar` | un objeto | el mismo objeto con factor k>1 o k<1 (entero) | forma y proporción | la huella se multiplica; una plataforma gana acceso; un mecanismo cambia de tamaño |
| C2.3 | `fraccionar` | un objeto entero | un objeto con partes fraccionarias | cantidad total | aparecen partes con peso distinto; algunas plataformas aceptan sólo fracciones |
| C2.4 | `balancear` | dos configuraciones | ambas reordenadas hasta coincidir | la propiedad activa del balance | un puente basculante se nivela cuando ambos lados representan la misma cantidad/peso |
| C2.5 | `sustituir` | un objeto A | un objeto B tal que A≡B bajo la propiedad activa | la propiedad activa | un mecanismo que sólo aceptaba A ahora acepta B; una ruta se desbloquea |

### 2.3. Curva 3 — Operaciones espaciales (Arco II y III)

| # | Operación | Representación inicial | Representación final | Propiedad conservada | Consecuencia típica |
|---|---|---|---|---|---|
| C3.1 | `rotar` | un objeto o configuración | el mismo objeto en otro ángulo discreto | área; perímetro si la rotación es rígida | el objeto entra en un hueco con orientación específica |
| C3.2 | `reflejar` | un objeto o configuración | su imagen especular | área; perímetro; simetría | un mecanismo doble cara reconoce sólo configuraciones simétricas |
| C3.3 | `trasladar` | un objeto | el mismo objeto en otra posición | área; volumen; relaciones de no-superposición | aparece una plataforma que antes estaba oculta; una sombra equivalente se activa |
| C3.4 | `teselar` | una región teselada por un motivo | una región teselada por otro motivo de la misma área | área total | una ruta se abre porque las celdas nuevas coinciden con celdas aceptadas por un mecanismo |
| C3.5 | `recomponer` | varias piezas | una nueva configuración con la misma área o perímetro | área o perímetro | una plaza cambia su silueta; un solar vecino se completa |

### 2.4. Curva 4 — Operaciones avanzadas (Arcos IV y V)

| # | Operación | Representación inicial | Representación final | Propiedad conservada | Consecuencia típica |
|---|---|---|---|---|---|
| C4.1 | `función` | un input en una máquina | un output transformado | el contrato de la función | la máquina entrega un recurso; el output habilita un mecanismo |
| C4.2 | `transformación` (general) | un objeto | el mismo objeto bajo una función afín / proyectiva | una propiedad preservada por la familia de la función | un espacio se pliega o se refleja por una función explícita |
| C4.3 | `grafo` | un conjunto de nodos | el mismo conjunto con aristas distintas | el grado; la conectividad; un invariante de grafo | un mecanismo de flujo cambia de sentido; una ruta se invierte |
| C4.4 | `combinatoria` | un conjunto | una permutación / subconjunto | cardinalidad | un mecanismo elige un subconjunto cuya propiedad cierra un balance |
| C4.5 | `modularidad` | un objeto o conteo | un objeto o conteo bajo una clase de resto | el residuo módulo N | un mecanismo periódico se sincroniza cuando los restos coinciden |

> Las operaciones C4.3–C4.5 viven en el vertical slice como
> *contenido opcional de mastery* (P13) en v1. Su presencia en
> campaña principal se decide en la Bible de campañas (P6).

---

## 3. Precedencia de invariantes

Cuando dos o más invariantes compiten (por ejemplo, conservar área
y conservar perímetro simultáneamente), el sistema sigue esta
precedencia explícita:

1. **Invariante marcado por el puzzle.** El puzzle declara una
   propiedad activa; ésa gana. Esto se ve en la affordance tipo 3
   (marca de invariante).
2. **Propiedad estructural del mundo.** Si el puzzle no marca
   nada, gana la propiedad estructural de la región (ej.: "Los
   Jardines Fraccionados" usan área por defecto).
3. **Conservación de cantidad.** Si las dos anteriores fallan,
   cantidad es la red de seguridad. Esto evita perder objetos
   completos por accidente.

> **Regla dura.** Una operación que viola la propiedad activa del
> puzzle **se rechaza** con feedback geométrico (P05, DL §6). El
> jugador ve qué propiedad se rompió; no se le dice "incorrecto".

---

## 4. Composición de operaciones

Una operación puede componerse con otra **si y sólo si** la
composición cumple la regla fundamental por sí misma, en su
resultado.

- Composición legal: `agrupar` seguido de `rotar`. La agrupación
  produce un objeto de silueta nueva; la rotación lo orienta. La
  conservación de cantidad se mantiene en todo momento; la
  consecuencia espacial es la del paso final.
- Composición ilegal: dos `agrupar` que se contradicen. La
  segunda agrupación es un `no-op` o un fallo, no una
  transformación.

### 4.1. Profundidad de composición

La curva 1 y la curva 2 admiten composiciones de hasta **dos**
operaciones encadenadas. La curva 3 admite hasta **tres** en
campaña principal. La curva 4 admite composiciones abiertas,
pero sólo en contenido opcional de mastery.

---

## 5. Cancelación y undo

- **Undo ilimitado** por defecto (accesibilidad — P13 + guía de
  puzzles del proyecto).
- El undo **no** es una transformación; no cumple la regla
  fundamental. Se documenta aparte.
- El historial de undo muestra la **secuencia de operaciones**
  aplicadas, no la "respuesta" — esto refuerza P02 (el jugador
  reconstruye lo que hizo, no lo que el sistema le dijo que
  hiciera).

---

## 6. Limitaciones explícitas

1. **Sin notación obligatoria.** Una operación no exige haber
   visto antes un símbolo. P02 y P06 mandan.
2. **Sin daño.** Una mala operación no cuesta vida. Cuesta
   *visibilidad* del fallo (P05, DL §6).
3. **Sin tiempo.** Ninguna operación está cronometrada en
   campaña principal. El tiempo se introduce como mastery (P13).
4. **Sin aleatoriedad opaca.** Si una operación tiene componente
   aleatorio (curva 4 — combinatoria, modularidad), el sistema
   muestra la distribución o el mecanismo; el jugador puede
   inferir la regla.
5. **Sin cuentas arbitrarias.** Las cantidades que aparecen en
   el mundo son pequeñas (rango 1–24 en campaña principal, A-TS-Q
   derivado). Cuentas grandes son falsa dificultad (ver
   `gameplay/arithmos-mechanics-progression_v1.md`).

---

## 7. Lo que el sistema NO hace

- No evalúa respuestas del jugador con un número. La
  transformación es un test del estado, no un examen.
- No usa multiple choice ni cuestionarios en ningún momento
  (DoD literal de la sesión P5).
- No premia con experiencia o puntos. Las recompensas son de
  tipo 1 a 4 (DL §2): transformación del mundo, nueva
  capacidad, acceso, nueva lectura.
- No requiere memorización de fórmulas. Las propiedades se
  manifiestan en la forma del mundo.

---

## 8. Tres ejemplos por nivel de curva

Para asegurar que la regla fundamental no se degrade por copia o
por reescritura posterior, este documento la demuestra con tres
ejemplos, **uno por nivel de la curva de mecánicas**.

### 8.1. Curva 1 — operaciones iniciales (agrupar/separar)

**Estado inicial.** Seis piedras sueltas de masa 2 cada una.
Apoyan sobre un puente calibrado a masa 12. El puente tiene un
*segundo acceso* cuya silueta exige **tres piedras de masa 4**.

- Representación inicial: 6 × {m=2}.
- Representación final: 3 × {m=4}.
- Propiedad conservada: masa total = 12.
- Consecuencia: el segundo acceso se habilita. El jugador
  descubre que 12 puede ser visto como 6×2 o como 3×4. La
  *representación* no es la misma; la *cantidad*, sí.

> Si el jugador reagrupa como 4 piedras de masa 3, el puente se
> activa pero el segundo acceso **no** se habilita. El feedback
> del mundo muestra que el segundo acceso espera una silueta
> distinta: tres piedras, no cuatro. El jugador aprende que
> conservar cantidad no basta; la *representación* debe ser
> compatible con la *consecuencia* esperada.

### 8.2. Curva 2 — operaciones intermedias (factorizar/escalar)

**Estado inicial.** Un acueducto de sección triangular de área 6.
El agua debe atravesar una compuerta con **tres huecos**, cuyas
áreas sumadas son 6, pero los huecos exigen siluetas específicas:
hueco A: triángulo de base 3, altura 4 (área 6); hueco B: dos
triángulos cuya suma de bases sea 4; hueco C: paralelogramo
equivalente.

- Representación inicial: triángulo único (área 6).
- Representación final: triángulo fraccionado en A (entero), dos
  triángulos en B, paralelogramo en C.
- Propiedad conservada: área total = 6.
- Consecuencia: el agua pasa. La plataforma intermedia se eleva.
  El jugador descubre que 6 = ½·3·4 = ½·b·h y que la misma área
  puede tomar *varias* formas geométricas.

> Si el jugador intenta un triángulo de base 2, altura 3 (área 3)
> en el hueco A, la pieza no encaja: el sistema muestra que el
> hueco tiene profundidad y ancho, no sólo área. Conservar
> cantidad no basta; la *forma* también se conservó.

### 8.3. Curva 3 — operaciones espaciales (rotar/teselar/recomponer)

**Estado inicial.** Una plaza hexagonal teselada por 24 rombos. La
ruta de salida exige que la plaza quede con **12 rombos** y que
los **otros 12** reensamblen un cuadrado perfecto en un solar
vecino.

- Representación inicial: plaza teselada de 24 rombos.
- Representación final: plaza de 12 rombos en forma de "L" +
  cuadrado de 12 rombos en solar vecino.
- Propiedad conservada: área total (24 rombos) y la silueta del
  cuadrado resultante (12 rombos).
- Consecuencia: la ruta se abre porque la plaza cambia de silueta
  *y* porque el cuadrado es la llave que activa el siguiente
  mecanismo.

> Si el jugador rota pero no re-compone, sólo cambia la silueta
> de la plaza. El cuadrado no aparece; el mecanismo no se
> activa. El feedback muestra que la propiedad conservada
> (silueta del cuadrado) no se satisfizo. El jugador aprende que
> *conservar área no es lo mismo que componer una forma
> específica*.

---

## 9. Lo que este documento NO es

- No es un catálogo de puzzles. Los puzzles viven en
  `gameplay/arithmos-puzzle-grammar_v1.md`.
- No es un temario escolar. La cobertura curricular se evalúa
  en el `content/arithmos-arc-01_v1.md`.
- No prescribe UI ni iconografía. Eso vive en la bible de UI
  (cuando exista).
- No prescribe motor ni framework. Las operaciones se describen
  por su *comportamiento*, no por su *implementación*.
