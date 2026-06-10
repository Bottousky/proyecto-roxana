# Proyecto Roxana — Síntesis de diseño v1
*Documento de trabajo — junio 2026*

## 1. Concepto

Juego narrativo educativo. Un estudiante llega "por descarte" al Instituto Roxana, una escuela técnica viva pero detenida: prestigio viejo, rutinas vacías, memoria perdida. Las aulas abren puertas a mundos conceptuales donde el conocimiento técnico sobrevivió degradado en ritual y superstición. El jugador aprende reactivando mundos; la Bitácora convierte la experiencia vivida en conocimiento formal, siempre después del hecho.

**Pitch:** "Una escuela olvidó lo que sabía. Vos vas a recordarlo jugando."

**Simetría temática central:** el Instituto y Ohmdal tienen la misma enfermedad — conservan las formas del conocimiento pero perdieron la comprensión. Restaurar los mundos restaura, de a poco, al Instituto. Esta es la columna vertebral narrativa de todas las unidades.

**Tono:** misterioso, académico, cálido, técnico, melancólico, humor breve y natural, esperanzador.

## 2. Core loop

**Micro:** observar fenómeno → hipótesis diegética → manipular → feedback del mundo (lámparas, humo, Ohm, diálogos reactivos) → ajustar → resolver.

**Macro (por unidad):** explorar Instituto → entrar al mundo conceptual → cadena de puzzles en lenguaje diegético → evento de formalización → entrada de Bitácora → restauración visible del mundo → cambio en el Instituto → gancho a la siguiente unidad.

La recompensa emocional macro es la **restauración visible**: cada concepto comprendido = luz que vuelve.

## 3. Prólogo + Unidad 1 "La corriente no es magia" (20–30 min)

Secuencia: llegada → hall/preceptor → despacho → Bitácora → aula de Electrónica → proyector institucional → portal → plaza apagada → reactivar a Ohm (camino completo) → taller de Lumen (Piedra de Freno) → Puerta de Ohm → formalización I=V/R → plaza restaurada → Campana de Ohmdal (gancho a circuitos multi-camino).

Ajustes clave:
- Prólogo 5–8 min máx., con 2–3 interacciones opcionales con personalidad (vitrina, cartel de honores borrado) para evitar sensación de pasillo-tutorial.
- La Bitácora registra algo trivial apenas se obtiene (boceto del hall + nota) para enseñar su función de registro sin explicación.
- El proyector institucional define el tono: video escolar viejo, formal, levemente absurdo.
- Reactivar a Ohm = tutorial puro de "camino completo", sin tensión ni resistencia.
- Taller de Lumen = primer espacio de falla segura: quemar/humear sin castigo es prerequisito conceptual de la Puerta.
- La Campana muestra dos caminos posibles de corriente: el gancho a serie/paralelo vive en el mundo, no en texto.

Ritmo: ~25% prólogo, ~60% Ohmdal, ~15% formalización + cierre.

## 4. La Bitácora (sistema triple)

**Juego:** menú diegético (mapa, entradas, objetivos como notas del protagonista). Regla inviolable: nunca escribe sobre algo que el jugador no vivió. Entradas desbloqueadas por flags de eventos de comprensión, no por avance de trama.

**Educativo:** cada entrada tiene dos capas:
1. *Vivencial* (arriba): "lo que pasó", primera persona, lenguaje diegético, boceto.
2. *Formal* (abajo): concepto, explicación ordenada, fórmula, errores comunes, mini-pregunta/actividad.

La estructura de dos capas hace visible la **traducción** experiencia→conocimiento, que es el tema del juego.

**Progreso:** la Bitácora es el save file conceptual: % de mundo restaurado, entradas completas/incompletas. Exportable (PDF/web) como material de estudio real → argumento B2B escolar.

**Mecánica extra recomendada:** entradas incompletas con espacios en blanco ("¿Qué pasa si el freno es demasiado chico? No lo probé todavía") — convierte curiosidad en rejugabilidad sin obligar.

## 5. Anti-"clase pegada encima"

1. Orden inviolable: fenómeno → manipulación → consecuencia → formalización.
2. El vocabulario técnico es spoiler: tabla de léxico por unidad (diegético/técnico/momento de conversión), auditar diálogos contra ella. Nadie dice "voltaje" antes de la Puerta de Ohm.
3. NPCs equivocados de formas útiles: sus misconcepciones mapean a misconcepciones reales de estudiantes (ej. "la corriente se gasta en el camino").
4. Bitácora opt-in: el juego nunca bloquea avance detrás de leer texto.
5. Las preguntas de la Bitácora se responden jugando, no tipeando; el juego las registra solo.

**Léxico Unidad 1:** tensión=Empuje · corriente=Río/Chispa · resistencia=Piedra/Freno · circuito cerrado=Camino completo. I=V/R aparece solo tras la Puerta de Ohm.

