import { Coffee, Pause, Play, RotateCcw } from 'lucide-react';
import { useEffect, useState } from 'react';
import PageTitle from '../../components/ui/PageTitle';

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

interface Props {
  water: number;
  setWater: React.Dispatch<React.SetStateAction<number>>;
}

const fmtTime = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

export default function RestZone({ water, setWater }: Props) {
  const [mode, setMode] = useState<Mode>('focus');
  const [remaining, setRemaining] = useState(MODES.focus.seconds);
  const [running, setRunning] = useState(false);
  const [sessions, setSessions] = useState(0);
  const [doneStretch, setDoneStretch] = useState<string[]>([]);

  const switchMode = (m: Mode) => {
    setMode(m);
    setRemaining(MODES[m].seconds);
    setRunning(false);
  };

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setRemaining((r) => r - 1), 1000);
    return () => clearInterval(id);
  }, [running]);

  useEffect(() => {
    if (remaining > 0 || !running) return;
    if (mode === 'focus') {
      const n = sessions + 1;
      setSessions(n);
      switchMode(n % 4 === 0 ? 'long' : 'short');
    } else {
      switchMode('focus');
    }
  }, [remaining]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    document.title = running ? `${fmtTime(remaining)} · ${MODES[mode].label}` : 'Life & Study Dashboard';
    return () => { document.title = 'Life & Study Dashboard'; };
  }, [running, remaining, mode]);

  const total = MODES[mode].seconds;
  const R = 96;
  const C = 2 * Math.PI * R;

  return (
    <div className="stack">
      <PageTitle icon={<Coffee size={22} />} title="Khu vực nghỉ ngơi" subtitle="Pomodoro 25/5/15, giãn cơ và uống nước" />

      <div className="grid cols-2">
        <div className="card">
          <div className="chips" style={{ justifyContent: 'center' }}>
            {(Object.keys(MODES) as Mode[]).map((m) => (
              <button key={m} className={`chip ${mode === m ? 'on' : ''}`} onClick={() => switchMode(m)}>{MODES[m].label}</button>
            ))}
          </div>
          <div className="timer-wrap">
            <div className="ring">
              <svg width="220" height="220" viewBox="0 0 220 220">
                <circle cx="110" cy="110" r={R} fill="none" stroke="var(--accent-soft)" strokeWidth="14" />
                <circle cx="110" cy="110" r={R} fill="none" stroke="var(--accent)" strokeWidth="14" strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C * (1 - remaining / total)} style={{ transition: 'stroke-dashoffset 1s linear' }} />
              </svg>
              <div className="ring-time"><div>{fmtTime(Math.max(remaining, 0))}<small>{MODES[mode].label}</small></div></div>
            </div>
            <div className="row">
              <button className="btn" onClick={() => setRunning((r) => !r)}>{running ? <><Pause size={16} /> Tạm dừng</> : <><Play size={16} /> Bắt đầu</>}</button>
              <button className="btn ghost" onClick={() => switchMode(mode)}><RotateCcw size={16} /> Đặt lại</button>
            </div>
            <span className="muted">Đã hoàn thành {sessions} phiên tập trung</span>
          </div>
        </div>

        <div className="stack">
          <div className="card">
            <h3>💧 Uống nước ({water}/8 ly)</h3>
            <div className="water">
              {Array.from({ length: 8 }, (_, i) => (
                <button key={i} className={`glass ${i < water ? 'on' : ''}`} onClick={() => setWater(i + 1 === water ? i : i + 1)} aria-label={`Ly thứ ${i + 1}`}>{i < water ? '💧' : ''}</button>
              ))}
            </div>
          </div>
          <div className="card">
            <h3>🤸 Bài tập duỗi người</h3>
            <div className="stack" style={{ gap: 8 }}>
              {STRETCHES.map((s) => {
                const on = doneStretch.includes(s.id);
                return (
                  <button key={s.id} className={`stretch ${on ? 'on' : ''}`} onClick={() => setDoneStretch((p) => (on ? p.filter((x) => x !== s.id) : [...p, s.id]))}>
                    <span style={{ fontSize: 22 }}>{s.emoji}</span>
                    <span style={{ flex: 1 }}><strong>{s.title}</strong><div className="muted">{s.desc}</div></span>
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
