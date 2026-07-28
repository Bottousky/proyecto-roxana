# Proyecto Roxana — Ecosistema 3D y setup operativo para Codex

**Guía de arquitectura, skills, MCP, generación de assets, control visual, rendimiento y productos físicos**  
**Versión:** 1.0 — 28 de julio de 2026  
**Repositorio objetivo:** `Bottousky/proyecto-roxana`

---

## Cómo usar este documento

Este documento no es un pedido para que Codex rehaga el juego. Es el contrato para que deje preparado un **ecosistema de producción 3D reproducible**, sin romper el Arco I de Ohmdal ni convertir el repositorio en una acumulación de pruebas incompatibles.

El orden correcto es:

1. Entregar a Codex el **Prompt de setup** del Apéndice D —o el archivo separado incluido con esta guía—.
2. Hacer que Codex audite el repositorio y cree una rama corta.
3. Instalar y verificar skills/MCP.
4. Crear reglas, manifiestos, scripts y gates.
5. Ejecutar una prueba mínima del pipeline, no una reconstrucción artística completa.
6. Recién después comenzar la vertical slice del hall.

> **Regla principal:** compilar no equivale a terminar. Para el trabajo visual, una tarea sólo termina con evidencia: captura, comparación, métricas y lista de diferencias pendientes.

---

# 1. Decisión ejecutiva

## 1.1 Stack que se conserva

Proyecto Roxana ya está construido sobre **TypeScript + Vite**, con **Phaser 4** para la experiencia cenital de Ohmdal y **Three.js** incorporado para el spike del Instituto. El shell soporta runtimes de experiencia cargados bajo demanda. Por lo tanto:

- **No migrar ahora a React, React Three Fiber, Next.js, Unity o Godot.**
- **No reescribir Ohmdal.**
- **No eliminar el prólogo cenital actual.**
- **Conservar el gate `?school3d=1`** hasta que la variante 3D supere los criterios visuales y de rendimiento.
- Extender la base actual con módulos y herramientas, no reemplazarla por una demo aislada.

## 1.2 Pipeline oficial propuesto

```text
ChatGPT / ImageGen
    referencias maestras, vistas ortográficas, sprites, UI
            │
            ├──────────────┐
            ▼              ▼
img2threejs / Codex       Meshy API / MCP
arquitectura procedural   props orgánicos, estatuas,
hard-surface, mecanismos  personajes, assets rápidos
            │              │
            └──────┬───────┘
                   ▼
      Roxana Asset Pipeline
  escala · pivote · collider · LOD
  compresión · licencia · catálogo
                   │
                   ▼
        Three.js dentro del shell
  Instituto / mundos 3D / 2.5D
                   │
                   ▼
 Playwright + crítico visual + métricas
                   │
                   ▼
        producto web aprobado

Rama física paralela:
modelo maestro → Meshy decorativo / CAD funcional → STL/3MF → slicer → prototipo
```

## 1.3 Reparto de responsabilidades

| Necesidad | Herramienta principal | Motivo |
|---|---|---|
| Arquitectura, escaleras, arcos, barandas | Three.js procedural / `img2threejs` | Escala exacta, piezas editables y reutilizables |
| Máquinas, mecanismos y puzzles físicos | Procedural + modelos matemáticos TypeScript | El aspecto y el comportamiento deben compartir parámetros |
| Estatua de Roxana, personajes, criaturas | Meshy | Resuelve rápido formas orgánicas y escultóricas |
| Prop protagonista irregular | Meshy, con referencia multivista | Más fidelidad que una primitiva improvisada |
| Libro, pupitre, lámpara, columna modular | Comparativa: procedural o Meshy | Elegir por coste, control y reutilización |
| NPC isométrico | Sprite 2D animado o GLB liviano | Evita rigging cuando la cámara controlada no lo necesita |
| Terreno, agua, vegetación repetida | Procedural + instancing | Control de mundo y rendimiento |
| Corrección de malla compleja | Blender automatizado/MCP, sólo cuando sea necesario | Herramienta de rescate; no requisito diario para el usuario |
| Pieza física funcional | OpenSCAD/FreeCAD | Tolerancias, medidas y encastres deterministas |
| Pieza física decorativa | Meshy + reparación de impresión | Prototipado rápido y variantes visuales |

---

# 2. Estado real del repositorio

Codex debe comenzar leyendo, no suponiendo. La base actual contiene:

- `package.json`: Vite, TypeScript, Phaser 4 y Three.js.
- `src/experiences`: manifiestos, registro y runtimes.
- `src/experiences/instituto`: spike Three.js.
- `src/jugar`: Ohmdal cenital estable.
- `docs/plan-plataforma-cinco-juegos.md`: shell persistente y runtimes diferentes.
- `docs/spec-p3-escuela-3d.md`: greybox deliberado del Instituto.
- scripts existentes de `test` y `verify`.

El documento P3 actual especifica cajas y materiales Lambert porque era una prueba técnica. **No debe tratarse como dirección artística definitiva.** La evolución consiste en preservar el runtime, el modelo de movimiento, las interacciones y la transición; luego reemplazar la capa visual por un pipeline de producción.

## 2.1 Restricciones de integración

1. `main` debe seguir desplegable.
2. El setup se hace en `codex/setup-ecosistema-3d`.
3. Los cambios de setup no deben alterar gameplay.
4. Los assets fuente pesados no entran en `src` ni en el bundle.
5. El runtime final consume únicamente variantes optimizadas.
6. Cada experiencia se carga bajo demanda.
7. La Bitácora, progreso, diálogo y narrativa continúan siendo servicios compartidos.
8. Los modelos pedagógicos permanecen TypeScript puro, separados de la representación 3D.

---

# 3. Ecosistema de Codex

Codex debe operar con cuatro capas complementarias. No deben mezclarse en un prompt gigante.

## 3.1 `AGENTS.md`: constitución del repositorio

Codex lee `AGENTS.md` antes de trabajar. Este archivo debe contener normas durables:

- arquitectura que no puede romperse;
- comandos de validación;
- política de dependencias;
- definición de terminado;
- gates visuales y de rendimiento;
- tratamiento de secretos y assets;
- prioridad entre skills.

`AGENTS.md` no debe contener tutoriales largos. Las instrucciones específicas viven en skills y documentos.

## 3.2 Skills: procedimientos reutilizables

