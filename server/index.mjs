import { createServer } from 'node:http';
import { createReadStream, existsSync, statSync } from 'node:fs';
import { resolve, extname, sep } from 'node:path';
import { pathToFileURL } from 'node:url';
import { createRoxanaApi } from './api.mjs';

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.wasm': 'application/wasm',
  '.glb': 'model/gltf-binary',
  '.gltf': 'model/gltf+json',
  '.mp3': 'audio/mpeg',
  '.ogg': 'audio/ogg',
  '.wav': 'audio/wav',
  '.mp4': 'video/mp4',
};
const ROUTES = {
  '/jugar': '/src/jugar/',
  '/physica': '/src/experiences/physica/',
  '/ohmdal-plaza': '/src/experiences/ohmdal-plaza/',
  '/ohmdal-playcanvas': '/src/experiences/ohmdal-playcanvas/',
};
export function createRoxanaServer(options = {}) {
  const root = resolve(options.staticRoot ?? 'dist');
  const api = createRoxanaApi(options);
  const server = createServer(async (req, res) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'same-origin');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    if (await api.handle(req, res)) return;
    if (!['GET', 'HEAD'].includes(req.method)) {
      res.writeHead(405, { Allow: 'GET, HEAD' });
      res.end();
      return;
    }
    let pathname;
    try {
      pathname = decodeURIComponent(
        new URL(req.url, 'http://localhost').pathname,
      );
    } catch {
      res.writeHead(400);
      res.end();
      return;
    }
    for (const [route, target] of Object.entries(ROUTES))
      if (pathname === route || pathname.startsWith(`${route}/`)) {
        pathname = target + pathname.slice(route.length).replace(/^\//u, '');
        break;
      }
    // Resolve only public build files. Unknown file paths never fall back to the application HTML.
    const segments = pathname.split('/');
    if (
      segments.some((part) => part.startsWith('.') || part.includes('\\')) ||
      pathname.includes('\0')
    ) {
      res.writeHead(404);
      res.end();
      return;
    }
    let file = resolve(root, `.${pathname}`);
    if (file !== root && !file.startsWith(root + sep)) {
      res.writeHead(404);
      res.end();
      return;
    }
    try {
      if (existsSync(file) && statSync(file).isDirectory())
        file = resolve(file, 'index.html');
      if (!existsSync(file)) {
        if (extname(pathname)) {
          res.writeHead(404);
          res.end();
          return;
        }
        file = resolve(root, 'index.html');
      }
      const stat = statSync(file);
      res.setHeader(
        'Content-Type',
        MIME[extname(file).toLowerCase()] ?? 'application/octet-stream',
      );
      res.setHeader(
        'Cache-Control',
        file.endsWith('.html')
          ? 'no-cache'
          : pathname.startsWith('/assets/')
            ? 'public, max-age=31536000, immutable'
            : 'public, max-age=3600',
      );
      res.setHeader('Content-Length', stat.size);
      if (req.method === 'HEAD') res.end();
      else
        createReadStream(file)
          .on('error', () => res.destroy())
          .pipe(res);
    } catch {
      res.writeHead(404);
      res.end(
        'Archivo no encontrado. Ejecutá npm run build antes de iniciar el servidor.',
      );
    }
  });
  server.on('close', () => api.close());
  server.requestTimeout = 15_000;
  server.headersTimeout = 10_000;
  return server;
}
if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href
) {
  const host = process.env.HOST ?? '127.0.0.1';
  const port = Number(process.env.PORT ?? 4173);
  if (
    host !== '127.0.0.1' &&
    host !== 'localhost' &&
    !process.env.ROXANA_PUBLIC_ORIGIN
  )
    throw new Error(
      'ROXANA_PUBLIC_ORIGIN es obligatorio al escuchar fuera de localhost.',
    );
  const server = createRoxanaServer();
  server.listen(port, host, () =>
    process.stdout.write(`Instituto Roxana: http://${host}:${port}\n`),
  );
  for (const signal of ['SIGTERM', 'SIGINT'])
    process.on(signal, () => {
      server.close(() => process.exit(0));
    });
}
