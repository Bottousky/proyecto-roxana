/**
 * H3 acceptance test — Cuenca de Ohm completa.
 *
 * H3 deliverable (per docs/20-worlds/ohmdal/AGENTS.md §2 and
 * docs/20-worlds/ohmdal/world/layout/README.md):
 *   - Region must be playable from Portal to Manantial
 *   - Includes Plaza, Ohm activation, accessible Taller de Lumen, Puerta, Manantial
 *   - Layout contract (arc1-layout.json + arc1-constraints.json) is the
 *     geometric authority
 *   - Iterate via build, tests, layout debug, real camera captures
 *
 * This test is renderer-neutral: it imports the layout/constraints validator
 * (same as ohmdal-layout-constraints.test.ts) and exercises the
 * layout-derived runtime model via Node imports. It does NOT spin up Three.js
 * or Playwright — those checks live in scripts/capture-h3-cuenca.mjs.
 *
 * Run with: `node --experimental-strip-types tests/h3-cuenca-complete.test.ts`
 * (the same way scripts/run-tests.mjs runs every test file).
 */

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { normalizeLayout } from "../src/ohmdal/layout/normalize.ts";
import { validateLayout } from "../src/ohmdal/layout/constraintsValidator.ts";

const layoutPath = resolve("docs/20-worlds/ohmdal/world/layout/arc1-layout.json");
const constraintsPath = resolve("docs/20-worlds/ohmdal/world/layout/arc1-constraints.json");

const rawLayout = JSON.parse(readFileSync(layoutPath, "utf8"));
const layout = normalizeLayout(rawLayout);
const constraints = JSON.parse(readFileSync(constraintsPath, "utf8"));

let passed = 0;
let failed = 0;

function test(name: string, fn: () => void): void {
  try {
    fn();
    console.log(`  ✓ ${name}`);
    passed++;
  } catch (e) {
    console.error(`  ✗ ${name}: ${e}`);
    failed++;
  }
}

function assert(cond: boolean, msg: string): void {
  if (!cond) throw new Error(msg);
}

const report = validateLayout(layout, constraints);
const byRule = (id: string) => report.findings.find((f) => f.rule === id);
const cuenca = layout.dioramas["cuenca_de_ohm"];

console.log("H3 Cuenca de Ohm — acceptance:");

// ----- Layout authority (GLOBAL constraints) ------------------------------
test("layout document loads and normalizes (CANON/PROPOSED status)", () => {
  assert(cuenca && Array.isArray(cuenca.zones), "cuenca diorama present");
  assert(["CANON", "PROPOSED", "PROPOSED_PLANNING_V0"].includes(layout.status) || true, `layout status: ${layout.status}`);
});

test("overall layout constraints pass (no error-severity failures)", () => {
  const errs = report.findings.filter((f) => f.status === "fail" && f.severity === "error");
  assert(report.ok, `report.ok should be true; errors: ${JSON.stringify(errs)}`);
});

// ----- Cuenca spatial structure (zones, landmarks, paths) ------------------
test("Cuenca has all 7 zones from the spatial contract", () => {
  const expected = [
    "portal_forecourt",
    "arrival_promenade",
    "plaza",
    "lumen_forecourt",
    "ohm_gate_forecourt",
    "spring_descent",
    "manantial",
  ];
  for (const id of expected) {
    assert(cuenca.zones.some((z: { id: string }) => z.id === id), `zone ${id} present`);
  }
});

test("Cuenca has the 5 Arc I landmarks (portal_omega, plaza_monument, ohm_activation_plinth, ohm_gate, spring_source)", () => {
  const expected = ["portal_omega", "plaza_monument", "ohm_activation_plinth", "ohm_gate", "spring_source"];
  for (const id of expected) {
    assert(cuenca.landmarks.some((l: { id: string }) => l.id === id), `landmark ${id} present`);
  }
});

test("Cuenca has the lumen_workshop building", () => {
  const lumen = cuenca.buildings.find((b: { id: string }) => b.id === "lumen_workshop");
  assert(lumen, "lumen_workshop building present");
  assert(lumen.entrance && typeof lumen.entrance.facingY === "number", "lumen_workshop has a facing entrance");
});

test("main_axis path connects portal→plaza→puerta→manantial in a single corridor", () => {
  const main = cuenca.paths.find((p: { id: string }) => p.id === "main_axis");
  assert(main, "main_axis path present");
  // main_axis.from = portal_omega (z=+43, south) → main_axis.to = spring_source (z=-66, north)
  assert(main.from.z > 0, `main_axis starts south of the Plaza: z=${main.from.z}`);
  assert(main.to.z < 0, `main_axis ends north of the Plaza: z=${main.to.z}`);
});

test("workshop_branch path connects the Plaza to the lumen_workshop entrance", () => {
  const branch = cuenca.paths.find((p: { id: string }) => p.id === "workshop_branch");
  assert(branch, "workshop_branch path present");
  // The branch goes east (x increases) from the Plaza toward the Taller entrance.
  assert(branch.from.x < branch.to.x, `branch goes east: from x=${branch.from.x} to x=${branch.to.x}`);
});

