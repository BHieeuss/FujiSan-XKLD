<?php
declare(strict_types=1);

require_once __DIR__ . '/admin/_student_profiles.php';

const MAX_WORKBOOK_SIZE = 10 * 1024 * 1024;
const MAX_PDF_SIZE = 20 * 1024 * 1024;
const MAX_PHOTO_SIZE = 10 * 1024 * 1024;

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');
header('Referrer-Policy: no-referrer');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond(405, ['message' => 'Phương thức không được hỗ trợ.']);
}

// Honeypot check
if (!empty($_POST['website'] ?? '')) {
    respond(200, [
        'success' => true,
        'profileId' => 'ignored',
        'studentCode' => 'HV-000000-0000',
        'message' => 'Hồ sơ đã được tiếp nhận.',
    ]);
}

if (($_POST['consent'] ?? '') !== 'accepted') {
    respond(422, ['message' => 'Bạn chưa xác nhận đồng ý gửi và lưu trữ hồ sơ.']);
}

$fullName = clean_text($_POST['fullName'] ?? '', 120);
$phone = clean_text($_POST['phone'] ?? '', 30);
$idNumber = clean_text($_POST['idNumber'] ?? '', 30);
$birthDate = clean_text($_POST['birthDate'] ?? '', 20);
$address = clean_text($_POST['address'] ?? '', 255);

if ($fullName === '' || $phone === '' || $idNumber === '') {
    respond(422, ['message' => 'Họ tên, số điện thoại và số CMT/CCCD là bắt buộc.']);
}

