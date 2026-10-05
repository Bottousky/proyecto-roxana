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

