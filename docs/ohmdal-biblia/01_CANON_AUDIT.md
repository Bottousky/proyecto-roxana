# Auditoría de canon y contradicciones

**Estado:** auditoría canónica cerrada
**Regla:** esta auditoría clasifica; no borra ni reescribe material histórico.

## Resumen ejecutivo

Ohmdal ya tiene una identidad fuerte: un mundo aplicado del Instituto Roxana, una pedagogía basada en experimentar y formalizar, un Arco I jugable, personajes reconocibles y una geografía con memoria material. Lo que falta no es cantidad de ideas sino una autoridad documental única y una separación rigurosa entre canon narrativo, contenido educativo, prototipos técnicos y generaciones visuales históricas.

Existen tres Ohmdal implementados o documentados que hoy se superponen:

1. **Arco I estable en `/jugar`:** cantera funcional y pedagógica, con cinco unidades, modelos puros, Bitácora y regresiones. Se preserva mientras se redefine el futuro.
2. **Spike `/labs/ohmdal-vnext`:** prueba Phaser de mundo continuo y puzzle diegético. Es evidencia reciente, no aprobación de dirección final.
3. **Documentos visuales anteriores:** greybox, pixel art, ilustración 2D, top-down procedural y bancos diegéticos. Contienen decisiones reutilizables, pero no pueden prescribir a la vez la nueva dirección 3D + 2D/híbrida.

La nueva definición resuelve el conflicto central: no hubo invasión, maldición ni antagonista sobrenatural. El olvido fue una acumulación social de procedimientos sin explicación. Esto permite conservar el deterioro, el temor del Consejo, los rituales de Lumen y la pérdida de infraestructura sin inventar una fuerza maligna.

## Fuentes revisadas y autoridad vigente

| Familia | Fuentes principales | Clasificación | Qué se conserva |
|---|---|---|---|
| Norte de producto | `START_HERE.md`, `vision-mundos-multilenguaje.md`, `plan-plataforma-cinco-juegos.md` | PRESERVAR | Shell compartido, runtimes bajo demanda, Bitácora común, Instituto/Ohmdal conectados |
| Diseño pedagógico | `diseno-sintesis-v1.md`, `guia-puzzles.md`, `estandar-implementacion.md` | PRESERVAR | Aprender haciendo, error informativo, predicción, consecuencia, transferencia |
| Ruta educativa | `ohmdal-ruta-contenidos.md`, unidades 1–5 | REVISAR | Secuencia DC y escenas valiosas; no se acepta como equivalencia curricular completa |
| Lore y territorio | `mapa-maestro-ohmdal.md`, `prologo.md`, documentos de mundo | PRESERVAR/REVISAR | Instituto, Mundos Aplicados, regiones y deterioro gradual; revisar cronología y ontología |
| Grilla antigua | `grilla-mundo-ohmdal.md`, `mapa-ohmdal-greybox.md` | HISTÓRICO | Nombres, relaciones espaciales y requisitos de navegación; no la grilla cerrada |
| Arte 2D/pixel | `biblia-arte-produccion-v0.md`, `sistema-arte-ohmdal-v1.md`, `plan-ohmdal-arte-pixel.md` | HISTÓRICO | Paleta material, contraste antes/después, lectura de mecanismos; no renderer ni pixel canon |
| Dirección 3D | `docs/3d/*` | ACTIVA COMO ESTÁNDAR PRODUCTIVO | Escala en metros, modularidad, manifests, presupuesto, QA y carga diferida |
| Dirección visual top-down | `docs/3d/VISUAL_BIBLE.md`, contratos del spike vnext | OBSOLETO PARA FUTURO | Gates de legibilidad y causalidad; no la prohibición de bitmaps o cámara obligatoria |
| Implementación estable | `src/jugar`, `src/puzzles`, pruebas asociadas | PRESERVAR | Modelos deterministas, contenido probado y ruta de regresión |
| Spike Phaser anterior | histórico, en el historial de git | EVIDENCIA | Mundo continuo, interacción diegética y datos de rendimiento; no define el runtime futuro |
| Prototipo anterior | `src/ohmdal` | HISTÓRICO | Investigación de ritmo y composición; no base productiva |
| Auditorías/revisiones | `revision-*`, `auditoria-*`, `plan-implementacion-*`, `spec-*` | EVIDENCIA | Hallazgos con fecha; distinguir los ya resueltos de los vigentes |
| Instituto/cinemática | biblias y entregas del Instituto | FUERA DE ALCANCE DIRECTO | Continuidad del universo y del prólogo; su lenguaje visual no obliga a Ohmdal |

