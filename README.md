# Ohmdal · La Luz

Aventuras en las que se aprende actuando sobre el mundo. Ohmdal es un reino cuya
vida cotidiana depende de una electricidad que sus habitantes aprendieron a usar
y, con los años, dejaron de comprender. Recuperar ese conocimiento transforma
sus lugares, sus oficios y sus relaciones.

## Jugar

En Windows, abrí **Jugar Ohmdal.cmd**. Se abre el juego en tu navegador.
La partida se guarda automáticamente en ese navegador. En Opciones podés exportar
o importar una copia de tu bitácora. Los cambios de navegador o dirección usan
guardados separados.

- **WASD / flechas:** caminar. **Shift:** correr. También podés hacer clic en el suelo.
- **E:** interactuar. **Enter:** continuar una conversación.
- **J:** bitácora. **M:** mapas de la zona y del reino, y regreso a lugares conocidos.
  **Escape:** pausa.
- **Q:** medir con Ohm junto a una instalación, sin salir del escenario.
- En un mecanismo, tocá dos bornes para unirlos. Las herramientas permiten medir;
  los cables se retiran tocándolos. Podés experimentar y volver sin perder tus pruebas.
- Cuando la instalación funciona, **Poner en servicio** conserva la reparación y
  devuelve la cámara al mundo.

El juego y sus fuentes, arte y sonido funcionan localmente. Requiere un navegador
con WebGL2 y Node.js 22.12 o posterior para el servidor local. Las dependencias ya
instaladas y una compilación preparada permiten jugar sin conexión.

## Desarrollo

```sh
npm ci
npm run dev
```

Abrir `http://127.0.0.1:4173`. `npm run build` prepara `dist/`;
`node scripts/server.mjs` sirve esa compilación en `http://127.0.0.1:4180`.
`npm test` comprueba las redes eléctricas, los estados guardados y la progresión.

El controlador está en `src/main.js`; los escenarios en `src/world.js`; el contenido
en `src/content.js`; la simulación y los paneles en `src/electrical.js` y
`src/puzzles.js`; la música original en `src/audio.js`.

Las nueve zonas comparten con el mapa su trazado de caminos, patios y orillas.
Los ocho exteriores forman un recorrido continuo: `ContinuousWorld` mantiene
el Arco I preparado en memoria y dibuja el sector activo y sus vecinos dentro
de una geografía común, sin construcción de sectores ni fundidos al
caminar entre ellos. El instrumento de viaje reúne brújula, momento del día,
ubicación, objetivo, Bitácora, mapa y opciones. El tiempo avanza con la historia
y se conserva al volver. Ver [geografía y tiempo](docs/GEOGRAFIA-Y-TIEMPO.md).
Las diez casas conservadas tienen sus fachadas y accesos despejados, y los límites jugables son visibles.
La [revisión de composición](docs/composition-review.md) registra los cambios y su validación en las nueve zonas.

## Material de producción

- [Lore](LORE.md): el Instituto Roxana, el mundo, sus habitantes y sus misterios.
- [La Luz](ARCO_I.md): recorrido narrativo, conflictos y transformación de la comunidad.
- [Contenido pedagógico](PEDAGOGIA.md): aprendizajes, progresión y fundamentos eléctricos.
- [Diseño implementado](docs/arc1-design.md).
- [Inventario de verificación](docs/production.md).
- [Colisiones y arquitectura frontal](docs/collisions.md).
- [Caminos, accesos y mapas del mundo](docs/world-layout.md).
- [Arte y procedencia](docs/assets.md).
