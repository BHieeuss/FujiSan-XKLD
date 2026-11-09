import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { AdminPaginationComponent } from '../shared/admin-pagination/admin-pagination.component';
import { StudentFormExcelService } from '../../../tools/student-form/student-form-excel.service';
import { StudentFormPdfService } from '../../../tools/student-form/student-form-pdf.service';
import {
  BloodType,
  createStudentFormData,
  EducationEntry,
  Eyesight,
  FamilyEntry,
  Handedness,
  LivingStatus,
  MaritalStatus,
  StudentFormData,
  WorkEntry,
  YesNo,
} from '../../../tools/student-form/student-form.model';
import {
  STUDENT_PROFILE_STATUS_MAP,
  StudentProfileDetail,
  StudentProfileFile,
  StudentProfileFilters,
  StudentProfileStatus,
  StudentProfileSummary,
} from './student-profiles-admin.models';
import { StudentProfilesAdminService } from './student-profiles-admin.service';
import { AdminAuthService } from '../../services/admin-auth.service';

@Component({
  selector: 'app-student-profiles-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, AdminPaginationComponent],
  templateUrl: './student-profiles-admin.component.html',
  styleUrl: './student-profiles-admin.component.scss',
})
export class StudentProfilesAdminComponent implements OnInit, OnDestroy {
  readonly statusMap = STUDENT_PROFILE_STATUS_MAP;

  viewMode: 'active' | 'trash' = 'active';
  trashCount = 0;
  showTrashConfirmModal = false;
  profileToTrash?: StudentProfileSummary;
  showDeletePermanentModal = false;
  profileToDeletePermanent?: StudentProfileSummary;
  showEmptyTrashModal = false;
  isProcessingTrash = false;

  get canDelete(): boolean {
    return this.auth.hasPermission('students.delete');
  }

  get canRestore(): boolean {
    return this.auth.hasPermission('students.restore');
  }

  profiles: StudentProfileSummary[] = [];
  selectedProfile?: StudentProfileDetail;

  activeTab: 'info' | 'files' | 'logs' = 'info';

  filters: StudentProfileFilters = {
    search: '',
    status: 'all',
    from_date: '',
    to_date: '',
    sort: 'newest',
  };

  currentPage = 1;
  pageSize = 10;
  totalItems = 0;

  loading = false;
  actionLoading = false;
  reexporting = false;
  exportingPdf = false;
  errorMessage = '';
  successMessage = '';

  // Edit Modal State - 100% of StudentFormData fields supported
  showEditModal = false;
  editActiveTab:
    | 'personal'
    | 'health'
    | 'personality'
    | 'plans'
    | 'education'
    | 'work'
    | 'family'
    | 'media' = 'personal';

  editForm: StudentFormData & { status: StudentProfileStatus } = {
    ...createStudentFormData(),
    status: 'tiep_nhan',
  };

  uploadingPhoto = false;
  uploadingDoc = false;
  deletingFileId: string | null = null;
  modalSuccessMessage = '';
  modalErrorMessage = '';

  // Preview Modal
  showPreviewModal = false;
  previewLoading = false;
  previewUrl?: SafeResourceUrl;
  currentBlobUrl = '';
  previewFileName = '';
  previewFileType = '';

  // Cấp mã bổ sung hồ sơ
  showSupplementCodeModal = false;
  generatingSupplementCode = false;
  supplementCodeData?: {
    code: string;
    studentName: string;
    studentCode: string;
    expiresAt: string;
    directUrl: string;
  };
  copiedCode = false;
  copiedLink = false;

  constructor(
    private readonly service: StudentProfilesAdminService,
    private readonly auth: AdminAuthService,
    private readonly excelService: StudentFormExcelService,
    private readonly pdfService: StudentFormPdfService,
    private readonly sanitizer: DomSanitizer,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadProfiles();
  }

  ngOnDestroy(): void {
    if (this.currentBlobUrl) {
      URL.revokeObjectURL(this.currentBlobUrl);
      this.currentBlobUrl = '';
    }
  }