Las skills se guardan en `.agents/skills/<nombre>/SKILL.md`, ruta de skills de repositorio reconocida por Codex.

### Skill propia obligatoria

`roxana-3d-director` será el orquestador del proyecto. Debe decidir:

- si un asset se resuelve proceduralmente, con Meshy, como sprite o con CAD;
- qué skills especializadas cargar;
- qué evidencia pedir antes de aprobar;
- cuándo frenar por coste, falta de referencia o rendimiento;
- cómo registrar el resultado en el catálogo.

### Skills externas recomendadas

**Núcleo inicial — instalar sólo éstas:**

1. OpenAI `develop-web-game`: bucle de juego web, registro de progreso y pruebas de navegador.
2. `img2threejs`: reconstrucción procedural con stages y quality gates.
3. MengTo `build-hybrid-game-assets`.
4. MengTo `author-game-levels`.
5. MengTo `build-game-camera-controls`.
6. MengTo `optimize-threejs-games`.
7. MengTo `test-playable-web-games`.
8. Meshy `meshy-3d-generation`.
9. Meshy `meshy-3d-printing`, instalado pero invocado sólo en la rama de producto físico.

**No instalar inicialmente decenas de skills solapadas.** Codex dispone de un presupuesto para listar skills; demasiadas descripciones pueden diluir el enrutamiento. Se agregan skills sólo cuando aparece una necesidad real.

## 3.3 MCP: herramientas externas

### Obligatorios

- **Playwright MCP:** navegador controlable para abrir la app, interactuar, capturar y revisar.
- **Meshy MCP:** generación, remesh, retexture, rigging, animación, descarga, balance y utilidades de impresión.

### Opcionales posteriores

- **Blender MCP:** reparación específica, baking, separación de pivotes, LOD o exportaciones complejas.
- MCP de documentación técnica, cuando el agente necesite documentación de librerías actualizada.

## 3.4 Subagentes

Cuando la superficie de Codex lo permita, el director puede delegar en agentes con responsabilidades separadas:

| Agente | Responsabilidad | No puede hacer |
|---|---|---|
| Director técnico | Arquitectura, integración, contratos | Aprobar calidad visual solo |
| Director visual | Comparación de renders, escala, materiales | Cambiar gameplay sin autorización |
| Productor de assets | Meshy/img2threejs, manifiestos, variantes | Gastar créditos sin política |
| Performance/QA | FPS, memoria, draw calls, pruebas | Reducir calidad sin presentar evidencia |
| Producto físico | STL/3MF, CAD, printability | Convertir una malla decorativa en pieza mecánica sin ingeniería |

---

# 4. Setup exacto que Codex debe dejar

## 4.1 Preflight

Codex debe ejecutar y guardar el resultado en `docs/3d/SETUP_REPORT.md`:

```bash
git status --short
git branch --show-current
node --version
npm --version
npx --version
python3 --version
codex --version || true
npm install
npm run build
npm test
npm run verify
```

Si el baseline falla, debe documentar la falla antes de tocar el setup. No debe ocultarla con cambios no relacionados.

## 4.2 Rama

```bash
git switch -c codex/setup-ecosistema-3d
```

Si la rama existe, Codex debe inspeccionarla y decidir si continuar o crear una variante con fecha; nunca forzar ni borrar trabajo.

## 4.3 Estructura a crear

```text
AGENTS.md
.env.example
.codex/
  config.toml.example
.agents/
  skills/
    roxana-3d-director/
      SKILL.md
      references/
        asset-routing.md
        quality-gates.md
        performance-budgets.md
      scripts/
        validate-manifest.mjs

docs/3d/
  README.md
  ECOSYSTEM.md
  VISUAL_BIBLE.md
  SCALE_BIBLE.md
  BUDGETS.md
  ASSET_PIPELINE.md
  MESHY_POLICY.md
  QA_PROTOCOL.md
  SETUP_REPORT.md
  STATE.md
  TOOLCHAIN_LOCK.md

assets/
  manifests/
    assets.schema.json
    assets.example.json
  source/
    instituto/
    shared/
  runtime/
    instituto/
      desktop/
      mobile/
    shared/
      desktop/
      mobile/
  references/
    instituto/
    shared/

scripts/3d/
  optimize-glb.mjs
  validate-glb.mjs
  validate-asset-manifests.mjs
  generate-asset-index.mjs
  report-runtime-budget.mjs

tests/visual/
  README.md
  fixtures/
  baselines/
  current/
  diffs/
```

### Nota sobre versionado de assets

- `assets/source` puede incluir archivos grandes únicamente si la política de Git/LFS queda definida.
- La primera versión del setup puede dejar `assets/source` ignorado y versionar sólo referencias/manifiestos.
- `assets/runtime` contiene archivos que realmente consume la aplicación y sí debe tener presupuesto.
- No almacenar resultados de generación sin prompt, licencia, fecha y origen.

## 4.4 Configuración de MCP

Codex debe crear `.codex/config.toml.example`, nunca una configuración que incruste una clave real:

```toml
[mcp_servers.playwright]
command = "npx"
args = ["-y", "@playwright/mcp@latest"]
startup_timeout_sec = 30
tool_timeout_sec = 120

[mcp_servers.meshy]
command = "npx"
args = ["-y", "@meshy-ai/meshy-mcp-server"]
env_vars = ["MESHY_API_KEY"]
startup_timeout_sec = 30
tool_timeout_sec = 300
default_tools_approval_mode = "writes"
```

Después debe explicar que el usuario copie o fusione este bloque en la configuración activa de Codex, o utilizar la CLI:

```bash
codex mcp add playwright -- npx -y @playwright/mcp@latest
# Meshy se configura preservando MESHY_API_KEY en el entorno;
# no escribir la clave en archivos versionados ni en documentación.
codex mcp list
```

Para Meshy, la configuración preferida es `env_vars = ["MESHY_API_KEY"]`, con la variable disponible en el entorno local. `.env.example` debe contener solamente:

```dotenv
MESHY_API_KEY=
```

La app del navegador nunca debe recibir la clave. Meshy se llama desde Codex, scripts locales o backend futuro; no desde código cliente incluido por Vite.

## 4.5 Instalación de skills

Codex debe preferir el instalador de skills y verificar la ubicación final en `.agents/skills` o `$HOME/.agents/skills`.

### Comandos conceptuales dentro de Codex

