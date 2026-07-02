// Runtime WebGL del hall del Instituto: primer motor real distinto de Phaser.
// Estancia única en el spike; la puerta norte viaja de verdad a Ohmdal vía el shell.
import * as THREE from 'three';
import { movePlayer, nearestInteractable, type Interactable } from './schoolModel.ts';
import { buildSchoolScene, type SchoolScene } from './schoolScene.ts';
import { activateExperience, experienceById } from '../registry.ts';
import { say, L } from '../../ui/dialog.ts';
import { showBitacoraButton } from '../../ui/bitacora.ts';
import type { ExperienceRuntimeModule, RuntimeHandle } from '../types.ts';

const CAMERA_OFFSET = { x: 0, y: 8.5, z: 7.5 };
const CAMERA_LERP = 0.08;
const DT_CLAMP = 0.05;

const PROMPT_TEXT: Record<Interactable['id'], string> = {
  preceptor: 'E — hablar',
  bitacora: 'E — mirar',
  puerta_ohmdal: 'E — viajar a Ohmdal',
};

/** Mismo criterio observable que el resto del juego: diálogo abierto = ignorar input. */
function isDialogOpen(): boolean {
  const dialog = document.getElementById('dialog');
  return dialog !== null && !dialog.classList.contains('hidden');
}

export const schoolRuntime: ExperienceRuntimeModule = {
  runtime: 'school-webgl',
  async mount(hostEl, context) {
    activateExperience(experienceById('instituto'), null);

    const rect = hostEl.getBoundingClientRect();
    const aspect = rect.width / rect.height || 1;
    const built: SchoolScene = buildSchoolScene(aspect);
    const { scene, camera, player, dispose } = built;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(rect.width, rect.height);
    renderer.shadowMap.enabled = false;
    renderer.domElement.style.display = 'block';
    hostEl.appendChild(renderer.domElement);

    const prompt = document.createElement('div');
    prompt.className = 'school-prompt hidden';
    hostEl.appendChild(prompt);

    // ---------- Input ----------
    const pressed = new Set<string>();

    function isMoveKey(code: string): boolean {
      return (
        code === 'ArrowUp' ||
        code === 'ArrowDown' ||
        code === 'ArrowLeft' ||
        code === 'ArrowRight' ||
        code === 'KeyW' ||
        code === 'KeyA' ||
        code === 'KeyS' ||
        code === 'KeyD'
      );
    }

    function readInput(): { x: number; z: number } {
      let x = 0;
      let z = 0;
      if (pressed.has('ArrowLeft') || pressed.has('KeyA')) x -= 1;
      if (pressed.has('ArrowRight') || pressed.has('KeyD')) x += 1;
      if (pressed.has('ArrowUp') || pressed.has('KeyW')) z -= 1;
      if (pressed.has('ArrowDown') || pressed.has('KeyS')) z += 1;
      return { x, z };
    }

    function interact(): void {
      const near = nearestInteractable({ x: player.position.x, z: player.position.z });
      if (!near) return;
      if (near.id === 'preceptor') {
        say([
          L('Preceptor', 'Bienvenido al Instituto. Hace años que estas paredes no escuchan una pregunta.'),
          L('Preceptor', 'Del otro lado de esa puerta está Ohmdal. Cuando estés listo, cruzá.'),
        ]);
      } else if (near.id === 'bitacora') {
        say(
          L(
            '',
            'Sobre el escritorio descansa una bitácora de tapas gastadas. Está abierta, como esperando a alguien.',
          ),
          () => {
            showBitacoraButton();
          },
        );
      } else if (near.id === 'puerta_ohmdal') {
        void context.requestTravel({ experienceId: 'ohmdal', roomId: 'plaza' });
      }
    }

    function onKeyDown(ev: KeyboardEvent): void {
      if (isDialogOpen()) return;
      if (isMoveKey(ev.code)) pressed.add(ev.code);
      if (ev.code === 'KeyE' || ev.keyCode === 69) interact();
    }

    function onKeyUp(ev: KeyboardEvent): void {
      if (isMoveKey(ev.code)) pressed.delete(ev.code);
    }

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    // ---------- Resize ----------
    function onResize(): void {
      const r = hostEl.getBoundingClientRect();
      renderer.setSize(r.width, r.height);
      camera.aspect = r.width / r.height || 1;
      camera.updateProjectionMatrix();
    }
    window.addEventListener('resize', onResize);

    // ---------- Loop ----------
    let rafId: number | null = null;
    let lastTime: number | null = null;
    let running = true;

    function updatePrompt(): void {
      const near = nearestInteractable({ x: player.position.x, z: player.position.z });
      if (!near) {
        prompt.classList.add('hidden');
        return;
      }
      prompt.textContent = PROMPT_TEXT[near.id];
      prompt.classList.remove('hidden');
    }

    function tick(time: number): void {
      if (!running) return;
      if (lastTime === null) lastTime = time;
      const dt = Math.min((time - lastTime) / 1000, DT_CLAMP);
      lastTime = time;

      if (!isDialogOpen()) {
        const input = readInput();
        const next = movePlayer({ x: player.position.x, z: player.position.z }, input, dt);
        player.position.x = next.x;
        player.position.z = next.z;
      }

      const targetX = player.position.x + CAMERA_OFFSET.x;
      const targetY = player.position.y + CAMERA_OFFSET.y;
      const targetZ = player.position.z + CAMERA_OFFSET.z;
      camera.position.x += (targetX - camera.position.x) * CAMERA_LERP;
      camera.position.y += (targetY - camera.position.y) * CAMERA_LERP;
      camera.position.z += (targetZ - camera.position.z) * CAMERA_LERP;
      camera.lookAt(player.position.x, 0.8, player.position.z);

      updatePrompt();

      renderer.render(scene, camera);
      rafId = requestAnimationFrame(tick);
    }
    rafId = requestAnimationFrame(tick);

    const handle: RuntimeHandle = {
      async travelTo() {
        // Estancia única en el spike: no hay a dónde viajar dentro del mismo runtime.
      },
      snapshot() {
        return { runtime: 'school-webgl', data: { x: player.position.x, z: player.position.z } };
      },
      pause() {
        running = false;
        lastTime = null;
        pressed.clear();
        if (rafId !== null) {
          cancelAnimationFrame(rafId);
          rafId = null;
        }
      },
      resume() {
        if (running) return;
        running = true;
        lastTime = null;
        rafId = requestAnimationFrame(tick);
      },
      async destroy() {
        running = false;
        if (rafId !== null) cancelAnimationFrame(rafId);
        window.removeEventListener('keydown', onKeyDown);
        window.removeEventListener('keyup', onKeyUp);
        window.removeEventListener('resize', onResize);
        dispose();
        renderer.dispose();
        renderer.domElement.remove();
        prompt.remove();
      },
    };

    return handle;
  },
};
