import {
  Calendar as CalendarIcon,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Compass,
  Droplets,
  FolderOpen,
  GraduationCap,
  Heart,
  Navigation,
  Sparkles,
  Star,
  Trophy,
  Waves,
  Wind,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import {
  AnchorNauticalIcon,
  LighthouseIllustration,
  NauticalShipIllustration,
  ShipWheelNauticalIcon,
} from '../../components/illustrations/OceanIllustrations';
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
  onNavigate?: (section: any) => void;
}

const SEA_COMPANIONS = [
  { id: 'whale', name: 'Cá Voi Xanh', role: 'Toán học & Logic', emoji: '🐋', bg: '#e0f2fe' },
  { id: 'dolphin', name: 'Cá Heo Hoa Tiêu', role: 'Ngoại ngữ', emoji: '🐬', bg: '#bae6fd' },
  { id: 'turtle', name: 'Rùa Biển Cổ', role: 'Khoa học & Kỹ thuật', emoji: '🐢', bg: '#d1fae5' },
  { id: 'seagull', name: 'Hải Âu Hướng Hải', role: 'Ngữ văn & Triết lý', emoji: '🕊️', bg: '#f1f5f9' },
  { id: 'otter', name: 'Rái Cá Thông Thái', role: 'Lập trình', emoji: '🦦', bg: '#fef3c7' },
  { id: 'seal', name: 'Hải Cẩu Bình Yên', role: 'Lịch sử & Địa lý', emoji: '🦭', bg: '#fed7aa' },
  { id: 'manta', name: 'Cá Đuối Phát Quang', role: 'Nghệ thuật & Sáng tạo', emoji: '🌊', bg: '#ede9fe' },
  { id: 'penguin', name: 'Chim Cánh Cụt Đảo', role: 'Động lực & Ý chí', emoji: '🐧', bg: '#fce7f3' },
];

