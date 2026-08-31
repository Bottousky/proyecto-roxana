# Roxana 3D — HERO_REFERENCE_GATE

**Estado:** contrato de producción cross-Roxana.  
**Objetivo:** reproducir la precisión lograda con Ohm: una referencia visual fuerte manda sobre el generador, Blender o el agente.

## Regla

Ningún asset identitario/hero entra a modelado final sin un **Hero Reference Pack** validado.

Hay tres modos válidos:

- `reconstruct`: existe referencia suficientemente fuerte; el agente **reconstruye** y no rediseña.
- `adapt`: existe autoridad visual, pero algunas piezas técnicas/ocultas deben resolverse sin alterar silueta, proporción, paleta o rasgos aprobados.
- `design-approved`: no existe referencia suficiente y el humano autorizó explícitamente diseño agentic. Primero se produce/aprueba concept pack; recién después se modela el asset final.

Si no puede clasificarse en uno de esos modos, **STOP**.

## Golden path: Ohm

Stage 2A demostró el patrón:

```text
assets/ohmdal/characters/ohm-turnaround-v2.png
+ ohm-original-spec.md
+ ohm-sprite-spec.md
        ↓
Hero Reference Pack validado
        ↓
scripts/3d/build_ohm_hero.py
        ↓
Blender 5.2 — reconstrucción determinista
        ↓
candidate preview
        ↓
.blend master local + GLB canonical
        ↓
inspect / validate / calibrate
        ↓
PlayCanvas
        ↓
Visual Harness
```

Resultado comprobado: alta fidelidad de silueta, proporción y color con **0 tareas Meshy/Tripo y 0 texturas**. La precisión vino del reference pack y de no pedirle al agente que inventara el diseño.

Archivos de ejemplo:

- `assets/references/hero-packs/ohm/hero-reference.json`
- `scripts/3d/build_ohm_hero.py`
- `assets/runtime/ohmdal/plaza/heroes/ohm/ohm-pedestal.glb`
- `agent-work/reports/ohmdal-plaza-art-pass-stage-2a.md`

## Contenido mínimo del Hero Reference Pack

### 1. Autoridad visual

Debe existir al menos una referencia primaria que defina la forma. Preferencia:

1. turnaround/multiview aprobado;
2. concept frontal + lateral + trasera;
3. concept único con suficientes anclas geométricas;
4. sprite/icon/mood sólo como apoyo, nunca como única autoridad para reconstrucción precisa salvo asset extremadamente simple.

La referencia primaria debe estar versionada o identificada con una ruta estable.

### 2. Anclas físicas

Definir cuando corresponda:

- altura/ancho/profundidad aproximados;
- unidad: metros;
- frente canónico (`+Z` en Roxana 3D salvo spec explícita);
- `Y-up`;
- pivot/grounding;
- escala relativa a persona/arquitectura;
- partes móviles y pivots futuros.

### 3. Anclas visuales

Registrar únicamente rasgos load-bearing:

- silueta;
- proporciones;
- paleta/materialidad;
- marcas/símbolos aprobados;
- piezas que no pueden desaparecer;
- vistas que deben preservar lectura.

No convertir el pack en una descripción literaria enorme.

### 4. Libertad del agente

Declarar explícitamente:

- `must_preserve`: rasgos que no puede reinterpretar;
- `may_resolve`: zonas técnicas/ocultas donde puede tomar decisiones;
- `forbidden`: invenciones, estilos o efectos que contradicen la referencia/canon.

## Selección de pipeline después del gate

El gate decide **qué construir**, no obliga a una tecnología.

```text
Hero Reference Pack PASS
        ↓
¿forma mecánica/arquitectónica/simple y controlable?
   sí → Blender determinista/procedural primero
   no ↓
¿forma orgánica/escultórica o muy costosa manualmente?
   sí → Meshy/Tripo/img2threejs como candidate generator
        ↓
      Blender canonicalization
```

Reglas:

- `img2threejs`, Meshy o Tripo nunca sustituyen el reference pack.
- Para `reconstruct`, text-to-3D puro no es autoridad de diseño.
- Para image/multiview-to-3D, comparar el candidate contra la misma referencia antes de refine/textura cara.
- Blender sigue siendo el DCC canonical para escala, jerarquía, pivots, cleanup y GLB.

## Preview gate antes del runtime

Antes de integrar, producir un preview reproducible, idealmente 3–4 vistas:

- front;
- 3/4;
- side;
- back si la referencia lo hace importante.

Comparar primero:

1. silueta;
2. proporción;
3. ubicación de rasgos principales;
4. paleta/materiales;
5. partes funcionales.

No aprobar por microdetalle si falla la silueta.

## Runtime gate

Después de canonicalizar:

- `inspect-glb` / bounds reales;
- ground offset = 0 salvo excepción explícita;
- escala y orientación correctas;
- hierarchy/pivots preservados;
- GLB validation sin errores;
- presupuesto de tris/materiales/texturas;
- screenshot en cámara real;
- desktop/mobile si aplica;
- comparación con referencia y con el Visual Harness.

## Procedencia mínima

El asset final debe dejar:

```text
reference pack
+ build/generation route
+ master o script reproducible
+ canonical GLB
+ manifest/provenance
+ preview/screenshot
+ costo/créditos si hubo proveedor
```

## Automatic failures

El Hero Reference Gate falla si:

- el agente empieza un hero sin buscar referencias existentes en el repo;
- existe turnaround aprobado y se ignora en favor de text-to-3D libre;
- el output cambia silueta/paleta/símbolos sin autorización;
- se usa un mood image genérico como autoridad sobre una referencia más fuerte;
- faltan escala/frente/pivot para un asset jugable;
- una pieza móvil se fusiona destructivamente;
- se integra un GLB bruto de proveedor sin canonicalización o evidencia equivalente;
- el agente se autoaprueba sin captura/reference comparison.

## Comando

Cada hero debe tener un JSON machine-readable y pasar:

```bash
npm run 3d:validate-hero-ref -- path/to/hero-reference.json
```

Ohm es el fixture/golden example del CI.
