// Ohmdal and the Instituto Roxana: the title screen leads back to the school, and a
// crossing from the school's Portal (#continuar) resumes the saved journey directly.
// Kept outside src/game/ so sync-game.mjs never overwrites it.
const base=import.meta.env.BASE_URL;
function mount(){
  const menu=document.querySelector('#title-screen .title-menu');if(!menu||menu.querySelector('.to-instituto'))return;
  const link=document.createElement('a');link.className='quiet to-instituto';link.href=base+'escuela.html';link.textContent='Volver al Instituto';
  const twin=document.querySelector('#title-settings');if(twin){const c=getComputedStyle(twin);Object.assign(link.style,{font:c.font,letterSpacing:c.letterSpacing,color:c.color,padding:c.padding,minHeight:c.minHeight});}
  menu.appendChild(link);
}
function resume(){
  if(location.hash!=='#continuar')return;history.replaceState(null,'',location.pathname+location.search);
  const started=performance.now(),tick=()=>{const c=document.querySelector('#continue');if(c&&!c.classList.contains('hidden')&&!c.disabled){c.click();return;}if(performance.now()-started<20000)setTimeout(tick,150);};tick();
}
mount();resume();
const style=document.createElement('style');
style.textContent='.title-menu .to-instituto{display:inline-flex;align-items:center;justify-content:center;text-decoration:none;opacity:.82}.title-menu .to-instituto:hover{opacity:1}';
document.head.append(style);
