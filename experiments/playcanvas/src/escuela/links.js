// Where the game and the campus live. In this package (dev server, tests) the game is index.html and the campus
// escuela.html. On the published site the campus is the root and the game is ohmdal.html: the Pages build sets
// VITE_PLAY_URL and VITE_CAMPUS_URL (README, «Producción»). Read by the browser bundle and, at build time, by Node.
const env=import.meta.env??globalThis.process?.env??{};
export const PLAY=env.VITE_PLAY_URL||'./index.html';
export const CAMPUS=env.VITE_CAMPUS_URL||'./escuela.html';
