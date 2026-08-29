# Quy Chuẩn Lập Trình & Kiến Trúc Hệ Thống VieJap (VieJap Architecture & Engineering Standards)

Tài liệu này là **Quy tắc cốt lõi bắt buộc (Mandatory Workspace Rules)** của dự án **VieJap**. Tất cả lập trình viên và AI Agents từ đây về sau khi phát triển bất kỳ tính năng, bài học, thể động từ hay trang mới đều **bắt buộc tuân thủ 100%** theo các quy chuẩn dưới đây.

---

## 1. Sơ Đồ Kiến Trúc Chuẩn Hóa (Feature-Driven & Folder-per-Entity)

Hệ thống được tổ chức phân tầng rõ ràng theo 2 khối chính:
1. `core/`: Nền tảng cốt lõi dùng chung (Layout, Config, Shared components).
2. `features/`: Các nhánh chức năng nghiệp vụ độc lập, mỗi thực thể nằm trọn vẹn trong một thư mục riêng (Folder-per-Entity).

```
src/app/
├── core/                                # CỐT LÕI HỆ THỐNG
│   ├── layout/                          # Layout chung: header, footer, sakura
│   │   ├── header/                      # Header navigation
│   │   ├── footer/                      # Footer & thông tin liên hệ
│   │   └── sakura/                      # Hiệu ứng hoa anh đào
│   ├── config/                          # Cấu hình app, menu điều hướng (app.config.ts)
│   └── shared/                          # Component dùng chung toàn app (loading spinner...)
│
├── features/                            # CÁC NHÁNH CHỨC NĂNG NGHIỆP VỤ
│   │
│   ├── learning/                        # 🌸 NHÁNH 1: HỌC TIẾNG NHẬT (JAPANESE LEARNING)
│   │   ├── alphabet/                    # Bảng chữ cái
│   │   │   ├── hiragana/                # Học Hiragana, vẽ nét chữ, quiz
│   │   │   └── katakana/                # Học Katakana, vẽ nét chữ, quiz
│   │   │
│   │   ├── lessons/                     # Bài học theo giáo trình / chủ đề
│   │   │   ├── minna/                   # Giáo trình Minna no Nihongo
│   │   │   │   └── lesson-1/            # Bài 1 (page, data, speech, progress)
│   │   │   │   # Tương lai: lesson-2/, lesson-3/...
│   │   │   ├── numbers/                 # Bài học Số đếm tiếng Nhật
│   │   │   └── kanji/                   # Hán tự
│   │   │       ├── kanji-n5/            # Bài học Kanji N5 (page, data, progress, canvas)
│   │   │       └── tools/               # Công cụ tra cứu Kanji (kanji-tools-page)
│   │   │
│   │   ├── verb-forms/                  # Module luyện chia 12 thể động từ
│   │   │   ├── engine/                  # Unified Verb Form Engine
│   │   │   │   ├── verb-form-arena.component.ts   # Logic phản xạ, Tokyo TTS, auto-collapse
│   │   │   │   ├── verb-form-arena.component.html # Template chuẩn hóa (Lý thuyết + Luyện tập)
│   │   │   │   ├── verb-form-arena.component.scss # Styles SCSS
│   │   │   │   ├── verb-form-arena-styles.scss    # Token thiết kế dùng chung
│   │   │   │   ├── verb-form-arena.models.ts      # Interfaces (ConjugationVerb, VerbFormConfig...)
│   │   │   │   └── verb-form-configs.ts           # Central Registry đăng ký config 12 thể
│   │   │   │
│   │   │   ├── forms/                   # 12 THƯ MỤC RIÊNG BIỆT CHO TỪNG THỂ ĐỘNG TỪ
│   │   │   │   ├── te-form/             # Thể て (te-form-page.ts, te-form-data.ts)
│   │   │   │   ├── ta-form/             # Thể quá khứ た (ta-form-page.ts, ta-form-data.ts)
│   │   │   │   ├── nai-form/            # Thể phủ định ない (nai-form-page.ts, nai-form-data.ts)
│   │   │   │   ├── ru-form/             # Thể từ điển る (ru-form-page.ts, ru-form-data.ts)
│   │   │   │   ├── volitional-form/     # Thể ý chí よう (volitional-form-page.ts, volitional-form-data.ts)
│   │   │   │   ├── imperative-form/     # Thể mệnh lệnh 命令 (imperative-form-page.ts, imperative-form-data.ts)
│   │   │   │   ├── prohibitive-form/    # Thể cấm chỉ 禁止 (prohibitive-form-page.ts, prohibitive-form-data.ts)
│   │   │   │   ├── potential-form/      # Thể khả năng 可能 (potential-form-page.ts, potential-form-data.ts)
│   │   │   │   ├── conditional-form/    # Thể điều kiện 条件 (conditional-form-page.ts, conditional-form-data.ts)
│   │   │   │   ├── passive-form/        # Thể bị động 受身 (passive-form-page.ts, passive-form-data.ts)
│   │   │   │   ├── causative-form/      # Thể sai khiến 使役 (causative-form-page.ts, causative-form-data.ts)
│   │   │   │   └── causative-passive-form/ # Thể sai khiến bị động 使役受身
│   │   │   │
│   │   │   └── hub/                     # Trung tâm luyện tập tổng hợp (practice-hub-page.*)
│   │   │
│   │   └── services/                    # Dịch vụ âm thanh Tokyo TTS (japanese-audio.service.ts)
│   │
│   ├── jobs/                            # 💼 NHÁNH 2: ĐƠN HÀNG XKLĐ & VIỆC LÀM NHẬT BẢN
│   │   ├── pages/                       # Danh sách đơn hàng & Chi tiết đơn hàng
│   │   ├── components/                  # Bảng lọc & thẻ đơn hàng (job-order-board)
│   │   ├── services/                    # API đơn hàng (job-orders-api.service.ts)
│   │   └── models/                      # Interface đơn hàng (job-order.model.ts)
│   │
│   ├── tools/                           # 🛠️ NHÁNH 3: TIỆN ÍCH & CÔNG CỤ HỖ TRỢ
│   │   ├── student-form/                # Khai sơ yếu lý lịch học viên & xuất Excel
│   │   └── poster-maker/                # Thiết kế poster tuyển dụng & tuyên truyền
│   │
│   ├── public/                          # 🌐 NHÁNH 4: TRANG THÔNG TIN CHUNG
│   │   ├── home/                        # Trang chủ VieJap
│   │   ├── about/                       # Giới thiệu & Lộ trình
│   │   └── support/                     # FAQ, Chính sách bảo mật, Điều khoản, Hướng dẫn
│   │
│   └── admin/                           # 🔐 NHÁNH 5: CỔNG QUẢN TRỊ NỘI BỘ (ADMIN PORTAL)
│       ├── pages/                       # Trang quản trị chính & Đăng nhập
│       ├── components/                  # Quản lý đơn hàng admin (job-orders-admin)
│       ├── guards/                      # Guard bảo vệ route (admin-auth.guard.ts)
│       └── services/                    # Dịch vụ xác thực admin (admin-auth.service.ts)
│
├── app.config.ts                        # Cấu hình Angular Providers
├── app.routes.ts                        # Hệ thống định tuyến toàn app (lazy load routes sạch)
├── app.ts                               # App Root Component
├── app.html                             # App Root Template
└── app.scss                             # App Root SCSS
```

