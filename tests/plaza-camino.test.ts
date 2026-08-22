// Slice Plaza greenfield: una carga sostenida necesita ida, carga y retorno.
import {
  alternarContacto,
  conContacto,
  crearCamino,
  indicadorDe,
  intentarEnergizar,
  leerEntre,
  ohmDespierto,
  proteccionPermite,
  trayectoriaCompleta,
} from '../src/experiences/ohmdal-plaza/models/camino.ts';

function assert(condicion: unknown, etiqueta: string): void {
  if (!condicion) throw new Error(etiqueta);
}

const inicial = crearCamino();
assert(inicial.idaCerrada, 'la ida ya alcanza a Ohm al comenzar');
assert(!inicial.retornoCerrado, 'el retorno empieza abierto');
assert(!ohmDespierto(inicial), 'Ohm permanece inerte con el retorno abierto');
assert(indicadorDe(inicial) === 'residual', 'el indicador no se sostiene al inicio');
assert(!trayectoriaCompleta(inicial), 'no hay trayectoria completa al inicio');

const soloIda = conContacto(inicial, 'ida', true);
assert(!ohmDespierto(soloIda), 'cerrar sólo la ida no despierta a Ohm');
assert(indicadorDe(soloIda) === 'residual', 'cerrar sólo la ida deja el indicador residual');

const idaAbierta = conContacto(inicial, 'ida', false);
const soloRetorno = conContacto(idaAbierta, 'retorno', true);
assert(!ohmDespierto(soloRetorno), 'cerrar sólo el retorno, con la ida abierta, no despierta');

const completo = conContacto(soloIda, 'retorno', true);
assert(trayectoriaCompleta(completo), 'ida y retorno cerrados completan el Camino');
assert(ohmDespierto(completo), 'el Camino completo despierta a Ohm');
assert(indicadorDe(completo) === 'estable', 'el indicador se sostiene al completar');

const revertido = conContacto(completo, 'retorno', false);
assert(!ohmDespierto(revertido), 'abrir el retorno otra vez apaga a Ohm: el intento se revierte');

const intento = intentarEnergizar(inicial);
assert(intento.efecto === 'sin_retorno', 'energizar sin retorno no sostiene la respuesta');
assert(intento.state.retornoCerrado === false, 'el intento no cierra el retorno por magia');
assert(intentarEnergizar(completo).efecto === 'sostenido', 'con Camino cerrado el indicador se sostiene');

assert(proteccionPermite(inicial, 'retorno'), 'la protección de baja tensión no bloquea el retorno');
assert(proteccionPermite(inicial, 'ida'), 'la protección no castiga cerrar la ida');

assert(leerEntre(inicial, 'fuente', 'ohm') === 'continuidad', 'la ida cerrada lee continuidad fuente–Ohm');
assert(
  leerEntre(inicial, 'retorno_ohm', 'retorno_fuente') === 'insuficiente',
  'el hueco del retorno informa dato insuficiente',
);
assert(
  leerEntre(inicial, 'ohm', 'retorno_fuente') === 'insuficiente',
  'medir a través del hueco no alcanza',
);
assert(leerEntre(completo, 'retorno_ohm', 'retorno_fuente') === 'continuidad', 'al cerrar, el mismo par lee continuidad');
assert(leerEntre(completo, 'fuente', 'retorno_fuente') === 'continuidad', 'Camino cerrado: continuidad en el anillo');
assert(leerEntre(inicial, 'ohm', 'ohm') === 'insuficiente', 'un solo punto no es una lectura');

const lectura = leerEntre(inicial, 'retorno_ohm', 'retorno_fuente');
assert(lectura === 'insuficiente' || lectura === 'continuidad', 'Ohm sólo informa continuidad o insuficiencia');
assert(lectura !== ('solucion' as string), 'Ohm nunca nombra la solución');

const idaToggled = alternarContacto(inicial, 'ida');
assert(!idaToggled.idaCerrada, 'alternar la ida la abre');
assert(!ohmDespierto(alternarContacto(idaToggled, 'retorno')), 'ida abierta + retorno cerrado sigue incompleto');

console.log('plaza-camino tests: OK');
