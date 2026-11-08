import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  GraduationCap,
  HelpCircle,
  Layers,
  RotateCw,
  Sparkles,
  Trophy,
  XCircle,
} from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';
import { Deck, Flashcard } from '../../types';

export interface FlashcardStudyViewProps {
  deck: Deck;
  onBack: () => void;
  onCardStatusChange?: (cardId: string, status: 'new' | 'learning' | 'mastered') => void;
}

export default function FlashcardStudyView({
  deck,
  onBack,
  onCardStatusChange,
}: FlashcardStudyViewProps) {
  const [queue, setQueue] = useState<Flashcard[]>(() => [...(deck.cards || [])]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [masteredCount, setMasteredCount] = useState(0);
  const [learningCount, setLearningCount] = useState(0);
  const [reviewedCount, setReviewedCount] = useState(0);

  // Cập nhật queue khi deck thay đổi
  useEffect(() => {
    setQueue([...(deck.cards || [])]);
    setCurrentIndex(0);
    setIsFlipped(false);
    setMasteredCount(0);
    setLearningCount(0);
    setReviewedCount(0);
  }, [deck]);

  const totalOriginalCards = deck.cards?.length || 0;
  const isFinished = totalOriginalCards > 0 && currentIndex >= queue.length;
  const currentCard = !isFinished && queue.length > 0 ? queue[currentIndex] : null;

  // Lật thẻ
  const handleFlip = useCallback(() => {
    if (!currentCard) return;
    setIsFlipped((prev) => !prev);
  }, [currentCard]);

  // Xếp loại học tập
  const handleClassify = useCallback(
    (rating: 'again' | 'hard' | 'good') => {
      if (!currentCard) return;

      setIsFlipped(false);

      if (rating === 'again') {
        // Chưa thuộc: Đánh dấu learning, đẩy thẻ xuống cuối queue để ôn lại trong phiên
        onCardStatusChange?.(currentCard.id, 'learning');
        setLearningCount((c) => c + 1);
        setReviewedCount((c) => c + 1);
        setQueue((prev) => [...prev, currentCard]);
        setCurrentIndex((i) => i + 1);
      } else if (rating === 'hard') {
        // Hơi nhớ: Giữ nguyên / cập nhật learning, chuyển thẻ kế tiếp
        onCardStatusChange?.(currentCard.id, 'learning');
        setReviewedCount((c) => c + 1);
        setCurrentIndex((i) => i + 1);
      } else if (rating === 'good') {
        // Đã thuộc: Đánh dấu mastered và cập nhật storage, chuyển thẻ kế tiếp
        onCardStatusChange?.(currentCard.id, 'mastered');
        setMasteredCount((c) => c + 1);
        setReviewedCount((c) => c + 1);
        setCurrentIndex((i) => i + 1);
      }
    },
    [currentCard, onCardStatusChange]
  );

  // Phím tắt bàn phím: Space để lật, 1: Chưa thuộc, 2: Hơi nhớ, 3: Đã thuộc
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Bỏ qua nếu người dùng đang nhập input/textarea
      const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea') return;

      if (e.code === 'Space') {
        e.preventDefault();
        handleFlip();
      } else if (e.key === '1' || e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        handleClassify('again');
      } else if (e.key === '2' || e.key === 'y' || e.key === 'Y') {
        e.preventDefault();
        handleClassify('hard');
      } else if (e.key === '3' || e.key === 'g' || e.key === 'G') {
        e.preventDefault();
        handleClassify('good');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleFlip, handleClassify]);

  // Khởi động lại phiên ôn tập
  const handleRestart = () => {
    setQueue([...(deck.cards || [])]);
    setCurrentIndex(0);
    setIsFlipped(false);
    setMasteredCount(0);
    setLearningCount(0);
    setReviewedCount(0);
  };

  // Trường hợp bộ thẻ trống
  if (totalOriginalCards === 0) {
    return (
      <div className="stack flashcard-study-container">
        <div className="study-topbar">
          <button className="btn ghost sm" onClick={onBack}>
            <ArrowLeft size={16} /> Quay lại danh sách
          </button>
        </div>

        <section className="card study-empty-card">
          <div className="study-empty-icon">
            <Layers size={36} />
          </div>
          <h3>Bộ thẻ này chưa có flashcard nào</h3>
          <p className="muted">
            Vui lòng chỉnh sửa bộ thẻ để thêm nội dung câu hỏi hoặc tải tài liệu PDF để AI tự động trích xuất flashcard.
          </p>
          <div className="study-empty-actions">
            <button className="btn primary" onClick={onBack}>
              Quay lại danh sách bộ thẻ
            </button>
          </div>
        </section>
      </div>
    );
  }

  // Trường hợp đã hoàn thành tất cả các thẻ trong hàng đợi
  if (isFinished) {
    const masteryPercent =
      totalOriginalCards > 0 ? Math.round((masteredCount / totalOriginalCards) * 100) : 100;

    return (
      <div className="stack flashcard-study-container">
        <div className="study-topbar">
          <button className="btn ghost sm" onClick={onBack}>
            <ArrowLeft size={16} /> Quay lại danh sách
          </button>
          <div className="study-topbar-title">
            <GraduationCap size={16} />
            <span>{deck.title}</span>
          </div>
        </div>

        <section className="card study-completion-card">
          <div className="study-completion-trophy">
            <Trophy size={48} />
          </div>
          <div className="study-completion-badge">
            <Sparkles size={16} /> Hoàn thành xuất sắc!
          </div>
          <h2>Bạn đã ôn tập xong toàn bộ thẻ!</h2>
          <p className="muted">
            Tuyệt vời! Bạn vừa hoàn thành một phiên Active Recall cho bộ thẻ{' '}
            <strong>"{deck.title}"</strong>.
          </p>

          <div className="study-completion-stats">
            <div className="completion-stat-card mastered">
              <CheckCircle2 size={24} />
              <span className="stat-number">{masteredCount}</span>
              <span className="stat-label">Đã thuộc lòng</span>
            </div>
            <div className="completion-stat-card learning">
              <AlertCircle size={24} />
              <span className="stat-number">{learningCount}</span>
              <span className="stat-label">Cần ôn thêm</span>
            </div>
            <div className="completion-stat-card total">
              <RotateCw size={24} />
              <span className="stat-number">{reviewedCount}</span>
              <span className="stat-label">Lượt lật thẻ</span>
            </div>
          </div>

          <div className="study-completion-bar-wrap">
            <div className="study-completion-bar-info">
              <span>Độ thuần thục phiên này</span>
              <strong>{masteryPercent}%</strong>
            </div>
            <div className="study-progress-track">
              <div
                className="study-progress-fill"
                style={{ width: `${Math.min(100, masteryPercent)}%` }}
              />
            </div>
          </div>

          <div className="study-completion-actions">
            <button className="btn ghost" onClick={handleRestart}>
              <RotateCw size={16} /> Ôn lại từ đầu
            </button>
            <button className="btn primary" onClick={onBack}>
              Quay về danh sách bộ thẻ <ChevronRight size={16} />
            </button>
          </div>
        </section>
      </div>
    );
  }

  const progressPercent = Math.round((currentIndex / queue.length) * 100);
  const remainingInQueue = queue.length - currentIndex;

  return (
    <div className="stack flashcard-study-container">
      {/* Topbar điều khiển và thông tin tiến độ */}
      <div className="study-topbar">
        <button className="btn ghost sm" onClick={onBack} title="Quay lại danh sách bộ thẻ">
          <ArrowLeft size={16} /> Quay lại
        </button>

        <div className="study-topbar-center">
          <h3 className="study-deck-title" title={deck.title}>
            {deck.title}
          </h3>
          <div className="study-counter-badge">
            Thẻ {currentIndex + 1} / {queue.length}
            {queue.length > totalOriginalCards && (
              <span className="study-reloop-badge" title="Có thẻ cần ôn lại trong phiên">
                (Ôn lại vòng {queue.length - totalOriginalCards})
              </span>
            )}
          </div>
        </div>

        <div className="study-topbar-stats">
          <span className="study-mini-stat" title="Số thẻ còn lại trong hàng đợi">
            Còn lại: <strong>{remainingInQueue}</strong>
          </span>
          <span className="study-mini-stat mastered" title="Số thẻ đã đánh dấu thuộc">
            Đã thuộc: <strong>{masteredCount}</strong>
          </span>
        </div>
      </div>

      {/* Thanh tiến trình */}
      <div
        className="study-progress-track"
        title={`Tiến độ phiên học: ${progressPercent}%`}
        role="progressbar"
        aria-valuenow={progressPercent}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div className="study-progress-fill" style={{ width: `${progressPercent}%` }} />
      </div>

      {/* Khu vực Thẻ 3D Flip */}
      <div className="study-card-viewport">
        <div
          className={`flip-card ${isFlipped ? 'flipped' : ''}`}
          onClick={handleFlip}
          role="button"
          tabIndex={0}
          aria-label="Thẻ ghi nhớ 3D. Nhấp chuột hoặc bấm phím Space để lật thẻ."
        >
          <div className="flip-inner">
            {/* Mặt trước: Câu hỏi / Thuật ngữ */}
            <div className="flip-front card">
              <div className="flip-card-header">
                <span className="flip-face-badge front">
                  <HelpCircle size={14} /> Mặt trước &bull; Câu hỏi
                </span>
                <span className="flip-hint-pill">
                  <RotateCw size={13} /> Nhấp hoặc bấm <strong>Space</strong> để lật
                </span>
              </div>

              <div className="flip-card-content">
                <p className="flip-question-text">{currentCard?.question}</p>
              </div>

              <div className="flip-card-footer">
                <span className="flip-card-subhint">
                  Tự gợi nhớ đáp án trong tâm trí trước khi lật thẻ
                </span>
              </div>
            </div>

            {/* Mặt sau: Đáp án & Giải thích chi tiết */}
            <div className="flip-back card">
              <div className="flip-card-header">
                <span className="flip-face-badge back">
                  <CheckCircle2 size={14} /> Mặt sau &bull; Đáp án & Giải thích
                </span>
                <span className="flip-hint-pill">
                  <RotateCw size={13} /> Nhấp hoặc bấm <strong>Space</strong> để lật lại
                </span>
              </div>

              <div className="flip-card-content">
                <p className="flip-answer-text">{currentCard?.answer}</p>
              </div>

              <div className="flip-card-footer">
                <span className="flip-card-subhint">
                  Đánh giá mức độ ghi nhớ của bạn ở các nút bên dưới
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3 Nút Đánh giá Xếp loại Học tập */}
      <div className="study-classification-controls">
        <button
          className="btn-classify classify-again"
          onClick={(e) => {
            e.stopPropagation();
            handleClassify('again');
          }}
          title="Chưa nhớ được thẻ này, đẩy về cuối hàng đợi để học lại (Phím 1)"
        >
          <div className="classify-icon-wrap">
            <XCircle size={20} />
          </div>
          <div className="classify-text-wrap">
            <span className="classify-title">Chưa thuộc</span>
            <span className="classify-desc">Học lại cuối phiên &bull; Phím [1]</span>
          </div>
        </button>

        <button
          className="btn-classify classify-hard"
          onClick={(e) => {
            e.stopPropagation();
            handleClassify('hard');
          }}
          title="Nhớ mang máng, cần củng cố thêm (Phím 2)"
        >
          <div className="classify-icon-wrap">
            <AlertCircle size={20} />
          </div>
          <div className="classify-text-wrap">
            <span className="classify-title">Hơi nhớ</span>
            <span className="classify-desc">Cần ôn thêm &bull; Phím [2]</span>
          </div>
        </button>

        <button
          className="btn-classify classify-good"
          onClick={(e) => {
            e.stopPropagation();
            handleClassify('good');
          }}
          title="Đã nắm rất chắc chắn, đánh dấu Đã thuộc (Phím 3)"
        >
          <div className="classify-icon-wrap">
            <CheckCircle2 size={20} />
          </div>
          <div className="classify-text-wrap">
            <span className="classify-title">Đã thuộc</span>
            <span className="classify-desc">Ghi nhận hoàn thành &bull; Phím [3]</span>
          </div>
        </button>
      </div>

      {/* Hướng dẫn phím tắt chân trang */}
      <div className="study-keyboard-shortcuts">
        <span>
          <kbd>Space</kbd> Lật thẻ
        </span>
        &bull;
        <span>
          <kbd>1</kbd> Chưa thuộc
        </span>
        &bull;
        <span>
          <kbd>2</kbd> Hơi nhớ
        </span>
        &bull;
        <span>
          <kbd>3</kbd> Đã thuộc
        </span>
      </div>
    </div>
  );
}
