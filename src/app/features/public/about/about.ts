import { Component, HostListener, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  APP_COMPANY_INFO,
  APP_CONTACT_INFO,
} from '../../../core/config/app.config';

type ProgramKey = 'ky-su' | 'tokutei' | 'thuc-tap-sinh' | 'du-hoc-sinh';

type QuizOption = {
  label: string;
  detail: string;
  scores: Partial<Record<ProgramKey, number>>;
};

type QuizQuestion = {
  id: string;
  title: string;
  description: string;
  options: QuizOption[];
};

type QuizResult = {
  key: ProgramKey;
  title: string;
  icon: string;
  summary: string;
  reason: string;
};

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
  styleUrls: ['./about.scss', './about-enhancements.scss'],
})
export class About implements OnDestroy {

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

  quizQuestions: QuizQuestion[] = [
    {
      id: 'goal',
      title: 'Mục tiêu chính của bạn khi sang Nhật là gì?',
      description: 'Chọn phương án gần nhất với kế hoạch hiện tại.',
      options: [
        {
          label: 'Làm việc đúng chuyên môn đã học',
          detail: 'Muốn phát triển nghề nghiệp theo bằng cấp.',
          scores: { 'ky-su': 5, tokutei: 1 },
        },
        {
          label: 'Làm việc ổn định bằng tay nghề',
          detail: 'Đã có kinh nghiệm và muốn gắn bó lâu dài.',
          scores: { tokutei: 5, 'thuc-tap-sinh': 1 },
        },
        {
          label: 'Học nghề và tích lũy kinh nghiệm',
          detail: 'Muốn bắt đầu bằng lộ trình đào tạo rõ ràng.',
          scores: { 'thuc-tap-sinh': 5, tokutei: 1 },
        },
        {
          label: 'Học tiếng và tiếp tục học lên',
          detail: 'Ưu tiên con đường học tập tại Nhật.',
          scores: { 'du-hoc-sinh': 5 },
        },
      ],
    },
    {
      id: 'education',
      title: 'Nền tảng học tập hoặc nghề nghiệp của bạn?',
      description: 'Thông tin này giúp thu hẹp nhóm chương trình phù hợp.',
      options: [
        {
          label: 'Cao đẳng hoặc đại học đúng chuyên ngành',
          detail: 'Có bằng và muốn tìm công việc liên quan.',
          scores: { 'ky-su': 5, 'du-hoc-sinh': 1 },
        },
        {
          label: 'Đã có kinh nghiệm hoặc chứng chỉ nghề',
          detail: 'Có tay nghề thực tế trong một ngành cụ thể.',
          scores: { tokutei: 5, 'thuc-tap-sinh': 2 },
        },
        {
          label: 'Tốt nghiệp THPT và muốn học nghề',
          detail: 'Chưa có nhiều kinh nghiệm làm việc.',
          scores: { 'thuc-tap-sinh': 5, 'du-hoc-sinh': 2 },
        },
        {
          label: 'Muốn tiếp tục học tiếng hoặc chuyên môn',
          detail: 'Đang tìm trường và kế hoạch học tập.',
          scores: { 'du-hoc-sinh': 5, 'ky-su': 1 },
        },
      ],
    },
    {
      id: 'japanese',
      title: 'Tiếng Nhật hiện tại của bạn ở mức nào?',
      description: 'Không biết tiếng Nhật vẫn có thể bắt đầu chuẩn bị.',
      options: [
        {
          label: 'Chưa học hoặc mới bắt đầu',
          detail: 'Cần lộ trình học từ nền tảng.',
          scores: { 'thuc-tap-sinh': 3, 'du-hoc-sinh': 3 },
        },
        {
          label: 'Đang học, chưa thi chứng chỉ',
          detail: 'Đã quen với bảng chữ và giao tiếp cơ bản.',
          scores: { 'thuc-tap-sinh': 3, 'du-hoc-sinh': 2, 'ky-su': 1 },
        },
        {
          label: 'Khoảng N4',
          detail: 'Có thể tiếp tục luyện giao tiếp và phỏng vấn.',
          scores: { tokutei: 3, 'ky-su': 2, 'thuc-tap-sinh': 2 },
        },
        {
          label: 'N3 trở lên',
          detail: 'Có nền tảng để tiếp cận nhiều vị trí hơn.',
          scores: { 'ky-su': 4, tokutei: 4, 'du-hoc-sinh': 1 },
        },
      ],
    },
    {
      id: 'experience',
      title: 'Bạn đã có kinh nghiệm làm việc chưa?',
      description: 'Chọn theo kinh nghiệm thực tế, không cần đúng hoàn toàn.',
      options: [
        {
          label: 'Chưa có kinh nghiệm',
          detail: 'Muốn được đào tạo trước khi bắt đầu.',
          scores: { 'thuc-tap-sinh': 4, 'du-hoc-sinh': 2 },
        },
        {
          label: 'Có kinh nghiệm đúng chuyên ngành đã học',
          detail: 'Muốn tiếp tục làm công việc chuyên môn.',
          scores: { 'ky-su': 5, tokutei: 2 },
        },
        {
          label: 'Có tay nghề thực tế',
          detail: 'Từng làm nhà hàng, cơ khí, xây dựng, thực phẩm...',
          scores: { tokutei: 5, 'thuc-tap-sinh': 1 },
        },
        {
          label: 'Chủ yếu có kinh nghiệm học tập',
          detail: 'Muốn tiếp tục nâng tiếng Nhật hoặc chuyên môn.',
          scores: { 'du-hoc-sinh': 5, 'ky-su': 1 },
        },
      ],
    },
    {
      id: 'priority',
      title: 'Điều bạn ưu tiên nhất trong 2-3 năm tới?',
      description: 'Câu cuối giúp cân bằng giữa học tập và làm việc.',
      options: [
        {
          label: 'Phát triển nghề nghiệp theo chuyên môn',
          detail: 'Tích lũy kinh nghiệm và hướng tới công việc dài hạn.',
          scores: { 'ky-su': 5, tokutei: 2 },
        },
        {
          label: 'Ổn định công việc bằng kỹ năng hiện có',
          detail: 'Tập trung vào tay nghề và môi trường làm việc.',
          scores: { tokutei: 5 },
        },
        {
          label: 'Học nghề, rèn tác phong và tích lũy vốn',
          detail: 'Muốn có lộ trình dễ hình dung từ đầu.',
          scores: { 'thuc-tap-sinh': 5 },
        },
        {
          label: 'Đầu tư cho việc học và cơ hội lâu dài',
          detail: 'Muốn học tiếng, học chuyên môn rồi mới quyết định.',
          scores: { 'du-hoc-sinh': 5 },
        },
      ],
    },
  ];

