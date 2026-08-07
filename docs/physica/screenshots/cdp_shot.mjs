// CDP screenshot script using Node.js built-in WebSocket (Node 22+)
import http from 'node:http';
import fs from 'node:fs';

const DEBUG_PORT = 9332;
const TARGET_URL = 'http://localhost:5173/physica/?auto=1';
const OUTPUT_FILE = 'docs/physica/screenshots/cascade_gameplay_cdp.png';

function fetchJSON(path) {
  return new Promise((resolve, reject) => {
    http.get(`http://127.0.0.1:${DEBUG_PORT}${path}`, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });
}

async function main() {
  const tabs = await fetchJSON('/json');
  const tab = tabs.find(t => t.type === 'page') || tabs[0];
  console.log('Tab:', tab.webSocketDebuggerUrl);

  const ws = new WebSocket(tab.webSocketDebuggerUrl);
  await new Promise((resolve) => ws.on('open', resolve));

  let msgId = 1;
  const pending = new Map();
  ws.on('message', (data) => {
    const msg = JSON.parse(data.toString());
    if (msg.id && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id);
      pending.delete(msg.id);
      if (msg.error) reject(msg.error);
      else resolve(msg.result);
    }
  });

  async function send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = msgId++;
      pending.set(id, { resolve, reject });
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  // Navigate and enable
  await send('Page.enable');
  await send('Runtime.enable');
  const navResult = await send('Page.navigate', { url: TARGET_URL });
  console.log('Navigation:', navResult?.loadedDocument?.loaded);

  // Wait for load
  await new Promise(r => setTimeout(r, 3000));

  // Wait a bit more for Babylon.js to render
  await new Promise(r => setTimeout(r, 2000));

  // Take screenshot
  const result = await send('Page.captureScreenshot', {
    format: 'png',
    quality: 100,
    fromSurface: true
  });

  const buffer = Buffer.from(result.data, 'base64');
  fs.writeFileSync(OUTPUT_FILE, buffer);
  console.log(`Screenshot saved: ${OUTPUT_FILE} (${buffer.length} bytes)`);

  ws.close();
}

main().catch(e => console.error('Error:', e));
