# Biblia de escala

## Convención

- Unidades de Blender y de los runtimes 3D de Roxana: **metros**. PlayCanvas/Three.js deben recibir assets calibrados bajo la misma convención.
- Eje vertical: `+Y` en runtime; cualquier conversión de ejes del DCC se resuelve una vez en export/calibración.
- Frente preferido del asset: `+Z`; cualquier excepción se declara en el manifiesto.
- Origen de personajes y props apoyados: suelo, centro del footprint.
- Persona adulta de referencia: 1,72 m.
- No aplicar escalas correctivas distintas por escena: corregir el master o declarar la excepción.

## Medidas guía

| Elemento | Medida |
|---|---:|
| Persona adulta | 1,72 m |
| Puerta interior | 2,20–2,40 m |
| Baranda | 1,00–1,10 m |
| Escritorio | 0,74–0,78 m |
| Mesada de laboratorio | 0,88–0,95 m |
| Biblioteca | 2,10–2,60 m |
| Estatua sin pedestal | 2,30–2,60 m |
| Pedestal | 0,80–1,10 m |
| Estatua + pedestal | 3,20–3,60 m |
| Contrahuella | 0,16–0,18 m |
| Huella | 0,28–0,32 m |
| Altura visible entre niveles | 3,40–4,20 m |

## Debug requerido para un laboratorio

- maniquí de 1,72 m;
- grilla métrica;
- bounding boxes y colliders;
- pivotes y sockets;
- identificador del asset;
- cámara y coordenadas;
- FPS, draw calls, triángulos, geometrías y texturas.

Para PlayCanvas, usar `inspect-glb` y `calibrate-model` cuando el asset lo requiera; la escala correctiva no debe repetirse a mano en cada instancia.

Estas medidas son guía artística/arquitectónica. La aprobación se hace en cámara real.
