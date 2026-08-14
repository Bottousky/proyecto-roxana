# SESIÓN A — ROXANA DESIGN CONSTITUTION
## Game Design Pillars · Design Language · Canon & Document Authority

**Misión:** cerrar las reglas que gobiernan todo Proyecto Roxana antes de seguir profundizando mundos.

**Fuentes de autoridad de entrada**
- `00_ROXANA_GDD_GLOBAL_REBOOT_v1.md`
- `05_AUDITORIA_CANON_LEGACY.md`
- documentación global legacy del Instituto, Bitácora y Mundos Aplicados que sea recuperada durante la sesión.

---

# 1. Resultado obligatorio

La sesión debe producir:

1. `ROXANA_GAME_DESIGN_PILLARS_v1.md`
2. `ROXANA_DESIGN_LANGUAGE_v1.md`
3. `ROXANA_CANON_POLICY_v1.md`
4. `ROXANA_DOCUMENT_ARCHITECTURE_v1.md`
5. `ROXANA_DESIGN_REVIEW_CHECKLIST_v1.md`

No debe diseñar todavía campañas completas.

---

# 2. Borrador — Game Design Pillars

## P01 — La disciplina debe existir como regla del mundo
El conocimiento no se pregunta desde afuera. Debe cambiar qué puede observar, manipular o construir el jugador.

**Test:** si eliminamos textos y fórmulas, ¿la mecánica todavía representa el concepto?

## P02 — Experimentar antes de formalizar
La secuencia pedagógica base es:

**fenómeno → acción → consecuencia → hipótesis → nueva prueba → formalización → reutilización**

La Bitácora puede poner nombre a una relación después de que el jugador haya generado evidencia suficiente.

## P03 — Cada mundo tiene un verbo nuclear
- Ohmdal: **CONECTAR**
- Physica: **EXPERIMENTAR**
- Bitland: **PROGRAMAR**
- Arithmos: **TRANSFORMAR**

Todo sistema importante debe reforzar ese verbo o justificar por qué existe.

## P04 — Un buen puzzle demuestra comprensión
No basta con recordar un dato. Resolver debe exigir leer estado, predecir consecuencias y modificar un sistema.

## P05 — Fallar produce información
El mundo debe responder de forma observable. El jugador debería poder inferir por qué algo no funcionó.

**Evitar:** “incorrecto”, reinicios opacos, castigo por ensayo razonable.

## P06 — La abstracción se gana
Primero se toca una consecuencia. Después aparece la representación.

Ejemplos:
- flujo eléctrico → magnitud;
- movimiento → vector;
- comportamiento de robot → pseudocódigo;
- equivalencia espacial → notación algebraica.

## P07 — Varias soluciones cuando la disciplina lo permita
Ingeniería, programación y matemática ganan valor cuando una solución puede ser correcta pero distinta en costo, robustez, elegancia, velocidad o generalidad.

## P08 — El conocimiento restaura
Aprender debe dejar una marca observable:
- una red vuelve a encenderse;
- una estructura vuelve a moverse;
- una ciudad automatiza una función;
- una región geométrica recupera coherencia;
- el Instituto revive.

## P09 — El juego debe sobrevivir sin la etiqueta “educativo”
Una persona debería poder desear jugar por exploración, desafío, belleza, sistemas, misterio o maestría.

## P10 — El contenido académico no manda sobre el pacing
Una secuencia curricular es insumo, no level design. El orden final puede reestructurarse para construir una curva jugable mejor.

## P11 — La narrativa no explica lo que el sistema puede mostrar
Los NPCs tienen cultura, intereses y conflictos. No son presentadores de PowerPoint.

## P12 — El Instituto une; no uniforma
Los mundos comparten:
- protagonista;
- Bitácora;
- metaprogresión;
- misterio global;
- lenguaje de feedback;
- reglas pedagógicas.

No tienen obligación de compartir:
- cámara;
- combate;
- género;
- ritmo;
- arte exacto.

## P13 — La maestría es opcional, la comprensión no
La campaña enseña intuición + formalización suficiente. Los retos opcionales permiten optimización y profundidad cercana a problemas reales.

## P14 — Toda complejidad nueva debe comprar posibilidad jugable
Si un concepto agrega vocabulario pero no agrega una decisión o una lectura nueva, todavía no encontró su representación correcta.

## P15 — Roxana culmina en integración
Los mundos deben primero ser autosuficientes. Más tarde, los sistemas reales deben mostrar que electrónica, física, computación y matemática se entrelazan.

---

# 3. Borrador — Design Language

## 3.1 Escala de interacción

Toda idea nueva debería recorrer, cuando corresponda:

