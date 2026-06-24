<?php
declare(strict_types=1);

require_once __DIR__ . '/_bootstrap.php';

const VIEJAP_JOB_ORDER_CATEGORIES = [
    'ky-su',
    'tokutei',
    'thuc-tap-sinh',
    'du-hoc',
];

function admin_job_order_seed_data(): array
{
    $createdAt = '2026-06-01 00:00:00';

    return [
        [
            'id' => '1a2b3c4d5e6f7081920a3b4c',
            'orderCode' => 'KS-2601',
            'title' => 'Kỹ sư cơ khí - thiết kế khuôn',
            'category' => 'ky-su',
            'location' => 'Fukuoka',
            'salary' => 'Từ 220.000 yên/tháng',
            'ageRange' => '22 - 35 tuổi',
            'summary' => 'Làm việc theo chuyên môn cơ khí, có lộ trình đào tạo và hỗ trợ ổn định cuộc sống tại Nhật.',
            'requirements' => "Tốt nghiệp cao đẳng hoặc đại học đúng chuyên ngành\nCó thể đọc bản vẽ kỹ thuật cơ bản\nƯu tiên ứng viên có kinh nghiệm CAD",
            'departureMonth' => 'Dự kiến 12/2026',
            'status' => 'published',
            'isFeatured' => true,
            'createdAt' => $createdAt,
            'updatedAt' => '2026-06-10 00:00:00',
        ],
        [
            'id' => '2b3c4d5e6f7081920a3b4c5d',
            'orderCode' => 'TKT-2602',
            'title' => 'Chế biến thực phẩm',
            'category' => 'tokutei',
            'location' => 'Tochigi',
            'salary' => 'Từ 195.000 yên/tháng',
            'ageRange' => '20 - 35 tuổi',
            'summary' => 'Môi trường nhà máy ổn định, phù hợp ứng viên đã có tay nghề hoặc muốn theo chương trình kỹ năng đặc định.',
            'requirements' => "Sức khỏe tốt, chăm chỉ\nCó ý thức kỷ luật trong công việc\nTiếng Nhật theo yêu cầu từng đợt tuyển",
            'departureMonth' => 'Dự kiến 01/2027',
            'status' => 'published',
            'isFeatured' => true,
            'createdAt' => $createdAt,
            'updatedAt' => '2026-06-09 00:00:00',
        ],
        [
            'id' => '3c4d5e6f7081920a3b4c5d6e',
            'orderCode' => 'TTS-2603',
            'title' => 'Lắp ráp linh kiện điện tử',
            'category' => 'thuc-tap-sinh',
            'location' => 'Fukushima',
            'salary' => 'Từ 1.049 yên/giờ',
            'ageRange' => '18 - 35 tuổi',
            'summary' => 'Công việc kiểm tra và đóng gói linh kiện điện tử trong môi trường có hướng dẫn đào tạo rõ ràng.',
            'requirements' => "Tốt nghiệp cấp 2 trở lên\nKhông yêu cầu kinh nghiệm\nCó thể làm việc theo ca",
            'departureMonth' => 'Dự kiến 12/2026',
            'status' => 'published',
            'isFeatured' => true,
            'createdAt' => $createdAt,
            'updatedAt' => '2026-06-08 00:00:00',
        ],
        [
            'id' => '4d5e6f7081920a3b4c5d6e7f',
            'orderCode' => 'TTS-2604',
            'title' => 'Nông nghiệp nhà kính',
            'category' => 'thuc-tap-sinh',
            'location' => 'Aichi',
            'salary' => 'Từ 1.080 yên/giờ',
            'ageRange' => '19 - 32 tuổi',
            'summary' => 'Làm việc trong nhà kính, có hướng dẫn công việc từng bước và hỗ trợ sinh hoạt ban đầu.',
            'requirements' => "Sức khỏe tốt\nChăm chỉ, có tinh thần học hỏi\nKhông yêu cầu kinh nghiệm",
            'departureMonth' => 'Dự kiến 02/2027',
            'status' => 'published',
            'isFeatured' => false,
            'createdAt' => $createdAt,
            'updatedAt' => '2026-06-07 00:00:00',
        ],
        [
            'id' => '5e6f7081920a3b4c5d6e7f80',
            'orderCode' => 'DHS-2605',
            'title' => 'Du học tiếng Nhật kỳ tháng 4',
            'category' => 'du-hoc',
            'location' => 'Tokyo',
            'salary' => 'Học phí theo trường tiếp nhận',
            'ageRange' => '18 - 28 tuổi',
            'summary' => 'Lộ trình học tiếng và chuẩn bị hồ sơ du học, có tư vấn trường phù hợp với mục tiêu cá nhân.',
            'requirements' => "Tốt nghiệp THPT trở lên\nCó kế hoạch học tập rõ ràng\nĐáp ứng điều kiện hồ sơ của trường",
            'departureMonth' => 'Kỳ 04/2027',
            'status' => 'published',
            'isFeatured' => false,
            'createdAt' => $createdAt,
            'updatedAt' => '2026-06-06 00:00:00',
        ],
    ];
}

