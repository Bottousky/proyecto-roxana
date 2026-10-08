# ARITHMOS ANIMATION LAB · Estado

**Última actualización**: 2026-10-08, ciclo 25.
**Loop**: `/loop 1m` (cron de sesión). Rama `claude/arithmos-graphic-adventure-065e68`, worktree `arithmos-graphic-adventure-065e68`. Sólo commits locales.

## Ver la vertical slice
`cd experiments/arithmos && npm start` → `http://127.0.0.1:4195/animlab/?test=10&play=1` (clic = sonido) o `?test=10&play=1&interactive=1` (tocar los puntos para contar).

## Cómo retomar
1. Leer este archivo, luego `ARITHMOS_ANIMATION_EXPERIMENTS.md` (último experimento) y `ARITHMOS_ANIMATION_QUALITY_BAR.md`.
2. Laboratorio: `cd experiments/arithmos && npm start` → `http://127.0.0.1:4195/animlab/?test=01&play=1`.
3. Captura: `node scripts/animlab-capture.mjs <test> ../../artifacts/arithmos/animlab/cNN/<nombre> --frames=9 '--crop=x,y,w,h;…'` (siempre carpeta nueva).
4. Curvas: `node scripts/animlab-plot.mjs <probes.json> <png> A.v,B.v`.

## Documentos
`docs/arithmos/animation/`: RESEARCH (incluye la auditoría del motor actual), TECHNIQUE_MATRIX, QUALITY_BAR, VISUAL_LANGUAGE, PIPELINE, EXPERIMENTS, STATE. Enlaces simbólicos en `docs/arithmos/ARITHMOS_ANIMATION_*.md` para los cinco que lee el loop.

