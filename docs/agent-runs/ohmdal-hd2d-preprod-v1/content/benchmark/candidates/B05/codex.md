## Metadatos de ejecución

- `taskId: B05`
- Modo: propuesta read-only; no se editaron archivos, no se generaron assets ni se ejecutaron capturas o mediciones.
- Archivos consultados: `AGENTS.md`, contratos del hito, manifiesto, ownership, canon de personaje/dirección/pipeline y skills de dirección 3D y pipeline híbrido.
- Restricción: Meshy y toda generación paga están prohibidos; ambos candidatos son originales y quedan en `planned` hasta la integración.
- Supuesto de comparación: cámara, seed, recorrido, pantalla, acciones, altura aparente, tiempo de producción e indicadores de estado son idénticos. Las cifras siguientes son límites propuestos, no métricas observadas.

## Identidad invariante

Ohm es un autómata consciente, compañero e instrumento: mide dentro de límites, expresa incertidumbre y no decide la hipótesis ni la solución. Debe leerse como hard-surface pequeño junto a sprites, con origen en el suelo y sin apariencia infantilizada.

- Silueta común: base compacta estable; cuerpo bajo con carcasa técnica; visor/pecho dominante; dos brazos-sensor legibles; tapa superior; emisor frontal. La identidad no depende de una franquicia, material extraído ni color aislado.
- Frente semántico: `+Z`; visor, sensor y emisor miran al frente. En sprite, cada celda direccional conserva ese frente lógico.
- Escala propuesta para validar: altura física `1.03 m`, razón humana `0.60` respecto del maniquí de `1.72 m`. La aprobación depende de que ambas variantes mantengan la misma caja visible en la cámara aprobada; este valor debe confirmarse con el blockout, no darse por medido.
- Pivote raíz: `bottom-center`, a nivel de suelo. No se permite compensar altura mediante una traslación oculta del billboard.
- Collider común: cápsula centrada en la raíz; radio y altura se fijan una sola vez después del blockout y se reutilizan sin depender de geometría, frames o partes móviles.
- Sombra/contacto: la misma sombra elíptica de contacto, anclada al pivote raíz, con la misma opacidad y tamaño relativo. Ninguna variante puede flotar ni usar sombra dinámica exclusiva.
- Estados equivalentes: `idle`, `locomotion`, `sensor-deployed`, `measurement-valid`, `measurement-blocked`, `uncertain/recovery`.
- Acciones equivalentes: acompañar al estudiante, detenerse y orientar el frente, desplegar sensor, medir, indicar resultado no concluyente y replegarse. El cambio de estado debe ser visible por forma/ritmo, texto y sonido; nunca sólo por color.
- Accesibilidad: etiqueta textual/subtítulo del estado, icono o forma redundante, modo de movimiento reducido, sin destellos rápidos y señal sonora con equivalente visual. La etiqueta no debe ocultar pies, conectores ni el punto de medición.
- Tiempo de producción propuesto: máximo `45 min` por variante, con el mismo desglose de 10 min de silueta/contrato, 20 min de construcción, 10 min de estados/anclajes y 5 min de manifiesto/autochequeo. La integración browser-visible se mide aparte y se aplica por igual.

## Variante sprite/impostor

- Representación: atlas original direccional de pixel art o impostor de cámara fija, billboard vertical con pivote de pies. No reutiliza frames, siluetas ni UI de referencias externas.
- Partes legibles dentro del atlas: base, carcasa, visor/pecho, brazo izquierdo, brazo derecho, sensor, tapa y emisor. Los puntos semánticos se publican como anclajes normalizados del frame, no como geometría ficticia.
- Direcciones: las mínimas necesarias para mantener frente y actuación en los encuadres aprobados; el contrato no presupone cuatro u ocho. Todas las direcciones comparten caja, pivote, altura y contacto.
- Estados: cada estado conserva los anclajes `sensor_mount`, `arm_left`, `arm_right`, `hatch_top` y `emitter_front`; si un frame no puede representarlos sin ambigüedad, falla la variante.
- Material: un material de sprite compartido y un atlas original de hasta `512×512`; filtro y padding se deciden en integración para evitar bleeding, halo o efecto sticker.
- Sombra: el mismo decal/quad de contacto que la variante procedural.
- Presupuesto propuesto por instancia activa: hasta 4 draw calls incrementales, 1 material propio, 3.000 triángulos como techo de comparación —aunque el billboard use menos—, textura máxima 512 y memoria GPU incremental máxima de `1,25 MiB`.
- Editabilidad: los cambios de silueta o actuación requieren editar frames; los sockets lógicos se declaran por frame y se prueban contra el mismo comportamiento.
- Disposal: al desmontar, remover billboard y sombra; liberar atlas y material sólo si son exclusivos del asset. Si el atlas/material se comparte, el gestor de recursos conserva referencia contada y no lo libera prematuramente.

## Variante procedural

- Representación: fábrica Three.js procedural, determinista para una misma semilla y parámetros; sin Meshy, GLB importado ni generación paga.
- Jerarquía modular propuesta:

