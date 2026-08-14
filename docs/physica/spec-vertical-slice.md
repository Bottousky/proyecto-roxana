# Physica — Vertical Slice Spec (Escenas 2-8)

**Estado:** spec del Orquestador  
**Fuente canon:** GDD v0.2 + Guion v0.2 + docs/physica/README.md  
**Motor:** Babylon.js (TypeScript). Física analítica (NO Havok) — canon v0.2.  

---

## 1. Layout espacial continuo (2.5D lateral)

El mundo de Physica es un espacio continuo en el arco 2D. El jugador comienza en
la cornisa y camina hacia la derecha, atravesando cada escena sin transiciones
de sala. La cámara cambia de encuadre zona a zona.

```
x: -14 ────────────────────────────────────────────────────────────── 90+
     [Esc 2: cornisa + cascada] [Esc 3] [Esc 4] [Esc 5] [Esc 6] [Esc 7] [Esc 8]
```

- **Escena 2** (x ∈ [-14, 14]): cornisa frente al lago, cascada ascendente. ✅ EXISTE.
- **Escena 3** (x ∈ [14, 28]): desfiladero, instrumento suspendido por fuerzas opuestas.
- **Escena 4** (x ∈ [28, 45]): valle con plataformas a la deriva.
- **Escena 5** (x ∈ [45, 62]): grieta con corriente transversal + visualización de vectores.
- **Escena 6** (x ∈ [62, 78]): roca y plano inclinado.
- **Escena 7** (x ∈ [78, 90]): estación pedagógica (síntesis).
- **Escena 8** (x ≥ 90): plataforma de observación de la metrópolis.

## 2. Acompañante esférico (INSTRUMENTO)

- **Apariencia:** núcleo esférico con lente central, anillo giroscópico, aguja
  direccional. Silueta imprimible en 3D (§16 GDD).
- **Comportamiento:** sigue al avatar con suavizado. Se posiciona a su lado o
  flota mirando objetos relevantes.
- **Función:** mide, interpreta, visualiza. Su aguja señala direcciones, sus
  anillos registran magnitudes. Nunca inventa texto — emite frases fragmentadas
  del guion (§4 Guion).
- **Entra en Escena 3** (tras resolver el equilibrio) y permanece hasta el final.

## 3. Reloj-dispositivo (reloj)

- **Apariencia:** instrumento analógico con agujas, anillos, escalas y piezas móviles.
- **Progresión:**
  - U1: revela la observación (ya existe en Escena 2).
  - U2 (Escena 4): selector de sistema de referencia.
  - U3 (Escena 5): lectura de vectores.
  - U4 (Escena 6): registro de trayectorias.
  - U5 (Escena 7): intervención local autorizada.
- **Diálogos del reloj** (texto canónico del guion v0.2):
  - Escena 3: "Medición… activa. Desplazamiento… ninguno." / "Ningún avance. Dos direcciones. Ningún avance."
  - Escena 3: "Dos acciones. Una suma sin dirección. Quietud… con actividad."
  - Escena 5: "Más intensidad… mismo error lateral."
  - Escena 5: "No era lanzar más. Era lanzar hacia otro lugar para llegar al mismo lugar."
  - Escena 7: "Reconozco el acople. No reconozco la instrucción."
  - Escena 8: "La estación del valle era una entrada. Allí… hay demasiadas referencias."
  - Escena 8: "Y una señal que todavía reconoce el reloj."

## 4. Escenas y mecánicas

### Escena 2 — Cascada ascendente (✅ EXISTE, pulir)
- El agua sube (a = +g), la piedra cae (a = -g).
- Bitácora: "Distintos cuerpos del mismo lugar no parecen obedecer la misma dirección."
- Camara: dolly-out frente a la cascada.

### Escena 3 — Instrumento suspendido (equilibrio / fuerzas equilibradas)
- El INSTRUMENTO flota, sostenido por dos corrientes opuestas (flechas ↑↓).
- Puzzle: colocar una losa para cubrir parcialmente la corriente ascendente →
  la flecha hacia arriba disminuye → el instrumento desciende.
