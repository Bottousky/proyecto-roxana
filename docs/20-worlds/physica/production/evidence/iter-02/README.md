# Iteración 02 — evidencia

**Resultado principal:** el cruce exige anticipar y permite fallar sin castigo, y el agua enseña la regla sin dibujar la ruta. El diseño está en `../../DECISIONES.md` D9.

**Cómo se generó:** `scripts/evidence.mjs` con teclado real (CDP) desde un inicio limpio. Las ventanas se miden en tiempo simulado.
- Equipo: Apple M2, Chrome headless, ANGLE Metal, 1280×720.
- Carga de la máquina, registrada en `report.json`: 3,9 al empezar y 4,5 al terminar, con 8 núcleos.

## Técnica (medida)

**Pruebas (`npm test`): 35/35.** Nuevas o reescritas en esta iteración:
- **Desde el borde no se llega:** la cumbre de los pies coincide con el modelo (a/g)·(3 − y₀) dentro de 0,15 m.
- **Cadena:** soltándose a 0,55, 0 o −0,5 no llega; a −1, −1,5, −2 o −2,45 llega.
- **Campana:** suena desde −1 m o más abajo y no desde −0,5 o más arriba. Es el mismo umbral que el de la cadena.
- **Riel:** avanza de a 0,5 m y se detiene en los extremos.
- **Equivalencia:** una esfera y el explorador soltados lado a lado suben juntos (diferencia < 1 cm).
- **Agua:** la que sube desde la poza cresta sobre la Terraza.
- **Esfera empujada desde el borde:** tampoco llega.
- **Subir de nuevo por la cadena:** deja al explorador sobre la Orilla (bug de la revisión).
- **Campana:** suena una vez por suelta.
- **La cadena se ofrece** recién después de un intento corto o de que suene la campana.
- **Criterio cambiado:** dos pruebas de la iteración 1 («el explorador cruza caminando» y «el arco cruza») se reemplazaron porque el diseño cambió (D9). Las nuevas contrastan con el modelo físico, no con el código.

**Recorrido con teclado (`report.json`):**
1. A cae desde 2,0 m.
2. B desde 2,0 m: cumbre 3,41 m, sin campana.
3. Pinza bajada 6 pasos (a −1,0). B: cumbre 4,63 m, **suena la campana**. La repetición es idéntica.
4. Desde el borde, la hebilla llega a 4,00 m y los pies a 3,45 m: **no alcanza**. Queda tiza (`03a2`).
5. R lo devuelve a la Orilla.
6. En el borde se ofrecen la cadena y el soporte. Se baja hasta −1,52 m (centro), se suelta y **llega a la Terraza** con un agarre del borde (`03c`).
7. Volver a la Terraza desde la región: lo logra.
8. Bitácora: 7 notas, que persisten al recargar. El explorador retoma sobre la Terraza.
9. 0 errores.

**Tiempos de cuadro:**

| Situación | Cuadros | p50 | p95 | p99 |
|---|---|---|---|---|
| Reposo, 6 s | 360 | 16,7 | 16,7 | 16,8 |
| Caminando fuera del borde, sin capturas, 4,5 s | 271 | 16,7 | 16,8 | 16,8 |

**Medición contaminada:** una medición intermedia dio p95 33 ms. La causa fue un proceso de prueba propio que quedó huérfano al 92 % de CPU (un bucle infinito en una prueba, ya corregido), más carga de otras sesiones. Se terminó el proceso y se repitió la medición. Las mediciones son confiables sólo con la carga registrada.

## Juicio del implementador (no validado)

**Lo que se lee:**
- La tiza bajo la línea de la campana con el rótulo «borde» (`03a2`).
- La esfera B que no llega desde 2 m y sí desde −1 m (`02`, `02b`).
- El agua que sube desde la poza: sólo ella cresta sobre la Terraza (`09`).

**Lo que no alcanza:**
- La pared de la Terraza ocupa medio cuadro y está borrosa.
- El mástil de plomadas parece una escalera.
- La poza es una losa plana.

## No verificado

- Sonido.
- Táctil y mando en un dispositivo real.
- Rendimiento móvil.
- Si una persona entiende la relación entre la campana y la cadena sin texto: es la hipótesis central de esta iteración y queda para una prueba con personas.
