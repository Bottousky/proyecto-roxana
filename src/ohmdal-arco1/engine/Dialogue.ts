/**
 * Dialogue runner.
 *
 * Plays a script line by line. Shows the dialogue box in the DOM. Calls
 * back to the engine for hooks. The dialogue does not pause the world
 * by default — only movement. The world keeps running (NPCs move,
 * water flows, lamps flicker) unless the engine decides otherwise.
 *
 * The box supports:
 *   - Auto-advance on click (or E / Space)
 *   - Up to 4 choices per line
 *   - Speaker portrait (looked up by name)
 *   - Hooks fired on line entry
 *   - Flags set on line completion
 */

import type { DialogueScript, DialogueLine } from '../data/narrative.ts';

export interface DialogueRunnerOptions {
  /** Container for the dialogue box. Created on demand. */
  container: HTMLElement;
  /** Hook handler. */
  onHook: (name: string) => void;
  /** Flag setter. */
  setFlag: (flag: string, value: boolean) => void;
  /** Portrait resolver. */
  resolvePortrait: (name: string) => string | null;
  /** Sound when advancing. */
  onAdvance?: () => void;
  /** Called when the script ends. */
  onEnd: () => void;
}

export class DialogueRunner {
  private script: DialogueScript | null = null;
  private lineIndex: number = 0;
  private box: HTMLElement | null = null;
  private options: DialogueRunnerOptions;
  private isActive: boolean = false;
  private hasEnded: boolean = false;
  private advanceHandler: ((e: KeyboardEvent) => void) | null = null;
  private clickHandler: ((e: MouseEvent) => void) | null = null;

  constructor(options: DialogueRunnerOptions) {
    this.options = options;
  }

  /**
   * Play a script. If one is already running, this replaces it.
   */
  play(script: DialogueScript): void {
    this.end();
    this.script = script;
    this.lineIndex = 0;
    this.hasEnded = false;
    this.isActive = true;
    this.mountBox();
    this.showLine();
  }

  /**
   * End the dialogue.
   */
  end(): void {
    if (!this.isActive) return;
    this.isActive = false;
    this.unmountBox();
    if (this.script && !this.hasEnded) {
      this.hasEnded = true;
      this.options.onEnd();
    }
    this.script = null;
  }

  isPlaying(): boolean {
    return this.isActive;
  }

  private mountBox(): void {
    if (this.box) return;
    this.box = document.createElement('div');
    this.box.className = 'dialogue';
    this.box.innerHTML = `
      <img class="portrait" alt="" />
      <div class="content">
        <div class="speaker"></div>
        <div class="text"></div>
        <div class="choices"></div>
        <div class="continue">Continuar</div>
      </div>
    `;
    this.options.container.appendChild(this.box);

    // Click to advance
    this.clickHandler = (e) => {
      if (!this.isActive) return;
      const target = e.target as HTMLElement;
      // Don't advance on a choice click (it has its own handler)
      if (target.closest('.choice')) return;
      this.advance();
    };
    this.box.addEventListener('click', this.clickHandler);

    // Keyboard: Space, Enter, E to advance; numbers for choices
    this.advanceHandler = (e: KeyboardEvent) => {
      if (!this.isActive) return;
      if (e.code === 'Space' || e.code === 'Enter' || e.code === 'KeyE') {
        e.preventDefault();
        this.advance();
      } else if (e.code === 'Escape') {
        e.preventDefault();
        this.end();
      } else if (e.code.startsWith('Digit')) {
        const n = parseInt(e.code.replace('Digit', ''), 10) - 1;
        const choices = this.box?.querySelectorAll<HTMLButtonElement>('.choice');
        if (choices && n >= 0 && n < choices.length) {
          e.preventDefault();
          choices[n].click();
        }
      }
    };
    window.addEventListener('keydown', this.advanceHandler);
  }

  private unmountBox(): void {
    if (this.box) {
      this.box.remove();
      this.box = null;
    }
    if (this.advanceHandler) {
      window.removeEventListener('keydown', this.advanceHandler);
      this.advanceHandler = null;
    }
    if (this.clickHandler) {
      this.clickHandler = null;
    }
  }

  private showLine(): void {
    if (!this.script || !this.box) return;
    const line = this.script.lines[this.lineIndex];
    if (!line) {
      this.end();
      return;
    }
    // Fire hook on entry
    if (line.hook) this.options.onHook(line.hook);

    // Speaker
    const speakerEl = this.box.querySelector('.speaker') as HTMLElement;
    const portraitEl = this.box.querySelector('.portrait') as HTMLImageElement;
    const textEl = this.box.querySelector('.text') as HTMLElement;
    const choicesEl = this.box.querySelector('.choices') as HTMLElement;
    const continueEl = this.box.querySelector('.continue') as HTMLElement;

    if (line.speaker === 'narrator') {
      speakerEl.textContent = '';
      portraitEl.style.visibility = 'hidden';
    } else {
      speakerEl.textContent = line.speaker;
      const portrait = this.options.resolvePortrait(line.portrait ?? line.speaker);
      if (portrait) {
        portraitEl.src = portrait;
        portraitEl.style.visibility = 'visible';
      } else {
        portraitEl.style.visibility = 'hidden';
      }
    }
    textEl.textContent = line.text;
    textEl.className = 'text ' + (line.text.length > 200 ? 'long' : '');
    choicesEl.innerHTML = '';
    continueEl.style.display = line.choices ? 'none' : '';

    if (line.choices && line.choices.length > 0) {
      line.choices.forEach((c) => {
        const btn = document.createElement('button');
        btn.className = 'choice';
        btn.textContent = c.text;
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.applyChoice(c);
        });
        choicesEl.appendChild(btn);
      });
    }
  }

  private advance(): void {
    if (!this.script || !this.box) return;
    const line = this.script.lines[this.lineIndex];
    if (!line) return;
    if (line.choices && line.choices.length > 0) return; // wait for choice
    if (line.setFlag) this.options.setFlag(line.setFlag, true);
    if (line.end) {
      this.end();
      return;
    }
    this.options.onAdvance?.();
    this.lineIndex++;
    if (this.lineIndex >= this.script.lines.length) {
      this.end();
    } else {
      this.showLine();
    }
  }

  private applyChoice(choice: NonNullable<DialogueLine['choices']>[number]): void {
    if (!this.script) return;
    if (choice.setFlag) this.options.setFlag(choice.setFlag, true);
    if (choice.hook) this.options.onHook(choice.hook);
    if (choice.end) {
      this.end();
      return;
    }
    this.options.onAdvance?.();
    if (choice.next != null) {
      this.lineIndex = choice.next;
    } else {
      this.lineIndex++;
    }
    if (this.lineIndex >= this.script.lines.length) {
      this.end();
    } else {
      this.showLine();
    }
  }
}
