# Proyecto Roxana — CLAUDE.md
# «Fable planifica y audita; los ejecutores codifican»

Este archivo es la fuente de verdad para Claude Code como orquestador.
Leerlo completo antes de cualquier acción.

---

## 1. Qué es este proyecto

Juego narrativo educativo web. Stack: Phaser 4 + TypeScript + Vite.
Sin backend. Progreso en localStorage. UI de puzzles y Bitácora en DOM, no en canvas.

**Estado actual:** Arco I de Ohmdal completo (U1-U5, greybox jugable).
**Próximo:** mundos nuevos (Matemática, Física, Programación) siguiendo el mismo patrón.

Documentación clave (leer antes de cualquier tarea de diseño o implementación):
- `docs/guia-puzzles.md` — **qué DEBE y qué NO debe ser un puzzle (CANON del Director). Leer antes de crear o auditar cualquier puzzle.**
- `docs/diseno-sintesis-v1.md` — sistemas, formato, arquitectura general
- `docs/estandar-implementacion.md` — el workflow multi-modelo que hay que seguir
- `docs/plan-implementacion-u2.md` — ejemplo de plan de hitos (referencia de formato)
- `README.md` — estructura de archivos y convenciones de código

---

## 2. Los tres roles (nunca mezclarlos)

| Rol | Quién | Qué hace | Qué NO hace |
|---|---|---|---|
| **Director** | Manuel (el autor) | valida diseño, juega builds, decide canon | escribir specs ni código |
| **Orquestador** | Claude Code (este agente) | descompone tareas, rutea subagentes, audita diffs, commitea | implementar hitos, inventar texto del juego |
| **Ejecutor** | subagente ruteado | implementa UN hito siguiendo la spec al pie de la letra | inventar texto, tomar decisiones de diseño, commitear |

---

## 3. Ruteo de modelos (decidir antes de cada hito)

| Nivel | Criterio | Modelo |
|---|---|---|
| **Mecánico** | spec cerrada, cero decisiones: flags, entradas de Bitácora con texto dado, renombres | `haiku` o `codex-mini` |
| **Estándar** | patrón existente que imitar: puzzle nuevo calcando otro, sala nueva | `sonnet` o `codex` |
| **Delicado** | toca módulos compartidos o crea un patrón nuevo | `sonnet` con spec extra-fina + auditoría reforzada |
| **Diseño/texto** | guiones, diálogos, specs de hito, decisiones narrativas | este agente (Orquestador), nunca se delega |

**Regla de escalación:** si un ejecutor falla el mismo hito 2 veces → subir un escalón de modelo. No insistir.

---

## 4. Pipeline por hito (ciclo obligatorio)

```
1. Orquestador escribe spec autocontenida del hito
2. Orquestador decide modelo ejecutor
3. Ejecutor implementa (subagente, contexto aislado)
4. Orquestador audita el diff:
   - ¿Respeta patrones de src/puzzles/ existentes?
   - ¿Texto TEXTUAL del guion? (grep líneas clave)
   - ¿Tocó módulos compartidos sin necesidad?
   - ¿Vocabulario spoiler filtrado?
5. Verificación mecánica: bash scripts/verificar-hito.sh
6. Verificación jugada: spawn por localStorage en preview (ver §6)
7. Si todo ok → proponer commit al Director
8. Siguiente hito
```

**Nunca dos hitos en paralelo sobre los mismos archivos.**

---

## 5. Reglas duras para TODO ejecutor (incluir en cada prompt)

- El texto del juego **nunca lo inventa el ejecutor**. Se copia TEXTUAL del guion.
  Si falta una línea: `// TODO(guion)` + placeholder neutro + reportarlo.
- Vocabulario técnico = spoiler fuera de la capa formal de la Bitácora.
  `serie`, `paralelo`, `nodo`, `Kirchhoff` solo aparecen gateados por flags de formalización.
- Modelo puro testeable por puzzle: `src/puzzles/xModel.ts` + `tests/mX-x.test.ts`.
  Imports con extensión `.ts`. Tests corren con `node --experimental-strip-types`.
