# Ohmdal · héroes regionales · candidato 2026-09-07

Geometría original construida en Blender para las referencias existentes de Ohmdal. No se descargaron modelos externos ni se utilizaron servicios pagos. Estado: candidato integrado para revisión, no aprobación artística definitiva.

| Entrega | Generador reproducible | Referencia primaria | Calibración glTF |
|---|---|---|---|
| forge-hearth.glb | scripts/3d/build_forge_hearth_candidate.py | assets/ohmdal/rooms/pilot-arco1/prop_forge_hearth_off.png | Y arriba, +Z frente; 4.6 × 2.6 × 4.6 m; base Y=0; wrapper yaw 180°, escala 1 |
| fresnel.glb | scripts/3d/build_lighthouse_fresnel_candidate.py | assets/ohmdal/rooms/pilot-arco1/prop_lighthouse_lens_off.png | Y arriba, +Z frente; 2.42 × 2.73 × 1.12 m; base Y=0; wrapper yaw 180°, escala .75 |

Forja: 16.616 triángulos, cinco materiales/mallas, 2.981.472 bytes, con tangentes explícitas. Texturas de piedra y hierro CC0 ya presentes en el repositorio, reducidas a 512 px; el generador conserva las rutas originales. ThermalElement permite controlar la emisión desde el estado eléctrico sin iluminar una forja apagada.

Fresnel: 658.088 bytes, cinco materiales/mallas; vidrio óptico escalonado, aros, soporte y pernos modelados para la referencia. Cold blue optical glass recibe emisión sólo cuando la fuente eléctrica permite encender el faro.

Los masters y las calibraciones de exportación se conservan en assets/source/ohmdal/{forge,lighthouse}/candidate, cantera local ignorada por Git. Las raíces de gameplay y los colliders permanecen en el mundo PlayCanvas.
