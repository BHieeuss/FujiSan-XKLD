<?php
declare(strict_types=1);

require_once __DIR__ . '/_bootstrap.php';
require_once __DIR__ . '/_rbac.php';

function admin_events_file(): string
{
    $dir = admin_storage_directory();
    return $dir . DIRECTORY_SEPARATOR . 'events.json';
}

function admin_events_categories(): array
{
    return [
        ['id' => 'activities', 'name' => 'Hoạt động VieJap', 'icon' => 'fas fa-newspaper', 'color' => '#2563eb'],
        ['id' => 'recruitment', 'name' => 'Tuyển dụng', 'icon' => 'fas fa-briefcase', 'color' => '#059669'],
        ['id' => 'workshop', 'name' => 'Hội thảo & Tư vấn', 'icon' => 'fas fa-comments', 'color' => '#d97706'],
        ['id' => 'training', 'name' => 'Khai giảng & Đào tạo', 'icon' => 'fas fa-graduation-cap', 'color' => '#7c3aed'],
        ['id' => 'announcement', 'name' => 'Thông báo', 'icon' => 'fas fa-bullhorn', 'color' => '#dc2626'],
        ['id' => 'special', 'name' => 'Sự kiện đặc biệt', 'icon' => 'fas fa-star', 'color' => '#e11d48'],
    ];
}

