import { config } from './config.js';
import { ApiError } from './errors.js';

const redact = (s) => (config.apiKey ? String(s).split(config.apiKey).join('[KEY]') : String(s));

function mapUpstreamError(status, data) {
  const detail = redact(data?.error?.message || '');
  console.error(`[gemini] HTTP ${status}${detail ? `: ${detail}` : ''}`);

  if (status === 401 || status === 403 || (status === 400 && /api key/i.test(detail))) {
    return new ApiError(502, 'GEMINI_AUTH', 'GEMINI_API_KEY không hợp lệ hoặc không có quyền dùng Gemini API. Hãy kiểm tra lại key trong file .env rồi khởi động lại backend.');
  }
  if (status === 404) {
    return new ApiError(502, 'GEMINI_MODEL', `Không tìm thấy model "${config.model}". Hãy đặt GEMINI_MODEL hợp lệ trong .env (xem danh sách model trên ai.google.dev).`);
  }
  if (status === 429) {
    return new ApiError(429, 'GEMINI_QUOTA', 'Gemini API báo hết hạn mức hoặc quá nhiều yêu cầu. Vui lòng thử lại sau ít phút.');
  }
  if (status >= 500) {
    return new ApiError(502, 'GEMINI_UNAVAILABLE', 'Dịch vụ Gemini đang tạm thời không khả dụng. Vui lòng thử lại sau.');
  }
  return new ApiError(502, 'GEMINI_BAD_REQUEST', 'Gemini từ chối yêu cầu. Xem nhật ký của backend để biết chi tiết.');
}

/**
 * Gọi Gemini generateContent bằng REST API, hỗ trợ multimodal (cả text và inlineData base64).
 */
export async function askGeminiWithParts({ system, contents, timeoutMs = 60_000 }) {
  const url = `${config.apiBase}/models/${encodeURIComponent(config.model)}:generateContent`;
  const useThinking = Boolean(config.thinkingLevel && config.thinkingLevel !== 'none');
  const generationConfig = { maxOutputTokens: 8192 };
  if (useThinking) generationConfig.thinkingConfig = { thinkingLevel: config.thinkingLevel };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  let res;
  let data;
  try {
    const request = async (includeThinking) => {
      const bodyConfig = { maxOutputTokens: 8192 };
      if (includeThinking) bodyConfig.thinkingConfig = generationConfig.thinkingConfig;
      const bodyPayload = { contents, generationConfig: bodyConfig };
      if (system) {
        bodyPayload.systemInstruction = { parts: [{ text: system }] };
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': config.apiKey },
        body: JSON.stringify(bodyPayload),
        signal: controller.signal,
      });
      return { response, body: await response.json().catch(() => null) };
    };

    let result = await request(useThinking);
    const upstreamMessage = result.body?.error?.message ?? '';
    if (useThinking && result.response.status === 400 && /think/i.test(upstreamMessage)) {
      console.warn(`[gemini] ${config.model} rejected thinkingConfig; retrying without it.`);
      result = await request(false);
    }
    res = result.response;
    data = result.body;
  } catch (err) {
    if (err?.name === 'AbortError') throw new ApiError(504, 'GEMINI_TIMEOUT', 'Gemini phản hồi quá lâu. Vui lòng thử lại.');
    console.error('[gemini] network error:', redact(err?.message || err));
    throw new ApiError(502, 'GEMINI_UNREACHABLE', 'Backend không kết nối được tới Gemini API. Kiểm tra mạng của máy chủ.');
  } finally {
    clearTimeout(timer);
  }

  if (!res.ok) throw mapUpstreamError(res.status, data);

  const candidate = data?.candidates?.[0];
  const text = (candidate?.content?.parts ?? [])
    .filter((p) => typeof p?.text === 'string' && !p.thought)
    .map((p) => p.text)
    .join('')
    .trim();
  if (text) return text;

  if (data?.promptFeedback?.blockReason || candidate?.finishReason === 'SAFETY') {
    throw new ApiError(422, 'GEMINI_BLOCKED', 'Gemini từ chối trả lời nội dung này. Hãy thử diễn đạt khác.');
  }
  throw new ApiError(502, 'GEMINI_EMPTY', 'Gemini không trả về nội dung. Vui lòng thử lại.');
}

