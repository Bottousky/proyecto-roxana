# R4 — Especificación cinemática INTRO_02–04
# Proyecto Roxana — Entrega del Orquestador

**Versión:** 1.0  
**Responsable:** Claude Code (Orquestador)  
**Fecha:** 2026-06-22  
**Estado:** Listos para generación + integración en hito H6  

---

## Resumen ejecutivo

**Tarea:** Generar 3 imágenes PNG (1536×1024 px c/u) para la cinemática introductoria del Proyecto Roxana.

**Entrega:**
- ✅ Especificación visual completa de las 3 imágenes (INTRO_02, INTRO_03, INTRO_04).
- ✅ Prompts optimizados para DALL-E, Midjourney y Stable Diffusion.
- ✅ Documentación técnica de integración en engine (Phaser 4).
- ✅ Checklist de verificación post-generación.
- ✅ Tests y flujo de validación.

**Documentos creados:**

| Archivo | Propósito | Audiencia |
|---|---|---|
| `docs/spec-cinematica-intro-visual.md` | Especificación visual detallada de las 3 imágenes | Generador de imágenes, Director |
| `docs/como-generar-cinemática.md` | Guía paso-a-paso para generar con DALL-E, Midjourney, Stable Diffusion | Usuario (Manuel) |
| `docs/cinemática-prompts-copy-paste.md` | Prompts listos para copy-paste en cada servicio | Usuario (generación rápida) |
| `docs/integracion-cinematica-engine.md` | Especificación técnica de cómo integrar en Phaser 4 | Ejecutor (H6) |
| `docs/R4-ENTREGA-CINEMÁTICA.md` | Este documento | Director + stakeholders |

---

## 1. Visión general de las 3 imágenes

