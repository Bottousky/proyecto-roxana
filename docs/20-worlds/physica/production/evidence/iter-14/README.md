# Iteración 14 — el mismo instrumento, otro lugar (Hito B · B2, parcial) (evidencia)

**Resultado principal:** el barrio tiene un experimento cotidiano. El soporte C, igual al de la Orilla, está en la plaza. Su esfera cae como siempre, y la Bitácora lo anota en «La misma caída, detrás del muro»: distancia, tiempo y aceleración medida (9,8 m/s²).
- Si el soporte A ya se soltó, la nota compara las dos caídas.
- Si no, dice que falta medirla.

**También:**
- **La fuente contrasta con la surgencia.** El chorro central sale hacia arriba a la misma velocidad vertical que el agua de la sima (2,95 m/s) y sube sólo 0,44 m. El cuenco tiene agua y desborda en láminas finas.
- **La cámara de la plaza ya no queda tapada por el muro.**
  - Sigue al explorador.
  - Si la roca se interpone, ese tramo se corta.
  - El cuerpo del explorador ya no puede quedar dentro del espesor del muro junto a la boca.
- **Corregidos de paso:**
  - ▼ quedaba trabado contra el costado de la fuente;
  - el piso del pasaje no se dibujaba;
  - el cuenco se veía negro;
  - desde el umbral del arco se ofrecía el soporte P.

Diseño en `../../DECISIONES.md` D19. La revisión independiente y su respuesta, en `REVISION.md`.

## Secuencia con teclado real

Script: `scripts/barrio.mjs`. `barrio.json` trae el estado del explorador en cada cuadro.

**Preparación declarada:** el explorador se ubica en el Mirador, para ver la ciudad, y después en la Terraza. De ahí en adelante, sólo teclas.

| Cuadros | Qué muestran |
|---|---|
| `secuencia-01`, `04` | La manivela («E Abrir el arco») y el arco abierto («▲ Entrar»). |
| `11` | Fuera del pasaje: la plaza enmarcada por la boca. Quieto, «▼ Volver» al costado del explorador. |
| `13`, `15` | ◀ junto al muro. La cámara sigue al explorador y el muro se corta: se ven la plaza, la fuente y el soporte C a la izquierda. |
| `19`, `22` | ▲ por encima de un cantero, hasta la altura del soporte. Junto a su poste, «E Soltar la esfera». |
| `24`, `25`, `27` | La esfera cae junto a su regla (3, 2 y 1 m): una marca cada 0,1 s, y en el pavimento el aviso de la Bitácora. |
| `28` | La Bitácora. «Una caída detrás del muro»: 1,83 m en 0,61 s, 9,8 m/s², y que para comparar falta soltar el soporte de la Orilla (esta preparación lo saltó). Con las dos caídas medidas, el título es «La misma caída…». «Detrás del muro»: la altura del chorro, 0,44 m, calculada con el campo. |
| `30`–`35` | ▶ hasta el costado de la fuente y ▼ de vuelta: rodea el cuenco, sale por el pasaje y llega a la Terraza (z = 0). |

**Otras tomas:**
- `fuente-cerca`: el chorro central con su ápice y los cuatro derrames.
- `barra-de-ayuda-en-profundidad`: la primera vez que se pasa el arco, la barra de ayuda vuelve unos segundos y dice «▲▼ caminar hacia el fondo y volver». En la Terraza ya se había ocultado.
- `boca-del-pasaje-empedrada`: el pasaje con su piso.
- `plaza-diagonal-con-corte`: la cámara dentro del muro cortado.
- `vista-4-plaza-entera` y `vista-5-plaza-desde-el-fondo`: la plaza entera, con cámara libre (`scripts/vistas-barrio.mjs`, herramienta de inspección).
- `vista-1` y `vista-3`: la Terraza antes y después del Mirador. Sobre el muro no asoma nada: el barrio se dibuja recién al abrir el arco (ver D19).
- **Intermedios:**
  - `ruta-05-terraza-con-el-arco-abierto`: con el arco ya abierto, sobre el muro de la Terraza asoman fachadas del barrio. Así es desde la iteración 13 y queda para la silueta (abajo).
- `intermedio-camara-tapada-por-el-pasaje`: junto al soporte, la pared del pasaje tapaba al explorador, al soporte y a la traza;
  - `intermedio-barrio-asomando-desde-el-mirador`: una fachada cortada sobre el arco, «una casa encima del acantilado»;
  - `intermedio-cuenco-negro-y-chorro-fino`: el cuenco de latón y el chorro de 5 cm.

