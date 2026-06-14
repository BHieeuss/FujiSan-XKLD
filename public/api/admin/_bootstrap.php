<?php
declare(strict_types=1);

const VIEJAP_ADMIN_INITIAL_USERNAME = 'admin';
const VIEJAP_ADMIN_INITIAL_PASSWORD_HASH = '$2y$12$ckOuTykXYI4Tq7w0.kSaceEOV7CJz1g1hgfzLIL6o44D511.ELBeu';
const VIEJAP_ADMIN_IDLE_TIMEOUT = 1800;
const VIEJAP_ADMIN_ABSOLUTE_TIMEOUT = 28800;
const VIEJAP_ADMIN_REGENERATE_INTERVAL = 900;
const VIEJAP_ADMIN_RATE_WINDOW = 900;
const VIEJAP_ADMIN_RATE_LIMIT = 5;
const VIEJAP_ADMIN_LOCK_TIME = 900;

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('Pragma: no-cache');
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');
header('Referrer-Policy: no-referrer');
header("Content-Security-Policy: default-src 'none'; frame-ancestors 'none'");

ini_set('session.use_strict_mode', '1');
ini_set('session.use_only_cookies', '1');
ini_set('session.cookie_httponly', '1');
ini_set('session.cookie_samesite', 'Strict');
session_name('VIEJAP_ADMIN');
session_set_cookie_params([
    'lifetime' => 0,
    'path' => '/',
    'secure' => admin_request_is_https(),
    'httponly' => true,
    'samesite' => 'Strict',
]);
session_start();

require_once __DIR__ . '/_database.php';

function admin_request_is_https(): bool
{
    if (isset($_SERVER['HTTPS']) && strtolower((string) $_SERVER['HTTPS']) !== 'off') {
        return true;
    }

    return isset($_SERVER['HTTP_X_FORWARDED_PROTO'])
        && strtolower((string) $_SERVER['HTTP_X_FORWARDED_PROTO']) === 'https';
}

