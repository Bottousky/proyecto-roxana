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
- **Geometría, materiales y sonido:** todo procedural, generado en código en esta rama. No hay assets de terceros ni generados por IA.

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
