<?php
declare(strict_types=1);

require_once __DIR__ . '/_bootstrap.php';

function admin_student_profiles_database(): ?PDO
{
    return admin_database();
}

function admin_student_profiles_file_path(): string
{
    return admin_storage_directory() . DIRECTORY_SEPARATOR . 'student-profiles.json';
}

function admin_student_files_directory(string $profileId): string
{
    $dir = admin_storage_directory() . DIRECTORY_SEPARATOR . 'student-files' . DIRECTORY_SEPARATOR . $profileId;
    if (!is_dir($dir) && !mkdir($dir, 0700, true) && !is_dir($dir)) {
        throw new RuntimeException('Không thể tạo thư mục lưu trữ file học viên.');
    }
    return $dir;
}

function admin_student_files_delete_directory(string $profileId): void
{
    $dir = admin_storage_directory() . DIRECTORY_SEPARATOR . 'student-files' . DIRECTORY_SEPARATOR . $profileId;
    if (!is_dir($dir)) {
        return;
    }
    $items = array_diff(scandir($dir) ?: [], ['.', '..']);
    foreach ($items as $item) {
        $itemPath = $dir . DIRECTORY_SEPARATOR . $item;
        if (is_file($itemPath)) {
            @unlink($itemPath);
        }
    }
    @rmdir($dir);
}

function admin_student_profile_generate_code(): string
{
    $prefix = 'HV-' . date('ym');
    $suffix = strtoupper(bin2hex(random_bytes(2)));
    return $prefix . '-' . $suffix;
}

function admin_student_profile_generate_id(): string
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

function admin_student_profiles_load_file(): array
{
    $path = admin_student_profiles_file_path();
    if (!is_file($path)) {
        return [];
    }

    $raw = file_get_contents($path);
    if ($raw === false) {
        return [];
    }

    $data = json_decode($raw, true);
    return is_array($data) ? $data : [];
}

function admin_student_profiles_save_file(array $profiles): void
{
    admin_write_json_file(admin_student_profiles_file_path(), array_values($profiles));
}

function admin_student_profiles_purge_expired_trash(): int
{
    $now = time();
    $expiredThreshold = $now - (30 * 86400); // 30 ngày tự động xóa vĩnh viễn
    $expiredDateStr = date('Y-m-d H:i:s', $expiredThreshold);
    $purgedCount = 0;

    $database = admin_student_profiles_database();
    if ($database !== null) {
        try {
            $stmt = $database->prepare(
                "SELECT id, full_name FROM student_profiles WHERE status = 'trash' AND deleted_at IS NOT NULL AND deleted_at <= :threshold"
            );
            $stmt->execute(['threshold' => $expiredDateStr]);
            $expiredRows = $stmt->fetchAll();

            foreach ($expiredRows as $row) {
                $profileId = (string) $row['id'];
                $fullName = (string) $row['full_name'];

                admin_student_files_delete_directory($profileId);

                $delFiles = $database->prepare('DELETE FROM student_profile_files WHERE profile_id = :id');
                $delFiles->execute(['id' => $profileId]);

                $delLogs = $database->prepare('DELETE FROM student_profile_audit_logs WHERE profile_id = :id');
                $delLogs->execute(['id' => $profileId]);

                $delProfile = $database->prepare('DELETE FROM student_profiles WHERE id = :id');
                $delProfile->execute(['id' => $profileId]);

                $purgedCount++;

                try {
                    require_once __DIR__ . '/_bootstrap.php';
                    admin_activity_log_create([
                        'actorName' => 'Hệ thống tự động',
                        'actorRole' => 'Hệ thống',
                        'action' => 'Tự động xóa vĩnh viễn hồ sơ quá hạn 30 ngày',
                        'targetType' => 'student',
                        'targetId' => $profileId,
                        'targetName' => $fullName,
                        'details' => "Hồ sơ của học viên {$fullName} đã nằm trong thùng rác quá 30 ngày nên hệ thống đã tự động dọn dẹp vĩnh viễn.",
                    ]);
                } catch (Throwable) {}
            }
        } catch (Throwable) {}
    }

    // Purge in JSON file fallback
    try {
        $profiles = admin_student_profiles_load_file();
        $remaining = [];
        $jsonPurged = 0;
        foreach ($profiles as $p) {
            $isTrash = ($p['status'] ?? '') === 'trash';
            $delAt = !empty($p['deletedAt']) ? strtotime((string) $p['deletedAt']) : 0;
            if ($isTrash && $delAt > 0 && $delAt <= $expiredThreshold) {
                admin_student_files_delete_directory((string) $p['id']);
                $jsonPurged++;
                continue;
            }
            $remaining[] = $p;
        }
        if ($jsonPurged > 0) {
            admin_student_profiles_save_file($remaining);
            if ($database === null) {
                $purgedCount = $jsonPurged;
            }
        }
    } catch (Throwable) {}

    return $purgedCount;
}

function admin_student_profiles_trash_count(): int
{
    $database = admin_student_profiles_database();
    if ($database !== null) {
        try {
            $stmt = $database->query("SELECT COUNT(*) FROM student_profiles WHERE status = 'trash'");
            return (int) ($stmt ? $stmt->fetchColumn() : 0);
        } catch (Throwable) {}
    }

    $profiles = admin_student_profiles_load_file();
    $count = 0;
    foreach ($profiles as $p) {
        if (($p['status'] ?? '') === 'trash') {
            $count++;
        }
    }
    return $count;
}