function admin_events_default_seed(): array
{
    $now = date('c');
    $nextMonth = date('c', strtotime('+30 days'));
    $nextYear = date('c', strtotime('+90 days'));
    $pastWeek = date('c', strtotime('-7 days'));

    return [
        [
            'id' => 'evt-tokutei-seminar-2026',
            'code' => 'SK-2026-001',
            'title' => 'Hội thảo Lộ trình Kỹ năng đặc định Tokutei 2026',
            'displayTitle' => '🔥 Hội Thảo Trực Tuyến: Cơ Hội Việc Làm Tokutei Thu Nhập Cao Tại Nhật Bản',
            'category' => 'workshop',
            'categoryName' => 'Hội thảo & Tư vấn',
            'summary' => 'Giải đáp trực tiếp chính sách visa Tokutei Ginou mới nhất, chế độ đãi ngộ và phỏng vấn trực tiếp cùng nghiệp đoàn Nhật.',
            'content' => 'VieJap trân trọng kính mời các bạn thực tập sinh và ứng viên tham dự buổi hội thảo trực tuyến độc quyền. Cơ hội tiếp cận hơn 50 đơn hàng Tokutei ngành Chế biến thực phẩm, Cơ khí và Khách sạn với mức lương từ 20 - 28 man/tháng.',
            'coverImage' => 'assets/images/HoatDong/HoiThaoKetNoiThuongMaiNhatBanVietNamTokyo/z8133501619094_4779c4fedee3319d35993e9d8245e39e.jpg',
            'bannerImage' => 'assets/images/HoatDong/HoiThaoKetNoiThuongMaiNhatBanVietNamTokyo/z8133501619094_4779c4fedee3319d35993e9d8245e39e.jpg',
            'gallery' => [],
            'activityId' => 'act-tokyo-conference-2026',
            'linkToActivity' => true,
            'displayFormats' => ['popup_center', 'index_banner', 'floating_button', 'list'],
            'displayConfig' => [
                'topBar' => [
                    'bgColor' => '#0f2b48',
                    'textColor' => '#ffffff',
                    'icon' => 'fas fa-bullhorn',
                    'isClosable' => true,
                ],
                'popupCenter' => [
                    'layout' => 'banner_top',
                    'autoCloseSeconds' => 0,
                    'backdropClickClose' => true,
                ],
                'popupCorner' => [
                    'position' => 'bottom_right',
                    'autoMinimize' => false,
                ],
                'indexBanner' => [
                    'position' => 'below_hero',
                    'style' => 'highlight',
                ],
            ],
            'cta' => [
                'enabled' => true,
                'actionType' => 'register',
                'label' => 'Đăng ký nhận vé mời miễn phí',
                'url' => '/#lien-he',
                'target' => '_self',
            ],
            'schedule' => [
                'startDate' => $pastWeek,
                'endDate' => $nextYear,
                'timezone' => 'Asia/Ho_Chi_Minh',
                'autoPublish' => true,
                'autoEnd' => true,
            ],
            'targeting' => [
                'pages' => ['all'],
                'userAudience' => 'all',
            ],
            'delivery' => [
                'priorityLevel' => 'high',
                'priorityOrder' => 1,
                'frequency' => 'per_session',
            ],
            'status' => 'published',
            'analytics' => [
                'views' => 2480,
                'clicks' => 342,
                'dismisses' => 89,
                'byFormat' => [
                    'popup_center' => ['views' => 1250, 'clicks' => 180],
                    'index_banner' => ['views' => 920, 'clicks' => 124],
                    'floating_button' => ['views' => 310, 'clicks' => 38],
                ],
            ],
            'createdBy' => 'admin',
            'createdByName' => 'Quản trị viên',
            'createdAt' => date('c', strtotime('-10 days')),
            'updatedAt' => $now,
            'publishedAt' => date('c', strtotime('-9 days')),
        ],
        [
            'id' => 'evt-japanese-class-opening-2026',
            'code' => 'SK-2026-002',
            'title' => 'Khai giảng Khóa đào tạo Tiếng Nhật Xuất khẩu N5 - N4',
            'displayTitle' => '🌸 Khai Giảng Khóa Tiếng Nhật Chuẩn Tokyo Khóa 26 - Ưu Đãi 100% Giáo Trình',
            'category' => 'training',
            'categoryName' => 'Khai giảng & Đào tạo',
            'summary' => 'Lớp học trực tiếp tại Trung tâm VieJap cùng giáo viên bản xứ, cam kết đầu ra N4 và rèn luyện tác phong chuẩn Nhật Bản.',
            'content' => 'Khóa học được thiết kế tối ưu riêng cho học viên đi xuất khẩu lao động và Tokutei. Hỗ trợ ký túc xá tiện nghi, học phản xạ 1:1 và luyện chia 12 thể động từ chuyên sâu.',
            'coverImage' => 'assets/images/HoatDong/24DiemTruongTHPTSOCTRANG/3.jpg',
            'bannerImage' => 'assets/images/HoatDong/24DiemTruongTHPTSOCTRANG/3.jpg',
            'gallery' => [],
            'activityId' => '',
            'linkToActivity' => false,
            'displayFormats' => ['top_bar', 'popup_corner', 'floating_button', 'list'],
            'displayConfig' => [
                'topBar' => [
                    'bgColor' => '#1e3a8a',
                    'textColor' => '#ffffff',
                    'icon' => 'fas fa-graduation-cap',
                    'isClosable' => true,
                ],
                'popupCenter' => [
                    'layout' => 'horizontal',
                    'autoCloseSeconds' => 0,
                    'backdropClickClose' => true,
                ],
                'popupCorner' => [
                    'position' => 'bottom_right',
                    'autoMinimize' => true,
                ],
                'indexBanner' => [
                    'position' => 'in_activities',
                    'style' => 'navy',
                ],
            ],
            'cta' => [
                'enabled' => true,
                'actionType' => 'consultation',
                'label' => 'Nhận lịch học & Học bổng',
                'url' => '/hoc-minna-bai-1',
                'target' => '_self',
            ],
            'schedule' => [
                'startDate' => $pastWeek,
                'endDate' => $nextMonth,
                'timezone' => 'Asia/Ho_Chi_Minh',
                'autoPublish' => true,
                'autoEnd' => true,
            ],
            'targeting' => [
                'pages' => ['all'],
                'userAudience' => 'all',
            ],
            'delivery' => [
                'priorityLevel' => 'normal',
                'priorityOrder' => 2,
                'frequency' => 'per_day',
            ],
            'status' => 'published',
            'analytics' => [
                'views' => 1820,
                'clicks' => 215,
                'dismisses' => 45,
                'byFormat' => [
                    'top_bar' => ['views' => 1400, 'clicks' => 165],
                    'popup_corner' => ['views' => 420, 'clicks' => 50],
                ],
            ],
            'createdBy' => 'admin',
            'createdByName' => 'Quản trị viên',
            'createdAt' => date('c', strtotime('-5 days')),
            'updatedAt' => $now,
            'publishedAt' => date('c', strtotime('-4 days')),
        ],
        [
            'id' => 'evt-tanabata-festival-recap',
            'code' => 'SK-2026-003',
            'title' => 'Ngày hội Văn hóa Nhật Bản: Lễ hội Tanabata ngập tràn sắc màu',
            'displayTitle' => '🎋 Khoảnh Khắc Lễ Hội Tanabata Cùng Học Viên VieJap',
            'category' => 'activities',
            'categoryName' => 'Hoạt động VieJap',
            'summary' => 'Trải nghiệm mặc Yukata, viết điều ước Tanzaku và giao lưu văn hóa Nhật Bản tại Trung tâm Đào tạo VieJap.',
            'content' => 'Hoạt động gắn kết học viên trước khi bay, giúp các bạn thấu hiểu sâu sắc nét đẹp truyền thống và phong tục tập quán xứ Phù Tang.',
            'coverImage' => 'assets/images/HoatDong/24DiemTruongTHPTSOCTRANG/3.jpg',
            'bannerImage' => 'assets/images/HoatDong/24DiemTruongTHPTSOCTRANG/3.jpg',
            'gallery' => [],
            'activityId' => 'act-tanabata-festival-2026',
            'linkToActivity' => true,
            'displayFormats' => ['list'],
            'displayConfig' => [
                'topBar' => ['bgColor' => '#0f2b48', 'textColor' => '#ffffff', 'icon' => 'fas fa-newspaper', 'isClosable' => true],
                'popupCenter' => ['layout' => 'banner_top', 'autoCloseSeconds' => 0, 'backdropClickClose' => true],
                'popupCorner' => ['position' => 'bottom_right', 'autoMinimize' => false],
                'indexBanner' => ['position' => 'bottom', 'style' => 'card'],
            ],
            'cta' => [
                'enabled' => true,
                'actionType' => 'view_detail',
                'label' => 'Xem album ảnh hoạt động',
                'url' => '/hoat-dong/le-hoi-tanabata-ngap-tran-sac-mau-cung-hoc-vien-viejap-tai-tra-vinh',
                'target' => '_self',
            ],
            'schedule' => [
                'startDate' => $pastWeek,
                'endDate' => $nextYear,
                'timezone' => 'Asia/Ho_Chi_Minh',
                'autoPublish' => true,
                'autoEnd' => true,
            ],
            'targeting' => [
                'pages' => ['all'],
                'userAudience' => 'all',
            ],
            'delivery' => [
                'priorityLevel' => 'low',
                'priorityOrder' => 3,
                'frequency' => 'per_session',
            ],
            'status' => 'published',
            'analytics' => [
                'views' => 740,
                'clicks' => 98,
                'dismisses' => 12,
                'byFormat' => [
                    'floating_button' => ['views' => 740, 'clicks' => 98],
                ],
            ],
            'createdBy' => 'admin',
            'createdByName' => 'Quản trị viên',
            'createdAt' => date('c', strtotime('-3 days')),
            'updatedAt' => $now,
            'publishedAt' => date('c', strtotime('-2 days')),
        ],
    ];
}

