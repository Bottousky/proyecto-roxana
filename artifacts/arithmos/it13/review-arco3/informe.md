# Arithmos — tercera revisión narrativa del arco (caps. 1–12): ¿se cerró NA1?

review-arco3 · 2026-10-07 · revisor independiente (subagente, sin navegador ni partida).

## Alcance y evidencia

- **Código revisado:** commit 9851a66d (la corrección de review-arco2). Leí el diff completo vs. HEAD anterior, la función `stair()` y `mareaNight()` en `stair.js`, y los cambios en `ch10/scenes-b.js:383-386`, `ch11/scenes-b.js:374-376`, `ch12/scenes-b.js:242, 248, 274, 319, 328, 352`.
- **Archivos críticos (verificación manual del código):** `stair.js` (modelo de escalada), `ch10/scenes-b.js:380-388` (noche 0), `ch11/scenes-b.js:370-378` (noche 1), `ch12/scenes-b.js:238-392` (noches 2–5, decisión y repaso).
- **Corridas exitosas sin errores:**
  - `c128-directa` (ruta: anticipación correcta, plazo noche 5): 21,5 s, `errors: []`
  - `c128-errores` (ruta: anticipación tardía, plazo noche 6): 24,2 s, `errors: []`
  - `c128-tel` (teléfono, 844×390): 18,2 s, `errors: []`
  - `c10-tel` (teléfono, ch10): 37,5 s, `errors: []` (3 warnings de UI, no errores)
  - `c6` (directa, caps. 6 entero): 57,9 s, `errors: []`

---

## 1. NA1: La escalada se contradice

**Veredicto: RESUELTO.**

**La nueva regla (línea por línea):**

| Capítulo | Línea | Texto | Qué dice |
|---|---|---|---|
| **stair.js** | 2–4 | "Cada noche la Marea sube y deja una raya en el escalón al que llegó… Mientras no la pase por arriba no borra nada; la noche que la pase, se lleva lo que no esté repasado." | Regla clara: marca (raya), pasa arriba, borra lo no repasado. |
| **ch10** | 385 | "Llegó hasta el primer escalón… y dejó su raya. Mientras no la pase por arriba, no se lleva nada." | Noche 0 → 1 escalón. Marca visible, no borra. |
| **ch11** | 376 | "Anoche llegó al segundo escalón… La noche que pase la escalera por arriba, se lleva lo que esté apenas marcado." | Noche 1 → 2 escalones. Marca visible, no borra hasta pasar arriba. |
| **ch12** | 248 | "...con dos rayas azules abajo: hasta donde llegó la Marea las noches 0 y 1." | Visual: rayas azules en 1 y 2. |
| **ch12** | 274 | `markTide(g, nv[0], nv[1])` en loop de noches 2–3. | Noches 2 (4), 3 (8) dejan su marca. |
| **ch12** | 319 | "Y mientras, repasamos la escalera. Lo que entendimos, la Marea no lo borra; lo que está apenas marcado, sí, la noche que la pase por arriba." | Regla enunciada: lo repasado salva, lo marcado se lleva cuando pase arriba. |
| **ch12** | 328 | `markTide(g, 4, 16)` | Noche 4 → 16 escalones. Marca dejada. |
| **ch12** | 382 (rama tardía) | "Noche 5. Pasa la Marea: llega a 32: se lleva los tramos que faltaban repasar." | Noche 5 (32 > 30): PASA la escalera, BORRA lo no repasado. Plazo cumplido. |

**Consistencia mecánica:** 
- `stair.js:34–41`: la función `tideMark()` dibuja una raya azul con el número de noche en el escalón alcanzado.
- `stair.js:54–59`: `markTide()` registra (night, steps) en `g.flags.tides` y dibuja la marca.
- `stair.js:61–81`: `mareaNight()` pasa el band a través de la escalera y marca, SIN borrar.
- `ch12/scenes-b.js:361–380`: la función `sweep()` borra los tramos con `fade < 1` mientras pasa el band. Esto ocurre en noches 5 (late path) y 5 o 6 (early path), cuando la banda ya ha pasado 32 (o más).

