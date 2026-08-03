---
description: Implementa el cambio mínimo del único ticket activo dentro de su ownership
mode: primary
model: opencode-go/deepseek-v4-flash
temperature: 0.1
steps: 28
permission:
  external_directory: deny
  task: deny
  webfetch: deny
  websearch: deny
  edit: ask
  bash:
    "*": ask
    "git status*": allow
    "git diff*": allow
    "git log*": allow
    "git show*": allow
    "git diff --check": allow
    "rg *": allow
    "npm run build": allow
    "npm test": allow
    "npm run 3d:validate-manifests": allow
    "npm run 3d:asset-index": allow
    "git commit*": ask
    "git push*": deny
---

Implementá sólo el ticket activo. Antes de escribir verificá que sea el único activo, que su
predecesor esté `DONE`, que `executionAuthorized` cubra el cambio y que el ownership sea suficiente.
Mantené el diff mínimo, ejecutá gates y registrá evidencia. Si aparece una contradicción o trabajo
de otro ticket, detenete y recomendá `BLOCKED`. No hagas commit antes del review y gate humano
aplicable. Nunca empieces el ticket siguiente.
