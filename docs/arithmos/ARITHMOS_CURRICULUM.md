# Arithmos — currículo, dependencias y cobertura

Fuentes curriculares e históricas detalladas (con URL, certeza y pendientes):
[research/fuentes.md](research/fuentes.md). Este archivo no las duplica: las usa.

## Referencia elegida

**Principal:** Provincia de Buenos Aires (DGCyE), Educación Secundaria Técnica de 7 años,
especialidad **Técnico en Electrónica** (coherente con Ohmdal):
- 4° a 6°: Res. DGCyE 3828/09, Anexo 3 (Matemática-CS 4°, Análisis Matemático 5°, Matemática Aplicada 6°).
- 1° a 6°: bloque común de Matemática de los diseños ETP PBA 2025 (Res. conj. 6331/25 y 6333/25), **usado como aproximación**: no se verificó que aplique a Electrónica.

**Pisos federales:** Marco de Referencia INET Técnico en Electrónica (Res. CFE 15/07, Anexo III) y NAP de Matemática (Res. CFE 182/12; Ciclo Orientado atribuido a 180/12 sin verificar).
**Contraste:** CABA Técnico en Electrónica (Res. 4148/SSGECP/12).

**No se declara equivalencia curricular oficial.** Validaciones pendientes al final.

## Mapa de dependencias (conceptual, no histórico)

```
A1 correspondencia 1 a 1 ─┬─> A2 cardinalidad/conservación ─> A3 número vs numeral ─> A4 agrupación, unidad
                          └─> B0 más/menos por correspondencia                         └─> A5 valor posicional, cero
A5 ─> B1 suma/resta con significado ─> B2 recta numérica, orden, distancia ─> B3 negativos, opuestos, |x|
B1 ─> B4 multiplicación (grupos, escala) ─> B5 división (reparto, medida) ─> C1 fracciones como medida
C1 ─> C2 equivalencia, racionales, decimales, % ─> C3 razón, proporción ─> C4 inconmensurables, reales, aproximación
B2,B3,B4 ─> D1 patrón y generalización ─> D2 incógnita/variable/parámetro ─> D3 expresión, identidad, ecuación
D3 ─> D4 transformaciones equivalentes ("pasa sumando") ─> D5 desigualdades (orden y signo) ─> D6 sistemas
B4,C2 ─> E1 potencias y raíces ─> E2 notación científica;  D4 ─> E3 polinomios, factorización ─> E4 cuadráticas
E1 ─> E5 sucesiones y crecimiento ─> E6 logaritmo como pregunta inversa;  E3,C2 ─> E7 expresiones racionales (restricciones)
B2 ─> F1 coordenadas;  C3 ─> F2 semejanza, escala;  F2,E1 ─> F3 Pitágoras (alcance de la prueba);  B4,C1 ─> F4 área, volumen
F1,D2 ─> G1 dependencia, tabla, gráfico, expresión ─> G2 relación vs función, dominio, imagen
F2,G2 ─> H1 trigonometría, radianes, periodicidad;  F1,B3 ─> H2 vectores ─> H3 complejos (rotación);  D6 ─> H4 matrices
A2,C2 ─> I1 conteo y combinatoria ─> I2 probabilidad;  G1 ─> I3 descriptiva, dispersión, gráficos críticos, correlación ≠ causa
G2,E*,H1 ─> J1 familias de funciones y parámetros ─> J2 composición e inversa ─> J3 tasa de cambio, límite, derivada, acumulación
```

## Matriz de cobertura

Estados: **pendiente** · **diseñado** · **implementado** · **probado-auto** (el sistema funciona) ·
**revisado-mat** (revisión matemática independiente) · **validado-jugadores** (playtest humano).
"Año" = año de la referencia PBA donde aparece (ver mapa A–J en fuentes.md).

