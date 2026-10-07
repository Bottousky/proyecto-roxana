# Physica — evaluación humana de «Introducción» (la avenida del carro de cable)

**Qué es:** el paquete para probar con personas la primera familia del temario (contrato, apartado 5: «referencia, posición, desplazamiento, tiempo, unidades, medición y vectores»).

**Alcance real:** la familia todavía no está completa. Falta la transferencia (el bote junto al arco de agua), y los vectores son sólo desplazamientos con signo, en una dimensión. Este paquete sirve para probar lo que ya existe, no para cerrar la familia.

**Qué no es:**
- No es una declaración de calidad.
- No hubo todavía ninguna sesión con personas.
- Nada de lo de abajo es un resultado: son preguntas.

## Cómo correrlo

```sh
cd .claude/worktrees/physica-opus55-production-465980/experiments/physica
npm ci            # si falta node_modules
npm run dev       # abre http://127.0.0.1:4210/
```

- **Arranque de evaluación:** `http://127.0.0.1:4210/?avenida`.
  - Borra la Bitácora y el encargo guardados.
  - Da la ciudad por vista y abre el arco y la reja.
  - Deja al explorador en el andén, frente a la calle.

  Es un atajo declarado para la evaluación, no parte del juego: la persona no pasó por la Orilla, la Terraza ni el Mirador.
  Borra lo guardado sólo la primera vez en esa pestaña: recargar (F5) durante la sesión conserva la Bitácora y el encargo. Para la persona siguiente, abrir una pestaña nueva.
- **Para probar el recorrido completo,** abrir sin parámetros en una ventana privada y jugar desde el principio. Anotar cuál de las dos cosas se hizo.
- `?fresh` sólo ignora la posición guardada. No borra la Bitácora ni el encargo.

## El recorrido esperado (para quien observa; no se le cuenta a quien juega)

1. **La plaza:** detrás del arco, una reja. «E Abrir la reja». La calle lleva a una avenida con un andén.
2. **El carro de cable:**
   - corre entre dos paradas a velocidad constante, movido por un cable que sale de la rueda de una casa de máquinas;
   - se sube con ▲ y se baja con ▼.
3. **El registrador del carro:** a bordo, con el carro parado, «E Registrar el viaje». Cada 0,5 s marca dónde va el explorador:
   - tiza en el cordón numerado del andén;
   - tinta en la cinta del carro;
   - la muesca del carro.

   La marca n tiene el mismo color en los tres.
4. **Dos observadores:** al llegar de un viaje registrado, un chico en la vereda de enfrente y una pasajera en el carro dicen, cada uno, cuánto se movió el explorador, y ella también cuánto se movió la vereda. Para el chico, +15 m; para la pasajera, 0 m, si viajó quieto. El chico se ve desde la parada este, no desde la oeste.
5. **La Bitácora (J):**
   - una nota para el primer viaje, otra para el primero caminado y otra para el primero hacia el oeste (con el signo);
   - la tabla del último viaje registrado: cordón = dónde está el 0 del carro + cinta.
6. **El jalón:** en la parada oeste hay un soporte. Se clava en el andén o en el carro, con su propia cinta con signo.
7. **El encargo de la vecina** (parada este):
   - pide que la última tiza de un viaje quieto caiga al pie de su jalón (21,5 m);
   - el poste de cada parada dice dónde para el cero del carro (4 m y 19 m), y una chapa en el carro dice los dos números y el encargo;
   - hay que ir parado en 2,5 m de la cinta;
   - después, ella corre su jalón a 20,3 m.

**Duración:** no medida con personas.

## Fallas conocidas (para no confundirlas con hallazgos)

**Sin verificar por nadie:**
- El sonido: el autor no puede escucharlo.
- Táctil y mando en un dispositivo real.
- Rendimiento en móvil.