export default function Dashboard({ tasks, rhythm, energy, mood, water, onNavigate }: Props) {
  const today = todayISO();
  const todayDate = new Date();
  const todayTasks = tasks.filter((t) => t.date === today);
  const todayDone = todayTasks.filter((t) => t.done).length;
  const todayPct = todayTasks.length ? Math.round((todayDone / todayTasks.length) * 100) : 0;

  const start = weekStart(today);
  const weekTasks = tasks.filter((t) => t.date >= start && t.date <= addDays(start, 6));
  const weekDone = weekTasks.filter((t) => t.done).length;
  const weekPct = weekTasks.length ? Math.round((weekDone / weekTasks.length) * 100) : 0;

  const nextRhythm =
    [...rhythm]
      .filter((r) => !r.done)
      .sort((a, b) => a.time.localeCompare(b.time))
      .find((r) => hhmmToMin(r.time) >= nowMinutes()) ?? rhythm.find((r) => !r.done);

  const moodInfo = MOODS.find((m) => m.id === mood);

  // Mini Calendar generation
  const [currentMonthDate] = useState(new Date());
  const calendarDays = useMemo(() => {
    const year = currentMonthDate.getFullYear();
    const month = currentMonthDate.getMonth();
    const firstDayIndex = (new Date(year, month, 1).getDay() + 6) % 7; // Monday = 0
    const totalDays = new Date(year, month + 1, 0).getDate();
    const days: (number | null)[] = [];
    for (let i = 0; i < firstDayIndex; i++) days.push(null);
    for (let d = 1; d <= totalDays; d++) days.push(d);
    return days;
  }, [currentMonthDate]);

  const currentDayNum = todayDate.getDate();

  return (
    <div className="cozy-dashboard-grid ocean-dashboard-grid">
      {/* ================= ROW 1 ================= */}
      {/* Card 1: Tổng quan bến cảng hải trình (Harbor Overview) */}
      <section className="cozy-card card-overview ocean-harbor-card">
        <div className="cozy-card-header">
          <div className="header-title-wrap">
            <span className="ocean-badge-icon">⚓</span>
            <h3>Cảng Biển Tri Thức</h3>
          </div>
        </div>

        <div className="overview-content">
          <div className="overview-stats-col">
            <div className="stat-group">
              <span className="cozy-sublabel">Trạng thái hải trình</span>
              <div className="star-rating">
                <Star size={15} className="star-filled" />
                <Star size={15} className="star-filled" />
                <Star size={15} className="star-filled" />
                <Star size={15} className="star-filled" />
                <Star size={15} className="star-half" />
                <span className="rating-num">Xuôi Gió · 4.8★</span>
              </div>
            </div>

            <div className="stat-group">
              <span className="cozy-sublabel">Tọa độ hải phận</span>
              <code className="island-code">OCEAN-2026-NAUTICAL</code>
            </div>

            <div className="stat-group">
              <span className="cozy-sublabel">Nhiệm vụ cập bến</span>
              <span className="resident-stat">
                <strong>{todayDone}</strong>/{todayTasks.length} hải trình hôm nay
              </span>
            </div>

            <div className="kk-banner ocean-beacon-banner">
              <span className="kk-note">🌊 Thủy triều đang lên: Phiên học chiều nay bắt đầu lúc 14:00!</span>
            </div>
          </div>

          {/* Mini Calendar Widget with Ocean Tides */}
          <div className="mini-calendar-widget ocean-cal-widget">
            <div className="mini-cal-header">
              <ChevronLeft size={13} className="cal-nav" />
              <span>
                Hải đồ Tháng {todayDate.getMonth() + 1}, {todayDate.getFullYear()}
              </span>
              <ChevronRight size={13} className="cal-nav" />
            </div>
            <div className="mini-cal-weekdays">
              <span>T2</span>
              <span>T3</span>
              <span>T4</span>
              <span>T5</span>
              <span>T6</span>
              <span>T7</span>
              <span>CN</span>
            </div>
            <div className="mini-cal-grid">
              {calendarDays.map((d, idx) => (
                <div
                  key={idx}
                  className={`cal-day-cell ${d === currentDayNum ? 'is-today ocean-today-cell' : ''} ${
                    !d ? 'is-empty' : ''
                  }`}
                >
                  {d}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Card 2: Tiến độ hải trình hôm nay (Tasks Progress) */}
      <section className="cozy-card card-tasks">
        <div className="cozy-card-header">
          <div className="header-title-wrap">
            <span className="ocean-badge-icon">🧭</span>
            <h3>Tiến độ hải trình</h3>
          </div>
          {onNavigate && (
            <button className="view-all-link" onClick={() => onNavigate('study')}>
              Nhật ký tàu
            </button>
          )}
        </div>

        <div className="cozy-task-list">
          <div className="cozy-task-item">
            <div className="task-item-meta">
              <span className="task-item-title">
                <CheckCircle2 size={15} className="task-ico ocean-task-ico" /> Hoàn thành bài hôm nay
              </span>
              <span className="task-item-count">
                {todayDone}/{todayTasks.length}
              </span>
            </div>
            <ProgressBar value={todayPct} />
          </div>

          <div className="cozy-task-item">
            <div className="task-item-meta">
              <span className="task-item-title">
                <Waves size={15} className="task-ico ocean-task-ico" /> Thủy triều cả tuần
              </span>
              <span className="task-item-count">
                {weekDone}/{weekTasks.length} ({weekPct}%)
              </span>
            </div>
            <ProgressBar value={weekPct} />
          </div>

          <div className="cozy-task-item">
            <div className="task-item-meta">
              <span className="task-item-title">
                <Droplets size={15} className="task-ico ocean-task-ico" /> Nước ngọt biển sâu
              </span>
              <span className="task-item-count">{water}/8 ly</span>
            </div>
            <ProgressBar value={(water / 8) * 100} />
          </div>

          <div className="cozy-task-item">
            <div className="task-item-meta">
              <span className="task-item-title">
                <Sparkles size={15} className="task-ico ocean-task-ico" /> Năng lượng & Ngọc trai
              </span>
              <span className="task-item-count">
                {moodInfo?.emoji} {energy}/5 hải lý
              </span>
            </div>
            <ProgressBar value={energy * 20} />
          </div>
        </div>
      </section>

      {/* Card 3: Ngọn Hải Đăng & Góc biển bình yên (Ocean Lighthouse Scenic) */}
      <section className="cozy-card card-photo ocean-photo-card">
        <div className="cozy-card-header">
          <div className="header-title-wrap">
            <span className="ocean-badge-icon">🏮</span>
            <h3>Ngọn Hải Đăng</h3>
          </div>
          {onNavigate && (
            <button className="view-all-link" onClick={() => onNavigate('relaxation')}>
              Thư giãn
            </button>
          )}
        </div>

        <div className="cozy-photo-frame ocean-lighthouse-frame">
          <LighthouseIllustration width="100%" height={145} />
          <p className="photo-caption">
            "Dù ngoài khơi sóng to gió lớn, ngọn hải đăng kiên định sẽ luôn soi lối cho bạn về đích."
          </p>
        </div>
      </section>

      {/* ================= ROW 2 ================= */}
      {/* Card 4: Kho báu biển cả (Samlingar / Marine Collections) */}
      <section className="cozy-card card-collections">
        <div className="cozy-card-header">
          <div className="header-title-wrap">
            <span className="ocean-badge-icon">💎</span>
            <h3>Kho báu đại dương</h3>
          </div>
          {onNavigate && (
            <button className="view-all-link" onClick={() => onNavigate('documents')}>
              Xem kho báu
            </button>
          )}
        </div>

        <div className="collection-tiles-grid">
          <div className="collect-tile" onClick={() => onNavigate?.('study')}>
            <span className="tile-icon">🗺️</span>
            <strong className="tile-label">Hải đồ</strong>
            <span className="tile-count">Môn học</span>
          </div>

          <div className="collect-tile" onClick={() => onNavigate?.('documents')}>
            <span className="tile-icon">📜</span>
            <strong className="tile-label">Văn thư</strong>
            <span className="tile-count">Tài liệu</span>
          </div>

          <div className="collect-tile" onClick={() => onNavigate?.('flashcards')}>
            <span className="tile-icon">🪸</span>
            <strong className="tile-label">San hô</strong>
            <span className="tile-count">Flashcards</span>
          </div>

          <div className="collect-tile" onClick={() => onNavigate?.('rest')}>
            <span className="tile-icon">🧭</span>
            <strong className="tile-label">Bánh lái</strong>
            <span className="tile-count">Pomodoro</span>
          </div>

          <div className="collect-tile" onClick={() => onNavigate?.('relaxation')}>
            <span className="tile-icon">🌊</span>
            <strong className="tile-label">Sóng lofi</strong>
            <span className="tile-count">YouTube</span>
          </div>
        </div>

        <div className="collection-highlight-goal ocean-goal-box">
          <div className="goal-icon-badge">🎯</div>
          <div className="goal-copy">
            <strong>Mục tiêu: Đạt 4 phiên học & 8 ly nước ngọt</strong>
            <span>Đã nạp được {water >= 8 ? '8/8 ly nước mát lành 💧' : `${water}/8 ly nước`}</span>
          </div>
        </div>
      </section>

      {/* Card 5: Bản đồ hải trình (Ocean Map & Sailing Ship) */}
      <section className="cozy-card card-island-map">
        <div className="cozy-card-header">
          <div className="header-title-wrap">
            <span className="ocean-badge-icon">⛵</span>
            <h3>Hải trình tiếp theo</h3>
          </div>
          {onNavigate && (
            <button className="view-all-link" onClick={() => onNavigate('rhythm')}>
              Thủy triều
            </button>
          )}
        </div>

        <div className="island-map-preview ocean-ship-preview">
          <div className="map-illustration ocean-sailing-art">
            <NauticalShipIllustration width={150} height={100} />
            <div className="map-badge-tag ocean-tag">
              <Navigation size={12} />
              <span>Hải phận Oasis Bay</span>
            </div>
          </div>

          <div className="next-event-pill ocean-pill">
            <span className="event-label">Mốc giờ tiếp theo:</span>
            {nextRhythm ? (
              <strong className="event-val">
                {RHYTHM_ICON[nextRhythm.kind]} {nextRhythm.label} ({nextRhythm.time})
              </strong>
            ) : (
              <strong className="event-val">Thuyền đã neo đậu an toàn, mọi mốc đã xong 🎉</strong>
            )}
          </div>
        </div>
      </section>

      {/* Card 6: Hộ vệ biển cả & Cố vấn AI (Sea Companions) */}
      <section className="cozy-card card-villagers">
        <div className="cozy-card-header">
          <div className="header-title-wrap">
            <span className="ocean-badge-icon">🐬</span>
            <h3>Hộ vệ biển & Cố vấn AI</h3>
          </div>
          {onNavigate && (
            <button className="view-all-link" onClick={() => onNavigate('assistant')}>
              Hỏi đáp AI
            </button>
          )}
        </div>

        <div className="villagers-avatar-grid">
          {SEA_COMPANIONS.map((v) => (
            <div
              key={v.id}
              className="villager-item"
              onClick={() => onNavigate?.('assistant')}
              title={`${v.name} - Cố vấn ${v.role}`}
            >
              <div className="villager-circle ocean-avatar-circle" style={{ backgroundColor: v.bg }}>
                <span className="villager-emoji">{v.emoji}</span>
              </div>
              <strong className="villager-name">{v.name}</strong>
              <small className="villager-role">{v.role}</small>
            </div>
          ))}
        </div>

        {onNavigate && (
          <button className="cozy-action-btn ocean-ai-btn" onClick={() => onNavigate('assistant')}>
            <Sparkles size={14} /> Gửi tín hiệu đến Hải Đăng AI
          </button>
        )}
      </section>

      {/* ================= ROW 3 ================= */}
      {/* Card 7: Cuộn hải trình & Ghi chép (Ship's Logbook Notes) */}
      <section className="cozy-card card-notes full-width">
        <div className="cozy-card-header">
          <div className="header-title-wrap">
            <span className="ocean-badge-icon">📜</span>
            <h3>Nhật ký hải trình & Kế hoạch ngày</h3>
          </div>
          {onNavigate && (
            <button className="view-all-link" onClick={() => onNavigate('study')}>
              Xem sổ nhật ký
            </button>
          )}
        </div>

        <div className="notes-trio-grid">
          <div className="note-card-box ocean-note-box">
            <div className="note-box-title">
              <span className="pin-ico">⚓</span>
              <strong>Hải đồ hôm nay</strong>
            </div>
            <ul className="note-bullet-list">
              <li>Hoàn thành tóm tắt 3 chương tài liệu biển sâu.</li>
              <li>Ôn luyện 10 thẻ san hô Flashcard 3D.</li>
              <li>Nghỉ ngơi 15 phút, lắng nghe sóng biển YouTube.</li>
            </ul>
          </div>

          <div className="note-card-box ocean-note-box">
            <div className="note-box-title">
              <span className="pin-ico">⭐</span>
              <strong>Vượt sóng gió</strong>
            </div>
            <p className="note-box-text">
              Giữ vững nhịp Pomodoro 25 phút không rời bánh lái, lưu giữ kiến thức quý giá vào hầm
              ngọc trai.
            </p>
          </div>

          <div className="note-card-box ocean-note-box">
            <div className="note-box-title">
              <span className="pin-ico">🌊</span>
              <strong>Cảm hứng biển khơi</strong>
            </div>
            <p className="note-box-text">
              "Biển lặng không tạo nên người thủy thủ tài ba. Từng con sóng học tập sẽ tôi luyện trí
              tuệ sắc bén."
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
