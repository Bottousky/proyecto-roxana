# Color script del slice

**Alcance:** golden slice Portal → Plaza → Taller → Puerta → Manantial

**Es una decisión tomada.** No se redefine para que un resultado pase: si una escena no cumple el
color script, se corrige la escena. Cambiarlo es una decisión aparte, y consciente.

---

## 1. Para qué existe

El harness ya implementa dos horas —`afternoon` y `twilight`— con valores concretos. Lo que faltaba
no eran los números: era **la regla que esos números obedecen**.

Sin esa regla escrita, quien produzca materiales, luz, DOF, agua y VFX decidiría el lenguaje de
color sobre la marcha, y cualquier resultado sería defendible a posteriori. Doc. 15
registra que en DQIII **la identidad precede al efecto**: el equipo conservó la paleta viva y los
colores funcionales aun cuando cambió por completo la representación.

Este documento fija tres cosas y nada más:

1. **qué comunica** el paso de tarde a crepúsculo;
2. **dónde** ocurre a lo largo del recorrido;
3. **qué no puede hacer** el color, el `emissive` y el grading.

Lo que **no** fija: los valores destino del arte final. Esos se deciden produciendo el arte.
Ver §8.

---

## 2. Línea base medida — **blockout, no arte final**

Los valores de abajo son los que el harness tiene hoy sobre `b49b617`. Son de **blockout**: sin
texturas (`textureCount: 0`, `blockoutMaterials.ts:106`), con `flatShading` y colores planos. Se
citan porque son medibles y porque ya forman un patrón —no porque sean la paleta definitiva.

### Materiales

Fuente: `src/labs/ohmdal-hd2d-preprod/materials/blockoutMaterials.ts:7-21`.

| Familia | Tarde | Crepúsculo | Δ luma |
|---|---|---|---:|
| `stone` | `0x71685f` | `0x545761` | −32,4 % |
| `copper` | `0x80604a` | `0x685149` | −30,6 % |
| `wood` | `0x59483c` | `0x433d40` | −31,0 % |
| `water` | `0x467987` | `0x376f82` | −17,4 % |
| `glass` | `0x72a6ab` | `0x55aab4` | **+0,6 %** |

### Luces

Fuente: `src/labs/ohmdal-hd2d-preprod/lighting/blockoutLighting.ts:35-96`.

| Luz | Tipo | Tarde | Crepúsculo | Δ intensidad |
|---|---|---|---|---:|
| `LIGHT_WORLD_FILL` | hemisphere | `0xa9bad1` / `0x463d3a`, 1,15 | `0x7189a8` / `0x292b38`, 0,82 | −28,7 % |
| `LIGHT_AFTERNOON_PRINCIPAL` | directional, **única con sombra** | `0xffd2a3`, 2,35 | `0xdf9a87`, 1,65 | −29,8 % |
| `LIGHT_WORKSHOP_LANTERN` | point, sin sombra | `0xffbd76`, 2,10 | `0xffbd76`, 2,10 | **0,0 %** |
| `LIGHT_DOOR_CONDUIT` | point, sin sombra | `0x63dce8`, 1,55 | `0x63dce8`, **2,35** | **+51,6 %** |

HSL, luma relativa WCAG y todas las deltas: [`palette-blockout.json`](palette-blockout.json).
Calculadas, no estimadas.

---

## 3. La regla de intensidad — la luz natural cede, la del sistema entra

Es el enunciado central y ya está medido:

> Al pasar a crepúsculo **toda** luz natural baja, el emisor de oficio se mantiene, y **la única que
> sube es la motivada por el sistema comprendido**.

| Qué | Cuánto | Qué significa |
|---|---:|---|
| Principal (sol) | −29,8 % | la luz que no depende del jugador se retira |
| Fill hemisférico | −28,7 % | el ambiente acompaña, en la misma proporción |
| Linterna del Taller | 0,0 % | el oficio humano no depende de la hora |
| Conducto de la Puerta | **+51,6 %** | lo que el jugador entendió es lo único que gana presencia |

De acá salen dos obligaciones:

1. **El crepúsculo no es un filtro.** Es la consecuencia narrativa de que el mundo empezó a
   funcionar (`IDENTITY.md` §3). Una implementación que lo resuelva con un LUT global o un tinte de
   post-proceso incumple este documento aunque el resultado se parezca.
