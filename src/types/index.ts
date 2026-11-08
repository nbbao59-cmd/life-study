export type SectionId = 'dashboard' | 'study' | 'documents' | 'flashcards' | 'rhythm' | 'rest' | 'relaxation' | 'assistant';
export type Priority = 'high' | 'medium' | 'low';
export type Mood = 'great' | 'good' | 'ok' | 'tired' | 'stressed';

export interface Task {
  id: string;
  title: string;
  subject: string;
  priority: Priority;
  date: string; // YYYY-MM-DD
  minutes: number;
  done: boolean;
}

export type RhythmKind = 'wake' | 'meal' | 'exercise' | 'study' | 'relax' | 'sleep';
export interface RhythmItem {
  id: string;
  time: string; // HH:MM
  label: string;
  kind: RhythmKind;
  done: boolean;
}

export type RelaxKind = 'youtube' | 'podcast' | 'book' | 'hobby';
export interface RelaxItem {
  id: string;
  title: string;
  kind: RelaxKind;
  note?: string;
  url?: string;
}

export type DocumentCategory = 'pdf' | 'word' | 'sheet' | 'slide' | 'image' | 'text' | 'other';

export interface DocumentItem {
  id: string;
  name: string;
  type: string;
  size: number;
  addedAt: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  /** true nếu đây là thông báo lỗi (không gửi lại cho AI làm lịch sử). */
  error?: boolean;
}

export interface AiContext {
  energy: number;
  mood: Mood;
  tasks: Task[];
  rhythm: RhythmItem[];
}

export type SoundChannelId = 'rain' | 'waves' | 'whiteNoise' | 'brownNoise' | 'cafe' | 'campfire' | 'birds';

export interface SoundChannelConfig {
  id: SoundChannelId;
  name: string;
  icon: string;
  volume: number; // 0 - 100
  enabled: boolean;
}

export interface PomodoroSession {
  id: string;
  goal: string;
  mode: 'focus' | 'short' | 'long';
  durationMinutes: number;
  completedAt: string; // ISO string
}

export interface QuickChecklistItem {
  id: string;
  text: string;
  done: boolean;
}

export interface QuickNotesState {
  checklist: QuickChecklistItem[];
  freeText: string;
}

export interface Flashcard {
  id: string;
  question: string;
  answer: string;
  status?: 'new' | 'learning' | 'mastered';
  lastReviewed?: string;
}

export interface QuizItem {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface Deck {
  id: string;
  title: string;
  sourceDocumentId?: string;
  sourceDocumentName?: string;
  summary?: string;
  createdAt: string;
  cards: Flashcard[];
  quizzes: QuizItem[];
}

export interface DocumentChatRequest {
  message: string;
  history: Array<{ role: 'user' | 'assistant'; text: string }>;
  file: {
    name: string;
    mimeType: string;
    base64Data?: string;
    textData?: string;
  };
}

export interface GenerateCardsResponse {
  deckTitle: string;
  summary?: string;
  flashcards: Array<{
    id: string;
    question: string;
    answer: string;
  }>;
  quizzes: Array<{
    id: string;
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  }>;
}
