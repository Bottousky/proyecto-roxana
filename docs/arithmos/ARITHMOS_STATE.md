# Arithmos — estado

Actualizado: 2026-10-06 (ciclo 4 del loop).

## Dónde

- Repositorio: `Bottousky/proyecto-roxana` (remoto `origin`). **Sin push.**
- Worktree aislado: `/Users/manuel/code/proyecto-roxana/.claude/worktrees/arithmos-graphic-adventure-065e68`
- Rama: `claude/arithmos-graphic-adventure-065e68` (base `f7984ca`).
- Juego: `experiments/arithmos/` · Documentos: `docs/arithmos/` · Evidencia: `artifacts/arithmos/itNN/`.
- Modelo: la sesión principal corre como Opus 5.5 (`claude-opus-5-5`, según el entorno). Los
  subagentes se lanzan con el alias `opus`; no puedo verificar desde adentro qué versión resolvió.

## Estado real (ciclo 8 del loop, 2026-10-07)

- **El recorrido completo, capítulos 1 a 12, es jugable y está encadenado** (título → 1 → … → 12 →
  tarjeta final «Arithmos — Lo que se entiende, resiste»). Partida completa del bot, de una vez, 1 → 12 con tres
  recargas (en 3.2, 7.5 y 11.6): sin errores, 804 s, las 12 entradas de la Bitácora
  (`artifacts/arithmos/it10/full-1a12`). Cada capítulo pasa por la ruta directa y la
  ruta con errores del bot; los caps. 7–9 también en 844×390.
- Revisiones matemáticas independientes hechas para los 12 capítulos. Las altas de los caps. 9–12
  (rev-mat-8, 9 y 10) están corregidas. Ciclo 8: aplicadas las medias de rev-mat-9 (cap. 10: cuerda y
  arco, prueba de los 60°, coseno dibujado y en la tabla, ángulo y esquina recta de la rampa, rampa de 60°
  con decisión, casa de Rampa coherente con el cap. 8, suma de flechas por coordenadas, 3 + i e
  i · (3 + i), «contra el reloj», tablas de los dos sistemas, caso de la misma recta, Bitácora) y la M9 de
  rev-mat-10 (la V del valor absoluto en 12.7). El cap. 9 dice «con números de la recta» donde afirmaba
  que x · x nunca da negativo. Verificado: cap. 10 en las dos rutas y en 844×390, 12.7 y 9.6
  (`artifacts/arithmos/it11/`). Lo escrito por el estudiante en la pizarra llega ahora al lector de
  pantalla. Matriz de cobertura de `ARITHMOS_CURRICULUM.md` puesta al día, con los huecos que quedan.
- Ciclo 8, además: escena nueva **7.3b «Juntar factores»** (propiedades de las potencias desplegadas y contadas,
  la suma no junta, raíz cúbica apilando capas: 64 = 2⁶ = 4³ = 8²); **identidad** nombrada en 6.4;
  **discontinuidad y asíntota** nombradas en 12.1; la **raíz** dibujada como reflejo de x · x en 12.4.
  Agencia: en **9.4** el jugador mueve la recta parada y cuenta cortes antes de decidir; en **9.2** arma la regla
  con dos piezas y la máquina la prueba contra lo anotado. El estudiante le habla a los personajes con coma
  («Mara, …») y el lector de pantalla dice quién habla. Revisión matemática independiente rev-mat-11 de los
  arreglos del cap. 10 y de 7.3b: dos errores nuevos en pantalla (la ventana «de cuatro lados», la raya de la
  tabla que parecía fracción) y 15 bajas, todo corregido y verificado (`it11/rv-*`).
- Más tarde en el ciclo 8: 7.7 con una y ninguna solución y la raíz de (x + 1)² como distancia al cero; 11.4 y
  11.7 deciden con el gráfico de cerca. Segunda revisión independiente (rev-c8) de 9.2, 9.4, 6.4, 12.1 y 12.4:
  encontró que **las Bitácoras leían evidencia de otros capítulos** con el mismo nombre (la del 12 tomaba la
  respuesta de 9.1; la del 5 escribía «undefined») — corregido en las doce y el bot ahora marca como error una
  Bitácora con «undefined» o «NaN». 9.2 muestra lo que da la primera pieza antes de elegir la segunda; 9.4 deja
  seguir mirando; la asíntota se define bien. Partida completa 1 → 12 (ruta directa, recargas en 3.2, 7.3b y
  11.6): sin errores, 796 s, 12 Bitácoras (`it11/full-1a12`). Y por la ruta con errores (recargas en 2.2, 9.2 y
  12.3): sin errores, 916 s, 12 Bitácoras sin texto roto (`it11/full2-1a12`). En 9.1 el jugador dibuja las flechas al
  revés desde el 2, con la tabla de ayer a la vista.
- **Entorno:** la máquina se suspendió de madrugada (≈ 01:30–02:00); dos corridas y una revisión se cortaron
  por eso y se repitieron sin problemas.
- Revisión narrativa de los caps. 10–12 hecha (rev-narr-8): el cierre se rehizo (la cuarta noche pone a
  prueba la suposición, la Marea pasa y la escalera resiste, Punto corre por su gráfico); el resto de sus
  hallazgos queda en N10-12.
- Teléfono acostado: mientras se toca la escena y no hay texto, la pizarra usa el lugar del subtítulo
  (≈ 30 % más grande). La guarda de botones superpuestos ahora ignora a los que deambulan.
- Guarda de interfaz (botones de texto que se pisan): todos los capítulos pasan a 1600×900; en 844×390
  se corrigieron los casos de 1.x, 2.x, 4.6, 5.5/5.6/5.9, 6.x y 12.1 (las elecciones que no son
  espaciales —operaciones, particiones— pasaron al panel de opciones).
- **Entorno:** máquina compartida; las partidas del bot se corren de a una y las capturas pueden tardar
  (el bot ahora tolera una captura fallida).
- Audio no escuchado; sin playtests humanos; sin dispositivo táctil real.

## Comandos

```sh
cd experiments/arithmos
node scripts/serve.mjs 4195                      # jugar en http://127.0.0.1:4195/
node --test tests/                               # pruebas unitarias
node scripts/playthrough.mjs <dir> --reload      # partida automática con recargas
node scripts/playthrough.mjs <dir> --watch --film --route=directa   # película a velocidad real
node scripts/shot.mjs lab/ <png>                 # laboratorio de tiza
```

## Bloqueos

- Sin ffmpeg (no se instalan binarios): las grabaciones son secuencias de cuadros + visor HTML.
- Sin acceso a escucha ni a personas: audio y comprensión no se certifican.
- Integración con la escuela (`experiments/playcanvas`) requiere tocar infraestructura compartida:
  se deja propuesta, no se hace sin acuerdo (backlog X-2).

## Siguiente acción

1. Pendientes de narrativa por capítulo (N2-R, N6-R … N10-12), empezando por agencia (que el jugador dé
   el paso decisivo) y por Punto como personaje, que se repiten en todas las revisiones.
2. Cobertura pendiente (ver huecos en la matriz): C7b (cociente de potencias, sucesiones nombradas,
   simplificar racionales), J (polinómica de grado mayor, simetrías, parámetros de otras familias, asíntota
   horizontal).
3. Agencia en los caps. 10–12 (N10-12 A3: plantilla y menús evaluados); bajas de rev-c8 (B7, B9); 9.8: tiempo a escala (pendiente de mat-8).
4. Revisión matemática de 7.7 (una y ninguna solución) y de 9.1 nuevo.
5. Lo que no se puede hacer en forma autónoma: escuchar el audio y probar con personas.