| Id | Concepto | Año ref. | Capítulo | Estado |
|---|---|---|---|---|
| A1 | Correspondencia uno a uno | (base de NAP 7°) | 1 | probado-auto |
| A2 | Cardinalidad; conservación ante reordenar/separar/apretar | 1° | 1 | probado-auto |
| A2b | Contar como emparejamiento con palabras; la última dice cuántos | 1° | 1 | probado-auto |
| B0 | Más / menos / igual por correspondencia | 1° | 1 | probado-auto |
| A3 | Número frente a numeral (nombre ≠ colección) | 1° | 1 | probado-auto |
| A4 | Unidad, agrupación (de a diez; la convención) | 1° | 2 | probado-auto |
| A5 | Valor posicional, cero como lugar vacío, generalización a mil | 1° | 2 | probado-auto |
| B1 | Suma con canje ("me llevo uno"); resta como comparación ("pedir prestado") | 1° | 2 | probado-auto |
| B2–B3 | Signo, negativos, opuestos, orden en la recta, distancia, valor absoluto, suma y resta de enteros (pares cero) | 1°–2° | 3 | probado-auto |
| B4–B5 | Multiplicación (grupos, escala) y división (reparto, medida), propiedades | 1°–2° | 4 | probado-auto (revisado-mat con correcciones aplicadas) |
| C1–C4 | Fracciones, equivalencia, decimales como valor posicional, porcentaje, cociente como fracción | 1°–4° | 5 (5.1–5.8) | probado-auto · revisado-mat (rev-mat-4). Pendiente: multiplicar por una fracción en general |
| C5 | Razón y proporción | 1°–4° (rango del bloque) | 8.4 (escala), 10.4 (rampas semejantes) | probado-auto · revisado-mat |
| C6 | Exacto vs aproximado; irracionales: √2 no es fracción (prueba), π no es fracción (dicho, sin prueba) | 1°–4° (rango del bloque) | 5.9, 8.1, 10.1 | probado-auto · revisado-mat |
| D1 | Incógnita; ecuación como dos miembros | 2°–4° (rango del bloque) | 6.1 | probado-auto · revisado-mat (rev-mat-5) |
| D2 | **Pasa sumando** como transformación de los dos miembros | 2°–4° (rango del bloque) | 6.2 | probado-auto · revisado-mat |
| D3 | Transformaciones válidas e inválidas; restricciones (× 0, elevar al cuadrado, dividir por lo que puede ser 0) | 2°–4° (rango del bloque) | 6.3–6.6 | probado-auto · revisado-mat |
| D4 | Desigualdades (multiplicar por un negativo) | 2°–4° (rango del bloque) | 6.7 | probado-auto · revisado-mat |
| D5 | Orden de deshacer; incógnita a la derecha | 2°–4° (rango del bloque) | 6.8 | probado-auto · revisado-mat |
| D6 | Sistemas 2 × 2 (cruce, paralelas, misma recta) | 2°–4° (rango del bloque) | 10.7 | probado-auto · revisado-mat (rev-mat-9) |
| D7 | Variable y parámetro | 2°–4° (rango del bloque) | 12.2 (perillas) | probado-auto · revisado-mat |
| D8 | Ecuación vs identidad (la que vale para cualquier x), nombrada cuando el truco de multiplicar por cero vuelve identidad una ecuación | 2°–4° (rango del bloque) | 6.4 | probado-auto (pendiente revisión matemática) |
| D-gap | Patrones y generalización como tema propio | 2°–4° (rango del bloque) | — | pendiente (C6b) |
| E1 | Raíz como pregunta inversa del cuadrado | 1°–5° (rango del bloque) | 7.1 | probado-auto · revisado-mat (rev-mat-6) |
| E2 | Crecimiento aditivo vs multiplicativo | 1°–5° (rango del bloque) | 7.2 | probado-auto · revisado-mat |
| E3 | Potencias; exponente 0 y negativo por patrón | 1°–5° (rango del bloque) | 7.3 | probado-auto · revisado-mat |
| E3b | Propiedades de las potencias (bᵐ · bⁿ, (bᵐ)ⁿ; la suma no) y raíz cúbica como lado de un cubo | 1°–5° (rango del bloque) | 7.3b | implementado (pendiente revisión matemática) |
| E4 | Notación científica | 1°–5° (rango del bloque) | 7.4 | probado-auto · revisado-mat |
| E5 | Polinomios como áreas; producto y factorización | 1°–5° (rango del bloque) | 7.5–7.6 | probado-auto · revisado-mat |
| E6 | Ecuación cuadrática; completar el cuadrado | 1°–5° (rango del bloque) | 7.7 | probado-auto · revisado-mat |
| E7 | Logaritmo como pregunta inversa («¿cuántas veces?») | 1°–5° (rango del bloque) | 7.8; familia en 12.1 | probado-auto · revisado-mat |
| E8 | Expresiones racionales: dónde no se puede | 1°–5° (rango del bloque) | 7.9 | probado-auto · revisado-mat |
| E6b | Completar el cuadrado con una o ninguna solución; la raíz de (x + 1)² como distancia al cero | 1°–5° (rango del bloque) | 7.7 | probado-auto (pendiente revisión matemática) |
| E-gap | Cociente de potencias y exponente fraccionario, sucesiones nombradas, simplificar racionales con su restricción | 1°–5° (rango del bloque) | — | pendiente (C7b) |
| F1 | Ángulo como giro; suma de los ángulos de un triángulo | 1°–5° (rango del bloque) | 8.2 | probado-auto · revisado-mat (rev-mat-7) |
| F2 | Congruencia vs semejanza | 1°–5° (rango del bloque) | 8.3 | probado-auto · revisado-mat |
| F3 | Escala: longitudes × k, áreas × k², volúmenes × k³ | 1°–5° (rango del bloque) | 8.4 | probado-auto · revisado-mat |
| F4 | Perímetro y área | 1°–5° (rango del bloque) | 8.5 | probado-auto · revisado-mat |
| F5 | Pitágoras | 1°–5° (rango del bloque) | 8.6; 10.2 (alto² + costado² = 1) | probado-auto · revisado-mat |
| F6 | Coordenadas | 1°–5° (rango del bloque) | 8.7 | probado-auto · revisado-mat |
| G1 | Función vs relación | 1°–3° (rango del bloque) | 9.1 | probado-auto · revisado-mat (rev-mat-8) |
| G2 | Regla, tabla, gráfico; unir o no unir; gráfico vs dibujo | 1°–3° (rango del bloque) | 9.2–9.4, 9.7 | probado-auto · revisado-mat |
| G3 | Dominio e imagen | 1°–3° (rango del bloque) | 9.5–9.6 | probado-auto · revisado-mat |
| H1 | Radián, seno y coseno, periodicidad, razones en triángulos rectángulos | 3°–6° (rango del bloque) | 10.1–10.4 | probado-auto · revisado-mat (rev-mat-9, medias aplicadas) |
| H2 | Vectores: cuánto y hacia dónde; suma | 3°–6° (rango del bloque) | 10.5 | probado-auto · revisado-mat |
| H3 | Números complejos como giro; i · i = −1 | 3°–6° (rango del bloque) | 10.6 | probado-auto · revisado-mat |
| H4 | Lectura matricial de un sistema | 3°–6° (rango del bloque) | 10.7 | probado-auto · revisado-mat |
| I1 | Frecuencia relativa que se estabiliza | 1°–6° (rango del bloque) | 11.1 | probado-auto · revisado-mat (rev-mat-10) |
| I2 | Promedio, mediana, dispersión | 1°–6° (rango del bloque) | 11.2–11.3 | probado-auto · revisado-mat |
| I3 | Lectura crítica de gráficos | 1°–6° (rango del bloque) | 11.4 | probado-auto · revisado-mat |
| I4 | Conteo (multiplicación) y probabilidad con casos igual de posibles | 1°–6° (rango del bloque) | 11.5–11.6 | probado-auto · revisado-mat |
| I5 | Regularidad vs garantía; correlación vs causa | 1°–6° (rango del bloque) | 10.8, 11.7 | probado-auto · revisado-mat |
| J1 | Familias por su forma: afín, cuadrática, exponencial, logarítmica, trigonométrica, racional | 4°–6° (rango del bloque) | 12.1 (racional y logarítmica sólo como miniatura) | probado-auto · revisado-mat (rev-mat-10) |
| J2 | Parámetros y cambio de comportamiento (recta) | 4°–6° (rango del bloque) | 12.2 | probado-auto · revisado-mat |
| J3 | Ceros, signo, crecimiento, decrecimiento, máximo | 4°–6° (rango del bloque) | 12.3 | probado-auto · revisado-mat |
| J4 | Composición e inversa con sus condiciones | 4°–6° (rango del bloque) | 12.4 | probado-auto · revisado-mat |
| J5 | Tasa de cambio, derivada (nombrada), acumulación | 4°–6° (rango del bloque) | 12.5–12.6 | probado-auto · revisado-mat |
| J6 | Por tramos; valor absoluto (la V) | 4°–6° (rango del bloque) | 12.7 | probado-auto · revisado-mat |
| J7 | Anticipar con una suposición declarada y revisarla | 4°–6° (rango del bloque) | 12.8 | probado-auto · revisado-mat |
| J8 | Discontinuidad y asíntota nombradas (la forma cortada); la raíz como familia, con gráfico, reflejo de x · x sobre la diagonal | 4°–6° (rango del bloque) | 12.1, 12.4 | probado-auto (pendiente revisión matemática) |
| J-gap | Polinómica de grado mayor que 2, simetrías nombradas, parámetros de otras familias, asíntota horizontal | 4°–6° (rango del bloque) | — | pendiente |
| K1 | **Lógica proposicional y álgebra de Boole** (INET Electrónica; no está en A–J) | INET | por decidir (¿puente con Bitland?) | pendiente — decisión de alcance |
| K2 | Divisibilidad y primos (NAP/PBA 1°–2°; no nombrado en A–J) | 1°–2° | 2 o 3 | pendiente |
| K3 | Combinatoria como objeto propio, binomio de Newton | 2°–4° | 10 | pendiente |

