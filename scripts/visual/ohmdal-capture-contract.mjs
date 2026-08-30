/**
 * Capture contracts shared by the Ohmdal visual capturer and its focused tests.
 *
 * FULL intentionally keeps the existing deterministic/canonical suite. FAST is
 * an iteration lane: it prefers a locally installed Chromium-family browser
 * with GPU acceleration, and only captures the current stage's load-bearing
 * views. Neither lane changes the PlayCanvas visual harness.
 */

export const OHMDAL_PLAZA_CAPTURE_VIEWS = Object.freeze([
  Object.freeze({ id: 'portal-arrival', viewport: Object.freeze({ width: 1440, height: 900 }), hideUi: true, post: true }),
  Object.freeze({ id: 'workshop-approach', viewport: Object.freeze({ width: 1440, height: 900 }), hideUi: true, post: true }),
  Object.freeze({ id: 'ohm-landmark', viewport: Object.freeze({ width: 1440, height: 900 }), hideUi: true, post: true }),
  Object.freeze({ id: 'omega-gate', viewport: Object.freeze({ width: 1440, height: 900 }), hideUi: true, post: true }),
  Object.freeze({ id: 'plaza-wide', viewport: Object.freeze({ width: 1440, height: 900 }), hideUi: true, post: true }),
  Object.freeze({ id: 'active-play-desktop', viewport: Object.freeze({ width: 1440, height: 900 }), hideUi: false, post: true }),
  Object.freeze({ id: 'active-play-mobile', viewport: Object.freeze({ width: 390, height: 844 }), hideUi: false, post: true }),
  Object.freeze({ id: 'no-post', viewport: Object.freeze({ width: 1440, height: 900 }), hideUi: true, post: false }),
]);

/**
 * Keep each stage deliberately small: FAST must not silently become a second
 * full suite. Authored A2/A3/A4 entries use the authored shot hook below because
 * they span zone seams; callers may also pass --shots explicitly.
 */
export const FAST_STAGE_SHOTS = Object.freeze({
  'a0-baseline-capture-readiness': Object.freeze([
    'portal-arrival',
    'workshop-approach',
    'ohm-landmark',
    'omega-gate',
    'plaza-wide',
  ]),
  'a2-plaza-workshop-authored': Object.freeze([
    'workshop-exterior',
    'workshop-interior-tools',
    'galvanoscope-first-person',
  ]),
  'a3-manantial-central-authored': Object.freeze([
    'manantial-approach',
    'hydro-central-wide',
    'sluice-gate-interaction',
    'generator-platform',
    'restored-manantial',
  ]),
  'a4-castle-authored': Object.freeze([
    'restored-plaza-wide',
    'bell-activation',
    'castle-gate-open',
    'castle-distribution-hall',
  ]),
  'a5-forge-terraces-authored': Object.freeze([
    'forge-core',
    'terraces-irrigation',
    'forge-terraces-overview',
  ]),
  'a6-lighthouse-lake-return-authored': Object.freeze([
    'lighthouse-approach',
    'lighthouse-lake-wide',
    'final-return-plaza',
    'arc1-final-pedestal',
  ]),
  'a7-vfx-audio-ambient': Object.freeze([
    'restored-manantial',
    'bell-activation',
    'forge-core',
    'lighthouse-lake-wide',
  ]),
});

/**
 * Deterministic authored shot metadata. These coordinates are capture
 * anchors, not a second gameplay layout: the runtime hook must activate the
 * corresponding existing zone and story/tool/electrical state before applying
 * them.
 *
 * Authored shots deliberately use a dedicated hook instead of mapping them to
 * an A0 camera. A fallback to Plaza would produce a valid PNG with invalid
 * evidence, which is worse than a clear wiring failure.
 */
