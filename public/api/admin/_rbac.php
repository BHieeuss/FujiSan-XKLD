<?php
declare(strict_types=1);

require_once __DIR__ . '/_bootstrap.php';
require_once __DIR__ . '/_notifications.php';

// -------------------------------------------------------------
// STORAGE FILE PATHS
// -------------------------------------------------------------
function admin_users_file_path(): string
{
    return admin_storage_directory() . DIRECTORY_SEPARATOR . 'users.json';
}

function admin_roles_file_path(): string
{
    return admin_storage_directory() . DIRECTORY_SEPARATOR . 'roles.json';
}

function admin_user_overrides_file_path(): string
{
    return admin_storage_directory() . DIRECTORY_SEPARATOR . 'user-overrides.json';
}

// -------------------------------------------------------------
// CENTRALIZED PERMISSION REGISTRY
// -------------------------------------------------------------
function admin_permission_registry(): array
{
    static $registry = null;
    if ($registry !== null) {
        return $registry;
    }

    $registry = [
        // MODULE: ĐƠN HÀNG TUYỂN DỤNG
        [
            'key' => 'orders.view',
            'name' => 'Xem đơn hàng',
            'description' => 'Xem danh sách và chi tiết các đơn hàng tuyển dụng',
            'module' => 'orders',
            'moduleName' => 'Đơn hàng tuyển dụng',
            'action' => 'view',
            'isSensitive' => false,
        ],
        [
            'key' => 'orders.view_detail',
            'name' => 'Xem chi tiết đơn hàng',
            'description' => 'Xem toàn bộ thông tin chi tiết và bài đăng đơn hàng',
            'module' => 'orders',
            'moduleName' => 'Đơn hàng tuyển dụng',
            'action' => 'view_detail',
            'isSensitive' => false,
        ],
        [
            'key' => 'orders.create',
            'name' => 'Thêm đơn hàng mới',
            'description' => 'Tạo mới thông tin đơn hàng đi Nhật',
            'module' => 'orders',
            'moduleName' => 'Đơn hàng tuyển dụng',
            'action' => 'create',
            'isSensitive' => false,
        ],
        [
            'key' => 'orders.update',
            'name' => 'Chỉnh sửa đơn hàng',
            'description' => 'Cập nhật tiêu đề, lương, yêu cầu và nội dung đơn hàng',
            'module' => 'orders',
            'moduleName' => 'Đơn hàng tuyển dụng',
            'action' => 'update',
            'isSensitive' => false,
        ],
        [
            'key' => 'orders.approve',
            'name' => 'Duyệt & Đổi trạng thái đơn hàng',
            'description' => 'Xuất bản, đóng nhận hồ sơ hoặc tạm dừng tuyển dụng',
            'module' => 'orders',
            'moduleName' => 'Đơn hàng tuyển dụng',
            'action' => 'approve',
            'isSensitive' => false,
        ],
        [
            'key' => 'orders.manage_status',
            'name' => 'Quản lý trạng thái tuyển dụng',
            'description' => 'Đổi trạng thái Đang tuyển, Bản nháp và Nổi bật của đơn hàng',
            'module' => 'orders',
            'moduleName' => 'Đơn hàng tuyển dụng',
            'action' => 'manage_status',
            'isSensitive' => false,
        ],
        [
            'key' => 'orders.delete',
            'name' => 'Xóa đơn hàng',
            'description' => 'Xóa đơn hàng khỏi hệ thống (thao tác không thể khôi phục)',
            'module' => 'orders',
            'moduleName' => 'Đơn hàng tuyển dụng',
            'action' => 'delete',
            'isSensitive' => true,
        ],
        [
            'key' => 'orders.export',
            'name' => 'Xuất dữ liệu đơn hàng',
            'description' => 'Tải về danh sách đơn hàng định dạng Excel / CSV',
            'module' => 'orders',
            'moduleName' => 'Đơn hàng tuyển dụng',
            'action' => 'export',
            'isSensitive' => false,
        ],
        [
            'key' => 'orders.facebook_content.view',
            'name' => 'Xem nội dung bài đăng tham khảo',
            'description' => 'Xem khu vực nội dung bài đăng tham khảo và bản xem trước Facebook',
            'module' => 'orders',
            'moduleName' => 'Đơn hàng tuyển dụng',
            'action' => 'facebook_content_view',
            'isSensitive' => false,
        ],
        [
            'key' => 'orders.facebook_content.create',
            'name' => 'Soạn thảo nội dung bài đăng',
            'description' => 'Khởi tạo và biên tập bài đăng tuyển dụng Facebook',
            'module' => 'orders',
            'moduleName' => 'Đơn hàng tuyển dụng',
            'action' => 'facebook_content_create',
            'isSensitive' => false,
        ],
        [
            'key' => 'orders.facebook_content.update',
            'name' => 'Chỉnh sửa nội dung bài đăng',
            'description' => 'Chỉnh sửa trực tiếp từng đoạn hoặc toàn văn bài đăng tuyển dụng',
            'module' => 'orders',
            'moduleName' => 'Đơn hàng tuyển dụng',
            'action' => 'facebook_content_update',
            'isSensitive' => false,
        ],
        [
            'key' => 'orders.facebook_content.ai_generate',
            'name' => 'Sử dụng AI tạo nội dung tuyển dụng',
            'description' => 'Tạo nội dung bài đăng theo các phong cách và mẫu bố cục từ dữ liệu đơn hàng',
            'module' => 'orders',
            'moduleName' => 'Đơn hàng tuyển dụng',
            'action' => 'facebook_content_ai_generate',
            'isSensitive' => false,
        ],
        [
            'key' => 'orders.facebook_content.ai_review',
            'name' => 'Kiểm tra nội dung & Chính sách Meta',
            'description' => 'Chạy phân tích AI rà soát từ ngữ nhạy cảm, cam kết thu nhập và rủi ro vi phạm chính sách',
            'module' => 'orders',
            'moduleName' => 'Đơn hàng tuyển dụng',
            'action' => 'facebook_content_ai_review',
            'isSensitive' => false,
        ],
        [
            'key' => 'orders.facebook_content.copy',
            'name' => 'Sao chép bài đăng tham khảo',
            'description' => 'Sao chép nội dung bài đăng Facebook chuẩn hóa 1-click vào clipboard',
            'module' => 'orders',
            'moduleName' => 'Đơn hàng tuyển dụng',
            'action' => 'facebook_content_copy',
            'isSensitive' => false,
        ],

        // MODULE: QUẢN LÝ HỌC VIÊN
        [
            'key' => 'students.view',
            'name' => 'Xem danh sách học viên',
            'description' => 'Xem danh sách, thông tin cơ bản và trạng thái học viên',
            'module' => 'students',
            'moduleName' => 'Quản lý học viên',
            'action' => 'view',
            'isSensitive' => false,
        ],
        [
            'key' => 'students.create',
            'name' => 'Thêm mới học viên',
            'description' => 'Tạo hồ sơ và tài khoản học viên mới vào hệ thống',
            'module' => 'students',
            'moduleName' => 'Quản lý học viên',
            'action' => 'create',
            'isSensitive' => false,
        ],
        [
            'key' => 'students.update',
            'name' => 'Chỉnh sửa thông tin học viên',
            'description' => 'Cập nhật thông tin cá nhân, liên hệ và tiến độ học',
            'module' => 'students',
            'moduleName' => 'Quản lý học viên',
            'action' => 'update',
            'isSensitive' => false,
        ],
        [
            'key' => 'students.assign',
            'name' => 'Phân công cán bộ phụ trách',
            'description' => 'Gán hoặc điều chuyển học viên cho nhân viên phụ trách',
            'module' => 'students',
            'moduleName' => 'Quản lý học viên',
            'action' => 'assign',
            'isSensitive' => false,
        ],
        [
            'key' => 'students.delete',
            'name' => 'Xóa học viên',
            'description' => 'Xóa dữ liệu học viên khỏi hệ thống',
            'module' => 'students',
            'moduleName' => 'Quản lý học viên',
            'action' => 'delete',
            'isSensitive' => true,
        ],
        [
            'key' => 'students.export',
            'name' => 'Xuất dữ liệu học viên',
            'description' => 'Xuất danh sách học viên và báo cáo đào tạo',
            'module' => 'students',
            'moduleName' => 'Quản lý học viên',
            'action' => 'export',
            'isSensitive' => false,
        ],

        // MODULE: QUẢN LÝ HỒ SƠ & TÀI LIỆU
        [
            'key' => 'profiles.view',
            'name' => 'Xem hồ sơ & tài liệu',
            'description' => 'Xem sơ yếu lý lịch, file đính kèm, ảnh scan và bằng cấp',
            'module' => 'profiles',
            'moduleName' => 'Hồ sơ & Tài liệu',
            'action' => 'view',
            'isSensitive' => false,
        ],
        [
            'key' => 'profiles.approve',
            'name' => 'Tiếp nhận & Duyệt hồ sơ',
            'description' => 'Duyệt hồ sơ đủ điều kiện hoặc chuyển giai đoạn tuyển dụng',
            'module' => 'profiles',
            'moduleName' => 'Hồ sơ & Tài liệu',
            'action' => 'approve',
            'isSensitive' => false,
        ],
        [
            'key' => 'profiles.supplement',
            'name' => 'Yêu cầu bổ sung hồ sơ',
            'description' => 'Đánh dấu hồ sơ thiếu giấy tờ và gửi thông báo bổ sung',
            'module' => 'profiles',
            'moduleName' => 'Hồ sơ & Tài liệu',
            'action' => 'update',
            'isSensitive' => false,
        ],
        [
            'key' => 'profiles.download',
            'name' => 'Tải tài liệu PDF / Excel / Ảnh',
            'description' => 'Tải về sơ yếu lý lịch Excel, scan PDF và hồ sơ gốc',
            'module' => 'profiles',
            'moduleName' => 'Hồ sơ & Tài liệu',
            'action' => 'download',
            'isSensitive' => false,
        ],
        [
            'key' => 'profiles.update',
            'name' => 'Chỉnh sửa tài liệu hồ sơ',
            'description' => 'Cập nhật lại file hoặc ghi chú đối soát hồ sơ',
            'module' => 'profiles',
            'moduleName' => 'Hồ sơ & Tài liệu',
            'action' => 'update',
            'isSensitive' => false,
        ],
        [
            'key' => 'profiles.delete',
            'name' => 'Xóa tài liệu hồ sơ',
            'description' => 'Xóa tài liệu, file PDF hoặc ảnh trong hồ sơ học viên',
            'module' => 'profiles',
            'moduleName' => 'Hồ sơ & Tài liệu',
            'action' => 'delete',
            'isSensitive' => true,
        ],

        // MODULE: QUẢN LÝ NGƯỜI DÙNG & PHÂN QUYỀN
        [
            'key' => 'users.view',
            'name' => 'Xem danh sách tài khoản',
            'description' => 'Xem danh sách cán bộ, vai trò và trạng thái hoạt động',
            'module' => 'users',
            'moduleName' => 'Người dùng & Phân quyền',
            'action' => 'view',
            'isSensitive' => false,
        ],
        [
            'key' => 'users.create',
            'name' => 'Tạo tài khoản cán bộ mới',
            'description' => 'Thêm nhân viên mới và thiết lập vai trò ban đầu',
            'module' => 'users',
            'moduleName' => 'Người dùng & Phân quyền',
            'action' => 'create',
            'isSensitive' => true,
        ],
        [
            'key' => 'users.update',
            'name' => 'Chỉnh sửa thông tin tài khoản',
            'description' => 'Cập nhật họ tên, phòng ban, vai trò và đặt lại mật khẩu',
            'module' => 'users',
            'moduleName' => 'Người dùng & Phân quyền',
            'action' => 'update',
            'isSensitive' => true,
        ],
        [
            'key' => 'users.lock',
            'name' => 'Khóa & Mở khóa tài khoản',
            'description' => 'Đình chỉ hoặc kích hoạt lại quyền đăng nhập của nhân viên',
            'module' => 'users',
            'moduleName' => 'Người dùng & Phân quyền',
            'action' => 'update',
            'isSensitive' => true,
        ],
        [
            'key' => 'users.delete',
            'name' => 'Xóa tài khoản nhân viên',
            'description' => 'Xóa tài khoản nhân viên khỏi hệ thống (trừ Super Admin)',
            'module' => 'users',
            'moduleName' => 'Người dùng & Phân quyền',
            'action' => 'delete',
            'isSensitive' => true,
        ],
        [
            'key' => 'roles.manage',
            'name' => 'Quản lý vai trò & Ma trận quyền',
            'description' => 'Tạo, sửa, sao chép vai trò và thiết lập phân quyền RBAC',
            'module' => 'users',
            'moduleName' => 'Người dùng & Phân quyền',
            'action' => 'manage',
            'isSensitive' => true,
        ],
        [
            'key' => 'permissions.override',
            'name' => 'Phân quyền riêng từng tài khoản',
            'description' => 'Cấp thêm (ALLOW) hoặc thu hồi (DENY) quyền riêng biệt',
            'module' => 'users',
            'moduleName' => 'Người dùng & Phân quyền',
            'action' => 'manage',
            'isSensitive' => true,
        ],

        // MODULE: TRUNG TÂM ĐIỀU HÀNH & THÔNG BÁO
        [
            'key' => 'notifications.view',
            'name' => 'Xem trung tâm điều hành & thông báo',
            'description' => 'Xem luồng thông báo, KPI tổng hợp và trạng thái hệ thống',
            'module' => 'notifications',
            'moduleName' => 'Điều hành & Thông báo',
            'action' => 'view',
            'isSensitive' => false,
        ],
        [
            'key' => 'notifications.mark_read',
            'name' => 'Đánh dấu đã đọc / chưa đọc',
            'description' => 'Chuyển đổi trạng thái đã đọc hoặc chưa đọc của thông báo cá nhân',
            'module' => 'notifications',
            'moduleName' => 'Điều hành & Thông báo',
            'action' => 'update',
            'isSensitive' => false,
        ],
        [
            'key' => 'notifications.mark_all_read',
            'name' => 'Đánh dấu tất cả đã đọc',
            'description' => 'Đánh dấu toàn bộ thông báo trong hộp thư đến là đã đọc',
            'module' => 'notifications',
            'moduleName' => 'Điều hành & Thông báo',
            'action' => 'update',
            'isSensitive' => false,
        ],
        [
            'key' => 'notifications.delete',
            'name' => 'Đưa thông báo vào thùng rác',
            'description' => 'Chuyển thông báo cá nhân vào thùng rác lưu trữ 30 ngày',
            'module' => 'notifications',
            'moduleName' => 'Điều hành & Thông báo',
            'action' => 'delete',
            'isSensitive' => false,
        ],
        [
            'key' => 'notifications.bulk_delete',
            'name' => 'Đưa hàng loạt vào thùng rác',
            'description' => 'Chọn và chuyển nhiều thông báo cùng lúc vào thùng rác',
            'module' => 'notifications',
            'moduleName' => 'Điều hành & Thông báo',
            'action' => 'delete',
            'isSensitive' => false,
        ],
        [
            'key' => 'notifications.trash_view',
            'name' => 'Xem thùng rác thông báo',
            'description' => 'Xem danh sách các thông báo đã xóa trong thùng rác 30 ngày',
            'module' => 'notifications',
            'moduleName' => 'Điều hành & Thông báo',
            'action' => 'view',
            'isSensitive' => false,
        ],
        [
            'key' => 'notifications.restore',
            'name' => 'Khôi phục thông báo từ thùng rác',
            'description' => 'Phục hồi thông báo từ thùng rác trở lại hộp thư đến',
            'module' => 'notifications',
            'moduleName' => 'Điều hành & Thông báo',
            'action' => 'update',
            'isSensitive' => false,
        ],
        [
            'key' => 'notifications.bulk_restore',
            'name' => 'Khôi phục hàng loạt từ thùng rác',
            'description' => 'Chọn và phục hồi nhiều thông báo từ thùng rác cùng lúc',
            'module' => 'notifications',
            'moduleName' => 'Điều hành & Thông báo',
            'action' => 'update',
            'isSensitive' => false,
        ],
        [
            'key' => 'notifications.delete_permanently',
            'name' => 'Xóa vĩnh viễn thông báo',
            'description' => 'Xóa hoàn toàn thông báo khỏi thùng rác không thể khôi phục',
            'module' => 'notifications',
            'moduleName' => 'Điều hành & Thông báo',
            'action' => 'delete',
            'isSensitive' => true,
        ],
        [
            'key' => 'notifications.manage',
            'name' => 'Quản lý thông báo toàn diện',
            'description' => 'Đánh dấu đã đọc, phân loại, dọn dẹp và quản lý thùng rác thông báo',
            'module' => 'notifications',
            'moduleName' => 'Điều hành & Thông báo',
            'action' => 'manage',
            'isSensitive' => false,
        ],
        [
            'key' => 'notifications.view_logs',
            'name' => 'Xem nhật ký hoạt động hệ thống',
            'description' => 'Xem lịch sử thay đổi và kiểm toán thao tác người dùng',
            'module' => 'notifications',
            'moduleName' => 'Điều hành & Thông báo',
            'action' => 'view',
            'isSensitive' => false,
        ],
        [
            'key' => 'tasks.manage',
            'name' => 'Quản lý danh sách nhiệm vụ',
            'description' => 'Tạo, cập nhật trạng thái và tiến độ xử lý công việc',
            'module' => 'notifications',
            'moduleName' => 'Điều hành & Thông báo',
            'action' => 'manage',
            'isSensitive' => false,
        ],
        [
            'key' => 'tasks.assign',
            'name' => 'Giao việc cho nhân viên',
            'description' => 'Chỉ định cán bộ chịu trách nhiệm hoàn thành nhiệm vụ',
            'module' => 'notifications',
            'moduleName' => 'Điều hành & Thông báo',
            'action' => 'assign',
            'isSensitive' => false,
        ],

        // MODULE: TIỆN ÍCH & POSTER
        [
            'key' => 'poster.create',
            'name' => 'Thiết kế poster tuyển dụng',
            'description' => 'Sử dụng công cụ thiết kế poster đơn hàng và xuất ảnh',
            'module' => 'tools',
            'moduleName' => 'Tiện ích & Poster',
            'action' => 'create',
            'isSensitive' => false,
        ],
        [
            'key' => 'poster_studio.view',
            'name' => 'Xem Poster Studio',
            'description' => 'Truy cập và xem không gian làm việc Poster Studio trực tiếp',
            'module' => 'poster_studio',
            'moduleName' => 'Poster Studio Chuyên Nghiệp',
            'action' => 'view',
            'isSensitive' => false,
        ],
        [
            'key' => 'poster_studio.create',
            'name' => 'Tạo thiết kế poster mới',
            'description' => 'Khởi tạo bản thiết kế poster từ đơn hàng hoặc ảnh AI OCR',
            'module' => 'poster_studio',
            'moduleName' => 'Poster Studio Chuyên Nghiệp',
            'action' => 'create',
            'isSensitive' => false,
        ],
        [
            'key' => 'poster_studio.edit',
            'name' => 'Chỉnh sửa nội dung & canvas poster',
            'description' => 'Click chỉnh sửa trực tiếp thành phần trên poster canvas và bảng điều khiển',
            'module' => 'poster_studio',
            'moduleName' => 'Poster Studio Chuyên Nghiệp',
            'action' => 'edit',
            'isSensitive' => false,
        ],
        [
            'key' => 'poster_studio.change_template',
            'name' => 'Đổi template thiết kế poster',
            'description' => 'Chuyển đổi giữa các mẫu poster VieJap mà không mất dữ liệu',
            'module' => 'poster_studio',
            'moduleName' => 'Poster Studio Chuyên Nghiệp',
            'action' => 'change_template',
            'isSensitive' => false,
        ],
        [
            'key' => 'poster_studio.manage_images',
            'name' => 'Quản lý hình ảnh và logo',
            'description' => 'Thay đổi ảnh công việc, môi trường và thư viện ảnh ngành nghề',
            'module' => 'poster_studio',
            'moduleName' => 'Poster Studio Chuyên Nghiệp',
            'action' => 'manage_images',
            'isSensitive' => false,
        ],
        [
            'key' => 'poster_studio.save',
            'name' => 'Lưu bản nháp thiết kế',
            'description' => 'Tự động lưu và quản lý bản nháp thiết kế poster',
            'module' => 'poster_studio',
            'moduleName' => 'Poster Studio Chuyên Nghiệp',
            'action' => 'save',
            'isSensitive' => false,
        ],
        [
            'key' => 'poster_studio.export',
            'name' => 'Xuất poster PNG/JPG/PDF',
            'description' => 'Xuất poster độ phân giải cao phục vụ truyền thông mạng xã hội',
            'module' => 'poster_studio',
            'moduleName' => 'Poster Studio Chuyên Nghiệp',
            'action' => 'export',
            'isSensitive' => false,
        ],
        [
            'key' => 'poster_studio.apply_to_order',
            'name' => 'Áp dụng poster vào đơn hàng',
            'description' => 'Đồng bộ ảnh poster đã hoàn thiện vào đơn hàng tương ứng',
            'module' => 'poster_studio',
            'moduleName' => 'Poster Studio Chuyên Nghiệp',
            'action' => 'apply_to_order',
            'isSensitive' => false,
        ],
        [
            'key' => 'poster_studio.manage_versions',
            'name' => 'Quản lý phiên bản poster',
            'description' => 'Khôi phục lịch sử chỉnh sửa và quản lý nhiều phiên bản poster',
            'module' => 'poster_studio',
            'moduleName' => 'Poster Studio Chuyên Nghiệp',
            'action' => 'manage_versions',
            'isSensitive' => false,
        ],

        // MODULE: MÃ ĐĂNG KÝ & TIẾN ĐỘ HỌC VIÊN
        [
            'key' => 'student_registration_codes.view',
            'name' => 'Xem mã đăng ký học viên',
            'description' => 'Xem danh sách và thống kê các mã đăng ký hồ sơ được cấp cho học viên',
            'module' => 'student_registration_codes',
            'moduleName' => 'Mã đăng ký học viên',
            'action' => 'view',
            'isSensitive' => false,
        ],
        [
            'key' => 'student_registration_codes.create',
            'name' => 'Tạo mã đăng ký học viên',
            'description' => 'Tạo mã 6 số mới và tạo QR truy cập cho từng học viên',
            'module' => 'student_registration_codes',
            'moduleName' => 'Mã đăng ký học viên',
            'action' => 'create',
            'isSensitive' => false,
        ],
        [
            'key' => 'student_registration_codes.create_bulk',
            'name' => 'Cấp mã đăng ký hàng loạt',
            'description' => 'Tạo mã xác thực 6 số cho nhiều học viên cùng lúc',
            'module' => 'student_registration_codes',
            'moduleName' => 'Mã đăng ký học viên',
            'action' => 'create_bulk',
            'isSensitive' => false,
        ],
        [
            'key' => 'student_registration_codes.revoke',
            'name' => 'Thu hồi mã đăng ký',
            'description' => 'Thu hồi quyền truy cập của mã đăng ký chưa được sử dụng',
            'module' => 'student_registration_codes',
            'moduleName' => 'Mã đăng ký học viên',
            'action' => 'revoke',
            'isSensitive' => true,
        ],
        [
            'key' => 'student_registration_codes.delete',
            'name' => 'Xóa mã đăng ký',
            'description' => 'Xóa hoàn toàn mã đăng ký học viên khỏi hệ thống',
            'module' => 'student_registration_codes',
            'moduleName' => 'Mã đăng ký học viên',
            'action' => 'delete',
            'isSensitive' => true,
        ],
        [
            'key' => 'student_registration_codes.reissue',
            'name' => 'Cấp lại mã đăng ký',
            'description' => 'Cấp lại mã mới khi mã cũ hết hạn hoặc bị thu hồi',
            'module' => 'student_registration_codes',
            'moduleName' => 'Mã đăng ký học viên',
            'action' => 'reissue',
            'isSensitive' => false,
        ],
        [
            'key' => 'student_registration_codes.export',
            'name' => 'Xuất danh sách mã đăng ký',
            'description' => 'Xuất file Excel/CSV danh sách mã đăng ký và thông tin xác thực',
            'module' => 'student_registration_codes',
            'moduleName' => 'Mã đăng ký học viên',
            'action' => 'export',
            'isSensitive' => true,
        ],
        [
            'key' => 'student_registration_codes.view_history',
            'name' => 'Xem nhật ký mã đăng ký',
            'description' => 'Xem lịch sử xác thực, các lần truy cập và thao tác của học viên',
            'module' => 'student_registration_codes',
            'moduleName' => 'Mã đăng ký học viên',
            'action' => 'view_history',
            'isSensitive' => true,
        ],
        [
            'key' => 'student_registration_codes.manage',
            'name' => 'Toàn quyền quản trị mã đăng ký',
            'description' => 'Quản lý toàn bộ cấu hình, dọn dẹp và chính sách cấp mã học viên',
            'module' => 'student_registration_codes',
            'moduleName' => 'Mã đăng ký học viên',
            'action' => 'manage',
            'isSensitive' => true,
        ],
        [
            'key' => 'student_registration_progress.view',
            'name' => 'Theo dõi tiến độ hồ sơ học viên',
            'description' => 'Xem chi tiết phần trăm hoàn thành và các mốc thời gian khai hồ sơ',
            'module' => 'student_registration_codes',
            'moduleName' => 'Mã đăng ký học viên',
            'action' => 'view_progress',
            'isSensitive' => false,
        ],
        [
            'key' => 'student_registration_progress.manage',
            'name' => 'Quản lý tiến độ hồ sơ học viên',
            'description' => 'Cập nhật trạng thái duyệt, yêu cầu bổ sung hoặc xử lý tiến độ',
            'module' => 'student_registration_codes',
            'moduleName' => 'Mã đăng ký học viên',
            'action' => 'manage_progress',
            'isSensitive' => false,
        ],

        // MODULE: HỆ THỐNG & NHẬT KÝ
        [
            'key' => 'audit.view',
            'name' => 'Xem nhật ký hoạt động & Phân quyền',
            'description' => 'Xem lịch sử Before/After các thay đổi nhạy cảm trong hệ thống',
            'module' => 'system',
            'moduleName' => 'Hệ thống & Nhật ký',
            'action' => 'view',
            'isSensitive' => true,
        ],
        [
            'key' => 'security.manage',
            'name' => 'Quản lý cài đặt bảo mật',
            'description' => 'Cấu hình chính sách mật khẩu, phiên làm việc và bảo mật',
            'module' => 'system',
            'moduleName' => 'Hệ thống & Nhật ký',
            'action' => 'manage',
            'isSensitive' => true,
        ],

        // MODULE: GÓC HOẠT ĐỘNG & NỘI DUNG (ACTIVITIES)
        [
            'key' => 'activities.view',
            'name' => 'Xem danh sách góc hoạt động',
            'description' => 'Xem danh sách, bộ lọc, chi tiết và bản xem trước hoạt động',
            'module' => 'activities',
            'moduleName' => 'Góc hoạt động',
            'action' => 'view',
            'isSensitive' => false,
        ],
        [
            'key' => 'activities.create',
            'name' => 'Tạo hoạt động mới',
            'description' => 'Khởi tạo bài đăng hoạt động, nhập thông tin và chọn mẫu thiết kế',
            'module' => 'activities',
            'moduleName' => 'Góc hoạt động',
            'action' => 'create',
            'isSensitive' => false,
        ],
        [
            'key' => 'activities.update',
            'name' => 'Chỉnh sửa hoạt động & Block editor',
            'description' => 'Biên tập khối nội dung, thay đổi thông tin bài viết và thư viện ảnh',
            'module' => 'activities',
            'moduleName' => 'Góc hoạt động',
            'action' => 'update',
            'isSensitive' => false,
        ],
        [
            'key' => 'activities.delete',
            'name' => 'Xóa hoạt động',
            'description' => 'Xóa hoàn toàn bài đăng hoạt động khỏi hệ thống',
            'module' => 'activities',
            'moduleName' => 'Góc hoạt động',
            'action' => 'delete',
            'isSensitive' => true,
        ],
        [
            'key' => 'activities.publish',
            'name' => 'Xuất bản & Lên lịch hoạt động',
            'description' => 'Xuất bản bài viết lên website công khai hoặc lên lịch đăng tự động',
            'module' => 'activities',
            'moduleName' => 'Góc hoạt động',
            'action' => 'publish',
            'isSensitive' => false,
        ],
        [
            'key' => 'activities.approve',
            'name' => 'Phê duyệt hoạt động',
            'description' => 'Phê duyệt hoặc từ chối kèm lý do các bài đăng hoạt động chờ duyệt',
            'module' => 'activities',
            'moduleName' => 'Góc hoạt động',
            'action' => 'approve',
            'isSensitive' => true,
        ],
        [
            'key' => 'activities.feature',
            'name' => 'Đưa lên vị trí Nổi bật (Featured)',
            'description' => 'Đưa hoạt động lên khu vực banner / bài nổi bật chính của website',
            'module' => 'activities',
            'moduleName' => 'Góc hoạt động',
            'action' => 'feature',
            'isSensitive' => false,
        ],
        [
            'key' => 'activities.mark_hot',
            'name' => 'Gắn nhãn HOT & Gia hạn thời gian',
            'description' => 'Bật nhãn HOT và cấu hình ngày tự động hết hạn',
            'module' => 'activities',
            'moduleName' => 'Góc hoạt động',
            'action' => 'mark_hot',
            'isSensitive' => false,
        ],
        [
            'key' => 'activities.manage_display',
            'name' => 'Quản lý phân phối vị trí hiển thị',
            'description' => 'Cấu hình vị trí xuất hiện: Featured, HOT, Latest, Homepage, v.v.',
            'module' => 'activities',
            'moduleName' => 'Góc hoạt động',
            'action' => 'manage_display',
            'isSensitive' => false,
        ],
        [
            'key' => 'activities.manage_categories',
            'name' => 'Quản lý danh mục hoạt động',
            'description' => 'Thêm, sửa, sắp xếp các danh mục phân loại hoạt động',
            'module' => 'activities',
            'moduleName' => 'Góc hoạt động',
            'action' => 'manage_categories',
            'isSensitive' => false,
        ],
        [
            'key' => 'activities.manage_templates',
            'name' => 'Quản lý mẫu thiết kế bài đăng',
            'description' => 'Lựa chọn, lưu mẫu cá nhân và áp dụng template layout',
            'module' => 'activities',
            'moduleName' => 'Góc hoạt động',
            'action' => 'manage_templates',
            'isSensitive' => false,
        ],
        [
            'key' => 'activities.manage_media',
            'name' => 'Quản lý thư viện hình ảnh & Video',
            'description' => 'Tải lên, sắp xếp thứ tự bộ sưu tập ảnh và nhúng video',
            'module' => 'activities',
            'moduleName' => 'Góc hoạt động',
            'action' => 'manage_media',
            'isSensitive' => false,
        ],
        [
            'key' => 'activities.manage_priority',
            'name' => 'Sắp xếp thứ tự ưu tiên kéo thả',
            'description' => 'Thay đổi thứ tự hiển thị của các bài viết trong từng khu vực',
            'module' => 'activities',
            'moduleName' => 'Góc hoạt động',
            'action' => 'manage_priority',
            'isSensitive' => false,
        ],
        [
            'key' => 'activities.manage_schedule',
            'name' => 'Quản lý lịch xuất bản & Hết hạn',
            'description' => 'Cấu hình thời gian bắt đầu, kết thúc hiển thị và lịch đăng',
            'module' => 'activities',
            'moduleName' => 'Góc hoạt động',
            'action' => 'manage_schedule',
            'isSensitive' => false,
        ],
        [
            'key' => 'activities.view_analytics',
            'name' => 'Xem thống kê & Tương tác hoạt động',
            'description' => 'Theo dõi lượt xem, lượt bấm và đề xuất hoạt động được quan tâm',
            'module' => 'activities',
            'moduleName' => 'Góc hoạt động',
            'action' => 'view_analytics',
            'isSensitive' => false,
        ],

        // MODULE: QUẢN LÝ SỰ KIỆN (EVENTS)
        [
            'key' => 'events.view',
            'name' => 'Xem danh sách và chi tiết sự kiện',
            'description' => 'Xem danh sách các sự kiện, thông báo nổi, popup và số liệu tương tác',
            'module' => 'events',
            'moduleName' => 'Quản lý sự kiện',
            'action' => 'view',
            'isSensitive' => false,
        ],
        [
            'key' => 'events.create',
            'name' => 'Tạo sự kiện mới',
            'description' => 'Khởi tạo sự kiện mới, thiết lập hình thức hiển thị (popup, banner, thông báo)',
            'module' => 'events',
            'moduleName' => 'Quản lý sự kiện',
            'action' => 'create',
            'isSensitive' => false,
        ],
        [
            'key' => 'events.update',
            'name' => 'Chỉnh sửa sự kiện',
            'description' => 'Chỉnh sửa nội dung, thời gian hiển thị và cấu hình sự kiện',
            'module' => 'events',
            'moduleName' => 'Quản lý sự kiện',
            'action' => 'update',
            'isSensitive' => false,
        ],
        [
            'key' => 'events.delete',
            'name' => 'Xóa sự kiện',
            'description' => 'Xóa bỏ sự kiện khỏi hệ thống',
            'module' => 'events',
            'moduleName' => 'Quản lý sự kiện',
            'action' => 'delete',
            'isSensitive' => true,
        ],
        [
            'key' => 'events.publish',
            'name' => 'Xuất bản sự kiện',
            'description' => 'Xuất bản sự kiện để hiển thị công khai trên website',
            'module' => 'events',
            'moduleName' => 'Quản lý sự kiện',
            'action' => 'publish',
            'isSensitive' => false,
        ],
        [
            'key' => 'events.pause',
            'name' => 'Tạm dừng sự kiện',
            'description' => 'Tạm dừng hoặc kích hoạt lại sự kiện đang hiển thị',
            'module' => 'events',
            'moduleName' => 'Quản lý sự kiện',
            'action' => 'pause',
            'isSensitive' => false,
        ],
        [
            'key' => 'events.manage_priority',
            'name' => 'Sắp xếp thứ tự ưu tiên sự kiện',
            'description' => 'Điều chỉnh độ ưu tiên hiển thị giữa các sự kiện cùng loại',
            'module' => 'events',
            'moduleName' => 'Quản lý sự kiện',
            'action' => 'manage_priority',
            'isSensitive' => false,
        ],
    ];

    return $registry;
}

