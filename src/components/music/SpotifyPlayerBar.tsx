import {
  Heart,
  ListMusic,
  Pause,
  Play,
  Repeat,
  Repeat1,
  Shuffle,
  SkipBack,
  SkipForward,
  Volume1,
  Volume2,
  VolumeX,
} from 'lucide-react';
import React, { useCallback, useMemo } from 'react';
import { useMusic } from '../../context/MusicContext';

interface Props {
  onOpenRelaxZone?: () => void;
}

function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '00:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export default function SpotifyPlayerBar({ onOpenRelaxZone }: Props) {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    shuffle,
    repeat,
    likedTrackIds,
    togglePlay,
    nextTrack,
    prevTrack,
    seek,
    setVolume,
    toggleMute,
    toggleShuffle,
    toggleRepeat,
    toggleLike,
  } = useMusic();

  const isLiked = currentTrack ? likedTrackIds.includes(currentTrack.id) : false;

  const progressPercent = useMemo(() => {
    if (!duration || duration <= 0) return 0;
    return Math.min(100, Math.max(0, (currentTime / duration) * 100));
  }, [currentTime, duration]);

  const handleSeekChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = Number(e.target.value);
      seek(val);
    },
    [seek]
  );

  const handleVolumeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setVolume(Number(e.target.value));
    },
    [setVolume]
  );

  return (
    <div className="spotify-player-bar" role="region" aria-label="Thanh phát nhạc nền Spotify">
      {/* 1. Left: Track Info & Artwork */}
      <div className="sp-left">
        {currentTrack ? (
          <>
            <div
              className="sp-cover-wrap"
              onClick={onOpenRelaxZone}
              title="Mở khu vực Thư giãn"
            >
              {currentTrack.coverUrl ? (
                <img
                  src={currentTrack.coverUrl}
                  alt={currentTrack.title}
                  className="sp-cover-img"
                  loading="lazy"
                />
              ) : (
                <div className="sp-cover-placeholder">🎧</div>
              )}
              {isPlaying && (
                <div className="sp-cover-wave-overlay">
                  <span className="mini-wave-bar b1" />
                  <span className="mini-wave-bar b2" />
                  <span className="mini-wave-bar b3" />
                </div>
              )}
            </div>

            <div className="sp-track-meta">
              <strong
                className="sp-track-title"
                onClick={onOpenRelaxZone}
                title={currentTrack.title}
              >
                {currentTrack.title}
              </strong>
              <span className="sp-track-artist">
                {currentTrack.artist}
                {currentTrack.youtubeId && <span className="yt-badge">YouTube</span>}
              </span>
            </div>

            <button
              className={`sp-btn-icon sp-like-btn ${isLiked ? 'liked' : ''}`}
              onClick={() => toggleLike(currentTrack.id)}
              aria-label={isLiked ? 'Bỏ thích' : 'Yêu thích bài này'}
              title={isLiked ? 'Đã yêu thích' : 'Thêm vào yêu thích'}
            >
              <Heart size={16} fill={isLiked ? 'currentColor' : 'none'} />
            </button>
          </>
        ) : (
          <div className="sp-empty-hint" onClick={onOpenRelaxZone}>
            <span className="sp-empty-icon">🎵</span>
            <span>Chọn bài hát trong Thư giãn để phát nhạc nền</span>
          </div>
        )}
      </div>

      {/* 2. Center: Controls & Seek Bar */}
      <div className="sp-center">
        <div className="sp-controls-row">
          <button
            className={`sp-btn-icon sp-shuffle-btn ${shuffle ? 'active' : ''}`}
            onClick={toggleShuffle}
            title={shuffle ? 'Tắt phát ngẫu nhiên' : 'Bật phát ngẫu nhiên'}
            aria-label="Phát ngẫu nhiên"
          >
            <Shuffle size={16} />
            {shuffle && <span className="sp-active-dot" />}
          </button>

          <button
            className="sp-btn-icon sp-prev-btn"
            onClick={prevTrack}
            title="Bài trước đó"
            aria-label="Bài trước đó"
          >
            <SkipBack size={19} />
          </button>

          <button
            className="sp-play-circle-btn"
            onClick={togglePlay}
            title={isPlaying ? 'Tạm dừng (Pause)' : 'Phát nhạc (Play)'}
            aria-label={isPlaying ? 'Tạm dừng' : 'Phát tiếp'}
          >
            {isPlaying ? <Pause size={20} fill="#ffffff" /> : <Play size={20} fill="#ffffff" />}
          </button>

          <button
            className="sp-btn-icon sp-next-btn"
            onClick={nextTrack}
            title="Bài kế tiếp"
            aria-label="Bài kế tiếp"
          >
            <SkipForward size={19} />
          </button>

          <button
            className={`sp-btn-icon sp-repeat-btn ${repeat !== 'off' ? 'active' : ''}`}
            onClick={toggleRepeat}
            title={
              repeat === 'one'
                ? 'Đang lặp lại bài này (bấm để tắt)'
                : repeat === 'all'
                ? 'Đang lặp lại danh sách (bấm để lặp lại 1 bài)'
                : 'Không lặp lại (bấm để bật)'
            }
            aria-label="Chế độ lặp lại"
          >
            {repeat === 'one' ? <Repeat1 size={17} /> : <Repeat size={16} />}
            {repeat !== 'off' && <span className="sp-active-dot" />}
          </button>
        </div>

        <div className="sp-progress-row">
          <span className="sp-time-text">{formatTime(currentTime)}</span>
          <div className="sp-slider-container">
            <input
              type="range"
              min={0}
              max={duration || 100}
              value={currentTime}
              onChange={handleSeekChange}
              className="sp-progress-slider"
              style={{
                background: `linear-gradient(to right, var(--primary-bright, #0284c7) ${progressPercent}%, rgba(200, 215, 225, 0.4) ${progressPercent}%)`,
              }}
              aria-label="Tua bài hát"
            />
          </div>
          <span className="sp-time-text total">{formatTime(duration)}</span>
        </div>
      </div>

      {/* 3. Right: Volume & Shortcuts */}
      <div className="sp-right">
        {isPlaying && (
          <div className="sp-visualizer-bars" title="Đang phát nhạc nền">
            <span className="eq-bar bar-1" />
            <span className="eq-bar bar-2" />
            <span className="eq-bar bar-3" />
            <span className="eq-bar bar-4" />
          </div>
        )}

        {onOpenRelaxZone && (
          <button
            className="sp-btn-icon sp-queue-btn"
            onClick={onOpenRelaxZone}
            title="Mở toàn màn hình danh sách phát Spotify"
            aria-label="Danh sách phát"
          >
            <ListMusic size={18} />
          </button>
        )}

        <div className="sp-volume-group">
          <button
            className="sp-btn-icon sp-vol-btn"
            onClick={toggleMute}
            title={isMuted ? 'Bật âm lượng' : 'Tắt tiếng'}
            aria-label="Âm lượng"
          >
            {isMuted || volume === 0 ? (
              <VolumeX size={17} />
            ) : volume < 50 ? (
              <Volume1 size={17} />
            ) : (
              <Volume2 size={17} />
            )}
          </button>

          <input
            type="range"
            min={0}
            max={100}
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            className="sp-volume-slider"
            style={{
              background: `linear-gradient(to right, var(--primary-bright, #0284c7) ${
                isMuted ? 0 : volume
              }%, rgba(200, 215, 225, 0.4) ${isMuted ? 0 : volume}%)`,
            }}
            aria-label="Thanh điều chỉnh âm lượng"
          />
        </div>
      </div>
    </div>
  );
}
