# Iteración 09 — la Orilla se lee (evidencia)

**Resultado principal (A22):** los instrumentos de la Orilla no se confunden y cada aviso aparece donde está lo que nombra. Diseño en `../../DECISIONES.md` D15; la revisión y su respuesta, en `REVISION.md`.

- **El mástil de plomadas:**
  - ya no es una escalera: ménsulas inclinadas a alturas irregulares;
  - las plomadas apuntan arriba debajo del borde de la región y cuelgan encima;
  - ninguna en la banda de transición;
  - un collar marca los 3 m.
- **Los soportes:** el aviso va junto a la esfera que suelta, con un anillo; el brazo y la pinza del soporte activo se encienden.
- **La cadena con las manos ocupadas:** una causa, con otro estilo.
- **La interacción más cercana gana:** junto al poste del soporte P, E ya no agarra la cadena del Pozo. El defecto era anterior a esta iteración y salió en el recorrido.

**Capturas:** cámara de juego, teclado real, con `scripts/orilla.mjs`. El aviso de cada toma, con su texto y su posición, está en `etiquetas/`.

| Archivo | Qué muestra |
|---|---|
| `antes-*` / `despues-*` | `1` junto al soporte A, `2` junto al soporte B, `3` el mástil de cerca, `4` en el labio con una esfera en la mano, `5` la misma posición después de soltarla. |
| `intermedio-*` | La primera versión, que fue a revisión. |
| `intermedio2-2-soporte-B` | La segunda: el aviso de B sobre el rótulo «2». |

## Técnico (medido)

- `npm test`: 50/50. Tres pruebas nuevas:
  - el aviso de cada soporte junto a su esfera, y el de recoger, en el poste;
  - la razón de la cadena con las manos ocupadas;
  - la interacción más cercana gana junto a P.
- **Recorrido con teclado** (`report.json`, carga 8–12): todo pasa, con P sonando desde 2 m y cayendo al agua desde 1 m, los tres resultados del Pozo, los escalones, 10 notas y 0 errores.
- **Tiempos de cuadro:** p99 y máximo de 16,8 ms en reposo y en el cruce, sin pasos perdidos.

## Lo que queda

- **El collar del borde en el mástil** se lee débil: está pegado al brazo de B, que cruza a 2,92 m.
- **El pulso del anillo y del brazo encendido:** sólo se juzgó en cuadros fijos.
- **Sin verificar con personas:** que alguien asocie cada soporte con su esfera.
- **Del plan:** el suelo pintado y el musgo quedan para la iteración siguiente.
