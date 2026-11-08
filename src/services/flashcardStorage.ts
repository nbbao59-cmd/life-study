import { Deck } from '../types';

export const FLASHCARD_STORAGE_KEY = 'life-study-decks';

export const SAMPLE_DECK: Deck = {
  id: 'deck-sample-learning-science',
  title: 'Khoa học Não bộ & Phương pháp Ghi nhớ',
  sourceDocumentName: 'So_tay_Hoc_tap_Hieu_qua.pdf',
  summary: 'Hệ thống hóa các phương pháp học tập khoa học: Spaced Repetition, Active Recall, Kỹ thuật Feynman và Hiệu ứng Pomodoro.',
  createdAt: new Date().toISOString(),
  cards: [
    {
      id: 'card-sample-1',
      question: 'Phương pháp "Lặp lại ngắt quãng" (Spaced Repetition) hoạt động dựa trên nguyên lý khoa học nào?',
      answer: 'Dựa trên Đường cong quên lãng của Hermann Ebbinghaus: ôn tập lại kiến thức vào các khoảng thời gian ngắt quãng tăng dần (1 ngày, 3 ngày, 7 ngày, 14 ngày, 30 ngày) ngay trước thời điểm não chuẩn bị quên, giúp chuyển trí nhớ ngắn hạn thành dài hạn.',
      status: 'learning',
    },
    {
      id: 'card-sample-2',
      question: 'Active Recall (Chủ động gợi nhớ) khác gì so với Đọc thụ động (Passive Reading)?',
      answer: 'Active Recall yêu cầu não bộ chủ động truy xuất thông tin từ bộ nhớ (tự kiểm tra bằng flashcard, giải đề) thay vì chỉ nhìn vào tài liệu. Hoạt động này củng cố các khớp thần kinh nơ-ron mạnh gấp 3-4 lần đọc thụ động.',
      status: 'new',
    },
    {
      id: 'card-sample-3',
      question: '4 bước cốt lõi của "Kỹ thuật Feynman" (The Feynman Technique) là gì?',
      answer: '1. Chọn chủ đề kiến thức cần học.\n2. Giảng giải lại cho một đứa trẻ 10 tuổi (sử dụng ngôn ngữ bình dị nhất, tránh thuật ngữ phức tạp).\n3. Xác định chỗ ngắc ngứ, hổng kiến thức để mở lại tài liệu tra cứu.\n4. Tinh gọn hóa và dùng phép ẩn dụ quen thuộc để ghi nhớ sâu.',
      status: 'mastered',
    },
    {
      id: 'card-sample-4',
      question: 'Nguyên tắc căn bản của kỹ thuật "Quả cà chua" Pomodoro là gì?',
      answer: 'Chia phiên học thành các chu kỳ: 25 phút tập trung tuyệt đối (không điện thoại, không đa nhiệm), sau đó nghỉ giải lao ngắn 5 phút. Sau mỗi 4 chu kỳ Pomodoro thì nghỉ dài 15-30 phút.',
      status: 'new',
    },
    {
      id: 'card-sample-5',
      question: 'Hiệu ứng "Ảo tưởng về sự hiểu biết" (Illusion of Competence) trong học tập là gì?',
      answer: 'Cảm giác sai lầm rằng mình đã nắm chắc bài học khi nhìn vào sách được tô đậm (highlight) nhiều màu, hoặc xem lời giải chi tiết và thấy nó hợp lý, nhưng khi gập sách lại thì không thể tự làm lại được.',
      status: 'learning',
    },
  ],
  quizzes: [
    {
      id: 'quiz-sample-1',
      question: 'Hành động nào dưới đây là biểu hiện của phương pháp "Active Recall"?',
      options: [
        'Dùng bút dạ quang tô đậm tất cả các dòng quan trọng trong sách giáo khoa',
        'Đọc đi đọc lại một trang tài liệu nhiều lần cho đến khi thuộc lòng',
        'Tự gập sách lại và viết ra giấy mọi ý chính hoặc trả lời câu hỏi tự kiểm tra',
        'Bật file ghi âm bài giảng và nghe thụ động trong lúc làm việc khác',
      ],
      correctIndex: 2,
      explanation: 'Tự gập sách lại và tái hiện kiến thức ra giấy buộc não phải truy xuất bộ nhớ, kích hoạt khớp thần kinh ghi nhớ sâu - bản chất cốt lõi của Active Recall.',
    },
    {
      id: 'quiz-sample-2',
      question: 'Thời điểm tối ưu nhất để ôn tập lại một thẻ ghi nhớ theo Spaced Repetition là khi nào?',
      options: [
        'Ngay lập tức sau 5 giây vừa đọc xong',
        'Ngay trước khi kiến thức đó chuẩn bị bị lãng quên trong trí nhớ',
        'Đợi đến đêm trước ngày thi cuối kỳ mới ôn dồn một lượt',
        'Mỗi ngày ôn đi ôn lại 10 lần liên tục trong suốt 1 tháng',
      ],
      correctIndex: 1,
      explanation: 'Ôn tập ngay khi kiến thức bắt đầu suy giảm trong trí nhớ sẽ tạo ra nỗ lực gợi nhớ tối đa, giúp làm phẳng đường cong quên lãng hiệu quả nhất.',
    },
    {
      id: 'quiz-sample-3',
      question: 'Kỹ thuật Feynman khuyến khích giải thích khái niệm cho ai để kiểm tra mức độ hiểu sâu?',
      options: [
        'Một giáo sư chuyên ngành đang nghiên cứu đề tài đó',
        'Một đứa trẻ khoảng 10 tuổi chưa từng biết về chủ đề đó',
        'Một người đồng nghiệp có cùng trình độ học vấn',
        'Chính bản thân mình trong gương bằng các thuật ngữ hàn lâm',
      ],
      correctIndex: 1,
      explanation: 'Nếu có thể giải thích một khái niệm phức tạp cho một đứa trẻ 10 tuổi hiểu bằng ngôn ngữ đời thường thì chứng tỏ bạn đã thực sự thấu hiểu bản chất vấn đề.',
    },
  ],
};

