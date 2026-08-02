# Identidad de Ohmdal — congelada

**Estado:** CONGELADA en `ARC1-003`, 2026-08-02
**Base:** `b49b617`
**Cambiarla:** requiere una decisión `CP-0NN` propia; no se altera dentro de un ticket de escena

Doc. 15 de la Biblia registra que en DQIII **la identidad precede al efecto**: el equipo conservó la
paleta viva y los colores funcionales de las vocaciones aun cuando cambió por completo la
representación. Este documento existe para que Ohmdal tenga ese mismo ancla antes de producir arte.

---

## 1. La frase

> Ohmdal es una maqueta viva construida para comprenderse.

Un mundo donde la infraestructura está **detenida, no rota**, y donde entender cómo funciona es
literalmente lo que la vuelve a mover. Comprender no vuelve perfecto el mundo: una región restaurada
conserva sombras, desgaste y zonas sin servicio.

---

## 2. Las seis materias

La gramática de Ohmdal son seis materiales con historia de uso. Todo set del Arco I se construye con
ellos; un set que no se pueda describir con estas seis palabras **no es Ohmdal**.

| Materia | Qué comunica | Regla dura |
|---|---|---|
| **Piedra** | permanencia, erosión, reparación | variación por módulo; nunca ruido uniforme |
| **Cobre** | conducción, oficio, oxidación | `emissive` **sólo** cuando representa estado, nunca decoración |
| **Agua** | infraestructura y atmósfera a la vez | tres estados: detenida, flujo parcial, flujo estable |
| **Cerámica** | aislación, protección, fragilidad | bordes y roturas controlados, no azarosos |
| **Madera** | taller, calor humano, reparación | oficio real; no fantasía medieval genérica |
| **Vidrio** | instrumento, lente, lectura de señal | transparencia presupuestada, no gratuita |

## 3. El tiempo

El slice progresa de **tarde a crepúsculo**. La luz natural pierde protagonismo mientras el sistema
comprendido introduce luz motivada. El crepúsculo no es un filtro de color: es la consecuencia
narrativa de que el mundo empezó a funcionar.

- una sola luz principal con sombra (desktop); 0–1 en mobile;
- las luces de mecanismo son `emissive`/baked o sin sombra;
- exposición y grading **no** esconden falta de contraste.

## 4. Las cuatro regiones y su silueta

Cada región comparte kit pero conserva silueta propia. Un landmark dominante por set.

| Región | Materia dominante | Silueta |
|---|---|---|
| Cuenca de Ohm | piedra clara erosionada + cobre expuesto | Portal, Taller, Puerta/Manantial: tres siluetas distinguibles |
| Castillo de la Red | masa institucional, repetición, lacres | horizontal y repetida; la restauración abre rutas, no la vuelve lujosa |
| Forja y Terrazas | gradiente vertical de calor a agua | vertical; la seguridad se lee en distancia y protección |
| Faro y Lago | vidrio, bronce, agua oscura | ritmo de luz; cierre al crepúsculo/noche |

## 5. Reglas de identidad que son verificables

Estas no son gustos: son criterios que un review puede marcar P0/P1.

1. **El estado eléctrico nunca se comunica sólo por color.** Siempre forma + animación + etiqueta +
   sonido. Un daltónico debe poder jugar.
2. **No se usa electricidad arcana para un circuito DC normal.** Nada de rayos mágicos donde hay
   corriente continua.
3. **El agua no es analogía perfecta de la carga** salvo que la Bitácora declare explícitamente el
   límite de la analogía.
4. **Ninguna región se entrega como malla única.** Módulo, esquina, transición, zócalo, abertura,
   baranda, suelo, decal, conducción y prop repetible.
5. **La densidad se aprueba prop por prop.** Cada uno explica oficio, historia, escala o interacción.
   Clutter para simular calidad es P1.
6. **El reverso invisible no consume presupuesto.** El microdetalle va donde la cámara y la acción lo
   justifican.
7. **La UI no copia marcos, tipografía ni iconografía de Dragon Quest.** DOM nítido, papel/croquis
   propio, margen compatible con texto al 200 %.
8. **El DOF entra moderado y subordinado a la legibilidad.** Doc. 15 registra que el DOF de DQIII fue
   *reducido* tras revisión de dirección porque el desenfoque molestaba. No es firma automática.
9. **Bloom, fog, viñeta y partículas no son firma.** Cada pase se puede apagar y debe justificar
   coste con comparación.
10. **La reducción de calidad nunca recorta escenas ni aprendizaje.** Se bajan efectos, densidad, DPR
    y resolución. El contenido es el mismo en desktop y mobile.

## 6. Qué NO es Ohmdal

Tomado de doc. 15, columna «lo que no se debe imitar»:

- paleta, composición, UI, personajes o mapas de Dragon Quest;
- escala física uniforme o mundo *seamless* por prestigio técnico;
- aprobar una planta por captura estática en vez de jugarla;
- blur, bloom, viñeta o partículas como firma automática;
- evaluar recién al final del arco en vez de por ticket;
- migrar `/jugar` o el save para resolver una escena visual;
- coleccionables o props sin función para inflar duración.

## 7. Relación con la referencia

*Dragon Quest III HD-2D Remake* es la **barra de calidad de proceso**, no una plantilla visual. Doc.
15 es explícito: HD-2D no es una plantilla única y cada título adopta una expresión propia; en DQIII
los fondos ni siquiera siguen la pixelización de *Octopath Traveler*.

Lo que se toma es el **método**: identidad antes que efecto, escala decidida jugando, legibilidad por
encima del manierismo, revisión autoral continua, y espacio nuevo justificado por sistema nuevo.

Lo que no se toma es ningún píxel. Ver [`LEGAL_REFERENCES.md`](LEGAL_REFERENCES.md).

La reserva `CP-011` —si la cámara de Ohmdal alcanza esa barra— sigue abierta y se re-evalúa en
`ARC1-024` y `ARC1-030`.
