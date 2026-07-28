# Validación de performance

`npm run school:report` inspecciona los chunks JSON de los GLB y registra bytes,
triángulos, primitivas, materiales, texturas y extensiones.

Las métricas de runtime se exponen en `window.__roxanaSchool3D` después de un segundo:

```json
{
  "fps": 60,
  "drawCalls": 51,
  "triangles": 298410,
  "rooms": 11,
  "progress": "initial"
}
```

Los valores reales se capturan con navegador en:

- 1920×1080;
- 1440×900;
- 390×844;
- `initial`;
- `electronics-arc-1-complete`.

El reporte medido está en `runtime-report.md`. La validación estricta de GLB se ejecuta con:

```powershell
npm run school:validate-gltf
```
