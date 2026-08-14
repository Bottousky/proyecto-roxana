---
status: PROPOSED
authority_level: 3
version: v1
last_ratified: 2026-08-14
supersedes:
  - docs/sessions/v1/_reference_gdd_reboot_v1/01_OHMDAL_GDD_REBOOT_v1.md (sección 1 — resumen ejecutivo; sección 3 — premisa narrativa; sección 16 — criterio de éxito)
  - draft "Borrador — Ohmdal Vision" contenido en B_OHMDAL_PRODUCTION_GDD_SESSION.md §2 y §3
depends_on:
  - docs/00-governance/ROXANA_GAME_DESIGN_PILLARS_v1.md
  - docs/00-governance/ROXANA_CANON_POLICY_v1.md
  - docs/00-governance/ROXANA_DESIGN_LANGUAGE_v1.md
  - docs/ohmdal-biblia/00_MASTER_INDEX.md
  - docs/ohmdal-biblia/01_CANON_AUDIT.md
  - docs/ohmdal-biblia/04_WORLD_BIBLE.md
open_questions:
  - GQ-1 (transversal) — conviven o se separan las capas de formalización por mundo
  - GQ-3 (transversal) — periodicidad y forma del regreso a Ohmdal desde el Instituto
  - GQ-4 (transversal) — cómo se gobiernan los cruces con Bitland/Physica/Arithmos sin diluir CONECTAR
  - VIS-Q1 — qué mínimo narrativo de "responsabilidad ética del Instituto" puede cargarse dentro del slice del Arco I sin romper la curva pedagógica
  - VIS-Q2 — si Ohmdal ofrece un cameo explícito del Instituto dentro del juego base o sólo a través de la Bitácora y el Portal
  - VIS-Q3 — si "Ohm como testigo" introduce spoiler narrativo cuando el autómata narra su memoria fragmentada
---

# Ohmdal — Visión de producción · v1

Documento fundacional del GDD de producción de Ohmdal. Declara **fantasía, promesa, verbo nuclear, anti-pilares y criterio de éxito**. No describe campañas, mapas, puzzles, personajes específicos ni elección tecnológica.

> **Estado.** Nace `PROPOSED`. Deriva de los pilares (nivel 0), del lenguaje de diseño (nivel 1) y del cuerpo canónico existente en `docs/ohmdal-biblia/`. La promoción a `CANON` requiere un ADR firmado por Manuel y evidencia de prototipo (Canon Policy §5).

---

## 1. North Star

> El jugador debe poder mirar una instalación de Ohmdal, formar un modelo mental de cómo circula y se controla la energía, intervenirla y observar al mundo reaccionar.

Tres consecuencias operativas:

- **El modelo mental precede al símbolo.** Una escena no entrega `V = I·R` antes de que el jugador haya visto dos puntos a los que conectar una lectura y un resultado.
- **Intervenir es la acción primaria.** No se observa pasivamente. Cualquier fenómeno visible habilita al menos un modo de manipulación.
- **El mundo responde con cambio observable.** La consecuencia toca infraestructura, comunidad, sonido, luz o material. El sistema nunca termina en un cartel de "correcto".

Esta línea rectora se hereda del pack de la sesión P2 y se eleva a autoridad propia para que todo documento de Ohmdal pueda citarla sin reescribirla.

## 2. Fantasía del jugador

> Soy capaz de entender una civilización eléctrica que conservó procedimientos pero olvidó principios. Leo su infraestructura como otros leerían magia, la reparo, la rediseño y devuelvo funciones enteras a la vida.

La fantasía no es la del electricista profesional. Es la de la persona que, sin haber cursado un año escolar, mira una red y entiende por qué falla. Conecta cuatro pilares:

- **P01** — la disciplina existe como regla del mundo: lo que el jugador aprende modifica qué puede manipular.
- **P09** — el juego sobrevive sin la etiqueta "educativo": la fantasía sostiene la motivación, el temario es insumo.
- **P08** — el conocimiento restaura: la marca observable de aprender es el mundo cambiado, no el contador.
- **P15** — Roxana culmina en integración: Ohmdal es uno de los cinco mundos, no un compartimento cerrado.

### Lo que la fantasía NO es

- **No es fantasía de superhéroe.** El jugador no es "elegido" ni tiene acceso a un poder mágico.
- **No es fantasía de sabio.** El protagonista llega sin formación previa; su ventaja es mirar, documentar y comparar.
- **No es fantasía de acumulador.** No hay inventario que crece ni poder que sube. La progresión amplía qué puede observarse, no qué puede destruirse.
- **No es fantasía de salvador.** Una comunidad consciente no espera al visitante; la restauración funciona cuando los habitantes pueden sostenerla sin él (D03, D25 del registro de decisiones cerradas).

## 3. Verbo nuclear

**CONECTAR.** No en sentido metafórico. En sentido físico y topológico: cerrar trayectorias, distribuir energía, proteger cargas, dirigir corriente, almacenar carga, gobernar señal, automatizar respuesta.

El verbo se ramifica en verbos primarios y secundarios según el pack de la sesión:

- **Primarios:** observar, medir, conectar, regular, activar.
- **Secundarios:** aislar, derivar, proteger, invertir polaridad, almacenar, descargar, temporizar, conmutar, sensar, accionar, automatizar, optimizar.

Estos verbos son la gramática operativa del mundo. Cualquier escena, puzzle, NPC o beat debe poder responder a la pregunta **"¿qué verbo de CONECTAR refuerza?"**. Si la respuesta es "ninguno" o "uno ajeno", pertenece a otro mundo (P03) o debe ser reescrita (D02).

## 4. Premisa dramática

> Ohmdal fue apagándose cuando sus habitantes dejaron de preguntarse por qué había luz.

