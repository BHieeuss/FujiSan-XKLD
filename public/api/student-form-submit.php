<?php
declare(strict_types=1);

const MAX_WORKBOOK_SIZE = 10 * 1024 * 1024;
const DRIVE_WEBHOOK_URL = '__VIEJAP_DRIVE_WEBHOOK_URL__';
const DRIVE_WEBHOOK_SECRET = '__VIEJAP_DRIVE_WEBHOOK_SECRET__';

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');
header('Referrer-Policy: no-referrer');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond(405, ['message' => 'Phương thức không được hỗ trợ.']);
}

if (!empty($_POST['website'] ?? '')) {
    respond(200, [
        'submissionId' => 'ignored',
        'driveSaved' => false,
        'message' => 'Yêu cầu đã được tiếp nhận.',
    ]);
}

if (($_POST['consent'] ?? '') !== 'accepted') {
    respond(422, ['message' => 'Bạn chưa xác nhận đồng ý gửi và lưu trữ hồ sơ.']);
}

$fullName = clean_text($_POST['fullName'] ?? '', 120);
$phone = clean_text($_POST['phone'] ?? '', 30);
$idNumber = clean_text($_POST['idNumber'] ?? '', 30);

if ($fullName === '' || $phone === '' || $idNumber === '') {
    respond(422, ['message' => 'Họ tên, số điện thoại và số CMT/CCCD là bắt buộc.']);
}

if (!isset($_FILES['workbook']) || !is_array($_FILES['workbook'])) {
    respond(422, ['message' => 'Không tìm thấy file Excel của hồ sơ.']);
}

