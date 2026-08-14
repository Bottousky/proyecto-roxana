# Mapa de documentación

Este índice evita que una entrega histórica se confunda con una decisión vigente.

## Arquitectura documental vigente · v1 (sesiones P1–P6)

La constitución y biblias de producción de Roxana, ratificadas en las sesiones de
diseño del 14 de agosto de 2026, viven ahora bajo una jerarquía por `authority_level`
(ver `docs/00-governance/ROXANA_DOCUMENT_ARCHITECTURE_v1.md` §1).

**Status actual:** toda la v1 nace como `PROPOSED`. La promoción a `CANON` requiere
ratificación autoral explícita mediante un ADR firmado por Manuel
(`ROXANA_CANON_POLICY_v1.md` §5). Hasta entonces, ningún doc puede tratarse como regla
vigente sin esa firma.

| Capa | Contenido | Autoridad |
|---|---|---|
| [`docs/00-governance/`](00-governance/) | 5 docs fundacionales y operativos: pilares, lenguaje de diseño, política de canon, arquitectura documental, checklist de revisión. | nivel 0–1 |
| [`docs/10-global/`](10-global/) | 8 docs de biblia global: Instituto, Bitácora como sistema, metaprogresión, narrativa global, perfil del jugador, UI/UX común, estructura de campañas, criterios de vertical slice global. | nivel 2 |
| [`docs/20-worlds/`](20-worlds/) | 10 docs por cada uno de los 4 mundos (Ohmdal, Physica, Bitland, Arithmos): vision, gameplay, narrativa, contenido, producción. | nivel 3–5 |
| [`docs/30-integration/`](30-integration/) | 2 docs: catálogo de cruces interdisciplinarios, mapa de autoridad de contenido. | nivel 3 |

> **Bitland y Arithmos** mantienen toda su lore como `PROPOSED` hasta ratificación
> autoral explícita (ver `bitland-vision_v1.md` §5 y `arithmos-vision_v1.md`).

## Sesiones de diseño (proceso)

[`sessions/v1/INDEX.md`](sessions/v1/INDEX.md) es el mapa de las **seis sesiones de diseño**
que llevaron los GDD Reboot a la arquitectura documental vigente arriba. Orden recomendado:
P1 → P2 → P3 → P4 → P5 → P6, no en paralelo. Cada sesión tiene Definition of Done propio y
los packs A–F contienen los prompts de arranque. P4 y P5 mantienen su lore en `PROPOSED`
hasta ratificación explícita.

> Las sesiones son **proceso**, no autoridad. Si una decisión de una sesión contradice un
> doc de `00-governance/`, `10-global/`, `20-worlds/` o `30-integration/`, prevalece la
> v1 (Canon Policy §2).

## Biblia canónica de Ohmdal (histórica — precede a la v1)

[`ohmdal-biblia/00_MASTER_INDEX.md`](../ohmdal-biblia/00_MASTER_INDEX.md) consolidó la
fuente de verdad narrativa, educativa, visual y productiva de Ohmdal desde el 1 de agosto
de 2026. La v1 de `docs/20-worlds/ohmdal/` la absorbe como insumo; los puntos donde
contradice, prevalece la v1. La promoción documental no migra el runtime: `/jugar` y sus
regresiones continúan protegidos hasta que un ADR y el vertical slice aprueben su reemplazo.

## Fuentes de verdad activas pre-v1 (mantener como referencia)

**Comenzar por [`START_HERE.md`](../START_HERE.md):** consolida la promesa y la
arquitectura global. Para cualquier decisión de Ohmdal, continuar por la Biblia canónica
antes de consultar fuentes históricas.

1. [`vision-mundos-multilenguaje.md`](../vision-mundos-multilenguaje.md) — visión de
   producto: un núcleo compartido y cinco lenguajes de experiencia.
2. [`plan-plataforma-cinco-juegos.md`](../plan-plataforma-cinco-juegos.md) — arquitectura
   y orden de implementación de la plataforma multiruntime.
3. [`ohmdal-biblia/00_MASTER_INDEX.md`](../ohmdal-biblia/00_MASTER_INDEX.md) — autoridad
   canónica de Ohmdal, dependencias y estado del paquete documental.
4. [`ohmdal-biblia/15_DQ3_HD2D_RESEARCH_AND_APPLICATION.md`](../ohmdal-biblia/15_DQ3_HD2D_RESEARCH_AND_APPLICATION.md)
   — investigación primaria del remake y auditoría de aplicación/pipeline.
5. [`ohmdal-biblia/16_ARC1_JIRA_BACKLOG.md`](../ohmdal-biblia/16_ARC1_JIRA_BACKLOG.md)
   — backlog serie de La Luz, WIP uno y gates de `DONE`.
6. [`diseno-sintesis-v1.md`](../diseno-sintesis-v1.md) — loop, tono y reglas
   pedagógicas comunes.
7. [`guia-puzzles.md`](../guia-puzzles.md) — canon para diseñar y auditar puzzles.
8. [`estandar-implementacion.md`](../estandar-implementacion.md) — gate de implementación.

Los planes `plan-arco-1-*`, la ruta anterior y las unidades implementadas son fuentes
históricas y cantera de continuidad selectiva. Si contradicen la Biblia de Ohmdal,
prevalece la Biblia; el código estable no cambia hasta una migración aprobada.

## Fuentes históricas de contenido de Ohmdal

- [`ohmdal-ruta-contenidos.md`](../ohmdal-ruta-contenidos.md)
- [`unidad-1-ohmdal.md`](../unidad-1-ohmdal.md)
- [`unidad-2-caminos.md`](../unidad-2-caminos.md)
- [`unidad-3-forja.md`](../unidad-3-forja.md)
- [`unidad-4-terrazas.md`](../unidad-4-terrazas.md)
- [`unidad-5-faro.md`](../unidad-5-faro.md)

## Arte y espacio

- [`biblia-arte-produccion-v0.md`](../biblia-arte-produccion-v0.md)
- [`biblia-estilo-instituto.md`](../biblia-estilo-instituto.md)
- [`mapa-ohmdal-greybox.md`](../mapa-ohmdal-greybox.md)
- [`3d/README.md`](../3d/README.md) — contratos, toolchain y estado del ecosistema 3D.
- [`arco1/`](../arco1/) — dirección visual del Arco I: identidad, color script, encuadres,
  inventario de escenas, contenido educativo y presupuestos.

## Implementación y auditoría de hitos terminados

Los archivos `plan-implementacion-*`, `spec-*`, `auditoria-*` y las entregas de
cinemática son registro de decisiones y criterios de regresión. No definen por sí solos
la arquitectura futura. Se conservan porque explican por qué el Arco I funciona como
funciona.
