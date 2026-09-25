// Slow, broken highlights and a darker channel centre replace the diagonal stripes.
export const waterVertex=`varying vec3 vPos;varying vec2 vUv;void main(){vUv=uv;vPos=(modelMatrix*vec4(position,1.)).xyz;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`;
export const waterFragment=`
varying vec3 vPos;varying vec2 vUv;
uniform float time;uniform float channel;uniform vec2 worldOffset;
uniform vec3 deep;uniform vec3 shallow;uniform vec3 light;
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
void main(){
  vec2 p=vPos.xz+worldOffset;
  vec2 flow=p*vec2(.8,.55)+vec2(sin(time*.12)*.07,-time*.12);
  float broad=noise(flow*.7),detail=noise(flow*3.+broad*.7);
  float edge=pow(abs(vUv.x*2.-1.),3.)*channel;
  float ripple=sin(p.y*5.8+noise(p*.9)*5.-time*.9+sin(p.x*2.4)*1.2);
  float broken=smoothstep(.88,.995,ripple)*smoothstep(.51,.78,detail);
  float reflection=noise(p*vec2(.27,.65)+vec2(0,time*.024));
  vec3 col=mix(deep,shallow,.14+broad*.23+edge*.28);
  col=mix(col,shallow,reflection*.13);
  col+=light*broken*.11;
  float lip=smoothstep(.90,1.,abs(vUv.x*2.-1.))*channel;
  col*=1.-lip*.27;
  col+=shallow*edge*smoothstep(.76,.93,detail)*.13;
  gl_FragColor=vec4(col,.98);
}`;
