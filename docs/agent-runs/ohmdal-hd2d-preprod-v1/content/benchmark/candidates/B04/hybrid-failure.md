# B04 híbrido — timeout de disponibilidad

- Ejecutor: `opencode/north-mini-code-free`.
- Resultado: ninguna salida candidata ni archivo editado después de más de diez minutos.
- Acción: proceso exacto del benchmark detenido al superar el límite de primer resultado.
- Diagnóstico de proveedor: el smoke de OpenCode Zen falló con `ConnectionRefused`; esta sesión no
  expuso un error propio antes de ser detenida.
- Uso/coste: no reportado; se registra `null`.
- Veredicto: fallo operativo; no permite comparar calidad con la candidata Codex.
