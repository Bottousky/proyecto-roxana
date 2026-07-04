# Prompts de imágenes — Instituto (landing escolar)

Para generar con ChatGPT/GPT-4o. Todos en **16:9 horizontal** salvo indicación.
Regla de oro: **pizarrones vacíos y pantallas en blanco** — todo texto/contenido dinámico se monta con HTML encima. Si el generador mete texto, pedirle regenerar sin texto (el texto generado por IA sale deforme y no es editable).

## Bloque de estilo base (pegar al inicio de CADA prompt)

> Ilustración pictórica digital de época, estilo académico cálido, luz dorada de atardecer entrando por ventanales altos, paleta de ámbar, madera oscura, piedra desgastada y azul profundo en sombras, pinceladas visibles, atmósfera nostálgica y solemne, sin texto ni letreros legibles, apaisado 16:9.

(Es el estilo exacto de `intro-02-roxana-viva-v1.png` — si podés, adjuntala como referencia de estilo en el chat de generación.)

---

## A. Intro de la escuela (faltan 2 de 4)

La secuencia canon queda: 01 llegada → 02 la escuela viva (YA EXISTE) → 03 la leyenda de la Bitácora (YA EXISTE) → 04 el umbral.

**intro-01 — La llegada**
> [estilo base] Un estudiante adolescente visto de espaldas, con mochila, de pie ante la verja de hierro entreabierta de un gran instituto de principios de siglo XX, fachada de piedra con reloj detenido, patio delantero con hojas secas y maleza leve, la última luz del día toca una sola ventana del edificio que parece brillar tenuemente desde dentro, el resto del edificio dormido y en penumbra, sensación de misterio y promesa.

**intro-04 — El umbral**
> [estilo base] Interior del hall de entrada de un instituto antiguo visto desde la puerta principal abierta, la silueta del estudiante con mochila recortada a contraluz en el umbral, dentro del hall una lámpara de pie acaba de encenderse sola iluminando el polvo en el aire, escalera doble al fondo, vitrinas y puertas de aulas en penumbra a los lados, como si el edificio despertara al sentir que alguien entra.

## B. Aula de electrónica (fondo de la antesala, M3)

Vista a nivel de ojos (NO isométrica — las isométricas que ya tenés sirven para el pasillo/preview, no para esta vista).

**aula-electronica-fondo**
> [estilo base] Vista frontal a nivel de ojos de un aula-taller de electrónica antigua, composición simétrica: al fondo y centro un gran portal circular de anillos de cobre y bobinas APAGADO e inerte montado sobre una tarima, a la izquierda un pizarrón verde de tiza COMPLETAMENTE VACÍO con marco de madera, a la derecha un proyector de cine antiguo de 16mm sobre un carrito apuntando a una pantalla desplegable EN BLANCO, mesas de trabajo con instrumentos de latón, osciloscopios antiguos, cables y frascos, lámparas de banco encendidas, sin personas, sin ningún texto.

Nota técnica: el estado "viva" (portal encendido, glow azul) lo hacemos con CSS encima; si querés una variante generada, pedí la misma imagen "con el portal encendido irradiando luz azul eléctrica" — pero primero probamos con CSS.

## C. Cinemática del proyector (M7) — «el archivo del fundador»

Estilo distinto adrede: material de archivo proyectado. Bloque de estilo para esta serie:

> Fotograma de película antigua de 16mm en sepia desaturado, grano de película, viñeteado, leves rayas verticales, luz de proyector, época años 1930-40, sin texto, apaisado 16:9.

**proyector-01 — El constructor**
> [estilo archivo] Un hombre maduro de bata y anteojos redondos en un taller abarrotado, de espaldas a medias, ajustando con ambas manos un mecanismo circular de cobre del tamaño de una puerta, planos y esquemas clavados en las paredes, mirada concentrada.

**proyector-02 — Los planos**
> [estilo archivo] Primer plano cenital de una gran mesa de dibujo cubierta de planos técnicos de un mundo en miniatura: un valle con un río que se bifurca, un castillo, una forja, terrazas y un faro, manos con lápiz y compás trabajando sobre el papel, taza de café, regla de cálculo.

**proyector-03 — La primera chispa**
> [estilo archivo] El mismo taller a oscuras, el mecanismo circular de cobre encendiéndose por primera vez con un arco de luz que lo atraviesa, el hombre retrocediendo un paso con el brazo alzado protegiéndose los ojos, sombras duras proyectadas en las paredes, asombro.

**proyector-04 — El otro lado**
> [estilo archivo] Vista a través del anillo de cobre encendido: al otro lado se ve un valle sereno con un pueblo de piedra cálida, un río que lo atraviesa y un castillo en la colina, la luz del valle se derrama hacia el taller oscuro, frontera entre dos mundos.

**proyector-05 — El mensaje**
> [estilo archivo] El hombre de bata sentado frente a la cámara en el taller, mirando directo al lente como quien graba un mensaje para el futuro, expresión serena y cansada, detrás de él el mecanismo circular apagado cubierto a medias por una lona, una lámpara de escritorio como única luz.

## D. Opcionales (no bloquean ningún hito)

- **Cartelera del hall** (para la sección novedades): [estilo base] primer plano de una cartelera de corcho antigua con marco de madera, VACÍA, algunas chinchetas de colores y una esquina de papel rasgado, luz cálida lateral.
- **Aulas de Programación / Física / Matemática**: recién para M-futuros; cuando toque, misma fórmula que B cambiando el artefacto central (casco de realidad virtual sobre pedestal / ciudad en miniatura bajo campana de cristal / pizarrón con marco de puerta dibujado en tiza). No gastar generaciones ahora.

---

## Checklist al guardar

- Formato: PNG, mínimo 1792×1024 (el tamaño 16:9 nativo de GPT).
- Nombres: `assets/instituto/intro-01-llegada-v1.png`, `intro-04-umbral-v1.png`, `aula-electronica-fondo-v1.png`, `proyector-electronica-01..05-v1.png`, `cartelera-v1.png`.
- Verificar: ¿pizarrón vacío? ¿pantalla en blanco? ¿cero texto legible? Si hay texto, regenerar.