```text
ohmRoot (bottom-center, +Z)
├─ chassisStatic       # carcasa, base, tapa cerrada
├─ visorChestStatic    # visor/pecho y emisor
├─ armLeftPivot
│  └─ armLeftSensor
└─ armRightPivot
   └─ armRightSensor
```

- Partes y pivotes: `armLeftPivot`, `armRightPivot`, `sensor_mount`, `hatch_top` y `emitter_front` se nombran y se exponen. La tapa puede ser geometría estática durante el A/B si no participa de una acción obligatoria; si la acción exige abrirla, pasa a un nodo con pivote explícito.
- Estados: despliegue/repliegue por transformaciones deterministas de brazos y sensor; visor/emisor por parámetro de material y forma, sin duplicar mallas por color.
- Collider y sombra: exactamente la cápsula y la sombra de contacto comunes; las extremidades no expanden el collider.
- Materiales: un material hard-surface compartido con parámetros para cuerpo, cobre envejecido y emisión limitada; no más de un material propio por instancia. No incorpora iluminación ni sombras exclusivas.
- Presupuesto propuesto por instancia activa: los mismos techos comparables de hasta 4 draw calls incrementales, 1 material propio, 3.000 triángulos, textura máxima 512 si finalmente hiciera falta y memoria GPU incremental máxima de `1,25 MiB`.
- Editabilidad: parámetros de dimensiones, visor, separación de brazos, ángulos de pivote y amplitud de estados se exponen en la fábrica. Las piezas estáticas pueden agruparse; ninguna malla monolítica puede ocultar las partes móviles o sockets.
- Disposal: el handle de la fábrica elimina nodos, cancela callbacks/animaciones y libera geometrías, materiales y texturas exclusivas. Recursos compartidos se liberan sólo cuando su contador de referencias llega a cero.

## Manifests propuestos

Plantillas estructuralmente compatibles con `assets/manifests/assets.schema.json`. Los valores de escala son objetivos de la propuesta, no mediciones; antes de cambiar de `planned` deben confirmarse con la cámara/blockout y existir las rutas referidas.

```json
{
  "id": "rx_ohm_sprite_impostor_ab",
  "displayName": "Ohm — sprite/impostor A/B",
  "world": "ohmdal",
  "category": "sprite",
  "sourceMethod": "sprite",
  "status": "planned",
  "references": [
    "assets/references/ohmdal-hd2d-preprod/ohm-original-spec.md"
  ],
  "generation": {
    "provider": "none",
    "taskId": "B05",
    "promptFile": "assets/source/ohmdal-hd2d-preprod/ohm-sprite-spec.md",
    "creditsSpent": 0,
    "generatedAt": "2026-08-02"
  },
  "license": {
    "owner": "Proyecto Roxana",
    "referenceRightsVerified": true,
    "notes": "Diseño original; referencias externas sólo se analizan y no se redistribuyen."
  },
  "scale": {
    "unit": "meter",
    "height": 1.03,
    "humanRatio": 0.6
  },
  "frontAxis": "+Z",
  "pivot": "bottom-center",
  "collider": {
    "type": "capsule"
  },
  "sockets": [
    "sensor_mount",
    "arm_left",
    "arm_right",
    "hatch_top",
    "emitter_front"
  ],
  "runtime": {
    "desktop": {
      "path": "assets/runtime/ohmdal-hd2d-preprod/ohm/sprite-impostor.png",
      "maxTriangles": 3000,
      "maxTexture": 512,
      "maxMaterials": 1,
      "maxDrawCalls": 4
    },
    "mobile": {
      "path": "assets/runtime/ohmdal-hd2d-preprod/ohm/sprite-impostor.png",
      "maxTriangles": 3000,
      "maxTexture": 512,
      "maxMaterials": 1,
      "maxDrawCalls": 4
    }
  },
  "print": {
    "enabled": false,
    "type": "none",
    "path": "",
    "scaleMm": 0
  },
  "notes": "Atlas original con pivote de pies, anclajes normalizados por frame, sombra de contacto compartida, seis estados equivalentes, etiqueta accesible y disposal con referencias contadas."
}
```

