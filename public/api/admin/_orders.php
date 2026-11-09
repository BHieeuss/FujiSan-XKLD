<?php
declare(strict_types=1);

require_once __DIR__ . '/_bootstrap.php';

const VIEJAP_JOB_ORDER_CATEGORIES = [
    'nong-nghiep', 'thuc-pham', 'co-khi', 'xay-dung', 'dien-tu', 'khac',
    'ky-su', 'tokutei', 'thuc-tap-sinh', 'du-hoc'
];

function admin_job_order_seed_data(): array
{
    $createdAt = '2026-10-15 08:30:00';

    return [
        [
            'id' => '1a2b3c4d5e6f7081920a3b4c',
            'orderCode' => 'NN-2026',
            'category' => 'nong-nghiep',
            'title' => 'Trồng và thu hoạch dâu tây trong nhà kính công nghệ cao',
            'company' => 'Tập đoàn Nông nghiệp Kyushu Agri Corp',
            'imageUrl' => 'assets/images/jobs/job-nong-nghiep.jpg',
            'posterUrl' => 'assets/images/KySu/1.png',
            'location' => 'Kagoshima',
            'salary' => '175.000 Yên/tháng',
            'basicSalary' => '175.000 Yên/tháng',
            'takeHomeSalary' => '142.000 Yên/tháng',
            'quantity' => '15 Nữ',
            'gender' => 'Nữ',
            'ageRange' => '18 - 32 tuổi',
            'education' => 'Tốt nghiệp THPT trở lên',
            'japaneseLevel' => 'Được đào tạo từ đầu tại VieJap',
            'contractTerm' => '3 năm',
            'interviewDate' => '2026-11-20',
            'departureMonth' => '04/2027',
            'specificWork' => 'Chăm sóc, thụ phấn, tỉa lá và thu hoạch đóng gói dâu tây sinh thái trong nhà màng.',
            'workEnvironment' => 'Nhà kính công nghệ cao, điều hòa nhiệt độ tự động, sạch sẽ, không chịu ảnh hưởng thời tiết.',
            'workingHours' => '08:00 - 17:00 (Nghỉ trưa 60 phút, tăng ca 30-40h/tháng)',
            'holidays' => 'Nghỉ Thứ 7, Chủ Nhật và các ngày nghỉ lễ theo lịch Nhật Bản (110 ngày/năm)',
            'experience' => 'Không yêu cầu kinh nghiệm, ưu tiên người chăm chỉ khéo tay',
            'healthRequirements' => 'Thị lực tốt, không mù màu, không mắc các bệnh truyền nhiễm',
            'overtime' => 'Làm thêm đều đặn, tính 125% lương cơ bản theo luật lao động Nhật',
            'allowances' => 'Trợ cấp tháng đầu 60.000 Yên, phụ cấp chuyên cần 10.000 Yên/tháng',
            'bonus' => 'Xét thưởng năng suất theo vụ thu hoạch',
            'insurance' => 'Đầy đủ BH Y tế, BH Xã hội (Nenkin), Bảo hiểm thất nghiệp, Tai nạn',
            'accommodation' => 'Ký túc xá khang trang cách nông trại 10 phút đi xe đạp, đầy đủ máy giặt, điều hòa, wifi',
            'meals' => 'Tự nấu ăn tại KTX, hỗ trợ rau củ sạch miễn phí từ trang trại',
            'transport' => 'Cung cấp xe đạp đi làm miễn phí',
            'otherBenefits' => 'Hỗ trợ thủ tục xin hoàn thuế Nenkin sau khi hoàn thành hợp đồng về nước (~ 80 - 100 triệu)',
            'description' => 'Công việc nhẹ nhàng, môi trường sạch sẽ, phù hợp với lao động nữ. Lương thực lĩnh ~ 29 triệu/tháng, chế độ đãi ngộ rất tốt từ nghiệp đoàn Kyushu.',
            'postContent' => '<p>Đơn hàng Nông nghiệp nhà kính Kagoshima tuyển gấp 15 nữ xuất cảnh mùa xuân 2027.</p>',
            'facebookContent' => "🍓 ĐƠN HÀNG DÂU TÂY NHÀ KÍNH KAGOSHIMA - BAY NHANH 🍓\n✨ Tuyển 15 Nữ | Mã đơn: NN-2026\n📍 Địa điểm: Kagoshima - Nhật Bản\n💴 Lương cơ bản: 175.000 Yên/tháng (~ 29.5 triệu)\n💴 Thực lĩnh tay: 142.000 Yên/tháng + tăng ca đều đặn\n\n🎯 YÊU CẦU: Nữ 18-32 tuổi, chăm chỉ, ngoan ngoãn.\n📞 Hotline tư vấn: 0966 966 284",
            'postTemplateId' => 'standard_general',
            'postBlocks' => [],
            'galleryImages' => ['assets/images/KySu/1.png'],
            'status' => 'published',
            'isFeatured' => true,
            'createdAt' => $createdAt,
            'updatedAt' => '2026-10-31 10:00:00',
        ],
        [
            'id' => '2b3c4d5e6f7081920a3b4c5d',
            'orderCode' => 'TP-8821',
            'category' => 'thuc-pham',
            'title' => 'Chế biến và đóng gói suất ăn tiện lợi Bento',
            'company' => 'Công ty Thực phẩm Delica Foods Japan',
            'imageUrl' => 'assets/images/jobs/job-thuc-pham.jpg',
            'posterUrl' => '',
            'location' => 'Chiba',
            'salary' => '182.000 Yên/tháng',
            'basicSalary' => '182.000 Yên/tháng',
            'takeHomeSalary' => '148.000 Yên/tháng',
            'quantity' => '20 Nam/Nữ',
            'gender' => 'Nam/Nữ',
            'ageRange' => '18 - 35 tuổi',
            'education' => 'Tốt nghiệp THPT',
            'japaneseLevel' => 'Được đào tạo trước xuất cảnh',
            'contractTerm' => '3 năm',
            'interviewDate' => '2026-11-25',
            'departureMonth' => '05/2027',
            'specificWork' => 'Sơ chế nguyên liệu, đứng dây chuyền phân chia thức ăn vào hộp bento, dán nhãn bao bì.',
            'workEnvironment' => 'Xưởng vô trùng hiện đại, nhiệt độ mát mẻ 20°C quanh năm, trang bị đồ bảo hộ đầy đủ.',
            'workingHours' => 'Ca sáng: 06:00 - 15:00 / Ca chiều: 14:00 - 23:00 (Nghỉ giữa ca 60 phút)',
            'holidays' => 'Nghỉ luân phiên 8 ngày/tháng theo phân ca nhà máy',
            'experience' => 'Không yêu cầu kinh nghiệm, tiếp thu nhanh',
            'healthRequirements' => 'Không mắc bệnh ngoài da, bệnh hô hấp truyền nhiễm',
            'overtime' => 'Tăng ca nhiều, từ 35 - 50 giờ/tháng',
            'allowances' => 'Phụ cấp làm ca đêm 25%, phụ cấp chuyên cần hàng tháng',
            'bonus' => 'Thưởng 2 lần/năm theo kết quả kinh doanh',
            'insurance' => 'Bảo hiểm trọn gói theo quy định pháp luật Nhật Bản',
            'accommodation' => 'KTX gần nhà máy, đi bộ 5 phút, tiện nghi máy lạnh, tủ lạnh, bếp gas',
            'meals' => 'Cơm trưa ca làm việc được trợ cấp 50% chi phí tại căng tin',
            'transport' => 'Đi bộ đi làm',
            'otherBenefits' => 'Cơ hội chuyển đổi visa Tokutei Ginou 5 năm sau khi kết thúc hợp đồng',
            'description' => 'Đơn hàng thực phẩm truyền thống Chiba, công việc ổn định quanh năm không lo thời tiết, việc làm thêm dồi dào.',
            'postContent' => '<p>Đơn hàng Thực phẩm Chiba tuyển gấp 20 nam nữ xuất cảnh giữa năm 2027.</p>',
            'facebookContent' => "🍱 ĐƠN HÀNG THỰC PHẨM CHIBA - LƯƠNG CAO TĂNG CA NHIỀU 🍱\n✨ Tuyển 20 Nam/Nữ | Mã đơn: TP-8821\n📍 Địa điểm: Chiba (cạnh Tokyo)\n💴 Lương cơ bản: 182.000 Yên/tháng\n💴 Tăng ca 35-50h/tháng, thu nhập trên 38 triệu\n\n🎯 YÊU CẦU: Nam/Nữ 18-35 tuổi, nhanh nhẹn, sạch sẽ.\n📞 Liên hệ ngay VieJap để đăng ký form!",
            'postTemplateId' => 'food_processing',
            'postBlocks' => [],
            'galleryImages' => [],
            'status' => 'published',
            'isFeatured' => true,
            'createdAt' => $createdAt,
            'updatedAt' => '2026-10-30 14:20:00',
        ],
        [
            'id' => '3c4d5e6f7081920a3b4c5d6e',
            'orderCode' => 'CK-5566',
            'category' => 'co-khi',
            'title' => 'Vận hành máy gia công cơ khí phay tiện CNC',
            'company' => 'Tập đoàn Kỹ nghệ Mechatronics Aichi',
            'imageUrl' => 'assets/images/jobs/job-co-khi.jpg',
            'posterUrl' => '',
            'location' => 'Aichi',
            'salary' => '195.000 Yên/tháng',
            'basicSalary' => '195.000 Yên/tháng',
            'takeHomeSalary' => '156.000 Yên/tháng',
            'quantity' => '10 Nam',
            'gender' => 'Nam',
            'ageRange' => '20 - 33 tuổi',
            'education' => 'Tốt nghiệp Trung cấp / CĐ / Đại học Cơ khí',
            'japaneseLevel' => 'N4 hoặc tương đương (được đào tạo bổ sung)',
            'contractTerm' => '3 năm',
            'interviewDate' => '2026-12-05',
            'departureMonth' => '06/2027',
            'specificWork' => 'Gá đặt phôi, kiểm tra chương trình máy CNC, đo đạc kích thước chi tiết linh kiện cơ khí chính xác.',
            'workEnvironment' => 'Nhà xưởng gia công chính xác, điều hòa trung tâm, trang thiết bị bảo hộ an toàn.',
            'workingHours' => '08:30 - 17:30 (Tăng ca trung bình 30 - 45h/tháng)',
            'holidays' => 'Nghỉ Thứ 7, Chủ Nhật, nghỉ lễ Tuần Lễ Vàng, Obon, Tết Dương lịch',
            'experience' => 'Có kinh nghiệm đọc bản vẽ kỹ thuật hoặc vận hành máy là lợi thế',
            'healthRequirements' => 'Sức khỏe tốt, không cận thị nặng',
            'overtime' => 'Làm thêm theo tiến độ đơn hàng chế tạo',
            'allowances' => 'Phụ cấp tay nghề, phụ cấp ca ngày/đêm',
            'bonus' => 'Xét thưởng định kỳ hàng năm',
            'insurance' => 'Chế độ bảo hiểm đầy đủ theo chuẩn Nhật Bản',
            'accommodation' => 'KTX riêng biệt cho kỹ thuật viên, phòng 2 người',
            'meals' => 'Nhà ăn công ty có đầu bếp phục vụ',
            'transport' => 'Hỗ trợ vé tháng xe buýt đưa đón',
            'otherBenefits' => 'Cơ hội chuyển đổi Kỹ sư hoặc Tokutei bậc 2',
            'description' => 'Đơn hàng cơ khí chất lượng cao tại trung tâm công nghiệp Aichi. Đãi ngộ vượt trội cho lao động có tay nghề.',
            'postContent' => '<p>Đơn hàng Cơ khí CNC Aichi tuyển 10 kỹ thuật viên nam.</p>',
            'facebookContent' => "⚙️ ĐƠN HÀNG CƠ KHÍ CNC AICHI - THU NHẬP HẤP DẪN ⚙️\n✨ Tuyển 10 Nam | Mã đơn: CK-5566\n📍 Địa điểm: Aichi - Nhật Bản\n💴 Lương cơ bản: 195.000 Yên/tháng\n\n🎯 YÊU CẦU: Nam 20-33 tuổi, tốt nghiệp ngành cơ khí.\n📞 Hotline tư vấn: 0966 966 284",
            'postTemplateId' => 'standard_general',
            'postBlocks' => [],
            'galleryImages' => [],
            'status' => 'published',
            'isFeatured' => false,
            'createdAt' => $createdAt,
            'updatedAt' => '2026-10-29 09:15:00',
        ],
        [
            'id' => '4d5e6f7081920a3b4c5d6e7f',
            'orderCode' => 'XD-1022',
            'category' => 'xay-dung',
            'title' => 'Lắp đặt giàn giáo và hoàn thiện nội thất công trình',
            'company' => 'Tổng thầu Xây dựng Kanto Construction',
            'imageUrl' => 'assets/images/jobs/job-xay-dung.jpg',
            'posterUrl' => '',
            'location' => 'Tokyo',
            'salary' => '210.000 Yên/tháng',
            'basicSalary' => '210.000 Yên/tháng',
            'takeHomeSalary' => '170.000 Yên/tháng',
            'quantity' => '12 Nam',
            'gender' => 'Nam',
            'ageRange' => '19 - 35 tuổi',
            'education' => 'Tốt nghiệp cấp 2 trở lên',
            'japaneseLevel' => 'Được đào tạo giao tiếp cơ bản tại trung tâm',
            'contractTerm' => '3 năm',
            'interviewDate' => '2026-11-18',
            'departureMonth' => '03/2027',
            'specificWork' => 'Lắp dựng giàn giáo an toàn, thi công ốp lát và hoàn thiện nội thất công trình dân dụng tại Tokyo.',
            'workEnvironment' => 'Công trường hiện đại tuân thủ nghiêm ngặt quy tắc an toàn lao động Nhật Bản.',
            'workingHours' => '08:00 - 17:00 (Nghỉ giải lao giữa giờ 90 phút)',
            'holidays' => 'Nghỉ Chủ Nhật và các ngày thời tiết mưa bão được trợ cấp',
            'experience' => 'Ưu tiên có kinh nghiệm xây dựng, thợ nề, thợ sơn',
            'healthRequirements' => 'Thể lực khỏe mạnh, không sợ độ cao, không xăm mình',
            'overtime' => 'Tăng ca đều đặn 30 - 45h/tháng',
            'allowances' => 'Phụ cấp an toàn công trình, phụ cấp đi lại',
            'bonus' => 'Thưởng dự án hoàn thành đúng tiến độ',
            'insurance' => 'Bảo hiểm đầy đủ',
            'accommodation' => 'Ký túc xá công ty bao trọn tiền điện nước',
            'meals' => 'Tự nấu ăn tại KTX',
            'transport' => 'Xe công ty đưa đón từ KTX đến công trình',
            'otherBenefits' => 'Hỗ trợ nâng bậc tay nghề thợ giàn giáo quốc tế',
            'description' => 'Mức lương thuộc top cao nhất vùng thủ đô Tokyo. Thích hợp cho lao động nam có sức khỏe dẻo dai và muốn tích lũy số vốn lớn.',
            'postContent' => '<p>Đơn hàng Xây dựng Tokyo tuyển 12 nam lắp đặt giàn giáo.</p>',
            'facebookContent' => "🏗️ ĐƠN HÀNG XÂY DỰNG THỦ ĐÔ TOKYO - LƯƠNG TRÊN 36 TRIỆU 🏗️\n✨ Tuyển 12 Nam | Mã: XD-1022\n📍 Địa điểm: Tokyo\n💴 Lương cơ bản: 210.000 Yên/tháng\n📞 Hotline tư vấn: 0966 966 284",
            'postTemplateId' => 'standard_general',
            'postBlocks' => [],
            'galleryImages' => [],
            'status' => 'published',
            'isFeatured' => false,
            'createdAt' => $createdAt,
            'updatedAt' => '2026-10-28 11:30:00',
        ],
        [
            'id' => '5e6f7081920a3b4c5d6e7f80',
            'orderCode' => 'DT-3390',
            'category' => 'dien-tu',
            'title' => 'Lắp ráp và kiểm thử bo mạch điện tử thông minh',
            'company' => 'Tập đoàn Điện tử Sanyo Microtech',
            'imageUrl' => 'assets/images/jobs/job-dien-tu.jpg',
            'posterUrl' => '',
            'location' => 'Osaka',
            'salary' => '180.000 Yên/tháng',
            'basicSalary' => '180.000 Yên/tháng',
            'takeHomeSalary' => '145.000 Yên/tháng',
            'quantity' => '18 Nam/Nữ',
            'gender' => 'Nam/Nữ',
            'ageRange' => '18 - 30 tuổi',
            'education' => 'Tốt nghiệp THPT trở lên',
            'japaneseLevel' => 'Được đào tạo tại trung tâm',
            'contractTerm' => '3 năm',
            'interviewDate' => '2026-12-10',
            'departureMonth' => '05/2027',
            'specificWork' => 'Lắp ráp linh kiện dán bề mặt, kiểm tra mạch in bằng kính lúp và máy soi tự động.',
            'workEnvironment' => 'Phòng sạch Cleanroom 100%, nhiệt độ tiêu chuẩn, mặc áo chống tĩnh điện.',
            'workingHours' => '08:30 - 17:15 (Tăng ca 25 - 35h/tháng)',
            'holidays' => 'Nghỉ Thứ 7, Chủ Nhật và ngày Lễ theo lịch cty',
            'experience' => 'Không yêu cầu kinh nghiệm',
            'healthRequirements' => 'Mắt tinh, không cận loạn thị, tay không run',
            'overtime' => 'Làm thêm theo dây chuyền',
            'allowances' => 'Phụ cấp phòng sạch 5.000 Yên/tháng',
            'bonus' => 'Xét thưởng cuối năm',
            'insurance' => 'Bảo hiểm đầy đủ',
            'accommodation' => 'KTX gần nhà ga Osaka',
            'meals' => 'Tự túc, nhà máy có bếp hâm thức ăn',
            'transport' => 'Vé tàu điện tháng được thanh toán',
            'otherBenefits' => 'Môi trường làm việc sang trọng, sạch sẽ',
            'description' => 'Công việc nhẹ nhàng trong phòng điều hòa mát mẻ, lương ổn định, môi trường làm việc lý tưởng cho các bạn trẻ.',
            'postContent' => '<p>Đơn hàng Điện tử Osaka tuyển 18 nam nữ.</p>',
            'facebookContent' => "⚡ ĐƠN HÀNG ĐIỆN TỬ PHÒNG SẠCH OSAKA ⚡\n✨ Tuyển 18 Nam/Nữ | Mã: DT-3390\n📍 Địa điểm: Osaka\n💴 Lương cơ bản: 180.000 Yên/tháng\n📞 Hotline tư vấn: 0966 966 284",
            'postTemplateId' => 'standard_general',
            'postBlocks' => [],
            'galleryImages' => [],
            'status' => 'draft',
            'isFeatured' => false,
            'createdAt' => $createdAt,
            'updatedAt' => '2026-10-27 16:45:00',
        ],
        [
            'id' => '6f7081920a3b4c5d6e7f8091',
            'orderCode' => 'KS-9901',
            'category' => 'ky-su',
            'title' => 'Kỹ sư Thiết kế Cơ khí 3D CAD / SolidWorks',
            'company' => 'Công ty Kỹ thuật Thiết kế Tokyo Engineering Inc.',
            'imageUrl' => 'assets/images/KySu/2.png',
            'posterUrl' => 'assets/images/KySu/3.png',
            'location' => 'Tokyo',
            'salary' => '240.000 Yên/tháng',
            'basicSalary' => '240.000 Yên/tháng',
            'takeHomeSalary' => '195.000 Yên/tháng',
            'quantity' => '5 Nam',
            'gender' => 'Nam',
            'ageRange' => '22 - 35 tuổi',
            'education' => 'Đại học chuyên ngành Cơ khí / Cơ điện tử / Chế tạo máy',
            'japaneseLevel' => 'N3 trở lên',
            'contractTerm' => 'Không thời hạn (Visa Kỹ sư chính thức)',
            'interviewDate' => '2026-11-30',
            'departureMonth' => '04/2027',
            'specificWork' => 'Thiết kế mô hình 3D linh kiện cơ khí, xuất bản vẽ 2D gia công trên phần mềm CAD/CAM, bóc tách khối lượng.',
            'workEnvironment' => 'Văn phòng hiện đại trung tâm Tokyo, trang bị máy trạm đồ họa cấu hình cao.',
            'workingHours' => '09:00 - 18:00 (Nghỉ trưa 60 phút)',
            'holidays' => 'Nghỉ Thứ 7, Chủ Nhật và toàn bộ ngày lễ Nhật Bản (125 ngày/năm)',
            'experience' => 'Có kinh nghiệm sử dụng SolidWorks, AutoCAD từ 1 năm trở lên',
            'healthRequirements' => 'Sức khỏe tốt',
            'overtime' => 'Làm thêm theo dự án thiết kế, tính 125% lương',
            'allowances' => 'Phụ cấp tiếng Nhật N2/N1, phụ cấp nhà ở 30.000 Yên/tháng',
            'bonus' => 'Thưởng 2 lần/năm (bình quân 2 - 4 tháng lương)',
            'insurance' => 'Chế độ phúc lợi như nhân viên chính thức người Nhật',
            'accommodation' => 'Tự chọn căn hộ hoặc công ty hỗ trợ tiền thuê nhà 50%',
            'meals' => 'Tự túc',
            'transport' => 'Hỗ trợ 100% vé tàu điện đi làm',
            'otherBenefits' => 'Bảo lãnh người thân (vợ/chồng, con cái) sang sinh sống lâu dài tại Nhật',
            'description' => 'Chương trình Kỹ sư chính thức đãi ngộ hàng đầu, cơ hội định cư lâu dài và phát triển sự nghiệp tại Tokyo.',
            'postContent' => '<p>Tuyển gấp 5 Kỹ sư Thiết kế Cơ khí làm việc tại Tokyo.</p>',
            'facebookContent' => "🎓 TUYỂN KỸ SƯ THIẾT KẾ CƠ KHÍ LÀM VIỆC TẠI TOKYO 🎓\n✨ Số lượng: 05 Kỹ sư | Mã: KS-9901\n📍 Địa điểm: Tokyo - Nhật Bản\n💴 Lương khởi điểm: 240.000 Yên/tháng (~ 42 triệu) + Thưởng 2-4 tháng lương\n\n🎯 YÊU CẦU: Tốt nghiệp ĐH ngành Cơ khí, tiếng Nhật N3+.\n📞 Hotline tuyển dụng Kỹ sư: 0966 966 284",
            'postTemplateId' => 'standard_general',
            'postBlocks' => [],
            'galleryImages' => ['assets/images/KySu/2.png', 'assets/images/KySu/3.png'],
            'status' => 'draft',
            'isFeatured' => true,
            'createdAt' => $createdAt,
            'updatedAt' => '2026-10-26 15:00:00',
        ],
    ];
}

