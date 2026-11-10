import { RefreshCw, Send, Sparkles } from 'lucide-react';
import { FormEvent, useCallback, useEffect, useRef, useState } from 'react';
import PageTitle from '../../components/ui/PageTitle';
import { welcomeMessages } from '../../data/sampleData';
import { askAssistant, AssistantError, BackendStatus, checkBackend } from '../../services/aiClient';
import { AiContext, ChatMessage } from '../../types';
import { uid } from '../../utils/helpers';

interface Props {
  messages: ChatMessage[];
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  context: AiContext;
}

const SUGGESTIONS = [
  'Hải trình hôm nay nên học gì?',
  'Phân tích nhịp học và năng lượng của mình',
  'Giải phương trình 2x^2 - 8 = 0',
  'Tính 15% * 240 + sqrt(144)',
];

function StatusBanner({ status, onRetry }: { status: BackendStatus; onRetry: () => void }) {
  const retry = (
    <button className="btn sm ghost ocean-btn-ghost" onClick={onRetry} style={{ marginLeft: 'auto' }}>
      <RefreshCw size={14} /> Kiểm tra lại
    </button>
  );
  if (status === 'ready')
    return (
      <div className="banner success ocean-banner-ready" role="status" aria-live="polite">
        <span>
          <span className="status-dot" /> Tín hiệu Hải Đăng AI kết nối thông suốt với Gemini API.
        </span>
      </div>
    );
  if (status === 'checking')
    return (
      <div className="banner info ocean-banner-info" role="status" aria-live="polite">
        Đang quét tần số kết nối tới hải đăng AI…
      </div>
    );
  if (status === 'no-key') {
    return (
      <div className="banner warn" role="alert">
        <span>
          🔑 Backend đang chạy nhưng <strong>chưa có GEMINI_API_KEY</strong>. Hãy kiểm tra file <code>.env</code> và khởi động lại.
        </span>
        {retry}
      </div>
    );
  }
  if (status === 'error') {
    return (
      <div className="banner err" role="alert">
        <span>Gemini gặp trục trặc khi kết nối. Hãy kiểm tra key hoặc hạn mức rồi thử lại.</span>
        {retry}
      </div>
    );
  }
  return (
    <div className="banner err" role="alert">
      <span>
        ⚠️ Không kết nối được backend AI. Chạy <code>npm run server</code> rồi bấm kiểm tra lại.
      </span>
      {retry}
    </div>
  );
}

export default function AssistantChat({ messages, setMessages, context }: Props) {
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<BackendStatus>('checking');
  const endRef = useRef<HTMLDivElement>(null);

  const recheck = useCallback(() => {
    setStatus('checking');
    void checkBackend().then(setStatus);
  }, []);

  useEffect(() => {
    recheck();
  }, [recheck]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, busy]);

  const send = async (text: string) => {
    const msg = text.trim();
    if (!msg || busy) return;
    const previous = messages;
    setMessages((p) => [...p, { id: uid(), role: 'user', text: msg }]);
    setInput('');
    setBusy(true);
    try {
      const reply = await askAssistant(msg, context, previous);
      setMessages((p) => [...p, { id: uid(), role: 'assistant', text: reply }]);
      setStatus('ready');
    } catch (err) {
      const e = err instanceof AssistantError ? err : new AssistantError('ERROR', 'Đã xảy ra lỗi không xác định.');
      if (e.code === 'NOT_CONFIGURED') setStatus('no-key');
      else if (e.code === 'OFFLINE') setStatus('offline');
      else setStatus('error');
      const local = e.localMath ? `\n\n🧮 Kết quả tính trên máy (không qua AI): ${e.localMath}` : '';
      setMessages((p) => [...p, { id: uid(), role: 'assistant', error: true, text: `⚠️ ${e.message}${local}` }]);
    } finally {
      setBusy(false);
    }
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    void send(input);
  };

  return (
    <div className="stack ocean-chat-page">
      <PageTitle
        icon={<Sparkles size={22} />}
        title="Ngọn Hải Đăng AI & Tàu Ngầm Trí Tuệ"
        subtitle="Gemini định vị hải trình, giải toán biển sâu, tư vấn lịch học theo năng lượng & tâm trạng"
      />
      <StatusBanner status={status} onRetry={recheck} />
      <div className="card chat ocean-chat-card">
        <div className="chat-log ocean-chat-log" aria-live="polite">
          {messages.map((m) => (
            <div key={m.id} className={`bubble ${m.role}${m.error ? ' error' : ''}`}>
              {m.text}
            </div>
          ))}
          {busy && (
            <div className="bubble assistant ocean-typing-bubble">
              <span className="typing">
                <i />
                <i />
                <i />
              </span>
            </div>
          )}
          <div ref={endRef} />
        </div>
        <div className="chat-foot ocean-chat-foot">
          <div className="chips">
            {SUGGESTIONS.map((s) => (
              <button key={s} className="chip ocean-chip" onClick={() => void send(s)} disabled={busy}>
                {s}
              </button>
            ))}
            <button className="chip ocean-chip" onClick={() => setMessages(welcomeMessages)}>
              Xóa hội thoại
            </button>
          </div>
          <form className="row" onSubmit={onSubmit}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder='Hỏi hoa tiêu AI bất cứ điều gì: "Giải bài toán sóng cơ...", "Lên lịch ôn thi..."'
              aria-label="Nhập tin nhắn"
            />
            <button className="btn ocean-btn" type="submit" disabled={busy || !input.trim()}>
              <Send size={16} /> Gửi
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
