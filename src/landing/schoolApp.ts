import { VOXEL_ROOMS, type VoxelZoneId } from './voxelSchoolModel.ts';
import {
  LIBRARY_ARTICLES,
  getLibraryArticle,
  type LibraryArticle,
  type LibraryCategory,
} from './library.ts';
import {
  WORLD_ACTIVITIES,
  getWorldActivity,
  checkActivityAnswer,
  type ActivityVisualValue,
  type WorldActivity,
} from './worldActivities.ts';
import { readSchoolState } from './schoolModel.ts';
import { portalGateUrl } from '../shared/portalLink.ts';
import { startPortalTransition } from './portal.ts';
import { renderAccount } from './account.ts';
import {
  api,
  getSession,
  currentUser,
  refreshSession,
} from './serviceClient.ts';

const $ = <T extends HTMLElement = HTMLElement>(selector: string) =>
  document.querySelector<T>(selector);
const escape = (value: string) =>
  value.replace(
    /[&<>"']/g,
    (char) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[
        char
      ]!,
  );
const announce = (message: string) => {
  const node = $('#landing-announcement');
  if (node) node.textContent = message;
};
const categories: Record<LibraryCategory, string> = {
  proyecto: 'Roxana',
  historia: 'Historias',
  creacion: 'Cómo se hizo',
  electricidad: 'Electricidad',
  programacion: 'Programación',
  fisica: 'Física',
  matematica: 'Matemática',
};
const colors: Record<string, string> = {
  roxana: '#72574b',
  ohmdal: '#376b63',
  bitland: '#385b7b',
  physica: '#655d7d',
  arithmos: '#8b6940',
};
const glyphs: Record<string, string> = {
  roxana: 'R',
  ohmdal: 'Ω',
  bitland: '⌘',
  physica: '↗',
  arithmos: '∑',
};
const roomWorld: Partial<Record<VoxelZoneId, string>> = {
  electronica: 'ohmdal',
  programacion: 'bitland',
  fisica: 'physica',
  matematica: 'arithmos',
};
const roomService: Record<string, string> = {
  hall: 'Orientación y Mundos Aplicados',
  electronica: 'Ohmdal · electricidad',
  programacion: 'Bitland · programación',
  matematica: 'Arithmos · matemática',
  fisica: 'Physica · física',
  biblioteca: 'Libros y materiales',
  logros: 'Tu recorrido',
  direccion: 'Documentación de Roxana',
  visitantes: 'Novedades y newsletter',
  preceptoria: 'Registro y cuenta',
  audiovisual: 'Historias y creación',
};
interface VisitState {
  bookmarks: string[];
  reading: Record<string, number>;
  achievements: string[];
}
const initialVisit = (): VisitState => ({
  bookmarks: [],
  reading: {},
  achievements: [],
});
function readVisit(): VisitState {
  try {
    const value = JSON.parse(
      localStorage.getItem('roxana-institute-guest-v1') || 'null',
    ) as Partial<VisitState> | null;
    if (!value) return initialVisit();
    return {
      bookmarks: Array.isArray(value.bookmarks)
        ? value.bookmarks.filter(
            (id) => typeof id === 'string' && getLibraryArticle(id),
          )
        : [],
      reading: Object.fromEntries(
        Object.entries(value.reading || {}).filter(
          ([id, percent]) =>
            getLibraryArticle(id) &&
            typeof percent === 'number' &&
            percent >= 0 &&
            percent <= 100,
        ),
      ),
      achievements: Array.isArray(value.achievements)
        ? value.achievements.filter((id) =>
            WORLD_ACTIVITIES.some((a) => a.id === id),
          )
        : [],
    };
  } catch {
    return initialVisit();
  }
}
let visit = readVisit();
let room: VoxelZoneId | null = null;
let identity: string | number | null = null;
let syncReady = true;
let syncing = false;
let syncError = '';
let saveWork: Promise<boolean> = Promise.resolve(true);
let saveFailed = false;
let libraryFilter = 'all';
let libraryQuery = '';
let readerId: string | null = null;
let activeActivity: { id: string; step: number } | null = null;
let tourIndex = -1;
const content = () => $('#room-content')!;
const openDialog = (id: string) =>
  window.dispatchEvent(new CustomEvent('roxana:open-dialog', { detail: id }));
function status(message: string, error = false): void {
  const node = $('#room-status-message');
  if (node) {
    node.textContent = message;
    node.dataset.error = String(error);
  }
  announce(message);
}
function persistVisit(): Promise<boolean> {
  if (!currentUser()) {
    try {
      localStorage.setItem('roxana-institute-guest-v1', JSON.stringify(visit));
    } catch {
      announce(
        'Actividad conservada en esta visita. El navegador no permite guardarla.',
      );
    }
    return Promise.resolve(true);
  }
  if (!syncReady) {
    status('Esperá a que termine de abrirse tu archivo de cuenta.', true);
    return Promise.resolve(false);
  }
  const expectedIdentity = identity;
  const snapshot = structuredClone(visit);
  const key = `roxana-institute-pending-${expectedIdentity}`;
  const draft = JSON.stringify(snapshot);
  // Keep an account-scoped outbox if reload closes a request. It is only read
  // after authenticating that same account, never merged into another visitor.
  try {
    localStorage.setItem(key, draft);
  } catch {
    /* The live requests still work without storage. */
  }
  // Queue BOTH writes now. A following logout cannot overtake the second one.
  saveWork = Promise.all([
    api('/api/library', 'PUT', {
      bookmarks: snapshot.bookmarks,
      reading: snapshot.reading,
    }),
    api('/api/progress', 'PUT', { achievements: snapshot.achievements }),
  ])
    .then(() => {
      try {
        if (localStorage.getItem(key) === draft) localStorage.removeItem(key);
      } catch {
        /* optional outbox */
      }
      if (identity === expectedIdentity) {
        saveFailed = false;
        document
          .querySelectorAll<HTMLElement>('[data-retry-save]')
          .forEach((button) => (button.hidden = true));
        status('Tu archivo está guardado en la cuenta.');
        if ($('#reader-dialog')?.hasAttribute('open'))
          $('#reader-status')!.textContent =
            'Tu archivo está guardado en la cuenta.';
      }
      return true;
    })
    .catch((error) => {
      if (identity === expectedIdentity) {
        saveFailed = true;
        document
          .querySelectorAll<HTMLElement>('[data-retry-save]')
          .forEach((button) => (button.hidden = false));
        const message = `No se pudo sincronizar: ${error instanceof Error ? error.message : 'intentá de nuevo'}. Tu cambio sigue en esta visita; podés reintentar.`;
        status(message, true);
        if ($('#reader-dialog')?.hasAttribute('open'))
          $('#reader-status')!.textContent = message;
      }
      return false;
    });
  return saveWork;
}
async function syncAccount(): Promise<void> {
  const user = currentUser();
  const nextIdentity = user?.id ?? null;
  if (identity === nextIdentity && (syncReady || syncing)) return;
  if (identity !== nextIdentity) {
    saveWork = Promise.resolve(true);
    saveFailed = false;
  }
  identity = nextIdentity;
  syncing = true;
  syncError = '';
  visit = initialVisit();
  syncReady = !user;
  if (!user) visit = readVisit();
  else {
    try {
      const [library, progress] = await Promise.all([
        api<{ bookmarks: string[]; reading: Record<string, number> }>(
          '/api/library',
        ),
        api<{ achievements: string[] }>('/api/progress'),
      ]);
      if (identity !== nextIdentity) return;
      visit = { ...library, ...progress };
      syncReady = true;
      try {
        const pending = JSON.parse(
          localStorage.getItem(`roxana-institute-pending-${nextIdentity}`) ||
            'null',
        ) as VisitState | null;
        if (
          pending &&
          Array.isArray(pending.bookmarks) &&
          Array.isArray(pending.achievements) &&
          pending.reading &&
          typeof pending.reading === 'object'
        ) {
          visit = {
            bookmarks: pending.bookmarks.filter(
              (id) => typeof id === 'string' && !!getLibraryArticle(id),
            ),
            reading: Object.fromEntries(
              Object.entries(pending.reading).filter(
                ([id, n]) =>
                  getLibraryArticle(id) &&
                  typeof n === 'number' &&
                  n >= 0 &&
                  n <= 100,
              ),
            ),
            achievements: pending.achievements.filter((id) =>
              WORLD_ACTIVITIES.some((a) => a.id === id),
            ),
          };
          void persistVisit();
        }
      } catch {
        /* malformed or unavailable optional outbox */
      }
    } catch (error) {
      if (identity === nextIdentity)
        syncError = `Tu archivo todavía no está disponible. ${error instanceof Error ? error.message : ''}`;
    }
  }
  if (identity !== nextIdentity) return;
  syncing = false;
  if (room && room !== 'preceptoria') renderRoom(room);
  if (readerId && $('#reader-dialog')?.hasAttribute('open'))
    renderReader(readerId);
}
const statusSlot = () =>
  `<p id="room-status-message" class="form-status" role="status" data-error="${!!syncError}">${escape(syncError)}</p>${syncError ? '<button class="button secondary" data-retry-sync>Reintentar abrir mi archivo</button>' : ''}<button class="button secondary" data-retry-save ${saveFailed ? '' : 'hidden'}>Reintentar guardar mis cambios</button>`;
const roomLink = (
  id: string,
  title: string,
  description: string,
  glyph: string,
) =>
  `<button class="room-link" data-select-room="${id}"><span class="glyph" aria-hidden="true">${glyph}</span><span><strong>${escape(title)}</strong><small>${escape(description)}</small></span><span class="arrow" aria-hidden="true">↗</span></button>`;
function selectRoom(id: VoxelZoneId): void {
  if (document.documentElement.dataset.scene === 'failed') {
    history.pushState({}, '', `#sala/${id}`);
    showFallbackRoom(id);
  } else if (document.documentElement.dataset.scene !== 'ready') {
    history.pushState({}, '', `#sala/${id}`);
    announce('La sala se abrirá al terminar de cargar el Instituto.');
  } else
    window.dispatchEvent(new CustomEvent('roxana:select-room', { detail: id }));
}
function showFallbackRoom(id: VoxelZoneId): void {
  const definition = VOXEL_ROOMS.find((r) => r.id === id)!;
  $('#school-experience')!.dataset.mode = 'room';
  const panel = $('#school3d-panel')!;
  panel.inert = false;
  panel.setAttribute('aria-hidden', 'false');
  panel.classList.add('is-open');
  $('#school3d-title')!.textContent = definition.title;
  $('#school3d-description')!.textContent = definition.description;
  $('#school3d-eyebrow')!.textContent = definition.eyebrow;
  renderRoom(id);
  $('#school3d-title')!.focus();
}
function overview(): void {
  if (document.documentElement.dataset.scene !== 'failed') {
    $('#school3d-home')?.click();
    return;
  }
  history.pushState({}, '', location.pathname + location.search);
  $('#school-experience')!.dataset.mode = 'overview';
  const panel = $('#school3d-panel')!;
  panel.inert = true;
  panel.classList.remove('is-open');
  panel.setAttribute('aria-hidden', 'true');
  room = null;
}
function renderRoom(id: VoxelZoneId): void {
  if (room !== id) activeActivity = null;
  room = id;
  const definition = VOXEL_ROOMS.find((r) => r.id === id)!;
  $('#school3d-panel')?.style.setProperty('--accent', definition.accent);
  $('#current-location')!.textContent = `Instituto / ${definition.shortTitle}`;
  $('#scene-hint')!.textContent = 'Esc para volver a la escuela';
  $('#school3d-status')!.textContent = roomService[id];
  if (id === 'preceptoria') {
    renderAccount(content());
    return;
  }
  if (id === 'biblioteca') {
    libraryFilter = 'all';
    libraryQuery = '';
    renderLibrary();
    return;
  }
  if (id === 'logros') {
    renderAchievements();
    return;
  }
  const world = roomWorld[id];
  if (world) {
    renderWorld(world);
    return;
  }
  if (id === 'visitantes') {
    renderNewsletter();
    return;
  }
  if (id === 'direccion') {
    content().innerHTML = `<div class="room-links">${LIBRARY_ARTICLES.filter(
      (a) => a.category === 'proyecto',
    )
      .map(articleLink)
      .join(
        '',
      )}</div><h3 class="room-section-title">DEL ARCHIVO AL MUNDO</h3><p class="world-description">Una pregunta inicia el recorrido. Una acción permite ponerla a prueba. La Biblioteca conserva lo que aprendemos al hacerlo.</p>${roomLink('biblioteca', 'Consultar el archivo', 'Documentación, historias y libros', '⌑')}${roomLink('preceptoria', 'Mi lugar en el Instituto', 'Cuenta y preferencias de estudiante', 'R')}`;
    return;
  }
  if (id === 'audiovisual') {
    content().innerHTML = `<div class="projection-card"><span aria-hidden="true">▷</span><small>EL ARCHIVO DE LAS PREGUNTAS</small><h3>Detrás de<br />cada mundo.</h3><p>Historias, personajes y decisiones que dan forma a Roxana.</p></div><div class="room-links">${LIBRARY_ARTICLES.filter(
      (a) => a.category === 'creacion' || a.category === 'historia',
    )
      .map(articleLink)
      .join('')}</div>`;
    return;
  }
  content().innerHTML = `<p class="world-description">Bienvenido al Instituto. Las aulas conectan con los Mundos Aplicados; alrededor del hall están los espacios para leer, compartir y cuidar tu recorrido.</p><h3 class="room-section-title">ELEGÍ TU PRÓXIMA PUERTA</h3><div class="room-links">${roomLink('electronica', 'Ohmdal', 'Electricidad · aventura disponible', 'Ω')}${roomLink('programacion', 'Bitland', 'Programación · banco de práctica', '⌘')}${roomLink('fisica', 'Physica', 'Física · prototipo y práctica', '↗')}${roomLink('matematica', 'Arithmos', 'Matemática · banco de práctica', '∑')}</div><h3 class="room-section-title">LA VIDA EN LA ESCUELA</h3><div class="room-links">${roomLink('biblioteca', 'La Biblioteca', 'Leer, guardar y volver a preguntar', '⌑')}${roomLink('preceptoria', 'Preceptoría', 'Registrarme o abrir mi cuenta', 'R')}${roomLink('logros', 'Sala de Logros', 'Mis lecturas, prácticas y aventuras', '✧')}</div>`;
}
function articleLink(article: LibraryArticle): string {
  return `<button class="room-link" data-read="${article.id}"><span class="glyph" aria-hidden="true">${glyphs[article.world]}</span><span><strong>${escape(article.title)}</strong><small>${categories[article.category]} · ${article.readMinutes} min</small></span><span class="arrow" aria-hidden="true">↗</span></button>`;
}
function renderLibrary(): void {
  content().innerHTML = `<label class="search-field"><span aria-hidden="true">⌕</span><input type="search" id="library-search" placeholder="Buscar en los estantes…" aria-label="Buscar libros" value="${escape(libraryQuery)}" /></label><div class="filter-row" aria-label="Categorías de la biblioteca">${[['all', 'Todo'], ['saved', 'Mis favoritos'], ...Object.entries(categories)].map(([id, label]) => `<button class="filter-chip" data-filter="${id}" aria-pressed="${libraryFilter === id}">${label}</button>`).join('')}</div><p class="library-count" id="library-count"></p><div id="book-list" class="book-list"></div>${statusSlot()}<p class="notice">${currentUser() ? (syncReady ? 'Tus lecturas y favoritos se guardan en tu cuenta.' : 'Abriendo el archivo de tu cuenta…') : 'Podés leer sin registrarte. Tus favoritos se guardan en este navegador.'}</p>`;
  renderBooks();
  $('#library-search')?.addEventListener('input', (event) => {
    libraryQuery = (event.target as HTMLInputElement).value;
    renderBooks();
  });
}
function renderBooks(): void {
  const query = libraryQuery
    .toLocaleLowerCase('es')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
  const articles = LIBRARY_ARTICLES.filter(
    (a) =>
      (libraryFilter === 'all' ||
        (libraryFilter === 'saved'
          ? visit.bookmarks.includes(a.id)
          : a.category === libraryFilter)) &&
      `${a.title} ${a.description} ${categories[a.category]}`
        .toLocaleLowerCase('es')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .includes(query),
  );
  $('#library-count')!.textContent =
    `${articles.length} ${articles.length === 1 ? 'lectura' : 'lecturas'} en este estante`;
  $('#book-list')!.innerHTML = articles.length
    ? articles
        .map(
          (a) =>
            `<button class="book-card" data-read="${a.id}"><span class="book-cover" style="--book-color:${colors[a.world]}" aria-hidden="true"><span>${glyphs[a.world]}</span><small>Biblioteca<br />Roxana</small></span><span class="book-info"><small>${categories[a.category]} · ${a.readMinutes} min${visit.reading[a.id] === 100 ? ' · Leído' : ''}${visit.bookmarks.includes(a.id) ? ' · ★' : ''}</small><strong>${escape(a.title)}</strong><p>${escape(a.description)}</p></span></button>`,
        )
        .join('')
    : '<p class="empty-state">No hay lecturas en este estante con esa búsqueda. Probá otra palabra o elegí «Todo».</p>';
}
function renderReader(id: string): void {
  const article = getLibraryArticle(id);
  if (!article) return;
  readerId = id;
  $('#reader-content')!.innerHTML =
    `<header class="reader-header"><span class="eyebrow">BIBLIOTECA ROXANA / ${categories[article.category]}</span><button class="icon-button" data-close-dialog aria-label="Cerrar lectura">×</button></header><div class="reader-layout"><nav class="reader-sidebar" aria-label="Índice de la lectura"><small>EN ESTA LECTURA</small>${article.sections.map((s, i) => `<button data-reader-section="${i}">${String(i + 1).padStart(2, '0')} &nbsp; ${escape(s.title)}</button>`).join('')}<p class="notice">${article.readMinutes} minutos de lectura</p></nav><article class="reader-article" tabindex="0"><span class="eyebrow">CUADERNOS DEL INSTITUTO · ${article.world.toUpperCase()}</span><h1 id="reader-title">${escape(article.title)}</h1><p class="reader-deck">${escape(article.description)}</p>${article.sections.map((s, i) => `<section class="reader-section" id="reader-section-${i}"><h2>${escape(s.title)}</h2>${s.paragraphs.map((p) => `<p>${escape(p)}</p>`).join('')}</section>`).join('')}<div class="reader-actions"><button class="button" id="reader-complete" ${!syncReady ? 'disabled' : ''}>${visit.reading[id] === 100 ? '✓ Lectura completada' : 'Marcar como leído'}</button><button class="button secondary" id="reader-bookmark" aria-pressed="${visit.bookmarks.includes(id)}" ${!syncReady ? 'disabled' : ''}>${visit.bookmarks.includes(id) ? '★ En mis favoritos' : '☆ Guardar en favoritos'}</button><button class="text-button" id="reader-download">Descargar lectura ↓</button></div><p class="form-status" role="status" id="reader-status"></p></article></div>`;
  $('#reader-content')!.style.height = '100%';
  $('#reader-status')!.textContent = syncError;
  const retry = document.createElement('button');
  retry.className = 'button secondary';
  retry.dataset.retrySave = '';
  retry.hidden = !saveFailed;
  retry.textContent = 'Reintentar guardar mis cambios';
  $('.reader-actions')!.append(retry);
  if (syncError) {
    const reload = document.createElement('button');
    reload.className = 'button secondary';
    reload.dataset.retrySync = '';
    reload.textContent = 'Reintentar abrir mi archivo';
    $('.reader-actions')!.append(reload);
  }
  $('#reader-complete')?.addEventListener('click', () => {
    if (!syncReady) return;
    visit.reading[id] = 100;
    persistVisit();
    $('#reader-complete')!.textContent = '✓ Lectura completada';
    $('#reader-status')!.textContent = currentUser()
      ? 'Lectura completada. Sincronizando tu archivo…'
      : 'Lectura completada en tu archivo de visitante.';
  });
  $('#reader-bookmark')?.addEventListener('click', () => {
    if (!syncReady) return;
    const saved = visit.bookmarks.includes(id);
    visit.bookmarks = saved
      ? visit.bookmarks.filter((v) => v !== id)
      : [...visit.bookmarks, id];
    persistVisit();
    $('#reader-bookmark')!.textContent = saved
      ? '☆ Guardar en favoritos'
      : '★ En mis favoritos';
    $('#reader-bookmark')!.setAttribute('aria-pressed', String(!saved));
    $('#reader-status')!.textContent = saved
      ? 'Lectura retirada de tus favoritos.'
      : 'Lectura agregada a tus favoritos.';
  });
  $('#reader-download')?.addEventListener('click', () => {
    const text = `${article.title}\nBiblioteca Roxana\n\n${article.description}\n\n${article.sections.map((s) => `${s.title}\n\n${s.paragraphs.join('\n\n')}`).join('\n\n')}\n\nMaterial educativo del Instituto Roxana.`;
    const url = URL.createObjectURL(
      new Blob([text], { type: 'text/plain;charset=utf-8' }),
    );
    const link = document.createElement('a');
    link.href = url;
    link.download = `${article.id}.txt`;
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    $('#reader-status')!.textContent = 'Lectura preparada para descargar.';
  });
}
function openReader(id: string): void {
  renderReader(id);
  openDialog('reader-dialog');
}

function renderWorld(world: string): void {
  const activity = getWorldActivity(world)!;
  const titles: Record<string, string> = {
    ohmdal: 'Ohmdal',
    bitland: 'Bitland',
    physica: 'Physica',
    arithmos: 'Arithmos',
  };
  const descriptions: Record<string, string> = {
    ohmdal:
      'Un mundo que conserva sus máquinas y necesita recuperar lo que sabía. Seguí la corriente, repará sus conexiones y devolvé la luz a su comunidad.',
    bitland:
      'Cada instrucción deja una huella. En el banco del aula podés ejecutar secuencias y observar cómo el orden cambia lo que sucede.',
    physica:
      'Movimiento, fuerza y equilibrio. Experimentá en la mesa del Instituto o entrá al prototipo del mundo aplicado.',
    arithmos:
      'Patrones y proporciones que se pueden transformar. Prepará mezclas, cambiá cantidades y conservá las relaciones que les dan sentido.',
  };
  const started = readSchoolState().aulas.electronica !== 'off';
  content().innerHTML = `<div class="world-emblem" style="--world-glow:${colors[world]}55"><span aria-hidden="true">${glyphs[world]}</span><small>MUNDO APLICADO · ${titles[world].toUpperCase()}</small></div><p class="world-description">${descriptions[world]}</p><div class="world-actions">${world === 'ohmdal' ? `<a class="button" data-journey href="${portalGateUrl()}">Cruzar el portal a Ohmdal <span aria-hidden="true">↗</span></a>${started ? '<a class="button secondary" href="/jugar">Continuar mi partida</a>' : ''}` : world === 'physica' ? '<a class="button" href="/physica/">Entrar al prototipo de Physica ↗</a>' : `<p class="notice">La aventura de ${titles[world]} está en preparación. El banco de práctica del aula ya está abierto.</p>`}<button class="button ${world === 'ohmdal' || world === 'physica' ? 'secondary' : ''}" data-activity="${activity.id}">Usar el banco de práctica →</button></div><h3 class="room-section-title">EN LOS ESTANTES DEL AULA</h3><div class="room-links">${LIBRARY_ARTICLES.filter(
    (a) => a.world === world && a.category !== 'historia',
  )
    .slice(0, 3)
    .map(articleLink)
    .join(
      '',
    )}</div>${roomLink('logros', 'Mi recorrido', 'Ver logros y prácticas completadas', '✧')}${statusSlot()}`;
  if (activeActivity?.id === activity.id) renderActivity(activity);
}
function visualBench(kind: string, values: ActivityVisualValue[]): string {
  const maximum = Math.max(...values.map((v) => Math.abs(v.value)), 1);
  return `<div class="bench-visual" data-kind="${kind}">${kind === 'track' ? '<div class="bench-track" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></div>' : ''}${values.map((v) => `<div class="bench-meter"><span>${escape(v.label)}</span><strong>${v.value}<small>${escape(v.unit || '')}</small></strong><i style="--meter:${Math.max(4, (Math.abs(v.value) / maximum) * 100)}%"></i></div>`).join('')}</div>`;
}
function renderActivity(activity: WorldActivity): void {
  if (!activeActivity || activeActivity.id !== activity.id)
    activeActivity = { id: activity.id, step: 0 };
  const step = activeActivity.step;
  const challenge = activity.challenges[step];
  const world = activity.world;
  content().innerHTML = `<button class="text-button" data-world-back="${world}">← Volver al portal</button><div class="activity-bench"><span class="bench-label">BANCO DE PRÁCTICA · ${step + 1} / ${activity.challenges.length}</span><h3>${escape(activity.title)}</h3><p class="bench-state">${escape(challenge.prompt)}</p><div id="bench-visual">${challenge.visual ? visualBench(challenge.visual.kind, challenge.visual.initial) : '<div class="circuit-visual" data-closed="false" aria-label="Circuito abierto"><span>＋ 6 V −</span><i></i><strong>Ω</strong><small>TRAYECTORIA ABIERTA</small></div>'}</div>${challenge.visual ? `<p class="bench-goal">Objetivo: ${escape(challenge.visual.target)}</p>` : ''}<div class="bench-choices">${challenge.choices.map((c) => `<button data-operation="${c.id}" ${!syncReady ? 'disabled' : ''}><span aria-hidden="true">↳</span>${escape(c.label)}</button>`).join('')}</div><div id="bench-feedback" class="bench-feedback" role="status"></div><button id="bench-next" class="button" hidden>${step + 1 === activity.challenges.length ? 'Guardar práctica completada ✓' : 'Probar en otra situación →'}</button></div><p class="notice">${escape(activity.description)}</p>${statusSlot()}`;
  let solved = false;
  content()
    .querySelectorAll<HTMLButtonElement>('[data-operation]')
    .forEach((button) =>
      button.addEventListener('click', () => {
        const choice = challenge.choices.find(
          (c) => c.id === button.dataset.operation,
        )!;
        const result = checkActivityAnswer(
          activity.id,
          challenge.id,
          choice.id,
        )!;
        const feedback = $('#bench-feedback')!;
        feedback.textContent = `${choice.outcome} ${result.correct ? result.explanation : 'Podés cambiar la operación y observar otro resultado.'}`;
        feedback.dataset.correct = String(result.correct);
        if (challenge.visual)
          $('#bench-visual')!.innerHTML = visualBench(
            challenge.visual.kind,
            challenge.visual.results[choice.id],
          );
        else {
          const circuit = $('.circuit-visual')!;
          circuit.dataset.closed = String(result.correct);
          circuit.querySelector('small')!.textContent = result.correct
            ? 'LA CORRIENTE CIRCULA'
            : 'SIN CORRIENTE POR LA CARGA';
        }
        solved = result.correct;
        $('#bench-next')!.hidden = !solved;
      }),
    );
  $('#bench-next')?.addEventListener('click', () => {
    if (!solved || !syncReady) return;
    if (step + 1 < activity.challenges.length) {
      activeActivity = { id: activity.id, step: step + 1 };
      renderActivity(activity);
    } else {
      if (!visit.achievements.includes(activity.id))
        visit.achievements.push(activity.id);
      persistVisit();
      activeActivity = null;
      content().innerHTML = `<div class="practice-complete"><span aria-hidden="true">✧</span><span class="eyebrow">PRÁCTICA COMPLETADA</span><h3>Una nueva forma<br />de mirar el mundo.</h3><p>Completaste las ${activity.challenges.length} situaciones de «${escape(activity.title)}». Tu práctica ya aparece en la Sala de Logros.</p></div>${roomLink('logros', 'Ver mi logro', 'Mi recorrido en el Instituto', '✧')}<button class="button secondary" data-world-back="${world}">Volver al aula</button>${statusSlot()}`;
    }
  });
}
function renderAchievements(): void {
  const school = readSchoolState();
  const readCount = Object.values(visit.reading).filter(
    (v) => v === 100,
  ).length;
  const achievements = [
    {
      title: 'La primera página',
      description: 'Completar una lectura en la Biblioteca.',
      unlocked: readCount > 0,
      glyph: '⌑',
    },
    {
      title: 'Una biblioteca propia',
      description: 'Guardar tres lecturas favoritas.',
      unlocked: visit.bookmarks.length >= 3,
      glyph: '☆',
    },
    ...WORLD_ACTIVITIES.map((a) => ({
      title: a.title,
      description: `Completar las dos prácticas de ${a.world[0].toUpperCase() + a.world.slice(1)}.`,
      unlocked: visit.achievements.includes(a.id),
      glyph: glyphs[a.world],
    })),
    {
      title: 'La primera luz',
      description: 'Recuperar la primera unidad en la aventura de Ohmdal.',
      unlocked: school.electronica.unidadesCompletadas > 0,
      glyph: '☼',
    },
    {
      title: 'La luz de Ohmdal',
      description: 'Completar el Arco I en la aventura de Ohmdal.',
      unlocked: school.electronica.arcoCompleto,
      glyph: '✧',
    },
  ];
  content().innerHTML = `<div class="progress-summary"><strong>${achievements.filter((a) => a.unlocked).length}<span style="font-size:24px;color:var(--muted)"> / ${achievements.length}</span></strong><span>logros descubiertos</span></div><div class="achievement-list">${achievements.map((a) => `<div class="achievement ${a.unlocked ? 'unlocked' : ''}"><span aria-hidden="true">${a.glyph}</span><div><strong>${a.unlocked ? '✓ ' : ''}${a.title}</strong><small>${a.description}</small></div></div>`).join('')}</div><h3 class="room-section-title">BITÁCORA DE OHMDAL</h3><p class="world-description">${school.electronica.unidadesCompletadas} de ${school.electronica.totalUnidades} unidades recuperadas</p><progress value="${school.electronica.unidadesCompletadas}" max="${school.electronica.totalUnidades}" aria-label="Unidades recuperadas de Ohmdal"></progress><p class="notice">Las unidades de Ohmdal corresponden a la partida guardada en este navegador. Las prácticas y lecturas ${currentUser() ? 'se guardan en tu cuenta.' : 'se guardan como visitante en este navegador.'}</p>${roomLink('biblioteca', 'Seguir descubriendo', 'Abrir los estantes de la Biblioteca', '⌑')}${statusSlot()}`;
}
function renderNewsletter(): void {
  const user = currentUser();
  content().innerHTML = `<div class="newsletter-letter"><span class="eyebrow">CARTAS DESDE EL INSTITUTO</span><h3>Que la curiosidad<br />no se pierda.</h3><p>Un lugar para recibir novedades de los mundos, nuevas lecturas y noticias del proyecto.</p><span class="letter-seal" aria-hidden="true">R</span></div>${user ? `<form id="newsletter-form" class="form-stack"><label class="check-label"><input type="checkbox" id="newsletter-consent" ${user.newsletter ? 'checked' : ''} /><span>Quiero recibir el boletín de Roxana en <strong>${escape(user.email)}</strong>.</span></label><button class="button" type="submit">Guardar preferencia</button>${statusSlot()}<p class="notice">Podés darte de baja desmarcando esta casilla. Esta instalación conserva la suscripción; todavía no envía correos.</p></form>` : `<p class="world-description">Registrate en Preceptoría para asociar el boletín a tu correo y administrar tu suscripción.</p>${roomLink('preceptoria', 'Quiero recibir novedades', 'Crear cuenta o iniciar sesión', 'R')}<p class="notice">La suscripción es opcional. Esta instalación registra preferencias; todavía no envía correos.</p>`}<h3 class="room-section-title">PARA DESCUBRIR HOY</h3><div class="room-links">${LIBRARY_ARTICLES.filter(
    (a) => a.category === 'creacion',
  )
    .map(articleLink)
    .join(
      '',
    )}${roomLink('audiovisual', 'El archivo de las historias', 'Personajes y creación de Roxana', '▷')}</div>`;
  $('#newsletter-form')?.addEventListener('submit', (event) => {
    event.preventDefault();
    const button = $('#newsletter-form button') as HTMLButtonElement;
    const subscribed = $<HTMLInputElement>('#newsletter-consent')!.checked;
    button.disabled = true;
    void (async () => {
      try {
        await api('/api/newsletter', 'PUT', { subscribed });
        await refreshSession();
        if (room === 'visitantes')
          status(
            subscribed
              ? 'Suscripción registrada. No se envió ningún correo.'
              : 'Suscripción cancelada.',
          );
      } catch (error) {
        if (room === 'visitantes')
          status(
            error instanceof Error
              ? error.message
              : 'No se pudo guardar la preferencia.',
            true,
          );
      } finally {
        button.disabled = false;
      }
    })();
  });
}
function renderSearch(): void {
  const query = $<HTMLInputElement>('#institute-search')!
    .value.trim()
    .toLocaleLowerCase('es')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
  const match = (text: string) =>
    text
      .toLocaleLowerCase('es')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .includes(query);
  const rooms = VOXEL_ROOMS.filter((r) =>
    match(`${r.title} ${roomService[r.id]}`),
  );
  const books = query
    ? LIBRARY_ARTICLES.filter((a) =>
        match(`${a.title} ${a.description}`),
      ).slice(0, 8)
    : [];
  $('#search-results')!.innerHTML =
    rooms
      .map(
        (r) =>
          `<button class="search-result" data-search-room="${r.id}"><span><small>SALA · ${roomService[r.id]}</small>${r.title}</span><span>↗</span></button>`,
      )
      .join('') +
      books
        .map(
          (a) =>
            `<button class="search-result" data-read="${a.id}"><span><small>BIBLIOTECA · ${categories[a.category]}</small>${escape(a.title)}</span><span>↗</span></button>`,
        )
        .join('') ||
    '<p class="empty-state">No encontramos una sala o lectura con ese nombre.</p>';
}
const tour = [
  {
    id: 'hall',
    title: 'Tu escuela está abierta.',
    description:
      'Cada sala es una puerta a Roxana. Podés entrar tocando el edificio, sus rótulos o el directorio.',
  },
  {
    id: 'electronica',
    title: 'Aprender dentro del mundo.',
    description:
      'Las cuatro aulas conectan con los Mundos Aplicados. En Electrónica podés cruzar a Ohmdal o experimentar en el banco del aula.',
  },
  {
    id: 'biblioteca',
    title: 'Las preguntas tienen estantes.',
    description:
      'Abrí libros, buscá un tema y guardá lecturas. La Biblioteca reúne materiales educativos, historias y documentación de Roxana.',
  },
  {
    id: 'preceptoria',
    title: 'Un lugar para tu recorrido.',
    description:
      'Creá tu cuenta, cambiá tu contraseña o consultá tu perfil. En Logros verás tus descubrimientos; en el Anfiteatro, el boletín.',
  },
] as const;
function showTour(): void {
  const item = tour[tourIndex];
  selectRoom(item.id);
  $('#tour-card')!.hidden = false;
  $('#tour-step')!.textContent =
    `PRIMERA VISITA / ${String(tourIndex + 1).padStart(2, '0')} DE 04`;
  $('#tour-title')!.textContent = item.title;
  $('#tour-description')!.textContent = item.description;
  $('#tour-next')!.textContent =
    tourIndex === tour.length - 1 ? 'Ahora, a explorar →' : 'Siguiente sala →';
}
export function initSchoolApp(): void {
  window.addEventListener('roxana:room-enter', (event) => {
    const id = (event as CustomEvent<{ id: VoxelZoneId | null }>).detail.id;
    if (id) renderRoom(id);
    else {
      room = null;
      activeActivity = null;
      $('#current-location')!.textContent = 'El conocimiento vuelve a la vida';
      $('#scene-hint')!.textContent = 'Hacé clic en una sala para entrar';
    }
  });
  window.addEventListener('roxana:object-enter', (event) => {
    const id = (event as CustomEvent<{ id: string }>).detail.id;
    if (id === 'portal' || id === 'proyector') renderWorld('ohmdal');
    else if (id === 'pizarron') {
      const article = LIBRARY_ARTICLES.find(
        (a) => a.category === 'electricidad',
      );
      if (article) openReader(article.id);
    } else {
      activeActivity = { id: getWorldActivity('ohmdal')!.id, step: 0 };
      renderActivity(getWorldActivity('ohmdal')!);
    }
  });
  window.addEventListener('roxana:session', () => {
    void syncAccount();
    if (room === 'visitantes') renderNewsletter();
  });
  void getSession()
    .then(() => syncAccount())
    .catch(() => {
      /* Guest library and worlds remain usable. Account exposes its own service error. */
    });
  document.addEventListener('click', (event) => {
    const target = (event.target as Element).closest<HTMLElement>('button,a');
    if (!target) return;
    if (target.dataset.selectRoom)
      selectRoom(target.dataset.selectRoom as VoxelZoneId);
    if (target.hasAttribute('data-overview')) overview();
    if (target.dataset.searchRoom) {
      $<HTMLDialogElement>('#search-dialog')!.close();
      selectRoom(target.dataset.searchRoom as VoxelZoneId);
    }
    if (target.dataset.read) openReader(target.dataset.read);
    if (target.dataset.filter) {
      libraryFilter = target.dataset.filter;
      content()
        .querySelectorAll<HTMLElement>('[data-filter]')
        .forEach((button) =>
          button.setAttribute(
            'aria-pressed',
            String(button.dataset.filter === libraryFilter),
          ),
        );
      renderBooks();
    }
    if (target.dataset.activity) {
      const activity = getWorldActivity(target.dataset.activity);
      if (activity) renderActivity(activity);
    }
    if (target.dataset.worldBack) {
      activeActivity = null;
      renderWorld(target.dataset.worldBack);
    }
    if (target.dataset.readerSection !== undefined)
      $(
        `#reader-section-${Number(target.dataset.readerSection)}`,
      )?.scrollIntoView({
        block: 'start',
        behavior:
          document.documentElement.dataset.motion === 'reduced'
            ? 'instant'
            : 'smooth',
      });
    if (target.hasAttribute('data-retry-sync')) void syncAccount();
    if (target.hasAttribute('data-retry-save')) void persistVisit();
    if (
      target instanceof HTMLAnchorElement &&
      /^\/(jugar|physica)([/?]|$)/.test(target.getAttribute('href') || '') &&
      !event.ctrlKey &&
      !event.metaKey &&
      !event.shiftKey &&
      event.button === 0
    ) {
      event.preventDefault();
      void saveWork.then((saved) => {
        if (!saved) {
          status(
            'No pudimos guardar el último cambio. Reintentá guardarlo antes de salir.',
            true,
          );
          return;
        }
        if (target.hasAttribute('data-journey')) startPortalTransition(target);
        else location.assign(target.href);
      });
    }
  });
  $('#reader-dialog')?.addEventListener('close', () => {
    const closedArticle = readerId;
    readerId = null;
    if (room === 'biblioteca') {
      renderLibrary();
      (
        content().querySelector<HTMLElement>(
          `[data-read="${closedArticle}"]`,
        ) ?? $('#library-search')
      )?.focus({ preventScroll: true });
    }
    if (room === 'logros') renderAchievements();
  });
  $('#institute-search')?.addEventListener('input', renderSearch);
  renderSearch();
  $('#tour-toggle')?.addEventListener('click', () => {
    tourIndex = 0;
    showTour();
  });
  $('#tour-close')?.addEventListener('click', () => {
    $('#tour-card')!.hidden = true;
    tourIndex = -1;
  });
  $('#tour-next')?.addEventListener('click', () => {
    if (++tourIndex >= tour.length) {
      $('#tour-card')!.hidden = true;
      tourIndex = -1;
      overview();
    } else showTour();
  });
  $('#fallback-directory')?.addEventListener('click', () =>
    openDialog('search-dialog'),
  );
  $('#school3d-panel-close')?.addEventListener('click', () => {
    if (document.documentElement.dataset.scene === 'failed') overview();
  });
  $('#school3d-rooms-toggle')?.addEventListener('click', () => {
    if (document.documentElement.dataset.scene === 'failed')
      openDialog('search-dialog');
  });
  $('#school3d-home')?.addEventListener('click', () => {
    if (document.documentElement.dataset.scene === 'failed') overview();
  });
  window.addEventListener('hashchange', () => {
    if (document.documentElement.dataset.scene === 'failed') {
      const id = location.hash.slice(6) as VoxelZoneId;
      if (VOXEL_ROOMS.some((r) => r.id === id)) showFallbackRoom(id);
      else overview();
    }
  });
  window.addEventListener('roxana:scene-unavailable', () => {
    const id = location.hash.slice(6) as VoxelZoneId;
    if (VOXEL_ROOMS.some((r) => r.id === id)) showFallbackRoom(id);
  });
}
