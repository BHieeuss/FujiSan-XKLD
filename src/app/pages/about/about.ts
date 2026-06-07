import { Component, HostListener, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { APP_COMPANY_INFO, APP_CONTACT_INFO } from '../../models/app.config';

type ProgramFact = {
  icon: string;
  title: string;
  text: string;
};

type ProgramDetail = {
  title: string;
  eyebrow: string;
  subtitle: string;
  facts: ProgramFact[];
  note: string;
  images: string[];
  guideImage: string;
  guideAlt: string;
};

type ActivityImage = {
  src: string;
  alt: string;
};

type CompanyActivity = {
  id: string;
  category: string;
  title: string;
  summary: string;
  location: string;
  metric: string;
  metricLabel: string;
  coverImage: ActivityImage;
  gallery: ActivityImage[];
  highlights: string[];
  video?: string;
};

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './about.html',
  styleUrl: './about.scss',
})
export class About implements OnDestroy {
  constructor() { }

  /* ============================================================
     DỮ LIỆU TRANG GIỚI THIỆU
     ============================================================ */

  // Thông tin công ty - từ config
  companyInfo = APP_COMPANY_INFO;

  // Thông tin liên hệ - từ config
  contactInfo = APP_CONTACT_INFO;

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
      badge: 'Cao đẳng / Đại học',
      supportText: 'Làm việc theo chuyên môn',
      coverImage: 'assets/images/KySu/1.png',
      coverAlt: 'Kỹ sư làm việc và trao đổi bản vẽ tại công trường Nhật Bản',
      description:
        'Dành cho ứng viên có chuyên môn phù hợp, muốn làm việc và phát triển nghề nghiệp lâu dài tại Nhật Bản.',
    },
    {
      key: 'tokutei',
      label: 'Tokutei',
      icon: 'fas fa-user-cog',
      badge: 'Kỹ năng đặc định',
      supportText: 'Phù hợp người đã có tay nghề',
      coverImage: 'assets/images/TKT/2.png',
      coverAlt: 'Nhân sự ngành bếp được đào tạo kỹ năng tại Nhật Bản',
      description:
        'Hướng làm việc dành cho ứng viên có kinh nghiệm nghề, tiếng Nhật và mong muốn gắn bó ổn định.',
    },
    {
      key: 'thuc-tap-sinh',
      label: 'Thực tập sinh',
      icon: 'fas fa-id-badge',
      badge: 'Đào tạo trước xuất cảnh',
      supportText: 'Tích lũy tay nghề thực tế',
      coverImage: 'assets/images/TTS/1.png',
      coverAlt: 'Nhóm thực tập sinh làm việc tại doanh nghiệp Nhật Bản',
      description:
        'Phù hợp với người muốn học nghề, làm việc thực tế và tích lũy kinh nghiệm trong môi trường Nhật Bản.',
    },
    {
      key: 'du-hoc-sinh',
      label: 'Du học sinh',
      icon: 'fas fa-book-reader',
      badge: 'Học tập tại Nhật',
      supportText: 'Chọn trường và chuẩn bị hồ sơ',
      coverImage: 'assets/images/DHS/3.png',
      coverAlt: 'Du học sinh Việt Nam trong lễ nhập học tại Nhật Bản',
      description:
        'Dành cho học viên muốn học tiếng, tiếp tục học tập và mở rộng cơ hội nghề nghiệp tại Nhật Bản.',
    },
  ];

  engineerProgram: ProgramDetail = {
    title: 'Kỹ sư',
    eyebrow: 'Làm việc theo đúng chuyên môn',
    subtitle:
      'Hợp với bạn đã tốt nghiệp cao đẳng hoặc đại học đúng ngành và muốn phát triển nghề nghiệp lâu dài tại Nhật.',
    facts: [
      {
        icon: 'fas fa-user-check',
        title: 'Bạn thường cần',
        text: 'Bằng cấp đúng chuyên ngành và tiếng Nhật phù hợp với vị trí.',
      },
      {
        icon: 'fas fa-briefcase',
        title: 'Công việc',
        text: 'Làm tại doanh nghiệp Nhật theo chuyên môn bạn đã học.',
      },
      {
        icon: 'fas fa-hands-helping',
        title: 'VieJap đi cùng bạn',
        text: 'Xem hồ sơ, luyện phỏng vấn và chuẩn bị trước khi sang Nhật.',
      },
    ],
    note: 'Chưa chắc ngành học của mình có phù hợp? Cứ gửi hồ sơ hiện tại, VieJap xem cùng bạn trước.',
    images: ['assets/images/KySu/1.png', 'assets/images/KySu/2.png', 'assets/images/KySu/3.png'],
    guideImage: 'assets/images/KySu/ks.png',
    guideAlt: 'Lộ trình tham gia chương trình Kỹ sư Nhật Bản',
  };

  programDetails: Record<string, ProgramDetail> = {
    'ky-su': this.engineerProgram,
    tokutei: {
      title: 'Tokutei',
      eyebrow: 'Dành cho người đã có tay nghề',
      subtitle:
        'Hợp với bạn đã có kinh nghiệm nghề, muốn làm việc ổn định và tiếp tục nâng tay nghề tại Nhật.',
      facts: [
        {
          icon: 'fas fa-tools',
          title: 'Bạn thường cần',
          text: 'Kỹ năng nghề, tiếng Nhật và chứng chỉ phù hợp với nhóm ngành.',
        },
        {
          icon: 'fas fa-industry',
          title: 'Nhóm việc phổ biến',
          text: 'Thực phẩm, cơ khí, xây dựng, điều dưỡng, nhà hàng và khách sạn.',
        },
        {
          icon: 'fas fa-hands-helping',
          title: 'VieJap đi cùng bạn',
          text: 'Kiểm tra điều kiện, ôn kỹ năng và chuẩn bị hồ sơ phỏng vấn.',
        },
      ],
      note: 'Nếu bạn đã từng là thực tập sinh hoặc đang có tay nghề, VieJap có thể giúp kiểm tra hướng chuyển phù hợp.',
      images: ['assets/images/TKT/1.png', 'assets/images/TKT/2.png', 'assets/images/TKT/3.png'],
      guideImage: 'assets/images/TKT/tkt.png',
      guideAlt: 'Lộ trình tham gia chương trình Tokutei Nhật Bản',
    },
    'thuc-tap-sinh': {
      title: 'Thực tập sinh',
      eyebrow: 'Vừa học nghề, vừa làm việc thực tế',
      subtitle:
        'Hợp với bạn muốn học một nghề rõ ràng, có trải nghiệm làm việc tại Nhật và tích lũy nền tảng cho chặng đường sau này.',
      facts: [
        {
          icon: 'fas fa-user-graduate',
          title: 'Trước khi đi',
          text: 'Học tiếng Nhật, tác phong, văn hóa và kỹ năng cần thiết.',
        },
        {
          icon: 'fas fa-hard-hat',
          title: 'Trong thời gian làm việc',
          text: 'Rèn tay nghề thực tế và làm quen môi trường doanh nghiệp Nhật.',
        },
        {
          icon: 'fas fa-hands-helping',
          title: 'VieJap đi cùng bạn',
          text: 'Theo sát từ lúc chọn ngành, chuẩn bị hồ sơ đến khi sang Nhật.',
        },
      ],
      note: 'Chưa biết nên chọn ngành nào cũng không sao. VieJap sẽ dựa vào sức khỏe, sở thích và kế hoạch của bạn để cùng chọn.',
      images: ['assets/images/TTS/1.png', 'assets/images/TTS/2.png', 'assets/images/TTS/3.png'],
      guideImage: 'assets/images/TTS/tts.png',
      guideAlt: 'Lộ trình tham gia chương trình Thực tập sinh Nhật Bản',
    },
    'du-hoc-sinh': {
      title: 'Du học sinh',
      eyebrow: 'Học tập và mở rộng cơ hội tại Nhật',
      subtitle:
        'Hợp với bạn muốn học tiếng, tiếp tục lên chuyên môn và chuẩn bị thêm lựa chọn nghề nghiệp tại Nhật.',
      facts: [
        {
          icon: 'fas fa-school',
          title: 'Chọn hướng học',
          text: 'Cùng xem trường, ngành học và khu vực phù hợp với mục tiêu.',
        },
        {
          icon: 'fas fa-wallet',
          title: 'Chuẩn bị tài chính',
          text: 'Tính trước học phí, sinh hoạt phí và kế hoạch của gia đình.',
        },
        {
          icon: 'fas fa-hands-helping',
          title: 'VieJap đi cùng bạn',
          text: 'Hỗ trợ hồ sơ, phỏng vấn trường và chuẩn bị cuộc sống tại Nhật.',
        },
      ],
      note: 'Bạn chưa cần chọn trường ngay. VieJap có thể cùng gia đình xem mục tiêu học tập và mức chuẩn bị phù hợp trước.',
      images: ['assets/images/DHS/1.png', 'assets/images/DHS/2.png', 'assets/images/DHS/3.png'],
      guideImage: 'assets/images/DHS/dhs.png',
      guideAlt: 'Lộ trình tham gia chương trình Du học sinh Nhật Bản',
    },
  };

  selectedProgramDetail: ProgramDetail = this.engineerProgram;
  isProgramPopupOpen = false;
  isProgramRoadmapOpen = false;

  openProgramModal(programKey: string): void {
    this.selectedProgramDetail = this.programDetails[programKey] ?? this.engineerProgram;
    this.isProgramRoadmapOpen = false;
    this.isProgramPopupOpen = true;
    this.togglePageScrollLocked(true);
  }

  showProgramRoadmap(): void {
    this.isProgramRoadmapOpen = true;
  }

  showProgramOverview(): void {
    this.isProgramRoadmapOpen = false;
  }

  closeProgramPopup(): void {
    this.isProgramPopupOpen = false;
    this.isProgramRoadmapOpen = false;
    this.togglePageScrollLocked(false);
  }

  @HostListener('document:keydown.escape')
  closeProgramPopupOnEscape(): void {
    if (!this.isProgramPopupOpen) {
      return;
    }

    if (this.isProgramRoadmapOpen) {
      this.showProgramOverview();
      return;
    }

    this.closeProgramPopup();
  }

  ngOnDestroy(): void {
    this.togglePageScrollLocked(false);
  }

  private togglePageScrollLocked(isLocked: boolean): void {
    if (typeof document === 'undefined') {
      return;
    }

    document.body.style.overflow = isLocked ? 'hidden' : '';
  }

  // Chính sách hỗ trợ
  policyVerifiedOn = '07/06/2026';

  policyCategories = [
    {
      id: 'policy-loan',
      icon: 'fas fa-hand-holding-usd',
      title: 'Vay vốn',
      summary: 'Kiểm tra đúng đối tượng và mức vay',
    },
    {
      id: 'policy-nenkin',
      icon: 'fas fa-yen-sign',
      title: 'Nenkin',
      summary: 'Điều kiện và hồ sơ nhận trợ cấp',
    },
    {
      id: 'policy-protection',
      icon: 'fas fa-shield-alt',
      title: 'Quyền cần nhớ',
      summary: 'Quyền lợi và kênh hỗ trợ chính thức',
    },
  ];

  selectedPolicyId = 'policy-loan';

  loanPolicy = {
    eyebrow: 'Vay theo đối tượng, không tự động áp dụng',
    title: 'Vay chi phí đi làm việc ở nước ngoài',
    description:
      'Ngân hàng Chính sách Xã hội cho vay đối với một số nhóm lao động đủ điều kiện. Hồ sơ được xét tại nơi người lao động cư trú hợp pháp.',
    illustration: 'assets/images/stickers/policies/loan-support.svg',
    illustrationAlt: 'Minh họa hồ sơ vay vốn đi làm việc ở nước ngoài',
    facts: [
      {
        icon: 'fas fa-wallet',
        label: 'Mức vay',
        value: 'Tối đa 100% chi phí ghi trong hợp đồng',
      },
      {
        icon: 'fas fa-percentage',
        label: 'Lãi suất tham khảo',
        value: '6,24%/năm từ 01/12/2025',
      },
      {
        icon: 'fas fa-calendar-alt',
        label: 'Thời hạn vay',
        value: 'Không quá thời hạn làm việc trong hợp đồng',
      },
    ],
    eligibleGroups: [
      'Người lao động thuộc hộ nghèo hoặc hộ cận nghèo.',
      'Người lao động là người dân tộc thiểu số.',
      'Thân nhân của người có công với cách mạng.',
      'Người lao động thuộc hộ bị thu hồi đất nông nghiệp.',
    ],
    requirements: [
      'Có năng lực hành vi dân sự đầy đủ và cư trú hợp pháp.',
      'Đã ký hợp đồng với doanh nghiệp đưa người lao động đi làm việc ở nước ngoài.',
      'Vốn vay dùng cho các khoản chi phí được ghi trong hợp đồng.',
      'Có bảo đảm tiền vay khi NHCSXH yêu cầu.',
    ],
    note:
      'Lãi suất và chương trình bổ sung của từng địa phương có thể thay đổi. Người lao động nên xác nhận trực tiếp với NHCSXH nơi cư trú trước khi lập kế hoạch tài chính.',
    sources: [
      {
        label: 'Mức lãi suất hiện hành - NHCSXH',
        url: 'https://vbsp.org.vn/tu-ngay-1122025-nhcsxh-giam-lai-suat-cho-vay-cac-chuong-trinh-tin-dung-chinh-sach.html',
      },
      {
        label: 'Tài liệu điều kiện vay - NHCSXH',
        url: 'https://vbsp.org.vn/wp-content/uploads/2024/08/Cho-vay-ng%C6%B0%E1%BB%9Di-lao-%C4%91%E1%BB%99ng-%C4%91i-l%C3%A0m-vi%E1%BB%87c-%E1%BB%9F-n%C6%B0%E1%BB%9Bc-ngo%C3%A0i-theo-h%E1%BB%A3p-%C4%91%E1%BB%93ng.pdf',
      },
    ],
  };

  nenkinPolicy = {
    eyebrow: 'Trợ cấp lương hưu trọn gói khi rời Nhật',
    title: 'Nenkin: kiểm tra điều kiện trước khi nộp',
    description:
      'Số tiền không cố định theo một mức chung. Cơ quan Lương hưu Nhật Bản tính dựa trên loại bảo hiểm, thời gian tham gia và mức lương tiêu chuẩn của từng hồ sơ.',
    illustration: 'assets/images/stickers/policies/nenkin-guide.svg',
    illustrationAlt: 'Minh họa hồ sơ nhận trợ cấp Nenkin',
    conditions: [
      'Không mang quốc tịch Nhật Bản và không còn địa chỉ tại Nhật.',
      'Có thời gian tham gia bảo hiểm đủ từ 6 tháng trở lên.',
      'Chưa từng có quyền nhận lương hưu Nhật Bản, kể cả trợ cấp thương tật.',
      'Nộp hồ sơ trong vòng 2 năm kể từ ngày không còn địa chỉ tại Nhật.',
    ],
    reminders: [
      {
        icon: 'fas fa-calendar-check',
        title: 'Mức tính tối đa',
        text: 'Thông thường tính theo tối đa 60 tháng tham gia đối với kỳ đóng cuối từ tháng 4/2021.',
      },
      {
        icon: 'fas fa-history',
        title: 'Cân nhắc thời gian đã đóng',
        text: 'Khi nhận trợ cấp, toàn bộ thời gian tham gia trước thời điểm yêu cầu sẽ không còn được tính cho lương hưu sau này.',
      },
      {
        icon: 'fas fa-receipt',
        title: 'Thuế với Kosei Nenkin',
        text: 'Khoản trợ cấp bảo hiểm hưu trí phúc lợi có thể bị khấu trừ 20,42% thuế; có trường hợp được làm thủ tục hoàn thuế.',
      },
    ],
    steps: [
      'Báo chuyển khỏi địa chỉ cư trú tại Nhật và giữ giấy tờ cần thiết.',
      'Chuẩn bị đơn, bản sao hộ chiếu, thông tin tài khoản và mã số lương hưu.',
      'Gửi hồ sơ đến Cơ quan Lương hưu Nhật Bản trong thời hạn 2 năm.',
      'Giữ thông báo quyết định để kiểm tra khoản nhận và làm hoàn thuế nếu phù hợp.',
    ],
    note:
      'Đừng ước tính Nenkin chỉ bằng số năm làm việc. Hai hồ sơ cùng thời gian ở Nhật vẫn có thể nhận số tiền khác nhau.',
    sources: [
      {
        label: 'Hướng dẫn tiếng Việt - Japan Pension Service',
        url: 'https://www.nenkin.go.jp/international/english/japanese-system/benefit/payment.files/I.pdf',
      },
      {
        label: 'Trang thông tin Nenkin chính thức',
        url: 'https://www.nenkin.go.jp/international/english/japanese-system/benefit/payment.html',
      },
    ],
  };

  protectionPolicy = {
    eyebrow: 'Biết quyền của mình để chủ động hơn',
    title: 'Quyền lợi và kênh hỗ trợ khi làm việc tại Nhật',
    description:
      'Người lao động có quyền được cung cấp thông tin rõ ràng, được hỗ trợ thực hiện hợp đồng và được bảo vệ quyền, lợi ích hợp pháp trong thời gian làm việc ở nước ngoài.',
    illustration: 'assets/images/stickers/policies/worker-rights.svg',
    illustrationAlt: 'Minh họa quyền lợi và kênh hỗ trợ người lao động',
    rights: [
      {
        icon: 'fas fa-file-contract',
        title: 'Thông tin và hợp đồng rõ ràng',
        text: 'Được biết điều kiện làm việc, tiền lương, thời giờ làm việc, sinh hoạt và quyền lợi liên quan.',
      },
      {
        icon: 'fas fa-hard-hat',
        title: 'An toàn và điều kiện làm việc',
        text: 'Được huấn luyện an toàn, cung cấp trang bị bảo hộ phù hợp và làm việc theo nội dung đã thỏa thuận.',
      },
      {
        icon: 'fas fa-handshake',
        title: 'Được tư vấn và hỗ trợ',
        text: 'Được hỗ trợ thực hiện quyền, nghĩa vụ trong hợp đồng và liên hệ cơ quan có thẩm quyền khi cần.',
      },
      {
        icon: 'fas fa-passport',
        title: 'Giữ giấy tờ cá nhân',
        text: 'Nếu bị giữ hộ chiếu, ép về nước, bạo lực hoặc công việc khác hợp đồng, hãy liên hệ kênh hỗ trợ chính thức.',
      },
    ],
    emergencyExamples: [
      'Không được trả tiền làm thêm giờ.',
      'Bị bạo lực hoặc đe dọa.',
      'Công việc khác với hợp đồng.',
      'Bị yêu cầu giao hộ chiếu.',
      'Bị ép về nước hoặc hạn chế đi lại.',
    ],
    viejapRole:
      'VieJap tiếp nhận thông tin, hỗ trợ người lao động trao đổi với đơn vị liên quan và hướng dẫn tìm đúng kênh xử lý. VieJap không thay thế cơ quan nhà nước hoặc cơ quan pháp luật.',
    sources: [
      {
        label: 'Luật 69/2020/QH14 - Bộ Tư pháp',
        url: 'https://vbpl.moj.gov.vn/botuphap/Pages/vbpq-toanvan.aspx?ItemID=146643&Keyword=',
      },
      {
        label: 'Kênh tư vấn tiếng Việt - OTIT',
        url: 'https://www.support.otit.go.jp/soudan/vi/',
      },
    ],
  };

  selectPolicy(policyId: string): void {
    this.selectedPolicyId = policyId;
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

  companyActivities: CompanyActivity[] = [
    {
      id: 'huong-nghiep-soc-trang',
      category: 'Gặp gỡ học sinh',
      title: 'Cùng các bạn THPT Sóc Trăng tìm hiểu hướng đi sau tốt nghiệp',
      summary:
        'Đội ngũ VieJap có dịp đến các điểm trường tại Sóc Trăng để trò chuyện cùng học sinh về việc học, chọn nghề và những điều cần chuẩn bị nếu muốn tìm hiểu cơ hội tại Nhật Bản.',
      location: 'Tỉnh Sóc Trăng',
      metric: '24',
      metricLabel: 'điểm trường',
      coverImage: {
        src: 'assets/images/HoatDong/TrungThuChoEm-DaiPhuocCangLongTraVinh/z7909725364099_bcbf7fb5be2c0240114154b078a84107.jpg',
        alt: 'Học sinh tham gia buổi hướng nghiệp tại Sóc Trăng',
      },
      gallery: [
        {
          src: 'assets/images/HoatDong/TrungThuChoEm-DaiPhuocCangLongTraVinh/z7909725364099_bcbf7fb5be2c0240114154b078a84107.jpg',
          alt: 'Tập thể học sinh và tư vấn viên trong chương trình',
        },
        {
          src: 'assets/images/HoatDong/TrungThuChoEm-DaiPhuocCangLongTraVinh/z7909725215366_6362f98f30acdb51dfbfd59565fd6dc1.jpg',
          alt: 'Đội ngũ chương trình tại Trường THPT Thiều Văn Chỏi, Sóc Trăng',
        },
        {
          src: 'assets/images/HoatDong/TrungThuChoEm-DaiPhuocCangLongTraVinh/z7909725274007_54c17cd1b5778431305a76babbc637ca.jpg',
          alt: 'Tư vấn viên chia sẻ thông tin hướng nghiệp cùng học sinh',
        },
        {
          src: 'assets/images/HoatDong/TrungThuChoEm-DaiPhuocCangLongTraVinh/z7909725286261_a8526de1baf0205a79eabc52ef3c0307.jpg',
          alt: 'Học sinh nhận tài liệu sau buổi hướng nghiệp',
        },
        {
          src: 'assets/images/HoatDong/TrungThuChoEm-DaiPhuocCangLongTraVinh/z7909725304715_adfee360d68819ee96f493147740535c.jpg',
          alt: 'Tư vấn viên trao đổi trực tiếp với học sinh tại lớp',
        },
      ],
      highlights: [
        'Trò chuyện trực tiếp với học sinh tại trường',
        'Giải thích các hướng học tập và nghề nghiệp bằng cách dễ hiểu',
        'Gửi tài liệu để các bạn có thể đọc lại sau buổi gặp',
      ],
    },
    {
      id: 'trung-thu-cho-em',
      category: 'Chia sẻ cộng đồng',
      title: 'Trung thu cho em tại Đại Phước, Càng Long',
      summary:
        'Một buổi Trung thu nhỏ được tổ chức tại xã Đại Phước, huyện Càng Long, tỉnh Trà Vinh. Các em cùng vui chơi, làm đồ thủ công và nhận những phần quà được chuẩn bị từ đội ngũ.',
      location: 'Đại Phước, Càng Long, Trà Vinh',
      metric: '50',
      metricLabel: 'em học sinh',
      coverImage: {
        src: 'assets/images/HoatDong/24DiemTruongTHPTSOCTRANG/z7909725575538_c6455e009c24635dce29c381a9bca345.jpg',
        alt: 'Các em học sinh tham gia chương trình Trung thu cho em',
      },
      gallery: [
        {
          src: 'assets/images/HoatDong/24DiemTruongTHPTSOCTRANG/z7909725575538_c6455e009c24635dce29c381a9bca345.jpg',
          alt: 'Các em nhỏ nhận quà tại chương trình Trung thu',
        },
        {
          src: 'assets/images/HoatDong/24DiemTruongTHPTSOCTRANG/z7909725465081_daa2e0a9b36b6985d530a63466f22cb5.jpg',
          alt: 'Tình nguyện viên và các em nhỏ trong hoạt động trải nghiệm',
        },
        {
          src: 'assets/images/HoatDong/24DiemTruongTHPTSOCTRANG/z7909725467808_1928067d83fc90de966f57fd50cbbdb0.jpg',
          alt: 'Quà Trung thu được chuẩn bị cho các em học sinh',
        },
        {
          src: 'assets/images/HoatDong/24DiemTruongTHPTSOCTRANG/z7909725402170_2b11effe316f6276434229ba7bb68fb6.jpg',
          alt: 'Trao quà Trung thu cho các em nhỏ tại Đại Phước',
        },
        {
          src: 'assets/images/HoatDong/24DiemTruongTHPTSOCTRANG/z7909725606713_f062667a4b071cb41bef0f7bcad26b3f.jpg',
          alt: 'Em nhỏ với món quà thủ công trong chương trình Trung thu',
        },
      ],
      highlights: [
        'Gửi quà Trung thu đến các em học sinh có hoàn cảnh khó khăn',
        'Cùng các em làm đồ thủ công và sinh hoạt vui vẻ',
        'Tạo thêm một buổi gặp gỡ ấm áp với cộng đồng địa phương',
      ],
      video: 'assets/images/HoatDong/VideoHoatDong/7909740530638.mp4',
    },
  ];

  selectedActivity = this.companyActivities[0];
  selectedActivityImage = this.selectedActivity.coverImage;

  selectCompanyActivity(activity: CompanyActivity): void {
    this.selectedActivity = activity;
    this.selectedActivityImage = activity.coverImage;
  }

  selectActivityImage(image: ActivityImage): void {
    this.selectedActivityImage = image;
  }
}
