// A2 — El laboratorio HD-2D se monta por `RuntimeHost` sin desplazar al runtime cenital.
//
// Corre en Node, sin DOM y sin WebGL: los runtimes son falsos y el host recibe un `hostEl`
// vacío. Este archivo NO importa `three` ni `hd2dRuntime.ts` — importarlos traería el motor
// al proceso de test y ocultaría justamente lo que hay que verificar, que el laboratorio se
// carga sólo bajo demanda.
import { readFileSync } from 'node:fs';
import { createRuntimeHost } from '../src/app/runtimeHost.ts';
import type {
  ExperienceRuntime,
  ExperienceRuntimeModule,
  RuntimeHandle,
  RuntimeLoaderMap,
} from '../src/experiences/types.ts';

function assert(condition: unknown, label: string): void {
  if (!condition) throw new Error(label);
}

function makeFakeRuntime(runtime: ExperienceRuntime, calls: string[]): ExperienceRuntimeModule {
  return {
    runtime,
    async mount() {
      calls.push(`mount:${runtime}`);
      const handle: RuntimeHandle = {
        async travelTo(destination) {
          calls.push(`travelTo:${runtime}:${destination.roomId ?? ''}`);
        },
        snapshot() {
          calls.push(`snapshot:${runtime}`);
          return { runtime, data: { marker: runtime } };
        },
        pause() {
          calls.push(`pause:${runtime}`);
        },
        resume() {
          calls.push(`resume:${runtime}`);
        },
        async destroy() {
          calls.push(`destroy:${runtime}`);
        },
      };
      return handle;
    },
  };
}

/** Loaders falsos para los cinco runtimes, contando llamadas para verificar el caché. */
function makeLoaders(calls: string[]): { loaders: RuntimeLoaderMap; counts: Record<string, number> } {
  const counts: Record<string, number> = { 'topdown-phaser': 0, 'hd2d-three': 0 };
  const unused = (runtime: ExperienceRuntime): (() => Promise<ExperienceRuntimeModule>) => {
    return async () => {
      throw new Error(`loader no usado en este test: ${runtime}`);
    };
  };
  const topdown = makeFakeRuntime('topdown-phaser', calls);
  const hd2d = makeFakeRuntime('hd2d-three', calls);

  const loaders: RuntimeLoaderMap = {
    'topdown-phaser': async () => {
      counts['topdown-phaser'] += 1;
      return topdown;
    },
    'hd2d-three': async () => {
      counts['hd2d-three'] += 1;
      return hd2d;
    },
    'dataflow-phaser': unused('dataflow-phaser'),
    'platformer-phaser': unused('platformer-phaser'),
    'cosmos-web': unused('cosmos-web'),
  };

  return { loaders, counts };
}

// ---- Caso 1: la ubicación con `runtime` gana sobre el manifest ----
async function testOverrideMonta(): Promise<void> {
  const calls: string[] = [];
  const { loaders } = makeLoaders(calls);
  const host = createRuntimeHost({} as HTMLElement, loaders);

  await host.start({ experienceId: 'ohmdal', roomId: 'plaza', runtime: 'hd2d-three' });

  assert(host.activeRuntime() === 'hd2d-three', 'el override monta el laboratorio');
  assert(calls.includes('mount:hd2d-three'), 'se montó el runtime del laboratorio');
  assert(!calls.includes('mount:topdown-phaser'), 'el runtime cenital no se montó');

  console.log('A2 hd2d runtime: override de ubicación OK');
}

// ---- Caso 2: sin `runtime`, Ohmdal sigue montando lo que dice su manifest ----
async function testSinOverrideNoCambiaNada(): Promise<void> {
  const calls: string[] = [];
  const { loaders } = makeLoaders(calls);
  const host = createRuntimeHost({} as HTMLElement, loaders);

  await host.start({ experienceId: 'ohmdal', roomId: 'plaza' });

  assert(host.activeRuntime() === 'topdown-phaser', 'sin override gana el manifest de Ohmdal');
  assert(!calls.includes('mount:hd2d-three'), 'el laboratorio no se monta por accidente');

  console.log('A2 hd2d runtime: sin override el juego publicado no cambia OK');
}

