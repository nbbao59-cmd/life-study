# Đặc tả thiết kế: Soundboard Tập Trung & Sổ Tay Nhanh (Quick Notes)

- **Ngày tạo:** 2026-11-08
- **Dự án:** Life & Study Dashboard
- **Trạng thái:** Đã phê duyệt ý tưởng, chuẩn bị triển khai

---

## 1. Mục tiêu & Tổng quan

Nâng cấp trải nghiệm học tập và nghỉ ngơi cho bảng điều khiển Life & Study với 2 tính năng trọng tâm:
1. **Soundboard Tập trung toàn cục (Global Focus Soundboard):**
   - Mini Player nổi (Floating Widget) phát âm thanh nền liên tục khi chuyển giữa các trang (Lịch học, Nghỉ ngơi, Thư viện tài liệu, AI Assistant).
   - Kết hợp âm thanh thuật toán tự tạo (Web Audio API Procedural Synthesis: Mưa rào, Sóng biển, Tiếng ồn trắng/nâu) và mẫu âm thanh lặp (Audio Loops: Cà phê, Lửa trại, Tiếng chim).
   - Bộ điều chỉnh âm lượng riêng biệt cho từng kênh + Master Volume + Hẹn giờ tắt (Sleep Timer: 15/30/45/60 phút).
2. **Pomodoro nâng cấp & Sổ tay nhanh (Quick Notes):**
   - Cho phép nhập Mục tiêu phiên học (Session Goal) trước khi khởi động Pomodoro.
   - Chuông kết thúc phiên nhẹ nhàng (Web Audio chime) và ghi nhật ký các phiên hoàn thành trong ngày vào `localStorage`.
   - Thẻ Sổ tay nhanh (Scratchpad / Quick Checklist) gắn liền bên cạnh đồng hồ Pomodoro, tự động lưu thời gian thực.

---

## 2. Kiến trúc thành phần (Component Architecture)

```
src/
├── services/
│   └── soundEngine.ts            # Web Audio API synthesis + Audio loop manager
├── context/
│   └── SoundContext.tsx          # React Context cung cấp state âm thanh toàn cục
├── components/
│   └── soundboard/
│       ├── SoundboardWidget.tsx  # Nút nổi góc dưới + Popover Mixer
│       └── ChannelSlider.tsx     # Điều khiển âm lượng và bật/tắt từng kênh
├── features/
│   └── rest/
│       ├── RestZone.tsx          # Tích hợp Pomodoro nâng cấp & bố cục mới
│       ├── QuickNotesCard.tsx    # Sổ tay nhanh / Checklist ghim
│       └── SessionHistoryCard.tsx# Danh sách phiên Pomodoro trong ngày
└── types/
    └── index.ts                  # Mở rộng types: SoundChannel, PomodoroSession, QuickNote
```

---

## 3. Chi tiết thiết kế kỹ thuật

### 3.1. Sound Engine (`soundEngine.ts`)
- **Web Audio API Context**: Quản lý một `AudioContext` duy nhất. Tự động `resume()` khi người dùng tương tác đầu tiên (khắc phục chính sách Autoplay của trình duyệt).
- **Procedural Audio Nodes**:
  - `Rain`: White noise buffer kết hợp Low-pass BiquadFilter (cut-off ~800Hz) và Gain LFO nhẹ tạo độ nhấp nhô của hạt mưa.
  - `Waves`: Pink noise buffer qua Band-pass filter được điều biến bởi Sine LFO (0.08Hz - 0.12Hz) tạo nhịp triều dạt vào bờ.
  - `White/Brown Noise`: Noise generator qua low-shelf / high-cut filter tạo âm thanh êm dịu, triệt tiêu tiếng ồn môi trường.
- **Audio Loops**:
  - `Cafe`, `Campfire`, `Birds`: Tải các đoạn âm thanh nhẹ (base64 hoặc URL blob cục bộ / asset miễn phí ngắn) loop liên tục với HTML5 `Audio` node hoặc `AudioBufferSourceNode`.
- **Master & Individual Gain Nodes**:
  - Mỗi kênh có `GainNode` riêng (0.0 - 1.0).
  - Đầu ra tất cả các kênh được nối vào một `masterGainNode` chung trước khi ra `audioContext.destination`.
