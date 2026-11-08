import { Coffee, Pause, Play, RotateCcw, Target } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import PageTitle from '../../components/ui/PageTitle';
import { useSound } from '../../context/SoundContext';
import type { PomodoroSession } from '../../types';
import QuickNotesCard from './QuickNotesCard';
import SessionHistoryCard from './SessionHistoryCard';

type Mode = 'focus' | 'short' | 'long';

const MODES: Record<Mode, { label: string; seconds: number }> = {
  focus: { label: 'Tập trung', seconds: 25 * 60 },
  short: { label: 'Nghỉ ngắn', seconds: 5 * 60 },
  long: { label: 'Nghỉ dài', seconds: 15 * 60 },
};

const STRETCHES = [
  { id: 'neck', emoji: '🧘', title: 'Xoay cổ & vai', desc: '10 vòng mỗi chiều, thả lỏng vai' },
  { id: 'wrist', emoji: '🖐️', title: 'Giãn cổ tay', desc: 'Duỗi tay, kéo nhẹ các ngón 15 giây' },
  { id: 'back', emoji: '🙆', title: 'Vươn người', desc: 'Giơ hai tay qua đầu, nghiêng trái/phải' },
  { id: 'eyes', emoji: '👀', title: 'Quy tắc 20-20-20', desc: 'Nhìn xa 20 feet (~6 m) trong 20 giây' },
];

const SESSIONS_STORAGE_KEY = 'life-study-sessions';

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

function loadInitialSessions(): PomodoroSession[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(SESSIONS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error('Failed to parse pomodoro sessions from localStorage', e);
    return [];
  }
}

interface Props {
  water: number;
  setWater: React.Dispatch<React.SetStateAction<number>>;
}

