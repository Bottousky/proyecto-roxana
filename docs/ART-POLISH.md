# Ohmdal · Pasada de dirección artística

9 de septiembre de 2026. Se conserva la cámara frontal, la geografía continua,
los sprites y el lenguaje de aventura RPG estilizada. La geometría sigue siendo
el soporte de colisiones, volumen, oclusión, luz e interacción. Las ilustraciones
aportan superficie, identidad y siluetas orgánicas; no sustituyen el mundo por un fondo.

## Decisiones e integración

- Instrumento de viaje de 316 px de ancho, brújula de 50 px y pregunta plegable.
  La versión móvil mantiene botones de 44 px. La ubicación conserva prioridad;
  región y detalles del objetivo son secundarios.
- Diez retratos ilustrados derivados de los sprites reales. Traje, colores,
  peinado y proporciones reconocibles. Segunda prueba de Vega e Ivara para
  recuperar sus edades sin volver al retrato fotorrealista.
- Pradera pintada de menor contraste, con menos hierba geométrica y claros
  alrededor de arquitectura y personajes. Se conserva el relieve de la piedra.
- Canal colocado fuera del bastión oriental. Ambas torres tienen basamento
  visible y colisión correspondiente. El mapa y su exclusión hidráulica usan
  la misma ubicación que el cauce real.
- Orillas compartidas por todo el reino: hiladas de piedra irregulares,
  franja húmeda oscura y tres grupos de plantas ilustradas con transparencia.
  Vegetación agrupada, dejando partes de la contención expuestas.
- Agua con centro oscuro, matices suaves, brillos fragmentados y corriente lenta.
  Sus reflejos son estilizados: no se incorporó reflexión física de toda la escena.
  Las fuentes comparten la respuesta al día y a la noche del canal.
- Texturas de suelo, mampostería y agua ancladas a las coordenadas del reino,
  incluso al cambiar el origen del sector activo.
- Conectores menos simétricos: grupos de árboles separados y bordes discontinuos.
  El espigón conserva barandas continuas. Los recorridos no cambian.
- Estandarte ilustrado de Ω, sol y agua, suspendido de un travesaño real,
  repetido en los espacios cívicos como señal de pertenencia a Ohmdal.
- Miniaturas dibujadas en el mapa regional, colocadas sobre la geografía real
  y visibles para los lugares visitados. No inventan caminos ni accesos.
- Noche con medios tonos algo más legibles y viñeta menos fuerte, conservando
  iluminación lunar y focos cálidos de las instalaciones reparadas.
- El jardín del Portal continúa en terreno y arboleda exterior; se retiró el
  corte rectangular del suelo sobre agua detrás del límite de juego.
- El taller usa tablas a escala propia y una alfombra tejida ilustrada, en lugar
  de extender la veta sobre toda la sala y reutilizar césped en la alfombra.
- Cámara ortográfica más alejada sobre el mismo eje: conserva el encuadre y
  evita recortar las torres y cornisas del Castillo al verlas desde las Terrazas.
  La niebla se ajustó a la nueva distancia óptica.

## Verificación final

- 255 pruebas de Node aprobadas; compilación Vite completada. Se mantiene el
  aviso de tamaño del paquete de Three.js (545 kB sin comprimir).
- Tres recorridos completos de ida y vuelta: 14 cruces por recorrido, con
  revisión diurna y nocturna. El último, después del ajuste de cámara, registró
  desplazamiento de posición y cámara de 0.000 en cada cruce y suelo seguro.
- Comparación de los diez retratos con sus sprites y con el arte anterior;
  diálogos reales de Edda y Lumen y HUD revisado también en marco móvil.
- Prueba espacial de ambos basamentos y alas de la Puerta sobre tierra seca;
  prueba de profundidad de cámara y conservación del encuadre ortográfico.
- La partida del origen 4180 se conservó y se retomó en La Calzada. Los
  recorridos y conversaciones de revisión utilizaron fixtures separados.

## Arte y trazabilidad

Los PNG seleccionados están en `public/assets/art-polish/`. Se generaron con
la herramienta integrada ImageGen, sin CLI ni API alternativa. Se conservaron
los originales. Los recortes de atlas son parte del runtime, sin retocar
manualmente los dibujos. Los prompts exactos y archivos de origen están en
`art-polish-prompts.json`. La primera prueba del atlas norte se conserva en
`art-source/portraits-north-first-trial.png`.

| Archivo | Uso |
| --- | --- |
| portraits-main.png | Edda, Lumen, Nereo |
| portraits-north.png | Estudiante, Vega, Ivara; segunda versión |
| portraits-village.png | Yesca, Marín, Tala |
| portrait-ohm.png | Ohm |
| meadow.png | Material de pradera |
| waterside-plants.png | Juncos, helechos y menta de ribera |
| kingdom-banner.png | Estandarte del reino |
| map-landmarks.png | Nueve miniaturas cartográficas |
| workshop-rug.png | Alfombra tejida del taller; prompt en art-polish-rug-prompt.json |

## Revisores disponibles

- `/scripts/qa-art.html`: los diez retratos junto al sprite real; comparación
  con retratos anteriores, sin guardar partidas.
- `/scripts/qa-map.html`: juego real, selector de conversación, visita y móvil.
  Usa el origen de desarrollo 4173 y restaura su partida previa al cerrar.
- `/scripts/qa-journey.html`: viaje continuo con horas de revisión explícitas,
  movimiento y colisiones reales; auditoría de los catorce cruces sin guardados.

Las instrucciones históricas de la skill de salas describen fondos cerrados y
un runtime anterior. No se aplicaron esos formatos al mundo continuo actual.
La autorización actual incluye generar, integrar, comparar y corregir el arte.
