# AI Document Chat & Flashcards Ôn Thi Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Xây dựng tính năng Hỏi đáp tài liệu với Gemini AI (Document AI Chat Drawer) và Không gian Ôn tập thẻ ghi nhớ Flashcard 3D kết hợp Trắc nghiệm Quiz tự sinh từ đề cương/tài liệu.

**Architecture:** Mở rộng backend Node.js hỗ trợ Gemini Multimodal (PDF, Image base64 và văn bản trích xuất), cung cấp endpoint `/api/document-chat` và `/api/generate-cards`. Phía frontend xây dựng `DocumentAiDrawer` trượt từ cạnh phải, thêm tab `flashcards` với `FlashcardsPage`, `FlashcardStudyView` (lật thẻ 3D + Spaced Repetition) và `QuizStudyView` (trắc nghiệm chấm điểm tức thì).

**Tech Stack:** React 18, TypeScript, Vite, Node.js HTTP Server, Google Gemini 1.5/2.0/3.0 Multimodal REST API, Lucide React, CSS 3D transforms.

## Global Constraints

- Không làm rò rỉ `GEMINI_API_KEY` ra frontend; mọi tương tác AI đều đi qua server proxy.
- File PDF và Image truyền qua `inlineData: { mimeType, data: base64 }` để Gemini đọc nguyên gốc công thức, sơ đồ và bảng biểu.
- Lưu trữ Decks và Flashcards trên `localStorage` (`life-study-decks`) độc lập, tin cậy.
- Đảm bảo hiệu ứng lật thẻ 3D mượt mà trên cả desktop và mobile (`backface-visibility: hidden; transform-style: preserve-3d`).

---

### Task 1: Mở rộng Types và Điều hướng Navigation

**Files:**
- Modify: `src/types/index.ts`
- Modify: `src/data/options.ts`
- Modify: `src/components/layout/Sidebar.tsx`

**Interfaces:**
- Produces: `SectionId` có thêm `'flashcards'`, các kiểu `Flashcard`, `QuizItem`, `Deck`, `DocumentChatRequest`, `GenerateCardsResponse`

- [ ] **Step 1: Cập nhật `src/types/index.ts`**

