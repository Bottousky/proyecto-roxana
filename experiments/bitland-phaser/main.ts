import {
  Machine,
  initial,
  inherited,
  operationNames,
  setInput,
  validate,
} from "../../src/experiments/bitland/simulation.ts";
import type { Mode, Op } from "../../src/experiments/bitland/simulation.ts";
import { startScene } from "./metropolis";
import "./style.css";
const root = document.querySelector<HTMLElement>("#app")!;
root.innerHTML = `<header><div class="brand">BITLAND<small>THE WORLD IS EXECUTABLE</small></div><span class="district">01　 BOOT YARD</span><button id="settingsToggle">Ajustes</button></header><section class="title"><small>UNA CIUDAD QUE TODAVÍA EJECUTA</small><h1>La ciudad<br><i>no se detiene.</i></h1><p id="objective">Un paquete. Un courier. Una luz al otro lado de la placa.</p></section><section id="world" aria-label="Placa ciudad con muelle, sensor, dos rutas, puerto GPIO y LED exterior"></section><div class="actions"><button id="inspect">◎ Abrir courier</button><button id="overview">↗ Ver el microcontrolador</button></div><aside id="panel" hidden aria-label="Programa del courier"><div class="panel-head"><div><small>PROCESO / 01</small><h2>Courier del muelle</h2></div><button id="closePanel" aria-label="Cerrar programa">×</button></div><p>Las tarjetas describen el recorrido. Cambia una y observa la consecuencia.</p><div id="cards"></div><div class="editing-tools"><button id="undo">↶ Deshacer</button><button id="add">+ Espera</button></div><label>Al terminar<select id="mode"><option value="once">Terminar</option><option value="three">Repetir tres veces</option><option value="pending">Mientras queden paquetes</option><option value="forever">Siempre · rutina heredada</option></select></label><p id="editNote">Seis instrucciones instaladas.</p><button id="retry">↺ Probar desde el muelle</button><details><summary>Ver qué ejecutó</summary><ol id="trace"></ol></details><details><summary>Comparar intento anterior</summary><p id="previousTrace">Todavía no hay otro intento.</p></details></aside><section id="settings" hidden aria-label="Ajustes de presentación"><label>Tratamiento visual<select id="treatment"><option value="metro">Metrópolis · dirección autoral</option><option value="warm">Paleta cálida · descartada</option><option value="clean">Cuento técnico limpio</option><option value="cinema">Máquina-ciudad cinematográfica</option></select></label><label><input type="checkbox" id="reduced"> Movimiento reducido / efectos simples</label><label><input type="checkbox" id="contrast"> Alto contraste</label><label>Tamaño de texto<select id="textSize"><option value="16">Normal</option><option value="19.2">Grande</option><option value="22.4">Muy grande</option></select></label><button id="audio">Sonido: apagado</button><p>Tab y Enter para editar. Escape para cerrar. El sonido tiene equivalentes visuales.</p></section><section class="inputs" aria-label="Entradas del mundo"><button id="gate" aria-pressed="false">Paso corto: abierto</button><label>Paquetes<select id="count"><option>1</option><option>0</option><option>3</option><option>5</option></select></label><label><input id="auto" type="checkbox"> Llegadas periódicas</label></section><div id="null" hidden role="status"><span>∅</span><div><small>NULL</small><p id="nullLine"></p></div></div><footer><div class="clock">◴ <span><small>CLOCK</small><b id="tick">000</b></span></div><div class="transport"><button id="rewind" aria-label="Retroceder un pulso">↶</button><button id="play">▶ Ejecutar</button><button id="step">Un paso →</button><select id="speed" aria-label="Velocidad"><option value="1400">0.5×</option><option value="700" selected>1×</option><option value="350">2×</option></select></div><div id="state" role="status"></div></footer>`;
function el<T extends HTMLElement = HTMLElement>(id: string) {
  return document.getElementById(id) as T;
}
let simulation = new Machine(),
  program: Op[] = [...inherited],
  mode: Mode = "once",
  changed = false;
let running = false,
  timeout: ReturnType<typeof setTimeout>,
  open = false,
  audioEnabled = false,
  context: AudioContext;