function admin_all_permission_keys(): array
{
    return array_column(admin_permission_registry(), 'key');
}

// -------------------------------------------------------------
// DEFAULT ROLES SEED
// -------------------------------------------------------------
function admin_default_roles(): array
{
    $all = admin_all_permission_keys();
    $now = date('Y-m-d H:i:s');

    return [
        [
            'id' => 'super_admin',
            'name' => 'Super Administrator',
            'description' => 'Quản trị viên tối cao: toàn quyền trên toàn hệ thống VieJap, không thể khóa hay hạ quyền.',
            'isSystem' => true,
            'dataScope' => 'all',
            'permissions' => $all,
            'createdAt' => '2026-01-01 00:00:00',
            'updatedAt' => $now,
        ],
        [
            'id' => 'admin',
            'name' => 'Quản trị viên',
            'description' => 'Quản lý nghiệp vụ chính: đơn hàng, học viên, hồ sơ, cán bộ và trung tâm điều hành.',
            'isSystem' => true,
            'dataScope' => 'all',
            'permissions' => array_values(array_diff($all, ['permissions.override'])),
            'createdAt' => '2026-01-01 00:00:00',
            'updatedAt' => $now,
        ],
        [
            'id' => 'recruitment_lead',
            'name' => 'Trưởng phòng Tuyển dụng',
            'description' => 'Phụ trách chiến lược đơn hàng, phân công cán bộ và duyệt trạng thái đơn.',
            'isSystem' => false,
            'dataScope' => 'department',
            'permissions' => [
                'orders.view', 'orders.create', 'orders.update', 'orders.approve', 'orders.export',
                'orders.facebook_content.view', 'orders.facebook_content.create', 'orders.facebook_content.update',
                'orders.facebook_content.ai_generate', 'orders.facebook_content.ai_review', 'orders.facebook_content.copy',
                'students.view', 'students.assign', 'students.export',
                'profiles.view', 'profiles.download',
                'student_registration_codes.view', 'student_registration_codes.create', 'student_registration_codes.create_bulk',
                'student_registration_codes.reissue', 'student_registration_codes.revoke', 'student_registration_codes.delete', 'student_registration_codes.export',
                'student_registration_progress.view', 'student_registration_progress.manage',
                'notifications.view', 'notifications.mark_read', 'notifications.delete', 'notifications.trash_view', 'notifications.restore', 'tasks.manage', 'tasks.assign', 'poster.create',
            ],
            'createdAt' => '2026-01-01 00:00:00',
            'updatedAt' => $now,
        ],
        [
            'id' => 'admissions_officer',
            'name' => 'Cán bộ Tuyển sinh & Tư vấn',
            'description' => 'Xem đơn hàng, tiếp nhận thông tin ứng viên và hỗ trợ học viên hoàn thiện hồ sơ.',
            'isSystem' => false,
            'dataScope' => 'assigned',
            'permissions' => [
                'orders.view',
                'students.view', 'students.create', 'students.update',
                'profiles.view', 'profiles.download',
                'student_registration_codes.view', 'student_registration_codes.create', 'student_registration_codes.reissue',
                'student_registration_progress.view',
                'notifications.view', 'notifications.mark_read', 'notifications.delete', 'notifications.trash_view', 'notifications.restore', 'tasks.manage', 'poster.create',
            ],
            'createdAt' => '2026-01-01 00:00:00',
            'updatedAt' => $now,
        ],
        [
            'id' => 'document_specialist',
            'name' => 'Chuyên viên Xử lý Hồ sơ',
            'description' => 'Kiểm tra sơ yếu lý lịch, thẩm định file scan PDF/Excel và duyệt hồ sơ xuất cảnh.',
            'isSystem' => false,
            'dataScope' => 'all',
            'permissions' => [
                'students.view', 'students.update',
                'profiles.view', 'profiles.approve', 'profiles.supplement', 'profiles.download', 'profiles.update',
                'notifications.view', 'notifications.mark_read', 'notifications.delete', 'notifications.trash_view', 'notifications.restore', 'tasks.manage',
            ],
            'createdAt' => '2026-01-01 00:00:00',
            'updatedAt' => $now,
        ],
        [
            'id' => 'training_officer',
            'name' => 'Cán bộ Đào tạo Tiếng Nhật',
            'description' => 'Theo dõi tiến độ học tiếng Nhật, Tokutei và tình hình học viên tại trung tâm.',
            'isSystem' => false,
            'dataScope' => 'assigned',
            'permissions' => [
                'students.view', 'students.update',
                'profiles.view',
                'notifications.view', 'tasks.manage',
            ],
            'createdAt' => '2026-01-01 00:00:00',
            'updatedAt' => $now,
        ],
        [
            'id' => 'content_manager',
            'name' => 'Chuyên viên Truyền thông & Hoạt động',
            'description' => 'Chuyên trách sáng tạo nội dung, chụp ảnh, biên tập góc hoạt động và thiết kế poster.',
            'isSystem' => false,
            'dataScope' => 'all',
            'permissions' => [
                'activities.view', 'activities.create', 'activities.update', 'activities.publish', 'activities.feature', 'activities.mark_hot', 'activities.manage_display', 'activities.manage_categories', 'activities.manage_templates', 'activities.manage_media', 'activities.manage_priority', 'activities.manage_schedule', 'activities.view_analytics',
                'poster.create', 'poster_studio.view', 'poster_studio.create', 'poster_studio.edit', 'poster_studio.change_template', 'poster_studio.manage_images', 'poster_studio.save', 'poster_studio.export', 'poster_studio.apply_to_order', 'poster_studio.manage_versions',
                'notifications.view', 'notifications.mark_read', 'notifications.delete', 'tasks.manage',
            ],
            'createdAt' => '2026-01-01 00:00:00',
            'updatedAt' => $now,
        ],
        [
            'id' => 'viewer',
            'name' => 'Khách xem nội bộ',
            'description' => 'Chỉ có quyền xem thông tin cơ bản đơn hàng và thông báo chung.',
            'isSystem' => false,
            'dataScope' => 'all',
            'permissions' => [
                'orders.view',
                'notifications.view',
            ],
            'createdAt' => '2026-01-01 00:00:00',
            'updatedAt' => $now,
        ],
    ];
}

