import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NgbCarousel, NgbCarouselModule } from '@ng-bootstrap/ng-bootstrap';

type ProgramDetail = {
  title: string;
  subtitle: string;
  paragraphs: string[];
  roadmapLink: string;
  recruitLink: string;
  consultLink: string;
  images?: string[];
};

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, RouterModule, NgbCarouselModule],
  templateUrl: './about.html',
  styleUrl: './about.scss',
})
export class About {
  constructor() {}

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
      key: 'ky-su',
      label: 'Kỹ sư',
      icon: 'fas fa-laptop-code',
      description:
        'Tốt nghiệp cao đẳng, đại học các ngành nghề, sẵn sàng làm việc trong các dự án tại Nhật Bản với kỹ năng chuyên môn.',
    },
    {
      key: 'tokutei',
      label: 'Tokutei',
      icon: 'fas fa-user-cog',
      description:
        'Lao động có kỹ năng đặc định, được đào tạo và làm việc tại Nhật Bản trong các ngành nghề dành cho lao động có kinh nghiệm, chứng chỉ ngành nghề.',
    },
    {
      key: 'thuc-tap-sinh',
      label: 'Thực tập sinh',
      icon: 'fas fa-id-badge',
      description:
        'Được đào tạo thực tế tại Nhật Bản, học hỏi công nghệ và trau dồi kỹ năng để phát triển sự nghiệp trong môi trường chuyên nghiệp.',
    },
    {
      key: 'du-hoc-sinh',
      label: 'Du học sinh',
      icon: 'fas fa-book-reader',
      description:
        'Học tập tại Nhật Bản, trải nghiệm văn hóa và giáo dục tiên tiến, mở rộng kiến thức và mối quan hệ cho tương lai.',
    },
  ];

  engineerProgram: ProgramDetail = {
    title: 'Kỹ Sư',
    subtitle:
      'Chương trình Kỹ sư Nhật Bản là chương trình đưa lao động có trình độ chuyên môn cao sang làm việc tại các doanh nghiệp Nhật Bản theo diện visa kỹ sư (Engineer/Specialist in Humanities/International Services).',
    paragraphs: [
      'Đây là chương trình dành cho các ứng viên đã tốt nghiệp cao đẳng, đại học trở lên, có chuyên ngành phù hợp với vị trí tuyển dụng và có năng lực tiếng Nhật đáp ứng yêu cầu công việc.',
      'Tham gia chương trình, ứng viên sẽ được làm việc trực tiếp tại các công ty Nhật Bản với mức lương và chế độ đãi ngộ tương đương người lao động Nhật, môi trường làm việc chuyên nghiệp, hiện đại và có nhiều cơ hội phát triển nghề nghiệp lâu dài.',
      'Ngoài ra, người lao động còn được tham gia đầy đủ các chế độ bảo hiểm theo quy định của pháp luật Nhật Bản, có cơ hội gia hạn visa dài hạn, chuyển việc hợp pháp và bảo lãnh người thân sang Nhật sinh sống khi đáp ứng đủ điều kiện.',
      'Chương trình Kỹ sư Nhật Bản không chỉ giúp người lao động nâng cao thu nhập mà còn là cơ hội tích lũy kinh nghiệm quốc tế, phát triển kỹ năng chuyên môn, ngoại ngữ và mở rộng cơ hội nghề nghiệp trong tương lai.',
      'Đây được xem là một trong những con đường làm việc tại Nhật Bản ổn định, bền vững và có giá trị lâu dài đối với nguồn nhân lực chất lượng cao.',
    ],
    roadmapLink: '/chuong-trinh/ky-su/lo-trinh',
    recruitLink: '/chuong-trinh/ky-su/don-tuyen',
    consultLink: '/lien-he',
    images: ['assets/images/KySu/1.jpg', 'assets/images/KySu/2.jpg', 'assets/images/KySu/3.jpg'],
  };

  programDetails: Record<string, ProgramDetail> = {
    'ky-su': this.engineerProgram,
    tokutei: {
      title: 'Tokutei',
      subtitle:
        'Chương trình Tokutei (Kỹ năng đặc định) dành cho ứng viên có năng lực nghề và định hướng làm việc dài hạn tại Nhật Bản.',
      paragraphs: [
        'Ứng viên tham gia sẽ được đào tạo tiếng Nhật, kỹ năng chuyên môn và tác phong làm việc để đáp ứng yêu cầu của doanh nghiệp tiếp nhận.',
        'Chương trình phù hợp với nhiều nhóm ngành như chế biến thực phẩm, cơ khí, xây dựng, điều dưỡng, nhà hàng - khách sạn và các lĩnh vực đang thiếu hụt nhân lực tại Nhật Bản.',
        'Người lao động được hưởng lương và chế độ theo quy định, đồng thời có cơ hội gia hạn thời gian lưu trú theo từng diện nghề khi đáp ứng đủ điều kiện.',
      ],
      roadmapLink: '/chuong-trinh/tokutei/lo-trinh',
      recruitLink: '/chuong-trinh/tokutei/don-tuyen',
      consultLink: '/lien-he',
    },
    'thuc-tap-sinh': {
      title: 'Thực tập sinh',
      subtitle:
        'Chương trình Thực tập sinh kỹ năng giúp ứng viên tích lũy tay nghề, kinh nghiệm thực tế và nâng cao thu nhập tại Nhật Bản.',
      paragraphs: [
        'Ứng viên được đào tạo định hướng trước xuất cảnh về tiếng Nhật, văn hóa, kỷ luật lao động và kỹ năng cần thiết theo ngành đăng ký.',
        'Trong thời gian làm việc, người lao động được hỗ trợ theo dõi và đồng hành để thích nghi môi trường làm việc chuyên nghiệp, an toàn.',
        'Sau khi hoàn thành chương trình, ứng viên có thêm nền tảng nghề nghiệp vững chắc và nhiều cơ hội phát triển ở cả thị trường trong nước và quốc tế.',
      ],
      roadmapLink: '/chuong-trinh/thuc-tap-sinh/lo-trinh',
      recruitLink: '/chuong-trinh/thuc-tap-sinh/don-tuyen',
      consultLink: '/lien-he',
    },
    'du-hoc-sinh': {
      title: 'Du học sinh',
      subtitle:
        'Chương trình Du học Nhật Bản dành cho học viên muốn phát triển học thuật, ngoại ngữ và cơ hội nghề nghiệp quốc tế.',
      paragraphs: [
        'Học viên được tư vấn lộ trình trường học, ngành học, hồ sơ và kế hoạch tài chính phù hợp với điều kiện cá nhân.',
        'Ngoài mục tiêu học tập, chương trình còn giúp học viên rèn luyện kỹ năng sống độc lập, giao tiếp quốc tế và tư duy chuyên nghiệp.',
        'Sau tốt nghiệp, học viên có nhiều lựa chọn như làm việc tại Nhật, chuyển tiếp lên bậc học cao hơn hoặc phát triển sự nghiệp tại Việt Nam.',
      ],
      roadmapLink: '/chuong-trinh/du-hoc-sinh/lo-trinh',
      recruitLink: '/chuong-trinh/du-hoc-sinh/don-tuyen',
      consultLink: '/lien-he',
    },
  };

  selectedProgramDetail: ProgramDetail = this.engineerProgram;
  isProgramPopupOpen = false;

  openProgramModal(programKey: string): void {
    this.selectedProgramDetail = this.programDetails[programKey] ?? this.engineerProgram;
    this.isProgramPopupOpen = true;
    this.togglePageScrollLocked(true);
  }

  closeProgramPopup(): void {
    this.isProgramPopupOpen = false;
    this.togglePageScrollLocked(false);
  }

  private togglePageScrollLocked(isLocked: boolean): void {
    if (typeof document === 'undefined') {
      return;
    }

    document.body.style.overflow = isLocked ? 'hidden' : '';
  }

  // Chính sách hỗ trợ
  policyCategories = [
    {
      id: 'policy-loan',
      icon: 'fas fa-hand-holding-usd',
      title: 'Hỗ trợ vay vốn',
      status: 'Đang áp dụng',
    },
    {
      id: 'policy-nenkin',
      icon: 'fas fa-yen-sign',
      title: 'Hỗ trợ nhận Nenkin',
      status: 'Đang áp dụng',
    },
    {
      id: 'policy-protection',
      icon: 'fas fa-shield-alt',
      title: 'Chính sách bảo hộ',
      status: 'Đang cập nhật',
    },
  ];

  selectedPolicyId = 'policy-loan';

  loanPolicy = {
    title:
      'Hỗ trợ vay vốn theo Thông tư số 27/2015/TT-BLĐTBXH của Bộ Lao Động, Thương binh & Xã hội (nay là Bộ Nội vụ)',
    description:
      'Người lao động Việt Nam đi làm việc tại Nhật Bản có thể được hỗ trợ vay vốn để chi trả chi phí xuất cảnh theo quy định hiện hành.',
    maxLoan: 'Tối đa 100% chi phí làm việc ở nước ngoài theo hợp đồng',
    interestRate: '6,6%/năm',
    bank: 'Ngân hàng Chính sách Xã hội',
    note: 'Mức lãi suất ưu đãi tương đương đối tượng hộ nghèo.',
  };

  loanPolicyProvinces = [
    'Cần Thơ',
    'An Giang',
    'Kiên Giang',
    'Đồng Tháp',
    'Vĩnh Long',
    'Bến Tre',
    'Tiền Giang',
    'Trà Vinh',
    'Hậu Giang',
    'Sóc Trăng',
    'Bạc Liêu',
    'Cà Mau',
  ];

  nenkinPolicy = {
    title: 'Hỗ trợ nhận tiền Nenkin sau khi hoàn thành hợp đồng tại Nhật Bản',
    description:
      'Người lao động sau khi hết hợp đồng và về Việt Nam có thể nhận lại khoảng 85 đến 150 triệu đồng tùy theo thời gian làm việc tại Nhật Bản.',
    formula: 'Số tiền nhận được = Lương trung bình x Hệ số',
    timeToReceive: 'Số tiền thường nhận sau 3-6 tháng kể từ khi kết thúc hợp đồng và về nước.',
    support:
      'Ứng viên của FUJISAN được hỗ trợ miễn phí 100% thủ tục nhận tiền này, không thu phí dịch vụ.',
    marketFeeNote: 'Phí dịch vụ thị trường thường dao động khoảng 5-10% tổng số tiền nhận được.',
    example: {
      title: 'Ví dụ thực tế',
      content:
        'Hoàn thành 3 năm thực tập sinh, lương trung bình (chưa trừ) 230.000 yên thì số tiền nhận được là 230.000 x 3.3 = 759.000 yên (~129.030.000 VNĐ).',
    },
  };

  nenkinFactors = [
    {
      monthRange: '36 - 42 tháng',
      factor: '3.3',
    },
    {
      monthRange: '42 - 48 tháng',
      factor: '3.8',
    },
    {
      monthRange: '48 - 54 tháng',
      factor: '4.4',
    },
    {
      monthRange: '54 - 60 tháng',
      factor: '4.9',
    },
    {
      monthRange: 'Trên 60 tháng',
      factor: '5.5',
    },
  ];

  protectionPolicy = {
    title: 'Chính sách bảo hộ lao động tại Nhật Bản',
    description:
      'Nội dung chi tiết đang được cập nhật theo quy định mới nhất để đảm bảo quyền lợi người lao động trước, trong và sau thời gian làm việc tại Nhật Bản.',
    items: [
      'Bảo vệ quyền và lợi ích hợp pháp của người lao động theo hợp đồng.',
      'Hỗ trợ xử lý tình huống phát sinh trong quá trình làm việc tại Nhật Bản.',
      'Phối hợp với nghiệp đoàn, công ty tiếp nhận và cơ quan liên quan khi cần thiết.',
    ],
  };

  selectPolicy(policyId: string, carousel?: NgbCarousel): void {
    this.selectedPolicyId = policyId;
    carousel?.select(policyId);
  }

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
