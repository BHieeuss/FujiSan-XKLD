<?php
declare(strict_types=1);

require_once __DIR__ . '/_student_profiles.php';
require_once __DIR__ . '/_rbac.php';

try {
    $method = strtoupper((string) ($_SERVER['REQUEST_METHOD'] ?? 'GET'));
    $action = trim((string) ($_GET['action'] ?? ''));

    // 1. File Download Handler
    if ($method === 'GET' && $action === 'download-file') {
        $session = admin_require_session();
        admin_require_permission($session, 'profiles.download');
        $profileId = trim((string) ($_GET['profile_id'] ?? ''));
        $fileId = trim((string) ($_GET['file_id'] ?? ''));

        if ($profileId === '' || $fileId === '') {
            admin_respond(400, ['message' => 'Thiếu thông tin profile_id hoặc file_id.']);
        }

        $record = admin_student_profile_get_file_record($profileId, $fileId);
        if ($record === null) {
            admin_respond(404, ['message' => 'Không tìm thấy thông tin tài liệu.']);
        }

        $filePath = (string) ($record['file_path'] ?? $record['filePath'] ?? '');
        if (!is_file($filePath)) {
            admin_respond(404, ['message' => 'Tài liệu không còn tồn tại trên máy chủ.']);
        }

        $fileName = (string) ($record['file_name'] ?? $record['fileName'] ?? 'document');
        $mimeType = (string) ($record['mime_type'] ?? $record['mimeType'] ?? 'application/octet-stream');
        $fileSize = filesize($filePath);
        $isPreview = (($_GET['preview'] ?? '') === '1') || (($_GET['disposition'] ?? '') === 'inline');
        $disposition = $isPreview ? 'inline' : 'attachment';

        header_remove('X-Frame-Options');
        header_remove('Content-Security-Policy');
        header('X-Frame-Options: SAMEORIGIN');
        header('Content-Type: ' . $mimeType);
        header('Content-Length: ' . $fileSize);
        header('Content-Disposition: ' . $disposition . '; filename="' . rawurlencode($fileName) . '"; filename*=UTF-8\'\'' . rawurlencode($fileName));
        header('Cache-Control: private, no-cache, no-store, must-revalidate');
        header('Pragma: no-cache');
        readfile($filePath);
        exit;
    }

    // 2. GET Profile Detail or List
    if ($method === 'GET') {
        $session = admin_require_session();
        admin_require_permission($session, 'students.view');
        $id = trim((string) ($_GET['id'] ?? ''));

        if ($id !== '') {
            $profile = admin_student_profile_find($id);
            if ($profile === null) {
                admin_respond(404, ['message' => 'Không tìm thấy hồ sơ học viên.']);
            }
            admin_respond(200, ['profile' => $profile]);
        }

        $filters = [
            'search' => trim((string) ($_GET['search'] ?? '')),
            'status' => trim((string) ($_GET['status'] ?? 'all')),
            'from_date' => trim((string) ($_GET['from_date'] ?? '')),
            'to_date' => trim((string) ($_GET['to_date'] ?? '')),
            'sort' => trim((string) ($_GET['sort'] ?? 'newest')),
        ];

        $page = max(1, (int) ($_GET['page'] ?? 1));
        $limit = max(1, min(100, (int) ($_GET['limit'] ?? 10)));
        $allProfiles = admin_student_profiles_list($filters);
        $total = count($allProfiles);
        $totalPages = max(1, (int) ceil($total / $limit));
        $offset = ($page - 1) * $limit;
        $pagedProfiles = array_slice($allProfiles, $offset, $limit);

        admin_respond(200, [
            'profiles' => $pagedProfiles,
            'total' => $total,
            'page' => $page,
            'limit' => $limit,
            'totalPages' => $totalPages,
            'trashCount' => admin_student_profiles_trash_count(),
        ]);
    }

    // 3. POST Re-exported Excel Version
    if ($method === 'POST' && $action === 'upload-excel-version') {
        admin_assert_same_origin();
        $session = admin_require_session();
        admin_require_csrf($session);
        admin_require_permission($session, 'profiles.update');

        $profileId = trim((string) ($_GET['id'] ?? $_POST['id'] ?? ''));
        if ($profileId === '') {
            admin_respond(422, ['message' => 'Thiếu ID học viên.']);
        }

        $profile = admin_student_profile_find($profileId);
        if ($profile === null) {
            admin_respond(404, ['message' => 'Không tìm thấy hồ sơ học viên.']);
        }

        if (!isset($_FILES['workbook']) || !is_array($_FILES['workbook'])) {
            admin_respond(422, ['message' => 'Không tìm thấy file Excel tải lên.']);
        }

        $upload = $_FILES['workbook'];
        if (($upload['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK) {
            admin_respond(422, ['message' => 'File Excel tải lên bị lỗi.']);
        }

        $tmpPath = (string) ($upload['tmp_name'] ?? '');
        $fileSize = (int) ($upload['size'] ?? 0);
        if ($fileSize < 1 || !is_uploaded_file($tmpPath)) {
            admin_respond(422, ['message' => 'File tải lên không hợp lệ.']);
        }

        // Calculate next version
        $maxVer = 0;
        foreach ($profile['files'] ?? [] as $f) {
            if (($f['fileType'] ?? '') === 'excel') {
                $maxVer = max($maxVer, (int) ($f['version'] ?? 1));
            }
        }
        $nextVer = $maxVer + 1;

        $safeName = preg_replace('/[^a-zA-Z0-9]+/', '_', strtoupper(iconv('UTF-8', 'ASCII//TRANSLIT//IGNORE', $profile['fullName'])));
        $safeName = trim((string) $safeName, '_') ?: 'HOC_VIEN';
        $targetFileName = sprintf('SO_YEU_LY_LICH_%s_v%d.xlsx', $safeName, $nextVer);

        $dir = admin_student_files_directory($profileId);
        $targetPath = $dir . DIRECTORY_SEPARATOR . $targetFileName;

        if (!move_uploaded_file($tmpPath, $targetPath)) {
            admin_respond(500, ['message' => 'Không thể lưu file Excel phiên bản mới trên máy chủ.']);
        }

        $updated = admin_student_profile_add_file_version(
            $profileId,
            'excel',
            $targetFileName,
            $targetPath,
            $fileSize,
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            $session['username']
        );

        admin_respond(200, [
            'message' => "Đã lưu thành công phiên bản Excel v{$nextVer}.",
            'profile' => $updated,
            'newVersion' => $nextVer,
            'fileName' => $targetFileName,
        ]);
    }

    // 3b. POST Upload Photo or Additional Document
    if ($method === 'POST' && $action === 'upload-file') {
        admin_assert_same_origin();
        $session = admin_require_session();
        admin_require_csrf($session);
        admin_require_permission($session, 'students.update');

        $profileId = trim((string) ($_GET['id'] ?? $_POST['id'] ?? ''));
        if ($profileId === '') {
            admin_respond(422, ['message' => 'Thiếu ID học viên.']);
        }

        $profile = admin_student_profile_find($profileId);
        if ($profile === null) {
            admin_respond(404, ['message' => 'Không tìm thấy hồ sơ học viên.']);
        }

        if (!isset($_FILES['file']) || !is_array($_FILES['file'])) {
            admin_respond(422, ['message' => 'Không tìm thấy file tải lên.']);
        }

        $upload = $_FILES['file'];
        if (($upload['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK) {
            admin_respond(422, ['message' => 'File tải lên bị lỗi hoặc kích thước quá giới hạn.']);
        }

        $tmpPath = (string) ($upload['tmp_name'] ?? '');
        $fileSize = (int) ($upload['size'] ?? 0);
        if ($fileSize < 1 || !is_uploaded_file($tmpPath)) {
            admin_respond(422, ['message' => 'File tải lên không hợp lệ.']);
        }

        $fileType = trim((string) ($_POST['fileType'] ?? 'document'));
        if (!in_array($fileType, ['photo', 'document', 'pdf'], true)) {
            $fileType = 'document';
        }

        $originalName = (string) ($upload['name'] ?? 'file');
        $ext = strtolower(pathinfo($originalName, PATHINFO_EXTENSION));

        $safeName = preg_replace('/[^a-zA-Z0-9]+/', '_', strtoupper(iconv('UTF-8', 'ASCII//TRANSLIT//IGNORE', $profile['fullName'])));
        $safeName = trim((string) $safeName, '_') ?: 'HOC_VIEN';

        // Calculate next version
        $maxVer = 0;
        foreach ($profile['files'] ?? [] as $f) {
            if (($f['fileType'] ?? '') === $fileType) {
                $maxVer = max($maxVer, (int) ($f['version'] ?? 1));
            }
        }
        $nextVer = $maxVer + 1;

        if ($fileType === 'photo') {
            $targetFileName = sprintf('ANH_THE_%s_v%d.%s', $safeName, $nextVer, $ext ?: 'png');
            $mimeType = $ext === 'jpg' || $ext === 'jpeg' ? 'image/jpeg' : 'image/png';
        } else {
            $targetFileName = sprintf('TAI_LIEU_%s_v%d.%s', $safeName, $nextVer, $ext ?: 'pdf');
            $mimeType = $ext === 'pdf' ? 'application/pdf' : 'application/octet-stream';
        }

        $dir = admin_student_files_directory($profileId);
        $targetPath = $dir . DIRECTORY_SEPARATOR . $targetFileName;

        if (!move_uploaded_file($tmpPath, $targetPath)) {
            admin_respond(500, ['message' => 'Không thể lưu file trên máy chủ.']);
        }

        $updated = admin_student_profile_add_file_version(
            $profileId,
            $fileType === 'photo' ? 'photo' : 'document',
            $targetFileName,
            $targetPath,
            $fileSize,
            $mimeType,
            $session['username']
        );

        admin_respond(200, [
            'message' => 'Đã tải lên tệp mới thành công.',
            'profile' => $updated,
            'fileName' => $targetFileName,
        ]);
    }

    // 3b2. POST or DELETE Delete File (Photo or Document)
    if (($method === 'POST' || $method === 'DELETE') && $action === 'delete-file') {
        admin_assert_same_origin();
        $session = admin_require_session();
        admin_require_csrf($session);
        admin_require_permission($session, 'students.update');

        $payload = $method === 'POST' ? admin_read_json() : [];
        $profileId = trim((string) ($_GET['profile_id'] ?? $_GET['id'] ?? $payload['profileId'] ?? $payload['profile_id'] ?? $payload['id'] ?? ''));
        $fileId = trim((string) ($_GET['file_id'] ?? $payload['fileId'] ?? $payload['file_id'] ?? ''));

        if ($profileId === '' || $fileId === '') {
            admin_respond(422, ['message' => 'Thiếu thông tin profile_id hoặc file_id cần xóa.']);
        }

        $updated = admin_student_profile_delete_file($profileId, $fileId, $session['username']);
        if ($updated === null) {
            admin_respond(404, ['message' => 'Không tìm thấy hồ sơ hoặc tệp tin cần xóa.']);
        }

        admin_respond(200, [
            'message' => 'Đã xóa tệp tin thành công.',
            'profile' => $updated,
        ]);
    }

    // 3c. POST Move to Trash
    if ($method === 'POST' && $action === 'trash') {
        admin_assert_same_origin();
        $session = admin_require_session();
        admin_require_csrf($session);
        admin_require_permission($session, 'students.delete');

        $payload = admin_read_json();
        $id = trim((string) ($_GET['id'] ?? $payload['id'] ?? ''));
        if ($id === '') {
            admin_respond(422, ['message' => 'Thiếu ID học viên cần chuyển vào thùng rác.']);
        }

        $success = admin_student_profile_move_to_trash($id, $session['username']);
        if (!$success) {
            admin_respond(404, ['message' => 'Không tìm thấy hồ sơ học viên.']);
        }

        admin_respond(200, [
            'message' => 'Đã chuyển hồ sơ học viên vào thùng rác. Hệ thống sẽ tự động xóa vĩnh viễn sau 30 ngày.',
            'trashCount' => admin_student_profiles_trash_count(),
        ]);
    }

    // 3d. POST Restore from Trash
    if ($method === 'POST' && $action === 'restore') {
        admin_assert_same_origin();
        $session = admin_require_session();
        admin_require_csrf($session);
        admin_require_permission($session, 'students.restore');

        $payload = admin_read_json();
        $id = trim((string) ($_GET['id'] ?? $payload['id'] ?? ''));
        if ($id === '') {
            admin_respond(422, ['message' => 'Thiếu ID học viên cần khôi phục.']);
        }

        $restored = admin_student_profile_restore($id, $session['username']);
        if ($restored === null) {
            admin_respond(404, ['message' => 'Không tìm thấy hồ sơ học viên trong thùng rác.']);
        }

        admin_respond(200, [
            'message' => 'Đã khôi phục hồ sơ học viên thành công.',
            'profile' => $restored,
            'trashCount' => admin_student_profiles_trash_count(),
        ]);
    }

    // 3e. POST Permanently Delete
    if ($method === 'POST' && $action === 'delete-permanent') {
        admin_assert_same_origin();
        $session = admin_require_session();
        admin_require_csrf($session);
        admin_require_permission($session, 'students.delete');

        $payload = admin_read_json();
        $id = trim((string) ($_GET['id'] ?? $payload['id'] ?? ''));
        if ($id === '') {
            admin_respond(422, ['message' => 'Thiếu ID học viên cần xóa vĩnh viễn.']);
        }

        $success = admin_student_profile_delete_permanent($id, $session['username']);
        if (!$success) {
            admin_respond(404, ['message' => 'Không tìm thấy hồ sơ học viên.']);
        }

        admin_respond(200, [
            'message' => 'Đã xóa vĩnh viễn hồ sơ học viên khỏi máy chủ.',
            'trashCount' => admin_student_profiles_trash_count(),
        ]);
    }

    // 3f. POST Empty Trash
    if ($method === 'POST' && $action === 'empty-trash') {
        admin_assert_same_origin();
        $session = admin_require_session();
        admin_require_csrf($session);
        admin_require_permission($session, 'students.delete');

        $deletedCount = admin_student_profiles_empty_trash($session['username']);
        admin_respond(200, [
            'message' => "Đã dọn sạch thùng rác ({$deletedCount} hồ sơ đã được xóa vĩnh viễn).",
            'deletedCount' => $deletedCount,
            'trashCount' => 0,
        ]);
    }

    // 3g. POST Create Supplement Code for Student Profile
    if ($method === 'POST' && $action === 'create-supplement-code') {
        admin_assert_same_origin();
        $session = admin_require_session();
        admin_require_csrf($session);
        admin_require_permission($session, 'students.update');

        $payload = admin_read_json();
        $profileId = trim((string) ($_GET['id'] ?? $payload['profileId'] ?? $payload['id'] ?? ''));
        if ($profileId === '') {
            admin_respond(422, ['message' => 'Thiếu ID học viên để cấp mã bổ sung.']);
        }

        require_once __DIR__ . '/_student_registration_codes.php';
        $res = admin_student_registration_code_create_for_profile($profileId, $session['username']);
        admin_respond(200, $res);
    }

    // 4. PUT / PATCH Update Profile Info & Status
    if (in_array($method, ['PUT', 'PATCH'], true)) {
        admin_assert_same_origin();
        $session = admin_require_session();
        admin_require_csrf($session);
        admin_require_permission($session, 'students.update');

        $id = trim((string) ($_GET['id'] ?? ''));
        $payload = admin_read_json();
        if ($id === '') {
            $id = trim((string) ($payload['id'] ?? ''));
        }

        if ($id === '') {
            admin_respond(422, ['message' => 'Thiếu ID học viên cần cập nhật.']);
        }

        $updated = admin_student_profile_update($id, $payload, $session['username']);
        if ($updated === null) {
            admin_respond(404, ['message' => 'Không tìm thấy hồ sơ học viên.']);
        }

        admin_respond(200, [
            'message' => 'Đã cập nhật thông tin hồ sơ học viên.',
            'profile' => $updated,
        ]);
    }

    // 5. DELETE Handler
    if ($method === 'DELETE') {
        admin_assert_same_origin();
        $session = admin_require_session();
        admin_require_csrf($session);
        admin_require_permission($session, 'students.delete');

        $id = trim((string) ($_GET['id'] ?? ''));
        $permanent = (($_GET['permanent'] ?? '') === '1') || ($action === 'delete-permanent');
        if ($id === '') {
            admin_respond(422, ['message' => 'Thiếu ID học viên cần xóa.']);
        }

        if ($permanent) {
            $success = admin_student_profile_delete_permanent($id, $session['username']);
            if (!$success) {
                admin_respond(404, ['message' => 'Không tìm thấy hồ sơ học viên.']);
            }
            admin_respond(200, [
                'message' => 'Đã xóa vĩnh viễn hồ sơ học viên khỏi máy chủ.',
                'trashCount' => admin_student_profiles_trash_count(),
            ]);
        } else {
            $success = admin_student_profile_move_to_trash($id, $session['username']);
            if (!$success) {
                admin_respond(404, ['message' => 'Không tìm thấy hồ sơ học viên.']);
            }
            admin_respond(200, [
                'message' => 'Đã chuyển hồ sơ học viên vào thùng rác. Hệ thống sẽ tự động xóa sau 30 ngày.',
                'trashCount' => admin_student_profiles_trash_count(),
            ]);
        }
    }

    header('Allow: GET, POST, PUT, PATCH, DELETE');
    admin_respond(405, ['message' => 'Phương thức không được hỗ trợ.']);
} catch (Throwable $error) {
    admin_handle_exception($error);
}
