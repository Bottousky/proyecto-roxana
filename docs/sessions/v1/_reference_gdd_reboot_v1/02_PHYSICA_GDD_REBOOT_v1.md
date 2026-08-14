# PROYECTO ROXANA — PHYSICA
## Game Design Document · Reboot v1.0 DRAFT

**Disciplina:** Física  
**Verbo rector:** EXPERIMENTAR  
**Género:** puzzle-platformer físico 2.5D  
**Estado:** reboot sobre la base del GDD v0.2; muchas piezas anteriores siguen siendo valiosas, pero el juego debe priorizar manipulación física y variedad sistémica.

---

## 1. Resumen ejecutivo

Physica es una naturaleza experimental donde las condiciones físicas pueden aislarse, amplificarse o entrar en conflicto. No es un planeta mágico arbitrario: cada anomalía tiene una causa modelable.

La imagen fundacional se conserva: **una cascada asciende hacia el cielo mientras otros objetos caen normalmente**.

El jugador atraviesa paisajes imposibles usando movimiento, fuerzas, objetos, mecanismos, energía y medición. Las fórmulas no son llave de una puerta: describen fenómenos que el jugador ya sintió con el cuerpo.

### Fantasía
Ser explorador y experimentador dentro de un laboratorio a escala de mundo.

### Promesa
Cada capítulo entrega un nuevo juguete físico.

---

## 2. Canon heredado que se conserva

### CANON CANDIDATO
- acceso por Aula de Física;
- reloj-dispositivo analógico como instrumento principal;
- mesa experimental/atómica como mecanismo de acceso;
- cascada ascendente como hito visual;
- mundo construido o intervenido por docentes del Instituto;
- pérdida de comprensión por superposición de configuraciones;
- ausencia de villano tradicional;
- Bitácora posterior a la experiencia;
- acompañante instrumental modular;
- metrópolis como promesa de expansión.

### LEGACY A REVISAR
- que el primer arco sea excesivamente conceptual y poco juguetón;
- limitar la física a cuatro puzzles «demostrativos»;
- demasiado énfasis inicial en visualizar vectores en vez de disfrutar el movimiento;
- concebir la metrópolis como salto de género hacia 3D libre antes de validar el plataformero;
- intentar una simulación universal.

---

## 3. Premisa narrativa

Physica fue utilizado para alterar condiciones, aislar variables y construir situaciones imposibles de reproducir de forma segura en un aula real. Con décadas de intervenciones, calibraciones y experimentos, distintas regiones quedaron obedeciendo configuraciones incompatibles.

El mundo no está roto porque «la física dejó de funcionar».

> Physica funciona demasiado bien: cada zona sigue obedeciendo reglas que ya nadie recuerda haber configurado.

### Tema
Comprender un fenómeno exige declarar qué se observa, qué interactúa y qué condiciones están presentes.

---

## 4. Género

Puzzle-platformer físico con escenario 3D y cámara lateral controlada.

Referencias funcionales de diseño:
- plataformas con legibilidad fuerte;
- físicas como mecánica central;
- contraptions puntuales;
- manipulación de gravedad, impulso, fricción, masas, fluidos, óptica y ondas;
- sandbox acotado por puzzle.

No es un precision platformer punitivo. El desafío está en comprender el sistema, no en ejecutar inputs perfectos durante veinte segundos.

---

## 5. Core loop

**Moverse → encontrar fenómeno → interactuar → observar trayectoria/efecto → medir → cambiar condición → volver a intentar → atravesar → formalizar.**

El movimiento del personaje es ya una herramienta de aprendizaje:
- correr;
- saltar;
- caer;
- deslizarse;
- empujar;
- balancearse;
- lanzar;
- viajar sobre plataformas;
- moverse respecto de otros cuerpos.

---

## 6. Sistemas base

### Locomoción
- caminar/correr;
- salto con arco consistente;
- trepar bajo;
- colgarse/balancearse donde corresponda;
- deslizarse por pendientes;
- plataformas móviles.

### Manipulación
- empujar/arrastrar;
- levantar objetos pequeños;
- lanzar;
- colocar cuñas/apoyos;
- unir elementos simples;
- ajustar masas o superficies en puzzles autorizados.

### Reloj-dispositivo
El reloj no es un panel de cheats. Es una herramienta de lectura y modificación limitada.

Módulos potenciales:
- registrar trayectoria;
- fijar referencia;
- mostrar vectores;
- medir intervalos;
- medir masa/fuerza/velocidad;
- comparar estados;
- activar una alteración local ya comprendida.

### Acompañante
Debe reaccionar, medir y ayudar a externalizar hipótesis sin explicar soluciones.

---

## 7. Gramática de puzzles por fenómeno

### A. Cinemática
- plataformas que comparten movimiento;
- perseguir/interceptar;
- movimiento relativo;
- MRU/MRUV;
- gráficos como reconstrucción posterior de recorridos reales.

### B. Fuerzas
- equilibrio;
- contrapesos;
- poleas;
- fricción;
- planos inclinados;
- resultantes.

### C. Proyectiles
- lanzamientos;
- viento/corrientes;
- tiro oblicuo;
- rebotes controlados;
- elegir posición/ángulo, no hacer una cuenta aislada.

### D. Energía
- resortes;
- péndulos;
- rampas;
- montañas rusas;
- conservación;
- pérdidas por rozamiento.

### E. Momento
- carritos;
- colisiones;
- transferencia de impulso;
- masas diferentes.

### F. Rotación
- engranajes;
- ruedas;
- torque;
- centro de masa;
- equilibrio rotacional.

