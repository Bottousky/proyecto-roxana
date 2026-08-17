/**
 * Interaction prompt — the small label that shows "E — Hablar" / "E —
 * Inspeccionar" / "E — Tocar el cable" when the player is near an
 * interactable.
 */

export class Prompt {
  private root: HTMLElement;
  private visible: boolean = false;
  private current: string = '';

  constructor(root: HTMLElement) {
    this.root = root;
    root.innerHTML = '';
  }

  show(verb: string, key: string = 'E'): void {
    const text = `<span class="prompt-key">${key}</span> ${verb}`;
    if (this.current === text && this.visible) return;
    this.root.innerHTML = text;
    this.root.classList.add('visible');
    this.visible = true;
    this.current = text;
  }

  hide(): void {
    if (!this.visible) return;
    this.root.classList.remove('visible');
    this.visible = false;
    this.current = '';
  }

  isVisible(): boolean {
    return this.visible;
  }
}

let _instance: Prompt | null = null;
export const prompt = {
  mount(root: HTMLElement): Prompt {
    if (!_instance) _instance = new Prompt(root);
    return _instance;
  },
  get(): Prompt {
    if (!_instance) throw new Error('Prompt not mounted');
    return _instance;
  },
};
