# Physica — decisiones

Cada decisión dice qué se eligió, por qué y qué la invalidaría.

## D1 · Tecnología: Three.js + simulación propia, entrada aislada (2026-10-05)

- **Elegido:** `experiments/physica/`, Vite + Three.js 0.186, módulos JS, pruebas con `node:test` y recorridos con Playwright usando el Chrome del sistema.
- **Por qué:** el usuario pidió no heredar las decisiones técnicas del repo. Por mérito propio:
  - control total de shaders para el agua protagonista;
  - la misma escena sirve para la lectura lateral y para la exploración 3D posterior, sin cambiar de motor;
  - el runtime es liviano para móvil (≈170 kB gzip con todo el juego actual);
  - la simulación es JS puro, sin DOM, así que se prueba en Node.
- **Física propia, no de motor:** los cuerpos experimentales necesitan reproducibilidad exacta y comparación con soluciones cerradas. Un motor genérico no garantiza ninguna de las dos.
- **Lo invalidaría:** necesitar colisiones complejas (pilas, rotación de cuerpos rígidos) en los que un motor externo demuestre ventaja con una prueba jugable.

## D2 · Modelo de campo (`src/sim/field.js`)

- Cada región es un rectángulo con una aceleración propia `g`.
  - Su banda de transición tiene ancho `band` y está centrada en el borde. El peso pasa de 0 a 1 con un *smoothstep* de la distancia firmada, así que no hay activación por píxel.
  - En el borde geométrico el peso vale 0,5.
- **Superposición:** las regiones se aplican por `priority` creciente. Cada una mezcla la aceleración acumulada hacia la suya según su peso, y el resultado es continuo.
- **Cuerpos extensos:** reciben el promedio del campo en el centro y en los centros de sus cuatro cuadrantes. Un cuerpo parcialmente dentro siente una fracción.
- **Alcance:** el campo actúa sobre todo lo que está en el espacio: agua, esferas, explorador, musgo, plomadas, polen y bufanda. No hay excepciones para el avatar.
- **Corriente frente a campo:** el agua sube porque está en el campo, no por una corriente. El arrastre del aire existe sólo en las partículas (polen, rocío, niebla) y está separado del campo.

## D3 · Integración y autoridad (`src/sim/world.js`)

- **Paso fijo y método:** paso fijo de 1/120 s con Verlet de velocidad.
  - Es exacto para aceleración constante, así que la caída libre coincide con `y₀ − ½gt²` hasta 1e-9 (probado).
  - Es reversible: la primera versión muestreaba la aceleración al inicio del paso y **bombeaba ~0,1 m de energía por rebote** al cruzar la banda. Una prueba lo detectó y se corrigió.
- **Autoridad única por cuerpo:**
  - los cuerpos libres los integra la simulación;
  - los sostenidos los posiciona su sostén (mano, soporte o mesa);
  - el carrete arrastra a velocidad constante.
- **Representación:** la escena interpola entre los dos últimos estados y nunca mueve un cuerpo.
- **Pausa al perder foco:** se descarta el tiempo acumulado, así que no hay recuperación a saltos. Se procesan como máximo 12 pasos por cuadro.

## D4 · Explorador

- **Sin salto.** La región es la forma de subir; el salto trivializaría el fenómeno.
- **Locomoción y ayudas:**
  - con apoyo, una aceleración horizontal hacia la velocidad objetivo (3 m/s, tope 22 m/s²);
  - en el aire, una **ayuda de dirección declarada**: sólo horizontal, tope 3,5 m/s² y sólo con entrada. Sin entrada no hay ayuda y conserva su velocidad.
- **El explorador no es instrumento de medida.** Las trazas y notas usan cuerpos de prueba.
- **Orientación:** el avatar no se invierte dentro de la región, para mantener legibles los controles. La gravedad se expresa en postura (brazos arriba, piernas recogidas), expresión, bufanda y mechón, que se rigen por el campo, y en sonido.

## D5 · Carriles 2.5D

- **Carril 0:** el camino del explorador.
- **Carril 1 (z = −0,5):** las esferas de los soportes.
- **Quién choca con quién:** los cuerpos sólo chocan con cuerpos de su carril. La roca choca con todos.
- **Origen:** en la primera prueba con teclado, el explorador empujó la esfera del soporte A hasta trabarla y quedó bloqueado en x ≈ −7.
- **Las esferas sueltas** descansan guardadas sobre la mesa (detrás del camino) hasta que el explorador las levanta.

## D6 · Escena insignia: parámetros

- **Región:** x ∈ [0; 4,5] m, y ∈ [−3,4; 3] m, g = +4,0 m/s², banda de 0,6 m. Exterior: −9,8 m/s².
- **Arroyo:** sale del borde de la Orilla a 2,6 m/s. Su arco se integra con el mismo campo, sube 1,2 m sobre el borde superior y baja en la Terraza (x ≈ 6).
  - Es la trayectoria que sigue un cuerpo que sale del borde a esa velocidad. **La escena muestra su propia respuesta en agua.**
- **Energía:** el campo lo sostienen cuatro anclas de latón con conductos que se pierden en la roca, hacia algo que no es este paisaje.
  - El agua no cierra un ciclo: viene de una caída familiar y se va por otra.
  - No hay movimiento perpetuo gratuito.
- **Límite del techo:** un cuerpo que sale por arriba conserva su velocidad. Afuera frena con −9,8 y vuelve a entrar bajando. Sin rozamiento oscila sin perder energía (modelo ideal declarado). El explorador sale de esa oscilación con la ayuda de dirección.

## D7 · Gramática visual (propuesta)

- **Estratos:** sedimentarios terracota, ocre y crema, cortados como una maqueta geológica.
- **Agua:** aguamarina, como protagonista.
- **Instrumentos:** latón, madera aceitada y esmalte crema.
- **Vegetación:** musgo en barbas y pasto que se orientan con la gravedad local.
- **Cielo:** de damasco a verde agua.
- **Lejanía:** mesetas en bruma y, detrás, apenas, una línea de torres ordenadas.
- **Paleta del explorador:** abrigo azul petróleo y bufanda azafrán, para separarse de la roca.

## D8 · Fuentes tipográficas y assets

