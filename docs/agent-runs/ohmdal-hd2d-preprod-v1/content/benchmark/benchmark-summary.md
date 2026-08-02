# Resultado del benchmark de routing

**Estado:** cerrado con routing comparativo bloqueado  
**Fecha:** 2026-08-02  
**Ejecuciones:** 10 intentadas; 5 entregas Codex; 5 fallos de infraestructura híbrida

## Resultado ejecutivo

Codex produjo las cinco propuestas. Ningún brazo híbrido produjo contenido: Claude Code falló por
OAuth vencido; OpenCode Zen por conexión rechazada; MiniMax Token Plan por timeout y límite de uso
confirmado. Por lo tanto no existe evidencia para declarar que Codex razona mejor, usa menos tokens
o conviene económicamente frente a esos modelos. Sí existe evidencia de que hoy Codex es el único
control plane operativo para este hito.

No se selecciona un ganador global ni se autoriza H3. Tampoco se recomienda comprar créditos para
salvar esta ronda: primero deben recuperarse autenticación/conectividad y repetirse únicamente los
brazos híbridos bajo aprobación, con los mismos prompts congelados.

## Auditoría independiente de las entregas Codex

Tiempo y uso no fueron expuestos por los subagentes y permanecen `null`. El score observado usa 85
puntos disponibles; el normalizado es `observado / 85 × 100`.

| Par | Gate | Observado | Normalizado | Decisión |
|---|---|---:|---:|---|
| B01 — seguridad V2 candidata | PASS | 80/85 | 94,1 | válida |
| B02 — circuito/instrumento | PASS | 77/85 | 90,6 | válida con corrección menor |
| B03 — cámara | PASS | 62/85 | 72,9 | condicional |
| B04 — sprites 4/8 | FAIL | 61/85 | 71,8 | inválida |
| B05 — Ohm | FAIL | 57/85 | 67,1 | inválida |

Hallazgos que deben corregirse antes de integrar:

- B01: las rutas Markdown de fuentes no resuelven desde el artefacto; completar precondiciones T05.
- B02: la Bitácora dice «medí 20,00 mA calculados» aunque no hay medición de corriente; debe decir
  «calculé». Los cálculos de 250 Ω, 20 mA, nodos y potencias fueron reproducidos correctamente.
- B03: parámetros como `lerp(...,0,58)` y vectores con coma decimal son ambiguos y no se pueden
  implementar sin interpretación; reescribir con puntos decimales y estructuras nombradas.
- B04: referencias/prompt files inexistentes se presentan con `referenceRightsVerified:true`; eso
  falla el gate legal. Definir desempate angular, URL y fecha de observación.
- B05: repite el fallo legal de B04; además no fija radio/altura del collider ni layout/direcciones
  del sprite.

Los JSON de B04/B05 tienen forma compatible con el schema, pero el validador no demuestra que las
rutas existan ni que la declaración de derechos sea verdadera.

## Fallos híbridos observados

| Par | Ejecutor | Resultado |
|---|---|---|
| B01 | Claude Code Pro / Sonnet | HTTP 401, OAuth vencido; 0 tokens y USD 0 reportados |
| B02 | MiniMax M2.7 Token Plan | sin salida tras el límite de primer resultado; uso `null` |
| B03 | OpenCode MiMo gratuito | sin salida; diagnóstico Zen `ConnectionRefused` |
| B04 | OpenCode North gratuito | sin salida; diagnóstico Zen `ConnectionRefused` |
| B05 | MiniMax M3 Token Plan | HTTP 429, límite de Token Plan agotado |

Estos son fallos operativos, no derrotas de calidad. No se asigna ganador por par porque faltan
candidatas comparables.

## Decisión de routing inicial

1. Mantener Director, contexto, contratos, integración y revisión en Codex.
2. No delegar tareas productivas a Claude/OpenCode/MiniMax hasta pasar un smoke de autenticación y
   disponibilidad sin reintentos infinitos.
3. Corregir B03–B05 antes de convertir cualquier propuesta en contrato o manifest real.
4. Repetir sólo los cinco brazos híbridos con los prompts ya congelados cuando el usuario autorice
   ejecuciones adicionales; entonces sí evaluar calidad, tiempo, uso y coste por par.
5. No abrir H3, Meshy, generación paga ni `/jugar` por resultado de este benchmark.

## Gates del repositorio

- `npm run build`: PASS, 185 módulos.
- `npm test`: PASS.
- `npm run 3d:validate-manifests`: PASS sobre los manifests versionados existentes.
- `git diff --check`: PASS.
- `npm run verify`: no ejecutado; no hay distribución WSL operativa, por lo que no se declara PASS.
- Cambios del benchmark: sólo documentación; ningún archivo de `src`, `assets` o `/src/jugar` fue
  modificado.
