import {
  AlertCircle,
  CheckCircle2,
  File as FileIcon,
  FileSpreadsheet,
  FileText,
  Image as ImageIcon,
  Loader2,
  Presentation,
  Send,
  Sparkles,
  X,
} from 'lucide-react';
import React, { FormEvent, useEffect, useRef, useState } from 'react';
import {
  AiDocumentError,
  askDocumentChat,
  createDeckFromGenerationResult,
  generateCardsFromDocument,
} from '../../services/aiDocumentClient';
import { prepareFileForAi, PreparedAiFile } from '../../services/documentParser';
import { readDocument } from '../../services/documentStorage';
import { saveDeck } from '../../services/flashcardStorage';
import { ChatMessage, Deck, DocumentCategory, DocumentItem } from '../../types';
import { uid } from '../../utils/helpers';

export interface DocumentAiDrawerProps {
  item: DocumentItem | null;
  onClose: () => void;
  onDeckCreated?: (deck: Deck) => void;
}

const SUGGESTION_PROMPTS = [
  { label: '💡 Tóm tắt tài liệu', prompt: 'Hãy tóm tắt ngắn gọn các ý chính và nội dung trọng tâm của tài liệu này.' },
  { label: '🔑 Thuật ngữ quan trọng', prompt: 'Liệt kê các khái niệm, thuật ngữ và định nghĩa quan trọng nhất trong tài liệu kèm giải thích dễ hiểu.' },
  { label: '❓ 3 câu hỏi ôn tập', prompt: 'Đặt 3 câu hỏi ôn tập sâu về nội dung tài liệu này kèm gợi ý câu trả lời để mình tự kiểm tra kiến thức.' },
  { label: '📝 Đặt câu hỏi trắc nghiệm', prompt: 'Tạo 3 câu hỏi trắc nghiệm có 4 đáp án A/B/C/D kèm giải thích chi tiết dựa trên tài liệu này.' },
];

function extension(name: string): string {
  return name.split('.').pop()?.toLowerCase() ?? '';
}

function categoryFor(name: string): DocumentCategory {
  const ext = extension(name);
  if (ext === 'pdf') return 'pdf';
  if (['doc', 'docx', 'rtf'].includes(ext)) return 'word';
  if (['xls', 'xlsx', 'csv'].includes(ext)) return 'sheet';
  if (['ppt', 'pptx'].includes(ext)) return 'slide';
  if (['png', 'jpg', 'jpeg', 'webp'].includes(ext)) return 'image';
  if (['txt', 'md'].includes(ext)) return 'text';
  return 'other';
}