---

## 2. Quy Tắc Bắt Buộc: Độc Lập Từng Thực Thể (Folder-per-Entity Rule)

1. **Tuyệt đối KHÔNG gom chung nhiều thực thể vào một thư mục phẳng**:
   - Không đặt nhiều bài học khác nhau trong cùng 1 thư mục.
   - Không đặt nhiều thể động từ khác nhau trong cùng 1 thư mục `pages/` hay `data/`.
2. **Mỗi thực thể (Bài học, Thể động từ, Công cụ) phải sở hữu 1 thư mục riêng**:
   - Thư mục đó chứa trọn vẹn: Component (`.ts`, `.html`, `.scss`), Data (`.data.ts`), Service cục bộ và Models riêng nếu có.
   - Khi chỉnh sửa hoặc xóa một thực thể, chỉ cần thao tác duy nhất trên thư mục đó mà không làm ảnh hưởng đến các thực thể khác.

---

## 3. Quy Trình Chuẩn Khi Tạo Thể Động Từ Mới (5 Bước)

Khi tạo một thể động từ mới (ví dụ: `honorific-form` - Thể kính ngữ):

- **Bước 1: Tạo thư mục riêng cho thể mới**
  `src/app/features/learning/verb-forms/forms/<form-name>/`
  (ví dụ: `src/app/features/learning/verb-forms/forms/honorific-form/`)

- **Bước 2: Tạo file từ vựng dữ liệu**
  `src/app/features/learning/verb-forms/forms/<form-name>/<form-name>-data.ts`
  Khai báo mảng `ConjugationVerb[]` gồm 30-50+ từ vựng thông dụng (Hán tự, Hiragana, Thể mục tiêu, Nghĩa tiếng Việt, Âm Hán Việt, Nhóm 1/2/3).

- **Bước 3: Khai báo cấu hình `VerbFormConfig` trong `engine/verb-form-configs.ts`**
  ```typescript
  import { HONORIFIC_FORM_VERBS } from '../forms/honorific-form/honorific-form-data';

  export const HONORIFIC_FORM_CONFIG: VerbFormConfig = {
    formId: 'honorific',
    jpBadge: '尊敬語',
    shortBadge: '尊',
    title: 'Luyện chia Thể Kính ngữ',
    subtitle: 'Honorific Form Practice',
    targetFormPrompt: 'Chia sang thể Kính ngữ',
    audioKeyword: 'そんけいご',
    verbs: HONORIFIC_FORM_VERBS,
    theory: { ... }, // Cấu trúc lý thuyết 3 nhóm, quy tắc, ví dụ trực quan
  };
  ```

