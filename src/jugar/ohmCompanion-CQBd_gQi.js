import{s as M,r as Te}from"./state-N1D2bz42.js";const Ae=`
<div id="hud">
  <button id="ohm-companion-btn" class="hidden" title="Consultar a Ohm (O)" aria-label="Consultar a Ohm" data-key="O" tabindex="-1">
    <img id="ohm-companion-portrait" alt="Ohm" />
    <span class="ohm-companion-signal" aria-hidden="true"></span>
  </button>
  <button id="audio-btn" title="Sonido (V)" data-key="V" tabindex="-1">🔊</button>
  <button id="bitacora-btn" class="hidden" title="Bitácora (B)" data-key="B" tabindex="-1">✒<span id="bitacora-dot" class="hidden"></span></button>
</div>

<div id="prompt" class="hidden"></div>

<div id="dialog" class="hidden">
  <div id="dialog-portrait">
    <img id="dialog-portrait-image" alt="" />
  </div>
  <div id="dialog-copy">
    <div id="dialog-who"></div>
    <div id="dialog-text"></div>
  </div>
  <div id="dialog-next">▼</div>
</div>

<div id="toast" class="hidden"></div>

<div id="bench" class="hidden"></div>

<div id="bitacora" class="hidden"></div>

<div id="end-screen" class="hidden"></div>
`;let re=!1;function Ce(){if(re||(re=!0,document.getElementById("dialog")))return;const e=document.createElement("div");e.id="roxana-overlays",e.innerHTML=Ae,document.body.append(e)}let D=0;function ne(){return D>0}function pe(){D++}let me=-1/0;function he(){D=Math.max(0,D-1),D===0&&(me=performance.now())}function da(e=180){return performance.now()-me<e}function v(e){Ce();const a=document.getElementById(e);if(!a)throw new Error(`Falta el elemento #${e} en index.html`);return a}function je(){return typeof window>"u"||typeof navigator>"u"?!1:navigator.maxTouchPoints>0||"ontouchstart"in window}function ua(){typeof document<"u"&&document.body.classList.add("touch-device")}function N(){return typeof document<"u"&&(document.body.classList.contains("touch-device")||je())}const Oe={tempo:72,melody:[["D5",1.5],["E5",.5],["F5",1],["E5",1],["D5",1],["C5",1],["A4",2],[null,1],["F5",1.5],["G5",.5],["A5",1],["G5",1],["F5",1],["E5",1],["D5",3],[null,1],["D5",1.5],["E5",.5],["F5",1],["A5",1],["G5",2],["E5",1],["D5",4],[null,2]],bass:[["D3",5],["Bb2",4],["C3",5],["D3",5],["Bb2",4],["A2",4],["D3",5]],melodyLevel:.6,bassLevel:.5},Me={tempo:60,melody:[["A4",2],["C5",1],["B4",2],[null,1],["E5",2],["D5",1],["C5",2],["A4",3],[null,2],["G4",2],["A4",1],["C5",2],["B4",1],["A4",4],[null,2]],bass:[["A2",7],["F2",7],["G2",7],["A2",7]],melodyLevel:.5,bassLevel:.45},ke={tempo:84,melody:[["G4",1],["B4",1],["D5",1],["B4",1],["C5",1.5],["A4",.5],["B4",2],[null,1],["G4",1],["A4",1],["B4",1],["D5",1],["E5",1.5],["D5",.5],["A4",3],[null,1],["C5",1],["B4",1],["A4",1],["F4",1],["G4",4],[null,2]],bass:[["G2",5],["C3",4],["G2",5],["D3",5],["F2",4],["G2",6]],melodyLevel:.6,bassLevel:.5},Re={tempo:76,melody:[["D5",1.5],["E5",.5],["F#5",1],["E5",1],["D5",1],["E5",1],["A5",2],[null,1],["G5",1.5],["A5",.5],["B5",1],["A5",1],["G5",1],["F#5",1],["E5",3],[null,1],["F#5",1.5],["G5",.5],["A5",1],["B5",1],["A5",2],["F#5",1],["D5",4],[null,2]],bass:[["D3",5],["G3",4],["A2",5],["D3",5],["G3",4],["A2",4],["D3",5]],melodyLevel:.6,bassLevel:.5},H={tempo:52,melody:[["A3",2],["C4",1],["B3",2],[null,2],["E4",2],["D4",1],["C4",2],["A3",4],[null,3],["F3",2],["G3",1],["A3",3],["G3",2],["E3",4],[null,3],["A3",2],["B3",1],["C4",2],["E4",2],["D4",3],["A3",5],[null,4]],bass:[["A1",9],["F1",9],["G1",9],["A1",9]],melodyLevel:.45,bassLevel:.5},xe={...H,tempo:56,percussion:[{beat:0,freq:62,level:.22},{beat:4,freq:55,level:.18},{beat:8,freq:62,level:.22},{beat:12,freq:55,level:.18},{beat:16,freq:62,level:.22},{beat:20,freq:55,level:.18},{beat:24,freq:62,level:.22},{beat:28,freq:55,level:.18}]},De={...H,tempo:58,melody:[["A4",2],["C5",1],["E5",2],[null,2],["D5",2],["C5",1],["A4",3],[null,3],["F4",2],["A4",1],["C5",2],["B4",2],["A4",4],[null,3],["G4",2],["A4",1],["C5",2],["E5",2],["D5",3],["A4",5],[null,4]],bass:[["A2",9],["F2",9],["G2",9],["A2",9]],melodyLevel:.42,bassLevel:.38},Be={...H,tempo:48,melody:[["A4",3],[null,2],["E5",1],["D5",3],[null,3],["C5",2],["A4",2],[null,2],["G4",4],[null,4],["A4",2],["C5",1],["E5",3],[null,3],["D5",5],[null,5]],bass:[["A1",11],["F1",11],["G1",11],["A1",11]],melodyLevel:.38,bassLevel:.42},Pe={instituto:{chords:[[73.42,110],[58.27,87.31],[65.41,98]],droneType:"sine",filter:320,level:.13,scale:[293.66,349.23,392,440,523.25,587.33],phraseGap:[4500,1e4],pluckLevel:.05,theme:Oe},ohmdal:{chords:[[55,82.41],[43.65,65.41],[49,73.42]],droneType:"triangle",filter:220,level:.11,scale:[220,261.63,293.66,329.63,392],phraseGap:[6e3,14e3],pluckLevel:.04,theme:Me},taller:{chords:[[98,146.83],[87.31,130.81],[73.42,110]],droneType:"triangle",filter:420,level:.12,hum:100,scale:[392,440,493.88,587.33,659.25],phraseGap:[3500,8e3],pluckLevel:.05,theme:ke},castle:{chords:[[27.5,41.2],[21.83,32.7],[24.5,36.71]],droneType:"triangle",filter:180,level:.13,scale:[110,130.81,146.83,164.81,196],phraseGap:[8e3,18e3],pluckLevel:.035,theme:H},forge:{chords:[[27.5,41.2],[21.83,32.7],[24.5,36.71]],droneType:"triangle",filter:210,level:.14,scale:[110,130.81,146.83,164.81,196],phraseGap:[7500,16e3],pluckLevel:.03,theme:xe},terraces:{chords:[[55,82.41],[43.65,65.41],[49,73.42]],droneType:"sine",filter:360,level:.1,scale:[220,261.63,293.66,329.63,392,440],phraseGap:[6500,14e3],pluckLevel:.035,theme:De},lighthouse:{chords:[[27.5,41.2],[21.83,32.7],[24.5,36.71]],droneType:"sine",filter:240,level:.11,scale:[110,130.81,146.83,164.81,196,220],phraseGap:[9e3,19e3],pluckLevel:.028,theme:Be},"ohmdal-on":{chords:[[73.42,110,185],[98,146.83,196],[110,164.81,220]],droneType:"sine",filter:520,level:.15,scale:[293.66,329.63,369.99,440,493.88,587.33],phraseGap:[3e3,7e3],pluckLevel:.06,theme:Re}},fe=.6,ge="roxana-audio-vol";let t=null,T=null,O=null,B=null,E=null,F=null,L=Math.max(0,Math.min(10,parseInt(localStorage.getItem(ge)??"7",10))),S=null,W=null,A=0,K=null,X=0;function te(){if(t){t.state==="suspended"&&t.resume();return}const e=window.AudioContext??window.webkitAudioContext;if(!e)return;t=new e,T=t.createGain(),T.gain.value=L/10*fe,T.connect(t.destination),O=t.createGain(),O.gain.value=.9,O.connect(T),B=t.createGain(),B.gain.value=.9,B.connect(T),E=t.createDelay(1),E.delayTime.value=.31;const a=t.createBiquadFilter();a.type="lowpass",a.frequency.value=1800;const o=t.createGain();o.gain.value=.32;const l=t.createGain();l.gain.value=.5,E.connect(a),a.connect(o),o.connect(E),a.connect(l),l.connect(O),F=t.createBuffer(1,t.sampleRate,t.sampleRate);const n=F.getChannelData(0);for(let s=0;s<n.length;s++)n[s]=Math.random()*2-1;const r=()=>{t&&t.state==="suspended"&&t.resume()};window.addEventListener("pointerdown",r),window.addEventListener("keydown",r),W&&ve(W)}function Y(e){L=Math.max(0,Math.min(10,Math.round(e))),localStorage.setItem(ge,String(L)),t&&T&&T.gain.setTargetAtTime(L/10*fe,t.currentTime,.04)}function Se(e){return e===0?"🔇":e<=3?"🔈":e<=6?"🔉":"🔊"}function pa(){const e=document.getElementById("audio-btn");if(!e)return;const a=document.createElement("div");a.id="audio-pop",a.className="hidden",a.innerHTML=`
    <input id="vol-slider" type="range" min="0" max="10" step="1" />
    <span id="vol-label"></span>`,e.parentElement.appendChild(a);const o=a.querySelector("#vol-slider"),l=a.querySelector("#vol-label"),n=()=>{e.textContent=Se(L),e.title="Volumen (V silencia)",o.value=String(L),l.textContent=String(L)};o.addEventListener("input",()=>{Y(Number(o.value)),n()});let r=!1;const s=()=>{r=!0,n(),a.classList.remove("hidden")},i=()=>{r=!1,a.classList.add("hidden")};e.addEventListener("click",u=>{u.stopPropagation(),N()&&(te(),r?i():s())}),document.addEventListener("click",u=>{r&&!a.contains(u.target)&&u.target!==e&&i()});let d=L>0?L:7;window.addEventListener("keydown",u=>{u.code==="KeyV"&&(u.preventDefault(),L>0?(d=L,Y(0)):Y(d),n())}),n()}function ma(e){W=e,!(!t||S===e)&&(S=e,ve(e))}function ve(e){if(!t||!O)return;S=e,A++;const a=A,o=Pe[e],l=t.currentTime;if(K){const c=K;c.gain.gain.cancelScheduledValues(l),c.gain.gain.setValueAtTime(c.gain.gain.value,l),c.gain.gain.linearRampToValueAtTime(0,l+2.2),window.setTimeout(c.stop,2600)}const n=t.createGain();n.gain.setValueAtTime(0,l),n.gain.linearRampToValueAtTime(o.level,l+2.5),n.connect(O);const r=[],s=t.createBiquadFilter();s.type="lowpass",s.frequency.value=o.filter,s.connect(n);const i=t.createOscillator();i.frequency.value=.03;const d=t.createGain();d.gain.value=o.filter*.18,i.connect(d),d.connect(s.frequency),i.start(),r.push(()=>i.stop());const u=[],f=(c,h)=>{if(!t)return;for(const j of u.splice(0))j();const R=t.currentTime;for(const j of c){const y=t.createGain();y.gain.setValueAtTime(0,R),y.gain.linearRampToValueAtTime(.68,R+h),y.connect(s);const G=t.createOscillator();G.frequency.value=.018+Math.random()*.022;const $=t.createGain();$.gain.value=.22,G.connect($),$.connect(y.gain),G.start();const x=t.createOscillator();x.type=o.droneType,x.frequency.value=j,x.connect(y),x.start(),u.push(()=>{if(!t)return;const _=t.currentTime;y.gain.cancelScheduledValues(_),y.gain.setValueAtTime(y.gain.value,_),y.gain.linearRampToValueAtTime(0,_+3.5),window.setTimeout(()=>{try{x.stop(),G.stop()}catch{}y.disconnect()},3800)})}};r.push(()=>{for(const c of u.splice(0))c()}),f(o.chords[0],2.5);let g=0;const q=()=>{window.setTimeout(()=>{if(a!==A||!t)return;if(performance.now()<X){q();return}let c=Math.floor(Math.random()*o.chords.length);c===g&&(c=(c+1)%o.chords.length),g=c,f(o.chords[g],4.5),q()},2e4+Math.random()*2e4)};q();const k=c=>{window.setTimeout(()=>{if(a!==A||!t)return;g!==0&&(g=0,f(o.chords[0],3));const h=Ue(o.theme,n);X=performance.now()+h+2500,k(!1)},c?8e3+Math.random()*6e3:35e3+Math.random()*3e4)};if(k(!0),o.hum){const c=t.createOscillator();c.type="square",c.frequency.value=o.hum;const h=t.createGain();h.gain.value=.04,c.connect(h),h.connect(s),c.start(),r.push(()=>c.stop())}K={gain:n,stop:()=>{for(const c of r)try{c()}catch{}n.disconnect()}},Z(o,n,a),e==="terraces"&&be(a),e==="lighthouse"&&Le(a)}function be(e){e!==A||S!=="terraces"||(b(.022,3.8,"lowpass",1250,{to:520,q:.7}),p(920+Math.random()*380,"sine",.018,.42,{when:.35+Math.random()*1.8,to:620,echo:!0,attack:.03}),window.setTimeout(()=>be(e),3200+Math.random()*1800))}function Le(e){e!==A||S!=="lighthouse"||(b(.018,5.2,"lowpass",720,{to:260,q:.6}),Math.random()<.32&&(b(.055,2.6,"lowpass",150,{when:1.2,to:45,q:1.1}),p(42,"sine",.045,2.8,{when:1.25,to:29,attack:.35})),p(164.81,"sine",.022,1.6,{when:.5+Math.random()*1.4,to:82.41,echo:!0,attack:.25}),window.setTimeout(()=>Le(e),5200+Math.random()*3200))}function Z(e,a,o){const[l,n]=e.phraseGap;window.setTimeout(()=>{if(o!==A||!t)return;if(performance.now()<X){Z(e,a,o);return}const r=1+Math.floor(Math.random()*3),s=Math.random()<.25?.5:1;let i=-1,d=0;for(let u=0;u<r;u++){let f=Math.floor(Math.random()*e.scale.length);f===i&&(f=(f+1)%e.scale.length),i=f,Ie(e.scale[f]*s,e.pluckLevel*(.65+Math.random()*.35),a,d),d+=.32+Math.random()*.55}Z(e,a,o)},l+Math.random()*(n-l))}const Ve={C:0,D:2,E:4,F:5,G:7,A:9,B:11};function le(e){const a=/^([A-G])(#|b)?(\d)$/.exec(e);if(!a)return 440;const o=Ve[a[1]]+(a[2]==="#"?1:a[2]==="b"?-1:0),l=12*(Number(a[3])+1)+o;return 440*Math.pow(2,(l-69)/12)}function Ge(e,a,o,l,n){if(!t)return;const r=l*(.85+Math.random()*.3),s=Math.min(o*1.5,2.6),i=t.createGain();if(i.gain.setValueAtTime(0,a),i.gain.linearRampToValueAtTime(r,a+.012),i.gain.exponentialRampToValueAtTime(1e-4,a+s),i.connect(n),E){const g=t.createGain();g.gain.value=.16,i.connect(g),g.connect(E)}const d=t.createOscillator();d.frequency.value=e,d.connect(i),d.start(a),d.stop(a+s+.1);const u=t.createGain();u.gain.setValueAtTime(0,a),u.gain.linearRampToValueAtTime(r*.18,a+.008),u.gain.exponentialRampToValueAtTime(1e-4,a+.35),u.connect(n);const f=t.createOscillator();f.frequency.value=e*4,f.connect(u),f.start(a),f.stop(a+.45)}function ze(e,a,o,l,n){if(!t)return;const r=t.createGain();r.gain.setValueAtTime(0,a),r.gain.linearRampToValueAtTime(l,a+.06),r.gain.setValueAtTime(l,a+Math.max(o*.6,.1)),r.gain.linearRampToValueAtTime(0,a+o*1.02),r.connect(n);const s=t.createOscillator();s.type="triangle",s.frequency.value=e,s.connect(r),s.start(a),s.stop(a+o*1.05+.1)}function Fe(e,a,o,l){if(!t)return;const n=t.createGain();n.gain.setValueAtTime(0,a),n.gain.linearRampToValueAtTime(o,a+.008),n.gain.exponentialRampToValueAtTime(1e-4,a+.42),n.connect(l);const r=t.createOscillator();r.type="triangle",r.frequency.setValueAtTime(e,a),r.frequency.exponentialRampToValueAtTime(e*.48,a+.38),r.connect(n),r.start(a),r.stop(a+.45)}function Ue(e,a){if(!t)return 0;const o=60/e.tempo,l=t.currentTime+.08;let n=0;for(const[i,d]of e.melody){if(i){const u=(Math.random()-.5)*.018;Ge(le(i),l+n*o+u,d*o,e.melodyLevel,a)}n+=d}let r=0;for(const[i,d]of e.bass)i&&ze(le(i),l+r*o,d*o,e.bassLevel,a),r+=d;let s=0;for(const i of e.percussion??[])Fe(i.freq,l+i.beat*o,i.level,a),s=Math.max(s,i.beat+1);return Math.max(n,r,s)*o*1e3}function Ie(e,a,o,l=0){if(!t)return;const n=t.currentTime+l,r=t.createGain();r.gain.setValueAtTime(0,n),r.gain.linearRampToValueAtTime(a,n+.02),r.gain.exponentialRampToValueAtTime(1e-4,n+2.2),r.connect(o),E&&r.connect(E);const s=t.createOscillator();s.type="triangle",s.frequency.value=e,s.connect(r),s.start(n),s.stop(n+2.3)}function ye(e,a,o=.005,l=0){if(!t||!B)return null;const n=t.currentTime+l,r=t.createGain();return r.gain.setValueAtTime(0,n),r.gain.linearRampToValueAtTime(e,n+o),r.gain.exponentialRampToValueAtTime(1e-4,n+a),r.connect(B),r}function p(e,a,o,l,n={}){if(!t)return;const r=n.when??0,s=ye(o,l,n.attack??.005,r);if(!s)return;n.echo&&E&&s.connect(E);const i=t.currentTime+r,d=t.createOscillator();d.type=a,d.frequency.setValueAtTime(e,i),n.to&&d.frequency.exponentialRampToValueAtTime(n.to,i+l),d.connect(s),d.start(i),d.stop(i+l+.05)}function b(e,a,o,l,n={}){if(!t||!F)return;const r=n.when??0,s=ye(e,a,.005,r);if(!s)return;const i=t.currentTime+r,d=t.createBiquadFilter();d.type=o,d.frequency.setValueAtTime(l,i),n.to&&d.frequency.exponentialRampToValueAtTime(n.to,i+a),d.Q.value=n.q??1,d.connect(s);const u=t.createBufferSource();u.buffer=F,u.loop=!0,u.connect(d),u.start(i),u.stop(i+a+.05)}let Q=!1;function ha(e=1){Q=!Q,b(.07*e,.07,"lowpass",Q?500:640)}function fa(){b(.12,.25,"bandpass",600,{to:250,q:1.5}),p(90,"sine",.14,.18,{when:.08})}function ga(){p(95,"square",.16,.09),p(85,"square",.14,.09,{when:.15})}function Ne(){p(750,"triangle",.05,.05)}function He(){p(880,"sine",.07,.9,{echo:!0}),p(1174.7,"sine",.06,.9,{when:.12,echo:!0})}function $e(){b(.07,.2,"bandpass",400,{to:1400,q:1.2})}function _e(){b(.07,.2,"bandpass",1400,{to:400,q:1.2})}function va(){p(1500,"square",.045,.03)}function ba(){p(2350,"sine",.08,.12),p(1570,"sine",.06,.09,{when:.03})}function Ke(){p(320,"sawtooth",.18,.45,{to:55}),b(.15,.3,"highpass",1e3),b(.08,.05,"bandpass",2600,{when:.32,q:4})}function La(){Ke(),b(.28,1.15,"lowpass",190,{to:55,q:1.2}),p(48,"sine",.2,1.2,{to:32,attack:.02})}function ya(){for(let e=0;e<5;e++)b(.07,.04,"bandpass",2e3+Math.random()*1200,{when:e*.07+Math.random()*.03,q:5})}function Ea(){p(175,"triangle",.1,.7,{to:158})}function qa(){p(587.33,"sine",.08,1.2,{echo:!0}),p(739.99,"sine",.07,1.2,{when:.12,echo:!0}),p(880,"sine",.06,1.2,{when:.24,echo:!0})}function wa(){[293.66,369.99,440,587.33].forEach((a,o)=>p(a,"triangle",.09,1,{when:o*.15,echo:!0}))}function Ta(){for(let e=0;e<4;e++){const a=e*.72;p(72,"square",.17,.13,{when:a,to:48,attack:.002}),b(.12,.18,"lowpass",240,{when:a,to:90,q:1.4}),b(.065,.5,"bandpass",620,{when:a+.12,to:210,q:.8}),p(196,"triangle",.045,.62,{when:a+.08,to:220,attack:.08})}}function Aa(){b(.22,1.6,"lowpass",140),p(49,"sine",.12,1.6,{to:98,attack:.3})}function Ca(){const a=[[1,.16],[2.04,.1],[2.72,.07],[3.76,.05],[5.1,.03]];for(const[o,l]of a)p(293.66*o,"sine",l,3.5+Math.random(),{echo:!0,attack:.002})}function ja(){for(let e=0;e<6;e++)p(900+Math.random()*1300,"sine",.045,.8,{when:e*.09,echo:!0})}function Oa(){for(let a=0;a<3;a++){const o=a*.27;p(880,"square",.14,.18,{when:o,attack:.002}),p(880*1.5,"sine",.07,.12,{when:o+.01}),b(.06,.09,"bandpass",3500,{when:o+.005,q:6})}}const Ye={dormant:"/assets/ohmdal/music/ohmdal-dormant.mp3",awakening:"/assets/ohmdal/music/ohmdal-awakening.mp3",alive:"/assets/ohmdal/music/ohmdal-alive.mp3",taller:"/assets/ohmdal/music/ohmdal-taller.mp3",twilight:"/assets/ohmdal/music/ohmdal-twilight.mp3",manantial:"/assets/ohmdal/music/ohmdal-manantial.mp3"},J=.55;let z=null;function Ma(e,a=2200){return te(),new Promise(o=>{const l=Ye[e],n=new Audio(l);n.preload="auto",n.loop=!0,n.volume=0;const r=()=>{console.warn(`[audio] no se pudo cargar ${l}, se mantiene el procedural.`),o()};n.addEventListener("error",r,{once:!0});const s=performance.now()+60;n.addEventListener("canplay",()=>{if(performance.now()>s+1500)return;n.play().catch(()=>o());const i=20,d=a/i;let u=0;const f=window.setInterval(()=>{if(u+=1,n.volume=Math.min(J,u/i*J),u>=i){if(window.clearInterval(f),z&&z.id!==e){const g=z,q=window.setInterval(()=>{g.audio.volume=Math.max(0,g.audio.volume-J/i),g.audio.volume<=.001&&(window.clearInterval(q),g.audio.pause(),g.audio.src="")},d)}z={audio:n,id:e},o()}},d)})})}const Qe={"edda-awakening-surprise":"/assets/ohmdal/voice/edda-awakening-surprise.mp3","edda-ohm-comes":"/assets/ohmdal/voice/edda-ohm-comes.mp3","edda-realization":"/assets/ohmdal/voice/edda-realization.mp3","edda-warning":"/assets/ohmdal/voice/edda-warning.mp3","edda-startled-short":"/assets/ohmdal/voice/edda-startled-short.mp3","edda-lumen-warning":"/assets/ohmdal/voice/edda-lumen-warning.mp3","edda-warmth-question":"/assets/ohmdal/voice/edda-warmth-question.mp3","lumen-philosophy":"/assets/ohmdal/voice/lumen-philosophy.mp3","lumen-door-opens":"/assets/ohmdal/voice/lumen-door-opens.mp3","ohm-greeting":"/assets/ohmdal/voice/ohm-greeting.mp3","ohm-thermometer":"/assets/ohmdal/voice/ohm-thermometer.mp3","ohm-balde-contable":"/assets/ohmdal/voice/ohm-balde-contable.mp3","preceptor-twenty-years":"/assets/ohmdal/voice/preceptor-twenty-years.mp3"},Je=.75;let w=null;function We(e){te(),w&&(w.pause(),w.src="",w=null);const a=Qe[e],o=new Audio(a);o.volume=Je,o.addEventListener("error",()=>{console.warn(`[audio] línea de voz no encontrada: ${a}`)}),w=o,o.play().catch(()=>{})}function Ee(){w&&(w.pause(),w.src="",w=null)}function ka(){for(let e=0;e<4;e++){const a=e*.04,o=1800+Math.random()*1600;p(o,"sawtooth",.08,.08,{when:a,to:o*.4,attack:.001})}p(95,"square",.18,.32,{to:55,attack:.005}),b(.22,.18,"highpass",2400,{q:1.4})}function Ra(){p(55,"sine",.18,1.4,{to:220,attack:.08}),p(82,"sine",.12,1.4,{to:330,attack:.08,when:.05}),b(.15,.18,"highpass",2800,{when:0,q:2}),p(880,"triangle",.12,.5,{when:.02,to:1320});const e=.5;for(const a of[261.63,329.63,392,523.25])p(a,"sine",.1,1.8,{when:e,echo:!0,attack:.04});b(.06,1.6,"lowpass",220,{when:.7,to:90,q:.6})}function Xe(e){const a=e.toLocaleLowerCase("es");return a?a.includes("edda")?"edda":a.includes("lumen")?"lumen":a.includes("preceptor")?"preceptor":a.includes("consejera")?"consejera":a.includes("guardiana")?"guardiana":a.includes("forjadora")||a.includes("yesca")?"yesca":a.includes("farero")?"farero":a.includes("ohm")?"ohm":a.includes("proyector")?"proyector":a.includes("niño")||a.includes("nino")?"nino":a.includes("ciudadano")?"ciudadano":a.includes("estudiante")||a.includes("protagonista")||a.includes("jugador")?"student":"":""}function m(e,a,o){return{who:e,text:a,voiceId:o}}let U=[],I=0,ee=null,V=!1,ae=0;const Ze={student:new URL(""+new URL("student-portrait-DV_KmZPg.png",import.meta.url).href,import.meta.url).href,edda:new URL(""+new URL("edda-portrait-B4_4xAPT.png",import.meta.url).href,import.meta.url).href,lumen:new URL(""+new URL("lumen-portrait-h0oygViv.png",import.meta.url).href,import.meta.url).href,preceptor:new URL(""+new URL("preceptor-portrait-BrA0o_v3.png",import.meta.url).href,import.meta.url).href,consejera:new URL(""+new URL("consejera-portrait-DbCpcElA.png",import.meta.url).href,import.meta.url).href,guardiana:new URL(""+new URL("guardiana-portrait-DeLFHuuy.png",import.meta.url).href,import.meta.url).href,yesca:new URL(""+new URL("yesca-portrait-DllM-HCH.png",import.meta.url).href,import.meta.url).href,farero:new URL(""+new URL("farero-portrait-vjVpYY1u.png",import.meta.url).href,import.meta.url).href,ohm:new URL(""+new URL("ohm-portrait-KrYpNzej.png",import.meta.url).href,import.meta.url).href,nino:new URL(""+new URL("nino-portrait-ClkOsJPX.png",import.meta.url).href,import.meta.url).href,proyector:new URL(""+new URL("proyector-DLXO_H3y.png",import.meta.url).href,import.meta.url).href,ciudadano:new URL(""+new URL("ciudadano-DXHCMX4H.png",import.meta.url).href,import.meta.url).href};function qe(){Ne();const e=U[I];v("dialog-who").textContent=e.who,v("dialog-who").style.display=e.who?"block":"none",v("dialog-text").textContent=e.text;const a=v("dialog-portrait"),o=Xe(e.who);a.className=o?`portrait-${o}`:"portrait-narrator",a.setAttribute("aria-label",e.who||"Narración");const l=v("dialog-portrait-image");l.src=o?Ze[o]:"",l.alt=o?`Retrato de ${e.who}`:"",o?l.style.imageRendering="auto":l.style.imageRendering="pixelated",e.voiceId?We(e.voiceId):Ee()}function ea(){V=!1,v("dialog").classList.add("hidden"),Ee(),he();const e=ee;ee=null,e==null||e()}function se(){if(!V)return;const e=performance.now();e-ae<250||(ae=e,I++,I>=U.length?ea():qe())}function aa(e,a){if(U=Array.isArray(e)?e:[e],U.length===0){a==null||a();return}I=0,ee=a??null,V||(V=!0,pe()),ae=performance.now(),v("dialog").classList.remove("hidden"),qe()}let ie=!1;function xa(){ie||(ie=!0,v("dialog").addEventListener("click",()=>{N()&&se()}),window.addEventListener("keydown",e=>{V&&(e.code==="Enter"||e.code==="Space"||e.code==="KeyE")&&(e.preventDefault(),se())}))}let ce;function oa(e,a=3200){He();const o=v("toast");o.textContent=e,o.classList.remove("hidden"),window.clearTimeout(ce),ce=window.setTimeout(()=>o.classList.add("hidden"),a)}const oe=[{id:"negro",label:"Negro",digit:0,color:"#171717",ink:"#f4efe4"},{id:"marron",label:"Marrón",digit:1,color:"#7a4b2a",ink:"#fff7e8"},{id:"rojo",label:"Rojo",digit:2,color:"#d63c32",ink:"#fff7ee"},{id:"naranja",label:"Naranja",digit:3,color:"#e87924",ink:"#21160c"},{id:"amarillo",label:"Amarillo",digit:4,color:"#e8c33a",ink:"#211b08"},{id:"verde",label:"Verde",digit:5,color:"#3d9854",ink:"#f4fff5"},{id:"azul",label:"Azul",digit:6,color:"#3978c5",ink:"#f5f8ff"},{id:"violeta",label:"Violeta",digit:7,color:"#7650a5",ink:"#fff7ff"},{id:"gris",label:"Gris",digit:8,color:"#929292",ink:"#171717"},{id:"blanco",label:"Blanco",digit:9,color:"#eee9dc",ink:"#171717"}],na=[{id:"oro",label:"Oro",color:"#b58b18",multiplier:"×0,1",tolerance:"±5%"},{id:"plata",label:"Plata",color:"#b9bcc2",multiplier:"×0,01",tolerance:"±10%"}];function Da(e){return oe[e]}function ta(){const e=oe.slice(0,5).map((o,l)=>{const n=oe[l+5],r=s=>`
      <td><span class="resistor-swatch" style="--swatch:${s.color}" aria-hidden="true"></span>${s.label}</td>
      <td><strong>${s.digit}</strong></td>`;return`<tr>${r(o)}${r(n)}</tr>`}),a=na.map(o=>`<span class="resistor-metal" style="--swatch:${o.color}">
      <i aria-hidden="true"></i><strong>${o.label}</strong>: ${o.multiplier} · ${o.tolerance}
    </span>`).join("");return`
    <table class="resistor-code-table">
      <tr><th>Color</th><th>Cifra</th><th>Color</th><th>Cifra</th></tr>
      ${e.join("")}
    </table>
    <div class="resistor-metal-row">${a}</div>
    <p class="resistor-code-note">Oro y plata no representan cifras: se usan como multiplicador
    o tolerancia. Por eso no son Piedras de Freno numeradas.</p>`}function ra(){const e=M.flags,a=[];return e.hasBitacora&&a.push({id:"hall",title:"El hall del Instituto",fecha:"Primer día",vivencial:`
        <p>Un boceto apurado del hall. Un lugar enorme para tan poca gente.
        Trofeos con polvo. Un cartel de honores con los nombres borrados.</p>
        <p>Este lugar fue importante. ¿Qué pasó?</p>
        <p>El cuaderno se escribió solo cuando lo abrí. La tapa dice
        <em>«Bitácora de Mundos Aplicados»</em>. ¿Qué es un Mundo Aplicado?</p>`,formal:null}),e.plazaSeen&&a.push({id:"vs-plaza-llegada",title:"La Plaza, de noche",fecha:"Ohmdal — la Plaza (HD-2D)",vivencial:`
        <p>El Portal se cerró a mi espalda y la Plaza estaba en silencio. No silencio de
        pueblo dormido: silencio de algo que alguna vez sonó y ya no suena.</p>
        <p>Una campana cuelga de un yugo de cobre. La cuerda está al alcance, pero algo
        dice que todavía no. Edda me mira de costado y dice que las reliquias ya no
        funcionan.</p>
        <p>El pedestal del centro tiene un autómata dormido. Tiene los ojos apagados
        y la forma de quien estuvo despierto mucho tiempo.</p>`,formal:null}),e.plazaSeen&&a.push({id:"vs-plaza-campana",title:"La cuerda que cuelga",fecha:"Ohmdal — la Plaza (HD-2D)",vivencial:`
        <p>La campana tiene cuerda. Nadie la tiró. Los cables que la atan al yugo de
        cobre bajan hasta un cuadro de piedra que no entiendo.</p>
        <p>Lumen me dijo una vez que la campana suena cuando algo está bien. Ahora
        cuelga muda.</p>`,formal:null}),e.plazaSeen&&a.push({id:"vs-plaza-cobre",title:"Canales de cobre que no llevan nada",fecha:"Ohmdal — el Portal (HD-2D)",vivencial:`
        <p>En el dintel del Portal hay canales de cobre labrado. Brillan apagados, como
        cubiertos de polvo. La forma de los canales es la misma que la del cuadro de la
        campana y la del pedestal.</p>
        <p>Todo está conectado a algo. Nada está conectado a todo.</p>`,formal:null}),e.plazaSeen&&a.push({id:"vs-plaza-agua",title:"El agua que no baja",fecha:"Ohmdal — el Manantial (HD-2D)",vivencial:`
        <p>Arriba del Monumento, una compuerta de cobre espera. Detrás se escucha agua,
        pero no baja.</p>
        <p>Hay una inscripción pequeña, gastada: <em>«Manantial»</em>.</p>
        <p>El agua sabe dónde tiene que ir. Algo se lo impide.</p>`,formal:null}),e.plazaObservedComplete&&a.push({id:"vs-plaza-tres-evidencias",title:"Tres evidencias",fecha:"Ohmdal — la Plaza (HD-2D)",vivencial:`
        <p>Miré con tiempo. Tres cosas que faltan: la campana que no suena, los canales
        de cobre que no llevan nada, el agua que no baja.</p>
        <p>Las tres son del mismo metal. Las tres se callaron al mismo tiempo.</p>
        <p>El autómata del pedestal tiene los ojos apagados, pero su forma es la de
        alguien que sabe. Si le devolviera lo que le falta, ¿abriría los ojos?</p>
        <p>Todavía no tengo cómo. Pero la pregunta existe.</p>`,formal:null}),e.ohmAwake&&a.push({id:"camino",title:"El camino completo",fecha:"Ohmdal — la plaza",vivencial:`
        <p>Ohm no despertaba aunque la fuente tenía fuerza. Probé de todo.
        Solo cuando el camino estuvo completo —sin un solo hueco, de la fuente
        a Ohm y de vuelta a la fuente— la chispa corrió y abrió los ojos.</p>
        <p>Un hueco. Uno solo. Y nada se mueve en <em>ninguna</em> parte del camino.</p>`,formal:`
        <p>Para que algo circule, el camino tiene que estar cerrado de punta a punta:
        salir de la fuente, atravesar todo, y <strong>volver</strong>. No alcanza con llegar.</p>
        <p>Si el anillo se corta en cualquier punto, no pasa nada en ningún punto.
        No es que la chispa «llega hasta el corte y espera»: directamente no circula.</p>
        <h4>Error común</h4>
        <p>Pensar la chispa como una flecha que «sale y llega». No: o circula por
        todo el anillo, o no circula nada.</p>
        ${e.puertaDone?`<h4>Nombre verdadero</h4>
             <p>Los Maestros lo llamaban <strong>circuito cerrado</strong>.
             Lo encontré detrás de la Puerta.</p>`:`<p class="blank">Los Maestros tenían un nombre para esto.
             Todavía no lo encontré.</p>`}
        <div class="pregunta">✎ Piensa en tu casa: ¿qué aparato es, en el fondo,
        un «hueco a propósito» en un camino, puesto ahí para abrirlo y cerrarlo a voluntad?</div>`}),e.frenoDone&&a.push({id:"freno",title:"La Piedra de Freno",fecha:"Ohmdal — taller de Maese Lumen",vivencial:`
        <p>La Lámpara Eterna de Lumen escupía chispas: tenía puesta una piedra rajada,
        casi sin cuerpo. Demasiado río junto.</p>
        <p>La piedra gris (la que más frena) la dejaba viva pero tristona.
        La amarilla la dejó firme y tibia. Más piedra, menos río.
        Menos piedra, más río… hasta que algo se quema.</p>`,formal:`
        <p>Toda piedra frena el paso del río. Y el freno <strong>no es el enemigo</strong>:
        sin freno suficiente, el río arrasa con lo que toca. El freno dosifica.</p>
        <h4>El código de colores</h4>
        <p>Las piedras llevan una marca de color: <strong>marrón</strong> frena poco,
        <strong>roja</strong> un poco más, <strong>amarilla</strong> bastante,
        <strong>gris</strong> mucho. Lumen lo llama «el código de los Maestros».
        Hay un orden ahí. No es decoración.</p>
        ${e.puertaDone?`<h4>Nombre verdadero</h4>
             <p>La piedra es una <strong>resistencia (R)</strong>. Y el código de colores
             de los Maestros existe de verdad fuera de Ohmdal: las resistencias reales se
             marcan con bandas de color. El código completo va del 0 al 9:</p>
             ${ta()}
             <p>Por eso la marrón (1) frenaba poco y la gris (8) frenaba mucho.</p>`:`<p class="blank">¿Por qué justo esos colores? ¿Qué cifra esconde cada uno?
             Falta una pieza.</p>`}
        <h4>Error común</h4>
        ${e.burnedSomething?`<p>Lo comprobé con humo: poca piedra no significa «más potencia útil».
             Significa exceso. Y el exceso rompe.</p>`:`<p class="blank">(Aquí hay dibujada una mancha de humo, pero a mí no se me
             quemó nada todavía. ¿Qué pasa si pongo la piedra que MENOS frena y bajo
             la palanca? …No lo probé.)</p>`}
        <div class="pregunta">✎ ¿Qué piedra dejaría pasar exactamente la mitad de río
        que la amarilla? Las marcas de color dan la pista.</div>`}),e.puertaDone&&a.push({id:"ley-de-ohm",title:"La Ley de Ohm",fecha:"Ohmdal — la Puerta",vivencial:`
        <p>La Puerta no quería fuerza: quería <em>medida</em>. Empuje fuerte con freno
        fuerte. Empuje suave con freno suave. Pares distintos, el mismo río.</p>
        <p>Solo se abrió cuando el caudal fue el justo. Ni hambrienta ni ahogada.</p>
        <p>Y entonces la Bitácora ardió, y escribió esto sola:</p>`,formal:`
        <p>El río crece con el empuje y baja con el freno. Esa relación tiene nombre
        y forma exacta:</p>
        <div class="formula">I&nbsp;=&nbsp;V&nbsp;/&nbsp;R</div>
        <h4>Los nombres verdaderos</h4>
        <table>
          <tr><th>En Ohmdal</th><th>Nombre verdadero</th><th>Unidad</th></tr>
          <tr><td>El Empuje</td><td>Tensión (V)</td><td>volts (V)</td></tr>
          <tr><td>El Río / la Chispa</td><td>Corriente (I)</td><td>amperes (A)</td></tr>
          <tr><td>La Piedra de Freno</td><td>Resistencia (R)</td><td>ohms (Ω)</td></tr>
          <tr><td>El camino completo</td><td>Circuito cerrado</td><td>—</td></tr>
        </table>
        <p><em>Ω… como Ohm. El guardián se llama como la unidad.
        ¿O la unidad como el guardián?</em></p>
        <h4>Por qué la Puerta aceptó varias llaves</h4>
        <p>Empuje 16 con piedra gris (8): 16 / 8 = 2.<br/>
        Empuje 8 con piedra amarilla (4): 8 / 4 = 2.<br/>
        Empuje 4 con piedra roja (2): 4 / 2 = 2.<br/>
        Tres pares distintos, el mismo río. La Puerta no medía el empuje ni la piedra:
        medía <strong>la relación entre los dos</strong>.</p>
        <h4>Errores comunes</h4>
        <p>· Creer que más empuje siempre da más luz útil. No: sin freno suficiente, rompe.<br/>
        · Creer que el freno «gasta» el río para mal. No: lo dosifica para que sirva.</p>
        <div class="pregunta">✎ Si el Empuje se duplica y la Piedra también se duplica,
        ¿el Río cambia? Vuelve a la Puerta y pruébalo. La Puerta no se ofende.</div>`}),e.solvedBellPaths&&a.push({id:"dos-caminos",title:"Dos caminos",fecha:"Ohmdal — la plaza",vivencial:`
        <p>Medición de la campana: medio río y medio río; el tronco lleva todo;
        un camino abierto no pierde su río — se muda al hermano.</p>
        <p>Los Maestros duplicaban caminos como promesa, no como gasto.</p>`,formal:`
        ${e.learnedSeriesParallel?`<h4>Nombre verdadero</h4>
             <p>En un cruce, la corriente se reparte entre los caminos; la suma de
             lo que sale es igual a lo que entra.</p>
             <h4>Error común</h4>
             <p>Creer que la corriente «se gasta» al repartirse.</p>`:`<p class="blank">Los Maestros tenían un nombre para esto.
             Todavía no lo encontré.</p>`}`}),e.solvedGalleryChain&&a.push({id:"la-cadena",title:"La Cadena",fecha:"Ohmdal — el Castillo",vivencial:`
        <p>Todas las lámparas igual de tenues; quitar una mata todas;
        Ohm midió el mismo río en cada punto de la fila.</p>`,formal:`
        ${e.learnedSeriesParallel?`<h4>Nombre verdadero</h4>
             <p>Eso se llama <strong>circuito en serie</strong>: un solo camino,
             una sola corriente, y las resistencias <strong>se suman</strong>.</p>
             <p>Las lámparas en serie no se reparten corriente: la comparten entera,
             frenándola entre todas.</p>
             <h4>Error común</h4>
             <p>«La primera lámpara brilla más» — no: en serie no hay primera ni
             última para el río.</p>
             <div class="pregunta">✎ ¿Las luces de tu casa estarán en fila?
             Pista: ¿qué pasa cuando se quema una sola?</div>`:`<p class="blank">Los Maestros tenían un nombre para esto.
             Todavía no lo encontré.</p>`}`}),e.solvedBranches&&a.push({id:"los-ramales",title:"Los Ramales",fecha:"Ohmdal — el Castillo",vivencial:`
        <p>Cada rama cobró según su piedra; conectar una rama no cambió a las otras;
        el Tronco pagó la suma${e.burnedTrunkFuse?" y el Fusible mayor se inmoló cuando pedimos de más.":"."}</p>`,formal:`
        ${e.learnedSeriesParallel?`<h4>Nombre verdadero</h4>
             <p>Eso se llama <strong>circuito en paralelo</strong>: cada rama recibe
             el mismo Empuje y toma su propia corriente
             (<strong>I = V/R</strong>, ¡la de la Puerta!, una vez por rama).
             La fuente entrega la suma.</p>
             <h4>Error común</h4>
             ${e.burnedTrunkFuse?`<p>«Agregar ramas es gratis» — cada rama nueva es corriente nueva
                  que el Tronco debe poder llevar. El Fusible mayor se inmoló cuando
                  pedimos de más.</p>`:`<p class="blank">(Aquí hay dibujado el Fusible mayor, pero todavía
                  no se inmoló. ¿Qué pasa si conecto las tres ramas con piedras
                  glotonas, marrón en todas, en modo práctica? …No lo probé.)</p>`}`:`<p class="blank">Los Maestros tenían un nombre para esto.
             Todavía no lo encontré.</p>`}`}),e.learnedSeriesParallel&&a.push({id:"regla-del-cruce",title:"La Regla del Cruce",fecha:"Ohmdal — el Castillo",vivencial:`
        <p><strong>El río no se gasta. Se reparte.</strong><br/>
        Lo que entra en un cruce, sale del cruce.</p>
        <p>Con la red del Repartidor dibujada y las dos soluciones equivalentes
        anotadas.</p>`,formal:`
        <h4>Los nombres verdaderos</h4>
        <table>
          <tr><th>En Ohmdal</th><th>Nombre verdadero</th></tr>
          <tr><td>La Cadena</td><td><strong>serie</strong></td></tr>
          <tr><td>Los Ramales</td><td><strong>paralelo</strong></td></tr>
          <tr><td>El Cruce</td><td><strong>nodo</strong></td></tr>
        </table>
        <p><em>Mucho después, alguien le puso su apellido a la regla del cruce:
        Kirchhoff. Pero el cruce ya la sabía.</em></p>
        <div class="pregunta">✎ El timbre de la escuela tiene dos caminos.
        ¿Para qué, ahora que lo sabes?</div>`}),e.sawStoredSpark&&a.push({id:"anomalia-chispa",title:"Anomalía: la chispa que se queda",fecha:"Ohmdal — el Corazón del Castillo",vivencial:`
        <p>Se cortó el Tronco para el acta. El Repartidor quedó sin camino.</p>
        <p>Un mecanismo auxiliar del tablero siguió brillando tres segundos, solo,
        sin camino.</p>
        <p>Edda lo vio. Yo lo vi. La Consejera decidió no anotarlo.</p>
        <p class="blank">No tengo explicación. Solo el registro del hecho.</p>`,formal:null}),e.solvedWarmChannel&&a.push({id:"el-peaje",title:"El peaje",fecha:"La Forja — el patio",vivencial:`
        <p>Ohm apoyó la mano en los canales y reportó el calor de cada uno.</p>
        <p>El mismo río por un canal ancho: frío. Por uno angosto: al rojo.
        El río no cambió — cambió el cauce.</p>
        <p>El canal viejo, sin río, estaba helado. Cien años y helado.
        Así que no es la edad.</p>
        <p>Al duplicar el río del yunque, el termómetro saltó de tibio a al rojo
        de un golpe, sin pasar por caliente. Dos niveles de un salto.</p>`,formal:e.learnedPower?`
        <h4>El efecto Joule</h4>
        <p>El calor que cobra el canal crece mucho más rápido que el río:
        «el doble de río, cuatro veces el peaje» — medido, no formulado.
        No es fantasma ni vejez: es el precio del paso.</p>
        <h4>Error común</h4>
        <p>«El calor es porque el cable está viejo.» El canal nuevo con río grande
        calienta igual: el peaje depende del río y del cauce, no de la edad.</p>`:`<p class="blank">La Bitácora tiene espacio para el nombre de esto.
           Todavía no llegó.</p>`}),e.solvedFuseInfirmary&&a.push({id:"martir-margen",title:"El mártir y el margen",fecha:"La Forja — enfermería de fusibles",vivencial:`
        <p>El fusible justo muere al arrancar: el pico de arranque lo supera,
        y se va antes de que la máquina empiece a trabajar.</p>
        <p>El fusible demasiado gordo no salta nunca — y deja morir al canal.
        El canal cuesta una semana. El fusible, un cobre.</p>
        <p>Lumen lo resumió: un mártir por año es santidad. Uno por semana es
        mal cálculo. La respuesta era margen: elegir el margen.</p>
        ${e.burnedChannelDemo?`<h4>El canal cortado</h4>
             <p>Vi el canal cortarse cuando el fusible gordo no lo protegió.
             Yesca lo reemplazó. Entendí por qué el gordo no era un santo:
             era un cómplice.</p>`:`<p class="blank">(Hay un espacio en blanco aquí. La demo del fusible
             gordo se puede revisar en modo práctica en la enfermería.)</p>`}`,formal:e.learnedPower?`
        <h4>El fusible y el margen</h4>
        <p>El fusible correcto es el menor calibre que el pico de arranque no supera,
        y que salte antes de que el canal llegue al rojo. Con margen sobre el pico
        y por debajo de lo que aguanta el canal.</p>
        <h4>Error común</h4>
        <p>«Más grande aguanta más.» Un fusible que no puede morir no protege nada:
        deja morir a lo que está detrás.</p>`:`<p class="blank">Los Maestros tenían un nombre para esto.
           Todavía no llegó.</p>`}),e.solvedLongChannel&&a.push({id:"la-entrega",title:"La Entrega",fecha:"La Forja — el Canal Largo",vivencial:`
        <p>El horno lejano pedía entrega 16. Con río 4 por el canal angosto,
        la entrega llegaba — pero el canal se ponía al rojo.</p>
        <p>Con mucho empuje y poco río, la misma entrega 16 llegaba al horno
        y el canal quedaba frío. O tibio, al límite justo.
        El horno no distinguía. El canal, sí.</p>
        <p>Yesca apoyó la mano en el canal y la dejó ahí:
        «El río no se gasta. El río trabaja. Y el trabajo se paga.
        …Por fin alguien que lo dice con números.»</p>`,formal:e.learnedPower?`
        <h4>Potencia = empuje × río (P = V·I)</h4>
        <p>Lo que llega al horno no es río: es empuje multiplicado por río.
        El vatio es la unidad de esa entrega. La misma entrega puede viajar
        con poco río y mucho empuje — y el canal agradece el río pequeño.</p>
        <div class="pregunta">✎ ¿Por qué los cables que cruzan el campo van
        tan alto y con tanto empuje?</div>`:`<p class="blank">La Bitácora tiene espacio para el nombre de esto.
           Todavía no llegó.</p>`}),e.learnedPower&&a.push({id:"el-jornal",title:"El Jornal",fecha:"La Forja — nave mayor",vivencial:`
        <p>La Forja cantó. Los tres ritmos se trabaron en un compás: el Martillo marcaba,
        el Fuelle respiraba, la Lumbre sostenía.</p>
        <p>La Consejera abrió un libro nuevo, flamante, y leyó los números del inventario
        en voz alta. La Bitácora ardió y se abrió sola.</p>`,formal:`
        <h4>Energía = potencia × tiempo</h4>
        <p>La Consejera abrió su libro y leyó el inventario de la Forja encendida:</p>
        <table>
          <tr><th>Máquina</th><th>Jornales por hora</th></tr>
          <tr><td>Martillo</td><td>32</td></tr>
          <tr><td>Fuelle</td><td>16</td></tr>
          <tr><td>Lumbre</td><td>8</td></tr>
          <tr><td><strong>Total</strong></td><td><strong>56</strong></td></tr>
        </table>
        <p>Y luego, del libro viejo: los lacres ceremoniales del Consejo consumían
        9 jornales por hora. La biblioteca, 8.
        Cuarenta años lacrando puertas con más entrega de la que ahorraban al lacrarlas.</p>
        <p><em>Mucho después, a la entrega le pusieron Watt, y al jornal, joule.
        El peaje también se llama joule. No es casualidad: es la misma moneda.</em></p>
        <div class="pregunta">✎ Busca en tu casa un aparato que diga "W".
        Ese número es su hambre.</div>`}),e.solvedVoltageSteps&&a.push({id:"los-escalones",title:"Los escalones",fecha:"Las Terrazas — el canal alto",vivencial:`
        <p>El empuje cae piedra a piedra, por escalones. La vuelta completa siempre
        cierra en cero: todo lo que sube, baja.</p>
        <p>El río, en cambio, es el mismo en toda la fila.</p>`,formal:e.learnedKVL?`
        <h4>La Regla de la Vuelta</h4>
        <p>La ley de tensiones de Kirchhoff (KVL) dice que, en toda vuelta cerrada,
        las subidas y bajadas de tensión se cancelan.</p>
        <p><em>El mismo apellido de la regla del cruce. Kirchhoff tenía dos reglas
        y ningún apuro.</em></p>
        <h4>Error común</h4>
        <p>Confundir empuje con río: el empuje cae por escalones; el río, en una fila, no.</p>`:`<p class="blank">La Bitácora tiene espacio para el nombre de esta regla.
           Todavía no llegó.</p>`}),e.solvedFairSplit&&a.push({id:"reparto-empuje",title:"El reparto del empuje",fecha:"Las Terrazas — el reparto",vivencial:`
        <p>Dos terrazas, una proporción 2:1 y más de una solución.</p>
        <p>Las dos soluciones que probé repartían el mismo empuje: la de piedras
        grandes pedía menos río al manantial.</p>`,formal:e.learnedKVL?`
        <h4>Divisor de tensión</h4>
        <p>Cada resistencia cobra tensión en proporción a su freno.</p>
        <h4>Error común</h4>
        <p>Creer que «la piedra grande aguanta y la chica sufre»: cobran
        proporcionalmente; ninguna sufre.</p>`:`<p class="blank">La Bitácora tiene espacio para el nombre de este reparto.
           Todavía no llegó.</p>`}),e.solvedSingleStone&&a.push({id:"la-piedra-unica",title:"La Piedra Única",fecha:"Las Terrazas — el mural de los Maestros",vivencial:`
        <p>Una red entera puede esconderse dentro de una piedra. Ohm midió los dos
        lados y no pudo distinguir la red de la Piedra Única.</p>`,formal:e.learnedKVL?`
        <h4>Resistencia equivalente</h4>
        <p>Una red puede reemplazarse por una resistencia equivalente. En fila,
        las resistencias se suman; dos resistencias iguales en paralelo equivalen
        a la mitad de una.</p>
        <div class="pregunta">✎ Si toda red puede ser una sola piedra...
        ¿qué piedra es tu casa entera, vista desde el medidor de la entrada?</div>`:`<p class="blank">La Bitácora tiene espacio para el nombre de la Piedra Única.
           Todavía no llegó.</p>`}),e.learnedKVL&&a.push({id:"la-escalera",title:"La Escalera",fecha:"Las Terrazas — el acueducto del valle",vivencial:`
        <p>Plegué la Escalera etapa por etapa, desde el fondo, hasta mirar el valle
        entero como una sola piedra.</p>
        <p>La Bitácora estrenó una página de predicción: lo esperado, lo medido
        y la palabra <strong>IGUALES</strong>.</p>`,formal:`
        <h4>El método de plegado</h4>
        <p>Desde la última etapa, cada tramo y cada ramal se reemplazan por su
        resistencia equivalente. El resultado se vuelve a plegar hasta obtener
        una sola resistencia para toda la red.</p>
        <p>Hoy la Bitácora dejó de ser un diario. Ahora también es un mapa de lo
        que va a pasar.</p>
        <div class="pregunta">✎ Antes de enchufar algo nuevo en tu casa, ¿podrías
        decir si la llave va a saltar? Esa pregunta ya es ingeniería.</div>`}),e.solvedStoredSpark&&a.push({id:"la-chispa-que-se-queda",title:"La chispa que se queda",fecha:"El Faro — sala de la máquina",vivencial:`
        <p>El Estanque, ya lleno, brilló sin camino. No era una regla rota:
        lo guardado se devuelve.</p>
        <p>Primero dejó pasar el río. Después, cuando estuvo lleno, se volvió
        una pared que recuerda.</p>`,formal:e.learnedCapacitor?`
        <h4>El capacitor</h4>
        <p>El Estanque es un <strong>capacitor</strong>: un almacén de carga.</p>
        <h4>Error común</h4>
        <p>«El capacitor deja pasar el río.» Pasa mientras se llena; lleno,
        es una pared que recuerda.</p>`:`<p class="blank">La Bitácora tiene espacio para el nombre verdadero
           del Estanque. Todavía no llegó.</p>`}),e.solvedSleepingRiver&&a.push({id:"el-rio-que-se-duerme",title:"El río que se duerme",fecha:"El Faro — taller del Farero",vivencial:`
        <p>La aguja murió sola mientras el Estanque se llenaba.</p>
        <p>El Estanque grande y el canal angosto tardaron más. El chico y el
        canal ancho, casi nada. La espera también se puede elegir.</p>`,formal:e.learnedCapacitor?`
        <p>La <strong>carga no es instantánea</strong>: el tiempo de llenado
        crece con el tamaño del Estanque y con el freno del canal.</p>
        <div class="pregunta">✎ ¿Qué se llena despacio y se vuelca de golpe
        en tu casa? Pista: hay una en el baño.</div>`:`<p class="blank">La Bitácora espera el nombre verdadero de esta
           demora. Todavía no llegó.</p>`}),e.solvedClock&&a.push({id:"el-tic",title:"El tic",fecha:"Ohmdal — Torre del Reloj",vivencial:`
        <p>El Reloj aceptó tres soluciones distintas: Estanque chico con freno
        grande, mediano con mediano, grande con chico.</p>
        <p>Otro Estanque. El mismo tiempo. Tres caminos para un tic justo.</p>`,formal:e.learnedCapacitor?`
        <p><strong>Llenado + umbral = ritmo.</strong> Elegir Estanque y freno
        es elegir el tiempo.</p>
        <p><em>Mucho después lo llamaron circuito RC. La R y la C son la piedra
        y el estanque. El tiempo siempre fue de ellos.</em></p>`:`<p class="blank">La Bitácora dejó un margen para el nombre de este
           ritmo. Todavía no llegó.</p>`}),e.learnedCapacitor&&a.push({id:"el-arco-del-rio",title:"El Arco del Río",fecha:"Ohmdal — la noche completa",vivencial:`
        <p>El mapa de Ohmdal está completo: la plaza con su campana, el Castillo
        con sus tres distritos, la Forja en ritmo, las Terrazas regadas, el Reloj
        marcando y el Faro latiendo sobre el lago.</p>
        <p>Cinco restauraciones. Cinco lecciones. Una sola red viva en el tiempo.</p>`,formal:e.learnedCapacitor?`
        <h4>Las cinco reglas del Arco del Río</h4>
        <ol>
          <li><strong>La Ley de Ohm:</strong> el río crece con el empuje y baja
          con el freno.</li>
          <li><strong>La Regla del Cruce:</strong> el río no se gasta; se reparte.
          Lo que entra en un cruce, sale.</li>
          <li><strong>La Entrega:</strong> el trabajo que llega es empuje por río,
          y el paso cobra su peaje.</li>
          <li><strong>La Regla de la Vuelta:</strong> en una vuelta completa,
          todo lo que sube, baja.</li>
          <li><strong>La Chispa que se queda:</strong> puede guardarse, esperar
          y volver cuando el camino la necesita.</li>
        </ol>
        <p><strong>El río ya no es un misterio. Ahora es una herramienta.
        Lo que sigue no es más río: es enseñarle a decidir.</strong></p>
        <div class="pregunta">✎ <strong>El ojo de cristal</strong><br/><br/>
        <span class="blank">Esta página está en blanco.</span></div>`:'<p class="blank">Las reglas esperan su nombre verdadero.</p>'}),a}let C=!1;const we=new Set;function la(){v("bitacora-btn").classList.remove("hidden")}function Ba(e){la(),v("bitacora-dot").classList.remove("hidden"),oa(`✒ La Bitácora se escribió sola: «${e}»`)}function de(e){var k;if(C)return;C=!0,e&&we.add(e),pe(),$e(),v("bitacora-dot").classList.add("hidden");const a=v("bitacora");a.classList.remove("hidden"),a.innerHTML="";const o=document.createElement("button");o.className="bita-close",o.textContent="✕",o.addEventListener("click",P),a.appendChild(o);const l=document.createElement("div");l.className="bita-book",a.appendChild(l);const n=document.createElement("div");n.className="bita-index",n.innerHTML="<h3>Bitácora</h3>",l.appendChild(n);const r=document.createElement("div");r.className="bita-content",l.appendChild(r);const s=ra();let i=e??((k=s[s.length-1])==null?void 0:k.id);const d=[],u=()=>{const c=s.find(h=>h.id===i);if(!c){r.innerHTML='<p style="font-style:italic">Páginas en blanco.</p>';return}r.innerHTML=`
      <h2>${c.title}</h2>
      <div class="fecha">${c.fecha}</div>
      <div class="bita-viv"><span class="viv-tag">Lo que viví</span>${c.vivencial}</div>
      ${c.formal?`<div class="bita-formal"><span class="formal-tag">Lo que entiendo ahora</span>${c.formal}</div>`:""}`,r.scrollTop=0,n.querySelectorAll("button").forEach(h=>{h.classList.toggle("active",h.dataset.id===i)})};for(const c of s){const h=document.createElement("button");h.textContent=c.title,h.dataset.id=c.id,h.addEventListener("click",()=>{i=c.id,u()}),d.push(h),n.appendChild(h)}const f=document.createElement("div");f.className="blank-note",f.textContent=s.length===0?"Todas las páginas están en blanco. Por ahora.":"El resto de las páginas espera en blanco.",n.appendChild(f);const g=document.createElement("div");g.className="bita-footer";const q=document.createElement("button");q.textContent="Reiniciar demo",q.addEventListener("click",()=>{confirm("¿Borrar el progreso y empezar de nuevo?")&&(Te(),location.reload())}),g.appendChild(q),n.appendChild(g),u(),requestAnimationFrame(()=>{(d.find(c=>c.dataset.id===i)??o).focus()}),a.addEventListener("keydown",c=>{if(c.key==="Escape"){c.preventDefault(),P();return}const h=c.code==="ArrowUp"||c.code==="KeyW"?-1:c.code==="ArrowDown"||c.code==="KeyS"?1:0;if(h&&d.length>0){c.preventDefault();const R=d.indexOf(document.activeElement),j=R<0?0:(R+h+d.length)%d.length;d[j].focus(),d[j].click();return}c.code==="KeyE"&&document.activeElement instanceof HTMLButtonElement&&(c.preventDefault(),document.activeElement.click())})}function Pa(e){return we.has(e)}function P(){C&&(C=!1,_e(),v("bitacora").classList.add("hidden"),v("bitacora").innerHTML="",he())}function Sa(){v("bitacora-btn").addEventListener("click",()=>{N()&&(C?P():de())}),window.addEventListener("keydown",e=>{e.code==="Escape"&&C&&P(),e.code==="KeyB"&&M.flags.hasBitacora&&(C?P():ne()||de())})}const sa=new URL(""+new URL("ohm-Cxo6wGML.png",import.meta.url).href,import.meta.url).href;function ia(e,a){const o=e.salasVisitadas;return!e.metLumen||!e.frenoDone?[m("Ohm","Ruta recomendada: este. Taller de Lumen."),m("Ohm","Probabilidad de que Lumen finja no estar sorprendido: baja.")]:e.puertaDone?o.includes("manantial_ohm")?e.finished?e.playedUnit2Intro?e.solvedBellPaths?e.enteredCastle?e.solvedGalleryChain?e.solvedBranches?e.solvedDistributor?e.unit2Completed?e.unit3Completed?e.unit4Completed?e.unit5Completed?[m("Ohm","Red estable. Compañía activa. Si aparece otra duda, consultar de nuevo.")]:[m("Ohm","Queda una luz remota junto al lago. Destino: Faro de Ohmdal.")]:[m("Ohm","La siguiente anomalía está en las Terrazas, por el arco sur de la plaza.")]:[m("Ohm","Lectura actual: calor en los canales. Ruta recomendada: Forja, al oeste de la plaza.")]:[m("Ohm","La red funciona. Falta registrar lo aprendido y revisar el timbre del Instituto.")]:[m("Ohm","El corazón del Castillo sigue aislado. Buscar el distribuidor.")]:[m("Ohm","Siguiente sala: Cámara de Ramas. Dos caminos no implican dos caudales iguales.")]:[m("Ohm","Circuito incompleto en la Galería. Seguir la cadena sin dejar huecos.")]:[m("Ohm","El Consejo abrió una ruta nueva: portón oeste de la plaza."),m("Ohm","Destino: Castillo de Ohmdal.")]:[m("Ohm","La Campana recibe dos caminos. No asumir: medir ambos."),m("Ohm","Destino: centro de la plaza.")]:[m("Ohm","La nota cruzó el portal. El proyector del Instituto respondió."),m("Ohm","Ruta recomendada: regresar al aula.")]:[m("Ohm",a==="manantial_ohm"?"El caudal alcanza un mecanismo todavía mudo: la Campana de la plaza.":"Destino pendiente: Campana de Ohmdal, centro de la plaza."),m("Ohm","Hipótesis: ahora responderá.")]:[m("Ohm","La Puerta está abierta. El origen del caudal espera detrás."),m("Ohm","Recomendación: cruzar el arco norte y subir al Manantial.")]:[m("Ohm","Siguiente interrupción detectada: Puerta de Ohm."),m("Ohm","Ruta: plaza, arco norte. Llevar la piedra justa.")]}function Va(){v("ohm-companion-btn").classList.toggle("hidden",!M.flags.ohmAwake)}function ue(){!M.flags.ohmAwake||ne()||aa(ia(M.flags,M.room))}function Ga(){const e=v("ohm-companion-btn");v("ohm-companion-portrait").src=sa,e.addEventListener("click",()=>{N()&&ue()}),window.addEventListener("keydown",a=>{a.code!=="KeyO"||a.repeat||ne()||(a.preventDefault(),ue())})}export{Ca as A,La as B,Oa as C,Ta as D,ja as E,ka as F,aa as G,de as H,Ba as I,ra as J,Pa as K,m as L,je as M,ua as N,ha as O,N as P,ga as Q,oe as R,fa as S,Sa as a,pa as b,Ga as c,te as d,v as e,Va as f,Ra as g,ma as h,xa as i,da as j,pe as k,$e as l,_e as m,he as n,va as o,Ma as p,Ea as q,Da as r,la as s,ba as t,ne as u,wa as v,Ke as w,ya as x,qa as y,Aa as z};