Mở rộng `SectionId` và thêm các interfaces:
```ts
export type SectionId = 'dashboard' | 'study' | 'documents' | 'flashcards' | 'rhythm' | 'rest' | 'relaxation' | 'assistant';

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

- [ ] **Step 2: Cập nhật `src/data/options.ts` & `src/components/layout/Sidebar.tsx`**

Thêm mục `flashcards` ("Ôn tập", icon `GraduationCap` hoặc `Sparkles`/`Layers`) vào mảng `NAV` và navigation sidebar.

- [ ] **Step 3: Kiểm tra biên dịch TypeScript**

Chạy: `npm run build`
Kỳ vọng: PASS

- [ ] **Step 4: Commit thay đổi**

```bash
git add src/types/index.ts src/data/options.ts src/components/layout/Sidebar.tsx
git commit -m "feat(navigation): add flashcards section and domain types"
```

---

### Task 2: Cập nhật Backend Endpoints (`/api/document-chat` & `/api/generate-cards`)

**Files:**
- Modify: `server/gemini.js`
- Modify: `server/index.js`

**Interfaces:**
- Produces: 
  - `POST /api/document-chat`
  - `POST /api/generate-cards`

- [ ] **Step 1: Nâng cấp `server/gemini.js`**

Hỗ trợ `inlineData` cho Gemini REST request:
- Xây dựng hàm `askGeminiWithParts({ system, contents })` cho phép `contents` chứa các `parts` vừa có `text` vừa có `inlineData` (PDF/Image base64).
- Hàm `generateStructuredCards({ file, count })` gửi system prompt yêu cầu sinh JSON chính xác chứa `deckTitle`, `summary`, `flashcards`, `quizzes`. Bổ sung regex bóc tách JSON và tự động sửa các lỗi format phổ biến trước khi parse.

- [ ] **Step 2: Đăng ký router trong `server/index.js`**

- Định tuyến `POST /api/document-chat`: xác thực dữ liệu đầu vào, gọi Gemini và trả về `{ reply }`.
- Định tuyến `POST /api/generate-cards`: gọi `generateStructuredCards` và trả về `{ ok: true, data: { deckTitle, summary, flashcards, quizzes } }`.

- [ ] **Step 3: Kiểm tra khởi động server**

Chạy: `node server/index.js` (kiểm tra cú pháp không crash).

- [ ] **Step 4: Commit thay đổi**

```bash
git add server/gemini.js server/index.js
git commit -m "feat(server): add document-chat and generate-cards endpoints"
```

---

### Task 3: Client Services (`documentParser.ts`, `flashcardStorage.ts`, `aiDocumentClient.ts`)

**Files:**
- Create: `src/services/documentParser.ts`
- Create: `src/services/flashcardStorage.ts`
- Create: `src/services/aiDocumentClient.ts`

**Interfaces:**
- Produces:
  - `prepareFileForAi(blob: Blob, fileName: string): Promise<{ mimeType: string; base64Data?: string; textData?: string }>`
  - `listDecks(): Deck[]`, `saveDeck(deck: Deck): void`, `deleteDeck(id: string): void`, `updateCardStatus(...)`
  - `askDocumentChat(...)`, `generateCardsFromDocument(...)`

- [ ] **Step 1: Viết `src/services/documentParser.ts`**

Chuyển đổi Blob:
- Với text, md, csv: dùng `blob.text()`.
- Với pdf, png, jpg, webp: dùng `FileReader.readAsDataURL` và tách phần base64 sau dấu phẩy.

- [ ] **Step 2: Viết `src/services/flashcardStorage.ts`**

Cung cấp hàm đọc, ghi, cập nhật, xóa Deck và cập nhật trạng thái thẻ trong `localStorage` (`life-study-decks`). Cung cấp một bộ thẻ mẫu ban đầu (Sample Deck) nếu chưa có dữ liệu.

- [ ] **Step 3: Viết `src/services/aiDocumentClient.ts`**

Gọi tới `/api/document-chat` và `/api/generate-cards` với cơ chế xử lý lỗi rõ ràng (khi chưa có key, file quá lớn, hoặc lỗi kết nối).

- [ ] **Step 4: Kiểm tra biên dịch**

Chạy: `npm run build`
Kỳ vọng: PASS

- [ ] **Step 5: Commit thay đổi**

```bash
git add src/services/documentParser.ts src/services/flashcardStorage.ts src/services/aiDocumentClient.ts
git commit -m "feat(services): add document parser, flashcard storage, and ai client"
```

---

### Task 4: Giao diện Document AI Drawer (Hỏi đáp tài liệu)

**Files:**
- Create: `src/features/documents/DocumentAiDrawer.tsx`
- Modify: `src/features/documents/DocumentLibrary.tsx`
- Modify: `src/styles/global.css`

**Interfaces:**
- Consumes: `readDocument(id)` từ `documentStorage.ts`, `askDocumentChat`, `generateCardsFromDocument` từ `aiDocumentClient.ts`
- Produces: `<DocumentAiDrawer />` hiển thị khi click nút "Hỏi đáp AI" ở tệp tài liệu

- [ ] **Step 1: Tạo `DocumentAiDrawer.tsx`**

- Drawer trượt từ bên phải với nút Đóng (X).
- Header: Tên tệp, dung lượng, nút *"Tạo bộ Flashcards & Quiz"*.
- Chat Log riêng cho tệp với hiệu ứng gõ phím / loading bubble.
- Gợi ý câu hỏi nhanh (Chips): Tóm tắt tệp, Liệt kê thuật ngữ chính, Đặt câu hỏi ôn thi.
- Input gửi câu hỏi.

- [ ] **Step 2: Tích hợp vào `DocumentLibrary.tsx`**

- Thêm nút icon robot / chat AI trên mỗi hàng tài liệu: "Hỏi đáp AI".
- Khi click: Mở Drawer với tệp đó.
- Nút "Tạo bộ Flashcards & Quiz" từ Drawer tự động lưu Deck vào `flashcardStorage` và chuyển sang tab `flashcards`.

- [ ] **Step 3: Thêm CSS cho Drawer trong `src/styles/global.css`**

Thêm các class `.document-ai-drawer`, `.drawer-backdrop`, `.ai-badge`, `.drawer-header`.

- [ ] **Step 4: Kiểm tra biên dịch**

Chạy: `npm run build`
Kỳ vọng: PASS

- [ ] **Step 5: Commit thay đổi**

```bash
git add src/features/documents/ src/styles/global.css
git commit -m "feat(documents): implement document AI chat drawer"
```

---

### Task 5: Không Gian Ôn Tập & Quản Lý Deck (`FlashcardsPage.tsx`, `DeckModal.tsx`)

**Files:**
- Create: `src/features/flashcards/DeckModal.tsx`
- Create: `src/features/flashcards/FlashcardsPage.tsx`
- Modify: `src/app/App.tsx`
- Modify: `src/styles/global.css`

**Interfaces:**
- Consumes: `flashcardStorage.ts`, types `Deck`, `Flashcard`, `QuizItem`
- Produces: Tab `flashcards` hoàn chỉnh với giao diện quản lý Deck

- [ ] **Step 1: Tạo `DeckModal.tsx`**

Modal cho phép:
- Đặt tên bộ thẻ.
- Nhập tóm tắt / mô tả.
- Thêm từng thẻ câu hỏi / câu trả lời thủ công.

- [ ] **Step 2: Tạo `FlashcardsPage.tsx`**

- Header: Thống kê tổng số bộ thẻ, tổng số thẻ đã thuộc (`mastered`).
- Danh sách Deck dạng lưới (Grid cards):
  + Tên bộ thẻ, nguồn tài liệu (nếu sinh từ file).
  + Số lượng Flashcard, số câu Quiz.
  + Các nút hành động: "Lật thẻ ôn tập" (vào FlashcardStudyView), "Làm Quiz trắc nghiệm" (vào QuizStudyView), "Sửa", "Xóa".
- Nút "+ Tạo bộ thẻ mới" mở `DeckModal`.

- [ ] **Step 3: Nhúng vào `src/app/App.tsx`**

Render `<FlashcardsPage />` khi `section === 'flashcards'`.

- [ ] **Step 4: Kiểm tra biên dịch**

Chạy: `npm run build`
Kỳ vọng: PASS

- [ ] **Step 5: Commit thay đổi**

```bash
git add src/features/flashcards/DeckModal.tsx src/features/flashcards/FlashcardsPage.tsx src/app/App.tsx src/styles/global.css
git commit -m "feat(flashcards): implement deck management and flashcards page"
```

---

### Task 6: Chế Độ Lật Thẻ Flashcard 3D & Chế Độ Trắc Nghiệm Quiz

**Files:**
- Create: `src/features/flashcards/FlashcardStudyView.tsx`
- Create: `src/features/flashcards/QuizStudyView.tsx`
- Modify: `src/features/flashcards/FlashcardsPage.tsx`
- Modify: `src/styles/global.css`

**Interfaces:**
- Consumes: `Deck`, `Flashcard`, `QuizItem`
- Produces: Trải nghiệm ôn thi Spaced Repetition và Quiz

- [ ] **Step 1: Tạo `FlashcardStudyView.tsx`**

- Hiển thị thanh tiến trình (Thẻ X / N).
- Card lật 3D: Mặt trước là Câu hỏi, click để lật sang Mặt sau là Đáp án và Giải thích.
- 3 nút xếp loại học tập:
  + "Chưa thuộc" (đỏ): Đẩy thẻ xuống cuối hàng đợi để học lại trong phiên.
  + "Hơi nhớ" (vàng): Giữ nguyên.
  + "Đã thuộc" (xanh): Đánh dấu `mastered` và cập nhật vào storage.
- Màn hình chúc mừng khi hoàn thành toàn bộ thẻ kèm nút "Ôn lại" hoặc "Quay lại danh sách".

- [ ] **Step 2: Tạo `QuizStudyView.tsx`**

- Hiển thị câu hỏi + 4 đáp án A, B, C, D.
- Chọn đáp án: Hiển thị ngay màu xanh (đúng) hoặc đỏ (sai), mở hộp giải thích chi tiết.
- Nút "Câu tiếp theo".
- Màn hình kết quả: Số câu đúng / tổng số câu, tỷ lệ %, thông điệp khích lệ, nút "Làm lại Quiz".

- [ ] **Step 3: Thêm hiệu ứng 3D flip và Quiz styling trong `src/styles/global.css`**

Class `.flip-card`, `.flip-inner`, `.flip-front`, `.flip-back`, `.quiz-option`, `.quiz-correct`, `.quiz-incorrect`.

- [ ] **Step 4: Tích hợp View vào `FlashcardsPage.tsx`**

Chuyển đổi mượt mà giữa Deck list, Study view và Quiz view.

- [ ] **Step 5: Kiểm tra biên dịch**

Chạy: `npm run build`
Kỳ vọng: PASS

- [ ] **Step 6: Commit thay đổi**

```bash
git add src/features/flashcards/ src/styles/global.css
git commit -m "feat(flashcards): add 3D flip card study mode and quiz evaluation"
```

---

### Task 7: Xác thực toàn diện & Kiểm thử hoàn chỉnh (End-to-End Verification)

**Files:**
- Toàn bộ source code

- [ ] **Step 1: Type check & Production build**

Chạy: `npm run build`
Kỳ vọng: Đóng gói thành công không có lỗi TypeScript hay Vite build.

- [ ] **Step 2: Kiểm thử runtime với `start.bat`**

Xác nhận Backend nhận route mới, Frontend hiển thị trơn tru, không có xung đột cổng hay tài nguyên.

- [ ] **Step 3: Hoàn tất tài liệu và báo cáo kết quả**
