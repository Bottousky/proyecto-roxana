# Decisiones del control plane

| ID | Fecha | Decisión | Consecuencia |
|---|---|---|---|
| CP-001 | 2026-08-02 | Arco I usa `STRICT-SERIAL`, WIP 1 | Ningún sucesor antes de `DONE` |
| CP-002 | 2026-08-02 | Sólo el Director cambia estados | Modelos recomiendan; no promueven por sí solos |
| CP-003 | 2026-08-02 | Gate humano para cambios visibles | Reviewer auxiliar no decide calidad final |
| CP-004 | 2026-08-02 | Cámara casi ortográfica, 4 direcciones y Ohm sprite | Variantes H2 perdedoras quedan archivadas |
| CP-005 | 2026-08-02 | H3 y producción siguen sin autorización | `executionAuthorized=false`, `baseCommit=null` |
| CP-006 | 2026-08-02 | OpenCode ejecuta un ticket por ciclo | Se retiran agentes H1/H2 y se crean plan/builder/reviewer |
| CP-007 | 2026-08-02 | Routing basado en inventario local, no fama | Kimi no se configura hasta aparecer con ID real |
| CP-008 | 2026-08-02 | Assets pasan gates modulares y de procedencia | Meshy/generación paga presupuesto cero |
| CP-009 | 2026-08-02 | Esta rama consolida control y Director | No copiar archivos manualmente entre worktrees |
| CP-010 | 2026-08-02 | `ARC1-001` aprobado: la cámara corregida se acepta y el Arco I avanza | `ARC1-001` pasa a `DONE`; `ARC1-002` pasa a `READY` |
| CP-011 | 2026-08-02 | La equivalencia con *DQ3 HD-2D Remake* queda abierta, no bloqueante | Se re-evalúa en `ARC1-024` y `ARC1-030`, con materiales y luz presentes; no se reabre `ARC1-001` |
| CP-012 | 2026-08-02 | El layout/HUD mobile es deuda P2, no defecto de cámara | Se atiende en `ARC1-026`; no amplía el alcance de `ARC1-001` |
| CP-013 | 2026-08-02 | **H3 autorizado** con `baseCommit = b49b617` | `executionAuthorized = true`; `ARC1-003` pasa a `READY` |
| CP-014 | 2026-08-02 | Android físico diferido a `ARC1-060` (opción B) | Todo claim de rendimiento en Android físico es `not-run` hasta el QA de release |
| CP-015 | 2026-08-02 | Golden frames, identidad y límites legales **congelados** | Un ticket de escena no puede redefinirlos para que su resultado pase |
| CP-016 | 2026-08-02 | La unidad de ejecución pasa a ser el **paquete** `ARC1-NNN-X` | Una sesión nueva por fase; hallazgos ajenos a `OPEN_ISSUES.md`; cada fase emite telemetría |
| CP-017 | 2026-08-02 | Rotar `ownership.json` es parte del **cierre**; builder y reviewer obtienen append-only | `ARC1-003` verificado y congelado; `ARC1-004` desbloqueado; `OI-001` cerrado |
| CP-018 | 2026-08-02 | Color script y shot deck **congelados**; las safe areas son vinculantes | `CP-012` deja de ser cualitativo: mobile `FAIL` con número, destino `ARC1-026` |
| CP-019 | 2026-08-02 | Inventario de escenas y contenido V2 **congelados**: cinco escenas, tres actos causales, envolvente de duración por beat | `ARC1-006` presupuesta sobre esas cinco escenas; el mapa aporta <2 % de la duración; `OI-002` y `OI-003` abiertos |

Una decisión nueva agrega `CP-020+`, motivo, evidencia, impacto y si requiere autorización o ADR.

## CP-019 — Escenas, beats, duración y fichas V2 congelados

**Motivo.** `H3_CONTRACT.md` §2 declara que la unidad de producción es la escena causal completa,
pero nunca se escribió la lista. Convivían cuatro particiones del mismo slice —3 zonas de nivel,
3 sets de doc. 10, 7 beats y 8 golden frames— y ninguna era la autoridad. Sin reconciliarlas,
`ARC1-006` no puede presupuestar «por escena» y `ARC1-030` no tiene contra qué medir ritmo.