// -------------------------------------------------------------
// ROLES STORE MANAGEMENT
// -------------------------------------------------------------
function admin_roles_list(): array
{
    $path = admin_roles_file_path();
    if (!is_file($path)) {
        $roles = admin_default_roles();
        admin_write_json_file($path, $roles);
        return $roles;
    }

    $raw = file_get_contents($path);
    $roles = $raw === false ? null : json_decode($raw, true);
    if (!is_array($roles) || empty($roles)) {
        $roles = admin_default_roles();
        admin_write_json_file($path, $roles);
        return $roles;
    }

    // Always ensure super_admin role has 100% of current permissions
    $allKeys = admin_all_permission_keys();
    $modified = false;
    $hasSuperAdmin = false;

    foreach ($roles as &$role) {
        if (($role['id'] ?? '') === 'super_admin') {
            $hasSuperAdmin = true;
            if (count($role['permissions'] ?? []) !== count($allKeys)) {
                $role['permissions'] = $allKeys;
                $modified = true;
            }
        }
        if (($role['id'] ?? '') === 'admin') {
            $adminKeys = array_values(array_diff($allKeys, ['permissions.override']));
            if (count($role['permissions'] ?? []) !== count($adminKeys)) {
                $role['permissions'] = $adminKeys;
                $modified = true;
            }
        }
    }
    unset($role);

    if (!$hasSuperAdmin) {
        $defaults = admin_default_roles();
        array_unshift($roles, $defaults[0]);
        $modified = true;
    }

    if ($modified) {
        admin_write_json_file($path, $roles);
    }

    return $roles;
}

