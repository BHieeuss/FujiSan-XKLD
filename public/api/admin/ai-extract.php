<?php
declare(strict_types=1);

require_once __DIR__ . '/_bootstrap.php';

function get_gemini_api_key(?string $providedKey = null): ?string
{
    if ($providedKey !== null && trim($providedKey) !== '') {
        return trim($providedKey);
    }

    // 1. Kiểm tra header X-AI-API-KEY
    $headerKey = trim((string) ($_SERVER['HTTP_X_AI_API_KEY'] ?? ''));
    if ($headerKey !== '') {
        return $headerKey;
    }

    // 2. Kiểm tra biến môi trường
    $envKey = trim((string) getenv('GEMINI_API_KEY'));
    if ($envKey !== '') {
        return $envKey;
    }

    // 3. Kiểm tra file cấu hình private
    $home = admin_home_directory() ?? dirname(__DIR__, 3);
    $configFile = $home
        . DIRECTORY_SEPARATOR . 'private'
        . DIRECTORY_SEPARATOR . 'viejap'
        . DIRECTORY_SEPARATOR . 'admin'
        . DIRECTORY_SEPARATOR . 'ai-config.php';
    if (is_file($configFile)) {
        $config = @include $configFile;
        if (is_array($config) && !empty($config['gemini_api_key'])) {
            return (string) $config['gemini_api_key'];
        }
    }

    // 4. Default built-in key hệ thống VieJap nếu chưa cấu hình trên hosting
    $defaultBuiltinKey = (string) base64_decode('QVEuQWI4Uk42S09ST0h2S2VKekFDX2xZSl9EbTBDM1pwQWpfd2RaT2pTYkU1RGZkTDJueXc=');
    if ($defaultBuiltinKey !== '') {
        return $defaultBuiltinKey;
    }

    return null;
}

function admin_extract_json_from_ai_response(string $text): ?array
{
    $clean = trim($text);
    if ($clean === '') {
        return null;
    }
    // 1. Thử decode trực tiếp
    $data = json_decode($clean, true);
    if (is_array($data) && isset($data['order'])) {
        return $data;
    }
    // 2. Tách khối code markdown ```json ... ``` hoặc ``` ... ```
    if (preg_match('/```(?:json)?\s*(\{.*?\})\s*```/is', $clean, $matches)) {
        $data = json_decode($matches[1], true);
        if (is_array($data) && isset($data['order'])) {
            return $data;
        }
    }
    // 3. Tìm cặp ngoặc { ... } bao ngoài cùng
    $firstBrace = strpos($clean, '{');
    $lastBrace = strrpos($clean, '}');
    if ($firstBrace !== false && $lastBrace !== false && $lastBrace > $firstBrace) {
        $jsonStr = substr($clean, $firstBrace, $lastBrace - $firstBrace + 1);
        $data = json_decode($jsonStr, true);
        if (is_array($data) && isset($data['order'])) {
            return $data;
        }
    }
    return null;
}

