# Ohmdal: evidencia de investigación educativa para "aprender sin darse cuenta"

Informe de apoyo para auditar el diseño didáctico de Ohmdal, un juego de reparaciones en corriente continua (CC) para personas sin conocimientos previos. Cada sección resume la evidencia y termina con implicaciones de diseño. Marco con **[verificar]** las afirmaciones que no pude contrastar con el texto completo de la fuente.

---

## 1. Ideas previas mejor documentadas sobre circuitos de CC

**Evidencia.**
- **Consumo de corriente.** Muchos estudiantes creen que la corriente "se gasta" en las lámparas, de modo que llega menos a la última. McDermott & Shaffer (1992) documentaron, con estudiantes universitarios y antes y después de la instrucción, esta idea y otras: no distinguir corriente, tensión, energía y potencia; no tener la noción de circuito completo; creer que la pila entrega siempre la misma corriente.
- **Razonamiento secuencial o local.** Shipstone (1984) estudió a alumnos de 11 a 18 años y encontró varios modelos de flujo de corriente, razonamiento secuencial y confusión entre tensión y corriente. En el razonamiento secuencial, un cambio "aguas arriba" afecta lo que viene después pero no lo anterior. El término lo acuñó Closset (1983). El estudio en cinco países europeos (Shipstone et al., 1988) mostró que estos patrones aparecen en todos ellos. *Nota: esto sale del resumen y de citas secundarias; no leí el texto completo.*
- **La pila como fuente de corriente constante.** Cohen, Eylon & Ganiel (1983) trabajaron con 145 alumnos de secundaria y 21 profesores. Encontraron que la pila se ve como fuente de corriente constante, que la corriente se toma como concepto primario y la diferencia de potencial como su *consecuencia*, y que cuesta prever cómo el cambio de un componente afecta al resto del circuito. Engelhardt & Beichner (2004) construyeron el test DIRECT (29 ítems) y confirmaron que, incluso después de la instrucción, conviven varias ideas erróneas. La de "pila = corriente constante" fue la más usada en las entrevistas, y los estudiantes asignaban propiedades de la corriente a la tensión o a la resistencia.
- **Corrientes que chocan, unipolaridad y "paralelo = más débil".** Son modelos clásicos descriptos en las revisiones de Duit & von Rhöneck y de Psillos, en Tiberghien, Jossem & Barojas (1998). En el modelo de "corrientes que chocan", sale corriente de ambos polos y se encuentra en la lámpara. En el unipolar, alcanza con un solo cable. **[verificar: no pude confirmar en línea el índice exacto de esos capítulos]**

**Implicaciones para Ohmdal.**
1. **Diseñar puzzles que hagan fallar la idea errónea a propósito.** Por ejemplo, dos lámparas idénticas en serie que brillan *igual*. Así se refuta el consumo de corriente. Si además se agrega un medidor en ambos extremos de la línea, la igualdad de corriente se *ve*.
2. **Contra el razonamiento secuencial:** cambiar algo "al final" del circuito (por ejemplo, la carga del divisor) y que cambie algo "al principio". El divisor cargado y la caída en la unión defectuosa sirven justamente para eso: el efecto aparece *sólo bajo carga* y de forma global, no local.
3. **Contra "pila = corriente constante":** mostrar en el mismo puzzle que la corriente que entrega la fuente *cambia* al agregar ramas en paralelo, mientras la "presión" de la fuente se mantiene. El puzzle de reparto de potencia con límite de corriente puede servir para esto si la corriente total es visible.
4. **Usar los ítems del DIRECT como banco para evaluación interna o encuestas piloto.** Están en arXiv physics/0304040.

---

## 2. Modelos y analogías para principiantes, y sus límites