- **Fuentes:** Fraunces e Inter vía `@fontsource` (licencia OFL), empaquetadas. No hay red en tiempo de ejecución.
- **Geometría, materiales y sonido:** procedurales.
- **Imágenes generadas:** desde la iteración 04 hay imágenes generadas con el `image_gen` de Codex (vía CLI, a pedido del usuario): textura de estratos, capas de fondo y retrato. Ver `art/PROCEDENCIA.md`.

## D9 · Rediseño del cruce: más abajo, más alto (iteración 02)

**El problema:** el arco de agua salía del borde a la misma velocidad que el explorador y dibujaba su ruta. Cruzar no exigía anticipar y no se podía fallar (revisión de la iter 1, hallazgo 1).

**Elegido:**
- La Terraza sube a 4,4 m y la región sigue terminando en 3 m.
  - En la región, un cuerpo sube sobre el borde superior (a/g)·(3 − y₀).
  - Desde el borde de la Orilla, los pies del explorador llegan a ~3,45 m: falla segura, con marca de tiza y nota «No alcanzó».
- Una **cadena** permite bajar dentro de la región y elegir dónde soltarse.
  - Desde ≈ −0,75 m o más abajo se llega (con el agarre de borde); desde −0,5 m o más arriba, no.
  - Mientras el explorador está en la cadena, sus manos son la autoridad: el campo no lo integra. Al soltarse, la velocidad es cero.
- El **soporte B** tiene un riel con pinza ajustable (▲▼, 0,5 m) y una **campana** a la altura de la Terraza.
  - La esfera la hace sonar desde −1 m o más abajo. Es el mismo umbral que lleva al explorador (equivalencia: el campo no distingue masas).
  - Así el experimento seguro predice el propio cruce.
- **El agua ya no sale del borde:** se va por una reja, brota en la poza del fondo de la sima y, desde ese inicio más profundo, es lo único que cresta sobre la Terraza.
  - Enseña la regla («más abajo, más alto») sin dibujar la ruta del explorador.
- El límite derecho de la región pasa a x = 4,8, dentro de la roca de la Terraza, para que el campo pleno llegue a su pared.
  - Con el límite en 4,5, la banda lateral restaba altura junto a la pared y volver desde la Terraza fallaba.
- La cadena cuelga a 0,92 m del borde: así el cuerpo del explorador queda fuera de la banda izquierda.
  - Con 0,62 m, su cuarto izquierdo sentía 3,89 m/s² en lugar de 4,00, y la prueba de equivalencia con la esfera falló.

**Límite conocido:** bajar hasta el fondo de la cadena siempre funciona. La transferencia (A9) debe crear un caso donde «lo más profundo» no sea siempre lo correcto.

## D10 · Transferencia: el Pozo y el Mirador (iteración 03)

**El problema:** en la cascada, «lo más profundo» siempre gana (revisión de la iter 2, hallazgo 1).

**Elegido:** la misma regla en otra geometría, sin explicarla de nuevo, con una ventana de dos límites.
- **El Pozo** es un pozo de 1,6 m en la Terraza, con agua al fondo, y tiene su propia región (+4 m/s²).
  - La región va de y = 1,0 hasta el nivel de la Terraza.
  - El Mirador (5,15 m; su línea, a 5,25 m) está del otro lado.
- **Los tres resultados**, según dónde se suelta el centro del cuerpo:
  - por debajo de ~1,15 m (donde la banda inferior ya tira hacia abajo) cae al agua;
  - entre ~1,2 y ~2,3 m llega al Mirador (rótulos 1,5 y 2 dentro);
  - más arriba no alcanza y vuelve a la Terraza.
- **El soporte P** tiene riel y campana en la línea del Mirador, y predice exactamente esos mismos límites con una esfera, sin arriesgar al explorador.
- **Por qué no hay salida «por abajo» que funcione:** el fondo de la región es un máximo de energía potencial. Justo por encima se sube con la mayor energía posible; justo por debajo se cae.
- **Cómo se descubre el límite inferior sin caerse:**
  - un mástil de plomadas en el pozo (las de abajo cuelgan y las de arriba apuntan hacia arriba);
  - musgo;
  - dos caños que gotean: en el de arriba las gotas suben, en el de abajo caen.
- **La caída al agua es segura:** desde el pie de la cadena se vuelve a subir, y R devuelve a la Terraza (el agua no cuenta como apoyo firme). En el aire, junto a una cadena, uno se puede agarrar de ella.
- **Plano de medición único:** todo lo numérico (números, tiza, líneas) va en z = 0,08. En el pozo la cámara mira casi a nivel, para que la profundidad no desplace alturas (paralaje).
- **Paso de escalón:** asistencia declarada de 0,36 m al caminar, para los escalones del Mirador. Los escalones son más anchos que el explorador.
- **La vista del Mirador:**
  - la primera vez que se llega, la cámara sube y muestra la ciudad detrás de las mesetas;
  - las mesetas lejanas se abrieron en un valle para que esa línea de visión exista sólo desde ahí.
  - Una primera versión afirmaba en la Bitácora algo que no se veía. Se corrigió la geometría y se verificó con captura.
- **Amortiguación:** se decidió **no** agregarla todavía. El modelo de la Escena A sigue siendo ideal (sin arrastre), declarado así.
  - En el Pozo, un intento corto vuelve solo a la Terraza (el techo de la región está a su nivel), así que la oscilación eterna no bloquea.
  - Sigue abierta para la cascada (A20).

## D11 · Agua con volumen, del mismo campo (iteración 05)

- **Forma:** sigue saliendo del campo. Cada chorro es la trayectoria de una parcela integrada con `ballisticPath`.
- **Sección por continuidad:** A·v = constante. El grosor va como √(v_ref/v), acotado a 0,6–1,45: la columna se ensancha donde es lenta (el afloramiento y la cresta) y se afina donde es rápida. Antes el mínimo estaba en 0,35 y la columna parecía una manguera.
- **Cuerpo y velo:** un tubo 1,55 veces más ancho cuyos fragmentos sólo sobreviven como vetas y espuma. Donde hay más espuma quedan menos jirones, pero más blancos: el agua se rompe en la cresta sin simular gotas.
- **Ondas en la superficie:** desplazadas con ruido en (aT − tiempo), así viajan a la velocidad de la parcela, igual que las vetas.
- **Pozas:** las ondas se alejan del afloramiento o del impacto. La opción `radial` usa aT = distancia / velocidad.
- **Montículos de espuma** donde el agua brota y donde cae.
- **Roca mojada:** zonas declaradas (`setWetZones`) donde la roca se oscurece y baja su rugosidad.
- **Precalentamiento:** al arrancar se suben todas las texturas, se compilan todos los programas y se dibuja el nivel entero una vez con un frustum de sombra amplio. Tarda ~74 ms, durante el plano inicial.
  - Busca evitar los tirones de primera vista que se midieron (150–250 ms).
  - No se pudo validar en su momento: la máquina tenía una carga media de 11–16 por otra sesión (Chrome headless de Bitland), y con esa carga los tirones aparecen también en corridas posteriores. En la corrida final (carga ~4) no hubo tirones.

