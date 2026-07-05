// Lógica de los puzzles en-mundo del Arco 1. Sin arte de banco: todo pasa en el mapa.
// Cada puzzle enseña un concepto y la Bitácora revela el nombre técnico DESPUÉS.
import { say, toast } from './dialog.ts';
import { getDialogue } from './content.ts';
import { setFlag } from './save.ts';
import { unlockEntry } from './journal.ts';
import { setObjective } from './quests.ts';
import { TEAL, LAMP_ON, OFF_GRAY } from './config.ts';
import type { ObjDef } from './types.ts';

/** Lo que la escena le presta a los puzzles para mover el mundo. */
export interface PuzzleApi {
  setTexture(id: string, key: string): void;
  setTint(id: string, color: number | null): void;
  setGlow(id: string, on: boolean): void;
  move(id: string, tileX: number, tileY: number): void;
  sparkAt(id: string): void;
  refreshWarps(): void;
  onArcComplete(): void;
}

export function createPuzzles(api: PuzzleApi) {
  // estado local por carga de mapa
  const s = {
    p1: { placed: false, power: false, solved: false },
    p2: { held: null as null | 'conductor' | 'insulator', solved: false },
    p3: { on: { p3_n1: false, p3_n2: false, p3_n3: false } as Record<string, boolean>, solved: false },
    p4: { solved: false },
  };

  function p1(objId: string): void {
    if (s.p1.solved) {
      if (objId === 'p1_lamp') toast('La lámpara arde tibia y constante. Cuesta creer que estuvo muerta.');
      return;
    }
    if (objId === 'p1_source') {
      say(getDialogue('glade_lamp_off'));
      return;
    }
    if (objId === 'p1_conduit') {
      if (s.p1.placed) { toast('El conducto ya está encajado en el hueco.'); return; }
      s.p1.placed = true;
      api.move('p1_conduit', 13, 7);
      api.setTint('p1_conduit', TEAL);
      toast('Encajás el conducto suelto en el hueco del camino de vuelta.');
      return;
    }
    if (objId === 'p1_switch') {
      s.p1.power = !s.p1.power;
      api.setTexture('p1_switch', s.p1.power ? 'switch_on' : 'switch_off');
      if (s.p1.power && s.p1.placed) {
        s.p1.solved = true;
        api.setTint('p1_lamp', LAMP_ON); api.setGlow('p1_lamp', true);
        api.setGlow('p1_source', true);
        api.sparkAt('p1_lamp');
        say(getDialogue('glade_solved'), () => {
          setFlag('solvedClosedCircuit');
          unlockEntry('j_closed_circuit');
          setObjective('obj_reach_plaza');
          api.refreshWarps();
        });
      } else if (s.p1.power && !s.p1.placed) {
        api.sparkAt('p1_source');
        toast('La chispa sale de la fuente… pero no encuentra el regreso. El aro sigue abierto.');
        window.setTimeout(() => { s.p1.power = false; api.setTexture('p1_switch', 'switch_off'); }, 900);
      }
    }
  }

  function p2(objId: string): void {
    if (s.p2.solved) {
      if (objId === 'p2_lamp') toast('El faro del puente arde parejo. El paso quedó firme.');
      return;
    }
    if (objId === 'p2_source') { toast('La fuente empuja con ganas, pero el puente está cortado en la ranura.'); return; }
    if (objId === 'p2_conductor') { s.p2.held = 'conductor'; toast('Tomás la muestra de cobre. Pesa poco y brilla.'); return; }
    if (objId === 'p2_insulator') { s.p2.held = 'insulator'; toast('Tomás la placa oscura. Fría, opaca, muda.'); return; }
    if (objId === 'p2_slot') {
      if (!s.p2.held) { toast('La ranura está vacía. Necesitás una muestra del pilar.'); return; }
      if (s.p2.held === 'insulator') {
        say(getDialogue('conductor_fizzle'));
        api.sparkAt('p2_slot');
        s.p2.held = null;
        return;
      }
      // conductor
      s.p2.solved = true;
      api.setTint('p2_slot', TEAL); api.setGlow('p2_slot', true);
      api.setTint('p2_lamp', LAMP_ON); api.setGlow('p2_lamp', true);
      api.sparkAt('p2_slot');
      say(getDialogue('conductor_solved'), () => {
        setFlag('solvedConductor');
        unlockEntry('j_conductors');
        setObjective('obj_ruins');
        api.refreshWarps();
      });
    }
  }

  function p3(objId: string): void {
    if (s.p3.solved) return;
    if (!(objId in s.p3.on)) return;
    s.p3.on[objId] = !s.p3.on[objId];
    api.setTint(objId, s.p3.on[objId] ? TEAL : OFF_GRAY);
    api.setGlow(objId, s.p3.on[objId]);
    const all = s.p3.on.p3_n1 && s.p3.on.p3_n2 && s.p3.on.p3_n3;
    if (all) {
      s.p3.solved = true;
      api.setTint('sealed_door', TEAL); api.setGlow('sealed_door', true);
      api.sparkAt('p3_n3');
      say(getDialogue('ruins_solved'), () => {
        setFlag('solvedSeries');
        unlockEntry('j_continuity');
        setObjective('obj_first_spark');
        api.refreshWarps();
      });
    } else {
      toast(s.p3.on[objId] ? 'El nodo se enciende… pero la fila sigue muda.' : 'Se apaga. Con un hueco, no circula nada.');
    }
  }

  function p4(objId: string): void {
    if (objId !== 'p4_core') return;
    if (s.p4.solved) { toast('El núcleo late dorado y firme. Por fin se lo puede mirar de frente.'); return; }
    s.p4.solved = true;
    say(getDialogue('core_intro'), () => {
      api.setTint('p4_core', TEAL); api.setGlow('p4_core', true);
      api.sparkAt('p4_core');
      say(getDialogue('core_solved'), () => {
        setFlag('stabilizedCore');
        setFlag('arcComplete');
        unlockEntry('j_resistance');
        setObjective('obj_done');
        api.onArcComplete();
      });
    });
  }

  return {
    /** Enruta la interacción con un objeto-puzzle. */
    interact(obj: Extract<ObjDef, { kind: 'interact' }>): void {
      switch (obj.puzzle) {
        case 'p1': return p1(obj.id);
        case 'p2': return p2(obj.id);
        case 'p3': return p3(obj.id);
        case 'p4': return p4(obj.id);
      }
    },
  };
}
