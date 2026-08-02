# Brief — Ohmdal HD-2D preproducción v1

**Estado:** autorizado para ejecutar H1+H2
**Autorización del usuario:** 2026-08-01
**Director:** hilo/control plane principal
**Base común:** `12d6f88d2a366da89ed91008013f42ba6295e42d`
**Ruta de laboratorio:** `/labs/ohmdal-hd2d-preprod/`

## Objetivo

Reducir antes del vertical slice las incertidumbres educativas, visuales y técnicas que podrían
invalidar la dirección HD-2D. El hito entrega fichas V2 reproducibles, un blockout modular
Portal–Plaza–Taller–Puerta–Manantial, una cámara autoral comprobable y comparativas controladas de
sprites 4/8 direcciones y Ohm sprite/3D.

El resultado es evidencia para decidir si H3 puede abrirse. No es una demo pública ni una primera
versión incompleta del juego.

## Hipótesis

1. Circuito completo, medición, diagnóstico de Lumen y transferencia en la Puerta pueden
   formalizarse en V2 con modelos deterministas y sin prácticas inseguras.
2. Un diorama Three.js modular y sprites direccionales pueden compartir escala, suelo, sombra y
   oclusión sin parecer capas desconectadas.
3. Dos o tres encuadres autorales permiten explorar y leer el mecanismo en desktop y mobile.
4. El mínimo entre cuatro y ocho direcciones puede decidirse por evidencia observable.
5. Ohm puede resolverse como sprite o modelo procedural dentro del mismo presupuesto y cámara.
6. El laboratorio puede montar/desmontar recursos sin alterar `/jugar`.

## Alcance

- Fichas de seguridad ficticia, circuito completo, instrumento, diagnóstico, Puerta y Bitácora.
- Tests de cálculos, estados inválidos y órdenes de diagnóstico.
- Blockout métrico con maniquí de 1,72 m y colliders simples.
- Overworld mínimo representativo, sin mapa completo.
- Portal/Plaza, Taller y Puerta/Manantial como volúmenes, no arte terminado.
- Cámara desktop 1440×900 y mobile 390×844.
- A/B 4/8 con el mismo recorrido, seed, cámara y acciones.
- A/B Ohm sprite/procedural con presupuesto equivalente.
- Harness determinista, `render_game_to_text`, controles básicos de prueba y `renderer.info`.
- Capturas y métricas en navegador; Android físico sólo aprueba rendimiento, no se simula.

## Fuera de alcance

- Vertical slice narrativo de 25–35 minutos o contenido H3.
- Modificar, migrar o reescribir `src/jugar/**`.
- Cambiar guardado, modelos pedagógicos estables o el manifiesto de experiencias vigente.
- Texturas finales, voces, música final, región completa o cuatro presets terminados.
- React, R3F, Next.js, Godot, PlayCanvas u otro runtime.
- Meshy, generación paga, hero assets o descarga de material protegido como asset runtime.
- Dashboard docente, backend, cuentas, gamepad o servicios remotos.

## Benchmark de routing autorizado

Antes de implementar se ejecutan exactamente diez propuestas read-only agrupadas en cinco pares:
una ruta Codex y una ruta híbrida para seguridad V2, circuito/instrumento, cámara, sprites 4/8 y
representación de Ohm. Ambos candidatos de cada par reciben el mismo paquete congelado y no pueden
editar el repositorio. Sólo el Director persiste evidencia y elige routing por gates, calidad,
correcciones, integración, tiempo y uso observado, en ese orden.

El benchmark no autoriza H3, `/jugar`, arte final, Meshy, producción masiva, dependencias nuevas ni
créditos API medidos sin tope separado. Su definición de terminado es diez ejecuciones registradas
y una decisión de routing —o bloqueo explícito—; nunca dos pipelines productivos vivos.

## Plataformas y presupuestos

- Chrome, Edge, Firefox y Safari recientes como contrato; smoke automatizado donde el entorno lo
  permita.
- Teclado y táctil para el recorrido de prueba.
- Mobile: ≤150 draw calls, 150k–300k triángulos visibles, DPR ≤1,5, una sombra como máximo.
- Desktop: ≤250 draw calls, 400k–700k triángulos visibles, objetivo 60 fps.
- Piso posterior en Android medio de 2022: 30 fps sostenidos.
- Carga objetivo de la futura slice: ≤25 MB comprimidos; este hito debe informar su peso real.

## Definition of Done

- Las seis fichas educativas alcanzan V2 y un segundo pase reproduce fuentes, cálculos y tests.
- El blockout completo se recorre en desktop y mobile sin tocar `/jugar`.
- Las comparativas 4/8 y Ohm emiten una elección o un bloqueo verificable, no dos pipelines vivos.
- Escala, cámara, navegación, oclusión y puntos de medición alcanzan sus gates.
- `npm run build`, `npm test` y `npm run 3d:validate-manifests` pasan.
- Consola, capturas y métricas quedan registradas; ninguna estimación se presenta como medición.
- Un único Evaluador emite PASS, CONDITIONAL o FAIL.
- El Director registra `avanzar`, `corregir una vez` o `descartar`; H3 permanece bloqueado hasta
  ese veredicto.
