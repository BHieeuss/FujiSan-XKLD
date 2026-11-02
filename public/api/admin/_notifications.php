<?php
declare(strict_types=1);

require_once __DIR__ . '/_bootstrap.php';

function admin_notifications_file_path(): string
{
    return admin_storage_directory() . DIRECTORY_SEPARATOR . 'notifications.json';
}

function admin_activity_logs_file_path(): string
{
    return admin_storage_directory() . DIRECTORY_SEPARATOR . 'activity-logs.json';
}

function admin_tasks_file_path(): string
{
    return admin_storage_directory() . DIRECTORY_SEPARATOR . 'tasks.json';
}

function admin_staff_file_path(): string
{
    return admin_storage_directory() . DIRECTORY_SEPARATOR . 'staff.json';
}

function admin_generate_uuid(): string
{
    return sprintf(
        '%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
        mt_rand(0, 0xffff), mt_rand(0, 0xffff),
        mt_rand(0, 0xffff),
        mt_rand(0, 0x0fff) | 0x4000,
        mt_rand(0, 0x3fff) | 0x8000,
        mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
    );
}

// -------------------------------------------------------------
// STAFF STORE
// -------------------------------------------------------------
function admin_staff_seed_data(): array
{
    $now = date('Y-m-d H:i:s');
    return [
        [
            'id' => 'staff-admin',
            'name' => 'Quản Trị Viên VieJap',
            'role' => 'Tổng quản trị',
            'email' => 'admin@viejap.com',
            'phone' => '0966 966 284',
            'avatarUrl' => 'assets/images/logo.png',
            'isActive' => true,
            'createdAt' => $now,
        ],
        [
            'id' => 'staff-01',
            'name' => 'Nguyễn Thị Mai',
            'role' => 'Chuyên viên tiếp nhận & xử lý hồ sơ',
            'email' => 'mai.nguyen@viejap.com',
            'phone' => '0912 345 678',
            'avatarUrl' => '',
            'isActive' => true,
            'createdAt' => $now,
        ],
        [
            'id' => 'staff-02',
            'name' => 'Trần Văn Bình',
            'role' => 'Cán bộ tuyển dụng & đối tác Nhật Bản',
            'email' => 'binh.tran@viejap.com',
            'phone' => '0987 654 321',
            'avatarUrl' => '',
            'isActive' => true,
            'createdAt' => $now,
        ],
        [
            'id' => 'staff-03',
            'name' => 'Lê Hoàng Yến',
            'role' => 'Phụ trách đào tạo tiếng Nhật & Tokutei',
            'email' => 'yen.le@viejap.com',
            'phone' => '0933 221 100',
            'avatarUrl' => '',
            'isActive' => true,
            'createdAt' => $now,
        ],
    ];
}

function admin_staff_list(): array
{
    $path = admin_staff_file_path();
    if (!is_file($path)) {
        $staff = admin_staff_seed_data();
        admin_write_json_file($path, $staff);
        return $staff;
    }

    $raw = file_get_contents($path);
    $data = $raw === false ? null : json_decode($raw, true);
    if (!is_array($data) || empty($data)) {
        $staff = admin_staff_seed_data();
        admin_write_json_file($path, $staff);
        return $staff;
    }

    return $data;
}

function admin_staff_find(string $id): ?array
{
    $all = admin_staff_list();
    foreach ($all as $item) {
        if ($item['id'] === $id) {
            return $item;
        }
    }
    return null;
}

// -------------------------------------------------------------
// NOTIFICATIONS RECIPIENTS & TRASH PURGE ENGINE
// -------------------------------------------------------------
function admin_notification_resolve_recipients(array $eventData): array
{
    require_once __DIR__ . '/_rbac.php';

    $users = admin_users_list();
    $recipients = [];
    $seenUserIds = [];

    $category = (string) ($eventData['category'] ?? 'system');
    $explicitUserIds = is_array($eventData['recipientUserIds'] ?? null) ? $eventData['recipientUserIds'] : [];

    foreach ($users as $u) {
        $uId = (string) ($u['id'] ?? $u['username']);
        $username = (string) ($u['username'] ?? '');
        $roleId = (string) ($u['roleId'] ?? '');
        $status = (string) ($u['status'] ?? 'active');

        // Only active users can receive notifications
        if ($status !== 'active') {
            continue;
        }

        $isSuperAdmin = ($roleId === 'super_admin' || $username === 'admin' || !empty($u['isSuperAdmin']));
        $isExplicitTarget = in_array($uId, $explicitUserIds, true) || in_array($username, $explicitUserIds, true);
        $isAdminRole = ($roleId === 'admin');

        // Rule 1: Super Admin ALWAYS receives notifications across the entire system
        // Rule 2: Explicitly specified recipient
        // Rule 3: General Admins receive orders, students, tasks, and system events
        $shouldReceive = false;
        if ($isSuperAdmin) {
            $shouldReceive = true;
        } elseif ($isExplicitTarget) {
            $shouldReceive = true;
        } elseif ($isAdminRole) {
            $shouldReceive = true;
        } else {
            // Check specific role permissions
            $userPerms = admin_user_effective_permissions($u);
            if ($category === 'orders' && in_array('orders.view', $userPerms, true)) {
                $shouldReceive = true;
            } elseif ($category === 'students' && in_array('students.view', $userPerms, true)) {
                $shouldReceive = true;
            } elseif ($category === 'tasks' && in_array('tasks.manage', $userPerms, true)) {
                $shouldReceive = true;
            }
        }

        if ($shouldReceive && !isset($seenUserIds[$uId])) {
            $seenUserIds[$uId] = true;
            $recipients[] = [
                'userId' => $uId,
                'username' => $username,
                'fullName' => (string) ($u['fullName'] ?? $username),
                'isRead' => false,
                'readAt' => null,
                'isTrash' => false,
                'trashedAt' => null,
                'trashExpiresAt' => null,
            ];
        }
    }

    // Safety fallback: if no recipients resolved, guarantee super admin is included
    if (empty($recipients)) {
        $recipients[] = [
            'userId' => 'admin',
            'username' => 'admin',
            'fullName' => 'Super Administrator',
            'isRead' => false,
            'readAt' => null,
            'isTrash' => false,
            'trashedAt' => null,
            'trashExpiresAt' => null,
        ];
    }

    return $recipients;
}

