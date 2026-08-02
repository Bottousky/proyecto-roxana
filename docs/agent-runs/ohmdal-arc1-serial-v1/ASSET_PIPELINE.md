# Pipeline de assets del Arco I

**Estado:** contrato; generación e integración no autorizadas por este archivo.

## Orden obligatorio

1. función jugable/narrativa y ticket activo;
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
| Arquitectura, hard-surface, puertas, mecanismos | modular/procedural o `img2threejs` |
| Humanos | pixel art de cuatro direcciones aprobado en H2 |
| Ohm | sprite aprobado en H2 |
| Props repetidos/vegetación | módulos, atlas e instancing |
| Concept, retrato, Bitácora, textura 2D | autoría o GPT ImageCreate con procedencia |
| Orgánico/hero irregular | Meshy sólo con aprobación, balance y presupuesto |
| Pieza mecánica funcional | CAD paramétrico; IA sólo concepto/carcasa |

No generar escenas/regiones como una malla única. No reabrir 8 direcciones u Ohm 3D sin una falla
observable nueva y decisión del Director.

## GPT ImageCreate

Usar después de cerrar blockout, cámara y composición. Conservar imagen fuente, prompt, fecha,
proveedor, selección humana y manifest. Un builder de OpenCode habilitado puede procesar atlas,
formatos, materiales e integración, pero no elige la identidad final ni declara una imagen como
geometría. Kimi sólo puede entrar al routing cuando el CLI reporte un ID real y pase el smoke.

## Presupuesto inicial

| Métrica | Mobile | Desktop |
|---|---:|---:|
| FPS | 45–60; piso 30 | 60 |
| DPR | ≤1,5 | ≤2 |
| Draw calls | <150 | <250 |
| Triángulos visibles | 150k–300k | 400k–700k |
| Luces con sombra | 0–1 | 1 principal |

Medir `renderer.info`, peso transferido y los cinco assets principales. Meshy y generación paga
mantienen presupuesto cero hasta una decisión registrada en `DECISIONS.md` y `tasks.json`.
