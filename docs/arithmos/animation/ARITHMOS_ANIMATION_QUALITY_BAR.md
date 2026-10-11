# ARITHMOS · Quality bar de animación

Una escena **no está terminada por funcionar**. Está terminada cuando cada dimensión alcanza el nivel mínimo, con evidencia (captura, sonda o recorte) guardada en `artifacts/arithmos/animlab/…`.

**Mínimo para producción: nivel 3 en todas las dimensiones, nivel 4 en Timing, Actuación y Matemática.**
**Vertical slice (benchmark): nivel 4 en todas, con al menos tres en nivel 5.**

Cómo se verifica cada nivel: **[S]** sonda numérica (`__lab.probe`, gráficos con `animlab-plot.mjs`); **[C]** captura o recorte a tiempo exacto; **[R]** revisión de un agente con contexto fresco que no escribió la escena; **[H]** sólo un humano puede certificarlo (no se declara sin humano).

---

## Niveles

| Nivel | Nombre | Qué significa |
|---|---|---|
| 0 | Placeholder | Aparece, sin intención. Fundidos, saltos, texto estático. |
| 1 | Funcional | Comunica el contenido; el movimiento es una transición (lineal, ease genérico). |
| 2 | Correcto | Sin errores visibles: nada se pisa, nada salta, la matemática es exacta, se lee. |
| 3 | Pulido | Tiempo diseñado (arranques/frenadas, pausas que significan), textura coherente, cámara que acompaña. |
| 4 | Profesional | Cada movimiento tiene causa y consecuencia visibles; actuación con anticipación y superposición; la transformación matemática muestra la correspondencia; ritmo variado a propósito. |
| 5 | Excepcional | Un detalle que solo existe en Arithmos (la tiza, el polvo, el pizarrón) carga significado; un espectador podría describir qué pensó el personaje sin texto. [H] para confirmarlo. |

---

## Criterios por dimensión

### Timing y spacing
- **N1**: progreso lineal o ease genérico idéntico para todo.
- **N2**: nada arranca ni para en seco salvo a propósito (impactos). [S] velocidad continua: sin saltos > 40 % entre cuadros a 60 Hz, salvo impactos marcados.
- **N3**: trazos con plan de mano: aceleración acotada, frenada en curvas (v ∝ κ^-1/3 ±), levantadas que dependen de la distancia. [S] gráfico de velocidad de la punta: forma trapezoidal o en campana, nunca rectangular ni triangular con pico > 2× crucero.
- **N4**: las pausas están **dirigidas**: antes de un cambio de idea hay un tiempo de lectura (≥ 0.35 s quieto), y las acciones repetidas se aceleran (la 3.ª repetición del gesto tarda ≤ 80 % de la 1.ª; en un conteo, el gesto es el vuelo de cada conteo — aclaración R14: no el intervalo entre marcas, que incluye las pausas dirigidas como el atado de cinco). [S] tabla de tiempos de la escena.
- **N5**: el ritmo cambia con el estado emocional (duda = trazos lentos con micro-pausas; comprensión = trazo continuo). [R]+[H].

### Actuación (personaje y Punto)
- **N1**: pose a pose interpolada, todas las partes llegan juntas.
- **N2**: sin deslizamiento de pies al caminar (error < 2 px de mundo mientras el pie apoya) [S]; mirada hacia lo que importa [C].
- **N3**: anticipación antes de acciones grandes (contramovimiento de 60–150 ms), asentamiento al terminar (sobrepaso ≤ 8 %, 1–2 oscilaciones) [S].
- **N4**: superposición: la cabeza/mirada lidera, el torso sigue con 50–120 ms de retraso, los brazos después [S]; cada reacción tiene un tiempo de "darse cuenta" visible [C].
- **N5**: la equivocación y la comprensión se distinguen sin texto [R]+[H].

### Textura (tiza)
- **N1**: línea de color plano o con ruido uniforme.
- **N2**: la textura viene del diente del pizarrón y está anclada al mundo (no nada con la cámara) [C dos cuadros con cámara movida].
- **N3**: presión con toque y levantada; sin cuentas periódicas (autocorrelación del pico a 2 px < 0.6 **o** sin patrón visible en recorte dpr 3) [S]+[C]; los cruces y repasos acumulan polvo [C].
- **N4**: el depósito depende de la velocidad (trazo rápido más seco) y la punta tiene orientación (ancho según dirección) [S].
- **N5**: polvo residual coherente: borrar deja el fantasma de lo que había [C].

