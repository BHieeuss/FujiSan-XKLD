<?php
declare(strict_types=1);

require_once __DIR__ . '/_bootstrap.php';
require_once __DIR__ . '/_database.php';
require_once __DIR__ . '/_rbac.php';
require_once __DIR__ . '/_notifications.php';

function admin_activities_file_path(): string
{
    return admin_storage_directory() . DIRECTORY_SEPARATOR . 'activities.json';
}

function admin_activity_categories(): array
{
    return [
        ['id' => 'student', 'name' => 'Hoạt động học viên', 'icon' => 'fas fa-user-graduate', 'color' => '#10b981'],
        ['id' => 'culture', 'name' => 'Văn hóa Nhật Bản', 'icon' => 'fas fa-torii-gate', 'color' => '#f43f5e'],
        ['id' => 'diplomacy', 'name' => 'Hoạt động đối ngoại', 'icon' => 'fas fa-earth-asia', 'color' => '#0284c7'],
        ['id' => 'business', 'name' => 'Kết nối doanh nghiệp', 'icon' => 'fas fa-handshake', 'color' => '#8b5cf6'],
        ['id' => 'community', 'name' => 'Chia sẻ cộng đồng', 'icon' => 'fas fa-heart', 'color' => '#f59e0b'],
        ['id' => 'internal', 'name' => 'Hoạt động nội bộ', 'icon' => 'fas fa-users', 'color' => '#64748b'],
    ];
}

function admin_activity_templates(): array
{
    return [
        [
            'id' => 'template-student',
            'name' => 'Mẫu Hoạt Động Học Viên',
            'category' => 'student',
            'description' => 'Tập trung vào lớp học tiếng Nhật, hoạt động ngoại khóa, kỹ năng và đời sống học viên.',
            'badge' => 'Phổ biến',
            'recommendedCoverRatio' => '16:9',
            'blocks' => [
                ['id' => 'b1', 'type' => 'heading', 'content' => 'Hành trình học tập và rèn luyện tại VieJap', 'order' => 1, 'isVisible' => true],
                ['id' => 'b2', 'type' => 'paragraph', 'content' => 'Học viên VieJap không chỉ học ngôn ngữ Nhật Bản mà còn được trang bị văn hóa ứng xử, tác phong làm việc chuẩn mực.', 'order' => 2, 'isVisible' => true],
                ['id' => 'b3', 'type' => 'event_info', 'content' => 'Thông tin sự kiện rèn luyện', 'order' => 3, 'isVisible' => true],
                ['id' => 'b4', 'type' => 'gallery', 'content' => 'Bộ sưu tập khoảnh khắc lớp học', 'layout' => 'grid', 'order' => 4, 'isVisible' => true],
                ['id' => 'b5', 'type' => 'callout', 'content' => 'VieJap luôn đồng hành cùng các em từ buổi học đầu tiên đến ngày đặt chân đến xứ sở hoa anh đào.', 'order' => 5, 'isVisible' => true],
            ],
        ],
        [
            'id' => 'template-culture',
            'name' => 'Mẫu Sự Kiện Văn Hóa Nhật Bản',
            'category' => 'culture',
            'description' => 'Trình bày các lễ hội truyền thống (Tanabata, Obon, Trà đạo, Yukata) với nhiều hình ảnh đặc sắc.',
            'badge' => 'Sự kiện',
            'recommendedCoverRatio' => '16:9',
            'blocks' => [
                ['id' => 'b1', 'type' => 'heading', 'content' => 'Không gian văn hóa Nhật Bản tại VieJap', 'order' => 1, 'isVisible' => true],
                ['id' => 'b2', 'type' => 'paragraph', 'content' => 'Trải nghiệm văn hóa thực thụ giúp học viên hòa nhập tự tin và nhanh chóng khi sang Nhật làm việc.', 'order' => 2, 'isVisible' => true],
                ['id' => 'b3', 'type' => 'gallery', 'content' => 'Hình ảnh hoạt động trải nghiệm', 'layout' => 'wide', 'order' => 3, 'isVisible' => true],
                ['id' => 'b4', 'type' => 'quote', 'content' => 'Hiểu về văn hóa là chìa khóa mở ra sự gắn kết bền chặt giữa người lao động Việt Nam và doanh nghiệp Nhật Bản.', 'order' => 4, 'isVisible' => true],
            ],
        ],
        [
            'id' => 'template-diplomacy',
            'name' => 'Mẫu Hoạt Động Đối Ngoại',
            'category' => 'diplomacy',
            'description' => 'Hội thảo chính sách, tiếp xúc đại sứ quán, hiệp hội thương mại và đối ngoại Việt - Nhật.',
            'badge' => 'Trang trọng',
            'recommendedCoverRatio' => '16:9',
            'blocks' => [
                ['id' => 'b1', 'type' => 'heading', 'content' => 'Hiện diện tại diễn đàn hợp tác quốc tế', 'order' => 1, 'isVisible' => true],
                ['id' => 'b2', 'type' => 'paragraph', 'content' => 'Đại diện ban lãnh đạo VieJap tham dự các hội nghị quan trọng nhằm cập nhật chính sách lao động mới nhất.', 'order' => 2, 'isVisible' => true],
                ['id' => 'b3', 'type' => 'bullet_list', 'items' => ['Tiếp cận xu hướng tiếp nhận nhân lực Nhật Bản', 'Đảm bảo quyền lợi hợp pháp cho người lao động', 'Xây dựng mối quan hệ tin cậy với đối tác'], 'order' => 3, 'isVisible' => true],
                ['id' => 'b4', 'type' => 'gallery', 'content' => 'Hình ảnh hội nghị đối ngoại', 'order' => 4, 'isVisible' => true],
            ],
        ],
        [
            'id' => 'template-business',
            'name' => 'Mẫu Ký Kết & Hợp Tác Doanh Nghiệp',
            'category' => 'business',
            'description' => 'Ký kết biên bản ghi nhớ (MOU), tiếp đón đoàn nghiệp đoàn và chủ xí nghiệp Nhật Bản.',
            'badge' => 'Hợp tác',
            'recommendedCoverRatio' => '16:9',
            'blocks' => [
                ['id' => 'b1', 'type' => 'heading', 'content' => 'Lễ ký kết thỏa thuận hợp tác cung ứng nhân lực', 'order' => 1, 'isVisible' => true],
                ['id' => 'b2', 'type' => 'paragraph', 'content' => 'VieJap và đối tác chính thức thiết lập quan hệ hợp tác chiến lược, mở ra nhiều cơ hội việc làm chất lượng cao.', 'order' => 2, 'isVisible' => true],
                ['id' => 'b3', 'type' => 'event_info', 'content' => 'Nội dung thỏa thuận hợp tác', 'order' => 3, 'isVisible' => true],
                ['id' => 'b4', 'type' => 'gallery', 'content' => 'Hình ảnh lễ ký kết và trao quà lưu niệm', 'order' => 4, 'isVisible' => true],
            ],
        ],
        [
            'id' => 'template-community',
            'name' => 'Mẫu Hoạt Động Cộng Đồng & Thiện Nguyện',
            'category' => 'community',
            'description' => 'Chương trình vì cộng đồng, hướng nghiệp trường THPT, tặng quà học sinh khó khăn.',
            'badge' => 'Ý nghĩa',
            'recommendedCoverRatio' => '16:9',
            'blocks' => [
                ['id' => 'b1', 'type' => 'heading', 'content' => 'Chung tay vì cộng đồng và thế hệ tương lai', 'order' => 1, 'isVisible' => true],
                ['id' => 'b2', 'type' => 'paragraph', 'content' => 'Bên cạnh công tác đào tạo, VieJap luôn trân trọng trách nhiệm xã hội và lan tỏa những giá trị nhân văn tốt đẹp.', 'order' => 2, 'isVisible' => true],
                ['id' => 'b3', 'type' => 'gallery', 'content' => 'Khoảnh khắc trao gửi yêu thương', 'order' => 3, 'isVisible' => true],
            ],
        ],
        [
            'id' => 'template-internal',
            'name' => 'Mẫu Sự Kiện Nội Bộ & Đội Ngũ',
            'category' => 'internal',
            'description' => 'Team building, sinh nhật cán bộ, tổng kết quý và văn hóa nội bộ công ty.',
            'badge' => 'Nội bộ',
            'recommendedCoverRatio' => '16:9',
            'blocks' => [
                ['id' => 'b1', 'type' => 'heading', 'content' => 'Đoàn kết và bứt phá cùng gia đình VieJap', 'order' => 1, 'isVisible' => true],
                ['id' => 'b2', 'type' => 'paragraph', 'content' => 'Những giây phút gắn kết, tiếp thêm năng lượng để toàn thể đội ngũ VieJap phục vụ học viên tốt hơn.', 'order' => 2, 'isVisible' => true],
                ['id' => 'b3', 'type' => 'gallery', 'content' => 'Ảnh sinh hoạt tập thể', 'order' => 3, 'isVisible' => true],
            ],
        ],
        [
            'id' => 'template-quick',
            'name' => 'Mẫu Tin Hoạt Động Nhanh',
            'category' => 'student',
            'description' => 'Tin xuất cảnh ngắn, tiễn học viên bay sang Nhật, thông báo lịch thi tuyển.',
            'badge' => 'Tin nhanh',
            'recommendedCoverRatio' => '16:9',
            'blocks' => [
                ['id' => 'b1', 'type' => 'heading', 'content' => 'Chúc mừng học viên VieJap xuất cảnh thành công', 'order' => 1, 'isVisible' => true],
                ['id' => 'b2', 'type' => 'paragraph', 'content' => 'Hôm nay, những cánh chim VieJap tiếp theo chính thức cất cánh sang Nhật Bản. Chúc các em luôn vững vàng và thành công!', 'order' => 2, 'isVisible' => true],
                ['id' => 'b3', 'type' => 'image', 'content' => 'Ảnh đoàn học viên tại sân bay Tân Sơn Nhất', 'order' => 3, 'isVisible' => true],
            ],
        ],
        [
            'id' => 'template-special',
            'name' => 'Mẫu Sự Kiện Đặc Biệt / Đại Lễ',
            'category' => 'diplomacy',
            'description' => 'Sự kiện lớn kỷ niệm, khai trương cơ sở, đối thoại quy mô lớn.',
            'badge' => 'Đặc biệt',
            'recommendedCoverRatio' => '16:9',
            'blocks' => [
                ['id' => 'b1', 'type' => 'heading', 'content' => 'Sự kiện đặc biệt đánh dấu cột mốc phát triển mới', 'order' => 1, 'isVisible' => true],
                ['id' => 'b2', 'type' => 'callout', 'content' => 'Một dấu ấn đáng nhớ khẳng định vị thế và uy tín vững chắc của VieJap trong lĩnh vực cầu nối nhân lực Nhật Bản.', 'order' => 2, 'isVisible' => true],
                ['id' => 'b3', 'type' => 'event_info', 'content' => 'Chương trình chi tiết', 'order' => 3, 'isVisible' => true],
                ['id' => 'b4', 'type' => 'gallery', 'content' => 'Toàn cảnh đại lễ', 'layout' => 'wide', 'order' => 4, 'isVisible' => true],
            ],
        ],
    ];
}

