import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { INITIAL_PLAYLISTS } from '../data/musicData';
import lofiSynth from '../services/lofiProceduralSynth';
import { extractYouTubeId, getYouTubeThumbnail, loadYouTubeIFrameAPI } from '../services/youtubeService';
import { Playlist, Track } from '../types/index';

export type RepeatMode = 'off' | 'all' | 'one';

export interface MusicContextType {
  playlists: Playlist[];
  activePlaylist: Playlist;
  activePlaylistId: string;
  currentTrack: Track | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  shuffle: boolean;
  repeat: RepeatMode;
  likedTrackIds: string[];
  selectPlaylist: (id: string) => void;
  playTrack: (track: Track, playlistId?: string) => void;
  playPlaylist: (playlistId: string) => void;
  togglePlay: () => void;
  pause: () => void;
  resume: () => void;
  nextTrack: () => void;
  prevTrack: () => void;
  seek: (seconds: number) => void;
  setVolume: (val: number) => void;
  toggleMute: () => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  toggleLike: (trackId: string) => void;
  addTrackToPlaylist: (playlistId: string, track: Omit<Track, 'id'>) => void;
  deleteTrack: (playlistId: string, trackId: string) => void;
}

const STORAGE_PLAYLISTS_KEY = 'life-study-playlists-v2';
const STORAGE_LIKES_KEY = 'life-study-liked-tracks-v2';
const STORAGE_VOLUME_KEY = 'life-study-music-volume-v2';

function loadSavedPlaylists(): Playlist[] {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_PLAYLISTS_KEY) : null;
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Failed to load saved playlists:', e);
  }
  return INITIAL_PLAYLISTS;
}

function loadSavedLikes(): string[] {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_LIKES_KEY) : null;
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {}
  return ['yt-lofi-1', 'yt-ocean-1', 'yt-piano-1'];
}

export const MusicContext = createContext<MusicContextType | null>(null);

