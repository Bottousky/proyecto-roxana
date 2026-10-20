# Rendimiento antes de las pruebas con personas (2026-10-19)

Medido con `experiments/playcanvas/scripts/medir.mjs` (Playwright + protocolo de DevTools) sobre la
build de producción servida con la ruta del sitio, red 4G emulada (9 Mb/s, 40 ms) para las cargas y
sin emulación para el uso en el mundo. «Antes» es el commit publicado `24872d7b`, armado y servido
igual (`0-antes-mismo-servidor.json`); «después», `8-final.json`. Cada paso intermedio está en
`rendimiento/1-…json` a `7-…json`. Máquina: Mac M2; los números absolutos de CPU serán mayores en
una computadora escolar, las proporciones son las que importan.

## Resultado

| Medida | Antes | Después |
|---|---|---|
| Título del juego listo | 0,87 s | **0,32 s** |
| «Cruzar el Portal» → mundo, tras unos segundos en el título | 15,9 s · 15,1 MB | **3,6 s · 0,09 MB** |
| «Cruzar el Portal» apenas aparece el título | 42,0 s · 37,3 MB | **18,9 s · 18,1 MB** |
| Primera sesión completa (hasta que la red queda quieta) | 28,2 MB | **22,2 MB** (18,0 durante el título + 4,2 después) |
| Escuela (raíz del sitio) | 3,55 MB | **2,59 MB** |
| Recálculos de estilo por segundo en el mundo | 71 | **12** |
| Layouts por segundo, quieto | 4,3 | **0,5** |
| Triángulos por cuadro (Plaza) | 2,09 M | **1,25 M** |
| Dibujos por cuadro (Plaza) | 716 | **675** |
| Heap tras la primera sesión | 175 MB | **119 MB** |
| Hilo principal por cuadro (M2, 60 fps) | 2,9–3,1 ms | 2,7–2,8 ms |

## Qué se hizo (en orden, cada uno medido)

1. **Personajes por lugar y compartidos** (`style.js`, `world.js`): cada modelo 3D y su mapa de
   regiones se bajan y se parsean una vez (antes, una por aparición: el equivalente a un N+1; Edda se
   pedía seis veces). Sólo se espera a la gente del lugar donde se empieza; la de los lugares vecinos
   se precarga en segundo plano. El mundo ya no espera, uno por uno, a los ~25 personajes del arco.
2. **Texturas en WebP** (`scripts/texturas-webp.py`): 11,3 MB de PNG → 2,3 MB. Pintadas con
   pérdida (88; 95 donde 88 bajaba de 38 dB de PSNR); mapas de regiones sin pérdida, comprobados
   byte por byte. `personaje.sh` lo corre solo; los otros generadores lo recuerdan.
3. **Sin hojas de sprites ocultas** (`art.ts`): con gente en 3D, la hoja 2D de cada actor (bajarla y
   recortar 20 cuadros píxel por píxel) sólo se hace si un modelo falla.
4. **El DOM se escribe sólo cuando cambia** (`main.js`, `travel-instrument.js`): cuatro escrituras por
   cuadro (60/s) y el instrumento de viaje (4/s) repetían el mismo valor.
5. **Relieve en baldosas** (`relief.js`): una malla de 272 000 triángulos se dibujaba entera dos veces
   por cuadro; en baldosas de 48×48 celdas se descarta lo que no se ve. **Sombras a 70 m** (antes 100;
   la cámara ve unos 60): sin diferencia visible en la comparación.
6. **El motor después del título** (`main.js`, `style-config.js`): el título ya no espera los 540 kB de
   PlayCanvas; se bajan en segundo plano apenas se muestra.
7. **Precarga durante el título** (`world.js`, `shared-fetch.js`): mientras se lee el título y se
   elige nombre, se baja en paralelo lo que necesita el primer lugar (primero la geometría). La
   escena, la geometría y el relieve se comparten en memoria entre la precarga y la construcción (la
   caché del navegador no conservaba los 8,8 MB de geometría y se bajaban dos veces).
8. **Estatua de Roxana simplificada** (escuela): 73 000 → 25 500 triángulos, 1,28 MB → 0,31 MB; sin
   diferencia visible de frente, de tres cuartos ni en el Patio.

## Lo que no se hizo, y por qué

- **Consultas lentas y N+1 en servidor**: el sitio es estático (GitHub Pages), no hay base de datos.
  Su equivalente en el cliente (pedidos repetidos por personaje) es el punto 1.
- **Sentry**: no está conectado en esta sesión. Agregarlo implica una cuenta y un servicio de
  terceros; queda a decisión del usuario.
- **Caché**: GitHub Pages fija `max-age=600` y no se puede cambiar. Una visita repetida dentro de 10
  minutos baja 0 MB; después, los archivos se revalidan (respuestas 304, sin cuerpo). Un service worker
  ganaría poco y arriesga servir versiones viejas tras publicar: no se agregó.
- **Cuantizar la geometría a 16 bits**: medido, ahorra sólo 0,86 MB comprimidos (gzip ya comprimía
  bien los flotantes) a cambio de tocar el pipeline de exportación. Separar bytes en planos empeora.
- **Fuentes y scripts**: las fuentes son WOFF2 latinas de ~24 kB; el PDF de la Bitácora (750 kB de
  scripts) ya se carga sólo al exportarla.
- La escuela sigue con ~660 ms de tareas largas al armar el campus 3D.

## Verificación

Tests (140 del juego y la escuela, 360 de la raíz), recorrido automático completo y adversario
(9 lugares, 9 secretos), prueba táctil en teléfono emulado: sin errores. Capturas de comparación del
Portal, las Terrazas, el Manantial y el Patio de Roxana, sin diferencias visibles. NO VERIFICADO en
una computadora escolar o un teléfono reales.
