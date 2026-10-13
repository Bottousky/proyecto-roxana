# Achica un .glb de personaje para el juego: textura a JPEG (calidad 88) dentro del glTF.
# Uso: blender -b -P scripts/blender/comprimir.py -- entrada.glb salida.glb
import bpy, sys
a = sys.argv[sys.argv.index('--') + 1:]
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=a[0])
bpy.ops.object.select_all(action='SELECT')
bpy.ops.export_scene.gltf(filepath=a[1], export_format='GLB', export_yup=True, export_skins=True, export_animations=False,
                          export_image_format='JPEG', export_image_quality=88, use_selection=True)
print('comprimido', a[1])
