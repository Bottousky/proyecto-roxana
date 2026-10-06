// Servidor estático mínimo para Arithmos. Sin dependencias.
// Uso: node scripts/serve.mjs [puerto]
import {createServer} from 'node:http';
import {readFile, stat} from 'node:fs/promises';
import {extname, join, normalize, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const port = Number(process.argv[2] || process.env.PORT || 4195);
const types = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8', '.woff2': 'font/woff2',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.txt': 'text/plain; charset=utf-8', '.md': 'text/plain; charset=utf-8',
};

export function startServer(p = port) {
  const server = createServer(async (req, res) => {
    try {
      const url = new URL(req.url, 'http://localhost');
      let path = normalize(decodeURIComponent(url.pathname)).replace(/^([/\\])+/, '');
      let file = join(root, path);
      if (!file.startsWith(root)) { res.writeHead(403).end(); return; }
      const info = await stat(file).catch(() => null);
      if (info?.isDirectory()) file = join(file, 'index.html');
      const body = await readFile(file);
      res.writeHead(200, {'content-type': types[extname(file)] || 'application/octet-stream', 'cache-control': 'no-store'});
      res.end(body);
    } catch {
      res.writeHead(404, {'content-type': 'text/plain; charset=utf-8'}).end('No encontrado');
    }
  });
  // si el puerto está ocupado, se rechaza (quien llama puede probar otro)
  return new Promise((ok, ko) => { server.once('error', ko); server.listen(p, '127.0.0.1', () => ok(server)); });
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await startServer();
  console.log(`Arithmos en http://127.0.0.1:${port}/`);
}