function admin_activities_seed_data(): array
{
    $now = date('Y-m-d H:i:s');
    $hotExpireIn14Days = date('Y-m-d H:i:s', time() + 14 * 86400);

    return [
        [
            'id' => 'act-tokyo-conference-2026',
            'code' => 'HD-2026-001',
            'slug' => 'hoi-thao-ket-noi-thuong-mai-nhat-ban-viet-nam',
            'title' => 'Hội thảo kết nối thương mại, đầu tư Việt Nam - Nhật Bản tại Tokyo',
            'category' => 'diplomacy',
            'categoryName' => 'Hoạt động đối ngoại',
            'level' => 'special',
            'status' => 'published',
            'eventDate' => '12/06/2026',
            'eventTime' => '09:00 - 16:30',
            'location' => 'Tokyo, Nhật Bản',
            'organizer' => 'VieJap & Đối tác Nhật Bản',
            'participants' => 'Đại diện cơ quan hữu quan & các doanh nghiệp hai nước',
            'summary' => 'Đại diện VieJap có mặt tại chương trình kết nối thương mại, đầu tư Việt Nam - Nhật Bản tại Tokyo, lắng nghe thông tin chính sách và xu hướng hợp tác giữa doanh nghiệp hai nước. Dấu ấn quan trọng giúp phụ huynh và học viên thấy VieJap theo sát các hoạt động chính thống.',
            'metric' => '12/06',
            'metricLabel' => '2026',
            'highlights' => [
                'Ghi nhận thông tin chính sách từ các cơ quan ngoại giao Việt Nam tại Nhật Bản',
                'Nắm bắt nhu cầu tiếp nhận nguồn nhân lực chất lượng cao của doanh nghiệp Nhật',
                'Bổ sung góc nhìn thực tế vững chắc để tư vấn lộ trình làm việc có căn cứ hơn',
            ],
            'coverImage' => [
                'id' => 'img-cov-1',
                'src' => '/assets/images/HoatDong/HoiThaoKetNoiThuongMaiNhatBanVietNamTokyo/z8133501619094_4779c4fedee3319d35993e9d8245e39e.jpg',
                'alt' => 'Đại diện VieJap tại địa điểm hội thảo kết nối thương mại Việt Nam Nhật Bản ở Tokyo',
                'caption' => 'Đại diện VieJap trước sảnh hội trường hội thảo Tokyo',
                'aspectRatio' => '16:9',
                'order' => 1,
            ],
            'gallery' => [
                [
                    'id' => 'img-g1',
                    'src' => '/assets/images/HoatDong/HoiThaoKetNoiThuongMaiNhatBanVietNamTokyo/z8133501619094_4779c4fedee3319d35993e9d8245e39e.jpg',
                    'alt' => 'Đại diện VieJap tại địa điểm hội thảo Tokyo',
                    'caption' => 'Toàn cảnh sảnh đón tiếp đại biểu',
                    'order' => 1,
                ],
                [
                    'id' => 'img-g2',
                    'src' => '/assets/images/HoatDong/HoiThaoKetNoiThuongMaiNhatBanVietNamTokyo/z8133501563234_f1ada3713c353334bcfb450e7bc034dc.jpg',
                    'alt' => 'Không gian hội thảo kết nối thương mại đầu tư Việt Nam Nhật Bản tại Tokyo',
                    'caption' => 'Hội trường diễn ra các phiên thảo luận chuyên đề',
                    'order' => 2,
                ],
                [
                    'id' => 'img-g3',
                    'src' => '/assets/images/HoatDong/HoiThaoKetNoiThuongMaiNhatBanVietNamTokyo/z8133501555441_850733ed873571cad929cd48bb4d926f.jpg',
                    'alt' => 'Đại diện VieJap trong không gian hội thảo thương mại Việt Nam Nhật Bản',
                    'caption' => 'Gặp gỡ trao đổi với các doanh nghiệp tiếp nhận Nhật Bản',
                    'order' => 3,
                ],
                [
                    'id' => 'img-g4',
                    'src' => '/assets/images/HoatDong/HoiThaoKetNoiThuongMaiNhatBanVietNamTokyo/z8133501551421_1ca85205498f768989b213f438dddc47.jpg',
                    'alt' => 'Phần trình bày tại hội thảo kết nối thương mại đầu tư Việt Nam Nhật Bản',
                    'caption' => 'Thuyết trình cơ hội hợp tác và phát triển nhân lực',
                    'order' => 4,
                ],
            ],
            'videoUrl' => '',
            'videoThumbnail' => '',
            'templateId' => 'template-diplomacy',
            'blocks' => [
                [
                    'id' => 'b1',
                    'type' => 'heading',
                    'content' => 'VieJap đồng hành cùng dòng chảy hợp tác Việt Nam - Nhật Bản',
                    'order' => 1,
                    'isVisible' => true,
                ],
                [
                    'id' => 'b2',
                    'type' => 'paragraph',
                    'content' => 'Hội thảo tại Tokyo là dịp để VieJap tiếp cận trực tiếp những quy định và cơ chế mới trong tiếp nhận lao động kỹ năng đặc định, thực tập sinh và kỹ sư tại Nhật. Qua đó, mọi định hướng đào tạo tại trung tâm đều bám sát thực tiễn.',
                    'order' => 2,
                    'isVisible' => true,
                ],
                [
                    'id' => 'b3',
                    'type' => 'event_info',
                    'content' => 'Địa điểm: Trung tâm Hội nghị Quốc tế Tokyo | Thời gian: 12/06/2026',
                    'order' => 3,
                    'isVisible' => true,
                ],
                [
                    'id' => 'b4',
                    'type' => 'gallery',
                    'content' => 'Ghi nhận hình ảnh tại sự kiện',
                    'layout' => 'grid',
                    'order' => 4,
                    'isVisible' => true,
                ],
                [
                    'id' => 'b5',
                    'type' => 'callout',
                    'content' => 'VieJap cam kết mang lại lộ trình minh bạch, an tâm cho học viên và phụ huynh.',
                    'order' => 5,
                    'isVisible' => true,
                ],
            ],
            'hotBadge' => [
                'enabled' => false,
                'durationDays' => 7,
                'expiresAt' => null,
                'badgeLabel' => 'HOT',
            ],
            'featuredBadge' => [
                'enabled' => true,
                'expiresAt' => null,
                'badgeLabel' => 'SỰ KIỆN ĐẶC BIỆT',
            ],
            'displayConfig' => [
                'positions' => ['featured', 'latest', 'homepage'],
                'priorityOrder' => 1,
                'startDate' => null,
                'endDate' => null,
            ],
            'seo' => [
                'metaTitle' => 'VieJap tham dự hội thảo kết nối thương mại Việt Nam - Nhật Bản tại Tokyo',
                'slug' => 'hoi-thao-ket-noi-thuong-mai-nhat-ban-viet-nam',
                'metaDescription' => 'Đại diện VieJap tham dự hội thảo thương mại tại Tokyo, cập nhật chính sách lao động và mở rộng hợp tác.',
            ],
            'viewCount' => 342,
            'authorId' => 'admin',
            'authorName' => 'Super Administrator',
            'createdAt' => date('Y-m-d H:i:s', time() - 86400 * 5),
            'updatedAt' => $now,
            'publishedAt' => date('Y-m-d H:i:s', time() - 86400 * 5),
        ],
        [
            'id' => 'act-tanabata-festival-2026',
            'code' => 'HD-2026-002',
            'slug' => 'le-hoi-tanabata-hoc-vien-viejap-tra-vinh',
            'title' => 'Lễ hội Tanabata ngập tràn sắc màu cùng học viên VieJap tại Trà Vinh',
            'category' => 'culture',
            'categoryName' => 'Văn hóa Nhật Bản',
            'level' => 'hot',
            'status' => 'published',
            'eventDate' => '07/07/2026',
            'eventTime' => '14:00 - 18:00',
            'location' => 'Trung tâm Đào tạo VieJap, Trà Vinh',
            'organizer' => 'Đội ngũ giáo viên & Học viên VieJap',
            'participants' => 'Toàn thể học viên các lớp tiếng Nhật N5, N4 và giáo viên bản ngữ',
            'summary' => 'Ngày hội văn hóa Tanabata (Lễ ngưu lang chức nữ) diễn ra rộn ràng với hoạt động viết điều ước Tanzaku, mặc trang phục truyền thống Yukata và giao lưu tiếng Nhật. Hoạt động giúp các bạn học viên cảm nhận trọn vẹn nét đẹp văn hóa Nhật Bản.',
            'metric' => '07/07',
            'metricLabel' => '2026',
            'highlights' => [
                'Học viên tự tay viết mong ước bằng tiếng Nhật lên những dải giấy Tanzaku',
                'Trải nghiệm mặc Yukata và giao tiếp tình huống thực tế với giáo viên người Nhật',
                'Gắn kết tinh thần đồng đội và tiếp thêm động lực vượt qua kỳ thi JLPT',
            ],
            'coverImage' => [
                'id' => 'img-cov-2',
                'src' => '/assets/images/HoatDong/LeHoiTanabata-HOCVIENVIEJAPTAITRAVINH/z8133505656699_7c20f3b8ec5dcbb3717ec769adbee73d.jpg',
                'alt' => 'Học viên VieJap trong trang phục Yukata tại lễ hội Tanabata',
                'caption' => 'Khoảnh khắc rạng rỡ của học viên trong ngày hội Tanabata',
                'aspectRatio' => '16:9',
                'order' => 1,
            ],
            'gallery' => [
                [
                    'id' => 'img-tb-1',
                    'src' => '/assets/images/HoatDong/LeHoiTanabata-HOCVIENVIEJAPTAITRAVINH/z8133505656699_7c20f3b8ec5dcbb3717ec769adbee73d.jpg',
                    'alt' => 'Học viên VieJap chụp ảnh lưu niệm Tanabata',
                    'caption' => 'Không gian trang trí cây tre điều ước Tanabata',
                    'order' => 1,
                ],
                [
                    'id' => 'img-tb-2',
                    'src' => '/assets/images/HoatDong/LeHoiTanabata-HOCVIENVIEJAPTAITRAVINH/z8133505695509_5d85fc6c09e336a1c80fdd2c6a07e6c6.jpg',
                    'alt' => 'Treo thẻ điều ước Tanzaku lên nhành tre',
                    'caption' => 'Gửi gắm ước mơ bay xa sang đất nước Nhật Bản',
                    'order' => 2,
                ],
                [
                    'id' => 'img-tb-3',
                    'src' => '/assets/images/HoatDong/LeHoiTanabata-HOCVIENVIEJAPTAITRAVINH/z8133505738737_35ea9520f527116503dfbd356352a239.jpg',
                    'alt' => 'Giao lưu văn hóa cùng giáo viên Nhật Bản',
                    'caption' => 'Thực hành hội thoại tiếng Nhật trong bối cảnh lễ hội',
                    'order' => 3,
                ],
                [
                    'id' => 'img-tb-4',
                    'src' => '/assets/images/HoatDong/LeHoiTanabata-HOCVIENVIEJAPTAITRAVINH/z8133505742124_541edb51ddb2aff6522548d0843c93ef.jpg',
                    'alt' => 'Trải nghiệm ẩm thực và trò chơi dân gian Nhật',
                    'caption' => 'Học viên hào hứng tham gia các trò chơi truyền thống',
                    'order' => 4,
                ],
                [
                    'id' => 'img-tb-5',
                    'src' => '/assets/images/HoatDong/LeHoiTanabata-HOCVIENVIEJAPTAITRAVINH/z8133505764864_db83bbc2642141fe4c7d80ddc5c9be51.jpg',
                    'alt' => 'Khoảnh khắc rạng rỡ của các bạn trẻ VieJap',
                    'caption' => 'Kỷ niệm khó quên trên hành trình chuẩn bị sang Nhật',
                    'order' => 5,
                ],
            ],
            'videoUrl' => '',
            'videoThumbnail' => '',
            'templateId' => 'template-culture',
            'blocks' => [
                [
                    'id' => 'b1',
                    'type' => 'heading',
                    'content' => 'Gửi gắm điều ước vào ngày hội Tanabata',
                    'order' => 1,
                    'isVisible' => true,
                ],
                [
                    'id' => 'b2',
                    'type' => 'paragraph',
                    'content' => 'Tanabata là một trong những lễ hội mùa hè được mong chờ nhất tại Nhật Bản. Tại VieJap Trà Vinh, thầy cô và học viên đã cùng nhau tạo nên một không gian lễ hội đậm đà bản sắc.',
                    'order' => 2,
                    'isVisible' => true,
                ],
                [
                    'id' => 'b3',
                    'type' => 'gallery',
                    'content' => 'Bộ ảnh kỷ niệm Tanabata',
                    'layout' => 'wide',
                    'order' => 3,
                    'isVisible' => true,
                ],
            ],
            'hotBadge' => [
                'enabled' => true,
                'durationDays' => 14,
                'expiresAt' => $hotExpireIn14Days,
                'badgeLabel' => 'ĐANG HOT',
            ],
            'featuredBadge' => [
                'enabled' => false,
                'expiresAt' => null,
                'badgeLabel' => 'NỔI BẬT',
            ],
            'displayConfig' => [
                'positions' => ['hot', 'latest', 'homepage'],
                'priorityOrder' => 1,
                'startDate' => null,
                'endDate' => null,
            ],
            'seo' => [
                'metaTitle' => 'Lễ hội Tanabata ngập tràn sắc màu cùng học viên VieJap',
                'slug' => 'le-hoi-tanabata-hoc-vien-viejap-tra-vinh',
                'metaDescription' => 'Cùng ngắm nhìn những khoảnh khắc đáng nhớ của học viên VieJap trong lễ hội truyền thống Tanabata Nhật Bản.',
            ],
            'viewCount' => 518,
            'authorId' => 'admin',
            'authorName' => 'Super Administrator',
            'createdAt' => date('Y-m-d H:i:s', time() - 86400 * 3),
            'updatedAt' => $now,
            'publishedAt' => date('Y-m-d H:i:s', time() - 86400 * 3),
        ],
        [
            'id' => 'act-international-culture-exchange',
            'code' => 'HD-2026-003',
            'slug' => 'ket-noi-van-hoa-nhat-ban-cong-dong-quoc-te',
            'title' => 'Kết nối văn hóa Nhật Bản cùng cộng đồng quốc tế',
            'category' => 'culture',
            'categoryName' => 'Văn hóa Nhật Bản',
            'level' => 'featured',
            'status' => 'published',
            'eventDate' => '15/05/2026',
            'eventTime' => '08:30 - 17:00',
            'location' => 'TP. Hồ Chí Minh',
            'organizer' => 'Hiệp hội Giao lưu Văn hóa Quốc tế & VieJap',
            'participants' => 'Đại diện doanh nghiệp, sinh viên và thanh niên định hướng Nhật Bản',
            'summary' => 'VieJap tham gia gian hàng giao lưu văn hóa và tư vấn việc làm tại ngày hội quốc tế. Hàng trăm bạn trẻ đã được tiếp cận trực tiếp các đơn hàng xuất khẩu lao động minh bạch, mức lương rõ ràng và chính sách hỗ trợ vay vốn ưu đãi.',
            'metric' => '15/05',
            'metricLabel' => '2026',
            'highlights' => [
                'Tư vấn trực tiếp điều kiện tham gia các chương trình Kỹ sư, Tokutei và TTS',
                'Hướng dẫn học viên làm quen với bảng chữ cái và câu chào giao tiếp tiếng Nhật',
                'Trao tặng học bổng khóa học tiếng Nhật cơ bản cho các bạn trẻ đăng ký sớm',
            ],
            'coverImage' => [
                'id' => 'img-cov-3',
                'src' => '/assets/images/HoatDong/KetnoiVanHoaNHATBAN/z8133500635420_40b1f4a1ea06ef1d59b6659954ed3209.jpg',
                'alt' => 'Gian hàng VieJap tại ngày hội kết nối văn hóa Nhật Bản',
                'caption' => 'Đông đảo các bạn trẻ đến tìm hiểu chương trình tại gian hàng VieJap',
                'aspectRatio' => '16:9',
                'order' => 1,
            ],
            'gallery' => [
                [
                    'id' => 'img-kn-1',
                    'src' => '/assets/images/HoatDong/KetnoiVanHoaNHATBAN/z8133500635420_40b1f4a1ea06ef1d59b6659954ed3209.jpg',
                    'alt' => 'Gian hàng VieJap tại ngày hội',
                    'caption' => 'Tư vấn tận tâm từng thắc mắc của ứng viên',
                    'order' => 1,
                ],
                [
                    'id' => 'img-kn-2',
                    'src' => '/assets/images/HoatDong/KetnoiVanHoaNHATBAN/z8133499906629_819c6a8040435c62a85fcec08c21ab9d.jpg',
                    'alt' => 'Không gian giao lưu văn hóa Nhật Bản',
                    'caption' => 'Hoạt động trải nghiệm thủ công mỹ nghệ Nhật Bản',
                    'order' => 2,
                ],
                [
                    'id' => 'img-kn-3',
                    'src' => '/assets/images/HoatDong/KetnoiVanHoaNHATBAN/z8133500170124_f1204241d27bc43f961d4146ef533e37.jpg',
                    'alt' => 'Chụp ảnh cùng trang phục truyền thống',
                    'caption' => 'Sự quan tâm tích cực của cộng đồng thanh niên',
                    'order' => 3,
                ],
                [
                    'id' => 'img-kn-4',
                    'src' => '/assets/images/HoatDong/KetnoiVanHoaNHATBAN/z8133500233287_a7bdb8c0f6696f8f282b09c602f161d8.jpg',
                    'alt' => 'Học viên nhận tài liệu tư vấn nghề nghiệp',
                    'caption' => 'Cung cấp tài liệu định hướng rõ ràng, minh bạch',
                    'order' => 4,
                ],
            ],
            'videoUrl' => '',
            'videoThumbnail' => '',
            'templateId' => 'template-culture',
            'blocks' => [
                [
                    'id' => 'b1',
                    'type' => 'heading',
                    'content' => 'Giao lưu văn hóa - Cầu nối ước mơ Nhật Bản',
                    'order' => 1,
                    'isVisible' => true,
                ],
                [
                    'id' => 'b2',
                    'type' => 'paragraph',
                    'content' => 'Ngày hội là cầu nối thiết thực đưa văn hóa xứ Phù Tang đến gần hơn với tuổi trẻ Việt Nam, đồng thời định hướng con đường lập nghiệp vững chắc.',
                    'order' => 2,
                    'isVisible' => true,
                ],
            ],
            'hotBadge' => [
                'enabled' => false,
                'durationDays' => 7,
                'expiresAt' => null,
                'badgeLabel' => 'HOT',
            ],
            'featuredBadge' => [
                'enabled' => true,
                'expiresAt' => null,
                'badgeLabel' => 'NỔI BẬT',
            ],
            'displayConfig' => [
                'positions' => ['featured', 'latest'],
                'priorityOrder' => 2,
                'startDate' => null,
                'endDate' => null,
            ],
            'seo' => [
                'metaTitle' => 'VieJap đồng hành trong ngày hội kết nối văn hóa Nhật Bản',
                'slug' => 'ket-noi-van-hoa-nhat-ban-cong-dong-quoc-te',
                'metaDescription' => 'Khám phá hoạt động giao lưu văn hóa và tư vấn cơ hội việc làm Nhật Bản cùng VieJap.',
            ],
            'viewCount' => 289,
            'authorId' => 'admin',
            'authorName' => 'Super Administrator',
            'createdAt' => date('Y-m-d H:i:s', time() - 86400 * 10),
            'updatedAt' => $now,
            'publishedAt' => date('Y-m-d H:i:s', time() - 86400 * 10),
        ],
        [
            'id' => 'act-mid-autumn-charity-2026',
            'code' => 'HD-2026-004',
            'slug' => 'trung-thu-cho-em-dai-phuoc-cang-long-tra-vinh',
            'title' => 'Trung thu cho em: San sẻ yêu thương tại Đại Phước - Càng Long',
            'category' => 'community',
            'categoryName' => 'Chia sẻ cộng đồng',
            'level' => 'standard',
            'status' => 'published',
            'eventDate' => '28/09/2026',
            'eventTime' => '15:30 - 19:30',
            'location' => 'Xã Đại Phước, Huyện Càng Long, Tỉnh Trà Vinh',
            'organizer' => 'VieJap phối hợp cùng Đoàn Thanh Niên địa phương',
            'participants' => 'Hơn 200 em thiếu nhi và các gia đình có hoàn cảnh khó khăn',
            'summary' => 'Chương trình thiện nguyện ấm áp với những phần quà Trung thu, lồng đèn và học bổng khuyến học được đội ngũ VieJap tận tay trao gửi đến các em nhỏ vùng quê Càng Long.',
            'metric' => '28/09',
            'metricLabel' => '2026',
            'highlights' => [
                'Trao tặng 200 phần quà bánh Trung thu, lồng đèn cho trẻ em hiếu học',
                'Tặng 15 suất học bổng vượt khó học tốt cho các em học sinh có hoàn cảnh đặc biệt',
                'Tổ chức đêm hội rước đèn và đố vui dân gian mang lại nụ cười tuổi thơ',
            ],
            'coverImage' => [
                'id' => 'img-cov-4',
                'src' => '/assets/images/HoatDong/TrungThuChoEm-DaiPhuocCangLongTraVinh/z7909725006271_49da3d4db7b2ad24c0a668cbd8d2c836.jpg',
                'alt' => 'Trao quà Trung thu cho các em thiếu nhi tại Càng Long Trà Vinh',
                'caption' => 'Nụ cười hồn nhiên của các em thiếu nhi khi nhận quà Trung thu từ VieJap',
                'aspectRatio' => '16:9',
                'order' => 1,
            ],
            'gallery' => [
                [
                    'id' => 'img-tt-1',
                    'src' => '/assets/images/HoatDong/TrungThuChoEm-DaiPhuocCangLongTraVinh/z7909725006271_49da3d4db7b2ad24c0a668cbd8d2c836.jpg',
                    'alt' => 'Trao quà Trung thu cho các em',
                    'caption' => 'Trao gửi yêu thương tại xã Đại Phước',
                    'order' => 1,
                ],
                [
                    'id' => 'img-tt-2',
                    'src' => '/assets/images/HoatDong/TrungThuChoEm-DaiPhuocCangLongTraVinh/z7909725171335_3e74fa1f57b86a641d678411aeebd5ec.jpg',
                    'alt' => 'Không khí rộn ràng của đêm hội trăng rằm',
                    'caption' => 'Đêm hội rước đèn ấm áp nghĩa tình',
                    'order' => 2,
                ],
                [
                    'id' => 'img-tt-3',
                    'src' => '/assets/images/HoatDong/TrungThuChoEm-DaiPhuocCangLongTraVinh/z7909725215366_6362f98f30acdb51dfbfd59565fd6dc1.jpg',
                    'alt' => 'Các em thiếu nhi nhận học bổng',
                    'caption' => 'Động viên tinh thần hiếu học của các em',
                    'order' => 3,
                ],
            ],
            'videoUrl' => '',
            'videoThumbnail' => '',
            'templateId' => 'template-community',
            'blocks' => [
                [
                    'id' => 'b1',
                    'type' => 'heading',
                    'content' => 'Ấm áp mùa trăng yêu thương cùng các em nhỏ Càng Long',
                    'order' => 1,
                    'isVisible' => true,
                ],
                [
                    'id' => 'b2',
                    'type' => 'paragraph',
                    'content' => 'Hoạt động thiện nguyện là nét đẹp văn hóa gắn liền với sự phát triển của VieJap, thể hiện tinh thần tương thân tương ái tại quê hương Trà Vinh.',
                    'order' => 2,
                    'isVisible' => true,
                ],
            ],
            'hotBadge' => [
                'enabled' => false,
                'durationDays' => 7,
                'expiresAt' => null,
                'badgeLabel' => 'HOT',
            ],
            'featuredBadge' => [
                'enabled' => false,
                'expiresAt' => null,
                'badgeLabel' => 'NỔI BẬT',
            ],
            'displayConfig' => [
                'positions' => ['latest'],
                'priorityOrder' => 3,
                'startDate' => null,
                'endDate' => null,
            ],
            'seo' => [
                'metaTitle' => 'Trung thu cho em: San sẻ yêu thương tại Đại Phước - Càng Long',
                'slug' => 'trung-thu-cho-em-dai-phuoc-cang-long-tra-vinh',
                'metaDescription' => 'VieJap tổ chức trao quà và học bổng Trung thu cho các em thiếu nhi huyện Càng Long tỉnh Trà Vinh.',
            ],
            'viewCount' => 195,
            'authorId' => 'admin',
            'authorName' => 'Super Administrator',
            'createdAt' => date('Y-m-d H:i:s', time() - 86400 * 20),
            'updatedAt' => $now,
            'publishedAt' => date('Y-m-d H:i:s', time() - 86400 * 20),
        ],
        [
            'id' => 'act-career-orientation-soc-trang',
            'code' => 'HD-2026-005',
            'slug' => 'hanh-trinh-huong-nghiep-24-diem-truong-thpt-soc-trang',
            'title' => 'Hành trình hướng nghiệp tại 24 điểm trường THPT tỉnh Sóc Trăng',
            'category' => 'student',
            'categoryName' => 'Hoạt động học viên',
            'level' => 'standard',
            'status' => 'published',
            'eventDate' => '10/04/2026',
            'eventTime' => '07:30 - 11:30',
            'location' => '24 Trường THPT trên địa bàn tỉnh Sóc Trăng',
            'organizer' => 'VieJap kết hợp cùng Sở Giáo Dục & Ban Giám Hiệu các trường',
            'participants' => 'Hơn 5.000 học sinh khối 12 chuẩn bị tốt nghiệp',
            'summary' => 'Chuyến xe hướng nghiệp của VieJap đã đi qua 24 trường THPT tại Sóc Trăng, mang đến cho các bạn trẻ lớp 12 bức tranh toàn cảnh và thực tế về cơ hội du học, học nghề và xuất khẩu lao động tại Nhật Bản.',
            'metric' => '24',
            'metricLabel' => 'Điểm trường',
            'highlights' => [
                'Tư vấn trực tiếp cho hơn 5.000 học sinh khối 12 định hướng sau tốt nghiệp',
                'Giải đáp minh bạch về chi phí, thu nhập thực tế và lộ trình nâng cao tay nghề',
                'Cung cấp cẩm nang định hướng nghề nghiệp và học bổng tiếng Nhật nhập học sớm',
            ],
            'coverImage' => [
                'id' => 'img-cov-5',
                'src' => '/assets/images/HoatDong/24DiemTruongTHPTSOCTRANG/z7909725127195_3fc576093e8144da3a67d8737550dc9d.jpg',
                'alt' => 'Hội trường tư vấn hướng nghiệp đông đảo học sinh THPT Sóc Trăng',
                'caption' => 'Không khí sôi nổi tại một buổi hướng nghiệp THPT tỉnh Sóc Trăng',
                'aspectRatio' => '16:9',
                'order' => 1,
            ],
            'gallery' => [
                [
                    'id' => 'img-st-1',
                    'src' => '/assets/images/HoatDong/24DiemTruongTHPTSOCTRANG/z7909725127195_3fc576093e8144da3a67d8737550dc9d.jpg',
                    'alt' => 'Buổi tư vấn hướng nghiệp Sóc Trăng',
                    'caption' => 'Học sinh chăm chú lắng nghe thông tin tuyển dụng',
                    'order' => 1,
                ],
                [
                    'id' => 'img-st-2',
                    'src' => '/assets/images/HoatDong/24DiemTruongTHPTSOCTRANG/z7909725367310_d53a8d452083693145c48ade5175e9af.jpg',
                    'alt' => 'Giao lưu hỏi đáp cùng chuyên viên tư vấn VieJap',
                    'caption' => 'Giải đáp tận tình các băn khoăn của phụ huynh và học sinh',
                    'order' => 2,
                ],
                [
                    'id' => 'img-st-3',
                    'src' => '/assets/images/HoatDong/24DiemTruongTHPTSOCTRANG/z7909725376946_87a376173b26fdc4e841526be00b8ca0.jpg',
                    'alt' => 'Trao tặng cẩm nang nghề nghiệp Nhật Bản',
                    'caption' => 'Tài liệu hướng nghiệp chuẩn xác giúp các em chủ động lựa chọn',
                    'order' => 3,
                ],
            ],
            'videoUrl' => '',
            'videoThumbnail' => '',
            'templateId' => 'template-student',
            'blocks' => [
                [
                    'id' => 'b1',
                    'type' => 'heading',
                    'content' => 'Đồng hành cùng học sinh Sóc Trăng chọn hướng tương lai',
                    'order' => 1,
                    'isVisible' => true,
                ],
                [
                    'id' => 'b2',
                    'type' => 'paragraph',
                    'content' => 'Hành trình 24 điểm trường là minh chứng cho sứ mệnh đưa thông tin chân thực, chính thống đến tận tay các bạn học sinh vùng sâu vùng xa.',
                    'order' => 2,
                    'isVisible' => true,
                ],
            ],
            'hotBadge' => [
                'enabled' => false,
                'durationDays' => 7,
                'expiresAt' => null,
                'badgeLabel' => 'HOT',
            ],
            'featuredBadge' => [
                'enabled' => false,
                'expiresAt' => null,
                'badgeLabel' => 'NỔI BẬT',
            ],
            'displayConfig' => [
                'positions' => ['latest', 'category'],
                'priorityOrder' => 4,
                'startDate' => null,
                'endDate' => null,
            ],
            'seo' => [
                'metaTitle' => 'Hành trình hướng nghiệp tại 24 điểm trường THPT tỉnh Sóc Trăng',
                'slug' => 'hanh-trinh-huong-nghiep-24-diem-truong-thpt-soc-trang',
                'metaDescription' => 'VieJap tổ chức chuỗi chương trình hướng nghiệp Nhật Bản tại 24 trường THPT tỉnh Sóc Trăng.',
            ],
            'viewCount' => 412,
            'authorId' => 'admin',
            'authorName' => 'Super Administrator',
            'createdAt' => date('Y-m-d H:i:s', time() - 86400 * 25),
            'updatedAt' => $now,
            'publishedAt' => date('Y-m-d H:i:s', time() - 86400 * 25),
        ],
    ];
}

