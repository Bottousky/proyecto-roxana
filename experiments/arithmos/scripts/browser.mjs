// Navegador para los scripts: Chrome instalado (la Mac del proyecto, con GPU) o, si no está, el Chromium de Playwright
// (contenedores sin Chrome; WebGL por software). ARITHMOS_CHROMIUM=<ruta> fuerza un ejecutable.
import {chromium} from 'playwright';

export async function launch(args = []) {
  const exe = process.env.ARITHMOS_CHROMIUM;
  if (exe) return chromium.launch({executablePath: exe, args: [...args, '--enable-unsafe-swiftshader']});
  try {
    return await chromium.launch({channel: 'chrome', args});
  } catch {
    return chromium.launch({args: [...args, '--enable-unsafe-swiftshader']});
  }
}
