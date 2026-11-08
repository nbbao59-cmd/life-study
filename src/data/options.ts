import { Mood, Priority, RhythmKind, RelaxKind, SectionId } from '../types';

export const MOODS: { id: Mood; emoji: string; label: string }[] = [
  { id: 'great', emoji: '🤩', label: 'Tuyệt vời' },
  { id: 'good', emoji: '🙂', label: 'Tốt' },
  { id: 'ok', emoji: '😐', label: 'Bình thường' },
  { id: 'tired', emoji: '😴', label: 'Mệt' },
  { id: 'stressed', emoji: '😣', label: 'Căng thẳng' },
];

export const PRIORITY_LABEL: Record<Priority, string> = {
  high: 'Cao',
  medium: 'Trung bình',
  low: 'Thấp',
};
export const PRIORITY_ORDER: Record<Priority, number> = { high: 0, medium: 1, low: 2 };

export const RHYTHM_ICON: Record<RhythmKind, string> = {
  wake: '☀️',
  meal: '🍚',
  exercise: '🏃',
  study: '📚',
  relax: '🎧',
  sleep: '🌙',
};
export const RHYTHM_LABEL: Record<RhythmKind, string> = {
  wake: 'Thức dậy',
  meal: 'Ăn uống',
  exercise: 'Thể dục',
  study: 'Học tập',
  relax: 'Thư giãn',
  sleep: 'Đi ngủ',
};

export const RELAX_LABEL: Record<RelaxKind, string> = {
  youtube: 'YouTube',
  podcast: 'Podcast',
  book: 'Sách',
  hobby: 'Sở thích',
};

export const NAV: { id: SectionId; label: string; zone: string; hint: string }[] = [
  { id: 'dashboard', label: 'Tổng quan', zone: 'zone-dash', hint: 'Tiến độ hôm nay' },
  { id: 'study', label: 'Lịch học tập', zone: 'zone-study', hint: 'Bài tập & môn học' },
  { id: 'documents', label: 'Tài liệu', zone: 'zone-documents', hint: 'Tệp học tập của bạn' },
  { id: 'flashcards', label: 'Ôn tập', zone: 'zone-study', hint: 'Flashcard 3D & Quiz' },
  { id: 'rhythm', label: 'Nhịp sinh học', zone: 'zone-rhythm', hint: 'Dòng thời gian' },
  { id: 'rest', label: 'Nghỉ ngơi', zone: 'zone-rest', hint: 'Pomodoro & giãn cơ' },
  { id: 'relaxation', label: 'Thư giãn', zone: 'zone-relax', hint: 'YouTube, sách, podcast' },
  { id: 'assistant', label: 'Trợ lý AI', zone: 'zone-ai', hint: 'Toán, lịch, tư vấn' },
];
