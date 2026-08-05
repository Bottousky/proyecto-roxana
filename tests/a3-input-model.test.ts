import {
  createInputModel,
  parseBindings,
  DEFAULT_BINDINGS,
  RESERVED_KEYS,
} from '../src/ohmdal/inputModel.ts';
import type { InputAction } from '../src/ohmdal/inputModel.ts';

function assert(condition: unknown, label: string): void {
  if (!condition) throw new Error(label);
}

const ALL_ACTIONS: readonly InputAction[] = ['up', 'down', 'left', 'right', 'action', 'cancel'];

// ---- DEFAULT_BINDINGS: los ocho de hoy + las dos acciones nuevas ----
function testDefaultBindings(): void {
  assert(
    DEFAULT_BINDINGS.up.includes('ArrowUp') && DEFAULT_BINDINGS.up.includes('KeyW'),
    'DEFAULT_BINDINGS.up incluye ArrowUp y KeyW, como en lab.ts',
  );
  assert(
    DEFAULT_BINDINGS.down.includes('ArrowDown') && DEFAULT_BINDINGS.down.includes('KeyS'),
    'DEFAULT_BINDINGS.down incluye ArrowDown y KeyS, como en lab.ts',
  );
  assert(
    DEFAULT_BINDINGS.left.includes('ArrowLeft') && DEFAULT_BINDINGS.left.includes('KeyA'),
    'DEFAULT_BINDINGS.left incluye ArrowLeft y KeyA, como en lab.ts',
  );
  assert(
    DEFAULT_BINDINGS.right.includes('ArrowRight') && DEFAULT_BINDINGS.right.includes('KeyD'),
    'DEFAULT_BINDINGS.right incluye ArrowRight y KeyD, como en lab.ts',
  );
  assert(DEFAULT_BINDINGS.action.length > 0, 'DEFAULT_BINDINGS.action tiene al menos una tecla');
  assert(DEFAULT_BINDINGS.cancel.length > 0, 'DEFAULT_BINDINGS.cancel tiene al menos una tecla');
  assert(
    Object.keys(DEFAULT_BINDINGS).length === 6 &&
      ALL_ACTIONS.every((a) => Object.prototype.hasOwnProperty.call(DEFAULT_BINDINGS, a)),
    'DEFAULT_BINDINGS define exactamente las seis acciones: up, down, left, right, action, cancel',
  );

  assert(RESERVED_KEYS.includes('Tab'), 'RESERVED_KEYS incluye Tab');
  for (let n = 1; n <= 12; n++) {
    assert(RESERVED_KEYS.includes(`F${n}`), `RESERVED_KEYS incluye F${n}`);
  }

  console.log('A3 input model: DEFAULT_BINDINGS y RESERVED_KEYS OK');
}

// ---- actionFor: un código mapeado, uno que no ----
function testActionFor(): void {
  const model = createInputModel();
  assert(model.actionFor('KeyD') === 'right', 'actionFor: KeyD (mapeada) resuelve a right');
  assert(model.actionFor('KeyQ') === null, 'actionFor: KeyQ (no mapeada) resuelve a null');
  console.log('A3 input model: actionFor OK');
}

// ---- press/release: true si el código estaba mapeado, false si no ----
function testPressRelease(): void {
  const model = createInputModel();
  assert(model.press('KeyA') === true, 'press: KeyA está mapeada, devuelve true');
  assert(model.press('KeyQ') === false, 'press: KeyQ no está mapeada, devuelve false');
  assert(model.release('KeyA') === true, 'release: KeyA está mapeada, devuelve true');
  assert(model.release('KeyQ') === false, 'release: KeyQ no está mapeada, devuelve false');
  console.log('A3 input model: press/release OK');
}

// ---- pressAction/releaseAction: el camino táctil llega a la misma acción que la tecla ----
function testTactilYTecladoLlegAnALaMismaAccion(): void {
  const porTeclado = createInputModel();
  porTeclado.press('KeyW');
  assert(porTeclado.isDown('up') === true, 'press(KeyW) deja isDown(up) en true');

  const porTactil = createInputModel();
  porTactil.pressAction('up');
  assert(porTactil.isDown('up') === true, 'pressAction(up) deja isDown(up) en true, igual que la tecla');

  porTactil.releaseAction('up');
  assert(porTactil.isDown('up') === false, 'releaseAction(up) apaga isDown(up)');

  console.log('A3 input model: pressAction/releaseAction llegan a la misma acción que la tecla OK');
}

