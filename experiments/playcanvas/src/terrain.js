import {AREAS} from './game/content.js';
import {isExterior,inKingdomWater,inTravelCorridor} from './game/kingdom-geography.js';
import {lakeShoreX} from './game/world-layout.js';
export function walkableTerrain(id,x,z){
 const exterior=isExterior(id),[w,d]=AREAS[id].bounds;
 // Where a road leaves a place its mouth flares into the place's edge (up to 1,8 m), so walking in
 // or out at an angle slides along instead of catching in the corner between road and border.
 if(exterior&&Math.abs(z)>d/2-.2){
  if(inTravelCorridor(id,x,z))return true;
  const flare=Math.min(1.8,d/2+1.6-Math.abs(z));
  return flare>0&&Math.abs(x)<=w/2-.45&&!inKingdomWater(id,x,z)&&inTravelCorridor(id,x,z,-flare);
 }
 if(exterior&&Math.abs(x)>w/2-.45)return false;
 if(exterior&&inKingdomWater(id,x,z))return false;
 if(id==='spring'&&x>-14.81&&x<-8.31&&z>-14.5&&z<10.5)return false;
 if(id==='road'&&x>17.8&&x<21.8)return false;
 if(id==='lighthouse')return Math.hypot(x/(w*.68),z/(d*.82))<.95;
 if(id==='lake')return x<lakeShoreX(z)-.4||(Math.abs(z-3)<2.1&&x<13.8);
 return true;
}
