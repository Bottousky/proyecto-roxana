"""Original, world-space geological catchment. No downloaded or paid content."""
import bpy, math, json, hashlib, random
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / 'assets/runtime/ohmdal/plaza/gorge'
SOURCE = ROOT / 'assets/source/ohmdal/plaza/gorge'
OUT.mkdir(parents=True, exist_ok=True)
SOURCE.mkdir(parents=True, exist_ok=True)
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)

def smooth(t):
    t=max(0,min(1,t)); return t*t*(3-2*t)

def linear(c):
    # Palette values below are display sRGB; GLTF COLOR_0 is linear light.
    return c/12.92 if c <= .04045 else ((c+.055)/1.055)**2.4

def noise(x,z):
    return (math.sin(x*.137+math.cos(z*.079)*2)*math.cos(z*.113-x*.026)*.56
            +math.sin(x*.331+z*.27)*.25+math.sin(x*.79-z*.62)*.10)

def height(x,z):
    # Preserve the entire established route and hydraulic floor through z=31.
    onset=smooth((z-30)/10)
    peaks=0
    for px,pz,h,sx,sz in [(-15,49,19,17,21),(16,53,23,19,24),(-46,79,31,29,38),
                          (48,92,38,35,40),(-82,150,44,53,55),(80,175,51,58,58),(2,205,47,65,50)]:
        peaks += h*math.exp(-((x-px)/sx)**2-((z-pz)/sz)**2)
    h=peaks*onset
    # The river cuts into an irregular saddle, against which the waterfall reads.
    river_x=math.sin((z-37)*.06)*1.4
    channel=math.exp(-((x-river_x)/3.8)**2)*smooth((z-33)/8)*(1-smooth((z-58)/45))
    river_bed=4+(z-37)*1.42
    h=h*(1-channel)+min(h,river_bed)*channel
    ledge=math.sin(h*1.05+x*.08)*.34
    h += (noise(x,z)*2.1+ledge)*smooth(h/10)
    return max(-.65,h-.65)

def vertex_material(name,roughness=.94):
    m=bpy.data.materials.new(name); m.use_nodes=True
    p=m.node_tree.nodes.get('Principled BSDF')
    p.inputs['Roughness'].default_value=roughness
    a=m.node_tree.nodes.new('ShaderNodeVertexColor'); a.layer_name='RockColor'
    m.node_tree.links.new(a.outputs['Color'],p.inputs['Base Color'])
    return m

rock=vertex_material('ManantialGorgeRock')

def terrain_chunk(name,x0,x1,z0,z1,nx,nz):
    vs=[]; fs=[]; cols=[]
    for iz in range(nz+1):
        z=z0+(z1-z0)*iz/nz
        for ix in range(nx+1):
            x=x0+(x1-x0)*ix/nx; y=height(x,z)
            vs.append((x,-z,y))
            slope=math.hypot(height(x+.5,z)-height(x-.5,z),height(x,z+.5)-height(x,z-.5))
            moss=(1-smooth((slope-.22)/.65))*.55
            strata=math.sin(y*1.9+x*.1)*.017
            v=noise(x*2,z*2)*.026+strata
            # Broad mineral planes, warm lit faces / cool weathered recesses.
            c=(.255+v-moss*.052,.275+v+moss*.009,.259+v-moss*.065)
            distance=smooth((math.hypot(x,z)-85)/180)*.28
            cols.append(tuple(linear(c[i]*(1-distance)+(.39,.48,.51)[i]*distance) for i in range(3))+(1,))
    for iz in range(nz):
        for ix in range(nx):
            a=iz*(nx+1)+ix
            fs.extend([(a,a+nx+1,a+1),(a+1,a+nx+1,a+nx+2)])
    mesh=bpy.data.meshes.new(name); mesh.from_pydata(vs,[],fs); mesh.update()
    obj=bpy.data.objects.new(name,mesh); bpy.context.collection.objects.link(obj)
    mesh.materials.append(rock)
    color=mesh.color_attributes.new(name='RockColor',type='FLOAT_COLOR',domain='POINT')
    for i,c in enumerate(cols): color.data[i].color=c
    # Geometry is fine enough for shape, smooth normals avoid triangle noise.
    for p in mesh.polygons: p.use_smooth=True
    return obj

# Separate sectors keep off-screen geometry out of rendering; equal shared
# boundary samples prevent cracks. Near terrain gets metre-scale detail.
for side in [-1,1]:
    for row,(z0,z1,nz) in enumerate([(30,78,48),(78,142,32),(142,258,29)]):
        for col,(a,b,nx) in enumerate([(0,40,40),(40,100,20),(100,180,16)]):
            terrain_chunk(f'Gorge_{side}_{row}_{col}',min(side*a,side*b),max(side*a,side*b),z0,z1,nx,nz)

# Mineral shelves and fractured talus belong beyond the collision envelope.
# Reuse one material and merge by near side, keeping draw count bounded.
random.seed(2409)
for side in [-1,1]:
    pieces=[]
    for i in range(23):
        x=side*(10+random.random()*16); z=32+random.random()*31
        y=height(x,z)-.5
        bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=1,radius=1,location=(x,-z,y))
        obj=bpy.context.object; obj.name='FracturedBank'
        obj.scale=(1.5+random.random()*2.3,1.4+random.random()*1.9,.6+random.random()*1.2)
        obj.rotation_euler=(random.random()*.25,random.random()*.22,random.random()*2)
        obj.data.materials.append(rock)
        c=obj.data.color_attributes.new(name='RockColor',type='FLOAT_COLOR',domain='POINT')
        for v in c.data:
            n=random.random()*.035; v.color=(linear(.28+n),linear(.292+n),linear(.266+n),1)
        pieces.append(obj)
    bpy.ops.object.select_all(action='DESELECT')
    for o in pieces:o.select_set(True)
    bpy.context.view_layer.objects.active=pieces[0]; bpy.ops.object.join()
    bpy.context.object.name=f'GorgeTalus_{side}'

bpy.ops.wm.save_as_mainfile(filepath=str(SOURCE/'manantial-gorge.blend'))
bpy.ops.export_scene.gltf(filepath=str(OUT/'manantial-gorge.glb'),export_format='GLB',export_yup=True,
    export_cameras=False,export_lights=False)
objects=[o for o in bpy.context.scene.objects if o.type=='MESH']
pts=[o.matrix_world@v.co for o in objects for v in o.data.vertices]
low=[min(p[i] for p in pts) for i in range(3)]; high=[max(p[i] for p in pts) for i in range(3)]
meta={'source':'Original Blender geometry, Roxana project; no third-party content',
      'runtime':'manantial-gorge.glb','sha256':hashlib.sha256((OUT/'manantial-gorge.glb').read_bytes()).hexdigest(),
      'bytes':(OUT/'manantial-gorge.glb').stat().st_size,
      'placement':{'origin':'Plaza world origin, not AABB minimum','position':[0,0,0],'scale':1,'yaw':0},
      'bounds':{'min':[low[0],low[2],-high[1]],'max':[high[0],high[2],-low[1]]},
      'triangles':sum(len(p.vertices)-2 for o in objects for p in o.data.polygons),'meshes':len(objects),
      'navigation':'L2 only; x inside gameplay clear through z=30; no collider changes'}
(OUT/'calibration-provenance.json').write_text(json.dumps(meta,indent=2)+'\n',encoding='utf8')
print(json.dumps(meta))
