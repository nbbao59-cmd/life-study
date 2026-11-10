import { useCallback, useEffect } from 'react';
import AppShell from '../components/layout/AppShell';
import Header from '../components/layout/Header';
import Sidebar from '../components/layout/Sidebar';
import SpotifyPlayerBar from '../components/music/SpotifyPlayerBar';
import { MusicProvider } from '../context/MusicContext';
import { SoundProvider } from '../context/SoundContext';
import { NAV, SECTION_SLUGS, SLUG_TO_SECTION } from '../data/options';
import { sampleRelax, sampleRhythm, sampleTasks, welcomeMessages } from '../data/sampleData';
import AssistantChat from '../features/assistant/AssistantChat';
import Dashboard from '../features/dashboard/Dashboard';
import DocumentLibrary from '../features/documents/DocumentLibrary';
import FlashcardsPage from '../features/flashcards/FlashcardsPage';
import RelaxationZone from '../features/relaxation/RelaxationZone';
import RestZone from '../features/rest/RestZone';
import RhythmTimeline from '../features/rhythm/RhythmTimeline';
import StudyPlanner from '../features/study/StudyPlanner';
import { usePersistedState } from '../hooks/usePersistedState';
import { ChatMessage, Mood, RelaxItem, RhythmItem, SectionId, Task } from '../types/index';

function getSectionFromUrl(): SectionId {
  if (typeof window === 'undefined') return 'dashboard';
  // 1. Kiểm tra URL pathname (ví dụ: /tong-quan, /tai-lieu)
  const path = window.location.pathname.replace(/^\/+|\/+$/g, '').toLowerCase();
  if (path && SLUG_TO_SECTION[path]) {
    return SLUG_TO_SECTION[path];
  }
  // 2. Kiểm tra URL hash (ví dụ: #/tong-quan, #tong-quan)
  const hash = window.location.hash.replace(/^#[/]?/, '').toLowerCase();
  if (hash && SLUG_TO_SECTION[hash]) {
    return SLUG_TO_SECTION[hash];
  }
  return 'dashboard';
}

function updateUrlForSection(sec: SectionId, replace = false) {
  if (typeof window === 'undefined') return;
  const slug = SECTION_SLUGS[sec] || 'tong-quan';
  const targetPath = `/${slug}`;
  if (window.location.pathname !== targetPath) {
    if (replace) {
      window.history.replaceState({ section: sec }, '', targetPath);
    } else {
      window.history.pushState({ section: sec }, '', targetPath);
    }
  }
  const navItem = NAV.find((n) => n.id === sec);
  if (navItem) {
    document.title = `${navItem.label} | Life & Study`;
  }
}

export default function App() {
  const [section, setSectionState] = usePersistedState<SectionId>('section', getSectionFromUrl());
  const [tasks, setTasks] = usePersistedState<Task[]>('tasks', sampleTasks);
  const [rhythm, setRhythm] = usePersistedState<RhythmItem[]>('rhythm', sampleRhythm);
  const [relax, setRelax] = usePersistedState<RelaxItem[]>('relax', sampleRelax);
  const [energy, setEnergy] = usePersistedState<number>('energy', 3);
  const [mood, setMood] = usePersistedState<Mood>('mood', 'ok');
  const [water, setWater] = usePersistedState<number>('water', 0);
  const [messages, setMessages] = usePersistedState<ChatMessage[]>('chat', welcomeMessages);

  // Đồng bộ URL lúc mở trang (nếu người dùng vào trực tiếp /tai-lieu hoặc /tong-quan)
  useEffect(() => {
    const rawPath = window.location.pathname.replace(/^\/+|\/+$/g, '');
    const rawHash = window.location.hash.replace(/^#[/]?/, '');
    const hasExplicitUrl = Boolean(rawPath || rawHash);
    const activeSec = hasExplicitUrl ? getSectionFromUrl() : section;
    setSectionState(activeSec);
    updateUrlForSection(activeSec, true);
  }, []);

  // Lắng nghe nút Back / Forward của trình duyệt
  useEffect(() => {
    const onLocationChange = () => {
      const nextSec = getSectionFromUrl();
      setSectionState(nextSec);
      const navItem = NAV.find((n) => n.id === nextSec);
      if (navItem) {
        document.title = `${navItem.label} | Life & Study`;
      }
    };
    window.addEventListener('popstate', onLocationChange);
    window.addEventListener('hashchange', onLocationChange);
    return () => {
      window.removeEventListener('popstate', onLocationChange);
      window.removeEventListener('hashchange', onLocationChange);
    };
  }, [setSectionState]);

  // Điều hướng chuyển tab kèm đổi URL
  const setSection = useCallback(
    (target: SectionId | string) => {
      const nextSec: SectionId =
        SLUG_TO_SECTION[target] ??
        (SECTION_SLUGS[target as SectionId] ? (target as SectionId) : 'dashboard');
      setSectionState(nextSec);
      updateUrlForSection(nextSec, false);
    },
    [setSectionState]
  );

  const zone = NAV.find((n) => n.id === section)?.zone ?? 'zone-dash';

  return (
    <SoundProvider>
      <MusicProvider>
        <AppShell
          zone={zone}
          sidebar={<Sidebar active={section} onChange={setSection} />}
          header={
            <Header
              section={section}
              energy={energy}
              mood={mood}
              onEnergy={setEnergy}
              onMood={setMood}
            />
          }
        >
          {section === 'dashboard' && (
            <Dashboard
              tasks={tasks}
              rhythm={rhythm}
              energy={energy}
              mood={mood}
              water={water}
              onNavigate={setSection}
            />
          )}
          {section === 'study' && <StudyPlanner tasks={tasks} setTasks={setTasks} />}
          {section === 'documents' && <DocumentLibrary onNavigate={setSection} />}
          {section === 'flashcards' && (
            <FlashcardsPage onNavigateToDocuments={() => setSection('documents')} />
          )}
          {section === 'rhythm' && <RhythmTimeline items={rhythm} setItems={setRhythm} />}
          {section === 'rest' && <RestZone water={water} setWater={setWater} />}
          {section === 'relaxation' && <RelaxationZone />}
          {section === 'assistant' && (
            <AssistantChat
              messages={messages}
              setMessages={setMessages}
              context={{ energy, mood, tasks, rhythm }}
            />
          )}
        </AppShell>
        <SpotifyPlayerBar onOpenRelaxZone={() => setSection('relaxation')} />
      </MusicProvider>
    </SoundProvider>
  );
}
