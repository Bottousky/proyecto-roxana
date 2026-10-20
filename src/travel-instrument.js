import {advanceJourneyTime} from './story-time.js';
import {KINGDOM,travelBearing} from './kingdom-geography.js';

export function mountTravelInstrument(document){
  const header=document.querySelector('.hud-top');
  header.id='travel-instrument';header.setAttribute('aria-label','Instrumento de viaje del Instituto');
  const compass=document.createElement('button');compass.id='travel-compass';compass.type='button';
  compass.setAttribute('aria-label','Abrir el mapa del reino');
  compass.innerHTML=`<svg viewBox="0 0 100 100" aria-hidden="true"><circle class="compass-rim" cx="50" cy="50" r="46"/><circle class="compass-face" cx="50" cy="50" r="39"/><path class="compass-ticks" d="M50 13v5m0 64v5M13 50h5m64 0h5M24 24l4 4m44 44 4 4m0-52-4 4M28 72l-4 4"/><text x="50" y="29">N</text><text x="76" y="54">E</text><text x="50" y="79">S</text><text x="24" y="54">O</text><g id="travel-needle"><path class="needle-north" d="M50 33 56 55 50 51 44 55Z"/><path class="needle-south" d="m50 68 6-13-6-4-6 4Z"/></g><circle cx="50" cy="51" r="3" fill="#d5b877"/></svg>`;
  compass.querySelector('#travel-needle').removeAttribute('id');
  const bearingMark=document.createElementNS('http://www.w3.org/2000/svg','g');bearingMark.id='travel-needle';bearingMark.innerHTML='<path d="M50 5 55 13 45 13Z" fill="#214e49" stroke="#f4d48e" stroke-width="1.3"/>';compass.querySelector('svg').append(bearingMark);
  const day=document.createElementNS('http://www.w3.org/2000/svg','g');day.innerHTML='<path class="day-arc" d="M12 56A38 38 0 0 1 88 56"/><g id="travel-daymark"><circle r="5.2"/></g>';compass.querySelector('svg').append(day);
  compass.addEventListener('click',()=>document.querySelector('#map-button').click());header.prepend(compass);
  const tools=header.querySelector('.hud-tools');tools.id='hud-tools';document.querySelector('#hud').append(tools);
  const phase=document.createElement('div');phase.className='travel-time';phase.id='travel-time';
  phase.title='El día avanza con la historia. Podés explorar y aprender sin apuro.';
  phase.innerHTML='<span id="travel-sky" aria-hidden="true">☀</span><span id="travel-phase"></span><span class="time-rule" aria-hidden="true"></span><span id="travel-day"></span>';
  header.querySelector('.place').append(phase);
  const objective=document.querySelector('#objective');header.append(objective);
  document.querySelector('#area-subtitle').classList.add('screen-reader-only');
  const bearing=document.createElement('span');bearing.id='travel-bearing';bearing.className='travel-bearing';header.append(bearing);compass.setAttribute('aria-describedby','travel-bearing');
}
// Written only when something changes: the instrument is refreshed four times a second, and an
// unchanged write still makes the browser recompute the HUD's styles (2026-10-19, rendimiento).
const text=(el,v)=>{if(el&&el.textContent!==v)el.textContent=v;},attr=(el,n,v)=>{if(el&&el.getAttribute(n)!==v)el.setAttribute(n,v);};
export function updateTravelInstrument(document,state,position,objective){
  const phase=advanceJourneyTime(state),bearing=travelBearing(state,position,objective);
  text(document.querySelector('#travel-phase'),phase.label);
  text(document.querySelector('#travel-day'),`Día ${phase.day}`);
  text(document.querySelector('#travel-sky'),phase.symbol);
  // The sun climbs the rim through the day; at night the moon sits at the top.
  const mark=document.querySelector('#travel-daymark'),night=phase.id==='night'||phase.id==='dusk',t={morning:.12,afternoon:.42,sunset:.78,dusk:.3,night:.5,'next-morning':.12}[phase.id]??.12,a=Math.PI*(1+t);
  attr(mark,'transform',`translate(${50+46*Math.cos(a)} ${56+46*Math.sin(a)})`);if(mark.hasAttribute('data-night')!==night)mark.toggleAttribute('data-night',night);
  attr(document.querySelector('#travel-time'),'data-phase',phase.id);
  attr(document.querySelector('#travel-needle'),'transform',`rotate(${bearing.angle} 50 51)`);
  text(document.querySelector('#travel-bearing'),bearing.label);
  attr(document.querySelector('#travel-compass'),'title',`${bearing.label} · Abrir mapa`);
  text(document.querySelector('#chapter-label'),KINGDOM[state.area]?.region||'Ohmdal');
}