2. **Ninguna luz nueva puede subir al crepúsculo salvo que represente estado del sistema.** Si una
   escena futura necesita más luz al crepúsculo, la fuente tiene que ser diegética y motivada, y
   entra por `ASSET_PIPELINE.md` con su emisor visible —nunca como relleno para compensar
   exposición.

Se mantiene el techo de `H3_CONTRACT.md` §5: una sola luz con sombra en desktop, 0–1 en mobile. Las
de mecanismo son `emissive`/baked o sin sombra.

---

## 4. La regla de valor — el contraste se ensancha, no se apaga

El riesgo obvio de un crepúsculo es que todo baje junto y la escena se vuelva una mancha. Los
números dicen que acá no pasa, y eso deja de ser suerte para volverse contrato:

| Medición | Tarde | Crepúsculo |
|---|---:|---:|
| Rango de luma entre las 5 familias | 0,267 | **0,291** |

**Obligación:** el rango de luma entre familias **no puede reducirse** al pasar a crepúsculo. Si una
propuesta de materiales lo comprime, se rechaza aunque la paleta guste.

Dos consecuencias que el cálculo hizo explícitas y que antes no estaban escritas en ningún lado:

- **El vidrio es la única familia que no cede** (+0,6 % contra −30 % del resto). Al crepúsculo el
  vidrio pasa a ser el elemento más claro de la escena en términos relativos. Es coherente con la
  materia: vidrio = instrumento, lente, lectura de señal (`IDENTITY.md` §2). Queda como regla: **el
  instrumento nunca se oscurece con el ambiente.**
- **El agua cede la mitad que la piedra** (−17,4 % contra −32,4 %). La infraestructura se lee *más*
  al crepúsculo, no menos. Queda como regla: **agua y vidrio sostienen valor; piedra, cobre y madera
  lo entregan.**

### Deriva de tono — qué es regla y qué es artefacto

La piedra gira de 30,0° a 226,2°: cálido a frío, el mayor giro de la paleta, y es **intencional** —
es el que produce la sensación de hora.

En cambio la madera figura girando a 330,0°, pero su saturación al crepúsculo es 0,047: a esa
saturación el tono es numéricamente inestable y **no significa nada**. No se convierte en regla ni
se replica. Se anota para que nadie lo lea después como decisión de diseño.

---

## 5. Beat map — dónde cambia la hora

Anclajes de `src/labs/ohmdal-hd2d-preprod/architecture/levelData.ts:107-116`. Horas de
`GOLDEN_FRAMES.md` §2: «hora secundaria: crepúsculo, sólo en GF-07 y GF-08».

| Tramo | Anclajes | x | Hora | Mecanismo |
|---|---|---:|---|---|
| Llegada y orientación | `R0_PORTAL_SPAWN` … `R2_PLAZA_DIAGONAL` | −18 → −7,5 | tarde | apagado |
| Umbral y diagnóstico | `R3_TALLER_THRESHOLD` … `R6_TALLER_MEASURE` | −3 → 5 | tarde | apagado |
| Aproximación a la Puerta | `R7_DOOR_APPROACH` | 9,5 | tarde | apagado |
| **Transición** | tramo C2→C3 | **9,5 → 13,5** | tarde → crepúsculo | apagado |
| Medición en la Puerta | `R8_DOOR_MEASURE` | 13,5 | crepúsculo | apagado |
| Cierre | `R9_SPRING_EDGE` | 16,5 | crepúsculo | **restaurado** |

### Tres reglas duras del beat map

1. **La transición está ligada a recorrer, no al reloj.** Se interpola sobre el tramo x ∈ [9,5 ;
   13,5]. No hay temporizador, no hay crossfade global disparado por evento de UI.
2. **No retrocede.** Si el jugador vuelve al Taller después de cruzar, la hora **no** vuelve a
   tarde. El mundo ya cambió; deshacerlo convertiría la consecuencia narrativa en un efecto
   reversible de cámara.
3. **La transición termina antes de `R8_DOOR_MEASURE`.** GF-07 es el primer frame contractual de
   crepúsculo: si al llegar a x = 13,5 la interpolación sigue corriendo, el frame no es
   determinista y su captura no es evidencia (`GOLDEN_FRAMES.md` §2).

El cambio de hora **coincide** con el cambio de anclaje C2→C3, que tiene histéresis de 0,75 m y dura
1,10 s (`GOLDEN_FRAMES.md` §3). Coincide, pero **no se implementa como el mismo disparador**: la
cámara puede rebotar sobre el umbral y la hora no. Ligar ambos haría parpadear el crepúsculo con el
ida y vuelta que GF-06 justamente verifica.