// -------------------------------------------------------------
// AUTO-EXPIRATION ENGINE (HOT BADGES & POSITIONS)
// -------------------------------------------------------------
function admin_activities_auto_expire(array &$activities): bool
{
    $now = date('Y-m-d H:i:s');
    $modified = false;

    foreach ($activities as &$item) {
        // 1. Check HOT badge expiration
        if (!empty($item['hotBadge']['enabled']) && !empty($item['hotBadge']['expiresAt'])) {
            if ($item['hotBadge']['expiresAt'] <= $now) {
                $item['hotBadge']['enabled'] = false;
                // Remove 'hot' from positions if present, but preserve everything else
                if (isset($item['displayConfig']['positions']) && is_array($item['displayConfig']['positions'])) {
                    $item['displayConfig']['positions'] = array_values(
                        array_filter($item['displayConfig']['positions'], fn($p) => $p !== 'hot')
                    );
                }
                $item['updatedAt'] = $now;
                $modified = true;
            }
        }

        // 2. Check scheduled publishing transition
        if (($item['status'] ?? '') === 'scheduled' && !empty($item['scheduledAt'])) {
            if ($item['scheduledAt'] <= $now) {
                $item['status'] = 'published';
                $item['publishedAt'] = $item['scheduledAt'];
                $item['updatedAt'] = $now;
                $modified = true;
            }
        }

        // 3. Check displayConfig endDate expiration
        if (!empty($item['displayConfig']['endDate']) && $item['displayConfig']['endDate'] <= $now) {
            if (!empty($item['displayConfig']['positions'])) {
                // If ended, remove prominent positions like 'featured' or 'hot'
                $item['displayConfig']['positions'] = array_values(
                    array_filter($item['displayConfig']['positions'], fn($p) => !in_array($p, ['featured', 'hot'], true))
                );
                $item['updatedAt'] = $now;
                $modified = true;
            }
        }
    }
    unset($item);

    return $modified;
}

