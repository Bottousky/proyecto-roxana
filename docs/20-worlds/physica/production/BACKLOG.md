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
| A4 | Cruce del explorador sin salto, sin atasco (también volviendo desde la Terraza) | Prueba de ruta + 7 tiempos de reacción + R en el aire + `03-cruce` | hecho (iter 1, tras revisión) |
| A5 | Agua derivada del campo (arco, caídas familiares) | `ballisticPath` y prueba del arco; patrón a la velocidad de la parcela | hecho (iter 1) |
| A6 | Borde descubrible sin color: plomadas, musgo, polen, sonido | `07-plomadas` y `08-musgo-sima` muestran la inversión; el sonido no se escuchó | incompleto (sonido) |
| A7 | 60 FPS en escritorio en la cascada | p95 y p99 ≤ 17 ms en reposo y durante el cruce (M2, headless, 720p) | hecho (iter 1; falta el peor caso con varias trazas activas) |
| A8 | **Anticipar antes de probar** | El experimento seguro (riel de B y campana a la altura de la Terraza) predice el propio cruce (cadena), con el mismo umbral y la misma referencia. Desde el borde se falla sin castigo, con tiza e informe. | hecho (iter 2; falta validar con personas si se entiende sin texto) |
| A9 | **Transferencia**: la misma regla en otra geometría, sin repetir la explicación | El Pozo y el Mirador: ventana de dos límites (cae / llega / corto), predecible con el soporte P | hecho (iter 3; falta validar con personas) |
| A10 | Acabado de roca: detalle de cerca, estratos con relieve legible | Primer plano a 5 m sin manchas borrosas; comparación antes/después | pendiente |
| A11 | Musgo sin quiebres: barbas suaves que cuelgan y se invierten | Primer plano de la sima: hebras continuas, abajo de y = −3,4 cuelgan y arriba suben | hecho (iter 1, `08-musgo-sima`) |
| A12 | Avatar: animaciones de esfuerzo, deslizamiento, sorpresa legibles | Secuencia del cruce con pose distinguible por estado | incompleto (orientación corregida: ahora se le ve la cara; faltan esfuerzo y deslizamiento) |
| A13 | Sonido verificado por una persona | Pedido explícito a un humano | bloqueado (no se puede escuchar) |
| A14 | Táctil y mando probados en dispositivo | Recorrido en un teléfono real y con un mando | bloqueado (sin dispositivo) |
| A15 | Modo móvil ≥ 30 FPS medido en un dispositivo representativo | Tiempos de cuadro reportados con dispositivo y navegador | bloqueado (sin dispositivo) |
| A20 | **Objetivo con dos límites + amortiguación declarada** | El objetivo con dos límites está en el Pozo (iter 3). Falta decidir la amortiguación: hoy la oscilación ideal es eterna, con salidas (cadena en el aire, R, dirección). | parcial |
| A21 | Segunda surgencia que se quede corta, con fuente visible | Dos chorros a distinta profundidad: uno cresta sobre la Terraza y el otro no. La fuente (reja y caño) es visible. | pendiente |
| A22 | Legibilidad del lado de la Orilla | El mástil de plomadas no parece escalera. El aviso de cada soporte apunta a su esfera. La cadena explica por qué no se ofrece con una esfera en la mano. | pendiente |
| A17 | **Modificar**: la energía del campo viene de un aparato que el jugador puede afectar | La caída familiar de la izquierda mueve una rueda visible que alimenta las anclas. Desviar el agua baja `power`, el arco cambia y la región se debilita gradualmente. Las anclas responden a la carga. Prueba: el arco recalculado con `power` < 1 no cruza. | pendiente |
| A18 | Plano de establecimiento que reúna las dos caídas familiares y el arco | Al entrar, una toma que deja ver la composición completa | pendiente |
| A19 | El arco se rompe en la cresta (gotas, sección variable) y salpica con volumen al aterrizar | Secuencia comparable antes/después | pendiente |
| A23 | Assets generados (textura de estratos, telón con la ciudad, retrato) | `art/PROMPTS-IMAGEGEN.md`. Bloqueado: la herramienta integrada de Codex no está en Claude Code; el CLI requiere `OPENAI_API_KEY` y autorización de gasto. Espera la decisión del usuario (vía A o B). | bloqueado |
| A16 | Accesibilidad: movimiento reducido, texto legible, señales redundantes, remapeo | `?reduced` existe y no hay menú; falta un menú de opciones con volumen, movimiento reducido y tamaño de texto | pendiente |

## Hito B — primer episodio (no empezado)

- **B1:** entrada desde el Instituto (Taller de Física, pecera). Requiere decidir la integración con la landing de otra rama, sin modificar Ohmdal.
- **B2:** prueba mínima de la transición 2.5D → 3D: una abertura en la pared del fondo (el arco tapiado de la Terraza) se vuelve transitable y revela un barrio.
- **B3:** familia «Introducción» y **B4:** familia MRU (ver `FAMILIAS.md`).
- **B5:** primer sector jugable de la metrópolis.
