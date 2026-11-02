<?php
declare(strict_types=1);

require_once __DIR__ . '/_bootstrap.php';

try {
    admin_require_method('POST');
    admin_assert_same_origin();
    $session = admin_require_session();
    admin_require_csrf($session);
    $payload = admin_read_json();
    $currentPassword = (string) ($payload['currentPassword'] ?? '');
    $newPassword = (string) ($payload['newPassword'] ?? '');

    if ($currentPassword === '' || $newPassword === '') {
        admin_respond(422, ['message' => 'Vui lòng nhập đầy đủ mật khẩu hiện tại và mật khẩu mới.']);
    }

    if (
        strlen($newPassword) < 12
        || !preg_match('/[a-z]/', $newPassword)
        || !preg_match('/[A-Z]/', $newPassword)
        || !preg_match('/\d/', $newPassword)
    ) {
        admin_respond(422, [
            'message' => 'Mật khẩu mới cần ít nhất 12 ký tự, gồm chữ hoa, chữ thường và số.',
        ]);
    }

    $account = admin_load_account();
    if (!password_verify($currentPassword, $account['passwordHash'])) {
        admin_respond(401, ['message' => 'Mật khẩu hiện tại không đúng.']);
    }

    if (password_verify($newPassword, $account['passwordHash'])) {
        admin_respond(422, ['message' => 'Mật khẩu mới phải khác mật khẩu hiện tại.']);
    }

    $account['passwordHash'] = password_hash($newPassword, PASSWORD_DEFAULT);
    $account['passwordChangedAt'] = date('c');
    admin_save_account($account);
    admin_create_session($account['username']);

    require_once __DIR__ . '/_notifications.php';
    admin_notification_create([
        'eventType' => 'security.password_changed',
        'category' => 'system',
        'title' => 'Bảo mật: Mật khẩu quản trị vừa được cập nhật',
        'message' => 'Tài khoản quản trị viên ' . $account['username'] . ' vừa đổi mật khẩu thành công.',
        'actor' => ['id' => 'admin', 'name' => $account['username'], 'role' => 'Admin'],
        'target' => ['type' => 'system', 'id' => '', 'code' => 'SECURITY', 'name' => 'Bảo mật', 'url' => '/quan-tri-viejap?section=security'],
        'priority' => 'high',
    ]);
    admin_activity_log_create([
        'actorName' => $account['username'],
        'actorRole' => 'Quản trị viên',
        'action' => 'Đổi mật khẩu tài khoản quản trị',
        'targetType' => 'system',
        'targetId' => $account['username'],
        'targetName' => 'Tài khoản Admin',
        'details' => 'Đổi mật khẩu và làm mới phiên đăng nhập an toàn.',
    ]);

    $refreshed = admin_current_session();
    admin_respond(200, [
        'message' => 'Đã đổi mật khẩu.',
        'authenticated' => true,
        'username' => $account['username'],
        'csrfToken' => $refreshed['csrfToken'],
    ]);
} catch (Throwable $error) {
    admin_handle_exception($error);
}
