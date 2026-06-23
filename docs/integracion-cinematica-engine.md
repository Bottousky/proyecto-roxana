# Integración técnica — Cinemática INTRO_01–04
# Proyecto Roxana

**Versión:** 1.0  
**Estado:** Especificación de integración para hito H6 (IntroCinematic.ts)  
**Auditor:** Orquestador Claude Code  

---

## 1. Ubicación de assets

```
assets/cinematic/
├── INTRO_01.png          (ya existe como hero-asignacion.png, renombrar o crear)
├── INTRO_02.png          (generar: Roxana años atrás)
├── INTRO_03.png          (generar: Leyenda de la Bitácora)
└── INTRO_04.png          (generar: Escuela actual vacía)
```

**Renombramiento necesario:**
- Hoy existe: `assets/hero-asignacion.png`
- Objetivo: Renombrar a `assets/cinematic/INTRO_01.png` O crear un symlink.
  ```bash
  # Opción 1: Mover
  mv assets/hero-asignacion.png assets/cinematic/INTRO_01.png
  
  # Opción 2: Copiar (preserva original)
  cp assets/hero-asignacion.png assets/cinematic/INTRO_01.png
  
  # Opción 3: Crear symlink (si el sistema lo soporta)
  ln -s ../hero-asignacion.png assets/cinematic/INTRO_01.png
  ```

**Recomendación:** Opción 1 (mover), porque centraliza los assets de cinemática en un directorio.

---

## 2. Especificación técnica de las imágenes

### Dimensiones
- Todas: **1536 × 1024 px** (16:10 aspect ratio).
- NO redimensionar en engine (cargar al tamaño correcto).

### Formato
- PNG (no JPG, no WebP).
- Cada archivo: ~200–500 KB.

### Compresión
- Usar `optipng -o2` antes de commitear si >500 KB:
  ```bash
  optipng -o2 assets/cinematic/INTRO_*.png
  ```

### Transparencia
- Ninguna. Todas son opacas (relleno sólido, no alpha).

---

## 3. Integración en `src/game/IntroCinematic.ts`

Archivo nuevo (crear en H6). Estructura sugerida:

