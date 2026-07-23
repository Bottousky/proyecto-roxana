import { activateExperience, experienceById } from '../registry.ts';
import type { ExperienceRuntimeModule, RuntimeHandle } from '../types.ts';
import { L, say } from '../../ui/dialog.ts';
import { save, state } from '../../state.ts';
import {
  HALL_HOTSPOTS,
  HALL_WIDTH,
  hallCameraX,
  nearestHallHotspot,
  parallaxX,
  walkTowardHallTarget,
  type ParallaxHotspot,
} from './parallaxModel.ts';

const hallImage = new URL('../../../assets/instituto/hall-master-v1.png', import.meta.url).href;
const studentImage = new URL('../../../assets/instituto/student-v1.png', import.meta.url).href;
const introAssignment = new URL('../../../assets/cinematic/INTRO_01_asignacion.png', import.meta.url).href;
const introPast = new URL('../../../assets/instituto/intro-02-roxana-viva-v1.png', import.meta.url).href;
const introLegend = new URL('../../../assets/instituto/intro-03-leyenda-bitacora-v1.png', import.meta.url).href;

const INTRO_SLIDES = [
  {
    image: introAssignment,
    eyebrow: 'La asignación',
    text: 'No fue su primera opción.\nTampoco la segunda.\n\nLa Escuela Roxana apareció al final de la lista, cuando ya no quedaban muchas puertas abiertas.',
  },
  {
    image: introPast,
    eyebrow: 'Años atrás',
    text: 'La Roxana era distinta.\n\nSus pasillos estaban llenos. Sus talleres hacían ruido. Sus aulas abrían mundos.',
  },
  {
    image: introLegend,
    eyebrow: 'Las historias',
    text: 'Se hablaba de una directora que llenó la escuela de preguntas. De aulas que no eran solo aulas. De una Bitácora que nadie pudo encontrar.',
  },
  {
    image: hallImage,
    eyebrow: 'Primer día',
    text: 'Pero ahora la escuela estaba casi vacía.\nLos pasillos dejaron de sonar.\n\nY ese año, por descarte, le tocó entrar.',
  },
] as const;

function dialogIsOpen(): boolean {
  return !document.getElementById('dialog')?.classList.contains('hidden');
}

function markArrival(): void {
  if (state.flags.introSeen) return;
  state.flags.introSeen = true;
  state.flags.objetivoActual = 'hall';
  if (!state.flags.salasVisitadas.includes('hall')) state.flags.salasVisitadas.push('hall');
  save();
  say([
    L('', 'El hall era más grande de lo que parecía desde afuera.'),
    L('', 'También estaba más vacío.'),
    L('', 'Bueno… supongo que es acá. ¿Dónde se supone que me presento?'),
  ]);
}

function linesFor(hotspot: ParallaxHotspot): ReturnType<typeof L>[] {
  switch (hotspot.id) {
    case 'entrada':
      return [
        L('', 'La puerta quedó abierta detrás de ti.'),
        L('', 'Por alguna razón, eso no tranquiliza demasiado.'),
      ];
    case 'banco':
      return [
        L('', 'El banco está marcado con nombres, fechas y frases viejas.'),
        L('', 'Una dice: “Si la escuela te responde, no le creas a la primera.”'),
      ];
    case 'estatua':
      return [
        L('', 'La estatua ocupa el centro del Hall.'),
        L('', '“Roxana — Directora fundadora del Programa de Mundos Aplicados.”'),
        L('', 'Alguien dejó una flor seca en la base.'),
      ];
    case 'cartelera':
      return [
        L('', 'Cartelera de ingresantes. La mayoría de las hojas son viejas.'),
        L('', 'Una lista nueva tiene tu nombre escrito a mano. Al lado, alguien dibujó una flecha hacia Preceptoría.'),
      ];
    case 'escalera':
      return [
        L('', 'La escalera cruje incluso antes de que apoyes el pie.'),
        L('', 'Arriba, la puerta de Dirección espera en silencio.'),
      ];
    case 'preceptor':
      return [
        L('Preceptor', '¿El nuevo? A ver… Primer año… ingresante nuevo… Sí. Acá estás. Llegaste temprano.'),
        L('Preceptor', 'No. Bueno… sí. En esta escuela esas dos cosas suelen ser parecidas.'),
        L('Preceptor', 'Primero tienes que pasar por Dirección. Subiendo la escalera central. Puerta grande. No tiene pérdida. O no debería.'),
      ];
    case 'vitrina':
      return [
        L('', 'La vitrina está llena de fotos viejas, trofeos y objetos técnicos.'),
        L('', 'Una foto tiene una nota al dorso: “Roxana y la primera Bitácora”.'),
      ];
    case 'matematica':
      return [L('', 'Aula de Matemática. En el vidrio hay figuras geométricas dibujadas con marcador viejo.')];
    case 'fisica':
      return [L('', 'Laboratorio de Física. “Material inventariado. No ingresar sin docente.” La nota parece tener años.')];
    case 'programacion':
      return [L('', 'Sala de Computación. El cartel fue cambiado varias veces: “Informática”, “Computación”, “Programación”.')];
    case 'taller':
      return [
        L('', 'Taller de Electrónica. El cartel está torcido.'),
        L('', 'Del otro lado no se escucha nada. Aunque por un segundo creíste oír un zumbido.'),
      ];
  }
}

