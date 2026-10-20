import test from 'node:test';import assert from 'node:assert/strict';
import {isolateFigure,opaqueBounds} from '../src/game/actor-animation.js';

test('a pose keeps its own figure and drops a neighbour intruding into its cell',()=>{
  const w=40,h=60,p=new Uint8ClampedArray(w*h*4);
  const fill=(x0,y0,x1,y1)=>{for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++)p[(y*w+x)*4+3]=255;};
  fill(14,6,26,40);   // this cell's figure; its head rises above the cell top (y=10)
  fill(10,52,30,60);  // the hair of the pose below, poking up into the bottom of the window
  isolateFigure(p,w,h,{x0:0,x1:40,y0:10,y1:50});
  const b=opaqueBounds(p,w,h);
  assert.deepEqual([b.y,b.height],[6,34],'the whole figure, head included, and nothing below it');
});
