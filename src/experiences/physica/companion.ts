// INSTRUMENTO: el acompañante esférico fijo.
//
// Núcleo esférico con lente central, anillo giroscópico, aguja direccional
// y extremidades retráctiles (GDD §9). Mide e interpreta; el reloj
// revela, registra y ejecuta. Conoce procedimientos pero no conserva
// la teoría completa. Personalidad: precisa, seria, tierna y ligeramente
// ansiosa ante lo que no puede medir.
//
// VIVE desde la Escena 3. Sus frases son fragmentos del guion (NUNCA inventados).
import * as BABYLON from 'babylonjs';

export type InstrumentoPhase = 'waiting' | 'following' | 'speaking' | 'pointing';

export interface InstrumentoConfig {
  scene: BABYLON.Scene;
  hostEl: HTMLElement;
}

export class Instrumento {
  public mesh: BABYLON.TransformNode;
  public root: BABYLON.TransformNode;
  public fase: InstrumentoPhase = 'following';
  public x: number = 0;
  public y: number = 0;
  public targetX: number = 0;
  public targetY: number = 0;
  private núcleoMat: BABYLON.StandardMaterial;
  private anillo: BABYLON.Mesh;
  private aguja: BABYLON.Mesh;
  private emisiónNúcleo: BABYLON.ParticleSystem;
  private fragmentoActual: HTMLElement | null = null;
  private hostEl: HTMLElement;

  constructor(config: InstrumentoConfig) {
    this.hostEl = config.hostEl;
    this.root = new BABYLON.TransformNode('instrumento-root', config.scene);
    this.mesh = new BABYLON.TransformNode('instrumento', config.scene);
    this.mesh.parent = this.root;

    /* ---------- núcleo esférico ---------- */
    this.núcleoMat = new BABYLON.StandardMaterial('instrumento-nucleo', config.scene);
    this.núcleoMat.diffuseColor = new BABYLON.Color3(0.48, 0.95, 0.82);
    this.núcleoMat.emissiveColor = new BABYLON.Color3(0.26, 0.72, 0.58);
    this.núcleoMat.specularColor = new BABYLON.Color3(0.6, 1, 0.95);
    const nucleo = BABYLON.MeshBuilder.CreateSphere('nucleo', { diameter: 0.7, segments: 16 }, config.scene);
    nucleo.material = this.núcleoMat;
    nucleo.parent = this.mesh;

    /* ---------- lente central ---------- */
    const lenteMat = new BABYLON.StandardMaterial('instrumento-lente', config.scene);
    lenteMat.diffuseColor = new BABYLON.Color3(0.6, 0.98, 0.92);
    lenteMat.alpha = 0.55;
    lenteMat.emissiveColor = new BABYLON.Color3(0.5, 0.9, 0.85);
    const lente = BABYLON.MeshBuilder.CreateSphere('lente', { diameter: 0.32, segments: 12 }, config.scene);
    lente.material = lenteMat;
    lente.parent = this.mesh;

    /* ---------- anillo giroscópico ---------- */
    const anilloMat = new BABYLON.StandardMaterial('instrumento-anillo', config.scene);
    anilloMat.diffuseColor = new BABYLON.Color3(0.7, 0.95, 0.88);
    anilloMat.emissiveColor = new BABYLON.Color3(0.38, 0.7, 0.62);
    anilloMat.alpha = 0.82;
    this.anillo = BABYLON.MeshBuilder.CreateTorus('anillo', { diameter: 0.88, thickness: 0.1, tessellation: 48 }, config.scene);
    this.anillo.material = anilloMat;
    this.anillo.parent = this.mesh;

    /* ---------- aguja direccional ---------- */
    const agujaMat = new BABYLON.StandardMaterial('instrumento-aguja', config.scene);
    agujaMat.diffuseColor = new BABYLON.Color3(0.95, 1, 0.85);
    agujaMat.emissiveColor = new BABYLON.Color3(0.8, 0.95, 0.6);
    this.aguja = BABYLON.MeshBuilder.CreateBox('aguja', { width: 0.05, height: 0.7, depth: 0.03 }, config.scene);
    this.aguja.material = agujaMat;
    this.aguja.parent = this.mesh;
    this.aguja.position.y = 0.35;

    /* ---------- emisión de partículas (respiración) ---------- */
    const ps = new BABYLON.ParticleSystem('instrumento-respiro', 200, config.scene);
    const texCanvas = document.createElement('canvas');
    texCanvas.width = 32;
    texCanvas.height = 32;
    const tg = texCanvas.getContext('2d')!;
    const grad = tg.createRadialGradient(16, 16, 2, 16, 16, 16);
    grad.addColorStop(0, 'rgba(140,245,220,1)');
    grad.addColorStop(0.5, 'rgba(100,220,190,0.6)');
    grad.addColorStop(1, 'rgba(80,190,160,0)');
    tg.fillStyle = grad;
    tg.fillRect(0, 0, 32, 32);
    ps.particleTexture = new BABYLON.Texture(texCanvas.toDataURL(), config.scene);
    ps.emitter = nucleo;
    ps.minEmitPower = 0.3;
    ps.maxEmitPower = 0.8;
    ps.color1 = new BABYLON.Color4(0.3, 0.8, 0.65, 0);
    ps.color2 = new BABYLON.Color4(0.2, 0.6, 0.5, 0);
    ps.colorDead = new BABYLON.Color4(0.1, 0.3, 0.3, 0);
    ps.minLifeTime = 0.8;
    ps.maxLifeTime = 1.8;
    ps.minSize = 0.04;
    ps.maxSize = 0.09;
    ps.emitRate = 30;
    ps.blendMode = BABYLON.ParticleSystem.BLENDMODE_ADD;
    ps.updateSpeed = 0.02;
    ps.start();
    this.emisiónNúcleo = ps;

    this.mesh.position.y = 0.7;
    this.x = 0;
    this.y = 0;
  }

