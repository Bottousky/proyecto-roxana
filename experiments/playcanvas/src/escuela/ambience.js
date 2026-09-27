// The sound of the Instituto, synthesised: wind over the island, birds by day,
// crickets at night, the fountain once the water returns and the Portal's hum in the
// Taller. Nothing plays until the student turns sound on.
export class Ambience {
  constructor(){this.ctx=null;this.on=false;this.hour='tarde';this.stage=0;this.room=null;this.timers=[];}
  start(){
    if(this.ctx){this.ctx.resume();this.on=true;this.fade(this.master,1,.8);return;}
    const ctx=this.ctx=new (window.AudioContext||window.webkitAudioContext)();this.on=true;
    this.master=ctx.createGain();this.master.gain.value=0;this.master.connect(ctx.destination);this.fade(this.master,1,1.2);
    const noise=(color='white')=>{const len=ctx.sampleRate*2,b=ctx.createBuffer(1,len,ctx.sampleRate),d=b.getChannelData(0);let last=0;for(let i=0;i<len;i++){const w=Math.random()*2-1;if(color==='brown'){last=(last+.02*w)/1.02;d[i]=last*3.5;}else d[i]=w;}const s=ctx.createBufferSource();s.buffer=b;s.loop=true;s.start();return s;};
    // Wind: brown noise through a slowly breathing low-pass.
    const wind=noise('brown'),lp=ctx.createBiquadFilter();lp.type='lowpass';lp.frequency.value=380;this.wind=ctx.createGain();this.wind.gain.value=.16;
    const lfo=ctx.createOscillator(),lfoGain=ctx.createGain();lfo.frequency.value=.07;lfoGain.gain.value=160;lfo.connect(lfoGain).connect(lp.frequency);lfo.start();
    wind.connect(lp).connect(this.wind).connect(this.master);
    // Fountain: a band of white noise.
    const water=noise(),bp=ctx.createBiquadFilter();bp.type='bandpass';bp.frequency.value=1400;bp.Q.value=.6;this.water=ctx.createGain();this.water.gain.value=0;water.connect(bp).connect(this.water).connect(this.master);
    // Portal: two low tones with a slow tremolo.
    this.portal=ctx.createGain();this.portal.gain.value=0;this.portal.connect(this.master);
    for(const [f,g] of [[55,.5],[110.4,.25],[164.8,.12]]){const o=ctx.createOscillator(),og=ctx.createGain();o.frequency.value=f;og.gain.value=g;o.connect(og).connect(this.portal);o.start();}
    const trem=ctx.createOscillator(),tg=ctx.createGain();trem.frequency.value=.4;tg.gain.value=.3;trem.connect(tg).connect(this.portal.gain);trem.start();
    this.schedule();this.update();
  }
  stop(){this.on=false;if(this.master)this.fade(this.master,0,.5);clearTimeout(this.timer);}
  fade(node,value,time){const t=this.ctx.currentTime;node.gain.cancelScheduledValues(t);node.gain.setValueAtTime(node.gain.value,t);node.gain.linearRampToValueAtTime(value,t+time);}
  set({hour=this.hour,stage=this.stage,room=this.room}={}){this.hour=hour;this.stage=stage;this.room=room;if(this.ctx&&this.on)this.update();}
  update(){
    this.fade(this.water,this.stage>=4?(this.room==='patio'?.09:.035):0,1.5);
    this.fade(this.portal,this.room==='taller'?.05:this.room==='dormant'?.018:0,1.2);
    this.fade(this.wind,this.hour==='noche'?.1:.16,2);
  }
  // Birds by day, crickets by night: small voices at random intervals.
  schedule(){
    clearTimeout(this.timer);if(!this.on)return;
    const night=this.hour==='noche';night?this.cricket():this.bird();
    this.timer=setTimeout(()=>this.schedule(),(night?900:1800)+Math.random()*(night?1600:4200));
  }
  voice(pan){const g=this.ctx.createGain(),p=this.ctx.createStereoPanner();p.pan.value=pan;g.connect(p).connect(this.master);return g;}
  bird(){
    const ctx=this.ctx,t=ctx.currentTime,g=this.voice(Math.random()*1.6-.8),notes=2+Math.floor(Math.random()*4),base=2300+Math.random()*1600;
    for(let i=0;i<notes;i++){const o=ctx.createOscillator(),e=ctx.createGain(),s=t+i*.13;o.type='sine';o.frequency.setValueAtTime(base*(1+Math.random()*.2),s);o.frequency.exponentialRampToValueAtTime(base*(1.25+Math.random()*.4),s+.08);
      e.gain.setValueAtTime(0,s);e.gain.linearRampToValueAtTime(.035,s+.015);e.gain.exponentialRampToValueAtTime(.0001,s+.11);o.connect(e).connect(g);o.start(s);o.stop(s+.12);}
  }
  cricket(){
    const ctx=this.ctx,t=ctx.currentTime,g=this.voice(Math.random()*1.8-.9);
    for(let i=0;i<3;i++){const o=ctx.createOscillator(),e=ctx.createGain(),s=t+i*.09;o.frequency.value=4300+Math.random()*200;e.gain.setValueAtTime(0,s);e.gain.linearRampToValueAtTime(.012,s+.01);e.gain.linearRampToValueAtTime(0,s+.06);o.connect(e).connect(g);o.start(s);o.stop(s+.07);}
  }
  /** Interface: a soft tick on hover, a small bell when a room opens. */
  tick(){if(!this.on)return;const ctx=this.ctx,t=ctx.currentTime,o=ctx.createOscillator(),e=ctx.createGain();o.frequency.value=1900;e.gain.setValueAtTime(.018,t);e.gain.exponentialRampToValueAtTime(.0001,t+.05);o.connect(e).connect(this.master);o.start(t);o.stop(t+.06);}
  chime(notes=[659.3,987.8,1318.5]){
    if(!this.on)return;const ctx=this.ctx,t=ctx.currentTime;
    notes.forEach((f,i)=>{const o=ctx.createOscillator(),o2=ctx.createOscillator(),e=ctx.createGain(),s=t+i*.07;o.frequency.value=f;o2.frequency.value=f*2.76;o2.type='sine';
      e.gain.setValueAtTime(0,s);e.gain.linearRampToValueAtTime(.04,s+.01);e.gain.exponentialRampToValueAtTime(.0001,s+1.6);o.connect(e);o2.connect(e);e.connect(this.master);o.start(s);o2.start(s);o.stop(s+1.7);o2.stop(s+1.7);});
  }
}
