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
