# Juego base, expansiones y DLC

**Estado:** política canónica de producto; precios y calendario se fijan con evidencia de producción.

## Principio

El juego base **La Luz** es gratuito y completo como historia, experiencia y promesa educativa.
Una expansión añade una nueva pregunta, territorio, familia de sistemas y proyecto: nunca vende
la respuesta al final del juego base ni retiene una competencia que este haya prometido enseñar.

El modelo es híbrido: DLC avanzados económicos, acceso institucional y becas o patrocinadores
capaces de liberar expansiones completas. No habrá versiones educativas recortadas, mecánicas
predatorias ni puertas de compra dentro de una escena educativa.

## Juego base gratuito — La Luz

Incluye:

- prólogo y epílogo cerrados;
- cuatro macroterritorios densos conectados por un overworld explorable en miniatura;
- cultura y seguridad de Taller de 1.º–3.º;
- medición, instrumentación, fundamentos DC, redes, potencia, diagnóstico y documentación;
- fundamentos seleccionados de Circuitos y Laboratorio de 4.º;
- Bitácora completa para todo contenido formalizado;
- PWA instalable, campaña descargable y partidas locales;
- accesibilidad y controles completos por teclado y táctil;
- guía docente sobre el mismo juego, sin dashboard ni modo aula separado.

No se presenta como «curso completo de Técnico en Electrónica» ni como equivalente a un año del
Otto Krause. Las evaluaciones formales pertenecen a **La Escuela** y se abren, de manera opcional,
desde la Bitácora en otra pestaña; nunca bloquean la aventura.

## Expansiones canónicas

| Paquete | Contenido nuevo | Territorios posibles | Valor independiente |
|---|---|---|---|
| La Marea | AC, frecuencia, magnetismo, transformadores, instrumentos | Casa de Espejos, Esclusas | Comprender sistemas periódicos y transformación de energía |
| La Señal | Semiconductores, fuentes, sensores, amplificación y diagnóstico | Puerto, Corazón Nuevo | Seguir una señal a través de etapas y ruido |
| Las Máquinas | Instalaciones, potencia, protección, conversión y motores | Forja profunda, Corazón Nuevo | Producir y mover sin ocultar coste, límite o riesgo |
| La Decisión | Lógica, programación, memoria, embebidos, actuadores y control | Tribunal, Casa de Compuertas | Diseñar reglas auditables y asumir sus consecuencias |
| La Voz | Modulación, RF, redes y comunicaciones | Antena, Observatorio | Comunicar con restricciones, interferencia y responsabilidad |
| El Empalme | Proyecto integrado, mantenimiento y conexión con Bitland | Frontera entre mundos | Construir y documentar una solución que otros puedan sostener |

La división sigue familias publicadas por el Otto Krause, pero no convierte cada paquete en un
año ni en una materia. Un lanzamiento puede agrupar arcos si separarlos perjudica continuidad,
acceso o viabilidad. La campaña, los personajes y el conocimiento local siguen siendo compatibles
a través de actualizaciones de la PWA.

## Política económica y de acceso

- Los DLC tendrán precio bajo y regionalizado; la cifra se fija después de medir duración,
  validación, soporte, comisiones e impuestos. No se publica hoy un precio nominal.
- Escuelas, becas, bibliotecas o patrocinadores pueden liberar el paquete completo para una
  persona o cohorte.
- La licencia institucional no crea contenido exclusivo ni una versión reducida para estudiantes.
- No hay cuentas obligatorias. La vinculación institucional y la exportación de métricas son
  voluntarias y explícitas.
- Las campañas descargadas y las partidas locales deben continuar sin conexión.
- Cada paquete incluye las fichas docentes correspondientes al mismo juego.
- Compatibilidad y soporte se declaran por lanzamiento; ningún DLC se vende antes de verificar
  que la versión base soportada puede abrirlo, guardarlo y desinstalarlo sin perder la partida.

## Reglas para producir expansiones coherentes

- Reutilizar shell, Bitácora, instrumentos, personajes y kits compatibles.
- Añadir una mecánica educativa central por paquete, no un runtime nuevo por costumbre.
- Construir territorios por módulos y estados; nunca como una malla hero monolítica.
- Mantener modelos técnicos puros, deterministas y testeables.
- Cargar zonas y assets bajo demanda y liberar recursos al desmontar.
- Reutilizar elenco sólo cuando su arco lo justifique; evitar cameos de relleno.
- Dar a cada expansión principio, transformación y cierre propios.
- Mantener fallas sistémicas recuperables; no introducir combate, grind ni cuestionarios
  diegéticos.
- Registrar assets, fuentes, derechos, presupuestos y evidencia con los mismos gates del juego
  base.

## Riesgos verificables antes de publicar un DLC

| Riesgo | Evidencia exigida |
|---|---|
| Precio inaccesible o inviable | análisis regional de coste, soporte y acceso institucional |
| Fragmentación de cohortes | prueba de licencias/becas y compatibilidad entre partidas |
| Promesa curricular excesiva | matriz de cobertura V0–V4 y revisión de comunicación pública |
| Dependencia de conexión o cuenta | instalación, arranque y guardado offline sin login |
| Ruptura de partidas | pruebas de migración, instalación y desinstalación del paquete |
| Crecimiento técnico sin control | métricas de peso, carga, memoria, `renderer.info` y dispositivo objetivo |

Estos riesgos no reabren la dirección del producto: determinan si un paquete concreto puede
publicarse, corregirse o debe posponerse.
