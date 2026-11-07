import { Check, HeartPulse, Plus, Trash2 } from 'lucide-react';
import { FormEvent, useState } from 'react';
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
    <div className="stack">
      <PageTitle icon={<HeartPulse size={22} />} title="Nhịp sinh học" subtitle="Dòng thời gian thức dậy, ăn uống, thể dục, thư giãn và đi ngủ" />

      <div className="card">
        <form className="form" onSubmit={add}>
          <div className="field" style={{ maxWidth: 130 }}><label htmlFor="r-time">Giờ</label><input id="r-time" type="time" value={time} onChange={(e) => setTime(e.target.value)} required /></div>
          <div className="field" style={{ flex: 3, minWidth: 200 }}><label htmlFor="r-label">Hoạt động</label><input id="r-label" value={label} onChange={(e) => setLabel(e.target.value)} placeholder="VD: Uống nước, giãn cơ" /></div>
          <div className="field">
            <label htmlFor="r-kind">Loại</label>
            <select id="r-kind" value={kind} onChange={(e) => setKind(e.target.value as RhythmKind)}>
              {(Object.keys(RHYTHM_LABEL) as RhythmKind[]).map((k) => <option key={k} value={k}>{RHYTHM_ICON[k]} {RHYTHM_LABEL[k]}</option>)}
            </select>
          </div>
          <button className="btn" type="submit"><Plus size={16} /> Thêm</button>
        </form>
      </div>

      <div className="card tint">
        <div className="row" style={{ marginBottom: 8 }}><strong>Hoàn thành hôm nay</strong><span className="spacer" /><span className="muted">{done}/{items.length}</span></div>
        <ProgressBar value={items.length ? (done / items.length) * 100 : 0} />
      </div>

      {sorted.length === 0 ? <div className="empty">Chưa có mốc nào. Hãy thêm nhịp sinh hoạt của bạn.</div> : (
        <div className="timeline">
          {sorted.map((i) => (
            <div key={i.id} className={`tl-item ${i.done ? 'done' : ''} ${i.id === currentId ? 'now' : ''}`}>
              <span className="tl-time">{i.time}</span>
              <span className="tl-emoji">{RHYTHM_ICON[i.kind]}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="task-title tl-label">{i.label}</div>
                <div className="muted">{RHYTHM_LABEL[i.kind]}{i.id === currentId ? ' · đang diễn ra' : ''}</div>
              </div>
              <button className={`check ${i.done ? 'on' : ''}`} onClick={() => setItems((p) => p.map((x) => (x.id === i.id ? { ...x, done: !x.done } : x)))} aria-label="Đánh dấu hoàn thành">{i.done && <Check size={14} />}</button>
              <button className="icon-btn danger" onClick={() => setItems((p) => p.filter((x) => x.id !== i.id))} aria-label="Xóa"><Trash2 size={16} /></button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
