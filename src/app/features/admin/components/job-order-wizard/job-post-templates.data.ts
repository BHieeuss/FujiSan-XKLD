import { JobOrder } from '../../../jobs/models/job-order.model';

export interface PostTemplateDef {
  id: string;
  name: string;
  category: string;
  badge: string;
  icon: string;
  description: string;
  generateHtml: (data: Partial<JobOrder>) => string;
  generateFacebookText: (data: Partial<JobOrder>) => string;
}

export const POST_TEMPLATES_REGISTRY: readonly PostTemplateDef[] = [
  {
    id: 'standard_general',
    name: 'Đơn tuyển dụng Chuẩn',
    category: 'Chung',
    badge: 'Phổ biến',
    icon: 'fas fa-briefcase',
    description: 'Bố cục chuẩn chỉn, thanh lịch, phù hợp với hầu hết mọi đơn hàng tuyển dụng Nhật Bản.',
    generateHtml: (d) => `
<div class="job-post-content standard-layout">
  <div class="post-header-badge">🇯🇵 THÔNG BÁO TUYỂN DỤNG LAO ĐỘNG NHẬT BẢN</div>
  <h2>${d.title || 'Đơn hàng tuyển dụng Nhật Bản'}</h2>
  <p class="post-lead">${d.description || 'Đơn hàng chất lượng cao, tiếp nhận đào tạo bài bản và môi trường đãi ngộ hấp dẫn.'}</p>

  <div class="post-info-box">
    <h3>📌 THÔNG TIN ĐƠN HÀNG</h3>
    <ul>
      <li><strong>Mã đơn hàng:</strong> ${d.orderCode || 'VJ-XKLD'}</li>
      <li><strong>Xí nghiệp tiếp nhận:</strong> ${d.company || 'Doanh nghiệp uy tín hàng đầu Nhật Bản'}</li>
      <li><strong>Địa điểm làm việc:</strong> ${d.location || 'Nhật Bản'}</li>
      <li><strong>Số lượng tuyển dụng:</strong> ${d.quantity || '05 ứng viên'} (${d.gender || 'Nam/Nữ'})</li>
      <li><strong>Thời hạn hợp đồng:</strong> ${d.contractTerm || '3 năm'} (Gia hạn thêm)</li>
      <li><strong>Dự kiến phỏng vấn:</strong> ${d.interviewDate || 'Theo lịch xí nghiệp'}</li>
      <li><strong>Dự kiến xuất cảnh:</strong> ${d.departureMonth || 'Khoảng 4-6 tháng sau trúng tuyển'}</li>
    </ul>
  </div>

  <div class="post-info-box highlight-salary">
    <h3>💰 MỨC LƯƠNG & CHẾ ĐỘ ĐÃI NGỘ</h3>
    <ul>
      <li><strong>Lương cơ bản:</strong> <span class="text-danger">${d.basicSalary || d.salary || '180.000 - 200.000 Yên/tháng'}</span></li>
      <li><strong>Thực lĩnh dự kiến:</strong> <span class="text-success">${d.takeHomeSalary || '135.000 - 150.000 Yên/tháng'}</span> (đã trừ bảo hiểm, thuế, nhà ở)</li>
      <li><strong>Làm thêm giờ (Tăng ca):</strong> ${d.overtime || 'Bình quân 25 - 40h/tháng, nhân hệ số 125% - 150%'}</li>
      <li><strong>Trợ cấp & Thưởng:</strong> ${d.allowances || 'Trợ cấp đào tạo tháng đầu 60.000 Yên, phụ cấp chuyên cần'}</li>
      <li><strong>Chế độ bảo hiểm:</strong> ${d.insurance || 'Đầy đủ BH Y tế, Nenkin, Thất nghiệp theo Luật pháp Nhật Bản'}</li>
      <li><strong>Nhà ở / Ký túc xá:</strong> ${d.accommodation || 'Ký túc xá tiện nghi, đầy đủ điều hòa, máy giặt, wifi'}</li>
    </ul>
  </div>

  <div class="post-info-box">
    <h3>🎯 YÊU CẦU TUYỂN DỤNG</h3>
    <ul>
      <li><strong>Độ tuổi:</strong> ${d.ageRange || '18 - 35 tuổi'}</li>
      <li><strong>Học vấn:</strong> ${d.education || 'Tốt nghiệp THPT trở lên'}</li>
      <li><strong>Tiếng Nhật:</strong> ${d.japaneseLevel || 'Không yêu cầu khi thi tuyển, trúng tuyển được đào tạo'}</li>
      <li><strong>Kinh nghiệm:</strong> ${d.experience || 'Không yêu cầu kinh nghiệm, tiếp nhận đào tạo từ đầu'}</li>
      <li><strong>Yêu cầu sức khỏe:</strong> ${d.healthRequirements || 'Sức khỏe tốt, không mắc bệnh truyền nhiễm, thị lực tốt'}</li>
    </ul>
  </div>
</div>
`,
    generateFacebookText: (d) => `🌸 ĐƠN HÀNG TUYỂN DỤNG NHẬT BẢN - VIEJAP 🌸
🔥 ${d.title || 'Đơn hàng Nhật Bản chất lượng cao'}
📌 Mã đơn: ${d.orderCode || 'VJ-XKLD'} | Nơi làm việc: ${d.location || 'Nhật Bản'}

💰 MỨC LƯƠNG & QUYỀN LỢI CỰC HẤP DẪN:
👉 Lương cơ bản: ${d.basicSalary || d.salary || '180.000 - 200.000 Yên/tháng (~ 31 - 35 triệu)'}
👉 Thực lĩnh dự kiến: ${d.takeHomeSalary || '135.000 - 150.000 Yên/tháng (~ 23 - 26 triệu)'}
👉 Tăng ca đều đặn: ${d.overtime || '25 - 40h/tháng'}
👉 Chế độ bảo hiểm đầy đủ, KTX tiện nghi điều hòa, wifi.

🎯 TIÊU CHÍ TUYỂN CHỌN:
- Giới tính / Độ tuổi: ${d.gender || 'Nam/Nữ'}, ${d.ageRange || '18 - 35 tuổi'}
- Trình độ: ${d.education || 'Tốt nghiệp THPT trở lên'}
- Tiếng Nhật: ${d.japaneseLevel || 'Không yêu cầu khi thi tuyển'}
- Dự kiến phỏng vấn: ${d.interviewDate || 'Sớm nhất'} | Xuất cảnh: ${d.departureMonth || 'Nhanh chóng'}

📞 LIÊN HỆ ĐĂNG KÝ & TƯ VẤN HỒ SƠ MIỄN PHÍ:
🏢 Trung tâm Hợp tác Nhân lực Nhật Bản VieJap
☎️ Hotline: 0966 966 284 (Zalo 24/7)
🌐 Website: viejap.com`,
  },

  {
    id: 'food_processing',
    name: 'Chế biến Thực phẩm & Thủy sản',
    category: 'Thực phẩm',
    badge: 'Môi trường sạch',
    icon: 'fas fa-utensils',
    description: 'Chuyên biệt cho các nhà máy chế biến thực phẩm, đóng gói cơm hộp, thủy sản đông lạnh.',
    generateHtml: (d) => `
<div class="job-post-content food-layout">
  <div class="post-header-badge">🍱 ĐƠN HÀNG CHẾ BIẾN THỰC PHẨM NHẬT BẢN</div>
  <h2>${d.title || 'Chế biến thực phẩm và đóng hộp'}</h2>
  <p class="post-lead">${d.description || 'Môi trường làm việc trong nhà xưởng sạch sẽ, điều hòa quanh năm, công việc nhẹ nhàng, nhiều việc làm thêm.'}</p>

  <div class="post-info-box">
    <h3>🍤 CHI TIẾT CÔNG VIỆC</h3>
    <ul>
      <li><strong>Nội dung:</strong> ${d.specificWork || 'Sơ chế, chế biến, đóng khay và dán nhãn thực phẩm theo dây chuyền tự động.'}</li>
      <li><strong>Môi trường:</strong> ${d.workEnvironment || 'Nhà máy hiện đại, sạch sẽ, vô trùng, điều hòa ổn định nhiệt độ tiêu chuẩn.'}</li>
      <li><strong>Thời gian làm việc:</strong> ${d.workingHours || '08:00 - 17:00 (Nghỉ 60 phút, luân phiên ca linh hoạt)'}</li>
      <li><strong>Chế độ ngày nghỉ:</strong> ${d.holidays || 'Nghỉ 2 ngày/tuần, khoảng 110 ngày nghỉ/năm'}</li>
    </ul>
  </div>

  <div class="post-info-box highlight-salary">
    <h3>💴 CHẾ ĐỘ TIỀN LƯƠNG & PHÚC LỢI</h3>
    <ul>
      <li><strong>Lương cơ bản:</strong> <strong>${d.basicSalary || d.salary || '185.000 Yên/tháng'}</strong></li>
      <li><strong>Lương thực lĩnh:</strong> <strong>${d.takeHomeSalary || '140.000 Yên/tháng'}</strong></li>
      <li><strong>Làm thêm giờ:</strong> ${d.overtime || 'Nhà máy nhiều đơn hàng quanh năm, bình quân 30 - 45h tăng ca/tháng'}</li>
      <li><strong>Trợ cấp ca & chuyên cần:</strong> ${d.allowances || 'Có phụ cấp ca đêm 125%, phụ cấp chuyên cần đầy đủ'}</li>
      <li><strong>Nhà ở & Bữa ăn:</strong> ${d.accommodation || 'KTX gần nhà máy, hỗ trợ suất ăn ca thơm ngon, sạch sẽ'}</li>
    </ul>
  </div>
</div>
`,
    generateFacebookText: (d) => `🍱 ĐƠN HÀNG THỰC PHẨM NHẬT BẢN - BAY NHANH 🍱
✨ Tuyển gấp: ${d.title || 'Chế biến thực phẩm / Cơm hộp'}
📍 Địa điểm: ${d.location || 'Nhật Bản'} | Mã đơn: ${d.orderCode || 'VJ-TP'}

🌟 ƯU ĐIỂM NỔI BẬT:
✔️ Làm việc trong phòng điều hòa sạch sẽ 100%, không lo mưa nắng
✔️ Công việc nhẹ nhàng, dây chuyền hiện đại, nam nữ đều làm tốt
✔️ Việc làm thêm đều đặn quanh năm: ${d.overtime || '30 - 45h/tháng'}
✔️ Lương cơ bản: ${d.basicSalary || d.salary || '185.000 Yên/tháng (~ 32 triệu)'}
✔️ Thực nhận tay: ${d.takeHomeSalary || '140.000 Yên/tháng (~ 24.5 triệu)'}

🎯 YÊU CẦU:
- Tuổi: ${d.ageRange || '18 - 32 tuổi'}, ${d.gender || 'Nam/Nữ'}
- Chăm chỉ, ngăn nắp, thị lực tốt, sức khỏe đạt chuẩn đi Nhật
- Phỏng vấn: ${d.interviewDate || 'Dự kiến trong tháng'}

📩 Nhắn tin ngay cho VieJap để nhận form thi tuyển!
📞 Hotline/Zalo: 0966 966 284`,
  },

  {
    id: 'mechanical_cnc',
    name: 'Cơ khí & Vận hành máy CNC',
    category: 'Cơ khí',
    badge: 'Lương cao',
    icon: 'fas fa-gear',
    description: 'Dành riêng cho đơn hàng gia công kim loại, vận hành máy CNC, tiện, phay, hàn công nghiệp.',
    generateHtml: (d) => `
<div class="job-post-content mechanical-layout">
  <div class="post-header-badge">⚙️ ĐƠN HÀNG CƠ KHÍ CHÍNH XÁC & CNC</div>
  <h2>${d.title || 'Vận hành máy CNC và gia công cơ khí'}</h2>
  <p class="post-lead">${d.description || 'Tiếp cận công nghệ gia công tiên tiến của Nhật Bản, lương thưởng kỹ thuật cao, nhiều giờ làm thêm.'}</p>

  <div class="post-info-box">
    <h3>🔧 ĐẶC ĐIỂM CÔNG VIỆC CƠ KHÍ</h3>
    <ul>
      <li><strong>Vị trí thao tác:</strong> ${d.specificWork || 'Gá đặt phôi, vận hành máy phay/tiện CNC, kiểm tra kích thước sản phẩm bằng thước kẹp, panme.'}</li>
      <li><strong>Trang thiết bị:</strong> ${d.workEnvironment || 'Xưởng cơ khí tự động hóa, trang bị đồ bảo hộ lao động đạt chuẩn an toàn tuyệt đối.'}</li>
      <li><strong>Thời gian làm việc:</strong> ${d.workingHours || '08:00 - 17:00 (Nghỉ 60 phút, có tăng ca)'}</li>
    </ul>
  </div>

  <div class="post-info-box highlight-salary">
    <h3>💵 LƯƠNG & CHẾ ĐỘ ĐÃI NGỘ CAO</h3>
    <ul>
      <li><strong>Lương cơ bản:</strong> <strong>${d.basicSalary || d.salary || '195.000 - 220.000 Yên/tháng'}</strong></li>
      <li><strong>Thực lĩnh dự kiến:</strong> <strong>${d.takeHomeSalary || '155.000 - 175.000 Yên/tháng'}</strong></li>
      <li><strong>Tăng ca:</strong> ${d.overtime || 'Nhiều việc tăng ca, thu nhập thực tế có thể đạt 35 - 45 triệu VNĐ/tháng'}</li>
      <li><strong>Cơ hội chuyển đổi:</strong> ${d.otherBenefits || 'Cơ hội thi chuyển lên Tokutei hoặc Kỹ sư sau 3 năm'}</li>
    </ul>
  </div>
</div>
`,
    generateFacebookText: (d) => `⚙️ CƠ KHÍ NHẬT BẢN - THU NHẬP KHỦNG ⚙️
🔥 Đơn tuyển: ${d.title || 'Vận hành máy phay/tiện CNC'}
📍 Nơi làm việc: ${d.location || 'Aichi / Osaka, Nhật Bản'}
📌 Mã đơn: ${d.orderCode || 'VJ-CK'}

💪 QUYỀN LỢI ĐỈNH CAO:
💰 Lương cơ bản: ${d.basicSalary || d.salary || '195.000 - 220.000 Yên (~ 34 - 38 triệu)'}
💰 Thực nhận: ${d.takeHomeSalary || '155.000 - 175.000 Yên (~ 27 - 31 triệu)'}
⚡ Tăng ca cực nhiều: 35 - 50 giờ/tháng (Thu nhập thực tế 35 - 45 triệu)
🎓 Được học hỏi và tích lũy tay nghề công nghệ máy móc Nhật Bản

🎯 TIÊU CHÍ:
- Giới tính: ${d.gender || 'Nam'}, Độ tuổi: ${d.ageRange || '19 - 35 tuổi'}
- Khỏe mạnh, khéo tay, có tinh thần học hỏi (ưu tiên tốt nghiệp trung cấp/cao đẳng kỹ thuật)
- Phỏng vấn: ${d.interviewDate || 'Lịch sớm nhất'}

📲 Đăng ký phỏng vấn ngay: 0966 966 284`,
  },

  {
    id: 'construction',
    name: 'Xây dựng & Hoàn thiện',
    category: 'Xây dựng',
    badge: 'Tăng ca nhiều',
    icon: 'fas fa-building',
    description: 'Phù hợp các đơn cốt pha, giàn giáo, sơn xây dựng, hoàn thiện nội thất.',
    generateHtml: (d) => `
<div class="job-post-content construction-layout">
  <div class="post-header-badge">🏗️ ĐƠN HÀNG XÂY DỰNG & HOÀN THIỆN CÔNG TRÌNH</div>
  <h2>${d.title || 'Thi công hoàn thiện công trình'}</h2>
  <p class="post-lead">${d.description || 'Mức lương cơ bản cao, nhiều phụ cấp ngoài trời và cơ hội tăng ca bứt phá thu nhập.'}</p>

  <div class="post-info-box">
    <h3>👷 NỘI DUNG CÔNG VIỆC</h3>
    <ul>
      <li><strong>Mô tả:</strong> ${d.specificWork || 'Lắp dựng cốt pha, hoàn thiện bề mặt hoặc lắp đặt thiết bị nội ngoại thất.'}</li>
      <li><strong>Môi trường:</strong> ${d.workEnvironment || 'Công trường an toàn, trang bị đồ bảo hộ hiện đại chuẩn Nhật Bản.'}</li>
    </ul>
  </div>

  <div class="post-info-box highlight-salary">
    <h3>💰 LƯƠNG & PHỤ CẤP</h3>
    <ul>
      <li><strong>Lương cơ bản:</strong> ${d.basicSalary || d.salary || '200.000 - 230.000 Yên/tháng'}</li>
      <li><strong>Thực lĩnh:</strong> ${d.takeHomeSalary || '160.000 - 180.000 Yên/tháng'}</li>
      <li><strong>Phụ cấp:</strong> ${d.allowances || 'Phụ cấp công trình, trợ cấp đi lại, ký túc xá giá rẻ'}</li>
    </ul>
  </div>
</div>
`,
    generateFacebookText: (d) => `🏗️ XÂY DỰNG NHẬT BẢN - LƯƠNG CAO VƯỢT TRỘI 🏗️
🔥 Tuyển: ${d.title || 'Thi công xây dựng / Hoàn thiện'}
📍 Nơi làm: ${d.location || 'Tokyo / Kanagawa, Nhật Bản'}

💵 THU NHẬP HẤP DẪN:
👉 Lương cơ bản: ${d.basicSalary || d.salary || '200.000 - 230.000 Yên/tháng (~ 35 - 40 triệu)'}
👉 Thực lĩnh: ${d.takeHomeSalary || '160.000 - 180.000 Yên/tháng (~ 28 - 32 triệu)'}
👉 Trợ cấp nhà ở KTX cực rẻ, tiết kiệm tối đa tiền gửi về gia đình.

🎯 YÊU CẦU:
- Nam, ${d.ageRange || '19 - 35 tuổi'}, thể lực tốt, siêng năng
- Dự kiến thi tuyển: ${d.interviewDate || 'Trong tháng'}

📞 VieJap tư vấn 24/7: 0966 966 284`,
  },

  {
    id: 'agriculture',
    name: 'Nông nghiệp & Nhà kính',
    category: 'Nông nghiệp',
    badge: 'Chi phí rẻ',
    icon: 'fas fa-leaf',
    description: 'Chuyên biệt cho trồng trọt, thu hoạch rau củ quả trong nhà kính công nghệ cao.',
    generateHtml: (d) => `
<div class="job-post-content agriculture-layout">
  <div class="post-header-badge">🌱 ĐƠN HÀNG NÔNG NGHIỆP CÔNG NGHỆ CAO</div>
  <h2>${d.title || 'Trồng trọt và thu hoạch rau củ nhà kính'}</h2>
  <p class="post-lead">${d.description || 'Môi trường làm việc trong lành, công việc quen thuộc, chi phí sinh hoạt tại địa phương rất thấp.'}</p>

  <div class="post-info-box">
    <h3>🌾 CHI TIẾT CÔNG VIỆC</h3>
    <ul>
      <li><strong>Mô tả:</strong> ${d.specificWork || 'Chăm sóc, thu hoạch, phân loại và đóng gói nông sản trong nhà kính hiện đại.'}</li>
      <li><strong>Môi trường:</strong> ${d.workEnvironment || 'Nhà kính che chắn thời tiết, máy móc tự động tưới tiêu, thoáng mát.'}</li>
    </ul>
  </div>

  <div class="post-info-box highlight-salary">
    <h3>💴 TIỀN LƯƠNG & TIẾT KIỆM</h3>
    <ul>
      <li><strong>Lương cơ bản:</strong> ${d.basicSalary || d.salary || '175.000 - 190.000 Yên/tháng'}</li>
      <li><strong>Thực lĩnh:</strong> ${d.takeHomeSalary || '135.000 - 145.000 Yên/tháng'}</li>
      <li><strong>Chi phí:</strong> Được chủ xí nghiệp hỗ trợ rau củ quả tươi sạch hàng ngày.</li>
    </ul>
  </div>
</div>
`,
    generateFacebookText: (d) => `🌱 NÔNG NGHIỆP NHẬT BẢN - CÔNG VIỆC NHẸ NHÀNG 🌱
🌸 ${d.title || 'Trồng trọt thu hoạch rau củ nhà kính'}
📍 Tỉnh: ${d.location || 'Kagoshima / Nagano, Nhật Bản'}

🌿 ĐIỂM CỘNG ĐƠN HÀNG:
✨ Làm trong nhà kính râm mát, không nắng mưa dầm dề
✨ Chủ xí nghiệp thân thiện, thường xuyên cho rau củ sạch ăn thoải mái
✨ Lương cơ bản: ${d.basicSalary || d.salary || '175.000 - 190.000 Yên/tháng'}
✨ Thực lĩnh tiết kiệm gửi về gia đình: 22 - 25 triệu/tháng

🎯 Điều kiện: ${d.gender || 'Nam/Nữ'}, ${d.ageRange || '18 - 35 tuổi'}, chăm chỉ, chịu khó
📞 Đăng ký: 0966 966 284`,
  },

  {
    id: 'electronics',
    name: 'Điện tử & Lắp ráp linh kiện',
    category: 'Điện tử',
    badge: 'Phòng sạch',
    icon: 'fas fa-microchip',
    description: 'Sản xuất linh kiện điện tử, lắp ráp vi mạch trong phòng sạch điều hòa cao cấp.',
    generateHtml: (d) => `
<div class="job-post-content electronics-layout">
  <div class="post-header-badge">🔬 ĐƠN HÀNG SẢN XUẤT LINH KIỆN ĐIỆN TỬ</div>
  <h2>${d.title || 'Lắp ráp linh kiện điện tử và bo mạch'}</h2>
  <p class="post-lead">${d.description || 'Làm việc trong môi trường phòng sạch (Clean Room) hiện đại, sạch sẽ và nhiệt độ mát mẻ.'}</p>
  <div class="post-info-box">
    <h3>💻 MÔ TẢ CÔNG VIỆC</h3>
    <ul>
      <li><strong>Thao tác:</strong> ${d.specificWork || 'Kiểm tra ngoại quan bo mạch bằng kính hiển vi, thao tác lắp ráp linh kiện vi mô.'}</li>
      <li><strong>Môi trường:</strong> ${d.workEnvironment || 'Phòng sạch chuẩn quốc tế, trang phục chống tĩnh điện, điều hòa 24/7.'}</li>
    </ul>
  </div>
</div>
`,
    generateFacebookText: (d) => `🔬 ĐIỆN TỬ PHÒNG SẠCH NHẬT BẢN 🔬
🔥 Đơn hàng: ${d.title || 'Sản xuất linh kiện điện tử'}
📍 Địa điểm: ${d.location || 'Shizuoka / Saitama, Nhật Bản'}

💎 QUYỀN LỢI:
- 100% làm việc trong phòng sạch điều hòa 23-25 độ quanh năm
- Công việc nhẹ nhàng, không tốn sức, phù hợp cả nam và nữ
- Lương cơ bản: ${d.basicSalary || d.salary || '185.000 - 205.000 Yên/tháng'}
- Thực lĩnh: ${d.takeHomeSalary || '140.000 - 155.000 Yên/tháng'}

🎯 Độ tuổi: ${d.ageRange || '18 - 30 tuổi'}, mắt sáng, không mù màu
📞 Hotline tư vấn: 0966 966 284`,
  },

  {
    id: 'nursing_care',
    name: 'Điều dưỡng & Chăm sóc Y tế',
    category: 'Điều dưỡng',
    badge: 'Đãi ngộ cao',
    icon: 'fas fa-heart-pulse',
    description: 'Chăm sóc sức khỏe người cao tuổi tại viện dưỡng lão Nhật Bản với học bổng đào tạo.',
    generateHtml: (d) => `
<div class="job-post-content nursing-layout">
  <div class="post-header-badge">🏥 ĐƠN HÀNG ĐIỀU DƯỠNG & CHĂM SÓC NGƯỜI CAO TUỔI</div>
  <h2>${d.title || 'Chăm sóc người cao tuổi tại viện dưỡng lão'}</h2>
  <p class="post-lead">${d.description || 'Chế độ đãi ngộ cao hàng đầu, cơ hội định cư lâu dài và mang theo gia đình sang Nhật Bản.'}</p>
</div>
`,
    generateFacebookText: (d) => `🏥 ĐIỀU DƯỠNG NHẬT BẢN - ĐÃI NGỘ CAO 🏥
❤️ Đơn hàng: ${d.title || 'Điều dưỡng / Hộ lý Nhật Bản'}
📍 Nơi làm: ${d.location || 'Tokyo / Chiba'}
💰 Lương cơ bản: ${d.basicSalary || d.salary || '195.000 - 220.000 Yên/tháng'}
🎁 Hỗ trợ học bổng tiếng Nhật lên tới 100%, bảo trợ công việc dài hạn.
📞 Hotline VieJap: 0966 966 284`,
  },

  {
    id: 'facebook_viral',
    name: 'Facebook / Mạng xã hội Nhanh',
    category: 'Mạng xã hội',
    badge: 'Viral Copy',
    icon: 'fab fa-facebook',
    description: 'Văn bản ngắn gọn, súc tích, tối ưu tỷ lệ click và nhắn tin tư vấn trên mạng xã hội.',
    generateHtml: (d) => `
<div class="job-post-content viral-layout">
  <div class="post-header-badge">🚀 THÔNG BÁO TUYỂN DỤNG GẤP</div>
  <h2>${d.title || 'Đơn hàng Nhật Bản'}</h2>
  <p><strong>Mức lương:</strong> ${d.basicSalary || d.salary || '30 - 38 triệu/tháng'}</p>
  <p><strong>Địa điểm:</strong> ${d.location || 'Nhật Bản'}</p>
  <p><strong>Phỏng vấn:</strong> ${d.interviewDate || 'Sớm nhất'}</p>
</div>
`,
    generateFacebookText: (d) => `🚨 TUYỂN GẤP ĐƠN HÀNG NHẬT BẢN THÁNG NÀY 🚨
👉 Công việc: ${d.title || 'Đơn hàng Nhật Bản'}
📍 Nơi làm việc: ${d.location || 'Nhật Bản'}
💵 Lương cơ bản: ${d.basicSalary || d.salary || '30 - 38 triệu/tháng'}
💵 Thực nhận: ${d.takeHomeSalary || '23 - 28 triệu/tháng'}
⏰ Giờ làm thêm nhiều, KTX đầy đủ tiện nghi!

🎯 Điều kiện: Nam/Nữ, ${d.ageRange || '18 - 35 tuổi'}, sức khỏe tốt.
📩 INBOX hoặc gọi ngay Hotline để giữ suất phỏng vấn:
☎️ 0966 966 284 (Zalo 24/7) - VieJap Xuất Khẩu Lao Động Nhật Bản`,
  },

  {
    id: 'website_deep',
    name: 'Website Chi tiết & Chuyên sâu',
    category: 'Chuyên sâu',
    badge: 'Chi tiết',
    icon: 'fas fa-newspaper',
    description: 'Bản chi tiết toàn diện với bảng số liệu, chi tiết khấu trừ và quy trình 5 bước.',
    generateHtml: (d) => `
<div class="job-post-content deep-layout">
  <div class="post-header-badge">🇯🇵 HỒ SƠ ĐƠN HÀNG TUYỂN DỤNG CHI TIẾT</div>
  <h2>${d.title || 'Thông tin tuyển dụng chi tiết'}</h2>
  <div class="detail-table-wrap">
    <table class="detail-table">
      <tr><td>Mã đơn:</td><td><strong>${d.orderCode || 'VJ-XKLD'}</strong></td></tr>
      <tr><td>Xí nghiệp:</td><td>${d.company || 'Doanh nghiệp Nhật Bản'}</td></tr>
      <tr><td>Địa điểm:</td><td>${d.location || 'Nhật Bản'}</td></tr>
      <tr><td>Lương cơ bản:</td><td><strong>${d.basicSalary || d.salary || '185.000 Yên/tháng'}</strong></td></tr>
      <tr><td>Thực lĩnh:</td><td><strong>${d.takeHomeSalary || '140.000 Yên/tháng'}</strong></td></tr>
      <tr><td>Bảo hiểm:</td><td>${d.insurance || 'Đầy đủ theo Luật Lao động Nhật Bản'}</td></tr>
      <tr><td>Xuất cảnh:</td><td>${d.departureMonth || 'Khoảng 4-6 tháng sau trúng tuyển'}</td></tr>
    </table>
  </div>
</div>
`,
    generateFacebookText: (d) => `🇯🇵 BẢN TIN TUYỂN DỤNG VIEJAP: ${d.title || 'Đơn hàng Nhật Bản'}
Mã đơn: ${d.orderCode || 'VJ-XKLD'}
Nơi làm việc: ${d.location || 'Nhật Bản'}
Lương cơ bản: ${d.basicSalary || d.salary || '185.000 Yên/tháng'}
Thực lĩnh: ${d.takeHomeSalary || '140.000 Yên/tháng'}
Hotline tư vấn miễn phí: 0966 966 284`,
  },
];

