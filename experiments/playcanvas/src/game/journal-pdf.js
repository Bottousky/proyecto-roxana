import { toCanvas, getFontEmbedCSS } from 'html-to-image';
import { jsPDF } from 'jspdf';
import { journalSheets } from './journal.js';

// The Bitácora as a file the player keeps. Built in the browser, from the same pages read on screen:
// every notebook page is poured into A5 sheets (a long page continues on the next sheet, never cut
// mid-paragraph), then photographed and bound. Two bindings share those sheets:
//  · «spreads»: A4 landscape, the notebook open, two A5 pages per sheet. Reads well on a screen and
//    prints at home at 100 % on the paper every school has.
//  · «book»: A5 portrait, one page per sheet, the size of a field notebook, for a print shop.

const MM = 96 / 25.4;                       // CSS pixels per millimetre
const A5 = { w: 148 * MM, h: 210 * MM };
const A4 = { w: 297 * MM, h: 210 * MM };
const MARGIN = { side: 14 * MM, top: 14 * MM, bottom: 18 * MM };
const FLOW = { w: A5.w - 2 * MARGIN.side, h: A5.h - MARGIN.top - MARGIN.bottom, gap: 2 * MARGIN.side };
const ROUGH = '<svg class="dj-defs" width="0" height="0" aria-hidden="true" focusable="false"><filter id="dj-rough-pdf"><feTurbulence type="fractalNoise" baseFrequency=".04" numOctaves="2" seed="7"/><feDisplacementMap in="SourceGraphic" scale="3.2"/></filter></svg>';
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const px = n => `${n.toFixed(2)}px`;
const nextFrame = () => new Promise(resolve => requestAnimationFrame(() => resolve()));
// The photographer copies HTML styles but not the ones SVG strokes get from classes: write them inline.
const SVG_PROPS = ['fill', 'fill-opacity', 'stroke', 'stroke-width', 'stroke-opacity', 'stroke-linecap', 'stroke-linejoin', 'stroke-dasharray', 'opacity', 'font-family', 'font-size', 'font-weight', 'font-style', 'text-anchor', 'paint-order'];
function inlineSvgStyles(root) {
  root.querySelectorAll('svg *').forEach(el => {
    const cs = getComputedStyle(el);
    el.setAttribute('style', SVG_PROPS.map(k => `${k}:${cs.getPropertyValue(k)}`).join(';'));
  });
}

/** A notebook page's writing, ready for paper: no buttons, drawers open, the player's own notes as ink. */
export function cleanBody(sectionHtml, seenNotes = new Set()) {
  const holder = document.createElement('div');
  holder.innerHTML = sectionHtml;
  const body = holder.querySelector('.dj-page-body');
  if (!body) return null;
  body.querySelectorAll('.dj-all-trials, .dj-own-note small, .dj-stain').forEach(el => el.remove());
  // Edda's margin notes repeat page after page on screen; on paper each one is written once.
  body.querySelectorAll('.dj-marginalia').forEach(note => { const text = note.textContent.trim(); if (seenNotes.has(text)) note.remove(); else seenNotes.add(text); });
  body.querySelectorAll('details').forEach(d => { d.open = true; d.setAttribute('open', ''); });
  // A heading never ends a sheet alone: it travels with the first entry that follows it.
  body.querySelectorAll('.dj-evidence-head').forEach(head => {
    const list = head.nextElementSibling, keep = document.createElement('div');
    keep.className = 'dj-keep';
    head.replaceWith(keep);
    keep.appendChild(head);
    if (list?.matches('ol') && list.firstElementChild) { const first = document.createElement('ol'); first.className = list.className; first.appendChild(list.firstElementChild); keep.appendChild(first); }
    else if (list && !list.matches('ol')) keep.appendChild(list);
  });
  body.querySelectorAll('textarea').forEach(t => {
    const note = document.createElement('p');
    note.className = 'dj-printed-note';
    note.textContent = t.value || t.textContent || '';
    t.replaceWith(note);
  });
  return body.innerHTML;
}

/** Pour one notebook page into as many A5 sheets as it needs: CSS columns of the sheet's size do the cutting. */
export function pourIntoSheets(host, html) {
  const flow = document.createElement('div');
  flow.className = 'dj-pdf-flow dj-page-body';
  Object.assign(flow.style, { width: px(FLOW.w), height: px(FLOW.h), columnWidth: px(FLOW.w), columnGap: px(FLOW.gap), columnFill: 'auto' });
  flow.innerHTML = html;
  host.appendChild(flow);
  // A sheet exists only if some visible writing or drawing starts on it: empty columns are skipped.
  const left = flow.getBoundingClientRect().left, step = FLOW.w + FLOW.gap;
  const leaves = [...flow.querySelectorAll('*')].filter(el => !el.children.length || el.matches('svg, img, .dj-photo-img, .dj-face'));
  const columns = [...new Set(leaves.map(el => el.getBoundingClientRect()).filter(r => r.width > 1 && r.height > 1).map(r => Math.max(0, Math.floor((r.left - left) / step + .02))))].sort((a, b) => a - b);
  if (!columns.length) columns.push(0);
  flow.remove();
  return columns.map(i => {
    const sheet = document.createElement('div');
    sheet.className = 'dj-pdf-sheet dj-page';
    sheet.innerHTML = `${ROUGH}<div class="dj-pdf-window" style="left:${px(MARGIN.side)};top:${px(MARGIN.top)};width:${px(FLOW.w)};height:${px(FLOW.h)}"></div><span class="dj-pdf-folio"></span>`;
    const copy = flow.cloneNode(true);
    copy.style.transform = `translateX(${px(-i * (FLOW.w + FLOW.gap))})`;
    sheet.querySelector('.dj-pdf-window').appendChild(copy);
    return sheet;
  });
}