  quizStep = 0;
  quizAnswers: Record<string, QuizOption> = {};
  quizResult?: QuizResult;

  readonly quizResults: Record<ProgramKey, QuizResult> = {
    'ky-su': {
      key: 'ky-su',
      title: 'Kỹ sư',
      icon: 'fas fa-laptop-code',
      summary: 'Phù hợp với người có bằng cao đẳng hoặc đại học đúng chuyên ngành.',
      reason: 'Các lựa chọn của bạn thiên về làm việc đúng chuyên môn và phát triển nghề nghiệp dài hạn.',
    },
    tokutei: {
      key: 'tokutei',
      title: 'Tokutei',
      icon: 'fas fa-user-cog',
      summary: 'Phù hợp với người đã có tay nghề, kinh nghiệm hoặc nền tảng tiếng Nhật.',
      reason: 'Các lựa chọn của bạn cho thấy ưu tiên công việc ổn định dựa trên kỹ năng thực tế.',
    },
    'thuc-tap-sinh': {
      key: 'thuc-tap-sinh',
      title: 'Thực tập sinh',
      icon: 'fas fa-id-badge',
      summary: 'Phù hợp với người muốn học nghề và tích lũy kinh nghiệm trong lộ trình rõ ràng.',
      reason: 'Các lựa chọn của bạn phù hợp với hướng vừa đào tạo, vừa làm việc và rèn tác phong.',
    },
    'du-hoc-sinh': {
      key: 'du-hoc-sinh',
      title: 'Du học sinh',
      icon: 'fas fa-book-reader',
      summary: 'Phù hợp với người ưu tiên học tiếng, học chuyên môn và mở rộng lựa chọn sau này.',
      reason: 'Các lựa chọn của bạn đặt trọng tâm vào học tập và chuẩn bị nền tảng lâu dài.',
    },
  };

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

