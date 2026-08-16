// DOM UI helpers. The HUD, dialog, and bitacora are all DOM, not canvas.

export interface UiRefs {
  region: HTMLElement;
  state: HTMLElement;
  prompt: HTMLElement;
}

export function mountHud(): UiRefs {
  return {
    region: document.getElementById("hud-region") as HTMLElement,
    state: document.getElementById("hud-state") as HTMLElement,
    prompt: document.getElementById("hud-prompt") as HTMLElement,
  };
}

export interface DialogRefs {
  el: HTMLElement;
  portrait: HTMLElement;
  speaker: HTMLElement;
  line: HTMLElement;
}

export function mountDialog(): DialogRefs {
  const el = document.getElementById("dialog") as HTMLElement;
  return {
    el,
    portrait: document.getElementById("dialog-portrait") as HTMLElement,
    speaker: document.getElementById("dialog-speaker") as HTMLElement,
    line: document.getElementById("dialog-line") as HTMLElement,
  };
}

export function showDialog(refs: DialogRefs, speaker: string, line: string, portraitUrl?: string) {
  refs.el.hidden = false;
  refs.speaker.textContent = speaker;
  refs.line.textContent = line;
  if (portraitUrl) {
    refs.portrait.style.backgroundImage = `url('${portraitUrl}')`;
  } else {
    refs.portrait.style.backgroundImage = "";
  }
}

export function hideDialog(refs: DialogRefs) {
  refs.el.hidden = true;
}

export interface BitacoraRefs {
  el: HTMLElement;
  entries: HTMLElement;
  close: HTMLElement;
}

export function mountBitacora(): BitacoraRefs {
  const el = document.getElementById("bitacora") as HTMLElement;
  const entries = document.getElementById("bitacora-entries") as HTMLElement;
  const close = document.getElementById("bitacora-close") as HTMLElement;
  close.addEventListener("click", () => {
    el.hidden = true;
  });
  return { el, entries, close };
}

export function pushBitacoraEntry(
  refs: BitacoraRefs,
  title: string,
  text: string,
  strike?: string,
) {
  const entry = document.createElement("div");
  entry.className = "bitacora-entry";
  const t = document.createElement("div");
  t.className = "bitacora-entry-title";
  t.textContent = title;
  const tx = document.createElement("div");
  tx.className = "bitacora-entry-text";
  if (strike) {
    const s = document.createElement("span");
    s.className = "bitacora-entry-strike";
    s.textContent = strike + "  ";
    tx.appendChild(s);
    tx.appendChild(document.createTextNode(text));
  } else {
    tx.textContent = text;
  }
  entry.appendChild(t);
  entry.appendChild(tx);
  refs.entries.prepend(entry);
}
