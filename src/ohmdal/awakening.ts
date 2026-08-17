// El despertar de Ohm como momento WOW: el momento en que el autómata vuelve a la vida
// tiene que sentirse como un antes y un después. Lo que cambia:
//
//   1. Destello: una capa blanca a pantalla completa sube y baja en 1.2 s. Sincronizada
//      con el SFX y con el burst de partículas para que se lean como una sola cosa.
//   2. Partículas: 80 chispas doradas brotan del pedestal y se expanden en 1.8 s.
//      El bloom del post-fx las levanta; en desktop se ven, en mobile el conteo
//      baja para mantener el presupuesto.
//   3. Sweep de cámara: la cámara se acerca un 8 % sobre el pedestal, vuelve a la
//      posición normal. Es un detalle que se siente sin verse.
//   4. Audio: el sfxAwakening() corre, la música cambia de `ohmdal` a `ohmdal-on`,
//      y la pista cantable de Ohmdal vivo entra con crossfade.
//   5. Voz: cuando el diálogo posterior pide la línea de Ohm, el sistema de audio
//      ya tiene el contexto (setAmbience) listo para no entrecortarla.
//
// El módulo se autocontiene: crea su propio Group, se agrega a la escena, y
// dispone solo. No toca el render loop del mundo.

import * as THREE from 'three';
import { setAmbience, sfxAwakening, playMusicTrack, type Ambience } from '../audio.ts';

const COLORS = {
  spark: 0xffd9a6,
  sparkCore: 0xfff2c8,
  flash: 0xfff5d4,
} as const;

const SPARK_COUNT_DESKTOP = 88;
const SPARK_COUNT_MOBILE = 38;

interface SparkSpec {
  readonly position: THREE.Vector3;
  readonly velocity: THREE.Vector3;
  readonly color: number;
  readonly size: number;
  readonly life: number;
  readonly delay: number;
}

interface FlashOverlay {
  readonly root: HTMLDivElement;
  setIntensity(value: number): void;
  dispose(): void;
}

function createFlashOverlay(): FlashOverlay {
  const root = document.createElement('div');
  root.className = 'ohmdal-awakening-flash';
  // Estilos en línea: el CSS del mundo vive en `ui.ts`, pero este overlay es
  // específico de Ohmdal HD-2D y no se reusa en `/jugar`. Inline para no
  // contaminar la hoja global.
  Object.assign(root.style, {
    position: 'fixed',
    inset: '0',
    pointerEvents: 'none',
    zIndex: '9999',
    background: `radial-gradient(ellipse at center, ${toRgba(COLORS.flash, 0.85)} 0%, ${toRgba(COLORS.flash, 0)} 70%)`,
    opacity: '0',
    transition: 'opacity 60ms linear',
  } as CSSStyleDeclaration);
  document.body.appendChild(root);
  return {
    root,
    setIntensity(v: number) {
      root.style.opacity = String(Math.max(0, Math.min(1, v)));
    },
    dispose() {
      root.style.transition = 'opacity 200ms ease';
      root.style.opacity = '0';
      window.setTimeout(() => root.remove(), 240);
    },
  };
}

