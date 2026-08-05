# Investigación de producción — DRAGON QUEST III HD-2D REMAKE aplicada a Ohmdal

**Estado:** investigación de dirección cerrada el 2026-08-02

**Uso:** referencia de proceso y quality bar; no autoriza H3 ni permite copiar propiedad intelectual

**Regla de evidencia:** se separan hechos publicados, inferencias de dirección y decisiones propias.

## Qué está confirmado públicamente

La información pública no expone el repositorio, motor, DCC, estructura de Jira ni pipeline interno
completo del remake. Sí permite reconstruir sus decisiones de dirección:

1. **HD-2D no es una plantilla única.** Masaaki Hayasaka lo define como personajes pixelados en
   fondos 3D y afirma que cada título adopta una expresión propia. En DQIII los fondos no siguen la
   pixelización de *Octopath Traveler* y el overworld caminable fue una novedad para la línea.
2. **La identidad precede al efecto.** El equipo conservó la paleta viva de Dragon Quest y los
   colores funcionales de las vocaciones aun cuando cambió completamente la representación.
3. **Escala, distancia y ritmo fueron el problema principal.** Mantener el mapa demasiado denso lo
   hacía parecer pequeño; agrandarlo demasiado destruía el ritmo. El teaser y la entrega final
   muestran escalas distintas porque el equipo iteró con pruebas internas y feedback amplio.
4. **La legibilidad ganó sobre el manierismo.** La profundidad de campo inicial fue reducida tras
   una revisión de Yuji Horii porque el desenfoque molestaba al jugador. La técnica se subordinó a
   lectura, identidad y comodidad.
5. **La supervisión de dirección fue continua.** Horii participó desde planificación hasta el final
   en narrativa, funciones, balance e incluso tamaño de píxel. No hubo una aprobación visual única
   al final.
6. **Modernizar no significó reemplazar el núcleo.** El concepto declarado fue cambiar lo mínimo
   del original y actualizar minuciosamente fricciones modernas: velocidad, guardado, controles y
   accesibilidad de uso.
7. **El espacio nuevo exigió sistemas conectados.** Al ampliar mapas, el equipo vinculó exploración,
   monstruos extraviados, arena y nueva vocación. El contenido adicional justificó recorrer el
   espacio en vez de rellenarlo con decoración.
8. **El producto separa contenido de calidad técnica.** Actualizaciones oficiales ofrecieron
   prioridad de gráficos o frame rate sin cambiar historia u objetos. Otro parche ajustó velocidad
   de viaje y control de vuelo: traversal y UX siguieron siendo trabajo de producto después del
   pulido visual.
9. **La producción fue compartida.** La ficha oficial acredita a ARTDINK y SQEX Team Asano. La
   evidencia pública no permite atribuir tareas o herramientas concretas más allá de eso.

## Traducción de dirección para Ohmdal

| Principio observado | Aplicación obligatoria | Lo que no se debe imitar |
|---|---|---|
| Cada HD-2D tiene identidad propia | Piedra, cobre, agua, cerámica, oficio y crepúsculo forman la gramática Ohmdal | Paleta, composición, UI, personajes o mapas de Dragon Quest |
| Mundo y diorama usan escalas distintas | Overworld simbólico y regiones densas con contratos independientes | Escala física uniforme o mundo seamless por prestigio técnico |
| Escala se decide jugando | Medir tiempo entre focos, densidad causal, retorno y fatiga antes de decorar | Aprobar planta por captura estática |
| Dirección de arte protege lectura | DOF moderado, siluetas limpias, foco causal y fondo subordinado | Blur, bloom, viñeta o partículas como firma automática |
| Revisión autoral continua | Gate humano tras cada ticket visible y revisión educativa en cada sistema | Evaluar recién al final del arco |
| Modernización preserva núcleo | Mantener modelos puros, agencia local, error recuperable y Bitácora | Migrar `/jugar` o el save para resolver una escena visual |
| Espacio y sistema se justifican juntos | Cada desvío contiene evidencia, recurso, habitante o consecuencia sistémica | Coleccionables o props sin función para inflar duración |
| Calidad técnica adaptable | Mismo contenido en desktop/mobile; reducir DPR, sombras y VFX | Recortar escenas o enseñanza en hardware menor |

## Gramática de producción propuesta

La unidad de producción no es una región ni un lote de assets: es una **escena causal completa**.
Cada escena pasa, en orden, por:

1. intención narrativa y competencia V2;
2. blockout a escala y tiempo de recorrido;
3. cámara real desktop/mobile;
4. interacción y modelo determinista;
5. personajes/props mínimos con manifests;
6. material, luz, VFX y audio;
7. accesibilidad, rendimiento y evidencia;
8. revisión humana y `DONE`.

No se abre la escena siguiente para “mantener ocupados” a otros roles. La reducción de paralelismo
es deliberada: con un equipo pequeño, evita construir arte alrededor de escala, cámara o contenido
todavía inestables.

## Golden slice antes de campaña

Portal–Plaza–Taller–Puerta–Manantial debe congelar una línea de producción repetible:

