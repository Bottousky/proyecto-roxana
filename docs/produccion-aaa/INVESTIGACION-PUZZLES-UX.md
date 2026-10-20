# Bancos de Ohmdal: investigación de UX/UI de puzzles

**Diagnóstico.** Lo que reporta el usuario (no se entiende qué hacer, ni cómo, ni cuándo terminó, ni cómo seguir) se explica con cuatro fallas que las fuentes documentan bien: el objetivo no está a la vista, hay demasiadas opciones al mismo tiempo, el feedback no explica nada y el cierre es ambiguo. Lo que no pude comprobar en una fuente primaria está marcado **[no verificado]**.

## 1. Hallazgos por fuente

### Educación de circuitos

- **PhET, "implicit scaffolding"** (Podolefsky, Moore y Perkins, 2013) — https://arxiv.org/pdf/1306.6544. Salió de 125 simulaciones y más de 600 entrevistas. La pantalla inicial es simple a propósito. La primera interacción se sugiere con color y ubicación, casi nunca con texto. Los alumnos tocan primero lo central y colorido y recorren las herramientas de arriba abajo, así que lo fundamental va arriba. Las etiquetas son cortas y van pegadas al objeto, y los rangos de los controles están acotados. Gráficos y lecturas **arrancan apagados**, para no abrumar y para que se les preste atención cuando se prenden. La complejidad se reparte en pestañas que van aflojando restricciones. La meta, en palabras de los autores: "guides without students feeling guided".
- **Guía de Circuit Construction Kit: DC** (PhET, 2026) — https://phet.colorado.edu/files/teachers-guide/circuit-construction-kit-dc-html-guide_en.pdf. La pantalla Intro (pila, lámparas, interruptor) está separada de Lab (instrumentos). Los números aparecen recién al activar "Show values". El flujo de electrones o de corriente se anima, aclarando que es una aproximación. El brillo es proporcional a la potencia y el cortocircuito se muestra con fuego más un aviso. Cada consigna es una sola frase ("armá un circuito que encienda una lámpara").
- **Finkelstein et al., 2005** — https://journals.aps.org/prper/abstract/10.1103/PhysRevSTPER.1.010103. Con la simulación, los alumnos superaron a los de laboratorio real en lo conceptual y también armando circuitos reales. El resumen destaca que la simulación muestra explícitamente el flujo de electrones.
- **Taconis et al., 2014, juego "E&E"** — https://www.scitepress.org/Papers/2014/47932/47932.pdf. Es el hallazgo más importante para Ohmdal: **el layout del tablero enseña física**, bien o mal. El 54% de los alumnos (77% en secundaria general) copió la topología lineal de la pantalla y agregó al "principio" un interruptor que nadie había pedido. Jugar libre sin reflexión no alcanzó; alternar el juego con momentos de verbalización mejoró las notas. La versión rediseñada mostraba siempre el lazo cerrado.
- **Carga cognitiva.** Kirschner, Sweller y Clark (2006), https://www.davidlewisphd.com/courses/EDD8121/readings/2006-Kirschner_et_al.pdf, y CESE NSW, https://education.nsw.gov.au/about-us/educational-data/cese/publications/literature-reviews/cognitive-load-theory.html: el principiante necesita guía, la memoria de trabajo maneja unos cuatro elementos y la guía se retira a medida que hay pericia. **Mayer** (https://services.dartmouth.edu/TDClient/1806/Portal/KB/PrintArticle?ID=171655): sacar lo que no aporta, señalar lo importante, poner el texto junto a lo que explica y no duplicar voz con texto.
- **ThinkFun Circuit Maze** — https://legacy.thinkfun.com/products/circuit-maze/. Cada carta dice qué piezas usar y qué balizas tienen que encenderse. Hay 4 niveles, la solución está al dorso y el LED real confirma.
- **AAA.** En BioShock, el hackeo es tipo Pipe Dream con reloj y se puede saltear (https://wurb.com/stack/?p=1161). Spider-Man (2018) pide un voltaje objetivo con piezas limitadas (https://stevivor.com/guides/spider-man-circuit-projects-guide-all-puzzles-solved/), y las reseñas lo llamaron tedioso **[cita de Tom's Guide sin verificar]**. Insomniac permitió saltear esos puzzles, y AbleGamers lo usa de ejemplo del patrón "Bypass" (https://accessible.games/accessible-player-experiences/challenge-patterns/bypass/).

### Diseño y enseñanza de puzzles

- **Portal.** Según el comentario de los desarrolladores (https://theportalwiki.com/wiki/Portal_developer_commentary), todo el juego es un entrenamiento que introduce herramientas y después las combina. Un puzzle se movió de lugar porque metía demasiados conceptos juntos. Se agregaron "compuertas" (pausas obligadas) para que el jugador mire. En el postmortem de GDC 2008 (https://www.gamedeveloper.com/pc/best-of-gdc-the-secrets-of-i-portal-i-s-huge-success) cuentan que un campo de fuerza confuso pasó a ser vidrio.
- **Kishōtenketsu** (Hayashida, vía GMTK): introducir, desarrollar, dar un giro y cerrar una idea en unos 5 minutos. https://www.mcvuk.com/development/video-nintendos-level-design-secrets-in-four-steps
- **Patrick's Parabox**, GDC 2024 (diapositivas leídas): https://media.gdcvault.com/gdc2024/Slides/GDC+slide+presentations/Traynor_Patrick_SystemCentricPuzzle.pdf. Los puzzles están para mostrar el sistema, no para trabar. Cada uno es lo más fácil posible sin perder su idea: menos pasos, menos posibilidades, tamaño bocado. La curva se suavizó reordenando niveles o volviéndolos opcionales. Hubo unos 15 playtests en video con narración, con testers no expertos y siempre nuevos. Según https://siddarthrg.substack.com/p/tutorial-design-of-patricks-parabox, entra como máximo un concepto nuevo por nivel y deshacer y reiniciar están siempre visibles.
- **Horizon Forbidden West, Relic Ruins** (Wewerinke, GDC 2024): https://www.guerrilla-games.com/read/relic-ruins-creating-environmental-puzzles-for-horizon-forbidden-west. Un tester puso 5/10 porque no sabía cuál era su objetivo; cuando hicieron visible la meta desde temprano, las reseñas subieron a 9/10. La música marca los pasos clave y el final. Aloy da pistas si el jugador lleva un par de minutos trabado, aunque las pistas genéricas a veces confundían. Una recompensa inútil ("medias abrigadas") hundió a 3/10 un puzzle que había gustado.
- **The Witness** (https://en.wikipedia.org/wiki/The_Witness_(2016_video_game); Blow en IndieCade: https://gamedeveloper.com/design/indiecade-inside-jonathan-blow-s-puzzle-design-process). El feedback es inmediato, con sonido e imagen. Los paneles están unidos por cables que se iluminan al resolverlos y habilitan el siguiente. Un puzzle tiene que reconocerse al instante. Ojo: no explicar nada sirve para entusiastas, no para un público familiar.
- **Cocoon** (Carlsen, vía Klepek): https://remapradio.com/articles/a-house-of-cards-built-on-trust-puzzle-design-in-cocoon-2/. Cada intento fallido tiene que mostrar que no funcionó, que insistir no lo va a arreglar, y por qué.
- **GMTK**, "What Makes a Good Puzzle?" (https://www.youtube.com/watch?v=zsjC6fa_YBg): mecánica, trampa, supuesto, revelación, poco ruido. El desafío está en cómo llegar, no en adivinar la meta **[paráfrasis de notas de terceros, https://notes.hamatti.org/gaming/puzzle-game-design]**. Elyot Grant agrega que el "eureka" no necesita dificultad (https://diplograph.net/notes/games/puzzle-design/eureka-is-not-fiero).
- **Monument Valley** (Ken Wong, GDC 2015): pensado para gente que no juega, con menos desafío y más experiencia. https://gamedeveloper.com/design/designing-the-surprise-mobile-game-hit-i-monument-valley-i-
- **Human Resource Machine** (https://tomorrowcorporation.com/posts/questions-about-the-machine): los puzzles principales los resuelve cualquiera y los desafíos difíciles son opcionales. Arranca con 2 comandos y llega a 11.
- **Lightbot** (https://www.lightbot.com/Lightbot_HowDoesLightbotTeachProgramming.pdf): la meta está dibujada en el tablero, y la falta de espacio obliga a usar procedimientos. **DragonBox** (https://en.wikipedia.org/wiki/DragonBox) cambia de a poco los dibujos por símbolos. **The Incredible Machine** (https://notes.andymatuschak.org/zEYFLQ99qFwbSswAV6NaX9T) usa una bandeja limitada como andamiaje.
- **Contraejemplos de dificultad.** Zachtronics trae manuales de más de 30 páginas (https://gdcvault.com/play/1025715/Open-Ended-Puzzle-Design-at). Turing Complete recibe quejas de objetivos vagos (https://vaporlens.app/app/1444480/turing_complete.md). Snakebird tuvo que sacar *Primer*, una versión fácil y familiar (https://en.wikipedia.org/wiki/Snakebird_(video_game)).
- **Breath of the Wild**: los santuarios duran unos 10 minutos (https://www.levelup.com/noticias/fujibayashi-explico-el-origen-del-sistema-de-shrines-en-zelda-breath-of-the-wild/) y su subtítulo nombra el tema, como "Electric Path" (https://thonky.com/zelda-breath-of-the-wild/shrine).

### Pistas, UX y accesibilidad

- **Layton** (https://en.wikipedia.org/wiki/Professor_Layton_and_the_Unwound_Future): tres pistas pagadas con monedas y una súper pista casi resolutiva. Se puede salir sin penalidad y volver después. **The Room**: las pistas se habilitan con el tiempo y se vuelven más específicas (https://godisageek.com/2014/01/the-room-two-review/); Fireproof no quiso cobrarlas (https://www.thesixthaxis.com/2013/04/26/talking-the-room-with-fireproofs-mark-hamilton/). **Machinarium** muestra la solución como historieta sin palabras (https://en.wikipedia.org/wiki/Machinarium). En **NSMB Wii**, la ayuda aparece después de varios fracasos y no usarla tiene premio (https://vooks.net/miyamoto-reflects-on-the-super-guide).
- **St Andrews** (https://research-repository.st-andrews.ac.uk/handle/10023/29069): las pistas que señalan la próxima deducción fácil fueron igual de útiles que resolver el paso, se sintieron menos como trampa y se usaron más. **[No verificado:** un estudio de UIUC según el cual una pista abstracta es peor que ninguna, https://ideals.illinois.edu/items/103606**]**.
- **Celia Hodent** (https://uxpod.com/episodes/competence-autonomy-relatedness-celia-hodent-on-games-design.html): aprender haciendo, feedback ante cada acción, no abrumar y volver a enseñar a quien regresa. **Juice** (Jonasson y Purho, https://rpgplayground.com/research-making-a-juicy-game/): feedback abundante.
- **Accesibilidad** (https://gameaccessibilityguidelines.com/full-list/): no transmitir nada esencial sólo con color, controles táctiles grandes y espaciados, y nada de timing preciso. Hoober vio que el 49% usa el teléfono con una mano (https://smashingmagazine.com/2016/09/the-thumb-zone-designing-for-mobile-users). Los mínimos de toque son 44 pt en iOS y 48 dp en Android.

## 2. Recomendaciones priorizadas para la pantalla de banco

1. **Objetivo en una frase, más la meta dibujada en el tablero:** "Encendé las dos lámparas", con las lámparas meta resaltadas por un halo del brillo esperado y un contador ○○. *Por qué:* Horizon (de 5/10 a 9/10), Lightbot, Circuit Maze. *Medir:* el jugador repite el objetivo con sus palabras en menos de 10 s; baja el tiempo hasta la primera acción útil.
2. **Un concepto nuevo por banco**, con la secuencia introducir → desarrollar → giro → cierre repartida entre bancos. *Por qué:* Portal, Parabox, kishōtenketsu. *Medir:* porcentaje que resuelve sin pista en cada banco y ausencia de picos de tiempo.
3. **Bandeja mínima y contada:** sólo las piezas de la solución, con su cantidad ("lámpara ×2"). Distractores, únicamente en bancos de giro. *Por qué:* Incredible Machine, Circuit Maze, PhET. *Medir:* acciones irrelevantes por banco.
4. **Corriente visible:** partículas que circulan sólo con el lazo cerrado y brillo proporcional a la potencia. *Por qué:* Finkelstein, PhET. *Medir:* lazo cerrado al primer intento, más una pregunta del tipo "¿qué pasa si abro acá?".
5. **Un layout que no enseñe física errónea:** el tablero se lee como un anillo, y la posición del interruptor y la pila cambia entre bancos. *Por qué:* Taconis. *Medir:* el acierto se mantiene en un banco de transferencia con otra disposición.
6. **Números apagados por defecto.** Los medidores aparecen sólo en los bancos que los enseñan. Si la meta es cuantitativa, mostrar "meta vs. actual" al lado del componente. *Por qué:* PhET, Mayer. *Medir:* aciertos en las preguntas cuantitativas.
7. **Resolución detectada sola y éxito inequívoco**, por tres canales: todo brilla y el cable hacia la puerta o el Faro se enciende (The Witness), suena una música (Horizon) y aparece una frase corta. Después, un único botón grande "Continuar" que vuelve a la historia. *Medir:* menos de 3 s hasta tocar "Continuar"; nadie pregunta "¿ya está?".
8. **El error se explica:** marcar dónde se corta el lazo, la polaridad invertida (flecha más + / −) y el cortocircuito (chispa), sin castigo. *Por qué:* Cocoon, Hodent, CCK. *Medir:* baja la repetición del mismo error tres veces o más.
9. **Deshacer y reiniciar siempre visibles; sin reloj.** *Por qué:* Parabox, Game Accessibility Guidelines, BioShock como contraejemplo. *Medir:* abandono del banco.
10. **Pistas en tres escalones, ofrecidas** después de un rato sin avanzar o de varios fallos: (a) recordar el concepto; (b) resaltar dónde mirar; (c) mostrar el próximo paso, y aparte un "mostrame la solución" explicado. *Por qué:* Layton, The Room, NSMB, St Andrews. *Medir:* tiempo hasta el éxito después de cada escalón y una encuesta de "¿se sintió trampa?".
11. **Pistas que dependen del estado,** disparadas por el error que se detectó y no por un timer genérico. *Por qué:* Horizon. *Medir:* QA de pistas que contradicen el tablero.
12. **Texto mínimo y pegado a las piezas** (menos de 25 palabras), con la voz acompañando sin repetir el texto. *Por qué:* PhET, Mayer. *Medir:* palabras en pantalla.
13. **"Por qué está bien", en una línea,** sobre el circuito resaltado ("Dos caminos: si uno se corta, el otro sigue"). *Por qué:* Taconis. *Medir:* una pregunta al salir y el acierto en el banco siguiente.
14. **Predecir antes de probar** en los bancos clave ("¿Va a brillar más o menos?"). *Por qué:* las consignas de PhET. *Medir:* el acierto de las predicciones sube a lo largo del arco.
15. **Título del banco que nombre el concepto** ("Dos caminos"). *Por qué:* BotW. *Medir:* al final, el jugador nombra los conceptos.
16. **Bancos cortos (2 a 5 minutos)** y retos opcionales para expertos. *Por qué:* HRM, BotW, Parabox. *Medir:* mediana de tiempo por banco.
17. **Presentación de 2 s al entrar:** la cámara se acerca a la meta antes de dar el control. *Por qué:* las compuertas de Portal; Horizon. *Medir:* tiempo hasta la primera acción relevante.
18. **Táctil y accesible:** tocar pieza y después ranura (además de arrastrar), imán generoso, objetivos de 48 px o más, polaridad con forma además de color y opción de saltear explicada. *Por qué:* Game Accessibility Guidelines, AbleGamers. *Medir:* toques errados en móvil frente a desktop.
19. **Playtest en video con narración**, con no expertos siempre nuevos, más telemetría de tiempo y errores. *Por qué:* Parabox, Portal, Horizon. *Medir:* problemas nuevos encontrados por sesión.

## 3. Layout de referencia

**Desktop (16:9):**
```
┌──────────────────────────────────────────────────────────────┐
│ [← Salir]    Banco 3 · «Dos caminos»       [💡 Pista] [↶] [⟲] │
│        Encendé las dos lámparas.        ○ ○  (0/2)           │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│        TABLERO GRANDE (≈70% del alto), lazo visible,         │
│        ranuras marcadas, lámparas meta con halo,             │
│        corriente animada al cerrar                           │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│  Bandeja:  [pila ×1]  [cable ×3]  [lámpara ×2]               │
└──────────────────────────────────────────────────────────────┘
```
**Éxito** (overlay; el tablero sigue animado debajo):
```
            ✓ ¡Funciona! Las dos lámparas brillan.
      «Con dos caminos, si uno se corta, el otro sigue.»
                    [  Continuar ▶  ]   (Enter / toque)
```
**Móvil apaisado** (dos pulgares: bandeja a la izquierda, acciones a la derecha):
```
┌────────────────────────────────────────────────────────┐
│ [✕]  Encendé las dos lámparas  ○○                       │
│ ┌──────┐                                    ┌───────┐  │
│ │ pila │       TABLERO (máximo posible)     │  💡   │  │
│ │cable │                                    │  ↶    │  │
│ │lámp. │                                    │  ⟲    │  │
│ └──────┘                                    └───────┘  │
└────────────────────────────────────────────────────────┘
```
"Salir" va arriba a la izquierda, lejos del pulgar, y pide confirmación sólo si hay progreso. "Continuar" va abajo al centro y ocupa todo el ancho útil. En vertical, la bandeja pasa abajo como fila y las acciones quedan encima.

## 4. Antipatrones

- Dar todas las piezas e instrumentos "por si acaso".
- Un tutorial modal o párrafos de texto antes de jugar.
- Números siempre prendidos.
- Un "Comprobar" que sólo dice "incorrecto": prueba y error a ciegas.
- Reloj, castigo o pérdida de progreso (BioShock).
- Éxito ambiguo: la lámpara prende y no pasa nada.
- Pistas genéricas o fuera de contexto.
- Recompensas sin sentido para la historia.
- Un layout lineal que sugiere que la corriente "se gasta".
- Dos conceptos nuevos en el mismo banco.
- Un minijuego repetitivo y desconectado del mundo (Spider-Man).
- Polaridad sólo por color.
- Dificultad de nicho (Sausage Roll, Snakebird, Zachtronics) para un público familiar.

## 5. Límites

Sin verificar en fuente primaria: la cita de GMTK, el estudio de UIUC, la estructura no lineal de Talos Principle, que BioShock Infinite haya eliminado el hackeo, la reseña de Tom's Guide y los detalles de Lara Croft GO y Hitman GO. No investigué en profundidad: Captain Toad, Hidden Folks, Townscaper, Viewfinder, Gorogoa, Mini Metro, Islanders, Logic World, Infinity Loop, Flow Free, Opus Magnum, Starfield, Control, Assassin's Creed, Genshin, Tears of the Kingdom, Ocarina, Snap Circuits ni los kits de robótica.
