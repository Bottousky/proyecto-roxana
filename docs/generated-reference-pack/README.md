# Pack de referencias generado

Generado con la herramienta integrada de imágenes usando la referencia original o una
derivación aprobada como input. No son assets runtime: fijan composición, materiales,
estados y geometría para reconstrucción.

| Archivo | Uso |
|---|---|
| `hall-clean.png` | art lock del hall |
| `electronics-baseline.png` | aula activa parcial |
| `electronics-locked.png` | aula dormida |
| `electronics-stage-1.png` | Arco 1 completo |
| `portal-multiview.png` | reconstrucción del portal |
| `robot-multiview.png` | reconstrucción y pivotes del robot |
| `workbench-multiview.png` | reconstrucción modular del banco |
| `materials-board.png` | acabados compartidos |
| `electronics-decals.png` | atlas RGBA de circuitos y pizarrón |
| `electronics-decals-source.png` | fuente previa a limpieza de alfa |

El atlas fue solicitado sobre croma plano; el generador produjo un fondo negro uniforme.
Se eliminó localmente con `remove_chroma_key.py`. Validación: RGBA 1254×1254, alpha
0–255, 1.476.651 píxeles transparentes y 95.865 píxeles con contenido.

Los prompts completos siguen la dirección de la biblia: diorama 3D estilizado, piedra,
nogal, cobre, verde profundo, emisiones verdes/violetas restringidas, sin texto
pseudo-legible y con vistas idénticas entre paneles.
