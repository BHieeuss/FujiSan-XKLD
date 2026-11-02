<?php
declare(strict_types=1);

require_once __DIR__ . '/_student_registration_codes.php';
require_once __DIR__ . '/_rbac.php';

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');
header('Referrer-Policy: no-referrer');

$session = admin_require_session();

$action = trim((string) ($_GET['action'] ?? 'list'));
$adminName = $session['fullName'] ?? $session['username'] ?? 'Super Admin';

try {
    switch ($action) {
        case 'stats':
            admin_require_permission($session, 'student_registration_codes.view');
            $stats = admin_student_registration_codes_stats();
            echo json_encode([
                'success' => true,
                'data' => $stats,
            ]);
            break;

        case 'list':
            admin_require_permission($session, 'student_registration_codes.view');
            $filters = [
                'search' => $_GET['search'] ?? '',
                'status' => $_GET['status'] ?? 'all',
                'progressStatus' => $_GET['progressStatus'] ?? 'all',
                'assignedTo' => $_GET['assignedTo'] ?? 'all',
                'from_date' => $_GET['from_date'] ?? '',
                'to_date' => $_GET['to_date'] ?? '',
                'page' => $_GET['page'] ?? 1,
                'pageSize' => $_GET['pageSize'] ?? 10,
            ];
            $result = admin_student_registration_codes_list($filters);
            echo json_encode([
                'success' => true,
                'data' => $result,
            ]);
            break;

        case 'create':
            admin_require_permission($session, 'student_registration_codes.create');
            if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
                throw new InvalidArgumentException('Phương thức không hợp lệ.');
            }
            $input = json_decode((string) file_get_contents('php://input'), true);
            if (!is_array($input)) {
                throw new InvalidArgumentException('Dữ liệu JSON không hợp lệ.');
            }
            $record = admin_student_registration_code_create($input, $adminName);
            echo json_encode([
                'success' => true,
                'message' => "Đã tạo mã đăng ký {$record['code']} cho học viên {$record['studentName']}.",
                'data' => $record,
            ]);
            break;

        case 'create_bulk':
            admin_require_permission($session, 'student_registration_codes.create_bulk');
            if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
                throw new InvalidArgumentException('Phương thức không hợp lệ.');
            }
            $input = json_decode((string) file_get_contents('php://input'), true);
            if (!is_array($input) || !isset($input['students']) || !is_array($input['students'])) {
                throw new InvalidArgumentException('Dữ liệu danh sách học viên không hợp lệ.');
            }
            $result = admin_student_registration_code_bulk_create($input['students'], $adminName);
            echo json_encode([
                'success' => true,
                'message' => "Đã cấp thành công {$result['createdCount']} mã đăng ký.",
                'data' => $result,
            ]);
            break;

        case 'revoke':
            admin_require_permission($session, 'student_registration_codes.revoke');
            if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
                throw new InvalidArgumentException('Phương thức không hợp lệ.');
            }
            $input = json_decode((string) file_get_contents('php://input'), true);
            $id = trim((string) ($input['id'] ?? ''));
            $reason = trim((string) ($input['reason'] ?? 'Thu hồi bởi quản trị viên'));
            if ($id === '') {
                throw new InvalidArgumentException('Thiếu mã định danh cần thu hồi.');
            }
            $record = admin_student_registration_code_revoke($id, $adminName, $reason);
            echo json_encode([
                'success' => true,
                'message' => "Đã thu hồi mã đăng ký {$record['code']} của học viên {$record['studentName']}.",
                'data' => $record,
            ]);
            break;

        case 'reissue':
            admin_require_permission($session, 'student_registration_codes.reissue');
            if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
                throw new InvalidArgumentException('Phương thức không hợp lệ.');
            }
            $input = json_decode((string) file_get_contents('php://input'), true);
            $id = trim((string) ($input['id'] ?? ''));
            if ($id === '') {
                throw new InvalidArgumentException('Thiếu mã định danh cần cấp lại.');
            }
            $record = admin_student_registration_code_reissue($id, $adminName);
            echo json_encode([
                'success' => true,
                'message' => "Đã cấp lại mã mới {$record['code']} cho học viên {$record['studentName']}.",
                'data' => $record,
            ]);
            break;

        case 'export':
            admin_require_permission($session, 'student_registration_codes.export');
            $filters = [
                'search' => $_GET['search'] ?? '',
                'status' => $_GET['status'] ?? 'all',
                'progressStatus' => $_GET['progressStatus'] ?? 'all',
                'assignedTo' => $_GET['assignedTo'] ?? 'all',
                'page' => 1,
                'pageSize' => 5000,
            ];
            $listResult = admin_student_registration_codes_list($filters);
            $items = $listResult['items'] ?? [];

            // Return JSON data suitable for Excel/CSV export
            echo json_encode([
                'success' => true,
                'data' => array_map(static function ($item) {
                    $statusMap = [
                        'pending' => 'Chưa sử dụng',
                        'in_progress' => 'Đang khai',
                        'used' => 'Đã gửi hồ sơ',
                        'expired' => 'Hết hạn',
                        'revoked' => 'Đã thu hồi',
                    ];
                    $progressMap = [
                        'not_started' => 'Chưa bắt đầu',
                        'filling' => 'Đang khai',
                        'draft_saved' => 'Đã lưu bản nháp',
                        'submitted' => 'Đã gửi hồ sơ',
                        'checking' => 'Admin đang kiểm tra',
                        'need_info' => 'Cần bổ sung',
                        'approved' => 'Đã duyệt',
                    ];
                    return [
                        'studentName' => $item['studentName'] ?? '',
                        'phone' => $item['phone'] ?? '',
                        'email' => $item['email'] ?? '',
                        'code' => $item['code'] ?? '',
                        'createdAt' => $item['createdAt'] ?? '',
                        'expiresAt' => $item['expiresAt'] ?? '',
                        'status' => $statusMap[$item['status'] ?? ''] ?? ($item['status'] ?? ''),
                        'progress' => $progressMap[$item['progressStatus'] ?? ''] ?? ($item['progressStatus'] ?? ''),
                        'progressPercent' => ($item['progressPercent'] ?? 0) . '%',
                        'assignedStaffName' => $item['assignedStaffName'] ?? 'Chưa phân công',
                        'createdBy' => $item['createdBy'] ?? '',
                    ];
                }, $items),
            ]);
            break;

        case 'history':
            admin_require_permission($session, 'student_registration_codes.view_history');
            $logs = admin_student_registration_code_logs_load();
            // Return latest 100 logs
            $recent = array_slice(array_reverse($logs), 0, 100);
            echo json_encode([
                'success' => true,
                'data' => $recent,
            ]);
            break;

        case 'update_progress':
            admin_require_permission($session, 'student_registration_progress.manage');
            if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
                throw new InvalidArgumentException('Phương thức không hợp lệ.');
            }
            $input = json_decode((string) file_get_contents('php://input'), true);
            $id = trim((string) ($input['id'] ?? ''));
            $progressStatus = trim((string) ($input['progressStatus'] ?? ''));
            if ($id === '' || $progressStatus === '') {
                throw new InvalidArgumentException('Thiếu tham số cập nhật tiến độ.');
            }
            $codes = admin_student_registration_codes_load();
            $found = false;
            foreach ($codes as &$c) {
                if (($c['id'] ?? '') === $id) {
                    $c['progressStatus'] = $progressStatus;
                    $c['updatedAt'] = date('c');
                    $found = true;
                    break;
                }
            }
            unset($c);
            if (!$found) {
                throw new RuntimeException('Không tìm thấy mã đăng ký.');
            }
            admin_student_registration_codes_save($codes);
            echo json_encode(['success' => true, 'message' => 'Đã cập nhật tiến độ hồ sơ.']);
            break;

        default:
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Hành động không được hỗ trợ.']);
            break;
    }
} catch (Throwable $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage(),
    ]);
}
