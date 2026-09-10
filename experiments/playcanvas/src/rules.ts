export function isSliceLand(inside:boolean,x:number,z:number):boolean{
  if(inside)return Math.abs(x)<11.5&&Math.abs(z)<11.5;
  if(z>15.1||z< -62.6)return false;
  if(z< -16&&z> -32){const t=(-z-16)/16,c=6*t*t*(3-2*t);return Math.abs(x-c)<1.7;}
  const cx=z< -16?6:0;if(Math.abs(x-cx)>19.4)return false;
  const canal=z>= -16?22:z<= -32?25.8:22+(-z-16)/16*3.8;return Math.abs(x-canal)>2.65;
}
