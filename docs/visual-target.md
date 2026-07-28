# Objetivo visual — escuela 3D interactiva

Estado: **art lock del vertical slice**  
Referencia maestra: `assets/school3d/escuela-3d-biblia-package/referencia-escuela-3d.png`  
Alcance aprobado: hall + Electrónica + silueta dormida de las demás aulas.

## Lectura de la referencia

La imagen es apta de forma condicional para reconstrucción: ofrece una vista amplia,
una silueta fuerte y materiales legibles, pero sólo una cámara. Los reversos, espesores
ocultos y conexiones fuera de cuadro son inferidos; la fidelidad exigida corresponde a
las cámaras válidas del producto, no a una reproducción arquitectónica completa.

El primer vistazo debe leer, en este orden:

1. basamento oscuro con jardines y acceso central;
2. hall octogonal cálido, estatua y gran escalera;
3. ala de Electrónica viva, con cobre, verde y portal violeta;
4. anillo de aulas presentes pero dormidas;
5. remate trasero con reloj y parapetos escalonados.

La composición no es una grilla frontal. El hall ocupa aproximadamente el 32 % de la
superficie visible y las alas se abren en abanico alrededor de él. La entrada crea un
eje profundo desde el borde inferior hasta el reloj.

## Cámara

- Vista general: ortográfica, azimut aproximado de 180° y elevación de 32–36°.
- La cámara final queda restringida a planos diseñados; no hay órbita libre.
- El overview conserva el basamento entero con 4–6 % de aire lateral.
- El foco de Electrónica usa la misma dirección de vista para que el zoom se sienta como
  un movimiento dentro de la maqueta, no como un cambio de escena.
- El máximo acercamiento debe mantener visible al menos una esquina de piedra, una
  lámpara y el piso para conservar escala.
- En mobile se recorta lateralmente antes de reducir la escuela a un tamaño ilegible.

## Arquitectura y habitaciones

### Hall

Volumen poligonal de dos niveles, piso de madera en espiga, medallón octogonal bordó y
oro, estatua de Roxana como ancla central, escalera ancha al fondo, barandas simétricas,
reloj, ventanales cálidos, bibliotecas y vitrinas integradas. La reliquia de progreso
debe aparecer en una vitrina lateral, nunca aislada sobre el piso.

### Electrónica

Recinto verde profundo con zócalo y coronamiento de piedra. Debe contener dos bancos
físicamente apoyados, biblioteca, pizarrón, instrumentos, cobre superficial, portal
circular grueso y un punto previsto para el robot. El portal no puede ser un torus
flotante: tiene carcasa, pies, abrazaderas, tubos y control superior.

### Aulas dormidas

Matemática, Física y Programación conservan props silueteables, pero usan saturación
reducida, poca luminancia y emisión nula. La diferenciación cromática es secundaria a
la coherencia de piedra, madera, cobre, bevel y escala.

## Paleta

| Familia | Base | Uso |
|---|---:|---|
| Fondo noche | `#071323` | vacío y viñeta |
| Piedra clara | `#9c8b78` | coronamientos, columnas, acceso |
| Piedra sombra | `#302c2e` | basamento y juntas |
| Nogal | `#59351f` | pisos, paneles, muebles |
| Bordó | `#6e2530` | medallón, banderas, tapizados |
| Oro envejecido | `#b87b31` | filetes y herrajes |
| Verde aula | `#1d3429` | Electrónica y pizarrón |
| Cobre | `#9b4d24` | tubos, abrazaderas, circuitos |
| Emisión verde | `#58e58b` | estado y señales pequeñas |
| Emisión violeta | `#8b68ff` | primer sector del portal |
| Dormido | `#333942` | tinte multiplicativo de aulas cerradas |

## Materiales

- Piedra: mate, juntas oscuras y bevel real; variación meso muy suave.
- Madera: semimate, veta direccional, bordes apenas gastados; no barniz espejo.
- Cobre: metalness alto, roughness media, brillo en cantos y pátina localizada.
- Piso verde: mate, juntas profundas, variación mínima por baldosa.
- Vidrio: humo leve, baja transmisión en overview; evitar transparencias apiladas.
- Emisiones: máscaras separadas y pequeñas. Deben teñir la vecindad mediante bake o
  luz local muy limitada, no convertir la sala en neón.

## Iluminación

La imagen debe parecer horneada: clave cálida desde frente-izquierda, relleno azul noche,
rebote ámbar en el hall y puntos prácticos. Las sombras principales son suaves pero la
oclusión de contacto es fuerte. En runtime sólo quedan animaciones baratas de emisión y
una luz de acento en la estatua. Bloom restringido a portal, lámparas y pantallas.

## Densidad y escala de detalle

- Macro: basamento, hall, alas, acceso y reloj.
- Meso: escaleras, vitrinas, portal, bancos, bibliotecas y pizarrones.
- Micro: libros, placas, instrumentos, tornillos, lámparas y vegetación.
- El detalle repetido usa instancing o geometría consolidada.
- Cada metro visible contiene como máximo un sistema micro dominante; el ruido no puede
  competir con el hall ni el portal.

## Contrato de calidad

La entrega pasa si:

- la silueta recuerda a la referencia sin depender de rótulos;
- el hall es el volumen dominante y posee profundidad real;
- Electrónica se reconoce por cobre, verde y portal;
- initial y `electronics-arc-1-complete` difieren en hall y aula;
- todos los apoyos y uniones son físicamente plausibles;
- el modelo se sostiene desde overview, foco de Electrónica y tres cuartos lateral;
- desktop y mobile conservan una lectura clara sin exponer reversos incompletos.

Bloquean el pase: grilla frontal, portal flotante, aulas dormidas brillantes, props sin
contacto, texto pseudo-legible, estilos mezclados, sobreexposición, cámara libre o pérdida
de la estatua como ancla central.

