# Vertical slice — La pregunta vuelve

**Estado:** contrato canónico; ejecución no autorizada
**Recorrido:** Portal → Plaza → Edda → Ohm → Lumen → Puerta de Ohm → Manantial

## Objetivo

Probar en una experiencia de 25–35 minutos que Ohmdal puede unir narrativa, aprendizaje auténtico
y una presentación Three.js HD-2D de alta calidad en web. El slice no intenta demostrar el juego
completo; debe invalidar temprano una dirección visual, técnica o pedagógica que no funcione.

## Hipótesis que debe probar

1. Un entorno 3D de diorama y personajes 2D pueden sentirse integrados, no superpuestos.
2. La cámara controlada puede favorecer exploración, lectura de circuitos y emoción sin frustrar navegación.
3. El jugador puede aprender circuito completo, medición básica y diagnóstico sin cuestionario ni banco modal.
4. Edda, Ohm y Lumen pueden expresar tres relaciones distintas con el conocimiento en pocos minutos.
5. Una transformación técnica puede cambiar espacio, sonido, actividad social y comprensión, no sólo encender luces.
6. La experiencia puede cargar y responder bien en desktop y mobile web con calidad adaptable.

## Alcance cerrado

### Tres sets, no una región completa

1. **Portal y Plaza:** llegada, encuadre del diorama, encuentro con Edda y lectura del sistema apagado.
2. **Taller de Lumen:** interior/exterior compacto con el puzzle principal de diagnóstico.
3. **Puerta y Manantial:** transferencia del aprendizaje, apertura, transformación y cierre.

Pueden compartir una escena exterior y un interior cargado por separado. No se construyen Castillo, Forja, Terrazas ni Faro.

Un overworld explorable mínimo conecta el punto de llegada con la entrada a Cuenca de Ohm. Sólo
debe demostrar viaje, landmark y transición; no se produce el mapa de Ohmdal.

### Reparto

- Protagonista: uno de cuatro diseños completos; para el slice basta un diseño representativo si
  el manifest declara la deuda de variantes.
- Edda: aliada regional en dos o tres cruces, no compañera permanente.
- Lumen: sprite/híbrido con ritual de taller y cambio de actitud.
- Ohm: compañero permanente y autómata consciente; comparar objeto 3D procedural con sprite bajo
  cámara/presupuesto idénticos.
- Dos o tres habitantes de fondo reutilizables para probar escala y vida comunitaria.

### Sistemas incluidos

- Caminar, observar, interactuar y conversar.
- Una microinteracción de circuito completo para activar a Ohm.
- Un puzzle principal de diagnóstico con instrumento.
- Una transferencia breve en la Puerta de Ohm.
- Bitácora con vivencia ilustrada, evidencia, formalización y enlace opcional de evaluación.
- Guardado de entrada/salida del slice.
- PWA/offline mínimo, controles de teclado y táctiles.
- Calidad gráfica adaptable y texto de estado determinista para pruebas.

### Fuera de alcance

Combate, inventario RPG general, economía, crafting, mundo abierto, ciclo día/noche, clima sistémico, voces completas, cinemáticas prerenderizadas, múltiples finales, assets hero pagados y migración de `/jugar`.

## Flujo jugable

### Beat 1 — Llegada

El Portal deposita al protagonista en una plaza donde el agua, las luces y un mecanismo público parecen reaccionar de forma incoherente. La cámara revela relaciones espaciales antes de permitir movimiento. No hay exposición del currículo.

**Evidencia:** trazas de cobre, desgaste, una luz residual, agua detenida y reparaciones incompatibles.

### Beat 2 — Edda pregunta

Edda no explica el sistema: describe lo que observa y contrasta dos relatos locales. Invita al
jugador a mirar y luego toma una ruta propia; reaparece después de Lumen con evidencia obtenida
fuera de cámara.

### Beat 3 — Activación de Ohm

El jugador recompone un circuito de baja tensión claramente ficticio y seguro: identifica una
interrupción visible, conecta el retorno y anticipa qué indicador cambiará. Ohm despierta como
autómata consciente y acuerda acompañar al estudiante; no es premio ni propiedad.