function admin_job_orders_list(bool $includeDrafts = false): array
{
    $database = admin_job_orders_database();
    if ($database !== null) {
        $sql = 'SELECT id, order_code, title, category, location, salary, age_range, summary,
                       requirements, departure_month, status, is_featured, created_at, updated_at
                FROM job_orders';
        if (!$includeDrafts) {
            $sql .= " WHERE status = 'published'";
        }
        $sql .= ' ORDER BY is_featured DESC, updated_at DESC';
        $rows = $database->query($sql)->fetchAll();
        return array_map('admin_job_order_from_database', $rows);
    }

    $orders = admin_job_order_load_file();
    if (!$includeDrafts) {
        $orders = array_values(array_filter($orders, static fn (array $order): bool => $order['status'] === 'published'));
    }
    usort($orders, 'admin_job_order_compare');
    return $orders;
}

function admin_job_order_find(string $id, bool $includeDrafts = false): ?array
{
    if (!admin_job_order_is_valid_id($id)) {
        return null;
    }

    $database = admin_job_orders_database();
    if ($database !== null) {
        $sql = 'SELECT id, order_code, title, category, location, salary, age_range, summary,
                       requirements, departure_month, status, is_featured, created_at, updated_at
                FROM job_orders WHERE id = :id';
        if (!$includeDrafts) {
            $sql .= " AND status = 'published'";
        }
        $statement = $database->prepare($sql);
        $statement->execute(['id' => $id]);
        $order = $statement->fetch();
        return is_array($order) ? admin_job_order_from_database($order) : null;
    }

    foreach (admin_job_order_load_file() as $order) {
        if ($order['id'] === $id && ($includeDrafts || $order['status'] === 'published')) {
            return $order;
        }
    }

    return null;
}

function admin_job_order_create(array $payload): array
{
    $order = admin_job_order_normalize_payload($payload);
    $order['id'] = bin2hex(random_bytes(12));
    $order['createdAt'] = gmdate('Y-m-d H:i:s');
    $order['updatedAt'] = $order['createdAt'];

    $database = admin_job_orders_database();
    if ($database !== null) {
        admin_job_order_insert_database($database, $order);
        return $order;
    }

    $orders = admin_job_order_load_file();
    array_unshift($orders, $order);
    admin_job_order_save_file($orders);
    return $order;
}

