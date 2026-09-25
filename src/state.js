import {validatePendingCinematic} from './cinematic-progress.js';
import {normalizeJournalData} from './field-notes.js';
import {normalizeJourneyTime} from './story-time.js';

export const SAVE_KEY = 'ohmdal.la-luz.v1';
export const SETTINGS_KEY = 'ohmdal.settings.v1';
export const AREA_IDS = ['portal','plaza','workshop','road','spring','castle','terraces','lake','lighthouse'];
export const DEFAULT_SETTINGS = {volume:0.55, muted:false, reducedMotion:false, quality:'high', textSpeed:36};

export function freshState(settings = {}) {
  return {version:1,area:'portal',position:null,flags:{},seen:[],secrets:[],visited:[],puzzles:{},fieldNotes:[],personalNotes:{},journeyTime:{phase:0},activeDialogue:null,activeCinematic:null,endingPending:false,playtime:0,createdAt:Date.now(),savedAt:Date.now(),settings:{...DEFAULT_SETTINGS,...settings}};
}
function record(value) { return value && typeof value === 'object' && !Array.isArray(value); }
function settingsFrom(value) {
  const result={...DEFAULT_SETTINGS};
  if(!record(value))return result;
  if(Number.isFinite(value.volume))result.volume=Math.max(0,Math.min(1,value.volume));
  for(const key of ['muted','reducedMotion'])if(typeof value[key]==='boolean')result[key]=value[key];
  if(['high','low'].includes(value.quality))result.quality=value.quality;
  if(Number.isFinite(value.textSpeed)&&value.textSpeed>0)result.textSpeed=Math.min(9999,value.textSpeed);
  return result;
}
export function validateState(data) {
  if (!record(data) || data.version !== 1 || !AREA_IDS.includes(data.area)) throw new Error('La bitácora no corresponde a esta edición de Ohmdal.');
  const state=freshState();
  state.area=data.area;
  if (Array.isArray(data.position) && data.position.length===2 && data.position.every(Number.isFinite) && data.position.every(x=>Math.abs(x)<100)) state.position=data.position;
  for(const key of ['flags','puzzles']) if(record(data[key])) state[key]=data[key];
  for(const key of ['seen','secrets','visited']) if(Array.isArray(data[key])) state[key]=[...new Set(data[key].filter(x=>typeof x==='string'))];
  state.visited=state.visited.filter(id=>AREA_IDS.includes(id));
  if(Number.isFinite(data.playtime) && data.playtime>=0) state.playtime=data.playtime;
  if(Number.isFinite(data.createdAt)) state.createdAt=data.createdAt;
  if(Number.isFinite(data.savedAt)) state.savedAt=data.savedAt;
  if(record(data.activeDialogue)&&typeof data.activeDialogue.id==='string'&&Number.isInteger(data.activeDialogue.index)&&data.activeDialogue.index>=0)state.activeDialogue={id:data.activeDialogue.id,index:data.activeDialogue.index};
  state.activeCinematic=validatePendingCinematic(data.activeCinematic,state);
  state.endingPending=data.endingPending===true&&state.flags.beacon_lens===true&&state.flags.finale_seen===true;
  state.settings=settingsFrom(data.settings);
  state.journeyTime=normalizeJourneyTime(data.journeyTime,state);
  Object.assign(state,normalizeJournalData(data,AREA_IDS));
  return state;
}
export function loadState(storage=localStorage) {
  let raw;
  try {raw=storage.getItem(SAVE_KEY);if(!raw)return {state:null,error:null};return {state:validateState(JSON.parse(raw)),error:null};}
  catch(error) {return {state:null,error:'No se pudo leer la bitácora guardada. Podés importar una copia o comenzar otro viaje.',raw};}
}
export function saveState(state,storage=localStorage) {
  state.savedAt=Date.now();
  try {storage.setItem(SAVE_KEY,JSON.stringify(state));return true;} catch {return false;}
}
export function loadSettings(storage=localStorage) {
  try{return settingsFrom(JSON.parse(storage.getItem(SETTINGS_KEY)||'{}'));}catch{return {...DEFAULT_SETTINGS};}
}
export function hasRequirements(state,requirements=[]) {return requirements.every(flag=>Boolean(state.flags[flag]));}
export function minutes(seconds){return Math.floor(seconds/60);}