function admin_events_load(): array
{
    $file = admin_events_file();
    if (!file_exists($file)) {
        $seed = admin_events_default_seed();
        admin_events_save($seed);
        return $seed;
    }

    $raw = @file_get_contents($file);
    if ($raw === false || trim($raw) === '') {
        $seed = admin_events_default_seed();
        admin_events_save($seed);
        return $seed;
    }

    $data = json_decode($raw, true);
    if (!is_array($data)) {
        return [];
    }

    // Refresh dynamic status based on schedule dates
    $now = date('c');
    $modified = false;
    foreach ($data as &$event) {
        if (($event['status'] ?? '') === 'draft' || ($event['status'] ?? '') === 'paused') {
            continue;
        }

        $sched = $event['schedule'] ?? [];
        $startDate = $sched['startDate'] ?? '';
        $endDate = $sched['endDate'] ?? '';

        if (!empty($endDate) && $now > $endDate) {
            if ($event['status'] !== 'ended') {
                $event['status'] = 'ended';
                $event['endedAt'] = $now;
                $modified = true;
            }
        } elseif (!empty($startDate) && $now < $startDate) {
            if ($event['status'] !== 'scheduled') {
                $event['status'] = 'scheduled';
                $modified = true;
            }
        } else {
            if ($event['status'] !== 'published') {
                $event['status'] = 'published';
                $modified = true;
            }
        }
    }
    unset($event);

    if ($modified) {
        admin_events_save($data);
    }

    return $data;
}