function admin_job_order_update(string $id, array $payload): ?array
{
    $existing = admin_job_order_find($id, true);
    if ($existing === null) {
        return null;
    }

    $order = admin_job_order_normalize_payload($payload, $existing);
    $order['id'] = $existing['id'];
    $order['createdAt'] = $existing['createdAt'];
    $order['updatedAt'] = gmdate('Y-m-d H:i:s');

    $database = admin_job_orders_database();
    if ($database !== null) {
        $statement = $database->prepare(
            'UPDATE job_orders SET
                order_code = :order_code, title = :title, category = :category, location = :location,
                salary = :salary, age_range = :age_range, summary = :summary, requirements = :requirements,
                departure_month = :departure_month, status = :status, is_featured = :is_featured,
                updated_at = :updated_at
             WHERE id = :id'
        );
        $statement->execute(admin_job_order_database_values($order));
        return $order;
    }

    $orders = admin_job_order_load_file();
    foreach ($orders as $index => $candidate) {
        if ($candidate['id'] === $id) {
            $orders[$index] = $order;
            admin_job_order_save_file($orders);
            return $order;
        }
    }

    return null;
}

function admin_job_order_delete(string $id): bool
{
    if (!admin_job_order_is_valid_id($id)) {
        return false;
    }

    $database = admin_job_orders_database();
    if ($database !== null) {
        $statement = $database->prepare('DELETE FROM job_orders WHERE id = :id');
        $statement->execute(['id' => $id]);
        return $statement->rowCount() > 0;
    }

    $orders = admin_job_order_load_file();
    $remaining = array_values(array_filter($orders, static fn (array $order): bool => $order['id'] !== $id));
    if (count($remaining) === count($orders)) {
        return false;
    }
    admin_job_order_save_file($remaining);
    return true;
}

function admin_job_orders_database(): ?PDO
{
    $database = admin_database();
    if ($database === null) {
        return null;
    }

    $seed = $database->prepare(
        "INSERT IGNORE INTO job_order_metadata (metadata_key, metadata_value)
         VALUES ('initial_seed', '1')"
    );
    $seed->execute();
    if ($seed->rowCount() > 0) {
        foreach (admin_job_order_seed_data() as $order) {
            admin_job_order_insert_database($database, $order);
        }
    }

    return $database;
}

function admin_job_order_insert_database(PDO $database, array $order): void
{
    $statement = $database->prepare(
        'INSERT INTO job_orders (
            id, order_code, title, category, location, salary, age_range, summary,
            requirements, departure_month, status, is_featured, created_at, updated_at
        ) VALUES (
            :id, :order_code, :title, :category, :location, :salary, :age_range, :summary,
            :requirements, :departure_month, :status, :is_featured, :created_at, :updated_at
        )'
    );
    $statement->execute(admin_job_order_database_values($order));
}

function admin_job_order_database_values(array $order): array
{
    return [
        'id' => $order['id'],
        'order_code' => $order['orderCode'],
        'title' => $order['title'],
        'category' => $order['category'],
        'location' => $order['location'],
        'salary' => $order['salary'],
        'age_range' => $order['ageRange'],
        'summary' => $order['summary'],
        'requirements' => $order['requirements'],
        'departure_month' => $order['departureMonth'],
        'status' => $order['status'],
        'is_featured' => $order['isFeatured'] ? 1 : 0,
        'created_at' => $order['createdAt'],
        'updated_at' => $order['updatedAt'],
    ];
}

function admin_job_order_from_database(array $order): array
{
    return [
        'id' => (string) $order['id'],
        'orderCode' => (string) $order['order_code'],
        'title' => (string) $order['title'],
        'category' => (string) $order['category'],
        'location' => (string) $order['location'],
        'salary' => (string) $order['salary'],
        'ageRange' => (string) $order['age_range'],
        'summary' => (string) $order['summary'],
        'requirements' => (string) $order['requirements'],
        'departureMonth' => (string) $order['departure_month'],
        'status' => (string) $order['status'],
        'isFeatured' => (bool) $order['is_featured'],
        'createdAt' => (string) $order['created_at'],
        'updatedAt' => (string) $order['updated_at'],
    ];
}

