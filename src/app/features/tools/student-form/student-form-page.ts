import { CommonModule } from '@angular/common';
import { Component, HostListener, OnDestroy } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import {
  createStudentFormData,
  STUDENT_FORM_STORAGE_KEY,
  StudentFormData,
} from './student-form.model';
import { StudentFormExcelService } from './student-form-excel.service';
import { StudentFormSubmissionService } from './student-form-submission.service';

@Component({
  selector: 'app-student-form-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './student-form-page.html',
  styleUrl: './student-form-page.scss',
})
export class StudentFormPage implements OnDestroy {
  data: StudentFormData;
  photo?: File;
  photoPreview = '';
  submitted = false;
  generating = false;
  sending = false;
  sendConsent = false;
  errorMessage = '';
  downloadedFilename = '';
  submissionMessage = '';
  submissionId = '';
  draftMessage = 'Tiến trình nhập sẽ được tự động lưu trên thiết bị này.';

  private saveTimer?: ReturnType<typeof setTimeout>;
  private hasPendingChanges = false;

  constructor(
    private readonly excelService: StudentFormExcelService,
    private readonly submissionService: StudentFormSubmissionService,
  ) {
    this.data = this.loadDraft();
  }

  ngOnDestroy(): void {
    clearTimeout(this.saveTimer);
    if (this.hasPendingChanges) {
      this.saveDraft();
    }
    this.revokePhotoPreview();
  }

  @HostListener('window:beforeunload')
  onBeforeUnload(): void {
    if (this.hasPendingChanges) {
      this.saveDraft();
    }
  }

  trackByIndex(index: number): number {
    return index;
  }

  onPhotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    this.revokePhotoPreview();
    this.photo = file;
    this.photoPreview = file ? URL.createObjectURL(file) : '';
  }

  scheduleSave(): void {
    this.hasPendingChanges = true;
    clearTimeout(this.saveTimer);
    this.saveTimer = setTimeout(() => this.saveDraft(), 250);
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

  async sendForm(form: NgForm): Promise<void> {
    this.submissionMessage = '';
    this.submissionId = '';

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
      const result = await this.submissionService.submit(this.data, this.photo);
      this.submissionId = result.submissionId;
      this.submissionMessage = result.driveSaved
        ? `Hồ sơ đã được lưu vào Google Drive VieJap. Mã hồ sơ: ${result.submissionId}.`
        : `Hồ sơ đã được lưu dự phòng trên máy chủ nhưng chưa đồng bộ được Google Drive. Mã hồ sơ: ${result.submissionId}.`;
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

    requestAnimationFrame(() => {
      document.querySelector<HTMLElement>('.ng-invalid[required]')?.focus();
    });
    return false;
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
      this.draftMessage = `Đã tự động lưu lúc ${new Intl.DateTimeFormat('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
      }).format(new Date())}.`;
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
