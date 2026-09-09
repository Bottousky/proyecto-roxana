import { DatabaseSync } from 'node:sqlite';
import {
  randomBytes,
  createHash,
  scrypt as rawScrypt,
  timingSafeEqual,
} from 'node:crypto';
import { promisify } from 'node:util';
import { isIP } from 'node:net';
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const scrypt = promisify(rawScrypt);
const COOKIE = 'roxana_session';
const DAY = 86_400_000;
const MAX_BODY = 24 * 1024;
const digest = (value) => createHash('sha256').update(value).digest('hex');
const randomToken = () => randomBytes(32).toString('base64url');
class ApiError extends Error {
  constructor(status, code, message) {
    super(message);
    this.status = status;
    this.code = code;
  }
}
const bad = (message = 'Revisá los datos ingresados.') => {
  throw new ApiError(400, 'invalid_input', message);
};
const isObject = (value) =>
  value !== null && typeof value === 'object' && !Array.isArray(value);
function fields(value, allowed) {
  if (
    !isObject(value) ||
    Object.keys(value).some((key) => !allowed.includes(key))
  )
    bad();
}
function nameValue(value) {
  if (typeof value !== 'string') bad();
  const name = value.trim();
  if (
    name.length < 2 ||
    name.length > 60 ||
    /[\u0000-\u001f\u007f]/u.test(name)
  )
    bad('El nombre debe tener entre 2 y 60 caracteres.');
  return name;
}
function emailValue(value) {
  if (typeof value !== 'string') bad();
  const email = value.trim().toLowerCase();
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/u.test(email))
    bad('Ingresá un correo válido.');
  return email;
}
function passwordValue(value) {
  if (typeof value !== 'string' || value.length < 10 || value.length > 128)
    bad('La contraseña debe tener entre 10 y 128 caracteres.');
  return value;
}
function ids(value) {
  if (
    !Array.isArray(value) ||
    value.length > 100 ||
    value.some(
      (id) => typeof id !== 'string' || !/^[a-z][a-z0-9-]{1,79}$/u.test(id),
    )
  )
    bad();
  return [...new Set(value)];
}
async function hashPassword(password, salt = randomBytes(16).toString('hex')) {
  const hash = await scrypt(password, salt, 64, {
    N: 32768,
    r: 8,
    p: 1,
    maxmem: 64 * 1024 * 1024,
  });
  return `${salt}:${hash.toString('hex')}`;
}
async function checkPassword(password, stored) {
  const [salt, expected] = stored.split(':');
  const actual = (await hashPassword(password, salt)).split(':')[1];
  return timingSafeEqual(
    Buffer.from(actual, 'hex'),
    Buffer.from(expected, 'hex'),
  );
}
function readBody(req) {
  return new Promise((resolveBody, reject) => {
    let size = 0;
    const chunks = [];
    let failed = false;
    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > MAX_BODY) {
        if (!failed)
          reject(
            new ApiError(
              413,
              'body_too_large',
              'La solicitud es demasiado grande.',
            ),
          );
        failed = true;
        return;
      }
      if (!failed) chunks.push(chunk);
    });
    req.on('end', () => {
      if (failed) return;
      try {
        resolveBody(JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}'));
      } catch {
        reject(
          new ApiError(
            400,
            'invalid_json',
            'La solicitud no contiene JSON válido.',
          ),
        );
      }
    });
    req.on('error', reject);
  });
}