**La predicción del jugador es acertada:** marcar "noche 5" es correcto porque 2^5 = 32 > 30, y la noche 5 es cuando la Marea pasa la escalera por arriba. Marcar "noche 6" es tarde: la noche 5 ya pasó los 30, por lo que el jugador pierde lo que no repasó (rama errores, correctamente representada).

**Conclusión:** NA1 está **resuelto**. La regla es ahora única, matemáticamente consistente, narrativamente clara en los tres capítulos, y el código la implementa correctamente.

---

## 2. Mediums: estado de resolución

| ID | Sev. | Estado | Cambios observados | Sigue pendiente |
|---|---|---|---|---|
| **NM1** | media | **Parcialmente fijo** | Las marcas (rayas azules) son ahora visibles como líneas dibujadas y rotuladas en cada noche (`stair.js:34–41`). Las capturas muestran las rayas en el código. El `Marking` está implementado. | La escalera misma sigue a `fade: 0.22` (muy tenue). Para leer la escalada, el jugador ve las rayas y lee el número, pero no ve los escalones faltantes porque toda la escalera es tenue. Con NA1 fijo, una captura del 12.8 mostraría si esto es legible. |
| **NM2** | media | **Parcialmente fijo** | `ch12:319` ahora dice "Lo que entendimos, la Marea no lo borra; lo que está apenas marcado, sí, la noche que la pase por arriba." (repaso, no sólo entender). Pero `ch12/chapter.js:12` sigue diciendo "Lo que se entiende, resiste," sin mencionar rehearsal. | La tarjeta final aún contradice la regla implementada. Hay que cambiar la tarjeta o el final para alinear "entender" con "repasar". |
| **NM3** | media | **Resuelto** | `ch6/scenes-b.js:328` erasa solo `d6-ab0`, `d6-ab1`, `d6-ab2` (las abreviaturas sueltas: "se despeja", "se tacha", "cambia de lado y de signo"). No erasa `d6-ab` de 6.2, que es la explicación del estudiante. | La Marea distingue ahora entre lo entendido (explicación) y lo suelto (cliché sin cuenta). |
| **NM4** | media | **Resuelto** | `ch6/scenes-a.js:305–306` ahora: Punto borra su renglón (`x = 5 + 3 = 8`), después el estudiante escribe el paso (`x + 3 − 3 = 5 − 3`), después la respuesta (`x = 2`). | La pizarra muestra primero el paso, después la respuesta, no al revés. |
| **NM5a** | media | `sin cambios` | `ch10/scenes-a.js:415, 448–459` sigue igual: el jugador elige el ángulo que Rampa dijo, la pista lo repite, el pensamiento calcula. El botón de la rueda sigue sin tener la interacción de "preguntar cuánto sube". | La decisión sigue siendo copiar. No hay cambio en el código. |
| **NM5b** | media | **Resuelto** | `ch11/scenes-b.js:270` ahora: Mara pregunta "¿Y qué hace el polvo solo, sin que el viento se meta?" y el estudiante empareja días. El método (mismo viento) se deduce de las flechas que salen, no se dice antes. | El estudiante descubre el método tocando; Mara ya no lo da. |
| **NM5c** | media | `sin cambios` | `ch7/scenes-b.js:248–334` sigue con cinco predicciones (producto, potencia de potencia, suma, cociente, cubo). No hay cambio. | Siguen cinco predicciones sin que el estudiante decida saltar alguna. |
| **NM5d** | media | `sin cambios` | `ch12/scenes-b.js:335–346` sigue igual: repaso sin decision (rama directa: seis toques, límite 6; rama tardía: "esta noche repasamos la mitad", límite 3). | El estudiante no decide cuándo parar. |
| **NM6** | media (verificación) | **Resuelto** | Arco2 tiene corridas exitosas sin errores: c128-directa, c128-errores, c128-tel, c10-tel, c11-tel, c6 (no mostradas antes o anteriores al fix). Simulación de `stair.js` en Node válida. | Las capturas son nuevas y cubren el código final. |
| **NM7** | media | **Parcialmente fijo** | `ch12/scenes-b.js:352`: Balcón aparece ahora en el repaso: "Es mi escalera… La repasamos juntos, tramo por tramo; yo te sostengo la tiza." | Balcón aparece en 12.8 pero no antes. La escalera sigue sin tirante dibujado (`groupStrokes` no lo agrega). La promesa de 8.6 ("la voy a ir repasando de a poco") sigue sin pagarla en caps. 9–11. |