En paralelo, `ACCEPTANCE_GATES.md` §Educación exige ficha V2 antes de producir interacción final,
pero las fichas vivían sólo en `src/**` y en el run de preproducción: ningún documento del control
plane las declaraba canon ni decía qué beats quedan sin ficha y por qué.

**Evidencia.** `SCENE_INVENTORY.md`, `CONTENT_V2.md`, `evidence/ARC1-005/route-timing.json` y
`evidence/ARC1-005/cards-audit.json`. Todo calculado, no citado:

- recorrido completo **38,05 m**, **19,03 s** de caminata más 4,50 s de esperas guionadas;
- las cuatro particiones se reconcilian sin resto en **cinco escenas**, de las cuales sólo **tres**
  cargan un acto causal;
- las **seis** fichas verifican 30/30 campos, orden canónico, identificador `-v2` y `V2 CANON-EDU`
  por ejecución sobre `cards.ts`;
- el solver de la Puerta es **idéntico** al de Lumen, verificado por igualdad, no prometido;
- **88.044** órdenes de diagnóstico válidos de ≤12 acciones: 9 acciones el mínimo por continuidad,
  10 por tensión.

**Impacto.**

1. `SCENE_INVENTORY.md` y `CONTENT_V2.md` pasan a canon congelado; enmendarlos requiere `CP-0NN`
   propia. El canon congelado son ahora **siete** documentos.
2. `ARC1-006` presupuesta sobre las cinco escenas, no sobre zonas ni golden frames, y debe decidir
   si el overworld mínimo de `ARC1-010` recibe línea propia: hoy no tiene duración asignada.
3. **El mapa no produce la duración.** El piso de recorrido es 23,53 s, entre 1,1 % y 1,6 % del
   objetivo de 25–35 min. Las escenas causales cargan 24,6–34,6 min. No se agranda el mapa para
   llenar el tiempo: doc. 10 descarta mundo abierto explícitamente.
4. La envolvente de duración por beat es **objetivo de diseño, no medición**, y `ARC1-030` la
   reporta por beat con mediana y dispersión. Un informe de duración total no cierra el gate.
5. `ARC1-018`, `ARC1-019`, `ARC1-021` y `ARC1-022` implementan las seis fichas y **no** las
   reinterpretan. Una discrepancia es P1 del ticket, no una corrección de la ficha.
6. Se abren `OI-002` y `OI-003`, ambos P2 y ambos sobre la escena E2 —activación de Ohm—: sin
   anclaje, sin golden frame, sin sujeto protegido de cámara y sin ficha que describa su fenómeno
   inicial. Destinos `ARC1-011` y `ARC1-015`. **No se corrigen acá**, y convertirlos en ticket es
   decisión del Director (`CP-002`).

**Lo que esta decisión no hace.** No repite la auditoría independiente V2: la hereda del run de
preproducción y lo declara (`CONTENT_V2.md` §3.2). No promueve nada a V3 —eso exige playtest,
`ARC1-030`— ni fija el presupuesto técnico por escena.

**Desviación declarada.** Las fases `plan`, `build` y `review` de ambos paquetes corrieron en la
misma sesión y con la misma ruta, contra `PACKETS.md` §«Frontera de sesión». Mismo criterio que
`CP-018`, registrado en `telemetry.json`. **No hubo review independiente.**

## CP-018 — Color script y shot deck congelados; safe areas vinculantes

**Motivo.** El harness ya implementaba dos horas —`afternoon` y `twilight`— con valores concretos,
pero ninguna regla escrita explicaba qué comunican ni dónde cambia una por la otra. Sin eso,
`ARC1-024` habría tenido que decidir el lenguaje de color y la composición *dentro* de un ticket de
escena, y cualquier resultado habría sido defendible a posteriori — exactamente lo que `CP-015`
prohíbe.

Faltaba además la «hoja de encuadres con safe areas desktop/mobile» que doc. 15 §«Golden slice antes
de campaña» exige antes de producir arte.

**Evidencia.** El cálculo determinista sobre los valores reales del harness **confirmó** el patrón
que la Biblia declaraba en prosa, y aportó dos reglas que no estaban escritas:

