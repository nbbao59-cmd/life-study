import AppShell from '../components/layout/AppShell';
import Header from '../components/layout/Header';
import Sidebar from '../components/layout/Sidebar';
import { NAV } from '../data/options';
import { sampleRelax, sampleRhythm, sampleTasks, welcomeMessages } from '../data/sampleData';
import AssistantChat from '../features/assistant/AssistantChat';
import Dashboard from '../features/dashboard/Dashboard';
import DocumentLibrary from '../features/documents/DocumentLibrary';
import RelaxationZone from '../features/relaxation/RelaxationZone';
import RestZone from '../features/rest/RestZone';
import RhythmTimeline from '../features/rhythm/RhythmTimeline';
import StudyPlanner from '../features/study/StudyPlanner';
import { usePersistedState } from '../hooks/usePersistedState';
import { ChatMessage, Mood, RelaxItem, RhythmItem, SectionId, Task } from '../types';

export default function App() {
  const [section, setSection] = usePersistedState<SectionId>('section', 'dashboard');
  const [tasks, setTasks] = usePersistedState<Task[]>('tasks', sampleTasks);
  const [rhythm, setRhythm] = usePersistedState<RhythmItem[]>('rhythm', sampleRhythm);
  const [relax, setRelax] = usePersistedState<RelaxItem[]>('relax', sampleRelax);
  const [energy, setEnergy] = usePersistedState<number>('energy', 3);
  const [mood, setMood] = usePersistedState<Mood>('mood', 'ok');
  const [water, setWater] = usePersistedState<number>('water', 0);
  const [messages, setMessages] = usePersistedState<ChatMessage[]>('chat', welcomeMessages);

  const zone = NAV.find((n) => n.id === section)?.zone ?? 'zone-dash';

  return (
    <AppShell
      zone={zone}
      sidebar={<Sidebar active={section} onChange={setSection} />}
      header={<Header section={section} energy={energy} mood={mood} onEnergy={setEnergy} onMood={setMood} />}
    >
      {section === 'dashboard' && <Dashboard tasks={tasks} rhythm={rhythm} energy={energy} mood={mood} water={water} />}
      {section === 'study' && <StudyPlanner tasks={tasks} setTasks={setTasks} />}
      {section === 'documents' && <DocumentLibrary />}
      {section === 'rhythm' && <RhythmTimeline items={rhythm} setItems={setRhythm} />}
      {section === 'rest' && <RestZone water={water} setWater={setWater} />}
      {section === 'relaxation' && <RelaxationZone items={relax} setItems={setRelax} />}
      {section === 'assistant' && <AssistantChat messages={messages} setMessages={setMessages} context={{ energy, mood, tasks, rhythm }} />}
    </AppShell>
  );
}
