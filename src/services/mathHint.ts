import { solveMath, stripMathWords } from './mathSolver';

const MATH_WORDS = ['giải', 'tính', 'phương trình', 'bằng bao nhiêu', 'solve', 'calculate'];
const FUNC_NAMES = /\b(sqrt|cbrt|abs|sin|cos|tan|ln|log|exp|round|floor|ceil|pi)\b/g;

/** Chuỗi chỉ gồm ký tự toán học (cho phép tên hàm), có ít nhất một chữ số. */
const isPureMath = (s: string): boolean => {
  const t = s.toLowerCase().replace(FUNC_NAMES, '');
  return /\d/.test(t) && /^[\d\s+\-*/^().,=x×÷%!²³√π]+$/.test(t);
};

/**
 * Nếu câu hỏi là phép tính/phương trình giải được, trả về kết quả chính xác tính trên máy.
 * Kết quả này gửi kèm cho backend làm "đáp án kiểm chứng" để Gemini giải thích; không thay thế Gemini.
 */
export function localMathHint(message: string): string | null {
  const lower = message.toLowerCase();
  const looksLikeMath = MATH_WORDS.some((w) => lower.includes(w)) || isPureMath(stripMathWords(message));
  if (!looksLikeMath) return null;
  const r = solveMath(message);
  return r.ok ? r.text : null;
}