- Texto INSTRUMENTO: "Medición… activa. Desplazamiento… ninguno." /
  "Ningún avance. Dos direcciones. Ningún avance."
- Texto INSTRUMENTO (después del puzzle): "Dos acciones. Una suma sin dirección.
  Quietud… con actividad."
- Síntesis (Bitácora 1): "Quietud activa: resultante nula."
  "un cuerpo puede permanecer inmóvil aunque existan fuerzas; si la suma vectorial
  sobre ese cuerpo es nula, su movimiento no cambia."

### Escena 4 — Valle a la deriva (sistema de referencia)
- Plataformas se desplazan lateralmente manteniendo separación fija.
- El jugador sube a una plataforma y usa el reloj para anclarla como referencia.
- Las plataformas vecinas se detienen entre sí; el entorno externo se mueve.
- Texto INSTRUMENTO: "La medición no cambió. Cambió desde dónde la contamos."
- Síntesis (Bitácora 2): "Desde dónde se mueve: sistema de referencia."
- Transportar una pieza frágil por tres plataformas + lanzar piedra a receptáculo.

### Escena 5 — Corriente transversal (vectores)
- Grieta con corriente horizontal que desvía los proyectiles.
- El reloj muestra el vector del lanzamiento y el de la corriente.
- El jugadorcompone vectores: apunta contra la corriente.
- Texto INSTRUMENTO: "Más intensidad… mismo error lateral."
  "No era lanzar más. Era lanzar hacia otro lugar para llegar al mismo lugar."
- Síntesis (Bitácora 3): "Flechas que se combinan: vectores."
- "magnitud, dirección y sentido determinan el resultado."

### Escena 6 — Roca y plano inclinado
- Una estación necesita una roca sobre un soporte elevado.
- La roca no puede levantarse directamente (demasiado pesada).
- El INSTRUMENTO señala una losa larga → rampa.
- Texto INSTRUMENTO: "Misma altura. Otra dirección. Más recorrido."
- Síntesis (Bitácora 4): "Subir dando un rodeo: plano inclinado."
- "un plano inclinado permite alcanzar una altura aplicando menor fuerza a lo largo
  de una distancia mayor. No crea energía gratuita."

### Escena 7 — Estación pedagógica (síntesis)
- Tres anillos con marcas del Instituto Roxana.
- Síntesis (Bitácora 5): "Un sistema compartido: consecuencias entre experimentos."
- Integrar: anclar anillo al sistema de referencia, orientar vectores, usar
  contrapeso de roca, acoplar reloj e instrumento.
- La región se estabiliza parcialmente, PERO otra roca comienza a flotar
  (consecuencia no deseada).
- Texto INSTRUMENTO: "La estación respondió. También cambió algo que no medimos."
- VOZ DOCENTE: "…ningún experimento está aislado cuando comparte el mundo con otro…"
- Texto INSTRUMENTO: "No falló. Obedeció demasiadas instrucciones."

### Escena 8 — Metrópolis
- Plataforma de observación revela una ciudad: edificios con distintas orientaciones,
  vehículos en paredes, trenes, torres resonantes, espejos, canales, distritos térmicos.
- Texto INSTRUMENTO: "La estación del valle era una entrada. Allí… hay demasiadas referencias."
  "Y una señal que todavía reconoce el reloj."
- Síntesis (Bitácora 6): "Physica — Fundamentos. Región estabilizada: parcial."
- Texto INSTRUMENTO: "Este lugar también era parte de la medición."

## 5. Texto canónico (TEXTUAL del guion v0.2)