function admin_job_orders_list(bool $includeDrafts = false): array
{
    $database = admin_job_orders_database();
    if ($database !== null) {
        $sql = 'SELECT id, image_url, poster_url, order_code, title, category, location, salary,
                       age_range, summary, requirements, departure_month, status, is_featured,
                       created_at, updated_at,
                       company, job_type, quantity, gender, education, japanese_level, contract_term,
                       interview_date, specific_work, work_environment, working_hours, holidays,
                       experience, health_requirements, basic_salary, take_home_salary, overtime,
                       allowances, bonus, insurance, accommodation, meals, transport, other_benefits,
                       post_content, facebook_content, post_template_id, post_blocks, gallery_images
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

function admin_job_order_to_slug(string $text): string
{
    $text = mb_strtolower($text, 'UTF-8');
    $text = preg_replace('/[áàảãạăắằẳẵặâấầẩẫậ]/u', 'a', $text);
    $text = preg_replace('/[éèẻẽẹêếềểễệ]/u', 'e', $text);
    $text = preg_replace('/[íìỉĩị]/u', 'i', $text);
    $text = preg_replace('/[óòỏõọôốồổỗộơớờởỡợ]/u', 'o', $text);
    $text = preg_replace('/[úùủũụưứừửữự]/u', 'u', $text);
    $text = preg_replace('/[ýỳỷỹỵ]/u', 'y', $text);
    $text = preg_replace('/[đ]/u', 'd', $text);
    $text = preg_replace('/[^a-z0-9]+/i', '-', $text);
    return trim($text, '-');
}

function admin_job_order_find(string $id, bool $includeDrafts = false): ?array
{
    $id = trim($id);
    if ($id === '') {
        return null;
    }

    $isHexId = admin_job_order_is_valid_id($id);

    $database = admin_job_orders_database();
    if ($database !== null) {
        if ($isHexId) {
            $sql = 'SELECT id, image_url, poster_url, order_code, title, category, location, salary,
                           age_range, summary, requirements, departure_month, status, is_featured,
                           created_at, updated_at,
                           company, job_type, quantity, gender, education, japanese_level, contract_term,
                           interview_date, specific_work, work_environment, working_hours, holidays,
                           experience, health_requirements, basic_salary, take_home_salary, overtime,
                           allowances, bonus, insurance, accommodation, meals, transport, other_benefits,
                           post_content, facebook_content, post_template_id, post_blocks, gallery_images
                    FROM job_orders WHERE id = :id';
            if (!$includeDrafts) {
                $sql .= " AND status = 'published'";
            }
            $statement = $database->prepare($sql);
            $statement->execute(['id' => $id]);
            $order = $statement->fetch();
            if (is_array($order)) {
                return admin_job_order_from_database($order);
            }
        }

        // Try lookup by order_code or slug
        $allOrders = admin_job_orders_list($includeDrafts);
        foreach ($allOrders as $item) {
            if (strcasecmp($item['orderCode'] ?? '', $id) === 0 || admin_job_order_to_slug($item['title'] ?? '') === $id) {
                return $item;
            }
        }
        return null;
    }

    $allOrders = admin_job_orders_list($includeDrafts);
    foreach ($allOrders as $order) {
        if ($order['id'] === $id || strcasecmp($order['orderCode'] ?? '', $id) === 0 || admin_job_order_to_slug($order['title'] ?? '') === $id) {
            return $order;
        }
    }

    return null;
}

function admin_job_order_create(array $payload): array
{
    $order = admin_job_order_normalize_payload($payload);
    $order['id'] = bin2hex(random_bytes(12));
    $order['createdAt'] = date('Y-m-d H:i:s');
    $order['updatedAt'] = $order['createdAt'];

    $database = admin_job_orders_database();
    if ($database !== null) {
        admin_job_order_insert_database($database, $order);
    } else {
        $orders = admin_job_order_load_file();
        array_unshift($orders, $order);
        admin_job_order_save_file($orders);
    }

    try {
        require_once __DIR__ . '/_notifications.php';
        admin_notification_create([
            'eventType' => 'order.created',
            'category' => 'orders',
            'title' => 'Đơn hàng mới: ' . $order['title'],
            'message' => 'Mã: ' . ($order['orderCode'] ?? '') . ' | Địa điểm: ' . ($order['location'] ?? '') . ' | Lương: ' . ($order['salary'] ?? ''),
            'actor' => ['id' => 'admin', 'name' => 'Quản trị viên', 'role' => 'Admin'],
            'target' => [
                'type' => 'order',
                'id' => $order['id'],
                'code' => $order['orderCode'] ?? '',
                'name' => $order['title'],
                'url' => '/quan-tri-viejap?section=orders&id=' . $order['id'],
            ],
            'priority' => !empty($order['isFeatured']) ? 'high' : 'medium',
        ]);
        admin_activity_log_create([
            'actorName' => 'Quản trị viên',
            'actorRole' => 'Admin',
            'action' => 'Tạo đơn hàng mới',
            'targetType' => 'order',
            'targetId' => $order['id'],
            'targetName' => $order['title'],
            'details' => 'Đơn hàng ' . ($order['orderCode'] ?? '') . ' được tạo với trạng thái ' . $order['status'] . '.',
            'changes' => [
                ['field' => 'title', 'fieldLabel' => 'Tiêu đề', 'before' => null, 'after' => $order['title']],
                ['field' => 'salary', 'fieldLabel' => 'Mức lương', 'before' => null, 'after' => $order['salary']],
                ['field' => 'status', 'fieldLabel' => 'Trạng thái', 'before' => null, 'after' => $order['status']],
            ],
        ]);
    } catch (Throwable) {}

    return $order;
}

function admin_job_order_update(string $id, array $payload): ?array
{
    $id = trim($id);
    if ($id === '') {
        return null;
    }

    $existing = admin_job_order_find($id, true);
    if ($existing === null) {
        $allOrders = admin_job_orders_list(true);
        foreach ($allOrders as $o) {
            if (($o['id'] ?? '') === $id || strcasecmp((string) ($o['orderCode'] ?? ''), $id) === 0) {
                $existing = $o;
                break;
            }
        }
    }

    if ($existing === null) {
        return null;
    }

    $targetId = (string) $existing['id'];
    $order = admin_job_order_normalize_payload($payload, $existing);
    $order['id'] = $targetId;
    $order['createdAt'] = $existing['createdAt'] ?? date('Y-m-d H:i:s');
    $order['updatedAt'] = date('Y-m-d H:i:s');

    $database = admin_job_orders_database();
    if ($database !== null) {
        try {
            $statement = $database->prepare(
                'UPDATE job_orders SET
                    image_url = :image_url, poster_url = :poster_url, order_code = :order_code,
                    title = :title, category = :category, location = :location, salary = :salary,
                    age_range = :age_range, summary = :summary, requirements = :requirements,
                    departure_month = :departure_month,
                    status = :status, is_featured = :is_featured, updated_at = :updated_at,
                    company = :company, job_type = :job_type, quantity = :quantity,
                    gender = :gender, education = :education, japanese_level = :japanese_level,
                    contract_term = :contract_term, interview_date = :interview_date,
                    specific_work = :specific_work, work_environment = :work_environment,
                    working_hours = :working_hours, holidays = :holidays, experience = :experience,
                    health_requirements = :health_requirements, basic_salary = :basic_salary,
                    take_home_salary = :take_home_salary, overtime = :overtime, allowances = :allowances,
                    bonus = :bonus, insurance = :insurance, accommodation = :accommodation,
                    meals = :meals, transport = :transport, other_benefits = :other_benefits,
                    post_content = :post_content, facebook_content = :facebook_content,
                    post_template_id = :post_template_id, post_blocks = :post_blocks,
                    gallery_images = :gallery_images
                 WHERE id = :id'
            );
            $values = admin_job_order_database_values($order);
            // created_at không nằm trong câu lệnh UPDATE nên bắt buộc phải loại bỏ để tránh lỗi PDO HY093
            unset($values['created_at']);
            $statement->execute($values);
        } catch (Throwable $dbError) {
            error_log('[VieJap order update db] ' . $dbError->getMessage());
        }
    }

    // Luôn đồng bộ cập nhật vào file JSON lưu trữ để đảm bảo 100% dữ liệu không bao giờ bị mất
    try {
        $orders = admin_job_order_load_file();
        $updatedAny = false;
        foreach ($orders as $index => $candidate) {
            if ((string) ($candidate['id'] ?? '') === $targetId || strcasecmp((string) ($candidate['orderCode'] ?? ''), (string) ($order['orderCode'] ?? '')) === 0) {
                $orders[$index] = $order;
                $updatedAny = true;
                break;
            }
        }
        if (!$updatedAny) {
            $orders[] = $order;
            $updatedAny = true;
        }
        if ($updatedAny) {
            admin_job_order_save_file($orders);
        }
    } catch (Throwable $fileError) {
        error_log('[VieJap order update file] ' . $fileError->getMessage());
    }

    try {
        $diff = [];
        $labels = [
            'title' => 'Tiêu đề',
            'salary' => 'Mức lương',
            'location' => 'Địa điểm làm việc',
            'category' => 'Ngành nghề',
            'status' => 'Trạng thái',
            'isFeatured' => 'Đơn nổi bật',
            'departureMonth' => 'Xuất cảnh',
            'ageRange' => 'Độ tuổi',
        ];
        foreach ($labels as $f => $lbl) {
            $oldVal = (string) ($existing[$f] ?? '');
            $newVal = (string) ($order[$f] ?? '');
            if ($oldVal !== $newVal) {
                $diff[] = [
                    'field' => $f,
                    'fieldLabel' => $lbl,
                    'before' => $oldVal,
                    'after' => $newVal,
                ];
            }
        }

        require_once __DIR__ . '/_notifications.php';
        admin_notification_create([
            'eventType' => 'order.updated',
            'category' => 'orders',
            'title' => 'Đơn hàng cập nhật: ' . $order['title'],
            'message' => count($diff) > 0 ? ('Có ' . count($diff) . ' trường thông tin vừa được cập nhật.') : 'Nội dung đơn hàng đã được cập nhật.',
            'actor' => ['id' => 'admin', 'name' => 'Quản trị viên', 'role' => 'Admin'],
            'target' => [
                'type' => 'order',
                'id' => $order['id'],
                'code' => $order['orderCode'] ?? '',
                'name' => $order['title'],
                'url' => '/quan-tri-viejap?section=orders&id=' . $order['id'],
            ],
            'priority' => 'medium',
        ]);
        admin_activity_log_create([
            'actorName' => 'Quản trị viên',
            'actorRole' => 'Admin',
            'action' => 'Chỉnh sửa đơn hàng',
            'targetType' => 'order',
            'targetId' => $order['id'],
            'targetName' => $order['title'],
            'details' => 'Cập nhật thông tin đơn hàng ' . ($order['orderCode'] ?? '') . '.',
            'changes' => $diff,
        ]);
    } catch (Throwable) {}

    return $order;
}

function admin_job_order_delete(string $id): bool
{
    $id = trim($id);
    if ($id === '') {
        return false;
    }

    $existing = admin_job_order_find($id, true);
    if ($existing === null) {
        $allOrders = admin_job_orders_list(true);
        foreach ($allOrders as $o) {
            if (($o['id'] ?? '') === $id || strcasecmp($o['orderCode'] ?? '', $id) === 0) {
                $existing = $o;
                break;
            }
        }
    }

    $targetId = $existing ? (string) $existing['id'] : $id;
    $targetCode = $existing ? (string) ($existing['orderCode'] ?? '') : '';
    $deleted = false;

    // 1. Xóa khỏi MySQL nếu có cấu hình Database
    $database = admin_job_orders_database();
    if ($database !== null) {
        try {
            $statement = $database->prepare(
                'DELETE FROM job_orders WHERE id = :id OR order_code = :id OR TRIM(id) = :id'
            );
            $statement->execute(['id' => $targetId]);
            if ($statement->rowCount() > 0) {
                $deleted = true;
            }

            if ($targetCode !== '' && $targetCode !== $targetId) {
                $statement = $database->prepare(
                    'DELETE FROM job_orders WHERE order_code = :code OR id = :code'
                );
                $statement->execute(['code' => $targetCode]);
                if ($statement->rowCount() > 0) {
                    $deleted = true;
                }
            }

            // Dọn dẹp bản ghi khóa idempotency
            try {
                $stmtIdem = $database->prepare('DELETE FROM job_order_idempotency WHERE order_id = :id');
                $stmtIdem->execute(['id' => $targetId]);
            } catch (Throwable) {}
        } catch (Throwable $e) {
            error_log('[VieJap order delete db] ' . $e->getMessage());
        }
    }

    // 2. Đồng thời xóa khỏi kho lưu trữ file JSON (bảo đảm cả 2 kho dữ liệu luôn đồng bộ)
    try {
        $orders = admin_job_order_load_file();
        $initialCount = count($orders);
        $remaining = array_values(array_filter($orders, static function (array $order) use ($targetId, $targetCode, $id): bool {
            $orderId = trim((string) ($order['id'] ?? ''));
            $orderCode = trim((string) ($order['orderCode'] ?? ''));
            if ($orderId !== '' && (strcasecmp($orderId, $targetId) === 0 || strcasecmp($orderId, $id) === 0)) {
                return false;
            }
            if ($targetCode !== '' && strcasecmp($orderCode, $targetCode) === 0) {
                return false;
            }
            if ($orderCode !== '' && strcasecmp($orderCode, $id) === 0) {
                return false;
            }
            return true;
        }));

        if (count($remaining) !== $initialCount) {
            admin_job_order_save_file($remaining);
            $deleted = true;
        }
    } catch (Throwable $e) {
        error_log('[VieJap order delete file] ' . $e->getMessage());
    }

    // Luôn ghi log nếu có dữ liệu đơn hàng
    if ($existing !== null) {
        try {
            require_once __DIR__ . '/_notifications.php';
            admin_notification_create([
                'eventType' => 'order.deleted',
                'category' => 'orders',
                'title' => 'Đơn hàng đã xóa: ' . ($existing['title'] ?? $targetId),
                'message' => 'Đơn hàng ' . ($existing['orderCode'] ?? $targetId) . ' vừa được xóa khỏi hệ thống.',
                'actor' => ['id' => 'admin', 'name' => 'Quản trị viên', 'role' => 'Admin'],
                'target' => [
                    'type' => 'order',
                    'id' => $targetId,
                    'code' => $existing['orderCode'] ?? '',
                    'name' => $existing['title'] ?? 'Đơn hàng',
                    'url' => '/quan-tri-viejap?section=orders',
                ],
                'priority' => 'high',
            ]);
            admin_activity_log_create([
                'actorName' => 'Quản trị viên',
                'actorRole' => 'Admin',
                'action' => 'Xóa đơn hàng',
                'targetType' => 'order',
                'targetId' => $targetId,
                'targetName' => $existing['title'] ?? 'Đơn hàng',
                'details' => 'Đơn hàng đã được xóa khỏi danh sách.',
            ]);
        } catch (Throwable) {}
    }

    // Trả về true để bảo đảm thao tác xóa có tính lũy đẳng (Idempotent), tránh 404 gây lỗi cho giao diện
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
            id, image_url, poster_url, order_code, title, category, location, salary, age_range, summary,
            requirements, departure_month, status, is_featured, created_at, updated_at,
            company, job_type, quantity, gender, education, japanese_level, contract_term, interview_date,
            specific_work, work_environment, working_hours, holidays, experience, health_requirements,
            basic_salary, take_home_salary, overtime, allowances, bonus, insurance,
            accommodation, meals, transport, other_benefits,
            post_content, facebook_content, post_template_id, post_blocks, gallery_images
        ) VALUES (
            :id, :image_url, :poster_url, :order_code, :title, :category, :location, :salary, :age_range, :summary,
            :requirements, :departure_month, :status, :is_featured, :created_at, :updated_at,
            :company, :job_type, :quantity, :gender, :education, :japanese_level, :contract_term, :interview_date,
            :specific_work, :work_environment, :working_hours, :holidays, :experience, :health_requirements,
            :basic_salary, :take_home_salary, :overtime, :allowances, :bonus, :insurance,
            :accommodation, :meals, :transport, :other_benefits,
            :post_content, :facebook_content, :post_template_id, :post_blocks, :gallery_images
        )'
    );
    $statement->execute(admin_job_order_database_values($order));
}

