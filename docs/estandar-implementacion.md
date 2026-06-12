# Proyecto Roxana — Estándar de implementación multi-modelo
# «Fable planifica y audita; los ejecutores codifican»

**Versión:** 1.0 — destilado de la construcción de la U2 greybox (jun 2026), donde este workflow se validó completo: 9 hitos, 3 ejecutores distintos (GPT Codex CLI, Claude Sonnet, Fable para texto), 0 hitos fallados, 2 bugs de diseño cazados antes de codificar.

---

## 1. Los tres roles

| Rol | Quién | Qué hace | Qué NO hace |
|---|---|---|---|
| **Director** | el autor | valida diseño, juega los builds, decide canon (nombres, cortes, tono) | escribir specs ni código |
| **Arquitecto/Auditor** | **Fable** (modelo caro) | escribe guiones y specs de hito, decide ruteo de modelo, audita cada diff, verifica jugando en preview, escribe TODO texto del juego, commitea | implementar hitos (salvo texto y fixes de una línea) |
| **Ejecutor** | Codex CLI / Sonnet / Haiku / GPT-mini | implementa UN hito por sesión siguiendo la spec al pie de la letra | inventar texto, tomar decisiones de diseño, commitear |

## 2. ¿Quién decide qué modelo ejecuta? — Fable. Siempre.

Decisión de esta sesión, con tres razones:

1. **Es marginalmente gratis.** Fable ya leyó el hito para escribir la spec (eso no se puede delegar). Agregar «complejidad media → Sonnet» cuesta una línea. Un clasificador barato aparte agrega una llamada, un punto de falla y cero ahorro.
2. **El costo del error es asimétrico.** Un mal ruteo = hito fallado = re-ejecución + auditoría extra + riesgo de bug sutil. Una mala decisión quema más que cien decisiones bien pagadas.
3. **La complejidad no se mide en líneas** sino en acoplamiento (¿toca módulos compartidos?), ambigüedad de la spec y costo de verificación. Eso lo sabe quien escribió el plan, no quien cuenta archivos.

## 3. Tabla de ruteo

| Nivel | Tareas típicas | Ejecutor | Ejemplo real (U2) |
|---|---|---|---|
| **Mecánico** — spec cerrada, cero decisiones | agregar flags, entradas de Bitácora con texto dado, renombres, mover un thing | **Haiku / GPT-5.4-mini** | M0 (flags), M7 (entradas) |
| **Estándar** — patrón existente que imitar | un puzzle nuevo calcando otro, salas como datos, sfx sobre primitivos existentes | **Sonnet / GPT-5.4 / Codex** | M2–M6 (puzzles), M8 (cierre) |
| **Delicado** — toca módulos compartidos o crea un patrón nuevo | refactor de common.ts, primer puzzle de un tipo nuevo (p.ej. el banco con tick de tiempo de la U5) | **Sonnet o Codex con spec extra-fina** + auditoría reforzada | M2 (creó ohmProbe, el patrón de todos los demás) |
| **Texto y diseño** | diálogos, guiones, Bitácora, balance numérico, decisiones | **Fable, nunca se delega** | líneas TODO(guion), corrección Empuje 16 |

**Escalación:** si un ejecutor falla el mismo hito 2 veces, se sube un escalón de modelo. No se insiste.

## 4. El pipeline por hito (el ciclo que funcionó)

1. **Spec** (Fable): autocontenida — el ejecutor arranca frío. Incluye: archivos a tocar, patrones a imitar (rutas concretas), matemática exacta con enteros, criterios de aceptación, reglas inviolables, y la orden de correr build+tests.
2. **Ejecución** (modelo ruteado): un hito, una sesión, en background.
3. **Auditoría de diff** (Fable): ¿respeta patrones? ¿tocó módulos compartidos sin necesidad? ¿texto textual del guion (grep de líneas clave)? ¿vocabulario spoiler filtrado?
4. **Verificación mecánica:** `npm run build` + `for t in tests/*.test.ts; do node --experimental-strip-types "$t"; done` + `grep -rn "TODO(M_)" src/` = 0 + grep de voseo = 0.
5. **Verificación jugada** (Fable, preview): inyectar save por `localStorage` para spawnear en la sala del hito y jugar el flujo real (ver §6).
6. **Commit** (Fable): un commit por hito, mensaje que dice quién implementó y qué se verificó.
7. **Siguiente hito.** Los hitos van en orden de dependencia; nunca dos en paralelo sobre los mismos archivos.

## 5. Reglas duras para TODO ejecutor (van en cada prompt)

