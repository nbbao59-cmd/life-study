import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  HelpCircle,
  RotateCcw,
  Sparkles,
  Trophy,
  XCircle,
} from 'lucide-react';
import React, { useState } from 'react';
import { Deck, QuizItem } from '../../types';

export interface QuizStudyViewProps {
  deck: Deck;
  onBack: () => void;
}

interface UserAnswer {
  quizId: string;
  selectedOption: number;
  isCorrect: boolean;
}

export default function QuizStudyView({ deck, onBack }: QuizStudyViewProps) {
  const quizzes: QuizItem[] = deck.quizzes || [];
  const totalQuizzes = quizzes.length;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState<UserAnswer[]>([]);
  const [isFinished, setIsFinished] = useState(false);

  // Không có câu hỏi trắc nghiệm
  if (totalQuizzes === 0) {
    return (
      <div className="stack quiz-study-container">
        <div className="study-topbar">
          <button className="btn ghost sm" onClick={onBack}>
            <ArrowLeft size={16} /> Quay lại danh sách
          </button>
        </div>

        <section className="card study-empty-card">
          <div className="study-empty-icon quiz-color">
            <HelpCircle size={36} />
          </div>
          <h3>Bộ thẻ này chưa có câu hỏi trắc nghiệm</h3>
          <p className="muted">
            Hiện bộ thẻ "{deck.title}" chưa có danh sách câu hỏi trắc nghiệm. Bạn có thể chỉnh sửa bộ thẻ để thêm câu
            hỏi hoặc tải tài liệu lên thư viện để AI tự động trích xuất bài tập trắc nghiệm.
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

  const currentQuiz = quizzes[currentIndex];

  const handleSelectOption = (index: number) => {
    if (isAnswered) return;

    setSelectedOption(index);
    setIsAnswered(true);

    const isCorrect = index === currentQuiz.correctIndex;
    if (isCorrect) {
      setScore((s) => s + 1);
    }

    setAnswers((prev) => [
      ...prev,
      {
        quizId: currentQuiz.id,
        selectedOption: index,
        isCorrect,
      },
    ]);
  };

  const handleNext = () => {
    if (currentIndex + 1 < totalQuizzes) {
      setCurrentIndex((i) => i + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setIsFinished(true);
    }
  };

  const handleRestartQuiz = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setAnswers([]);
    setIsFinished(false);
  };

  // Màn hình hoàn thành Quiz & Kết quả
  if (isFinished) {
    const percent = Math.round((score / totalQuizzes) * 100);

    let ratingTitle = 'Cần ôn lại';
    let ratingFeedback = 'Bạn nên đọc lại tài liệu và lật thẻ ghi nhớ thêm một vài lần trước khi thử lại nhé!';
    let ratingColorClass = 'rating-review';

    if (percent >= 80) {
      ratingTitle = 'Tuyệt vời!';
      ratingFeedback = 'Khả năng ghi nhớ và thấu hiểu bài học của bạn rất xuất sắc! Sẵn sàng cho kỳ thi thật.';
      ratingColorClass = 'rating-excellent';
    } else if (percent >= 50) {
      ratingTitle = 'Khá tốt!';
      ratingFeedback = 'Bạn đã nắm được hầu hết các điểm chính, hãy chú ý củng cố các câu còn phân vân nhé.';
      ratingColorClass = 'rating-good';
    }

    return (
      <div className="stack quiz-study-container">
        <div className="study-topbar">
          <button className="btn ghost sm" onClick={onBack}>
            <ArrowLeft size={16} /> Quay lại danh sách
          </button>
          <div className="study-topbar-title">
            <HelpCircle size={16} />
            <span>{deck.title} &bull; Kết quả trắc nghiệm</span>
          </div>
        </div>

        <section className="card quiz-results-card">
          <div className={`quiz-results-trophy ${ratingColorClass}`}>
            <Trophy size={50} />
          </div>

          <span className={`quiz-rating-pill ${ratingColorClass}`}>
            <Sparkles size={15} /> {ratingTitle}
          </span>

          <h2 className="quiz-results-title">Hoàn thành bài kiểm tra trắc nghiệm!</h2>
          <p className="muted quiz-results-deckname">Bộ thẻ: {deck.title}</p>

          <div className="quiz-score-badge">
            <div className="quiz-score-numbers">
              <span className="quiz-score-hit">{score}</span>
              <span className="quiz-score-separator">/</span>
              <span className="quiz-score-total">{totalQuizzes}</span>
            </div>
            <span className="quiz-score-percent">Đạt {percent}%</span>
          </div>

          <p className="quiz-results-feedback">{ratingFeedback}</p>

          <div className="quiz-results-actions">
            <button className="btn ghost" onClick={handleRestartQuiz}>
              <RotateCcw size={16} /> Làm lại bài Quiz
            </button>
            <button className="btn primary" onClick={onBack}>
              Quay lại danh sách <ChevronRight size={16} />
            </button>
          </div>

          {/* Chi tiết từng câu hỏi đã làm */}
          <div className="quiz-review-section">
            <h4 className="quiz-review-heading">
              <CheckCircle2 size={16} /> Chi tiết các câu hỏi ({score}/{totalQuizzes} đúng)
            </h4>
            <div className="quiz-review-list">
              {quizzes.map((q, idx) => {
                const ans = answers.find((a) => a.quizId === q.id);
                const isCorrect = ans ? ans.isCorrect : false;
                const userChoice = ans ? ans.selectedOption : null;

                return (
                  <div
                    key={q.id}
                    className={`quiz-review-item ${isCorrect ? 'correct' : 'incorrect'}`}
                  >
                    <div className="quiz-review-header">
                      <span className="quiz-review-index">Câu {idx + 1}</span>
                      <span className={`quiz-review-tag ${isCorrect ? 'tag-correct' : 'tag-incorrect'}`}>
                        {isCorrect ? (
                          <>
                            <CheckCircle2 size={13} /> Đúng
                          </>
                        ) : (
                          <>
                            <XCircle size={13} /> Sai
                          </>
                        )}
                      </span>
                    </div>

                    <p className="quiz-review-question">{q.question}</p>

                    <div className="quiz-review-choices">
                      {q.options.map((opt, optIdx) => {
                        const optKey = ['A', 'B', 'C', 'D'][optIdx] || String(optIdx + 1);
                        const isThisCorrect = optIdx === q.correctIndex;
                        const isThisChosen = optIdx === userChoice;

                        let choiceClass = 'review-choice';
                        if (isThisCorrect) choiceClass += ' choice-correct';
                        if (isThisChosen && !isThisCorrect) choiceClass += ' choice-wrong';

                        return (
                          <div key={optIdx} className={choiceClass}>
                            <span className="choice-key">{optKey}.</span>
                            <span className="choice-text">{opt}</span>
                            {isThisCorrect && <span className="choice-status-pill correct">Đáp án đúng</span>}
                            {isThisChosen && !isThisCorrect && (
                              <span className="choice-status-pill wrong">Lựa chọn của bạn</span>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {q.explanation && (
                      <div className="quiz-review-explanation">
                        <strong>Giải thích:</strong> {q.explanation}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </div>
    );
  }

  const progressPercent = Math.round(((currentIndex + 1) / totalQuizzes) * 100);
  const optionKeys = ['A', 'B', 'C', 'D'];

  return (
    <div className="stack quiz-study-container">
      {/* Topbar tiến trình câu hỏi */}
      <div className="study-topbar">
        <button className="btn ghost sm" onClick={onBack} title="Quay lại danh sách bộ thẻ">
          <ArrowLeft size={16} /> Quay lại
        </button>

        <div className="study-topbar-center">
          <h3 className="study-deck-title" title={deck.title}>
            {deck.title}
          </h3>
          <div className="study-counter-badge quiz">
            Câu {currentIndex + 1} / {totalQuizzes}
          </div>
        </div>

        <div className="study-topbar-stats">
          <span className="study-mini-stat quiz-score-stat">
            Điểm: <strong>{score}</strong> / {currentIndex + (isAnswered ? 1 : 0)}
          </span>
        </div>
      </div>

      {/* Progress Track */}
      <div
        className="study-progress-track"
        title={`Tiến độ bài quiz: ${progressPercent}%`}
        role="progressbar"
        aria-valuenow={progressPercent}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div className="study-progress-fill quiz-fill" style={{ width: `${progressPercent}%` }} />
      </div>

      {/* Thẻ câu hỏi trắc nghiệm */}
      <div className="quiz-card card">
        <div className="quiz-question-header">
          <span className="quiz-question-badge">
            <HelpCircle size={14} /> Câu hỏi {currentIndex + 1} của {totalQuizzes}
          </span>
          <span className="quiz-hint-pill">Chọn 1 đáp án chính xác nhất</span>
        </div>

        <h3 className="quiz-question-text">{currentQuiz.question}</h3>

        {/* Danh sách 4 đáp án */}
        <div className="quiz-options-list" role="radiogroup" aria-label="Các phương án trả lời">
          {currentQuiz.options.map((option, idx) => {
            const key = optionKeys[idx] || String(idx + 1);
            const isSelected = selectedOption === idx;
            const isCorrectAnswer = idx === currentQuiz.correctIndex;

            // Xác định class cho quiz-option
            let optionClass = 'quiz-option';
            if (isAnswered) {
              if (isCorrectAnswer) {
                optionClass += ' quiz-correct';
              } else if (isSelected) {
                optionClass += ' quiz-incorrect';
              } else {
                optionClass += ' quiz-dimmed';
              }
            }

            return (
              <button
                key={idx}
                type="button"
                className={optionClass}
                disabled={isAnswered}
                onClick={() => handleSelectOption(idx)}
                aria-checked={isSelected}
                role="radio"
              >
                <span className="quiz-option-key">{key}</span>
                <span className="quiz-option-text">{option}</span>
                {isAnswered && isCorrectAnswer && (
                  <span className="quiz-option-icon correct">
                    <CheckCircle2 size={18} />
                  </span>
                )}
                {isAnswered && isSelected && !isCorrectAnswer && (
                  <span className="quiz-option-icon incorrect">
                    <XCircle size={18} />
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Hộp giải thích hiển thị ngay khi đã chọn đáp án */}
        {isAnswered && (
          <div
            className={`quiz-explanation ${
              selectedOption === currentQuiz.correctIndex ? 'correct-banner' : 'incorrect-banner'
            }`}
          >
            <div className="quiz-explanation-header">
              {selectedOption === currentQuiz.correctIndex ? (
                <>
                  <CheckCircle2 size={18} className="text-emerald" />
                  <strong className="text-emerald">Chính xác!</strong>
                </>
              ) : (
                <>
                  <AlertCircle size={18} className="text-rose" />
                  <strong className="text-rose">Chưa chính xác!</strong>
                  <span className="quiz-correct-reveal">
                    Đáp án đúng là:{' '}
                    <strong>
                      {optionKeys[currentQuiz.correctIndex]}. {currentQuiz.options[currentQuiz.correctIndex]}
                    </strong>
                  </span>
                </>
              )}
            </div>

            {currentQuiz.explanation && (
              <p className="quiz-explanation-body">
                <strong>Giải thích:</strong> {currentQuiz.explanation}
              </p>
            )}

            <div className="quiz-next-action">
              <button className="btn primary" onClick={handleNext} autoFocus>
                {currentIndex + 1 < totalQuizzes ? (
                  <>
                    Câu tiếp theo <ArrowRight size={16} />
                  </>
                ) : (
                  <>
                    Xem kết quả bài Quiz <Trophy size={16} />
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
