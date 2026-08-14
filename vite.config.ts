import { defineConfig } from 'vite';
import { resolve } from 'path';
import fs from 'node:fs';

export default defineConfig({
  base: './',
  optimizeDeps: {
    exclude: ['@babylonjs/havok'],
  },
  plugins: [
    {
      name: 'havok-wasm',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url && req.url.includes('HavokPhysics.wasm')) {
            const wasmPath = resolve(__dirname, 'node_modules/@babylonjs/havok/lib/esm/HavokPhysics.wasm');
            res.setHeader('Content-Type', 'application/wasm');
            fs.createReadStream(wasmPath).pipe(res);
            return;
          }
          next();
        });
      },
      generateBundle() {
        const wasmPath = resolve(__dirname, 'node_modules/@babylonjs/havok/lib/esm/HavokPhysics.wasm');
        if (fs.existsSync(wasmPath)) {
          const wasmBuffer = fs.readFileSync(wasmPath);
          this.emitFile({
            type: 'asset',
            fileName: 'HavokPhysics.wasm',
            source: wasmBuffer,
          });
        }
      },
    },
    {
      name: 'rewrite-jugar-dev',
      // En desarrollo: redirige /jugar/* a /src/jugar/* con 302, para que el
      // navegador quede en /src/jugar/ y los paths relativos del HTML
      // (p ej. ../main.ts) resuelvan solos.
      // (en producción este rewrite lo hace _redirects, no tocar eso)
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          const destinos: Record<string, string> = {
            '/jugar': '/src/jugar/',
            '/ohmdal': '/src/ohmdal/',
            '/physica': '/src/experiences/physica/',
          };
          for (const [p, target] of Object.entries(destinos)) {
            if (req.url === p || req.url?.startsWith(p + '/') || req.url?.startsWith(p + '?')) {
              const suffix = req.url.slice(p.length).replace(/^\//, '');
              res.statusCode = 302;
              res.setHeader('Location', `${target}${suffix}`);
              res.end();
              return;
            }
          }
          next();
        });
      },
    },
  ],
  build: {
    chunkSizeWarningLimit: 2000,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        jugar: resolve(__dirname, 'src/jugar/index.html'),
        ohmdal: resolve(__dirname, 'src/ohmdal/index.html'),
        physica: resolve(__dirname, 'src/experiences/physica/index.html'),
      },
    },
  },
});
