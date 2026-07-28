import fs from 'node:fs';
import path from 'node:path';

const [starterPath, assessmentPath, anatomyPath, detailPath, outputPath] = process.argv.slice(2);
if (![starterPath, assessmentPath, anatomyPath, detailPath, outputPath].every(Boolean)) {
  throw new Error('usage: node author-roxana-statue-spec.mjs <starter> <assessment> <anatomy> <detail> <out>');
}

const starter = JSON.parse(fs.readFileSync(starterPath, 'utf8'));
const assessment = JSON.parse(fs.readFileSync(assessmentPath, 'utf8'));
const anatomy = JSON.parse(fs.readFileSync(anatomyPath, 'utf8'));
const detail = JSON.parse(fs.readFileSync(detailPath, 'utf8'));
const refRoot = path.resolve(path.dirname(starter.sourceImage));

const evidence = {
  front: path.join(refRoot, 'roxana-front.png'),
  right: path.join(refRoot, 'roxana-right.png'),
  back: path.join(refRoot, 'roxana-back.png'),
  left: path.join(refRoot, 'roxana-left.png'),
};

const stoneRecipe = {
  dominantAlbedo: 'rgba(151, 126, 91, 1.0)',
  secondaryAlbedo: 'rgba(190, 164, 121, 1.0)',
  materialClass: 'stone',
  materialClassConfidence: 0.94,
  colorGradient: {
    type: 'linear',
    stops: [
      {offset: 0, color: 'rgba(112, 91, 65, 1.0)'},
      {offset: 0.55, color: 'rgba(165, 138, 99, 1.0)'},
      {offset: 1, color: 'rgba(202, 178, 135, 1.0)'},
    ],
  },
};

function actionProfile(id, root = false) {
  return {
    animationRole: root ? 'root' : 'static-part',
    pivot: {mode: root ? 'base' : 'center', localPosition: [0, 0, 0], axis: [0, 1, 0], confidence: 0.95},
    transformChannels: {
      translate: root,
      rotate: root,
      scale: root,
      bend: false,
      twist: false,
      detach: false,
      visibility: true,
      materialState: true,
    },
    sockets: [],
    collider: {type: root ? 'box' : 'none', offset: [0, 0, 0], scale: [1, 1, 1], isTrigger: false, notes: root ? 'compound statue proxy root' : 'visual-only child'},
    constraints: [],
    destruction: {breakable: false, fractureGroup: id, seamRefs: [], detachableFragments: [], breakImpulse: 0, debrisMaterial: 'stone-dark'},
  };
}

function attachment(parentId, start, end, radius = 0.08) {
  return {
    parentId,
    parentSocket: `${parentId}-surface`,
    localStart: start,
    localEnd: end,
    baseRadius: radius,
    endRadius: radius * 0.72,
    overlap: 0.035,
    contactType: 'overlap',
    gapTolerance: 0.015,
    evidenceRefs: ['front-full', 'right-full', 'back-full', 'left-full'],
  };
}

function component({
  id,
  name,
  level,
  role = 'static-part',
  primitive,
  topologyClass,
  topologyRationale,
  parent = null,
  material = 'stone-main',
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = [1, 1, 1],
  dimensions = [1, 1, 1],
  evidenceRefs = ['front-full'],
  localFeatures = [],
  geometryDescriptor = {},
  attachment: attachmentData = null,
  confidence = 0.9,
}) {
  return {
    id,
    name,
    level,
    role,
    importance: level === 'macro' ? 1 : level === 'meso' ? 0.85 : 0.65,
    confidence,
    primitive,
    topologyClass,
    topologyRationale,
    geometryDescriptor: {
      topologyIntent: topologyRationale,
      edgeTreatment: {type: topologyClass === 'assembled-solid' ? 'chamfer' : 'faceted', bevelRadius: topologyClass === 'assembled-solid' ? 0.025 : 0, segments: 1},
      deformationStack: [],
      uvStrategy: 'generated procedural coordinates',
      normalStrategy: 'flat normals with deliberate triangular planes',
      ...geometryDescriptor,
    },
    parent,
    attachment: attachmentData,
    dimensions: {width: dimensions[0], height: dimensions[1], depth: dimensions[2], units: 'statue-local', confidence},
    transform: {position, rotation, scale},
    actionProfile: actionProfile(id, parent === null),
    material,
    materialLayers: [material],
    colorMaterialRecipe: stoneRecipe,
    deformations: [],
    joints: [],
    seams: [],
    localFeatures,
    surfaceDetail: {
      macroRoughness: 0.74,
      microRoughness: 0.09,
      bumpAmplitude: 0.018,
      normalPattern: 'low-amplitude carved limestone grain',
      displacementPattern: 'triangulated geometry only where silhouette-visible',
      occlusionPattern: 'cavity-darkened seams and garment overlaps',
      edgeWearPattern: 'slightly lighter exposed planar ridges',
      notes: 'Do not smooth normals; planar shading is identity-defining.',
    },
    evidenceRefs,
    details: localFeatures.map((feature) => feature.id),
    fidelityTier: level === 'macro' ? 'blockout' : level === 'meso' ? 'structural-pass' : 'form-refinement',
  };
}

const profile = (points, depth) => ({profile2D: {points, depth}});
const feature = (id, type, notes) => ({
  id,
  type,
  placement: 'reference-measured',
  size: 'object-relative',
  orientation: 'reference-matched',
  materialEffect: 'cavity or ridge value separation',
  geometryEffect: type,
  confidence: 0.9,
  notes,
});