- luz natural −29,8 % (principal) y −28,7 % (fill), oficio 0,0 %, y **la única que sube es la
  motivada por el sistema**: conducto de la Puerta **+51,6 %**;
- **el vidrio no cede valor** al crepúsculo (+0,6 % contra ≈ −31 % del resto) y el agua cede la mitad
  que la piedra: la infraestructura se lee *más*, no menos;
- el rango de luma entre familias **se ensancha** 0,267 → 0,291: el crepúsculo no comprime el
  contraste, y ahora no puede hacerlo;
- un solo color del slice supera el umbral de saturación 0,60 reservado al estado eléctrico, y es el
  correcto (`0x63dce8`, S = 0,743).

Medición del HUD por DOM sobre `/labs/ohmdal-hd2d-preprod/`, 0 errores y 0 warnings en consola:
desktop 1440×900 **PASS** (franja libre 73,8 % contra 70 % de contrato); mobile 390×844 **FAIL**
(48,0 % contra 60,1 %, faltan 1,75 m en C2).

Detalle en `evidence/ARC1-004/palette.json`, `hud-rects.json` y `freeze.md`.

**Impacto.** `COLOR_SCRIPT.md` y `SHOT_DECK.md` pasan a canon congelado, al mismo nivel que
`GOLDEN_FRAMES.md`, `IDENTITY.md` y `LEGAL_REFERENCES.md`: un ticket de escena no puede redefinirlos
para que su resultado pase. Ante contradicción entre el shot deck y un golden frame, **gana el
golden frame**.

`ARC1-024` reemplazará los valores de blockout por arte final, pero seguirá obligado por la regla de
intensidad, la de valor, el beat map y la reserva del cian, y deberá volver a medir contra
`palette.json`.

**`CP-012` queda reclasificado.** Deja de ser una observación cualitativa y pasa a ser
incumplimiento medible de `SHOT_DECK.md` §2, con tres defectos numerados: `topbar` invade 60 px,
`diagnosis` 42 px, y el D-pad se solapa con el panel de estado en 40 × 66 px. Sigue siendo P2 y sigue
resolviéndose en `ARC1-026`, que ahora tiene criterio de cierre en vez de un juicio de gusto. No se
corrigió acá: el HUD está fuera del ownership de un ticket de canon.

No cambia el backlog, el alcance autorizado por `CP-013` ni el canon de `ARC1-003`. No requiere ADR.

**Desviación declarada.** Las fases `plan`, `build` y `review` de ambos paquetes corrieron en la
misma sesión y con la misma ruta (`claude`), contra `PACKETS.md` §«Frontera de sesión». El Director
lo decidió antes de empezar. Está registrado en `telemetry.json`, no simulado como review
independiente.

## CP-017 — La rotación de ownership pertenece al cierre

**Motivo.** `ownership.json` v3 seguía declarando `activeIssueKey: ARC1-003` y protegiendo
`tickets/ARC1-004.md`, justo la ficha que hay que escribir para abrir el sucesor. La causa no fue una
ejecución interrumpida: la nota del propio archivo difería el reemplazo a «cuando `ARC1-004` sea el
ticket activo», y ningún paso de `EXECUTION_PROTOCOL.md` era responsable de hacerlo. El defecto es
estructural y se habría repetido en los 58 tickets restantes.

**Evidencia.** `ARC1-003` verificado condición por condición antes de congelarlo, no por declaración:

- los nueve archivos de `88f669d` caen dentro del ownership declarado por la ficha;
- anclajes contra `evidence/ARC1-001/metrics.json` — C1 13,5/20 m, C2 9,0/14,5 m, C3 12,0/18,0 m,
  desktop y mobile, coincidencia exacta;
- histéresis 0,75 m en ambos cruces (`x = −3,0` y `x = 9,5`), `extraChanges = 0`;
- zona muerta declarada 16/10/4 % de 13,5 m = 2,16 / 1,35 / 0,54 m, idéntica a la medida;
- estado de captura declarado en `GOLDEN_FRAMES.md` §7, no inferido: sólo GF-01 tiene capturas y son
  de blockout;
