# Physica — Hito M0.5.1: bug `avatar.vx` + E8 cinemática con física real

**Fecha:** 2026-08-14
**Worktree:** `C:\YO\Worktrees\roxana-physica` (rama `physica/main`)
**Estado:** spec del Orquestador, aprobada por el Director (Manuel, 2026-08-14).
**Decisiones del Director ya tomadas:**
- Bug de `avatar.vx` (la integración devuelve `vx` pero el código no lo copia de vuelta) debe arreglarse.
- E8 debe pasar de trigger booleano + cinematic a un puzzle con física real basada en el modelo `referenciaMovil.ts` (acople de referencias).
- El M0.5 audit (2026-08-07) sugería 3 opciones; cerramos con la opción C modificada: la revelación depende de la integral de la velocidad del avatar en el marco anclado de la plataforma de E4.

**Modelo ejecutor:** Delicado → `sonnet` con spec extra-fina + auditoría reforzada.

---

## 1. Resumen del trabajo

| # | Cambio | Archivo | Esfuerzo | Tipo |
|---|---|---|---|---|
| 1 | Copiar `vx` desde `avatarNuevo` | `babylonWorld.ts:1696-1702` | XS (1 línea) | Mecánico |
| 2 | Función pura `velocidadAcopladaEnMarco` | `models/referenciaMovil.ts` (nuevo export) | S | Mecánico |
| 3 | Test puro del nuevo modelo | `tests/p5-referencia.test.ts` (extender) | S | Mecánico |
| 4 | Reemplazar trigger de E8 con medición física | `babylonWorld.ts:1393-1408` | M | Estándar |
| 5 | Test de integración con Playwright (harness) | `tests/p5-e8-marco.test.ts` (nuevo) | M | Estándar |
| 6 | Actualizar docs | `docs/physica/README.md` | XS | Mecánico |

---

## 2. Bug #1 — `avatar.vx` nunca se setea

**Síntoma (verificado con `console.log` durante validación):**
```js
// babylonWorld.ts:1696-1702 (estado actual)
const avatarNuevo = integrarAvatar(avatar, { ...input, jump: jumpEdge }, dt, plataformasActuales);
jumpEdge = false;
avatar.x = avatarNuevo.x;
avatar.y = avatarNuevo.y;
avatar.vy = avatarNuevo.vy;
avatar.facing = avatarNuevo.facing;
avatar.onGround = avatarNuevo.onGround;
// ← FALTA: avatar.vx = avatarNuevo.vx;
```

**Fix:** agregar la línea faltante. Después del fix, `avatar.vx` refleja `RUN_V` (4.5) cuando el avatar camina sobre suelo y 0 cuando está quieto.

**Verificación:** el `reloj.visualizarVector(avatar.vx * 10, avatar.vy * 10)` en línea 1897 ahora reporta magnitudes no-cero cuando el avatar corre. La prueba de Playwright debe confirmar.

---

## 3. Modelo puro — `velocidadAcopladaEnMarco`

**Razonamiento físico (lo que el M0.5 audit pidió):**
- La velocidad del avatar respecto al marco anclado de E4 es
  `v_avatar_marco = avatar.vx - v_plataforma_anclada`.
- `velocidadMarcoAnclado(s, t) = -velocidadPlataforma(plataforma_anclada, t)`.
  Por lo tanto, `v_avatar_marco = avatar.vx + velocidadMarcoAnclado(s, t)`.
- El M0.5 audit (sección Escena 8, opción C) dice: la revelación debe depender de
  `posicionPlataforma(anclada, t1) - posicionPlataforma(anclada, t0)` con
  `dt = t1 − t0`, no de un flag.

**Diseño de la función pura (nuevo export en `models/referenciaMovil.ts`):**