**Aprendizaje:** para que exista una respuesta sostenida hace falta una trayectoria completa y una diferencia de potencial; los términos y valores definitivos requieren ficha V2.

### Beat 4 — Lumen y el ritual

Lumen sabe qué piezas «suelen funcionar», pero no puede explicar por qué esta reparación falla. Presenta tres piezas con comportamiento diferente y un procedimiento heredado. El jugador puede respetar su experiencia y, a la vez, contrastarla.

### Beat 5 — Puzzle de Lumen

El jugador:

1. inspecciona esquema, conexiones y rastros físicos;
2. registra una hipótesis sobre el tramo problemático;
3. elige magnitud, referencia y puntos de medición con ayuda contextual;
4. mide y compara, sin perder por un rango incorrecto en esta primera versión;
5. sustituye o reajusta una pieza;
6. verifica que el resultado coincide con su predicción;
7. deja un esquema/registro que Lumen puede repetir.

Las tres «piedras» anteriores pueden sobrevivir como carcasas diegéticas de resistencias o módulos, pero la solución no consiste en elegir alta/media/baja por intuición. Valores, topología y tolerancias quedan bloqueados hasta validación V2.

### Beat 6 — Puerta de Ohm

La puerta presenta la misma relación causal en otra disposición. No añade una fórmula nueva: exige transferir la estrategia de aislar, medir y verificar. Debe admitir al menos dos órdenes de diagnóstico y no aceptar una intervención insegura.

### Beat 7 — Manantial

Al abrirse la puerta al crepúsculo, el agua vuelve a circular porque se restablece un sistema
legible. Cambian iluminación, partículas, sonido, rutas y señalética. Edda demuestra su propio
avance; Lumen repite el método a otra persona. La Bitácora reescribe la vivencia como evidencia y
formalización, y ofrece —si existe— evaluación opcional de La Escuela en nueva pestaña.

## Dirección visual canónica

### Decisión

Prototipo aislado en **Three.js**, cargado bajo demanda mediante `RuntimeHost`, con entornos
modulares 3D y personajes pixel art direccionales. Reutilizar el loader GLB/Draco existente antes
de añadir otro. Mantener Phaser como baseline de control/causalidad; no duplicar producción final.

### Motivo

Three.js ofrece profundidad, cámara, iluminación, niebla, agua y posprocesado coherentes con la meta. Los sprites limitan coste de modelado/rig/animación y conservan una identidad de ilustración en movimiento.

### Alternativas evaluadas

| Alternativa | Ventajas | Costes/riesgos | Estado |
|---|---|---|---|
| Phaser 2.5D | Base conocida, controles y modelos ya probados | Profundidad/luces/cámara más simuladas; puede quedarse corto visualmente | Baseline, no candidato principal |
| Three.js + sprites | Diorama real, luces y cámara; coste moderado de personajes | Oclusión, orientación, sombras y batching requieren solución específica | Dirección aprobada |
| Three.js + personajes 3D | Integración espacial y sombras naturales | Rig, animación, likeness y volumen de assets elevados; pierde contraste 2D/3D | No para el primer slice |

La elección de runtime final exige ADR después de la comparación. El slice no autoriza migrar el Arco I estable.

### Direcciones de sprites

Analizar footage oficial y ejecutar A/B 4/8 direcciones con recorrido/cámaras idénticos. Elegir el
mínimo que no produzca snaps, deslizamiento o pérdida de actuación. No producir atlas masivos
antes del veredicto.

## Cámara

- Perspectiva suave o proyección casi ortográfica: el spike selecciona la variante que mantenga
  legibilidad, escala y continuidad en todas las capturas aprobadas.
- Dos o tres encuadres autorales conectados por volúmenes; no rotación libre.
- Zoom limitado para lectura y accesibilidad.
- Ocultamiento/fade de foreground y techos.
- Composición que mantenga personaje, objetivo y consecuencia simultáneamente cuando el puzzle lo requiera.
- En mobile, controles y UI no deben tapar puntos de medición.

