# Ohmdal Blender Gauntlet

**Objetivo:** convertir un hero pack aprobado en un GLB canónico mediante un ciclo acotado, repetible e independiente del runtime.

## Contrato

1. `hero-reference.json` aprobado y validado decide `reconstruct`, `adapt` o `design-approved`.
2. La ruta por defecto para geometría mecánica/arquitectónica controlable es Blender determinista, siguiendo `scripts/3d/build_ohm_hero.py` como golden path.
3. El script reproducible produce o actualiza el master `.blend`; el export termina en un GLB canónico portable.
4. Se renderizan `front`, `three-quarter`, `side` y `back` desde cámaras estables.
5. Un crítico independiente read-only recibe pack y cuatro vistas. Sol selecciona hasta tres correcciones concretas por iteración y acepta o rechaza. Máximo tres iteraciones.
6. El GLB pasa validación, bounds/orientación/pivots, presupuesto, PlayCanvas y Visual Harness.

Meshy, Tripo u otro proveedor pago requieren un `HUMAN_GATE` económico nuevo antes de crear una tarea o gastar créditos. Su resultado sería sólo candidate y todavía requeriría canonicalización Blender.

## Fixture y comando

El Galvanoscopio aprobado demuestra el circuito completo sin proveedor generativo ni créditos:

```bash
npm run 3d:validate-blender-gauntlet -- agent-work/gauntlets/galvanoscope.json
```

El validador comprueba pack, build script, master, GLB, cuatro previews, informe independiente, límite de fixes y procedencia; después ejecuta los validadores canónicos del pack y del GLB. La aceptación visual sigue perteneciendo a Sol con review independiente; el script no se autoaprueba.
