# Referencias y límites legales — Arco I

**Es el único criterio del proyecto que no admite un aprobado raspando.** Identidad propia y
límites legales se cumplen enteros o no se cumplen.

---

## 1. Regla única

*Dragon Quest III HD-2D Remake* se usa como **referencia de dirección y proceso**. De la referencia
se toman cualidades descritas con palabras: diorama, profundidad, contraste 2D/3D, atmósfera,
tratamiento de escala y ritmo.

**No se toma ningún activo.** Ni píxeles, ni geometría, ni audio, ni texto.

## 2. Prohibido — sin excepción

| Categoría | Detalle |
|---|---|
| Assets | texturas, sprites, modelos, atlas, tilesets, fuentes |
| Audio | música, motivos, efectos, voces |
| UI | marcos, tipografía, iconografía, disposición de menús |
| Mundo | mapas, plantas, composiciones de escena |
| Personajes | diseños, siluetas, paletas de vocación, retratos |
| Derivados | extraer frames de video o capturas para generar assets |
| Entrenamiento | usar material de la referencia como entrada de generación de imagen |

No se redistribuye material de la referencia dentro del repositorio ni del build.

## 3. Permitido

- observar el material oficial y **describir por escrito** la cualidad observada;
- citar entrevistas oficiales con URL, fecha y finalidad crítica;
- enlazar a fuentes oficiales en documentación interna;
- comparar por texto: «el nuestro tiene menos contraste de foreground que la referencia».

Una captura de la referencia usada en análisis debe registrar **URL, fecha y finalidad crítica**, y
no se versiona junto a los assets del juego.

## 4. Fuentes oficiales registradas

Congeladas para el Arco I. Agregar una fuente requiere anotarla acá con fecha.

| # | Fuente | Uso |
|---|---|---|
| 1 | [Entrevista con Masaaki Hayasaka — PlayStation Blog](https://blog.playstation.com/?p=398105) | HD-2D no es plantilla única; expresión propia por título |
| 2 | [Entrevista de Square Enix en Xbox Wire](https://news.xbox.com/en-us/2024/11/14/dragon-quest-iii-hd-2d-remake-how-square-enix-recreated-a-modern-classic/) | escala, densidad y ritmo; iteración con pruebas internas |
| 3 | [Página oficial del juego](https://dragonquest.square-enix-games.com/games/en-us/dragon-quest-3-hd2d-remake/) | lenguaje visual general |
| 4 | [Ficha oficial: ARTDINK y SQEX Team Asano](https://na.store.square-enix-games.com/dragon-quest-iii-hd2d-remake) | atribución de producción |
| 5 | [Presentación de composición 3D+2D+luz](https://blog.playstation.com/?p=397287) | relación entre capas |
| 6 | [Video oficial «Reimagining the World»](https://www.youtube.com/watch?v=s5xhgCxT2oE) | tratamiento de mundo |
| 7 | [Video oficial «Reimagining the Characters»](https://www.youtube.com/watch?v=F39YXRRUHIU) | tratamiento de personajes |
| 8 | [Aviso oficial de actualización y traversal](https://www.square-enix-games.com/en_US/documents/dragon-quest-iii-hd-2d-remake-update-notice) | traversal y UX como trabajo post-pulido |
| 9 | [Opciones de gráficos/frame rate sin cambios de contenido](https://www.square-enix-games.com/en_US/documents/differences-between-the-nintendo-switch-2-version-and-the-nintendo-switch-version-of-dragon-quest-i-and-ii-hd-2d-remake) | separar contenido de calidad técnica |
| 10 | [Reglas oficiales de uso de materiales](https://www.square-enix-games.com/en_GB/documents/dragon-quest-iii-hd-2d-remake-materials-usage-guidelines) | **límite legal declarado por el titular** |

La fuente 10 es la que gobierna: ante duda, se sigue lo que el titular publica, no lo que sea
conveniente.

## 5. Procedencia de los assets propios

Todo asset que entre al Arco I registra en su manifest:

1. origen: autoría propia, procedural en motor, o generación con proveedor declarado;
2. si hubo generación: proveedor, prompt, fecha e imagen fuente conservada;
3. selección humana explícita —una IA no elige la identidad final—;
4. licencia y derechos;
5. hash del archivo;
6. presupuesto y coste real.

Un asset sin procedencia completa **no se integra**, aunque se vea bien. Meshy y toda generación paga
mantienen presupuesto **cero**; habilitarlos es una decisión de Manuel, no de quien produce el asset.

## 6. Símbolos técnicos

Los símbolos de circuito, unidades y notación técnica usan el estándar correspondiente y **registran
la norma** que siguen. Un símbolo técnico no es una decisión artística: se cita.

## 7. Verificación

Antes de integrar cualquier asset se comprueba:

- [ ] ningún archivo de la referencia entró al repositorio o al build;
- [ ] todo asset nuevo tiene procedencia completa en su manifest;
- [ ] la UI no reproduce marcos, tipografía ni iconografía de la referencia;
- [ ] las capturas comparativas viven en documentación, con URL y fecha, no en `assets/`;
- [ ] los símbolos técnicos citan su norma.

Un fallo acá bloquea la integración sin importar la calidad visual alcanzada.
