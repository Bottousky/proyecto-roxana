# .playtest/ — evidencia generada local

> **Estado:** evidence bucket local, no canonical.
> **Política:** disposable. El contenido es evidencia runtime generada
> durante sesiones de playtest / debugging / investigación. Sólo se conserva
> lo que un humano promovió explícitamente a `reports/` o `screenshots/`.

## Reglas

1. **No versionar.** Todo el contenido de `.playtest/` está en `.gitignore`
   salvo este `README.md`. El `git status` no debe listar archivos aquí.
2. **Disposable.** Si el disco se llena, se borra la carpeta completa y
   los scripts la regeneran. Ningún pipeline de CI depende de `.playtest/`.
3. **Promoción manual.** Si una captura, traza, o reporte es evidencia de
   producto/historia, se mueve manualmente a:
   - `screenshots/` (aprobadas), o
   - `reports/<fecha>-<topico>.md` (aprobadas), o
   - `tests/visual/baselines/` (baselines visuales).

   **Nunca** se promueve vía commit directo de `.playtest/`.
4. **Reproducibilidad.** Las `.mjs` que generan outputs deben ser
   re-ejecutables desde el commit vigente; no se versionan sus outputs
   binarios intermedios (frames, blobs, dumps de memoria, logs crudos).
5. **Backups / temporales.** PID files, `.out.txt`, `.stdout.log`, `.bin`
   y dumps de debugging one-off también caen aquí y se ignoran.

## Qué vive aquí típicamente

- `smoke-*.png` — capturas automáticas de smoke play (pueden ser promovidas).
- `inspect-*.mjs` / `check-*.mjs` — scripts de inspección ad-hoc.
- `extract-*-frames.mjs` / `summarize-*.mjs` — herramientas de post-proceso.
- `r4*-*.json` — reportes de validación R4.
- `r42-*.mjs` — scripts de investigación R4.2.
- `blob-*.bin` — capturas binarias Phaser (transient).

## Lo que NO debe vivir aquí

- baselines visuales aprobadas → `tests/visual/baselines/`;
- reportes narrativos aprobados → `reports/`;
- capturas aprobadas → `screenshots/`;
- scripts reproducibles de CI → `scripts/` o `tests/`.

## Si el folder crece descontrolado

```bash
# Safe wipe (no prompt) — los scripts lo regeneran
rm -rf .playtest/*
git checkout -- .playtest/README.md   # si se borró
```
