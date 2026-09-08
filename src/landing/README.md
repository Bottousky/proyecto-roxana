# Instituto Roxana — portada y visita 3D

El entry real es `../../index.html`. La portada presenta el proyecto, sus mundos,
la forma de aprender, preguntas frecuentes y acceso al juego. La escuela Three.js
se carga por separado; el texto y los enlaces no esperan al GLB.

- `index.ts`: navegación, diálogos nativos, preferencias, Bitácora y arranque.
- `experience.css`: identidad editorial y responsive. `school3d.css`: escena,
  etiquetas, menú de salas y panel. `landing.css` conserva el aula gráfica anterior.
- `school3d.ts`, `school3dPostFx.ts`: modelo existente, cámaras por sala, grado de
  color con alfa conservado, calidad automática/alta/ligera y pausa fuera de vista.
- `preferences.ts`: validación y persistencia tolerante a almacenamiento bloqueado.
- `ambience.ts`: audio sintetizado original, sólo después de una activación explícita.

## Recorridos y datos

El CTA usa `portalGateUrl()` → `/jugar?from=portal&room=plaza`; continuar una partida
usa `/jugar`. Son las entradas jugables versionadas en la base de este worktree.
La versión nueva de Ohmdal que estaba sin commit en el checkout original no se
copió ni modificó: al integrarla, centralizar su destino y adaptador de guardado.
Physica se identifica como prototipo; Bitland y Arithmos, como mundos en preparación.

`#sala/electronica` abre una sala y admite historial, recarga, puntero y teclado.
`#aula/electronica` conserva el aula gráfica y sus proyecciones. Las once salas
tienen destinos existentes o abren la guía/Bitácora. La página puede desplazarse
en touch sobre el canvas; las flechas sólo se capturan con foco en la escena.

Preferencias: `roxana-visit-v1`. La Bitácora lee `roxana-slice-v1` y `roxana-web-v1`
sin modificar partidas. Los guardados de versiones experimentales son independientes.
El audio empieza silenciado en cada visita aunque antes se hubiera activado.
No hay registro, pagos, suscripciones ni sincronización remota. No se simulan envíos.

## Verificar

```sh
npm run dev -- --host 127.0.0.1 --port 5186
node scripts/landing/playtest-landing.mjs
npm run build
npm test
npm run verify
```

El playtest usa Chrome mediante Playwright, recorre desktop y touch 390 px, salas,
diálogos, teclado, historial, ajustes, audio, progreso, entrada real a Ohmdal y
fallas de WebGL/almacenamiento/JavaScript. `LANDING_URL` permite apuntar a otro
servidor. `npm run preview` también resuelve las entradas de los juegos. La build
incluye `_redirects` para el hosting estático compatible.

`node scripts/landing/capture-landing.mjs` guarda capturas y métricas en `output/playwright/`.
`--promote` actualiza únicamente los dos assets de presentación en `public/`: el
poster de respaldo y la tarjeta social de 1200 × 630. Se renderizan desde el modelo
real; las capturas de QA se guardan aparte, sin cambios de composición.

## Recursos

Se reutilizan los GLB del Instituto y la estatua del proyecto. La marca SVG,
ornamentos CSS y ambiente son originales de esta portada. Three.js utiliza MIT.
Las fuentes Cormorant Garamond y DM Sans se sirven localmente como WOFF2; conservan
todos sus glifos y las licencias SIL OFL en `fonts/`. Las imágenes de respaldo se
producen con el renderer propio; no se añadieron assets remotos ni dependencias.
