# Iteración 19 — dos observadores y la tabla (Hito B · B3 «Introducción», en curso) (evidencia)

**Resultado principal:** al llegar de un viaje registrado, dos personas describen el mismo movimiento de manera distinta, con los números del registro.
- **El chico de la vereda de enfrente:** «Desde la vereda: +15,0 m, en 10,5 s, hacia el este. El carro: +15,0 m».
- **La pasajera sentada en el carro:** «Desde el carro: 0,0 m, no te moviste. La vereda se fue 15,0 m al oeste».
- **Si se caminó,** la pasajera dice cuánto por la cubierta; si se caminó y se volvió al mismo lugar, dice eso, no «no te moviste».

**También:**
- **La Bitácora tiene la tabla del último viaje registrado:** cordón = dónde está el 0 del carro + cinta, fila por fila.
- **Una sola regla para todos los números mostrados:** al decímetro, con los empates redondeados siempre igual. La tabla, las notas, los globos y el encargo coinciden.
- **La línea del carro, a la vista a bordo:** una chapa en el carro dice dónde para su 0 en cada parada y el encargo de la vecina, justo donde se elige el lugar.
- **El arranque de evaluación `?avenida`** y el paquete `../../EVALUACION-INTRODUCCION.md`.

Diseño en `../../DECISIONES.md` D24. La revisión independiente y su respuesta, en `REVISION.md`.

## Secuencias con teclado real

**El registrador** (`scripts/registro.mjs`; `registro.json`):

| Cuadros | Qué muestran |
|---|---|
| `registro-12` | La llegada de un viaje quieto a la parada este: los dos globos, separados: el chico en la vereda, la pasajera en el banco. |
| `registro-13` | La Bitácora. |
| `registro-23` | La llegada de la vuelta, caminando sobre el carro: la pasajera, «+3,0 m hacia el este, por la cubierta», igual que la nota. |
| `registro-24` | A pie por el andén: el chico, en la vereda de enfrente. |

**El encargo** (`scripts/encargo.mjs`; `encargo.json`):

| Cuadros | Qué muestran |
|---|---|
| `encargo-11`, `12` | Llegada del intento 1. «Faltaron 0,6 m →», con los dos observadores. |
| `encargo-14` | **La Bitácora con la tabla:** la cinta, 1,9 en todas las filas; el 0 del carro avanza 2,6 m en los primeros 2 s y 3,0 m cada 2 s; el cordón es su suma. Coincide con el encargo («tu última tiza en 20,9 m») y con el jalón (5,9 − 9,9 = −4,0). |
| `encargo-16`, `22`, `23` | En 2,5 m de la cinta; el intento 2 cumple. |
| `encargo-28`, `30` | La ronda 2, cumplida; la Bitácora completa. |

**Otras tomas:**
- **`llegada-tres-globos`:** la llegada de un intento del encargo, con el código final. Los tres globos se leen sin taparse: el chico, la pasajera y la vecina («Faltaron 0,6 m → · Tu tiza: 20,9 m · mi jalón: 21,5 m»). Preparación declarada: a bordo en 1,85 m y el encargo pedido; después, E y el viaje.
- `intermedio-globo-de-la-vecina-cortado`: un ajuste intermedio dejaba su globo fuera de cuadro.
- `chapa-de-la-linea-a-bordo`: a bordo, en la parada oeste, la chapa «LÍNEA DEL CARRO · ← oeste 4 m · este 19 m →» y el encargo (preparación declarada).
- `arranque-de-evaluacion-avenida`: `?avenida`.
- **Intermedios:**
  - `intermedio-observadores-apilados`: el chico detrás del globo de la pasajera;
  - `intermedio-chico-en-el-anden-fuera-de-cuadro`;
  - `intermedio-tabla-con-cinta-que-titila`;
  - `intermedio-chapa-oeste-cortada`.

## Técnico (medido)

- **`npm test`: 106/106.** Pruebas nuevas:
  - **la tabla:** una fila cada 2 s y la llegada; cada fila suma; la cinta constante, quieto;
  - **lo que dicen los dos observadores**, quieto y caminando;
  - **caminar y volver** no es «no te moviste»;
  - **una sola regla, en cuatro posiciones:**
    - la cinta constante;
    - el 0 avanza 3,0 cada 2 s en marcha;
    - la nota coincide con la primera y la última fila, y el globo con la nota.
- **Recorrido con teclado completo:** ver «Recorrido».
- **El arranque `?avenida`:** deja al explorador en el andén (x 11,05, z −36,6) con la reja abierta y la Bitácora limpia (`arranque-de-evaluacion-avenida`).

## Recorrido

**Recorrido con teclado completo, desde un inicio limpio** (`report.json`): pasa, con 0 errores.
- El paso «calle y carro» habla con la vecina, va en 2,49 m de la cinta, arma el registrador y cumple la ronda 1 del encargo.
- **Paso «rendimiento»:** p99 y máximo de 16,8 ms.

**Dos corridas anteriores se cortaron en el primer tramo,** caminando hacia el soporte A: 2,5 y 4,1 s de simulación en 180 s de reloj.
- **Lo que pasaba en ese momento:**
  - una sesión de otro proyecto corría un recorrido largo en Chrome, con una carga de hasta 48;
  - en el panel del navegador de la app estaba abierto el juego, dibujando.
- **Prueba de que no era el juego:** con el mismo código, el arranque reproducido aparte avanzaba 3 s por cada 3 s.
- **Con el juego del panel pasado a segundo plano,** el recorrido pasó.
- **Queda como falla del entorno de medición:** no dejar el juego abierto en el panel mientras corre un recorrido.

## Lo que sigue

- **La transferencia** (el bote junto al arco de agua, o un equivalente), con vectores en dos dimensiones. Hace falta antes de declarar la familia «pendiente de validación humana».
- **Declarado:**
  - el chico sólo se ve desde la parada este;
  - las lecturas desde el jalón de la primera y la última tiza no se rotulan en el mundo;
  - «▲ Subir al carro» puede quedar tapado;
  - el texto de los carteles se dibuja sin esperar a que cargue la fuente.
