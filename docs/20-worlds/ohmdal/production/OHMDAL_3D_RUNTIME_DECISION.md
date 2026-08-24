# Decisión de runtime 3D de Ohmdal

**Estado:** canónico para producción.

**Fecha:** 2026-08-24.
**Evidencia base:** Plaza 3D aceptada en `325e11a` y hardening H1–H8.

## Decisión

El runtime 3D canónico actual de Ohmdal es **PlayCanvas Engine v2 + TypeScript + Vite**. Blender es el DCC master para assets 3D; cada asset de runtime termina como GLB portable con procedencia y validación. El core pedagógico sigue siendo TypeScript puro y no depende del renderer.

El prototipo Three.js permanece como evidencia de I+D e historia de diseño. No es una segunda ruta de producción ni una implementación paralela a mantener. Esta decisión no homogeneiza Roxana: P12 mantiene la libertad técnica de cada mundo.

## Criterio de reapertura

La decisión sólo se reabre con evidencia reproducible de un bloqueo material que PlayCanvas no pueda resolver dentro de los presupuestos y targets vigentes, por ejemplo:

- una capacidad indispensable del diseño aprobado ausente o inviable en Engine v2;
- una regresión sostenida de rendimiento o compatibilidad en hardware objetivo, medida fuera de renderer por software;
- un bloqueo de accesibilidad, mobile/touch o despliegue que no admita corrección local;
- costo de producción demostrado mayor que una alternativa mediante un spike equivalente.

Una preferencia, demo aislada o novedad de engine no alcanza. Reabrir implica decisión humana explícita sobre engine/dependencias, plan de migración y nuevas baselines; hasta entonces PlayCanvas es la única ruta 3D de producción de Ohmdal.
