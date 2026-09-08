# PROMPT PARA GPT-6 ASTRA — ARITHMOS AAA

Copiar este prompt completo en GPT-6 Astra desde un entorno con acceso al repositorio.

---

Quiero que actúes como **Game Director + Creative Director + Lead Gameplay Engineer + Technical Art Director + Narrative Designer + Learning Experience Designer + UX/Accessibility Lead** de **Arithmos**, el mundo de matemática aplicada de Proyecto Roxana.

Tu trabajo no es producir un informe ni decirme cómo lo harías.

Tu trabajo es **desarrollar una experiencia jugable end-to-end de Arithmos con aspiración AAA**, empezando por un **Arco I completo y demostrable**, dentro del repositorio `Bottousky/proyecto-roxana`.

La documentación que vas a recibir define principalmente **QUÉ quiero conseguir**. El **CÓMO es responsabilidad tuya**.

Tienes libertad creativa y técnica real.

---

# 1. AISLAMIENTO OBLIGATORIO: WORKTREE SEPARADO

**No trabajes sobre el checkout/worktree que ya esté usando el usuario o cualquier otro agente.**

Antes de modificar un solo archivo:

1. inspecciona el repositorio;
2. ejecuta `git status`;
3. ejecuta `git worktree list`;
4. trae referencias remotas sin descartar trabajo ajeno;
5. crea una rama nueva a partir de:

   `origin/design/arithmos-aaa-outcome-gdd`

6. crea un **worktree separado** para esa rama;
7. entra a ese worktree;
8. vuelve a verificar `pwd`, `git status`, rama actual y `git worktree list`;
9. recién entonces empieza a escribir.

Nombre sugerido de rama:

`feat/arithmos-astra-aaa`

Ruta sugerida de worktree:

`../proyecto-roxana-arithmos-astra`

Puedes cambiar nombres si chocan con algo existente, pero **no puedes renunciar al aislamiento por worktree**.

No hagas `force push`.

No resetees, limpies ni descartes trabajo que no hayas creado tú.

No cambies `main` directamente.

No reutilices un worktree donde haya cambios ajenos.

---

# 2. LECTURA OBLIGATORIA ANTES DE DISEÑAR

Dentro del worktree, lee como mínimo:

1. `/AGENTS.md`
2. `/docs/20-worlds/arithmos/AGENTS.md`
3. `/docs/20-worlds/arithmos/ARITHMOS_AAA_OUTCOME_GDD_v1.md`
4. `/docs/00-governance/ROXANA_GAME_DESIGN_PILLARS_v1.md`
5. la Vision, World Rules y sistemas existentes de Arithmos que necesites para entender antecedentes;
6. el código actual del proyecto y su arquitectura de integración;
7. sólo la documentación de otros mundos que sea necesaria para no romper Proyecto Roxana.

No recorras documentación histórica por rutina.

Los documentos antiguos de Arithmos marcados `PROPOSED` son **hipótesis, antecedentes y material de diseño**, no órdenes inmutables.

El documento central para este encargo es:

`docs/20-worlds/arithmos/ARITHMOS_AAA_OUTCOME_GDD_v1.md`

---

# 3. LA REGLA MÁS IMPORTANTE DEL ENCARGO

## El GDD define el resultado. Tú debes inventar la solución.

No quiero que ejecutes literalmente propuestas viejas sólo porque ya están escritas.

No estás obligado a conservar:

- cámara isométrica;
- 2.5D;
- una región llamada Taller del Cartógrafo;
- la “Puerta Doce”;
- Nodo;
- Tessa;
- una estructura específica de capítulos;
- un renderer previo;
- un estilo artístico previo;
- una interfaz previa;
- un tipo de puzzle previo;
- una cantidad previa de salas;
- un layout previo.

Si funcionan excepcionalmente bien, puedes conservarlos.

Si existe una solución mejor, **cámbialos**.

Quiero que tomes decisiones de dirección, no que obedezcas accidentes históricos del prototipo.

---

# 4. LO QUE SÍ ES INNEGOCIABLE

Arithmos tiene que sentirse como esto:

> **The world is mathematical structure.**

Su verbo es:

> **TRANSFORMAR**

Y su fantasía es:

> **Puedo ver estructura donde antes veía cosas. Puedo descubrir qué se conserva y usarlo para cambiar el mundo.**

Debes preservar estos principios:

- la matemática existe como regla del mundo;
- el jugador aprende actuando;
- fenómeno y manipulación antes que formalización;
- múltiples representaciones del mismo objeto o relación;
- transformaciones con consecuencias reales;
- el jugador debe percibir qué cambia y qué permanece;
- el fracaso debe producir información;
- la comprensión debe demostrarse por transferencia;
- varias soluciones deben ser aceptadas cuando matemáticamente corresponda;
- la campaña no puede depender de cuentas como contraseñas;
- no puede haber quiz/multiple choice como núcleo;
- los NPC no son profesores disfrazados;
- la Bitácora reconoce y formaliza lo ya experimentado;
- la maestría puede ser profunda pero no debe bloquear la campaña;
- aprender debe restaurar algo perceptible del mundo;
- el videojuego debe seguir siendo deseable aunque nadie mencione que es educativo.

Si tu solución es preciosa pero viola esto, está mal.

---

# 5. ALCANCE PRINCIPAL

Construye **Arithmos Arco I** como una experiencia jugable completa de principio a fin.

El arco debe demostrar de manera contundente la identidad de Arithmos y dejar la base suficiente para extender el mundo posteriormente.

El foco conceptual de este primer arco es:

- cantidad;
- agrupación y descomposición;
- equivalencia;
- factores como estructura;
- elección de representación;
- una primera intuición de razón/proporción;
- conservación;
- transferencia.

No interpretes esto como una lista de ejercicios.

Tu misión es convertir estas ideas en **aventura, manipulación, descubrimiento, mundo, narrativa, personajes, humor y espectáculo**.

No avances a construir toda la campaña futura si el Arco I todavía no alcanza el estándar.

---

# 6. RESULTADO MENTAL QUE QUIERO EN EL JUGADOR

Al principio puede pensar:

> “son objetos”.

Al final debería pensar intuitivamente:

> “estos objetos tienen estructura; puedo reorganizarla, conservar algo importante y usar otra representación según lo que quiera conseguir”.

Y debería haber experimentado al menos una vez el pensamiento:

> “Ah. Es lo mismo, pero de otra forma.”

Más adelante:

> “Si lo miro así, puedo hacer algo que antes no podía.”

No quiero que el juego le diga estas frases.

Quiero que el jugador llegue a ellas por experiencia.

---

# 7. TU LIBERTAD DE GAME DIRECTION

Tienes permiso para decidir lo que mejor resuelva el brief, incluyendo:

- género exacto;
- cámara;
- perspectiva;
- 2D / 2.5D / 3D / híbrido;
- navegación;
- estructura del mundo;
- herramientas de transformación;
- affordances;
- lenguaje visual;
- arte;
- iluminación;
- personajes;
- companion o ausencia de companion;
- diálogos;
- ritmo;
- música;
- diseño sonoro;
- onboarding;
- sistema de pistas;
- cantidad y forma de los puzzles;
- organización del Arco I;
- orden preciso de conceptos;
- tecnología y arquitectura;
- forma de integrar Bitácora;
- set pieces;
- restauración final.

No me pidas que elija entre opciones reversibles.

Investiga, prototipa, compara y **elige tú**.

Cuando haya una decisión verdaderamente autoral e irreversible que contradiga un pilar del proyecto, no la escondas: documenta el conflicto según la gobernanza del repo.

---

# 8. NIVEL DE AMBICIÓN

No quiero un “prototipo educativo bonito”.

Quiero una experiencia que aspire a que alguien pregunte:

> “¿Cómo puede ser que esto sea educativo?”

antes que:

> “Está bueno para aprender matemática.”

El estándar debe contemplar al menos:

- game feel excelente;
- arte con identidad;
- animación y feedback con intención;
- transformaciones satisfactorias;
- audio y música que sostengan emoción y lectura;
- personajes memorables;
- humor propio del mundo;
- onboarding elegante;
- puzzles que produzcan aha moments;
- variedad sin perder lenguaje común;
- narrativa no escolarizada;
- restauración significativa;
- UX clara;
- accesibilidad cognitiva;
- estabilidad;
- performance razonable en las plataformas que el proyecto realmente soporte;
- ausencia de placeholders en el recorrido que declares terminado.

“AAA” aquí significa **coherencia y polish de todas las capas**, no presupuesto artificial.

---

# 9. REFERENCIAS: ESTÚDIALAS, NO LAS COPIES

Usa como referencias de diseño, entre otras:

- **The Witness** — aprendizaje sin exposición, variación, transferencia;
- **Baba Is You** — reglas como materia manipulable;
- **Patrick's Parabox** — estructura, escala y sorpresa lógica coherente;
- **Monument Valley** — geometría convertida en mundo y asombro;
- **Portal / Portal 2** — enseñanza ambiental, humor, progresión y set pieces;
- **Breath of the Wild / Tears of the Kingdom** — juguetes sistémicos y autoría de solución;
- **DragonBox** — manipulación antes del símbolo;
- **Euclidea** — construcción geométrica y elegancia;
- **Minecraft / LEGO** — alfabetización manipulativa y construcción desde unidades.