function admin_student_profiles_list(array $filters = []): array
{
    // 1. Tự động quét và dọn sạch hồ sơ thùng rác quá 30 ngày
    admin_student_profiles_purge_expired_trash();

    $search = trim((string) ($filters['search'] ?? ''));
    $status = trim((string) ($filters['status'] ?? 'all'));
    $fromDate = trim((string) ($filters['from_date'] ?? ''));
    $toDate = trim((string) ($filters['to_date'] ?? ''));
    $sort = strtolower(trim((string) ($filters['sort'] ?? 'newest')));

    $database = admin_student_profiles_database();
    if ($database !== null) {
        $conditions = [];
        $params = [];

        if ($search !== '') {
            $conditions[] = '(full_name LIKE :search OR phone LIKE :search OR student_code LIKE :search OR id_number LIKE :search)';
            $params['search'] = '%' . $search . '%';
        }

        // Lọc theo thùng rác hoặc trạng thái thông thường
        if ($status === 'trash') {
            $conditions[] = "status = 'trash'";
        } else {
            $conditions[] = "status != 'trash'";
            if ($status !== '' && $status !== 'all') {
                $conditions[] = 'status = :status';
                $params['status'] = $status;
            }
        }

        if ($fromDate !== '') {
            $conditions[] = 'created_at >= :from_date';
            $params['from_date'] = $fromDate . ' 00:00:00';
        }

        if ($toDate !== '') {
            $conditions[] = 'created_at <= :to_date';
            $params['to_date'] = $toDate . ' 23:59:59';
        }

        $sql = 'SELECT id, student_code, full_name, birth_date, phone, id_number, address, status, deleted_at, previous_status, created_at, updated_at FROM student_profiles';
        if (!empty($conditions)) {
            $sql .= ' WHERE ' . implode(' AND ', $conditions);
        }

        $orderDir = $sort === 'oldest' ? 'ASC' : 'DESC';
        $sql .= " ORDER BY created_at {$orderDir}";

        $stmt = $database->prepare($sql);
        $stmt->execute($params);
        $rows = $stmt->fetchAll();

        $results = [];
        foreach ($rows as $row) {
            $profileId = (string) $row['id'];
            $filesStmt = $database->prepare(
                'SELECT id, file_type, version, file_name, file_size, created_at FROM student_profile_files WHERE profile_id = :profile_id ORDER BY version DESC'
            );
            $filesStmt->execute(['profile_id' => $profileId]);
            $files = $filesStmt->fetchAll();

            $deletedAt = !empty($row['deleted_at']) ? (string) $row['deleted_at'] : null;
            $daysRemaining = $deletedAt !== null ? max(0, 30 - (int) floor((time() - strtotime($deletedAt)) / 86400)) : null;

            $results[] = [
                'id' => $profileId,
                'studentCode' => (string) $row['student_code'],
                'fullName' => (string) $row['full_name'],
                'birthDate' => (string) $row['birth_date'],
                'phone' => (string) $row['phone'],
                'idNumber' => (string) $row['id_number'],
                'address' => (string) $row['address'],
                'status' => (string) $row['status'],
                'progressPercent' => isset($row['progress_percent']) ? (int) $row['progress_percent'] : 45,
                'registrationCode' => (string) ($row['registration_code'] ?? ''),
                'deletedAt' => $deletedAt,
                'previousStatus' => !empty($row['previous_status']) ? (string) $row['previous_status'] : null,
                'daysRemaining' => $daysRemaining,
                'createdAt' => (string) $row['created_at'],
                'updatedAt' => (string) $row['updated_at'],
                'files' => array_map(static fn($f) => [
                    'id' => (string) $f['id'],
                    'fileType' => (string) $f['file_type'],
                    'version' => (int) $f['version'],
                    'fileName' => (string) $f['file_name'],
                    'fileSize' => (int) $f['file_size'],
                    'createdAt' => (string) $f['created_at'],
                ], $files),
            ];
        }
        return $results;
    }

    // JSON file fallback
    $profiles = admin_student_profiles_load_file();
    $filtered = [];

    foreach ($profiles as $p) {
        $pStatus = (string) ($p['status'] ?? 'tiep_nhan');

        // Phân loại thùng rác vs hoạt động
        if ($status === 'trash') {
            if ($pStatus !== 'trash') continue;
        } else {
            if ($pStatus === 'trash') continue;
            if ($status !== '' && $status !== 'all' && $pStatus !== $status) {
                continue;
            }
        }

        if ($search !== '') {
            $matched = mb_stripos($p['fullName'] ?? '', $search) !== false
                || mb_stripos($p['phone'] ?? '', $search) !== false
                || mb_stripos($p['studentCode'] ?? '', $search) !== false
                || mb_stripos($p['idNumber'] ?? '', $search) !== false;
            if (!$matched) continue;
        }

        $createdAt = $p['createdAt'] ?? '';
        if ($fromDate !== '' && substr($createdAt, 0, 10) < $fromDate) {
            continue;
        }
        if ($toDate !== '' && substr($createdAt, 0, 10) > $toDate) {
            continue;
        }

        $deletedAt = !empty($p['deletedAt']) ? (string) $p['deletedAt'] : null;
        $daysRemaining = $deletedAt !== null ? max(0, 30 - (int) floor((time() - strtotime($deletedAt)) / 86400)) : null;

        $filtered[] = [
            'id' => (string) $p['id'],
            'studentCode' => (string) ($p['studentCode'] ?? ''),
            'fullName' => (string) ($p['fullName'] ?? ''),
            'birthDate' => (string) ($p['birthDate'] ?? ''),
            'phone' => (string) ($p['phone'] ?? ''),
            'idNumber' => (string) ($p['idNumber'] ?? ''),
            'address' => (string) ($p['address'] ?? ''),
            'status' => $pStatus,
            'progressPercent' => isset($p['progressPercent']) ? (int) $p['progressPercent'] : 45,
            'registrationCode' => (string) ($p['registrationCode'] ?? ''),
            'deletedAt' => $deletedAt,
            'previousStatus' => !empty($p['previousStatus']) ? (string) $p['previousStatus'] : null,
            'daysRemaining' => $daysRemaining,
            'assignedTo' => (string) ($p['assignedTo'] ?? ''),
            'assignedStaffName' => (string) ($p['assignedStaffName'] ?? ''),
            'createdAt' => (string) ($p['createdAt'] ?? ''),
            'updatedAt' => (string) ($p['updatedAt'] ?? ''),
            'files' => array_map(static fn($f) => [
                'id' => (string) $f['id'],
                'fileType' => (string) $f['fileType'],
                'version' => (int) ($f['version'] ?? 1),
                'fileName' => (string) $f['fileName'],
                'fileSize' => (int) ($f['fileSize'] ?? 0),
                'createdAt' => (string) ($f['createdAt'] ?? ''),
            ], $p['files'] ?? []),
        ];
    }

    usort($filtered, static function ($a, $b) use ($sort) {
        $c = strcmp($a['createdAt'], $b['createdAt']);
        return $sort === 'oldest' ? $c : -$c;
    });

    return $filtered;
}

