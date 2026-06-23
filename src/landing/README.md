# Landing Page — Instituto Roxana

## Estructura

- **`index.ts`** — Lógica principal: carrito (localStorage), renderizado de contenido (productos, mundos, ficha técnica)
- **`landing.html`** — Referencia del HTML (no se usa en la build, el actual es `../../index.html` en raíz)
- **`landing.css`** — Estilos globales: animaciones (rx-float, rx-pulse, rx-rise), responsive, transitions

## Build

El entry point real está en **raíz: `index.html`**, que importa:
- `src/landing/landing.css` para estilos
- `src/landing/index.ts` para lógica

La estructura final en `dist/` es:
```
dist/
  index.html                 ← landing (raíz)
  assets/
    main-*.js               ← código landing compilado
    main-*.css
    hero-asignacion-*.png   ← imagen del hero
  src/jugar/
    index.html              ← juego (subruta)
```

## Desarrollo

```bash
npm run dev    # Abre http://localhost:5173/
               # Landing en /
               # Juego en /src/jugar/
```

## Carrito

**Persistencia:** localStorage bajo clave `roxana_cart` (objeto `{ [productId]: qty }`).

**Productos:** Definidos en `index.ts`, array `PRODUCTS[]`. Cambiar aquí para actualizar tienda.

**Estado:** El carrito se carga al iniciar y se sincroniza en cada acción.

## Sin backends (por ahora)

- ✗ Pasarela de pago (reservado para después)
- ✗ Suscripción a newsletter (formulario visual, sin envío)

## Próximos pasos

1. Testear visualmente en múltiples breakpoints
2. Verificar que los links al juego funcionan
3. (Opcional) Configurar rewrite server para `/jugar/` → `/src/jugar/`
