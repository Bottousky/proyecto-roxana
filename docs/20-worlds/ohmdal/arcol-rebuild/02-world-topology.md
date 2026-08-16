# Ohmdal Arco I — Topología del mundo (rebuild)

> Documento de trabajo. Es la geografía jugable de Cuenca de Ohm. NO es
> canon (la biblia de mundo sigue siendo `docs/ohmdal-biblia/04_WORLD_BIBLE.md`).
> Es la traducción de esa biblia a una topología concreta, continua y
> espacialmente coherente para el rebuild.

## 1. Principio

**Un solo mapa continuo, sin pantallas, sin transiciones de sala.** El
jugador camina del Portal al Manantial sin que el motor cambie de escena.
Los "ámbitos" (Portal, Camino, Plaza, Taller, Puerta, Manantial) son
**regiones dentro del mismo mapa**, marcadas por cambios en el tilemap,
los props y la música, no por un corte de cámara.

## 2. Dimensiones

- **Mapa jugable**: 96 × 80 tiles = 96 m × 80 m de mundo.
- **Tile**: 1 m × 1 m.
- **Viewport lógico**: 24 × 14 tiles (≈24 m de ancho visible).
- **Tamaño del tileset en memoria**: ≤256 tiles únicos.

## 3. Plano geográfico (visto desde arriba, N arriba)

```
       y=0                                                  y=15
        ┌──────────────────────────────────────────────────┐
        │                 ZONA MANANTIAL                   │
        │  (estanque irregular, cables entran por el N)    │  y=0..15
        │             ┌──manantial_estanque──┐             │
        │             │     (agua + rocas)    │             │
        │             └────────┬─────────────┘             │
        │            calzada empedrada (N→S)              │
        ├──────────────────────┬───────────────────────────┤
        │                      │                           │
        │    ZONA PUERTA       │    ladera E               │  y=15..30
        │    (arco monumental  │    (vegetación,           │
        │     frente a plaza)  │     escalera)             │
        │     ┌────────┐      │                           │
        │     │ PUERTA │      │                           │
        │     │  OHM   │      │                           │
        │     │  (Ω)   │      │                           │
        │     └───┬────┘      │                           │
        │         │ plaza_alta│                           │
        ├─────────┼───────────┼───────────────────────────┤
        │         │           │     ZONA TALLER           │
        │         │           │     (edificio 1 planta,   │
        │  PLAZA  │           │      fachada E de la      │  y=30..55
        │  central│           │      plaza, puerta        │
        │  ┌──────┴────┐      │      hacia el W)          │
        │  │ fuente    │      │      ┌────────┐           │
        │  │ central   │      │      │TALLER  │           │
        │  └───────────┘      │      │LUMEN   │           │
        │  (piedra+cobre+     │      └────────┘           │
        │   campana apagada)  │                           │
        ├─────────────────────┴───────────────────────────┤
        │       ZONA CAMINO (S de la plaza)               │
        │  empedrado con trazas de cobre, dos             │  y=55..68
        │  filas de columnas de piedra                    │
        │        POSTE PORTAL (en el S, marca             │
        │        la entrada, doseles de cobre              │
        │        apagados)                                 │
        ├────────────────────────────────────────────────┤
        │       ZONA SENDERO (S, exterior)                 │
        │  pasto seco, muros bajos, alguna                │  y=68..80
        │  roca. (Sugiere que Ohmdal continúa)            │
        │                                                  │
        └──────────────────────────────────────────────────┘
       x=0                                                x=96
```

### Coordenadas clave (origen arriba-izquierda, x al E, y al S)

| Ámbito | Centro (x, y) en tiles | Tamaño aproximado |
|---|---|---|
| Portal / Entrada | (48, 62) | 4×4 m, monolito |
| Camino (entre Portal y Plaza) | (48, 50-60) | 6×10 m |
| Plaza central | (40-56, 32-44) | 16×12 m |
| Fuente central | (48, 38) | radio 2 m |
| Plaza-alta (entre Plaza y Puerta) | (40-56, 28-32) | 16×4 m |
| Puerta de Ohm | (40-56, 18-28) | 16×10 m, edificio |
| Calzada (entre Puerta y Manantial) | (40-56, 8-18) | 6×10 m |
| Manantial | (32-64, 0-12) | 32×12 m, estanque |
| Taller (edificio) | (60-80, 36-50) | 20×14 m, edificio |
| Ladera E | (60-96, 16-32) | sugerido, sin juego |
| Sendero S | (0-96, 68-80) | sugerido, sin juego |

## 4. Conexiones (sin transiciones)