```ts
// src/game/IntroCinematic.ts

import { Phaser } from 'phaser';
import { State } from '../state';

export class IntroCinematicScene extends Phaser.Scene {
  private currentImageIndex = 0;
  private images: string[] = [
    'assets/cinematic/INTRO_01.png',
    'assets/cinematic/INTRO_02.png',
    'assets/cinematic/INTRO_03.png',
    'assets/cinematic/INTRO_04.png',
  ];
  private texts: string[] = [
    // Textos del guion prologo.md §6
    'No fue su primera opción.\n\nTampoco la segunda.\n\nLa Escuela Roxana apareció al final de la lista,\ncuando ya no quedaban muchas puertas abiertas.',
    
    'Años atrás, la Roxana era distinta.\n\nSus pasillos estaban llenos.\nSus talleres hacían ruido.\nSus aulas abrían mundos.\n\nSe decía que ahí no te enseñaban a repetir.\nTe enseñaban a mirar.',
    
    'También había historias.\n\nSobre una directora que llenó la escuela de preguntas.\nSobre aulas que no eran solo aulas.\nSobre una bitácora que nadie pudo encontrar.\n\nCon los años, todo eso quedó como una leyenda vieja.\nAlgo que los ingresantes escuchaban una vez…\ny olvidaban rápido.',
    
    'Pero ahora la escuela estaba casi vacía.\n\nLos chicos ya no la elegían.\nLas familias preguntaban por otras.\nLos pasillos dejaron de sonar.\n\nY ese año, por descarte, le tocó entrar.\n\nPrimer día.',
  ];

  private skipButton?: Phaser.GameObjects.Text;
  private onDone?: () => void;

  constructor() {
    super({ key: 'IntroCinematic' });
  }

  /**
   * Inicia la cinemática.
   * Parámetro: callback que se ejecuta al terminar o saltar.
   */
  static play(onDone: () => void): void {
    // Este método será llamado desde main.ts si !seenIntro
    // Implementado en H6 junto con el flujo de integración.
  }

  preload(): void {
    // Las imágenes ya están en assets/cinematic/
    // No necesitan ser precargadas (puedes hacerlo si quieres)
  }

  create(): void {
    // Crear overlay fullscreen para la cinemática
    // Mostrar imagen + texto + botón Skip
    this.showImage(0);
    
    // Listeners:
    // - Click/Tap: avanzar a siguiente imagen
    // - Esc o botón Skip: saltar cinemática
    this.input.on('pointerdown', () => this.nextImage());
    this.input.keyboard.on('keydown', (event: KeyboardEvent) => {
      if (event.key === 'Escape') this.skip();
    });
  }

  private showImage(index: number): void {
    // Limpiar pantalla
    this.children.removeAll();

    // Cargar imagen
    const img = this.add.image(512, 384, null);
    img.setTexture('cinematic-intro-' + index); // O cargar directamente
    img.setScale(this.scale.width / 1536, this.scale.height / 1024);
    img.setPosition(this.scale.width / 2, this.scale.height / 2);

    // Mostrar texto overlay
    const text = this.add.text(
      50, 100,
      this.texts[index],
      {
        font: '18px "Arial", sans-serif',
        color: '#ffffff',
        wordWrap: { width: this.scale.width - 100 },
        align: 'left',
      }
    );
    text.setAlpha(0.9);

    // Botón Skip (esquina inferior derecha)
    this.skipButton = this.add.text(
      this.scale.width - 120, this.scale.height - 40,
      'Press ESC to skip',
      {
        font: '14px Arial',
        color: '#cccccc',
        backgroundColor: '#000000',
        padding: { x: 10, y: 5 },
      }
    );
    this.skipButton.setInteractive();
    this.skipButton.on('pointerdown', () => this.skip());

    // Indicador de progreso (opcional)
    const progress = this.add.text(
      this.scale.width / 2, this.scale.height - 30,
      `${index + 1} / ${this.images.length}`,
      { font: '12px Arial', color: '#888888' }
    );
    progress.setOrigin(0.5);
  }

  private nextImage(): void {
    this.currentImageIndex++;
    if (this.currentImageIndex >= this.images.length) {
      this.finish();
    } else {
      this.showImage(this.currentImageIndex);
    }
  }

  private skip(): void {
    // Marcar que se saltó la cinemática
    state.flags.cinematicaSkipped = true;
    state.flags.seenIntro = true;
    save();
    
    this.finish();
  }

  private finish(): void {
    // Marcar que se vió la intro
    state.flags.seenIntro = true;
    save();

    // Llamar callback
    if (this.onDone) this.onDone();
  }
}
```

**Notas de implementación:**
- La escena no maneja la transición a `main.ts`; el callback `onDone` lo hace.
- Las imágenes se cargan dinámicamente (no precargadas en Preloader).
- Skip puede ser Esc o botón visible.

---

## 4. Integración en `src/main.ts`

Modificar el flujo de inicio:

```ts
// src/main.ts

import { IntroCinematicScene } from './game/IntroCinematic';

// ... (config de Phaser existente)

function startGame(): void {
  // Iniciar la escena del juego (Hall)
  game.scene.start('ExplorationScene');
}

function main(): void {
  // Determinar si mostrar cinemática
  const savedData = localStorage.getItem('roxana-slice-v1');
  const gameState = savedData ? JSON.parse(savedData) : null;
  const seenIntro = gameState?.flags?.seenIntro ?? false;

  if (!seenIntro) {
    // Mostrar cinemática
    game.scene.add('IntroCinematic', IntroCinematicScene);
    game.scene.start('IntroCinematic');

    // Cuando termine, iniciar juego
    // (el callback de IntroCinematic lo hace)
  } else {
    // Ya vió la intro, pasar directo a juego
    startGame();
  }
}

main();
```

