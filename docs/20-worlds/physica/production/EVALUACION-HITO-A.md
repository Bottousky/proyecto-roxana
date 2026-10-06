# Physica — evaluación humana del Hito A (la cascada ascendente)

**Qué es:** el paquete para probar la escena insignia con personas (contrato, apartado 11). Las pruebas automáticas que se pueden hacer ya pasan; lo que sigue sólo lo puede responder alguien jugando.

**Qué no es:**
- No es una declaración de calidad.
- No hay todavía ninguna sesión con personas.
- Nada de lo de abajo es un resultado: son preguntas.

## Cómo correrlo

```sh
cd .claude/worktrees/physica-opus55-production-465980/experiments/physica
npm ci            # si falta node_modules
npm run dev       # abre http://127.0.0.1:4210/
```

- **Navegador:** Chrome o Safari de escritorio, en pantalla completa, con sonido.
- **Mando:** cualquier mando estándar sirve.
- **Empezar de cero:** abrir con `?fresh`, que olvida el último punto de apoyo guardado. La Bitácora guarda sus notas en el navegador; para borrarlas, usar los datos del sitio o una ventana privada.
- **Movimiento reducido:** con `?reduced`, o desde Esc → «Movimiento reducido».

## El recorrido esperado (para quien observa; no se le cuenta a quien juega)

1. **Orilla:** una caída de agua familiar y un arroyo que se va por una reja. Más adelante, la sima, con una columna de agua que **sube**.
2. **Soporte A**, sobre suelo firme: la esfera cae como siempre.
3. **Soporte B**, sobre la sima: la esfera sube.
   - Bajando la pinza (▲▼) y soltando desde más abajo, sube más.
   - Desde −1 m toca la campana a la altura de la Terraza.
4. **El borde:** caminar desde el borde lleva al explorador hacia arriba, pero no alcanza la Terraza y vuelve. Es seguro: R devuelve al último apoyo firme.
5. **La cadena** (se ofrece después del primer intento fallido o de oír la campana): bajar con ▼ contra el empuje, soltarse con E desde bastante abajo y dirigirse a la Terraza.
6. **El Pozo,** en la Terraza: la misma regla en otra geometría, con dos límites.
   - Soltándose muy abajo, cae al agua.
   - Muy arriba, no alcanza.
   - El soporte P, con su campana, predice la ventana: 1,2–2,3 m sobre el fondo del Pozo.
7. **El Mirador**, del otro lado del Pozo: la vista de la ciudad.
8. **La Bitácora (J)** reúne lo medido: aceleraciones, el borde y los intentos.

**Duración:** no medida con personas.

## Controles (también en Esc → Controles)

| Acción | Teclado | Mando | Táctil |
|---|---|---|---|
| Caminar | ◀ ▶ · A D | palanca izquierda · cruz ◀ ▶ | ◀ ▶ |
| Ajustar, trepar | ▲ ▼ · W S | palanca · cruz ▲ ▼ | ▲ ▼ |
| Usar | E · espacio · Enter | A | botón grande |
| Reiniciar / volver a pisar firme | R | Y | ↺ |
| Bitácora | J · Tab | Select | ✎ |
| Pausa y opciones | Esc · P | Start | ⏸ |

## Fallas conocidas (para no confundirlas con hallazgos)

**Sin verificar por nadie:**
- El sonido: el autor no puede escucharlo.
- Táctil y mando en un dispositivo real.
- Rendimiento en móvil.

**De la imagen:**
- En la cámara de juego, el giro de los helechos en el borde de la región se lee débil, y la dirección del musgo sólo se ve de cerca. El campo lo muestran sobre todo las plomadas, los helechos y la columna de agua.
- El suelo de la Terraza vista de lejos se emborrona en vetas.
- El collar que marca el borde en el mástil de plomadas se lee débil.
- El agua del Pozo es una lámina, sin volumen.

**Del rendimiento:**
- Una pausa de ~300 ms por minuto en Chrome headless en la máquina de desarrollo. Una página WebGL mínima tiene la misma pausa (iteración 11).
- No se midió en un navegador con ventana.

**Del alcance:** no hay nada que *modificar* (A17): el jugador no puede cambiar la energía del campo.

## Qué observar (sin ayudar ni explicar)

Anotar el tiempo y lo que la persona dice en voz alta. Si se traba más de 2 minutos, anotar dónde y recién ahí dar una pista mínima (y anotarla).

1. ¿Nota que el agua de la sima **sube**? ¿Cuándo y qué dice?
2. ¿Usa los soportes A y B **antes** de cruzar ella misma? ¿O los ignora?
3. Cuando el explorador sale del borde y no alcanza la Terraza, ¿entiende por qué? ¿Lo dice?
4. ¿Encuentra la cadena? ¿Entiende que soltarse más abajo la lleva más alto?
5. En el Pozo, ¿usa el soporte P para predecir antes de arriesgarse? ¿Cuántos intentos le lleva llegar al Mirador?
6. ¿Abre la Bitácora? ¿Lee las notas? ¿Coinciden con lo que vio?
7. ¿Descubre dónde termina la región sin texto? ¿Por qué señal (plomadas, helechos, musgo, polen, agua, sonido)?
8. ¿Hay algún momento de frustración que no sea parte del desafío (controles, cámara, algo tapado)?

## Preguntas después de jugar (abiertas, en este orden)

1. Contame con tus palabras qué pasaba en esa sima.
2. ¿Qué tenías que hacer para llegar a la Terraza? ¿Por qué funcionaba?
3. Si soltaras una esfera desde más abajo, ¿qué esperarías? ¿Y en el Pozo?
4. ¿Hubo algo que no entendiste o que te pareció injusto?
5. ¿Qué fue lo más lindo de ver o de hacer? ¿Y lo más aburrido?
6. ¿Seguirías jugando? ¿Qué te gustaría encontrar después?
7. (Si usó las opciones) ¿Te sirvieron el volumen, el movimiento reducido o el tamaño del texto?

## Registro (plantilla; una por persona)

```
Fecha · edad aprox. · experiencia con juegos (poca / media / mucha) · dispositivo y navegador · teclado / mando / táctil
Tiempo hasta notar que el agua sube:
Usó A / B antes de cruzar: sí / no
Intentos desde el borde:            Encontró la cadena: sí / no (min.)
Llegó a la Terraza (min.):          Llegó al Mirador (min., intentos en el Pozo):
Pistas dadas (cuáles y cuándo):
Frases textuales:
Respuestas a las preguntas 1–7:
```

**Regla:** si no hubo sesión, no hay datos. Los resultados se guardan en `production/evaluaciones/` sin interpretar. Lo que se decida a partir de ellos va a DECISIONES.
