# Iteración 07 — el cuerpo cuenta el estado físico (evidencia)

**Resultado principal:** el explorador elige su pose a partir del estado simulado y la cambia con él. Las poses son:
- de pie, caminar y frenar;
- empujar y cargar;
- la cadena, y el esfuerzo de bajar contra la región;
- trepar y flotar en el agua;
- caer, en el aire y suspendido.

Encima van el sobresalto al entrar a una región y el agachado al aterrizar. Diseño en `../../DECISIONES.md` D13; la revisión y su respuesta, en `REVISION.md`.

**Secuencias:**
- **Cómo se tomaron:** con `scripts/secuencias.mjs`, en la cámara de juego a 1× y con teclado real. La simulación se pausa en cada cuadro, a intervalos fijos de tiempo simulado. Cada cuadro lleva la pose elegida; las etiquetas están en `etiquetas/`.
- **Arreglos de arranque:** los teletransportes sólo preparan el inicio de cada secuencia. Las sesiones de antes y después usan el mismo script.

| Archivo | Qué muestra |
|---|---|
| `antes-*` / `despues-*` | La iteración 06 y la 07, con el mismo script y las mismas teclas. |
| `a-orilla` | Caminar, frenar en seco al invertir la marcha, quedarse quieto. |
| `b-aterrizaje` | Caer 1,6 m: el cuerpo en alarma con la cara hacia la cámara, el agachado y el polvo (sólo `despues`). |
| `c-borde` (`b-borde` en `antes`) | Salir del borde de la Orilla: el sobresalto al entrar a la región, suspendido de frente con los brazos en V, salir por arriba, caer. |
| `d-cadena` (`c-cadena` en `antes`) | Bajar por la cadena contra el empuje, soltarse con las manos abiertas, subir y llegar a la Terraza. |
| `e-esfera-agua` (`d-esfera-agua` en `antes`) | Cargar la esfera con las manos encima, empujarla agachado; flotar en el agua del Pozo, recortado en la superficie. |
| `intermedio-b-borde` | La primera versión: subir se leía como caer de espaldas. |

## Técnico (medido)

- `npm test`: 44/44. La simulación no cambió.
- **Recorrido con teclado** (`report.json`, Apple M2, Chrome headless): todo pasa, 10 notas persisten, 0 errores.
- **Tiempos de cuadro (ms):**

  | Situación | p99 | máx. | pasos perdidos |
  |---|---|---|---|
  | Reposo | 16,8 | 16,8 | 0 |
  | Cruce | 16,8 | 16,8 | 0 |

- **Tiempo por pose** en la corrida de secuencias: todas las poses aparecen (`etiquetas/`).
  - El frenado dura ~0,3–0,4 s por inversión.
  - El agachado del aterrizaje, ~0,27 s.
- **Cadenas de tela:** en node, 720 cuadros de caminatas con giros dejan 0 puntos de una cola delante del cuerpo. Después de un teletransporte se reinician.

## Lo que queda

- **El esfuerzo en la cadena:** a 1× se lee poco; el cuerpo es chico y oscuro contra la roca.
- **Soltarse:** se ve, pero débil.
- **El primer cuadro del empuje:** todavía erguido.
- **El agua del Pozo:** una sola lámina, sin volumen (ya anotado en la iteración 05). Queda una franja oscura bajo su borde.
- **El sonido del cambio de gravedad:** sin verificar, porque nadie lo escuchó.
- **Validación con personas:** falta comprobar que una persona lea estos estados sin ayuda.