function admin_notifications_normalize_legacy(array &$notifications): bool
{
    $modified = false;
    foreach ($notifications as &$item) {
        if (!isset($item['recipients']) || !is_array($item['recipients']) || empty($item['recipients'])) {
            $legacyIsRead = (bool) ($item['isRead'] ?? false);
            $legacyReadAt = !empty($item['readAt']) ? (string) $item['readAt'] : null;
            $recipients = admin_notification_resolve_recipients(['category' => $item['category'] ?? 'system']);
            foreach ($recipients as &$r) {
                $r['isRead'] = $legacyIsRead;
                $r['readAt'] = $legacyReadAt;
                $r['isTrash'] = false;
                $r['trashedAt'] = null;
                $r['trashExpiresAt'] = null;
            }
            unset($r);
            $item['recipients'] = $recipients;
            $modified = true;
        }
    }
    unset($item);
    return $modified;
}

function admin_notifications_purge_expired_trash(): int
{
    $notifications = admin_notifications_load();
    if (empty($notifications)) {
        return 0;
    }

    $now = time();
    $purgedRecipientsCount = 0;
    $modified = false;

    foreach ($notifications as $nIndex => &$item) {
        if (!isset($item['recipients']) || !is_array($item['recipients'])) {
            continue;
        }

        $activeRecipients = [];
        foreach ($item['recipients'] as $recipient) {
            $isTrash = (bool) ($recipient['isTrash'] ?? false);
            $trashExpiresAt = !empty($recipient['trashExpiresAt']) ? strtotime($recipient['trashExpiresAt']) : 0;

            // If in trash and expired past 30 days
            if ($isTrash && $trashExpiresAt > 0 && $trashExpiresAt <= $now) {
                $purgedRecipientsCount++;
                $modified = true;
                continue; // Pruned
            }
            $activeRecipients[] = $recipient;
        }

        $item['recipients'] = $activeRecipients;

        // If no recipients left and not a persistent system welcome message, prune item
        if (empty($activeRecipients) && ($item['eventType'] ?? '') !== 'system.welcome') {
            unset($notifications[$nIndex]);
            $modified = true;
        }
    }
    unset($item);

    if ($modified) {
        admin_notifications_save(array_values($notifications));
    }

    return $purgedRecipientsCount;
}

// -------------------------------------------------------------
// NOTIFICATIONS CRUD WITH USER-SCOPED READ & TRASH
// -------------------------------------------------------------
function admin_notifications_load(): array
{
    $path = admin_notifications_file_path();
    if (!is_file($path)) {
        return [];
    }
    $raw = file_get_contents($path);
    $data = $raw === false ? null : json_decode($raw, true);
    return is_array($data) ? $data : [];
}

function admin_notifications_save(array $notifications): void
{
    admin_write_json_file(admin_notifications_file_path(), array_values($notifications));
}

function admin_notification_create(array $data): array
{
    $now = date('Y-m-d H:i:s');
    $recipients = admin_notification_resolve_recipients($data);

    $item = [
        'id' => admin_generate_uuid(),
        'eventType' => (string) ($data['eventType'] ?? 'system.alert'),
        'category' => (string) ($data['category'] ?? 'system'), // 'orders'|'students'|'tasks'|'users'|'staff'|'system'|'security'
        'title' => trim((string) ($data['title'] ?? 'Thông báo hệ thống')),
        'message' => trim((string) ($data['message'] ?? '')),
        'actor' => [
            'id' => (string) ($data['actor']['id'] ?? 'system'),
            'name' => (string) ($data['actor']['name'] ?? 'Hệ thống'),
            'role' => (string) ($data['actor']['role'] ?? 'Admin'),
        ],
        'target' => [
            'type' => (string) ($data['target']['type'] ?? 'general'),
            'id' => (string) ($data['target']['id'] ?? ''),
            'code' => (string) ($data['target']['code'] ?? ''),
            'name' => (string) ($data['target']['name'] ?? ''),
            'url' => (string) ($data['target']['url'] ?? ''),
        ],
        'priority' => in_array($data['priority'] ?? '', ['high', 'medium', 'low'], true) ? $data['priority'] : 'medium',
        'createdAt' => $now,
        'metadata' => is_array($data['metadata'] ?? null) ? $data['metadata'] : [],
        'recipients' => $recipients,
    ];

    $notifications = admin_notifications_load();
    array_unshift($notifications, $item);

    // Keep max 600 recent notifications to avoid unbounded file growth
    if (count($notifications) > 600) {
        $notifications = array_slice($notifications, 0, 600);
    }

    admin_notifications_save($notifications);
    return $item;
}

