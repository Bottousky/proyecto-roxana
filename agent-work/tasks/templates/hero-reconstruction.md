# HERO RECONSTRUCTION — task template

**Asset:** `<name>`  
**World:** `<world>`  
**Reference pack:** `<path/to/hero-reference.json>`  
**Target runtime:** `<runtime>`

## Objective

Reconstruct the approved hero reference with the smallest justified authoring
pipeline. Do not redesign the asset unless the reference pack mode explicitly
allows it.

## Preflight

1. Read the local `AGENTS.md` files.
2. Read `docs/3d/HERO_REFERENCE_GATE.md`.
3. Run:

```bash
npm run 3d:validate-hero-ref -- <path/to/hero-reference.json>
```

If the gate fails, STOP. Do not model the final asset.

## Reference fidelity

Treat the pack's `primaryReference` as visual authority. Preserve every
`mustPreserve` item. Decisions are allowed only inside `mayResolve`; never add a
`forbidden` feature.

Before authoring, summarize in <=10 lines:

- canonical silhouette;
- dimensions/scale;
- palette/material family;
- semantic/moving parts;
- exact freedom left to the agent.

## Authoring route

Choose the cheapest route that preserves fidelity:

- mechanical/architectural/simple stylized geometry → Blender deterministic;
- organic/sculptural/high manual cost → Meshy candidate, then Blender;
- Tripo only as A/B/fallback with explicit reason;
- img2threejs only if structured authoring demonstrably helps.

Do not use text-to-3D as design authority for `reconstruct` mode.

## Candidate gate

Produce a reproducible preview (front, 3/4, side; back if relevant). Compare to
the reference in this order:

1. silhouette;
2. proportions;
3. landmark features;
4. palette/materiality;
5. functional parts.

Fix large-shape errors before microdetail.

## Canonicalization

Blender owns:

- meters / Y-up / front axis;
- ground/pivot;
- hierarchy and moving pivots;
- materials;
- cleanup/retopo when justified;
- GLB export.

Then run GLB inspection/validation/calibration and record budget impact.

## Runtime gate

Integrate only after candidate fidelity passes. Capture in the real gameplay
camera and compare with the Visual Harness. Do not self-approve from a Blender
preview alone.

## Deliverable

```text
HERO: PASS / PARTIAL / FAIL
Reference pack:
Mode:
Primary reference:
Authoring route:
Provider/tasks/credits:
Build script/master:
Canonical GLB:
Tris / meshes / materials / textures:
Scale / bounds / pivot:
Reference comparison:
Runtime screenshots:
Validation:
Remaining fidelity gaps:
```
