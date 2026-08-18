<?php
declare(strict_types=1);

require_once __DIR__ . '/_bootstrap.php';

const VIEJAP_JOB_ORDER_CATEGORIES = ['ky-su', 'tokutei', 'thuc-tap-sinh', 'du-hoc'];

function admin_job_order_seed_data(): array
{
    $createdAt = '2026-06-01 00:00:00';

    return [
        [
            'id' => '1a2b3c4d5e6f7081920a3b4c',
            'category' => 'ky-su',
            'title' => 'Đơn kỹ sư Nhật Bản',
            'imageUrl' => '/assets/images/KySu/ks.png',
            'description' => 'Thông tin lộ trình kỹ sư Nhật Bản. Liên hệ VieJap để được tư vấn đơn phù hợp.',
            'status' => 'published',
            'isFeatured' => true,
            'createdAt' => $createdAt,
            'updatedAt' => '2026-06-10 00:00:00',
        ],
        [
            'id' => '2b3c4d5e6f7081920a3b4c5d',
            'category' => 'tokutei',
            'title' => 'Đơn Tokutei Nhật Bản',
            'imageUrl' => '/assets/images/TKT/tkt.png',
            'description' => 'Thông tin lộ trình Tokutei. VieJap hỗ trợ định hướng và chuẩn bị hồ sơ.',
            'status' => 'published',
            'isFeatured' => true,
            'createdAt' => $createdAt,
            'updatedAt' => '2026-06-09 00:00:00',
        ],
        [
            'id' => '3c4d5e6f7081920a3b4c5d6e',
            'category' => 'thuc-tap-sinh',
            'title' => 'Đơn thực tập sinh Nhật Bản',
            'imageUrl' => '/assets/images/TTS/tts.png',
            'description' => 'Thông tin lộ trình thực tập sinh Nhật Bản và các ngành nghề đang tuyển.',
            'status' => 'published',
            'isFeatured' => true,
            'createdAt' => $createdAt,
            'updatedAt' => '2026-06-08 00:00:00',
        ],
        [
            'id' => '5e6f7081920a3b4c5d6e7f80',
            'category' => 'du-hoc',
            'title' => 'Lộ trình du học Nhật Bản',
            'imageUrl' => '/assets/images/DHS/dhs.png',
            'description' => 'Thông tin lộ trình du học Nhật Bản. Liên hệ VieJap để được hỗ trợ hồ sơ.',
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
        $sql = 'SELECT id, image_url, title, category, summary, status, is_featured, created_at, updated_at
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
        $orders = array_values(array_filter(
            $orders,
            static fn (array $order): bool => $order['status'] === 'published'
        ));
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
        $sql = 'SELECT id, image_url, title, category, summary, status, is_featured, created_at, updated_at
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
                image_url = :image_url, category = :category, title = :title, summary = :summary,
                status = :status, is_featured = :is_featured, updated_at = :updated_at
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
            id, image_url, order_code, title, category, location, salary, age_range, summary,
            requirements, departure_month, status, is_featured, created_at, updated_at
        ) VALUES (
            :id, :image_url, :order_code, :title, :category, :location, :salary, :age_range, :summary,
            :requirements, :departure_month, :status, :is_featured, :created_at, :updated_at
        )'
    );
    $statement->execute(admin_job_order_database_values($order));
}

function admin_job_order_database_values(array $order): array
{
    return [
        'id' => $order['id'],
        'image_url' => $order['imageUrl'],
        'order_code' => 'DH-' . strtoupper(substr($order['id'], 0, 6)),
        'title' => $order['title'] ?? admin_job_order_default_title((string) ($order['category'] ?? '')),
        'category' => $order['category'],
        'location' => '',
        'salary' => '',
        'age_range' => '',
        'summary' => $order['description'],
        'requirements' => '',
        'departure_month' => '',
        'status' => $order['status'],
        'is_featured' => $order['isFeatured'] ? 1 : 0,
        'created_at' => $order['createdAt'],
        'updated_at' => $order['updatedAt'],
    ];
}

function admin_job_order_from_database(array $order): array
{
    $category = (string) ($order['category'] ?? '');
    $imageUrl = (string) ($order['image_url'] ?? '');
    if (!admin_job_order_is_usable_image_url($imageUrl)) {
        $imageUrl = admin_job_order_legacy_image($category);
    }

    return [
        'id' => (string) $order['id'],
        'title' => trim((string) ($order['title'] ?? '')),
        'category' => admin_job_order_category((string) ($order['category'] ?? ''), $imageUrl),
        'imageUrl' => $imageUrl,
        'description' => admin_job_order_sanitize_description((string) ($order['summary'] ?? '')),
        'status' => (string) $order['status'],
        'isFeatured' => (bool) $order['is_featured'],
        'createdAt' => (string) $order['created_at'],
        'updatedAt' => (string) $order['updated_at'],
    ];
}

