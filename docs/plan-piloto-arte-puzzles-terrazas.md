# Plan de piloto — arte RPG y puzzle diegético de Terrazas

## Objetivo

Validar un lenguaje visual GBA/Nintendo DS para exploración y una transición coherente entre
Phaser y los bancos HTML, sin reescribir modelos de puzzle ni reemplazar assets aprobados.

## Decisión sobre puzzles

Los modelos y controles permanecen en DOM. El DOM aporta foco, teclado, lectores de pantalla,
responsive y controles táctiles; mover todo a canvas aumentaría costo y reduciría claridad sin
volverlo automáticamente más diegético.

La presentación pasa a ser híbrida:

1. Phaser muestra el mecanismo real y el problema visible en la sala.
2. Interactuar abre un primer plano que conserva el mundo vivo detrás, atenuado y desenfocado.
3. El DOM representa piezas físicas del mecanismo, no campos de formulario.
4. La prueba anima agujas, agua y estados dentro del primer plano.
5. Al cerrar, Phaser muestra inmediatamente la consecuencia sobre la sala.

El patrón se aproxima a una pantalla táctil dedicada de aventura: separación funcional como
Professor Layton, pero con causalidad ambiental como Golden Sun o Zelda.

## Alcance

| Entregable | Clase | Estado del piloto |
|---|---|---|
| `terraces_top_base-rpg-v1.png` | base | generado, normalizado y conectado en la rama piloto |
| `terraces_mid_base-rpg-v1.png` | base | generado, normalizado y conectado en la rama piloto |
| `terraces_mural_base-rpg-v1.png` | base | generado, normalizado y conectado en la rama piloto |
| `terraces_aqueduct_base-rpg-v1.png` | base | generado, normalizado y conectado en la rama piloto |
| Banco `Los escalones` | UI diegética DOM | implementado; prueba visual y accesible completada |
| Agua, glow y restauración | engine-state | conservar en Phaser |
| Mural y compuertas | hard-integrated | permanecen horneados en las bases del piloto |

## Gates

1. Las cuatro bases se generan antes de elegir una ganadora individual.
2. Cámara, escala humana y píxel 2× se revisan como conjunto.
3. Ningún import de producción cambia hasta aprobar las cuatro imágenes.
4. El banco debe funcionar con mouse, teclado y viewport móvil.
5. Build, tests de U4 y prueba visual en navegador deben pasar.

## Criterio de éxito

- El jugador se identifica en menos de un segundo y nunca parece una miniatura.
- El recorrido y el mecanismo principal se entienden antes que el paisaje.
- El puzzle se siente como acercarse a una compuerta, no abrir una web externa.
- Resolver altera agua, vegetación o mecanismo en la misma sala.
- El modelo puro, las soluciones alternativas y el texto canon no cambian.
