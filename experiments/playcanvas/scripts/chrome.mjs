// Installed Chrome for the QA scripts, on Windows or macOS. CHROME_PATH overrides it.
import { existsSync } from 'node:fs';

const candidates = {
  win32: ['C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe'],
  darwin: ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'],
  linux: ['/usr/bin/google-chrome', '/usr/bin/chromium'],
};

export const chromePath = process.env.CHROME_PATH || (candidates[process.platform] || []).find(existsSync);

// Hardware rendering: ANGLE over Direct3D 11 on Windows, Metal on macOS.
export const gpuArgs = [process.platform === 'darwin' ? '--use-angle=metal' : '--use-angle=d3d11', '--enable-gpu', '--ignore-gpu-blocklist'];


// A new journey asks for the traveller's name when the Instituto Roxana's register (localStorage
// roxana.escuela.v1) has none: src/game/main.js, askName. Automated runs answer it as a player
// would, typing a name and confirming. Returns whether the question was asked.
export async function nameTraveller(page, name = 'Ensayo') {
  const field = page.locator('#player-name');
  if (!await field.waitFor({ state: 'visible', timeout: 4000 }).then(() => true, () => false)) return false;
  await field.fill(name);
  await page.locator('#name-form button[type="submit"]').click();
  return true;
}
