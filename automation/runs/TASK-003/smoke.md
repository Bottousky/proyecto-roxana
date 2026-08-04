# TASK-003 — Smoke de visión de Luna vía Go

**Fecha:** 2026-08-03
**Modelo:** `opencode-go/gpt-5.6-luna` (agente `build`, variante por defecto)
**Pool:** `opencode-go` — no consume cuota de ChatGPT
**Ronda:** 1
**Estado:** parcial — pass 1 de 2 del scope

---

## Mecanismo de adjunto

**Funciona por CLI**, con el mensaje **antes** de las flags:

```bash
opencode run "<prompt>" --model opencode-go/gpt-5.6-luna --file <ruta.png>
```

**No funciona** con `--file` antes del mensaje. `opencode run --help` confirma por qué: `--file` es
`[array]` y `message` es un posicional variádico `[array]`, así que `--file <ruta> "prompt"` mete el
prompt dentro de `--file` y falla con `Error: File not found: <el prompt entero>`.

No se probó el TUI: no hizo falta.

## Pass 1 — descripción de una imagen

**Entrada:** `docs/agent-runs/ohmdal-arc1-serial-v1/evidence/ARC1-007/desktop-1440x900.png`
**Prompt:** describir la imagen y nombrar tres elementos concretos del encuadre y dónde están.

**Salida del modelo (literal):**

> Veo una escena 3D isométrica de un taller al atardecer:
> 1. **Panel de controles** en la esquina superior izquierda, con opciones de cámara, estudiante,
>    personaje Ohm y pausa.
> 2. **Dos personajes low-poly** en la zona central: uno con cabeza amarilla frente al banco y otro
>    sentado o de pie junto a él.
> 3. **Panel "Diagnóstico protegido de Lumen"** en la esquina inferior derecha, mostrando el estado
>    `deenergized_isolated`.

## Contraste contra la captura real

Verificado abriendo el PNG, no aceptando la descripción.

| Afirmación | Veredicto | Detalle |
|---|---|---|
| escena isométrica de un taller al atardecer | **correcto** | es el Taller de Lumen; el HUD dice `afternoon` y el botón `Crepúsculo` |
| panel con Cámara / Estudiante / Ohm / pausa | **contenido exacto** | los cuatro controles existen y están rotulados así |
| …"en la esquina superior izquierda" | **impreciso** | es una barra superior que ocupa ~68 % del ancho, no un panel de esquina |
| dos personajes low-poly en zona central | **correcto** | dos figuras, ubicación correcta |
| …"uno con cabeza amarilla" | **incorrecto** | la esfera dorada no es una cabeza: es **Ohm**, el sprite del compañero. Interpretación visualmente razonable, semánticamente equivocada |
| …"frente al banco" | **correcto** | la superficie oscura elevada es el banco |
| "Diagnóstico protegido de Lumen", esquina inferior derecha | **exacto** | título literal y posición correctos |
| estado `deenergized_isolated` | **exacto y verificable** | el string existe en `src/labs/ohmdal-hd2d-preprod/education/bitacoraModel.ts:10` |

**Omisión relevante:** no mencionó el panel de métricas inferior izquierdo
—`17 llamadas · 412 triángulos · ruta 4/10`—, que es justamente el dato que un reviewer visual
necesita leer para verificar presupuesto. Se le pidieron tres elementos y dio tres, así que no
incumple el pedido; queda anotado como límite observado, no como fallo.

## Qué queda demostrado y qué no

**Demostrado:** Luna vía Go **recibe y lee imágenes**. La lectura de dos strings de UI que sólo
existen dentro del PNG —`deenergized_isolated` y «Diagnóstico protegido de Lumen»— descarta que esté
infiriendo desde el nombre del archivo o desde el contexto del repositorio. No es alucinación.

**No demostrado todavía:** precisión **geométrica**. Las dos imprecisiones de este pass —ubicación
del panel y confusión de Ohm con una cabeza— son de proporción y de identidad de forma, que es
exactamente lo que `img2threejs` compara pass por pass. Un modelo que ve *qué* hay pero no *dónde ni
de qué tamaño* sirve para leer un HUD y no para verificar una silueta.

Eso lo decide el pass 2.

## Pass 2 — comparación desktop vs mobile

