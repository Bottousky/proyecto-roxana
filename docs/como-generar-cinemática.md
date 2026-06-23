# Guía: Generación de INTRO_02–04 con imagegen
# Proyecto Roxana

**Escrito:** 2026-06-22  
**Enfoque:** Instrucciones paso-a-paso para generar las 3 imágenes PNG  
**Servicios:** DALL-E, Midjourney, Stable Diffusion Local  

---

## 1. Opción A: DALL-E (OpenAI)

### Requisitos
- Cuenta en OpenAI (chat.openai.com o API).
- Créditos suficientes para 3 generaciones (~$0.20–0.40 c/u con DALL-E 3).

### Pasos

1. **Acceder a DALL-E:**
   - Ir a https://chat.openai.com → tab Sidecar → "Create images"
   - O usar API directamente si tienes Python/Node.

2. **Generar INTRO_02 ("Roxana años atrás"):**
   - Copiar el prompt de `spec-cinematica-intro-visual.md` §A.1 (INTRO_02).
   - Pegarle en el chat o en el generador.
   - Presionar "Generate" o "Create".
   - Esperar ~30–60 seg.
   - Descargar la imagen en la mejor resolución disponible (DALL-E 3 entrega ~1024×1024 o upscale).
   - **Ajuste si aplica:** Si la imagen está muy oscura, relanzar con "more golden light, brighter". Si personajes tienen rostros detallados, relanzar con "characters seen from behind or as silhouettes".

3. **Generar INTRO_03 ("La leyenda de la Bitácora"):**
   - Copiar el prompt de §A.1 (INTRO_03).
   - Pegar y generar.
   - Descargar.
   - **Ajuste si aplica:** Si el libro es demasiado visible, relanzar con "book silhouette blurred in shadows". Si el texto es legible, relanzar con "text fragmented, blurred, illegible".

4. **Generar INTRO_04 ("Escuela actual vacía"):**
   - Copiar el prompt de §A.1 (INTRO_04).
   - Pegar y generar.
   - Descargar.
   - **Ajuste si aplica:** Si hay personas en primer plano, relanzar con "no people visible, or one distant silhouette". Si es demasiado oscuro, relanzar con "more natural light from windows".

5. **Redimensionar a 1536×1024:**
   - Abrir las 3 imágenes en un editor (GIMP, Photoshop, Aseprite, o web tool como Canva).
   - Redimensionar a 1536×1024 sin distorsionar (usar "fit canvas" o "scale canvas").
   - Exportar como PNG en `assets/cinematic/`.

### Costo estimado
~$1–1.50 (3 generaciones × $0.20–0.40).

---

## 2. Opción B: Midjourney

### Requisitos
- Cuenta en Midjourney (midjourney.com).
- Suscripción activa ($10–120 USD/mes, Fast generaciones ilimitadas).
- Acceso a Discord (donde funciona Midjourney).

### Pasos

1. **Acceder a Midjourney en Discord:**
   - Unirse al server de Midjourney: https://discord.gg/midjourney
   - Ir a un canal de generación (ej. `#newbies-1`).

2. **Generar INTRO_02:**
   - Copiar el prompt de `spec-cinematica-intro-visual.md` §A.2 (INTRO_02).
   - En Discord, escribir: `/imagine prompt: [PASTE PROMPT]`
   - Presionar Enter.
   - Esperar ~60 seg (Midjourney genera 4 imágenes de una).
   - Reaccionar con upvote (👍) a la mejor imagen de las 4.
   - Presionar "U2" (upscale) para obtener alta resolución.
   - Descargar (click derecho → "Open image").

3. **Generar INTRO_03 y INTRO_04:**
   - Repetir los pasos 2 y 3 con los prompts de §A.2.

4. **Redimensionar a 1536×1024:**
   - Midjourney entrega ~1024×1024 o ~2048×2048 (según upscale).
   - Redimensionar en editor a 1536×1024 (fit/canvas no distorsiona).
   - Exportar como PNG en `assets/cinematic/`.

### Ventajas
- Resultados estéticos generalmente superiores (especialmente para arte ilustrado).
- Múltiples variaciones por prompt (elige la mejor).
- Comunidad activa para feedback en vivo.

