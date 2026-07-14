# Piloto de rearte — Terrazas GBA/DS

## Decisión

La primera regeneración controlada debe ser U4 completa: `terraces_top`, `terraces_mid`,
`terraces_mural` y `terraces_aqueduct`. Las imágenes actuales sirven como referencia de
ambiente, paisaje y materiales, pero su cámara panorámica hace que el personaje parezca una
miniatura. Plaza, Forja y los interiores del Faro funcionan como anclas de escala más útiles.

No reemplazar los fondos actuales durante el piloto. Guardar nuevas variantes bajo
`assets/ohmdal/rooms/pilot-arco1/` con sufijo `-rpg-v1` y aprobarlas juntas antes de cambiar
imports o colisiones.

## Entradas por llamada de imagegen

Cada sala se genera en una llamada integrada de imagegen dentro del chat:

1. Imagen 1: `output/art-guides/<room>-layout.png`, referencia obligatoria de composición.
2. Imagen 2: `assets/ohmdal/rooms/plaza.png`, ancla de escala, píxel y legibilidad RPG.
3. Imagen 3: fondo actual de la sala, referencia de ambiente y geografía solamente.

La Imagen 3 no autoriza conservar su cámara distante ni su densidad de detalle.

## Prompt base

```text
Use case: stylized-concept
Asset type: fondo base explorable de sala de Ohmdal
Primary request: regenerar {ROOM} como mapa RPG cenital explorable, no como concept art panorámico
Input images: Imagen 1 = contrato de geometría y salidas; Imagen 2 = ancla de escala y pixel art;
Imagen 3 = referencia de ambiente, paisaje y materiales solamente
Spatial contract: conservar la topología de Imagen 1; gris claro = piso caminable continuo;
rojo oscuro = sólido; azul = arco de salida; reservar los puntos de NPC/interacción
Scale: humano final 64x96 px; puertas, muros, cultivos y mecanismos proporcionados a ese humano
Style: RPG portátil GBA/Nintendo DS, cenital 3/4, formas grandes, contornos legibles,
píxel artístico 480x270 ampliado 2x a 960x540, máximo 256 colores
Density: piso simple y silencioso; detalle en bordes, mecanismo principal y horizonte;
sin textura uniforme sobre cada tile
Electrical state: red de cobre apagada, sin glow, chispas ni luz eléctrica
Constraints: sin personajes, texto, UI, watermark ni props removibles; no cambiar salidas;
no alejar la cámara; no convertir la sala en paisaje visto desde lejos
```

Agregar a cada llamada la hora, luz natural, paisaje y emoción de
`docs/direccion-ambiental-salas-ohmdal-arco1.md`. Tras la generación, normalizar con
`scripts/normalize_chunk.py`, validar con `--style-gate` y probar con el protagonista antes de
generar la sala siguiente.

## Gate artístico

- El protagonista debe leerse sin buscarlo y medir aproximadamente 1/5–1/3 de una puerta.
- En cinco segundos se identifican piso caminable, salida siguiente e interacción principal.
- Al menos 35% del piso jugable usa superficies de bajo contraste.
- El horizonte ocupa contexto, no domina el área jugable.
- Las cuatro salas parecen un mismo distrito al recorrerlas consecutivamente.
