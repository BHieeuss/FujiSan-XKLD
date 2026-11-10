<?php
declare(strict_types=1);

/**
 * VieJap Background Cron Job: Tự động xóa vĩnh viễn đơn hàng trong thùng rác quá 10 ngày.
 *
 * Cách chạy trên máy chủ:
 *   crontab -e
 *   0 2 * * * /usr/bin/php /path/to/scripts/cron_purge_trash_orders.php >> /path/to/logs/order_purge.log 2>&1
 */

require_once dirname(__DIR__) . '/public/api/admin/_bootstrap.php';
require_once dirname(__DIR__) . '/public/api/admin/_orders.php';

$startTime = microtime(true);
$timestamp = date('Y-m-d H:i:s');
echo "[{$timestamp}] [VieJap Cron] Bắt đầu quét và dọn dẹp đơn hàng thùng rác quá 10 ngày...\n";

try {
    $purged = admin_job_orders_purge_expired_trash(true);
    $duration = round((microtime(true) - $startTime) * 1000, 2);
    echo "[{$timestamp}] [VieJap Cron] Hoàn tất thành công! Đã dọn dẹp vĩnh viễn: {$purged} đơn hàng ({$duration} ms).\n";
    exit(0);
} catch (Throwable $e) {
    echo "[{$timestamp}] [VieJap Cron LỖI] " . $e->getMessage() . "\n";
    exit(1);
}
