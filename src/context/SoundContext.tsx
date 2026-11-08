import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import soundEngine from '../services/soundEngine';
import { SoundChannelConfig, SoundChannelId } from '../types';

export const DEFAULT_CHANNELS: Record<SoundChannelId, SoundChannelConfig> = {
  rain: {
    id: 'rain',
    name: 'Mưa rào',
    icon: '🌧️',
    volume: 50,
    enabled: false,
  },
  waves: {
    id: 'waves',
    name: 'Sóng biển',
    icon: '🌊',
    volume: 50,
    enabled: false,
  },
  brownNoise: {
    id: 'brownNoise',
    name: 'Ồn nâu',
    icon: '🤎',
    volume: 50,
    enabled: false,
  },
  whiteNoise: {
    id: 'whiteNoise',
    name: 'Ồn trắng',
    icon: '💨',
    volume: 50,
    enabled: false,
  },
  cafe: {
    id: 'cafe',
    name: 'Quán cafe',
    icon: '☕',
    volume: 50,
    enabled: false,
  },
  campfire: {
    id: 'campfire',
    name: 'Lửa trại',
    icon: '🔥',
    volume: 50,
    enabled: false,
  },
  birds: {
    id: 'birds',
    name: 'Tiếng chim',
    icon: '🐦',
    volume: 50,
    enabled: false,
  },
};

export interface SoundContextType {
  isPlayingMaster: boolean;
  masterVolume: number;
  channels: Record<SoundChannelId, SoundChannelConfig>;
  sleepTimerMinutes: number | null;
  sleepTimerRemaining: number | null;
  toggleMaster: () => void;
  setMasterVolume: (val: number) => void;
  toggleChannel: (id: SoundChannelId) => void;
  setChannelVolume: (id: SoundChannelId, val: number) => void;
  setSleepTimer: (mins: number | null) => void;
  playChime: () => void;
}

const SOUND_STORAGE_KEY = 'life-study-sound-config';

interface PersistedSoundData {
  masterVolume?: number;
  channels?: Partial<Record<SoundChannelId, { volume?: number; enabled?: boolean }>>;
}

function loadSavedConfig(): {
  masterVolume: number;
  channels: Record<SoundChannelId, SoundChannelConfig>;
} {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem(SOUND_STORAGE_KEY) : null;
    if (raw) {
      const parsed: PersistedSoundData = JSON.parse(raw);
      const masterVolume =
        typeof parsed.masterVolume === 'number'
          ? Math.max(0, Math.min(100, Math.round(parsed.masterVolume)))
          : 80;

      const channels: Record<SoundChannelId, SoundChannelConfig> = { ...DEFAULT_CHANNELS };

      if (parsed.channels && typeof parsed.channels === 'object') {
        (Object.keys(DEFAULT_CHANNELS) as SoundChannelId[]).forEach((id) => {
          const savedCh = parsed.channels?.[id];
          if (savedCh) {
            channels[id] = {
              ...DEFAULT_CHANNELS[id],
              volume:
                typeof savedCh.volume === 'number'
                  ? Math.max(0, Math.min(100, Math.round(savedCh.volume)))
                  : DEFAULT_CHANNELS[id].volume,
              enabled: typeof savedCh.enabled === 'boolean' ? savedCh.enabled : false,
            };
          }
        });
      }

      return { masterVolume, channels };
    }
  } catch (err) {
    console.warn('Failed to read sound config from localStorage:', err);
  }

  return {
    masterVolume: 80,
    channels: { ...DEFAULT_CHANNELS },
  };
}

export const SoundContext = createContext<SoundContextType | null>(null);

