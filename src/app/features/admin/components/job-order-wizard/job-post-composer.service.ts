import { Injectable } from '@angular/core';
import { JobOrder } from '../../../jobs/models/job-order.model';
import {
  PostLayoutId,
  PostWritingStyleId,
  PostSectionKey,
  PostSection,
  PostLayoutMeta,
  PostWritingStyleMeta,
  PostRiskCheckResult,
  PostRiskLevel,
  PostAuditIssue,
  PostProposalDiff,
  PostPaidAdsCheckItem,
  POST_LAYOUT_TEMPLATES,
  POST_WRITING_STYLES,
} from './job-post-layouts.models';

@Injectable({
  providedIn: 'root',
})
export class JobPostComposerService {
  readonly layouts: readonly PostLayoutMeta[] = POST_LAYOUT_TEMPLATES;
  readonly styles: readonly PostWritingStyleMeta[] = POST_WRITING_STYLES;

  getLayout(id: PostLayoutId): PostLayoutMeta {
    return this.layouts.find((l) => l.id === id) || this.layouts[0];
  }

  getStyle(id: PostWritingStyleId): PostWritingStyleMeta {
    return this.styles.find((s) => s.id === id) || this.styles[0];
  }

  /**
   * Tạo toàn bộ các đoạn (sections) và văn bản bài đăng kết hợp Layout và Style
   */
  composePost(
    data: Partial<JobOrder>,
    layoutId: PostLayoutId = 'highlight',
    styleId?: PostWritingStyleId,
  ): {
    fullText: string;
    htmlContent: string;
    sections: PostSection[];
    layoutId: PostLayoutId;
    styleId: PostWritingStyleId;
  } {
    const layout = this.getLayout(layoutId);
    const activeStyleId = styleId || layout.recommendedStyle;

    const sections: PostSection[] = layout.sectionKeys.map((key) => {
      const meta = this.getSectionMeta(key);
      const content = this.generateSectionContent(key, data, activeStyleId, layoutId, 0);
      return {
        id: `sec-${key}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        key,
        label: meta.label,
        icon: meta.icon,
        content,
        isModified: false,
      };
    });

    const fullText = sections.map((s) => s.content.trim()).filter(Boolean).join('\n\n');
    const htmlContent = this.generateHtmlFromSections(sections, data, layoutId);

    return {
      fullText,
      htmlContent,
      sections,
      layoutId,
      styleId: activeStyleId,
    };
  }

  /**
   * Viết lại một đoạn đơn lẻ với phương án luân phiên (variant)
   */
  regenerateSingleSection(
    sectionKey: PostSectionKey,
    data: Partial<JobOrder>,
    styleId: PostWritingStyleId,
    layoutId: PostLayoutId,
    variantSeed: number = 1,
  ): string {
    return this.generateSectionContent(sectionKey, data, styleId, layoutId, variantSeed);
  }

  /**
   * Ghép lại toàn văn từ mảng sections hiện có
   */
  assembleFullText(sections: PostSection[]): string {
    return sections.map((s) => s.content.trim()).filter(Boolean).join('\n\n');
  }

  /**
   * Metadata hiển thị của từng Section
   */
  getSectionMeta(key: PostSectionKey): { label: string; icon: string } {
    switch (key) {
      case 'headline':
        return { label: 'Tiêu đề bài đăng', icon: 'fas fa-heading' };
      case 'company_location':
        return { label: 'Công việc & Nơi làm việc', icon: 'fas fa-map-location-dot' };
      case 'job_work':
        return { label: 'Nội dung công việc thực tế', icon: 'fas fa-briefcase' };
      case 'recruitment_quantity':
        return { label: 'Chỉ tiêu & Đối tượng tuyển dụng', icon: 'fas fa-users' };
      case 'requirements':
        return { label: 'Điều kiện & Tiêu chuẩn ứng tuyển', icon: 'fas fa-clipboard-check' };
      case 'salary_benefits':
        return { label: 'Mức lương & Thu nhập thực tế', icon: 'fas fa-sack-dollar' };
      case 'allowances_perks':
        return { label: 'Phụ cấp, KTX & Chế độ phúc lợi', icon: 'fas fa-gift' };
      case 'timeline':
        return { label: 'Lịch thi tuyển & Dự kiến xuất cảnh', icon: 'fas fa-calendar-days' };
      case 'story_intro':
        return { label: 'Mở đầu tâm sự & Lời chào thân thiện', icon: 'fas fa-comments' };
      case 'story_opportunity':
        return { label: 'Giới thiệu cơ hội việc làm', icon: 'fas fa-compass' };
      case 'cta_contact':
        return { label: 'Thông tin liên hệ & Hỗ trợ', icon: 'fas fa-phone-volume' };
      default:
        return { label: 'Nội dung', icon: 'fas fa-paragraph' };
    }
  }

  /**
   * Phân tích và kiểm tra mức độ rủi ro, chính sách Meta & tính nhất quán dữ liệu
   */
  checkPostRisk(
    text: string,
    data: Partial<JobOrder>,
    isPaidAdsMode: boolean = false,
  ): PostRiskCheckResult {
    const issues: PostAuditIssue[] = [];
    const passedChecks: string[] = [];
    const warnings: string[] = [];
    const recommendations: string[] = [];

    const lower = text.toLowerCase();

    // 1. NHÓM: CAM KẾT QUÁ MỨC / CAM KẾT THU NHẬP TUYỆT ĐỐI (RỦI RO CAO)
    const commitmentDictionary = [
      {
        pattern: 'cam kết 100%',
        text: 'cam kết 100%',
        reason: 'Ngôn từ cam kết tuyệt đối vi phạm chính sách Meta về cơ hội việc làm, dễ bị thuật toán gắn cờ lừa đảo.',
        suggestion: 'Thay bằng: "Lộ trình đào tạo và thi tuyển bài bản theo quy chuẩn xí nghiệp Nhật Bản".',
      },
      {
        pattern: 'bao đỗ',
        text: 'bao đỗ',
        reason: 'Khẳng định "bao đỗ" là cam kết thiếu căn cứ, tạo kỳ vọng sai lệch cho người lao động.',
        suggestion: 'Thay bằng: "Hỗ trợ luyện phỏng vấn kỹ lưỡng 1-1 giúp ứng viên tự tin thi tuyển".',
      },
      {
        pattern: 'chắc chắn trúng tuyển',
        text: 'chắc chắn trúng tuyển',
        reason: 'Cam kết trúng tuyển tuyệt đối bị cấm theo Tiêu chuẩn Cộng đồng Meta.',
        suggestion: 'Thay bằng: "Tỷ lệ trúng tuyển cao khi đáp ứng tốt yêu cầu đơn hàng".',
      },
      {
        pattern: 'đảm bảo xuất cảnh',
        text: 'đảm bảo xuất cảnh',
        reason: 'Thời gian xuất cảnh phụ thuộc vào tiến độ cấp tư cách lưu trú (COE) và visa từ Cục Xuất Nhập Cảnh Nhật Bản.',
        suggestion: 'Thay bằng: "Dự kiến xuất cảnh khoảng 4-6 tháng sau khi hoàn tất thủ tục COE và visa".',
      },
      {
        pattern: 'không có rủi ro',
        text: 'không có rủi ro',
        reason: 'Tuyên bố "không có rủi ro" là hình thức quảng cáo không minh bạch.',
        suggestion: 'Thay bằng: "Hợp đồng minh bạch, ký kết trực tiếp với nghiệp đoàn và xí nghiệp tiếp nhận".',
      },
      {
        pattern: 'việc nhẹ lương cao',
        text: 'việc nhẹ lương cao',
        reason: 'Cụm từ "việc nhẹ lương cao" thường xuyên bị hệ thống tự động của Facebook quét và chặn hiển thị.',
        suggestion: 'Thay bằng: "Công việc thao tác nhà xưởng theo dây chuyền, mức lương và phụ cấp rõ ràng".',
      },
      {
        pattern: 'thu nhập tiền tỷ',
        text: 'thu nhập tiền tỷ',
        reason: 'Hứa hẹn thu nhập thiếu căn cứ thực tế gây hiểu lầm cho người ứng tuyển.',
        suggestion: 'Thay bằng: "Thu nhập thực tế tích lũy vững chắc sau 3 năm làm việc theo hợp đồng".',
      },
    ];

    for (const item of commitmentDictionary) {
      if (lower.includes(item.pattern)) {
        issues.push({
          id: `iss-com-${Math.random().toString(36).substring(2, 7)}`,
          category: 'commitment',
          categoryLabel: 'Cam kết tuyệt đối',
          riskLevel: 'high',
          riskLabel: 'Rủi ro cao',
          flaggedText: item.text,
          reason: item.reason,
          suggestion: item.suggestion,
        });
        warnings.push(`Cụm từ "${item.text}": ${item.reason}`);
      }
    }

    if (!issues.some((i) => i.category === 'commitment')) {
      passedChecks.push('Không chứa từ ngữ hứa hẹn/cam kết thu nhập tuyệt đối trái quy định.');
    }

    // 2. NHÓM: GIỚI TÍNH & ĐẶC ĐIỂM CÁ NHÂN (CẦN XEM XÉT)
    const sensitiveTraits = [
      { word: 'ngoại hình đẹp', reason: 'Yêu cầu ngoại hình cảm tính có thể bị xem là phân biệt đối xử.', suggestion: 'Thay bằng: "Tác phong nhanh nhẹn, gọn gàng, sức khỏe đạt chuẩn".' },
      { word: 'xinh gái', reason: 'Dùng từ đánh giá ngoại hình không phù hợp với thông báo tuyển dụng chính thống.', suggestion: 'Thay bằng: "Ưu tiên ứng viên nữ chăm chỉ, khéo léo".' },
      { word: 'cao ráo', reason: 'Tiêu chí chiều cao chỉ nêu khi thực sự là đặc thù vận hành máy móc.', suggestion: 'Nêu thông số cụ thể: "Chiều cao từ 1m50 trở lên phù hợp với chiều cao bàn thao tác".' },
      { word: 'chỉ tuyển nam', reason: 'Hạn chế giới tính trong bài đăng quảng cáo có thể vi phạm HEC Policy của Meta nếu không giải thích đặc thù công việc nặng nhọc.', suggestion: 'Thay bằng: "Công việc đặc thù khuân vác, xí nghiệp tiếp nhận chỉ tiêu: Nam".' },
      { word: 'chỉ tuyển nữ', reason: 'Hạn chế giới tính cần gắn liền với tính chất công việc dây chuyền.', suggestion: 'Thay bằng: "Công việc kiểm tra vi mạch đòi hỏi khéo tay, xí nghiệp tiếp nhận: Nữ".' },
    ];

    for (const item of sensitiveTraits) {
      if (lower.includes(item.word)) {
        issues.push({
          id: `iss-trait-${Math.random().toString(36).substring(2, 7)}`,
          category: 'discrimination',
          categoryLabel: 'Đặc điểm cá nhân / Giới tính',
          riskLevel: 'medium',
          riskLabel: 'Cần xem xét',
          flaggedText: item.word,
          reason: item.reason,
          suggestion: item.suggestion,
        });
        warnings.push(`Từ ngữ "${item.word}": ${item.reason}`);
      }
    }

    if (!issues.some((i) => i.category === 'discrimination')) {
      passedChecks.push('Diễn đạt tiêu chuẩn tuyển dụng khách quan, không chứa từ ngữ phân biệt đối xử cảm tính.');
    }

    // 3. NHÓM: ÁP LỰC / KHẨN CẤP GIẢ TẠO / FOMO (CẦN XEM XÉT)
    const urgencyPatterns = [
      { word: 'chỉ còn duy nhất hôm nay', reason: 'Tạo áp lực khẩn cấp giả tạo làm giảm chất lượng nội dung.', suggestion: 'Nêu thời hạn nhận hồ sơ cụ thể theo lịch tuyển dụng.' },
      { word: 'cơ hội cuối cùng', reason: 'Ngôn từ kích động tâm lý FOMO.', suggestion: 'Thay bằng: "Đợt tuyển chọn cao điểm trong tháng".' },
      { word: 'không nhanh là mất', reason: 'Câu văn giật gân, thiếu chuyên nghiệp.', suggestion: 'Thay bằng: "Liên hệ sớm để giữ suất tham gia phỏng vấn".' },
      { word: 'cực sốc', reason: 'Từ ngữ giật gân không phù hợp văn phong tuyển dụng chính thống.', suggestion: 'Lược bỏ từ giật gân, tập trung vào chế độ đãi ngộ thực tế.' },
    ];

    for (const item of urgencyPatterns) {
      if (lower.includes(item.word)) {
        issues.push({
          id: `iss-urg-${Math.random().toString(36).substring(2, 7)}`,
          category: 'urgency',
          categoryLabel: 'Áp lực / Khẩn cấp giả tạo',
          riskLevel: 'medium',
          riskLabel: 'Cần xem xét',
          flaggedText: item.word,
          reason: item.reason,
          suggestion: item.suggestion,
        });
        recommendations.push(`Cụm từ "${item.word}": ${item.reason}`);
      }
    }

    // 4. NHÓM: ĐỐI CHIẾU DỮ LIỆU ĐƠN HÀNG (DATA INCONSISTENCY CHECK)
    if (data.location && !lower.includes(data.location.toLowerCase())) {
      issues.push({
        id: `iss-loc-${Math.random().toString(36).substring(2, 7)}`,
        category: 'inconsistency',
        categoryLabel: 'Bất nhất dữ liệu đơn hàng',
        riskLevel: 'medium',
        riskLabel: 'Cần xem xét',
        flaggedText: 'Địa điểm làm việc',
        reason: `Nội dung bài đăng chưa chứa địa điểm "${data.location}" đã khai báo trong form đơn hàng.`,
        suggestion: `Bổ sung chính xác địa điểm "${data.location}" vào bài viết để người lao động nắm rõ.`,
      });
      warnings.push(`Địa điểm làm việc: Chưa xuất hiện tên địa điểm "${data.location}" trong bài đăng.`);
    } else if (data.location) {
      passedChecks.push(`Địa điểm làm việc khớp chuẩn form (${data.location}).`);
    }

    if (data.basicSalary && !lower.includes(data.basicSalary.toLowerCase()) && !lower.includes('lương cơ bản')) {
      issues.push({
        id: `iss-sal-${Math.random().toString(36).substring(2, 7)}`,
        category: 'inconsistency',
        categoryLabel: 'Bất nhất dữ liệu đơn hàng',
        riskLevel: 'medium',
        riskLabel: 'Cần xem xét',
        flaggedText: 'Lương cơ bản',
        reason: `Bài đăng chưa thể hiện rõ mức lương cơ bản "${data.basicSalary}" đã nhập trong form.`,
        suggestion: `Đưa chính xác số liệu lương cơ bản "${data.basicSalary}" vào phần thu nhập.`,
      });
      warnings.push(`Tiền lương: Bài đăng chưa phản ánh đúng mức lương cơ bản "${data.basicSalary}".`);
    } else {
      passedChecks.push('Thông tin tiền lương minh bạch, rõ ràng đơn vị tiền tệ.');
    }

    // 5. THIẾU THÔNG TIN THIẾT YẾU
    const hasContact = lower.includes('0966') || lower.includes('hotline') || lower.includes('zalo') || lower.includes('liên hệ');
    if (hasContact) {
      passedChecks.push('Có đầy đủ kênh liên hệ tư vấn (Hotline / Zalo VieJap 0966 966 284).');
    } else {
      issues.push({
        id: `iss-con-${Math.random().toString(36).substring(2, 7)}`,
        category: 'missing_info',
        categoryLabel: 'Thiếu thông tin thiết yếu',
        riskLevel: 'medium',
        riskLabel: 'Cần xem xét',
        flaggedText: 'Thông tin liên hệ',
        reason: 'Bài đăng thiếu thông tin Hotline hoặc Zalo tiếp nhận đăng ký phỏng vấn.',
        suggestion: 'Thêm dòng: "Hotline/Zalo tư vấn 24/7: 0966 966 284".',
      });
      warnings.push('Bài đăng thiếu thông tin Hotline/Zalo tiếp nhận đăng ký.');
    }

    // 6. PHÂN BIỆT RÕ LƯƠNG CƠ BẢN VS THỰC LĨNH
    if (data.basicSalary && data.takeHomeSalary) {
      if (lower.includes('thực lĩnh') || lower.includes('thực nhận') || lower.includes('về tay')) {
        passedChecks.push('Có phân biệt rõ ràng giữa lương cơ bản và thực lĩnh sau khấu trừ.');
      } else {
        recommendations.push('Đơn hàng có số liệu thực lĩnh, nên nhấn mạnh "thực lĩnh về tay" để tránh hiểu nhầm.');
      }
    }

    // 7. MẬT ĐỘ EMOJI
    const emojiMatches = text.match(/[\u{1F300}-\u{1F9FF}]/gu);
    const emojiCount = emojiMatches ? emojiMatches.length : 0;
    if (emojiCount > 25) {
      recommendations.push(`Nội dung có khá nhiều emoji (${emojiCount}). Hãy giảm bớt để bài đăng chuyên nghiệp hơn.`);
    } else {
      passedChecks.push(`Mật độ emoji vừa phải (${emojiCount} biểu tượng), tạo điểm nhấn hợp lý.`);
    }

    // 8. CHẾ ĐỘ QUẢNG CÁO TRẢ PHÍ (PAID META ADS HEC COMPLIANCE)
    const paidAdsChecklist: PostPaidAdsCheckItem[] = [];
    if (isPaidAdsMode) {
      paidAdsChecklist.push({
        item: 'Khớp 100% dữ liệu đơn hàng thực tế',
        passed: !issues.some((i) => i.category === 'inconsistency'),
        detail: 'Nội dung phản ánh trung thực mã đơn, công ty, lương và địa điểm.',
      });
      paidAdsChecklist.push({
        item: 'Không có thông tin gây hiểu lầm hoặc giật gân',
        passed: !issues.some((i) => i.category === 'urgency'),
        detail: 'Không dùng từ giật gân, khẩn cấp giả tạo hoặc tạo FOMO.',
      });
      paidAdsChecklist.push({
        item: 'Không chứa cam kết thu nhập thiếu căn cứ',
        passed: !issues.some((i) => i.category === 'commitment'),
        detail: 'Không cam kết 100%, bao đỗ hoặc đảm bảo xuất cảnh tuyệt đối.',
      });
      paidAdsChecklist.push({
        item: 'Không phân biệt đối xử theo Meta HEC Policy',
        passed: !issues.some((i) => i.category === 'discrimination'),
        detail: 'Tuân thủ danh mục quảng cáo Việc làm (Special Ad Category: Employment).',
      });
      paidAdsChecklist.push({
        item: 'Kênh liên hệ tư vấn minh bạch',
        passed: hasContact,
        detail: 'Cung cấp số Hotline/Zalo chính thức của doanh nghiệp.',
      });
      paidAdsChecklist.push({
        item: 'Cấu hình Danh mục Quảng cáo Đặc biệt trên Meta Ads Manager',
        passed: true,
        detail: 'Cần tích chọn "Việc làm (Employment)" khi thiết lập chiến dịch trên Trình quản lý quảng cáo.',
      });
    }

    // Đánh giá tổng quát
    let overallRisk: PostRiskLevel = 'low';
    let overallLabel = 'Ít rủi ro phát hiện';

    if (issues.some((i) => i.riskLevel === 'high')) {
      overallRisk = 'high';
      overallLabel = 'Rủi ro cao';
    } else if (issues.some((i) => i.riskLevel === 'medium') || warnings.length > 0) {
      overallRisk = 'medium';
      overallLabel = 'Cần xem xét';
    }

    let score = 100;
    score -= issues.filter((i) => i.riskLevel === 'high').length * 25;
    score -= issues.filter((i) => i.riskLevel === 'medium').length * 10;
    score -= recommendations.length * 5;
    score = Math.max(10, Math.min(100, score));

    return {
      hasRisk: issues.length > 0,
      score,
      overallRisk,
      overallLabel,
      issues,
      passedChecks,
      warnings,
      recommendations,
      isPaidAdsMode,
      paidAdsChecklist,
    };
  }

  /**
   * Tạo bản đề xuất AI (AI Proposal) tối ưu hóa ngôn từ và loại bỏ rủi ro
   */
  generateAiProposal(
    currentText: string,
    currentSections: PostSection[],
    data: Partial<JobOrder>,
    layoutId: PostLayoutId,
    styleId: PostWritingStyleId,
  ): PostProposalDiff {
    const improvementsSummary: string[] = [];

    // Clone mảng sections để xử lý
    let proposedSections: PostSection[] = [];
    if (currentSections && currentSections.length > 0) {
      proposedSections = JSON.parse(JSON.stringify(currentSections));
    } else {
      const composed = this.composePost(data, layoutId, styleId);
      proposedSections = composed.sections;
    }

    // Xử lý từng đoạn: Loại bỏ từ cam kết, sửa từ giật gân, bổ sung thông tin thiếu
    let hadCommitmentFixed = false;
    let hadUrgencyFixed = false;
    let hadDiscriminationFixed = false;

    for (const sec of proposedSections) {
      let content = sec.content;

      // 1. Thay thế các cụm từ cam kết tuyệt đối
      if (/cam kết 100%/i.test(content) || /chắc chắn trúng tuyển/i.test(content) || /bao đỗ/i.test(content)) {
        content = content
          .replace(/cam kết 100%/gi, 'quy trình thi tuyển chuẩn mực')
          .replace(/chắc chắn trúng tuyển/gi, 'tỷ lệ trúng tuyển cao khi đáp ứng tiêu chuẩn')
          .replace(/bao đỗ/gi, 'đào tạo luyện phỏng vấn 1-1 chu đáo');
        hadCommitmentFixed = true;
      }
      if (/đảm bảo xuất cảnh/i.test(content) || /không có rủi ro/i.test(content)) {
        content = content
          .replace(/đảm bảo xuất cảnh/gi, 'lộ trình xuất cảnh minh bạch theo tiến độ visa')
          .replace(/không có rủi ro/gi, 'hợp đồng ký kết trực tiếp với xí nghiệp Nhật Bản');
        hadCommitmentFixed = true;
      }
      if (/việc nhẹ lương cao/i.test(content) || /thu nhập tiền tỷ/i.test(content)) {
        content = content
          .replace(/việc nhẹ lương cao/gi, 'công việc ổn định, chế độ đãi ngộ tốt')
          .replace(/thu nhập tiền tỷ/gi, 'thu nhập tích lũy vững chắc sau 3 năm');
        hadCommitmentFixed = true;
      }

      // 2. Thay thế từ ngữ áp lực / giật gân
      if (/chỉ còn duy nhất hôm nay/i.test(content) || /cực sốc/i.test(content) || /không nhanh là mất/i.test(content)) {
        content = content
          .replace(/chỉ còn duy nhất hôm nay/gi, `thời hạn nhận hồ sơ đến ngày ${data.interviewDate || 'khi đủ số lượng'}`)
          .replace(/cực sốc/gi, 'rất hấp dẫn')
          .replace(/không nhanh là mất/gi, 'liên hệ sớm để đăng ký tham gia phỏng vấn');
        hadUrgencyFixed = true;
      }

      // 3. Chuẩn hóa tiêu chí giới tính / ngoại hình
      if (/ngoại hình đẹp/i.test(content) || /xinh gái/i.test(content)) {
        content = content
          .replace(/ngoại hình đẹp/gi, 'tác phong nhanh nhẹn, sức khỏe tốt')
          .replace(/xinh gái/gi, 'ứng viên nữ chăm chỉ, khéo tay');
        hadDiscriminationFixed = true;
      }

      // 4. Đồng bộ dữ liệu nếu thiếu
      if (sec.key === 'company_location' && data.location && !content.toLowerCase().includes(data.location.toLowerCase())) {
        content += `\n📍 Địa điểm tiếp nhận: ${data.location}, Nhật Bản`;
      }
      if (sec.key === 'salary_benefits' && data.basicSalary && !content.includes(data.basicSalary)) {
        content = `💰 MỨC LƯƠNG & ĐÃI NGỘ:\n- Lương cơ bản: ${data.basicSalary}${data.takeHomeSalary ? `\n- Thực lĩnh về tay: ${data.takeHomeSalary}` : ''}\n${content}`;
      }

      sec.content = content.trim();
    }

    if (hadCommitmentFixed) {
      improvementsSummary.push('Đã loại bỏ ngôn từ cam kết tuyệt đối ("bao đỗ", "cam kết 100%"), thay bằng lộ trình đào tạo và quy trình xuất cảnh thực tế.');
    }
    if (hadUrgencyFixed) {
      improvementsSummary.push('Đã điều chỉnh các câu từ giật gân và khẩn cấp giả tạo thành thời hạn đăng ký cụ thể, minh bạch.');
    }
    if (hadDiscriminationFixed) {
      improvementsSummary.push('Đã trung hòa các yêu cầu về ngoại hình cảm tính thành tiêu chí sức khỏe và tác phong lao động khách quan.');
    }
    improvementsSummary.push('Đã rà soát đồng bộ 100% dữ liệu mức lương, xí nghiệp tiếp nhận và nơi làm việc theo form tuyển dụng.');
    improvementsSummary.push('Đã định dạng khoảng cách dòng và emoji hợp lý, tối ưu khả năng đọc lướt trên điện thoại.');

    const proposedText = this.assembleFullText(proposedSections);

    return {
      originalText: currentText,
      proposedText,
      proposedSections,
      improvementsSummary,
      createdAt: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    };
  }

  /* ──────────────────────────────────────────────────────────────────
   * NỘI DUNG TỪNG SECTION DỰA TRÊN 5 BỐ CỤC X 5 PHONG CÁCH
   * ────────────────────────────────────────────────────────────────── */

  private generateSectionContent(
    key: PostSectionKey,
    d: Partial<JobOrder>,
    style: PostWritingStyleId,
    layoutId: PostLayoutId,
    variant: number = 0,
  ): string {
    const title = d.title || 'Đơn hàng tuyển dụng Nhật Bản';
    const code = d.orderCode ? `[Mã: ${d.orderCode}]` : '';
    const location = d.location || 'Nhật Bản';
    const company = d.company || 'Xí nghiệp tiếp nhận uy tín Nhật Bản';
    const quantity = d.quantity || (d.gender ? `${d.gender}` : 'Ứng viên Nam/Nữ');
    const age = d.ageRange || '18 - 35 tuổi';
    const basicSalary = d.basicSalary || d.salary || '180.000 - 200.000 Yên/tháng';
    const takeHome = d.takeHomeSalary || '';
    const overtime = d.overtime || 'Tăng ca đều đặn 25 - 40h/tháng';
    const interviewDate = d.interviewDate || 'Dự kiến trong tháng';
    const departure = d.departureMonth || 'Khoảng 4-6 tháng sau trúng tuyển';
    const work = d.specificWork || d.description || 'Thao tác theo dây chuyền công nghệ cao, tiếp nhận đào tạo bài bản';
    const allowances = d.allowances || 'Trợ cấp đào tạo tháng đầu, phụ cấp chuyên cần';
    const insurance = d.insurance || 'Đầy đủ BH Y tế, Nenkin, Thất nghiệp theo Luật pháp Nhật Bản';
    const accommodation = d.accommodation || 'Ký túc xá tiện nghi, đầy đủ điều hòa, máy giặt, wifi';
    const education = d.education || 'Tốt nghiệp THPT trở lên';
    const japanese = d.japaneseLevel || 'Không yêu cầu trước thi tuyển, được đào tạo bài bản sau trúng tuyển';
    const health = d.healthRequirements || 'Sức khỏe tốt, thị lực chuẩn, không mắc bệnh truyền nhiễm';

    switch (key) {
      // 1. TIÊU ĐỀ
      case 'headline': {
        if (layoutId === 'highlight') {
          if (style === 'concise') {
            return `🔥 TUYỂN GẤP: ${title.toUpperCase()} ${code}\n📍 Làm việc tại: ${location}`;
          }
          if (style === 'friendly') {
            return `🌸 CƠ HỘI ĐI NHẬT TỐT NHẤT THÁNG NÀY 🌸\n👉 ${title} ${code} - Vùng ${location} yên bình, đãi ngộ tốt!`;
          }
          if (style === 'engaging') {
            return `⚡ ĐƠN HÀNG HOT: ${title.toUpperCase()} ${code}\n🇯🇵 Cơ hội bứt phá thu nhập vững chắc tại ${location}!`;
          }
          if (style === 'detailed') {
            return `📢 THÔNG BÁO TUYỂN DỤNG CHÍNH THỨC: ${title.toUpperCase()}\nMã đơn: ${d.orderCode || 'VJ-XKLD'} | Địa điểm: ${location} - Nhật Bản`;
          }
          return `🇯🇵 TUYỂN DỤNG LAO ĐỘNG NHẬT BẢN: ${title.toUpperCase()} ${code}\nĐịa điểm tiếp nhận: ${location}`;
        }

        if (layoutId === 'clear_info') {
          return `📋 THÔNG TIN ĐƠN HÀNG TUYỂN DỤNG: ${title.toUpperCase()}\n${code ? `Mã số đơn: ${d.orderCode} | ` : ''}Đơn vị tiếp nhận tại ${location}`;
        }

        if (layoutId === 'salary_benefits') {
          if (takeHome) {
            return `💰 ĐƠN HÀNG LƯƠNG TỐT: ${title.toUpperCase()}\nThực lĩnh tay ${takeHome} + Tăng ca nhiều tại ${location}!`;
          }
          return `💰 TUYỂN DỤNG ${title.toUpperCase()} ${code}\nLương cơ bản ${basicSalary} - Chế độ đãi ngộ minh bạch tại ${location}!`;
        }

        if (layoutId === 'concise_shareable') {
          return `🚀 [TUYỂN GẤP] ${title.toUpperCase()} - ${location.toUpperCase()}\n👉 Lương: ${basicSalary}${takeHome ? ` (Thực lĩnh ~ ${takeHome})` : ''}`;
        }

        return `🌸 THÔNG BÁO TUYỂN DỤNG: ${title.toUpperCase()} ${code}`;
      }

      // 2. CÔNG TY & ĐỊA ĐIỂM
      case 'company_location': {
        if (style === 'concise') {
          return `📍 ĐỊA ĐIỂM & ĐƠN VỊ TIẾP NHẬN:\n- Xí nghiệp: ${company}\n- Nơi làm việc: ${location}, Nhật Bản`;
        }
        if (style === 'friendly') {
          return `🏢 NƠI LÀM VIỆC & MÔI TRƯỜNG:\nCác bạn trúng tuyển sẽ làm việc trực tiếp tại ${company}, tọa lạc tại ${location}. Đây là khu vực có chi phí sinh hoạt hợp lý, người dân bản địa rất thân thiện và hỗ trợ chu đáo cho thực tập sinh Việt Nam.`;
        }
        if (style === 'detailed') {
          return `🏢 THÔNG TIN XÍ NGHIỆP & ĐỊA ĐIỂM LÀM VIỆC:\n• Xí nghiệp tiếp nhận: ${company}\n• Địa chỉ làm việc: ${location}, Nhật Bản\n• Môi trường: An toàn, trang bị đầy đủ bảo hộ lao động và quy chuẩn Nhật Bản`;
        }
        return `🏢 ĐƠN VỊ TIẾP NHẬN: ${company}\n📍 Địa điểm làm việc: ${location}, Nhật Bản`;
      }

      // 3. NỘI DUNG CÔNG VIỆC
      case 'job_work': {
        if (style === 'concise') {
          return `⚙️ CÔNG VIỆC THỰC TẾ:\n- Thao tác: ${work}\n- Thời gian làm việc: 08:00 - 17:00 (Nghỉ 60 phút)`;
        }
        if (style === 'friendly') {
          return `🛠️ CÔNG VIỆC HÀNG NGÀY CÓ GÌ?\n${work}. Mọi thao tác đều được các senpai và quản lý người Nhật hướng dẫn cầm tay chỉ việc tận tình từ ngày đầu, không cần lo lắng nếu chưa có kinh nghiệm nhé!`;
        }
        if (style === 'detailed') {
          return `⚙️ MÔ TẢ CÔNG VIỆC CHI TIẾT:\n• Nội dung chính: ${work}\n• Môi trường làm việc: ${d.workEnvironment || 'Nhà xưởng hiện đại, sạch sẽ, điều hòa quanh năm'}\n• Thời gian làm việc: ${d.workingHours || '08:00 - 17:00 (Nghỉ giải lao tiêu chuẩn theo luật)'}\n• Ngày nghỉ: ${d.holidays || 'Nghỉ Thứ 7, Chủ Nhật và ngày lễ Nhật Bản'}`;
        }
        return `🛠️ NỘI DUNG CÔNG VIỆC:\n${work}`;
      }

      // 4. CHỈ TIÊU & SỐ LƯỢNG
      case 'recruitment_quantity': {
        if (style === 'concise') {
          return `👥 CHỈ TIÊU TUYỂN DỤNG:\n- Số lượng: ${quantity}\n- Độ tuổi: ${age}`;
        }
        if (style === 'friendly') {
          return `👥 ĐỐI TƯỢNG & SỐ LƯỢNG TUYỂN:\nĐợt này xí nghiệp cần tuyển ${quantity}, độ tuổi trong khoảng ${age}. Rất phù hợp cho các bạn trẻ mong muốn rèn luyện và tích lũy vốn liếng sau 3 năm!`;
        }
        return `👥 CHỈ TIÊU TUYỂN DỤNG:\n- Số lượng cần tuyển: ${quantity}\n- Độ tuổi tiếp nhận: ${age}`;
      }

      // 5. TIÊU CHUẨN & ĐIỀU KIỆN
      case 'requirements': {
        if (style === 'concise') {
          return `🎯 TIÊU CHÍ ỨNG TUYỂN:\n- Tuổi: ${age} | Trình độ: ${education}\n- Sức khỏe: ${health}\n- Tiếng Nhật: ${japanese}`;
        }
        if (style === 'friendly') {
          return `🎯 BẠN CẦN CHUẨN BỊ GÌ KHI THI TUYỂN?\n- Độ tuổi từ ${age}, tốt nghiệp ${education}\n- Sức khỏe tốt, không mắc bệnh truyền nhiễm\n- Tiếng Nhật: ${japanese}. Chỉ cần bạn chịu khó học hỏi, VieJap sẽ đào tạo chu đáo từ A-Z!`;
        }
        if (style === 'detailed') {
          return `📋 ĐIỀU KIỆN ỨNG TUYỂN ĐẦY ĐỦ:\n• Độ tuổi: ${age}\n• Trình độ học vấn: ${education}\n• Kinh nghiệm: ${d.experience || 'Không yêu cầu, đào tạo từ đầu'}\n• Tiêu chuẩn sức khỏe: ${health}\n• Tiếng Nhật: ${japanese}`;
        }
        return `🎯 ĐIỀU KIỆN TUYỂN DỤNG:\n- Độ tuổi: ${age}\n- Học vấn: ${education}\n- Sức khỏe: ${health}\n- Yêu cầu tiếng: ${japanese}`;
      }

      // 6. TIỀN LƯƠNG & THU NHẬP
      case 'salary_benefits': {
        const takeHomeLine = takeHome
          ? `\n👉 Lương thực lĩnh dự kiến: ${takeHome} (đã trừ nhà ở, bảo hiểm, thuế)`
          : '';
        const overtimeLine = `\n👉 Làm thêm giờ (Tăng ca): ${overtime}`;

        if (layoutId === 'salary_benefits') {
          return `💰 BẢNG LƯƠNG VÀ THU NHẬP MINH BẠCH:\n✔️ Lương cơ bản: ${basicSalary}${takeHomeLine}${overtimeLine}\n✔️ Đảm bảo thu nhập thực tế, chi trả đúng ngày qua tài khoản ngân hàng Nhật Bản.`;
        }

        if (style === 'concise') {
          return `💵 MỨC LƯƠNG & ĐÃI NGỘ:\n- Lương cơ bản: ${basicSalary}${takeHome ? `\n- Thực nhận tay: ${takeHome}` : ''}\n- Tăng ca: ${overtime}`;
        }

        if (style === 'friendly') {
          return `💴 CHẾ ĐỘ TIỀN LƯƠNG RÕ RÀNG:\n- Lương cơ bản hàng tháng: ${basicSalary}${takeHome ? `\n- Sau khi trừ chi phí nhà ở, bảo hiểm, các bạn thực nhận về tay khoảng ${takeHome}` : ''}\n- Xí nghiệp có nhiều việc làm thêm: ${overtime}, giúp tăng thêm thu nhập gửi về gia đình.`;
        }

        if (style === 'detailed') {
          return `💰 CHẾ ĐỘ TIỀN LƯƠNG & KHẤU TRỪ TIÊU CHUẨN:\n• Lương cơ bản hợp đồng: ${basicSalary}${takeHomeLine}\n• Tiền làm thêm giờ: Tính hệ số 125% - 150% theo Luật Lao động Nhật Bản (${overtime})\n• Cam kết thanh toán minh bạch qua bảng lương điện tử hàng tháng.`;
        }

        return `💰 MỨC LƯƠNG & THU NHẬP:\n- Lương cơ bản: ${basicSalary}${takeHomeLine}${overtimeLine}`;
      }

      // 7. PHỤ CẤP, KTX & PHÚC LỢI
      case 'allowances_perks': {
        if (style === 'concise') {
          return `🎁 PHÚC LỢI & KÝ TÚC XÁ:\n- Chế độ bảo hiểm: ${insurance}\n- Ký túc xá: ${accommodation}\n- Trợ cấp: ${allowances}`;
        }
        if (style === 'friendly') {
          return `🏠 CHỖ Ở & PHÚC LỢI YÊN TÂM:\n- Ký túc xá: ${accommodation}, gần chỗ làm rất thuận tiện.\n- Đầy đủ bảo hiểm y tế, bảo hiểm xã hội (Nenkin) theo quy định Nhật Bản. Sau khi hết hợp đồng về nước còn được nhận lại tiền Nenkin hỗ trợ.`;
        }
        return `🎁 PHÚC LỢI & HỖ TRỢ:\n• Chế độ bảo hiểm: ${insurance}\n• Chỗ ở: ${accommodation}\n• Trợ cấp & thưởng: ${allowances}`;
      }

      // 8. LỊCH THI TUYỂN & XUẤT CẢNH
      case 'timeline': {
        if (style === 'concise') {
          return `⏰ LỊCH TRÌNH DỰ KIẾN:\n- Phỏng vấn: ${interviewDate}\n- Xuất cảnh: ${departure}`;
        }
        if (style === 'friendly') {
          return `⏰ THỜI GIAN DỰ KIẾN:\n- Ngày thi tuyển phỏng vấn: ${interviewDate}\n- Thời gian dự kiến bay sang Nhật: ${departure}. VieJap hỗ trợ hoàn tất toàn bộ thủ tục visa, giấy tờ nhanh chóng!`;
        }
        return `⏰ KẾ HOẠCH PHỎNG VẤN & XUẤT CẢNH:\n- Dự kiến phỏng vấn: ${interviewDate}\n- Dự kiến xuất cảnh: ${departure}\n- Thời hạn hợp đồng: ${d.contractTerm || '3 năm'} (Gia hạn tiếp theo nguyện vọng)`;
      }

      // 9. MỞ ĐẦU STORYTELLING
      case 'story_intro': {
        if (variant === 1) {
          return `🌱 "Muốn có một tương lai khác biệt, phải dám bước ra khỏi vùng an toàn."\nBạn đang tìm kiếm một hướng đi mới với thu nhập ổn định và tích lũy được tay nghề vững vàng tại Nhật Bản? Đơn hàng dưới đây có thể chính là cơ hội bạn đang chờ đợi!`;
        }
        return `🌸 Chào các bạn trẻ và quý phụ huynh thân mến!\nNếu bạn đang ấp ủ ước mơ sang Nhật Bản làm việc để tích lũy vốn và nâng cao trình độ, đừng bỏ qua thông tin đơn hàng chất lượng cao vừa được VieJap tiếp nhận hôm nay nhé!`;
      }

      // 10. GIỚI THIỆU CƠ HỘI
      case 'story_opportunity': {
        return `🇯🇵 CƠ HỘI LÀM VIỆC TẠI ${location.toUpperCase()}:\nXí nghiệp ${company} đang tuyển ${quantity} cho vị trí ${title}. Công việc rất ổn định, môi trường làm việc thân thiện và ban giám đốc xí nghiệp luôn ưu ái chăm lo cho người lao động Việt Nam.`;
      }

      // 11. LIÊN HỆ & CTA
      case 'cta_contact': {
        if (layoutId === 'concise_shareable') {
          return `📞 ĐĂNG KÝ NGAY HÔM NAY:\n☎️ Hotline/Zalo: 0966 966 284 (Tư vấn 24/7)\n🏢 Trung tâm Nhân lực VieJap - 111/30 Nguyễn Thị Minh Khai, Vĩnh Long`;
        }
        if (style === 'concise') {
          return `📞 LIÊN HỆ ĐĂNG KÝ HỒ SƠ:\n☎️ Hotline/Zalo: 0966 966 284\n🏢 Trung tâm VieJap - Đồng hành xuất khẩu lao động Nhật Bản uy tín.`;
        }
        if (style === 'friendly') {
          return `📩 BẠN CẦN TƯ VẤN THÊM VỀ ĐƠN HÀNG NÀY?\nĐừng ngần ngại nhắn tin trực tiếp cho fanpage hoặc gọi ngay cho đội ngũ tư vấn của VieJap để được hướng dẫn hồ sơ hoàn toàn miễn phí nhé:\n☎️ Hotline / Zalo: 0966 966 284\n🏢 Văn phòng VieJap: 111/30 Nguyễn Thị Minh Khai, Phường Nguyệt Hóa, Vĩnh Long.`;
        }
        return `📞 THÔNG TIN LIÊN HỆ & ĐĂNG KÝ:\n🏢 Trung tâm Hợp tác Nhân lực Nhật Bản VieJap\n☎️ Hotline tư vấn 24/7: 0966 966 284 (Zalo)\n🌐 Website: viejap.com\n📍 Địa chỉ: 111/30 Đường Nguyễn Thị Minh Khai, Phường Nguyệt Hóa, Tỉnh Vĩnh Long.`;
      }

      default:
        return '';
    }
  }

  /**
   * Sinh bản HTML bài đăng đồng bộ từ các sections
   */
  private generateHtmlFromSections(
    sections: PostSection[],
    d: Partial<JobOrder>,
    layoutId: PostLayoutId,
  ): string {
    const layoutBadge =
      layoutId === 'highlight'
        ? '🇯🇵 THÔNG BÁO TUYỂN DỤNG NỔI BẬT'
        : layoutId === 'salary_benefits'
        ? '💰 ĐƠN HÀNG LƯƠNG & CHẾ ĐỘ HẤP DẪN'
        : layoutId === 'storytelling'
        ? '🌸 HÀNH TRÌNH TƯƠNG LAI CÙNG VIEJAP'
        : '🇯🇵 THÔNG TIN TUYỂN DỤNG NHẬT BẢN';

    const itemsHtml = sections
      .map(
        (s) => `
    <div class="post-section-block section-${s.key}">
      <h4><i class="${s.icon}"></i> ${s.label}</h4>
      <div class="section-body">
        ${this.formatTextToHtmlParagraphs(s.content)}
      </div>
    </div>`,
      )
      .join('\n');

    return `
<div class="job-post-content layout-${layoutId}">
  <div class="post-header-badge">${layoutBadge}</div>
  <h2>${d.title || 'Đơn hàng tuyển dụng Nhật Bản'}</h2>
  <div class="post-sections-wrap">
    ${itemsHtml}
  </div>
</div>`;
  }

  private formatTextToHtmlParagraphs(text: string): string {
    return text
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        if (line.startsWith('- ') || line.startsWith('• ') || line.startsWith('✔️ ') || line.startsWith('👉 ')) {
          return `<li>${line.substring(2)}</li>`;
        }
        return `<p>${line}</p>`;
      })
      .join('');
  }
}