function admin_job_order_normalize_payload(array $payload, ?array $existing = null): array
{
    $category = admin_job_order_text($payload, 'category', $existing['category'] ?? 'thuc-tap-sinh');
    if (!in_array($category, VIEJAP_JOB_ORDER_CATEGORIES, true)) {
        admin_respond(422, ['message' => 'Nhóm đơn hàng không hợp lệ.']);
    }

    $title = admin_job_order_text($payload, 'title', $existing['title'] ?? admin_job_order_default_title($category));
    if ($title === '') {
        $title = admin_job_order_default_title($category);
    }

    $imageUrl = trim((string) ($payload['imageUrl'] ?? ($existing['imageUrl'] ?? '')));
    if (!admin_job_order_is_safe_image_url($imageUrl)) {
        admin_respond(422, ['message' => 'Ảnh đơn hàng không hợp lệ. Vui lòng tải ảnh từ trang quản trị.']);
    }

    $descriptionValue = array_key_exists('description', $payload)
        ? (string) $payload['description']
        : (string) ($existing['description'] ?? '');
    $description = admin_job_order_sanitize_description($descriptionValue);
    if ($description === '') {
        admin_respond(422, ['message' => 'Vui lòng nhập mô tả cho đơn hàng.']);
    }

    $status = admin_job_order_text($payload, 'status', $existing['status'] ?? 'published');
    if (!in_array($status, ['draft', 'published'], true)) {
        admin_respond(422, ['message' => 'Trạng thái đơn hàng không hợp lệ.']);
    }

    return [
        'category' => $category,
        'title' => $title,
        'imageUrl' => $imageUrl,
        'description' => $description,
        'status' => $status,
        'isFeatured' => filter_var($payload['isFeatured'] ?? ($existing['isFeatured'] ?? false), FILTER_VALIDATE_BOOL),
    ];
}

function admin_job_order_default_title(string $category): string
{
    return match ($category) {
        'ky-su' => 'Đơn kỹ sư Nhật Bản',
        'tokutei' => 'Đơn Tokutei Nhật Bản',
        'du-hoc' => 'Lộ trình du học Nhật Bản',
        default => 'Đơn thực tập sinh Nhật Bản',
    };
}

function admin_job_order_text(array $payload, string $field, string $fallback): string
{
    $value = array_key_exists($field, $payload) ? (string) $payload[$field] : $fallback;
    $value = preg_replace('/\s+/u', ' ', trim($value)) ?? '';
    return $value;
}

