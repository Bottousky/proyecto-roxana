---
id: OHM-ARC1-DC
status: IMPLEMENTING
scope: ohmdal
owner_role: director
max_repair_loops_per_chapter: 2
---
# Ohmdal Arco I — contrato maestro DC

## Experiencia objetivo

El jugador parte de la landing isométrica Three.js, selecciona el Aula de
Electrónica, cruza el Portal y recorre Ohmdal en Phaser room-based hasta
restaurar el Faro. El retorno termina en `/#sala/electronica`. El Instituto
top-down y RC no forman parte del camino crítico.

## Bucle pedagógico obligatorio

Cada puzzle crítico debe presentar, en este orden observable:

1. fenómeno perceptible en el mundo;
2. predicción comprometida antes de energizar o intervenir;
3. manipulación del sistema por el jugador;
4. consecuencia visual y sonora redundante;
5. fallo que nombre la condición física ausente;
6. una variante de transferencia, no la repetición de la misma combinación;
7. formalización posterior en la Bitácora.

Cerrar un diálogo, abrir una room o seleccionar una respuesta no puede resolver
un puzzle. Los modelos puros validan condiciones y admiten varias soluciones
cuando la física lo permite.

## Camino crítico

`landing → aula-electronica → portal → plaza → taller/calzada/manantial →
castillo → forja → terrazas → lago/faro → epílogo → aula-electronica`

- Cuenca: `despertar`, `freno`, `puerta`, `bell`.
- Castillo: `chain`, `branches`, `distributor`.
- Forja: `warmth`, `infirmary`, `longchannel`, `forge`; `timbre` opcional.
- Terrazas: `steps`, `fairsplit`, `ladder`; `singlestone` opcional.
- Faro: `lakeFeedDc`, `clockDriveDc`, `lighthouseDistributionDc`.

La maestría opcional nunca bloquea una puerta crítica. No puede existir un lock
circular ni un avance obtenido por cerrar una UI.

## Estado, mundo y saves

- Una sola autoridad de progreso: flags semánticos en `src/state.ts`.
- Los estados regionales son monótonos y se derivan de esas flags.
- Cada restauración debe cambiar iluminación, operación, NPC, audio y acceso;
  la revisita y el reload conservan el cambio.
- `portalGateUrl()` siempre fuerza Plaza con llegada de Portal.
- Un final con `arcOneCompleted` o `lighthouseRestored` se conserva.
- Un save RC incompleto conserva capítulos previos, limpia sólo progreso RC de
  Faro y reaparece en `lighthouse_hall`; no recibe flags DC por migración.

## Faro DC

El cierre mantiene lente, reloj mecánico y señal costera dentro de sus ventanas
de tensión/potencia. Cada ramal tiene calibre, protección coordinada e
interruptor de aislamiento. El Tronco respeta su límite. El jugador debe poner
en servicio una arquitectura y resolver después una falla distinta mediante
otra configuración físicamente válida. Sólo entonces se marcan, en orden:

`solvedLakeFeedDc → solvedClockDriveDc →
solvedLighthouseDistributionDc → lighthouseRestored → unit5Completed →
arcOneCompleted`.

## Cinemáticas requeridas

`portal-arrival`, `awakening`, `puerta-apertura`, `faro-reveal`,
`faro-closing`, `instituto-return`.

En todas: el estado se confirma antes de reproducir; el input queda bloqueado;
existen skip y fallback; la cámara se restaura. El texto no aprobado usa
`TODO(guion)` y un placeholder neutro.

## Gates

- Mechanical: tests puros, grafo, migración, integración y build pasan.
- Player por capítulo: desktop y mobile/touch, error recuperable, predicción,
  transferencia, reload, revisita, audio redundante y consola limpia.
- Greybox final: recorrido completo desde landing hasta retorno al Aula, sin
  ayudas internas.
- Reviewer: sin bypasses, locks circulares, autoridad paralela ni contradicción
  pedagógica.
- Manuel: valida comprensión humana y autoriza arte/audio.

## Estado actual

`IMPLEMENTING`. La costura y los modelos DC tienen evidencia mecánica parcial.
Faltan transferencia jugable final, cinemáticas, Player/Reviewer y validación
humana. No se autoriza todavía el pase de arte/audio.