También estudia las lentes pedagógicas mencionadas en el GDD:

- Bruner;
- Concrete–Representational–Abstract;
- Raymond Duval y múltiples registros de representación;
- constructionism/Papert;
- productive failure/Kapur;
- Variation Theory;
- embodied cognition;
- Pólya;
- low floor / high ceiling / wide walls.

Si necesitas referencias visuales, técnicas, pedagógicas o de UX adicionales, búscalas.

No conviertas la investigación en un entregable eterno: úsala para tomar mejores decisiones y construir.

---

# 10. NARRATIVA Y HUMOR

Quiero que la matemática invada la ficción de Arithmos.

Los habitantes deben parecer habitantes de un universo donde estructura, equivalencia, forma, relación y medida son cosas cotidianas.

No escribas profesores con sombrero de mago.

Crea personajes con deseos, defectos, cultura, manías y humor propios.

El humor debe nacer de la lógica del mundo.

Debe haber chascarrillos o situaciones que funcionen aunque el jugador no conozca el término técnico y que tengan una segunda lectura cuando comprende el concepto.

No uses chistes escolares pegados sobre la escena.

Puedes crear un companion memorable si mejora la experiencia, pero no es obligatorio.

Si hay companion, nunca debe resolver el razonamiento por el jugador ni convertirse en tutorial parlante.

---

# 11. DISEÑO DE PUZZLES: CONDICIONES, NO SOLUCIONES FIJAS

Diseña el sistema de manera que valide **estados y relaciones correctas**, no secuencias exactas del diseñador, siempre que el dominio admita varias soluciones.

Quiero que el jugador pueda:

- leer el estado;
- formar una hipótesis;
- actuar;
- observar una consecuencia;
- corregirse;
- descubrir otra representación;
- transferir la idea.

No quiero:

- “resuelve 7 × 8 para abrir”;
- casillas de respuesta;
- multiple choice como núcleo;
- cuentas grandes como dificultad;
- brute force barato;
- un cartel de “incorrecto”;
- diálogos que den la respuesta;
- una única solución hardcodeada por comodidad.

La transferencia al final del arco es obligatoria.

---

# 12. FORMALIZACIÓN Y BITÁCORA

La Bitácora debe aparecer como reconocimiento posterior de lo vivido.

El jugador primero entiende una relación por experiencia.

Después puede descubrir que esa relación también puede verse como:

- número;
- agrupación;
- expresión;
- diagrama;
- término matemático;
- otra representación pertinente.

No conviertas la Bitácora en manual previo ni checklist escolar.

---

# 13. INVESTIGA Y PROTOTIPA ANTES DE CASARTE CON LA PRIMERA IDEA

Para decisiones de alto impacto —por ejemplo representación espacial, cámara, manipulación, lectura de equivalencia o transformación— no asumas que la primera implementación es la mejor.

Haz experimentos pequeños cuando sea necesario.

Compara por experiencia real:

- legibilidad;
- placer de manipulación;
- claridad causa–efecto;
- posibilidad de múltiples soluciones;
- potencial audiovisual;
- accesibilidad;
- coste de escalar a un arco completo;
- compatibilidad con integración en Roxana.

Después decide.

No mantengas varias implementaciones rivales dentro del producto final sólo por indecisión.

---

# 14. IMPLEMENTA, NO SÓLO DOCUMENTES

Este encargo termina con juego funcionando.

No lo consideres cumplido si sólo produces:

- GDD adicional;
- wireframes;
- concept art;
- mocks;
- una escena aislada;
- un puzzle suelto;
- una tech demo;
- screenshots;
- videos sin recorrido jugable.

El Arco I debe poder recorrerse de extremo a extremo en la build del proyecto.

Puedes actualizar documentación existente cuando una decisión concreta necesite quedar registrada, pero no conviertas el trabajo en burocracia documental.

---

# 15. INTEGRACIÓN CON EL REPOSITORIO

Respeta las reglas del `AGENTS.md` raíz.

Antes de introducir una dependencia, asset, fuente, librería o servicio:

- verifica que sea realmente necesario;
- revisa licencia;
- evita generar gastos sin autorización;
- no publiques secretos;
- evita cambios incidentales en otros mundos.

No borres baselines de otros agentes ni otros mundos para simplificar tu trabajo.

Si necesitas tocar infraestructura compartida, haz el cambio mínimo y valida regresiones.

---

# 16. VALIDACIÓN OBLIGATORIA

No te conformes con que compile.

Debes validar:

## Funcional

- recorrido end-to-end;
- estados persistentes necesarios;
- entrada y salida del mundo;
- interacción principal;
- restauración;
- no softlocks razonables;
- reintento y recuperación.