function coverSheet(owner) {
  const sheet = document.createElement('div');
  sheet.className = 'dj-pdf-sheet dj-pdf-cover';
  sheet.innerHTML = `<span class="eyebrow">INSTITUTO ROXANA · CUADERNO DE CAMPO</span><h1>Ohmdal</h1><p class="dj-pdf-arc">Arco I · La Luz</p><p class="dj-pdf-owner">Bitácora de ${esc(owner)}</p><p class="dj-pdf-motto">Lo que vi. Lo que probé. Lo que todavía no sé.</p>`;
  return sheet;
}
function backSheet() {
  const sheet = document.createElement('div');
  sheet.className = 'dj-pdf-sheet dj-pdf-cover dj-pdf-back';
  sheet.innerHTML = '<p class="dj-pdf-motto">Un mundo que olvidó cómo encender su luz.<br>Un cuaderno que recuerda cómo volvió.</p><span class="eyebrow">OHMDAL · INSTITUTO ROXANA</span>';
  return sheet;
}
function blankSheet() {
  const sheet = document.createElement('div');
  sheet.className = 'dj-pdf-sheet dj-page';
  sheet.innerHTML = '<p class="dj-pdf-blank">Quedan hojas para el próximo mundo.</p><span class="dj-pdf-folio"></span>';
  return sheet;
}

/**
 * Bind the player's Bitácora into a PDF. `layout` is «spreads» (A4 landscape) or «book» (A5).
 * Returns { blob, filename, sheets }. `onProgress(done, total)` reports each sheet photographed.
 */
export async function buildJournalPdf(state, { layout = 'spreads', puzzles, evidenceFor, onProgress = () => {}, pixelRatio } = {}) {
  // About 150 dpi to read and print at home; about 215 dpi for the A5 book a print shop receives.
  pixelRatio ??= layout === 'book' ? 2.25 : 1.6;
  const host = document.createElement('div');
  host.className = 'dj-pdf';
  host.setAttribute('aria-hidden', 'true');
  document.body.appendChild(host);
  try {
    await document.fonts?.ready;
    const { owner, sections } = journalSheets(state, { puzzles, evidenceFor });
    const seenNotes = new Set();
    const pages = sections.map(html => cleanBody(html, seenNotes)).filter(Boolean).flatMap(html => pourIntoSheets(host, html));
    pages.forEach((sheet, i) => { const folio = sheet.querySelector('.dj-pdf-folio'); if (folio) { folio.textContent = String(i + 1); folio.classList.add(i % 2 ? 'is-right' : 'is-left'); } });
    // Pairs of facing pages for the A4 binding; the cover closes the book on the first sheet.
    const plates = [];
    if (layout === 'book') plates.push([coverSheet(owner)], ...pages.map(p => [p]), [backSheet()]);
    else {
      if (pages.length % 2) pages.push(blankSheet());
      plates.push([backSheet(), coverSheet(owner)]);
      for (let i = 0; i < pages.length; i += 2) plates.push([pages[i], pages[i + 1]]);
    }
    const size = layout === 'book' ? A5 : A4;
    const pdf = new jsPDF({ orientation: layout === 'book' ? 'portrait' : 'landscape', unit: 'mm', format: layout === 'book' ? 'a5' : 'a4', compress: true });
    pdf.setProperties({ title: `Bitácora de ${owner} · Ohmdal, Arco I`, author: owner, creator: 'Ohmdal · Instituto Roxana', subject: 'Cuaderno de campo del Arco I: La Luz' });
    let fontEmbedCSS;
    for (let n = 0; n < plates.length; n++) {
      const plate = document.createElement('div');
      plate.className = `dj-pdf-plate dj-pdf-${layout}`;
      Object.assign(plate.style, { width: px(size.w), height: px(size.h) });
      plates[n].forEach(sheet => plate.appendChild(sheet));
      host.appendChild(plate);
      await nextFrame();
      inlineSvgStyles(plate);
      fontEmbedCSS ??= await getFontEmbedCSS(plate);
      const canvas = await toCanvas(plate, { pixelRatio, fontEmbedCSS, cacheBust: false, backgroundColor: '#2a1c12', width: size.w, height: size.h });
      if (n) pdf.addPage();
      pdf.addImage(canvas.toDataURL('image/jpeg', .86), 'JPEG', 0, 0, size.w / MM, size.h / MM, undefined, 'FAST');
      plate.remove();
      onProgress(n + 1, plates.length);
    }
    const slug = String(owner).normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^A-Za-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'viajero';
    return { blob: pdf.output('blob'), filename: `Bitacora-Ohmdal-${slug}${layout === 'book' ? '-libro-A5' : ''}.pdf`, sheets: plates.length };
  } finally {
    host.remove();
  }
}

/** Build the PDF and hand it to the player as a download. */
export async function downloadJournal(state, options = {}) {
  const { blob, filename, sheets } = await buildJournalPdf(state, options);
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(link.href), 60000);
  return { filename, sheets, bytes: blob.size };
}
