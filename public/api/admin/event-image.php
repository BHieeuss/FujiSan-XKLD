<?php
declare(strict_types=1);

require_once __DIR__ . '/_bootstrap.php';
require_once __DIR__ . '/_rbac.php';

const VIEJAP_EVENT_IMAGE_MAX_SIZE = 12 * 1024 * 1024; // 12MB

function admin_event_image_directory(): string
{
    $directory = dirname(__DIR__, 2) . DIRECTORY_SEPARATOR . 'uploads' . DIRECTORY_SEPARATOR . 'events';
    if (!is_dir($directory)) {
        @mkdir($directory, 0755, true);
    }

    if (!is_writable($directory)) {
        @chmod($directory, 0755);
        if (!is_writable($directory)) {
            @chmod($directory, 0777);
        }
    }

    if (!is_dir($directory) || !is_writable($directory)) {
        $parent = dirname(__DIR__, 2) . DIRECTORY_SEPARATOR . 'uploads';
        if (is_dir($parent) && is_writable($parent)) {
            return $parent;
        }
        admin_respond(500, ['message' => 'Thư mục uploads/events chưa có quyền ghi.']);
    }

    $htaccess = $directory . DIRECTORY_SEPARATOR . '.htaccess';
    if (!is_file($htaccess)) {
        @file_put_contents($htaccess, "Options -Indexes\n\n<FilesMatch \"\\.(?:php|phtml|phar|php[0-9]?)$\">\n  Require all denied\n</FilesMatch>\n");
        @chmod($htaccess, 0644);
    }

    return $directory;
}

try {
    admin_require_method('POST');
    admin_assert_same_origin();
    $session = admin_require_session();
    admin_require_csrf($session);

    if (!admin_has_permission($session, 'events.create') && !admin_has_permission($session, 'events.update')) {
        admin_respond(403, ['message' => 'Bạn không có quyền tải ảnh sự kiện.']);
    }

    if (!isset($_FILES['image']) || !is_array($_FILES['image'])) {
        admin_respond(422, ['message' => 'Vui lòng chọn tệp hình ảnh.']);
    }

    $upload = $_FILES['image'];
    $tmpPath = (string) ($upload['tmp_name'] ?? '');
    $size = (int) ($upload['size'] ?? 0);
    $uploadError = (int) ($upload['error'] ?? UPLOAD_ERR_NO_FILE);

    if ($uploadError !== UPLOAD_ERR_OK || $size < 1 || $size > VIEJAP_EVENT_IMAGE_MAX_SIZE || !is_uploaded_file($tmpPath)) {
        admin_respond(422, ['message' => 'Tệp ảnh không hợp lệ hoặc vượt quá giới hạn 12 MB.']);
    }

    $finfo = new finfo(FILEINFO_MIME_TYPE);
    $mimeType = (string) $finfo->file($tmpPath);

    $allowedMimes = [
        'image/jpeg' => 'jpg',
        'image/png' => 'png',
        'image/webp' => 'webp',
        'image/gif' => 'gif',
    ];

    if (!isset($allowedMimes[$mimeType])) {
        admin_respond(422, ['message' => 'Chỉ chấp nhận các định dạng ảnh JPG, PNG, WEBP hoặc GIF.']);
    }

    $extension = $allowedMimes[$mimeType];
    $targetDir = admin_event_image_directory();
    $uniqueName = 'evt_' . date('Ymd_His') . '_' . bin2hex(random_bytes(6)) . '.' . $extension;
    $targetPath = $targetDir . DIRECTORY_SEPARATOR . $uniqueName;

    if (!@move_uploaded_file($tmpPath, $targetPath)) {
        if (!@copy($tmpPath, $targetPath)) {
            admin_respond(500, ['message' => 'Không thể lưu tệp ảnh sự kiện vào máy chủ.']);
        }
        @unlink($tmpPath);
    }

    @chmod($targetPath, 0644);
    $defaultDir = dirname(__DIR__, 2) . DIRECTORY_SEPARATOR . 'uploads' . DIRECTORY_SEPARATOR . 'events';
    $publicUrl = ($targetDir === $defaultDir)
        ? ('/uploads/events/' . $uniqueName)
        : ('/uploads/' . $uniqueName);
    admin_respond(200, [
        'message' => 'Tải ảnh sự kiện thành công.',
        'url' => $publicUrl,
        'filename' => $uniqueName,
    ]);
} catch (Throwable $e) {
    admin_respond(500, ['message' => 'Lỗi máy chủ khi tải ảnh: ' . $e->getMessage()]);
}