function admin_student_profile_find(string $id): ?array
{
    $database = admin_student_profiles_database();
    if ($database !== null) {
        $stmt = $database->prepare('SELECT * FROM student_profiles WHERE id = :id LIMIT 1');
        $stmt->execute(['id' => $id]);
        $row = $stmt->fetch();
        if (!is_array($row)) {
            return null;
        }

        $filesStmt = $database->prepare(
            'SELECT * FROM student_profile_files WHERE profile_id = :profile_id ORDER BY file_type ASC, version DESC'
        );
        $filesStmt->execute(['profile_id' => $id]);
        $files = $filesStmt->fetchAll();

        $logsStmt = $database->prepare(
            'SELECT * FROM student_profile_audit_logs WHERE profile_id = :profile_id ORDER BY created_at DESC'
        );
        $logsStmt->execute(['profile_id' => $id]);
        $logs = $logsStmt->fetchAll();

        $formData = json_decode((string) $row['data_json'], true);

        return [
            'id' => (string) $row['id'],
            'studentCode' => (string) $row['student_code'],
            'fullName' => (string) $row['full_name'],
            'birthDate' => (string) $row['birth_date'],
            'phone' => (string) $row['phone'],
            'idNumber' => (string) $row['id_number'],
            'address' => (string) $row['address'],
            'status' => (string) $row['status'],
            'deletedAt' => !empty($row['deleted_at']) ? (string) $row['deleted_at'] : null,
            'previousStatus' => !empty($row['previous_status']) ? (string) $row['previous_status'] : null,
            'daysRemaining' => !empty($row['deleted_at']) ? max(0, 30 - (int) floor((time() - strtotime((string) $row['deleted_at'])) / 86400)) : null,
            'createdAt' => (string) $row['created_at'],
            'updatedAt' => (string) $row['updated_at'],
            'data' => is_array($formData) ? $formData : [],
            'files' => array_map(static fn($f) => [
                'id' => (string) $f['id'],
                'fileType' => (string) $f['file_type'],
                'version' => (int) $f['version'],
                'fileName' => (string) $f['file_name'],
                'fileSize' => (int) $f['file_size'],
                'mimeType' => (string) $f['mime_type'],
                'createdAt' => (string) $f['created_at'],
            ], $files),
            'auditLogs' => array_map(static fn($l) => [
                'id' => (string) $l['id'],
                'action' => (string) $l['action'],
                'actor' => (string) $l['actor'],
                'details' => (string) $l['details'],
                'createdAt' => (string) $l['created_at'],
            ], $logs),
        ];
    }

    // JSON file fallback
    $profiles = admin_student_profiles_load_file();
    foreach ($profiles as $p) {
        if (($p['id'] ?? '') === $id) {
            $delAt = !empty($p['deletedAt']) ? (string) $p['deletedAt'] : null;
            $p['daysRemaining'] = $delAt !== null ? max(0, 30 - (int) floor((time() - strtotime($delAt)) / 86400)) : null;
            return $p;
        }
    }

    return null;
}

