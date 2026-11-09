<?php
declare(strict_types=1);

require_once __DIR__ . '/admin/_student_registration_codes.php';

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');
header('Referrer-Policy: no-referrer');

$action = trim((string) ($_GET['action'] ?? 'verify'));
$clientIp = trim((string) ($_SERVER['REMOTE_ADDR'] ?? '127.0.0.1'));

try {
    switch ($action) {
        case 'verify':
            if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
                throw new InvalidArgumentException('Phương thức yêu cầu không hợp lệ.');
            }
            $input = json_decode((string) file_get_contents('php://input'), true);
            $code = trim((string) ($input['code'] ?? ''));
            $res = student_registration_verify_code($code, $clientIp);
            if (!($res['success'] ?? false)) {
                http_response_code(400);
            }
            echo json_encode($res);
            break;

        case 'qr_verify':
            if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
                throw new InvalidArgumentException('Phương thức yêu cầu không hợp lệ.');
            }
            $input = json_decode((string) file_get_contents('php://input'), true);
            $token = trim((string) ($input['token'] ?? ''));
            $res = student_registration_verify_qr($token, $clientIp);
            if (!($res['success'] ?? false)) {
                http_response_code(400);
            }
            echo json_encode($res);
            break;

        case 'save_draft':
            if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
                throw new InvalidArgumentException('Phương thức yêu cầu không hợp lệ.');
            }
            $input = json_decode((string) file_get_contents('php://input'), true);
            $codeId = trim((string) ($input['codeId'] ?? ''));
            $sessionToken = trim((string) ($input['sessionToken'] ?? ''));
            $draftData = $input['draftData'] ?? [];
            $progressPercent = (int) ($input['progressPercent'] ?? 0);
            $currentStep = (int) ($input['currentStep'] ?? 0);

            if ($codeId === '' || $sessionToken === '' || !is_array($draftData)) {
                throw new InvalidArgumentException('Dữ liệu lưu bản nháp không đầy đủ.');
            }

            $res = student_registration_save_draft($codeId, $sessionToken, $draftData, $progressPercent, $currentStep);
            echo json_encode($res);
            break;

        case 'get_draft':
            $codeId = trim((string) ($_GET['codeId'] ?? $_POST['codeId'] ?? ''));
            $sessionToken = trim((string) ($_GET['sessionToken'] ?? $_POST['sessionToken'] ?? ''));
            if ($codeId === '' || $sessionToken === '') {
                throw new InvalidArgumentException('Thiếu mã phiên truy cập bản nháp.');
            }
            $res = student_registration_get_draft($codeId, $sessionToken);
            echo json_encode($res);
            break;

        case 'submit':
            if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
                throw new InvalidArgumentException('Phương thức yêu cầu không hợp lệ.');
            }

            // Honeypot check
            if (!empty($_POST['website'] ?? '')) {
                echo json_encode([
                    'success' => true,
                    'profileId' => 'ignored',
                    'studentCode' => 'HV-000000-0000',
                    'message' => 'Hồ sơ đã được tiếp nhận.',
                ]);
                exit;
            }

            $codeId = trim((string) ($_POST['codeId'] ?? ''));
            $sessionToken = trim((string) ($_POST['sessionToken'] ?? ''));

            if ($codeId === '' || $sessionToken === '') {
                throw new InvalidArgumentException('Thiếu thông tin mã đăng ký hoặc phiên xác thực.');
            }

            if (($_POST['consent'] ?? '') !== 'accepted') {
                throw new InvalidArgumentException('Bạn chưa xác nhận đồng ý gửi và lưu trữ hồ sơ.');
            }

            $postData = [
                'fullName' => $_POST['fullName'] ?? '',
                'phone' => $_POST['phone'] ?? '',
                'idNumber' => $_POST['idNumber'] ?? '',
                'birthDate' => $_POST['birthDate'] ?? '',
                'address' => $_POST['address'] ?? '',
                'progressPercent' => (int) ($_POST['progressPercent'] ?? 0),
                'data' => !empty($_POST['data']) && is_string($_POST['data']) ? json_decode($_POST['data'], true) : [],
            ];

            $res = student_registration_submit($codeId, $sessionToken, $postData, $_FILES);
            echo json_encode($res);
            break;

        default:
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Hành động không hỗ trợ.']);
            break;
    }
} catch (Throwable $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage(),
    ]);
}