- **Bước 4: Tạo Page Component Wrapper**
  `src/app/features/learning/verb-forms/forms/<form-name>/<form-name>-page.ts`
  ```typescript
  import { Component } from '@angular/core';
  import { VerbFormArenaComponent } from '../../engine/verb-form-arena.component';
  import { HONORIFIC_FORM_CONFIG } from '../../engine/verb-form-configs';

  @Component({
    selector: 'app-honorific-form-page',
    standalone: true,
    imports: [VerbFormArenaComponent],
    template: `<app-verb-form-arena [config]="config"></app-verb-form-arena>`,
  })
  export class HonorificFormPage {
    readonly config = HONORIFIC_FORM_CONFIG;
  }
  ```

- **Bước 5: Đăng ký Hệ thống & Menu Điều Hướng**
  1. **Routes (`src/app/app.routes.ts`)**: Đăng ký lazy load route với tiền tố `/luyen-the-...`.
  2. **Arena Links (`src/app/features/learning/verb-forms/engine/verb-form-arena.models.ts`)**: Thêm vào `ALL_VERB_FORM_LINKS` để hiển thị trong thanh chuyển nhanh thể.
  3. **Menu Header (`src/app/core/config/app.config.ts`)**: Thêm vào `APP_LEARNING_MENU` (mục `Luyện tập`).
  4. **Hoa rơi (`src/app/app.ts`)**: Thêm path vào `isPracticeMode` để tự động tắt hoa rơi giúp tập trung làm bài.

---

## 4. Quy Trình Chuẩn Khi Tạo Bài Học Mới (Minna, Kanji, Ngữ Pháp...)

Khi tạo một bài học mới (ví dụ: `minna-lesson-2`):

1. **Tạo thư mục riêng cho bài học**:
   `src/app/features/learning/lessons/minna/lesson-2/`
2. **Cấu trúc bên trong thư mục bài học**:
   - `minna-lesson-2-page.ts`: Logic component
   - `minna-lesson-2-page.html`: Template bài học
   - `minna-lesson-2-page.scss`: Style riêng
   - `minna-lesson-2.data.ts`: Dữ liệu từ vựng, ngữ pháp bài 2
   - `minna-lesson-2-progress.service.ts`: Lưu trữ tiến độ học viên
3. **Đăng ký route trong `app.routes.ts`**:
   ```typescript
   {
     path: 'hoc-minna-bai-2',
     title: 'Minna no Nihongo Bài 2 - VieJap',
     loadComponent: () =>
       import('./features/learning/lessons/minna/lesson-2/minna-lesson-2-page').then(
         (m) => m.MinnaLesson2Page,
       ),
   }
   ```

---

## 5. Quy Trình Chuẩn Khi Tạo Trang / Chức Năng Nghiệp Vụ Mới

1. **Xác định đúng nhánh nghiệp vụ (`features/<domain>/`)**:
   - Học tập $\rightarrow$ `features/learning/`
   - Việc làm / Đơn hàng $\rightarrow$ `features/jobs/`
   - Tiện ích / Công cụ $\rightarrow$ `features/tools/`
   - Trang chung $\rightarrow$ `features/public/`
   - Quản trị $\rightarrow$ `features/admin/`
2. **Luôn tạo thư mục riêng cho trang/tính năng mới**:
   - Ví dụ tạo công cụ tính thuế Nenkin: `src/app/features/tools/nenkin-calculator/`
   - Đặt đầy đủ `.ts`, `.html`, `.scss`, `.service.ts`, `.model.ts` trong thư mục đó.
3. **Không tạo file rời rạc ở thư mục cấp cao**:
   - Mọi model, service, component đều phải nằm đúng trong thư mục tính năng hoặc thư mục `core/` nếu thực sự dùng chung toàn app.

---

## 6. Quy Chuẩn Trải Nghiệm Học Tập (UX/UI Standard)

1. **Trạng thái hiển thị mặc định:** `currentView: 'theory'` (Học viên vào trang xem Lý thuyết trước, sau đó bấm nút chuyển sang Luyện tập).
2. **Tự động thu gọn Header:** Khi người dùng trả lời xong câu đầu tiên, header tự động thu gọn mượt mà và cuộn trang lên đầu để tối ưu không gian màn hình làm bài.
3. **Âm thanh chuẩn Tokyo:** Sử dụng `JapaneseAudioService` với giọng nữ phát thanh viên Tokyo, âm chuông đúng/sai qua Web Audio API.
4. **2 Chế độ luyện tập:**
   - **Trắc nghiệm 4 lựa chọn:** Sinh đáp án nhiễu thông minh.
   - **Ghép từ (Word Builder):** Tự động tạo ô chọn và khối đáp án.
5. **Thống kê điểm số:** Hiệu ứng lửa chuỗi đúng liên tiếp (`🔥 streak >= 3`), độ chính xác %, kỷ lục.
6. **Modal giải thích chi tiết:** Phân tích từng bước từ dạng gốc $\rightarrow$ công thức $\rightarrow$ đáp án.
