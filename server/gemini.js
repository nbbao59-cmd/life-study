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

/** Gọi Gemini generateContent bằng REST; key chỉ nằm trong header gửi từ server. */
export async function askGemini({ system, contents }) {
  const url = `${config.apiBase}/models/${encodeURIComponent(config.model)}:generateContent`;
  const useThinking = Boolean(config.thinkingLevel && config.thinkingLevel !== 'none');
  const generationConfig = { maxOutputTokens: 4096 };
  if (useThinking) generationConfig.thinkingConfig = { thinkingLevel: config.thinkingLevel };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 30_000);
  let res;
  let data;
  try {
    const request = async (includeThinking) => {
      const bodyConfig = { maxOutputTokens: 4096 };
      if (includeThinking) bodyConfig.thinkingConfig = generationConfig.thinkingConfig;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': config.apiKey },
        body: JSON.stringify({ systemInstruction: { parts: [{ text: system }] }, contents, generationConfig: bodyConfig }),
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