```text
$skill-installer develop-web-game
$skill-installer install https://github.com/img2threejs/img2threejs
$skill-installer install https://github.com/MengTo/Skills/tree/main/agent-skills/game-development/build-hybrid-game-assets
$skill-installer install https://github.com/MengTo/Skills/tree/main/agent-skills/game-development/author-game-levels
$skill-installer install https://github.com/MengTo/Skills/tree/main/agent-skills/game-development/build-game-camera-controls
$skill-installer install https://github.com/MengTo/Skills/tree/main/agent-skills/game-development/optimize-threejs-games
$skill-installer install https://github.com/MengTo/Skills/tree/main/agent-skills/game-development/test-playable-web-games
$skill-installer install https://github.com/meshy-dev/meshy-3d-agent/tree/main/skills/meshy-3d-generation
$skill-installer install https://github.com/meshy-dev/meshy-3d-agent/tree/main/skills/meshy-3d-printing
```

### Fallback reproducible

Si el instalador no admite una fuente, Codex debe:

1. clonar la fuente en una carpeta temporal;
2. copiar únicamente la carpeta completa que contiene `SKILL.md` a `.agents/skills/<nombre>`;
3. conservar `LICENSE`/atribución correspondiente;
4. registrar repositorio, commit y fecha en `docs/3d/TOOLCHAIN_LOCK.md`;
5. comprobar que Codex descubre la skill con `/skills` o una sesión reiniciada.

No copiar un `SKILL.md` aislado cuando depende de `scripts`, `references`, `assets`, `forge` o `grimoire`.

---

# 5. Orden de precedencia y enrutamiento

Cuando varias skills parecen aplicables, Codex seguirá este orden:

1. `AGENTS.md`: restricciones del proyecto.
2. `roxana-3d-director`: decide el pipeline.
3. Skill de gameplay/nivel/cámara: define el sistema.
4. `img2threejs` o Meshy: produce el asset.
5. `optimize-threejs-games`: optimiza después de validar la apariencia.
6. `test-playable-web-games` / Playwright: reúne evidencia.

## 5.1 Árbol de decisión de assets

```text
¿La pieza necesita medidas exactas, pivotes o sockets?
├─ Sí → procedural / img2threejs
│       └─ ¿es un mecanismo físico funcional imprimible?
│          ├─ Sí → CAD paramétrico
│          └─ No → Three.js procedural
└─ No
   └─ ¿es orgánica, escultórica o irregular?
      ├─ Sí → Meshy
      └─ No
         └─ ¿aparece muchas veces?
            ├─ Sí → módulo procedural / instancing
            └─ No → comparar coste Meshy vs procedural

¿La cámara es fija/isométrica y el personaje no se inspecciona libremente?
├─ Sí → considerar sprite 2D animado
└─ No → GLB riggeado, con LOD y animación
```

## 5.2 Regla contra el blockout eterno

Cajas simples están permitidas sólo en la etapa `blockout`. Para declarar `visual-ready`, cada elemento identitario debe mapear a una de estas cosas:

- geometría con forma y biseles;
- material con variación y mapas adecuados;
- detalle procedural;
- asset GLB aprobado;
- sprite aprobado;
- decisión explícita de omitirlo por cámara/rendimiento.

---

# 6. Manifiesto y ciclo de vida de assets

Todo asset debe tener un registro. El GLB suelto no es una unidad de producción.

## 6.1 Esquema mínimo

```json
{
  "id": "rx_instituto_estatua_roxana_001",
  "displayName": "Estatua de Roxana",
  "world": "instituto",
  "category": "hero-prop",
  "sourceMethod": "meshy-multi-image",
  "status": "approved-runtime",
  "references": [
    "assets/references/instituto/estatua-roxana-front.png",
    "assets/references/instituto/estatua-roxana-side.png"
  ],
  "generation": {
    "provider": "meshy",
    "taskId": "",
    "promptFile": "assets/manifests/prompts/estatua-roxana.md",
    "creditsSpent": 0,
    "generatedAt": "2026-07-28"
  },
  "license": {
    "owner": "Proyecto Roxana",
    "referenceRightsVerified": true,
    "notes": "Referencia original generada para el proyecto"
  },
  "scale": {
    "unit": "meter",
    "height": 2.4,
    "humanRatio": 1.4
  },
  "pivot": "bottom-center",
  "collider": {
    "type": "cylinder",
    "radius": 0.65,
    "height": 2.7
  },
  "sockets": ["plaque", "interaction_anchor"],
  "runtime": {
    "desktop": {
      "path": "assets/runtime/instituto/desktop/estatua-roxana.glb",
      "maxTriangles": 18000,
      "maxTexture": 2048
    },
    "mobile": {
      "path": "assets/runtime/instituto/mobile/estatua-roxana.glb",
      "maxTriangles": 8000,
      "maxTexture": 1024
    }
  },
  "print": {
    "enabled": true,
    "type": "decorative",
    "path": "",
    "scaleMm": 180
  }
}
```

## 6.2 Estados permitidos

```text
planned
reference-ready
generating
review-required
approved-master
optimized-runtime
integrated
qa-approved
print-prototype
rejected
archived
```

## 6.3 Ciclo obligatorio

1. **Definir función:** para qué existe el asset y desde qué cámara se ve.
2. **Definir presupuesto:** triángulos, texturas, materiales, animación y distancia.
3. **Crear referencia:** aislada, consistente y con vistas suficientes.
4. **Generar:** máximo de variantes según política.
5. **Revisar silueta antes de textura.**
6. **Aprobar master:** humano o gate explícito.
7. **Crear variantes desktop/mobile.**
8. **Corregir escala, pivote y orientación.**
9. **Asignar collider simple, nunca la malla visual completa por defecto.**
10. **Optimizar y validar GLB.**
11. **Integrar en la cámara real.**
12. **Capturar y medir.**
13. **Registrar licencia, coste y versión.**

---

# 7. Política Meshy

## 7.1 Usos correctos

Meshy será la fábrica rápida para:

- estatua de Roxana;
- personajes y criaturas;
- props hero irregulares;
- rocas, raíces y decoración orgánica;
- máquinas con silueta compleja cuando no requieren despiece funcional;
- prototipos decorativos para impresión.

## 7.2 Usos incorrectos

No delegar ciegamente a Meshy:

- pisos y paredes modulares;
- plataformas de gameplay;
- rampas y colliders;
- engranajes funcionales;
- encastres, alojamientos y tolerancias;
- escenarios completos como una única malla;
- objetos que deben abrirse o rotar sin haber definido las partes.