// -------------------------------------------------------------
// LOAD & SAVE
// -------------------------------------------------------------
function admin_activities_load(): array
{
    $path = admin_activities_file_path();
    if (!is_file($path)) {
        $seed = admin_activities_seed_data();
        admin_write_json_file($path, $seed);
        return $seed;
    }

    $raw = file_get_contents($path);
    $data = $raw === false ? null : json_decode($raw, true);
    if (!is_array($data) || empty($data)) {
        $data = admin_activities_seed_data();
        admin_write_json_file($path, $data);
        return $data;
    }

    if (admin_activities_auto_expire($data)) {
        admin_write_json_file($path, $data);
    }

    return $data;
}

function admin_activities_save(array $activities): void
{
    $path = admin_activities_file_path();
    admin_write_json_file($path, $activities);
}

// -------------------------------------------------------------
// CRUD OPERATIONS
// -------------------------------------------------------------
function admin_activities_list(array $filters = []): array
{
    $activities = admin_activities_load();

    $q = mb_strtolower(trim((string) ($filters['q'] ?? '')));
    $status = trim((string) ($filters['status'] ?? 'all'));
    $level = trim((string) ($filters['level'] ?? 'all'));
    $category = trim((string) ($filters['category'] ?? 'all'));
    $badge = trim((string) ($filters['badge'] ?? 'all'));
    $position = trim((string) ($filters['position'] ?? 'all'));
    $page = max(1, (int) ($filters['page'] ?? 1));
    $limit = max(1, min(50, (int) ($filters['limit'] ?? 10))); // Default 10 items/page

    $filtered = array_filter($activities, function ($item) use ($q, $status, $level, $category, $badge, $position) {
        if ($q !== '') {
            $haystack = mb_strtolower(
                ($item['title'] ?? '') . ' ' .
                ($item['code'] ?? '') . ' ' .
                ($item['summary'] ?? '') . ' ' .
                ($item['location'] ?? '') . ' ' .
                ($item['categoryName'] ?? '')
            );
            if (!str_contains($haystack, $q)) {
                return false;
            }
        }

        if ($status !== 'all' && ($item['status'] ?? '') !== $status) {
            return false;
        }

        if ($level !== 'all' && ($item['level'] ?? '') !== $level) {
            return false;
        }

        if ($category !== 'all' && ($item['category'] ?? '') !== $category) {
            return false;
        }

        if ($badge === 'hot' && empty($item['hotBadge']['enabled'])) {
            return false;
        }

        if ($badge === 'featured' && empty($item['featuredBadge']['enabled'])) {
            return false;
        }

        if ($position !== 'all') {
            $positions = $item['displayConfig']['positions'] ?? [];
            if (!in_array($position, $positions, true)) {
                return false;
            }
        }

        return true;
    });

    // Sort by priorityOrder ASC then createdAt DESC
    usort($filtered, function ($a, $b) {
        $pA = (int) ($a['displayConfig']['priorityOrder'] ?? 999);
        $pB = (int) ($b['displayConfig']['priorityOrder'] ?? 999);
        if ($pA !== $pB) {
            return $pA <=> $pB;
        }
        return strcmp($b['createdAt'] ?? '', $a['createdAt'] ?? '');
    });

    $total = count($filtered);
    $totalPages = max(1, (int) ceil($total / $limit));
    $offset = ($page - 1) * $limit;
    $items = array_slice($filtered, $offset, $limit);

    // Calculate quick counts
    $counts = [
        'all' => count($activities),
        'draft' => 0,
        'pending' => 0,
        'approved' => 0,
        'published' => 0,
        'scheduled' => 0,
        'archived' => 0,
        'hot' => 0,
        'featured' => 0,
        'special' => 0,
    ];
    foreach ($activities as $act) {
        $st = $act['status'] ?? 'draft';
        if (isset($counts[$st])) {
            $counts[$st]++;
        }
        if (!empty($act['hotBadge']['enabled'])) {
            $counts['hot']++;
        }
        if (!empty($act['featuredBadge']['enabled']) || ($act['level'] ?? '') === 'featured') {
            $counts['featured']++;
        }
        if (($act['level'] ?? '') === 'special') {
            $counts['special']++;
        }
    }

    return [
        'items' => array_values($items),
        'total' => $total,
        'page' => $page,
        'limit' => $limit,
        'totalPages' => $totalPages,
        'counts' => $counts,
        'categories' => admin_activity_categories(),
        'templates' => admin_activity_templates(),
    ];
}