**El diseño:**
- **Falta la transferencia** del bote, y no hay vectores en el mundo: sólo números con signo.
- **El encargo recompensa predecir, no lo obliga:** se puede tantear, porque ella dice cuánto faltó, y cada intento cuesta un viaje de ida y vuelta (unos 33 s).
- **Con el carro parado,** E arma el registrador antes que levantar el jalón.
- **El cero del cordón** queda fuera de cuadro en las paradas.
- **El chico** sólo se ve desde la parada este: después de un viaje hacia el oeste habla sólo la pasajera.
- **Las lecturas desde el jalón** de la primera y la última tiza no se rotulan en el mundo; están en la Bitácora.
- **«▲ Subir al carro»** puede quedar tapado por otros avisos.
- **Los números se muestran al decímetro.** La tabla muestra la rampa de arranque y de frenado: el cero del carro avanza 2,6 m en los primeros 2 s y 3,0 m cada 2 s en marcha.

**La simulación:**
- **A bordo se camina a media marcha** (1,5 m/s, la velocidad del carro). Es una ayuda declarada, que fabrica el caso «tiza quieta».
- **Los registros no se guardan al recargar.** El encargo sí.

## Qué observar (sin ayudar ni explicar)

Anotar el tiempo y lo que la persona dice en voz alta. Si se traba más de 2 minutos, anotar dónde y recién ahí dar una pista mínima (y anotarla).

1. ¿Descubre cómo subir al carro? ¿Cuánto espera en la parada?
2. ¿Arma el registrador? ¿Mira las marcas mientras viaja, o sólo después?
3. ¿Nota que la tinta queda en un lugar y la tiza se reparte? ¿Qué dice?
4. ¿Lee lo que dicen el chico y la pasajera? ¿Le parece que uno de los dos se equivoca?
5. ¿Camina sobre el carro en marcha? ¿Descubre la tiza quieta caminando contra la marcha?
6. ¿Toma un jalón? ¿Dónde lo clava? ¿Para qué cree que sirve?
7. **El encargo:**
   - ¿qué cree que pide la vecina, antes de abrir la Bitácora?
   - ¿usa el cartel o la chapa?
   - ¿predice, se alinea o tantea?
   - ¿cuántos viajes le lleva cada ronda?
8. ¿Abre la Bitácora? ¿Lee la tabla?

## Preguntas después de jugar (abiertas, en este orden)

1. Contame con tus palabras qué pasaba con las dos reglas, la del andén y la del carro. ¿Desde dónde cuenta el cordón?
2. El chico de la vereda dijo que te moviste 15 m y la pasajera, que no te moviste. ¿Quién tenía razón? ¿Por qué?
3. ¿Qué hacía el jalón? Si lo clavás en otro lugar, ¿qué cambia y qué no?
4. ¿Cómo hiciste para que tu tiza cayera en el jalón de la vecina? Si ella lo corriera a 22,0 m, ¿dónde te pararías?
5. Si caminás hacia atrás en el carro, tan rápido como el carro, ¿qué ve el chico de la vereda?
6. ¿Hubo algo que no entendiste o que te pareció injusto?
7. ¿Qué fue lo más lindo de ver o de hacer? ¿Y lo más aburrido?

## Registro (plantilla; una por persona)

```
Fecha · edad aprox. · experiencia con juegos (poca / media / mucha) · dispositivo y navegador · teclado / mando / táctil
Cómo se llegó a la avenida (jugando desde el inicio / ?avenida):
Subió al carro (min.):            Armó el registrador: sí / no (min.)
Comentó la tinta quieta / la tiza repartida: sí / no (frase):
Leyó a los dos observadores: sí / no (frase):
Tomó un jalón: sí / no · dónde lo clavó:
Encargo, ronda 1: intentos ___, método (predijo / se alineó / tanteó) · ronda 2: intentos ___
Pistas dadas (cuáles y cuándo):
Frases textuales:
Respuestas a las preguntas 1–7:
```

**Regla:** si no hubo sesión, no hay datos. Los resultados se guardan en `production/evaluaciones/` sin interpretar. Lo que se decida a partir de ellos va a DECISIONES.
