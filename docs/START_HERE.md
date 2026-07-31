# Proyecto Roxana — norte de producto

**Estado:** decisión de producto y arquitectura después de la auditoría del 30 de julio de 2026.

## La decisión en una frase

Proyecto Roxana es un **ecosistema educativo jugable**: el Instituto es el hogar que recuerda y
cambia; cada disciplina abre un mundo con la gramática que mejor permite experimentarla; la
Bitácora transforma lo vivido en conocimiento técnico.

No es una tienda con minijuegos, una colección de cursos, una academia 3D completa ni cinco
juegos independientes.

## La promesa al jugador

> Llego a una escuela casi olvidada. Aprendo haciendo para reparar sus mundos y, cuando regreso,
> la escuela demuestra que recuerda lo que hice.

El loop común es:

1. **observar** un fenómeno extraño, antes de recibir una fórmula;
2. **experimentar** con reglas legibles y consecuencias reversibles;
3. **comprender** una relación, no acertar una respuesta aislada;
4. **registrar** la traducción técnica en la Bitácora;
5. **restaurar** una parte visible del mundo aplicado y del Instituto;
6. **elegir** una nueva pregunta.

## Los cinco espacios

### Instituto Roxana

Es una landing explorable y también el meta-juego. Su vista axonométrica/isométrica funciona
como una maqueta viva, no como un avatar que deba conducirse por pasillos.

Las salas iniciales son:

- hall y estatua de Roxana;
- preceptoría: identidad, sesión y orientación;
- aulas de Electrónica, Programación, Física y Matemática;
- anfiteatro: biblioteca audiovisual contextual;
- dirección: misterio y progreso narrativo;
- sala de trofeos: memoria visible de logros;
- Bitácora: accesible desde todo el ecosistema.

Una sala puede ser un diorama 3D con focos interactivos, mientras que diálogos, fórmulas,
Bitácora y video viven en DOM accesible y nítido.

### Mundos

| Disciplina | Mundo | Lenguaje jugable | Núcleo narrativo |
| --- | --- | --- | --- |
| Electrónica | Ohmdal | top-down tres cuartos en rediseño, mundo continuo y mecanismos diegéticos | la electrónica se recuerda como magia |
| Programación | Bitland | ciudad cenital cibernética | el sistema obedece literalmente; Null sobrevive por no estar referenciado |
| Física | Physica | 2D o 3D según el fenómeno | un instrumento permite alterar leyes para descubrir sus relaciones |
| Matemática | Arithmos | pizarrón vivo y narrador | la estructura pura que sostiene a todos los demás mundos |

Ohmdal y su Arco I son una base estable de contenido, modelos pedagógicos y regresión. **No están
aprobados como diseño espacial, dirección artística ni presentación de puzzles.** La versión
actual permanece accesible mientras un laboratorio aislado demuestra una alternativa mejor.

## La Bitácora

La Bitácora es el núcleo pedagógico, narrativo y coleccionable. Tiene tres capas:

1. **huella vivida:** dibujo, diálogo o evidencia de lo que ocurrió;
2. **puente:** relación explícita entre la metáfora del mundo y el concepto;
3. **formalización:** nombres técnicos, fórmula, unidades, límites y un nuevo experimento.

Se escribe después de la experiencia y conserva tachones, hipótesis, diagramas y errores útiles.
No reemplaza al jugador con un resumen automático: le devuelve una lectura rigurosa de aquello
que ya consiguió observar.

## Qué existe hoy

- **Base estable de regresión:** `/jugar`, Ohmdal y Arco I conservan narrativa, lógica, estado y
  modelos de puzzles mientras se prueba su reemplazo visual/espacial.
- **Dirección visual válida:** la escuela axonométrica en Three.js, sus GLB y su selección de
  salas.
- **Shell válido:** TypeScript, Vite, `RuntimeHost`, estado local y carga por manifiestos.
- **Prototipos/historia:** portadas clásicas, tienda ficticia, runtimes anteriores del Instituto,
  renders y packs fuente. Son evidencia, no producto activo.
- **Arte:** prototipo o dirección visual; todavía no se declara arte final.

## Decisión técnica

Se conserva una arquitectura híbrida:

- **Vite + TypeScript** como shell web ligero;
- **Three.js** para la maqueta axonométrica del Instituto, con Blender → GLB como pipeline
  principal;
- **Phaser** como candidato principal para el Ohmdal top-down por su cámara, tilemaps, input,
  colisión y compatibilidad web; el spike debe probarlo, no asumir que el runtime actual alcanza;
- **DOM/CSS** para Bitácora, diálogos, accesibilidad, sesión y video;
- **runtimes bajo demanda** mediante el `RuntimeHost`;
- **manifiestos de assets** para escala, pivote, frente, collider, presupuesto y procedencia.

No se migra a React, Next.js, R3F, Godot o PlayCanvas en esta etapa. Ninguna de esas migraciones
resuelve por sí misma continuidad artística, diseño de interacción o producción de assets.

### Alternativas evaluadas