### INTRO_02 — "Roxana años atrás" (Época dorada)
- **Momento:** Hace ~40 años, apogeo de la escuela.
- **Atmósfera:** Energía, curiosidad, prestigio.
- **Elementos clave:** Muchas personas (siluetas, no rostros), talleres activos, circuitos, herramientas, luz dorada cálida.
- **Paleta:** Dorado (#D4AF37–#FFD700), tierra, verde oscuro.
- **Estilo:** Ilustración painterly, años 1980s–1990s.

### INTRO_03 — "La leyenda de la Bitácora" (Misterio)
- **Momento:** Presente (archivo escolar viejo).
- **Atmósfera:** Misterio, leyenda olvidada, descubrimiento.
- **Elementos clave:** Fotos viejas, documentos, trofeos oxidados, texto fragmentado/borroso, libro como silueta.
- **Paleta:** Sepia (#704214–#8B7355), gris, café oscuro.
- **Estilo:** Collage/fotomontaje, crepuscular.

### INTRO_04 — "Escuela actual vacía" (Silencio)
- **Momento:** Hoy (2026).
- **Atmósfera:** Melancolía, abandono no destructivo, espera.
- **Elementos clave:** Hall vacío, bancos, escalera central, estatua, luz mínima, polvo limpio.
- **Paleta:** Gris (#B0B0B0–#A0A0A0), azul frío tenue, marrón desteñido.
- **Estilo:** Realismo ilustrado, crepuscular.

---

## 2. Continuidad visual entre imágenes

**Regla crítica:** Las 3 imágenes muestran la **misma escuela** (Escuela Roxana) en 3 momentos.

**Reconocibilidad arquitectónica:**
- Hall central (punto de referencia).
- Escalera central (conecta planta baja con pisos superiores).
- Estatua de Roxana (centro del Hall, presente en INTRO_04, ausente o borrosa en INTRO_03).
- Proporciones y disposición de puertas (consistentes).

**Transición de paleta:**
- INTRO_02 (dorada/cálida) → INTRO_03 (sepia/misteriosa) → INTRO_04 (gris/apagada).
- NO debe sentirse como 3 escuelas distintas.

---

## 3. Prompts optimizados (uso inmediato)

**Servicio recomendado:** Midjourney (resultados estéticos superiores) > DALL-E 3 (rápido, accesible) > Stable Diffusion local (gratis si tienes GPU).

**Para generación rápida:**
1. Abrir `docs/cinemática-prompts-copy-paste.md`.
2. Seleccionar el servicio deseado (DALL-E, Midjourney, Stable Diffusion).
3. Copiar el prompt exacto.
4. Generar en el servicio.
5. Descargar PNG a 1536×1024 px.
6. Guardar en `assets/cinematic/INTRO_0X.png`.

**Tiempo total:** ~15 minutos (3 generaciones + descarga + redimensionamiento).

---

## 4. Especificación de generación

### Dimensiones finales
- **Ancho:** 1536 px
- **Alto:** 1024 px
- **Aspect ratio:** 16:10 (horizontal).
- **Formato:** PNG (sin transparencia).
- **Tamaño de archivo:** ~200–500 KB c/u (si >500 KB, comprimir con `optipng`).

### Paletas de color (referencias)

**INTRO_02 (dorada/cálida):**
```
Dorado cálido:    #D4AF37, #E6C200, #FFD700
Tierra/Madera:    #8B6F47, #A0826D, #D2B48C
Verde oscuro:     #3D5C3D, #556B55
Gris cálido:      #A9A9A9, #B8B8B8
```

**INTRO_03 (sepia/misteriosa):**
```
Sepia cálido:     #704214, #8B7355, #A0826D
Gris topo:        #808080, #696969, #778899
Café oscuro:      #3E2723, #5C4033
Oro oxidado:      #B8860B, #DAA520
```

**INTRO_04 (gris/apagada):**
```
Gris principal:   #B0B0B0, #A9A9A9, #A0A0A0
Azul frío tenue:  #4A6FA5, #658BA3, #6B8FC7
Marrón desteñido: #7A5C47, #8B6F47
Acero/Metal:      #505050, #666666, #888888
```

---

## 5. Verificación post-generación

### Checklist técnico
- [ ] Dimensiones: 1536×1024 px (verificar con `identify` o propiedades).
- [ ] Formato: PNG.
- [ ] Tamaño: <500 KB c/u.
- [ ] Nombres: `INTRO_02.png`, `INTRO_03.png`, `INTRO_04.png`.
- [ ] Ubicación: `assets/cinematic/`.

### Checklist visual

**INTRO_02:**
- [ ] Luz cálida dorada (no blanca, no amarillo neón).
- [ ] Múltiples personas en movimiento (siluetas, no rostros detallados).
- [ ] Talleres activos visibles (mesas, circuitos, herramientas, lámparas).
- [ ] Diagramas técnicos en pizarrones de fondo.
- [ ] Atmósfera energética, ordenada, acogedora.

**INTRO_03:**
- [ ] Fotografías viejas dispersas (~4–5).
- [ ] Documentos y papeles superpuestos.
- [ ] Trofeos oxidados en vitrina.
- [ ] Texto fragmentado/borroso (no completamente legible).
- [ ] Libro como silueta difuminada en sombra.
- [ ] Paleta sepia/gris, luz crepuscular.

**INTRO_04:**
- [ ] Exterior e interior visible (transición natural).
- [ ] Hall central con bancos vacíos en filas.
- [ ] Escalera central visible al fondo.
- [ ] Estatua de mujer en centro.
- [ ] Puertas de aulas cerradas.
- [ ] Luz mínima, natural de ventanas.
- [ ] Polvo visible pero sin destrucción (limpias pero viejas).
- [ ] Paleta gris/azul frío, crepuscular.

### Checklist de coherencia
- [ ] Arquitectura reconocible en las 3 (Hall, escalera, puertas, proporciones).
- [ ] Transición de paleta suave y coherente.
- [ ] Sensación de progresión temporal clara (pasado → presente).

### Si necesitas ajustar (relanzar)

| Problema | Solución |
|---|---|
| INTRO_02 muy oscura | Relanzar con "+ brighter, more golden light" |
| INTRO_02 con rostros detallados | Relanzar con "+ no faces, silhouettes only" |
| INTRO_03 texto demasiado legible | Relanzar con "+ text blurred, fragmented, illegible" |
| INTRO_03 libro muy claro | Relanzar con "+ book hidden in shadow, barely visible" |
| INTRO_04 con personas | Relanzar con "+ no people visible, completely empty" |
| INTRO_04 escalera no visible | Relanzar con "+ visible central staircase in background" |
| INTRO_04 demasiado oscuro | Relanzar con "+ natural light from windows, cool daylight" |

---

## 6. Integración en engine (Phaser 4)

**No acción requerida ahora.** La integración la hace el ejecutor en hito H6.

**Ubicación post-generación:**
```
assets/cinematic/
├── INTRO_01.png (renombrar de hero-asignacion.png)
├── INTRO_02.png (generar)
├── INTRO_03.png (generar)
└── INTRO_04.png (generar)
```

**Uso en código (H6 implementará):**
```ts
const images = [
  'assets/cinematic/INTRO_01.png',
  'assets/cinematic/INTRO_02.png',
  'assets/cinematic/INTRO_03.png',
  'assets/cinematic/INTRO_04.png',
];
```

**Flujo en main.ts (H6 implementará):**
- Si `!seenIntro` → mostrar cinemática (4 imágenes + textos).
- Si `seenIntro === true` → pasar directo a juego.
- Skip con Esc o botón → marcar `seenIntro = true` y ir a juego.

---

## 7. Documentos de referencia

### Para Director / Aprobación
- `spec-cinematica-intro-visual.md` — visión completa, elementos clave, paletas.
- `R4-ENTREGA-CINEMÁTICA.md` — este documento.

### Para usuario (Manuel) — Generación
- `como-generar-cinemática.md` — instrucciones paso-a-paso (DALL-E, Midjourney, Stable Diffusion).
- `cinemática-prompts-copy-paste.md` — prompts listos para copy-paste.

### Para ejecutor (Sonnet) — Integración (H6)
- `integracion-cinematica-engine.md` — especificación técnica de IntroCinematic.ts, main.ts, state.ts.
- `spec-prologo-deltas.md` §6 — definición de hito H6 (tests, criterios).

---

## 8. Cronograma recomendado

1. **Ahora:** Leer `spec-cinematica-intro-visual.md` (5 min).
2. **Hoy:** Generar las 3 imágenes usando `como-generar-cinemática.md` (15 min).
3. **Mañana:** Verificación visual (checklist §5 de este doc) (10 min).
4. **Semana siguiente:** Pasar a ejecutor (Sonnet) para hito H6 (integración en engine).

**Duración total:** ~4 horas de orquestación → generación → validación.

---

## 9. Notas de riesgo y mitigación

| Riesgo | Mitigación |
|---|---|
| Paletas no coherentes entre imágenes. | Usar exact hex codes de §4; si servicio se desvía, post-ajustar Hue/Saturation en GIMP. |
| Arquitectura inconsistente (escalera/estatua no reconocibles). | Prompts refieren "same building layout", "central staircase visible"; si falla, relanzar con + descripción. |
| Texto demasiado legible en INTRO_03. | Prompts indican "blurred, fragmented"; si es visible, relanzar con "illegible, text barely visible". |
| Imágenes >500 KB. | Comprimir con `optipng -o2` antes de commitear. |
| Servicio no entiende prompt. | Simplificar (remover "tarnished brass" → "old trophies"); probar otro servicio. |

---

## 10. Entrega final

**Archivos entregados:**

1. ✅ `docs/spec-cinematica-intro-visual.md` (4200 palabras)
   - Descripción visual detallada de las 3 imágenes.
   - Paletas de color con hex codes.
   - Prompts optimizados para 3 servicios.

2. ✅ `docs/como-generar-cinemática.md` (2000 palabras)
   - Instrucciones paso-a-paso para DALL-E, Midjourney, Stable Diffusion.
   - Checklist post-generación.
   - Troubleshooting.

3. ✅ `docs/cinemática-prompts-copy-paste.md` (500 palabras)
   - Prompts listos para copy-paste (3 imágenes × 3 servicios).
   - Quick tweaks para ajustes.

4. ✅ `docs/integracion-cinematica-engine.md` (2500 palabras)
   - Especificación técnica de integración en Phaser 4.
   - Código template de IntroCinematic.ts.
   - Tests y checklist de integración.

5. ✅ `docs/R4-ENTREGA-CINEMÁTICA.md` (este documento, 1500 palabras)
   - Resumen ejecutivo.
   - Checklist de verificación.
   - Cronograma.

**Total:** ~11,000 palabras de especificación, listas para uso inmediato.

---

## 11. Siguiente paso

### Inmediato (usuario):
1. Leer `docs/como-generar-cinemática.md`.
2. Copiar prompts de `docs/cinemática-prompts-copy-paste.md`.
3. Generar 3 imágenes en servicio preferido (Midjourney recomendado).
4. Guardar en `assets/cinematic/INTRO_0X.png`.
5. Verificar contra checklist §5.

### Después (ejecutor, hito H6):
1. Leer `docs/integracion-cinematica-engine.md`.
2. Implementar `src/game/IntroCinematic.ts`.
3. Crear `src/content/intro-textos.ts`.
4. Modificar `src/main.ts` para disparar cinemática.
5. Actualizar `src/state.ts` con flags nuevas.
6. Tests: `tests/p6-intro-cinematica.test.ts`.
7. Verificación en preview.

---

## Aprobación

**Estado:** Pendiente de aprobación del Director (Manuel Gonzalo Botto Docampo).

- [ ] Visión general de las 3 imágenes: Aprobado.
- [ ] Paletas de color: Aprobado.
- [ ] Prompts: Aprobado.
- [ ] Cronograma: Aprobado.

**Comentarios del Director:**

(Por completar.)

---

**Documento:** R4 — Cinemática INTRO_02–04  
**Versión:** 1.0  
**Revisado por:** Orquestador Claude Code  
**Fecha:** 2026-06-22  