function admin_notifications_list(string $currentUserId = '', array $filters = []): array
{
    // Auto-sync initial events from real records if store is empty
    admin_notifications_auto_sync_initial_events();

    // Auto purge expired trash records (> 30 days)
    admin_notifications_purge_expired_trash();

    $notifications = admin_notifications_load();
    if (admin_notifications_normalize_legacy($notifications)) {
        admin_notifications_save($notifications);
    }

    $normalizedUserId = trim($currentUserId);
    if ($normalizedUserId === '') {
        $normalizedUserId = 'admin';
    }

    $view = trim((string) ($filters['view'] ?? 'inbox')); // 'inbox' | 'trash'
    $tab = trim((string) ($filters['tab'] ?? 'all'));
    $priority = trim((string) ($filters['priority'] ?? 'all'));
    $search = mb_strtolower(trim((string) ($filters['search'] ?? '')), 'UTF-8');
    $limit = max(1, min(100, (int) ($filters['limit'] ?? 10)));
    $offset = max(0, (int) ($filters['offset'] ?? 0));

    $now = time();
    $inboxUnreadCount = 0;
    $trashCount = 0;
    $filtered = [];

    foreach ($notifications as $item) {
        $recipients = $item['recipients'] ?? [];
        $userRec = null;

        foreach ($recipients as $r) {
            $rId = (string) ($r['userId'] ?? '');
            $rUser = (string) ($r['username'] ?? '');
            if ($rId === $normalizedUserId || $rUser === $normalizedUserId) {
                $userRec = $r;
                break;
            }
        }

        // If user is super admin or admin and was not explicitly in recipients, auto-bind
        if ($userRec === null && ($normalizedUserId === 'admin' || str_contains($normalizedUserId, 'admin'))) {
            $userRec = [
                'userId' => $normalizedUserId,
                'username' => 'admin',
                'fullName' => 'Super Administrator',
                'isRead' => (bool) ($item['isRead'] ?? false),
                'readAt' => !empty($item['readAt']) ? (string) $item['readAt'] : null,
                'isTrash' => false,
                'trashedAt' => null,
                'trashExpiresAt' => null,
            ];
        }

        if ($userRec === null) {
            continue; // Not for this user
        }

        $isTrash = (bool) ($userRec['isTrash'] ?? false);
        $isRead = (bool) ($userRec['isRead'] ?? false);

        if (!$isTrash) {
            if (!$isRead) {
                $inboxUnreadCount++;
            }
        } else {
            $trashCount++;
        }

        // Filter by View
        if ($view === 'trash' && !$isTrash) {
            continue;
        }
        if ($view === 'inbox' && $isTrash) {
            continue;
        }

        // Filter by Tab
        if ($tab === 'unread' && $isRead) {
            continue;
        }
        if ($tab !== 'all' && $tab !== 'unread' && ($item['category'] ?? '') !== $tab) {
            continue;
        }

        // Filter by Priority
        if ($priority !== 'all' && ($item['priority'] ?? 'medium') !== $priority) {
            continue;
        }

        // Filter by Search
        if ($search !== '') {
            $haystack = mb_strtolower(
                ($item['title'] ?? '') . ' ' .
                ($item['message'] ?? '') . ' ' .
                ($item['actor']['name'] ?? '') . ' ' .
                ($item['target']['name'] ?? '') . ' ' .
                ($item['target']['code'] ?? ''),
                'UTF-8'
            );
            if (!str_contains($haystack, $search)) {
                continue;
            }
        }

        // Decorate with user-scoped states
        $decorated = $item;
        $decorated['isRead'] = $isRead;
        $decorated['readAt'] = $userRec['readAt'] ?? null;
        $decorated['isTrash'] = $isTrash;
        $decorated['trashedAt'] = $userRec['trashedAt'] ?? null;
        $decorated['trashExpiresAt'] = $userRec['trashExpiresAt'] ?? null;

        if ($isTrash) {
            $expTimestamp = !empty($userRec['trashExpiresAt']) ? strtotime($userRec['trashExpiresAt']) : ($now + 30 * 86400);
            $secondsRemaining = max(0, $expTimestamp - $now);
            $daysRemaining = (int) ceil($secondsRemaining / 86400);
            $decorated['daysRemaining'] = $daysRemaining;

            if ($daysRemaining <= 1) {
                $decorated['humanExpiryLabel'] = 'Sắp bị xóa vĩnh viễn (hôm nay)';
            } elseif ($daysRemaining === 2) {
                $decorated['humanExpiryLabel'] = 'Còn 1 ngày';
            } else {
                $decorated['humanExpiryLabel'] = 'Còn ' . $daysRemaining . ' ngày';
            }
        }

        $filtered[] = $decorated;
    }

    $total = count($filtered);
    $items = array_values(array_slice($filtered, $offset, $limit));

    return [
        'items' => $items,
        'total' => $total,
        'unreadCount' => $inboxUnreadCount,
        'trashCount' => $trashCount,
    ];
}

function admin_notification_mark_read(string $id, string $currentUserId = ''): bool
{
    $notifications = admin_notifications_load();
    $userId = trim($currentUserId) !== '' ? trim($currentUserId) : 'admin';
    $updated = false;
    $now = date('Y-m-d H:i:s');

    foreach ($notifications as &$item) {
        if ($item['id'] === $id) {
            $foundRec = false;
            if (isset($item['recipients']) && is_array($item['recipients'])) {
                foreach ($item['recipients'] as &$r) {
                    if (($r['userId'] ?? '') === $userId || ($r['username'] ?? '') === $userId) {
                        $foundRec = true;
                        if (!$r['isRead']) {
                            $r['isRead'] = true;
                            $r['readAt'] = $now;
                            $updated = true;
                        }
                        break;
                    }
                }
                unset($r);
            }

            if (!$foundRec && ($userId === 'admin' || str_contains($userId, 'admin'))) {
                $item['recipients'][] = [
                    'userId' => $userId,
                    'username' => 'admin',
                    'fullName' => 'Super Administrator',
                    'isRead' => true,
                    'readAt' => $now,
                    'isTrash' => false,
                    'trashedAt' => null,
                    'trashExpiresAt' => null,
                ];
                $updated = true;
            }
            break;
        }
    }
    unset($item);

    if ($updated) {
        admin_notifications_save($notifications);
    }
    return $updated;
}

