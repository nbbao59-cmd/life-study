export type SectionId = 'dashboard' | 'study' | 'documents' | 'rhythm' | 'rest' | 'relaxation' | 'assistant';
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
