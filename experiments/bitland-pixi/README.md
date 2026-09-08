# Bitland P0 · Pixi

Prototipo jugable de dirección: metrópolis cenital dentro del microcontrolador.
No es la campaña ni el slice de 24 minutos completo.

Desde esta carpeta: `npm ci`, `npm run dev` (http://127.0.0.1:4311).
Producción: `npm run build`; `npm exec vite preview -- --host 127.0.0.1 --port 4313`.
El paquete instala dependencias propias; no modifica las de otros mundos.

Abrir courier permite cambiar instrucciones. Cerrar el paso corto y ejecutar
la ruta heredada revela un fallo; la instrucción de sensor permite tomar el
rodeo. Step, rewind, trace, variantes de ruta, repetición y entradas periódicas
operan sobre el core determinista compartido. El LED sólo se enciende cuando
el mensaje llega. Arrastrar explora la ciudad; vista global muestra el chip.
Teclado y controles touch no requieren arrastre para resolver.

`metropolis.ts` es la presentación vigente. `world.ts` conserva el renderer del
diorama descartado. El tráfico ambiental es sólo presentación; no es una
simulación de 120 programas urbanos. Todo asset gráfico es código original,
tipografía del sistema y audio sintetizado local. PixiJS 8.20.1: MIT.

La auditoría, alternativas, métricas y gates están en
`../../docs/20-worlds/bitland/production/bitland-prototype-evaluation_v1.md`.
Evidencia generada y videos van en `output/`, fuera de Git.
