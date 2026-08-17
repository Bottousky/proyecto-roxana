// Pure normalization for layout JSON documents.
//
// The layout document stores positions/centers as arrays `[x, y, z]`. This
// module converts them into `{x,y,z}` objects. It is renderer-neutral and
// JSON-import-free, so it runs both in the browser runtime and under
// `node --experimental-strip-types` (CLI + tests).

export interface Vec3Like {
  x: number;
  y: number;
  z: number;
}

/** Convert a `[x, y, z]` array (or already-object) to `{x,y,z}`. */
export function toVec(v: unknown): Vec3Like {
  if (v && typeof v === "object" && "x" in v) return v as Vec3Like;
  const a = v as [number, number, number];
  return { x: a[0], y: a[1], z: a[2] };
}

/** In-place normalization of a parsed layout JSON structure. */
export function normalizeLayout<T>(raw: T): T {
  const rec = raw as Record<string, unknown>;

  const walkDiorama = (diorama: Record<string, unknown>) => {
    const bounds = diorama["bounds"] as Record<string, unknown>;
    if (bounds) bounds["center"] = toVec(bounds["center"]);

    for (const z of (diorama["zones"] ?? []) as Record<string, unknown>[]) {
      z["center"] = toVec(z["center"]);
    }
    for (const l of (diorama["landmarks"] ?? []) as Record<string, unknown>[]) {
      l["position"] = toVec(l["position"]);
    }
    for (const b of (diorama["buildings"] ?? []) as Record<string, unknown>[]) {
      b["center"] = toVec(b["center"]);
      const entrance = b["entrance"] as Record<string, unknown> | undefined;
      if (entrance) entrance["position"] = toVec(entrance["position"]);
    }
    for (const p of (diorama["paths"] ?? []) as Record<string, unknown>[]) {
      p["from"] = toVec(p["from"]);
      p["to"] = toVec(p["to"]);
    }
    for (const a of (diorama["interactionAnchors"] ?? []) as Record<string, unknown>[]) {
      a["position"] = toVec(a["position"]);
    }
    for (const e of [...((diorama["entrances"] ?? []) as Record<string, unknown>[]), ...((diorama["exits"] ?? []) as Record<string, unknown>[])]) {
      e["position"] = toVec(e["position"]);
    }
    for (const s of (diorama["protectedSightlines"] ?? []) as Record<string, unknown>[]) {
      s["from"] = toVec(s["from"]);
      if (s["through"]) s["through"] = toVec(s["through"]);
      s["to"] = toVec(s["to"]);
    }
    for (const n of (diorama["reservedNegativeSpace"] ?? []) as Record<string, unknown>[]) {
      n["center"] = toVec(n["center"]);
    }
  };

  const dioramas = rec["dioramas"] as Record<string, Record<string, unknown>>;
  if (dioramas) {
    for (const key of Object.keys(dioramas)) walkDiorama(dioramas[key]);
  }
  const overworld = rec["overworld"] as Record<string, unknown>;
  const macro = overworld?.["macroterritories"] as Record<string, unknown>[] | undefined;
  if (macro) {
    for (const t of macro) t["position"] = toVec(t["position"]);
  }
  return raw;
}
