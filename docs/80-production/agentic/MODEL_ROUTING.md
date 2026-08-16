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

La cadena no existe para simular una empresa. Cada modelo tiene una **responsabilidad de juego distinta** y evita evaluar su propio trabajo.

```text
MANUEL
  ↓ objetivo
GPT-5.6 SOL — DIRECTOR / LOOP OWNER
  ↓ contract
MINIMAX M3 — BUILDER
  ↓
MECHANICAL GATES
  ↓
GPT-5.6 LUNA — PLAYER AGENT
  ├─ FAIL → DEEPSEEK V4 FLASH — REPAIR
  │                         ↓
  │                    gates + replay
  └─ PASS
      ↓
GLM — ADVERSARIAL PR REVIEW
      ↓
GPT-5.6 SOL — DONE / REPAIR / ESCALATE
      ↓
MANUEL — integración material
```

## 1. Director / Loop Owner — GPT-5.6 Sol

**Harness recomendado:** Codex Desktop / ChatGPT conectado al repo según la tarea.

Responsabilidad:

- convertir intención en milestone/spike;
- mantener la arquitectura y canon en contexto;
- escribir Task + Learning Contract;
- elegir qué debe verificarse;
- leer reportes de Player/Reviewer;
- detectar cuándo un bug es en realidad mala representación/spec;
- decidir `DONE | REPAIR | ESCALATE`.

No usarlo para churn mecánico salvo escalación. Su valor es conservar coherencia global y decidir cuándo dejar de iterar.

## 2. Primary Builder — MiniMax M3 en MiniMax Code

El default conserva el harness donde el modelo ha resultado más productivo para world-building e implementación visual.

Responsabilidad:

- construir la milestone;
- dividirla en subtareas locales;
- ejecutar continuamente;
- dejar debug hooks razonables;
- reparar sus propios fallos mecánicos inmediatos.

No certifica la experiencia final y no cambia engine/canon por iniciativa propia.

MiniMax vía OpenCode puede participar como benchmark, pero no hay razón para abandonar el harness nativo si no demuestra mejora real.

## 3. Player Agent — GPT-5.6 Luna

**Preferencia:** Luna Max/alta capacidad en un harness que pueda abrir y operar el juego. Si se usa OpenCode Go, el model ID público actual es `opencode-go/gpt-5.6-luna`; verificar siempre con `opencode models` antes de fijarlo.

Este rol **no es code review**.

Primera pasada blind-first:

- no diff;
- no tests;
- no explicación interna;
- recibe controles, fantasía/objetivo del jugador y estado inicial.

Debe usar el producto como persona y juzgar:

- onboarding/affordance;
- control/cámara;
- comprensión del estado;
- feedback de éxito/fallo;
- aprendizaje/transferencia declarados;
- fricción real;
- touch/mobile cuando aplica.

Después puede usar Playwright/debug state para transformar sus observaciones en repros.

La independencia del Player Agent es una pieza central del loop. No reemplazarlo por “el Builder corre tests”.

## 4. Repair Agent — DeepSeek V4 Flash

**Harness recomendado:** OpenCode Go para edición directa reproducible.

Model ID público actual: `opencode-go/deepseek-v4-flash`.

Responsabilidad:

- recibir findings concretos;
- hacer el fix mínimo;
- no rediseñar;
- volver a mechanical/play gates.

Por coste/capacidad es el default para el volumen alto de reparaciones locales.

### Escalación de repair

Si un defecto sobrevive a dos fixes bien informados:

1. considerar primero error de spec/representación;
2. si sigue siendo claramente técnico, probar **DeepSeek V4 Pro** (`opencode-go/deepseek-v4-pro`) o devolver a Sol;
3. no quemar Flash en un loop repetitivo.

## 5. Adversarial PR Reviewer — GLM

**Harness recomendado:** OpenCode Go, agente read-only.

La documentación pública de OpenCode Go consultada el 2026-08-16 lista `glm-5.2` como model ID. Si `opencode models` en la instalación del usuario muestra una versión posterior (por ejemplo GLM-5.3), se actualiza el pin **después de verificar el ID real**.

Rol: defensa, no construcción.

Debe intentar encontrar motivos concretos para no integrar:

- edge cases;
- regresiones;
- bypasses/hardcodes;
- tests debilitados;
- resource leaks/debt material;
- assumptions falsas;
- mobile/performance gaps contractuales;
- contradicciones con el core pedagógico.

No edita y no produce feedback estético subjetivo sin criterio.

Separarlo del Builder/Repair reduce confirmación de la solución implementada.

## 6. Kimi K3 y Grok — challengers, no roulette

OpenCode Go publica actualmente Kimi K3 (`opencode-go/kimi-k3`) y Grok 4.5 (`opencode-go/grok-4.5`). Si el cliente local ofrece versiones posteriores, verificar con `opencode models` antes de documentarlas.

No tienen un rol permanente por ahora.

Casos de benchmark útiles:

- **Kimi K3:** tareas de integración/visual reasoning o lectura grande de escena/repo;
- **Grok:** spikes completos/3D de alcance muy acotado donde se quiera comparar autonomía de construcción;
- cualquier modelo nuevo: mismo baseline, contrato, tools, loops y Player Agent.

Un buen demo viral no alcanza para mover el camino crítico.

## 7. DeepSeek Harness

`deepseek-ai/deepseek-harness` se mantiene como herramienta experimental. Upstream lo marca **developer preview** y advierte breaking changes.

Puede probarse para:

- QA/repair aislado;
- workflows de exploración;
- investigación de patrones de harness;

pero Roxana **no depende** de él para poder producir una milestone. OpenCode Go sigue siendo el fallback estable para ejecutar DeepSeek sobre el repo.

## 8. Harnesses nativos vs unificación

No necesitamos obligar a todos los modelos a vivir en una misma app.

Lo común es:

`repo + AGENTS.md + authority docs + Task/Learning Contract + gates + evidence`.

Por eso es válido:

- Sol en Codex Desktop;
- MiniMax M3 en MiniMax Code;
- Luna/DeepSeek/GLM en OpenCode/Codex según tooling;

si todos observan el mismo contrato y estado del repo.

La pregunta correcta no es “¿qué IDE usa todo?” sino **“¿puedo repetir la tarea y comparar el resultado sin cambiar DONE?”**

## 9. Benchmark de cambio de rol

Para reemplazar un default:

- mismo commit inicial;
- mismo Task + Learning Contract;
- mismo engine/tooling;
- mismo max de loops;
- mismo Player Agent;
- mismo adversarial review;
- medir intervención humana, regressions, loops, coste/uso y calidad.

En un engine bake-off además se mantiene **el mismo Builder/model/harness en ambos spikes** para no confundir engine con capacidad de modelo.

## 10. Media

MiniMax multimodal sigue siendo ruta preferida para imagen/voz/música/video dentro del stack disponible, pero media e integración son gates distintos:

`brief → generación → selección → provenance/manifest → integración runtime → Player/visual review`.

Un asset no entra porque “quedó hermoso”: debe funcionar con escala, cámara, affordance, performance y mobile reales.
