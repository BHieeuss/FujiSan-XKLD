<?php
declare(strict_types=1);

function admin_home_directory(): ?string
{
    $home = trim((string) getenv('HOME'));
    if ($home !== '') {
        return rtrim($home, DIRECTORY_SEPARATOR);
    }

    $derivedHome = dirname(__DIR__, 3);
    return is_dir($derivedHome) ? $derivedHome : null;
}

function admin_database_config_path(): ?string
{
    $configured = trim((string) getenv('VIEJAP_ADMIN_DB_CONFIG'));
    if ($configured !== '') {
        return $configured;
    }

    $home = admin_home_directory();
    if ($home === null) {
        return null;
    }

    return $home
        . DIRECTORY_SEPARATOR . 'private'
        . DIRECTORY_SEPARATOR . 'viejap'
        . DIRECTORY_SEPARATOR . 'admin'
        . DIRECTORY_SEPARATOR . 'database.php';
}

function admin_database_configuration(): ?array
{
    static $loaded = false;
    static $configuration = null;

    if ($loaded) {
        return $configuration;
    }
    $loaded = true;

    $path = admin_database_config_path();
    if ($path === null || !is_file($path)) {
        return null;
    }

    $candidate = require $path;
    if (!is_array($candidate)) {
        throw new RuntimeException('Cấu hình cơ sở dữ liệu quản trị không hợp lệ.');
    }

    foreach (['host', 'database', 'username', 'password'] as $requiredKey) {
        if (!isset($candidate[$requiredKey]) || !is_string($candidate[$requiredKey])) {
            throw new RuntimeException('Cấu hình cơ sở dữ liệu quản trị còn thiếu.');
        }
    }

    $configuration = $candidate;
    return $configuration;
}

function admin_database(): ?PDO
{
    static $initialized = false;
    static $connection = null;

    if ($initialized) {
        return $connection;
    }
    $initialized = true;

    $configuration = admin_database_configuration();
    if ($configuration === null) {
        return null;
    }

    $host = $configuration['host'];
    $port = (int) ($configuration['port'] ?? 3306);
    $database = $configuration['database'];
    $dsn = "mysql:host={$host};port={$port};dbname={$database};charset=utf8mb4";

    $connection = new PDO($dsn, $configuration['username'], $configuration['password'], [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ]);
    admin_database_ensure_schema($connection);

    return $connection;
}

function admin_database_ensure_schema(PDO $database): void
{
    static $ready = false;
    if ($ready) {
        return;
    }

    $database->exec(
        'CREATE TABLE IF NOT EXISTS admin_accounts (
            username VARCHAR(80) NOT NULL PRIMARY KEY,
            password_hash VARCHAR(255) NOT NULL,
            password_changed_at DATETIME NULL,
            created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci'
    );

    $database->exec(
        'CREATE TABLE IF NOT EXISTS admin_login_attempts (
            attempt_key CHAR(64) NOT NULL PRIMARY KEY,
            attempts_json TEXT NOT NULL,
            locked_until BIGINT UNSIGNED NOT NULL DEFAULT 0,
            updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci'
    );

    $statement = $database->prepare(
        'INSERT IGNORE INTO admin_accounts (username, password_hash)
         VALUES (:username, :password_hash)'
    );
    $statement->execute([
        'username' => VIEJAP_ADMIN_INITIAL_USERNAME,
        'password_hash' => VIEJAP_ADMIN_INITIAL_PASSWORD_HASH,
    ]);

    $ready = true;
}

function admin_db_load_account(): ?array
{
    $database = admin_database();
    if ($database === null) {
        return null;
    }

    $statement = $database->prepare(
        'SELECT username, password_hash, password_changed_at
         FROM admin_accounts
         WHERE username = :username
         LIMIT 1'
    );
    $statement->execute(['username' => VIEJAP_ADMIN_INITIAL_USERNAME]);
    $account = $statement->fetch();

    if (!is_array($account)) {
        throw new RuntimeException('Không tìm thấy tài khoản quản trị trong cơ sở dữ liệu.');
    }

    return [
        'username' => (string) $account['username'],
        'passwordHash' => (string) $account['password_hash'],
        'passwordChangedAt' => $account['password_changed_at'],
    ];
}

function admin_db_save_account(array $account): bool
{
    $database = admin_database();
    if ($database === null) {
        return false;
    }

    $statement = $database->prepare(
        'UPDATE admin_accounts
         SET password_hash = :password_hash,
             password_changed_at = :password_changed_at
         WHERE username = :username'
    );
    $statement->execute([
        'password_hash' => $account['passwordHash'],
        'password_changed_at' => isset($account['passwordChangedAt'])
            ? admin_database_datetime((string) $account['passwordChangedAt'])
            : null,
        'username' => $account['username'],
    ]);

    return true;
}

function admin_db_read_rate_state(string $attemptKey): ?array
{
    $database = admin_database();
    if ($database === null) {
        return null;
    }

    $statement = $database->prepare(
        'SELECT attempts_json, locked_until
         FROM admin_login_attempts
         WHERE attempt_key = :attempt_key
         LIMIT 1'
    );
    $statement->execute(['attempt_key' => $attemptKey]);
    $state = $statement->fetch();
    if (!is_array($state)) {
        return ['attempts' => [], 'lockedUntil' => 0];
    }

    $attempts = json_decode((string) $state['attempts_json'], true);
    return [
        'attempts' => is_array($attempts) ? $attempts : [],
        'lockedUntil' => (int) $state['locked_until'],
    ];
}

function admin_db_write_rate_state(string $attemptKey, array $state): bool
{
    $database = admin_database();
    if ($database === null) {
        return false;
    }

    $statement = $database->prepare(
        'INSERT INTO admin_login_attempts (attempt_key, attempts_json, locked_until)
         VALUES (:attempt_key, :attempts_json, :locked_until)
         ON DUPLICATE KEY UPDATE
           attempts_json = VALUES(attempts_json),
           locked_until = VALUES(locked_until)'
    );
    $statement->execute([
        'attempt_key' => $attemptKey,
        'attempts_json' => json_encode(array_values($state['attempts']), JSON_THROW_ON_ERROR),
        'locked_until' => (int) $state['lockedUntil'],
    ]);

    return true;
}

function admin_db_clear_rate_state(string $attemptKey): bool
{
    $database = admin_database();
    if ($database === null) {
        return false;
    }

    $statement = $database->prepare(
        'DELETE FROM admin_login_attempts WHERE attempt_key = :attempt_key'
    );
    $statement->execute(['attempt_key' => $attemptKey]);
    return true;
}

function admin_database_datetime(string $value): ?string
{
    if ($value === '') {
        return null;
    }

    try {
        return (new DateTimeImmutable($value))->setTimezone(new DateTimeZone('UTC'))->format('Y-m-d H:i:s');
    } catch (Throwable) {
        return gmdate('Y-m-d H:i:s');
    }
}