Fuera de alcance declarado (superan "análisis básico de funciones"): series de Taylor/Fourier,
transformadas de Laplace/Fourier, integrales múltiples e impropias, derivadas parciales
(PBA 2009 5°–6°, CABA). Se registran para no ocultarlos.

## Contrato educativo por concepto (implementados)

### A1 · Correspondencia uno a uno — cap. 1, escenas 1.3, 1.5 y 1.8
- **Necesidad:** saber si "volvieron todos" cuando no se puede (o no se sabe) contar y las cosas se mueven. Presupone: distinguir individuos.
- **Error a distinguir:** creer que comparar exige contar; o que basta "ver que hay muchos". En el emparejamiento: unir algo dos veces y no notarlo.
- **Observa / predice / modifica:** ve marcas fijas y puntos que se mueven; une marca↔punto; deshace; decide cuándo comprobar.
- **Consecuencia que comprueba:** Punto recorre cada unión; un punto unido a dos marcas se señala como inválido; si sobran de ambos lados "todavía no se sabe"; si sobra sólo una marca, falta alguien.
- **Otra representación / notación:** marcas de conteo (registro), luego numeral "14" y palabra "catorce".
- **Transferencia:** las gradas (1.9): otra estructura (asientos vs fila, la sobra está del otro lado, la forma engaña); y el conteo (1.10) como emparejamiento con palabras.

