# Iteración 18 — el jalón y el encargo de la vecina (Hito B · B3, en curso) (evidencia)

**Resultado principal:** en la parada este, una vecina con su jalón clavado en el cordón (21,5 m) pide que la última tiza de un viaje hacia el este, hecho quieto, quede al pie de su jalón.
- **Se puede predecir:**
  - el poste de la parada está donde se detiene el cero de la cinta del carro («aquí para el 0 del carro: 19 m ↓»), sobre una chapa amarilla con «0»;
  - hay que ir parado en 2,5 m de la cinta.
- **Si se falla,** su globo dice «Faltaron 0,7 m →».
- **Si se acierta,** levanta la bandera y corre su jalón a 20,3 m: «¿Y ahora?».
- **Caminar durante el viaje no vale:** sólo cuenta un viaje con toda la tinta en una columna.

**Además, el jalón del explorador:** se toma en un soporte, se clava en el andén o en el carro y despliega su propia cinta con signo (−5…0…+5). La Bitácora muestra que, desde él:
- **en el andén,** las posiciones son otras pero el desplazamiento es el mismo que en el cordón;
- **en el carro,** es el de la cinta.

Cambiar el cero cambia las posiciones; cambiar de marco cambia los desplazamientos.

Diseño en `../../DECISIONES.md` D23. La revisión independiente (dos pasadas) y su respuesta, en `REVISION.md`.

## Secuencia con teclado real

Script: `scripts/encargo.mjs`. `encargo.json` trae el estado en cada cuadro, las notas y los intentos.

**Preparación declarada:** la ciudad vista, el arco y la reja abiertos, el explorador junto a la vecina.

| Cuadros | Qué muestran |
|---|---|
| `encargo-00`, `01` | «E Hablar con la vecina»; su pedido en el globo. |
| `encargo-02`, `03`, `05` | El soporte de jalones; con el jalón en la mano; clavado junto al 10 del cordón (9,9), con su cinta −5…+5. |
| `encargo-06`, `12` | Intento 1, parado en el medio del carro (1,85 m de la cinta). Llegada: la última tiza en 20,85 m; su globo: «Faltaron 0,7 m →»; el recuadro al pie de su jalón, vacío. |
| `encargo-13` | La Bitácora: el intento, sin la respuesta. |
| `encargo-15`, `21`, `22` | Intento 2, en 2,45 m de la cinta. La última tiza cae en el recuadro: «¡Justo ahí! ¿Y ahora en 20,3 m?», con la bandera. Su jalón sigue en 21,5 mientras el carro espera: se corre cuando el carro sale. |
| `encargo-23`, `27` | Ronda 2: en 1,33 m de la cinta, en la parada oeste (el globo queda fuera de cuadro ahí); la tiza en 20,33 m, cumplido. |
| `encargo-28`, `29` | La Bitácora: el encargo, los intentos, «19,0 + 2,5 = 21,5 m» y «Otra vez, en otro lugar». |

**Otras tomas:**
- `vista-jalon-de-la-vecina` (cámara libre): su jalón en 20,3 con el recuadro y la última tiza adentro; la chapa amarilla «0» en 19.
- **Intermedios:**
  - `intermedio-sin-globo-ni-recuadro`: la primera versión, donde el encargo era sólo texto;
  - `intermedio-jalon-de-la-vecina-perdido-al-unir`: al unir la geometría estática, el grupo que se mueve con el blanco quedó horneado en otro lugar.

## Técnico (medido)

- **`npm test`: 102/102.** Siete pruebas en `jalon.test.js`:
  - las paradas dejan el cero del carro en 4 y 19 m;
  - tomar, clavar (donde está el explorador, a 0,1 m del cordón) y levantar;
  - el jalón en el andén: las lecturas corridas y el mismo desplazamiento, con la nota;
  - el jalón en el carro: desplazamiento 0, con la nota;
  - **el encargo:**
    - un viaje quieto en 1,8 falla (−0,7 m, sin la respuesta) y en 2,5 cumple;
    - después, en 2,5 ya no sirve y en 1,3 cumple la ronda 2;
  - un viaje caminando no cuenta, aunque su última tiza caiga en el jalón; hacia el oeste tampoco;
  - con el carro esperando, el registrador va antes que levantar el jalón; llevado de vuelta a la plaza, el jalón vuelve al soporte.
- **Recorrido con teclado completo, desde un inicio limpio** (`report.json`): ver «Recorrido».

## Recorrido

**Recorrido con teclado completo, desde un inicio limpio** (`report.json`): pasa, con 0 errores. En el paso «calle y carro», después de la reja:
- ▶▲ hasta la vecina: «Hablar con la vecina» y E;
- ◀ a la parada oeste; espera el carro; ▲ a bordo;
- ▶ hasta 2,46 m de la cinta; E arma el registrador; el viaje quieto;
- **el encargo se cumple:** ronda 1, un intento;
- el registro: 22 marcas, +15 m contra 0 m;
- de vuelta a la plaza y a la Terraza.

**Paso «rendimiento»:** p99 de 16,8 ms.

Corrió antes del último ajuste (la segunda pasada: el jalón de la vecina se corre al salir el carro, el globo y la cinta). Después, la secuencia `encargo.mjs` se repitió entera con el código final.

## Lo que sigue (declarado; ver `REVISION.md`)

- **Cómo se resuelve:** el encargo se puede resolver tanteando, porque el globo dice cuánto faltó. Predecir ahorra viajes: lo permite y lo recompensa, no lo obliga.
- **En la parada oeste,** donde se elige el lugar, el pedido y el 19 quedan fuera de cuadro.
- **Con el carro esperando,** E arma el registrador antes que levantar el jalón.
- **La cinta del jalón** es de ±5 m. Las lecturas de la primera y la última tiza desde el jalón no se rotulan en el mundo.
- **La familia sigue con:**
  - la vista en tabla;
  - un segundo observador en el andén;
  - vectores más allá del desplazamiento con signo;
  - la transferencia del bote.
- **El recorrido completo** va en 2,5 m por guion: prueba que el recorrido funciona, no que se aprende.
- **Sin prueba con personas.** A preguntar:
  - qué pide la vecina;
  - qué cartel usaron;
  - si predijeron, alinearon o tantearon;
  - qué creyeron que hacía el jalón.