## Hecho
- Auditoría del motor actual (RESEARCH §0): el render (presión + compuesto de diente WebGL) es bueno; el tiempo (progreso lineal), el texto (barrido) y la actuación (pose a pose sin superposición) están por debajo del quality bar.
- Laboratorio determinista `experiments/arithmos/animlab/` con tiempo buscable, sondas y métricas sobre el lienzo de presión.
- E01 línea: tres técnicas comparadas; gana B (depósito + plan de mano) en tiempo; textura empata o mejora levemente.
- E02 círculo: `animlab/core/gesture.js` (trazo / tiza apoyada / espera / borrador) cubre lenta, rápida, pausa, aceleración, corrección y borrado; el repaso acumula; ≈ 1 ms por trazo terminado (hay que cachear al integrar). Lección técnica: nunca `destination-out` en el lienzo de presión.
- E03 ecuación: glifos de un trazo (`animlab/core/glyphs.js`) + identidad por símbolo con el «=» como pivote; «x − 3 = 5 → x − 3 + 3 = 5 + 3 → x = 8» causal y legible; el motor actual (fuente + barrido + fundido) muestra fantasmas superpuestos. Recalibradas las levantadas.
- E05 Punto: `animlab/core/blob.js` (segundo orden buscable, deformación de área constante, salto, división con cuello, fusión con la línea). Anticipa, sobrepasa ~6 % y se asienta; 1 → 2 → 4 → 8 → recta.
- R1 (revisión independiente de E03/E05): ninguna llega al mínimo de producción; disposición punto por punto en EXPERIMENTS.
- E09 figura: `animlab/core/actor.js` — pies plantados (0.015 px de deslizamiento), cadera con arranque/frenada, follow-through medido; anticipación mal guionada y siluetas débiles.
- P1 pulido: resueltos los hallazgos aceptados de R1 (deformación ≤ 25 %, borde de Punto en el diente, rastro con forma de glifo, subrayado que une 5 + 3 con el 8, anticipación de señalar). Pendiente: poses con siluetas claras.
- E07 borrado: `animlab/core/eraser.js` — borrador visible con plan de mano, huella de fieltro, neblina sólo donde había tiza (ilegible), polvo que cae.
- E08 cámara: `animlab/core/camera2.js` — van Wijk–Nuij con duración por costo; paneo pico 1.35 vs 3.85 pantallas/s; llega antes de la acción; trauma.
- E10 microescena «¿Cuántos son?» (17 s): personaje + Punto + tiza + cámara + sonido + cambio de representación (7 puntos → marcas → 5 + 2 = 7). Base de la vertical slice. WAV en `artifacts/arithmos/animlab/c09/t10e/score.wav` (sin escuchar).
- E11 poses con silueta (`animlab/core/poses.js`): cada pose trae su orientación; aplicado a E10 (`c10/t10h`): sorpresa de frente, eureka, paso atrás para mirar lo hecho.
- R2 (revisión de E10 t10e): No. Disposición punto por punto; la versión VS1 (`c11/t10j`) resuelve 6 de 8 hallazgos y uno parcial: hilos celestes de correspondencia, entrada desde fuera de cuadro, sin zoom sin causa, anillos celestes imperfectos, rastro de Punto.
- E12: caché de trazos terminados → tiza 0.8 ms/cuadro (antes 4.9); VS1.1 (`c11/t10l`) con hilos que pasan por encima de la Ronda.
- R3 (VS1): No, pero Timing/Actuación/Continuidad/Matemática en N3. **VS2** (`c12/t10p`) corrige su lista mínima y agrega **interacción real**: el jugador toca los puntos (`?interactive=1&play=1`); tocar uno ya contado no suma marca («ya está»). Probado con clics reales (`scripts/animlab-interact.mjs`, `c12/interactive2`).
- VS2.1 (`c13/t10q`): se aleja y mira antes de comprender. **R4: No** (Actuación y Legibilidad N2): correspondencia no trazable a 1×, 5 + 2 sin separación visible, mirada que no lidera, sin señal de toque, negación invisible, blanco de toque chico, Punto parece un octavo punto al final.
- E13 palabras: minúsculas de un trazo (C) ganan a la fuente (A, B): a mitad de escritura la fuente se ve recortada. Falta el alfabeto completo (~60 signos). `ARITHMOS_ANIMATION_MIGRATION.md`: plan de adaptadores con la escala de uso (306 Label, 165 d.draw, 241 d.shot…).
- E13b/E13c: alfabeto de un trazo completo para las etiquetas del juego (minúsculas, mayúsculas usadas, tildes, puntuación, × → ÷ ° < > ↑ ↓ ← √ ≈ % …).
- VS3/VS4 (R4 corregida): cámara que se acerca con causa, Punto que llama al próximo punto, negación con repaso, blanco de toque ≥ 52 px CSS, Punto sobre la cabeza, **llave que une 5 y 2 con el 7 debajo** (sin inclinarse: la cabeza ya no tapa el atado).
- R5 (VS4): No, pero Timing N4 (prov.) y el resto N3. **VS5** (`c15/t10w`): Punto dibuja lazos alrededor de los 5 y los 2 en la Ronda mientras el alumno escribe «5» y «2»; hilos en abanico; polvo en los cruces; poses de mirar con silueta; superposición medida (`c15/eureka.png`). Pendiente: R6.
- R6 → VS6 (lazo de la unión sincronizado con la llave, quietud, retrasos de torso y brazo); E15: figura dibujada con depósito (misma textura que la escritura).
- R7 → VS7 (anticipación y rampa de Punto en los lazos, suelo dentro del plano, hilo que nace de su marca, brazos quietos al retroceder).
- R8 → **VS8** (`c18/t10c`): corregido un error del planificador de movimiento que afectaba a todos los tests (suavizado que subía la velocidad junto a los extremos: 92 000 px/s²; frenadas por curvatura sin límite) → máx. 5000 px/s² medido sobre el plan; en el conteo salteado los puntos se juntan antes de los lazos; hilos atenuados tras la unión. Todos los tests del laboratorio corren sin errores tras el cambio.
- R9: **N3 en todo** (mínimo de producción alcanzado). **VS9** (`c19/t10k`): saltos 3.º/1.º = 0.71, mirada que sigue cada punto, hilo de los lazos a la llave y al 7, comprensión con contramovimiento y sin vaivén; E16 pies plantados (deslizamiento 16.2 → 0.42 px por 1/240 s). Pendiente: R10 (N4 en Timing/Actuación/Matemática).
- R11: No (saltos de Punto sin rampa, cabeza fija al contar, quietud corta). **VS11** (`c22/vs11`): salto en cuatro fases (Δvx/pico ≤ 0.32 por cuadro de 60 Hz), cabeza que sigue cada punto, quietud 0.53 s, nacimiento de Punto con sobrepaso; corregidos además un salto del torso al terminar de caminar, la orientación y aplastamientos en escalón; 0 saltos de posición aislados.
- R12: No (siete hilos ilegibles y atenuados = fundido, pausas cortas, aterrizaje sin oscilación, textura sin medir). **VS12** (`c23/vs12d`): los hilos de cada grupo se juntan en uno al cerrarse su lazo (7 → 2 → + el del 7), sin ninguna opacidad animada; pausas 0.37 s con Punto, tiza y mano quietos; el centro de Punto se hunde al aplastarse; textura medida sobre la presión.
- R13: **N3 en todas las dimensiones**; No a N4 (comprensión sobre pasos, saltos rápidos triangulares). **VS13** (`c24/vs13`): comprensión tras 0.43 s quieto y sin pasos, brazo de «¡ya está!» que ya no atraviesa la cabeza, saltos con crucero y más bajos cuanto más rápidos.
- R14: N3 en todo, **N4 en Timing y Matemática**; Actuación N3 por la mirada. **VS14** (`c25/vs14`): ojos que se leen (hasta 5·k, dentro de la cabeza), pausa del atado de cinco y salto al primer grupo en la tabla, zoom escalonado tras el paso atrás.
- R15: **N4 en Timing, Matemática y Legibilidad**; Actuación N3 (anticipaciones), Textura sin toque medido. **VS15** (`c26/vs15b`): contramovimiento del brazo, Punto posado con inercia, toque/levantada corregidos en el depósito y medidos (1.14 / 0.42).
- **R16: aprobada** (N3 en todo; N4 en Timing, Actuación y Matemática). Benchmark congelado `c26/vs15b`.
- R10: No (salto de Punto, hilo que cruzaba el «2»). **VS10** (`c20/t10a`) corrige ambos; tiempos de marcas verificados con sondas (≤ 0.1 s tras cada aterrizaje).

