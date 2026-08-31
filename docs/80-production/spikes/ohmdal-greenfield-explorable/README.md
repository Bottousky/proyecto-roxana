---
status: EXPERIMENTAL
authority: PROPOSED
scope: exploración greenfield de experiencia
date: 2026-08-21
---

# Ohmdal explorable — spike greenfield

## Recomendación en una frase

Construir Ohmdal como una **aventura de exploración en tercera persona, sin combate, en un mundo 3D estilizado como una ilustración habitable**, con cámara cercana y serena, lugares compactos pero densos, y momentos de inspección donde Ohm funciona como instrumento diegético: el jugador camina, observa síntomas, conversa, conecta o mide una instalación y ve cómo la vida cotidiana cambia.

No se propone un RPG de estadísticas ni una colección de acertijos separados. Se propone un mundo donde cada calle, taller, campana, lámpara y máquina cuenta dos historias simultáneas: para qué la usa la comunidad y qué modelo eléctrico explica su comportamiento.

## Estado y límites

Este paquete es una exploración **EXPERIMENTAL / PROPOSED**. No asciende ninguna decisión a canon, no prescribe tecnología y no modifica la producción vigente. Conserva únicamente:

- Ohmdal como civilización medieval-electrónica que olvidó los principios y retuvo rituales;
- `CONECTAR` como verbo nuclear;
- electricidad DC como comportamiento legible del mundo;
- el estudiante, Ohm, Edda, Lumen, la Consejera, Yesca, Vega y Nereo con sus funciones narrativas existentes;
- fenómeno → intervención → consecuencia → hipótesis → formalización.

No inventa nuevos nombres, protagonistas ni trama. Cuando una escena futura necesite un nombre o diálogo no definido, corresponde `TODO(guion)`.

## Prototipo jugable (greybox)

Hay un slice jugable, aislado de `/jugar` (Phaser no se toca):

```text
http://localhost:5173/ohmdal-plaza
```

Arranque:

```bash
npm run dev
```

Abrí `/ohmdal-plaza`, pulsá **Entrar**. En dev, `?auto` salta el título.

**Qué se puede jugar ahora**

1. El Portal se apaga y entregás el control en unos segundos (WASD o flechas para saltar el encuadre).
2. Caminás una Plaza compacta en tercera persona: piedra cálida, traza de cobre, agua quieta, campana muda, Portal extinguido.
3. Ohm está inerte junto al mecanismo público (campana + fuente ficticia). Es un placeholder `TODO(dirección)`, no canon espacial.
4. Edda entra por la misma traza, nombra los dos relatos canónicos y cierra con «No te pregunté qué creés. Te pregunté qué viste.» Luego se va por su lado. Con E podés señalar una evidencia; el croquis guarda la observación.
5. Recorrés ida y retorno. Cerrar sólo la ida no despierta a Ohm. Cerrar el retorno (con la ida asentada) lo despierta: luz ámbar estable, sonido y movimiento, y la línea «Trayectoria completa. Conciencia… también. Orden de causalidad: pendiente.»
6. Después, E en Ohm («Decisión bilateral registrada.») y dos bornes cerámicos: Ohm dice continuidad o dato insuficiente, nunca la solución.

**Controles:** WASD / flechas, clic para mirar con el ratón, E (o espacio) para acercar. En táctil: arrastre izquierdo mueve, derecho mira, botón E.

**Greybox a propósito:** volúmenes simples, materiales toon, personajes cápsula. No hay arte final ni las 9 referencias importadas como assets.

**Qué no es:** no reemplaza `/jugar`, no hay combate, quiz, `V`/`I`/`R` ni Lumen.

Código: `src/experiences/ohmdal-plaza/`. El modelo pedagógico (ida / retorno / lectura) vive en `models/camino.ts` y se testea en `tests/plaza-camino.test.ts`.

## Cómo leer el spike

1. [DIRECTION.md](DIRECTION.md): forma recomendada, experiencia objetivo y alternativas descartadas.
2. [VISUAL_LANGUAGE.md](VISUAL_LANGUAGE.md): síntesis de las nueve imágenes de Manuel en un lenguaje visual coherente.
3. [EXPLORATION_LOOP.md](EXPLORATION_LOOP.md): qué hace el jugador minuto a minuto y cómo el mundo recompensa la curiosidad.
4. [PEDAGOGY.md](PEDAGOGY.md): currículo DC convertido en fenómenos, decisiones y transferencia.
5. [SLICE_PLAZA.md](SLICE_PLAZA.md): prueba concreta de apertura, desde el Portal hasta el despertar de Ohm en la Plaza.
6. [PRODUCTION_BET.md](PRODUCTION_BET.md): apuesta de producción para un equipo pequeño y condiciones para validarla.
7. [REFERENCES.md](REFERENCES.md): análisis de las imágenes y fuentes externas.

## Tesis de diseño

La mejor versión greenfield no imita literalmente ninguna referencia. Toma de todas ellas lo que Manuel parece valorar:

- **encuadres compuestos** que invitan a mirar;
- **lugares vividos**, con objetos que revelan oficio y memoria;
- **iluminación que cuenta estado** y no sólo embellece;
- **personajes reconocibles** a distancia;
- **tecnología antigua, reparada y cotidiana**, no un decorado futurista;
- **profundidad y escala de diorama** sin perseguir realismo fotográfico;
- **una herramienta presente en las manos** que convierte mirar en investigar.

La apuesta es que la exploración y la electrónica sean la misma actividad. Si el jugador puede recorrer un lugar ignorando por completo su infraestructura, el diseño falló. Si para aprender debe abandonar el mundo y responder una consigna escolar, también falló.

## Prueba mínima

La prueba primaria sigue siendo [SLICE_PLAZA.md](SLICE_PLAZA.md). El prototipo
de `/ohmdal-plaza` cubre el loop Portal → Plaza → Edda → retorno → Ohm despierto
→ medición breve, todavía en greybox.

La prueba debe validar juntas cuatro cosas:

1. la Plaza invita a caminar y mirar antes de entregar una misión;
2. Edda se entiende como una par con investigación propia;
3. el jugador descubre que un Camino requiere ida, carga y retorno sin fórmula ni cuestionario;
4. Ohm despierta como sujeto e instrumento que mide, no como solucionador.

El Taller de Lumen permanece como ejemplo de una experiencia posterior y más
compleja; no forma parte de esta prueba mínima. No hace falta arte final para
validar la Plaza, pero sí encuadre, paseo, conversación, infraestructura legible,
predicción, conexión y feedback eléctrico multisensorial.

## Criterios de éxito de esta dirección

- Un jugador describe la experiencia como «explorar un reino y comprender por qué sus cosas funcionan o fallan».
- La primera pregunta nace de un fenómeno visible o audible, no de una misión textual.
- La conexión entre fuente, Camino, carga y retorno puede reconstruirse mirando y midiendo.
- Un error enseña algo: cambia brillo, ritmo, calor, protección o lectura; no muestra sólo “incorrecto”.
- Ohm mide, pero no resuelve; Edda contrasta; Lumen aporta experiencia material; la comunidad sostiene lo aprendido.
- La belleza proviene de composición, color, luz, silueta y detalle seleccionado, no de densidad técnica.

