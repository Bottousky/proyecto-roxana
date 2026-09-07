import * as pc from 'playcanvas';

export type Arc1CommunityActorId = 'councillor' | 'yesca' | 'vega' | 'nereo';

export interface Arc1CommunityActor {
  /** Stable semantic root. A future authored character is attached here. */
  root: pc.Entity;
  /** Sober project-owned fallback, safe to hide when an authored visual loads. */
  fallback: pc.Entity;
  /** Role prop and head are exposed for a small readable gesture layer. */
  head: pc.Entity;
  roleProp: pc.Entity;
  /** Zone-local anchor, useful to position an authored replacement in-place. */
  localPosition: pc.Vec3;
}

export interface Arc1CommunityActors {
  actors: Record<Arc1CommunityActorId, Arc1CommunityActor>;
  roots: Record<Arc1CommunityActorId, pc.Entity>;
  /** World-space anchors after the roots are attached to their zone parents. */
  positions: Record<Arc1CommunityActorId, pc.Vec3>;
}

export interface Arc1CommunityActorsMaterials {
  stone: pc.StandardMaterial;
  stoneDark: pc.StandardMaterial;
  copper: pc.StandardMaterial;
  brass: pc.StandardMaterial;
  glow: pc.StandardMaterial;
}

export interface BuildArc1CommunityActorsOptions {
  castleRoot: pc.Entity;
  forgeTerracesRoot: pc.Entity;
  lighthouseRoot: pc.Entity;
  materials: Arc1CommunityActorsMaterials;
}

type ActorSpec = {
  id: Arc1CommunityActorId;
  name: string;
  parent: pc.Entity;
  localPosition: [number, number, number];
  bodyMaterial: pc.StandardMaterial;
  propMaterial: pc.StandardMaterial;
  propShape: 'clipboard' | 'rod' | 'marker' | 'lantern';
};

/**
 * Builds semantic C1/C4 community actors without making a new hero asset a
 * runtime dependency. Each fallback is a child of a stable NPC root so the
 * later GLB loader can replace only that child and keep dialogue/navigation
 * references intact.
 */
export function buildArc1CommunityActors({
  castleRoot,
  forgeTerracesRoot,
  lighthouseRoot,
  materials,
}: BuildArc1CommunityActorsOptions): Arc1CommunityActors {
  const { stone, stoneDark, copper, brass, glow } = materials;

  const addPrimitive = (
    parent: pc.Entity,
    name: string,
    type: 'box' | 'cylinder' | 'sphere',
    material: pc.StandardMaterial,
    position: [number, number, number],
    scale: [number, number, number],
    euler: [number, number, number] = [0, 0, 0],
  ): pc.Entity => {
    const entity = new pc.Entity(name);
    entity.addComponent('render', { type, material });
    entity.setLocalPosition(...position);
    entity.setLocalScale(...scale);
    entity.setLocalEulerAngles(...euler);
    if (entity.render) {
      entity.render.castShadows = false;
      entity.render.receiveShadows = true;
    }
    parent.addChild(entity);
    return entity;
  };

  const addRoleProp = (
    fallback: pc.Entity,
    name: string,
    shape: ActorSpec['propShape'],
    material: pc.StandardMaterial,
  ): pc.Entity => {
    switch (shape) {
      case 'clipboard':
        return addPrimitive(fallback, name, 'box', material, [0.48, 1.05, 0.26], [0.32, 0.5, 0.08], [12, 0, -18]);
      case 'rod':
        return addPrimitive(fallback, name, 'cylinder', material, [0.48, 1.05, 0.16], [0.09, 0.6, 0.09], [0, 0, -18]);
      case 'marker':
        return addPrimitive(fallback, name, 'box', material, [0.42, 1.03, 0.22], [0.12, 0.58, 0.12], [0, 0, -12]);
      case 'lantern':
        return addPrimitive(fallback, name, 'cylinder', material, [0.45, 1.08, 0.18], [0.18, 0.34, 0.18]);
    }
  };

  const buildActor = (spec: ActorSpec): Arc1CommunityActor => {
    const root = new pc.Entity(`Arc1CommunityActor_${spec.name}`);
    root.setLocalPosition(...spec.localPosition);
    spec.parent.addChild(root);

    const fallback = new pc.Entity(`${root.name}_FallbackVisual`);
    root.addChild(fallback);
    const body = addPrimitive(fallback, `${root.name}_FallbackBody`, 'cylinder', spec.bodyMaterial, [0, 0.82, 0], [0.43, 1.02, 0.43]);
    body.render!.castShadows = true;
    const head = addPrimitive(fallback, `${root.name}_FallbackHead`, 'sphere', stone, [0, 1.62, 0], [0.31, 0.34, 0.31]);
    const shoulder = addPrimitive(fallback, `${root.name}_FallbackShoulder`, 'box', stoneDark, [0, 1.12, 0], [0.78, 0.18, 0.5]);
    shoulder.render!.castShadows = true;
    // Keep the role prop on the semantic root so an authored character can
    // replace the fallback visual without hiding the readable record/tool.
    const roleProp = addRoleProp(root, `${root.name}_RoleProp_${spec.propShape}`, spec.propShape, spec.propMaterial);
    const roleMarker = addPrimitive(fallback, `${root.name}_RoleMarker`, 'sphere', glow, [-0.45, 1.18, 0], [0.09, 0.09, 0.09]);
    roleMarker.enabled = false;

    return {
      root,
      fallback,
      head,
      roleProp,
      localPosition: new pc.Vec3(...spec.localPosition),
    };
  };

  // Anchors stay clear of the central panels, rails, service loads and the
  // north/south route. They are zone-local so authored zone roots can move
  // without invalidating the semantic positions.
  const specs: ActorSpec[] = [
    {
      id: 'councillor',
      name: 'Consejera',
      parent: castleRoot,
      localPosition: [6.5, 0, -10.0],
      bodyMaterial: stone,
      propMaterial: brass,
      propShape: 'clipboard',
    },
    {
      id: 'yesca',
      name: 'Yesca',
      parent: forgeTerracesRoot,
      localPosition: [-7.6, 0, -7.0],
      bodyMaterial: copper,
      propMaterial: brass,
      propShape: 'rod',
    },
    {
      id: 'vega',
      name: 'Vega',
      parent: forgeTerracesRoot,
      localPosition: [7.4, 0, 18.0],
      bodyMaterial: stoneDark,
      propMaterial: copper,
      propShape: 'marker',
    },
    {
      id: 'nereo',
      name: 'Nereo',
      parent: lighthouseRoot,
      localPosition: [7.4, 0, -7.0],
      bodyMaterial: brass,
      propMaterial: glow,
      propShape: 'lantern',
    },
  ];

  const actors = Object.fromEntries(specs.map((spec) => [spec.id, buildActor(spec)])) as Record<Arc1CommunityActorId, Arc1CommunityActor>;
  const roots = Object.fromEntries(specs.map((spec) => [spec.id, actors[spec.id].root])) as Record<Arc1CommunityActorId, pc.Entity>;
  const positions = Object.fromEntries(specs.map((spec) => [spec.id, actors[spec.id].root.getPosition().clone()])) as Record<Arc1CommunityActorId, pc.Vec3>;
  return { actors, roots, positions };
}
