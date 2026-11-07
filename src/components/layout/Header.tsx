import { Zap } from 'lucide-react';
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
  const title = NAV.find((n) => n.id === section)?.label ?? '';
  const date = new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <header className="topbar">
      <div>
        <h1>{title}</h1>
        <p>{date}</p>
      </div>
      <div className="status">
        <div className="status-group">
          <span className="status-label"><Zap size={13} style={{ verticalAlign: '-2px' }} /> Năng lượng</span>
          <div className="seg" role="group" aria-label="Mức năng lượng">
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} className={energy === n ? 'on' : ''} onClick={() => onEnergy(n)} aria-pressed={energy === n}>
                {n}
              </button>
            ))}
          </div>
        </div>
        <div className="status-group">
          <span className="status-label">Tâm trạng</span>
          <div className="seg mood" role="group" aria-label="Tâm trạng">
            {MOODS.map((m) => (
              <button key={m.id} className={mood === m.id ? 'on' : ''} onClick={() => onMood(m.id)} title={m.label} aria-label={m.label} aria-pressed={mood === m.id}>
                {m.emoji}
              </button>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}