  async loadProfiles(page: number = this.currentPage): Promise<void> {
    this.loading = true;
    this.errorMessage = '';
    this.currentPage = page;
    try {
      const result = await this.service.getProfiles(this.filters, this.currentPage, this.pageSize);
      this.profiles = result.profiles;
      this.totalItems = result.total;
      this.currentPage = result.page;
      this.trashCount = result.trashCount;
      if (this.filters.status === "trash") {
        this.viewMode = "trash";
      }
    } catch (error) {
      console.error(error);
      this.errorMessage = error instanceof Error ? error.message : 'Không thể tải danh sách hồ sơ.';
    } finally {
      this.loading = false;
    }
  }

  onPageChange(page: number): void {
    void this.loadProfiles(page);
  }

  onFiltersChange(): void {
    this.currentPage = 1;
    void this.loadProfiles(1);
  }

  async selectProfile(id: string): Promise<void> {
    this.actionLoading = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.activeTab = 'info';
    try {
      this.selectedProfile = await this.service.getProfile(id);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      console.error(error);
      this.errorMessage = error instanceof Error ? error.message : 'Không thể xem chi tiết hồ sơ.';
    } finally {
      this.actionLoading = false;
    }
  }

  backToList(): void {
    this.selectedProfile = undefined;
    this.successMessage = '';
    this.errorMessage = '';
    this.loadProfiles();
  }

  setTab(tab: 'info' | 'files' | 'logs'): void {
    this.activeTab = tab;
  }

  async onStatusChange(newStatus: StudentProfileStatus): Promise<void> {
    if (!this.selectedProfile || this.selectedProfile.status === newStatus) {
      return;
    }

    this.actionLoading = true;
    this.errorMessage = '';
    this.successMessage = '';
    try {
      const updated = await this.service.updateProfile(this.selectedProfile.id, {
        status: newStatus,
      });
      this.selectedProfile = updated;
      this.successMessage = `Đã cập nhật trạng thái hồ sơ sang "${this.statusMap[newStatus]?.label}".`;
    } catch (error) {
      console.error(error);
      this.errorMessage = error instanceof Error ? error.message : 'Không thể cập nhật trạng thái.';
    } finally {
      this.actionLoading = false;
    }
  }

  openEditModal(tab?: 'personal' | 'health' | 'personality' | 'plans' | 'education' | 'work' | 'family' | 'media'): void {
    if (!this.selectedProfile) return;
    this.editActiveTab = tab || 'personal';
    this.modalSuccessMessage = '';
    this.modalErrorMessage = '';
    const p = this.selectedProfile;
    const defaults = createStudentFormData();
    const d = (p.data || {}) as Partial<StudentFormData>;

    this.editForm = {
      formDate: d.formDate || defaults.formDate,
      fullName: p.fullName || d.fullName || '',
      birthDate: p.birthDate || d.birthDate || '',
      idNumber: p.idNumber || d.idNumber || '',
      idIssueDate: d.idIssueDate || '',
      maritalStatus: d.maritalStatus || 'single',
      address: p.address || d.address || '',
      phone: p.phone || d.phone || '',
      relativePhone: d.relativePhone || '',
      eyesight: d.eyesight || 'no-glasses',
      handedness: d.handedness || 'right',
      colorBlind: d.colorBlind || 'no',
      limbDisability: d.limbDisability || 'no',
      height: d.height || '',
      weight: d.weight || '',
      surgery: d.surgery || 'no',
      bloodType: d.bloodType || 'A',
      tattoo: d.tattoo || 'no',
      familyMedicalHistory: d.familyMedicalHistory || 'no',
      alcohol: d.alcohol || 'no',
      smoking: d.smoking || 'no',
      religion: d.religion || '',
      trainedSpecialty: d.trainedSpecialty || '',
      strengths: d.strengths || '',
      weaknesses: d.weaknesses || '',
      hobbies: d.hobbies || '',
      collectiveLiving: d.collectiveLiving || 'yes',
      canCook: d.canCook || 'yes',
      selfAssessment: d.selfAssessment || '',
      personalIncome: d.personalIncome || '',
      familyIncome: d.familyIncome || '',
      reasonJapan: d.reasonJapan || '',
      savingsGoal: d.savingsGoal || '',
      futurePlan: d.futurePlan || '',
      abroadBefore: d.abroadBefore || 'no',
      abroadCountry: d.abroadCountry || '',
      abroadYear: d.abroadYear || '',
      visaApplied: d.visaApplied || 'no',
      studiedLate: Boolean(d.studiedLate),
      studiedEarly: Boolean(d.studiedEarly),
      repeatedGrade: Boolean(d.repeatedGrade),
      studyStatusYear: d.studyStatusYear || '',
      familyConsent: d.familyConsent || 'yes',
      familyJapanHistory: d.familyJapanHistory || '',
      education: Array.isArray(d.education) && d.education.length > 0
        ? d.education.map((e) => ({ ...e }))
        : Array.from({ length: 3 }, () => ({ from: '', to: '', school: '', major: '' })),
      workHistory: Array.isArray(d.workHistory) && d.workHistory.length > 0
        ? d.workHistory.map((w) => ({ ...w }))
        : Array.from({ length: 2 }, () => ({ from: '', to: '', company: '', job: '' })),
      family: Array.isArray(d.family) && d.family.length > 0
        ? d.family.map((f) => ({ ...f }))
        : Array.from({ length: 3 }, () => ({
            fullName: '',
            relationship: '',
            birthYear: '',
            occupation: '',
            livingStatus: 'together' as LivingStatus,
          })),
      status: p.status || 'tiep_nhan',
    };
    this.showEditModal = true;
  }

