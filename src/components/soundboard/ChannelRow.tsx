import React from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { SoundChannelConfig } from '../../types';

interface ChannelRowProps {
  channel: SoundChannelConfig;
  onToggle: () => void;
  onVolumeChange: (volume: number) => void;
}

export default function ChannelRow({ channel, onToggle, onVolumeChange }: ChannelRowProps) {
  return (
    <div className={`channel-row ${channel.enabled ? 'active' : ''}`}>
      <button
        type="button"
        className={`channel-toggle-btn ${channel.enabled ? 'active' : ''}`}
        onClick={onToggle}
        aria-label={`${channel.enabled ? 'Tắt' : 'Bật'} kênh ${channel.name}`}
        title={`${channel.enabled ? 'Tắt' : 'Bật'} ${channel.name}`}
      >
        <span className="channel-icon" aria-hidden="true">{channel.icon}</span>
      </button>

      <div className="channel-body">
        <div className="channel-meta">
          <span className="channel-name">{channel.name}</span>
          <span className="channel-volume-text">{channel.volume}%</span>
        </div>
        <div className="channel-slider-container">
          <input
            type="range"
            min="0"
            max="100"
            step="1"
            value={channel.volume}
            onChange={(e) => onVolumeChange(Number(e.target.value))}
            className="channel-slider"
            aria-label={`Âm lượng ${channel.name}`}
          />
        </div>
      </div>

      <button
        type="button"
        className={`channel-mute-btn ${channel.enabled ? 'active' : ''}`}
        onClick={onToggle}
        aria-label={`${channel.enabled ? 'Tắt' : 'Bật'} kênh ${channel.name}`}
        title={`${channel.enabled ? 'Tắt' : 'Bật'} ${channel.name}`}
      >
        {channel.enabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
      </button>
    </div>
  );
}
