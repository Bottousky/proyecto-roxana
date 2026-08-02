# B03 híbrido — timeout de disponibilidad

- Ejecutor: `opencode/mimo-v2.5-free`.
- Resultado: ninguna salida candidata ni archivo editado después de diez minutos.
- Acción: proceso exacto del benchmark detenido al superar el límite de primer resultado.
- Diagnóstico aislado posterior sobre OpenCode Zen: `ConnectionRefused` al solicitar
  `https://opencode.ai/zen/v1/chat/completions`.
- Uso/coste: no reportado; se registra `null`.
- Veredicto: fallo operativo; no permite comparar calidad con la candidata Codex.
