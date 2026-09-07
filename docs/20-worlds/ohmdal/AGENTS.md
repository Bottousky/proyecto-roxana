# Ohmdal — Arco I: La Luz

La prioridad es una aventura hermosa, inmersiva y narrativa donde se aprende
 electricidad y electrónica sin sentir una clase interrumpiendo el juego.
El runtime es `src/experiences/ohmdal-playcanvas/`, ruta `/ohmdal-playcanvas`.
PlayCanvas Engine v2 + TypeScript + Vite. Las etapas A/B antiguas son historial.

## Diseño que debe sobrevivir a cada mejora

- Verbo central: **CONECTAR**. Primero observar luz, sonido, movimiento o calor;
  después intervenir y comprender la relación; la Bitácora formaliza lo vivido.
- Los puzzles son problemas del mundo con personas y consecuencias. Interacción
  directa, instrumento e inspección cercana operan sobre el mismo modelo real.
  No confundas estas capas con las familias de problemas eléctricos.
- Una falla enseña algo observable. Evita combinaciones arbitrarias, respuestas
  de opción múltiple y fórmulas usadas como cerraduras. Acepta otras soluciones
  cuando el modelo eléctrico lo permita.
- Las acciones deben reconocerse por forma, posición, material y respuesta,
  además del color. Las herramientas se presentan antes de exigir su uso.
- Una reparación transforma el entorno y la vida de sus habitantes. Da espacio
  para mirar, explorar y conectar pistas; no resuelvas todo mediante diálogo.
- Desarrolla escenas y diálogos coherentes con los personajes y el arco existentes.
  Resuelve las contradicciones del canon antes de introducir antecedentes nuevos.

## Estado y criterio de calidad

El recorrido implementado une Plaza/Taller, Manantial, Castillo, Forja, Terrazas,
Lago y Faro. Tiene guardado, controles desktop/touch, puzzles regionales, personajes,
audio espacial y assets propios. Requiere más identidad artística, ritmo narrativo,
consecuencias ambientales y optimización; no está certificado como AAA.

Valida instalaciones apagadas y restauradas, navegación, legibilidad y retorno.
Usa `npm run playtest:ohmdal-golden-path -- --gpu --reload-checkpoints`, los scripts
de `scripts/gameplay/` aplicables y `npm run visual:ohmdal-plaza:fast`.
No declares rendimiento sin medirlo ni calidad final sólo por compilar.

Consulta únicamente la fuente relevante al cambio:

- [Puzzles](../../guia-puzzles.md), [interacción](production/OHMDAL_INTERACTION_POLICY.md)
  y [modelo eléctrico](gameplay/ohmdal-electrical-system_v1.md).
- [Arco I](content/ohmdal-arc-01_v1.md) y [narrativa](narrative/ohmdal-narrative-bible_v1.md).
- [Identidad visual](../../arco1/IDENTITY.md), [materiales](production/OHMDAL_VISUAL_MATERIAL_BIBLE.md)
  y [navegación](production/OHMDAL_NAVIGATION_COLLISION_CONTRACT.md).

Actualiza estas fuentes si cambia una decisión útil. Evita otra cadena de planes,
tasks y reviews para documentar la misma iteración.
