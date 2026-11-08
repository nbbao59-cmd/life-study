import {
  BookOpen,
  Calendar,
  CheckCircle2,
  Edit3,
  FileText,
  GraduationCap,
  HelpCircle,
  Layers,
  Plus,
  Search,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import PageTitle from '../../components/ui/PageTitle';
import { deleteDeck, listDecks, updateCardStatus } from '../../services/flashcardStorage';
import { Deck } from '../../types';
import DeckModal from './DeckModal';
import FlashcardStudyView from './FlashcardStudyView';
import QuizStudyView from './QuizStudyView';

export interface FlashcardsPageProps {
  onNavigateToDocuments?: () => void;
}

function formatDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export default function FlashcardsPage({ onNavigateToDocuments }: FlashcardsPageProps) {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [activeView, setActiveView] = useState<'list' | 'study' | 'quiz'>('list');
  const [selectedDeck, setSelectedDeck] = useState<Deck | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDeck, setEditingDeck] = useState<Deck | null>(null);
  const [search, setSearch] = useState('');

  const refreshDecks = () => {
    const loaded = listDecks();
    setDecks(loaded);
    if (selectedDeck) {
      const refreshedSelected = loaded.find((d) => d.id === selectedDeck.id) ?? null;
      setSelectedDeck(refreshedSelected);
    }
  };

  useEffect(() => {
    refreshDecks();
  }, []);

  const totalDecks = decks.length;
  const totalCards = useMemo(
    () => decks.reduce((sum, d) => sum + (d.cards?.length || 0), 0),
    [decks]
  );
  const totalMastered = useMemo(
    () =>
      decks.reduce(
        (sum, d) => sum + (d.cards ? d.cards.filter((c) => c.status === 'mastered').length : 0),
        0
      ),
    [decks]
  );
  const totalQuizzes = useMemo(
    () => decks.reduce((sum, d) => sum + (d.quizzes?.length || 0), 0),
    [decks]
  );

  const filteredDecks = useMemo(() => {
    const term = search.trim().toLocaleLowerCase('vi');
    if (!term) return decks;
    return decks.filter(
      (d) =>
        d.title.toLocaleLowerCase('vi').includes(term) ||
        (d.summary && d.summary.toLocaleLowerCase('vi').includes(term)) ||
        (d.sourceDocumentName && d.sourceDocumentName.toLocaleLowerCase('vi').includes(term))
    );
  }, [decks, search]);

  const handleStartStudy = (deck: Deck) => {
    setSelectedDeck(deck);
    setActiveView('study');
  };

  const handleStartQuiz = (deck: Deck) => {
    setSelectedDeck(deck);
    setActiveView('quiz');
  };

  const handleCreateDeck = () => {
    setEditingDeck(null);
    setModalOpen(true);
  };

  const handleEditDeck = (deck: Deck) => {
    setEditingDeck(deck);
    setModalOpen(true);
  };

  const handleDeleteDeck = (deck: Deck) => {
    const confirmed = window.confirm(
      `Bạn có chắc chắn muốn xóa bộ thẻ "${deck.title}"?\nToàn bộ ${deck.cards.length} thẻ flashcard và dữ liệu ôn tập sẽ bị xóa vĩnh viễn.`
    );
    if (!confirmed) return;

    deleteDeck(deck.id);
    if (selectedDeck?.id === deck.id) {
      setSelectedDeck(null);
      setActiveView('list');
    }
    refreshDecks();
  };

  const handleBackToList = () => {
    setActiveView('list');
    setSelectedDeck(null);
    refreshDecks();
  };

  // Màn hình Study 3D Flip
  if (activeView === 'study' && selectedDeck) {
    return (
      <FlashcardStudyView
        deck={selectedDeck}
        onBack={handleBackToList}
        onCardStatusChange={(cardId, st) => {
          updateCardStatus(selectedDeck.id, cardId, st);
          refreshDecks();
        }}
      />
    );
  }

  // Màn hình Quiz Trắc nghiệm
  if (activeView === 'quiz' && selectedDeck) {
    return (
      <QuizStudyView
        deck={selectedDeck}
        onBack={handleBackToList}
      />
    );
  }

  return (
    <div className="stack flashcards-page">
      <PageTitle
        icon={<GraduationCap size={22} />}
        title="Không gian Ôn tập & Flashcards"
        subtitle="Học chủ động với thẻ ghi nhớ Spaced Repetition và bài tập trắc nghiệm thông minh"
      />

      {/* Hero Banner với Thống kê */}
      <section className="flashcards-hero">
        <div className="flashcards-hero-copy">
          <span className="flashcards-eyebrow">
            <Sparkles size={15} /> Phương pháp Active Recall & Spaced Repetition
          </span>
          <h3>Ghi nhớ sâu kiến thức trọng tâm</h3>
          <p>
            Biến tài liệu học tập thành hệ thống thẻ ghi nhớ thông minh. Tự tạo bộ thẻ hoặc nhờ AI phân tích đề cương để
            chuẩn bị cho kỳ thi một cách tự tin.
          </p>
        </div>

        <div className="flashcards-hero-stats" aria-label="Thống kê ôn tập">
          <div className="hero-stat-item">
            <strong>{totalDecks}</strong>
            <span>Bộ thẻ (Decks)</span>
          </div>
          <div className="hero-stat-item">
            <strong>{totalCards}</strong>
            <span>Thẻ Flashcard</span>
          </div>
          <div className="hero-stat-item mastered-stat">
            <strong>{totalMastered}</strong>
            <span>Đã ghi nhớ</span>
          </div>
          {totalQuizzes > 0 && (
            <div className="hero-stat-item">
              <strong>{totalQuizzes}</strong>
              <span>Câu trắc nghiệm</span>
            </div>
          )}
        </div>

        <div className="flashcards-hero-mark">
          <GraduationCap size={96} strokeWidth={1.1} />
        </div>
      </section>

      {/* Toolbar: Tìm kiếm + Nút Tạo mới */}
      <div className="flashcards-toolbar card">
        <div className="flashcards-toolbar-left">
          <label className="flashcards-search">
            <Search size={17} />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm kiếm bộ thẻ theo tên, tài liệu nguồn, mô tả..."
              aria-label="Tìm kiếm bộ thẻ"
            />
          </label>
        </div>

        <div className="flashcards-toolbar-right">
          {onNavigateToDocuments && (
            <button
              className="btn ghost sm"
              onClick={onNavigateToDocuments}
              title="Mở thư viện tài liệu để AI tạo flashcard từ PDF"
            >
              <FileText size={15} /> Thư viện tài liệu
            </button>
          )}
          <button className="btn primary" onClick={handleCreateDeck}>
            <Plus size={16} /> Tạo bộ thẻ mới
          </button>
        </div>
      </div>

      {/* Grid danh sách Deck */}
      {filteredDecks.length === 0 ? (
        <section className="card flashcards-empty">
          <div className="flashcards-empty-icon">
            <BookOpen size={32} />
          </div>
          <h3>{search ? 'Không tìm thấy bộ thẻ nào phù hợp' : 'Chưa có bộ thẻ ôn tập nào'}</h3>
          <p className="muted">
            {search
              ? 'Thử thay đổi từ khóa tìm kiếm hoặc bấm nút "Tạo bộ thẻ mới".'
              : 'Hãy bắt đầu bằng cách tạo bộ thẻ thủ công hoặc sang mục Thư viện tài liệu để AI trích xuất tự động.'}
          </p>
          <div className="flashcards-empty-actions">
            <button className="btn primary" onClick={handleCreateDeck}>
              <Plus size={16} /> Tạo bộ thẻ đầu tiên
            </button>
            {onNavigateToDocuments && (
              <button className="btn ghost" onClick={onNavigateToDocuments}>
                <FileText size={16} /> Xem tài liệu để AI tạo thẻ
              </button>
            )}
          </div>
        </section>
      ) : (
        <div className="deck-grid">
          {filteredDecks.map((deck) => {
            const cardCount = deck.cards?.length || 0;
            const quizCount = deck.quizzes?.length || 0;
            const masteredCount = deck.cards ? deck.cards.filter((c) => c.status === 'mastered').length : 0;
            const progressPercent = cardCount > 0 ? Math.round((masteredCount / cardCount) * 100) : 0;

            return (
              <article key={deck.id} className="card deck-card">
                <div className="deck-card-header">
                  {deck.sourceDocumentName ? (
                    <span className="deck-badge ai" title={`Tạo tự động từ: ${deck.sourceDocumentName}`}>
                      <FileText size={12} />
                      <span className="deck-badge-text">{deck.sourceDocumentName}</span>
                    </span>
                  ) : (
                    <span className="deck-badge manual">
                      <GraduationCap size={12} />
                      <span>Thủ công</span>
                    </span>
                  )}
                  <span className="deck-date" title={deck.createdAt}>
                    <Calendar size={12} /> {formatDate(deck.createdAt)}
                  </span>
                </div>

                <div className="deck-card-body">
                  <h4 className="deck-title" title={deck.title}>
                    {deck.title}
                  </h4>
                  {deck.summary ? (
                    <p className="deck-summary" title={deck.summary}>
                      {deck.summary}
                    </p>
                  ) : (
                    <p className="deck-summary placeholder muted">Không có mô tả chi tiết.</p>
                  )}
                </div>

                <div className="deck-card-stats">
                  <div className="deck-stat-badge">
                    <Layers size={14} />
                    <span>
                      <strong>{cardCount}</strong> thẻ
                    </span>
                  </div>
                  {quizCount > 0 && (
                    <div className="deck-stat-badge quiz-stat">
                      <HelpCircle size={14} />
                      <span>
                        <strong>{quizCount}</strong> câu quiz
                      </span>
                    </div>
                  )}
                  {cardCount > 0 && (
                    <div className="deck-progress-wrap" title={`Đã thuộc ${masteredCount}/${cardCount} thẻ (${progressPercent}%)`}>
                      <div className="deck-progress-label">
                        <CheckCircle2 size={12} />
                        <span>Đã thuộc {masteredCount}/{cardCount}</span>
                      </div>
                      <div className="deck-progress-track">
                        <div
                          className="deck-progress-bar"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="deck-card-footer">
                  <div className="deck-primary-actions">
                    <button
                      className="btn primary sm deck-action-btn"
                      onClick={() => handleStartStudy(deck)}
                      disabled={cardCount === 0}
                      title={cardCount === 0 ? 'Chưa có thẻ nào' : 'Bắt đầu lật thẻ ôn tập 3D'}
                    >
                      <Layers size={14} />
                      <span>Lật thẻ</span>
                    </button>
                    {quizCount > 0 ? (
                      <button
                        className="btn ghost sm deck-action-btn quiz-action-btn"
                        onClick={() => handleStartQuiz(deck)}
                        title="Bắt đầu làm bài trắc nghiệm tính điểm"
                      >
                        <HelpCircle size={14} />
                        <span>Làm Quiz</span>
                      </button>
                    ) : (
                      <button
                        className="btn ghost sm deck-action-btn"
                        onClick={() => handleEditDeck(deck)}
                        title="Chỉnh sửa nội dung bộ thẻ"
                      >
                        <Edit3 size={14} />
                        <span>Sửa</span>
                      </button>
                    )}
                  </div>

                  <div className="deck-secondary-actions">
                    {quizCount > 0 && (
                      <button
                        className="icon-btn sm"
                        onClick={() => handleEditDeck(deck)}
                        title="Chỉnh sửa bộ thẻ"
                        aria-label={`Chỉnh sửa ${deck.title}`}
                      >
                        <Edit3 size={15} />
                      </button>
                    )}
                    <button
                      className="icon-btn danger sm"
                      onClick={() => handleDeleteDeck(deck)}
                      title="Xóa bộ thẻ"
                      aria-label={`Xóa ${deck.title}`}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Modal chỉnh sửa / tạo mới bộ thẻ */}
      <DeckModal
        isOpen={modalOpen}
        deck={editingDeck}
        onClose={() => setModalOpen(false)}
        onSaved={(_saved) => {
          refreshDecks();
        }}
      />
    </div>
  );
}
