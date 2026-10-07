# Iteración 16 — la parada del carro de cable (Hito B · B3 «Introducción», en curso) (evidencia)

**Resultado principal:** detrás de la reja de la plaza hay una avenida con un andén y un carro de cable. El explorador:
- abre la reja con E;
- baja por la calle, frente a la casa de máquinas, cuya rueda se ve girar;
- espera el carro en su parada y sube con ▲;
- viaja 15 m llevado por el carro, sobre el que también viajan las esferas;
- baja con ▼ en la otra parada.

A bordo se ve lo que el problema de «Introducción» necesita (D21): la regla del carro queda fija bajo el explorador mientras el cordón del andén, numerado cada metro, pasa (`carro-30` → `carro-38`).

**También:**
- **La velocidad tiene marco** (D21): quien baja del carro en marcha, o lo que se suelta desde él, sale con la velocidad del carro.
- **Deuda pagada:** la geometría estática del barrio está unida por material.
  - Con el arco abierto: Terraza 930 → 767 llamadas de dibujo antes de sumar la avenida, 796 con ella; plaza 634 → 443.
  - Se ve igual (`plaza-antes-de-unir`, `plaza-despues-de-unir`).
- **Corregido un defecto anterior:** la cadena del Pozo se ofrecía a cualquier profundidad («E Bajar por la cadena» en la calle; `intermedio-aviso-de-cadena-en-la-calle`).

Diseño en `../../DECISIONES.md` D21. La revisión independiente (un atrapamiento en la vía, el carro que sólo llevaba al explorador, el arrastre sin velocidad) y su respuesta, en `REVISION.md`.

## Secuencia con teclado real

Script: `scripts/carro.mjs`. `carro.json` trae, en cada cuadro, el estado del explorador y del carro.

**Preparación declarada:** la ciudad vista y el arco abierto; el explorador en la plaza, frente a la reja.

| Cuadros | Qué muestran |
|---|---|
| `carro-00`, `02`, `05` | La reja: «E Abrir la reja» y la hoja que gira hacia la calle. |
| `carro-08`, `12` | La calle. Al fondo, la casa de máquinas con su rueda en el arco; el carro pasa. |
| `carro-16`, `20`, `21` | En el andén, hacia la parada; el carro llega y espera. Junto a la parada, el poste con su campana. |
| `carro-24`, `25` | «▲ Subir al carro» junto al borde; a bordo, «▼ Bajar del carro». |
| `carro-30`, `34`, `38` | El viaje. La regla de bronce del carro (1, 2, 3) no se mueve respecto del explorador, y el cordón del andén pasa de 8…12 a 14…18. El cable corre, con sus marcas, y la rueda de la casa de máquinas cruza la imagen. |
| `carro-42`, `44` | La llegada a la parada de 20 m y la bajada con ▼. |

**Otras tomas:**
- `ruta-14-a-bordo-del-carro`: el mismo viaje dentro del recorrido completo, desde un inicio limpio.
- `vista-avenida-desde-la-calle` y `vista-avenida-y-casa-de-maquinas`: cámara libre. Son anteriores a mudar la casa de máquinas.
- **Intermedios:**
  - `intermedio-regla-del-carro-invisible`;
  - `intermedio-avenida-sin-suelo-al-sur`;
  - `intermedio-a-bordo-en-el-centro-sin-cordon`: con el explorador acomodado en el centro de la cubierta, el cordón del andén salía de cuadro.

## Técnico (medido)

- **`npm test`: 87/87.** Quince pruebas en `carro.test.js`:
  - **la reja y el recorrido:**
    - la reja cierra la calle hasta abrirla con E, y no deja pasar mientras gira;
    - el carro espera, recorre 0,75 m cada 0,5 s en marcha y para exactamente en la otra parada;
    - sube con ▲ y baja con ▼;
    - la vía no se pisa donde no está el carro;
    - ▼ desde cualquier punto del andén lleva a la calle;
  - **lo que viaja con el carro:**
    - el explorador viaja y su posición respecto del carro no cambia (1e-9);
    - **contra los dos bordes de la cubierta, en los dos sentidos, sigue a bordo.** Con la lógica anterior, en el tramo oeste con ▶, caía a la vía;
    - una esfera viaja 15 m en el mismo lugar del carro;
    - al bajar del carro en marcha, el explorador conserva su velocidad (~1,5 m/s);
    - una esfera soltada en marcha cae en su lugar de la cubierta (menos de 6 cm);
    - a bordo, el explorador se acomoda con el cuerpo entero sobre la cubierta;
  - **R, los avisos y el determinismo:**
    - R saca al explorador de la vía;
    - la cadena del Pozo no se ofrece en la calle (con el arreglo deshecho, falla);
    - los avisos del carro;
    - el determinismo.
- **Recorrido con teclado completo, desde un inicio limpio** (`report.json`): pasa, con 0 errores. El paso nuevo, «calle y carro»:
  - después de la plaza, ◀▲▶ hasta la reja; «Abrir la reja»; E;
  - por la calle hasta el andén y a la parada de 1 m;
  - espera el carro y sube; el carro lo lleva 15,0 m; baja en x 16,19;
  - ▼ hasta la plaza (z −20,98) y por el pasaje a la Terraza.
- **Llamadas de dibujo y trabajo de CPU por cuadro** (`llamadas-de-dibujo.jsonl`, p99 del trabajo):

  | Lugar | Llamadas | Trabajo |
  |---|---|---|
  | Terraza, con el arco y la reja abiertos | 796 | 5,5 ms |
  | Plaza | 443 | 4,5 ms |
  | Andén | 179 | 3,6 ms |
  | A bordo | 182 | 3,6 ms |

  El p99 del intervalo es de 16,8 ms en todos.
- **Una pausa en la cascada del recorrido** (p95 de 33 ms):
  - En un A/B intercalado (`ab-cascada.jsonl`, builds de producción), HEAD y este árbol dan lo mismo (p95 de 33,3 ms los dos) con la máquina compartida cargada. El trabajo de CPU queda en 5–6 ms.
  - No es de esta iteración: es del entorno.
- **Sonido:** chirrido de la reja, campana antes de salir, enganche y freno. **No verificados de oído.**

## Lo que sigue (D21, FAMILIAS)

1. El jalón, como cuerpo que el carro también lleva; las lecturas, respecto de él.
2. Dos registros físicos y simultáneos: tiza en el suelo y cinta en el carro. Primero la linterna; después el explorador caminando sobre el carro en marcha.
3. El tramo hacia el oeste, con el desplazamiento negativo.
4. Las notas de la Bitácora.
5. El encargo y la transferencia del bote.

**Abierto, además:**
- un reloj u horario en la parada (el ciclo dura unos 33 s);
- un recorrido nuevo de cámara libre por la avenida, con la casa de máquinas en su lugar.
