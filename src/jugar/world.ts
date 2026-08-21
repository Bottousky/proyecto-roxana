// R6: `world.ts` quedó como stub deprecado.
// La geografía continua del Arco I se reemplaza por dos autoridades puras:
//   - RoomGraph (topología) para conexiones entre rooms.
//   - ActiveRoom (geometría local) para la room activa.
// El mapa M (representación esquemática) se modela en `mapSchematic.ts`,
// que NO expone offsets físicos.
//
// Este archivo se conserva momentáneamente como un re-export que apunta
// a `mapSchematic.ts` para que el código existente siga compilando mientras
// se completa la migración. Cualquier consumidor runtime debe migrar a
// `mapSchematicOf()` y a las nuevas APIs (sin `ox/oy`).
//
// Las constantes históricas de `WORLDS` y `worldOf` se retiraron en R6:
// el mapa M ya no necesita offsets, sólo `accent` + `name` + lista de rooms.

export { mapSchematicOf, MAP_SCHEMATICS, type MapSchematic } from './mapSchematic.ts';
