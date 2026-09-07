# Ohmdal · candidato generador Manantial · 2026-09-07

Estado: candidato procedural para revisión independiente; no integrado ni aprobado artísticamente.

## Procedencia

- Geometría original determinista en Blender, sin descargas nuevas, proveedores generativos ni servicios pagos.
- Generador reproducible: `scripts/3d/build_manantial_generator_candidate.py`.
- Entrega: `assets/runtime/ohmdal/regional-heroes/manantial-generator.glb`.
- Texturas reutilizadas de la cantera CC0 existente: `assets/runtime/ohmdal/plaza/materials/stone-primary/diffuse-1k.jpg` y `assets/runtime/ohmdal/plaza/materials/iron-aged/diffuse-1k.jpg`.
- Referencia primaria: `assets/ohmdal/rooms/pilot-arco1/prop_taller_generator.png`.
- Contexto: `assets/ohmdal/hero/manantial.png`, `assets/ohmdal/rooms/pilot-arco1/manantial_ohm+prop_boca_manantial-v2.png`, `assets/ohmdal/rooms/pilot-arco1/prop_boca_manantial.png` y `assets/ohmdal/rooms/pilot-arco1/prop_terraces_sluice_gate.png`.

## Calibración y contrato de integración

- Unidades: metros; eje superior Y; frente visual glTF +Z; pivote grounded en Y=0.
- AABB glTF: min `[-2.9000000953674316, -5.7699029554214576e-08, -1.5550000667572021]`, max `[2.9000000953674316, 5.269999980926514, 1.9400001764297485]`; dimensiones `[5.800000190734863, 5.270000038625543, 3.4950002431869507]`.
- Yaw de wrapper PlayCanvas recomendado: 180 grados, igual que los candidatos Forge/Faro.
- Anclaje de integración sugerido: raíz en `[0, 0.8, 22.55]` sobre el apron del Manantial; con wrapper yaw 180 la cara de potencia mira hacia el frente del powerhouse (`z≈20.9`). Debe revisarse visualmente contra el `turbineMesh`/`turbineRotor` actual antes de cablear.
- El GLB no define colliders, probes, controles ni estado eléctrico. No cambia anchors ni la ruta validada.
- `ManantialGeneratorRotorAssembly` queda separado para animación. Piezas rotor exportadas: `['ManantialGeneratorRotor', 'ManantialGeneratorRotorBlade1', 'ManantialGeneratorRotorBlade2', 'ManantialGeneratorRotorBlade3', 'ManantialGeneratorRotorBlade4', 'ManantialGeneratorRotorBlade5', 'ManantialGeneratorRotorBlade6', 'ManantialGeneratorRotorHub', 'ManantialGeneratorRotorKey']`.
- El origen real del assembly está en el centro del disco authored `(0, 2.45, 1.46)`, con los hijos preservando sus matrices mundiales. En el GLB el assembly queda trasladado a `[0, 1.46, -2.45]` por la conversión Y-up; el nodo `ManantialGeneratorRotor` parte en `[0, 0, 0]` dentro del assembly.
- El cilindro authored Blender tiene eje `+Z`; `export_yup=True` lo entrega como eje local GLB/PlayCanvas `+Y` (el rotor mesh tiene AABB local delgado en Y). En PlayCanvas se debe rotar sólo `ManantialGeneratorRotorAssembly` sobre su eje local `+Y` (`setLocalEulerAngles(0, degrees, 0)` o equivalente); no girar cada blade ni el root `ManantialGenerator`.
- El rotor puede girar con el estado restaurado; la emisión, la luz y el VFX siguen siendo runtime-owned. No hay glow permanente.

## Presupuesto medido

- Triángulos antes de exportación: `12052`.
- Objetivo: <25k triángulos y <3 MB; el tamaño entregado debe verificarse después de cada regeneración.
- Preview CPU generado en `C:\Users\manue\AppData\Local\Temp\ohmdal-manantial-generator-preview.png`; no es parte del runtime ni de la entrega.

## Decisiones visuales

La carcasa repite la lectura compacta del generador de la referencia: mejillas de hierro, tambor de cobre con aletas, rotor frontal, eje posterior, terminales cerámicos, bus superior y placa de medición. La bancada pale-stone conecta la máquina con la infraestructura cívica del Manantial. La pieza está pensada para sustituir el foco de cilindro/caja, no para cubrirlo con decoración.
