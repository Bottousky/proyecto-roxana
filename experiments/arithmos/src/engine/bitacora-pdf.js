// La Bitácora como archivo que el jugador se queda: se arma en el navegador con las mismas páginas que se leen en
// pantalla (bitacora.js). Cada página se vuelca en hojas A5 (si es larga, sigue en la hoja siguiente sin cortar un
// renglón), cada hoja se fotografía (SVG con foreignObject → lienzo → JPEG) y se encuaderna con pdf.js:
//  · «pliegos»: A4 apaisado, el cuaderno abierto, dos páginas por hoja; se lee en pantalla y se imprime en casa;
//  · «libro»: A5 vertical, una página por hoja, el tamaño de un cuaderno, para una imprenta.
// Sin dependencias: lo que hacía html-to-image en Ohmdal, acá en ~40 líneas.

import {bookSections, TOMO} from './bitacora.js';
import {jpegPdf} from './pdf.js';

const MM = 96 / 25.4;
const A5 = {w: 148 * MM, h: 210 * MM}, A4 = {w: 297 * MM, h: 210 * MM};
const MARGIN = {outer: 16 * MM, inner: 11 * MM, top: 13 * MM, bottom: 17 * MM};
const FLOW = {w: A5.w - MARGIN.outer - MARGIN.inner, h: A5.h - MARGIN.top - MARGIN.bottom};
const GAP = 40;
const px = n => `${n.toFixed(2)}px`;
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
const nextFrame = () => new Promise(r => requestAnimationFrame(() => r()));

// Las fuentes del juego, incrustadas: una imagen SVG no puede pedir archivos.
const FONTS = [
  ['Kalam', 300, 'assets/fonts/kalam-latin-300-normal.woff2'], ['Kalam', 400, 'assets/fonts/kalam-latin-400-normal.woff2'],
  ['Kalam', 700, 'assets/fonts/kalam-latin-700-normal.woff2'], ['Atkinson Hyperlegible', 400, 'assets/fonts/atkinson-hyperlegible-latin-400-normal.woff2'],
  ['Atkinson Hyperlegible', 700, 'assets/fonts/atkinson-hyperlegible-latin-700-normal.woff2'],
];
let cssCache = null;
async function sheetCss() {
  if (cssCache) return cssCache;
  const dataUrl = async url => {
    const bytes = new Uint8Array(await (await fetch(url)).arrayBuffer());
    let bin = '';
    for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
    return `data:font/woff2;base64,${btoa(bin)}`;
  };
  const faces = await Promise.all(FONTS.map(async ([family, weight, url]) => `@font-face{font-family:'${family}';font-weight:${weight};src:url(${await dataUrl(url)}) format('woff2')}`));
  const css = await (await fetch('bitacora.css')).text();
  cssCache = `${faces.join('')}\n${css}`;
  return cssCache;
}

/** Vuelca una página en tantas hojas A5 como necesite: columnas CSS del tamaño de la hoja hacen el corte. */
function pourIntoSheets(host, html) {
  const flow = document.createElement('div');
  flow.className = 'bt-pdf-flow';
  Object.assign(flow.style, {width: px(FLOW.w), height: px(FLOW.h), columnWidth: px(FLOW.w), columnGap: px(GAP), columnFill: 'auto'});
  flow.innerHTML = html;
  host.appendChild(flow);
  // una hoja existe sólo si en ella empieza algo visible: las columnas vacías no
  const left = flow.getBoundingClientRect().left, step = FLOW.w + GAP;
  const leaves = [...flow.querySelectorAll('*')].filter(el => !el.children.length || el.matches('svg, img, .bt-photo, .bt-rule'));
  const cols = [...new Set(leaves.map(el => el.getBoundingClientRect()).filter(r => r.width > 1 && r.height > 1).map(r => Math.max(0, Math.floor((r.left - left) / step + 0.02))))].sort((a, b) => a - b);
  if (!cols.length) cols.push(0);
  flow.remove();
  return cols.map(i => {
    const sheet = document.createElement('div');
    sheet.className = 'bt-pdf-sheet';
    sheet.innerHTML = '<div class="bt-pdf-window"></div><span class="bt-pdf-folio"></span>';
    const copy = flow.cloneNode(true);
    copy.style.transform = `translateX(${px(-i * step)})`;
    sheet.querySelector('.bt-pdf-window').appendChild(copy);
    return sheet;
  });
}

function placeWindow(sheet, side) {
  // margen de afuera más ancho (ahí va la línea roja); el de adentro, junto al lomo
  const win = sheet.querySelector('.bt-pdf-window');
  if (!win) return;
  Object.assign(win.style, {top: px(MARGIN.top), width: px(FLOW.w), height: px(FLOW.h), left: px(side === 'left' ? MARGIN.outer : MARGIN.inner)});
}

