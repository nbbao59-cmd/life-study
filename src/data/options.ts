import { Mood, Priority, RhythmKind, RelaxKind, SectionId } from '../types/index';

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

export const SECTION_SLUGS: Record<SectionId, string> = {
  dashboard: 'tong-quan',
  study: 'lich-hoc-tap',
  documents: 'tai-lieu',
  flashcards: 'on-tap',
  rhythm: 'nhip-sinh-hoc',
  rest: 'nghi-ngoi',
  relaxation: 'thu-gian',
  assistant: 'tro-ly-ai',
};

export const SLUG_TO_SECTION: Record<string, SectionId> = {
  'tong-quan': 'dashboard',
  'lich-hoc-tap': 'study',
  'tai-lieu': 'documents',
  'on-tap': 'flashcards',
  'nhip-sinh-hoc': 'rhythm',
  'nghi-ngoi': 'rest',
  'thu-gian': 'relaxation',
  'tro-ly-ai': 'assistant',
  // Tiếng Anh dự phòng
  dashboard: 'dashboard',
  study: 'study',
  documents: 'documents',
  flashcards: 'flashcards',
  rhythm: 'rhythm',
  rest: 'rest',
  relaxation: 'relaxation',
  assistant: 'assistant',
};

export interface NavItem {
  id: SectionId;
  slug: string;
  label: string;
  zone: string;
  hint: string;
}

export const NAV: NavItem[] = [
  { id: 'dashboard', slug: 'tong-quan', label: 'Tổng quan', zone: 'zone-dash', hint: 'Tiến độ hôm nay' },
  { id: 'study', slug: 'lich-hoc-tap', label: 'Lịch học tập', zone: 'zone-study', hint: 'Bài tập & môn học' },
  { id: 'documents', slug: 'tai-lieu', label: 'Tài liệu', zone: 'zone-documents', hint: 'Tệp học tập của bạn' },
  { id: 'flashcards', slug: 'on-tap', label: 'Ôn tập', zone: 'zone-study', hint: 'Flashcard 3D & Quiz' },
  { id: 'rhythm', slug: 'nhip-sinh-hoc', label: 'Nhịp sinh học', zone: 'zone-rhythm', hint: 'Dòng thời gian' },
  { id: 'rest', slug: 'nghi-ngoi', label: 'Nghỉ ngơi', zone: 'zone-rest', hint: 'Pomodoro & giãn cơ' },
  { id: 'relaxation', slug: 'thu-gian', label: 'Thư giãn', zone: 'zone-relax', hint: 'YouTube, sách, podcast' },
  { id: 'assistant', slug: 'tro-ly-ai', label: 'Trợ lý AI', zone: 'zone-ai', hint: 'Toán, lịch, tư vấn' },
];
