import { ApiError } from './errors.js';

const MOODS = new Set(['great', 'good', 'ok', 'tired', 'stressed']);
const PRIORITIES = new Set(['high', 'medium', 'low']);
const KINDS = new Set(['wake', 'meal', 'exercise', 'study', 'relax', 'sleep']);

const str = (v, max) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
const num = (v, min, max, d) => {
  const n = Number(v);
  return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : d;
};
const list = (v, max) => (Array.isArray(v) ? v.slice(0, max) : []);

/** Làm sạch và giới hạn kích thước mọi dữ liệu do client gửi lên. */
export function parseChatRequest(body) {
  if (!body || typeof body !== 'object') throw new ApiError(400, 'BAD_REQUEST', 'Yêu cầu không hợp lệ.');

  const message = str(body.message, 2000);
  if (!message) throw new ApiError(400, 'BAD_REQUEST', 'Thiếu nội dung câu hỏi.');

  const history = list(body.history, 10)
    .map((h) => ({ role: h?.role === 'assistant' ? 'model' : 'user', text: str(h?.text, 2000) }))
    .filter((h) => h.text);

  const c = body.context && typeof body.context === 'object' ? body.context : {};
  const now = c.now && typeof c.now === 'object' ? c.now : {};

  return {
    message,
    history,
    verifiedMath: str(body.verifiedMath, 500),
    context: {
      energy: num(c.energy, 1, 5, 3),
      mood: MOODS.has(c.mood) ? c.mood : 'ok',
      now: { date: str(now.date, 10), time: str(now.time, 5), weekday: str(now.weekday, 20), timezone: str(now.timezone, 60) },
      tasks: list(c.tasks, 120)
        .map((t) => ({
          title: str(t?.title, 160),
          subject: str(t?.subject, 60),
          priority: PRIORITIES.has(t?.priority) ? t.priority : 'medium',
          date: str(t?.date, 10),
          minutes: num(t?.minutes, 0, 1440, 30),
          done: Boolean(t?.done),
        }))
        .filter((t) => t.title),
      rhythm: list(c.rhythm, 60)
        .map((r) => ({
          time: str(r?.time, 5),
          label: str(r?.label, 120),
          kind: KINDS.has(r?.kind) ? r.kind : 'study',
          done: Boolean(r?.done),
        }))
        .filter((r) => r.label),
    },
  };
}

/** Chuẩn hóa và kiểm tra tệp tài liệu (PDF/ảnh dạng base64 hoặc nội dung văn bản trích xuất). */
export function parseFilePayload(file) {
  if (!file || typeof file !== 'object') {
    throw new ApiError(400, 'BAD_REQUEST', 'Thiếu thông tin tệp tài liệu.');
  }

  const name = str(file.name, 255) || 'Tài liệu';
  const mimeType = str(file.mimeType, 120) || 'application/octet-stream';

  let base64Data = typeof file.base64Data === 'string' ? file.base64Data : (typeof file.data === 'string' ? file.data : '');
  if (base64Data) {
    base64Data = base64Data.replace(/^data:[^;]+;base64,/, '').trim();
    if (base64Data.length > 35 * 1024 * 1024) {
      throw new ApiError(413, 'PAYLOAD_TOO_LARGE', 'Kích thước tệp tải lên quá lớn (tối đa ~25MB).');
    }
  }

  const textData = typeof file.textData === 'string' ? file.textData.slice(0, 100_000) : (typeof file.text === 'string' ? file.text.slice(0, 100_000) : '');

  if (!base64Data && !textData) {
    throw new ApiError(400, 'BAD_REQUEST', 'Tài liệu không có nội dung văn bản hoặc dữ liệu tệp.');
  }

  return { name, mimeType, base64Data, textData };
}

/** Xác thực yêu cầu hỏi đáp tài liệu /api/document-chat */
export function parseDocumentChatRequest(body) {
  if (!body || typeof body !== 'object') throw new ApiError(400, 'BAD_REQUEST', 'Yêu cầu không hợp lệ.');

  const message = str(body.message, 4000);
  if (!message) throw new ApiError(400, 'BAD_REQUEST', 'Thiếu nội dung câu hỏi.');

  const history = list(body.history, 20)
    .map((h) => ({
      role: h?.role === 'assistant' || h?.role === 'model' ? 'model' : 'user',
      text: str(h?.text, 4000),
    }))
    .filter((h) => h.text);

  const file = parseFilePayload(body.file);

  return { message, history, file };
}

/** Xác thực yêu cầu sinh thẻ ôn tập /api/generate-cards */
export function parseGenerateCardsRequest(body) {
  if (!body || typeof body !== 'object') throw new ApiError(400, 'BAD_REQUEST', 'Yêu cầu không hợp lệ.');

  const file = parseFilePayload(body.file);
  const count = num(body.count, 3, 30, 10);

  return { file, count };
}
