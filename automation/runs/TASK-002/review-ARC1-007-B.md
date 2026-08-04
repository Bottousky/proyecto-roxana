# Review Packet — ARC1-007-B

**Contexto:** este paquete es TODO lo que necesitás. No leas el historial del builder ni su razonamiento.
**Tu salida es exactamente una de tres:** `SHIP` · `FIX_FIRST` · `RETHINK`, con una justificacion breve
y concreta. No implementes cambios. Clasifica cada hallazgo P0, P1 o P2; solo P0 y P1 bloquean.

## Objetivo declarado

El laboratorio deja de arrancarse solo y pasa a montarse **a través de `RuntimeHost`**, como un
`ExperienceRuntimeModule` con runtime propio `hd2d-three`, cargado bajo demanda y sin desplazar al
runtime cenital de Ohmdal.

## Criterios de aceptacion

- [ ] `ExperienceRuntime` incluye `'hd2d-three'` y `ExperienceLocation` acepta `runtime?` opcional;
- [ ] `runtimeHost.ts` resuelve el runtime destino con ese campo cuando está presente y con `experienceById(...).runtime` cuando no lo está: **sin el campo, el comportamiento es idéntico al anterior**;
- [ ] `src/experiences/ohmdal/hd2dRuntime.ts` exporta un `ExperienceRuntimeModule` cuyo `mount()` construye el laboratorio dentro del `hostEl` recibido y cuyo `destroy()` lo deja vacío;
- [ ] `loaders.ts` tiene la entrada `'hd2d-three'` como `import()` **dinámico**;
- [ ] el arranque de `labs/ohmdal-hd2d-preprod/index.html` pasa por `createRuntimeHost(...).start({ experienceId: 'ohmdal', roomId: 'plaza', runtime: 'hd2d-three' })`;
- [ ] `tests/a2-hd2d-runtime.test.ts` cubre, sin WebGL y sin importar `three`: resolución por override, que Ohmdal sin override sigue montando `topdown-phaser`, caché del loader, orden `snapshot → destroy → mount` al cruzar de runtime, y que `hd2dRuntime` no está en el grafo estático de `loaders.ts`;
- [ ] el build confirma que `three` queda en un chunk aparte y **no** en el de arranque del laboratorio;
- [ ] `npm run build` PASS;
- [ ] `npm test` PASS;
- [ ] `npm run 3d:validate-manifests` PASS;
- [ ] `git diff --check` PASS.

## Fuera de alcance

- src/jugar/**
- src/main.ts
- src/state.ts
- src/ui/**
- src/experiences/manifests.ts
- src/experiences/registry.ts
- src/experiences/ohmdal/topdownRuntime.ts
- src/experiences/placeholderRuntime.ts
- src/labs/ohmdal-hd2d-preprod/lab.ts
- src/labs/ohmdal-hd2d-preprod/labUi.ts
- src/labs/ohmdal-hd2d-preprod/architecture/**
- src/labs/ohmdal-hd2d-preprod/camera/**
- src/labs/ohmdal-hd2d-preprod/education/**
- src/labs/ohmdal-hd2d-preprod/integration/**
- src/labs/ohmdal-hd2d-preprod/lighting/**
- src/labs/ohmdal-hd2d-preprod/materials/**
- src/labs/ohmdal-hd2d-preprod/navigation/**
- assets/**
- tests/a0-experience-registry.test.ts
- tests/a1-runtime-host.test.ts
- package.json
- package-lock.json
- vite.config.ts
- docs/ohmdal-biblia/**
- docs/agent-runs/ohmdal-arco1/**
- docs/agent-runs/ohmdal-hd2d-preprod-v1/**
- docs/agent-runs/ohmdal-arc1-serial-v1/tickets/ARC1-008.md
- `lab.ts` y `labUi.ts` quedan cerrados: son el artefacto de `ARC1-007-A`, ya entregado. Si `B`
- necesitara modificarlos, el diseño de `A` estaba mal y se reporta en vez de parchear.
- `registry.ts` y `manifests.ts` están prohibidos por la decisión del ticket: el registro de
- experiencias no gana entradas y Ohmdal no cambia de runtime declarado. Los dos tests existentes
- tampoco se tocan: un cambio que obligue a editarlos no es aditivo.

## Rutas permitidas

```text
src/experiences/types.ts
src/experiences/loaders.ts
src/experiences/ohmdal/hd2dRuntime.ts
src/app/runtimeHost.ts
src/labs/ohmdal-hd2d-preprod/main.ts
labs/ohmdal-hd2d-preprod/index.html
tests/a2-hd2d-runtime.test.ts
docs/agent-runs/ohmdal-arc1-serial-v1/tickets/ARC1-007.md
docs/agent-runs/ohmdal-arc1-serial-v1/packets/ARC1-007/**
docs/agent-runs/ohmdal-arc1-serial-v1/evidence/ARC1-007/**
docs/agent-runs/ohmdal-arc1-serial-v1/OPEN_ISSUES.md
```

## Gates

- (heredados del kind)

## Artefactos presentes en disco

- baseline-desktop-1440x900.png  108320 B
- baseline-mobile-390x844.png  179868 B
- commands.md  13731 B
- console.txt  1336 B
- desktop-1440x900.png  108320 B
- mobile-390x844.png  179916 B
- parity.json  6186 B
- runtime-mount.json  5474 B

## Diff

```text
automation/schemas/task.schema.json                | 18 ++++++
 automation/scripts/audit-control-plane.mjs         | 24 ++++++++
 automation/scripts/validate-task.mjs               | 14 +++++
 automation/tasks/{queue => done}/TASK-003.json     | 12 +++-
 docs/agent-runs/ohmdal-arc1-serial-v1/BACKLOG.md   |  9 ++-
 docs/agent-runs/ohmdal-arc1-serial-v1/DECISIONS.md | 67 ++++++++++++++++++++-
 .../ohmdal-arc1-serial-v1/MODEL_ROUTING.md         | 69 ++++++++++++++++------
 .../ohmdal-arc1-serial-v1/OPEN_ISSUES.md           |  3 +
 docs/agent-runs/ohmdal-arc1-serial-v1/STATE.md     | 26 +++++++-
 .../ohmdal-arc1-serial-v1/ownership.json           | 15 ++++-
 10 files changed, 229 insertions(+), 28 deletions(-)
```

## Preguntas que el veredicto tiene que responder

1. ¿Cada criterio esta cubierto por una prueba observable, o por una afirmacion?
2. ¿El diff se salio de las rutas permitidas?
3. ¿Hay algo declarado que no existe en disco?
4. ¿Se arreglo algo ajeno al paquete en vez de registrarlo en OPEN_ISSUES.md?
5. ¿Alguna medicion se presenta como PASS sin metodo reproducible?
