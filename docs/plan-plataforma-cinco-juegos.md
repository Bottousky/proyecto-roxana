# Plan técnico — Plataforma para cinco juegos

**Estado:** borrador operativo 0.1  
**Base estable:** `main` / `ohmdal-base` en `296eee7`  
**Visión:** [`vision-mundos-multilenguaje.md`](vision-mundos-multilenguaje.md)

## 1. Decisión arquitectónica

Proyecto Roxana será una aplicación web con un **shell persistente** y runtimes de experiencia
cargados bajo demanda. Cada runtime puede usar una gramática diferente, pero ninguno puede
duplicar progreso, Bitácora, narrativa o navegación global.

No se crearán cinco repositorios ni cinco aplicaciones independientes. Tampoco se impondrá
Phaser top-down a los mundos cuya disciplina pide otra forma de interacción.

## 2. Los cinco juegos

| Juego | Verbo | Runtime objetivo inicial | Riesgo que debe probar el prototipo |
|---|---|---|---|
| Instituto | reunir | 3D/2.5D web a decidir | rendimiento, navegación y costo de assets |
| Ohmdal | conectar | Phaser 4 top-down | escala del mundo continuo y pase de arte |
| Bitland | ejecutar | Phaser 4 cenital/dataflow | que enseñe modelos mentales, no sintaxis decorada |
| Physica | sentir | Phaser 4 platformer | control consistente y simulación pedagógica legible |
| Arithmos | contemplar | canvas/WebGL + DOM narrativo | interacción suficiente sin volverlo pasivo |

Los runtimes de la tabla son hipótesis. El contrato del shell es una decisión; la librería 3D
del Instituto no lo es todavía.

## 3. Capas del sistema

### Shell compartido

- montaje y desmontaje del runtime activo;
- transiciones entre experiencias;
- sesión, save versionado y migraciones;
- Bitácora, diálogos y overlays accesibles en DOM;
- audio global y mezcla por experiencia;
- controles comunes, pausa y opciones;
- carga de assets, errores y telemetría futura.

### Runtime de experiencia

- render, cámara y loop de actualización;
- movimiento, colisiones e interacción espacial;
- adaptación visual de puzzles/modelos puros;
- contenido local y estados visuales del mundo;
- serialización de posición privada del runtime.

### Modelos pedagógicos

Los verificadores y simulaciones deben permanecer TypeScript puro. El runtime representa el
fenómeno y envía acciones; el modelo devuelve estado y resultado. Esto permite probar aprendizaje
sin navegador y representar un mismo principio en banco, mundo o Bitácora.

## 4. Contrato mínimo del runtime

El primer hito convertirá esta forma conceptual en interfaces reales:

```ts
interface ExperienceRuntimeModule {
  id: ExperienceId;
  mount(host: HTMLElement, context: RuntimeContext): Promise<RuntimeHandle>;
}

interface RuntimeHandle {
  travelTo(destination: ExperienceLocation): Promise<void>;
  snapshot(): RuntimeSnapshot;
  pause(): void;
  resume(): void;
  destroy(): Promise<void>;
}

interface RuntimeContext {
  progress: ProgressService;
  narrative: NarrativeService;
  codex: CodexService;
  audio: AudioService;
  requestTravel(destination: ExperienceLocation): Promise<void>;
}
```

Reglas:

- el runtime nunca escribe directamente el save global;
- el shell nunca mueve un personaje ni conoce colisiones;
- una transición entre runtimes guarda snapshot, destruye, importa y monta;
- una transición dentro del mismo runtime puede resolverse sin desmontarlo;
- el DOM compartido permanece montado durante ambos casos.

## 5. Estructura objetivo, por migración gradual

```text
src/
  app/                         shell, bootstrap y host de runtime
  core/
    progress/                  save, schema y migraciones
    narrative/                 diálogos, flags y objetivos
    codex/                     Bitácora y grafo de conocimiento
    audio/                     buses y ambientes
    input/                     acciones comunes y remapeo
  experiences/
    registry.ts
    types.ts
    instituto/
    ohmdal/
    bitland/
    physica/
    arithmos/
  puzzles/                     modelos puros + adaptadores actuales
  ui/                          overlays DOM compartidos
```

No se moverá `src/jugar` completo de una vez. Primero Ohmdal recibe un adaptador que envuelve la
escena existente; después, cada archivo se mueve cuando una modificación funcional lo requiera.

## 6. Estado y guardado

El save pasará de `room + flags` a un sobre versionado, conservando migración automática:

```ts
interface RoxanaSaveV2 {
  version: 2;
  active: { experienceId: ExperienceId; locationId: string };
  story: StoryProgress;
  knowledge: KnowledgeProgress;
  runtimes: Partial<Record<ExperienceId, RuntimeSnapshot>>;
  settings: PlayerSettings;
}
```

Los flags actuales no se renombran durante la primera migración. Se encapsulan bajo `story` y
se mantienen tests con saves viejos reales. Ningún prototipo nuevo puede romper continuidad.

## 7. Carga y presupuesto web

- Vite usará `import()` por experiencia: visitar Ohmdal no descarga la escuela 3D.
- El shell y la UI compartida deben quedar por debajo de 500 KB comprimidos, excluyendo fuentes.
- Cada prototipo declara presupuesto de JS, textura, audio y memoria antes de producir assets.
- El Instituto se prueba en Android objetivo antes de elegir 3D real.
- Los assets fuente pesados no entran al bundle; el repositorio distingue `source` de `runtime`.

## 8. Plan por fases

### P0 — Base limpia [hecho]

- `main` y `ohmdal-base` alineados y publicados;
- ramas redundantes eliminadas;
- prototipos descartados preservados como tags locales `archive/*`;
- logs y carpeta duplicada retirados;
- manifiestos de cinco experiencias y test de pertenencia de salas.

### P1 — Runtime host [siguiente]

- extraer el bootstrap de Phaser de `main.ts`;
- crear `RuntimeHost` y contrato real;
- envolver `ExplorationScene` en `OhmdalRuntime` sin cambiar gameplay;
- rutear Instituto y Ohmdal inicialmente al mismo adaptador top-down;
- pruebas: mount, transición same-runtime, destroy y recuperación de error.

**Salida:** el juego actual se juega igual, pero `main.ts` ya no conoce Phaser.

### P2 — Frontera Instituto ↔ Ohmdal

- convertir el portal en solicitud de viaje al shell;
- separar ubicación global de sala top-down;
- mantener Bitácora y diálogos durante el cambio;
- agregar save v2 con migración desde `roxana-slice-v1`.

**Salida:** reemplazar el Instituto no exige tocar Ohmdal.

### P3 — Spike del Instituto

Construir la misma estancia mínima en hasta tres variantes:

1. Phaser 2.5D con capas y fondos;
2. WebGL 3D liviano con cámara fija/semi-fija;
3. fondos prerenderizados con hotspots y profundidad limitada.

Contenido: protagonista, preceptor, una puerta, un objeto, diálogo y Bitácora. Medir FPS,
memoria, peso, tiempo de producción, accesibilidad y legibilidad mobile.

**Salida:** ADR que elige técnica; el código perdedor se archiva, no queda como rama viva.

### P4 — Vertical integrada

- llegada al Instituto;
- acceso al aula;
- cambio de runtime hacia Ohmdal;
- una restauración y entrada de Bitácora;
- regreso a un Instituto visiblemente cambiado.

**Salida:** prueba emocional y técnica de que los estilos diferentes siguen siendo un juego.

### P5 — Segundo lenguaje real

Prototipar 5–10 minutos de **Physica o Bitland**, el que tenga primero una lección concreta y
testeable. Debe usar shell, save y Bitácora sin excepciones ad hoc.

**Salida:** demostración de que la arquitectura soporta algo que no es top-down Ohmdal.

### P6 — Producción secuencial

Cerrar un arco pequeño por mundo antes de ampliar el siguiente. Arithmos se produce al final:
su función fundacional gana fuerza cuando ya existen conceptos que conectar.

## 9. Estrategia Git

- `main`: siempre build y tests verdes; deployable.
- `ohmdal-base`: hito estable y referencia, sin desarrollo diario.
- ramas cortas `codex/<hito>` desde `main`, integradas por fast-forward o PR.
- prototipos perdedores: tag `archive/<nombre-fecha>`, no ramas eternas.
- nada de logs, builds, zips de herramientas o assets de prueba sin manifiesto.
- cada runtime nuevo debe incluir test de carga y presupuesto antes de fusionarse.

## 10. Próximas decisiones, en orden

1. Forma exacta de `RuntimeContext` y quién posee el viaje.
2. Separación entre progreso narrativo y snapshots espaciales.
3. Criterios medibles del spike del Instituto.
4. Lección vertical de Bitland y Physica; no elegir motor sin esa lección.
5. Dirección audiovisual de Arithmos cuando existan conexiones reales que contemplar.