```ts
/**
 * Velocidad del avatar en el marco anclado (no inercial).
 * Si no hay anclaje, devuelve la velocidad absoluta del avatar.
 *
 * Mide: el observador parado en la plataforma anclada (marco no inercial)
 * ve al avatar moverse a `vAvatar - vAnclada`. El "anclado" se mueve
 * solidariamente con la plataforma de E4, así que la velocidad que el
 * observador del marco percibe es la del avatar menos la de la plataforma
 * (transformación de Galileo a primer orden).
 *
 * @param s - sistema de referencia de E4
 * @param vAvatar - velocidad absoluta del avatar (m/s)
 * @param t - tiempo de simulación
 * @returns velocidad del avatar en el marco anclado (m/s)
 */
export function velocidadAvatarEnMarco(
  s: SistemaReferencia,
  vAvatar: number,
  t: number,
): number {
  if (s.anclajeIdx < 0) return vAvatar;
  return vAvatar + velocidadMarcoAnclado(s, t); // vAvatar + (-vAnclada) = vAvatar - vAnclada
}

/**
 * Suma absoluta de la velocidad del avatar en el marco anclado durante
 * una ventana [t0, t1]. Mide "cuánto se movió el avatar en el marco
 * anclado" — no la posición final, sino el recorrido relativo.
 *
 * Implementación: integral por rectángulos con paso dt (default 0.05 s).
 * Coincide con la fórmula de la spec M0.5.1 §3:
 *   ∫ |v_avatar_marco(t)| dt  en [t0, t1]
 *
 * @param s - sistema de referencia
 * @param vAvatarFn - función t → vAvatar (velocidad absoluta del avatar)
 * @param t0 - inicio de la ventana
 * @param t1 - fin de la ventana
 * @param dt - paso de integración (default 0.05 s)
 */
export function recorridoEnMarcoAnclado(
  s: SistemaReferencia,
  vAvatarFn: (t: number) => number,
  t0: number,
  t1: number,
  dt: number = 0.05,
): number {
  if (t1 <= t0) return 0;
  let suma = 0;
  for (let t = t0; t < t1; t += dt) {
    const tFin = Math.min(t + dt, t1);
    const v = velocidadAvatarEnMarco(s, vAvatarFn(t), t);
    suma += Math.abs(v) * (tFin - t);
  }
  return suma;
}
```

**Por qué esto es física real (no flag):**
- `velocidadMarcoAnclado` es una función del modelo `referenciaMovil.ts` (no un toggle).
- `velocidadAvatarEnMarco` es la transformación de Galileo del avatar al marco no inercial.
- `recorridoEnMarcoAnclado` es la integral numérica de la velocidad relativa — emerge del estado físico integrado en el tiempo.

---

## 4. Trigger de E8 — medición física

**Estado actual (líneas 1398-1408):**
```ts
if (avatar.x >= W_E8_INICIO && !metropolisRevelada &&
    estacionEstabilizada && Math.abs(avatar.vx) > 0.3) {
  metropolisRevelada = true;
  ...
}
```

**Estado nuevo (objetivo):**
```ts
/* E8 — acople de referencias.
   M0.5.1: la revelación de la metrópolis exige que el jugador haya
   OBSERVADO movimiento relativo en el marco anclado de E4. La medición
   es la integral de |v_avatar_en_marco| durante una ventana de 2.0 s
   cumplida dentro de la zona E8. La velocidad del avatar es real
   (después del fix de avatar.vx), y la velocidad del marco viene del
   modelo puro referenciaMovil.ts. */

/* Acumulador de tiempo cumplido dentro de la zona E8 con la medición
   por encima del umbral. Se resetea si la condición se rompe. */
let e8TiempoCumplido = 0;
const E8_TIEMPO_REQUERIDO = 2.0;       // segundos dentro de la ventana
const E8_RECORRIDO_UMBRAL = 0.6;       // m absolutos en el marco anclado
const E8_VENTANA = 0.5;                // s de la ventana de medición

if (avatar.x >= W_E8_INICIO && !metropolisRevelada && estacionEstabilizada) {
  if (sistemaReferencia.anclajeIdx >= 0) {
    // Requiere anclaje previo en E4. Sin anclaje, el marco es inercial
    // y la medición no tiene sentido (el avatar en el inercial es trivial).
    const t0 = simT - E8_VENTANA;
    const recorrido = recorridoEnMarcoAnclado(
      sistemaReferencia,
      () => avatar.vx,        // captura la v del avatar en el instante
      t0,
      simT,
    );
    if (recorrido >= E8_RECORRIDO_UMBRAL) {
      e8TiempoCumplido += dt;
    } else {
      e8TiempoCumplido = 0;
    }
  } else {
    // Sin anclaje: el marco es inercial. La medición cae a la velocidad
    // absoluta del avatar (que después del bug-fix SÍ es real). El
    // jugador debe estar caminando sobre la plataforma — no basta
    // con estar parado, ni con un teleport estático.
    if (Math.abs(avatar.vx) > 0.3) {
      e8TiempoCumplido += dt;
    } else {
      e8TiempoCumplido = 0;
    }
  }
  if (e8TiempoCumplido >= E8_TIEMPO_REQUERIDO) {
    metropolisRevelada = true;
    save.flags = { ...save.flags, metropolisRevelada: true };
    guardarSave(save);
    reloj.mostrar();
    reloj.setModoVector();
    instrumento.speak('escena8_revelacion');
    setTimeout(() => instrumento.speak('escena9_retorno'), 3000);
    toast('La metrópolis se revela. Hay demasiadas referencias.');
  }
}
```