## D12 · El explorador, construido sobre su hoja de giro (iteración 06)

**El problema:** el modelo 3D no se parecía al retrato que muestra la Bitácora. De cerca, el pelo era una semiesfera inclinada de costado que tapaba un ojo y dejaba la nuca pelada; la correa de las antiparras flotaba como un halo; el remolino era una púa; la boca quedaba fija en «o»; no se veían piernas ni botas, ni la correa de la cartera.

**Elegido:** reconstruir la geometría sobre `art-source/physica/explorer-sheet-v1.png`, con la misma interfaz de animación (caderas, rodillas, hombros, cabeza, ojos, boca, cadenas).
- **Proporción:** 1,1 m, la altura de la caja simulada; tres cabezas. El cinturón y su hebilla siguen a 0,55 m, porque es el punto de referencia del cuerpo para las medidas (D8).
- **Pelo:** una sola masa con un solo contorno. El borde se recorta en puntas (flequillo bajo las antiparras, patillas, nuca despareja), la superficie tiene mechones que sobresalen del contorno y se ensancha sobre las orejas, y lleva hebras pintadas que bajan desde la coronilla.
  - Se probaron y se descartaron mechones sueltos: con conos se leía como un erizo; con lágrimas planas y contorno propio, como tejas.
- **Antiparras y correa:** apoyadas sobre esa misma superficie: lentes oscuras con brillo, aros de latón y una correa que baja por la nuca.
- **Ropa:** el abrigo se cierra arriba del cinturón y se abre en V invertida debajo; puños vueltos; pantalón crema y botas grandes con correa y hebilla; cartera en la cadera derecha, con la correa cruzada al hombro izquierdo; reloj de latón en la muñeca izquierda, girado hacia el frente.
- **Cara:** ojos grandes con dos brillos, sonrisa (la «o» queda para la sorpresa), mejillas.
- **Contorno:** las caras traseras se empujan a lo largo de su normal con un ancho fijo. Con una envoltura escalada, la línea se corría en las piezas fuera de su origen.
- **Lo que sigue siendo física:** las dos colas de la bufanda y el remolino son cadenas en el campo (suben en la región).
  - Las colas cuelgan de la nuca y se apoyan sobre el abrigo: el empuje es sólo a lo largo del eje frente–espalda y siempre hacia atrás.
  - Con un empuje radial, las colas se deslizaban hacia los costados (sobre los brazos) un poco en cada cuadro. Al darse vuelta el cuerpo, una cola quedaba atrapada delante del pecho.
  - Ambos defectos se encontraron en una simulación en node y se comprobaron después de la corrección.

## D13 · El cuerpo cuenta el estado físico (iteración 07)

**El problema:** el explorador tenía un par de mezclas sueltas (brazos arriba en el aire, piernas recogidas, cargar, empujar). No había deslizamiento, la sorpresa sólo se veía en los ojos (2 px en la cámara de juego) y el cambio de gravedad apenas se notaba en la postura.

**Elegido:** un clasificador de poses que lee el estado simulado (nunca al revés) y elige una silueta por estado.
- **Lo que lee:**
  - apoyo;
  - velocidad;
  - aceleración de control;
  - el campo donde está el cuerpo (leído en el modelo, porque la simulación no lo actualiza mientras la cadena sostiene al cuerpo);
  - cadena, trepada, carga y empuje;
  - agua (apoyado en un sólido que no es apoyo firme).
- **Las poses:**
  - de pie;
  - caminar;
  - frenar: con los pies que patinan, el cuerpo sigue mirando hacia donde se mueve y gira después;
  - empujar y cargar;
  - en la cadena, y con esfuerzo cuando se baja contra el empuje de la región;
  - trepar;
  - en el agua;
  - caer en el campo familiar;
  - en el aire;
  - suspendido: en la región el cuerpo «cae hacia arriba», se inclina hacia atrás con los brazos en Y y mira hacia arriba.
- **Transitorios encima:**
  - el sobresalto al entrar a una región: brazos abiertos, estiramiento y una marca sobre la cabeza;
  - el agachado que amortigua un aterrizaje: sólo si la normal del contacto se opone al campo local, porque un golpe contra una pared no es un aterrizaje.
- **Señales pequeñas:**
  - polvo donde patinan o aterrizan los pies;
  - la marca del sobresalto;
  - gotas de esfuerzo. Las gotas son puntos libres en el mismo campo: en la región caen hacia arriba, como todo.
- **Cámara:** flotando en una región, el cuadro se abre un poco (+0,9 m de distancia). Con movimiento reducido no se aplica.
- **Representación, no física:** nada de esto mueve el cuerpo simulado. En el agua el dibujo se hunde hasta la cintura, mientras la caja simulada descansa sobre la superficie. El agua no es un instrumento de medida.

## D14 · Vegetación con identidad, y helechos que muestran el campo (iteración 08)

**El problema:** el pasto eran unos 1100 conos verdes de tres caras, lo más «de programador» que quedaba en todos los cuadros de juego. Además, ninguna planta mostraba el campo; sólo el musgo de la sima lo hacía.

**Elegido:**
- **Plantas pintadas** (imagen generada, `art/PROCEDENCIA.md`) en tarjetas instanciadas, en un solo llamado de dibujo.
  - La cámara del diorama mira siempre de frente, así que una tarjeta se lee como la planta entera.
  - El espejado se hace en la textura: con una escala negativa se invierte el orden de los vértices y se ve la cara trasera, sin luz.
  - Cada tarjeta usa el rectángulo medido de su planta, así su base es la base de la planta.