## Canon confirmado por el nuevo encargo

- Ohmdal es un mundo narrativo educativo conectado con el Instituto Roxana.
- El conflicto es el olvido acumulado, no una fuerza maligna ni un villano secreto.
- La pérdida nace de dejar de preguntar, enseñar, documentar y comunicar.
- El jugador avanza mediante observación, medición, diagnóstico y reconstrucción; no mediante combate, grind o cuestionarios escolares.
- La magia aparente debe revelar una explicación reproducible.
- La estética aspiracional usa entornos 3D y personajes 2D/híbridos con cámara controlada, diorama, iluminación y VFX, dentro de límites web.
- La referencia comercial/visual no autoriza copiar propiedad intelectual.
- El currículo argentino de electrónica es referencia; una afirmación escolar dudosa se contrasta
  con fuentes, cálculos y tests, y sólo escala por contradicción, seguridad o incertidumbre real.
- La base estable no se rompe mientras la redefinición no haya superado un ADR y un vertical slice.
- Los habitantes son seres conscientes nacidos en Ohmdal; sus derechos y consecuencias son reales.
- El Instituto se desvinculó gradualmente durante cuarenta años y comparte responsabilidad ética.
- El protagonista es un estudiante sin formación previa, no elegido, con cuatro apariencias.
- Ohm es un autómata consciente y compañero permanente; Edda es aliada regional autónoma.
- DRAGON QUEST III HD-2D REMAKE es quality bar de coherencia en menor escala.

## Material anterior que merece preservarse

### Mundo y conflicto

- El Instituto creó Mundos Aplicados donde el conocimiento se aprende en contexto.
- Ohmdal y el Instituto reflejan la misma enfermedad: formas conservadas sin comprensión.
- La infraestructura visible cuenta historia: cobre, piedra, agua, mecanismos y señales.
- El Consejo no necesita ser culpable ni perverso. Puede haber sellado sistemas por miedo, responsabilidad mal entendida y falta de capacidad para mantenerlos.
- La restauración devuelve agencia colectiva; no corona al jugador como elegido.

### Personajes

- **Edda:** curiosidad activa; comienza como aprendiz y puede convertirse en mediadora y docente.
- **Lumen:** saber práctico convertido en ritual. No es villano; es la evidencia humana de una formación incompleta.
- **Ohm:** compañero de medición y memoria. Su naturaleza exacta sigue abierta.
- **Consejera:** institución, continuidad y miedo al daño.
- **Yesca, Guardiana y Farero:** oficios que encarnan maneras diferentes de conservar conocimiento. Los dos últimos necesitan nombre e historia propios.

### Pedagogía

- Fenómeno → manipulación → consecuencia → formalización.
- Predecir → observar/medir → explicar → transferir.
- El error cambia el sistema y aporta evidencia; no castiga ni humilla.
- La Bitácora no entrega respuestas anticipadas. Registra la evolución de la comprensión.
- El mundo debe aceptar más de una estrategia correcta cuando el modelo físico lo permita.

## Conflictos y contradicciones que deben resolverse

### C01 — Autoridad documental fragmentada

`START_HERE.md`, la ruta de contenidos, el mapa maestro, las unidades, las biblias visuales y los contratos de spikes se presentan en distintos momentos como canon. Recomendación: esta carpeta se vuelve autoridad sólo después de aprobación; los documentos anteriores pasan a fuentes trazables, no a verdades simultáneas.

### C02 — Lenguaje visual incompatible

Hay prescripciones de greybox cenital, pixel art, ilustración 2D, procedural sin bitmaps y ahora 3D con sprites/híbridos. Son generaciones de investigación, no una única dirección. Recomendación: conservar principios de legibilidad, materialidad y transformación; decidir renderer y cámara por un slice comparativo.

### C03 — Phaser estable versus slice Three.js

