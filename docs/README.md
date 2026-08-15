# Mapa de documentación

Índice vivo de `docs/`. Lo lee cualquier agente para orientarse antes de consultar las
fuentes de autoridad. Para reglas de trabajo y gobernanza del estudio ver el
[`../AGENTS.md`](../AGENTS.md) raíz.

> Toda la v1 nace como `PROPOSED`. La promoción a `CANON` requiere ratificación autoral
> explícita mediante un ADR firmado por Manuel (`00-governance/ROXANA_CANON_POLICY_v1.md` §5).

---

## 1. Estructura vigente

```text
docs/
├── README.md                   este índice
├── START_HERE.md               norte de producto y arquitectura
├── guia-puzzles.md             CANON — diseño y auditoría de puzzles
├── asset-manifest.yaml         contrato runtime de assets 3D
├── guion-instituto.md          texto canon del aula de Electrónica (referencia histórica, v1 lo absorbe)
├── biblia-estilo-instituto.md  cámara ¾ top-down y escala del Instituto (referencia histórica)
├── diseno-sintesis-v1.md       diseño general (loop, tono, reglas pedagógicas comunes)
├── prologo.md                  guion detallado del prólogo en la escuela
│
├── 00-governance/              5 docs fundacionales y operativos
│                                pilares · canon policy · lenguaje de diseño
│                                arquitectura documental · checklist de revisión
│
├── 10-global/                  8 docs de biblia global
│                                Instituto · Bitácora · narrativa · UI/UX
│                                estructura de campañas · vertical slice
│                                metaprogresión · perfil del jugador
│
├── 20-worlds/                  GDD modular por mundo
│   ├── ohmdal/   (CONECTAR)    único en producción real — H1 hecho, H2 en curso
│   ├── physica/  (EXPERIMENTAR) Hito 1 hecho en Babylon.js
│   ├── bitland/  (PROGRAMAR)   PROPOSED, sin código todavía
│   └── arithmos/ (TRANSFORMAR) PROPOSED, sin código todavía
│       └── cada uno:
│         ├── AGENTS.md         reglas del mundo + qué sub-agent dispatchar
│         ├── vision/           North Star, anti-pilares, metáfora del mundo
│         ├── gameplay/         sistemas, gramática de puzzles, progresión mecánica
│         ├── world/            geografía, regiones, gating
│         ├── narrative/        lore, personajes
│         ├── content/          arcos, mapas, beats del vertical slice
│         └── production/       prototipos, pipelines, specs operativas
│
├── 30-integration/             catálogo de cruces interdisciplinarios
│                                + mapa de autoridad de contenido
│
├── ohmdal-biblia/              biblia canónica de Ohmdal (histórica — precede a la v1 de 20-worlds/)
│                                absorbida por `20-worlds/ohmdal/` como insumo
│                                La promoción documental no migra el runtime: `/jugar` y sus
│                                regresiones continúan protegidos hasta que un ADR apruebe su reemplazo
│
├── arco1/                      dirección visual del Arco I: identidad, color script, encuadres,
│                                inventario de escenas, contenido educativo, presupuestos
│
├── 3d/                         contratos, toolchain y estado del ecosistema 3D
│                                (Blender → GLB, validadores, presupuestos)
│
└── sessions/                   bitácora de las 6 sesiones de diseño P1–P6
                                 (proceso, no autoridad — ver `00-governance/ROXANA_CANON_POLICY_v1.md` §2)
```

---

## 2. Authority levels y precedencia

Jerarquía numérica: menor = mayor autoridad. Definida en
[`00-governance/ROXANA_DOCUMENT_ARCHITECTURE_v1.md`](00-governance/ROXANA_DOCUMENT_ARCHITECTURE_v1.md) §1.

| Nivel | Qué vive ahí |
|---|---|
| **0** | Constitución fundacional (Pilares, Canon Policy) |
| **1** | Constitución operativa (Design Language, Doc Architecture, Review Checklist) |
| **2** | Biblia global (Instituto, Bitácora, metaprogresión, narrativa, UI/UX, vertical slice) |
| **3** | Biblia de mundo (vision por mundo, sistemas, gramática de puzzles) |
| **4** | Diseño de contenido (arcos, puzzles específicos, encounters) |
| **5** | Producción (pipelines, presupuestos, runtimes, QA) |
| **6** | Especificación de tarea (specs de hito, tickets) |
| **7** | Evidencia de implementación (test reports, screenshots) |

