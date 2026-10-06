# Physica — estado

**Actualizado:** 2026-10-06 · iteración 05 (agua de la cascada; ver `evidence/iter-05`).

## Dónde se trabaja

- **Worktree:** `.claude/worktrees/physica-opus55-production-465980`.
- **Rama:** `claude/physica-opus55-production-465980`, desde `f7984ca`.
- No se tocan main, Ohmdal (`src/`, `experiments/playcanvas`), Bitland ni Arithmos.
- No hay push ni despliegue.
- **Juego:** `experiments/physica`.
  - Arranque: `npm run dev`, en 127.0.0.1:4210.
  - En el panel del navegador de Claude: `.claude/launch.json` → `physica-dev`. Ese archivo es local y no está versionado.

## Hito actual: A (escena insignia), en curso

**Último cambio aceptado (iteración 05):** el agua de la cascada tiene volumen, espuma y flujo continuo, y su forma sigue saliendo del campo (D11).
- **Sección por continuidad** y límite por curvatura en la cresta; velo desgarrado; ondas a la velocidad del agua.
- **La columna sale de la poza** con la presión declarada de la surgencia; espuma en el afloramiento, la cresta y la llegada; roca mojada.
- **Revisión independiente:** 8 hallazgos, 6 corregidos y 2 parciales (la corona de la cresta se ve poco; pozas rectangulares).
- **Evidencia:** 44 pruebas; recorrido con teclado sin regresiones y sin tirones en el cruce (carga ~4). Ver `evidence/iter-05`.

**Iteración 04:** acabado visible. Roca con detalle pintado y relieve por estrato, fondo pintado en capas, ciudad con interruptor, plano de establecimiento y retrato en la Bitácora. Ver `evidence/iter-04`.

**Iteración 03:** transferencia con dos límites.
- **El Pozo:** un pozo con su propia región. Su piso está a 1,0 m.
- **El Mirador:** más alto, del otro lado.
- **Experimento seguro:** el soporte P (riel y campana) predice exactamente la ventana del explorador (1,2–2,3 m).
- **Salidas:**
  - cadena en el aire;
  - el agua no cuenta como apoyo firme;
  - R desde el agua.
- **Plano de medición único.**
- **Vista de la ciudad** al llegar al Mirador.
- **Evidencia:** 44 pruebas y recorrido con teclado. Ver `evidence/iter-03` (README y REVISION).

**Iteración 02:** el cruce exige anticipar.
- **Desde el borde no se llega.** La Terraza está a 4,4 m y la región termina en 3 m.
- **Experimento seguro:** el riel de B tiene una campana a la altura de la Terraza y predice el umbral de la cadena (el mismo número, la misma referencia: el centro del cuerpo).
- **El agua:** sube desde la poza del fondo y es lo único que cresta.
- **Evidencia:** 35 pruebas, recorrido con teclado y revisión independiente. Ver `evidence/iter-02` (README y REVISION).

**Iteración 01:** la cascada se juega de punta a punta, con la revisión corregida. Ver `evidence/iter-01`.

**Qué hay:**
- **Campo regional** con banda suave y superposición.
- **Integración** Verlet a 120 Hz, determinista.
- **Dos soportes con carrete**, a la misma altura (2 m) y a ambos lados del borde. El riel de B baja hasta −2,5 m (▲▼). La campana de la Terraza suena una vez por suelta.
- **Cadena para bajar dentro de la región** (▼, con esfuerzo). Se suelta con E. Se ofrece después del primer intento corto.
- **Tiza por intento** en la pared, rotulada con el lugar de partida, y la línea de la campana a 4,5 m.
- **Trazas** cada 0,1 s.
- **Esferas sueltas** para llevar y soltar.
- **Agua:** el arroyo se va por una reja, brota en la poza de la sima y sube integrada del mismo campo hasta crestar sobre la Terraza. Dos caídas familiares la enmarcan.
- **Indicadores del borde:**
  - plomadas, que se invierten;
  - musgo, que sube en la región;
  - polen, que se acumula en el borde;
  - zumbido de anclas.
- **Explorador sin salto**, con dos ayudas declaradas: dirección en el aire y agarre del borde.
- **R en el aire** devuelve al último apoyo firme.
- **Bitácora** con cuatro notas calculadas de las marcas: el borde y las aceleraciones se detectan en ellas. Persiste junto con el último apoyo.
- **Pausa** al perder el foco, sin saltos.
- **Controles:** teclado, mando y táctil.
- **Rendimiento:** 60 FPS medidos en escritorio (M2) después de reemplazar el ruido por fragmento por una textura.

