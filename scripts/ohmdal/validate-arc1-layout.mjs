// scripts/ohmdal/validate-arc1-layout.mjs
//
// Validate arc1-layout.json against arc1-constraints.json.
//
// Usage:
//   node scripts/ohmdal/validate-arc1-layout.mjs
//   node scripts/ohmdal/validate-arc1-layout.mjs --quiet
//
// Exit code 0 = valid (no error-severity failures), 1 = invalid.
// The constraints are the declarative review contract; a `warning` failure
// does not block but is reported.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..", "..");

const quiet = process.argv.includes("--quiet");

const layoutPath = path.join(repoRoot, "docs", "20-worlds", "ohmdal", "world", "layout", "arc1-layout.json");
const constraintsPath = path.join(repoRoot, "docs", "20-worlds", "ohmdal", "world", "layout", "arc1-constraints.json");

const { normalizeLayout } = await import("../../src/ohmdal/layout/normalize.ts");
const { validateLayout, printReport } = await import("../../src/ohmdal/layout/constraintsValidator.ts");

const layout = normalizeLayout(JSON.parse(fs.readFileSync(layoutPath, "utf8")));
const constraints = JSON.parse(fs.readFileSync(constraintsPath, "utf8"));

const report = validateLayout(layout, constraints);

if (!quiet) {
  console.log(`Layout:  ${path.relative(repoRoot, layoutPath)}`);
  console.log(`Rules:   ${path.relative(repoRoot, constraintsPath)}\n`);
  printReport(report);
}

process.exit(report.ok ? 0 : 1);
