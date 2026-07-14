# Terrazas RPG v1 — registro de generación

Generado en el chat de Codex mediante la herramienta integrada Imagegen. No se utilizó API,
CLI ni un proveedor externo. Cada sala recibió como referencias su guía de geometría y escala,
la plaza de Ohmdal y la versión anterior de la misma sala.

## Contrato compartido

- Vista cenital 3/4 de RPG explorable GBA/Nintendo DS, no ilustración panorámica.
- Geometría y salidas idénticas a la guía; recorrido principal legible antes que el paisaje.
- Escala humana fija entre salas, compatible con sprites de 28–36 px en el master 480×270.
- Formas agrupadas, bordes nítidos, textura selectiva y pocos focos de contraste.
- Paleta terrosa de Ohmdal con verde petróleo y agua turquesa apagada.
- Sin personajes, texto, interfaz, glow mágico ni decoración que cierre el recorrido.
- Entrega visual a 480×270, ampliada exactamente 2× a 960×540, sin suavizado.

## Variantes por sala

### `terraces_top_base-rpg-v1.png`

Canal alto vertical como eje, compuerta cuadrada central, arco norte y salida sur. Parcelas
escalonadas laterales simplificadas y una sola lectura dominante: llegar y ajustar la compuerta.

### `terraces_mid_base-rpg-v1.png`

Ruta vertical central, terraza alta encharcada a un lado y terraza baja reseca al otro. El
contraste de estados del agua prevalece sobre la ornamentación.

### `terraces_mural_base-rpg-v1.png`

Plaza de lectura con gran mural norte, acceso oeste y salida sur. El muro muestra una red,
el signo de equivalencia y una piedra como tres formas del mismo concepto.

### `terraces_aqueduct_base-rpg-v1.png`

Dos canales elevados paralelos, entrada norte, salida este hacia el Faro y lago visible. La
altura de los niveles y el recorrido entre ellos deben distinguirse sin depender de etiquetas.

## Postproceso reproducible

Los originales se conservan en `_sources/`. Las versiones runtime se normalizaron con
`scripts/normalize_chunk.py`: reducción a 480×270, paleta máxima de 256 colores y ampliación
nearest-neighbor 2× a 960×540.
