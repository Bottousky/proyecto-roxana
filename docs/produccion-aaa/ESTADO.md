# Ohmdal · Arco I — estado del loop de producción

Encargo: [OHMDAL_AAA_LOOP.md](../../OHMDAL_AAA_LOOP.md). Este archivo es el punto de reanudación:
objetivo actual, hechos comprobados, backlog priorizado, evidencia y siguiente acción.
Las capturas y reportes viven en `experiments/playcanvas/output/` (no versionado); acá se
cita la revisión de código que los produjo.

## Base del proyecto (comprobada el 5 oct 2026)

- Implementación activa: **PlayCanvas** en `experiments/playcanvas`, rama `codex/playcanvas-slice`.
  La versión Three.js de `src/` sólo se usa para exportar geometría (`export-scene.mjs`) y como
  fuente del canon que `sync-game.mjs` copia a `src/game/`. No hay AGENTS.md ni CLAUDE.md.
- Canon: `ARCO_I.md`, `LORE.md`, `PEDAGOGIA.md`. Crítica más reciente:
  `docs/critica-arco1-jugabilidad-pedagogia-lore-2026-09-25.md`; sus ocho hallazgos tienen
  commits del 26 sep que dicen atenderlos (relato según evidencia, volver ≠ poner en servicio,
  Ivara/Nereo exigen comprobación, primera clase antes del cierre, habitantes hacen uniones
  rutinarias, Terrazas con línea compartida). Verificación pendiente en este loop.
- Equipo de esta sesión: MacBook Apple M2, macOS 26.7.1, Chrome instalado, Node 26.10 (Homebrew).
  Blender 5.2.2 instalado el 5 oct con Homebrew (`bake-ao.mjs` lo usa al reexportar el mundo).
- Línea base en `2397b6f`: `npm test` 81/81, `npm run check` correcto, `npm run build` correcto
  (26 MB en `dist/`, geometría 11,3 MB, JS 2,5 MB / 677 kB gzip).

- Partida automatizada completa en la base (`2397b6f`, Chrome headless en el M2): **completa**,
  9 zonas, 9 bancos, 9 recuerdos, final, epílogo y recarga; 0 errores de página/consola;
  ~7 min con soluciones conocidas. No hay bloqueos de progresión conocidos.

## Ciclo 1 · Moverse y hablar sin tropiezos (5 oct 2026)

Defectos observados en la base y su reproducción:

1. **El jugador desaparece detrás del primer plano.** En 4 de 9 llegadas de la partida
   automatizada (Plaza, Castillo, Lago, Manantial parcial) un árbol tapa la figura; en el Lago
   no se ve nada (`output/baseline-2397b6f/playthrough-24-lake-arrival.png`). No existía
   ningún tratamiento de oclusión.
2. **Enter reabre la conversación que acaba de cerrar.** Enter/E continúan el diálogo y también
   interactúan; tras la última línea, cada par de pulsaciones vuelve a abrir a Edda en bucle.
   Reproducción: `GAME_URL=http://127.0.0.1:4193/ node scripts/qa-dialogue-input.mjs` contra la base.
3. **Utilería sobre el eje de los caminos.** Equipaje del Portal en la curva del camino al
   pueblo (el baúl a 0,67 m del eje), puesto de fruta y banco cortando el circuito de la
   fuente, cajón de manzanas sobre la calle del Mercado. El comentario de `dressing.js`
   prometía lo contrario y ninguna prueba lo comprobaba.

Cambios:

- `src/see-through.js`: lo que queda entre la cámara y la figura (árboles, follaje, muros,
  aleros) se abre en una trama Bayer dentro de una cápsula de pies a cabeza. Sólo lo que está
  0,9 m más cerca de la cámara que los pies: suelo, agua, orillas y puentes no se agujerean;
  sombras y selección no cambian.
- `src/game/main.js`: después de cerrar un diálogo, E/Enter/Espacio necesitan 450 ms de calma
  para volver a interactuar; cada pulsación en ese lapso lo prolonga.
- `src/dressing.js`: equipaje contra la cerca del Portal; puesto de fruta al este de la
  fuente, banco al borde del circuito, cajón de manzanas al sur de la calle del Mercado.
- Pruebas/QA: `tests/dressing.test.js` comprueba el eje de cada camino (falla con la base);
  `scripts/qa-dialogue-input.mjs` (falla con la base, pasa ahora).