  closeEditModal(): void {
    this.showEditModal = false;
    this.modalSuccessMessage = '';
    this.modalErrorMessage = '';
  }

  setEditTab(tab: 'personal' | 'health' | 'personality' | 'plans' | 'education' | 'work' | 'family' | 'media'): void {
    this.editActiveTab = tab;
  }

  addEducationRow(): void {
    this.editForm.education.push({ from: '', to: '', school: '', major: '' });
  }

  removeEducationRow(index: number): void {
    if (this.editForm.education.length > 1) {
      this.editForm.education.splice(index, 1);
    } else {
      this.editForm.education[0] = { from: '', to: '', school: '', major: '' };
    }
  }

  addWorkRow(): void {
    this.editForm.workHistory.push({ from: '', to: '', company: '', job: '' });
  }

  removeWorkRow(index: number): void {
    if (this.editForm.workHistory.length > 1) {
      this.editForm.workHistory.splice(index, 1);
    } else {
      this.editForm.workHistory[0] = { from: '', to: '', company: '', job: '' };
    }
  }

  addFamilyRow(): void {
    this.editForm.family.push({
      fullName: '',
      relationship: '',
      birthYear: '',
      occupation: '',
      livingStatus: 'together',
    });
  }

  removeFamilyRow(index: number): void {
    if (this.editForm.family.length > 1) {
      this.editForm.family.splice(index, 1);
    } else {
      this.editForm.family[0] = {
        fullName: '',
        relationship: '',
        birthYear: '',
        occupation: '',
        livingStatus: 'together',
      };
    }
  }