## 7.3 Política de créditos

```yaml
meshy_policy:
  max_preview_variants_per_asset: 3
  texture_only_after_shape_approval: true
  human_approval_required_for_hero_assets: true
  check_balance_before_batch: true
  stop_batch_below_credit_reserve: true
  monthly_credit_reserve_percent: 30
  background_prop_credit_cap: 40
  hero_prop_credit_cap: 120
  retry_same_prompt_limit: 1
```

Codex debe consultar el balance antes de producir un lote. Si la herramienta no puede devolver el balance, frena y reporta. No debe repetir una generación idéntica sólo porque “no quedó perfecta”; primero debe cambiar referencia, prompt o método.

## 7.4 Automatización segura

El pipeline automático puede:

```text
leer manifiesto
→ verificar referencia y derechos
→ consultar balance
→ generar preview
→ esperar/pollear task
→ descargar preview/renders
→ marcar review-required
→ después de aprobación: refinar/texturizar
→ remesh a variante runtime
→ descargar GLB
→ ejecutar optimización local
→ registrar task id, coste y hashes
```

No puede aprobar por sí solo un hero asset ni publicar un lote sin capturas.

## 7.5 Impresión 3D

Meshy sirve para:

- miniaturas y figuras;
- bustos;
- edificios/dioramas;
- carcasa decorativa;
- piezas de escenografía;
- modelos multicolor 3MF.

Para un kit STEM funcional, separar:

```text
capa narrativa/estética (Meshy)
+
capa mecánica/eléctrica (OpenSCAD o FreeCAD)
+
lista de materiales e instrucciones
+
pruebas físicas
```

Una malla “imprimible” no garantiza resistencia, tolerancias, seguridad ni funcionamiento pedagógico.

---

# 8. Política `img2threejs`

## 8.1 Para qué se usa

- arquitectura recortada y controlada;
- muebles hard-surface;
- portales, máquinas y reliquias;
- props con despiece, pivotes o sockets;
- dioramas acotados con cámara definida;
- objetos que deban permanecer editables como código.

## 8.2 Para qué no se usa de una sola vez

- toda la academia con seis ambientes y cientos de objetos;
- multitudes o escenas con oclusión fuerte;
- una imagen conceptual sin vistas ni escala;
- formas orgánicas blandas donde Meshy sea claramente superior.

## 8.3 Pipeline obligatorio

```text
suitability gate
→ pre-spec assessment
→ detail inventory
→ ObjectSculptSpec
→ strict validation
→ blockout
→ structure
→ form
→ material
→ surface detail
→ lighting
→ interaction hierarchy
→ optimization
→ render/reference comparison en cada gate
```

Codex no debe considerar que la skill se ejecutó correctamente si sólo creó un componente `.ts` o `.tsx`. Deben existir los artefactos de assessment, spec, revisión y comparación requeridos por la skill.

## 8.4 Estrategia para el Instituto

No reconstruir la imagen maestra completa. Dividirla:

1. hall arquitectónico;
2. escalera y fachada de Dirección;
3. módulo de pared/arco/columna;
4. preceptoría;
5. módulo de aula;
6. anfiteatro;
7. portal de Electrónica;
8. mobiliario repetible.

La estatua y personajes pueden llegar de Meshy. La composición final la hace Three.js dentro del runtime.

---

# 9. Roxana World Builder

El objetivo a medio plazo no es programar cada mundo como una escena monolítica, sino crear herramientas de autoría basadas en datos.

## 9.1 Alcance de la primera versión

- importar módulos procedurales y GLB;
- colocar, mover, rotar y escalar;
- snap a grilla y unidades métricas;
- asignar collider;
- definir zonas caminables;
- colocar hotspots, NPCs, portales y eventos;
- configurar cámara: isométrica, cenital, lateral 2.5D;
- definir iluminación por preset;
- guardar mapa como JSON;
- cargar sólo el mapa/zona activa;
- ejecutar vista de rendimiento.

## 9.2 Datos, no código repetido

```json
{
  "id": "instituto-hall-v1",
  "runtime": "three-webgl",
  "cameraPreset": "institute-isometric",
  "environmentPreset": "warm-abandoned-academy",
  "objects": [
    {
      "assetId": "rx_instituto_estatua_roxana_001",
      "position": [0, 0, 0],
      "rotation": [0, 0, 0],
      "scale": [1, 1, 1]
    }
  ],
  "interactions": [
    {
      "id": "statue_plaque",
      "anchor": "rx_instituto_estatua_roxana_001:interaction_anchor",
      "action": "open-dialogue"
    }
  ]
}
```

## 9.3 Aplicación por mundo

- **Instituto:** diorama/espacio 3D controlado, arquitectura modular.
- **Ohmdal:** puede conservar Phaser inicialmente; sus assets 3D se prueban en una rama/laboratorio antes de migrar la gramática.
- **Physica:** plataforma 2.5D; modelos visuales 3D, colisiones simples y fenómenos TypeScript puros.
- **Bitland:** cenital/dataflow; 3D sólo cuando ayude a comprender el sistema.
- **Arithmos:** visualización espacial y DOM narrativo, no 3D por obligación.

---

# 10. Personajes: 3D, sprites o híbrido

## 10.1 Sprite 2D dentro de mundo 3D

Elegir sprites cuando:

- la cámara es isométrica/cenital;
- el jugador no rodea al personaje libremente;
- la identidad ilustrada importa más que el volumen;
- se necesita producir muchas expresiones y animaciones rápido;
- el presupuesto móvil es prioritario.

Un sprite necesita:

- atlas o secuencia consistente;
- pivote en pies;
- orientación por octantes o billboard controlado;
- sombra falsa/decals;
- orden de render y profundidad probados;
- animaciones deterministas.

## 10.2 GLB riggeado

Elegir 3D cuando:

- la cámara lo observa desde muchos ángulos;
- existe interacción física o equipamiento;
- hay cinemáticas o poses complejas;
- la silueta cambia con el movimiento;
- el personaje es un producto físico potencial.

Meshy puede producir el master; el runtime necesita variantes, animaciones limitadas, LOD y colliders simples.

## 10.3 Híbrido recomendado inicialmente