Todas las conexiones son **a pie**, sobre el mismo tilemap. El jugador
camina del Portal al Manantial sin que el motor cambie nada. Solo cambia
la música y el parallax.

| Desde | Hasta | Camino | Distancia a pie |
|---|---|---|---|
| Portal | Plaza | Camino empedrado, columnas | ~25 m |
| Plaza | Puerta | Plaza-alta, escalones | ~10 m |
| Plaza | Taller | Travesía E, fachada | ~12 m |
| Puerta | Manantial | Calzada empedrada | ~14 m |
| Portal | Sendero S | Cruzar monolito, seguir S | ~6 m |

## 5. Sistema eléctrico (un grafo único)

El mundo tiene **un único grafo eléctrico**. Los nodos son piezas
físicas que el jugador ve. Los cables son tiles de cobre sobre el suelo
o en la pared. Cuando un nodo se energiza, su luz se enciende y los
cables que salen de él pulsan.

### Nodos (en el mapa)

| ID | Tipo | Posición | Estado inicial | Función |
|---|---|---|---|---|
| `src_portal` | Fuente DC | (48, 62) | Apagado | El Portal. Único generador inicial. |
| `node_plaza_1` | Lámpara | (38, 36) | Apagado | Lámpara de Plaza (NO) |
| `node_plaza_2` | Lámpara | (58, 36) | Apagado | Lámpara de Plaza (NE) |
| `node_plaza_3` | Lámpara | (38, 44) | Apagado | Lámpara de Plaza (SO) |
| `node_plaza_4` | Lámpara | (58, 44) | Apagado | Lámpara de Plaza (SE) |
| `node_fountain` | Bomba | (48, 38) | Apagado | Bomba de la fuente central |
| `node_ohm` | Autómata | (48, 22) | Apagado (dormido) | Ohm, sobre su pedestal |
| `node_taller_light` | Lámpara | (70, 40) | Apagado | Lámpara del Taller |
| `node_taller_bench` | Banco | (66, 42) | Apagado | Banco de Lumen |
| `node_puerta_l` | Lámpara | (40, 22) | Apagado | Lámpara izq de la Puerta |
| `node_puerta_r` | Lámpara | (56, 22) | Apagado | Lámpara der de la Puerta |
| `node_manantial_gate` | Compuerta | (48, 12) | Cerrado | Compuerta del Manantial |
| `node_manantial_light` | Lámpara | (40, 8) | Apagado | Lámpara del Manantial (NO) |
| `node_manantial_light_2` | Lámpara | (56, 8) | Apagado | Lámpara del Manantial (NE) |

### Cables (grafos que se activan progresivamente)

| Cable | Ruta | Estado inicial |
|---|---|---|
| `c_main_south` | `src_portal` → (48, 50) → (48, 38) `node_fountain` | Apagado (roto) |
| `c_plaza_loop` | `node_fountain` → (38, 36) → (38, 44) → (58, 44) → (58, 36) → `node_fountain` | Apagado |
| `c_plaza_to_puerta` | `node_fountain` → (48, 30) → (48, 24) → `node_puerta_l` / `node_puerta_r` | Apagado |
| `c_puerta_to_ohm` | (48, 24) → (48, 22) `node_ohm` | Apagado (roto en el medio) |
| `c_puerta_to_manantial` | (48, 24) → (48, 12) `node_manantial_gate` | Apagado |
| `c_taller_branch` | (48, 38) → (60, 38) → (66, 40) → `node_taller_bench` | Apagado (Lumen tiene que reconectarlo) |

Los cables aparecen como **tiles de cobre en el suelo** (capa 2 del
tilemap). Cuando un cable está roto, un tile muestra cobre con
pátina/agujero. Cuando está completo, está limpio. Cuando está
energizado, emite un pulso visual que recorre el cable.

## 6. Puzzles (modelos puros)

Tres puzzles, todos jugables en el mapa continuo, todos con modelo
puro testeable en `src/ohmdal-arco1/puzzles/`:

### P1 — Continuidad (Despertar de Ohm)

- **Familia**: P1 (continuidad) + P4 (topología) mínima.
- **Capa eléctrica**: 0.
- **Ubicación**: Portal → Plaza → Puerta.
- **Acción**: el jugador debe reparar `c_main_south` (un cable con un
  punto abierto) y `c_puerta_to_ohm` (otro cable roto) para que la
  energía llegue a Ohm.
- **Predicción**: el jugador debe predecir qué indicador va a cambiar
  antes de cerrar el circuito (la cara de Ohm se ilumina, o la fuente
  pulsa).
