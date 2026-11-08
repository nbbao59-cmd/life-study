import { AlertCircle, Plus, Trash2, X } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { saveDeck } from '../../services/flashcardStorage';
import { Deck, Flashcard } from '../../types';
import { uid } from '../../utils/helpers';

export interface DeckModalProps {
  isOpen: boolean;
  deck: Deck | null;
  onClose: () => void;
  onSaved: (deck: Deck) => void;
}

interface EditableCard {
  id: string;
  question: string;
  answer: string;
  status?: 'new' | 'learning' | 'mastered';
}

export default function DeckModal({ isOpen, deck, onClose, onSaved }: DeckModalProps) {
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [cards, setCards] = useState<EditableCard[]>([]);
  const [error, setError] = useState<string | null>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    if (deck) {
      setTitle(deck.title || '');
      setSummary(deck.summary || '');
      if (deck.cards && deck.cards.length > 0) {
        setCards(deck.cards.map((c) => ({ ...c })));
      } else {
        setCards([{ id: uid(), question: '', answer: '', status: 'new' }]);
      }
    } else {
      setTitle('');
      setSummary('');
      setCards([
        { id: uid(), question: '', answer: '', status: 'new' },
        { id: uid(), question: '', answer: '', status: 'new' },
      ]);
    }
    setError(null);

    const timer = window.setTimeout(() => {
      titleInputRef.current?.focus();
    }, 60);

    return () => window.clearTimeout(timer);
  }, [isOpen, deck]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleAddCard = () => {
    setCards((prev) => [...prev, { id: uid(), question: '', answer: '', status: 'new' }]);
  };

  const handleRemoveCard = (index: number) => {
    setCards((prev) => {
      if (prev.length <= 1) {
        return [{ id: uid(), question: '', answer: '', status: 'new' }];
      }
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleCardChange = (index: number, field: 'question' | 'answer', value: string) => {
    setCards((prev) =>
      prev.map((c, i) => (i === index ? { ...c, [field]: value } : c))
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setError('Vui lòng nhập tên bộ thẻ ôn tập.');
      titleInputRef.current?.focus();
      return;
    }

    // Lọc các thẻ có nội dung câu hỏi hoặc câu trả lời
    const validCards: Flashcard[] = cards
      .map((c) => ({
        id: c.id || uid(),
        question: c.question.trim(),
        answer: c.answer.trim(),
        status: c.status || 'new',
      }))
      .filter((c) => c.question.length > 0 || c.answer.length > 0);

    if (validCards.length === 0) {
      setError('Bộ thẻ cần ít nhất một thẻ ghi nhớ có câu hỏi hoặc câu trả lời.');
      return;
    }

    const savedDeck: Deck = {
      id: deck?.id || `deck-${uid()}`,
      title: trimmedTitle,
      summary: summary.trim() || undefined,
      sourceDocumentId: deck?.sourceDocumentId,
      sourceDocumentName: deck?.sourceDocumentName,
      createdAt: deck?.createdAt || new Date().toISOString(),
      cards: validCards,
      quizzes: deck?.quizzes || [],
    };

    saveDeck(savedDeck);
    onSaved(savedDeck);
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose} role="presentation">
      <div
        className="deck-modal card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="deck-modal-title"
      >
        <div className="deck-modal-header">
          <div>
            <h3 id="deck-modal-title">{deck ? 'Chỉnh sửa bộ thẻ' : 'Tạo bộ thẻ ôn tập mới'}</h3>
            <p className="muted">
              {deck?.sourceDocumentName
                ? `Nguồn: ${deck.sourceDocumentName}`
                : 'Tự biên soạn câu hỏi và đáp án ghi nhớ'}
            </p>
          </div>
          <button
            type="button"
            className="icon-btn"
            onClick={onClose}
            aria-label="Đóng cửa sổ"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="deck-modal-form">
          <div className="deck-modal-body">
            {error && (
              <div className="deck-modal-error" role="alert">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="deck-title-input">
                Tên bộ thẻ <span className="req">*</span>
              </label>
              <input
                id="deck-title-input"
                ref={titleInputRef}
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="VD: Thuật toán nâng cao, Từ vựng IELTS band 7.0, Lịch sử triết học..."
                maxLength={120}
              />
            </div>

            <div className="form-group">
              <label htmlFor="deck-summary-input">Mô tả / Tóm tắt ngắn</label>
              <textarea
                id="deck-summary-input"
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="Ghi chú tổng quan mục tiêu học, đề cương hoặc phạm vi bài kiểm tra..."
                rows={2}
                maxLength={300}
              />
            </div>

            <div className="deck-modal-cards-header">
              <div>
                <strong>Danh sách thẻ ghi nhớ ({cards.length})</strong>
                <p className="muted">Mỗi thẻ gồm một câu hỏi hoặc khái niệm ở mặt trước và đáp án ở mặt sau.</p>
              </div>
              <button
                type="button"
                className="btn sm ghost"
                onClick={handleAddCard}
              >
                <Plus size={14} /> Thêm thẻ
              </button>
            </div>

            <div className="deck-modal-card-list">
              {cards.map((card, index) => (
                <div key={card.id || index} className="deck-modal-card-item">
                  <div className="deck-modal-card-top">
                    <span className="deck-card-index">Thẻ #{index + 1}</span>
                    <button
                      type="button"
                      className="icon-btn danger sm"
                      onClick={() => handleRemoveCard(index)}
                      title="Xóa thẻ này"
                      aria-label={`Xóa thẻ số ${index + 1}`}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <div className="deck-modal-card-fields">
                    <div className="field-block">
                      <label>Mặt trước: Câu hỏi / Khái niệm</label>
                      <textarea
                        value={card.question}
                        onChange={(e) => handleCardChange(index, 'question', e.target.value)}
                        placeholder="Nhập câu hỏi hoặc từ vựng..."
                        rows={2}
                      />
                    </div>
                    <div className="field-block">
                      <label>Mặt sau: Câu trả lời / Giải nghĩa</label>
                      <textarea
                        value={card.answer}
                        onChange={(e) => handleCardChange(index, 'answer', e.target.value)}
                        placeholder="Nhập đáp án hoặc định nghĩa chi tiết..."
                        rows={2}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="deck-modal-footer">
            <button
              type="button"
              className="btn ghost"
              onClick={onClose}
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="btn primary"
            >
              {deck ? 'Lưu thay đổi' : 'Tạo bộ thẻ'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
