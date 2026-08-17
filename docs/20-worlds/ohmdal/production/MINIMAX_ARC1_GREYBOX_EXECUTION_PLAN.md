# MiniMax — Plan de ejecución: Ohmdal Arco I HD-2D Greybox

**Estado:** EXECUTION PLAN / no canon narrativo

**Builder objetivo:** MiniMax Code / MiniMax M3

**Scope de implementación obligatorio:** `src/hd2d-ohmdal/`

**Autoridad espacial:** `docs/20-worlds/ohmdal/world/layout/arc1-layout.json`

**Constraints:** `docs/20-worlds/ohmdal/world/layout/arc1-constraints.json`

**Referencias conceptuales:** `docs/20-worlds/ohmdal/world/layout/REFERENCE_PROMPTS.md`

---

## 0. Regla principal

Construir el terreno, arquitectura, interiores, navegación y continuidad espacial del **Arco I de Ohmdal** directamente como experiencia **2.5D / HD-2D**.

No diseñar primero una versión 2D/Phaser para después convertirla.

No trabajar sobre `src/ohmdal-arco1/`, `src/jugar/` ni el runtime Phaser como base de esta tarea.

La implementación válida vive en:

```text
src/hd2d-ohmdal/
```

El objetivo de esta etapa es **greybox de calidad de producción**, no arte final.

---

## 1. Resultado esperado

Al terminar debe existir un Arco I físicamente coherente y recorrible con:

- terreno y desniveles legibles;
- plaza central con escala suficiente para funcionar como hub;
- Portal Ω;
- pedestal / presencia de Ohm;
- Taller de Lumen con acceso exterior e interior;
- Puerta de Ohm hacia el Manantial;
- senderos y conexiones principales;
- Manantial / zona de origen energético;
- Castillo y zonas del arco que correspondan al layout vigente;
- interiores accesibles donde el diseño los requiera;
- colisiones y límites coherentes;
- cámara HD-2D consistente;
- navegación de teclado y touch sin puntos muertos;
- lectura clara de landmarks desde gameplay;
- continuidad espacial entre exterior, puertas, interiores y desniveles.

No se busca todavía texturizado final, foliage final, VFX final, audio final ni assets hero definitivos.

---

## 2. Fuente de verdad espacial

Antes de modificar geometría, leer:

1. `/AGENTS.md`
2. `docs/20-worlds/ohmdal/AGENTS.md`
3. `docs/20-worlds/ohmdal/world/layout/README.md`
4. `docs/20-worlds/ohmdal/world/layout/arc1-layout.json`
5. `docs/20-worlds/ohmdal/world/layout/arc1-constraints.json`
6. documentación estrictamente necesaria del Arco I.

### Jerarquía

`arc1-layout.json` manda sobre posiciones, dimensiones, relaciones y zonas.

Las imágenes conceptuales son **referencia visual**, no coordenadas autoritativas.

Si el runtime existente contradice el layout, corregir el runtime. No deformar el layout para conservar una implementación anterior.

No inventar lore ni texto narrativo para justificar geometría.

---

## 3. Sistema espacial que debe respetarse

Usar una única convención de mundo y mantenerla en todo `src/hd2d-ohmdal/`.

Cada landmark relevante debe poder expresarse mediante datos verificables:

```ts
{
  id,
  position: { x, y, z },
  footprint,
  elevation,
  entrances,
  walkableBounds,
  collisionBounds,
  links
}
```

No dejar posiciones críticas dispersas como magic numbers inconexos.

El renderer puede derivar geometría procedural o modular desde esos datos, pero los datos espaciales son la autoridad.

---

## 4. Orden de implementación

### Fase A — Auditoría y baseline

- ejecutar build/tests existentes;
- abrir el runtime HD-2D actual;
- registrar qué partes ya consumen layout y cuáles todavía usan coordenadas propias;
- identificar dead geometry, duplicaciones y offsets arbitrarios;
- no borrar funcionalidad jugable útil sin reemplazo.