/**
 * Lấy toàn bộ danh sách bộ thẻ ôn tập từ localStorage.
 * Khởi tạo bộ thẻ mẫu nếu chưa có dữ liệu.
 */
export function listDecks(): Deck[] {
  try {
    const raw = localStorage.getItem(FLASHCARD_STORAGE_KEY);
    if (raw === null) {
      saveDeck(SAMPLE_DECK);
      return [SAMPLE_DECK];
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      saveDeck(SAMPLE_DECK);
      return [SAMPLE_DECK];
    }
    return parsed;
  } catch (err) {
    console.error('[flashcardStorage] Lỗi đọc danh sách bộ thẻ từ localStorage:', err);
    return [SAMPLE_DECK];
  }
}

/**
 * Lấy thông tin một bộ thẻ theo ID.
 */
export function getDeck(id: string): Deck | null {
  if (!id) return null;
  const decks = listDecks();
  return decks.find((d) => d.id === id) ?? null;
}

/**
 * Thêm mới hoặc cập nhật một bộ thẻ vào localStorage.
 */
export function saveDeck(deck: Deck): void {
  if (!deck || !deck.id) return;
  try {
    let decks: Deck[] = [];
    const raw = localStorage.getItem(FLASHCARD_STORAGE_KEY);
    if (raw !== null) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) decks = parsed;
      } catch {
        decks = [];
      }
    }
    const index = decks.findIndex((d) => d.id === deck.id);
    if (index >= 0) {
      decks[index] = deck;
    } else {
      decks.unshift(deck);
    }
    localStorage.setItem(FLASHCARD_STORAGE_KEY, JSON.stringify(decks));
  } catch (err) {
    console.error('[flashcardStorage] Lỗi lưu bộ thẻ vào localStorage:', err);
  }
}

/**
 * Xóa một bộ thẻ khỏi localStorage theo ID.
 */
export function deleteDeck(id: string): void {
  if (!id) return;
  try {
    const decks = listDecks().filter((d) => d.id !== id);
    localStorage.setItem(FLASHCARD_STORAGE_KEY, JSON.stringify(decks));
  } catch (err) {
    console.error('[flashcardStorage] Lỗi xóa bộ thẻ trong localStorage:', err);
  }
}

/**
 * Cập nhật trạng thái học tập của một thẻ ('new' | 'learning' | 'mastered').
 */
export function updateCardStatus(
  deckId: string,
  cardId: string,
  status: 'new' | 'learning' | 'mastered'
): void {
  if (!deckId || !cardId) return;
  const deck = getDeck(deckId);
  if (!deck) return;

  let changed = false;
  const updatedCards = deck.cards.map((card) => {
    if (card.id === cardId) {
      changed = true;
      return {
        ...card,
        status,
        lastReviewed: new Date().toISOString(),
      };
    }
    return card;
  });

  if (changed) {
    saveDeck({
      ...deck,
      cards: updatedCards,
    });
  }
}

/**
 * Khôi phục lại bộ thẻ mẫu ban đầu.
 */
export function resetToDefaultDeck(): void {
  try {
    localStorage.setItem(FLASHCARD_STORAGE_KEY, JSON.stringify([SAMPLE_DECK]));
  } catch (err) {
    console.error('[flashcardStorage] Lỗi reset bộ thẻ mẫu:', err);
  }
}
