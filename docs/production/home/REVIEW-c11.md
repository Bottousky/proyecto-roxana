# Segunda revisión crítica · ciclo 11 (2026-10-06)

Revisor: agente separado, sólo lectura, sobre los ciclos 8–10 y el triage de `REVIEW-c07.md`. Independiente del
autor de los cambios; no es una persona ni un QA externo.
Veredicto del revisor: **sin críticos**; 4 ALTO; no declarar CANDIDATO_PARA_REVISION hasta corregir ALTO 1–3 y medir
con la GPU libre.

## Triage

| # | Sev. | Hallazgo | Estado (ciclo 11) |
|---|---|---|---|
| 1 | ALTO | Versión ligera sin salida tras «Ver la entrada» (sin WebGL o con el contexto perdido) | **Corregido**: la vista previa no se ofrece ni corre en la versión ligera; `lightVersion` limpia sus estados; Escape sale siempre. QA §8 |
| 2 | ALTO | Volver con Atrás (bfcache) no relee la partida ni cuenta el cambio; cámara en primer plano del Portal | **Corregido**: `pageshow` persistido relee la partida, ubica la cámara según la URL y llama a `showChanges`. QA §7 **simulado** (evento sintético); bfcache real NO VERIFICADO |
| 3 | ALTO | Árboles que desaparecen de golpe en cada acercamiento | **Corregido**: se decide con la pose de destino y se desvanecen (~0,3 s, material propio por árbol). QA §6 |
| 4 | ALTO | Sin FPS válidos con la GPU libre | **Bloqueado por el entorno**: la GPU estuvo ocupada todo el ciclo por la partida automatizada del agente de Bitland; no se mide con contención |
| 5 | MEDIO | Rótulo del gesto que cae al terminar | **Corregido**: el rótulo se vacía antes de quitar el estado |
| 6 | MEDIO | Pantallas de lámparas encendidas en etapa 0 | **Corregido**: material propio que sigue a `workshop` real (`evidence/c11/electronica-0` vs `-10`) |
| 7 | MEDIO | Evidencia de bancos con cámara inalcanzable; sin capturas 390 | **Corregido**: capturas con la cámara real de la sala (etapas 0/10) y a 390×844 |
| 8 | MEDIO | «Reducir movimiento» incompleto | **Corregido**: remolino del Portal congelado; portal, chorros, luciérnagas y linterna sin partículas. QA §9 |
| 9 | MEDIO | Primer pintado siempre en etapa 0 | **Corregido**: pósters por hora × tramo (0–1, 2–6, 7–10), elegidos leyendo la partida |
| 10 | MEDIO | Primeros planos: sprites de visitantes, vereda plana, setos octogonales | **Parcial (c12)**: la «vereda dentada y sobreexpuesta» era el borde de la sombra pixelado y un brillo especular del césped → sombra más fina en acercamientos y césped mate; setos redondeados (`evidence/c08/bitland-respuesta.jpg` → `evidence/c12/bitland-respuesta.jpg`). Abierto: sprites 2D de visitantes al fondo de algunos primeros planos (choque de estilo, requiere personajes 3D) |
| 11 | MEDIO | Docs que afirmaban de más; atribución de ImageGen | **Corregido** en STATE/REVIEW-c07/ASSETS (ver abajo) |
| 12 | BAJO | Nombres del mapa sobre el marco | **Corregido** |
| 13 | BAJO | Alfombra estirada | **Corregido**: dos paños a la proporción de la imagen |
| 14 | BAJO | `toDataURL` repetido | **Corregido**: una lectura por dibujo |
| 15 | BAJO | Escape durante el gesto entraba a la sala | **Corregido**: Escape vuelve a donde se estaba (al panel si el gesto salió de él) |
| 16 | BAJO | Sin WebGL no aparece «Cambió por tu aventura» | **Corregido** (sin el recorrido 3D) |
| 17 | BAJO | Pantalla del Anfiteatro desfasada; video que sigue subiendo | **Corregido** |

## Afirmaciones rectificadas

- «Bruma azulada; el fondo deja de ser una pared beige» (ciclo 9): sólo la mañana tira a azul; de tarde la bruma
  sigue siendo beige oliva, más lejana que antes.
- «Los árboles se apartan» (ciclo 8): se apagaban de golpe; desde el ciclo 11 se desvanecen.
- «Electrónica resuelto» (REVIEW-c07 #8): mejorado; la protoboard sigue siendo simple y el soldador una varilla.
- Atlas del mapa y alfombra: generados con ImageGen; estatua: Meshy. Derechos a confirmar por el autor.
