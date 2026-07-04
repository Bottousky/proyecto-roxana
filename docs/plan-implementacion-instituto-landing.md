# Proyecto Roxana — Plan de implementación: Instituto = Landing Escolar

**Versión:** 0.1 (2026-07-03)
**Objetivo:** convertir la landing raíz existente en el hub del juego: una página web moderna y pulida donde cada sección es una parte de la escuela, que evoluciona con el estado del jugador. Phaser queda reservado para los mundos; se entra a ellos por el portal dentro de cada aula.
**División de trabajo:** el Orquestador escribe specs y texto canon; ejecutores implementan hito por hito; el Director provee imágenes generadas y valida jugando.

**Supersede:** hub top-down Pokémon (EscuelaHubScene), hall parallax y hall voxel 3D. Todo eso se parkea en M0 y no se revive sin decisión del Director.

---

## 0. Cómo usar este documento

1. **Contexto mínimo por sesión de ejecutor:** `README.md`, este plan, y `docs/guion-instituto.md` (texto canon, lo escribe el Orquestador antes de M2).
2. **Un hito por tarea.** M0–M9 ordenados por dependencia. Cada hito cabe en una sesión corta.
3. **Commit por hito** con aprobación del Director (protocolo CLAUDE.md §8). `npm run build` verde antes de proponer commit.
4. **El texto visible NUNCA lo inventa el ejecutor** — se copia textual del guion. Falta una línea → `// TODO(guion)` + placeholder neutro + reportar.
5. **Las imágenes las provee el Director.** Si un hito necesita una imagen que no existe, se implementa con un placeholder (bloque de color + etiqueta) y se reporta — nunca se bloquea el hito por arte.

### Reglas de diseño inviolables

- **Diegético siempre:** las secciones son lugares de la escuela, no "features". Nada de labels tipo "Perfil de usuario" — es "Preceptoría".
- **DOM/CSS/SVG puro, cero dependencias nuevas.** Sin frameworks, sin librerías de animación, sin video. Las transiciones de portal son animación web (la animación ES la pantalla de carga: espera a que el mundo esté listo).
- **La landing LEE el save del juego, nunca lo escribe.** Save del juego: `roxana-slice-v1` (read-only desde la landing). Estado propio de la web: clave nueva `roxana-web-v1` (intro vista, perfil de preceptoría, cinemáticas desbloqueadas/vistas, carrito ya migrará después).
- **Nada gateado a la fuerza:** ninguna cinemática obligatoria, todo skippeable, el portal siempre accesible aunque no hayas visto el proyector.
- **Sin backend:** "registrarse" en Preceptoría = perfil local en localStorage. No prometer cuentas, emails ni nube en ningún texto.
- **Español neutro (tuteo).** Ids/código en inglés camelCase.
- **Modelo puro testeable:** la derivación flags→estado de la escuela vive en `src/landing/schoolModel.ts` (sin DOM) + `tests/w1-school-model.test.ts` (node --experimental-strip-types). Cada hito que agregue lógica de estado la agrega ahí, no inline en el render.

---

## 1. Arquitectura existente (mapa para el ejecutor)

| Módulo | Qué es | Qué pasa con él |
|---|---|---|
| `index.html` (raíz) + `src/landing/` | landing de marketing actual: hero, mundos, tienda con carrito (`roxana_cart`), ficha técnica | **se convierte en la escuela** — es la base de todo este plan |
| `src/landing/landing.css` | animaciones rx-float/rx-pulse/rx-rise, responsive | se extiende (sistema de diseño ya definido: Spectral/Hanken Grotesk/Plex Mono, paleta oscura + ámbar) |
| `src/jugar/` + `src/main.ts` | el juego Phaser (Ohmdal completo, Arco I) | intacto; se lanza SOLO desde el portal del aula |
| `src/state.ts` | flags + save `roxana-slice-v1` del juego | la landing lo lee read-only vía `schoolModel.ts` |
| `src/content/entries.ts` + `src/ui/bitacora.ts` | la Bitácora (dos capas, gateada por flags) | la Biblioteca la monta como overlay en la landing (M6) |
| `src/experiences/` | registry/loaders de runtimes | los runtimes de instituto (school-hub, school-parallax, school-webgl) se retiran del loader; INSTITUTO deja de ser experience jugable |
| `assets/hub/*.png` | imágenes por sector generadas por el Director, variantes off/viva | candidatas para secciones y estados; el Director decide cuáles quedan |
| `assets/instituto/intro-*.png` | 2 de las 4 imágenes de la intro | faltan 2 (Director) |