El spike anterior explora Phaser y mundo continuo; la nueva meta necesita profundidad, luces,
niebla, agua y cámara de diorama reales. Phaser sigue como baseline de interacción y Three.js es
el runtime aprobado para el slice visual aislado. No se migra `/jugar` ni se reemplaza su runtime
sin evidencia y ADR.

### C04 — «Desastre» singular versus olvido gradual

Textos anteriores sugieren un desastre o un orden de colapso demasiado limpio. Puede conservarse como explicación histórica incompleta de los habitantes, no como verdad ontológica. La verdad canónica es una degradación gradual con decisiones humanas comprensibles.

### C05 — Bitácora de dos versus tres capas

Código y documentos antiguos usan capas distintas. El canon fija tres: modelo técnico, comprensión del protagonista y metáfora/cultura local. La interfaz puede presentarlas progresivamente, pero el contenido autoral debe mantener las tres separadas.

### C06 — Lumen y el primer puzzle

Existen al menos dos versiones: tres piedras alta/media/baja y diagnóstico por puntos de medición. La segunda enseña mejor instrumentación y causalidad; la primera es más legible como metáfora. Recomendación: integrar ambas —piezas físicas diferentes, diagnóstico por medición— y validar la topología real.

### C07 — Alcance curricular sobredicho

La ruta actual habla de especialización técnica completa, pero cubre sobre todo fundamentos DC, AC, semiconductores, lógica y comunicaciones. Falta o subrepresenta instrumentación, seguridad, documentación, montaje, mantenimiento, control, redes, sistemas embebidos y proyecto. No debe prometer equivalencia con un título técnico.

### C08 — Años escolares versus arcos narrativos

La progresión existente no coincide uno a uno con planes jurisdiccionales recientes. Un arco puede integrar contenidos de más de un año por razones lúdicas. Recomendación: usar niveles de competencia y registrar correspondencias orientativas; sólo mencionar años concretos después de validación institucional.

### C09 — Metáforas eléctricas con riesgo conceptual

Expresiones como «el estanque guarda corriente», «la corriente se gasta», «ritmo = estanque × freno» o analogías hidráulicas sin límites pueden producir modelos erróneos. Toda metáfora debe declarar qué representa, dónde deja de funcionar y qué medición la reemplaza.

### C10 — Mapa extenso versus calidad y densidad

El mapa maestro proyecta muchas regiones, rutas y pantallas. Producirlas al estándar buscado diluiría calidad. Recomendación: el atlas queda como horizonte; el juego base usa cuatro macroterritorios densos con interiores y revisitas.

### C11 — Estado de finalización ambiguo

Casillas de ruta y auditorías pueden sugerir que regiones o contenidos están terminados, cuando lo terminado pertenece a la gramática anterior. Recomendación: separar siempre `contenido modelado`, `jugable estable`, `adaptado a nueva dirección` y `aprobado visualmente`.

### C12 — Precio de expansión y misión educativa

Cobrar por contenidos esenciales puede contradecir el propósito educativo. Recomendación: el juego base debe ser una experiencia completa y enseñar el núcleo declarado; los paquetes pagos amplían especialidades, casos y proyectos, sin quitar una conclusión narrativa o una competencia prometida.

## Riesgos verificables, no decisiones abiertas

1. Confirmar que los programas publicados por el Otto Krause no hayan sido sustituidos antes de
   publicar una correspondencia curricular fechada.
2. Validar los modelos eléctricos del slice con fuentes, cálculos y tests; escalar sólo seguridad,
   contradicciones o incertidumbre real.
3. Medir si cuatro u ocho direcciones reproducen el comportamiento observable de la referencia
   sin saltos en las cámaras aprobadas.
4. Medir coste por minuto y por región antes de prometer duración o precio definitivo de DLC.
5. Probar que el estudiante externo no desplaza la agencia de habitantes conscientes; Edda y los
   oficios deben poder mantener lo restaurado.
6. Verificar Android medio de 2022, navegadores objetivo, carga PWA y accesibilidad con hardware y
   usuarios reales.
7. Auditar que becas o financiación liberen el DLC completo y no creen una versión educativa
   recortada.

## Recomendación de autoridad

La carpeta completa `docs/ohmdal-biblia/` es la fuente de verdad de Ohmdal. `/jugar` permanece
como base estable y las fuentes anteriores como cantera hasta que cada unidad sea reescrita,
validada y sustituida con evidencia y ADR.