### Legibilidad y composición
- **N2**: todo texto ≥ 12 px CSS en teléfono acostado (844×390); nada se superpone [C en dos tamaños]; ningún destello más de 3 veces por segundo (WCAG 2.3.1).
- **N3**: un solo foco por momento: lo que no importa baja de presión o queda fuera de cuadro [C]; el ojo se lleva con movimiento o con la mano, no con flechas de interfaz. Un texto queda quieto ≥ 0,3 s por palabra + 0,5 s antes de moverse o borrarse [S, sin medir todavía] (RESEARCH §6).
- **N4**: las distancias significan (lo que se relaciona está cerca; lo que se opone, enfrentado); márgenes del plano consistentes [R].

### Continuidad
- **N2**: ningún objeto aparece o desaparece sin causa visible (mano, borrador, Punto, Marea) [C hoja de contactos]. Ningún punto se teletransporta: un punto visible no se corre más de 24 px en un cuadro de 60 Hz si en los cuadros vecinos se corre 4 veces menos [S `scene-audit.mjs`, traspasos] (RESEARCH §6: «mostrá el camino de cada traspaso»).
- **N3**: lo que se transforma conserva identidad (el mismo «3» se mueve; no se apaga uno y se prende otro) [C].
- **N4**: la cámara nunca corta durante una transformación que el jugador necesita seguir [C].

### Matemática
- **N2**: exactitud: todo número, posición en recta, gráfico y escala es correcto (tests o sonda) [S].
- **N3**: la animación muestra la operación, no el resultado: en «+3 a ambos lados», los dos «+3» se escriben con el mismo gesto y la misma tiza, y la balanza (si hay) se nivela después, no antes [C].
- **N4**: correspondencia explícita entre representaciones (fila de tabla ↔ punto ↔ término) mediante un gesto que recorre ambas [C]+[R].
- **N5**: el jugador puede predecir el siguiente cuadro antes de verlo [H].

### Sonido
Lo medible se certifica midiendo (`scripts/scene-audit.mjs`: el sonido de la escena se vuelve a generar sin parlantes y se compara con los contactos de la imagen); **que suene bien sigue siendo [H]** (RESEARCH §6).
- **N2**: el rasgueo de tiza suena sólo mientras la punta toca. [S] (evento de audio ↔ estado de la punta). Ningún sonido de contacto se adelanta a su imagen más de 45 ms ni se atrasa más de 125 ms (umbrales de detección, ITU-R BT.1359) [S].
- **N3**: volumen y brillo del rasgueo siguen la velocidad de la punta; silencio en levantadas [S]. Cada contacto que suena (aterrizaje de Punto, apoyo de tiza) suena en el cuadro del contacto o en el siguiente (−1 < Δ ≤ +1 cuadro de 60 Hz) y 3–6 dB sobre el fondo (ponderación K, primeros 60 ms) [S].
- **N4**: el sonido anticipa o puntúa (golpe de tiza al terminar un «=») [R]; sonoridad pareja entre escenas del mismo capítulo (±3 LU) y pico verdadero ≤ −1 dBTP [S]. Gusto: [H].

### Rendimiento
- **N2**: escena estable a 60 fps en escritorio; ≤ 8 ms de tiza por cuadro (HUD del lab) [S].
- **N3**: 30 fps estables en teléfono de gama media [H en dispositivo real].

---

## Anti-genericidad (verificable)
Se rechaza en revisión, aunque "se vea bien":
- fundido de opacidad como única entrada o salida de un objeto de tiza (la tiza se dibuja o se borra);
- `ease-in-out` idéntico en más de dos tipos de movimiento distintos en la misma escena;
- rebote (`easeOutBack`) en objetos que no son elásticos en la ficción;
- partículas, brillo o desenfoque sin causa en la ficción (el polvo de borrado sí tiene causa);
- texto que "se revela" con barrido rectangular en lugar de escribirse;
- texto que se mueve mientras se lee;
- opacidad o color que rebotan o sobrepasan (sólo posición y tamaño pueden: Material 3, RESEARCH §6);
- cámara que se mueve sin que algo en cuadro lo motive.
