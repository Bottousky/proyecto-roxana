# Iteración 16 — revisión independiente y respuesta

**Quién revisó:** un agente revisor, sólo lectura, sin navegador. Usó el diff, las pruebas, cuatro simulaciones propias en Node (una de ellas con 60 corridas aleatorias de 120 s) y las imágenes.

**Veredicto:** el nombre «B3 en curso: base del carro» es honesto, pero la base todavía no era sólida. Había un atrapamiento fácil de reproducir y el arrastre no daba velocidad.

| # | Severidad | Hallazgo | Respuesta |
|---|---|---|---|
| A1 | alta | **El explorador quedaba atrapado en el lecho de la vía.** Pasaba al caminar contra el borde trasero del carro en marcha. Ninguna tecla lo sacaba, ni R. En las corridas aleatorias, 34 de 60 terminaban ahí. Causa: al chocar con un área que se mueve, el explorador volvía a su posición previa sin el arrastre, y el recorte sólo iba hacia un lado. | **Corregido:** vuelve a la posición previa más el arrastre de ese paso, el recorte va al punto válido más cercano, y R lleva al último lugar transitable si quedó fuera de toda área. Prueba nueva en los dos sentidos y contra los dos bordes; con la lógica vieja falla (en el tramo oeste con ▶ quedaba en `via`), con la nueva pasa. |
| A2 | alta | **El carro sólo llevaba al explorador.** El contacto de los círculos no registraba el sólido, y una esfera sobre la cubierta se quedaba atrás y caía a la vía. | **Corregido:** prueba nueva. Una esfera viaja 15 m en el mismo lugar del carro. |
| A3 | alta | **El arrastre movía la posición pero no daba velocidad.** Al bajar del carro en marcha se frenaba en seco, y lo soltado desde el carro caía «hacia atrás» visto desde el carro. Era lo contrario de lo que D21 promete. | **Corregido con un modelo de marcos** (D21): la velocidad es relativa al carro mientras el cuerpo se apoya en él, y se convierte al subir y al bajar. Pruebas nuevas: al bajar en marcha, el explorador conserva unos 1,5 m/s; una esfera soltada en marcha cae a menos de 6 cm de su lugar en la cubierta. |
| M1 | media | «▼ Volver» aparecía en todo el andén, pero ▼ sólo llevaba de vuelta frente a la calle. | **Corregido:** en el andén, ▼ lleva hacia la calle. Prueba desde cuatro puntos del andén. |
| M2 | media | No se decía cómo subir ni cuándo salía el carro. | **Corregido en parte:** «▲ Subir al carro» y «▼ Bajar del carro», más una campana 1,5 s antes de salir y el poste de parada. **Abierto:** un reloj u horario visible. |
| M3 | media | La unión entre el andén y la cubierta tenía ancho cero: el explorador viajaba a caballo entre los dos y tapaba la regla del carro. | **Corregido:** a bordo, el explorador se acomoda con el cuerpo entero sobre la cubierta. Primero lo llevé al centro, pero así el cordón quedaba fuera de cuadro; ahora queda a 0,6 m del borde del andén, con la regla delante de los pies y el cordón a la vista. |
| M4 | media | Ni la reja ni el carro sonaban. | **Agregado:** chirrido de la reja, campana, enganche y freno. **No verificado de oído.** |
| M5 | media | El recorrido completo no pasaba por lo nuevo. | **Agregado:** el paso «calle y carro» en `evidence.mjs`, todo con teclas, ida y vuelta (ver README). |
| M6 | media | La medición de rendimiento no cubría el andén ni el viaje, y el p99 de 16,8 ms es el techo del vsync. | **Medido:** llamadas de dibujo y trabajo de CPU por cuadro en el andén y a bordo (ver README). |
| M7 | media | El torno no se veía jugando; la casa de máquinas parecía un edificio de departamentos; el cable estaba quieto. | **Corregido:** la casa de máquinas, de piedra, está frente a la calle con un arco, y su rueda se ve girar (`carro-12`, `carro-30`, `carro-38`). El cable tiene marcas que corren. |
| B1 | baja | Tres detalles frágiles de `mergeStatic`: suponía la identidad, forzaba la repetición en todos los mapas y no miraba la visibilidad. | **Corregido:** la unión es relativa a su raíz, sólo repite las fachadas y omite las mallas ocultas. Ahora también une las piezas del carro y de las ruedas. |
| B2 | baja | La hoja de la reja se metía en la pared. | **Corregido:** gira 1,5 rad. |
| B3 | baja | Un farol tapaba parte de la entrada de la calle. | **Corregido:** el farol va al costado. |
| B4 | baja | Las losas del andén y del patio se veían estiradas. | **Corregido:** tienen su propia escala. |
| B5 | baja | La silueta sobre el muro incluye ahora la avenida y la torre más alta. | **Aceptado:** se ve bien en el plano abierto. |

**Crítica pedagógica: abierta, es la próxima iteración.**
- Que las marcas caigan «en el marco de la referencia» sería un modo de dibujo, no un registro físico.
- Que la linterna no se mueva respecto del carro es trivial: va atornillada a él.
- **Propuesta del revisor, adoptada en FAMILIAS:**
  - dos registros simultáneos: tiza en el suelo y cinta en el carro;
  - el caso no trivial: el explorador caminando sobre el carro en marcha;
  - el tramo oeste, con el desplazamiento negativo;
  - después, el jalón, las notas y el encargo.
