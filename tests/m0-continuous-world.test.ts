// R6: m0-continuous-world.test.ts → m0-rooms-local.test.ts.
//
// El antiguo test verificaba offsets de un mundo continuo extirpado
// en R5/R6. Su semántica valiosa migró a:
//   - m0-rooms-local.test.ts (data-shape + room-local)
//   - r5-remove-continuous-world.test.ts (R5 invariants)
//   - r6-retire-legacy-world.test.ts (R6 invariants)
//   - rr0-render-active-room.test.ts (R3/R5/R6 render scope)
//
// Este archivo queda como re-export que delega en m0-rooms-local.
import './m0-rooms-local.test.ts';