## 6. Puzzles de Ley de Ohm

Una variable nueva por puzzle:

| Puzzle | Concepto | Manipulación | Feedback de fallo |
|---|---|---|---|
| Reactivar a Ohm | Camino completo | Conectar/cerrar | Nada ocurre; Ohm inerte |
| (Fuente de la plaza)* | Empuje | Elegir fuentes | Lámpara tenue; Ohm bosteza |
| Piedra de Freno | Resistencia | Insertar/cambiar piedras | Humo, chispas, fusible; Ohm vibra |
| Puerta de Ohm | Relación V-I-R | Ajustar dos variables hacia corriente objetivo | Poco → no se mueve; mucho → se traba y humea |

*Se corta en el vertical slice; el Empuje se introduce dentro de la Puerta.

**Puerta de Ohm:** indicador analógico (aguja en zona marcada, sin números), ~3 fuentes de Empuje × ~4 Piedras de Freno, **múltiples soluciones válidas** (mucho empuje+mucho freno ≈ poco+poco) — eso ES la proporcionalidad descubierta con las manos. Ohm como medidor vivo redundante (aguja=precisión, Ohm=lectura emocional). El fallo produce información, nunca pérdida (reset diegético: fusibles rituales de Lumen con comentario distinto cada vez). Valores cualitativos o en unidades ficticias hasta la formalización; las unidades reales aparecen en la Bitácora como "el nombre verdadero de las cosas".

## 7. Personajes

- **Ohm** — el instrumento con alma. Amperímetro emocional: animación+sonido distintivos por estado (inerte/débil/estable/sobrecarga). No habla, o casi; su elocuencia es física. Reserva narrativa de largo plazo: un autómata antiguo *vio* cómo Ohmdal olvidó — no gastar su backstory en la Unidad 1.
- **Edda** — la escéptica práctica. Avatar de la pregunta del jugador; humor por fricción con Lumen; modela actitud científica sin dar respuestas.
- **Maese Lumen** — la tradición que conserva sin comprender. Sus rituales son procedimientos técnicos fosilizados. Arco: de "el forastero profana" a "el forastero recuerda". Él dice la frase guía citando a los antiguos: *"Donde otros ven magia, buscá camino."*

Regla compartida: **ninguno explica; los tres reaccionan** (Edda al resultado, Lumen al método, Ohm al estado eléctrico).

## 8. Formato visual/interactivo

Comparación: top-down 2D gana en costo, pipeline IA, web/mobile y escalabilidad; lateral pierde legibilidad espacial de circuitos; point-and-click encarece por arte único por escena; 3D (voxel o modelado) es riesgoso en mobile web y caro para esta escala.

**Recomendación: híbrido de dos vistas.**
- **Exploración 2D top-down** (Instituto + Ohmdal): tilesets reutilizables, restauración del mundo visible en el mapa, legible en pantalla chica.
- **Vista de banco (close-up)** para puzzles: el circuito grande, claro, manipulable con tap directo. Resuelve la ilegibilidad de componentes en top-down mobile.
- Estilo: ilustrado/pintado, paleta cálida-melancólica (pixel art de alta calidad como plan B presupuestario).
- El patrón top-down + banco + Bitácora es el contrato de producción para todas las unidades futuras (química=mesa de alquimia, mecánica=banco de engranajes).

## 9. Distribución

Web-first es correcto: el modelo educativo depende de "se abre con un click en un Chromebook escolar".

1. **Fase 1:** vertical slice web gratuito (itch.io + dominio propio) como demo permanente y validación.
2. **Fase 2:** plataforma propia con cuentas, progreso persistente, Bitácora exportable; unidades como contenido (freemium / licencia escolar).
3. **Fase 3:** empaquetado del mismo build para Steam (Electron/Tauri) y mobile nativo (Capacitor) si hay tracción.

Modelo: B2C freemium suave + B2B escolar (licencias con panel docente y analíticas — la feature que convierte el producto en algo que una escuela paga).

## 10. Arquitectura web

- **Stack:** Phaser 3 + TypeScript para escenas; **Bitácora en DOM/HTML sobre el canvas** (texto nítido, accesible, exportable a PDF, indexable). Alternativa Godot 4 web export defendible solo si el equipo ya lo domina; para web-first puro, Phaser gana.
- **Progreso:** local-first (localStorage/IndexedDB) + sync a backend con cuenta (Supabase/Firebase). Jugador anónimo juega completo sin registro.
- **Videos:** embebidos en la Bitácora como anexos opcionales post-formalización; nunca en el flujo de juego.
- **Tienda/descargables:** páginas web normales alrededor del juego, no sistemas dentro del motor.
- **Unidades futuras:** módulos con code-splitting + assets lazy; actualizaciones sin reinstalar; telemetría educativa con herramientas web estándar.
- **Presupuesto mobile:** <25 MB carga inicial, 60 fps en Android gama media de hace 4 años, touch de primera clase. Probar en dispositivos reales desde la semana 1.

