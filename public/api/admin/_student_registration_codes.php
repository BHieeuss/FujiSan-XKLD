<?php
declare(strict_types=1);

require_once __DIR__ . '/_bootstrap.php';
require_once __DIR__ . '/_notifications.php';
require_once __DIR__ . '/_student_profiles.php';

function admin_student_registration_codes_file_path(): string
{
    return admin_storage_directory() . DIRECTORY_SEPARATOR . 'student-registration-codes.json';
}

function admin_student_registration_code_logs_file_path(): string
{
    return admin_storage_directory() . DIRECTORY_SEPARATOR . 'student-registration-code-logs.json';
}

function admin_student_registration_codes_default_seed(): array
{
    $now = time();
    return [
        [
            'id' => 'src-sample-01',
            'studentId' => 'HS-260101',
            'studentName' => 'TRẦN BÁ HIẾU',
            'phone' => '0966966284',
            'email' => 'hieutran@viejap.vn',
            'notes' => 'Học viên tham gia chương trình thực tập sinh kỹ năng ngành cơ khí',
            'assignedTo' => 'admin',
            'assignedStaffName' => 'Super Admin',
            'code' => '583921',
            'codeHash' => hash('sha256', '583921'),
            'accessToken' => bin2hex(random_bytes(32)),
            'status' => 'pending',
            'progressStatus' => 'not_started',
            'progressPercent' => 0,
            'draftData' => null,
            'currentStep' => 0,
            'lastDraftSavedAt' => null,
            'createdAt' => date('c', $now - 3600),
            'expiresAt' => date('c', $now + (72 * 3600)),
            'createdBy' => 'Super Admin',
            'verifiedAt' => null,
            'usedAt' => null,
            'revokedAt' => null,
            'revokedBy' => null,
            'revokeReason' => null,
            'reissuedFromId' => null,
            'reissuedToId' => null,
            'updatedAt' => date('c', $now - 3600),
        ],
        [
            'id' => 'src-sample-02',
            'studentId' => '',
            'studentName' => 'LÊ THỊ MAI',
            'phone' => '0988123456',
            'email' => 'maile@gmail.com',
            'notes' => 'Nguyện vọng đơn hàng điều dưỡng Osaka',
            'assignedTo' => '',
            'assignedStaffName' => '',
            'code' => '719245',
            'codeHash' => hash('sha256', '719245'),
            'accessToken' => bin2hex(random_bytes(32)),
            'status' => 'in_progress',
            'progressStatus' => 'draft_saved',
            'progressPercent' => 60,
            'draftData' => null,
            'currentStep' => 3,
            'lastDraftSavedAt' => date('c', $now - 1800),
            'createdAt' => date('c', $now - 7200),
            'expiresAt' => date('c', $now + (68 * 3600)),
            'createdBy' => 'Super Admin',
            'verifiedAt' => date('c', $now - 3600),
            'usedAt' => null,
            'revokedAt' => null,
            'revokedBy' => null,
            'revokeReason' => null,
            'reissuedFromId' => null,
            'reissuedToId' => null,
            'updatedAt' => date('c', $now - 1800),
        ],
        [
            'id' => 'src-sample-03',
            'studentId' => 'HS-260102',
            'studentName' => 'NGUYỄN VĂN AN',
            'phone' => '0912345678',
            'email' => 'annguyen@gmail.com',
            'notes' => 'Đã hoàn tất gửi hồ sơ, chờ cán bộ tiếp nhận đối soát',
            'assignedTo' => 'admin',
            'assignedStaffName' => 'Super Admin',
            'code' => '394812',
            'codeHash' => hash('sha256', '394812'),
            'accessToken' => bin2hex(random_bytes(32)),
            'status' => 'used',
            'progressStatus' => 'submitted',
            'progressPercent' => 100,
            'draftData' => null,
            'currentStep' => 5,
            'lastDraftSavedAt' => date('c', $now - 86400),
            'createdAt' => date('c', $now - 90000),
            'expiresAt' => date('c', $now - 3600),
            'createdBy' => 'Super Admin',
            'verifiedAt' => date('c', $now - 88000),
            'usedAt' => date('c', $now - 86400),
            'revokedAt' => null,
            'revokedBy' => null,
            'revokeReason' => null,
            'reissuedFromId' => null,
            'reissuedToId' => null,
            'updatedAt' => date('c', $now - 86400),
        ],
    ];
}

function admin_student_registration_codes_load(): array
{
    $path = admin_student_registration_codes_file_path();
    if (!is_file($path)) {
        $seeds = admin_student_registration_codes_default_seed();
        admin_student_registration_codes_save($seeds);
        return $seeds;
    }
    $raw = file_get_contents($path);
    if ($raw === false) {
        return [];
    }
    $data = json_decode($raw, true);
    if (!is_array($data)) {
        return [];
    }
    return $data;
}

function admin_student_registration_codes_save(array $codes): void
{
    admin_write_json_file(admin_student_registration_codes_file_path(), array_values($codes));
}