Dos imágenes en la misma llamada. `--file` acepta varias rutas seguidas cuando van al final.

```bash
opencode run "<prompt>" --model opencode-go/gpt-5.6-luna \
  --file .../ARC1-007/desktop-1440x900.png --file .../ARC1-007/mobile-390x844.png
```

Contrastado contra `evidence/ARC1-004/hud-rects.json`, que tiene los rects medidos por
`getBoundingClientRect()` en los dos viewports. Porcentajes relativos a cada viewport.

| Afirmación de Luna | Medición | Veredicto |
|---|---|---|
| HUD superior: barra baja en desktop → panel alto de varias filas en mobile | `topbar` 67,4 % × 10,6 % → **94,9 % × 19,9 %** | **correcto**, casi el doble de alto |
| Diagnóstico: pequeño abajo a la derecha → mucho más ancho y centrado, parte inferior central | `diagnosis` 22,9 % ancho en `x=1098` → **95,9 % ancho en `x=8`**, `y=583` de 844 (69 % del alto) | **correcto**; «mucho más grande» es exacto en ancho relativo (4,2×), impreciso en absoluto: el alto es idéntico, 119 px en los dos |
| **Controles: sólo aparecen en mobile, agrupados abajo a la derecha** | `touch` **existe únicamente en mobile**, 134×134 en `x=244, y=702` — derecha, abajo | **correcto y exacto** |
| Cámara más cerrada en mobile; personajes relativamente más grandes y algo más abajo | figura del estudiante ≈ 6,3 % del ancho en desktop → ≈ 12,8 % en mobile; centro vertical 44 % → 49 % | **correcto**; consistente con `CP-012` («la cámara mobile amplía el alto visible en vez de estirar») |
| Lumen más cerca del borde derecho | 67 % del ancho → 82 % | **correcto** |
| Desktop muestra más espacio vacío a la izquierda | franja libre 73,8 % → 48,0 % | **correcto** |
| Panel informativo inferior: más ancho **y más alto**, **desplazándose hacia el centro** | `hud` 390×75 en `x=12` → **272×66 en `x=12`** | **parcialmente incorrecto**: más ancho sólo en relativo (27,1 % → 69,7 %); en absoluto es **más angosto y más bajo**, y el ancla `x=12` **no se mueve** |

**Diferencias inventadas: ninguna.** Todo lo que nombró existe en los rects medidos.

**Omisión:** no nombró la consecuencia agregada — la franja libre cae de 73,8 % a 48,0 %, que es
exactamente el incumplimiento que `CP-012` cuantifica contra el 60,1 % de contrato. Describió los
tres síntomas sin sumarlos. Razonable: no se le dio `SHOT_DECK.md`.

## Veredicto

`vision` en `opencode-go/gpt-5.6-luna`: **PASS**.

Seis de siete afirmaciones verificadas contra medición. Cero diferencias inventadas. Detectó
**presencia/ausencia** de un elemento —el D-pad, que sólo existe en mobile— que es el hallazgo más
difícil de esta clase y justo el que `CP-012` levantó a mano.

**Límite observado, y es el que gobierna cómo se usa:** acierta **tendencias relativas** y falla
**magnitudes absolutas**. Dijo que el panel inferior es «más alto» cuando es más bajo (75 → 66 px) y
que «se desplaza hacia el centro» cuando su ancla no se mueve. Confundió *ocupa más proporción del
viewport* con *es más grande*.

**Consecuencia operativa:** Luna sirve para juzgar composición, layout, presencia y dirección del
cambio. **No** para afirmar una magnitud sin medirla. Un pass de `img2threejs` puede aceptar su
juicio sobre silueta y proporción relativa; no puede aceptar un número suyo como medición. Eso ya lo
cubre la skill, que exige comparar contra la referencia y falla el pass si un rasgo identitario está
mal — pero conviene que quede escrito.

## Estado del routing

- `capabilities.vision.verified` → `true`.
- `proc3d-worker.smokeStatus` → `pass`, con la nota de magnitudes absolutas.
- `reviewer-visual`: el candidato primario sigue siendo `mimo-v2.5-pro` y **no** tiene smoke. Luna
  queda demostrado como su fallback real.

**El hueco que dejaba Claude está cerrado.** `img2threejs` tiene pipeline en Go sin tocar la cuota de
ChatGPT.

---