### Costo
- Incluido en suscripción Midjourney.

---

## 3. Opción C: Stable Diffusion (Local o API)

### Requisitos (Local)
- GPU NVIDIA (RTX 3060 o mejor, 8GB VRAM mínimo) o Mac con Metal.
- Software: [Stable Diffusion WebUI](https://github.com/AUTOMATIC1111/stable-diffusion-webui) o [ComfyUI](https://github.com/comfyanonymous/ComfyUI).
- Modelo base: cualquier versión estable (e.g., `v1.5`, `DreamShaper`, `Deliberate`).

### Pasos (Local WebUI)

1. **Instalar Stable Diffusion WebUI:**
   ```bash
   git clone https://github.com/AUTOMATIC1111/stable-diffusion-webui
   cd stable-diffusion-webui
   ./webui.sh  # o webui.bat en Windows
   ```
   - Se abre en http://localhost:7860

2. **Generar INTRO_02:**
   - En el tab "Txt2Img" de la WebUI.
   - **Prompt:** Copiar de `spec-cinematica-intro-visual.md` §A.3 (INTRO_02).
   - **Negative prompt:** Copiar de §A.3.
   - **Settings:**
     - Steps: 20–30 (calidad vs velocidad).
     - Sampler: DPM++ 2M Karras (rápido y calidad).
     - CFG scale: 7–10 (adherencia al prompt).
     - Size: 1536×1024 directamente (o generar 1024×1024 y upscale).
   - Presionar "Generate".
   - Esperar 30–120 seg (depende de GPU).
   - Descargar la imagen (click "Save").

3. **Generar INTRO_03 y INTRO_04:**
   - Repetir paso 2 con los prompts de §A.3.

4. **Redimensionar si aplica:**
   - Si generaste 1024×1024, redimensionar a 1536×1024 en editor.
   - Exportar como PNG en `assets/cinematic/`.

### Opción C2: API (Hugging Face Diffusers, Replicate, Baseten)

Si no tienes GPU local, usar API:

```python
# Ejemplo con Hugging Face Diffusers API (requiere API key)
import requests

api_url = "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-3"
headers = {"Authorization": f"Bearer YOUR_HF_TOKEN"}

prompt = "A warm golden-lit technical school..."
payload = {"inputs": prompt}

response = requests.post(api_url, headers=headers, json=payload)
image = response.content
with open("INTRO_02.png", "wb") as f:
    f.write(image)
```

**Servicios alternativos:**
- Replicate.com: $0.08–0.15/imagen, API sencillo.
- Baseten.co: Similar a Replicate.
- Stability AI API: Oficial de Stable Diffusion.

### Costo (Local)
- Ninguno (si ya tienes GPU).

### Costo (API)
- ~$0.05–0.20/imagen (típicamente más barato que DALL-E).

---

## 4. Checklist post-generación

Después de generar y descargar las 3 imágenes:

### Verificación técnica
- [ ] INTRO_02.png, INTRO_03.png, INTRO_04.png guardados en `assets/cinematic/`.
- [ ] Dimensiones: 1536×1024 px c/u (verificar con `identify` o propiedades del archivo).
- [ ] Formato: PNG (no JPG).
- [ ] Tamaño de archivo: ~200–500 KB c/u (investigar si >1 MB → recomprimir).

### Verificación visual (según §B de spec-cinematica-intro-visual.md)
- [ ] **INTRO_02:** Luz cálida dorada, mucha gente (siluetas), talleres activos, circuitos visibles, diagrama en pizarrones.
- [ ] **INTRO_03:** Sepia/gris, fotos viejas dispersas, trofeos, texto borroso, libro como silueta.
- [ ] **INTRO_04:** Gris/azul frío, Hall vacío, bancos en filas, escalera central, estatua, polvo pero limpio.

### Coherencia
- [ ] La arquitectura del Hall (escalera, puertas, proporciones) es reconocible en las 3 imágenes.
- [ ] La paleta transita suavemente dorada → sepia → gris.
- [ ] La estatua central es visible en INTRO_04 y ausente (o borrosa) en INTRO_03 e INTRO_02 (escala de presencia correcta).

### Ajustes si aplica
- **Recolorización:** Si la paleta no transita bien, usar GIMP/Photoshop para ajustar Hue/Saturation de cada imagen hacia los tonos canónicos.
- **Redimensionamiento:** Si las imágenes no son exactamente 1536×1024, usar `convert` (ImageMagick):
  ```bash
  convert INTRO_02.png -resize 1536x1024 -gravity center -background white -extent 1536x1024 INTRO_02_resized.png
  ```
- **Recomprensión:** Si >1 MB, optimizar con `optipng` o `pngquant`:
  ```bash
  optipng -o2 INTRO_02.png
  # o
  pngquant 256 --ext .png INTRO_02.png
  ```

---

## 5. Si necesitas ajustes

### Paleta no es la esperada
- INTRO_02 muy oscura: Relanzar con "+ brighter, more golden light".
- INTRO_03 muy sepia: Relanzar con "+ grayer, less brown".
- INTRO_04 muy azul: Relanzar con "+ more neutral gray, less blue".

### Arquitectura inconsistente
- La escalera no es reconocible: Relanzar con "+ visible central staircase".
- La estatua no aparece en INTRO_04: Relanzar con "+ statue of woman in center".
- Puertas no son visibles: Relanzar con "+ classroom doors on sides".

### Presencia de personas/detalles
- INTRO_02 tiene rostros detallados: Relanzar con "+ characters only as silhouettes, back views".
- INTRO_03 muestra el libro claramente: Relanzar con "+ book blurred, hidden in shadows".
- INTRO_04 tiene personas: Relanzar con "+ no people visible, completely empty".

---

## 6. Integración final

Una vez validadas las 3 imágenes:

1. **Copiar a `assets/cinematic/`:**
   ```bash
   cp INTRO_02.png C:\YO\Proyectos\Roxana\ claude\assets\cinematic\
   cp INTRO_03.png C:\YO\Proyectos\Roxana\ claude\assets\cinematic\
   cp INTRO_04.png C:\YO\Proyectos\Roxana\ claude\assets\cinematic\
   ```

2. **Documentar prompts exactos usados:**
   - Crear o actualizar `docs/cinemática-prompts-usados.md` con:
     - Servicio usado (DALL-E, Midjourney, Stable Diffusion).
     - Prompts exactos copiados.
     - Ajustes realizados (si los hubo).
     - Notas de cualquier limitación encontrada.

3. **Avisar al Orquestador (Claude Code):**
   - Mensaje: "Imágenes INTRO_02–04 listas en `assets/cinematic/`. Proceder con hito H6 (IntroCinematic.ts)."

---

## 7. Referencia de resolución de problemas

| Problema | Causa probable | Solución |
|---|---|---|
| Imagen muy pequeña (<500 KB) | Bajo detalle o compresión | Regenerar con "high quality, detailed" |
| Imagen muy grande (>2 MB) | Alta resolución sin optim. | Recomprimir con `optipng` o `pngquant` |
| Arquitectura inconsistente | Prompt ambiguo | Relanzar con "same building layout as before, central staircase visible" |
| Paleta muy diferente de esperada | Servicio se desvió | Probar otro servicio o relanzar con ajustes Hue/Saturation |
| Texto ilegible en INTRO_03 | Generador no preservó fragmentación | Agregar texto como overlay en engine (H6) |
| INTRO_02 se ve industrial/oscura | Iluminación fría | Relanzar con "soft golden light, warm, inviting" |

---

## Notas finales

- **Reproducibilidad:** Todos los prompts están documentados en `spec-cinematica-intro-visual.md`. Si necesitas regenerar una imagen 6 meses desde ahora, copiar el prompt es suficiente.
- **Iteración:** Es normal relanzar 1–2 veces por imagen para afinar paleta/atmósfera.
- **Costo total:** DALL-E ~$1.50 | Midjourney ~incluido en suscripción | Stable Diffusion local gratis (GPU).
- **Tiempo total:** ~5 min de espera (generaciones) + 10 min de descarga/redimensionamiento.

**Siguiente:** Proceder con hito H6 (IntroCinematic.ts) una vez las imágenes estén en `assets/cinematic/`.

