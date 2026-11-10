import {
  Clock3,
  ExternalLink,
  Heart,
  Music,
  Pause,
  Play,
  Plus,
  Radio,
  Search,
  Sparkles,
  Trash2,
  Video,
  X,
  Youtube,
} from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { useMusic } from '../../context/MusicContext';
import { extractYouTubeId } from '../../services/youtubeService';
import { Track } from '../../types/index';

function formatDuration(seconds: number): string {
  if (isNaN(seconds) || seconds <= 0) return '03:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function RelaxationZone() {
  const {
    playlists,
    activePlaylist,
    activePlaylistId,
    currentTrack,
    isPlaying,
    likedTrackIds,
    selectPlaylist,
    playTrack,
    playPlaylist,
    togglePlay,
    toggleLike,
    addTrackToPlaylist,
    deleteTrack,
  } = useMusic();

  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form states for adding custom track (supports YouTube URL or audio stream)
  const [newTitle, setNewTitle] = useState('');
  const [newArtist, setNewArtist] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newCover, setNewCover] = useState('');
  const [targetPlaylistId, setTargetPlaylistId] = useState(activePlaylistId);
  const [formError, setFormError] = useState('');

  // Filter tracks by search query
  const filteredTracks = useMemo(() => {
    if (!searchQuery.trim()) return activePlaylist.tracks;
    const q = searchQuery.toLowerCase();
    return activePlaylist.tracks.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.artist.toLowerCase().includes(q) ||
        t.album.toLowerCase().includes(q)
    );
  }, [activePlaylist.tracks, searchQuery]);

  // Total duration of current playlist in minutes
  const totalMinutes = useMemo(() => {
    const totalSecs = activePlaylist.tracks.reduce((acc, t) => acc + (t.duration || 180), 0);
    return Math.round(totalSecs / 60);
  }, [activePlaylist.tracks]);

  const isCurrentPlaylistPlaying =
    isPlaying && activePlaylist.tracks.some((t) => t.id === currentTrack?.id);

  const handleAddTrack = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!newTitle.trim()) {
      return setFormError('Vui lòng nhập tên bài hát.');
    }
    if (!newUrl.trim()) {
      return setFormError('Vui lòng nhập đường dẫn YouTube hoặc URL audio mp3.');
    }

    const ytId = extractYouTubeId(newUrl);
    if (!ytId) {
      try {
        new URL(newUrl);
      } catch {
        return setFormError('Liên kết không hợp lệ. Hãy dán link YouTube (youtu.be/...) hoặc link audio .mp3.');
      }
    }

    const targetPl = playlists.find((p) => p.id === targetPlaylistId);

    addTrackToPlaylist(targetPlaylistId, {
      title: newTitle.trim(),
      artist: newArtist.trim() || (ytId ? 'YouTube Creator' : 'Nghệ sĩ độc lập'),
      album: targetPl?.name.replace(/[^a-zA-Z0-9\sÀ-ỹ]/g, '').trim() || 'Bộ Sưu Tập Của Bạn',
      duration: 3600,
      url: newUrl.trim(),
      youtubeId: ytId || undefined,
      coverUrl: newCover.trim() || (ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : targetPl?.coverUrl),
    });

    setNewTitle('');
    setNewArtist('');
    setNewUrl('');
    setNewCover('');
    setShowAddModal(false);
  };

  const handleApplyPreset = (presetType: 'lofigirl' | 'ocean' | 'piano' | 'vchill') => {
    if (presetType === 'lofigirl') {
      setNewTitle('Lofi Girl - beats to relax/study to');
      setNewArtist('Lofi Girl Radio');
      setNewUrl('https://www.youtube.com/watch?v=jfKfPfyJRdk');
      setNewCover('https://img.youtube.com/vi/jfKfPfyJRdk/hqdefault.jpg');
    } else if (presetType === 'ocean') {
      setNewTitle('Ocean Waves & Relaxing Piano Music');
      setNewArtist('Relax River Ocean');
      setNewUrl('https://www.youtube.com/watch?v=bn9F19Hi1Lk');
      setNewCover('https://img.youtube.com/vi/bn9F19Hi1Lk/hqdefault.jpg');
    } else if (presetType === 'piano') {
      setNewTitle('Ghibli Studio Relaxing Piano Collection');
      setNewArtist('Studio Ghibli Piano');
      setNewUrl('https://www.youtube.com/watch?v=0K4oi54W6yQ');
      setNewCover('https://img.youtube.com/vi/0K4oi54W6yQ/hqdefault.jpg');
    } else {
      setNewTitle('Lofi Tiếng Việt Nhẹ Nhàng Học Bài');
      setNewArtist('V-Chill Official');
      setNewUrl('https://www.youtube.com/watch?v=1fugqzar79U');
      setNewCover('https://img.youtube.com/vi/1fugqzar79U/hqdefault.jpg');
    }
  };

  return (
    <div className="spotify-view-container">
      {/* 1. Spotify Playlist Hero Banner */}
      <section
        className="sp-hero-banner"
        style={{
          background: activePlaylist.gradient || 'linear-gradient(135deg, #082f49, #0284c7)',
        }}
      >
        <div className="sp-hero-cover-frame">
          <img
            src={activePlaylist.coverUrl}
            alt={activePlaylist.name}
            className="sp-hero-cover-img"
          />
        </div>

        <div className="sp-hero-info">
          <span className="sp-hero-tag">HẢI TRÌNH ÂM NHẠC · YOUTUBE & LOFI</span>
          <h1 className="sp-hero-title">{activePlaylist.name}</h1>
          <p className="sp-hero-desc">{activePlaylist.description}</p>
          <div className="sp-hero-meta">
            <span className="sp-meta-badge">🌊 Oasis Ocean Player</span>
            <span className="sp-meta-dot">•</span>
            <span>{activePlaylist.tracks.length} bài hát / luồng phát</span>
            <span className="sp-meta-dot">•</span>
            <span>Khoảng {totalMinutes} phút</span>
            <span className="sp-meta-dot">•</span>
            <span className="sp-meta-live">
              <Youtube size={14} className="live-icon" /> Gọi YouTube API trực tiếp trong web
            </span>
          </div>
        </div>
      </section>

      {/* 2. Action Controls Bar */}
      <div className="sp-action-toolbar">
        <button
          className="sp-big-play-btn"
          onClick={() => {
            if (isCurrentPlaylistPlaying) {
              togglePlay();
            } else {
              playPlaylist(activePlaylist.id);
            }
          }}
          title={isCurrentPlaylistPlaying ? 'Tạm dừng danh sách' : 'Phát toàn bộ danh sách'}
        >
          {isCurrentPlaylistPlaying ? (
            <Pause size={26} fill="#ffffff" />
          ) : (
            <Play size={26} fill="#ffffff" style={{ marginLeft: 3 }} />
          )}
        </button>

        <button
          className="sp-btn-secondary"
          onClick={() => {
            setTargetPlaylistId(activePlaylist.id);
            setShowAddModal(true);
          }}
        >
          <Plus size={16} /> Thêm bài hát / Link YouTube
        </button>

        <div className="sp-search-bar">
          <Search size={15} className="sp-search-ico" />
          <input
            type="text"
            placeholder="Tìm bài hát trong danh sách..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button className="sp-search-clear" onClick={() => setSearchQuery('')}>
              <X size={13} />
            </button>
          )}
        </div>
      </div>

      {/* 3. Playlist Selector Shelf (Tabs) */}
      <section className="sp-playlists-shelf">
        <div className="shelf-header">
          <h3>Khám phá Playlists Đại Dương</h3>
          <span className="shelf-subtitle">Chọn danh sách nhạc từ YouTube hoặc bộ sưu tập riêng</span>
        </div>

        <div className="sp-playlist-cards-grid">
          {playlists.map((pl) => {
            const isActive = pl.id === activePlaylistId;
            const isPlPlaying = isPlaying && pl.tracks.some((t) => t.id === currentTrack?.id);

            return (
              <div
                key={pl.id}
                className={`sp-playlist-card ${isActive ? 'is-active' : ''}`}
                onClick={() => selectPlaylist(pl.id)}
              >
                <div className="card-thumb-wrap">
                  <img src={pl.coverUrl} alt={pl.name} className="card-thumb" loading="lazy" />
                  <button
                    className={`card-floating-play ${isPlPlaying ? 'playing' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (isPlPlaying) {
                        togglePlay();
                      } else {
                        playPlaylist(pl.id);
                      }
                    }}
                    title={isPlPlaying ? 'Tạm dừng' : 'Phát ngay'}
                  >
                    {isPlPlaying ? (
                      <Pause size={18} fill="#ffffff" />
                    ) : (
                      <Play size={18} fill="#ffffff" style={{ marginLeft: 2 }} />
                    )}
                  </button>
                </div>
                <strong className="card-title">{pl.name}</strong>
                <span className="card-tracks-count">{pl.tracks.length} bài hát</span>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. Track Table List */}
      <section className="sp-track-table-section">
        <table className="sp-track-table">
          <thead>
            <tr>
              <th className="th-num">#</th>
              <th className="th-title">TIÊU ĐỀ & NGUỒN</th>
              <th className="th-artist">NGHỆ SĨ</th>
              <th className="th-album">DANH MỤC</th>
              <th className="th-time">
                <Clock3 size={15} />
              </th>
              <th className="th-actions">THAO TÁC</th>
            </tr>
          </thead>
          <tbody>
            {filteredTracks.length === 0 ? (
              <tr>
                <td colSpan={6} className="sp-empty-row">
                  <div className="empty-state-box">
                    <Music size={32} />
                    <p>Chưa có bài hát nào trong danh sách này.</p>
                    <button
                      className="sp-btn-secondary"
                      onClick={() => {
                        setTargetPlaylistId(activePlaylist.id);
                        setShowAddModal(true);
                      }}
                    >
                      <Plus size={14} /> Thêm bài hát / link YouTube ngay
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              filteredTracks.map((track, idx) => {
                const isTrackActive = currentTrack?.id === track.id;
                const isTrackPlaying = isTrackActive && isPlaying;
                const isLiked = likedTrackIds.includes(track.id);

                return (
                  <tr
                    key={track.id}
                    className={`sp-track-row ${isTrackActive ? 'active-track' : ''}`}
                    onDoubleClick={() => playTrack(track, activePlaylist.id)}
                  >
                    {/* Column 1: Index / Play Icon / Equalizer */}
                    <td className="td-num">
                      <div className="td-num-wrap">
                        {isTrackPlaying ? (
                          <div className="row-equalizer-bars">
                            <span className="r-bar b1" />
                            <span className="r-bar b2" />
                            <span className="r-bar b3" />
                          </div>
                        ) : (
                          <span className="row-index">{idx + 1}</span>
                        )}
                        <button
                          className="row-hover-play"
                          onClick={() => {
                            if (isTrackPlaying) {
                              togglePlay();
                            } else {
                              playTrack(track, activePlaylist.id);
                            }
                          }}
                          aria-label={isTrackPlaying ? 'Tạm dừng' : 'Phát bài hát'}
                        >
                          {isTrackPlaying ? (
                            <Pause size={14} fill="currentColor" />
                          ) : (
                            <Play size={14} fill="currentColor" />
                          )}
                        </button>
                      </div>
                    </td>

                    {/* Column 2: Title & Cover */}
                    <td className="td-title">
                      <div className="track-title-cell">
                        {track.coverUrl && (
                          <img
                            src={track.coverUrl}
                            alt=""
                            className="track-tiny-thumb"
                            loading="lazy"
                          />
                        )}
                        <div className="track-names">
                          <strong className="track-primary-title">
                            {track.title}
                            {track.youtubeId && (
                              <span className="yt-badge" title="Phát qua YouTube Player API">
                                <Youtube size={12} /> YouTube
                              </span>
                            )}
                          </strong>
                          <span className="track-sub-artist">{track.artist}</span>
                        </div>
                      </div>
                    </td>

                    {/* Column 3: Artist */}
                    <td className="td-artist">{track.artist}</td>

                    {/* Column 4: Album */}
                    <td className="td-album">{track.album}</td>

                    {/* Column 5: Duration */}
                    <td className="td-time">{formatDuration(track.duration)}</td>

                    {/* Column 6: Actions */}
                    <td className="td-actions">
                      <div className="row-action-btns">
                        <button
                          className={`sp-row-action-btn ${isLiked ? 'liked' : ''}`}
                          onClick={() => toggleLike(track.id)}
                          title={isLiked ? 'Bỏ thích' : 'Yêu thích'}
                        >
                          <Heart size={15} fill={isLiked ? 'currentColor' : 'none'} />
                        </button>

                        {track.youtubeId && (
                          <a
                            href={`https://www.youtube.com/watch?v=&#36;{track.youtubeId}`}
                            target="_blank"
                            rel="noreferrer"
                            className="sp-row-action-btn yt-link-icon"
                            title="Mở trên YouTube"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <ExternalLink size={14} />
                          </a>
                        )}

                        {track.isCustom && (
                          <button
                            className="sp-row-action-btn danger"
                            onClick={() => deleteTrack(activePlaylist.id, track.id)}
                            title="Xóa bài hát khỏi playlist"
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </section>

      {/* 5. Modal: Add New Track */}
      {showAddModal && (
        <div className="sp-modal-backdrop" onClick={() => setShowAddModal(false)}>
          <div className="sp-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="sp-modal-header">
              <div className="header-icon-badge">
                <Youtube size={22} />
              </div>
              <div className="header-copy">
                <h3>Thêm nhạc YouTube hoặc URL Audio</h3>
                <p>Dán link YouTube (youtu.be/...) hoặc link audio .mp3 để phát ngay trong web</p>
              </div>
              <button className="sp-modal-close" onClick={() => setShowAddModal(false)}>
                <X size={18} />
              </button>
            </div>

            {/* Quick Presets */}
            <div className="sp-presets-wrap">
              <span className="preset-label">
                <Sparkles size={13} /> Nhạc YouTube tuyển chọn:
              </span>
              <div className="preset-chips">
                <button
                  type="button"
                  className="preset-chip yt-chip"
                  onClick={() => handleApplyPreset('lofigirl')}
                >
                  <Youtube size={12} /> Lofi Girl Live
                </button>
                <button
                  type="button"
                  className="preset-chip yt-chip"
                  onClick={() => handleApplyPreset('ocean')}
                >
                  🌊 Sóng Biển Piano
                </button>
                <button
                  type="button"
                  className="preset-chip yt-chip"
                  onClick={() => handleApplyPreset('piano')}
                >
                  🎹 Ghibli Piano
                </button>
                <button
                  type="button"
                  className="preset-chip yt-chip"
                  onClick={() => handleApplyPreset('vchill')}
                >
                  🇻🇳 V-Chill Acoustic
                </button>
              </div>
            </div>

            <form className="sp-add-form" onSubmit={handleAddTrack}>
              <div className="form-group">
                <label>Chọn Playlist đích</label>
                <select
                  value={targetPlaylistId}
                  onChange={(e) => setTargetPlaylistId(e.target.value)}
                >
                  {playlists.map((pl) => (
                    <option key={pl.id} value={pl.id}>
                      {pl.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Đường dẫn YouTube URL hoặc link .mp3 *</label>
                <input
                  type="text"
                  placeholder="https://www.youtube.com/watch?v=... hoặc https://youtu.be/..."
                  value={newUrl}
                  onChange={(e) => {
                    const val = e.target.value;
                    setNewUrl(val);
                    const ytId = extractYouTubeId(val);
                    if (ytId && !newCover) {
                      setNewCover(`https://img.youtube.com/vi/${ytId}/hqdefault.jpg`);
                    }
                  }}
                  autoFocus
                />
                <small className="field-hint">
                  Hỗ trợ link video YouTube bất kỳ, luồng Live Stream hoặc link file audio mp3.
                </small>
              </div>

              <div className="form-group">
                <label>Tên bài hát / Tiêu đề *</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Lofi Hip Hop Beats, Sóng Biển Đêm..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Tên nghệ sĩ / Kênh</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Lofi Girl, ChillHop Music..."
                  value={newArtist}
                  onChange={(e) => setNewArtist(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Ảnh bìa (Tự động lấy ảnh YouTube nếu để trống)</label>
                <input
                  type="url"
                  placeholder="https://img.youtube.com/vi/... hoặc link ảnh"
                  value={newCover}
                  onChange={(e) => setNewCover(e.target.value)}
                />
              </div>

              {formError && <div className="sp-form-error">{formError}</div>}

              <div className="sp-modal-footer">
                <button
                  type="button"
                  className="sp-btn-cancel"
                  onClick={() => setShowAddModal(false)}
                >
                  Hủy bỏ
                </button>
                <button type="submit" className="sp-btn-submit">
                  <Plus size={16} /> Thêm vào Playlist
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
