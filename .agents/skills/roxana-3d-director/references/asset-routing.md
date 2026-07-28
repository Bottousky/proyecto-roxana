# Enrutamiento de assets

## Árbol de decisión

1. Si necesita medidas exactas, pivotes, sockets o partes animables, usar procedural o
   `img2threejs`.
2. Si además es una pieza física funcional, usar CAD paramétrico para la mecánica.
3. Si es orgánica, escultórica o irregular y no exige despiece exacto, usar Meshy.
4. Si se repite muchas veces, preferir módulo procedural e instancing.
5. Si es un personaje visto desde cámara fija, comparar sprite e impostor con GLB.
6. Si es una escena, descomponer en módulos; no generar una malla monolítica.

## Casos Roxana

| Caso | Ruta primaria | Evidencia mínima |
|---|---|---|
| Arco, escalera, baranda | procedural / img2threejs | medidas, maniquí, dos ángulos |
| Portal con anillos móviles | procedural / img2threejs | pivotes, sockets, estados |
| Estatua de Roxana | Meshy o img2threejs con multivista | silueta, escala, licencia |
| NPC isométrico secundario | sprite o impostor | atlas, pivote de pies, cámara |
| Vegetación repetida | procedural + instancing | densidad y draw calls |
| Carcasa STEM | Meshy/CAD híbrido | separación estética/mecánica |
| Engranaje o encastre funcional | CAD | tolerancias y prueba física |

## Comparativa A/B

Permitir dos métodos sólo si el manifiesto fija:

- pieza y cámara idénticas;
- tiempo o créditos máximos;
- presupuesto runtime idéntico;
- criterios de fidelidad, editabilidad y reutilización;
- decisión de descarte o archivo al cerrar la prueba.
