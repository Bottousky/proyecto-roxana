import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  base: './',
  server: {
    // En desarrollo: reescribe /jugar/* a /src/jugar/*
    middlewares: [
      (req, res, next) => {
        if (req.url?.startsWith('/jugar')) {
          req.url = req.url.replace(/^\/jugar/, '/src/jugar');
        }
        next();
      },
    ],
  },
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
