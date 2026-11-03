<?php
declare(strict_types=1);

/**
 * VieJap RBAC Compliance Audit Script
 * Verifies that all admin endpoints and permissions comply with AGENTS.md standards.
 */

$baseDir = dirname(__DIR__);
$rbacFile = $baseDir . '/public/api/admin/_rbac.php';

if (!file_exists($rbacFile)) {
    echo "[FAIL] RBAC file not found: {$rbacFile}\n";
    exit(1);
}

// Suppress header/session output during CLI audit
@require_once $rbacFile;

echo "========================================================\n";
echo "   VIEJAP RBAC & PERMISSION COMPLIANCE AUDIT\n";
echo "========================================================\n\n";

if (!function_exists('admin_permission_registry')) {
    echo "[FAIL] admin_permission_registry() function does not exist.\n";
    exit(1);
}

$registry = admin_permission_registry();
if (!is_array($registry) || empty($registry)) {
    echo "[FAIL] admin_permission_registry() returned empty or non-array.\n";
    exit(1);
}

$permissionKeys = [];
$missingFieldsCount = 0;
foreach ($registry as $perm) {
    if (!isset($perm['key'], $perm['name'], $perm['module'], $perm['action'])) {
        $missingFieldsCount++;
        echo "[WARN] Incomplete permission definition: " . json_encode($perm, JSON_UNESCAPED_UNICODE) . "\n";
    } else {
        $permissionKeys[$perm['key']] = $perm;
    }
}

echo "[PASS] Permission Registry: " . count($permissionKeys) . " valid permissions registered.\n";

// Audit Admin API files to ensure required permissions are registered
$adminApiDir = $baseDir . '/public/api/admin';
$apiFiles = glob($adminApiDir . '/*.php');
$unregisteredCalls = [];
$auditedFiles = 0;

foreach ($apiFiles as $file) {
    $filename = basename($file);
    if (str_starts_with($filename, '_')) {
        continue; // skip library files
    }
    $auditedFiles++;
    $content = file_get_contents($file);
    
    // Check for admin_require_permission calls
    if (preg_match_all("/admin_require_permission\s*\([^,]+,\s*'([^']+)'\)/", $content, $matches)) {
        foreach ($matches[1] as $calledKey) {
            if (!isset($permissionKeys[$calledKey])) {
                $unregisteredCalls[] = "{$filename} calls unregistered permission: '{$calledKey}'";
            }
        }
    }
}

echo "[PASS] Audited {$auditedFiles} admin API files.\n";

if (!empty($unregisteredCalls)) {
    echo "[FAIL] Found unregistered permissions used in code:\n";
    foreach ($unregisteredCalls as $err) {
        echo "  - {$err}\n";
    }
    exit(1);
}

echo "[PASS] All admin_require_permission() calls match registered permissions.\n";

// Audit orders.delete specifically
if (!isset($permissionKeys['orders.delete'])) {
    echo "[FAIL] 'orders.delete' permission is not in the registry!\n";
    exit(1);
}
echo "[PASS] 'orders.delete' is present in RBAC registry.\n";

echo "\n--------------------------------------------------------\n";
echo "RESULT: 100% PASS - ALL RBAC COMPLIANCE CHECKS SUCCEEDED\n";
echo "--------------------------------------------------------\n";
exit(0);