## 11. Riesgos

1. La formalización se siente premio para unos y tarea para otros → entradas cortas, hermosas, opcionales en profundidad; medir en playtest.
2. Scope creep multi-mundo → no diseñar Unidad 2 hasta validar la 1; fijar el patrón reutilizable como contrato.
3. Doble audiencia (jugador/docente) = producto para nadie → jugador primero; B2B después de validar diversión.
4. Mobile web frágil (Safari iOS, audio, memoria) → dispositivos reales desde el día 1.
5. Assets IA inconsistentes → biblia de estilo antes de generar en volumen; mano humana en personajes clave y Ohm.
6. Error técnico en contenido educativo destruye credibilidad B2B → revisión docente de cada entrada antes de publicar.

## 12. Vertical slice

**Hipótesis a validar:** (a) el loop experimentar→formalizar se siente recompensa; (b) la Puerta de Ohm enseña la relación V-I-R sin explicarla antes.

**Contenido:** Instituto = hall + despacho + aula (3 pantallas). Ohmdal = plaza + taller + Puerta (3 pantallas). Puzzles: reactivar a Ohm, Piedra de Freno, Puerta de Ohm. Bitácora: 2 entradas (Camino completo, Ley de Ohm) en DOM. Personajes: preceptor (1 diálogo), Edda y Lumen ~15 líneas reactivas c/u, Ohm con 4 estados animados. Duración: 15–20 min. Plataforma: web desktop + Android Chrome (iOS se prueba, no bloquea).

**Plazo:** 1 dev + 1 artista (o pipeline IA + retoque), 8–10 semanas.
- S2: greybox de los 3 puzzles sin arte.
- S4: Puerta de Ohm con feedback completo (hito crítico).
- S7: arte y diálogos integrados.
- S8–10: playtests con 10+ personas del público objetivo.

**Criterio de éxito:** 7/10 playtesters resuelven la Puerta sin ayuda externa Y pueden enunciar la relación V-I-R con sus palabras; ≥50% relee una entrada de Bitácora voluntariamente.

---

## Addendum v1.1 — decisiones tomadas (junio 2026)

**Lore: los Mundos Aplicados.** Los mundos conceptuales fueron *creados por el propio Instituto* para enseñar («que la electricidad se aprenda caminándola»). Esto justifica el acceso por aula, explica que los mundos estén degradados (se degradaron junto con la escuela que los mantenía) y planta la pregunta de largo plazo: ¿quién los construyó y por qué se abandonaron? El proyector institucional lo establece en el prólogo. Línea clave: «el mundo responde a la comprensión del estudiante; la incomprensión también deja huella».

**Motor: Phaser 4 (v4.1.0 estable), no Phaser 3.** Phaser 4 es la rama actual con renderer nuevo y API continuista; empezar hoy en 3.x sería nacer con deuda técnica. Verificado: el greybox compila y corre en 4.1.0.

**Piedras de Freno = código de colores real de resistencias.** Las piedras llevan banda de color con el código verdadero (marrón=1, rojo=2, amarillo=4, gris=8). En Ohmdal es «el código de los Maestros»; la entrada «La Piedra de Freno» de la Bitácora revela tras la formalización que es el código real (tabla 0–9 completa). El jugador llega a las resistencias físicas reconociendo las bandas.

**Distribución: web propia.** El build es estático (Vite, rutas relativas), se sube a cualquier hosting. itch.io queda como espejo opcional de descubrimiento, no como canal principal.

**Vertical slice greybox: CONSTRUIDO y verificado E2E** (título → hall → Bitácora → aula → proyector → portal → plaza → despertar a Ohm → taller → freno → Puerta de Ohm → formalización → campana → fin). Ver README.md. Próximos pasos: playtest con personas reales sobre el greybox, luego pipeline de arte.

**Pipeline de assets (para reemplazar el greybox):**
1. *Biblia de estilo primero*: paleta, proporciones y 3–5 imágenes canónicas (el hall, la plaza, Ohm) hechas con cuidado — a mano, con IA iterada, o encargadas. Todo lo demás se genera contra esa referencia.
2. *Tilesets y fondos*: generación con IA (PixelLab, Retro Diffusion, Scenario con estilo entrenado, o Stable Diffusion + LoRA local) + corrección de seams con herramientas de tiles. Los fondos de las vistas de banco son ilustraciones únicas: el caso más fácil para IA.
3. *Personajes y Ohm*: pocos, con peso emocional → la mayor inversión manual o el encargo a un artista. Ohm necesita 4 estados animados consistentes.
4. *Assets gratuitos*: solo como placeholder de escala/medida, nunca en la versión final (sensación de genérico confirmada por el autor).
