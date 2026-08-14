---
status: PROPOSED
authority_level: 3
version: v1
last_ratified: 2026-08-14
supersedes:
  - docs/sessions/v1/_reference_gdd_reboot_v1/01_OHMDAL_GDD_REBOOT_v1.md (sección 12 — dirección visual aplicada al territorio)
  - draft "Borrador — World Structure" contenido en B_OHMDAL_PRODUCTION_GDD_SESSION.md (referencias dispersas)
depends_on:
  - docs/00-governance/ROXANA_GAME_DESIGN_PILLARS_v1.md
  - docs/00-governance/ROXANA_CANON_POLICY_v1.md
  - docs/20-worlds/ohmdal/vision/ohmdal-vision_v1.md
  - docs/20-worlds/ohmdal/narrative/ohmdal-narrative-bible_v1.md
  - docs/ohmdal-biblia/04_WORLD_BIBLE.md
  - docs/ohmdal-biblia/15_DQ3_HD2D_RESEARCH_AND_APPLICATION.md
open_questions:
  - WS-Q1 — si la decisión "overworld + dioramas" (C02 del canon audit) admite un selector de regiones como atajo opcional de accesibilidad
  - WS-Q2 — si el Castillo debe tener interior navegable en el juego base o sólo fachada y dioramas exteriores
  - WS-Q3 — cuántas revisiones a una misma región puede hacer un jugador antes de que la región quede "agotada" (criterio de paso)
  - WS-Q4 — si las regiones del juego base requieren estado de "intervención en curso" distinto de "comprendido" o sólo transición
  - WS-Q5 — cómo se modela el tiempo meteorológico (clima, estación) sin romper la lectura de la infraestructura eléctrica
  - WS-Q6 — si el mundo permite revisita en orden libre o exige alguna dependencia mínima entre regiones
---

# Ohmdal — Estructura de mundo · v1

Declara la **organización territorial, la navegación y la transformación observable** del mundo de Ohmdal. No describe contenidos de cada región (eso vive en `arc-01_v1.md` y siguientes) ni la dirección visual (eso vive en `08_VISUAL_DIRECTION_BIBLE.md`).

> **Estado.** `PROPOSED`. Refina la decisión territorial canónica del World Bible (`04_WORLD_BIBLE.md` §"Estructura territorial") y la aterriza en un modelo de producción con atlas, kits y estados observables. La promoción a `CANON` requiere evidencia de prototipo.

---

## 1. Decisión territorial canónica

> **Overworld explorable en miniatura** + **dioramas regionales compactos**. Entrar a un punto carga un diorama denso con exterior, uno o dos interiores significativos e infraestructura visible. No es selector de nodos, no es mundo abierto seamless, no es grilla de pantallas. La cámara es autoral; la navegación es libre dentro de límites legibles.

### Motivo heredado

Densidad permite acercarse al estándar visual buscado, reutilizar módulos, hacer que una transformación sea visible al regresar y reducir tiempo de carga (D10 del registro de decisiones cerradas; `04_WORLD_BIBLE.md` §"Estructura territorial" → "Motivo").

### Alternativas evaluadas (heredadas)

- **Mundo abierto continuo:** amplitud, pero multiplica assets, streaming, navegación y contenido de relleno — *descartado*.
- **Pantallas/chunks cerrados:** económico y probado, pero contradice la nueva aspiración espacial — *descartado*.
- **Overworld + dioramas:** equilibrio entre viaje RPG, profundidad, coste y lectura — *adoptado*.

## 2. Anatomía del mundo

```
Ohmdal
├── Overworld simbólico (3D, escala comprimida)
│   ├── Landmark Cuenca de Ohm (entrada al juego base)
│   ├── Landmark Castillo de la Red
│   ├── Landmark Forja y Terrazas
│   ├── Landmark Faro y Lago
│   └── Landmarks de arcos futuros (sólo silueta, no producidos)
├── Dioramas regionales (cargados bajo demanda)
│   ├── Cuenca de Ohm (Portal, Plaza, Taller, Puerta, Manantial)
│   ├── Castillo de la Red (exteriores, barrios, interiores institucionales)
│   ├── Forja (exteriores, horno, terrazas, canal)
│   ├── Terrazas (acueducto, compuertas, depósitos)
│   ├── Faro y Lago (costa interior, archivo, faro, lago)
│   └── Dioramas de arcos futuros (sólo autorizados tras ADR)
└── Interiores
    ├── Uno o dos por diorama como máximo
    ├── Accesibles por proximidad o interacción
    └── Salen del diorama con transición controlada (sin pop)
```

## 3. Atlas productivo (territorios y ecología)