- **Soluciones válidas**: ≥2 (cualquiera de los 2 cables se puede
  reparar primero, y hay 2 puntos donde se puede puentear).

### P2 — Diagnóstico (Taller de Lumen)

- **Familia**: P2 (diagnóstico) + P5 (dimensionamiento).
- **Capa eléctrica**: 1 (magnitudes).
- **Ubicación**: Taller.
- **Acción**: el banco de Lumen está apagado. El jugador debe medir
  tensión y continuidad en 3 puntos del banco, identificar qué módulo
  está fallado (hay 2 posibles, ambos plausibles), sustituirlo, y
  verificar.
- **Predicción**: predecir el valor de la tensión en el nodo de salida
  antes de energizar.
- **Soluciones válidas**: ≥2 (2 módulos son aceptables como
  reemplazo, con ligeras diferencias de coste o de voltaje).

### P3 — Topología (Puerta de Ohm → Manantial)

- **Familia**: P3 (distribución) + P11 (optimización).
- **Capa eléctrica**: 1-2.
- **Ubicación**: Puerta de Ohm (compuerta grande).
- **Acción**: la compuerta del Manantial está sellada. El jugador
  debe decidir qué subsistema priorizar: ¿abrir el flujo hacia el
  Manantial (regando arriba, dejando la Plaza con menos presión), o
  reparar primero la Plaza (dejando el Manantial esperando)?
- **Predicción**: predecir qué lámpara se encenderá primero.
- **Soluciones válidas**: ≥2 (la distribución es legítima en ambos
  órdenes, con trade-offs explícitos).

## 7. NPC y rutas

- **Edda**: aparece en la Plaza (x=42, y=36) cuando el jugador llega.
  Se mueve entre Plaza y Camino según flags. Después de P1, va al
  Taller y luego sale al Sendero S.
- **Lumen**: está en el Taller (x=70, y=42) al inicio. Se mueve
  dentro del Taller.
- **Ohm**: está en su pedestal (x=48, y=22). Inerte. Después de P1,
  despierta y sigue al jugador.
- **Habitantes de fondo**: 3 NPCs (Anciano, Aprendiz, Regadora) que
  circulan por Plaza, Camino y Sendero con paths fijos.

## 8. Estados del mundo

| Estado | Cuándo se activa | Lectura observable |
|---|---|---|
| `dormant` | Inicio del juego | Sin luz, cables apagados, Ohm inerte, agua detenida, música de viento/agua quieta |
| `awakening` | Después de reparar `c_main_south` | La fuente de la Plaza empieza a gotear, el cobre del cable principal pulsa |
| `powered_basic` | Después de P1 (Ohm despierto) | Plaza con luz, fuente fluye, Lámparas NE/NO encendidas, música de Ohmdal vivo |
| `powered_full` | Después de P3 (Manantial abierto) | Todo el mapa energizado, agua en todas las fuentes, compuerta abierta, créditos del mundo |

El jugador puede **persistir** su save entre estados. El save guarda
qué puzzles están resueltos y qué nodos están energizados.

## 9. Cámara

- Sigue al jugador con damping suave (lerp).
- Límites: no se sale del mapa.
- No hay rotación libre. El mapa está orientado N-arriba.
- En el Manantial, la cámara se eleva un poco (zoom out 10%) para
  mostrar el estanque completo cuando el jugador entra.
- En la Plaza, zoom normal.
- En el Sendero S, zoom in 10% (más cerca del jugador) para crear
  sensación de aislamiento.

## 10. Transición de entrada (Portal)

El jugador entra por el Portal en (48, 62). La cámara entra con un
pan de S a N, de 3 segundos, mostrando:

1. El monolito del Portal (con el Ω apagado).
2. El Camino empedrado.
3. Las columnas de piedra.
4. La Plaza y la fuente detenida.
5. Al fondo, la silueta de la Puerta de Ohm.

Cuando el pan termina, el control pasa al jugador. No hay cutscene.
La música entra gradualmente.

## 11. Lo que NO está en este mapa

- **Castillo de la Red**: existe al NO (más allá del muro del
  Sendero S-Oeste), pero no es jugable en Arco I. Se ve su silueta
  recortada en el horizonte.
- **Forja y Terrazas**: existen al E (más allá de la ladera E), no
  jugables. Se ve humo tenue.
- **Faro y Lago**: existen al S (más allá del Sendero S), no jugable.
  Se ve un punto de luz tenue en el horizonte.
- **Instituto**: el Portal mismo. La transición al Instituto es
  mediante un menú "Volver al Instituto" desde la Bitácora, no
  caminando.
