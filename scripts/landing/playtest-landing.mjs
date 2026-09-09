import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { WORLD_ACTIVITIES } from '../../src/landing/worldActivities.ts';

const base = process.env.LANDING_URL || 'http://127.0.0.1:5186';
const out = 'output/playwright';
await mkdir(out, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const contexts = [], results = [], errors = [];
const email = `qa-institute-${Date.now()}@example.test`;
const password = 'QA original password 2026!';
const changedPassword = 'QA replacement password 2026!';
const roomIds = ['programacion','audiovisual','electronica','matematica','biblioteca','hall','logros','fisica','direccion','visitantes','preceptoria'];
let page;
async function setup(options = {}) {
  const context = await browser.newContext(options); contexts.push(context);
  const tab = await context.newPage(); tab.setDefaultTimeout(15000);
  tab.on('pageerror', error => errors.push({ url: tab.url(), message: error.message }));
  return { context, page: tab };
}
async function check(name, work, tab = page) {
  const start = Date.now();
  try { await work(); results.push({ name, passed: true, ms: Date.now()-start }); console.log(`PASS ${name}`); return true; }
  catch (error) {
    results.push({ name, passed: false, error: String(error), ms: Date.now()-start });
    console.error(`FAIL ${name}: ${error}`);
    await tab?.screenshot({ path: `${out}/failure-${results.length}.png` }).catch(() => {});
    return false;
  } finally { await writeFile(`${out}/landing-results.json`, JSON.stringify({ base, email, results, errors }, null, 2)); }
}
async function ready(tab, hash = '') {
  await tab.goto(`${base}/${hash}`);
  await tab.waitForFunction(() => document.documentElement.dataset.scene === 'ready', null, { timeout: 45000 });
}
async function room(tab, id, touch = false) {
  const toggle = tab.locator('#school3d-rooms-toggle');
  if (await toggle.getAttribute('aria-expanded') !== 'true') await toggle[touch ? 'tap' : 'click']();
  await tab.locator(`#school3d-room-list [data-room="${id}"]`)[touch ? 'tap' : 'click']();
  await tab.locator('#school3d-panel.is-open').waitFor();
  await tab.waitForFunction(expected => document.querySelector('#school-experience').dataset.room === expected, id);
  await tab.locator('#room-content > *').first().waitFor();
}
async function responseTo(tab, path, method, action) {
  const pending = tab.waitForResponse(response => new URL(response.url()).pathname === path && response.request().method() === method);
  await action(); const response = await pending;
  assert.equal(response.status(), 200, `${method} ${path} responds successfully`);
  return response.json();
}
async function login(tab, pass) {
  await room(tab, 'preceptoria');
  const form = tab.getByRole('form', { name: 'Ingresar', exact: true });
  await form.getByLabel('Correo electrónico').fill(email);
  await form.getByLabel('Contraseña', { exact: true }).fill(pass);
  await responseTo(tab, '/api/auth/login', 'POST', () => form.getByRole('button', { name: 'Ingresar', exact: true }).click());
  await tab.locator('.account-card').waitFor();
}
async function accountLibraryReady(tab) {
  await tab.waitForFunction(() => document.querySelector('#room-content')?.textContent.includes('Tus lecturas y favoritos se guardan en tu cuenta.'));
}
try {
  ({ page } = await setup({ viewport: { width: 1440, height: 1000 } }));
  await check('Desktop fullscreen, directory and all eleven rooms', async () => {
    await ready(page);
    assert.equal(await page.evaluate(() => document.documentElement.scrollHeight <= innerHeight + 1), true, 'School is the fullscreen landing');
    assert.equal(await page.locator('#school3d-room-list').evaluate(el => el.inert), true);
    await page.screenshot({ path: `${out}/institute-desktop.png` });
    for (const id of roomIds) { await room(page, id); assert.match(page.url(), new RegExp(`#sala/${id}$`)); }
    await page.locator('#school3d-home').click();
    await page.locator('#school3d-panel').waitFor({ state: 'hidden' });
    assert.equal(await page.locator('#school3d-panel').evaluate(el => el.inert), true);
  });
  await check('Projected label pointer interaction and keyboard history', async () => {
    await ready(page);
    const label = page.locator('.rx-school3d__label.is-visible').first();
    await label.waitFor(); const id = await label.getAttribute('data-room');
    await label.click(); await page.locator('#school3d-panel.is-open').waitFor();
    assert.equal(new URL(page.url()).hash, `#sala/${id}`);
    await page.locator('#school3d-panel-close').click();
    await page.goBack(); await page.locator('#school3d-panel.is-open').waitFor();
    assert.equal(new URL(page.url()).hash, `#sala/${id}`);
    await page.keyboard.press('Escape');
    await page.locator('#school3d-canvas').focus(); await page.keyboard.press('ArrowRight');
    await page.locator('#school3d-panel.is-open').waitFor();
    assert.equal(new URL(page.url()).hash, '#sala/programacion');
    await page.keyboard.press('Escape');
    assert.equal(await page.locator('#school3d-canvas').evaluate(el => document.activeElement === el), true);
  });
  const signedIn = await check('Register a real isolated QA account through Preceptoría', async () => {
    await ready(page); await room(page, 'preceptoria');
    await page.getByRole('button', { name: 'Crear cuenta', exact: true }).click();
    const form = page.getByRole('form', { name: 'Crear cuenta', exact: true });
    await form.getByLabel('Tu nombre', { exact: true }).fill('QA Instituto');
    await form.getByLabel('Correo electrónico').fill(email);
    await form.getByLabel('Contraseña · mínimo 10 caracteres', { exact: true }).fill(password);
    await form.getByRole('checkbox').check();
    const data = await responseTo(page, '/api/auth/register', 'POST', () => form.getByRole('button', { name: 'Crear mi cuenta' }).click());
    assert.equal(data.user.email, email); await page.locator('.account-card').waitFor();
    assert.match(await page.locator('.account-card').innerText(), /QA Instituto/);
  });
  if (signedIn) {
    await check('Profile, logout, login and password change persist', async () => {
      await page.getByLabel('Tu nombre en el Instituto').fill('QA Biblioteca');
      await responseTo(page, '/api/profile', 'PATCH', () => page.getByRole('button', { name: 'Guardar nombre' }).click());
      await page.waitForFunction(() => document.querySelector('.account-card strong')?.textContent === 'QA Biblioteca');
      await page.getByText('Cambiar contraseña', { exact: true }).click();
      await page.getByLabel('Contraseña actual', { exact: true }).fill(password);
      await page.getByLabel('Nueva contraseña · mínimo 10 caracteres', { exact: true }).fill(changedPassword);
      await page.getByLabel('Repetir nueva contraseña', { exact: true }).fill(changedPassword);
      await responseTo(page, '/api/auth/password', 'POST', () => page.getByRole('button', { name: 'Actualizar contraseña' }).click());
      await page.getByRole('button', { name: 'Cerrar sesión', exact: true }).waitFor();
      await responseTo(page, '/api/auth/logout', 'POST', () => page.getByRole('button', { name: 'Cerrar sesión', exact: true }).click());
      await login(page, changedPassword); await page.reload();
      await page.locator('.account-card').waitFor(); assert.match(await page.locator('.account-card').innerText(), /QA Biblioteca/);
      await page.screenshot({ path: `${out}/institute-account.png` });
    });
    await check('Library search, category, reader, bookmark, download and server reload', async () => {
      await room(page, 'biblioteca'); await accountLibraryReady(page); await page.locator('[data-filter="electricidad"]').click();
      assert.equal(await page.locator('.book-card').count(), 3);
      await page.getByLabel('Buscar libros').fill('completo');
      assert.equal(await page.locator('.book-card').count(), 1);
      await page.locator('[data-read="circuito-completo"]').click();
      await page.locator('#reader-dialog[open]').waitFor();
      assert.match(await page.locator('#reader-title').innerText(), /camino completo/);
      await page.locator('[data-reader-section="1"]').click();
      await responseTo(page, '/api/library', 'PUT', () => page.locator('#reader-complete').click());
      const saved = await responseTo(page, '/api/library', 'PUT', () => page.locator('#reader-bookmark').click());
      assert.equal(saved.reading['circuito-completo'], 100); assert(saved.bookmarks.includes('circuito-completo'));
      const downloadEvent = page.waitForEvent('download'); await page.locator('#reader-download').click();
      const download = await downloadEvent; assert.equal(download.suggestedFilename(), 'circuito-completo.txt');
      await download.saveAs(`${out}/circuito-completo.txt`);
      assert.match(await readFile(`${out}/circuito-completo.txt`, 'utf8'), /La carga eléctrica se conserva/);
      await page.screenshot({ path: `${out}/institute-reader.png` });
      await page.getByRole('button', { name: 'Cerrar lectura', exact: true }).click();
      await page.locator('#reader-dialog').waitFor({ state: 'hidden' });
      await page.reload(); await page.locator('#library-search').waitFor(); await accountLibraryReady(page);
      await page.locator('[data-filter="saved"]').click();
      await page.waitForFunction(() => document.querySelector('.book-card[data-read="circuito-completo"]')?.textContent.includes('Leído'));
      assert.equal(await page.locator('.book-card').count(), 1);
    });
    await check('Newsletter subscribe and unsubscribe are real saved consent, without sending', async () => {
      await ready(page); await room(page, 'visitantes');
      await page.locator('#newsletter-consent').check();
      let data = await responseTo(page, '/api/newsletter', 'PUT', () => page.getByRole('button', { name: 'Guardar preferencia' }).click());
      assert.equal(data.user.newsletter, true); assert.equal(data.delivery, 'not_sent');
      await page.reload(); await page.locator('#newsletter-consent').waitFor();
      assert.equal(await page.locator('#newsletter-consent').isChecked(), true);
      await page.locator('#newsletter-consent').uncheck();
      data = await responseTo(page, '/api/newsletter', 'PUT', () => page.getByRole('button', { name: 'Guardar preferencia' }).click());
      assert.equal(data.user.newsletter, false); await page.reload(); await page.locator('#newsletter-consent').waitFor();
      assert.equal(await page.locator('#newsletter-consent').isChecked(), false);
    });
    await check('All four practice benches: wrong operations, both situations and persisted achievements', async () => {
      await ready(page);
      const rooms = { ohmdal: 'electronica', bitland: 'programacion', physica: 'fisica', arithmos: 'matematica' };
      for (const activity of WORLD_ACTIVITIES) {
        await room(page, rooms[activity.world]); await page.locator(`[data-activity="${activity.id}"]`).click();
        for (let index=0; index<activity.challenges.length; index++) {
          const challenge = activity.challenges[index];
          const wrong = challenge.choices.find(choice => choice.id !== challenge.correctChoiceId);
          await page.locator(`[data-operation="${wrong.id}"]`).click();
          assert.equal(await page.locator('#bench-feedback').getAttribute('data-correct'), 'false');
          assert.equal(await page.locator('#bench-next').isVisible(), false, 'A wrong operation cannot advance or grant an achievement');
          assert((await page.locator('#bench-feedback').innerText()).includes(wrong.outcome));
          await page.locator(`[data-operation="${challenge.correctChoiceId}"]`).click();
          assert.equal(await page.locator('#bench-feedback').getAttribute('data-correct'), 'true');
          if (index === activity.challenges.length-1) {
            const data = await responseTo(page, '/api/progress', 'PUT', () => page.locator('#bench-next').click());
            assert(data.achievements.includes(activity.id));
          } else await page.locator('#bench-next').click();
        }
        await page.locator('.practice-complete').waitFor();
      }
      await room(page, 'logros'); assert.equal(await page.locator('.achievement.unlocked').count(), 5);
      await page.reload(); await page.locator('.achievement.unlocked').nth(4).waitFor();
      assert.equal(await page.locator('.achievement.unlocked').count(), 5);
      await page.screenshot({ path: `${out}/institute-achievements.png` });
    });
    const { context: recoverContext, page: recover } = await setup({ viewport:{width:1280,height:900} });
    await check('A failed account-library GET can be retried without changing identity', async () => {
      let first = true;
      await recoverContext.route('**/api/library', route => {
        if (first && route.request().method() === 'GET') {
          first = false;
          return route.fulfill({ status:503, contentType:'application/json', body:JSON.stringify({error:{code:'unavailable',message:'Interrupción de prueba recuperable'}}) });
        }
        return route.continue();
      });
      await ready(recover); await login(recover, changedPassword); await room(recover, 'biblioteca');
      await recover.getByRole('button',{name:'Reintentar abrir mi archivo'}).waitFor();
      await recover.getByRole('button',{name:'Reintentar abrir mi archivo'}).click();
      await recover.getByRole('button',{name:'Reintentar abrir mi archivo'}).waitFor({state:'hidden'});
      await recover.locator('[data-filter="saved"]').click();
      assert.equal(await recover.locator('.book-card[data-read="circuito-completo"]').count(),1);
      assert.match(await recover.locator('.book-card[data-read="circuito-completo"]').innerText(), /leído/iu);
    }, recover);
    await recoverContext.close();
    await check('Bookmark survives immediate logout and login while its write is delayed', async () => {
      await ready(page); await room(page,'biblioteca'); await accountLibraryReady(page); await page.locator('[data-read="equivalencias"]').click();
      await page.locator('#reader-bookmark').waitFor();
      let releaseWrite;
      const gate = new Promise(resolve => { releaseWrite=resolve; });
      const sequence = [];
      const observe = request => { if(request.method() !== 'GET' && new URL(request.url()).pathname.startsWith('/api/')) sequence.push(new URL(request.url()).pathname); };
      page.on('request',observe);
      await page.route('**/api/library', async route => { if(route.request().method()==='PUT') await gate; await route.continue(); });
      try {
        const requested = page.waitForRequest(request=>new URL(request.url()).pathname==='/api/library' && request.method()==='PUT');
        await page.locator('#reader-bookmark').click(); await requested;
        await page.getByRole('button',{name:'Cerrar lectura',exact:true}).click();
        await page.locator('.account-entry').click(); await page.locator('.account-card').waitFor();
        const logout = responseTo(page,'/api/auth/logout','POST',()=>page.getByRole('button',{name:'Cerrar sesión',exact:true}).click());
        await page.waitForTimeout(150);
        assert.equal(sequence.includes('/api/auth/logout'),false,'Logout must wait for both queued data writes');
        releaseWrite(); await logout;
        assert(sequence.indexOf('/api/progress') < sequence.indexOf('/api/auth/logout'));
      } finally { releaseWrite(); await page.unroute('**/api/library'); page.off('request',observe); }
      await login(page,changedPassword); await room(page,'biblioteca'); await accountLibraryReady(page);
      await page.locator('[data-filter="saved"]').click();
      assert.equal(await page.locator('.book-card[data-read="equivalencias"]').count(),1);
      await page.reload(); await page.locator('#library-search').waitFor(); await accountLibraryReady(page);
      await page.locator('[data-filter="saved"]').click();
      await page.locator('.book-card[data-read="equivalencias"]').waitFor();
    });
    await check('Cross-tab identity changes cannot copy account A data into account B', async () => {
      await ready(page); await room(page,'biblioteca'); await accountLibraryReady(page);
      await page.locator('[data-read="programar-secuencias"]').click();
      await page.locator('#reader-bookmark').waitFor();
      const other = await page.context().newPage(); other.setDefaultTimeout(15000);
      other.on('pageerror', error => errors.push({url:other.url(),message:error.message}));
      const successfulWrites=[];
      const observe=response=>{
        if(response.request().method()==='PUT' && ['/api/library','/api/progress'].includes(new URL(response.url()).pathname) && response.status()===200) successfulWrites.push(new URL(response.url()).pathname);
      };
      try {
        await ready(other); await room(other,'preceptoria');
        await other.locator('.account-card').waitFor();
        await responseTo(other,'/api/auth/logout','POST',()=>other.getByRole('button',{name:'Cerrar sesión',exact:true}).click());
        await other.getByRole('button',{name:'Crear cuenta',exact:true}).click();
        const form=other.getByRole('form',{name:'Crear cuenta',exact:true});
        await form.getByLabel('Tu nombre',{exact:true}).fill('QA Cookie B');
        await form.getByLabel('Correo electrónico').fill(`qa-cookie-b-${Date.now()}@example.test`);
        await form.getByLabel('Contraseña · mínimo 10 caracteres',{exact:true}).fill('QA separate account password!');
        await form.getByRole('checkbox').check();
        await responseTo(other,'/api/auth/register','POST',()=>form.getByRole('button',{name:'Crear mi cuenta'}).click());
        await other.locator('.account-card').waitFor();
        page.on('response',observe);
        const rejected=page.waitForResponse(response=>new URL(response.url()).pathname==='/api/library' && response.request().method()==='PUT');
        await page.locator('#reader-bookmark').click();
        assert.equal((await rejected).status(),403,'Stale A token must not authenticate using B cookie');
        await page.waitForFunction(()=>document.querySelector('#account-name')?.textContent==='QA Cookie B');
        await page.waitForFunction(()=>document.querySelector('#reader-bookmark')?.disabled===false);
        await other.reload(); await other.locator('.account-card').waitFor();
        await room(other,'biblioteca'); await accountLibraryReady(other);
        await other.locator('[data-filter="saved"]').click(); assert.equal(await other.locator('.book-card').count(),0,'B has no bookmarks from A');
        await room(other,'logros'); assert.equal(await other.locator('.achievement.unlocked').count(),0,'B has no readings or practice achievements from A');
        assert.deepEqual(successfulWrites,[],'Queued A writes must not replay with the newly acquired B token');
      } finally { page.off('response',observe); await other.close(); }
    });
  }
  await check('Settings, reduced motion persistence, sound and dialog focus', async () => {
    await ready(page); await page.locator('[data-open-dialog="settings-dialog"]').click();
    await page.locator('#setting-quality').selectOption('low'); await page.locator('#setting-motion').check(); await page.locator('#setting-labels').uncheck();
    await page.keyboard.press('Tab'); assert.equal(await page.locator('#settings-dialog').evaluate(el => el.contains(document.activeElement)), true);
    await page.keyboard.press('Escape'); await page.reload();
    await page.waitForFunction(() => document.documentElement.dataset.scene === 'ready');
    const data = await page.evaluate(() => ({...document.documentElement.dataset}));
    assert.equal(data.quality, 'low'); assert.equal(data.motion, 'reduced'); assert.equal(data.labels, 'false');
    await page.locator('#sound-toggle').click(); await page.waitForFunction(() => document.querySelector('#sound-toggle').getAttribute('aria-pressed') === 'true');
    await page.locator('#sound-toggle').click(); await page.waitForFunction(() => document.querySelector('#sound-toggle').getAttribute('aria-pressed') === 'false');
  });
  await check('Ohmdal real portal arrival, playable dialogue and in-world return', async () => {
    await ready(page); await room(page, 'electronica'); await page.locator('[data-journey]').click();
    await page.waitForURL(/\/(?:src\/jugar\/|jugar(?:[/?]|$))/); assert.equal(new URL(page.url()).searchParams.get('room'), 'plaza');
    await page.locator('#game canvas').waitFor({ timeout: 45000 }); await page.locator('#boot-curtain').waitFor({ state: 'detached', timeout: 45000 });
    await page.waitForTimeout(700);
    const before = await page.locator('#dialog-text').innerText(); await page.keyboard.press('Enter'); await page.waitForTimeout(350);
    assert(before.length > 0 || (await page.locator('#dialog-text').innerText()).length > 0);
    await page.screenshot({ path: `${out}/institute-ohmdal.png` });
    await page.keyboard.press('e', { delay: 180 }); await page.locator('#confirm-exit-ohmdal').waitFor();
    await page.keyboard.press('ArrowRight'); await page.keyboard.press('Enter');
    await page.waitForURL(/\/#sala\/electronica/); await page.locator('#school3d-panel.is-open').waitFor();
    assert.equal(await page.locator('[data-journey]').count(), 1);
  });
  await check('Physica portal link resolves its playable HTML entry', async () => {
    await ready(page); await room(page, 'fisica');
    const link = page.locator('#room-content a[href="/physica/"]');
    assert.equal(await link.count(), 1); await link.click(); await page.waitForURL(/\/(?:src\/experiences\/physica\/|physica(?:[/?]|$))/);
    await page.getByRole('button', { name: 'Entrar', exact: true }).click();
    await page.locator('canvas').first().waitFor({ timeout: 45000 });
    await page.goto('about:blank');
  });
  const { page: mobile } = await setup({ viewport: { width:390,height:844 }, deviceScaleFactor:1, isMobile:true, hasTouch:true });
  await check('390px touch: room navigation, practice, reading and controls reachable', async () => {
    await ready(mobile); assert.equal(await mobile.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
    await mobile.screenshot({ path: `${out}/institute-mobile.png` });
    await room(mobile, 'matematica', true); await mobile.locator('[data-activity]').tap();
    await mobile.locator('[data-operation="doblar-ambas"]').tap(); assert.equal(await mobile.locator('#bench-feedback').getAttribute('data-correct'), 'true');
    await mobile.locator('#bench-next').tap(); await mobile.locator('[data-operation="dos"]').tap(); await mobile.locator('#bench-next').tap();
    await mobile.locator('.practice-complete').waitFor();
    await room(mobile, 'biblioteca', true); await mobile.locator('[data-read="proporciones"]').tap();
    await mobile.locator('#reader-complete').tap(); await mobile.locator('#reader-bookmark').tap();
    await mobile.screenshot({ path: `${out}/institute-mobile-reader.png` });
    await mobile.getByRole('button', { name:'Cerrar lectura',exact:true }).tap();
    await mobile.locator('#school3d-panel-close').tap();
    await mobile.locator('[data-open-dialog="settings-dialog"]').tap(); await mobile.locator('#setting-motion').check();
    await mobile.locator('#settings-dialog [data-close-dialog]').tap();
    await mobile.reload(); await mobile.waitForFunction(() => document.documentElement.dataset.scene === 'ready');
    await room(mobile, 'logros', true); assert.equal(await mobile.locator('.achievement.unlocked').count(), 2);
  }, mobile);
  await mobile.context().close();
  const { context: blockedContext, page: blocked } = await setup({ viewport:{width:1280,height:900} });
  await check('Blocked localStorage: rooms, reading and settings remain usable', async () => {
    await blockedContext.addInitScript(() => Object.defineProperty(window, 'localStorage', { get() { throw new DOMException('Blocked','SecurityError'); } }));
    await ready(blocked); await blocked.locator('[data-open-dialog="settings-dialog"]').click(); await blocked.locator('#setting-motion').check();
    assert.match(await blocked.locator('#settings-status').innerText(), /no permite guardarlos/); await blocked.keyboard.press('Escape');
    await room(blocked, 'biblioteca'); await blocked.locator('[data-read="que-es-roxana"]').click();
    await blocked.locator('#reader-complete').click(); assert.match(await blocked.locator('#reader-complete').innerText(), /completada/);
    await blocked.getByRole('button', { name:'Cerrar lectura',exact:true }).click();
    await room(blocked, 'electronica'); assert.equal(await blocked.locator('[data-journey]').count(), 1);
  }, blocked);
  await blockedContext.close();
  const { context: failedContext, page: failed } = await setup({ viewport:{width:1280,height:900} });
  await check('GLB failure: directory opens functional library and account rooms', async () => {
    await failedContext.route('**/*.glb*', route => route.abort()); await failed.goto(base);
    await failed.locator('#school3d-fallback').waitFor(); await failed.locator('#fallback-directory').click();
    await failed.locator('#search-dialog[open]').waitFor(); await failed.locator('[data-search-room="biblioteca"]').click();
    await failed.locator('#library-search').waitFor(); await failed.locator('[data-read="que-es-roxana"]').click();
    await failed.locator('#reader-dialog[open]').waitFor(); await failed.getByRole('button', {name:'Cerrar lectura',exact:true}).click();
    await failed.locator('#school3d-panel-close').click(); await failed.locator('#fallback-directory').click();
    await failed.locator('[data-search-room="preceptoria"]').click(); await failed.getByRole('form',{name:'Ingresar',exact:true}).waitFor();
    await failed.screenshot({path:`${out}/institute-fallback.png`});
  }, failed);
  await check('A direct library deep link opens its room automatically when GLB fails', async () => {
    await failed.goto(`${base}/#sala/biblioteca`);
    await failed.locator('#school3d-fallback').waitFor();
    await failed.locator('#library-search').waitFor();
    assert.equal(await failed.locator('#school3d-panel').evaluate(el=>el.inert),false);
    assert.equal(await failed.locator('.book-card').count(),13);
  }, failed);
  await check('No uncaught browser exceptions across all surfaces', async () => assert.deepEqual(errors, []));
} finally {
  await writeFile(`${out}/landing-results.json`, JSON.stringify({ base, email, results, errors }, null, 2));
  console.log(`Completed ${results.filter(result=>result.passed).length}/${results.length} checks.`);
  if (results.some(result => !result.passed)) process.exitCode=1;
  await browser.close();
}