- **Comunidades:**
  - **Arriba:** matas, flores, suculentas y musgo. Cerca del camino sólo plantas bajas; el pasto alto, bien atrás.
  - **Juncos** en matas sobre la orilla de enfrente de cada canal (la orilla de acá da al camino).
  - **Helechos** que salen de las caras de la sima y del Pozo.
- **Física de la flexión** (sólo representación):
  - Una planta erguida tiene el campo a lo largo del tallo: un cambio vertical sólo la comprime, así que las plantas del suelo muestran el viento y se apartan al paso del explorador, no el campo.
  - Un helecho que sale de una pared es una pequeña ménsula: la punta se desvía a lo largo del campo local y en proporción a él (`fieldBend`, con prueba).
  - Por eso los helechos se doblan hacia abajo afuera y se enroscan hacia arriba adentro. En la cara de la Terraza, que cruza el borde superior de la región (y = 3), se dan vuelta en el borde. En el Pozo pasa lo mismo, en y = 1.
- **Instrumentos primero:** los helechos quedan detrás del plano de medición (los rótulos están en z 0,08). En la primera versión tapaban los rótulos de la cadena.

## D15 · La Orilla se lee: instrumentos que no se confunden y avisos en su lugar (iteración 09)

**El problema (A22):**
- **El mástil de plomadas** era un montante con 11 brazos horizontales cada 0,5 m: una escalera, incluso en su sombra.
- **El aviso de cada soporte** flotaba sobre el poste: el del soporte B aparecía junto a la esfera del A.
- **Con una esfera en la mano**, la cadena simplemente no se ofrecía, sin explicación.

**Elegido:**
- **El mástil:**
  - ménsulas inclinadas a alturas irregulares, con las puntas escalonadas para que las plomadas no formen un riel;
  - sin sombra de las ménsulas, que dibujaba una celosía;
  - plomadas un 35 % más grandes;
  - **ninguna dentro de la banda de transición del campo (2,7–3,3 m):** ahí una plomada queda de costado y parece rota, y además la cruzaba el brazo de B. El par más cercano (abajo a 2,3, apuntando arriba; arriba a 4,1, colgando) enmarca el borde, que un collar de latón marca en el mástil a 3 m.
- **Los soportes:**
  - el aviso de «Soltar la esfera» va sobre la esfera que suelta, o junto a ella cuando taparía un instrumento (el de B, con un desplazamiento propio del nivel);
  - un anillo rodea esa esfera, y el brazo y la pinza del soporte activo se iluminan: aviso, esfera y poste se leen como un solo aparato;
  - el aviso de recoger con el carrete queda en el poste, donde está el carrete.
- **La cadena con las manos ocupadas:** el aviso de soltar suma una **causa** con otro estilo (azafrán, en dos líneas), distinta de las ayudas de control: «Manos ocupadas: soltá la esfera para bajar por la cadena.»
- **El aviso de «Bajar por la cadena»** va sobre el explorador en el labio, no sobre la sima: ahí sube la esfera recién soltada.

## D16 · Suelo pintado y musgo en flecos (iteración 10)

**El problema:** al lado de las plantas pintadas (D14), los altos eran manchas planas de verde y marrón generadas con ruido, y el musgo eran cintas escalonadas que se leían como púas verdes.

**Elegido:**
- **Suelo:** una textura pintada (generada, `art/PROCEDENCIA.md`), hecha sin costura y muestreada a dos escalas, una rotada, con un poco de grano propio de la roca.
- **Musgo:** la cadena sigue siendo la física (cuelga a lo largo del campo, pruebas en `flora.test.js`); cambia sólo el dibujo.
  - **Forma:** una tira suave que pasa por los puntos de la cadena (Catmull-Rom), de ancho constante.
  - **Textura:** hebras finas que se deshilachan, con prueba alfa. La silueta la da la textura, no la tira.
  - **En cada labio:** un fleco continuo de piezas superpuestas, de largo desigual y con algunos huecos.
  - **En las paredes de la sima:** dos capas atrás y una detrás del plano de medición. En la primera versión, una capa delante tapaba la regla, como ya lo hacía el musgo anterior.

## D17 · Opciones de accesibilidad en la pausa (iteración 12)

**El problema (A16):**
- **Pausa:** sólo tenía «Seguir».
- **Movimiento reducido:** existía sólo como parámetro de la URL o como preferencia del sistema.
- **Volumen y texto:** no había control de volumen ni de tamaño de texto.

El contrato (§7) pide movimiento reducido, texto legible y controles enseñados para teclado, mando y táctil.

**Elegido:**
- **El panel:** Esc o P (Start en el mando, ⏸ en una esquina en táctil) pausan y abren las opciones:
  - volumen;
  - movimiento reducido;
  - tamaño del texto (1, 1,25, 1,5);
  - una tabla de controles desplegable.
- **Modal de verdad:** el foco queda adentro y el juego no recibe teclas mientras está abierto.
- **Mando:** ▲▼ mueven el foco, ◀▶ cambian el valor, A activa y B cierra.
- **Movimiento reducido** es un corte en cada cambio de plano: la vista, los dos planos del inicio, R y los reinicios, y la inclinación del Pozo. Cuando está activo, la cámara no se adelanta al caminar ni se abre al flotar.
- **Guardado:** en `localStorage` con try/catch. El movimiento reducido sólo se guarda si el jugador lo elige; hasta entonces manda el sistema, y `?reduced` siempre gana.
- **Tamaño del texto:** escala todas las fuentes de la interfaz y de la Bitácora con una variable CSS. Los avisos quedan dentro de la pantalla.
- **Táctil:** tiene su propia ayuda, encima de la barra, y botones más chicos en pantallas angostas.

## D18 · La transición 2.5D → 3D: la misma simulación con una dimensión más (iteración 13, Hito B · B2)

**El pedido (contrato §2):** una escena mínima de la transición. Una abertura que parecía decorativa se vuelve transitable, detrás de una pared aparece un barrio y un mecanismo revela su eje. «La cámara cambia cómo observamos, no modifica por sí sola las leyes físicas.» Sin desarrollar dos juegos incompatibles.

