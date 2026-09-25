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
  compass.addEventListener('click',()=>document.querySelector('#map-button').click());header.prepend(compass);
  const phase=document.createElement('div');phase.className='travel-time';phase.id='travel-time';
  phase.title='El día avanza con la historia. Podés explorar y aprender sin apuro.';
  phase.innerHTML='<span id="travel-sky" aria-hidden="true">☀</span><span id="travel-phase"></span><span class="time-rule" aria-hidden="true"></span><span id="travel-day"></span>';
  header.querySelector('.place').append(phase);
  const objective=document.querySelector('#objective');header.append(objective);
  document.querySelector('#area-subtitle').classList.add('screen-reader-only');
  const bearing=document.createElement('span');bearing.id='travel-bearing';bearing.className='travel-bearing';header.append(bearing);compass.setAttribute('aria-describedby','travel-bearing');
}
export function updateTravelInstrument(document,state,position,objective){
  const phase=advanceJourneyTime(state),bearing=travelBearing(state,position,objective);
  document.querySelector('#travel-phase').textContent=phase.label;
  document.querySelector('#travel-day').textContent=`Día ${phase.day}`;
  document.querySelector('#travel-sky').textContent=phase.symbol;
  document.querySelector('#travel-time').dataset.phase=phase.id;
  document.querySelector('#travel-needle').setAttribute('transform',`rotate(${bearing.angle} 50 51)`);
  document.querySelector('#travel-bearing').textContent=bearing.label;
  document.querySelector('#travel-compass').title=`${bearing.label} · Abrir mapa`;
  document.querySelector('#chapter-label').textContent=KINGDOM[state.area]?.region||'Ohmdal';
}