function admin_roles_save(array $roles): void
{
    admin_write_json_file(admin_roles_file_path(), $roles);
}

function admin_role_find(string $roleId): ?array
{
    $roles = admin_roles_list();
    foreach ($roles as $role) {
        if ($role['id'] === $roleId) {
            return $role;
        }
    }
    return null;
}

function admin_role_save(array $data, ?string $actorUsername = 'admin'): array
{
    $roles = admin_roles_list();
    $id = trim((string) ($data['id'] ?? ''));
    $name = trim((string) ($data['name'] ?? ''));
    $description = trim((string) ($data['description'] ?? ''));
    $dataScope = in_array($data['dataScope'] ?? '', ['own', 'assigned', 'team', 'department', 'all'], true)
        ? (string) $data['dataScope']
        : 'assigned';
    $permissions = is_array($data['permissions'] ?? null) ? array_values(array_unique($data['permissions'])) : [];

    if ($name === '') {
        throw new InvalidArgumentException('Tên vai trò không được để trống.');
    }

    $now = date('Y-m-d H:i:s');
    $isNew = ($id === '');

    if ($isNew) {
        $slugBase = strtolower(trim(preg_replace('/[^a-zA-Z0-9]+/', '_', $name), '_'));
        if ($slugBase === '') {
            $slugBase = 'role';
        }
        $id = $slugBase;
        $counter = 1;
        while (admin_role_find($id) !== null) {
            $id = $slugBase . '_' . $counter++;
        }

        $newRole = [
            'id' => $id,
            'name' => $name,
            'description' => $description,
            'isSystem' => false,
            'dataScope' => $dataScope,
            'permissions' => $permissions,
            'createdAt' => $now,
            'updatedAt' => $now,
        ];
        $roles[] = $newRole;
        admin_roles_save($roles);

        admin_activity_log_create([
            'actorName' => $actorUsername ?? 'Admin',
            'actorRole' => 'Quản trị viên',
            'action' => 'Tạo vai trò mới: ' . $name,
            'targetType' => 'role',
            'targetId' => $id,
            'targetName' => $name,
            'details' => 'Số lượng quyền: ' . count($permissions) . ' | Phạm vi dữ liệu: ' . $dataScope,
            'changes' => [
                ['field' => 'name', 'fieldLabel' => 'Tên vai trò', 'before' => null, 'after' => $name],
                ['field' => 'dataScope', 'fieldLabel' => 'Phạm vi dữ liệu', 'before' => null, 'after' => $dataScope],
                ['field' => 'permissionsCount', 'fieldLabel' => 'Số lượng quyền', 'before' => 0, 'after' => count($permissions)],
            ],
        ]);

        admin_notification_create([
            'eventType' => 'role.created',
            'category' => 'system',
            'title' => 'Vai trò mới: ' . $name,
            'message' => 'Người dùng ' . ($actorUsername ?? 'Admin') . ' vừa tạo vai trò "' . $name . '" với ' . count($permissions) . ' quyền.',
            'actor' => ['id' => $actorUsername ?? 'admin', 'name' => $actorUsername ?? 'Admin', 'role' => 'Super Admin'],
            'target' => ['type' => 'role', 'id' => $id, 'code' => $id, 'name' => $name, 'url' => '/quan-tri-viejap?section=users&tab=roles'],
            'priority' => 'medium',
        ]);

        return $newRole;
    }

    // Update existing role
    $existingIndex = -1;
    for ($i = 0; $i < count($roles); $i++) {
        if ($roles[$i]['id'] === $id) {
            $existingIndex = $i;
            break;
        }
    }

    if ($existingIndex === -1) {
        throw new RuntimeException('Không tìm thấy vai trò cần chỉnh sửa.');
    }

    $oldRole = $roles[$existingIndex];
    if (!empty($oldRole['isSystem']) && $id === 'super_admin') {
        // Protect super admin role from demotion
        $permissions = admin_all_permission_keys();
        $dataScope = 'all';
    }

    $updatedRole = [
        'id' => $id,
        'name' => $name,
        'description' => $description,
        'isSystem' => !empty($oldRole['isSystem']),
        'dataScope' => $dataScope,
        'permissions' => $permissions,
        'createdAt' => $oldRole['createdAt'] ?? $now,
        'updatedAt' => $now,
    ];

    $roles[$existingIndex] = $updatedRole;
    admin_roles_save($roles);

    admin_activity_log_create([
        'actorName' => $actorUsername ?? 'Admin',
        'actorRole' => 'Quản trị viên',
        'action' => 'Cập nhật vai trò: ' . $name,
        'targetType' => 'role',
        'targetId' => $id,
        'targetName' => $name,
        'details' => 'Số quyền: ' . count($permissions) . ' | Phạm vi: ' . $dataScope,
        'changes' => [
            ['field' => 'name', 'fieldLabel' => 'Tên vai trò', 'before' => $oldRole['name'], 'after' => $name],
            ['field' => 'dataScope', 'fieldLabel' => 'Phạm vi dữ liệu', 'before' => $oldRole['dataScope'] ?? 'assigned', 'after' => $dataScope],
            ['field' => 'permissionsCount', 'fieldLabel' => 'Số quyền', 'before' => count($oldRole['permissions'] ?? []), 'after' => count($permissions)],
        ],
    ]);

    return $updatedRole;
}

