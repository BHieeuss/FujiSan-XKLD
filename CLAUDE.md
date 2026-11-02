# VieJap Architecture & Engineering Standards

Tài liệu hướng dẫn bắt buộc cho tất cả AI Coding Agents và lập trình viên phát triển dự án VieJap.

## 1. Kiến Trúc Chuẩn Hóa
- Xem tài liệu gốc tại `AGENTS.md`.
- Tuân thủ cấu trúc Folder-per-Entity: Mỗi thực thể nằm trọn vẹn trong một thư mục riêng (`.ts`, `.html`, `.scss`, `.data.ts`, `.service.ts`, `.models.ts`).
- Không tạo file rời rạc ở thư mục cấp cao.

## 2. Quy Tắc Bắt Buộc: Tích Hợp Phân Quyền (RBAC Mandate)
Bất kỳ khi nào phát triển tính năng mới, thêm API hoặc bổ sung nút thao tác (Thêm, Sửa, Xóa, Duyệt, Tải, Xuất...):
1. **Xác định quyền:** Đặt tên dạng `<module>.<action>`.
2. **Đăng ký tập trung:** Khai báo vào `public/api/admin/_rbac.php` (`admin_permission_registry()`) và `users-admin.models.ts`.
3. **Bảo vệ Frontend:** Dùng `auth.hasPermission('...')` để ẩn/hiện nút, menu và chặn truy cập URL trái phép.
4. **Bảo vệ Backend:** Bắt buộc gọi `admin_require_permission($session, '...')` trong API PHP.
5. **Bảo vệ Super Admin:** Tuyệt đối không xóa, không khóa và không hạ quyền của tài khoản `admin` (`Super Administrator`).
6. **Kiểm tra tự động:** Chạy `npm run check:rbac` (hoặc `php tests/audit_rbac_compliance.php`) để xác nhận không có quyền hoặc API nào bị bỏ sót.

## 3. Lệnh Phát Triển
- Khởi động dev server: `npm start`
- Quét kiểm tra tuân thủ phân quyền: `npm run check:rbac`
- Kiểm thử tích hợp RBAC: `php tests/test_rbac_full.php`
- Build Angular: `npm run build`

## 4. Quy Chuẩn Ngôn Ngữ Tiếng Việt
- Toàn bộ giao diện người dùng và trang quản trị VieJap ưu tiên 100% tiếng Việt gần gũi, dễ hiểu, tránh thuật ngữ kỹ thuật.
- Quy chuẩn và từ điển tập trung được lưu tại `src/app/core/config/admin-terminology.ts`.