**Nota sobre el fallback (sin anclaje):** el M0.5 audit pide que la revelación dependa del marco anclado. Pero el jugador puede llegar a E8 sin anclar en E4 (skip del puzzle de referencia). En ese caso, el fallback exige `|avatar.vx| > 0.3` durante 2s (caminata sostenida sobre la plataforma). La medición sigue siendo física (velocidad absoluta del avatar, no un flag). El teleport estático no cuenta.

**Por qué esto es "física real" para M0.5:**
- E8 con anclaje previo: depende de `velocidadMarcoAnclado` (modelo puro) + `avatar.vx` (estado físico integrado).
- E8 sin anclaje: depende de `avatar.vx` (estado físico integrado).
- En ambos casos, la condición se resetea si la medición cae bajo el umbral → no es un flag.

---

## 5. Texto del juego (TEXTUAL, no inventar)

**Sin cambios** — la línea del INSTRUMENTO en E8 sigue siendo la del guion v0.2:
- "La estación del valle era una entrada. Allí… hay demasiadas referencias."
- "Y una señal que todavía reconoce el reloj."
- "La metrópolis se revela. Hay demasiadas referencias." (toast)

**Bitácora** (ya en `obtenerEntradasBitacora`): entrada #6, título y cuerpo textuales. No se agrega texto nuevo.

---

## 6. Tests

### 6.1 Test del modelo puro (extender `tests/p5-referencia.test.ts`)

```ts
import {
  recorridoEnMarcoAnclado,
  velocidadAvatarEnMarco,
  // ...existing imports
} from '../src/experiences/physica/models/referenciaMovil.ts';

// CASO 1: sin anclaje → velocidad del avatar = velocidad absoluta
// CASO 2: con anclaje, avatar quieto → velocidad del avatar en el marco = -vAnclada
// CASO 3: recorridoEnMarcoAnclado con avatar corriendo durante 1s sobre mundo sinusoidal
// CASO 4: recorridoEnMarcoAnclado con dt=0 (ventana nula) → 0
// CASO 5: recorridoEnMarcoAnclado con t1 < t0 → 0
```

### 6.2 Test de integración con Playwright (nuevo `tests/p5-e8-marco.test.ts`)

Usa el harness `__pxTeleport`, `__pxPress`, `__pxSnapshot`. Smoke test:

1. **Sin anclaje:** teleport a E8, simular caminata de 2.5s con `right` presionado. Snapshot debe mostrar `metropolisRevelada: true`.
2. **Con anclaje:** setear `sistemaReferencia.anclajeIdx = 0` directamente (no es parte del harness público, requiere injection), teleport a E8, caminar 2.5s. Verificar que la revelación ocurre y que la integral de `velocidadAvatarEnMarco` durante la ventana es > 0.6m.
3. **Sin movimiento:** teleport a E8, no presionar nada, esperar 3s. Verificar que NO se revela.
4. **Persistencia:** revelar, recargar, verificar que sigue revelada.

