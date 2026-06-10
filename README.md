# Proyecto Roxana — Unidad 1 (vertical slice greybox)

Juego narrativo educativo. Un estudiante nuevo llega al Instituto Roxana y descubre
los **Mundos Aplicados**: mundos creados por la escuela para enseñar, hoy degradados
en ritual y superstición. La Unidad 1 («La corriente no es magia») lleva al jugador
a Ohmdal, donde descubre jugando la Ley de Ohm.

**Estado:** greybox jugable de punta a punta (formas y sistemas, sin arte final).

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
    common.ts              widget de Ohm, piedras con código de colores, medidor de aguja
    despertar.ts           Puzzle 1: el camino completo
    freno.ts               Puzzle 2: la resistencia como freno
    puerta.ts              Puzzle 3: la relación V-I-R (3 soluciones válidas)
  content/
    entries.ts             entradas de la Bitácora (dos capas, contenido dinámico)
docs/
  diseno-sintesis-v1.md    documento de diseño
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
