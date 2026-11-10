import { Check, Compass, Plus, Trash2 } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { AnchorNauticalIcon, ShipWheelNauticalIcon } from '../../components/illustrations/OceanIllustrations';
import PageTitle from '../../components/ui/PageTitle';
import ProgressBar from '../../components/ui/ProgressBar';
import { PRIORITY_LABEL, PRIORITY_ORDER } from '../../data/options';
import { Priority, Task } from '../../types';
import { formatDate, isInWeek, todayISO, uid } from '../../utils/helpers';

interface Props {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
}

type DayFilter = 'today' | 'week' | 'all';

export default function StudyPlanner({ tasks, setTasks }: Props) {
  const [dayFilter, setDayFilter] = useState<DayFilter>('today');
  const [prioFilter, setPrioFilter] = useState<'all' | Priority>('all');
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('Toán Học Biển Sâu');
  const [priority, setPriority] = useState<Priority>('medium');
  const [date, setDate] = useState(todayISO());
  const [minutes, setMinutes] = useState(30);

  const today = todayISO();
  const visible = tasks
    .filter((t) => (dayFilter === 'today' ? t.date === today : dayFilter === 'week' ? isInWeek(t.date) : true))
    .filter((t) => prioFilter === 'all' || t.priority === prioFilter)
    .sort((a, b) => Number(a.done) - Number(b.done) || a.date.localeCompare(b.date) || PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]);

  const done = visible.filter((t) => t.done).length;
  const percent = visible.length ? (done / visible.length) * 100 : 0;

  const add = (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setTasks((prev) => [...prev, { id: uid(), title: title.trim(), subject: subject.trim() || 'Hải trình chung', priority, date, minutes: Math.max(5, minutes || 30), done: false }]);
    setTitle('');
  };
  const toggle = (id: string) => setTasks((p) => p.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  const remove = (id: string) => setTasks((p) => p.filter((t) => t.id !== id));

  return (
    <div className="stack ocean-study-page">
      <PageTitle
        icon={<ShipWheelNauticalIcon size={24} />}
        title="Nhật Ký Hải Trình Học Tập"
        subtitle="Hải đồ theo dõi bài tập, thời lượng và các cột mốc tri thức"
      />

      {/* Nautical Log Form Card */}
      <div className="card ocean-card">
        <form className="form" onSubmit={add}>
          <div className="field" style={{ flex: 3, minWidth: 200 }}>
            <label htmlFor="t-title">Cột mốc / Tên bài tập</label>
            <input id="t-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="VD: Khám phá lý thuyết sóng âm chương 3" />
          </div>
          <div className="field">
            <label htmlFor="t-sub">Hải đồ / Môn</label>
            <input id="t-sub" value={subject} onChange={(e) => setSubject(e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="t-prio">Mức sóng ưu tiên</label>
            <select id="t-prio" value={priority} onChange={(e) => setPriority(e.target.value as Priority)}>
              <option value="high">Bão Lớn · Cao</option>
              <option value="medium">Sóng Lặng · Vừa</option>
              <option value="low">Thuận Buồm · Thấp</option>
            </select>
          </div>
          <div className="field">
            <label htmlFor="t-date">Ngày cập bến</label>
            <input id="t-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div className="field" style={{ maxWidth: 110 }}>
            <label htmlFor="t-min">Hải lý (Phút)</label>
            <input id="t-min" type="number" min={5} step={5} value={minutes} onChange={(e) => setMinutes(Number(e.target.value))} />
          </div>
          <button className="btn ocean-btn" type="submit">
            <Plus size={16} /> Thêm Cột Mốc
          </button>
        </form>
      </div>

      {/* Filter Chips */}
      <div className="row wrap">
        <div className="chips">
          {([['today', 'Hôm nay'], ['week', 'Tuần này'], ['all', 'Toàn hải trình']] as [DayFilter, string][]).map(([k, l]) => (
            <button key={k} className={`chip ocean-chip ${dayFilter === k ? 'on' : ''}`} onClick={() => setDayFilter(k)}>{l}</button>
          ))}
        </div>
        <div className="chips">
          <button className={`chip ocean-chip ${prioFilter === 'all' ? 'on' : ''}`} onClick={() => setPrioFilter('all')}>Mọi mức sóng</button>
          <button className={`chip ocean-chip ${prioFilter === 'high' ? 'on' : ''}`} onClick={() => setPrioFilter('high')}>Bão lớn</button>
          <button className={`chip ocean-chip ${prioFilter === 'medium' ? 'on' : ''}`} onClick={() => setPrioFilter('medium')}>Sóng vừa</button>
          <button className={`chip ocean-chip ${prioFilter === 'low' ? 'on' : ''}`} onClick={() => setPrioFilter('low')}>Thuận buồm</button>
        </div>
      </div>

      {/* Progress Card */}
      <div className="card tint ocean-progress-card">
        <div className="row" style={{ marginBottom: 8 }}>
          <strong>Tiến độ vượt sóng</strong>
          <span className="spacer" />
          <span className="muted">{done}/{visible.length} cột mốc cập bến ({Math.round(percent)}%)</span>
        </div>
        <ProgressBar value={percent} />
      </div>

      {/* Tasks List */}
      <div className="stack" style={{ gap: 10 }}>
        {visible.length === 0 && (
          <div className="empty ocean-empty">
            <AnchorNauticalIcon size={32} />
            <p>Hải trình đang yên ả. Hãy thêm cột mốc học tập mới để căng buồm ra khơi!</p>
          </div>
        )}
        {visible.map((t) => (
          <div key={t.id} className={`task ocean-task ${t.done ? 'done' : ''}`}>
            <button
              className={`check ocean-check ${t.done ? 'on' : ''}`}
              onClick={() => toggle(t.id)}
              aria-label={t.done ? 'Bỏ hoàn thành' : 'Đóng dấu mỏ neo hoàn thành'}
            >
              {t.done && <AnchorNauticalIcon size={14} />}
            </button>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="task-title">{t.title}</div>
              <div className="muted">{t.subject} · {t.minutes} phút · {t.date === today ? 'Hôm nay' : formatDate(t.date)}</div>
            </div>
            <span className={`badge ${t.priority}`}>
              {t.priority === 'high' ? 'Bão lớn' : t.priority === 'medium' ? 'Sóng vừa' : 'Thuận buồm'}
            </span>
            <button className="icon-btn danger" onClick={() => remove(t.id)} aria-label="Xóa"><Trash2 size={16} /></button>
          </div>
        ))}
      </div>
    </div>
  );
}
