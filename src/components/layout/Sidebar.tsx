import { BookOpen, Coffee, FileText, GraduationCap, Headphones, HeartPulse, LayoutDashboard, Sparkles } from 'lucide-react';
import { ReactNode } from 'react';
import { NAV } from '../../data/options';
import { SectionId } from '../../types';

const ICONS: Record<SectionId, ReactNode> = {
  dashboard: <LayoutDashboard size={18} />,
  study: <BookOpen size={18} />,
  documents: <FileText size={18} />,
  flashcards: <GraduationCap size={18} />,
  rhythm: <HeartPulse size={18} />,
  rest: <Coffee size={18} />,
  relaxation: <Headphones size={18} />,
  assistant: <Sparkles size={18} />,
};

interface Props {
  active: SectionId;
  onChange: (id: SectionId) => void;
}

export default function Sidebar({ active, onChange }: Props) {
  return (
    <nav className="sidebar" aria-label="Điều hướng chính">
      <div className="brand">
        <div className="brand-logo"><Sparkles size={20} /></div>
        <span>Nhịp Sống</span>
      </div>
      {NAV.map((n) => (
        <button
          key={n.id}
          className={`nav-btn ${n.zone} ${active === n.id ? 'active' : ''}`}
          onClick={() => onChange(n.id)}
          aria-current={active === n.id ? 'page' : undefined}
        >
          <span className="nav-ico">{ICONS[n.id]}</span>
          <span className="nav-txt">
            <strong>{n.label}</strong>
            <span>{n.hint}</span>
          </span>
        </button>
      ))}
    </nav>
  );
}