- build, tests, manifests y `git diff --check` PASS;
- `ARC1-004` ya estaba `READY` en `tasks.json`.

**Impacto.** `ownership.json` pasa a v4: `activeIssueKey = ARC1-004`; los artefactos de `ARC1-003`
—`GOLDEN_FRAMES.md`, `IDENTITY.md`, `LEGAL_REFERENCES.md`, su ficha y su evidencia— pasan de
`director/write` a `protected`, coherente con `CP-015`; se libera `tickets/ARC1-004.md` y se protege
`tickets/ARC1-005.md`. `EXECUTION_PROTOCOL.md` §E incorpora la rotación como paso del cierre, con sus
cuatro movimientos explícitos.

Además, `builder` y `reviewer` reciben acceso **append-only** a `OPEN_ISSUES.md` y `telemetry.json`.
Sin eso `CP-016` no puede funcionar: el ejecutor no podría registrar un hallazgo que tiene prohibido
arreglar, ni cerrar su propia fase. Append-only es agregar una fila o un record; nunca editar ni
borrar los existentes. No amplía el acceso a código, assets ni canon.

No cambia el backlog, el canon congelado ni el alcance autorizado por `CP-013`. No requiere ADR.

## CP-016 — El paquete es la unidad de ejecución

**Motivo.** El ticket describe qué queda cerrado, no qué cabe en una sesión. Faltaba esa segunda
capa: tickets como `ARC1-011` («cerrar escala, recorrido y blockout Portal–Plaza», estimado en un
día) se estaban entregando a un ejecutor como una sola instrucción. El resultado observado son
sesiones largas sin punto de evaluación, contexto contaminado y loops abiertos.

**Evidencia.** El control plane ya tenía WIP 1, gates, ownership, rondas acotadas y estados de
cierre — pero todos definidos a nivel de ticket. `tickets/` sólo admite el ticket activo y no existía
ningún artefacto entre «ficha del ticket» y «prompt de ejecución». `evidence/ARC1-001/metrics.json`
mide la cámara, no el proceso: no había ningún registro de qué modelo ejecutó qué, cuánto tardó ni
cuántas rondas consumió, con lo cual `CP-007` («routing por inventario, no por fama») no tenía datos
locales con los que decidir.

**Impacto.** Se agregan `PACKETS.md`, `packets/`, `OPEN_ISSUES.md` y `telemetry.json`, y se cablean
en `control` de `tasks.json`. El ciclo A–D de `EXECUTION_PROTOCOL.md` pasa a ejecutarse por paquete;
E sigue siendo por ticket, igual que el commit. Presupuesto de rondas: 2 por paquete y 4 por ticket
— la nueva capa no puede usarse para multiplicar correcciones. No cambia el backlog, ni los 62
issues, ni el canon congelado por `CP-015`, ni el alcance autorizado por `CP-013`. No requiere ADR.
`ARC1-004` es el primer ticket que ejecuta con esta capa.

## CP-015 — Canon visual congelado

**Motivo.** Doc. 15 registra que en DQIII la identidad precede al efecto, y que lo que no se debe
imitar es «aprobar planta por captura estática». Congelar los contratos de lectura antes de producir
arte evita construirlo alrededor de una escala o una cámara todavía inestables.

**Evidencia.** `GOLDEN_FRAMES.md`, `IDENTITY.md`, `LEGAL_REFERENCES.md` y
`evidence/ARC1-003/freeze.md`. Los parámetros de cámara citados salen de
`evidence/ARC1-001/metrics.json`; las rutas R0…R9 de `architecture/levelData.ts:107-116`.

**Impacto.** Cada golden frame tiene **dos** contratos: uno de lectura, verificable en captura, y uno
de recorrido, verificable sólo jugando. Un frame aprobado sólo por screenshot no está aprobado.

«Identidad propia / legal» es el único criterio de la quality bar que exige **5/5**; un fallo ahí es
P0 y bloquea el ticket sin importar la calidad visual alcanzada.

Sólo GF-01 tiene capturas reales, de blockout. GF-02 … GF-08 quedan especificados y **no capturados**;
se declara en vez de simularse. Ningún ticket puede inferir el resultado visual de un frame que no
capturó.