---

## 5. Integración en `src/content/intro-textos.ts`

Archivo nuevo (crear en H6). Centraliza los textos de la cinemática:

```ts
// src/content/intro-textos.ts

export interface IntroText {
  image: number; // 1, 2, 3, 4
  text: string;
}

export const INTRO_TEXTS: IntroText[] = [
  {
    image: 1,
    text: `No fue su primera opción.

Tampoco la segunda.

La Escuela Roxana apareció al final de la lista,
cuando ya no quedaban muchas puertas abiertas.`,
  },
  {
    image: 2,
    text: `Años atrás, la Roxana era distinta.

Sus pasillos estaban llenos.
Sus talleres hacían ruido.
Sus aulas abrían mundos.

Se decía que ahí no te enseñaban a repetir.
Te enseñaban a mirar.`,
  },
  {
    image: 3,
    text: `También había historias.

Sobre una directora que llenó la escuela de preguntas.
Sobre aulas que no eran solo aulas.
Sobre una bitácora que nadie pudo encontrar.

Con los años, todo eso quedó como una leyenda vieja.
Algo que los ingresantes escuchaban una vez…
y olvidaban rápido.`,
  },
  {
    image: 4,
    text: `Pero ahora la escuela estaba casi vacía.

Los chicos ya no la elegían.
Las familias preguntaban por otras.
Los pasillos dejaron de sonar.

Y ese año, por descarte, le tocó entrar.

Primer día.`,
  },
];

export function getIntroText(imageNumber: number): string {
  const entry = INTRO_TEXTS.find((t) => t.image === imageNumber);
  return entry?.text ?? '';
}
```

**Utilidad:**
- Centraliza todos los textos en un lugar.
- Facilita auditoría (grep textual vs guion).
- Soporta futuras traducciones.

---

## 6. Integración en `src/state.ts`

Agregar los flags nuevos de la cinemática (§H1 de spec-prologo-deltas.md):

```ts
// src/state.ts

export interface Flags {
  // ... flags existentes ...
  
  // Nuevos (cinemática):
  seenIntro: boolean;           // true = vió la cinemática completa
  cinematicaSkipped: boolean;   // true = saltó la cinemática
  
  // ... resto de flags del prólogo (bitacoraOpened, etc.) ...
}

export const DEFAULT_FLAGS: Flags = {
  // ... defaults existentes ...
  seenIntro: false,
  cinematicaSkipped: false,
  // ...
};
```

---

## 7. Tests (`tests/p6-intro-cinematica.test.ts`)

Ver spec-prologo-deltas.md §6 (hito H6) para detalles. Test mínimo:

```ts
// tests/p6-intro-cinematica.test.ts

import { INTRO_TEXTS } from '../src/content/intro-textos';

describe('Intro Cinematic (H6)', () => {
  test('All 4 intro texts are present', () => {
    expect(INTRO_TEXTS.length).toBe(4);
  });

  test('INTRO_01 text contains "No fue su primera opción"', () => {
    const text1 = INTRO_TEXTS.find((t) => t.image === 1)?.text ?? '';
    expect(text1).toContain('No fue su primera opción');
  });

  test('INTRO_02 text contains "Roxana era distinta"', () => {
    const text2 = INTRO_TEXTS.find((t) => t.image === 2)?.text ?? '';
    expect(text2).toContain('Roxana era distinta');
  });

  test('INTRO_03 text contains "leyenda vieja"', () => {
    const text3 = INTRO_TEXTS.find((t) => t.image === 3)?.text ?? '';
    expect(text3).toContain('leyenda vieja');
  });

  test('INTRO_04 text contains "Primer día"', () => {
    const text4 = INTRO_TEXTS.find((t) => t.image === 4)?.text ?? '';
    expect(text4).toContain('Primer día');
  });
});
```

