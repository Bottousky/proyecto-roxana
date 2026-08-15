# Proyecto Roxana — Mundos Aplicados

Juego narrativo educativo. Un estudiante nuevo llega al Instituto Roxana y descubre
los **Mundos Aplicados**: mundos creados por la escuela para enseñar, hoy degradados
en ritual y superstición. En **Ohmdal**, el mundo de la electrónica, restaura el reino
aprendiendo jugando los circuitos de corriente continua.

La fuente de verdad para la dirección actual está en
[`docs/START_HERE.md`](docs/START_HERE.md) y en la
[`Biblia canónica de Ohmdal`](docs/ohmdal-biblia/00_MASTER_INDEX.md): Instituto, mundos,
Bitácora, arquitectura híbrida y el futuro slice HD-2D. La implementación Phaser que sigue
descrita abajo es la base estable de regresión, no la presentación futura aprobada.

La visión de producto es un solo juego con cinco lenguajes de experiencia: el Instituto como
mundo real y nexo; Ohmdal para electrónica; Bitland para programación; Physica para física; y
Arithmos para matemática. Comparten protagonista, progreso, narrativa y Bitácora, pero cada
mundo adopta la cámara y la gramática jugable que mejor expresa su disciplina.

**Estado:** **Arco I completo** — greybox jugable de punta a punta, las cinco unidades:
U1 «La corriente no es magia» (Ley de Ohm), U2 «El río se reparte» (serie/paralelo, el
Castillo), U3 «El precio del río» (potencia/Joule, la Forja), U4 «La vuelta completa»
(Kirchhoff/escalera, las Terrazas, la predicción), U5 «La chispa que se queda» (capacitor/
tiempo, el Faro) — y cierra con **la noche de Ohmdal**. Formas y sistemas, sin arte final.
Es el corte v1 del producto: circuitos de DC, cinco unidades.

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

`dist/` es un sitio estático servido desde la raíz (`base: '/'`): se puede subir tal
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

## Stack actual

- **Phaser 4** (base estable de Ohmdal, exploración top-down en canvas)
- **Three.js** (Instituto y futuro Ohmdal HD-2D aislado bajo `RuntimeHost`)
- **TypeScript + Vite**
- **UI en DOM/HTML**: diálogos, vistas de banco (puzzles) y la Bitácora viven en el
  DOM, no en el canvas — texto nítido, accesible y exportable.
- **Progreso**: `localStorage` (local-first, sin backend).

Ohmdal es la primera experiencia completa y la base estable de regresión del repositorio. Su
narrativa, estado y modelos pedagógicos se preservan mientras un laboratorio aislado rediseña
escala, mundo, arte y puzzles. La implementación actual no está aprobada como diseño final.

## Estructura

```
src/
  main.ts                  shell y arranque del runtime actual
  state.ts                 flags de progreso, guardado, hooks de mundo
  styles.css               estética completa (greybox + Bitácora papel)
  experiences/
    manifests.ts           identidad y gramática de los cinco mundos
    registry.ts            sala → experiencia activa
    types.ts               contratos compartidos iniciales
  jugar/
    rooms.ts               23 salas, diálogos y gating del Arco I
    ExplorationScene.ts    escena top-down: movimiento, colisiones, puertas, interacción
    world.ts               composición de mundos continuos
    visuals.ts             lenguaje visual procedural top-down actual (prototipo)
  ui/
    dialog.ts              caja de diálogo + toast
    bench.ts               marco modal actual de puzzles (deuda a reemplazar en el spike)
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
  README.md                mapa de documentos y autoridad vigente
  START_HERE.md            norte de producto y arquitectura
  AGENTS.md                manual operativo del estudio (este repo)
  guia-puzzles.md          canon para diseñar y auditar puzzles (CANON)
  asset-manifest.yaml      contrato runtime de assets 3D
  guion-instituto.md       texto canon del aula de Electrónica (M3 del Instituto)
  biblia-estilo-instituto.md  cámara ¾ top-down y escala del Instituto (referencia histórica)
  diseno-sintesis-v1.md    diseño general (loop, tono, reglas pedagógicas comunes)
  prologo.md               guion detallado del prólogo en la escuela
  00-governance/           pilares, política de canon, lenguaje de diseño, arquitectura documental
  10-global/               biblia global: Instituto, Bitácora, metaprogresión, UI/UX, vertical slice
  20-worlds/               GDD modular por mundo: vision / gameplay / world / narrative / content / production
    ohmdal/                CONECTAR — único mundo en producción real
    physica/               EXPERIMENTAR — Hito 1 hecho (Babylon)
    bitland/               PROGRAMAR — PROPOSED, sin código todavía
    arithmos/              TRANSFORMAR — PROPOSED, sin código todavía
  30-integration/          catálogo de cruces interdisciplinarios + mapa de autoridad de contenido
  ohmdal-biblia/           biblia canónica de Ohmdal (histórica — precede a la v1 de 20-worlds/)
  arco1/                   dirección visual del Arco I: identidad, color, encuadres, presupuestos
  3d/                      contratos y toolchain del ecosistema 3D
  sessions/                bitácora de las sesiones de diseño (P1–P6)
```

Qué se está construyendo ahora y en qué orden: [`ROADMAP.md`](ROADMAP.md).
Cómo se trabaja: [`CLAUDE.md`](CLAUDE.md).

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

## Limitaciones conocidas de la base Ohmdal

- El supuesto mundo continuo está compuesto por sectores fijos de 960 × 540; conserva movimiento
  entre ellos, pero no produce todavía una región orgánica y autorada.
- La mayoría de los puzzles abre una vista de banco DOM y separa la manipulación del escenario.
  El spike siguiente debe convertir un puzzle representativo en un mecanismo diegético.
- El tap-to-move no tiene pathfinding: si hay un mueble en línea recta, el jugador
  se detiene (con teclado se esquiva sin problema). Para la versión con arte:
  steering simple o grilla de navegación.
- El arte actual es procedural/greybox y todavía necesita el pase de producción por zona.
- El Instituto conserva temporalmente el runtime cenital; su reemplazo 3D/2.5D depende de un
  spike de rendimiento y producción, no de una decisión estética aislada.
