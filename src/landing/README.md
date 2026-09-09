# Instituto Roxana — la escuela es la interfaz

El entry real es `../../index.html`. La landing ocupa una sola pantalla: el
Instituto 3D es la navegación. Las once salas se abren al tocar el edificio, sus
rótulos o el directorio accesible. Una cámara enfoca el espacio y un panel permite
usar sus servicios. En móvil, la sala queda arriba y el panel se desplaza debajo.

## Salas y funciones

- **Hall:** orientación, cuatro Mundos Aplicados y acceso al resto de la escuela.
- **Electrónica / Ohmdal:** portal jugable existente, continuar partida, banco de
  circuitos y lecturas. Pizarrón, instrumentos y portal del modelo son interactivos.
- **Programación / Bitland y Matemática / Arithmos:** bancos de práctica y materiales;
  sus aventuras completas siguen en preparación y se identifican como tales.
- **Física / Physica:** entrada al prototipo existente y banco de movimiento.
- **Preceptoría:** registro, login/logout, perfil y cambio de contraseña actual.
- **Biblioteca:** trece lecturas originales sobre proyecto, historia, creación y
  cuatro disciplinas. Búsqueda, categorías, favoritos, lector con índice,
  descarga de texto y registro de lectura completada.
- **Logros:** prácticas y lecturas del Instituto, más progreso real de la partida
  local del portal de Ohmdal. No se confunden prácticas con unidades de la aventura.
- **Dirección:** documentación de Roxana. **Audiovisual:** historias y cómo se hizo.
- **Anfiteatro:** alta/baja del boletín asociada a una cuenta. Persiste la preferencia;
  todavía no hay un proveedor de envío ni se manda un correo.

La búsqueda global encuentra salas y lecturas. Primera visita recorre cuatro
paradas. Ajustes controla calidad, movimiento reducido, rótulos y audio original
optativo. El audio comienza silenciado en cada visita. Sin WebGL, el directorio
abre los mismos servicios; sin JavaScript quedan enlaces a las aventuras existentes.

## Código y datos

- `index.ts`: ajustes, diálogos, arranque y compatibilidad del aula anterior.
- `schoolApp.ts`: interfaces de las salas, lector, búsqueda, prácticas y logros.
- `account.ts`, `serviceClient.ts`: formularios reales, sesión y cliente HTTP.
- `library.ts`, `worldActivities.ts`: contenido tipado y dominio de las prácticas.
- `experience.css`, `school3d.css`: interfaz del Instituto y escena responsive.
- `school3d.ts`: GLB, selección de objetos y foco con las salas vecinas ocultas.
- `school3dFraming.ts`: encuadre ortográfico oblicuo medido desde la geometría,
  con dirección más alta en móvil para leer las superficies de trabajo.
- `schoolAtmosphere.ts`: plinto biselado, bronce, umbrales y polvo original.
- `school3dLabels.ts`: once rótulos proyectados con separación para touch.
- `school3dPostFx.ts`: color, bloom con alfa conservado y calidad adaptativa.

Las APIs se implementan en `../../server/`; ver su README para contrato y despliegue.
Node 24 y SQLite guardan cuentas reales; cookies HttpOnly, CSRF y hashes scrypt.
El correo identifica la cuenta pero no se verifica; no hay recuperación por email.
La biblioteca y las prácticas se sincronizan por cuenta. El archivo de visitante
es independiente: `roxana-institute-guest-v1`. No se incorpora automáticamente al
entrar con otra identidad. Los PUT reemplazan cada recurso, con última escritura
ganadora entre dispositivos; no se ofrece edición concurrente colaborativa.

La partida se lee de `roxana-slice-v1` y `roxana-web-v1` sin modificarla.
`portalGateUrl()` dirige a `/jugar?from=portal&room=plaza`. `/jugar` continúa el
recorrido existente. La nueva versión Three.js de Ohmdal que estaba sin commit
en el checkout original no se copió ni modificó: al integrarla hay que centralizar
su destino y adaptador de guardado. `#aula/electronica` conserva el aula gráfica y
sus proyecciones; `#sala/electronica` es el nuevo espacio de la escuela.

## Ejecutar y verificar

```sh
npm run dev -- --host 127.0.0.1 --port 5186
node scripts/landing/playtest-landing.mjs
npm run build
npm test
npm run verify
npm start
```

Dev, preview y `npm start` sirven las APIs en el mismo origen. Publicar sólo `dist`
en hosting estático no ejecuta el servicio de cuentas. Para producción se requiere
Node y una ubicación persistente para `ROXANA_DB_PATH`, fuera de `dist` y Git.
`ROXANA_PUBLIC_ORIGIN` define el origen HTTPS canónico detrás del proxy.

El playtest recorre desktop y touch, cuenta, biblioteca, newsletter, prácticas,
logros, entradas jugables y fallos del renderer/almacenamiento. `LANDING_URL`
permite probar la build servida por Node. Evidencia y capturas van en `output/`.
`npm run test:services` prueba la API con bases temporales aisladas.

## Arquitectura y modelado

La planta de `scripts/blender/school_plan.py` se construye en
`scripts/blender/build_school.py`. Las aulas y los servicios comparten cota de
piso; Dirección está elevada 1,14 m y conectada al desembarco del Hall. Las cotas
se hornean en el modelo: el runtime no agrega terrazas ni levanta habitaciones
al pasar el puntero. El modelo usa paredes de corte bajas para exponer puertas,
aparatos y superficies de trabajo desde la cámara oblicua.

El generador verifica el apoyo y la separación de las sillas, el encuentro de
la escalera con Dirección y los pasillos de los NPC antes de exportar. `--blockout`
permite revisar geometría con Eevee; `--fast` reduce muestras para iteración.
La exportación final conserva colores de iluminación horneados y nombres de
salas, objetos interactivos y estados de progreso. Evidencia de composición y
recorridos se guarda en `output/playwright/`.

## Recursos

Se reutilizan los GLB del Instituto y la estatua del proyecto. La marca SVG,
ornamentos, geometría añadida y ambiente son originales. Three.js usa MIT.
Cormorant Garamond y DM Sans se sirven como WOFF2 locales con todos sus glifos y
licencias SIL OFL en `fonts/`. No se añadieron assets remotos ni dependencias.
