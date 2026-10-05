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

## Pruebas

- `node --test tests/` — lógica de correspondencia y guardado.
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
