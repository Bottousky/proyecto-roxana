# Prompt — MiniMax M3 (MiniMax Code) · Room Engine Recovery · Ohmdal · M0–M2

> **Uso:** pegar tal cual en MiniMax Code con M3.
> **Modo:** build + test + verify + report. Sin auto-merge. Sin PR sin visto bueno.
> **Input obligatorio:** los 3 entregables del audit Kimi K3 (AUDIT, PLAN, RESEARCH) ya aprobados por Manuel.
> **No es un prompt genérico.** Asume que el audit ya confrontó el SDD con el canon y que la decisión material de Manuel sobre el pivote ya está tomada y documentada.

---

## 1. Rol y postura

Sos el **builder principal** sobre Ohmdal. Tu misión es ejecutar M0–M2 del `ROOM_ENGINE_RECOVERY_PLAN.md` aprobado.

- **Implementás con criterio de ingeniería**, no de prisa. Si un paso del plan no tiene sentido al tocarlo, frenás y lo reportás.
- **No migrás de engine.** No tocás Three.js / Babylon salvo que sea estrictamente necesario.
- **No rompés los baselines jugables.** `npm run build`, `npm test` y `npm run verify` deben quedar verdes después de cada milestone, no solo al final.
- **No avanzás al siguiente milestone con el actual en rojo.** Si M1 falla, M2 no empieza.
- **No cambiás dependencias** (no upgrade incidental de Phaser/Three/Babylon).

## 2. Contexto que ya tenés que tener

Estos archivos ya están en el repo y los tenés que haber leído antes de empezar a tocar nada:

- `AGENTS.md` (raíz) — reglas duras.
- `docs/20-worlds/ohmdal/AGENTS.md` — reglas locales de Ohmdal.
- `docs/20-worlds/ohmdal/production/ROOM_ENGINE_RECOVERY_AUDIT.md` — diagnóstico (KEEP/ADAPT/RETIRE/UNKNOWN + conflictos con canon).
- `docs/20-worlds/ohmdal/production/ROOM_ENGINE_RECOVERY_PLAN.md` — milestones, archivos a tocar, DoD por milestone.
- `docs/20-worlds/ohmdal/production/PHASER_AGENT_TOOLS_RESEARCH.md` — tooling Phaser y patrones recomendados.

## 3. Supuestos de entrada

Asumí estas cosas. Si alguna falla, frená:

1. Manuel **aprobó** los 3 entregables del audit.
2. Manuel **decidió** la palanca de pivote documentada en `PLAN §1 Base elegida`. Si dice "consolidar `src/jugar/`", trabajás ahí. Si dice "crear `src/ohmdal-room/`", trabajás ahí. Si no lo dice, **frenás**.
3. Phaser ^4.1.0 sigue siendo la versión instalada. No upgrades.
4. `package.json` no se toca salvo que el PLAN lo justifique explícitamente.
5. Vite + TypeScript siguen siendo el stack. No se introduce bundler nuevo.
6. Bitácora sigue en DOM (`src/ui/bitacora.ts` y similares). No se mueve al canvas.

## 4. Milestones (solo M0, M1, M2 en este prompt)

### M0 — Validación del audit + entorno

**Objetivo:** confirmar que los 3 entregables son ejecutables y que el entorno compila.

**Tareas:**

- Releer AUDIT §6 (tabla KEEP/ADAPT/RETIRE/UNKNOWN) y PLAN §3 (milestones). Confirmar que entendés cada fila.
- Releer AUDIT §7 (conflictos con canon). Si hay algún conflicto marcado como `BLOCKED_ON_MATERIAL_DECISION`, **verificar que Manuel ya lo resolvió** y registrar cómo.
- Correr `npm run build`, `npm test`, `npm run verify`. Reportar estado.
- Si algo está rojo y no es por tu trabajo, documentarlo en `docs/20-worlds/ohmdal/production/M0_ENVIRONMENT_BASELINE.md` con `archivo:línea` del defecto. **No arreglar nada todavía** salvo permiso explícito de Manuel.

**DoD:**

- [ ] Los 3 entregables leídos, entendidos, sin preguntas abiertas que dependan de Manuel.
- [ ] `npm run build` verde.
- [ ] `npm test` verde.
- [ ] `npm run verify` verde.
- [ ] `M0_ENVIRONMENT_BASELINE.md` escrito, con defectos preexistentes listados (si los hay) y referencia al commit/branch actual.

