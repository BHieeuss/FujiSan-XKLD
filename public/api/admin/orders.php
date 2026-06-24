<?php
declare(strict_types=1);

require_once __DIR__ . '/_orders.php';

try {
    $method = strtoupper((string) ($_SERVER['REQUEST_METHOD'] ?? 'GET'));

    if ($method === 'GET') {
        admin_require_session();
        admin_respond(200, ['orders' => admin_job_orders_list(true)]);
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
        admin_respond(201, ['order' => admin_job_order_create($payload)]);
    }

    $id = trim((string) ($_GET['id'] ?? ($payload['id'] ?? '')));
    if ($id === '') {
        admin_respond(422, ['message' => 'Thiếu mã đơn hàng.']);
    }

    if ($method === 'DELETE') {
        if (!admin_job_order_delete($id)) {
            admin_respond(404, ['message' => 'Không tìm thấy đơn hàng.']);
        }
        admin_respond(200, ['deleted' => true]);
    }

    $order = admin_job_order_update($id, $payload);
    if ($order === null) {
        admin_respond(404, ['message' => 'Không tìm thấy đơn hàng.']);
    }
    admin_respond(200, ['order' => $order]);
} catch (Throwable $error) {
    admin_handle_exception($error);
}