$upload = $_FILES['workbook'];
if (($upload['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK) {
    respond(422, ['message' => 'File Excel tải lên không hợp lệ.']);
}

$size = (int) ($upload['size'] ?? 0);
$temporaryPath = (string) ($upload['tmp_name'] ?? '');
if ($size < 1 || $size > MAX_WORKBOOK_SIZE || !is_uploaded_file($temporaryPath)) {
    respond(422, ['message' => 'File Excel vượt quá giới hạn hoặc không hợp lệ.']);
}

validate_workbook($temporaryPath);
enforce_rate_limit();

$submissionId = date('Ymd-His') . '-' . bin2hex(random_bytes(4));
$safeName = safe_filename($fullName);
$filename = sprintf('%s-%s.xlsx', $submissionId, $safeName);
$storageDirectory = storage_directory();
$storedPath = $storageDirectory . DIRECTORY_SEPARATOR . $filename;

if (!move_uploaded_file($temporaryPath, $storedPath)) {
    respond(500, ['message' => 'Máy chủ không thể lưu bản dự phòng của hồ sơ.']);
}

$driveSaved = false;
$driveMessage = '';

try {
    $driveResult = send_to_drive($storedPath, [
        'submissionId' => $submissionId,
        'filename' => $filename,
        'fullName' => $fullName,
        'phone' => $phone,
        'idNumberLast4' => mb_substr($idNumber, -4),
        'submittedAt' => gmdate('c'),
    ]);
    $driveSaved = ($driveResult['ok'] ?? false) === true;
    $driveMessage = clean_text($driveResult['message'] ?? '', 300);
} catch (Throwable $error) {
    error_log('VieJap Drive upload failed: ' . $error->getMessage());
    $driveMessage = 'Google Drive chưa phản hồi.';
}

respond(200, [
    'submissionId' => $submissionId,
    'driveSaved' => $driveSaved,
    'message' => $driveSaved
        ? 'Hồ sơ đã được lưu vào Google Drive VieJap.'
        : 'Hồ sơ đã được lưu dự phòng trên máy chủ. ' . $driveMessage,
]);

function send_to_drive(string $path, array $metadata): array
{
    if (
        str_starts_with(DRIVE_WEBHOOK_URL, '__') ||
        str_starts_with(DRIVE_WEBHOOK_SECRET, '__')
    ) {
        throw new RuntimeException('Google Drive chưa được cấu hình.');
    }

    $contents = file_get_contents($path);
    if ($contents === false) {
        throw new RuntimeException('Không thể đọc file Excel đã lưu.');
    }

    $payload = json_encode([
        'secret' => DRIVE_WEBHOOK_SECRET,
        'fileName' => $metadata['filename'],
        'mimeType' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'base64' => base64_encode($contents),
        'metadata' => $metadata,
    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

    if ($payload === false) {
        throw new RuntimeException('Không thể đóng gói dữ liệu gửi Google Drive.');
    }

    $response = http_post_json(DRIVE_WEBHOOK_URL, $payload);
    $decoded = json_decode($response, true);
    if (!is_array($decoded)) {
        throw new RuntimeException('Google Drive trả về dữ liệu không hợp lệ.');
    }

    return $decoded;
}

function http_post_json(string $url, string $payload): string
{
    if (function_exists('curl_init')) {
        $curl = curl_init($url);
        curl_setopt_array($curl, [
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => $payload,
            CURLOPT_HTTPHEADER => ['Content-Type: application/json'],
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_CONNECTTIMEOUT => 10,
            CURLOPT_TIMEOUT => 30,
            CURLOPT_MAXREDIRS => 5,
        ]);
        $response = curl_exec($curl);
        $status = (int) curl_getinfo($curl, CURLINFO_RESPONSE_CODE);
        $error = curl_error($curl);
        curl_close($curl);

        if ($response === false || $status < 200 || $status >= 300) {
            throw new RuntimeException(
                sprintf('Lỗi kết nối Google Drive (%d): %s', $status, $error)
            );
        }
        return (string) $response;
    }

    $context = stream_context_create([
        'http' => [
            'method' => 'POST',
            'header' => "Content-Type: application/json\r\n",
            'content' => $payload,
            'timeout' => 30,
            'follow_location' => 1,
            'max_redirects' => 5,
            'ignore_errors' => true,
        ],
    ]);
    $response = file_get_contents($url, false, $context);
    if ($response === false) {
        throw new RuntimeException('Không thể kết nối đến Google Drive.');
    }
    return $response;
}

function validate_workbook(string $path): void
{
    $zip = new ZipArchive();
    if ($zip->open($path) !== true) {
        respond(422, ['message' => 'File tải lên không phải workbook Excel hợp lệ.']);
    }

    $requiredEntries = [
        '[Content_Types].xml',
        'xl/workbook.xml',
        'xl/worksheets/sheet1.xml',
    ];
    foreach ($requiredEntries as $entry) {
        if ($zip->locateName($entry, ZipArchive::FL_NODIR) === false) {
            $zip->close();
            respond(422, ['message' => 'Cấu trúc file Excel không hợp lệ.']);
        }
    }
    $zip->close();
}

function storage_directory(): string
{
    $home = getenv('HOME') ?: dirname(__DIR__, 3);
    $directory = $home . DIRECTORY_SEPARATOR . 'private' . DIRECTORY_SEPARATOR .
        'viejap' . DIRECTORY_SEPARATOR . 'student-forms' . DIRECTORY_SEPARATOR . date('Y-m');

    if (!is_dir($directory) && !mkdir($directory, 0700, true) && !is_dir($directory)) {
        respond(500, ['message' => 'Máy chủ không thể tạo thư mục lưu hồ sơ.']);
    }
    return $directory;
}

function enforce_rate_limit(): void
{
    $home = getenv('HOME') ?: sys_get_temp_dir();
    $directory = $home . DIRECTORY_SEPARATOR . 'private' . DIRECTORY_SEPARATOR .
        'viejap' . DIRECTORY_SEPARATOR . 'rate-limit';
    if (!is_dir($directory)) {
        @mkdir($directory, 0700, true);
    }

    $address = (string) ($_SERVER['REMOTE_ADDR'] ?? 'unknown');
    $key = hash('sha256', $address);
    $path = $directory . DIRECTORY_SEPARATOR . $key;
    $now = time();
    $last = is_file($path) ? (int) file_get_contents($path) : 0;
    if ($last > 0 && ($now - $last) < 20) {
        respond(429, ['message' => 'Bạn gửi hồ sơ quá nhanh. Vui lòng đợi ít nhất 20 giây.']);
    }
    @file_put_contents($path, (string) $now, LOCK_EX);
}

function safe_filename(string $value): string
{
    $ascii = iconv('UTF-8', 'ASCII//TRANSLIT//IGNORE', $value);
    $ascii = $ascii === false ? 'hoc-vien' : $ascii;
    $ascii = strtolower((string) preg_replace('/[^a-zA-Z0-9]+/', '-', $ascii));
    $ascii = trim($ascii, '-');
    return $ascii !== '' ? $ascii : 'hoc-vien';
}

function clean_text(mixed $value, int $maxLength): string
{
    $text = trim((string) $value);
    $text = (string) preg_replace('/[\x00-\x1F\x7F]+/u', ' ', $text);
    $text = (string) preg_replace('/\s+/u', ' ', $text);
    return mb_substr($text, 0, $maxLength);
}

function respond(int $status, array $payload): never
{
    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}
