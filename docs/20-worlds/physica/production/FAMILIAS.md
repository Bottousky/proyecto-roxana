# Physica — familias de conceptos

Formato por familia: concepto · condiciones del modelo · acción del jugador · error conceptual
a evitar · señal observable · prueba de transferencia · estado.
Los nombres de escenas son propuestas; los resultados educativos son los del contrato §5.

## 0. Condición del lugar (escena insignia: la cascada ascendente)
- **Concepto:** la aceleración efectiva depende del lugar, no del cuerpo. Cambiar de aceleración no cambia la velocidad de golpe.
- **Modelo:** regiones rectangulares con g propia y banda suave. Exterior g = −9,8. Sin rozamiento del aire para cuerpos de prueba.
- **Acción:** soltar esferas desde soportes dentro y fuera de la región; llevar y soltar una esfera en el borde; cruzar caminando.
- **Error a evitar:** «la cascada empuja» (es el campo, no una corriente); «al entrar se da vuelta la velocidad».
- **Señal:**
  - marcas cada 0,1 s;
  - plomadas que apuntan arriba, abajo o quedan flojas;
  - musgo y bufanda orientados;
  - polen que se acumula en el borde;
  - zumbido de las anclas.
- **Transferencia:** el Pozo. La misma regla en otra geometría, con dos límites: demasiado abajo se sale del campo y se cae; demasiado arriba no alcanza. **Implementada (iter 3).**
- **Anticipación:** el riel de B y la campana predicen el umbral de la cadena (iter 2).
- **Estado:** **IMPLEMENTADO (Hito A en curso)**.
  - Falta el acabado de arte.
  - Falta la amortiguación (decisión pendiente).
  - Falta la validación con personas.

## 1. Introducción: referencia, posición, desplazamiento, tiempo, unidades, vectores
- **Concepto:** la posición se describe respecto de una referencia. Dos observadores describen distinto un mismo transporte.
- **Modelo:** marcos de referencia con traslación uniforme.
- **Acción:** colocar referencias (jalones) y comparar lecturas desde un transporte y desde el suelo.
- **Error a evitar:** creer que hay una única descripción verdadera del movimiento.
- **Señal:** reglas graduadas (ya existe una junto al soporte A); marcas fijas en el suelo y en el transporte.
- **Transferencia:** describir el arco de agua desde un bote que avanza a la misma velocidad horizontal: verías sólo subir y bajar.
- **Estado:** EN CURSO (D21, iteración 16).
  - **Hecho:**
    - la avenida tras la reja de la plaza;
    - el carro de cable, con velocidad constante, el torno a la vista en la casa de máquinas, el cable que corre y paradas;
    - lo que va sobre el carro (el explorador, las esferas) viaja con él, con la velocidad del carro al dejarlo (el marco de la velocidad, D21);
    - las referencias en el suelo (cordón marcado cada metro) y en el carro (su regla);
    - el viaje con teclas.
  - **Hecho en la iteración 17 (D22):** el registrador del carro.
    - Dos registros físicos y simultáneos: tiza en el cordón y tinta en la cinta del carro, más la muesca del carro, emparejados por color.
    - El caso que no es trivial: caminar sobre el carro en marcha. Contra la marcha, la tiza se queda quieta y la tinta avanza.
    - El desplazamiento negativo hacia el oeste.
    - Las notas de la Bitácora, con los números de cada viaje.
  - **Hecho en la iteración 18 (D23):**
    - el jalón, un cero que se clava en el andén o en el carro, con su cinta con signo;
    - el encargo de la vecina: un viaje quieto cuya última tiza caiga al pie de su jalón. Recompensa predecir dónde ir en el carro (19,0 + lectura de la cinta) y después se corre a otro número.
  - **Falta, en orden:**
    - **la vista en tabla:** marca, t, cordón, cinta;
    - **una persona en el andén** como segundo observador;
    - **la transferencia del bote.**

## 2. MRU
- **Concepto:** a intervalos iguales, distancias iguales; velocidad = distancia / tiempo.
- **Modelo:** transportes con velocidad constante (impulso por el aparato visible, rozamiento compensado).
- **Acción:** preparar encuentros variando el punto de partida, la velocidad o el instante de liberación.
- **Error a evitar:** llamar MRU a cualquier movimiento suave.
- **Señal:** marcas equiespaciadas.
- **Transferencia:** la componente horizontal del arco de agua: sus marcas son equiespaciadas en x.
- **Estado:** PROPUESTA (el arco ya la contiene; no se enseña todavía).