- **El texto del juego nunca lo inventa el ejecutor.** Se copia TEXTUAL del guion. Si falta una línea: `// TODO(guion)` + placeholder neutro + reportarlo. Las líneas faltantes las escribe Fable después (son canon y se registran en el guion, ver U2 §13-bis).
- **Vocabulario técnico = spoiler** fuera de la capa formal de la Bitácora (regla pedagógica inviolable del proyecto).
- **Modelo puro testeable por puzzle** (`xModel.ts` + `tests/mX-x.test.ts`, imports con extensión `.ts`): el patrón que Codex creó en M2 y todos imitaron. Los tests corren con `node --experimental-strip-types`.
- **Validación por condiciones, no por solución fija** (siempre ≥2 soluciones válidas).
- Español neutro (tuteo). Sin dependencias nuevas. **Sin commit** (el commit es del auditor).
- Spec ambigua → preguntar o dejar TODO; jamás resolver inventando.

## 6. Trucos de verificación en preview (aprendidos acá, valen oro)

- **Spawn directo:** `localStorage.setItem('roxana-slice-v1', JSON.stringify({room: 'castle_heart', flags: {...}}))` + reload + click en `#btn-continue`. Permite probar cualquier hito sin jugar desde el inicio.
- **Teclas sintéticas:** Phaser lee `keyCode` → `Object.defineProperty(e,'keyCode',{get:()=>69})`. Para **interactuar**: keydown solo (keydown+keyup en el mismo tick se pierde). Para **caminar**: keydown, esperar N ms, keyup.
- **Avanzar diálogos: click sobre `#dialog`**, no con E (la E puede re-disparar la interacción del thing cercano y entrar en loop).
- **Bancos = DOM puro:** una vez abiertos se operan con `querySelector` + `.click()` — jugar un puzzle entero por consola es trivial.
- **Ojo con los botones ocultos:** `.click()` programático activa botones con clase `hidden` (falso negativo clásico: cerrar con «Alejarse» oculto en vez de «Continuar»).

## 7. Qué mirar especialmente en la auditoría (fallas reales de esta sesión)

- **Estados visuales superpuestos:** el ejecutor agrega la versión nueva de un NPC y no oculta la vieja (Edda/Lumen duplicados en la plaza nocturna de M8). Checklist: por cada `visible:` nuevo, ¿qué OTRO thing debe dejar de verse?
- **El guion también tiene bugs:** Codex detectó que «soluciones con Empuje 16» era aritméticamente imposible (M6) y frenó a preguntar en vez de inventar. Ese comportamiento se premia: la spec debe decir explícitamente «si hay contradicción, frena y reporta».
- **Las correcciones dejan huérfanos:** corregir el Empuje 16 dejó un «tres soluciones» rancio en otra sección. Tras todo cambio de diseño: grep del concepto en docs Y código.
- **Posicionamiento espacial:** los ejecutores no ven el mapa; revisar solapamientos de things y zonas de interacción en preview (la lámpara que peleaba con Edda).

## 8. Plantillas de prompt

### Codex CLI (por stdin; el here-string multilínea como argumento se rompe en PowerShell)

```bash
cd "/c/YO/Proyectos/Roxana claude" && codex exec --sandbox workspace-write - <<'EOF'
Proyecto: juego educativo en Phaser 4 + TypeScript + Vite (web, sin backend).
Lee primero: README.md, docs/plan-implementacion-<unidad>.md y docs/<guion>.md.
Hitos M0-M_ ya commiteados. Patrones a imitar: <rutas concretas>.
Tarea: implementar el hito M_ del plan (seccion 2).
<spec detallada: archivos, matematica, dialogos textuales, criterios>
Reglas: las inviolables del plan (seccion 0). Texto TEXTUAL del guion; si falta:
// TODO(guion). Si encuentras una contradiccion en la spec: FRENA y reporta.
Espanol neutro. Sin dependencias nuevas. npm run build y todos los tests deben
pasar (ejecutalos). NO hagas commit.
Al terminar: lista de archivos tocados + como probar a mano.
EOF
```

### Subagente Claude (Agent tool, `model: "sonnet"` o `"haiku"`, background)

Mismo contenido que el de Codex pero **más autocontenido** (el subagente también arranca frío): agregar la ruta absoluta del proyecto, el resumen de patrones con nombres de funciones (`say(L(...))`, `openBench`, `setFlag`, `notifyNewEntry`), y pedir al final: archivos tocados + decisiones tomadas donde la spec era ambigua + pasos de prueba manual numerados.

## 9. Economía

- Codex CLI corre contra la suscripción ChatGPT Plus del autor (cuota: si se agota, espera al reset o rutear a Sonnet/Haiku, que consumen el plan de Claude).
- Fable se reserva para lo que nadie más puede hacer: specs, texto, auditoría, verificación jugada, decisiones. En la U2: ~9 specs + 9 auditorías + todo el texto, contra 8 hitos ejecutados por modelos baratos. Esa proporción es el objetivo.
