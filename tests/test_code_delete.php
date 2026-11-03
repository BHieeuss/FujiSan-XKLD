<?php
declare(strict_types=1);

require_once __DIR__ . '/../public/api/admin/_student_registration_codes.php';

$testInput = [
    'studentName' => 'Học viên Test Xóa Tự Động',
    'phone' => '0987654321',
    'email' => 'test_del@example.com',
    'notes' => 'Test delete'
];

$created = admin_student_registration_code_create($testInput, 'Super Admin');
echo "1. Created code: {$created['code']} (ID: {$created['id']})\n";

$deleted = admin_student_registration_code_delete($created['id'], 'Super Admin');
echo "2. Deleted code: {$deleted['code']}\n";

$codes = admin_student_registration_codes_load();
$found = false;
foreach ($codes as $c) {
    if ($c['id'] === $created['id']) {
        $found = true;
        break;
    }
}

echo "3. Code exists after delete: " . ($found ? "YES (FAILED)" : "NO (SUCCESS)") . "\n";

if (!$found) {
    echo "\n=> REGISTRATION CODE DELETION TEST: 100% PASS\n";
    exit(0);
} else {
    echo "\n=> REGISTRATION CODE DELETION TEST: FAILED\n";
    exit(1);
}