### INSTRUMENTO (fragmentos)
1. "Medición… activa. Desplazamiento… ninguno."
2. "Ningún avance. Dos direcciones. Ningún avance."
3. "La medición no cambió. Cambió desde dónde la contamos."
4. "Más intensidad… mismo error lateral."
5. "No era lanzar más. Era lanzar hacia otro lugar para llegar al mismo lugar."
6. "Misma altura. Otra dirección. Más recorrido."
7. "Reconozco el acople. No reconozco la instrucción."
8. "Dos acciones. Una suma sin dirección. Quietud… con actividad."
9. "La estación respondió. También cambió algo que no medimos."
10. "No falló. Obedeció demasiadas instrucciones."
11. "La estación del valle era una entrada. Allí… hay demasiadas referencias."
12. "Y una señal que todavía reconoce el reloj."
13. "Este lugar también era parte de la medición."

### VOZ DOCENTE
14. "…ningún experimento está aislado cuando comparte el mundo con otro…"

### Bitácora (títulos formales)
1. "Quietud activa: resultante nula."
2. "Desde dónde se mueve: sistema de referencia."
3. "Flechas que se combinan: vectores."
4. "Subir dando un rodeo: plano inclinado."
5. "Un sistema compartido: consecuencias entre experimentos."
6. "Physica — Fundamentos. Región estabilizada: parcial."

### Síntesis conceptual (Bitácora cuerpos)
1. "un cuerpo puede permanecer inmóvil aunque existan fuerzas; si la suma vectorial sobre ese cuerpo es nula, su movimiento no cambia."
2. "el movimiento se describe respecto de una referencia. Cuando dos cuerpos comparten el mismo movimiento, su movimiento relativo puede ser nulo."
3. "magnitud, dirección y sentido determinan el resultado; los vectores relevantes se combinan."
4. "un plano inclinado permite alcanzar una altura aplicando menor fuerza a lo largo de una distancia mayor. No crea energía gratuita."
5. "un fenómeno físico no se comprende preguntando solamente cuánto. También importa hacia dónde, respecto de qué se describe y qué otras interacciones forman parte del sistema." (síntesis del arco)

## 6. Arquitectura técnica

### Archivos nuevos
```
src/experiences/physica/babylonWorld.ts     — mundo Babylon extendido (todas las escenas)
src/experiences/physica/models/
  caidaLibre.ts                             — ✅ existe
  tiroParabolico.ts                         — ✅ existe
  cascadaAscendente.ts                      — ✅ existe
  equilibrio.ts                             — nuevo: fuerzas opuestas, resultante nula
  referenciaMovil.ts                        — nuevo: sistema de referencia en movimiento
  vector.ts                                 — nuevo: magnitud, dirección, sentido, suma
  planoInclinado.ts                         — nuevo: rampa, fuerza reducida
src/experiences/physica/companion.ts        — nuevo: INSTRUMENTO esférico
src/experiences/physica/clock.ts            — nuevo: reloj-dispositivo
src/experiences/physica/styles.css          — ✅ existe (extender)
```

### Archivos modificados (solo aditivo)
- `babylonWorld.ts` — extensión del mundo existente (no reescribir)
- `main.ts` — ya monta `/physica/` correctamente
- `styles.css` — estilos adicionales para nuevos HUD

### Reglas duras
- Sin Havok (canon: física analítica de forma cerrada)
- Texto del guion: TEXTUAL, no inventar (TODO(guion) + placeholder)
- Vocabulario técnico solo en capa formal de Bitácora
- Modelos puros testeables + tests con imports .ts
- Español neutro (tuteo)

## 7. Criterios de aceptación

1. `/physica/` → Entrar → walk continuous desde cornisa → cascada → valle →
   gorge → inclined plane → estación → metrópolis observación.
2. Cada escena desbloquea su Bitácora entry con texto canónico.
3. El INSTRUMENTO acompaña al jugador desde Escena 3.
4. El reloj visualiza vectores y sistemas de referencia progresivamente.
5. `npm run build` y `npm test` en verde.
6. Visual quality: comparar con Trine 4/5, Planet of Lana, INSIDE, Little Nightmares II.