function admin_activity_find(string $idOrSlug): ?array
{
    $activities = admin_activities_load();
    foreach ($activities as $item) {
        if (($item['id'] ?? '') === $idOrSlug || ($item['slug'] ?? '') === $idOrSlug || ($item['code'] ?? '') === $idOrSlug) {
            return $item;
        }
    }
    return null;
}

function admin_activity_sanitize_block(array $block, int $order): array
{
    $allowedTypes = [
        'heading', 'subheading', 'paragraph', 'image', 'gallery',
        'video', 'quote', 'divider', 'event_info', 'button', 'callout', 'bullet_list'
    ];
    $type = in_array($block['type'] ?? '', $allowedTypes, true) ? $block['type'] : 'paragraph';

    $meta = is_array($block['meta'] ?? null) ? $block['meta'] : [];
    if (!empty($block['textColor'])) {
        $meta['textColor'] = (string) $block['textColor'];
    }
    if (!empty($meta['textColor'])) {
        $meta['textColor'] = htmlspecialchars(strip_tags((string) $meta['textColor']), ENT_QUOTES, 'UTF-8');
    }

    return [
        'id' => (string) ($block['id'] ?? ('b-' . bin2hex(random_bytes(4)))),
        'type' => $type,
        'content' => htmlspecialchars(strip_tags((string) ($block['content'] ?? '')), ENT_QUOTES, 'UTF-8'),
        'items' => is_array($block['items'] ?? null)
            ? array_map(fn($it) => htmlspecialchars(strip_tags((string) $it), ENT_QUOTES, 'UTF-8'), $block['items'])
            : [],
        'imageUrl' => filter_var((string) ($block['imageUrl'] ?? ''), FILTER_SANITIZE_URL) ?: '',
        'caption' => htmlspecialchars(strip_tags((string) ($block['caption'] ?? '')), ENT_QUOTES, 'UTF-8'),
        'layout' => in_array($block['layout'] ?? '', ['full', 'wide', 'split', 'grid'], true) ? $block['layout'] : 'full',
        'videoUrl' => filter_var((string) ($block['videoUrl'] ?? ''), FILTER_SANITIZE_URL) ?: '',
        'buttonText' => htmlspecialchars(strip_tags((string) ($block['buttonText'] ?? '')), ENT_QUOTES, 'UTF-8'),
        'buttonUrl' => filter_var((string) ($block['buttonUrl'] ?? ''), FILTER_SANITIZE_URL) ?: '',
        'order' => $order,
        'isVisible' => (bool) ($block['isVisible'] ?? true),
        'meta' => $meta,
    ];
}

