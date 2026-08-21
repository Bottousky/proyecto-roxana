import { createRuntimeHost } from '../src/app/runtimeHost.ts';
import type {
  ExperienceRuntime,
  ExperienceRuntimeModule,
  RuntimeContext,
  RuntimeHandle,
  RuntimeLoaderMap,
  RuntimeSnapshot,
} from '../src/experiences/types.ts';

function assert(condition: unknown, label: string): void {
  if (!condition) throw new Error(label);
}

async function assertRejects(promise: Promise<unknown>, label: string): Promise<void> {
  let rejected = false;
  try {
    await promise;
  } catch {
    rejected = true;
  }
  assert(rejected, label);
}

// Fábrica de runtimes falsos: registran cada llamada en `calls` para poder
// hacer asserts de orden y de conteo (cache de loaders, etc).
function makeFakeRuntime(runtime: ExperienceRuntime, calls: string[]): {
  module: ExperienceRuntimeModule;
  loaderCalls: number[];
} {
  const state = { loaderCalls: 0 };
  let lastContext: RuntimeContext | null = null;

  const module: ExperienceRuntimeModule = {
    runtime,
    async mount(_host, context) {
      calls.push(`mount:${runtime}`);
      lastContext = context;
      const handle: RuntimeHandle = {
        async travelTo(destination) {
          calls.push(`travelTo:${runtime}:${destination.roomId ?? ''}`);
        },
        snapshot(): RuntimeSnapshot {
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
      void lastContext;
      return handle;
    },
  };

  return { module, loaderCalls: [state.loaderCalls] };
}

// ---- Caso 1, 2, 3, 4: flujo normal con dos runtimes falsos ----
async function testFlujoNormal(): Promise<void> {
  const calls: string[] = [];
  let loaderCallsTopdown = 0;
  let loaderCallsDataflow = 0;

  const { module: topdownModule } = makeFakeRuntime('topdown-phaser', calls);
  const { module: dataflowModule } = makeFakeRuntime('dataflow-phaser', calls);

  const loaders: RuntimeLoaderMap = {
    'topdown-phaser': async () => {
      loaderCallsTopdown++;
      return topdownModule;
    },
    'platformer-three': async () => {
      throw new Error('no usado');
    },
    'platformer-babylon': async () => {
      throw new Error('no usado');
    },
    'dataflow-phaser': async () => {
      loaderCallsDataflow++;
      return dataflowModule;
    },
    'platformer-phaser': async () => {
      throw new Error('no usado en este test');
    },
    'cosmos-web': async () => {
      throw new Error('no usado en este test');
    },
  };

  const hostEl = {} as HTMLElement;
  const host = createRuntimeHost(hostEl, loaders);

  // 1. start monta topdown-phaser (ohmdal)
  await host.start({ experienceId: 'ohmdal', roomId: 'plaza' });
  assert(host.activeRuntime() === 'topdown-phaser', 'start monta el runtime de ohmdal');
  assert(calls.includes('mount:topdown-phaser'), 'el mount del runtime fue llamado');

  // 2. travel same-runtime (ohmdal, roomId plaza) -> travelTo, NO destroy
  const callsBeforeTravel = calls.length;
  await host.travel({ experienceId: 'ohmdal', roomId: 'plaza' });
  const callsDuringTravel = calls.slice(callsBeforeTravel);
  assert(
    callsDuringTravel.includes('travelTo:topdown-phaser:plaza'),
    'travel same-runtime delega en travelTo',
  );
  assert(
    !callsDuringTravel.includes('destroy:topdown-phaser'),
    'travel same-runtime no destruye el runtime',
  );

  // 3. travel a bitland -> orden estricto snapshot -> destroy -> mount
  await host.travel({ experienceId: 'bitland' });
  const idxSnapshot = calls.indexOf('snapshot:topdown-phaser');
  const idxDestroy = calls.indexOf('destroy:topdown-phaser');
  const idxMountDataflow = calls.indexOf('mount:dataflow-phaser');
  assert(idxSnapshot !== -1 && idxDestroy !== -1 && idxMountDataflow !== -1, 'las tres llamadas ocurrieron');
  assert(idxSnapshot < idxDestroy && idxDestroy < idxMountDataflow, 'orden estricto snapshot -> destroy -> mount');
  assert(host.activeRuntime() === 'dataflow-phaser', 'el runtime activo es ahora dataflow-phaser');
  const snap = host.lastSnapshot('topdown-phaser');
  assert(snap !== undefined && snap.data.marker === 'topdown-phaser', 'lastSnapshot devuelve el snapshot capturado');

  // 4. volver a ohmdal -> el loader de topdown-phaser se llamó UNA sola vez en total
  await host.travel({ experienceId: 'ohmdal', roomId: 'plaza' });
  assert(host.activeRuntime() === 'topdown-phaser', 'volvimos a topdown-phaser');
  assert(loaderCallsTopdown === 1, 'el loader de topdown-phaser se cacheó: una sola llamada en total');
  assert(loaderCallsDataflow === 1, 'el loader de dataflow-phaser se llamó una sola vez');

  console.log('A1 runtime host: flujo normal OK');
}

// ---- Caso 5: requestTravel recibido por un módulo falso viaja de verdad (cross-runtime) ----
async function testRequestTravel(): Promise<void> {
  const calls: string[] = [];
  let requestTravelPromise: Promise<void> | null = null;

  const topdownModule: ExperienceRuntimeModule = {
    runtime: 'topdown-phaser',
    async mount(_host, context) {
      calls.push('mount:topdown-phaser');
      const handle: RuntimeHandle = {
        async travelTo() {
          calls.push('travelTo:topdown-phaser');
        },
        snapshot() {
          return { runtime: 'topdown-phaser', data: {} };
        },
        pause() {},
        resume() {},
        async destroy() {
          calls.push('destroy:topdown-phaser');
        },
      };
      // simulamos que el propio runtime pide, una única vez, un viaje cross-runtime al shell
      requestTravelPromise = context.requestTravel({ experienceId: 'bitland' }).then(() => {
        calls.push('requestTravel:resuelto');
      });
      return handle;
    },
  };

  const dataflowModule: ExperienceRuntimeModule = {
    runtime: 'dataflow-phaser',
    async mount() {
      calls.push('mount:dataflow-phaser');
      const handle: RuntimeHandle = {
        async travelTo() {},
        snapshot() {
          return { runtime: 'dataflow-phaser', data: {} };
        },
        pause() {},
        resume() {},
        async destroy() {
          calls.push('destroy:dataflow-phaser');
        },
      };
      return handle;
    },
  };

  const loaders: RuntimeLoaderMap = {
    'topdown-phaser': async () => topdownModule,
    'platformer-three': async () => {
      throw new Error('no usado');
    },
    'platformer-babylon': async () => {
      throw new Error('no usado');
    },
    'dataflow-phaser': async () => dataflowModule,
    'platformer-phaser': async () => {
      throw new Error('no usado');
    },
    'cosmos-web': async () => {
      throw new Error('no usado');
    },
  };

  const host = createRuntimeHost({} as HTMLElement, loaders);
  await host.start({ experienceId: 'ohmdal', roomId: 'plaza' });

  // Esperar a que la cola interna del host procese el requestTravel encolado por el mount.
  assert(requestTravelPromise !== null, 'el mount disparó el requestTravel');
  await requestTravelPromise;

  assert(calls.includes('mount:dataflow-phaser'), 'requestTravel disparó un cross-runtime real');
  assert(host.activeRuntime() === 'dataflow-phaser', 'el host viajó de verdad al runtime pedido por requestTravel');

  console.log('A1 runtime host: requestTravel OK');
}

// ---- Caso 6: loader que rechaza -> travel rechaza y activeRuntime() === null ----
async function testLoaderRechaza(): Promise<void> {
  const calls: string[] = [];
  const { module: topdownModule } = makeFakeRuntime('topdown-phaser', calls);

  const loaders: RuntimeLoaderMap = {
    'topdown-phaser': async () => topdownModule,
    'platformer-three': async () => {
      throw new Error('no usado');
    },
    'platformer-babylon': async () => {
      throw new Error('no usado');
    },
    'dataflow-phaser': async () => {
      throw new Error('loader roto');
    },
    'platformer-phaser': async () => {
      throw new Error('no usado');
    },
    'cosmos-web': async () => {
      throw new Error('no usado');
    },
  };

  const host = createRuntimeHost({} as HTMLElement, loaders);
  await host.start({ experienceId: 'ohmdal', roomId: 'plaza' });

  await assertRejects(host.travel({ experienceId: 'bitland' }), 'travel rechaza si el loader falla');
  assert(host.activeRuntime() === null, 'activeRuntime queda null tras el fallo cross-runtime');

  console.log('A1 runtime host: loader que rechaza OK');
}

// ---- Caso 7: start dos veces -> lanza ----
async function testStartDosVeces(): Promise<void> {
  const calls: string[] = [];
  const { module: topdownModule } = makeFakeRuntime('topdown-phaser', calls);

  const loaders: RuntimeLoaderMap = {
    'topdown-phaser': async () => topdownModule,
    'platformer-three': async () => {
      throw new Error('no usado');
    },
    'platformer-babylon': async () => {
      throw new Error('no usado');
    },
    'dataflow-phaser': async () => {
      throw new Error('no usado');
    },
    'platformer-phaser': async () => {
      throw new Error('no usado');
    },
    'cosmos-web': async () => {
      throw new Error('no usado');
    },
  };

  const host = createRuntimeHost({} as HTMLElement, loaders);
  await host.start({ experienceId: 'ohmdal', roomId: 'plaza' });
  await assertRejects(host.start({ experienceId: 'ohmdal', roomId: 'plaza' }), 'start sobre host ya activo lanza');

  console.log('A1 runtime host: start dos veces OK');
}

async function main(): Promise<void> {
  await testFlujoNormal();
  await testRequestTravel();
  await testLoaderRechaza();
  await testStartDosVeces();
  console.log('A1 runtime host tests: OK');
}

await main();
