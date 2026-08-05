// Mundo de Physica — slice vertical M1.
//
// La escena es una naturaleza con una ley rota: la cascada cae "hacia arriba".
// El jugador siente la anomalía con el cuerpo (plataformero), empuja y lanza
// objetos (la gramática de Physica: manipulación, no clic en un banco), repara
// la fuente y la cámara puede girar el mundo a una vista isométrica.
//
// Todo lo que se puede medir vive en los modelos puros (models/): acá sólo se
// presenta y se alimenta input.
import * as THREE from 'three';
import { GRAVEDAD, integrar } from './models/caidaLibre.ts';
import { muestrearTrayectoria, type Tiro } from './models/tiroParabolico.ts';
import {
  AVATAR_H,
  AVATAR_HALF_W,
  crearAvatar,
  integrarAvatar,
  type Plataforma,
} from './avatar.ts';

export interface PhysicaWorld {
  advanceTime(dtMs: number): void;
  snapshot(): Record<string, unknown>;
  pause(): void;
  resume(): void;
  dispose(): void;
  press(action: string, down: boolean): void;
  /** Sólo para el harness de desarrollo: coloca al avatar donde la prueba lo necesita. */
  teleport(x: number, y: number): void;
}

/* ---------- constantes del nivel ---------- */

const G = GRAVEDAD;
const GROUND_X0 = -11;
const GROUND_X1 = 13;
const GROUND_TOP = 0;
const STEP: Plataforma = { x0: 6, x1: 9, top: 2.6 };
const POOL: Plataforma = { x0: 10, x1: 13, top: 4.2 };
const CASCADA_X0 = 10.2;
const CASCADA_X1 = 12.8;
const CASCADA_CIELO = 9;
const BOULDER_W = 1.4;
const BOULDER_H = 1.2;
const PLATE_X = -3;
const PLATE_HALF = 0.7;
const DOOR_X = -8;
const NUCLEO_X = 12.3;
const NUCLEO_Y = 4.7;
const LANZAR_VX = 6;
const LANZAR_VY = 4.5;
const PUSH_V = 1.1;

const plataformasFijas: Plataforma[] = [
  { x0: GROUND_X0, x1: GROUND_X1, top: GROUND_TOP },
  STEP,
  POOL,
];

/* ---------- helpers visuales ---------- */

function material(color: number, opts: Partial<THREE.MeshStandardMaterialParameters> = {}): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({ color, ...opts });
}

