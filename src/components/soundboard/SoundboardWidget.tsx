import React, { useEffect, useRef, useState } from 'react';
import { Clock, Headphones, Pause, Play, Volume2, VolumeX, X } from 'lucide-react';
import { useSound } from '../../context/SoundContext';
import { SoundChannelId } from '../../types';
import ChannelRow from './ChannelRow';

const CHANNEL_IDS: SoundChannelId[] = [
  'rain',
  'waves',
  'brownNoise',
  'whiteNoise',
  'cafe',
  'campfire',
  'birds',
];

const TIMER_OPTIONS = [
  { label: 'Tắt', value: null },
  { label: '15p', value: 15 },
  { label: '30p', value: 30 },
  { label: '45p', value: 45 },
  { label: '60p', value: 60 },
];

function formatCountdown(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}

export default function SoundboardWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const {
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
  } = useSound();

  const activeChannelCount = Object.values(channels).filter((c) => c.enabled).length;
  const isAudioActive = isPlayingMaster && activeChannelCount > 0;

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  return (
    <div className="sound-widget-container" ref={containerRef}>
      {/* Floating Action Button */}
      <button
        type="button"
        className={`sound-widget-btn ${isAudioActive ? 'wave-pulse' : ''} ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Bảng điều khiển âm thanh tập trung"
        aria-expanded={isOpen}
        title="Âm thanh tập trung"
      >
        <span className="sound-widget-icon">
          {isAudioActive ? <Volume2 size={24} /> : <Headphones size={24} />}
        </span>
        {activeChannelCount > 0 && (
          <span className="sound-widget-badge" title={`${activeChannelCount} kênh đang bật`}>
            {activeChannelCount}
          </span>
        )}
      </button>

      {/* Floating Popover / Mixer Card */}
      {isOpen && (
        <div className="sound-popover" role="dialog" aria-modal="true" aria-label="Bộ trộn âm thanh tập trung">
          {/* Header */}
          <div className="sound-popover-header">
            <div className="sound-popover-title-wrap">
              <Headphones size={18} className="sound-header-icon" />
              <h3 className="sound-popover-title">Âm thanh tập trung</h3>
            </div>
            <div className="sound-header-actions">
              <button
                type="button"
                className={`sound-master-toggle-btn ${isPlayingMaster ? 'playing' : ''}`}
                onClick={toggleMaster}
                title={isPlayingMaster ? 'Tắt tất cả âm thanh' : 'Bật tất cả âm thanh'}
              >
                {isPlayingMaster ? (
                  <>
                    <Pause size={13} />
                    <span>Tắt tất cả</span>
                  </>
                ) : (
                  <>
                    <Play size={13} />
                    <span>Bật tất cả</span>
                  </>
                )}
              </button>
              <button
                type="button"
                className="icon-btn sound-close-btn"
                onClick={() => setIsOpen(false)}
                aria-label="Đóng cửa sổ"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          <div className="sound-popover-body">
            {/* Master Volume Slider */}
            <div className="sound-master-section">
              <div className="sound-master-meta">
                <span className="sound-section-label">Âm lượng tổng</span>
                <span className="sound-master-value">{masterVolume}%</span>
              </div>
              <div className="sound-master-slider-row">
                <button
                  type="button"
                  className="sound-icon-mute-btn"
                  onClick={toggleMaster}
                  aria-label={isPlayingMaster ? 'Tắt âm lượng tổng' : 'Bật âm lượng tổng'}
                  title={isPlayingMaster ? 'Tắt âm' : 'Bật âm'}
                >
                  {isAudioActive && masterVolume > 0 ? (
                    <Volume2 size={16} />
                  ) : (
                    <VolumeX size={16} />
                  )}
                </button>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={masterVolume}
                  onChange={(e) => setMasterVolume(Number(e.target.value))}
                  className="sound-master-slider"
                  aria-label="Thanh trượt âm lượng tổng"
                />
              </div>
            </div>

            {/* Channels List */}
            <div className="sound-channels-section">
              <div className="sound-channels-header">
                <span className="sound-section-label">Kênh âm thanh</span>
                <span className="sound-channels-count">
                  {activeChannelCount}/{CHANNEL_IDS.length} bật
                </span>
              </div>
              <div className="sound-channels-list">
                {CHANNEL_IDS.map((id) => (
                  <ChannelRow
                    key={id}
                    channel={channels[id]}
                    onToggle={() => toggleChannel(id)}
                    onVolumeChange={(val) => setChannelVolume(id, val)}
                  />
                ))}
              </div>
            </div>

            {/* Sleep Timer Selector */}
            <div className="sound-timer-section">
              <div className="sound-timer-header">
                <div className="sound-timer-title-wrap">
                  <Clock size={14} className="sound-timer-icon" />
                  <span className="sound-section-label">Hẹn giờ tắt</span>
                </div>
                {sleepTimerRemaining !== null && sleepTimerRemaining > 0 && (
                  <span className="sound-timer-countdown">
                    còn {formatCountdown(sleepTimerRemaining)}
                  </span>
                )}
              </div>
              <div className="sound-timer-chips">
                {TIMER_OPTIONS.map((opt) => {
                  const isSelected = sleepTimerMinutes === opt.value;
                  return (
                    <button
                      key={opt.label}
                      type="button"
                      className={`sound-timer-chip ${isSelected ? 'active' : ''}`}
                      onClick={() => setSleepTimer(opt.value)}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
