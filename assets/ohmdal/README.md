# Arte original de Ohmdal

## `hero-student-sheet-64.png`

Hoja de producción de 24 cuadros generada con la herramienta integrada de imagegen,
procesada localmente para retirar un fondo croma magenta y reducida por vecino más cercano.
Grilla exacta: 6 columnas × 4 filas, cuadros de 64×96 px. Orden: sur, oeste, este, norte.
`hero-student-sheet.png` conserva el máster de alta resolución.

Prompt de producción resumido:

> Estudiante adolescente original para Ohmdal; abrigo académico teal con ribetes de cobre,
> bufanda crema, cabello castaño rojizo, bolso y amuleto eléctrico turquesa. Sprite sheet
> JRPG pixel-art 16-bit, seis cuadros por dirección, sin armas ni semejanza con personajes
> existentes, sobre fondo croma `#ff00ff`.

El personaje es arte original del proyecto. No deriva de los packs CC0 de `assets/vendor/`.

## Animación idle y apoyo

- `hero-student-walk-grounded-64.png`: caminata de producción con las suelas normalizadas a una línea de apoyo común.
- `hero-student-idle-master.png`: maestro del idle generado usando la caminata como referencia de identidad.
- `hero-student-idle-64.png`: reducción inicial del idle, 4 columnas × 4 filas.
- `hero-student-idle-grounded-64.png`: idle final de producción, cuadros de 64×96 px.

El idle se generó con la herramienta integrada de imagegen sobre croma magenta. El pedido fijó cuatro direcciones y cuatro cuadros por dirección, con ambas botas plantadas, respiración sutil, parpadeo y pulso del amuleto. Después se retiró el croma y se normalizó cada dirección para compartir la misma línea de suelo.

## Elenco principal

- `npc-core-atlas-master.png`: maestro direccional de Edda, Lumen, la Consejera y la Forjadora.
- `npc-core-atlas-64.png`: atlas de producción, 4×4 cuadros de 64×96 px; filas por personaje y columnas sur, oeste, este, norte.

El atlas se generó con la herramienta integrada usando al protagonista sólo como referencia de escala y técnica. Todos los diseños son originales de Ohmdal y se extrajeron desde croma magenta antes de alinearlos a una línea común de suelo.

## Retratos de diálogo

- `dialog-portraits-master.png`: atlas maestro 4×3 de doce primeros planos originales.
- `portraits/*.png`: recortes de producción para Estudiante, Edda, Lumen, Preceptor, Consejera, Guardiana, Yesca, Farero, Ohm, Niño, Proyector y Ciudadano.

Los retratos se generaron con imagegen integrado usando la captura aportada sólo como referencia del encuadre corto clásico de RPG; los personajes, la interfaz y la estética son originales de Ohmdal.

## Mapa del mundo

- `world-map-panel.png`: maestro del pergamino técnico de Ohmdal.
- `world-map-panel-1024.png`: fondo optimizado usado por el mapa dinámico.

El panel se generó con imagegen integrado como una carta cartográfica índigo con herrajes de cobre, curvas de nivel y trazas de circuito. El prompt exigió un centro silencioso, sin texto ni símbolos de franquicias, para que el juego dibuje encima rutas, salas visitadas, nombres y posición en tiempo real.
