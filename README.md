# Life & Study Dashboard (Nhịp Sống & Học Tập)

Bảng điều khiển cá nhân hỗ trợ quản lý học tập, nhịp sinh học hằng ngày, Pomodoro, không gian thư giãn, thư viện tài liệu cục bộ và **Trợ lý AI dùng Gemini thật** (qua backend riêng, bảo mật API key).

---

## 🎨 Ngôn ngữ thiết kế (Design System)

- 🔵 **Xanh navy** (`#173b5f`, `#214d76`) là màu nhận diện thương hiệu chủ đạo; kết hợp sắc xanh đồng bộ cho **Lịch học tập** và **Thư viện tài liệu**.
- ☁️ **Nền sáng dịu mắt** (`#f5f6fa` và `#ffffff`), sử dụng khoảng trắng thoáng đãng, phân cấp thị giác rõ ràng qua card, bóng đổ nhẹ (`box-shadow`), trạng thái hover/focus sắc nét và chuyển động mượt mà.
- 🌈 **Phân khu sắc màu riêng biệt (Zone Accents)**:
  - 📚 **Lịch học tập & Tài liệu (Navy Blue)**: Giữ sự tập trung cao độ, chuẩn học thuật.
  - 🟢 **Nhịp sinh học (Emerald Green)**: Dòng thời gian thức dậy, ăn uống, thể dục, thư giãn, đi ngủ.
  - 🟠 **Khu vực nghỉ ngơi (Amber Orange)**: Đồng hồ Pomodoro (25p / 5p / 15p), bài tập duỗi người, theo dõi 8 ly nước.
  - 🟣 **Khu vực thư giãn (Rose Pink)**: Video YouTube, podcast, sách, sở thích cá nhân.
  - 🔮 **Trợ lý AI (Violet/Purple)**: Gemini giải toán, tư vấn lịch học, phân tích thời gian biểu.
- 📱 **Responsive toàn diện**: Tối ưu layout trên màn hình máy tính (sidebar cố định) lẫn thiết bị di động (bottom navigation bar, card co giãn linh hoạt).

---

## ✨ Tính năng chính

- 📂 **Trang "Tài liệu" mới (Document Library)**:
  - Kéo thả (Drag & Drop) hoặc chọn tệp trực tiếp từ máy tính.
  - Hỗ trợ các định dạng: PDF, Word (`.doc`, `.docx`), Excel (`.xls`, `.xlsx`, `.csv`), PowerPoint (`.ppt`, `.pptx`), Hình ảnh (`.png`, `.jpg`, `.webp`) và Tệp văn bản (`.txt`, `.md`).
  - Tìm kiếm tài liệu theo tên tức thì theo thời gian thực.
  - Bộ lọc loại tệp thông minh: Tất cả, PDF, Word, Bảng tính, Trình chiếu, Hình ảnh, Văn bản.
  - Hiển thị đầy đủ dung lượng tệp và ngày thêm.
  - Hỗ trợ tải xuống (download) và xóa tệp khỏi máy bất kỳ lúc nào.
  - **Lưu trữ cục bộ bằng IndexedDB**: Toàn bộ tệp lưu trực tiếp trong trình duyệt của người dùng, không tải lên bất kỳ máy chủ nào. Xử lý lỗi đầy bộ nhớ (`QuotaExceededError`) và lỗi không hỗ trợ trình duyệt rõ ràng.
- 📅 **Lịch học tập**: Phân loại theo môn học, thời lượng, mức độ ưu tiên (Cao / Trung bình / Thấp), bộ lọc Hôm nay / Tuần này / Tất cả.
- ⏰ **Nhịp sinh học**: Dòng thời gian trực quan cho các sinh hoạt trong ngày với biểu tượng và trạng thái đang diễn ra.
- ⏳ **Khu vực nghỉ ngơi**: Bộ bấm giờ Pomodoro linh hoạt 3 chế độ (25p / 5p / 15p), theo dõi 8 ly nước trong ngày và các bài tập giãn cơ nhanh.
- 🎧 **Khu vực thư giãn**: Trình phát nhúng YouTube (lofi, nhạc tập trung) dán link phát trực tiếp, ghi chú podcast, sách đang đọc và sở thích.
- 🤖 **Trợ lý AI (Gemini Pro/Flash)**:
  - Frontend gửi ngữ cảnh (bài tập, sinh hoạt, năng lượng 1–5, tâm trạng, giờ hiện tại) tới backend Node.js.
  - Backend gọi Google Generative AI bằng `GEMINI_API_KEY` an toàn, **không lộ key ra client**.
  - Tích hợp bộ kiểm chứng giải toán cục bộ (Local Math Verifier) trước khi đưa AI phân tích từng bước.

---

## 🚀 Hướng dẫn cài đặt & Chạy ứng dụng trên VS Code

### 1. Yêu cầu môi trường
- **Node.js 18 trở lên** (khuyến nghị LTS 20 hoặc 22): Kiểm tra bằng `node -v` và `npm -v`.
- Trình biên tập mã nguồn **Visual Studio Code**.