function box(w: number, h: number, d: number, mat: THREE.MeshStandardMaterial): THREE.Mesh {
  return new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/* ---------- mundo ---------- */

export function createPhysicaWorld(hostEl: HTMLElement): PhysicaWorld {
  /* renderer + escena + cámara */
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  function resize(): void {
    const w = hostEl.clientWidth || window.innerWidth;
    const h = hostEl.clientHeight || window.innerHeight;
    renderer.setSize(w, h);
  }
  resize();
  hostEl.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x1b2430);
  scene.fog = new THREE.Fog(0x1b2430, 60, 150);

  const camera = new THREE.PerspectiveCamera(6, 1, 0.1, 300);
  camera.position.set(2, 5, 85);

  scene.add(new THREE.HemisphereLight(0xdbe8ff, 0x3a4a3f, 0.9));
  const sun = new THREE.DirectionalLight(0xfff2d0, 1.4);
  sun.position.set(6, 12, 10);
  scene.add(sun);

  /* escenario */
  const pisoMat = material(0x4a5d44);
  const piso = box(GROUND_X1 - GROUND_X0 + 20, 0.6, 8, pisoMat);
  piso.position.set((GROUND_X0 + GROUND_X1) / 2 - 4, -0.3, 0);
  scene.add(piso);

  const escalon = box(STEP.x1 - STEP.x0, STEP.top, 4, material(0x5a6a52));
  escalon.position.set((STEP.x0 + STEP.x1) / 2, STEP.top / 2, 0);
  scene.add(escalon);

  const plataforma = box(POOL.x1 - POOL.x0, POOL.top, 4, material(0x6a5a52));
  plataforma.position.set((POOL.x0 + POOL.x1) / 2, POOL.top / 2, 0);
  scene.add(plataforma);

  // poza de agua sobre la plataforma
  const poza = box(POOL.x1 - POOL.x0, 0.2, 3.6, material(0x7fc6ff, { transparent: true, opacity: 0.6 }));
  poza.position.set((POOL.x0 + POOL.x1) / 2, POOL.top + 0.1, 0);
  scene.add(poza);

  // la fuente en el cielo: un pequeño grupo de esferas
  const nube = new THREE.Group();
  const nubeMat = material(0xd8e6f2);
  for (const [ox, oy, r] of [[0, 0, 0.9], [0.9, 0.3, 0.6], [-0.8, 0.35, 0.55], [0.3, 0.8, 0.5]] as const) {
    const esfera = new THREE.Mesh(new THREE.SphereGeometry(r, 10, 8), nubeMat);
    esfera.position.set(CASCADA_X0 + (CASCADA_X1 - CASCADA_X0) / 2 + ox, CASCADA_CIELO + oy, 0);
    nube.add(esfera);
  }
  scene.add(nube);

  // gotas de la cascada (simuladas con caidaLibre)
  const N_GOTAS = 16;
  const gotas: { m: THREE.Mesh; y: number; v: number }[] = [];
  const gotaGeo = new THREE.SphereGeometry(0.14, 6, 5);
  const gotaMat = material(0x9fdcff, { transparent: true, opacity: 0.85 });
  for (let i = 0; i < N_GOTAS; i++) {
    const m = new THREE.Mesh(gotaGeo, gotaMat);
    m.position.set(CASCADA_X0 + (CASCADA_X1 - CASCADA_X0) * Math.random(), 0, 0);
    gotas.push({ m, y: 0, v: 0 });
    scene.add(m);
  }

  // la piedra que se empuja
  const rocaGrande = box(BOULDER_W, BOULDER_H, 1.6, material(0x8a8578));
  const boulder = { x: 4.5, mesh: rocaGrande };
  rocaGrande.position.set(boulder.x, BOULDER_H / 2, 0);
  scene.add(rocaGrande);

  // la piedra que se lanza
  const rocaChica = new THREE.Mesh(new THREE.IcosahedronGeometry(0.34, 0), material(0x6b6f77));
  const rock = {
    x: -1,
    y: 0.34,
    vx: 0,
    vy: 0,
    inFlight: false,
    airTime: 0,
    restante: true,
    mesh: rocaChica,
  };
  rocaChica.position.set(rock.x, rock.y, 0);
  scene.add(rocaChica);

  // la placa que abre la puerta
  const placaMesh = box(PLATE_HALF * 2, 0.18, 1.6, material(0x8a6f4d));
  placaMesh.position.set(PLATE_X, 0.09, 0);
  scene.add(placaMesh);
  const placaEncendida = material(0xc7a24a);
  let placaActiva = false;

  // la puerta que se abre
  const puertaMesh = box(1.1, 3.5, 0.5, material(0x4a4a52));
  puertaMesh.position.set(DOOR_X, 1.75, 0);
  scene.add(puertaMesh);
  let puertaAbierta = false;

  // el núcleo de la fuente (lo que se repara)
  const nucleoMat = material(0x6a6f7a);
  const nucleo = new THREE.Mesh(new THREE.SphereGeometry(0.45, 12, 10), nucleoMat);
  nucleo.position.set(NUCLEO_X, NUCLEO_Y, 0);
  scene.add(nucleo);
  const nucleoReparadoMat = material(0xffe08a, { emissive: 0x8a6a00, emissiveIntensity: 1.2 });
  let restaurado = false;

  // la fauna que se mueve mal
  const aves: { m: THREE.Mesh; x: number; y: number }[] = [];
  for (const [bx, by] of [[9, 7], [10, 8], [8, 8.5]] as const) {
    const m = box(0.7, 0.25, 0.7, material(0x7a86a0));
    m.position.set(bx, by, 0);
    aves.push({ m, x: bx, y: by });
    scene.add(m);
  }
  const peces: { m: THREE.Mesh; x: number; y: number }[] = [];
  for (const [bx, by] of [[8, 4.5], [7, 5.5]] as const) {
    const m = new THREE.Mesh(new THREE.ConeGeometry(0.3, 0.6, 6), material(0x9ad0c9));
    m.rotation.z = Math.PI / 2;
    m.position.set(bx, by, 0);
    peces.push({ m, x: bx, y: by });
    scene.add(m);
  }

  // el acompañante: la sonda viva (no verbal)
  const compMat = material(0x7ff2d0, { emissive: 0x1a7a5c, emissiveIntensity: 0.8 });
  const companero = new THREE.Mesh(new THREE.SphereGeometry(0.32, 12, 10), compMat);
  scene.add(companero);

  // el avatar
  const avatar = crearAvatar(2, GROUND_TOP + AVATAR_H / 2);
  const avatarGroup = new THREE.Group();
  const torso = box(0.5, 0.7, 0.4, material(0xd9b894));
  torso.position.y = 0.85;
  const cabeza = new THREE.Mesh(new THREE.SphereGeometry(0.24, 10, 8), material(0xe3c39b));
  cabeza.position.y = 1.35;
  const piernas = box(0.44, 0.5, 0.36, material(0x55505e));
  piernas.position.y = 0.25;
  avatarGroup.add(torso, cabeza, piernas);
  scene.add(avatarGroup);

  // preview de trayectoria (la sonda dibuja la parábola predicha)
  const prevPuntos: number[] = [];
  const prevGeo = new THREE.BufferGeometry();
  prevGeo.setAttribute('position', new THREE.Float32BufferAttribute(prevPuntos, 3));
  const prevMat = new THREE.LineBasicMaterial({ color: 0x9fdcff, transparent: true, opacity: 0.75 });
  const preview = new THREE.Line(prevGeo, prevMat);
  preview.frustumCulled = false;
  scene.add(preview);

  /* ---------- UI en DOM (página standalone) ---------- */
  const ui = document.createElement('div');
  ui.className = 'px-ui';
  ui.innerHTML = `
    <div id="px-prompt" class="px-prompt hidden"></div>
    <div id="px-toast" class="px-toast hidden" role="status"></div>
    <div id="px-measure" class="px-measure hidden"></div>
    <button id="px-bita-btn" class="px-bita-btn hidden" title="Bitácora (B)">✒</button>
    <div id="px-bita" class="px-bita hidden">
      <section class="px-bita-panel" role="dialog" aria-modal="true" aria-label="Bitácora">
        <button id="px-bita-close" class="px-bita-close" aria-label="Cerrar">✕</button>
        <div id="px-bita-body"></div>
      </section>
    </div>
    <div id="px-touch" class="px-touch hidden">
      <div class="px-touch-left">
        <button data-act="left">◀</button>
        <button data-act="right">▶</button>
      </div>
      <div class="px-touch-right">
        <button data-act="jump">⤒</button>
        <button data-act="act">✋</button>
        <button data-act="throw">✧</button>
        <button data-act="rotate">◈</button>
      </div>
    </div>`;
  hostEl.appendChild(ui);

  const promptEl = ui.querySelector<HTMLElement>('#px-prompt')!;
  const toastEl = ui.querySelector<HTMLElement>('#px-toast')!;
  const measureEl = ui.querySelector<HTMLElement>('#px-measure')!;
  const bitaBtn = ui.querySelector<HTMLElement>('#px-bita-btn')!;
  const bitaPanel = ui.querySelector<HTMLElement>('#px-bita')!;
  const bitaBody = ui.querySelector<HTMLElement>('#px-bita-body')!;
  const touchEl = ui.querySelector<HTMLElement>('#px-touch')!;

  let toastTimer = 0;
  function toast(msg: string): void {
    toastEl.textContent = msg;
    toastEl.classList.remove('hidden');
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toastEl.classList.add('hidden'), 2600);
  }

  function abrirBitacora(): void {
    bitaPanel.classList.remove('hidden');
    (bitaPanel.querySelector('#px-bita-close') as HTMLElement | null)?.focus();
    const tCaida = mediciones.length > 0 ? mediciones[mediciones.length - 1] : null;
    bitaBody.innerHTML = `
      <h3>Physica — la cascada que sube</h3>
      <p class="px-bita-fecha">Primera visita</p>
      <p class="px-bita-viv"><strong>Lo que viví.</strong>
      El agua subía. La piedra, soltada en la columna, subía con ella.
      Soltada fuera de la columna, caía. Medí el tiempo de caída:
      ${tCaida !== null ? `<strong>${tCaida.toFixed(2)} s</strong>` : 'todavía no lo medí'}.
      Pesada o liviana, la caída se demoraba igual.</p>
      <p class="px-bita-formal"><strong>Lo que entiendo ahora.</strong></p>
      <p class="px-bita-todo">// TODO(guion): la formalización de la caída libre
      (aceleración constante) se escribe cuando exista guion.</p>`;
  }

  bitaBtn.addEventListener('click', () => abrirBitacora());
  bitaPanel.querySelector('#px-bita-close')!.addEventListener('click', () => bitaPanel.classList.add('hidden'));

  /* ---------- input ---------- */
  const input = { left: false, right: false, jump: false };
  let actEdge = false;
  let throwEdge = false;
  let rotateEdge = false;

  function setKey(code: string, down: boolean): void {
    switch (code) {
      case 'ArrowLeft': case 'KeyA': input.left = down; break;
      case 'ArrowRight': case 'KeyD': input.right = down; break;
      case 'Space': case 'ArrowUp': case 'KeyW': if (down) input.jump = true; else input.jump = false; break;
      case 'KeyE': actEdge = down; break;
      case 'KeyT': throwEdge = down; break;
      case 'KeyC': rotateEdge = down; break;
    }
  }
  const onKeyDown = (e: KeyboardEvent): void => { setKey(e.code, true); };
  const onKeyUp = (e: KeyboardEvent): void => { setKey(e.code, false); };
  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);

  if (window.matchMedia('(pointer: coarse)').matches || navigator.maxTouchPoints > 0) {
    touchEl.classList.remove('hidden');
  }
  touchEl.querySelectorAll<HTMLButtonElement>('[data-act]').forEach((btn) => {
    const act = btn.dataset.act!;
    const down = (ev: Event): void => {
      ev.preventDefault();
      press(act, true);
    };
    const up = (): void => press(act, false);
    btn.addEventListener('pointerdown', down);
    btn.addEventListener('pointerup', up);
    btn.addEventListener('pointercancel', up);
    btn.addEventListener('pointerleave', up);
  });

  function press(action: string, down: boolean): void {
    switch (action) {
      case 'left': input.left = down; break;
      case 'right': input.right = down; break;
      case 'jump': if (down) input.jump = true; else input.jump = false; break;
      case 'act': actEdge = down; break;
      case 'throw': throwEdge = down; break;
      case 'rotate': rotateEdge = down; break;
    }
  }

  /* ---------- estado del mundo ---------- */
  const mediciones: number[] = [];
  let inverted = true;
  let isIso = false;
  let measureWorldPos: { x: number; y: number } | null = null;
  let airTimeVisible = 0;
  let running = true;
  let last = performance.now();
  let simT = 0;

  const estadoGotas: { y: number; v: number; t: number }[] = gotas.map(() => ({ y: POOL.top, v: 0, t: 0 }));

  function aceleracionZona(x: number): number {
    const enColumna = x >= CASCADA_X0 && x <= CASCADA_X1;
    return enColumna && inverted ? G : -G;
  }

  function enColumna(x: number, y: number): boolean {
    return x >= CASCADA_X0 && x <= CASCADA_X1 && y >= GROUND_TOP && y <= CASCADA_CIELO;
  }

  function rocaCerca(): boolean {
    return Math.hypot(avatar.x - rock.x, avatar.y - rock.y) < 1.3;
  }

  function nucleoCerca(): boolean {
    return Math.hypot(avatar.x - NUCLEO_X, avatar.y - NUCLEO_Y) < 1.3;
  }

  function empujar(dt: number): void {
    const dir = input.left ? -1 : input.right ? 1 : 0;
    if (dir === 0) return;
    const bzl = boulder.x - BOULDER_W / 2;
    const bzr = boulder.x + BOULDER_W / 2;
    const frente = dir < 0 ? avatar.x - AVATAR_HALF_W : avatar.x + AVATAR_HALF_W;
    const toca = dir < 0 ? Math.abs(frente - bzr) < 0.45 : Math.abs(frente - bzl) < 0.45;
    const pies = avatar.y - AVATAR_H / 2;
    const alPie = pies <= BOULDER_H + 0.05 && avatar.y + AVATAR_H / 2 >= 0;
    if (!toca || !alPie) return;
    const min = GROUND_X0 + BOULDER_W / 2;
    const max = STEP.x0 - BOULDER_W / 2;
    boulder.x = Math.max(min, Math.min(max, boulder.x + dir * PUSH_V * dt));
  }

  /** Colisión lateral: el avatar no atraviesa paredes de sólidos (escalón, plataforma, piedra). */
  function resolverSolidos(): void {
    const solidos: { x0: number; x1: number; alto: number }[] = [
      { x0: STEP.x0, x1: STEP.x1, alto: STEP.top },
      { x0: POOL.x0, x1: POOL.x1, alto: POOL.top },
      { x0: boulder.x - BOULDER_W / 2, x1: boulder.x + BOULDER_W / 2, alto: BOULDER_H },
    ];
    for (const s of solidos) {
      if (avatar.x + AVATAR_HALF_W > s.x0 && avatar.x - AVATAR_HALF_W < s.x1) {
        const pies = avatar.y - AVATAR_H / 2;
        if (pies < s.alto && avatar.y + AVATAR_H / 2 > 0) {
          const distIzq = avatar.x + AVATAR_HALF_W - s.x0;
          const distDer = s.x1 - (avatar.x - AVATAR_HALF_W);
          if (distIzq < distDer) avatar.x = s.x0 - AVATAR_HALF_W;
          else avatar.x = s.x1 + AVATAR_HALF_W;
        }
      }
    }
  }

  function soltarPiedra(vx: number, vy: number): void {
    rock.vx = vx;
    rock.vy = vy;
    rock.inFlight = true;
    rock.restante = false;
    rock.airTime = 0;
  }

  function actuar(): void {
    if (avatar.carrying) {
      soltarPiedra(0, 0);
      avatar.carrying = false;
      return;
    }
    if (rocaCerca() && rock.restante) {
      avatar.carrying = true;
      return;
    }
    if (nucleoCerca() && !restaurado) {
      restaurado = true;
      inverted = false;
      nucleo.material = nucleoReparadoMat;
      bitaBtn.classList.remove('hidden');
      toast('La fuente se reparó. El agua vuelve a caer.');
      return;
    }
  }

  function lanzar(): void {
    if (!avatar.carrying) return;
    soltarPiedra(avatar.facing * LANZAR_VX, LANZAR_VY);
    avatar.carrying = false;
  }

  function actualizarPrompt(): void {
    let msg = '';
    if (avatar.carrying) {
      msg = 'T · lanzar (sigue la línea) — E · soltar';
    } else if (rocaCerca() && rock.restante) {
      msg = 'E · recoger la piedra';
    } else if (nucleoCerca() && !restaurado) {
      msg = 'E · mirar la fuente';
    } else if (!puertaAbierta) {
      msg = 'La piedra grande se empuja caminando contra ella';
    }
    promptEl.textContent = msg;
    promptEl.classList.toggle('hidden', msg === '');
  }

  function update(dt: number): void {
    simT += dt;

    /* avatar */
    if (actEdge) actuar();
    if (throwEdge) lanzar();
    if (rotateEdge) isIso = !isIso;
    actEdge = throwEdge = rotateEdge = false;

    if (avatar.carrying) {
      rock.x = avatar.x + avatar.facing * 0.75;
      rock.y = avatar.y + 0.35;
      rock.inFlight = false;
    }

    empujar(dt);
    const plataformas = [...plataformasFijas, { x0: boulder.x - BOULDER_W / 2, x1: boulder.x + BOULDER_W / 2, top: BOULDER_H }];
    const avatarNuevo = integrarAvatar(avatar, input, dt, plataformas);
    avatar.x = avatarNuevo.x;
    avatar.y = avatarNuevo.y;
    avatar.vy = avatarNuevo.vy;
    avatar.facing = avatarNuevo.facing;
    avatar.onGround = avatarNuevo.onGround;
    resolverSolidos();

    /* piedra en vuelo */
    if (rock.inFlight) {
      rock.airTime += dt;
      const a = aceleracionZona(rock.x);
      rock.vx = rock.inFlight ? rock.vx : 0;
      rock.vy += a * dt;
      rock.x += rock.vx * dt;
      rock.y += rock.vy * dt;
      if (rock.y <= GROUND_TOP + 0.3 && rock.vy <= 0) {
        rock.y = GROUND_TOP + 0.34;
        rock.inFlight = false;
        rock.restante = true;
        const t = rock.airTime;
        mediciones.push(round2(t));
        airTimeVisible = 1;
        measureWorldPos = { x: rock.x, y: rock.y + 1 };
        measureEl.textContent = `t = ${t.toFixed(2)} s`;
        measureEl.classList.remove('hidden');
        compMat.emissiveIntensity = 2.2;
      }
      if (rock.x < -20 || rock.x > 25 || rock.y > 30) {
        rock.inFlight = false;
        rock.restante = true;
        rock.x = -1;
        rock.y = 0.34;
        rock.vx = 0;
        rock.vy = 0;
      }
    }

    /* placa y puerta */
    const rocaEnPlaca = !rock.inFlight && rock.restante && Math.abs(rock.x - PLATE_X) < PLATE_HALF;
    const piedraEnPlaca = Math.abs(boulder.x - PLATE_X) < PLATE_HALF;
    if ((rocaEnPlaca || piedraEnPlaca) && !placaActiva) {
      placaActiva = true;
      placaMesh.material = placaEncendida;
      toast('La placa se hundió. Se abrió un paso.');
    }
    if (placaActiva && !puertaAbierta) {
      puertaAbierta = true;
    }
    if (puertaAbierta) {
      const objetivoY = -0.5;
      if (puertaMesh.position.y > objetivoY) {
        puertaMesh.position.y = Math.max(objetivoY, puertaMesh.position.y - 2.2 * dt);
      }
    }

    /* cascada */
    for (let i = 0; i < gotas.length; i++) {
      const s = estadoGotas[i];
      const siguiente = integrar(s, dt, inverted ? G : -G);
      s.y = siguiente.y;
      s.v = siguiente.v;
      s.t = siguiente.t;
      if (inverted) {
        if (s.y > CASCADA_CIELO) {
          s.y = POOL.top;
          s.v = 0;
        }
      } else if (s.y < POOL.top) {
        s.y = CASCADA_CIELO;
        s.v = 0;
      }
      const g = gotas[i];
      g.m.position.set(CASCADA_X0 + (CASCADA_X1 - CASCADA_X0) * (i / N_GOTAS) + 0.1, s.y, 0);
    }

    /* fauna */
    for (const ave of aves) {
      ave.y += (inverted ? 0.5 : -0.35) * dt;
      if (inverted && ave.y > CASCADA_CIELO + 1) ave.y = 5;
      if (!inverted && ave.y < 1.6) ave.y = 1.6;
      ave.m.position.set(ave.x, ave.y, 0);
    }
    for (const pez of peces) {
      pez.y += (inverted ? 0.4 : -0.25) * dt;
      if (inverted && pez.y > 9) pez.y = 3;
      if (!inverted && pez.y < 1.2) pez.y = 1.2;
      pez.m.position.set(pez.x, pez.y, 0);
    }

    /* acompañante */
    const compObjetivoX = avatar.x;
    const compObjetivoY = avatar.y + 1.2;
    const enZona = enColumna(avatar.x + 1, avatar.y + 1);
    const compY = enZona && inverted ? compObjetivoY + 2 : compObjetivoY;
    companero.position.x += (compObjetivoX - companero.position.x) * Math.min(1, 6 * dt);
    companero.position.y += (compY - companero.position.y) * Math.min(1, 6 * dt);
    if (compMat.emissiveIntensity > 0.8) {
      compMat.emissiveIntensity = Math.max(0.8, compMat.emissiveIntensity - 4 * dt);
    }

    /* mesas y avatares en escena */
    avatarGroup.position.set(avatar.x, avatar.y, 0);
    rocaGrande.position.x = boulder.x;
    rocaChica.position.set(rock.x, rock.y, 0);

    /* preview de trayectoria */
    if (avatar.carrying) {
      const tiro: Tiro = {
        x0: avatar.x + avatar.facing * 0.75,
        y0: avatar.y + 0.35,
        vx: avatar.facing * LANZAR_VX,
        vy: LANZAR_VY,
        a: -G,
      };
      const puntos = muestrearTrayectoria(tiro, 0.08, 3);
      const datos: number[] = [];
      for (const p of puntos) datos.push(p.x, p.y, 0);
      prevGeo.setAttribute('position', new THREE.Float32BufferAttribute(datos, 3));
      prevGeo.computeBoundingSphere();
      preview.visible = true;
    } else {
      preview.visible = false;
    }

    /* medición flotante */
    if (airTimeVisible > 0) {
      airTimeVisible -= dt;
      if (measureWorldPos) {
        const v = new THREE.Vector3(measureWorldPos.x, measureWorldPos.y, 0).project(camera);
        const sx = (v.x * 0.5 + 0.5) * renderer.domElement.clientWidth;
        const sy = (-v.y * 0.5 + 0.5) * renderer.domElement.clientHeight;
        measureEl.style.left = `${sx}px`;
        measureEl.style.top = `${sy}px`;
      }
      if (airTimeVisible <= 0) measureEl.classList.add('hidden');
    }

    /* cámara: plataformero ↔ isométrico (el mundo gira) */
    const k = Math.min(1, 1 - Math.exp(-4 * dt));
    const objetivoIso = isIso;
    const tx = avatar.x;
    if (objetivoIso) {
      camera.position.x += ((tx + 16) - camera.position.x) * k;
      camera.position.y += (20 - camera.position.y) * k;
      camera.position.z += (30 - camera.position.z) * k;
      camera.fov += (42 - camera.fov) * k;
    } else {
      camera.position.x += (tx - camera.position.x) * k;
      camera.position.y += (5 - camera.position.y) * k;
      camera.position.z += (85 - camera.position.z) * k;
      camera.fov += (6 - camera.fov) * k;
    }
    camera.lookAt(tx, 1, 0);
    camera.updateProjectionMatrix();

    actualizarPrompt();
    renderer.render(scene, camera);
  }

  renderer.setAnimationLoop(() => {
    if (!running) return;
    const now = performance.now();
    update(Math.min(0.05, (now - last) / 1000));
    last = now;
  });

  window.addEventListener('resize', () => {
    resize();
    camera.aspect = renderer.domElement.clientWidth / Math.max(1, renderer.domElement.clientHeight);
    camera.updateProjectionMatrix();
  });
  camera.aspect = renderer.domElement.clientWidth / Math.max(1, renderer.domElement.clientHeight);
  camera.updateProjectionMatrix();

  return {
    advanceTime(dtMs) {
      // Paso en chunks de ≤1/30 s: el harness se comporta como frames reales
      // (un salto gigante de un frame haría túnel a través de los sólidos).
      const chunk = 1 / 30;
      let restante = dtMs / 1000;
      while (restante > 1e-9) {
        update(Math.min(chunk, restante));
        restante -= Math.min(chunk, restante);
      }
    },
    snapshot() {
      return {
        runtime: 'platformer-three',
        inverted,
        restaurado,
        placaActiva,
        puertaAbierta,
        avatar: { x: round2(avatar.x), y: round2(avatar.y), carrying: avatar.carrying },
        boulderX: round2(boulder.x),
        gotas: gotas.map((g) => round2(g.m.position.y)),
        mediciones,
        iso: isIso,
        gravedad: G,
      };
    },
    pause() {
      running = false;
    },
    resume() {
      running = true;
      last = performance.now();
    },
    teleport(x, y) {
      avatar.x = x;
      avatar.y = y;
      avatar.vy = 0;
    },
    dispose() {
      renderer.setAnimationLoop(null);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('resize', resize);
      ui.remove();
      renderer.dispose();
      renderer.domElement.remove();
    },
    press,
  };
}