function admin_activity_normalize_payload(array $data, ?array $existing = null): array
{
    $now = date('Y-m-d H:i:s');
    $title = trim((string) ($data['title'] ?? ($existing['title'] ?? 'Hoạt động mới')));
    $slug = trim((string) ($data['slug'] ?? ($existing['slug'] ?? '')));
    if ($slug === '') {
        $slug = admin_slugify($title);
    }

    $category = (string) ($data['category'] ?? ($existing['category'] ?? 'student'));
    $catMap = [
        'student' => 'Hoạt động học viên',
        'culture' => 'Văn hóa Nhật Bản',
        'diplomacy' => 'Hoạt động đối ngoại',
        'business' => 'Kết nối doanh nghiệp',
        'community' => 'Chia sẻ cộng đồng',
        'internal' => 'Hoạt động nội bộ',
    ];
    $categoryName = $catMap[$category] ?? 'Hoạt động chung';

    $level = in_array($data['level'] ?? '', ['standard', 'featured', 'hot', 'special'], true)
        ? $data['level']
        : ($existing['level'] ?? 'standard');

    $status = in_array($data['status'] ?? '', ['draft', 'pending', 'approved', 'published', 'scheduled', 'ended', 'archived'], true)
        ? $data['status']
        : ($existing['status'] ?? 'draft');

    // Blocks normalization & sanitization
    $rawBlocks = is_array($data['blocks'] ?? null) ? $data['blocks'] : ($existing['blocks'] ?? []);
    $blocks = [];
    $orderIndex = 1;
    foreach ($rawBlocks as $b) {
        if (is_array($b)) {
            $blocks[] = admin_activity_sanitize_block($b, $orderIndex++);
        }
    }

    // Gallery normalization
    $rawGallery = is_array($data['gallery'] ?? null) ? $data['gallery'] : ($existing['gallery'] ?? []);
    $gallery = [];
    $gOrder = 1;
    foreach ($rawGallery as $g) {
        if (is_array($g) && !empty($g['src'])) {
            $gSrc = (string) $g['src'];
            if ($gSrc !== '' && !str_starts_with($gSrc, 'http') && !str_starts_with($gSrc, '/')) {
                $gSrc = '/' . $gSrc;
            }
            $gallery[] = [
                'id' => (string) ($g['id'] ?? ('img-' . bin2hex(random_bytes(4)))),
                'src' => $gSrc,
                'alt' => htmlspecialchars(strip_tags((string) ($g['alt'] ?? '')), ENT_QUOTES, 'UTF-8'),
                'caption' => htmlspecialchars(strip_tags((string) ($g['caption'] ?? '')), ENT_QUOTES, 'UTF-8'),
                'aspectRatio' => in_array($g['aspectRatio'] ?? '', ['16:9', '4:3', '1:1', '4:5'], true) ? $g['aspectRatio'] : '16:9',
                'order' => $gOrder++,
            ];
        }
    }

    // Cover Image
    $coverSrc = '';
    $coverAlt = $title;
    $coverCaption = '';
    $coverAspectRatio = '16:9';
    if (isset($data['coverImage'])) {
        if (is_string($data['coverImage'])) {
            $coverSrc = trim($data['coverImage']);
        } elseif (is_array($data['coverImage'])) {
            $coverSrc = (string) ($data['coverImage']['src'] ?? '');
            $coverAlt = (string) ($data['coverImage']['alt'] ?? $title);
            $coverCaption = (string) ($data['coverImage']['caption'] ?? '');
            $coverAspectRatio = (string) ($data['coverImage']['aspectRatio'] ?? '16:9');
        }
    }
    if ($coverSrc === '' && isset($existing['coverImage'])) {
        if (is_string($existing['coverImage'])) {
            $coverSrc = trim($existing['coverImage']);
        } elseif (is_array($existing['coverImage'])) {
            $coverSrc = (string) ($existing['coverImage']['src'] ?? '');
            $coverAlt = (string) ($existing['coverImage']['alt'] ?? $title);
            $coverCaption = (string) ($existing['coverImage']['caption'] ?? '');
            $coverAspectRatio = (string) ($existing['coverImage']['aspectRatio'] ?? '16:9');
        }
    }
    if ($coverSrc === '') {
        $coverSrc = (string) ($gallery[0]['src'] ?? '/assets/images/HoatDong/24DiemTruongTHPTSOCTRANG/3.jpg');
    }
    if ($coverSrc !== '' && !str_starts_with($coverSrc, 'http') && !str_starts_with($coverSrc, '/')) {
        $coverSrc = '/' . $coverSrc;
    }

    $normalizedCover = [
        'id' => 'cov-1',
        'src' => $coverSrc,
        'alt' => htmlspecialchars(strip_tags($coverAlt), ENT_QUOTES, 'UTF-8'),
        'caption' => htmlspecialchars(strip_tags($coverCaption), ENT_QUOTES, 'UTF-8'),
        'aspectRatio' => in_array($coverAspectRatio, ['16:9', '4:3', '1:1', '4:5'], true) ? $coverAspectRatio : '16:9',
        'order' => 1,
    ];

    // HOT Badge Config (Section 6.B & 8)
    $hotEnabled = (bool) ($data['hotBadge']['enabled'] ?? ($existing['hotBadge']['enabled'] ?? false));
    $hotDays = max(1, (int) ($data['hotBadge']['durationDays'] ?? ($existing['hotBadge']['durationDays'] ?? 7)));
    $hotExpiresAt = !empty($data['hotBadge']['expiresAt'])
        ? (string) $data['hotBadge']['expiresAt']
        : ($hotEnabled ? date('Y-m-d H:i:s', time() + $hotDays * 86400) : null);

    // Featured Badge Config
    $featEnabled = (bool) ($data['featuredBadge']['enabled'] ?? ($existing['featuredBadge']['enabled'] ?? false));
    $featLabel = trim((string) ($data['featuredBadge']['badgeLabel'] ?? ($existing['featuredBadge']['badgeLabel'] ?? 'NỔI BẬT')));

    // Display Positions (Section 7)
    $allowedPos = ['featured', 'hot', 'latest', 'category', 'homepage', 'related', 'archive'];
    $rawPos = is_array($data['displayConfig']['positions'] ?? null)
        ? $data['displayConfig']['positions']
        : ($existing['displayConfig']['positions'] ?? ['latest']);
    $positions = array_values(array_intersect($rawPos, $allowedPos));
    if (empty($positions) && $status === 'published') {
        $positions = ['latest'];
    }

    $priority = max(1, (int) ($data['displayConfig']['priorityOrder'] ?? ($existing['displayConfig']['priorityOrder'] ?? 10)));

    return [
        'id' => (string) ($existing['id'] ?? ('act-' . bin2hex(random_bytes(8)))),
        'code' => (string) ($existing['code'] ?? ('HD-' . date('Y') . '-' . strtoupper(bin2hex(random_bytes(2))))),
        'slug' => $slug,
        'title' => $title,
        'category' => $category,
        'categoryName' => $categoryName,
        'level' => $level,
        'status' => $status,
        'eventDate' => trim((string) ($data['eventDate'] ?? ($existing['eventDate'] ?? date('d/m/Y')))),
        'eventTime' => trim((string) ($data['eventTime'] ?? ($existing['eventTime'] ?? ''))),
        'location' => trim((string) ($data['location'] ?? ($existing['location'] ?? 'VieJap'))),
        'organizer' => trim((string) ($data['organizer'] ?? ($existing['organizer'] ?? 'Công ty TNHH VieJap'))),
        'participants' => trim((string) ($data['participants'] ?? ($existing['participants'] ?? ''))),
        'summary' => trim((string) ($data['summary'] ?? ($existing['summary'] ?? ''))),
        'titleColor' => trim((string) ($data['titleColor'] ?? ($existing['titleColor'] ?? ''))),
        'textColor' => trim((string) ($data['textColor'] ?? ($existing['textColor'] ?? ''))),
        'metric' => trim((string) ($data['metric'] ?? ($existing['metric'] ?? ''))),
        'metricLabel' => trim((string) ($data['metricLabel'] ?? ($existing['metricLabel'] ?? ''))),
        'highlights' => is_array($data['highlights'] ?? null)
            ? array_values(array_filter(array_map('trim', $data['highlights'])))
            : ($existing['highlights'] ?? []),
        'coverImage' => $normalizedCover,
        'gallery' => $gallery,
        'videoUrl' => trim((string) ($data['videoUrl'] ?? ($existing['videoUrl'] ?? ''))),
        'videoThumbnail' => trim((string) ($data['videoThumbnail'] ?? ($existing['videoThumbnail'] ?? ''))),
        'templateId' => trim((string) ($data['templateId'] ?? ($existing['templateId'] ?? 'template-student'))),
        'blocks' => $blocks,
        'hotBadge' => [
            'enabled' => $hotEnabled,
            'durationDays' => $hotDays,
            'expiresAt' => $hotExpiresAt,
            'badgeLabel' => trim((string) ($data['hotBadge']['badgeLabel'] ?? 'ĐANG HOT')),
        ],
        'featuredBadge' => [
            'enabled' => $featEnabled,
            'expiresAt' => $data['featuredBadge']['expiresAt'] ?? null,
            'badgeLabel' => $featLabel ?: 'NỔI BẬT',
        ],
        'displayConfig' => [
            'positions' => $positions,
            'priorityOrder' => $priority,
            'startDate' => $data['displayConfig']['startDate'] ?? null,
            'endDate' => $data['displayConfig']['endDate'] ?? null,
        ],
        'seo' => [
            'metaTitle' => trim((string) ($data['seo']['metaTitle'] ?? ($existing['seo']['metaTitle'] ?? $title))),
            'slug' => $slug,
            'metaDescription' => trim((string) ($data['seo']['metaDescription'] ?? ($existing['seo']['metaDescription'] ?? ''))),
            'socialShareImage' => $normalizedCover['src'],
            'canonicalUrl' => trim((string) ($data['seo']['canonicalUrl'] ?? '')),
        ],
        'viewCount' => max(0, (int) ($existing['viewCount'] ?? ($data['viewCount'] ?? 0))),
        'authorId' => (string) ($existing['authorId'] ?? ($data['authorId'] ?? 'admin')),
        'authorName' => (string) ($existing['authorName'] ?? ($data['authorName'] ?? 'Quản trị viên')),
        'approverId' => $existing['approverId'] ?? null,
        'approverName' => $existing['approverName'] ?? null,
        'approvalNote' => $existing['approvalNote'] ?? null,
        'createdAt' => (string) ($existing['createdAt'] ?? $now),
        'updatedAt' => $now,
        'publishedAt' => $existing['publishedAt'] ?? ($status === 'published' ? $now : null),
        'scheduledAt' => $data['scheduledAt'] ?? ($existing['scheduledAt'] ?? null),
    ];
}