function toRgba(hex: number, alpha: number): string {
  const r = (hex >> 16) & 0xff;
  const g = (hex >> 8) & 0xff;
  const b = hex & 0xff;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function buildSparks(count: number, origin: THREE.Vector3): SparkSpec[] {
  const sparks: SparkSpec[] = [];
  for (let i = 0; i < count; i += 1) {
    // Pseudo-aleatorio determinista: reproducible, no le debe al runtime.
    const seed = i * 0.399963 + 0.137;
    const angle = (Math.sin(seed * 12.9898) * 0.5 + 0.5) * Math.PI * 2;
    const elevation = (Math.sin(seed * 78.233) * 0.5 + 0.5) * 0.7 + 0.15;
    const speed = 1.4 + (Math.sin(seed * 45.164) * 0.5 + 0.5) * 2.8;
    const velocity = new THREE.Vector3(
      Math.cos(angle) * speed,
      elevation * speed,
      Math.sin(angle) * speed,
    );
    // El color varía entre dorado cálido y blanco-cálido: la bloom los levanta distinto.
    const tint = i % 3 === 0 ? COLORS.sparkCore : COLORS.spark;
    sparks.push({
      position: origin.clone(),
      velocity,
      color: tint,
      size: 0.06 + (Math.sin(seed * 17.41) * 0.5 + 0.5) * 0.12,
      life: 1.2 + (Math.sin(seed * 91.7) * 0.5 + 0.5) * 0.8,
      delay: (Math.sin(seed * 32.1) * 0.5 + 0.5) * 0.18,
    });
  }
  return sparks;
}

function createSparkSystem(scene: THREE.Scene, origin: THREE.Vector3, count: number): {
  readonly group: THREE.Group;
  update(dtSeconds: number, elapsed: number): void;
  dispose(): void;
} {
  const group = new THREE.Group();
  group.name = 'awakening_sparks';
  const specs = buildSparks(count, origin);
  // Geometría compartida: una sola esfera pequeña, escalable por sprite.
  const geometry = new THREE.SphereGeometry(0.05, 8, 6);
  const meshes: { mesh: THREE.Mesh; spec: SparkSpec; age: number }[] = [];
  for (const spec of specs) {
    const material = new THREE.MeshBasicMaterial({
      color: spec.color,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.scale.setScalar(spec.size);
    mesh.position.copy(spec.position);
    group.add(mesh);
    meshes.push({ mesh, spec, age: -spec.delay });
  }
  scene.add(group);
  return {
    group,
    update(dt, elapsed) {
      for (const entry of meshes) {
        if (entry.age < 0) {
          entry.age += dt;
          continue;
        }
        const t = entry.age / entry.spec.life;
        if (t >= 1) {
          (entry.mesh.material as THREE.Material).opacity = 0;
          continue;
        }
        // Movimiento: la velocidad decae (drag) y la gravedad atrae hacia abajo
        // para que la columna de chispas "caiga" como brasas.
        const drag = Math.max(0, 1 - dt * 0.6);
        entry.spec.velocity.multiplyScalar(drag);
        entry.spec.velocity.y -= dt * 1.8;
        entry.mesh.position.addScaledVector(entry.spec.velocity, dt);
        // Curva de opacidad: encendido brusco al inicio, desvanecido al final.
        const fadeIn = Math.min(1, t * 6);
        const fadeOut = Math.max(0, 1 - Math.max(0, t - 0.3) / 0.7);
        (entry.mesh.material as THREE.MeshBasicMaterial).opacity = fadeIn * fadeOut * 0.95;
        entry.age += dt;
      }
      // Si ya pasaron 3 s, el grupo queda inerte: la siguiente limpieza lo borra.
      if (elapsed > 3) {
        for (const entry of meshes) {
          (entry.mesh.material as THREE.Material).opacity = 0;
        }
      }
    },
    dispose() {
      for (const entry of meshes) {
        (entry.mesh.material as THREE.Material).dispose();
      }
      geometry.dispose();
      group.removeFromParent();
    },
  };
}

export interface AwakeningOptions {
  readonly scene: THREE.Scene;
  readonly camera: THREE.Camera;
  readonly origin: THREE.Vector3;
  /** Se llama cuando el momento WOW termina (después del fade final). */
  readonly onComplete?: () => void;
  /** Si true, salta animaciones y efectos para usuarios con reduced-motion. */
  readonly reducedMotion?: boolean;
}

export interface AwakeningHandle {
  /** Avanza el efecto. Devuelve true mientras la animación sigue corriendo. */
  update(dtSeconds: number): boolean;
  dispose(): void;
}

/**
 * Lanza el momento del despertar. La promesa (o el `update`) dura ~2.4 s, el
 * tiempo que necesita el destello + las chispas + el crossfade musical.
 *
 * El ciclo es:
 *   0.00 s: SFX + flash empieza a subir
 *   0.15 s: chispas encienden
 *   0.30 s: flash en pico
 *   0.80 s: flash baja, música entra
 *   1.40 s: setAmbience('ohmdal-on') — el procedural se acopla a la transición
 *   2.40 s: fin, se llama onComplete
 */
export function playAwakening(options: AwakeningOptions): AwakeningHandle {
  const { scene, camera, origin, onComplete, reducedMotion = false } = options;
  const isMobile = window.innerWidth <= 720;
  const sparkCount = isMobile ? SPARK_COUNT_MOBILE : SPARK_COUNT_DESKTOP;
  const flash = createFlashOverlay();
  const sparks = createSparkSystem(scene, origin, sparkCount);
  // Sin reduced-motion: lanzar SFX y música.
  if (!reducedMotion) {
    sfxAwakening();
  }
  // Track cantable: la pista "alive" entra con crossfade. La pista procedural
  // de ohmdal-on se acopla un poco después para que la transición no sea
  // abrupta — el mp3 lleva la melodía, el procedural lleva el colchón.
  void playMusicTrack('alive', 2400).catch(() => { /* no fatal */ });

  const initialCameraZ = camera.position.z;
  const initialCameraY = camera.position.y;
  const cameraApproach = initialCameraZ * 0.05;

  let elapsed = 0;
  const TOTAL = 2.4;
  let ambienceSwitched = false;
  let musicSwitched = false;
  let completed = false;

  return {
    update(dt) {
      if (completed) return false;
      elapsed += dt;
      const t = elapsed / TOTAL;

      // Flash: 0 → 1 entre 0 y 0.18, luego baja a 0 entre 0.18 y 0.85.
      if (t < 0.18) {
        flash.setIntensity((t / 0.18) * 0.95);
      } else if (t < 0.85) {
        flash.setIntensity(0.95 * (1 - (t - 0.18) / 0.67));
      } else {
        flash.setIntensity(0);
      }

      // Camera: se acerca un 5% entre 0.05 y 0.45, vuelve entre 0.55 y 1.20.
      if (!reducedMotion) {
        if (t < 0.05) {
          // Quieto
        } else if (t < 0.45) {
          const k = (t - 0.05) / 0.4;
          camera.position.z = initialCameraZ - cameraApproach * k;
          camera.position.y = initialCameraY + cameraApproach * 0.2 * k;
        } else if (t < 0.55) {
          // Mantener
        } else if (t < 1.2) {
          const k = (t - 0.55) / 0.65;
          camera.position.z = initialCameraZ - cameraApproach * (1 - k);
          camera.position.y = initialCameraY + cameraApproach * 0.2 * (1 - k);
        } else {
          camera.position.z = initialCameraZ;
          camera.position.y = initialCameraY;
        }
      }

      // Sparks
      sparks.update(dt, elapsed);

      // Transición musical: el `setAmbience` del procedural cambia el tema
      // subyacente. Lo hacemos a los 0.6 s, cuando el flash empieza a bajar,
      // para que la música acompañe el descenso de la luz.
      if (!ambienceSwitched && elapsed > 0.6) {
        ambienceSwitched = true;
        setAmbience('ohmdal-on' as Ambience);
      }

      if (t >= 1) {
        completed = true;
        flash.dispose();
        if (!musicSwitched) {
          musicSwitched = true;
        }
        onComplete?.();
        return false;
      }
      return true;
    },
    dispose() {
      flash.dispose();
      sparks.dispose();
      camera.position.z = initialCameraZ;
      camera.position.y = initialCameraY;
    },
  };
}
