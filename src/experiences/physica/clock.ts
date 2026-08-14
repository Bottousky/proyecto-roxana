// Reloj-dispositivo: instrumento analógico con agujas, anillos, escalas y piezas móviles.
//
// NO funciona como un menú de trucos (GDD §8). Progresión:
//   - Revela observaciones (ya en Escena 2).
//   - Selector de sistema de referencia (Escena 4).
//   - Lectura de vectores (Escena 5).
//   - Registro de trayectorias (Escena 6).
//   - Intervención local autorizada (Escena 7).
//
// VIVE desde la Escena 3, se acopla al INSTRUMENTO en la Escena 7.
import * as BABYLON from 'babylonjs';

export type ClockMode = 'standby' | 'vector' | 'reference' | 'trajectory' | 'intervention';

export class RelojDispositivo {
  public mesh: BABYLON.TransformNode;
  public mode: ClockMode = 'standby';
  public visible: boolean = false;
  public ringAngle: number = 0;
  public needleAngle: number = 0;
  public innerRingAngle: number = 0;

  private anilloExterior: BABYLON.Mesh;
  private anilloInterior: BABYLON.Mesh;
  private agujaPrincipal: BABYLON.InstancedMesh;
  private esferaCentral: BABYLON.Mesh;
  private marcas: BABYLON.Mesh[] = [];
  private partículas: BABYLON.ParticleSystem;
  private matte: BABYLON.StandardMaterial;

  constructor(scene: BABYLON.Scene) {
    /* materiales */
    this.matte = new BABYLON.StandardMaterial('reloj-matte', scene);
    this.matte.diffuseColor = new BABYLON.Color3(0.78, 0.84, 0.52);
    this.matte.emissiveColor = new BABYLON.Color3(0.38, 0.42, 0.26);

    this.mesh = new BABYLON.TransformNode('reloj', scene);

    /* esfera central */
    const esferaMat = new BABYLON.StandardMaterial('reloj-esfera', scene);
    esferaMat.diffuseColor = new BABYLON.Color3(0.88, 0.88, 0.58);
    esferaMat.emissiveColor = new BABYLON.Color3(0.58, 0.58, 0.38);
    this.esferaCentral = BABYLON.MeshBuilder.CreateSphere('esfera-central', { diameter: 0.5, segments: 10 }, scene);
    this.esferaCentral.material = esferaMat;
    this.esferaCentral.parent = this.mesh;

    /* anillos concéntricos */
    this.anilloExterior = BABYLON.MeshBuilder.CreateTorus('anillo-ext', { diameter: 1.2, thickness: 0.14, tessellation: 48 }, scene);
    this.anilloExterior.material = this.matte;
    this.anilloExterior.parent = this.mesh;

    this.anilloInterior = BABYLON.MeshBuilder.CreateTorus('anillo-int', { diameter: 0.78, thickness: 0.1, tessellation: 36 }, scene);
    this.anilloInterior.material = this.matte;
    this.anilloInterior.parent = this.mesh;
    this.anilloInterior.position.z = 0.05;

    /* aguja principal */
    const agujaGeo = BABYLON.MeshBuilder.CreateBox('aguja', { width: 0.06, height: 0.55, depth: 0.03 }, scene);
    const brillo = new BABYLON.StandardMaterial('reloj-brillo', scene);
    brillo.diffuseColor = new BABYLON.Color3(0.88, 0.96, 0.68);
    brillo.emissiveColor = new BABYLON.Color3(0.68, 0.72, 0.38);
    brillo.alpha = 0.9;
    const agujaMat = new BABYLON.StandardMaterial('aguja-mat', scene);
    agujaMat.diffuseColor = new BABYLON.Color3(0.88, 0.86, 0.42);
    agujaMat.emissiveColor = new BABYLON.Color3(0.68, 0.66, 0.34);
    this.agujaPrincipal = new BABYLON.InstancedMesh('aguja-inst', agujaGeo);
    this.agujaPrincipal.material = agujaMat;
    this.agujaPrincipal.parent = this.mesh;
    this.agujaPrincipal.position.y = 0.275;

    /* marcas alrededor del anillo exterior */
    const marcaMat = new BABYLON.StandardMaterial('marca', scene);
    marcaMat.emissiveColor = new BABYLON.Color3(0.92, 0.92, 0.62);
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      const marca = BABYLON.MeshBuilder.CreateBox('marca', { width: 0.04, height: 0.22, depth: 0.04 }, scene);
      marca.material = marcaMat;
      marca.parent = this.anilloExterior;
      marca.position.x = Math.cos(a) * 0.6;
      marca.position.y = Math.sin(a) * 0.6;
      marca.rotation.z = a + Math.PI / 2;
      this.marcas.push(marca);
    }

