/** Original, opt-in soundscape. No files, network requests or autoplay. */
export class InstituteAmbience {
  private context: AudioContext | null = null;
  private master: GainNode | null = null;
  private enabled = false;

  async setEnabled(enabled: boolean): Promise<boolean> {
    this.enabled = enabled;
    if (!enabled) {
      if (this.master && this.context)
        this.master.gain.setTargetAtTime(0, this.context.currentTime, 0.12);
      return false;
    }
    try {
      if (!this.context) this.create();
      await this.context!.resume();
      // A quick second click can cancel while resume is awaiting permission.
      if (!this.enabled) return false;
      this.master!.gain.setTargetAtTime(0.045, this.context!.currentTime, 0.8);
      return true;
    } catch {
      this.enabled = false;
      return false;
    }
  }

  private create(): void {
    const context = new AudioContext();
    this.context = context;
    const master = context.createGain();
    master.gain.value = 0;
    master.connect(context.destination);
    this.master = master;
    // D, A and E: an open, slowly breathing chord, without melody loops.
    [146.83, 220, 293.66, 329.63].forEach((frequency, index) => {
      const tone = context.createOscillator();
      const gain = context.createGain();
      tone.type = 'sine';
      tone.frequency.value = frequency;
      tone.detune.value = index % 2 ? -3 : 3;
      gain.gain.value = 0.13;
      const breath = context.createOscillator();
      const depth = context.createGain();
      breath.frequency.value = 0.045 + index * 0.011;
      depth.gain.value = 0.055;
      breath.connect(depth).connect(gain.gain);
      tone.connect(gain).connect(master);
      breath.start();
      tone.start();
    });
  }

  setVisible(visible: boolean): void {
    if (!this.context) return;
    if (!visible) void this.context.suspend().catch(() => {});
    else if (this.enabled) void this.context.resume().catch(() => {});
  }

  dispose(): void {
    void this.context?.close().catch(() => {});
    this.context = null;
  }
}
