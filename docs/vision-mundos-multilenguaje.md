# Proyecto Roxana — Visión de mundos multilenguaje

**Decisión de dirección (2026-07-01):** cada mundo adopta la forma visual y jugable que mejor
permite comprender su disciplina. No son cinco juegos inconexos: son cinco lenguajes de
experiencia dentro de un mismo Proyecto Roxana.

> La electricidad se recorre. La programación se habita. La física se siente. La matemática
> se contempla. El Instituto las reúne como memoria viva del conocimiento.

## 1. Qué se conserva

Ohmdal no se descarta ni se convierte en una demo heredada. Es el primer mundo formal del
sistema y conserva su dirección actual:

- RPG cenital continuo;
- mundo reactivo que cambia cuando el jugador comprende y repara;
- exploración, personajes, bancos y restauración visible;
- Phaser, `rooms.ts`, `world.ts`, puzzles y progreso ya construidos.

El prólogo cenital del Instituto también se conserva como versión jugable. Sólo se reemplazará
cuando un prototipo de la nueva escuela pruebe ser mejor y viable en web/mobile.

## 2. Un juego, varios runtimes

### Núcleo compartido de Roxana

Debe seguir siendo independiente de la cámara y del render:

- estado, guardado y migraciones;
- Bitácora, conocimiento y conexiones entre conceptos;
- diálogo, objetivos narrativos y progreso;
- audio global, accesibilidad, input remapeable y shell web;
- transición entre Instituto y mundos;
- analítica pedagógica futura.

### Módulos de experiencia

Cada mundo posee:

- un manifiesto: identidad, disciplina, verbo pedagógico y runtime;
- su escena o adaptador gráfico;
- su gramática de input, cámara, colisión y feedback;
- assets y estilos cargados bajo demanda;
- contenido y pruebas propios.

El manifiesto no es una pantalla de selección: es el contrato que evita que las reglas de un
mundo se filtren accidentalmente a otro.

## 3. Los cinco lenguajes

| Experiencia | Disciplina | Verbo | Forma principal |
|---|---|---|---|
| Instituto | mundo real y memoria | reunir | 3D/2.5D controlado, material y realista estilizado |
| Ohmdal | electricidad/electrónica | conectar | RPG cenital reactivo; el mundo conduce y se enciende |
| Bitland | programación | ejecutar | sistema cenital/esquemático; el jugador se vuelve dato |
| Physica | física | sentir | plataformero 2D; las leyes se perciben con el cuerpo |
| Arithmos | matemática | contemplar | aventura audiovisual abstracta, geométrica y cósmica |

La estética debe nacer del verbo. Si una mecánica de Bitland podría trasladarse sin cambios a
Ohmdal, probablemente todavía sea un minijuego genérico y no pensamiento computacional vivido.

## 4. Estructura de código objetivo

```text
src/
  experiences/            manifiestos y registro (iniciado)
    ohmdal/               runtime, mundo, visuales y contenido cenital
    instituto/            adaptador de la escuela; prototipo separado primero
    bitland/
    physica/
    arithmos/
  state.ts                núcleo compartido (se extraerá sin migración masiva)
  ui/                     Bitácora, diálogo y shell compartidos
  content/                conocimiento transversal
  jugar/                  implementación top-down actual; migra gradualmente a Ohmdal
  puzzles/                modelos pedagógicos puros, reutilizables desde cada runtime
```

No se hará una mudanza masiva de archivos. Primero se crean límites y los archivos nuevos nacen
en el lugar correcto; lo existente migra sólo cuando una modificación real lo justifica.

## 5. Secuencia de implementación

1. **Frontera de experiencias [iniciada]:** registro tipado, manifiestos y experiencia activa.
2. **Ohmdal como módulo de referencia:** completar su mundo continuo, identidad visual,
   Bitácora y loop de restauración sin reescribir su motor.
3. **Portal/runtime host:** sacar de `main.ts` el arranque fijo de Phaser y permitir que una
   transición elija y descargue un runtime.
4. **Spike del Instituto:** una sola estancia, un personaje, una puerta y la Bitácora. Comparar
   3D real, 2.5D y fondos renderizados con presupuesto web/mobile. Sin producir la escuela.
5. **Primera vertical completa:** Instituto → Ohmdal → conocimiento → Instituto cambiado.
6. **Segundo lenguaje:** prototipo pequeño de Physica o Bitland para probar que el host no está
   acoplado al top-down. Recién entonces ampliar ese mundo.

## 6. Reglas contra la explosión de alcance

- Un mundo nuevo empieza con una prueba de 5–10 minutos, no con un mapa completo.
- La escuela 3D debe aprobar rendimiento y controles en un dispositivo objetivo antes del arte.
- Los runtimes no duplican guardado, Bitácora, diálogos ni progreso.
- Los modelos de puzzle permanecen puros; cambia su representación, no su verificación.
- Ningún mundo entra en producción completa antes de cerrar el Arco I de Ohmdal.
- La continuidad emocional importa más que la continuidad gráfica: protagonista, Bitácora,
  tono, sonido y consecuencias en el Instituto son el pegamento.

## 7. Primera decisión pendiente

El siguiente experimento no es «hacer la escuela 3D». Es medir una estancia del Instituto con:

- cámara fija o semi-fija;
- movimiento simple;
- una interacción y un diálogo compartido;
- apertura de Bitácora DOM;
- transición hacia el runtime actual de Ohmdal;
- carga, memoria y FPS en desktop y Android objetivo.

La técnica ganadora puede ser 3D real, 2.5D o fondos prerenderizados. La identidad del Instituto
no depende de ganar una batalla de polígonos; depende de sentirse tangible, real y cuidado.
