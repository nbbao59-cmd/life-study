import {
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
import { BioluminescentCoralIllustration, ShellPearlNauticalIcon } from '../../components/illustrations/OceanIllustrations';
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
      `Xóa bộ thẻ san hô "${deck.title}"?\nToàn bộ ${deck.cards.length} thẻ flashcard sẽ bị xóa.`
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

  if (activeView === 'quiz' && selectedDeck) {
    return (
      <QuizStudyView
        deck={selectedDeck}
        onBack={handleBackToList}
      />
    );
  }

  return (
    <div className="stack flashcards-page ocean-flashcards-page">
      <PageTitle
        icon={<ShellPearlNauticalIcon size={24} />}
        title="Lặn Ngắm Rạn San Hô & Ôn Tập 3D"
        subtitle="Học chủ động Active Recall dưới đáy biển sâu với thẻ 3D và bài trắc nghiệm san hô"
      />

      {/* Ocean Coral Reef Hero */}
      <section className="flashcards-hero ocean-coral-hero">
        <div className="flashcards-hero-copy">
          <span className="flashcards-eyebrow">
            <Sparkles size={15} /> Rạn San Hô Tri Thức & Spaced Repetition
          </span>
          <h3>Lặn Sâu Khám Phá Kiến Thức Trọng Tâm</h3>
          <p>
            Đúc kết tài liệu thành những vỏ sò ngọc trai ghi nhớ sâu sắc. Lật thẻ phản quang 3D và
            kiểm tra trí nhớ với bài trắc nghiệm hải trình tự động.
          </p>
        </div>

        <div className="flashcards-hero-stats ocean-stats-badge" aria-label="Thống kê ôn tập">
          <div className="hero-stat-item">
            <strong>{totalDecks}</strong>
            <span>Nhánh san hô</span>
          </div>
          <div className="hero-stat-item">
            <strong>{totalCards}</strong>
            <span>Vỏ sò Flashcard</span>
          </div>
          <div className="hero-stat-item mastered-stat">
            <strong>{totalMastered}</strong>
            <span>Ngọc trai ghi nhớ</span>
          </div>
          {totalQuizzes > 0 && (
            <div className="hero-stat-item">
              <strong>{totalQuizzes}</strong>
              <span>Câu hỏi biển sâu</span>
            </div>
          )}
        </div>

        <div className="ocean-hero-chest-illustration">
          <BioluminescentCoralIllustration width={180} height={120} />
        </div>
      </section>

      {/* Toolbar: Tìm kiếm + Nút Tạo mới */}
      <div className="flashcards-toolbar card ocean-card">
        <div className="flashcards-toolbar-left">
          <label className="flashcards-search ocean-search">
            <Search size={17} />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm kiếm bộ thẻ san hô..."
              aria-label="Tìm kiếm bộ thẻ"
            />
          </label>
        </div>

        <div className="flashcards-toolbar-right">
          {onNavigateToDocuments && (
            <button
              className="btn ghost sm ocean-btn-ghost"
              onClick={onNavigateToDocuments}
              title="Mở kho báu tài liệu để AI trích xuất flashcards tự động"
            >
              <FileText size={15} /> Kho báu tài liệu
            </button>
          )}
          <button className="btn ocean-btn" onClick={handleCreateDeck}>
            <Plus size={16} /> Tạo Bộ Thẻ Mới
          </button>
        </div>
      </div>

      {/* Grid danh sách Deck */}
      {filteredDecks.length === 0 ? (
        <section className="card flashcards-empty ocean-empty">
          <div className="flashcards-empty-icon">
            <ShellPearlNauticalIcon size={36} />
          </div>
          <h3>{search ? 'Không tìm thấy bộ thẻ san hô phù hợp' : 'Rạn san hô chưa có bộ thẻ nào'}</h3>
          <p className="muted">
            {search
              ? 'Thử thay đổi từ khóa tìm kiếm hoặc bấm nút "Tạo bộ thẻ mới".'
              : 'Hãy bắt đầu tạo bộ thẻ thủ công hoặc dùng AI trích xuất tự động từ kho văn thư.'}
          </p>
          <div className="flashcards-empty-actions">
            <button className="btn ocean-btn" onClick={handleCreateDeck}>
              <Plus size={16} /> Tạo Bộ Thẻ Đầu Tiên
            </button>
            {onNavigateToDocuments && (
              <button className="btn ghost ocean-btn-ghost" onClick={onNavigateToDocuments}>
                <FileText size={16} /> Xem Kho Tài Liệu
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
              <article key={deck.id} className="card deck-card ocean-deck-card">
                <div className="deck-card-header">
                  {deck.sourceDocumentName ? (
                    <span className="deck-badge ai ocean-badge-ai" title={`Tạo tự động từ: ${deck.sourceDocumentName}`}>
                      <FileText size={12} />
                      <span className="deck-badge-text">{deck.sourceDocumentName}</span>
                    </span>
                  ) : (
                    <span className="deck-badge manual ocean-badge-manual">
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
                  <div className="deck-stat-badge ocean-stat-badge">
                    <Layers size={14} />
                    <span>
                      <strong>{cardCount}</strong> thẻ
                    </span>
                  </div>
                  {quizCount > 0 && (
                    <div className="deck-stat-badge quiz-stat ocean-quiz-badge">
                      <HelpCircle size={14} />
                      <span>
                        <strong>{quizCount}</strong> quiz
                      </span>
                    </div>
                  )}
                  {cardCount > 0 && (
                    <div className="deck-progress-wrap" title={`Đã thuộc ${masteredCount}/${cardCount} thẻ (${progressPercent}%)`}>
                      <div className="deck-progress-label">
                        <CheckCircle2 size={12} />
                        <span>Đã thuộc {masteredCount}/{cardCount}</span>
                      </div>
                      <div className="deck-progress-track ocean-progress-track">
                        <div
                          className="deck-progress-bar ocean-progress-bar"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="deck-card-footer">
                  <div className="deck-primary-actions">
                    <button
                      className="btn primary sm ocean-btn deck-action-btn"
                      onClick={() => handleStartStudy(deck)}
                      disabled={cardCount === 0}
                      title={cardCount === 0 ? 'Chưa có thẻ nào' : 'Lật vỏ sò ôn tập 3D'}
                    >
                      <Layers size={14} />
                      <span>Lật thẻ 3D</span>
                    </button>
                    {quizCount > 0 ? (
                      <button
                        className="btn ghost sm ocean-btn-ghost deck-action-btn quiz-action-btn"
                        onClick={() => handleStartQuiz(deck)}
                        title="Bắt đầu bài trắc nghiệm san hô"
                      >
                        <HelpCircle size={14} />
                        <span>Làm Quiz</span>
                      </button>
                    ) : (
                      <button
                        className="btn ghost sm ocean-btn-ghost deck-action-btn"
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