### A2 · Cardinalidad y conservación — cap. 1, escenas 1.9 y 1.10
- **Necesidad:** decidir si alcanzan los asientos para la Ronda y Punto sin dejarse engañar por el largo de la fila.
- **Error:** "más largo = más" (la fila separada, 720 u, parece tener más que unas gradas de 316 u); "apretados entran más".
- **Observa / predice / modifica:** predice para la fila nombrada (no alcanzan / justo / sobra / todavía no sé) y, si afirma, dice cómo lo sabe (contó / por cómo se ve); sienta a tres en el asiento que quiera y Punto sienta al resto. Después del asiento libre, Punto los aprieta en una fila corta y el jugador predice cuántos asientos sobrarán (ninguno / uno / más de uno).
- **Consecuencia:** sobra un asiento aunque las gradas son más cortas; se vuelven a sentar y sobra el mismo ("apretados o separados, son trece"). Si contó y dijo "justo", la devolución considera que se contó a sí mismo.
- **Notación:** "14" y "catorce" nombran lo que no cambia entre las marcas, los presentes y las palabras de "uno" a "catorce".
- **Transferencia:** Punto hace una marca por cada visita (incluido el estudiante y él mismo): nueva colección emparejable, verificada unión por unión.

### B0 · Más / menos por correspondencia — cap. 1, escenas 1.5, 1.6 y 1.8
- **Necesidad:** interpretar la marca sola.
- **Error:** leer la sobra al revés ("sobra un punto") o atribuirla siempre a un error de registro.
- **Consecuencia:** el juego responde con la evidencia: la sobra está entre las marcas → hay menos puntos; Punto muestra el registro de la mañana (doce toques, doce marcas) → no es un error de anotación.
- **Límite declarado:** las marcas dicen cuántos, no quién (Punto sabe quién).