## Decisión (con evidencia de E01–E10): **B. Reconstrucción parcial**
- **Se conserva**: el compuesto WebGL de presión + diente (`renderer.js`) — es la base de la textura en todas las técnicas ganadoras; el modelo de mundo/escenas, el director asincrónico, la UI, el guardado y el contenido de los 12 capítulos.
- **Se reemplaza, módulo por módulo** (cada uno ya probado en el laboratorio con comparación A/B):
  1. tiempo de dibujo: `d.draw` lineal → plan de mano (`animlab/core/motion.js`, `deposit.js`) — E01, E02;
  2. texto: fuente + barrido → glifos de un trazo + identidad por símbolo (`glyphs.js`) — E03;
  3. Punto: `Dot` + `zip/hop` → `blob.js` (segundo orden, área constante) — E05;
  4. figura: mezcla de poses → `actor.js` (canales superpuestos, pisadas, IK) — E09; **requiere poses nuevas**;
  5. borrado: fundido → `eraser.js` — E07;
  6. cámara: `Camera.go` → `camera2.js` — E08;
  7. sonido de tiza: envolvente fija → partitura desde la línea de tiempo (`score.js`) — E10.
- **Por qué no rebuild**: ningún experimento encontró un límite en la arquitectura de render ni en el mundo; los límites estaban en tiempo y actuación, y son reemplazables detrás de las mismas APIs (`Drawing`, `Label`, `Dot`, `Figure`, `Camera`, `d.draw`). Un rebuild tiraría 12 capítulos de contenido verificado sin ganancia visual medible.
- **Por qué no continuar tal cual**: E03 (fundido con fantasmas), E07 (fundido), E08 (3.85 pantallas/s), E09 (patinaje) muestran defectos de nivel 1 del quality bar que el motor actual no puede corregir con parámetros.
- **Condición para migrar al juego**: que la vertical slice (basada en E10) pase una revisión independiente en nivel ≥ 4 en Timing, Actuación y Matemática; recién entonces se adapta `src/engine` (adaptadores para no reescribir escenas) y se migra un capítulo piloto.

## Siguiente (en orden)
1. **Migración (empieza)**: la slice pasó la revisión independiente R16 (N3 en todo, N4 en Timing/Actuación/Matemática). **Benchmark congelado: `artifacts/arithmos/animlab/c26/vs15b`** (etiqueta local `arithmos-animlab-benchmark-vs15`). **M1 cámara, M2 trazos (+ rasgueo desde el plan) y M3 Label → glifos: hechos detrás de `?anim=2`** (pruebas, A/B, bot y capítulo 1 en tiempo real sin errores). Siguiente: **M4 Punto** (`Dot`, `zip`/`hop` de `acting.js` y las copias locales de `ch1/scenes.js`) con el salto de cuatro fases y `SecondOrder`.
2. Pulido de la slice (no bloqueante, con revisión propia): pendientes D1, D3, D4, E1–E4 de R16 (EXPERIMENTS).
2. ~~Poses nuevas~~ (hecho en E11; pendiente: hombros para encogerse).
3. **Vertical slice** = E10 + poses nuevas + correcciones de R2 + una transformación con deslizamiento y un borrado (E03/E07) + composición final legible. Nivel objetivo 4 en todo.
4. ~~Rendimiento en escritorio~~ (E12: ~1 ms/cuadro con caché). Teléfono real [H].
5. Después: adaptadores en `src/engine` y capítulo piloto (sólo con la slice aprobada).

## Abierto / humano
- Audio: nada certificado (nadie escuchó).
- Teléfono real: rendimiento de B sin medir.
