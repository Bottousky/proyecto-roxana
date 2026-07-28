# Bake-off de herramientas — vertical slice

## Pregunta

¿Qué método entrega, por categoría, la mejor combinación de fidelidad a la referencia,
peso web, consistencia, topología, editabilidad y tiempo real de integración?

No se elige un ganador global. Arquitectura, muebles y props protagonistas pueden tener
ganadores distintos.

## Candidatos

1. **img2threejs procedural**: TypeScript/Three.js o Python de Blender basado en una
   especificación de componentes, attachments y materiales.
2. **Blender procedural**: primitivas, curvas, modifiers y consolidación mediante
   `scripts/blender/build_school.py`.
3. **Meshy multiview**: candidato externo para portal, robot y banco, sólo si hay acceso
   configurado. Exportar sin retopología y con remesh controlado.
4. **Tripo multiview**: misma hoja y presupuesto que Meshy, sin retexturizado estilístico
   adicional en la primera prueba.

La ausencia de credenciales de Meshy o Tripo se registra como “no ejecutable”, no como
una derrota de calidad. No se envían claves a Blender ni a scripts de terceros.

## Piezas mínimas

| Pieza | img2threejs | Blender procedural | Meshy | Tripo |
|---|---:|---:|---:|---:|
| pared + columna + cornisa | sí | sí | no prioritario | no prioritario |
| biblioteca | sí | sí | opcional | opcional |
| banco de trabajo | sí | sí | sí | sí |
| portal | sí | sí | sí | sí |
| robot pequeño | sí | sí | sí | sí |
| lámpara institucional | sí | sí | opcional | opcional |

## Entradas bloqueadas

- Portal: `docs/generated-reference-pack/portal-multiview.png`
- Robot: `docs/generated-reference-pack/robot-multiview.png`
- Banco: `docs/generated-reference-pack/workbench-multiview.png`
- Materiales: `docs/generated-reference-pack/materials-board.png`
- Escala: 1 unidad = 1 metro.
- Cámara de control: ortográfica, elevación 34°, vistas frontal, tres cuartos y lateral.

## Métricas

Cada candidato se guarda bajo `artifacts/asset-bakeoff/<pieza>/<metodo>/` y registra:

- tiempo de generación y tiempo de limpieza;
- triángulos, vértices, mallas, materiales y texturas;
- bytes de GLB original y comprimido;
- presencia de normales invertidas, piezas desconectadas e intersecciones;
- pivotes, nombres, jerarquía y partes animables;
- fidelidad macro, meso y micro (0–5);
- coherencia de bevel, proporción y materiales (0–5);
- editabilidad (0–5);
- adecuación web (0–5).

Puntuación ponderada:

`0.30 fidelidad + 0.20 coherencia + 0.18 editabilidad + 0.17 adecuación web + 0.15 tiempo`

Los fallos duros —volumen degenerado, piezas flotantes, reversos abiertos visibles,
escala incoherente o imposibilidad de separar estados— invalidan el promedio.

## Gates

1. Intake y contrato de calidad antes de modelar.
2. Revisión de blockout en tres vistas.
3. Revisión de estructura y attachments.
4. Revisión material con emisiones apagadas y encendidas.
5. Validación glTF.
6. Comparación en contexto dentro de hall + Electrónica.

## Decisión provisional

La base ya disponible favorece Blender procedural para arquitectura repetible y
img2threejs + Blender para portal, robot y banco. Meshy y Tripo quedan como candidatos
reales pero no ejecutables en esta máquina mientras no exista acceso configurado. La
selección final y las métricas se publican en
`artifacts/asset-bakeoff/report.md`.

