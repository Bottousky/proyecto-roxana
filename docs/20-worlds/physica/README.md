# Physica

El mundo de física del Instituto Roxana: un micromundo experimental donde las condiciones
cambian de una región a otra. Se juega explorando, anticipando, interviniendo y comprobando.

## Jugar

```sh
cd experiments/physica
npm ci
npm run dev        # http://127.0.0.1:4210
```

**Controles:**
- **Teclado:** ◀ ▶ o A D para caminar, E para usar, R para reiniciar el experimento, J para la Bitácora, Esc para pausar.
- **Mando:** stick o cruceta para caminar; A o X para usar; Y para reiniciar; Select para la Bitácora; Start para pausar.
- **Táctil:** botones en pantalla.

**Parámetros de URL:**
- `?quality=low`: calidad baja.
- `?reduced`: movimiento de cámara reducido.
- `?debug`: datos del campo en pantalla.
- `?nopause`: no pausa al perder el foco; es para automatización.

## Comprobar

```sh
npm test                                  # física y recorridos simulados (node:test)
node scripts/evidence.mjs http://127.0.0.1:4210/ <carpeta>   # recorrido con teclado real y capturas
```

## Documentos

- [Contrato de producción](production/PHYSICA_OPUS55_LOOP.md): manda sobre la dirección.
- [Estado y próximo paso](production/ESTADO.md).
- [Backlog verificable](production/BACKLOG.md).
- [Decisiones](production/DECISIONES.md).
- [Canon, implementado, propuesta y legado](production/CANON.md).
- [Familias de conceptos](production/FAMILIAS.md).
- [Evidencia por iteración](production/evidence/).

El material anterior de Physica (GDD v0.2, GDD v1 y prototipo Babylon) quedó en el historial,
en el commit `311fd0c`. Ver `CANON.md`.