// ---- movementIntent: diagonal, y teclas opuestas apretadas a la vez ----
function testMovementIntent(): void {
  const diagonal = createInputModel();
  diagonal.press('ArrowUp'); // up
  diagonal.press('ArrowRight'); // right
  const intentoDiagonal = diagonal.movementIntent();
  assert(intentoDiagonal.x === 1 && intentoDiagonal.z === 1, 'movementIntent: arriba+derecha da x=1, z=1');

  const opuestas = createInputModel();
  opuestas.press('ArrowUp'); // up
  opuestas.press('ArrowDown'); // down
  opuestas.press('KeyA'); // left
  opuestas.press('KeyD'); // right
  const intentoOpuestas = opuestas.movementIntent();
  assert(intentoOpuestas.x === 0, 'movementIntent: up+down simultáneos anulan el eje x (x = up - down)');
  assert(intentoOpuestas.z === 0, 'movementIntent: left+right simultáneos anulan el eje z (z = right - left)');

  console.log('A3 input model: movementIntent diagonal y teclas opuestas OK');
}

// ---- rebind, regla 1: tecla reservada (dos ejemplos) ----
function testRebindTeclaReservada(): void {
  const m1 = createInputModel();
  const r1 = m1.rebind('action', 'Tab');
  assert(r1.ok === false && r1.reason === 'reserved-key', 'rebind: Tab es reservada, se rechaza');

  const m2 = createInputModel();
  const r2 = m2.rebind('cancel', 'F5');
  assert(r2.ok === false && r2.reason === 'reserved-key', 'rebind: F5 es reservada, se rechaza');

  console.log('A3 input model: rebind rechaza teclas reservadas OK');
}

// ---- rebind, regla 2: tecla ya usada por otra acción que NO quedaría huérfana (dos ejemplos) ----
function testRebindDuplicateBinding(): void {
  const m1 = createInputModel();
  const r1 = m1.rebind('down', 'ArrowUp'); // ArrowUp es de 'up', que también tiene KeyW
  assert(
    r1.ok === false && r1.reason === 'duplicate-binding' && r1.conflictsWith === 'up',
    'rebind: ArrowUp ya es de up (que conserva otra tecla), se rechaza informando el conflicto',
  );

  const m2 = createInputModel();
  const r2 = m2.rebind('cancel', 'Enter'); // Enter es de 'action', que también tiene Space
  assert(
    r2.ok === false && r2.reason === 'duplicate-binding' && r2.conflictsWith === 'action',
    'rebind: Enter ya es de action (que conserva otra tecla), se rechaza informando el conflicto',
  );

  console.log('A3 input model: rebind rechaza teclas duplicadas OK');
}

// ---- rebind, regla 3: dejaría una acción sin ninguna tecla (dos ejemplos, modelos distintos) ----
function testRebindOrphanAction(): void {
  const m1 = createInputModel();
  const r1 = m1.rebind('up', 'Escape'); // Escape es la ÚNICA tecla de 'cancel'
  assert(
    r1.ok === false && r1.reason === 'orphan-action',
    'rebind: Escape es la única tecla de cancel, moverla la dejaría inalcanzable',
  );

  const m2 = createInputModel({
    up: ['ArrowUp', 'KeyW'],
    down: ['ArrowDown', 'KeyS'],
    left: ['KeyA'], // acá 'left' arranca con una sola tecla
    right: ['ArrowRight', 'KeyD'],
    action: ['Space', 'Enter'],
    cancel: ['Escape'],
  });
  const r2 = m2.rebind('right', 'KeyA');
  assert(
    r2.ok === false && r2.reason === 'orphan-action',
    'rebind: KeyA es la única tecla de left en este modelo, moverla la dejaría inalcanzable',
  );

  console.log('A3 input model: rebind rechaza dejar una acción sin tecla OK');
}

// ---- rebind, regla 4: reasignar a la misma acción que ya la tiene es no-op exitoso ----
function testRebindNoOpMismaAccion(): void {
  const model = createInputModel();
  const antes = model.bindingsFor('up');
  const resultado = model.rebind('up', 'KeyW'); // 'up' ya tiene KeyW
  assert(resultado.ok === true, 'rebind: reasignar una tecla que la acción ya tiene es exitoso');
  const despues = model.bindingsFor('up');
  assert(despues.length === antes.length, 'rebind: el no-op no cambia la cantidad de teclas de la acción');
  assert(
    despues.filter((code) => code === 'KeyW').length === 1,
    'rebind: el no-op no duplica la tecla en la lista',
  );
  console.log('A3 input model: rebind no-op al reasignar una tecla ya propia OK');
}

// ---- rebind: camino feliz con una tecla libre (aditivo, no reemplaza lo que ya había) ----
function testRebindExitoConTeclaLibre(): void {
  const model = createInputModel();
  const resultado = model.rebind('cancel', 'KeyQ'); // KeyQ está libre
  assert(resultado.ok === true, 'rebind: una tecla libre se asigna sin problema');
  assert(model.actionFor('KeyQ') === 'cancel', 'rebind: la tecla nueva ahora resuelve a la acción pedida');
  assert(model.bindingsFor('cancel').includes('KeyQ'), 'rebind: la tecla nueva aparece en bindingsFor');
  assert(model.bindingsFor('cancel').includes('Escape'), 'rebind: la tecla anterior se conserva (es aditivo)');
  console.log('A3 input model: rebind exitoso con tecla libre OK');
}

