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
 * A0 only has the accepted Plaza visual harness cameras available. Keep this
 * list deliberately small: FAST must not silently become a second full suite.
 * Later authored stages can add their own entries once their camera contracts
 * exist; callers may also pass --shots for an explicit bounded subset.
 */
export const FAST_STAGE_SHOTS = Object.freeze({
  'a0-baseline-capture-readiness': Object.freeze([
    'portal-arrival',
    'workshop-approach',
    'ohm-landmark',
    'omega-gate',
    'plaza-wide',
  ]),
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

  const byId = new Map(OHMDAL_PLAZA_CAPTURE_VIEWS.map((view) => [view.id, view]));
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

