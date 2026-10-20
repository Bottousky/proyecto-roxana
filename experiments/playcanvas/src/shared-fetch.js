// One download per file between the title's prefetch and the world's build (2026-10-19,
// rendimiento): the browser's cache did not keep the 8,8 MB geometry between the two, and a
// player who crossed the Portal at once downloaded it twice. Bytes, shared in memory.
const pending=new Map();
export function sharedBytes(url){
  if(!pending.has(url))pending.set(url,fetch(url).then(r=>{if(!r.ok)throw new Error(`${r.status} ${url}`);return r.arrayBuffer();}).catch(error=>{pending.delete(url);throw error;}));
  return pending.get(url);
}
/** The same bytes, for their one consumer: forgotten afterwards so they are not kept in memory. */
export function takeBytes(url){const bytes=sharedBytes(url);pending.delete(url);return bytes;}