- Protagonista: comparar sprite de alta identidad con GLB estilizado en la cámara final.
- NPCs secundarios: sprites.
- Estatua: GLB.
- Criaturas hero: GLB.
- Multitudes y fondo: sprites o impostores.

---

# 11. Biblia de escala

La escala humana es la unidad de verdad. Codex no debe ajustar “a ojo” cada escena.

## 11.1 Convención

- Unidades Three.js: **metros**.
- Persona adulta base: **1,72 m**.
- Origen de personajes y props apoyados: suelo, centro del footprint.
- Eje vertical: Y.
- Frente de asset: documentado; preferencia +Z o convención que adopte el proyecto, nunca mezclada.

## 11.2 Ratios iniciales del Instituto

| Elemento | Medida guía |
|---|---:|
| Persona adulta | 1,72 m |
| Puerta interior | 2,20–2,40 m |
| Baranda | 1,00–1,10 m |
| Escritorio | 0,74–0,78 m |
| Mesada de laboratorio | 0,88–0,95 m |
| Biblioteca | 2,10–2,60 m |
| Estatua de Roxana sin pedestal | 2,3–2,6 m |
| Pedestal | 0,8–1,1 m |
| Total estatua + pedestal | 3,2–3,6 m |
| Contrahuella de escalera | 0,16–0,18 m |
| Huella | 0,28–0,32 m |
| Altura visible entre niveles | 3,4–4,2 m |

Estas cifras son una guía artística/arquitectónica. La aprobación final se hace con un maniquí de escala visible en el modo debug.

## 11.3 Herramientas de debug

El setup debe dejar un panel o helpers activables por query/env:

- maniquí humano 1,72 m;
- grilla métrica;
- bounding boxes;
- colliders;
- pivotes y sockets;
- nombre de asset bajo cursor;
- triángulos, draw calls, texturas y FPS;
- cámara y coordenadas.

---

# 12. Render, iluminación y materiales

## 12.1 Calidad no equivale a polígonos

La escena debe priorizar:

1. composición y cámara;
2. escala y silueta;
3. materiales distinguibles;
4. iluminación y sombras de contacto;
5. densidad de detalle por jerarquía;
6. animación ambiental;
7. postproceso moderado.

## 12.2 Preset del Instituto

- luz ambiental baja;
- una luz direccional principal;
- sombras sólo donde aportan;
- luces emisivas cálidas en lámparas;
- AO/lightmap o solución equivalente para estáticos;
- tone mapping coherente;
- niebla muy sutil cuando ayude a profundidad;
- bloom limitado a emisivos, no a toda la escena;
- materiales con variación de roughness, no colores planos.

## 12.3 Materiales compartidos

Crear una biblioteca de materiales del universo:

```text
roxana-stone-warm
roxana-stone-pale
roxana-wood-dark
roxana-wood-worn
roxana-copper-aged
roxana-brass-polished
roxana-marble-statue
roxana-paper-bitacora
roxana-glass-dusty
ohmdal-copper-conductor
physica-steel-lab
```

Cada material debe tener versión runtime y una regla de escala UV. Reducir materiales únicos y atlas cuando sea posible.

---

# 13. Rendimiento y presupuesto web

Los números son objetivos iniciales, no verdades universales. Codex debe medir en dispositivos reales antes de afirmar que algo “anda bien”.

## 13.1 Objetivos

| Métrica | Móvil objetivo | Escritorio objetivo |
|---|---:|---:|
| FPS sostenido | 45–60; piso 30 | 60 |
| Pixel ratio | máximo 1,5 | máximo 2 |
| Draw calls visibles | < 150 | < 250 |
| Triángulos visibles | 150k–300k | 400k–700k |
| Textura prop común | 512–1024 | 1024 |
| Textura hero | 1024 | 2048 |
| Luz con sombras | 0–1 | 1 principal |
| Carga inicial shell | conservar presupuesto existente | conservar presupuesto existente |

## 13.2 Reglas

- `InstancedMesh` para repetidos.
- Compartir geometrías/materiales.
- KTX2/Basis o formato GPU comprimido para texturas cuando el pipeline esté estable.
- Meshopt o Draco según evidencia de tamaño/CPU; no habilitar ambos por ritual.
- LOD para hero assets observables a distancia.
- Frustum culling y segmentación por zona.
- Lazy loading por experiencia y por tramo.
- Colisiones primitivas.
- Liberación explícita de geometrías, materiales, texturas y render targets al desmontar un runtime.
- No conservar la academia, Ohmdal y Physica simultáneamente en memoria.
- Medir mobile temprano.

## 13.3 Reporte obligatorio

Cada hito visual entrega:

```yaml
performance:
  profile: mobile-medium
  viewport: 390x844
  fps_p50: null
  fps_p10: null
  frame_time_ms_p95: null
  draw_calls: null
  triangles: null
  geometries: null
  textures: null
  estimated_gpu_texture_memory_mb: null
  transferred_assets_mb: null
  largest_assets: []
```

---

# 14. QA visual y bucle de crítica

## 14.1 Capturas deterministas

Definir rutas y parámetros reproducibles:

```text
/labs/instituto-hall?seed=1947&camera=reference&quality=desktop
/labs/instituto-hall?seed=1947&camera=reference&quality=mobile
```

La escena debe poder:

- congelar animaciones o usar tiempo fijo;
- usar una cámara nominal;
- cargar un estado conocido;
- ocultar debug/UI según prueba;
- esperar a que assets terminen de cargar;
- emitir métricas a un objeto o consola estructurada.

## 14.2 Matriz de screenshots

- Desktop: 1440×900.
- Mobile: 390×844.
- Referencia.
- Render actual.
- Comparación lado a lado.
- Diff visual cuando sea útil.
- Dos ángulos adicionales para assets 3D importantes.

## 14.3 Scorecard

Cada categoría se puntúa de 0 a 5:

| Categoría | Gate mínimo para vertical slice |
|---|---:|
| Composición y cámara | 4 |
| Escala humana | 4 |
| Silueta/arquitectura | 4 |
| Materiales | 4 |
| Iluminación | 4 |
| Microdetalle e identidad | 3 |
| Legibilidad de interacción | 4 |
| Rendimiento móvil | 3 |
| Rendimiento desktop | 4 |
| Estabilidad/tests | 4 |

No se promedia para esconder un fallo. Si una categoría obligatoria queda debajo del gate, el hito no está aprobado.

## 14.4 Crítico visual

El crítico debe responder siempre:

