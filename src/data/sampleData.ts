import { ChatMessage, RelaxItem, RhythmItem, Task } from '../types';
import { addDays, todayISO } from '../utils/helpers';

const t = todayISO();

export const sampleTasks: Task[] = [
  { id: 's1', title: 'Làm bài tập đạo hàm', subject: 'Toán', priority: 'high', date: t, minutes: 60, done: false },
  { id: 's2', title: 'Ôn từ vựng Unit 5', subject: 'Tiếng Anh', priority: 'medium', date: t, minutes: 30, done: true },
  { id: 's3', title: 'Đọc chương 3 Sinh học', subject: 'Sinh học', priority: 'low', date: t, minutes: 40, done: false },
  { id: 's4', title: 'Viết báo cáo thí nghiệm', subject: 'Vật lý', priority: 'high', date: addDays(t, 1), minutes: 90, done: false },
  { id: 's5', title: 'Luyện đề Reading', subject: 'Tiếng Anh', priority: 'medium', date: addDays(t, 2), minutes: 45, done: false },
];

export const sampleRhythm: RhythmItem[] = [
  { id: 'r1', time: '06:30', label: 'Thức dậy, uống nước', kind: 'wake', done: false },
  { id: 'r2', time: '07:00', label: 'Ăn sáng', kind: 'meal', done: false },
  { id: 'r3', time: '08:30', label: 'Học buổi sáng', kind: 'study', done: false },
  { id: 'r4', time: '12:00', label: 'Ăn trưa & nghỉ ngắn', kind: 'meal', done: false },
  { id: 'r5', time: '17:30', label: 'Chạy bộ / giãn cơ', kind: 'exercise', done: false },
  { id: 'r6', time: '20:30', label: 'Nghe podcast, đọc sách', kind: 'relax', done: false },
  { id: 'r7', time: '23:00', label: 'Đi ngủ', kind: 'sleep', done: false },
];

export const sampleRelax: RelaxItem[] = [
  {
    id: 'y1',
    kind: 'youtube',
    title: 'Lofi hip hop radio – beats to relax/study to',
    note: 'Nhạc nền tập trung',
    url: 'https://www.youtube.com/watch?v=jfKfPfyJRdk',
  },
  {
    id: 'y2',
    kind: 'youtube',
    title: 'Lofi hip hop radio – beats to sleep/chill to',
    note: 'Thư giãn buổi tối',
    url: 'https://www.youtube.com/watch?v=5qap5aO4i9A',
  },
  {
    id: 'y3',
    kind: 'youtube',
    title: 'Nhạc không lời thư giãn (tìm trên YouTube)',
    note: 'Mở kết quả tìm kiếm',
    url: 'https://www.youtube.com/results?search_query=nhac+khong+loi+thu+gian',
  },
  { id: 'p1', kind: 'podcast', title: 'Podcast phát triển bản thân', note: 'Nghe 1 tập trước khi ngủ' },
  { id: 'b1', kind: 'book', title: 'Atomic Habits', note: 'Đang đọc chương 4' },
  { id: 'h1', kind: 'hobby', title: 'Vẽ phác thảo', note: 'Cuối tuần 30 phút' },
];

export const welcomeMessages: ChatMessage[] = [
  {
    id: 'w1',
    role: 'assistant',
    text:
      'Xin chào! Mình có thể:\n' +
      '🧮 Giải toán: "tính 2*(3+4)^2", "giải 2x^2 - 8 = 0"\n' +
      '📅 Tư vấn lịch học: "hôm nay nên học gì?"\n' +
      '📊 Phân tích lịch: "phân tích lịch của mình"',
  },
];
