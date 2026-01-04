# Copilot Instructions for FujiSan Japan and VietNam Job

## 🧠 Ngôn ngữ sử dụng

- Luôn phản hòi bằng **Tiếng Việt**.
- **Tiếng Việt** trong tất cả phần chú thích, tên biến, tên hàm và phản hồi.

---

## 🌐 Ngữ cảnh dự án

Đây là một dự án **website chương trình việc làm tại nhật bản**, xây dựng bằng **Angular**

### ✨ Frontend

- Giao diện màu chủ đạo là xanh dương đậm có thể phối với các màu khác để tạo điểm nhấn.
- Dùng **Bootstrap 5** (⚠️ Không dùng Bootstrap 3 hoặc 4).
- Có thể sử dụng thêm các thư viện hỗ trợ như **jQuery**, **Axios**, **SweetAlert2**, v.v. nếu cần thiết.
- Thiết kế giao diện đẹp và hiện đại, ưu tiên trải nghiệm người dùng.
- Giao diện **responsive** và hiện đại kết hợp giữa nhật bản và việt nam.
- Tối ưu trải nghiệm người dùng (UX).
- Tối ưu tốc độ tải trang.
- Tối ưu SEO cơ bản.
- Hạn chế sử dụng JavaScript thuần nếu không cần thiết.
- Sử dụng các component đã có, hạn chế tạo mới nếu không cần thiết.
- Hạn chế sử dụng các hiệu ứng động (animation) phức tạp.

### 📂 Cấu trúc thư mục chuẩn

- `/src`
  - `/app`
    - `/components` - Chứa các component tái sử dụng.
    - `/services` - Chứa các service để gọi API.
    - `/models` - Chứa các interface và model dữ liệu.
    - `/pages` - Chứa các trang chính của ứng dụng.
    - `/assets` - Chứa hình ảnh, CSS, JS tĩnh.
    - `/shared` - Chứa các module, directive, pipe dùng chung.
  - `/environments` - Chứa cấu hình môi trường (dev, prod).
  - `index.html` - File HTML chính.
  - `styles.css` - File CSS toàn cục.

---

## ⚙️ Quy tắc lập trình

### ✅ Phải:

- Tạo component bằng lệnh không tạo thủ công.
- Viết HTML CSS theo chuẩn W3C.
- Trước khi viết code mới phải đọc các phần liên quan đã có CSS, JS của trang đó chưa nếu có thì viết vào file đó nếu chưa thì tạo mới tuyệt đối không viết vào file html nếu không cần thiết.
- Viết mã **sạch**, dễ đọc, dễ bảo trì.
- Tái sử dụng component/helper đã có.
- Đọc kỹ các code đã xây dựng truớc khi thêm mới hoặc sửa đổi.
- Dữ liệu đầu ra cần xử lý định dạng rõ ràng (tiền tệ, ngày giờ).
- Phân trang, tìm kiếm, sắp xếp hoạt động tốt.
- Sử dụng Bootstrap 5 classes hợp lý hạn chế dùng css thuần nếu không cần thiết.
- Đặt tên Class phù hợp theo chuẩn không đặt bừa bãi, nên đặt tên class theo trang nếu css đó có tính đặc thù riêng(tránh trường hợp đè lên css của trang khác).
- CSS các phần cần đồng bộ với nhau không rời rạc.
- Viết File test, test xong phải xóa đi.
- Các thông báo sử dụng Extention SweetAlert2, không dùng alert().
- Comment phải chia ra từng mục rõ ràng. Ví dụ Header, Footer, Main Content, Sidebar, v.v.

### ❌ Không được:

- Không đặt tên class bừa bãi, không theo chuẩn.
- Không comment code không cần thiết các commemt thừa khi sưa code.
- Chỉ commemt để chia các mục ngoài ra không comment gì nữa.
- Không viết code thừa code trùng lập không đồng bộ, sửa thì điều chỉnh code có hiện tại không tùy tiện viết code mới tránh việc code không đồng bộ.
- Không viết **code khó hiểu**, không theo chuẩn.
- Không viết **code không cần thiết** (ví dụ: không dùng đến).
- Không viết **code lộn xộn**, không theo chuẩn.
- Không viết Comment không rõ ràng, không cần thiết.
- Không viết **code lặp lại** (tuân theo nguyên tắc **DRY**).
- Không để **logic xử lý trong view**.
- Không dùng **inline style** CSS.
- Không dùng **Bootstrap 3 hoặc 4**.

---

## 🧠 Gợi ý cho Copilot

- Khi viết view, ưu tiên class Bootstrap 5 hợp lý như: `row`, `col-md-6`, `form-control`, `table`, `btn btn-primary`, v.v.
- Khi viết controller, chia nhỏ hàm nếu quá dài.
- Dùng **Route Model Binding** khi có thể.
- Logic xử lý nên đặt ở **Service**, **Repository** hoặc **Helper**, không nhét vào Controller hay View.

---

## 📌 Mục tiêu

- Duy trì codebase sạch, chuyên nghiệp, có thể mở rộng.
- Tận dụng tối đa sức mạnh của Laravel thay vì viết thủ công.
- Đảm bảo UI nhất quán và hiện đại.
- Tạo trải nghiệm người dùng tốt nhất có thể.
- Kiểm tra tồn tại của bảng trước khi dùng trong migration.

---

📝 _Hãy đọc kỹ code hiện có trước khi thêm mới hoặc sửa đổi. Mục tiêu là giữ cho hệ thống ổn định, dễ bảo trì và dễ mở rộng._
