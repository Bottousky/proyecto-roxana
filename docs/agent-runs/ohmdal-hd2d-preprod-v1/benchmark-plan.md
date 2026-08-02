# Benchmark de routing — Ohmdal HD-2D preproducción v1

**Estado:** autorizado por el usuario  
**Alcance:** diez ejecuciones agrupadas en cinco pares comparables  
**Control:** Director Codex; máximo dos candidatos simultáneos

## Pregunta experimental

Determinar qué tareas conviene centralizar en Codex y cuáles admiten un ejecutor híbrido sin
perder calidad, trazabilidad ni facilidad de integración. El benchmark no elige un proveedor
global por reputación: mide resultados sobre unidades reales de H1 y H2.

Cada par recibe el mismo prompt congelado, los mismos archivos de sólo lectura, el mismo formato
de salida y los mismos criterios. Los candidatos no editan el repositorio. El Director conserva
la salida literal, registra tiempo/uso expuesto y realiza la evaluación ciega por identificador.
Las diez ejecuciones son diez unidades heterogéneas reales —cinco por modalidad—, no diez
repeticiones del mismo prompt. Esta ronda compara utilidad de routing por clase de tarea; no estima
varianza estadística de un modelo.

## Pares y routing inicial

| Par | Unidad | Ruta Codex | Ruta híbrida | Resultado esperado |
|---|---|---|---|---|
| B01 | Ficha V2 de seguridad de baja tensión ficticia | Codex Terra | Claude Code Pro | Ficha de 30 campos, fuentes, límites y test |
| B02 | Circuito completo, continuidad e instrumento | Codex Sol | OpenCode `deepseek-v4-flash-free` | Dos fichas, tabla de valores y tests |
| B03 | Cámara cuasi-ortográfica/perspectiva suave | Codex Sol | OpenCode `mimo-v2.5-free` | Contrato A/B, parámetros y protocolo de captura |
| B04 | Protocolo de sprites originales 4/8 | Codex Terra | OpenCode `north-mini-code-free` | Matriz de acciones, manifiesto y decisión |
| B05 | Ohm sprite/impostor frente a procedural | Codex Terra | OpenCode `nemotron-3-ultra-free` | Especificación equivalente, presupuestos y descarte |

Los nombres de modelos documentan la muestra; no anticipan el ganador. OpenCode Go, créditos API
medidos y generación paga quedan fuera de esta ronda. Si un modelo declarado no responde, se
registra el fallo y no se sustituye silenciosamente.

## Paquete congelado común

- Commit documental: el commit que incorpora este protocolo sobre `codex/ohmdal-hd2d-biblia`.
- Baseline productivo: `12d6f88d2a366da89ed91008013f42ba6295e42d`.
- Contratos: `brief.md`, `visual-contract.md`, `tasks.json`, `ownership.json`.
- Canon: `docs/ohmdal-biblia/02_EDUCATIONAL_CONTENT_BIBLE.md`,
  `08_VISUAL_DIRECTION_BIBLE.md`, `09_AI_ASSET_PIPELINE.md`, `10_VERTICAL_SLICE.md` y
  `11_PRODUCTION_BACKLOG.md` según corresponda.
- Restricciones: `/src/jugar/**`, guardado y modelos pedagógicos existentes son sólo lectura;
  H3, Meshy, assets protegidos, dependencias nuevas y generación paga están prohibidos.

## Salida obligatoria

Cada candidato debe devolver, sin editar archivos:

1. `taskId`, supuestos y archivos consultados.
2. Propuesta completa en Markdown o JSON según el paquete del par.
3. Fuentes y afirmaciones que soporta cada una.
4. Tests o comprobaciones reproducibles, sin afirmar ejecuciones no realizadas.
5. Riesgos, incertidumbres y decisiones que realmente requieren escalamiento.
6. Autoauditoría de alcance y una estimación explícita de trabajo de integración.

El Director guarda las salidas bajo `content/benchmark/candidates/<pair>/<candidate>.md` y los
datos comparables en `content/benchmark/results.json`. Los artefactos son evidencia, no canon ni
implementación aprobada.

Esta ronda produce propuestas documentales read-only: Playwright, capturas, `renderer.info` y
performance visual son `N/A`, nunca evidencia simulada. Esos gates vuelven a ser obligatorios en
la implementación browser-visible y en `EVAL-001`.

## Métrica y gates

Puntaje sobre 100:

- 45 calidad: aceptación/contrato 25, exactitud o tests 10, evidencia/trazabilidad 10.
- 20 integración: frontera, `git diff --check`, gates aplicables y facilidad de adopción.
- 15 correcciones: defectos de primer pase, reintentos y edición manual del Director.
- 10 tiempo: tiempo de pared; cola separada si la herramienta lo informa.
- 5 uso observado: tokens, créditos, coste y llamadas; `null` si no se expone.
- 5 entrega: formato, riesgos, comandos y evidencia requerida.

Son eliminatorios: tocar una frontera prohibida; inventar fuentes o mediciones; introducir una
dependencia; usar material protegido, Meshy o generación paga; filtrar secretos; o dejar sin
explicar un gate obligatorio fallido. Un fallo eliminatorio no se compensa por promedio.

Gana el candidato válido con mayor puntaje. En empate: calidad, menos correcciones, integración,
tiempo y finalmente uso observado. La conclusión global puede ser mixta: se conserva Codex como
control plane y sólo se delegan externamente las clases de trabajo donde el híbrido gane de forma
limpia. Cinco pares no justifican una regla universal; sí una política inicial que se revisará con
datos acumulados.

## Secuencia

1. B01; congelar ganador de seguridad como insumo de B02.
2. B03, independiente de B01, puede ocupar la siguiente ola.
3. B02 después de B01.
4. B04 y B05 en ondas separadas para respetar una sola frontera de assets.
5. Auditar resultados y fijar el routing inicial antes de implementar `DIR-EDU-001`, `ARCH-001`
   o `ASSET-001`.

La comparación no cuenta como `EVAL-001` ni consume una ronda visual oficial. Sólo puede haber un
Evaluador oficial después de la integración real.
