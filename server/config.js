import dotenv from 'dotenv';

// Đọc biến môi trường từ file .env ở thư mục gốc (chỉ chạy trên server).
dotenv.config({ quiet: true });

const int = (v, d) => {
  const n = parseInt(v ?? '', 10);
  return Number.isFinite(n) && n > 0 ? n : d;
};

// Chuẩn hóa và tách danh sách key từ GEMINI_API_KEYS (phân tách dấu phẩy, chấm phẩy hoặc xuống dòng) và GEMINI_API_KEY
const parseApiKeys = () => {
  const rawList = [
    ...(process.env.GEMINI_API_KEYS || '').split(/[,\r\n;]+/),
    process.env.GEMINI_API_KEY || '',
  ];

  const cleaned = rawList
    .map((k) => (k || '').trim().replace(/^["']|["']$/g, '').trim())
    .filter((k) => k.length > 0 && !/^(your[_-]|changeme|xxx)/i.test(k));

  return Array.from(new Set(cleaned));
};

const apiKeys = parseApiKeys();
let roundRobinIndex = 0;

export const config = {
  host: (process.env.HOST || '127.0.0.1').trim(),
  port: int(process.env.PORT, 8787),
  apiKeys,
  get apiKey() {
    return apiKeys[0] || '';
  },
  model: (process.env.GEMINI_MODEL || 'gemini-3.5-flash').trim(),
  // "none" = không gửi tham số thinkingLevel (dùng khi model không hỗ trợ)
  thinkingLevel: (process.env.GEMINI_THINKING_LEVEL ?? 'low').trim().toLowerCase(),
  // Cho phép đổi để kiểm thử với máy chủ giả; mặc định là API chính thức.
  apiBase: (process.env.GEMINI_API_BASE || 'https://generativelanguage.googleapis.com/v1beta').replace(/\/+$/, ''),
  allowedOrigins: (process.env.ALLOWED_ORIGINS || 'http://localhost:3000')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),
  rateLimitPerMinute: int(process.env.RATE_LIMIT_PER_MINUTE, 60),
};

/** Lấy API key tiếp theo theo cơ chế xoay tua Round-Robin cho mỗi request */
export function getNextApiKey() {
  if (config.apiKeys.length === 0) return '';
  const key = config.apiKeys[roundRobinIndex % config.apiKeys.length];
  roundRobinIndex = (roundRobinIndex + 1) % config.apiKeys.length;
  return key;
}

/** Lấy danh sách toàn bộ API keys */
export function getApiKeyPool() {
  return [...config.apiKeys];
}

/** Key được coi là đã cấu hình nếu danh sách apiKeys có ít nhất 1 key hợp lệ */
export const isKeyConfigured = () => config.apiKeys.length > 0;
