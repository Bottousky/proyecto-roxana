// Un PDF mínimo hecho a mano: una imagen JPEG por página, a página completa. Arithmos no tiene dependencias de
// ejecución, y para el tomo descargable alcanza con esto (las hojas se fotografían en el navegador: bitacora-pdf.js).
// Puro: recibe bytes y devuelve bytes (se prueba en Node).

const MM = 72 / 25.4; // puntos PDF por milímetro

/** Texto PDF: ASCII tal cual; si hay tildes o eñes, UTF-16BE en hexadecimal con BOM (lo que piden los metadatos). */
function pdfString(s) {
  const text = String(s ?? '');
  if (/^[\x20-\x7e]*$/.test(text)) return `(${text.replace(/[\\()]/g, c => `\\${c}`)})`;
  let hex = 'FEFF';
  for (const ch of text) {
    const cp = ch.codePointAt(0);
    const units = cp > 0xffff ? [0xd800 + ((cp - 0x10000) >> 10), 0xdc00 + ((cp - 0x10000) & 0x3ff)] : [cp];
    for (const u of units) hex += u.toString(16).toUpperCase().padStart(4, '0');
  }
  return `<${hex}>`;
}

/**
 * pages: [{jpeg: Uint8Array, width: px, height: px}], tamaño de página en mm ({w, h}) igual para todas.
 * info: {title, author, subject, creator}. Devuelve Uint8Array con el PDF.
 */
export function jpegPdf(pages, {w, h}, info = {}) {
  const enc = new TextEncoder();
  const chunks = [], offsets = [];
  let length = 0;
  const push = bytes => { chunks.push(bytes); length += bytes.length; };
  const text = s => push(enc.encode(s));
  const W = (w * MM).toFixed(2), H = (h * MM).toFixed(2);
  // objetos: 1 catálogo, 2 páginas, 3 info, después por página: página, imagen, contenido
  const n = pages.length, first = 4, obj = (k, body) => { offsets[k] = length; text(`${k} 0 obj\n${body}\nendobj\n`); };
  text('%PDF-1.4\n%\xe2\xe3\xcf\xd3\n');
  obj(1, '<< /Type /Catalog /Pages 2 0 R >>');
  obj(2, `<< /Type /Pages /Kids [${pages.map((_, i) => `${first + 3 * i} 0 R`).join(' ')}] /Count ${n} >>`);
  obj(3, `<< ${Object.entries({Title: info.title, Author: info.author, Subject: info.subject, Creator: info.creator}).filter(([, v]) => v).map(([k, v]) => `/${k} ${pdfString(v)}`).join(' ')} >>`);
  pages.forEach((p, i) => {
    const page = first + 3 * i, image = page + 1, content = page + 2;
    obj(page, `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${W} ${H}] /Resources << /XObject << /Im0 ${image} 0 R >> >> /Contents ${content} 0 R >>`);
    offsets[image] = length;
    text(`${image} 0 obj\n<< /Type /XObject /Subtype /Image /Width ${p.width} /Height ${p.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${p.jpeg.length} >>\nstream\n`);
    push(p.jpeg);
    text('\nendstream\nendobj\n');
    const draw = `q ${W} 0 0 ${H} 0 0 cm /Im0 Do Q`;
    obj(content, `<< /Length ${draw.length} >>\nstream\n${draw}\nendstream`);
  });
  const xref = length, count = first + 3 * n;
  text(`xref\n0 ${count}\n0000000000 65535 f \n${Array.from({length: count - 1}, (_, k) => `${String(offsets[k + 1]).padStart(10, '0')} 00000 n \n`).join('')}`);
  text(`trailer\n<< /Size ${count} /Root 1 0 R /Info 3 0 R >>\nstartxref\n${xref}\n%%EOF\n`);
  const out = new Uint8Array(length);
  let at = 0;
  for (const c of chunks) { out.set(c, at); at += c.length; }
  return out;
}