**Elegido:** una sola simulación, que gana profundidad donde el nivel la declara.
- **Profundidad opcional:** las regiones del campo y los sólidos aceptan un rango de profundidad (`z0`/`z1`).
  - El nivel declara la profundidad del diorama (`diorama`), y todo lo que ya existía la toma.
  - En el recorrido 2.5D el explorador vive en z = 0 y nada cambia: las 55 pruebas anteriores pasan sin tocarlas.
  - Detrás del muro no hay regiones (condiciones familiares) y el agujero del Pozo no sigue bajo el barrio.
- **El explorador** tiene z y vz.
  - Por una puerta abierta, ▲ camina alejándose de la cámara y ▼ vuelve; ◀▶ siguen siendo los costados.
  - En profundidad sólo se mueve dentro de áreas transitables declaradas: el umbral frente al arco, el pasaje y el barrio. Las paredes son esos bordes.
  - La gravedad, los apoyos y los escalones son los mismos de siempre.
  - Los contactos entre cuerpos ocurren sólo a profundidad parecida.
- **Dos ayudas declaradas:**
  - en el umbral, caminar en profundidad centra al explorador en el pasaje, así no hace falta apuntar;
  - del otro lado, ▼ cerca del muro lleva a la boca del pasaje, que queda detrás de la cámara y fuera de la vista.
- **El arco:** se ofrece («Abrir el arco», E) recién después de pisar el Mirador, donde se vio la ciudad.
  - Su relleno de piedra gira 100° hacia el pasaje sobre un eje de latón visible.
  - Abierto, el aviso dice «▲ Entrar»: se camina, no se usa.
  - Con una esfera en la mano no se entra, y el juego dice por qué.
- **La cámara:** pasa de la vista lateral del diorama a una cámara baja detrás del explorador, como función continua de su profundidad (de z 0 a −1,8).
  - Va baja en el pasaje, para no entrar en la roca, y sube en la plaza.
  - Con movimiento reducido no hace falta un corte: sigue la posición del explorador.
- **El barrio** (propuesta de nombre, sin asentar en el canon):
  - una plaza con fachadas, un observatorio, plantas y faroles;
  - una fuente cuyo chorro sale del mismo campo que la cascada y por eso cae como siempre: el contraste con el agua que sube.
  - Se dibuja recién cuando el arco se abre; antes asomaba por encima del muro del cañón.
- **Cambios en la escena 2.5D, sin cambiar su física:**
  - el muro del fondo se corta en el pasaje;
  - un conducto de los anclajes que lo cruzaba cambió de recorrido;
  - una pasarela de piedra cruza el arroyo de la Terraza (es un sólido con rango de profundidad, que no existe en z = 0).

## D19 · El mismo instrumento, otro lugar: el soporte de la plaza y la cámara que corta el muro (iteración 14, Hito B · B2)

**El pedido (revisión de la iteración 13):** que el barrio tenga al menos un experimento cotidiano interactivo y una fuente que contraste con la surgencia; diseñar lo que asoma sobre el muro.

**El experimento cotidiano: el soporte C.**
- **Qué es:** el mismo instrumento que el soporte A (brazo de 1,05 m, pinza a 2 m, carrete), en la plaza.
- **Dónde está:** al oeste de la fuente (x 3, z −15,2), entre sus canteros.
  - Se ve al salir del pasaje.
  - Detrás queda lugar para la cámara: el experimento se ve sin cortar nada.
- **Cuándo se ofrece:** a su profundidad (|Δz| ≤ 1,2). Desde el barrio no se ofrecen los de la Orilla, ni al revés.
- **La nota:** cuando la esfera toca el pavimento, la Bitácora agrega «La misma caída, detrás del muro», con distancia, tiempo y aceleración ajustada a las marcas.
  - Si el soporte A ya se soltó, compara las dos aceleraciones.
  - Si no, dice sólo que falta medir la de la Orilla. Una primera versión afirmaba «es la caída de siempre» sin haberla medido.
  - Si A se suelta después, su nota agrega la comparación con la de la plaza.
- **La regla** está del otro lado de la esfera, lejos del poste: donde el explorador se para a soltar, la tapaba.
- **Posición en la lista:** C va al final de los soportes, así A, B y P conservan su orden. La ruta de evidencia los leía por índice: con C primero, leyó la pinza de A como si fuera la de B.

**La fuente.**
- El chorro central sale hacia arriba a la velocidad vertical de la surgencia de la sima (`level.spring.vy`, 2,95 m/s). La surgencia, además, avanza de costado.
  - Sin región, sube v²/2g ≈ 0,44 m y vuelve a caer. La Bitácora calcula esa altura con el campo en la fuente.
  - Allá, la región lo sigue empujando y el agua cresta sobre la Terraza.
- El cuenco es abierto y de esmalte, con el agua bajo el labio. El de latón se leía negro desde abajo: no tenía nada que reflejar.
- Desborda por cuatro labios, en láminas finas que caen con el mismo campo.
  - Al principio los derrames eran anchos y el chorro central, de 5 cm, apenas se veía: el contraste existía sólo en el texto.
  - Ahora el chorro central es más grueso (11 a 13 cm) y tiene espuma en el ápice.

**Lo que asoma sobre el muro: nada todavía.** El barrio se dibuja recién cuando el arco empieza a abrirse.
- Probé dibujarlo desde el Mirador (`citySeen`) en adelante, y salió mal por dos lados:
  - asomaba una fachada cortada sobre el arco, que se leía como «una casa encima del acantilado» y aparecía de golpe;
  - costaba 195 llamadas de dibujo más en cada cuadro de la Terraza (855 contra 660).
- Lo que asome tiene que ser una silueta propia, barata y en la bruma, con la cúpula en el eje del arco. Queda pedido para cerrar B2.
- La esfera del soporte C también se dibuja sólo con el barrio.

**La cámara en la plaza.**
- **El problema:** la cámara seguía atada al ancho del pasaje mientras el explorador ya estaba en la plaza. Si caminaba hacia un costado junto al muro, la pared del pasaje lo tapaba a él y al experimento.
- **Elegido:**
  1. Fuera del pasaje, la cámara sigue al explorador libremente.
  2. Si la roca entre la Terraza y la plaza queda en medio, se corta: ese tramo del muro, el techo del pasaje y sus lámparas se ocultan, y aparece el piso que sigue bajo el muro.
     - «En medio» quiere decir que la cámara está dentro de la roca, o que las líneas a la cabeza o a los pies del explorador la cruzan fuera de la boca.
     - Para que no parpadee, el corte tiene histéresis: entra con 0,1 m de margen y sale con 0,3 m.
