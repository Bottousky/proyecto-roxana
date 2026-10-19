// Redes del proyecto y de su creador, en un solo lugar. Un enlace aparece en la home sólo
// cuando su URL está confirmada (`url` https en el dominio de su red). Lo pendiente queda
// documentado aquí y en docs/production/home/STATE.md, nunca como href="#" ni botón vacío.
// No se deducen perfiles de nombres, correos ni usuarios de GitHub.
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const HOSTS={youtube:['youtube.com','www.youtube.com'],instagram:['instagram.com','www.instagram.com'],tiktok:['tiktok.com','www.tiktok.com'],
  x:['x.com'],bluesky:['bsky.app'],mastodon:null,linkedin:['linkedin.com','www.linkedin.com'],github:['github.com'],sitio:null};
const LABELS={youtube:'YouTube',instagram:'Instagram',tiktok:'TikTok',x:'X',bluesky:'Bluesky',mastodon:'Mastodon',linkedin:'LinkedIn',github:'GitHub',sitio:'Sitio'};

export const IDENTITIES=[
  {id:'proyecto',name:'Proyecto Roxana',role:'El Instituto y sus Mundos Aplicados',
    links:[
      // Pendiente: confirmar las cuentas del proyecto (canal de videos, redes). Sin URL confirmada no se muestran.
      {network:'youtube',url:null},{network:'instagram',url:null},
    ]},
  {id:'creador',name:'Manuel Botto',role:'Creador',
    links:[
      // Pendiente: el creador debe indicar qué perfiles quiere enlazar y sus URLs exactas.
      {network:'instagram',url:null},{network:'linkedin',url:null},
    ]},
];

export function confirmed(link){
  if(!link||typeof link.url!=='string')return false;
  try{const u=new URL(link.url),hosts=HOSTS[link.network];return u.protocol==='https:'&&(hosts===null||hosts?.includes(u.hostname));}catch{return false;}
}
export function pendingLinks(){return IDENTITIES.flatMap(i=>i.links.filter(l=>!confirmed(l)).map(l=>`${i.name} · ${LABELS[l.network]||l.network}`));}

/** Community corner: only confirmed links; nothing at all when none is confirmed yet. */
export function renderCommunity(){
  const groups=IDENTITIES.map(i=>({...i,links:i.links.filter(confirmed)})).filter(i=>i.links.length);
  if(!groups.length)return '';
  return `<section class="community" aria-labelledby="community-title"><h3 id="community-title">Seguir a Roxana</h3>${groups.map(i=>`<div class="identity identity-${esc(i.id)}"><b>${esc(i.name)}</b><small>${esc(i.role)}</small>
    <ul>${i.links.map(l=>`<li><a href="${esc(l.url)}" target="_blank" rel="noopener me">${esc(LABELS[l.network]||l.network)}<span class="visually-hidden"> de ${esc(i.name)} (se abre en otra pestaña)</span></a></li>`).join('')}</ul></div>`).join('')}</section>`;
}