function admin_role_copy(string $sourceRoleId, string $newRoleName, ?string $actorUsername = 'admin'): array
{
    $source = admin_role_find($sourceRoleId);
    if ($source === null) {
        throw new RuntimeException('Không tìm thấy vai trò nguồn để sao chép.');
    }

    return admin_role_save([
        'name' => $newRoleName,
        'description' => 'Sao chép từ ' . $source['name'] . ': ' . $source['description'],
        'dataScope' => $source['dataScope'] ?? 'assigned',
        'permissions' => $source['permissions'] ?? [],
    ], $actorUsername);
}

function admin_role_delete(string $roleId, ?string $actorUsername = 'admin'): bool
{
    $role = admin_role_find($roleId);
    if ($role === null) {
        return false;
    }

    if (!empty($role['isSystem'])) {
        throw new RuntimeException('Không thể xóa vai trò hệ thống mặc định.');
    }

    $users = admin_users_list();
    $assignedUsersCount = 0;
    foreach ($users as $user) {
        if (($user['roleId'] ?? '') === $roleId) {
            $assignedUsersCount++;
        }
    }

    if ($assignedUsersCount > 0) {
        throw new RuntimeException('Không thể xóa vai trò này vì đang có ' . $assignedUsersCount . ' người dùng được gán. Vui lòng chuyển vai trò của họ trước.');
    }

    $roles = admin_roles_list();
    $roles = array_values(array_filter($roles, static fn ($r) => $r['id'] !== $roleId));
    admin_roles_save($roles);

    admin_activity_log_create([
        'actorName' => $actorUsername ?? 'Admin',
        'actorRole' => 'Quản trị viên',
        'action' => 'Xóa vai trò: ' . $role['name'],
        'targetType' => 'role',
        'targetId' => $roleId,
        'targetName' => $role['name'],
        'details' => 'Đã xóa vai trò ' . $role['name'] . ' (' . $roleId . ')',
    ]);

    return true;
}

// -------------------------------------------------------------
// USER OVERRIDES STORE
// -------------------------------------------------------------
function admin_user_overrides_load(): array
{
    $path = admin_user_overrides_file_path();
    if (!is_file($path)) {
        return [];
    }

    $raw = file_get_contents($path);
    $data = $raw === false ? null : json_decode($raw, true);
    return is_array($data) ? $data : [];
}

function admin_user_overrides_save(array $overrides): void
{
    admin_write_json_file(admin_user_overrides_file_path(), $overrides);
}

function admin_user_override_get(string $userId): array
{
    $all = admin_user_overrides_load();
    return $all[$userId] ?? [
        'allowPermissions' => [],
        'denyPermissions' => [],
        'dataScope' => '',
        'updatedAt' => null,
        'updatedBy' => null,
    ];
}