**Qué falla todavía (ver BACKLOG):**
- **Acabado del Hito A** (el mayor impedimento para cerrarlo):
  - **A24:** el modelo 3D del explorador no coincide con su retrato;
  - pasto, musgo e instrumentos genéricos;
  - la corona de la cresta se ve poco y las pozas son rectángulos.
- **A20:** no hay amortiguación; la oscilación ideal es eterna, aunque tiene salidas.
- **A21:** hay un solo chorro.
- **A17:** no hay nada que *modificar*.
- **A22:** el mástil parece una escalera.
- **A23:** assets generados, esperando la decisión del usuario.
- **A12:** las animaciones del avatar no se revisaron en movimiento.
- **A16:** no hay menú de opciones.
- **No verificado:**
  - el sonido: nadie lo escuchó;
  - el táctil y el mando en dispositivo real;
  - el rendimiento móvil;
  - la claridad y la diversión con personas.

## Próximo resultado

**Modelo 3D del explorador fiel al retrato (A24).**
- Antiparras con lentes, mechones, colas de bufanda con movimiento secundario, proporción de 3 cabezas.
- **Criterio:** vista de giro del modelo junto a la hoja de giro, en las mismas cuatro vistas; recorrido con teclado sin regresiones; revisión independiente centrada en el personaje.

*Plan cumplido en la iteración 05:* agua de la cascada (A19): sección según A·v, espuma en el afloramiento, rocío en la cresta y roca mojada.

*Plan cumplido en la iteración 04:* acabado visible de la escena insignia (A10 + A18).
- **Roca:** que se lea con detalle de cerca. Procedural, con textura de mayor resolución y relieve por estrato, o con assets generados si el usuario elige la vía A o B de `art/PROMPTS-IMAGEGEN.md`.
- **Plano de establecimiento:** al entrar, uno que reúna la caída familiar, la cascada que sube y el pozo.
- **Criterio de aceptación:**
  - comparación antes/después en las mismas tomas (inicio, cascada, pozo, primer plano a 5 m);
  - 60 FPS sostenidos;
  - revisión independiente centrada en arte.

*Plan anterior, ya cumplido en la iteración 03:* A20 + A9, un objetivo con dos límites y la transferencia.
- **Amortiguación:** arrastre del aire declarado (pruebas contra la solución con arrastre lineal), con los umbrales recalculados.
- **Segunda configuración:** reutiliza la regla en otra geometría, por ejemplo un nicho alto con techo. Ahí soltarse demasiado abajo también falla, porque el cuerpo choca con el techo y vuelve a la región sin daño. Hay que elegir una profundidad intermedia, que el riel de B permite predecir.
- **Criterio de aceptación:**
  - con teclado, un intento demasiado abajo y otro demasiado arriba fallan e informan;
  - uno intermedio llega;
  - la Bitácora compara los tres con números medidos.

*Plan anterior, absorbido en lo de arriba:* A8 + A17, anticipar y modificar, sin que el agua revele la ruta.
- **Rediseño del cruce:** el agua sigue enseñando la regla (sube en la región), pero su arco no coincide con la ruta del explorador.
  - Por ejemplo, el arroyo sale más lento y su arco se queda en la región: forma la cresta y se derrama.
  - Con eso, cruzar exige una elección que puede fallar sin castigo: desde dónde y con qué rapidez entrar.
- **Anticipar:** antes de soltar, el jugador coloca una canasta receptora donde predice que va a girar la esfera. La traza muestra si acertó.
- **Modificar:** la caída familiar mueve una rueda que alimenta las anclas; desviar el agua baja la potencia del campo.
- **Criterio de aceptación:**
  - recorrido con teclado donde una predicción mal colocada falla y la traza muestra por qué;
  - un cruce que falla con una elección y funciona con otra;
  - la potencia cambia el arco de forma medible, con una prueba.

## Retomar

```sh
cd .claude/worktrees/physica-opus55-production-465980/experiments/physica
npm ci            # si falta node_modules
npm test
npm run dev       # o preview_start "physica-dev"
node scripts/evidence.mjs http://127.0.0.1:4210/ <carpeta-de-salida>
```

**Loop:**
- Programado en esta sesión con `/loop 5m` (cron `*/5 * * * *`, job `478624ed`, recreado al retomar después del límite de uso). Se cancela con CronDelete.
- Vive sólo mientras la sesión esté abierta.
