# Đặc tả thiết kế: AI Document Chat & Flashcards Ôn Thi (Giai Đoạn 2)

- **Ngày tạo:** 2026-11-08
- **Dự án:** Life & Study Dashboard
- **Trạng thái:** Đã phê duyệt ý tưởng, chuẩn bị triển khai

---

## 1. Mục tiêu & Tổng quan

Phát triển hệ thống học tập thông minh dựa trên tài liệu cá nhân:
1. **Document AI Chat (Hỏi đáp tài liệu với Gemini):**
   - Đọc trực tiếp tệp PDF, Ảnh, Văn bản, Bảng tính được lưu trong IndexedDB.
   - Drawer trượt chuyên dụng trong Thư viện tài liệu để hỏi đáp, tóm tắt, giải thích công thức toán học và trích xuất ý chính từ tài liệu với Gemini Multimodal.
2. **Hệ thống Ôn tập Flashcards & Trắc nghiệm Quiz:**
   - Tab mới trên thanh điều hướng chính (`SectionId = 'flashcards'`).
   - Tự động sinh bộ thẻ Flashcards và câu hỏi trắc nghiệm Quiz 4 đáp án từ tài liệu bằng Gemini, hoặc tạo thủ công.
   - Chế độ lật thẻ 3D với Spaced Repetition (Đã thuộc, Hơi nhớ, Chưa thuộc - tự động xếp thẻ chưa thuộc để ôn lại cuối phiên).
   - Chế độ Quiz trắc nghiệm chấm điểm tức thì, giải thích chi tiết và thống kê kết quả.

---

## 2. Kiến trúc thành phần (Component Architecture)

```
server/
├── index.js                     # Bổ sung endpoints: /api/document-chat, /api/generate-cards
└── gemini.js                    # Hỗ trợ inlineData base64 (Multimodal PDF/Image) và JSON mode

src/
├── types/index.ts               # Bổ sung Flashcard, QuizItem, Deck, DocumentChat types
├── services/
│   ├── documentParser.ts        # Chuyển đổi Blob thành base64 hoặc text trích xuất
│   └── flashcardStorage.ts      # Quản lý lưu trữ Decks & Card progress vào localStorage
├── features/
│   ├── documents/
│   │   ├── DocumentLibrary.tsx  # Nút mở AI Drawer cho từng tài liệu
│   │   └── DocumentAiDrawer.tsx # Drawer chat chuyên dụng với tệp đang chọn
│   └── flashcards/
│       ├── FlashcardsPage.tsx   # Trang chính quản lý bộ thẻ (Deck list & chọn chế độ)
│       ├── FlashcardStudyView.tsx # Chế độ lật thẻ 3D & Spaced Repetition
│       ├── QuizStudyView.tsx    # Chế độ trắc nghiệm 4 đáp án tính điểm
│       └── DeckModal.tsx        # Modal tạo/sửa bộ thẻ và thêm thẻ thủ công
├── components/layout/
│   └── Sidebar.tsx              # Thêm tab "Ôn tập" (Flashcards) vào menu
└── data/options.ts              # Thêm NAV item cho 'flashcards'
```

---

## 3. Chi tiết thiết kế kỹ thuật

### 3.1. Backend Endpoints (`server/index.js` & `server/gemini.js`)
- **`POST /api/document-chat`**:
  - Nhận payload:
    ```ts
    interface DocumentChatRequest {
      message: string;
      history: Array<{ role: 'user' | 'assistant'; text: string }>;
      file: {
        name: string;
        mimeType: string;
        base64Data?: string; // Cho PDF và Image
        textData?: string;   // Cho văn bản / CSV
      };
    }
    ```
  - Nếu có `base64Data`: Gửi kèm `inlineData: { mimeType, data: base64Data }` trong mảng `contents.parts`.
  - Nếu có `textData`: Ghép vào prompt hệ thống làm ngữ cảnh tài liệu.
  - Trả về `{ reply: string }`.

- **`POST /api/generate-cards`**:
  - Nhận payload: `{ file: { name, mimeType, base64Data?, textData? }, count?: number }`.
  - System prompt ép Gemini xuất định dạng JSON thuần túy (JSON Schema / strict formatting):
    ```json
    {
      "deckTitle": "Tiêu đề bộ thẻ",
      "summary": "Tóm tắt ngắn tài liệu",
      "flashcards": [
        { "id": "card-1", "question": "Câu hỏi", "answer": "Đáp án giải thích chi tiết" }
      ],
      "quizzes": [
        {
          "id": "quiz-1",
          "question": "Câu hỏi trắc nghiệm",
          "options": ["Lựa chọn A", "Lựa chọn B", "Lựa chọn C", "Lựa chọn D"],
          "correctIndex": 0,
          "explanation": "Giải thích vì sao A đúng"
        }
      ]
    }
    ```
  - Backend parse và validate JSON trước khi phản hồi về Client: `{ ok: true, data: ... }`.

