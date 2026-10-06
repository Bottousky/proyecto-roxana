# Iteración 11 — el tirón de 250 ms por minuto (A25): diagnóstico

**Resultado:** el tirón no viene del juego.

1. **La telemetría lo ocultaba.** Registraba el dt de la simulación ya limitado a 0,25 s, así que cualquier pausa figuraba como «250 ms».
   - Ahora `main.js` registra el intervalo real entre cuadros y, aparte, el tiempo de CPU que el cuadro pasó en el código del juego (`__physica.works()`, `__physica.longFrames`).
   - Medido así (`scripts/resistencia.mjs`, 2 × 60 s en la cascada), las pausas son de **266–317 ms**, una o dos por minuto.
2. **El juego no está ocupado en esas pausas.** En el cuadro anterior, el trabajo es de 2,3–3,4 ms, y el máximo de toda la minuto, 5,4 ms.
3. **Traza de Chrome** (`scripts/traza-tirones.mjs`, 60 s) durante una pausa de 367 ms:
   - el hilo principal de la página está **vacío**;
   - el proceso de la GPU pasa 363 ms en `SwapBuffers` → `IOSurfaceImageBacking::WaitForCommandsToBeScheduled`, esperando a que macOS (Metal) programe los comandos al presentar el cuadro.
4. **Control** (`scripts/control-webgl.mjs`): una página con nada más que un bucle WebGL mínimo (un triángulo por cuadro), medida igual, muestra **la misma pausa**: 317 ms y 283 ms, una por minuto, con carga de 1,6–2,0.

**Conclusión:** la pausa está en Chrome headless, la GPU o el sistema operativo de esta máquina, no en la carga del juego. A25 cambia de «tirón sin identificar» a «pausa del entorno, medida con control».

**Sin verificar:** si pasa igual en un Chrome con ventana o en otra máquina. Para eso hace falta una prueba en un navegador real, que no es headless.

**Pruebas:** 52/52; build sin errores. La simulación no cambió; sólo la telemetría.