- Validación por condiciones, no por solución fija (siempre ≥2 soluciones válidas).
- Español neutro (tuteo). Sin dependencias nuevas. **Sin commit.**
- Spec ambigua → preguntar o dejar TODO; jamás resolver inventando.
- Spec con contradicción → **frenar y reportar**, no resolver inventando.

---

## 6. Trucos de verificación en preview

```js
// Spawn directo en cualquier sala:
localStorage.setItem('roxana-slice-v1', JSON.stringify({room: 'castle_heart', flags: {...}}))
// → reload → click en #btn-continue

// Tecla sintética (Phaser lee keyCode):
Object.defineProperty(e, 'keyCode', {get: () => 69}) // E = interactuar
// Para caminar: keydown → esperar N ms → keyup
// Para avanzar diálogos: click sobre #dialog (no E, puede re-disparar el thing)

// Bancos = DOM puro: operar con querySelector + .click()
// Botones ocultos: .click() programático activa clase 'hidden' — ojo con falsos negativos
```

---

## 7. Checklist de auditoría (qué mirar especialmente)

- **Estados visuales superpuestos:** por cada `visible:` nuevo, ¿qué otro thing debe ocultarse?
- **Posicionamiento espacial:** ejecutores no ven el mapa → revisar solapamientos en preview.
- **Huérfanos tras correcciones:** tras todo cambio de diseño, grep del concepto en docs Y código.
- **Guion con bugs propios:** si la spec tiene contradicción aritmética → frenar, no inventar.

---

## 8. Protocolo de commit

```bash
# Formato obligatorio:
git commit -m "M{N} {descripcion breve} [{ejecutor}] [build ✓] [tests ✓] [preview ✓]"

# Ejemplos:
# "M2 puzzle campana dos cables [sonnet] [build ✓] [tests ✓] [preview ✓]"
# "M0 flags U3 + continuación desde U2 [haiku] [build ✓] [tests ✓]"
```

**Todo hito, sin excepción** (mecánico, Estándar o Delicado): el Orquestador propone el
commit al Director y espera aprobación explícita. Nunca se commitea automáticamente.

---

## 9. Comandos útiles del proyecto

```bash
npm run dev          # desarrollo local, http://localhost:5173
npm run build        # tsc + vite build → dist/
npm run preview      # sirve dist/ localmente
npm test             # corre todos los tests en tests/

# Verificación completa antes de commit:
bash scripts/verificar-hito.sh
```

---

## 10. Estructura de archivos clave

```
src/
  state.ts           flags + save (setFlag, hooks.refresh/goto)
  game/rooms.ts      TODAS las salas como datos — aquí va el contenido de cada unidad
  game/ExplorationScene.ts   escena Phaser — NO tocar salvo bug del motor
  ui/dialog.ts       say([L('Nombre','texto'),...], onDone)
  ui/bench.ts        openBench(titulo, sub, build) + benchActions()
  puzzles/common.ts  widgets reutilizables: ohmProbe, piedras, fusible, llaves
  puzzles/*.ts       cada puzzle: abrirX(onSolved) — patrón a imitar
  content/entries.ts Bitácora: getEntries() según flags, dos capas
tests/
  *.test.ts          un archivo por puzzle, corre con node --experimental-strip-types
docs/
  estandar-implementacion.md   leer antes de cualquier tarea
  plan-implementacion-u2.md    ejemplo de formato de plan de hitos
scripts/
  verificar-hito.sh  gate de calidad antes de cada commit
```

---

## 11. Economía de tokens

- Ejecutores baratos (Haiku, Codex-mini) para hitos mecánicos: ~70% del volumen de tareas.
- Sonnet para hitos Estándar y Delicados.
- Este agente (Orquestador) solo para lo que nadie más puede hacer:
  specs, texto canon, auditoría narrativa, decisiones de diseño.
- Objetivo: ≤1 spec + 1 auditoría del Orquestador por cada hito implementado por ejecutor.
