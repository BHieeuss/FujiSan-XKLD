<?php
declare(strict_types=1);

require_once __DIR__ . '/_orders.php';
require_once __DIR__ . '/_rbac.php';

try {
    $method = strtoupper((string) ($_SERVER['REQUEST_METHOD'] ?? 'GET'));
    $action = trim((string) ($_GET['action'] ?? ''));

    if ($method === 'GET') {
        $session = admin_require_session();

        if ($action === 'trash_list') {
            admin_require_permission($session, 'orders.trash.view');
            $trashOrders = admin_job_orders_trash_list();
            $total = count($trashOrders);
            admin_respond(200, ['orders' => $trashOrders, 'total' => $total]);
        }

        admin_require_permission($session, 'orders.view');

        if ($action === 'check_code') {
            $code = trim((string) ($_GET['code'] ?? ''));
            $excludeId = trim((string) ($_GET['excludeId'] ?? '')) ?: null;
            $exists = admin_job_order_code_exists($code, $excludeId);
            admin_respond(200, ['exists' => $exists, 'code' => $code]);
        }

        if ($action === 'draft_get') {
            $draft = admin_job_order_draft_get();
            admin_respond(200, ['draft' => $draft]);
        }

        if ($action === 'find') {
            $id = trim((string) ($_GET['id'] ?? ''));
            $order = admin_job_order_find($id, true, true);
            if ($order === null) {
                admin_respond(404, ['message' => 'Không tìm thấy đơn hàng.']);
            }
            admin_respond(200, ['order' => $order]);
        }

        $allOrders = admin_job_orders_list(true, false);
        $total = count($allOrders);
        $trashCount = admin_job_orders_trash_count();
        $page = isset($_GET['page']) ? max(1, (int) $_GET['page']) : null;
        $limit = isset($_GET['limit']) ? max(1, (int) $_GET['limit']) : null;

        if ($page !== null) {
            $limit = $limit ?? 10;
            $totalPages = max(1, (int) ceil($total / $limit));
            $offset = ($page - 1) * $limit;
            $pagedOrders = array_slice($allOrders, $offset, $limit);
            admin_respond(200, [
                'orders' => $pagedOrders,
                'total' => $total,
                'trashCount' => $trashCount,
                'page' => $page,
                'limit' => $limit,
                'totalPages' => $totalPages,
            ]);
        }

        admin_respond(200, ['orders' => $allOrders, 'total' => $total, 'trashCount' => $trashCount]);
    }

    if (!in_array($method, ['POST', 'PUT', 'PATCH', 'DELETE'], true)) {
        header('Allow: GET, POST, PUT, PATCH, DELETE');
        admin_respond(405, ['message' => 'Phương thức không được hỗ trợ.']);
    }

    admin_assert_same_origin();
    $session = admin_require_session();
    admin_require_csrf($session);
    $payload = admin_read_json();
    $actor = $session['fullName'] ?? ($session['username'] ?? 'Quản trị viên');

    // 1. KHÔI PHỤC ĐƠN HÀNG TỪ THÙNG RÁC
    if ($action === 'restore' || ($payload['action'] ?? '') === 'restore') {
        admin_require_permission($session, 'orders.trash.restore');
        $id = trim((string) ($_GET['id'] ?? ($payload['id'] ?? '')));
        if ($id === '') {
            admin_respond(422, ['message' => 'Thiếu mã đơn hàng cần khôi phục.']);
        }
        $restored = admin_job_order_restore($id, $actor);
        if ($restored === null) {
            admin_respond(404, ['message' => 'Không tìm thấy đơn hàng cần khôi phục trong thùng rác.']);
        }
        admin_respond(200, ['restored' => true, 'order' => $restored, 'message' => 'Đã khôi phục đơn hàng thành công.']);
    }

    // 2. KHÔI PHỤC NHIỀU ĐƠN HÀNG HÀNG LOẠT
    if ($action === 'bulk_restore' || ($payload['action'] ?? '') === 'bulk_restore') {
        admin_require_permission($session, 'orders.trash.restore');
        $ids = (array) ($payload['ids'] ?? []);
        $count = 0;
        foreach ($ids as $oneId) {
            if (admin_job_order_restore((string) $oneId, $actor) !== null) {
                $count++;
            }
        }
        admin_respond(200, ['restoredCount' => $count, 'message' => "Đã khôi phục {$count} đơn hàng thành công."]);
    }

    // 3. XÓA VĨNH VIỄN KHỎI THÙNG RÁC
    if ($action === 'delete_permanent' || ($payload['action'] ?? '') === 'delete_permanent') {
        admin_require_permission($session, 'orders.trash.delete_permanently');
        $id = trim((string) ($_GET['id'] ?? ($payload['id'] ?? '')));
        if ($id === '') {
            admin_respond(422, ['message' => 'Thiếu mã đơn hàng cần xóa vĩnh viễn.']);
        }
        admin_job_order_delete_permanent($id, $actor);
        admin_respond(200, ['deleted' => true, 'permanent' => true, 'message' => 'Đã xóa vĩnh viễn đơn hàng và toàn bộ tệp đính kèm.']);
    }

    // 4. XÓA VĨNH VIỄN NHIỀU ĐƠN HÀNG HÀNG LOẠT
    if ($action === 'bulk_delete_permanent' || ($payload['action'] ?? '') === 'bulk_delete_permanent') {
        admin_require_permission($session, 'orders.trash.delete_permanently');
        $ids = (array) ($payload['ids'] ?? []);
        $count = 0;
        foreach ($ids as $oneId) {
            if (admin_job_order_delete_permanent((string) $oneId, $actor)) {
                $count++;
            }
        }
        admin_respond(200, ['deletedCount' => $count, 'message' => "Đã xóa vĩnh viễn {$count} đơn hàng và các tệp liên quan."]);
    }

    // 5. DỌN SẠCH TOÀN BỘ THÙNG RÁC
    if ($action === 'empty_trash' || ($payload['action'] ?? '') === 'empty_trash') {
        admin_require_permission($session, 'orders.trash.delete_permanently');
        $purged = admin_job_orders_empty_trash($actor);
        admin_respond(200, ['purgedCount' => $purged, 'message' => "Đã dọn sạch thùng rác ({$purged} đơn hàng)."]);
    }

    // 6. XỬ LÝ XÓA MỀM (CHUYỂN VÀO THÙNG RÁC 10 NGÀY)
    $isDeleteAction = ($method === 'DELETE') || ($method === 'POST' && ($action === 'delete' || ($payload['action'] ?? '') === 'delete'));
    if ($isDeleteAction) {
        admin_require_permission($session, 'orders.delete');
        $pathId = !empty($_SERVER['PATH_INFO']) ? trim((string) basename($_SERVER['PATH_INFO'])) : '';
        $id = trim((string) ($_GET['id'] ?? ($payload['id'] ?? ($pathId !== '' ? $pathId : ''))));
        if ($id === '') {
            admin_respond(422, ['message' => 'Thiếu mã đơn hàng cần chuyển vào thùng rác.']);
        }
        admin_job_order_move_to_trash($id, $actor);
        admin_respond(200, ['trashed' => true, 'message' => 'Đã chuyển đơn hàng vào Thùng rác (lưu trữ 10 ngày).']);
    }

    // 7. CẬP NHẬT ĐƠN HÀNG
    $isUpdateAction = in_array($method, ['PUT', 'PATCH'], true) ||
        ($method === 'POST' && ($action === 'update' || ($payload['action'] ?? '') === 'update'));

    // 8. TẠO ĐƠN HÀNG MỚI
    if ($method === 'POST' && !$isUpdateAction) {
        admin_require_permission($session, 'orders.create');

        if ($action === 'draft_save') {
            admin_job_order_draft_save($payload);
            admin_respond(200, ['saved' => true]);
        }

        if ($action === 'draft_clear') {
            admin_job_order_draft_clear();
            admin_respond(200, ['cleared' => true]);
        }

        if ($action === 'ai_review_post') {
            admin_require_permission($session, 'orders.facebook_content.ai_review');
            admin_respond(200, ['status' => 'success', 'reviewed' => true]);
        }

        // Duplicate code validation
        $orderCode = trim((string) ($payload['orderCode'] ?? ''));
        if ($orderCode !== '' && admin_job_order_code_exists($orderCode)) {
            admin_respond(409, ['message' => 'Mã đơn hàng "' . $orderCode . '" đã tồn tại trên hệ thống. Vui lòng chọn mã khác.']);
        }

        $idemKey = admin_job_order_idempotency_key();
        if ($idemKey !== '') {
            $existing = admin_job_order_find_by_idempotency($idemKey);
            if ($existing !== null) {
                admin_respond(200, ['order' => $existing, 'duplicate' => true]);
            }
        }
        $order = admin_job_order_create($payload);
        if ($idemKey !== '') {
            admin_job_order_remember_idempotency($idemKey, $order['id']);
        }

        // Clear active server-side draft when order is successfully created
        admin_job_order_draft_clear();

        admin_respond(201, ['order' => $order]);
    }

    $id = trim((string) ($_GET['id'] ?? ($payload['id'] ?? '')));
    if ($id === '') {
        admin_respond(422, ['message' => 'Thiếu mã đơn hàng.']);
    }

    admin_require_permission($session, 'orders.update');

    // Duplicate code validation excluding current order
    $orderCode = trim((string) ($payload['orderCode'] ?? ''));
    if ($orderCode !== '' && admin_job_order_code_exists($orderCode, $id)) {
        admin_respond(409, ['message' => 'Mã đơn hàng "' . $orderCode . '" đã được sử dụng bởi một đơn hàng khác.']);
    }

    $order = admin_job_order_update($id, $payload);
    if ($order === null) {
        admin_respond(404, ['message' => 'Không tìm thấy đơn hàng.']);
    }
    admin_respond(200, ['order' => $order]);
} catch (Throwable $error) {
    admin_handle_exception($error);
}
