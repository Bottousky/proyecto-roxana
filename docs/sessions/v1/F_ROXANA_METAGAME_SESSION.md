# SESIÓN F — ROXANA METAGAME & CROSS-WORLD SYSTEMS
## Instituto · Bitácora · Metaprogresión · Integración

**Misión:** diseñar lo que hace que Ohmdal, Physica, Bitland y Arithmos sean una sola obra y no cuatro juegos agrupados.

**Depende de:** resultados maduros de A–E.

---

# 1. Documentos obligatorios

1. `ROXANA_INSTITUTE_BIBLE_v1.md`
2. `ROXANA_BITACORA_SYSTEM_v1.md`
3. `ROXANA_METAPROGRESSION_v1.md`
4. `ROXANA_GLOBAL_NARRATIVE_v1.md`
5. `ROXANA_CROSS_WORLD_CHALLENGES_v1.md`
6. `ROXANA_PLAYER_PROFILE_v1.md`
7. `ROXANA_GLOBAL_UI_UX_v1.md`
8. `ROXANA_CAMPAIGN_STRUCTURE_v1.md`
9. `ROXANA_CONTENT_AUTHORITY_MAP_v1.md`
10. `ROXANA_GLOBAL_VERTICAL_SLICE_CRITERIA_v1.md`

---

# 2. North Star

> El Instituto debe hacer visible que aprender en un mundo cambia cómo el jugador entiende y habita todos los demás.

---

# 3. Instituto Roxana

No es menú 3D.

Funciones:
- hogar;
- misterio;
- archivo;
- mapa de progreso;
- espacio transformable;
- lugar donde vuelven personajes/artefactos;
- cruce entre disciplinas;
- preparación para nuevos mundos.

### Restauración
El Instituto cambia en función de comprensión:
- taller eléctrico;
- laboratorio mecánico;
- sala de cómputo;
- gabinete matemático;
- biblioteca;
- exposiciones;
- mecanismos híbridos.

No llenar el hub de vendors genéricos.

---

# 4. Bitácora como sistema, no codex

## Capas

### Experiencia
Registra fenómenos vistos.

### Hipótesis
Permite conservar observaciones e ideas.

### Formalización
Aparecen nombres, unidades, fórmulas, diagramas, código.

### Red conceptual
Relaciona conceptos dentro y entre mundos.

### Herramienta
Puede:
- recuperar mediciones;
- comparar;
- fijar objetivos;
- mostrar diagramas construidos por el jugador;
- registrar soluciones.

### Maestría
Problemas opcionales, desafíos de transferencia, variaciones.

---

# 5. Regla temporal de la Bitácora

Nunca debe adelantarse al jugador.

Estados posibles de una entrada:
1. `OBSERVED`
2. `HYPOTHESIZED`
3. `FORMALIZED`
4. `APPLIED`
5. `MASTERED`
6. `TRANSFERRED`

Esto puede integrarse al Knowledge/Progress model del proyecto.

---

# 6. Metaprogresión

Evitar depender de XP.

Progresión global:
- capacidad de observación;
- instrumentos;
- accesos;
- relaciones descubiertas;
- espacios restaurados;
- herramientas compartidas cuando narrativamente corresponda;
- desafíos interdisciplinares.

### Regla
Un unlock global no debe destruir la identidad de otro mundo.

Ejemplo:
un instrumento de medición puede cruzar mundos; una mecánica nuclear completa no.

---

# 7. Perfil del jugador

Puede registrar:
- mundos/arcos;
- conceptos;
- soluciones;
- mastery;
- hints;
- rutas opcionales;
- construcciones;
- tiempos solo en retos donde sea relevante.

No presentar un promedio escolar como centro de identidad.

---

# 8. Narrativa global

Preguntas de largo plazo:
1. ¿qué era realmente el Instituto?;
2. ¿qué relación tenía con los Mundos Aplicados?;
3. ¿por qué perdió continuidad?;
4. ¿la escuela creó, descubrió o modificó esos mundos?;
5. ¿qué es la Bitácora?;
6. ¿por qué ciertos artefactos atraviesan portales?;
7. ¿qué cambia cuando se restauran varios mundos?