1. **Percibir** — notar que algo ocurre.
2. **Manipular** — cambiar una variable o relación.
3. **Predecir** — anticipar el efecto.
4. **Representar** — leer símbolo, diagrama, número o código.
5. **Combinar** — usarla junto a otras ideas.
6. **Optimizar** — encontrar una solución mejor.
7. **Transferir** — reconocer la misma idea en otro contexto.

## 3.2 Tipos de recompensa

Prioridad:
1. transformación del mundo;
2. nueva capacidad;
3. acceso;
4. nueva lectura del sistema;
5. narrativa;
6. cosmético/coleccionable.

Evitar convertir puntos, XP o estrellas en la recompensa dominante.

## 3.3 Tipos de tutorialización

Orden preferido:
1. affordance visual;
2. espacio seguro;
3. consecuencia;
4. reacción de personaje;
5. hint contextual;
6. Bitácora;
7. explicación explícita.

## 3.4 Lenguaje de dificultad

La dificultad puede crecer por:
- cantidad de variables;
- distancia causa–efecto;
- necesidad de anticipación;
- simultaneidad;
- restricciones;
- información incompleta pero inferible;
- necesidad de combinar conceptos;
- cantidad de soluciones posibles;
- optimización.

No crecer simplemente escondiendo información.

---

# 4. Borrador — Canon Policy

## Estados
**CANON** — hecho o regla ratificada.  
**PROPOSED** — candidato activo.  
**LEGACY** — referencia histórica sin autoridad actual.  
**REJECTED** — descartado conscientemente.  
**EXPERIMENTAL** — hipótesis de prototipo; no elevar hasta validar en juego.

## Regla de precedencia
Si dos documentos contradicen:
1. gana el más alto en jerarquía;
2. dentro del mismo nivel, gana la decisión más reciente explícitamente ratificada;
3. una implementación existente no convierte una idea en canon.

## Canon mínimo
No fijar detalles si no afectan consistencia, producción o identidad.

## Canon negativo
Registrar decisiones importantes descartadas para que futuros agentes no las redescubran eternamente.

---

# 5. Borrador — Arquitectura documental

```text
/docs
  /00-governance
    game-design-pillars.md
    design-language.md
    canon-policy.md
    document-authority.md

  /10-global
    institute-bible.md
    bitacora-system.md
    global-narrative.md
    metaprogression.md
    cross-world-systems.md

  /20-worlds
    /ohmdal
      /vision
      /gameplay
      /world
      /narrative
      /content
      /production
    /physica
    /bitland
    /arithmos

  /80-production
    content-db
    roadmaps
    qa
    asset-manifests

  /90-legacy
    ...
```

Cada documento debería declarar:
- `status`;
- `authority_level`;
- `version`;
- `last_ratified`;
- `supersedes`;
- `depends_on`;
- `open_questions`.

---

# 6. Design Review Checklist

Un feature NO pasa review si alguna respuesta crítica es “no”:

- ¿refuerza la fantasía del mundo?
- ¿usa su verbo nuclear?
- ¿el jugador actúa sobre el concepto?
- ¿el feedback permite aprender del resultado?
- ¿la teoría aparece después de evidencia suficiente?
- ¿la dificultad proviene del sistema y no de opacidad?
- ¿su recompensa modifica capacidad, mundo o comprensión?
- ¿es divertido sin explicar que es educativo?
- ¿respeta el canon de mayor autoridad?
- ¿es implementable y testeable como unidad?
- ¿sabemos qué hipótesis de diseño valida?

---

# 7. Definition of Done de la sesión A

La sesión termina solamente si:

- hay ≤15 pilares, claros y no redundantes;
- existe una jerarquía documental estable;
- CANON/PROPOSED/LEGACY/REJECTED/EXPERIMENTAL quedan definidos;
- existe una checklist utilizable por reviewers humanos/agentes;
- se registran explícitamente preguntas abiertas globales;
- no se introduce lore innecesario.

---

# 8. Prompt de arranque de la sesión

> Estamos trabajando dentro de Proyecto Roxana. Tu misión en esta sesión es actuar como Game Director / Design Governance Lead. Usa los GDD Reboot actuales como entrada, pero no los expandas indiscriminadamente. Debes cerrar la constitución de diseño del proyecto: Game Design Pillars, Design Language, Canon Policy, Document Architecture y Design Review Checklist. Distingue CANON, PROPOSED, LEGACY, REJECTED y EXPERIMENTAL. No diseñes todavía campañas completas ni elijas tecnología. Cada regla debe ser operativa: tiene que permitir aceptar o rechazar decisiones futuras de Ohmdal, Physica, Bitland o Arithmos. Si una idea vieja contradice la nueva tesis —cada disciplina existe como física jugable propia— baja su autoridad en lugar de intentar preservarla.
