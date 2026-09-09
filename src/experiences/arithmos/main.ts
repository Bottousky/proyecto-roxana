import './style.css';
import { mountArithmos } from './runtime.ts';

void mountArithmos(document.querySelector<HTMLElement>('#arithmos')!, () => {
  location.href = '/#aulas';
}).catch((error: unknown) => {
  console.error(error);
  const host = document.querySelector<HTMLElement>('#arithmos')!;
  host.replaceChildren();
  const message = document.createElement('p');
  message.className = 'ari-fatal';
  message.textContent = 'El puerto no pudo abrirse. Comprueba que el navegador tenga aceleración gráfica y vuelve a intentarlo.';
  const retry = document.createElement('button');
  retry.textContent = 'Volver a intentar';
  retry.onclick = () => location.reload();
  host.append(message, retry);
});
