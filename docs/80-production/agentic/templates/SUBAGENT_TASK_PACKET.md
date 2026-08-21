# Subagent Task Packet

> Máximo aproximado: 50 líneas. El parent sintetiza evidencia previa; no pega
> transcripts crudos. Para especialistas frescos: `fork_turns="none"`.

## TASK
`<id y título corto>`

## ROLE
`<explorer | worker | browser-player | reviewer>`

## OBJECTIVE
`<un resultado observable>`

## ALLOWED_FILES / SURFACE
- `<paths o superficie read-only/write>`

## READ_FIRST
- `AGENTS.md`
- `<scope AGENTS / authority / archivo directo>`

## DO_NOT_LOAD
- `<recovery history, otros mundos, skills/docs no pertinentes>`

## INPUT_FACTS
- `<hechos sintetizados; fuente cuando importa>`

## ACCEPTANCE
- `[ ] <criterio binario/observable>`

## OUTPUT_SCHEMA
`<campos exactos y máximo de findings>`

## CAN_EDIT
`<false | paths exactos>`

## CAN_SPAWN_CHILDREN
`false`

## TOKEN/CONTEXT BUDGET
`<archivos/turnos/output máximos; stop si es desproporcionado>`

## STOP
`<condición de éxito, bloqueo o escalación; no iniciar otra tarea>`
