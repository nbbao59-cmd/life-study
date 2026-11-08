# Soundboard Tập Trung & Sổ Tay Nhanh (Quick Notes) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Xây dựng hệ thống Soundboard tập trung toàn cục (Web Audio API + Floating Mixer) và nâng cấp Pomodoro với Mục tiêu phiên, Lịch sử phiên và Sổ tay nhanh (Quick Notes).

**Architecture:** Sử dụng React Context (`SoundContext`) quản lý singleton `AudioContext` kết hợp các thuật toán sinh âm thanh thời gian thực (procedural synthesis: mưa, sóng, tiếng ồn nâu/trắng, chuông kết thúc phiên) và bộ điều khiển âm lượng độc lập. Nâng cấp `RestZone` chia layout grid chứa Pomodoro với ô nhập Goal, thẻ SessionHistory và thẻ QuickNotes tự động lưu `localStorage`.

**Tech Stack:** React 18, TypeScript, Web Audio API, Lucide React, CSS Variables / Modern Design System.

## Global Constraints

- Không dùng thư viện audio bên ngoài gây nặng bundle; 100% sử dụng native Web Audio API và HTML5 Audio.
- Đảm bảo tuân thủ Browser Autoplay Policy: tự động resume AudioContext khi có tương tác người dùng đầu tiên.
- Toàn bộ dữ liệu ghi chú và lịch sử phiên học lưu vào `localStorage` an toàn, phân tách key rõ ràng.
- Giữ vững design system màu Navy (`#173b5f`), Emerald Green, Amber Orange và soft shadow đồng bộ.

---

### Task 1: Định nghĩa kiểu dữ liệu (Types & Data Models)

**Files:**
- Modify: `src/types/index.ts`

**Interfaces:**
- Produces: `SoundChannelId`, `SoundChannelConfig`, `PomodoroSession`, `QuickChecklistItem`, `QuickNotesState`

- [ ] **Step 1: Mở rộng `src/types/index.ts`**

Bổ sung các types cho Soundboard và Pomodoro/QuickNotes:
```ts
export type SoundChannelId = 'rain' | 'waves' | 'whiteNoise' | 'brownNoise' | 'cafe' | 'campfire' | 'birds';

export interface SoundChannelConfig {
  id: SoundChannelId;
  name: string;
  icon: string;
  volume: number; // 0 - 100
  enabled: boolean;
}

export interface PomodoroSession {
  id: string;
  goal: string;
  mode: 'focus' | 'short' | 'long';
  durationMinutes: number;
  completedAt: string; // ISO string
}

export interface QuickChecklistItem {
  id: string;
  text: string;
  done: boolean;
}

export interface QuickNotesState {
  checklist: QuickChecklistItem[];
  freeText: string;
}
```

- [ ] **Step 2: Kiểm tra biên dịch TypeScript**

Chạy: `npm run build`
Kỳ vọng: PASS

- [ ] **Step 3: Commit thay đổi**

```bash
git add src/types/index.ts
git commit -m "feat(types): add soundboard, pomodoro session, and quick notes types"
```

---

### Task 2: Xây dựng Audio Engine (`soundEngine.ts`)

**Files:**
- Create: `src/services/soundEngine.ts`

**Interfaces:**
- Consumes: `SoundChannelId` từ `src/types/index.ts`
- Produces: `SoundEngine` class/singleton với các methods:
  - `init(): void`
  - `setMasterVolume(vol: number): void`
  - `setChannelVolume(id: SoundChannelId, vol: number): void`
  - `setChannelEnabled(id: SoundChannelId, enabled: boolean): void`
  - `stopAll(): void`
  - `playChime(): void`

- [ ] **Step 1: Viết `src/services/soundEngine.ts`**

Hiện thực tạo buffer tiếng ồn trắng (white noise), tiếng ồn hồng (pink noise), và tiếng ồn nâu (brown noise) bằng Web Audio API:
- `rain`: White noise qua BiquadFilter (lowpass 850Hz, Q=1.0) kết hợp gain modulaton nhẹ.
- `waves`: Pink noise qua BiquadFilter (bandpass 400Hz) điều biến bởi Sine LFO (0.1Hz) tạo nhịp dạt vào bờ.
- `whiteNoise`: White noise mộc qua lowpass 3000Hz làm dịu.
- `brownNoise`: Brownian noise lọc dải tần thấp ấm áp.
- `cafe`: Tổng hợp tiếng rì rầm và tần số lọc ấm.
- `campfire`: Brown noise + pulse ngẫu nhiên mô phỏng tiếng nổ lách tách của lửa.
- `birds`: Sine chirps ngẫu nhiên theo nhịp điệu sinh thái.
- `playChime()`: Hai dao động sóng sine hài hòa (528Hz & 792Hz) với envelope decay mượt mà thông báo hết phiên Pomodoro.