/** Tương thích ngược với hàm askGemini cũ. */
export async function askGemini({ system, contents }) {
  return askGeminiWithParts({ system, contents });
}

/**
 * Trích xuất và chuẩn hóa JSON cho bộ thẻ flashcards & câu hỏi quiz từ phản hồi thô của Gemini.
 */
export function sanitizeAndParseCardsJson(rawText, fallbackName = 'Tài liệu') {
  if (typeof rawText !== 'string' || !rawText.trim()) {
    throw new ApiError(502, 'GEMINI_EMPTY', 'Gemini không trả về nội dung để tạo thẻ.');
  }

  let text = rawText.trim();

  // Bỏ markdown code block nếu Gemini bọc json (```json ... ``` hoặc ``` ...)
  text = text.replace(/^\s*```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '').trim();

  // Bóc tách khối JSON giữa cặp ngoặc nhọn ngoài cùng
  const firstBrace = text.indexOf('{');
  const lastBrace = text.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    text = text.slice(firstBrace, lastBrace + 1);
  }

  // Dọn dẹp dấu phẩy thừa trước dấu đóng ngoặc (trailing commas: ,] hoặc ,})
  text = text.replace(/,(\s*,)+/g, ',').replace(/,\s*([}\]])/g, '$1');

  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    try {
      // Dọn dẹp các ký tự điều khiển ẩn có thể làm gãy JSON
      const cleaned = text.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '');
      parsed = JSON.parse(cleaned);
    } catch (parseErr) {
      console.error('[gemini] Lỗi parse JSON thẻ học:', parseErr.message, '\nĐoạn trích thô:', text.slice(0, 300));
      throw new ApiError(502, 'GEMINI_INVALID_JSON', 'Không thể phân tích dữ liệu JSON trả về từ AI. Hãy thử lại.');
    }
  }

  if (!parsed || typeof parsed !== 'object') {
    throw new ApiError(502, 'GEMINI_INVALID_JSON', 'Dữ liệu bộ thẻ từ AI không đúng định dạng đối tượng.');
  }

  const deckTitle = typeof parsed.deckTitle === 'string' && parsed.deckTitle.trim()
    ? parsed.deckTitle.trim().slice(0, 100)
    : `Bộ thẻ: ${fallbackName}`;

  const summary = typeof parsed.summary === 'string' ? parsed.summary.trim() : '';

  const rawCards = Array.isArray(parsed.flashcards) ? parsed.flashcards : [];
  const flashcards = rawCards
    .map((c, i) => ({
      id: typeof c?.id === 'string' && c.id.trim() ? c.id.trim() : `card-${i + 1}`,
      question: typeof c?.question === 'string' ? c.question.trim() : '',
      answer: typeof c?.answer === 'string' ? c.answer.trim() : '',
    }))
    .filter((c) => c.question && c.answer);

  const rawQuizzes = Array.isArray(parsed.quizzes) ? parsed.quizzes : [];
  const quizzes = rawQuizzes
    .map((q, i) => {
      const options = Array.isArray(q?.options)
        ? q.options.map((opt) => String(opt || '').trim()).filter(Boolean)
        : [];
      const correctIndex = Number.isInteger(q?.correctIndex) && q.correctIndex >= 0 && q.correctIndex < options.length
        ? q.correctIndex
        : 0;
      return {
        id: typeof q?.id === 'string' && q.id.trim() ? q.id.trim() : `quiz-${i + 1}`,
        question: typeof q?.question === 'string' ? q.question.trim() : '',
        options,
        correctIndex,
        explanation: typeof q?.explanation === 'string' ? q.explanation.trim() : '',
      };
    })
    .filter((q) => q.question && q.options.length >= 2);

  if (flashcards.length === 0 && quizzes.length === 0) {
    throw new ApiError(502, 'GEMINI_EMPTY_CARDS', 'AI không trích xuất được flashcard hay câu hỏi trắc nghiệm nào từ tài liệu này.');
  }

  return {
    deckTitle,
    summary,
    flashcards,
    quizzes,
  };
}

/**
 * Sinh bộ thẻ ghi nhớ và câu hỏi trắc nghiệm có cấu trúc từ tệp tài liệu (PDF, Ảnh hoặc Văn bản).
 */
export async function generateStructuredCards({ file, count = 10 }) {
  const targetCount = Math.max(3, Math.min(Number(count) || 10, 30));
  const quizCount = Math.max(2, Math.min(Math.round(targetCount * 0.6), 10));

  const system = [
    'Bạn là chuyên gia giáo dục và tạo học liệu thông minh cho học sinh, sinh viên.',
    'Nhiệm vụ của bạn là phân tích tài liệu được cung cấp và tạo ra một bộ thẻ ghi nhớ (flashcards) và câu hỏi trắc nghiệm (quizzes).',
    '',
    'YÊU CẦU ĐẦU RA CỤ THỂ:',
    '1. "deckTitle": Tiêu đề ngắn gọn, súc tích cho bộ thẻ (dưới 60 ký tự, phản ánh chủ đề chính của tài liệu).',
    '2. "summary": Tóm tắt nội dung tài liệu trong 2-3 câu ngắn gọn.',
    `3. "flashcards": Mảng chính xác ${targetCount} thẻ ghi nhớ gồm khái niệm, định nghĩa, công thức toán/lý/hóa quan trọng, hoặc các mốc kiến thức cốt lõi.`,
    '   Mỗi thẻ gồm: { "id": "card-1", "question": "Mặt trước thẻ (Khái niệm / Câu hỏi)", "answer": "Mặt sau thẻ (Giải thích chi tiết / Đáp án)" }',
    `4. "quizzes": Mảng chính xác ${quizCount} câu hỏi trắc nghiệm 4 lựa chọn (A, B, C, D) kiểm tra kiến thức.`,
    '   Mỗi câu gồm: { "id": "quiz-1", "question": "Nội dung câu hỏi?", "options": ["Lựa chọn A", "Lựa chọn B", "Lựa chọn C", "Lựa chọn D"], "correctIndex": 0, "explanation": "Giải thích chi tiết vì sao đáp án này đúng" }',
    '   (Lưu ý: "correctIndex" là số nguyên từ 0 đến 3 chỉ định vị trí phương án đúng trong mảng "options").',
    '',
    'QUY TẮC BẮT BUỘC:',
    '- Trả lời bằng tiếng Việt (trừ khi tài liệu là môn ngoại ngữ).',
    '- Chỉ trả về DUY NHẤT một chuỗi JSON hợp lệ, KHÔNG kèm văn bản mở đầu hay kết thúc, KHÔNG bọc trong markdown code fence.',
    '- Cấu trúc JSON mẫu bắt buộc:',
    JSON.stringify(
      {
        deckTitle: 'Tiêu đề bộ thẻ',
        summary: 'Tóm tắt tài liệu',
        flashcards: [{ id: 'card-1', question: 'Câu hỏi mặt trước', answer: 'Đáp án mặt sau' }],
        quizzes: [
          {
            id: 'quiz-1',
            question: 'Câu hỏi trắc nghiệm',
            options: ['Lựa chọn A', 'Lựa chọn B', 'Lựa chọn C', 'Lựa chọn D'],
            correctIndex: 0,
            explanation: 'Giải thích',
          },
        ],
      },
      null,
      2
    ),
  ].join('\n');

  const userParts = [];
  const rawBase64 = file?.base64Data || file?.data;
  if (rawBase64) {
    const cleanBase64 = rawBase64.replace(/^data:[^;]+;base64,/, '').trim();
    userParts.push({
      inlineData: {
        mimeType: file.mimeType || 'application/pdf',
        data: cleanBase64,
      },
    });
  }

  if (file?.textData) {
    userParts.push({
      text: `NỘI DUNG TÀI LIỆU (${file.name || 'Tài liệu'}):\n${file.textData}`,
    });
  }

  userParts.push({
    text: `Hãy phân tích tài liệu "${file?.name || 'này'}" và tạo bộ thẻ gồm ${targetCount} flashcards và ${quizCount} câu trắc nghiệm dạng JSON chuẩn theo đúng hướng dẫn.`,
  });

  const contents = [{ role: 'user', parts: userParts }];

  const rawText = await askGeminiWithParts({ system, contents, timeoutMs: 90_000 });
  return sanitizeAndParseCardsJson(rawText, file?.name || 'Tài liệu');
}
