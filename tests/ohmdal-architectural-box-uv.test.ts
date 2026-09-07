import assert from 'node:assert/strict';
import {
  ARCHITECTURAL_BOX_UV_METRES,
  architecturalBoxUvForVertex,
  isArchitecturalStoneName,
} from '../src/experiences/ohmdal-playcanvas/world/arc1/architecturalBoxUv.ts';

function close(actual: number, expected: number, message: string): void {
  assert.ok(Math.abs(actual - expected) < 1e-9, `${message}: ${actual} !== ${expected}`);
}

const tile = ARCHITECTURAL_BOX_UV_METRES;
const dimensions = [4, 2, 1] as const;
for (const name of ['LighthouseShoreFloor', 'LighthousePath', 'LighthouseWallNorth', 'CastleWalkway']) {
  assert.ok(isArchitecturalStoneName(name), `${name} must receive metric stone UVs`);
}
for (const name of ['LighthousePanelFace', 'CastleFloorLight', 'ForgeWaterChannel', 'CastleReturnPlinth']) {
  assert.ok(!isArchitecturalStoneName(name), `${name} must retain its own visual/state mapping`);
}

// On an X-facing wall, U follows depth and V follows height.  The spans must
// track metres rather than the unit BoxGeometry's 0..1 primitive UV range.
const xFaceBottom = architecturalBoxUvForVertex([-0.5, -0.5, -0.5], [1, 0, 0], dimensions);
const xFaceTop = architecturalBoxUvForVertex([-0.5, 0.5, -0.5], [1, 0, 0], dimensions);
const xFaceFar = architecturalBoxUvForVertex([-0.5, -0.5, 0.5], [1, 0, 0], dimensions);
close(Math.abs(xFaceTop[1] - xFaceBottom[1]), dimensions[1] * tile, 'X face height density');
close(Math.abs(xFaceFar[0] - xFaceBottom[0]), dimensions[2] * tile, 'X face depth density');

// A horizontal Y-facing slab uses X/Z, so a 4m by 1m top repeats four times
// as often along X as along Z at the same metre-based scale.
const topNear = architecturalBoxUvForVertex([-0.5, 0.5, -0.5], [0, 1, 0], dimensions);
const topFarX = architecturalBoxUvForVertex([0.5, 0.5, -0.5], [0, 1, 0], dimensions);
const topFarZ = architecturalBoxUvForVertex([-0.5, 0.5, 0.5], [0, 1, 0], dimensions);
close(Math.abs(topFarX[0] - topNear[0]), dimensions[0] * tile, 'Y face width density');
close(Math.abs(topFarZ[1] - topNear[1]), dimensions[2] * tile, 'Y face depth density');

// Dominant-axis selection is stable for the opposite side of the box too.
const negativeZFace = architecturalBoxUvForVertex([0.5, 0.5, -0.5], [0, 0, -1], dimensions);
close(negativeZFace[0], dimensions[0] * 0.5 * tile, 'negative Z face U projection');
close(negativeZFace[1], dimensions[1] * 0.5 * tile, 'negative Z face V projection');

console.log('ohmdal architectural box UV tests: PASS');