Enmendar cualquiera de los tres documentos requiere una decisión `CP-0NN` propia.

## CP-013 — Autorización de H3

**Motivo.** El usuario autorizó explícitamente el contrato `H3_CONTRACT.md` con las cuatro respuestas
que el propio contrato exigía: base en `b49b617`, presupuesto de §5, ownership de §4 y opción B de
Android.

**Evidencia.** `H3_CONTRACT.md` §8 y `evidence/ARC1-002/authorization.md`. Precondición de doc. 15
cumplida: `ARC1-001` quedó `DONE` en `b49b617` antes de autorizar.

**Impacto.** `executionAuthorized` pasa a `true` y `baseCommit` se congela en `b49b617`. Habilita la
cadena `ARC1-003` … `ARC1-035`. **No** levanta ninguna prohibición del §3: `src/jugar/**`, migración
de runtime, Meshy, generación paga, dependencias nuevas, regiones fuera del slice y la IP de Dragon
Quest siguen prohibidos.

La autorización es de alcance, no de resultado. Cada ticket conserva sus gates, su evidencia y su
aprobación humana cuando el cambio sea visible.

## CP-014 — Android físico diferido

**Motivo.** El informe final de H1/H2 condiciona H3 a medir en Android físico antes de reclamar
30 fps. No hay dispositivo medio de 2022 en este entorno. El usuario eligió avanzar difiriendo la
medición en vez de declarar un PASS emulado.

**Evidencia.** `docs/agent-runs/ohmdal-hd2d-preprod-v1/final-report.md` líneas 20-22 y 84-85.

**Impacto.** `ARC1-028` y `ARC1-029` miden desktop y mobile **emulado** únicamente. Ningún ticket
puede declarar PASS de rendimiento en Android físico antes de `ARC1-060`; el que lo necesite lo
declara `not-run` y continúa. Si aparece un dispositivo antes, se puede adelantar la medición sin
cambiar esta decisión.

## CP-010 — Aprobación de `ARC1-001`

**Motivo.** El Director emitió veredicto explícito: «El resize está corregido como lo esperaba […]
Avancemos y veamos cómo evoluciona Ohmdal».

**Evidencia.** `evidence/ARC1-001/commands.md`, `metrics.json` y `review.md`. Distorsión 0.0e+0 en
cinco viewports; zona muerta que corrige exactamente el excedente; un solo cambio de anclaje por
cruce con jitter de ±0.30 m absorbido por la histéresis. Build, tests, manifests y `git diff --check`
PASS sobre `73fecae`.

**Impacto.** Habilita preparar `ARC1-002`. No autoriza H3 ni ninguna implementación:
`executionAuthorized` sigue en `false` hasta que el contrato de `ARC1-002` fije base, ownership,
presupuesto y autorización humana propia.

## CP-011 — Referencia DQ3 HD-2D pendiente de verificación

**Motivo.** El Director aprueba el comportamiento medido pero no confirma que el lenguaje de cámara
iguale la referencia de calidad. Decide resolverlo por evolución antes que bloquear.

**Evidencia.** El slice es hoy un greybox sin materiales, iluminación dirigida, profundidad de campo
ni VFX; los tres elementos que definen el look HD-2D. La comparación todavía no es justa.

**Impacto.** No es P0/P1 y no reabre `CAM-FIX-001`. Se re-evalúa en `ARC1-024` y `ARC1-030`. Si ahí
la cámara no sostiene la referencia, se abre un ticket de corrección propio.

## CP-012 — Layout/HUD mobile como deuda

**Motivo.** En `mobile-390x844` el panel superior recorta «Recorrido automático», la franja jugable
queda comprimida entre el panel y la tarjeta de diagnóstico, y el D-pad pisa el panel de estado.

**Evidencia.** `docs/agent-runs/ohmdal-hd2d-preprod-v1/evidence/camera-correction/mobile-390x844.png`.

**Impacto.** Es chrome de DOM, no proyección: la cámara mobile amplía el alto visible en vez de
estirar. Se atiende en `ARC1-026` (baseline de accesibilidad). No requiere autorización ni ADR.