- **Descartado:**
  - Llevar la cámara a la plaza y subirla. Falla con el explorador pegado al muro: la cámara quedaría delante de él.
  - Hacer la roca transparente. Choca con el orden de dibujo de las plantas.
- **Las luces del pasaje** se apagan con el corte (intensidad 0) en lugar de ocultarse. Cambiar cuántas luces hay recompilaría todos los materiales iluminados.
- **El cuerpo del explorador nunca entra en el espesor del muro.** El área del barrio empieza en la cara del muro (z −9). El pasaje se extiende un ancho de cuerpo más allá, así las dos áreas se superponen.
  - Antes, junto al muro y fuera de la boca, el explorador podía quedar con 0,24 m del cuerpo dentro de la roca. Ahí la cámara seguía atada al pasaje y no había corte.
  - Una prueba lo verifica: con las áreas anteriores falla en 100 de 1080 pasos.
- **Costo:** el corte es instantáneo. Las paredes del pasaje desaparecen de un cuadro a otro cuando el explorador gira junto al muro.
- **La física no cambia por la cámara.**

**Avisos y ayudas en profundidad.**
- «▼ Volver» se dibuja al costado del explorador. Sobre su cabeza tapaba lo que tiene adelante: el soporte, el chorro.
- La barra de ayuda dice qué hacen ▲▼ donde está el explorador:
  - en el recorrido 2.5D, «ajustar, trepar»;
  - pasando el arco, «caminar hacia el fondo y volver».
- Los soportes del recorrido 2.5D no se ofrecen desde el umbral del arco. Antes se ofrecía P, y ▲▼ movía su pinza mientras se caminaba hacia el arco.
- Contra la fuente, el deslizamiento va a 45° y a la misma velocidad de caminata.

**De paso:**
- El piso del pasaje tenía alto negativo: su cara miraba hacia abajo y nunca se dibujó, y se veía la roca de debajo. Ahora se ve empedrado.
- En la ruta de evidencia, `walkTo` corrige con toques cortos cuando una pausa de la página hace que el explorador se pase del objetivo, y lo registra (`walkToOvershoots`).

## D20 · El barrio visto desde el 2.5D, la metrópolis habitada y el corte que se disuelve (iteración 15, Hito B · B2)

**El pedido (revisión de la iteración 14):**
- lo que asoma sobre el muro, diseñado: al apretar E el barrio aparecía de golpe sobre el muro y quedaba asomando, con su costo de dibujo;
- que la plaza se lea como parte de una metrópolis habitada;
- un corte del muro que no salte de un cuadro a otro.

**Desde el lado 2.5D, el barrio se ve sólo por el pasaje.**
- **El portal:** un cuadro invisible en la boca del pasaje (z −9) marca el stencil.
  - Mientras la cámara está delante del plano del arco y no hay corte, los materiales del barrio se dibujan sólo donde está esa marca.
  - Los materiales que el barrio comparte con la escena 2.5D se clonan para él, así el resto no se ve afectado. Los de shader se clonan compartiendo sus uniformes.
  - **El piso del pasaje no es del barrio.** Dentro del barrio, el portal lo ocultaba desde el lado 2.5D y se veía la roca de abajo; ahora es de la escena y se muestra con el arco abierto.
  - Cambiar el stencil no recompila nada: se lee en cada dibujo.
- **El costo:** desde el frente, el barrio ni se dibuja si ninguna línea de la cámara a través del arco puede llegar a la boca.
  - La prueba tiene en cuenta el ancho y la altura del vano, con 5 cm de margen.
  - Desde la Orilla, con el arco abierto: 281 llamadas de dibujo, igual que cerrado.
  - En la Terraza, el barrio se dibuja; el portal recorta píxeles, no llamadas (930 contra 662 con el arco cerrado). Unir su geometría estática por material queda para B5.
- **Sobre el muro, una silueta propia:**
  - **Qué es:** las mismas huellas de los edificios, la cúpula y la aguja de la torre, en una sola malla con color por vértice, sin luz (1 llamada de dibujo).
  - **Cómo se ve:** la crema y la terracota del barrio en tonos medios polvorientos de la bruma, con el sombreado del sol horneado por cara (techos más claros, el lado opuesto al sol más oscuro). Se lee como volumen lejano y no como recorte.
    - Una paleta más clara quedó blanca después del tone mapping (`intermedio-silueta-blanca`).
  - **Cuándo:** aparece con un fundido de 2,5 s cuando se ve la ciudad desde el Mirador. Sólo se dibuja fuera del portal.
  - **Descartado:** unos bloques lejanos planos se leían como cartón sobre el cañón pintado (`intermedio-silueta-de-carton`).

**La metrópolis habitada.**
- **Una calle sale hacia el norte**, entre el bloque del observatorio y la esquina noreste.
  - Tiene fachadas a los dos lados, más altas cuanto más lejos.
  - Una reja de hierro la cierra en el borde de la plaza: ahí termina el área caminable, y ahí empieza B5.
  - **Una torre del reloj** (11 m, el reloj en marcha) cierra su fondo: la ciudad sigue más allá de la plaza y es más alta.
  - **Por qué una calle y no volúmenes altos detrás de las filas:** desde la plaza, el borde superior del cuadro queda casi a la altura de la cornisa de la fila norte, así que esos volúmenes no se verían. La calle es la vista de la ciudad.
- **La fila norte** sube un piso.
- **Puertas** en todas las plantas bajas que dan a la plaza. Están unidas por material: 4 llamadas de dibujo, no 48.
- **Un soportal de tres arcos** en el frente del observatorio, en el eje del pasaje: una galería de 0,8 m bajo una losa, con columnas sólidas en el nivel (una sola malla). En relieve se leía como tres puertas negras.
- **Faroles** entre las puertas, no delante.
- **Dos vecinos:**
  - una lee sentada en el borde de la fuente, al sudoeste, mirando hacia el soporte C: no tapa el chorro visto desde el pasaje;
  - otro está de pie junto a una puerta del este y mira la plaza.

  - Los dos son sólidos, como los faroles.
  - Miran al explorador cuando se acerca a menos de 4 m. Si no, el de pie mira la plaza y la sentada, su libro.
  - Son figuras simples y originales, con cuello y manos.