| Alternativa | Aporta | Costo o límite | Decisión |
| --- | --- | --- | --- |
| PlayCanvas | editor visual web y motor/runtime unificados | migración y nueva fuente de verdad de escenas | candidato a spike sólo si Blender → GLB bloquea la iteración |
| PixiJS | renderer 2D muy flexible | reconstruir sistemas que Phaser ya aporta | no es primera opción para el spike |
| Godot Web | editor y workflow de juego completo | WASM/WebGL2, restricciones web/mobile y otro runtime | reservar para un producto descargable futuro |
| Next.js/React | ecosistema de aplicaciones y backend | complejidad sin ganancia para el loop jugable actual | no adoptar sin necesidad de producto |
| Instituto íntegramente 2D | bajo costo de GPU y arte muy controlable | pierde la maqueta espacial y su respuesta de cámara | usar 2D como UI/sprites, no como reemplazo obligatorio |

## Pipeline visual

Cada elemento se produce con la representación que mejor sirve a su lectura:

- arquitectura, puertas, mecanismos y sockets: Blender modular o geometría procedural;
- personajes hero con animación: malla riggeada importada, con licencia y escala verificadas;
- personajes secundarios con cámara controlada: sprites 2D;
- retratos, páginas de Bitácora, iconos y fondos: ilustración 2D;
- imágenes generadas: referencia o media 2D con procedencia, no falsa geometría 3D;
- conceptos: fijan composición, silueta, paleta y materiales; la escena jugable se construye aparte.

Ningún asset entra al runtime sin comprobarse con la cámara real, en desktop y mobile.

## Próximo hito: «Ohmdal mundo vivo»

Antes de integrar el ecosistema completo hay que demostrar que Ohmdal puede alcanzar la escala y
la integración buscadas. El hito es un laboratorio aislado de 5–10 minutos:

1. recorrer sin transiciones una región amplia que conecte Plaza, Taller, río y Puerta;
2. orientarse mediante caminos, hitos, actividad y composición, no por cajas consecutivas;
3. encontrar un mecanismo eléctrico que existe físicamente en el escenario;
4. observar el flujo, accionar piezas, medir y provocar consecuencias sin abrir un banco modal;
5. completar o abandonar el mecanismo sin bloquear el mundo;
6. comparar el resultado contra el Ohmdal actual en desktop y mobile.

El contenido actual aporta modelos y narrativa, pero no se reutilizan sus chunks fijos ni su
presentación de formularios superpuestos. «La escuela recuerda» queda postergado hasta aprobar o
rechazar este nuevo lenguaje jugable.

### Fuera de alcance

- migrar el Arco I completo;
- producir Programación, Física, Matemática o nuevas salas del Instituto;
- backend, cuentas, comercio o biblioteca de YouTube;
- reescribir modelos matemáticos o el guardado estable;
- generar un lote completo de arte;
- adoptar otro motor sin una comparación reproducible del mismo slice.

### Gates

- región continua mayor que varias pantallas, sin seams de chunks de 960 × 540;
- recorrido completo y reiniciable en desktop y mobile;
- puzzle resuelto mediante objetos, posiciones y feedback del mundo;
- ninguna pantalla modal obligatoria durante la resolución;
- cámara top-down tres cuartos legible, con landmarks antes del compromiso;
- cero errores de consola;
- build y tests verdes;
- `render_game_to_text` y `advanceTime(ms)` para pruebas deterministas;
- captura y recorrido Playwright después de cada cambio significativo;
- prueba en Android físico;
- cinco pruebas observadas: al menos cuatro personas entienden qué manipularon y por qué cambió
  el mecanismo.

## Forma de trabajo

Un bloque empieza con una hipótesis, una captura objetivo, archivos permitidos y una condición de
cierre. Termina con evidencia en el navegador real. No se dejan agentes iterando durante horas
sin un entregable intermedio verificable.

La producción multiagente sólo se habilita cuando el contrato del hito fija commit base,
ownership, presupuesto y `executionAuthorized: true`.

## Referencias externas verificadas

- [OpenAI — Build browser games with Codex](https://learn.chatgpt.com/use-cases/browser-games):
  flujo de varias etapas con plan escrito, Phaser/PixiJS como opciones, generación de assets,
  navegador vivo y ajustes.
- [Phaser — documentación](https://docs.phaser.io/): motor 2D web-first con TypeScript.
- [Three.js — carga de modelos 3D](https://threejs.org/manual/en/loading-3d-models.html):
  glTF/GLB como formato de entrega.
- [Three.js — limpieza de recursos](https://threejs.org/manual/en/cleanup.html):
  disposición explícita de recursos GPU.
- [PlayCanvas — editor](https://developer.playcanvas.com/user-manual/editor/) y
  [motor](https://developer.playcanvas.com/user-manual/engine/): alternativa visual evaluada.
- [PixiJS — introducción](https://pixijs.com/8.x/guides/getting-started/intro): renderer 2D.
- [Godot — exportación web](https://docs.godotengine.org/en/4.5/tutorials/export/exporting_for_web.html):
  capacidades y restricciones del runtime web.
- [Tiled — introducción](https://doc.mapeditor.org/en/stable/manual/introduction/):
  editor candidato para mapas ortogonales o isométricos futuros.
