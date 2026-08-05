# Golden frames del slice

**Alcance:** golden slice Portal → Plaza → Taller → Puerta → Manantial

**Son decisiones tomadas.** Un frame no se redefine para que un resultado pase: si la escena no
da el frame, se corrige la escena. Cambiar un golden frame es una decisión aparte, y consciente.

---

## 1. Para qué existen

Un golden frame es un **encuadre contractual**: fija estado determinista, anclaje, viewport y —lo más
importante— **qué tiene que ser legible**. No fija «cómo se ve bien»: fija qué información debe
llegar al jugador.

Doc. 15 advierte que lo que **no** se debe imitar de DQIII es «aprobar planta por captura estática».
Por eso cada golden frame tiene dos partes:

- **contrato de lectura** — verificable en una captura;
- **contrato de recorrido** — verificable sólo jugando, y que ningún screenshot puede aprobar.

Un frame se aprueba con las dos.

## 2. Estado determinista común

Heredado del contrato visual de preproducción y del harness actual.

| Campo | Valor |
|---|---|
| Seed | `ohmdal-hd2d-preprod-v1` |
| Variante de cámara | `quasi-orthographic` |
| Estudiante | 4 direcciones |
| Ohm | sprite |
| Maniquí de referencia | 1,72 m, origen en el suelo |
| Desktop | 1440×900, DPR ≤2 |
| Mobile | 390×844, DPR ≤1,5 |
| Hora primaria | tarde |
| Hora secundaria | crepúsculo, sólo en GF-07 y GF-08 |
| Mecanismo | apagado, salvo que el frame indique lo contrario |

Reproducción: `window.render_game_to_text()` debe coincidir con el estado declarado antes de
capturar. Una captura cuyo snapshot no coincide **no es evidencia**.

## 3. Parámetros de cámara

Medidos sobre el blockout. Cuando haya arte producido hay que volver a medirlos.

| Anclaje | Rango de ruta | Alto visible desktop | Alto visible mobile |
|---|---|---:|---:|
| `C1_PORTAL_PLAZA` | x < −3 | 13,5 m | 20,0 m |
| `C2_TALLER` | −3 ≤ x < 9,5 | 9,0 m | 14,5 m |
| `C3_DOOR_SPRING` | x ≥ 9,5 | 12,0 m | 18,0 m |

Umbrales con histéresis de 0,75 m: C1→C2 en x = −3,0; C2→C3 en x = 9,5. Zona muerta de seguimiento:
16 % del alto visible en lateral, 10 % en profundidad, 4 % en vertical.

## 4. Los ocho golden frames

Cada uno se captura en desktop **y** mobile.

---

### GF-01 · Llegada al Portal

- **Ruta:** `R0_PORTAL_SPAWN` (x = −18) · **Anclaje:** C1 · **Hora:** tarde

**Debe leerse:** el Portal como landmark dominante; el estudiante a escala humana contra él; la
dirección de avance sin cartel que la explique.

**No debe verse:** reversos no producidos; el Taller compitiendo por atención.

**Línea base actual:** las capturas de la corrección de cámara en 1440×900 y 390×844, en el commit
`8784206`. Son blockout: sirven como referencia de encuadre y escala, **no** de acabado.

**Recorrido:** el jugador debe elegir dirección sin instrucción.

---

### GF-02 · Diagonal de la Plaza

- **Ruta:** `R2_PLAZA_DIAGONAL` (x = −7,5; z = −2,5) · **Anclaje:** C1 · **Hora:** tarde

**Debe leerse:** la Plaza como espacio de tres planos —foreground recortable, plano jugable,
landmark—; el movimiento diagonal sin snap ni deslizamiento con sólo cuatro direcciones.

**Este frame es el juez del atlas de 4 direcciones.** Si acá aparece *moonwalk*, deslizamiento
lateral falso o pérdida de intención, se reabre la decisión de 8 direcciones —y sólo entonces—.

**Recorrido:** tiempo entre el Portal y el umbral del Taller, medido; es el primer dato de ritmo.

---

### GF-03 · Umbral del Taller y cambio C1→C2

- **Ruta:** `R3_TALLER_THRESHOLD` (x = −3) · **Anclaje:** transición C1→C2, 0,90 s

**Debe leerse:** que el cambio de encuadre se siente **intencional**, no reactivo; la silueta del
Taller distinguible de la del Portal.

**Contrato de recorrido, no capturable:** ir y venir sobre el umbral **no** debe producir parpadeo.
La histéresis de 0,75 m está medida y pasa; acá se verifica que además *se sienta* bien.

---

### GF-04 · Lumen en el Taller

- **Ruta:** `R4_LUMEN_STOP` (x = 0) · **Anclaje:** C2 · **Hora:** tarde · **Mecanismo:** apagado

**Debe leerse, los tres en el mismo encuadre:** el estudiante, Lumen como objetivo, y el punto de
medición como consecuencia. Ohm presente con sombra de contacto.

