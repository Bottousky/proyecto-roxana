# Spec de producción — Ohm sprite/impostor

- Atlas original SVG de 288×256 px; celda 48×64 px.
- Filas: `N,E,S,W`; columnas: `idle`, `locomotion`, `sensor_deployed`,
  `measurement_valid`, `measurement_blocked`, `uncertain`.
- Pivote por celda: `(24,60)`; altura 1,03 m; collider común: cápsula radio 0,32 m,
  altura 1,03 m.
- Los anclajes lógicos se expresan respecto de la celda: sensor `(0.5,0.43)`, brazo izquierdo
  `(0.27,0.53)`, brazo derecho `(0.73,0.53)`, tapa `(0.5,0.25)`, emisor `(0.5,0.48)`.
- La etiqueta accesible del estado pertenece al harness, no al bitmap, y nunca se omite.
- Máximo del A/B: 512 triángulos, 8 draw calls, un material y textura de lado ≤512 px.
