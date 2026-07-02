import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  base: './',
  plugins: [
    {
      name: 'rewrite-jugar-dev',
      // En desarrollo: reescribe /jugar/* a /src/jugar/*
      // (en producción este rewrite lo hace _redirects, no tocar eso)
      configureServer(server) {
        server.middlewares.use((req, _res, next) => {
          if (req.url?.startsWith('/jugar')) {
            req.url = req.url.replace(/^\/jugar/, '/src/jugar');
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
      },
    },
  },
});
