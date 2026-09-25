# Colisiones y arquitectura frontal

La navegación, el movimiento manual y el seguimiento de Ohm comparten las reglas
de `src/collision.js`. Cada obstáculo almacena su centro y semianchos; `World.solid`
recibe anchos completos. Las interacciones nunca eliminan sólidos. La exclusión
por proximidad se aplica sólo al colocar vegetación opcional.

El movimiento barre el segmento contra paredes expandidas por el radio del actor,
con contacto estable y deslizamiento. La búsqueda de rutas verifica también el
segmento entre la posición real y su primera celda. Las orillas se comprueban
durante el recorrido, y el lago usa el mismo perfil que su geometría visible.

Se registran edificios y sus apoyos, fuentes, bancos, armarios, estanterías,
hogar del taller, columnas, muros, bancales, cercas, máquinas, controles, rocas y
troncos. Los aleros, cables elevados y umbrales bajos permiten pasar por debajo
o por encima. La puerta de la Calzada retira únicamente su propio sólido al abrirse.

La entrada al taller está frente a su puerta: Plaza `(-16.72, 7.9)` y regreso
`(-16.72, 9.3)`. Los guardados dentro de una estructura se reubican en suelo
cercano válido sin cambiar progreso, conversación o reparaciones. En el
Manantial se separaron fuente y bomba; la inscripción de Terrazas queda fuera
del bancal y los controles de la acequia están en tierra firme.

`src/architecture.js` construye cubiertas cerradas con caras, normales y UV
independientes. Devuelve la huella real del zócalo y de los apoyos en coordenadas
globales. El taller conserva entrada al sur, incorpora porche y emblema de
lámpara, y las casas varían sus cubiertas. La cámara de exploración permanece recta.

## Verificación

- `npm test`: 144 pruebas aprobadas, incluidas 25 de colisión del mundo real y
  tres de geometría de arquitectura.
- Las nueve áreas se construyen con sus escenarios y decoración reales en el
  fixture sin GPU. Un recorrido independiente comprueba todas las interacciones,
  entradas y retornos, tanto antes como después de las reparaciones.
- Se prueban rutas de clic, puerta cerrada/abierta, desplazamientos grandes,
  contacto sin vibración, recuperación de guardados y seguimiento de Ohm.
- `npm run build`: compilación de producción; persiste el aviso de tamaño del
  módulo de Three.js.
- `scripts/qa-collisions.html`: prueba aislada con selección de las nueve zonas,
  huellas visibles, caminar/correr, rutas de clic y recuperación del taller.
  No lee ni escribe partidas. Se revisaron las nueve zonas en el navegador,
  incluida la detención en la pared exterior del taller.