function admin_job_order_database_values(array $order): array
{
    $orderCode = trim((string) ($order['orderCode'] ?? ''));
    if ($orderCode === '') {
        $orderCode = 'DH-' . strtoupper(substr((string) $order['id'], 0, 6));
    }
    return [
        'id'                 => $order['id'],
        'image_url'          => $order['imageUrl'],
        'poster_url'         => $order['posterUrl'] ?? '',
        'order_code'         => substr($orderCode, 0, 48),
        'title'              => $order['title'] ?? admin_job_order_default_title((string) ($order['category'] ?? '')),
        'category'           => $order['category'],
        'location'           => substr((string) ($order['location'] ?? ''), 0, 100),
        'salary'             => substr((string) ($order['salary'] ?? ''), 0, 100),
        'age_range'          => substr((string) ($order['ageRange'] ?? ''), 0, 60),
        'summary'            => $order['description'],
        'requirements'       => (string) ($order['requirements'] ?? ''),
        'departure_month'    => substr((string) ($order['departureMonth'] ?? ''), 0, 48),
        'status'             => $order['status'],
        'is_featured'        => $order['isFeatured'] ? 1 : 0,
        'created_at'         => $order['createdAt'],
        'updated_at'         => $order['updatedAt'],
        // Các cột chi tiết bổ sung
        'company'            => substr((string) ($order['company'] ?? ''), 0, 160),
        'job_type'           => substr((string) ($order['jobType'] ?? ''), 0, 120),
        'quantity'           => substr((string) ($order['quantity'] ?? ''), 0, 80),
        'gender'             => substr((string) ($order['gender'] ?? 'Nam/Nữ'), 0, 40),
        'education'          => substr((string) ($order['education'] ?? 'Tốt nghiệp THPT trở lên'), 0, 120),
        'japanese_level'     => substr((string) ($order['japaneseLevel'] ?? ''), 0, 120),
        'contract_term'      => substr((string) ($order['contractTerm'] ?? '3 năm'), 0, 60),
        'interview_date'     => substr((string) ($order['interviewDate'] ?? ''), 0, 60),
        'specific_work'      => (string) ($order['specificWork'] ?? ''),
        'work_environment'   => (string) ($order['workEnvironment'] ?? ''),
        'working_hours'      => (string) ($order['workingHours'] ?? ''),
        'holidays'           => (string) ($order['holidays'] ?? ''),
        'experience'         => (string) ($order['experience'] ?? ''),
        'health_requirements'=> (string) ($order['healthRequirements'] ?? ''),
        'basic_salary'       => substr((string) ($order['basicSalary'] ?? ''), 0, 120),
        'take_home_salary'   => substr((string) ($order['takeHomeSalary'] ?? ''), 0, 120),
        'overtime'           => (string) ($order['overtime'] ?? ''),
        'allowances'         => (string) ($order['allowances'] ?? ''),
        'bonus'              => (string) ($order['bonus'] ?? ''),
        'insurance'          => (string) ($order['insurance'] ?? ''),
        'accommodation'      => (string) ($order['accommodation'] ?? ''),
        'meals'              => (string) ($order['meals'] ?? ''),
        'transport'          => (string) ($order['transport'] ?? ''),
        'other_benefits'     => (string) ($order['otherBenefits'] ?? ''),
        'post_content'       => (string) ($order['postContent'] ?? ''),
        'facebook_content'   => (string) ($order['facebookContent'] ?? ''),
        'post_template_id'   => substr((string) ($order['postTemplateId'] ?? 'standard_general'), 0, 80),
        'post_blocks'        => json_encode($order['postBlocks'] ?? [], JSON_UNESCAPED_UNICODE),
        'gallery_images'     => json_encode($order['galleryImages'] ?? [], JSON_UNESCAPED_UNICODE),
    ];
}

