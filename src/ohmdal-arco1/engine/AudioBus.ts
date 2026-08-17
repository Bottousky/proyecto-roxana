/**
 * Audio bus. Music + SFX + voice.
 *
 * - One ambient music track per region (can be crossfaded).
 * - SFX pool: footsteps, cable connect, switch click, lamp ignite, water
 *   flow, dialogue advance, puzzle success, puzzle fail (informative),
 *   Ohm awake, door open.
 * - Voice: a few key lines (Edda, Lumen, Ohm). Generated separately and
 *   referenced by URL. The bus plays them on demand and respects the
 *   mute toggle.
 *
 * If the assets are missing, the bus silently skips them. This is
 * intentional — the game should run even if audio assets haven't been
 * generated yet. The boot is non-blocking.
 */

export interface AudioBusOptions {
  musicVolume?: number;
  sfxVolume?: number;
  voiceVolume?: number;
  muted?: boolean;
}

export class AudioBus {
  private musicVolume = 0.5;
  private sfxVolume = 0.7;
  private voiceVolume = 0.9;
  private muted = false;
  private currentMusic: HTMLAudioElement | null = null;
  private currentMusicKey: string | null = null;
  private musicCache: Map<string, HTMLAudioElement> = new Map();
  private sfxCache: Map<string, HTMLAudioElement> = new Map();
  private voiceCache: Map<string, HTMLAudioElement> = new Map();
  private fadeTimer: number | null = null;
  private ready: Promise<void>;

  constructor(opts: AudioBusOptions = {}) {
    if (opts.musicVolume != null) this.musicVolume = opts.musicVolume;
    if (opts.sfxVolume != null) this.sfxVolume = opts.sfxVolume;
    if (opts.voiceVolume != null) this.voiceVolume = opts.voiceVolume;
    if (opts.muted != null) this.muted = opts.muted;
    this.ready = this.bootstrap();
  }

  async bootstrap(): Promise<void> {
    // Wait for user interaction before allowing audio to play.
    return new Promise((resolve) => {
      const unlock = () => {
        resolve();
        window.removeEventListener('pointerdown', unlock);
        window.removeEventListener('keydown', unlock);
      };
      window.addEventListener('pointerdown', unlock, { once: true });
      window.addEventListener('keydown', unlock, { once: true });
      // Always resolve after a short delay so boot isn't blocked forever.
      setTimeout(resolve, 1500);
    });
  }

  whenReady(): Promise<void> {
    return this.ready;
  }

  setMuted(muted: boolean): void {
    this.muted = muted;
    if (this.currentMusic) this.currentMusic.muted = muted;
  }

  isMuted(): boolean {
    return this.muted;
  }

  /**
   * Play a music track. Crossfades with the current one if any.
   * Key: a stable name like 'ohmdal_dormant' or 'manantial_flow'.
   * Path: relative URL to the audio file.
   */
  playMusic(key: string, path: string, fadeMs: number = 1500): void {
    if (this.muted) return;
    if (this.currentMusicKey === key && this.currentMusic) {
      // Already playing this one. Resume if paused.
      if (this.currentMusic.paused) this.currentMusic.play().catch(() => {});
      return;
    }
    let track = this.musicCache.get(key);
    if (!track) {
      track = new Audio(path);
      track.loop = true;
      track.volume = 0;
      track.preload = 'auto';
      this.musicCache.set(key, track);
    }
    // Fade out current
    if (this.currentMusic && this.fadeTimer == null) {
      const old = this.currentMusic;
      const newTrack = track;
      const steps = 20;
      const stepMs = fadeMs / steps;
      let i = 0;
      this.fadeTimer = window.setInterval(() => {
        i++;
        old.volume = Math.max(0, (this.musicVolume * (steps - i)) / steps);
        newTrack.volume = Math.min(this.musicVolume, (this.musicVolume * i) / steps);
        if (i >= steps) {
          if (this.fadeTimer != null) {
            clearInterval(this.fadeTimer);
            this.fadeTimer = null;
          }
          old.pause();
        }
      }, stepMs);
    }
    track.volume = this.musicVolume;
    track.play().catch(() => {/* autoplay restrictions; safe to ignore */});
    this.currentMusic = track;
    this.currentMusicKey = key;
  }

  stopMusic(fadeMs: number = 800): void {
    if (!this.currentMusic) return;
    const old = this.currentMusic;
    const startVol = old.volume;
    const steps = 10;
    const stepMs = fadeMs / steps;
    let i = 0;
    const timer = window.setInterval(() => {
      i++;
      old.volume = Math.max(0, (startVol * (steps - i)) / steps);
      if (i >= steps) {
        old.pause();
        clearInterval(timer);
      }
    }, stepMs);
    this.currentMusic = null;
    this.currentMusicKey = null;
  }

  /**
   * Play a SFX once. Path is a URL to an audio file.
   */
  playSfx(key: string, path: string, volume: number = 1): void {
    if (this.muted) return;
    let sfx = this.sfxCache.get(key);
    if (!sfx) {
      sfx = new Audio(path);
      sfx.preload = 'auto';
      this.sfxCache.set(key, sfx);
    }
    sfx.volume = this.sfxVolume * volume;
    sfx.currentTime = 0;
    sfx.play().catch(() => {});
  }

  /**
   * Play a voice line. Voice is treated as a one-shot SFX but with its
   * own volume and a key like 'edda_meet_1' or 'ohm_awake'.
   */
  playVoice(key: string, path: string, volume: number = 1): void {
    if (this.muted) return;
    let v = this.voiceCache.get(key);
    if (!v) {
      v = new Audio(path);
      v.preload = 'auto';
      this.voiceCache.set(key, v);
    }
    v.volume = this.voiceVolume * volume;
    v.currentTime = 0;
    v.play().catch(() => {});
  }

  stopVoice(): void {
    for (const v of this.voiceCache.values()) {
      v.pause();
      v.currentTime = 0;
    }
  }
}
