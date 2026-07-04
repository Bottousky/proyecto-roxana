# Guion — Instituto (landing escolar)
# Texto canon. Los ejecutores copian TEXTUAL. Nada de esto se parafrasea.

**Versión:** 0.1 (2026-07-04) — cubre §1 (aula de electrónica, M3).
Las secciones de intro (M5), proyector (M7), preceptoría y trofeos (M8) se agregan cuando toquen esos hitos.

---

## §1. Aula de Electrónica (antesala, M3)

### 1.1 Línea de entrada del aula
(Reemplaza el placeholder «El aula está tomando forma.» del shell de M2. Aparece como leyenda discreta al entrar.)

> Huele a cobre y a polvo. Algo, al fondo, todavía respira.

### 1.2 Hotspots — etiquetas
(Se muestran al hover/foco de cada hotspot.)

- Pizarrón: **«El pizarrón»**
- Proyector: **«El proyector»**
- Portal: **«El portal»**

### 1.3 El pizarrón (panel de progreso)
Título del pizarrón: **«Plan del curso — Electrónica»**

Estado SIN save (aula `off`) — solo el título y esta línea:
> El curso espera a su primer estudiante.

Estado CON save — lista de unidades, cada una con su marca (✓ completada, · pendiente), en este orden y con estos nombres:
1. «La corriente no es magia»
2. «El río se reparte»
3. «El precio del río»
4. «La vuelta completa»
5. «La chispa que se queda»

<!-- Títulos canon tomados de los encabezados de docs/unidad-1..5. -->

Pie del pizarrón SOLO si `arcoCompleto`:
> Curso completado. El pueblo se enciende solo.

### 1.4 El proyector (M7 pendiente — respuesta provisional al click)
Toast/leyenda breve:
> La cinta está rebobinada. Pronto habrá función.

### 1.5 El portal (M4 pendiente — comportamiento provisional)
Al click navega directo al juego (`/src/jugar/`), sin transición todavía (la transición eléctrica es M4).
Leyenda al hover, debajo de la etiqueta:
> Cruza.
