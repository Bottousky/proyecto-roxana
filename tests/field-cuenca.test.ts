import { OhmFieldController } from '../src/jugar/field/ohmField.ts';
import { FrenoFieldController } from '../src/jugar/field/frenoField.ts';
import { PuertaFieldController } from '../src/jugar/field/puertaField.ts';
import { paresQueAbren } from '../src/puzzles/puertaModel.ts';

function equal<T>(actual: T, expected: T, label: string): void {
  if (actual !== expected) throw new Error(`${label}: esperado ${String(expected)}, recibido ${String(actual)}`);
}

{
  let solved = 0;
  const field = new OhmFieldController(() => { solved += 1; });
  field.interact('field-ohm-g3');
  equal(field.reading().state, 'abierto', 'el atajo partido no une');
  field.interact('field-ohm-lamp');
  field.interact('field-ohm-g1');
  field.interact('field-ohm-g4');
  field.interact('field-ohm-g5');
  equal(field.reading().state, 'cerrado', 'g1+g4+g5 cierran el camino');
  equal(solved, 1, 'Ohm despierta al cerrar con la lámpara designada');
  equal(field.active(), false, 'la sesión termina');
}

{
  let solved = 0;
  const field = new FrenoFieldController(() => { solved += 1; });
  field.interact('field-freno-lamp');
  field.interact('field-freno-piedra-amarilla');
  field.interact('field-freno-socket');
  field.energize();
  equal(solved, 1, 'la piedra amarilla da el río justo');
}

{
  const pairs = paresQueAbren();
  equal(pairs.length >= 2, true, 'la Puerta admite más de un par');
  for (const [fuente, piedra] of pairs) {
    let solved = 0;
    const field = new PuertaFieldController(() => { solved += 1; });
    field.interact('field-puerta-ojo');
    field.interact(`field-puerta-fuente-${fuente}`);
    field.interact(`field-puerta-piedra-${piedra}`);
    field.energize();
    equal(solved, 1, `abre con ${fuente}+${piedra}`);
  }
}

console.log('Field Cuenca: OK');
