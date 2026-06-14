<?php
declare(strict_types=1);

require_once __DIR__ . '/_bootstrap.php';

try {
    admin_require_method('POST');
    admin_assert_same_origin();
    $session = admin_require_session();
    admin_require_csrf($session);
    admin_destroy_session();
    admin_respond(200, ['authenticated' => false]);
} catch (Throwable $error) {
    admin_handle_exception($error);
}