function coverSheet(owner) {
  const sheet = document.createElement('div');
  sheet.className = 'bt-pdf-sheet bt-pdf-cover';
  sheet.innerHTML = `<span class="bt-eyebrow">${esc(TOMO.publisher.toUpperCase())}</span><h1>${esc(TOMO.world)}</h1><p class="bt-pdf-tomo">Tomo ${TOMO.number} · ${esc(TOMO.subject)}</p>${owner ? `<p class="bt-pdf-owner">Bitácora de ${esc(owner)}</p>` : ''}<p class="bt-pdf-motto">Lo que vi. Lo que probé. Lo que todavía no sé.</p>`;
  return sheet;
}
function backSheet() {
  const sheet = document.createElement('div');
  sheet.className = 'bt-pdf-sheet bt-pdf-cover';
  sheet.innerHTML = `<p class="bt-pdf-motto">Un mundo que olvidó que una misma idea se puede escribir de muchas formas.<br>Un cuaderno que recuerda cómo volvió a verlas.</p><span class="bt-eyebrow">${esc(TOMO.world.toUpperCase())} · TOMO ${TOMO.number}</span>`;
  return sheet;
}
function blankSheet() {
  const sheet = document.createElement('div');
  sheet.className = 'bt-pdf-sheet';
  sheet.innerHTML = '<p class="bt-pdf-blank">Quedan hojas para el tomo 2.</p><span class="bt-pdf-folio"></span>';
  return sheet;
}

/** Fotografía una placa (una o dos hojas) en un lienzo, con el estilo y las fuentes incrustados. */
async function photograph(plate, size, ratio, css) {
  const xml = new XMLSerializer().serializeToString(plate);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size.w}" height="${size.h}"><foreignObject x="0" y="0" width="100%" height="100%"><div xmlns="http://www.w3.org/1999/xhtml" class="bt-pdf" style="position:static"><style>${css.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</style>${xml}</div></foreignObject></svg>`;
  const img = new Image();
  img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  await img.decode();
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(size.w * ratio);
  canvas.height = Math.round(size.h * ratio);
  const ctx = canvas.getContext('2d');
  // dos pasadas: la primera deja que el navegador termine de cargar las fuentes incrustadas en la imagen
  for (let k = 0; k < 2; k++) { ctx.fillStyle = '#12321f'; ctx.fillRect(0, 0, canvas.width, canvas.height); ctx.drawImage(img, 0, 0, canvas.width, canvas.height); await nextFrame(); }
  const blob = await new Promise((ok, ko) => canvas.toBlob(b => (b ? ok(b) : ko(new Error('no se pudo fotografiar la hoja'))), 'image/jpeg', 0.86));
  return {jpeg: new Uint8Array(await blob.arrayBuffer()), width: canvas.width, height: canvas.height};
}

/**
 * Encuaderna la Bitácora. layout: 'pliegos' (A4 apaisado) o 'libro' (A5). Devuelve {blob, filename, sheets}.
 * opts: {owner, titles, photos, onProgress(done, total), ratio}.
 */
export async function buildBitacoraPdf(state, {layout = 'pliegos', owner = '', titles = {}, photos = {}, onProgress = () => {}, ratio} = {}) {
  ratio ??= layout === 'libro' ? 2.25 : 1.6; // ~215 dpi para la imprenta, ~150 dpi para leer e imprimir en casa
  const host = document.createElement('div');
  host.className = 'bt-pdf';
  host.setAttribute('aria-hidden', 'true');
  document.body.appendChild(host);
  try {
    await document.fonts?.ready;
    const css = await sheetCss();
    const pages = bookSections(state, {owner, titles, photos}).flatMap(html => pourIntoSheets(host, html));
    // una página por hoja en el libro: la primera es impar (derecha); en pliegos la izquierda va primero
    pages.forEach((sheet, i) => {
      const side = (layout === 'libro' ? i + 1 : i) % 2 ? 'right' : 'left';
      sheet.classList.add(`is-${side}`);
      placeWindow(sheet, side);
      const folio = sheet.querySelector('.bt-pdf-folio');
      folio.textContent = String(i + 1);
      folio.classList.add(`is-${side}`);
    });
    const plates = [];
    if (layout === 'libro') plates.push([coverSheet(owner)], ...pages.map(p => [p]), [backSheet()]);
    else {
      if (pages.length % 2) { const b = blankSheet(); b.classList.add('is-right'); pages.push(b); }
      plates.push([backSheet(), coverSheet(owner)]);
      for (let i = 0; i < pages.length; i += 2) plates.push([pages[i], pages[i + 1]]);
    }
    const size = layout === 'libro' ? A5 : A4, shots = [];
    for (let n = 0; n < plates.length; n++) {
      const plate = document.createElement('div');
      plate.className = `bt-pdf-plate bt-pdf-${layout}`;
      Object.assign(plate.style, {width: px(size.w), height: px(size.h)});
      plates[n].forEach(s => plate.appendChild(s));
      host.appendChild(plate);
      await nextFrame();
      shots.push(await photograph(plate, size, ratio, css));
      plate.remove();
      onProgress(n + 1, plates.length);
    }
    const mm = layout === 'libro' ? {w: 148, h: 210} : {w: 297, h: 210};
    const bytes = jpegPdf(shots, mm, {title: `Bitácora de ${owner || 'Arithmos'} · ${TOMO.world}, Tomo ${TOMO.number}`, author: owner, subject: `${TOMO.world} · ${TOMO.subject}`, creator: TOMO.publisher});
    const slug = String(owner || 'alumno').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^A-Za-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'alumno';
    return {blob: new Blob([bytes], {type: 'application/pdf'}), filename: `Bitacora-Arithmos-Tomo${TOMO.number}-${slug}${layout === 'libro' ? '-libro-A5' : ''}.pdf`, sheets: plates.length};
  } finally {
    host.remove();
  }
}

/** Arma el PDF y se lo da al jugador como descarga. */
export async function downloadBitacora(state, opts = {}) {
  const {blob, filename, sheets} = await buildBitacoraPdf(state, opts);
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 60000);
  return {filename, sheets, bytes: blob.size};
}
