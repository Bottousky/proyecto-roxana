import * as THREE from 'three';

// Each face owns its vertices: neither normals nor slate UVs cross a roof edge.
function surface(world, faces, material, parent, name, density = .2) {
  const positions = [], uvs = [];
  for (const { points, normal } of faces) {
    const vertices = points.map(point => new THREE.Vector3(...point));
    const origin = vertices[0], u = vertices[1].clone().sub(origin).normalize();
    const expected = new THREE.Vector3(...normal);
    const n = vertices[1].clone().sub(origin).cross(vertices[2].clone().sub(origin)).normalize();
    if (n.dot(expected) < 0) n.negate();
    const v = n.clone().cross(u).normalize();
    for (let i = 1; i < vertices.length - 1; i++) {
      const triangle = [vertices[0], vertices[i], vertices[i + 1]];
      const cross = triangle[1].clone().sub(triangle[0]).cross(triangle[2].clone().sub(triangle[0]));
      if (cross.dot(n) < 0) [triangle[1], triangle[2]] = [triangle[2], triangle[1]];
      for (const point of triangle) {
        positions.push(...point.toArray());
        const relative = point.clone().sub(origin);
        uvs.push(relative.dot(u) * density, relative.dot(v) * density);
      }
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geometry.computeVertexNormals();
  world.localGeometries.push(geometry);
  const mesh = world.mesh(geometry, material, 0, 0, 0, 1, 1, 1, parent);
  mesh.name = name;
  return mesh;
}

function roof(world, parent, width, depth, base, rise, material, wall, options = {}) {
  const group = world.group(0, base, 0, parent);
  group.name = options.name || 'roof';
  const alongZ = options.ridge === 'z';
  if (alongZ) group.rotation.y = Math.PI / 2;
  const a = (alongZ ? depth : width) / 2, b = (alongZ ? width : depth) / 2;
  const overhang = options.overhang ?? .5, outerA = a + overhang, outerB = b + overhang;
  const pitch = rise / b, eave = -overhang * pitch, thickness = .16;
  const hip = options.hip === true;
  const ridgeEnd = hip ? Math.max(.25, a - Math.min(a * .65, b * .76)) : outerA;
  const leftRidge = [-ridgeEnd, rise, 0], rightRidge = [ridgeEnd, rise, 0];
  const fl = [-outerA, eave, outerB], fr = [outerA, eave, outerB];
  const bl = [-outerA, eave, -outerB], br = [outerA, eave, -outerB];
  const faces = [
    { points: [fl, fr, rightRidge, leftRidge], normal: [0, 1, pitch] },
    { points: [br, bl, leftRidge, rightRidge], normal: [0, 1, -pitch] },
  ];
  if (hip) {
    faces.push({ points: [fr, br, rightRidge], normal: [1, 1, 0] });
    faces.push({ points: [bl, fl, leftRidge], normal: [-1, 1, 0] });
  }
  surface(world, faces, material, group, 'slate-roof-surfaces');

  // A dark timber underside and solid fascias give the covering a real edge.
  const edgeFaces = [];
  const outline = hip ? [[fl, fr], [fr, br], [br, bl], [bl, fl]] :
    [[fl, fr], [br, bl], [fr, rightRidge], [rightRidge, br], [bl, leftRidge], [leftRidge, fl]];
  for (const [p, q] of outline) {
    const downP = [p[0], p[1] - thickness, p[2]], downQ = [q[0], q[1] - thickness, q[2]];
    const midpoint = [(p[0] + q[0]) / 2, 0, (p[2] + q[2]) / 2];
    edgeFaces.push({ points: [p, q, downQ, downP], normal: midpoint });
  }
  edgeFaces.push({ points: [[-outerA, eave - thickness, -outerB], [outerA, eave - thickness, -outerB], [outerA, eave - thickness, outerB], [-outerA, eave - thickness, outerB]], normal: [0, -1, 0] });
  surface(world, edgeFaces, world.m.darkwood, group, 'roof-fascia-and-soffit');

  // Gables are masonry/plaster inside the roof, never triangles of roof texture.
  if (!hip) {
    surface(world, [
      { points: [[a, 0, b], [a, 0, -b], [a, rise, 0]], normal: [1, 0, 0] },
      { points: [[-a, 0, -b], [-a, 0, b], [-a, rise, 0]], normal: [-1, 0, 0] },
    ], wall, group, 'solid-gable-walls');
    for (const side of [-1, 1]) {
      const x = side * (a + .035);
      world.beam([x, .03, -b], [x, rise - .08, 0], .11, world.m.darkwood, group);
      world.beam([x, rise - .08, 0], [x, .03, b], .11, world.m.darkwood, group);
      world.box(x, rise * .38, 0, .11, rise * .7, .12, world.m.darkwood, group);
    }
  }

  // Rounded cap tiles follow the ridge; there are no metal ribs across the slopes.
  const capCount = Math.max(2, Math.ceil(ridgeEnd * 2 / .54));
  const segment = ridgeEnd * 2 / capCount;
  for (let i = 0; i < capCount; i++) {
    const cap = world.cylinder(-ridgeEnd + segment * (i + .5), rise + .025, 0, .13, segment + .035, material, group);
    cap.rotation.z = Math.PI / 2;
  }
  if (hip) for (const [end, corner] of [[rightRidge, fr], [rightRidge, br], [leftRidge, fl], [leftRidge, bl]]) {
    world.beam(end, corner, .11, material, group);
  }
  group.userData.roof = { width, depth, rise, overhang, thickness, ridge: alongZ ? 'z' : 'x', hip };
  return group;
}

function workshopWindow(world, parent, x, y, z, width, height, name) {
  const group = world.group(x, y, z, parent);
  group.name = name;
  world.box(0, 0, 0, width + .18, height + .18, .14, world.m.darkwood, group);
  world.box(0, 0, .10, width, height, .055, world.m.glass, group).name = 'workshop-window-glass';
  for (const side of [-1, 1]) world.box(side * width / 6, 0, .15, .07, height, .055, world.m.darkwood, group);
  world.box(0, 0, .15, width, .07, .055, world.m.darkwood, group);
  world.box(0, -height / 2 - .12, .10, width + .3, .15, .35, world.m.stone, group);
  return group;
}

/**
 * Visual architecture only. Local front is +Z and opts.rotation turns the whole
 * building about Y. The caller registers collisions from userData.architecture:
 * footprint and blockers use WORLD coordinates and FULL w/d dimensions.
 * Roof overhangs, a shallow threshold, and overhead canopies are not obstacles.
 */
export function buildArchitecture(world, x, z, w = 6, d = 5, h = 4, opts = {}) {
  const group = world.group(x, 0, z);
  group.name = opts.workshop ? 'workshop-exterior' : 'village-building';
  group.rotation.y = opts.rotation || 0;
  const cosine = Math.cos(group.rotation.y), sine = Math.sin(group.rotation.y);
  const transform = (px, pz) => ({ x: x + px * cosine + pz * sine, z: z - px * sine + pz * cosine });
  const rectangle = (px, pz, width, depth, kind) => ({ ...transform(px, pz), w: Math.abs(cosine) * width + Math.abs(sine) * depth, d: Math.abs(sine) * width + Math.abs(cosine) * depth, ...(kind ? { kind } : {}) });
  const footprint = rectangle(0, 0, w + .3, d + .3);
  const blockers = [];
  const front = d / 2, wallTop = h + .45, wall = opts.stone ? world.m.stone : (world.m.timber || world.m.cream);
  const covering = opts.red ? world.m.roofRed : world.m.roof;
  const fullStorey = h >= 4.55;
  const mainWorkshop = opts.workshop && w >= 7.5 && h >= 5.5;
  const storeyLine = mainWorkshop ? .45 + h * .5 : 2.95;
  const upperWindowY = mainWorkshop ? .45 + h * .74 : h - .4;
  world.contact(x, z, footprint.w + 1.05, footprint.d + 1.05);
  const base = world.box(0, .3, 0, w + .3, .6, d + .3, world.m.stoneDark, group);
  base.name = 'building-foundation';
  world.box(0, h / 2 + .45, 0, w, h, d, wall, group).name = 'building-walls';
  world.box(0, .69, 0, w + .08, .18, d + .08, world.m.stone, group);
  // Framed houses stand on a stone plinth to the windowsills, like the village houses of the references.
  if (!opts.stone) world.box(0, .8, 0, w + .07, .7, d + .07, world.m.stone, group).name = 'building-plinth';
  world.box(0, wallTop - .06, 0, w + .1, .18, d + .1, world.m.darkwood, group);

  // Structural bays deliberately frame doors/windows rather than crossing them.
  for (const side of [-1, 1]) {
    for (const back of [-1, 1]) {
      if (opts.stone) {
        for (let y = .9, row = 0; y < wallTop - .2; y += .55, row++) {
          world.box(side * (w / 2 - .15), y, back * (d / 2 - .15), row % 2 ? .42 : .6, .37, row % 2 ? .59 : .4, world.m.stoneDark, group);
        }
      } else world.box(side * (w / 2 - .08), h / 2 + .5, back * (d / 2 - .035), .19, h + .05, .19, world.m.darkwood, group);
    }
  }
  if (fullStorey) world.box(0, storeyLine, front + .035, w, .17, .15, world.m.darkwood, group);
  if (!opts.stone) {
    for (const side of [-1, 1]) world.box(side * (mainWorkshop ? 1.04 : .82), h / 2 + .5, front + .02, .14, h, .15, world.m.darkwood, group);
    for (const side of [-1, 1]) {
      const face = world.group(side * (w / 2 + .035), 0, 0, group);
      face.rotation.y = side * Math.PI / 2;
      world.box(0, fullStorey ? storeyLine : 1.25, 0, d, .15, .12, world.m.darkwood, face);
      world.box(0, h / 2 + .5, 0, .15, h, .13, world.m.darkwood, face);
      world.beam([-d / 2 + .25, .8, .01], [-.18, 1.8, .01], .11, world.m.darkwood, face);
      world.beam([d / 2 - .25, .8, .01], [.18, 1.8, .01], .11, world.m.darkwood, face);
    }
  }

  // A door promises a room you can enter; houses that cannot be entered show a window instead.
  if (opts.noDoor) world.window(0, 1.98, front + .075, group);
  else {
    const door = world.group(0, 0, front + .045, group);
    door.name = 'building-entrance-door';
    if (mainWorkshop) door.scale.set(1.22, 1.14, 1);
    world.door(0, 0, 0, door);
    const doorFrame = world.group(0, 0, front + .02, group);
    doorFrame.name = 'building-entrance-frame';
    for (const side of [-1, 1]) {
      world.box(side * (mainWorkshop ? .89 : .7), mainWorkshop ? 1.48 : 1.29, 0, mainWorkshop ? .22 : .18, mainWorkshop ? 2.9 : 2.52, .25, opts.stone ? world.m.stone : world.m.darkwood, doorFrame);
    }
    // A lintel and a warm transom make the usable entrance legible below the eave.
    world.box(0, mainWorkshop ? 2.99 : 2.61, .04, mainWorkshop ? 2.08 : 1.62, .21, .33, world.m.stone, doorFrame);
    if (h > 3.7) {
      const transomY = mainWorkshop ? 3.23 : 2.88;
      world.box(0, transomY, .055, mainWorkshop ? 1.08 : .78, .28, .15, world.m.darkwood, doorFrame);
      world.box(0, transomY, .145, mainWorkshop ? .9 : .62, .17, .05, world.m.glass, doorFrame).name = 'window-pane';
      for (const side of [-1, 1]) world.box(side * (mainWorkshop ? .24 : .16), transomY, .18, .035, .18, .03, world.m.brass, doorFrame);
    }
  }
  for (const side of [-1, 1]) {
    if (mainWorkshop) {
      workshopWindow(world, group, side * w * .30, 2.05, front + .075, Math.min(2.3, w * .25), 1.84, 'workshop-ground-window');
      workshopWindow(world, group, side * w * .30, upperWindowY, front + .075, Math.min(2.1, w * .23), 1.8, 'workshop-upper-window');
      continue;
    }
    const windowGroup = world.group(side * w * .30, 0, 0, group);
    if (opts.workshop) windowGroup.scale.x = 1.12;
    // Leave a complete sill-to-lintel gap between storeys.
    world.window(0, 1.98, front + .075, windowGroup);
    // A flower box under each ground-floor window.
    world.box(0, 1.08, front + .36, 1.25, .26, .34, world.m.darkwood, windowGroup).name = 'window-flower-box';
    blockers.push(rectangle(side * w * .30, front + .36, 1.25 * (opts.workshop ? 1.12 : 1) + .1, .44, 'flower-box'));
    for (let i = 0; i < 7; i++) world.sphere(-.5 + i * .167, 1.3 + (i % 2) * .05, front + .36 + (i % 3 - 1) * .06, .12, i % 3 === 1 ? world.m.leafLight : i % 2 ? world.m.leaf : world.m.flower, windowGroup, .8);
    if (fullStorey) world.window(0, h - .4, front + .075, windowGroup, true);
  }
  // Even a rotated house retains inhabited side walls, not blank slabs.
  for (const side of [-1, 1]) {
    const sideWall = world.group(side * (w / 2 + .045), 0, 0, group);
    sideWall.rotation.y = side * Math.PI / 2;
    for (const bay of [-1, 1]) {
      world.window(bay * d * .26, 2.04, 0, sideWall, true);
      if (fullStorey) world.window(bay * d * .26, upperWindowY, 0, sideWall, true);
    }
  }

  const rise = Math.max(1.3, Math.min(2.22, Math.min(w, d) * .34));
  const ridge = opts.ridge || (opts.stone && w < 5.2 ? 'z' : 'x');
  roof(world, group, w, d, wallTop + .08, rise, covering, wall, { ridge, hip: opts.stone && w >= 6.8, overhang: opts.eave });

  // Compact dormers break broad roof slopes and keep the front silhouette human.
  if (ridge === 'x' && (opts.workshop || (fullStorey && !opts.stone))) {
    const dormer = world.group(opts.workshop && !mainWorkshop ? -.4 : 0, wallTop + rise * .46, d * .20, group);
    dormer.name = 'front-dormer';
    if (mainWorkshop) dormer.scale.setScalar(1.18);
    world.box(0, .33, 0, 1.55, .8, 1.05, wall, dormer);
    world.box(0, .23, .57, .78, .72, .12, world.m.darkwood, dormer);
    world.box(0, .23, .65, .62, .56, .06, world.m.glass, dormer).name = 'window-pane';
    world.box(0, .23, .70, .055, .6, .045, world.m.darkwood, dormer);
    world.box(0, .23, .70, .66, .055, .045, world.m.darkwood, dormer);
    roof(world, dormer, 1.55, 1.15, .72, .56, covering, wall, { ridge: 'z', overhang: .14, name: 'dormer-roof' });
  }

  // A two-storey framed house carries a small timber balcony under its upper middle bay.
  if (fullStorey && !opts.stone && !opts.workshop) {
    const balcony = world.group(0, storeyLine + .05, front, group);
    balcony.name = 'front-balcony';
    world.box(0, 0, .42, 1.9, .12, .84, world.m.darkwood, balcony);
    for (const side of [-1, 1]) world.beam([side * .8, -.7, .04], [side * .8, -.06, .78], .08, world.m.darkwood, balcony);
    world.box(0, .52, .82, 1.9, .07, .07, world.m.wood, balcony);
    world.box(0, .08, .82, 1.9, .05, .05, world.m.wood, balcony);
    for (let i = 0; i < 9; i++) world.box(-.88 + i * .22, .3, .82, .05, .44, .05, world.m.wood, balcony);
    for (const side of [-1, 1]) world.box(side * .92, .3, .43, .05, .44, .8, world.m.wood, balcony);
    for (let i = 0; i < 5; i++) world.sphere(-.6 + i * .3, .62, .78, .13, i % 2 ? world.m.flower : world.m.leafLight, balcony, .75);
  }
  // A trade hangs its sign from a wrought bracket at the corner, above head height.
  if (opts.service || opts.awning) {
    const sign = world.group(w / 2 + .06, -.9, front - .25, group);
    sign.name = 'trade-sign';
    sign.scale.setScalar(1.3);
    world.box(.42, 3.05, 0, .9, .06, .06, world.m.metal, sign);
    world.beam([.04, 2.62, 0], [.62, 3.03, 0], .035, world.m.metal, sign);
    for (const x of [.22, .72]) world.box(x, 2.9, 0, .02, .26, .02, world.m.metal, sign);
    world.box(.47, 2.55, 0, .74, .52, .07, world.m.wood, sign);
    world.box(.47, 2.55, .045, .6, .38, .02, opts.red ? world.m.roofRed : world.m.brass, sign);
  }
  const chimneyX = opts.workshop ? w * .31 : w * .29, chimneyZ = -d * .16;
  const chimneyTop = wallTop + rise + (opts.service === 'forge' ? 1.15 : opts.workshop ? .76 : .48);
  const chimney = world.group(chimneyX, 0, chimneyZ, group);
  chimney.name = opts.workshop ? 'workshop-flue' : 'chimney';
  world.box(0, (wallTop + chimneyTop) / 2, 0, opts.workshop ? 1 : .75, chimneyTop - wallTop, .82, world.m.stone, chimney);
  for (let y = wallTop + .2; y < chimneyTop; y += .45) world.box(0, y, .426, opts.workshop ? 1.01 : .76, .035, .03, world.m.stoneDark, chimney);
  world.box(0, chimneyTop + .02, 0, opts.workshop ? 1.18 : .96, .2, 1.02, world.m.stoneDark, chimney);
  world.box(0, chimneyTop + .14, 0, .57, .08, .55, world.m.dark, chimney);
  const chimneyWorld = transform(chimneyX, chimneyZ);
  world.smoke(chimneyWorld.x, chimneyTop + .25, chimneyWorld.z);

  const addBlocker = (px, pz, width, depth, kind) => blockers.push(rectangle(px, pz, width, depth, kind));
  const planter = (px, pz, radius = .34) => {
    const pot = world.group(px, 0, pz, group);
    pot.name = 'front-planter';
    world.cylinder(0, .24, 0, radius, .48, world.m.roofRed, pot);
    world.torus(0, .49, 0, radius * .9, .055, world.m.roofRed, [Math.PI / 2, 0, 0], pot);
    world.cylinder(0, .475, 0, radius * .82, .025, world.m.dark, pot);
    for (let i = 0; i < 6; i++) {
      const angle = i * 2.4, px = Math.cos(angle) * radius * .65, pz = Math.sin(angle) * radius * .65;
      world.beam([0, .47, 0], [px, .7 + i % 2 * .12, pz], .04, world.m.leaf, pot);
      world.sphere(px, .7 + i % 2 * .12, pz, radius * .28, i % 2 ? world.m.flower : world.m.leafLight, pot, .7);
    }
    addBlocker(px, pz, radius * 2, radius * 2, 'planter');
  };

  if (opts.awning && !opts.workshop) {
    const awningWidth = w * .87, reach = 1.55, high = 3.0, low = 2.66;
    surface(world, [{ points: [[-awningWidth / 2, high, front + .13], [awningWidth / 2, high, front + .13], [awningWidth / 2, low, front + reach], [-awningWidth / 2, low, front + reach]], normal: [0, 1, .2] }], opts.service === 'forge' ? world.m.metal : world.m.cloth, group, 'canvas-awning', .4);
    for (const side of [-1, 1]) {
      world.box(side * awningWidth / 2, low / 2, front + reach, .12, low, .12, world.m.darkwood, group);
      world.beam([side * awningWidth / 2, low - .5, front + reach], [side * awningWidth / 2, high, front + .13], .07, world.m.wood, group);
      addBlocker(side * awningWidth / 2, front + reach, .14, .14, 'awning-post');
    }
    world.box(0, low, front + reach, awningWidth + .12, .10, .13, world.m.darkwood, group);
    if(opts.service !== 'forge')for (let i = 0; i < 9; i++) world.box(-awningWidth / 2 + (i + .5) * awningWidth / 9, low - .12, front + reach + .035, awningWidth / 9 - .018, .22, .055, i % 2 ? world.m.cloth : world.m.redcloth, group);
    // Split stall furniture keeps the door and its approach completely clear.
    const stallWidth = Math.max(.72, w / 2 - 1.35), stallX = -w / 2 + stallWidth / 2 + .28, stallZ = front + .74;
    const goods=world.group(stallX,0,stallZ,group);goods.name=`${opts.service||'market'}-counter`;
    if(opts.service==='forge'){
      world.cylinder(0,.4,0,.3,.8,world.m.darkwood,goods);
      world.box(0,.83,0,.7,.16,.56,world.m.metal,goods);world.box(0,1.02,0,.4,.3,.35,world.m.metal,goods);world.box(0,1.2,0,stallWidth*.75,.17,.45,world.m.metal,goods);
      const horn=world.mesh('cone',world.m.metal,stallWidth*.43,1.19,0,.16,stallWidth*.35,.16,goods);horn.rotation.z=-Math.PI/2;
      world.beam([-.15,1.33,.18],[.3,1.36,-.16],.055,world.m.wood,goods);world.box(-.14,1.36,.17,.24,.15,.13,world.m.metal,goods);
    }else{
      world.box(0,.54,0,stallWidth,1.08,.66,world.m.darkwood,goods);world.box(0,1.13,0,stallWidth+.08,.11,.78,world.m.wood,goods);
      if(opts.service==='fishing'){
        for(let i=0;i<4;i++)world.torus(-stallWidth*.15,1.23+i*.045,0,.22,.032,world.m.cloth,[Math.PI/2,0,0],goods);
        for(let i=0;i<3;i++)world.sphere(stallWidth*.24,1.23,i*.14-.14,.08,world.m.metal,goods,.4).scale.x*=2.2;
      }else for(let i=0;i<7;i++){
        const item=world.sphere(-stallWidth*.38+i*stallWidth*.12,1.28+i%2*.02,i%2?-.12:.12,.11,opts.service==='bakery'?world.m.wood:i%2?world.m.flower:world.m.redcloth,goods,opts.service==='bakery'?.7:1);
        if(opts.service==='bakery')item.scale.x*=1.55;
      }
    }
    addBlocker(stallX, stallZ, stallWidth + .08, .78, goods.name);
    planter(w / 2 - .52, front + .6);
    if(opts.service==='forge'||opts.service==='bakery'){
      const emblem=world.group(0,3.63,front+.12,group);emblem.name=`${opts.service}-emblem`;
      world.box(0,0,0,1.35,.78,.13,world.m.darkwood,emblem);
      if(opts.service==='forge')for(const side of [-1,1]){
        world.beam([-side*.27,-.23,.1],[side*.23,.2,.1],.07,world.m.wood,emblem);const head=world.box(side*.22,.2,.15,.36,.18,.1,world.m.brass,emblem);head.rotation.z=side*.65;
      }else{
        const loaf=world.sphere(0,0,.15,.25,world.m.flower,emblem,.65);loaf.scale.x*=1.9;
        for(const xx of [-.22,0,.22]){const cut=world.box(xx,.035,.39,.035,.21,.03,world.m.cream,emblem);cut.rotation.z=-.3;}
      }
    }
  } else {
    for (const side of [-1, 1]) planter(side * (w / 2 - .45), front + .51);
  }

  if (opts.workshop) {
    const porch = world.group(0, 0, front, group);
    porch.name = 'workshop-entrance-porch';
    const porchWidth = mainWorkshop ? Math.min(w * .45, 4.6) : 2.22;
    const porchDepth = mainWorkshop ? 1.75 : 1.16;
    const porchRoof = roof(world, porch, porchWidth, porchDepth, mainWorkshop ? 3.55 : 3.22, mainWorkshop ? .7 : .5, covering, world.m.cream, { ridge: 'z', overhang: mainWorkshop ? .16 : .12, name: 'porch-roof' });
    // Roof centered over the doorway; the open post pair defines a passable gap.
    porchRoof.position.z = porchDepth / 2;
    const postX = mainWorkshop ? porchWidth / 2 - .3 : 1.02;
    const postZ = mainWorkshop ? 1.55 : 1.04;
    const postHeight = mainWorkshop ? 3.42 : 3.06;
    const postBase = mainWorkshop ? .4 : .25;
    for (const side of [-1, 1]) {
      world.box(side * postX, postHeight / 2, postZ, mainWorkshop ? .24 : .15, postHeight, mainWorkshop ? .24 : .15, world.m.darkwood, porch);
      world.box(side * postX, .15, postZ, postBase, .3, postBase, world.m.stoneDark, porch).name = 'porch-post-base';
      world.beam([side * postX, mainWorkshop ? 2.6 : 2.35, postZ], [side * (postX - (mainWorkshop ? .6 : .45)), mainWorkshop ? 3.38 : 3.12, postZ], mainWorkshop ? .15 : .11, world.m.darkwood, porch);
      addBlocker(side * postX, front + postZ, postBase, postBase, 'porch-post');
    }
    // One readable lamp emblem, made from the same brass as Edda's instruments.
    const emblem = world.group(mainWorkshop ? 0 : w * .30, mainWorkshop ? upperWindowY : 3.46, front + .12, group);
    emblem.name = 'workshop-lamp-emblem';
    if (mainWorkshop) emblem.scale.setScalar(1.35);
    world.box(0, 0, 0, .9, .86, .13, world.m.darkwood, emblem);
    world.torus(0, 0, .10, .27, .048, world.m.brass, null, emblem);
    world.sphere(0, .015, .12, .145, world.m.glass, emblem);
    world.box(0, -.25, .12, .31, .09, .1, world.m.brass, emblem);
    for (const side of [-1, 1]) world.beam([side * .1, -.09, .12], [side * .1, -.24, .12], .04, world.m.brass, emblem);
    // A stout exterior copper flue links this façade visually to the workbench.
    const pipeX = w / 2 - .33;
    world.cylinder(pipeX, 1.58, front + .13, .09, 2.6, world.m.brass, group);
    for (const y of [.67, 1.8, 2.65]) world.box(pipeX, y, front + .13, .27, .11, .2, world.m.metal, group);
  }

  group.userData.architecture = {
    footprint,
    entrance: opts.noDoor ? null : { ...transform(0, front + .29), direction: [sine, cosine], approach: transform(0, front + .9) },
    blockers,
    dimensions: { width: w, depth: d, height: h, foundation: .3 },
    roof: { ridge, rise, overhang: opts.eave ?? .5 },
  };
  return group;
}
