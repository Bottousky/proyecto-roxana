# Informe final — Ohmdal HD-2D preproducción v1

**Estado:** `completed-conditional`

**Veredicto:** `avanzar`

**Base:** `12d6f88d2a366da89ed91008013f42ba6295e42d`

**Commit corregido evaluado:** `fd38f292ef93e9fc0f891e1cf1eedec6ecc35afc`

**Ronda final del Evaluador:** `ffc61b4`, integrada como `e8f7bac`

## Decisión

H1 educativo y H2 visual/técnico cumplieron su objetivo de reducir incertidumbre. Se adopta el
pipeline **cámara casi ortográfica + estudiante de 4 direcciones + Ohm sprite**. El Director cierra
el hito con el veredicto `avanzar` porque la segunda ronda corrigió y verificó todos los P1 de
implementación.

El resultado es CONDITIONAL, no PASS absoluto: no hubo acceso a un Android físico medio de 2022.
La emulación y el smoke de frames no se presentan como sustituto de esa medición. No se autoriza
una tercera ronda automática.

## Entregas verificadas

- Seis fichas educativas V2 `CANON-EDU` de exactamente 30 campos para seguridad, circuito,
  instrumento, Lumen, Puerta y Bitácora.
- Cálculos, estados inválidos, topologías, diagnóstico y validación de Bitácora cubiertos por
  tests deterministas.
- Blockout modular en metros de Portal, Plaza, Taller y Puerta/Manantial, con ruta plana,
  encuadres autorales C1–C3 y oclusión que protege sujetos relevantes.
- Harness aislado en `/labs/ohmdal-hd2d-preprod/` con teclado, táctil, reducción de movimiento,
  tarde/crepúsculo, diagnóstico auténtico no bloqueante y `render_game_to_text()`.
- Prototipos originales y manifiestos trazables de 4/8 direcciones y Ohm sprite/procedural; sólo
  4 direcciones y sprite quedan activos.
- Dos rondas del mismo Evaluador: `review-round-01.md` y `review-round-02.md`.

## Corrección entre rondas

La ronda 1 indicó `FAIL — corregir una vez`. La única corrección autorizada resolvió:

1. separación real entre estudiante y pilares en C3, incluso con `blockedIds=[]`;
2. siluetas distinguibles para Portal, Taller y Puerta;
3. diagnóstico bloqueado en Portal y habilitado sólo al llegar al Taller, con Lumen, Ohm y punto
   de medida presentes en la escena;
4. sombra de contacto para Ohm y eliminación de variantes no seleccionadas del runtime activo.

La ronda 2 marcó PASS para los cuatro puntos en desktop y mobile emulado.

## Métricas observadas

| Entorno | Frame smoke | Draw calls | Triángulos | Geometrías | Texturas | Consola |
|---|---:|---:|---:|---:|---:|---:|
| Desktop 1440×900 | 60 fps | 17 | 412 | 28 | 3 | 0/0 |
| Mobile emulado 390×844 | ~59,994 fps | 18 | 388 | 28 | 3 | 0/0 |
| Android físico 2022 | `not-run` | `null` | `null` | `null` | `null` | `null` |

Los 120 deltas `requestAnimationFrame` son un smoke antirregresión del blockout. Los datos completos,
el método y las rutas de capturas con SHA-256 están en `performance.json` y
`review-round-02.md`.

## Gates finales

- `npm run build`: PASS, 185 módulos.
- `npm test`: PASS.
- `npm run 3d:validate-manifests`: PASS.
- `git diff --check`: PASS.
- Diferencias en `src/jugar/**` desde la base: ninguna.
- `npm run verify`: `not-run`, bloqueado por ausencia de una distribución WSL operativa; no se
  declara PASS.

## Commits principales

- Educación: `585c302`, `697d23d`, `42c1262`, `64e0b92`.
- Arquitectura: `b4b15cf`, `f89b75b`, `12f2210`.
- Assets: `1908e67`, `6d3a905`.
- Integración/corrección del Director: `697d23d`, `3b9f98a`, `fd38f29`.
- Evaluación: `329c927` y `ffc61b4`.

## Alcance no autorizado

H3 continúa bloqueado. Este informe no autoriza producir el vertical slice, migrar `/jugar`,
usar Meshy, contratar generación paga, crear regiones completas ni modificar el runtime estable.
El siguiente paso posible es redactar y someter a autorización humana un nuevo contrato H3 que
incluya prueba en Android físico antes de reclamar 30 fps en el dispositivo objetivo.