**Navegación:** hash router mínimo sin dependencias: `/#hall` (default), `/#aula/electronica`, etc. La vista de aula es full-screen (tapa la landing); volver = botón discreto "salir del aula" + tecla Esc.

**Handoff al juego:** portal → animación de transición → `location.href = '/src/jugar/?world=ohmdal&from=portal'`. Al salir del juego ("Volver a la web") se aterriza en `/#aula/electronica`, no en el home.

---

## 2. Hitos

### M0 — Parkear el top-down + limpiar la rama

**Quién:** el Orquestador directamente (operación git, no ejecutor).

- Commitear TODO el WIP actual (untracked + modificados) en rama `backup/wip-hub-topdown-2026-07-03` y volver `fable/hub-escolar` limpia a `134601f`.
- Hito de limpieza en la rama limpia: quitar de `src/experiences/loaders.ts` los runtimes `school-hub`/`school-parallax`/`school-webgl` y sus archivos (`schoolRuntime`, `schoolScene`, `voxelMesh`, `schoolModel` y tests asociados); `INSTITUTO` en manifests queda como manifiesto descriptivo con runtime no jugable (o se retira del registry si nada lo usa). Build verde.
- **Aceptación:** `npm run build` y `npm test` verdes; `/src/jugar/` arranca Ohmdal igual que antes; el backup conserva todo el WIP.

### M1 — Reconversión de la landing a la metáfora escolar + `schoolModel`

**Archivos:** `index.html`, `src/landing/index.ts`, `src/landing/landing.css`, nuevo `src/landing/schoolModel.ts`, nuevo `tests/w1-school-model.test.ts`.

- Reorganizar la landing existente en secciones-lugar (nombres canon): **Hall** (hero), **Cartelera** (novedades), **Pasillo de Aulas** (evoluciona la sección "mundos" actual), **Biblioteca**, **Anfiteatro**, **Sala de Trofeos**, **Preceptoría**, **Kiosco** (la tienda actual, renombrada; nombre provisional pendiente de canon). Nav del header con estos nombres. Secciones aún no construidas = bloque placeholder diegético ("puerta cerrada") sin link muerto.
- `schoolModel.ts`: función pura `deriveSchoolState(saveJson, webJson)` → estado por sector (p. ej. aula electrónica: `off | viva | enCurso | completada` según flags de Ohmdal; trofeos derivados; intro vista). Toda lectura de localStorage pasa por acá.
- **Aceptación:** landing navegable con las 8 secciones; tests del modelo cubren save vacío, save U1, save Arco I completo; sin regresión visual grave en la tienda.
- **Nivel:** Estándar → `sonnet`.

### M2 — Las puertas del Pasillo de Aulas

**Archivos:** `src/landing/` (componente puerta), `landing.css`, `schoolModel.ts`.

- Componente **puerta DOM/CSS/SVG** (no bitmap), 4 instancias estilizadas por mundo: Electrónica (viva), Programación/Física/Matemática (cerradas, "próximamente" diegético). Placa con estado desde `schoolModel` (progreso, "nuevo").
- **Animación de entrada:** click → la puerta escala hasta full-screen (FLIP o View Transitions con fallback) → apertura 3D (bisagra lateral, perspective) + **sonido de puerta** (asset corto CC0 o síntesis WebAudio) → revela la vista de aula (M3; hasta entonces, placeholder). Hash router `#aula/electronica`.
- Respetar `prefers-reduced-motion`: transición corta con fundido.
- **Aceptación:** la animación corre a 60fps en desktop y móvil razonable; Esc/botón salir vuelve al pasillo; puertas cerradas reaccionan (traqueteo + tooltip) pero no abren.
- **Nivel:** Delicado (patrón nuevo) → `sonnet` con spec extra-fina.

### M3 — El aula de electrónica (antesala)

**Archivos:** `src/landing/` (vista aula), `schoolModel.ts`, guion §aula.