- [ ] **Step 2: Kiểm tra biên dịch TypeScript**

Chạy: `npm run build`
Kỳ vọng: PASS

- [ ] **Step 3: Commit thay đổi**

```bash
git add src/services/soundEngine.ts
git commit -m "feat(audio): implement procedural sound engine with web audio api"
```

---

### Task 3: Tạo SoundContext & SoundProvider toàn cục

**Files:**
- Create: `src/context/SoundContext.tsx`
- Modify: `src/app/App.tsx`

**Interfaces:**
- Consumes: `SoundEngine` từ `src/services/soundEngine.ts`, `SoundChannelId`, `SoundChannelConfig` từ `src/types`
- Produces: `SoundProvider`, hook `useSound()`

- [ ] **Step 1: Viết `src/context/SoundContext.tsx`**

Cung cấp state:
- `isPlayingMaster: boolean`
- `masterVolume: number`
- `channels: Record<SoundChannelId, SoundChannelConfig>`
- `sleepTimerMinutes: number | null`
- `sleepTimerRemaining: number | null`
- Các hàm điều khiển: `toggleMaster()`, `setMasterVolume(val)`, `toggleChannel(id)`, `setChannelVolume(id, val)`, `setSleepTimer(mins)`, `playChime()`.
- Tự động lưu thiết lập âm lượng vào `localStorage` (`life-study-sound-config`).

- [ ] **Step 2: Bọc `<SoundProvider>` trong `src/app/App.tsx`**

Bọc toàn bộ nội dung App bên trong `<SoundProvider>`.

- [ ] **Step 3: Kiểm tra biên dịch**

Chạy: `npm run build`
Kỳ vọng: PASS

- [ ] **Step 4: Commit thay đổi**

```bash
git add src/context/SoundContext.tsx src/app/App.tsx
git commit -m "feat(context): introduce global SoundContext and provider"
```

---

### Task 4: Giao diện Floating Soundboard Widget & CSS

**Files:**
- Create: `src/components/soundboard/SoundboardWidget.tsx`
- Create: `src/components/soundboard/ChannelRow.tsx`
- Modify: `src/styles/global.css`
- Modify: `src/components/layout/AppShell.tsx`

**Interfaces:**
- Consumes: `useSound()` từ `src/context/SoundContext.tsx`
- Produces: `<SoundboardWidget />` được render nổi trên mọi trang

- [ ] **Step 1: Tạo `ChannelRow.tsx`**

Hiển thị icon kênh âm thanh, tên kênh, nút bật/tắt (toggle) và thanh trượt slider âm lượng (0 - 100%).

- [ ] **Step 2: Tạo `SoundboardWidget.tsx`**

Hiển thị nút tròn nổi góc dưới phải (`position: fixed; bottom: 24px; right: 24px`).
Khi đang phát có hiệu ứng gợn sóng âm thanh (wave pulse animation).
Khi bấm mở popover:
- Header: Tiêu đề "Âm thanh tập trung", nút Tắt tất cả / Bật tất cả.
- Master Volume slider.
- Danh sách `ChannelRow` cho 7 kênh âm thanh (Mưa rào, Sóng biển, Ồn nâu, Ồn trắng, Quán cafe, Lửa trại, Tiếng chim).
- Sleep Timer selector: [Tắt, 15p, 30p, 45p, 60p].

- [ ] **Step 3: Thêm style CSS vào `src/styles/global.css`**

Thêm các class `.sound-widget-btn`, `.sound-popover`, `.channel-row`, `.wave-pulse`.

- [ ] **Step 4: Nhúng `SoundboardWidget` vào `AppShell.tsx`**

- [ ] **Step 5: Kiểm tra biên dịch & runtime**

Chạy: `npm run build`
Kỳ vọng: PASS

