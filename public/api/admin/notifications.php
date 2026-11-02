<?php
declare(strict_types=1);

require_once __DIR__ . '/_notifications.php';
require_once __DIR__ . '/_student_profiles.php';
require_once __DIR__ . '/_orders.php';
require_once __DIR__ . '/_rbac.php';

try {
    $session = admin_require_session();
    $method = strtoupper((string) ($_SERVER['REQUEST_METHOD'] ?? 'GET'));
    $action = trim((string) ($_GET['action'] ?? ''));

    // Extract current user ID for user-scoped read/trash state
    $currentUserId = (string) ($session['user']['id'] ?? $session['user']['username'] ?? 'admin');

    if ($method === 'GET') {
        admin_require_permission($session, 'notifications.view');

        if ($action === 'check-unread') {
            $unreadCount = admin_notifications_unread_count($currentUserId);
            $trashCount = admin_notifications_trash_count($currentUserId);
            $recent = admin_notifications_list($currentUserId, ['limit' => 5, 'tab' => 'unread', 'view' => 'inbox']);
            admin_respond(200, [
                'unreadCount' => $unreadCount,
                'trashCount' => $trashCount,
                'latest' => $recent['items'],
                'timestamp' => date('Y-m-d H:i:s'),
            ]);
        }

        if ($action === 'stats') {
            admin_respond(200, ['stats' => admin_operations_stats($currentUserId)]);
        }

        if ($action === 'tasks') {
            $status = (string) ($_GET['status'] ?? 'all');
            $assignedTo = (string) ($_GET['assignedTo'] ?? 'all');
            $tasks = admin_tasks_list(['status' => $status, 'assignedTo' => $assignedTo]);
            admin_respond(200, ['tasks' => $tasks]);
        }

        if ($action === 'activities') {
            admin_require_permission($session, 'notifications.view_logs');
            $targetType = (string) ($_GET['targetType'] ?? 'all');
            $search = (string) ($_GET['search'] ?? '');
            $limit = (int) ($_GET['limit'] ?? 30);
            $activities = admin_activity_logs_list([
                'targetType' => $targetType,
                'search' => $search,
                'limit' => $limit,
            ]);
            admin_respond(200, ['activities' => $activities]);
        }

        if ($action === 'staff') {
            admin_respond(200, ['staff' => admin_staff_list()]);
        }

        // Default: Full Operations Center view
        $view = (string) ($_GET['view'] ?? 'inbox'); // 'inbox' | 'trash'
        if ($view === 'trash') {
            admin_require_permission($session, 'notifications.trash_view');
        }

        $tab = (string) ($_GET['tab'] ?? 'all');
        $priority = (string) ($_GET['priority'] ?? 'all');
        $search = (string) ($_GET['search'] ?? '');
        $limit = max(1, min(100, (int) ($_GET['limit'] ?? 10)));
        $offset = max(0, (int) ($_GET['offset'] ?? 0));

        $notificationsResult = admin_notifications_list($currentUserId, [
            'view' => $view,
            'tab' => $tab,
            'priority' => $priority,
            'search' => $search,
            'limit' => $limit,
            'offset' => $offset,
        ]);

        $stats = admin_operations_stats($currentUserId);
        $tasks = admin_tasks_list(['status' => 'pending']);
        $activities = admin_activity_logs_list(['limit' => 10]);
        $staff = admin_staff_list();

        $allProfiles = admin_student_profiles_list(['status' => 'all']);
        $pendingProfiles = array_values(array_filter(
            $allProfiles,
            static fn ($p) => in_array($p['status'] ?? '', ['tiep_nhan', 'cho_duyet', 'can_bo_sung'], true)
        ));

        admin_respond(200, [
            'notifications' => $notificationsResult['items'],
            'total' => $notificationsResult['total'],
            'unreadCount' => $notificationsResult['unreadCount'],
            'trashCount' => $notificationsResult['trashCount'],
            'view' => $view,
            'stats' => $stats,
            'tasks' => $tasks,
            'activities' => $activities,
            'staff' => $staff,
            'pendingProfiles' => array_slice($pendingProfiles, 0, 8),
            'serverTime' => date('Y-m-d H:i:s'),
        ]);
    }

    // Mutating methods require same-origin and CSRF
    admin_assert_same_origin();
    admin_require_csrf($session);

    if ($method === 'POST') {
        $payload = admin_read_json();

        // 1. Mark as read
        if ($action === 'mark-read') {
            admin_require_permission($session, 'notifications.mark_read');
            $ids = isset($payload['ids']) && is_array($payload['ids']) ? $payload['ids'] : [];
            $id = trim((string) ($payload['id'] ?? ''));
            if ($id !== '') {
                $ids[] = $id;
            }
            if (empty($ids)) {
                admin_respond(422, ['message' => 'Thiếu ID thông báo cần đánh dấu.']);
            }

            foreach ($ids as $notifId) {
                admin_notification_mark_read($notifId, $currentUserId);
            }

            admin_respond(200, [
                'success' => true,
                'unreadCount' => admin_notifications_unread_count($currentUserId),
                'message' => 'Đã đánh dấu đã đọc thành công.',
            ]);
        }

        // 2. Mark as unread
        if ($action === 'mark-unread') {
            admin_require_permission($session, 'notifications.mark_read');
            $id = trim((string) ($payload['id'] ?? ''));
            if ($id === '') {
                admin_respond(422, ['message' => 'Thiếu ID thông báo.']);
            }
            admin_notification_mark_unread($id, $currentUserId);
            admin_respond(200, [
                'success' => true,
                'unreadCount' => admin_notifications_unread_count($currentUserId),
                'message' => 'Đã đánh dấu chưa đọc.',
            ]);
        }

        // 3. Mark all as read
        if ($action === 'mark-all-read') {
            admin_require_permission($session, 'notifications.mark_all_read');
            $count = admin_notifications_mark_all_read($currentUserId);
            admin_respond(200, [
                'success' => true,
                'markedCount' => $count,
                'unreadCount' => 0,
                'message' => "Đã đánh dấu {$count} thông báo là đã đọc.",
            ]);
        }

        // 4. Move to Trash (Single or Bulk)
        if ($action === 'trash' || $action === 'bulk-trash') {
            $ids = isset($payload['ids']) && is_array($payload['ids']) ? $payload['ids'] : [];
            $id = trim((string) ($payload['id'] ?? ''));
            if ($id !== '') {
                $ids[] = $id;
            }
            if (empty($ids)) {
                admin_respond(422, ['message' => 'Thiếu ID thông báo cần đưa vào thùng rác.']);
            }

            if (count($ids) > 1) {
                admin_require_permission($session, 'notifications.bulk_delete');
                $count = admin_notifications_bulk_trash($ids, $currentUserId);
            } else {
                admin_require_permission($session, 'notifications.delete');
                $count = admin_notification_move_to_trash($ids[0], $currentUserId) ? 1 : 0;
            }

            admin_respond(200, [
                'success' => true,
                'count' => $count,
                'unreadCount' => admin_notifications_unread_count($currentUserId),
                'trashCount' => admin_notifications_trash_count($currentUserId),
                'message' => "Đã chuyển {$count} thông báo vào thùng rác (tự động xóa sau 30 ngày).",
            ]);
        }

        // 5. Restore from Trash (Single or Bulk)
        if ($action === 'restore' || $action === 'bulk-restore') {
            $ids = isset($payload['ids']) && is_array($payload['ids']) ? $payload['ids'] : [];
            $id = trim((string) ($payload['id'] ?? ''));
            if ($id !== '') {
                $ids[] = $id;
            }
            if (empty($ids)) {
                admin_respond(422, ['message' => 'Thiếu ID thông báo cần khôi phục.']);
            }

            if (count($ids) > 1) {
                admin_require_permission($session, 'notifications.bulk_restore');
                $count = admin_notifications_bulk_restore($ids, $currentUserId);
            } else {
                admin_require_permission($session, 'notifications.restore');
                $count = admin_notification_restore_from_trash($ids[0], $currentUserId) ? 1 : 0;
            }

            admin_respond(200, [
                'success' => true,
                'count' => $count,
                'unreadCount' => admin_notifications_unread_count($currentUserId),
                'trashCount' => admin_notifications_trash_count($currentUserId),
                'message' => "Đã khôi phục {$count} thông báo về hộp thư đến.",
            ]);
        }

        // 6. Permanent Delete (Single or Bulk)
        if ($action === 'permanent-delete' || $action === 'bulk-permanent-delete') {
            admin_require_permission($session, 'notifications.delete_permanently');
            $ids = isset($payload['ids']) && is_array($payload['ids']) ? $payload['ids'] : [];
            $id = trim((string) ($payload['id'] ?? ''));
            if ($id !== '') {
                $ids[] = $id;
            }
            if (empty($ids)) {
                admin_respond(422, ['message' => 'Thiếu ID thông báo cần xóa vĩnh viễn.']);
            }

            if (count($ids) > 1) {
                $count = admin_notifications_bulk_permanent_delete($ids, $currentUserId);
            } else {
                $count = admin_notification_permanent_delete($ids[0], $currentUserId) ? 1 : 0;
            }

            admin_respond(200, [
                'success' => true,
                'count' => $count,
                'unreadCount' => admin_notifications_unread_count($currentUserId),
                'trashCount' => admin_notifications_trash_count($currentUserId),
                'message' => "Đã xóa vĩnh viễn {$count} thông báo khỏi hệ thống.",
            ]);
        }

        // 7. Empty All Trash
        if ($action === 'empty-trash') {
            admin_require_permission($session, 'notifications.delete_permanently');
            $count = admin_notifications_empty_trash($currentUserId);
            admin_respond(200, [
                'success' => true,
                'count' => $count,
                'unreadCount' => admin_notifications_unread_count($currentUserId),
                'trashCount' => 0,
                'message' => "Đã dọn sạch thùng rác ({$count} thông báo).",
            ]);
        }

        // 8. Manual Trigger for 30-Day Purge
        if ($action === 'purge-expired') {
            admin_require_permission($session, 'notifications.manage');
            $purged = admin_notifications_purge_expired_trash();
            admin_respond(200, [
                'success' => true,
                'purgedCount' => $purged,
                'message' => "Đã tự động dọn dẹp {$purged} thông báo hết hạn 30 ngày.",
            ]);
        }

        // 9. Task Creation & Assignment
        if ($action === 'create-task') {
            admin_require_permission($session, 'tasks.manage');
            $title = trim((string) ($payload['title'] ?? ''));
            if ($title === '') {
                admin_respond(422, ['message' => 'Tiêu đề công việc không được để trống.']);
            }
            $task = admin_task_create($payload);
            admin_respond(201, [
                'success' => true,
                'task' => $task,
                'message' => 'Đã thêm công việc thành công.',
            ]);
        }

        if ($action === 'assign-staff') {
            $targetType = trim((string) ($payload['targetType'] ?? ''));
            $targetId = trim((string) ($payload['targetId'] ?? ''));
            $staffId = trim((string) ($payload['staffId'] ?? ''));

            if ($targetType === '' || $targetId === '' || $staffId === '') {
                admin_respond(422, ['message' => 'Thiếu thông tin phân công.']);
            }

            if ($targetType === 'student') {
                admin_require_permission($session, 'students.assign');
            } else {
                admin_require_permission($session, 'tasks.assign');
            }

            $staff = admin_staff_find($staffId);
            if ($staff === null) {
                admin_respond(404, ['message' => 'Không tìm thấy nhân viên.']);
            }

            if ($targetType === 'student') {
                $profile = admin_student_profile_find($targetId);
                if ($profile === null) {
                    admin_respond(404, ['message' => 'Không tìm thấy hồ sơ học viên.']);
                }

                // Update profile with assigned staff
                $updateRes = admin_student_profile_update($targetId, [
                    'assignedTo' => $staff['id'],
                    'assignedStaffName' => $staff['name'],
                ]);

                // Create or update task for this staff
                admin_task_create([
                    'title' => 'Phụ trách hồ sơ: ' . $profile['fullName'],
                    'description' => 'Chịu trách nhiệm kiểm tra, liên hệ và hướng dẫn hoàn thiện hồ sơ cho học viên ' . $profile['fullName'] . '.',
                    'category' => 'student_check',
                    'priority' => 'medium',
                    'targetType' => 'student',
                    'targetId' => $profile['id'],
                    'targetName' => $profile['fullName'],
                    'targetUrl' => '/quan-tri-viejap?section=students&id=' . $profile['id'],
                    'assignedTo' => $staff['id'],
                    'assignedToName' => $staff['name'],
                    'dueAt' => date('Y-m-d H:i:s', time() + 86400 * 3),
                ]);

                admin_notification_create([
                    'eventType' => 'staff.assigned',
                    'category' => 'staff',
                    'title' => 'Phân công nhân sự: ' . $profile['fullName'],
                    'message' => 'Đã giao hồ sơ ' . $profile['fullName'] . ' cho cán bộ ' . $staff['name'] . ' phụ trách.',
                    'actor' => ['id' => 'admin', 'name' => 'Quản trị viên', 'role' => 'Admin'],
                    'target' => [
                        'type' => 'student',
                        'id' => $profile['id'],
                        'name' => $profile['fullName'],
                        'url' => '/quan-tri-viejap?section=students&id=' . $profile['id'],
                    ],
                    'priority' => 'medium',
                ]);

                admin_activity_log_create([
                    'actorName' => 'Admin',
                    'actorRole' => 'Quản trị viên',
                    'action' => 'Phân công nhân sự',
                    'targetType' => 'student',
                    'targetId' => $profile['id'],
                    'targetName' => $profile['fullName'],
                    'details' => 'Giao hồ sơ học viên cho ' . $staff['name'] . ' (' . $staff['role'] . ').',
                    'changes' => [
                        [
                            'field' => 'assignedStaff',
                            'fieldLabel' => 'Cán bộ phụ trách',
                            'before' => $profile['assignedStaffName'] ?? 'Chưa phân công',
                            'after' => $staff['name'],
                        ],
                    ],
                ]);

                admin_respond(200, [
                    'success' => true,
                    'message' => 'Đã phân công hồ sơ cho ' . $staff['name'] . ' thành công.',
                ]);
            }

            if ($targetType === 'task') {
                $task = admin_task_update($targetId, ['assignedTo' => $staffId]);
                if ($task === null) {
                    admin_respond(404, ['message' => 'Không tìm thấy công việc.']);
                }
                admin_respond(200, [
                    'success' => true,
                    'task' => $task,
                    'message' => 'Đã chuyển giao công việc cho ' . $staff['name'] . '.',
                ]);
            }

            admin_respond(400, ['message' => 'Loại đối tượng phân công không hợp lệ.']);
        }

        admin_respond(404, ['message' => 'Hành động không hợp lệ.']);
    }

    if ($method === 'PUT') {
        admin_require_permission($session, 'tasks.manage');
        $payload = admin_read_json();
        $id = trim((string) ($payload['id'] ?? ''));
        if ($id === '') {
            admin_respond(422, ['message' => 'Thiếu ID công việc.']);
        }

        $task = admin_task_update($id, $payload);
        if ($task === null) {
            admin_respond(404, ['message' => 'Không tìm thấy công việc.']);
        }

        admin_respond(200, [
            'success' => true,
            'task' => $task,
            'message' => 'Cập nhật công việc thành công.',
        ]);
    }

    if ($method === 'DELETE') {
        $id = trim((string) ($_GET['id'] ?? ''));
        if ($id === '') {
            $payload = admin_read_json();
            $id = trim((string) ($payload['id'] ?? ''));
        }
        if ($id === '') {
            admin_respond(422, ['message' => 'Thiếu ID thông báo cần xóa.']);
        }

        $permanent = (bool) ($_GET['permanent'] ?? false);
        if ($permanent) {
            admin_require_permission($session, 'notifications.delete_permanently');
            $success = admin_notification_permanent_delete($id, $currentUserId);
            $msg = 'Đã xóa vĩnh viễn thông báo.';
        } else {
            admin_require_permission($session, 'notifications.delete');
            $success = admin_notification_move_to_trash($id, $currentUserId);
            $msg = 'Đã chuyển thông báo vào thùng rác.';
        }

        admin_respond(200, [
            'success' => $success,
            'unreadCount' => admin_notifications_unread_count($currentUserId),
            'trashCount' => admin_notifications_trash_count($currentUserId),
            'message' => $msg,
        ]);
    }

    admin_respond(405, ['message' => 'Phương thức không được hỗ trợ.']);
} catch (Throwable $error) {
    admin_handle_exception($error);
}