// ---- unbind, regla 1: quitar la última tecla de una acción ----
function testUnbindOrphanAction(): void {
  const model = createInputModel();
  const resultado = model.unbind('cancel', 'Escape'); // Escape es la ÚNICA tecla de cancel
  assert(
    resultado.ok === false && resultado.reason === 'orphan-action',
    'unbind: quitar la única tecla de cancel la dejaría inalcanzable',
  );
  assert(
    model.bindingsFor('cancel').includes('Escape'),
    'unbind: el rechazo no quita la tecla',
  );
  console.log('A3 input model: unbind rechaza dejar una acción sin tecla OK');
}

// ---- unbind, regla 2: quitar una tecla que es de otra acción ----
function testUnbindDuplicateBinding(): void {
  const model = createInputModel();
  const resultado = model.unbind('up', 'KeyS'); // KeyS es de down
  assert(
    resultado.ok === false && resultado.reason === 'duplicate-binding' && resultado.conflictsWith === 'down',
    'unbind: KeyS es de down, no se la puede quitar de up, y se informa el dueño real',
  );
  assert(model.actionFor('KeyS') === 'down', 'unbind: el rechazo no toca el binding de down');
  console.log('A3 input model: unbind rechaza una tecla que es de otra acción OK');
}

// ---- unbind, regla 3: tecla reservada ----
function testUnbindReservedKey(): void {
  const model = createInputModel();
  const resultado = model.unbind('action', 'Tab');
  assert(
    resultado.ok === false && resultado.reason === 'reserved-key',
    'unbind: Tab es reservada, se rechaza aunque nadie la tenga',
  );
  console.log('A3 input model: unbind rechaza teclas reservadas OK');
}

// ---- unbind: no-op exitoso sobre una tecla libre ----
function testUnbindNoOpTeclaLibre(): void {
  const model = createInputModel();
  const antes = model.bindingsFor('up');
  const resultado = model.unbind('up', 'KeyQ'); // KeyQ no está ligada a nadie
  assert(resultado.ok === true, 'unbind: una tecla libre no tiene nada que quitar, es no-op exitoso');
  const despues = model.bindingsFor('up');
  assert(
    despues.length === antes.length && despues.every((code, i) => code === antes[i]),
    'unbind: el no-op no cambia los bindings de la acción',
  );
  console.log('A3 input model: unbind no-op sobre tecla libre OK');
}

// ---- unbind: quitar una tecla que sí es de la acción ----
function testUnbindExito(): void {
  const model = createInputModel();
  const resultado = model.unbind('up', 'KeyW'); // up tiene ArrowUp y KeyW
  assert(resultado.ok === true, 'unbind: quitar una tecla propia y que deja otra es exitoso');
  assert(!model.bindingsFor('up').includes('KeyW'), 'unbind: la tecla desaparece de bindingsFor(up)');
  assert(model.bindingsFor('up').includes('ArrowUp'), 'unbind: la otra tecla de up se conserva');
  assert(model.actionFor('KeyW') === null, 'unbind: actionFor deja de resolver la tecla quitada');
  assert(model.actionFor('ArrowUp') === 'up', 'unbind: las teclas que quedan siguen resolviendo');
  console.log('A3 input model: unbind exitoso OK');
}

// ---- unbind + serialize/parse: el round-trip sigue siendo inverso tras quitar ----
function testUnbindSerializeParse(): void {
  const model = createInputModel();
  model.rebind('cancel', 'KeyQ'); // cancel ahora es Escape + KeyQ
  model.unbind('cancel', 'KeyQ'); // y volvemos a defaults
  const { bindings, fellBackToDefaults } = parseBindings(model.serialize());
  assert(fellBackToDefaults === false, 'unbind: un serialize propio nunca cae a los defaults');
  for (const action of ALL_ACTIONS) {
    const original = model.bindingsFor(action);
    const idaYVuelta = bindings[action];
    assert(
      idaYVuelta.length === original.length && original.every((code, i) => idaYVuelta[i] === code),
      `unbind: parse(serialize(x)) preserva ${action} tras quitar una tecla`,
    );
  }
  console.log('A3 input model: unbind y serialize/parse inversos OK');
}