function admin_job_order_from_database(array $order): array
{
    $category = (string) ($order['category'] ?? '');
    $imageUrl = (string) ($order['image_url'] ?? '');
    if (!admin_job_order_is_usable_image_url($imageUrl)) {
        $imageUrl = admin_job_order_legacy_image($category);
    }

    $posterUrl = (string) ($order['poster_url'] ?? $order['posterUrl'] ?? '');
    if (!admin_job_order_is_usable_image_url($posterUrl)) {
        $posterUrl = '';
    }

    $postBlocks = $order['post_blocks'] ?? $order['postBlocks'] ?? '[]';
    if (is_string($postBlocks)) {
        $postBlocks = json_decode($postBlocks, true) ?? [];
    }
    $galleryImages = $order['gallery_images'] ?? $order['galleryImages'] ?? '[]';
    if (is_string($galleryImages)) {
        $galleryImages = json_decode($galleryImages, true) ?? [];
    }

    return [
        'id'                 => (string) $order['id'],
        'title'              => trim((string) ($order['title'] ?? '')),
        'category'           => admin_job_order_category((string) ($order['category'] ?? ''), $imageUrl),
        'imageUrl'           => $imageUrl,
        'posterUrl'          => $posterUrl,
        'description'        => admin_job_order_sanitize_description((string) ($order['summary'] ?? '')),
        'orderCode'          => trim((string) ($order['order_code'] ?? '')),
        'location'           => trim((string) ($order['location'] ?? '')),
        'salary'             => trim((string) ($order['salary'] ?? '')),
        'ageRange'           => trim((string) ($order['age_range'] ?? '')),
        'requirements'       => (string) ($order['requirements'] ?? ''),
        'departureMonth'     => trim((string) ($order['departure_month'] ?? '')),
        'status'             => (string) $order['status'],
        'isFeatured'         => (bool) $order['is_featured'],
        'createdAt'          => (string) $order['created_at'],
        'updatedAt'          => (string) $order['updated_at'],
        // Các trường chi tiết bổ sung
        'company'            => trim((string) ($order['company'] ?? '')),
        'jobType'            => trim((string) ($order['job_type'] ?? '')),
        'quantity'           => trim((string) ($order['quantity'] ?? '')),
        'gender'             => trim((string) ($order['gender'] ?? 'Nam/Nữ')),
        'education'          => trim((string) ($order['education'] ?? 'Tốt nghiệp THPT trở lên')),
        'japaneseLevel'      => trim((string) ($order['japanese_level'] ?? '')),
        'contractTerm'       => trim((string) ($order['contract_term'] ?? '3 năm')),
        'interviewDate'      => trim((string) ($order['interview_date'] ?? '')),
        'specificWork'       => (string) ($order['specific_work'] ?? ''),
        'workEnvironment'    => (string) ($order['work_environment'] ?? ''),
        'workingHours'       => (string) ($order['working_hours'] ?? ''),
        'holidays'           => (string) ($order['holidays'] ?? ''),
        'experience'         => (string) ($order['experience'] ?? ''),
        'healthRequirements' => (string) ($order['health_requirements'] ?? ''),
        'basicSalary'        => trim((string) ($order['basic_salary'] ?? '')),
        'takeHomeSalary'     => trim((string) ($order['take_home_salary'] ?? '')),
        'overtime'           => (string) ($order['overtime'] ?? ''),
        'allowances'         => (string) ($order['allowances'] ?? ''),
        'bonus'              => (string) ($order['bonus'] ?? ''),
        'insurance'          => (string) ($order['insurance'] ?? ''),
        'accommodation'      => (string) ($order['accommodation'] ?? ''),
        'meals'              => (string) ($order['meals'] ?? ''),
        'transport'          => (string) ($order['transport'] ?? ''),
        'otherBenefits'      => (string) ($order['other_benefits'] ?? ''),
        'postContent'        => (string) ($order['post_content'] ?? ''),
        'facebookContent'    => (string) ($order['facebook_content'] ?? ''),
        'postTemplateId'     => trim((string) ($order['post_template_id'] ?? 'standard_general')),
        'postBlocks'         => is_array($postBlocks) ? $postBlocks : [],
        'galleryImages'      => is_array($galleryImages) ? $galleryImages : [],
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
    if ($imageUrl === '' || !admin_job_order_is_safe_image_url($imageUrl)) {
        $imageUrl = admin_job_order_legacy_image($category);
    }

    $posterUrl = trim((string) ($payload['posterUrl'] ?? ($existing['posterUrl'] ?? '')));
    if ($posterUrl !== '' && !admin_job_order_is_safe_image_url($posterUrl)) {
        $posterUrl = '';
    }

    $descriptionValue = array_key_exists('description', $payload)
        ? (string) $payload['description']
        : (string) ($existing['description'] ?? '');
    $description = admin_job_order_sanitize_description($descriptionValue);
    if ($description === '') {
        $fallbackDesc = trim((string) ($payload['specificWork'] ?? ($payload['summary'] ?? ($title ?? ''))));
        $description = $fallbackDesc !== ''
            ? admin_job_order_sanitize_description($fallbackDesc)
            : 'Đơn hàng tuyển dụng VieJap.';
    }

    $status = admin_job_order_text($payload, 'status', $existing['status'] ?? 'published');
    if (!in_array($status, ['draft', 'published'], true)) {
        admin_respond(422, ['message' => 'Trạng thái đơn hàng không hợp lệ.']);
    }

    $basicSalary = substr(admin_job_order_text($payload, 'basicSalary', (string) ($existing['basicSalary'] ?? '')), 0, 120);
    $salary = substr(admin_job_order_text($payload, 'salary', (string) ($existing['salary'] ?? '')), 0, 100);
    if ($basicSalary !== '' && ($salary === '' || (array_key_exists('basicSalary', $payload) && !array_key_exists('salary', $payload)))) {
        $salary = $basicSalary;
    } elseif ($salary !== '' && $basicSalary === '') {
        $basicSalary = $salary;
    }

    return [
        'category' => $category,
        'title' => $title,
        'imageUrl' => $imageUrl,
        'posterUrl' => $posterUrl,
        'description' => $description,
        'orderCode' => substr(admin_job_order_text($payload, 'orderCode', (string) ($existing['orderCode'] ?? '')), 0, 48),
        'location' => substr(admin_job_order_text($payload, 'location', (string) ($existing['location'] ?? '')), 0, 100),
        'salary' => $salary,
        'ageRange' => substr(admin_job_order_text($payload, 'ageRange', (string) ($existing['ageRange'] ?? '')), 0, 60),
        'requirements' => substr(
            array_key_exists('requirements', $payload)
                ? (string) $payload['requirements']
                : (string) ($existing['requirements'] ?? ''),
            0, 65535
        ),
        'departureMonth' => substr(admin_job_order_text($payload, 'departureMonth', (string) ($existing['departureMonth'] ?? '')), 0, 48),
        'company' => substr(admin_job_order_text($payload, 'company', (string) ($existing['company'] ?? '')), 0, 160),
        'jobType' => substr(admin_job_order_text($payload, 'jobType', (string) ($existing['jobType'] ?? '')), 0, 120),
        'quantity' => substr(admin_job_order_text($payload, 'quantity', (string) ($existing['quantity'] ?? '')), 0, 80),
        'gender' => substr(admin_job_order_text($payload, 'gender', (string) ($existing['gender'] ?? 'Nam/Nữ')), 0, 40),
        'education' => substr(admin_job_order_text($payload, 'education', (string) ($existing['education'] ?? 'Tốt nghiệp THPT trở lên')), 0, 120),
        'japaneseLevel' => substr(admin_job_order_text($payload, 'japaneseLevel', (string) ($existing['japaneseLevel'] ?? 'Không yêu cầu khi thi tuyển')), 0, 120),
        'contractTerm' => substr(admin_job_order_text($payload, 'contractTerm', (string) ($existing['contractTerm'] ?? '3 năm')), 0, 60),
        'interviewDate' => substr(admin_job_order_text($payload, 'interviewDate', (string) ($existing['interviewDate'] ?? '')), 0, 60),
        'specificWork' => substr(admin_job_order_text($payload, 'specificWork', (string) ($existing['specificWork'] ?? '')), 0, 65535),
        'workEnvironment' => substr(admin_job_order_text($payload, 'workEnvironment', (string) ($existing['workEnvironment'] ?? '')), 0, 500),
        'workingHours' => substr(admin_job_order_text($payload, 'workingHours', (string) ($existing['workingHours'] ?? '')), 0, 300),
        'holidays' => substr(admin_job_order_text($payload, 'holidays', (string) ($existing['holidays'] ?? '')), 0, 300),
        'experience' => substr(admin_job_order_text($payload, 'experience', (string) ($existing['experience'] ?? '')), 0, 500),
        'healthRequirements' => substr(admin_job_order_text($payload, 'healthRequirements', (string) ($existing['healthRequirements'] ?? '')), 0, 500),
        'basicSalary' => $basicSalary,
        'takeHomeSalary' => substr(admin_job_order_text($payload, 'takeHomeSalary', (string) ($existing['takeHomeSalary'] ?? '')), 0, 120),
        'overtime' => substr(admin_job_order_text($payload, 'overtime', (string) ($existing['overtime'] ?? '')), 0, 300),
        'allowances' => substr(admin_job_order_text($payload, 'allowances', (string) ($existing['allowances'] ?? '')), 0, 500),
        'bonus' => substr(admin_job_order_text($payload, 'bonus', (string) ($existing['bonus'] ?? '')), 0, 300),
        'insurance' => substr(admin_job_order_text($payload, 'insurance', (string) ($existing['insurance'] ?? '')), 0, 300),
        'accommodation' => substr(admin_job_order_text($payload, 'accommodation', (string) ($existing['accommodation'] ?? '')), 0, 300),
        'meals' => substr(admin_job_order_text($payload, 'meals', (string) ($existing['meals'] ?? '')), 0, 300),
        'transport' => substr(admin_job_order_text($payload, 'transport', (string) ($existing['transport'] ?? '')), 0, 300),
        'otherBenefits' => substr(admin_job_order_text($payload, 'otherBenefits', (string) ($existing['otherBenefits'] ?? '')), 0, 500),
        'postContent' => (string) ($payload['postContent'] ?? ($existing['postContent'] ?? '')),
        'facebookContent' => (string) ($payload['facebookContent'] ?? ($existing['facebookContent'] ?? '')),
        'postTemplateId' => substr(admin_job_order_text($payload, 'postTemplateId', (string) ($existing['postTemplateId'] ?? 'standard_general')), 0, 80),
        'postBlocks' => is_array($payload['postBlocks'] ?? null) ? $payload['postBlocks'] : ($existing['postBlocks'] ?? []),
        'galleryImages' => is_array($payload['galleryImages'] ?? null) ? $payload['galleryImages'] : ($existing['galleryImages'] ?? []),
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
    $posterUrl = trim((string) ($order['posterUrl'] ?? ''));
    if ($posterUrl !== '' && !admin_job_order_is_usable_image_url($posterUrl)) {
        $posterUrl = '';
    }
    $description = admin_job_order_sanitize_description(
        (string) ($order['description'] ?? $order['summary'] ?? '')
    );

    return [
        'id' => (string) $order['id'],
        'title' => trim((string) ($order['title'] ?? '')),
        'category' => admin_job_order_category($category, $imageUrl),
        'imageUrl' => $imageUrl,
        'posterUrl' => $posterUrl,
        'description' => $description,
        'orderCode' => trim((string) ($order['orderCode'] ?? '')),
        'location' => trim((string) ($order['location'] ?? '')),
        'salary' => trim((string) ($order['salary'] ?? '')),
        'ageRange' => trim((string) ($order['ageRange'] ?? '')),
        'requirements' => (string) ($order['requirements'] ?? ''),
        'departureMonth' => trim((string) ($order['departureMonth'] ?? '')),
        'company' => trim((string) ($order['company'] ?? '')),
        'jobType' => trim((string) ($order['jobType'] ?? '')),
        'quantity' => trim((string) ($order['quantity'] ?? '')),
        'gender' => trim((string) ($order['gender'] ?? 'Nam/Nữ')),
        'education' => trim((string) ($order['education'] ?? 'Tốt nghiệp THPT trở lên')),
        'japaneseLevel' => trim((string) ($order['japaneseLevel'] ?? 'Không yêu cầu khi thi tuyển')),
        'contractTerm' => trim((string) ($order['contractTerm'] ?? '3 năm')),
        'interviewDate' => trim((string) ($order['interviewDate'] ?? '')),
        'specificWork' => (string) ($order['specificWork'] ?? ''),
        'workEnvironment' => (string) ($order['workEnvironment'] ?? ''),
        'workingHours' => (string) ($order['workingHours'] ?? ''),
        'holidays' => (string) ($order['holidays'] ?? ''),
        'experience' => (string) ($order['experience'] ?? ''),
        'healthRequirements' => (string) ($order['healthRequirements'] ?? ''),
        'basicSalary' => trim((string) ($order['basicSalary'] ?? '')),
        'takeHomeSalary' => trim((string) ($order['takeHomeSalary'] ?? '')),
        'overtime' => (string) ($order['overtime'] ?? ''),
        'allowances' => (string) ($order['allowances'] ?? ''),
        'bonus' => (string) ($order['bonus'] ?? ''),
        'insurance' => (string) ($order['insurance'] ?? ''),
        'accommodation' => (string) ($order['accommodation'] ?? ''),
        'meals' => (string) ($order['meals'] ?? ''),
        'transport' => (string) ($order['transport'] ?? ''),
        'otherBenefits' => (string) ($order['otherBenefits'] ?? ''),
        'postContent' => (string) ($order['postContent'] ?? ''),
        'facebookContent' => (string) ($order['facebookContent'] ?? ''),
        'postTemplateId' => trim((string) ($order['postTemplateId'] ?? 'standard_general')),
        'postBlocks' => is_array($order['postBlocks'] ?? null) ? $order['postBlocks'] : [],
        'galleryImages' => is_array($order['galleryImages'] ?? null) ? $order['galleryImages'] : [],
        'status' => ($order['status'] ?? 'draft') === 'published' ? 'published' : 'draft',
        'isFeatured' => (bool) ($order['isFeatured'] ?? false),
        'createdAt' => (string) ($order['createdAt'] ?? date('Y-m-d H:i:s')),
        'updatedAt' => (string) ($order['updatedAt'] ?? date('Y-m-d H:i:s')),
    ];
}

function admin_job_order_draft_file_path(): string
{
    return admin_storage_directory() . DIRECTORY_SEPARATOR . 'job-order-draft.json';
}

function admin_job_order_draft_save(array $draft): void
{
    admin_write_json_file(admin_job_order_draft_file_path(), $draft);
}

function admin_job_order_draft_get(): ?array
{
    $path = admin_job_order_draft_file_path();
    if (!is_file($path)) {
        return null;
    }
    $raw = file_get_contents($path);
    $draft = $raw === false ? null : json_decode($raw, true);
    return is_array($draft) ? $draft : null;
}

function admin_job_order_draft_clear(): void
{
    $path = admin_job_order_draft_file_path();
    if (is_file($path)) {
        @unlink($path);
    }
}

function admin_job_order_code_exists(string $code, ?string $excludeId = null): bool
{
    $code = trim($code);
    if ($code === '') {
        return false;
    }
    $all = admin_job_orders_list(true);
    foreach ($all as $item) {
        if ($excludeId !== null) {
            $itemId = (string) ($item['id'] ?? '');
            $itemCode = (string) ($item['orderCode'] ?? '');
            if ($itemId === $excludeId || strcasecmp($itemCode, $excludeId) === 0) {
                continue;
            }
        }
        if (strcasecmp((string) ($item['orderCode'] ?? ''), $code) === 0) {
            return true;
        }
    }
    return false;
}

function admin_job_order_save_file(array $orders): void
{
    $values = array_values($orders);
    admin_write_json_file(admin_job_order_file_path(), $values);

    // Đồng bộ cả kho private dự phòng nếu tồn tại trên máy chủ
    try {
        $home = admin_home_directory();
        if ($home !== null) {
            $privatePath = $home . DIRECTORY_SEPARATOR . 'private' . DIRECTORY_SEPARATOR . 'viejap' . DIRECTORY_SEPARATOR . 'admin' . DIRECTORY_SEPARATOR . 'job-orders.json';
            if (is_file($privatePath) && realpath($privatePath) !== realpath(admin_job_order_file_path())) {
                admin_write_json_file($privatePath, $values);
            }
        }
    } catch (Throwable) {}
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
    $imageUrl = trim($imageUrl);
    if ($imageUrl === '') {
        return false;
    }
    if (str_starts_with($imageUrl, 'data:image/')) {
        return true;
    }
    return preg_match('#^/?uploads/[A-Za-z0-9/_(). -]+\.(?:jpe?g|png|webp|gif|svg)$#i', $imageUrl) === 1
        || preg_match('#^/?assets/[A-Za-z0-9/_(). -]+\.(?:jpe?g|png|webp|gif|svg)$#i', $imageUrl) === 1;
}

function admin_job_order_is_usable_image_url(string $imageUrl): bool
{
    if (!admin_job_order_is_safe_image_url($imageUrl)) {
        return false;
    }

    if (str_starts_with($imageUrl, 'data:image/')) {
        return true;
    }

    if (preg_match('#^/?uploads/#i', $imageUrl)) {
        $path = dirname(__DIR__, 2) . DIRECTORY_SEPARATOR . str_replace('/', DIRECTORY_SEPARATOR, ltrim($imageUrl, '/'));
        return is_file($path);
    }

    return true;
}

function admin_job_order_is_valid_id(string $id): bool
{
    return preg_match('/^[a-zA-Z0-9_-]{1,64}$/', trim($id)) === 1;
}

function admin_job_order_idempotency_key(): string
{
    $key = trim((string) ($_SERVER['HTTP_X_IDEMPOTENCY_KEY'] ?? ''));
    if ($key === '' || !preg_match('/^[A-Za-z0-9_-]{8,40}$/', $key)) {
        return '';
    }
    return $key;
}

function admin_job_order_find_by_idempotency(string $key): ?array
{
    $database = admin_job_orders_database();
    if ($database === null) {
        return null;
    }
    try {
        $statement = $database->prepare(
            'SELECT order_id FROM job_order_idempotency WHERE idem_key = :key LIMIT 1'
        );
        $statement->execute(['key' => $key]);
        $row = $statement->fetch();
    } catch (PDOException) {
        return null;
    }
    if (!is_array($row) || !isset($row['order_id'])) {
        return null;
    }
    return admin_job_order_find((string) $row['order_id'], true);
}

function admin_job_order_remember_idempotency(string $key, string $orderId): void
{
    $database = admin_job_orders_database();
    if ($database === null) {
        return;
    }
    try {
        $database->exec(
            "DELETE FROM job_order_idempotency WHERE created_at < (NOW() - INTERVAL 1 DAY)"
        );
        $statement = $database->prepare(
            'INSERT IGNORE INTO job_order_idempotency (idem_key, order_id, created_at)
             VALUES (:key, :order_id, NOW())'
        );
        $statement->execute(['key' => $key, 'order_id' => $orderId]);
    } catch (PDOException) {
        // Best-effort: idempotency must never break order creation.
    }
}