**Salida:** breve nota en el commit o `progress.md` con baseline y defectos principales.

### Fase B — Cuenca / Plaza como hub real

La plaza actual no debe sentirse como una habitación pequeña con objetos amontonados.

Objetivos:

- ampliar la lectura espacial del hub sin romper las proporciones del layout;
- generar espacio negativo útil entre landmarks;
- asegurar líneas de visión hacia Portal, Taller, Puerta de Ohm y Ohm;
- evitar que edificios parezcan props pegados a una plaza;
- crear bordes, accesos y transiciones que hagan sentir que la plaza pertenece a una cuenca mayor;
- asegurar suficiente superficie jugable para NPCs, eventos y evolución futura del mundo.

Validar siempre desde cámara real de gameplay, no sólo desde vista cenital.

### Fase C — Taller de Lumen

- exterior con volumen arquitectónico legible;
- entrada inequívoca;
- interior accesible;
- transición exterior/interior sin teletransporte visual absurdo;
- espacio suficiente para puzzle, bancos, NPC y circulación;
- oclusión/cámara resuelta para paredes y techo.

### Fase D — Puerta de Ohm + sendero al Manantial

- convertir la Puerta en landmark de escala adecuada;
- definir aproximación, umbral y salida;
- sendero con dirección visual clara;
- desniveles, muros o terreno que expliquen el recorrido;
- ninguna conexión debe parecer un pasillo flotante o una isla aislada.

### Fase E — Manantial

- área diferenciada topográfica y espacialmente;
- origen energético comprensible por composición del espacio;
- llegada desde la Puerta coherente con orientación y elevación;
- margen para gameplay y eventos posteriores.

### Fase F — resto del Arco I

Completar todas las zonas incluidas en `arc1-layout.json` siguiendo la misma disciplina:

- Castillo;
- canales/distribución;
- Forja / Terrazas si están dentro del scope actual del layout;
- Faro / Lago si están dentro del scope actual del layout;
- conexiones intermedias;
- interiores requeridos.

No agregar regiones no presentes en la autoridad documental.

---

## 5. Navegación y escala

El greybox debe soportar una persona jugando, no sólo una captura bonita.

Para cada tramo verificar:

- anchura mínima de paso;
- giros y esquinas sin enganches;
- ausencia de escalones imposibles;
- entradas visibles;
- ninguna colisión invisible injustificada;
- rutas alternativas sólo si el diseño las permite;
- cámara no atraviesa paredes;
- sprite nunca desaparece detrás de una masa opaca sin sistema de oclusión;
- touch target razonable en mobile;
- tiempo de recorrido entre landmarks coherente con un hub de RPG, evitando tanto vacío como congestión.

---

## 6. Cámara HD-2D

La cámara es parte del level design.

Mantener:

- perspectiva HD-2D/2.5D consistente;
- sprites 2D dentro de geometría 3D real;
- profundidad y elevación reales;
- sombras/iluminación sólo al nivel necesario para leer el greybox;
- framing que permita anticipar destinos;
- oclusión controlada para interiores y fachadas.

Agregar o conservar un **modo debug cenital** para inspección espacial, pero nunca optimizar el mapa sólo para esa vista.

---

## 7. Reglas de arte durante greybox

Permitido:

- materiales planos;
- colores de debug por función;
- primitivas y módulos simples;
- placeholders limpios;
- luces básicas para legibilidad.

No gastar tiempo en:

- texturas finales;
- detalles ornamentales;
- props decorativos masivos;
- foliage final;
- partículas finales;
- cinematic polish;
- assets generados por IA para esconder problemas de layout.

Una geometría mediocre con arte bonito sigue siendo FAIL.

---

## 8. Gauntlet loop obligatorio

Trabajar en loops acotados, una zona o problema espacial por vez.

