Original prompt: Rescatar Proyecto Roxana después de varios meses de iteraciones: ordenar la visión del ecosistema educativo jugable, investigar alternativas y guías actuales, auditar la calidad alcanzable y limpiar el repositorio sin perder la base estable.

## Estado

- Baseline y cierre: `npm run build` y los 57 archivos de `npm test` pasan.
- El hito multiagente `instituto-hall-v1` sigue en borrador con `executionAuthorized: false`; no se delegó ni se inició producción visual.
- `docs/START_HERE.md` consolida producto, loop, mundos, Bitácora y arquitectura híbrida.
- Corrección del 30 de julio: Ohmdal actual es base de regresión, no diseño aprobado. El siguiente
  hito es «Ohmdal mundo vivo»: mapa amplio continuo y un puzzle diegético sin banco modal.
- La portada clásica y la escuela Three.js se cargan de forma excluyente. El chunk inicial de la
  landing quedó en 8,63 kB y la escuela 3D en un chunk bajo demanda de 715,60 kB.
- `render_game_to_text` expone selección, progreso, salas y métricas para pruebas automatizadas.
- Evidencia real de navegador: escuela 3D y `?view=classic` abren sin errores de consola.
- GLB de Instituto y estatua, validadores escolares y manifiesto de ejemplo pasan. Los assets
  activos aún necesitan manifiestos reales.
- Se retiraron netos 815,09 MiB del workspace hacia
  `C:\YO\Proyectos\Roxana-archive-2026-07-30`: material ignorado, fuentes históricas,
  renders, zips/backups y salidas regenerables. No se movió ningún archivo versionado.
- El build post-limpieza reveló 17 assets runtime ignorados por error; se restauraron 8,12 MiB y
  `.gitignore` ahora permite versionarlos.
- `assets/` bajó de 808,83 MiB a aproximadamente 172,23 MiB dentro del workspace.
- Pendientes: ejecutar el spike autorizado, medirlo en Android físico y decidir si su arquitectura
  reemplaza progresivamente la presentación actual.

## Restricciones vigentes

- Preservar `/jugar` como baseline mientras `/labs/ohmdal-vnext` prueba su reemplazo.
- No declarar prototipos 3D como arte final.
- No borrar trabajo versionado ambiguo sin clasificarlo.
- No reescribir la historia Git de aproximadamente 848 MiB sin una tarea y aprobación separadas.