---

## 8. Checklist de integración

- [ ] **Assets:**
  - [ ] `assets/cinematic/INTRO_01.png` renombrado/copiado.
  - [ ] `assets/cinematic/INTRO_02.png` generado y en directorio.
  - [ ] `assets/cinematic/INTRO_03.png` generado y en directorio.
  - [ ] `assets/cinematic/INTRO_04.png` generado y en directorio.
  - [ ] Todos los PNG tienen 1536×1024 px, <500 KB.

- [ ] **Código:**
  - [ ] `src/game/IntroCinematic.ts` creado e integrado.
  - [ ] `src/content/intro-textos.ts` creado con 4 textos.
  - [ ] `src/state.ts` actualizado con `seenIntro`, `cinematicaSkipped`.
  - [ ] `src/main.ts` modificado para mostrar cinemática si `!seenIntro`.

- [ ] **Tests:**
  - [ ] `tests/p6-intro-cinematica.test.ts` creado y pasa.
  - [ ] Todos los tests existentes pasan (`npm test`).
  - [ ] Build pasa sin errores (`npm run build`).

- [ ] **Verificación manual (preview):**
  - [ ] "Empezar de nuevo" muestra cinemática.
  - [ ] Las 4 imágenes se muestran en orden.
  - [ ] Los textos aparecen sobre las imágenes.
  - [ ] Click/Tap avanza a siguiente imagen.
  - [ ] Esc salta la cinemática.
  - [ ] Al terminar, va al Hall (ExplorationScene).
  - [ ] "Continuar" (save existente) salta directo al juego.

---

## 9. Notas de diseño

### Transiciones
- Sin transición de fade entre imágenes (solo cambio brusco). Si se prefiere fade:
  ```ts
  // En showImage(), pre-cargar la imagen siguiente
  // y hacer fade out → cambio → fade in.
  ```

### Velocidad de lectura
- Tiempo sugerido por imagen: 10 sec. Esperar input o auto-avanzar después de 10 sec:
  ```ts
  private showImage(index: number): void {
    // ...
    setTimeout(() => {
      if (!userClicked) this.nextImage();
    }, 10000);
  }
  ```
  (Opcional; decidir con Director.)

### Hotkeys avanzadas
- `1`, `2`, `3`, `4`: Saltar a imagen específica (debug/demo).
- `R`: Reiniciar cinemática desde imagen 1.
- Implementar si se pide en playtest.

### Soporte mobile
- Touch/tap funciona igual que click.
- Botón Skip visible en pantalla (no solo Esc).
- Dimensiones: escalar imágenes al ancho/alto de viewport.

---

## 10. Rollback/Debugging

### Si necesitas ver la cinemática aunque `seenIntro === true`:
```ts
// Temporal en localStorage:
localStorage.setItem('roxana-slice-v1', JSON.stringify({
  ...existingData,
  flags: { ...existingData.flags, seenIntro: false }
}));
// Reload → verá cinemática.
```

### Si una imagen no carga:
```
Error: assets/cinematic/INTRO_02.png not found
→ Verificar que el archivo existe en el directorio correcto.
→ Verificar que el path en código es exacto (case-sensitive en Linux).
```

---

## 11. Futura expansión

Si el juego se expande a otros mundos (Matemática, Física, Programación), pueden agregarse cinemáticas de transición:

```
assets/cinematic/
├── INTRO_*.png
├── OHMDAL_ENTER.png
├── MATH_ENTER.png
├── PHYSICS_ENTER.png
└── PROGRAMMING_ENTER.png
```

El patrón de `IntroCinematic.ts` es reutilizable.

---

**Estado:** Especificación lista para implementación en hito H6.  
**Siguiente:** Ejecutor (Sonnet) implementa IntroCinematic.ts, intro-textos.ts, integraciones en main.ts y state.ts.

