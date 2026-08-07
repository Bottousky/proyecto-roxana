// Hybrid physics architecture para Physica.
//
// Regla de oro (decisión del Director 2026-08-07):
//   "Deterministic analytic physics are authoritative for pedagogical phenomena
//    and altered laws of Physica. Use Havok for general game-world physics where
//    appropriate: collisions, rigid bodies, contacts, pushable props, stacking,
//    friction, environmental objects, debris, constraints and secondary physical
//    interactions. Never let Havok and an analytic model integrate the same degree
//    of freedom of the same object simultaneously. For hybrid objects, explicitly
//    decide which system owns each physical property."
//
// Distribución de autoridad:
//
//  ── AUTHORITATIVE ANALYTIC (src/experiences/physica/models/)
//      • cascadaAscendente.ts   → agua que sube (a = +GRAVEDAD)
//      • caidaLibre.ts / tiroParabolico.ts → piedras que caen (a = -GRAVEDAD)
//      • equilibrio.ts          → INSTRUMENTO suspendido (suma vectorial nula)
//      • vector.ts              → composición de corrientes (saquitos, Escena 5)
//      • referenciaMovil.ts     → plataformas a la deriva (Escena 4)
//      • planoInclinado.ts      → roca que sube por rampa (Escena 6)
//
//  ── HAVOK (este módulo) — colisiones, contactos, rigid bodies pasivos
//      • Avatar ↔ plataformas (reemplaza el AABB manual de avatar.ts)
//      • Piedras ↔ suelo (cuando la trayectoria analítica confirma el aterrizaje)
//      • Losas (colliders pasivos para soporte de física)
//      • Rocas grandes del plano inclinado (rigid body con fricción)
//      • Anillos y elementos decorativos pesados (rigid body estático)
//
// Cualquier objeto que tenga un modelo analítico (agua, piedras en vuelo,
// INSTRUMENTO en equilibrio, drift platforms, saquitos con corriente) NO es
// propiedad de Havok. Cuando la trayectoria analítica termina (piedra toca
// el suelo analíticamente), Havok toma el control de su posición de reposo
// para que no atraviese la malla del piso.

import * as BABYLON from 'babylonjs';
import HavokPhysics from '@babylonjs/havok';

export interface PhysicaPhysicsHandle {
  havokPlugin: BABYLON.HavokPlugin;
  scene: BABYLON.Scene;
  fixedTimeStep: number;
  dispose: () => void;
  staticBox: (
    mesh: BABYLON.AbstractMesh,
    width: number,
    height: number,
    depth: number,
    friction?: number,
  ) => BABYLON.PhysicsBody;
  dynamicBox: (
    mesh: BABYLON.AbstractMesh,
    width: number,
    height: number,
    depth: number,
    mass: number,
    friction?: number,
  ) => BABYLON.PhysicsBody;
  kinematicBox: (
    mesh: BABYLON.AbstractMesh,
    width: number,
    height: number,
    depth: number,
  ) => BABYLON.PhysicsBody;
}

export async function createPhysicaPhysics(
  scene: BABYLON.Scene,
): Promise<PhysicaPhysicsHandle | null> {
  if (typeof window === 'undefined') return null;

  const candidates = [
    new URL('./HavokPhysics.wasm', document.baseURI || '/').href,
    new URL('./HavokPhysics.wasm', import.meta.url).href,
    './HavokPhysics.wasm',
    '/HavokPhysics.wasm',
  ];

  let havokInstance: Awaited<ReturnType<typeof HavokPhysics>> | null = null;
  let lastError: unknown = null;
  for (const url of candidates) {
    try {
      havokInstance = await HavokPhysics({ locateFile: () => url });
      if (havokInstance) break;
    } catch (e) {
      lastError = e;
    }
  }

  if (!havokInstance) {
    console.warn(
      '[Physica/Havok] No se pudo cargar HavokPhysics.wasm. ' +
        'Cayendo a modo analítico puro (sin colisiones Havok). ' +
        'Causa:',
      lastError,
    );
    return null;
  }

  const havokPlugin = new BABYLON.HavokPlugin(true, havokInstance);
  scene.enablePhysics(new BABYLON.Vector3(0, -9.81, 0), havokPlugin);

  const FIXED_DT = 1 / 60;
  const allBodies: BABYLON.PhysicsBody[] = [];
  scene.onBeforeRenderObservable.add(() => {
    if ((scene as unknown as { physicsEnabled: boolean }).physicsEnabled) {
      havokPlugin.executeStep(FIXED_DT, allBodies);
    }
  });

  function buildShape(
    w: number,
    h: number,
    d: number,
    sceneRef: BABYLON.Scene,
    friction: number,
    restitution: number,
  ): BABYLON.PhysicsShape {
    const shape = new BABYLON.PhysicsShapeBox(
      new BABYLON.Vector3(0, 0, 0),
      new BABYLON.Quaternion(0, 0, 0, 1),
      new BABYLON.Vector3(w, h, d),
      sceneRef,
    );
    shape.material = { friction, restitution };
    return shape;
  }

  function staticBox(
    mesh: BABYLON.AbstractMesh,
    w: number,
    h: number,
    d: number,
    friction = 0.7,
  ): BABYLON.PhysicsBody {
    const body = new BABYLON.PhysicsBody(
      mesh,
      BABYLON.PhysicsMotionType.STATIC,
      false,
      scene,
    );
    body.shape = buildShape(w, h, d, scene, friction, 0);
    allBodies.push(body);
    return body;
  }

  function dynamicBox(
    mesh: BABYLON.AbstractMesh,
    w: number,
    h: number,
    d: number,
    mass: number,
    friction = 0.6,
  ): BABYLON.PhysicsBody {
    const body = new BABYLON.PhysicsBody(
      mesh,
      BABYLON.PhysicsMotionType.DYNAMIC,
      false,
      scene,
    );
    body.shape = buildShape(w, h, d, scene, friction, 0.1);
    body.setMassProperties({ mass });
    allBodies.push(body);
    return body;
  }

  function kinematicBox(
    mesh: BABYLON.AbstractMesh,
    w: number,
    h: number,
    d: number,
  ): BABYLON.PhysicsBody {
    const body = new BABYLON.PhysicsBody(
      mesh,
      BABYLON.PhysicsMotionType.ANIMATED,
      false,
      scene,
    );
    body.shape = buildShape(w, h, d, scene, 0, 0);
    body.setLinearDamping(0);
    body.setAngularDamping(0);
    allBodies.push(body);
    return body;
  }

  return {
    havokPlugin,
    scene,
    fixedTimeStep: FIXED_DT,
    staticBox,
    dynamicBox,
    kinematicBox,
    dispose() {
      try {
        scene.disablePhysicsEngine();
      } catch {
        /* ignore */
      }
    },
  };
}