export function SoundProvider({ children }: { children: React.ReactNode }) {
  const [initialConfig] = useState(loadSavedConfig);
  const [isPlayingMaster, setIsPlayingMaster] = useState(false);
  const [masterVolume, setMasterVolumeState] = useState(initialConfig.masterVolume);
  const [channels, setChannels] = useState<Record<SoundChannelId, SoundChannelConfig>>(initialConfig.channels);
  const [sleepTimerMinutes, setSleepTimerMinutes] = useState<number | null>(null);
  const [sleepTimerRemaining, setSleepTimerRemaining] = useState<number | null>(null);

  // Initialize Web Audio Engine once on mount
  useEffect(() => {
    soundEngine.init();
  }, []);

  // Persist masterVolume and channels to localStorage
  useEffect(() => {
    try {
      const payload: PersistedSoundData = {
        masterVolume,
        channels: (Object.keys(channels) as SoundChannelId[]).reduce(
          (acc, id) => {
            acc[id] = {
              volume: channels[id].volume,
              enabled: channels[id].enabled,
            };
            return acc;
          },
          {} as Record<SoundChannelId, { volume: number; enabled: boolean }>
        ),
      };
      localStorage.setItem(SOUND_STORAGE_KEY, JSON.stringify(payload));
    } catch (err) {
      console.warn('Failed to save sound config to localStorage:', err);
    }
  }, [masterVolume, channels]);

  // Sync channel playback with soundEngine
  useEffect(() => {
    if (!isPlayingMaster) {
      soundEngine.stopAll();
      return;
    }

    (Object.keys(channels) as SoundChannelId[]).forEach((id) => {
      const ch = channels[id];
      if (ch.enabled) {
        soundEngine.setChannelVolume(id, ch.volume / 100);
        soundEngine.setChannelEnabled(id, true);
      } else {
        soundEngine.setChannelEnabled(id, false);
      }
    });
  }, [isPlayingMaster, channels]);

  // Sync master volume with soundEngine, with auto fade-out support
  useEffect(() => {
    const FADE_OUT_DURATION = 15; // Fade out during the final 15 seconds
    if (isPlayingMaster && sleepTimerRemaining !== null && sleepTimerRemaining <= FADE_OUT_DURATION) {
      const factor = Math.max(0, sleepTimerRemaining / FADE_OUT_DURATION);
      soundEngine.setMasterVolume((masterVolume / 100) * factor);
    } else {
      soundEngine.setMasterVolume(masterVolume / 100);
    }
  }, [isPlayingMaster, masterVolume, sleepTimerRemaining]);

  // Sleep timer interval countdown
  useEffect(() => {
    if (sleepTimerRemaining === null || !isPlayingMaster) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setSleepTimerRemaining((prev) => {
        if (prev === null) return null;
        if (prev <= 1) {
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [sleepTimerRemaining !== null, isPlayingMaster]);

  // Trigger when sleep timer reaches 0
  useEffect(() => {
    if (sleepTimerRemaining === 0) {
      setIsPlayingMaster(false);
      setSleepTimerMinutes(null);
      setSleepTimerRemaining(null);
      soundEngine.stopAll();
      soundEngine.setMasterVolume(masterVolume / 100);
    }
  }, [sleepTimerRemaining, masterVolume]);

  const toggleMaster = useCallback(() => {
    setIsPlayingMaster((prev) => {
      const next = !prev;
      if (next) {
        setChannels((currChannels) => {
          const hasEnabled = Object.values(currChannels).some((c) => c.enabled);
          if (!hasEnabled) {
            return {
              ...currChannels,
              rain: { ...currChannels.rain, enabled: true },
            };
          }
          return currChannels;
        });
      } else {
        setSleepTimerMinutes(null);
        setSleepTimerRemaining(null);
      }
      return next;
    });
  }, []);

  const setMasterVolume = useCallback((val: number) => {
    const clamped = Math.max(0, Math.min(100, Math.round(val)));
    setMasterVolumeState(clamped);
  }, []);

  const toggleChannel = useCallback((id: SoundChannelId) => {
    setChannels((prev) => {
      const nextEnabled = !prev[id].enabled;
      const updated = {
        ...prev,
        [id]: { ...prev[id], enabled: nextEnabled },
      };

      const anyEnabled = Object.values(updated).some((c) => c.enabled);
      setIsPlayingMaster(anyEnabled);
      if (!anyEnabled) {
        setSleepTimerMinutes(null);
        setSleepTimerRemaining(null);
      }

      return updated;
    });
  }, []);

  const setChannelVolume = useCallback((id: SoundChannelId, val: number) => {
    const clamped = Math.max(0, Math.min(100, Math.round(val)));
    setChannels((prev) => {
      if (prev[id].volume === clamped) return prev;
      return {
        ...prev,
        [id]: { ...prev[id], volume: clamped },
      };
    });
  }, []);

  const setSleepTimer = useCallback((mins: number | null) => {
    if (mins === null || mins <= 0) {
      setSleepTimerMinutes(null);
      setSleepTimerRemaining(null);
      return;
    }
    setSleepTimerMinutes(mins);
    setSleepTimerRemaining(Math.round(mins * 60));
  }, []);

  const playChime = useCallback(() => {
    soundEngine.playChime();
  }, []);

  const value: SoundContextType = {
    isPlayingMaster,
    masterVolume,
    channels,
    sleepTimerMinutes,
    sleepTimerRemaining,
    toggleMaster,
    setMasterVolume,
    toggleChannel,
    setChannelVolume,
    setSleepTimer,
    playChime,
  };

  return <SoundContext.Provider value={value}>{children}</SoundContext.Provider>;
}

export function useSound(): SoundContextType {
  const context = useContext(SoundContext);
  if (!context) {
    throw new Error('useSound must be used within a SoundProvider');
  }
  return context;
}
