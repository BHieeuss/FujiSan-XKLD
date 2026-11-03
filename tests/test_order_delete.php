<?php
declare(strict_types=1);

require_once __DIR__ . '/../public/api/admin/_orders.php';

$testId = 'test-del-' . time();
$testOrder = [
    'id' => $testId,
    'title' => 'Đơn hàng test xóa tự động',
    'orderCode' => 'TEST-DEL-' . time(),
    'category' => 'thuc-tap-sinh',
    'status' => 'draft',
    'workLocation' => 'Tokyo',
    'salary' => '20 man',
    'description' => 'Mô tả test xóa'
];

$created = admin_job_order_create($testOrder);
$testId = $created['id'];
echo "1. Order created with ID: {$testId}\n";

$found = admin_job_order_find($testId, true);
echo "2. Order found before delete: " . ($found !== null ? "FOUND" : "NOT FOUND") . "\n";

$deleted = admin_job_order_delete($testId);
echo "3. Order deleted via admin_job_order_delete(): " . ($deleted ? "SUCCESS" : "FAILED") . "\n";

$foundAfter = admin_job_order_find($testId, true);
echo "4. Order found after delete: " . ($foundAfter === null ? "NOT FOUND (SUCCESS)" : "STILL EXISTS (FAILED)") . "\n";

if (!empty($created['id']) && $found !== null && $deleted && $foundAfter === null) {
    echo "\n=> ORDER DELETION TEST: 100% PASS\n";
    exit(0);
} else {
    echo "\n=> ORDER DELETION TEST: FAILED\n";
    exit(1);
}
