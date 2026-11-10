import { Calendar, Clock, Sparkles, SunMedium, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';
import { MOODS, NAV } from '../../data/options';
import { Mood, SectionId } from '../../types';

interface Props {
  section: SectionId;
  energy: number;
  mood: Mood;
  onEnergy: (n: number) => void;
  onMood: (m: Mood) => void;
}

export default function Header({ section, energy, mood, onEnergy, onMood }: Props) {
  const currentNav = NAV.find((n) => n.id === section);
  const [time, setTime] = useState(() =>
    new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }));
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  const dateStr = new Date().toLocaleDateString('vi-VN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <header className="topbar">
      <div className="topbar-welcome">
        <div className="topbar-badge">
          <Sparkles size={14} className="sparkle-ico" />
          <span>Oasis Island · Đảo Nhịp Sống</span>
        </div>
        <h1 className="topbar-title">
          {section === 'dashboard' ? 'Chào mừng trở lại! 🌊' : currentNav?.label}
        </h1>
        <p className="topbar-subtitle">
          {section === 'dashboard'
            ? 'Tổng quan không gian học tập, thói quen và năng lượng của bạn hôm nay 🏝️'
            : currentNav?.hint}
        </p>
      </div>

      <div className="topbar-widgets">
        {/* Island Real-time Info Pill */}
        <div className="island-meta-card">
          <div className="island-meta-row">
            <span className="meta-item">
              <Calendar size={13} />
              <span>{dateStr}</span>
            </span>
            <span className="meta-dot">•</span>
            <span className="meta-item">
              <SunMedium size={13} />
              <span>Biển xanh · 26°C</span>
            </span>
            <span className="meta-dot">•</span>
            <span className="meta-item">
              <Clock size={13} />
              <strong className="time-highlight">{time}</strong>
            </span>
          </div>

          <div className="island-status-controls">
            <div className="status-mini-group">
              <span className="status-mini-label">
                <Zap size={12} /> Năng lượng
              </span>
              <div className="seg" role="group" aria-label="Mức năng lượng">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    className={energy === n ? 'on' : ''}
                    onClick={() => onEnergy(n)}
                    aria-pressed={energy === n}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            <div className="status-mini-group">
              <span className="status-mini-label">Tâm trạng</span>
              <div className="seg mood" role="group" aria-label="Tâm trạng">
                {MOODS.map((m) => (
                  <button
                    key={m.id}
                    className={mood === m.id ? 'on' : ''}
                    onClick={() => onMood(m.id)}
                    title={m.label}
                    aria-label={m.label}
                    aria-pressed={mood === m.id}
                  >
                    {m.emoji}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Character Avatar Badge */}
        <div className="island-avatar-badge" title="Đảo chủ Nhịp Sống">
          <div className="avatar-frame">
            <span className="avatar-emoji">🧑‍🌾</span>
          </div>
          <span className="avatar-leaf">🍃</span>
        </div>
      </div>
    </header>
  );
}