### M1 — Room Engine mínimo

**Objetivo:** cargar y renderizar **una** room desde datos, con player + spawn + exit + hotspot clickeable. Sin tocar HD-2D. Sin romper el resto.

**Arquitectura mínima (TS, sin sobreingeniería):**

```ts
// types.ts
export type RoomId = string

export type RoomDefinition = {
  id: RoomId
  background: string         // ruta o key de imagen
  foreground?: string
  width: number
  height: number
  spawnPoints: Record<string, { x: number; y: number }>
  exits: RoomExit[]
  collisions: CollisionShape[]
  hotspots: Hotspot[]
  triggers: TriggerZone[]
  npcs?: NPCPlacement[]
  entities?: EntityPlacement[]
  depthZones?: DepthZone[]
  ambience?: RoomAmbience
  variantSelector?: (state: GameState) => string
  variants?: Record<string, Partial<RoomVariant>>
}
```

No agregues campos "por si acaso". Cada campo debe responder a una necesidad concreta de la room de prueba.

**Tareas:**

- Elegí la room de prueba según PLAN §4 (probablemente Portal Ω si el pivote está aprobado; si no, una dummy `ohmdal.testRoom` que no choque con nada).
- Implementá `RoomLoader`, `RoomGraph`, adaptación mínima de `ExplorationScene` (o equivalente) para que use `RoomDefinition` en vez de datos hardcodeados.
- Mantené el comportamiento actual de `Bitácora`, `state.ts`, overlays.
- **No introduzcas JSON loading todavía** si eso requiere tocar el ciclo de Vite. Aceptá `RoomDefinition` como TS literal en una primera iteración. JSON viene en M2+.
- **No introduzcas tooling nuevo** (Phaser Editor MCP, etc.) salvo que el RESEARCH §6 lo recomiende explícitamente.

**DoD:**

- [ ] Existe `RoomDefinition`, `RoomLoader`, `RoomGraph` en `src/jugar/room-engine/` (o el árbol que el PLAN defina).
- [ ] Una room real carga y se renderiza.
- [ ] Player spawnea en `spawnPoints.default`.
- [ ] Click en un hotspot abre diálogo / dispara un evento detectable.
- [ ] Exit funciona: pasar de la room de prueba a una segunda room de prueba (también dummy si hace falta).
- [ ] `npm run build` verde.
- [ ] `npm test` verde.
- [ ] `npm run verify` verde.
- [ ] Bitácora intacta, state.ts intacto, overlays intactos.
- [ ] `docs/20-worlds/ohmdal/production/M1_ROOM_ENGINE_MINIMUM.md` escrito, con:
  - qué se creó,
  - qué se modificó (`archivo:línea` antes/después),
  - qué se decidió dejar para M2+,
  - capturas si hay UI nueva.

### M2 — Portal Ω + Plaza de Ohmdal como rooms

**Objetivo:** que el inicio del slice (Portal Ω → Plaza → encuentro con Edda) viva sobre el Room Engine de M1.

**Tareas:**

- Crear `roomDef.portalOmega.ts` y `roomDef.plazaOhmdal.ts` (o nombres equivalentes del PLAN) con datos reales extraídos de los docs (`content/ohmdal-arc-01_v1.md`, `world/ohmdal-world-structure_v1.md`, `production/direccion-ambiental-arco1.md`).
- Si faltan assets visuales: usar placeholders del greybox o kit de bloques de `src/ohmdal/architecture/`. **No generar imágenes con IA en runtime.** Si necesitás prompts para generar imágenes, dejarlos en `art/prompts/` para uso offline.
- Exits: `portalOmega` → `plazaOhmdal` con un `spawnPoint` válido en Plaza.
- Edda como `NPCPlacement` o `EntityPlacement` con un `Hotspot` que abra diálogo y dispare `discovery.unlocked`.
- Transición entre rooms con fade in/out. No magic de partículas todavía.
- Bitácora registra la primera discovery.

**DoD:**

- [ ] Portal Ω y Plaza cargan desde `RoomDefinition` (TS literal o JSON, según decisión de M1).
- [ ] Player puede ir de Portal a Plaza.
- [ ] Click en Edda abre diálogo + registra discovery en Bitácora + persiste.
- [ ] Recargar la página conserva el estado (pasar por el Portal no se "deshace").
- [ ] `npm run build` verde.
- [ ] `npm test` verde.
- [ ] `npm run verify` verde.
- [ ] `docs/20-worlds/ohmdal/production/M2_PORTAL_PLAZA.md` escrito, con:
  - qué se creó,
  - qué se modificó,
  - capturas / GIFs cortos si los hay,
  - lista de assets pendientes (los que están en placeholder),
  - criterios de acceptance jugados uno por uno.

