# Proyecto Roxana

Aventuras educativas para web: el jugador descubre relaciones al intervenir en
mundos que reaccionan. La Bitácora pone nombre a lo que ya experimentó.

El foco actual es **Ohmdal Arco I: La Luz**, una aventura de electricidad y
electrónica en PlayCanvas Engine v2 y TypeScript. El recorrido va desde la Plaza
y el Taller hasta el Faro. Se está trabajando en su calidad visual, inmersión,
narrativa y aprendizaje a través de los puzzles.

## Ejecutar

```bash
npm ci
npm run dev
```

Abre `/ohmdal-playcanvas` en la URL que indique Vite. El runtime está en
`src/experiences/ohmdal-playcanvas/`; reutiliza sistemas de `ohmdal-plaza`.
`/jugar` y los prototipos de otros mundos siguen disponibles como baselines.

### Arithmos · Las formas del regreso

Abre `/arithmos/` o entra por Matemática en el Instituto. Arco I recorre seis
lugares de un puerto sobre una ballena: transformar pasarelas, repartir carga,
desplegar velas, restaurar jardines y devolver el vuelo a la ciudad. Three.js
presenta la materia; un dominio TypeScript puro conserva sus unidades y valida
las relaciones. El progreso y la Bitácora se guardan en este navegador.

Arrastra las piezas y usa sus herramientas para cambiar su forma, separar y
reunir. También puedes usar C para seleccionar, flechas para mover, R para girar,
[ / ] para cambiar el ancho, X para separar, J y luego C para reunir, Z/Y para
deshacer/rehacer y V para mirar en planta. En touch hay ampliación, desplazamiento
con dos dedos y controles por pasos. Esc abre pausa, sonido y movimiento reducido.
Para cortar, marca el comienzo de la segunda parte en la miniatura, revisa los
dos contornos y confirma «Separar lo marcado».

```bash
node scripts/gameplay/playtest-arithmos.mjs
node scripts/gameplay/playtest-arithmos-touch.mjs
node scripts/gameplay/playtest-arithmos-gestures.mjs
```

Los recorridos usan por defecto `http://127.0.0.1:5197/arithmos/`; configura
`ARITHMOS_URL` si Vite está en otro puerto. Evidencia local: `output/arithmos-*`.
Diseño rector: [GDD de resultados](docs/20-worlds/arithmos/ARITHMOS_AAA_OUTCOME_GDD_v1.md).

## Verificar

```bash
npm run build
npm test
npm run playtest:ohmdal-golden-path -- --gpu --reload-checkpoints
```

`npm run verify` reúne build, tests y checks de contenido. Los cambios visibles
también se recorren en navegador y touch. Capturas y resultados van en `output/`.

## Orientarse

- [Reglas breves de trabajo](AGENTS.md).
- [Ohmdal: diseño, estado y fuentes](docs/20-worlds/ohmdal/AGENTS.md).
- [Guía de puzzles](docs/guia-puzzles.md).
- [Mapa de documentación](docs/README.md).
- [Prioridades](ROADMAP.md).

Instituto, Physica, Bitland y Arithmos conservan sus propios diseños y tecnologías.
No es necesario leer sus documentos para trabajar en Ohmdal. Los informes de
iteraciones retiradas se consultan en el historial Git.