- Herramientas: `scripts/chrome.mjs` (Chrome por plataforma), `scripts/serve-snapshot.mjs`
  (copia congelada para partidas largas), `GAME_URL`/`PLAYTHROUGH_OUTPUT` en `playthrough.mjs`.

Verificación (runtime idéntico al commit del ciclo 1; la copia evaluada se comparó archivo por archivo):

- `npm test` PlayCanvas 82/82, raíz 282/282 (la raíz necesitó `npm ci`; el arnés de
  `tests/cinematic-startup.test.js` ahora provee `performance`, que el controlador usa al cerrar
  un diálogo), `npm run check` correcto.
- Partida automatizada completa sobre la copia congelada: terminada, 0 errores, 9 zonas,
  9 recuerdos, recarga final (`output/playthrough-cycle1/`, 417 s).
- Antes/después, misma partida y cámara: `output/baseline-2397b6f/playthrough-NN-*.png` contra
  `output/playthrough-cycle1/playthrough-NN-*.png`. Lago (24): de invisible a figura entera;
  Castillo (18) y Plaza (05): de cabeza o torso a cuerpo completo. Espigón del Faro (25): sin
  agujeros en el piso ni en la baranda.
- `scripts/qa-dialogue-input.mjs`: pasa; con la base falla («la conversación quedó abierta»).
- Rendimiento comparado en la misma escena (bitácora final, viaje por mapa, 300 cuadros,
  1440×900, Chrome headless + Metal, M2): Lago y Plaza a 16,6 ms de media y 16,8 ms p95 en
  ambas versiones. Está topado por la sincronía vertical: muestra que no hay regresión, no el
  margen disponible. No es una medición en pantalla real.
- Revisión visual con `scripts/visit.mjs`: puesto de fruta (mira a la fuente desde el este),
  banco al borde del circuito, equipaje detrás del murete del Portal.

Autocrítica: la trama se nota como punteado al pasar detrás de copas (es la solución elegida,
no un defecto oculto). **Ohm no está cubierto**: en el Lago sigue tapado. Las casas visitables
(`homes.js`) usan otros materiales y no se abren. Los postes de la escena sobre caminos
siguen ahí (backlog 4).

## Ciclo 2 · Ohm visible, faroles fuera de las calles y una ruta adversarial (5 oct 2026)

- **Ohm también se ve detrás del primer plano**: segunda cápsula en `src/see-through.js`.
  En la llegada al Lago del ciclo 1 seguía oculto; ahora se ven ambos
  (`output/playthrough-cycle2/playthrough-24-lake-arrival.png`).
- **Faroles fuera de las calles**: el de la calle del Mercado y dos de Terrazas estaban sobre
  el eje del camino. Se movieron en la fuente (`src/world.js` raíz) y se reexportó el mundo.
  Blender 5.2.2 instalado con Homebrew; `bake-ao.py` usa Metal: exportación + horneado en 4 min.
  Diferencias verificadas: obstáculos y luces sólo de esos faroles; vértices sólo en el
  empedrado de Plaza y Terrazas (+54 c/u, el pavimento rodea sólidos); relieve idéntico;
  comparación visual lado a lado sin cambios ajenos (`output/cmp-*.png`). La auditoría de
  «atravesables» da lo mismo que en la base. Prueba nueva: postes de escena fuera del eje de
  cada camino (falla con la escena anterior).
- **Banco sin cables fantasma**: con cero cables en la mano (o la instalación ya en servicio)
  tocar un borne ya no «toma un cable» ni deja la indicación pidiendo apoyar un extremo.
  Prueba en `tests/bench-guidance.test.js` (falla sin el arreglo). Copia raíz y PlayCanvas.
- **Ruta adversarial** en el mismo arnés (`ROUTE=adversarial node scripts/playthrough.mjs`):
  salida bloqueada probada temprano, cable equivocado deshecho y banco abandonado, recargas
  con el banco a medio hacer, durante escenas (despertar, Puerta, Faro) y al llegar al Lago,
  interfaces abiertas y cerradas en serie, frenos equivocados en la Puerta, regreso físico
  Castillo → Plaza y vuelta, y Edda respondiendo tras el final. El informe guarda ahora todas
  las líneas de diálogo; las dos rutas comprueban que el cierre de la Puerta narra el freno
  que se tocó.
- Herramientas: `scripts/compare.mjs` (antes/después lado a lado), `scripts/qa-type-sizes.mjs`.

Verificación (runtime idéntico a la copia evaluada; comparación archivo por archivo):