// ---- Caso 3: cruzar de runtime respeta snapshot → destroy → mount ----
async function testCruceDeRuntime(): Promise<void> {
  const calls: string[] = [];
  const { loaders } = makeLoaders(calls);
  const host = createRuntimeHost({} as HTMLElement, loaders);

  await host.start({ experienceId: 'ohmdal', roomId: 'plaza', runtime: 'hd2d-three' });
  await host.travel({ experienceId: 'ohmdal', roomId: 'plaza' });

  const idxSnapshot = calls.indexOf('snapshot:hd2d-three');
  const idxDestroy = calls.indexOf('destroy:hd2d-three');
  const idxMount = calls.indexOf('mount:topdown-phaser');

  assert(idxSnapshot !== -1 && idxDestroy !== -1 && idxMount !== -1, 'las tres llamadas ocurrieron');
  assert(idxSnapshot < idxDestroy, 'el snapshot se toma antes de destruir');
  assert(idxDestroy < idxMount, 'el runtime anterior se destruye antes de montar el siguiente');
  assert(host.activeRuntime() === 'topdown-phaser', 'quedó activo el runtime destino');

  const snap = host.lastSnapshot('hd2d-three');
  assert(snap !== undefined && snap.data.marker === 'hd2d-three', 'el snapshot del laboratorio quedó guardado');

  console.log('A2 hd2d runtime: cruce snapshot → destroy → mount OK');
}

// ---- Caso 4: viajar dentro del mismo override no desmonta, y el loader se cachea ----
async function testMismoRuntimeYCache(): Promise<void> {
  const calls: string[] = [];
  const { loaders, counts } = makeLoaders(calls);
  const host = createRuntimeHost({} as HTMLElement, loaders);

  await host.start({ experienceId: 'ohmdal', roomId: 'plaza', runtime: 'hd2d-three' });
  await host.travel({ experienceId: 'ohmdal', roomId: 'taller', runtime: 'hd2d-three' });

  assert(!calls.includes('destroy:hd2d-three'), 'viajar dentro del mismo runtime no desmonta');
  assert(calls.includes('travelTo:hd2d-three:taller'), 'el viaje delegó en travelTo');

  // Ida y vuelta: el loader del laboratorio no debe volver a llamarse.
  await host.travel({ experienceId: 'ohmdal', roomId: 'plaza' });
  await host.travel({ experienceId: 'ohmdal', roomId: 'plaza', runtime: 'hd2d-three' });

  assert(counts['hd2d-three'] === 1, 'el loader del laboratorio se llamó una sola vez');
  assert(counts['topdown-phaser'] === 1, 'el loader del runtime cenital se llamó una sola vez');

  console.log('A2 hd2d runtime: same-runtime y caché de loader OK');
}

// ---- Caso 5: `hd2dRuntime` entra sólo por import() dinámico ----
function testLaboratorioFueraDelGrafoEstatico(): void {
  const loadersPath = new URL('../src/experiences/loaders.ts', import.meta.url);
  const source = readFileSync(loadersPath, 'utf8');

  // Un `import ... from` de nivel superior traería `three` al bundle de arranque del shell.
  const staticImports = source.match(/^\s*import\s[^(]*from\s+['"][^'"]+['"]/gm) ?? [];
  const staticNames = staticImports.join('\n');

  assert(!staticNames.includes('hd2dRuntime'), 'hd2dRuntime no se importa estáticamente en loaders.ts');
  assert(!staticNames.includes('lab.ts'), 'el laboratorio no se importa estáticamente en loaders.ts');
  assert(!/^\s*import\s[^(]*['"]three['"]/m.test(source), 'loaders.ts no importa three');
  assert(
    /'hd2d-three':\s*\(\)\s*=>\s*import\(/.test(source),
    "la entrada 'hd2d-three' de loaders.ts es un import() dinámico",
  );

  // Y el host tampoco debe conocer runtimes concretos.
  const hostSource = readFileSync(new URL('../src/app/runtimeHost.ts', import.meta.url), 'utf8');
  assert(!hostSource.includes('hd2dRuntime'), 'runtimeHost.ts no nombra al laboratorio');
  assert(!hostSource.includes("'three'"), 'runtimeHost.ts no importa three');

  console.log('A2 hd2d runtime: el laboratorio queda fuera del grafo estático OK');
}

async function main(): Promise<void> {
  await testOverrideMonta();
  await testSinOverrideNoCambiaNada();
  await testCruceDeRuntime();
  await testMismoRuntimeYCache();
  testLaboratorioFueraDelGrafoEstatico();
  console.log('A2 hd2d runtime tests: OK');
}

await main();