function admin_student_profile_create(array $payload, array $initialFiles = []): array
{
    $id = admin_student_profile_generate_id();
    $studentCode = admin_student_profile_generate_code();
    $now = date('Y-m-d H:i:s');

    $fullName = trim((string) ($payload['fullName'] ?? ''));
    $birthDate = trim((string) ($payload['birthDate'] ?? ''));
    $phone = trim((string) ($payload['phone'] ?? ''));
    $idNumber = trim((string) ($payload['idNumber'] ?? ''));
    $address = trim((string) ($payload['address'] ?? ''));
    $dataJson = is_string($payload['data'] ?? null)
        ? $payload['data']
        : json_encode($payload['data'] ?? [], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    $status = 'tiep_nhan';

    $database = admin_student_profiles_database();
    if ($database !== null) {
        $stmt = $database->prepare(
            'INSERT INTO student_profiles (id, student_code, full_name, birth_date, phone, id_number, address, data_json, status, created_at, updated_at)
             VALUES (:id, :student_code, :full_name, :birth_date, :phone, :id_number, :address, :data_json, :status, :created_at, :updated_at)'
        );
        $stmt->execute([
            'id' => $id,
            'student_code' => $studentCode,
            'full_name' => $fullName,
            'birth_date' => $birthDate,
            'phone' => $phone,
            'id_number' => $idNumber,
            'address' => $address,
            'data_json' => $dataJson,
            'status' => $status,
            'created_at' => $now,
            'updated_at' => $now,
        ]);

        // Insert initial files
        foreach ($initialFiles as $file) {
            $fileId = admin_student_profile_generate_id();
            $fileStmt = $database->prepare(
                'INSERT INTO student_profile_files (id, profile_id, file_type, version, file_name, file_path, file_size, mime_type, created_at)
                 VALUES (:id, :profile_id, :file_type, :version, :file_name, :file_path, :file_size, :mime_type, :created_at)'
            );
            $fileStmt->execute([
                'id' => $fileId,
                'profile_id' => $id,
                'file_type' => $file['fileType'],
                'version' => $file['version'] ?? 1,
                'file_name' => $file['fileName'],
                'file_path' => $file['filePath'],
                'file_size' => $file['fileSize'] ?? 0,
                'mime_type' => $file['mimeType'] ?? '',
                'created_at' => $now,
            ]);
        }

        // Audit log
        $logId = admin_student_profile_generate_id();
        $logStmt = $database->prepare(
            'INSERT INTO student_profile_audit_logs (id, profile_id, action, actor, details, created_at)
             VALUES (:id, :profile_id, :action, :actor, :details, :created_at)'
        );
        $logStmt->execute([
            'id' => $logId,
            'profile_id' => $id,
            'action' => 'created',
            'actor' => 'Học viên',
            'details' => 'Đăng ký nộp hồ sơ sơ yếu lý lịch trực tuyến.',
            'created_at' => $now,
        ]);

        return admin_student_profile_find($id) ?? [];
    }

    // JSON file fallback
    $profiles = admin_student_profiles_load_file();
    $preparedFiles = [];
    foreach ($initialFiles as $file) {
        $preparedFiles[] = [
            'id' => admin_student_profile_generate_id(),
            'fileType' => $file['fileType'],
            'version' => $file['version'] ?? 1,
            'fileName' => $file['fileName'],
            'filePath' => $file['filePath'],
            'fileSize' => $file['fileSize'] ?? 0,
            'mimeType' => $file['mimeType'] ?? '',
            'createdAt' => $now,
        ];
    }

    $newProfile = [
        'id' => $id,
        'studentCode' => $studentCode,
        'fullName' => $fullName,
        'birthDate' => $birthDate,
        'phone' => $phone,
        'idNumber' => $idNumber,
        'address' => $address,
        'status' => $status,
        'createdAt' => $now,
        'updatedAt' => $now,
        'data' => is_string($payload['data'] ?? null) ? json_decode($payload['data'], true) : ($payload['data'] ?? []),
        'files' => $preparedFiles,
        'auditLogs' => [
            [
                'id' => admin_student_profile_generate_id(),
                'action' => 'created',
                'actor' => 'Học viên',
                'details' => 'Đăng ký nộp hồ sơ sơ yếu lý lịch trực tuyến.',
                'createdAt' => $now,
            ],
        ],
    ];

    $profiles[] = $newProfile;
    admin_student_profiles_save_file($profiles);

    return $newProfile;
}

function admin_student_profile_update(string $id, array $updates, string $actor = 'Admin'): ?array
{
    $now = date('Y-m-d H:i:s');
    $existing = admin_student_profile_find($id);
    if ($existing === null) {
        return null;
    }

    $changes = [];

    // Fields to update
    $status = isset($updates['status']) ? trim((string) $updates['status']) : $existing['status'];
    if ($status !== $existing['status']) {
        $changes[] = "Trạng thái: '{$existing['status']}' -> '{$status}'";
    }

    $fullName = isset($updates['fullName']) ? trim((string) $updates['fullName']) : $existing['fullName'];
    if ($fullName !== $existing['fullName']) {
        $changes[] = "Họ tên: '{$existing['fullName']}' -> '{$fullName}'";
    }

    $phone = isset($updates['phone']) ? trim((string) $updates['phone']) : $existing['phone'];
    if ($phone !== $existing['phone']) {
        $changes[] = "Số điện thoại: '{$existing['phone']}' -> '{$phone}'";
    }

    $birthDate = isset($updates['birthDate']) ? trim((string) $updates['birthDate']) : $existing['birthDate'];
    $idNumber = isset($updates['idNumber']) ? trim((string) $updates['idNumber']) : $existing['idNumber'];
    $address = isset($updates['address']) ? trim((string) $updates['address']) : $existing['address'];

    $assignedTo = isset($updates['assignedTo']) ? trim((string) $updates['assignedTo']) : ($existing['assignedTo'] ?? '');
    $assignedStaffName = isset($updates['assignedStaffName']) ? trim((string) $updates['assignedStaffName']) : ($existing['assignedStaffName'] ?? '');
    if ($assignedStaffName !== ($existing['assignedStaffName'] ?? '')) {
        $changes[] = "Phụ trách: '" . ($existing['assignedStaffName'] ?? 'Chưa phân công') . "' -> '{$assignedStaffName}'";
    }

    $data = isset($updates['data']) ? $updates['data'] : $existing['data'];
    if (isset($updates['data'])) {
        $changes[] = 'Cập nhật lại dữ liệu chi tiết sơ yếu lý lịch';
    }

    $dataJson = json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    $details = !empty($changes) ? implode('; ', $changes) : 'Chỉnh sửa thông tin hồ sơ.';

    $database = admin_student_profiles_database();
    if ($database !== null) {
        $stmt = $database->prepare(
            'UPDATE student_profiles
             SET full_name = :full_name, birth_date = :birth_date, phone = :phone, id_number = :id_number,
                 address = :address, data_json = :data_json, status = :status, updated_at = :updated_at
             WHERE id = :id'
        );
        $stmt->execute([
            'id' => $id,
            'full_name' => $fullName,
            'birth_date' => $birthDate,
            'phone' => $phone,
            'id_number' => $idNumber,
            'address' => $address,
            'data_json' => $dataJson,
            'status' => $status,
            'updated_at' => $now,
        ]);

        $logId = admin_student_profile_generate_id();
        $logStmt = $database->prepare(
            'INSERT INTO student_profile_audit_logs (id, profile_id, action, actor, details, created_at)
             VALUES (:id, :profile_id, :action, :actor, :details, :created_at)'
        );
        $logStmt->execute([
            'id' => $logId,
            'profile_id' => $id,
            'action' => 'updated_info',
            'actor' => $actor,
            'details' => $details,
            'created_at' => $now,
        ]);
    } else {
        // JSON file fallback
        $profiles = admin_student_profiles_load_file();
        foreach ($profiles as &$p) {
            if (($p['id'] ?? '') === $id) {
                $p['fullName'] = $fullName;
                $p['birthDate'] = $birthDate;
                $p['phone'] = $phone;
                $p['idNumber'] = $idNumber;
                $p['address'] = $address;
                $p['status'] = $status;
                $p['assignedTo'] = $assignedTo;
                $p['assignedStaffName'] = $assignedStaffName;
                $p['data'] = $data;
                $p['updatedAt'] = $now;
                $p['auditLogs'][] = [
                    'id' => admin_student_profile_generate_id(),
                    'action' => 'updated_info',
                    'actor' => $actor,
                    'details' => $details,
                    'createdAt' => $now,
                ];
                break;
            }
        }
        unset($p);
        admin_student_profiles_save_file($profiles);
    }

    try {
        require_once __DIR__ . '/_notifications.php';
        $diff = [];
        if ($status !== $existing['status']) {
            $diff[] = ['field' => 'status', 'fieldLabel' => 'Trạng thái hồ sơ', 'before' => $existing['status'], 'after' => $status];
            admin_notification_create([
                'eventType' => 'student.status_changed',
                'category' => 'students',
                'title' => 'Trạng thái hồ sơ: ' . $fullName,
                'message' => 'Hồ sơ ' . ($existing['studentCode'] ?? '') . ' chuyển từ [' . $existing['status'] . '] sang [' . $status . '].',
                'actor' => ['id' => 'admin', 'name' => $actor, 'role' => 'Admin'],
                'target' => [
                    'type' => 'student',
                    'id' => $id,
                    'code' => $existing['studentCode'] ?? '',
                    'name' => $fullName,
                    'url' => '/quan-tri-viejap?section=students&id=' . $id,
                ],
                'priority' => ($status === 'can_bo_sung') ? 'high' : 'medium',
            ]);
        }
        if ($fullName !== $existing['fullName']) {
            $diff[] = ['field' => 'fullName', 'fieldLabel' => 'Họ và tên', 'before' => $existing['fullName'], 'after' => $fullName];
        }
        if ($phone !== $existing['phone']) {
            $diff[] = ['field' => 'phone', 'fieldLabel' => 'Số điện thoại', 'before' => $existing['phone'], 'after' => $phone];
        }
        if ($idNumber !== $existing['idNumber']) {
            $diff[] = ['field' => 'idNumber', 'fieldLabel' => 'Số CCCD/CMND', 'before' => $existing['idNumber'], 'after' => $idNumber];
        }
        if ($address !== $existing['address']) {
            $diff[] = ['field' => 'address', 'fieldLabel' => 'Địa chỉ', 'before' => $existing['address'], 'after' => $address];
        }
        if ($assignedStaffName !== ($existing['assignedStaffName'] ?? '')) {
            $diff[] = ['field' => 'assignedStaff', 'fieldLabel' => 'Cán bộ phụ trách', 'before' => $existing['assignedStaffName'] ?? 'Chưa phân công', 'after' => $assignedStaffName];
        }

        if (!empty($diff)) {
            admin_activity_log_create([
                'actorName' => $actor,
                'actorRole' => 'Quản trị viên',
                'action' => 'Cập nhật hồ sơ học viên ' . $fullName,
                'targetType' => 'student',
                'targetId' => $id,
                'targetName' => $fullName,
                'details' => $details,
                'changes' => $diff,
            ]);

            if ($status === $existing['status']) {
                admin_notification_create([
                    'eventType' => 'student.updated',
                    'category' => 'students',
                    'title' => 'Cập nhật hồ sơ: ' . $fullName,
                    'message' => 'Cán bộ ' . $actor . ' vừa cập nhật thông tin hồ sơ học viên ' . $fullName . ' (' . ($existing['studentCode'] ?? '') . ').',
                    'actor' => ['id' => 'admin', 'name' => $actor, 'role' => 'Admin'],
                    'target' => [
                        'type' => 'student',
                        'id' => $id,
                        'code' => $existing['studentCode'] ?? '',
                        'name' => $fullName,
                        'url' => '/quan-tri-viejap?section=students&id=' . $id,
                    ],
                    'priority' => 'low',
                ]);
            }
        }
    } catch (Throwable) {}

    return admin_student_profile_find($id);
}

function admin_student_profile_add_file_version(
    string $profileId,
    string $fileType,
    string $fileName,
    string $filePath,
    int $fileSize,
    string $mimeType,
    string $actor = 'Admin'
): ?array {
    $existing = admin_student_profile_find($profileId);
    if ($existing === null) {
        return null;
    }

    $currentMaxVersion = 0;
    foreach ($existing['files'] ?? [] as $f) {
        if (($f['fileType'] ?? '') === $fileType) {
            $currentMaxVersion = max($currentMaxVersion, (int) ($f['version'] ?? 1));
        }
    }
    $newVersion = $currentMaxVersion + 1;
    $now = date('Y-m-d H:i:s');
    $fileId = admin_student_profile_generate_id();

    $database = admin_student_profiles_database();
    if ($database !== null) {
        $stmt = $database->prepare(
            'INSERT INTO student_profile_files (id, profile_id, file_type, version, file_name, file_path, file_size, mime_type, created_at)
             VALUES (:id, :profile_id, :file_type, :version, :file_name, :file_path, :file_size, :mime_type, :created_at)'
        );
        $stmt->execute([
            'id' => $fileId,
            'profile_id' => $profileId,
            'file_type' => $fileType,
            'version' => $newVersion,
            'file_name' => $fileName,
            'file_path' => $filePath,
            'file_size' => $fileSize,
            'mime_type' => $mimeType,
            'created_at' => $now,
        ]);

        $logId = admin_student_profile_generate_id();
        $action = $fileType === 'excel' ? 'reexported_excel' : 'added_file';
        $details = $fileType === 'excel'
            ? "Xuất lại file Excel phiên bản v{$newVersion}: {$fileName}"
            : "Đính kèm thêm file {$fileName} (phiên bản v{$newVersion})";

        $logStmt = $database->prepare(
            'INSERT INTO student_profile_audit_logs (id, profile_id, action, actor, details, created_at)
             VALUES (:id, :profile_id, :action, :actor, :details, :created_at)'
        );
        $logStmt->execute([
            'id' => $logId,
            'profile_id' => $profileId,
            'action' => $action,
            'actor' => $actor,
            'details' => $details,
            'created_at' => $now,
        ]);

        return admin_student_profile_find($profileId);
    }

    // JSON file fallback
    $profiles = admin_student_profiles_load_file();
    foreach ($profiles as &$p) {
        if (($p['id'] ?? '') === $profileId) {
            $p['files'][] = [
                'id' => $fileId,
                'fileType' => $fileType,
                'version' => $newVersion,
                'fileName' => $fileName,
                'filePath' => $filePath,
                'fileSize' => $fileSize,
                'mimeType' => $mimeType,
                'createdAt' => $now,
            ];
            $action = $fileType === 'excel' ? 'reexported_excel' : 'added_file';
            $details = $fileType === 'excel'
                ? "Xuất lại file Excel phiên bản v{$newVersion}: {$fileName}"
                : "Đính kèm thêm file {$fileName} (phiên bản v{$newVersion})";
            $p['auditLogs'][] = [
                'id' => admin_student_profile_generate_id(),
                'action' => $action,
                'actor' => $actor,
                'details' => $details,
                'createdAt' => $now,
            ];
            $p['updatedAt'] = $now;
            break;
        }
    }
    unset($p);
    admin_student_profiles_save_file($profiles);

    try {
        require_once __DIR__ . '/_notifications.php';
        admin_notification_create([
            'eventType' => 'document.uploaded',
            'category' => 'documents',
            'title' => 'Tài liệu mới: ' . $existing['fullName'] . ' (v' . $newVersion . ')',
            'message' => 'Tải lên tệp ' . $fileName . ' (' . strtoupper($fileType) . ') cho học viên ' . $existing['fullName'] . '.',
            'actor' => ['id' => 'admin', 'name' => $actor, 'role' => 'Admin'],
            'target' => [
                'type' => 'student',
                'id' => $profileId,
                'code' => $existing['studentCode'] ?? '',
                'name' => $existing['fullName'],
                'url' => '/quan-tri-viejap?section=students&id=' . $profileId,
            ],
            'priority' => 'medium',
        ]);
        admin_activity_log_create([
            'actorName' => $actor,
            'actorRole' => 'Quản trị viên',
            'action' => 'Tải lên phiên bản tệp mới: ' . $fileName,
            'targetType' => 'student',
            'targetId' => $profileId,
            'targetName' => $existing['fullName'],
            'details' => 'Loại tệp: ' . strtoupper($fileType) . ' | Phiên bản: v' . $newVersion . ' | Kích thước: ' . round($fileSize / 1024) . ' KB.',
        ]);
    } catch (Throwable) {}

    return admin_student_profile_find($profileId);
}

function admin_student_profile_get_file_record(string $profileId, string $fileId): ?array
{
    $database = admin_student_profiles_database();
    if ($database !== null) {
        $stmt = $database->prepare(
            'SELECT * FROM student_profile_files WHERE id = :id AND profile_id = :profile_id LIMIT 1'
        );
        $stmt->execute(['id' => $fileId, 'profile_id' => $profileId]);
        $row = $stmt->fetch();
        return is_array($row) ? $row : null;
    }

    $profiles = admin_student_profiles_load_file();
    foreach ($profiles as $p) {
        if (($p['id'] ?? '') === $profileId) {
            foreach ($p['files'] ?? [] as $f) {
                if (($f['id'] ?? '') === $fileId) {
                    return $f;
                }
            }
        }
    }
    return null;
}

function admin_student_profile_delete_file(string $profileId, string $fileId, string $actor = 'Admin'): ?array
{
    $existing = admin_student_profile_find($profileId);
    if ($existing === null) {
        return null;
    }

    $fileRecord = admin_student_profile_get_file_record($profileId, $fileId);
    if ($fileRecord === null) {
        return null;
    }

    $filePath = (string) ($fileRecord['file_path'] ?? $fileRecord['filePath'] ?? '');
    if ($filePath !== '' && is_file($filePath)) {
        @unlink($filePath);
    }

    $fileName = (string) ($fileRecord['file_name'] ?? $fileRecord['fileName'] ?? 'file');
    $fileType = (string) ($fileRecord['file_type'] ?? $fileRecord['fileType'] ?? 'document');
    $version = (int) ($fileRecord['version'] ?? 1);
    $now = date('Y-m-d H:i:s');

    $database = admin_student_profiles_database();
    if ($database !== null) {
        $stmt = $database->prepare('DELETE FROM student_profile_files WHERE id = :id AND profile_id = :profile_id');
        $stmt->execute(['id' => $fileId, 'profile_id' => $profileId]);

        $logId = admin_student_profile_generate_id();
        $details = "Đã xóa tệp {$fileName} (loại: {$fileType}, v{$version})";
        $logStmt = $database->prepare(
            'INSERT INTO student_profile_audit_logs (id, profile_id, action, actor, details, created_at)
             VALUES (:id, :profile_id, :action, :actor, :details, :created_at)'
        );
        $logStmt->execute([
            'id' => $logId,
            'profile_id' => $profileId,
            'action' => 'deleted_file',
            'actor' => $actor,
            'details' => $details,
            'created_at' => $now,
        ]);

        return admin_student_profile_find($profileId);
    }

    // JSON file fallback
    $profiles = admin_student_profiles_load_file();
    foreach ($profiles as &$p) {
        if (($p['id'] ?? '') === $profileId) {
            $filteredFiles = [];
            foreach ($p['files'] ?? [] as $f) {
                if (($f['id'] ?? '') !== $fileId) {
                    $filteredFiles[] = $f;
                }
            }
            $p['files'] = $filteredFiles;

            $p['auditLogs'][] = [
                'id' => admin_student_profile_generate_id(),
                'action' => 'deleted_file',
                'actor' => $actor,
                'details' => "Đã xóa tệp {$fileName} (loại: {$fileType}, v{$version})",
                'createdAt' => $now,
            ];
            $p['updatedAt'] = $now;
            break;
        }
    }
    unset($p);
    admin_student_profiles_save_file($profiles);

    try {
        require_once __DIR__ . '/_bootstrap.php';
        admin_activity_log_create([
            'actorName' => $actor,
            'actorRole' => 'Quản trị viên',
            'action' => 'Xóa tệp đính kèm: ' . $fileName,
            'targetType' => 'student',
            'targetId' => $profileId,
            'targetName' => $existing['fullName'],
            'details' => 'Xóa tệp: ' . $fileName . ' | Loại: ' . strtoupper($fileType) . ' | v' . $version,
        ]);
    } catch (Throwable) {}

    return admin_student_profile_find($profileId);
}



function admin_student_profile_move_to_trash(string $id, string $actor = 'Admin'): bool
{
    $existing = admin_student_profile_find($id);
    if ($existing === null) {
        return false;
    }

    if ($existing['status'] === 'trash') {
        return true; // Đã nằm trong thùng rác
    }

    $now = date('Y-m-d H:i:s');
    $previousStatus = $existing['status'];
    $fullName = $existing['fullName'];
    $studentCode = $existing['studentCode'];

    $database = admin_student_profiles_database();
    if ($database !== null) {
        $stmt = $database->prepare(
            "UPDATE student_profiles SET status = 'trash', deleted_at = :deleted_at, previous_status = :previous_status, updated_at = :updated_at WHERE id = :id"
        );
        $stmt->execute([
            'id' => $id,
            'deleted_at' => $now,
            'previous_status' => $previousStatus,
            'updated_at' => $now,
        ]);

        $logId = admin_student_profile_generate_id();
        $logStmt = $database->prepare(
            'INSERT INTO student_profile_audit_logs (id, profile_id, action, actor, details, created_at)
             VALUES (:id, :profile_id, :action, :actor, :details, :created_at)'
        );
        $logStmt->execute([
            'id' => $logId,
            'profile_id' => $id,
            'action' => 'moved_to_trash',
            'actor' => $actor,
            'details' => 'Chuyển hồ sơ vào thùng rác. Hệ thống sẽ tự động xóa vĩnh viễn sau 30 ngày.',
            'created_at' => $now,
        ]);
    }

    // JSON file fallback
    $profiles = admin_student_profiles_load_file();
    foreach ($profiles as &$p) {
        if (($p['id'] ?? '') === $id) {
            $p['previousStatus'] = $previousStatus;
            $p['status'] = 'trash';
            $p['deletedAt'] = $now;
            $p['updatedAt'] = $now;
            $p['auditLogs'][] = [
                'id' => admin_student_profile_generate_id(),
                'action' => 'moved_to_trash',
                'actor' => $actor,
                'details' => 'Chuyển hồ sơ vào thùng rác. Hệ thống sẽ tự động xóa vĩnh viễn sau 30 ngày.',
                'createdAt' => $now,
            ];
            break;
        }
    }
    unset($p);
    admin_student_profiles_save_file($profiles);

    try {
        require_once __DIR__ . '/_notifications.php';
        admin_notification_create([
            'eventType' => 'student.trashed',
            'category' => 'students',
            'title' => 'Chuyển hồ sơ vào thùng rác: ' . $fullName,
            'message' => "Cán bộ {$actor} đã chuyển hồ sơ học viên {$fullName} ({$studentCode}) vào thùng rác.",
            'actor' => ['id' => 'admin', 'name' => $actor, 'role' => 'Admin'],
            'target' => [
                'type' => 'student',
                'id' => $id,
                'code' => $studentCode,
                'name' => $fullName,
                'url' => '/quan-tri-viejap?section=students&status=trash',
            ],
            'priority' => 'medium',
        ]);
        admin_activity_log_create([
            'actorName' => $actor,
            'actorRole' => 'Quản trị viên',
            'action' => 'Chuyển hồ sơ học viên vào thùng rác',
            'targetType' => 'student',
            'targetId' => $id,
            'targetName' => $fullName,
            'details' => "Chuyển hồ sơ {$fullName} ({$studentCode}) vào thùng rác. Hệ thống sẽ tự động xóa sau 30 ngày.",
        ]);
    } catch (Throwable) {}

    return true;
}

function admin_student_profile_restore(string $id, string $actor = 'Admin'): ?array
{
    $existing = admin_student_profile_find($id);
    if ($existing === null) {
        return null;
    }

    $now = date('Y-m-d H:i:s');
    $restoreStatus = (!empty($existing['previousStatus']) && $existing['previousStatus'] !== 'trash')
        ? $existing['previousStatus']
        : 'tiep_nhan';
    $fullName = $existing['fullName'];
    $studentCode = $existing['studentCode'];

    $database = admin_student_profiles_database();
    if ($database !== null) {
        $stmt = $database->prepare(
            'UPDATE student_profiles SET status = :status, deleted_at = NULL, previous_status = NULL, updated_at = :updated_at WHERE id = :id'
        );
        $stmt->execute([
            'id' => $id,
            'status' => $restoreStatus,
            'updated_at' => $now,
        ]);

        $logId = admin_student_profile_generate_id();
        $logStmt = $database->prepare(
            'INSERT INTO student_profile_audit_logs (id, profile_id, action, actor, details, created_at)
             VALUES (:id, :profile_id, :action, :actor, :details, :created_at)'
        );
        $logStmt->execute([
            'id' => $logId,
            'profile_id' => $id,
            'action' => 'restored',
            'actor' => $actor,
            'details' => "Khôi phục hồ sơ học viên từ thùng rác về trạng thái '{$restoreStatus}'.",
            'created_at' => $now,
        ]);
    }

    // JSON file fallback
    $profiles = admin_student_profiles_load_file();
    foreach ($profiles as &$p) {
        if (($p['id'] ?? '') === $id) {
            $p['status'] = $restoreStatus;
            $p['deletedAt'] = null;
            $p['previousStatus'] = null;
            $p['updatedAt'] = $now;
            $p['auditLogs'][] = [
                'id' => admin_student_profile_generate_id(),
                'action' => 'restored',
                'actor' => $actor,
                'details' => "Khôi phục hồ sơ học viên từ thùng rác về trạng thái '{$restoreStatus}'.",
                'createdAt' => $now,
            ];
            break;
        }
    }
    unset($p);
    admin_student_profiles_save_file($profiles);

    try {
        require_once __DIR__ . '/_notifications.php';
        admin_notification_create([
            'eventType' => 'student.restored',
            'category' => 'students',
            'title' => 'Khôi phục hồ sơ: ' . $fullName,
            'message' => "Cán bộ {$actor} đã khôi phục hồ sơ học viên {$fullName} ({$studentCode}) về trạng thái hoạt động.",
            'actor' => ['id' => 'admin', 'name' => $actor, 'role' => 'Admin'],
            'target' => [
                'type' => 'student',
                'id' => $id,
                'code' => $studentCode,
                'name' => $fullName,
                'url' => '/quan-tri-viejap?section=students&id=' . $id,
            ],
            'priority' => 'low',
        ]);
        admin_activity_log_create([
            'actorName' => $actor,
            'actorRole' => 'Quản trị viên',
            'action' => 'Khôi phục hồ sơ học viên từ thùng rác',
            'targetType' => 'student',
            'targetId' => $id,
            'targetName' => $fullName,
            'details' => "Khôi phục hồ sơ {$fullName} ({$studentCode}) về trạng thái '{$restoreStatus}'.",
        ]);
    } catch (Throwable) {}

    return admin_student_profile_find($id);
}

function admin_student_profile_delete_permanent(string $id, string $actor = 'Admin'): bool
{
    $existing = admin_student_profile_find($id);
    if ($existing === null) {
        return false;
    }

    $fullName = $existing['fullName'];
    $studentCode = $existing['studentCode'];

    admin_student_files_delete_directory($id);

    $database = admin_student_profiles_database();
    if ($database !== null) {
        $delFiles = $database->prepare('DELETE FROM student_profile_files WHERE profile_id = :id');
        $delFiles->execute(['id' => $id]);

        $delLogs = $database->prepare('DELETE FROM student_profile_audit_logs WHERE profile_id = :id');
        $delLogs->execute(['id' => $id]);

        $delProf = $database->prepare('DELETE FROM student_profiles WHERE id = :id');
        $delProf->execute(['id' => $id]);
    }

    // JSON file fallback
    $profiles = admin_student_profiles_load_file();
    $remaining = [];
    foreach ($profiles as $p) {
        if (($p['id'] ?? '') === $id) {
            continue;
        }
        $remaining[] = $p;
    }
    admin_student_profiles_save_file($remaining);

    try {
        require_once __DIR__ . '/_bootstrap.php';
        admin_activity_log_create([
            'actorName' => $actor,
            'actorRole' => 'Quản trị viên',
            'action' => 'Xóa vĩnh viễn hồ sơ học viên',
            'targetType' => 'student',
            'targetId' => $id,
            'targetName' => $fullName,
            'details' => "Xóa vĩnh viễn hồ sơ học viên {$fullName} (Mã: {$studentCode}) và toàn bộ tài liệu đính kèm khỏi máy chủ.",
        ]);
    } catch (Throwable) {}

    return true;
}

function admin_student_profiles_empty_trash(string $actor = 'Admin'): int
{
    $count = 0;
    $database = admin_student_profiles_database();
    if ($database !== null) {
        $stmt = $database->query("SELECT id FROM student_profiles WHERE status = 'trash'");
        $rows = $stmt ? $stmt->fetchAll() : [];
        foreach ($rows as $r) {
            if (admin_student_profile_delete_permanent((string) $r['id'], $actor)) {
                $count++;
            }
        }
        return $count;
    }

    $profiles = admin_student_profiles_load_file();
    foreach ($profiles as $p) {
        if (($p['status'] ?? '') === 'trash') {
            if (admin_student_profile_delete_permanent((string) $p['id'], $actor)) {
                $count++;
            }
        }
    }
    return $count;
}
