<?php
declare(strict_types=1);

require_once __DIR__ . '/admin/_events.php';

try {
    $method = strtoupper((string) ($_SERVER['REQUEST_METHOD'] ?? 'GET'));

    if ($method === 'GET') {
        $allEvents = admin_events_load();
        $now = date('c');
        $path = trim((string) ($_GET['path'] ?? '/'));

        // Filter: only published and active within schedule
        $active = array_values(array_filter($allEvents, function ($e) use ($now, $path) {
            if (($e['status'] ?? '') !== 'published') {
                return false;
            }

            $sched = $e['schedule'] ?? [];
            if (!empty($sched['startDate']) && $now < $sched['startDate']) {
                return false;
            }
            if (!empty($sched['endDate']) && $now > $sched['endDate']) {
                return false;
            }

            // Path targeting
            $pages = $e['targeting']['pages'] ?? ['all'];
            if (!in_array('all', $pages, true)) {
                $matched = false;
                foreach ($pages as $p) {
                    if ($p === $path || ($p !== '/' && str_starts_with($path, $p))) {
                        $matched = true;
                        break;
                    }
                }
                if (!$matched) {
                    return false;
                }
            }

            return true;
        }));

        // Sort by Priority level then priorityOrder ASC
        $levelWeights = ['high' => 1, 'normal' => 2, 'low' => 3];
        usort($active, function ($a, $b) use ($levelWeights) {
            $lA = $levelWeights[$a['delivery']['priorityLevel'] ?? 'normal'] ?? 2;
            $lB = $levelWeights[$b['delivery']['priorityLevel'] ?? 'normal'] ?? 2;
            if ($lA !== $lB) {
                return $lA <=> $lB;
            }
            $pA = (int) ($a['delivery']['priorityOrder'] ?? 50);
            $pB = (int) ($b['delivery']['priorityOrder'] ?? 50);
            if ($pA !== $pB) {
                return $pA <=> $pB;
            }
            return strcmp($b['createdAt'] ?? '', $a['createdAt'] ?? '');
        });

        // Group by format
        $byFormat = [
            'top_bar' => [],
            'popup_center' => [],
            'popup_corner' => [],
            'index_banner' => [],
            'floating_button' => [],
            'list' => [],
        ];

        foreach ($active as $e) {
            $formats = $e['displayFormats'] ?? [];
            foreach ($formats as $fmt) {
                if (isset($byFormat[$fmt])) {
                    $byFormat[$fmt][] = $e;
                }
            }
        }

        admin_respond(200, [
            'total' => count($active),
            'events' => $active,
            'byFormat' => $byFormat,
        ]);
    }

    if ($method === 'POST') {
        $body = admin_read_json_body();
        $action = trim((string) ($body['action'] ?? 'track'));

        if ($action === 'track') {
            $eventId = trim((string) ($body['eventId'] ?? ''));
            $type = in_array($body['type'] ?? '', ['view', 'click', 'dismiss'], true) ? $body['type'] : 'view';
            $format = trim((string) ($body['format'] ?? 'general'));

            if ($eventId === '') {
                admin_respond(422, ['message' => 'Mã sự kiện không được để trống.']);
            }

            $events = admin_events_load();
            $updated = false;

            foreach ($events as &$e) {
                if (($e['id'] ?? '') === $eventId) {
                    if (!isset($e['analytics']) || !is_array($e['analytics'])) {
                        $e['analytics'] = ['views' => 0, 'clicks' => 0, 'dismisses' => 0, 'byFormat' => []];
                    }

                    if ($type === 'view') {
                        $e['analytics']['views'] = ((int) ($e['analytics']['views'] ?? 0)) + 1;
                    } elseif ($type === 'click') {
                        $e['analytics']['clicks'] = ((int) ($e['analytics']['clicks'] ?? 0)) + 1;
                    } elseif ($type === 'dismiss') {
                        $e['analytics']['dismisses'] = ((int) ($e['analytics']['dismisses'] ?? 0)) + 1;
                    }

                    if (!isset($e['analytics']['byFormat']) || !is_array($e['analytics']['byFormat'])) {
                        $e['analytics']['byFormat'] = [];
                    }
                    if (!isset($e['analytics']['byFormat'][$format])) {
                        $e['analytics']['byFormat'][$format] = ['views' => 0, 'clicks' => 0];
                    }

                    if ($type === 'view') {
                        $e['analytics']['byFormat'][$format]['views'] = ((int) ($e['analytics']['byFormat'][$format]['views'] ?? 0)) + 1;
                    } elseif ($type === 'click') {
                        $e['analytics']['byFormat'][$format]['clicks'] = ((int) ($e['analytics']['byFormat'][$format]['clicks'] ?? 0)) + 1;
                    }

                    $updated = true;
                    break;
                }
            }
            unset($e);

            if ($updated) {
                admin_events_save($events);
            }

            admin_respond(200, ['success' => true]);
        }

        admin_respond(400, ['message' => 'Yêu cầu không hợp lệ']);
    }

    admin_respond(405, ['message' => 'Phương thức không được hỗ trợ']);
} catch (Throwable $e) {
    admin_respond(500, ['message' => 'Lỗi sự kiện: ' . $e->getMessage()]);
}

