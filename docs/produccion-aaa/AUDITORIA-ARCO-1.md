# Auditoría del Arco I, jugado de punta a punta

11 oct 2026. Partida nueva desde la pantalla de título, con el nombre «Manuel», sin atajos: cada
banco se resolvió con clics en el navegador, como lo haría alguien que no sabe electricidad.
Probé algunos errores típicos a propósito: respuestas incorrectas, el orden al revés y reparar antes
de medir. Se incluyó el cajón opcional de Lumen.

## Veredicto

**El arco se termina sin bloqueos**, de la llegada al Portal a «Arco I · Completo», con las piedras
de freno, los conjuros, la cuenta de la vuelta y la regla de los nudos funcionando en el juego real.
No hubo errores de consola. Los diez bancos y el cajón se resolvieron en 3 a 10 gestos cada uno, casi
siempre al primer intento.

Lo más débil no es la dificultad, sino que **guía demasiado** en los primeros bancos. Además, hay dos
capítulos (Lago y Faro) donde los habitantes hacen el trabajo mientras el jugador mira. Encontré dos
problemas serios: en uno el juego pedía algo imposible y en otro la interfaz hacía caer en una
trampa. Los dos quedaron corregidos.

## Lo que corregí en esta pasada

| Dónde | Problema | Arreglo |
|---|---|---|
| Terrazas, Faro II (y todo medidor de corriente) | El paso pide «¿Quién toma más? El instrumento puede decirlo», pero sin «Ver números» el medidor decía «Hay paso» en todas las ramas: era imposible comparar | El medidor compara con lo que sale de la fuente: «Una buena parte ▮▮▮▮▯▯▯▯», «Muy poco ▮▯▯▯▯▯▯▯». En el Faro II se lee el 4 : 2 : 1 sin números |
| Todos los bancos con instrumento | El banco abre con el instrumento tomado; tocar su botón lo soltaba sin aviso y los bornes respondían «No te quedan cables» | El instrumento queda en la mano; se suelta con «Cables» |
| Calzada | El objetivo decía «Encontrá a Edda» hasta abrir la puerta y la brújula apuntaba al panel cerrado | Paso intermedio: «hay cierres en los dos postes y un puente de cobre que no figura en el dibujo», con la brújula en el puente |
| Lago | El jugador no hacía nada: Nereo cerraba las dos uniones en el diálogo | Nereo fija la bornera y deja el retorno al jugador; el objetivo y la brújula lo señalan |
| Manantial | El canto de Vega («primero el agua, después el eje») nunca se ponía a prueba | Si se acopla el eje antes del agua, la rueda arranca a tirones y Vega entiende para qué era el canto |
| Calzada | La nota de proporciones de Ohm repetía la misma frase larga en cada cambio de piedra | La explicación va una vez; después, sólo las dos corrientes |
| Comparar dos puntos | La palabra cambiaba alrededor de la mitad con la misma barra | La palabra sigue a la barra; cuatro de ocho rayitas se leen «La mitad de la fuerza» |
| Tarjeta de éxito | «Lo que aprendiste»: rótulo escolar | «Lo que vimos» |
| Cajón de Lumen | «la piedra rojo, rojo, negro»; Lumen decía «esperábamos» sobre la respuesta del jugador; la nota de Ohm tras la tercera piedra no ayudaba a deducir | «la piedra de anillos…»; «Dijiste «22 Ω»»; Ohm propone la piedra gemela y pide una predicción |
| Textos | Restos de la perilla («las dos posiciones»), Ohm hablando de sí en tercera persona, «cuántos ceros le siguen», «se calibra» en el Faro III | Corregidos |

## Por zona: lo que pasó

- **Portal.** Bronce − con Celda −, al primer intento. Ohm explica las cargas con la cadena de bicicleta:
  claro y memorable.
- **Taller.** Medí el cierre con Q antes y después. El banco: tramo 1, tramo 2, puente: tres gestos.
  «Lo que vio Ohm» es de lo mejor del arco (tela y cobre, por qué apagar la mesa).
- **Cajón de Lumen.** Pesé 22, 47 y 120 y fallé el acertijo a propósito. Lumen tapa la piedra hasta
  la respuesta y el error se anota sin castigo.
- **Calzada.** Con el puente de cobre golpeaba; 100, 47 y 22 Ω no alcanzaban; 10 Ω, firme. El paso
  por las piedras funciona.
- **Manantial.** Reparé el empalme antes de cerrar la cuenta de Vega: el juego lo maneja y pide medir
  el montaje nuevo. La cuenta queda sobre un circuito sano (11,83 V ≈ 12 V); la escena de los 7 V
  perdidos sólo aparece en «Lo que vio Ohm».
- **Castillo.** Cinco gestos. Ivara exige ver la enfermería encendida con la cocina aislada: buena
  prueba.
- **Terrazas.** Aquí estaba la trampa del medidor. Con el arreglo, el horno se ve como el que más toma.
- **Lago.** Era sólo diálogo; ahora el retorno es del jugador.
- **Faro.** I y II bien. En el II, Nereo anota la marca (elegí «un cuarto» y el libro registra el
  error). III con piedras: 10 Ω «se pasa un poco», 15 Ω «casi», 12 Ω dorada.

## Qué aprende alguien que no sabía nada

Circuito cerrado, conductor y aislante, continuidad, polaridad, resistencia y código de colores con
tolerancia, caída de tensión y ley de las mallas, paralelo, reparto de una línea (potencia), pérdidas
en el cobre, ley de los nodos, la ley de Ohm como proporción y el divisor con carga. Cada idea aparece
primero en el mundo, después en «Lo que vio Ohm» con los números de su montaje, y por último como
palabra del Instituto en la Bitácora.

## Pendiente (propuestas, no hechas)

1. **Bancos muy guiados al principio.** El Taller y el Castillo dicen el gesto exacto. Propuesta: que
   el primer paso pregunte («¿Cuál de los tres tramos?») y que el gesto quede para la pista.
2. **Lecturas de campo (Q) genéricas.** «El indicador de paso no responde en este tramo…» se repite en
   el Taller, la Calzada y el Castillo. En el puente de la Calzada dice «Ohm no consigue fijar una
   lectura», justo donde está la idea del cortocircuito. Merecen texto por objeto.
3. **Manivelas que unió un habitante.** En el Faro, una E sin querer abre la manivela que acaba de unir
   Nereo y nadie reacciona. Propuesta: que un habitante comente o que haga falta confirmar.
4. **Cuenta de Vega después de reparar.** Si se repara primero, la cuenta pierde la historia de los
   7 V. Propuesta: que Vega pida sumar antes del puente, o que la cuenta guarde también el montaje roto.
5. **Pequeños.**
   - Caminando con W, el jugador se mete en el seto a la salida del Portal. *(Revisado en
     [AUDITORIA-MAPA.md](AUDITORIA-MAPA.md): ya no ocurre, con W sola se sigue la curva.)*
   - La nota de lore del Taller queda tan cerca del cajón que E abre la nota.
   - En vista angosta, la placa de la Cocina tapa el botón × del cable.
   - La lectura del cierre del Taller conserva el título «Ajustar…» después de ajustado.
   - El cajón no tiene una pieza 3D propia en el mostrador.

## Lo que esta pasada no cubrió

- **Ritmo y cinemáticas reales:** el navegador de prueba dibuja a 3–5 cuadros por segundo; el
  movimiento se escaló sólo en la prueba.
- **Opcionales:** los secretos (0 recuerdos recuperados), las charlas con Ohm (O) y el mapa.
- **Plataformas:** el control táctil.
- **Final:** el regalo del final se eligió con la opción por defecto.