| Territorio | Juego base | Ecología técnica y social | Transformación visible |
|---|---|---|---|
| Portal y Plaza de Ohm | sí | Llegada, lenguaje común, instrumento, memoria pública | Los recorridos de energía y agua vuelven a ser legibles |
| Taller de Lumen | sí | Reparación práctica, piezas, medición y ritual | El taller pasa de recetas privadas a banco documentado |
| Calzada y Manantial | sí | Circuito completo, continuidad, distribución inicial | Se abre una ruta física y conceptual hacia el mundo |
| Castillo de la Red | sí | Gobierno, aislamiento, serie/paralelo, mantenimiento | Los barrios pueden separar fallas sin apagarse todos |
| Forja de Yesca | sí | Potencia, calor, materiales, producción y seguridad | La forja deja de sobrecargar la red y hace visibles sus límites |
| Terrazas | sí | Lazos, caída, diagnóstico y reparto | Agua y luz alcanzan niveles antes abandonados |
| Faro y Lago | sí | Señal, tiempo, almacenamiento y memoria | El faro comunica método, no sólo una señal de auxilio |
| Casa de Espejos y Esclusas | futuro | AC, fase, magnetismo y transformación | Ritmos distintos vuelven a sincronizarse |
| Puerto y Corazón Nuevo | futuro | Semiconductores, conversión, fuentes y motores | Máquinas reactivadas con límites y mantenimiento |
| Tribunal y Casa de Compuertas | futuro | Lógica, decisiones, control y responsabilidad | Reglas opacas se vuelven sistemas auditables |
| Antena y Observatorio | futuro | Modulación, RF, redes y ruido | Los territorios recuperan comunicación verificable |
| El Empalme | futuro | Proyecto integrado y conexión con Bitland | Ohmdal vuelve a enseñar fuera de sí mismo |

> **Regla:** los nombres de los territorios futuros son reserva canónica. Sólo se produce una región cuando el slice o backlog posterior a su veredicto lo autoriza. Esta regla es de `04_WORLD_BIBLE.md` §"Atlas productivo" y se eleva aquí.

## 4. Juego base: cuatro macroterritorios

Aplicación de `04_WORLD_BIBLE.md` §"Juego base como cuatro macroterritorios":

1. **Cuenca de Ohm:** Portal, Plaza, Taller, Puerta, Manantial.
2. **Castillo de la Red:** muralla, barrios de distribución, interiores institucionales.
3. **Forja y Terrazas:** corredor vertical compartido por energía, materiales y comunidad.
4. **Faro y Lago:** costa interior, archivo, señal y final de campaña.

Cada macroterritorio debe mostrar **tres estados observables** (D10):

- **Deteriorado.** Estado inicial. Lectura visual apagada, sonido ambiental reducido, rutas selladas, oficios con procedimientos que no terminan de cerrar.
- **Intervención en curso.** El jugador llegó, formuló hipótesis, pero el sistema todavía no se ha comprendido. Indicios visibles: instrumentos colocados, marcadores en escena, personajes en espera.
- **Sistema comprendido.** El mundo cambió. La luz vuelve, una ruta se abre, una comunidad retoma una tarea, los oficios cambian. No se trata sólo de más brillo: cambian recorridos, actividad comunitaria, sonido, luz, agua, señalética y documentación.

> Los nombres de los tres estados son la referencia operativa. Un cuarto estado "abandonado tras restauración" se evita por principio: el mundo restaurado conserva cicatrices, no vuelve a un pasado idealizado (D02 del canon audit, World Bible §"Leyes narrativas" 7).

## 5. Overworld — reglas operativas

- **Escala simbólica.** El overworld comprime distancias; no enseña topología eléctrica por distancia geográfica literal. No comparte escala con los dioramas.
- **Landmarks exagerados.** Cada macroterritorio tiene un landmark a escala mayor que la región interior para que se lea desde la cámara del overworld.
- **Navegación libre con dirección.** El jugador se mueve por la maqueta; la cámara lo acompaña con encuadre autoral. No hay rotación libre (H2).
- **Estado del landmark observable.** El landmark refleja el estado del macroterritorio: deteriorado (oscuro, silenciado), intervención (marcadores e instrumentos), comprendido (luz motivada, sonido, actividad).
- **Sin puzzles eléctricos complejos en el overworld.** El overworld sirve a viaje, orientación, anticipación y revisitas. Los puzzles viven en los dioramas.
- **Acceso por comprensión, no por nivel.** Una región puede ser visitada antes de que su puzzle esté "listo" pedagógicamente; el sistema no lo prohíbe, pero la región presenta el reto con affordances suficientes para la capacidad que el jugador ya tiene.

## 6. Dioramas — reglas operativas

