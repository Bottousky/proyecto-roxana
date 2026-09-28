// Cuartos de las casas con puerta (src/homes.js los construye): tamaño, muebles por oficio
// y lo que se puede mirar adentro. Datos puros, para poder probarlos sin motor.
export const ROOM=[14,11];
const BACK=-ROOM[1]/2+.15;
const along=(kind,x,rotation=0)=>[kind,x,null,rotation];
// Resuelve las piezas «contra la pared del fondo» con la profundidad real de cada una.
export const placements=(kind,props)=>LAYOUTS[kind].map(([piece,x,z,rotation=0,y=0])=>[piece,x,z??BACK+(props[piece]?.d||1)/2+.02,rotation,y]);

export const LAYOUTS={
  home:[along('hearth',-4.2),along('bookshelf',-.6),along('cupboard',2.4),along('wardrobe',4.9),['bed',5.9,-.2,0],['rug',-1,.7,0],['table',-1,.6,0],['chair',-2.45,.6,90],['chair',.45,.6,-90],['candle',-1.35,.55,0,1.48],['barrel',-6.1,-2.1,0],['basket',-6,3.3,0],['pot',6.1,3.6,0]],
  bakery:[along('oven',-4.3),along('shelf_bread',-.7),along('shelf_bread',1.7),['counter',2.2,1.2,0],['basket',1.6,1.2,0,1.54],['sacks',-5.9,-.8,90],['sacks',-5.9,1.6,90],['table',-2.6,1.6,0],['basket_apples',-2.9,1.6,0,1.47],['barrel',5.9,-4.4,0],['crate',6,-2.8,8],['candle',3,1.2,0,1.54]],
  shop:[along('cupboard',-3.4),along('shelf_bread',-.8),along('crate_apples',3.9),along('crate_pears',5.4),['counter',0,.4,0],['basket_apples',.7,.4,0,1.54],['candle',-.8,.4,0,1.54],['crate',-6,-4.4,0],['crate_small',-6.1,-3.1,15],['barrel',6.1,-2.4,0],['sacks',5.8,2.4,90],['rug',0,3.1,0]],
  mill:[['millstone',-1.4,-2.4,0],along('cupboard',3.6),['sacks',-5.9,-4.2,0],['sacks',-5.9,-2.2,90],['hay',-5.8,1.1,90],['table',3.4,.8,0],['chair',2,.8,90],['candle',3.1,.75,0,1.48],['barrel',6.1,-4.4,0],['crate',6.1,-2.7,0],['logs',-5.9,3.4,90]],
  forge:[along('hearth',-4.2),['anvil',-1.3,-1.6,0],along('barrel',-1.6),['logs',1.4,-4.6,0],['crate',6,-4.4,0],['crate_small',6.1,-3,12],along('cupboard',4),['table',3.6,.8,0],['stool',2.1,1.2,0],['candle',3.9,.8,0,1.48]],
  inn:[along('hearth',-4.2),along('cupboard',.9),['counter',4.3,-2.9,0],along('barrel',3.6),along('barrel',5.1),['table',-3.3,.4,0],['chair',-4.75,.4,90],['chair',-1.85,.4,-90],['table',1.2,1.8,0],['stool',-.2,1.8,0],['stool',2.6,1.8,0],['candle',-3.3,.4,0,1.48],['candle',1.2,1.8,0,1.48],['rug',-1.2,1.1,0]],
  fisher:[along('hearth',-4.2),along('cupboard',-.3),['bed',5.9,-.2,0],['table',-1.2,.8,0],['chair',-2.65,.8,90],['candle',-1.3,.8,0,1.48],['barrel',-6.1,-2,0],['barrel',-6.1,-.6,0],['crate',2.8,-4.4,0],['crate_small',4.2,-4.5,-10],['basket',-5.9,3.2,0],['sacks',3.4,3.3,0]],
};

// Por casa: oficio, paredes y lo que se puede mirar adentro (x, z y una línea de diálogo).
export const HOMES={
  'portal-keeper':{kind:'home',walls:'stone',look:[-1,1.35,'Libro de visitas','home_porteros_book']},
  'plaza-bakery':{kind:'bakery',walls:'plaster',look:[-4.3,-2.2,'Horno de Marin','home_bakery_oven']},
  'plaza-civic-house':{kind:'home',walls:'plaster',look:[-.6,-3.4,'Libros del consejo','home_civic_books']},
  'plaza-market':{kind:'shop',walls:'timber',look:[0,1.4,'Libreta de cuentas','home_market_ledger']},
  'road-inn':{kind:'inn',walls:'timber',look:[4.3,-1.9,'Mostrador de la posada','home_inn_counter']},
  'wheel-house':{kind:'mill',walls:'stone',look:[-1.4,-.7,'Piedra de moler','home_wheel_stone']},
  'terrace-forge':{kind:'forge',walls:'stone',look:[-1.3,-.3,'Yunque','home_forge_anvil']},
  'terrace-mill':{kind:'mill',walls:'plaster',look:[-1.4,-.7,'Piedra de moler','home_mill_stone']},
  'lake-house':{kind:'fisher',walls:'timber',look:[-1.2,2,'Redes secándose','home_lake_nets']},
};
