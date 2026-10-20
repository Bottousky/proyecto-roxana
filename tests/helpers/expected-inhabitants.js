// Independent story expectations: do not use the runtime plan to certify itself.
export function expectedPresent(object,flags={}) {
  if(object.hidden||object.requiresFlag&&!flags[object.requiresFlag])return false;
  switch(object.id){
    case 'edda_portal': return !flags.workshop;
    case 'edda_plaza': return !flags.workshop||Boolean(flags.beacon_lens&&flags.epilogue_shared);
    case 'edda_road': return !flags.pump;
    case 'edda_castle': return !flags.irrigation;
    case 'edda_lake': return !flags.beacon_supply;
    case 'vega_spring': return !flags.distribution;
    // While the Plaza has no water (gate open, pump not yet), Tala and Marín are at the Manantial.
    case 'tala_plaza': return (!flags.beacon_lens||Boolean(flags.epilogue_shared))&&!(flags.gate&&!flags.pump);
    case 'marin': return !(flags.gate&&!flags.pump);
    case 'tala_spring': case 'marin_spring': return Boolean(flags.gate)&&!flags.pump;
    default: return true;
  }
}
