# Bitland P0 · Phaser

Candidato independiente de renderer para la metrópolis cenital de Bitland.
Comparte sólo simulación y fixture neutral con Pixi. No es la campaña completa.

Desde esta carpeta: `npm ci`, `npm run dev` (http://127.0.0.1:4312).
Producción: `npm run build`; `npm exec vite preview -- --host 127.0.0.1 --port 4314`.
Phaser 4.1.0 está fijado en su propio lockfile, licencia MIT; no usa Phaser Editor.

Controles: abrir courier, editar tarjetas, ejecutar/step, retroceder, cambiar
sensor y entradas, probar de nuevo y comparar traza. La ruta condicional y el
rodeo permiten resolver el paso cerrado. Arrastrar mueve cámara; la vista global
muestra el encapsulado y el LED exterior. Teclado y touch disponibles.

`metropolis.ts` implementa Scene/Graphics/Containers; `scene.ts` conserva el
diorama anterior. La arquitectura se dibuja al iniciar/cambiar paleta; los 120
vehículos ambientales se reutilizan. Su reloj de presentación no modifica el
estado del juego. Courier, carga, sensor, mensajes, LED y Null leen el core.
Arte procedural original y fuentes del sistema; no assets remotos ni compras.

Dirección, alcance, mediciones y límites de la comparación:
`../../docs/20-worlds/bitland/production/bitland-prototype-evaluation_v1.md`.
