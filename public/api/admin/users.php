<?php
declare(strict_types=1);

require_once __DIR__ . '/_rbac.php';

try {
    $session = admin_require_session();
    $method = strtoupper((string) ($_SERVER['REQUEST_METHOD'] ?? 'GET'));
    $action = trim((string) ($_GET['action'] ?? 'list'));

    // -------------------------------------------------------------
    // GET ENDPOINTS
    // -------------------------------------------------------------
    if ($method === 'GET') {
        // 1. Current user information & permissions
        if ($action === 'me') {
            $user = admin_user_find_by_username($session['username']);
            if ($user === null) {
                if ($session['username'] === 'admin') {
                    $users = admin_users_list();
                    $user = admin_ensure_super_admin_record($users);
                } else {
                    admin_destroy_session();
                    admin_respond(401, ['message' => 'Phiên làm việc không hợp lệ.']);
                }
            }

            $calc = admin_user_effective_permissions($user);
            $safeUser = $user;
            unset($safeUser['passwordHash']);

            admin_respond(200, [
                'user' => $safeUser,
                'isSuperAdmin' => $calc['isSuperAdmin'],
                'dataScope' => $calc['dataScope'],
                'rolePermissions' => $calc['rolePermissions'],
                'allowPermissions' => $calc['allowPermissions'],
                'denyPermissions' => $calc['denyPermissions'],
                'effectivePermissions' => $calc['effectivePermissions'],
            ]);
        }

        // 2. Permission Registry
        if ($action === 'registry') {
            admin_respond(200, [
                'registry' => admin_permission_registry(),
                'allKeys' => admin_all_permission_keys(),
            ]);
        }

        // 3. Roles list with user count
        if ($action === 'roles') {
            admin_require_permission($session, 'users.view');
            $roles = admin_roles_list();
            $users = admin_users_list();

            // Count users per role
            $counts = [];
            foreach ($users as $u) {
                $rId = $u['roleId'] ?? 'viewer';
                $counts[$rId] = ($counts[$rId] ?? 0) + 1;
            }

            foreach ($roles as &$role) {
                $role['userCount'] = $counts[$role['id']] ?? 0;
            }
            unset($role);

            admin_respond(200, ['roles' => $roles]);
        }

        // 4. Overrides for a user
        if ($action === 'overrides') {
            admin_require_permission($session, 'users.view');
            $userId = trim((string) ($_GET['user_id'] ?? ''));
            if ($userId === '') {
                admin_respond(422, ['message' => 'Thiếu user_id.']);
            }

            $user = admin_user_find_by_id($userId);
            if ($user === null) {
                admin_respond(404, ['message' => 'Không tìm thấy người dùng.']);
            }

            $override = admin_user_override_get($userId);
            $role = admin_role_find((string) ($user['roleId'] ?? ''));
            $calc = admin_user_effective_permissions($user, $role, $override);

            $safeUser = $user;
            unset($safeUser['passwordHash']);

            admin_respond(200, [
                'user' => $safeUser,
                'role' => $role,
                'override' => $override,
                'calculation' => $calc,
            ]);
        }

        // 5. User detail
        if ($action === 'detail') {
            admin_require_permission($session, 'users.view');
            $userId = trim((string) ($_GET['id'] ?? ''));
            if ($userId === '') {
                admin_respond(422, ['message' => 'Thiếu id người dùng.']);
            }

            $user = admin_user_find_by_id($userId);
            if ($user === null) {
                admin_respond(404, ['message' => 'Không tìm thấy người dùng.']);
            }

            $role = admin_role_find((string) ($user['roleId'] ?? ''));
            $override = admin_user_override_get($userId);
            $calc = admin_user_effective_permissions($user, $role, $override);

            $safeUser = $user;
            unset($safeUser['passwordHash']);

            admin_respond(200, [
                'user' => $safeUser,
                'role' => $role,
                'override' => $override,
                'calculation' => $calc,
            ]);
        }

        // 6. User audit logs
        if ($action === 'audit_logs') {
            admin_require_permission($session, 'users.view');
            $limit = max(1, min(100, (int) ($_GET['limit'] ?? 50)));
            $search = (string) ($_GET['search'] ?? '');
            $logs = admin_activity_logs_list([
                'targetType' => 'all',
                'search' => $search,
                'limit' => $limit,
            ]);

            // Filter for user, role, and permission related activities
            $relevantLogs = array_filter($logs, static function (array $log): bool {
                $t = $log['targetType'] ?? '';
                return in_array($t, ['user', 'role', 'user_override', 'security'], true)
                    || str_contains(mb_strtolower($log['action'] ?? '', 'UTF-8'), 'tài khoản')
                    || str_contains(mb_strtolower($log['action'] ?? '', 'UTF-8'), 'vai trò')
                    || str_contains(mb_strtolower($log['action'] ?? '', 'UTF-8'), 'quyền');
            });

            admin_respond(200, ['logs' => array_values($relevantLogs)]);
        }

        // 7. Users list (with filters and stats)
        admin_require_permission($session, 'users.view');
        $allUsers = admin_users_list();
        $searchTerm = mb_strtolower(trim((string) ($_GET['search'] ?? '')), 'UTF-8');
        $roleFilter = trim((string) ($_GET['role'] ?? 'all'));
        $statusFilter = trim((string) ($_GET['status'] ?? 'all'));

        $filtered = array_filter($allUsers, static function (array $u) use ($searchTerm, $roleFilter, $statusFilter): bool {
            if ($roleFilter !== 'all' && ($u['roleId'] ?? '') !== $roleFilter) {
                return false;
            }
            if ($statusFilter !== 'all' && ($u['status'] ?? 'active') !== $statusFilter) {
                return false;
            }
            if ($searchTerm !== '') {
                $haystack = mb_strtolower(
                    ($u['fullName'] ?? '') . ' ' .
                    ($u['username'] ?? '') . ' ' .
                    ($u['email'] ?? '') . ' ' .
                    ($u['phone'] ?? '') . ' ' .
                    ($u['department'] ?? ''),
                    'UTF-8'
                );
                if (!str_contains($haystack, $searchTerm)) {
                    return false;
                }
            }
            return true;
        });

        // Strip passwordHash from results
        $safeUsers = array_map(static function (array $u): array {
            unset($u['passwordHash']);
            return $u;
        }, array_values($filtered));

        // Stats
        $activeCount = count(array_filter($allUsers, static fn ($u) => ($u['status'] ?? 'active') === 'active'));
        $lockedCount = count(array_filter($allUsers, static fn ($u) => ($u['status'] ?? 'active') === 'locked'));

        admin_respond(200, [
            'users' => $safeUsers,
            'total' => count($safeUsers),
            'stats' => [
                'total' => count($allUsers),
                'active' => $activeCount,
                'locked' => $lockedCount,
            ],
        ]);
    }

    // -------------------------------------------------------------
    // POST / PUT / DELETE ENDPOINTS
    // -------------------------------------------------------------
    admin_assert_same_origin();
    admin_require_csrf($session);
    $payload = admin_read_json();
    $actorUsername = $session['username'];

    // 0. Upload User Avatar (File or Base64)
    if ($action === 'upload_avatar') {
        admin_require_permission($session, 'users.update');

        $directory = dirname(__DIR__, 2) . DIRECTORY_SEPARATOR . 'uploads' . DIRECTORY_SEPARATOR . 'avatars';
        if (!is_dir($directory) && !mkdir($directory, 0755, true) && !is_dir($directory)) {
            admin_respond(500, ['message' => 'Không thể tạo thư mục lưu ảnh đại diện. Vui lòng kiểm tra quyền ghi thư mục uploads.']);
        }

        $htaccess = $directory . DIRECTORY_SEPARATOR . '.htaccess';
        if (!is_file($htaccess)) {
            @file_put_contents($htaccess, "Options -Indexes\n\n<FilesMatch \"\\.(?:php|phtml|phar|php[0-9]?)$\">\n  Require all denied\n</FilesMatch>\n");
            @chmod($htaccess, 0644);
        }

        $avatarUrl = null;

        // Option A: Multipart file upload ($_FILES['avatar'])
        if (isset($_FILES['avatar']) && is_array($_FILES['avatar'])) {
            $upload = $_FILES['avatar'];
            $tempPath = (string) ($upload['tmp_name'] ?? '');
            $size = (int) ($upload['size'] ?? 0);
            $err = (int) ($upload['error'] ?? UPLOAD_ERR_NO_FILE);

            if ($err !== UPLOAD_ERR_OK || $size < 1 || !is_uploaded_file($tempPath)) {
                admin_respond(422, ['message' => 'File ảnh đại diện không hợp lệ hoặc vượt quá dung lượng.']);
            }
            if ($size > 5 * 1024 * 1024) {
                admin_respond(422, ['message' => 'Ảnh đại diện tối đa 5 MB.']);
            }

            $mime = (new finfo(FILEINFO_MIME_TYPE))->file($tempPath);
            $extMap = [
                'image/jpeg' => 'jpg',
                'image/png' => 'png',
                'image/webp' => 'webp',
                'image/gif' => 'gif',
            ];
            if (!isset($extMap[$mime])) {
                admin_respond(422, ['message' => 'Chỉ hỗ trợ file ảnh định dạng JPG, PNG, WebP hoặc GIF.']);
            }

            $filename = 'avatar-' . gmdate('Ymd-His') . '-' . bin2hex(random_bytes(6)) . '.' . $extMap[$mime];
            $dest = $directory . DIRECTORY_SEPARATOR . $filename;
            if (!move_uploaded_file($tempPath, $dest)) {
                admin_respond(500, ['message' => 'Không thể lưu file ảnh đại diện.']);
            }
            @chmod($dest, 0644);
            $avatarUrl = '/uploads/avatars/' . $filename;
        }
        // Option B: Base64 data upload ($payload['avatarBase64'])
        elseif (!empty($payload['avatarBase64'])) {
            $base64Data = (string) $payload['avatarBase64'];
            if (preg_match('/^data:image\/(jpeg|png|webp|gif);base64,(.+)$/', $base64Data, $m)) {
                $ext = $m[1] === 'jpeg' ? 'jpg' : $m[1];
                $binary = base64_decode($m[2], true);
                if ($binary === false || strlen($binary) > 5 * 1024 * 1024) {
                    admin_respond(422, ['message' => 'Dữ liệu ảnh không hợp lệ hoặc lớn hơn 5 MB.']);
                }
                $filename = 'avatar-' . gmdate('Ymd-His') . '-' . bin2hex(random_bytes(6)) . '.' . $ext;
                $dest = $directory . DIRECTORY_SEPARATOR . $filename;
                if (@file_put_contents($dest, $binary) === false) {
                    admin_respond(500, ['message' => 'Không thể lưu file ảnh đại diện.']);
                }
                @chmod($dest, 0644);
                $avatarUrl = '/uploads/avatars/' . $filename;
            } else {
                admin_respond(422, ['message' => 'Chuỗi base64 ảnh đại diện không hợp lệ.']);
            }
        } else {
            admin_respond(422, ['message' => 'Vui lòng chọn file ảnh để tải lên.']);
        }

        admin_respond(200, [
            'avatarUrl' => $avatarUrl,
            'message' => 'Tải ảnh đại diện thành công.',
        ]);
    }

    // 1. Create User
    if ($action === 'create') {
        admin_require_permission($session, 'users.create');
        $user = admin_user_create($payload, $actorUsername);
        admin_respond(201, ['user' => $user, 'message' => 'Tạo tài khoản cán bộ thành công.']);
    }

    // 2. Update User
    if ($action === 'update') {
        admin_require_permission($session, 'users.update');
        $id = trim((string) ($payload['id'] ?? ''));
        if ($id === '') {
            admin_respond(422, ['message' => 'Thiếu id người dùng.']);
        }
        $user = admin_user_update($id, $payload, $actorUsername);
        admin_respond(200, ['user' => $user, 'message' => 'Cập nhật tài khoản thành công.']);
    }

    // 3. Toggle Status (Lock / Unlock)
    if ($action === 'toggle_status') {
        admin_require_permission($session, 'users.lock');
        $id = trim((string) ($payload['id'] ?? ''));
        if ($id === '') {
            admin_respond(422, ['message' => 'Thiếu id người dùng.']);
        }
        $user = admin_user_toggle_status($id, $actorUsername);
        $msg = ($user['status'] === 'active') ? 'Đã mở khóa tài khoản.' : 'Đã khóa tài khoản thành công.';
        admin_respond(200, ['user' => $user, 'message' => $msg]);
    }

    // 4. Reset Password
    if ($action === 'reset_password') {
        admin_require_permission($session, 'users.update');
        $id = trim((string) ($payload['id'] ?? ''));
        $newPassword = (string) ($payload['password'] ?? '');
        if ($id === '' || $newPassword === '') {
            admin_respond(422, ['message' => 'Vui lòng cung cấp id và mật khẩu mới.']);
        }
        admin_user_reset_password($id, $newPassword, $actorUsername);
        admin_respond(200, ['message' => 'Đặt lại mật khẩu thành công.']);
    }

    // 5. Delete User
    if ($action === 'delete') {
        admin_require_permission($session, 'users.delete');
        $id = trim((string) ($payload['id'] ?? ''));
        if ($id === '') {
            admin_respond(422, ['message' => 'Thiếu id người dùng cần xóa.']);
        }
        if (!admin_user_delete($id, $actorUsername)) {
            admin_respond(404, ['message' => 'Không tìm thấy người dùng hoặc không thể xóa.']);
        }
        admin_respond(200, ['deleted' => true, 'message' => 'Đã xóa tài khoản thành công.']);
    }

    // 6. Save Role (Create or Update)
    if ($action === 'role_save') {
        admin_require_permission($session, 'roles.manage');
        $role = admin_role_save($payload, $actorUsername);
        admin_respond(200, ['role' => $role, 'message' => 'Lưu thông tin vai trò thành công.']);
    }

    // 7. Copy Role
    if ($action === 'role_copy') {
        admin_require_permission($session, 'roles.manage');
        $sourceId = trim((string) ($payload['sourceId'] ?? ''));
        $newName = trim((string) ($payload['name'] ?? ''));
        if ($sourceId === '' || $newName === '') {
            admin_respond(422, ['message' => 'Vui lòng chọn vai trò nguồn và nhập tên vai trò mới.']);
        }
        $newRole = admin_role_copy($sourceId, $newName, $actorUsername);
        admin_respond(201, ['role' => $newRole, 'message' => 'Sao chép vai trò thành công.']);
    }

    // 8. Delete Role
    if ($action === 'role_delete') {
        admin_require_permission($session, 'roles.manage');
        $id = trim((string) ($payload['id'] ?? ''));
        if ($id === '') {
            admin_respond(422, ['message' => 'Thiếu mã vai trò.']);
        }
        admin_role_delete($id, $actorUsername);
        admin_respond(200, ['deleted' => true, 'message' => 'Đã xóa vai trò thành công.']);
    }

    // 9. Save User Overrides
    if ($action === 'overrides_save') {
        admin_require_permission($session, 'permissions.override');
        $userId = trim((string) ($payload['userId'] ?? ''));
        if ($userId === '') {
            admin_respond(422, ['message' => 'Thiếu mã tài khoản.']);
        }
        $override = admin_user_override_save($userId, $payload, $actorUsername);
        admin_respond(200, ['override' => $override, 'message' => 'Lưu phân quyền riêng thành công.']);
    }

    // 10. Reset User Overrides to role defaults
    if ($action === 'overrides_reset') {
        admin_require_permission($session, 'permissions.override');
        $userId = trim((string) ($payload['userId'] ?? ''));
        if ($userId === '') {
            admin_respond(422, ['message' => 'Thiếu mã tài khoản.']);
        }
        admin_user_override_reset($userId, $actorUsername);
        admin_respond(200, ['reset' => true, 'message' => 'Đã khôi phục quyền mặc định theo vai trò.']);
    }

    admin_respond(400, ['message' => 'Hành động không hợp lệ.']);

} catch (InvalidArgumentException $err) {
    admin_respond(422, ['message' => $err->getMessage()]);
} catch (RuntimeException $err) {
    admin_respond(400, ['message' => $err->getMessage()]);
} catch (Throwable $error) {
    admin_handle_exception($error);
}