**El corte del muro se disuelve.**
- La roca de ese tramo tiene una variante con disolvido por tramado: descarta fragmentos según un ruido de pantalla. Sigue siendo opaca, así no hay que ordenarla contra las plantas transparentes. Lleva su propia clave de programa.
  - Los bloques la usan sólo mientras dura el corte: el descarte anularía la prueba de profundidad temprana en cada cuadro 2.5D.
  - Su programa se compila al arrancar, con el resto, porque el techo del pasaje es de esa roca.
- El techo del pasaje se disuelve con el muro, las lámparas se desvanecen y sus luces bajan con el corte.
- **Duración:** el corte entra en unos 0,22 s.
  - Empieza cuando la cámara se acerca a 0,65 m de las paredes del pasaje, con histéresis.
  - Si la cámara ya está dentro de la roca, es inmediato.
- Sale con el mismo fundido.

**De paso:** al cargar una partida, la ciudad vista se restaura de la Bitácora (`citySeen`). Antes, después de recargar no había silueta y el arco no se podía abrir sin volver al Mirador.

## D21 · Introducción en la ciudad: la parada del carro de cable (iteración 16, Hito B · B3 + B5)

**El pedido (contrato, familia «Introducción»):** referencia, posición, desplazamiento, tiempo, unidades, medición y vectores. «Dos observadores describen de manera diferente un transporte en movimiento; el jugador coloca referencias y comprueba qué cambia.» Error a evitar (FAMILIAS): creer que hay una única descripción verdadera del movimiento.

**El lugar.** La calle del norte, detrás de la reja de la plaza, desemboca en una avenida transversal con un andén.
- Por la avenida corre un **carro de cable**: una plataforma baja que se engancha a un cable sin fin.
- Un **torno visible** en la casa de máquinas, al final de la línea, mueve el cable a velocidad constante. El impulso tiene una fuente que se ve; el rozamiento lo compensa el cable.
- El carro va de una parada a otra:
  - espera en cada una;
  - se engancha (medio segundo para tomar velocidad);
  - corre a velocidad constante;
  - se suelta y frena en la otra.
- La cámara, detrás del explorador, mira al norte: el carro cruza la pantalla de costado. Es la dirección que mejor se lee.

**Las referencias.**
- **En el suelo:** el cordón del andén lleva marcas cada metro.
- **En el carro:** su costado lleva una regla.
- **Un jalón** (una vara a franjas) que el explorador lleva y planta con E, en el andén o sobre la cubierta del carro. Las lecturas de la Bitácora se miden desde el último jalón plantado.

**Lo que se mide.**
- **Qué:** la linterna del frente del carro deja una marca cada 0,5 s mientras viaja.
- **Dónde quedan las marcas:** en el marco de la referencia elegida.
  - Con el jalón en el andén, quedan en el suelo, espaciadas: la linterna se desplazó.
  - Con el jalón en el carro, viajan con él y caen todas en el mismo lugar: respecto del carro, la linterna no se movió.
- **Qué compara la Bitácora:** posición inicial y final respecto del jalón, desplazamiento y tiempo, desde cada referencia. Dice que las dos descripciones son correctas.
- **El explorador como observador:** también puede subir al carro. Parado en la cubierta, el andén se aleja y él no se mueve respecto del carro.

**Qué cuenta como entender (no un texto que lo explique).**
- **Primero, medir:** el mismo viaje, con el jalón en el andén y en el carro.
- **Después, un encargo que depende del marco:**
  - el guarda pide dejar un paquete a cierta distancia del jalón del andén;
  - el explorador va en el carro y tiene que soltarlo cuando esa marca pasa delante;
  - desde el carro, el paquete «cae» en su lugar; el andén lo recibe en otro.
- El encargo queda para cuando la medición esté probada.

**Transferencia** (FAMILIAS): el arco de agua de la sima, visto desde un bote que avanza a su misma velocidad horizontal, sólo sube y baja.

**El marco de la velocidad (decidido en la iteración 16, después de la revisión).**
- Mientras un cuerpo se apoya en el carro, su velocidad es relativa al carro, y el cuerpo viaja con el desplazamiento del carro.
- Al apoyarse se le resta la velocidad del carro; al dejarlo se le suma.
- **Consecuencias:**
  - quien baja de un carro en marcha baja con su velocidad;
  - una esfera soltada desde el carro sale con la velocidad del carro y cae en su lugar de la cubierta;
  - subir a un carro en marcha está permitido.
- Esto vale para el explorador y para las esferas. Sin este modelo, el encargo y la transferencia del bote serían falsos.

**Lo que se ve (ajustado después de la revisión).**
- **La casa de máquinas** está frente a la calle, del otro lado de la avenida: su rueda se ve girar a través de un arco cuando se baja por la calle y desde el carro.
- **El cable** lleva marcas que corren siempre.
- **El carro** tiene un toldo sobre el banco y barandas: se lee como vehículo.
- **Las paradas** tienen poste, cartel y campana, y caen en lecturas redondas del cordón (5 m y 20 m).
- **Avisos:** «▲ Subir al carro» y «▼ Bajar del carro».
- **A bordo,** el explorador se acomoda a 0,6 m del borde del andén. Con eso la regla del carro queda delante de sus pies y el cordón del andén, a la vista.

**Por partes.** Esta iteración pone:
- la base de la simulación: un transportador cinemático que lleva lo que tiene encima, y un área transitable que viaja con él;
- la reja, la calle y el andén;
- el carro con su torno;
- un viaje en el carro con teclas.

El jalón, las marcas en cada marco y las notas vienen después.

## D22 · El registrador del carro: dos registros físicos del mismo viaje (iteración 17, Hito B · B3)

**El pedido.** Medir el mismo movimiento desde dos referencias, sin que «el marco» sea un modo de dibujo (revisión de la iteración 16).

**El aparato.** El carro lleva un registrador de relojería.
- **Cómo se arma:** a bordo, con el carro en una parada, «E Registrar el viaje».
- **Qué hace:** cuando el carro arranca, el registrador marca cada 0,5 s, y una vez más al llegar, dónde está el explorador en dos registros a la vez:
  - **tiza en el cordón del andén:** la marca queda en el suelo. Su lectura es la posición respecto del cero del cordón, en el extremo oeste del andén;
  - **tinta en la cinta del carro:** la marca viaja con el carro. Su lectura es la posición respecto del cero de la cinta, en el extremo oeste del carro.
