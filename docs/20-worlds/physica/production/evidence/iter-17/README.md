# Iteración 17 — el registrador del carro: dos registros del mismo viaje (Hito B · B3, en curso) (evidencia)

**Resultado principal:** el carro lleva un registrador. A bordo, con el carro parado, «E Registrar el viaje». Durante el viaje, cada 0,5 s y al llegar, marca dónde está el explorador en dos registros físicos a la vez:
- **tiza en el cordón del andén** (el marco del suelo);
- **tinta en la cinta de bronce del carro** (el marco del carro);
- **además, el carro deja su propia muesca en el cordón** en cada marca: un triángulo en el cero de su cinta. De la muesca a la tiza hay exactamente la lectura de la cinta, y un hilo las une.

La marca n tiene el mismo color en los tres registros, en un ciclo de seis colores: así se emparejan.

**Lo que se ve:**
- **Parado sobre el carro:**
  - la tiza queda espaciada a lo largo del cordón;
  - la tinta queda toda en el mismo lugar de la cinta, con su cuenta (×12 en la vista, ×22 en el viaje completo).
- **Caminando contra la marcha,** al paso cuidadoso de a bordo, igual a la velocidad del carro:
  - la tiza se apila en un lugar (×4);
  - la tinta se reparte 0,75 m por marca.
  - Es el espejo del viaje parado.

La Bitácora escribe lo que dice cada registro con los números del viaje. La suma y el signo se explican la primera vez que aparecen, en la nota que sea.

Diseño en `../../DECISIONES.md` D22. La revisión independiente (dos pasadas) y su respuesta, en `REVISION.md`.

## Secuencia con teclado real

Script: `scripts/registro.mjs`. `registro.json` trae el estado en cada cuadro, el último registro y las notas.

**Preparación declarada:** la ciudad vista, el arco y la reja abiertos, el explorador en el andén, en la parada de 5 m.

| Cuadros | Qué muestran |
|---|---|
| `registro-00`, `01` | A bordo: «E Registrar el viaje · ▼ bajar». Armado, luz ámbar. |
| `registro-04`, `08` | Hacia el este, parado: tiza, muesca y tinta en cada marca. |
| `registro-12` | **La llegada.** En el cordón, tiza cada 0,75 m con la muesca del carro delante. En la cinta, una sola columna de tinta. |
| `registro-13` | Armado otra vez: el registro anterior sigue a la vista hasta que arranca el viaje. |
| `registro-15`, `16`, `17` | Hacia el oeste, ▶ contra la marcha: la tiza se apila (×4) y la tinta avanza por la cinta. |
| `registro-20`, `23` | El resto del viaje y la llegada: la tinta, repartida y luego apilada. |
| `registro-24` | **La Bitácora:**<br>«Dos registros del mismo viaje»: +15,0 m en el cordón y 0,0 m en la cinta, «todas las marcas en el mismo lugar».<br>«Caminando sobre el carro»: 4 marcas de tiza quedaron en el mismo lugar («caminabas tan rápido como el carro, al revés»), −15,0 + (+2,9) = −12,1 m, y por qué el desplazamiento es negativo. |
| `registro-26` | A pie por el andén: el registro del suelo. |

**Otras tomas:**
- `vista-cordon-con-tiza`: el cordón desde arriba (cámara libre), con la tiza, las muescas y el ×4.
- **Intermedios:**
  - `intermedio-tiza-blanca-y-tinta-fina`;
  - `intermedio-tinta-en-una-sola-barra`: 22 marcas que se leían como una raya de la regla;
  - `intermedio-sin-emparejar-y-caja-en-el-paso`: dos colores alternados (paridad, no emparejamiento) y la caja del registrador donde camina el explorador.

**El último registro** (`registro.json`), la vuelta caminando contra la marcha: 22 marcas.

| Registro | Inicio | Final | Desplazamiento |
|---|---|---|---|
| Cordón | 18,51 m | 6,39 m | −12,12 m |
| Cinta | 0,31 m | 3,19 m | +2,88 m |
| Carro | 20 m | 5 m | −15 m |

## Técnico (medido)

- **`npm test`: 95/95.** Ocho pruebas en `registro.test.js`, con la Bitácora real:
  - **parado:**
    - una marca cada 0,5 s, sin duplicar la de llegada;
    - ninguna tiza en el mismo lugar;
    - la tiza cada 0,75 m en marcha;
    - la tinta, inmóvil;
    - +15 contra 0, y la nota;
  - **caminando:** Δcordón = Δcarro + Δcinta, y la nota;
  - **hacia el oeste:** −15 m, y la nota explica el signo;
  - **primer viaje hacia el oeste y caminando:** la primera nota trae la suma y el signo;
  - **contra la marcha, a la velocidad del carro:** la tiza no se mueve (menos de 5 cm por marca) y la tinta retrocede 0,75 m por marca. Prueba la cinemática, no la definición de las lecturas;
  - **el registro anterior** queda hasta que arranca el viaje nuevo;
  - **al bajar durante el viaje,** el registro se corta, sin nota. El aviso no aparece mientras el carro anda;
  - **un registro cortado sigue cortado:** un solo evento, y al volver a subir (en marcha o en una parada) no se reanuda ni escribe nota. Con el arreglo deshecho, la prueba falla.
- **Recorrido con teclado completo:** ver «Recorrido».
- **Sonido** (armado, arranque, tic de cada marca, fin, corte): no verificado de oído.

## Recorrido

**Recorrido con teclado completo, desde un inicio limpio** (`report.json`): pasa, con 0 errores.
- **El paso «calle y carro»:**
  - a bordo, se ofrece «Registrar el viaje» y el explorador lo arma con E;
  - durante el viaje se toman 22 marcas;
  - al llegar: +15,0 m en el cordón y 0,0 m en la cinta, y la Bitácora agrega «registro»;
  - después, la vuelta a la plaza y a la Terraza.
- **Paso «rendimiento»,** en la corrida final, posterior a todas las correcciones: p95 de 16,7 ms; p99 y máximo de 33,4 ms (unos pocos cuadros de dos vsync en 6 s); 0 pasos perdidos.
  - La corrida anterior, sin los últimos cambios de dibujo (hilos y colores por marca), dio p99 de 16,8 ms.
  - No hice un A/B de esa diferencia. En la iteración 16 la misma firma apareció igual en HEAD con la máquina compartida cargada; queda declarada, no atribuida.
- Captura del viaje: `ruta-14-a-bordo-del-carro`.

## Lo que sigue (declarado)

- **El jalón:** mover el origen cambia las posiciones, no los desplazamientos. Hoy los dos ceros son fijos.
- **Un encargo que exija predecir en un marco.** Por ejemplo: «que tu última tiza quede en el jalón del cordón 21,0»; o «que tu tiza quede tres veces en el mismo lugar».
- **La vista en tabla** (marca, t, cordón, cinta), con la resta cordón − cinta = la posición del carro.
- **Una persona en el andén** como segundo observador.
- **La transferencia del bote.**
- **La media marcha a bordo** es una ayuda de diseño que fabrica el caso «tiza quieta»; la nota lo dice.
- **El cero del cordón** está 4 m al oeste de la primera parada, rotulado pero fuera de cuadro en las paradas.
- **Los registros no se guardan al recargar.**