```json
{
  "id": "rx_ohm_procedural_ab",
  "displayName": "Ohm — hard-surface procedural A/B",
  "world": "ohmdal",
  "category": "hard-surface",
  "sourceMethod": "procedural-three",
  "status": "planned",
  "references": [
    "assets/references/ohmdal-hd2d-preprod/ohm-original-spec.md"
  ],
  "generation": {
    "provider": "none",
    "taskId": "B05",
    "promptFile": "assets/source/ohmdal-hd2d-preprod/ohm-procedural-spec.md",
    "creditsSpent": 0,
    "generatedAt": "2026-08-02"
  },
  "license": {
    "owner": "Proyecto Roxana",
    "referenceRightsVerified": true,
    "notes": "Geometría procedural original, modular y determinista; no usa Meshy ni generación paga."
  },
  "scale": {
    "unit": "meter",
    "height": 1.03,
    "humanRatio": 0.6
  },
  "frontAxis": "+Z",
  "pivot": "bottom-center",
  "collider": {
    "type": "capsule"
  },
  "sockets": [
    "sensor_mount",
    "arm_left",
    "arm_right",
    "hatch_top",
    "emitter_front"
  ],
  "runtime": {
    "desktop": {
      "path": "assets/runtime/ohmdal-hd2d-preprod/ohm/procedural.ts",
      "maxTriangles": 3000,
      "maxTexture": 512,
      "maxMaterials": 1,
      "maxDrawCalls": 4
    },
    "mobile": {
      "path": "assets/runtime/ohmdal-hd2d-preprod/ohm/procedural.ts",
      "maxTriangles": 3000,
      "maxTexture": 512,
      "maxMaterials": 1,
      "maxDrawCalls": 4
    }
  },
  "print": {
    "enabled": false,
    "type": "none",
    "path": "",
    "scaleMm": 0
  },
  "notes": "Fábrica modular con chassis, visor, dos pivotes de brazo y sensor; misma cápsula, sombra, estados, presupuesto y contrato accesible que el sprite. Dispose explícito de recursos exclusivos."
}
```

## Matriz de prueba

| Prueba | Condición idéntica | Evidencia requerida | Gate |
|---|---|---|---|
| Integración espacial | Seed `ohmdal-hd2d-preprod-v1`, misma ruta Portal–Plaza–Taller–Puerta–Manantial, mecanismo apagado | Capturas comparables y video/captura de recorrido | 4/5 |
| Cámara y altura | Desktop 1440×900 y mobile 390×844; mismo encuadre aprobado, pivote y sombra | Caja visible, contacto con suelo, oclusión y consola | 4/5 |
| Actuación | Seis estados y mismas transiciones; medir válido, bloqueado e incierto | Captura por estado, subtítulo y equivalente no cromático | 4/5 |
| Lectura técnica | Sensor, brazos, visor/pecho, tapa y emisor distinguibles | Comparación lado a lado en distancia real | 4/5 |
| Collider/sockets | Misma cápsula, frente `+Z` y cinco sockets declarados | Debug overlay y prueba de seguimiento/interacción | Obligatorio |
| Accesibilidad | Movimiento reducido, sin destello crítico, texto/forma/sonido redundantes | Checklist y pruebas de estados | 4/5 |
| Coste render | Mismo viewport, estado y zona; una sola variante activa por corrida | `renderer.info.render`, `renderer.info.memory`, frame time y peso transferido | Dentro de techo; no estimar |
| Estabilidad | Montaje/desmontaje repetido y cambio A/B | Consola, conteo de recursos antes/después y prueba de `dispose()` | 4/5 |
| Editabilidad | Cambio controlado de visor, sensores y estado | Diff acotado y tiempo real de ajuste registrado | 4/5 |
| Legal/trazabilidad | Sólo diseño y fuentes originales; manifiesto completo | Manifiesto, licencia, hashes al existir runtime | 5/5 |

No hay mediciones actuales: `renderer.info`, memoria, FPS, peso, draw calls reales, capturas y resultados de disposal permanecen pendientes de integración.

## Criterio de decisión y descarte

1. Integrar ambas variantes por separado con la cámara aprobada, el mismo estado determinista, el mismo recorrido y una sola variante activa.
2. Descartar de inmediato una variante que carezca de derechos, pivote/frente/collider, estados equivalentes, sockets semánticos, accesibilidad, disposal o que exceda el techo medido sin una corrección acotada.
3. Si ambas pasan los eliminatorios, puntuar por separado integración espacial, actuación, editabilidad y coste medido. Los gates obligatorios no se compensan con promedio.
4. El coste compara draw calls, memoria, triángulos, peso transferido y frame time observados en desktop y mobile; no se sustituye por estimaciones de complejidad.
5. Elegir la variante que alcance todos los gates y aporte la mejor lectura de sensor, pivotes, brazos, tapa, contacto y luz con menor coste y corrección manual. El 3D no gana por novedad; el sprite no gana sólo por ser más barato.
6. Si ninguna alcanza los gates o la cámara aprobada no está disponible, registrar bloqueo y conservar ambas como `planned`.
7. Tras una decisión válida, archivar la perdedora como evidencia fuera del runtime, con motivo, hash cuando exista y manifiesto `archived` o `rejected`; no mantener dos pipelines activos.

## Riesgos y autoauditoría

- La escala de Ohm aún depende del blockout y la cámara; los valores propuestos no son evidencia de escala aprobada.
- El atlas puede perder articulación de sensor/brazos o producir snap; la geometría procedural puede romper el contraste HD-2D o superar el límite de draws.
- El schema vigente exige valores numéricos aun para assets `planned`; los números de las plantillas deben sustituirse por datos confirmados antes de validarlas como candidatas runtime.
- Materiales e iluminación pertenecen a Arquitectura; este contrato sólo exige compatibilidad y no reasigna esa frontera.
- No se invocó Meshy, no se presupuestó generación paga, no se añadieron dependencias ni se afirmó una métrica, captura, validación o ganador inexistente.
