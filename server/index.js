import http from 'node:http';
import { config, isKeyConfigured } from './config.js';
import { ApiError } from './errors.js';
import { askGemini, askGeminiWithParts, generateStructuredCards } from './gemini.js';
import { buildContents, buildDocumentContents, buildDocumentSystemInstruction, buildSystemInstruction } from './prompt.js';
import { createRateLimiter, isOriginAllowed, readJson, sendJson } from './utils.js';
import { parseChatRequest, parseDocumentChatRequest, parseGenerateCardsRequest } from './validate.js';

const limited = createRateLimiter(config.rateLimitPerMinute);

const server = http.createServer(async (req, res) => {
  let cors = {};
  try {
    const url = new URL(req.url ?? '/', 'http://localhost');
    const origin = req.headers.origin;

    if (!url.pathname.startsWith('/api/')) throw new ApiError(404, 'NOT_FOUND', 'Không tìm thấy.');
    if (!isOriginAllowed(origin, config.allowedOrigins)) {
      throw new ApiError(403, 'FORBIDDEN_ORIGIN', 'Nguồn truy cập không được phép. Thêm origin vào ALLOWED_ORIGINS trong .env.');
    }
    if (origin) {
      cors = {
        'Access-Control-Allow-Origin': origin,
        Vary: 'Origin',
        'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      };
    }
    if (req.method === 'OPTIONS') {
      res.writeHead(204, cors);
      return res.end();
    }

    if (req.method === 'GET' && url.pathname === '/api/health') {
      return sendJson(res, 200, { ok: true, geminiConfigured: isKeyConfigured(), model: config.model }, cors);
    }

    if (req.method === 'POST' && url.pathname === '/api/chat') {
      if (!isKeyConfigured()) {
        throw new ApiError(503, 'NOT_CONFIGURED', 'Backend chưa có GEMINI_API_KEY. Hãy tạo file .env từ .env.example, điền GEMINI_API_KEY rồi khởi động lại backend.');
      }
      const wait = limited(req.socket.remoteAddress ?? 'unknown');
      if (wait) {
        res.setHeader('Retry-After', String(wait));
        throw new ApiError(429, 'RATE_LIMITED', `Bạn gửi quá nhanh. Vui lòng thử lại sau ${wait} giây.`);
      }

      const { message, history, context, verifiedMath } = parseChatRequest(await readJson(req));
      const reply = await askGemini({
        system: buildSystemInstruction(context, verifiedMath),
        contents: buildContents(history, message),
      });
      return sendJson(res, 200, { reply }, cors);
    }

    if (req.method === 'POST' && url.pathname === '/api/document-chat') {
      if (!isKeyConfigured()) {
        throw new ApiError(503, 'NOT_CONFIGURED', 'Backend chưa có GEMINI_API_KEY. Hãy tạo file .env từ .env.example, điền GEMINI_API_KEY rồi khởi động lại backend.');
      }
      const wait = limited(req.socket.remoteAddress ?? 'unknown');
      if (wait) {
        res.setHeader('Retry-After', String(wait));
        throw new ApiError(429, 'RATE_LIMITED', `Bạn gửi quá nhanh. Vui lòng thử lại sau ${wait} giây.`);
      }

      const body = await readJson(req, 25_000_000);
      const { message, history, file } = parseDocumentChatRequest(body);
      const reply = await askGeminiWithParts({
        system: buildDocumentSystemInstruction(file),
        contents: buildDocumentContents({ history, message, file }),
      });
      return sendJson(res, 200, { reply }, cors);
    }

    if (req.method === 'POST' && url.pathname === '/api/generate-cards') {
      if (!isKeyConfigured()) {
        throw new ApiError(503, 'NOT_CONFIGURED', 'Backend chưa có GEMINI_API_KEY. Hãy tạo file .env từ .env.example, điền GEMINI_API_KEY rồi khởi động lại backend.');
      }
      const wait = limited(req.socket.remoteAddress ?? 'unknown');
      if (wait) {
        res.setHeader('Retry-After', String(wait));
        throw new ApiError(429, 'RATE_LIMITED', `Bạn gửi quá nhanh. Vui lòng thử lại sau ${wait} giây.`);
      }

      const body = await readJson(req, 25_000_000);
      const { file, count } = parseGenerateCardsRequest(body);
      const result = await generateStructuredCards({ file, count });
      return sendJson(res, 200, { ok: true, data: result }, cors);
    }

    throw new ApiError(404, 'NOT_FOUND', 'Không tìm thấy.');
  } catch (err) {
    if (err instanceof ApiError) {
      return sendJson(res, err.status, { error: { code: err.code, message: err.message } }, cors);
    }
    console.error('[server] lỗi không mong đợi:', err);
    return sendJson(res, 500, { error: { code: 'INTERNAL', message: 'Lỗi nội bộ của backend.' } }, cors);
  }
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') console.error(`✖ Cổng ${config.port} đang được dùng. Đổi PORT trong .env hoặc tắt tiến trình cũ.`);
  else console.error('✖ Không khởi động được backend:', err.message);
  process.exit(1);
});

server.listen(config.port, config.host, () => {
  console.log(`✔ Backend AI chạy tại http://${config.host}:${config.port}  (model: ${config.model})`);
  if (!isKeyConfigured()) {
    console.warn('⚠ Chưa cấu hình GEMINI_API_KEY: trợ lý AI sẽ báo lỗi cho tới khi bạn điền key vào file .env và khởi động lại.');
  }
});