## 3. Fuerzas y rozamiento
- **Concepto:** inercia, fuerza neta, masa frente a peso, equilibrio, contacto.
- **Modelo:** rozamiento de Coulomb con μ por superficie; las superficies motorizadas muestran su fuente.
- **Acción:** empujar cajas y esferas sobre superficies de distinto agarre, pendientes y plataformas.
- **Error a evitar:** el rozamiento negativo como fricción pasiva; «más pesado cae más rápido».
- **Señal:** marcas de deslizamiento, sonido de fricción, postura de esfuerzo.
- **Transferencia:** la misma caja en la región (el peso cambia, la masa no: empujarla de costado cuesta lo mismo).
- **Estado:** PROPUESTA. Hoy las esferas tienen deslizamiento con μ = 0,32; la rodadura no está modelada.

## 4. MRUV
- **Concepto:** aceleración constante frente a velocidad constante; el signo de a no es «frenar».
- **Modelo:** el actual (exacto para a constante).
- **Acción:** comparar trazas dentro y fuera de la región; inclinar planos.
- **Error a evitar:** «a negativa = frena».
- **Señal:** las trazas de A y B (las separaciones crecen; en la región, hacia arriba).
- **Transferencia:** en la región, un cuerpo que sube tiene a > 0 y acelera; afuera, uno que sube tiene a < 0 y frena.
- **Estado:** IMPLEMENTADO parcialmente: la Bitácora calcula a partir de las marcas. Sin puzzle propio.

## 5. Tiro vertical
- **Concepto:** ascenso, punto más alto, descenso. En el punto más alto a ≠ 0.
- **Modelo:** gravedad uniforme exterior.
- **Acción:** entregar un objeto a un receptor elevado.
- **Error a evitar:** «arriba la aceleración es cero».
- **Señal:** la plomada sigue colgando aunque la esfera esté quieta en el punto más alto; la traza se ve simétrica.
- **Transferencia:** la oscilación en el techo de la región (ya ocurre) como «tiro vertical invertido».
- **Estado:** PROPUESTA.

## 6. Tiro oblicuo
- **Concepto:** componentes independientes; altura de salida, dirección y rapidez.
- **Modelo:** el caso ideal sin resistencia y con g uniforme, primero. Después, con fuerzas adicionales, claramente distinguidas.
- **Acción:** lanzadores con ángulo y rapidez; receptores.
- **Error a evitar:** confundir la trayectoria ideal con la de campo alterado.
- **Señal:** traza con marcas, sombra en el suelo con marcas equiespaciadas.
- **Transferencia:** el arco de agua es un tiro oblicuo en campo alterado. Primero comparar con el arco de la caída familiar.
- **Estado:** PROPUESTA.

## 7. Trabajo, energía e impulso
- **Concepto:** intercambios, pérdidas, aportes externos.
- **Modelo:** energía potencial por región (en 1D el campo es conservativo; en 2D con regiones laterales no lo es, y el aparato aporta).
- **Acción:** rampas, contrapesos, resortes, frenado, choques.
- **Error a evitar:** energía como barra arbitraria; movimiento perpetuo gratuito.
- **Señal:** la esfera B vuelve a su altura de liberación (conservación, ya medible). Las anclas «consumen».
- **Transferencia:** usar la oscilación del techo para cronometrar.
- **Estado:** PROPUESTA (fenómeno presente, sin interacción).

## 8. Óptica
- **Concepto:** propagación, sombras, reflexión, refracción.
- **Modelo:** rayos 2D en medios con índice; el agua del arco como medio.
- **Acción:** espejos, prismas, receptores de luz.
- **Error a evitar:** confundir perspectiva de cámara con propiedad óptica.
- **Señal:** haces visibles en el rocío.
- **Transferencia:** el rayo que atraviesa el arco de agua se desvía (refracción, no gravedad).
- **Estado:** PROPUESTA.

## 9. Cargas y campos
- **Concepto:** atracción, repulsión, signo, intensidad, posición. Electrostática distinta de magnetismo.
- **Modelo:** fuentes puntuales con ley inversa del cuadrado, explícitas.
- **Acción:** colocar cargas, orientar imanes, observar respuesta.
- **Error a evitar:** «imanes mágicos»; duplicar Ohmdal.
- **Señal:** péndulos con carga que se orientan, como las plomadas.
- **Transferencia:** comparar un campo gravitatorio regional (uniforme) con uno de carga (depende de la distancia).
- **Estado:** PROPUESTA.

## Expansión identificada (no empezar hasta completar las anteriores)
Oscilaciones, ondas, sonido, fluidos, térmica.