const components = [
  component({id: 'pedestal-base', name: 'Pedestal root and lower foot', level: 'macro', role: 'root', primitive: 'box', topologyClass: 'assembled-solid', topologyRationale: 'Architectural rectangular foot with hard stepped faces.', position: [0, 0.10, 0], scale: [1.48, 0.20, 1.10], dimensions: [1.48, 0.20, 1.10], evidenceRefs: ['front-pedestal', 'right-full'], localFeatures: [feature('stepped-beveled-levels', 'bevel', 'Hard single-segment chamfers catch the reference edge highlights.')]}),
  component({id: 'pedestal-shaft', name: 'Pedestal rectangular shaft', level: 'macro', primitive: 'box', topologyClass: 'assembled-solid', topologyRationale: 'Tall rigid architectural shaft.', parent: 'pedestal-base', position: [0, 0.57, 0], scale: [1.08, 0.82, 0.82], dimensions: [1.08, 0.82, 0.82], evidenceRefs: ['front-pedestal', 'right-full'], localFeatures: [feature('shaft-corner-planes', 'bevel', 'Narrow corner bevels preserve the stone monument profile.')]}),
  component({id: 'figure-skirt', name: 'Floor-length dress and skirt mass', level: 'macro', primitive: 'lathe', topologyClass: 'continuous-sculpt', topologyRationale: 'One continuous widening garment volume with faceted vertical folds.', parent: 'pedestal-base', position: [0, 1.80, 0], scale: [1, 1, 1], dimensions: [0.92, 1.62, 0.60], evidenceRefs: ['front-full', 'right-full', 'back-full', 'left-full'], geometryDescriptor: {latheProfile: {points: [[0.46, -0.81], [0.44, -0.68], [0.38, -0.25], [0.31, 0.35], [0.25, 0.81]], segments: 12}}, localFeatures: [feature('vertical-faceted-folds', 'ridge', 'Irregular triangular fold planes widen toward the hem.'), feature('hem-undulation', 'contour', 'Hem alternates shallow peaks above two visible shoes.')]}),
  component({id: 'coat-shell', name: 'Long fitted period coat', level: 'macro', primitive: 'ellipsoid', topologyClass: 'conforming-shell', topologyRationale: 'Fitted garment shell follows torso and hips before splitting into long tails.', parent: 'pedestal-base', position: [0, 2.63, 0], scale: [0.82, 1.42, 0.48], dimensions: [0.82, 1.42, 0.48], evidenceRefs: ['front-full', 'right-full', 'back-full'], localFeatures: [feature('front-split-shells', 'seam', 'Deep vertical split reveals skirt from waist to coat hem.'), feature('waist-cinch', 'ridge', 'Narrow waist transitions into flared tails.')]}),
  component({id: 'head-hair-group', name: 'Head and long hair silhouette', level: 'macro', primitive: 'ellipsoid', topologyClass: 'continuous-sculpt', topologyRationale: 'Connected head and crown mass establishes the portrait silhouette.', parent: 'pedestal-base', position: [0, 3.56, 0], scale: [0.48, 0.62, 0.42], dimensions: [0.48, 0.62, 0.42], evidenceRefs: ['front-head', 'right-head', 'back-head', 'left-head'], localFeatures: [feature('portrait-envelope', 'contour', 'Long narrow head and full crown remain centered above shoulders.')]}),

  component({id: 'pedestal-step-low', name: 'Lower pedestal step', level: 'meso', primitive: 'box', topologyClass: 'assembled-solid', topologyRationale: 'Discrete rigid step.', parent: 'pedestal-base', position: [0, 0.13, 0], scale: [1.34, 0.10, 0.98], dimensions: [1.34, 0.10, 0.98], evidenceRefs: ['front-pedestal']}),
  component({id: 'pedestal-cornice', name: 'Pedestal cornice', level: 'meso', primitive: 'box', topologyClass: 'assembled-solid', topologyRationale: 'Projecting rigid cornice above shaft.', parent: 'pedestal-base', position: [0, 1.01, 0], scale: [1.30, 0.13, 0.98], dimensions: [1.30, 0.13, 0.98], evidenceRefs: ['front-pedestal', 'right-full']}),
  component({id: 'pedestal-cap', name: 'Statue top cap slab', level: 'meso', primitive: 'box', topologyClass: 'assembled-solid', topologyRationale: 'Top slab beneath the figure.', parent: 'pedestal-base', position: [0, 1.12, 0], scale: [1.18, 0.09, 0.88], dimensions: [1.18, 0.09, 0.88], evidenceRefs: ['front-pedestal']}),
  component({id: 'plaque-frame', name: 'Recessed clipped-corner plaque frame', level: 'meso', primitive: 'extrude', topologyClass: 'surface-relief', topologyRationale: 'Raised ornamental frame on the pedestal front.', parent: 'pedestal-shaft', position: [0, 0, 0.423], rotation: [0, 0, 0], scale: [0.78, 0.42, 1], dimensions: [0.78, 0.42, 0.04], evidenceRefs: ['front-pedestal'], geometryDescriptor: profile([[-0.46,-0.30],[-0.37,-0.40],[0.37,-0.40],[0.46,-0.30],[0.46,0.30],[0.37,0.40],[-0.37,0.40],[-0.46,0.30]], 0.04), localFeatures: [feature('clipped-corner-recess', 'groove', 'Inset inner plaque creates a continuous dark border.')]}),
  component({id: 'plaque-inset', name: 'Plaque recessed center', level: 'meso', primitive: 'box', topologyClass: 'surface-relief', topologyRationale: 'Shallow inset plane behind frame.', parent: 'pedestal-shaft', material: 'stone-dark', position: [0, 0, 0.429], scale: [0.62, 0.30, 0.018], dimensions: [0.62, 0.30, 0.018], evidenceRefs: ['front-pedestal']}),
  component({id: 'torso', name: 'Fitted torso and waistcoat', level: 'meso', primitive: 'ellipsoid', topologyClass: 'continuous-sculpt', topologyRationale: 'Tapered human torso beneath the coat shell.', parent: 'pedestal-base', position: [0, 2.82, -0.01], scale: [0.57, 0.72, 0.35], dimensions: [0.57, 0.72, 0.35], evidenceRefs: ['front-torso', 'right-full']}),
  component({id: 'coat-tail-left', name: 'Left long coat panel', level: 'meso', primitive: 'extrude', topologyClass: 'conforming-shell', topologyRationale: 'Thin angular garment panel conforming over skirt.', parent: 'coat-shell', position: [-0.24, -0.49, 0.25], scale: [1, 1, 1], dimensions: [0.42, 1.22, 0.10], evidenceRefs: ['front-full', 'left-full'], geometryDescriptor: profile([[-0.20,-0.61],[0.18,-0.56],[0.15,0.60],[-0.13,0.56]], 0.09), localFeatures: [feature('tail-edge-plane-left', 'contour', 'Outer coat-panel edge flares gently toward hem.')]}),
  component({id: 'coat-tail-right', name: 'Right long coat panel', level: 'meso', primitive: 'extrude', topologyClass: 'conforming-shell', topologyRationale: 'Thin angular garment panel conforming over skirt.', parent: 'coat-shell', position: [0.24, -0.49, 0.25], scale: [1, 1, 1], dimensions: [0.42, 1.22, 0.10], evidenceRefs: ['front-full', 'right-full'], geometryDescriptor: profile([[-0.18,-0.56],[0.20,-0.61],[0.13,0.56],[-0.15,0.60]], 0.09), localFeatures: [feature('tail-edge-plane-right', 'contour', 'Outer coat-panel edge flares gently toward hem.')]}),
  component({id: 'neck', name: 'Neck', level: 'meso', role: 'static-part', primitive: 'ellipsoid', topologyClass: 'continuous-sculpt', topologyRationale: 'Short tapered anatomical connector.', parent: 'torso', position: [0, 0.41, 0], scale: [0.19, 0.24, 0.17], dimensions: [0.19, 0.24, 0.17], evidenceRefs: ['front-head', 'right-head']}),
  component({id: 'face', name: 'Angular mature face', level: 'meso', primitive: 'ellipsoid', topologyClass: 'continuous-sculpt', topologyRationale: 'Continuous tapered portrait volume with planar jaw and cheek deformation.', parent: 'head-hair-group', position: [0, 0, 0.18], scale: [0.34, 0.49, 0.27], dimensions: [0.34, 0.49, 0.27], evidenceRefs: ['front-head', 'right-head', 'left-head'], localFeatures: [feature('angular-landmark-planes', 'contour', 'Brow, cheek, tapered jaw and square chin use measured face landmarks.')]}),
  component({id: 'hair-back', name: 'Long back hair mantle', level: 'meso', primitive: 'ellipsoid', topologyClass: 'continuous-sculpt', topologyRationale: 'Large connected hair mantle visible from rear and profiles.', parent: 'head-hair-group', material: 'stone-dark', position: [0, -0.19, -0.13], scale: [0.53, 0.98, 0.30], dimensions: [0.53, 0.98, 0.30], evidenceRefs: ['back-head', 'right-head', 'left-head'], localFeatures: [feature('major-lock-ridges', 'ridge', 'Broad locks overlap and taper below shoulder blades.')]}),
  component({id: 'hair-left', name: 'Left front hair curtain', level: 'meso', role: 'static-part', primitive: 'tube', topologyClass: 'fiber-strand', topologyRationale: 'Broad elongated hair clump follows a curved path beside the face.', parent: 'head-hair-group', material: 'stone-dark', position: [0, 0, 0], dimensions: [0.14, 0.80, 0.12], evidenceRefs: ['front-head', 'left-head'], geometryDescriptor: {tubePath: {points: [[-0.10,0.25,0.05],[-0.24,0.04,0.10],[-0.30,-0.28,0.02],[-0.27,-0.56,-0.02]], radius: 0.10, radialSegments: 6, closed: false}}, attachment: attachment('head-hair-group', [-0.10,0.25,0.05], [-0.27,-0.56,-0.02], 0.11), localFeatures: [feature('left-hair-wave', 'ridge', 'Two direction changes create the broad faceted wave.')]}),
  component({id: 'hair-right', name: 'Right front hair curtain', level: 'meso', role: 'static-part', primitive: 'tube', topologyClass: 'fiber-strand', topologyRationale: 'Broad elongated hair clump follows a curved path beside the face.', parent: 'head-hair-group', material: 'stone-dark', position: [0, 0, 0], dimensions: [0.14, 0.80, 0.12], evidenceRefs: ['front-head', 'right-head'], geometryDescriptor: {tubePath: {points: [[0.10,0.25,0.05],[0.24,0.04,0.10],[0.30,-0.28,0.02],[0.27,-0.56,-0.02]], radius: 0.10, radialSegments: 6, closed: false}}, attachment: attachment('head-hair-group', [0.10,0.25,0.05], [0.27,-0.56,-0.02], 0.11), localFeatures: [feature('right-hair-wave', 'ridge', 'Two direction changes create the broad faceted wave.')]}),
  component({id: 'left-upper-arm', name: 'Left upper arm carrying book', level: 'meso', role: 'arm', primitive: 'capsule', topologyClass: 'continuous-sculpt', topologyRationale: 'Tapered anatomical limb segment inside coat sleeve.', parent: 'torso', position: [-0.39, 0.02, 0.02], rotation: [0, 0, -0.34], scale: [0.22, 0.56, 0.22], dimensions: [0.22, 0.56, 0.22], evidenceRefs: ['front-torso', 'left-full'], attachment: attachment('torso', [-0.31,0.25,0], [-0.50,-0.20,0.08], 0.12)}),
  component({id: 'left-forearm', name: 'Left forearm across book', level: 'meso', role: 'arm', primitive: 'capsule', topologyClass: 'continuous-sculpt', topologyRationale: 'Bent tapered sleeve segment crossing the torso.', parent: 'left-upper-arm', position: [0.04, -0.25, 0.20], rotation: [0, 0, 1.18], scale: [0.18, 0.50, 0.18], dimensions: [0.18, 0.50, 0.18], evidenceRefs: ['front-torso', 'right-full'], attachment: attachment('left-upper-arm', [0,-0.24,0], [0.29,-0.14,0.20], 0.10)}),
  component({id: 'right-upper-arm', name: 'Relaxed right upper arm', level: 'meso', role: 'arm', primitive: 'capsule', topologyClass: 'continuous-sculpt', topologyRationale: 'Tapered sleeve hanging close to coat.', parent: 'torso', position: [0.40, -0.02, 0], rotation: [0, 0, 0.08], scale: [0.22, 0.58, 0.22], dimensions: [0.22, 0.58, 0.22], evidenceRefs: ['front-full', 'right-full'], attachment: attachment('torso', [0.31,0.24,0], [0.43,-0.27,0], 0.12)}),
  component({id: 'right-forearm', name: 'Relaxed right forearm', level: 'meso', role: 'arm', primitive: 'capsule', topologyClass: 'continuous-sculpt', topologyRationale: 'Narrow sleeve continuing toward relaxed hand.', parent: 'right-upper-arm', position: [0.05, -0.40, 0.03], rotation: [0, 0, 0.03], scale: [0.17, 0.49, 0.17], dimensions: [0.17, 0.49, 0.17], evidenceRefs: ['front-full', 'right-full'], attachment: attachment('right-upper-arm', [0,-0.27,0], [0.03,-0.48,0.03], 0.09)}),
  component({id: 'book', name: 'Closed book against left chest', level: 'meso', primitive: 'box', topologyClass: 'assembled-solid', topologyRationale: 'Rigid rectangular book with visible depth and cover planes.', parent: 'torso', material: 'stone-dark', position: [-0.25, 0.02, 0.30], rotation: [0, 0, -0.18], scale: [0.40, 0.56, 0.12], dimensions: [0.40, 0.56, 0.12], evidenceRefs: ['front-torso', 'right-full'], localFeatures: [feature('cover-page-bevel', 'bevel', 'Thin lighter page block remains visible along top and outer edge.')]}),
  component({id: 'left-hand', name: 'Left hand gripping book', level: 'meso', primitive: 'ellipsoid', topologyClass: 'continuous-sculpt', topologyRationale: 'Simplified palm volume attached to bent forearm and book.', parent: 'left-forearm', material: 'stone-light', position: [0.17, 0.04, 0.14], rotation: [0, 0, -0.20], scale: [0.15, 0.21, 0.10], dimensions: [0.15, 0.21, 0.10], evidenceRefs: ['front-torso'], localFeatures: [feature('book-finger-capsules', 'ridge', 'Three shallow finger ridges wrap diagonally across cover.')]}),
  component({id: 'right-hand', name: 'Relaxed right hand', level: 'meso', primitive: 'ellipsoid', topologyClass: 'continuous-sculpt', topologyRationale: 'Simplified hanging palm with separated finger silhouette.', parent: 'right-forearm', material: 'stone-light', position: [0.03, -0.32, 0.02], scale: [0.13, 0.24, 0.10], dimensions: [0.13, 0.24, 0.10], evidenceRefs: ['front-full', 'right-full'], localFeatures: [feature('relaxed-finger-capsules', 'ridge', 'Four short narrow finger segments extend beneath palm.')]}),
  component({id: 'shoe-left', name: 'Left shoe at skirt hem', level: 'meso', primitive: 'ellipsoid', topologyClass: 'assembled-solid', topologyRationale: 'Small rigid shoe tip interrupting hem.', parent: 'figure-skirt', material: 'stone-dark', position: [-0.21, -0.74, 0.17], scale: [0.23, 0.09, 0.31], dimensions: [0.23, 0.09, 0.31], evidenceRefs: ['front-full']}),
  component({id: 'shoe-right', name: 'Right shoe at skirt hem', level: 'meso', primitive: 'ellipsoid', topologyClass: 'assembled-solid', topologyRationale: 'Small rigid shoe tip interrupting hem.', parent: 'figure-skirt', material: 'stone-dark', position: [0.21, -0.74, 0.17], scale: [0.23, 0.09, 0.31], dimensions: [0.23, 0.09, 0.31], evidenceRefs: ['front-full']}),

  component({id: 'lapel-left', name: 'Left pointed lapel', level: 'micro', primitive: 'extrude', topologyClass: 'conforming-shell', topologyRationale: 'Thin pointed garment panel over torso.', parent: 'coat-shell', material: 'stone-light', position: [-0.13, 0.27, 0.25], dimensions: [0.25, 0.52, 0.04], evidenceRefs: ['front-torso'], geometryDescriptor: profile([[-0.13,-0.25],[0.12,-0.10],[0.08,0.26],[-0.04,0.16]], 0.035), localFeatures: [feature('pointed-lapel-left', 'seam', 'Sharp lower point and raised outer edge.')]}),
  component({id: 'lapel-right', name: 'Right pointed lapel', level: 'micro', primitive: 'extrude', topologyClass: 'conforming-shell', topologyRationale: 'Thin pointed garment panel over torso.', parent: 'coat-shell', material: 'stone-light', position: [0.13, 0.27, 0.25], dimensions: [0.25, 0.52, 0.04], evidenceRefs: ['front-torso'], geometryDescriptor: profile([[-0.12,-0.10],[0.13,-0.25],[0.04,0.16],[-0.08,0.26]], 0.035), localFeatures: [feature('pointed-lapel-right', 'seam', 'Sharp lower point and raised outer edge.')]}),
  component({id: 'bow-left', name: 'Left bow loop', level: 'micro', primitive: 'ellipsoid', topologyClass: 'assembled-solid', topologyRationale: 'Small faceted bow loop.', parent: 'torso', material: 'stone-light', position: [-0.09, 0.35, 0.24], scale: [0.13, 0.08, 0.05], dimensions: [0.13, 0.08, 0.05], evidenceRefs: ['front-torso'], localFeatures: [feature('faceted-bow-left', 'ridge', 'Low-segment bow loop catches a planar highlight.')]}),
  component({id: 'bow-right', name: 'Right bow loop', level: 'micro', primitive: 'ellipsoid', topologyClass: 'assembled-solid', topologyRationale: 'Small faceted bow loop.', parent: 'torso', material: 'stone-light', position: [0.09, 0.35, 0.24], scale: [0.13, 0.08, 0.05], dimensions: [0.13, 0.08, 0.05], evidenceRefs: ['front-torso'], localFeatures: [feature('faceted-bow-right', 'ridge', 'Low-segment bow loop catches a planar highlight.')]}),
  component({id: 'bow-knot', name: 'Bow center knot', level: 'micro', primitive: 'ellipsoid', topologyClass: 'assembled-solid', topologyRationale: 'Small central knot.', parent: 'torso', material: 'stone-dark', position: [0, 0.35, 0.27], scale: [0.08, 0.08, 0.06], dimensions: [0.08, 0.08, 0.06], evidenceRefs: ['front-torso'], localFeatures: [feature('bow-center-knot', 'ridge', 'Central raised knot separates the two wings.')]}),
  component({id: 'nose', name: 'Nose bridge and tip', level: 'micro', primitive: 'extrude', topologyClass: 'surface-relief', topologyRationale: 'Angular relief projecting from the face plane.', parent: 'face', material: 'stone-light', position: [0, 0.01, 0.14], scale: [1, 1, 1], dimensions: [0.08, 0.16, 0.08], evidenceRefs: ['front-head', 'right-head'], geometryDescriptor: profile([[-0.035,-0.08],[0.035,-0.08],[0.028,0.08],[-0.020,0.08]], 0.075), localFeatures: [feature('nose-bridge-plane', 'ridge', 'Straight bridge terminates in a small angular tip.')]}),
  component({id: 'brow-left', name: 'Left brow plane', level: 'micro', primitive: 'box', topologyClass: 'surface-relief', topologyRationale: 'Thin raised brow plane.', parent: 'face', material: 'stone-dark', position: [-0.09, 0.09, 0.14], rotation: [0, 0, -0.08], scale: [0.13, 0.025, 0.025], dimensions: [0.13, 0.025, 0.025], evidenceRefs: ['front-head'], localFeatures: [feature('serious-brow-left', 'ridge', 'Slight inward downward angle supports mature expression.')]}),
  component({id: 'brow-right', name: 'Right brow plane', level: 'micro', primitive: 'box', topologyClass: 'surface-relief', topologyRationale: 'Thin raised brow plane.', parent: 'face', material: 'stone-dark', position: [0.09, 0.09, 0.14], rotation: [0, 0, 0.08], scale: [0.13, 0.025, 0.025], dimensions: [0.13, 0.025, 0.025], evidenceRefs: ['front-head'], localFeatures: [feature('serious-brow-right', 'ridge', 'Slight inward downward angle supports mature expression.')]}),
  component({id: 'mouth', name: 'Neutral mouth groove', level: 'micro', primitive: 'box', topologyClass: 'surface-relief', topologyRationale: 'Narrow recessed line across lower face.', parent: 'face', material: 'stone-dark', position: [0, -0.11, 0.145], scale: [0.13, 0.018, 0.018], dimensions: [0.13, 0.018, 0.018], evidenceRefs: ['front-head'], localFeatures: [feature('neutral-mouth-groove', 'groove', 'Straight restrained mouth line avoids a cartoon smile.')]}),
  component({id: 'hair-part', name: 'Center hair part groove', level: 'micro', primitive: 'box', topologyClass: 'surface-relief', topologyRationale: 'Narrow groove separating crown masses.', parent: 'head-hair-group', material: 'stone-dark', position: [0, 0.28, 0.13], rotation: [0.18, 0, 0], scale: [0.025, 0.26, 0.025], dimensions: [0.025, 0.26, 0.025], evidenceRefs: ['front-head'], localFeatures: [feature('center-part-groove', 'groove', 'Visible center part anchors the hairstyle.')]}),
  component({id: 'button-anchor', name: 'Waistcoat button system anchor', level: 'micro', primitive: 'instanced-cluster', topologyClass: 'surface-relief', topologyRationale: 'Repeated raised circular fasteners on waistcoat.', parent: 'torso', material: 'stone-dark', position: [0, 0.03, 0.30], scale: [0.055, 0.055, 0.025], dimensions: [0.055, 0.055, 0.025], evidenceRefs: ['front-torso'], geometryDescriptor: {baseGeometry: 'sphere'}, localFeatures: [feature('button-row', 'fastener', 'Four evenly spaced but individually lit raised buttons.')]}),
];

