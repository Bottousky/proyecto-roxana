# Iteración 08 — vegetación con identidad (evidencia)

**Resultado principal:** el pasto de conos verdes se reemplazó por plantas pintadas en tarjetas instanciadas, en un solo llamado de dibujo más su sombra:
- matas, pasto alto, juncos, flores coral y azafrán, suculentas y almohadones de musgo;
- helechos que salen de la cara de la Terraza y siguen el campo local: cuelgan arriba del borde de la región y se enroscan hacia arriba adentro.

La imagen se generó para el proyecto (`../../../art/PROCEDENCIA.md`). Diseño en `../../DECISIONES.md` D14; la revisión y su respuesta, en `REVISION.md`.

**Imágenes** (mismas tomas fijas que en las iteraciones anteriores, `scripts/shots.mjs`):

| Archivo | Qué muestra |
|---|---|
| `antes-*` / `despues-*` | Inicio, cascada, Pozo y sima en la cámara de juego. |
| `intermedio-b-cascada`, `intermedio-f-sima` | La primera versión, que fue a revisión: helechos detrás de los rótulos de la regla y delante del agua. |
| `despues-v1-orilla-cerca` … `despues-v6-juego-orilla` | Tomas de la vegetación: la Orilla de cerca, la cara de la Terraza alrededor del borde de la región, el Pozo, la Terraza y la cámara de juego. |
| `helecho-arriba`, `helecho-adentro` | La misma cara, a y ≈ 3,95 (arriba de la región, cuelgan) y a y ≈ 2,2 (adentro, se enroscan hacia arriba). Tomadas con la separación más densa de la v5. |

## Técnico (medido)

- **`npm test`: 47/47.** Tres pruebas nuevas en `vegetation.test.js`:
  - el helecho cuelga afuera, sube adentro y queda derecho sin campo;
  - el doblez se satura;
  - en la cara de la Terraza el giro ocurre en el borde de la región, con el campo real del nivel.
- **Ángulos medidos en el navegador:** +1,3 rad adentro de la región, −1,5 rad arriba de ella.
- **Textura:** 1024×683 con alfa, 826 KB. Bordes descontaminados con `scripts/hoja-limpiar.mjs`; alfa verificada con `scripts/hoja-alfa.mjs`.
- **Recorrido con teclado** (`report.json`): todo pasa, persisten 10 notas, 0 errores.
- **Arnés del recorrido:** en una corrida con carga 13, el intento «demasiado arriba» del Pozo se soltó a 2,27 m en vez de 2,5 y llegó al Mirador.
  - El juego hizo lo correcto: 2,27 cae dentro de la ventana de 1,2–2,3 m.
  - El arnés mantenía ▼ hasta leer y ≤ 2,5 y, con la máquina cargada, la latencia de esa consulta dejaba bajar 0,23 m más.
  - Ahora se acerca manteniendo la tecla y termina con toques cortos, como lo haría una persona. La corrida final se soltó a 2,50 m, con el resultado «corto».
- **Tiempos de cuadro:**
  - **Cruce:** p99 y máximo de 16,8 ms, sin pasos perdidos.
  - **En reposo, dos corridas malas:** un cuadro aislado de 33,4 ms en una, y p95 de 33,4 ms en la corrida final, con carga de 9,9 a 13. La carga venía del Chrome headless de otra sesión (`output/snapshot-4192/scripts/playthrough.mjs`).
  - **Prueba A/B** (`scripts/rendimiento-ab.mjs`), en la vista del inicio, alternando vegetación con sombra, sin sombra y sin vegetación: 9 ventanas de 5 s con carga 6,4–13,8.
    - En todas, p99 de 16,8 ms.
    - Un solo pico de 66,7 ms, en una ventana sin sombra.
    - La vegetación no tiene un costo medible.
    - En otras 8 ventanas de 6 s, con carga ~5,5: 0 cuadros por encima de 17 ms.
  - **A25 sigue sin validarse:** falta una máquina tranquila.

## Lo que queda (ver REVISION)

- **El giro de los helechos en la cámara de juego** se lee débil; de cerca es inequívoco.
- **El Pozo** se quedó sin señal vegetal del borde.
- **Brillos en las puntas** de las hojas finas.
- **Las manchas de verde del suelo y las barbas de musgo escalonadas** desentonan ahora con las plantas pintadas.
- **Sin verificar con personas:** si alguien descubre el borde por las plantas.
