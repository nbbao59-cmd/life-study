import { AiContext, ChatMessage } from '../types';
import { formatDate, todayISO } from '../utils/helpers';
import { localMathHint } from './mathHint';

/**
 * Giao tiếp với backend AI (thư mục server/). Backend giữ GEMINI_API_KEY và gọi Gemini.
 * Frontend KHÔNG chứa key. Mặc định gọi /api/chat (Vite proxy sang backend khi phát triển).
 * Khi lỗi, hàm ném AssistantError với thông báo rõ ràng — không có câu trả lời thay thế âm thầm.
 */
const ENDPOINT = (import.meta.env.VITE_AI_API_ENDPOINT ?? '').trim() || '/api/chat';
const HEALTH_URL = ENDPOINT.replace(/\/chat\/?$/, '/health');

export type BackendStatus = 'checking' | 'ready' | 'no-key' | 'offline' | 'error';

export class AssistantError extends Error {
  constructor(public code: string, message: string, public localMath: string | null = null) {
    super(message);
  }
}

export async function checkBackend(): Promise<BackendStatus> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 5_000);
  try {
    const res = await fetch(HEALTH_URL, { cache: 'no-store', signal: controller.signal });
    if (!res.ok) return 'offline';
    const data = (await res.json()) as { geminiConfigured?: boolean };
    return data.geminiConfigured ? 'ready' : 'no-key';
  } catch {
    return 'offline';
  } finally {
    clearTimeout(timer);
  }
}

const OFFLINE_MSG =
  'Không kết nối được tới backend AI. Hãy chạy backend bằng `npm run server` (hoặc chạy cả hai bằng `npm run dev:all`) rồi thử lại.';

export async function askAssistant(message: string, ctx: AiContext, history: ChatMessage[]): Promise<string> {
  const now = new Date();
  const verifiedMath = localMathHint(message);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 45_000);
  try {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        message,
        history: history.filter((m) => !m.error).slice(-10).map(({ role, text }) => ({ role, text })),
        verifiedMath: verifiedMath ?? undefined,
        context: {
          energy: ctx.energy,
          mood: ctx.mood,
          now: {
            date: todayISO(),
            time: now.toTimeString().slice(0, 5),
            weekday: formatDate(todayISO()).split(',')[0],
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          },
          tasks: ctx.tasks.map(({ title, subject, priority, date, minutes, done }) => ({ title, subject, priority, date, minutes, done })),
          rhythm: ctx.rhythm.map(({ time, label, kind, done }) => ({ time, label, kind, done })),
        },
      }),
    });

    let data: { reply?: unknown; error?: { code?: string; message?: string } } | null = null;
    try {
      data = await res.json();
    } catch {
      /* phản hồi không phải JSON */
    }

    if (!res.ok) {
      // Vite proxy trả 5xx không có JSON khi backend chưa chạy
      if (!data?.error) throw new AssistantError('OFFLINE', OFFLINE_MSG, verifiedMath);
      throw new AssistantError(data.error.code ?? 'ERROR', data.error.message ?? 'Backend trả về lỗi.', verifiedMath);
    }
    if (typeof data?.reply !== 'string' || !data.reply.trim()) {
      throw new AssistantError('EMPTY', 'Backend không trả về nội dung. Vui lòng thử lại.', verifiedMath);
    }
    return data.reply;
  } catch (err) {
    if (err instanceof AssistantError) throw err;
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new AssistantError('TIMEOUT', 'Backend phản hồi quá lâu. Vui lòng thử lại.', verifiedMath);
    }
    throw new AssistantError('OFFLINE', OFFLINE_MSG, verifiedMath);
  } finally {
    clearTimeout(timer);
  }
}