/** A standalone Connect-compatible API. No browser credentials or server modules enter the client bundle. */
export function createRoxanaApi(options = {}) {
  const databasePath =
    options.databasePath ??
    process.env.ROXANA_DB_PATH ??
    resolve('output/server/roxana.sqlite');
  if (databasePath !== ':memory:')
    mkdirSync(dirname(databasePath), { recursive: true });
  const db = new DatabaseSync(databasePath);
  db.exec(`PRAGMA foreign_keys=ON; PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000;
    CREATE TABLE IF NOT EXISTS users(id TEXT PRIMARY KEY,name TEXT NOT NULL,email TEXT NOT NULL UNIQUE,password_hash TEXT NOT NULL,newsletter INTEGER NOT NULL DEFAULT 0,newsletter_updated_at INTEGER,created_at INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS sessions(token_hash TEXT PRIMARY KEY,user_id TEXT REFERENCES users(id) ON DELETE CASCADE,csrf TEXT NOT NULL,expires_at INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS library(user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,bookmarks TEXT NOT NULL DEFAULT '[]',reading TEXT NOT NULL DEFAULT '{}');
    CREATE TABLE IF NOT EXISTS progress(user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,achievements TEXT NOT NULL DEFAULT '[]');`);
  const publicOrigin = options.publicOrigin ?? process.env.ROXANA_PUBLIC_ORIGIN;
  const canonicalOrigin = publicOrigin ? new URL(publicOrigin).origin : null;
  const normalizeIp = (ip) =>
    ip.toLowerCase().replace(/^::ffff:(?=\d+\.)/u, '');
  const proxyConfig =
    options.trustedProxies ??
    (process.env.ROXANA_TRUSTED_PROXIES ?? '')
      .split(',')
      .map((ip) => ip.trim())
      .filter(Boolean);
  if (
    !Array.isArray(proxyConfig) ||
    proxyConfig.some((ip) => typeof ip !== 'string' || !isIP(ip))
  )
    throw new Error(
      'ROXANA_TRUSTED_PROXIES debe contener sólo direcciones IP explícitas separadas por comas.',
    );
  const trustedProxies = new Set(proxyConfig.map(normalizeIp));
  function clientAddress(req) {
    const peer = normalizeIp(req.socket.remoteAddress ?? 'unknown');
    const forwarded = req.headers['x-forwarded-for'];
    // Ignore client-supplied forwarding headers unless the actual connection peer is explicitly trusted.
    if (
      !trustedProxies.has(peer) ||
      typeof forwarded !== 'string' ||
      forwarded.length > 1024
    )
      return peer;
    const chain = forwarded.split(',').map((ip) => ip.trim());
    if (!chain.length || chain.length > 16 || chain.some((ip) => !isIP(ip)))
      return peer;
    let address = peer;
    // Walk inward from our peer; the closest untrusted hop is the real quota boundary.
    for (
      let index = chain.length - 1;
      index >= 0 && trustedProxies.has(address);
      index--
    )
      address = normalizeIp(chain[index]);
    return address;
  }
  const buckets = new Map();
  let hashing = 0;
  let lastCleanup = 0;
  let closed = false;
  const sessionStatement = db.prepare(
    'SELECT token_hash,user_id,csrf,expires_at FROM sessions WHERE token_hash=? AND expires_at>?',
  );
  function rateLimit(key, limit, windowMs) {
    const now = Date.now();
    let bucket = buckets.get(key);
    if (!bucket || bucket.until <= now) {
      bucket = { count: 0, until: now + windowMs };
      buckets.set(key, bucket);
    }
    bucket.count++;
    if (bucket.count > limit)
      throw new ApiError(
        429,
        'rate_limited',
        'Demasiados intentos. Esperá unos minutos y volvé a probar.',
      );
  }
  function cleanup() {
    const now = Date.now();
    if (now - lastCleanup < 60_000) return;
    lastCleanup = now;
    db.prepare('DELETE FROM sessions WHERE expires_at<=?').run(now);
    for (const [key, bucket] of buckets)
      if (bucket.until <= now) buckets.delete(key);
  }
  function requestOrigin(req) {
    return (
      canonicalOrigin ??
      `${req.socket.encrypted ? 'https' : 'http'}://${req.headers.host}`
    );
  }
  function cookie(res, token, req, expires = DAY) {
    const secure = requestOrigin(req).startsWith('https:') ? '; Secure' : '';
    res.setHeader(
      'Set-Cookie',
      `${COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${Math.floor(expires / 1000)}${secure}`,
    );
  }
  function sessionFor(req) {
    const token = (req.headers.cookie ?? '')
      .split(';')
      .map((item) => item.trim())
      .find((item) => item.startsWith(`${COOKIE}=`))
      ?.slice(COOKIE.length + 1);
    return token && /^[A-Za-z0-9_-]{43}$/u.test(token)
      ? sessionStatement.get(digest(token), Date.now())
      : undefined;
  }
  function newSession(req, res, userId = null, oldSession) {
    if (oldSession)
      db.prepare('DELETE FROM sessions WHERE token_hash=?').run(
        oldSession.token_hash,
      );
    const token = randomToken(),
      csrf = randomToken(),
      ttl = userId ? 30 * DAY : DAY;
    const session = {
      token_hash: digest(token),
      user_id: userId,
      csrf,
      expires_at: Date.now() + ttl,
    };
    db.prepare('INSERT INTO sessions VALUES(?,?,?,?)').run(
      session.token_hash,
      userId,
      csrf,
      session.expires_at,
    );
    cookie(res, token, req, ttl);
    return session;
  }
  function userFor(session) {
    if (!session?.user_id) return null;
    const row = db
      .prepare('SELECT id,name,email,newsletter FROM users WHERE id=?')
      .get(session.user_id);
    return row ? { ...row, newsletter: Boolean(row.newsletter) } : null;
  }
  function requireUser(session) {
    const user = userFor(session);
    if (!user)
      throw new ApiError(
        401,
        'authentication_required',
        'Iniciá sesión para guardar tu recorrido.',
      );
    return user;
  }
  const sessionData = (session) => ({
    user: userFor(session),
    csrfToken: session.csrf,
  });
  function send(res, status, body) {
    res.statusCode = status;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify(body));
  }
  async function expensive(work) {
    if (hashing >= 4)
      throw new ApiError(
        429,
        'busy',
        'El Instituto está recibiendo muchas visitas. Volvé a intentar en un momento.',
      );
    hashing++;
    try {
      return await work();
    } finally {
      hashing--;
    }
  }
  async function handle(req, res, next) {
    const path = (req.url ?? '').split('?')[0];
    if (!path.startsWith('/api/')) {
      next?.();
      return false;
    }
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Cross-Origin-Resource-Policy', 'same-origin');
    try {
      if (closed)
        throw new ApiError(
          503,
          'unavailable',
          'El servicio no está disponible.',
        );
      cleanup();
      if (
        !canonicalOrigin &&
        !/^(localhost|127\.0\.0\.1|\[::1\])(?::[0-9]{1,5})?$/iu.test(
          req.headers.host ?? '',
        )
      )
        throw new ApiError(
          403,
          'host_rejected',
          'El servidor necesita configurar su origen público.',
        );
      rateLimit(
        `all:${clientAddress(req)}`,
        options.requestLimit ?? 240,
        60_000,
      );
      // No CORS; browsers from another origin cannot mint sessions or mutate account data.
      if (req.headers['sec-fetch-site'] === 'cross-site')
        throw new ApiError(
          403,
          'origin_rejected',
          'La solicitud debe realizarse desde el Instituto.',
        );
      if (req.headers.origin && req.headers.origin !== requestOrigin(req))
        throw new ApiError(
          403,
          'origin_rejected',
          'La solicitud debe realizarse desde el Instituto.',
        );
      const method = req.method ?? 'GET';
      let session = sessionFor(req);
      if (method === 'GET' && path === '/api/session') {
        session ??= newSession(req, res);
        send(res, 200, sessionData(session));
        return true;
      }
      let body;
      if (!['GET', 'HEAD'].includes(method)) {
        if (!req.headers.origin || req.headers.origin !== requestOrigin(req))
          throw new ApiError(
            403,
            'origin_rejected',
            'La solicitud debe realizarse desde el Instituto.',
          );
        if (
          !session ||
          typeof req.headers['x-csrf-token'] !== 'string' ||
          req.headers['x-csrf-token'] !== session.csrf
        )
          throw new ApiError(
            403,
            'csrf_rejected',
            'La sesión cambió. Recargá el Instituto y volvé a intentar.',
          );
        if (
          !/^application\/json(?:\s*;|$)/iu.test(
            req.headers['content-type'] ?? '',
          )
        )
          throw new ApiError(415, 'json_required', 'Usá una solicitud JSON.');
        body = await readBody(req);
      }
      if (
        method === 'POST' &&
        ['/api/auth/register', '/api/auth/login'].includes(path)
      ) {
        rateLimit(
          `auth:${clientAddress(req)}`,
          options.authLimit ?? 30,
          15 * 60_000,
        );
        fields(
          body,
          path.endsWith('register')
            ? ['name', 'email', 'password']
            : ['email', 'password'],
        );
        const email = emailValue(body.email),
          password = passwordValue(body.password);
        let userId;
        if (path.endsWith('register')) {
          const name = nameValue(body.name);
          const passwordHash = await expensive(() => hashPassword(password));
          userId = randomBytes(16).toString('hex');
          try {
            db.prepare(
              'INSERT INTO users(id,name,email,password_hash,created_at) VALUES(?,?,?,?,?)',
            ).run(userId, name, email, passwordHash, Date.now());
          } catch (error) {
            if (String(error.message).includes('UNIQUE constraint'))
              throw new ApiError(
                409,
                'registration_unavailable',
                'No se pudo crear la cuenta con esos datos. Probá iniciar sesión.',
              );
            throw error;
          }
        } else {
          const user = db
            .prepare('SELECT id,password_hash FROM users WHERE email=?')
            .get(email);
          const valid = await expensive(() =>
            checkPassword(
              password,
              user?.password_hash ?? `${'0'.repeat(32)}:${'0'.repeat(128)}`,
            ),
          );
          if (!valid || !user)
            throw new ApiError(
              401,
              'invalid_credentials',
              'El correo o la contraseña no son correctos.',
            );
          if (
            db
              .prepare('SELECT password_hash FROM users WHERE id=?')
              .get(user.id)?.password_hash !== user.password_hash
          )
            throw new ApiError(
              401,
              'invalid_credentials',
              'El correo o la contraseña no son correctos.',
            );
          userId = user.id;
        }
        session = newSession(req, res, userId, session);
        send(res, 200, sessionData(session));
        return true;
      }
      if (method === 'POST' && path === '/api/auth/logout') {
        fields(body, []);
        session = newSession(req, res, null, session);
        send(res, 200, sessionData(session));
        return true;
      }
      const user = requireUser(session);
      if (method === 'POST' && path === '/api/auth/password') {
        rateLimit(
          `password:${clientAddress(req)}`,
          options.authLimit ?? 30,
          15 * 60_000,
        );
        fields(body, ['currentPassword', 'newPassword']);
        const current = passwordValue(body.currentPassword),
          nextPassword = passwordValue(body.newPassword);
        if (current === nextPassword)
          bad('Elegí una contraseña diferente de la actual.');
        const stored = db
          .prepare('SELECT password_hash FROM users WHERE id=?')
          .get(user.id);
        const valid = await expensive(() =>
          checkPassword(current, stored.password_hash),
        );
        if (!valid)
          throw new ApiError(
            401,
            'invalid_credentials',
            'La contraseña actual no es correcta.',
          );
        const hash = await expensive(() => hashPassword(nextPassword));
        // Conditional update prevents concurrent password changes based on stale credentials.
        const changed = db
          .prepare(
            'UPDATE users SET password_hash=? WHERE id=? AND password_hash=?',
          )
          .run(hash, user.id, stored.password_hash);
        if (!changed.changes)
          throw new ApiError(
            409,
            'session_changed',
            'La contraseña cambió en otra sesión. Iniciá sesión nuevamente.',
          );
        db.prepare('DELETE FROM sessions WHERE user_id=?').run(user.id);
        session = newSession(req, res, user.id);
        send(res, 200, sessionData(session));
        return true;
      }
      if (method === 'PATCH' && path === '/api/profile') {
        fields(body, ['name']);
        db.prepare('UPDATE users SET name=? WHERE id=?').run(
          nameValue(body.name),
          user.id,
        );
        send(res, 200, sessionData(session));
        return true;
      }
      if (method === 'PUT' && path === '/api/newsletter') {
        fields(body, ['subscribed']);
        if (typeof body.subscribed !== 'boolean') bad();
        db.prepare(
          'UPDATE users SET newsletter=?,newsletter_updated_at=? WHERE id=?',
        ).run(Number(body.subscribed), Date.now(), user.id);
        send(res, 200, { ...sessionData(session), delivery: 'not_sent' });
        return true;
      }
      if (path === '/api/library' && ['GET', 'PUT'].includes(method)) {
        if (method === 'PUT') {
          fields(body, ['bookmarks', 'reading']);
          const bookmarks = ids(body.bookmarks);
          if (!isObject(body.reading) || Object.keys(body.reading).length > 100)
            bad();
          ids(Object.keys(body.reading));
          if (
            Object.values(body.reading).some(
              (value) => !Number.isInteger(value) || value < 0 || value > 100,
            )
          )
            bad();
          db.prepare(
            'INSERT INTO library(user_id,bookmarks,reading) VALUES(?,?,?) ON CONFLICT(user_id) DO UPDATE SET bookmarks=excluded.bookmarks,reading=excluded.reading',
          ).run(
            user.id,
            JSON.stringify(bookmarks),
            JSON.stringify(body.reading),
          );
        }
        const row = db
          .prepare('SELECT bookmarks,reading FROM library WHERE user_id=?')
          .get(user.id);
        send(res, 200, {
          bookmarks: JSON.parse(row?.bookmarks ?? '[]'),
          reading: JSON.parse(row?.reading ?? '{}'),
        });
        return true;
      }
      if (path === '/api/progress' && ['GET', 'PUT'].includes(method)) {
        if (method === 'PUT') {
          fields(body, ['achievements']);
          const achievements = ids(body.achievements);
          db.prepare(
            'INSERT INTO progress(user_id,achievements) VALUES(?,?) ON CONFLICT(user_id) DO UPDATE SET achievements=excluded.achievements',
          ).run(user.id, JSON.stringify(achievements));
        }
        const row = db
          .prepare('SELECT achievements FROM progress WHERE user_id=?')
          .get(user.id);
        send(res, 200, { achievements: JSON.parse(row?.achievements ?? '[]') });
        return true;
      }
      throw new ApiError(404, 'not_found', 'Ese servicio no existe.');
    } catch (error) {
      const known = error instanceof ApiError;
      if (!known) options.onError?.(error);
      if (!res.headersSent) {
        if (error.status === 429) res.setHeader('Retry-After', '60');
        send(res, known ? error.status : 500, {
          error: {
            code: known ? error.code : 'internal_error',
            message: known
              ? error.message
              : 'No pudimos completar la solicitud. Volvé a intentar.',
          },
        });
      }
      return true;
    }
  }
  return {
    middleware: (req, res, next) => {
      void handle(req, res, next);
    },
    handle,
    close: () => {
      if (!closed) {
        closed = true;
        db.close();
      }
    },
  };
}
