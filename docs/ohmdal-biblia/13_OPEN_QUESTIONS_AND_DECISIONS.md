# Registro de decisiones y riesgos verificables

**Estado:** decisiones humanas cerradas el 2026-08-01
**Regla:** este archivo ya no contiene preferencias abiertas. Los riesgos se resuelven con
evidencia; una modificación de dirección requiere registrar una nueva decisión.

## Decisiones canónicas

| ID | Decisión cerrada | Consecuencia obligatoria |
|---|---|---|
| D01 | La Biblia de Ohmdal se promueve tras la entrevista | Prevalece sobre documentos históricos; `/jugar` sigue estable hasta ADR |
| D02 | El conflicto es olvido gradual, social y técnico | Sin villano oculto, invasión maligna ni solución por combate |
| D03 | Los habitantes son seres conscientes nacidos en Ohmdal | Poseen derechos y consecuencias reales; el Instituto tiene responsabilidad ética |
| D04 | El protagonista es un estudiante definido, sin formación previa | Cuatro diseños completos, nombre escrito y pronombres configurables |
| D05 | El Instituto se desvinculó gradualmente | Burocracia, pérdida de docentes y comunicación rota durante cuarenta años |
| D06 | La Luz integra Taller 1.º–3.º y fundamentos seleccionados de 4.º | Juego base completo y gratuito; no equivale a cursar años escolares |
| D07 | Audiencia principal 13–18 y adultos | Entrada desde cero, rigor por capas y lenguaje rioplatense natural |
| D08 | Three.js híbrido es la dirección futura | Entornos 3D, personajes pixel art y cámara autoral en laboratorio aislado |
| D09 | DRAGON QUEST III HD-2D REMAKE es quality bar permanente | Igual coherencia y pulido en menor escala; nunca similitud por copia |
| D10 | El mundo usa overworld explorable y dioramas densos | No selector de nodos ni mundo abierto seamless |
| D11 | Ohm es compañero permanente | Autómata consciente, memoria fragmentada, precisión y humor seco |
| D12 | Edda es aliada regional | Aparece estratégicamente, progresa fuera de cámara y puede rivalizar en método |
| D13 | La Consejera conserva fragmentos | No es antagonista; administra desde evidencia incompleta y miedo |
| D14 | La Bitácora traduce vivencia a formalización | Diario ilustrado autoral; Ohm mide y el estudiante interpreta |
| D15 | La matemática usa capas adaptativas | Estimación/cálculo básico en campaña; rigor adicional en laboratorios opcionales |
| D16 | Las evaluaciones formales viven en La Escuela | Enlace opcional en pestaña nueva; nunca bloquean la aventura |
| D17 | La validación educativa es autónoma por agentes | Escalar sólo contradicción, seguridad o incertidumbre real; V2 exige reproducción |
| D18 | Métricas local-first y opt-in | Intentos locales; envío anónimo o vínculo voluntario; sin cuenta obligatoria |
| D19 | Base gratuita y financiación mixta | DLC económicos; becas/patrocinio liberan el contenido completo |
| D20 | PWA instalable | Campañas descargables, partidas locales y funcionamiento offline |
| D21 | Gameplay mobile completo adaptado | Android medio 2022, piso 30 fps; reducir calidad, no contenido |
| D22 | Soporte web amplio | Chrome, Edge, Firefox y Safari recientes; teclado y táctil completos |
| D23 | Accesibilidad desde el slice | Texto, contraste, color, subtítulos, movimiento, reasignación y tiempo sin presión |
| D24 | Audio de identidad propia | Voces parciales; orquesta + electrónica; slice de tarde a crepúsculo |
| D25 | Continuidad selectiva | Preservar mundo, personajes, modelos y mejores escenas; reescribir presentación |
| D26 | H2 promueve cámara casi ortográfica, 4 direcciones y Ohm sprite | Las alternativas quedan archivadas; sólo se reabren con una falla observable nueva |
| D27 | Arco I usa Jira serie con WIP global uno | Ninguna tarea sucesora comienza hasta que la anterior esté `DONE` |

## Nombres cerrados

- Campaña/arcos: **La Luz, La Marea, La Señal, Las Máquinas, La Decisión, La Voz y
  El Empalme**.
- Guardiana de las Terrazas: **Vega**.
- Farero: **Nereo**.
- **Yesca, Lumen, Edda, Ohm y Consejera** conservan sus nombres o rol.

## Vertical slice cerrado

- Recorrido: Portal → Plaza → Edda → despertar de Ohm → Lumen → Puerta de Ohm → Manantial.
- Duración: 25–35 minutos en primera partida.
- Lumen: diagnóstico guiado auténtico, una topología, un instrumento y varios órdenes válidos.
- Ohm acompaña; Edda cruza el recorrido en momentos concretos, no se suma permanentemente.
- Overworld: sólo la escala mínima para demostrar viaje y entrada; no producir el mapa completo.
- Dos rondas máximas: avanzar, corregir una vez o descartar. Una tercera requiere nueva decisión.

## Riesgos con regla de resolución

| Riesgo | Evidencia que lo cierra | Freno |
|---|---|---|
| Exactitud educativa | Fuentes, cálculos reproducidos, tests y auditoría V2 | Escalar seguridad, contradicción o incertidumbre real |
| Quality bar demasiado costoso | Coste por minuto, captura comparada y backlog del slice | No ampliar territorio antes de aprobar composición y actuación |
| Rendimiento mobile | Android medio 2022, `renderer.info`, peso y frame time | Piso inferior a 30 fps bloquea avance |
| PWA/Safari | Instalación, offline, recuperación y actualización en navegadores soportados | No prometer offline antes de prueba real |
| Fragmentación por DLC | Política publicada y prueba de acceso escolar/beca al paquete completo | Prohibido vender la conclusión del juego base |
| Agencia local | Playtest narrativo y escenas de mantenimiento por habitantes | El protagonista no puede ser salvador indispensable |
| Datos educativos | Inventario de eventos, consentimiento y prueba offline | Sin texto libre, nombre o identificador escolar en analítica anónima |

## Control de cambios

Una nueva preferencia no se edita silenciosamente: agregar `D26+` con fecha, motivo, decisión
reemplazada, impacto documental y necesidad —o no— de ADR. Los riesgos técnicos se actualizan con
evidencia, no se convierten en preguntas humanas por defecto.
