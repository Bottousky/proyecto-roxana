import './style.css';
import { CHAPTERS } from './chapters.ts';
import { cells, evaluate, initialBoard, transform } from './core.ts';
import { readSave, SAVE_KEY, writeSave } from './save.ts';
import { createWorld } from './world.ts';
import { createAudio } from './audio.ts';
import type { Action, Board, Cell, Piece } from './types.ts';
import type { ExperienceRuntimeModule, RuntimeHandle } from '../types.ts';

const clone = <T>(value: T): T => structuredClone(value);
const escape = (text: string) => text.replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]!));

export async function mountArithmos(host: HTMLElement, leave: () => void): Promise<RuntimeHandle> {
  host.classList.add('ari');
  const save = readSave();
  let storedMotionPreference = false;
  try { storedMotionPreference = typeof JSON.parse(localStorage.getItem(SAVE_KEY) ?? 'null')?.reducedMotion === 'boolean'; } catch { /* Fresh or unavailable storage uses the device preference. */ }
  if (!storedMotionPreference && window.matchMedia('(prefers-reduced-motion: reduce)').matches) save.reducedMotion = true;
  let chapterIndex = save.chapter;
  let board = clone(save.boards[chapterIndex]);
  let selected: string | null = null;
  let mode: 'move' | 'cut' | 'join' = 'move';
  let cutAt: number | null = null;
  let history: Board[] = [];
  let future: Board[] = [];
  let begun = false;
  let paused = false;
  let lens = false;
  let hintIndex = 0;
  let disposed = false;
  let suppressMove = false;
  let dialogueTimer = 0;
  const audio = createAudio();
  host.innerHTML = `
    <div class="ari-world" aria-label="El puerto de Arithmos. Toca una pieza para transformarla."></div>
    <div class="ari-vignette"></div>
    <header class="ari-hud" hidden>
      <button class="ari-home" data-do="menu" aria-label="Pausa y viaje">☰</button>
      <div class="ari-heading"><span class="ari-kicker">ARITHMOS · LAS FORMAS DEL REGRESO</span><h1 class="ari-place"></h1></div>
      <div class="ari-top-actions"><button data-do="lens" aria-pressed="false" title="Cambiar a vista de planta (V)">◈ <span>Otra mirada</span></button><button data-do="journal" aria-label="Abrir bitácora">▤ <span>Bitácora</span></button></div>
    </header>
    <aside class="ari-objective" hidden><span class="ari-kicker">EN ESTE LUGAR</span><p></p></aside>
    <div class="ari-camera" hidden><button data-do="zoom-in" aria-label="Acercar a la pieza">+</button><button data-do="zoom-out" aria-label="Alejar la cámara">−</button><button data-do="recenter" aria-label="Ver el puerto completo">⌖</button></div>
    <div class="ari-dialogue" hidden><div class="ari-portrait" aria-hidden="true"><i></i></div><div><b>BRIZ</b><p></p></div><button data-do="quiet" aria-label="Cerrar diálogo">×</button></div>
    <div class="ari-feedback" role="status" aria-live="polite"></div>
    <div class="ari-workbench" hidden>
      <div class="ari-tool-top"><span class="ari-kicker ari-selection">TOCA LA MATERIA</span><button data-do="deselect" aria-label="Soltar selección">×</button></div>
      <p class="ari-preview-scroll" hidden>↕ Desliza la miniatura para recorrer todas las partes.</p>
      <div class="ari-piece-preview" aria-label="Pieza seleccionada. En modo separar, toca dónde comienza la segunda pieza."></div>
      <div class="ari-cut-confirm" hidden><p class="ari-cut-legend"><span class="ari-cut-stay">Esta parte se queda</span><span class="ari-cut-away">Esta parte se separa</span></p><button class="ari-primary" data-do="cut-apply" disabled>Separar lo marcado</button></div>
      <div class="ari-tools">
        <button data-do="narrow" title="Estrechar ([)"><span>↤↦</span>Estrechar</button>
        <button data-do="widen" title="Ensanchar (])"><span>↔</span>Ensanchar</button>
        <button data-do="rotate" title="Girar (R)"><span>⟳</span>Girar</button>
        <button data-do="cut" title="Separar (X)"><span>⋮</span>Separar</button>
        <button data-do="join" title="Unir (J)"><span>⊔</span>Unir</button>
      </div>
      <p class="ari-mode-help">Arrastra la pieza sobre el mundo.</p>
      <div class="ari-nudge" aria-label="Mover la pieza por pasos"><button data-do="move-left" aria-label="Mover pieza a la izquierda">←</button><button data-do="move-up" aria-label="Mover pieza al fondo">↑</button><button data-do="move-down" aria-label="Mover pieza al frente">↓</button><button data-do="move-right" aria-label="Mover pieza a la derecha">→</button><button data-do="cycle" aria-label="Seleccionar la siguiente pieza">Otra pieza</button></div>
    </div>
    <footer class="ari-bottom" hidden>
      <div class="ari-history"><button data-do="undo" title="Deshacer (Z)" aria-label="Deshacer">↶</button><button data-do="redo" title="Rehacer (Y)" aria-label="Rehacer">↷</button><button data-do="hint">Mirar con calma</button></div>
      <p class="ari-input-hint">Toca y arrastra · Todo puede cambiar de forma</p>
      <button class="ari-next" data-do="next" hidden>Seguir a Briz <span>→</span></button>
    </footer>
    <section class="ari-title">
      <div class="ari-title-content"><p class="ari-kicker">UN MUNDO DE PROYECTO ROXANA</p><h1>ARITHMOS</h1><h2>Las formas del regreso</h2><p class="ari-title-copy">El puerto recuerda cada barco.<br>Ha olvidado cómo dejarlo partir.</p><button class="ari-primary" data-do="start">${save.restored.length ? 'Continuar el viaje' : 'Cruzar el umbral'} <span>→</span></button><p class="ari-title-note">Una aventura para tocar, transformar y descubrir.<br>Sin prisa. Sin perder una sola pieza.</p><a href="/#aulas">Instituto Roxana</a></div>
      <div class="ari-title-mark" aria-hidden="true">I</div>
    </section>
    <dialog class="ari-modal"></dialog>
  `;
  const $ = <T extends HTMLElement = HTMLElement>(selector: string) => host.querySelector<T>(selector)!;
  const world = createWorld($('.ari-world'), { pick, move: (id, x, z) => {
    if (begun && !paused && !suppressMove) act({ type: 'move', id, x, z });
    suppressMove = false;
  } });
  world.setReducedMotion(save.reducedMotion);
  audio.setMuted(save.muted);
  world.load(CHAPTERS[chapterIndex], chapterIndex, save.restored.length);
  world.update(board, evaluate(CHAPTERS[chapterIndex], board), null);
  const dialog = $<HTMLDialogElement>('dialog');

  function persist(): void {
    const chapter = CHAPTERS[chapterIndex];
    if (!save.restored.includes(chapter.id) || evaluate(chapter, board).solved) save.boards[chapterIndex] = clone(board);
    save.chapter = chapterIndex;
    if (!writeSave(save)) feedback('El navegador no permite guardar aquí. Puedes seguir jugando durante esta visita.');
  }

  function feedback(text: string): void { $('.ari-feedback').textContent = text; }
  function say(text: string): void {
    window.clearTimeout(dialogueTimer);
    $('.ari-dialogue p').textContent = text;
    $('.ari-dialogue').hidden = false;
    // Dialogue stays until dismissed: reading never competes with a timer.
  }

  function pick(cell: Cell): void {
    if (!begun || paused) return;
    suppressMove = mode !== 'move';
    if (mode === 'cut') {
      selected = cell.pieceId;
      cutAt = cell.index > 0 ? cell.index : null;
      if (cutAt === null) feedback('La pieza necesita conservar una parte. Toca otra unidad para ver el corte.');
      else feedback('Mira las dos partes marcadas. El corte todavía no está hecho.');
    } else if (mode === 'join' && selected && selected !== cell.pieceId) {
      act({ type: 'join', ids: [selected, cell.pieceId] });
      mode = 'move';
    } else { selected = cell.pieceId; cutAt = null; audio.pick(); }
    render();
  }

  function act(action: Action): void {
    if (paused || !begun) return;
    const result = transform(board, action);
    if (!result.changed) { if (result.reason) { feedback(result.reason); audio.reject(); } world.update(board, evaluate(CHAPTERS[chapterIndex], board), selected); return; }
    history.push(clone(board));
    future = [];
    board = result.board;
    cutAt = null;
    if (!board.pieces.some(piece => piece.id === selected)) selected = board.pieces[0]?.id ?? null;
    audio.transform();
    const evaluation = evaluate(CHAPTERS[chapterIndex], board);
    feedback(evaluation.solved ? 'Este lugar vuelve a vivir.' : evaluation.message);
    if (evaluation.solved && !save.restored.includes(CHAPTERS[chapterIndex].id)) {
      save.restored.push(CHAPTERS[chapterIndex].id);
      save.journal.push(CHAPTERS[chapterIndex].id);
      const final = chapterIndex === CHAPTERS.length - 1;
      world.celebrate(final);
      audio.restore(final);
      say(CHAPTERS[chapterIndex].restored);
      host.classList.add('ari-restored');
    }
    persist(); render();
  }

  function render(): void {
    const chapter = CHAPTERS[chapterIndex];
    const evaluation = evaluate(chapter, board);
    world.update(board, evaluation, selected);
    $('.ari-place').textContent = chapter.title;
    $('.ari-objective p').textContent = chapter.objective;
    const piece = board.pieces.find(p => p.id === selected);
    $('.ari-workbench').hidden = !piece || !begun;
    $('.ari-workbench').classList.toggle('ari-cutting', mode === 'cut');
    $('.ari-selection').textContent = mode === 'cut' ? 'MARCA · MIRA · SEPARA' : mode === 'join' ? 'TOCA LA OTRA PIEZA' : 'UNA PIEZA · MUCHAS FORMAS';
    $('.ari-mode-help').textContent = mode === 'cut' ? cutAt === null ? 'Toca una unidad. Se marcarán esa y las siguientes, fila por fila. Desliza la miniatura para ver más.' : 'Contorno continuo: se queda. Contorno a trazos: se separa. Puedes cambiar la marca antes de confirmar.' : mode === 'join' ? 'Toca otra pieza del mundo, o pulsa C para reunir la siguiente.' : 'Arrastra para mover · Flechas también mueven';
    $('.ari-cut-confirm').hidden = mode !== 'cut';
    $<HTMLButtonElement>('[data-do="cut-apply"]').disabled = cutAt === null;
    const previewScroll = $('.ari-piece-preview').scrollTop;
    $('.ari-piece-preview').innerHTML = piece ? preview(piece) : '';
    $('.ari-piece-preview').scrollTop = previewScroll;
    $('.ari-piece-preview').style.setProperty('--cols', String(piece?.width ?? 1));
    $('.ari-preview-scroll').hidden = $('.ari-piece-preview').scrollHeight <= $('.ari-piece-preview').clientHeight + 1 && $('.ari-piece-preview').scrollWidth <= $('.ari-piece-preview').clientWidth + 1;
    host.querySelectorAll<HTMLButtonElement>('[data-do="cut"], [data-do="join"]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.do === mode)));
    $<HTMLButtonElement>('[data-do="undo"]').disabled = !history.length;
    $<HTMLButtonElement>('[data-do="redo"]').disabled = !future.length;
    $<HTMLButtonElement>('[data-do="narrow"]').disabled = !piece || piece.width <= 1;
    $<HTMLButtonElement>('[data-do="widen"]').disabled = !piece || piece.width >= piece.units.length;
    $<HTMLButtonElement>('[data-do="cut"]').disabled = !piece || piece.units.length <= 1;
    $<HTMLButtonElement>('[data-do="join"]').disabled = !piece || board.pieces.length < 2;
    const restored = save.restored.includes(chapter.id);
    $('.ari-next').hidden = !restored || !begun;
    $('.ari-next').innerHTML = chapterIndex === CHAPTERS.length - 1 ? 'Contemplar el regreso <span>→</span>' : 'Seguir a Briz <span>→</span>';
    host.classList.toggle('ari-restored', restored);
    host.dataset.chapter = chapter.id;
    host.dataset.solved = String(evaluation.solved);
  }

  function preview(piece: Piece): string {
    return piece.units.map((unit, index) => {
      const marked = mode === 'cut' && cutAt !== null;
      const part = marked ? index < cutAt! ? 'ari-cut-stay' : 'ari-cut-away' : '';
      const label = marked ? index < cutAt! ? 'Esta unidad se queda' : 'Esta unidad se separa' : 'Marcar el comienzo de la segunda pieza';
      return `<button class="ari-unit ${unit.matter} ${part}" data-cell="${index}" aria-label="${mode === 'cut' ? label : 'Parte de la pieza'} ${index + 1}">${unit.matter === 'amber' ? '○' : 'Ⅱ'}</button>`;
    }).join('');
  }

  function go(index: number): void {
    if (index < 0 || index >= CHAPTERS.length || index > save.restored.length) return;
    persist();
    chapterIndex = index; board = clone(save.boards[index]); selected = null; mode = 'move'; cutAt = null; history = []; future = []; hintIndex = 0;
    world.load(CHAPTERS[index], index, save.restored.length);
    audio.setChapter(index);
    feedback('');
    say(save.restored.includes(CHAPTERS[index].id) ? CHAPTERS[index].restored : CHAPTERS[index].arrival);
    persist(); render();
  }

  function setPaused(value: boolean): void {
    paused = value;
    world.setPaused(value || !begun);
    audio.setPaused(value || !begun || document.hidden);
  }

  function modal(html: string): void {
    cutAt = null; mode = 'move'; render();
    setPaused(true);
    dialog.innerHTML = `<button class="ari-close" data-do="close" aria-label="Cerrar">×</button>${html}`;
    if (!dialog.open) dialog.showModal();
    dialog.querySelector<HTMLButtonElement>('button')?.focus();
  }
  function closeModal(): void { dialog.close(); setPaused(false); }

  function menu(): void {
    modal(`<p class="ari-kicker">UN RESPIRO EN EL VIAJE</p><h2>El puerto te espera.</h2><div class="ari-menu-grid"><button data-do="close">Seguir jugando</button><button data-do="sound">${save.muted ? 'Activar sonido' : 'Silenciar sonido'}</button><button data-do="motion">${save.reducedMotion ? 'Activar movimiento ambiental' : 'Reducir movimiento'}</button><button data-do="restart">Rehacer este lugar</button><button data-do="journal">Abrir bitácora</button><button data-do="leave">Volver al Instituto</button></div><h3>Rutas del puerto</h3><div class="ari-routes">${CHAPTERS.map((chapter, index) => `<button data-travel="${index}" ${index > save.restored.length ? 'disabled' : ''}><span>${save.restored.includes(chapter.id) ? '✦' : index === chapterIndex ? '◉' : '○'}</span>${escape(chapter.title)}</button>`).join('')}</div><p class="ari-small">Toca y arrastra una pieza. Sus partes siguen contigo al cambiarla de forma. Teclado: Tab selecciona controles; C cambia de pieza; flechas mueven; [ y ] estrechan y ensanchan; R gira; X separa; J une; Z/Y deshacen y rehacen; V cambia la mirada; Esc pausa.</p>`);
  }

  function journal(): void {
    const entries = CHAPTERS.filter(chapter => save.journal.includes(chapter.id));
    modal(`<p class="ari-kicker">BITÁCORA · LO QUE EL VIAJE DEJÓ</p><h2>Distintas formas.<br>La misma memoria.</h2>${entries.length ? entries.map(chapter => {
      const savedBoard = save.boards[CHAPTERS.indexOf(chapter)];
      return `<article class="ari-entry"><span class="ari-kicker">${escape(chapter.place)}</span><h3>${escape(chapter.concept)}</h3><div class="ari-journal-shapes">${savedBoard.pieces.map(piece => `<div style="--cols:${piece.width}">${piece.units.map(unit => `<i class="${unit.matter}">${unit.matter === 'amber' ? '○' : 'Ⅱ'}</i>`).join('')}</div>`).join('<span>+</span>')}</div><p>${escape(chapter.journal)}</p><p class="ari-formal">${savedBoard.pieces.map(piece => piece.units.length % piece.width === 0 ? `${piece.width} × ${piece.units.length / piece.width}` : `${piece.units.length}`).join(' + ')} = ${cells(savedBoard).length} partes conservadas</p></article>`;
    }).join('') : '<p>Aún no hay páginas escritas. La bitácora guarda lo que haces, cuando algo vuelve a ser posible.</p>'}<button class="ari-primary" data-do="close">Volver al mundo</button>`);
  }

  function ending(): void {
    modal(`<p class="ari-kicker">ARCO I · EL PUERTO VUELVE A PARTIR</p><h2>Hay más de una forma<br>de volver a casa.</h2><p>Briz despliega su barca. Esta vez, el puerto entero levanta las velas.</p><blockquote>«Me guardé un pliegue para el regreso. Antes me parecía un desperdicio.»<cite>Briz, barquero de las formas</cite></blockquote><div class="ari-menu-grid"><button class="ari-primary" data-do="close">Quedarme a contemplar</button><button data-do="journal">Abrir la bitácora</button><button data-do="menu">Volver a recorrer el puerto</button><button data-do="leave">Regresar al Instituto</button></div><p class="ari-small">El puerto conserva tus transformaciones. Puedes volver a todos los lugares y buscar otras formas.</p>`);
  }

  function command(command: string): void {
    const piece = board.pieces.find(p => p.id === selected);
    if (['cycle', 'deselect', 'cut', 'join', 'undo', 'redo', 'restart'].includes(command)) cutAt = null;
    switch (command) {
      case 'start':
        begun = true; $('.ari-title').hidden = true;
        $('.ari-hud').hidden = false; $('.ari-bottom').hidden = false; $('.ari-objective').hidden = false; $('.ari-camera').hidden = false;
        audio.start(); audio.setChapter(chapterIndex); setPaused(false);
        say(save.restored.includes(CHAPTERS[chapterIndex].id) ? CHAPTERS[chapterIndex].restored : CHAPTERS[chapterIndex].arrival); render(); break;
      case 'quiet': $('.ari-dialogue').hidden = true; break;
      case 'menu': menu(); break;
      case 'close': closeModal(); break;
      case 'journal': journal(); break;
      case 'leave': persist(); leave(); break;
      case 'sound': save.muted = !save.muted; audio.setMuted(save.muted); persist(); menu(); break;
      case 'motion': save.reducedMotion = !save.reducedMotion; world.setReducedMotion(save.reducedMotion); persist(); menu(); break;
      case 'lens': lens = !lens; world.setLens(lens); $<HTMLButtonElement>('[data-do="lens"]').setAttribute('aria-pressed', String(lens)); break;
      case 'zoom-in': world.zoom(0.4); break;
      case 'zoom-out': world.zoom(-0.4); break;
      case 'recenter': world.resetCamera(); break;
      case 'cycle': {
        const index = board.pieces.findIndex(p => p.id === selected);
        const next = board.pieces[(index + 1) % board.pieces.length];
        if (mode === 'join' && next && selected !== next.id) act({ type: 'join', ids: [selected!, next.id] });
        else selected = next?.id ?? null;
        mode = 'move'; render(); break;
      }
      case 'move-left': case 'move-right': case 'move-up': case 'move-down':
        if (piece) act({ type: 'move', id: piece.id, x: piece.x + (command === 'move-right' ? 1 : command === 'move-left' ? -1 : 0), z: piece.z + (command === 'move-down' ? 1 : command === 'move-up' ? -1 : 0) }); break;
      case 'next': if (save.restored.includes(CHAPTERS[chapterIndex].id)) { if (chapterIndex === CHAPTERS.length - 1) ending(); else go(chapterIndex + 1); } break;
      case 'deselect': selected = null; mode = 'move'; render(); break;
      case 'narrow': if (piece) act({ type: 'reshape', id: piece.id, width: piece.width - 1 }); break;
      case 'widen': if (piece) act({ type: 'reshape', id: piece.id, width: piece.width + 1 }); break;
      case 'rotate': if (piece) act({ type: 'rotate', id: piece.id }); break;
      case 'cut': mode = mode === 'cut' ? 'move' : 'cut'; render(); break;
      case 'cut-apply':
        if (piece && mode === 'cut' && cutAt !== null) {
          act({ type: 'split', id: piece.id, at: cutAt });
          mode = 'move'; cutAt = null; render();
        }
        break;
      case 'join': mode = mode === 'join' ? 'move' : 'join'; render(); break;
      case 'undo': if (history.length) { future.push(clone(board)); board = history.pop()!; mode = 'move'; persist(); render(); feedback('La materia vuelve a su forma anterior.'); } break;
      case 'redo': if (future.length) { history.push(clone(board)); board = future.pop()!; persist(); render(); } break;
      case 'restart': history.push(clone(board)); board = initialBoard(CHAPTERS[chapterIndex]); future = []; selected = null; mode = 'move'; persist(); closeModal(); render(); feedback('Todas las partes están de vuelta. Puedes ensayar otra forma.'); break;
      case 'hint': feedback(CHAPTERS[chapterIndex].hints[Math.min(hintIndex++, CHAPTERS[chapterIndex].hints.length - 1)]); break;
    }
  }

  function click(event: Event): void {
    const target = (event.target as HTMLElement).closest<HTMLElement>('[data-do],[data-cell],[data-travel]');
    if (!target || (target as HTMLButtonElement).disabled) return;
    if (target.dataset.do) command(target.dataset.do);
    else if (target.dataset.travel) { closeModal(); go(Number(target.dataset.travel)); }
    else if (target.dataset.cell !== undefined && selected) {
      const cell = cells(board).find(c => c.pieceId === selected && c.index === Number(target.dataset.cell));
      if (cell) { mode = 'cut'; pick(cell); }
    }
  }
  function keyboard(event: KeyboardEvent): void {
    if (!begun || event.ctrlKey || event.metaKey || event.altKey) return;
    if (event.key === 'Escape') { event.preventDefault(); cutAt = null; if (dialog.open) closeModal(); else if (mode !== 'move') { mode = 'move'; render(); } else menu(); return; }
    if (paused || /INPUT|TEXTAREA|SELECT/.test((event.target as HTMLElement).tagName)) return;
    const key = event.key.toLowerCase();
    const shortcuts: Record<string, string> = { '[': 'narrow', ']': 'widen', r: 'rotate', x: 'cut', j: 'join', z: 'undo', y: 'redo', v: 'lens' };
    if (shortcuts[key]) { event.preventDefault(); command(shortcuts[key]); return; }
    if (key === 'c') {
      event.preventDefault();
      command('cycle'); return;
    }
    const piece = board.pieces.find(p => p.id === selected);
    if (piece && key.startsWith('arrow')) { event.preventDefault(); act({ type: 'move', id: piece.id, x: piece.x + (key === 'arrowright' ? 1 : key === 'arrowleft' ? -1 : 0), z: piece.z + (key === 'arrowdown' ? 1 : key === 'arrowup' ? -1 : 0) }); }
  }
  function visibility(): void { world.setPaused(paused || document.hidden || !begun); audio.setPaused(paused || document.hidden || !begun); }
  function cancel(event: Event): void { event.preventDefault(); closeModal(); }
  host.addEventListener('click', click);
  window.addEventListener('keydown', keyboard);
  document.addEventListener('visibilitychange', visibility);
  dialog.addEventListener('cancel', cancel);
  render();

  // Read-only QA surface: all mutations still go through actual UI and the domain.
  const qa = { get state() { return clone({ chapter: chapterIndex, board, evaluation: evaluate(CHAPTERS[chapterIndex], board), restored: save.restored, selected, mode, cutAt }); }, project: (x: number, z: number) => world.project(x, z) };
  if (import.meta.env.DEV) Object.defineProperty(window, '__arithmos', { configurable: true, value: qa });
  return {
    async travelTo() {}, snapshot: () => ({ runtime: 'cosmos-web', data: { chapter: chapterIndex } }),
    pause: () => setPaused(true), resume: () => setPaused(false),
    async destroy() {
      if (disposed) return; disposed = true;
      persist(); window.clearTimeout(dialogueTimer);
      host.removeEventListener('click', click); window.removeEventListener('keydown', keyboard);
      document.removeEventListener('visibilitychange', visibility); dialog.removeEventListener('cancel', cancel);
      if (dialog.open) dialog.close(); world.dispose(); audio.dispose();
      if (import.meta.env.DEV) Reflect.deleteProperty(window, '__arithmos');
      host.replaceChildren(); host.classList.remove('ari');
    },
  };
}

export const arithmosRuntime: ExperienceRuntimeModule = {
  runtime: 'cosmos-web',
  mount: (host, context) => mountArithmos(host, () => { void context.requestTravel({ experienceId: 'instituto' }); }),
};
