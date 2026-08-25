# Quy Chuẩn Lập Trình & Thiết Kế Module Học Tập (VieJap Learning Modules Standard)

Tài liệu này là quy tắc cốt lõi (Workspace Rule) bắt buộc tuân thủ khi phát triển bất kỳ tính năng, bài học hoặc module luyện tập chia thể động từ mới trên hệ thống **VieJap**.

---

## 1. Kiến Trúc Chuẩn Hóa Dùng Chung (Unified Verb Form Engine)
Tất cả các thể động từ (Thể て, Thể quá khứ た, Thể phủ định ない, Thể từ điển る, Thể ý chí よう, Thể khả năng, Thể sai khiến, Thể bị động, Thể điều kiện...) đều sử dụng chung một Engine giao diện và phản xạ:

```
src/app/
├── components/verb-form-arena/
│   ├── verb-form-arena.models.ts     # Interface chuẩn (ConjugationVerb, VerbFormConfig...)
│   ├── verb-form-arena.component.ts  # Logic xử lý phản xạ, audio Tokyo TTS, auto-collapse, 3 chế độ bài tập
│   ├── verb-form-arena.component.html# Template HTML chuẩn hóa 100% (Lý thuyết + Luyện tập)
│   ├── verb-form-arena.component.scss# Styles SCSS hoàn chỉnh kế thừa toàn bộ token thiết kế
│   └── verb-form-configs.ts          # Centralized config cho tất cả các thể động từ
│
└── pages/<module-name>/
    └── <module-name>-page.ts         # Page Component nhúng <app-verb-form-arena [config]="config">
```

---

## 2. Quy Chuẩn Cấu Hình Thể Mới (`VerbFormConfig`)
Khi tạo một thể động từ mới, chỉ cần khai báo cấu hình trong `verb-form-configs.ts`:
1. `formId: string`: Mã thể (ví dụ `'potential'`, `'imperative'`, `'passive'`).
2. `jpBadge: string`: Huy hiệu tiếng Nhật đầy đủ (ví dụ `'可能形'`).
3. `shortBadge: string`: Ký tự ngắn trên logo (ví dụ `'能'`).
4. `title: string`: Tiêu đề tiếng Việt (ví dụ `'Luyện chia Thể khả năng'`).
5. `subtitle: string`: Tiêu đề tiếng Anh (ví dụ `'Potential Form Practice'`).
6. `targetFormPrompt: string`: Câu nhắc làm bài (ví dụ `'Chia sang thể Khả năng'`).
7. `audioKeyword: string`: Từ phát âm kiểm tra âm thanh (ví dụ `'かのうけい'`).
8. `verbs: ConjugationVerb[]`: Danh sách 30-50+ từ vựng thông dụng kèm Hán tự, Hiragana, Thể mục tiêu, Nghĩa tiếng Việt, Âm Hán Việt, Nhóm (1, 2, 3).
9. `theory`: Cấu trúc lý thuyết gồm 3 nhóm (I, II, III), các thẻ quy tắc chia, ví dụ trực quan và thẻ ngoại lệ.

---

## 3. Quy Chuẩn Trải Nghiệm Học Tập (UX/UI Standard)
1. **Trạng thái hiển thị mặc định:** `currentView: 'theory'` (Học viên vào trang xem Lý thuyết trước, sau đó bấm nút chuyển sang Luyện tập).
2. **Tự động thu gọn Header:** Khi người dùng trả lời xong câu đầu tiên, header tự động thu gọn mượt mà và cuộn trang lên đầu để tối ưu không gian màn hình làm bài.
3. **Âm thanh chuẩn Tokyo:** Sử dụng `JapaneseAudioService` với giọng nữ phát thanh viên Tokyo, âm chuông đúng/sai qua Web Audio API.
4. **3 Chế độ luyện tập:**
   - **Trắc nghiệm 4 lựa chọn:** Sinh đáp án nhiễu thông minh.
   - **Ghép từ (Word Builder):** Tự động tạo ô chọn và khối đáp án.
   - **Bàn phím Hiragana / Dakuten ảo:** Đầy đủ phím chữ mềm, âm đục, phím xóa, nộp bài responsive 100% trên điện thoại.
5. **Thống kê điểm số:** Hiệu ứng lửa chuỗi đúng liên tiếp (`🔥 streak >= 3`), độ chính xác %, kỷ lục.
6. **Modal giải thích chi tiết:** Phân tích từng bước từ dạng gốc $\rightarrow$ công thức $\rightarrow$ đáp án.

---

## 4. Đăng Ký Hệ Thống & Menu Điều Hướng
Khi thêm bất kỳ module thể động từ nào:
1. **Định tuyến (`src/app/app.routes.ts`):** Đăng ký lazy load route với tiền tố `/luyen-the-...` và tiêu đề `<Tên bài học> - VieJap`.
2. **Menu Header (`src/app/models/app.config.ts`):** Thêm vào `APP_LEARNING_MENU` (trong mục `Luyện tập`) kèm huy hiệu `jpBadge` chuẩn.
3. **Quản lý hiệu ứng hoa rơi (`src/app/app.ts`):** Thêm đường dẫn vào `isPracticeMode` để tự động tắt hoa rơi giúp học viên tập trung làm bài.
