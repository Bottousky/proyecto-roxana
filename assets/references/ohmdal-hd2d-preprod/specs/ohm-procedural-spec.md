# Spec de producción — Ohm procedural

La fábrica recibe el namespace `THREE` del runtime para no agregar loaders ni dependencias.
Construye partes simples separadas, comparte un material, publica sockets y devuelve `setState`
y `dispose`. No crea luces, cámara, loop ni collider; éstos pertenecen al harness.

- Altura: 1,03 m; frente: `+Z`; pivote: centro de base en suelo.
- Collider contractual: cápsula radio 0,32 m, altura 1,03 m.
- Partes: base, carcasa, visor, dos pivotes de brazo y sensor.
- Estados equivalentes al atlas: reposo, locomoción, sensor desplegado, medida válida, medida
  bloqueada e incertidumbre.
- Presupuesto compartido del A/B: 512 triángulos, 8 draw calls, un material y textura de lado
  ≤512 px. La variante procedural no carga textura, pero no recibe un techo mayor.
- Proveedor: ninguno; implementación manual y original; coste generativo: cero.