### Regla
Los misterios globales no deben quitar autonomía narrativa a cada mundo.

---

# 9. Cruces interdisciplinarios

Solo después de que cada verbo esté dominado.

## Tipo 1 — Lectura cruzada
Un concepto de un mundo ayuda a comprender otro.

## Tipo 2 — Herramienta cruzada
Instrumento de una disciplina agrega una lectura.

## Tipo 3 — Sistema híbrido
Problema real requiere dos mundos.

## Tipo 4 — Proyecto integrador
Tres o cuatro disciplinas.

Ejemplos:
- ascensor;
- robot;
- estación meteorológica;
- puente automatizado;
- invernadero;
- vehículo;
- red de iluminación adaptativa.

---

# 10. Ejemplo de desafío integrador — Ascensor

**Physica**
- masa;
- fuerza;
- energía;
- contrapeso.

**Ohmdal**
- motor;
- potencia;
- protección.

**Bitland**
- estados;
- sensores;
- control;
- seguridad.

**Arithmos**
- relaciones;
- dimensionamiento;
- optimización.

El jugador no recibe cuatro exámenes. Construye un ascensor.

---

# 11. Campaign structure proposal

## Prólogo
Instituto, Bitácora, primer portal.

## Ciclo I
Primer arco de cada mundo, en orden flexible parcialmente controlado.

## Interludio I
Instituto cambia; aparecen primeras conexiones.

## Ciclo II
Segundos arcos; herramientas más profundas.

## Proyecto Integrador I
Problema pequeño de dos disciplinas.

## Ciclos posteriores
Crece complejidad e integración.

### Importante
No bloquear demasiado pronto un mundo detrás de otro. La campaña debe permitir alternar para evitar fatiga de género.

---

# 12. UI/UX común

Común:
- navegación de Bitácora;
- lenguaje de objetivos;
- feedback de descubrimiento;
- accesibilidad;
- perfil;
- retorno al Instituto.

Específico:
- HUD de circuitos;
- instrumentos físicos;
- editor de programación;
- manipuladores matemáticos.

La consistencia no significa usar la misma UI para todo.

---

# 13. Content Authority Map

Para cada feature global registrar:
- owner;
- world dependencies;
- canon source;
- version;
- consumers;
- conflict policy.

Ejemplo:
`BITACORA_ENTRY_SCHEMA`
owner: Global Systems  
consumers: Ohmdal / Physica / Bitland / Arithmos  
authority: `ROXANA_BITACORA_SYSTEM_v1`

Esto es especialmente importante para Agentic Workbench.

---

# 14. Definition of Done

- Instituto tiene funciones jugables claras;
- Bitácora tiene estados y comportamiento;
- metaprogresión no depende de XP genérico;
- narrativa global tiene preguntas, no respuestas prematuras;
- existen reglas de cruce;
- se especifica al menos un desafío híbrido;
- campaña permite alternancia;
- authority map es utilizable por agentes.

---

# 15. Prompt de arranque

> Actúa como Creative Director + Metagame Systems Designer de Proyecto Roxana. Tu tarea es diseñar la capa que une Ohmdal, Physica, Bitland y Arithmos sin borrar sus identidades. Usa los GDDs maduros de cada mundo como contratos. Diseña Instituto, Bitácora, metaprogresión, narrativa global, campaña, perfil, UI común y cross-world challenges. La Bitácora debe registrar el viaje desde fenómeno a formalización y transferencia; no ser un simple codex. El Instituto debe transformarse materialmente con el progreso y funcionar como hogar/misterio/hub, no como menú. Los desafíos interdisciplinares deben ser sistemas reales, no cuatro preguntas pegadas. Produce también un Content Authority Map para que Agentic Workbench pueda entregar ContextPacks mínimos y resolver conflictos de autoridad.