- Vista full-screen: **fondo = imagen generada** (Director; candidatas `assets/hub/electronica_*.png`; regla de producción: pizarrón vacío y pantalla de proyector en blanco en la imagen). Capa de **hotspots DOM posicionados en %**: portal (protagonista), proyector, pizarrón. Hover = glow + cursor; no descubiertos = pulso sutil.
- **Pizarrón 100% web:** tipografía tiza sobre el hueco de la imagen, contenido dinámico desde `schoolModel` (unidades U1–U5 completadas, pendientes) escrito como notas de clase (texto del guion).
- Estado del aula off/viva según progreso (filtro/iluminación CSS sobre el fondo o swap de imagen).
- **Aceptación:** hotspots alineados en 3 tamaños de viewport; pizarrón refleja un save real; portal y proyector clickeables (destinos M4/M7, placeholder mientras tanto).
- **Nivel:** Estándar → `sonnet`.

### M4 — Transición del portal + handoff a Ohmdal

**Archivos:** `src/landing/` (transición), `src/jugar/` (parámetro de arranque + retorno), `src/ui/end.ts` o equivalente del botón "Volver a la web".

- Animación **arco eléctrico** (canvas o SVG + filtros de turbulencia) que nace del hotspot portal y cubre la pantalla; al completarse navega a `/src/jugar/?world=ohmdal&from=portal`. La animación sostiene ("la pantalla de carga es la transición").
- En el juego: `from=portal` salta la title-screen (va directo a Continuar/Nuevo según save). "Volver a la web" → `/#aula/electronica`.
- **Aceptación:** ida y vuelta completa sin ver pantallas intermedias "de sitio web"; sin romper el arranque directo actual de `/src/jugar/`.
- **Nivel:** Delicado (toca el arranque del juego) → `sonnet` + auditoría reforzada.

### M5 — La intro de la escuela (primera visita)

**Archivos:** `src/landing/` (overlay intro), `schoolModel.ts`, guion §intro.

- Overlay full-screen en la primera visita al sitio: **4 imágenes** (2 existen en `assets/instituto/`, 2 las debe el Director) con paneo/zoom lento (Ken Burns CSS) + texto canon de contextualización. **Siempre skippeable** (botón discreto visible desde el primer frame). Al terminar o saltar: flag `introVista` en `roxana-web-v1`.
- La intro queda **archivada en el Anfiteatro** (M6) para re-verla.
- "Empezar de nuevo" en el juego NO re-dispara la intro de la web (claves separadas).
- **Aceptación:** primera visita la muestra, recarga no; skip funciona en cualquier frame; sin layout shift al cerrarse.
- **Nivel:** Estándar → `sonnet` (o `haiku` si la spec cierra todos los timings).

### M6 — Biblioteca (Bitácora) + Anfiteatro

**Archivos:** `src/landing/`, reuso de `src/ui/bitacora.ts` + `src/content/entries.ts`, guion §biblioteca/§anfiteatro.

- **Biblioteca:** abre la Bitácora existente como overlay sobre la landing (mismos módulos del juego, flags read-only). NO se crea un códice paralelo. Si el save está vacío: estado diegético "estantes esperando".
- **Anfiteatro:** grilla de videos de YouTube del Director (embeds lazy, click-to-load para no cargar iframes de entrada) + sección "archivo" con las cinemáticas desbloqueadas (intro de la escuela; luego cada cinemática de proyector). Lista de videos en un array de datos fácil de editar.
- **Aceptación:** Bitácora idéntica a la del juego con un save real; anfiteatro no carga ningún iframe hasta el click; el archivo refleja `roxana-web-v1`.
- **Nivel:** Estándar → `sonnet`.

### M7 — El proyector: cinemática de origen del mundo

**Archivos:** `src/landing/` (player de cinemática reutilizable), guion §proyector-electronica, imágenes del Director.

- Player de **cinemática de archivo** reutilizable (el mismo motor que la intro de M5: imágenes + Ken Burns + texto/narración, skippeable): tono "legado grabado" — quién construyó Ohmdal y para qué (inspiración: el archivo de Howard Stark en Iron Man). Texto 100% del guion.
- Primera visita al aula: el proyector titila invitando; nunca bloquea el portal. Vista la cinemática → se archiva en el Anfiteatro.
- **Aceptación:** mismo componente sirve a intro y proyector (una sola implementación); flag por cinemática en `roxana-web-v1`.
- **Nivel:** Estándar → `sonnet`.

### M8 — Preceptoría + Sala de Trofeos

**Archivos:** `src/landing/`, `schoolModel.ts`, guion §preceptoria/§trofeos.

