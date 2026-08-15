# Proyecto Roxana — Physica
## Game Design Document v0.2

**Fecha:** 5 de agosto de 2026  
**Estado:** Fundación canónica / preproducción  
**Acompañante:** nombre pendiente de validación

> **Principio rector:** el mundo no explica antes de ser vivido. El jugador observa, actúa, mide, formula una hipótesis, prueba y recién entonces la Bitácora formaliza el conocimiento.

## 1. Resumen ejecutivo

Physica es un mundo experimental creado por docentes del Instituto Roxana para volver manipulables, visibles y jugables las leyes de la Física. Las modificaciones se acumularon, la documentación dejó de corresponder con el mundo y sus creadores perdieron la comprensión del sistema completo. No existe una amenaza malvada: la maquinaria continúa obedeciendo demasiadas instrucciones a la vez.

La imagen fundacional es una cascada que asciende hacia el cielo. La fantasía del jugador consiste en explorar una naturaleza imposible, descubrir qué variables producen cada anomalía e intervenir de forma limitada y responsable.

El primer arco enseña:

1. observación y medición;
2. sistema de referencia y movimiento relativo;
3. vectores: magnitud, dirección y sentido;
4. fuerza resultante y equilibrio;
5. aplicación inicial mediante plano inclinado.

## 2. Acceso desde el Instituto

El jugador selecciona el Aula de Física en la vista Three.js del Instituto. En su primer ingreso encuentra un reloj-dispositivo que reacciona con la mesa atómica del laboratorio. La mesa se activa y permite entrar en Physica. Al volver, el aula cambia de manera persistente: mesa encendida, miniatura de la región, acompañante presente, Bitácora habilitada y experimentos físicos activos.

## 3. Canon del mundo

- Physica fue creado por docentes vinculados al Instituto Roxana.
- No es un portal a un planeta natural, sino una infraestructura pedagógica experimental.
- Su origen profundo permanece parcialmente misterioso.
- El mundo se volvió intransitable por superposición de cambios y pérdida de comprensión.
- El primer arco no requiere una población humana.
- La metrópolis futura puede revelar habitantes, autómatas o una ciudad desierta.

> Physica no dejó de funcionar. Funciona sin que nadie recuerde cómo encajan todas sus partes.

## 4. Pilares

- Maravilla observable.
- Comprender antes de alterar.
- Consecuencias sistémicas.
- Cuerpo antes que fórmula.
- Integración mundo–Bitácora.
- Sin combate convencional.
- Reloj y acompañante con iconografía propia y modular.

## 5. Público y profundidad

Público general desde cero, organizado según contenidos de Física secundaria.

- **Capa conceptual:** observación, predicción cualitativa y acción.
- **Capa académica:** magnitudes, unidades, gráficos y fórmulas opcionales.
- **Capa desafío:** estimaciones, optimización y combinación de sistemas.

La campaña no se bloquea por una cuenta aislada. Las fórmulas precisan una intuición previamente construida.

## 6. Arquitectura académica

### Primer arco

| Paso | Concepto | Experiencia |
|---|---|---|
| 1 | Observación y medición | Quietud no implica ausencia de fuerzas. |
| 2 | Sistema de referencia | Comparar cuerpos que comparten movimiento. |
| 3 | Vectores | Magnitud, dirección y sentido. |
| 4 | Resultante y equilibrio | Suma vectorial nula sobre un cuerpo. |
| 5 | Plano inclinado | Menor fuerza instantánea a cambio de mayor recorrido. |

**Protección conceptual:** en movimiento relativo puede restarse un movimiento común al cambiar de referencia. En dinámica, las fuerzas se analizan sobre cada cuerpo y solo se cancelan cuando su suma vectorial sobre ese cuerpo es nula.

### Arcos futuros

1. Cinemática: posición, desplazamiento, rapidez, velocidad, MRU, MRUV y gráficos.
2. Tiros y gravedad: caída, tiro vertical y oblicuo.
3. Dinámica: leyes de Newton, rozamiento, masa, peso, impulso y cantidad de movimiento.
4. Trabajo y energía.
5. Rotación, máquinas simples y movimiento circular.
6. Fluidos.
7. Ondas y sonido.
8. Óptica.
9. Térmica.

Electricidad y electrónica pertenecen principalmente a Ohmdal; cualquier cruce debe coordinarse para no duplicar identidades.

## 7. Bucle principal

Fenómeno → acción → medición → hipótesis → prueba → formalización → nueva capacidad → consecuencia.

## 8. Reloj-dispositivo

Instrumento analógico con agujas, anillos, escalas y piezas móviles. No funciona como un menú de trucos.

Progresión:

- lectura de vectores;
- selector de sistema de referencia;
- registro de trayectorias;
- intervención local autorizada;
- futuros módulos de fricción, masa, gravedad, ondas, óptica y presión.

No existe edición global libre. Cada modificación requiere comprensión previa, módulo compatible y límites de región.

## 9. Acompañante instrumental

Nombre pendiente. “Metrón/Metron” queda descartado.

Diseño fijo:

- núcleo esférico con lente central;
- anillo giroscópico/astrolabio;
- aguja direccional;
- extremidades retráctiles;
- módulos intercambiables sin perder la silueta base.

Personalidad precisa, seria, tierna y ligeramente ansiosa ante lo que no puede medir. Conoce procedimientos, pero no conserva la teoría completa. El acompañante mide e interpreta; el reloj revela, registra y ejecuta. Ambos pueden acoplarse físicamente y formar una sola pieza.

## 10. Mundo–Bitácora

Estados de una entrada:

1. observación;
2. medición;
3. hipótesis;
4. prueba en el mundo;
5. síntesis conceptual;
6. formalización académica opcional.