  async onAdminPhotoChange(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0 || !this.selectedProfile) return;
    const file = input.files[0];
    this.uploadingPhoto = true;
    this.modalErrorMessage = '';
    this.modalSuccessMessage = '';
    this.errorMessage = '';
    try {
      const res = await this.service.uploadFile(this.selectedProfile.id, 'photo', file);
      this.selectedProfile = res.profile;
      this.updateProfileInList(res.profile);
      this.modalSuccessMessage = `Đã cập nhật ảnh thẻ mới (${res.fileName}) thành công!`;
      this.successMessage = `Đã cập nhật ảnh thẻ mới cho học viên ${this.selectedProfile.fullName}.`;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Không thể tải ảnh thẻ lên.';
      this.modalErrorMessage = msg;
      this.errorMessage = msg;
    } finally {
      this.uploadingPhoto = false;
      input.value = '';
      this.cdr.markForCheck();
    }
  }

  async onAdminDocChange(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0 || !this.selectedProfile) return;
    const file = input.files[0];
    this.uploadingDoc = true;
    this.modalErrorMessage = '';
    this.modalSuccessMessage = '';
    this.errorMessage = '';
    try {
      const res = await this.service.uploadFile(this.selectedProfile.id, 'document', file);
      this.selectedProfile = res.profile;
      this.updateProfileInList(res.profile);
      this.modalSuccessMessage = `Đã tải lên tài liệu bổ sung (${res.fileName}) thành công!`;
      this.successMessage = `Đã tải lên tài liệu mới cho học viên ${this.selectedProfile.fullName}.`;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Không thể tải tài liệu lên.';
      this.modalErrorMessage = msg;
      this.errorMessage = msg;
    } finally {
      this.uploadingDoc = false;
      input.value = '';
      this.cdr.markForCheck();
    }
  }

  async deleteFile(file: StudentProfileFile, event?: Event): Promise<void> {
    if (event) event.stopPropagation();
    if (!this.selectedProfile || this.deletingFileId) return;

    const confirmMsg =
      file.fileType === 'photo'
        ? `Bạn có chắc chắn muốn xóa ảnh thẻ "${file.fileName}" không?`
        : `Bạn có chắc chắn muốn xóa tệp "${file.fileName}" không?`;

    if (!window.confirm(confirmMsg)) {
      return;
    }

    this.deletingFileId = file.id;
    this.modalErrorMessage = '';
    this.modalSuccessMessage = '';
    this.errorMessage = '';

    try {
      const res = await this.service.deleteFile(this.selectedProfile.id, file.id);
      this.selectedProfile = res.profile;
      this.updateProfileInList(res.profile);
      this.modalSuccessMessage = `Đã xóa tệp "${file.fileName}" thành công.`;
      this.successMessage = `Đã xóa tệp "${file.fileName}" của học viên ${this.selectedProfile.fullName}.`;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Không thể xóa tệp tin.';
      this.modalErrorMessage = msg;
      this.errorMessage = msg;
    } finally {
      this.deletingFileId = null;
      this.cdr.markForCheck();
    }
  }

  async saveEdit(): Promise<void> {
    if (!this.selectedProfile) return;

    this.actionLoading = true;
    this.errorMessage = '';
    try {
      const cleanEducation = (this.editForm.education || []).filter(
        (e) => e.school?.trim() || e.from?.trim() || e.to?.trim() || e.major?.trim(),
      );
      const cleanWork = (this.editForm.workHistory || []).filter(
        (w) => w.company?.trim() || w.from?.trim() || w.to?.trim() || w.job?.trim(),
      );
      const cleanFamily = (this.editForm.family || []).filter(
        (f) => f.fullName?.trim() || f.relationship?.trim(),
      );

      const updatedData: StudentFormData = {
        formDate: this.editForm.formDate || new Date().toISOString().slice(0, 10),
        fullName: String(this.editForm.fullName || '').trim(),
        birthDate: this.editForm.birthDate || '',
        idNumber: String(this.editForm.idNumber || '').trim(),
        idIssueDate: this.editForm.idIssueDate || '',
        maritalStatus: this.editForm.maritalStatus || 'single',
        address: String(this.editForm.address || '').trim(),
        phone: String(this.editForm.phone || '').trim(),
        relativePhone: String(this.editForm.relativePhone || '').trim(),
        eyesight: this.editForm.eyesight || 'no-glasses',
        handedness: this.editForm.handedness || 'right',
        colorBlind: this.editForm.colorBlind || 'no',
        limbDisability: this.editForm.limbDisability || 'no',
        height: String(this.editForm.height ?? '').trim(),
        weight: String(this.editForm.weight ?? '').trim(),
        surgery: this.editForm.surgery || 'no',
        bloodType: this.editForm.bloodType || 'A',
        tattoo: this.editForm.tattoo || 'no',
        familyMedicalHistory: this.editForm.familyMedicalHistory || 'no',
        alcohol: this.editForm.alcohol || 'no',
        smoking: this.editForm.smoking || 'no',
        religion: String(this.editForm.religion || '').trim(),
        trainedSpecialty: String(this.editForm.trainedSpecialty || '').trim(),
        strengths: String(this.editForm.strengths || '').trim(),
        weaknesses: String(this.editForm.weaknesses || '').trim(),
        hobbies: String(this.editForm.hobbies || '').trim(),
        collectiveLiving: this.editForm.collectiveLiving || 'yes',
        canCook: this.editForm.canCook || 'yes',
        selfAssessment: String(this.editForm.selfAssessment || '').trim(),
        personalIncome: String(this.editForm.personalIncome || '').trim(),
        familyIncome: String(this.editForm.familyIncome || '').trim(),
        reasonJapan: String(this.editForm.reasonJapan || '').trim(),
        savingsGoal: String(this.editForm.savingsGoal || '').trim(),
        futurePlan: String(this.editForm.futurePlan || '').trim(),
        abroadBefore: this.editForm.abroadBefore || 'no',
        abroadCountry: String(this.editForm.abroadCountry || '').trim(),
        abroadYear: String(this.editForm.abroadYear || '').trim(),
        visaApplied: this.editForm.visaApplied || 'no',
        studiedLate: Boolean(this.editForm.studiedLate),
        studiedEarly: Boolean(this.editForm.studiedEarly),
        repeatedGrade: Boolean(this.editForm.repeatedGrade),
        studyStatusYear: String(this.editForm.studyStatusYear || '').trim(),
        familyConsent: this.editForm.familyConsent || 'yes',
        familyJapanHistory: String(this.editForm.familyJapanHistory || '').trim(),
        education: cleanEducation,
        workHistory: cleanWork,
        family: cleanFamily,
      };

      const updated = await this.service.updateProfile(this.selectedProfile.id, {
        fullName: updatedData.fullName,
        birthDate: updatedData.birthDate,
        phone: updatedData.phone,
        idNumber: updatedData.idNumber,
        address: updatedData.address,
        status: this.editForm.status,
        data: updatedData,
      });

      this.selectedProfile = updated;
      this.updateProfileInList(updated);
      this.showEditModal = false;
      this.successMessage = 'Đã cập nhật toàn bộ 100% các trường thông tin hồ sơ học viên thành công.';
    } catch (error) {
      console.error(error);
      this.errorMessage = error instanceof Error ? error.message : 'Không thể lưu thông tin hồ sơ.';
    } finally {
      this.actionLoading = false;
    }
  }

  async reexportExcel(): Promise<void> {
    if (!this.selectedProfile || this.reexporting) return;

    this.reexporting = true;
    this.errorMessage = '';
    this.successMessage = '';

    try {
      // Build clean Excel workbook from updated database data
      const dataToExport = this.selectedProfile.data;
      const workbook = await this.excelService.build(dataToExport);

      // Upload newly created version to server
      const result = await this.service.uploadExcelVersion(
        this.selectedProfile.id,
        workbook.blob,
        workbook.filename,
      );

      this.selectedProfile = result.profile;
      this.activeTab = 'files';

      // Automatically trigger download for admin's device
      const downloadName = `SO_YEU_LY_LICH_${this.getSafeName(this.selectedProfile.fullName)}_v${result.newVersion}.xlsx`;
      this.downloadBlob(workbook.blob, downloadName);

      this.successMessage = `Đã xuất lại file Excel phiên bản v${result.newVersion} thành công và tự động tải về máy.`;
    } catch (error) {
      console.error(error);
      this.errorMessage =
        error instanceof Error ? error.message : 'Không thể xuất lại file Excel hồ sơ.';
    } finally {
      this.reexporting = false;
    }
  }

  async exportPdf(): Promise<void> {
    if (!this.selectedProfile || this.exportingPdf) return;

    this.exportingPdf = true;
    this.errorMessage = '';
    this.successMessage = '';

    try {
      const dataToExport = this.selectedProfile.data;
      // Find photo file if present
      const photoFile = (this.selectedProfile.files || []).find((f) => f.fileType === 'photo');
      let photoDataUrl = '';
      if (photoFile) {
        try {
          const blob = await this.service.fetchFileBlob(this.selectedProfile.id, photoFile.id);
          photoDataUrl = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve((reader.result as string) || '');
            reader.onerror = () => resolve('');
            reader.readAsDataURL(blob);
          });
        } catch {
          // Continue without photo if fetch fails
        }
      }

      const pdf = await this.pdfService.build(dataToExport, photoDataUrl);
      this.downloadBlob(pdf.blob, pdf.filename);
      this.successMessage = `Đã xuất file PDF sơ yếu lý lịch 1 trang A4 (${pdf.filename}) thành công!`;
    } catch (error) {
      console.error(error);
      this.errorMessage =
        error instanceof Error ? error.message : 'Không thể xuất file PDF hồ sơ học viên.';
    } finally {
      this.exportingPdf = false;
    }
  }

  downloadFile(file: StudentProfileFile): void {
    if (!this.selectedProfile) return;
    const url = this.service.getDownloadUrl(this.selectedProfile.id, file.id);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = file.fileName;
    anchor.style.display = 'none';
    document.body.appendChild(anchor);
    anchor.click();
    window.setTimeout(() => anchor.remove(), 10_000);
  }

  async previewFile(file: StudentProfileFile): Promise<void> {
    if (!this.selectedProfile) return;
    this.previewFileName = file.fileName;
    this.previewFileType = file.fileType;
    this.previewLoading = true;
    this.showPreviewModal = true;
    this.previewUrl = undefined;

    try {
      const blob = await this.service.fetchFileBlob(this.selectedProfile.id, file.id);
      if (this.currentBlobUrl) {
        URL.revokeObjectURL(this.currentBlobUrl);
      }

      // Ensure proper MIME type for PDF preview in iframe or image
      const isPdf =
        file.fileType === 'pdf' ||
        file.fileType === 'document' ||
        file.fileName.toLowerCase().endsWith('.pdf');

      const isPhoto =
        file.fileType === 'photo' ||
        file.fileName.toLowerCase().endsWith('.png') ||
        file.fileName.toLowerCase().endsWith('.jpg') ||
        file.fileName.toLowerCase().endsWith('.jpeg');

      let finalBlob = blob;
      if (isPdf && blob.type !== 'application/pdf') {
        finalBlob = new Blob([blob], { type: 'application/pdf' });
      } else if (isPhoto && !blob.type.startsWith('image/')) {
        const ext = file.fileName.split('.').pop()?.toLowerCase() || 'png';
        finalBlob = new Blob([blob], { type: `image/${ext === 'jpg' ? 'jpeg' : ext}` });
      }

      this.currentBlobUrl = URL.createObjectURL(finalBlob);
      this.previewUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.currentBlobUrl);
    } catch (error) {
      console.error(error);
      this.errorMessage = 'Không thể tải file để xem trước.';
      this.closePreviewModal();
    } finally {
      this.previewLoading = false;
    }
  }

  isPdfPreview(): boolean {
    const name = (this.previewFileName || '').toLowerCase();
    return (
      this.previewFileType === 'pdf' ||
      this.previewFileType === 'document' ||
      name.endsWith('.pdf')
    );
  }

  isPhotoPreview(): boolean {
    const name = (this.previewFileName || '').toLowerCase();
    return (
      this.previewFileType === 'photo' ||
      name.endsWith('.png') ||
      name.endsWith('.jpg') ||
      name.endsWith('.jpeg') ||
      name.endsWith('.webp')
    );
  }

  closePreviewModal(): void {
    this.showPreviewModal = false;
    this.previewUrl = undefined;
    this.previewLoading = false;
    if (this.currentBlobUrl) {
      URL.revokeObjectURL(this.currentBlobUrl);
      this.currentBlobUrl = '';
    }
  }


  switchViewMode(mode: 'active' | 'trash'): void {
    this.viewMode = mode;
    this.filters.status = mode === 'trash' ? 'trash' : 'all';
    this.currentPage = 1;
    void this.loadProfiles(1);
  }

  openTrashConfirmModal(profile: StudentProfileSummary, event?: Event): void {
    if (event) event.stopPropagation();
    this.profileToTrash = profile;
    this.showTrashConfirmModal = true;
  }

  closeTrashConfirmModal(): void {
    this.showTrashConfirmModal = false;
    this.profileToTrash = undefined;
  }

  async confirmMoveToTrash(): Promise<void> {
    if (!this.profileToTrash || this.isProcessingTrash) return;
    this.isProcessingTrash = true;
    this.errorMessage = '';
    this.successMessage = '';
    try {
      const res = await this.service.moveToTrash(this.profileToTrash.id);
      this.trashCount = res.trashCount;
      this.successMessage = `Đã chuyển hồ sơ học viên ${this.profileToTrash.fullName} vào thùng rác (tự động xóa sau 30 ngày).`;
      const trashedId = this.profileToTrash.id;
      this.closeTrashConfirmModal();
      if (this.selectedProfile && this.selectedProfile.id === trashedId) {
        this.selectedProfile.status = 'trash';
      }
      await this.loadProfiles(this.currentPage);
    } catch (err) {
      this.errorMessage = err instanceof Error ? err.message : 'Không thể chuyển hồ sơ vào thùng rác.';
    } finally {
      this.isProcessingTrash = false;
    }
  }

  openDeletePermanentModal(profile: StudentProfileSummary, event?: Event): void {
    if (event) event.stopPropagation();
    this.profileToDeletePermanent = profile;
    this.showDeletePermanentModal = true;
  }

  closeDeletePermanentModal(): void {
    this.showDeletePermanentModal = false;
    this.profileToDeletePermanent = undefined;
  }

  async confirmDeletePermanent(): Promise<void> {
    if (!this.profileToDeletePermanent || this.isProcessingTrash) return;
    this.isProcessingTrash = true;
    this.errorMessage = '';
    this.successMessage = '';
    try {
      const res = await this.service.deletePermanent(this.profileToDeletePermanent.id);
      this.trashCount = res.trashCount;
      this.successMessage = `Đã xóa vĩnh viễn hồ sơ học viên ${this.profileToDeletePermanent.fullName} và toàn bộ tài liệu liên quan.`;
      const deletedId = this.profileToDeletePermanent.id;
      this.closeDeletePermanentModal();
      if (this.selectedProfile && this.selectedProfile.id === deletedId) {
        this.selectedProfile = undefined;
      }
      await this.loadProfiles(this.currentPage);
    } catch (err) {
      this.errorMessage = err instanceof Error ? err.message : 'Không thể xóa vĩnh viễn hồ sơ.';
    } finally {
      this.isProcessingTrash = false;
    }
  }

  async restoreProfile(profile: StudentProfileSummary, event?: Event): Promise<void> {
    if (event) event.stopPropagation();
    if (this.isProcessingTrash) return;
    this.isProcessingTrash = true;
    this.errorMessage = '';
    this.successMessage = '';
    try {
      const res = await this.service.restoreProfile(profile.id);
      this.trashCount = res.trashCount;
      this.successMessage = `Đã khôi phục thành công hồ sơ học viên ${profile.fullName}.`;
      if (this.selectedProfile && this.selectedProfile.id === profile.id) {
        this.selectedProfile = res.profile;
      }
      await this.loadProfiles(this.currentPage);
    } catch (err) {
      this.errorMessage = err instanceof Error ? err.message : 'Không thể khôi phục hồ sơ.';
    } finally {
      this.isProcessingTrash = false;
    }
  }

  openEmptyTrashModal(): void {
    this.showEmptyTrashModal = true;
  }

  closeEmptyTrashModal(): void {
    this.showEmptyTrashModal = false;
  }

  async confirmEmptyTrash(): Promise<void> {
    if (this.isProcessingTrash) return;
    this.isProcessingTrash = true;
    this.errorMessage = '';
    this.successMessage = '';
    try {
      const res = await this.service.emptyTrash();
      this.trashCount = 0;
      this.successMessage = res.message;
      this.closeEmptyTrashModal();
      if (this.selectedProfile && this.selectedProfile.status === 'trash') {
        this.selectedProfile = undefined;
      }
      await this.loadProfiles(1);
    } catch (err) {
      this.errorMessage = err instanceof Error ? err.message : 'Không thể dọn sạch thùng rác.';
    } finally {
      this.isProcessingTrash = false;
    }
  }

  formatFileSize(bytes: number): string {
    if (!bytes || bytes <= 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  getExcelFiles(): StudentProfileFile[] {
    return (this.selectedProfile?.files || [])
      .filter((f) => f.fileType === 'excel')
      .sort((a, b) => (b.version || 0) - (a.version || 0));
  }

  getPdfFiles(): StudentProfileFile[] {
    return (this.selectedProfile?.files || [])
      .filter(
        (f) =>
          f.fileType === 'pdf' ||
          f.fileType === 'document' ||
          f.fileName.toLowerCase().endsWith('.pdf'),
      )
      .sort((a, b) => (b.version || 0) - (a.version || 0));
  }

  getPhotoFiles(): StudentProfileFile[] {
    return (this.selectedProfile?.files || [])
      .filter((f) => f.fileType === 'photo')
      .sort((a, b) => (b.version || 0) - (a.version || 0));
  }

  getLatestPhoto(): StudentProfileFile | undefined {
    const photos = this.getPhotoFiles();
    return photos.length > 0 ? photos[0] : undefined;
  }

  getPhotoUrl(file: StudentProfileFile): string {
    if (!this.selectedProfile) return '';
    return `${this.service.getDownloadUrl(this.selectedProfile.id, file.id)}&preview=1`;
  }

  async openSupplementCodeModal(profile?: StudentProfileDetail | StudentProfileSummary, event?: Event): Promise<void> {
    if (event) {
      event.stopPropagation();
    }
    const target = profile || this.selectedProfile;
    if (!target) return;

    this.generatingSupplementCode = true;
    this.copiedCode = false;
    this.copiedLink = false;
    this.supplementCodeData = undefined;
    this.showSupplementCodeModal = true;

    try {
      const res = await this.service.createSupplementCode(target.id);
      this.supplementCodeData = {
        code: res.code,
        studentName: res.studentName || target.fullName,
        studentCode: res.studentCode || target.studentCode,
        expiresAt: res.expiresAt,
        directUrl: window.location.origin + (res.directUrl || `/student-form?code=${res.code}`),
      };
      this.cdr.detectChanges();
    } catch (err: unknown) {
      this.errorMessage = (err as Error)?.message || 'Không thể tạo mã bổ sung hồ sơ.';
      this.closeSupplementCodeModal();
    } finally {
      this.generatingSupplementCode = false;
      this.cdr.detectChanges();
    }
  }

  closeSupplementCodeModal(): void {
    this.showSupplementCodeModal = false;
    this.supplementCodeData = undefined;
    this.copiedCode = false;
    this.copiedLink = false;
  }

  async copySupplementCode(): Promise<void> {
    if (!this.supplementCodeData?.code) return;
    try {
      await navigator.clipboard.writeText(this.supplementCodeData.code);
      this.copiedCode = true;
      setTimeout(() => { this.copiedCode = false; }, 3000);
    } catch {
      // fallback
    }
  }

  async copySupplementLink(): Promise<void> {
    if (!this.supplementCodeData?.directUrl) return;
    try {
      await navigator.clipboard.writeText(this.supplementCodeData.directUrl);
      this.copiedLink = true;
      setTimeout(() => { this.copiedLink = false; }, 3000);
    } catch {
      // fallback
    }
  }

  private updateProfileInList(updated: StudentProfileDetail): void {
    const idx = this.profiles.findIndex((p) => p.id === updated.id);
    if (idx !== -1) {
      this.profiles[idx] = {
        ...this.profiles[idx],
        fullName: updated.fullName,
        birthDate: updated.birthDate,
        phone: updated.phone,
        idNumber: updated.idNumber,
        address: updated.address,
        status: updated.status,
        updatedAt: updated.updatedAt,
      };
    }
  }

  private downloadBlob(blob: Blob, filename: string): void {
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

  private getSafeName(fullName: string): string {
    return (
      fullName
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-zA-Z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '')
        .toUpperCase() || 'HOC_VIEN'
    );
  }
}
