# Proyecto Roxana — CLAUDE.md

Juego narrativo educativo web. Phaser 4 + Three.js + TypeScript + Vite.
Sin backend, progreso en localStorage. UI de puzzles y Bitácora en DOM, no en canvas.

**Qué estamos construyendo:** la plataforma —el Instituto Roxana en 3D— con el Arco I de
Ohmdal jugable dentro. El roadmap vivo está en [`ROADMAP.md`](ROADMAP.md).

---

## Cómo trabajamos

Un hito por vez. Un hito es **algo que se puede jugar o ver funcionando** cuando termina.
Si no se puede abrir el navegador y verlo, no es un hito: es una tarea interna de otro hito.

El ciclo completo es:

1. Implementar.
2. `npm run build` y `npm test` en verde.
3. Verlo funcionando en el navegador.
4. Proponer el commit a Manuel y esperar su ok.

Nada más. Sin tickets, sin paquetes de evidencia, sin gates, sin fichas de estado.
Si algo de eso reaparece, está mal.

**Cuándo parar y preguntar:** cuando la decisión es de diseño (qué dice un personaje, cómo se
siente un puzzle, qué va en pantalla). Eso lo decide Manuel. Lo técnico se resuelve y se sigue.

---

## Reglas duras

- **El texto del juego no se inventa.** Se copia textual del guion. Si falta una línea:
  `// TODO(guion)` + placeholder neutro, y avisar.
- **Vocabulario técnico = spoiler.** `serie`, `paralelo`, `nodo`, `Kirchhoff` solo aparecen
  en la capa formal de la Bitácora, gateados por flags de formalización.
- **Modelo puro testeable por puzzle:** `src/puzzles/xModel.ts` + `tests/mX-x.test.ts`.
  Imports con extensión `.ts`. Los tests corren con `node --experimental-strip-types`.
- **Validación por condiciones, no por solución fija** — siempre ≥2 soluciones válidas.
- **Español neutro (tuteo).** El gate lo verifica.
- **Sin dependencias nuevas** sin pedirlo antes.
- **No romper lo jugable.** El Arco I de Ohmdal y la landing funcionan hoy: son la base de
  regresión. Cualquier cambio que los rompa se revierte, no se parchea.
- **Nunca commitear sin aprobación de Manuel.**

---

## Comandos

```bash
npm run dev      # http://localhost:5173
npm run build    # tsc + vite build
npm test         # todos los tests de tests/
npm run verify   # build + tests + gate de dialecto y spoilers (requiere bash)
```

---

## Dónde está cada cosa

```
src/
  main.ts                    arranque del shell y pantalla de título
  state.ts                   flags + save (setFlag, hooks.refresh/goto/travel)
  app/runtimeHost.ts         monta y desmonta runtimes; el shell no conoce Phaser ni Three
  experiences/
    manifests.ts             los cinco mundos como datos (status playable/planned)
    registry.ts              qué sala pertenece a qué experiencia
    loaders.ts               import() dinámico por runtime — un mundo no descarga otro
    instituto/               hub del Instituto (Phaser, greybox caminable)
    ohmdal/                  runtimes de Ohmdal: topdown (jugable) y hd2d (prototipo)
  landing/                   la plataforma: portada, Instituto 3D (Three.js), aulas, portal
  jugar/                     Ohmdal Arco I jugable — rooms.ts es TODO el contenido
  puzzles/                   cada puzzle: abrirX(onSolved). common.ts tiene los widgets
  content/entries.ts         Bitácora: getEntries() según flags, en dos capas
  shared/portalLink.ts       ida y vuelta Instituto ↔ Ohmdal
tests/                       un archivo por puzzle
docs/                        diseño y canon (ver docs/README.md)
```

---

## Documentación que importa

- [`docs/START_HERE.md`](docs/START_HERE.md) — el norte del producto
- [`docs/guia-puzzles.md`](docs/guia-puzzles.md) — **qué debe y qué no debe ser un puzzle.
  Leer antes de crear o auditar cualquiera.**
- [`docs/ohmdal-biblia/`](docs/ohmdal-biblia/) — canon de Ohmdal (mundo, guion, personajes)
- [`docs/arco1/`](docs/arco1/) — dirección visual del Arco I: identidad, color, encuadres,
  contenido educativo, presupuestos

---

## Verificar en el navegador

```js
// Spawn directo en cualquier sala:
localStorage.setItem('roxana-slice-v1', JSON.stringify({room: 'castle_heart', flags: {...}}))
// → reload → click en #btn-continue

// Tecla sintética (Phaser lee keyCode):
Object.defineProperty(e, 'keyCode', {get: () => 69}) // E = interactuar
// Para caminar: keydown → esperar N ms → keyup
// Para avanzar diálogos: click sobre #dialog (no E, puede re-disparar el thing)

// Bancos = DOM puro: operar con querySelector + .click()
// Ojo: .click() programático sobre un botón oculto igual dispara — falso positivo
```

## Qué mirar al revisar un cambio

- **Estados visuales superpuestos:** por cada `visible:` nuevo, ¿qué otro thing debe ocultarse?
- **Posicionamiento espacial:** el mapa no se ve leyendo código — revisar solapamientos en el navegador.
- **Huérfanos:** tras un cambio de diseño, grep del concepto viejo en docs Y código.
- **Guion con bugs propios:** si una spec tiene una contradicción aritmética, frenar y avisar.
