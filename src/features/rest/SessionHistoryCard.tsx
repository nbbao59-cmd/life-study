import { Clock, Flame, History, Sparkles, Target, Trash2 } from 'lucide-react';
import React from 'react';
import type { PomodoroSession } from '../../types';

interface SessionHistoryCardProps {
  sessions: PomodoroSession[];
  onClear: () => void;
  className?: string;
}

function isToday(isoString: string): boolean {
  if (!isoString) return false;
  try {
    const d = new Date(isoString);
    const now = new Date();
    return (
      d.getFullYear() === now.getFullYear() &&
      d.getMonth() === now.getMonth() &&
      d.getDate() === now.getDate()
    );
  } catch {
    return false;
  }
}

function formatSessionTime(isoString: string): string {
  try {
    const d = new Date(isoString);
    const h = String(d.getHours()).padStart(2, '0');
    const m = String(d.getMinutes()).padStart(2, '0');
    return `${h}:${m}`;
  } catch {
    return '--:--';
  }
}

function formatDuration(totalMins: number): string {
  if (totalMins < 60) {
    return `${totalMins} phút`;
  }
  const h = Math.floor(totalMins / 60);
  const m = totalMins % 60;
  return m > 0 ? `${h}h ${m}p` : `${h} giờ`;
}

export default function SessionHistoryCard({
  sessions,
  onClear,
  className = '',
}: SessionHistoryCardProps) {
  // Filter sessions completed today
  const todaySessions = sessions.filter((s) => isToday(s.completedAt));

  // Compute today's focus stats
  const totalFocusSessions = todaySessions.filter((s) => s.mode === 'focus').length;
  const totalFocusMinutes = todaySessions
    .filter((s) => s.mode === 'focus')
    .reduce((sum, s) => sum + (s.durationMinutes || 0), 0);

  const handleClear = () => {
    if (todaySessions.length === 0) return;
    if (window.confirm('Bạn có chắc muốn xóa lịch sử các phiên hôm nay không?')) {
      onClear();
    }
  };

  return (
    <div className={`card session-history-card ${className}`}>
      {/* Header */}
      <div className="session-history-header">
        <div className="session-history-title-wrap">
          <History size={18} className="session-history-icon" />
          <h3 className="session-history-title">Lịch sử phiên hôm nay</h3>
          {todaySessions.length > 0 && (
            <span className="session-history-counter-badge">{todaySessions.length}</span>
          )}
        </div>

        {todaySessions.length > 0 && (
          <button
            type="button"
            className="btn ghost sm session-history-clear-btn"
            onClick={handleClear}
            title="Xóa danh sách phiên hôm nay"
          >
            <Trash2 size={13} />
            <span>Xóa hôm nay</span>
          </button>
        )}
      </div>

      {/* Summary Stats */}
      <div className="session-history-summary">
        <div className="session-summary-box">
          <div className="session-summary-icon-wrap sessions-ico">
            <Flame size={16} />
          </div>
          <div className="session-summary-content">
            <span className="session-summary-num">{totalFocusSessions}</span>
            <span className="session-summary-label">Phiên tập trung</span>
          </div>
        </div>

        <div className="session-summary-box">
          <div className="session-summary-icon-wrap time-ico">
            <Clock size={16} />
          </div>
          <div className="session-summary-content">
            <span className="session-summary-num">{formatDuration(totalFocusMinutes)}</span>
            <span className="session-summary-label">Thời gian tập trung</span>
          </div>
        </div>
      </div>

      {/* Sessions List */}
      <div className="session-history-body">
        {todaySessions.length === 0 ? (
          <div className="empty session-history-empty">
            <Sparkles size={24} className="session-empty-icon" />
            <span>Chưa có phiên hoàn thành nào hôm nay.</span>
            <small className="muted">Hãy đặt mục tiêu và bắt đầu phiên Pomodoro đầu tiên!</small>
          </div>
        ) : (
          <div className="session-history-list">
            {todaySessions.map((session) => (
              <div key={session.id} className="session-history-item">
                <div className="session-item-time" title="Thời điểm hoàn thành">
                  <Clock size={13} />
                  <span>{formatSessionTime(session.completedAt)}</span>
                </div>

                <div className="session-item-main">
                  <div className="session-item-goal-row">
                    <Target size={14} className="session-item-goal-ico" />
                    <span className="session-item-goal" title={session.goal || 'Phiên tập trung'}>
                      {session.goal ? session.goal : 'Phiên tập trung'}
                    </span>
                  </div>
                </div>

                <div className="session-item-meta">
                  <span className="badge session-duration-badge">
                    {session.durationMinutes ? `${session.durationMinutes}p` : '25p'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export { SessionHistoryCard };