function admin_user_override_save(string $userId, array $overrideData, ?string $actorUsername = 'admin'): array
{
    $user = admin_user_find_by_id($userId);
    if ($user === null) {
        throw new RuntimeException('Không tìm thấy tài khoản người dùng.');
    }

    if (!empty($user['isSuperAdmin']) || $user['username'] === 'admin') {
        throw new RuntimeException('Tài khoản Super Administrator luôn có toàn quyền và không thể bị ghi đè quyền.');
    }

    $all = admin_user_overrides_load();
    $oldOverride = $all[$userId] ?? ['allowPermissions' => [], 'denyPermissions' => [], 'dataScope' => ''];

    $allow = is_array($overrideData['allowPermissions'] ?? null)
        ? array_values(array_unique($overrideData['allowPermissions']))
        : [];
    $deny = is_array($overrideData['denyPermissions'] ?? null)
        ? array_values(array_unique($overrideData['denyPermissions']))
        : [];
    $dataScope = trim((string) ($overrideData['dataScope'] ?? ''));
    if ($dataScope !== '' && !in_array($dataScope, ['own', 'assigned', 'team', 'department', 'all'], true)) {
        $dataScope = '';
    }

    $entry = [
        'allowPermissions' => $allow,
        'denyPermissions' => $deny,
        'dataScope' => $dataScope,
        'updatedAt' => date('Y-m-d H:i:s'),
        'updatedBy' => $actorUsername ?? 'Admin',
        'reason' => trim((string) ($overrideData['reason'] ?? '')),
    ];

    $all[$userId] = $entry;
    admin_user_overrides_save($all);

    admin_activity_log_create([
        'actorName' => $actorUsername ?? 'Admin',
        'actorRole' => 'Quản trị viên',
        'action' => 'Thiết lập quyền riêng cho: ' . $user['fullName'],
        'targetType' => 'user_override',
        'targetId' => $userId,
        'targetName' => $user['fullName'],
        'details' => 'Cấp thêm: ' . count($allow) . ' quyền | Thu hồi: ' . count($deny) . ' quyền' . ($dataScope !== '' ? ' | Phạm vi: ' . $dataScope : ''),
        'changes' => [
            ['field' => 'allowPermissions', 'fieldLabel' => 'Quyền cấp thêm (ALLOW)', 'before' => count($oldOverride['allowPermissions'] ?? []), 'after' => count($allow)],
            ['field' => 'denyPermissions', 'fieldLabel' => 'Quyền thu hồi (DENY)', 'before' => count($oldOverride['denyPermissions'] ?? []), 'after' => count($deny)],
            ['field' => 'dataScope', 'fieldLabel' => 'Ghi đè phạm vi', 'before' => $oldOverride['dataScope'] ?? 'Mặc định', 'after' => $dataScope ?: 'Mặc định'],
        ],
    ]);

    admin_notification_create([
        'eventType' => 'permission.override',
        'category' => 'system',
        'title' => 'Thay đổi quyền riêng: ' . $user['fullName'],
        'message' => 'Người dùng ' . ($actorUsername ?? 'Admin') . ' vừa cập nhật quyền riêng cho tài khoản ' . $user['username'] . '.',
        'actor' => ['id' => $actorUsername ?? 'admin', 'name' => $actorUsername ?? 'Admin', 'role' => 'Super Admin'],
        'target' => ['type' => 'user', 'id' => $userId, 'code' => $user['username'], 'name' => $user['fullName'], 'url' => '/quan-tri-viejap?section=users&tab=overrides&id=' . $userId],
        'priority' => 'high',
    ]);

    return $entry;
}

function admin_user_override_reset(string $userId, ?string $actorUsername = 'admin'): bool
{
    $user = admin_user_find_by_id($userId);
    if ($user === null) {
        throw new RuntimeException('Không tìm thấy tài khoản người dùng.');
    }

    $all = admin_user_overrides_load();
    if (!isset($all[$userId])) {
        return true;
    }

    unset($all[$userId]);
    admin_user_overrides_save($all);

    admin_activity_log_create([
        'actorName' => $actorUsername ?? 'Admin',
        'actorRole' => 'Quản trị viên',
        'action' => 'Khôi phục quyền mặc định theo vai trò cho: ' . $user['fullName'],
        'targetType' => 'user_override',
        'targetId' => $userId,
        'targetName' => $user['fullName'],
        'details' => 'Đã xóa toàn bộ quyền riêng ALLOW / DENY.',
    ]);

    return true;
}

// -------------------------------------------------------------
// USERS STORE & SUPER ADMIN PROTECTION
// -------------------------------------------------------------
function admin_ensure_super_admin_record(array &$users): array
{
    $existingAccount = admin_load_account();
    $adminPasswordHash = $existingAccount['passwordHash'] ?? VIEJAP_ADMIN_INITIAL_PASSWORD_HASH;

    foreach ($users as &$user) {
        if (strtolower($user['username'] ?? '') === 'admin') {
            $user['isSuperAdmin'] = true;
            $user['roleId'] = 'super_admin';
            $user['roleName'] = 'Super Administrator';
            $user['status'] = 'active';
            $user['passwordHash'] = $adminPasswordHash;
            if (!isset($user['avatarUrl'])) {
                $user['avatarUrl'] = 'assets/images/logo.png';
            }
            return $user;
        }
    }
    unset($user);

    $superAdmin = [
        'id' => 'usr-super-admin',
        'username' => 'admin',
        'fullName' => 'Super Administrator',
        'email' => 'admin@viejap.com',
        'phone' => '0966 966 284',
        'roleId' => 'super_admin',
        'roleName' => 'Super Administrator',
        'department' => 'Ban Giám Đốc',
        'status' => 'active',
        'avatarUrl' => 'assets/images/logo.png',
        'isSuperAdmin' => true,
        'passwordHash' => $adminPasswordHash,
        'createdAt' => '2026-01-01 00:00:00',
        'lastLoginAt' => date('Y-m-d H:i:s'),
        'notes' => 'Tài khoản quản trị viên tối cao được bảo vệ đặc biệt của hệ thống VieJap.',
    ];

    array_unshift($users, $superAdmin);
    return $superAdmin;
}

function admin_users_seed_data(): array
{
    $now = date('Y-m-d H:i:s');
    $defaultPasswordHash = password_hash('VieJap@2026', PASSWORD_DEFAULT);

    $users = [
        [
            'id' => 'usr-mai-nguyen',
            'username' => 'mai.nguyen',
            'fullName' => 'Nguyễn Thị Mai',
            'email' => 'mai.nguyen@viejap.com',
            'phone' => '0912 345 678',
            'roleId' => 'document_specialist',
            'roleName' => 'Chuyên viên Xử lý Hồ sơ',
            'department' => 'Phòng Hồ Sơ & Đối Ngoại',
            'status' => 'active',
            'avatarUrl' => '',
            'isSuperAdmin' => false,
            'passwordHash' => $defaultPasswordHash,
            'createdAt' => '2026-01-15 08:30:00',
            'lastLoginAt' => date('Y-m-d H:i:s', time() - 3600 * 4),
            'notes' => 'Chuyên trách kiểm tra sơ yếu lý lịch và giấy tờ học viên.',
        ],
        [
            'id' => 'usr-binh-tran',
            'username' => 'binh.tran',
            'fullName' => 'Trần Văn Bình',
            'email' => 'binh.tran@viejap.com',
            'phone' => '0987 654 321',
            'roleId' => 'recruitment_lead',
            'roleName' => 'Trưởng phòng Tuyển dụng',
            'department' => 'Phòng Tuyển Dụng XKLĐ',
            'status' => 'active',
            'avatarUrl' => '',
            'isSuperAdmin' => false,
            'passwordHash' => $defaultPasswordHash,
            'createdAt' => '2026-01-10 09:00:00',
            'lastLoginAt' => date('Y-m-d H:i:s', time() - 3600 * 12),
            'notes' => 'Quản lý các nghiệp đoàn đối tác Nhật Bản và đơn hàng.',
        ],
        [
            'id' => 'usr-yen-le',
            'username' => 'yen.le',
            'fullName' => 'Lê Hoàng Yến',
            'email' => 'yen.le@viejap.com',
            'phone' => '0933 221 100',
            'roleId' => 'training_officer',
            'roleName' => 'Cán bộ Đào tạo Tiếng Nhật',
            'department' => 'Trung Tâm Đào Tạo Tiếng Nhật',
            'status' => 'active',
            'avatarUrl' => '',
            'isSuperAdmin' => false,
            'passwordHash' => $defaultPasswordHash,
            'createdAt' => '2026-01-20 10:15:00',
            'lastLoginAt' => date('Y-m-d H:i:s', time() - 3600 * 24),
            'notes' => 'Phụ trách giảng dạy và khảo sát trình độ tiếng Nhật N5-N4.',
        ],
    ];

    admin_ensure_super_admin_record($users);
    return $users;
}

function admin_users_list(): array
{
    $path = admin_users_file_path();
    if (!is_file($path)) {
        $users = admin_users_seed_data();
        admin_write_json_file($path, $users);
        return $users;
    }

    $raw = file_get_contents($path);
    $users = $raw === false ? null : json_decode($raw, true);
    if (!is_array($users) || empty($users)) {
        $users = admin_users_seed_data();
        admin_write_json_file($path, $users);
        return $users;
    }

    // Ensure super admin is always present and active
    $modified = false;
    $hasSuperAdmin = false;
    foreach ($users as &$u) {
        if (strtolower($u['username'] ?? '') === 'admin') {
            $hasSuperAdmin = true;
            if (empty($u['isSuperAdmin']) || ($u['status'] ?? '') !== 'active' || ($u['roleId'] ?? '') !== 'super_admin') {
                $u['isSuperAdmin'] = true;
                $u['status'] = 'active';
                $u['roleId'] = 'super_admin';
                $u['roleName'] = 'Super Administrator';
                $modified = true;
            }
            break;
        }
    }
    unset($u);

    if (!$hasSuperAdmin) {
        admin_ensure_super_admin_record($users);
        $modified = true;
    }

    if ($modified) {
        admin_write_json_file($path, $users);
    }

    return $users;
}

function admin_users_save(array $users): void
{
    // Guarantee Super Admin protection before persisting
    admin_ensure_super_admin_record($users);
    admin_write_json_file(admin_users_file_path(), $users);
}

function admin_user_find_by_username(string $username): ?array
{
    $normalized = strtolower(trim($username));
    $users = admin_users_list();
    foreach ($users as $user) {
        if (strtolower((string) $user['username']) === $normalized) {
            return $user;
        }
    }
    return null;
}

function admin_user_find_by_id(string $id): ?array
{
    $users = admin_users_list();
    foreach ($users as $user) {
        if ((string) $user['id'] === $id) {
            return $user;
        }
    }
    return null;
}

function admin_user_find_by_email(string $email): ?array
{
    $normalized = strtolower(trim($email));
    if ($normalized === '') {
        return null;
    }
    $users = admin_users_list();
    foreach ($users as $user) {
        if (strtolower((string) ($user['email'] ?? '')) === $normalized) {
            return $user;
        }
    }
    return null;
}

