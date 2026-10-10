import {SHADERLANGUAGE_GLSL} from 'playcanvas';

// Leaves, ferns, hedges, crops and sown plants share one albedo: PlayCanvas's own, then pulled
// toward the forgotten kingdom. Nothing green ever reaches a garden's saturation, and around a
// place nobody has restored the green dries to straw and grey olive. People, copper and the
// installations keep their colour against it: that difference is what the eye follows.
// uDry: 0 alive … 1 forgotten, per material. Sown plants carry their place's life in vertex alpha.
const livingPS=`
uniform vec3 material_diffuse;
uniform float uDry;
uniform float uLifeInAlpha;
void getAlbedo() {
	dAlbedo = material_diffuse.rgb;
	#ifdef STD_DIFFUSE_TEXTURE
		dAlbedo *= {STD_DIFFUSE_TEXTURE_DECODE}(texture2DBias({STD_DIFFUSE_TEXTURE_NAME}, {STD_DIFFUSE_TEXTURE_UV}, textureBias)).{STD_DIFFUSE_TEXTURE_CHANNEL};
	#endif
	float dry = uDry;
	#ifdef STD_DIFFUSE_VERTEX
		dAlbedo *= saturate(vVertexColor.{STD_DIFFUSE_VERTEX_CHANNEL});
		dry = max(dry, (1.0 - vVertexColor.a) * uLifeInAlpha);
	#endif
	float lum = dot(dAlbedo, vec3(0.3, 0.59, 0.11));
	dAlbedo = mix(dAlbedo, vec3(lum), 0.2);
	dAlbedo = mix(dAlbedo, vec3(lum * 1.2, lum * 1.0, lum * 0.6), dry * 0.8) * (1.0 - 0.14 * dry);
}
`;
export function makeLiving(material,{lifeInAlpha=false}={}){
  material.shaderChunksVersion='2.22';
  material.getShaderChunks(SHADERLANGUAGE_GLSL).set('diffusePS',livingPS);
  material.setParameter('uDry',0);material.setParameter('uLifeInAlpha',lifeInAlpha?1:0);material.update();
  return material;
}
export function setDry(material,dry){material.setParameter('uDry',Math.max(0,Math.min(1,dry)));}