// The stage-3 factory represents dimensions through node scale. Nested scaled
// pivots would therefore distort every child. Resolve the authored local
// hierarchy into statue-space transforms before generation.
const componentById = new Map(components.map((item) => [item.id, item]));
function resolveWorldTransform(item, stack = new Set()) {
  if (!item.parent) return item.transform;
  if (stack.has(item.id)) throw new Error(`Component cycle at ${item.id}`);
  const parent = componentById.get(item.parent);
  if (!parent) return item.transform;
  stack.add(item.id);
  const parentTransform = resolveWorldTransform(parent, stack);
  stack.delete(item.id);
  return {
    position: item.transform.position.map((value, index) => value + parentTransform.position[index]),
    rotation: item.transform.rotation.map((value, index) => value + parentTransform.rotation[index]),
    scale: item.transform.scale,
  };
}
for (const item of components) {
  item.transform = resolveWorldTransform(item);
  item.parent = null;
  item.attachment = null;
}
const blockoutSilhouetteIds = new Set([
  'pedestal-step-low',
  'pedestal-cornice',
  'pedestal-cap',
  'torso',
  'coat-tail-left',
  'coat-tail-right',
  'hair-back',
  'hair-left',
  'hair-right',
  'left-upper-arm',
  'left-forearm',
  'right-upper-arm',
  'right-forearm',
  'book',
  'left-hand',
  'right-hand',
]);
for (const item of components) {
  if (blockoutSilhouetteIds.has(item.id)) item.fidelityTier = 'blockout';
}

