---
status: PROPOSED
authority_level: 5
version: v1
last_ratified: 2026-08-16
supersedes: []
depends_on:
  - README.md
  - ENGINE_MATRIX.md
  - WORKFLOW.md
  - SPIKE_POLICY.md
open_questions:
  - MR-Q1 — ¿MiniMax Code mantiene ventaja real como builder cuando el mismo task contract se ejecuta contra un challenger en OpenCode Go?
  - MR-Q2 — ¿DeepSeek Harness aporta algo al repair loop que no aporte DeepSeek V4 Flash/Pro dentro de OpenCode Go?
  - MR-Q3 — ¿qué tareas concretas justifican incorporar Kimi K3 o Grok como rol estable en vez de challenger de benchmark?
---

# Model Routing — equipo mínimo orientado a juegos

La cadena no existe para simular una empresa. Cada modelo tiene una responsabilidad distinta y evita evaluar su propio trabajo.

```text
MANUEL
  ↓ objetivo
GPT-5.6 SOL — DIRECTOR / LOOP OWNER
  ↓ Task + Learning Contract
MINIMAX M3 — BUILDER
  ↓
MECHANICAL GATES
  ↓
GPT-5.6 LUNA — PLAYER AGENT
  ├─ FAIL → DEEPSEEK V4 FLASH — REPAIR → gates + replay
  └─ PASS
      ↓
GLM-5.3 — ADVERSARIAL PR REVIEW
      ↓
GPT-5.6 SOL — DONE / REPAIR / ESCALATE
      ↓
MANUEL — integración material
```

## 1. Director / Loop Owner — GPT-5.6 Sol

**Harness recomendado:** Codex Desktop / ChatGPT conectado al repo según la tarea.

Responsabilidad:

- convertir intención en milestone/spike;
- mantener arquitectura/canon en contexto;
- escribir Task + Learning Contract;
- elegir verificadores;
- leer reportes de Player/Reviewer;
- detectar cuándo un bug es mala representación/spec;
- decidir `DONE | REPAIR | ESCALATE`.

No gastarlo en churn mecánico salvo escalación.

## 2. Primary Builder — MiniMax M3

**Harness recomendado:** MiniMax Code.

Responsabilidad:

- construir la milestone;
- dividirla en subtareas locales;
- ejecutar continuamente;
- dejar debug hooks razonables;
- reparar fallos mecánicos inmediatos.

No certifica su propia experiencia final y no cambia engine/canon por iniciativa propia.

MiniMax M3 en OpenCode Go puede participar como challenger, pero no sustituye el harness nativo sin una mejora reproducible.

## 3. Player Agent — GPT-5.6 Luna

**Harness recomendado:** OpenCode Go cuando necesite operar el repo/runtime.

Model ID verificado el 2026-08-16: `opencode-go/gpt-5.6-luna`.

Primera pasada **blind-first**:

- no diff;
- no tests;
- no explicación interna;
- recibe controles, fantasía/objetivo y estado inicial.

Juzga:

- onboarding/affordance;
- control/cámara;
- comprensión del estado;
- feedback de éxito/fallo;
- aprendizaje/transferencia declarados;
- fricción real;
- touch/mobile cuando aplica.

Después puede usar Playwright/debug state para convertir observaciones en repros.

## 4. Repair Agent — DeepSeek V4 Flash

**Harness recomendado:** OpenCode Go.

Model ID verificado el 2026-08-16: `opencode-go/deepseek-v4-flash`.

Responsabilidad:

- recibir findings concretos;
- hacer el fix mínimo;
- no rediseñar;
- volver a mechanical/play gates.

Si un defecto sobrevive a dos fixes bien informados, revisar spec/representación primero. Si sigue siendo técnico, escalar a DeepSeek V4 Pro (`opencode-go/deepseek-v4-pro`) o a Sol.

## 5. Adversarial Reviewer — GLM-5.3

**Harness recomendado:** OpenCode Go, read-only.

OpenCode Go documenta al 2026-08-16 el ID `opencode-go/glm-5.3`.

Rol: intentar demostrar con evidencia que la milestone todavía **no debería integrarse**:

- edge cases;
- regresiones;
- bypasses/hardcodes;
- tests debilitados;
- leaks/deuda material;
- assumptions falsas;
- gaps contractuales de mobile/performance;
- contradicciones con el core pedagógico o autoridad del repo.

No edita y no bloquea por gusto estético personal.

## 6. Kimi / Grok / otros — challengers, no roulette

OpenCode Go documenta actualmente Kimi K3 (`opencode-go/kimi-k3`) y Grok 4.5 (`opencode-go/grok-4.5`). La lista puede cambiar; `opencode models` es la fuente local de verdad.

No tienen rol permanente hoy. Casos útiles de benchmark:

- Kimi K3: integración/visual reasoning/lectura grande;
- Grok: spike 3D/completo muy acotado para comparar autonomía;
- modelo nuevo: mismo baseline, contrato, tools, loops, Player Agent y reviewer.

Un demo viral no mueve el camino crítico.

## 7. DeepSeek Harness

`deepseek-ai/deepseek-harness` sigue como herramienta experimental. Upstream lo marca developer preview y advierte breaking changes.

Puede probarse en QA/repair aislado, exploración o investigación de patterns; Roxana no depende de él. OpenCode Go es el default estable para DeepSeek sobre el repo.

## 8. Harnesses nativos vs unificación

No hace falta poner todos los modelos en una misma app.

Lo común es:

`repo + AGENTS.md + authority docs + Task/Learning Contract + gates + evidence`.

Por eso es válido:

- Sol en Codex Desktop/ChatGPT;
- MiniMax M3 en MiniMax Code;
- Luna/DeepSeek/GLM en OpenCode Go.

La pregunta útil es: **¿puedo repetir la tarea y comparar el resultado sin cambiar qué significa DONE?**

## 9. Benchmark para cambiar un rol

Para reemplazar un default:

- mismo commit inicial;
- mismo Task + Learning Contract;
- mismo engine/tooling;
- mismo max de loops;
- mismo Player Agent;
- mismo adversarial review;
- medir intervención humana, regresiones, loops, uso/coste y calidad.

En un engine bake-off se mantiene el mismo Builder/model/harness en A y B.

## 10. Media

MiniMax multimodal sigue como ruta preferida del stack disponible para imagen/voz/música/video, pero generación e integración son gates distintos:

`brief → generación → selección → provenance/manifest → integración runtime → Player/visual review`.

Un asset entra sólo si funciona con escala, cámara, affordance, performance y mobile reales.

## 11. Versionado de IDs

La lista de OpenCode Go cambia. Antes de una ejecución importante:

```bash
opencode models
```

Actualizar un pin sólo cuando el ID esté realmente disponible y, si cambia el modelo de fondo de un rol crítico, benchmarkear antes de declararlo nuevo default.
