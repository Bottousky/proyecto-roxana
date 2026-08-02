# Contrato visual — Ohmdal HD-2D preproducción v1

**Estado:** aprobado para blockout y comparativas; no autoriza arte final

## Intención

Alcanzar la coherencia compositiva y el pulido perceptual asociados a **DRAGON QUEST III HD-2D
REMAKE** en una escala menor y con identidad propia. La referencia define cualidades —diorama,
profundidad, contraste 2D/3D, atmósfera y cámara—; no autoriza copiar mapas, personajes, UI,
música, capturas, texturas ni composiciones.

Fuente oficial de observación:
`https://dragonquest.square-enix-games.com/games/es-xl/dragon-quest-3-hd2d-remake/`.

## Estado determinista de captura

- Seed: `ohmdal-hd2d-preprod-v1`.
- Hora: tarde, con una captura secundaria de crepúsculo para contraste.
- Recorrido: Portal → Plaza → acceso Taller → Puerta → Manantial.
- Desktop: 1440×900, DPR máximo 2.
- Mobile: 390×844, DPR máximo 1,5.
- Maniquí: 1,72 m, origen en suelo.
- Estado del mecanismo: apagado; una segunda captura puede mostrar restauración.

## Cámara y composición

- Perspectiva suave o casi ortográfica; el A/B elige una mediante las mismas escenas.
- Dos o tres encuadres autorales conectados por volúmenes, sin órbita libre.
- Personaje, objetivo y consecuencia deben coexistir en el encuadre del mecanismo.
- Un landmark dominante por set: Portal, silueta del Taller y Puerta/Manantial.
- Foreground y techos usan fade/ocultamiento sin saltos de exposición.
- La UI táctil no cubre pies, conectores ni puntos de medición.

## Escala y módulos

- Unidades en metros y pivote de arquitectura en el suelo.
- Puertas, escalones, barandas y mesas se comparan con el maniquí de 1,72 m.
- Arquitectura, mecanismos y terreno se componen por módulos con sockets explícitos.
- Colliders primitivos separados de la geometría visible.
- Plaza, Taller y Puerta nunca se entregan como una malla única.

## Materialidad y luz del blockout

- Familias: piedra húmeda, cobre envejecido, madera de taller, agua y vidrio técnico.
- Paleta tarde: piedra cálida y sombras frías; crepúsculo introduce cian eléctrico limitado.
- Una luz principal con sombra; rellenos y emisión sin sombras salvo evidencia contraria.
- Bloom selectivo, fog y AO sólo después de aprobar composición y con comparación de coste.
- El estado eléctrico se diferencia por forma, animación, etiqueta y sonido; nunca sólo por color.

## A/B de sprites 4/8

- Mismo personaje provisional original, escala, pivote de pies, recorrido y cámara.
- Acciones: caminar diagonal, giro de 135°, detenerse ante Lumen, rodear foreground y acercarse a
  un punto de medición.
- Fallos: snap visible, moonwalk/deslizamiento, pérdida de intención o atlas desproporcionado.
- Se elige cuatro si pasa todos los encuadres obligatorios; si falla uno, se adopta ocho.
- Los sprites del A/B son originales y mínimos; no se extraen frames de la referencia.

## A/B de Ohm

- Variante A: sprite/impostor direccional.
- Variante B: hard-surface procedural con pivotes y estados equivalentes.
- Misma pantalla, altura, acciones, tiempo máximo y presupuesto visible.
- Decisión por integración espacial, actuación, editabilidad, draw calls y memoria.
- Una variante se descarta o archiva al cerrar el hito.

## Gates

| Criterio | Gate |
|---|---:|
| Composición y cámara | 4/5 |
| Escala humana | 4/5 |
| Silueta arquitectónica | 4/5 |
| Legibilidad de interacción | 4/5 |
| Integración sprite/suelo/sombra | 4/5 |
| Materiales e iluminación de blockout | 3/5 |
| Rendimiento mobile medido | 3/5 |
| Rendimiento desktop medido | 4/5 |
| Estabilidad y disposal | 4/5 |

Un gate obligatorio fallido no se compensa con promedio. La evidencia incluye referencia por
cualidad, captura actual, comparación lado a lado, consola y métricas reproducibles.
