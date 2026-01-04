import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './about.html',
  styleUrl: './about.scss',
})
export class About {
  /* ============================================================
     DỮ LIỆU TRANG GIỚI THIỆU
     ============================================================ */

  // Thông tin công ty
  companyInfo = {
    name: 'CÔNG TY HỢP TÁC QUỐC TẾ FUJISAN',
    shortName: 'FujiSan',
    slogan: 'Đưa ước mơ bay xa - Đón tương lai về gần',
    description: `Công ty Hợp tác quốc tế Fujisan được thành lập với sứ mệnh kết nối nguồn nhân lực Việt Nam với thị trường lao động quốc tế, đặc biệt là Nhật Bản, Hàn Quốc và các quốc gia phát triển khác. Chúng tôi tự hào đã và đang đồng hành cùng hàng nghìn lao động Việt trên con đường lập nghiệp, góp phần nâng cao đời sống và mang đến cơ hội phát triển bền vững cho cộng đồng.`,
    commitment: `Chúng tôi tin rằng nguồn nhân lực Việt Nam hoàn toàn có thể vươn ra thế giới, khẳng định giá trị và vị thế trên trường quốc tế. Công ty hợp tác Quốc Tế Fujisan luôn sẵn sàng đồng hành, hỗ trợ tối đa để người lao động hiện thực hóa ước mơ, xây dựng tương lai vững chắc cho bản thân và gia đình.`,
  };

  // Phương châm hoạt động
  coreValues = [
    {
      icon: 'fas fa-shield-alt',
      title: 'Minh bạch',
      description:
        'Cung cấp thông tin chính xác, rõ ràng về đơn hàng và chi phí. Không phát sinh chi phí ngoài hợp đồng.',
    },
    {
      icon: 'fas fa-handshake',
      title: 'Uy tín',
      description:
        'Đảm bảo quyền lợi hợp pháp của người lao động theo đúng quy định pháp luật Việt Nam và nước tiếp nhận.',
    },
    {
      icon: 'fas fa-chart-line',
      title: 'Hiệu quả',
      description: 'Đào tạo ngoại ngữ, kỹ năng nghề và văn hóa bản xứ để lao động tự tin hội nhập.',
    },
  ];

  // Chương trình xuất cảnh
  programs = [
    {
      label: 'Kỹ sư',
      icon: 'fas fa-laptop-code',
      description:
        'Tốt nghiệp cao đẳng, đại học các ngành nghề, sẵn sàng làm việc trong các dự án tại Nhật Bản với kỹ năng chuyên môn.',
    },
    {
      label: 'Tokutei',
      icon: 'fas fa-user-cog',
      description:
        'Lao động có kỹ năng đặc định, được đào tạo và làm việc tại Nhật Bản trong các ngành nghề dành cho lao động có kinh nghiệm, chứng chỉ ngành nghề.',
    },
    {
      label: 'Thực tập sinh',
      icon: 'fas fa-id-badge',
      description:
        'Được đào tạo thực tế tại Nhật Bản, học hỏi công nghệ và trau dồi kỹ năng để phát triển sự nghiệp trong môi trường chuyên nghiệp.',
    },
    {
      label: 'Du học sinh',
      icon: 'fas fa-book-reader',
      description:
        'Học tập tại Nhật Bản, trải nghiệm văn hóa và giáo dục tiên tiến, mở rộng kiến thức và mối quan hệ cho tương lai.',
    },
  ];

  // Đội ngũ nhân sự chủ chốt
  teamMembers = [
    {
      name: 'Nguyễn Văn A',
      position: 'Giám đốc điều hành',
      description: 'Hơn 15 năm kinh nghiệm trong lĩnh vực xuất khẩu lao động và hợp tác quốc tế.',
    },
    {
      name: 'Trần Thị B',
      position: 'Phó Giám đốc',
      description: 'Chuyên gia tư vấn pháp lý và quan hệ đối tác với hơn 10 năm kinh nghiệm.',
    },
    {
      name: 'Lê Văn C',
      position: 'Trưởng phòng Tuyển dụng',
      description: 'Đã tuyển dụng thành công hơn 3000 lao động đi Nhật Bản và Hàn Quốc.',
    },
    {
      name: 'Phạm Thị D',
      position: 'Trưởng phòng Đào tạo',
      description: 'Giảng viên tiếng Nhật N1, từng du học và làm việc tại Nhật Bản 8 năm.',
    },
    {
      name: 'Hoàng Văn E',
      position: 'Trưởng phòng Hỗ trợ',
      description:
        'Hỗ trợ 24/7 cho lao động tại Nhật, giải quyết nhanh chóng mọi vấn đề phát sinh.',
    },
  ];

  // Giấy phép hoạt động
  licenses = [
    {
      title: 'Giấy phép XKLĐ',
      number: 'Số: XX/SLĐTBXH-GP',
      issueDate: 'Ngày cấp: 01/01/2024',
      issuer: 'Bộ Lao động - Thương binh và Xã hội',
      icon: 'fas fa-certificate',
    },
    {
      title: 'Giấy ĐKKD',
      number: 'MST: 0123456789',
      issueDate: 'Ngày cấp: 01/01/2024',
      issuer: 'Sở Kế hoạch và Đầu tư Hà Nội',
      icon: 'fas fa-file-contract',
    },
  ];

  // Hình ảnh gallery
  galleryImages = [
    { alt: 'Văn phòng làm việc' },
    { alt: 'Phòng họp hiện đại' },
    { alt: 'Ký túc xá học viên' },
    { alt: 'Lớp học tiếng Nhật' },
    { alt: 'Đào tạo kỹ năng nghề' },
    { alt: 'Buổi học văn hóa Nhật Bản' },
  ];

  // Video giới thiệu
  introVideos = [
    { title: 'Giới thiệu công ty FujiSan' },
    { title: 'Cơ sở vật chất đào tạo' },
    { title: 'Chia sẻ từ lao động tại Nhật' },
  ];

  // Hoạt động công ty
  newsActivities = [
    {
      title: 'FujiSan ký kết hợp tác với 10 doanh nghiệp Nhật Bản',
      date: '15/12/2025',
      source: 'Báo Lao Động',
    },
    {
      title: 'Lễ xuất cảnh 200 thực tập sinh đợt cuối năm 2025',
      date: '20/11/2025',
      source: 'VnExpress',
    },
    {
      title: 'Chương trình thiện nguyện - Về quê ăn Tết cùng lao động',
      date: '05/01/2026',
      source: 'Dân Trí',
    },
  ];
}
