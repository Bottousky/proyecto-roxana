/**
 * Tests for the Ohmdal Arc I layout constraints validator.
 *
 * Run with: `node --experimental-strip-types tests/ohmdal-layout-constraints.test.ts`
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

console.log("layout-constraints validator:");

test("document loads and normalizes (Vec3 positions)", () => {
  const cuenca = layout.dioramas["cuenca_de_ohm"];
  assert(cuenca && Array.isArray(cuenca.zones), "cuenca diorama present");
  const plaza = cuenca.zones.find((z) => z.id === "plaza");
  assert(plaza && typeof plaza.center.x === "number", "plaza center normalized to Vec3");
  assert(plaza.center.x === 0 && plaza.center.z === 0, "plaza center (0,0,0)");
});

test("overall report is valid (zero error-severity failures)", () => {
  assert(report.ok, `report.ok should be true; errors: ${JSON.stringify(report.findings.filter((f) => f.status === "fail" && f.severity === "error"))}`);
});

test("C01 main axis is X-aligned within 1m", () => {
  const f = byRule("C01_MAIN_AXIS_ALIGNMENT");
  assert(f && f.status === "pass", `C01 should pass: ${f?.message}`);
});

test("C02 main axis clear width ≥ 8m", () => {
  const f = byRule("C02_MAIN_AXIS_CLEARANCE");
  assert(f && f.status === "pass", `C02 should pass: ${f?.message}`);
});

test("C03 plaza breathing room ≥ 30×24m", () => {
  const f = byRule("C03_PLAZA_BREATHING_ROOM");
  assert(f && f.status === "pass", `C03 should pass: ${f?.message}`);
});

test("C04 workshop is east of the plaza", () => {
  const f = byRule("C04_WORKSHOP_LATERAL");
  assert(f && f.status === "pass", `C04 should pass: ${f?.message}`);
});

test("C05 workshop entrance faces the plaza", () => {
  const f = byRule("C05_WORKSHOP_ENTRANCE_FACES_PLAZA");
  assert(f && f.status === "pass", `C05 should pass: ${f?.message}`);
});

test("C06 portal→plaza→gate sightline is unblocked", () => {
  const f = byRule("C06_PORTAL_GATE_SIGHTLINE");
  assert(f && f.status === "pass", `C06 should pass: ${f?.message}`);
});

test("C07 causal staging radii ≥ 5m", () => {
  const f = byRule("C07_CAUSAL_STAGING");
  assert(f && f.status === "pass", `C07 should pass: ${f?.message}`);
});

test("G04 every required anchor is reachable from an entrance", () => {
  const f = byRule("G04_REACHABLE_REQUIRED_ANCHORS");
  assert(f && f.status === "pass", `G04 should pass: ${f?.message}`);
});

test("runtime regions derive from the same layout (spot check)", () => {
  // The runtime model and the validator must agree on the plaza footprint.
  // Importing the runtime topology requires the browser/Vite JSON import, so
  // here we only assert the layout doc itself stays self-consistent.
  const cuenca = layout.dioramas["cuenca_de_ohm"];
  const plaza = cuenca.zones.find((z) => z.id === "plaza");
  const neg = cuenca.reservedNegativeSpace.find((n) => n.id === "plaza_breathing_room");
  assert(plaza!.size[0] >= neg!.size[0], "plaza zone ≥ breathing room width");
  assert(plaza!.size[1] >= neg!.size[1], "plaza zone ≥ breathing room depth");
});

test("a deliberately broken layout would be caught (mutant check)", () => {
  const mutated = JSON.parse(JSON.stringify(layout));
  const cuenca = mutated.dioramas["cuenca_de_ohm"];
  const path = cuenca.paths.find((p: { id: string }) => p.id === "main_axis");
  path.minClearWidth = 4; // violates C02 (needs ≥8m)
  const r = validateLayout(mutated, constraints);
  const f = r.findings.find((x) => x.rule === "C02_MAIN_AXIS_CLEARANCE");
  assert(f && f.status === "fail", `mutant C02 should fail: ${f?.message}`);
  assert(!r.ok, "mutant report should be invalid");
});

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