- una hoja de encuadres con safe areas desktop/mobile;
- paleta y color script tarde→crepúsculo;
- biblioteca mínima de materiales y módulos;
- atlas de estudiante de cuatro direcciones y contrato de actuación;
- Ohm sprite con contacto, estados accesibles y sockets lógicos;
- interacción Lumen→Puerta con modelo V2 y Bitácora;
- audio vertical original;
- mediciones Android físico, navegadores, PWA y disposal;
- coste real por minuto jugable y por escena causal.

El slice no aprueba “el look” solamente: aprueba que esa línea puede repetirse dentro del tiempo,
presupuesto y hardware de Ohmdal.

## Auditoría de la Biblia y del pipeline

| Área | Veredicto | Evidencia actual | Corrección necesaria antes de H3 |
|---|---|---|---|
| Canon, mundo y personajes | Adecuado | Conflicto, agencia local, reparto y cuatro regiones cerrados | Promover selección 4 direcciones + Ohm sprite en documentos viejos |
| Currículo y modelos | Adecuado fuerte | Seis fichas V2, 30 campos y tests deterministas | Mantener V2 antes de escena; no producir arte con V0/V1 |
| GDD y guion | Adecuado para slice | Loop, fallas, escenas y transferencia definidos | Convertir escenas en tickets aceptables, no H3.1–H3.10 monolíticos |
| Dirección visual | Adecuado condicional | Cámara casi ortográfica y blockout evaluados | Aprobación humana de CAM-FIX-001; golden frames y color script |
| Assets | Adecuado condicional | Routing, manifests y trazabilidad existen | Congelar kit/materiales/atlas; coste y descarte por ticket |
| Runtime | Adecuado como frontera | `RuntimeHost` y `/jugar` protegido | ADR sólo después del slice; probar mount/destroy y save real |
| Mobile/PWA | Incompleto | Mobile emulado pasó | Android físico, Safari/PWA y recuperación offline siguen `not-run` |
| Audio | Insuficientemente ejecutable | Dirección orquesta+electrónica y VO parcial | Cue sheet, buses, presupuesto, loop y subtítulos por escena |
| Agentes | Roles útiles | Director, Arquitectura, Asset Forge, Evaluador | Arquitectura específica de Ohmdal; WIP 1; una frontera por ticket |
| Control de trabajo | No adecuado antes de esta revisión | H3/H5 demasiado grandes; concurrencia hasta 3 | Flujo Jira serie y dependencia dura definidos en documento 16 |

**Veredicto director:** la Biblia es suficientemente buena para preproducción del slice, pero no
para producción autónoma del Arco I sin el backlog serie, la actualización de decisiones del spike
y el cierre humano de cámara. La corrección de cámara ya está hecha; el estado vigente está en
[`../../ROADMAP.md`](../../ROADMAP.md).

## Agentes y modelos

- **Director/integrador:** conserva canon, ticket activo, estados y aceptación. Es dueño de
  narrativa/educación e integración mientras no exista un rol aprobado más específico.
- **Arquitectura Ohmdal:** blockout, escala, cámara, navegación, materiales, luz y rendimiento de
  escena; no es el perfil del Instituto reutilizado sin cambios.
- **Asset Forge:** sólo produce el asset acotado por el ticket actual y su manifest. No abre lotes.
- **Evaluador:** observa una integración cerrada y no corrige. La aceptación humana visible sigue
  siendo obligatoria.
- **Modelo de IA:** se elige por tarea y evidencia disponible, no por reputación. Codex puede
  dirigir/integrar; Claude Code u OpenCode gratuito pueden ejecutar paquetes acotados si un smoke
  confirma disponibilidad. Una falla de proveedor bloquea o reasigna el paquete actual, nunca
  habilita el siguiente ticket.

## Fuentes primarias

- [Entrevista oficial con Masaaki Hayasaka — PlayStation Blog](https://blog.playstation.com/?p=398105)
- [Entrevista de Square Enix publicada por Xbox Wire](https://news.xbox.com/en-us/2024/11/14/dragon-quest-iii-hd-2d-remake-how-square-enix-recreated-a-modern-classic/)
- [Página oficial de DRAGON QUEST III HD-2D REMAKE](https://dragonquest.square-enix-games.com/games/en-us/dragon-quest-3-hd2d-remake/)
- [Ficha oficial: ARTDINK y SQEX Team Asano](https://na.store.square-enix-games.com/dragon-quest-iii-hd2d-remake)
- [Presentación oficial de una quest y la composición 3D+2D+luz](https://blog.playstation.com/?p=397287)
- [Video oficial “Reimagining the World”](https://www.youtube.com/watch?v=s5xhgCxT2oE)
- [Video oficial “Reimagining the Characters”](https://www.youtube.com/watch?v=F39YXRRUHIU)
- [Aviso oficial de actualización y ajustes de traversal](https://www.square-enix-games.com/en_US/documents/dragon-quest-iii-hd-2d-remake-update-notice)
- [Opciones oficiales de gráficos/frame rate sin cambios de contenido](https://www.square-enix-games.com/en_US/documents/differences-between-the-nintendo-switch-2-version-and-the-nintendo-switch-version-of-dragon-quest-i-and-ii-hd-2d-remake)
- [Reglas oficiales de uso de materiales](https://www.square-enix-games.com/en_GB/documents/dragon-quest-iii-hd-2d-remake-materials-usage-guidelines)