El test debe ser defensivo: si los timings reales no calzan, registrar el estado (snapshot completo) y fallar con mensaje claro.

### 6.3 Build + tests existentes

`npm run build` y `npm test` deben seguir en verde. Cero regresiones.

---

## 7. Archivos modificados / nuevos

```
src/experiences/physica/babylonWorld.ts
  - línea 1700: agregar avatar.vx = avatarNuevo.vx;
  - líneas 1393-1408: reemplazar trigger de E8 con el nuevo (con anclaje + fallback)
  - declarar e8TiempoCumplido y E8_TIEMPO_REQUERIDO/RECORRIDO_UMBRAL/VENTANA en el closure de createPhysicaWorld

src/experiences/physica/models/referenciaMovil.ts
  - agregar export velocidadAvatarEnMarco(s, vAvatar, t)
  - agregar export recorridoEnMarcoAnclado(s, vAvatarFn, t0, t1, dt=0.05)

tests/p5-referencia.test.ts
  - 5 casos nuevos para las funciones puras

tests/p5-e8-marco.test.ts (NUEVO)
  - 4 casos de smoke con harness

docs/physica/README.md
  - agregar nota: "M0.5.1: E8 ahora es puzzle físico con marco anclado, no trigger"
```

**Prohibido tocar:** `src/landing/**`, `src/ohmdal/**`, `src/jugar/**`, `src/app/runtimeHost.ts`, `src/experiences/registry.ts`, `src/state.ts`, `src/content/**`, `src/shared/**`, `index.html` raíz, `ROADMAP.md`, `docs/arco1/**`, `src/experiences/physica/world.ts`, `src/experiences/physica/avatar.ts`, `src/experiences/physica/models/*.ts` (excepto `referenciaMovil.ts`).

---

## 8. Reglas duras para el ejecutor

- Texto del juego: **textual del guion v0.2**, nada inventado.
- Sin commit. Terminar con build + test + verificación con Playwright y proponer commit.
- Imports con extensión `.ts` en todos los tests nuevos.
- Español neutro (tuteo).
- Spec ambigua → preguntar o dejar TODO; nunca resolver inventando.
- Spec con contradicción → frenar y reportar.
- Si el bug del `avatar.vx` resulta tener más consecuencias downstream (por ejemplo, otro código depende de que `avatar.vx` sea 0), reportarlo al auditor en lugar de "arreglarlo" silenciosamente.

---

## 9. Criterios de aceptación

1. `npm run build` en verde.
2. `npm test` en verde (todos los existentes + los 5 nuevos del modelo + 4 nuevos de integración).
3. El bug del `avatar.vx` está arreglado: el snapshot ahora debe incluir `vx` y debe ser > 0 cuando el avatar camina.
4. E8 con anclaje previo: la revelación ocurre cuando la integral de `|velocidadAvatarEnMarco|` durante una ventana de 0.5s es ≥ 0.6m, sostenida durante 2.0s.
5. E8 sin anclaje: la revelación ocurre cuando el avatar camina (|vx| > 0) durante 2.0s sobre la plataforma.
6. E8 sin movimiento: la revelación NO ocurre tras 5s de espera.
7. Persistencia: tras revelar, recargar la página mantiene `metropolisRevelada: true`.
8. El visual del E8 (luces de la metrópolis) se enciende cuando se cumple el trigger.
9. No regresiones en E2 (cascadaObservada), E3 (equilibrio), E4 (referencia), E5 (vector), E6 (plano), E7 (anillos).

---

## 10. Verificación (orden obligatorio)

```bash
npm run build
npm test
# opcional pero recomendado:
node scripts/physica-shot.mjs  # si existe y aplica
```

Después, smoke test con Playwright (el ejecutor debe escribir un script en
`tests/p5-e8-marco.test.ts` o un script .mjs suelto que ejercite el harness).
