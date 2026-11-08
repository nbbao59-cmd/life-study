import { SoundChannelId } from '../types';

/**
 * Procedural Sound Engine using Native Web Audio API
 * Zero external audio files or dependencies.
 */
class SoundEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private isInitialized = false;

  // Channel volumes (0.0 to 1.0)
  private channelVolumes: Record<SoundChannelId, number> = {
    rain: 0.5,
    waves: 0.5,
    whiteNoise: 0.5,
    brownNoise: 0.5,
    cafe: 0.5,
    campfire: 0.5,
    birds: 0.5,
  };

  // Channel enabled states
  private channelEnabled: Record<SoundChannelId, boolean> = {
    rain: false,
    waves: false,
    whiteNoise: false,
    brownNoise: false,
    cafe: false,
    campfire: false,
    birds: false,
  };

  // Active channel cleanup handlers
  private activeChannels: Partial<Record<SoundChannelId, {
    gainNode: GainNode;
    cleanup: () => void;
  }>> = {};

  // Pre-computed noise buffers for memory efficiency and looping
  private whiteNoiseBuffer: AudioBuffer | null = null;
  private pinkNoiseBuffer: AudioBuffer | null = null;
  private brownNoiseBuffer: AudioBuffer | null = null;

  public init(): void {
    if (this.isInitialized) return;
    this.ensureContext();
    this.setupAutoplayUnlock();
    this.isInitialized = true;
  }

  private setupAutoplayUnlock(): void {
    if (typeof window === 'undefined') return;

    const unlock = () => {
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
      window.removeEventListener('click', unlock);
      window.removeEventListener('keydown', unlock);
      window.removeEventListener('touchstart', unlock);
    };

    window.addEventListener('click', unlock, { passive: true });
    window.addEventListener('keydown', unlock, { passive: true });
    window.addEventListener('touchstart', unlock, { passive: true });
  }

  private ensureContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.8, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }

    return this.ctx;
  }

  private normalizeVolume(vol: number): number {
    const raw = vol > 1 ? vol / 100 : vol;
    return Math.max(0, Math.min(1, raw));
  }

  public setMasterVolume(vol: number): void {
    const ctx = this.ensureContext();
    if (!this.masterGain) return;
    const norm = this.normalizeVolume(vol);
    this.masterGain.gain.setTargetAtTime(norm, ctx.currentTime, 0.05);
  }

  public setChannelVolume(id: SoundChannelId, vol: number): void {
    const norm = this.normalizeVolume(vol);
    this.channelVolumes[id] = norm;

    const active = this.activeChannels[id];
    if (active && this.ctx) {
      active.gainNode.gain.setTargetAtTime(norm, this.ctx.currentTime, 0.05);
    }
  }

  public setChannelEnabled(id: SoundChannelId, enabled: boolean): void {
    this.channelEnabled[id] = enabled;

    if (enabled) {
      this.startChannel(id);
    } else {
      this.stopChannel(id);
    }
  }

  public stopAll(): void {
    const ids = Object.keys(this.channelEnabled) as SoundChannelId[];
    for (const id of ids) {
      this.setChannelEnabled(id, false);
    }
  }

  /**
   * Chime alert for Pomodoro session completion:
   * Two harmonic sine waves (528Hz and 792Hz) with smooth decay envelope.
   */
  public playChime(): void {
    try {
      const ctx = this.ensureContext();
      const now = ctx.currentTime;

      const chimeGain = ctx.createGain();
      chimeGain.gain.setValueAtTime(0, now);
      chimeGain.gain.linearRampToValueAtTime(0.35, now + 0.04);
      chimeGain.gain.exponentialRampToValueAtTime(0.0001, now + 2.5);

      if (this.masterGain) {
        chimeGain.connect(this.masterGain);
      } else {
        chimeGain.connect(ctx.destination);
      }

      // 528 Hz (Love frequency / transformation) & 792 Hz (Perfect 5th harmony)
      const osc1 = ctx.createOscillator();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(528, now);

      const osc2 = ctx.createOscillator();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(792, now);

      osc1.connect(chimeGain);
      osc2.connect(chimeGain);

      osc1.start(now);
      osc2.start(now);

      osc1.stop(now + 2.6);
      osc2.stop(now + 2.6);

      setTimeout(() => {
        chimeGain.disconnect();
      }, 2700);
    } catch (e) {
      console.warn('AudioEngine playChime error:', e);
    }
  }

  // ==========================================
  // Noise Buffer Generators
  // ==========================================

  private getWhiteNoiseBuffer(ctx: AudioContext): AudioBuffer {
    if (this.whiteNoiseBuffer) return this.whiteNoiseBuffer;
    const bufferSize = ctx.sampleRate * 5; // 5 seconds
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    this.whiteNoiseBuffer = buffer;
    return buffer;
  }

  private getPinkNoiseBuffer(ctx: AudioContext): AudioBuffer {
    if (this.pinkNoiseBuffer) return this.pinkNoiseBuffer;
    const bufferSize = ctx.sampleRate * 5; // 5 seconds
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
      b6 = white * 0.115926;
    }
    this.pinkNoiseBuffer = buffer;
    return buffer;
  }

  private getBrownNoiseBuffer(ctx: AudioContext): AudioBuffer {
    if (this.brownNoiseBuffer) return this.brownNoiseBuffer;
    const bufferSize = ctx.sampleRate * 5; // 5 seconds
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      lastOut = (lastOut + 0.02 * white) / 1.02;
      data[i] = lastOut * 3.5;
    }
    this.brownNoiseBuffer = buffer;
    return buffer;
  }

  // ==========================================
  // Channel Builders
  // ==========================================

  private startChannel(id: SoundChannelId): void {
    if (this.activeChannels[id]) return;

    try {
      const ctx = this.ensureContext();
      if (!this.masterGain) return;

      const channelGain = ctx.createGain();
      const targetVol = this.channelVolumes[id];
      channelGain.gain.setValueAtTime(0, ctx.currentTime);
      channelGain.gain.setTargetAtTime(targetVol, ctx.currentTime, 0.05);
      channelGain.connect(this.masterGain);

      let cleanup: () => void = () => {};

      switch (id) {
        case 'rain':
          cleanup = this.buildRainChannel(ctx, channelGain);
          break;
        case 'waves':
          cleanup = this.buildWavesChannel(ctx, channelGain);
          break;
        case 'whiteNoise':
          cleanup = this.buildWhiteNoiseChannel(ctx, channelGain);
          break;
        case 'brownNoise':
          cleanup = this.buildBrownNoiseChannel(ctx, channelGain);
          break;
        case 'cafe':
          cleanup = this.buildCafeChannel(ctx, channelGain);
          break;
        case 'campfire':
          cleanup = this.buildCampfireChannel(ctx, channelGain);
          break;
        case 'birds':
          cleanup = this.buildBirdsChannel(ctx, channelGain);
          break;
      }

      this.activeChannels[id] = {
        gainNode: channelGain,
        cleanup,
      };
    } catch (e) {
      console.warn(`Failed to start sound channel ${id}:`, e);
    }
  }

  private stopChannel(id: SoundChannelId): void {
    const active = this.activeChannels[id];
    if (!active || !this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      active.gainNode.gain.setValueAtTime(active.gainNode.gain.value, now);
      active.gainNode.gain.linearRampToValueAtTime(0.0001, now + 0.08);

      setTimeout(() => {
        try {
          active.cleanup();
          active.gainNode.disconnect();
        } catch {}
      }, 100);
    } catch {
      try {
        active.cleanup();
        active.gainNode.disconnect();
      } catch {}
    }

    delete this.activeChannels[id];
  }

  /**
   * Rain: White noise qua BiquadFilter (lowpass 850Hz, Q=1.0) kết hợp gain modulation nhẹ
   */
  private buildRainChannel(ctx: AudioContext, destination: GainNode): () => void {
    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = this.getWhiteNoiseBuffer(ctx);
    noiseSource.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(850, ctx.currentTime);
    filter.Q.setValueAtTime(1.0, ctx.currentTime);

    // Light gain modulation for gentle fluctuating rainfall intensity
    const modGain = ctx.createGain();
    modGain.gain.setValueAtTime(0.7, ctx.currentTime);

    const lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(0.2, ctx.currentTime);

    const lfoGain = ctx.createGain();
    lfoGain.gain.setValueAtTime(0.15, ctx.currentTime);

    lfo.connect(lfoGain);
    lfoGain.connect(modGain.gain);

    noiseSource.connect(filter);
    filter.connect(modGain);
    modGain.connect(destination);

    noiseSource.start();
    lfo.start();

    return () => {
      try {
        noiseSource.stop();
        lfo.stop();
        noiseSource.disconnect();
        lfo.disconnect();
        lfoGain.disconnect();
        filter.disconnect();
        modGain.disconnect();
      } catch {}
    };
  }

  /**
   * Waves: Pink noise qua BiquadFilter (bandpass 400Hz) điều biến bởi Sine LFO (0.1Hz) tạo nhịp dạt vào bờ
   */
  private buildWavesChannel(ctx: AudioContext, destination: GainNode): () => void {
    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = this.getPinkNoiseBuffer(ctx);
    noiseSource.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(400, ctx.currentTime);
    filter.Q.setValueAtTime(1.2, ctx.currentTime);

    const waveGain = ctx.createGain();
    waveGain.gain.setValueAtTime(0.4, ctx.currentTime);

    // Sine LFO at 0.1Hz (10 second rolling surf wave cycle)
    const lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(0.1, ctx.currentTime);

    const lfoGain = ctx.createGain();
    lfoGain.gain.setValueAtTime(0.35, ctx.currentTime);

    lfo.connect(lfoGain);
    lfoGain.connect(waveGain.gain);

    noiseSource.connect(filter);
    filter.connect(waveGain);
    waveGain.connect(destination);

    noiseSource.start();
    lfo.start();

    return () => {
      try {
        noiseSource.stop();
        lfo.stop();
        noiseSource.disconnect();
        lfo.disconnect();
        lfoGain.disconnect();
        filter.disconnect();
        waveGain.disconnect();
      } catch {}
    };
  }

  /**
   * White Noise: White noise mộc qua lowpass 3000Hz làm dịu
   */
  private buildWhiteNoiseChannel(ctx: AudioContext, destination: GainNode): () => void {
    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = this.getWhiteNoiseBuffer(ctx);
    noiseSource.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(3000, ctx.currentTime);
    filter.Q.setValueAtTime(0.7, ctx.currentTime);

    noiseSource.connect(filter);
    filter.connect(destination);
    noiseSource.start();

    return () => {
      try {
        noiseSource.stop();
        noiseSource.disconnect();
        filter.disconnect();
      } catch {}
    };
  }

  /**
   * Brown Noise: Brownian noise lọc dải tần thấp ấm áp
   */
  private buildBrownNoiseChannel(ctx: AudioContext, destination: GainNode): () => void {
    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = this.getBrownNoiseBuffer(ctx);
    noiseSource.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(450, ctx.currentTime);
    filter.Q.setValueAtTime(0.8, ctx.currentTime);

    noiseSource.connect(filter);
    filter.connect(destination);
    noiseSource.start();

    return () => {
      try {
        noiseSource.stop();
        noiseSource.disconnect();
        filter.disconnect();
      } catch {}
    };
  }

  /**
   * Cafe: Tổng hợp tiếng rì rầm và tần số lọc ấm
   */
  private buildCafeChannel(ctx: AudioContext, destination: GainNode): () => void {
    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = this.getPinkNoiseBuffer(ctx);
    noiseSource.loop = true;

    // Resonant filters capturing low room murmur and vocal frequency contours
    const filterLow = ctx.createBiquadFilter();
    filterLow.type = 'bandpass';
    filterLow.frequency.setValueAtTime(280, ctx.currentTime);
    filterLow.Q.setValueAtTime(2.0, ctx.currentTime);

    const filterMid = ctx.createBiquadFilter();
    filterMid.type = 'bandpass';
    filterMid.frequency.setValueAtTime(750, ctx.currentTime);
    filterMid.Q.setValueAtTime(2.5, ctx.currentTime);

    const filterHigh = ctx.createBiquadFilter();
    filterHigh.type = 'lowpass';
    filterHigh.frequency.setValueAtTime(1400, ctx.currentTime);
    filterHigh.Q.setValueAtTime(1.0, ctx.currentTime);

    const cafeGain = ctx.createGain();
    cafeGain.gain.setValueAtTime(0.6, ctx.currentTime);

    // Multi-frequency slow drifting murmur
    const lfo1 = ctx.createOscillator();
    lfo1.type = 'sine';
    lfo1.frequency.setValueAtTime(0.18, ctx.currentTime);

    const lfo1Gain = ctx.createGain();
    lfo1Gain.gain.setValueAtTime(0.12, ctx.currentTime);
    lfo1.connect(lfo1Gain);
    lfo1Gain.connect(cafeGain.gain);

    noiseSource.connect(filterLow);
    noiseSource.connect(filterMid);
    noiseSource.connect(filterHigh);

    filterLow.connect(cafeGain);
    filterMid.connect(cafeGain);
    filterHigh.connect(cafeGain);
    cafeGain.connect(destination);

    noiseSource.start();
    lfo1.start();

    return () => {
      try {
        noiseSource.stop();
        lfo1.stop();
        noiseSource.disconnect();
        lfo1.disconnect();
        lfo1Gain.disconnect();
        filterLow.disconnect();
        filterMid.disconnect();
        filterHigh.disconnect();
        cafeGain.disconnect();
      } catch {}
    };
  }

  /**
   * Campfire: Brown noise + pulse ngẫu nhiên mô phỏng tiếng nổ lách tách của lửa
   */
  private buildCampfireChannel(ctx: AudioContext, destination: GainNode): () => void {
    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = this.getBrownNoiseBuffer(ctx);
    noiseSource.loop = true;

    const baseFilter = ctx.createBiquadFilter();
    baseFilter.type = 'lowpass';
    baseFilter.frequency.setValueAtTime(600, ctx.currentTime);
    baseFilter.Q.setValueAtTime(1.0, ctx.currentTime);

    const baseGain = ctx.createGain();
    baseGain.gain.setValueAtTime(0.5, ctx.currentTime);

    noiseSource.connect(baseFilter);
    baseFilter.connect(baseGain);
    baseGain.connect(destination);
    noiseSource.start();

    // Random crackle pops generator
    let crackleTimer: number | null = null;
    let isRunning = true;

    const scheduleCrackle = () => {
      if (!isRunning) return;

      try {
        const now = ctx.currentTime;
        const popOsc = ctx.createOscillator();
        const popFilter = ctx.createBiquadFilter();
        const popGain = ctx.createGain();

        popOsc.type = 'triangle';
        const startFreq = 300 + Math.random() * 1200;
        popOsc.frequency.setValueAtTime(startFreq, now);
        popOsc.frequency.exponentialRampToValueAtTime(80, now + 0.04);

        popFilter.type = 'bandpass';
        popFilter.frequency.setValueAtTime(1200 + Math.random() * 800, now);
        popFilter.Q.setValueAtTime(3.0, now);

        const popVolume = 0.05 + Math.random() * 0.25;
        popGain.gain.setValueAtTime(popVolume, now);
        popGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);

        popOsc.connect(popFilter);
        popFilter.connect(popGain);
        popGain.connect(destination);

        popOsc.start(now);
        popOsc.stop(now + 0.05);

        setTimeout(() => {
          try {
            popOsc.disconnect();
            popFilter.disconnect();
            popGain.disconnect();
          } catch {}
        }, 80);
      } catch {}

      // Irregular fire crackle intervals (70ms to 450ms)
      const nextDelay = 70 + Math.random() * 380;
      crackleTimer = window.setTimeout(scheduleCrackle, nextDelay);
    };

    scheduleCrackle();

    return () => {
      isRunning = false;
      if (crackleTimer) {
        clearTimeout(crackleTimer);
      }
      try {
        noiseSource.stop();
        noiseSource.disconnect();
        baseFilter.disconnect();
        baseGain.disconnect();
      } catch {}
    };
  }

  /**
   * Birds: Sine chirps ngẫu nhiên theo nhịp điệu sinh thái
   */
  private buildBirdsChannel(ctx: AudioContext, destination: GainNode): () => void {
    let birdTimer: number | null = null;
    let isRunning = true;

    const scheduleBirdCall = () => {
      if (!isRunning) return;

      try {
        const now = ctx.currentTime;
        const chirpCount = 1 + Math.floor(Math.random() * 3); // 1 to 3 chirps in a phrase

        for (let i = 0; i < chirpCount; i++) {
          const chirpStart = now + i * 0.12;
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = 'sine';
          const baseFreq = 2600 + Math.random() * 1200;
          const sweepFreq = baseFreq + (Math.random() > 0.5 ? 800 : -600);

          osc.frequency.setValueAtTime(baseFreq, chirpStart);
          osc.frequency.exponentialRampToValueAtTime(sweepFreq, chirpStart + 0.08);

          gain.gain.setValueAtTime(0.0001, chirpStart);
          gain.gain.linearRampToValueAtTime(0.18, chirpStart + 0.015);
          gain.gain.exponentialRampToValueAtTime(0.0001, chirpStart + 0.09);

          osc.connect(gain);
          gain.connect(destination);

          osc.start(chirpStart);
          osc.stop(chirpStart + 0.1);

          setTimeout(() => {
            try {
              osc.disconnect();
              gain.disconnect();
            } catch {}
          }, 250);
        }
      } catch {}

      // Forest bird intervals: 1.8s to 4.5s
      const nextDelay = 1800 + Math.random() * 2700;
      birdTimer = window.setTimeout(scheduleBirdCall, nextDelay);
    };

    scheduleBirdCall();

    return () => {
      isRunning = false;
      if (birdTimer) {
        clearTimeout(birdTimer);
      }
    };
  }
}

export const soundEngine = new SoundEngine();
export default soundEngine;
export { SoundEngine };
