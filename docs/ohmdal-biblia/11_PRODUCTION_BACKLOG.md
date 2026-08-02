# Backlog de producción y autorización

**Estado:** backlog canónico; H1+H2 autorizados, H3 bloqueado
**Regla:** los ítems de producción permanecen bloqueados hasta crear un hito con
`executionAuthorized: true`. El spike Phaser existente no se retargetea silenciosamente.

## Estados

- `READY-DOC`: tarea documental realizable sin producción.
- `READY-AUTH`: contrato listo para decisión de autorización.
- `AUTHORIZED`: ejecución limitada por un `tasks.json` aprobado.
- `BLOCKED-SLICE`: depende del veredicto del vertical slice.
- `BLOCKED-ADR`: depende de decisión arquitectónica.
- `FUTURE`: horizonte; no estimar como compromiso.
- `DONE`: evidencia y condición de cierre registradas.

## H0 — Cierre documental

| ID | Estado | Entregable | Cierre |
|---|---|---|---|
| H0.1 | DONE | Quince documentos canónicos y autoridad promovida | Sin preferencias humanas pendientes |
| H0.2 | DONE | Matriz Otto Krause 1.º–6.º | Fuentes institucionales y límites declarados |
| H0.3 | DONE | Contratos de Bitácora, evaluación y métricas | Local-first, opt-in y no bloqueo definidos |
| H0.4 | DONE | Contrato visual/productivo HD-2D | Referencia legal, gates y presupuestos |

## H1 — Fichas educativas del slice

**Estado global:** `AUTHORIZED` en `docs/agent-runs/ohmdal-hd2d-preprod-v1/`
**Owner futuro:** Director educativo/agente auditor; sin assets.

| ID | Entregable | Dependencia | Criterio de cierre |
|---|---|---|---|
| H1.1 | Ficha seguridad de baja tensión ficticia | Biblia educativa | Fuentes, límites y prácticas no transferibles a red real |
| H1.2 | Circuito completo/continuidad | H1.1 | Modelo puro, valores, unidades y tests V2 |
| H1.3 | Medición e instrumento de Ohm | H1.1 | Magnitud, referencia, rango, error y estados inválidos |
| H1.4 | Diagnóstico de Lumen | H1.2–H1.3 | Topología, hipótesis, órdenes válidos y transferencia |
| H1.5 | Puerta de Ohm | H1.4 | Mismo principio, representación distinta y protección segura |
| H1.6 | Entrada de Bitácora/evaluación | H1.2–H1.5 | Vivencia, evidencia, formalización y URL opcional |
| H1.7 | Auditoría autónoma V2 | H1.1–H1.6 | Segundo pase reproduce fuentes, cálculos y tests |

Cada tarea agente se parte en entregables de 30–90 minutos al crear `tasks.json`; no se delega
desde este documento.

## H2 — Spike visual preparatorio

**Estado global:** `AUTHORIZED` en `docs/agent-runs/ohmdal-hd2d-preprod-v1/`
**Objetivo:** reducir incertidumbre antes de construir el slice completo.

| ID | Entregable | Gate |
|---|---|---|
| H2.1 | Brief y visual contract | Quality bar, cámara, referencia, exclusiones de IP |
| H2.2 | Análisis footage oficial | Matriz de orientación/cámara sin extracción de assets |
| H2.3 | A/B sprites 4/8 | Mismo recorrido; veredicto por snaps, actuación y coste |
| H2.4 | A/B Ohm sprite/3D | Mismo presupuesto y cámara; una variante descartada |
| H2.5 | Blockout Portal–Manantial | Metros, maniquí 1,72 m, navegación y cámara mobile |
| H2.6 | Prueba PWA/carga | Campaña descargable, offline y actualización recuperable |
| H2.7 | Presupuesto medido | `renderer.info`, peso, frame time y Android medio 2022 |

No se texturizan regiones ni se generan hero assets. H2 termina con `avanzar`, `corregir una vez`
o `descartar`.

## H3 — Vertical slice «La pregunta vuelve»

**Estado global:** `BLOCKED-SLICE` hasta aprobar H1/H2 y contratos multiagente.

### Fronteras futuras

- **Director/integrador:** brief, decisiones, modelos educativos, guion, integración.
- **Arquitectura procedural:** overworld mínimo, Portal/Plaza, Taller, Puerta/Manantial, cámara,
  materiales, luz y disposal.