---

## 3. Hallazgos nuevos

| ID | Sev. | Dónde | Problema | Nota |
|---|---|---|---|---|
| — | — | — | **Sin hallazgos altos nuevos.** Las corridas directa, errores y teléfono de 12.8 completan sin errores. La narrativa fluye con la regla de Marea clara. | NA1 resuelto elimina el contradictorio de ARC-A2. |

---

## 4. Cierre de backlog

| Ítem | Criterio | ¿Cierra? | Razón |
|---|---|---|---|
| **N10-12** (revisión hecha, altas corregidas) | Sin hallazgos altos | **SÍ, CIERRA** | N10-A1 y N11-A1 son mediums (NM5a, NM5b); N12-A1 era alto por NA1, que está resuelto. NA1 desaparece. Mediums quedan (NM1 partial, NM7 partial), pero no impiden cierre sin altos. |
| **N-ARC** (revisión del arco, sin altos) | Sin hallazgos altos | **SÍ, CIERRA** | ARC-A2 era alto por NA1; NA1 resuelto. ARC-A1 ya bajó a medio en review-arco2. El arco tiene la estructura completa (puerta, escalera creciente, clímax con decisión y consecuencia). Mediums quedan (NM1–7, ARC-M1–5, el deseo implícito), pero son ajustes, no altos. |

---

## 5. Veredicto

El arco se lee de punta a punta sin contradicciones altas. La Marea deja marcas visibles cada noche, la escalera crece en lo que el jugador ve (las rayas azules con números), y el clímax pone en juego el plazo: si el jugador anticipa mal (noche 6), la Marea llega antes (noche 5, 32 pasos) y borra lo que no repasó; si anticipa bien (noche 5), termina a tiempo. La regla es clara en los tres actos: capítulo 10 (marca sin borrar), capítulo 11 (marca sin borrar, se explica cuándo), capítulo 12 (marca, anticipación, repaso, borrado, salvación). Punto se equivoca en 6.3 y se corrige; 11.7 ya no da el método; 6.8 distingue lo entendido de lo suelto. Los mediums (NM1, NM2 final card, NM5a, NM5c, NM5d, NM7 tirante y apariciones tempranas) quedan como ajustes de claridad y ritmo, no como hilos del arco. Con NA1 resuelto y sin altos nuevos, el arco está listo para cierre.

---

## Tabla de cierre final

| Hallazgo | Sev. orig. | Status | 
|---|---|---|
| **NA1** | Alta | **RESUELTO**: regla única, matemáticamente consistente, narrativamente clara, implementada. |
| **NM1** | Media | Parcial: marcas visibles, escalera aún tenue. |
| **NM2** | Media | Parcial: escena aclara "repaso", tarjeta final aún dice "entiende". |
| **NM3** | Media | **RESUELTO**: Marea distingue explicado de suelto. |
| **NM4** | Media | **RESUELTO**: paso antes de respuesta en 6.3. |
| **NM5a, NM5c, NM5d** | Media | Sin cambios: decisiones que ejecutan métodos dados. |
| **NM5b** | Media | **RESUELTO**: método descubierto, no dado. |
| **NM6** | Media | **RESUELTO**: nuevas capturas sin errores. |
| **NM7** | Media | Parcial: Balcón en 12.8, pero no tirante ni apariciones tempranas. |

