import { Check, HeartPulse, Plus, Trash2, Waves } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { TidalWaveGraphIllustration } from '../../components/illustrations/OceanIllustrations';
import PageTitle from '../../components/ui/PageTitle';
import ProgressBar from '../../components/ui/ProgressBar';
import { RHYTHM_ICON, RHYTHM_LABEL } from '../../data/options';
import { RhythmItem, RhythmKind } from '../../types';
import { hhmmToMin, nowMinutes, uid } from '../../utils/helpers';

interface Props {
  items: RhythmItem[];
  setItems: React.Dispatch<React.SetStateAction<RhythmItem[]>>;
}

export default function RhythmTimeline({ items, setItems }: Props) {
  const [time, setTime] = useState('09:00');
  const [label, setLabel] = useState('');
  const [kind, setKind] = useState<RhythmKind>('study');

  const sorted = [...items].sort((a, b) => a.time.localeCompare(b.time));
  const now = nowMinutes();
  const currentId = [...sorted].reverse().find((i) => hhmmToMin(i.time) <= now)?.id;
  const done = items.filter((i) => i.done).length;

  const add = (e: FormEvent) => {
    e.preventDefault();
    if (!label.trim()) return;
    setItems((p) => [...p, { id: uid(), time, label: label.trim(), kind, done: false }]);
    setLabel('');
  };

  return (
    <div className="stack ocean-rhythm-page">
      <PageTitle
        icon={<Waves size={24} />}
        title="Thủy Triều Sinh Học & Dòng Thời Gian"
        subtitle="Chu kỳ năng lượng thủy triều trong ngày: thức giấc, nạp năng lượng, học tập tập trung và nghỉ ngơi"
      />

      {/* Tidal Wave Graph Banner */}
      <section className="card ocean-card ocean-tide-banner">
        <div className="row wrap" style={{ marginBottom: 12, justifyContent: 'space-between' }}>
          <div>
            <strong style={{ fontSize: 16 }}>Đồ thị sóng năng lượng thủy triều</strong>
            <p className="muted" style={{ fontSize: 12 }}>
              Các đỉnh sóng đại diện cho thời điểm năng lượng não bộ cao nhất (Sáng & Chiều).
            </p>
          </div>
          <span className="ocean-tag">
            <Waves size={12} /> Đang diễn ra: Triều dâng
          </span>
        </div>
        <TidalWaveGraphIllustration height={80} />
      </section>

      {/* Add Rhythm Marker Card */}
      <div className="card ocean-card">
        <form className="form" onSubmit={add}>
          <div className="field" style={{ maxWidth: 130 }}>
            <label htmlFor="r-time">Thời khắc</label>
            <input id="r-time" type="time" value={time} onChange={(e) => setTime(e.target.value)} required />
          </div>
          <div className="field" style={{ flex: 3, minWidth: 200 }}>
            <label htmlFor="r-label">Hoạt động thủy triều</label>
            <input id="r-label" value={label} onChange={(e) => setLabel(e.target.value)} placeholder="VD: Uống 200ml nước biển sâu, vươn vai đón bình minh" />
          </div>
          <div className="field">
            <label htmlFor="r-kind">Nhịp sinh học</label>
            <select id="r-kind" value={kind} onChange={(e) => setKind(e.target.value as RhythmKind)}>
              {(Object.keys(RHYTHM_LABEL) as RhythmKind[]).map((k) => (
                <option key={k} value={k}>
                  {RHYTHM_ICON[k]} {RHYTHM_LABEL[k]}
                </option>
              ))}
            </select>
          </div>
          <button className="btn ocean-btn" type="submit">
            <Plus size={16} /> Thêm Mốc Giờ
          </button>
        </form>
      </div>

      {/* Progress Card */}
      <div className="card tint ocean-progress-card">
        <div className="row" style={{ marginBottom: 8 }}>
          <strong>Hoàn thành chu kỳ hôm nay</strong>
          <span className="spacer" />
          <span className="muted">{done}/{items.length} mốc triều</span>
        </div>
        <ProgressBar value={items.length ? (done / items.length) * 100 : 0} />
      </div>

      {sorted.length === 0 ? (
        <div className="empty ocean-empty">Chưa có mốc thủy triều nào. Hãy thêm nhịp sinh hoạt của bạn.</div>
      ) : (
        <div className="timeline ocean-timeline">
          {sorted.map((i) => (
            <div key={i.id} className={`tl-item ocean-tl-item ${i.done ? 'done' : ''} ${i.id === currentId ? 'now ocean-now' : ''}`}>
              <span className="tl-time ocean-tl-time">{i.time}</span>
              <span className="tl-emoji">{RHYTHM_ICON[i.kind]}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="task-title tl-label">{i.label}</div>
                <div className="muted">{RHYTHM_LABEL[i.kind]}{i.id === currentId ? ' · đang diễn ra 🌊' : ''}</div>
              </div>
              <button
                className={`check ocean-check ${i.done ? 'on' : ''}`}
                onClick={() => setItems((p) => p.map((x) => (x.id === i.id ? { ...x, done: !x.done } : x)))}
                aria-label="Đánh dấu hoàn thành"
              >
                {i.done && <Check size={14} />}
              </button>
              <button className="icon-btn danger" onClick={() => setItems((p) => p.filter((x) => x.id !== i.id))} aria-label="Xóa">
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
