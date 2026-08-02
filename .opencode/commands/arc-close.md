---
description: Cerrar el ticket activo sólo después de todos los gates
agent: builder
subtask: false
---

Auditá el cierre de `$1`. No modifiques estado si falta un gate automático, review P0/P1, evidencia
o aprobación humana aplicable. Si todo pasa y el usuario autorizó el cierre, actualizá únicamente
`tasks.json`, `STATE.md`, `DECISIONS.md` y evidencia del ticket; solicitá permiso para el commit.
Marcá el sucesor `READY` pero no lo analices ni lo implementes. Detenete después del informe.
