<?php
declare(strict_types=1);

require_once __DIR__ . '/_bootstrap.php';
require_once __DIR__ . '/_database.php';
require_once __DIR__ . '/_rbac.php';
require_once __DIR__ . '/_orders.php';
require_once __DIR__ . '/_notifications.php';

function admin_poster_drafts_file_path(): string
{
    return admin_storage_directory() . DIRECTORY_SEPARATOR . 'poster-drafts.json';
}

function admin_poster_drafts_load(): array
{
    $file = admin_poster_drafts_file_path();
    if (!is_file($file)) {
        return [];
    }
    $raw = @file_get_contents($file);
    if ($raw === false) {
        return [];
    }
    $decoded = json_decode($raw, true);
    return is_array($decoded) ? $decoded : [];
}

function admin_poster_drafts_save(array $drafts): void
{
    $file = admin_poster_drafts_file_path();
    $dir = dirname($file);
    if (!is_dir($dir)) {
        @mkdir($dir, 0755, true);
    }
    @file_put_contents($file, json_encode($drafts, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
}

function admin_poster_draft_get(?string $orderId): ?array
{
    $drafts = admin_poster_drafts_load();
    $key = !empty($orderId) ? 'order_' . $orderId : 'global_studio_draft';
    return $drafts[$key] ?? null;
}

function admin_poster_draft_store(array $payload, array $session): array
{
    $drafts = admin_poster_drafts_load();
    $orderId = trim((string) ($payload['orderId'] ?? ''));
    $key = $orderId !== '' ? 'order_' . $orderId : 'global_studio_draft';

    $now = date('Y-m-d H:i:s');
    $entry = [
        'key' => $key,
        'orderId' => $orderId ?: null,
        'templateId' => trim((string) ($payload['templateId'] ?? 'japan_signature')),
        'data' => is_array($payload['data'] ?? null) ? $payload['data'] : [],
        'assets' => is_array($payload['assets'] ?? null) ? $payload['assets'] : [],
        'typography' => is_array($payload['typography'] ?? null) ? $payload['typography'] : [],
        'colors' => is_array($payload['colors'] ?? null) ? $payload['colors'] : [],
        'layers' => is_array($payload['layers'] ?? null) ? $payload['layers'] : [],
        'updatedBy' => $session['username'] ?? 'admin',
        'updatedAt' => $now,
    ];

    $drafts[$key] = $entry;
    admin_poster_drafts_save($drafts);

    return $entry;
}

function admin_poster_draft_clear(?string $orderId): bool
{
    $drafts = admin_poster_drafts_load();
    $key = !empty($orderId) ? 'order_' . $orderId : 'global_studio_draft';
    if (isset($drafts[$key])) {
        unset($drafts[$key]);
        admin_poster_drafts_save($drafts);
        return true;
    }
    return false;
}

function admin_poster_apply_to_order(string $orderId, string $posterUrl, array $session): ?array
{
    if (trim($orderId) === '' || trim($posterUrl) === '') {
        return null;
    }

    $orders = admin_job_orders_load();
    $found = false;
    $updatedOrder = null;

    foreach ($orders as &$order) {
        if (($order['id'] ?? '') === $orderId) {
            $order['posterUrl'] = $posterUrl;
            if (empty($order['imageUrl'])) {
                $order['imageUrl'] = $posterUrl;
            }
            $order['updatedAt'] = date('Y-m-d H:i:s');
            $found = true;
            $updatedOrder = $order;
            break;
        }
    }
    unset($order);

    if ($found) {
        admin_job_orders_save($orders);

        // Tạo thông báo hệ thống
        admin_notification_create([
            'category' => 'order',
            'type' => 'order_poster_updated',
            'title' => 'Đã cập nhật Poster cho đơn hàng',
            'message' => 'Người dùng ' . ($session['username'] ?? 'admin') . ' vừa thiết kế và áp dụng Poster mới cho đơn hàng: ' . ($updatedOrder['title'] ?? $orderId),
            'target' => [
                'type' => 'order',
                'id' => $orderId,
                'name' => $updatedOrder['title'] ?? $orderId,
            ],
            'priority' => 'normal',
        ]);
    }

    return $updatedOrder;
}

function admin_poster_stock_photos(): array
{
    return [
        ['id' => 'mfg-1', 'title' => 'Gia công cơ khí & CNC', 'category' => 'manufacturing', 'url' => 'assets/images/poster-stock/manufacturing-cnc.jpg'],
        ['id' => 'elec-1', 'title' => 'Lắp ráp linh kiện điện tử', 'category' => 'electronic', 'url' => 'assets/images/poster-stock/electronics-assembly.jpg'],
        ['id' => 'food-1', 'title' => 'Chế biến thực phẩm thủy sản', 'category' => 'food', 'url' => 'assets/images/poster-stock/food-processing.jpg'],
        ['id' => 'agri-1', 'title' => 'Nông nghiệp nhà kính công nghệ cao', 'category' => 'agriculture', 'url' => 'assets/images/poster-stock/agriculture-greenhouse.jpg'],
        ['id' => 'const-1', 'title' => 'Xây dựng cốt pha & giàn giáo', 'category' => 'construction', 'url' => 'assets/images/poster-stock/construction-worker.jpg'],
        ['id' => 'pack-1', 'title' => 'Đóng gói bao bì & vận chuyển', 'category' => 'logistics', 'url' => 'assets/images/poster-stock/packaging-line.jpg'],
        ['id' => 'care-1', 'title' => 'Điều dưỡng & Chăm sóc người cao tuổi', 'category' => 'caregiver', 'url' => 'assets/images/poster-stock/elderly-care.jpg'],
    ];
}