export const parallaxRuntime: ExperienceRuntimeModule = {
  runtime: 'school-parallax',
  async mount(hostEl, context) {
    activateExperience(experienceById('instituto'), 'hall');
    state.room = 'hall';
    save();

    const root = document.createElement('section');
    root.className = 'school2d';
    root.innerHTML = `
      <div class="school2d-world" aria-label="Hall de la Escuela Roxana">
        <div class="school2d-layer school2d-back"></div>
        <div class="school2d-light school2d-light-a"></div>
        <div class="school2d-light school2d-light-b"></div>
        <div class="school2d-dust" aria-hidden="true"></div>
        <div class="school2d-mid">
          <div class="school2d-hotspots"></div>
          <div class="school2d-waypoint hidden" aria-hidden="true"></div>
          <div class="school2d-player"><div class="school2d-shadow"></div><img alt="Estudiante" /></div>
        </div>
        <div class="school2d-foreground" aria-hidden="true"><i></i><i></i></div>
      </div>
      <header class="school2d-location"><span>ESCUELA ROXANA</span><strong>Hall principal</strong></header>
      <div class="school2d-objective">OBJETIVO <strong>Busca a alguien de la escuela</strong></div>
      <div class="school2d-hint">Haz clic para caminar · Elige un lugar para explorarlo</div>
    `;
    hostEl.appendChild(root);

    const world = root.querySelector<HTMLElement>('.school2d-world')!;
    const back = root.querySelector<HTMLElement>('.school2d-back')!;
    const mid = root.querySelector<HTMLElement>('.school2d-mid')!;
    const foreground = root.querySelector<HTMLElement>('.school2d-foreground')!;
    const dust = root.querySelector<HTMLElement>('.school2d-dust')!;
    const player = root.querySelector<HTMLElement>('.school2d-player')!;
    const playerImg = player.querySelector<HTMLImageElement>('img')!;
    const waypoint = root.querySelector<HTMLElement>('.school2d-waypoint')!;
    const hotspotContainer = root.querySelector<HTMLElement>('.school2d-hotspots')!;
    playerImg.src = studentImage;
    back.style.backgroundImage = `url("${hallImage}")`;

    for (const hotspot of HALL_HOTSPOTS) {
      const button = document.createElement('button');
      button.className = `school2d-hotspot school2d-hotspot-${hotspot.id}`;
      button.style.left = `${hotspot.x}px`;
      button.dataset.hotspot = hotspot.id;
      button.setAttribute('aria-label', hotspot.label);
      button.innerHTML = `<span>${hotspot.label}</span>`;
      hotspotContainer.appendChild(button);
    }

    let x = 240;
    let direction = 1;
    let targetX: number | null = null;
    let pendingHotspot: ParallaxHotspot['id'] | null = null;
    let running = true;
    let introActive = false;

    function interact(id?: ParallaxHotspot['id']): void {
      if (introActive || dialogIsOpen()) return;
      const hotspot = id
        ? HALL_HOTSPOTS.find((item) => item.id === id) ?? null
        : nearestHallHotspot(x);
      if (!hotspot) return;
      if (hotspot.id === 'preceptor' && !state.flags.talkedPreceptor) {
        say(linesFor(hotspot), () => {
          state.flags.talkedPreceptor = true;
          state.flags.objetivoActual = 'direccion';
          save();
          root.querySelector<HTMLElement>('.school2d-objective strong')!.textContent = 'Sube a Dirección';
        });
        return;
      }
      if (hotspot.id === 'taller') {
        say(linesFor(hotspot), () => {
          state.room = 'aula';
          save();
          void context.requestTravel({ experienceId: 'ohmdal', roomId: 'aula' });
        });
        return;
      }
      say(linesFor(hotspot));
    }

    function walkTo(worldX: number, hotspotId: ParallaxHotspot['id'] | null = null): void {
      const hotspot = hotspotId ? HALL_HOTSPOTS.find((item) => item.id === hotspotId) : null;
      const approach = hotspot
        ? hotspot.x + (x <= hotspot.x ? -Math.min(72, hotspot.radius * 0.55) : Math.min(72, hotspot.radius * 0.55))
        : worldX;
      targetX = Math.max(110, Math.min(HALL_WIDTH - 110, approach));
      pendingHotspot = hotspotId;
      waypoint.style.left = `${targetX}px`;
      waypoint.classList.remove('hidden');
    }

    function showIntro(): void {
      introActive = true;
      const overlay = document.createElement('div');
      overlay.className = 'school-intro';
      overlay.innerHTML = `
        <div class="school-intro-image"></div>
        <div class="school-intro-shade"></div>
        <button class="school-intro-skip">Saltar intro</button>
        <div class="school-intro-copy"><span></span><p></p><button>Continuar <b>→</b></button></div>
        <div class="school-intro-progress"></div>
      `;
      root.appendChild(overlay);
      let index = 0;
      const image = overlay.querySelector<HTMLElement>('.school-intro-image')!;
      const eyebrow = overlay.querySelector<HTMLElement>('.school-intro-copy span')!;
      const copy = overlay.querySelector<HTMLElement>('.school-intro-copy p')!;
      const progress = overlay.querySelector<HTMLElement>('.school-intro-progress')!;

      function renderSlide(): void {
        const slide = INTRO_SLIDES[index];
        image.style.backgroundImage = `url("${slide.image}")`;
        image.style.setProperty('--intro-position', `${20 + index * 18}% center`);
        eyebrow.textContent = slide.eyebrow;
        copy.textContent = slide.text;
        progress.textContent = INTRO_SLIDES.map((_, i) => (i === index ? '●' : '○')).join('  ');
      }

      function finish(): void {
        state.flags.seenIntro = true;
        save();
        introActive = false;
        overlay.remove();
        markArrival();
      }

      function advance(): void {
        if (index >= INTRO_SLIDES.length - 1) finish();
        else {
          index += 1;
          renderSlide();
        }
      }

      overlay.querySelector<HTMLButtonElement>('.school-intro-copy button')!.addEventListener('click', advance);
      overlay.querySelector<HTMLButtonElement>('.school-intro-skip')!.addEventListener('click', finish);
      renderSlide();
    }

    hotspotContainer.addEventListener('click', (event) => {
      const target = (event.target as HTMLElement).closest<HTMLButtonElement>('[data-hotspot]');
      if (!target || introActive || dialogIsOpen()) return;
      event.stopPropagation();
      walkTo(0, target.dataset.hotspot as ParallaxHotspot['id']);
    });
    world.addEventListener('click', (event) => {
      if (introActive || dialogIsOpen() || (event.target as HTMLElement).closest('[data-hotspot]')) return;
      const rect = root.getBoundingClientRect();
      const camera = hallCameraX(x, Math.max(320, root.clientWidth));
      walkTo(event.clientX - rect.left + camera);
    });

    let frame = 0;
    let previous = performance.now();
    function tick(now: number): void {
      if (!running) return;
      // Un hotspot enfocado no debe convertir el contenedor en un scroll area;
      // la única cámara es la que controla este runtime.
      root.scrollLeft = 0;
      root.scrollTop = 0;
      const dt = Math.min(0.05, (now - previous) / 1000);
      previous = now;
      let walking = false;
      if (!introActive && !dialogIsOpen() && targetX !== null) {
        const previousX = x;
        x = walkTowardHallTarget(x, targetX, dt);
        direction = Math.sign(targetX - previousX) || direction;
        walking = x !== targetX;
        if (x === targetX) {
          targetX = null;
          waypoint.classList.add('hidden');
          const arrival = pendingHotspot;
          pendingHotspot = null;
          if (arrival) interact(arrival);
        }
      }
      const viewport = Math.max(320, root.clientWidth);
      const camera = hallCameraX(x, viewport);
      const visibleWorldWidth = Math.max(viewport, HALL_WIDTH);
      world.style.width = `${visibleWorldWidth}px`;
      // El arte maestro contiene los hotspots: viaja con el plano jugable para
      // que interacción y arquitectura permanezcan alineadas. La profundidad
      // nace de luz/polvo más lentos y foreground más rápido.
      back.style.transform = `translate3d(${-camera}px,0,0)`;
      mid.style.transform = `translate3d(${-camera}px,0,0)`;
      dust.style.transform = `translate3d(${parallaxX(camera, 0.45)}px,0,0)`;
      foreground.style.transform = `translate3d(${parallaxX(camera, 1.12)}px,0,0)`;
      player.style.left = `${x}px`;
      player.classList.toggle('is-walking', walking);
      playerImg.style.transform = `scaleX(${direction < 0 ? -1 : 1})`;

      frame = requestAnimationFrame(tick);
    }
    frame = requestAnimationFrame(tick);

    if (!state.flags.seenIntro) showIntro();
    else window.setTimeout(markArrival, 180);

    const handle: RuntimeHandle = {
      async travelTo() {},
      snapshot() {
        return { runtime: 'school-parallax', data: { room: 'hall', x } };
      },
      pause() {
        running = false;
        cancelAnimationFrame(frame);
        targetX = null;
      },
      resume() {
        if (running) return;
        running = true;
        previous = performance.now();
        frame = requestAnimationFrame(tick);
      },
      async destroy() {
        running = false;
        cancelAnimationFrame(frame);
        root.remove();
      },
    };
    return handle;
  },
};