// Validate Workbook
if (!isset($_FILES['workbook']) || !is_array($_FILES['workbook'])) {
    respond(422, ['message' => 'Không tìm thấy file Excel của hồ sơ.']);
}
$wbUpload = $_FILES['workbook'];
if (($wbUpload['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK) {
    respond(422, ['message' => 'File Excel tải lên không hợp lệ.']);
}
$wbSize = (int) ($wbUpload['size'] ?? 0);
$wbTmp = (string) ($wbUpload['tmp_name'] ?? '');
if ($wbSize < 1 || $wbSize > MAX_WORKBOOK_SIZE || !is_uploaded_file($wbTmp)) {
    respond(422, ['message' => 'File Excel vượt quá giới hạn (10MB) hoặc không hợp lệ.']);
}

validate_workbook($wbTmp);

// Validate optional CV PDF (Sơ yếu lý lịch PDF)
$hasCvPdf = isset($_FILES['cvPdf']) && is_array($_FILES['cvPdf']) && ($_FILES['cvPdf']['error'] ?? UPLOAD_ERR_NO_FILE) === UPLOAD_ERR_OK;
$cvPdfTmp = '';
$cvPdfSize = 0;
if ($hasCvPdf) {
    $cvPdfUpload = $_FILES['cvPdf'];
    $cvPdfSize = (int) ($cvPdfUpload['size'] ?? 0);
    $cvPdfTmp = (string) ($cvPdfUpload['tmp_name'] ?? '');
    if ($cvPdfSize > 0 && $cvPdfSize <= MAX_PDF_SIZE && is_uploaded_file($cvPdfTmp)) {
        $header = file_get_contents($cvPdfTmp, false, null, 0, 5);
        if ($header !== '%PDF-') {
            $hasCvPdf = false;
        }
    } else {
        $hasCvPdf = false;
    }
}

// Validate optional PDF document (Tài liệu đính kèm)
$hasPdf = isset($_FILES['documentPdf']) && is_array($_FILES['documentPdf']) && ($_FILES['documentPdf']['error'] ?? UPLOAD_ERR_NO_FILE) === UPLOAD_ERR_OK;
$pdfTmp = '';
$pdfSize = 0;
$pdfOrigName = '';
if ($hasPdf) {
    $pdfUpload = $_FILES['documentPdf'];
    $pdfSize = (int) ($pdfUpload['size'] ?? 0);
    $pdfTmp = (string) ($pdfUpload['tmp_name'] ?? '');
    $pdfOrigName = (string) ($pdfUpload['name'] ?? 'tai-lieu.pdf');
    if ($pdfSize < 1 || $pdfSize > MAX_PDF_SIZE || !is_uploaded_file($pdfTmp)) {
        respond(422, ['message' => 'File PDF tài liệu vượt quá giới hạn cho phép (20MB).']);
    }
    // Check PDF magic bytes (%PDF-)
    $pdfHeader = file_get_contents($pdfTmp, false, null, 0, 5);
    if ($pdfHeader !== '%PDF-') {
        respond(422, ['message' => 'File đính kèm không phải định dạng PDF hợp lệ.']);
    }
}

// Validate optional photo
$hasPhoto = isset($_FILES['photo']) && is_array($_FILES['photo']) && ($_FILES['photo']['error'] ?? UPLOAD_ERR_NO_FILE) === UPLOAD_ERR_OK;
$photoTmp = '';
$photoSize = 0;
if ($hasPhoto) {
    $photoUpload = $_FILES['photo'];
    $photoSize = (int) ($photoUpload['size'] ?? 0);
    $photoTmp = (string) ($photoUpload['tmp_name'] ?? '');
    if ($photoSize > MAX_PHOTO_SIZE || !is_uploaded_file($photoTmp)) {
        respond(422, ['message' => 'Ảnh thẻ tải lên không hợp lệ hoặc quá lớn.']);
    }
}

enforce_rate_limit();

// Parse Student Form full data JSON
$rawData = $_POST['data'] ?? $_POST['studentData'] ?? '';
$formData = [];
if (is_string($rawData) && trim($rawData) !== '') {
    $decoded = json_decode($rawData, true);
    if (is_array($decoded)) {
        $formData = $decoded;
    }
}
if (empty($formData['fullName'])) {
    $formData['fullName'] = $fullName;
}
if (empty($formData['phone'])) {
    $formData['phone'] = $phone;
}
if (empty($formData['idNumber'])) {
    $formData['idNumber'] = $idNumber;
}

// Generate Profile and File paths
$profileId = admin_student_profile_generate_id();
$dir = admin_student_files_directory($profileId);

$safeName = preg_replace('/[^a-zA-Z0-9]+/', '_', strtoupper(iconv('UTF-8', 'ASCII//TRANSLIT//IGNORE', $fullName)));
$safeName = trim((string) $safeName, '_') ?: 'HOC_VIEN';

$filesToInsert = [];

// 1. Move Excel workbook
$wbFileName = sprintf('SO_YEU_LY_LICH_%s_v1.xlsx', $safeName);
$wbPath = $dir . DIRECTORY_SEPARATOR . $wbFileName;
if (!move_uploaded_file($wbTmp, $wbPath)) {
    respond(500, ['message' => 'Máy chủ không thể lưu file Excel của hồ sơ.']);
}
$filesToInsert[] = [
    'fileType' => 'excel',
    'version' => 1,
    'fileName' => $wbFileName,
    'filePath' => $wbPath,
    'fileSize' => $wbSize,
    'mimeType' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
];

// 2. Move CV PDF document if present
if ($hasCvPdf && $cvPdfTmp !== '') {
    $cvPdfFileName = sprintf('SO_YEU_LY_LICH_%s_v1.pdf', $safeName);
    $cvPdfPath = $dir . DIRECTORY_SEPARATOR . $cvPdfFileName;
    if (move_uploaded_file($cvPdfTmp, $cvPdfPath)) {
        $filesToInsert[] = [
            'fileType' => 'pdf',
            'version' => 1,
            'fileName' => $cvPdfFileName,
            'filePath' => $cvPdfPath,
            'fileSize' => $cvPdfSize,
            'mimeType' => 'application/pdf',
        ];
    }
}

// 3. Move attached PDF document if present
if ($hasPdf && $pdfTmp !== '') {
    $pdfFileName = sprintf('TAI_LIEU_%s.pdf', $safeName);
    $pdfPath = $dir . DIRECTORY_SEPARATOR . $pdfFileName;
    if (move_uploaded_file($pdfTmp, $pdfPath)) {
        $filesToInsert[] = [
            'fileType' => 'document',
            'version' => 1,
            'fileName' => $pdfFileName,
            'filePath' => $pdfPath,
            'fileSize' => $pdfSize,
            'mimeType' => 'application/pdf',
        ];
    }
}

// 3. Move Photo if present
if ($hasPhoto && $photoTmp !== '') {
    $photoFileName = sprintf('ANH_THE_%s.png', $safeName);
    $photoPath = $dir . DIRECTORY_SEPARATOR . $photoFileName;
    if (move_uploaded_file($photoTmp, $photoPath)) {
        $filesToInsert[] = [
            'fileType' => 'photo',
            'version' => 1,
            'fileName' => $photoFileName,
            'filePath' => $photoPath,
            'fileSize' => $photoSize,
            'mimeType' => 'image/png',
        ];
    }
}

// Create profile record in database / json store
$profilePayload = [
    'fullName' => $fullName,
    'birthDate' => $birthDate ?: ($formData['birthDate'] ?? ''),
    'phone' => $phone,
    'idNumber' => $idNumber,
    'address' => $address ?: ($formData['address'] ?? ''),
    'data' => $formData,
];

// Force manual injection of profileId so file paths match
$profile = admin_student_profile_create_with_id($profileId, $profilePayload, $filesToInsert);

try {
    require_once __DIR__ . '/admin/_notifications.php';
    admin_notification_create([
        'eventType' => 'student.submitted',
        'category' => 'students',
        'title' => 'Hồ sơ học viên mới: ' . $fullName,
        'message' => 'Học viên ' . $fullName . ' (' . $profile['studentCode'] . ') vừa nộp sơ yếu lý lịch kèm file Excel' . ($hasPdf ? ' và tài liệu PDF' : '') . '.',
        'actor' => ['id' => 'student', 'name' => $fullName, 'role' => 'Học viên'],
        'target' => [
            'type' => 'student',
            'id' => $profileId,
            'code' => $profile['studentCode'],
            'name' => $fullName,
            'url' => '/quan-tri-viejap?section=students&id=' . $profileId,
        ],
        'priority' => 'high',
    ]);

    admin_activity_log_create([
        'actorName' => $fullName,
        'actorRole' => 'Học viên',
        'action' => 'Đăng ký nộp hồ sơ trực tuyến',
        'targetType' => 'student',
        'targetId' => $profileId,
        'targetName' => $fullName,
        'details' => 'Nộp hồ sơ sơ yếu lý lịch qua website. Mã hồ sơ: ' . $profile['studentCode'] . '.',
        'changes' => [
            ['field' => 'fullName', 'fieldLabel' => 'Họ tên', 'before' => null, 'after' => $fullName],
            ['field' => 'phone', 'fieldLabel' => 'Số điện thoại', 'before' => null, 'after' => $phone],
            ['field' => 'status', 'fieldLabel' => 'Trạng thái', 'before' => null, 'after' => 'Tiếp nhận mới'],
        ],
    ]);

    admin_task_create([
        'title' => 'Kiểm tra hồ sơ học viên ' . $fullName,
        'description' => 'Kiểm tra sơ yếu lý lịch, file Excel và tài liệu đính kèm của học viên ' . $fullName . ' (' . $profile['studentCode'] . ').',
        'category' => 'student_check',
        'priority' => 'high',
        'status' => 'cho_xu_ly',
        'targetType' => 'student',
        'targetId' => $profileId,
        'targetName' => $fullName,
        'targetUrl' => '/quan-tri-viejap?section=students&id=' . $profileId,
        'assignedTo' => 'staff-01',
        'assignedToName' => 'Nguyễn Thị Mai',
        'assignedBy' => 'Hệ thống tự động',
        'dueAt' => date('Y-m-d H:i:s', time() + 86400 * 2),
    ]);
} catch (Throwable) {}

// Build response with download file links
$responseFiles = [];
foreach ($profile['files'] ?? [] as $f) {
    $responseFiles[] = [
        'id' => $f['id'],
        'fileType' => $f['fileType'],
        'version' => $f['version'],
        'fileName' => $f['fileName'],
        'fileSize' => $f['fileSize'],
        'downloadUrl' => 'api/student-files.php?profile_id=' . urlencode($profileId) . '&file_id=' . urlencode((string) $f['id']),
    ];
}

respond(200, [
    'success' => true,
    'profileId' => $profileId,
    'studentCode' => $profile['studentCode'],
    'fullName' => $profile['fullName'],
    'message' => 'Hồ sơ đã được lưu trữ an toàn trong hệ thống của VieJap.',
    'files' => $responseFiles,
]);

if (!function_exists('admin_student_profile_create_with_id')) {
function admin_student_profile_create_with_id(string $id, array $payload, array $initialFiles): array
{
    return admin_student_profile_upsert_submission(
        $id,
        $payload,
        $initialFiles,
        'Học viên',
        'Nộp hồ sơ sơ yếu lý lịch trực tuyến qua website.'
    );
}
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
        if ($zip->locateName($entry) === false) {
            $zip->close();
            respond(422, ['message' => 'Cấu trúc file Excel không hợp lệ.']);
        }
    }
    $zip->close();
}

function enforce_rate_limit(): void
{
    $home = admin_home_directory() ?: sys_get_temp_dir();
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
    if ($last > 0 && ($now - $last) < 10) {
        respond(429, ['message' => 'Bạn gửi hồ sơ quá nhanh. Vui lòng đợi ít nhất 10 giây.']);
    }
    @file_put_contents($path, (string) $now, LOCK_EX);
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
