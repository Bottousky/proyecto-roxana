# Hito 1 — Physica en Babylon: la cascada ascendente (Escena 2 del guion v0.2)

**Fecha:** 2026-08-05
**Estado:** spec aprobada por Manuel (decisión de motor y de alcance tomadas).
**Fuente canon:** `docs/Proyecto_Roxana_Physica_Documentos_v0.2/` (GDD v0.2 + Guion v0.2).
**Modelo ejecutor:** Delicado → `sonnet` o `codex` con spec extra-fina y auditoría reforzada.

---

## 1. Decisiones del Director (tomadas, no reabrir)

1. **Babylon.js directo, sin prototipo comparativo.** El mundo Physica se construye en
   Babylon.js (GDD §22.2). El Instituto/landing permanece en el stack actual y Three.js.
   La M1 (Three.js) **no se borra ni se reescribe**: queda como base de regresión y como
   fuente de los modelos puros que este hito reutiliza.
2. **El hito se concentra en el desarrollo DENTRO de Physica.** El Aula de Física, el
   reloj, la mesa atómica y el micro-puzzle del anillo (Escenas 0 y 1) son de otro hito.
   Este hito implementa la **Escena 2 del guion v0.2** como primera pieza jugable del
   mundo en Babylon.

## 2. Objetivo del hito

Al terminar el hito se abre `http://localhost:5173/physica/`, se pulsa **Entrar** y se
juega la llegada a Physica:

- el jugador aparece en una **cornisa** frente a un lago;
- una **cascada asciende** desde el lago hasta las nubes;
- el jugador camina, salta, recoge una **piedra** y la arroja: **cae con normalidad
  mientras el agua sube** — no hay una inversión global simple;
- la Bitácora registra la observación (texto textual del guion) y persiste.

## 3. Alcance

### Entra

- Escena 2 completa del guion v0.2: cornisa, lago, cascada ascendente, piedra que cae
  normal, entrada de Bitácora.
- Runtime Babylon.js para Physica montado por el shell existente (sin tocar el shell).
- Harness de desarrollo equivalente al de M1 (`render_game_to_text`, `advanceTime`,
  `__pxPress`, `__pxSnapshot`, `__pxTeleport`).
- Modelo puro testeable + tests.
- Acceso de desarrollo a la M1 en Three vía `?engine=three` (no se pierde lo jugable).

### No entra (hitos futuros)

- Escenas 0 y 1 (aula de Física, reloj, mesa atómica, micro-puzzle del anillo).
- El `INSTRUMENTO`/acompañante (Escenas 3+). No hay diálogos en este hito.
- Puzzles de equilibrio, referencia, vectores ni plano inclinado.
- Estación pedagógica, metrópolis, regreso persistente al aula.
- El reloj-dispositivo y sus módulos (lectura de vectores, etc.).

## 4. Texto del juego (TEXTUAL, no se inventa)

Sola entrada de Bitácora de la Escena 2 (Guion v0.2 §4):

> **Bitácora:** "Distintos cuerpos del mismo lugar no parecen obedecer la misma dirección."

- Cuerpo de la entrada: exactamente esa línea.
- Título de la entrada: `TODO(guion)` + placeholder neutro (p. ej. «Registro de llegada»)
  y avisar a Manuel. No inventar título.

Cualquier otro texto que el ejecutor necesite (subtítulos de entorno, toasts, ayuda):
placeholder neutro + `TODO(guion)`, reportado al auditor. Prohibido inventar líneas.

## 5. Requisitos funcionales

### 5.1 Llegada (beat de apertura)

- Al pulsar **Entrar** se monta el mundo en Babylon directamente en la Escena 2 (la
  llegada desde el aula se conectará en un hito futuro; hoy la cascada es el punto de
  entrada).
- El jugador aparece sobre una cornisa amplia (suelo plano, ~20 m de recorrido lateral).
- Al frente, un lago; desde el lago, una cascada de agua asciende hasta las nubes
  (altura visual ≥ 25 m). El ascenso del agua se ve constante y sostenido.
- Fondo: naturaleza monumental (rocas, montañas lejanas, bruma/niebla), estilo
  "pantalla dentro del motor" (GDD §22.5): estilizado, no fotorrealista; la cascada es
  el hito visual y debe leerse antes que el fondo.

### 5.2 Controles y cámara

- A/D o flechas: caminar (y correr con Shift si el ejecutor lo considera natural al
  patrón M1). Espacio: saltar. E: recoger/soltar y arrojar la piedra.
