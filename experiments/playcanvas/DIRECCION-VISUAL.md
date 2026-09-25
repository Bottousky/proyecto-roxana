# Territorio e instalaciones · 19 de septiembre de 2026

La geografía del Arco I ocupa ahora 116 metros de oeste a este. El Portal
queda al sudoeste, la Calzada se acerca al canal oriental, el Manantial vuelve
hacia el centro y el Castillo ocupa la loma occidental. Las Terrazas abren
el viaje hacia el Lago y el espigón dobla hacia el Faro.

Dos senderos secundarios se separan y vuelven a unir al camino principal:
entre Portal y Plaza, y entre Castillo y Terrazas. Son caminos transitables,
con el mismo trazado en el mapa y en las colisiones. No saltan reparaciones
ni agregan destinos ficticios. La progresión narrativa conserva su orden.

Los materiales distinguen piedra fría y vegetación húmeda del Manantial,
piedra gris del Castillo y suelo más cálido de los bancales. Los enlaces
tienen agrupaciones de vegetación, afloramientos de roca y bordes discontinuos.
La vegetación deja libres ambos senderos. El espigón tiene barandas que
siguen la perpendicular de la curva, con separación regular por distancia.

## Leer una instalación desde el escenario

- Los mandos de agua tienen volante; los contactos eléctricos tienen bornes
  cerámicos emparejados. Acoples y frenos siguen siendo mandos mecánicos.
- Alimentación y retorno conservan cobre y azul apagados; sólo emiten cuando
  la simulación registra corriente. Una conexión cerrada sin retorno no brilla.
- Los cables tienen extremos explícitos. El puente de mantenimiento del Faro
  llega a la segunda etapa, aunque la primera esté físicamente más cerca.
- El Lago termina sus dos conductores en bornes visibles de salida a la costa.
- Las tres etapas del Faro tienen marcas I, II y III en sus bases.
- Las luces de los receptores se exportan con su vínculo al circuito: tensión,
  corriente, desconexión y protección modifican su brillo en PlayCanvas.
- La bomba no gira con la corriente residual de la unión averiada. La rueda
  de agua, el acople y el receptor eléctrico mantienen condiciones distintas.
- Los engranajes giran sobre su eje exportado, incluidos los de corona horizontal.
- El movimiento hacia un punto se limita a la distancia que falta, para que
  correr no sobrepase un giro estrecho. La navegación comprueba el terreno
  cada dos centímetros para detectar pequeñas cuñas fuera del sendero junto
  a los empalmes curvos; el regreso del Castillo se prueba a 20, 30 y 60 FPS.

## Revisión y reproducción

Abrir `/scripts/qa-direction.html` con el servidor de desarrollo de PlayCanvas.
Permite comparar instalaciones averiadas, mandos preparados y puesta en servicio;
cambiar la hora; revisar el mapa; y recorrer los catorce cruces de ida y vuelta.
La revisión usa estado en memoria y no lee ni escribe partidas.

Los constructores de geometría continúan en `../../src/`. El exportador
`export-scene.mjs` genera `src/data/scene.json` y `geometry.bin.gz`; el navegador
usa únicamente PlayCanvas. Los módulos compartidos de geografía, mapa y
respuesta eléctrica también están en la instantánea `src/game/`.

```sh
npm run export:world
npm test
npm run check
npm run build
```

Las pruebas nuevas verifican los extremos de los cables, el brillo exportado,
los ejes de los mandos de agua, el umbral de funcionamiento de la bomba,
los catorce enlaces sobre colisiones exportadas, los dos senderos secundarios
y la separación entre los caminos y el canal.

Esta iteración se prepara localmente. La publicación de GitHub Pages es
un paso separado de la compilación.

## Validación final

- 70 pruebas de PlayCanvas y 259 del proyecto fuente aprobadas.
- Comprobación TypeScript/sintaxis y compilación de producción completadas.
- Recorrido en navegador de los catorce cruces, ida y vuelta: suelo seguro
  en todos los cambios y desplazamiento de posición/cámara de 0.000.
- Revisión visual de Plaza, Manantial, Castillo, mapa y etapas del Faro.
- Los dos atascos encontrados durante las vueltas de revisión se corrigieron:
  sobrepaso de puntos al correr y muestreo insuficiente en un borde curvo.
