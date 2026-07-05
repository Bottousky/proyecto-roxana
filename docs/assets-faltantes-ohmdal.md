# Assets faltantes de Ohmdal — prompts GPT listos para copiar

**Uso:** cada pieza tiene su prompt exacto para el imagegen de GPT. Hasta que la imagen
exista, el juego usa como placeholder el prop procedural actual de `visuals.ts` (no hay
pantallas rotas). Al generar: guardar el máster en `assets/ohmdal/`, quitar croma magenta,
reducir a la medida indicada con vecino más cercano (mismo pipeline que el héroe, ver
`assets/ohmdal/README.md`).

**Ancla de estilo común (pegar al inicio de cada prompt):**

> Pixel art 16-bit JRPG, mismo estilo y paleta que el sprite adjunto del estudiante de
> Ohmdal (abrigo teal, ribetes de cobre, crema): tonos teal/cobre/crema, contorno suave,
> sin texto ni símbolos de franquicias, sobre fondo croma #ff00ff.
> (Adjuntar `hero-student-idle-master.png` como referencia de estilo.)

---

## 1. Red de cobre (CRÍTICO — bloquea M2; ningún pack la tiene)

**Archivo destino:** `copper-channels-48.png` (tileset 48 px, grilla ordenada)
**Prompt:**
> [ancla] Tileset top-down de canales de cobre embutidos en adoquín, tile de 48×48 px,
> grilla de 4 columnas × 4 filas en este orden exacto: recta horizontal, recta vertical,
> curva NE, curva NO, curva SE, curva SO, T hacia norte, T hacia sur, T hacia este,
> T hacia oeste, cruce +, terminal (canal que muere en una placa redonda), y 4 tiles vacíos.
> IMPORTANTE: cada canal es un PAR de dos hilos de cobre paralelos separados 8 px
> (ida y retorno), nunca un hilo solo. Estado APAGADO: cobre opaco, pátina verdosa leve.

**Segundo archivo:** `copper-channels-on-48.png`
**Prompt:**
> [ancla] La misma grilla exacta del tileset adjunto de canales de cobre (adjuntar
> `copper-channels-48.png`), pero ENCENDIDA: los dos hilos brillan turquesa eléctrico con
> glow suave, el adoquín alrededor no cambia. Se usará como overlay: fondo transparente
> fuera del brillo, croma #ff00ff.

## 2. Puerta de Ohm (U1 — pieza héroe)

**Archivo:** `puerta-de-ohm-master.png` → producción ~256×320
**Prompt:**
> [ancla] Puerta monumental de piedra y cobre vista frontal top-down JRPG, dos hojas
> talladas con un ojo de cristal central (el «ojo que mide»), canales de cobre en par
> que suben por el marco, 256×320 px aprox. Dos estados lado a lado: cerrada y apagada /
> abierta con el ojo y los canales encendidos turquesa.

## 3. Pedestal de Ohm (U1)

**Archivo:** `pedestal-ohm-master.png` → ~128×160
**Prompt:**
> [ancla] Pedestal circular de piedra tipo fuente técnica antigua, nudo central donde
> convergen cuatro pares de canales de cobre del suelo, 128×160 px. Dos estados lado a
> lado: apagado con pátina / encendido con pulso turquesa débil. Sin figura encima
> (el autómata Ohm es sprite aparte, ya existente).

## 4. Campana de Ohmdal (U1)

**Archivo:** `campana-ohmdal-master.png` → ~96×128
**Prompt:**
> [ancla] Campana de bronce sobre soporte de madera y cobre, terraza de piedra, 96×128 px.
> Dos estados: quieta / tañendo con líneas de vibración y destello cálido.

## 5. Portal al Instituto (U1, spawn del jugador)

**Archivo:** `portal-instituto-master.png` → ~128×192
**Prompt:**
> [ancla] Arco de piedra clara con marco interior de cobre, del que cuelga una cortina de
> luz suave (portal escolar, acogedor, no siniestro), 128×192 px. Dos estados: activo con
> shimmer crema / en reposo.

## 6. Fachada del Taller de Lumen (U1)