### 2. Cài đặt dependencies
1. Mở thư mục dự án trong VS Code.
2. Mở Terminal tích hợp (phím tắt `` Ctrl + ` `` hoặc `Terminal -> New Terminal`) và chạy:
   ```bash
   npm install
   ```

### 3. Cấu hình biến môi trường Gemini API
1. Tạo tệp `.env` ở thư mục gốc (sao chép từ `.env.example`):
   - Trên Linux/macOS: `cp .env.example .env`
   - Trên Windows (PowerShell): `Copy-Item .env.example .env`
2. Mở file `.env` và điền khóa API của bạn:
   ```env
   GEMINI_API_KEY=AIzaSy...your_gemini_api_key_here
   ```
3. Lưu file lại. *(Lưu ý: Không đổi tên thành `VITE_GEMINI_API_KEY` vì tiền tố `VITE_` sẽ đóng gói key vào mã frontend).*

### 4. Khởi chạy ứng dụng
- **Chạy cả Frontend và Backend cùng lúc (Khuyên dùng):**
  ```bash
  npm run dev:all
  ```
- **Hoặc chạy ở hai terminal riêng biệt:**
  - *Terminal 1 (Backend AI):* `npm run server` (Lắng nghe tại `http://127.0.0.1:8787`)
  - *Terminal 2 (Frontend Vite):* `npm run dev` (Mở tại `http://localhost:3000`)

Mở trình duyệt tại `http://localhost:3000` để bắt đầu trải nghiệm.

### 5. Kiểm tra biên dịch sản xuất (Production Build)
```bash
npm run build
```
Lệnh này sẽ thực thi kiểm tra kiểu dữ liệu với TypeScript (`tsc`) và đóng gói tài nguyên tối ưu vào thư mục `dist/`.

---

## 📋 Danh sách các file đã cập nhật & bổ sung

1. `src/types/index.ts`: Bổ sung kiểu dữ liệu `DocumentCategory`, `DocumentItem` và phân loại `SectionId` cho trang tài liệu.
2. `src/services/documentStorage.ts`: Xây dựng module quản lý cơ sở dữ liệu IndexedDB client-side (`life-study-dashboard`), xử lý lưu/đọc/xóa Blob và bắt lỗi hạn mức `QuotaExceededError`.
3. `src/features/documents/DocumentLibrary.tsx`: Thiết kế component thư viện tài liệu hoàn chỉnh: khu vực kéo thả (drag & drop), thẻ hero thống kê, thanh tìm kiếm, bộ lọc danh mục (PDF, Word, Sheet, Slide, Image, Text), nút tải xuống và xóa.
4. `src/styles/tokens.css`: Thiết lập hệ thống biến màu nhận diện Navy (`--primary: #173b5f`, `--study: #214d76`), soft background (`--bg: #f5f6fa`), và bảng màu phụ riêng cho từng khu vực (`--rhythm`, `--rest`, `--relax`, `--ai`).
5. `src/styles/global.css`: Bổ sung toàn bộ style UI cho trang tài liệu, typography, hover/focus state, custom scrollbar và hiệu ứng responsive trên mobile.
6. `src/components/layout/Sidebar.tsx` & `AppShell.tsx`: Bổ sung tab "Tài liệu" vào hệ thống điều hướng chính trên desktop và thanh bar mobile.
7. `src/app/App.tsx`: Tích hợp view `DocumentLibrary` vào luồng ứng dụng và lưu trạng thái vùng điều hướng.
8. `server/index.js` & `server/gemini.js`: Cơ chế proxy bảo mật API Key ở máy chủ, giao tiếp qua endpoint nội bộ `/api/chat`.
9. `README.md`: Cập nhật tài liệu hướng dẫn đầy đủ, quy chuẩn bảo mật và hướng dẫn vận hành.

---

## ⚠️ Các giới hạn kỹ thuật cần biết

1. **Hạn mức lưu trữ IndexedDB**: Tệp được lưu trực tiếp vào bộ nhớ cục bộ của trình duyệt. Tùy thuộc vào dung lượng ổ cứng khả dụng và chính sách của từng trình duyệt (Chrome, Safari, Firefox), nếu bộ nhớ đạt ngưỡng giới hạn, ứng dụng sẽ hiện thông báo lỗi tràn bộ nhớ để người dùng chủ động xóa bớt tệp cũ.
2. **Chế độ duyệt web ẩn danh (Private / Incognito Browsing)**: Dữ liệu trong IndexedDB có thể bị xóa ngay khi đóng cửa sổ ẩn danh hoặc bị giới hạn dung lượng lưu trữ thấp hơn bình thường. Nên sử dụng trình duyệt ở chế độ thông thường để lưu trữ lâu dài.
3. **Phạm vi lưu trữ theo thiết bị (Client-side Only)**: Vì mục tiêu bảo mật tối đa và bảo vệ quyền riêng tư, tài liệu lưu trên máy tính nào sẽ chỉ nằm trên máy tính đó, không tự động đồng bộ hóa sang thiết bị khác trừ khi người dùng tải tệp xuống và chuyển thủ công.
