---
status: PROPOSED
authority_level: 3
version: v1
last_ratified: 2026-08-14
supersedes:
  - _reference_gdd_reboot_v1/02_PHYSICA_GDD_REBOOT_v1.md (sección 2 — canon heredado conservable en lo narrativo; sección 3 — premisa narrativa; sección 11 — lore candidato; sección 12 — reformulación del tema; sección 13 — Bitácora)
  - docs/physica/spec-vertical-slice.md (apartado 4 — texto canónico del guion v0.2; apartado 5 — texto canónico, en lo que es contrato de voz; estos quedan preservados como texto del juego, no se reescriben aquí)
depends_on:
  - ../../00-governance/ROXANA_GAME_DESIGN_PILLARS_v1.md
  - ../../00-governance/ROXANA_CANON_POLICY_v1.md
  - ../../00-governance/ROXANA_DESIGN_LANGUAGE_v1.md
  - ../vision/physica-vision_v1.md
  - ../gameplay/physica-physics-interaction-system_v1.md
open_questions:
  - PHYS-NB-1 — ¿La "voz docente" del guion v0.2 (línea 14) pertenece al **INSTRUMENTO** o a un **NPC** del Instituto? Implicación: la voz del docente se filtra en P11 (no es teoría recitada).
  - PHYS-NB-2 — ¿El protagonista de Physica es el mismo personaje-protagonista de Ohmdal (Roxana) o un avatar local? (PHYS-VQ-2 duplicada para trazar.)
  - PHYS-NB-3 — ¿Las "configuraciones perdidas" tienen **una sola historia** (los docentes del Instituto Roxana) o **varias** (distintas generaciones, distintos errores)? Implicación sobre el tono.
  - PHYS-NB-4 — ¿El reloj-dispositivo es un objeto con biografía (un instrumento del Instituto) o una invención del mundo (un dispositivo local)? Implicación sobre P12.
  - PHYS-NB-5 — ¿La Bitácora del mundo Physica se renderiza con la misma UI que la de Ohmdal o tiene una capa visual propia? (Decisión de P6; este doc no la toma.)
  - PHYS-NB-6 — ¿Existen **diálogos opcionales** (novela visual) entre el INSTRUMENTO y el avatar, o el INSTRUMENTO sólo habla en fragmentos reactivos? Implicación sobre P09 (debe ser deseable sin la etiqueta educativa).
---

# PHYSICA — NARRATIVE BIBLE · v1

Este documento define el **tono, los personajes, la premisa y las
reglas de voz** del mundo Physica. La narrativa está **subordinada
al gameplay** (P11): el mundo se muestra solo; la voz del mundo
explica lo que el sistema no puede mostrar, y nunca lo duplica.

> **Estado del documento.** `PROPOSED` en v1. Nace de la sesión P3
> sin ratificación autoral explícita. La promoción a `CANON`
> requiere un ADR firmado por Manuel.

> **Alcance.** Define la **voz y el personaje del mundo**. No
> prescribe la mecánica de puzzles (que vive en
> `gameplay/physica-puzzle-grammar_v1.md`) ni la cámara o el mapa
> (que vive en `world/physica-world-structure_v1.md`).

> **Contrato de texto del juego.** El texto canónico de los
> diálogos del INSTRUMENTO y de la Voz Docente proviene del
> **guion v0.2** (ver `docs/physica/spec-vertical-slice.md` §5).
> Este documento **no** lo reescribe. Cualquier nuevo texto del
> juego debe pasar por `TODO(guion)` y aviso a Manuel, según
> `AGENTS.md`.

---

## 1. Premisa

> **Physica funciona demasiado bien. Cada zona sigue obedeciendo
> reglas que ya nadie recuerda haber configurado.**

Physica no está "roto". El mundo no se descompuso. Lo que ocurrió es
que, durante décadas, distintos docentes del Instituto Roxana
**intervinieron Physica para alterar condiciones, aislar variables y
construir situaciones imposibles de reproducir de forma segura en
un aula real**. Cada intervención dejó su configuración. Con el
tiempo, las configuraciones se superpusieron, y nadie tiene un mapa
consistente de lo que se hizo.

### 1.1 Consecuencia para el jugador

El jugador no estudia el mundo: **reconstruye las condiciones bajo
las cuales los fenómenos se producen**. La tarea no es "arreglar
Physica" (no está rota); la tarea es **leer** cada anomalía
local, **delimitar** su región, **probar** qué cambia, y **cerrar**
la condición que la sostiene.

### 1.2 Lo que la premisa **no** es

- **No** es una historia de catástrofe. No hay evento fundador
  que lamentar. Hay décadas de **trabajo bien hecho** que se
  superpuso.
- **No** es un misterio de "qué pasó". Es un trabajo de
  **arqueología operacional**: desenterrar las condiciones
  iniciales.
- **No** requiere un villano. El antagonismo es **epistémico**:
  la opacidad de las configuraciones.

---