La Bitácora no anticipa la solución, conserva evidencias del intento y devuelve al jugador al entorno con una nueva lectura o capacidad.

## 11. Dirección espacial y artística

La primera región es naturaleza monumental con revelaciones subatómicas puntuales: roca, agua, polvo, hojas, redes, partículas y membranas. La cascada ascendente permanece como hito. Los instrumentos docentes usan cobre, latón, vidrio, cerámica y mecanismos analógicos.

La primera región puede usar traversal 2.5D con cámaras curadas. La metrópolis futura habilita navegación y fenómenos plenamente tridimensionales: edificios con distintas orientaciones gravitatorias, tránsito por paredes, trenes relativos, torres resonantes, óptica urbana, fluidos y térmica.

## 12. Mecánicas

- caminar, correr y trepar;
- empujar, arrastrar y rotar objetos;
- levantar y arrojar objetos pequeños;
- colocar apoyos, cuñas y superficies;
- observar ciclos y comparar posiciones;
- revelar vectores, referencias y trayectorias.

No-objetivos del slice: edición libre, MRU/MRUV completo, combate, crafting extenso, historia total de los docentes y normalización de la cascada.

## 13. Vertical slice

Duración: 30–45 minutos.

1. Aula de Física: reloj y mesa atómica.
2. Llegada: cascada ascendente.
3. Instrumento suspendido: equilibrio.
4. Plataformas a la deriva: referencia.
5. Corriente transversal: vectores.
6. Roca y plano inclinado.
7. Estación pedagógica: síntesis.
8. Vista de la metrópolis.
9. Regreso persistente al Instituto.

## 14. Tono

Maravilla científica y aventura como tono dominante; misterio arqueológico de fondo; humor físico en las reacciones del acompañante. Evitar villano expositivo, tecnicismos prematuros y chistes que ridiculicen el aprendizaje.

## 15. Accesibilidad

- reducción de movimiento;
- vectores distinguibles sin depender del color;
- subtítulos descriptivos;
- control asistido de lanzamiento;
- tamaño y contraste ajustables;
- lectura guiada de fórmulas;
- sin presión de tiempo en campaña.

## 16. Merchandising

El reloj y el acompañante deben funcionar como dos productos independientes y como una pieza combinada. La silueta debe leerse en una tinta, ser imprimible en 3D y admitir módulos intercambiables.

## 17. Decisiones abiertas

- nombre final del acompañante;
- población de la metrópolis;
- representación exacta del protagonista;
- biblia visual definitiva;
- profundidad numérica por nivel/curso;
- detalle de la autoría docente;
- límites técnicos de cada simulación.

## 18. Criterios de aceptación

El slice es exitoso cuando el jugador reconoce la identidad de Physica, explica referencia/vectores/equilibrio desde la experiencia, usa la Bitácora como parte del mundo, reconoce al acompañante y al reloj, estabiliza una región sin “arreglarlo todo” y comprende que la metrópolis es la expansión natural del sistema.


# 22. Dirección técnica, motor y arquitectura de producción

## 22.1 Definición del formato jugable

Physica es una aventura educativa de puzzles físicos en **2.5D**, con escenarios y simulación 3D, cámara lateral controlada y expansión progresiva hacia espacios tridimensionales contenidos en la metrópolis. En la naturaleza inicial, el avance ocurre principalmente sobre un plano lateral. La profundidad se usa para parallax, maquinaria, composición y cambios puntuales de carril.

## 22.2 Motor recomendado

- El Instituto y la aplicación web permanecen en el stack actual y en Three.js.
- Los mundos jugables, comenzando por Physica, se prototipan en Babylon.js.
- Al entrar a Physica se suspende la escena Three.js y se monta un canvas Babylon.js.
- Babylon.js se elige por mantener TypeScript y web nativo, incorporando físicas, controlador, animación, partículas, GUI, inspector e importación GLB.
- La decisión se confirma después de un prototipo comparativo y no implica reescribir la escuela.

## 22.3 Pipeline de assets

Concepto aprobado → ficha técnica → Blender/script/MCP → validación → GLB → manifest → escena Babylon.js. Cada asset debe documentar escala, nodos, anclajes, collider, versión, materiales y LOD.

## 22.4 Referencias funcionales

- **Trine 4/5:** referencia principal para puzzles físicos, escenarios 3D vistos desde un plano lateral y cámara orientada a cada problema.
- **Planet of Lana:** acompañante, escala paisajística, ritmo contemplativo y enseñanza mediante acciones.
- **Little Nightmares II:** profundidad 3D controlada, escala de personaje y puesta en escena.
- **INSIDE:** legibilidad, economía visual, animación contextual y cámara.

No se copian personajes, estética, historia, tono, arquitectura ni interfaz.

## 22.5 Reglas visuales

- Debe verse como una pantalla dentro del motor, no como arte fotorrealista.
- Las plataformas y objetos interactivos deben leerse antes que el fondo.
- Materiales estilizados, geometría modular y VFX limpios.
- Los vectores son una visualización diegética activada por el reloj.
- La cascada ascendente es el hito visual del vertical slice.
- La metrópolis habilita mayor profundidad y navegación 3D sin romper la identidad.

## 22.6 Fuentes

- Babylon.js: https://www.babylonjs.com/specifications/
- Babylon.js Editor: https://editor.babylonjs.com/
- Three.js: https://threejs.org/docs/
- Trine: https://www.frozenbyte.com/games/trine/
- Planet of Lana: https://thunderfulgames.com/games/planet-of-lana/
- Little Nightmares II: https://store.steampowered.com/app/860510/Little_Nightmares_II/
- INSIDE: https://store.steampowered.com/app/304430/INSIDE/
