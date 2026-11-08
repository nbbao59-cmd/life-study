import { Check, Copy, Eraser, FileText, ListTodo, Plus, Trash2 } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import type { QuickChecklistItem, QuickNotesState } from '../../types';

const STORAGE_KEY = 'life-study-scratchpad';

const DEFAULT_STATE: QuickNotesState = {
  checklist: [
    { id: '1', text: 'Ôn lại ghi chú 15 phút', done: false },
    { id: '2', text: 'Uống đủ nước trong ca học', done: true },
  ],
  freeText: '',
};

function loadInitialState(): QuickNotesState {
  if (typeof window === 'undefined') return DEFAULT_STATE;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw);
    return {
      checklist: Array.isArray(parsed?.checklist) ? parsed.checklist : DEFAULT_STATE.checklist,
      freeText: typeof parsed?.freeText === 'string' ? parsed.freeText : '',
    };
  } catch (e) {
    console.error('Failed to parse quick notes from localStorage', e);
    return DEFAULT_STATE;
  }
}

interface QuickNotesCardProps {
  className?: string;
}

export default function QuickNotesCard({ className = '' }: QuickNotesCardProps) {
  const [state, setState] = useState<QuickNotesState>(loadInitialState);
  const [activeTab, setActiveTab] = useState<'checklist' | 'scratchpad'>('checklist');
  const [inputText, setInputText] = useState('');
  const [copied, setCopied] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Synchronize state with localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error('Failed to save quick notes to localStorage', e);
    }
  }, [state]);

  // Auto-grow textarea
  useEffect(() => {
    if (activeTab === 'scratchpad' && textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.max(160, textareaRef.current.scrollHeight)}px`;
    }
  }, [state.freeText, activeTab]);

  const handleAddChecklist = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = inputText.trim();
    if (!trimmed) return;

    const newItem: QuickChecklistItem = {
      id: `qn-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      text: trimmed,
      done: false,
    };

    setState((prev) => ({
      ...prev,
      checklist: [newItem, ...prev.checklist],
    }));
    setInputText('');
  };

  const handleToggleDone = (id: string) => {
    setState((prev) => ({
      ...prev,
      checklist: prev.checklist.map((item) =>
        item.id === id ? { ...item, done: !item.done } : item
      ),
    }));
  };

  const handleDeleteItem = (id: string) => {
    setState((prev) => ({
      ...prev,
      checklist: prev.checklist.filter((item) => item.id !== id),
    }));
  };

  const handleClearCompleted = () => {
    setState((prev) => ({
      ...prev,
      checklist: prev.checklist.filter((item) => !item.done),
    }));
  };

  const handleCopyScratchpad = async () => {
    if (!state.freeText) return;
    try {
      await navigator.clipboard.writeText(state.freeText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error('Failed to copy text', e);
    }
  };

  const handleClearScratchpad = () => {
    if (!state.freeText) return;
    setState((prev) => ({
      ...prev,
      freeText: '',
    }));
  };

  const completedCount = state.checklist.filter((i) => i.done).length;
  const totalCount = state.checklist.length;
  const wordCount = state.freeText.trim() ? state.freeText.trim().split(/\s+/).length : 0;
  const charCount = state.freeText.length;

  return (
    <div className={`card quick-notes-card ${className}`}>
      {/* Header & Tabs */}
      <div className="quick-notes-header">
        <div className="quick-notes-title-wrap">
          <span className="quick-notes-icon">📝</span>
          <h3 className="quick-notes-title">Sổ tay nhanh</h3>
        </div>

        <div className="quick-notes-tabs" role="tablist" aria-label="Các tab sổ tay nhanh">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'checklist'}
            className={`quick-notes-tab ${activeTab === 'checklist' ? 'active' : ''}`}
            onClick={() => setActiveTab('checklist')}
          >
            <ListTodo size={15} />
            <span>Việc cần làm</span>
            {totalCount > 0 && (
              <span className="quick-notes-badge" title={`${completedCount}/${totalCount} việc đã xong`}>
                {completedCount}/{totalCount}
              </span>
            )}
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'scratchpad'}
            className={`quick-notes-tab ${activeTab === 'scratchpad' ? 'active' : ''}`}
            onClick={() => setActiveTab('scratchpad')}
          >
            <FileText size={15} />
            <span>Ghi chú nháp</span>
            {charCount > 0 && (
              <span className="quick-notes-dot" title="Có nội dung nháp" />
            )}
          </button>
        </div>
      </div>

      {/* Tab: Checklist */}
      {activeTab === 'checklist' && (
        <div className="quick-notes-body" role="tabpanel">
          <form className="quick-checklist-input-row" onSubmit={handleAddChecklist}>
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Thêm việc nhanh cần làm... (nhấn Enter)"
              className="quick-checklist-input"
            />
            <button
              type="submit"
              className="btn sm quick-checklist-add-btn"
              disabled={!inputText.trim()}
              title="Thêm mục việc mới"
            >
              <Plus size={16} />
              <span>Thêm</span>
            </button>
          </form>

          {totalCount === 0 ? (
            <div className="empty quick-notes-empty">
              <span>Chưa có việc cần làm. Hãy nhập việc nhanh ở trên!</span>
            </div>
          ) : (
            <div className="quick-checklist-list">
              {state.checklist.map((item) => (
                <div
                  key={item.id}
                  className={`quick-checklist-item ${item.done ? 'done' : ''}`}
                >
                  <button
                    type="button"
                    className={`check quick-check-btn ${item.done ? 'on' : ''}`}
                    onClick={() => handleToggleDone(item.id)}
                    aria-label={item.done ? 'Đánh dấu chưa xong' : 'Đánh dấu đã xong'}
                  >
                    {item.done && <Check size={14} strokeWidth={3} />}
                  </button>
                  <span
                    className="quick-checklist-text"
                    onClick={() => handleToggleDone(item.id)}
                  >
                    {item.text}
                  </span>
                  <button
                    type="button"
                    className="icon-btn danger quick-checklist-del-btn"
                    onClick={() => handleDeleteItem(item.id)}
                    title="Xóa mục này"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {completedCount > 0 && (
            <div className="quick-checklist-footer">
              <span className="muted quick-checklist-stats">
                Đã hoàn thành {completedCount}/{totalCount} mục
              </span>
              <button
                type="button"
                className="btn ghost sm quick-clear-completed-btn"
                onClick={handleClearCompleted}
              >
                <Trash2 size={13} />
                <span>Xóa mục đã xong</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Tab: Scratchpad */}
      {activeTab === 'scratchpad' && (
        <div className="quick-notes-body" role="tabpanel">
          <div className="quick-scratchpad-wrap">
            <textarea
              ref={textareaRef}
              value={state.freeText}
              onChange={(e) => setState((prev) => ({ ...prev, freeText: e.target.value }))}
              placeholder="Viết nhanh suy nghĩ, ý tưởng hoặc công thức vừa nhớ ra khi học..."
              className="quick-scratchpad-textarea"
            />
          </div>

          <div className="quick-scratchpad-footer">
            <div className="quick-scratchpad-counts muted">
              <span>{wordCount} từ</span>
              <span className="count-dot">·</span>
              <span>{charCount} ký tự</span>
            </div>

            <div className="quick-scratchpad-actions">
              <button
                type="button"
                className={`btn ghost sm quick-copy-btn ${copied ? 'copied' : ''}`}
                onClick={handleCopyScratchpad}
                disabled={!state.freeText}
                title="Sao chép vào khay nhớ tạm"
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                <span>{copied ? 'Đã chép!' : 'Sao chép'}</span>
              </button>

              <button
                type="button"
                className="btn ghost sm quick-clear-btn"
                onClick={handleClearScratchpad}
                disabled={!state.freeText}
                title="Xóa nội dung nháp"
              >
                <Eraser size={14} />
                <span>Xóa nháp</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export { QuickNotesCard };
