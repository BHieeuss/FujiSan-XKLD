<?php
declare(strict_types=1);

require_once __DIR__ . '/_events.php';

try {
    $method = strtoupper((string) ($_SERVER['REQUEST_METHOD'] ?? 'GET'));
    admin_assert_same_origin();
    $session = admin_require_session();

    if ($method === 'GET') {
        admin_require_permission($session, 'events.view');

        $events = admin_events_load();
        $singleId = trim((string) ($_GET['id'] ?? ''));

        if ($singleId !== '') {
            $event = admin_events_find($singleId);
            if ($event === null) {
                admin_respond(404, ['message' => 'Không tìm thấy sự kiện']);
            }
            admin_respond(200, ['event' => $event]);
        }

        // Filters
        $q = mb_strtolower(trim((string) ($_GET['q'] ?? '')));
        $category = trim((string) ($_GET['category'] ?? 'all'));
        $status = trim((string) ($_GET['status'] ?? 'all'));
        $format = trim((string) ($_GET['format'] ?? 'all'));
        $page = max(1, (int) ($_GET['page'] ?? 1));
        $limit = max(1, min(50, (int) ($_GET['limit'] ?? 10)));

        $filtered = array_filter($events, function ($e) use ($q, $category, $status, $format) {
            if ($category !== 'all' && ($e['category'] ?? '') !== $category) {
                return false;
            }
            if ($status !== 'all' && ($e['status'] ?? '') !== $status) {
                return false;
            }
            if ($format !== 'all') {
                $formats = $e['displayFormats'] ?? [];
                if (!in_array($format, $formats, true)) {
                    return false;
                }
            }
            if ($q !== '') {
                $searchContent = mb_strtolower(
                    ($e['title'] ?? '') . ' ' .
                    ($e['displayTitle'] ?? '') . ' ' .
                    ($e['summary'] ?? '') . ' ' .
                    ($e['code'] ?? '') . ' ' .
                    ($e['categoryName'] ?? '')
                );
                if (!str_contains($searchContent, $q)) {
                    return false;
                }
            }
            return true;
        });

        // Sort by priorityOrder ASC then createdAt DESC
        usort($filtered, function ($a, $b) {
            $pA = (int) ($a['delivery']['priorityOrder'] ?? 50);
            $pB = (int) ($b['delivery']['priorityOrder'] ?? 50);
            if ($pA !== $pB) {
                return $pA <=> $pB;
            }
            $dateA = $a['createdAt'] ?? '';
            $dateB = $b['createdAt'] ?? '';
            return strcmp($dateB, $dateA);
        });

        $total = count($filtered);
        $totalPages = max(1, (int) ceil($total / $limit));
        $offset = ($page - 1) * $limit;
        $items = array_values(array_slice($filtered, $offset, $limit));

        // Stats calculation
        $stats = [
            'total' => count($events),
            'published' => count(array_filter($events, fn($e) => ($e['status'] ?? '') === 'published')),
            'scheduled' => count(array_filter($events, fn($e) => ($e['status'] ?? '') === 'scheduled')),
            'paused' => count(array_filter($events, fn($e) => ($e['status'] ?? '') === 'paused')),
            'ended' => count(array_filter($events, fn($e) => ($e['status'] ?? '') === 'ended')),
            'draft' => count(array_filter($events, fn($e) => ($e['status'] ?? '') === 'draft')),
            'totalViews' => array_reduce($events, fn($acc, $e) => $acc + (int) ($e['analytics']['views'] ?? 0), 0),
            'totalClicks' => array_reduce($events, fn($acc, $e) => $acc + (int) ($e['analytics']['clicks'] ?? 0), 0),
        ];

        admin_respond(200, [
            'items' => $items,
            'total' => $total,
            'page' => $page,
            'limit' => $limit,
            'totalPages' => $totalPages,
            'stats' => $stats,
            'categories' => admin_events_categories(),
        ]);
    }

    if ($method === 'POST') {
        admin_require_csrf($session);
        $body = admin_read_json_body();
        $action = trim((string) ($body['action'] ?? 'create'));
        $events = admin_events_load();

        if ($action === 'create') {
            admin_require_permission($session, 'events.create');
            $payload = admin_event_sanitize_payload($body['event'] ?? []);
            $payload['createdBy'] = (string) ($session['username'] ?? 'admin');
            $payload['createdByName'] = (string) ($session['fullName'] ?? $session['username'] ?? 'Quản trị viên');
            array_unshift($events, $payload);
            admin_events_save($events);

            admin_respond(201, [
                'message' => 'Tạo sự kiện mới thành công.',
                'event' => $payload,
            ]);
        }

        if ($action === 'update') {
            admin_require_permission($session, 'events.update');
            $eventId = trim((string) ($body['id'] ?? ''));
            $index = null;
            foreach ($events as $idx => $e) {
                if (($e['id'] ?? '') === $eventId) {
                    $index = $idx;
                    break;
                }
            }
            if ($index === null) {
                admin_respond(404, ['message' => 'Không tìm thấy sự kiện cần cập nhật.']);
            }

            $payload = admin_event_sanitize_payload($body['event'] ?? [], $events[$index]);
            $events[$index] = $payload;
            admin_events_save($events);

            admin_respond(200, [
                'message' => 'Cập nhật sự kiện thành công.',
                'event' => $payload,
            ]);
        }

        if ($action === 'delete') {
            admin_require_permission($session, 'events.delete');
            $eventId = trim((string) ($body['id'] ?? ''));
            $filtered = array_values(array_filter($events, fn($e) => ($e['id'] ?? '') !== $eventId));
            if (count($filtered) === count($events)) {
                admin_respond(404, ['message' => 'Không tìm thấy sự kiện để xóa.']);
            }
            admin_events_save($filtered);

            admin_respond(200, ['message' => 'Đã xóa sự kiện thành công.']);
        }

        if ($action === 'duplicate') {
            admin_require_permission($session, 'events.create');
            $eventId = trim((string) ($body['id'] ?? ''));
            $target = null;
            foreach ($events as $e) {
                if (($e['id'] ?? '') === $eventId) {
                    $target = $e;
                    break;
                }
            }
            if ($target === null) {
                admin_respond(404, ['message' => 'Không tìm thấy sự kiện để nhân bản.']);
            }

            $clone = $target;
            $clone['id'] = 'evt-' . bin2hex(random_bytes(8));
            $clone['code'] = 'SK-' . date('Y') . '-' . str_pad((string) mt_rand(10, 999), 3, '0', STR_PAD_LEFT);
            $clone['title'] = $target['title'] . ' (Bản sao)';
            $clone['status'] = 'draft';
            $clone['createdAt'] = date('c');
            $clone['updatedAt'] = date('c');
            $clone['publishedAt'] = null;
            $clone['analytics'] = ['views' => 0, 'clicks' => 0, 'dismisses' => 0, 'byFormat' => []];

            array_unshift($events, $clone);
            admin_events_save($events);

            admin_respond(201, [
                'message' => 'Nhân bản sự kiện thành công.',
                'event' => $clone,
            ]);
        }

        if ($action === 'publish') {
            admin_require_permission($session, 'events.publish');
            $eventId = trim((string) ($body['id'] ?? ''));
            $found = false;
            foreach ($events as &$e) {
                if (($e['id'] ?? '') === $eventId) {
                    $e['status'] = 'published';
                    $e['publishedAt'] = date('c');
                    $e['updatedAt'] = date('c');
                    $found = true;
                    break;
                }
            }
            unset($e);

            if (!$found) {
                admin_respond(404, ['message' => 'Không tìm thấy sự kiện.']);
            }
            admin_events_save($events);
            admin_respond(200, ['message' => 'Đã xuất bản sự kiện lên website.']);
        }

        if ($action === 'pause') {
            admin_require_permission($session, 'events.pause');
            $eventId = trim((string) ($body['id'] ?? ''));
            $found = false;
            foreach ($events as &$e) {
                if (($e['id'] ?? '') === $eventId) {
                    $e['status'] = 'paused';
                    $e['updatedAt'] = date('c');
                    $found = true;
                    break;
                }
            }
            unset($e);

            if (!$found) {
                admin_respond(404, ['message' => 'Không tìm thấy sự kiện.']);
            }
            admin_events_save($events);
            admin_respond(200, ['message' => 'Đã tạm dừng hiển thị sự kiện.']);
        }

        if ($action === 'priority') {
            admin_require_permission($session, 'events.manage_priority');
            $eventId = trim((string) ($body['id'] ?? ''));
            $priorityOrder = max(1, min(100, (int) ($body['priorityOrder'] ?? 50)));
            $priorityLevel = in_array($body['priorityLevel'] ?? '', ['high', 'normal', 'low'], true) ? $body['priorityLevel'] : 'normal';

            $found = false;
            foreach ($events as &$e) {
                if (($e['id'] ?? '') === $eventId) {
                    if (!isset($e['delivery']) || !is_array($e['delivery'])) {
                        $e['delivery'] = [];
                    }
                    $e['delivery']['priorityOrder'] = $priorityOrder;
                    $e['delivery']['priorityLevel'] = $priorityLevel;
                    $e['updatedAt'] = date('c');
                    $found = true;
                    break;
                }
            }
            unset($e);

            if (!$found) {
                admin_respond(404, ['message' => 'Không tìm thấy sự kiện.']);
            }
            admin_events_save($events);
            admin_respond(200, ['message' => 'Đã cập nhật thứ tự ưu tiên sự kiện.']);
        }

        admin_respond(400, ['message' => 'Thao tác không hợp lệ.']);
    }

    admin_respond(405, ['message' => 'Phương thức không được hỗ trợ.']);
} catch (Throwable $e) {
    admin_respond(500, ['message' => 'Lỗi máy chủ sự kiện: ' . $e->getMessage()]);
}