### 3.2. Quản lý Dữ liệu Phía Client (`flashcardStorage.ts`)
- Schema lưu trữ:
  ```ts
  export interface Flashcard {
    id: string;
    question: string;
    answer: string;
    status?: 'new' | 'learning' | 'mastered';
    lastReviewed?: string;
  }

  export interface QuizItem {
    id: string;
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  }

  export interface Deck {
    id: string;
    title: string;
    sourceDocumentId?: string;
    sourceDocumentName?: string;
    summary?: string;
    createdAt: string;
    cards: Flashcard[];
    quizzes: QuizItem[];
  }
  ```
- Khóa lưu trữ: `localStorage` `'life-study-decks'`.

### 3.3. Document AI Drawer (`DocumentAiDrawer.tsx`)
- Hiển thị trượt mượt mà từ cạnh phải màn hình khi người dùng bấm vào biểu tượng hoặc nút "Hỏi đáp AI" của tệp.
- Thanh công cụ trên cùng:
  - Tên tệp, huy hiệu loại tệp (PDF, Word, TXT, Image).
  - Nút tác vụ nổi bật: *"Tạo Flashcards & Quiz"* (tự động gọi API, hiển thị hiệu ứng loading sinh thẻ, sau đó điều hướng thẳng tới tab Ôn tập).
- Luồng hội thoại:
  - Khung chat tách biệt với Chat AI chung, chỉ tập trung vào ngữ cảnh tài liệu này.
  - Chips gợi ý câu hỏi: "Tóm tắt đề cương", "Tìm 5 định nghĩa quan trọng", "Đưa ra bài tập tự luyện".

### 3.4. Trang Ôn Tập Flashcards (`FlashcardsPage.tsx`)
- **Quản lý danh sách Deck**:
  - Card hiển thị từng bộ thẻ với số lượng thẻ, số câu quiz, ngày tạo.
  - Các nút hành động: "Lật thẻ", "Làm Quiz", "Thêm thẻ thủ công", "Xóa bộ thẻ".
- **Chế độ Lật thẻ (FlashcardStudyView)**:
  - Thẻ 3D với hiệu ứng lật card (`transform: rotateY(180deg)`), hiển thị câu hỏi mặt trước và lời giải mặt sau khi click.
  - 3 nút xếp loại học tập:
    + ❌ **Chưa thuộc**: Đưa thẻ xuống cuối danh sách để lật lại trong phiên này.
    + ⚠️ **Hơi nhớ**: Giữ nguyên trạng thái ôn.
    + ✅ **Đã thuộc**: Đánh dấu thẻ đã làm chủ kiến thức (`mastered`).
  - Thanh tiến trình phần trăm hoàn thành và màn hình chúc mừng khi hoàn tất phiên.
- **Chế độ Trắc nghiệm (QuizStudyView)**:
  - Hiển thị từng câu hỏi với 4 nút đáp án A, B, C, D.
  - Khi click: Ngay lập tức đổi màu đáp án đúng (xanh) và đáp án sai (đỏ nếu chọn sai), mở hộp giải thích chi tiết.
  - Nút "Câu tiếp theo".
  - Màn hình kết quả: Tổng số câu đúng, tỷ lệ % đạt, nút "Làm lại bài".

---

## 4. Xử lý lỗi & Tình huống biên (Edge Cases)

1. **Giới hạn kích thước tệp tải lên AI**: Nếu file vượt quá 20MB, thông báo nhắc người dùng chọn tệp rút gọn hoặc sử dụng trích xuất văn bản.
2. **Không có GEMINI_API_KEY**: Drawer hiển thị cảnh báo hướng dẫn điền key vào `.env` như hệ thống chat hiện có.
3. **Phản hồi JSON của AI bị lỗi format**: Backend áp dụng regex bóc tách JSON và tự động sửa các dấu phẩy hoặc escape character trước khi parse; nếu parse thất bại sẽ trả về thông báo lỗi thân thiện.
4. **Không có tài liệu nào**: Trang Ôn tập vẫn cho phép người dùng tự tạo Deck và nhập các thẻ thủ công theo ý muốn.

---

## 5. Kế hoạch kiểm thử & Xác thực

1. **Kiểm tra TypeScript & Build:** Chạy `npm run build` không có lỗi cú pháp hay types.
2. **Kiểm tra API Backend:** Test endpoints `/api/document-chat` và `/api/generate-cards` với file văn bản và base64.
3. **Kiểm tra luồng lật thẻ 3D:** Kiểm tra thao tác lật mặt trước/mặt sau và phân loại trạng thái học.
4. **Kiểm tra Quiz:** Xác nhận việc chọn đúng/sai hiển thị chính xác và tính điểm chuẩn.
5. **Kiểm tra lưu trữ:** Kiểm tra các Deck mới tạo lưu và đọc thành công từ `localStorage`.
