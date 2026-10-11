# Arithmos

Aventura gráfica dibujada con tiza: el primer Mundo Aplicado de Roxana. Comprender por qué
funcionan las ideas matemáticas. Contrato y estado: [docs/arithmos](../../docs/arithmos/).

## Jugar

```sh
node scripts/serve.mjs 4195
```

Abrir `http://127.0.0.1:4195/`. No necesita instalar nada ni conexión: HTML, módulos ES,
Canvas 2D, WebGL y WebAudio. Funciona con teclado (Tab, Enter/Espacio, Escape), mouse y
pantalla táctil.

**La Bitácora** (≡ → Bitácora): «Arithmos · Tomo 1», el cuaderno del jugador a su nombre (el de Dirección, en la
escuela 3D), con la foto de su pizarra en cada capítulo y su propia pregunta; se descarga en PDF (pliegos A4 o libro
A5). Diseño: [docs/arithmos/ARITHMOS_BITACORA.md](../../docs/arithmos/ARITHMOS_BITACORA.md).

## Pruebas

- `npm test` — lógica matemática, guardado, animación y Bitácora.
- `node scripts/bitacora-check.mjs <salida> <state.json>` — la Bitácora en el navegador: capturas y los dos PDF.
- `node scripts/playthrough.mjs <salida> [--reload] [--route=errores|directa] [--watch --film] [--size=1024x768 --touch]`
  juega el capítulo usando sólo la interfaz (requiere Chrome instalado y `playwright`, que ya
  está en `node_modules` de la raíz del repositorio). Valida el sistema, no el aprendizaje.
- `--film` guarda cuadros del screencast de Chrome y un `film/index.html` para verlos a velocidad real.

## Estructura

- `src/engine/` — tiza (`chalk.js`), compuesto del pizarrón (`renderer.js`), cámara, figura,
  mundo, director de escenas, interfaz accesible, audio procedural, guardado.
- `src/ch1/` — capítulo 1: lugar y actores (`common.js`) y escenas (`scenes.js`).
- `src/logic/` — reglas matemáticas puras y comprobables.
- `assets/fonts/` — Kalam y Atkinson Hyperlegible (OFL, licencias incluidas).

Guardado local en `roxana.arithmos.v1` (partida) y `roxana.arithmos.settings.v1` (opciones).