const fmtTime = (s: number) =>
  `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

export default function RestZone({ water, setWater }: Props) {
  const { playChime } = useSound();
  const [mode, setMode] = useState<Mode>('focus');
  const [remaining, setRemaining] = useState(MODES.focus.seconds);
  const [running, setRunning] = useState(false);
  const [goal, setGoal] = useState('');
  const [sessionsList, setSessionsList] = useState<PomodoroSession[]>(loadInitialSessions);
  const [doneStretch, setDoneStretch] = useState<string[]>([]);

  // Synchronize sessionsList to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(sessionsList));
    } catch (e) {
      console.error('Failed to save sessions to localStorage', e);
    }
  }, [sessionsList]);

  const switchMode = (m: Mode) => {
    setMode(m);
    setRemaining(MODES[m].seconds);
    setRunning(false);
  };

  // Timer interval countdown
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [running]);

  // Handle timer completion (remaining === 0)
  useEffect(() => {
    if (remaining > 0 || !running) return;

    // Trigger peaceful chime sound
    playChime();

    if (mode === 'focus') {
      const completedSession: PomodoroSession = {
        id: `pomo-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        goal: goal.trim() || 'Phiên tập trung',
        mode: 'focus',
        durationMinutes: Math.round(MODES.focus.seconds / 60),
        completedAt: new Date().toISOString(),
      };

      setSessionsList((prev) => [completedSession, ...prev]);

      // Calculate next break based on focus sessions today
      const todayFocusCount = sessionsList.filter(
        (s) => s.mode === 'focus' && isToday(s.completedAt)
      ).length + 1;
      const nextMode: Mode = todayFocusCount % 4 === 0 ? 'long' : 'short';

      setMode(nextMode);
      setRemaining(MODES[nextMode].seconds);
      setRunning(false);
    } else {
      // Break finished, return to focus mode
      setMode('focus');
      setRemaining(MODES.focus.seconds);
      setRunning(false);
    }
  }, [remaining, running, mode, goal, sessionsList, playChime]);

  // Update document title with remaining time
  useEffect(() => {
    document.title = running
      ? `${fmtTime(remaining)} · ${MODES[mode].label}`
      : 'Life & Study Dashboard';
    return () => {
      document.title = 'Life & Study Dashboard';
    };
  }, [running, remaining, mode]);

  const handleClearTodaySessions = () => {
    setSessionsList((prev) => prev.filter((s) => !isToday(s.completedAt)));
  };

  const todayCompletedFocusCount = sessionsList.filter(
    (s) => s.mode === 'focus' && isToday(s.completedAt)
  ).length;

  const total = MODES[mode].seconds;
  const R = 96;
  const C = 2 * Math.PI * R;

  return (
    <div className="stack">
      <PageTitle
        icon={<Coffee size={22} />}
        title="Khu vực nghỉ ngơi"
        subtitle="Pomodoro 25/5/15, mục tiêu học tập, giãn cơ và sổ tay nhanh"
      />

      <div className="grid cols-2 rest-zone-grid">
        {/* Left Column: Pomodoro Timer & Session History */}
        <div className="stack">
          {/* Pomodoro Timer Card */}
          <div className="card pomodoro-card">
            {/* Mode selection chips */}
            <div className="chips" style={{ justifyContent: 'center' }}>
              {(Object.keys(MODES) as Mode[]).map((m) => (
                <button
                  key={m}
                  type="button"
                  className={`chip ${mode === m ? 'on' : ''}`}
                  onClick={() => switchMode(m)}
                >
                  {MODES[m].label}
                </button>
              ))}
            </div>

            {/* Session Goal Input */}
            <div className="pomodoro-goal-row">
              <label htmlFor="pomodoro-goal-input" className="pomodoro-goal-label">
                <Target size={14} className="pomodoro-goal-icon" />
                <span>Mục tiêu phiên tập trung</span>
              </label>
              <input
                id="pomodoro-goal-input"
                type="text"
                className="pomodoro-goal-input"
                placeholder="Mục tiêu phiên này (vd: Ôn 20 từ vựng)..."
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                disabled={running}
              />
            </div>

            {/* Circular Timer Display */}
            <div className="timer-wrap">
              <div className="ring">
                <svg width="220" height="220" viewBox="0 0 220 220">
                  <circle
                    cx="110"
                    cy="110"
                    r={R}
                    fill="none"
                    stroke="var(--accent-soft)"
                    strokeWidth="14"
                  />
                  <circle
                    cx="110"
                    cy="110"
                    r={R}
                    fill="none"
                    stroke="var(--accent)"
                    strokeWidth="14"
                    strokeLinecap="round"
                    strokeDasharray={C}
                    strokeDashoffset={C * (1 - remaining / total)}
                    style={{ transition: 'stroke-dashoffset 1s linear' }}
                  />
                </svg>
                <div className="ring-time">
                  <div>
                    {fmtTime(Math.max(remaining, 0))}
                    <small>{MODES[mode].label}</small>
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className="row">
                <button
                  type="button"
                  className="btn"
                  onClick={() => setRunning((r) => !r)}
                >
                  {running ? (
                    <>
                      <Pause size={16} /> Tạm dừng
                    </>
                  ) : (
                    <>
                      <Play size={16} /> Bắt đầu
                    </>
                  )}
                </button>
                <button
                  type="button"
                  className="btn ghost"
                  onClick={() => switchMode(mode)}
                >
                  <RotateCcw size={16} /> Đặt lại
                </button>
              </div>

              <span className="muted">
                Đã hoàn thành {todayCompletedFocusCount} phiên tập trung hôm nay
              </span>
            </div>
          </div>

          {/* Session History Card */}
          <SessionHistoryCard
            sessions={sessionsList}
            onClear={handleClearTodaySessions}
          />
        </div>

        {/* Right Column: Quick Notes & Wellness */}
        <div className="stack">
          {/* Quick Notes Card */}
          <QuickNotesCard />

          {/* Water Tracker Card */}
          <div className="card">
            <h3>💧 Uống nước ({water}/8 ly)</h3>
            <div className="water">
              {Array.from({ length: 8 }, (_, i) => (
                <button
                  key={i}
                  type="button"
                  className={`glass ${i < water ? 'on' : ''}`}
                  onClick={() => setWater(i + 1 === water ? i : i + 1)}
                  aria-label={`Ly thứ ${i + 1}`}
                >
                  {i < water ? '💧' : ''}
                </button>
              ))}
            </div>
          </div>

          {/* Stretch Exercises Card */}
          <div className="card">
            <h3>🤸 Bài tập duỗi người</h3>
            <div className="stack" style={{ gap: 8 }}>
              {STRETCHES.map((s) => {
                const on = doneStretch.includes(s.id);
                return (
                  <button
                    key={s.id}
                    type="button"
                    className={`stretch ${on ? 'on' : ''}`}
                    onClick={() =>
                      setDoneStretch((p) =>
                        on ? p.filter((x) => x !== s.id) : [...p, s.id]
                      )
                    }
                  >
                    <span style={{ fontSize: 22 }}>{s.emoji}</span>
                    <span style={{ flex: 1 }}>
                      <strong>{s.title}</strong>
                      <div className="muted">{s.desc}</div>
                    </span>
                    <span>{on ? '✅' : ''}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
