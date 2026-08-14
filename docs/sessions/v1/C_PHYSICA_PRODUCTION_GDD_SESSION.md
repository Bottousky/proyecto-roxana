# SESIÓN C — PHYSICA PRODUCTION GDD
## EXPERIMENTAR como puzzle-platformer físico

**Misión:** conservar las mejores semillas de Physica y rediseñar el gameplay alrededor del cuerpo, la predicción y el experimento.

**Fuente principal:** `02_PHYSICA_GDD_REBOOT_v1.md`  
**Depende de:** Sesión A.

---

# 1. Documentos obligatorios

1. `PHYSICA_VISION_v1.md`
2. `PHYSICA_PLAYER_MOVEMENT_v1.md`
3. `PHYSICA_PHYSICS_INTERACTION_SYSTEM_v1.md`
4. `PHYSICA_PUZZLE_GRAMMAR_v1.md`
5. `PHYSICA_MECHANICS_PROGRESSION_v1.md`
6. `PHYSICA_WORLD_STRUCTURE_v1.md`
7. `PHYSICA_NARRATIVE_BIBLE_v1.md`
8. `PHYSICA_ARC_01_v1.md`
9. `PHYSICA_VERTICAL_SLICE_v1.md`
10. `PHYSICA_PROTOTYPE_EVALUATION_v1.md`

---

# 2. North Star

> Antes de poder escribir una ecuación, el jugador debe haber sentido la relación con su cuerpo, un objeto o una máquina.

Physica no es una colección de simuladores escolares. Es una **aventura física en la que comprender leyes locales permite atravesar un mundo imposible**.

---

# 3. Player fantasy

> Soy explorador de un mundo que parece caprichoso hasta que empiezo a reconocer patrones. Puedo predecir movimiento, aprovechar fuerzas, construir soluciones y hacer que lo imposible se vuelva legible.

---

# 4. Verbo nuclear y loop

**EXPERIMENTAR**

Loop:
**observar → intentar → medir/estimar → modificar → ejecutar → comparar → dominar**

Verbos:
- correr;
- saltar;
- caer;
- agarrar;
- empujar;
- tirar;
- lanzar;
- deslizar;
- balancear;
- acoplar;
- construir;
- medir;
- redirigir.

---

# 5. Locomoción como instrumento científico

El movimiento debe ser excelente incluso sin puzzles.

Variables controlables:
- aceleración;
- velocidad máxima;
- salto;
- coyote time;
- air control;
- masa aparente del personaje;
- interacción con pendientes;
- agarrar objetos.

**Regla:** no buscar realismo literal si perjudica legibilidad. Buscar física consistente con la que el jugador pueda construir intuiciones transferibles.

---

# 6. Capas del sistema físico

## Capa 0 — movimiento
posición, tiempo, velocidad, aceleración.

## Capa 1 — interacción
fuerza, masa, fricción, gravedad.

## Capa 2 — transferencia
impulso, momento, colisiones.

## Capa 3 — energía
potencial, cinética, resortes, péndulos.

## Capa 4 — rotación
torque, palancas, centro de masa.

## Capa 5 — medios
fluidos, presión, flotación.

## Capa 6 — ondas
oscilación, resonancia, sonido.

## Capa 7 — óptica
reflexión, refracción, lentes.

No todo tiene que entrar en el primer juego/arco.

---

# 7. Feedback model

El jugador debe ver y sentir:
- trayectoria;
- deformación;
- velocidad;
- peso relativo;
- sonido de impacto;
- marcas;
- cuerda tensándose;
- objetos vibrando;
- superficies deslizantes;
- indicadores opcionales.

Después aparecen overlays:
- trayectoria fantasma;
- vector;
- cronómetro;
- distancia;
- masa;
- energía.

Los overlays son **instrumentos ganados**, no HUD permanente.

---

# 8. Puzzle Grammar

## F1 — Alcanzar
Usar movimiento propio para llegar.

## F2 — Lanzar
Elegir dirección/velocidad/altura.

## F3 — Transportar
Mover objeto con restricciones.

## F4 — Balancear
Masas, palancas, contrapesos.

## F5 — Deslizar
Pendiente + fricción + timing.

## F6 — Transferir
Colisiones / impulso.

## F7 — Almacenar
Resortes / altura / energía potencial.

## F8 — Estabilizar
Centro de masa / soportes / equilibrio.