export const OHMDAL_AUTHORED_CAPTURE_SHOTS = Object.freeze({
  'workshop-exterior': Object.freeze({
    id: 'workshop-exterior',
    state: 'workshop-exterior',
    camera: 'workshop-exterior',
    runtimeHook: 'setCaptureShot',
    viewport: Object.freeze({ width: 1440, height: 900 }),
    hideUi: true,
    post: true,
    anchor: Object.freeze({ position: Object.freeze([-2.8, 1.8, -4.15]), yaw: 90, pitch: -5 }),
    world: Object.freeze({ zone: 'plaza', storyStep: 'returned_to_plaza' }),
    deterministic: Object.freeze({ seed: 1701, reducedMotion: true, pauseBeforeCapture: true }),
  }),
  'workshop-interior-tools': Object.freeze({
    id: 'workshop-interior-tools',
    state: 'workshop-interior-tools',
    camera: 'workshop-interior-tools',
    runtimeHook: 'setCaptureShot',
    viewport: Object.freeze({ width: 1440, height: 900 }),
    hideUi: true,
    post: true,
    anchor: Object.freeze({ position: Object.freeze([-60, 1.9, -2.45]), yaw: 180, pitch: -3 }),
    world: Object.freeze({ zone: 'workshop', storyStep: 'inside_workshop' }),
    deterministic: Object.freeze({ seed: 1701, reducedMotion: true, pauseBeforeCapture: true }),
  }),
  'galvanoscope-first-person': Object.freeze({
    id: 'galvanoscope-first-person',
    state: 'galvanoscope-first-person',
    camera: 'galvanoscope-first-person',
    runtimeHook: 'setCaptureShot',
    viewport: Object.freeze({ width: 1440, height: 900 }),
    hideUi: true,
    post: true,
    anchor: Object.freeze({ position: Object.freeze([-63.8, 1.68, 0.8]), yaw: 270, pitch: -4 }),
    world: Object.freeze({
      zone: 'workshop',
      storyStep: 'tools_received',
      tool: 'galvanoscope',
      probeTarget: 'lumen_taller_banco',
    }),
    deterministic: Object.freeze({ seed: 1701, reducedMotion: true, pauseBeforeCapture: true }),
  }),
  'manantial-approach': Object.freeze({
    id: 'manantial-approach',
    state: 'manantial-approach',
    camera: 'manantial-approach',
    runtimeHook: 'setCaptureShot',
    viewport: Object.freeze({ width: 1440, height: 900 }),
    hideUi: true,
    post: true,
    // Three-quarter entry view keeps the machine clear of its own foreground.
    anchor: Object.freeze({ position: Object.freeze([9.0, 3.4, 13.5]), yaw: 138, pitch: -8 }),
    world: Object.freeze({
      zone: 'manantial',
      storyStep: 'inside_manantial',
      manantial: Object.freeze({
        gateOpen: false,
        returnBridgeInstalled: false,
        excitationEnabled: false,
        protectiveTrip: false,
        restored: false,
      }),
    }),
    deterministic: Object.freeze({ seed: 1701, reducedMotion: true, pauseBeforeCapture: true }),
  }),
  'hydro-central-wide': Object.freeze({
    id: 'hydro-central-wide',
    state: 'hydro-central-wide',
    camera: 'hydro-central-wide',
    runtimeHook: 'setCaptureShot',
    viewport: Object.freeze({ width: 1440, height: 900 }),
    hideUi: true,
    post: true,
    // Elevated QA anchor keeps the water ribbon, powerhouse and penstocks in
    // one causal view without changing the navigable route.
    anchor: Object.freeze({ position: Object.freeze([-11.0, 8.5, 13.0]), yaw: 225, pitch: -18 }),
    world: Object.freeze({
      zone: 'manantial',
      storyStep: 'inside_manantial',
      manantial: Object.freeze({
        gateOpen: false,
        returnBridgeInstalled: false,
        excitationEnabled: false,
        protectiveTrip: false,
        restored: false,
      }),
    }),
    deterministic: Object.freeze({ seed: 1701, reducedMotion: true, pauseBeforeCapture: true }),
  }),
  'sluice-gate-interaction': Object.freeze({
    id: 'sluice-gate-interaction',
    state: 'sluice-gate-interaction',
    camera: 'sluice-gate-interaction',
    runtimeHook: 'setCaptureShot',
    viewport: Object.freeze({ width: 1440, height: 900 }),
    hideUi: true,
    post: true,
    // Oblique approach shows the interaction control attached to the leaf.
    anchor: Object.freeze({ position: Object.freeze([-8.0, 3.2, 15.0]), yaw: 225, pitch: -4 }),
    world: Object.freeze({
      zone: 'manantial',
      storyStep: 'inside_manantial',
      interaction: 'intake-gate',
      comparison: 'before-after',
      manantial: Object.freeze({
        gateOpen: false,
        returnBridgeInstalled: false,
        excitationEnabled: false,
        protectiveTrip: false,
        restored: false,
      }),
    }),
    deterministic: Object.freeze({ seed: 1701, reducedMotion: true, pauseBeforeCapture: true }),
  }),
  'generator-platform': Object.freeze({
    id: 'generator-platform',
    state: 'generator-platform',
    camera: 'generator-platform',
    runtimeHook: 'setCaptureShot',
    viewport: Object.freeze({ width: 1440, height: 900 }),
    hideUi: true,
    post: true,
    // East service side frames machine, platform, insulators and outgoing bus.
    anchor: Object.freeze({ position: Object.freeze([8.5, 4.2, 15.5]), yaw: 135, pitch: -8 }),
    world: Object.freeze({
      zone: 'manantial',
      storyStep: 'inside_manantial',
      measurementPoint: 'generator',
      manantial: Object.freeze({
        gateOpen: true,
        returnBridgeInstalled: false,
        excitationEnabled: false,
        protectiveTrip: false,
        restored: false,
      }),
    }),
    deterministic: Object.freeze({ seed: 1701, reducedMotion: true, pauseBeforeCapture: true }),
  }),
  'restored-manantial': Object.freeze({
    id: 'restored-manantial',
    state: 'restored-manantial',
    camera: 'restored-manantial',
    runtimeHook: 'setCaptureShot',
    viewport: Object.freeze({ width: 1440, height: 900 }),
    hideUi: true,
    post: true,
    // Reuse the entry overlook so dormant/energized captures compare cleanly.
    anchor: Object.freeze({ position: Object.freeze([-11.0, 8.5, 13.0]), yaw: 225, pitch: -18 }),
    world: Object.freeze({
      zone: 'manantial',
      storyStep: 'manantial_restored',
      manantial: Object.freeze({
        gateOpen: true,
        returnBridgeInstalled: true,
        excitationEnabled: true,
        protectiveTrip: false,
        restored: true,
      }),
    }),
    deterministic: Object.freeze({ seed: 1701, reducedMotion: true, pauseBeforeCapture: true }),
  }),
  'restored-plaza-wide': Object.freeze({
    id: 'restored-plaza-wide',
    state: 'restored-plaza-wide',
    camera: 'restored-plaza-wide',
    runtimeHook: 'setCaptureShot',
    viewport: Object.freeze({ width: 1440, height: 900 }),
    hideUi: true,
    post: true,
    // Preserve the accepted Plaza-wide overlook while making the restored
    // state explicit for the late-route comparison.
    anchor: Object.freeze({ position: Object.freeze([0, 11.5, -13.2]), yaw: 180, pitch: -33 }),
    world: Object.freeze({
      zone: 'plaza',
      storyStep: 'restored_plaza',
      comparison: 'before-after',
      plaza: Object.freeze({ bellPulls: 0, castleGateOpened: false }),
      manantial: Object.freeze({
        gateOpen: true,
        returnBridgeInstalled: true,
        excitationEnabled: true,
        protectiveTrip: false,
        restored: true,
      }),
    }),
    deterministic: Object.freeze({ seed: 1701, reducedMotion: true, pauseBeforeCapture: true }),
  }),
  'bell-activation': Object.freeze({
    id: 'bell-activation',
    state: 'bell-activation',
    camera: 'bell-activation',
    runtimeHook: 'setCaptureShot',
    viewport: Object.freeze({ width: 1440, height: 900 }),
    hideUi: true,
    post: true,
    // Three-quarter view avoids hiding the bell behind either gantry post.
    anchor: Object.freeze({ position: Object.freeze([-9.0, 2.6, 0]), yaw: 238, pitch: -5 }),
    world: Object.freeze({
      zone: 'plaza',
      storyStep: 'restored_plaza',
      interaction: 'bell',
      comparison: 'before-after',
      plaza: Object.freeze({ bellPulls: 1, castleGateOpened: true }),
      manantial: Object.freeze({
        gateOpen: true,
        returnBridgeInstalled: true,
        excitationEnabled: true,
        protectiveTrip: false,
        restored: true,
      }),
    }),
    deterministic: Object.freeze({ seed: 1701, reducedMotion: true, pauseBeforeCapture: true }),
  }),
  'castle-gate-open': Object.freeze({
    id: 'castle-gate-open',
    state: 'castle-gate-open',
    camera: 'castle-gate-open',
    runtimeHook: 'setCaptureShot',
    viewport: Object.freeze({ width: 1440, height: 900 }),
    hideUi: true,
    post: true,
    // Outside three-quarter view through the validated south-wall aperture:
    // the missing rail reads as an open threshold while preserving the hall.
    anchor: Object.freeze({ position: Object.freeze([55, 4, -17]), yaw: 222, pitch: -8 }),
    world: Object.freeze({
      zone: 'castle',
      storyStep: 'inside_castle',
      plaza: Object.freeze({ bellPulls: 1, castleGateOpened: true }),
      manantial: Object.freeze({
        gateOpen: true,
        returnBridgeInstalled: true,
        excitationEnabled: true,
        protectiveTrip: false,
        restored: true,
      }),
      castle: Object.freeze({
        topology: 'unwired',
        returnContinuity: false,
        energized: false,
        protectiveTrip: false,
      }),
    }),
    deterministic: Object.freeze({ seed: 1701, reducedMotion: true, pauseBeforeCapture: true }),
  }),
  'castle-distribution-hall': Object.freeze({
    id: 'castle-distribution-hall',
    state: 'castle-distribution-hall',
    camera: 'castle-distribution-hall',
    runtimeHook: 'setCaptureShot',
    viewport: Object.freeze({ width: 1440, height: 900 }),
    hideUi: true,
    post: true,
    // Elevated oblique view keeps the panel, galleries and raised bus legible
    // without placing the central bus support directly over the composition.
    anchor: Object.freeze({ position: Object.freeze([51.5, 6, -10]), yaw: 220, pitch: -18 }),
    world: Object.freeze({
      zone: 'castle',
      storyStep: 'inside_castle',
      probeTarget: 'castle_bus_in',
      plaza: Object.freeze({ bellPulls: 1, castleGateOpened: true }),
      manantial: Object.freeze({
        gateOpen: true,
        returnBridgeInstalled: true,
        excitationEnabled: true,
        protectiveTrip: false,
        restored: true,
      }),
      castle: Object.freeze({
        topology: 'unwired',
        returnContinuity: false,
        energized: false,
        protectiveTrip: false,
      }),
    }),
    deterministic: Object.freeze({ seed: 1701, reducedMotion: true, pauseBeforeCapture: true }),
  }),
  'forge-core': Object.freeze({
    id: 'forge-core',
    state: 'forge-core',
    camera: 'forge-core',
    runtimeHook: 'setCaptureShot',
    viewport: Object.freeze({ width: 1440, height: 900 }),
    hideUi: true,
    post: true,
    // Three-quarter oblique view framing heavy hearth, furnace hood, conductors and protection
    anchor: Object.freeze({ position: Object.freeze([121.5, 2.8, -4.5]), yaw: 35, pitch: -10 }),
    world: Object.freeze({
      zone: 'forge-terraces',
      storyStep: 'inside_forge_terraces',
      probeTarget: 'forge_heater',
      forgeTerraces: Object.freeze({
        allocation: Object.freeze({ forge: 5, terraces: 3 }),
        conductor: 'medium',
        energized: true,
        protectiveTrip: false,
        restored: false,
      }),
    }),
    deterministic: Object.freeze({ seed: 1701, reducedMotion: true, pauseBeforeCapture: true }),
  }),
  'terraces-irrigation': Object.freeze({
    id: 'terraces-irrigation',
    state: 'terraces-irrigation',
    camera: 'terraces-irrigation',
    runtimeHook: 'setCaptureShot',
    viewport: Object.freeze({ width: 1440, height: 900 }),
    hideUi: true,
    post: true,
    // Elevated overlook across stepped stone terraces, pump station and water distribution
    anchor: Object.freeze({ position: Object.freeze([114.0, 4.5, 10.0]), yaw: 45, pitch: -22 }),
    world: Object.freeze({
      zone: 'forge-terraces',
      storyStep: 'forge_terraces_restored',
      probeTarget: 'terraces_pump',
      forgeTerraces: Object.freeze({
        allocation: Object.freeze({ forge: 3, terraces: 5 }),
        conductor: 'medium',
        energized: true,
        protectiveTrip: false,
        restored: true,
      }),
    }),
    deterministic: Object.freeze({ seed: 1701, reducedMotion: true, pauseBeforeCapture: true }),
  }),
  'forge-terraces-overview': Object.freeze({
    id: 'forge-terraces-overview',
    state: 'forge-terraces-overview',
    camera: 'forge-terraces-overview',
    runtimeHook: 'setCaptureShot',
    viewport: Object.freeze({ width: 1440, height: 900 }),
    hideUi: true,
    post: true,
    // High wide overview showing trade-off between industrial thermal demand and irrigation demand
    anchor: Object.freeze({ position: Object.freeze([120.0, 9.5, -13.5]), yaw: 180, pitch: -30 }),
    world: Object.freeze({
      zone: 'forge-terraces',
      storyStep: 'inside_forge_terraces',
      comparison: 'before-after',
      probeTarget: 'forge_bus',
      forgeTerraces: Object.freeze({
        allocation: Object.freeze({ forge: 5, terraces: 3 }),
        conductor: 'medium',
        energized: true,
        protectiveTrip: false,
        restored: false,
      }),
    }),
    deterministic: Object.freeze({ seed: 1701, reducedMotion: true, pauseBeforeCapture: true }),
  }),
  'lighthouse-approach': Object.freeze({
    id: 'lighthouse-approach',
    state: 'lighthouse-approach',
    camera: 'lighthouse-approach',
    runtimeHook: 'setCaptureShot',
    viewport: Object.freeze({ width: 1440, height: 900 }),
    hideUi: true,
    post: true,
    // First approach looking north along the causeway toward calibration bench and beacon tower
    anchor: Object.freeze({ position: Object.freeze([180.0, 2.8, -10.5]), yaw: 180, pitch: -6 }),
    world: Object.freeze({
      zone: 'lighthouse',
      storyStep: 'inside_lighthouse',
      probeTarget: 'lighthouse_bus',
      lighthouse: Object.freeze({
        mode: 'dc',
        calibrated: false,
        energized: false,
        restored: false,
      }),
    }),
    deterministic: Object.freeze({ seed: 1701, reducedMotion: true, pauseBeforeCapture: true }),
  }),
  'lighthouse-lake-wide': Object.freeze({
    id: 'lighthouse-lake-wide',
    state: 'lighthouse-lake-wide',
    camera: 'lighthouse-lake-wide',
    runtimeHook: 'setCaptureShot',
    viewport: Object.freeze({ width: 1440, height: 900 }),
    hideUi: true,
    post: true,
    // Elevated three-quarter view framing calibration bench, lighthouse beacon tower, dock pier and lake expanse
    anchor: Object.freeze({ position: Object.freeze([172.0, 5.2, 2.0]), yaw: 120, pitch: -16 }),
    world: Object.freeze({
      zone: 'lighthouse',
      storyStep: 'inside_lighthouse',
      probeTarget: 'lighthouse_beacon',
      lighthouse: Object.freeze({
        mode: 'dc',
        calibrated: true,
        energized: true,
        restored: true,
      }),
    }),
    deterministic: Object.freeze({ seed: 1701, reducedMotion: true, pauseBeforeCapture: true }),
  }),
  'final-return-plaza': Object.freeze({
    id: 'final-return-plaza',
    state: 'final-return-plaza',
    camera: 'final-return-plaza',
    runtimeHook: 'setCaptureShot',
    viewport: Object.freeze({ width: 1440, height: 900 }),
    hideUi: true,
    post: true,
    // Backtrack view looking south across the restored Plaza toward Ohm and Taller with active lighting and bell
    anchor: Object.freeze({ position: Object.freeze([0, 6.5, 6.5]), yaw: 0, pitch: -18 }),
    world: Object.freeze({
      zone: 'plaza',
      storyStep: 'returned_to_plaza',
      comparison: 'before-after',
      plaza: Object.freeze({ bellPulls: 1, castleGateOpened: true }),
      lighthouse: Object.freeze({
        mode: 'dc',
        calibrated: true,
        energized: true,
        restored: true,
      }),
    }),
    deterministic: Object.freeze({ seed: 1701, reducedMotion: true, pauseBeforeCapture: true }),
  }),
  'arc1-final-pedestal': Object.freeze({
    id: 'arc1-final-pedestal',
    state: 'arc1-final-pedestal',
    camera: 'arc1-final-pedestal',
    runtimeHook: 'setCaptureShot',
    viewport: Object.freeze({ width: 1440, height: 900 }),
    hideUi: true,
    post: true,
    // Close view of the Ohm landmark / central pedestal in completed network state
    anchor: Object.freeze({ position: Object.freeze([0, 1.8, -7.5]), yaw: 180, pitch: -6 }),
    world: Object.freeze({
      zone: 'plaza',
      storyStep: 'arc1_complete',
      probeTarget: 'plaza_banco',
      plaza: Object.freeze({ bellPulls: 1, castleGateOpened: true }),
      lighthouse: Object.freeze({
        mode: 'dc',
        calibrated: true,
        energized: true,
        restored: true,
      }),
    }),
    deterministic: Object.freeze({ seed: 1701, reducedMotion: true, pauseBeforeCapture: true }),
  }),
});

