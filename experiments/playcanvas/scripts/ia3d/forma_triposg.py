# Forma 3D de un personaje con TripoSG (VAST, código y pesos MIT), en la Mac (MPS), como alternativa
# a Hunyuan3D-2mv, cuya licencia comunitaria excluye la UE, el Reino Unido y Corea del Sur.
# TripoSG lee una sola imagen: el frente de la hoja de giro. El fondo se recorta con rembg (u2net,
# Apache 2.0), no con el BRIA RMBG que trae el repositorio (licencia no comercial).
# Sólo produce la forma: textura, esqueleto y regiones siguen saliendo de scripts/blender/viajero-3d.py.
# Uso (venv-triposg, desde ~/code/ohmdal-3d/TripoSG): python forma_triposg.py giro.png salida.glb [pasos] [semilla]
import sys, os, time, torch, numpy as np, trimesh
from PIL import Image
from rembg import remove, new_session
sys.path.insert(0, os.getcwd()); sys.path.insert(0, os.path.join(os.getcwd(), 'scripts'))
from huggingface_hub import snapshot_download
from triposg.pipelines.pipeline_triposg import TripoSGPipeline
from image_process import prepare_image

src, out = sys.argv[1], sys.argv[2]
steps = int(sys.argv[3]) if len(sys.argv) > 3 else 50
seed = int(sys.argv[4]) if len(sys.argv) > 4 else 42
sheet = Image.open(src).convert('RGB'); W, H = sheet.size
front = sheet.crop((0, 0, W // 3, H))
cut = remove(front, session=new_session('u2net'))  # RGBA with the figure's alpha
path = out.replace('.glb', '-frente.png'); cut.save(path)
device = 'mps' if torch.backends.mps.is_available() else 'cpu'
weights = snapshot_download('VAST-AI/TripoSG', local_dir=os.path.expanduser('~/code/ohmdal-3d/pesos/TripoSG'))
pipe = TripoSGPipeline.from_pretrained(weights).to(device, torch.float32)
image = prepare_image(path, bg_color=np.array([1.0, 1.0, 1.0]), rmbg_net=None)
t = time.time()
v, f = pipe(image=image, generator=torch.Generator(device='cpu').manual_seed(seed), num_inference_steps=steps, guidance_scale=7.0, use_flash_decoder=False, dense_octree_depth=8, hierarchical_octree_depth=9).samples[0]
mesh = trimesh.Trimesh(v.astype(np.float32), np.ascontiguousarray(f))
print(f'forma en {time.time() - t:.0f} s: {len(mesh.vertices)} vértices, {len(mesh.faces)} caras')
mesh.export(out)
