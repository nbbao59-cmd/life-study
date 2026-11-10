/**
 * Procedural Lofi Ambient Chords Synthesizer
 * Used as a 100% offline fallback when external streaming audio has network issues.
 */
class LofiProceduralSynth {
  private ctx: AudioContext | null = null;
  private isPlaying = false;
  private gainNode: GainNode | null = null;
  private intervalId: number | null = null;

  private ensureContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public start(volume = 0.5): void {
    if (this.isPlaying) return;
    try {
      const ctx = this.ensureContext();
      this.isPlaying = true;

      const master = ctx.createGain();
      master.gain.setValueAtTime(0, ctx.currentTime);
      master.gain.linearRampToValueAtTime(Math.min(1, Math.max(0, volume)), ctx.currentTime + 1.2);
      master.connect(ctx.destination);
      this.gainNode = master;

      // Chord progressions in D-flat Major / F-minor (warm nostalgic lofi mood)
      const chordFrequencies = [
        [220.00, 277.18, 329.63, 415.30], // A Major 7
        [174.61, 220.00, 261.63, 329.63], // F# minor 7
        [196.00, 246.94, 293.66, 370.00], // G Major 7
        [164.81, 207.65, 246.94, 311.13], // E minor 7
      ];

      let chordIndex = 0;

      const playChord = () => {
        if (!this.isPlaying || !this.ctx || !this.gainNode) return;
        const now = this.ctx.currentTime;
        const freqs = chordFrequencies[chordIndex];
        chordIndex = (chordIndex + 1) % chordFrequencies.length;

        freqs.forEach((freq, idx) => {
          const osc = this.ctx!.createOscillator();
          const filter = this.ctx!.createBiquadFilter();
          const noteGain = this.ctx!.createGain();

          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + idx * 0.08); // light arpeggiation

          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(650, now);
          filter.Q.setValueAtTime(1.5, now);

          noteGain.gain.setValueAtTime(0.001, now);
          noteGain.gain.linearRampToValueAtTime(0.08, now + 0.6);
          noteGain.gain.exponentialRampToValueAtTime(0.0001, now + 4.8);

          osc.connect(filter);
          filter.connect(noteGain);
          noteGain.connect(this.gainNode!);

          osc.start(now + idx * 0.08);
          osc.stop(now + 5.0);

          setTimeout(() => {
            try {
              osc.disconnect();
              filter.disconnect();
              noteGain.disconnect();
            } catch {}
          }, 5200);
        });
      };

      playChord();
      this.intervalId = window.setInterval(playChord, 4600);
    } catch (e) {
      console.warn('LofiProceduralSynth start error:', e);
    }
  }

  public setVolume(vol: number): void {
    if (this.gainNode && this.ctx) {
      const norm = Math.min(1, Math.max(0, vol));
      this.gainNode.gain.setTargetAtTime(norm, this.ctx.currentTime, 0.05);
    }
  }

  public stop(): void {
    this.isPlaying = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    if (this.gainNode && this.ctx) {
      try {
        const now = this.ctx.currentTime;
        this.gainNode.gain.setValueAtTime(this.gainNode.gain.value, now);
        this.gainNode.gain.linearRampToValueAtTime(0.0001, now + 0.5);
        setTimeout(() => {
          try {
            this.gainNode?.disconnect();
          } catch {}
          this.gainNode = null;
        }, 600);
      } catch {
        this.gainNode = null;
      }
    }
  }
}

export const lofiSynth = new LofiProceduralSynth();
export default lofiSynth;