const revisions: { program: Op[]; mode: Mode }[] = [];
const footerSize = new ResizeObserver(([entry]) =>
  document.documentElement.style.setProperty(
    "--bar-height",
    `${entry.target.getBoundingClientRect().height}px`,
  ),
);
footerSize.observe(document.querySelector("footer")!);
const visual = startScene(
  el("world"),
  () => simulation.state,
  () => togglePanel(true),
);
function togglePanel(value: boolean) {
  open = value;
  el("panel").hidden = !value;
  document.body.classList.toggle("editing", value);
  visual.focus(value);
  el(value ? "closePanel" : "inspect").focus();
}
function pause() {
  running = false;
  clearTimeout(timeout);
  el("play").textContent = "▶ Ejecutar";
}
function cue() {
  if (!audioEnabled) return;
  context ??= new AudioContext();
  void context.resume();
  const oscillator = context.createOscillator(),
    volume = context.createGain();
  oscillator.connect(volume);
  volume.connect(context.destination);
  oscillator.frequency.value = simulation.state.fault
    ? 140
    : simulation.state.led
      ? 660
      : simulation.state.trace.at(-1)?.result === "branch"
        ? 390
        : 240;
  volume.gain.setValueAtTime(0.028, context.currentTime);
  volume.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.12);
  oscillator.start();
  oscillator.stop(context.currentTime + 0.13);
}
function refresh() {
  const s = simulation.state;
  const location = {
    home: "Muelle",
    fork: "Cruce",
    direct: "Paso corto",
    bypass: "Rodeo",
    gpio: "Puerto GPIO",
  };
  el("tick").textContent = String(s.tick).padStart(3, "0");
  el("state").textContent =
    `${location[s.position]} · ${s.carrying === null ? "sin carga" : `paquete ${s.carrying}`} · ${s.queue.length} en muelle · LED ${s.led ? "encendido" : "apagado"} · ${s.delivered.length} entregas`;
  el("trace").replaceChildren(
    ...s.trace
      .slice(-8)
      .reverse()
      .map((t) => {
        const li = document.createElement("li");
        li.textContent = `${t.tick} · ${t.detail}`;
        if (t.result === "error") li.className = "error";
        return li;
      }),
  );
  el("cards")
    .querySelectorAll(".card")
    .forEach((row, i) => row.classList.toggle("active", i === s.lastPc));
  el("null").hidden = !s.nullSeen;
  el("nullLine").textContent = s.fault
    ? s.fault
    : s.delivered.length > 1
      ? "Sigue entregando. Incluso cuando miras para otro lado."
      : s.led
        ? "La luz recibió el paquete. La intención sola no había llegado."
        : s.trace.at(-1)?.result === "branch"
          ? s.trace.at(-1)!.detail
          : "Ejecutó una instrucción. No tuvo que adivinar ninguna.";
  if (s.fault) {
    pause();
    el("objective").textContent = s.fault;
  } else if (s.delivered.length)
    el("objective").textContent =
      "Tu programa cruzó el borde de la ciudad. La luz respondió.";
  el<HTMLButtonElement>("rewind").disabled = !simulation.history.length;
}
function remember() {
  pause();
  revisions.push({ program: [...program], mode });
  if (revisions.length > 20) revisions.shift();
  changed = true;
  el("editNote").textContent =
    "Cambio preparado. El siguiente intento empieza desde el muelle y conserva la traza anterior.";
}
function drawProgram() {
  el("cards").replaceChildren();
  program.forEach((op, index) => {
    const card = document.createElement("div");
    card.className = "card";
    const number = document.createElement("span");
    number.textContent = String(index + 1).padStart(2, "0");
    const select = document.createElement("select");
    select.setAttribute("aria-label", `Instrucción ${index + 1}`);
    const description = document.createElement("small");
    description.className = "meaning";
    description.textContent =
      op === "sense" ? "Paso abierto → corto. Paso cerrado → rodeo." : "";
    for (const [value, name] of Object.entries(operationNames)) {
      const option = new Option(name, value, value === op, value === op);
      select.add(option);
    }
    select.onchange = () => {
      remember();
      program[index] = select.value as Op;
      description.textContent =
        select.value === "sense"
          ? "Paso abierto → corto. Paso cerrado → rodeo."
          : "";
    };
    const up = document.createElement("button");
    up.textContent = "↑";
    up.setAttribute("aria-label", `Subir instrucción ${index + 1}`);
    up.disabled = index === 0;
    up.onclick = () => {
      remember();
      const displaced = program[index - 1];
      program[index - 1] = program[index];
      program[index] = displaced;
      drawProgram();
    };
    const remove = document.createElement("button");
    remove.textContent = "−";
    remove.setAttribute("aria-label", `Quitar instrucción ${index + 1}`);
    remove.onclick = () => {
      remember();
      program.splice(index, 1);
      drawProgram();
    };
    card.append(number, select, up, remove, description);
    el("cards").append(card);
  });
}
function restart() {
  pause();
  el("previousTrace").textContent =
    simulation.state.trace.map((t) => `${t.tick}: ${t.detail}`).join(" / ") ||
    "El intento anterior no ejecutó instrucciones.";
  const s = initial(
    program,
    simulation.state.gateOpen,
    Number(el<HTMLSelectElement>("count").value),
    mode,
  );
  s.autoInput = el<HTMLInputElement>("auto").checked;
  simulation = new Machine(s);
  changed = false;
  el("editNote").textContent = "Programa instalado.";
  el("objective").textContent =
    "Sigue el paquete desde el muelle hasta el LED exterior.";
  refresh();
}
function advance() {
  if (changed) restart();
  simulation.step();
  refresh();
  cue();
}
function schedule() {
  if (!running) return;
  advance();
  if (simulation.state.fault) {
    pause();
    return;
  }
  timeout = setTimeout(schedule, Number(el<HTMLSelectElement>("speed").value));
}
el("play").onclick = () => {
  if (running) {
    pause();
    return;
  }
  if (changed) restart();
  running = true;
  el("play").textContent = "Ⅱ Pausar";
  schedule();
};
el("step").onclick = () => {
  pause();
  advance();
};
el("rewind").onclick = () => {
  pause();
  simulation.rewind();
  refresh();
};
el("retry").onclick = restart;
el("inspect").onclick = () => togglePanel(!open);
el("closePanel").onclick = () => togglePanel(false);
el("overview").onclick = () => {
  togglePanel(false);
  el("overview").textContent = visual.overview()
    ? "↗ Ver recorrido"
    : "↗ Ver el microcontrolador";
};
el("mode").onchange = () => {
  remember();
  mode = el<HTMLSelectElement>("mode").value as Mode;
};
el("add").onclick = () => {
  if (program.length < 18) {
    remember();
    program.push("wait");
    drawProgram();
  }
};
el("undo").onclick = () => {
  const previous = revisions.pop();
  if (previous) {
    pause();
    program = previous.program;
    mode = previous.mode;
    el<HTMLSelectElement>("mode").value = mode;
    changed = true;
    drawProgram();
    el("editNote").textContent =
      "Edición deshecha. Prueba otra vez para ejecutarla.";
  }
};
el("gate").onclick = () => {
  pause();
  simulation.apply(setInput(simulation.state, !simulation.state.gateOpen));
  el("gate").textContent =
    `Paso corto: ${simulation.state.gateOpen ? "abierto" : "cerrado"}`;
  el("gate").setAttribute("aria-pressed", String(!simulation.state.gateOpen));
  refresh();
};
for (const id of ["count", "auto"])
  el(id).onchange = () => {
    pause();
    changed = true;
    el("editNote").textContent =
      "Entrada preparada para el próximo intento. Llegadas periódicas: cada 14 pulsos.";
  };