function admin_job_order_sanitize_description(string $value): string
{
    $value = trim(str_replace(["\r\n", "\r"], "\n", $value));
    if ($value === '') {
        return '';
    }

    // Plain text from older records is upgraded to safe HTML while retaining line breaks.
    if (!preg_match('/<\s*\/?\s*[a-z][^>]*>/i', $value)) {
        return nl2br(htmlspecialchars($value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8'), false);
    }

    $document = new DOMDocument('1.0', 'UTF-8');
    $previousErrors = libxml_use_internal_errors(true);
    $loaded = $document->loadHTML(
        '<?xml encoding="UTF-8"><div id="viejap-description-root">' . $value . '</div>',
        LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD | LIBXML_NONET
    );
    libxml_clear_errors();
    libxml_use_internal_errors($previousErrors);

    if (!$loaded) {
        return nl2br(htmlspecialchars(strip_tags($value), ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8'), false);
    }

    $root = $document->getElementById('viejap-description-root');
    if (!$root instanceof DOMElement) {
        return nl2br(htmlspecialchars(strip_tags($value), ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8'), false);
    }

    admin_job_order_sanitize_description_node($root);
    $result = '';
    foreach ($root->childNodes as $child) {
        $result .= $document->saveHTML($child);
    }

    return trim($result);
}

function admin_job_order_sanitize_description_node(DOMNode $parent): void
{
    $allowedTags = [
        'a',
        'b',
        'blockquote',
        'br',
        'div',
        'em',
        'i',
        'li',
        'ol',
        'p',
        'strong',
        's',
        'u',
        'ul',
    ];
    $removedTags = [
        'applet',
        'embed',
        'form',
        'iframe',
        'input',
        'link',
        'meta',
        'object',
        'script',
        'style',
        'textarea',
        'title',
    ];

    for ($child = $parent->firstChild; $child !== null;) {
        $next = $child->nextSibling;

        if ($child instanceof DOMComment) {
            $parent->removeChild($child);
        } elseif ($child instanceof DOMElement) {
            $tag = strtolower($child->tagName);

            if (in_array($tag, $removedTags, true)) {
                $parent->removeChild($child);
            } elseif (!in_array($tag, $allowedTags, true)) {
                admin_job_order_sanitize_description_node($child);
                while ($child->firstChild !== null) {
                    $parent->insertBefore($child->firstChild, $child);
                }
                $parent->removeChild($child);
            } else {
                $href = $tag === 'a' ? trim((string) $child->getAttribute('href')) : '';
                while ($child->attributes->length > 0) {
                    $child->removeAttribute($child->attributes->item(0)->name);
                }
                if ($tag === 'a' && preg_match('#^(?:https?://|mailto:)#i', $href)) {
                    $child->setAttribute('href', $href);
                    $child->setAttribute('target', '_blank');
                    $child->setAttribute('rel', 'noopener noreferrer');
                }
                admin_job_order_sanitize_description_node($child);
            }
        }

        $child = $next;
    }
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
    if (!is_array($orders)) {
        return [];
    }

    $normalized = [];
    foreach ($orders as $order) {
        if (is_array($order) && isset($order['id']) && admin_job_order_is_valid_id((string) $order['id'])) {
            $normalized[] = admin_job_order_from_file($order);
        }
    }
    return $normalized;
}

function admin_job_order_from_file(array $order): array
{
    $category = (string) ($order['category'] ?? '');
    $imageUrl = trim((string) ($order['imageUrl'] ?? ''));
    if (!admin_job_order_is_usable_image_url($imageUrl)) {
        $imageUrl = admin_job_order_legacy_image($category);
    }
    $description = admin_job_order_sanitize_description(
        (string) ($order['description'] ?? $order['summary'] ?? '')
    );

    return [
        'id' => (string) $order['id'],
        'title' => trim((string) ($order['title'] ?? '')),
        'category' => admin_job_order_category($category, $imageUrl),
        'imageUrl' => $imageUrl,
        'description' => $description,
        'status' => ($order['status'] ?? 'draft') === 'published' ? 'published' : 'draft',
        'isFeatured' => (bool) ($order['isFeatured'] ?? false),
        'createdAt' => (string) ($order['createdAt'] ?? gmdate('Y-m-d H:i:s')),
        'updatedAt' => (string) ($order['updatedAt'] ?? gmdate('Y-m-d H:i:s')),
    ];
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

function admin_job_order_legacy_image(string $category): string
{
    return match ($category) {
        'ky-su' => '/assets/images/KySu/ks.png',
        'tokutei' => '/assets/images/TKT/tkt.png',
        'du-hoc' => '/assets/images/DHS/dhs.png',
        default => '/assets/images/TTS/tts.png',
    };
}

function admin_job_order_category(string $category, string $imageUrl = ''): string
{
    if (in_array($category, VIEJAP_JOB_ORDER_CATEGORIES, true)) {
        return $category;
    }

    return match (true) {
        str_contains($imageUrl, '/KySu/') => 'ky-su',
        str_contains($imageUrl, '/TKT/') => 'tokutei',
        str_contains($imageUrl, '/DHS/') => 'du-hoc',
        default => 'thuc-tap-sinh',
    };
}

function admin_job_order_is_safe_image_url(string $imageUrl): bool
{
    return preg_match('#^/uploads/orders/[a-z0-9][a-z0-9_-]{0,120}\.(?:jpe?g|png|webp)$#i', $imageUrl) === 1
        || preg_match('#^/?assets/images/[A-Za-z0-9/_(). -]+\.(?:jpe?g|png|webp)$#', $imageUrl) === 1;
}

function admin_job_order_is_usable_image_url(string $imageUrl): bool
{
    if (!admin_job_order_is_safe_image_url($imageUrl)) {
        return false;
    }

    if (str_starts_with($imageUrl, '/uploads/orders/')) {
        $path = dirname(__DIR__, 2) . DIRECTORY_SEPARATOR . str_replace('/', DIRECTORY_SEPARATOR, ltrim($imageUrl, '/'));
        return is_file($path);
    }

    return true;
}

function admin_job_order_is_valid_id(string $id): bool
{
    return preg_match('/^[a-f0-9]{24}$/', $id) === 1;
}