1. ¿Cuál es la mayor diferencia con la referencia?
2. ¿Qué proporción está equivocada?
3. ¿Qué superficie se siente plana o genérica?
4. ¿Qué objeto parece de otro estilo o escala?
5. ¿Qué detalle aporta más mejora por coste?
6. ¿Qué cambio amenaza el rendimiento?
7. ¿Qué debe corregirse antes de ampliar el alcance?

---

# 15. Hitos de implementación

## M0 — Baseline y preservación

**Objetivo:** confirmar que el repo está sano y preservar el estado actual.

**Entregables:**

- rama creada;
- build/tests/verify registrados;
- inventario de arquitectura;
- captura del greybox actual;
- `SETUP_REPORT.md` iniciado.

**Gate:** ningún gameplay cambió.

## M1 — Codex operativo

**Objetivo:** dejar AGENTS, skills y MCP visibles.

**Entregables:**

- `AGENTS.md`;
- `roxana-3d-director`;
- skills externas instaladas/pinneadas;
- Playwright y Meshy configurados sin secretos;
- prueba `codex mcp list` y listado de skills.

**Gate:** Codex puede identificar qué skill usar para tres casos de prueba sin ejecutar generación paga.

## M2 — Contratos y catálogo

**Objetivo:** convertir assets en datos trazables.

**Entregables:**

- schema JSON;
- ejemplo válido;
- validador;
- índices de assets;
- política de licencia/créditos;
- biblia de escala.

**Gate:** un asset inválido falla con mensaje claro.

## M3 — Pipeline GLB mínimo

**Objetivo:** demostrar importación y optimización sin arte final.

**Entregables:**

- loader compartido;
- script de validación;
- script de optimización;
- asset de prueba con desktop/mobile;
- disposal probado.

**Gate:** build y tests; reporte de peso antes/después.

## M4 — Laboratorio visual del hall

**Objetivo:** aislar la producción artística del runtime existente.

**Entregables:**

- ruta `/labs/instituto-hall`;
- cámara de referencia;
- maniquí y grilla debug;
- captura desktop/mobile determinista;
- métricas visibles/exportables.

**Gate:** la ruta no altera `?school3d=1` ni el prólogo.

## M5 — Arquitectura procedural

**Objetivo:** reconstruir sólo hall, escalera y fachada superior.

**Herramienta:** `img2threejs` + procedural Three.js.

**Gate:** escala aprobada y score ≥ 4 en composición/silueta antes de agregar aulas.

## M6 — Primer lote Meshy

**Objetivo:** validar el Asset Forge con diez piezas.

1. Estatua de Roxana.
2. Bitácora.
3. Banco.
4. Biblioteca.
5. Lámpara.
6. Escritorio de preceptoría.
7. Puerta institucional.
8. Prop de Física.
9. Máquina de Electrónica.
10. Vegetación decorativa.

**Gate:** todos tienen manifiesto, variantes, captura, coste y licencia.

## M7 — Materiales e iluminación

**Objetivo:** alcanzar la atmósfera de referencia sin esconder errores de escala.

**Gate:** materiales compartidos, una estrategia de sombras medida y score visual aprobado.

## M8 — QA y performance

**Objetivo:** automatizar Playwright, capturas y scorecard.

**Gate:** desktop y móvil; sin errores de consola; métricas registradas.

## M9 — Integración gateada

**Objetivo:** reemplazar la capa visual del spike manteniendo interacciones y shell.

**Gate:** `?school3d=1` funciona; sin query sigue intacto el prólogo estable.

## M10 — Decisión ADR

**Objetivo:** decidir producción del Instituto con evidencia.

**Salida:** ADR que compara:

- fidelidad;
- tiempo de producción;
- coste Meshy/agente;
- FPS/memoria;
- mantenibilidad;
- accesibilidad;
- mobile.

## M11 — Prueba transmedia física

**Objetivo:** demostrar que un asset puede vivir en juego y objeto físico.

**Candidato:** Estatua o Portal de la Primera Chispa.

**Gate:** variante web + STL/3MF decorativo; para kit funcional, CAD separado y prueba real.

---

# 16. Definición de terminado

## Setup terminado

El setup queda terminado cuando:

- build/tests/verify pasan;
- no cambió el gameplay;
- `AGENTS.md` existe y Codex lo resume correctamente;
- skills están instaladas y registradas con commit/licencia;
- MCP Playwright funciona;
- MCP Meshy está configurado pero no expone clave;
- existe una prueba no destructiva de balance o, si requiere credencial, queda pendiente explícita;
- manifiestos validan;
- estructura source/runtime existe;
- hay una ruta/laboratorio o un plan concreto para crearla;
- `SETUP_REPORT.md` muestra comandos, resultados y pendientes.

## Asset terminado

Un asset no está terminado porque Meshy devolvió un GLB. Está terminado cuando:

- referencia y derechos documentados;
- escala y pivote correctos;
- collider definido;
- variantes desktop/mobile;
- validación y optimización;
- captura en cámara real;
- métricas dentro de presupuesto;
- manifiesto completo;
- QA aprobado.

## Escena terminada

Una escena no está terminada porque compila. Está terminada cuando:

- cumple scorecard;
- funciona en desktop y móvil objetivo;
- no tiene errores de consola;
- carga/desmonta sin fugas evidentes;
- conserva interacciones, narrativa y accesibilidad;
- entrega comparación visual y métricas;
- pendientes reales quedan declarados.

---

# Apéndice A — Plantilla de `AGENTS.md`

