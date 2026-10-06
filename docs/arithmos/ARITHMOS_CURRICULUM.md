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
| C1–C4 | Fracciones a reales; exacto vs aproximado | 1°–4° | 5 | implementado (cap. 5, en prueba; C3 razón y proporción pasa al cap. 9) |
| D1–D6 | Lenguaje algebraico, **pasa sumando**, desigualdades, sistemas | 2°–4° | 6 | pendiente |
| E1–E7 | Potencias, polinomios, cuadráticas, sucesiones, logaritmos, expresiones racionales | 1°–5° | 7 | pendiente |
| F1–F4 | Geometría y medida | 1°–5° | 8 | pendiente |
| G1–G2 | Relaciones y funciones | 1°–3° | 9 | pendiente |
| H1–H4 | Trigonometría, vectores, complejos, matrices | 3°–6° | 10 | pendiente |
| I1–I3 | Datos, conteo, probabilidad | 1°–6° | 11 | pendiente |
| J1–J3 | Síntesis en funciones; cálculo en su nivel | 4°–6° | 12 | pendiente |
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
