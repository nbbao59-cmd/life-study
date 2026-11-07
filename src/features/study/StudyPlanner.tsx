import { BookOpen, Check, Plus, Trash2 } from 'lucide-react';
import { FormEvent, useState } from 'react';
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
  const [subject, setSubject] = useState('Toán');
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
    setTasks((prev) => [...prev, { id: uid(), title: title.trim(), subject: subject.trim() || 'Khác', priority, date, minutes: Math.max(5, minutes || 30), done: false }]);
    setTitle('');
  };
  const toggle = (id: string) => setTasks((p) => p.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  const remove = (id: string) => setTasks((p) => p.filter((t) => t.id !== id));

  return (
    <div className="stack">
      <PageTitle icon={<BookOpen size={22} />} title="Lịch học tập" subtitle="Quản lý bài tập, môn học và mức độ ưu tiên" />

      <div className="card">
        <form className="form" onSubmit={add}>
          <div className="field" style={{ flex: 3, minWidth: 200 }}>
            <label htmlFor="t-title">Bài tập / công việc</label>
            <input id="t-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="VD: Làm bài tập chương 2" />
          </div>
          <div className="field"><label htmlFor="t-sub">Môn</label><input id="t-sub" value={subject} onChange={(e) => setSubject(e.target.value)} /></div>
          <div className="field">
            <label htmlFor="t-prio">Ưu tiên</label>
            <select id="t-prio" value={priority} onChange={(e) => setPriority(e.target.value as Priority)}>
              {(Object.keys(PRIORITY_LABEL) as Priority[]).map((p) => <option key={p} value={p}>{PRIORITY_LABEL[p]}</option>)}
            </select>
          </div>
          <div className="field"><label htmlFor="t-date">Ngày</label><input id="t-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} /></div>
          <div className="field" style={{ maxWidth: 110 }}><label htmlFor="t-min">Phút</label><input id="t-min" type="number" min={5} step={5} value={minutes} onChange={(e) => setMinutes(Number(e.target.value))} /></div>
          <button className="btn" type="submit"><Plus size={16} /> Thêm</button>
        </form>
      </div>

      <div className="row wrap">
        <div className="chips">
          {([['today', 'Hôm nay'], ['week', 'Tuần này'], ['all', 'Tất cả']] as [DayFilter, string][]).map(([k, l]) => (
            <button key={k} className={`chip ${dayFilter === k ? 'on' : ''}`} onClick={() => setDayFilter(k)}>{l}</button>
          ))}
        </div>
        <div className="chips">
          <button className={`chip ${prioFilter === 'all' ? 'on' : ''}`} onClick={() => setPrioFilter('all')}>Mọi mức</button>
          {(Object.keys(PRIORITY_LABEL) as Priority[]).map((p) => (
            <button key={p} className={`chip ${prioFilter === p ? 'on' : ''}`} onClick={() => setPrioFilter(p)}>{PRIORITY_LABEL[p]}</button>
          ))}
        </div>
      </div>

      <div className="card tint">
        <div className="row" style={{ marginBottom: 8 }}><strong>Tiến độ</strong><span className="spacer" /><span className="muted">{done}/{visible.length} bài</span></div>
        <ProgressBar value={percent} />
      </div>

      <div className="stack" style={{ gap: 10 }}>
        {visible.length === 0 && <div className="empty">Chưa có bài nào trong bộ lọc này. Hãy thêm bài mới ở trên ✨</div>}
        {visible.map((t) => (
          <div key={t.id} className={`task ${t.done ? 'done' : ''}`}>
            <button className={`check ${t.done ? 'on' : ''}`} onClick={() => toggle(t.id)} aria-label={t.done ? 'Bỏ hoàn thành' : 'Đánh dấu hoàn thành'}>{t.done && <Check size={14} />}</button>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="task-title">{t.title}</div>
              <div className="muted">{t.subject} · {t.minutes} phút · {t.date === today ? 'Hôm nay' : formatDate(t.date)}</div>
            </div>
            <span className={`badge ${t.priority}`}>{PRIORITY_LABEL[t.priority]}</span>
            <button className="icon-btn danger" onClick={() => remove(t.id)} aria-label="Xóa"><Trash2 size={16} /></button>
          </div>
        ))}
      </div>
    </div>
  );
}