function admin_notification_mark_unread(string $id, string $currentUserId = ''): bool
{
    $notifications = admin_notifications_load();
    $userId = trim($currentUserId) !== '' ? trim($currentUserId) : 'admin';
    $updated = false;

    foreach ($notifications as &$item) {
        if ($item['id'] === $id) {
            if (isset($item['recipients']) && is_array($item['recipients'])) {
                foreach ($item['recipients'] as &$r) {
                    if (($r['userId'] ?? '') === $userId || ($r['username'] ?? '') === $userId) {
                        if ($r['isRead']) {
                            $r['isRead'] = false;
                            $r['readAt'] = null;
                            $updated = true;
                        }
                        break;
                    }
                }
                unset($r);
            }
            break;
        }
    }
    unset($item);

    if ($updated) {
        admin_notifications_save($notifications);
    }
    return $updated;
}

function admin_notifications_mark_all_read(string $currentUserId = ''): int
{
    $notifications = admin_notifications_load();
    $userId = trim($currentUserId) !== '' ? trim($currentUserId) : 'admin';
    $count = 0;
    $now = date('Y-m-d H:i:s');

    foreach ($notifications as &$item) {
        if (isset($item['recipients']) && is_array($item['recipients'])) {
            foreach ($item['recipients'] as &$r) {
                if (($r['userId'] ?? '') === $userId || ($r['username'] ?? '') === $userId) {
                    if (!$r['isRead'] && !($r['isTrash'] ?? false)) {
                        $r['isRead'] = true;
                        $r['readAt'] = $now;
                        $count++;
                    }
                    break;
                }
            }
            unset($r);
        }
    }
    unset($item);

    if ($count > 0) {
        admin_notifications_save($notifications);
    }
    return $count;
}

function admin_notification_move_to_trash(string $id, string $currentUserId = ''): bool
{
    $notifications = admin_notifications_load();
    $userId = trim($currentUserId) !== '' ? trim($currentUserId) : 'admin';
    $now = date('Y-m-d H:i:s');
    $expiresAt = date('Y-m-d H:i:s', time() + 30 * 86400);
    $updated = false;

    foreach ($notifications as &$item) {
        if ($item['id'] === $id) {
            $foundRec = false;
            if (isset($item['recipients']) && is_array($item['recipients'])) {
                foreach ($item['recipients'] as &$r) {
                    if (($r['userId'] ?? '') === $userId || ($r['username'] ?? '') === $userId) {
                        $foundRec = true;
                        if (!($r['isTrash'] ?? false)) {
                            $r['isTrash'] = true;
                            $r['trashedAt'] = $now;
                            $r['trashExpiresAt'] = $expiresAt;
                            $updated = true;
                        }
                        break;
                    }
                }
                unset($r);
            }

            if (!$foundRec && ($userId === 'admin' || str_contains($userId, 'admin'))) {
                $item['recipients'][] = [
                    'userId' => $userId,
                    'username' => 'admin',
                    'fullName' => 'Super Administrator',
                    'isRead' => (bool) ($item['isRead'] ?? false),
                    'readAt' => !empty($item['readAt']) ? (string) $item['readAt'] : null,
                    'isTrash' => true,
                    'trashedAt' => $now,
                    'trashExpiresAt' => $expiresAt,
                ];
                $updated = true;
            }
            break;
        }
    }
    unset($item);

    if ($updated) {
        admin_notifications_save($notifications);
    }
    return $updated;
}

function admin_notifications_bulk_trash(array $ids, string $currentUserId = ''): int
{
    $notifications = admin_notifications_load();
    $userId = trim($currentUserId) !== '' ? trim($currentUserId) : 'admin';
    $now = date('Y-m-d H:i:s');
    $expiresAt = date('Y-m-d H:i:s', time() + 30 * 86400);
    $count = 0;
    $idMap = array_flip($ids);

    foreach ($notifications as &$item) {
        if (isset($idMap[$item['id']])) {
            if (isset($item['recipients']) && is_array($item['recipients'])) {
                foreach ($item['recipients'] as &$r) {
                    if (($r['userId'] ?? '') === $userId || ($r['username'] ?? '') === $userId) {
                        if (!($r['isTrash'] ?? false)) {
                            $r['isTrash'] = true;
                            $r['trashedAt'] = $now;
                            $r['trashExpiresAt'] = $expiresAt;
                            $count++;
                        }
                        break;
                    }
                }
                unset($r);
            }
        }
    }
    unset($item);

    if ($count > 0) {
        admin_notifications_save($notifications);
    }
    return $count;
}

function admin_notification_restore_from_trash(string $id, string $currentUserId = ''): bool
{
    $notifications = admin_notifications_load();
    $userId = trim($currentUserId) !== '' ? trim($currentUserId) : 'admin';
    $updated = false;

    foreach ($notifications as &$item) {
        if ($item['id'] === $id) {
            if (isset($item['recipients']) && is_array($item['recipients'])) {
                foreach ($item['recipients'] as &$r) {
                    if (($r['userId'] ?? '') === $userId || ($r['username'] ?? '') === $userId) {
                        if ($r['isTrash'] ?? false) {
                            $r['isTrash'] = false;
                            $r['trashedAt'] = null;
                            $r['trashExpiresAt'] = null;
                            $updated = true;
                        }
                        break;
                    }
                }
                unset($r);
            }
            break;
        }
    }
    unset($item);

    if ($updated) {
        admin_notifications_save($notifications);
    }
    return $updated;
}

