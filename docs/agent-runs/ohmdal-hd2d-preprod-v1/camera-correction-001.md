# CAM-FIX-001 — Resize y seguimiento autoral

**Autorización humana:** 2026-08-02  
**Tipo:** corrección post-H2; no abre H3  
**Estado:** implementada; pendiente de revisión visual humana
**Referencia:** DRAGON QUEST III HD-2D REMAKE como barra de coherencia, sin copiar IP

## Resultado esperado

El harness conserva proporciones al redimensionar y deja de perseguir cada paso del jugador. La
cámara mantiene el encuadre mientras el personaje permanece dentro de una zona muerta y sólo se
desplaza lo mínimo al salir; los cambios C1/C2/C3 siguen ocurriendo por umbrales con histéresis.

## Contrato técnico

- El canvas usa el tamaño real disponible en cada `resize`.
- La cámara ortográfica conserva su `verticalSpan`; `left/right` se recalculan con el aspect ratio
  real. Un viewport más angosto recorta horizontalmente y uno más ancho revela más: nunca estira.
- La cámara perspectiva actualiza su `aspect` real, aunque no sea la variante promovida.
- El perfil desktop/mobile continúa decidiendo composición, span y DPR. Cruzar el breakpoint puede
  reconstruir la cámara; redimensionar dentro del mismo perfil no debe hacerlo.
- El seguimiento usa una zona muerta explícita y testeable. `setAnchor` conserva sus transiciones y
  `reducedMotion` elimina viajes animados.
- No modificar navegación, escenas, assets, contenido pedagógico ni `src/jugar/**`.

## Ownership

- Claude/Arquitectura: `src/labs/ohmdal-hd2d-preprod/camera/**` y
  `tests/ohmdal-hd2d-architecture-camera.test.ts`.
- Director: `src/labs/ohmdal-hd2d-preprod/main.ts`, integración, documentación y commit final.

## Evidencia y cierre

1. Tests unitarios prueban aspect real para cámara ortográfica/perspectiva y estabilidad dentro de
   la zona muerta.
2. `npm run build`, `npm test`, `npm run 3d:validate-manifests` y `git diff --check` pasan.
3. Se capturan desktop 1440×900, desktop angosto y mobile 390×844 sin errores de consola.
4. El usuario revisa manualmente el movimiento y decide aprobar o pedir un único ajuste.
5. No se abre una tercera ronda del Evaluador y H3 permanece bloqueado.

## Resultado observado

- Claude/Arquitectura implementó y testeó la API en `e8faf3e`; el Director la integró como
  `ade81bf` y conectó el harness en `0e39d06`.
- 1440×900, 900×900 y 390×844 conservan proporciones. El viewport angosto recorta laterales y el
  ancho revela más mundo, sin cambiar el alto autoral.
- El seguimiento deja quieto el objetivo dentro de la zona muerta y sólo corrige el excedente.
- Chrome/Playwright: 0 errores y 0 warnings. Build, suite completa, manifests y diff check pasan.
- El servidor local queda disponible para que el usuario apruebe la sensación de cámara. Hasta esa
  decisión, el estado no se promueve a `completed`.
