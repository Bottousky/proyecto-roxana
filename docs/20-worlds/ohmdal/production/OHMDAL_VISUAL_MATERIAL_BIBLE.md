# Biblia visual y material — Ohmdal 3D

**Estado:** contrato de producción derivado de la Plaza Stage 5.
**Alcance:** nuevas zonas y assets de Ohmdal; no autoriza cambiar canon ni reabrir la Plaza.

## Lectura material

- **Piedra:** masa primaria cálida, rugosa y pesada. Variar valor y desgaste por función; evitar ruido uniforme. La piedra húmeda es una variante localizada, no el acabado global.
- **Cobre y latón:** el cobre pasivo muestra albedo cálido, metal controlado, desgaste y verdigris localizado. El latón separa herrajes, instrumentos y puntos funcionales. **El cobre pasivo no emite luz.** Emissive sólo comunica estado eléctrico activo y debe apagarse con ese estado.
- **Verdigris:** aparece en juntas, contactos y escurrimientos plausibles. No se usa como pintura decorativa ni como máscara uniforme.
- **Cerámica:** clara, mate a semisatinada, eléctricamente legible y distinta de piedra blanca. Se reserva para aisladores y piezas funcionales.
- **Madera:** cálida, oscura y direccional; el Taller puede concentrarla. Evitar plástico marrón y veta fuera de escala.
- **Vidrio:** transparente o translúcido con grosor y reflejo legible; no reemplazarlo por glow. Mantener diales y agujas contrastados en primera persona.
- **Hierro/acero:** secundario, oscuro y menos cromático que cobre/latón. Óxido y abrasión siguen uso y exposición.

## Humedad y superficie

La humedad se concentra en drenajes, bordes bajos, salpicaduras y rutas de agua. Debe leerse por rugosidad, valor y reflejo antes que por saturación. La base de adoquín de Plaza conserva su rugosidad seca; compartir normal/diffuse con una variante no autoriza aplicar el mapa húmedo a toda la superficie.

## Luz, cielo y profundidad

- Mantener una key direccional clara, fill/ambiente moderado y exposición estable entre desktop/mobile.
- El cielo establece contraste de silueta; no debe lavar materiales ni competir con landmarks.
- Sombras priorizan contacto y escala. En mobile, máximo una luz dinámica significativa con sombras salvo medición que justifique otra configuración.
- Emissive es información de estado, no iluminación decorativa permanente.
- Preservar foreground, plano jugable y fondo con masas diferenciadas; niebla o post no reparan composición débil.

## Authored frente a genérico

Un asset authored tiene silueta, jerarquía, proporción, material y función verificables contra referencia. Una primitiva puede existir como collider, proxy no visible o bloque temporal explícito; no puede quedar como hero, arquitectura dominante o prop focal visible.

## Fallos prohibidos

- glow pasivo en cobre, latón o símbolos sin estado activo;
- plaza o zona completa mojada;
- metal negro sin respuesta de luz o metal espejo fuera de escala;
- piedra, cerámica y yeso indistinguibles;
- repetición visible sin variación funcional;
- floating, falta de contacto o shadow acne dominante;
- cielo recortado, masa de fondo plana o foreground que tapa interacción;
- postprocesado que oculta problemas de material/composición;
- assets hero sin reference pack, procedencia, bounds y multivista.

## Gate de aceptación

Comparar desktop y mobile, estado pasivo y energizado, vista cercana y silueta amplia. Registrar Visual Harness, errores, métricas de sombras y assets. Una captura atractiva no compensa jerarquía rota, interacción ilegible o presupuesto excedido.