**Evidencia.**
- **Gas de electrones o "presión eléctrica".** Burde & Wilhelm (2020) plantean el potencial como presión del gas de electrones y la tensión como *diferencia de presión*, que es la *causa* de la corriente, igual que una diferencia de presión de aire hace salir el aire de un colchón inflable. Parten de experiencias cotidianas con aire comprimido y presentan la tensión temprano, junto con la corriente. Un estudio comparativo con 790 alumnos de Frankfurt encontró una comprensión significativamente mejor que con la enseñanza tradicional. *Este dato sale del comunicado de prensa universitario; el artículo trae el detalle estadístico.* El antecedente es Burde, Wilhelm & Wiesner (2014), con Wiesner en la LMU de Múnich.
- **Altura o potencial ("la tensión como desnivel").** Es la línea de Gleixner (1998, tesis en la LMU de Múnich, *Einleuchtende Elektrizitätslehre mit Potenzial*) y del grupo de Wiesner, con representaciones del circuito donde la altura indica el potencial. Hindriksen, Kahnt & Berger (2023, Osnabrück) compararon tres variantes: modelo de altura (implementado como "Stäbchenmodell"), cadena de bicicleta y sin modelo. En un post-test diferido sobre potencial, la cadena de bicicleta y la variante sin modelo superaron al modelo de altura con un efecto pequeño, y la cadena fue la mejor en tensión. *Son actas de congreso (PhyDid B), no una revista con revisión completa.*
- **Cadena de bicicleta o soga.** Muestra muy bien que la corriente no se consume (todo el lazo se mueve a la vez) y que la energía sí se transfiere. Es el modelo de la soga de IOP Spark. Su límite: representa mal las ramas en paralelo y no tiene un equivalente natural del potencial.
- **Agua.** Gentner & Gentner (1983) mostraron que la analogía elegida cambia las inferencias. El agua ayudó a razonar sobre pilas en serie y en paralelo; la "multitud en movimiento" ayudó con resistencias. Schwedes trabajó una analogía hidráulica de circuito cerrado (Schwedes & Dudeck, 1996) **[verificar: no pude localizar el texto en línea]**. Su riesgo conocido es "materializar" la corriente como sustancia.
- **"Stepping-stones":** no encontré una fuente que use ese nombre para un modelo de circuitos. Puede tratarse del Stäbchenmodell (modelo de "palitos" o alturas) o de otra traducción. **[verificar antes de citarlo]**

**Implicaciones para Ohmdal.**
1. **Presentar la "presión" (tensión) desde el primer puzzle**, no como un agregado posterior. La evidencia de Burde & Wilhelm y de Cohen et al. indica que el problema central es razonar *sólo* con corriente y resistencia.
2. **Usar más de un modelo, con roles explícitos:** un lazo o cadena para "no se gasta" y presión o gas para "qué empuja y dónde cae". La literatura muestra que cada analogía favorece inferencias distintas.
3. **Hacer visibles los límites de cada metáfora dentro del juego**, por ejemplo un personaje que dice "esto ya no se parece a la cadena". Hay evidencia de aprendizaje implícito sobre modelos.
4. **Ser prudentes con el desnivel o altura como modelo principal:** la evidencia comparativa reciente le es levemente desfavorable.

---

## 3. Predecir–Observar–Explicar (POE) y simulaciones

**Evidencia.**
- **El ciclo POE.** White & Gunstone (1992) lo proponen como sonda de comprensión: el alumno se compromete con una predicción, observa y reconcilia la discrepancia.
- **Valor de la predicción.** Crouch et al. (2004) mostraron que mirar una demostración pasivamente no mejora la comprensión respecto de no verla, pero *predecir antes* sí la mejora de forma significativa.
- **Simulación frente a laboratorio real.** Finkelstein et al. (2005) encontraron que quienes usaron el Circuit Construction Kit de PhET, que muestra los electrones moviéndose, rindieron mejor en preguntas conceptuales y además armaron mejor circuitos *reales* que quienes usaron equipo real.
- **Diseño de PhET.** Wieman, Adams & Perkins (2008) atribuyen la eficacia a lo invisible hecho visible, la respuesta inmediata y la exploración guiada. Podolefsky, Moore & Perkins (2013) describen el **andamiaje implícito**: affordances, restricciones, pistas y respuestas del sistema guían sin instrucciones explícitas ("guiar sin sentirse guiado").

**Implicaciones para Ohmdal.**
1. **Antes de cerrar cada reparación, pedir una predicción de bajo costo**, como "¿qué lámpara va a brillar más?" con un toque. Después mostrar el resultado. La predicción es lo que activa el aprendizaje; la observación sola no alcanza.
2. **Hacer visible lo invisible:** partículas en movimiento, "presión" con color o densidad, calor en conductores (I²R). Ayuda especialmente en los puzzles de conductores en paralelo y de la unión defectuosa.
3. **Andamiaje implícito:** limitar las piezas disponibles para que el espacio de prueba y error sea productivo, y dar una respuesta física inmediata (brillo, calor, chispa) en lugar de un mensaje de "incorrecto".
4. **Cuando la predicción falla, pedir una explicación breve.** Puede ser eligiendo entre explicaciones candidatas, que se pueden redactar a partir de las ideas erróneas de la sección 1.