function admin_notifications_bulk_restore(array $ids, string $currentUserId = ''): int
{
    $notifications = admin_notifications_load();
    $userId = trim($currentUserId) !== '' ? trim($currentUserId) : 'admin';
    $count = 0;
    $idMap = array_flip($ids);

    foreach ($notifications as &$item) {
        if (isset($idMap[$item['id']])) {
            if (isset($item['recipients']) && is_array($item['recipients'])) {
                foreach ($item['recipients'] as &$r) {
                    if (($r['userId'] ?? '') === $userId || ($r['username'] ?? '') === $userId) {
                        if ($r['isTrash'] ?? false) {
                            $r['isTrash'] = false;
                            $r['trashedAt'] = null;
                            $r['trashExpiresAt'] = null;
                            $count++;
                        }
                        break;
                    }
                }
                unset($r);
            }
        }
    }
    unset($item);

    if ($count > 0) {
        admin_notifications_save($notifications);
    }
    return $count;
}

function admin_notification_permanent_delete(string $id, string $currentUserId = ''): bool
{
    $notifications = admin_notifications_load();
    $userId = trim($currentUserId) !== '' ? trim($currentUserId) : 'admin';
    $modified = false;

    foreach ($notifications as $nIndex => &$item) {
        if ($item['id'] === $id) {
            if (isset($item['recipients']) && is_array($item['recipients'])) {
                $remains = [];
                foreach ($item['recipients'] as $r) {
                    if (($r['userId'] ?? '') !== $userId && ($r['username'] ?? '') !== $userId) {
                        $remains[] = $r;
                    } else {
                        $modified = true;
                    }
                }
                $item['recipients'] = $remains;

                // If no recipients left anywhere, delete root item
                if (empty($remains) && ($item['eventType'] ?? '') !== 'system.welcome') {
                    unset($notifications[$nIndex]);
                }
            }
            break;
        }
    }
    unset($item);

    if ($modified) {
        admin_notifications_save(array_values($notifications));
    }
    return $modified;
}

function admin_notifications_bulk_permanent_delete(array $ids, string $currentUserId = ''): int
{
    $notifications = admin_notifications_load();
    $userId = trim($currentUserId) !== '' ? trim($currentUserId) : 'admin';
    $count = 0;
    $idMap = array_flip($ids);

    foreach ($notifications as $nIndex => &$item) {
        if (isset($idMap[$item['id']])) {
            if (isset($item['recipients']) && is_array($item['recipients'])) {
                $remains = [];
                $foundUser = false;
                foreach ($item['recipients'] as $r) {
                    if (($r['userId'] ?? '') !== $userId && ($r['username'] ?? '') !== $userId) {
                        $remains[] = $r;
                    } else {
                        $foundUser = true;
                    }
                }
                if ($foundUser) {
                    $count++;
                    $item['recipients'] = $remains;
                    if (empty($remains) && ($item['eventType'] ?? '') !== 'system.welcome') {
                        unset($notifications[$nIndex]);
                    }
                }
            }
        }
    }
    unset($item);

    if ($count > 0) {
        admin_notifications_save(array_values($notifications));
    }
    return $count;
}

function admin_notifications_empty_trash(string $currentUserId = ''): int
{
    $notifications = admin_notifications_load();
    $userId = trim($currentUserId) !== '' ? trim($currentUserId) : 'admin';
    $count = 0;

    foreach ($notifications as $nIndex => &$item) {
        if (isset($item['recipients']) && is_array($item['recipients'])) {
            $remains = [];
            $foundTrash = false;
            foreach ($item['recipients'] as $r) {
                if ((($r['userId'] ?? '') === $userId || ($r['username'] ?? '') === $userId) && ($r['isTrash'] ?? false)) {
                    $foundTrash = true;
                    $count++;
                } else {
                    $remains[] = $r;
                }
            }
            if ($foundTrash) {
                $item['recipients'] = $remains;
                if (empty($remains) && ($item['eventType'] ?? '') !== 'system.welcome') {
                    unset($notifications[$nIndex]);
                }
            }
        }
    }
    unset($item);

    if ($count > 0) {
        admin_notifications_save(array_values($notifications));
    }
    return $count;
}

function admin_notifications_unread_count(string $currentUserId = ''): int
{
    $userId = trim($currentUserId) !== '' ? trim($currentUserId) : 'admin';
    $res = admin_notifications_list($userId, ['limit' => 1]);
    return (int) ($res['unreadCount'] ?? 0);
}

function admin_notifications_trash_count(string $currentUserId = ''): int
{
    $userId = trim($currentUserId) !== '' ? trim($currentUserId) : 'admin';
    $res = admin_notifications_list($userId, ['view' => 'trash', 'limit' => 1]);
    return (int) ($res['trashCount'] ?? 0);
}

// -------------------------------------------------------------
// ACTIVITY LOGS (AUDIT BEFORE / AFTER)
// -------------------------------------------------------------
function admin_activity_logs_load(): array
{
    $path = admin_activity_logs_file_path();
    if (!is_file($path)) {
        return [];
    }
    $raw = file_get_contents($path);
    $data = $raw === false ? null : json_decode($raw, true);
    return is_array($data) ? $data : [];
}

function admin_activity_logs_save(array $logs): void
{
    admin_write_json_file(admin_activity_logs_file_path(), array_values($logs));
}

function admin_activity_log_create(array $data): array
{
    $now = date('Y-m-d H:i:s');
    $log = [
        'id' => admin_generate_uuid(),
        'actorName' => trim((string) ($data['actorName'] ?? 'Admin')),
        'actorRole' => trim((string) ($data['actorRole'] ?? 'Quản trị viên')),
        'action' => trim((string) ($data['action'] ?? 'Cập nhật hệ thống')),
        'targetType' => trim((string) ($data['targetType'] ?? 'general')), // 'order'|'student'|'task'|'system'
        'targetId' => trim((string) ($data['targetId'] ?? '')),
        'targetName' => trim((string) ($data['targetName'] ?? '')),
        'details' => is_array($data['details'] ?? null) ? json_encode($data['details'], JSON_UNESCAPED_UNICODE) : trim((string) ($data['details'] ?? '')),
        'changes' => is_array($data['changes'] ?? null) ? $data['changes'] : [],
        'createdAt' => $now,
    ];

    $logs = admin_activity_logs_load();
    array_unshift($logs, $log);

    if (count($logs) > 600) {
        $logs = array_slice($logs, 0, 600);
    }

    admin_activity_logs_save($logs);
    return $log;
}