function admin_events_save(array $events): void
{
    $file = admin_events_file();
    $dir = dirname($file);
    if (!is_dir($dir)) {
        @mkdir($dir, 0755, true);
    }

    $json = json_encode($events, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    $tmp = $file . '.' . uniqid('evtsave_', true) . '.tmp';
    $fp = fopen($tmp, 'wb');
    if (!$fp) {
        throw new RuntimeException("Không thể mở tệp tạm thời để ghi dữ liệu sự kiện: {$tmp}");
    }

    flock($fp, LOCK_EX);
    fwrite($fp, $json);
    fflush($fp);
    flock($fp, LOCK_UN);
    fclose($fp);

    if (!rename($tmp, $file)) {
        @unlink($tmp);
        throw new RuntimeException("Không thể lưu tệp dữ liệu sự kiện: {$file}");
    }
}

function admin_events_find(string $idOrCode): ?array
{
    $events = admin_events_load();
    foreach ($events as $event) {
        if (($event['id'] ?? '') === $idOrCode || ($event['code'] ?? '') === $idOrCode) {
            return $event;
        }
    }
    return null;
}

function admin_event_sanitize_payload(array $input, ?array $existing = null): array
{
    $title = trim((string) ($input['title'] ?? ''));
    if ($title === '') {
        admin_respond(422, ['message' => 'Tên sự kiện không được để trống.']);
    }

    $displayTitle = trim((string) ($input['displayTitle'] ?? ''));
    if ($displayTitle === '') {
        $displayTitle = $title;
    }

    $category = trim((string) ($input['category'] ?? 'activities'));
    $categories = admin_events_categories();
    $catMap = array_column($categories, 'name', 'id');
    $categoryName = $catMap[$category] ?? 'Sự kiện khác';

    $summary = trim((string) ($input['summary'] ?? ''));
    $content = trim((string) ($input['content'] ?? ''));
    $coverImage = trim((string) ($input['coverImage'] ?? ''));
    $bannerImage = trim((string) ($input['bannerImage'] ?? ''));
    $gallery = is_array($input['gallery'] ?? null) ? array_values(array_filter($input['gallery'], 'is_string')) : [];

    $activityId = trim((string) ($input['activityId'] ?? ''));
    $linkToActivity = !empty($input['linkToActivity']);

    // Display Formats
    $rawFormats = is_array($input['displayFormats'] ?? null) ? $input['displayFormats'] : ['popup_center'];
    $allowedFormats = ['popup_center', 'popup_corner', 'top_bar', 'index_banner', 'floating_button', 'list'];
    $displayFormats = array_values(array_intersect($rawFormats, $allowedFormats));
    if (empty($displayFormats)) {
        $displayFormats = ['popup_center'];
    }

    // Display Config
    $rawConfig = is_array($input['displayConfig'] ?? null) ? $input['displayConfig'] : [];
    $displayConfig = [
        'topBar' => [
            'bgColor' => (string) ($rawConfig['topBar']['bgColor'] ?? '#0f2b48'),
            'textColor' => (string) ($rawConfig['topBar']['textColor'] ?? '#ffffff'),
            'icon' => (string) ($rawConfig['topBar']['icon'] ?? 'fas fa-bullhorn'),
            'isClosable' => isset($rawConfig['topBar']['isClosable']) ? (bool) $rawConfig['topBar']['isClosable'] : true,
        ],
        'popupCenter' => [
            'layout' => in_array($rawConfig['popupCenter']['layout'] ?? '', ['horizontal', 'vertical', 'banner_top'], true) ? $rawConfig['popupCenter']['layout'] : 'banner_top',
            'autoCloseSeconds' => max(0, min(60, (int) ($rawConfig['popupCenter']['autoCloseSeconds'] ?? 0))),
            'backdropClickClose' => isset($rawConfig['popupCenter']['backdropClickClose']) ? (bool) $rawConfig['popupCenter']['backdropClickClose'] : true,
        ],
        'popupCorner' => [
            'position' => in_array($rawConfig['popupCorner']['position'] ?? '', ['bottom_right', 'bottom_left'], true) ? $rawConfig['popupCorner']['position'] : 'bottom_right',
            'autoMinimize' => !empty($rawConfig['popupCorner']['autoMinimize']),
        ],
        'indexBanner' => [
            'position' => in_array($rawConfig['indexBanner']['position'] ?? '', ['below_hero', 'below_orders', 'in_activities', 'bottom'], true) ? $rawConfig['indexBanner']['position'] : 'below_hero',
            'style' => in_array($rawConfig['indexBanner']['style'] ?? '', ['highlight', 'navy', 'card'], true) ? $rawConfig['indexBanner']['style'] : 'highlight',
        ],
    ];

    // CTA
    $rawCta = is_array($input['cta'] ?? null) ? $input['cta'] : [];
    $cta = [
        'enabled' => !empty($rawCta['enabled']),
        'actionType' => in_array($rawCta['actionType'] ?? '', ['register', 'view_detail', 'learn_more', 'consultation', 'view_orders', 'custom'], true) ? $rawCta['actionType'] : 'register',
        'label' => trim((string) ($rawCta['label'] ?? 'Xem chi tiết')),
        'url' => trim((string) ($rawCta['url'] ?? '/')),
        'target' => ($rawCta['target'] ?? '') === '_blank' ? '_blank' : '_self',
    ];

    // Schedule
    $rawSchedule = is_array($input['schedule'] ?? null) ? $input['schedule'] : [];
    $startDate = trim((string) ($rawSchedule['startDate'] ?? ''));
    $endDate = trim((string) ($rawSchedule['endDate'] ?? ''));
    if ($startDate === '') {
        $startDate = date('c');
    }
    $schedule = [
        'startDate' => $startDate,
        'endDate' => $endDate,
        'timezone' => (string) ($rawSchedule['timezone'] ?? 'Asia/Ho_Chi_Minh'),
        'autoPublish' => !empty($rawSchedule['autoPublish']),
        'autoEnd' => !empty($rawSchedule['autoEnd']),
    ];

    // Targeting
    $rawTargeting = is_array($input['targeting'] ?? null) ? $input['targeting'] : [];
    $pages = is_array($rawTargeting['pages'] ?? null) ? array_values(array_filter($rawTargeting['pages'], 'is_string')) : ['all'];
    if (empty($pages)) {
        $pages = ['all'];
    }
    $targeting = [
        'pages' => $pages,
        'userAudience' => in_array($rawTargeting['userAudience'] ?? '', ['all', 'guest_only', 'logged_in_only'], true) ? $rawTargeting['userAudience'] : 'all',
    ];

    // Delivery / Priority
    $rawDelivery = is_array($input['delivery'] ?? null) ? $input['delivery'] : [];
    $priorityLevel = in_array($rawDelivery['priorityLevel'] ?? '', ['high', 'normal', 'low'], true) ? $rawDelivery['priorityLevel'] : 'normal';
    $priorityOrder = max(1, min(100, (int) ($rawDelivery['priorityOrder'] ?? 50)));
    $frequency = in_array($rawDelivery['frequency'] ?? '', ['per_session', 'per_day', 'per_week', 'once_ever', 'always'], true) ? $rawDelivery['frequency'] : 'per_session';

    $delivery = [
        'priorityLevel' => $priorityLevel,
        'priorityOrder' => $priorityOrder,
        'frequency' => $frequency,
    ];

    // Status
    $status = trim((string) ($input['status'] ?? ($existing['status'] ?? 'draft')));
    if (!in_array($status, ['draft', 'scheduled', 'published', 'paused', 'ended'], true)) {
        $status = 'draft';
    }

    // Analytics preserved
    $analytics = $existing['analytics'] ?? [
        'views' => 0,
        'clicks' => 0,
        'dismisses' => 0,
        'byFormat' => [],
    ];

    $now = date('c');
    $id = $existing['id'] ?? ('evt-' . bin2hex(random_bytes(8)));
    $code = $existing['code'] ?? ('SK-' . date('Y') . '-' . str_pad((string) mt_rand(10, 999), 3, '0', STR_PAD_LEFT));
    $createdAt = $existing['createdAt'] ?? $now;
    $createdBy = $existing['createdBy'] ?? 'admin';
    $createdByName = $existing['createdByName'] ?? 'Quản trị viên';
    $publishedAt = $existing['publishedAt'] ?? ($status === 'published' ? $now : null);

    return [
        'id' => $id,
        'code' => $code,
        'title' => $title,
        'displayTitle' => $displayTitle,
        'category' => $category,
        'categoryName' => $categoryName,
        'summary' => $summary,
        'content' => $content,
        'coverImage' => $coverImage,
        'bannerImage' => $bannerImage,
        'gallery' => $gallery,
        'activityId' => $activityId,
        'linkToActivity' => $linkToActivity,
        'displayFormats' => $displayFormats,
        'displayConfig' => $displayConfig,
        'cta' => $cta,
        'schedule' => $schedule,
        'targeting' => $targeting,
        'delivery' => $delivery,
        'status' => $status,
        'analytics' => $analytics,
        'createdBy' => $createdBy,
        'createdByName' => $createdByName,
        'createdAt' => $createdAt,
        'updatedAt' => $now,
        'publishedAt' => $publishedAt,
    ];
}

