# Servicios del Instituto

Backend Node.js 24 con SQLite y `crypto`, sin dependencias adicionales. El plugin
`server/vite-plugin.mjs` lo monta en `npm run dev` y `npm run preview`. Para servir
la aplicación compilada y sus APIs juntas: `npm run build` y `npm start`.
`npm run test:services` verifica el contrato con bases temporales aisladas; también
forma parte de `npm test`.

## Datos y despliegue

- `ROXANA_DB_PATH`: archivo SQLite persistente. Default `output/server/roxana.sqlite`.
  Debe permanecer fuera de `dist` y de Git. Para alojarlo, usar un volumen persistente
  con permisos restringidos al usuario del servicio y copias de seguridad de SQLite.
- `ROXANA_PUBLIC_ORIGIN`: origen canónico, por ejemplo `https://instituto.example`.
  Configurarlo detrás de un proxy HTTPS; las cookies llevan `Secure` cuando el origen
  usa HTTPS. No se confía en headers forwarded enviados por clientes.
- `ROXANA_TRUSTED_PROXIES`: lista opcional de IP exactas del proxy, separadas por
  comas (por ejemplo `127.0.0.1,::1`). Por defecto está vacía y se ignora
  `X-Forwarded-For`. Sólo si el peer TCP está en esta lista se recorre ese header
  de derecha a izquierda hasta la primera IP no confiada para aplicar cuotas por
  cliente. El proxy debe sobrescribir el header o agregar la IP real al final;
  no debe reenviar sin cambios un header arbitrario del navegador. No se admiten
  CIDR ni comodines. Las IP IPv4 mapeadas en IPv6 se normalizan. Valores malformados
  vuelven a la IP TCP. Configurar sólo proxies bajo control del operador, y evitar
  acceso directo al backend público. `createRoxanaApi({trustedProxies:[...]})`
  ofrece el mismo ajuste para integración y pruebas.
- `HOST` y `PORT`: bind del servidor de producción. Defaults `127.0.0.1:4173`.
  Un bind fuera de localhost exige `ROXANA_PUBLIC_ORIGIN`.
- Un hosting puramente estático no ejecuta estas APIs. Publicar `dist` solo mantiene
  los juegos pero no las cuentas. El servidor Node resuelve las rutas limpias de
  `/jugar`, `/physica`, `/ohmdal-plaza` y `/ohmdal-playcanvas`.

Los usuarios se identifican con un ID aleatorio. Las contraseñas usan scrypt con
salt individual (N=32768, r=8, p=1), nunca se registran en logs ni se devuelven.
Las sesiones son cookies HttpOnly SameSite=Lax; sus tokens se almacenan hasheados.
Expiran en 24 horas para visitantes o 30 días para cuentas. Login/registro/logout
rotan sesión y CSRF; cambiar contraseña invalida todas las sesiones anteriores.
Hay límites por IP y límite de concurrencia para hashes de contraseñas.

El correo se usa como identificador y **no se verifica**. La inscripción newsletter
registra consentimiento y fecha en SQLite, pero **no envía correos**. No existe
recuperación de contraseña ni confirmación por email; no presentar esas funciones.
Los logros sincronizados son datos de aprendizaje del cliente, no certificaciones.
Los guardados completos de los juegos conservan sus propios mecanismos actuales.

## Contrato HTTP

Leer `GET /api/session` antes de modificar datos. Responde
`{ user: null | { id, name, email, newsletter }, csrfToken }` y crea una sesión de
visitante si no existe. Enviar cookies same-origin, `Content-Type: application/json`
y `X-CSRF-Token` en las mutaciones; el navegador agrega `Origin`. El servidor exige
origen exacto y token CSRF. No habilita CORS. Todos los responses API son `no-store`.

| Método y ruta             | JSON de entrada                                      | Respuesta                                            |
| ------------------------- | ---------------------------------------------------- | ---------------------------------------------------- |
| POST `/api/auth/register` | `{name,email,password}`                              | Sesión actualizada                                   |
| POST `/api/auth/login`    | `{email,password}`                                   | Sesión actualizada                                   |
| POST `/api/auth/logout`   | `{}`                                                 | Sesión visitante actualizada                         |
| POST `/api/auth/password` | `{currentPassword,newPassword}`                      | Sesión actualizada                                   |
| PATCH `/api/profile`      | `{name}`                                             | Sesión actualizada                                   |
| PUT `/api/newsletter`     | `{subscribed:boolean}`                               | Sesión y `delivery: "not_sent"`                      |
| GET `/api/library`        | —                                                    | `{bookmarks:string[],reading:Record<string,number>}` |
| PUT `/api/library`        | `{bookmarks:string[],reading:Record<string,number>}` | Estado guardado                                      |
| GET `/api/progress`       | —                                                    | `{achievements:string[]}`                            |
| PUT `/api/progress`       | `{achievements:string[]}`                            | Estado guardado                                      |

Guardar cada `csrfToken` nuevo devuelto. Newsletter, perfil, biblioteca, progreso
y cambio de contraseña requieren cuenta autenticada. No se modifica el correo.
Nombre: 2–60 caracteres; contraseña: 10–128; email: hasta 254. IDs de contenidos y
logros: `/^[a-z][a-z0-9-]{1,79}$/`, máximo 100. Lectura: enteros 0–100. PUT reemplaza
el estado completo de ese recurso; leer y combinar estado antes de guardar para
mantener lo recuperado al iniciar sesión. Dos escrituras concurrentes aplican la
última recibida. No hay un mecanismo de resolución de conflictos entre dispositivos.

Errores: `{error:{code,message}}`. HTTP 400 datos inválidos, 401 falta de autenticación
(o credenciales incorrectas), 403 origen/CSRF, 409 registro no disponible o estado
cambiado, 413 body mayor a 24 KiB, 415 formato incorrecto, 429 límite de solicitudes.
Ante CSRF inválido, volver a leer sesión y solicitar repetir la acción al usuario;
no reenviar automáticamente un cambio de contraseña.