function admin_activity_logs_list(array $filters = []): array
{
    $logs = admin_activity_logs_load();
    $targetType = trim((string) ($filters['targetType'] ?? 'all'));
    $search = mb_strtolower(trim((string) ($filters['search'] ?? '')), 'UTF-8');
    $limit = max(1, min(100, (int) ($filters['limit'] ?? 20)));

    $filtered = array_filter($logs, static function (array $item) use ($targetType, $search): bool {
        if ($targetType !== 'all' && ($item['targetType'] ?? '') !== $targetType) {
            return false;
        }
        if ($search !== '') {
            $haystack = mb_strtolower(
                ($item['action'] ?? '') . ' ' .
                ($item['actorName'] ?? '') . ' ' .
                ($item['targetName'] ?? '') . ' ' .
                ($item['details'] ?? ''),
                'UTF-8'
            );
            if (!str_contains($haystack, $search)) {
                return false;
            }
        }
        return true;
    });

    return array_values(array_slice($filtered, 0, $limit));
}

// -------------------------------------------------------------
// TASKS & REMINDERS (NHẮC VIỆC & QUÁ HẠN)
// -------------------------------------------------------------
function admin_tasks_load(): array
{
    $path = admin_tasks_file_path();
    if (!is_file($path)) {
        return [];
    }
    $raw = file_get_contents($path);
    $data = $raw === false ? null : json_decode($raw, true);
    return is_array($data) ? $data : [];
}

function admin_tasks_save(array $tasks): void
{
    admin_write_json_file(admin_tasks_file_path(), array_values($tasks));
}

function admin_task_create(array $data): array
{
    $now = date('Y-m-d H:i:s');
    $dueAt = !empty($data['dueAt']) ? (string) $data['dueAt'] : date('Y-m-d H:i:s', time() + 86400 * 2);

    $staffId = (string) ($data['assignedTo'] ?? 'staff-01');
    $staff = admin_staff_find($staffId);
    $assignedToName = $staff ? $staff['name'] : (string) ($data['assignedToName'] ?? 'Nguyễn Thị Mai');

    $task = [
        'id' => admin_generate_uuid(),
        'title' => trim((string) ($data['title'] ?? 'Công việc cần xử lý')),
        'description' => trim((string) ($data['description'] ?? '')),
        'category' => (string) ($data['category'] ?? 'student_check'), // 'student_check'|'document_verify'|'order_review'|'supplement_followup'|'general'
        'priority' => in_array($data['priority'] ?? '', ['high', 'medium', 'low'], true) ? $data['priority'] : 'medium',
        'status' => in_array($data['status'] ?? '', ['cho_xu_ly', 'dang_xu_ly', 'cho_bo_sung', 'can_xac_nhan', 'hoan_thanh'], true) ? $data['status'] : 'cho_xu_ly',
        'targetType' => (string) ($data['targetType'] ?? 'general'),
        'targetId' => (string) ($data['targetId'] ?? ''),
        'targetName' => (string) ($data['targetName'] ?? ''),
        'targetUrl' => (string) ($data['targetUrl'] ?? ''),
        'assignedTo' => $staffId,
        'assignedToName' => $assignedToName,
        'assignedBy' => (string) ($data['assignedBy'] ?? 'Admin'),
        'dueAt' => $dueAt,
        'completedAt' => null,
        'notes' => (string) ($data['notes'] ?? ''),
        'createdAt' => $now,
        'updatedAt' => $now,
    ];

    $tasks = admin_tasks_load();
    array_unshift($tasks, $task);
    admin_tasks_save($tasks);

    // Also emit a task.assigned notification
    admin_notification_create([
        'eventType' => 'task.assigned',
        'category' => 'tasks',
        'title' => 'Công việc mới: ' . $task['title'],
        'message' => 'Phân công cho ' . $assignedToName . ' (Hạn: ' . date('d/m/Y H:i', strtotime($dueAt)) . ')',
        'actor' => ['id' => 'admin', 'name' => $task['assignedBy'], 'role' => 'Quản trị viên'],
        'target' => [
            'type' => $task['targetType'],
            'id' => $task['targetId'],
            'name' => $task['targetName'],
            'url' => $task['targetUrl'],
        ],
        'priority' => $task['priority'],
    ]);

    return $task;
}

function admin_task_update(string $id, array $updates): ?array
{
    $tasks = admin_tasks_load();
    $found = null;
    $now = date('Y-m-d H:i:s');

    foreach ($tasks as &$task) {
        if ($task['id'] === $id) {
            $prevStatus = $task['status'];

            if (isset($updates['status']) && in_array($updates['status'], ['cho_xu_ly', 'dang_xu_ly', 'cho_bo_sung', 'can_xac_nhan', 'hoan_thanh'], true)) {
                $task['status'] = $updates['status'];
                if ($task['status'] === 'hoan_thanh' && $prevStatus !== 'hoan_thanh') {
                    $task['completedAt'] = $now;
                } elseif ($task['status'] !== 'hoan_thanh') {
                    $task['completedAt'] = null;
                }
            }

            if (isset($updates['assignedTo'])) {
                $staff = admin_staff_find((string) $updates['assignedTo']);
                if ($staff) {
                    $task['assignedTo'] = $staff['id'];
                    $task['assignedToName'] = $staff['name'];
                }
            }

            if (!empty($updates['dueAt'])) {
                $task['dueAt'] = (string) $updates['dueAt'];
            }

            if (isset($updates['priority']) && in_array($updates['priority'], ['high', 'medium', 'low'], true)) {
                $task['priority'] = $updates['priority'];
            }

            if (isset($updates['notes'])) {
                $task['notes'] = trim((string) $updates['notes']);
            }

            $task['updatedAt'] = $now;
            $found = $task;
            break;
        }
    }
    unset($task);

    if ($found !== null) {
        admin_tasks_save($tasks);

        admin_activity_log_create([
            'actorName' => 'Admin',
            'actorRole' => 'Quản trị viên',
            'action' => 'Cập nhật công việc: ' . $found['title'],
            'targetType' => 'task',
            'targetId' => $found['id'],
            'targetName' => $found['title'],
            'details' => 'Trạng thái: ' . $found['status'] . ' | Phụ trách: ' . $found['assignedToName'],
        ]);
    }

    return $found;
}

