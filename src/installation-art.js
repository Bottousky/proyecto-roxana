// Authored endpoints, never proximity guesses. Mechanical controls carry no wire.
export const CONTROL_PANELS=Object.freeze({
  workshop_feed:'workbench',workshop_return:'workbench',
  road_send:'gate_panel',road_return:'gate_panel',road_bypass:'gate_panel',
  castle_isolated:'distribution_panel',castle_service:'distribution_panel',
  forge_limited:'irrigation_panel',
  tower_feed:'beacon_supply_panel',tower_return:'beacon_supply_panel',
  tower_isolated:'beacon_network_panel',
});
export const WATER_HANDLES=new Set(['spring_sluice','irrigation_open']);
export function conductorTarget(area,object){
  if(area.id==='lake'&&['lake_cable','lake_return'].includes(object.id))return {id:'shore-feeder',x:4,z:-14};
  return area.objects.find(candidate=>candidate.id===CONTROL_PANELS[object.id])||null;
}