---

## 6. La reserva del cian de estado

`0x63dce8` —el conducto de la Puerta, saturación **0,743**— es el **único** color autorizado para
comunicar estado eléctrico.

| Color | Familia | Saturación | Puede comunicar estado |
|---|---|---:|---|
| `0x63dce8` | `LIGHT_DOOR_CONDUIT` | 0,743 | **sí** |
| `0x55aab4` | `glass`, crepúsculo | 0,388 | no |
| `0x72a6ab` | `glass`, tarde | 0,253 | no |

**Umbral verificable: saturación ≥ 0,60 queda reservada al estado del sistema.** Hoy sólo un color
del slice lo supera, y es el correcto (`palette.json`,
`derived.saturationsAtOrAboveThreshold`). Un material o VFX nuevo que cruce ese umbral sin
representar estado es P1.

El cian de material —la familia `glass`— es cian **desaturado** y nunca comunica estado. La
distancia entre 0,743 y 0,388 es lo que hace que la distinción sea legible y no una sutileza.

Y lo que ya fija `IDENTITY.md` §5.1, que este documento no puede aflojar: **el estado eléctrico
nunca se comunica sólo por color.** Siempre forma + animación + etiqueta + sonido. La reserva del
cian es una restricción *adicional*, no un permiso para depender del color.

---

## 7. Lo que el color no puede hacer

1. **Exposición y grading no esconden falta de contraste** (`IDENTITY.md` §3). Si una escena no se
   lee, se corrige la composición o el valor de los materiales; no la curva.
2. **`emissive` sólo cuando representa estado, nunca decoración** (`IDENTITY.md` §2). Un cobre que
   brilla porque «queda lindo» es P1.
3. **Bloom, fog, viñeta y partículas no son firma** (`IDENTITY.md` §5.9). Cada pase se puede apagar
   y debe justificar su coste con comparación medida.
4. **El DOF entra moderado y subordinado a la legibilidad** (`IDENTITY.md` §5.8). El DOF de DQIII
   fue *reducido* tras revisión de dirección porque molestaba la lectura.
5. **La reducción de calidad no cambia el color script.** En mobile bajan efectos, densidad, DPR y
   resolución; la hora, el beat map y la reserva del cian son idénticos
   (`IDENTITY.md` §5.10).
6. **Restaurar no vuelve perfecto el mundo.** Al crepúsculo con mecanismo restaurado siguen
   existiendo sombras, desgaste y zonas sin servicio. Un Manantial impecable es fallo de identidad
   (`GOLDEN_FRAMES.md` GF-08).

---

## 8. Lo que este documento deliberadamente NO aprueba

- **Los valores de arte final.** Los de §2 son de blockout, sin texturas ni materiales producidos.
  El arte los reemplaza; cuando lo haga, tiene que seguir cumpliendo §3, §4, §5 y §6, y volver a
  medirse contra [`palette-blockout.json`](palette-blockout.json) con el mismo método.
- **La equivalencia con la referencia de DQ III** — sin decidir, ver [`IDENTITY.md`](IDENTITY.md).
- **Cualquier medición de contraste sobre arte producido.** Hoy no existe arte que medir. Las
  mediciones de §4 son sobre colores planos de blockout y se declaran como tales.
- **La accesibilidad de color.** Este documento aporta la restricción, no la verificación: falta
  establecer la línea base sobre arte real.
- **El audio del cambio de hora.** Falta el cue sheet.

---

## 9. Trazabilidad

| Dato | Origen |
|---|---|
| 10 hex de material | `blockoutMaterials.ts:7-21` |
| 4 luces, colores e intensidades | `blockoutLighting.ts:36-96` |
| una sola luz con sombra | `blockoutLighting.ts:42` y `:104`, `diagnostics().shadowLightCount` |
| ausencia de texturas | `blockoutMaterials.ts:106`, `textureCount: 0` |
| anclajes R0…R9 y sus x | `levelData.ts:107-116` |
| umbral C2→C3 en x = 9,5; histéresis 0,75 m; 1,10 s | `GOLDEN_FRAMES.md` §3 |
| horas por frame | `GOLDEN_FRAMES.md` §2 y §4 |
| HSL, luma y deltas | [`palette-blockout.json`](palette-blockout.json) |

Ningún número de este documento fue estimado. El que no se pudo medir no está.
