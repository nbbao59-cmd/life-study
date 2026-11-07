import dotenv from 'dotenv';

// Đọc biến môi trường từ file .env ở thư mục gốc (chỉ chạy trên server).
dotenv.config({ quiet: true });

const int = (v, d) => {
  const n = parseInt(v ?? '', 10);
  return Number.isFinite(n) && n > 0 ? n : d;
};

export const config = {
  host: (process.env.HOST || '127.0.0.1').trim(),
  port: int(process.env.PORT, 8787),
  apiKey: (process.env.GEMINI_API_KEY || '').trim(),
  model: (process.env.GEMINI_MODEL || 'gemini-3.8-flash').trim(),
  // "none" = không gửi tham số thinkingLevel (dùng khi model không hỗ trợ)
  thinkingLevel: (process.env.GEMINI_THINKING_LEVEL ?? 'low').trim().toLowerCase(),
  // Cho phép đổi để kiểm thử với máy chủ giả; mặc định là API chính thức.
  apiBase: (process.env.GEMINI_API_BASE || 'https://generativelanguage.googleapis.com/v1beta').replace(/\/+$/, ''),
  allowedOrigins: (process.env.ALLOWED_ORIGINS || 'http://localhost:3000')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),
  rateLimitPerMinute: int(process.env.RATE_LIMIT_PER_MINUTE, 20),
};

/** Key được coi là chưa cấu hình nếu rỗng hoặc còn là giá trị mẫu. */
export const isKeyConfigured = () => config.apiKey.length > 0 && !/^(your[_-]|changeme|xxx)/i.test(config.apiKey);