## Pedagógica

- concepto observable sin texto;
- acción antes de formalización;
- fallos informativos;
- transferencia;
- múltiples soluciones cuando corresponda;
- ausencia de respuesta escolar como núcleo.

## UX

- onboarding;
- legibilidad del estado;
- lectura de consecuencias;
- pistas que no roben razonamiento;
- controles en los dispositivos realmente soportados.

## Técnica

Ejecuta los comandos de build/test/verify definidos por el repositorio y agrega pruebas cuando la nueva lógica lo justifique.

No debilites tests para conseguir verde.

## Visual

Recorre personalmente las escenas relevantes.

No aceptes una captura bonita como prueba de que el juego se entiende al jugar.

---

# 17. PLAYTEST COMO CRITERIO DE DISEÑO

Durante el desarrollo, intenta responder con evidencia:

- ¿el jugador predice transformaciones?;
- ¿entiende qué propiedad se conservó?;
- ¿busca otra representación cuando se atasca?;
- ¿un fallo le enseña algo?;
- ¿resuelve una variante sin tutorial nuevo?;
- ¿experimenta después de haber encontrado una solución?;
- ¿los personajes parecen habitantes y no docentes?;
- ¿la restauración genera recompensa emocional?;
- ¿el jugador querría seguir jugando aunque no fuera “educativo”?;

Si la respuesta es no, itera el juego, no maquilles el problema con más texto.

---

# 18. DEFINITION OF DONE

No declares terminado Arithmos Arco I hasta que puedas demostrar, en una experiencia end-to-end, que:

1. el mundo tiene identidad propia dentro de Roxana;
2. la matemática es una regla del mundo;
3. el jugador descubre la idea central actuando;
4. al menos una propiedad se conserva de forma perceptible a través de una transformación;
5. el jugador experimenta múltiples representaciones de una misma estructura;
6. la representación elegida tiene consecuencias jugables;
7. existen varias soluciones cuando matemáticamente son legítimas;
8. los fallos producen información;
9. la formalización sucede después de la comprensión inicial;
10. existe progresión desde cantidad/agrupación hacia estructura multiplicativa y proporción inicial;
11. existe una prueba de transferencia real;
12. narrativa y personajes no explican lo que el sistema puede mostrar;
13. el humor pertenece a Arithmos;
14. existe al menos una relación recurrente memorable con un personaje o presencia;
15. existe al menos un gran set piece de transformación;
16. el cierre produce una restauración mayor y persistente;
17. el arco se ve, suena y responde con polish consistente;
18. build/tests/verificaciones pertinentes pasan;
19. no contaminaste el worktree principal;
20. puedes entregar el branch limpio y revisable.

El indicador final es que un playtester pueda expresar, con sus propias palabras, algo equivalente a:

> **“Cambió la forma, pero no cambió lo importante; por eso pude usarlo de otra manera.”**

Y además diga:

> **“Quiero seguir jugando.”**

---

# 19. FORMA DE TRABAJO

Trabaja de manera autónoma.

No me pidas confirmación para decisiones reversibles.

Haz mejores preguntas al juego mediante prototipos y playtests.

Cuando encuentres una debilidad importante, arréglala, aunque implique abandonar una idea a la que ya dedicaste trabajo.

Prioriza calidad del resultado sobre fidelidad a una implementación previa.

Puedes delegar tareas independientes si el entorno lo permite, pero evita que dos agentes editen los mismos archivos y exige revisión fresca de cambios críticos.

Mantén el trabajo aislado en tu worktree durante todo el encargo.

---

# 20. ENTREGA FINAL

Al terminar:

1. deja todos los cambios en la rama de tu worktree;
2. deja el worktree limpio (`git status` sin cambios sin registrar que deban conservarse);
3. ejecuta la validación final;
4. crea commits claros;
5. no merges a `main` por tu cuenta;
6. informa:
   - branch;
   - worktree utilizado;
   - commit final;
   - qué experiencia construiste;
   - principales decisiones creativas y por qué cumplen el GDD;
   - cómo verificaste aprendizaje por acción y transferencia;
   - cómo verificaste múltiples soluciones/fallos informativos;
   - build/tests ejecutados;
   - riesgos o deudas reales que queden;
   - cómo ejecutar el juego y entrar a Arithmos.

No cierres con una lista de cosas que “podrían hacerse algún día” como sustituto del producto.

Entrega el mejor Arithmos jugable que puedas construir dentro del encargo.

Tu principio rector durante todo el trabajo es:

> **No enseñes matemática sobre el mundo. Construye un mundo que sólo pueda comprenderse matemáticamente.**