## F9 — Construir
Crear puente, rampa, mecanismo o cadena.

## F10 — Redirigir
Cambiar trayectoria / fuerza.

## F11 — Resonancia
Frecuencia / oscilación.

## F12 — Luz
Reflexión / refracción.

---

# 9. Diseño de experimento

Un buen puzzle de Physica debe permitir al menos uno:
- cambiar una variable;
- ejecutar;
- comparar resultado;
- iterar.

Cuando todo se resuelve por timing motor sin comprender el fenómeno, el puzzle se aleja de la identidad.

---

# 10. Reloj / dispositivo legacy

El reloj existente es una buena semilla si se redefine como **instrumento de observación**, no como menú omnisciente.

Puede ganar funciones:
- freeze parcial/replay;
- marcar posiciones;
- medir intervalos;
- comparar trayectorias;
- visualizar vectores después de usarlos intuitivamente.

Su crecimiento puede representar el paso de intuición → medición → modelo.

---

# 11. Lore candidato

Conservar:
- cascada ascendente;
- mundo que funciona aunque sus habitantes no comprendan cómo encajan sus partes;
- estaciones/regiones;
- acompañante modular si aporta gameplay;
- reloj como vínculo con Instituto.

Reformular:
Physica no necesita una explicación fantástica para cada anomalía. Las regiones pueden tener **condiciones iniciales, campos o infraestructuras antiguas** que producen comportamientos coherentes.

Tema:
> Saber que algo ocurre no equivale a comprender qué variables lo gobiernan.

---

# 12. Progression proposal

## Arco I — Movimiento
desplazamiento → velocidad → aceleración → gravedad → fricción.

## Arco II — Fuerzas
masa → fuerza → equilibrio → palancas → torque.

## Arco III — Transferencia
momento → impulso → colisiones → energía.

## Arco IV — Oscilación y medios
resortes → ondas → sonido / fluidos.

## Arco V — Luz
reflexión → refracción → lentes.

---

# 13. Arco I propuesta

### Capítulo 0 — La caída imposible
La cascada sube. El jugador todavía no entiende.

### Capítulo 1 — Llegar antes
Puzzle de velocidad y timing; sin fórmula.

### Capítulo 2 — Lo que cambia
Dos trayectorias con igual distancia pero distinta evolución.

### Capítulo 3 — Peso no es destino
Objetos con masa distinta; empuje y aceleración.

### Capítulo 4 — Superficies
Fricción como propiedad legible.

### Final — Estación cinética
Cadena abierta de movimiento + rampa + objeto + plataforma.

---

# 14. Vertical Slice — 20 a 30 min

1. llegada y cascada;
2. movimiento libre agradable;
3. primer obstáculo que se resuelve por timing/intención;
4. objeto interactivo;
5. primer experimento A/B;
6. reloj gana una medición simple;
7. puzzle que requiere predicción;
8. puzzle integrador con dos soluciones;
9. restauración/cambio del lugar;
10. Bitácora formaliza.

### Debe probar
- ¿moverse es divertido?;
- ¿la física es consistente?;
- ¿el fallo enseña?;
- ¿el jugador experimenta espontáneamente?;
- ¿los instrumentos potencian en vez de resolver?;
- ¿la formalización llega en el momento correcto?

---

# 15. Definition of Done

- locomoción especificada como sistema;
- física estilizada tiene principios claros;
- puzzle grammar cubre al menos 8 familias;
- Arco I tiene una curva de mecánicas;
- reloj y lore están subordinados al gameplay;
- vertical slice y preguntas de prototipo están cerrados.

---

# 16. Prompt de arranque

> Actúa como Lead Game Designer + Physics Systems Designer para Physica. El verbo nuclear es EXPERIMENTAR. No diseñes un “Mario con fórmulas” ni una colección de laboratorios escolares. Diseña un puzzle-platformer 2.5D donde movimiento, fuerzas, materiales y máquinas sean el lenguaje del mundo. Conserva del legacy la cascada ascendente, el reloj/dispositivo y otras ideas solo si refuerzan esta fantasía. Primero el jugador siente y manipula; luego mide; finalmente formaliza. Produce Player Movement, Physics Interaction System, Puzzle Grammar, Mechanics Progression, World Structure, Narrative Bible, Arco I, Vertical Slice y Prototype Evaluation. La física debe ser consistente y legible antes que hiperrealista.
