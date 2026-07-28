import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  base: '/',
  plugins: [
    {
      name: 'rewrite-jugar-dev',
      // En desarrollo: redirige /jugar/* a /src/jugar/* con 302, para que el
      // navegador quede en /src/jugar/ y los paths relativos del HTML
      // (p. ej. ../main.ts) resuelvan solos.
      // (en producción este rewrite lo hace _redirects, no tocar eso)
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          for (const p of ['/jugar', '/ohmdal']) {
            if (req.url === p || req.url?.startsWith(p + '/') || req.url?.startsWith(p + '?')) {
              const suffix = req.url.slice(p.length);
              res.statusCode = 302;
              res.setHeader('Location', `/src${p}${suffix || '/'}`);
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
      },
    },
  },
});
