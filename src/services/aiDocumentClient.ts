import { Deck, DocumentChatRequest, GenerateCardsResponse } from '../types';

const CHAT_ENDPOINT = (import.meta.env?.VITE_AI_API_ENDPOINT ?? '').trim() || '/api/chat';
const API_BASE = CHAT_ENDPOINT.replace(/\/chat\/?$/, '');

const DOCUMENT_CHAT_URL = `${API_BASE}/document-chat`;
const GENERATE_CARDS_URL = `${API_BASE}/generate-cards`;

const OFFLINE_MSG =
  'Không kết nối được tới backend AI. Hãy đảm bảo bạn đã khởi động server bằng `npm run server` (hoặc `npm run dev:all`) rồi thử lại.';

export class AiDocumentError extends Error {
  constructor(
    public code: string,
    message: string,
    public status?: number
  ) {
    super(message);
    this.name = 'AiDocumentError';
  }
}

export interface DocumentFilePayload {
  name: string;
  mimeType: string;
  base64Data?: string;
  textData?: string;
}

export interface AskDocumentChatParams {
  message: string;
  history: Array<{ role: 'user' | 'assistant'; text: string }>;
  file: DocumentFilePayload;
}

export interface GenerateCardsParams {
  file: DocumentFilePayload;
  count?: number;
}

async function handleResponseError(res: Response): Promise<never> {
  let errorData: { error?: { code?: string; message?: string } } | null = null;
  try {
    errorData = await res.json();
  } catch {
    /* phản hồi không phải JSON */
  }

  if (errorData?.error?.message) {
    throw new AiDocumentError(errorData.error.code || 'API_ERROR', errorData.error.message, res.status);
  }

  if (res.status === 413) {
    throw new AiDocumentError('PAYLOAD_TOO_LARGE', 'Kích thước tệp tài liệu quá lớn (~25MB tối đa). Vui lòng chọn tệp nhỏ hơn.', 413);
  }
  if (res.status === 503) {
    throw new AiDocumentError(
      'NOT_CONFIGURED',
      'Backend chưa có GEMINI_API_KEY. Hãy tạo file .env từ .env.example, điền GEMINI_API_KEY rồi khởi động lại backend.',
      503
    );
  }
  if (res.status === 429) {
    throw new AiDocumentError('RATE_LIMITED', 'Bạn đang gửi yêu cầu quá nhanh hoặc hết hạn mức AI. Vui lòng thử lại sau ít phút.', 429);
  }

  throw new AiDocumentError('HTTP_ERROR', `Lỗi máy chủ (${res.status}). Vui lòng thử lại sau.`, res.status);
}

/**
 * Gửi câu hỏi và tệp tài liệu (PDF, Ảnh hoặc Văn bản) tới AI để nhận giải đáp chuyên sâu.
 */
export async function askDocumentChat(params: AskDocumentChatParams | DocumentChatRequest): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 60_000);

  try {
    const res = await fetch(DOCUMENT_CHAT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        message: params.message,
        history: (params.history || []).slice(-20).map(({ role, text }) => ({ role, text })),
        file: params.file,
      }),
    });

    if (!res.ok) {
      await handleResponseError(res);
    }

    const data = (await res.json()) as { reply?: string };
    if (typeof data?.reply !== 'string' || !data.reply.trim()) {
      throw new AiDocumentError('EMPTY_RESPONSE', 'Trợ lý AI không trả về câu trả lời. Vui lòng thử lại.');
    }

    return data.reply;
  } catch (err) {
    if (err instanceof AiDocumentError) throw err;
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new AiDocumentError('TIMEOUT', 'Trợ lý AI phản hồi quá lâu. Vui lòng thử lại với câu hỏi ngắn hơn.');
    }
    throw new AiDocumentError('OFFLINE', OFFLINE_MSG);
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Phân tích tệp tài liệu và tự động sinh bộ thẻ ghi nhớ (Flashcards) + câu hỏi trắc nghiệm (Quizzes).
 */
export async function generateCardsFromDocument(params: GenerateCardsParams): Promise<GenerateCardsResponse> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 120_000);

  try {
    const res = await fetch(GENERATE_CARDS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        file: params.file,
        count: params.count ?? 10,
      }),
    });

    if (!res.ok) {
      await handleResponseError(res);
    }

    const json = (await res.json()) as { ok?: boolean; data?: GenerateCardsResponse };
    if (!json?.ok || !json?.data) {
      throw new AiDocumentError('INVALID_RESPONSE', 'Dữ liệu bộ thẻ trả về từ máy chủ không hợp lệ.');
    }

    return json.data;
  } catch (err) {
    if (err instanceof AiDocumentError) throw err;
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new AiDocumentError('TIMEOUT', 'Thời gian phân tích tài liệu và sinh bộ thẻ quá lâu (hơn 2 phút). Hãy thử tài liệu ngắn hơn.');
    }
    throw new AiDocumentError('OFFLINE', OFFLINE_MSG);
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Tiện ích chuyển đổi kết quả sinh thẻ từ AI thành đối tượng Deck hoàn chỉnh để lưu trữ.
 */
export function createDeckFromGenerationResult(
  result: GenerateCardsResponse,
  sourceDocument?: { id?: string; name?: string }
): Deck {
  const now = new Date().toISOString();
  return {
    id: `deck-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    title: result.deckTitle || `Bộ thẻ: ${sourceDocument?.name || 'Tài liệu'}`,
    sourceDocumentId: sourceDocument?.id,
    sourceDocumentName: sourceDocument?.name,
    summary: result.summary,
    createdAt: now,
    cards: (result.flashcards || []).map((card, index) => ({
      id: card.id || `card-${index + 1}`,
      question: card.question,
      answer: card.answer,
      status: 'new' as const,
    })),
    quizzes: (result.quizzes || []).map((quiz, index) => ({
      id: quiz.id || `quiz-${index + 1}`,
      question: quiz.question,
      options: quiz.options,
      correctIndex: quiz.correctIndex,
      explanation: quiz.explanation,
    })),
  };
}
