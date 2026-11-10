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

    $database->exec(
        'CREATE TABLE IF NOT EXISTS job_orders (
            id CHAR(24) NOT NULL PRIMARY KEY,
            image_url VARCHAR(255) NOT NULL DEFAULT \'\',
            order_code VARCHAR(48) NOT NULL,
            title TEXT NOT NULL,
            category VARCHAR(32) NOT NULL,
            location VARCHAR(100) NOT NULL,
            salary VARCHAR(100) NOT NULL,
            age_range VARCHAR(60) NOT NULL,
            summary LONGTEXT NOT NULL,
            requirements TEXT NOT NULL,
            departure_month VARCHAR(48) NOT NULL,
            status VARCHAR(16) NOT NULL DEFAULT \'published\',
            is_featured TINYINT(1) NOT NULL DEFAULT 0,
            created_at DATETIME NOT NULL,
            updated_at DATETIME NOT NULL,
            INDEX job_orders_public_index (status, is_featured, updated_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci'
    );

    $imageUrlColumn = $database->query("SHOW COLUMNS FROM job_orders LIKE 'image_url'")->fetch();
    if (!is_array($imageUrlColumn)) {
        $database->exec("ALTER TABLE job_orders ADD COLUMN image_url VARCHAR(255) NOT NULL DEFAULT '' AFTER id");
    }

    $posterUrlColumn = $database->query("SHOW COLUMNS FROM job_orders LIKE 'poster_url'")->fetch();
    if (!is_array($posterUrlColumn)) {
        $database->exec("ALTER TABLE job_orders ADD COLUMN poster_url VARCHAR(255) NOT NULL DEFAULT '' AFTER image_url");
    }

    // Existing installations may still have the original bounded text columns.
    $titleColumn = $database->query("SHOW COLUMNS FROM job_orders LIKE 'title'")->fetch();
    if (is_array($titleColumn) && strtolower((string) ($titleColumn['Type'] ?? '')) !== 'text') {
        $database->exec('ALTER TABLE job_orders MODIFY title TEXT NOT NULL');
    }

    $summaryColumn = $database->query("SHOW COLUMNS FROM job_orders LIKE 'summary'")->fetch();
    if (is_array($summaryColumn) && strtolower((string) ($summaryColumn['Type'] ?? '')) !== 'longtext') {
        $database->exec('ALTER TABLE job_orders MODIFY summary LONGTEXT NOT NULL');
    }

    // Migration: thêm các cột chi tiết đơn hàng còn thiếu (company, specificWork, salary detail...)
    $extraColumns = [
        'company'            => "VARCHAR(160) NOT NULL DEFAULT ''",
        'job_type'           => "VARCHAR(120) NOT NULL DEFAULT ''",
        'quantity'           => "VARCHAR(80) NOT NULL DEFAULT ''",
        'gender'             => "VARCHAR(40) NOT NULL DEFAULT 'Nam/Nữ'",
        'education'          => "VARCHAR(120) NOT NULL DEFAULT 'Tốt nghiệp THPT trở lên'",
        'japanese_level'     => "VARCHAR(120) NOT NULL DEFAULT ''",
        'contract_term'      => "VARCHAR(60) NOT NULL DEFAULT '3 năm'",
        'interview_date'     => "VARCHAR(60) NOT NULL DEFAULT ''",
        'specific_work'      => "LONGTEXT NULL DEFAULT NULL",
        'work_environment'   => "TEXT NULL DEFAULT NULL",
        'working_hours'      => "TEXT NULL DEFAULT NULL",
        'holidays'           => "TEXT NULL DEFAULT NULL",
        'experience'         => "TEXT NULL DEFAULT NULL",
        'health_requirements'=> "TEXT NULL DEFAULT NULL",
        'basic_salary'       => "VARCHAR(120) NOT NULL DEFAULT ''",
        'take_home_salary'   => "VARCHAR(120) NOT NULL DEFAULT ''",
        'overtime'           => "TEXT NULL DEFAULT NULL",
        'allowances'         => "TEXT NULL DEFAULT NULL",
        'bonus'              => "TEXT NULL DEFAULT NULL",
        'insurance'          => "TEXT NULL DEFAULT NULL",
        'accommodation'      => "TEXT NULL DEFAULT NULL",
        'meals'              => "TEXT NULL DEFAULT NULL",
        'transport'          => "TEXT NULL DEFAULT NULL",
        'other_benefits'     => "TEXT NULL DEFAULT NULL",
        'post_content'       => "LONGTEXT NULL DEFAULT NULL",
        'facebook_content'   => "LONGTEXT NULL DEFAULT NULL",
        'post_template_id'   => "VARCHAR(80) NOT NULL DEFAULT 'standard_general'",
        'post_blocks'        => "LONGTEXT NULL DEFAULT NULL",
        'gallery_images'     => "LONGTEXT NULL DEFAULT NULL",
        'deleted_at'         => "DATETIME NULL DEFAULT NULL",
        'deleted_by'         => "VARCHAR(120) NOT NULL DEFAULT ''",
        'previous_status'    => "VARCHAR(40) NOT NULL DEFAULT 'draft'",
    ];
    foreach ($extraColumns as $colName => $colDef) {
        try {
            $existing = $database->query("SHOW COLUMNS FROM job_orders LIKE '{$colName}'")->fetch();
            if (!is_array($existing)) {
                $database->exec("ALTER TABLE job_orders ADD COLUMN {$colName} {$colDef}");
            }
        } catch (Throwable $alterError) {
            error_log("[VieJap db migration] Could not add column {$colName}: " . $alterError->getMessage());
        }
    }

    $database->exec(
        'CREATE TABLE IF NOT EXISTS job_order_metadata (
            metadata_key VARCHAR(64) NOT NULL PRIMARY KEY,
            metadata_value VARCHAR(255) NOT NULL,
            created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci'
    );

    $database->exec(
        'CREATE TABLE IF NOT EXISTS job_order_idempotency (
            idem_key CHAR(40) NOT NULL PRIMARY KEY,
            order_id CHAR(24) NOT NULL,
            created_at DATETIME NOT NULL,
            INDEX job_order_idempotency_created_index (created_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci'
    );

    $database->exec(
        'CREATE TABLE IF NOT EXISTS student_profiles (
            id VARCHAR(36) NOT NULL PRIMARY KEY,
            student_code VARCHAR(32) NOT NULL UNIQUE,
            full_name VARCHAR(120) NOT NULL,
            birth_date VARCHAR(20) NOT NULL DEFAULT \'\',
            phone VARCHAR(30) NOT NULL,
            id_number VARCHAR(30) NOT NULL,
            address TEXT NOT NULL,
            data_json LONGTEXT NOT NULL,
            status VARCHAR(32) NOT NULL DEFAULT \'tiep_nhan\',
            created_at DATETIME NOT NULL,
            updated_at DATETIME NOT NULL,
            INDEX student_profiles_status_index (status, updated_at),
            INDEX student_profiles_phone_index (phone),
            INDEX student_profiles_code_index (student_code)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci'
    );

    $database->exec(
        'CREATE TABLE IF NOT EXISTS student_profile_files (
            id VARCHAR(36) NOT NULL PRIMARY KEY,
            profile_id VARCHAR(36) NOT NULL,
            file_type VARCHAR(32) NOT NULL,
            version INT NOT NULL DEFAULT 1,
            file_name VARCHAR(255) NOT NULL,
            file_path VARCHAR(255) NOT NULL,
            file_size BIGINT NOT NULL DEFAULT 0,
            mime_type VARCHAR(100) NOT NULL DEFAULT \'\',
            created_at DATETIME NOT NULL,
            INDEX student_profile_files_profile_index (profile_id, file_type, version)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci'
    );

    $database->exec(
        'CREATE TABLE IF NOT EXISTS student_profile_audit_logs (
            id VARCHAR(36) NOT NULL PRIMARY KEY,
            profile_id VARCHAR(36) NOT NULL,
            action VARCHAR(64) NOT NULL,
            actor VARCHAR(80) NOT NULL DEFAULT \'Học viên\',
            details TEXT NOT NULL,
            created_at DATETIME NOT NULL,
            INDEX student_profile_audit_logs_profile_index (profile_id, created_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci'
    );

    // Migration: Thêm cột deleted_at và previous_status cho chức năng Thùng rác hồ sơ học viên (30 ngày tự động xóa)
    try {
        $database->exec("ALTER TABLE student_profiles ADD COLUMN deleted_at DATETIME NULL DEFAULT NULL");
    } catch (Throwable) {}
    try {
        $database->exec("ALTER TABLE student_profiles ADD COLUMN previous_status VARCHAR(32) NULL DEFAULT NULL");
    } catch (Throwable) {}
    try {
        $database->exec("CREATE INDEX student_profiles_deleted_at_index ON student_profiles (deleted_at)");
    } catch (Throwable) {}
    try {
        $database->exec("ALTER TABLE student_profiles ADD COLUMN registration_code VARCHAR(32) NULL DEFAULT NULL");
    } catch (Throwable) {}
    try {
        $database->exec("CREATE INDEX student_profiles_reg_code_index ON student_profiles (registration_code)");
    } catch (Throwable) {}
    try {
        $database->exec("ALTER TABLE student_profiles ADD COLUMN progress_percent INT NOT NULL DEFAULT 45");
    } catch (Throwable) {}
    try {
        $database->exec("ALTER TABLE student_profiles ADD COLUMN assigned_to VARCHAR(64) NULL DEFAULT NULL");
    } catch (Throwable) {}
    try {
        $database->exec("ALTER TABLE student_profiles ADD COLUMN assigned_staff_name VARCHAR(120) NULL DEFAULT NULL");
    } catch (Throwable) {}
    try {
        $database->exec("ALTER TABLE student_profiles ADD COLUMN notes TEXT NULL DEFAULT NULL");
    } catch (Throwable) {}

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
        return (new DateTimeImmutable($value))->setTimezone(new DateTimeZone('Asia/Ho_Chi_Minh'))->format('Y-m-d H:i:s');
    } catch (Throwable) {
        return date('Y-m-d H:i:s');
    }
}
