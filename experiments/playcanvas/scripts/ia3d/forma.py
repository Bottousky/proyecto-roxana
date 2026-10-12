# Forma 3D del viajero desde la hoja de giro (frente, perfil, espalda) con Hunyuan3D-2mv, en MPS.
# Uso: python forma.py giro.png salida.glb [pasos] [octree]
import sys, time, torch
from PIL import Image, ImageOps
from hy3dgen.rembg import BackgroundRemover
from hy3dgen.shapegen import Hunyuan3DDiTFlowMatchingPipeline, FloaterRemover, DegenerateFaceRemover

src, out = sys.argv[1], sys.argv[2]
steps = int(sys.argv[3]) if len(sys.argv) > 3 else 30
octree = int(sys.argv[4]) if len(sys.argv) > 4 else 320
sheet = Image.open(src).convert('RGB'); W, H = sheet.size; third = W // 3
rembg = BackgroundRemover()
def view(i, mirror=False):
    v = sheet.crop((i * third, 0, (i + 1) * third, H))
    if mirror: v = ImageOps.mirror(v)
    side = max(v.size); pad = Image.new('RGB', (side, side), (255, 255, 255)); pad.paste(v, ((side - v.size[0]) // 2, (side - v.size[1]) // 2))
    return rembg(pad.resize((768, 768), Image.LANCZOS))
images = {'front': view(0), 'left': view(1, mirror=True), 'back': view(2)}
for k, im in images.items(): im.save(out.replace('.glb', f'-{k}.png'))
device = 'mps' if torch.backends.mps.is_available() else 'cpu'
pipe = Hunyuan3DDiTFlowMatchingPipeline.from_pretrained('tencent/Hunyuan3D-2mv', subfolder='hunyuan3d-dit-v2-mv', variant='fp16', device=device)
t = time.time()
mesh = pipe(image=images, num_inference_steps=steps, octree_resolution=octree, num_chunks=8000, generator=torch.manual_seed(7), output_type='trimesh')[0]
mesh = FloaterRemover()(mesh); mesh = DegenerateFaceRemover()(mesh)
print(f'forma en {time.time() - t:.0f} s: {len(mesh.vertices)} vértices, {len(mesh.faces)} caras')
mesh.export(out)
