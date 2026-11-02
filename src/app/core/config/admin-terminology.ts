/**
 * QUY CHUẨN THUẬT NGỮ & NGÔN NGỮ TIẾNG VIỆT HỆ THỐNG QUẢN TRỊ VIEJAP
 * Định hướng: Thân thiện với nhân sự Việt Nam, dễ hiểu, dễ nhớ, không dùng từ kỹ thuật/tiếng Anh.
 */

export const ADMIN_TERMINOLOGY = {
  appName: 'VieJap Quản Trị',
  appSubTitle: 'Hệ thống quản lý nội bộ',

  // Phân hệ quản trị
  sections: {
    operations: {
      title: 'Trung tâm điều hành',
      sub: 'Thông báo & công việc cần làm',
    },
    orders: {
      title: 'Quản lý đơn hàng',
      sub: 'Danh sách, thông tin & bài viết đơn hàng',
    },
    students: {
      title: 'Hồ sơ học viên',
      sub: 'Sơ yếu lý lịch, tải file Excel & PDF',
    },
    codes: {
      title: 'Mã đăng ký học viên',
      sub: 'Cấp và quản lý mã đăng ký 6 chữ số',
    },
    users: {
      title: 'Tài khoản & Phân quyền',
      sub: 'Quản lý nhân sự, vai trò & quyền truy cập',
    },
    poster: {
      title: 'Tạo Poster tự động',
      sub: 'Đọc thông tin & thiết kế ảnh tuyển dụng',
    },
    activities: {
      title: 'Góc hoạt động',
      sub: 'Tin tức, sự kiện & hình ảnh thực tế',
    },
    events: {
      title: 'Quản lý sự kiện',
      sub: 'Popup, banner nổi & thông báo website',
    },
  },

  // Thao tác chuẩn
  actions: {
    create: 'Thêm mới',
    createOrder: 'Tạo đơn hàng',
    createCode: 'Cấp mã đăng ký',
    createUser: 'Tạo tài khoản',
    createActivity: 'Thêm hoạt động',
    edit: 'Chỉnh sửa',
    save: 'Lưu thay đổi',
    saving: 'Đang lưu...',
    delete: 'Xóa vĩnh viễn',
    deleting: 'Đang xóa...',
    cancel: 'Hủy bỏ',
    confirm: 'Xác nhận',
    back: 'Quay lại',
    backToList: 'Quay lại danh sách',
    search: 'Tìm kiếm',
    filter: 'Bộ lọc',
    clearFilter: 'Xóa bộ lọc',
    refresh: 'Làm mới',
    exportExcel: 'Xuất file Excel',
    exportPdf: 'Tải file PDF',
    importExcel: 'Nhập từ file Excel',
    uploadImage: 'Tải ảnh lên',
    preview: 'Xem trước',
    close: 'Đóng',
    copy: 'Sao chép',
    copied: 'Đã sao chép thành công',
    reissue: 'Cấp lại mã',
    revoke: 'Thu hồi mã',
    duplicate: 'Nhân bản',
    publish: 'Đăng lên trang web',
    unpublish: 'Chuyển về bản nháp',
    viewWebsite: 'Xem trên trang web',
    bulkCreate: 'Cấp mã hàng loạt',
    downloadOriginal: 'Tải ảnh gốc',
  },

  // Trạng thái chuẩn
  statuses: {
    // Trạng thái hoạt động
    active: 'Đang hoạt động',
    inactive: 'Tạm khóa',
    // Trạng thái duyệt
    draft: 'Bản nháp',
    published: 'Đang đăng tuyển',
    pending: 'Đang chờ',
    processing: 'Đang xử lý',
    approved: 'Đã duyệt',
    rejected: 'Không được duyệt',
    // Trạng thái mã đăng ký
    unused: 'Chưa sử dụng',
    used: 'Đã gửi hồ sơ',
    expired: 'Đã hết hạn',
    revoked: 'Đã thu hồi',
    // Trạng thái hồ sơ
    not_started: 'Chưa bắt đầu',
    filling: 'Đang khai thông tin',
    draft_saved: 'Đã lưu bản nháp',
    submitted: 'Đã gửi hồ sơ',
    checking: 'Đang kiểm tra hồ sơ',
    need_info: 'Cần bổ sung thông tin',
  },

  // Vai trò nhân sự
  roles: {
    super_admin: 'Quản trị viên cấp cao',
    admin: 'Quản trị viên',
    manager: 'Trưởng bộ phận',
    editor: 'Biên tập viên',
    consultant: 'Chuyên viên tư vấn',
    viewer: 'Nhân viên xem',
  },

  // Thông báo phản hồi người dùng
  messages: {
    loading: 'Đang tải dữ liệu, vui lòng đợi...',
    saving: 'Đang lưu thay đổi vào hệ thống...',
    noData: 'Chưa có dữ liệu nào phù hợp với điều kiện lọc.',
    networkError: 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra đường truyền mạng và thử lại.',
    sessionExpired: 'Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.',
    actionSuccess: 'Thao tác thực hiện thành công!',
    saveSuccess: 'Đã lưu thông tin thành công!',
    deleteSuccess: 'Đã xóa dữ liệu thành công!',
    permissionDenied: 'Bạn chưa có quyền thực hiện thao tác này. Vui lòng liên hệ Quản trị viên cấp cao.',
    deleteConfirmTitle: 'Xác nhận xóa dữ liệu?',
    deleteConfirmWarning: 'Thao tác này sẽ xóa vĩnh viễn và không thể lấy lại.',
  },
};

/**
 * Hàm lấy tên tiếng Việt chuẩn của trạng thái
 */
export function getTerminologyStatusLabel(status: string): string {
  const map: Record<string, string> = ADMIN_TERMINOLOGY.statuses;
  return map[status] || status;
}

/**
 * Hàm lấy tên tiếng Việt chuẩn của vai trò
 */
export function getTerminologyRoleLabel(role: string): string {
  const map: Record<string, string> = ADMIN_TERMINOLOGY.roles;
  return map[role] || role;
}