**Es el frame más importante del slice.** Si sujeto, objetivo y consecuencia no coexisten legibles,
la escena falla aunque el arte sea impecable.

**No debe pasar:** que la UI táctil cubra pies, conectores o puntos de medición.

**Recorrido:** el diagnóstico se habilita **sólo** al llegar al Taller; en el Portal está bloqueado y
el recorrido permanece libre.

---

### GF-05 · Foreground y medición

- **Ruta:** `R5_FOREGROUND_BYPASS` → `R6_TALLER_MEASURE` (x = 2,5 → 5) · **Anclaje:** C2

**Debe leerse:** el oclusor de foreground desvaneciéndose o recortándose **sin salto de exposición**;
el instrumento y su lectura legibles durante la medición.

**Contrato de oclusión:** los sujetos protegidos de C2 —`player-feet`, `player-head`, `lumen-head`,
`ohm-head`, `taller-measure`, `taller-response`— nunca quedan bloqueados. Verificable en
`snapshot().occlusion.blockedIds`, que debe excluirlos.

---

### GF-06 · Aproximación a la Puerta y cambio C2→C3

- **Ruta:** `R7_DOOR_APPROACH` (x = 9,5) · **Anclaje:** transición C2→C3, 1,10 s

**Debe leerse:** la Puerta como tercera silueta, distinta de Portal y Taller; los pilares **sin
alinearse** con el estudiante.

**Regresión conocida:** la ronda 1 de H1/H2 falló exactamente acá por falta de separación entre
estudiante y pilares en C3. Se corrigió reduciendo el componente lateral del view offset a 0,24.
Este frame existe para que esa corrección no se pierda.

---

### GF-07 · Medición en la Puerta

- **Ruta:** `R8_DOOR_MEASURE` (x = 13,5) · **Anclaje:** C3 · **Hora:** crepúsculo

**Debe leerse:** la transferencia de lo aprendido en Lumen aplicada a la Puerta; el estado eléctrico
comunicado por **forma + animación + etiqueta + sonido**, nunca sólo por color.

**Primer frame de crepúsculo:** la luz natural cede y la luz motivada por el sistema entra. No es un
filtro: es consecuencia narrativa.

---

### GF-08 · Borde del Manantial

- **Ruta:** `R9_SPRING_EDGE` (x = 16,5) · **Anclaje:** C3 · **Hora:** crepúsculo · **Mecanismo:** restaurado

**Debe leerse:** el agua pasando de detenida a flujo; la consecuencia del acto del jugador visible
sin texto que la explique.

**Debe seguir viéndose:** sombras, desgaste y zonas sin servicio. Restaurar no vuelve perfecto el
mundo. Un Manantial impecable es un fallo de identidad, no un logro.

**Cierre del slice.**

---

## 5. Criterios de aprobación

Escala 0–5. Todos los obligatorios deben alcanzar su gate; un obligatorio fallido **no se compensa
con promedio**.

| Criterio | Gate |
|---|---:|
| Identidad propia / legal | **5** |
| Composición y cámara | 4 |
| Integración sprite–3D | 4 |
| Escala y silueta | 4 |
| Materiales y luz | 4 |
| Actuación y personajes | 4 |
| Causalidad e interacción | 4 |
| Audio y respuesta | 4 |
| Accesibilidad | 4 |
| Rendimiento desktop | 4 |
| Rendimiento mobile | 3 |

«Identidad propia / legal» es el único que exige 5: ver [`LEGAL_REFERENCES.md`](LEGAL_REFERENCES.md).

## 6. Evidencia mínima por golden frame

1. captura desktop 1440×900 y mobile 390×844;
2. `render_game_to_text()` coincidente con el estado declarado;
3. `renderer.info`: draw calls, triángulos, geometrías, texturas;
4. consola: errores y warnings, con el número real;
5. lista de diferencias contra la línea base anterior;
6. decisión humana cuando el cambio sea visible.

## 7. Estado de captura — declarado, no inferido

Hoy existen capturas reales **sólo** de GF-01, y son de blockout (commit `8784206`). GF-02 … GF-08
están **especificados pero no capturados**.

Quien construya una escena tiene que capturar su propio frame o decir que no lo capturó.
**Nunca inferir el resultado visual de un frame que no se miró.**

## 8. Lo que estos frames deliberadamente NO aprueban

- **ritmo, fatiga y tiempo entre focos** — se miden jugando, no mirando capturas;
- **rendimiento en Android físico** — sin medir; ninguna afirmación de performance mobile vale
  hasta probarlo en un teléfono real;
- **si la cámara alcanza la barra de DQ III** — sin decidir, ver [`IDENTITY.md`](IDENTITY.md);
- **el layout y el HUD en mobile** — deuda conocida, ver [`SHOT_DECK.md`](SHOT_DECK.md).
