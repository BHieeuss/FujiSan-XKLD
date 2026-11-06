<?php
declare(strict_types=1);

require_once __DIR__ . '/_bootstrap.php';

function get_ai_config_file_path(): string
{
    $home = admin_home_directory() ?? dirname(__DIR__, 3);
    $dir = $home . DIRECTORY_SEPARATOR . 'private' . DIRECTORY_SEPARATOR . 'viejap' . DIRECTORY_SEPARATOR . 'admin';
    if (!is_dir($dir)) {
        @mkdir($dir, 0755, true);
    }
    return $dir . DIRECTORY_SEPARATOR . 'ai-config.php';
}

function read_saved_ai_config(): array
{
    $file = get_ai_config_file_path();
    if (is_file($file)) {
        $cfg = @include $file;
        if (is_array($cfg)) {
            return $cfg;
        }
    }
    return [];
}

try {
    $method = strtoupper((string) ($_SERVER['REQUEST_METHOD'] ?? 'GET'));

    if ($method === 'GET') {
        $cfg = read_saved_ai_config();
        $envKey = trim((string) getenv('GEMINI_API_KEY'));
        $builtinKey = (string) base64_decode('QVEuQWI4Uk42S09ST0h2S2VKekFDX2xZSl9EbTBDM1pwQWpfd2RaT2pTYkU1RGZkTDJueXc=');
        $key = !empty($cfg['gemini_api_key']) ? (string) $cfg['gemini_api_key'] : ($envKey !== '' ? $envKey : $builtinKey);
        $hasKey = $key !== '';

        $masked = '';
        if ($hasKey) {
            $len = strlen($key);
            $masked = $len > 8 ? substr($key, 0, 4) . '...' . substr($key, -4) : '****';
        }

        admin_respond(200, [
            'status' => 'success',
            'has_key' => $hasKey,
            'masked_key' => $masked,
            'model' => $cfg['ai_model'] ?? 'gemini-3.5-flash',
        ]);
    }

    if ($method === 'POST') {
        $input = admin_read_json();
        $key = trim((string) ($input['apiKey'] ?? ''));
        $model = trim((string) ($input['model'] ?? 'gemini-3.5-flash'));

        if ($key === '') {
            admin_respond(400, ['message' => 'API Key không được để trống.']);
        }

        $file = get_ai_config_file_path();
        $existing = read_saved_ai_config();
        $existing['gemini_api_key'] = $key;
        $existing['ai_model'] = $model ?: 'gemini-3.5-flash';

        $export = var_export($existing, true);
        $content = "<?php\ndeclare(strict_types=1);\n\nreturn {$export};\n";

        if (file_put_contents($file, $content, LOCK_EX) === false) {
            admin_respond(500, ['message' => 'Không thể ghi file cấu hình server.']);
        }

        admin_respond(200, [
            'status' => 'success',
            'message' => 'Đã lưu Gemini API Key thành công.',
            'has_key' => true,
            'masked_key' => substr($key, 0, 4) . '...' . substr($key, -4),
        ]);
    }

    admin_respond(405, ['message' => 'Phương thức không được hỗ trợ.']);
} catch (Throwable $e) {
    admin_handle_exception($e);
}
