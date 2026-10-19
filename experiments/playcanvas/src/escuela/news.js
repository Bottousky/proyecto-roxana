// Novedades del Instituto: editorial content, separate from the student's progress.
// Source: public/escuela/novedades.json (versioned with the site, editable without code).
// Each item: {id, title, summary, date: 'YYYY-MM-DD', category, href?, image?, published, featured?}.
// Only published items with a real date are shown. Development examples carry
// `example: true` and appear only in the dev server, labelled as such.
const CATEGORIES={mundos:'Mundos',instituto:'Instituto',videos:'Videos',comunidad:'Comunidad'};
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let pending=null;

/** Validate one item; returns null (and says why in the console) when it cannot be shown. */
export function validItem(x){
  const why=!x||typeof x!=='object'?'no es un objeto':typeof x.id!=='string'||!x.id?'falta id':typeof x.title!=='string'||!x.title.trim()?'falta título':
    !/^\d{4}-\d{2}-\d{2}$/.test(x.date||'')||Number.isNaN(Date.parse(x.date))?'fecha inválida':x.href&&!/^(https:\/\/|\.\/|\/|#[\w-])/.test(x.href)?'enlace no permitido':null;
  if(why){console.warn('Novedad descartada:',x?.id||'(sin id)',why);return null;}
  return {id:x.id,title:x.title.trim(),summary:String(x.summary||'').trim(),date:x.date,category:CATEGORIES[x.category]?x.category:'instituto',
    href:x.href||null,image:x.image||null,published:x.published===true,featured:x.featured===true,example:x.example===true};
}
/** Newest first, then by id: a stable order however the file is edited. */
export function sortItems(items){return [...items].sort((a,b)=>b.date.localeCompare(a.date)||a.id.localeCompare(b.id));}
export function visibleItems(raw,{dev=false}={}){
  return sortItems((Array.isArray(raw)?raw:[]).map(validItem).filter(Boolean).filter(x=>x.published&&(!x.example||dev)));
}
/** Real items newer than the last visit to the news; on a first visit, every real item is unread. */
export function unreadCount(items,seen){return items.filter(x=>!x.example&&(!seen||x.date>seen)).length;}
/** Date to remember after reading: the newest real item (examples never count). */
export function newestReal(items){return items.find(x=>!x.example)?.date||null;}

export function loadNews(base='/',{dev=import.meta.env?.DEV}={}){
  pending??=fetch(`${base}escuela/novedades.json`,{cache:'no-cache'})
    .then(r=>{if(!r.ok)throw new Error(`HTTP ${r.status}`);return r.json();})
    .then(data=>({status:'ok',items:visibleItems(data?.items,{dev})}))
    .catch(err=>{console.warn('Novedades no disponibles:',err.message);pending=null;return {status:'error',items:[]};});
  return pending;
}

const fmt=d=>new Date(d+'T12:00:00').toLocaleDateString('es-AR',{day:'numeric',month:'long',year:'numeric'});
export function renderNews({status,items},{limit=6}={}){
  if(status==='error')return `<section class="news-state"><b>No pudimos traer las novedades.</b><p class="meta">El resto del Instituto funciona igual. Probá de nuevo en un rato.</p></section>`;
  if(!items.length)return `<section class="news-state"><span class="news-seal" aria-hidden="true">Ω</span><b>Todavía no hay novedades publicadas.</b><p class="meta">Cuando el Instituto anuncie algo —un mundo que abre, una función nueva en el Anfiteatro— va a aparecer acá, con su fecha.</p></section>`;
  const item=n=>`<li class="news-item${n.featured?' featured':''}${n.example?' example':''}">
    ${n.example?'<span class="example-tag">Ejemplo de desarrollo · no publicado</span>':''}
    <p class="news-meta"><span>${esc(CATEGORIES[n.category])}</span> · <time datetime="${esc(n.date)}">${esc(fmt(n.date))}</time></p>
    <h3>${n.href?`<a href="${esc(n.href)}"${/^https:/.test(n.href)?' target="_blank" rel="noopener"':''}>${esc(n.title)}</a>`:esc(n.title)}</h3>
    ${n.summary?`<p>${esc(n.summary)}</p>`:''}</li>`;
  // A bounded selection first; the rest stays on the same page behind a native disclosure (keyboard and reader friendly).
  return `<ol class="news-list">${items.slice(0,limit).map(item).join('')}</ol>
  ${items.length>limit?`<details class="news-more"><summary>Ver ${items.length-limit} novedades anteriores</summary><ol class="news-list">${items.slice(limit).map(item).join('')}</ol></details>`:''}`;
}
