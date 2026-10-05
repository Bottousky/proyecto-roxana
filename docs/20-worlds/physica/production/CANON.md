# Physica — qué es canon, qué está implementado, qué es propuesta y qué es legado

Relevado el 2026-10-05 en la rama `claude/physica-opus55-production-465980` (base `f7984ca`).
El contrato `PHYSICA_OPUS55_LOOP.md` actualiza la dirección creativa. Esta tabla no borra
la historia: el legado sigue en git y se cita por commit.

## Fuentes que existen hoy

| Fuente | Dónde | Estado |
|---|---|---|
| `LORE.md` (raíz) | árbol actual | **CANON** del proyecto. Physica figura sólo como premisa: «el Instituto alteró condiciones para aislar fenómenos; las configuraciones superpuestas dejaron consecuencias que hay que comprender mediante observación y experimentación». |
| Landing del Instituto (`experiments/playcanvas/src/escuela/`) | árbol actual (rama Ohmdal/landing) | **IMPLEMENTADO** fuera de Physica: Taller de Física con «una pecera con un mundo adentro», «consola de leyes», «quien se acerca se vuelve del tamaño de un átomo». Physica figura `available:false`. No se modificó. |
| GDD maestro AAA v1 y documentos v1 de Physica | `git show 311fd0c:docs/20-worlds/physica/…` | **LEGACY**. Retirados del árbol por el reinicio `c414b0c` (2026-09-08). Sus propios encabezados los marcan PROPOSED (autoridad 3–5) salvo el maestro, que se declaraba fuente de verdad sólo de su rama. |
| GDD v0.2 y guion del vertical slice v0.2 | `git show 311fd0c:docs/20-worlds/physica/legacy-gdd-v0.2/…` | **LEGACY** («fundación canónica» en su momento, 2026-08-05). |
| Prototipo Babylon/Havok (`src/experiences/physica/`) | `311fd0c` | **LEGACY**. Auditado: no implementaba zonas de gravedad (el agua «subía» como partículas; las piedras caían siempre). Havok estaba inerte. Texturas generadas con mmx-cli sin procedencia ni licencia registradas: no se reutilizan. |

## Elementos y su clasificación

| Elemento | Clasificación | Nota |
|---|---|---|
| Physica como micromundo experimental creado por los profesores del Instituto | CANON (LORE + contrato) | |
| Acceso desde el Instituto (Taller de Física / pecera) | CANON en la landing; **sin conectar** | La entrada de Physica todavía es aislada (`experiments/physica`). |
| Envoltura subatómica («tamaño de un átomo») | CANON en la landing | Sólo como ambientación; el juego no la presenta como física cuántica real. |
| Reloj-dispositivo | LEGACY con respaldo débil | Aparece en el GDD v0.2/v1. Se conserva como objeto en la muñeca del explorador (sin funciones todavía). |
| Bitácora | LEGACY + IMPLEMENTADO | Implementada como cuaderno que formaliza después de la experiencia (`src/journal.js`). |
| Cascada ascendente | LEGACY (key art) → **IMPLEMENTADO** con modelo nuevo | Ver `DECISIONES.md`. |
| Metrópolis detrás del paisaje | LEGACY + contrato | Sólo insinuada en el horizonte. Sin implementar. |
| INSTRUMENTO (compañero), Voz Docente | LEGACY | No implementados. Sin decisión. |
| Nombres «Orilla», «Terraza», «Soporte de la orilla/del borde» | **PROPUESTA** | Nombres de trabajo de esta iteración. |
| Aspecto del explorador | **PROPUESTA** | Ningún documento lo define. Ver `DECISIONES.md`. |

## Conflictos registrados

1. **El jugador no apaga anomalías.** El legado (arc-01 cap. 0, vision §8, narrative §1.1) hacía que la cascada «dejara de subir cuando el jugador comprende». El contrato lo prohíbe: aquí la cascada sigue y se usa.
2. **2D/2.5D primero, 3D al descubrir la metrópolis.** El legado (vision §7, PHYS-WS-3) pedía mantener el eje 2.5D también en la metrópolis. Manda el contrato. La escena ya es 3D con cámara lateral para que la profundidad exista desde el principio.
3. **Dioramas compactos (referencia Captain Toad)** frente a «mundo lateral continuo y monumental» del legado. Manda el contrato.
4. **Tecnología.** El usuario indicó el 2026-10-05: «no tengas en cuenta las decisiones técnicas del juego que ya estaban en el repo». Por eso no se parte del prototipo Babylon ni del motor de Ohmdal (PlayCanvas). El contrato pedía «conservar lo útil» del motor existente; la instrucción explícita del usuario prevalece. Ver `DECISIONES.md` D1.
5. **Pecera con «leyes regulables a gusto»** (landing) frente a «no existe edición global libre» (legacy §8). Sin resolver; no afecta a la escena actual.