---

## 4. Aprendizaje y evaluación invisibles, integración intrínseca y reflexión

**Evidencia.**
- **Evaluación invisible.** Shute (2011) la define como la evaluación incrustada en el juego sin que el jugador lo perciba, a partir de evidencia de sus acciones en un modelo de competencias. Shute & Ventura (2013) la aplicaron en *Newton's Playground*.
- **Integración intrínseca.** Habgood & Ainsworth (2011) compararon versiones de *Zombie Division*. Cuando el contenido está integrado en la mecánica central, hubo más aprendizaje a igual tiempo (n=58), y en juego libre los chicos jugaron unas **siete veces más** esa versión (n=16).
- **Apoyo instruccional.** El meta-análisis de Wouters & van Oostendorp (2013) halló que el apoyo instruccional mejora el aprendizaje en juegos serios. La reflexión (pedir que se piense o se explique la respuesta), el modelado, la respuesta del sistema y la personalización tuvieron efectos positivos, y el apoyo rindió más en conocimiento y en "seleccionar la información relevante". **[verificar el tamaño de efecto exacto, cerca de d≈0,3]**
- **Efecto general y combinación con otra instrucción.** Wouters et al. (2013) hallaron d=0,29 frente a la instrucción convencional, con más efecto si el juego se complementa con otra instrucción, se juega en varias sesiones o en grupo. Clark, Tanner-Smith & Killingsworth (2016) obtuvieron g≈0,33 para juego frente a no juego y g≈0,34 para diseños aumentados frente a básicos: el *diseño* importa más que el medio.
- **Cierre reflexivo.** El modelo de Garris, Ahlers & Driskell (2002) ubica el *debriefing* (cierre reflexivo) como eslabón entre el ciclo de juego y los resultados de aprendizaje. Sin él, lo vivido en el juego puede no transferirse.

**Implicaciones para Ohmdal.**
1. **El concepto debe ser la mecánica:** reparar *requiere* razonar con tensión y corriente. Hay que evitar las soluciones que se puedan obtener reconociendo patrones visuales (por ejemplo, "siempre poner la resistencia junto al LED"). Conviene variar la topología para que el patrón memorizado falle.
2. **Registrar evidencia invisible:** primeros intentos, predicciones erradas y qué idea errónea implican. Eso permite adaptar las pistas y medir el aprendizaje sin examen.
3. **Agregar un cierre breve después de cada zona** en el que el jugador explique o elija el porqué. La evidencia indica que "aprender sin darse cuenta" funciona mejor si en algún momento uno *sí se da cuenta*: la reflexión explícita consolida.
4. **Diseñar para la transferencia** con el mismo principio en contextos superficialmente distintos, por ejemplo la caída de tensión en una unión defectuosa y en un cable largo.

---

## 5. Del vocabulario metafórico al formal

**Evidencia.**
- **Desvanecimiento de lo concreto ("concreteness fading").** Fyfe et al. (2014) revisan estudios en matemática y ciencias y recomiendan empezar con lo concreto y desvanecer de forma **explícita y gradual** hacia lo abstracto. Señalan cuatro beneficios: interpretar símbolos opacos, anclarlos en experiencia corporal, construir imágenes memorables y quitar detalles superficiales para que emerja la estructura.
- **El orden según el modelo de presión.** En el currículum de Burde & Wilhelm (2020), los términos y relaciones formales se presentan después de construir la comprensión cualitativa con el modelo de presión.

**Implicaciones para Ohmdal.**
1. **Tres capas por concepto:**
   - Concreta: el mundo del juego, "empuje" o "presión", "flujo".
   - Idealizada: un esquema simplificado con presión en colores.
   - Formal: voltio, amperio, ohmio, símbolos normalizados.
   
   El paso entre capas tiene que ser **explícito**. Por ejemplo, el cuaderno puede "traducir": "lo que llamás *empuje* los técnicos lo llaman *tensión* y lo miden en voltios".
