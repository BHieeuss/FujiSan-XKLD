<?php
declare(strict_types=1);

require_once __DIR__ . '/_bootstrap.php';
require_once __DIR__ . '/_rbac.php';

try {
    admin_require_method('GET');
    $session = admin_current_session();

    if ($session === null) {
        admin_respond(200, ['authenticated' => false]);
    }

    $username = (string) ($session['username'] ?? '');
    $user = admin_user_find_by_username($username);

    if ($user === null) {
        if ($username === 'admin') {
            $allUsers = admin_users_list();
            $user = admin_ensure_super_admin_record($allUsers);
        } else {
            admin_destroy_session();
            admin_respond(200, ['authenticated' => false, 'message' => 'Tài khoản không tồn tại.']);
        }
    }

    if (($user['status'] ?? 'active') === 'locked') {
        admin_destroy_session();
        admin_respond(200, ['authenticated' => false, 'message' => 'Tài khoản đã bị khóa.']);
    }

    $calc = admin_user_effective_permissions($user);

    admin_respond(200, [
        'authenticated' => true,
        'username' => $user['username'],
        'fullName' => $user['fullName'],
        'email' => $user['email'],
        'roleId' => $user['roleId'] ?? 'viewer',
        'roleName' => $user['roleName'] ?? 'Nhân viên',
        'isSuperAdmin' => $calc['isSuperAdmin'],
        'dataScope' => $calc['dataScope'],
        'effectivePermissions' => $calc['effectivePermissions'],
        'csrfToken' => $session['csrfToken'],
    ]);
} catch (Throwable $error) {
    admin_handle_exception($error);
}