Consecuencias de la premisa (consolidadas en `04_WORLD_BIBLE.md` §1–§2):

1. **No hay villano.** El conflicto es la acumulación social de procedimientos sin modelo. El Consejo sella sistemas por miedo documentado, no por maldad.
2. **La pérdida es gradual.** Cuarenta años en cinco etapas (Fundación → Eficiencia → Aislamiento → Ritualización → Contención → Presente). Ningún corte limpio.
3. **La restauración tampoco es mágica.** Cuando el jugador mide, documenta y comunica, las comunidades recuperan la capacidad de mantener el mundo. La luz vuelve porque la pregunta vuelve.
4. **El protagonista es un estudiante.** Cuatro diseños equivalentes; nombre y pronombres configurables. No es elegido. Su ventaja es la atención y la posibilidad de comparar modelos (D04).

## 5. Promesa jugable

Ohmdal entrega al jugador:

| Capacidad observable | Cómo se gana | Cómo se transfiere |
|---|---|---|
| Distinguir conexión, material y daño | Inspección inicial y lectura visual de la infraestructura | Identificar una falla nueva en otra sala o región |
| Recomponer y verificar una trayectoria | Cerrar el primer circuito completo en el slice | Aislar ramas, falsos contactos y rutas en sistemas mayores |
| Elegir magnitud, referencia y rango | Habilitar el primer instrumento de medición DC | Contrastar hipótesis antes de energizar |
| Anticipar calor, límite y protección | Diagnosticar una falla que dispara protección | Decidir cuándo conviene un sistema menos potente pero sostenible |
| Predecir antes de energizar | Pedir predicción explícita antes de una intervención crítica | Transferir la estrategia a una topología que no vio antes |
| Documentar para otro | Dejar un esquema que un NPC repite | Mantener la cadena entre regiones, sin que el protagonista sea indispensable |

La promesa **no** incluye: nivel de personaje, daño, loot, vidas, energía de espera, gacha, microtransacciones, cuestionarios como puerta, fórmulas como contraseña ni múltiples finales.

## 6. Anti-pilares explícitos

Heredados de `05_GAME_DESIGN_DOCUMENT.md` y ratificados aquí como referencia operativa única:

- combate, daño, enemigos derrotables o loot de poder;
- grind, energía de espera, vidas, gacha o microtransacciones;
- cuestionarios que abren puertas o fórmulas usadas como contraseña;
- ensayo ciego hasta coincidir con una solución oculta;
- exposición que resuelve el fenómeno antes de tocarlo;
- mapa abierto grande con contenido de relleno;
- evaluación formal dentro del camino crítico;
- **multiple choice como interacción principal de ningún puzzle** (regla dura P1 confirmada por el pack P2);
- **tecnología como sustituto de diseño** (regla dura de la sesión P2; tampoco se elige motor aquí).

## 7. Audience y entrada

- **Audience primaria:** 13–18 años y adultos. Entrada desde cero. Rigor por capas. Lenguaje rioplatense natural sin abuso de modismos (D07).
- **Lengua:** español neutro con tuteo. La Bitácora conserva personalidad, tachones, dibujos y, luego, términos técnicos.
- **Puerta de entrada al mundo:** el Portal del Instituto. No se reescribe la llegada como cinemática larga; la primera cámara debe permitir acción dentro del primer minuto jugable.
- **Salida emocional del Arco I:** la pregunta vuelve, no la luz. La Bitácora reescribe la vivencia como evidencia y formalización.

## 8. Criterio de éxito (cualitativo)

Ohmdal funciona cuando un jugador puede describirlo así:

> «Es un reino de aventura donde arreglás lugares entendiendo cómo circula y se controla la electricidad.»

Y no así:

> «Es un RPG que te hace ejercicios de electrónica.»

(Verbatim del reboot legacy §16, mantenido como criterio.)

Tres condiciones verificables en prototipo:

1. **Identidad:** un jugador distingue Ohmdal de un minijuego de física o de un simulador de banco eléctrico sin que se lo digan.
2. **Transferencia:** un jugador que resolvió la Calzada aplica la misma estrategia a la Forja sin tutorial adicional.
3. **Restauración:** un personaje del mundo puede repetir la intervención del protagonista sin su presencia (D03, D25).

## 9. Relación con el resto del proyecto

- **Con el Instituto (P12):** Ohmdal comparte protagonista, Bitácora, metaprogresión, misterio global y reglas pedagógicas. No comparte cámara, combate, género ni arte exacto. Los cruces interdisciplinarios esperan a que cada mundo tenga identidad jugable propia (P15).
- **Con Bitland, Physica y Arithmos:** existe una **posibilidad** de cruce en `El Empalme` (Arco VII), no antes. CONECTAR no se diluye en PROGRAMAR, EXPERIMENTAR ni TRANSFORMAR hasta que esos mundos tengan sus propios GDD de producción.
- **Con la Bitácora global:** la Bitácora de Ohmdal es la misma Bitácora del Instituto. Las entradas producidas en Ohmdal se leen, dibujan y traducen localmente; la capa de formalización global se somete a GQ-1.

## 10. Lo que este documento NO es

- No es un GDD de campaña. Las campañas se diseñan en `content/ohmdal-arc-01_v1.md` y siguientes.
- No es una biblia de personajes. Los personajes viven en `narrative/ohmdal-narrative-bible_v1.md`.
- No prescribe paleta, tipografía ni estilo artístico. La dirección visual canónica está en `docs/ohmdal-biblia/08_VISUAL_DIRECTION_BIBLE.md`.
- No prescribe motor, framework ni arquitectura técnica. Eso vive en el `START_HERE.md` y en el ROADMAP.
- No redefine los pilares. Si la visión entra en conflicto con un pilar, el conflicto se eleva a ADR (Pillars §2).
