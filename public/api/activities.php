<?php
declare(strict_types=1);

require_once __DIR__ . '/admin/_activities.php';

function activity_normalize_cover(array $act): array
{
    $cover = $act['coverImage'] ?? null;
    $src = '';
    if (is_array($cover)) {
        $src = (string) ($cover['src'] ?? '');
    } elseif (is_string($cover)) {
        $src = trim($cover);
    }
    if ($src !== '' && !str_starts_with($src, 'http') && !str_starts_with($src, '/')) {
        $src = '/' . $src;
    }
    if ($src === '') {
        $src = '/assets/images/logo.png';
    }
    if (is_array($cover)) {
        $act['coverImage']['src'] = $src;
    } else {
        $act['coverImage'] = $src;
    }
    $act['coverImageUrl'] = $src;
    return $act;
}

try {
    $method = strtoupper((string) ($_SERVER['REQUEST_METHOD'] ?? 'GET'));
    if ($method !== 'GET') {
        admin_respond(405, ['message' => 'Chỉ hỗ trợ phương thức GET']);
    }

    $allActivities = admin_activities_load();

    // Only published activities are accessible to public (and within schedule if set)
    $now = date('c');
    $published = array_values(array_filter($allActivities, function ($act) use ($now) {
        if (($act['status'] ?? '') !== 'published') {
            return false;
        }
        $disp = $act['displayConfig'] ?? [];
        if (!empty($disp['startDate']) && $now < $disp['startDate']) {
            return false;
        }
        if (!empty($disp['endDate']) && $now > $disp['endDate']) {
            return false;
        }
        return true;
    }));
    $published = array_values(array_map('activity_normalize_cover', $published));

    // Check if looking for single detail by slug or id
    $slugOrId = trim((string) ($_GET['slug'] ?? $_GET['id'] ?? ''));
    if ($slugOrId !== '') {
        $found = null;
        $foundIndex = null;
        foreach ($allActivities as $idx => $act) {
            if (($act['id'] ?? '') === $slugOrId || ($act['slug'] ?? '') === $slugOrId) {
                $found = $act;
                $foundIndex = $idx;
                break;
            }
        }

        if ($found === null || (($found['status'] ?? '') !== 'published' && empty($_GET['preview']))) {
            admin_respond(404, ['message' => 'Không tìm thấy hoạt động này hoặc hoạt động chưa được xuất bản.']);
        }

        // Increment view count asynchronously/safely
        if ($foundIndex !== null) {
            $currentViews = (int) ($found['metrics']['viewCount'] ?? $found['viewCount'] ?? 0) + 1;
            if (!isset($allActivities[$foundIndex]['metrics']) || !is_array($allActivities[$foundIndex]['metrics'])) {
                $allActivities[$foundIndex]['metrics'] = [];
            }
            $allActivities[$foundIndex]['metrics']['viewCount'] = $currentViews;
            $allActivities[$foundIndex]['viewCount'] = $currentViews;
            if (!isset($found['metrics']) || !is_array($found['metrics'])) {
                $found['metrics'] = [];
            }
            $found['metrics']['viewCount'] = $currentViews;
            $found['viewCount'] = $currentViews;
            admin_activities_save($allActivities);
        }

        // Related activities (same category, different id, published)
        $related = array_values(array_filter($published, function ($act) use ($found) {
            return ($act['id'] ?? '') !== ($found['id'] ?? '') && 
                   (($act['category'] ?? '') === ($found['category'] ?? '') || 
                    in_array('related', $act['displayConfig']['positions'] ?? [], true));
        }));
        if (count($related) < 4) {
            foreach ($published as $act) {
                if (($act['id'] ?? '') !== ($found['id'] ?? '') && !in_array($act['id'] ?? '', array_column($related, 'id'), true)) {
                    $related[] = $act;
                    if (count($related) >= 4) {
                        break;
                    }
                }
            }
        }
        $related = array_slice($related, 0, 4);

        admin_respond(200, [
            'activity' => activity_normalize_cover($found),
            'related' => array_values(array_map('activity_normalize_cover', $related)),
        ]);
    }

    // List query
    $category = trim((string) ($_GET['category'] ?? 'all'));
    $position = trim((string) ($_GET['position'] ?? 'all'));
    $q = mb_strtolower(trim((string) ($_GET['q'] ?? '')));
    $page = max(1, (int) ($_GET['page'] ?? 1));
    $limit = max(1, min(50, (int) ($_GET['limit'] ?? 12)));

    $filtered = array_filter($published, function ($act) use ($category, $position, $q) {
        if ($category !== 'all' && ($act['category'] ?? '') !== $category) {
            return false;
        }

        if ($position !== 'all') {
            $positions = $act['displayConfig']['positions'] ?? [];
            if (!in_array($position, $positions, true)) {
                return false;
            }
        }

        if ($q !== '') {
            $text = mb_strtolower(
                ($act['title'] ?? '') . ' ' .
                ($act['summary'] ?? '') . ' ' .
                ($act['location'] ?? '') . ' ' .
                ($act['categoryName'] ?? '')
            );
            if (!str_contains($text, $q)) {
                return false;
            }
        }

        return true;
    });

    // Sort by priorityOrder ASC then publishedAt/createdAt DESC
    usort($filtered, function ($a, $b) {
        $pA = (int) ($a['displayConfig']['priorityOrder'] ?? 999);
        $pB = (int) ($b['displayConfig']['priorityOrder'] ?? 999);
        if ($pA !== $pB) {
            return $pA <=> $pB;
        }
        $dateA = $a['publishedAt'] ?? $a['createdAt'] ?? '';
        $dateB = $b['publishedAt'] ?? $b['createdAt'] ?? '';
        return strcmp($dateB, $dateA);
    });

    $total = count($filtered);
    $totalPages = max(1, (int) ceil($total / $limit));
    $offset = ($page - 1) * $limit;
    $items = array_slice($filtered, $offset, $limit);

    // Grouping for top showcase:
    // 1. Featured activity (position 'featured' or level 'featured'/'special')
    $featuredList = array_values(array_filter($published, function ($act) {
        return in_array('featured', $act['displayConfig']['positions'] ?? [], true) ||
               !empty($act['featuredBadge']['enabled']) ||
               in_array($act['level'] ?? '', ['featured', 'special'], true);
    }));
    $primaryFeatured = $featuredList[0] ?? ($published[0] ?? null);

    // 2. HOT activities
    $hotList = array_values(array_filter($published, function ($act) {
        return !empty($act['hotBadge']['enabled']) ||
               in_array('hot', $act['displayConfig']['positions'] ?? [], true);
    }));

    // 3. Homepage showcase (for the homepage preview)
    $homepageList = array_values(array_filter($published, function ($act) {
        $positions = $act['displayConfig']['positions'] ?? [];
        return in_array('homepage', $positions, true) ||
               in_array('featured', $positions, true);
    }));
    if (count($homepageList) < 10) {
        foreach ($published as $act) {
            if (!in_array($act['id'] ?? '', array_column($homepageList, 'id'), true)) {
                $homepageList[] = $act;
                if (count($homepageList) >= 10) {
                    break;
                }
            }
        }
    }
    usort($homepageList, function ($a, $b) {
        $pA = (int) ($a['displayConfig']['priorityOrder'] ?? 999);
        $pB = (int) ($b['displayConfig']['priorityOrder'] ?? 999);
        if ($pA !== $pB) {
            return $pA <=> $pB;
        }
        $dateA = $a['publishedAt'] ?? $a['createdAt'] ?? '';
        $dateB = $b['publishedAt'] ?? $b['createdAt'] ?? '';
        return strcmp($dateB, $dateA);
    });
    $homepageList = array_slice($homepageList, 0, 10);

    // Category counts
    $rawCategories = admin_activity_categories();
    $categories = [];
    foreach ($rawCategories as $cat) {
        $catId = $cat['id'];
        $count = count(array_filter($published, fn($a) => ($a['category'] ?? '') === $catId));
        $cat['count'] = $count;
        $categories[] = $cat;
    }

    // Calculate public stats
    $totalViews = array_reduce($published, fn($acc, $a) => $acc + (int) ($a['metrics']['viewCount'] ?? 0), 0);
    $publicStats = [
        'totalPublished' => count($published),
        'totalViews' => $totalViews + 1280, // Baseline community engagement
        'totalEvents' => 50, // VieJap real activities tally
        'satisfiedPartners' => 120,
    ];

    admin_respond(200, [
        'items' => array_values($items),
        'total' => $total,
        'page' => $page,
        'limit' => $limit,
        'totalPages' => $totalPages,
        'featured' => $primaryFeatured,
        'hot' => $hotList,
        'homepage' => $homepageList,
        'categories' => $categories,
        'stats' => $publicStats,
    ]);
} catch (Throwable $e) {
    admin_respond(500, ['message' => 'Lỗi máy chủ: ' . $e->getMessage()]);
}
