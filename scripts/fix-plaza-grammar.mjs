import { readFileSync, writeFileSync } from 'fs';

const path = 'C:\\YO\\Proyectos\\Roxana\\src\\ohmdal\\architecture\\plazaKit.ts';
let buf = readFileSync(path);

const old1 = Buffer.from('/** /**\r\n * Pretiles');
const new1 = Buffer.from('/**\r\n * Pretiles');
if (buf.indexOf(old1) < 0) { console.error('FIX1 not found'); process.exit(1); }
buf = buf.subarray(0, buf.indexOf(old1)) + new1 + buf.subarray(buf.indexOf(old1) + old1.length);
console.log('FIX1 done');

const old2 = Buffer.from('return pieces;\r\n}\r\n}\r\n\r\n/**\r\n * Silueta del Portal');
const new2 = Buffer.from('return pieces;\r\n}\r\n\r\n/**\r\n * Silueta del Portal');
if (buf.indexOf(old2) < 0) { console.error('FIX2 not found'); process.exit(1); }
buf = buf.subarray(0, buf.indexOf(old2)) + new2 + buf.subarray(buf.indexOf(old2) + old2.length);
console.log('FIX2 done');

writeFileSync(path, buf);
console.log('Wrote. New size:', buf.length);
