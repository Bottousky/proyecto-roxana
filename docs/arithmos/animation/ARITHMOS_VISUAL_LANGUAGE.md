# ARITHMOS · Lenguaje visual de la animación

Regla: toda indicación estética se escribe como algo **observable**. "Que se vea premium" no es una indicación.

## 1. La ficción física
El mundo es un pizarrón vivo: lo dibujado puede moverse, pero **obedece a la tiza**:
- Nada aparece sin ser dibujado (mano, Punto, alguien) y nada desaparece sin ser borrado (borrador, Marea, dedo).
- Lo que se mueve sobre el pizarrón **arrastra un poco de polvo**: un objeto que se desliza deja un rastro tenue en la capa de polvo (alpha ≤ 0.12) que se asienta en ~1.5 s. Es la memoria visual del movimiento.
- La cámara es el ojo de alguien parado frente a un pizarrón enorme: se acerca para leer, se aleja para relacionar, nunca gira.

## 2. El trazo
Un trazo de tiza, verificado en recorte a dpr 3 y en el gráfico de velocidad:
1. **Toque**: los primeros ~5 px llevan 10–18 % más presión (la tiza aterriza).
2. **Arranque**: la velocidad sube desde ~30 px/s con aceleración acotada (≈ 5000 px/s²); no hay salto.
3. **Cuerpo**: velocidad de crucero estable (±5 %) en tramos rectos; en curvas cerradas baja según v ∝ κ^-1/3.
4. **Textura**: núcleo lleno, bordes ásperos; la presión varía lentamente (período ~20 px, ±12 %); estrías finas paralelas al movimiento.
5. **Frenada y levantada**: la velocidad baja a ~45 px/s y la presión cae al 35 % en los últimos ~14 px (la tiza se va levantando mientras frena).
6. **Entre trazos**: la mano viaja en el aire un tiempo que crece con la distancia (≈ 0.07 s + 0.42 ms/px + término de Fitts). Ningún trazo empieza en el mismo cuadro en que termina el anterior.
7. **Repaso**: pasar dos veces por el mismo lugar **carga más** (más blanco, menos diente visible). Se usa para enfatizar, no se usa brillo.

## 3. Colores de tiza (significado, no decoración)
- **Blanca**: lo que es (datos, el mundo, lo establecido).
- **Amarilla**: lo que el jugador hace o propone (su acción, su hipótesis).
- **Celeste**: lo que se descubre o se relaciona (correspondencias, la Marea).
Nunca un cuarto color. Nunca degradés.

## 4. Escritura matemática
- Se escribe **trazo a trazo** con glifos de un solo trazo (orden de trazos de escritura escolar: de arriba hacia abajo, de izquierda a derecha; el «=» son dos trazos, de arriba primero).
- Ritmo: dentro de un signo, levantadas cortas; entre signos, una pausa algo mayor; antes de un «=», una micro-pausa (≈ 0.12 s) que marca "ahora viene lo que vale".
- Tamaño mínimo de lectura: 12 px CSS en 844×390.

## 5. Transformación (lo que diferencia a Arithmos)
Cuando una expresión se convierte en otra:
1. **Lo que se conserva se desliza**: el mismo símbolo viaja a su nueva posición siguiendo un arco leve (flecha de arco ≤ 6 % de la distancia), con perfil de mínimo jerk, y deja rastro de polvo. Nunca se borra y se reescribe algo que es "lo mismo".
2. **Lo nuevo se escribe con la mano** (o con Punto), en amarillo si lo propone el jugador.
3. **Lo que se cancela se tacha primero** (una raya diagonal, rápida) y se borra después, con el borrador: la cancelación se ve antes de desaparecer.
4. **Orden**: primero se ve la causa (el gesto, el «+3» de ambos lados), después la consecuencia (los términos se reacomodan). Entre una y otra, ≥ 0.35 s quieto para leer.
5. Las operaciones simétricas se hacen con **el mismo gesto** a ambos lados (misma duración, mismo trazo reflejado en el tiempo).

## 6. Movimiento de personajes y Punto
- **Punto** es un punto: su actuación es su trayectoria. Antes de moverse lejos, se encoge contra la dirección (anticipación, 80–140 ms, squash ≤ 25 % con volumen conservado); al llegar, sobrepasa ≤ 8 % y se asienta en 1–2 oscilaciones (ζ ≈ 0.5–0.6). Cuando "piensa", se queda quieto (no orbita).
- **Figura de palitos**: la mirada lidera, la cabeza sigue, el torso después, los brazos al final (superposición 50–120 ms). Los pies no se deslizan mientras apoyan.
- **Boil** (re-sorteo de trazos cada 0.125 s) sólo en lo que está "vivo" (personajes, Punto); lo escrito no hierve.

## 7. Cámara
- Zoom en escala logarítmica (ya implementado).
- Viaje de cámara con perfil de mínimo jerk; duración proporcional al logaritmo del cambio de escala + la distancia en pantallas (no una duración fija).
- La cámara llega **antes** de que empiece la acción importante (≥ 0.2 s de anticipación) y se queda quieta mientras se escribe.
- Temblor sólo por impacto en la ficción (Marea), con trauma² × ruido coherente, nunca senoide pura.

## 8. Prohibido
Fundido como entrada/salida de tiza; barrido rectangular de texto; rebote en lo que no es elástico; partículas, brillo o desenfoque sin causa; ease idéntico para todo.
