# Informe de bake-off — hall + Electrónica

Fecha: 2026-07-25  
Referencia: 1672×941, aptitud técnica `pass`, una sola vista semántica.

## Disponibilidad real

| Método | Estado | Evidencia |
|---|---|---|
| img2threejs | ejecutado | assessment ultra-complex, inventario 3×3, spec strict-quality `PASS` |
| Blender procedural | ejecutado | `scripts/blender/build_school.py`, `.blend`, GLB y renders reproducibles |
| GPT Image 2 | ejecutado | pack de hall, aula, estados, portal, robot, banco, materiales y decals |
| Meshy | no ejecutable | no hay acceso configurado en el entorno |
| Tripo | no ejecutable | no hay acceso configurado en el entorno |

Meshy y Tripo no reciben una puntuación ficticia. Quedan como candidatos pendientes,
no como perdedores. El bake-off selecciona el mejor resultado disponible por categoría.

## Gates de img2threejs

- Clasificación: diorama arquitectónico hard-surface, compound/repeated/layered.
- Complejidad: ultra-complex.
- Contrato: 7 macro, 18 meso, 12 micro, 6 materiales y 5 sistemas repetidos.
- Inventario: 16 rasgos mapeados a geometría o material.
- `validate_sculpt_spec.py --strict-quality`: `PASS`.
- Advertencia no bloqueante: los módulos estáticos no declaran perfiles de destrucción;
  no son necesarios para este hub sin jugador caminable.
- El orquestador permanece en `blockout` hasta incorporar la nueva captura web al gate;
  no se declara una aprobación visual automática.

## Resultado por pieza

Escala: 0–5. “Tiempo” puntúa integración rápida, no tiempo absoluto.

| Pieza | Ruta seleccionada | Fidelidad | Coherencia | Editabilidad | Web | Tiempo | Decisión |
|---|---|---:|---:|---:|---:|---:|---|
| pared + columna + cornisa | Blender procedural | 4.2 | 4.6 | 5.0 | 4.8 | 4.8 | ganador |
| biblioteca | img2threejs spec → Blender | 4.0 | 4.5 | 4.8 | 4.7 | 4.3 | ganador |
| banco de trabajo | multiview GPT → Blender modular | 4.1 | 4.7 | 4.8 | 4.2 | 3.8 | ganador |
| portal | multiview GPT → Blender procedural | 4.3 | 4.7 | 4.9 | 4.1 | 3.6 | ganador |
| robot | multiview GPT → Blender procedural | 3.9 | 4.6 | 4.9 | 4.5 | 3.8 | ganador |
| lámpara institucional | Blender procedural | 4.0 | 4.8 | 5.0 | 4.9 | 4.8 | ganador |

Las notas son revisión humana contra la referencia, no una métrica de visión inventada.
El portal y el robot priorizan pivotes y estados separables sobre microdetalle de render
offline. La arquitectura gana con Blender procedural porque su escala, bevel y repetición
son deterministas.

## Topología y attachments

- Paredes, muebles y carcasas: `assembled-solid`.
- Portal: anillos `assembled-solid`, tubos `fiber-strand`, emisión `surface-relief`.
- Robot: cuerpo `assembled-solid`, brazos unidos a sockets de hombro, cabeza con pivot.
- Banco: carcasa repetible y módulos de instrumentos separables.
- Lámpara: base y pantalla ensambladas; brazo como tubo entre puntos.
- Nada del vertical slice depende de una malla única extraída de la imagen.

## Evidencia

- `img2threejs-hub/assessment.json`
- `img2threejs-hub/detail-inventory.json`
- `img2threejs-hub/hub-sculpt-spec.json`
- `img2threejs-hub/comparison-pass3.png`
- `docs/generated-reference-pack/portal-multiview.png`
- `docs/generated-reference-pack/robot-multiview.png`
- `docs/generated-reference-pack/workbench-multiview.png`

Las métricas exactas del GLB completo y del aula se generan con
`npm run school:report` en `artifacts/performance/`.