## 2. Tema

> **Saber que algo ocurre no equivale a comprender qué variables
> lo gobiernan.**

El tema se manifiesta en tres tensiones recurrentes:

1. **Confundir la observación con la explicación.** "La cascada
   sube" no es lo mismo que "el agua de esta región obedece un
   `gLocal = +gA`".
2. **Confundir la regularidad con la universalidad.** Que una
   anomalía se repita no significa que sea ley. Puede ser una
   configuración local.
3. **Confundir la medición con la comprensión.** Medir es leer un
   número. Comprender es poder **predecir** el siguiente
   experimento sin medirlo.

---

## 3. Tono y voz del mundo

### 3.1 Tono

- **Sereno.** Physica no apura al jugador. El Valle Variable es
  amplio, la luz es lateral, los biomas respiran.
- **Material.** El mundo se nombra por sus **materiales** (piedra,
  agua, madera, metal, cuerda, vidrio), no por abstracciones.
- **Respetuoso del cuerpo.** La física del mundo **se siente**;
  la voz nunca suplanta lo que el cuerpo ya leyó.

### 3.2 Voz del INSTRUMENTO

- **Fragmentaria.** El INSTRUMENTO no conversa; **emite**. Son
  frases cortas, a veces interrumpidas, siempre reactivas.
- **Sin terminología técnica.** Las palabras "masa",
  "aceleración", "fricción", "vector" **no** aparecen en su voz.
  Esa terminología vive en la **Bitácora formal**.
- **Reacciona al estado, no a la intención.** El INSTRUMENTO no
  dice "lo estás haciendo mal". Dice "más intensidad… mismo error
  lateral" (guion v0.2).
- **No resuelve.** El INSTRUMENTO **observa** y **advierte**;
  nunca dicta la solución.

### 3.3 Voz del docente (del guion v0.2)

Una sola línea del guion v0.2 (línea 14) está atribuida a una
"Voz Docente" del Instituto. Esta voz:

- Aparece **una vez** por arco, como máximo, y **después** de
  evidencia.
- No recita teoría. Es una **reflexión** sobre lo que el
  jugador acaba de hacer.
- Es la única voz que puede **cerrar** un capítulo temático
  (P11: la narrativa cierra la emoción, no la explicación).

> **Open question.** `PHYS-NB-1` — La atribución "Voz Docente"
> del guion v0.2 deja abierta la pregunta de si la voz pertenece
> al INSTRUMENTO, a un NPC del Instituto, a un recuerdo del
> avatar, o a un registro. Esta sesión no reabre el guion; la
> pregunta queda abierta para ratificación.

### 3.4 Voz del Bitácora (texto formal)

- La Bitácora es **otra voz**: es la voz del Instituto, la voz
  académica. **Sí** puede usar terminología técnica, pero sólo
  **después** de evidencia (P02, P06).
- La Bitácora **registra** y **nombra**, pero no **adelanta**.
- La Bitácora no le habla al jugador. **Es** un registro, no un
  tutor.

---

## 4. Personajes

### 4.1 INSTRUMENTO (acompañante modular)

- **Apariencia.** Núcleo esférico con lente central, anillo
  giroscópico, aguja direccional. Silueta imprimible en 3D.
- **Rol.** Mide, interpreta, visualiza. Su aguja señala
  direcciones; sus anillos registran magnitudes. **Nunca
  inventa texto**: emite fragmentos del guion (P11).
- **Entrada.** Aparece en la Escena 3 (E3), tras el primer
  encuentro con fuerzas opuestas. Permanece hasta el final del
  arco.