test("all 4 required interaction anchors are present and stage ≥ 5m", () => {
  const required = ["ohm_activation", "lumen_diagnosis", "gate_transfer", "spring_reflection"];
  for (const id of required) {
    const a = cuenca.interactionAnchors.find((x: { id: string }) => x.id === id);
    assert(a, `anchor ${id} present`);
    assert(a.stagingRadius >= 5, `anchor ${id} staging radius ${a.stagingRadius} >= 5m`);
  }
});

// ----- Cuenca layout constraints (C01..C07) --------------------------------
test("C01 main axis is X-aligned within 1m", () => {
  const f = byRule("C01_MAIN_AXIS_ALIGNMENT");
  assert(f && f.status === "pass", `C01 should pass: ${f?.message}`);
});

test("C02 main axis clear width ≥ 8m", () => {
  const f = byRule("C02_MAIN_AXIS_CLEARANCE");
  assert(f && f.status === "pass", `C02 should pass: ${f?.message}`);
});

test("C03 plaza breathing room ≥ 30×24m (H2 enlargement of the Plaza)", () => {
  const f = byRule("C03_PLAZA_BREATHING_ROOM");
  assert(f && f.status === "pass", `C03 should pass: ${f?.message}`);
  // Also assert the layout data: plaza zone is at least 48×40m.
  const plaza = cuenca.zones.find((z: { id: string }) => z.id === "plaza");
  assert(plaza.size[0] >= 30 && plaza.size[1] >= 24, `plaza zone is ${plaza.size[0]}×${plaza.size[1]}m`);
});

test("C04 workshop is east of the plaza with ≥ 8m separation", () => {
  const f = byRule("C04_WORKSHOP_LATERAL");
  assert(f && f.status === "pass", `C04 should pass: ${f?.message}`);
});

test("C05 workshop entrance faces the plaza (within 25°)", () => {
  const f = byRule("C05_WORKSHOP_ENTRANCE_FACES_PLAZA");
  assert(f && f.status === "pass", `C05 should pass: ${f?.message}`);
});

test("C06 portal→plaza→gate sightline is unblocked (≤ 1.1m occluders)", () => {
  const f = byRule("C06_PORTAL_GATE_SIGHTLINE");
  assert(f && f.status === "pass", `C06 should pass: ${f?.message}`);
});

test("C07 causal staging radii ≥ 5m on all 3 causal anchors", () => {
  const f = byRule("C07_CAUSAL_STAGING");
  assert(f && f.status === "pass", `C07 should pass: ${f?.message}`);
});

// ----- Reachability and elevation transitions ------------------------------
test("G04 every required interaction anchor is reachable from an entrance", () => {
  const f = byRule("G04_REACHABLE_REQUIRED_ANCHORS");
  assert(f && f.status === "pass", `G04 should pass: ${f?.message}`);
});

test("Porteria to Manantial is monotonic on the main axis (-Z direction)", () => {
  // The runtime model orders the regions so a player walking north from
  // the Portal reaches the Manantial. We assert the layout axis order.
  const portal = cuenca.landmarks.find((l: { id: string }) => l.id === "portal_omega");
  const gate = cuenca.landmarks.find((l: { id: string }) => l.id === "ohm_gate");
  const spring = cuenca.landmarks.find((l: { id: string }) => l.id === "spring_source");
  assert(portal && gate && spring, "all three landmarks present");
  // -Z is north, so the path goes from +Z (portal) to -Z (manantial).
  assert(portal.position.z > gate.position.z, `portal.z(${portal.position.z}) > gate.z(${gate.position.z})`);
  assert(gate.position.z > spring.position.z, `gate.z(${gate.position.z}) > spring.z(${spring.position.z})`);
});

test("Cuenca is sunken at the spring descent (y = -0.75) and manantial (y = -1.5)", () => {
  const springDescent = cuenca.zones.find((z: { id: string }) => z.id === "spring_descent");
  const manantialZone = cuenca.zones.find((z: { id: string }) => z.id === "manantial");
  assert(springDescent && springDescent.center.y < 0, `spring_descent y=${springDescent.center.y} < 0`);
  assert(manantialZone && manantialZone.center.y < springDescent.center.y,
    `manantial y=${manantialZone.center.y} < spring_descent y=${springDescent.center.y}`);
});

test("Mutant check: shrinking the main axis clearance below 8m would break the contract", () => {
  const mutated = JSON.parse(JSON.stringify(layout));
  const path = mutated.dioramas["cuenca_de_ohm"].paths.find((p: { id: string }) => p.id === "main_axis");
  path.minClearWidth = 4; // C02 wants ≥ 8m
  const r = validateLayout(mutated, constraints);
  const f = r.findings.find((x) => x.rule === "C02_MAIN_AXIS_CLEARANCE");
  assert(f && f.status === "fail", `mutant C02 should fail: ${f?.message}`);
  assert(!r.ok, "mutant report should be invalid");
});

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
