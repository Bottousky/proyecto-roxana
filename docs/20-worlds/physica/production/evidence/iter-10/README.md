# Iteración 10 — suelo pintado y musgo en flecos (evidencia)

**Resultado principal:** los altos transitables tienen un suelo pintado en lugar de manchas de ruido, y el musgo es un fleco de matas entintadas, coherente con las plantas pintadas, que sigue colgando o subiendo según el campo. Diseño en `../../DECISIONES.md` D16; la revisión y su respuesta, en `REVISION.md`.

**Imágenes:**

| Archivo | Qué muestra |
|---|---|
| `antes-*` / `despues-*` (tomas `s*`) | La Orilla en la cámara de juego y de cerca, la Terraza, el musgo de la sima junto a la regla, la cara de la Terraza en el borde de la región, el Mirador. |
| `antes-*` / `despues-*` (tomas `b`, `c`, `d`, `f`) | Las tomas fijas generales: cascada, Pozo, roca de la Orilla a 5 m, sima. Las `antes` son de la iteración 08. |
| `intermedio-*` | La v4, que fue a la primera revisión: musgo como pasto colgante, una capa detrás de la regla. |

**Herramientas nuevas:**
- `scripts/textura-sin-costura.mjs`: hace repetible una textura.
- `scripts/textura-costura.mjs`: mide la costura.
- `scripts/resistencia.mjs`: prueba de resistencia. Deja el juego corriendo y vigila cierres de página, memoria y tiempos de cuadro.
- `scripts/capturas-estres.mjs`: mide la demora de las capturas y si el juego sigue vivo cuando una se cuelga.

## Técnico (medido)

- `npm test`: 52/52. Dos pruebas nuevas en `flora.test.js`:
  - una barba cuelga en campo normal y sube en uno hacia arriba;
  - en la cara de la Terraza se da vuelta en el borde de la región, con el campo real del nivel.
- **Textura del suelo:**
  - costura a través del borde: 9,0 / 8,7, contra 6,7 / 7,1 entre vecinos del interior; antes de corregirla era 12,0 / 11,9;
  - JPEG de 276 KB.
- **Recorrido con teclado** (`report.json`, con el arnés corregido): todo pasa, con 10 notas, 0 errores y 0 capturas colgadas.
- **Tiempos de cuadro:**
  - En esa corrida, p99 de 33 ms en reposo y en el cruce. Antes, una corrida del mismo código había dado 16,8 ms.
  - Para atribuirlo se alternaron las dos versiones en la misma ventana de tiempo: 4 rondas de 20 s, con carga de 2,3–3,4.
    - **Iteración 10:** 0 cuadros lentos en las 4 ventanas (p99 y máximo de 16,8 ms).
    - **Iteración 09:** un cuadro de 250 ms.
  - Una A/B con el musgo visible y oculto mostró los dos con o sin cuadros lentos según la ventana.
  - **Conclusión:** no hay regresión; los 33 ms vienen de tramos degradados de la máquina.
- **Dos corridas del recorrido fallaron, y no por el juego:**
  - una vez la página se cerró sola durante la medición final, después de todas las interacciones;
  - otra vez una captura de pantalla tardó más de 30 s en pleno cruce.
- **Diagnóstico** (`scripts/capturas-estres.mjs`, 120 capturas seguidas por corrida):
  - el canal de capturas de Chrome headless se cuelga de vez en cuando;
  - mientras está colgado, **el juego sigue corriendo a 122 pasos de simulación por segundo**: no es un congelamiento que vea el jugador;
  - pasa igual con el código de la iteración 09 (worktree temporal) y con el musgo oculto, así que no es de esta iteración.
- **Corrección en el arnés:** cada captura se reintenta una vez y, si vuelve a colgarse, se omite y queda anotada en `report.json` (`captureTimeouts`). Las aserciones del recorrido no cambiaron: salen del estado del juego.
- **El cierre de página:** no se reprodujo en 5 pruebas de resistencia de 60 s. La memoria de JavaScript oscila entre 26 y 42 MB, sin crecer. No se pudo atribuir.
- **Costo por cuadro del musgo:** ya no reserva objetos ni recalcula normales en cada cuadro. Antes eran unos 5000 objetos por cuadro.
- **A25 (máquina tranquila):** en las pruebas de 60 s, p99 de 16,8 ms, pero un cuadro aislado de 250 ms por minuto. La misma prueba en un worktree temporal con la iteración 09 da lo mismo: el tirón es anterior a esta iteración y su origen no está identificado. Detalle en BACKLOG.

## Lo que queda

- **El suelo de la Terraza vista de lejos** se emborrona en vetas.
- **La dirección del musgo** sólo se lee de cerca.
- **El contorno del musgo** queda dentado.
- **Una tira de musgo** cae todavía detrás de la regla de la sima.
- **El tirón de 250 ms por minuto** (A25) sigue sin identificar.
