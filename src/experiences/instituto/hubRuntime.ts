import { activateExperience, experienceById } from '../registry.ts';
import type { ExperienceRuntimeModule, RuntimeHandle } from '../types.ts';
import { L, say, toast } from '../../ui/dialog.ts';
import { openBitacora, showBitacoraButton } from '../../ui/bitacora.ts';
import { save, state } from '../../state.ts';
import {
  HUB_MODULES,
  hubModuleById,
  hubModuleState,
  hubProgress,
  type HubModule,
  type HubModuleId,
  type HubModuleState,
} from './hubModel.ts';

const assets: Record<string, { live: string; off?: string }> = {
  audiovisual: { live: new URL('../../../assets/hub/grid/audiovisual.webp', import.meta.url).href },
  direccion: { live: new URL('../../../assets/hub/grid/direccion.webp', import.meta.url).href },
  biblioteca: {
    live: new URL('../../../assets/hub/grid/biblioteca.webp', import.meta.url).href,
    off: new URL('../../../assets/hub/grid/biblioteca_off.webp', import.meta.url).href,
  },
  electronica: { live: new URL('../../../assets/hub/grid/electronica.webp', import.meta.url).href },
  programacion: { live: new URL('../../../assets/hub/grid/programacion.webp', import.meta.url).href },
  fisica: { live: new URL('../../../assets/hub/grid/fisica.webp', import.meta.url).href },
  matematica: { live: new URL('../../../assets/hub/grid/matematica.webp', import.meta.url).href },
  progreso: { live: new URL('../../../assets/hub/grid/progreso.webp', import.meta.url).href },
  preceptoria: { live: new URL('../../../assets/hub/grid/preceptoria.webp', import.meta.url).href },
  bitacora: { live: new URL('../../../assets/hub/grid/bitacora.webp', import.meta.url).href },
  core: { live: new URL('../../../assets/hub/grid/hall.webp', import.meta.url).href },
};

const introAssignment = new URL('../../../assets/cinematic/INTRO_01_asignacion.png', import.meta.url).href;
const introPast = new URL('../../../assets/instituto/intro-02-roxana-viva-v1.png', import.meta.url).href;
const introLegend = new URL('../../../assets/instituto/intro-03-leyenda-bitacora-v1.png', import.meta.url).href;
const introPresent = new URL('../../../assets/instituto/hall-master-v1.png', import.meta.url).href;

const INTRO_SLIDES = [
  { image: introAssignment, eyebrow: 'La asignación', text: 'No fue su primera opción.\nTampoco la segunda.\n\nLa Escuela Roxana apareció al final de la lista.' },
  { image: introPast, eyebrow: 'Años atrás', text: 'La Roxana era distinta.\n\nSus pasillos estaban llenos. Sus talleres hacían ruido. Sus aulas abrían mundos.' },
  { image: introLegend, eyebrow: 'Las historias', text: 'Se hablaba de una directora que llenó la escuela de preguntas. Y de una Bitácora que nadie pudo encontrar.' },
  { image: introPresent, eyebrow: 'Primer día', text: 'Ahora la escuela estaba casi vacía.\n\nY ese año, por descarte, le tocó entrar.' },
] as const;

const STATE_LABELS: Record<HubModuleState, string> = {
  attention: 'Te espera', open: 'Disponible', live: 'En actividad', quiet: 'Por descubrir',
  locked: 'Bloqueado', planned: 'Próximamente',
};

function imageFor(module: HubModule, status: HubModuleState): string {
  const pair = assets[module.asset];
  return status === 'planned' || status === 'locked' || status === 'quiet'
    ? pair.off ?? pair.live
    : pair.live;
}

function markArrival(): void {
  if (state.flags.introSeen) return;
  state.flags.introSeen = true;
  state.flags.objetivoActual = 'preceptoria';
  if (!state.flags.salasVisitadas.includes('escuela_hub')) state.flags.salasVisitadas.push('escuela_hub');
  save();
  say([
    L('', 'La escuela entera parecía desplegarse alrededor del Hall.'),
    L('', 'Cada sala tenía su propia luz. Algunas apenas respiraban.'),
    L('', 'Bueno… supongo que primero debería presentarme en Preceptoría.'),
  ]);
}