function admin_slugify(string $text): string
{
    // Convert Vietnamese diacritics
    $search = ['á','à','ả','ã','ạ','ă','ắ','ằ','ẳ','ẵ','ặ','â','ấ','ầ','ẩ','ẫ','ậ',
               'é','è','ẻ','ẽ','ẹ','ê','ế','ề','ể','ễ','ệ',
               'í','ì','ỉ','ĩ','ị',
               'ó','ò','ỏ','õ','ọ','ô','ố','ồ','ổ','ỗ','ộ','ơ','ớ','ờ','ở','ỡ','ợ',
               'ú','ù','ủ','ũ','ụ','ư','ứ','ừ','ử','ữ','ự',
               'ý','ỳ','ỷ','ỹ','ỵ',
               'đ','Á','À','Ả','Ã','Ạ','Ă','Ắ','Ằ','Ẳ','Ẵ','Ặ','Â','Ấ','Ầ','Ẩ','Ẫ','Ậ',
               'É','È','Ẻ','Ẽ','Ẹ','Ê','Ế','Ề','Ể','Ễ','Ệ',
               'Í','Ì','Ỉ','Ĩ','Ị',
               'Ó','Ò','Ỏ','Õ','Ọ','Ô','Ố','Ồ','Ổ','Ỗ','Ộ','Ơ','Ớ','Ờ','Ở','Ỡ','Ợ',
               'Ú','Ù','Ủ','Ũ','Ụ','Ư','Ứ','Ừ','Ử','Ữ','Ự',
               'Ý','Ỳ','Ỷ','Ỹ','Ỵ','Đ'];
    $replace = ['a','a','a','a','a','a','a','a','a','a','a','a','a','a','a','a','a',
                'e','e','e','e','e','e','e','e','e','e','e',
                'i','i','i','i','i',
                'o','o','o','o','o','o','o','o','o','o','o','o','o','o','o','o','o',
                'u','u','u','u','u','u','u','u','u','u','u',
                'y','y','y','y','y',
                'd','a','a','a','a','a','a','a','a','a','a','a','a','a','a','a','a',
                'e','e','e','e','e','e','e','e','e','e','e',
                'i','i','i','i','i',
                'o','o','o','o','o','o','o','o','o','o','o','o','o','o','o','o','o',
                'u','u','u','u','u','u','u','u','u','u','u',
                'y','y','y','y','y','d'];
    $text = str_replace($search, $replace, $text);
    $text = preg_replace('/[^a-zA-Z0-9\s-]/', '', strtolower($text));
    $text = preg_replace('/[\s-]+/', '-', trim((string) $text));
    return $text ?: 'hoat-dong-' . bin2hex(random_bytes(3));
}

