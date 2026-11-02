<?php
declare(strict_types=1);

require_once __DIR__ . '/_poster_studio.php';
require_once __DIR__ . '/_rbac.php';

try {
    $method = strtoupper((string) ($_SERVER['REQUEST_METHOD'] ?? 'GET'));
    $action = trim((string) ($_GET['action'] ?? ''));

    if ($method === 'GET') {
        $session = admin_require_session();
        admin_require_permission($session, 'poster_studio.view');

        if ($action === 'stock-photos') {
            admin_respond(200, [
                'photos' => admin_poster_stock_photos(),
            ]);
        }

        if ($action === 'get-draft') {
            $orderId = trim((string) ($_GET['orderId'] ?? ''));
            $draft = admin_poster_draft_get($orderId ?: null);
            admin_respond(200, [
                'draft' => $draft,
            ]);
        }

        // Default: return draft + stock photos
        $orderId = trim((string) ($_GET['orderId'] ?? ''));
        $draft = admin_poster_draft_get($orderId ?: null);
        admin_respond(200, [
            'draft' => $draft,
            'stockPhotos' => admin_poster_stock_photos(),
        ]);
    }

    if ($method === 'POST') {
        $session = admin_require_session();
        admin_require_csrf($session);
        $body = admin_read_json();

        if ($action === 'save-draft') {
            admin_require_permission($session, 'poster_studio.save');
            $saved = admin_poster_draft_store($body, $session);
            admin_respond(200, [
                'message' => 'Lưu bản nháp poster thành công.',
                'draft' => $saved,
            ]);
        }

        if ($action === 'apply-to-order') {
            admin_require_permission($session, 'poster_studio.apply_to_order');
            $orderId = trim((string) ($body['orderId'] ?? ''));
            $posterUrl = trim((string) ($body['posterUrl'] ?? ''));
            if ($orderId === '' || $posterUrl === '') {
                admin_respond(400, ['message' => 'Thiếu orderId hoặc posterUrl']);
            }
            $updated = admin_poster_apply_to_order($orderId, $posterUrl, $session);
            if ($updated === null) {
                admin_respond(404, ['message' => 'Không tìm thấy đơn hàng cần áp dụng poster.']);
            }
            admin_respond(200, [
                'message' => 'Đã áp dụng Poster mới vào đơn hàng thành công!',
                'order' => $updated,
            ]);
        }

        if ($action === 'clear-draft') {
            admin_require_permission($session, 'poster_studio.save');
            $orderId = trim((string) ($body['orderId'] ?? $_GET['orderId'] ?? ''));
            admin_poster_draft_clear($orderId ?: null);
            admin_respond(200, [
                'message' => 'Đã xóa bản nháp poster.',
            ]);
        }

        admin_respond(400, ['message' => 'Action không hợp lệ.']);
    }

    admin_respond(405, ['message' => 'Phương thức không được hỗ trợ.']);
} catch (AdminApiException $e) {
    admin_respond($e->statusCode, ['message' => $e->getMessage()]);
} catch (Throwable $e) {
    admin_respond(500, ['message' => 'Lỗi máy chủ nội bộ: ' . $e->getMessage()]);
}