- Cámara lateral controlada (GDD §22.1): perspectiva con fov cerrado (~10–12°), el plano
  lateral es el plano de juego; la profundidad se usa para parallax y composición.
- Cámara sigue al avatar con suavizado; sin movimiento brusco (accesibilidad §15:
  respetar `prefers-reduced-motion` para la animación de la cascada: ascenso más lento
  o estático).
- Colisión con los bordes de la cornisa (el jugador no se cae del nivel en este hito:
  la cornisa está rodeada de salientes/rocas que lo devuelven).

### 5.3 La piedra y la observación (núcleo del hito)

- Hay piedras pequeñas sobre la cornisa. El jugador las recoge (E) y las arroja (E).
- La piedra arrojada describe un **tiro parabólico con gravedad normal** (g = -9.8, el
  mismo valor de `GRAVEDAD` en `models/caidaLibre.ts`). Cae al piso como en cualquier
  mundo normal.
- El agua de la cascada asciende con aceleración +g desde el lago hacia el cielo
  (mismo modelo de caída, parámetro invertido — consistente con la M1 y su test p1).
- En el mismo lugar conviven las dos leyes: la lectura central del hito es
  "no se trata de una inversión global simple".
- Sin preview de trayectoria en este hito: el reloj y el acompañante (que justifican la
  visualización) no existen todavía. La observación es directa.

### 5.4 Bitácora y persistencia

- Botón de Bitácora (B y botón DOM, patrón `px-bita-*` de la M1) abre un panel DOM.
- La entrada se desbloquea cuando el jugador **arrojó una piedra** (caída normal
  observada) **y está cerca de la cascada** (distancia ≤ umbral). Es condición sobre el
  mundo, no un clic en un botón.
- Persistencia: save propio de Physica bajo clave `roxana-physica-v1`
  `{ flags: { cascadaObservada: true } }`. **No tocar** `roxana-slice-v1` ni `state.ts`.
  Recargar conserva la entrada desbloqueada.

### 5.5 Regreso al Instituto

- Botón **← Instituto** (HUD existente): vuelve a `/#hall` igual que hoy.

## 6. Arquitectura técnica

### 6.1 Dependencia nueva (aprobada por la decisión de motor)

- `npm install babylonjs` (incluye tipos; no hace falta `@types`).
- **NO** instalar `@babylonjs/havok` ni ningún motor de físicas: la física del hito es
  analítica de forma cerrada (MRUV/tiro parabólico), mismo criterio pedagógico que la
  M1 — la simulación no pelea contra la pedagogía.
- Registrar la versión instalada en `docs/physica/README.md`.

### 6.2 Archivos NUEVOS

```
src/experiences/physica/babylonRuntime.ts   frontera runtime (imita physicaRuntime.ts:
                                            mount → Engine+escena, harness probes en DEV)
src/experiences/physica/babylonWorld.ts     escena Babylon, entidades, input, cámara,
                                            panel de Bitácora DOM (estructura imita world.ts)
src/experiences/physica/models/cascadaAscendente.ts   modelo puro (ver §6.4)
tests/p5-cascada-ascendente.test.ts        tests del modelo puro
```

- `babylonRuntime.ts` implementa `ExperienceRuntimeModule` con `runtime: 'platformer-babylon'`
  y la misma interfaz de mundo que M1 (`advanceTime`, `snapshot`, `pause`, `resume`,
  `dispose`, `press`, `teleport`) para que el harness de pruebas no cambie de forma.
- La escena Babylon se crea en el `hostEl` que pasa el shell; `three` no entra a este
  chunk ni Babylon entra al grafo estático del shell (solo `import()` dinámico).

### 6.3 Archivos MODIFICADOS (solo aditivo)

| Archivo | Cambio |
|---|---|
| `package.json` | dependencia `babylonjs` |
| `src/experiences/types.ts` | `'platformer-babylon'` en la unión `ExperienceRuntime` |
| `src/experiences/loaders.ts` | loader nuevo: `'platformer-babylon': () => import('./physica/babylonRuntime.ts')`. Conservar el loader `'platformer-three'` (lo usa el modo dev de M1) |
| `src/experiences/manifests.ts` | `PHYSICA.runtime` → `'platformer-babylon'` (solo esa línea) |
| `src/experiences/physica/main.ts` | boot normal con el host (sin cambio de flujo) + ramo de dev: si `location.search` contiene `?engine=three`, montar M1 directamente (`import()` dinámico de `physicaRuntime.ts` + mount manual sobre `#px-game`), sin pasar por el host ni tocar `runtimeHost.ts` |
| `src/experiences/physica/index.html` | solo si el texto de ayuda de controles necesita ajuste menor |
| `src/experiences/physica/styles.css` | estilos aditivos del panel de Bitácora / mundo nuevo |
| `docs/physica/README.md` | decisión de motor (Babylon), estado del hito, cómo abrir M1 en dev, versión de babylonjs |