export const hubRuntime: ExperienceRuntimeModule = {
  runtime: 'school-hub',
  async mount(hostEl, context) {
    activateExperience(experienceById('instituto'), 'escuela_hub');
    state.room = 'escuela_hub';
    save();

    const root = document.createElement('section');
    root.className = 'school-hub';
    root.innerHTML = `
      <header class="hub-topbar">
        <div class="hub-brand"><span>PROYECTO ROXANA</span><strong>Escuela Roxana</strong></div>
        <div class="hub-school-state"><span>ESTADO DE LA ESCUELA</span><b><i></i> En reconstrucción</b></div>
        <div class="hub-global-progress" aria-label="Progreso global"><span></span><b></b><small></small></div>
      </header>
      <main class="hub-viewport">
        <div class="hub-map" aria-label="Mapa modular de la Escuela Roxana">
          <div class="hub-connections" aria-hidden="true"></div>
          <section class="hub-core" aria-label="Hall central">
            <img alt="Hall central y Preceptoría" />
            <div class="hub-core-copy"><span>NÚCLEO</span><strong>Hall central</strong><small>Todos los mundos vuelven acá</small></div>
            <button data-select="preceptoria">Ir a Preceptoría</button>
            <div class="hub-core-pulse" aria-hidden="true"></div>
          </section>
          <div class="hub-modules"></div>
        </div>
        <aside class="hub-panel" aria-live="polite">
          <button class="hub-panel-close" aria-label="Cerrar detalle">×</button>
          <div class="hub-panel-kicker"></div>
          <h2></h2>
          <p></p>
          <div class="hub-panel-meta"></div>
          <button class="hub-panel-action"></button>
        </aside>
      </main>
      <footer class="hub-footer">
        <span class="hub-objective-label">OBJETIVO ACTUAL</span>
        <strong class="hub-objective"></strong>
        <span class="hub-help">Selecciona una sala para conocerla</span>
      </footer>
    `;
    hostEl.appendChild(root);

    const modulesEl = root.querySelector<HTMLElement>('.hub-modules')!;
    const panel = root.querySelector<HTMLElement>('.hub-panel')!;
    const coreImage = root.querySelector<HTMLImageElement>('.hub-core img')!;
    coreImage.src = assets.core.live;
    let selected: HubModuleId = state.flags.talkedPreceptor ? 'electronica' : 'preceptoria';
    let introActive = false;

    function objectiveText(): string {
      if (!state.flags.talkedPreceptor) return 'Preséntate en Preceptoría';
      if (!state.flags.hasBitacora) return 'Explora Dirección';
      if (!state.flags.sawProjector) return 'Entra al Taller de Electrónica';
      return 'Continúa tu recorrido por Ohmdal';
    }

    function renderHeader(): void {
      const progress = hubProgress(state.flags);
      const progressEl = root.querySelector<HTMLElement>('.hub-global-progress')!;
      progressEl.style.setProperty('--progress', `${progress}%`);
      progressEl.querySelector('span')!.textContent = 'ARCO I';
      progressEl.querySelector('b')!.textContent = `${progress}%`;
      progressEl.querySelector('small')!.textContent = `${state.flags.salasVisitadas.length} espacios visitados`;
      root.querySelector<HTMLElement>('.hub-objective')!.textContent = objectiveText();
    }

    function moduleMarkup(module: HubModule): string {
      const status = hubModuleState(module.id, state.flags);
      return `
        <button class="hub-module hub-module-${module.id}" data-module="${module.id}" data-state="${status}"
          style="--module-accent:${module.accent}" aria-pressed="${selected === module.id}">
          <img src="${imageFor(module, status)}" alt="" />
          <span class="hub-module-shade"></span>
          <span class="hub-module-state"><i></i>${STATE_LABELS[status]}</span>
          <span class="hub-module-title"><small>${module.eyebrow}</small><strong>${module.title}</strong></span>
          <span class="hub-module-arrow">↗</span>
        </button>`;
    }

    function renderModules(): void {
      modulesEl.innerHTML = HUB_MODULES.map(moduleMarkup).join('');
    }

    function renderPanel(): void {
      const module = hubModuleById(selected);
      const status = hubModuleState(selected, state.flags);
      panel.style.setProperty('--panel-accent', module.accent);
      panel.dataset.state = status;
      panel.querySelector<HTMLElement>('.hub-panel-kicker')!.textContent = `${module.eyebrow} · ${STATE_LABELS[status]}`;
      panel.querySelector('h2')!.textContent = module.title;
      panel.querySelector('p')!.textContent = module.description;
      panel.querySelector<HTMLElement>('.hub-panel-meta')!.innerHTML = `
        <span>${module.kind === 'world' ? 'MUNDO APLICADO' : module.kind === 'system' ? 'SISTEMA ESCOLAR' : 'ESPACIO INSTITUCIONAL'}</span>
        <b>${status === 'planned' ? 'Módulo preparado para crecer' : 'Módulo conectado al progreso'}</b>`;
      const action = panel.querySelector<HTMLButtonElement>('.hub-panel-action')!;
      action.textContent = status === 'planned' ? 'Ver estado del módulo' : module.actionLabel;
      action.disabled = false;
      panel.classList.add('is-open');
    }

    function renderAll(): void {
      renderHeader();
      renderModules();
      renderPanel();
    }

    function afterStateChange(): void {
      save();
      renderAll();
    }

    function activateSelected(): void {
      const status = hubModuleState(selected, state.flags);
      if (selected === 'preceptoria') {
        if (!state.flags.talkedPreceptor) {
          say([
            L('Preceptor', '¿El nuevo? A ver… Primer año… ingresante nuevo… Sí. Acá estás. Llegaste temprano.'),
            L('Preceptor', 'En esta escuela esas dos cosas suelen ser parecidas.'),
            L('Preceptor', 'Primero tienes que pasar por Dirección. Está arriba del Hall. No tiene pérdida. O no debería.'),
          ], () => {
            state.flags.talkedPreceptor = true;
            state.flags.objetivoActual = 'direccion';
            afterStateChange();
          });
        } else {
          say(L('Preceptor', 'La escuela cambia con lo que haces. El mapa también. Revísalo seguido.'));
        }
        return;
      }
      if (selected === 'direccion') {
        say([
          L('', 'La puerta de Dirección estaba abierta.'),
          L('', 'Adentro no había nadie. Sobre el escritorio, una lámpara seguía encendida.'),
        ]);
        return;
      }
      if (selected === 'electronica') {
        state.room = 'aula';
        save();
        void context.requestTravel({ experienceId: 'ohmdal', roomId: 'aula' });
        return;
      }
      if (selected === 'biblioteca') {
        if (state.flags.hasBitacora) openBitacora();
        else say(L('', 'Los estantes están abiertos, pero el catálogo parece esperar una credencial que todavía no tienes.'));
        return;
      }
      if (selected === 'bitacora' || selected === 'progreso') {
        if (state.flags.hasBitacora) {
          showBitacoraButton();
          openBitacora();
        } else say(L('', 'Todavía no hay un registro vinculado a este estudiante.'));
        return;
      }
      if (selected === 'audiovisual') {
        say(L('', 'La sala conserva documentales, clases grabadas y fragmentos del antiguo Programa de Mundos Aplicados.'));
        return;
      }
      if (status === 'planned') {
        toast(`${hubModuleById(selected).title}: este módulo todavía está tomando forma.`);
      }
    }

    modulesEl.addEventListener('click', (event) => {
      const button = (event.target as HTMLElement).closest<HTMLButtonElement>('[data-module]');
      if (!button) return;
      selected = button.dataset.module as HubModuleId;
      renderModules();
      renderPanel();
    });
    root.querySelector<HTMLElement>('.hub-core')!.addEventListener('click', (event) => {
      const target = (event.target as HTMLElement).closest<HTMLElement>('[data-select]');
      if (!target) return;
      selected = target.dataset.select as HubModuleId;
      renderModules();
      renderPanel();
    });
    panel.querySelector<HTMLButtonElement>('.hub-panel-action')!.addEventListener('click', activateSelected);
    panel.querySelector<HTMLButtonElement>('.hub-panel-close')!.addEventListener('click', () => panel.classList.remove('is-open'));

    function showIntro(): void {
      introActive = true;
      const overlay = document.createElement('div');
      overlay.className = 'school-intro';
      overlay.innerHTML = `
        <div class="school-intro-image"></div><div class="school-intro-shade"></div>
        <button class="school-intro-skip">Saltar intro</button>
        <div class="school-intro-copy"><span></span><p></p><button>Continuar <b>→</b></button></div>
        <div class="school-intro-progress"></div>`;
      root.appendChild(overlay);
      let index = 0;
      const image = overlay.querySelector<HTMLElement>('.school-intro-image')!;
      const eyebrow = overlay.querySelector<HTMLElement>('.school-intro-copy span')!;
      const copy = overlay.querySelector<HTMLElement>('.school-intro-copy p')!;
      const progress = overlay.querySelector<HTMLElement>('.school-intro-progress')!;
      function draw(): void {
        const slide = INTRO_SLIDES[index];
        image.style.backgroundImage = `url("${slide.image}")`;
        eyebrow.textContent = slide.eyebrow;
        copy.textContent = slide.text;
        progress.textContent = INTRO_SLIDES.map((_, i) => i === index ? '●' : '○').join('  ');
      }
      function finish(): void {
        state.flags.seenIntro = true;
        save();
        introActive = false;
        overlay.remove();
        markArrival();
      }
      function advance(): void {
        if (index === INTRO_SLIDES.length - 1) finish();
        else { index += 1; draw(); }
      }
      overlay.querySelector<HTMLButtonElement>('.school-intro-copy button')!.addEventListener('click', advance);
      overlay.querySelector<HTMLButtonElement>('.school-intro-skip')!.addEventListener('click', finish);
      draw();
    }

    renderAll();
    panel.classList.remove('is-open');
    if (!state.flags.seenIntro) showIntro();
    else window.setTimeout(markArrival, 160);

    const handle: RuntimeHandle = {
      async travelTo() {
        state.room = 'escuela_hub';
        save();
        renderAll();
      },
      snapshot() {
        return { runtime: 'school-hub', data: { room: 'escuela_hub', selected, introActive } };
      },
      pause() { root.dataset.paused = 'true'; },
      resume() { delete root.dataset.paused; renderAll(); },
      async destroy() { root.remove(); },
    };
    return handle;
  },
};
