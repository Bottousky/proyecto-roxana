# Procedencia de los materiales de la Plaza

Los dos materiales que texturan la Plaza de Ohmdal salen de **ambientCG**, bajo
**Creative Commons CC0 1.0 Universal**.

Verificado en <https://docs.ambientcg.com/license/> el 2026-08-06. La licencia dice, textual,
que se puede «copy, modify, distribute and perform the assets, even for commercial purposes»,
que la atribución no es obligatoria, y que se pueden «include the raw files in your project,
for example a video game».

Es lo que `LEGAL_REFERENCES.md` §5 pide poder declarar: origen, derechos, licencia y hash.

## Los dos assets

| Nuestro | Fuente | Método | Página |
|---|---|---|---|
| `plaza-paving` | `PavingStones051` | PBR procedural | <https://ambientcg.com/view?id=PavingStones051> |
| `plaza-stone` | `Bricks066` | PBR procedural | <https://ambientcg.com/view?id=Bricks066> |

Los dos son **procedurales**, no fotogrametría. Fue deliberado: un escaneo fotográfico trae el
grano de una piedra real concreta y compite con los sprites de 64×96 en vez de sostenerlos.

## Qué se les hizo

De cada asset entran **dos mapas de 512×512**, y ninguno es el original:

1. **Grano.** El mapa de color se pasó a luminancia, se multiplicó por su propia oclusión
   ambiental y se le bajó el contraste al 55 %. El resultado es casi gris.
2. **Normal.** El `NormalGL` reescalado, sin más.

El color **no** viene de la textura: lo pone la paleta de `COLOR_SCRIPT.md` a través del color
del material y de los vertex colors que pinta `plazaKit`. La textura multiplica. Por eso el paso
de tarde a crepúsculo sigue siendo un solo cambio de color de material, y por eso agregar grano
no reabre ninguna decisión de color.

Se descartaron `AmbientOcclusion`, `Displacement`, `Roughness`, `NormalDX`, los `.blend`, `.usdc`,
`.mtlx` y `.tres`: no se integra lo que no se usa.

## Peso

| Archivo | Bytes |
|---|---:|
| `plaza-paving-grain.jpg` | 67.376 |
| `plaza-paving-normal.jpg` | 68.071 |
| `plaza-stone-grain.jpg` | 26.140 |
| `plaza-stone-normal.jpg` | 34.498 |
| **Total** | **196.085** |

191,5 kB contra los **0,80 MiB que `SCENE_BUDGETS.md` asigna a E1 · Portal y Plaza**. Queda el
77 % del presupuesto de textura de la escena sin usar.

## Crédito opcional

La fuente no lo exige, pero lo sugiere, y no cuesta nada:

> Created using PavingStones051 and Bricks066 from ambientCG.com, licensed under the Creative
> Commons CC0 1.0 Universal License.
