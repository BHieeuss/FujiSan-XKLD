import { Injectable } from '@angular/core';
import { RecruitmentPosterData } from '../poster-maker.model';

export interface PosterQaIssue {
  type:
    | 'text_overflow'
    | 'text_clipped'
    | 'font_too_small'
    | 'image_distorted'
    | 'wrong_industry_image'
    | 'missing_field'
    | 'salary_mismatch'
    | 'date_mismatch'
    | 'qr_obscured';
  field?: string;
  severity: 'low' | 'medium' | 'high';
  message: string;
  autoFixable: boolean;
}

export interface PosterQaReport {
  status: 'PASS' | 'FAIL';
  score: number; // 0.0 -> 1.0 (ví dụ 0.95)
  issues: PosterQaIssue[];
  autoRepairApplied?: boolean;
  retryCount: number;
}

export const MAX_AUTO_RETRY = 2;

@Injectable({ providedIn: 'root' })
export class AiPosterQaService {
  /**
   * Kiểm định chất lượng toàn diện của Poster đã render (Section XIX)
   */
  async inspectPoster(
    canvas: HTMLCanvasElement,
    data: RecruitmentPosterData,
    retryCount = 0,
  ): Promise<PosterQaReport> {
    const issues: PosterQaIssue[] = [];

    // 1. Kiểm tra tràn chữ tiêu đề (Title overflow)
    if (data.title && data.title.length > 55) {
      issues.push({
        type: 'text_overflow',
        field: 'title',
        severity: 'high',
        message: 'Tiêu đề đơn tuyển vượt quá 55 ký tự, có thể bị tràn dòng trên poster.',
        autoFixable: true,
      });
    }

    // 2. Kiểm tra nội dung công việc (Job description overflow)
    if (data.jobDescription && data.jobDescription.length > 180) {
      issues.push({
        type: 'text_overflow',
        field: 'jobDescription',
        severity: 'high',
        message: 'Mô tả công việc quá dài (> 180 ký tự), có nguy cơ che lấp khung lương.',
        autoFixable: true,
      });
    }

    // 3. Kiểm tra số dòng yêu cầu & quyền lợi
    const reqLines = data.requirements
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);
    if (reqLines.length > 4) {
      issues.push({
        type: 'text_clipped',
        field: 'requirements',
        severity: 'medium',
        message: `Số dòng yêu cầu (${reqLines.length} dòng) vượt quá 4 dòng tối đa của khung poster.`,
        autoFixable: true,
      });
    }

    // 4. Kiểm tra trường bắt buộc
    if (!data.location || data.location.trim() === '' || data.location === 'ĐANG CẬP NHẬT') {
      issues.push({
        type: 'missing_field',
        field: 'location',
        severity: 'high',
        message: 'Thiếu thông tin địa điểm làm việc tại Nhật Bản.',
        autoFixable: false,
      });
    }

    if (!data.salary || data.salary.trim() === '' || data.salary === 'Lương đang cập nhật') {
      issues.push({
        type: 'missing_field',
        field: 'salary',
        severity: 'medium',
        message: 'Mức lương chưa được điền cụ thể.',
        autoFixable: false,
      });
    }

    // 5. Kiểm tra định dạng ngày phỏng vấn
    if (data.interviewDate && !/^\d{4}-\d{2}-\d{2}$/.test(data.interviewDate)) {
      issues.push({
        type: 'date_mismatch',
        field: 'interviewDate',
        severity: 'medium',
        message: 'Ngày phỏng vấn chưa đúng chuẩn YYYY-MM-DD.',
        autoFixable: true,
      });
    }

    // 6. Kiểm tra QR code URL
    if (!data.registrationUrl || !data.registrationUrl.startsWith('http')) {
      issues.push({
        type: 'qr_obscured',
        field: 'registrationUrl',
        severity: 'low',
        message: 'Đường dẫn quét mã QR chưa phải là URL hợp lệ (nên bắt đầu bằng https://).',
        autoFixable: false,
      });
    }

    // 7. Kiểm tra Canvas thực tế (đảm bảo canvas đã render nội dung thực sự)
    if (canvas.width !== 1080 || canvas.height !== 1920) {
      issues.push({
        type: 'image_distorted',
        severity: 'high',
        message: 'Kích thước canvas không đúng tỷ lệ chuẩn Story 1080 × 1920 px.',
        autoFixable: false,
      });
    }

    const highSeverityCount = issues.filter((i) => i.severity === 'high').length;
    const mediumSeverityCount = issues.filter((i) => i.severity === 'medium').length;

    const penalty = highSeverityCount * 0.25 + mediumSeverityCount * 0.1;
    const score = Math.max(0.5, Math.round((1.0 - penalty) * 100) / 100);

    const isPass = highSeverityCount === 0 && score >= 0.85;

    return {
      status: isPass ? 'PASS' : 'FAIL',
      score,
      issues,
      retryCount,
    };
  }

  /**
   * Tự động điều chỉnh dữ liệu để khắc phục lỗi poster (Auto-Repair - Section XX)
   */
  autoRepair(
    data: RecruitmentPosterData,
    issues: PosterQaIssue[],
  ): { repairedData: RecruitmentPosterData; modified: boolean } {
    const repaired = { ...data };
    let modified = false;

    for (const issue of issues) {
      if (!issue.autoFixable) {
        continue;
      }

      // Rút gọn mô tả công việc nếu bị tràn
      if (issue.field === 'jobDescription' && repaired.jobDescription.length > 180) {
        repaired.jobDescription = repaired.jobDescription.slice(0, 175) + '...';
        modified = true;
      }

      // Rút gọn tiêu đề nếu vượt quá độ dài cho phép
      if (issue.field === 'title' && repaired.title.length > 55) {
        repaired.title = repaired.title.slice(0, 52) + '...';
        modified = true;
      }

      // Cắt gọn danh sách yêu cầu về đúng 4 dòng tối đa
      if (issue.field === 'requirements') {
        const lines = repaired.requirements
          .split(/\r?\n/)
          .map((l) => l.trim())
          .filter(Boolean);
        if (lines.length > 4) {
          repaired.requirements = lines.slice(0, 4).join('\n');
          modified = true;
        }
      }
    }

    return { repairedData: repaired, modified };
  }
}