function admin_tasks_list(array $filters = []): array
{
    $tasks = admin_tasks_load();
    $now = time();
    $status = trim((string) ($filters['status'] ?? 'all'));
    $assignedTo = trim((string) ($filters['assignedTo'] ?? 'all'));

    $result = [];
    foreach ($tasks as $task) {
        $isOverdue = false;
        if ($task['status'] !== 'hoan_thanh' && !empty($task['dueAt'])) {
            $dueTime = strtotime($task['dueAt']);
            if ($dueTime !== false && $dueTime < $now) {
                $isOverdue = true;
            }
        }
        $task['isOverdue'] = $isOverdue;

        if ($status === 'overdue' && !$isOverdue) {
            continue;
        }
        if ($status === 'pending' && $task['status'] === 'hoan_thanh') {
            continue;
        }
        if ($status !== 'all' && $status !== 'overdue' && $status !== 'pending' && $task['status'] !== $status) {
            continue;
        }
        if ($assignedTo !== 'all' && $task['assignedTo'] !== $assignedTo) {
            continue;
        }

        $result[] = $task;
    }

    // Sort: overdue first, then by priority, then by due date
    usort($result, static function (array $a, array $b): int {
        if ($a['isOverdue'] !== $b['isOverdue']) {
            return $a['isOverdue'] ? -1 : 1;
        }
        $pMap = ['high' => 3, 'medium' => 2, 'low' => 1];
        $pA = $pMap[$a['priority'] ?? 'medium'] ?? 2;
        $pB = $pMap[$b['priority'] ?? 'medium'] ?? 2;
        if ($pA !== $pB) {
            return $pB <=> $pA;
        }
        return strcmp($a['dueAt'], $b['dueAt']);
    });

    return $result;
}

// -------------------------------------------------------------
// OPERATIONS STATS
// -------------------------------------------------------------
function admin_operations_stats(string $currentUserId = ''): array
{
    require_once __DIR__ . '/_orders.php';
    require_once __DIR__ . '/_student_profiles.php';

    $orders = admin_job_orders_list(true);
    $activeOrdersCount = count(array_filter($orders, static fn ($o) => ($o['status'] ?? '') === 'published'));

    $profiles = admin_student_profiles_list();
    $pendingProfilesCount = count(array_filter($profiles, static fn ($p) => in_array($p['status'] ?? '', ['tiep_nhan', 'cho_duyet'], true)));
    $needsSupplementCount = count(array_filter($profiles, static fn ($p) => ($p['status'] ?? '') === 'can_bo_sung'));

    $tasks = admin_tasks_list();
    $now = time();
    $pendingTasksCount = 0;
    $overdueTasksCount = 0;

    foreach ($tasks as $task) {
        if ($task['status'] !== 'hoan_thanh') {
            $pendingTasksCount++;
            if (!empty($task['dueAt']) && strtotime($task['dueAt']) < $now) {
                $overdueTasksCount++;
            }
        }
    }

    $unreadNotificationsCount = admin_notifications_unread_count($currentUserId);
    $trashNotificationsCount = admin_notifications_trash_count($currentUserId);

    return [
        'unreadNotifications' => $unreadNotificationsCount,
        'trashNotifications' => $trashNotificationsCount,
        'pendingProfiles' => $pendingProfilesCount,
        'needsSupplementProfiles' => $needsSupplementCount,
        'activeOrders' => $activeOrdersCount,
        'totalOrders' => count($orders),
        'totalStudents' => count($profiles),
        'pendingTasks' => $pendingTasksCount,
        'overdueTasks' => $overdueTasksCount,
        'lastUpdatedAt' => date('Y-m-d H:i:s'),
    ];
}

