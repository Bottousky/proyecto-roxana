# Physica — estado

**Actualizado:** 2026-10-05 · iteración 01 (preparación + primera iteración).

## Dónde se trabaja

- **Worktree:** `.claude/worktrees/physica-opus55-production-465980`.
- **Rama:** `claude/physica-opus55-production-465980`, desde `f7984ca`.
- No se tocan main, Ohmdal (`src/`, `experiments/playcanvas`), Bitland ni Arithmos.
- No hay push ni despliegue.
- **Juego:** `experiments/physica`.
  - Arranque: `npm run dev`, en 127.0.0.1:4210.
  - En el panel del navegador de Claude: `.claude/launch.json` → `physica-dev`. Ese archivo es local y no está versionado.

## Hito actual: A (escena insignia), en curso

**Último cambio aceptado (iteración 01):** la cascada ascendente es jugable de punta a punta. Se aceptó con esta evidencia:
- 29 pruebas;
- un recorrido con teclado real;
- capturas en secuencia, en `evidence/iter-01`;
- una revisión independiente, con sus correcciones en `evidence/iter-01/REVISION.md`.

**Qué hay:**
- **Campo regional** con banda suave y superposición.
- **Integración** Verlet a 120 Hz, determinista.
- **Dos soportes con carrete**, a la misma altura y a ambos lados del borde: el A suelta fuera de la región y el B dentro.
- **Trazas** cada 0,1 s.
- **Esferas sueltas** para llevar y soltar.
- **Arco de agua** integrado del mismo campo, enmarcado por dos caídas familiares.
- **Indicadores del borde:**
  - plomadas, que se invierten;
  - musgo, que sube en la región;
  - polen, que se acumula en el borde;
  - zumbido de anclas.
- **Explorador sin salto**, con dos ayudas declaradas: dirección en el aire y agarre del borde.
- **R en el aire** devuelve al último apoyo firme.
- **Bitácora** con cuatro notas calculadas de las marcas: el borde y las aceleraciones se detectan en ellas. Persiste junto con el último apoyo.
- **Pausa** al perder el foco, sin saltos.
- **Controles:** teclado, mando y táctil.
- **Rendimiento:** 60 FPS medidos en escritorio (M2) después de reemplazar el ruido por fragmento por una textura.

**Qué falla todavía (ver BACKLOG):**
- **A8:** no hay un momento de *anticipar* antes de probar, y el agua dibuja la ruta ganadora.
- **A17:** no hay nada que *modificar*.
- **A9:** no hay transferencia a otra geometría.
- **A10 y A12:** la roca se ve borrosa de cerca y la composición del cuadro de la cascada está apretada.
- **A12:** las animaciones del avatar no se revisaron en movimiento.
- **A16:** no hay menú de opciones.
- **No verificado:**
  - el sonido: nadie lo escuchó;
  - el táctil y el mando en dispositivo real;
  - el rendimiento móvil;
  - la claridad y la diversión con personas.

## Próximo resultado

**A8 + A17: anticipar y modificar, sin que el agua revele la ruta.**
- **Rediseño del cruce:** el agua sigue enseñando la regla (sube en la región), pero su arco no coincide con la ruta del explorador.
  - Por ejemplo, el arroyo sale más lento y su arco se queda en la región: forma la cresta y se derrama.
  - Con eso, cruzar exige una elección que puede fallar sin castigo: desde dónde y con qué rapidez entrar.
- **Anticipar:** antes de soltar, el jugador coloca una canasta receptora donde predice que va a girar la esfera. La traza muestra si acertó.
- **Modificar:** la caída familiar mueve una rueda que alimenta las anclas; desviar el agua baja la potencia del campo.
- **Criterio de aceptación:**
  - recorrido con teclado donde una predicción mal colocada falla y la traza muestra por qué;
  - un cruce que falla con una elección y funciona con otra;
  - la potencia cambia el arco de forma medible, con una prueba.

## Retomar

```sh
cd .claude/worktrees/physica-opus55-production-465980/experiments/physica
npm ci            # si falta node_modules
npm test
npm run dev       # o preview_start "physica-dev"
node scripts/evidence.mjs http://127.0.0.1:4210/ <carpeta-de-salida>
```

**Loop:**
- Programado en esta sesión con `/loop 5m` (cron `*/5 * * * *`, job `0bc8e745`). Se cancela con CronDelete.
- Vive sólo mientras la sesión esté abierta.