export const FULL_CAPTURE_CONTRACT = Object.freeze({
  id: 'full-deterministic',
  deterministic: true,
  currentStageOnly: false,
  canonicalShots: true,
  includesMobile: true,
  includesNoPost: true,
  includesTouchSmoke: true,
  hardwareAccelerationRequested: false,
  softwareRendererAllowed: true,
});

export const FAST_CAPTURE_CONTRACT = Object.freeze({
  id: 'fast-local-gpu',
  deterministic: true,
  currentStageOnly: true,
  canonicalShots: false,
  includesMobile: false,
  includesNoPost: false,
  includesTouchSmoke: false,
  hardwareAccelerationRequested: true,
  softwareRendererAllowed: true,
});

export const FAST_GPU_ARGS = Object.freeze([
  '--enable-gpu',
  '--ignore-gpu-blocklist',
  '--enable-accelerated-2d-canvas',
  '--enable-gpu-rasterization',
  '--enable-zero-copy',
]);

function copyView(view) {
  return {
    id: view.id,
    viewport: { ...view.viewport },
    hideUi: view.hideUi,
    post: view.post,
  };
}

function authoredView(id) {
  const shot = OHMDAL_AUTHORED_CAPTURE_SHOTS[id];
  return shot ? {
    id: shot.id,
    viewport: { ...shot.viewport },
    hideUi: shot.hideUi,
    post: shot.post,
  } : null;
}