- **Estado.** `PROPOSED` (revalidar; figura en el canon
  preexistente y en el pack P3 §4 como "acompañante modular si
  aporta gameplay"). Esta sesión **ratifica** que aporta
  gameplay: la voz del INSTRUMENTO cumple el rol de "reacción
  de personaje" (DL §3, ítem 4) sin romper P11.

### 4.2 Reloj-dispositivo (instrumento)

- **Apariencia.** Instrumento analógico con agujas, anillos,
  escalas y piezas móviles.
- **Rol.** Es un **instrumento del avatar**, no un personaje.
  Crece en módulos a lo largo del arco (PIS §7).
- **Estado.** `PROPOSED` (revalidar; el pack P3 §10 lo
  confirma como "instrumento de observación", no como menú
  omnisciente).

### 4.3 Voz Docente

- Una voz del Instituto, no siempre presente.
- Aparece una vez por arco como máximo, en momentos de síntesis.
- Estado: `PROPOSED` (atribución abierta, ver `PHYS-NB-1`).

### 4.4 NPCs del Instituto

- Los docentes del Instituto viven en el dominio P6
  (Instituto) y en el Bitácora global.
- En el Arco I de Physica **no aparecen** como NPCs
  presenciales. Su presencia es diegética (a través del
  INSTRUMENTO, del reloj, de los textos de la Bitácora, de los
  registros) pero no diegésica-presencial.

> **Decisión de v1.** Physica Arco I es un mundo de **una
> acompañante instrumental** (INSTRUMENTO) más un instrumento
> (reloj). No hay NPCs presenciales en este arco.

---

## 5. El reloj-dispositivo (vínculo con el Instituto)

El reloj **es** el vínculo con el Instituto. No como metáfora
literaria: como **hecho diegético**. El reloj:

- Se entrega al avatar **en el Aula de Física** (E1), en el
  dominio P6.
- Crece módulo a módulo en cada arco (PIS §7).
- Permite al avatar **leer** el mundo (no **modificarlo** en el
  Arco I).

> **Decisión de v1.** El reloj **no** se inventa localmente en
> el Valle Variable. Es un instrumento que **viaja con el
> avatar** desde el Instituto. Si el reloj se rompe, el
> avatar queda sin lectura activa (no sin juego: la capa base
> del feedback, PIS §6.1, sigue activa).

---

## 6. La Bitácora del mundo Physica

### 6.1 Función

La Bitácora de Physica **registra experimentos** del jugador. No es
un manual ni un examen. Es un cuaderno de campo.

### 6.2 Estructura de una entrada

```text
Entrada {
  titulo:        string                  // 'TODO(guion)' si nuevo
  cuerpo:        string                  // texto narrativo
  captura:       { trayectoria, condiciones, ... }  // opcional
  observacion:   string                  // opcional
  formal:        string                  // opcional, sólo en capa formal
  desafio:       string                  // opcional, para reutilizar
}
```

### 6.3 Dos capas

- **Capa informal.** Registra lo que el jugador vio, sin
  terminología. Aparece primero.
- **Capa formal.** Nombra lo que el jugador vio con la
  terminología técnica. Aparece **después** de evidencia
  suficiente (P02).

> **Decisión de v1.** En el Arco I, la **capa formal** se entrega
> **sólo al cerrar el arco** (E7, Estación cinética). Durante el
> arco, sólo la capa informal está visible.

### 6.4 Lo que la Bitácora **no** es

- **No** es un tutorial. Nunca dice "para resolver X, haga Y".
- **No** es un manual. No contiene teoría sin experimento.
- **No** es un examen. No pregunta.
- **No** es una novela visual. No tiene voz narrativa.

---

## 7. Reglas duras de voz

- **Vocabulario técnico** (`masa`, `fricción`, `vector`,
  `aceleración`, `resorte`, `polea`, `resonancia`, `lente`):
  **sólo** en la capa formal de la Bitácora. **Nunca** en la voz
  del INSTRUMENTO, del docente, o de los textos de entorno. Esta
  regla protege P02 (formalización posterior) y DL §5 (la
  formalización no se acumula ni se anticipa).
- **Español neutro (tuteo).** Verificado por el gate de dialecto.
- **Texto del juego.** Cuando falte una línea: `// TODO(guion)`
  + placeholder neutro + aviso a Manuel. **Nunca** se inventa
  línea.
- **Cero recitado de teoría.** Un personaje no puede
  *presentar* un concepto. Sólo puede **reaccionar** a su
  consecuencia.

---

## 8. El misterio global (subordinado al gameplay)

El pack P3 §11 habla de "mundo que funciona aunque sus habitantes
no comprendan cómo encajan sus partes". Este misterio es la
**pregunta** del proyecto Physica, no la **trama** del Arco I.
**No** se desarrolla en este arco. Aparece como **fondo**, no
como **tema del capítulo**.

> **Decisión de v1.** El Arco I **no** cierra el misterio. Lo
> deja abierto, con un guiño (E8 Metrópoli) que **promete** sin
> **revelar**. Esta decisión protege P09 (la motivación es la
> fantasía del mundo, no la resolución del misterio) y P14 (la
> complejidad narrativa se compra con gameplay).

---

## 9. Lo que este documento NO es

- No es el **guion del juego**. El texto literal de los diálogos
  sigue en el contrato v0.2 (ver
  `docs/physica/spec-vertical-slice.md` §5).
- No prescribe **qué puzzles** se juegan. Eso vive en
  `content/physica-arc-01_v1.md`.
- No prescribe **mapa ni cámara**. Eso vive en
  `world/physica-world-structure_v1.md`.
- No prescribe **el sistema de física**. Eso vive en
  `physica-physics-interaction-system_v1.md`.
- No prescribe **la UI de la Bitácora**. Eso vive en P6 (UI
  global).

---

## 10. Conexión con el resto de Physica

- La **curva de voz** del INSTRUMENTO se ata a la **curva de
  mecánicas** en
  `gameplay/physica-mechanics-progression_v1.md` §6.
- El **reloj-dispositivo** se describe funcionalmente en
  `physica-physics-interaction-system_v1.md` §7.
- El **regreso al Instituto** se delega a P6.
- La **Bitácora** global se describe en P6. Este documento
  describe sólo la **capa del mundo Physica**.
