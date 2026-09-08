import { createRoxanaApi } from './api.mjs';

/** Share the exact same persistent services across Vite development and preview. */
export function roxanaServicesPlugin() {
  function install(server) {
    const api = createRoxanaApi();
    server.middlewares.use(api.middleware);
    server.httpServer?.once('close', api.close);
  }
  return {
    name: 'roxana-account-services',
    configureServer: install,
    configurePreviewServer: install,
  };
}