### A3 · Contar, número y numeral — cap. 1, escena 1.10
- **Necesidad:** decir cuántos son sin mirar todas las marcas cada vez: contarlas y ponerles nombre.
- **Error:** tratar el numeral como colección ("14" nombra a dos, o "tiene catorce cosas adentro"); contar una marca dos veces.
- **Observa / modifica:** el jugador cuenta las marcas de Punto (una palabra por marca, en cualquier orden; repetir se avisa); Punto intenta emparejar "1" y "4" con dos presentes; el jugador elige qué explicarle.
- **Consecuencia:** la última palabra dice cuántas hay; las marcas se emparejan unión por unión con todos los presentes; el numeral no es una colección; "14" y "catorce" nombran el mismo número.
- **Límite declarado:** no se niega que "14" tenga estructura: cómo funciona su escritura queda como pregunta.
- **Puente:** Punto rodea el "1": "¿qué hace un 1 en el nombre de catorce?" → valor posicional (cap. 2).

### A4 · Agrupar de a diez — cap. 2, escenas 2.2 y 2.3
- **Necesidad:** anotar y comparar cargas de muchos palitos: las hileras de marcas (37 y 34) no se comparan de un vistazo.
- **Error:** creer que "de un vistazo" alcanza; atar con menos de diez; atar de a cinco sin avisar (Punto).
- **Observa / predice / modifica:** predice si hoy llegó más; llena el molde de diez palito por palito y ata.
- **Consecuencia:** atar con menos de diez no se puede; 37 = tres atados y siete sueltos, ordenados atados a la izquierda y sueltos a la derecha; la hilera de ayer, rodeada de a diez, es 34: hoy llegaron tres más. Si había dicho "hoy llegó más", se reconoce que era cierto y que recién ahora se puede asegurar.
- **Límite declarado:** diez es una costumbre; se podría agrupar de a otra cantidad si todos saben de a cuánto.

