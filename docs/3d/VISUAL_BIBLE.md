# Biblia visual 3D

## Norte

Proyecto Roxana combina claridad espacial, arquitectura vivida y una materialidad antigua pero cuidada. La referencia sirve para dirección, no para reconstruir una imagen como una malla monolítica.

Cada mundo puede tener cámara y engine propios. La calidad se evalúa en su cámara jugable real y dentro del presupuesto web/mobile correspondiente.

## Jerarquía

1. Composición y cámara.
2. Escala y silueta.
3. Arquitectura modular y rutas legibles.
4. Materiales distinguibles y roughness coherente.
5. Iluminación y contacto.
6. Detalle identitario.
7. Animación ambiental y postproceso moderado.

No usar rótulos para compensar una arquitectura ilegible.

## Instituto

- La experiencia 3D escolar preservada continúa como línea propia; su engine/cámara no obliga a los demás mundos.
- Piedra cálida, madera oscura, cobre envejecido, papel y vidrio polvoriento.
- Luz ambiental baja con focos cálidos motivados.
- Bevels visibles y variación de superficie; evitar cajas planas fuera de blockout.
- Emisivos controlados; bloom sólo donde comunique energía.
- El paso del jugador debe verse en restauraciones y estados, no sólo en UI.

## Ohmdal

- Dirección exploratoria actual: **mundo 3D continuo en primera persona / exploración cercana**, no gramática cenital obligatoria.
- La Plaza debe leerse como un lugar real: Portal, Taller, Puerta Ω y landmarks se reconocen por geometría, escala, luz y sightlines.
- Materialidad principal: piedra pálida erosionada, cobre oxidado, agua detenida, cerámica, madera de taller y vidrio/instrumentación.
- El cobre y la electricidad no justifican neón gratuito: emissive/glow sólo cuando exista una causa física y un estado del sistema.
- La identidad visual surge de infraestructura eléctrica integrada a arquitectura antigua, no de llenar la escena con props tecnológicos genéricos.
- Referencia de producción: [`../20-worlds/ohmdal/production/OHMDAL_3D_PRODUCTION_GUIDE.md`](../20-worlds/ohmdal/production/OHMDAL_3D_PRODUCTION_GUIDE.md).

## Otros mundos

3D no es obligatorio para Bitland, Physica o Arithmos. Materiales compartidos pueden unificar el universo sin imponer la misma cámara, engine o género.

## Biblioteca inicial de materiales

```text
roxana-stone-warm
roxana-stone-pale
roxana-wood-dark
roxana-wood-worn
roxana-copper-aged
roxana-brass-polished
roxana-marble-statue
roxana-paper-bitacora
roxana-glass-dusty
ohmdal-copper-conductor
physica-steel-lab
```

Cada material debe declarar escala UV, uso previsto y variante runtime.

## Gates

- **Blockout:** caja permitida para volumen, navegación y sightlines.
- **Structure:** módulos, espesores, vanos y proporciones correctos.
- **Visual-ready:** cada elemento identitario tiene geometría, material, detalle, asset aprobado o decisión explícita de omisión.
- **Integrated:** captura en cámara real, desktop/mobile, métricas, licencia/procedencia y manifiesto.
