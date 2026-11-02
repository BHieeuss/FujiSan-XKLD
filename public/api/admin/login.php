<?php
declare(strict_types=1);

require_once __DIR__ . '/_bootstrap.php';
require_once __DIR__ . '/_rbac.php';

try {
    admin_require_method('POST');
    admin_assert_same_origin();
    $payload = admin_read_json();
    $username = substr(trim((string) ($payload['username'] ?? '')), 0, 80);
    $password = (string) ($payload['password'] ?? '');

    if ($username === '' || $password === '') {
        admin_respond(422, ['message' => 'Vui lòng nhập tài khoản và mật khẩu.']);
    }

    $retryAfter = admin_rate_retry_after($username);
    if ($retryAfter > 0) {
        header('Retry-After: ' . $retryAfter);
        admin_respond(429, [
            'message' => 'Đăng nhập tạm khóa do nhập sai nhiều lần.',
            'retryAfter' => $retryAfter,
        ]);
    }

    $user = admin_user_find_by_username($username);
    $account = admin_load_account();
    $isSuperAdminUsername = hash_equals(strtolower($account['username']), strtolower($username));

    // If super admin account, sync if needed
    if ($isSuperAdminUsername && $user === null) {
        $allUsers = admin_users_list();
        $user = admin_ensure_super_admin_record($allUsers);
        admin_users_save($allUsers);
    }

    if ($user === null) {
        $retryAfter = admin_record_failed_login($username);
        if ($retryAfter > 0) {
            header('Retry-After: ' . $retryAfter);
        }
        usleep(random_int(180000, 320000));
        admin_respond($retryAfter > 0 ? 429 : 401, [
            'message' => $retryAfter > 0
                ? 'Đăng nhập tạm khóa do nhập sai nhiều lần.'
                : 'Tài khoản hoặc mật khẩu không đúng.',
            'retryAfter' => $retryAfter,
        ]);
    }

    // Check account status
    if (($user['status'] ?? 'active') === 'locked') {
        admin_respond(403, [
            'message' => 'Tài khoản của bạn đã bị khóa. Vui lòng liên hệ Quản trị viên để được mở khóa.',
        ]);
    }

    $passwordHash = $isSuperAdminUsername ? $account['passwordHash'] : ($user['passwordHash'] ?? '');
    $passwordMatches = password_verify($password, $passwordHash);

    if (!$passwordMatches) {
        $retryAfter = admin_record_failed_login($username);
        if ($retryAfter > 0) {
            header('Retry-After: ' . $retryAfter);
        }
        usleep(random_int(180000, 320000));
        admin_respond($retryAfter > 0 ? 429 : 401, [
            'message' => $retryAfter > 0
                ? 'Đăng nhập tạm khóa do nhập sai nhiều lần.'
                : 'Tài khoản hoặc mật khẩu không đúng.',
            'retryAfter' => $retryAfter,
        ]);
    }

    if ($isSuperAdminUsername && password_needs_rehash($account['passwordHash'], PASSWORD_DEFAULT)) {
        $account['passwordHash'] = password_hash($password, PASSWORD_DEFAULT);
        admin_save_account($account);
    }

    // Update lastLoginAt
    $allUsers = admin_users_list();
    foreach ($allUsers as &$u) {
        if ($u['id'] === $user['id']) {
            $u['lastLoginAt'] = date('Y-m-d H:i:s');
            break;
        }
    }
    unset($u);
    admin_users_save($allUsers);

    admin_clear_rate_state($username);
    $csrfToken = admin_create_session($user['username']);

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
        'csrfToken' => $csrfToken,
    ]);
} catch (Throwable $error) {
    admin_handle_exception($error);
}
