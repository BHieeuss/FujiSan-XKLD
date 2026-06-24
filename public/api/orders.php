<?php
declare(strict_types=1);

require_once __DIR__ . '/admin/_orders.php';

try {
    admin_require_method('GET');
    $id = trim((string) ($_GET['id'] ?? ''));

    if ($id !== '') {
        $order = admin_job_order_find($id);
        if ($order === null) {
            admin_respond(404, ['message' => 'Không tìm thấy đơn hàng.']);
        }
        admin_respond(200, ['order' => $order]);
    }

    admin_respond(200, ['orders' => admin_job_orders_list()]);
} catch (Throwable $error) {
    admin_handle_exception($error);
}
