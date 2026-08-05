# Roadmap

**Meta:** el Instituto Roxana como maqueta 3D navegable, con el Arco I de Ohmdal jugable
dentro en HD-2D (referencia: *Dragon Quest III HD-2D Remake*).

Un hito = algo que se puede abrir en el navegador y jugar. Se hace uno por vez.

---

## Decisiones tomadas

**El Instituto** es la maqueta 3D de `/` (Three.js, cámara fija con transiciones entre la vista
general y cada sala). Se navega, no se camina dentro. El hub greybox caminable de Phaser
(`src/experiences/instituto/EscuelaHubScene.ts`) queda descartado.

**Ohmdal se ve en HD-2D.** 2.5D con la gramática de DQ III HD-2D: sprites sobre dioramas 3D,
cámara casi ortográfica, profundidad real. Full 3D también es aceptable si el resultado se
sostiene. La investigación que respalda esto ya está escrita en
[`docs/ohmdal-biblia/15_DQ3_HD2D_RESEARCH_AND_APPLICATION.md`](docs/ohmdal-biblia/15_DQ3_HD2D_RESEARCH_AND_APPLICATION.md).

---

## Qué funciona hoy

Verificado en el navegador el 2026-08-04:

- **`/` — el Instituto en 3D.** Three.js sobre un GLB con la iluminación horneada en vertex
  colors (sin luces en tiempo real). Cámara fija con transiciones entre la vista general y
  cada sala. La talla de Roxana es el único objeto iluminado. Sin errores de consola.
- **`/jugar` — Ohmdal, Arco I completo.** U1–U5 jugable de punta a punta: Plaza, Taller,
  Puerta, Castillo, Forja, Terrazas, Faro. Puzzles con modelo puro y tests. Es **topdown
  Phaser con arte greybox**: el contenido está, el look no es el que queremos.
- **`/labs/ohmdal-hd2d-preprod/` — el prototipo HD-2D.** Three.js, 3.639 líneas. Cámara casi
  ortográfica, estudiante de 4 direcciones, Ohm como sprite, hora del día, oclusión,
  navegación, materiales y luz de blockout. Además tiene modelos educativos propios (circuito,
  diagnóstico, instrumento, Bitácora, fichas). **Es el look que queremos, con geometría de
  prueba y sin contenido del Arco I.** Hoy es una página suelta, no parte del juego.
- **La Bitácora.** Dos capas (huella vivida / traducción técnica), gateada por flags.
- **El portal Instituto ↔ Ohmdal.** `portalGateUrl()` lleva a la Plaza; `portalExitUrl()`
  vuelve al aula de Electrónica. Con transición visual y sonido.
- **El shell de runtimes.** `RuntimeHost` monta y desmonta mundos; `experiences/loaders.ts`
  los carga con `import()` dinámico, así que visitar Ohmdal no descarga Bitland.
- **57 archivos de test** y `npm run build` en verde.

## El problema de fondo

Están el **contenido** y el **look** en dos lugares distintos, y ninguno de los dos sirve solo:

| | Contenido del Arco I | Look HD-2D |
|---|---|---|
| `/jugar` | ✅ completo, U1–U5 | ❌ topdown greybox |
| `/labs/ohmdal-hd2d-preprod/` | ❌ geometría de prueba | ✅ |
| `/ohmdal` | ❌ sólo un slice | ❌ tiles GBA |

El trabajo real de acá en más es **casarlos**: llevar el contenido de `/jugar` al renderer del
lab, sala por sala. `/jugar` se conserva jugable como referencia de contenido y red de
seguridad hasta que el HD-2D lo alcance.

`/ohmdal` (el slice de tiles GBA, 1.109 líneas) no aporta a ninguna de las dos columnas.
**Propuesta: borrarlo.** Queda en el historial de git.

---

## Hitos

### H1 — Sacar el HD-2D del laboratorio

Que deje de ser una página suelta en `/labs/` y pase a ser un runtime del juego, montado por
`RuntimeHost` como cualquier otro mundo. Ya existe el enganche (`hd2dRuntime.ts` y el runtime
`hd2d-three` en `loaders.ts`): falta que sea alcanzable desde el Instituto.

**Resultado:** tocás el aula de Electrónica en el Instituto 3D y aparecés en Ohmdal HD-2D.

### H2 — La Plaza de verdad, en HD-2D

Reemplazar el blockout de prueba por la Plaza real del Arco I con su contenido: Edda, Ohm,
la campana, las lámparas. El contenido ya está escrito en `src/jugar/rooms.ts`.

**Resultado:** la primera sala del juego con el look que querés, con sus personajes y diálogos.

### H3 — El primer puzzle en HD-2D

«Reactivar a Ohm» (U1), con su banco diegético en el mundo y no como modal a pantalla completa.
El diseño está en [`docs/arco1/diseno-bancos-ohm-lumen.md`](docs/arco1/diseno-bancos-ohm-lumen.md).

**Resultado:** se juega, no sólo se camina.

### H4 — Volver y que la escuela lo note

Al salir de Ohmdal, el Instituto muestra que estuviste: el aula de Electrónica cambia de estado
según los flags de la partida.

**Resultado:** la promesa del producto —«la escuela demuestra que recuerda lo que hice»—
funciona por primera vez.

### H5 — Arte real sobre el blockout

Reemplazar la geometría de prueba siguiendo la dirección ya congelada en
[`docs/arco1/`](docs/arco1/): identidad, color script, encuadres, presupuestos por escena.

**Resultado:** deja de parecer un prototipo.

### H6 — El resto del Arco I

Taller, Puerta, Castillo, Forja, Terrazas, Faro. Sala por sala, con el patrón que dejaron H2
y H3. Cuando la última cruce, `/jugar` se retira.

**Resultado:** hay un juego para mostrarle a alguien.

---

## Grietas conocidas

Cosas rotas o a medias que encontramos y no bloquean, pero conviene no olvidar:

- **`escuela_hub` no pertenece a ninguna experiencia.** Es la sala inicial por defecto
  (`src/state.ts:183`) pero no está en el `rooms` de ningún manifest, así que
  `experienceOfRoom()` devuelve `null` y funciona sólo por el fallback de `main.ts`.
- **`diseno-banco-diegetico.md` no existe.** `docs/arco1/diseno-bancos-ohm-lumen.md` lo cita
  como su complemento (el banco de la Puerta), pero el archivo no está en el repo.
- **Dos de los tres bancos de A1.U1 siguen siendo modales a pantalla completa.** El de la
  Puerta ya vive en el mundo; `ohm` y `lumen` no.
- **Safe areas en mobile 390×844:** 48,0 % de franja libre contra 60,1 % que pide el contrato
  de encuadres (`docs/arco1/SHOT_DECK.md`).
- **255 líneas sin commitear en el lab** (reasignación de teclas y botón de acción táctil).
  Compilan y pasan tests. Decidir si entran o se descartan al empezar H1.

## Aparcado

- **Los otros tres mundos** (Bitland, Physica, Arithmos): declarados en
  `src/experiences/manifests.ts` con `status: 'planned'` y un runtime placeholder. No se tocan
  hasta que el Instituto + Ohmdal estén cerrados.