- **Preceptoría:** perfil local — nombre del estudiante + avatar simple (elección entre variantes, sin upload) + "ficha de inscripción" diegética. Guardado en `roxana-web-v1`. Editable después. Cero promesas de cuenta/nube.
- **Sala de Trofeos:** vitrina con logros **derivados de flags existentes** del save (unidades completadas, fusible quemado y aprendido, Arco I completo…) — la lista de logros es data en `schoolModel.ts`, cada uno con estado bloqueado/desbloqueado y texto del guion. Referencia visual: `assets/hub/muro_de_progreso_full.png` / `4_Estados_muro_de_logros.png`.
- **Aceptación:** tests de derivación de logros con 3 saves distintos; el nombre del perfil aparece en el Hall ("Hola, {nombre}") si existe.
- **Nivel:** Estándar → `sonnet` (trofeos-data: `haiku` si la spec lista los flags exactos).

### M9 — Pulido y cierre

**Archivos:** transversal.

- Pasada de **responsive** (móvil primero: las aulas y puertas son lo crítico), `prefers-reduced-motion` en todo, OG/meta actualizados a la metáfora escolar, favicon, performance (imágenes con `loading="lazy"`, tamaños ajustados).
- Cartelera con las novedades reales del momento.
- Checklist E2E completo (§3) + `bash scripts/verificar-hito.sh`.
- **Nivel:** Estándar → `sonnet`.

---

## 3. Checklist E2E final (manual, Director o preview)

1. Visita nueva (localStorage limpio) → intro 4 imágenes → skip a mitad → Hall.
2. Recarga → no hay intro. Anfiteatro → la intro está archivada y se puede re-ver.
3. Pasillo → puerta de electrónica: zoom + apertura + sonido → aula. Puertas cerradas: traqueteo, no abren.
4. Aula: pizarrón coherente con save vacío. Proyector titila → cinemática → queda en anfiteatro.
5. Portal → transición eléctrica → Ohmdal arranca sin pantallas intermedias. Jugar U1 un rato → "Volver a la web" → aterrizo en el aula → el pizarrón cambió.
6. Biblioteca → Bitácora idéntica a la del juego. Trofeos reflejan el save. Preceptoría: crear perfil → el Hall saluda por nombre.
7. Kiosco: carrito sigue funcionando como antes.
8. Móvil 375px: todo el flujo 1–7 usable. `prefers-reduced-motion`: sin animaciones largas.
9. `npm run build` + `npm test` verdes; `/src/jugar/` directo (sin `?from=portal`) sigue funcionando.

---

## 4. Fuera del alcance del ejecutor

- Escribir o "mejorar" texto visible (guion = fuente de verdad).
- Generar, elegir o recortar imágenes (Director). Placeholder + reporte si falta.
- Backend de cualquier tipo (pagos, cuentas, newsletter real).
- Tocar el juego Phaser más allá de lo especificado en M4.
- Decidir el nombre canon del Kiosco/Cooperadora (pendiente del Director).

## 5. Plantilla de prompt para el ejecutor

```
Proyecto: juego educativo web (Phaser 4 + TS + Vite, sin backend). La landing
raíz es el hub del juego con metáfora de escuela.
Lee primero: README.md, docs/plan-implementacion-instituto-landing.md
y docs/guion-instituto.md.

Tarea: implementar el hito M_ del plan (§2).
- Respetá las "Reglas de diseño inviolables" (§0): DOM/CSS/SVG puro, cero
  dependencias, la landing lee roxana-slice-v1 pero NUNCA lo escribe,
  estado propio en roxana-web-v1, todo skippeable, español neutro.
- Todo texto visible se copia TEXTUAL de docs/guion-instituto.md.
  Si falta: // TODO(guion) + placeholder neutro + reportalo.
- Lógica de estado en src/landing/schoolModel.ts (puro) + tests en tests/.
- npm run build tiene que pasar. Sin commit.
- Al terminar: lista de archivos tocados + cómo probar a mano el hito.
```

---

## 6. Pendientes de canon (Director) y de guion (Orquestador)

| Qué | Quién | Bloquea |
|---|---|---|
| 2 imágenes faltantes de la intro | Director | M5 (placeholder mientras) |
| Imagen definitiva del aula de electrónica (o validar las de assets/hub) | Director | M3 (placeholder mientras) |
| Imágenes de la cinemática del proyector | Director | M7 |
| Nombre canon Kiosco vs Cooperadora | Director | solo el label (M1 usa "Kiosco" provisional) |
| `docs/guion-instituto.md` (intro, aula, pizarrón, proyector, secciones, trofeos) | Orquestador | M2 en adelante |
| Lista de videos de YouTube para el anfiteatro | Director | M6 (array vacío mientras) |
