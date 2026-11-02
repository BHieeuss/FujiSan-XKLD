<?php
declare(strict_types=1);

require_once __DIR__ . '/admin/_student_profiles.php';

header('X-Content-Type-Options: nosniff');

$profileId = trim((string) ($_GET['profile_id'] ?? ''));
$fileId = trim((string) ($_GET['file_id'] ?? ''));

if ($profileId === '' || $fileId === '') {
    http_response_code(400);
    echo json_encode(['message' => 'Thiếu thông tin profile_id hoặc file_id.'], JSON_UNESCAPED_UNICODE);
    exit;
}

$record = admin_student_profile_get_file_record($profileId, $fileId);
if ($record === null) {
    http_response_code(404);
    echo json_encode(['message' => 'Không tìm thấy thông tin tài liệu.'], JSON_UNESCAPED_UNICODE);
    exit;
}

$filePath = (string) ($record['file_path'] ?? $record['filePath'] ?? '');
if (!is_file($filePath)) {
    http_response_code(404);
    echo json_encode(['message' => 'Tài liệu không còn tồn tại trên hệ thống.'], JSON_UNESCAPED_UNICODE);
    exit;
}

$fileName = (string) ($record['file_name'] ?? $record['fileName'] ?? 'document');
$mimeType = (string) ($record['mime_type'] ?? $record['mimeType'] ?? 'application/octet-stream');
$fileSize = filesize($filePath);
$isPreview = (($_GET['preview'] ?? '') === '1') || (($_GET['disposition'] ?? '') === 'inline');
$disposition = $isPreview ? 'inline' : 'attachment';

header_remove('X-Frame-Options');
header_remove('Content-Security-Policy');
header('X-Frame-Options: SAMEORIGIN');
header('Content-Type: ' . $mimeType);
header('Content-Length: ' . $fileSize);
header('Content-Disposition: ' . $disposition . '; filename="' . rawurlencode($fileName) . '"; filename*=UTF-8\'\'' . rawurlencode($fileName));
header('Cache-Control: private, max-age=3600');
readfile($filePath);
exit;

