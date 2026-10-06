# Mapa de progresión del campus

Cuatro capas separadas (brief §7):

1. **Progreso real** — sólo de los guardados de cada mundo, leídos sin escribirlos.
2. **Disponibilidad editorial** — `WORLDS[].available` en `src/escuela/progress.js` y `public/escuela/novedades.json`.
3. **Preferencias y visita** — `roxana.escuela.v1` (nombre, emblema, salas vistas, `stageSeen`, `newsSeen`, ajustes).
4. **Ambiente decorativo** — hora del día, deriva de cámara, rutinas de artefactos. Nunca se presenta como logro.

## Ohmdal (integrado: `ohmdal.playcanvas.arc1.v1`, mismo origen que la home)

| Hito real (flag) | Transformación visible | Interacción nueva | Evidencia |
|---|---|---|---|
| `awaken` | farol a los pies de Roxana, ventana del Taller, Ohm en el patio | — | `tests/escuela.test.js` (etapas) · capturas `?etapa=1` |
| `workshop` | lámparas del Taller de Electrónica, humo de chimenea | — | idem |
| `gate` | se abre el portón, cae la cadena | — | idem |
| `pump` | la fuente vuelve a correr | — | idem |
| `distribution` | faroles del patio rama por rama; luciérnagas de noche | — | idem |
| `irrigation` | canteros florecen, césped más verde | — | idem |
| `beacon_link` | estandartes de Ohmdal en la Dirección | — | idem |
| `beacon_network` | la campana de la torre se mueve | — | idem |
| `beacon_lens` | linterna de la torre; **lámpara del Faro en miniatura** (ciclo 2); haz sólo de noche | tocar el Faro en miniatura: encendido gira su haz; sin `beacon_lens` intenta dos veces y dice que la lente sigue apagada (ciclo 3) | `evidence/c02/faro-1440.jpg`, `evidence/c03/ohmdal-respuesta.jpg`, `ohmdal-apagado.jpg` (fixtures 10 y 3) |
| `epilogue_shared` | vecinos de Ohmdal visitan el patio | — | idem |

Trofeos y cinemáticas del Anfiteatro también derivan de estos flags. Las capturas con `?etapa=` o `SEED=` son
**fixtures**: verifican el render de un estado, no la integración con una partida real.

## Physica, Bitland, Arithmos (contrato pendiente)

Sus mundos viven en otras ramas y, en desarrollo, en otros orígenes: la home **no puede** leer sus guardados hoy.
Claves reales identificadas (sólo lectura, para el adaptador):

- Arithmos `roxana.arithmos.v1` → `{version:1, completed:[ids de segmento], flags, …}`
- Bitland `bitland.partida.v1` → `{version:1, sim, flags, …}` (validado con `conservation(sim)`)
- Physica `physica.v2` → `{notes:[{id,…}], flags, footing}`

Hasta integrarlos, sus artefactos muestran sólo su **condición propia** (agua que sube, bucle de una instrucción,
punto de tiza), que es ambiente y no recompensa. `drawChip(t, awake)` ya acepta un `awake` 0..1 que vendrá del
progreso real de Bitland; hoy es 0. No se inventan hitos para estos mundos.

## Pendiente

- Adaptador `world-progress.js` con lectores defensivos por mundo y tabla hito → transformación para cada uno,
  cuando se confirme dónde y bajo qué origen se publican.

## Regresar (ciclo 3)

Al volver con restauraciones nuevas el campus aparece **ya transformado**; una tarjeta lateral no bloqueante
lista lo que volvió («Cambió por tu aventura») y ofrece «Ver qué cambió» (recorrido corto, saltable con Escape).
`stageSeen` avanza en cuanto la tarjeta se muestra: recargar no repite la celebración. «Continuar en Ohmdal»
queda como acción dominante de la portada. Verificado con fixture en `scripts/home-interact.mjs`.