const materialBase =
  starter.materials.find((item) => item.id === 'base') ??
  starter.materials[0];
function material(id, name, color, roughness) {
  return {
    ...structuredClone(materialBase),
    id,
    name,
    baseColor: color,
    color,
    albedo: {dominant: color, secondary: ['#8D7352', '#C6A97C'], samplingNotes: 'Sampled from the warm limestone reference; darker in cavities and lighter on exposed planes.'},
    colorVariation: {palette: [color, '#8D7352', '#C6A97C'], pattern: 'faceted-plane-and-cavity variation', amplitude: 0.10, heightCorrelation: 0.24},
    roughness: {base: roughness, variation: 0.08, map: `independent-${id}-roughness-field`, localResponse: 'higher in recessed seams, slightly lower on exposed ridges'},
    ambientOcclusion: {cavityStrength: 0.34, contactShadowBias: 0.38, notes: 'Independent cavity response at garment overlaps, hair locks and pedestal steps.'},
    wear: {edgeWear: 0.06, scratches: [], chips: []},
    dirt: {amount: 0.06, cavityBias: 0.82, color: '#5A4935'},
    localOverrides: [
      {id: 'cavity-and-plane-variation', region: 'recesses and downward-facing planes', baseColorShift: -0.08, roughness: roughness + 0.05, evidenceRef: 'front-full'},
      {id: 'edge-lightening', region: 'exposed polygon ridges', baseColorShift: 0.06, roughness: roughness - 0.04, evidenceRef: 'front-full'},
    ],
    notes: 'Warm non-metallic carved limestone; planar geometry carries most of the low-poly appearance.',
  };
}