// -------------------------------------------------------------
// AUTO-SYNC INITIAL EVENTS FROM REAL RECORDS
// -------------------------------------------------------------
function admin_notifications_auto_sync_initial_events(): void
{
    $notificationsPath = admin_notifications_file_path();
    if (is_file($notificationsPath) && filesize($notificationsPath) > 10) {
        return; // Already initialized
    }

    require_once __DIR__ . '/_orders.php';
    require_once __DIR__ . '/_student_profiles.php';

    $orders = admin_job_orders_list(true);
    $profiles = admin_student_profiles_list();

    $initialNotifications = [];
    $initialActivities = [];
    $initialTasks = [];

    // Create notifications from existing job orders
    foreach ($orders as $order) {
        $createdAt = $order['createdAt'] ?? date('Y-m-d H:i:s');
        $initialNotifications[] = [
            'id' => admin_generate_uuid(),
            'eventType' => 'order.created',
            'category' => 'orders',
            'title' => 'Đơn hàng mới: ' . ($order['title'] ?? 'Đơn hàng Nhật Bản'),
            'message' => 'Đơn tuyển ' . ($order['orderCode'] ?? '') . ' tại ' . ($order['location'] ?? 'Nhật Bản') . ' - Lương: ' . ($order['salary'] ?? 'Hấp dẫn'),
            'actor' => ['id' => 'admin', 'name' => 'Quản trị viên', 'role' => 'Admin'],
            'target' => [
                'type' => 'order',
                'id' => (string) ($order['id'] ?? ''),
                'code' => (string) ($order['orderCode'] ?? ''),
                'name' => (string) ($order['title'] ?? ''),
                'url' => '/quan-tri-viejap?section=orders&id=' . ($order['id'] ?? ''),
            ],
            'priority' => ($order['isFeatured'] ?? false) ? 'high' : 'medium',
            'isRead' => false,
            'readAt' => null,
            'createdAt' => $createdAt,
            'metadata' => [
                'salary' => $order['salary'] ?? '',
                'location' => $order['location'] ?? '',
                'category' => $order['category'] ?? '',
            ],
        ];

        $initialActivities[] = [
            'id' => admin_generate_uuid(),
            'actorName' => 'Quản trị viên',
            'actorRole' => 'Admin',
            'action' => 'Đăng tải đơn hàng: ' . ($order['title'] ?? ''),
            'targetType' => 'order',
            'targetId' => (string) ($order['id'] ?? ''),
            'targetName' => (string) ($order['title'] ?? ''),
            'details' => 'Trạng thái: ' . ($order['status'] ?? 'published') . ' | Mã: ' . ($order['orderCode'] ?? ''),
            'changes' => [
                ['field' => 'status', 'fieldLabel' => 'Trạng thái', 'before' => null, 'after' => $order['status'] ?? 'published'],
                ['field' => 'salary', 'fieldLabel' => 'Mức lương', 'before' => null, 'after' => $order['salary'] ?? ''],
            ],
            'createdAt' => $createdAt,
        ];
    }

    // Create notifications and tasks from existing student profiles
    foreach ($profiles as $profile) {
        $createdAt = $profile['createdAt'] ?? date('Y-m-d H:i:s');
        $fullName = $profile['fullName'] ?? 'Học viên';
        $studentCode = $profile['studentCode'] ?? 'HV-000';

        $initialNotifications[] = [
            'id' => admin_generate_uuid(),
            'eventType' => 'student.submitted',
            'category' => 'students',
            'title' => 'Học viên nộp sơ yếu lý lịch: ' . $fullName,
            'message' => 'Học viên ' . $fullName . ' (' . $studentCode . ') vừa nộp sơ yếu lý lịch kèm tài liệu đính kèm.',
            'actor' => ['id' => 'student', 'name' => $fullName, 'role' => 'Học viên'],
            'target' => [
                'type' => 'student',
                'id' => (string) ($profile['id'] ?? ''),
                'code' => $studentCode,
                'name' => $fullName,
                'url' => '/quan-tri-viejap?section=students&id=' . ($profile['id'] ?? ''),
            ],
            'priority' => 'high',
            'isRead' => false,
            'readAt' => null,
            'createdAt' => $createdAt,
            'metadata' => [
                'phone' => $profile['phone'] ?? '',
                'status' => $profile['status'] ?? 'tiep_nhan',
            ],
        ];

        // Create initial pending task for profile verification
        if (in_array($profile['status'] ?? '', ['tiep_nhan', 'cho_duyet', 'can_bo_sung'], true)) {
            $initialTasks[] = [
                'id' => admin_generate_uuid(),
                'title' => 'Kiểm tra hồ sơ học viên ' . $fullName,
                'description' => 'Đối chiếu thông tin sơ yếu lý lịch, file Excel và kiểm tra bản scan PDF/ảnh của học viên ' . $fullName . '.',
                'category' => 'student_check',
                'priority' => 'high',
                'status' => ($profile['status'] === 'can_bo_sung') ? 'cho_bo_sung' : 'cho_xu_ly',
                'targetType' => 'student',
                'targetId' => (string) ($profile['id'] ?? ''),
                'targetName' => $fullName,
                'targetUrl' => '/quan-tri-viejap?section=students&id=' . ($profile['id'] ?? ''),
                'assignedTo' => 'staff-01',
                'assignedToName' => 'Nguyễn Thị Mai',
                'assignedBy' => 'Admin',
                'dueAt' => date('Y-m-d H:i:s', strtotime($createdAt) + 86400 * 2),
                'completedAt' => null,
                'notes' => 'Ưu tiên kiểm tra số CMT/CCCD và thông tin gia đình.',
                'createdAt' => $createdAt,
                'updatedAt' => $createdAt,
            ];
        }
    }

    // Default welcome notification if empty
    if (empty($initialNotifications)) {
        $initialNotifications[] = [
            'id' => admin_generate_uuid(),
            'eventType' => 'system.welcome',
            'category' => 'system',
            'title' => 'Chào mừng đến Trung tâm điều hành Admin VieJap',
            'message' => 'Hệ thống điều hành và thông báo tự động đã sẵn sàng theo dõi toàn bộ hoạt động học viên và đơn hàng.',
            'actor' => ['id' => 'system', 'name' => 'Hệ thống VieJap', 'role' => 'System'],
            'target' => ['type' => 'system', 'id' => '', 'code' => 'VIEJAP-SYS', 'name' => 'Trung tâm điều hành', 'url' => '/quan-tri-viejap'],
            'priority' => 'medium',
            'isRead' => false,
            'readAt' => null,
            'createdAt' => date('Y-m-d H:i:s'),
            'metadata' => [],
        ];
    }

    admin_notifications_save($initialNotifications);
    if (!empty($initialActivities)) {
        admin_activity_logs_save($initialActivities);
    }
    if (!empty($initialTasks)) {
        admin_tasks_save($initialTasks);
    }
}