// ---- serialize/parseBindings: parse(serialize(x)) equivalente a x ----
function testSerializeParseInversos(): void {
  const model = createInputModel();
  model.rebind('cancel', 'KeyQ'); // modificamos el estado para no probar solo el caso trivial de los defaults

  const serializado = model.serialize();
  const { bindings, fellBackToDefaults } = parseBindings(serializado);
  assert(fellBackToDefaults === false, 'parseBindings: un serialize propio nunca cae a los defaults');

  for (const action of ALL_ACTIONS) {
    const original = model.bindingsFor(action);
    const idaYVuelta = bindings[action];
    assert(
      idaYVuelta.length === original.length,
      `parse(serialize(x)) preserva la cantidad de teclas de ${action}`,
    );
    assert(
      original.every((code, i) => idaYVuelta[i] === code),
      `parse(serialize(x)) preserva el orden y contenido de ${action}`,
    );
  }

  console.log('A3 input model: parse(serialize(x)) equivalente a x OK');
}

// ---- parseBindings ante basura: nunca lanza, cae a los defaults y lo informa ----
function testParseBindingsBasura(): void {
  const casosBasura: Array<string | null> = [
    null,
    '',
    'esto no es json {{{',
    '{"up": "KeyW"}', // forma equivocada: el valor debería ser un array, no un string
    '["up", "down"]', // JSON válido, pero es un array en vez de un objeto
    JSON.stringify({
      up: ['KeyW'], down: ['KeyS'], left: ['KeyA'], right: ['KeyD'], action: ['Space'],
      // falta 'cancel': una acción faltante
    }),
    JSON.stringify({
      up: ['KeyW'], down: ['KeyS'], left: ['KeyA'], right: ['KeyD'], action: ['Space'], cancel: ['Escape'],
      saltar: ['Space'], // una acción que no existe
    }),
  ];

  for (let i = 0; i < casosBasura.length; i++) {
    const basura = casosBasura[i];
    let resultado: ReturnType<typeof parseBindings> | undefined;
    let lanzo = false;
    try {
      resultado = parseBindings(basura);
    } catch {
      lanzo = true;
    }
    assert(!lanzo, `parseBindings no lanza con el caso basura #${i}`);
    assert(
      resultado !== undefined && resultado.fellBackToDefaults === true,
      `parseBindings cae a los defaults e informa fellBackToDefaults con el caso basura #${i}`,
    );
  }

  console.log('A3 input model: parseBindings ante basura nunca lanza y cae a los defaults OK');
}

// ---- reset() y releaseAll() dejan el modelo como recién creado ----
function testResetYReleaseAll(): void {
  // releaseAll: solo suelta lo apretado, no toca bindings.
  const conCambios = createInputModel();
  conCambios.rebind('cancel', 'KeyQ');
  conCambios.press('ArrowUp');
  conCambios.pressAction('action');
  assert(
    conCambios.isDown('up') === true && conCambios.isDown('action') === true,
    'setup: hay algo apretado antes de releaseAll',
  );
  conCambios.releaseAll();
  for (const action of ALL_ACTIONS) {
    assert(conCambios.isDown(action) === false, `releaseAll: ${action} queda sin apretar, como un modelo recién creado`);
  }
  assert(
    conCambios.bindingsFor('cancel').includes('KeyQ'),
    'releaseAll: no toca los bindings, el rebind previo sigue en pie',
  );

  // reset: vuelve a DEFAULT_BINDINGS y también suelta todo.
  const fresco = createInputModel();
  const modelo = createInputModel();
  modelo.rebind('cancel', 'KeyQ');
  modelo.press('ArrowLeft');
  modelo.pressAction('cancel');
  modelo.reset();
  for (const action of ALL_ACTIONS) {
    const esperado = fresco.bindingsFor(action);
    const actual = modelo.bindingsFor(action);
    assert(
      actual.length === esperado.length && actual.every((code, i) => code === esperado[i]),
      `reset: bindings de ${action} vuelven a los defaults, igual que un modelo recién creado`,
    );
    assert(modelo.isDown(action) === false, `reset: ${action} queda sin apretar, como un modelo recién creado`);
  }

  console.log('A3 input model: reset y releaseAll dejan el modelo como recién creado OK');
}

function main(): void {
  testDefaultBindings();
  testActionFor();
  testPressRelease();
  testTactilYTecladoLlegAnALaMismaAccion();
  testMovementIntent();
  testRebindTeclaReservada();
  testRebindDuplicateBinding();
  testRebindOrphanAction();
  testRebindNoOpMismaAccion();
  testRebindExitoConTeclaLibre();
  testUnbindOrphanAction();
  testUnbindDuplicateBinding();
  testUnbindReservedKey();
  testUnbindNoOpTeclaLibre();
  testUnbindExito();
  testUnbindSerializeParse();
  testSerializeParseInversos();
  testParseBindingsBasura();
  testResetYReleaseAll();
  console.log('A3 input model tests: OK');
}

main();
