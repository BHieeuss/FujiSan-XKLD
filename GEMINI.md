# VieJap Project Guidelines & Standards (Gemini & Coding Agents)

Xem chi tiết đầy đủ tại `AGENTS.md` và `CLAUDE.md`.

## Quy tắc cốt lõi:
1. **Feature-Driven & Folder-per-Entity:** Tuyệt đối không gom nhiều bài học, thể động từ hoặc trang vào một thư mục phẳng.
2. **Mọi chức năng đều phải có phân quyền:**
   - Đăng ký permission key tại `public/api/admin/_rbac.php`.
   - Kiểm tra Backend: `admin_require_permission($session, 'permission.key')`.
   - Kiểm tra Frontend: `auth.hasPermission('permission.key')`.
   - Chạy lệnh kiểm tra tự động trước khi hoàn tất: `npm run check:rbac`.
3. **Bảo toàn quyền Super Admin:** Tài khoản `admin` có toàn quyền 100%, không được khóa hay xóa.