- `npm test` PlayCanvas 83/83, raíz 283/283; `npm run check` correcto.
- Ruta principal completa (`output/playthrough-cycle2/`, 381 s, 0 errores) sobre la revisión
  sin el arreglo de cables; ruta adversarial completa sobre la revisión del commit
  (`output/adversarial-cycle2/`, 548 s, 0 errores, 224 líneas de diálogo registradas). En la
  primera corrida adversarial falló una aserción del arnés (`undefined` frente a `false`); el
  juego no había puesto el banco en servicio. Se corrigió el arnés, no el criterio.
- Pendiente de esta pasada: la ruta adversarial todavía no cubre equivocarse en Terrazas ni en
  las tres etapas del Faro, ni las pantallas táctiles.

## Backlog priorizado (orden del encargo)

| # | Categoría | Problema observado | Estado |
|---|---|---|---|
| 1 | Navegación | Jugador tapado por el primer plano | Hecho (ciclo 1) |
| 1b | Navegación | Ohm tapado por el primer plano (la trama sólo sigue al jugador) | Hecho (ciclo 2) |
| 2 | Interacción | Enter reabre conversaciones | Hecho (ciclo 1) |
| 3 | Navegación | Utilería sobre caminos | Hecho (ciclo 1) |
| 4 | Navegación | Faroles de la escena sobre caminos (Mercado y Terrazas) | Hecho (ciclo 2) |
| 5 | Presentación | Profundidad de campo: el destino de cada llegada (fuente, rueda del Manantial, Castillo) queda borroso en el tercio superior | Pendiente |
| 6 | Presentación | Llegadas con grandes ocluyentes borrosos en primer plano (torre de la Puerta al entrar al Manantial, torre del Castillo en Terrazas) | Pendiente |
| 7 | Arte | Interior del taller de Lumen: caja oscura casi vacía, la escena clave más pobre | Pendiente |
| 8 | Momentos | Despertar de Ohm: 5,3 s y una línea; revisar los cuatro momentos construidos | Pendiente |
| 9 | Puzzles | Verificar en juego los 8 hallazgos de la crítica del 25 sep | Pendiente |
| 10 | UI | Banco: tomaba un cable sin tener ninguno y la indicación «Ahora tocá otra pieza…» quedaba tras resolver | Hecho (ciclo 2) |
| 11 | UI | Título a 800×600 recorta «OHMDAL» | Pendiente |
| 12 | Rendimiento | Medir build de producción en el M2: FPS, carga, memoria por zona | Pendiente |
| 13 | Móvil | Controles táctiles y 390×844 (emulación; hardware real NO VERIFICADO) | Pendiente |
| 14 | Audio | Sin escucha posible en esta sesión: revisar mezcla por código | Pendiente |
| 15 | Presentación | Tipografía diminuta a 1280×720: rol del hablante 8 px, «Continuar» 10 px, teclas del recordatorio 8 px, guardado 9 px, rótulos de Bitácora/mapa 8–10 px, notas de opciones 10 px (`scripts/qa-type-sizes.mjs`) | Pendiente |
| 16 | Navegación | 16 detalles a la altura del pecho sin colisión (postes de porche y toldo, marcos), ya presentes en la base (`scripts/audit-walkthrough.mjs`) | Pendiente |
| 17 | Assets | `portraits.webp` y `portraits-2.webp` (semirrealistas) ya no se usan: los retratos activos están en `art-polish/` y coinciden con los sprites | Limpieza |

## Comandos útiles (desde `experiments/playcanvas`)

```sh
npm test && npm run check && npm run build
npm run dev                         # 127.0.0.1:4190
node scripts/playthrough.mjs        # partida completa por teclado y clics, guardado aislado
```

Los scripts de navegador eligen Chrome por plataforma (`scripts/chrome.mjs`, `CHROME_PATH`).

## Siguiente acción

Ciclo 3: legibilidad (15): piso de 12 px para texto informativo y 11 px para rótulos, en
escritorio y en 390×844, con `scripts/qa-type-sizes.mjs` antes/después (incluir un banco).
Después: ficha breve por puzzle y auditoría del modelo eléctrico (9), profundidad de campo (5),
interior del taller (7). Reexportar el mundo ya es posible: `npm run export:world` (4 min).

Servidores de trabajo: `npm run dev` (4190, código vivo), `node scripts/serve-snapshot.mjs 4192`
(copia congelada para partidas largas), base `2397b6f` en un worktree en 4193 para comparar.