    /* emisión de partículas sutil */
    const ps = new BABYLON.ParticleSystem('reloj-particulas', 300, scene);
    const texCanvas = document.createElement('canvas');
    texCanvas.width = 32;
    texCanvas.height = 32;
    const tg = texCanvas.getContext('2d')!;
    const grad = tg.createRadialGradient(16, 16, 2, 16, 16, 16);
    grad.addColorStop(0, 'rgba(230,240,150,1)');
    grad.addColorStop(0.5, 'rgba(210,220,120,0.6)');
    grad.addColorStop(1, 'rgba(180,190,100,0)');
    tg.fillStyle = grad;
    tg.fillRect(0, 0, 32, 32);
    ps.particleTexture = new BABYLON.Texture(texCanvas.toDataURL(), scene);
    ps.emitter = this.esferaCentral;
    ps.minEmitPower = 0.2;
    ps.maxEmitPower = 0.6;
    ps.color1 = new BABYLON.Color4(0.8, 0.85, 0.4, 0.6);
    ps.color2 = new BABYLON.Color4(0.7, 0.75, 0.3, 0.3);
    ps.colorDead = new BABYLON.Color4(0.5, 0.55, 0.2, 0);
    ps.minLifeTime = 0.8;
    ps.maxLifeTime = 1.6;
    ps.minSize = 0.03;
    ps.maxSize = 0.07;
    ps.emitRate = 20;
    ps.blendMode = BABYLON.ParticleSystem.BLENDMODE_ADD;
    ps.updateSpeed = 0.02;
    ps.minEmitBox = new BABYLON.Vector3(-0.25, -0.25, -0.25);
    ps.maxEmitBox = new BABYLON.Vector3(0.25, 0.25, 0.25);
    ps.stop();
    this.partículas = ps;

    this.esconder();
  }

  mostrar(): void {
    this.visible = true;
    this.mesh.setEnabled(true);
    this.partículas.start();
  }

  esconder(): void {
    this.visible = false;
    this.mode = 'standby';
    this.mesh.setEnabled(false);
    this.partículas.stop();
  }

  setModoVector(): void {
    this.mode = 'vector';
    this.matte.emissiveColor = new BABYLON.Color3(0.58, 0.62, 0.26);
  }

  setModoReferencia(): void {
    this.mode = 'reference';
    this.matte.emissiveColor = new BABYLON.Color3(0.52, 0.44, 0.28);
  }

  setModoTrayectoria(): void {
    this.mode = 'trajectory';
    this.matte.emissiveColor = new BABYLON.Color3(0.56, 0.46, 0.24);
  }

  setModoIntervencion(): void {
    this.mode = 'intervention';
    this.matte.emissiveColor = new BABYLON.Color3(0.32, 0.52, 0.38);
  }

  /** Visualizar un vector: la aguja señala la dirección + magnitud. */
  visualizarVector(vx: number, vy: number): void {
    const angle = Math.atan2(vy, vx) - Math.PI / 2;
    const mag = Math.sqrt(vx * vx + vy * vy);
    this.needleAngle = angle;
    this.agujaPrincipal.rotation.z = angle;
    this.agujaPrincipal.scaling.y = 0.4 + Math.min(1, mag / 20) * 0.6;
  }

  /** Visualizar la flecha de la corriente transversal. */
  visualizarCorriente(speed: number): void {
    this.ringAngle = (speed / 15) * Math.PI;
  }

  update(dt: number): void {
    if (!this.visible) return;
    this.anilloExterior.rotation.y += dt * 0.3;
    this.anilloInterior.rotation.y -= dt * 0.5;
    this.needleAngle += dt * 0.15;
    this.agujaPrincipal.rotation.z = this.needleAngle + Math.sin(this.needleAngle) * 0.02;
  }

  dispose(): void {
    this.mesh.dispose();
    this.partículas.dispose();
  }
}
