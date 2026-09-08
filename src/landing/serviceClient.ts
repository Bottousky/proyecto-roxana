export interface User {
  id: string;
  name: string;
  email: string;
  newsletter: boolean;
}
export interface Session {
  user: User | null;
  csrfToken: string;
}

export class ServiceError extends Error {
  readonly status: number;
  readonly code: string;
  constructor(message: string, status = 0, code = 'network_error') {
    super(message);
    this.name = 'ServiceError';
    this.status = status;
    this.code = code;
  }
}

let session: Session | null = null;
let sessionRequest: Promise<Session> | null = null;
let revision = 0;
let queuedRefresh: Promise<Session> | null = null;
let mutationQueue: Promise<unknown> = Promise.resolve();

function isSession(value: unknown): value is Session {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<Session>;
  return (
    typeof candidate.csrfToken === 'string' &&
    (candidate.user === null ||
      (!!candidate.user &&
        typeof candidate.user.id === 'string' &&
        typeof candidate.user.name === 'string' &&
        typeof candidate.user.email === 'string' &&
        typeof candidate.user.newsletter === 'boolean'))
  );
}
function publish(value: Session): Session {
  session = {
    user: value.user ? { ...value.user } : null,
    csrfToken: value.csrfToken,
  };
  revision++;
  const label = document.querySelector<HTMLElement>('#account-name');
  if (label) label.textContent = session.user?.name ?? 'Mi cuenta';
  window.dispatchEvent(
    new CustomEvent<Session>('roxana:session', {
      detail: { ...session, user: session.user ? { ...session.user } : null },
    }),
  );
  return session;
}
async function request<T>(
  path: string,
  method: string,
  body?: unknown,
  csrfToken?: string,
): Promise<T> {
  let response: Response;
  const timeout = new AbortController();
  const timer = window.setTimeout(() => timeout.abort(), 15000);
  try {
    response = await fetch(path, {
      method,
      signal: timeout.signal,
      credentials: 'same-origin',
      cache: 'no-store',
      headers: {
        Accept: 'application/json',
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...(csrfToken ? { 'X-CSRF-Token': csrfToken } : {}),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ServiceError(
      'No pudimos conectar con el Instituto. Revisá tu conexión y volvé a intentar.',
    );
  } finally {
    window.clearTimeout(timer);
  }
  let data: unknown;
  try {
    data = await response.json();
  } catch {
    throw new ServiceError(
      'El servicio de cuentas no está disponible en este servidor. Podés seguir explorando el Instituto.',
      response.status,
      'service_unavailable',
    );
  }
  if (!response.ok) {
    const error = (data as { error?: { message?: unknown; code?: unknown } })
      ?.error;
    throw new ServiceError(
      typeof error?.message === 'string'
        ? error.message
        : 'No pudimos completar la solicitud.',
      response.status,
      typeof error?.code === 'string' ? error.code : 'request_failed',
    );
  }
  return data as T;
}

/** Cached identity. null means anonymous or not initialized; call getSession to distinguish service failure. */
export function currentUser(): User | null {
  return session?.user ? { ...session.user } : null;
}

function loadSession(): Promise<Session> {
  if (sessionRequest) return sessionRequest;
  const startedAt = revision;
  sessionRequest = request<Session>('/api/session', 'GET')
    .then((value) => {
      if (!isSession(value))
        throw new ServiceError(
          'El servicio devolvió una sesión inválida.',
          502,
          'invalid_session',
        );
      // A delayed identity request must not overwrite a newer login or logout response.
      if (revision !== startedAt && session) return session;
      return publish(value);
    })
    .finally(() => {
      sessionRequest = null;
    });
  return sessionRequest;
}
export function refreshSession(): Promise<Session> {
  if (queuedRefresh) return queuedRefresh;
  const operation = mutationQueue.then(() => loadSession());
  mutationQueue = operation.catch(() => undefined);
  queuedRefresh = operation.finally(() => {
    queuedRefresh = null;
  });
  return queuedRefresh;
}
export function getSession(): Promise<Session> {
  return session
    ? Promise.resolve({
        ...session,
        user: session.user ? { ...session.user } : null,
      })
    : refreshSession();
}

/** Paths are same-origin /api/... only. Mutations are serialized so cookie and CSRF rotations stay together. */
export function api<T>(
  path: string,
  method = 'GET',
  body?: unknown,
): Promise<T> {
  if (!/^\/api\/[a-z0-9/-]+(?:\?[^#]*)?$/iu.test(path))
    return Promise.reject(
      new ServiceError(
        'La ruta del servicio no es válida.',
        400,
        'invalid_path',
      ),
    );
  const verb = method.toUpperCase();
  if (verb === 'GET') {
    if (path === '/api/session') return refreshSession() as Promise<T>;
    return request<T>(path, verb);
  }
  if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(verb))
    return Promise.reject(
      new ServiceError('La acción no es válida.', 400, 'invalid_method'),
    );
  // Bind queued resource/password/logout changes to the identity visible when
  // they were requested. Recovering CSRF in an earlier job must never move a
  // later job's payload into a different account (including another browser tab).
  const expectedOwner = session ? (session.user?.id ?? null) : undefined;
  const changesIdentity = ['/api/auth/login', '/api/auth/register'].includes(path.split('?')[0]);
  const operation = mutationQueue.then(async () => {
    const active = session ?? (await loadSession());
    if (!changesIdentity && expectedOwner !== undefined && (active.user?.id ?? null) !== expectedOwner) {
      throw new ServiceError('La cuenta cambió mientras se guardaban los datos. Volvé a intentar desde tu cuenta actual.', 409, 'identity_changed');
    }
    try {
      const value = await request<T>(path, verb, body ?? {}, active.csrfToken);
      if (isSession(value)) publish(value);
      return value;
    } catch (error) {
      // Recover identity for the next explicit attempt; never replay a mutation automatically.
      if (
        error instanceof ServiceError &&
        (error.code === 'csrf_rejected' ||
          error.code === 'authentication_required')
      ) {
        session = null;
        try {
          await loadSession();
        } catch {
          /* Keep the original actionable error. */
        }
      }
      throw error;
    }
  });
  mutationQueue = operation.catch(() => undefined);
  return operation;
}
