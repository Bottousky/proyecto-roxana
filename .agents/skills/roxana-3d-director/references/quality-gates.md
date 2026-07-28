# Gates de calidad

## Asset

1. Referencia legible y derechos verificados.
2. Escala métrica, frente y pivote definidos.
3. Silueta aprobada antes de textura.
4. Collider simple y sockets declarados.
5. Variantes desktop/mobile o excepción temporal explícita.
6. GLB validado y presupuesto medido.
7. Captura en cámara real y, para volumen importante, dos ángulos adicionales.
8. Manifiesto, coste, licencia y hashes actualizados.

## Escena

Puntuar de 0 a 5. Un fallo obligatorio no se oculta con promedio:

| Categoría | Gate |
|---|---:|
| Composición y cámara | 4 |
| Escala humana | 4 |
| Silueta/arquitectura | 4 |
| Materiales | 4 |
| Iluminación | 4 |
| Microdetalle e identidad | 3 |
| Legibilidad de interacción | 4 |
| Rendimiento mobile | 3 |
| Rendimiento desktop | 4 |
| Estabilidad/tests | 4 |

## Evidencia

- referencia, render actual y comparación lado a lado;
- desktop 1440×900 y mobile 390×844;
- cámara y estado deterministas;
- consola sin errores;
- FPS, frame time cuando esté disponible, draw calls, triángulos, geometrías y texturas;
- diferencias pendientes y siguiente corrección.

## Crítica

Responder:

1. mayor diferencia con la referencia;
2. proporción equivocada;
3. superficie plana o genérica;
4. objeto fuera de estilo o escala;
5. mejora de mayor impacto por coste;
6. amenaza de rendimiento;
7. corrección necesaria antes de ampliar alcance.
