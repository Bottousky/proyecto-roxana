import { Box3, OrthographicCamera, Vector3 } from 'three';
import { frameSchoolBounds, SCHOOL_MOBILE_DIRECTION, SCHOOL_VIEW_DIRECTION } from '../src/landing/school3dFraming.ts';
import { SCHOOL_VIEW_X } from '../src/landing/voxelSchoolModel.ts';

function assert(condition: boolean, message: string): asserts condition { if (!condition) throw new Error(message); }
function close(actual: number, expected: number, message: string, tolerance = 1e-9): void { assert(Math.abs(actual - expected) <= tolerance, `${message}: ${actual} != ${expected}`); }

close(SCHOOL_VIEW_DIRECTION.length(), 1, 'la dirección de vista está normalizada');
close(SCHOOL_VIEW_DIRECTION.x / SCHOOL_VIEW_DIRECTION.z, SCHOOL_VIEW_X, 'la componente lateral coincide con oclusión');
close(SCHOOL_VIEW_DIRECTION.y / SCHOOL_VIEW_DIRECTION.z, 1.2, 'la elevación conserva la vista oblicua acordada');
assert(SCHOOL_VIEW_DIRECTION.x > 0 && SCHOOL_VIEW_DIRECTION.y > 0 && SCHOOL_VIEW_DIRECTION.z > 0, 'la cámara mira la escuela desde el frente y arriba');
close(SCHOOL_MOBILE_DIRECTION.length(), 1, 'la dirección móvil está normalizada');
close(SCHOOL_MOBILE_DIRECTION.x / SCHOOL_MOBILE_DIRECTION.z, 1, 'la cámara móvil conserva ambas alas');
close(SCHOOL_MOBILE_DIRECTION.y / SCHOOL_MOBILE_DIRECTION.z, 1.8, 'la cámara móvil eleva la vista sobre los muebles');

const boxes = [
  { name: 'escuela completa', box: new Box3(new Vector3(-24, -.4, -17), new Vector3(24, 8, 12)) },
  { name: 'aula ancha y baja', box: new Box3(new Vector3(-22, 0, -4), new Vector3(-8, 4.4, 6)) },
  { name: 'pasillo estrecho y profundo', box: new Box3(new Vector3(1, 0, -15), new Vector3(2.2, 4, 18)) },
  { name: 'sala plana muy ancha', box: new Box3(new Vector3(-40, -.1, -1), new Vector3(40, .2, 1)) },
  { name: 'torre alta en eje Y', box: new Box3(new Vector3(-1, -3, -2), new Vector3(1, 40, 2)) },
  { name: 'Dirección elevada y desplazada', box: new Box3(new Vector3(11, 1.14, -18), new Vector3(22, 6.54, -11)) },
  { name: 'panel sin profundidad', box: new Box3(new Vector3(-9, 0, 4), new Vector3(9, 8, 4)) },
];
const viewports = [
  { name: 'desktop ancho', width: 1440, height: 900 },
  { name: 'panel desktop', width: 790, height: 720 },
  { name: 'móvil vertical', width: 390, height: 844 },
  { name: 'móvil horizontal', width: 844, height: 390 },
  { name: 'tablet', width: 820, height: 1180 },
  { name: 'cuadrado', width: 700, height: 700 },
];
let projectedCorners = 0;
for (const direction of [SCHOOL_VIEW_DIRECTION, SCHOOL_MOBILE_DIRECTION]) {
for (const { name, box } of boxes) {
  for (const viewport of viewports) {
    for (const padding of [0, .035, .08, .10, .15]) {
      const viewHeight = 32;
      const viewWidth = viewHeight * viewport.width / viewport.height;
      const sourceMin = box.min.clone(), sourceMax = box.max.clone();
      const result = frameSchoolBounds(box, viewWidth, viewHeight, padding, direction);
      assert(result.zoom > 0 && Number.isFinite(result.zoom), `${name}/${viewport.name}: zoom positivo y finito`);
      assert(box.min.equals(sourceMin) && box.max.equals(sourceMax), 'encuadrar no muta la geometría original');
      assert(result.target.distanceTo(box.getCenter(new Vector3())) < 1e-9, 'la cámara conserva el centro espacial de la sala');
      // Independently verify using the real camera matrices, rather than repeating
      // the dot-product fit implementation or swapping a projected width/height.
      const camera = new OrthographicCamera(-viewWidth / 2, viewWidth / 2, viewHeight / 2, -viewHeight / 2, .1, 1000);
      camera.position.copy(result.target).addScaledVector(direction, 200);
      camera.lookAt(result.target);
      camera.zoom = result.zoom;
      camera.updateProjectionMatrix();
      camera.updateMatrixWorld(true);
      let maxAxis = 0;
      for (const x of [box.min.x, box.max.x]) {
        for (const y of [box.min.y, box.max.y]) {
          for (const z of [box.min.z, box.max.z]) {
            const ndc = new Vector3(x, y, z).project(camera);
            const allowed = 1 - 2 * padding;
            assert(Math.abs(ndc.x) <= allowed + 1e-8, `${name}/${viewport.name}: esquina X recortada con margen ${padding}`);
            assert(Math.abs(ndc.y) <= allowed + 1e-8, `${name}/${viewport.name}: esquina Y recortada con margen ${padding}`);
            assert(ndc.z >= -1 && ndc.z <= 1, `${name}: geometría entre los planos de recorte`);
            maxAxis = Math.max(maxAxis, Math.abs(ndc.x), Math.abs(ndc.y));
            projectedCorners++;
          }
        }
      }
      close(maxAxis, 1 - 2 * padding, `${name}/${viewport.name}: se aprovecha el frustum sin alejar de más`, 1e-8);
    }
  }
}
}

const box = new Box3(new Vector3(-3, -2, -5), new Vector3(5, 4, 7));
const base = frameSchoolBounds(box, 50, 30, .1);
close(base.zoom, frameSchoolBounds(box, 50, 30, .1, SCHOOL_VIEW_DIRECTION).zoom, 'el encuadre por defecto conserva la dirección desktop');
const translation = new Vector3(110, -30, -72);
const moved = frameSchoolBounds(box.clone().translate(translation), 50, 30, .1);
close(moved.zoom, base.zoom, 'trasladar la sala no altera su zoom');
assert(moved.target.distanceTo(base.target.clone().add(translation)) < 1e-9, 'el objetivo acompaña la misma traslación en X/Y/Z');
const scaled = frameSchoolBounds(new Box3(box.min.clone().multiplyScalar(3), box.max.clone().multiplyScalar(3)), 50, 30, .1);
close(scaled.zoom, base.zoom / 3, 'escalar uniformemente invierte el zoom en la misma proporción');
const point = new Vector3(2, 8, -4);
const degenerate = frameSchoolBounds(new Box3(point.clone(), point.clone()), 30, 50);
assert(degenerate.zoom > 0 && Number.isFinite(degenerate.zoom), 'un punto aislado no produce zoom infinito');
assert(degenerate.target.equals(point), 'un punto aislado conserva su posición');
console.log(`School framing geometry: ${projectedCorners} esquinas dentro del frustum, desktop/mobile y ejes X/Y/Z OK`);
