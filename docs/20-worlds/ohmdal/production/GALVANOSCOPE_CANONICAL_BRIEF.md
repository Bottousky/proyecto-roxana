# Galvanoscopio — brief canónico

**Estado:** aprobado por Manuel para superar el `HERO_REFERENCE_GATE` de Stage 3.  
**Objeto:** Galvanoscopio de Lumen.  
**Mundo:** Ohmdal.

## Canon narrativo

El Galvanoscopio **no fue inventado por Maese Lumen**.

Es un instrumento portátil de diagnóstico eléctrico proveniente de una etapa anterior de Ohmdal, cuando el conocimiento técnico estaba más completo y sistematizado. Lumen lo heredó, encontró o recibió como legado; el origen exacto puede permanecer deliberadamente impreciso mientras el guion no lo fije con mayor autoridad.

Lumen conserva una competencia práctica real: sabe limpiarlo, mantenerlo operativo, reconocer lecturas útiles y realizar reparaciones menores. Pero **no comprende por completo su teoría, sus escalas ni todos sus modos de uso**. Su explicación mezcla experiencia empírica, tradición transmitida y superstición.

La opción narrativa elegida es la de **herramienta funcional mal interpretada**:

- el instrumento funciona por principios eléctricos reales;
- las lecturas no dependen de creencias, rituales ni voluntad;
- Lumen puede atribuir significado supersticioso a comportamientos que tienen explicación técnica;
- esa tensión debe empujar al jugador a observar, medir, comparar y construir una explicación mejor;
- Lumen no es un bufón ni un ignorante absoluto: su saber práctico es valioso, sólo está incompleto y contaminado por tradición.

Esto refuerza el conflicto central de Ohmdal: conocimiento técnico perdido que sobrevive fragmentado entre prácticas útiles, memoria y superstición.

## Rol jugable y pedagógico

El Galvanoscopio es una herramienta diegética de investigación. Debe permitir que el jugador interrogue físicamente el mundo en vez de responder quizzes.

Debe conservar:

- gran dial analógico legible;
- aguja mecánica visible;
- lectura útil de continuidad/resistencia y estados eléctricos que el gameplay requiera;
- dos sondas físicas independientes;
- interacción explícita con bornes, conductores, máquinas y circuitos;
- feedback comprensible por observación antes de formalizar vocabulario;
- silueta inequívoca de instrumento de diagnóstico, nunca de arma.

La escala exacta y las magnitudes impresas deben coordinarse con el sistema pedagógico antes de usarse como números canónicos. El concept define la **forma y gramática visual**, no una tabla eléctrica final.

## Dirección visual aprobada

Autoridad primaria:

`assets/references/hero-packs/galvanoscope/galvanoscope-turnaround-v1.webp`

Referencia complementaria de viewmodel/ergonomía:

`assets/references/hero-packs/galvanoscope/galvanoscope-first-person-v1.webp`

El instrumento debe leerse como **artefacto original técnicamente refinado + mantenimiento local posterior**.

### Núcleo antiguo

- caja compacta de madera técnica oscura;
- gran dial circular protegido por vidrio;
- bisel, mecanismos y controles de latón/cobre envejecido;
- bornes/aisladores cerámicos;
- aguja y mecanismo interior finos y precisos;
- selector físico grande;
- placas y marcas grabadas;
- construcción deliberada, simétrica y funcional.

### Reparaciones posteriores de Lumen

Las reparaciones deben ser pocas y legibles, no convertirlo en chatarra:

- cables textiles remendados;
- empalme con cinta/resina o abrazadera local;
- una sonda puede no coincidir exactamente con la otra;
- mango/correa o fijación sustituida;
- tornillería menor no uniforme.

El contraste visual debe permitir inferir qué pertenece al diseño original y qué fue mantenido o reemplazado después.

## Proporción y uso

- altura objetivo aproximada: **24 cm**, aceptable dentro de 22–28 cm si la prueba de viewmodel lo exige;
- portátil y manipulable con una o dos manos;
- mango superior funcional para transporte;
- en primera persona el dial debe ser legible sin cubrir landmarks centrales ni UI;
- las sondas y cables deben poder separarse como piezas semánticas si el gameplay lo requiere;
- la aguja debe permanecer separada y pivotable.

## Materiales

Familia aprobada:

- madera técnica oscura y gastada;
- latón/cobre envejecido;
- cerámica clara en aisladores/sondas;
- vidrio en el dial;
- acero pavonado/metal oscuro para piezas secundarias;
- cable textil aislante.

No usar emisión pasiva como identidad.

## Debe preservar

1. silueta compacta rectangular con esquinas suavizadas;
2. gran dial circular dominante;
3. mango superior;
4. selector analógico frontal;
5. dos bornes claramente diferenciados;
6. dos sondas independientes y sus cables;
7. asimetría de reparación local en al menos una sonda/cable;
8. lectura visual de instrumento antiguo funcional;
9. mezcla de precisión original y mantenimiento posterior;
10. legibilidad en primera persona.

## Prohibido

- multímetro digital moderno;
- pantalla LCD/LED;
- arma, pistola o herramienta con gatillo;
- steampunk ornamental sin función;
- bobinas, tubos o glow agregados sólo para “hacerlo eléctrico”;
- runas mágicas o símbolos sin función;
- afirmar que Lumen lo diseñó o inventó;
- hacer que las mediciones respondan realmente a superstición;
- copiar el dispositivo mood de Outer Wilds como diseño;
- usar placeholders runtime previos como autoridad visual.

## Libertad del modelador

Puede resolver sin nuevo gate:

- espesor exacto del chasis;
- estructura oculta y tornillería secundaria;
- topología y segmentación runtime;
- construcción interior no visible;
- recorrido de cables cuando no contradiga las referencias;
- pequeños desgastes y reparaciones coherentes.

Debe escalar si necesita cambiar silueta, dial dominante, número de sondas, materialidad principal, ergonomía fundamental o lectura narrativa del objeto.

## Pipeline preferido

Por tratarse de una pieza mecánica/controlable, el default es el golden path de Ohm:

`reference pack aprobado → reconstrucción determinista en Blender → preview multivista → comparación contra referencia → GLB canónico → PlayCanvas → Visual Harness`.

No se requiere Meshy/Tripo para iniciar. Un proveedor generativo sólo entra si Blender-first demuestra una limitación real y vuelve a requerir el gate económico correspondiente.

## Acceptance visual

Antes de integración final:

- front/3-4/side/back preservan el concept;
- dial, selector, bornes y mango coinciden en proporción relativa;
- aguja y sondas siguen separadas/pivotables;
- reparaciones son visibles pero subordinadas al instrumento original;
- no hay glow pasivo;
- escala de mano creíble;
- viewmodel first-person deja leer dial y mundo;
- el objeto parece heredado de una Ohmdal técnicamente más competente que su presente.

La imagen generada contiene texto decorativo de concept. **Ese texto no es canon literal salvo lo ratificado en este brief.** Números de serie, frases de placas y escalas impresas son placeholders visuales hasta que gameplay/guion los aprueben.