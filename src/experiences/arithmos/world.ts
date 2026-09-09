import * as THREE from 'three';
import type { Board, Cell, Chapter, Evaluation, SceneCallbacks, WorldView, Zone } from './types';

/** All meshes and markings are original, generated here. The view never evaluates a puzzle. */
export function createWorld(host: HTMLElement, callbacks: SceneCallbacks): WorldView {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#102f3d');
  scene.fog = new THREE.FogExp2('#173e49', 0.012);
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, host.clientWidth < 600 ? 1.5 : 1.75));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.08;
  renderer.domElement.style.cssText = 'display:block;width:100%;height:100%;touch-action:none;outline:none';
  renderer.domElement.setAttribute('aria-label', 'Archipiélago de Arithmos. Arrastra la materia o usa los controles accesibles.');
  host.append(renderer.domElement);

  const camera = new THREE.OrthographicCamera(-16, 16, 12, -12, 0.1, 250);
  const focus = new THREE.Vector3(0, 0, 0.4);
  const cameraOffset = new THREE.Vector3(13, 23, 24);
  camera.position.copy(focus).add(cameraOffset);
  camera.lookAt(focus);
  scene.add(new THREE.HemisphereLight('#bedee0', '#55404b', 1.7));
  const key = new THREE.DirectionalLight('#ffe0ad', 3.1);
  key.position.set(-15, 25, 12);
  key.castShadow = true;
  key.shadow.mapSize.set(host.clientWidth < 600 ? 1024 : 2048, host.clientWidth < 600 ? 1024 : 2048);
  key.shadow.camera.left = -22; key.shadow.camera.right = 22;
  key.shadow.camera.top = 22; key.shadow.camera.bottom = -22;
  key.shadow.normalBias = 0.045;
  scene.add(key);
  const rim = new THREE.DirectionalLight('#3dbcca', 1.8);
  rim.position.set(10, 8, -20); scene.add(rim);

  const geometryResources = new Set<THREE.BufferGeometry>();
  const materialResources = new Set<THREE.Material>();
  const geo = <T extends THREE.BufferGeometry>(g: T): T => { geometryResources.add(g); return g; };
  const mat = (color: string | number, metalness = 0, roughness = 0.65, emission?: string) => {
    const m = new THREE.MeshStandardMaterial({ color, metalness, roughness, ...(emission ? { emissive: emission, emissiveIntensity: 0.25 } : {}) });
    materialResources.add(m); return m;
  };
  const ivory = mat('#e7d8bd'); const warm = mat('#bd8679'); const dark = mat('#183e49');
  const ground = mat('#d7b58f', 0, 0.85);
  const gold = mat('#d3a45c', 0.65, 0.35); const paleGold = mat('#f0d3a0', 0.4);
  const green = mat('#6faaa0'); const coral = mat('#c98276');
  const socket = mat('#294a51'); const light = mat('#c9f3dc', 0.1, 0.3, '#8dffd7');
  const stoneSide = mat('#9f7771');
  const unitGeo = (() => {
    const s = new THREE.Shape(); const r = 0.12; const h = 0.43;
    s.moveTo(-h + r, -h); s.lineTo(h - r, -h); s.quadraticCurveTo(h, -h, h, -h + r);
    s.lineTo(h, h - r); s.quadraticCurveTo(h, h, h - r, h); s.lineTo(-h + r, h);
    s.quadraticCurveTo(-h, h, -h, h - r); s.lineTo(-h, -h + r); s.quadraticCurveTo(-h, -h, -h + r, -h);
    const g = geo(new THREE.ExtrudeGeometry(s, { depth: 0.2, bevelEnabled: true, bevelSegments: 2, steps: 1, bevelSize: 0.035, bevelThickness: 0.035 }));
    g.rotateX(-Math.PI / 2); return g;
  })();
  const featherGeo = (() => {
    const s = new THREE.Shape();
    s.moveTo(0, -0.45); s.quadraticCurveTo(-0.4, -0.22, -0.31, 0.15);
    s.quadraticCurveTo(-0.17, 0.34, 0, 0.48);
    s.quadraticCurveTo(0.17, 0.34, 0.31, 0.15);
    s.quadraticCurveTo(0.4, -0.22, 0, -0.45);
    const g = geo(new THREE.ExtrudeGeometry(s, { depth: 0.17, bevelEnabled: true, bevelSegments: 2, steps: 1, bevelSize: 0.025, bevelThickness: 0.025 }));
    g.rotateX(-Math.PI / 2); return g;
  })();
  const boxGeo = geo(new THREE.BoxGeometry(1, 1, 1));
  const sphereGeo = geo(new THREE.SphereGeometry(1, 16, 10));
  const coneGeo = geo(new THREE.ConeGeometry(1, 1, 6));
  const ringGeo = geo(new THREE.TorusGeometry(0.19, 0.032, 6, 24));
  const selectGeo = geo(new THREE.TorusGeometry(0.52, 0.025, 6, 32));
  const unitMaterial = { amber: mat('#f2b867', 0.24, 0.38), teal: mat('#65c9c0', 0.2, 0.38) };
  const anchoredMaterial = { amber: mat('#ffcc80', 0.24, 0.38, '#a36524'), teal: mat('#86e2d2', 0.2, 0.38, '#1c7b75') };
  const looseMat = mat('#c68861', 0.1, 0.65);
  const markMat = mat('#183c45', 0.1, 0.5);
  const chosenMat = mat('#fff6d3', 0.1, 0.4, '#ffdda2');
  const mesh = (g: THREE.BufferGeometry, m: THREE.Material, p: THREE.Object3D, x = 0, y = 0, z = 0, sx = 1, sy = 1, sz = 1) => {
    const o = new THREE.Mesh(g, m); o.position.set(x, y, z); o.scale.set(sx, sy, sz);
    o.castShadow = true; o.receiveShadow = true; p.add(o); return o;
  };
  const box = (p: THREE.Object3D, m: THREE.Material, x: number, y: number, z: number, sx: number, sy: number, sz: number) => mesh(boxGeo, m, p, x, y, z, sx, sy, sz);
  const line = (points: THREE.Vector3[], m: THREE.Material, radius: number, parent: THREE.Object3D) => {
    const curve = new THREE.CatmullRomCurve3(points);
    return mesh(geo(new THREE.TubeGeometry(curve, Math.max(8, points.length * 5), radius, 4, false)), m, parent);
  };
  let stage = new THREE.Group(); scene.add(stage);
  const unitsRoot = new THREE.Group(); scene.add(unitsRoot);
  const ghosts = new THREE.Group(); scene.add(ghosts);
  const ghostMaterial = new THREE.MeshBasicMaterial({ color: '#f9e4ae', transparent: true, opacity: 0.45, depthWrite: false });
  materialResources.add(ghostMaterial);
  const waterMaterial = mat('#174e60', 0.28, 0.28);
  const sea = mesh(geo(new THREE.PlaneGeometry(240, 240)), waterMaterial, scene, 0, -1.45, 0);
  sea.rotation.x = -Math.PI / 2; sea.receiveShadow = true;
  const rippleMaterial = new THREE.MeshBasicMaterial({ color: '#79c8c2', transparent: true, opacity: 0.14, depthWrite: false });
  materialResources.add(rippleMaterial);
  const ripples: THREE.Mesh[] = [];
  for (let i = 0; i < 35; i++) {
    const r = mesh(geo(new THREE.TorusGeometry(1.3 + (i % 6), 0.012, 3, 42)), rippleMaterial, scene, Math.sin(i * 12.5) * 35, -1.41, Math.cos(i * 7.4) * 25);
    r.rotation.x = Math.PI / 2; r.scale.y = 0.45; r.castShadow = false; ripples.push(r);
  }
  const stars = new THREE.Group(); scene.add(stars);
  for (let i = 0; i < 55; i++) {
    const s = mesh(sphereGeo, light, stars, Math.sin(i * 15.4) * 45, 3 + (i % 7) * 1.1, -25 - (i % 9) * 2, 0.04, 0.04, 0.04);
    s.castShadow = false;
  }
  const sharedGeometry = new Set(geometryResources);

  type UnitView = { group: THREE.Group; body: THREE.Mesh; halo: THREE.Mesh; target: THREE.Vector3; cell: Cell };
  type Fixture = { zone: Zone; group: THREE.Group; moving: THREE.Group; lamps: THREE.Mesh[]; foliage: THREE.Group[]; value: number; target: number; tilt: number; targetTilt: number };
  const views = new Map<string, UnitView>();
  let fixtures: Fixture[] = [];
  let lens = false; let lensAmount = 0; let reduced = false; let paused = false; let disposed = false;
  let board: Board = { pieces: [], nextId: 0 }; let selected: string | null = null;
  let chapter: Chapter | null = null; let chapterIndex = 0;
  let clock = 0; let previous = performance.now(); let celebration = -1; let finalFlight = false;
  let whaleTilt = 0;
  let whale = new THREE.Group(); let wingLeft = new THREE.Group(); let wingRight = new THREE.Group();
  let companion = new THREE.Group(); let restorationRoot = new THREE.Group();
  let edgeArchitecture = new THREE.Group();
  let animations: Array<{ object: THREE.Object3D; y: number; phase: number; amplitude: number }> = [];

  function island(parent: THREE.Object3D, x: number, z: number, sx: number, sz: number, small = false) {
    const shape = new THREE.Shape();
    const points = [[-0.5,-0.32],[-0.37,-0.5],[0.34,-0.5],[0.5,-0.31],[0.5,0.28],[0.3,0.5],[-0.32,0.5],[-0.5,0.26]];
    points.forEach(([px, pz], i) => { if (i === 0) shape.moveTo(px * sx, pz * sz); else shape.lineTo(px * sx, pz * sz); }); shape.closePath();
    const g = geo(new THREE.ExtrudeGeometry(shape, { depth: small ? 1.2 : 1.1, bevelEnabled: true, bevelThickness: 0.16, bevelSize: 0.22, bevelSegments: 2, steps: 1 }));
    g.rotateX(-Math.PI / 2);
    const o = mesh(g, small ? ivory : ground, parent, x, small ? -0.85 : -1.3, z);
    const foot = mesh(geo(new THREE.CylinderGeometry(0.95, 0.65, 2, 8)), stoneSide, parent, x, -1.7, z, sx * 0.47, 1, sz * 0.47);
    foot.rotation.y = Math.PI / 8;
    return o;
  }
  function fanTree(parent: THREE.Object3D, x: number, z: number, scale: number) {
    const tree = new THREE.Group(); tree.position.set(x, 0, z); tree.scale.setScalar(scale); parent.add(tree);
    box(tree, gold, 0, 1, 0, 0.1, 2, 0.1);
    for (let i = 0; i < 9; i++) {
      const a = (i - 4) * 0.24;
      const leaf = mesh(coneGeo, i % 2 ? coral : green, tree, Math.sin(a) * 0.62, 2.05 + Math.cos(a) * 0.4, 0, 0.32, 1.15, 0.12);
      leaf.rotation.z = -a; leaf.rotation.y = 0.25;
    }
    animations.push({ object: tree, y: 0, phase: x, amplitude: 0 }); return tree;
  }
  function ratioPlant(parent: THREE.Object3D, x: number, z: number) {
    const plant = new THREE.Group(); parent.add(plant); plant.position.set(x,0.1,z);
    box(plant,unitMaterial.amber,0,0.48,0,0.12,0.95,0.12);
    const bud = mesh(sphereGeo,unitMaterial.amber,plant,0,0.67,0.02,0.22,0.22,0.19);
    const mark=mesh(ringGeo,markMat,bud,0,0.12,0.9); mark.scale.setScalar(0.8);
    for(const sign of [-1,1]){
      const leaf=mesh(sphereGeo,unitMaterial.teal,plant,sign*0.37,0.98,0,0.21,0.48,0.08); leaf.rotation.z=-sign*0.6;
      for(const dz of [-0.055,0.055])box(plant,markMat,sign*0.37,1+dz,0.082,0.16,0.025,0.015);
    }
    // Six root sockets belong to two living stems, not to a written recipe.
    for(const dx of [-0.27,0,0.27]) {const root=mesh(ringGeo,gold,plant,dx,0.03,0.25);root.scale.setScalar(0.55);root.rotation.x=-Math.PI/2;}
    return plant;
  }
  function tower(parent: THREE.Object3D, x: number, z: number, scale: number, restored: boolean) {
    const g = new THREE.Group(); g.position.set(x, 0, z); g.scale.setScalar(scale); parent.add(g);
    box(g, warm, 0, 0.28, 0, 2.5, 0.5, 2.4);
    box(g, ivory, 0, 1.15, 0, 1.8, 1.5, 1.7);
    for (const dx of [-0.56, 0.56]) {
      box(g, gold, dx, 2.65, 0, 0.14, 2.0, 0.14);
      box(g, dark, dx, 1.3, 0.865, 0.3, 0.75, 0.03);
    }
    const roof = mesh(coneGeo, gold, g, 0, 3.3, 0, 1.45, 0.7, 1.3); roof.rotation.y = Math.PI / 6;
    const bell = mesh(sphereGeo, restored ? light : gold, g, 0, 2.6, 0, 0.22, 0.42, 0.22);
    if (restored) animations.push({ object: bell, y: 2.6, phase: x, amplitude: 0.1 });
    return g;
  }
  function boat(parent: THREE.Object3D, x: number, z: number, scale: number) {
    const boatGroup = new THREE.Group(); parent.add(boatGroup); boatGroup.position.set(x, -1.05, z); boatGroup.scale.setScalar(scale);
    const hull = mesh(coneGeo, ivory, boatGroup, 0, 0, 0, 0.8, 0.4, 1.4); hull.rotation.x = Math.PI;
    box(boatGroup, gold, 0, 0.5, 0, 0.045, 1.25, 0.045);
    const sail = mesh(geo(new THREE.CircleGeometry(0.65, 3)), coral, boatGroup, 0.15, 0.65, 0); sail.rotation.z = -Math.PI / 2;
    (sail.material as THREE.MeshStandardMaterial).side = THREE.DoubleSide;
    animations.push({ object: boatGroup, y: -1.05, phase: x, amplitude: 0.08 }); return boatGroup;
  }
  function makeWhale() {
    const w = new THREE.Group(); stage.add(w); w.position.set(-1, -0.2, -13); w.rotation.y = -0.2;
    mesh(sphereGeo, ivory, w, 0, 0, 0, 4.4, 1.3, 2);
    mesh(sphereGeo, warm, w, 0, -0.55, 0, 4.2, 0.7, 1.85);
    for (let i = -3; i <= 3; i++) {
      const arc = mesh(geo(new THREE.TorusGeometry(1.35, 0.05, 5, 24, Math.PI)), gold, w, i * 0.65, 0.02, 0);
      arc.rotation.y = Math.PI / 2; arc.scale.y = 0.8; arc.scale.x = 1.35;
    }
    mesh(sphereGeo, dark, w, -3.72, 0.4, 1.02, 0.2, 0.2, 0.2);
    mesh(sphereGeo, light, w, -3.85, 0.47, 1.14, 0.07, 0.07, 0.07);
    for (let i = 0; i < 4; i++) {
      const city = tower(w, (i - 1.5) * 1.2, -0.05, 0.32 + (i % 2) * 0.12, true);
      city.position.y = 1.05;
    }
    const tail = mesh(coneGeo, gold, w, 4.5, 0.2, 0, 1.5, 2.5, 0.25); tail.rotation.z = -Math.PI / 2;
    wingLeft = new THREE.Group(); wingRight = new THREE.Group(); w.add(wingLeft, wingRight);
    for (const [wing, sign] of [[wingLeft, 1], [wingRight, -1]] as const) {
      wing.position.set(0.4, 0, sign * 1.1);
      for (let i = 0; i < 8; i++) {
        const feather = mesh(coneGeo, i % 2 ? paleGold : ivory, wing, 1.6 - i * 0.55, -0.1, sign * (1.6 + Math.sin(i / 8 * Math.PI) * 0.6), 0.47, 4.5 - i * 0.18, 0.18);
        feather.rotation.x = sign * Math.PI / 2; feather.rotation.y = sign * 0.18;
      }
    }
    return w;
  }

  function fixture(zone: Zone): Fixture {
    const group = new THREE.Group(); group.position.set(zone.x + (zone.width - 1) / 2, 0, zone.z + (zone.depth - 1) / 2); stage.add(group);
    if (zone.role !== 'bridge') island(group,0,0,zone.width+0.6,zone.depth+0.6);
    const moving = new THREE.Group(); group.add(moving);
    const lamps: THREE.Mesh[] = []; const foliage: THREE.Group[] = [];
    box(moving, gold, 0, 0.015, 0, zone.width + 0.18, 0.07, zone.depth + 0.18);
    box(moving, socket, 0, 0.065, 0, zone.width, 0.06, zone.depth);
    for (let z = 0; z < zone.depth; z++) for (let x = 0; x < zone.width; x++) {
      const dx = x - (zone.width - 1) / 2; const dz = z - (zone.depth - 1) / 2;
      box(moving, dark, dx, 0.104, dz, 0.92, 0.025, 0.92);
      const dot = mesh(sphereGeo, gold, moving, dx, 0.129, dz, 0.047, 0.023, 0.047); dot.castShadow = false;
    }
    for (let i = 0; i < zone.width; i++) lamps.push(mesh(sphereGeo, gold, group, i - (zone.width - 1) / 2, 0.18, -zone.depth / 2 - 0.12, 0.09, 0.09, 0.09));
    if (zone.role === 'bridge') {
      for (const z of [-1, 1]) {
        box(group, warm, 0, -0.1, z * (zone.depth / 2 + 0.35), zone.width + 1.5, 0.2, 0.42);
        for (const x of [-1, 1]) box(group, ivory, x * (zone.width / 2 + 0.3), 0.25, z * (zone.depth / 2 + 0.35), 0.32, 0.5, 0.4);
      }
      box(group, waterMaterial, 0, 0.02, 0, zone.width + 0.4, 0.015, zone.depth + 0.15);
      for (const side of [-1,1]) {
        box(group, ivory, 0,-0.05,side*(zone.depth/2+0.9),zone.width+0.25,0.24,1.65);
        for (let i=0;i<4;i++) box(group,gold,0,0.08,side*(zone.depth/2+0.18+i*0.4),zone.width+0.2,0.025,0.035);
      }
    } else if (zone.role === 'pan') {
      // The counterweight arm is physically below the tray: it never hides the units.
      box(group, gold, 0, -0.05, 0, zone.width + 1.0, 0.16, 0.25);
      const arch = mesh(geo(new THREE.TorusGeometry(0.6, 0.07, 5, 24, Math.PI)), gold, group, 0, 0.16, -zone.depth / 2 - 0.42);
      arch.rotation.z = 0;
      for (const x of [-1, 1]) box(group, gold, x * zone.width / 2, 0.3, -zone.depth / 2 - 0.42, 0.09, 0.6, 0.09);
    } else if (zone.role === 'sail' || zone.role === 'wing') {
      box(group, gold, -zone.width / 2 - 0.2, 0.42, 0, 0.12, 0.84, zone.depth + 0.7);
      const sailGroup = new THREE.Group(); group.add(sailGroup); sailGroup.position.set(0, 0.18, -zone.depth / 2 - 0.6);
      for (let i = 0; i < zone.width; i++) {
        const panel = box(sailGroup, i % 2 ? coral : ivory, i - (zone.width - 1) / 2, 0, 0, 0.94, 0.055, 0.8);
        panel.rotation.x = -0.15; box(sailGroup, gold, i - (zone.width - 1) / 2, 0.045, 0, 0.03, 0.05, 0.82);
      }
      foliage.push(sailGroup);
    } else if (zone.role === 'basin' || zone.role === 'bed') {
      for (const x of [-1, 1]) box(group, coral, x * (zone.width / 2 + 0.12), 0.2, 0, 0.2, 0.32, zone.depth + 0.5);
      box(group, coral, 0, 0.2, -zone.depth / 2 - 0.12, zone.width + 0.4, 0.32, 0.2);
      for (let i = 0; i < Math.max(3, zone.width); i++) {
        const f = fanTree(group, (i - (Math.max(3, zone.width) - 1) / 2) * 0.75, -zone.depth / 2 - 0.85, 0.3);
        foliage.push(f);
      }
      line([new THREE.Vector3(0, 0.08, -zone.depth / 2 - 0.4), new THREE.Vector3(0, 0.08, -zone.depth / 2 - 1.5), new THREE.Vector3(2, 0.08, -zone.depth / 2 - 1.5)], green, 0.07, group);
    }
    if (zone.role === 'basin' || zone.role === 'wing') {
      for (const x of [-0.7,0.7]) {
        const plant=ratioPlant(group,x,-zone.depth/2-0.9);
        plant.userData.ratioPlant=true; foliage.push(plant);
      }
    }
    return { zone, group, moving, lamps, foliage, value: 0, target: 0, tilt: 0, targetTilt: 0 };
  }

  function load(next: Chapter, index: number, restored: number) {
    scene.remove(stage);
    stage.traverse(object => {
      if (object instanceof THREE.Mesh && !sharedGeometry.has(object.geometry)) {
        object.geometry.dispose(); geometryResources.delete(object.geometry);
      }
    });
    stage = new THREE.Group(); scene.add(stage);
    animations = []; fixtures = []; chapter = next; chapterIndex = index; celebration = -1; finalFlight = false;
    resetCamera();
    views.forEach(v => unitsRoot.remove(v.group)); views.clear(); ghosts.clear();
    scene.background = new THREE.Color(next.palette.sky); (scene.fog as THREE.FogExp2).color.set(next.palette.sky);
    waterMaterial.color.set(next.palette.water);
    // Two real shores, with the mechanism spanning open water. The camera sees why a bridge matters.
    island(stage, 0, 4.8, 21.6, 7);
    island(stage, 0, -6.1, 22.5, 4.7);
    line([new THREE.Vector3(-10.65,-0.3,3),new THREE.Vector3(-7.2,-0.3,8.2),new THREE.Vector3(6.8,-0.3,8.2),new THREE.Vector3(10.65,-0.3,3)], gold, 0.05, stage);
    line([new THREE.Vector3(-10,-0.3,-4.25),new THREE.Vector3(-5,-0.3,-3.8),new THREE.Vector3(5,-0.3,-3.8),new THREE.Vector3(10,-0.3,-4.25)],gold,0.05,stage);
    for (let i=0;i<10;i++) {
      // Staggered ceramic ribs articulate the quays rather than drawing a classroom grid.
      const x=-9+i*2;
      box(stage,coral,x,-0.09,1.55,1.72,0.16,0.38);
      box(stage,gold,x,-0.005,1.55,1.6,0.025,0.035);
      box(stage,warm,x,-0.04,-3.95,1.7,0.13,0.28);
    }
    for (let i = 0; i < 7; i++) {
      const x = -9 + i * 3;
      box(stage, warm, x, 0.005, 7.4, 1.2, 0.05, 0.09);
      const relief = mesh(geo(new THREE.TorusGeometry(0.25, 0.025, 3, 6)), gold, stage, x, 0.02, 7.65); relief.rotation.x = -Math.PI / 2;
    }
    restorationRoot = new THREE.Group(); stage.add(restorationRoot);
    for (let i = 0; i < 5; i++) {
      const x = -20 + i * 9.6; const z = -18 - Math.abs(i - 2) * 2;
      island(restorationRoot, x, z, 5.5, 4.6, true);
      tower(restorationRoot, x, z, 0.7 + (i % 2) * 0.3, i < restored);
      if (i < restored) { fanTree(restorationRoot, x + 1.4, z + 0.7, 0.65); boat(stage, x + 2.4, z + 4.8, 0.6); }
      if (i < restored && i > 0) line([new THREE.Vector3(x - 8,-0.05,z),new THREE.Vector3(x - 5,0.5,z+0.4),new THREE.Vector3(x - 2,0.3,z)], paleGold, 0.11, restorationRoot);
    }
    edgeArchitecture = new THREE.Group(); stage.add(edgeArchitecture);
    for (const [x,z,s] of [[-9.2,3,0.9],[9.5,-5,1.1],[-9.5,-6,0.85],[8,-7,0.65]]) fanTree(edgeArchitecture,x,z,s);
    tower(edgeArchitecture, -8, -6.8, 0.85, true); tower(edgeArchitecture, 8.8, -6.8, 1.05, index > 1);
    for (const side of [-1,1]) {
      for (let step=0;step<3;step++) box(edgeArchitecture,step%2?ivory:coral,side*(9-step*0.25),step*0.22,5.8-step*0.6,2.1,0.4,1.2);
      const lantern = new THREE.Group(); edgeArchitecture.add(lantern); lantern.position.set(side*7.7,0,1.8);
      box(lantern,gold,0,0.65,0,0.06,1.3,0.06);
      mesh(sphereGeo,light,lantern,0,1.38,0,0.15,0.27,0.15);
      const roof=mesh(coneGeo,gold,lantern,0,1.67,0,0.3,0.18,0.3); roof.rotation.y=Math.PI/6;
      for(let ring=0;ring<3;ring++){const coil=mesh(geo(new THREE.TorusGeometry(0.4+ring*0.1,0.055,5,24)),gold,edgeArchitecture,side*8,0.06+ring*0.05,4);coil.rotation.x=-Math.PI/2;}
    }
    // Folded arcade opens outward, so its height never overlaps the interaction surface.
    for (let i = 0; i < 5; i++) {
      const x = -5 + i * 2.5;
      box(edgeArchitecture, ivory, x, 1.0, -8.4, 0.22, 2, 0.28);
      const arch = mesh(geo(new THREE.TorusGeometry(1.1, 0.12, 5, 20, Math.PI)), gold, edgeArchitecture, x + 1.25, 1.6, -8.4);
      arch.scale.x = 1.13;
    }
    boat(stage, -15, 8, 1); boat(stage, 16, -1, 1.2);
    next.zones.forEach(z => fixtures.push(fixture(z)));
    companion = new THREE.Group(); stage.add(companion); companion.position.set(-6.8, 0.1, 2.8);
    const body = mesh(coneGeo, coral, companion, 0, 0.5, 0, 0.6, 1, 0.45); body.rotation.y = Math.PI / 6;
    mesh(sphereGeo, ivory, companion, 0, 1.08, 0, 0.27, 0.27, 0.25);
    const hat = mesh(coneGeo, gold, companion, 0, 1.43, 0, 0.46, 0.27, 0.46); hat.rotation.y = 0.3;
    for (const dx of [-0.09,0.09]) mesh(sphereGeo, dark, companion, dx, 1.1, 0.22, 0.025, 0.035, 0.02);
    box(companion, dark, -0.13, 0.07, 0.07, 0.16, 0.14, 0.28); box(companion, dark, 0.13, 0.07, 0.07, 0.16, 0.14, 0.28);
    whale = makeWhale(); whale.visible = true;
    // Returning to a completed city preserves its flight, without replaying the departure.
    if (chapter.rule === 'flight' && restored > index) { celebration = 7.5; finalFlight = true; }
    resize();
  }

  function update(nextBoard: Board, evaluation: Evaluation, nextSelected: string | null) {
    board = nextBoard; selected = nextSelected;
    const active = new Set<string>();
    const partiallyAnchored = evaluation.zones.some(zone => zone.count > 0);
    for (const piece of board.pieces) piece.units.forEach((unit, index) => {
      const cell: Cell = { ...unit, index, pieceId: piece.id, x: piece.x + index % piece.width, z: piece.z + Math.floor(index / piece.width) };
      active.add(unit.id); let v = views.get(unit.id);
      if (!v) {
        const g = new THREE.Group(); unitsRoot.add(g);
        const feather = chapter?.rule === 'flight';
        const body = mesh(feather ? featherGeo : unitGeo, unitMaterial[unit.matter], g);
        body.userData.unitId = unit.id;
        const markY = feather ? 0.207 : 0.249;
        if (unit.matter === 'amber') { const r = mesh(ringGeo, markMat, g, 0, markY, 0); r.rotation.x = -Math.PI / 2; }
        else for (const z of [-0.1, 0.1]) box(g, markMat, 0, markY, z, 0.39, 0.018, 0.06);
        if (feather) {
          box(g, paleGold, 0, 0.211, 0, 0.018, 0.014, 0.79);
          for (const side of [-1, 1]) for (const z of [-0.22, 0.22]) {
            const barb = box(g, paleGold, side * 0.1, 0.211, z, 0.21, 0.014, 0.017);
            barb.rotation.y = side * 0.55;
          }
        }
        const halo = mesh(selectGeo, chosenMat, g, 0, 0.05, 0); halo.rotation.x = -Math.PI / 2; halo.visible = false;
        v = { group: g, body, halo, target: new THREE.Vector3(cell.x, 0.18, cell.z), cell }; g.position.copy(v.target); views.set(unit.id, v);
      }
      const anchored = chapter?.zones.some(zone => cell.x >= zone.x && cell.x < zone.x + zone.width && cell.z >= zone.z && cell.z < zone.z + zone.depth);
      v.cell = cell; v.target.set(cell.x, 0.18, cell.z); v.group.rotation.z=0;
      v.body.material = anchored ? anchoredMaterial[unit.matter] : unitMaterial[unit.matter];
      v.halo.visible = piece.id === selected || (partiallyAnchored && !anchored);
      v.halo.material = piece.id === selected ? chosenMat : looseMat;
      v.halo.scale.setScalar(piece.id === selected ? 1 : 0.84);
    });
    for (const [id,v] of views) if (!active.has(id)) { unitsRoot.remove(v.group); views.delete(id); }
    for (const f of fixtures) {
      const reading = evaluation.zones.find(z => z.id === f.zone.id); if (!reading) continue;
      f.target = reading.satisfied ? 1 : Math.min(0.85, Math.max(0, reading.fill));
      if(chapter?.rule==='ratio'||chapter?.rule==='flight') f.target=Math.min(1,Math.min(reading.amber,reading.teal/2)/(f.zone.width*f.zone.depth/3));
      f.targetTilt = Math.max(-0.19, Math.min(0.19, reading.imbalance * 0.025));
      f.lamps.forEach((lamp, i) => { lamp.material = reading.satisfied || i < reading.fill * f.lamps.length ? light : gold; });
    }
    whaleTilt=chapter?.rule==='flight'?THREE.MathUtils.clamp(((evaluation.zones[0]?.count??0)-(evaluation.zones.at(-1)?.count??0))*0.018,-0.2,0.2):0;
  }

  const raycaster = new THREE.Raycaster(); const pointer = new THREE.Vector2();
  const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -0.18);
  const touches = new Map<number, { x: number; y: number }>();
  let gesture: { distance: number; zoom: number; midpoint: { x: number; y: number } } | null = null;
  let drag: { id: string; pointer: number; startX: number; startY: number; origin: THREE.Vector3; pieceX: number; pieceZ: number; moved: boolean; x: number; z: number } | null = null;
  function screenPoint(x: number, y: number) {
    const r = renderer.domElement.getBoundingClientRect(); pointer.set((x - r.left) / r.width * 2 - 1, -(y - r.top) / r.height * 2 + 1);
    raycaster.setFromCamera(pointer, camera);
    return raycaster.ray.intersectPlane(plane, new THREE.Vector3());
  }
  function point(event: PointerEvent) { return screenPoint(event.clientX, event.clientY); }
  function touchPair() {
    const [a,b] = [...touches.values()];
    return { distance: Math.max(1, Math.hypot(a.x-b.x,a.y-b.y)), midpoint: { x:(a.x+b.x)/2, y:(a.y+b.y)/2 } };
  }
  function zoom(delta: number) {
    if (paused) return;
    camera.zoom = THREE.MathUtils.clamp(camera.zoom * Math.exp(delta * 0.35), 1, 4);
    if (camera.zoom > 1 && selected) {
      const part = board.pieces.find(p => p.id === selected);
      if (part) focus.set(part.x + (part.width-1)/2, 0, part.z + (Math.ceil(part.units.length/part.width)-1)/2);
    } else if (camera.zoom === 1) focus.set(0, 0, 0.4);
    camera.updateProjectionMatrix();
  }
  function resetCamera() { camera.zoom = 1; focus.set(0,0,0.4); camera.updateProjectionMatrix(); }
  function wheel(e: WheelEvent) { if (paused) return; e.preventDefault(); zoom(e.deltaY < 0 ? 0.4 : -0.4); }
  function hit(event: PointerEvent) {
    point(event); const hits = raycaster.intersectObjects([...views.values()].map(v => v.body), false);
    return hits.length ? views.get(hits[0].object.userData.unitId as string) : undefined;
  }
  function pointerDown(e: PointerEvent) {
    if (paused || disposed || e.button !== 0) return;
    if (e.pointerType === 'touch') {
      touches.set(e.pointerId, {x:e.clientX,y:e.clientY});
      renderer.domElement.setPointerCapture(e.pointerId);
      if (touches.size >= 2) {
        release(undefined, true); gesture = { ...touchPair(), zoom: camera.zoom };
        for (const id of touches.keys()) renderer.domElement.setPointerCapture(id);
        e.preventDefault(); return;
      }
    }
    if (drag) return;
    const v = hit(e); const p = point(e); if (!v || !p) return;
    const piece = board.pieces.find(p => p.id === v.cell.pieceId); if (!piece) return;
    e.preventDefault(); callbacks.pick(v.cell);
    drag = { id: piece.id, pointer: e.pointerId, startX: e.clientX, startY: e.clientY, origin: p, pieceX: piece.x, pieceZ: piece.z, moved: false, x: piece.x, z: piece.z };
    renderer.domElement.setPointerCapture(e.pointerId);
  }
  function pointerMove(e: PointerEvent) {
    if (paused) return;
    if (touches.has(e.pointerId)) touches.set(e.pointerId, {x:e.clientX,y:e.clientY});
    if (gesture && touches.size >= 2) {
      e.preventDefault(); const pair = touchPair();
      const previousPoint = screenPoint(gesture.midpoint.x, gesture.midpoint.y); const nextPoint = screenPoint(pair.midpoint.x,pair.midpoint.y);
      if (previousPoint && nextPoint) { focus.add(previousPoint.sub(nextPoint)); focus.x = THREE.MathUtils.clamp(focus.x,-12,12); focus.z = THREE.MathUtils.clamp(focus.z,-7,8); }
      camera.zoom = THREE.MathUtils.clamp(gesture.zoom * pair.distance / gesture.distance, 1, 4); camera.updateProjectionMatrix();
      gesture.midpoint = pair.midpoint; return;
    }
    if (!drag) { const v = hit(e); renderer.domElement.style.cursor = v ? 'grab' : 'default'; callbacks.hover?.(v?.cell ?? null); return; }
    if (e.pointerId !== drag.pointer) return;
    if (Math.hypot(e.clientX - drag.startX, e.clientY - drag.startY) > 6) drag.moved = true;
    if (!drag.moved) return;
    const p = point(e); if (!p) return; e.preventDefault(); renderer.domElement.style.cursor = 'grabbing';
    drag.x = Math.round(drag.pieceX + p.x - drag.origin.x); drag.z = Math.round(drag.pieceZ + p.z - drag.origin.z);
    ghosts.clear();
    for (const v of views.values()) if (v.cell.pieceId === drag.id) {
      const dx = v.cell.x - drag.pieceX; const dz = v.cell.z - drag.pieceZ;
      v.target.set(drag.pieceX + p.x - drag.origin.x + dx, 0.85, drag.pieceZ + p.z - drag.origin.z + dz);
      mesh(chapter?.rule === 'flight' ? featherGeo : unitGeo, ghostMaterial, ghosts, drag.x + dx, 0.16, drag.z + dz);
    }
  }
  function release(e?: PointerEvent, cancel = false) {
    if (!drag || (e && e.pointerId !== drag.pointer)) return;
    const d = drag; drag = null; ghosts.clear(); renderer.domElement.style.cursor = 'grab';
    if (renderer.domElement.hasPointerCapture(d.pointer)) renderer.domElement.releasePointerCapture(d.pointer);
    for (const v of views.values()) v.target.set(v.cell.x, 0.18, v.cell.z);
    if (d.moved && !cancel && !paused) callbacks.move(d.id, d.x, d.z);
  }
  const pointerUp = (e: PointerEvent) => { touches.delete(e.pointerId); if (touches.size < 2) gesture = null; release(e); };
  const pointerCancel = (e: PointerEvent) => { touches.delete(e.pointerId); if (touches.size < 2) gesture = null; release(e, true); };
  const lostCapture = (e: PointerEvent) => { if (!gesture) release(e, true); };
  renderer.domElement.addEventListener('pointerdown', pointerDown);
  renderer.domElement.addEventListener('pointermove', pointerMove);
  renderer.domElement.addEventListener('pointerup', pointerUp);
  renderer.domElement.addEventListener('pointercancel', pointerCancel);
  renderer.domElement.addEventListener('lostpointercapture', lostCapture);
  renderer.domElement.addEventListener('wheel', wheel, { passive: false });

  function resize() {
    const w = Math.max(1, host.clientWidth); const h = Math.max(1, host.clientHeight);
    renderer.setSize(w, h, false);
    const aspect = w / h;
    const halfH = Math.max(12.2, 16.2 / aspect);
    camera.left = -halfH * aspect; camera.right = halfH * aspect; camera.top = halfH; camera.bottom = -halfH;
    camera.updateProjectionMatrix();
  }
  const observer = new ResizeObserver(resize); observer.observe(host); resize();
  function animate(now: number) {
    if (disposed) return;
    // A queued RAF timestamp can precede performance.now() during a slow boot.
    // Negative deltas made high-damping reduced-motion cameras become NaN.
    const elapsed = now - previous;
    const dt = Number.isFinite(elapsed) ? Math.max(0, Math.min(elapsed / 1000, 0.05)) : 0;
    previous = now;
    if (!paused) {
      clock += dt;
      lensAmount = THREE.MathUtils.damp(lensAmount, lens ? 1 : 0, reduced ? 1000 : 5, dt);
      camera.position.copy(focus).add(new THREE.Vector3(13 * (1 - lensAmount), 23 + lensAmount * 15, 24 * (1 - lensAmount) + lensAmount * 0.01));
      camera.lookAt(focus); camera.updateMatrixWorld();
      edgeArchitecture.position.y = -lensAmount * 3.8;
      for (const v of views.values()) {
        v.group.position.lerp(v.target, 1 - Math.exp(-dt * (drag ? 24 : 9)));
        v.halo.rotation.z = reduced ? 0 : clock * 0.3;
      }
      for (const f of fixtures) {
        f.value = THREE.MathUtils.damp(f.value, f.target, 4, dt); f.tilt = THREE.MathUtils.damp(f.tilt, f.targetTilt, 4, dt);
        if (f.zone.role === 'pan') {
          f.moving.rotation.z = f.tilt * 0.2;
          f.moving.position.y = 0.28 - f.tilt;
          for (const v of views.values()) {
            if (drag?.id === v.cell.pieceId) continue;
            if (v.cell.x >= f.zone.x && v.cell.x < f.zone.x + f.zone.width && v.cell.z >= f.zone.z && v.cell.z < f.zone.z + f.zone.depth) {
              v.target.y = 0.18 + f.moving.position.y + Math.sin(f.moving.rotation.z) * (v.cell.x - f.group.position.x);
              v.group.rotation.z = f.moving.rotation.z;
            }
          }
        }
        f.foliage.forEach((o, i) => {
          if(o.userData.ratioPlant) {
            o.scale.y=0.4+f.value*0.7; o.rotation.z=f.tilt*1.5; o.rotation.x=Math.abs(f.tilt)*0.5;
          } else if (f.zone.role === 'sail' || f.zone.role === 'wing') { o.rotation.x = -f.value * 1.05; o.scale.z = 0.25 + f.value * 1.8; }
          else { const s = 0.12 + f.value * 0.35; o.scale.set(s, s * (0.7 + f.value), s); o.rotation.z = reduced ? 0 : Math.sin(clock * 0.7 + i) * 0.025; }
        });
      }
      if (!reduced) {
        animations.forEach(a => { if (a.amplitude) a.object.position.y = a.y + Math.sin(clock * 0.75 + a.phase) * a.amplitude; else a.object.rotation.z = Math.sin(clock * 0.45 + a.phase) * 0.018; });
        ripples.forEach((r, i) => { r.position.x += Math.sin(i) * dt * 0.025; });
        companion.rotation.y = 0.1 + Math.sin(clock * 0.6) * 0.09;
      }
      if (celebration >= 0) {
        celebration += dt; const t = Math.min(celebration / 7.5, 1); const ease = t * t * (3 - 2 * t);
        if (finalFlight) {
          whale.visible = true; whale.position.y = -0.2 + ease * 5.2; whale.position.x = -1 + ease * 2.3; whale.position.z=-13+ease*5;
          whale.rotation.z = -ease * 0.08;
          wingLeft.rotation.x = -0.15 - Math.sin(ease * Math.PI) * 0.45;
          wingRight.rotation.x = 0.15 + Math.sin(ease * Math.PI) * 0.45;
          if (!reduced && t === 1) { whale.position.y += Math.sin(clock * 0.45) * 0.2; wingLeft.rotation.x -= Math.sin(clock * 0.45) * 0.13; wingRight.rotation.x += Math.sin(clock * 0.45) * 0.13; }
        } else {
          restorationRoot.position.y = ease * 0.3;
          const bridge = fixtures.find(f=>f.zone.role==='bridge');
          if(bridge) {
            if(t<0.4){ companion.position.x=THREE.MathUtils.lerp(-6.8,bridge.group.position.x,t/0.4); companion.position.z=2.8; }
            else {companion.position.x=bridge.group.position.x; companion.position.z=THREE.MathUtils.lerp(2.8,-4.6,(t-0.4)/0.6);}
            companion.position.y=0.1+(!reduced?Math.abs(Math.sin(clock*7))*0.04:0);
          } else companion.position.x = -6.8 + ease * 2.1;
        }
      } else {
        whale.rotation.z=THREE.MathUtils.damp(whale.rotation.z,whaleTilt,3,dt);
        const lift=chapter?.rule==='flight'?fixtures.reduce((s,f)=>s+f.value,0)/Math.max(1,fixtures.length)*0.8:0;
        whale.position.y=-0.2+lift+(!reduced?Math.sin(clock*0.35)*0.15:0);
      }
    }
    renderer.render(scene, camera);
  }
  renderer.setAnimationLoop(animate);
  return {
    load, update, zoom, resetCamera,
    setLens(on) { lens = on; if (reduced) lensAmount = on ? 1 : 0; },
    setReducedMotion(on) { reduced = on; },
    setPaused(on) { paused = on; if (on) { release(undefined, true); touches.clear(); gesture = null; } },
    celebrate(final) {
      resetCamera();
      celebration = reduced ? 7.5 : 0; finalFlight = final;
      fixtures.forEach(f => { if (chapter?.rule !== 'ratio' && chapter?.rule !== 'flight') f.target = 1; f.targetTilt = 0; f.lamps.forEach(l => { l.material = light; }); });
      if (chapter) { const position = -20 + Math.min(chapterIndex, 4) * 9.6; fanTree(restorationRoot, position + 1.1, -18 - Math.abs(chapterIndex - 2) * 2 + 0.5, 0.6); }
    },
    project(x, z) { camera.updateMatrixWorld(); const p = new THREE.Vector3(x, 0.42, z).project(camera); const r = renderer.domElement.getBoundingClientRect(); return { x: r.left + (p.x + 1) * r.width / 2, y: r.top + (1 - p.y) * r.height / 2 }; },
    dispose() {
      disposed = true; renderer.setAnimationLoop(null); observer.disconnect(); release(undefined, true);
      renderer.domElement.removeEventListener('pointerdown', pointerDown); renderer.domElement.removeEventListener('pointermove', pointerMove);
      renderer.domElement.removeEventListener('pointerup', pointerUp); renderer.domElement.removeEventListener('pointercancel', pointerCancel); renderer.domElement.removeEventListener('lostpointercapture', lostCapture);
      renderer.domElement.removeEventListener('wheel', wheel);
      geometryResources.forEach(g => g.dispose()); materialResources.forEach(m => m.dispose());
      scene.clear(); renderer.dispose(); renderer.domElement.remove();
    },
  };
}