2. **Introducir las unidades cuando el jugador ya predice bien en forma cualitativa**, y las fórmulas (V=IR, P=VI, P=I²R) como *resumen* de algo ya vivido, no como herramienta para resolver.
3. **Mantener disponibles las capas anteriores**, con la posibilidad de volver a la vista concreta. El desvanecimiento es gradual y no implica borrar el modelo concreto.

---

## 6. Cuadernos de campo y dibujar para aprender

**Evidencia.**
- **El cuaderno como herramienta.** Ruiz-Primo, Li, Ayala & Shavelson (2004) analizaron cuadernos de ciencias como herramienta de evaluación. Un estudio asociado (Ruiz-Primo, Li & Shavelson, 2002) encontró que el potencial del cuaderno se desaprovechaba: muchas entradas eran registros mecánicos y había poca respuesta del docente. **[verificar los hallazgos exactos del artículo de 2004 en el resumen de la revista]**
- **Dibujar para aprender.** Ainsworth, Prain & Tytler (2011) proponen el dibujo hecho por el alumno como práctica central de la ciencia. Dan cinco razones: aumenta el compromiso, enseña a representar como lo hace la ciencia, sirve para razonar, funciona como estrategia de aprendizaje y sirve para comunicar.

**Implicaciones para Ohmdal.**
1. **El cuaderno de campo no debe ser sólo un glosario automático.** El valor aparece cuando el jugador *produce* algo en él: completa un esquema, marca dónde cae la presión, elige su explicación.
2. **Pedir esbozos mínimos**, como dibujar el camino de la corriente o colorear la presión. Esto es posible dentro del juego y se apoya en Ainsworth et al.
3. **Usar el cuaderno como lugar del cierre reflexivo (sección 4) y del puente al vocabulario formal (sección 5).** Las entradas pueden "madurar": primero en lenguaje del juego y después con unidades reales.
4. **Que el cuaderno devuelva algo**, por ejemplo marcar contradicciones con predicciones anteriores. La falta de respuesta fue la debilidad principal en los estudios de Ruiz-Primo.

---

## Referencias