# Pass 3 — `opencode/mimo-v2.5-free`, coste cero

**Motivo.** Observación del Director: Luna es de lo más caro del catálogo de Go y gastar la ventana
de 5 h en leer un PNG contradice la regla de tasa de quemado del propio `routing.json`. Se separan
dos necesidades que estaban mezcladas:

| Rol | Necesita | Candidato correcto |
|---|---|---|
| `reviewer-visual` | **sólo mirar** | el más barato que vea |
| `proc3d-worker` | **mirar y escribir código en el mismo turno** | multimodal fuerte |

Mismo prompt, mismas dos imágenes que el pass 2. La corrida de Luna quedó puntuada contra medición,
así que este pass es un A/B con respuesta conocida.

## Contraste

| Afirmación de mimo | Medición | Veredicto |
|---|---|---|
| barra superior en una línea → **apilada verticalmente** en mobile | `topbar` 67,4 % × 10,6 % → 94,9 % × **19,9 %** | **correcto**, y «apilada» describe bien la forma |
| **D-pad presente en mobile, inexistente en desktop** | `touch` 134×134 sólo en mobile | **correcto — el hallazgo difícil** |
| diagnóstico: esquina inferior derecha → franja inferior centrada, más grande, tapando el suelo | 22,9 % en `x=1098` → 95,9 % en `x=8` | **correcto**, incluida la oclusión |
| desktop tiene más «aire» a los costados | franja libre 73,8 % → 48,0 % | **correcto** |
| bloque y personajes **más pequeños** en mobile | estudiante **6,3 % → 12,8 %** del ancho | **invertido**: son relativamente **más grandes** |
| etiqueta `Taller · Lumen` **más separada** del borde inferior en mobile «por la presencia del D-pad» | borde inferior: desktop **12 px**, mobile **8 px** | **invertido**: está **más pegada** |
| …y el D-pad la desplaza | `hud` `x` 12–284, `touch` `x` 244–378 → **40 px de solape**, misma línea base `y=836` | **relación equivocada**: no la desplaza, **la pisa** |

Ese solape de 40 px es literalmente `CP-012` —«el D-pad pisa el panel de estado»—. mimo estaba
mirando el lugar exacto del hallazgo conocido y describió la relación al revés. Luna directamente no
mencionó esa pareja.

## Luna vs mimo-free

| | `opencode-go/gpt-5.6-luna` | `opencode/mimo-v2.5-free` |
|---|---|---|
| coste | alto en Go | **cero** |
| barra superior apilada | ✅ | ✅ |
| D-pad sólo en mobile | ✅ | ✅ |
| diagnóstico full-width | ✅ | ✅ |
| aire lateral en desktop | ✅ | ✅ |
| escala de personajes | ✅ más grandes | ❌ dice más pequeños |
| panel inferior | ❌ «más alto», «se desplaza» | ❌ «más separada del borde» |
| solape D-pad ↔ hud (`CP-012`) | no lo mencionó | ❌ al revés |

**Los dos aciertan lo mismo: layout y presencia. Los dos fallan lo mismo: magnitud y dirección
relativa.** mimo falla un poco más y con un vicio propio: **deduce en vez de mirar**. Su error de
escala viene con justificación —«como el marco útil se reduce, los personajes se ven más pequeños»—
que es un razonamiento plausible y una conclusión falsa. Eso es más peligroso que decir «no sé».

## Veredicto

**`reviewer-visual` pasa a coste cero.** `opencode/mimo-v2.5-free` detecta cambios de layout,
reflow y presencia/ausencia, que es el grueso del QA visual. No hace falta Go para eso.

**Gate duro, para los dos modelos:** ningún veredicto de **escala, proporción o distancia** vale como
evidencia. Se mide con `getBoundingClientRect()` o lo mira un humano. Un modelo que invierte la
dirección de un cambio de tamaño y la justifica no es una fuente de números.

**Matiz sobre el PASS del pass 2.** `img2threejs` compara **silueta y proporción** pass por pass, que
es justo el modo de fallo compartido. El PASS de Luna sigue en pie —la skill compara contra una
referencia concreta, no en abstracto, y falla el pass si un rasgo identitario está mal— pero la
confianza baja: el primer prop que se reconstruya necesita verificación humana de proporción, no
sólo el veredicto del modelo.