function admin_job_order_normalize_payload(array $payload, ?array $existing = null): array
{
    $category = admin_job_order_text($payload, 'category', 32, $existing['category'] ?? '');
    if (!in_array($category, VIEJAP_JOB_ORDER_CATEGORIES, true)) {
        admin_respond(422, ['message' => 'Nhóm đơn hàng không hợp lệ.']);
    }

    $status = admin_job_order_text($payload, 'status', 16, $existing['status'] ?? 'published');
    if (!in_array($status, ['draft', 'published'], true)) {
        admin_respond(422, ['message' => 'Trạng thái đơn hàng không hợp lệ.']);
    }

    $order = [
        'orderCode' => admin_job_order_text($payload, 'orderCode', 48, $existing['orderCode'] ?? ''),
        'title' => admin_job_order_text($payload, 'title', 160, $existing['title'] ?? ''),
        'category' => $category,
        'location' => admin_job_order_text($payload, 'location', 100, $existing['location'] ?? ''),
        'salary' => admin_job_order_text($payload, 'salary', 100, $existing['salary'] ?? ''),
        'ageRange' => admin_job_order_text($payload, 'ageRange', 60, $existing['ageRange'] ?? ''),
        'summary' => admin_job_order_text($payload, 'summary', 420, $existing['summary'] ?? ''),
        'requirements' => admin_job_order_requirements($payload, $existing['requirements'] ?? ''),
        'departureMonth' => admin_job_order_text($payload, 'departureMonth', 48, $existing['departureMonth'] ?? ''),
        'status' => $status,
        'isFeatured' => filter_var($payload['isFeatured'] ?? ($existing['isFeatured'] ?? false), FILTER_VALIDATE_BOOL),
    ];

    foreach (['orderCode', 'title', 'location', 'salary', 'ageRange', 'summary', 'requirements', 'departureMonth'] as $field) {
        if ($order[$field] === '') {
            admin_respond(422, ['message' => 'Vui lòng nhập đủ các trường thông tin bắt buộc.']);
        }
    }

    return $order;
}

function admin_job_order_text(array $payload, string $field, int $maxLength, string $fallback): string
{
    $value = array_key_exists($field, $payload) ? (string) $payload[$field] : $fallback;
    $value = preg_replace('/\s+/u', ' ', trim($value)) ?? '';
    return mb_substr($value, 0, $maxLength);
}

function admin_job_order_requirements(array $payload, string $fallback): string
{
    $value = array_key_exists('requirements', $payload) ? (string) $payload['requirements'] : $fallback;
    $lines = preg_split('/\R/u', $value) ?: [];
    $lines = array_values(array_filter(array_map(
        static fn (string $line): string => mb_substr(trim($line), 0, 180),
        $lines,
    )));
    return mb_substr(implode("\n", array_slice($lines, 0, 6)), 0, 800);
}

function admin_job_order_file_path(): string
{
    return admin_storage_directory() . DIRECTORY_SEPARATOR . 'job-orders.json';
}

function admin_job_order_load_file(): array
{
    $path = admin_job_order_file_path();
    if (!is_file($path)) {
        $orders = admin_job_order_seed_data();
        admin_job_order_save_file($orders);
        return $orders;
    }

    $raw = file_get_contents($path);
    $orders = $raw === false ? null : json_decode($raw, true);
    return is_array($orders) ? array_values($orders) : [];
}

function admin_job_order_save_file(array $orders): void
{
    admin_write_json_file(admin_job_order_file_path(), array_values($orders));
}

function admin_job_order_compare(array $left, array $right): int
{
    if ($left['isFeatured'] !== $right['isFeatured']) {
        return $left['isFeatured'] ? -1 : 1;
    }
    return strcmp($right['updatedAt'], $left['updatedAt']);
}

function admin_job_order_is_valid_id(string $id): bool
{
    return preg_match('/^[a-f0-9]{24}$/', $id) === 1;
}