function admin_student_registration_code_logs_load(): array
{
    $path = admin_student_registration_code_logs_file_path();
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

function admin_student_registration_code_logs_save(array $logs): void
{
    // Limit log size to latest 2000 entries
    if (count($logs) > 2000) {
        $logs = array_slice($logs, -2000);
    }
    admin_write_json_file(admin_student_registration_code_logs_file_path(), array_values($logs));
}

/**
 * Log verification attempt for rate limiting & audit
 */
function student_registration_log_attempt(string $ip, string $code, string $result, string $details = '', ?string $codeId = null): void
{
    $logs = admin_student_registration_code_logs_load();
    $logs[] = [
        'id' => 'log-' . bin2hex(random_bytes(8)),
        'ip' => $ip,
        'codeMasked' => strlen($code) >= 6 ? substr($code, 0, 2) . '**' . substr($code, -2) : '***',
        'codeId' => $codeId,
        'result' => $result, // success, invalid_code, expired, revoked, already_used, rate_limited
        'details' => $details,
        'createdAt' => date('c'),
    ];
    admin_student_registration_code_logs_save($logs);
}

/**
 * Rate Limiting: Max 5 failed attempts per IP within 15 minutes
 */
function student_registration_check_rate_limit(string $ip): array
{
    $logs = admin_student_registration_code_logs_load();
    $windowSeconds = 15 * 60; // 15 mins
    $maxFails = 5;
    $now = time();

    $failCount = 0;
    $firstFailTime = $now;

    for ($i = count($logs) - 1; $i >= 0; $i--) {
        $item = $logs[$i];
        if (($item['ip'] ?? '') !== $ip) {
            continue;
        }

        $logTime = strtotime($item['createdAt'] ?? '');
        if ($now - $logTime > $windowSeconds) {
            break;
        }

        if (($item['result'] ?? '') !== 'success') {
            $failCount++;
            $firstFailTime = $logTime;
        }
    }

    if ($failCount >= $maxFails) {
        $remaining = max(30, $windowSeconds - ($now - $firstFailTime));
        $remainingMins = ceil($remaining / 60);
        return [
            'allowed' => false,
            'message' => "Bạn đã nhập sai mã quá {$maxFails} lần liên tiếp. Vì lý do bảo mật, vui lòng thử lại sau {$remainingMins} phút.",
            'remainingSeconds' => (int) $remaining,
        ];
    }

    return ['allowed' => true];
}

/**
 * Automatically update expired codes (Housekeeping)
 */
function admin_student_registration_codes_housekeeping(array &$codes): bool
{
    $changed = false;
    $nowTime = time();

    foreach ($codes as &$c) {
        $status = $c['status'] ?? 'pending';
        if ($status === 'pending' || $status === 'in_progress') {
            $expTime = strtotime($c['expiresAt'] ?? '');
            if ($expTime > 0 && $nowTime >= $expTime) {
                $c['status'] = 'expired';
                $c['updatedAt'] = date('c');
                $changed = true;
            }
        }
    }
    unset($c);

    return $changed;
}

/**
 * Generate 6-digit random code, allowing leading zero, non-trivial, non-colliding
 */
function admin_student_registration_code_generate_unique(array $existingCodes): string
{
    $trivialList = [
        '000000', '111111', '222222', '333333', '444444',
        '555555', '666666', '777777', '888888', '999999',
        '012345', '123456', '234567', '345678', '456789',
        '567890', '654321', '543210', '432109', '987654',
    ];

    $activeCodes = [];
    foreach ($existingCodes as $c) {
        $st = $c['status'] ?? 'pending';
        if ($st === 'pending' || $st === 'in_progress') {
            $activeCodes[$c['code'] ?? ''] = true;
        }
    }

    $attempts = 0;
    do {
        $num = random_int(0, 999999);
        $candidate = sprintf('%06d', $num);
        $attempts++;
        if ($attempts > 500) {
            throw new RuntimeException('Không thể sinh mã đăng ký không trùng lặp.');
        }
    } while (
        in_array($candidate, $trivialList, true) ||
        isset($activeCodes[$candidate])
    );

    return $candidate;
}

/**
 * Create a new registration code for student
 */
function admin_student_registration_code_create(array $input, string $adminName = 'Super Admin'): array
{
    $studentName = trim((string) ($input['studentName'] ?? ''));
    if ($studentName === '') {
        throw new InvalidArgumentException('Họ và tên học viên là bắt buộc.');
    }

    $phone = trim((string) ($input['phone'] ?? ''));
    $email = trim((string) ($input['email'] ?? ''));
    $notes = trim((string) ($input['notes'] ?? ''));
    $assignedTo = trim((string) ($input['assignedTo'] ?? ''));
    $assignedStaffName = trim((string) ($input['assignedStaffName'] ?? ''));

    // Validity: default 72 hours (3 days)
    $validityHours = (int) ($input['validityHours'] ?? 72);
    if ($validityHours < 1 || $validityHours > 720) {
        $validityHours = 72;
    }

    $codes = admin_student_registration_codes_load();
    admin_student_registration_codes_housekeeping($codes);

    // Check if this student already has an active pending code with the same phone
    if ($phone !== '') {
        foreach ($codes as $existing) {
            if (($existing['phone'] ?? '') === $phone && in_array($existing['status'] ?? '', ['pending', 'in_progress'], true)) {
                throw new InvalidArgumentException("Học viên với số điện thoại {$phone} hiện đang có mã đăng ký còn hiệu lực ({$existing['code']}).");
            }
        }
    }

    $code = admin_student_registration_code_generate_unique($codes);
    $accessToken = bin2hex(random_bytes(32)); // 64 hex chars for secure QR link
    $now = date('c');
    $expiresAt = date('c', time() + ($validityHours * 3600));

    $id = 'src-' . date('ymd') . '-' . substr(bin2hex(random_bytes(4)), 0, 6);

    // Link to existing student profile if available
    $existingStudentId = '';
    $existingStudentCode = '';
    try {
        $allProfiles = admin_student_profiles_load_file();
        foreach ($allProfiles as &$p) {
            $pPhone = trim((string) ($p['phone'] ?? ''));
            $pName = trim((string) ($p['fullName'] ?? ''));
            if (($phone !== '' && $pPhone === $phone) || (mb_strtolower($pName) === mb_strtolower($studentName) && $phone !== '')) {
                $existingStudentId = (string) $p['id'];
                $existingStudentCode = (string) ($p['studentCode'] ?? '');
                $p['registrationCode'] = $code;
                $p['registrationCodeId'] = $id;
                $p['updatedAt'] = date('Y-m-d H:i:s');
                break;
            }
        }
        unset($p);
        if ($existingStudentId !== '') {
            admin_student_profiles_save_file($allProfiles);
        }
    } catch (Throwable) {}

    // Also check MySQL if not found in JSON
    if ($existingStudentId === '') {
        $database = admin_student_profiles_database();
        if ($database !== null) {
            try {
                $stmt = $database->prepare('SELECT id, student_code FROM student_profiles WHERE (phone = :phone AND phone != "") LIMIT 1');
                $stmt->execute(['phone' => $phone]);
                $row = $stmt->fetch();
                if ($row) {
                    $existingStudentId = (string) $row['id'];
                    $existingStudentCode = (string) $row['student_code'];
                }
            } catch (Throwable) {}
        }
    }

    if ($existingStudentId !== '') {
        $database = admin_student_profiles_database();
        if ($database !== null) {
            try {
                $upStmt = $database->prepare('UPDATE student_profiles SET registration_code = :code, updated_at = :up WHERE id = :id');
                $upStmt->execute(['code' => $code, 'up' => date('Y-m-d H:i:s'), 'id' => $existingStudentId]);
            } catch (Throwable) {}
        }
    }

    $record = [
        'id' => $id,
        'studentId' => $existingStudentId,
        'studentCode' => $existingStudentCode,
        'studentName' => $studentName,
        'phone' => $phone,
        'email' => $email,
        'notes' => $notes,
        'assignedTo' => $assignedTo,
        'assignedStaffName' => $assignedStaffName,
        'code' => $code,
        'codeHash' => hash('sha256', $code),
        'accessToken' => $accessToken,
        'status' => 'pending', // pending, in_progress, used, expired, revoked
        'progressStatus' => 'not_started', // not_started, filling, draft_saved, submitted, checking, need_info, approved
        'progressPercent' => 0,
        'draftData' => null,
        'currentStep' => 0,
        'lastDraftSavedAt' => null,
        'createdAt' => $now,
        'expiresAt' => $expiresAt,
        'createdBy' => $adminName,
        'verifiedAt' => null,
        'usedAt' => null,
        'revokedAt' => null,
        'revokedBy' => null,
        'revokeReason' => null,
        'reissuedFromId' => null,
        'reissuedToId' => null,
        'updatedAt' => $now,
    ];

    $codes[] = $record;
    admin_student_registration_codes_save($codes);

    // Record activity log
    admin_activity_log_create([
        'actorId' => 'admin',
        'actorName' => $adminName,
        'action' => 'student_registration_code_created',
        'actionLabel' => 'Cấp mã đăng ký học viên',
        'targetType' => 'student_code',
        'targetId' => $id,
        'targetLabel' => "Mã {$code} - {$studentName}",
        'details' => [
            'studentName' => $studentName,
            'phone' => $phone,
            'expiresAt' => $expiresAt,
        ],
    ]);

    return $record;
}

/**
 * Bulk create registration codes
 */
function admin_student_registration_code_bulk_create(array $studentsList, string $adminName = 'Super Admin'): array
{
    $created = [];
    $failed = [];

    $codes = admin_student_registration_codes_load();
    admin_student_registration_codes_housekeeping($codes);

    foreach ($studentsList as $index => $item) {
        $studentName = trim((string) ($item['studentName'] ?? ''));
        $phone = trim((string) ($item['phone'] ?? ''));
        $email = trim((string) ($item['email'] ?? ''));
        $notes = trim((string) ($item['notes'] ?? ''));
        $assignedTo = trim((string) ($item['assignedTo'] ?? ''));
        $assignedStaffName = trim((string) ($item['assignedStaffName'] ?? ''));

        if ($studentName === '') {
            $failed[] = [
                'index' => $index,
                'studentName' => $studentName,
                'phone' => $phone,
                'reason' => 'Thiếu họ tên học viên',
            ];
            continue;
        }

        // Check duplicate active phone
        $isDuplicate = false;
        if ($phone !== '') {
            foreach ($codes as $existing) {
                if (($existing['phone'] ?? '') === $phone && in_array($existing['status'] ?? '', ['pending', 'in_progress'], true)) {
                    $isDuplicate = true;
                    break;
                }
            }
        }

        if ($isDuplicate) {
            $failed[] = [
                'index' => $index,
                'studentName' => $studentName,
                'phone' => $phone,
                'reason' => "Đang có mã hiệu lực cho số điện thoại {$phone}",
            ];
            continue;
        }

        try {
            $code = admin_student_registration_code_generate_unique($codes);
            $accessToken = bin2hex(random_bytes(32));
            $now = date('c');
            $expiresAt = date('c', time() + (72 * 3600));
            $id = 'src-' . date('ymd') . '-' . substr(bin2hex(random_bytes(4)), 0, 6);

            $record = [
                'id' => $id,
                'studentId' => '',
                'studentName' => $studentName,
                'phone' => $phone,
                'email' => $email,
                'notes' => $notes,
                'assignedTo' => $assignedTo,
                'assignedStaffName' => $assignedStaffName,
                'code' => $code,
                'codeHash' => hash('sha256', $code),
                'accessToken' => $accessToken,
                'status' => 'pending',
                'progressStatus' => 'not_started',
                'progressPercent' => 0,
                'draftData' => null,
                'currentStep' => 0,
                'lastDraftSavedAt' => null,
                'createdAt' => $now,
                'expiresAt' => $expiresAt,
                'createdBy' => $adminName,
                'verifiedAt' => null,
                'usedAt' => null,
                'revokedAt' => null,
                'revokedBy' => null,
                'revokeReason' => null,
                'reissuedFromId' => null,
                'reissuedToId' => null,
                'updatedAt' => $now,
            ];

            $codes[] = $record;
            $created[] = $record;
        } catch (Throwable $e) {
            $failed[] = [
                'index' => $index,
                'studentName' => $studentName,
                'phone' => $phone,
                'reason' => $e->getMessage(),
            ];
        }
    }

    if (!empty($created)) {
        admin_student_registration_codes_save($codes);

        admin_activity_log_create([
            'actorId' => 'admin',
            'actorName' => $adminName,
            'action' => 'student_registration_code_bulk_created',
            'actionLabel' => 'Cấp mã đăng ký hàng loạt',
            'targetType' => 'student_code_bulk',
            'targetId' => 'bulk-' . count($created),
            'targetLabel' => "Đã tạo thành công " . count($created) . " mã",
            'details' => ['createdCount' => count($created), 'failedCount' => count($failed)],
        ]);
    }

    return [
        'createdCount' => count($created),
        'failedCount' => count($failed),
        'created' => $created,
        'failed' => $failed,
    ];
}

/**
 * Revoke an unused registration code
 */
function admin_student_registration_code_revoke(string $id, string $adminName = 'Super Admin', string $reason = 'Thu hồi bởi quản trị viên'): array
{
    $codes = admin_student_registration_codes_load();
    $found = false;
    $targetCode = null;

    foreach ($codes as &$c) {
        if (($c['id'] ?? '') === $id) {
            if (($c['status'] ?? '') === 'used') {
                throw new InvalidArgumentException('Không thể thu hồi mã đã hoàn thành nộp hồ sơ.');
            }
            if (($c['status'] ?? '') === 'revoked') {
                throw new InvalidArgumentException('Mã này đã bị thu hồi trước đó.');
            }

            $c['status'] = 'revoked';
            $c['revokedAt'] = date('c');
            $c['revokedBy'] = $adminName;
            $c['revokeReason'] = $reason;
            $c['updatedAt'] = date('c');

            $found = true;
            $targetCode = $c;
            break;
        }
    }
    unset($c);

    if (!$found || $targetCode === null) {
        throw new RuntimeException('Không tìm thấy mã đăng ký cần thu hồi.');
    }

    admin_student_registration_codes_save($codes);

    admin_activity_log_create([
        'actorId' => 'admin',
        'actorName' => $adminName,
        'action' => 'student_registration_code_revoked',
        'actionLabel' => 'Thu hồi mã đăng ký học viên',
        'targetType' => 'student_code',
        'targetId' => $id,
        'targetLabel' => "Mã {$targetCode['code']} - {$targetCode['studentName']}",
        'details' => ['reason' => $reason],
    ]);

    return $targetCode;
}

/**
 * Permanently delete a registration code
 */
function admin_student_registration_code_delete(string $id, string $adminName = 'Super Admin'): array
{
    $codes = admin_student_registration_codes_load();
    $foundIndex = -1;
    $targetCode = null;

    foreach ($codes as $idx => $c) {
        if (($c['id'] ?? '') === $id || ($c['code'] ?? '') === $id) {
            $foundIndex = $idx;
            $targetCode = $c;
            break;
        }
    }

    if ($foundIndex === -1 || $targetCode === null) {
        throw new RuntimeException('Không tìm thấy mã đăng ký cần xóa.');
    }

    array_splice($codes, $foundIndex, 1);
    admin_student_registration_codes_save($codes);

    // Save to audit log
    $logs = admin_student_registration_code_logs_load();
    $logs[] = [
        'id' => bin2hex(random_bytes(12)),
        'codeId' => $targetCode['id'],
        'code' => $targetCode['code'],
        'studentName' => $targetCode['studentName'] ?? '',
        'action' => 'delete',
        'actor' => $adminName,
        'details' => "Xóa vĩnh viễn mã đăng ký {$targetCode['code']} của học viên {$targetCode['studentName']}",
        'timestamp' => date('c'),
    ];
    admin_student_registration_code_logs_save($logs);

    if (function_exists('admin_activity_log_create')) {
        try {
            admin_activity_log_create([
                'actorId' => 'admin',
                'actorName' => $adminName,
                'action' => 'student_registration_code_deleted',
                'actionLabel' => 'Xóa mã đăng ký học viên',
                'targetType' => 'student_code',
                'targetId' => $targetCode['id'],
                'targetLabel' => "Mã {$targetCode['code']} - {$targetCode['studentName']}",
                'details' => ['deletedCode' => $targetCode['code']],
            ]);
        } catch (Throwable) {}
    }

    return $targetCode;
}

/**
 * Permanently delete multiple registration codes in bulk
 */
function admin_student_registration_code_bulk_delete(array $ids, string $adminName = 'Super Admin'): array
{
    $codes = admin_student_registration_codes_load();
    $idSet = array_flip(array_map('strval', $ids));
    $deletedCount = 0;
    $remaining = [];
    $deletedItems = [];

    foreach ($codes as $c) {
        $cId = (string) ($c['id'] ?? '');
        $cCode = (string) ($c['code'] ?? '');
        if (isset($idSet[$cId]) || isset($idSet[$cCode])) {
            $deletedCount++;
            $deletedItems[] = $c;
        } else {
            $remaining[] = $c;
        }
    }

    if ($deletedCount > 0) {
        admin_student_registration_codes_save($remaining);
        $logs = admin_student_registration_code_logs_load();
        foreach ($deletedItems as $item) {
            $logs[] = [
                'id' => bin2hex(random_bytes(12)),
                'codeId' => $item['id'],
                'code' => $item['code'],
                'studentName' => $item['studentName'] ?? '',
                'action' => 'delete',
                'actor' => $adminName,
                'details' => "Xóa mã đăng ký {$item['code']} của học viên {$item['studentName']}",
                'timestamp' => date('c'),
            ];
        }
        admin_student_registration_code_logs_save($logs);
    }

    return [
        'deletedCount' => $deletedCount,
        'deletedItems' => $deletedItems,
    ];
}

/**
 * Reissue a new code for an expired or revoked code
 */
function admin_student_registration_code_reissue(string $id, string $adminName = 'Super Admin'): array
{
    $codes = admin_student_registration_codes_load();
    admin_student_registration_codes_housekeeping($codes);

    $oldIndex = -1;
    foreach ($codes as $idx => $c) {
        if (($c['id'] ?? '') === $id) {
            $oldIndex = $idx;
            break;
        }
    }

    if ($oldIndex === -1) {
        throw new RuntimeException('Không tìm thấy mã đăng ký cần cấp lại.');
    }

    $oldRecord = $codes[$oldIndex];
    if (($oldRecord['status'] ?? '') === 'used') {
        throw new InvalidArgumentException('Học viên đã nộp hồ sơ thành công, không thể cấp lại mã mới để ghi đè.');
    }

    // Generate new code
    $newCode = admin_student_registration_code_generate_unique($codes);
    $accessToken = bin2hex(random_bytes(32));
    $now = date('c');
    $expiresAt = date('c', time() + (72 * 3600)); // fresh 3 days
    $newId = 'src-' . date('ymd') . '-' . substr(bin2hex(random_bytes(4)), 0, 6);

    $newRecord = [
        'id' => $newId,
        'studentId' => $oldRecord['studentId'] ?? '',
        'studentName' => $oldRecord['studentName'] ?? '',
        'phone' => $oldRecord['phone'] ?? '',
        'email' => $oldRecord['email'] ?? '',
        'notes' => $oldRecord['notes'] ?? '',
        'assignedTo' => $oldRecord['assignedTo'] ?? '',
        'assignedStaffName' => $oldRecord['assignedStaffName'] ?? '',
        'code' => $newCode,
        'codeHash' => hash('sha256', $newCode),
        'accessToken' => $accessToken,
        'status' => 'pending',
        'progressStatus' => ($oldRecord['progressStatus'] ?? '') === 'draft_saved' ? 'draft_saved' : 'not_started',
        'progressPercent' => (int) ($oldRecord['progressPercent'] ?? 0),
        'draftData' => $oldRecord['draftData'] ?? null,
        'currentStep' => (int) ($oldRecord['currentStep'] ?? 0),
        'lastDraftSavedAt' => $oldRecord['lastDraftSavedAt'] ?? null,
        'createdAt' => $now,
        'expiresAt' => $expiresAt,
        'createdBy' => $adminName,
        'verifiedAt' => null,
        'usedAt' => null,
        'revokedAt' => null,
        'revokedBy' => null,
        'revokeReason' => null,
        'reissuedFromId' => $id,
        'reissuedToId' => null,
        'updatedAt' => $now,
    ];

    // Mark old record as reissued
    $codes[$oldIndex]['reissuedToId'] = $newId;
    if ($codes[$oldIndex]['status'] === 'pending' || $codes[$oldIndex]['status'] === 'in_progress') {
        $codes[$oldIndex]['status'] = 'revoked';
        $codes[$oldIndex]['revokedAt'] = $now;
        $codes[$oldIndex]['revokedBy'] = $adminName;
        $codes[$oldIndex]['revokeReason'] = 'Được thay thế bằng mã cấp lại ' . $newCode;
    }
    $codes[$oldIndex]['updatedAt'] = $now;

    $codes[] = $newRecord;
    admin_student_registration_codes_save($codes);

    admin_activity_log_create([
        'actorId' => 'admin',
        'actorName' => $adminName,
        'action' => 'student_registration_code_reissued',
        'actionLabel' => 'Cấp lại mã đăng ký học viên',
        'targetType' => 'student_code',
        'targetId' => $newId,
        'targetLabel' => "Mã mới {$newCode} (cũ: {$oldRecord['code']}) - {$oldRecord['studentName']}",
        'details' => ['oldId' => $id, 'newId' => $newId],
    ]);

    return $newRecord;
}

/**
 * List registration codes with filtering & pagination
 */
function admin_student_registration_codes_list(array $filters = []): array
{
    $codes = admin_student_registration_codes_load();
    if (admin_student_registration_codes_housekeeping($codes)) {
        admin_student_registration_codes_save($codes);
    }

    $search = mb_strtolower(trim((string) ($filters['search'] ?? '')));
    $status = trim((string) ($filters['status'] ?? 'all'));
    $progressStatus = trim((string) ($filters['progressStatus'] ?? 'all'));
    $assignedTo = trim((string) ($filters['assignedTo'] ?? 'all'));
    $fromDate = trim((string) ($filters['from_date'] ?? ''));
    $toDate = trim((string) ($filters['to_date'] ?? ''));

    $page = max(1, (int) ($filters['page'] ?? 1));
    $pageSize = max(1, min(100, (int) ($filters['pageSize'] ?? 10)));

    $filtered = array_filter($codes, static function (array $c) use ($search, $status, $progressStatus, $assignedTo, $fromDate, $toDate): bool {
        if ($search !== '') {
            $name = mb_strtolower((string) ($c['studentName'] ?? ''));
            $phone = mb_strtolower((string) ($c['phone'] ?? ''));
            $code = mb_strtolower((string) ($c['code'] ?? ''));
            $creator = mb_strtolower((string) ($c['createdBy'] ?? ''));
            if (
                mb_strpos($name, $search) === false &&
                mb_strpos($phone, $search) === false &&
                mb_strpos($code, $search) === false &&
                mb_strpos($creator, $search) === false
            ) {
                return false;
            }
        }

        if ($status !== '' && $status !== 'all' && ($c['status'] ?? '') !== $status) {
            return false;
        }

        if ($progressStatus !== '' && $progressStatus !== 'all' && ($c['progressStatus'] ?? '') !== $progressStatus) {
            return false;
        }

        if ($assignedTo !== '' && $assignedTo !== 'all' && ($c['assignedTo'] ?? '') !== $assignedTo) {
            return false;
        }

        $createdAt = substr((string) ($c['createdAt'] ?? ''), 0, 10);
        if ($fromDate !== '' && $createdAt < $fromDate) {
            return false;
        }
        if ($toDate !== '' && $createdAt > $toDate) {
            return false;
        }

        return true;
    });

    // Sort by createdAt DESC
    usort($filtered, static function (array $a, array $b): int {
        return strcmp((string) ($b['createdAt'] ?? ''), (string) ($a['createdAt'] ?? ''));
    });

    $total = count($filtered);
    $totalPages = (int) ceil($total / $pageSize);
    $offset = ($page - 1) * $pageSize;
    $paged = array_slice($filtered, $offset, $pageSize);
    $normalized = array_map(static function (array $c): array {
        $verified = $c['verifiedAt'] ?? $c['firstUsedAt'] ?? null;
        $completed = $c['completedAt'] ?? $c['usedAt'] ?? $c['submittedAt'] ?? null;
        $c['verifiedAt'] = $verified;
        $c['firstUsedAt'] = $verified;
        $c['completedAt'] = $completed;
        $c['usedAt'] = $completed;
        return $c;
    }, $paged);

    return [
        'items' => array_values($normalized),
        'codes' => array_values($normalized),
        'total' => $total,
        'page' => $page,
        'pageSize' => $pageSize,
        'totalPages' => $totalPages,
    ];
}

/**
 * Stats KPI
 */
function admin_student_registration_codes_stats(): array
{
    $codes = admin_student_registration_codes_load();
    if (admin_student_registration_codes_housekeeping($codes)) {
        admin_student_registration_codes_save($codes);
    }

    $total = count($codes);
    $pending = 0;
    $inProgress = 0;
    $used = 0;
    $expired = 0;
    $revoked = 0;
    $expiringSoon = 0; // expires in < 24h and status in [pending, in_progress]

    $nowTime = time();
    $soonThreshold = $nowTime + (24 * 3600);

    foreach ($codes as $c) {
        $st = $c['status'] ?? 'pending';
        switch ($st) {
            case 'pending':
                $pending++;
                break;
            case 'in_progress':
                $inProgress++;
                break;
            case 'used':
                $used++;
                break;
            case 'expired':
                $expired++;
                break;
            case 'revoked':
                $revoked++;
                break;
        }

        if (in_array($st, ['pending', 'in_progress'], true)) {
            $expTime = strtotime($c['expiresAt'] ?? '');
            if ($expTime > $nowTime && $expTime <= $soonThreshold) {
                $expiringSoon++;
            }
        }
    }

    return [
        'total' => $total,
        'pending' => $pending,
        'inProgress' => $inProgress,
        'in_progress' => $inProgress,
        'used' => $used,
        'expiringSoon' => $expiringSoon,
        'expiring_soon' => $expiringSoon,
        'expired' => $expired,
        'revoked' => $revoked,
    ];
}

/**
 * Public: Verify Student 6-digit Code
 */
function student_registration_verify_code(string $code, string $ip): array
{
    $cleanCode = trim($code);
    if (!preg_match('/^\d{6}$/', $cleanCode)) {
        student_registration_log_attempt($ip, $cleanCode, 'invalid_format', 'Mã không đúng định dạng 6 số');
        return [
            'success' => false,
            'message' => 'Mã đăng ký phải gồm đúng 6 chữ số (ví dụ: 583921).',
        ];
    }

    $rateLimit = student_registration_check_rate_limit($ip);
    if (!($rateLimit['allowed'] ?? false)) {
        student_registration_log_attempt($ip, $cleanCode, 'rate_limited', 'Bị khóa do nhập sai nhiều lần');
        return [
            'success' => false,
            'message' => $rateLimit['message'],
            'rateLimited' => true,
            'remainingSeconds' => $rateLimit['remainingSeconds'] ?? 900,
        ];
    }

    $codes = admin_student_registration_codes_load();
    if (admin_student_registration_codes_housekeeping($codes)) {
        admin_student_registration_codes_save($codes);
    }

    $target = null;
    $targetIndex = -1;
    foreach ($codes as $idx => $c) {
        if (($c['code'] ?? '') === $cleanCode) {
            $target = $c;
            $targetIndex = $idx;
            break;
        }
    }

    if ($target === null || $targetIndex === -1) {
        student_registration_log_attempt($ip, $cleanCode, 'invalid_code', 'Mã không tồn tại trong hệ thống');
        return [
            'success' => false,
            'message' => 'Mã đăng ký không chính xác. Vui lòng kiểm tra lại hoặc liên hệ quản trị viên VieJap.',
        ];
    }

    $codeId = $target['id'] ?? '';
    $status = $target['status'] ?? 'pending';

    if ($status === 'revoked') {
        student_registration_log_attempt($ip, $cleanCode, 'revoked', 'Mã đã bị thu hồi', $codeId);
        return [
            'success' => false,
            'message' => 'Mã đăng ký này đã bị thu hồi. Vui lòng liên hệ cán bộ tuyển sinh VieJap để được cấp mã mới.',
        ];
    }

    if ($status === 'expired' || time() >= strtotime($target['expiresAt'] ?? '')) {
        student_registration_log_attempt($ip, $cleanCode, 'expired', 'Mã đã hết hạn 72h', $codeId);
        return [
            'success' => false,
            'message' => 'Mã đăng ký đã hết hạn (hiệu lực 72 giờ). Vui lòng liên hệ VieJap để được cấp lại mã mới.',
        ];
    }

    if ($status === 'used') {
        student_registration_log_attempt($ip, $cleanCode, 'already_used', 'Mã đã được dùng nộp hồ sơ', $codeId);
        return [
            'success' => false,
            'message' => 'Mã đăng ký này đã được sử dụng để nộp hồ sơ hoàn tất. Mỗi mã chỉ dùng một lần duy nhất.',
        ];
    }

    // Success! Update to in_progress if first time
    $now = date('c');
    $firstTime = false;
    if ($status === 'pending') {
        $codes[$targetIndex]['status'] = 'in_progress';
        $codes[$targetIndex]['verifiedAt'] = $now;
        $codes[$targetIndex]['progressStatus'] = 'filling';
        $codes[$targetIndex]['updatedAt'] = $now;
        admin_student_registration_codes_save($codes);
        $firstTime = true;
    }

    // Generate Session Token (signed/token string)
    $sessionToken = 'sess-' . bin2hex(random_bytes(24));
    $codes[$targetIndex]['sessionToken'] = $sessionToken;
    $codes[$targetIndex]['sessionExpiresAt'] = date('c', time() + (72 * 3600));
    admin_student_registration_codes_save($codes);

    student_registration_log_attempt($ip, $cleanCode, 'success', 'Xác thực thành công', $codeId);

    // If first time verification, send notification to admin
    if ($firstTime) {
        admin_notification_create([
            'title' => 'Học viên đã bắt đầu khai hồ sơ: ' . ($target['studentName'] ?? 'Học viên'),
            'message' => "Học viên {$target['studentName']} đã nhập mã xác thực {$target['code']} và bắt đầu khai sơ yếu lý lịch.",
            'event' => 'student_verified_code',
            'type' => 'info',
            'targetType' => 'student_code',
            'targetId' => $codeId,
            'actorName' => $target['studentName'] ?? 'Học viên',
        ]);
    }

    return [
        'success' => true,
        'message' => 'Xác thực mã thành công. Đang tải biểu mẫu khai thông tin...',
        'sessionToken' => $sessionToken,
        'codeId' => $codeId,
        'code' => $target['code'],
        'studentName' => $target['studentName'],
        'phone' => $target['phone'],
        'email' => $target['email'],
        'notes' => $target['notes'] ?? '',
        'expiresAt' => $target['expiresAt'],
        'progressStatus' => $codes[$targetIndex]['progressStatus'] ?? 'filling',
        'progressPercent' => (int) ($codes[$targetIndex]['progressPercent'] ?? 0),
        'currentStep' => (int) ($codes[$targetIndex]['currentStep'] ?? 0),
        'draftData' => $codes[$targetIndex]['draftData'] ?? null,
        'lastDraftSavedAt' => $codes[$targetIndex]['lastDraftSavedAt'] ?? null,
    ];
}

/**
 * Public: Verify Student QR Token
 */
function student_registration_verify_qr(string $token, string $ip): array
{
    $cleanToken = trim($token);
    if (strlen($cleanToken) < 16) {
        student_registration_log_attempt($ip, 'qr-token', 'invalid_token', 'Token QR quá ngắn');
        return [
            'success' => false,
            'message' => 'Mã QR không hợp lệ hoặc đã hết hạn.',
        ];
    }

    $codes = admin_student_registration_codes_load();
    if (admin_student_registration_codes_housekeeping($codes)) {
        admin_student_registration_codes_save($codes);
    }

    $target = null;
    $targetIndex = -1;
    foreach ($codes as $idx => $c) {
        if (($c['accessToken'] ?? '') === $cleanToken) {
            $target = $c;
            $targetIndex = $idx;
            break;
        }
    }

    if ($target === null) {
        student_registration_log_attempt($ip, 'qr-token', 'invalid_token', 'QR Token không tồn tại');
        return [
            'success' => false,
            'message' => 'Mã QR không hợp lệ hoặc đã bị thu hồi. Vui lòng liên hệ VieJap.',
        ];
    }

    return student_registration_verify_code($target['code'], $ip);
}

/**
 * Public: Save Draft
 */
function student_registration_save_draft(string $codeId, string $sessionToken, array $draftData, int $progressPercent, int $currentStep): array
{
    $codes = admin_student_registration_codes_load();
    $found = false;
    $now = date('c');

    foreach ($codes as &$c) {
        if (($c['id'] ?? '') === $codeId) {
            if (($c['sessionToken'] ?? '') !== $sessionToken) {
                throw new RuntimeException('Phiên làm việc không hợp lệ hoặc đã hết hạn.');
            }
            if (($c['status'] ?? '') === 'used') {
                throw new RuntimeException('Hồ sơ này đã được gửi hoàn tất, không thể lưu nháp thêm.');
            }

            $c['draftData'] = $draftData;
            $c['progressPercent'] = max(0, min(100, $progressPercent));
            $c['currentStep'] = max(0, min(4, $currentStep));
            $c['progressStatus'] = 'draft_saved';
            $c['lastDraftSavedAt'] = $now;
            $c['updatedAt'] = $now;

            $found = true;
            break;
        }
    }
    unset($c);

    if (!$found) {
        throw new RuntimeException('Không tìm thấy thông tin hồ sơ để lưu nháp.');
    }

    admin_student_registration_codes_save($codes);

    return [
        'success' => true,
        'message' => 'Đã lưu bản nháp an toàn lên hệ thống.',
        'lastDraftSavedAt' => $now,
        'progressPercent' => $progressPercent,
    ];
}

/**
 * Public: Get Draft
 */
function student_registration_get_draft(string $codeId, string $sessionToken): array
{
    $codes = admin_student_registration_codes_load();
    foreach ($codes as $c) {
        if (($c['id'] ?? '') === $codeId) {
            if (($c['sessionToken'] ?? '') !== $sessionToken) {
                throw new RuntimeException('Phiên làm việc không hợp lệ.');
            }
            return [
                'success' => true,
                'studentName' => $c['studentName'] ?? '',
                'phone' => $c['phone'] ?? '',
                'progressPercent' => (int) ($c['progressPercent'] ?? 0),
                'currentStep' => (int) ($c['currentStep'] ?? 0),
                'draftData' => $c['draftData'] ?? null,
                'lastDraftSavedAt' => $c['lastDraftSavedAt'] ?? null,
            ];
        }
    }
    throw new RuntimeException('Không tìm thấy bản nháp.');
}

/**
 * Public: Final Submission from Student Form
 */
function student_registration_submit(string $codeId, string $sessionToken, array $postData, array $filesData): array
{
    $codes = admin_student_registration_codes_load();
    $targetIndex = -1;
    foreach ($codes as $idx => $c) {
        if (($c['id'] ?? '') === $codeId) {
            $targetIndex = $idx;
            break;
        }
    }

    if ($targetIndex === -1) {
        throw new RuntimeException('Không tìm thấy thông tin mã đăng ký.');
    }

    $codeItem = $codes[$targetIndex];
    if (($codeItem['sessionToken'] ?? '') !== $sessionToken) {
        throw new RuntimeException('Phiên làm việc không hợp lệ hoặc đã hết hạn.');
    }

    if (($codeItem['status'] ?? '') === 'used') {
        throw new RuntimeException('Mã đăng ký này đã được sử dụng để nộp hồ sơ trước đó.');
    }

    // Save profile into existing student profiles system
    $now = date('c');
    $fullName = clean_text($postData['fullName'] ?? $codeItem['studentName'] ?? '', 120);
    $phone = clean_text($postData['phone'] ?? $codeItem['phone'] ?? '', 30);
    $idNumber = clean_text($postData['idNumber'] ?? '', 30);
    $birthDate = clean_text($postData['birthDate'] ?? '', 20);
    $address = clean_text($postData['address'] ?? '', 255);
    $progressPercent = isset($postData['progressPercent'])
        ? (int) $postData['progressPercent']
        : (isset($_POST['progressPercent']) ? (int) $_POST['progressPercent'] : (int) ($codeItem['progressPercent'] ?? 45));
    if ($progressPercent <= 0) $progressPercent = 45;

    // Decode full form data
    $formData = [];
    $rawFormData = $postData['data'] ?? ($_POST['data'] ?? null);
    if (is_string($rawFormData)) {
        $decoded = json_decode($rawFormData, true);
        if (is_array($decoded) && !empty($decoded)) {
            $formData = $decoded;
        }
    } elseif (is_array($rawFormData) && !empty($rawFormData)) {
        $formData = $rawFormData;
    }
    if (empty($formData) && !empty($codeItem['draftData']) && is_array($codeItem['draftData'])) {
        $formData = $codeItem['draftData'];
    }

    // Find target profile ID if one already exists across JSON and MySQL
    $existingStudentId = trim((string) ($codeItem['studentId'] ?? ''));
    $existingStudentCode = trim((string) ($codeItem['studentCode'] ?? ''));

    if ($existingStudentId === '') {
        $allProfiles = admin_student_profiles_load_file();
        foreach ($allProfiles as $p) {
            if ($phone !== '' && !empty($p['phone']) && $p['phone'] === $phone) {
                $existingStudentId = (string) $p['id'];
                $existingStudentCode = (string) ($p['studentCode'] ?? '');
                break;
            }
            if ($idNumber !== '' && !empty($p['idNumber']) && $p['idNumber'] === $idNumber) {
                $existingStudentId = (string) $p['id'];
                $existingStudentCode = (string) ($p['studentCode'] ?? '');
                break;
            }
            if (($p['registrationCode'] ?? '') === $codeItem['code']) {
                $existingStudentId = (string) $p['id'];
                $existingStudentCode = (string) ($p['studentCode'] ?? '');
                break;
            }
        }
    }

    if ($existingStudentId === '') {
        $database = admin_student_profiles_database();
        if ($database !== null) {
            try {
                $stmt = $database->prepare(
                    'SELECT id, student_code FROM student_profiles WHERE (phone = :p1 AND phone != "") OR (id_number = :p2 AND id_number != "") OR (registration_code = :p3 AND registration_code != "") LIMIT 1'
                );
                $stmt->execute([
                    'p1' => $phone,
                    'p2' => $idNumber,
                    'p3' => $codeItem['code'],
                ]);
                $dbRow = $stmt->fetch();
                if ($dbRow) {
                    $existingStudentId = (string) $dbRow['id'];
                    $existingStudentCode = (string) $dbRow['student_code'];
                }
            } catch (Throwable) {}
        }
    }

    $profileId = $existingStudentId !== '' ? $existingStudentId : admin_student_profile_generate_id();
    $studentCode = $existingStudentCode !== '' ? $existingStudentCode : admin_student_profile_generate_code();

    // Directory for files
    $studentDir = admin_student_files_directory($profileId);

    $savedFiles = [];

    // 1. Workbook Excel
    $wbUpload = $filesData['workbook'] ?? null;
    if (is_array($wbUpload) && ($wbUpload['error'] ?? -1) === UPLOAD_ERR_OK) {
        $safeWbName = 'HO_SO_' . $studentCode . '.xlsx';
        $wbPath = $studentDir . DIRECTORY_SEPARATOR . $safeWbName;
        move_uploaded_file($wbUpload['tmp_name'], $wbPath);
        $savedFiles[] = [
            'id' => admin_student_profile_generate_id(),
            'fileType' => 'excel',
            'version' => 1,
            'fileName' => $safeWbName,
            'filePath' => $wbPath,
            'fileSize' => (int) $wbUpload['size'],
            'mimeType' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'createdAt' => $now,
        ];
    }

    // 2. CV PDF (support both cv_pdf and cvPdf)
    $cvUpload = $filesData['cv_pdf'] ?? ($filesData['cvPdf'] ?? null);
    if (is_array($cvUpload) && ($cvUpload['error'] ?? -1) === UPLOAD_ERR_OK) {
        $safeCvName = 'CV_' . $studentCode . '.pdf';
        $cvPath = $studentDir . DIRECTORY_SEPARATOR . $safeCvName;
        move_uploaded_file($cvUpload['tmp_name'], $cvPath);
        $savedFiles[] = [
            'id' => admin_student_profile_generate_id(),
            'fileType' => 'pdf',
            'version' => 1,
            'fileName' => $safeCvName,
            'filePath' => $cvPath,
            'fileSize' => (int) $cvUpload['size'],
            'mimeType' => 'application/pdf',
            'createdAt' => $now,
        ];
    }

    // 3. Photo
    $phUpload = $filesData['photo'] ?? null;
    if (is_array($phUpload) && ($phUpload['error'] ?? -1) === UPLOAD_ERR_OK) {
        $ext = strtolower(pathinfo($phUpload['name'], PATHINFO_EXTENSION));
        if (!in_array($ext, ['jpg', 'jpeg', 'png', 'webp'], true)) $ext = 'jpg';
        $safePhotoName = 'PHOTO_' . $studentCode . '.' . $ext;
        $phPath = $studentDir . DIRECTORY_SEPARATOR . $safePhotoName;
        move_uploaded_file($phUpload['tmp_name'], $phPath);
        $savedFiles[] = [
            'id' => admin_student_profile_generate_id(),
            'fileType' => 'photo',
            'version' => 1,
            'fileName' => $safePhotoName,
            'filePath' => $phPath,
            'fileSize' => (int) $phUpload['size'],
            'mimeType' => $ext === 'jpg' || $ext === 'jpeg' ? 'image/jpeg' : 'image/png',
            'createdAt' => $now,
        ];
    }

    // 4. Document PDF (attached, support both document_pdf and documentPdf)
    $docUpload = $filesData['document_pdf'] ?? ($filesData['documentPdf'] ?? null);
    if (is_array($docUpload) && ($docUpload['error'] ?? -1) === UPLOAD_ERR_OK) {
        $safeDocName = 'TAI_LIEU_' . $studentCode . '.pdf';
        $docPath = $studentDir . DIRECTORY_SEPARATOR . $safeDocName;
        move_uploaded_file($docUpload['tmp_name'], $docPath);
        $savedFiles[] = [
            'id' => admin_student_profile_generate_id(),
            'fileType' => 'document',
            'version' => 1,
            'fileName' => $safeDocName,
            'filePath' => $docPath,
            'fileSize' => (int) $docUpload['size'],
            'mimeType' => 'application/pdf',
            'createdAt' => $now,
        ];
    }

    // Save profile using unified upsert logic
    $profilePayload = [
        'fullName' => $fullName,
        'birthDate' => $birthDate,
        'phone' => $phone,
        'idNumber' => $idNumber,
        'address' => $address,
        'progressPercent' => $progressPercent,
        'registrationCode' => $codeItem['code'],
        'registrationCodeId' => $codeId,
        'assignedTo' => $codeItem['assignedTo'] ?? '',
        'assignedStaffName' => $codeItem['assignedStaffName'] ?? '',
        'notes' => $codeItem['notes'] ?? '',
        'data' => $formData,
    ];

    $savedProfile = admin_student_profile_upsert_submission(
        $profileId,
        $profilePayload,
        $savedFiles,
        $fullName,
        "Nộp hồ sơ trực tuyến qua mã đăng ký {$codeItem['code']} (độ hoàn thiện: {$progressPercent}%)."
    );

    $profileId = (string) $savedProfile['id'];
    $studentCode = (string) $savedProfile['studentCode'];

    // Consume the registration code: mark as used & submitted
    $codes[$targetIndex]['status'] = 'used';
    $codes[$targetIndex]['usedAt'] = $now;
    $codes[$targetIndex]['completedAt'] = $now;
    $codes[$targetIndex]['submittedAt'] = $now;
    $codes[$targetIndex]['studentId'] = $profileId;
    $codes[$targetIndex]['studentCode'] = $studentCode;
    $codes[$targetIndex]['progressStatus'] = 'submitted';
    $codes[$targetIndex]['progressPercent'] = $progressPercent;
    $codes[$targetIndex]['updatedAt'] = $now;
    admin_student_registration_codes_save($codes);

    // Send Admin Notification
    try {
        admin_notification_create([
            'title' => "Hồ sơ mới từ học viên: {$fullName}",
            'message' => "Học viên {$fullName} ({$phone}) đã hoàn tất nộp hồ sơ qua mã đăng ký {$codeItem['code']}. Mã hồ sơ: {$studentCode}.",
            'event' => 'student_form_submitted',
            'eventType' => 'student.submitted',
            'category' => 'students',
            'type' => 'success',
            'targetType' => 'student',
            'targetId' => $profileId,
            'target' => [
                'type' => 'student',
                'id' => $profileId,
                'code' => $studentCode,
                'name' => $fullName,
                'url' => '/quan-tri-viejap?section=students&id=' . $profileId,
            ],
            'actorName' => $fullName,
            'priority' => 'high',
        ]);
    } catch (Throwable) {}

    // Send Activity Log
    try {
        admin_activity_log_create([
            'actorId' => 'student',
            'actorName' => $fullName,
            'action' => 'student_profile_submitted',
            'actionLabel' => 'Học viên nộp hồ sơ',
            'targetType' => 'student_profile',
            'targetId' => $profileId,
            'targetLabel' => "Hồ sơ {$studentCode} - {$fullName}",
            'details' => [
                'registrationCode' => $codeItem['code'],
                'phone' => $phone,
                'progressPercent' => $progressPercent,
                'filesCount' => count($savedFiles),
            ],
        ]);
    } catch (Throwable) {}

    return [
        'success' => true,
        'profileId' => $profileId,
        'studentCode' => $studentCode,
        'message' => "Hồ sơ học viên đã được tiếp nhận và lưu an toàn trong hệ thống VieJap. Mã hồ sơ của bạn là: {$studentCode}.",
    ];
}

/**
 * Admin: Generate a supplement code for an existing student profile
 */
function admin_student_registration_code_create_for_profile(string $profileId, string $actor = 'Admin'): array
{
    require_once __DIR__ . '/_student_profiles.php';
    $profile = admin_student_profile_find($profileId);
    if ($profile === null) {
        throw new RuntimeException('Không tìm thấy thông tin học viên để cấp mã.');
    }

    $codes = admin_student_registration_codes_load();
    $now = date('c');
    $codeId = 'src-' . date('ymd') . '-' . substr(bin2hex(random_bytes(3)), 0, 6);
    $code = admin_student_registration_code_generate_unique($codes);

    $codeRecord = [
        'id' => $codeId,
        'studentId' => $profileId,
        'studentCode' => $profile['studentCode'] ?? '',
        'studentName' => $profile['fullName'] ?? '',
        'phone' => $profile['phone'] ?? '',
        'email' => $profile['email'] ?? '',
        'notes' => 'Mã bổ sung / hoàn thiện hồ sơ cho học viên: ' . ($profile['fullName'] ?? ''),
        'assignedTo' => $profile['assignedTo'] ?? '',
        'assignedStaffName' => $profile['assignedStaffName'] ?? '',
        'code' => $code,
        'codeHash' => hash('sha256', $code),
        'accessToken' => bin2hex(random_bytes(32)),
        'status' => 'pending',
        'progressStatus' => 'draft_saved',
        'progressPercent' => (int) ($profile['progressPercent'] ?? 45),
        'draftData' => $profile['data'] ?? [],
        'currentStep' => 0,
        'type' => 'supplement',
        'createdAt' => $now,
        'expiresAt' => date('c', time() + (72 * 3600)),
        'createdBy' => $actor,
        'updatedAt' => $now,
    ];

    $codes[] = $codeRecord;
    admin_student_registration_codes_save($codes);

    // Update registrationCode in student profile
    $allProfiles = admin_student_profiles_load_file();
    foreach ($allProfiles as &$p) {
        if (($p['id'] ?? '') === $profileId) {
            $p['registrationCode'] = $code;
            $p['registrationCodeId'] = $codeId;
            $p['updatedAt'] = $now;
            $p['auditLogs'][] = [
                'id' => admin_student_profile_generate_id(),
                'action' => 'issued_supplement_code',
                'actor' => $actor,
                'details' => "Cán bộ đã cấp mã {$code} để học viên truy cập biểu mẫu bổ sung hồ sơ trực tuyến.",
                'createdAt' => $now,
            ];
            break;
        }
    }
    unset($p);
    admin_student_profiles_save_file($allProfiles);

    try {
        admin_activity_log_create([
            'actorName' => $actor,
            'actorRole' => 'Quản trị viên',
            'action' => 'Cấp mã bổ sung hồ sơ học viên: ' . ($profile['fullName'] ?? ''),
            'targetType' => 'student',
            'targetId' => $profileId,
            'targetName' => $profile['fullName'] ?? '',
            'details' => "Cấp mã xác thực {$code} cho học viên {$profile['fullName']} ({$profile['studentCode']}) để bổ sung hồ sơ.",
        ]);
    } catch (Throwable) {}

    return [
        'success' => true,
        'code' => $code,
        'codeId' => $codeId,
        'studentName' => $profile['fullName'] ?? '',
        'studentCode' => $profile['studentCode'] ?? '',
        'expiresAt' => $codeRecord['expiresAt'],
        'directUrl' => '/student-form?code=' . $code,
        'message' => "Đã cấp mã bổ sung hồ sơ {$code} thành công cho học viên {$profile['fullName']}.",
    ];
}