- **Las marcas de tinta que coinciden** se apilan a lo ancho de la cinta: se ven como una columna de marcas en un mismo lugar, no como una sola.
- **Si el explorador baja durante el viaje,** el registro se corta (luz roja).

**Tres viajes que cuentan algo distinto:**
- **Parado sobre el carro:**
  - las marcas de tiza quedan espaciadas (0,75 m cada 0,5 s en marcha) y las de tinta, todas en el mismo lugar;
  - en el andén, el explorador se desplazó 15 m; en el carro, 0 m. Es el mismo viaje.
- **Caminando sobre el carro en marcha,** el caso que no es trivial:
  - en la cinta, el explorador se desplaza respecto del carro; en el cordón, se suman el carro y su caminata (o se restan, si camina hacia atrás);
  - la Bitácora lo dice con los números medidos: Δ en el andén = Δ del carro + Δ sobre el carro.
- **Hacia el oeste:** las lecturas del cordón bajan y el desplazamiento es negativo.
  - La distancia es su valor absoluto; el signo dice hacia dónde.
  - Ahí entran los vectores en una dimensión.

**Ajustado después de la revisión (la suma tiene que verse en el mundo, no sólo en la Bitácora):**
- **Una tercera huella:** en cada marca, el carro deja su propia muesca en el cordón, un triángulo terracota en su extremo oeste, que es el cero de la cinta. De la muesca a la tiza hay exactamente la lectura de la cinta: la suma se ve marca por marca.
- **Las marcas se emparejan por color:** la marca n tiene el mismo color en los tres registros (tiza, tinta y muesca), en un ciclo de seis colores (3 s). Un hilo del mismo color une cada muesca con su tiza: su largo es la lectura de la cinta. Al principio alternaban sólo dos colores; eso daba la paridad, no el emparejamiento.
- **A bordo, el explorador camina con cuidado,** a media marcha (1,5 m/s, la velocidad del carro): ayuda declarada.
  - Caminando contra la marcha, la tiza se apila en un lugar y la tinta se reparte 0,75 m por marca. Es el espejo del viaje parado.
  - Varias marcas iguales llevan su cuenta (×N), en la cinta y en el cordón.
- **Los dos ceros están rotulados.** La cinta tiene el largo completo del carro: su cero es su extremo oeste.
- **No se duplica la marca de llegada.**

**Lo que no hace.**
- No elige un marco para dibujar: los dos registros existen a la vez. El registro queda hasta que arranca el próximo viaje registrado; armar el registrador no lo borra.
- No se guarda al recargar, igual que las trazas.
- Un registro cortado (el explorador bajó durante el viaje) queda cortado, sin nota, aunque el explorador vuelva a subir: no se reanuda ni se cierra después.
- **La media marcha a bordo es una ayuda de diseño:** fabrica el caso «tiza quieta». La nota lo dice: «caminabas tan rápido como el carro, al revés».
- Las notas no explican antes de medir: se escriben con los números de cada viaje.

**Después:** el jalón (un cero que coloca el jugador) y el encargo que depende del marco.

## D23 · El jalón y el encargo de la vecina (iteración 18, Hito B · B3)

**El pedido** (revisión de la iteración 17): con los dos ceros fijos, el jugador no podía descubrir que mover el origen cambia las posiciones y no los desplazamientos. Y ninguna tarea obligaba a usar la lectura del carro para predecir.

**El jalón.** En la parada oeste hay un soporte con jalones, varas a franjas.
- «E Tomar un jalón» y «E Clavar el jalón».
  - **En el andén:** queda en el suelo.
  - **En la cubierta del carro:** viaja con él.
  - «E Levantar el jalón» junto a él.
- **Para el registrador, el jalón es un tercer cero.** Mientras está clavado, cada marca también se lee desde él.
- **La Bitácora lo compara con el cordón y con la cinta:**
  - **clavado en el andén,** las posiciones desde el jalón son otras (el cero está en otro lugar), pero el desplazamiento es el mismo que en el cordón;
  - **clavado en el carro,** el desplazamiento es el de la cinta.

  Cambiar el cero cambia las posiciones; cambiar de marco cambia los desplazamientos.

**El encargo.** En la parada este, una vecina clavó su jalón en el cordón, en 21,5 m.
- **Qué pide:** que la última marca de tiza de un viaje hacia el este quede al pie de su jalón. Al pie hay un recuadro punteado de ±15 cm.
- **Qué se puede predecir:** dónde pararse en el carro antes de salir.
  - El carro se detiene siempre igual. En la parada, el poste está justo donde se detiene el cero de la cinta: el cartel dice «aquí para el 0 del carro: 19 m ↓» y apunta a una chapa amarilla con «0» en el cordón, del amarillo de la cinta.
  - Parado, la última tiza queda en 19,0 + la lectura de la cinta donde uno va. Hay que ir en 2,5 m.
- **Sólo cuenta un viaje hecho quieto:** toda la tinta en una columna. La posición se decide antes de salir, no se corrige a ojo durante el viaje. Si caminaste, la vecina dice «así no vale».
- **Cuando se cumple, la vecina corre su jalón a 20,3 m** («¿Y ahora?»): una posición memorizada no sirve.
- **Habla en el mundo,** con un globo:
  - el pedido;
  - «Faltaron 0,7 m →» o «← Sobraron…»;
  - «¡Justo ahí!», con la bandera.

  La Bitácora lleva los intentos.
- **Honestidad:** también se puede resolver tanteando, porque el globo dice cuánto faltó. La predicción ahorra viajes; no es la única salida.
- **Se guarda al recargar:** estado, ronda e intentos.

**El jalón, visible:** clavado, despliega su propia cinta con signo (−3…0…+3), en el andén o sobre la cubierta, donde viaja con el carro. Se clava donde está el explorador, redondeado a 0,1 m de su regla. Con el carro esperando, E arma primero el registrador; el jalón se levanta después. Si se lo lleva de vuelta a la plaza, vuelve al soporte.

**Para que el número 19,0 sea legible,** las paradas se corrieron 0,8 m: el cero del carro se detiene en 4,0 m y 19,0 m del cordón.

**Después:** la vista en tabla, un segundo observador en el andén y la transferencia del bote.