```markdown
# Proyecto Roxana — Reglas para agentes

## Misión
Construir un juego narrativo educativo con un shell compartido y mundos que pueden usar
runtimes distintos. La tecnología sirve a la gramática pedagógica; no se impone una cámara
o motor único a todos los mundos.

## Base que no debe romperse
- Ohmdal y su Arco I son la base estable.
- Conservar TypeScript + Vite y el RuntimeHost existente.
- Phaser continúa para Ohmdal mientras no exista una migración aprobada por ADR.
- Three.js se usa para el Instituto y experiencias 3D/2.5D cargadas bajo demanda.
- Sin `?school3d=1`, el prólogo estable debe seguir funcionando.
- No migrar a React/R3F/Next/otro motor sin ADR y pedido explícito.

## Antes de modificar
1. Leer README.md.
2. Leer docs/plan-plataforma-cinco-juegos.md.
3. Leer docs/spec-p3-escuela-3d.md para entender que el estado actual es greybox.
4. Leer docs/3d/STATE.md y actualizarlo después de cada bloque significativo.
5. Ejecutar baseline relevante.

## Comandos mínimos
- npm run build
- npm test
- npm run verify

## Producción 3D
- Ejecutar primero la skill roxana-3d-director.
- Procedural/img2threejs para arquitectura, hard-surface, módulos, mecanismos y piezas con pivotes.
- Meshy para assets orgánicos, escultóricos o hero irregulares.
- Sprite 2D es válido para personajes con cámara controlada.
- CAD paramétrico es obligatorio para piezas físicas funcionales.
- Nunca importar un GLB generado directamente al runtime sin manifiesto, escala, pivote,
  collider, optimización y QA.

## Créditos y secretos
- Nunca imprimir, versionar ni incluir MESHY_API_KEY en código cliente.
- Consultar balance antes de lotes.
- Máximo 3 previews por asset salvo autorización.
- Hero assets requieren aprobación antes de texturizar/refinar.

## Calidad visual
- Compilar no equivale a terminar.
- Toda tarea visual debe renderizarse y compararse con referencia.
- Usar escala métrica y maniquí humano de 1,72 m.
- No ampliar alcance si composición, escala o silueta no aprueban.
- No usar rótulos para explicar lo que la arquitectura debe comunicar.

## Rendimiento
- Cargar runtimes y zonas bajo demanda.
- Instancing para repetidos; colliders simples; materiales compartidos.
- Liberar recursos Three.js al desmontar.
- Medir desktop y móvil; no afirmar rendimiento sin datos.

## Git
- Trabajar en ramas cortas codex/<hito>.
- Main debe quedar desplegable.
- No borrar trabajo ajeno ni forzar branches.
- No versionar builds, caches, claves o assets de prueba sin manifiesto.

## Definition of done
Entregar resumen, archivos cambiados, comandos ejecutados, resultados, capturas/métricas
cuando corresponda y pendientes explícitos. Si un gate falla, reportar; no declararlo aprobado.
```

---

# Apéndice B — Skill `roxana-3d-director`

```markdown
---
name: roxana-3d-director
description: Orquesta cualquier tarea de producción 3D, assets, escenas, rendimiento o impresión de Proyecto Roxana. Debe ejecutarse antes de img2threejs, Meshy, author-game-levels u optimize-threejs-games.
---

# Roxana 3D Director

## Entrada obligatoria
- objetivo jugable/narrativo;
- experiencia y cámara;
- referencia disponible;
- plataforma objetivo;
- presupuesto visual/performance;
- destino: web, impresión o ambos.

## Paso 1 — Clasificar
Clasificar como: arquitectura, módulo, hard-surface, orgánico, personaje, sprite,
terreno, mecanismo, UI 3D, producto decorativo o producto funcional.

## Paso 2 — Elegir pipeline
- Arquitectura/módulo/mecanismo/pivotes: procedural o img2threejs.
- Orgánico/escultórico/hero irregular: Meshy.
- Personaje con cámara fija: comparar sprite vs GLB.
- Producto funcional: CAD; Meshy sólo carcasa o concepto.
- Escena completa: composición por módulos; nunca una única malla generada.

## Paso 3 — Exigir contrato
Antes de generar, crear/actualizar manifiesto con escala, pivote, collider, sockets,
triángulos, texturas, licencia, coste máximo y criterios visuales.

## Paso 4 — Invocar la skill mínima
Cargar sólo las skills necesarias. No ejecutar generadores solapados sin una hipótesis A/B.

## Paso 5 — Revisar
Forma antes de textura. Cámara real antes de aprobación. Desktop y móvil antes de integrar.

## Paso 6 — Registrar
Actualizar catálogo, coste, task ID, hashes, capturas, métricas y STATE.md.

## Freno obligatorio
Detenerse y pedir decisión cuando:
- falta una vista necesaria;
- el asset excede coste/presupuesto;
- no hay derechos claros sobre la referencia;
- la pieza necesita ingeniería mecánica;
- la generación no mejora tras una corrección sustancial;
- el runtime estable quedaría comprometido.
```

---

# Apéndice C — Checklist operativo

## Setup

- [ ] Rama creada.
- [ ] Baseline guardado.
- [ ] `AGENTS.md` creado.
- [ ] `.agents/skills/roxana-3d-director` creado.
- [ ] Skills externas instaladas y pinneadas.
- [ ] Playwright MCP conectado.
- [ ] Meshy MCP configurado con env var.
- [ ] `.env.example` y `.gitignore` seguros.
- [ ] Estructura `assets/source|runtime|manifests` creada.
- [ ] Schema y validador funcionando.
- [ ] Documentación 3D creada.
- [ ] Build/tests/verify verdes.
- [ ] `SETUP_REPORT.md` completo.

## Por asset

- [ ] Función y cámara.
- [ ] Método elegido.
- [ ] Referencias.
- [ ] Derechos/licencia.
- [ ] Escala/pivote/frente.
- [ ] Collider/sockets.
- [ ] Presupuesto desktop/mobile.
- [ ] Preview aprobada.
- [ ] Master aprobado.
- [ ] Variantes optimizadas.
- [ ] Integración en cámara real.
- [ ] Captura y métricas.
- [ ] Manifiesto actualizado.

---

# Apéndice D — Prompt de handoff para Codex

El siguiente prompt también se entrega como archivo separado.