  get currentQuizQuestion(): QuizQuestion {
    return this.quizQuestions[this.quizStep];
  }

  get quizProgress(): number {
    return this.quizResult
      ? 100
      : ((this.quizStep + 1) / this.quizQuestions.length) * 100;
  }

  chooseQuizOption(option: QuizOption): void {
    this.quizAnswers[this.currentQuizQuestion.id] = option;

    if (this.quizStep < this.quizQuestions.length - 1) {
      this.quizStep += 1;
      return;
    }

    this.quizResult = this.calculateQuizResult();
  }

  previousQuizQuestion(): void {
    if (this.quizStep > 0) {
      this.quizStep -= 1;
    }
  }

  resetQuiz(): void {
    this.quizStep = 0;
    this.quizAnswers = {};
    this.quizResult = undefined;
  }

  viewQuizProgram(): void {
    if (this.quizResult) {
      this.openProgramModal(this.quizResult.key);
    }
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

  private calculateQuizResult(): QuizResult {
    const scores: Record<ProgramKey, number> = {
      'ky-su': 0,
      tokutei: 0,
      'thuc-tap-sinh': 0,
      'du-hoc-sinh': 0,
    };

    Object.values(this.quizAnswers).forEach((answer) => {
      Object.entries(answer.scores).forEach(([key, score]) => {
        scores[key as ProgramKey] += score ?? 0;
      });
    });

    const resultKey = (Object.keys(scores) as ProgramKey[]).reduce((best, key) =>
      scores[key] > scores[best] ? key : best,
    );

    return this.quizResults[resultKey];
  }

  // Chính sách & Thông tin cần biết
  policyVerifiedOn = '07/06/2026';

  policyCategories = [
    {
      id: 'policy-loan',
      icon: 'fas fa-hand-holding-dollar',
      badge: '💰 Vay vốn',
      title: 'Hỗ trợ vay vốn',
      summary: 'Mức vay & điều kiện theo chính sách nhà nước',
      theme: 'amber',
    },
    {
      id: 'policy-nenkin',
      icon: 'fas fa-money-bill-transfer',
      badge: '💴 Tiền Nenkin',
      title: 'Lấy lại tiền Nenkin',
      summary: 'Nhận lại trọn vẹn tiền bảo hiểm khi về nước',
      theme: 'emerald',
    },
    {
      id: 'policy-protection',
      icon: 'fas fa-shield-heart',
      badge: '🛡️ Quyền lợi',
      title: 'Quyền lợi & Bảo vệ',
      summary: 'Kênh hỗ trợ tiếng Việt miễn phí 24/7 tại Nhật',
      theme: 'sky',
    },
  ];

  selectedPolicyId = 'policy-loan';

  loanPolicy = {
    eyebrow: 'Chính sách hỗ trợ từ Ngân hàng Chính sách Xã hội (NHCSXH)',
    title: 'Vay chi phí đi Nhật: Ai được vay và mức vay bao nhiêu?',
    description:
      'Nhà nước có chương trình cho vay ưu đãi với lãi suất thấp dành cho một số nhóm lao động. Bạn có thể làm thủ tục vay trực tiếp tại Ngân hàng CSXH nơi đăng ký hộ khẩu.',
    illustration: 'assets/images/stickers/policies/loan-support.svg',
    illustrationAlt: 'Minh họa hỗ trợ vay vốn đi làm việc tại Nhật Bản',
    facts: [
      {
        icon: 'fas fa-sack-dollar',
        label: 'Mức vay tối đa',
        value: 'Lên đến 100% chi phí trong hợp đồng',
        color: '#f59e0b',
      },
      {
        icon: 'fas fa-percent',
        label: 'Lãi suất ưu đãi',
        value: '6,24%/năm (khoảng 0,52%/tháng)',
        color: '#10b981',
      },
      {
        icon: 'fas fa-calendar-check',
        label: 'Thời hạn trả nợ',
        value: 'Theo suốt thời gian hợp đồng lao động',
        color: '#3b82f6',
      },
    ],
    eligibleGroups: [
      'Người lao động thuộc hộ nghèo hoặc hộ cận nghèo theo quy định.',
      'Người lao động là người đồng bào dân tộc thiểu số.',
      'Thân nhân gia đình có công với cách mạng, thương binh, liệt sĩ.',
      'Hộ gia đình thuộc diện bị thu hồi đất nông nghiệp.',
    ],
    requirements: [
      'Có CCCD/giấy tờ cư trú hợp pháp và đủ năng lực hành vi dân sự.',
      'Đã trúng tuyển và ký hợp đồng chính thức đưa đi làm việc tại Nhật.',
      'Có giấy xác nhận thuộc diện ưu tiên từ UBND cấp xã/phường.',
      'Có bảo đảm tiền vay theo hướng dẫn của Ngân hàng CSXH (nếu có yêu cầu).',
    ],
    note:
      'VieJap sẽ cung cấp đầy đủ bộ hồ sơ hợp đồng và giấy xác nhận trúng tuyển để bạn nộp trực tiếp cho Ngân hàng CSXH địa phương.',
    sources: [
      {
        label: 'Mức lãi suất hiện hành - NHCSXH',
        url: 'https://vbsp.org.vn/tu-ngay-1122025-nhcsxh-giam-lai-suat-cho-vay-cac-chuong-trinh-tin-dung-chinh-sach.html',
      },
      {
        label: 'Tài liệu điều kiện vay vốn - NHCSXH',
        url: 'https://vbsp.org.vn/wp-content/uploads/2024/08/Cho-vay-ng%C6%B0%E1%BB%9Di-lao-%C4%91%E1%BB%99ng-%C4%91i-l%C3%A0m-vi%E1%BB%87c-%E1%BB%9F-n%C6%B0%E1%BB%9Bc-ngo%C3%A0i-theo-h%E1%BB%A3p-%C4%91%E1%BB%93ng.pdf',
      },
    ],
  };

  nenkinPolicy = {
    eyebrow: 'Hoàn tiền bảo hiểm hưu trí trọn gói khi về nước',
    title: 'Lấy lại tiền Nenkin: Đừng bỏ lỡ khoản tiền lớn sau khi về nước!',
    description:
      'Nenkin là khoản tiền bảo hiểm bắt buộc bạn đóng hàng tháng tại Nhật. Sau khi kết thúc hợp đồng về nước, bạn sẽ được hoàn lại số tiền này (từ 60 triệu đến hơn 150 triệu VNĐ tùy thời gian đóng).',
    illustration: 'assets/images/stickers/policies/nenkin-guide.svg',
    illustrationAlt: 'Minh họa thủ tục nhận lại tiền Nenkin',
    conditions: [
      'Không mang quốc tịch Nhật Bản và đã cắt địa chỉ cư trú tại Nhật.',
      'Có thời gian tham gia đóng bảo hiểm từ 6 tháng trở lên.',
      'Chưa từng làm thủ tục nhận trợ cấp thương tật hoặc lương hưu tại Nhật.',
      'Nộp hồ sơ trong vòng 2 năm kể từ ngày xuất cảnh rời khỏi Nhật Bản.',
    ],
    reminders: [
      {
        icon: 'fas fa-money-bill-wave',
        title: 'Đợt 1 (Nhận khoảng 80%)',
        text: 'Nộp hồ sơ sang Cơ quan Lương hưu Nhật Bản (JPS). Tiền đợt 1 sẽ chuyển thẳng vào tài khoản ngân hàng của bạn tại Việt Nam sau 3 - 4 tháng.',
        color: '#10b981',
      },
      {
        icon: 'fas fa-receipt',
        title: 'Đợt 2 (Lấy lại ~20% tiền thuế)',
        text: 'Khoản tiền đợt 1 bị trừ 20,42% thuế thu nhập. Bạn có thể làm tiếp thủ tục xin hoàn thuế tại Nhật để nhận trọn vẹn số tiền còn lại.',
        color: '#f59e0b',
      },
      {
        icon: 'fas fa-clock-rotate-left',
        title: 'Tính tối đa lên đến 5 năm',
        text: 'Quy định mới cho phép hoàn Nenkin tối đa tới 60 tháng (5 năm) đóng bảo hiểm thay vì chỉ 3 năm như trước đây.',
        color: '#3b82f6',
      },
    ],
    steps: [
      'Làm thủ tục chuyển đi (cắt địa chỉ) tại Tòa thị chính/Quận ở Nhật trước ngày bay về.',
      'Giữ lại Sổ Nenkin (hoặc mã số Nenkin) và bản sao hộ chiếu có dấu xuất cảnh rời Nhật.',
      'Gửi hồ sơ xin nhận trợ cấp Nenkin đợt 1 sang Cơ quan Lương hưu Nhật Bản.',
      'Sau khi nhận tiền đợt 1, gửi Giấy thông báo (Gentsu) để làm thủ tục hoàn thuế đợt 2.',
    ],
    note:
      'Đừng vứt bỏ sổ Nenkin hay giấy tờ xuất cảnh! VieJap có đội ngũ hướng dẫn và hỗ trợ bạn làm thủ tục hoàn Nenkin từ A-Z.',
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
    eyebrow: 'Quyền lợi được pháp luật bảo hộ và kênh trợ giúp 24/7',
    title: 'An tâm làm việc: Quyền lợi & Kênh hỗ trợ chính thức tại Nhật',
    description:
      'Người lao động đi theo chương trình hợp pháp được pháp luật Nhật Bản và Việt Nam bảo vệ toàn diện về tiền lương, an toàn lao động và các quyền con người cơ bản.',
    illustration: 'assets/images/stickers/policies/worker-rights.svg',
    illustrationAlt: 'Minh họa quyền lợi và kênh hỗ trợ người lao động',
    rights: [
      {
        icon: 'fas fa-file-invoice-dollar',
        title: 'Hợp đồng & Lương minh bạch',
        text: 'Được trả đúng mức lương đã ký, được tính tiền làm thêm giờ (tăng ca) đầy đủ theo đúng luật lao động Nhật Bản.',
        color: '#3b82f6',
      },
      {
        icon: 'fas fa-heart-pulse',
        title: 'An toàn & Bảo hiểm y tế',
        text: 'Được trang bị đầy đủ đồ bảo hộ đạt chuẩn, khám sức khỏe định kỳ và bảo hiểm y tế chi trả 70% viện phí.',
        color: '#ef4444',
      },
      {
        icon: 'fas fa-id-card',
        title: 'Tự quản lý giấy tờ cá nhân',
        text: 'Bạn có quyền tự giữ hộ chiếu, thẻ ngoại kiều và thẻ ngân hàng. Nghiêm cấm bất kỳ ai thu giữ giấy tờ tùy thân!',
        color: '#10b981',
      },
      {
        icon: 'fas fa-handshake-angle',
        title: 'Quyền được hỗ trợ chuyển việc',
        text: 'Được quyền tìm kiếm môi trường làm việc mới nếu xí nghiệp gặp khó khăn giải thể hoặc có hành vi vi phạm.',
        color: '#f59e0b',
      },
    ],
    emergencyExamples: [
      'Bị nợ lương, chậm lương hoặc không trả tiền tăng ca',
      'Bị ép làm công việc nguy hiểm không đúng hợp đồng',
      'Bị giữ hộ chiếu, thẻ ngoại kiều hoặc hạn chế đi lại',
      'Bị đối xử bất công, xúc phạm hoặc bạo lực',
    ],
    viejapRole:
      'VieJap có đại diện thường trực tại Nhật Bản, luôn sẵn sàng lắng nghe, tư vấn và cùng bạn trao đổi với nghiệp đoàn / xí nghiệp tiếp nhận để bảo vệ quyền lợi chính đáng.',
    sources: [
      {
        label: 'Tư vấn miễn phí tiếng Việt - OTIT Nhật Bản',
        url: 'https://www.support.otit.go.jp/soudan/vi/',
      },
      {
        label: 'Đại sứ quán Việt Nam tại Tokyo',
        url: 'https://vnembassy-jp.org/',
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
      title: 'Giấy chứng nhận đăng ký doanh nghiệp',
      number: 'MSDN: 2100717764',
      issueDate: 'Đăng ký lần đầu: 07/07/2026',
      issuer: 'Sở Tài chính tỉnh Vĩnh Long',
      icon: 'fas fa-file-contract',
    },
    {
      title: 'Thông báo cơ quan thuế quản lý',
      number: 'Số: 27293/26',
      issueDate: 'Cơ quan quản lý: Thuế cơ sở 5 tỉnh Vĩnh Long',
      issuer: 'Phòng Phát triển doanh nghiệp và Kinh tế tập thể',
      icon: 'fas fa-file-invoice',
    },
  ];

  companyActivities: CompanyActivity[] = [
    {
      id: 'hoi-thao-ket-noi-thuong-mai-nhat-ban-viet-nam',
      category: 'Hoạt động đối ngoại',
      title: 'Hội thảo kết nối thương mại, đầu tư Việt Nam - Nhật Bản tại Tokyo',
      summary:
        'Đại diện VieJap có mặt tại chương trình kết nối thương mại, đầu tư Việt Nam - Nhật Bản tại Tokyo, lắng nghe thông tin chính sách và xu hướng hợp tác giữa doanh nghiệp hai nước. Đây là dấu ấn giúp phụ huynh và học viên thấy VieJap theo sát các hoạt động chính thống, không chỉ tư vấn trong văn phòng.',
      location: 'Tokyo, Nhật Bản',
      metric: '12/06',
      metricLabel: '2026',
      coverImage: {
        src: 'assets/images/HoatDong/HoiThaoKetNoiThuongMaiNhatBanVietNamTokyo/z8133501619094_4779c4fedee3319d35993e9d8245e39e.jpg',
        alt: 'Đại diện VieJap tại địa điểm hội thảo kết nối thương mại Việt Nam Nhật Bản ở Tokyo',
      },
      gallery: [
        {
          src: 'assets/images/HoatDong/HoiThaoKetNoiThuongMaiNhatBanVietNamTokyo/z8133501619094_4779c4fedee3319d35993e9d8245e39e.jpg',
          alt: 'Đại diện VieJap tại địa điểm hội thảo kết nối thương mại Việt Nam Nhật Bản ở Tokyo',
        },
        {
          src: 'assets/images/HoatDong/HoiThaoKetNoiThuongMaiNhatBanVietNamTokyo/z8133501563234_f1ada3713c353334bcfb450e7bc034dc.jpg',
          alt: 'Không gian hội thảo kết nối thương mại đầu tư Việt Nam Nhật Bản tại Tokyo',
        },
        {
          src: 'assets/images/HoatDong/HoiThaoKetNoiThuongMaiNhatBanVietNamTokyo/z8133501555441_850733ed873571cad929cd48bb4d926f.jpg',
          alt: 'Đại diện VieJap trong không gian hội thảo thương mại Việt Nam Nhật Bản',
        },
        {
          src: 'assets/images/HoatDong/HoiThaoKetNoiThuongMaiNhatBanVietNamTokyo/z8133501551421_1ca85205498f768989b213f438dddc47.jpg',
          alt: 'Phần trình bày tại hội thảo kết nối thương mại đầu tư Việt Nam Nhật Bản',
        },
      ],
      highlights: [
        'Ghi nhận thông tin từ chương trình có sự hiện diện của các cơ quan Việt Nam tại Nhật Bản',
        'Theo dõi nhu cầu kết nối doanh nghiệp và nguồn nhân lực giữa hai thị trường',
        'Bổ sung góc nhìn thực tế để tư vấn lộ trình Nhật Bản có căn cứ hơn',
      ],
    },
    {
      id: 'ket-noi-van-hoa-nhat-ban',
      category: 'Kết nối văn hóa',
      title: 'Kết nối văn hóa Nhật Bản cùng cộng đồng quốc tế',
      summary:
        'Những khoảnh khắc từ chương trình giao lưu văn hóa giúp học viên thấy tiếng Nhật không chỉ là bài học trên lớp, mà còn là cách tham gia cộng đồng, hiểu nghi thức và xây dựng tác phong khi sống tại Nhật.',
      location: 'Nhật Bản',
      metric: 'Giao lưu',
      metricLabel: 'văn hóa',
      coverImage: {
        src: 'assets/images/HoatDong/KetnoiVanHoaNHATBAN/z8133500635420_40b1f4a1ea06ef1d59b6659954ed3209.jpg',
        alt: 'Không gian chương trình kết nối văn hóa Nhật Bản với đông đảo khách tham dự',
      },
      gallery: [
        {
          src: 'assets/images/HoatDong/KetnoiVanHoaNHATBAN/z8133500635420_40b1f4a1ea06ef1d59b6659954ed3209.jpg',
          alt: 'Không gian chương trình kết nối văn hóa Nhật Bản với đông đảo khách tham dự',
        },
        {
          src: 'assets/images/HoatDong/KetnoiVanHoaNHATBAN/z8133499906629_819c6a8040435c62a85fcec08c21ab9d.jpg',
          alt: 'Đại diện các nước chụp ảnh trong chương trình giao lưu văn hóa Nhật Bản',
        },
        {
          src: 'assets/images/HoatDong/KetnoiVanHoaNHATBAN/z8133501021884_273e0ef8e1cabf2fe2ea72ff6614cee5.jpg',
          alt: 'Khoảnh khắc trao chứng nhận trong chương trình kết nối văn hóa Nhật Bản',
        },
        {
          src: 'assets/images/HoatDong/KetnoiVanHoaNHATBAN/z8133500170124_f1204241d27bc43f961d4146ef533e37.jpg',
          alt: 'Khách mời và đại diện tham dự chương trình kết nối văn hóa Nhật Bản',
        },
        {
          src: 'assets/images/HoatDong/KetnoiVanHoaNHATBAN/z8133500233287_a7bdb8c0f6696f8f282b09c602f161d8.jpg',
          alt: 'Đại biểu trao đổi tại chương trình kết nối văn hóa Nhật Bản',
        },
        {
          src: 'assets/images/HoatDong/KetnoiVanHoaNHATBAN/z8133500449127_007e344bdfb7816c69af7440a303317d.jpg',
          alt: 'Không khí giao lưu trong chương trình kết nối văn hóa Nhật Bản',
        },
      ],
      highlights: [
        'Đưa câu chuyện văn hóa vào quá trình chuẩn bị cho học viên',
        'Giúp học viên hiểu thêm môi trường giao tiếp đa quốc gia tại Nhật',
        'Tạo thêm chất liệu thực tế cho các buổi định hướng trước khi đi',
      ],
    },
    {
      id: 'le-hoi-tanabata-hoc-vien-viejap',
      category: 'Sinh hoạt học viên',
      title: 'Lễ hội Tanabata cùng học viên VieJap tại Trà Vinh',
      summary:
        'Học viên cùng viết điều ước bằng tiếng Nhật, trang trí nhánh trúc và lưu lại những khoảnh khắc sinh hoạt tập thể. Hoạt động nhỏ nhưng giúp các bạn quen văn hóa Nhật Bản trong môi trường gần gũi trước khi đi xa.',
      location: 'Trà Vinh',
      metric: 'Tanabata',
      metricLabel: 'văn hóa Nhật',
      coverImage: {
        src: 'assets/images/HoatDong/LeHoiTanabata-HOCVIENVIEJAPTAITRAVINH/z8133505656699_7c20f3b8ec5dcbb3717ec769adbee73d.jpg',
        alt: 'Học viên VieJap chụp ảnh cùng cây điều ước trong lễ hội Tanabata tại Trà Vinh',
      },
      gallery: [
        {
          src: 'assets/images/HoatDong/LeHoiTanabata-HOCVIENVIEJAPTAITRAVINH/z8133505656699_7c20f3b8ec5dcbb3717ec769adbee73d.jpg',
          alt: 'Học viên VieJap chụp ảnh cùng cây điều ước trong lễ hội Tanabata tại Trà Vinh',
        },
        {
          src: 'assets/images/HoatDong/LeHoiTanabata-HOCVIENVIEJAPTAITRAVINH/z8133505771132_b5be6c6d2663afaf535641f276fabcf0.jpg',
          alt: 'Học viên VieJap treo điều ước Tanabata bằng tiếng Nhật',
        },
        {
          src: 'assets/images/HoatDong/LeHoiTanabata-HOCVIENVIEJAPTAITRAVINH/z8133505738737_35ea9520f527116503dfbd356352a239.jpg',
          alt: 'Các thẻ điều ước Tanabata được học viên VieJap viết bằng tiếng Nhật',
        },
        {
          src: 'assets/images/HoatDong/LeHoiTanabata-HOCVIENVIEJAPTAITRAVINH/z8133505695509_5d85fc6c09e336a1c80fdd2c6a07e6c6.jpg',
          alt: 'Không khí chuẩn bị lễ hội Tanabata tại VieJap',
        },
        {
          src: 'assets/images/HoatDong/LeHoiTanabata-HOCVIENVIEJAPTAITRAVINH/z8133505742124_541edb51ddb2aff6522548d0843c93ef.jpg',
          alt: 'Học viên VieJap sinh hoạt trong chương trình Tanabata',
        },
        {
          src: 'assets/images/HoatDong/LeHoiTanabata-HOCVIENVIEJAPTAITRAVINH/z8133505764864_db83bbc2642141fe4c7d80ddc5c9be51.jpg',
          alt: 'Học viên VieJap hoàn thiện trang trí điều ước Tanabata',
        },
      ],
      highlights: [
        'Rèn sự tự tin khi sử dụng tiếng Nhật qua hoạt động văn hóa',
        'Tạo cảm giác gắn kết giữa học viên và đội ngũ phụ trách',
        'Giúp phụ huynh nhìn thấy môi trường học tập gần gũi, có sinh hoạt thật',
      ],
    },
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

  readonly featuredActivity =
    this.companyActivities.find(
      (activity) => activity.id === 'hoi-thao-ket-noi-thuong-mai-nhat-ban-viet-nam',
    ) ?? this.companyActivities[0];

  readonly orderedCompanyActivities = [
    'trung-thu-cho-em',
    'hoi-thao-ket-noi-thuong-mai-nhat-ban-viet-nam',
    'ket-noi-van-hoa-nhat-ban',
    'le-hoi-tanabata-hoc-vien-viejap',
    'huong-nghiep-soc-trang',
  ]
    .map((activityId) => this.companyActivities.find((activity) => activity.id === activityId))
    .filter((activity): activity is CompanyActivity => Boolean(activity));

  selectedActivity = this.orderedCompanyActivities[0] ?? this.companyActivities[0];
  selectedActivityImage = this.selectedActivity.coverImage;

  selectCompanyActivity(activity: CompanyActivity): void {
    this.selectedActivity = activity;
    this.selectedActivityImage = activity.coverImage;
  }

  selectActivityImage(image: ActivityImage): void {
    this.selectedActivityImage = image;
  }
}