**Regla:** nivel menor gana. Si contradicen, se eleva por ADR. La implementación NUNCA
convierte una idea en canon.

---

## 3. Cómo navegar por tarea

### "Estoy diseñando un puzzle nuevo"
1. [`../AGENTS.md`](../AGENTS.md) §5 — qué sub-agent dispatchar.
2. [`guia-puzzles.md`](guia-puzzles.md) — canon de puzzles (CANON).
3. `<mundo>/gameplay/<mundo>-puzzle-grammar_v1.md` — gramática local del mundo.
4. `<mundo>/AGENTS.md` — reglas locales + convenciones de código.

### "Estoy tocando código de Ohmdal"
1. [`20-worlds/ohmdal/AGENTS.md`](20-worlds/ohmdal/AGENTS.md) — reglas locales.
2. [`../ROADMAP.md`](../ROADMAP.md) — qué hito está en curso.
3. [`20-worlds/ohmdal/gameplay/ohmdal-core-gameplay_v1.md`](20-worlds/ohmdal/gameplay/ohmdal-core-gameplay_v1.md) — modos y loop.
4. `src/jugar/` o `src/ohmdal/` según el runtime activo.

### "Estoy tocando el Instituto"
1. [`../AGENTS.md`](../AGENTS.md) §6 — fuentes de verdad.
2. [`10-global/ROXANA_INSTITUTE_BIBLE_v1.md`](10-global/ROXANA_INSTITUTE_BIBLE_v1.md) — biblia global del Instituto (nivel 2, autoridad máxima para el Instituto).
3. `guion-instituto.md` y `biblia-estilo-instituto.md` — referencias históricas.
4. `src/landing/` — código del Instituto.

### "Estoy tocando Physica"
1. [`20-worlds/physica/AGENTS.md`](20-worlds/physica/AGENTS.md) — reglas locales + convenciones.
2. [`20-worlds/physica/README.md`](20-worlds/physica/README.md) — estado operativo (Hito 1 hecho).
3. [`20-worlds/physica/production/arquitectura.md`](20-worlds/physica/production/arquitectura.md) — física híbrida.

### "Quiero entender la visión general"
1. [`START_HERE.md`](START_HERE.md) — norte de producto.
2. [`../ROADMAP.md`](../ROADMAP.md) — qué se construye y en qué orden.
3. [`10-global/ROXANA_INSTITUTE_BIBLE_v1.md`](10-global/ROXANA_INSTITUTE_BIBLE_v1.md) §1 — tesis.

### "Necesito auditar un puzzle"
1. [`guia-puzzles.md`](guia-puzzles.md) — checklist completo.
2. `<mundo>/AGENTS.md` §3 — reglas DO/DON'T locales.
3. Sub-agent `m3-qa` para el informe priorizado (ver [`../AGENTS.md`](../AGENTS.md) §5).

---

## 4. Sesiones de diseño (proceso, no autoridad)

[`sessions/v1/INDEX.md`](sessions/v1/INDEX.md) es el mapa de las **seis sesiones de diseño**
que llevaron los GDD Reboot a la arquitectura documental vigente arriba. Orden recomendado:
P1 → P2 → P3 → P4 → P5 → P6, no en paralelo.

> Las sesiones son **proceso**, no autoridad. Si una decisión de una sesión contradice un
> doc de `00-governance/`, `10-global/`, `20-worlds/` o `30-integration/`, prevalece la
> v1 (Canon Policy §2).

---

## 5. Archivos históricos relevantes

> El material de hitos cerrados (auditorías, specs viejas, planes-implementación, pilotos)
> se retiró el 2026-08-14. Lo que queda aquí es insumo vivo:

- [`ohmdal-biblia/00_MASTER_INDEX.md`](ohmdal-biblia/00_MASTER_INDEX.md) — biblia consolidada
  de Ohmdal desde el 1 de agosto de 2026. `20-worlds/ohmdal/` la absorbe como insumo; los
  puntos donde contradice, prevalece la v1.
- [`diseno-sintesis-v1.md`](diseno-sintesis-v1.md) — diseño general del juego (concepto, loop,
  Bitácora, anti-clase, arquitectura). Insumo de los docs v1.
- [`prologo.md`](prologo.md) — guion detallado del prólogo en la escuela. Insumo del Instituto
  y del primer ingreso a Ohmdal.
- [`arco1/`](arco1/) — dirección visual congelada del Arco I (identidad, color script,
  encuadres, presupuestos por escena). El h2-h5 del ROADMAP se apoya aquí.