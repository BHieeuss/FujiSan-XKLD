import { CommonModule } from '@angular/common';
import { Component, HostListener, OnDestroy, OnInit, inject } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import {
  createStudentFormData,
  STUDENT_FORM_STORAGE_KEY,
  StudentFormData,
} from './student-form.model';
import { StudentFormExcelService } from './student-form-excel.service';
import { StudentFormPdfService, StudentFormPdfFile } from './student-form-pdf.service';
import {
  StudentFormSubmissionResult,
  StudentFormSubmissionService,
  StudentSubmissionFileItem,
} from './student-form-submission.service';
import {
  StudentRegistrationService,
  StudentVerifyResponse,
} from './student-registration.service';

export interface FormStep {
  id: string;
  stepNumber: string;
  title: string;
  subtitle: string;
  shortTitle: string;
  icon: string;
}

@Component({
  selector: 'app-student-form-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './student-form-page.html',
  styleUrl: './student-form-page.scss',
})
export class StudentFormPage implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly registrationService = inject(StudentRegistrationService);

  // Authentication & Gatekeeper State
  isVerified = false;
  studentSession: StudentVerifyResponse | null = null;
  inputCode = '';
  isVerifying = false;
  verificationError = '';
  rateLimited = false;
  rateLimitSeconds = 0;

  readonly steps: FormStep[] = [
    {
      id: 'personal',
      stepNumber: '01',
      title: 'Thông tin cá nhân & Liên lạc',
      subtitle: 'Họ tên, ngày sinh, số CCCD và thông tin liên hệ chính chủ',
      shortTitle: 'Cá nhân & CCCD',
      icon: 'fas fa-user',
    },
    {
      id: 'health',
      stepNumber: '02',
      title: 'Sức khỏe & Thể chất',
      subtitle: 'Chỉ số chiều cao, cân nặng, thị lực và thói quen sinh hoạt',
      shortTitle: 'Sức khỏe',
      icon: 'fas fa-heart-pulse',
    },
    {
      id: 'goals',
      stepNumber: '03',
      title: 'Tính cách & Nguyện vọng',
      subtitle: 'Mục tiêu tài chính, dự định sau 3 năm và lý do sang Nhật',
      shortTitle: 'Nguyện vọng',
      icon: 'fas fa-compass',
    },
    {
      id: 'history',
      stepNumber: '04',
      title: 'Quá trình học tập & Làm việc',
      subtitle: 'Lịch sử học vấn từ cấp 2/3 và các nơi đã từng làm việc',
      shortTitle: 'Học tập & Việc làm',
      icon: 'fas fa-graduation-cap',
    },
    {
      id: 'family',
      stepNumber: '05',
      title: 'Gia đình & Hoàn tất hồ sơ',
      subtitle: 'Thành phần gia đình, kiểm tra hồ sơ và tải file Excel',
      shortTitle: 'Gia đình & Gửi',
      icon: 'fas fa-people-roof',
    },
  ];

  data: StudentFormData;
  photo?: File;
  photoPreview = '';
  documentPdf?: File;
  pdfPreviewUrl?: SafeResourceUrl;
  pdfError = '';
  showPdfModal = false;
  isPdfDragOver = false;
  submittedSuccess = false;
  submissionResult?: StudentFormSubmissionResult;
  submittedCvPdf?: StudentFormPdfFile;
  studentCode = '';
  submitted = false;
  generating = false;
  pdfGenerating = false;
  sending = false;
  sendConsent = false;
  errorMessage = '';
  downloadedFilename = '';
  submissionMessage = '';
  submissionId = '';
  draftMessage = 'Tiến trình nhập sẽ được tự động lưu trên thiết bị này.';

  currentStep = 0;
  viewMode: 'stepper' | 'full' = 'stepper';

  private rawPdfUrl = '';
  private saveTimer?: ReturnType<typeof setTimeout>;
  private hasPendingChanges = false;

  constructor(
    private readonly excelService: StudentFormExcelService,
    private readonly pdfService: StudentFormPdfService,
    private readonly submissionService: StudentFormSubmissionService,
    private readonly sanitizer: DomSanitizer,
  ) {
    this.data = this.loadDraft();
  }

  ngOnInit(): void {
    // 1. Check query parameters (?code=... or ?token=...)
    const q = this.route.snapshot.queryParams;
    if (q['code'] && typeof q['code'] === 'string' && q['code'].trim().length === 6) {
      this.inputCode = q['code'].trim();
      void this.verifyCode(this.inputCode);
      return;
    }
    if (q['token'] && typeof q['token'] === 'string' && q['token'].trim().length >= 16) {
      void this.verifyQrToken(q['token'].trim());
      return;
    }

    // 2. Check existing active session in storage
    const active = this.registrationService.getActiveSession();
    if (active && active.success) {
      this.applySession(active);
    }
  }

  onCodeInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    if (target && target.value) {
      // Keep only digits
      this.inputCode = target.value.replace(/\D/g, '').slice(0, 6);
      target.value = this.inputCode;
      if (this.inputCode.length === 6) {
        void this.verifyCode(this.inputCode);
      }
    }
  }

  async onVerifyCodeSubmit(): Promise<void> {
    if (!this.inputCode || this.inputCode.trim().length !== 6) {
      this.verificationError = 'Vui lòng nhập đúng 6 chữ số của mã đăng ký.';
      return;
    }
    await this.verifyCode(this.inputCode.trim());
  }

  async verifyCode(code: string): Promise<void> {
    this.isVerifying = true;
    this.verificationError = '';
    this.rateLimited = false;
    try {
      const res = await this.registrationService.verifyCode(code);
      if (res.success) {
        this.applySession(res);
      } else {
        this.verificationError = res.message || 'Mã đăng ký không chính xác.';
        if (res.rateLimited) {
          this.rateLimited = true;
          this.rateLimitSeconds = res.remainingSeconds || 900;
        }
      }
    } catch (err: any) {
      this.verificationError = err.message || 'Lỗi kết nối máy chủ xác thực.';
    } finally {
      this.isVerifying = false;
    }
  }

  async verifyQrToken(token: string): Promise<void> {
    this.isVerifying = true;
    this.verificationError = '';
    try {
      const res = await this.registrationService.verifyQr(token);
      if (res.success) {
        this.applySession(res);
      } else {
        this.verificationError = res.message || 'Mã QR không hợp lệ hoặc đã hết hạn.';
      }
    } catch (err: any) {
      this.verificationError = err.message || 'Lỗi xác thực mã QR.';
    } finally {
      this.isVerifying = false;
    }
  }

  applySession(sess: StudentVerifyResponse): void {
    this.studentSession = sess;
    this.isVerified = true;

    // Pre-fill student name and phone from registration code
    if (sess.studentName && (!this.data.fullName || this.data.fullName === '')) {
      this.data.fullName = sess.studentName;
    }
    if (sess.phone && (!this.data.phone || this.data.phone === '')) {
      this.data.phone = sess.phone;
    }

    // Restore draft from backend if available
    if (sess.draftData && typeof sess.draftData === 'object') {
      this.data = this.mergeDraft(this.data, sess.draftData);
      if (sess.currentStep !== undefined && sess.currentStep >= 0 && sess.currentStep < this.steps.length) {
        this.currentStep = sess.currentStep;
      }
      this.draftMessage = 'Đã khôi phục bản nháp từ hệ thống VieJap.';
    }
  }

  logoutCodeSession(): void {
    if (window.confirm('Bạn có muốn thoát phiên làm việc của mã đăng ký này? Dữ liệu bản nháp đã lưu trên hệ thống vẫn được bảo toàn.')) {
      this.registrationService.clearSession();
      this.studentSession = null;
      this.isVerified = false;
      this.inputCode = '';
      this.verificationError = '';
    }
  }

  formatExpiry(iso?: string): string {
    if (!iso) return '';
    try {
      const d = new Date(iso);
      return new Intl.DateTimeFormat('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(d);
    } catch {
      return iso;
    }
  }

  ngOnDestroy(): void {
    clearTimeout(this.saveTimer);
    if (this.hasPendingChanges) {
      this.saveDraft();
    }
    this.revokePhotoPreview();
    this.revokePdfPreview();
  }

  @HostListener('window:beforeunload')
  onBeforeUnload(): void {
    if (this.hasPendingChanges) {
      this.saveDraft();
    }
  }

  get completionPercentage(): number {
    let score = 0;
    const total = 20;

    // 1. Personal
    if (this.data.fullName?.trim()) score++;
    if (this.data.idNumber?.trim()) score++;
    if (this.data.phone?.trim()) score++;
    if (this.data.birthDate) score++;
    if (this.data.idIssueDate) score++;
    if (this.data.address?.trim()) score++;

    // 2. Health
    if (this.data.height) score++;
    if (this.data.weight) score++;
    if (this.data.bloodType) score++;
    if (this.data.eyesight) score++;

    // 3. Goals & Personality
    if (this.data.strengths?.trim()) score++;
    if (this.data.selfAssessment?.trim()) score++;
    if (this.data.reasonJapan?.trim()) score++;
    if (this.data.savingsGoal?.trim()) score++;

    // 4. History
    if (this.data.education?.some((e) => e.school?.trim())) score++;
    if (this.data.workHistory?.some((w) => w.company?.trim())) score++;

    // 5. Family & Consent
    if (this.data.family?.some((f) => f.fullName?.trim())) score++;
    if (this.data.familyConsent) score++;
    if (this.photoPreview || this.photo) score++;
    if (this.sendConsent) score++;

    return Math.min(100, Math.round((score / total) * 100));
  }

  isStepComplete(stepIndex: number): boolean {
    switch (stepIndex) {
      case 0:
        return !!(this.data.fullName?.trim() && this.data.idNumber?.trim() && this.data.phone?.trim());
      case 1:
        return !!(this.data.height && this.data.weight && this.data.bloodType);
      case 2:
        return !!(this.data.reasonJapan?.trim() || this.data.strengths?.trim());
      case 3:
        return this.data.education?.some((e) => !!e.school?.trim()) ?? false;
      case 4:
        return this.data.family?.some((f) => !!f.fullName?.trim()) ?? false;
      default:
        return false;
    }
  }

  getFilledEducationCount(): number {
    return this.data.education.filter((e) => e.school?.trim() || e.major?.trim() || e.from?.trim()).length;
  }

  getFilledWorkCount(): number {
    return this.data.workHistory.filter((w) => w.company?.trim() || w.job?.trim() || w.from?.trim()).length;
  }

  getFilledFamilyCount(): number {
    return this.data.family.filter((f) => f.fullName?.trim() || f.relationship?.trim()).length;
  }

  trackByIndex(index: number): number {
    return index;
  }

  get shortDraftStatus(): string {
    if (this.draftMessage.includes('Đã tự động lưu lúc')) {
      const match = this.draftMessage.match(/(\d{1,2}:\d{2})/);
      return match ? `Đã lưu ${match[1]}` : 'Đã tự động lưu';
    }
    if (this.draftMessage.includes('Đã khôi phục')) {
      return 'Đã khôi phục nháp';
    }
    if (this.draftMessage.includes('Đã xóa dữ liệu')) {
      return 'Đã làm mới';
    }
    return 'Tự động lưu';
  }

  onPhotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    this.revokePhotoPreview();
    this.photo = file;
    this.photoPreview = file ? URL.createObjectURL(file) : '';
    this.scheduleSave();
  }

  removePhoto(fileInput?: HTMLInputElement): void {
    this.revokePhotoPreview();
    this.photo = undefined;
    if (fileInput) {
      fileInput.value = '';
    }
    this.scheduleSave();
  }

  onPdfSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      this.setPdfFile(file);
    }
  }

  onPdfDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isPdfDragOver = true;
  }

  onPdfDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isPdfDragOver = false;
  }

  onPdfDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isPdfDragOver = false;
    const file = event.dataTransfer?.files?.[0];
    if (file) {
      this.setPdfFile(file);
    }
  }

  setPdfFile(file: File): void {
    this.pdfError = '';
    if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
      this.pdfError = 'Chỉ chấp nhận file định dạng PDF (.pdf).';
      return;
    }
    const maxSize = 20 * 1024 * 1024;
    if (file.size > maxSize) {
      this.pdfError = `File "${file.name}" dung lượng ${this.formatFileSize(file.size)} vượt quá giới hạn tối đa 20MB.`;
      return;
    }
    this.revokePdfPreview();
    this.documentPdf = file;
    this.rawPdfUrl = URL.createObjectURL(file);
    this.pdfPreviewUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.rawPdfUrl);
  }

  removePdf(): void {
    this.revokePdfPreview();
    this.documentPdf = undefined;
    this.pdfError = '';
    this.showPdfModal = false;
  }

  previewPdf(): void {
    if (this.documentPdf && this.pdfPreviewUrl) {
      this.showPdfModal = true;
    }
  }

  closePdfModal(): void {
    this.showPdfModal = false;
  }

  formatFileSize(bytes: number): string {
    if (!bytes || bytes <= 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  downloadBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    anchor.style.display = 'none';
    document.body.appendChild(anchor);
    anchor.click();
    window.setTimeout(() => {
      anchor.remove();
      URL.revokeObjectURL(url);
    }, 30_000);
  }

  downloadFileItem(file: StudentSubmissionFileItem): void {
    if (file.downloadUrl) {
      const anchor = document.createElement('a');
      anchor.href = file.downloadUrl;
      anchor.download = file.fileName;
      anchor.style.display = 'none';
      document.body.appendChild(anchor);
      anchor.click();
      window.setTimeout(() => anchor.remove(), 10_000);
    }
  }

  closeSuccessModal(): void {
    this.submittedSuccess = false;
  }

  private revokePdfPreview(): void {
    if (this.rawPdfUrl) {
      URL.revokeObjectURL(this.rawPdfUrl);
      this.rawPdfUrl = '';
      this.pdfPreviewUrl = undefined;
    }
  }

  scheduleSave(): void {
    this.hasPendingChanges = true;
    clearTimeout(this.saveTimer);
    this.saveTimer = setTimeout(() => this.saveDraft(), 250);
  }

  goToStep(stepIndex: number): void {
    if (stepIndex >= 0 && stepIndex < this.steps.length) {
      this.currentStep = stepIndex;
      this.scrollToFormTop();
    }
  }

  nextStep(): void {
    if (this.currentStep === 0) {
      if (!this.data.fullName.trim() || !this.data.idNumber.trim() || !this.data.phone.trim()) {
        this.submitted = true;
        this.errorMessage = 'Vui lòng điền đầy đủ 3 trường bắt buộc (*) trước khi tiếp tục.';
        requestAnimationFrame(() => {
          document.querySelector<HTMLElement>('.ng-invalid[required]')?.focus();
        });
        return;
      }
    }
    this.errorMessage = '';
    if (this.currentStep < this.steps.length - 1) {
      this.currentStep++;
      this.scrollToFormTop();
    }
  }

  prevStep(): void {
    this.errorMessage = '';
    if (this.currentStep > 0) {
      this.currentStep--;
      this.scrollToFormTop();
    }
  }

  setViewMode(mode: 'stepper' | 'full'): void {
    this.viewMode = mode;
    this.scrollToFormTop();
  }

  async onSubmit(form: NgForm): Promise<void> {
    if (!this.prepareAction(form)) {
      return;
    }

    this.generating = true;
    try {
      this.downloadedFilename = await this.excelService.download(this.data, this.photo);
    } catch (error) {
      console.error(error);
      this.errorMessage =
        'Không thể tạo file Excel. Vui lòng kiểm tra lại ảnh thẻ hoặc tải lại trang rồi thử lại.';
    } finally {
      this.generating = false;
    }
  }

  async downloadPdfDoc(form: NgForm): Promise<void> {
    if (!this.prepareAction(form)) {
      return;
    }

    this.pdfGenerating = true;
    try {
      this.downloadedFilename = await this.pdfService.download(this.data, this.photo);
    } catch (error) {
      console.error(error);
      this.errorMessage =
        'Không thể xuất file PDF sơ yếu lý lịch. Vui lòng kiểm tra lại thông tin và thử lại.';
    } finally {
      this.pdfGenerating = false;
    }
  }

  async sendForm(form: NgForm): Promise<void> {
    this.submissionMessage = '';
    this.submissionId = '';
    this.studentCode = '';
    this.submittedSuccess = false;

    if (!this.prepareAction(form)) {
      return;
    }

    if (!this.sendConsent) {
      this.errorMessage =
        'Vui lòng xác nhận đồng ý gửi và lưu trữ hồ sơ trước khi gửi.';
      requestAnimationFrame(() => {
        document.querySelector<HTMLInputElement>('#sendConsent')?.focus();
      });
      return;
    }

    this.sending = true;
    try {
      // Pre-render the CV PDF
      let cvPdf: StudentFormPdfFile | undefined;
      try {
        cvPdf = await this.pdfService.build(this.data, this.photo);
        this.submittedCvPdf = cvPdf;
      } catch (pdfErr) {
        console.warn('PDF CV generation warning:', pdfErr);
      }

      let result: StudentFormSubmissionResult;
      const progressPercent = this.completionPercentage;
      if (this.studentSession?.codeId && this.studentSession?.sessionToken) {
        // Pre-build workbook
        const workbook = await this.excelService.build(this.data, this.photo);
        const subRes = await this.registrationService.submitProfile(
          this.studentSession.codeId,
          this.studentSession.sessionToken,
          this.data,
          this.photo,
          this.documentPdf,
          cvPdf?.blob,
          workbook.blob,
          progressPercent,
        );
        result = {
          success: true,
          profileId: subRes.profileId || '',
          studentCode: subRes.studentCode || '',
          fullName: this.data.fullName,
          message: subRes.message || 'Gửi hồ sơ học viên thành công.',
          files: [],
          workbook,
        };
      } else {
        result = await this.submissionService.submit(
          this.data,
          this.photo,
          this.documentPdf,
          cvPdf?.blob,
          progressPercent,
        );
      }
      this.submissionResult = result;
      this.submissionId = result.profileId;
      this.studentCode = result.studentCode;
      this.submittedSuccess = true;
      this.submissionMessage = result.message;

      // 1. Automatically download generated Excel file
      this.downloadBlob(result.workbook.blob, result.workbook.filename);

      // 2. Automatically download generated CV PDF file
      if (cvPdf) {
        window.setTimeout(() => {
          this.downloadBlob(cvPdf.blob, cvPdf.filename);
        }, 500);
      }

      // 3. Automatically download attached PDF if selected
      if (this.documentPdf) {
        window.setTimeout(() => {
          const safeName =
            this.data.fullName
              .normalize('NFD')
              .replace(/[\u0300-\u036f]/g, '')
              .replace(/[^a-zA-Z0-9]+/g, '_')
              .replace(/^_+|_+$/g, '')
              .toUpperCase() || 'HOC_VIEN';
          this.downloadBlob(this.documentPdf!, `TAI_LIEU_${safeName}.pdf`);
        }, 1000);
      }
    } catch (error) {
      console.error(error);
      this.errorMessage =
        error instanceof Error
          ? error.message
          : 'Không thể gửi hồ sơ. Vui lòng thử lại sau.';
    } finally {
      this.sending = false;
    }
  }

  downloadSubmittedExcel(): void {
    if (this.submissionResult?.workbook) {
      this.downloadBlob(
        this.submissionResult.workbook.blob,
        this.submissionResult.workbook.filename,
      );
    }
  }

  downloadSubmittedCvPdf(): void {
    if (this.submittedCvPdf) {
      this.downloadBlob(this.submittedCvPdf.blob, this.submittedCvPdf.filename);
    }
  }

  downloadSubmittedAttachedPdf(): void {
    if (this.documentPdf) {
      const safeName =
        this.data.fullName
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-zA-Z0-9]+/g, '_')
          .replace(/^_+|_+$/g, '')
          .toUpperCase() || 'HOC_VIEN';
      this.downloadBlob(this.documentPdf, `TAI_LIEU_${safeName}.pdf`);
    }
  }

  clearData(form: NgForm): void {
    if (!window.confirm('Xóa toàn bộ dữ liệu đang nhập đã lưu trên thiết bị này?')) {
      return;
    }

    clearTimeout(this.saveTimer);
    this.hasPendingChanges = false;
    this.removeStoredDraft();
    this.revokePhotoPreview();
    this.photo = undefined;
    this.data = createStudentFormData();
    this.submitted = false;
    this.currentStep = 0;
    this.sendConsent = false;
    this.errorMessage = '';
    this.downloadedFilename = '';
    this.submissionMessage = '';
    this.submissionId = '';
    this.draftMessage = 'Đã xóa dữ liệu đang nhập. Các lựa chọn mặc định đã được khôi phục.';
    form.resetForm(this.data);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  private prepareAction(form: NgForm): boolean {
    this.submitted = true;
    this.errorMessage = '';
    this.downloadedFilename = '';
    this.submissionMessage = '';
    this.submissionId = '';

    if (!form.invalid) {
      return true;
    }

    if (!this.data.fullName.trim() || !this.data.idNumber.trim() || !this.data.phone.trim()) {
      this.currentStep = 0;
      this.errorMessage = 'Vui lòng hoàn thành 3 trường bắt buộc (*) tại Bước 1.';
    } else {
      this.errorMessage = 'Vui lòng kiểm tra lại các trường dữ liệu có định dạng chưa chính xác.';
    }

    requestAnimationFrame(() => {
      document.querySelector<HTMLElement>('.ng-invalid[required]')?.focus();
    });
    return false;
  }

  private scrollToFormTop(): void {
    if (typeof window !== 'undefined') {
      const el = document.getElementById('student-form-anchor');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        window.scrollTo({ top: 180, behavior: 'smooth' });
      }
    }
  }

  private loadDraft(): StudentFormData {
    const defaults = createStudentFormData();

    try {
      const rawDraft = localStorage.getItem(STUDENT_FORM_STORAGE_KEY);
      if (!rawDraft) {
        return defaults;
      }

      const stored = JSON.parse(rawDraft) as Partial<StudentFormData>;
      const restored = this.mergeDraft(defaults, stored);
      this.draftMessage =
        'Đã khôi phục tiến trình nhập trước đó. Ảnh thẻ cần được chọn lại nếu có.';
      return restored;
    } catch {
      this.removeStoredDraft();
      this.draftMessage = 'Không thể đọc dữ liệu cũ. Biểu mẫu đã được khởi tạo lại.';
      return defaults;
    }
  }

  private mergeDraft(defaults: StudentFormData, stored: Partial<StudentFormData>): StudentFormData {
    const restored: StudentFormData = {
      ...defaults,
      ...stored,
      education: defaults.education.map((entry, index) => ({
        ...entry,
        ...stored.education?.[index],
      })),
      workHistory: defaults.workHistory.map((entry, index) => ({
        ...entry,
        ...stored.workHistory?.[index],
      })),
      family: defaults.family.map((entry, index) => ({
        ...entry,
        ...stored.family?.[index],
      })),
    };

    const defaultChoiceKeys = [
      'maritalStatus',
      'eyesight',
      'handedness',
      'colorBlind',
      'limbDisability',
      'surgery',
      'bloodType',
      'tattoo',
      'familyMedicalHistory',
      'alcohol',
      'smoking',
      'collectiveLiving',
      'canCook',
      'abroadBefore',
      'visaApplied',
      'familyConsent',
    ] as const;

    defaultChoiceKeys.forEach((key) => {
      if (!restored[key]) {
        restored[key] = defaults[key] as never;
      }
    });

    return restored;
  }

  private saveDraft(): void {
    clearTimeout(this.saveTimer);

    try {
      localStorage.setItem(STUDENT_FORM_STORAGE_KEY, JSON.stringify(this.data));
      this.hasPendingChanges = false;
      const timeStr = new Intl.DateTimeFormat('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
      }).format(new Date());
      this.draftMessage = `Đã tự động lưu lúc ${timeStr}.`;

      // Async backend save if student is authenticated with registration code
      if (this.studentSession?.codeId && this.studentSession?.sessionToken) {
        this.registrationService
          .saveDraft(
            this.studentSession.codeId,
            this.studentSession.sessionToken,
            this.data,
            this.completionPercentage,
            this.currentStep
          )
          .then((res) => {
            if (res.success) {
              this.draftMessage = `Đã lưu bản nháp lên hệ thống (${timeStr}).`;
            }
          })
          .catch(() => {});
      }
    } catch {
      this.draftMessage =
        'Trình duyệt không cho phép lưu tiến trình. Dữ liệu hiện tại vẫn chưa bị mất.';
    }
  }

  private removeStoredDraft(): void {
    try {
      localStorage.removeItem(STUDENT_FORM_STORAGE_KEY);
    } catch {
      // The form can still be reset when browser storage is unavailable.
    }
  }

  private revokePhotoPreview(): void {
    if (this.photoPreview) {
      URL.revokeObjectURL(this.photoPreview);
      this.photoPreview = '';
    }
  }
}
