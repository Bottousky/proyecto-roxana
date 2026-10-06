# Iteración 08: revisión independiente de la vegetación y respuesta

**Quién revisó:** un subagente con contexto separado, en dos pasadas.
- **Primera pasada:** comparó el pasto de conos (`antes-*`) con la primera versión de las plantas pintadas (`intermedio-*`, v3).
- **Segunda pasada:** verificó las correcciones sobre la v6.
- Las tomas `despues-*` son la v7, que responde a la segunda pasada.

**Veredicto de la primera pasada:**
- **Arriba, en la cámara de juego:** mejor que antes. Las plantas tienen identidad y entran en la paleta de D7.
- **De cerca:** se leen como recortes de papel.
- **Su única función física** (hacer descubrible el borde de la región) no se cumplía.

| # | Hallazgo (primera pasada) | Respuesta | Estado tras la verificación |
|---|---|---|---|
| 1 | El giro de los helechos no se leía. La tarjeta tenía un solo tramo y sólo se inclinaba. Adentro el doblez era 0,41 veces el de afuera. El espejado al azar agregaba variación ajena al campo. | **Forma:** arco de curvatura constante con 8 tramos, que conserva el largo de la fronda, más una bisagra en la raíz (35 %). El giro de la punta se satura en 1,5·tanh(g/3): ~86° colgando y ~75° adentro.<br>**Sin espejado** en las paredes.<br>**Medido en el navegador:** +1,3 rad adentro de la región y −1,5 rad arriba.<br>**Pruebas:** `vegetation.test.js`. | **corregido** de cerca (`helecho-arriba` contra `helecho-adentro`, `despues-v2`); **débil** en la cámara de juego |
| 2 | Los helechos se amontonaban sobre los instrumentos: detrás de cada rótulo de la regla de la sima, sobre los anillos, entre los peldaños del Pozo. | Helechos sólo en la cara de la Terraza, la que cruza el borde de la región, detrás del plano de medición. La pared izquierda de la sima y el Pozo quedan limpios. | **corregido** (el borde del Pozo se queda sin señal vegetal; quedan las plomadas y el musgo) |
| 3 | Helechos delante de la columna de agua. | Más cortos arriba del borde, donde pasa la cresta; una capa detrás del carril del agua. | **parcial** (alguna fronda roza el borde derecho de la columna) |
| 4 | Tarjetas planas, sin sombra, más oscuras que el piso. | Sombra proyectada con un material de profundidad que respeta el alfa, normales inclinadas hacia el cielo y la base más oscura. | **corregido** |
| 5 | Bordes escalonados; los bordes del musgo y de la suculenta conservaban el halo de color de la fuente. | `alphaToCoverage`; los 54.163 píxeles de borde recoloreados (`scripts/hoja-limpiar.mjs`); textura premultiplicada. | **corregido** |
| 6 | Repetición: un seto continuo de juncos y pasto alto; plantas sueltas como confeti; el musgo se veía como grumos marrones. | Matas mixtas de 3 a 7 plantas, más densas cerca de los labios. Los juncos en matas, con huecos. Ancho variable independiente del alto, una leve deriva de tono y el musgo más verde. | **corregido** |
| 7 | Plumas detrás de los instrumentos: la plomada de la Terraza y las esferas. | No crece ninguna planta alta a menos de 0,6 m de un soporte, del mástil, de una campana o de la mesa. | **corregido** |

**Defectos que encontró la segunda pasada, corregidos en la v7:**
- **Helechos clonados en la cara**, a 0,5 m exactos: ahora hay variación de separación (±0,12 m) y de tamaño, y una inclinación propia de cada raíz.
- **Menos acentos de flores:** ahora pesan más en el reparto.
- **El anillo del borde, tapado por los helechos que cuelgan:** ahora la banda de arriba empieza en 3,9 m y la capa de atrás termina en 2,3 m.

**Sin resolver:**
- **Brillos en las puntas** de las hojas finas en la cámara de juego (menor).
- **El giro de los helechos en la cámara de juego** se lee si uno lo busca, pero no llama la atención. Ahí el borde lo siguen marcando con más fuerza el musgo, las plomadas y el polen.
- **El estilo de otras piezas:** las manchas planas de verde del suelo y las barbas de musgo escalonadas quedan, al lado de las plantas pintadas, como un estilo más barato.
