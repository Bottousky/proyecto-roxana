# Producción reproducible — escuela 3D

## Fuentes de verdad

- Dirección: `docs/visual-target.md`
- Assets y presupuestos: `docs/asset-manifest.yaml`
- Progresión: `docs/progression-visual-map.yaml`
- Planta modular: `scripts/blender/school_plan.py`
- Geometría y bake: `scripts/blender/build_school.py`
- Runtime: `src/landing/school3d.ts`
- UI: `index.html` y `src/landing/school3d.css`

## Requisitos

- Node.js 20 o posterior.
- Blender 4.5 LTS.
- PowerShell en Windows.

`scripts/blender/build-school.ps1` busca Blender en `PATH`, en
`ROXANA_BLENDER_EXE` o en la instalación portable usada por el proyecto.

## Reconstrucción

```powershell
npm ci
npm run school:plan
npm run school:build
npm run school:report
npm run school:validate-gltf
npm test
npm run build
```

Prueba rápida de composición:

```powershell
& "$env:LOCALAPPDATA\Programs\Blender Portable\blender-4.5.12-windows-x64\blender.exe" `
  --background --factory-startup `
  --python ".\scripts\blender\build_school.py" -- --blockout
```

## Salidas

- `assets/school3d/instituto-roxana.blend`
- `assets/school3d/school-overview.original.glb`
- `assets/school3d/school-overview.glb`
- `assets/school3d/electronics-room.original.glb`
- `assets/school3d/electronics-room.glb`
- `assets/school3d/instituto-roxana.glb` (alias compatible del overview comprimido)
- `assets/school3d/school-preview-initial.png`
- `assets/school3d/school-preview-electronics-arc-1-complete.png`
- `docs/diagramas-instituto/plano-cenital-maestro.{svg,png}`
- `artifacts/performance/asset-report.{json,md}`
- `artifacts/performance/runtime-report.md`
- `artifacts/validation/school-plan-validation.json`
- `artifacts/validation/gltf-validation.json`

## Estados y validación

- Estado del save: abre `/`.
- Estado inicial forzado: botón “Ver estado inicial” después de simular, o recarga sin
  save válido.
- Arco 1 forzado: `/?progress=complete`.
- Scene editor: `/dev/scene-editor`.

Producción: `https://instituto-roxana.vercel.app/`. El smoke test publicado verifica
la portada, el editor, `/jugar` y `/ohmdal` sin errores de consola.

El editor permite seleccionar nodos semánticos, mover/rotar/escalar y copiar un JSON de
transformaciones. No escribe el `.blend`: las transformaciones aprobadas deben trasladarse
a `build_school.py` para mantener reproducibilidad.

## Decisiones

1. Cámara ortográfica restringida a una axonometría de 45°: protege caras,
   separa visualmente las tres filas y conserva la composición simétrica.
2. Planta ortogonal sobre una grilla absoluta de 0,5 m: los pisos sólo pueden
   tocarse y cada límite compartido tiene un único propietario.
3. Cycles COMBINED → `COLOR_0`: el navegador no calcula sombras de la arquitectura.
4. Un material unlit compartido tras el bake: minimiza cambios de material.
5. Draco para geometría. KTX2 no aplica porque este slice no entrega texturas raster
   dentro del GLB; decals generados permanecen como referencias de producción.
6. Props repetidos se consolidan por sala; objetos seleccionables conservan una raíz y
   una malla propia.
7. El runtime existente usa Three.js directo. Se conservó deliberadamente durante este
   vertical slice porque ya implementaba carga Draco, postproceso, lifecycle, fallback y
   DOM accesible sin regresión. Migrar a React Three Fiber no mejora por sí sola el look
   horneado y habría cambiado simultáneamente arte y arquitectura. El contrato funcional
   queda aislado para una migración posterior si el producto necesita componentes React.
8. La presentación provisional oculta `SCHOOL__campus` —plinto, jardines,
   senderos y acceso exterior— y conserva sólo los recintos sobre un patrón
   `CanvasTexture` de diez motivos escolares. Dos hileras desfasadas forman el
   módulo y tres planos de distinta escala lo desplazan lentamente sin mover la
   cámara. El campus permanece dentro del GLB para que la decisión sea reversible
   sin rehacer arte.
9. La presentación separa el edificio en tres terrazas de 2,4 m sin alterar las
   huellas X/Z: Preceptoría y Anfiteatro quedan en nivel 0; Electrónica,
   Programación y Hall en nivel 1; Matemática, Física y Dirección en nivel 2.
   Cada sala elevada recibe un zócalo hasta el suelo para evitar volúmenes
   flotantes. Los umbrales embebidos acompañan la cota del Hall.
10. Al enfocar una sala, el runtime deriva sus obstructores desde el solape de
    la planta y la cercanía a cámara. Sólo esos recintos se disuelven con
    `alphaHash`; los demás permanecen opacos pero atenuados, preservando el
    contexto del edificio sin tapar el objetivo.

## Límites conocidos

- La referencia sólo muestra una vista; los reversos se simplifican y la cámara no los
  expone.
- La escuela completa conserva once zonas del producto, por lo que no es una copia literal
  de las siete habitaciones de la imagen.
- Meshy y Tripo no se ejecutaron sin acceso configurado.
- La estatua usa un GLB procedural separado; no busca semejanza fotográfica.
- El gate visual de esta entrega puntúa 0.61 frente a un umbral de 0.70: la composición
  y la lectura de hub están resueltas, pero la densidad de props, materiales y microdetalle
  todavía requieren otra pasada. La evidencia está en
  `artifacts/validation/school-reference-comparison.png`.