export function MusicProvider({ children }: { children: React.ReactNode }) {
  const [playlists, setPlaylists] = useState<Playlist[]>(loadSavedPlaylists);
  const [activePlaylistId, setActivePlaylistId] = useState<string>('playlist-lofi-live');
  const [currentTrack, setCurrentTrack] = useState<Track | null>(() => {
    const defaultPl = loadSavedPlaylists().find((p) => p.id === 'playlist-lofi-live') || loadSavedPlaylists()[0];
    return defaultPl?.tracks[0] ?? null;
  });
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(() => currentTrack?.duration || 180);
  const [volume, setVolumeState] = useState<number>(() => {
    try {
      const v = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_VOLUME_KEY) : null;
      return v !== null ? Number(v) : 75;
    } catch {
      return 75;
    }
  });
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [shuffle, setShuffle] = useState<boolean>(false);
  const [repeat, setRepeat] = useState<RepeatMode>('all');
  const [likedTrackIds, setLikedTrackIds] = useState<string[]>(loadSavedLikes);

  // Hidden native HTMLAudioElement for direct audio playback & fallback
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isFallbackSynthRef = useRef<boolean>(false);

  // YouTube IFrame Player reference
  const ytPlayerRef = useRef<any>(null);
  const isYtReadyRef = useRef<boolean>(false);
  const pendingYtTrackRef = useRef<Track | null>(null);

  // 1. Initialize HTMLAudioElement
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const audio = new Audio();
    audio.preload = 'metadata';
    audio.volume = isMuted ? 0 : volume / 100;

    const onTimeUpdate = () => {
      if (!isFallbackSynthRef.current && !currentTrack?.youtubeId) {
        setCurrentTime(Math.round(audio.currentTime));
      }
    };

    const onLoadedMetadata = () => {
      if (!isNaN(audio.duration) && audio.duration > 0 && !currentTrack?.youtubeId) {
        setDuration(Math.round(audio.duration));
      }
    };

    const onEnded = () => {
      handleNext();
    };

    const onError = () => {
      if (!currentTrack?.youtubeId) {
        console.warn('Audio link error, using synth fallback');
        isFallbackSynthRef.current = true;
        lofiSynth.start(isMuted ? 0 : volume / 100);
      }
    };

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('error', onError);

    audioRef.current = audio;

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('error', onError);
      audio.pause();
      lofiSynth.stop();
    };
  }, []);

  // 2. Initialize YouTube IFrame Player
  useEffect(() => {
    if (typeof window === 'undefined') return;

    let mounted = true;

    loadYouTubeIFrameAPI().then(() => {
      if (!mounted) return;

      const checkYT = setInterval(() => {
        if ((window as any).YT && (window as any).YT.Player) {
          clearInterval(checkYT);

          const container = document.getElementById('youtube-hidden-player-box');
          if (!container) return;

          try {
            ytPlayerRef.current = new (window as any).YT.Player('youtube-hidden-player-box', {
              height: '1',
              width: '1',
              videoId: currentTrack?.youtubeId || 'jfKfPfyJRdk',
              playerVars: {
                autoplay: 0,
                controls: 0,
                disablekb: 1,
                fs: 0,
                modestbranding: 1,
                playsinline: 1,
                rel: 0,
              },
              events: {
                onReady: () => {
                  isYtReadyRef.current = true;
                  if (ytPlayerRef.current?.setVolume) {
                    ytPlayerRef.current.setVolume(isMuted ? 0 : volume);
                  }
                  if (pendingYtTrackRef.current) {
                    const t = pendingYtTrackRef.current;
                    pendingYtTrackRef.current = null;
                    ytPlayerRef.current.loadVideoById(t.youtubeId);
                    ytPlayerRef.current.playVideo();
                    setIsPlaying(true);
                  }
                },
                onStateChange: (event: any) => {
                  // YT.PlayerState.ENDED = 0, PLAYING = 1, PAUSED = 2
                  if (event.data === 0) {
                    handleNext();
                  } else if (event.data === 1) {
                    setIsPlaying(true);
                  } else if (event.data === 2) {
                    setIsPlaying(false);
                  }
                },
                onError: (err: any) => {
                  console.warn('YouTube Player error:', err);
                  // Seamlessly fallback to audio or procedural synth
                  if (audioRef.current && currentTrack?.url) {
                    audioRef.current.src = currentTrack.url;
                    audioRef.current.play().catch(() => {
                      lofiSynth.start(isMuted ? 0 : volume / 100);
                    });
                  }
                },
              },
            });
          } catch (e) {
            console.warn('YT.Player init failed:', e);
          }
        }
      }, 200);

      setTimeout(() => clearInterval(checkYT), 10000);
    });

    return () => {
      mounted = false;
    };
  }, []);

  // 3. Interval for checking YouTube currentTime & duration
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      if (currentTrack?.youtubeId && isYtReadyRef.current && ytPlayerRef.current?.getCurrentTime) {
        try {
          const curr = Math.round(ytPlayerRef.current.getCurrentTime() || 0);
          const dur = Math.round(ytPlayerRef.current.getDuration() || 0);
          setCurrentTime(curr);
          if (dur > 0 && dur !== duration) {
            setDuration(dur);
          }
        } catch {}
      }
    }, 500);

    return () => clearInterval(interval);
  }, [isPlaying, currentTrack, duration]);

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_PLAYLISTS_KEY, JSON.stringify(playlists));
    } catch (e) {
      console.warn('Could not save playlists:', e);
    }
  }, [playlists]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_LIKES_KEY, JSON.stringify(likedTrackIds));
    } catch (e) {
      console.warn('Could not save likes:', e);
    }
  }, [likedTrackIds]);

  // Volume synchronization
  useEffect(() => {
    const finalVol = isMuted ? 0 : volume;
    if (audioRef.current) {
      audioRef.current.volume = finalVol / 100;
    }
    if (ytPlayerRef.current?.setVolume) {
      try {
        ytPlayerRef.current.setVolume(finalVol);
        if (isMuted) {
          ytPlayerRef.current.mute();
        } else {
          ytPlayerRef.current.unMute();
        }
      } catch {}
    }
    if (isFallbackSynthRef.current) {
      lofiSynth.setVolume(finalVol / 100);
    }
    try {
      localStorage.setItem(STORAGE_VOLUME_KEY, String(volume));
    } catch {}
  }, [volume, isMuted]);

  const activePlaylist =
    playlists.find((p) => p.id === activePlaylistId) || playlists[0] || INITIAL_PLAYLISTS[0];

  const playTrack = useCallback(
    (track: Track, playlistId?: string) => {
      if (playlistId) {
        setActivePlaylistId(playlistId);
      }

      setCurrentTrack(track);
      setCurrentTime(0);
      setDuration(track.duration || 180);
      setIsPlaying(true);

      isFallbackSynthRef.current = false;
      lofiSynth.stop();

      // If YouTube track
      if (track.youtubeId) {
        // Pause any HTML audio
        if (audioRef.current) {
          audioRef.current.pause();
        }

        if (isYtReadyRef.current && ytPlayerRef.current?.loadVideoById) {
          try {
            ytPlayerRef.current.loadVideoById(track.youtubeId);
            ytPlayerRef.current.playVideo();
          } catch (e) {
            console.warn('YT loadVideoById failed:', e);
          }
        } else {
          pendingYtTrackRef.current = track;
        }
      } else if (track.url) {
        // Native HTML Audio
        if (ytPlayerRef.current?.pauseVideo) {
          try {
            ytPlayerRef.current.pauseVideo();
          } catch {}
        }

        const audio = audioRef.current;
        if (audio) {
          audio.src = track.url;
          audio.currentTime = 0;
          audio
            .play()
            .then(() => {
              isFallbackSynthRef.current = false;
            })
            .catch(() => {
              isFallbackSynthRef.current = true;
              lofiSynth.start(isMuted ? 0 : volume / 100);
            });
        }
      }
    },
    [isMuted, volume]
  );

  const togglePlay = useCallback(() => {
    if (!currentTrack) {
      if (activePlaylist.tracks.length > 0) {
        playTrack(activePlaylist.tracks[0]);
      }
      return;
    }

    if (isPlaying) {
      // Pause
      setIsPlaying(false);
      if (currentTrack.youtubeId && ytPlayerRef.current?.pauseVideo) {
        try {
          ytPlayerRef.current.pauseVideo();
        } catch {}
      } else if (audioRef.current) {
        audioRef.current.pause();
      }
      if (isFallbackSynthRef.current) {
        lofiSynth.stop();
      }
    } else {
      // Resume
      setIsPlaying(true);
      if (currentTrack.youtubeId && ytPlayerRef.current?.playVideo) {
        try {
          ytPlayerRef.current.playVideo();
        } catch {}
      } else if (isFallbackSynthRef.current) {
        lofiSynth.start(isMuted ? 0 : volume / 100);
      } else if (audioRef.current) {
        audioRef.current.play().catch(() => {
          isFallbackSynthRef.current = true;
          lofiSynth.start(isMuted ? 0 : volume / 100);
        });
      }
    }
  }, [currentTrack, isPlaying, activePlaylist, playTrack, isMuted, volume]);

  const pause = useCallback(() => {
    setIsPlaying(false);
    if (currentTrack?.youtubeId && ytPlayerRef.current?.pauseVideo) {
      try {
        ytPlayerRef.current.pauseVideo();
      } catch {}
    } else {
      audioRef.current?.pause();
    }
    if (isFallbackSynthRef.current) {
      lofiSynth.stop();
    }
  }, [currentTrack]);

  const resume = useCallback(() => {
    if (!currentTrack) return;
    setIsPlaying(true);
    if (currentTrack.youtubeId && ytPlayerRef.current?.playVideo) {
      try {
        ytPlayerRef.current.playVideo();
      } catch {}
    } else if (isFallbackSynthRef.current) {
      lofiSynth.start(isMuted ? 0 : volume / 100);
    } else {
      audioRef.current?.play().catch(() => {
        isFallbackSynthRef.current = true;
        lofiSynth.start(isMuted ? 0 : volume / 100);
      });
    }
  }, [currentTrack, isMuted, volume]);

  const handleNext = useCallback(() => {
    const tracks = activePlaylist.tracks;
    if (!tracks || tracks.length === 0) return;

    if (repeat === 'one' && currentTrack) {
      if (currentTrack.youtubeId && ytPlayerRef.current?.seekTo) {
        ytPlayerRef.current.seekTo(0);
        ytPlayerRef.current.playVideo();
      } else if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {});
      }
      setCurrentTime(0);
      return;
    }

    const currentIndex = tracks.findIndex((t) => t.id === currentTrack?.id);
    let nextIndex = 0;

    if (shuffle && tracks.length > 1) {
      do {
        nextIndex = Math.floor(Math.random() * tracks.length);
      } while (nextIndex === currentIndex);
    } else if (currentIndex >= 0) {
      nextIndex = currentIndex + 1;
      if (nextIndex >= tracks.length) {
        if (repeat === 'off') {
          setIsPlaying(false);
          pause();
          return;
        }
        nextIndex = 0;
      }
    }

    playTrack(tracks[nextIndex]);
  }, [activePlaylist, currentTrack, repeat, shuffle, playTrack, pause]);

  const nextTrack = handleNext;

  const prevTrack = useCallback(() => {
    const tracks = activePlaylist.tracks;
    if (!tracks || tracks.length === 0) return;

    if (currentTime > 3) {
      seek(0);
      return;
    }

    const currentIndex = tracks.findIndex((t) => t.id === currentTrack?.id);
    let prevIndex = currentIndex - 1;
    if (prevIndex < 0) {
      prevIndex = tracks.length - 1;
    }
    playTrack(tracks[prevIndex]);
  }, [activePlaylist, currentTrack, currentTime, playTrack]);

  const seek = useCallback(
    (seconds: number) => {
      const clamped = Math.max(0, Math.min(seconds, duration));
      setCurrentTime(clamped);
      if (currentTrack?.youtubeId && ytPlayerRef.current?.seekTo) {
        try {
          ytPlayerRef.current.seekTo(clamped, true);
        } catch {}
      } else if (audioRef.current && !isFallbackSynthRef.current) {
        audioRef.current.currentTime = clamped;
      }
    },
    [duration, currentTrack]
  );

  const setVolume = useCallback(
    (val: number) => {
      const clamped = Math.max(0, Math.min(100, Math.round(val)));
      setVolumeState(clamped);
      if (clamped > 0 && isMuted) {
        setIsMuted(false);
      }
    },
    [isMuted]
  );

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => !prev);
  }, []);

  const toggleShuffle = useCallback(() => {
    setShuffle((prev) => !prev);
  }, []);

  const toggleRepeat = useCallback(() => {
    setRepeat((prev) => (prev === 'off' ? 'all' : prev === 'all' ? 'one' : 'off'));
  }, []);

  const toggleLike = useCallback((trackId: string) => {
    setLikedTrackIds((prev) =>
      prev.includes(trackId) ? prev.filter((id) => id !== trackId) : [...prev, trackId]
    );
  }, []);

  const selectPlaylist = useCallback((id: string) => {
    setActivePlaylistId(id);
  }, []);

  const playPlaylist = useCallback(
    (playlistId: string) => {
      const pl = playlists.find((p) => p.id === playlistId);
      if (pl && pl.tracks.length > 0) {
        setActivePlaylistId(playlistId);
        playTrack(pl.tracks[0], playlistId);
      }
    },
    [playlists, playTrack]
  );

  const addTrackToPlaylist = useCallback(
    (playlistId: string, trackData: Omit<Track, 'id'>) => {
      // Check if YouTube URL or ID provided
      const rawUrl = trackData.url || '';
      const ytId = extractYouTubeId(rawUrl) || trackData.youtubeId;

      const newTrack: Track = {
        ...trackData,
        id: `custom-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        youtubeId: ytId || undefined,
        coverUrl: ytId ? getYouTubeThumbnail(ytId) : trackData.coverUrl,
        isCustom: true,
      };

      setPlaylists((prev) =>
        prev.map((pl) => {
          if (pl.id === playlistId) {
            return {
              ...pl,
              tracks: [...pl.tracks, newTrack],
            };
          }
          return pl;
        })
      );
    },
    []
  );

  const deleteTrack = useCallback((playlistId: string, trackId: string) => {
    setPlaylists((prev) =>
      prev.map((pl) => {
        if (pl.id === playlistId) {
          return {
            ...pl,
            tracks: pl.tracks.filter((t) => t.id !== trackId),
          };
        }
        return pl;
      })
    );
  }, []);

  const value: MusicContextType = {
    playlists,
    activePlaylist,
    activePlaylistId,
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    shuffle,
    repeat,
    likedTrackIds,
    selectPlaylist,
    playTrack,
    playPlaylist,
    togglePlay,
    pause,
    resume,
    nextTrack,
    prevTrack,
    seek,
    setVolume,
    toggleMute,
    toggleShuffle,
    toggleRepeat,
    toggleLike,
    addTrackToPlaylist,
    deleteTrack,
  };

  return (
    <MusicContext.Provider value={value}>
      {children}
      {/* Hidden container for YouTube IFrame Audio Engine */}
      <div
        id="youtube-player-mount-point"
        style={{
          position: 'fixed',
          bottom: 0,
          right: 0,
          width: '1px',
          height: '1px',
          opacity: 0.01,
          pointerEvents: 'none',
          overflow: 'hidden',
          zIndex: -1,
        }}
      >
        <div id="youtube-hidden-player-box" />
      </div>
    </MusicContext.Provider>
  );
}

export function useMusic(): MusicContextType {
  const ctx = useContext(MusicContext);
  if (!ctx) {
    throw new Error('useMusic must be used within a MusicProvider');
  }
  return ctx;
}