- Ainsworth, S., Prain, V., & Tytler, R. (2011). Drawing to learn in science. *Science, 333*(6046), 1096–1097. https://doi.org/10.1126/science.1204153
- Burde, J.-P., & Wilhelm, T. (2020). Teaching electric circuits with a focus on potential differences. *Physical Review Physics Education Research, 16*, 020153. https://doi.org/10.1103/PhysRevPhysEducRes.16.020153 (materiales: https://www.einfache-elehre.de)
- Burde, J.-P., Wilhelm, T., & Wiesner, H. (2014). Das Elektronengasmodell in der Sekundarstufe I. *PhyDid B*. https://ojs.dpg-physik.de/index.php/phydid-b
- Clark, D. B., Tanner-Smith, E. E., & Killingsworth, S. S. (2016). Digital games, design, and learning: A systematic review and meta-analysis. *Review of Educational Research, 86*(1), 79–122. https://doi.org/10.3102/0034654315582065
- Cohen, R., Eylon, B., & Ganiel, U. (1983). Potential difference and current in simple electric circuits: A study of students' concepts. *American Journal of Physics, 51*(5), 407–412. https://doi.org/10.1119/1.13226
- Crouch, C. H., Fagen, A. P., Callan, J. P., & Mazur, E. (2004). Classroom demonstrations: Learning tools or entertainment? *American Journal of Physics, 72*(6), 835–838. https://doi.org/10.1119/1.1707018
- Engelhardt, P. V., & Beichner, R. J. (2004). Students' understanding of direct current resistive electrical circuits. *American Journal of Physics, 72*(1), 98–115. https://doi.org/10.1119/1.1614813 (preprint: https://arxiv.org/abs/physics/0304040)
- Finkelstein, N. D., Adams, W. K., Keller, C. J., Kohl, P. B., Perkins, K. K., Podolefsky, N. S., Reid, S., & LeMaster, R. (2005). When learning about the real world is better done virtually: A study of substituting computer simulations for laboratory equipment. *Physical Review Special Topics – PER, 1*, 010103. https://doi.org/10.1103/PhysRevSTPER.1.010103
- Fyfe, E. R., McNeil, N. M., Son, J. Y., & Goldstone, R. L. (2014). Concreteness fading in mathematics and science instruction: A systematic review. *Educational Psychology Review, 26*, 9–25. https://doi.org/10.1007/s10648-014-9249-3
- Garris, R., Ahlers, R., & Driskell, J. E. (2002). Games, motivation, and learning: A research and practice model. *Simulation & Gaming, 33*(4), 441–467. https://doi.org/10.1177/1046878102238607
- Gentner, D., & Gentner, D. R. (1983). Flowing waters or teeming crowds: Mental models of electricity. En D. Gentner & A. L. Stevens (Eds.), *Mental Models* (pp. 99–129). Erlbaum.
- Gleixner, C. (1998). *Einleuchtende Elektrizitätslehre mit Potenzial* (tesis doctoral). LMU München.
- Habgood, M. P. J., & Ainsworth, S. E. (2011). Motivating children to learn effectively: Exploring the value of intrinsic integration in educational games. *Journal of the Learning Sciences, 20*(2), 169–206. https://doi.org/10.1080/10508406.2010.508029 (versión del autor: https://shura.shu.ac.uk/3556/)
- Hindriksen, A., Kahnt, M., & Berger, R. (2023). Estudio comparativo del modelo de altura (Stäbchenmodell), la cadena de bicicleta y la variante sin modelo para introducir el potencial. *PhyDid B* (actas DPG, Hannover 2023). https://ojs.dpg-physik.de/index.php/phydid-b/article/download/1340/1585/7060 **[título exacto por verificar]**
- IOP Spark. The rope loop teaching model. https://spark.iop.org/rope-loop-teaching-model
- McDermott, L. C., & Shaffer, P. S. (1992). Research as a guide for curriculum development: An example from introductory electricity. Part I. *American Journal of Physics, 60*(11), 994–1003. https://doi.org/10.1119/1.17003
- Podolefsky, N. S., Moore, E. B., & Perkins, K. K. (2013). Implicit scaffolding in interactive simulations: Design strategies to support multiple educational goals. https://arxiv.org/abs/1306.6544 (véase también Paul, Podolefsky & Perkins, 2012, PERC: https://www.compadre.org/portal/items/detail.cfm?ID=12838)
- Ruiz-Primo, M. A., Li, M., Ayala, C., & Shavelson, R. J. (2004). Evaluating students' science notebooks as an assessment tool. *International Journal of Science Education, 26*(12), 1477–1506. https://doi.org/10.1080/0950069042000177299
- Shipstone, D. M. (1984). A study of children's understanding of electricity in simple DC circuits. *European Journal of Science Education, 6*(2), 185–198. https://doi.org/10.1080/0140528840060208
- Shipstone, D. M., et al. (1988). A study of students' understanding of electricity in five European countries. *International Journal of Science Education, 10*(3), 303–316. https://doi.org/10.1080/0950069880100306
- Shute, V. J. (2011). Stealth assessment in computer-based games to support learning. En S. Tobias & J. D. Fletcher (Eds.), *Computer Games and Instruction* (pp. 503–523). Information Age. https://myweb.fsu.edu/vshute/pdf/shute%20pres_h.pdf
- Shute, V. J., & Ventura, M. (2013). *Stealth Assessment: Measuring and Supporting Learning in Video Games*. MIT Press (acceso abierto en OAPEN).
- Tiberghien, A., Jossem, E. L., & Barojas, J. (Eds.) (1998). *Connecting Research in Physics Education with Teacher Education*. ICPE/IUPAP (incluye capítulos de Psillos y de Duit & von Rhöneck sobre electricidad **[verificar índice]**). https://web.phys.ksu.edu/icpe/Publications/teach2/index.html
- White, R., & Gunstone, R. (1992). *Probing Understanding*. Falmer Press.
- Wieman, C. E., Adams, W. K., & Perkins, K. K. (2008). PhET: Simulations that enhance learning. *Science, 322*(5902), 682–683. https://doi.org/10.1126/science.1161948
- Wouters, P., & van Oostendorp, H. (2013). A meta-analytic review of the role of instructional support in game-based learning. *Computers & Education, 60*(1), 412–425. https://doi.org/10.1016/j.compedu.2012.07.018
- Wouters, P., van Nimwegen, C., van Oostendorp, H., & van der Spek, E. D. (2013). A meta-analysis of the cognitive and motivational effects of serious games. *Journal of Educational Psychology, 105*(2), 249–265. https://doi.org/10.1037/a0031311