## Inventario de arte máximo

- Un kit modular de plaza/camino/piedra/cobre/agua.
- Un kit de taller con mesa, estantes, herramientas y piezas legibles.
- Una puerta mecánica modular y su infraestructura.
- Portal y manantial como landmarks.
- Cuatro presets completos del protagonista, Ohm, Edda y Lumen; dos habitantes pueden derivarse
  del mismo sistema visual. El slice puede implementar un preset representativo sólo si registra
  la deuda y demuestra que el contrato soporta los cuatro.
- Instrumento, cables, conectores, indicadores y esquema diegético.
- VFX de agua, polvo, conducción/estado, niebla y restauración.
- Un set de audio ambiente y tres estados musicales/sonoros.

Todo asset debe tener manifest, origen/derechos, escala, pivote, frente, collider, presupuesto y estado de QA. No se genera la Plaza completa como una malla única.

## Presupuesto inicial a validar

| Métrica | Mobile | Desktop |
|---|---:|---:|
| Piso de experiencia | 30 fps en dispositivo objetivo | 60 fps objetivo en equipo de referencia |
| Draw calls visibles | ≤150 | ≤250 |
| Triángulos visibles | 150k–300k | 400k–700k |
| Luces con sombra | 1 máximo | 1 principal; segunda sólo con evidencia |
| Texturas frecuentes | 512–1024 px | 1024 px; 2K sólo hero justificado |
| DPR | ≤1,5 adaptativo | adaptativo |
| Carga inicial del slice | objetivo ≤25 MB comprimidos | objetivo ≤25 MB comprimidos |

Son presupuestos de diseño, no métricas alcanzadas. Deben revisarse en dispositivo Android físico y con `renderer.info`; SwiftShader no aprueba rendimiento.

## Audio y actuación

- Voces parciales en despertar de Ohm, quiebre de Lumen, intervención de Edda y cierre.
- Todo diálogo permanece escrito y subtitulado.
- Música propia de orquesta + electrónica; las capas electrónicas aparecen al comprender.
- La progresión tarde → crepúsculo se refleja en arreglo, ambiente y actividad, no sólo exposición.

## Gates de aceptación

### Narrativo

- El jugador entiende que el problema es pérdida de comprensión, no maldad.
- Edda, Lumen y Ohm tienen funciones y voces diferenciadas.
- La apertura del manantial cierra una unidad emocional y abre mundo.

### Educativo

- Contenidos centrales en V2.
- Al menos 80% de usuarios de prueba puede explicar la causa con evidencia sin repetir sólo la metáfora.
- Un error produce información y puede recuperarse.
- Existe transferencia real en la puerta.

### Visual

- Capturas desktop y mobile comparadas con un moodboard de cualidades legalmente trazado.
- Sprites, suelo, sombras y oclusión se perciben como un mismo mundo.
- La intervención transforma composición, actividad y materialidad.
- Modo de reducción de partículas/movimiento y contraste legible.

### Funcional y técnico

- Build, tests, manifiestos y validación de GLB pasan.
- Sin errores de consola ni pérdidas evidentes al montar/desmontar.
- Controles completos por teclado y táctil; gamepad queda fuera del slice.
- Medición en hardware real; métricas de `renderer.info` guardadas.
- Chrome, Edge, Firefox y Safari recientes; PWA instalable y recorrido offline.
- Android medio de 2022 sostiene 30 fps sin recortar contenido.
- `/jugar` sin flags conserva su prólogo y tests.

### Legal y productivo

- Ningún asset replica material protegido.
- Fuentes, prompts, proveedor, fecha, coste y licencia registrados.
- El coste real permite estimar el juego base antes de expandir alcance.

## Condición de cierre

El slice termina con un veredicto explícito: **avanzar**, **corregir una segunda y última ronda**
o **descartar la dirección**. Compilar no cuenta como aprobación. Una tercera ronda requiere una
nueva decisión registrada.