function fileIcon(category: DocumentCategory) {
  if (category === 'sheet') return <FileSpreadsheet size={18} />;
  if (category === 'slide') return <Presentation size={18} />;
  if (category === 'image') return <ImageIcon size={18} />;
  if (category === 'other') return <FileIcon size={18} />;
  return <FileText size={18} />;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function DocumentAiDrawer({ item, onClose, onDeckCreated }: DocumentAiDrawerProps) {
  const [preparedFile, setPreparedFile] = useState<PreparedAiFile | null>(null);
  const [fileLoading, setFileLoading] = useState(true);
  const [fileError, setFileError] = useState<string | null>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [chatBusy, setChatBusy] = useState(false);
  const [generatingCards, setGeneratingCards] = useState(false);
  const [generationNotice, setGenerationNotice] = useState<{ kind: 'success' | 'error'; text: string } | null>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Khởi tạo và đọc tài liệu khi item thay đổi
  useEffect(() => {
    if (!item) {
      setPreparedFile(null);
      setFileLoading(false);
      setFileError(null);
      setMessages([]);
      return;
    }

    let active = true;
    setFileLoading(true);
    setFileError(null);
    setPreparedFile(null);
    setGenerationNotice(null);

    // Tin nhắn chào mừng mặc định
    setMessages([
      {
        id: uid(),
        role: 'assistant',
        text: `Xin chào! Tôi là trợ lý AI học tập. Tôi đã sẵn sàng phân tích và hỗ trợ bạn học tập với tài liệu "${item.name}".\n\nBạn có thể nhấn các gợi ý bên dưới hoặc đặt câu hỏi tự do. Bấm nút "✨ Tạo Flashcards & Quiz" ở góc trên để tự động tạo bộ thẻ ôn tập!`,
      },
    ]);

    void readDocument(item.id)
      .then(async (blob) => {
        if (!active) return;
        if (!blob) {
          throw new Error('Không tìm thấy dữ liệu tệp trong IndexedDB. Hãy thử tải lại trang.');
        }
        const prepared = await prepareFileForAi(blob, item.name);
        if (!active) return;
        setPreparedFile(prepared);
      })
      .catch((err: any) => {
        if (!active) return;
        setFileError(err?.message || 'Không thể đọc nội dung tệp tài liệu này.');
      })
      .finally(() => {
        if (active) setFileLoading(false);
      });

    return () => {
      active = false;
    };
  }, [item]);

  // Cuộn xuống tin nhắn mới nhất
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, chatBusy, generatingCards]);

  // Đóng Drawer bằng phím Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!item) return null;

  const category = categoryFor(item.name);

  // Gửi câu hỏi đến AI
  const handleSend = async (textToSend: string) => {
    const question = textToSend.trim();
    if (!question || chatBusy || !preparedFile) return;

    const userMessage: ChatMessage = { id: uid(), role: 'user', text: question };
    const historySnapshot = messages;

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setChatBusy(true);

    try {
      const reply = await askDocumentChat({
        message: question,
        history: historySnapshot.map((m) => ({ role: m.role, text: m.text })),
        file: preparedFile,
      });

      setMessages((prev) => [...prev, { id: uid(), role: 'assistant', text: reply }]);
    } catch (err: any) {
      const errorMessage =
        err instanceof AiDocumentError
          ? err.message
          : err?.message || 'Có lỗi xảy ra khi trao đổi với AI. Vui lòng thử lại sau.';

      setMessages((prev) => [
        ...prev,
        {
          id: uid(),
          role: 'assistant',
          error: true,
          text: `⚠️ ${errorMessage}`,
        },
      ]);
    } finally {
      setChatBusy(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    void handleSend(input);
  };

  // Tạo Flashcards & Quiz từ tài liệu
  const handleGenerateCards = async () => {
    if (!preparedFile || generatingCards) return;

    setGeneratingCards(true);
    setGenerationNotice(null);

    try {
      const result = await generateCardsFromDocument({
        file: preparedFile,
        count: 10,
      });

      const deck = createDeckFromGenerationResult(result, {
        id: item.id,
        name: item.name,
      });

      saveDeck(deck);

      setGenerationNotice({
        kind: 'success',
        text: `Đã tạo thành công bộ thẻ "${deck.title}" gồm ${deck.cards.length} Flashcard và ${deck.quizzes.length} câu trắc nghiệm!`,
      });

      setMessages((prev) => [
        ...prev,
        {
          id: uid(),
          role: 'assistant',
          text: `🎉 **Đã tạo thành công bộ thẻ ôn tập!**\n\n- **Tiêu đề:** ${deck.title}\n- **Số thẻ Flashcards:** ${deck.cards.length}\n- **Số câu trắc nghiệm:** ${deck.quizzes.length}\n${deck.summary ? `\n> *${deck.summary}*` : ''}\n\nBộ thẻ đã được lưu vào hệ thống. Bạn có thể sang mục **Ôn tập** để bắt đầu học ngay!`,
        },
      ]);

      if (onDeckCreated) {
        onDeckCreated(deck);
      }
    } catch (err: any) {
      const msg =
        err instanceof AiDocumentError
          ? err.message
          : err?.message || 'Không thể tạo bộ thẻ từ tài liệu này. Vui lòng thử lại.';

      setGenerationNotice({
        kind: 'error',
        text: msg,
      });

      setMessages((prev) => [
        ...prev,
        {
          id: uid(),
          role: 'assistant',
          error: true,
          text: `⚠️ **Không thể tạo bộ thẻ:** ${msg}`,
        },
      ]);
    } finally {
      setGeneratingCards(false);
    }
  };

  return (
    <div className="drawer-backdrop" onClick={onClose} aria-modal="true" role="dialog">
      <aside
        className="document-ai-drawer"
        onClick={(e) => e.stopPropagation()}
        aria-label={`Hỏi đáp AI: ${item.name}`}
      >
        {/* Drawer Header */}
        <header className="drawer-header">
          <div className="drawer-doc-meta">
            <div className={`drawer-file-icon ${category}`}>{fileIcon(category)}</div>
            <div className="drawer-doc-info">
              <div className="drawer-title-row">
                <h3 title={item.name}>{item.name}</h3>
                <span className="ai-badge">
                  <Sparkles size={11} /> Gemini AI
                </span>
              </div>
              <span className="drawer-doc-sub">
                {formatBytes(item.size)} • {category.toUpperCase()}
              </span>
            </div>
          </div>

          <div className="drawer-actions-top">
            <button
              className="btn sm drawer-generate-btn"
              onClick={() => void handleGenerateCards()}
              disabled={generatingCards || fileLoading || !preparedFile}
              title="Phân tích nội dung và sinh bộ Flashcards + Quiz ôn tập"
            >
              {generatingCards ? (
                <>
                  <Loader2 size={14} className="spin" />
                  <span>Đang tạo thẻ...</span>
                </>
              ) : (
                <>
                  <Sparkles size={14} />
                  <span>Tạo Flashcards & Quiz</span>
                </>
              )}
            </button>

            <button
              className="icon-btn drawer-close-btn"
              onClick={onClose}
              aria-label="Đóng cửa sổ hỏi đáp"
              title="Đóng (Esc)"
            >
              <X size={18} />
            </button>
          </div>
        </header>

        {/* Thông báo nếu có lỗi đọc file */}
        {fileError && (
          <div className="drawer-banner error">
            <AlertCircle size={16} />
            <span>{fileError}</span>
          </div>
        )}

        {/* Thông báo trạng thái tạo thẻ */}
        {generationNotice && (
          <div className={`drawer-banner ${generationNotice.kind}`}>
            {generationNotice.kind === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            <span>{generationNotice.text}</span>
          </div>
        )}

        {/* Khung nội dung hội thoại */}
        <div className="drawer-chat-body" aria-live="polite">
          {fileLoading && (
            <div className="drawer-loading-file">
              <Loader2 size={24} className="spin" />
              <span>Đang đọc và chuẩn bị tài liệu...</span>
            </div>
          )}

          {messages.map((m) => (
            <div key={m.id} className={`bubble ${m.role}${m.error ? ' error' : ''}`}>
              {m.text}
            </div>
          ))}

          {chatBusy && (
            <div className="bubble assistant">
              <span className="typing" aria-label="AI đang suy nghĩ...">
                <i />
                <i />
                <i />
              </span>
            </div>
          )}

          {generatingCards && (
            <div className="bubble assistant generating-bubble">
              <div className="generating-indicator">
                <Loader2 size={16} className="spin" />
                <span>AI đang phân tích tài liệu và cấu trúc flashcards & quiz...</span>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Gợi ý & Form nhập câu hỏi */}
        <footer className="drawer-footer">
          <div className="chips drawer-chips" role="group" aria-label="Gợi ý câu hỏi nhanh">
            {SUGGESTION_PROMPTS.map((s, idx) => (
              <button
                key={idx}
                type="button"
                className="chip drawer-chip"
                onClick={() => void handleSend(s.prompt)}
                disabled={chatBusy || generatingCards || fileLoading || !preparedFile}
              >
                {s.label}
              </button>
            ))}
          </div>

          <form className="drawer-input-form" onSubmit={onSubmit}>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={fileLoading ? 'Đang chuẩn bị dữ liệu...' : 'Hỏi bất kỳ điều gì về tài liệu này...'}
              aria-label="Nhập câu hỏi về tài liệu"
              disabled={fileLoading || chatBusy || generatingCards || !preparedFile}
            />
            <button
              className="btn drawer-send-btn"
              type="submit"
              disabled={!input.trim() || chatBusy || generatingCards || fileLoading || !preparedFile}
              aria-label="Gửi câu hỏi"
              title="Gửi"
            >
              <Send size={15} />
            </button>
          </form>
        </footer>
      </aside>
    </div>
  );
}