- [ ] **Step 6: Commit thay đổi**

```bash
git add src/components/soundboard/ src/styles/global.css src/components/layout/AppShell.tsx
git commit -m "feat(ui): add floating soundboard widget and mixer controls"
```

---

### Task 5: Component Sổ Tay Nhanh (Quick Notes Card)

**Files:**
- Create: `src/features/rest/QuickNotesCard.tsx`
- Modify: `src/styles/global.css`

**Interfaces:**
- Consumes: `QuickNotesState`, `QuickChecklistItem` từ `src/types`
- Produces: `<QuickNotesCard />`

- [ ] **Step 1: Viết `QuickNotesCard.tsx`**

Bao gồm:
- Header với 2 tab: "Việc cần làm" (Checklist) và "Ghi chú nháp" (Scratchpad).
- Tab Checklist: Ô thêm việc nhanh với phím Enter, checkbox tick gạch ngang, nút xóa từng mục.
- Tab Scratchpad: Textarea tự động co giãn theo nội dung, nút "Sao chép" (Copy to clipboard) và nút "Xóa nháp".
- Tự động đồng bộ vào `localStorage` key `'life-study-scratchpad'`.

- [ ] **Step 2: Thêm CSS cho QuickNotes trong `src/styles/global.css`**

- [ ] **Step 3: Kiểm tra biên dịch**

Chạy: `npm run build`
Kỳ vọng: PASS

- [ ] **Step 4: Commit thay đổi**

```bash
git add src/features/rest/QuickNotesCard.tsx src/styles/global.css
git commit -m "feat(rest): implement quick notes and scratchpad component"
```

---

### Task 6: Nâng cấp Pomodoro với Mục tiêu phiên & Lịch sử phiên

**Files:**
- Create: `src/features/rest/SessionHistoryCard.tsx`
- Modify: `src/features/rest/RestZone.tsx`

**Interfaces:**
- Consumes: `useSound()` để gọi `playChime()`, `PomodoroSession` từ `src/types`, `<QuickNotesCard />`
- Produces: Layout mới trong `RestZone`

- [ ] **Step 1: Tạo `SessionHistoryCard.tsx`**

- Hiển thị tổng số phiên hoàn thành hôm nay và tổng số phút tập trung.
- Danh sách các phiên hoàn thành với giờ (HH:mm), tên mục tiêu và badge thời lượng (25p).
- Nút "Xóa lịch sử hôm nay" (có confirm).

- [ ] **Step 2: Nâng cấp `RestZone.tsx`**

- Thêm ô nhập "Mục tiêu phiên tập trung" (Session Goal) ngay trên hoặc dưới vòng tròn Pomodoro.
- Khi bấm "Bắt đầu": Khóa input mục tiêu.
- Khi hết giờ (remaining === 0):
  + Gọi `playChime()` để phát chuông êm dịu.
  + Tự động thêm bản ghi vào `sessions` (lưu `localStorage` `'life-study-sessions'`).
- Tái cấu trúc grid layout của `RestZone`:
  + Cột 1: Pomodoro Card (vòng tròn đếm giờ + Goal input + điều khiển).
  + Cột 2: QuickNotesCard (Sổ tay nhanh).
  + Cột 3 (hoặc hàng dưới): Uống nước + Bài tập duỗi người + SessionHistoryCard.

- [ ] **Step 3: Kiểm tra biên dịch**

Chạy: `npm run build`
Kỳ vọng: PASS

- [ ] **Step 4: Commit thay đổi**

```bash
git add src/features/rest/SessionHistoryCard.tsx src/features/rest/RestZone.tsx
git commit -m "feat(pomodoro): add session goal tracking, chime alert, and history log"
```

---

### Task 7: Xác thực toàn diện & Kiểm thử hoàn chỉnh (End-to-End Verification)

**Files:**
- Kiểm tra toàn bộ source code

- [ ] **Step 1: Type check & Production build**

Chạy: `npm run build`
Kỳ vọng: Đóng gói thành công không có lỗi TypeScript hay Vite build.

- [ ] **Step 2: Kiểm tra chức năng thực tế qua lệnh chạy server**

Chạy kiểm tra server và web, xác nhận các endpoint và trang tải trơn tru.

- [ ] **Step 3: Tổng kết và hoàn tất**
