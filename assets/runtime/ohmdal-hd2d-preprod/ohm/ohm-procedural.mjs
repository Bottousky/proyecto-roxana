const VALID_STATES = new Set([
  'idle',
  'locomotion',
  'sensor_deployed',
  'measurement_valid',
  'measurement_blocked',
  'uncertain',
]);

/**
 * Prototipo original. Recibe el namespace THREE del runtime para no crear otro loader.
 * El collider es contractual y permanece separado de la geometría visible.
 */
export function createOhmProcedural(THREE) {
  if (!THREE?.Group || !THREE?.Mesh || !THREE?.MeshStandardMaterial) {
    throw new TypeError('createOhmProcedural requiere el namespace THREE del runtime');
  }

  const root = new THREE.Group();
  root.name = 'ohm_root';
  root.userData.frontAxis = '+Z';
  root.userData.collider = { type: 'capsule', radius: 0.32, height: 1.03 };

  const material = new THREE.MeshStandardMaterial({ color: 0x4b5261, roughness: 0.72, metalness: 0.24 });
  const ownedGeometries = [];
  const makeMesh = (name, geometry, position) => {
    ownedGeometries.push(geometry);
    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = name;
    mesh.position.set(...position);
    return mesh;
  };

  const base = makeMesh('base', new THREE.CylinderGeometry(0.34, 0.38, 0.16, 8, 1), [0, 0.08, 0]);
  const chassis = makeMesh('chassis', new THREE.BoxGeometry(0.58, 0.46, 0.42), [0, 0.39, 0]);
  const visor = makeMesh('visor', new THREE.BoxGeometry(0.3, 0.13, 0.05), [0, 0.46, 0.235]);
  const hatch = makeMesh('hatch_top', new THREE.BoxGeometry(0.32, 0.08, 0.28), [0, 0.66, 0]);
  const sensor = makeMesh('sensor_mount', new THREE.BoxGeometry(0.12, 0.18, 0.12), [0, 0.78, 0.08]);

  const armLeftPivot = new THREE.Group();
  armLeftPivot.name = 'arm_left';
  armLeftPivot.position.set(-0.34, 0.49, 0);
  const armRightPivot = new THREE.Group();
  armRightPivot.name = 'arm_right';
  armRightPivot.position.set(0.34, 0.49, 0);
  armLeftPivot.add(makeMesh('arm_left_sensor', new THREE.BoxGeometry(0.1, 0.34, 0.1), [0, -0.15, 0]));
  armRightPivot.add(makeMesh('arm_right_sensor', new THREE.BoxGeometry(0.1, 0.34, 0.1), [0, -0.15, 0]));

  const emitter = new THREE.Object3D();
  emitter.name = 'emitter_front';
  emitter.position.set(0, 0.38, 0.27);
  root.add(base, chassis, visor, hatch, sensor, armLeftPivot, armRightPivot, emitter);

  const sockets = Object.freeze({
    sensor_mount: sensor,
    arm_left: armLeftPivot,
    arm_right: armRightPivot,
    hatch_top: hatch,
    emitter_front: emitter,
  });

  function setState(state, reducedMotion = false) {
    if (!VALID_STATES.has(state)) throw new RangeError(`Estado de Ohm desconocido: ${state}`);
    const deploy = state === 'sensor_deployed' || state === 'measurement_valid' || state === 'measurement_blocked';
    const angle = deploy ? Math.PI * 0.32 : 0;
    armLeftPivot.rotation.z = angle;
    armRightPivot.rotation.z = -angle;
    sensor.position.y = deploy ? 0.86 : 0.78;
    visor.scale.set(state === 'uncertain' ? 0.72 : 1, state === 'measurement_blocked' ? 0.45 : 1, 1);
    root.position.y = state === 'locomotion' && !reducedMotion ? 0.015 : 0;
    root.userData.state = state;
    root.userData.accessibleLabel = `Ohm: ${state.replaceAll('_', ' ')}`;
  }

  function dispose() {
    root.remove(...root.children);
    ownedGeometries.forEach((geometry) => geometry.dispose());
    material.dispose();
  }

  setState('idle');
  return { root, sockets, setState, dispose };
}
