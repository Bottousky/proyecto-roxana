# Contrato visual — instituto-hall-v1

**Estado:** draft; requiere aprobación antes de ejecución

## Intención

Un diorama escolar táctil, legible y lúdico, con interacción espacial clara y acabado artesanal.
Puede tomar principios de portfolios 3D contemporáneos —puesta en escena, respuesta inmediata,
microanimación y sorpresa— sin copiar composición, assets o identidad de un proyecto concreto.

El prototipo `school-voxel` es dirección y evidencia, no arte final.

## Cámara y composición propuestas

- Ruta aislada: `/labs/instituto-hall`, todavía no conectada.
- Cámara: perspectiva oblicua de tres cuartos, encuadre reproducible y movimiento limitado.
- Desktop: lectura completa del hall y una ruta principal inequívoca a 1440×900.
- Mobile: composición reencuadrada a 390×844, sin depender de texto pequeño ni hover.
- Estado: seed fijo, carga completa y misma hora/iluminación en todas las capturas.
- Interacción: cada elemento interactivo debe distinguirse por forma, posición o luz; la UI no
  compensa una arquitectura ilegible.

## Escala

- Unidades en metros, origen en suelo y eje frontal documentado.
- Maniquí humano de 1,72 m durante blockout y revisión.
- Puertas, descansos, barandas y mobiliario se validan en cámara real.

## Materialidad inicial

- Piedra cálida y pálida para masa arquitectónica.
- Madera oscura y cobre envejecido para ritmo y orientación.
- Vidrio polvoriento y papel sólo como acentos.
- Una luz principal con sombras como máximo; luces restantes sin sombra o emisivos controlados.
- Sin bloom para esconder jerarquía o contacto insuficientes.

## Referencias y derechos

- `docs/3d/VISUAL_BIBLE.md` define el lenguaje propio.
- Las referencias externas se usan para principios, no para reconstrucción literal.
- Toda referencia nueva registra URL/origen, autor, función y derecho de uso antes de producir.

## Gates obligatorios

1. Blockout: escala, ruta, cámara y encuadre desktop/mobile.
2. Structure: espesores, vanos, módulos, colisiones y pivotes.
3. Visual-ready: materiales distinguibles, iluminación motivada e identidad suficiente.
4. Integrated: ruta aislada, disposal, consola limpia y comportamiento estable preservado.
5. QA: scorecard de `docs/3d/QA_PROTOCOL.md` y presupuestos de `docs/3d/BUDGETS.md`.

Un FAIL obligatorio no se compensa con promedio.
