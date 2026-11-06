<?php
declare(strict_types=1);

require_once __DIR__ . '/_activities.php';
require_once __DIR__ . '/_rbac.php';

try {
    $method = strtoupper((string) ($_SERVER['REQUEST_METHOD'] ?? 'GET'));
    $action = trim((string) ($_GET['action'] ?? ''));

    if ($method === 'GET') {
        $session = admin_require_session();
        admin_require_permission($session, 'activities.view');

        if ($action === 'templates') {
            admin_respond(200, [
                'templates' => admin_activity_templates(),
            ]);
        }

        if ($action === 'categories') {
            admin_respond(200, [
                'categories' => admin_activity_categories(),
            ]);
        }

        if ($action === 'find' || $action === 'get') {
            $id = trim((string) ($_GET['id'] ?? ''));
            if ($id === '') {
                admin_respond(400, ['message' => 'Thiếu mã hoạt động (id).']);
            }
            $activity = admin_activity_find($id);
            if ($activity === null) {
                admin_respond(404, ['message' => 'Không tìm thấy hoạt động.']);
            }
            $quality = admin_activity_check_quality($activity);
            admin_respond(200, [
                'activity' => $activity,
                'quality' => $quality,
            ]);
        }

        if ($action === 'quality-check') {
            $id = trim((string) ($_GET['id'] ?? ''));
            $activity = admin_activity_find($id);
            if ($activity === null) {
                admin_respond(404, ['message' => 'Không tìm thấy hoạt động.']);
            }
            admin_respond(200, [
                'quality' => admin_activity_check_quality($activity),
            ]);
        }

        // List activities with filters
        $page = isset($_GET['page']) ? max(1, (int) $_GET['page']) : 1;
        $limit = isset($_GET['limit']) ? max(1, min(100, (int) $_GET['limit'])) : 10;

        $filters = [
            'q' => trim((string) ($_GET['q'] ?? '')),
            'status' => trim((string) ($_GET['status'] ?? 'all')),
            'level' => trim((string) ($_GET['level'] ?? 'all')),
            'category' => trim((string) ($_GET['category'] ?? 'all')),
            'badge' => trim((string) ($_GET['badge'] ?? 'all')),
            'position' => trim((string) ($_GET['position'] ?? 'all')),
            'page' => $page,
            'limit' => $limit,
        ];

        $result = admin_activities_list($filters);

        admin_respond(200, $result);
    }

    if ($method === 'POST') {
        $session = admin_require_session();
        admin_require_csrf($session);
        $body = admin_read_json();

        if ($action === 'duplicate') {
            admin_require_permission($session, 'activities.create');
            $id = trim((string) ($body['id'] ?? $_GET['id'] ?? ''));
            if ($id === '') {
                admin_respond(400, ['message' => 'Thiếu id hoạt động cần nhân bản.']);
            }
            $duplicated = admin_activity_duplicate($id, $session);
            if ($duplicated === null) {
                admin_respond(404, ['message' => 'Không tìm thấy hoạt động gốc để nhân bản.']);
            }
            admin_respond(201, [
                'message' => 'Nhân bản hoạt động thành công!',
                'activity' => $duplicated,
            ]);
        }

        if ($action === 'approve') {
            admin_require_permission($session, 'activities.approve');
            $id = trim((string) ($body['id'] ?? ''));
            $isApproved = !empty($body['isApproved']);
            $note = trim((string) ($body['note'] ?? ''));
            if ($id === '') {
                admin_respond(400, ['message' => 'Thiếu id hoạt động.']);
            }
            $updated = admin_activity_approve($id, $isApproved, $note, $session);
            if ($updated === null) {
                admin_respond(404, ['message' => 'Không tìm thấy hoạt động để duyệt.']);
            }
            admin_respond(200, [
                'message' => $isApproved ? 'Đã phê duyệt hoạt động!' : 'Đã từ chối duyệt hoạt động.',
                'activity' => $updated,
            ]);
        }

        if ($action === 'publish') {
            admin_require_permission($session, 'activities.publish');
            $id = trim((string) ($body['id'] ?? ''));
            $scheduledAt = isset($body['scheduledAt']) && trim((string) $body['scheduledAt']) !== '' 
                ? trim((string) $body['scheduledAt']) 
                : null;
            if ($id === '') {
                admin_respond(400, ['message' => 'Thiếu id hoạt động.']);
            }
            $updated = admin_activity_publish($id, $scheduledAt, $session);
            if ($updated === null) {
                admin_respond(404, ['message' => 'Không tìm thấy hoạt động để xuất bản.']);
            }
            admin_respond(200, [
                'message' => $scheduledAt ? 'Đã lên lịch xuất bản hoạt động!' : 'Xuất bản hoạt động thành công!',
                'activity' => $updated,
            ]);
        }

        if ($action === 'archive') {
            admin_require_permission($session, 'activities.update');
            $id = trim((string) ($body['id'] ?? ''));
            if ($id === '') {
                admin_respond(400, ['message' => 'Thiếu id hoạt động.']);
            }
            $updated = admin_activity_archive($id, $session);
            if ($updated === null) {
                admin_respond(404, ['message' => 'Không tìm thấy hoạt động để lưu trữ.']);
            }
            admin_respond(200, [
                'message' => 'Đã lưu trữ hoạt động vào kho.',
                'activity' => $updated,
            ]);
        }

        if ($action === 'reorder') {
            admin_require_permission($session, 'activities.manage_priority');
            $orderedIds = is_array($body['orderedIds'] ?? null) ? $body['orderedIds'] : [];
            $position = trim((string) ($body['position'] ?? 'latest'));
            if (empty($orderedIds)) {
                admin_respond(400, ['message' => 'Danh sách orderedIds không hợp lệ.']);
            }
            admin_activities_reorder($orderedIds, $position);
            admin_respond(200, [
                'message' => 'Đã cập nhật thứ tự hiển thị hoạt động!',
            ]);
        }

        if ($action === 'update' || ($body['action'] ?? '') === 'update') {
            admin_require_permission($session, 'activities.update');
            $id = trim((string) ($_GET['id'] ?? $body['id'] ?? ''));
            if ($id === '') {
                admin_respond(400, ['message' => 'Thiếu id hoạt động cần cập nhật.']);
            }
            $updated = admin_activity_update($id, $body, $session);
            if ($updated === null) {
                admin_respond(404, ['message' => 'Không tìm thấy hoạt động cần cập nhật.']);
            }
            admin_respond(200, [
                'message' => 'Cập nhật hoạt động thành công!',
                'activity' => $updated,
            ]);
        }

        // Default create
        admin_require_permission($session, 'activities.create');
        if (empty($body['title'])) {
            admin_respond(422, ['message' => 'Tiêu đề hoạt động không được để trống.']);
        }
        $created = admin_activity_create($body, $session);
        admin_respond(201, [
            'message' => 'Tạo hoạt động mới thành công!',
            'activity' => $created,
        ]);
    }

    if ($method === 'PUT') {
        $session = admin_require_session();
        admin_require_csrf($session);
        admin_require_permission($session, 'activities.update');

        $body = admin_read_json();
        $id = trim((string) ($_GET['id'] ?? $body['id'] ?? ''));
        if ($id === '') {
            admin_respond(400, ['message' => 'Thiếu id hoạt động cần cập nhật.']);
        }

        $updated = admin_activity_update($id, $body, $session);
        if ($updated === null) {
            admin_respond(404, ['message' => 'Không tìm thấy hoạt động cần cập nhật.']);
        }

        admin_respond(200, [
            'message' => 'Cập nhật hoạt động thành công!',
            'activity' => $updated,
        ]);
    }

    if ($method === 'DELETE') {
        $session = admin_require_session();
        admin_require_csrf($session);
        admin_require_permission($session, 'activities.delete');

        $id = trim((string) ($_GET['id'] ?? ''));
        if ($id === '') {
            admin_respond(400, ['message' => 'Thiếu id hoạt động cần xóa.']);
        }

        $ok = admin_activity_delete($id, $session);
        if (!$ok) {
            admin_respond(404, ['message' => 'Không tìm thấy hoạt động hoặc xóa thất bại.']);
        }

        admin_respond(200, [
            'message' => 'Đã xóa hoạt động thành công!',
        ]);
    }

    admin_respond(405, ['message' => 'Phương thức không được hỗ trợ.']);
} catch (AdminApiException $e) {
    admin_respond($e->statusCode, ['message' => $e->getMessage()]);
} catch (Throwable $e) {
    admin_respond(500, ['message' => 'Lỗi máy chủ nội bộ: ' . $e->getMessage()]);
}
