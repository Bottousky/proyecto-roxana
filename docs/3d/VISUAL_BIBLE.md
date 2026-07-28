# Biblia visual 3D

## Norte

Proyecto Roxana combina claridad de diorama interactivo, arquitectura escolar vivida y una
materialidad antigua pero cuidada. La referencia sirve para dirección, no para reconstruir una
imagen como una malla monolítica.

El trabajo actual de `school-voxel` es un indicio fuerte del lenguaje definitivo, pero continúa
siendo prototipo de producción: requiere aprobación por cámara, materiales, rendimiento mobile
y continuidad con el juego.

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

- Diorama/isométrico con lectura clara de salas.
- Piedra cálida, madera oscura, cobre envejecido, papel y vidrio polvoriento.
- Luz ambiental baja con focos cálidos motivados.
- Bevels visibles y variación de superficie; evitar cajas planas fuera de blockout.
- Emisivos controlados; bloom sólo donde comunique energía.
- El paso del jugador debe verse en restauraciones y estados, no sólo en UI.

## Ohmdal y otros mundos

- Ohmdal conserva su gramática cenital, piedra/cobre/cerámica y arte procedural existente.
- 3D no es obligatorio para Bitland, Physica o Arithmos.
- Los materiales compartidos pueden unificar el universo sin imponer la misma cámara.

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

- Blockout: caja permitida para volumen y navegación.
- Structure: módulos, espesores, vanos y proporciones correctos.
- Visual-ready: cada elemento identitario tiene geometría, material, detalle procedural,
  asset aprobado o decisión explícita de omisión.
- Integrated: captura en cámara real, desktop/mobile, métricas y manifiesto.
