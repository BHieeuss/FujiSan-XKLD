<?php
declare(strict_types=1);

require_once __DIR__ . '/_orders.php';
require_once __DIR__ . '/_rbac.php';

try {
    $method = strtoupper((string) ($_SERVER['REQUEST_METHOD'] ?? 'GET'));
    $action = trim((string) ($_GET['action'] ?? ''));

    if ($method === 'GET') {
        $session = admin_require_session();
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
            $order = admin_job_order_find($id, true);
            if ($order === null) {
                admin_respond(404, ['message' => 'Không tìm thấy đơn hàng.']);
            }
            admin_respond(200, ['order' => $order]);
        }

        $allOrders = admin_job_orders_list(true);
        $total = count($allOrders);
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
                'page' => $page,
                'limit' => $limit,
                'totalPages' => $totalPages,
            ]);
        }

        admin_respond(200, ['orders' => $allOrders, 'total' => $total]);
    }

    if (!in_array($method, ['POST', 'PUT', 'PATCH', 'DELETE'], true)) {
        header('Allow: GET, POST, PUT, PATCH, DELETE');
        admin_respond(405, ['message' => 'Phương thức không được hỗ trợ.']);
    }

    admin_assert_same_origin();
    $session = admin_require_session();
    admin_require_csrf($session);
    $payload = admin_read_json();

    if ($method === 'POST') {
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

    if ($method === 'DELETE') {
        admin_require_permission($session, 'orders.delete');
        if (!admin_job_order_delete($id)) {
            admin_respond(404, ['message' => 'Không tìm thấy đơn hàng.']);
        }
        admin_respond(200, ['deleted' => true]);
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