const macroIds = components.filter((item) => item.level === 'macro').map((item) => item.id);
const blockoutIds = components
  .filter((item) => item.level === 'macro' || blockoutSilhouetteIds.has(item.id))
  .map((item) => item.id);
const mesoIds = components.filter((item) => item.level === 'meso').map((item) => item.id);
const microIds = components.filter((item) => item.level === 'micro').map((item) => item.id);
const allIds = components.map((item) => item.id);
const detailLinkMap = {
  'hair-center-part': 'center-part-groove',
  'hair-lock-system': 'major-lock-ridges',
  'angular-face-planes': 'angular-landmark-planes',
  'bow-tie': 'faceted-bow-left',
  'pointed-lapels': 'pointed-lapel-left',
  'waistcoat-buttons': 'button-row',
  'book-layered-pages': 'cover-page-bevel',
  'hand-finger-clusters': 'book-finger-capsules',
  'coat-front-split': 'front-split-shells',
  'skirt-faceted-folds': 'vertical-faceted-folds',
  'pedestal-step-stack': 'stepped-beveled-levels',
  'pedestal-recessed-plaque': 'clipped-corner-recess',
  'stone-tonal-variation': 'cavity-and-plane-variation',
};
const linkedDetailInventory = structuredClone(detail.detailInventory);
linkedDetailInventory.details = linkedDetailInventory.details.map((item) => ({
  ...item,
  mapsTo: {...item.mapsTo, ref: detailLinkMap[item.id] ?? item.mapsTo?.ref},
}));