- **Sleep Timer**:
  - Sử dụng `setInterval` đếm ngược. Khi còn 30 giây cuối, thực hiện `linearRampToValueAtTime` để giảm dần âm lượng (fade-out) êm ái trước khi dừng hoàn toàn.

### 3.2. Global Sound Context & Floating Widget (`SoundContext.tsx` & `SoundboardWidget.tsx`)
- Context quản lý trạng thái:
  - `isPlayingMaster: boolean`
  - `masterVolume: number` (0 - 100)
  - `channels: Record<ChannelId, { enabled: boolean; volume: number }>`
  - `sleepTimerRemaining: number | null`
- Floating Button đặt tại góc dưới bên phải màn hình (`position: fixed; bottom: 24px; right: 24px; z-index: 100`).
- Khi click: Hiển thị Mixer Card hiện đại, có bóng đổ mềm mại, chuyển động mượt theo design system Navy/Modern.

### 3.3. Pomodoro Mục tiêu & Nhật ký (`RestZone.tsx` & `SessionHistoryCard.tsx`)
- **Mục tiêu phiên (Session Target)**:
  - Input field nằm ngay dưới đồng hồ: *"Mục tiêu phiên này của bạn là gì? (vd: Học Toán giải tích)"*.
  - Khi bấm *Bắt đầu*: Cố định mục tiêu phiên này.
- **Kết thúc phiên**:
  - Phát âm thanh chuông báo kết thúc (âm sắc chime thanh thoát bằng Web Audio oscillator).
  - Tự động ghi vào mảng `sessions` trong `localStorage`:
    ```ts
    interface PomodoroSession {
      id: string;
      goal: string;
      mode: 'focus' | 'short' | 'long';
      durationMinutes: number;
      completedAt: string; // ISO string
    }
    ```
- **Session History Card**:
  - Hiển thị danh sách các phiên trong ngày hôm nay, tổng thời gian tập trung (vd: `2 giờ 15 phút tập trung`).
  - Nút xóa lịch sử hoặc làm mới cho ngày mới.

### 3.4. Sổ tay nhanh Scratchpad (`QuickNotesCard.tsx`)
- Hai tab chế độ tiện ích:
  1. **To-Do Checklist**: Thêm việc nhanh cần làm trong lúc học, gạch ngang khi xong.
  2. **Ghi chú tự do (Freeform Scratchpad)**: Textarea tự động co giãn ghi chú tức thời những suy nghĩ phát sinh để không làm đứt đoạn tập trung.
- Dữ liệu lưu tức thì vào `localStorage` (`life-study-scratchpad`).
- Nút copy nhanh toàn bộ nội dung ra clipboard.

---

## 4. Xử lý lỗi & Tình huống biên (Edge Cases)

1. **Browser Autoplay Policy**: `AudioContext` ở trạng thái `suspended` nếu chưa có thao tác click từ người dùng. Giải pháp: Lắng nghe sự kiện kích hoạt đầu tiên trên UI để `ctx.resume()`.
2. **Tab Hidden / Background Throttle**: Web Audio API vẫn tiếp tục phát khi chuyển tab mà không bị ngắt quãng.
3. **Bộ nhớ cục bộ (Storage Quota)**: `QuickNotes` và `SessionHistory` sử dụng chuỗi JSON nhỏ vài KB trong `localStorage`, có cơ chế dọn dẹp phiên của ngày cũ (> 7 ngày).

---

## 5. Kế hoạch kiểm thử & Xác thực (Verification Plan)

1. **Kiểm tra TypeScript & Build:** Chạy `npm run build` đảm bảo không có lỗi type nào trong codebase.
2. **Kiểm tra âm thanh:** Bật từng kênh âm thanh (Mưa, Sóng, Ồn nâu, Cafe...), điều chỉnh thanh trượt âm lượng và kiểm tra tính năng tắt/bật tổng.
3. **Kiểm tra Sleep Timer:** Hẹn giờ tắt nhạc và xác nhận âm lượng fade-out đúng thời điểm.
4. **Kiểm tra Pomodoro & Lưu trữ:** Chạy thử phiên tập trung ngắn, kiểm tra chuông kết thúc và dữ liệu ghi nhận trong `localStorage`.
5. **Kiểm tra Responsive:** Giao diện nút nổi và các card hiển thị chuẩn mực trên cả màn hình desktop lẫn thiết bị di động.