  /** Frases canónicas del INSTRUMENTO — NUNCA inventar texto. */
  static readonly frases: Record<string, string[]> = {
    escena3_activacion: [
      'Medición… activa. Desplazamiento… ninguno.',
      'Ningún avance. Dos direcciones. Ningún avance.',
    ],
    escena3_desequilibrio: [
      'Dos acciones. Una suma sin dirección. Quietud… con actividad.',
    ],
    escena4_referencia: [
      'La medición no cambió. Cambió desde dónde la contamos.',
    ],
    escena5_error: [
      'Más intensidad… mismo error lateral.',
    ],
    escena5_acierto: [
      'No era lanzar más. Era lanzar hacia otro lugar para llegar al mismo lugar.',
    ],
    escena6_angulo: [
      'Misma altura. Otra dirección. Más recorrido.',
    ],
    escena7_reconoce: [
      'Reconozco el acople. No reconozco la instrucción.',
    ],
    escena7_consecuencia: [
      'La estación respondió. También cambió algo que no medimos.',
      'No falló. Obedeció demasiadas instrucciones.',
    ],
    escena8_revelacion: [
      'La estación del valle era una entrada. Allí… hay demasiadas referencias.',
      'Y una señal que todavía reconoce el reloj.',
    ],
    escena9_retorno: [
      'Este lugar también era parte de la medición.',
    ],
  };

  /** Emite un fragmento del guion canónico (nunca inventa texto). */
  speak(clave: keyof typeof Instrumento.frases): void {
    const frases = Instrumento.frases[clave];
    if (!frases) return;
    const texto = frases[0];

    if (this.fragmentoActual) this.fragmentoActual.remove();

    const toast = document.createElement('div');
    toast.className = 'px-instrumento-toast';
    toast.setAttribute('role', 'status');
    toast.textContent = texto;
    toast.style.cssText = `
      position: absolute;
      bottom: 6rem;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(13, 24, 36, 0.92);
      border: 1px solid #62d4c0;
      border-radius: 12px;
      padding: 0.6rem 1.2rem;
      font-size: 0.9rem;
      color: #cfeaff;
      max-width: min(90vw, 26rem);
      text-align: center;
      box-shadow: 0 0.5rem 1.5rem rgba(0,0,0,0.3);
      backdrop-filter: blur(4px);
      z-index: 30;
      line-height: 1.5;
    `;
    this.hostEl.appendChild(toast);
    this.fragmentoActual = toast;

    setTimeout(() => {
      (toast.style as any).opacity = '1';
      (toast.style as any).transition = 'opacity 0.3s';
      setTimeout(() => {
        (toast.style as any).opacity = '0';
        setTimeout(() => toast.remove(), 400);
        this.fragmentoActual = null;
      }, 3200);
    }, 10);
  }

  /** Apunta la aguja hacia un objetivo (x, y) en coordenadas del mundo. */
  apuntar(targetWorldX: number, targetWorldY: number): void {
    const dx = targetWorldX - this.x;
    const dy = targetWorldY - this.y;
    const angle = Math.atan2(dy, dx) - Math.PI / 2;
    this.aguja.rotation.z = angle;
  }

  /** Gira el anillo giroscópico lentamente. */
  update(dt: number): void {
    this.anillo.rotation.y += dt * 0.6;
    this.anillo.rotation.z += dt * 0.15;

    /* suavizado de movimiento hacia el objetivo */
    const k = Math.min(1, 1 - Math.exp(-8 * dt));
    this.x += (this.targetX - this.x) * k;
    this.y += (this.targetY - this.y) * k;
    this.root.position.set(this.x, this.y + 0.3, 0);

    /* animación de respiración de la esfera */
    const pulso = 1 + Math.sin(performance.now() * 0.002) * 0.03;
    this.mesh.scaling.setAll(pulso);
  }

  /** Seguir al avatar con offset. */
  seguir(avatarX: number, avatarY: number, offset = -1.2): void {
    this.targetX = avatarX + offset;
    this.targetY = avatarY + 0.4;
  }

  /** Parpadear con urgencia (ansiedad ante lo inobservable). */
  parpadear(veces = 3): void {
    const intensidadOriginal = this.núcleoMat.emissiveColor;
    let count = 0;
    const intervalo = setInterval(() => {
      this.núcleoMat.emissiveColor = count % 2 === 0
        ? intensidadOriginal.scale(2.2)
        : intensidadOriginal;
      count++;
      if (count >= veces * 2) clearInterval(intervalo);
    }, 120);
  }

  dispose(): void {
    this.mesh.dispose();
    this.root.dispose();
    this.emisiónNúcleo.dispose();
    this.fragmentoActual?.remove();
  }
}