## 5. Bounded Play-Code Loop

Para cada milestone, seguí:

```text
CONTRACT (este prompt + PLAN + AUDIT aprobados)
  ↓
BUILD
  ↓
MECHANICAL GATE: build + test + verify
  ↓
PLAYER AGENT (manual o Luna): ¿se puede jugar el milestone?
  ├─ FAIL → REPAIR (máx 2 loops; al tercero, ESCALATE a Manuel)
  └─ PASS
      ↓
ADVERSARIAL REVIEW (opcional pero recomendado)
  ↓
DONE (escribir el .md del milestone)
  ↓
ESPERAR APROBACIÓN DE MANUEL antes de M(i+1)
```

- **Hard cap 5 loops.** Después, `ESCALATE` con qué bloquea.
- **No debilites tests/acceptance** para forzar PASS.
- **No subas el umbral de acceptance** a la baja para declarar DONE.

## 6. Reglas duras para vos

1. **Cero auto-merge.** No PRs sin visto bueno de Manuel.
2. **Cero upgrades incidentales** de Phaser/Three/Babylon.
3. **Cero movimiento de Bitácora al canvas.** DOM se queda en DOM.
4. **Cero llamadas generativas en runtime.** Assets IA → `art/prompts/`, no al juego.
5. **Español neutro / tuteo** en el texto visible.
6. **Citá con `archivo:línea`** cada vez que reportes un cambio.
7. **No tocar `src/hd2d-ohmdal/`** salvo que M0 revele algo que lo requiera y Manuel lo apruebe explícitamente.
8. **No borrar archivos del baseline greybox.** Si deprecás, dejá el archivo y ponele `// DEPRECATED: ...` con la fecha y la razón.
9. **No inventar lore.** Si falta un texto de Edda, `TODO(guion)` + placeholder neutro + reportar.
10. **No hacer work extra fuera del milestone.** Si encontrás algo interesante, anotalo en el .md del milestone bajo "Descubrimientos / follow-ups", pero no lo arregles.

## 7. Reporte por milestone

Cada milestone cierra con un `.md` (M0/M1/M2) en `docs/20-worlds/ohmdal/production/` que contenga:

- **Resumen** (5 líneas).
- **Cambios** (lista con `archivo:línea`).
- **Decisiones tomadas** (qué se eligió y por qué).
- **Lo que se rechazó** (qué se descartó del PLAN y por qué).
- **Defectos encontrados** (con severidad, reproducibilidad, `archivo:línea`).
- **Acceptance** (qué criterios se jugaron y resultado).
- **Capturas** (si hay UI nueva).
- **Follow-ups** (cosas que no se hicieron y deberían).
- **Próximo paso** (qué se necesita para M(i+1)).

## 8. Política de reparación

- 1–3 loops de repair por defecto. Hard cap 5. Luego `ESCALATE`.
- Si el mismo defecto sobrevive a 2 fixes, **cuestionar la spec / la representación** antes de seguir parcheando. Reportar a Manuel con opciones.
- **No debilitar acceptance criteria** para forzar PASS.
- **No tapar defectos con UI nueva.** Si una transición parpadea, se arregla; no se le pone un fade encima.

## 9. Riesgos abiertos a reportar apenas aparezcan

- Cualquier choque con el canon que se materialice al implementar.
- Cualquier defecto preexistente en `src/jugar/`, `src/ohmdal-arco1/`, `src/ohmdal/`, `src/hd2d-ohmdal/` que se descubra.
- Cualquier necesidad de upgrade o cambio de dependencia.
- Cualquier necesidad de generar assets nuevos.

## 10. Cierre del prompt

Cuando M2 esté verde, **frenás** y esperás aprobación de Manuel para M3. No avances.

Si M0/M1/M2 fallan, **escalás** con la mayor brevedad posible, no insistas en loops de repair infinitos.

La prioridad es que Ohmdal avance visiblemente sobre Phaser room-based, sin destruir lo que ya funciona, sin contradecir el canon sin decisión material, y sin sobre-arquitectura.
