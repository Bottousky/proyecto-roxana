# Deployment — Instituto Roxana

## URLs finales

```
/              → Landing page (index.html)
/jugar/        → Juego Phaser (internamente /src/jugar/)
/assets/*      → Assets compartidos (imágenes, CSS, JS)
```

## Desarrollo

```bash
npm run dev     # http://localhost:5173/
                # Landing: /
                # Juego: /jugar/ (reescrito por middleware)

npm run build   # Genera dist/ listo para deploy
npm run preview # Previsualiza build localmente
```

## Rewrite: `/jugar` → `/src/jugar`

### Desarrollo (Vite)
**Automático:** `vite.config.ts` tiene middleware que reescribe `/jugar/*` a `/src/jugar/*`.

### Producción

#### Netlify (recomendado)
```bash
npm run build
netlify deploy --prod
```

El archivo `_redirects` en la raíz se encarga automáticamente:
```
/jugar/*  /src/jugar/:splat  200
```

**Nota:** Netlify incluye automáticamente `_redirects` en el deploy.

#### Vercel
Crea `vercel.json`:
```json
{
  "rewrites": [
    { "source": "/jugar/(.*)", "destination": "/src/jugar/$1" },
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

#### Otros servidores (Apache, nginx, etc.)

**Apache (.htaccess):**
```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteRule ^jugar/(.*)$ src/jugar/$1 [L]
  RewriteRule ^(?!.*\.(js|css|png|jpg|gif|svg|json|woff|woff2)$) index.html [QSA,L]
</IfModule>
```

**Nginx:**
```nginx
location /jugar/ {
  rewrite ^/jugar/(.*)$ /src/jugar/$1 last;
}

location / {
  try_files $uri /index.html;
}
```

## Build output

```
dist/
  index.html                           ← landing
  src/jugar/index.html                 ← juego
  assets/
    main-*.js                          ← landing code
    main-*.css
    jugar-*.js                         ← game code
    jugar-*.css
    hero-asignacion-*.png
```

**Tamaño:** ~2.5 MB (imagen hero + Phaser). Gzip ~470 KB.

## Environment variables

Ninguna requerida para build estático. Si agregas backend después:
- Crear `.env` en raíz (ignorado por git)
- `src/landing/index.ts` puede importar `import.meta.env.VITE_*`

Ejemplo:
```bash
# .env
VITE_API_URL=https://api.tudominio.com
```

```typescript
const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
```

## Checklist pre-deploy

- [ ] `npm run build` pasa sin errores
- [ ] `npm run preview` muestra landing en `/` y juego en `/jugar/`
- [ ] Links internos funcionan (`/jugar`, `#proyecto`, `#tienda`)
- [ ] Carrito en localStorage funciona (F12 → Application → Local Storage)
- [ ] Imagen hero carga (no 404)
- [ ] Responsivo en mobile

---

**Nota:** Para agregar email (newsletter) y pasarela de pago (Stripe/Gumroad), esos requerirán backend/API. Quedaron anotados para después.