- **Densidad.** Tres planos de lectura: foreground recortable, plano jugable, landmark. Cada diorama debe sostener la gramática visual canónica (`08_VISUAL_DIRECTION_BIBLE.md`).
- **Cámara por volúmenes.** Dos o tres encuadres autorales conectados por volúmenes; sin rotación libre. El zoom es limitado y accesible.
- **Infraestructura visible.** Los cables, las compuertas, los conductores, los interruptores, los instrumentos y los indicadores forman parte del diorama, no son superposiciones.
- **Personajes contextualizados.** Protagonista, Ohm, Edda, Lumen, habitantes de fondo comparten perspectiva, oclusión, luz de contacto y atmósfera con el 3D (`08_VISUAL_DIRECTION_BIBLE.md` §"Manifiesto").
- **Interiores significativos.** Uno o dos por diorama. Cargados como escena adicional o transición interna, según convenga al kit.
- **Salida controlada.** Salir de un diorama vuelve al overworld con transición. No se produce pop. El estado del diorama se persiste.

## 7. Estados del mundo y transformación observable

### 7.1 Tres estados canónicos por macroterritorio

| Estado | Lectura visual | Lectura sonora | Actividad comunitaria | Documentación |
|---|---|---|---|---|
| Deteriorado | Apagado, sombras dominantes, reparaciones visibles, decoloración | Ambiente reducido, sin zumbidos activos, agua detenida | Oficios en pausa, personajes en quietud, sellos visibles | Pocos o ningún cartel, instrumentos sin calibrar, croquis parciales |
| Intervención en curso | Luz motivada localizada, marcadores en escena, instrumentos en uso | Ambiente mixto, agua con caudal parcial, motores puntuales | Personajes activos, Edda en ruta, Lumen con herramientas, habitantes atentos | Notas del jugador en la Bitácora, esquemas a medio llenar |
| Sistema comprendido | Luz motivada distribuida, sombras legibles, actividad clara | Ambiente pleno, agua con caudal estable, motores en régimen, ritmo | Oficios sostenidos sin protagonista, habitantes repitiendo procedimientos, comunidad organizada | Esquemas completos, Bitácora con transferencia, NPC que mantiene lo aprendido |

### 7.2 Regla de "restauración real"

La restauración no es decorativa. Una región entra a "comprendido" sólo cuando:

- El sistema eléctrico funciona dentro de sus límites.
- Las protecciones están dimensionadas.
- Ninguna carga está en sobrecarga.
- Un NPC puede repetir el procedimiento sin el protagonista.
- La Bitácora tiene la entrada de formalización.

Si falta cualquiera, la región vuelve a "intervención en curso" con la anotación correspondiente.

## 8. Producción modular

### 8.1 Kits

Cada macroterritorio se construye con un kit modular:

- **Cuenca de Ohm:** plaza, camino, piedra, cobre, agua, taller, puerta, manantial, portal, instruments diegéticos.
- **Castillo de la Red:** muralla, fachada, barrios, interiores institucionales, lacres, conducciones.
- **Forja y Terrazas:** horno, cerámicas, cobre grueso, canales, terrazas, compuertas, vegetación condicionada.
- **Faro y Lago:** costa, faro, archivo, lago, instrumentos de luz, superficies de contacto.

Cada kit define módulo, esquina, transición, zócalo, abertura, baranda, suelo, decal/daño, conducción y prop repetible (heredado de `08_VISUAL_DIRECTION_BIBLE.md` §"Arquitectura y kits"). Ninguna región se entrega como malla única.

### 8.2 Manifiestos

Todo asset producido debe tener:

- Origen y derechos.
- Escala (en metros).
- Pivote.
- Frente y orientación.
- Collider.
- Sockets (puntos contractuales para conectar o animar).
- Presupuesto de GPU.
- Coste de pipeline.
- Variantes de LOD.
- Estado de QA.

Regla heredada de `01_CANON_AUDIT.md` §"Recomendación de autoridad" y del GDD canónico §"Definición de terminado por región".

## 9. Navegación entre regiones

- **Entrada:** interacción explícita con un landmark o puerta. La cámara prepara el encuadre antes de permitir la transición.
- **Salida:** volver al overworld desde un punto claro del diorama (plaza, camino principal, entrada del diorama).
- **Re-entrada:** persistencia del estado. El jugador vuelve al diorama en el estado en que lo dejó, con sus cambios registrados.
- **Revisita:** un macroterritorio "comprendido" sigue siendo visitable. La Bitácora indica qué se hizo y qué puede mejorarse (capa P11 opcional).

## 10. Lo que NO está en este documento

- No describe puzzles específicos. Las familias viven en `puzzle-grammar_v1.md`; los puzzles del Arco I, en `arc-01_v1.md`.
- No prescribe la presentación visual de cada región. La dirección visual vive en `08_VISUAL_DIRECTION_BIBLE.md`.
- No prescribe el atlas completo de los arcos futuros. La regla es que sólo se producen tras ADR y veredicto del slice.
- No redefine el conflicto del mundo. Ése vive en la biblia narrativa.
- No prescribe el orden de visita. La revisita es libre; los arcos imponen dependencias pedagógicas, no de itinerario rígido.