// -------------------------------------------------------------
// USER CRUD OPERATIONS
// -------------------------------------------------------------
function admin_user_create(array $data, ?string $actorUsername = 'admin'): array
{
    $username = strtolower(trim((string) ($data['username'] ?? '')));
    $fullName = trim((string) ($data['fullName'] ?? ''));
    $email = strtolower(trim((string) ($data['email'] ?? '')));
    $phone = trim((string) ($data['phone'] ?? ''));
    $password = (string) ($data['password'] ?? '');
    $roleId = trim((string) ($data['roleId'] ?? 'viewer'));
    $department = trim((string) ($data['department'] ?? 'Văn Phòng'));
    $status = in_array($data['status'] ?? '', ['active', 'locked'], true) ? (string) $data['status'] : 'active';
    $notes = trim((string) ($data['notes'] ?? ''));
    $avatarUrl = trim((string) ($data['avatarUrl'] ?? ''));

    if ($username === '' || !preg_match('/^[a-zA-Z0-9._-]{3,40}$/', $username)) {
        throw new InvalidArgumentException('Tên đăng nhập từ 3 đến 40 ký tự chữ, số hoặc dấu gạch.');
    }

    if ($fullName === '') {
        throw new InvalidArgumentException('Vui lòng nhập họ và tên.');
    }

    if ($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        throw new InvalidArgumentException('Địa chỉ email không hợp lệ.');
    }

    if (strlen($password) < 6) {
        throw new InvalidArgumentException('Mật khẩu ban đầu phải có ít nhất 6 ký tự.');
    }

    if (admin_user_find_by_username($username) !== null) {
        throw new RuntimeException('Tên đăng nhập "' . $username . '" đã tồn tại.');
    }

    if (admin_user_find_by_email($email) !== null) {
        throw new RuntimeException('Địa chỉ email "' . $email . '" đã được sử dụng.');
    }

    $role = admin_role_find($roleId);
    if ($role === null) {
        $roleId = 'viewer';
        $roleName = 'Khách xem nội bộ';
    } else {
        $roleName = $role['name'];
    }

    // Normal users cannot be created as super_admin unless authorized
    $isSuperAdmin = ($roleId === 'super_admin');

    $now = date('Y-m-d H:i:s');
    $newUser = [
        'id' => 'usr-' . bin2hex(random_bytes(6)),
        'username' => $username,
        'fullName' => $fullName,
        'email' => $email,
        'phone' => $phone,
        'roleId' => $roleId,
        'roleName' => $roleName,
        'department' => $department,
        'status' => $status,
        'avatarUrl' => $avatarUrl,
        'isSuperAdmin' => $isSuperAdmin,
        'passwordHash' => password_hash($password, PASSWORD_DEFAULT),
        'createdAt' => $now,
        'lastLoginAt' => null,
        'notes' => $notes,
    ];

    $users = admin_users_list();
    $users[] = $newUser;
    admin_users_save($users);

    $userChanges = [
        ['field' => 'username', 'fieldLabel' => 'Tên đăng nhập', 'before' => null, 'after' => $username],
        ['field' => 'fullName', 'fieldLabel' => 'Họ và tên', 'before' => null, 'after' => $fullName],
        ['field' => 'roleId', 'fieldLabel' => 'Vai trò', 'before' => null, 'after' => $roleName],
        ['field' => 'department', 'fieldLabel' => 'Phòng ban', 'before' => null, 'after' => $department],
        ['field' => 'status', 'fieldLabel' => 'Trạng thái', 'before' => null, 'after' => $status],
    ];
    if ($avatarUrl !== '') {
        $userChanges[] = ['field' => 'avatarUrl', 'fieldLabel' => 'Ảnh đại diện', 'before' => null, 'after' => 'Đã tải ảnh lên'];
    }

    admin_activity_log_create([
        'actorName' => $actorUsername ?? 'Admin',
        'actorRole' => 'Quản trị viên',
        'action' => 'Tạo tài khoản mới: ' . $fullName,
        'targetType' => 'user',
        'targetId' => $newUser['id'],
        'targetName' => $fullName,
        'details' => 'Tên đăng nhập: ' . $username . ' | Vai trò: ' . $roleName . ' | Phòng ban: ' . $department,
        'changes' => $userChanges,
    ]);

    admin_notification_create([
        'eventType' => 'user.created',
        'category' => 'system',
        'title' => 'Tài khoản cán bộ mới: ' . $fullName,
        'message' => 'Người dùng ' . ($actorUsername ?? 'Admin') . ' vừa khởi tạo tài khoản ' . $username . ' (Vai trò: ' . $roleName . ').',
        'actor' => ['id' => $actorUsername ?? 'admin', 'name' => $actorUsername ?? 'Admin', 'role' => 'Quản trị viên'],
        'target' => ['type' => 'user', 'id' => $newUser['id'], 'code' => $username, 'name' => $fullName, 'url' => '/quan-tri-viejap?section=users&id=' . $newUser['id']],
        'priority' => 'medium',
    ]);

    $safeUser = $newUser;
    unset($safeUser['passwordHash']);
    return $safeUser;
}

function admin_user_update(string $id, array $data, ?string $actorUsername = 'admin'): array
{
    $users = admin_users_list();
    $targetIndex = -1;
    for ($i = 0; $i < count($users); $i++) {
        if ($users[$i]['id'] === $id) {
            $targetIndex = $i;
            break;
        }
    }

    if ($targetIndex === -1) {
        throw new RuntimeException('Không tìm thấy tài khoản người dùng.');
    }

    $existing = $users[$targetIndex];
    $isSuper = !empty($existing['isSuperAdmin']) || ($existing['username'] === 'admin');

    $fullName = isset($data['fullName']) ? trim((string) $data['fullName']) : $existing['fullName'];
    $email = isset($data['email']) ? strtolower(trim((string) $data['email'])) : $existing['email'];
    $phone = isset($data['phone']) ? trim((string) $data['phone']) : ($existing['phone'] ?? '');
    $department = isset($data['department']) ? trim((string) $data['department']) : ($existing['department'] ?? '');
    $notes = isset($data['notes']) ? trim((string) $data['notes']) : ($existing['notes'] ?? '');

    if ($fullName === '') {
        throw new InvalidArgumentException('Họ và tên không được để trống.');
    }

    if ($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        throw new InvalidArgumentException('Địa chỉ email không hợp lệ.');
    }

    // Check email conflict
    $other = admin_user_find_by_email($email);
    if ($other !== null && $other['id'] !== $id) {
        throw new RuntimeException('Địa chỉ email "' . $email . '" đã thuộc về tài khoản khác.');
    }

    $changes = [];

    // Username update (allowed for non-superadmin accounts)
    if (!$isSuper && isset($data['username'])) {
        $newUsername = strtolower(trim((string) $data['username']));
        if ($newUsername === '' || !preg_match('/^[a-zA-Z0-9._-]{3,40}$/', $newUsername)) {
            throw new InvalidArgumentException('Tên đăng nhập từ 3 đến 40 ký tự chữ, số hoặc dấu gạch.');
        }
        if ($newUsername !== strtolower($existing['username'])) {
            $conflict = admin_user_find_by_username($newUsername);
            if ($conflict !== null && $conflict['id'] !== $id) {
                throw new RuntimeException('Tên đăng nhập "' . $newUsername . '" đã có người sử dụng.');
            }
            $changes[] = ['field' => 'username', 'fieldLabel' => 'Tên đăng nhập', 'before' => $existing['username'], 'after' => $newUsername];
            $users[$targetIndex]['username'] = $newUsername;
        }
    }

    // Avatar URL update (allowed for all accounts)
    if (array_key_exists('avatarUrl', $data)) {
        $avatarUrl = trim((string) $data['avatarUrl']);
        $oldAvatar = (string) ($existing['avatarUrl'] ?? '');
        if ($oldAvatar !== $avatarUrl) {
            $changes[] = [
                'field' => 'avatarUrl',
                'fieldLabel' => 'Ảnh đại diện',
                'before' => $oldAvatar !== '' ? 'Có ảnh đại diện' : '(Chưa có ảnh)',
                'after' => $avatarUrl !== '' ? 'Đã đổi ảnh mới' : '(Đã xóa ảnh)',
            ];
            $users[$targetIndex]['avatarUrl'] = $avatarUrl;
        }
    }

    $roleId = $existing['roleId'];
    $roleName = $existing['roleName'];
    if (!$isSuper && isset($data['roleId'])) {
        $newRoleId = trim((string) $data['roleId']);
        $role = admin_role_find($newRoleId);
        if ($role !== null) {
            $roleId = $newRoleId;
            $roleName = $role['name'];
        }
    }

    $status = $existing['status'];
    if (!$isSuper && isset($data['status'])) {
        $status = in_array($data['status'], ['active', 'locked'], true) ? (string) $data['status'] : $existing['status'];
    }

    if ($existing['fullName'] !== $fullName) {
        $changes[] = ['field' => 'fullName', 'fieldLabel' => 'Họ và tên', 'before' => $existing['fullName'], 'after' => $fullName];
    }
    if ($existing['email'] !== $email) {
        $changes[] = ['field' => 'email', 'fieldLabel' => 'Email', 'before' => $existing['email'], 'after' => $email];
    }
    if (($existing['phone'] ?? '') !== $phone) {
        $changes[] = ['field' => 'phone', 'fieldLabel' => 'Số điện thoại', 'before' => $existing['phone'] ?? '(Trống)', 'after' => $phone ?: '(Trống)'];
    }
    if (($existing['department'] ?? '') !== $department) {
        $changes[] = ['field' => 'department', 'fieldLabel' => 'Phòng ban', 'before' => $existing['department'] ?? '(Trống)', 'after' => $department ?: '(Trống)'];
    }
    if ($existing['roleId'] !== $roleId) {
        $changes[] = ['field' => 'roleId', 'fieldLabel' => 'Vai trò', 'before' => $existing['roleName'], 'after' => $roleName];
    }
    if ($existing['status'] !== $status) {
        $changes[] = ['field' => 'status', 'fieldLabel' => 'Trạng thái', 'before' => $existing['status'], 'after' => $status];
    }
    if (($existing['notes'] ?? '') !== $notes) {
        $changes[] = ['field' => 'notes', 'fieldLabel' => 'Ghi chú nội bộ', 'before' => $existing['notes'] ?? '(Trống)', 'after' => $notes ?: '(Trống)'];
    }

    $users[$targetIndex]['fullName'] = $fullName;
    $users[$targetIndex]['email'] = $email;
    $users[$targetIndex]['phone'] = $phone;
    $users[$targetIndex]['department'] = $department;
    $users[$targetIndex]['roleId'] = $roleId;
    $users[$targetIndex]['roleName'] = $roleName;
    $users[$targetIndex]['status'] = $status;
    $users[$targetIndex]['notes'] = $notes;

    // Optional password reset
    if (!empty($data['password'])) {
        $password = (string) $data['password'];
        if (strlen($password) < 6) {
            throw new InvalidArgumentException('Mật khẩu mới phải có ít nhất 6 ký tự.');
        }
        $newHash = password_hash($password, PASSWORD_DEFAULT);
        $users[$targetIndex]['passwordHash'] = $newHash;

        if ($isSuper) {
            // Also sync account.json
            admin_save_account([
                'username' => 'admin',
                'passwordHash' => $newHash,
                'passwordChangedAt' => date('Y-m-d H:i:s'),
            ]);
        }
        $changes[] = ['field' => 'password', 'fieldLabel' => 'Mật khẩu', 'before' => '***', 'after' => 'Đã đổi mới'];
    }

    admin_users_save($users);

    if (!empty($changes)) {
        admin_activity_log_create([
            'actorName' => $actorUsername ?? 'Admin',
            'actorRole' => 'Quản trị viên',
            'action' => 'Cập nhật tài khoản: ' . $fullName,
            'targetType' => 'user',
            'targetId' => $id,
            'targetName' => $fullName,
            'details' => 'Đã thay đổi thông tin tài khoản ' . $existing['username'],
            'changes' => $changes,
        ]);
    }

    $safe = $users[$targetIndex];
    unset($safe['passwordHash']);
    return $safe;
}