### A5 · Valor posicional y cero — cap. 2, escenas 2.3 a 2.8
- **Necesidad:** escribir lo que hay en el depósito (cuartos de sueltos, atados, atados de atados) con una cifra por cuarto.
- **Error:** no escribir nada o dejar un espacio en el cuarto vacío; leer 302 como 32; dejar diez en un cuarto.
- **Observa / predice / modifica:** guarda cargas, ata cuando un cuarto junta diez, escribe el número, elige qué hacer con el cuarto vacío y con diez atados de atados.
- **Consecuencia:** Punto copia lo escrito sobre un depósito chiquito desde la derecha y marca con una cruz lo que no coincide; sin el 0 todo se corre un lugar; el registro de los Oval (32) se corrige mirando su propio depósito (302); con diez atados de atados se dibuja un cuarto nuevo: 1000.
- **Notación:** cifra frente a número; el 0 dice "ninguno" en ese lugar.

### B1 · Suma con canje y resta como comparación — cap. 2, escenas 2.4 y 2.6
- **Necesidad:** guardar cargas que juntan diez en un cuarto; saber cuánta tiza más tiene Recta (52) que Curva (37).
- **Error:** emparejar un atado con un suelto; dejar diez en un cuarto.
- **Consecuencia:** "me llevo uno" es atar diez y pasarlo; comparando atado con atado y suelto con suelto, y desatando cuando no queda pareja (de cualquiera de los dos lados), sobran 15: 52 − 37 = 15.

### B2–B3 · Enteros — cap. 3
- **Necesidad:** anotar en las cuentas (en atados) que Curva debe 3 atados y no tiene ninguno.
- **Error:** anotar 0 ("no debe nada") o 3 ("tiene tres"); creer que −1 es menor que −4 ("4 es más que 1"); contar marcas en lugar de pasos (8 en lugar de 7); creer que +4 y −4 están a distinta distancia del cero; sacar deudas que no están sin agregar pares cero; leer la rayita de restar como deuda.
- **Observa / predice / modifica:** elige cómo anotar; empareja atados con deudas (cada par vale cero); anticipa saldos; ubica a las familias en una línea cuyos negativos todavía no tienen número; anticipa pasos; saca deudas anotadas dos veces; elige qué otra acción daría lo mismo; elige hasta qué marca sube Punto en el pozo.
- **Consecuencia:** cada saldo de la historia sale de una operación del modelo y coincide con su fila del registro; una familia mal ubicada dice cuánto le faltaría para llegar a cero; sacar dos deudas deja igual que dar dos atados: −1 − (−2) = −1 + 2 = +1; en el pozo, si no sube cinco, Punto vuelve a −4.
- **Notación:** − (deuda o debajo del suelo), + (lo que se tiene), |x|, paréntesis para separar el signo del número de la operación de restar.
- **Límites declarados:** "deber" y "debajo de cero" son dos lecturas del mismo número; el cero no tiene lado. **Pendiente:** una resta que da negativo (2 − 5) jugada, no sólo dicha.

## Historia: reconstrucción vs. historia real

El capítulo 1 es una **reconstrucción conceptual**: no afirma que el número "nació" de marcas.
No se mencionan culturas ni fechas en el juego todavía. Cuando se incorporen, usar sólo los
ítems de certeza alta o media de fuentes.md (p. ej. marcas con muescas: objetos notacionales
deliberados con debate sobre su lectura; fichas lisas mesopotámicas; quipus decimales;
al-Khwārizmī: *al-jabr* = restituir sumando a ambos miembros, *al-muqābala* = cancelar
términos semejantes — ancla histórica para el cap. 6). El cap. 3 menciona en la Bitácora, como dato, los signos + y − impresos por Widmann (1489).

## Validaciones pendientes
- Vigencia de la parte de Electrónica de la Res. 3828/09 y existencia de un diseño 2025 propio de Electrónica.
- Ciclo Básico vigente en PBA tras la derogación de la Res. 88/09.
- Número exacto de la resolución del NAP Ciclo Orientado.
- Actualizaciones 2025 de CABA (los PDF devolvieron 404) y posteriores del marco INET 2007.
- Decisión de alcance sobre K1 (lógica y Boole).
- Revisión matemática independiente de cada capítulo (ver ARITHMOS_REVIEW.md).
- Playtests con personas: **ninguno realizado**.