## Técnico (medido)

- **`npm test`: 71/71.** Cinco pruebas nuevas:
  - en `profundidad.test.js`:
    - el soporte de la plaza: no se ofrece desde la boca; se llega por la plaza; su esfera cae con aceleración familiar (±0,05 m/s²);
    - contra el costado de la fuente, ▼ y ▲ rodean el cuenco; de frente, sigue deteniendo;
    - junto a la boca, el cuerpo del explorador no entra en el espesor del muro. Con las áreas anteriores falla: 100 de 1080 pasos;
    - desde el umbral no se ofrecen los soportes del recorrido 2.5D;
  - en `journal-plaza.test.js`: la nota sólo dice lo medido, y la comparación aparece en los dos órdenes (C antes que A y A antes que C).

  Las 66 anteriores pasan.
- **Recorrido con teclado completo** (`report.json`): pasa. Es la corrida posterior a todas las correcciones de la revisión, salvo dos cambios de interfaz: el título de la nota y la barra de ayuda, verificados después con `barrio.mjs`. En el paso «arco y barrio», después de entrar, el recorrido:
  - va con ◀▲◀ al soporte C;
  - se le ofrece «C»;
  - lo suelta: la esfera queda libre sobre el pavimento, con 8 marcas;
  - la Bitácora agrega «plaza»;
  - vuelve con ▼ a la Terraza.

  Persisten 13 notas, con 0 errores.
- **Tiempos de cuadro de la secuencia** (`barrio.json`, `perf`), medidos caminando con las teclas: p99 y máximo de 16,8 ms en la plaza (z −13,3, frente a la fuente) y en el pasaje (z −4,3).
  - En una corrida anterior, con la máquina compartida muy cargada, el pasaje dio p95 de 33 ms.
- **El costo de dibujar el barrio detrás del muro**, en la vista de la Terraza: 855 llamadas de dibujo contra 660, y 758 mil triángulos contra 747 mil. Los tiempos de cuadro en esta M2 no cambian (p99 de 16,8 ms en 12 ventanas). Por eso el barrio se dibuja recién al abrir el arco.
- **Una pausa en el paso «rendimiento» de la ruta, en una corrida intermedia:** 63 cuadros en 6 s, con un cuadro de 267 ms y 18 pasos perdidos.
  - Medí un A/B intercalado del mismo paso (`ab-pausa-cascada.jsonl`): dos builds de producción, el de esta iteración y el de HEAD, servidos con `vite preview`.
  - La firma de la pausa salió en **HEAD 3 de 8 ventanas** y en el **árbol de trabajo 0 de 8**. Con el servidor de desarrollo: trabajo 2 de 16 y HEAD 0 de 5.
  - **Conclusión:** la pausa no es de esta iteración. Es la del entorno de A25, con la máquina compartida muy cargada (carga de 4 a 27 durante la medición).
  - **Hallazgo nuevo:** en dos ventanas, el reloj de la página avanzó 3 s mientras pasaban 6 s afuera. La página se congela entera; no es un cuadro lento.
  - **Sin explicar:** en esa misma tanda, el p99 de las ventanas sin pausa fue de 50 a 83 ms en el árbol de trabajo y de 33 a 67 ms en HEAD, los dos muy por encima de los 16,8 ms habituales. Con la máquina tranquila, las 12 ventanas de la medición del costo dieron 16,8 ms.
- **Arnés de prueba:**
  - en `evidence.mjs`, `walkTo` y los intentos del Pozo corrigen con toques cortos cuando una pausa hace que el explorador se pase del objetivo, y lo registran;
  - `barrio.mjs` reintenta las capturas que se cuelgan.

## Lo que falta para cerrar B2

- **La identidad de la metrópolis:** la plaza se lee como la de un pueblo. Faltan escala, puertas en las plantas bajas, un soportal, dos o tres habitantes y una vista de la ciudad más allá.
- **Lo que asoma sobre el muro, diseñado:** una silueta propia, con la cúpula en el eje del arco y techos en la bruma, en vez del barrio entero.
  - Hoy, al apretar E, el barrio aparece de golpe sobre el muro, y con el arco abierto queda asomando en la vista 2.5D (`ruta-05-terraza-con-el-arco-abierto`), con su costo de dibujo.
  - En la vista 2.5D, el barrio podría reemplazarse por la silueta.
- **Suavizar el corte del muro,** hoy instantáneo.
- **Capturar en la evidencia la nota con la comparación entre A y C.** Las pruebas la cubren; la secuencia saltó el soporte A.