el("settingsToggle").onclick = () => {
  el("settings").hidden = !el("settings").hidden;
  el("settingsToggle").setAttribute(
    "aria-expanded",
    String(!el("settings").hidden),
  );
};
el("treatment").onchange = () =>
  visual.theme(
    el<HTMLSelectElement>("treatment").value as "warm" | "clean" | "cinema",
  );
el<HTMLInputElement>("reduced").checked = matchMedia(
  "(prefers-reduced-motion: reduce)",
).matches;
visual.reduced(el<HTMLInputElement>("reduced").checked);
el("reduced").onchange = () =>
  visual.reduced(el<HTMLInputElement>("reduced").checked);
el("contrast").onchange = () =>
  document.body.classList.toggle(
    "contrast",
    el<HTMLInputElement>("contrast").checked,
  );
el("textSize").onchange = () =>
  (document.documentElement.style.fontSize =
    el<HTMLSelectElement>("textSize").value + "px");
el("audio").onclick = () => {
  audioEnabled = !audioEnabled;
  el("audio").textContent = `Sonido: ${audioEnabled ? "encendido" : "apagado"}`;
  cue();
};
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    pause();
    togglePanel(false);
    el("settings").hidden = true;
  }
});
document.addEventListener("visibilitychange", () => {
  if (document.hidden) pause();
});
Object.defineProperty(window, "bitlandEvidence", {
  value: {
    snapshot: () => structuredClone(simulation.state),
    metrics: () => visual.metrics(),
    validation: () => validate(simulation.state, 1),
  },
});
drawProgram();
refresh();
