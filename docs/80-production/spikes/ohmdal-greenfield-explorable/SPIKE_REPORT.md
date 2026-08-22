# Spike Report: Ohmdal Greenfield Exploration (HD-2D · Outer Wilds · Broken Sword)

**Rama de trabajo:** `explore/ohmdal-hd2d-explorable`  
**Estado:** PROTOTIPO JUGABLE & ARQUITECTURA EXPERIMENTAL VERIFICADA  
**Fecha:** 2026-08-21  

---

## 1. Visión y Premisa

Ohmdal es una civilización medieval que olvidó los principios de la electricidad durante 40 años de aislamiento del Instituto. Lo que antes eran esquemas de circuitos, relés, interruptores y conductores, hoy se percibe como reliquias sagradas, bendiciones, maleficios y rituales supersticiosos.

Este spike explora una solución técnica y artística greenfield (sin Phaser ni restricciones de grillas 2D ortogonales heredadas), integrando las 4 referencias clave solicitadas:

1. **Outer Wilds (Exploración Sistémica e Investigación por Curiosidad):**
   - No hay puertas cerradas por niveles arbitrarios o combate: se avanza comprendiendo la física del mundo.
   - Herramienta de medición diegética (**El Galvanoscopio de Ohm**): permite desplegar puntas de prueba en cualquier nodo del mundo para medir tensión ($\Delta V$), corriente ($I$) y resistencia ($R$) en tiempo real.
   - **Bitácora de Descubrimientos (Rumor Graph)**: red visual interactiva que conecta supersticiones con las leyes físicas reales descubiertas.

2. **Dragon Quest III HD-2D Remake / Octopath Traveler (Estética Diorama 2.5D Viva):**
   - Renderizado en Three.js con cámara inclinada a 48°, iluminación crepuscular dorada cálida y sombras suaves (PCF Soft Shadows).
   - Pipeline de post-procesado con **Tilt-Shift Depth of Field** (foco autoral en el plano jugable con desenfoque de maqueta en primer y segundo plano) y **Bloom** para filamentos y chispas.
   - Conducciones de cobre empotradas en los adoquines con partículas de carga animadas fluyendo en tiempo real cuando el lazo se cierra.
   - Agua cáustica procedural animada con reflejos para la fuente del pueblo.

3. **Broken Sword (Aventura Gráfica e Interacción Táctil de Reliquias):**
   - Navegación fluida tanto por teclado (WASD/flechas) como por clic/táctil con detección contextual.
   - Examen de reliquias en primer plano (**Workbench Modal**): interactuar con el interruptor de cuchilla del relé, limpiar el sulfato de cobre con un cepillo de alambre y colocar barras puente conductoras.
   - Diálogos ricos con retratos de personajes y subtítulos accesibles.

---

## 2. Arquitectura de Módulos

```
src/experiences/ohmdal-plaza/
├── audio/
│   └── soundscape.ts           # Motor de audio Web Audio (hum 50Hz, campanadas, relés, voces)
├── entities/
│   └── actors.ts               # Estudiante, Ohm (hovering con cyclops eye), Edda, Lumen, NPCs
├── inspect/
│   └── workbench.ts            # Modo de inspección de reliquias e interruptores (Broken Sword)
├── journal/
│   └── bitacora.ts             # Grafo de rumores y deducciones (Outer Wilds)
├── rendering/
│   ├── diorama.ts              # Geometría modular 3D, iluminación, partículas y colisiones
│   └── shaders.ts              # Tilt-Shift post-processing y shader de agua cáustica
├── simulation/
│   └── circuitSolver.ts        # Solver eléctrico determinista DC (Kirchhoff / Ley de Ohm)
├── story/
│   └── dialogueData.ts         # Guion narrativo, supersticiones y ramas de conversación
├── tools/
│   └── galvanoscope.ts         # Herramienta de multímetro de doble punta con aguja analógica
├── index.html                  # HUD, overlay del galvanoscopio, modal de bitácora y workbench
├── main.ts                     # Punto de entrada y enlace de eventos
├── palette.ts                  # Paleta de colores canónica de Ohmdal
├── plazaRuntime.ts             # Orquestador del ciclo de vida y loop de juego
├── styles.css                  # Estilos visuales pergamino / cobre
└── types.ts                    # Interfaces de datos
```

---

## 3. Estado de Pruebas y Rendimiento

- **Build:** `npm run build` compila limpiamente sin errores de tipos en TypeScript 5.6 ni Vite 6.
- **Tests unitarios:** 97 suites pasando (incluyendo `tests/hd2d-plaza-greenfield.test.ts`).
- **Rendimiento:** 60 FPS estables con sombras PCF y post-procesado Tilt-Shift en hardware estándar.
