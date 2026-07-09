// Hook de resolución de módulos SOLO para tests: src/**/*.ts usa imports
// relativos sin extensión (estilo Vite/bundler, ej. `from '../state'`), lo
// cual Node ESM no resuelve por sí solo. Este hook intenta `${specifier}.ts`
// y `${specifier}/index.ts` antes de rendirse. No toca ningún archivo de
// src/: solo cambia cómo Node busca los módulos al correr un test.
export async function resolve(specifier, context, nextResolve) {
  const lastSegment = specifier.split('/').pop() ?? '';
  const looksExtensionless = specifier.startsWith('.') && !/\.[a-zA-Z0-9]+$/.test(lastSegment);
  if (looksExtensionless) {
    for (const suffix of ['.ts', '/index.ts']) {
      try {
        return await nextResolve(specifier + suffix, context);
      } catch (err) {
        if (err?.code !== 'ERR_MODULE_NOT_FOUND') throw err;
      }
    }
  }
  return nextResolve(specifier, context);
}
