<?php
declare(strict_types=1);

require_once __DIR__ . '/_bootstrap.php';

const VIEJAP_ORDER_IMAGE_MAX_SIZE = 10 * 1024 * 1024;

function admin_order_image_upload_error_message(int $error): string
{
    return match ($error) {
        UPLOAD_ERR_INI_SIZE, UPLOAD_ERR_FORM_SIZE => 'Ảnh đơn hàng vượt quá giới hạn dung lượng máy chủ. Vui lòng chọn ảnh nhỏ hơn 10 MB.',
        UPLOAD_ERR_PARTIAL => 'Ảnh đơn hàng tải lên chưa hoàn tất. Vui lòng thử lại.',
        UPLOAD_ERR_NO_FILE => 'Vui lòng chọn ảnh đơn hàng.',
        default => 'Ảnh đơn hàng không hợp lệ hoặc vượt quá 10 MB.',
    };
}

function admin_order_image_upload_directory(): string
{
    $directory = dirname(__DIR__, 2) . DIRECTORY_SEPARATOR . 'uploads' . DIRECTORY_SEPARATOR . 'orders';
    if (!is_dir($directory) && !mkdir($directory, 0755, true) && !is_dir($directory)) {
        admin_respond(500, ['message' => 'Không thể tạo thư mục lưu ảnh đơn hàng trên hosting. Vui lòng kiểm tra quyền ghi thư mục uploads.']);
    }

    if (!is_writable($directory)) {
        admin_respond(500, ['message' => 'Thư mục uploads/orders chưa có quyền ghi. Vui lòng cấp quyền ghi rồi tải lại ảnh.']);
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

    if (!isset($_FILES['image']) || !is_array($_FILES['image'])) {
        admin_respond(422, ['message' => 'Vui lòng chọn ảnh đơn hàng.']);
    }

    $upload = $_FILES['image'];
    $temporaryPath = (string) ($upload['tmp_name'] ?? '');
    $size = (int) ($upload['size'] ?? 0);
    $uploadError = (int) ($upload['error'] ?? UPLOAD_ERR_NO_FILE);
    if (
        $uploadError !== UPLOAD_ERR_OK
        || $size < 1
        || $size > VIEJAP_ORDER_IMAGE_MAX_SIZE
        || !is_uploaded_file($temporaryPath)
    ) {
        admin_respond(422, ['message' => admin_order_image_upload_error_message($uploadError)]);
    }

    $mime = (new finfo(FILEINFO_MIME_TYPE))->file($temporaryPath);
    $image = @getimagesize($temporaryPath);
    $extensions = [
        'image/jpeg' => 'jpg',
        'image/png' => 'png',
        'image/webp' => 'webp',
    ];
    if (!is_array($image) || !isset($extensions[$mime])) {
        admin_respond(422, ['message' => 'Chỉ hỗ trợ ảnh JPG, PNG hoặc WebP hợp lệ.']);
    }

    $directory = admin_order_image_upload_directory();
    $filename = 'don-hang-' . gmdate('Ymd-His') . '-' . bin2hex(random_bytes(8)) . '.' . $extensions[$mime];
    $destination = $directory . DIRECTORY_SEPARATOR . $filename;
    if (!move_uploaded_file($temporaryPath, $destination)) {
        admin_respond(500, ['message' => 'Không thể lưu ảnh đơn hàng. Vui lòng kiểm tra quyền ghi thư mục uploads/orders.']);
    }
    @chmod($destination, 0644);

    admin_respond(201, ['imageUrl' => '/uploads/orders/' . $filename]);
} catch (Throwable $error) {
    admin_handle_exception($error);
}