function admin_respond(int $status, array $payload): never
{
    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function admin_require_method(string $method): void
{
    if (strtoupper((string) ($_SERVER['REQUEST_METHOD'] ?? 'GET')) !== strtoupper($method)) {
        header('Allow: ' . strtoupper($method));
        admin_respond(405, ['message' => 'Phương thức không được hỗ trợ.']);
    }
}

function admin_read_json(): array
{
    $raw = file_get_contents('php://input');
    if ($raw === false || trim($raw) === '') {
        return [];
    }

    try {
        $payload = json_decode($raw, true, 16, JSON_THROW_ON_ERROR);
    } catch (JsonException) {
        admin_respond(400, ['message' => 'Dữ liệu gửi lên không hợp lệ.']);
    }

    if (!is_array($payload)) {
        admin_respond(400, ['message' => 'Dữ liệu gửi lên không hợp lệ.']);
    }

    return $payload;
}

function admin_assert_same_origin(): void
{
    $origin = trim((string) ($_SERVER['HTTP_ORIGIN'] ?? ''));
    if ($origin === '') {
        return;
    }

    $originHost = strtolower((string) parse_url($origin, PHP_URL_HOST));
    $requestHost = strtolower((string) ($_SERVER['HTTP_HOST'] ?? ''));
    $requestHost = preg_replace('/:\d+$/', '', $requestHost) ?? $requestHost;

    if ($originHost === '' || !hash_equals($requestHost, $originHost)) {
        admin_respond(403, ['message' => 'Nguồn yêu cầu không hợp lệ.']);
    }
}

function admin_storage_directory(): string
{
    $configured = trim((string) getenv('VIEJAP_ADMIN_STORAGE'));
    if ($configured !== '') {
        $directory = $configured;
    } else {
        $home = admin_home_directory();
        $directory = $home !== null
            ? $home . DIRECTORY_SEPARATOR . 'private' . DIRECTORY_SEPARATOR . 'viejap' . DIRECTORY_SEPARATOR . 'admin'
            : sys_get_temp_dir() . DIRECTORY_SEPARATOR . 'viejap-admin';
    }

    if (!is_dir($directory) && !mkdir($directory, 0700, true) && !is_dir($directory)) {
        throw new RuntimeException('Không thể khởi tạo kho dữ liệu quản trị.');
    }

    @chmod($directory, 0700);
    return $directory;
}

function admin_write_json_file(string $path, array $payload): void
{
    $encoded = json_encode(
        $payload,
        JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT | JSON_THROW_ON_ERROR
    );
    $temporary = $path . '.' . bin2hex(random_bytes(6)) . '.tmp';

    if (file_put_contents($temporary, $encoded, LOCK_EX) === false) {
        throw new RuntimeException('Không thể lưu dữ liệu quản trị.');
    }

    @chmod($temporary, 0600);
    if (!rename($temporary, $path)) {
        @unlink($temporary);
        throw new RuntimeException('Không thể cập nhật dữ liệu quản trị.');
    }
    @chmod($path, 0600);
}

function admin_account_path(): string
{
    return admin_storage_directory() . DIRECTORY_SEPARATOR . 'account.json';
}

function admin_load_account(): array
{
    $databaseAccount = admin_db_load_account();
    if ($databaseAccount !== null) {
        return $databaseAccount;
    }

    $path = admin_account_path();
    if (!is_file($path)) {
        admin_write_json_file($path, [
            'username' => VIEJAP_ADMIN_INITIAL_USERNAME,
            'passwordHash' => VIEJAP_ADMIN_INITIAL_PASSWORD_HASH,
            'passwordChangedAt' => null,
        ]);
    }

    $raw = file_get_contents($path);
    $account = $raw === false ? null : json_decode($raw, true);
    if (
        !is_array($account)
        || !isset($account['username'], $account['passwordHash'])
        || !is_string($account['username'])
        || !is_string($account['passwordHash'])
    ) {
        throw new RuntimeException('Dữ liệu tài khoản quản trị bị lỗi.');
    }

    return $account;
}

function admin_save_account(array $account): void
{
    if (admin_db_save_account($account)) {
        return;
    }

    admin_write_json_file(admin_account_path(), $account);
}

function admin_client_ip(): string
{
    return substr((string) ($_SERVER['REMOTE_ADDR'] ?? 'unknown'), 0, 64);
}

function admin_rate_path(string $username): string
{
    return admin_storage_directory() . DIRECTORY_SEPARATOR . 'rate-' . admin_rate_key($username) . '.json';
}

function admin_rate_key(string $username): string
{
    return hash('sha256', admin_client_ip() . '|' . strtolower(trim($username)));
}

function admin_read_rate_state(string $username): array
{
    $databaseState = admin_db_read_rate_state(admin_rate_key($username));
    if ($databaseState !== null) {
        return $databaseState;
    }

    $path = admin_rate_path($username);
    if (!is_file($path)) {
        return ['attempts' => [], 'lockedUntil' => 0];
    }

    $raw = file_get_contents($path);
    $state = $raw === false ? null : json_decode($raw, true);
    if (!is_array($state)) {
        return ['attempts' => [], 'lockedUntil' => 0];
    }

    return [
        'attempts' => is_array($state['attempts'] ?? null) ? $state['attempts'] : [],
        'lockedUntil' => (int) ($state['lockedUntil'] ?? 0),
    ];
}

function admin_rate_retry_after(string $username): int
{
    $state = admin_read_rate_state($username);
    return max(0, (int) $state['lockedUntil'] - time());
}

function admin_record_failed_login(string $username): int
{
    $now = time();
    $state = admin_read_rate_state($username);
    $attempts = array_values(array_filter(
        $state['attempts'],
        static fn ($attempt): bool => is_int($attempt) && $attempt >= $now - VIEJAP_ADMIN_RATE_WINDOW
    ));
    $attempts[] = $now;

    $lockedUntil = (int) $state['lockedUntil'];
    if (count($attempts) >= VIEJAP_ADMIN_RATE_LIMIT) {
        $lockedUntil = $now + VIEJAP_ADMIN_LOCK_TIME;
    }

    $newState = [
        'attempts' => $attempts,
        'lockedUntil' => $lockedUntil,
    ];
    if (!admin_db_write_rate_state(admin_rate_key($username), $newState)) {
        admin_write_json_file(admin_rate_path($username), $newState);
    }

    return max(0, $lockedUntil - $now);
}

function admin_clear_rate_state(string $username): void
{
    if (admin_db_clear_rate_state(admin_rate_key($username))) {
        return;
    }

    $path = admin_rate_path($username);
    if (is_file($path)) {
        @unlink($path);
    }
}

function admin_user_agent_hash(): string
{
    return hash('sha256', substr((string) ($_SERVER['HTTP_USER_AGENT'] ?? ''), 0, 512));
}

function admin_create_session(string $username): string
{
    session_regenerate_id(true);
    $now = time();
    $csrf = bin2hex(random_bytes(32));
    $_SESSION = [
        'adminUsername' => $username,
        'createdAt' => $now,
        'lastActivity' => $now,
        'lastRegenerated' => $now,
        'userAgentHash' => admin_user_agent_hash(),
        'csrfToken' => $csrf,
    ];

    return $csrf;
}

function admin_destroy_session(): void
{
    $_SESSION = [];

    if (ini_get('session.use_cookies')) {
        $params = session_get_cookie_params();
        setcookie(session_name(), '', [
            'expires' => time() - 42000,
            'path' => $params['path'],
            'domain' => $params['domain'],
            'secure' => $params['secure'],
            'httponly' => $params['httponly'],
            'samesite' => 'Strict',
        ]);
    }

    session_destroy();
}

function admin_current_session(): ?array
{
    $username = $_SESSION['adminUsername'] ?? null;
    $createdAt = (int) ($_SESSION['createdAt'] ?? 0);
    $lastActivity = (int) ($_SESSION['lastActivity'] ?? 0);
    $userAgentHash = (string) ($_SESSION['userAgentHash'] ?? '');
    $csrfToken = (string) ($_SESSION['csrfToken'] ?? '');
    $now = time();

    if (
        !is_string($username)
        || $username === ''
        || $createdAt <= 0
        || $lastActivity <= 0
        || $csrfToken === ''
        || !hash_equals($userAgentHash, admin_user_agent_hash())
        || $now - $lastActivity > VIEJAP_ADMIN_IDLE_TIMEOUT
        || $now - $createdAt > VIEJAP_ADMIN_ABSOLUTE_TIMEOUT
    ) {
        if ($username !== null) {
            admin_destroy_session();
        }
        return null;
    }

    $lastRegenerated = (int) ($_SESSION['lastRegenerated'] ?? 0);
    if ($now - $lastRegenerated > VIEJAP_ADMIN_REGENERATE_INTERVAL) {
        session_regenerate_id(true);
        $_SESSION['lastRegenerated'] = $now;
    }
    $_SESSION['lastActivity'] = $now;

    return [
        'username' => $username,
        'csrfToken' => $csrfToken,
    ];
}

function admin_require_session(): array
{
    $session = admin_current_session();
    if ($session === null) {
        admin_respond(401, ['authenticated' => false, 'message' => 'Phiên đăng nhập đã hết hạn.']);
    }

    return $session;
}

function admin_require_csrf(array $session): void
{
    $provided = trim((string) ($_SERVER['HTTP_X_CSRF_TOKEN'] ?? ''));
    if ($provided === '' || !hash_equals((string) $session['csrfToken'], $provided)) {
        admin_respond(403, ['message' => 'Mã bảo vệ phiên không hợp lệ.']);
    }
}

function admin_handle_exception(Throwable $error): never
{
    error_log('[VieJap admin] ' . $error->getMessage());
    admin_respond(500, ['message' => 'Hệ thống quản trị tạm thời không khả dụng.']);
}
