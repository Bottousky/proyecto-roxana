# Physica — backlog verificable

Cada ítem tiene un criterio de aceptación observable. Estados: `pendiente`, `en curso`,
`hecho (iter N, evidencia)`, `incompleto`. Orden: el mayor impedimento del hito actual
primero.

## Hito A — escena insignia (en curso)

| # | Resultado | Criterio de aceptación | Estado |
|---|---|---|---|
| A1 | Campo regional con banda, superposición y prioridad | Pruebas `field.test.js` | hecho (iter 1) |
| A2 | Integración reproducible e independiente del render | Exacto para *a* constante; 30/60/144 Hz y frecuencia irregular dan la misma historia; sin bombeo de energía | hecho (iter 1) |
| A3 | Soportes A y B con traza cada 0,1 s, carrete y repetición | Recorrido con teclado: la traza B repetida es idéntica | hecho (iter 1) |
| A4 | Cruce del explorador sin salto, sin atasco | Prueba de ruta + `03-cruce` | hecho (iter 1) |
| A5 | Agua derivada del campo (arco, caídas familiares) | `ballisticPath` y prueba del arco; patrón a la velocidad de la parcela | hecho (iter 1) |
| A6 | Borde descubrible sin color: plomadas, musgo, polen, sonido | `07-plomadas` muestra la inversión; falta verificar el musgo (se ve quebrado) y el sonido (no escuchado) | incompleto |
| A7 | 60 FPS en escritorio en la cascada | p95 y p99 ≤ 17 ms en 4 s (M2, headless, 720p) | hecho (iter 1, tras textura de ruido; ver ESTADO) |
| A8 | **Anticipar antes de probar** | El jugador puede comprometer una predicción sin texto: por ejemplo, colocar un receptor o una canasta donde cree que va a llegar la esfera antes de soltarla. El resultado se compara con la predicción en la traza. | pendiente |
| A9 | **Transferencia**: la misma regla en otra geometría, sin repetir la explicación | Segunda configuración en la misma escena (por ejemplo, una región alta con techo, o un saliente donde la esfera llevada por la mano debe llegar a un receptor), resoluble sólo usando la regla | pendiente |
| A10 | Acabado de roca: detalle de cerca, estratos con relieve legible | Primer plano a 5 m sin manchas borrosas; comparación antes/después | pendiente |
| A11 | Musgo sin quiebres: barbas suaves que cuelgan y se invierten | Primer plano de la sima: hebras continuas, abajo de y = −3,4 cuelgan y arriba suben | pendiente |
| A12 | Avatar: animaciones de esfuerzo, deslizamiento, sorpresa legibles | Secuencia del cruce con pose distinguible por estado | incompleto (hay pose de suspensión y sorpresa; falta revisarla en movimiento) |
| A13 | Sonido verificado por una persona | Pedido explícito a un humano | bloqueado (no se puede escuchar) |
| A14 | Táctil y mando probados en dispositivo | Recorrido en un teléfono real y con un mando | bloqueado (sin dispositivo) |
| A15 | Modo móvil ≥ 30 FPS medido en un dispositivo representativo | Tiempos de cuadro reportados con dispositivo y navegador | bloqueado (sin dispositivo) |
| A16 | Accesibilidad: movimiento reducido, texto legible, señales redundantes, remapeo | `?reduced` existe y no hay menú; falta un menú de opciones con volumen, movimiento reducido y tamaño de texto | pendiente |

## Hito B — primer episodio (no empezado)

- **B1:** entrada desde el Instituto (Taller de Física, pecera). Requiere decidir la integración con la landing de otra rama, sin modificar Ohmdal.
- **B2:** prueba mínima de la transición 2.5D → 3D: una abertura en la pared del fondo (el arco tapiado de la Terraza) se vuelve transitable y revela un barrio.
- **B3:** familia «Introducción» y **B4:** familia MRU (ver `FAMILIAS.md`).
- **B5:** primer sector jugable de la metrópolis.