- **Asset Forge:** referencias/manifests, cuatro sprites candidatos necesarios, Ohm y VFX dentro de
  la variante aprobada.
- **Evaluador:** una revisión integrada; no corrige código/assets.

Ownership debe declarar globs exclusivos. Para dos trabajadores write-heavy se usan tareas Codex
App en worktrees separados desde el mismo `baseCommit`; no subagentes compartiendo checkout.

### Entregables

| ID | Entregable | Cierre |
|---|---|---|
| H3.1 | Runtime Three.js aislado | Monta/desmonta bajo demanda; `/jugar` intacto |
| H3.2 | Overworld mínimo | Viaje explorable y entrada a Cuenca, sin mapa completo |
| H3.3 | Tres sets | Portal/Plaza, Taller, Puerta/Manantial en cámara real |
| H3.4 | Personajes | Estudiante, Edda, Lumen y Ohm con acciones necesarias |
| H3.5 | Puzzle Lumen | Diagnóstico V2, varios órdenes, error recuperable |
| H3.6 | Transferencia Puerta | Condición física, protección y verificación |
| H3.7 | Bitácora | Diario autoral y evaluación externa opcional |
| H3.8 | Audio/VO | Orquesta+electrónica, ambiente y voces parciales |
| H3.9 | PWA/controles/a11y | Offline, teclado/táctil y baseline completo |
| H3.10 | Evidencia | Desktop/mobile, Android, navegadores, métricas y playtest |

Máximo dos rondas automáticas. La primera puede pedir corrección; la segunda emite veredicto final.

## H4 — ADR y preproducción de La Luz

**Estado:** `BLOCKED-SLICE`.

Si H3 avanza:

1. ADR Three.js híbrido y plan de migración gradual.
2. Inventario de modelos/puzzles que se adaptan desde `/jugar`.
3. Contrato de save y migración sin renombrar flags históricos de golpe.
4. Presupuesto por minuto, región, personaje y contenido V2.
5. Kits de cuatro macroterritorios y calendario secuencial.
6. Plan de guía docente y evaluaciones de La Escuela.

Si H3 se descarta, documentar por qué y volver a la alternativa Phaser/otra sólo con el mismo
contenido de prueba; no ampliar el prototipo perdedor.

## H5 — Campaña La Luz

**Estado:** `BLOCKED-ADR`.

Producción secuencial: Cuenca de Ohm → Castillo → Forja/Terrazas → Faro/Lago → epílogo. Una región
debe terminar contenido, arte, audio, accesibilidad y rendimiento antes de abrir la siguiente.
Duración 8–12 h sigue siendo objetivo de diseño hasta medir H3.

## H6 — Release base gratuito

**Estado:** `FUTURE`.

- PWA, hosting, actualización y recuperación offline.
- Guía docente y enlaces de evaluación.
- Política de privacidad/consentimiento opt-in.
- QA de navegadores y hardware.
- Comunicación de correspondencia curricular sin equivalencia.
- Sin cuenta, microtransacción o anuncio dentro de Ohmdal.

## H7 — Expansiones

**Estado:** `FUTURE`.

No abrir producción antes del release estable. Orden pedagógico: La Marea → La Señal → Las
Máquinas → La Decisión → La Voz → El Empalme. Empaquetado comercial puede agrupar arcos; la
financiación puede liberar el DLC completo para escuelas/usuarios.

## Riesgos de planificación

| Riesgo | Respuesta |
|---|---|
| Quality bar excede equipo | reducir territorio/variantes, nunca gates de composición o causalidad |
| Contenido V2 demora arte | usar blockout etiquetado; no fijar assets alrededor de un modelo dudoso |
| Mobile no alcanza 30 fps | reducir DPR, VFX, sombra y densidad; si falla, detener dirección |
| Sprite/3D no integra | resolver en H2, no durante producción regional |
| Expansiones fragmentan acceso | precio fuera del mundo + liberación completa por financiación |
| Worktrees/ownership colisionan | detener ambos roles y devolver decisión al Director |

## Definition of Done del programa

Cada hito entrega resumen, archivos, comandos, resultados, capturas/métricas cuando corresponda,
riesgos y pendientes explícitos. `build` no equivale a terminado. Un gate fallido se registra como
fallo; nunca como aprobación parcial silenciosa.