const spec = {
  ...starter,
  schemaVersion: '2.1',
  targetName: 'Roxana Statue',
  targetId: 'roxana-statue',
  sourceImage: evidence.front,
  suitability: 'conditional',
  preSpecAssessment: {
    ...assessment.preSpecAssessment,
    unknownsToResolveBeforeImplementation: [],
    detailInventory: linkedDetailInventory,
    anatomy: {applies: true, ...anatomy.anatomy},
  },
  qualityContract: assessment.qualityContract,
  qualityTargets: {
    targetFidelity: 0.82,
    mustMatch: ['6.3-head silhouette', 'angular mature face', 'long center-parted hair', 'book arm pose', 'period coat and skirt', 'stepped plaque pedestal'],
    niceToHave: ['subtle stone grain', 'individual finger separation'],
    reviewViewpoints: ['front', 'right-profile', 'back', 'three-quarter'],
  },
  featureReviewTargets: [
    {id: 'anatomy-proportion', name: '6.3-head anatomy and pose', tier: 'critical', passIds: ['blockout', 'structural-pass'], minimumScore: 0.76, mustPass: true, componentRefs: ['figure-skirt', 'torso', 'head-hair-group', 'left-upper-arm', 'right-upper-arm'], evidenceRefs: ['front-full']},
    {id: 'face-hair-identity', name: 'Angular mature face and long center-parted hair', tier: 'critical', passIds: ['form-refinement'], minimumScore: 0.72, mustPass: true, componentRefs: ['face', 'hair-back', 'hair-left', 'hair-right', 'hair-part'], evidenceRefs: ['front-head', 'back-head']},
    {id: 'outfit-book', name: 'Period outfit and supported book', tier: 'critical', passIds: ['structural-pass', 'form-refinement'], minimumScore: 0.75, mustPass: true, componentRefs: ['coat-shell', 'coat-tail-left', 'coat-tail-right', 'lapel-left', 'lapel-right', 'book', 'left-hand'], evidenceRefs: ['front-torso', 'right-full']},
    {id: 'pedestal-architecture', name: 'Stepped plaque pedestal', tier: 'critical', passIds: ['blockout', 'structural-pass'], minimumScore: 0.78, mustPass: true, componentRefs: ['pedestal-base', 'pedestal-shaft', 'pedestal-cornice', 'pedestal-cap', 'plaque-frame'], evidenceRefs: ['front-pedestal']},
    {id: 'faceted-stone', name: 'Faceted carved-stone response', tier: 'important', passIds: ['material-pass', 'lighting-pass'], minimumScore: 0.72, mustPass: false, componentRefs: allIds, evidenceRefs: ['front-full']},
  ],
  silhouette: {
    front: 'Tall narrow figure over a pedestal; shoulders 1.65 HU, coat flares below waist, skirt widens to floor, hair frames face and descends behind shoulders.',
    side: 'Shallow S-profile with nose, chest-held book, coat and hair projecting modestly from the vertical axis.',
    back: 'Hair mantle centered over fitted coat waist; two coat tails divide above skirt.',
    negativeSpaces: ['left elbow-to-waist wedge', 'book-to-forearm seam', 'coat front split', 'right wrist-to-coat gap'],
  },
  referenceCamera: {projection: 'orthographic-like', view: 'front', azimuth: 0, elevation: 0, distance: 6, framing: 'full object including pedestal'},
  viewEvidence: [
    {id: 'front-full', view: 'front', sourceImage: evidence.front, imageRegion: {x: 0, y: 0, width: 1, height: 1, units: 'normalized'}, observations: ['6.3-head figure', 'book arm', 'period coat', 'pedestal'], confidence: 0.96},
    {id: 'right-full', view: 'right-profile', sourceImage: evidence.right, imageRegion: {x: 0, y: 0, width: 1, height: 1, units: 'normalized'}, observations: ['book depth', 'nose profile', 'hair projection'], confidence: 0.94},
    {id: 'back-full', view: 'back', sourceImage: evidence.back, imageRegion: {x: 0, y: 0, width: 1, height: 1, units: 'normalized'}, observations: ['hair mantle', 'coat back split', 'pedestal depth'], confidence: 0.95},
    {id: 'left-full', view: 'left-profile', sourceImage: evidence.left, imageRegion: {x: 0, y: 0, width: 1, height: 1, units: 'normalized'}, observations: ['relaxed arm profile', 'hair projection'], confidence: 0.94},
    {id: 'front-head', view: 'front-close', sourceImage: evidence.front, imageRegion: {x: 0.20, y: 0.05, width: 0.60, height: 0.22, units: 'normalized'}, observations: ['face landmarks', 'center part', 'bow'], confidence: 0.84},
    {id: 'right-head', view: 'right-head', sourceImage: evidence.right, imageRegion: {x: 0.20, y: 0.05, width: 0.60, height: 0.25, units: 'normalized'}, observations: ['nose and jaw profile', 'hair depth'], confidence: 0.85},
    {id: 'back-head', view: 'back-head', sourceImage: evidence.back, imageRegion: {x: 0.17, y: 0.05, width: 0.66, height: 0.30, units: 'normalized'}, observations: ['long layered locks'], confidence: 0.94},
    {id: 'left-head', view: 'left-head', sourceImage: evidence.left, imageRegion: {x: 0.20, y: 0.05, width: 0.60, height: 0.25, units: 'normalized'}, observations: ['opposite profile and hair'], confidence: 0.85},
    {id: 'front-torso', view: 'front-torso', sourceImage: evidence.front, imageRegion: {x: 0.12, y: 0.20, width: 0.76, height: 0.33, units: 'normalized'}, observations: ['lapels', 'bow', 'buttons', 'book and bent arm'], confidence: 0.94},
    {id: 'front-pedestal', view: 'front-pedestal', sourceImage: evidence.front, imageRegion: {x: 0.04, y: 0.74, width: 0.92, height: 0.25, units: 'normalized'}, observations: ['step stack', 'shaft and clipped-corner plaque'], confidence: 0.98},
  ],
  componentTree: components,
  materials: [
    material('stone-main', 'Warm limestone main', '#9E825D', 0.78),
    material('stone-light', 'Warm limestone exposed planes', '#C0A476', 0.72),
    material('stone-dark', 'Warm limestone cavities', '#6F5A40', 0.84),
  ],
  repetitionSystems: [
    {id: 'waistcoat-buttons', componentRef: 'button-anchor', count: 4, distribution: {type: 'linear', axis: [0, 1, 0], spacing: 0.105, jitter: 0}, variation: {scale: 0.03, rotation: 0}, evidenceRefs: ['front-torso']},
    {id: 'major-hair-locks', componentRefs: ['hair-left', 'hair-right', 'hair-back'], count: 10, distribution: {type: 'curated-mirrored-clumps', spacing: 0.08, jitter: 0.025}, variation: {scale: 0.12, rotation: 0.16}, evidenceRefs: ['front-head', 'back-head']},
    {id: 'skirt-fold-planes', componentRef: 'figure-skirt', count: 12, distribution: {type: 'radial-irregular', spacing: 0.52, jitter: 0.08}, variation: {scale: 0.07, rotation: 0.04}, evidenceRefs: ['front-full']},
  ],
  buildPasses: [
    {id: 'blockout', goal: 'Lock total height, 6.3-head figure ratio, pedestal share and primary silhouette.', componentRefs: blockoutIds, acceptance: ['Front silhouette reads as Roxana rather than a generic mannequin.', 'Pedestal is approximately 27 percent of total height.']},
    {id: 'structural-pass', goal: 'Establish garment panels, pedestal levels, limb chains, hair mantle and supported book.', componentRefs: mesoIds, acceptance: ['No floating joints or book intersections.', 'Right and back views retain coherent depth.']},
    {id: 'form-refinement', goal: 'Add face landmarks, lapels, bow, buttons, hand grouping, hair part and faceted planes.', componentRefs: microIds, acceptance: ['Identity-defining details remain visible at Hall close-up.']},
    {id: 'material-pass', goal: 'Apply three-value warm limestone family with independent roughness and cavity response.', componentRefs: allIds, acceptance: ['No metallic, plastic or smooth-clay response.']},
    {id: 'lighting-pass', goal: 'Use Hall key/fill/rim light to explain low-poly planes.', componentRefs: allIds, acceptance: ['Face, coat folds and pedestal relief remain readable.']},
    {id: 'interaction-pass', goal: 'Expose stable root, named nodes, collider and focus socket.', componentRefs: allIds, acceptance: ['Runtime metadata exposes statue components without editor-only dependencies.']},
    {id: 'optimization-pass', goal: 'Keep the hero prop below 30k triangles and reduce distant detail with LOD.', componentRefs: allIds, acceptance: ['No visible silhouette loss in Hall view.']},
  ],
  lightingFromPhoto: [
    {id: 'key', type: 'directional', direction: [-0.7, 1.0, 0.8], color: '#FFE0B3', intensity: 2.1, role: 'warm upper-left key explaining facial and coat planes'},
    {id: 'fill', type: 'hemisphere', direction: [0.8, 0.4, -0.4], color: '#A8C5FF', intensity: 0.65, role: 'cool low-contrast fill preserving profile information'},
    {id: 'rim', type: 'directional', direction: [0.2, 0.7, -1.0], color: '#FFF0CF', intensity: 1.0, role: 'subtle hair and shoulder separation'},
    {id: 'render-intent', exposure: 1.05, toneMapping: 'ACESFilmic', contactShadow: 'soft ground shadow plus ambient occlusion beneath garment overlaps and pedestal steps'},
  ],
  lookDevTargets: {
    ...starter.lookDevTargets,
    qualityPriority: 'stylized-reference-fidelity',
  },
  proceduralStrategy: [
    'Low-segment lathe, extruded garment panels, tapered limb segments, tube hair clumps and custom faceted BufferGeometry refinements.',
    'Three-value warm limestone MeshStandardMaterial family with flat shading and procedural vertex-color plane variation.',
    'Front, right-profile, back and three-quarter browser captures compared against the four supplied views.',
  ],
  lodPlan: [
    {id: 'lod0', maxDistance: 9, targetTriangles: 24000, use: 'Hall close-up'},
    {id: 'lod1', maxDistance: 24, targetTriangles: 9000, use: 'room view'},
    {id: 'lod2', maxDistance: 80, targetTriangles: 2800, use: 'school overview'},
  ],
  performanceBudget: {maxTriangles: 30000, maxDrawCalls: 42, maxMaterials: 3, maxTextureMemoryMB: 8, targetFpsMobile: 45, targetFpsDesktop: 60},
  assumptions: ['Low-poly stylization is accepted.', 'The statue remains static.', 'Exact portrait likeness is not claimed.', 'Four-view concept art is internally consistent enough for procedural reconstruction.'],
  risks: [
    {id: 'face-fidelity', severity: 'high', mitigation: 'Use measured landmarks and evaluate a dedicated front close-up; stop before claiming portrait likeness.'},
    {id: 'hair-helmet', severity: 'high', mitigation: 'Separate crown, back mantle and curved side clumps; inspect rear view.'},
    {id: 'primitive-stack', severity: 'high', mitigation: 'Replace smooth generated primitives with low-segment faceted custom geometry during form refinement.'},
  ],
};

fs.mkdirSync(path.dirname(outputPath), {recursive: true});
fs.writeFileSync(outputPath, `${JSON.stringify(spec, null, 2)}\n`);
