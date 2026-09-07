import assert from 'node:assert/strict';
import {
  getContactTargetLabelText,
  projectContactTargetLabel,
  shouldShowContactTargetLabel,
} from '../src/experiences/ohmdal-playcanvas/systems/controls/contactTargetLabel.ts';
import {
  CONTACT_AFFORDANCE_CENTER,
  CONTACT_AFFORDANCE_FOOTPRINT,
} from '../src/experiences/ohmdal-playcanvas/world/plaza/contactAffordance.ts';

const visibleContext = {
  nearestInteractable: 'moho_oxido',
  currentRegion: 'plaza',
  currentMode: 'explore',
  dialogueOpen: false,
  loading: false,
  modalOpen: false,
  probeActive: false,
  residueVisible: true,
  pointInFront: true,
};

assert.equal(shouldShowContactTargetLabel(visibleContext), true);
assert.equal(shouldShowContactTargetLabel({ ...visibleContext, nearestInteractable: null }), false);
assert.equal(shouldShowContactTargetLabel({ ...visibleContext, probeActive: true }), false);
assert.equal(shouldShowContactTargetLabel({ ...visibleContext, residueVisible: false }), false);
assert.equal(shouldShowContactTargetLabel({ ...visibleContext, currentRegion: 'manantial' }), false);

assert.equal(getContactTargetLabelText(false), 'Contacto sulfatado · necesita cepillo de alambre');
assert.equal(getContactTargetLabelText(true), 'Limpiar contacto sulfatado · cepillo de alambre');

assert.deepEqual(
  projectContactTargetLabel({
    screenX: 420,
    screenY: 320,
    viewportWidth: 844,
    viewportHeight: 390,
    labelWidth: 300,
    labelHeight: 30,
  }),
  { left: 420, top: 320 },
);
assert.equal(projectContactTargetLabel({
  screenX: 80,
  screenY: 320,
  viewportWidth: 844,
  viewportHeight: 390,
  labelWidth: 300,
  labelHeight: 30,
}), null, 'el helper oculta una etiqueta que saldría del viewport por la izquierda');
assert.equal(projectContactTargetLabel({
  screenX: 420,
  screenY: 20,
  viewportWidth: 844,
  viewportHeight: 390,
  labelWidth: 300,
  labelHeight: 30,
}), null, 'el helper oculta una etiqueta cuyo anclaje queda bajo el borde superior');

assert.deepEqual(CONTACT_AFFORDANCE_CENTER, [-0.9, 0.07, -6.1]);
assert(CONTACT_AFFORDANCE_FOOTPRINT.width <= 0.7);
assert(CONTACT_AFFORDANCE_FOOTPRINT.depth <= 1.0);
assert(CONTACT_AFFORDANCE_FOOTPRINT.maxHeight <= 0.2);
assert(
  CONTACT_AFFORDANCE_CENTER[2] + CONTACT_AFFORDANCE_FOOTPRINT.depth / 2 < -5.25,
  'el borde norte del contacto queda fuera del pedestal sur de Ohm',
);

console.log('Ohmdal contact target label: OK (context, text and CSS projection)');