```text
Trabajá sobre el repositorio Bottousky/proyecto-roxana.

OBJETIVO
Dejá preparado el ecosistema de producción 3D de Proyecto Roxana: reglas de agente,
skills, MCP, manifiestos de assets, estructura source/runtime, validadores, documentación,
QA visual y políticas de Meshy. Este trabajo es SETUP, no una reconstrucción artística del hall.

REGLAS CRÍTICAS
- Antes de modificar, auditá README.md, package.json, docs/plan-plataforma-cinco-juegos.md
  y docs/spec-p3-escuela-3d.md.
- Conservá TypeScript + Vite + Phaser + Three.js y el RuntimeHost.
- No migres a React, R3F, Next.js ni otro motor.
- No reescribas Ohmdal.
- No alteres el comportamiento estable sin ?school3d=1.
- El spike del Instituto actual es greybox deliberado; no lo declares arte final.
- Creá la rama codex/setup-ecosistema-3d desde main, salvo que exista trabajo sin integrar;
  en ese caso frená y reportá.
- Nunca expongas MESHY_API_KEY, nunca la insertes en código cliente y nunca la commitees.
- No consumas créditos Meshy salvo una consulta de balance; si no hay credencial, dejá la
  prueba pendiente y continuá con el resto.
- No agregues dependencias de producción sin justificar y registrar el motivo.

USÁ COMO BIBLIA
El documento Proyecto_Roxana_Ecosistema_3D_Setup_Codex.md que acompaña este prompt.
Implementá el setup que describe, adaptándolo al estado real del repositorio. Si la guía y
el código difieren, preservá el código estable y documentá la diferencia.

FASE 0 — BASELINE
1. Ejecutá git status, versiones de herramientas, npm install, npm run build, npm test y
   npm run verify.
2. Guardá resultados y fallos preexistentes en docs/3d/SETUP_REPORT.md.
3. No arregles fallos no relacionados silenciosamente.

FASE 1 — INSTRUCCIONES Y SKILLS
1. Creá AGENTS.md con las reglas del Apéndice A, ajustadas a comandos reales.
2. Creá .agents/skills/roxana-3d-director con SKILL.md, referencias y un validador mínimo.
3. Instalá o copiá de forma reproducible estas skills:
   - OpenAI develop-web-game
   - img2threejs
   - MengTo: build-hybrid-game-assets, author-game-levels,
     build-game-camera-controls, optimize-threejs-games, test-playable-web-games
   - Meshy: meshy-3d-generation y meshy-3d-printing
4. Registrá origen, commit, licencia y fecha en docs/3d/TOOLCHAIN_LOCK.md.
5. Verificá descubrimiento. Si Codex necesita reinicio, indicá el paso y seguí con archivos.

FASE 2 — MCP Y SECRETOS
1. Creá .codex/config.toml.example con Playwright y Meshy.
2. Meshy debe usar env_vars = ["MESHY_API_KEY"].
3. Creá .env.example sin valor y asegurá ignores correctos.
4. Verificá Playwright MCP con una navegación local simple cuando el servidor esté activo.
5. Para Meshy, consultá balance sólo si la variable ya existe. No pidas ni copies el secreto
   en documentación o salida.

FASE 3 — CONTRATOS DE ASSETS
1. Creá docs/3d: README, ECOSYSTEM, VISUAL_BIBLE, SCALE_BIBLE, BUDGETS,
   ASSET_PIPELINE, MESHY_POLICY, QA_PROTOCOL, STATE y SETUP_REPORT.
2. Creá assets/manifests/assets.schema.json y un ejemplo de Estatua de Roxana.
3. Creá scripts/3d/validate-asset-manifests.mjs y tests o fixtures válidos/inválidos.
4. Separá assets/source, assets/references y assets/runtime desktop/mobile.
5. No agregues modelos pesados de prueba.

FASE 4 — PIPELINE TÉCNICO MÍNIMO
1. Auditá si ya existe loader GLB; reutilizá antes de duplicar.
2. Prepará scripts de validación/optimización como wrappers documentados. No adoptes
   compresión compleja sin una prueba reproducible.
3. Prepará un reporte de presupuesto capaz de leer renderer.info cuando haya una escena.
4. Dejá una ruta de laboratorio planificada o scaffoldeada sólo si puede hacerse sin tocar
   el runtime estable. No reconstruyas el hall en este hito.

FASE 5 — VALIDACIÓN
1. Ejecutá build, tests y verify.
2. Validá un manifiesto correcto y uno incorrecto.
3. Revisá que no haya claves, builds, node_modules ni outputs generados versionados.
4. Entregá docs/3d/SETUP_REPORT.md con:
   - resumen;
   - archivos creados/modificados;
   - skills y MCP instalados/configurados;
   - comandos y resultados;
   - decisiones y diferencias respecto de la guía;
   - riesgos;
   - próximos pasos exactos para M4 Laboratorio visual del hall.

DEFINITION OF DONE
No declares terminado por haber creado carpetas. Deben pasar build/tests/verify o quedar
fallos preexistentes documentados; el schema debe validarse; las reglas deben ser visibles
para Codex; los secretos deben quedar protegidos; y el reporte debe permitir que otro agente
continúe sin esta conversación.

Al finalizar, mostrámelo como una revisión de PR: resumen, diff por área, evidencia, pendientes
y riesgos. No empieces la producción visual del hall hasta recibir aprobación.
```

---

# Apéndice E — Fuentes técnicas verificadas

1. OpenAI — Custom instructions with `AGENTS.md`: https://developers.openai.com/codex/guides/agents-md
2. OpenAI — Build skills / rutas `.agents/skills`: https://developers.openai.com/codex/skills
3. OpenAI — Model Context Protocol en Codex: https://developers.openai.com/codex/mcp
4. OpenAI Skills Catalog — `develop-web-game`: https://github.com/openai/skills
5. Meshy — AI Integration y MCP: https://docs.meshy.ai/en/api/ai
6. Meshy — API docs: https://docs.meshy.ai/en/api
7. Meshy — Agent Skills: https://github.com/meshy-dev/meshy-3d-agent
8. `img2threejs`: https://github.com/img2threejs/img2threejs
9. Meng To Agent Skills: https://github.com/MengTo/Skills
10. Playwright MCP: https://playwright.dev/mcp/introduction
11. Three.js `GLTFLoader`: https://threejs.org/docs/#examples/en/loaders/GLTFLoader
12. Three.js `KTX2Loader`: https://threejs.org/docs/#examples/en/loaders/KTX2Loader
13. Three.js `InstancedMesh`: https://threejs.org/docs/#api/en/objects/InstancedMesh
14. glTF Transform: https://gltf-transform.dev/
15. Bruno Simon Folio 2025 (pipeline de Blender/GLB/compresión): https://github.com/brunosimon/folio-2025

---

# Resultado esperado

Al terminar este setup, Proyecto Roxana no tendrá todavía “la escuela perfecta”. Tendrá algo más importante: una fábrica controlada para producirla.

```text
idea → referencia → decisión de pipeline → asset trazable → runtime optimizado
→ captura → crítica → corrección → aprobación → reutilización web/física
```

Ese sistema permite que Codex vaya construyendo el Instituto, Ohmdal, Physica y los productos físicos sin volver cada intento una improvisación irrepetible.
