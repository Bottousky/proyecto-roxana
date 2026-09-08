import {
  Machine,
  initial,
  inherited,
  operationNames,
  setInput,
  validate,
} from "../../src/experiments/bitland/simulation.ts";
import type { Op, Mode } from "../../src/experiments/bitland/simulation.ts";
import { createWorld } from "./metropolis";
import type { Treatment } from "./metropolis";
import "./style.css";

// Keep the entry module synchronous: renderer chunks may import shared entry exports.
// Awaiting app.init at module level can deadlock that production chunk graph.
async function boot() {
  const $ = <T extends HTMLElement = HTMLElement>(id: string) =>
    document.getElementById(id) as T;
  const app = $("app");
  app.innerHTML = `<header><a class="brand" href="#">BITLAND<span>THE WORLD IS EXECUTABLE</span></a><div class="location">01 <span>BOOT YARD</span></div><button id="settingsToggle" aria-expanded="false">Ajustes</button></header>
<section class="intro"><p class="eyebrow">UNA CIUDAD QUE TODAVÍA EJECUTA</p><h1>La ciudad<br><em>no se detiene.</em></h1><p id="objective">Un paquete. Un courier. Una luz al otro lado de la placa.</p></section>
<section id="world" aria-label="Placa ciudad: el muelle se conecta al cruce, dos rutas al puerto GPIO y un LED exterior"></section>
<div class="world-tools"><button id="inspect">◎ Abrir courier</button><button id="overview">↗ Ver el microcontrolador</button></div>
<aside id="panel" aria-label="Programa del courier" hidden><div class="panel-title"><div><small>PROCESO / 01</small><h2>Courier del muelle</h2></div><button id="closePanel" aria-label="Cerrar programa">×</button></div><p class="panel-help">Las tarjetas son su recorrido. Cambia una y mira qué ejecuta.</p><div id="cards"></div><div class="edit-tools"><button id="undo">↶ Deshacer</button><button id="add">+ Espera</button></div><label class="field">Al terminar<select id="mode"><option value="once">Terminar</option><option value="three">Repetir tres veces</option><option value="pending">Mientras queden paquetes</option><option value="forever">Siempre · rutina heredada</option></select></label><p id="editNote" class="small">El programa tiene seis instrucciones.</p><button id="retry" class="wide">↺ Probar desde el muelle</button><details id="traceDetails"><summary>Ver qué ejecutó</summary><ol id="trace"></ol></details><details><summary>Comparar intento anterior</summary><p id="previousTrace" class="small">Todavía no hay otro intento.</p></details></aside>
<section id="settings" hidden aria-label="Ajustes de presentación"><label>Tratamiento visual<select id="treatment"><option value="metro">Metrópolis · dirección autoral</option><option value="warm">Paleta cálida · descartada</option><option value="clean">Cuento técnico limpio</option><option value="cinema">Máquina-ciudad cinematográfica</option></select></label><label><input id="reduced" type="checkbox"> Movimiento reducido / efectos simples</label><label><input id="contrast" type="checkbox"> Alto contraste</label><label>Tamaño de texto<select id="textSize"><option value="1">Normal</option><option value="1.2">Grande</option><option value="1.4">Muy grande</option></select></label><button id="audio">Sonido: apagado</button><p class="small">Tab y Enter para todas las acciones. Sin arrastres obligatorios. El estado también se ve en texto.</p></section>
<section class="sensor-bar" aria-label="Entradas del mundo"><button id="gate" aria-pressed="false">Paso corto: abierto</button><label>Paquetes<select id="count"><option>1</option><option>0</option><option>3</option><option>5</option></select></label><label><input id="auto" type="checkbox"> Llegadas periódicas</label></section>
<div id="null" role="status" hidden><span class="null-mark">∅</span><div><small>NULL</small><p id="nullLine"></p></div></div>
<footer><div class="clock"><span class="clock-symbol">◴</span><div><small>CLOCK</small><strong id="tick">000</strong></div></div><div class="transport"><button id="rewind" aria-label="Retroceder un pulso">↶</button><button id="play" class="primary">▶ Ejecutar</button><button id="step">Un paso →</button><label class="speed-label"><span class="sr-only">Velocidad</span><select id="speed"><option value="1400">0.5×</option><option value="700" selected>1×</option><option value="350">2×</option></select></label></div><div id="state" role="status">Muelle · sin carga · LED apagado</div></footer>`;
  let machine = new Machine(),
    draft: Op[] = [...inherited],
    mode: Mode = "once",
    undo: { program: Op[]; mode: Mode }[] = [];
  let running = false,
    timer: ReturnType<typeof setTimeout> | undefined,
    sound: AudioContext | undefined,
    soundOn = false;
  let panelOpen = false,
    dirty = false;
  new ResizeObserver((entries) =>
    document.documentElement.style.setProperty(
      "--bar-height",
      `${entries[0].target.getBoundingClientRect().height}px`,
    ),
  ).observe(document.querySelector("footer")!);
  const world = await createWorld($("world"), () => openPanel(true));
  world.update(machine.state);
  function openPanel(open: boolean) {
    panelOpen = open;
    $("panel").hidden = !open;
    document.body.classList.toggle("editing", open);
    world.focus(open);
    if (open) $("closePanel").focus();
    else $("inspect").focus();
  }
  function stop() {
    running = false;
    clearTimeout(timer);
    $("play").textContent = "▶ Ejecutar";
  }
  function tone() {
    if (!soundOn) return;
    sound ??= new AudioContext();
    void sound.resume();
    const osc = sound.createOscillator(),
      gain = sound.createGain();
    osc.connect(gain);
    gain.connect(sound.destination);
    const s = machine.state;
    osc.frequency.value = s.fault
      ? 140
      : s.led
        ? 660
        : s.trace.at(-1)?.result === "branch"
          ? 390
          : 240;
    gain.gain.setValueAtTime(0.028, sound.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, sound.currentTime + 0.12);
    osc.start();
    osc.stop(sound.currentTime + 0.13);
  }
  function sync() {
    const s = machine.state;
    world.update(s);
    $("tick").textContent = String(s.tick).padStart(3, "0");
    const locations = {
      home: "Muelle",
      fork: "Cruce",
      direct: "Paso corto",
      bypass: "Rodeo",
      gpio: "Puerto GPIO",
    };
    $("state").textContent =
      `${locations[s.position]} · ${s.carrying === null ? "sin carga" : `paquete ${s.carrying}`} · ${s.queue.length} en muelle · LED ${s.led ? "encendido" : "apagado"} · ${s.delivered.length} entregas`;
    document.querySelectorAll(".card").forEach((el, i) => {
      el.classList.toggle("active", i === s.lastPc);
    });
    $("trace").replaceChildren(
      ...s.trace
        .slice(-8)
        .reverse()
        .map((row) => {
          const li = document.createElement("li");
          li.textContent = `${row.tick} · ${row.detail}`;
          li.className = row.result;
          return li;
        }),
    );
    $("null").hidden = !s.nullSeen;
    $("nullLine").textContent = s.fault
      ? `«${s.fault}»`
      : s.delivered.length > 1
        ? "Sigue entregando. Incluso cuando miras para otro lado."
        : s.led
          ? "La luz recibió el paquete. La intención sola no había llegado."
          : s.trace.at(-1)?.instruction === "loop"
            ? s.trace.at(-1)!.detail
            : s.trace.at(-1)?.result === "branch"
              ? s.trace.at(-1)!.detail
              : "Ejecutó una instrucción. No tuvo que adivinar ninguna.";
    if (s.fault) {
      stop();
      $("objective").textContent = s.fault;
    } else if (s.delivered.length)
      $("objective").textContent =
        "Tu programa cruzó el borde de la ciudad. La luz respondió.";
    $("rewind").setAttribute("aria-disabled", String(!machine.history.length));
  }
  function saveDraft() {
    undo.push({ program: [...draft], mode });
    if (undo.length > 20) undo.shift();
    stop();
    dirty = true;
    $("editNote").textContent =
      "Programa cambiado. «Probar desde el muelle» inicia el nuevo intento; la traza anterior se conserva.";
  }
  function cards() {
    const host = $("cards");
    host.replaceChildren();
    draft.forEach((op, i) => {
      const row = document.createElement("div");
      row.className = "card";
      const index = document.createElement("span");
      index.textContent = String(i + 1).padStart(2, "0");
      const sel = document.createElement("select");
      sel.setAttribute("aria-label", `Instrucción ${i + 1}`);
      Object.entries(operationNames).forEach(([value, label]) => {
        const opt = document.createElement("option");
        opt.value = value;
        opt.textContent = label;
        sel.append(opt);
      });
      sel.value = op;
      const meaning = document.createElement("small");
      meaning.className = "meaning";
      meaning.textContent =
        op === "sense" ? "Paso abierto → corto. Paso cerrado → rodeo." : "";
      sel.onchange = () => {
        saveDraft();
        draft[i] = sel.value as Op;
        meaning.textContent =
          sel.value === "sense"
            ? "Paso abierto → corto. Paso cerrado → rodeo."
            : "";
      };
      const up = document.createElement("button");
      up.textContent = "↑";
      up.setAttribute("aria-label", `Subir instrucción ${i + 1}`);
      up.disabled = i === 0;
      up.onclick = () => {
        saveDraft();
        [draft[i - 1], draft[i]] = [draft[i], draft[i - 1]];
        cards();
      };
      const del = document.createElement("button");
      del.textContent = "−";
      del.setAttribute("aria-label", `Quitar instrucción ${i + 1}`);
      del.onclick = () => {
        saveDraft();
        draft.splice(i, 1);
        cards();
      };
      row.append(index, sel, up, del, meaning);
      host.append(row);
    });
  }
  cards();
  function retry() {
    stop();
    $("previousTrace").textContent =
      machine.state.trace.map((r) => `${r.tick}: ${r.detail}`).join(" / ") ||
      "El intento anterior no llegó a ejecutar.";
    const s = initial(
      draft,
      machine.state.gateOpen,
      Number(($("count") as HTMLSelectElement).value),
      mode,
    );
    s.autoInput = ($("auto") as HTMLInputElement).checked;
    machine = new Machine(s);
    dirty = false;
    $("editNote").textContent = "Programa instalado en el courier.";
    $("objective").textContent =
      "Sigue el paquete desde el muelle hasta el LED exterior.";
    sync();
  }
  function step() {
    if (dirty) retry();
    machine.step();
    sync();
    tone();
  }
  function loop() {
    if (!running) return;
    step();
    if (machine.state.fault) {
      stop();
      return;
    }
    timer = setTimeout(loop, Number(($("speed") as HTMLSelectElement).value));
  }
  $("play").onclick = () => {
    if (running) {
      stop();
      return;
    }
    if (dirty) retry();
    running = true;
    $("play").textContent = "Ⅱ Pausar";
    loop();
  };
  $("step").onclick = () => {
    stop();
    step();
  };
  $("rewind").onclick = () => {
    stop();
    machine.rewind();
    sync();
  };
  $("retry").onclick = retry;
  $("inspect").onclick = () => openPanel(!panelOpen);
  $("closePanel").onclick = () => openPanel(false);
  $("overview").onclick = () => {
    openPanel(false);
    $("overview").textContent = world.overview()
      ? "↗ Ver recorrido"
      : "↗ Ver el microcontrolador";
  };
  $("mode").onchange = () => {
    saveDraft();
    mode = ($("mode") as HTMLSelectElement).value as Mode;
  };
  $("undo").onclick = () => {
    const old = undo.pop();
    if (old) {
      stop();
      draft = old.program;
      mode = old.mode;
      ($("mode") as HTMLSelectElement).value = mode;
      dirty = true;
      cards();
      $("editNote").textContent =
        "Edición deshecha. Vuelve a probar para ejecutarla.";
    }
  };
  $("add").onclick = () => {
    if (draft.length >= 18) return;
    saveDraft();
    draft.push("wait");
    cards();
  };
  $("gate").onclick = () => {
    stop();
    machine.apply(setInput(machine.state, !machine.state.gateOpen));
    $("gate").textContent =
      `Paso corto: ${machine.state.gateOpen ? "abierto" : "cerrado"}`;
    $("gate").setAttribute("aria-pressed", String(!machine.state.gateOpen));
    sync();
  };
  $("count").onchange = () => {
    stop();
    dirty = true;
    $("editNote").textContent =
      "Nuevo lote seleccionado. Se aplica al iniciar otro intento.";
  };
  $("auto").onchange = () => {
    stop();
    dirty = true;
    $("editNote").textContent =
      "Llegadas periódicas: un paquete cada 14 pulsos. Se aplica al probar.";
  };
  $("settingsToggle").onclick = () => {
    const open = $("settings").hidden;
    $("settings").hidden = !open;
    $("settingsToggle").setAttribute("aria-expanded", String(open));
  };
  $("treatment").onchange = () =>
    world.treatment(($("treatment") as HTMLSelectElement).value as Treatment);
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  ($("reduced") as HTMLInputElement).checked = reduced;
  world.reduced(reduced);
  $("reduced").onchange = () =>
    world.reduced(($("reduced") as HTMLInputElement).checked);
  $("contrast").onchange = () =>
    document.body.classList.toggle(
      "contrast",
      ($("contrast") as HTMLInputElement).checked,
    );
  $("textSize").onchange = () => {
    document.documentElement.style.fontSize = `${16 * Number(($("textSize") as HTMLSelectElement).value)}px`;
  };
  $("audio").onclick = () => {
    soundOn = !soundOn;
    $("audio").textContent = `Sonido: ${soundOn ? "encendido" : "apagado"}`;
    tone();
  };
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      openPanel(false);
      $("settings").hidden = true;
      stop();
    }
  });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stop();
  });
  // Read-only evidence surface. Gameplay tests use DOM controls, never this object to solve.
  Object.defineProperty(window, "bitlandEvidence", {
    value: {
      snapshot: () => structuredClone(machine.state),
      metrics: () => world.metrics(),
      validation: () => validate(machine.state, 1),
    },
  });
  sync();
  performance.mark("bitland-interactive");
}
void boot().catch((error: unknown) => {
  console.error(error);
  const host = document.getElementById("app");
  if (host)
    host.textContent =
      "No se pudo abrir la placa. Recarga para volver a intentarlo.";
});
