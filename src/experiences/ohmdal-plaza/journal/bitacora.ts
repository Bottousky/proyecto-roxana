import type { RumorNode } from '../types.ts';

export class BitacoraManager {
  private rumors: Record<string, RumorNode> = {
    portal_origen: {
      id: 'portal_origen',
      title: 'El Portal del Instituto',
      category: 'mecanismo',
      description: 'Generador de potencial electromotriz constante de 24 voltios directos.',
      superstition: '«El Altar de Cristal donde duermen los antiguos maestros».',
      physicalTruth: 'Fuente de tensión continua con borne positivo (+24V) y retorno a masa (0V).',
      status: 'discovered',
      connections: ['despertar_ohm', 'brecha_sagrada', 'ley_retorno'],
      x: 80,
      y: 80,
      icon: '⚡',
    },
    despertar_ohm: {
      id: 'despertar_ohm',
      title: 'El Despertar de Ohm',
      category: 'mecanismo',
      description: 'La antigua reliquia de medición del Instituto despertó al acoplar sus contactos primarios.',
      superstition: '«El Golem de latón que solo cobra vida con la bendición del rayo».',
      physicalTruth: 'Autómata de diagnóstico con micro-filamento y galvanoscopio integrado energizado a 24V.',
      status: 'unknown',
      connections: ['asombro_edda', 'taller_lumen'],
      x: 220,
      y: 80,
      icon: '🤖',
    },
    asombro_edda: {
      id: 'asombro_edda',
      title: 'La Intuición de Edda',
      category: 'persona',
      description: 'Edda descubrió que las máquinas no necesitan rituales místicos, sino circuitos cerrados.',
      superstition: '«El himno de los tres golpes convoca la chispa».',
      physicalTruth: 'Comprender que la corriente requiere un lazo cerrado y diferencia de potencial.',
      status: 'unknown',
      connections: ['taller_lumen', 'lengueta_edda'],
      x: 360,
      y: 80,
      icon: '📜',
    },
    taller_lumen: {
      id: 'taller_lumen',
      title: 'El Taller de Lumen',
      category: 'persona',
      description: 'El maestro artesano conserva herramientas, barras conductoras y la memoria de 40 años de apagón.',
      superstition: '«Quitar el puente calma la cólera del rayo para que no queme las lámparas».',
      physicalTruth: 'Retirar la barra puente dejó el circuito abierto (R = ∞). Nos entrega barra de cobre y cepillo de alambre.',
      status: 'unknown',
      connections: ['brecha_sagrada', 'moho_verde'],
      x: 360,
      y: 220,
      icon: '🧰',
    },
    lengueta_edda: {
      id: 'lengueta_edda',
      title: 'La Campana y el Relé',
      category: 'mecanismo',
      description: 'Edda descubrió que la vibración de la campana empuja una lengüeta magnética.',
      superstition: '«La campana despierta la voz dormida del bronce».',
      physicalTruth: 'Interruptor de contacto con bobina de retención electromagnética.',
      status: 'unknown',
      connections: ['puerta_ohm', 'ley_retorno'],
      x: 220,
      y: 300,
      icon: '🔔',
    },
    brecha_sagrada: {
      id: 'brecha_sagrada',
      title: 'La Brecha del Riel Oeste',
      category: 'misterio',
      description: 'Un corte de un metro en el riel de retorno impide que el circuito se complete.',
      superstition: '«Espacio sagrado que ningún mortal debe cruzar con metal».',
      physicalTruth: 'Circuito abierto. Requiere instalar una barra puente conductora de baja resistencia.',
      status: 'unknown',
      connections: ['ley_retorno'],
      x: 520,
      y: 160,
      icon: '✂️',
    },
    moho_verde: {
      id: 'moho_verde',
      title: 'La Sulfatación del Contacto',
      category: 'misterio',
      description: 'Una gruesa capa verde de óxido actúa como una enorme resistencia parásita.',
      superstition: '«Moho que pudre el alma de la chispa».',
      physicalTruth: 'Capa de carbonato de cobre de 2400 ohmios. Se limpia con cepillo abrasivo.',
      status: 'unknown',
      connections: ['ley_retorno'],
      x: 520,
      y: 280,
      icon: '🧪',
    },
    ley_retorno: {
      id: 'ley_retorno',
      title: 'Ley del Lazo Cerrado (Ohm)',
      category: 'ley_fisica',
      description: 'Para que la corriente exista y haga trabajo, debe existir un camino continuo de regreso a la fuente.',
      superstition: '«El ciclo eterno de la energía compartida».',
      physicalTruth: 'I = V / R_total. Sin camino cerrado (R = ∞), la corriente es nula y nada funciona.',
      status: 'unknown',
      connections: ['puerta_ohm'],
      x: 680,
      y: 220,
      icon: '🔄',
    },
    puerta_ohm: {
      id: 'puerta_ohm',
      title: 'La Gran Puerta de Ohm (Ω)',
      category: 'mecanismo',
      description: 'Imponente arco de piedra con el emblema Ω de latón pulido y cerrojos solenoide.',
      superstition: '«La Gran Puerta sólo se abre para quien descifra el sello sagrado».',
      physicalTruth: 'Los solenoides magnéticos se retraen cuando el lazo de retorno conduce corriente nominal.',
      status: 'unknown',
      connections: ['manantial_central_hidraulica'],
      x: 820,
      y: 220,
      icon: '🚪',
    },
    manantial_central_hidraulica: {
      id: 'manantial_central_hidraulica',
      title: 'El Manantial y la Montaña',
      category: 'mecanismo',
      description: 'Gran cascada y canal de presión descendiendo de la montaña hacia las turbinas.',
      superstition: '«El templo donde los espíritus del agua vierten la luz».',
      physicalTruth: 'Central hidroeléctrica: la energía potencial de la caída de agua mueve turbinas que inducen FEM.',
      status: 'unknown',
      connections: ['analogia_potencial'],
      x: 960,
      y: 160,
      icon: '🌊',
    },
    analogia_potencial: {
      id: 'analogia_potencial',
      title: 'Paralelismo Hidráulico-Eléctrico',
      category: 'ley_fisica',
      description: 'Deducción fundamental: La diferencia de altura es al agua lo que la diferencia de potencial (V) es a los electrones.',
      superstition: '«El agua alta empuja con furia, la chispa alta brilla con gloria».',
      physicalTruth: 'Presión Hidráulica ΔP = ρ·g·Δh impulsa caudal Q (litros/s) ↔ Potencial Eléctrico ΔV impulsa corriente I (coulombs/s).',
      status: 'unknown',
      connections: [],
      x: 960,
      y: 300,
      icon: '💡',
    },
  };

  public getRumors(): Record<string, RumorNode> {
    return this.rumors;
  }

  public unlock(id: string, status: 'rumor' | 'investigating' | 'discovered' = 'discovered'): void {
    if (this.rumors[id]) {
      this.rumors[id].status = status;
    }
  }

  public getProgress(): { discovered: number; total: number; percentage: number } {
    const total = Object.keys(this.rumors).length;
    const discovered = Object.values(this.rumors).filter((r) => r.status === 'discovered').length;
    return {
      discovered,
      total,
      percentage: Math.round((discovered / total) * 100),
    };
  }
}