function admin_user_toggle_status(string $id, ?string $actorUsername = 'admin'): array
{
    $users = admin_users_list();
    $targetIndex = -1;
    for ($i = 0; $i < count($users); $i++) {
        if ($users[$i]['id'] === $id) {
            $targetIndex = $i;
            break;
        }
    }

    if ($targetIndex === -1) {
        throw new RuntimeException('Không tìm thấy tài khoản.');
    }

    $user = $users[$targetIndex];
    if (!empty($user['isSuperAdmin']) || ($user['username'] === 'admin')) {
        throw new RuntimeException('Không thể khóa tài khoản Super Administrator hệ thống.');
    }

    $newStatus = ($user['status'] === 'active') ? 'locked' : 'active';
    $users[$targetIndex]['status'] = $newStatus;
    admin_users_save($users);

    $actionName = ($newStatus === 'locked') ? 'Khóa tài khoản: ' : 'Mở khóa tài khoản: ';
    admin_activity_log_create([
        'actorName' => $actorUsername ?? 'Admin',
        'actorRole' => 'Quản trị viên',
        'action' => $actionName . $user['fullName'],
        'targetType' => 'user',
        'targetId' => $id,
        'targetName' => $user['fullName'],
        'details' => 'Trạng thái mới: ' . ($newStatus === 'active' ? 'Đang hoạt động' : 'Đã khóa'),
        'changes' => [
            ['field' => 'status', 'fieldLabel' => 'Trạng thái', 'before' => $user['status'], 'after' => $newStatus],
        ],
    ]);

    admin_notification_create([
        'eventType' => ($newStatus === 'locked') ? 'user.locked' : 'user.unlocked',
        'category' => 'system',
        'title' => ($newStatus === 'locked' ? 'Tài khoản bị khóa: ' : 'Mở khóa tài khoản: ') . $user['fullName'],
        'message' => 'Tài khoản ' . $user['username'] . ' vừa được ' . ($actorUsername ?? 'Admin') . ($newStatus === 'locked' ? ' chuyển sang trạng thái ĐÃ KHÓA.' : ' mở khóa hoạt động trở lại.'),
        'actor' => ['id' => $actorUsername ?? 'admin', 'name' => $actorUsername ?? 'Admin', 'role' => 'Quản trị viên'],
        'target' => ['type' => 'user', 'id' => $id, 'code' => $user['username'], 'name' => $user['fullName'], 'url' => '/quan-tri-viejap?section=users&id=' . $id],
        'priority' => ($newStatus === 'locked') ? 'high' : 'medium',
    ]);

    $safe = $users[$targetIndex];
    unset($safe['passwordHash']);
    return $safe;
}

function admin_user_reset_password(string $id, string $newPassword, ?string $actorUsername = 'admin'): bool
{
    if (strlen($newPassword) < 6) {
        throw new InvalidArgumentException('Mật khẩu mới phải có ít nhất 6 ký tự.');
    }

    $users = admin_users_list();
    $targetIndex = -1;
    for ($i = 0; $i < count($users); $i++) {
        if ($users[$i]['id'] === $id) {
            $targetIndex = $i;
            break;
        }
    }

    if ($targetIndex === -1) {
        throw new RuntimeException('Không tìm thấy tài khoản.');
    }

    $user = $users[$targetIndex];
    $newHash = password_hash($newPassword, PASSWORD_DEFAULT);
    $users[$targetIndex]['passwordHash'] = $newHash;

    if (!empty($user['isSuperAdmin']) || ($user['username'] === 'admin')) {
        admin_save_account([
            'username' => 'admin',
            'passwordHash' => $newHash,
            'passwordChangedAt' => date('Y-m-d H:i:s'),
        ]);
    }

    admin_users_save($users);

    admin_activity_log_create([
        'actorName' => $actorUsername ?? 'Admin',
        'actorRole' => 'Quản trị viên',
        'action' => 'Đặt lại mật khẩu cho: ' . $user['fullName'],
        'targetType' => 'user',
        'targetId' => $id,
        'targetName' => $user['fullName'],
        'details' => 'Người thực hiện: ' . ($actorUsername ?? 'Admin'),
    ]);

    return true;
}

function admin_user_delete(string $id, ?string $actorUsername = 'admin'): bool
{
    $users = admin_users_list();
    $target = null;
    $filtered = [];

    foreach ($users as $user) {
        if ($user['id'] === $id) {
            $target = $user;
        } else {
            $filtered[] = $user;
        }
    }

    if ($target === null) {
        return false;
    }

    if (!empty($target['isSuperAdmin']) || ($target['username'] === 'admin')) {
        throw new RuntimeException('Không thể xóa tài khoản Super Administrator hệ thống.');
    }

    admin_users_save($filtered);

    // Also remove any overrides
    $allOverrides = admin_user_overrides_load();
    if (isset($allOverrides[$id])) {
        unset($allOverrides[$id]);
        admin_user_overrides_save($allOverrides);
    }

    admin_activity_log_create([
        'actorName' => $actorUsername ?? 'Admin',
        'actorRole' => 'Quản trị viên',
        'action' => 'Xóa tài khoản: ' . $target['fullName'],
        'targetType' => 'user',
        'targetId' => $id,
        'targetName' => $target['fullName'],
        'details' => 'Đã xóa tài khoản ' . $target['username'] . ' (' . $target['email'] . ')',
    ]);

    admin_notification_create([
        'eventType' => 'user.deleted',
        'category' => 'system',
        'title' => 'Xóa tài khoản: ' . $target['fullName'],
        'message' => 'Người dùng ' . ($actorUsername ?? 'Admin') . ' vừa xóa tài khoản ' . $target['username'] . ' khỏi hệ thống.',
        'actor' => ['id' => $actorUsername ?? 'admin', 'name' => $actorUsername ?? 'Admin', 'role' => 'Quản trị viên'],
        'target' => ['type' => 'user', 'id' => $id, 'code' => $target['username'], 'name' => $target['fullName'], 'url' => '/quan-tri-viejap?section=users'],
        'priority' => 'high',
    ]);

    return true;
}

// -------------------------------------------------------------
// EFFECTIVE PERMISSION CALCULATION (RBAC + USER OVERRIDE)
// Formula: Effective = (Role + Allow) - Deny
// -------------------------------------------------------------
function admin_user_effective_permissions(array $user, ?array $role = null, ?array $override = null): array
{
    $allKeys = admin_all_permission_keys();

    if (!empty($user['isSuperAdmin']) || ($user['username'] === 'admin') || (($user['roleId'] ?? '') === 'super_admin')) {
        return [
            'isSuperAdmin' => true,
            'dataScope' => 'all',
            'rolePermissions' => $allKeys,
            'allowPermissions' => [],
            'denyPermissions' => [],
            'effectivePermissions' => $allKeys,
        ];
    }

    if (($user['status'] ?? 'active') !== 'active') {
        return [
            'isSuperAdmin' => false,
            'dataScope' => 'own',
            'rolePermissions' => [],
            'allowPermissions' => [],
            'denyPermissions' => [],
            'effectivePermissions' => [],
        ];
    }

    if ($role === null) {
        $role = admin_role_find((string) ($user['roleId'] ?? ''));
    }

    $rolePermissions = is_array($role['permissions'] ?? null) ? $role['permissions'] : [];
    $roleDataScope = (string) ($role['dataScope'] ?? 'assigned');

    if ($override === null) {
        $override = admin_user_override_get((string) $user['id']);
    }

    $allow = is_array($override['allowPermissions'] ?? null) ? $override['allowPermissions'] : [];
    $deny = is_array($override['denyPermissions'] ?? null) ? $override['denyPermissions'] : [];
    $dataScopeOverride = trim((string) ($override['dataScope'] ?? ''));
    $effectiveDataScope = $dataScopeOverride !== '' ? $dataScopeOverride : $roleDataScope;

    // Formula: (Role + Allow) - Deny
    // DENY takes precedence over ALLOW
    $combined = array_unique(array_merge($rolePermissions, $allow));
    $effective = array_values(array_diff($combined, $deny));

    return [
        'isSuperAdmin' => false,
        'dataScope' => $effectiveDataScope,
        'rolePermissions' => array_values($rolePermissions),
        'allowPermissions' => array_values($allow),
        'denyPermissions' => array_values($deny),
        'effectivePermissions' => $effective,
    ];
}

// -------------------------------------------------------------
// AUTHORIZATION MIDDLEWARE FUNCTION
// -------------------------------------------------------------
function admin_require_permission(array $session, string $permissionKey): array
{
    $username = (string) ($session['username'] ?? '');
    if ($username === '') {
        admin_respond(401, ['message' => 'Phiên đăng nhập đã hết hạn hoặc không hợp lệ.']);
    }

    $user = admin_user_find_by_username($username);
    if ($user === null) {
        if ($username === 'admin') {
            $users = admin_users_list();
            $user = admin_ensure_super_admin_record($users);
        } else {
            admin_destroy_session();
            admin_respond(401, ['message' => 'Tài khoản không tồn tại. Vui lòng đăng nhập lại.']);
        }
    }

    if (($user['status'] ?? 'active') !== 'active') {
        admin_destroy_session();
        admin_respond(403, ['message' => 'Tài khoản của bạn đã bị khóa. Vui lòng liên hệ Quản trị viên.']);
    }

    $calc = admin_user_effective_permissions($user);
    if ($calc['isSuperAdmin']) {
        return $user;
    }

    if (!in_array($permissionKey, $calc['effectivePermissions'], true)) {
        admin_respond(403, [
            'message' => 'Bạn không có quyền thực hiện thao tác này (' . $permissionKey . ').',
            'requiredPermission' => $permissionKey,
        ]);
    }

    return $user;
}