**Archivo:** `taller-lumen-fachada-master.png` → ~224×192
**Prompt:**
> [ancla] Fachada de taller medieval de dos aguas con chimenea baja, puerta ancha, ventana
> con luz cálida y cartel colgante SIN texto con símbolo de una piedra/resistor estilizado,
> 224×192 px, integrable sobre tiles de adoquín.

## 7. Nave de la Forja (U3)

**Archivo:** `forja-nave-master.png` → ~288×224
**Prompt:**
> [ancla] Fachada de forja/fundición de piedra oscura y ladrillo, portón industrial,
> dos chimeneas con brasas, canales de cobre en par que entran por el suelo y ENTIBIAN
> (glow ámbar, no turquesa), 288×224 px. Dos estados: tibia-agotada / restaurada con
> fuego parejo.

## 8. Faro del lago (U5)

**Archivo:** `faro-ohmdal-master.png` → ~160×320
**Prompt:**
> [ancla] Faro de piedra clara con anillos de cobre, linterna con lente facetada, sobre
> base rocosa junto a un lago, 160×320 px. Tres estados lado a lado: apagado / cargando
> (glow que crece en la base) / destello pleno con rayos.

## 9. Torre del Reloj (U5)

**Archivo:** `torre-reloj-master.png` → ~144×288
**Prompt:**
> [ancla] Torre de reloj medieval con esfera de cobre y una sola aguja, engranajes
> visibles por una ventana rota, 144×288 px. Dos estados: detenida y oxidada / andando
> con la esfera iluminada crema.

## 10. Muelle y barca (U5 → plaza, cierre)

**Archivo:** `muelle-barca-master.png` → barca ~64×64 + muelle ~192×96
**Prompt:**
> [ancla] Dos elementos separados sobre el mismo lienzo: (a) muelle corto de madera con
> farol de cobre, 192×96 px, top-down; (b) barca de remos con farolito encendido, 64×64 px,
> vista 3/4 desde arriba, apuntando a la derecha.

## 11. Acueducto de las Terrazas (U4)

**Archivo:** `acueducto-terrazas-48.png` (tileset 48 px)
**Prompt:**
> [ancla] Tileset top-down 48×48 de acueducto de piedra con canal de agua Y par de hilos
> de cobre corriendo por el borde: recta horizontal, recta vertical, bajada de escalón
> (agua cayendo un nivel), compuerta de madera, esquinas. Grilla 4×2. Agua turquesa claro
> animable en 2 frames (segunda fila = frame alternativo).

## 12. Sellos del Arco II (mapa de viaje, M7)

**Archivo:** `sellos-arco2-master.png` → 4 iconos ~48×48
**Prompt:**
> [ancla] Cuatro medallones de cobre con cadena y lacre, 48×48 px cada uno, para marcar
> lugares sellados en un mapa: compuerta de esclusa, casa con compuertas, balanza,
> corazón mecánico. Apagados, en pátina, claramente «todavía no».

---

## Registro

| # | Pieza | Generada | Integrada | Placeholder activo |
|---|---|---|---|---|
| 1 | Red de cobre off/on | ☐ | ☐ | rasgos de suelo procedurales |
| 2 | Puerta de Ohm | ☐ | ☐ | prop procedural actual |
| 3 | Pedestal de Ohm | ☐ | ☐ | prop procedural actual |
| 4 | Campana | ☐ | ☐ | prop procedural actual |
| 5 | Portal Instituto | ☐ | ☐ | prop procedural actual |
| 6 | Fachada Taller | ☐ | ☐ | prop procedural actual |
| 7 | Nave Forja | ☐ | ☐ | prop procedural actual |
| 8 | Faro | ☐ | ☐ | prop procedural actual |
| 9 | Torre Reloj | ☐ | ☐ | prop procedural actual |
| 10 | Muelle y barca | ☐ | ☐ | no existe aún en escena |
| 11 | Acueducto | ☐ | ☐ | rasgos de suelo procedurales |
| 12 | Sellos Arco II | ☐ | ☐ | no existe aún (M7) |