export function getCaptureShotSpec(id) {
  const authored = OHMDAL_AUTHORED_CAPTURE_SHOTS[id];
  if (authored) return structuredClone(authored);
  const legacy = OHMDAL_PLAZA_CAPTURE_VIEWS.find((view) => view.id === id);
  if (!legacy) throw new Error(`Unknown Ohmdal capture shot: ${id}`);
  return {
    id: legacy.id,
    state: 'portal-arrival',
    camera: legacy.id,
    runtimeHook: 'setStateAndCamera',
    viewport: { ...legacy.viewport },
    hideUi: legacy.hideUi,
    post: legacy.post,
    anchor: null,
    world: { zone: 'plaza', storyStep: 'portal_arrived' },
    deterministic: { seed: 1701, reducedMotion: true, pauseBeforeCapture: true },
  };
}

export function resolveCaptureViews({ mode = 'full', stage = null, shots = null } = {}) {
  if (mode === 'full') {
    if (shots?.length) throw new Error('FULL capture does not accept --shots; use FAST for bounded subsets.');
    return OHMDAL_PLAZA_CAPTURE_VIEWS.map(copyView);
  }
  if (mode !== 'fast') throw new Error(`Unknown Ohmdal capture mode: ${mode}`);

  const ids = shots?.length ? shots : FAST_STAGE_SHOTS[stage];
  if (!ids?.length) {
    throw new Error(`FAST capture needs a supported --stage or explicit --shots; received stage=${stage ?? 'none'}.`);
  }

  const byId = new Map([
    ...OHMDAL_PLAZA_CAPTURE_VIEWS.map((view) => [view.id, view]),
    ...Object.keys(OHMDAL_AUTHORED_CAPTURE_SHOTS).map((id) => [id, authoredView(id)]),
  ]);
  const unknown = ids.filter((id) => !byId.has(id));
  if (unknown.length) throw new Error(`Unknown Ohmdal capture shot(s): ${unknown.join(', ')}`);
  return ids.map((id) => copyView(byId.get(id)));
}

export function assertRendererDiagnostics(diagnostics, label = 'capture') {
  const browser = diagnostics?.browser;
  if (!browser || !Object.prototype.hasOwnProperty.call(browser, 'renderer')) {
    throw new Error(`${label}: diagnostics.browser.renderer is missing.`);
  }
  if (!Object.prototype.hasOwnProperty.call(browser, 'softwareRendered')) {
    throw new Error(`${label}: diagnostics.browser.softwareRendered is missing.`);
  }
  return diagnostics;
}

export function fastLaunchOptions({ headless = true, platform = process.platform } = {}) {
  const args = [...FAST_GPU_ARGS];
  // D3D11 is the least surprising ANGLE path for a local Windows Chrome run.
  // Do not add SwiftShader or disable-gpu here: a software fallback is allowed
  // and is reported by diagnostics instead of being mislabeled as GPU output.
  if (platform === 'win32') args.push('--use-angle=d3d11');
  return { headless, args };
}
