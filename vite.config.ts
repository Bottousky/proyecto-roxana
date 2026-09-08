import { defineConfig, type PreviewServer, type ViteDevServer } from 'vite';
import { resolve } from 'path';
import fs from 'node:fs';

// Keep the same playable entry points in development and a local production preview.
function installEntryRoutes(server: ViteDevServer | PreviewServer): void {
  server.middlewares.use((req, res, next) => {
    const destinations: Record<string, string> = {
      '/jugar': '/src/jugar/',
      '/physica': '/src/experiences/physica/',
      '/ohmdal-plaza': '/src/experiences/ohmdal-plaza/',
      '/ohmdal-playcanvas': '/src/experiences/ohmdal-playcanvas/',
    };
    for (const [path, target] of Object.entries(destinations)) {
      if (req.url === path || req.url?.startsWith(path + '/') || req.url?.startsWith(path + '?')) {
        const suffix = req.url.slice(path.length).replace(/^\//, '');
        res.statusCode = 302;
        res.setHeader('Location', `${target}${suffix}`);
        res.end();
        return;
      }
    }
    next();
  });
}

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
      name: 'playable-entry-routes',
      configureServer: installEntryRoutes,
      configurePreviewServer: installEntryRoutes,
      generateBundle() {
        this.emitFile({ type: 'asset', fileName: '_redirects', source: fs.readFileSync(resolve(__dirname, '_redirects'), 'utf8') });
      },
    },
  ],
  build: {
    chunkSizeWarningLimit: 2000,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        jugar: resolve(__dirname, 'src/jugar/index.html'),
        physica: resolve(__dirname, 'src/experiences/physica/index.html'),
        plaza: resolve(__dirname, 'src/experiences/ohmdal-plaza/index.html'),
        playcanvas: resolve(__dirname, 'src/experiences/ohmdal-playcanvas/index.html'),
      },
    },
  },
});
