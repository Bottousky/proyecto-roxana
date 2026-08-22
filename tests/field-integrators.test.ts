import { DistributorFieldController } from '../src/jugar/field/distributorField.ts';
import { ForgeFieldController } from '../src/jugar/field/forgeField.ts';
import { LighthouseFieldController } from '../src/jugar/field/lighthouseField.ts';

function equal<T>(actual: T, expected: T, label: string): void {
  if (actual !== expected) throw new Error(`${label}: esperado ${JSON.stringify(expected)}, recibido ${JSON.stringify(actual)}`);
}

{
  let solved = 0;
  const field = new DistributorFieldController(() => { solved += 1; });
  field.interact('field-dist-lamp-0');
  field.interact('field-dist-d0');
  field.interact('field-dist-d0');
  field.interact('field-dist-d1');
  field.interact('field-dist-d1');
  field.interact('field-dist-d1');
  field.interact('field-dist-push-8');
  equal(field.snapshot().districts[0].river, 4, 'distrito 0 en 4');
  equal(field.snapshot().districts[1].river, 2, 'distrito 1 en 2');
  equal(field.snapshot().districts[2].river, 1, 'distrito 2 ya en 1 con gris');
  equal(solved, 1, 'tres barrios en zona');
}

{
  let solved = 0;
  const alt = new DistributorFieldController(() => { solved += 1; });
  alt.interact('field-dist-lamp-1');
  alt.interact('field-dist-push-4');
  alt.interact('field-dist-d0');
  alt.interact('field-dist-d1');
  alt.interact('field-dist-d1');
  alt.interact('field-dist-d2');
  alt.interact('field-dist-d2');
  alt.interact('field-dist-d2');
  equal(alt.snapshot().alternativeSolution, true, 'solución alternativa con Empuje 4');
  equal(solved, 1, 'también cierra');
}

{
  let solved = 0;
  const field = new ForgeFieldController(() => { solved += 1; });
  field.interact('field-forge-martillo');
  field.interact('field-forge-push-8');
  field.interact('field-forge-piedra-roja');
  field.interact('field-forge-camino-ancho');
  field.interact('field-forge-fuse-8');
  field.interact('field-forge-fuelle');
  field.interact('field-forge-piedra-amarilla');
  field.interact('field-forge-camino-medio');
  field.interact('field-forge-fuse-4');
  field.interact('field-forge-lumbre');
  field.interact('field-forge-piedra-gris');
  field.interact('field-forge-camino-angosto');
  field.interact('field-forge-fuse-2');
  field.energize();
  equal(solved, 1, 'la nave cierra con entrega 32/16/8');
}

{
  let solved = 0;
  const field = new LighthouseFieldController(() => { solved += 1; });
  field.interact('field-lh-senal');
  field.interact('field-lh-toggle');
  field.energize();
  equal(field.snapshot().phase, 2, 'comisión 1 con Tronco amplio');
  equal(solved, 0, 'hace falta otra firma');
  for (const service of ['lente', 'reloj', 'senal'] as const) {
    field.interact(`field-lh-${service}`);
    field.interact('field-lh-piedra-12');
  }
  field.energize();
  equal(solved, 1, 'transferencia con menos margen y otra firma');
}

console.log('Field Castillo/Forja/Faro: OK');