### 6.4 Modelo puro (sin importar Babylon)

`cascadaAscendente.ts` exporta:

- `GRAVEDAD` reutilizado desde `./caidaLibre.ts` (import directo, no duplicar);
- `chorroAscendente(lagoY, cieloY)` → cuerpo con `a = +GRAVEDAD` (el agua sube);
- `piedraEnTiro(...)` delegando en `tiroParabolico.ts` (import directo);
- `observacionCompleta(estado)` → booleano: se cumple solo si (a) se arrojó al menos una
  piedra que aterrizó en el suelo y (b) el avatar está a distancia ≤ umbral de la cascada.
  No se cumple solo por acercarse ni solo por arrojar lejos.

Esto da la prueba pura de "no inversión global": en un mismo instante el agua sube
(`a=+g`) y la piedra cae (`a=-g`).

### 6.5 Prohibido tocar

- `src/landing/**`, `src/ohmdal/**`, `src/jugar/**`, `src/app/runtimeHost.ts`,
  `src/experiences/registry.ts`, `src/state.ts`, `src/content/**`, `src/shared/**`,
  `index.html` raíz, `ROADMAP.md`, `docs/arco1/**`.
- `src/experiences/physica/world.ts`, `avatar.ts`, `models/caidaLibre.ts`,
  `models/tiroParabolico.ts` — solo se IMPORTAN desde el modelo puro. No se modifican.
- Los tests existentes `p0`–`p4` deben seguir pasando sin cambios.

## 7. Criterios de aceptación (jugable en navegador)

1. `/physica/` → **Entrar** → cornisa con lago y cascada que asciende hasta las nubes.
2. Se camina y salta por la cornisa; el avatar no abandona el nivel.
3. Recoger y arrojar la piedra: cae con parábola normal mientras el agua sube
   (lectura clara: no hay inversión global).
4. Bitácora (B): la entrada se desbloquea al arrojar + acercarse a la cascada, con el
   texto textual exacto del guion; persiste tras recargar.
5. **← Instituto** vuelve a `/#hall`.
6. `?engine=three` en dev monta la M1 sin romper.
7. `npm run build` y `npm test` en verde (todos los tests, incluidos los nuevos).
8. La landing y Ohmdal intactos: visitar `/` no descarga el chunk de Babylon
   (verificar en DevTools → Network que `babylon` solo aparece al entrar a `/physica/`).

## 8. Verificación (orden obligatorio)

```bash
npm run build        # tsc + vite build
npm test             # todos los tests de tests/ (node --experimental-strip-types)
# si hay bash disponible:
npm run verify       # gate completo (build + tests + dialecto/spoilers)
```

Después, verificación jugada en el navegador contra los 8 criterios de §7. Los valores
cinemáticos se comprueban en el harness: `__pxTeleport`, `advanceTime`, `__pxPress`,
`render_game_to_text` y `__pxSnapshot` deben estar disponibles en DEV y reportar el
estado del mundo (posición del avatar, piedra en vuelo o en suelo, flag de observación).

## 9. Reglas duras del ejecutor

- Texto del juego: **textual del guion v0.2**, nada inventado; lo que falte →
  `TODO(guion)` + placeholder neutro + reportarlo al auditor.
- Español neutro (tuteo). Vocabulario técnico (`vector`, `gravedad`, `parábola`) no
  aparece en el mundo; este hito no tiene capa formal: solo la observación.
- Modelo puro testeable + test con imports con extensión `.ts`.
- Validación por condiciones, no por solución fija.
- Sin dependencias nuevas fuera de `babylonjs`.
- **Sin commit.** Terminar con build+test+verificación jugada y proponer commit a Manuel.
- Spec ambigua → preguntar o dejar TODO; nunca resolver inventando.
- Spec con contradicción → frenar y reportar (no resolver).

## 10. Lo que NO decide el ejecutor (si duda, para)

- Texto de la entrada de Bitácora (fijado en §4).
- El aspecto final de la cascada (el ejecutor propone el primer greybox de agua con
  partículas/mallas estilizadas; la dirección visual se afina en otro hito).
- Nombre del acompañante, títulos de entradas de Bitácora.