try {
    admin_require_method('POST');
    admin_assert_same_origin();

    $imageBytes = null;
    $mimeType = null;
    $filename = 'don-hang.jpg';
    $clientApiKey = null;
    $demoProfile = null;

    // 1. Nhận từ multipart form upload
    if (isset($_FILES['image']) && is_array($_FILES['image'])) {
        $upload = $_FILES['image'];
        $tmp = (string) ($upload['tmp_name'] ?? '');
        if (!is_uploaded_file($tmp)) {
            admin_respond(422, ['message' => 'File ảnh không hợp lệ.']);
        }
        $mimeType = (new finfo(FILEINFO_MIME_TYPE))->file($tmp);
        $imageBytes = file_get_contents($tmp);
        $filename = (string) ($upload['name'] ?? 'don-hang.jpg');
        $clientApiKey = isset($_POST['apiKey']) ? trim((string) $_POST['apiKey']) : null;
        $demoProfile = isset($_POST['demoProfile']) ? trim((string) $_POST['demoProfile']) : null;
    } else {
        // 2. Nhận từ JSON base64
        $raw = file_get_contents('php://input');
        $json = json_decode($raw, true);
        if (is_array($json)) {
            $clientApiKey = isset($json['apiKey']) ? trim((string) $json['apiKey']) : null;
            $demoProfile = isset($json['demoProfile']) ? trim((string) $json['demoProfile']) : null;
            if (!empty($json['imageBase64'])) {
                $base64 = (string) $json['imageBase64'];
                if (preg_match('/^data:(image\/[a-zA-Z0-9.+]+);base64,(.+)$/', $base64, $matches)) {
                    $mimeType = $matches[1];
                    $imageBytes = base64_decode($matches[2], true);
                } else {
                    $imageBytes = base64_decode($base64, true);
                    $mimeType = 'image/jpeg';
                }
                $filename = (string) ($json['filename'] ?? 'don-hang.jpg');
            }
        }
    }

    if ($imageBytes === null || $imageBytes === false || strlen($imageBytes) < 10) {
        admin_respond(422, ['message' => 'Không tìm thấy dữ liệu ảnh để phân tích OCR.']);
    }

    $geminiApiKey = get_gemini_api_key($clientApiKey);

    if ($geminiApiKey !== null && $geminiApiKey !== '') {
        // Đọc model đã lưu từ ai-config.php (nếu có)
        $savedModel = '';
        $home = admin_home_directory() ?? dirname(__DIR__, 3);
        $configFile = $home
            . DIRECTORY_SEPARATOR . 'private'
            . DIRECTORY_SEPARATOR . 'viejap'
            . DIRECTORY_SEPARATOR . 'admin'
            . DIRECTORY_SEPARATOR . 'ai-config.php';
        if (is_file($configFile)) {
            $cfg = @include $configFile;
            if (is_array($cfg) && !empty($cfg['ai_model'])) {
                $savedModel = (string) $cfg['ai_model'];
            }
        }
        $envModel = trim((string) getenv('AI_VISION_MODEL'));
        if ($envModel !== '') {
            $savedModel = $envModel;
        }

        // Danh sách model Gemini Vision hợp lệ (sử dụng model đang hoạt động theo chuẩn Google API 2026)
        $modelCandidates = array_values(array_unique(array_filter([
            $savedModel ?: null,
            'gemini-3.5-flash',
            'gemini-3.6-flash',
            'gemini-3.5-flash-lite',
            'gemini-flash-latest',
        ])));

        $prompt = <<<EOT
Bạn là chuyên gia bóc tách dữ liệu tài liệu thông báo tuyển dụng xuất khẩu lao động Nhật Bản (VieJap).
Đọc kỹ từng ô trong tài liệu ảnh đính kèm và trích xuất thông tin ĐÚNG THEO ẢNH ĐƯỢC TẢI LÊN:
- Tên đơn hàng: Trích xuất tên đơn hàng ghi trên tài liệu ảnh
- Mã đơn hàng: Mã đơn ghi trên tài liệu (nếu không có mã hãy để null)
- Tên xí nghiệp/công ty: Tên công ty/xí nghiệp tiếp nhận tại Nhật ghi trong ảnh
- Địa điểm làm việc: Tỉnh/Thành phố tại Nhật ghi trong ảnh (ví dụ: ISHIKAWA, AICHI, TOKYO, SAITAMA, OSAKA...)
- Ngành nghề / Công việc thực tế: Nội dung công việc cụ thể ghi trong ảnh
- Job category: Chọn 1 trong các giá trị: "food_processing", "manufacturing", "automotive", "electronics", "agriculture", "construction", "packaging", "logistics", "apparel", "restaurant", "other"
- Số lượng tuyển: Nam (nếu không ghi thì 0), Nữ (nếu không ghi thì 0), Tổng số lượng cần tuyển
- Giới tính: "female" (nếu chỉ tuyển Nữ) hoặc "male" (nếu chỉ tuyển Nam) hoặc "both" (nếu tuyển cả hai hoặc không phân biệt)
- Độ tuổi: min, max (theo tài liệu ảnh)
- Yêu cầu/điều kiện khác: Các yêu cầu về thể lực, kinh nghiệm, tiếng Nhật ghi trong ảnh
- BẢNG LƯƠNG:
  + Lương cơ bản (basic): số nguyên yên JPY (nếu có trong ảnh)
  + Lương thực lĩnh (take_home): số nguyên yên JPY (nếu có trong ảnh)
  + Lương giờ (hourly): số nguyên yên JPY (nếu có trong ảnh)
  + Thuế (tax): số nguyên yên JPY
  + Bảo hiểm (insurance): số nguyên yên JPY
  + Tiền nhà (housing): số nguyên yên JPY
  + Làm thêm (overtime): chuỗi mô tả số giờ/tiền làm thêm ghi trong ảnh
- THI TUYỂN:
  + Ngày thi tuyển (interview_date): định dạng YYYY-MM-DD
  + Hình thức thi tuyển: Phỏng vấn trực tiếp / online qua zoom...
  + Địa điểm thi tuyển
- GHI CHÚ KHÁC: Các phúc lợi, ký túc xá... ghi trong ảnh

QUY TẮC BẮT BUỘC:
1. Trích xuất chính xác theo đúng nội dung trong ảnh được tải lên.
2. Nếu trường nào không có trong ảnh, để value là null hoặc [] (đối với mảng), TUYỆT ĐỐI KHÔNG tự bịa đặt hay sao chép từ ví dụ.
3. Nếu ảnh là ảnh hiện trường chụp máy móc/công nhân/nhà máy mà không có chữ bảng lương, hãy nhận diện ngành nghề thực tế từ hình ảnh thị giác (Ví dụ: xưởng ô tô -> automotive, gia công -> manufacturing, linh kiện -> electronics, đóng hộp -> food_processing) và đặt job_title phù hợp với hình ảnh.

Trả về ĐÚNG CẤU TRÚC JSON SAU (không bọc text ngoài JSON):
{
  "order": {
    "order_code": {"value": string|null, "confidence": number, "source_text": string},
    "order_name": {"value": string|null, "confidence": number, "source_text": string},
    "company": {"value": string|null, "confidence": number, "source_text": string},
    "organization": {"value": string|null, "confidence": number, "source_text": string},
    "receiving_company": {"value": string|null, "confidence": number, "source_text": string},
    "company_address": {"value": string|null, "confidence": number, "source_text": string},
    "work_location": {"value": string[], "confidence": number, "source_text": string},
    "job_category": {"value": "automotive"|"food_processing"|"manufacturing"|"electronics"|"agriculture"|"construction"|"packaging"|"logistics"|"apparel"|"restaurant"|"other", "confidence": number},
    "job_title": {"value": string, "confidence": number, "source_text": string},
    "job_description": {"value": string, "confidence": number, "source_text": string}
  },
  "recruitment": {
    "quantity": {"value": number|null, "confidence": number},
    "male_quantity": {"value": number|null, "confidence": number},
    "female_quantity": {"value": number|null, "confidence": number},
    "gender": {"value": "male"|"female"|"both"|null, "confidence": number},
    "age_min": {"value": number|null, "confidence": number},
    "age_max": {"value": number|null, "confidence": number},
    "requirements": {"value": string[], "confidence": number}
  },
  "salary": {
    "hourly": {"value": number|null, "confidence": number, "source_text": string},
    "basic": {"value": number|null, "confidence": number, "source_text": string},
    "tax": {"value": number|null, "confidence": number},
    "insurance": {"value": number|null, "confidence": number},
    "housing": {"value": number|null, "confidence": number},
    "take_home": {"value": number|null, "confidence": number, "source_text": string},
    "overtime": {"value": string|null, "confidence": number},
    "currency": "JPY"
  },
  "selection": {
    "method": {"value": string|null, "confidence": number},
    "interview_date": {"value": "YYYY-MM-DD"|null, "confidence": number, "source_text": string},
    "interview_location": {"value": string|null, "confidence": number},
    "deadline": {"value": string|null, "confidence": number}
  },
  "departure": {
    "date": {"value": string|null, "confidence": number}
  },
  "notes": string[],
  "extra_fields": {}
}
EOT;

        $body = [
            'contents' => [
                [
                    'parts' => [
                        ['text' => $prompt],
                        [
                            'inline_data' => [
                                'mime_type' => $mimeType ?: 'image/jpeg',
                                'data' => base64_encode($imageBytes),
                            ],
                        ],
                    ],
                ],
            ],
            'generationConfig' => [
                'response_mime_type' => 'application/json',
                'temperature' => 0.1,
            ],
        ];

        $encodedBody = json_encode($body);
        $lastError = '';

        foreach ($modelCandidates as $tryModel) {
            $apiUrl = "https://generativelanguage.googleapis.com/v1beta/models/{$tryModel}:generateContent?key=" . urlencode($geminiApiKey);

            $ch = curl_init($apiUrl);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
            curl_setopt($ch, CURLOPT_POSTFIELDS, $encodedBody);
            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
            curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
            curl_setopt($ch, CURLOPT_TIMEOUT, 30);
            $res = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            $curlError = curl_error($ch);
            curl_close($ch);

            if ($httpCode === 200 && is_string($res)) {
                $parsedRes = json_decode($res, true);
                $candidateText = $parsedRes['candidates'][0]['content']['parts'][0]['text'] ?? '';
                $aiData = admin_extract_json_from_ai_response($candidateText);
                if (is_array($aiData) && isset($aiData['order'])) {
                    $aiData['source'] = [
                        'filename' => $filename,
                        'file_size_bytes' => strlen($imageBytes),
                        'mime_type' => $mimeType,
                        'model_used' => $tryModel,
                    ];
                    admin_respond(200, ['status' => 'success', 'data' => $aiData, 'mode' => 'gemini_vision']);
                }
            } else {
                $errDetail = '';
                if (is_string($res)) {
                    $errJson = json_decode($res, true);
                    $errDetail = $errJson['error']['message'] ?? substr($res, 0, 200);
                }
                if ($errDetail === '' && $curlError !== '') {
                    $errDetail = $curlError;
                }
                $lastError = "Model {$tryModel} (HTTP {$httpCode}): {$errDetail}";
                error_log("[Gemini API] " . $lastError);
            }
        }

        // Nếu tất cả model đều trả về lỗi API thật
        if ($lastError !== '') {
            admin_respond(502, [
                'status' => 'error',
                'code' => 'GEMINI_API_ERROR',
                'message' => 'Lỗi kết nối Google Gemini API: ' . $lastError,
            ]);
        }
    }

    // ----------------------------------------------------------------
    // KHÔNG có API Key: trả lỗi rõ ràng hoặc chạy chế độ demo thuần
    // Chỉ dùng dữ liệu mẫu khi người dùng BẤM NÚT "Dùng mẫu demo"
    // (demoProfile được truyền từ loadDemoSample() trong modal)
    // ----------------------------------------------------------------
    if (!$demoProfile) {
        // Người dùng upload ảnh thật nhưng không có API Key → báo lỗi
        admin_respond(422, [
            'status' => 'error',
            'code' => 'NO_API_KEY',
            'message' => 'Chưa cấu hình Gemini API Key. Vui lòng vào mục "Cấu hình AI" để nhập API Key, hoặc bấm nút "Tải mẫu demo" để xem thử với dữ liệu mẫu.',
        ]);
    }

    // Chế độ demo: chọn profile theo tham số demoProfile (không dựa vào ảnh)
    $lowerFilename = strtolower($filename);
    $selectedProfile = 'tsubama';
    if ($demoProfile === 'yamawa' || str_contains($lowerFilename, 'yamawa') || str_contains($lowerFilename, 'thuc-pham') || str_contains($lowerFilename, '20261120')) {
        $selectedProfile = 'yamawa';
    } elseif ($demoProfile === 'sankochi' || str_contains($lowerFilename, 'sankochi') || str_contains($lowerFilename, '20261027')) {
        $selectedProfile = 'sankochi';
    } elseif ($demoProfile === 'tsubama' || str_contains($lowerFilename, 'tsubama') || str_contains($lowerFilename, 'tc059') || str_contains($lowerFilename, 'co-khi')) {
        $selectedProfile = 'tsubama';
    }

    if ($selectedProfile === 'yamawa') {
        $fallbackData = [
            'order' => [
                'order_code' => ['value' => '20261120', 'confidence' => 0.98, 'source_text' => '20261120 - YAMAWA'],
                'order_name' => ['value' => 'YAMAWA', 'confidence' => 0.98, 'source_text' => 'YAMAWA'],
                'company' => ['value' => 'CÔNG TY YAMAWA', 'confidence' => 0.97, 'source_text' => 'YAMAWA - CHẾ BIẾN THỰC PHẨM'],
                'organization' => ['value' => 'Nghiệp đoàn Tiếp nhận Nhật Bản', 'confidence' => 0.85],
                'receiving_company' => ['value' => 'Xí nghiệp Yamawa', 'confidence' => 0.88],
                'company_address' => ['value' => 'Ishikawa, Nhật Bản', 'confidence' => 0.95],
                'work_location' => ['value' => ['ISHIKAWA'], 'confidence' => 0.99, 'source_text' => 'Địa điểm làm việc: ISHIKAWA'],
                'job_category' => ['value' => 'food_processing', 'confidence' => 0.99],
                'job_title' => ['value' => 'CHẾ BIẾN THỰC PHẨM', 'confidence' => 0.99, 'source_text' => 'CHẾ BIẾN THỰC PHẨM'],
                'job_description' => ['value' => 'Chế biến cơm hộp, sushi, salad, các món ăn kèm, đóng gói cơm hộp', 'confidence' => 0.97],
            ],
            'recruitment' => [
                'quantity' => ['value' => 10, 'confidence' => 0.99, 'source_text' => 'Nữ: 10'],
                'male_quantity' => ['value' => 0, 'confidence' => 0.90],
                'female_quantity' => ['value' => 10, 'confidence' => 0.99],
                'gender' => ['value' => 'female', 'confidence' => 0.99, 'source_text' => 'Nữ'],
                'age_min' => ['value' => 18, 'confidence' => 0.99, 'source_text' => 'Từ 18 đến 27'],
                'age_max' => ['value' => 27, 'confidence' => 0.99, 'source_text' => 'Từ 18 đến 27'],
                'requirements' => [
                    'value' => [
                        'Nữ độ tuổi 18–27, khỏe mạnh, nhanh nhẹn, thị lực tốt, không viêm gan B',
                        'Khi nhập cảnh giao tiếp tiếng Nhật tốt',
                        'Chế biến món ăn sẵn, cơm hộp, sushi, salad, đóng gói',
                        'Được ăn trưa miễn phí tại công ty. Ký túc xá mới xây 2025 phòng riêng tiện nghi',
                    ],
                    'confidence' => 0.96,
                ],
            ],
            'salary' => [
                'hourly' => ['value' => 1113, 'confidence' => 0.98, 'source_text' => '1,113 yên/giờ'],
                'basic' => ['value' => 192000, 'confidence' => 0.99, 'source_text' => 'Lương cơ bản: 192,000 yên'],
                'tax' => ['value' => 4410, 'confidence' => 0.96, 'source_text' => 'Thuế: 4,410 yên'],
                'insurance' => ['value' => 27771, 'confidence' => 0.96, 'source_text' => 'Bảo hiểm: 27,771 yên'],
                'housing' => ['value' => 23000, 'confidence' => 0.96, 'source_text' => 'Tiền nhà: 23,000 yên'],
                'take_home' => ['value' => 136819, 'confidence' => 0.99, 'source_text' => 'Thực lĩnh: 136,819 yên'],
                'overtime' => ['value' => 'Có nhiều làm thêm khoảng 40 tiếng/ tháng. Mỗi ngày tăng ca 1,5 - 2 tiếng', 'confidence' => 0.95],
                'currency' => 'JPY',
            ],
            'selection' => [
                'method' => ['value' => 'Phỏng vấn trực tiếp', 'confidence' => 0.98],
                'interview_date' => ['value' => '2026-11-20', 'confidence' => 0.99, 'source_text' => '20-11-2026'],
                'interview_location' => ['value' => 'VP Hồ Chí Minh', 'confidence' => 0.95],
                'deadline' => ['value' => '2026-11-20', 'confidence' => 0.90],
            ],
            'departure' => [
                'date' => ['value' => '05/2027', 'confidence' => 0.90],
            ],
            'notes' => [
                'TTS được ăn trưa tại công ty, cung cấp bữa trưa miễn phí',
                'Ký túc xá hiện đại mới xây dựng năm 2025, mỗi người 1 phòng ngủ riêng',
            ],
            'extra_fields' => [],
            'source' => [
                'filename' => $filename,
                'file_size_bytes' => strlen($imageBytes),
                'mime_type' => $mimeType,
            ],
        ];
    } elseif ($selectedProfile === 'sankochi') {
        $fallbackData = [
            'order' => [
                'order_code' => ['value' => '20261027', 'confidence' => 0.95, 'source_text' => '20261027 - SANKOCHI'],
                'order_name' => ['value' => 'SANKOCHI', 'confidence' => 0.94, 'source_text' => 'SANKOCHI'],
                'company' => ['value' => 'CÔNG TY SANKOCHI', 'confidence' => 0.93, 'source_text' => 'SANKOCHI'],
                'organization' => ['value' => 'Nghiệp đoàn Tiếp nhận Nhật Bản', 'confidence' => 0.85],
                'receiving_company' => ['value' => 'Xí nghiệp Sankochi', 'confidence' => 0.88],
                'company_address' => ['value' => 'Aichi, Shizuoka, Nhật Bản', 'confidence' => 0.89],
                'work_location' => ['value' => ['AICHI', 'SHIZUOKA'], 'confidence' => 0.98, 'source_text' => 'AICHI, SHIZUOKA'],
                'job_category' => ['value' => 'automotive', 'confidence' => 0.98],
                'job_title' => ['value' => 'SỬA CHỮA, BẢO DƯỠNG Ô TÔ', 'confidence' => 0.99, 'source_text' => 'SỬA CHỮA, BẢO DƯỠNG Ô TÔ'],
                'job_description' => ['value' => 'Sửa chữa, bảo dưỡng định kỳ và kiểm tra xe ô tô trong xưởng dịch vụ kỹ thuật', 'confidence' => 0.96],
            ],
            'recruitment' => [
                'quantity' => ['value' => 4, 'confidence' => 0.95, 'source_text' => '4'],
                'male_quantity' => ['value' => 4, 'confidence' => 0.95],
                'female_quantity' => ['value' => 0, 'confidence' => 0.95],
                'gender' => ['value' => 'male', 'confidence' => 0.98, 'source_text' => 'Nam'],
                'age_min' => ['value' => 18, 'confidence' => 0.98, 'source_text' => '18'],
                'age_max' => ['value' => 30, 'confidence' => 0.98, 'source_text' => '30'],
                'requirements' => [
                    'value' => [
                        'Nam độ tuổi 18–30, sức khỏe tốt, chăm chỉ và có tinh thần trách nhiệm',
                        'Được đào tạo bài bản kỹ thuật sửa chữa bảo dưỡng xe theo tiêu chuẩn Nhật',
                        'Không yêu cầu kinh nghiệm, tốt nghiệp THPT trở lên',
                        'Hỗ trợ chế độ sinh hoạt phí, bảo hiểm và nhà ở tiện nghi',
                    ],
                    'confidence' => 0.92,
                ],
            ],
            'salary' => [
                'hourly' => ['value' => 1154, 'confidence' => 0.98, 'source_text' => '1,154 yên/giờ'],
                'basic' => ['value' => 190410, 'confidence' => 0.99, 'source_text' => '190,410 yên'],
                'tax' => ['value' => 12500, 'confidence' => 0.85],
                'insurance' => ['value' => 22800, 'confidence' => 0.85],
                'housing' => ['value' => 15000, 'confidence' => 0.88],
                'take_home' => ['value' => 140110, 'confidence' => 0.98, 'source_text' => '140,110 yên'],
                'overtime' => ['value' => 'Có làm thêm từ 25-40 giờ/tháng', 'confidence' => 0.90],
                'currency' => 'JPY',
            ],
            'selection' => [
                'method' => ['value' => 'Phỏng vấn trực tiếp hoặc thi tay nghề', 'confidence' => 0.88],
                'interview_date' => ['value' => '2026-10-27', 'confidence' => 0.99, 'source_text' => '27-10-2026'],
                'interview_location' => ['value' => 'Văn phòng VieJap hoặc trực tuyến', 'confidence' => 0.90],
                'deadline' => ['value' => '2026-10-20', 'confidence' => 0.88],
            ],
            'departure' => [
                'date' => ['value' => '04/2027', 'confidence' => 0.92],
            ],
            'notes' => [
                'Đơn hàng chất lượng cao tại khu vực Aichi & Shizuoka',
            ],
            'extra_fields' => [],
            'source' => [
                'filename' => $filename,
                'file_size_bytes' => strlen($imageBytes),
                'mime_type' => $mimeType,
            ],
        ];
    } else {
        // Tsubama profile
        $fallbackData = [
            'order' => [
                'order_code' => ['value' => 'TC059M', 'confidence' => 0.98, 'source_text' => 'MÃ: TC059M'],
                'order_name' => ['value' => 'TSUBAMA', 'confidence' => 0.97, 'source_text' => 'TSUBAMA'],
                'company' => ['value' => 'CÔNG TY TSUBAMA', 'confidence' => 0.96, 'source_text' => 'TÊN CÔNG TY: TSUBAMA'],
                'organization' => ['value' => 'Nghiệp đoàn Tiếp nhận Nhật Bản', 'confidence' => 0.85],
                'receiving_company' => ['value' => 'Xí nghiệp Tsubama', 'confidence' => 0.88],
                'company_address' => ['value' => 'Saitama, Nhật Bản', 'confidence' => 0.95],
                'work_location' => ['value' => ['SAITAMA'], 'confidence' => 0.99, 'source_text' => 'ĐỊA ĐIỂM LÀM VIỆC: SAITAMA'],
                'job_category' => ['value' => 'manufacturing', 'confidence' => 0.98],
                'job_title' => ['value' => 'GIA CÔNG CƠ KHÍ', 'confidence' => 0.99, 'source_text' => 'TIẾNG VIỆT: GIA CÔNG CƠ KHÍ'],
                'job_description' => ['value' => 'Sử dụng máy (gia công CNC) để gia công các sản phẩm nhôm, kiểm hàng...', 'confidence' => 0.96],
            ],
            'recruitment' => [
                'quantity' => ['value' => 3, 'confidence' => 0.98, 'source_text' => 'NAM: 3'],
                'male_quantity' => ['value' => 3, 'confidence' => 0.98],
                'female_quantity' => ['value' => 0, 'confidence' => 0.90],
                'gender' => ['value' => 'male', 'confidence' => 0.99, 'source_text' => 'NAM: 3'],
                'age_min' => ['value' => 18, 'confidence' => 0.99, 'source_text' => 'Từ 18 đến 28 tuổi'],
                'age_max' => ['value' => 28, 'confidence' => 0.99, 'source_text' => 'Từ 18 đến 28 tuổi'],
                'requirements' => [
                    'value' => [
                        'Nam độ tuổi 18–28, sức khỏe tốt, vui vẻ, hòa đồng',
                        'Không yêu cầu kinh nghiệm, mong muốn làm việc tại Nhật lâu dài',
                        'Sử dụng máy (gia công CNC) gia công các sản phẩm nhôm, kiểm hàng',
                        'Môi trường xưởng cơ khí hiện đại, công ty hỗ trợ đào tạo bài bản',
                    ],
                    'confidence' => 0.95,
                ],
            ],
            'salary' => [
                'hourly' => ['value' => 1196, 'confidence' => 0.98, 'source_text' => '1,196 YÊN/GIỜ (chưa tính tăng ca)'],
                'basic' => ['value' => 191090, 'confidence' => 0.99, 'source_text' => 'Lương cơ bản: 191,090 YÊN/THÁNG'],
                'tax' => ['value' => 3500, 'confidence' => 0.95, 'source_text' => 'Thuế: 3,500 yên'],
                'insurance' => ['value' => 26300, 'confidence' => 0.95, 'source_text' => 'Bảo hiểm: 26,300 yên'],
                'housing' => ['value' => 15000, 'confidence' => 0.95, 'source_text' => 'Tiền nhà: 15,000 yên'],
                'take_home' => ['value' => 146200, 'confidence' => 0.99, 'source_text' => 'Thực lĩnh: 146,200 yên'],
                'overtime' => ['value' => 'Công ty có nhiều việc làm thêm khoảng 40 tiếng/ tháng', 'confidence' => 0.95],
                'currency' => 'JPY',
            ],
            'selection' => [
                'method' => ['value' => 'Phỏng vấn trực tiếp', 'confidence' => 0.98],
                'interview_date' => ['value' => '2026-10-10', 'confidence' => 0.99, 'source_text' => 'NGÀY 10/10/2026'],
                'interview_location' => ['value' => 'Trực tiếp', 'confidence' => 0.90],
                'deadline' => ['value' => '2026-10-05', 'confidence' => 0.85],
            ],
            'departure' => [
                'date' => ['value' => '04/2027', 'confidence' => 0.90],
            ],
            'notes' => [
                'Đơn hàng xuất khẩu lao động Thực tập sinh Nhật Bản - Tsubama',
                'Cung ứng nhân lực quốc tế Fujisan - SĐT: 0966 966 284',
            ],
            'extra_fields' => [],
            'source' => [
                'filename' => $filename,
                'file_size_bytes' => strlen($imageBytes),
                'mime_type' => $mimeType,
            ],
        ];
    }

    admin_respond(200, [
        'status' => 'success',
        'data' => $fallbackData,
        'mode' => 'simulated_fallback',
        'notice' => 'Đây là dữ liệu mẫu demo (không đọc từ ảnh thực tế). Để AI đọc ảnh thông báo đơn hàng bất kỳ, vui lòng cấu hình Gemini API Key.',
    ]);
} catch (Throwable $error) {
    admin_handle_exception($error);
}
