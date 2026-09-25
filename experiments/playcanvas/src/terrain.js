import {AREAS} from './game/content.js';
import {isExterior,inKingdomWater,inTravelCorridor} from './game/kingdom-geography.js';
import {lakeShoreX} from './game/world-layout.js';
export function walkableTerrain(id,x,z){
 const exterior=isExterior(id),[w,d]=AREAS[id].bounds;
 if(exterior&&Math.abs(z)>d/2-.2)return inTravelCorridor(id,x,z);
 if(exterior&&Math.abs(x)>w/2-.45)return false;
 if(exterior&&inKingdomWater(id,x,z))return false;
 if(id==='spring'&&x>-14.81&&x<-8.31&&z>-14.5&&z<10.5)return false;
 if(id==='road'&&x>17.8&&x<21.8)return false;
 if(id==='lighthouse')return Math.hypot(x/(w*.68),z/(d*.82))<.95;
 if(id==='lake')return x<lakeShoreX(z)-.4||(Math.abs(z-3)<2.1&&x<13.8);
 return true;
}
