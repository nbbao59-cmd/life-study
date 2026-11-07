import { Droplets, LayoutDashboard } from 'lucide-react';
import PageTitle from '../../components/ui/PageTitle';
import ProgressBar from '../../components/ui/ProgressBar';
import { MOODS, RHYTHM_ICON } from '../../data/options';
import { Mood, RhythmItem, Task } from '../../types';
import { addDays, hhmmToMin, nowMinutes, todayISO, weekStart } from '../../utils/helpers';

interface Props {
  tasks: Task[];
  rhythm: RhythmItem[];
  energy: number;
  mood: Mood;
  water: number;
}

const DAY_NAMES = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
const pct = (done: number, total: number) => (total === 0 ? 0 : Math.round((done / total) * 100));

export default function Dashboard({ tasks, rhythm, energy, mood, water }: Props) {
  const today = todayISO();
  const todayTasks = tasks.filter((t) => t.date === today);
  const todayDone = todayTasks.filter((t) => t.done).length;
  const todayPct = pct(todayDone, todayTasks.length);

  const start = weekStart(today);
  const weekDays = DAY_NAMES.map((name, i) => {
    const d = addDays(start, i);
    const ts = tasks.filter((t) => t.date === d);
    return { name, d, total: ts.length, pct: pct(ts.filter((t) => t.done).length, ts.length) };
  });
  const weekTasks = tasks.filter((t) => t.date >= start && t.date <= addDays(start, 6));
  const weekPct = pct(weekTasks.filter((t) => t.done).length, weekTasks.length);

  const upcoming = tasks.filter((t) => !t.done && t.date >= today).sort((a, b) => a.date.localeCompare(b.date) || a.title.localeCompare(b.title))[0];
  const nextRhythm = [...rhythm].filter((r) => !r.done).sort((a, b) => a.time.localeCompare(b.time)).find((r) => hhmmToMin(r.time) >= nowMinutes()) ?? rhythm.find((r) => !r.done);
  const moodInfo = MOODS.find((m) => m.id === mood);

  return (
    <div className="stack zone-dash">
      <PageTitle icon={<LayoutDashboard size={22} />} title="Tổng quan hôm nay" subtitle="Tiến độ học tập, nhịp sinh học và trạng thái của bạn" />

      <div className="grid cols-3">
        <div className="card zone-study">
          <div className="stat">
            <span className="muted">Bài hôm nay</span>
            <b>{todayDone}/{todayTasks.length}</b>
            <ProgressBar value={todayPct} />
            <span className="muted">{todayPct}% hoàn thành</span>
          </div>
        </div>
        <div className="card zone-study">
          <div className="stat">
            <span className="muted">Cả tuần</span>
            <b>{weekPct}%</b>
            <ProgressBar value={weekPct} />
            <span className="muted">{weekTasks.length} bài trong tuần</span>
          </div>
        </div>
        <div className="card zone-ai">
          <div className="stat">
            <span className="muted">Trạng thái</span>
            <b>{moodInfo?.emoji} {energy}/5</b>
            <ProgressBar value={energy * 20} />
            <span className="muted">{moodInfo?.label} · năng lượng</span>
          </div>
        </div>
      </div>

      <div className="grid cols-2">
        <div className="card zone-study">
          <h3>Tiến độ theo ngày trong tuần</h3>
          <div className="week">
            {weekDays.map((d) => (
              <div key={d.d} className={`week-col ${d.d === today ? 'today' : ''}`} title={`${d.total} bài`}>
                <div className="week-bar" style={{ height: `${Math.max(d.total ? 20 + d.total * 14 : 8, 8)}px` }}>
                  <i style={{ height: `${d.pct}%` }} />
                </div>
                <span>{d.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="stack">
          <div className="card zone-study tint">
            <h3>Bài tiếp theo</h3>
            {upcoming ? (
              <div>
                <div className="task-title">{upcoming.title}</div>
                <div className="muted">{upcoming.subject} · {upcoming.minutes} phút · {upcoming.date === today ? 'hôm nay' : upcoming.date}</div>
              </div>
            ) : <div className="muted">Không còn bài nào đang chờ 🎉</div>}
          </div>
          <div className="card zone-rhythm tint">
            <h3>Hoạt động kế tiếp</h3>
            {nextRhythm ? (
              <div className="row"><span style={{ fontSize: 22 }}>{RHYTHM_ICON[nextRhythm.kind]}</span><div><div className="task-title">{nextRhythm.label}</div><div className="muted">Lúc {nextRhythm.time}</div></div></div>
            ) : <div className="muted">Đã hoàn thành mọi mốc hôm nay.</div>}
          </div>
          <div className="card zone-rest tint">
            <h3><Droplets size={16} /> Nước uống</h3>
            <div className="task-title">{water}/8 ly</div>
            <ProgressBar value={(water / 8) * 100} />
          </div>
        </div>
      </div>
    </div>
  );
}
