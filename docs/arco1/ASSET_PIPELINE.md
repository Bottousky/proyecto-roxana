# Pipeline de assets del Arco I

**Estado:** contrato; generación e integración no autorizadas por este archivo.

## Orden obligatorio

1. función jugable o narrativa que el asset tiene que cumplir;
2. referencia, origen, derechos y exclusiones de IP;
3. escala, cámara, footprint, pivote, frente, collider y sockets;
4. blockout y silueta;
5. aprobación humana de forma;
6. material, luz, estados y VFX;
7. variante runtime y optimización;
8. integración en cámara real desktop/mobile;
9. métricas, hashes, manifest y evidencia.

## Routing

| Familia | Ruta primaria |
|---|---|
| Arquitectura, hard-surface, puertas, mecanismos | Blender modular/procedural → GLB |
| Humanos | Blender/GLB según dirección visual aprobada; prototipos previos son referencia |
| Ohm | Blender/GLB o representación aprobada por el slice; no promover un spike por accidente |
| Props repetidos/vegetación | módulos, atlas e instancing |
| Concept, retrato, Bitácora, textura 2D | autoría o `mmx image` con procedencia |
| Orgánico/hero irregular | Blender; generación externa sólo con decisión explícita |
| Pieza mecánica funcional | CAD paramétrico; IA sólo concepto/carcasa |

No generar escenas/regiones como una malla única. No cerrar la representación de
personajes sin evidencia del slice y decisión de Manuel.

## Producción asistida

Usar `mmx` después de cerrar blockout, cámara y composición. Conservar imagen
fuente, prompt, fecha, proveedor, selección humana y manifest. MiniMax puede
producir variantes o procesar medios, pero Codex revisa e integra; una imagen no
se declara geometría ni identidad final por sí sola.

## Presupuesto inicial

| Métrica | Mobile | Desktop |
|---|---:|---:|
| FPS | 45–60; piso 30 | 60 |
| DPR | ≤1,5 | ≤2 |
| Draw calls | <150 | <250 |
| Triángulos visibles | 150k–300k | 400k–700k |
| Luces con sombra | 0–1 | 1 principal |

Medir estadísticas del renderer, peso transferido y los cinco assets principales.
Generación paga requiere una decisión explícita y presupuesto conocido.
