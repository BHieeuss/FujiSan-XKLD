<?php
declare(strict_types=1);

require_once __DIR__ . '/_bootstrap.php';

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

    $account = admin_load_account();
    $usernameMatches = hash_equals(strtolower($account['username']), strtolower($username));
    $passwordMatches = password_verify($password, $account['passwordHash']);

    if (!$usernameMatches || !$passwordMatches) {
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

    if (password_needs_rehash($account['passwordHash'], PASSWORD_DEFAULT)) {
        $account['passwordHash'] = password_hash($password, PASSWORD_DEFAULT);
        admin_save_account($account);
    }

    admin_clear_rate_state($username);
    $csrfToken = admin_create_session($account['username']);
    admin_respond(200, [
        'authenticated' => true,
        'username' => $account['username'],
        'csrfToken' => $csrfToken,
    ]);
} catch (Throwable $error) {
    admin_handle_exception($error);
}
