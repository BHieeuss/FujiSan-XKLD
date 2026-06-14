<?php
declare(strict_types=1);

require_once __DIR__ . '/_bootstrap.php';

try {
    admin_require_method('GET');
    $session = admin_current_session();

    if ($session === null) {
        admin_respond(200, ['authenticated' => false]);
    }

    admin_respond(200, [
        'authenticated' => true,
        'username' => $session['username'],
        'csrfToken' => $session['csrfToken'],
    ]);
} catch (Throwable $error) {
    admin_handle_exception($error);
}
