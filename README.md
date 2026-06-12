# Proyecto Roxana — Unidad 1 (vertical slice greybox)

Juego narrativo educativo. Un estudiante nuevo llega al Instituto Roxana y descubre
los **Mundos Aplicados**: mundos creados por la escuela para enseñar, hoy degradados
en ritual y superstición. La Unidad 1 («La corriente no es magia») lleva al jugador
a Ohmdal, donde descubre jugando la Ley de Ohm.

**Estado:** greybox jugable de punta a punta — Unidad 1 («La corriente no es magia»,
Ley de Ohm) y Unidad 2 («El río se reparte», serie/paralelo: el Castillo, la Consejera,
el Repartidor, el timbre del Instituto). Formas y sistemas, sin arte final.

## Correr en desarrollo

```bash
npm install
npm run dev        # abre http://localhost:5173
```

## Build de producción

```bash
npm run build      # genera dist/ (estático, listo para subir a cualquier hosting web)
npm run preview    # sirve el build localmente
```

`dist/` es un sitio estático con rutas relativas (`base: './'`): se puede subir tal
cual a cualquier hosting (Netlify, Cloudflare Pages, un VPS propio, etc.).

## Deploy (GitHub Pages, gratis)

El repo incluye un workflow ([.github/workflows/deploy.yml](.github/workflows/deploy.yml))
que compila y publica el juego automáticamente en cada push a `main`. Para activarlo
la primera vez:

```bash
gh auth login                                            # autenticarse (una sola vez)
gh repo create proyecto-roxana --public --source . --push
```

Eso crea el repo, sube el código y dispara el primer deploy (~2 minutos). El juego
queda en `https://<tu-usuario>.github.io/proyecto-roxana/`. Después, cada
`git push` republica solo. El repo debe ser público (GitHub Pages gratis lo requiere).

## Stack

- **Phaser 4** (exploración top-down en canvas)
- **TypeScript + Vite**
- **UI en DOM/HTML**: diálogos, vistas de banco (puzzles) y la Bitácora viven en el
  DOM, no en el canvas — texto nítido, accesible y exportable.
- **Progreso**: `localStorage` (local-first, sin backend).

## Estructura

```
src/
  main.ts                  arranque, pantalla de título, config de Phaser
  state.ts                 flags de progreso, guardado, hooks de mundo
  styles.css               estética completa (greybox + Bitácora papel)
  game/
    rooms.ts               las 6 salas, diálogos, gating de la secuencia
    ExplorationScene.ts    escena top-down: movimiento, colisiones, puertas, interacción
  ui/
    dialog.ts              caja de diálogo + toast
    bench.ts               marco de la "vista de banco" (primer plano de puzzles)
    bitacora.ts            el libro: índice + entradas, botón del HUD
    end.ts                 pantalla de cierre del slice
    overlay.ts             contador de overlays (pausa el input del juego)
  puzzles/
    common.ts              widget de Ohm, piedras, medidor, ohmProbe, llaves, fusibles
    despertar.ts           U1-1: el camino completo
    freno.ts               U1-2: la resistencia como freno
    puerta.ts              U1-3: la relación V-I-R (3 soluciones válidas)
    bell.ts / chain.ts / branches.ts / distributor.ts / timbre.ts
                           U2: campana, Cadena (serie), Ramales (paralelo),
                           el Repartidor (evento mayor) y el timbre del Instituto
                           (cada uno con su xModel.ts puro y tests en tests/)
  content/
    entries.ts             entradas de la Bitácora (dos capas, contenido dinámico)
docs/
  diseno-sintesis-v1.md    diseño general del juego (sistemas, formato, arquitectura)
  prologo.md               guion detallado del prólogo en la escuela
  unidad-1-ohmdal.md       síntesis del mundo Ohmdal + guion de la Unidad 1
  unidad-2-caminos.md      guion de la Unidad 2: el Castillo (serie/paralelo)
  unidad-3-forja.md        diseño de la Unidad 3: la Forja (potencia, Joule, energía)
  unidad-4-terrazas.md     diseño de la Unidad 4: las Terrazas (KVL, divisores, escalera)
  unidad-5-faro.md         diseño de la Unidad 5: el Faro (capacitor, tiempo) — cierre Arco I
  ohmdal-ruta-contenidos.md  ruta completa de Ohmdal (arcos I-II + el Empalme) y corte de la v1
  plan-implementacion-u2.md  hitos M0-M8 para construir la U2 (handoff a agente de código)
  estandar-implementacion.md workflow multi-modelo: Fable planifica/audita, ejecutores codifican
```

## Reglas de diseño que el código respeta

1. **Fenómeno antes que fórmula**: `I = V/R` solo existe en la entrada «La Ley de Ohm»,
   que se desbloquea al abrir la Puerta. Antes, todo es Empuje / Río / Piedra / Camino.
2. **La Bitácora registra, nunca anticipa**: las entradas se desbloquean por flags de
   comprensión y algunas se completan solas después (p. ej. los «nombres verdaderos»).
3. **El error es información**: quemar el fusible no castiga — y completa la sección
   «errores comunes» de la Bitácora. Si el jugador nunca quemó nada, esa sección
   queda en blanco con una invitación a probar (que se puede cumplir: los bancos
   quedan en **modo práctica** después de resueltos).
4. **Los NPCs reaccionan, no explican**: Edda (escepticismo), Lumen (tradición),
   Ohm (estado del circuito, sin palabras). Edda y Lumen acompañan físicamente la
   historia: plaza → taller → Puerta → plaza restaurada, según el progreso.

## Controles

- **PC**: flechas / WASD para moverse · E o click para interactuar · **B** abre y
  cierra la Bitácora · Escape la cierra.
- **Mobile**: tocar el piso para caminar, tocar objetos para usarlos.

## Limitaciones conocidas del greybox

- El tap-to-move no tiene pathfinding: si hay un mueble en línea recta, el jugador
  se detiene (con teclado se esquiva sin problema). Para la versión con arte:
  steering simple o grilla de navegación.
- Sin audio todavía. La campana final pide un sonido real a gritos.
- El render del juego usa formas planas de Phaser a propósito: el layout de salas
  está pensado para reemplazarse por tilesets sin tocar la lógica
  (las salas son datos en `rooms.ts`).