function admin_activity_create(array $payload, array $session): array
{
    $payload['authorId'] = (string) ($session['username'] ?? 'admin');
    $payload['authorName'] = (string) ($session['fullName'] ?? $session['username'] ?? 'Admin');
    $item = admin_activity_normalize_payload($payload);

    $activities = admin_activities_load();
    array_unshift($activities, $item);
    admin_activities_save($activities);

    // Audit notification
    admin_notification_create([
        'eventType' => 'activity.created',
        'category' => 'system',
        'title' => 'Hoạt động mới: ' . $item['title'],
        'message' => 'Cán bộ ' . $item['authorName'] . ' vừa tạo bài viết hoạt động (' . $item['code'] . ').',
        'actor' => ['id' => $session['username'] ?? 'admin', 'name' => $item['authorName'], 'role' => 'Admin'],
        'target' => ['type' => 'activity', 'id' => $item['id'], 'code' => $item['code'], 'name' => $item['title']],
        'priority' => 'medium',
    ]);

    return $item;
}

function admin_activity_update(string $id, array $payload, array $session): ?array
{
    $activities = admin_activities_load();
    $foundIndex = -1;
    $existing = null;

    foreach ($activities as $idx => $act) {
        if (($act['id'] ?? '') === $id) {
            $foundIndex = $idx;
            $existing = $act;
            break;
        }
    }

    if ($foundIndex === -1 || $existing === null) {
        return null;
    }

    $updated = admin_activity_normalize_payload($payload, $existing);
    $activities[$foundIndex] = $updated;
    admin_activities_save($activities);

    return $updated;
}

function admin_activity_duplicate(string $id, array $session): ?array
{
    $original = admin_activity_find($id);
    if ($original === null) {
        return null;
    }

    $duplicate = $original;
    $duplicate['id'] = 'act-' . bin2hex(random_bytes(8));
    $duplicate['code'] = 'HD-' . date('Y') . '-' . strtoupper(bin2hex(random_bytes(2)));
    $duplicate['title'] = $original['title'] . ' (Bản sao)';
    $duplicate['slug'] = admin_slugify($duplicate['title']);
    $duplicate['status'] = 'draft';
    $duplicate['publishedAt'] = null;
    $duplicate['scheduledAt'] = null;
    $duplicate['viewCount'] = 0;
    $duplicate['hotBadge'] = [
        'enabled' => false,
        'durationDays' => 7,
        'expiresAt' => null,
        'badgeLabel' => 'HOT',
    ];
    $duplicate['featuredBadge'] = [
        'enabled' => false,
        'expiresAt' => null,
        'badgeLabel' => 'NỔI BẬT',
    ];
    $duplicate['displayConfig']['positions'] = ['latest'];
    $duplicate['authorId'] = (string) ($session['username'] ?? 'admin');
    $duplicate['authorName'] = (string) ($session['fullName'] ?? 'Admin');
    $duplicate['createdAt'] = date('Y-m-d H:i:s');
    $duplicate['updatedAt'] = $duplicate['createdAt'];

    $activities = admin_activities_load();
    array_unshift($activities, $duplicate);
    admin_activities_save($activities);

    return $duplicate;
}

function admin_activity_approve(string $id, bool $isApproved, string $note, array $session): ?array
{
    $activities = admin_activities_load();
    foreach ($activities as &$act) {
        if (($act['id'] ?? '') === $id) {
            $act['status'] = $isApproved ? 'approved' : 'draft';
            $act['approverId'] = (string) ($session['username'] ?? 'admin');
            $act['approverName'] = (string) ($session['fullName'] ?? 'Admin');
            $act['approvalNote'] = trim($note);
            $act['updatedAt'] = date('Y-m-d H:i:s');
            admin_activities_save($activities);
            return $act;
        }
    }
    return null;
}

function admin_activity_publish(string $id, ?string $scheduledAt, array $session): ?array
{
    $activities = admin_activities_load();
    $now = date('Y-m-d H:i:s');
    foreach ($activities as &$act) {
        if (($act['id'] ?? '') === $id) {
            if (!empty($scheduledAt) && $scheduledAt > $now) {
                $act['status'] = 'scheduled';
                $act['scheduledAt'] = $scheduledAt;
            } else {
                $act['status'] = 'published';
                $act['publishedAt'] = $now;
                $act['scheduledAt'] = null;
            }
            $act['updatedAt'] = $now;
            admin_activities_save($activities);
            return $act;
        }
    }
    return null;
}

function admin_activity_archive(string $id, array $session): ?array
{
    $activities = admin_activities_load();
    foreach ($activities as &$act) {
        if (($act['id'] ?? '') === $id) {
            $act['status'] = 'archived';
            $act['displayConfig']['positions'] = ['archive'];
            $act['updatedAt'] = date('Y-m-d H:i:s');
            admin_activities_save($activities);
            return $act;
        }
    }
    return null;
}

function admin_activity_delete(string $id, array $session): bool
{
    $activities = admin_activities_load();
    $initialCount = count($activities);
    $activities = array_values(array_filter($activities, fn($act) => ($act['id'] ?? '') !== $id));
    if (count($activities) === $initialCount) {
        return false;
    }
    admin_activities_save($activities);
    return true;
}

function admin_activities_reorder(array $orderedIds, string $position): bool
{
    $activities = admin_activities_load();
    $idMap = [];
    foreach ($orderedIds as $priority => $id) {
        $idMap[(string) $id] = $priority + 1;
    }

    $modified = false;
    foreach ($activities as &$act) {
        $id = (string) ($act['id'] ?? '');
        if (isset($idMap[$id])) {
            $act['displayConfig']['priorityOrder'] = $idMap[$id];
            $modified = true;
        }
    }
    unset($act);

    if ($modified) {
        admin_activities_save($activities);
    }
    return true;
}

function admin_activity_check_quality(array $activity): array
{
    $warnings = [];
    $errors = [];

    if (empty($activity['title'])) {
        $errors[] = 'Thiếu tiêu đề bài viết hoạt động.';
    } elseif (mb_strlen($activity['title']) > 150) {
        $warnings[] = 'Tiêu đề quá dài (> 150 ký tự), có thể bị cắt bớt trên điện thoại di động.';
    }

    if (empty($activity['coverImage']['src'])) {
        $errors[] = 'Chưa có ảnh đại diện (Cover Image).';
    }

    if (empty($activity['summary'])) {
        $warnings[] = 'Thiếu tóm tắt ngắn cho bài viết.';
    }

    if (empty($activity['location'])) {
        $warnings[] = 'Chưa ghi nhận địa điểm tổ chức sự kiện.';
    }

    if (empty($activity['eventDate'])) {
        $warnings[] = 'Chưa có ngày diễn ra hoạt động.';
    }

    if (empty($activity['blocks'])) {
        $warnings[] = 'Nội dung chi tiết chưa có block nào (nên có ít nhất 2 block đoạn văn và ảnh).';
    }

    if (!empty($activity['hotBadge']['enabled']) && empty($activity['hotBadge']['expiresAt'])) {
        $warnings[] = 'Nhãn HOT được bật nhưng chưa cài đặt ngày tự động hết hạn.';
    }

    if (empty($activity['displayConfig']['positions'])) {
        $warnings[] = 'Chưa cấu hình vị trí xuất hiện nào trên website.';
    }

    $isReady = empty($errors);
    $score = max(20, 100 - count($errors) * 35 - count($warnings) * 10);

    return [
        'isReady' => $isReady,
        'score' => $score,
        'errors' => $errors,
        'warnings' => $warnings,
    ];
}

