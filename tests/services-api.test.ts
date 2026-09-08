import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { createRoxanaServer } from '../server/index.mjs';

const temp = mkdtempSync(join(tmpdir(), 'roxana-services-'));
const databasePath = join(temp, 'accounts.sqlite');
const staticRoot = join(temp, 'dist');
mkdirSync(join(staticRoot, 'src/jugar'), { recursive: true });
writeFileSync(join(staticRoot, 'index.html'), '<title>Instituto</title>');
writeFileSync(
  join(staticRoot, 'src/jugar/index.html'),
  '<title>Ohmdal</title>',
);
writeFileSync(join(temp, 'private.txt'), 'must never be served');
let server;
let origin;
async function start(extra = {}) {
  server = createRoxanaServer({ databasePath, staticRoot, ...extra });
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  origin = `http://127.0.0.1:${server.address().port}`;
}
async function stop() {
  await new Promise<void>((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
    server.closeAllConnections();
  });
}
function client() {
  let cookie = '',
    csrf = '';
  return {
    get cookie() {
      return cookie;
    },
    get csrf() {
      return csrf;
    },
    async request(path, method = 'GET', body?, extraHeaders = {}) {
      const headers = {
        ...(cookie ? { Cookie: cookie } : {}),
        ...(['GET', 'HEAD'].includes(method)
          ? {}
          : {
              Origin: origin,
              'Content-Type': 'application/json',
              'X-CSRF-Token': csrf,
            }),
        ...extraHeaders,
      };
      const response = await fetch(origin + path, {
        method,
        headers,
        body: body === undefined ? undefined : JSON.stringify(body),
      });
      const nextCookie = response.headers.get('set-cookie');
      if (nextCookie) cookie = nextCookie.split(';')[0];
      const data = await response.json();
      if (data.csrfToken) csrf = data.csrfToken;
      return { status: response.status, headers: response.headers, data };
    },
  };
}
try {
  await start();
  const alice = client(),
    bob = client();
  let result = await alice.request('/api/session');
  assert.equal(result.status, 200);
  assert.equal(result.data.user, null);
  assert.match(result.headers.get('set-cookie'), /HttpOnly; SameSite=Lax/u);
  assert.equal(result.headers.get('cache-control'), 'no-store');
  const anonymousCookie = alice.cookie,
    anonymousCsrf = alice.csrf;
  result = await alice.request(
    '/api/auth/register',
    'POST',
    {
      name: '  Alicia  ',
      email: 'ALICIA@example.test',
      password: 'correct horse battery',
    },
    { 'X-CSRF-Token': 'wrong' },
  );
  assert.equal(result.status, 403);
  result = await alice.request(
    '/api/auth/register',
    'POST',
    {
      name: 'Alicia',
      email: 'alicia@example.test',
      password: 'correct horse battery',
    },
    { Origin: 'https://evil.example' },
  );
  assert.equal(result.status, 403);
  result = await alice.request('/api/auth/register', 'POST', {
    name: 'Alicia',
    email: 'not-an-email',
    password: 'short',
  });
  assert.equal(result.status, 400);
  result = await alice.request('/api/auth/register', 'POST', {
    name: '  Alicia  ',
    email: 'ALICIA@example.test',
    password: 'correct horse battery',
  });
  assert.equal(result.status, 200);
  assert.equal(result.data.user.name, 'Alicia');
  assert.equal(result.data.user.email, 'alicia@example.test');
  assert.equal(result.data.user.newsletter, false);
  assert.notEqual(alice.cookie, anonymousCookie);
  assert.notEqual(alice.csrf, anonymousCsrf);
  assert.equal('password_hash' in result.data.user, false);
  const aliceId = result.data.user.id;
  result = await alice.request('/api/profile', 'PATCH', {
    name: 'Alicia Curiosa',
  });
  assert.equal(result.data.user.name, 'Alicia Curiosa');
  result = await alice.request('/api/profile', 'PATCH', {
    name: 'Alicia',
    email: 'injected@example.test',
  });
  assert.equal(result.status, 400);
  result = await alice.request('/api/newsletter', 'PUT', { subscribed: true });
  assert.equal(result.data.user.newsletter, true);
  assert.equal(result.data.delivery, 'not_sent');
  result = await alice.request('/api/library', 'PUT', {
    bookmarks: ['ley-de-ohm', 'circuitos', 'ley-de-ohm'],
    reading: { 'ley-de-ohm': 75, circuitos: 100 },
  });
  assert.deepEqual(result.data.bookmarks, ['ley-de-ohm', 'circuitos']);
  result = await alice.request('/api/library', 'PUT', {
    bookmarks: ['bad/key'],
    reading: {},
  });
  assert.equal(result.status, 400);
  result = await alice.request('/api/library', 'PUT', {
    bookmarks: [],
    reading: { circuitos: 101 },
  });
  assert.equal(result.status, 400);
  result = await alice.request('/api/progress', 'PUT', {
    achievements: ['primer-circuito', 'lectura-completa'],
  });
  assert.deepEqual(result.data.achievements, [
    'primer-circuito',
    'lectura-completa',
  ]);
  await bob.request('/api/session');
  result = await bob.request('/api/library');
  assert.equal(result.status, 401);
  result = await bob.request('/api/auth/register', 'POST', {
    name: 'Bruno',
    email: 'bruno@example.test',
    password: 'another strong password',
  });
  assert.equal(result.status, 200);
  result = await bob.request('/api/library');
  assert.deepEqual(result.data, { bookmarks: [], reading: {} });
  result = await bob.request('/api/progress');
  assert.deepEqual(result.data, { achievements: [] });
  const secondAlice = client();
  await secondAlice.request('/api/session');
  result = await secondAlice.request('/api/auth/login', 'POST', {
    email: 'alicia@example.test',
    password: 'this password is wrong',
  });
  assert.equal(result.status, 401);
  assert.equal(result.data.error.code, 'invalid_credentials');
  result = await secondAlice.request('/api/auth/login', 'POST', {
    email: 'missing@example.test',
    password: 'this password is wrong',
  });
  assert.equal(result.status, 401);
  assert.equal(result.data.error.code, 'invalid_credentials');
  result = await secondAlice.request('/api/auth/login', 'POST', {
    email: 'alicia@example.test',
    password: 'correct horse battery',
  });
  assert.equal(result.status, 200);
  result = await alice.request('/api/auth/password', 'POST', {
    currentPassword: 'wrong password again',
    newPassword: 'a better password next',
  });
  assert.equal(result.status, 401);
  result = await alice.request('/api/auth/password', 'POST', {
    currentPassword: 'correct horse battery',
    newPassword: 'a better password next',
  });
  assert.equal(result.status, 200);
  result = await secondAlice.request('/api/library');
  assert.equal(
    result.status,
    401,
    'password changes invalidate other sessions',
  );
  result = await alice.request('/api/auth/logout', 'POST', {});
  assert.equal(result.data.user, null);
  result = await alice.request('/api/library');
  assert.equal(result.status, 401);
  result = await alice.request('/api/auth/login', 'POST', {
    email: 'alicia@example.test',
    password: 'correct horse battery',
  });
  assert.equal(result.status, 401);
  result = await alice.request('/api/auth/login', 'POST', {
    email: 'alicia@example.test',
    password: 'a better password next',
  });
  assert.equal(result.status, 200);
  await stop();
  await start();
  result = await alice.request('/api/session');
  assert.equal(result.data.user.id, aliceId);
  assert.equal(result.data.user.name, 'Alicia Curiosa');
  assert.equal(result.data.user.newsletter, true);
  result = await alice.request('/api/library');
  assert.equal(result.data.reading['ley-de-ohm'], 75);
  result = await alice.request('/api/progress');
  assert.deepEqual(result.data.achievements, [
    'primer-circuito',
    'lectura-completa',
  ]);
  result = await alice.request('/api/newsletter', 'PUT', { subscribed: false });
  assert.equal(result.data.user.newsletter, false);
  result = await alice.request('/api/profile', 'PATCH', {
    name: 'x'.repeat(30_000),
  });
  assert.equal(result.status, 413);
  result = await alice.request('/api/session', 'GET', undefined, {
    'Sec-Fetch-Site': 'cross-site',
  });
  assert.equal(result.status, 403);
  result = await alice.request('/api/missing');
  assert.equal(result.status, 404);
  const home = await fetch(origin + '/');
  assert.match(await home.text(), /Instituto/u);
  const game = await fetch(origin + '/jugar?from=portal&room=plaza');
  assert.match(await game.text(), /Ohmdal/u);
  const missing = await fetch(origin + '/missing.js');
  assert.equal(missing.status, 404);
  const privateFile = await fetch(origin + '/%2e%2e%5cprivate.txt');
  assert.equal(privateFile.status, 404);
  const apiNotStatic = await fetch(origin + '/api/nonexistent');
  assert.equal(
    apiNotStatic.headers.get('content-type'),
    'application/json; charset=utf-8',
  );
  await stop();
  const inspection = new DatabaseSync(databasePath);
  const user = inspection
    .prepare('SELECT password_hash FROM users WHERE id=?')
    .get(aliceId);
  assert.equal(user.password_hash.includes('password'), false);
  assert.match(user.password_hash, /^[0-9a-f]{32}:[0-9a-f]{128}$/u);
  inspection.close();
  await start({ authLimit: 1 });
  const limited = client();
  await limited.request('/api/session');
  result = await limited.request('/api/auth/login', 'POST', {
    email: 'missing@example.test',
    password: 'invalid password here',
  });
  assert.equal(result.status, 401);
  result = await limited.request('/api/auth/login', 'POST', {
    email: 'missing@example.test',
    password: 'invalid password here',
  });
  assert.equal(result.status, 429);
  assert.equal(result.headers.get('retry-after'), '60');
  await stop();
  await start({ requestLimit: 2 });
  const spoof = client();
  result = await spoof.request('/api/session', 'GET', undefined, {
    'X-Forwarded-For': '203.0.113.10',
  });
  assert.equal(result.status, 200);
  result = await spoof.request('/api/session', 'GET', undefined, {
    'X-Forwarded-For': '203.0.113.11',
  });
  assert.equal(result.status, 200);
  result = await spoof.request('/api/session', 'GET', undefined, {
    'X-Forwarded-For': '203.0.113.12',
  });
  assert.equal(
    result.status,
    429,
    'untrusted peers cannot bypass quotas by spoofing forwarding headers',
  );
  await stop();
  await start({ requestLimit: 2, trustedProxies: ['127.0.0.1'] });
  const proxied = client();
  result = await proxied.request('/api/session', 'GET', undefined, {
    'X-Forwarded-For': '203.0.113.20',
  });
  assert.equal(result.status, 200);
  result = await proxied.request('/api/session', 'GET', undefined, {
    'X-Forwarded-For': '203.0.113.20',
  });
  assert.equal(result.status, 200);
  result = await proxied.request('/api/session', 'GET', undefined, {
    'X-Forwarded-For': '203.0.113.20',
  });
  assert.equal(result.status, 429);
  result = await proxied.request('/api/session', 'GET', undefined, {
    'X-Forwarded-For': '203.0.113.21',
  });
  assert.equal(
    result.status,
    200,
    'different clients behind a trusted peer have independent quotas',
  );
  result = await proxied.request('/api/session', 'GET', undefined, {
    'X-Forwarded-For': '198.51.100.1, 203.0.113.30',
  });
  assert.equal(result.status, 200);
  result = await proxied.request('/api/session', 'GET', undefined, {
    'X-Forwarded-For': '198.51.100.2, 203.0.113.30',
  });
  assert.equal(result.status, 200);
  result = await proxied.request('/api/session', 'GET', undefined, {
    'X-Forwarded-For': '198.51.100.3, 203.0.113.30',
  });
  assert.equal(
    result.status,
    429,
    'untrusted leftmost values cannot override the closest untrusted hop',
  );
  result = await proxied.request('/api/session', 'GET', undefined, {
    'X-Forwarded-For': 'invalid',
  });
  assert.equal(result.status, 200);
  result = await proxied.request('/api/session', 'GET', undefined, {
    'X-Forwarded-For': '203.0.113.40, malformed',
  });
  assert.equal(result.status, 200);
  result = await proxied.request('/api/session', 'GET', undefined, {
    'X-Forwarded-For': 'another-invalid-value',
  });
  assert.equal(
    result.status,
    429,
    'malformed headers fall back to the real peer',
  );
  await stop();
  process.stdout.write(
    'Roxana services: authentication, CSRF, persistence, isolation, password rotation, newsletter, library, rate limit and static routes OK\n',
  );
} finally {
  if (server?.listening) await stop();
  rmSync(temp, { recursive: true, force: true });
}