### G. Fluidos
- flotación;
- presión;
- canales;
- compuertas;
- chorros;
- corrientes.

### H. Ondas y sonido
- resonancia;
- interferencia;
- frecuencia;
- cuerdas;
- tubos;
- torres resonantes.

### I. Óptica
- espejos;
- refracción;
- lentes;
- sombras;
- caminos de luz.

### J. Térmica
- transferencia;
- expansión;
- equilibrio térmico;
- cambios de estado en escenarios controlados.

---

## 8. Arcos propuestos

### ARCO I — MOVIMIENTO
El jugador aprende a describir y predecir movimiento antes de modificar fuerzas complejas.

- referencia;
- posición y desplazamiento;
- velocidad;
- aceleración;
- trayectorias.

### ARCO II — INTERACCIÓN
- fuerzas;
- masa y peso;
- fricción;
- equilibrio;
- planos y poleas.

### ARCO III — ENERGÍA
- trabajo;
- energía cinética/potencial;
- resortes;
- conservación;
- potencia mecánica.

### ARCO IV — IMPULSO Y ROTACIÓN
- colisiones;
- cantidad de movimiento;
- torque;
- máquinas.

### ARCO V — MEDIOS
- fluidos;
- ondas;
- sonido;
- térmica;
- óptica.

---

## 9. Estructura del mundo

Physica puede estar compuesto por regiones conectadas mediante estaciones antiguas.

### El Valle Variable
Naturaleza monumental y reglas locales. Ideal para movimiento y fuerzas.

### La Estación
Infraestructura de observación que conecta regiones y funciona como lugar de síntesis.

### La Metrópolis
No necesita abandonar el juego lateral. Puede usar calles, interiores y recorridos curados en diferentes orientaciones. Su función es mostrar física aplicada: tránsito, ascensores, trenes, resonancia, óptica urbana, fluidos, energía.

### Regiones futuras
- Canteras de masa y fricción;
- Jardines de péndulos;
- Canales de presión;
- Torres de sonido;
- Distrito óptico;
- anillo térmico;
- complejo orbital como contenido avanzado.

---

## 10. Vertical slice reboot

### Objetivo
Probar diversión física antes que currículo.

### Duración
15–20 minutos.

### Secuencia
1. Aula de Física; reloj y mesa.
2. Entrada al Valle; cascada ascendente.
3. Puzzle 1: plataforma móvil y referencia.
4. Puzzle 2: objeto suspendido y equilibrio.
5. Puzzle 3: lanzamiento afectado por corriente lateral.
6. Puzzle 4 integrador: transportar una masa a una estación usando rampa + contrapeso.
7. Activación parcial de estación.
8. vista de Metrópolis.
9. retorno al Instituto.

### Cambio respecto del legacy
El jugador debe pasar más tiempo **moviéndose y jugando** y menos tiempo mirando overlays. Los vectores aparecen cuando ayudan a interpretar un intento, no como protagonista visual permanente.

---

## 11. Diseño de dificultad

La dificultad progresa en tres dimensiones:

1. más variables relevantes;
2. menos andamiaje;
3. soluciones más abiertas.

No aumentar dificultad solo mediante ejecución precisa.

### Ayudas
- primer intento libre;
- replay/ghost de trayectoria;
- comparación entre intentos;
- resaltado de interacción;
- vectorización opcional;
- pista conceptual;
- pista específica solo al final.

---

## 12. Bitácora

La Bitácora registra experimentos reales:

- captura simplificada de trayectoria;
- condiciones iniciales;
- qué cambió;
- observaciones;
- modelo conceptual;
- fórmula opcional;
- desafío para reutilizarlo.

Ejemplo:

**Antes:** «Ambas plataformas se mueven, pero desde una parece que la otra está quieta.»  
**Después:** movimiento relativo y sistema de referencia.  
**Formal:** ecuación opcional y gráfico de la escena jugada.

---

## 13. Dirección artística

- naturaleza monumental;
- materiales estilizados;
- instrumentos analógicos de latón, vidrio, cerámica y madera técnica;
- anomalías legibles sin saturar de VFX;
- física visible mediante polvo, agua, hojas, cuerdas, deformación y movimiento;
- escala del personaje pequeña frente al fenómeno.

La cascada ascendente debe seguir siendo la imagen de marca de Physica.

---

## 14. Audio

El audio debe ser informativo:
- tensión de cuerdas;
- masa de impactos;
- fricción;
- resonancia;
- velocidad;
- presión;
- cambios de material.

Evitar sonidos genéricos de «puzzle correcto» cuando el propio fenómeno puede comunicar éxito.

---

## 15. Accesibilidad

- asistencia de lanzamiento;
- reducción de movimiento/cámara;
- no depender del color para vectores;
- pausa física durante lectura;
- controles remapeables;
- tolerancia ampliada en plataformas;
- sin límite de vidas;
- rebobinado o reset instantáneo de puzzle.

---

## 16. Riesgos

1. intentar simular todo → cada puzzle usa un modelo acotado y verificable;
2. plataforma genérica → cada tramo debe involucrar fenómeno;
3. overlays didácticos invasivos → mostrar datos solo cuando respondan a una duda creada por el juego;
4. cámara 3D perjudica lectura → mantener composiciones curadas;
5. física inconsistente destruye aprendizaje → determinismo y tests por puzzle.

---

## 17. Criterio de éxito

Physica funciona cuando un jugador lo describe como:

> «Un juego de aventuras y puzzles donde la física del escenario es el problema y también la herramienta.»
