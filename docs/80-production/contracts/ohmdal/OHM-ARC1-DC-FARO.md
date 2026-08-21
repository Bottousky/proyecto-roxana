# Lago y Faro — contrato de capítulo DC

## Objetivo y error a desplazar

Integrar equivalentes, caída bajo carga, potencia, distribución y protección.
Errores esperados: que tensión sea cantidad almacenada, que cualquier entrega
que encienda sea segura y que mantener un sistema obligue a apagarlo entero.

## Escenario 1 — alimentación del Lago

El jugador predice la caída, configura feeder/calibre y cada ramal, energiza y
observa tensión entregada, carga del Tronco y servicios. Debe poder producir y
distinguir: camino ausente, caída excesiva y sobrecarga. La solución requiere
dos caminos atendidos bajo carga.

## Escenario 2 — reloj mecánico DC

El jugador configura el equivalente/divisor que alimenta un motor. El modelo
calcula corriente de serie, tensión y potencia reales del motor. El péndulo
muestra `quieto | lento | parejo | forzado`; sólo una ventana estable resuelve.
No hay almacenamiento eléctrico ni RC.

## Escenarios 3 y 4 — distribución y transferencia

Primero se pone en servicio lente, reloj y señal costera. Cada ramal expone
carga, calibre, fusible e interruptor. Deben cumplirse a la vez:

- los tres servicios dentro de su ventana de tensión/potencia;
- corriente total dentro del límite de fuente;
- corriente de cada ramal dentro de su ampacidad;
- protección coordinada `I_ramal <= fusible <= ampacidad`;
- aislamiento individual y mantenimiento local.

Después aparece una falla/limitación diferente. El jugador debe reconfigurar la
red y validarla de nuevo con una arquitectura físicamente distinta. No alcanza
repetir la primera combinación. El callback final y `lighthouseRestored` sólo
ocurren después de ambas soluciones.

## Mundo, epílogo y aceptación

Nereo compara el ritmo con su memoria. El Faro cambia luz, mecanismo, señal,
NPC, música y acceso. Edda usa la Bitácora para predecir, operar y verificar sin
el protagonista; el texto final permanece `TODO(guion)` hasta aprobación. El
retorno sale de Phaser por `/#sala/electronica`.

Player debe demostrar un fallo de cada clase, dos configuraciones finales,
reload entre escenarios, revisita restaurada, epílogo y retorno desktop/mobile.
RC y sus flags no pueden abrir locks ni conceder comprensión DC.
