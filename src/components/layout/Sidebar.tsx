import {
  BookOpen,
  Coffee,
  Compass,
  FileText,
  GraduationCap,
  Headphones,
  HeartPulse,
  LayoutDashboard,
  Sparkles,
} from 'lucide-react';
import { ReactNode } from 'react';
import { OceanCompassRose } from '../illustrations/OceanIllustrations';
import { NAV } from '../../data/options';
import { SectionId } from '../../types/index';

const ICONS: Record<SectionId, ReactNode> = {
  dashboard: <LayoutDashboard size={19} />,
  study: <BookOpen size={19} />,
  documents: <FileText size={19} />,
  flashcards: <GraduationCap size={19} />,
  rhythm: <HeartPulse size={19} />,
  rest: <Coffee size={19} />,
  relaxation: <Headphones size={19} />,
  assistant: <Sparkles size={19} />,
};

interface Props {
  active: SectionId;
  onChange: (id: SectionId) => void;
}

export default function Sidebar({ active, onChange }: Props) {
  return (
    <nav className="sidebar ocean-sidebar" aria-label="Điều hướng hải trình">
      {/* Nautical Brass Sign Board - Maritime Coastal Theme */}
      <div className="island-sign-wrapper">
        <div className="ocean-sign-board">
          <span className="brass-bolt top-left" />
          <span className="brass-bolt top-right" />
          <span className="brass-bolt btm-left" />
          <span className="brass-bolt btm-right" />
          <div className="ocean-sign-inner">
            <div className="compass-badge-wrap">
              <OceanCompassRose size={34} />
            </div>
            <small className="ocean-sign-eyebrow">HẢI TRÌNH ĐẠI DƯƠNG</small>
            <h2 className="ocean-sign-title">Life & Study</h2>
            <div className="ocean-sign-badge">
              <Compass size={12} className="spin-slow" />
              <span>Cảng Biển Tri Thức</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Pill Buttons with URL slugs */}
      <div className="sidebar-nav-list">
        {NAV.map((n) => {
          const isActive = active === n.id;
          return (
            <a
              key={n.id}
              href={`/${n.slug}`}
              className={`nav-btn ${isActive ? 'active' : ''}`}
              onClick={(e) => {
                e.preventDefault();
                onChange(n.id);
              }}
              aria-current={isActive ? 'page' : undefined}
            >
              <span className="nav-ico">{ICONS[n.id]}</span>
              <span className="nav-txt">
                <strong>{n.label}</strong>
              </span>
            </a>
          );
        })}
      </div>

      {/* Navigator Seagull Tip Card at Bottom */}
      <div className="ocean-mascot-card">
        <div className="mascot-header">
          <div className="mascot-badge">⚓</div>
          <span className="mascot-label">Lời khuyên hải đăng</span>
        </div>
        <p className="mascot-quote">
          "Giữ vững bánh lái, chia nhỏ hải trình và uống đủ nước để vượt qua mọi con sóng học tập!"
        </p>
      </div>
    </nav>
  );
}