```text
INSPECT
→ IMPLEMENT
→ BUILD
→ TEST
→ PLAY
→ REVIEW DESDE CÁMARA REAL
→ CORREGIR
→ REPLAY
```

Normal: 1–3 repair loops por tarea.

Hard cap: 5. Si el mismo defecto sigue vivo, detener parches locales y cuestionar la representación, escala o constraint que lo origina.

No declarar PASS sólo porque compila.

---

## 9. Gates por zona

Una zona sólo puede considerarse terminada cuando:

- [ ] respeta `arc1-layout.json`;
- [ ] pasa constraints automatizables;
- [ ] es recorrible de extremo a extremo;
- [ ] no tiene bloqueos o huecos de colisión;
- [ ] entradas/interiores funcionan;
- [ ] el landmark principal se reconoce desde gameplay;
- [ ] la cámara mantiene al jugador y el destino legibles;
- [ ] el espacio no se siente ni comprimido ni artificialmente vacío;
- [ ] funciona al menos en viewport desktop y mobile objetivo;
- [ ] build/tests siguen verdes.

---

## 10. QA visual de la plaza

La plaza merece un gate específico porque es el hub del primer arco.

Revisar desde al menos:

1. spawn/Portal hacia Ohm;
2. centro de plaza hacia Taller;
3. centro de plaza hacia Puerta de Ohm;
4. llegada desde Taller;
5. llegada desde Puerta;
6. vista cenital debug.

FAIL si:

- todos los landmarks entran comprimidos en el mismo plano;
- los recorridos son sólo unos pocos pasos;
- no existe espacio para NPCs/eventos futuros;
- la cámara no puede componer dos o más landmarks sin clipping absurdo;
- Taller, Portal o Puerta se perciben como decoraciones y no lugares;
- la plaza parece una arena aislada en vez de parte de Ohmdal.

---

## 11. Integración técnica

Preferir módulos pequeños y data-driven.

Evitar reescribir el engine completo si no es necesario.

No introducir otra librería/engine.

No actualizar Three.js, Vite o dependencias incidentalmente.

Conservar sprites de personajes existentes salvo que estén técnicamente rotos.

La tarea es mundo/terreno/arquitectura/navegación, no rediseño de personajes.

---

## 12. Evidencia requerida

Por cada milestone significativo dejar:

- archivos modificados;
- qué constraint/layout se implementó;
- resultado de build/tests;
- qué recorrido fue jugado;
- defectos encontrados y reparados;
- screenshots sólo como evidencia secundaria.

Cuando sea viable, sumar validaciones automatizadas para:

- overlaps imposibles;
- conexiones rotas;
- entrances fuera de footprint;
- landmarks fuera de bounds;
- dimensiones mínimas de rutas;
- referencias a IDs inexistentes.

---

## 13. Secuencia de commits sugerida

```text
feat(ohmdal): normalize HD-2D Arc I spatial data consumption
feat(ohmdal): rebuild Cuenca and Plaza greybox scale
feat(ohmdal): rebuild Lumen workshop exterior and interior
feat(ohmdal): rebuild Ohm Gate and spring route
feat(ohmdal): rebuild Manantial greybox
feat(ohmdal): complete remaining Arc I greybox regions
fix(ohmdal): Arc I navigation camera and collision pass
test(ohmdal): validate Arc I spatial constraints
```

Commits pequeños y reversibles. No mezclar arte final con arquitectura.

---

## 14. Definition of Done de esta misión

La misión termina cuando el **Arco I completo puede recorrerse como un lugar coherente** dentro de `src/hd2d-ohmdal/` y su estructura espacial ya no depende de intuición visual o coordenadas arbitrarias, sino del contrato de layout del repo.

El resultado debe sentirse como el greybox de un RPG HD-2D serio: escala, composición, navegación, interiores, landmarks y continuidad listos para recibir arte posterior.

**No terminar arte final. No volver a Phaser. No convertir un prototipo 2D. No inventar canon.**
