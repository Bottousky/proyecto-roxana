import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  OHMDAL_SPAWN_ANCHORS,
  deriveYawFromAnchor,
  getForwardVectorFromYaw,
  dotProduct,
  normalizeVector,
} from '../src/experiences/ohmdal-playcanvas/navigationAnchors.ts';
import { CollisionRegistry } from '../src/experiences/ohmdal-playcanvas/collisionRegistry.ts';

describe('Ohmdal Navigation and Collision Contract', () => {
  describe('1. Spawn Anchors & Door-Facing Contract', () => {
    it('defines all canonical spawn anchors across Arco I zones', () => {
      const expectedAnchors = [
        'portal-initial',
        'plaza-to-workshop',
        'workshop-to-plaza',
        'plaza-to-manantial',
        'manantial-to-plaza',
        'plaza-to-castle',
        'castle-to-plaza',
        'castle-to-forge',
        'forge-to-castle',
        'forge-to-lighthouse',
        'lighthouse-to-forge',
      ];

      for (const anchorId of expectedAnchors) {
        assert.ok(OHMDAL_SPAWN_ANCHORS[anchorId], `Anchor ${anchorId} must exist`);
        const anchor = OHMDAL_SPAWN_ANCHORS[anchorId];
        assert.equal(anchor.position.length, 3);
        assert.ok(anchor.zone);
        assert.ok(anchor.lookAt || anchor.directionIntoZone);
      }
    });

    it('asserts that every spawn anchor has camera forward facing into its destination (dot >= 0.7)', () => {
      for (const [anchorId, anchor] of Object.entries(OHMDAL_SPAWN_ANCHORS)) {
        const derivedYaw = deriveYawFromAnchor(anchor);
        const forward = getForwardVectorFromYaw(derivedYaw);

        let targetDir: [number, number, number];
        if (anchor.directionIntoZone) {
          targetDir = normalizeVector(anchor.directionIntoZone);
        } else if (anchor.lookAt) {
          const dx = anchor.lookAt[0] - anchor.position[0];
          const dy = anchor.lookAt[1] - anchor.position[1];
          const dz = anchor.lookAt[2] - anchor.position[2];
          targetDir = normalizeVector([dx, dy, dz]);
        } else {
          targetDir = [0, 0, -1];
        }

        const alignment = dotProduct(forward, targetDir);
        assert.ok(
          alignment >= 0.7,
          `Anchor ${anchorId} forward alignment (${alignment.toFixed(3)}) must be >= 0.70`,
        );
      }
    });

    it('ensures initial portal arrival faces South into the Plaza towards Ohm (yaw = 180)', () => {
      const portalAnchor = OHMDAL_SPAWN_ANCHORS['portal-initial'];
      assert.ok(portalAnchor);
      assert.deepEqual(portalAnchor.position, [0, 1.68, -8.0]);
      assert.deepEqual(portalAnchor.directionIntoZone, [0, 0, 1]);

      const yaw = deriveYawFromAnchor(portalAnchor);
      assert.ok(Math.abs(yaw - 180) < 0.1, `Expected yaw ~180, got ${yaw}`);

      const [fx, , fz] = getForwardVectorFromYaw(yaw);
      assert.ok(Math.abs(fx) < 0.05, `Expected fx ~0, got ${fx}`);
      assert.ok(Math.abs(fz - 1.0) < 0.05, `Expected fz ~1.0 (+Z South), got ${fz}`);
    });

    it('ensures workshop exit faces East into the Plaza (yaw = 270)', () => {
      const exitAnchor = OHMDAL_SPAWN_ANCHORS['workshop-to-plaza'];
      assert.ok(exitAnchor);
      assert.deepEqual(exitAnchor.position, [-7.0, 1.68, -4.0]);
      assert.deepEqual(exitAnchor.directionIntoZone, [1, 0, 0]);

      const yaw = deriveYawFromAnchor(exitAnchor);
      assert.ok(Math.abs(yaw - 270) < 0.1, `Expected yaw ~270, got ${yaw}`);

      const [fx, , fz] = getForwardVectorFromYaw(yaw);
      assert.ok(Math.abs(fx - 1.0) < 0.05, `Expected fx ~1.0 (+X East), got ${fx}`);
      assert.ok(Math.abs(fz) < 0.05, `Expected fz ~0, got ${fz}`);
    });

    it('ensures castle entrance faces along hall into distribution space (yaw = 180)', () => {
      const castleAnchor = OHMDAL_SPAWN_ANCHORS['plaza-to-castle'];
      assert.ok(castleAnchor);
      assert.deepEqual(castleAnchor.position, [60, 1.68, -8.0]);
      assert.deepEqual(castleAnchor.directionIntoZone, [0, 0, 1]);

      const yaw = deriveYawFromAnchor(castleAnchor);
      assert.ok(Math.abs(yaw - 180) < 0.1, `Expected yaw ~180, got ${yaw}`);

      const [fx, , fz] = getForwardVectorFromYaw(yaw);
      assert.ok(Math.abs(fx) < 0.05, `Expected fx ~0, got ${fx}`);
      assert.ok(Math.abs(fz - 1.0) < 0.05, `Expected fz ~1.0 (+Z Hall), got ${fz}`);
    });
  });

  describe('2. Collision Registry & Zone Isolation Contract', () => {
    function createPopulatedRegistry(): CollisionRegistry {
      const reg = new CollisionRegistry();
      // Plaza (7)
      reg.addSolidAABB('plaza', 0, -11.0, 5.8, 1.8, 'PortalArch');
      reg.addSolidAABB('plaza', 0, -2.0, 2.2, 2.2, 'OhmPedestal');
      reg.addSolidAABB('plaza', -10.5, -4.0, 6.2, 7.6, 'WorkshopExterior');
      reg.addSolidAABB('plaza', -14.0, 0, 1.0, 24.0, 'PlazaBoundaryWest');
      reg.addSolidAABB('plaza', 14.0, 0, 1.0, 24.0, 'PlazaBoundaryEast');
      reg.addSolidAABB('plaza', 0, -13.0, 28.0, 1.0, 'PlazaBoundarySouth');
      reg.addSolidAABB('plaza', 0, 11.5, 7.8, 2.4, 'OmegaGate');

      // Workshop (4)
      reg.addSolidAABB('workshop', -60, 0.8, 4.6, 2.0, 'MasterWorkbench');
      reg.addSolidAABB('workshop', -60, 5.0, 12.0, 0.6, 'WorkshopWallNorth');
      reg.addSolidAABB('workshop', -66.0, 0, 0.6, 10.0, 'WorkshopWallWest');
      reg.addSolidAABB('workshop', -54.0, 0, 0.6, 10.0, 'WorkshopWallEast');

      // Manantial (3)
      reg.addSolidAABB('manantial', 0, 24.0, 9.2, 6.2, 'GeneratorPlatform');
      reg.addSolidAABB('manantial', -7.2, 25.0, 1.0, 15.0, 'CanyonWallWest');
      reg.addSolidAABB('manantial', 7.2, 25.0, 1.0, 15.0, 'CanyonWallEast');

      // Castle (4)
      reg.addSolidAABB('castle', 46, 0, 0.5, 30, 'CastleWallWest');
      reg.addSolidAABB('castle', 74, 0, 0.5, 30, 'CastleWallEast');
      reg.addSolidAABB('castle', 60, -15, 28, 0.5, 'CastleWallSouth');
      reg.addSolidAABB('castle', 60, 15, 28, 0.5, 'CastleWallNorth');

      // Forge (2)
      reg.addSolidAABB('forge-terraces', 106, 4, 0.5, 48, 'ForgeWallWest');
      reg.addSolidAABB('forge-terraces', 134, 4, 0.5, 48, 'ForgeWallEast');

      // Lighthouse (2)
      reg.addSolidAABB('lighthouse', 166, 0, 0.5, 30, 'LighthouseWallWest');
      reg.addSolidAABB('lighthouse', 194, 0, 0.5, 30, 'LighthouseWallEast');

      return reg;
    }

    it('guarantees no spawn anchor spawns inside any solid collider', () => {
      const reg = createPopulatedRegistry();

      for (const [anchorId, anchor] of Object.entries(OHMDAL_SPAWN_ANCHORS)) {
        const [x, , z] = anchor.position;
        const blocked = reg.isBlocked(x, z, [anchor.zone], 0.4);
        assert.equal(
          blocked,
          false,
          `Spawn anchor '${anchorId}' at (${x}, ${z}) must not spawn inside colliders of zone '${anchor.zone}'`,
        );
      }
    });

    it('isolates colliders by active zone: inactive zone geometry does not block player', () => {
      const reg = createPopulatedRegistry();

      // At x=46, z=0 (Castle West Wall), blocked when castle is active
      assert.equal(reg.isBlocked(46, 0, ['castle'], 0.4), true);

      // But NOT blocked if active zone is only 'plaza'
      assert.equal(reg.isBlocked(46, 0, ['plaza'], 0.4), false);
    });

    it('correctly handles Omega Gate closed vs open states', () => {
      const reg = createPopulatedRegistry();
      const gateX = 0;
      const gateZ = 11.5;

      // Gate closed: gateOpenPredicate returns false
      const closedCheck = reg.isBlocked(gateX, gateZ, ['plaza'], 0.4, () => false);
      assert.equal(closedCheck, true);

      // Gate open: gateOpenPredicate returns true
      const openCheck = reg.isBlocked(gateX, gateZ, ['plaza'], 0.4, (x, z) => {
        return z > 10.0 && z < 13.0 && Math.abs(x) < 2.0;
      });
      assert.equal(openCheck, false);
    });

    it('provides accurate collision diagnostics', () => {
      const reg = createPopulatedRegistry();
      const diag = reg.getDiagnostics(['plaza', 'workshop']);

      assert.deepEqual(diag.activeZones, ['plaza', 'workshop']);
      assert.equal(diag.activeSolidsCount, 11);
      assert.equal(diag.totalColliders, 22);
      assert.equal(diag.collidersByZone.plaza, 7);
      assert.equal(diag.collidersByZone.workshop, 4);
      assert.equal(diag.collidersByZone.castle, 4);
    });
  });

  describe('3. Wall-Challenge Simulation', () => {
    it('simulates player walking against solid boundaries across all zones without penetration', () => {
      const reg = new CollisionRegistry();
      // Setup perimeter box centered at (0, 0) with walls at +/- 10
      reg.addSolidAABB('plaza', -10, 0, 1.0, 20.0, 'WestWall');
      reg.addSolidAABB('plaza', 10, 0, 1.0, 20.0, 'EastWall');
      reg.addSolidAABB('plaza', 0, -10, 20.0, 1.0, 'SouthWall');
      reg.addSolidAABB('plaza', 0, 10, 20.0, 1.0, 'NorthWall');

      let playerX = 0;
      let playerZ = 0;
      const speed = 0.5;
      const playerRadius = 0.4;

      // Challenge 1: Walk West into West wall (at x = -10, half-width 0.5 -> inner edge is -9.5)
      for (let step = 0; step < 50; step++) {
        const nextX = playerX - speed;
        if (!reg.isBlocked(nextX, playerZ, ['plaza'], playerRadius)) {
          playerX = nextX;
        }
      }
      // Player should be stopped before penetrating wall: inner edge -9.5 + radius 0.4 = -9.1
      assert.ok(playerX >= -9.1, `Expected playerX >= -9.1, got ${playerX}`);
      assert.ok(playerX < -8.5, `Expected playerX < -8.5, got ${playerX}`);

      // Challenge 2: Walk North into North wall (at z = 10, half-depth 0.5 -> inner edge is 9.5)
      for (let step = 0; step < 50; step++) {
        const nextZ = playerZ + speed;
        if (!reg.isBlocked(playerX, nextZ, ['plaza'], playerRadius)) {
          playerZ = nextZ;
        }
      }
      // Player should be stopped before penetrating wall: inner edge 9.5 - radius 0.4 = 9.1
      assert.ok(playerZ <= 9.1, `Expected playerZ <= 9.1, got ${playerZ}`);
      assert.ok(playerZ > 8.5, `Expected playerZ > 8.5, got ${playerZ}`);
    });
  });
});
