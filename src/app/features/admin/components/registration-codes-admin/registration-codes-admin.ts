import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import QRCode from 'qrcode';
import { AdminPaginationComponent } from '../shared/admin-pagination/admin-pagination.component';
import { AdminAuthService } from '../../services/admin-auth.service';
import { AdminDataService, AdminUserItem } from '../../services/admin-data.service';
import { ScrollNavigationService } from '../../../../core/services/scroll-navigation.service';
import {
  StudentRegistrationAdminService,
  StudentRegistrationCodeItem,
  StudentRegistrationStats,
  BulkCreateResult,
} from '../../services/student-registration-admin.service';

@Component({
  selector: 'app-registration-codes-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, AdminPaginationComponent],
  templateUrl: './registration-codes-admin.html',
  styleUrls: ['./registration-codes-admin.scss'],
})
export class RegistrationCodesAdminComponent implements OnInit {
  private readonly regService = inject(StudentRegistrationAdminService);
  private readonly dataService = inject(AdminDataService);
  private readonly scrollNav = inject(ScrollNavigationService);
  private readonly router = inject(Router);
  readonly auth = inject(AdminAuthService);

  // Core Data Signals
  stats = signal<StudentRegistrationStats | null>(null);
  codes = signal<StudentRegistrationCodeItem[]>([]);
  staffUsers = signal<AdminUserItem[]>([]);
  isLoading = signal<boolean>(false);
  actionToast = signal<string>('');

  // Pagination & Filters
  currentPage = 1;
  readonly pageSize = 10;
  total = 0;
  totalPages = 1;

  searchTerm = '';
  statusFilter = 'all';
  progressFilter = 'all';
  assignedFilter = 'all';

  // Modal: Create Single Code
  showCreateModal = false;
  newStudentName = '';
  newPhone = '';
  newEmail = '';
  newNotes = '';
  newAssignedTo = '';
  newValidityHours = 72; // default 3 days
  isCreating = false;
  createError = '';

  // Modal: View Single Code & QR
  showViewModal = false;
  selectedCode: StudentRegistrationCodeItem | null = null;
  qrDataUrl = '';
  copyToast = signal<string>('');

  // Modal: Bulk Create Codes
  showBulkModal = false;
  bulkInputText = '';
  bulkAssignedTo = '';
  isBulkCreating = false;
  bulkResult: BulkCreateResult | null = null;

  // Modal: Progress & Draft Review
  showProgressModal = false;
  selectedProgressCode: StudentRegistrationCodeItem | null = null;

  // Modal: Revoke Code
  showRevokeModal = false;
  codeToRevoke: StudentRegistrationCodeItem | null = null;
  revokeReason = 'Học viên hủy hoặc thay đổi kế hoạch';
  isRevoking = false;

  // Modal: Delete Code
  showDeleteModal = false;
  codeToDelete: StudentRegistrationCodeItem | null = null;
  isDeleting = false;

  // Modal: Audit & History
  showHistoryModal = false;
  historyLogs = signal<any[]>([]);
  isLoadingHistory = false;

  // Permission Getters
  get canView(): boolean {
    return this.auth.hasPermission('student_registration_codes.view');
  }
  get canCreate(): boolean {
    return this.auth.hasPermission('student_registration_codes.create');
  }
  get canCreateBulk(): boolean {
    return this.auth.hasPermission('student_registration_codes.create_bulk');
  }
  get canRevoke(): boolean {
    return this.auth.hasPermission('student_registration_codes.revoke');
  }
  get canReissue(): boolean {
    return this.auth.hasPermission('student_registration_codes.reissue');
  }
  get canExport(): boolean {
    return this.auth.hasPermission('student_registration_codes.export');
  }
  get canViewHistory(): boolean {
    return this.auth.hasPermission('student_registration_codes.view_history');
  }
  get canManage(): boolean {
    return this.auth.hasPermission('student_registration_codes.manage');
  }
  get canDelete(): boolean {
    return (
      this.auth.hasPermission('student_registration_codes.delete') ||
      this.auth.hasPermission('student_registration_codes.manage')
    );
  }
  get canViewProgress(): boolean {
    return this.auth.hasPermission('student_registration_progress.view');
  }
  get canManageProgress(): boolean {
    return this.auth.hasPermission('student_registration_progress.manage');
  }

  ngOnInit(): void {
    void this.loadStaff();
    void this.loadData();
  }

  async loadStaff(): Promise<void> {
    try {
      const users = await this.dataService.getUsers();
      this.staffUsers.set(users.filter(u => u.isActive !== false));
    } catch {
      // Ignored
    }
  }

  async loadData(): Promise<void> {
    if (!this.canView) return;
    this.isLoading.set(true);
    try {
      // Load stats and paged codes in parallel
      const [statsRes, listRes] = await Promise.all([
        this.regService.getStats(),
        this.regService.getCodes({
          search: this.searchTerm.trim(),
          status: this.statusFilter,
          progressStatus: this.progressFilter,
          assignedTo: this.assignedFilter,
          page: this.currentPage,
          pageSize: this.pageSize,
        }),
      ]);
      this.stats.set(statsRes);
      this.codes.set(listRes.codes || (listRes as any).items || []);
      this.total = listRes.total;
      this.totalPages = listRes.totalPages;
    } catch (err: any) {
      this.showToast(err.message || 'Không thể tải danh sách mã đăng ký', 'danger');
    } finally {
      this.isLoading.set(false);
    }
  }

  onFilterChange(): void {
    this.currentPage = 1;
    void this.loadData().then(() => {
      this.scrollNav.scrollToTableOrList('.admin-data-table, .codes-table-card', 450);
    });
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    void this.loadData().then(() => {
      this.scrollNav.scrollToTableOrList('.admin-data-table, .codes-table-card');
    });
  }

  // --- MODAL: CREATE CODE ---
  openCreateModal(): void {
    if (!this.canCreate) return;
    this.newStudentName = '';
    this.newPhone = '';
    this.newEmail = '';
    this.newNotes = '';
    this.newAssignedTo = '';
    this.newValidityHours = 72;
    this.createError = '';
    this.showCreateModal = true;
  }

  closeCreateModal(): void {
    this.showCreateModal = false;
  }

  async submitCreateCode(): Promise<void> {
    if (!this.newStudentName.trim()) {
      this.createError = 'Vui lòng nhập họ và tên học viên.';
      return;
    }

    this.isCreating = true;
    this.createError = '';
    try {
      const assignedUser = this.staffUsers().find(u => u.userId === this.newAssignedTo);
      const created = await this.regService.createCode({
        studentName: this.newStudentName.trim(),
        phone: this.newPhone.trim(),
        email: this.newEmail.trim(),
        notes: this.newNotes.trim(),
        assignedTo: this.newAssignedTo,
        assignedStaffName: assignedUser ? assignedUser.fullName : '',
        validityHours: this.newValidityHours,
      });

      this.closeCreateModal();
      this.showToast(`Đã tạo thành công mã ${created.code} cho ${created.studentName}`);
      void this.loadData();
      void this.openViewModal(created);
    } catch (err: any) {
      this.createError = err.error?.message || err.message || 'Không thể tạo mã đăng ký.';
    } finally {
      this.isCreating = false;
    }
  }

  // --- DIRECT NAVIGATION TO STUDENT PROFILE ---
  openStudentProfile(c: StudentRegistrationCodeItem): void {
    const targetId = c.studentId || c.studentCode;
    if (!targetId) return;
    this.router.navigate(['/quan-tri-viejap'], {
      queryParams: { section: 'students', id: targetId },
    });
  }

  // --- MODAL: VIEW CODE & QR ---
  async openViewModal(code: StudentRegistrationCodeItem): Promise<void> {
    this.selectedCode = code;
    this.showViewModal = true;
    this.qrDataUrl = '';
    try {
      const fullUrl = this.getStudentAccessUrl(code);
      this.qrDataUrl = await QRCode.toDataURL(fullUrl, {
        width: 280,
        margin: 2,
        color: {
          dark: '#091e4a',
          light: '#ffffff',
        },
      });
    } catch (err) {
      console.warn('QR Code generation error:', err);
    }
  }

  closeViewModal(): void {
    this.showViewModal = false;
    this.selectedCode = null;
    this.qrDataUrl = '';
  }

  getStudentAccessUrl(code: StudentRegistrationCodeItem): string {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://viejap.com';
    return `${origin}/form-hoc-vien?code=${code.code}&token=${code.accessToken}`;
  }

  getStudentMessageTemplate(code: StudentRegistrationCodeItem): string {
    const url = this.getStudentAccessUrl(code);
    return `Chào bạn ${code.studentName}!

VieJap gửi bạn mã đăng ký khai thông tin học viên:
👉 Mã đăng ký: ${code.code}
⏱ Thời hạn: 3 ngày kể từ thời điểm cấp (hết hạn ngày ${this.formatDateTime(code.expiresAt)}).

Bạn vui lòng truy cập đường dẫn sau để bắt đầu khai thông tin sơ yếu lý lịch:
🔗 ${url}

Nếu được gửi kèm mã QR, bạn có thể quét QR để truy cập nhanh bằng Zalo hoặc Camera điện thoại.
(Lưu ý: Vui lòng không chia sẻ mã này cho người khác).`;
  }

  async copyCodeOnly(code: StudentRegistrationCodeItem): Promise<void> {
    try {
      await navigator.clipboard.writeText(code.code);
      this.showCopyToast('Đã sao chép mã 6 số!');
    } catch {
      this.fallbackCopyText(code.code);
      this.showCopyToast('Đã sao chép mã 6 số!');
    }
  }

  async copyStudentMessage(code: StudentRegistrationCodeItem): Promise<void> {
    const text = this.getStudentMessageTemplate(code);
    try {
      await navigator.clipboard.writeText(text);
      this.showCopyToast('Đã sao chép tin nhắn gửi học viên!');
    } catch {
      this.fallbackCopyText(text);
      this.showCopyToast('Đã sao chép tin nhắn gửi học viên!');
    }
  }

  private fallbackCopyText(text: string): void {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
  }

  private showCopyToast(msg: string): void {
    this.copyToast.set(msg);
    setTimeout(() => this.copyToast.set(''), 2500);
  }

  downloadQrImage(): void {
    if (!this.qrDataUrl || !this.selectedCode) return;
    const anchor = document.createElement('a');
    anchor.href = this.qrDataUrl;
    anchor.download = `QR_CODE_${this.selectedCode.code}_${this.selectedCode.studentName.replace(/\s+/g, '_')}.png`;
    anchor.style.display = 'none';
    document.body.appendChild(anchor);
    anchor.click();
    setTimeout(() => anchor.remove(), 1000);
  }

  // --- MODAL: BULK CREATE ---
  openBulkModal(): void {
    if (!this.canCreateBulk) return;
    this.bulkInputText = '';
    this.bulkAssignedTo = '';
    this.bulkResult = null;
    this.showBulkModal = true;
  }

  closeBulkModal(): void {
    this.showBulkModal = false;
    this.bulkResult = null;
  }

  async submitBulkCreate(): Promise<void> {
    const lines = this.bulkInputText
      .split('\n')
      .map(l => l.trim())
      .filter(l => l.length > 0);

    if (lines.length === 0) {
      this.showToast('Vui lòng nhập ít nhất một học viên.', 'warning');
      return;
    }

    const assignedUser = this.staffUsers().find(u => u.userId === this.bulkAssignedTo);
    const assignedStaffName = assignedUser ? assignedUser.fullName : '';

    const students = lines.map(line => {
      // Split by comma or tab or semicolon
      const parts = line.split(/[,;\t]/).map(p => p.trim());
      return {
        studentName: parts[0] || '',
        phone: parts[1] || '',
        email: parts[2] || '',
        assignedTo: this.bulkAssignedTo,
        assignedStaffName,
      };
    });

    this.isBulkCreating = true;
    try {
      const res = await this.regService.createBulk(students);
      this.bulkResult = res;
      this.showToast(`Đã tạo thành công ${res.createdCount} mã đăng ký!`);
      void this.loadData();
    } catch (err: any) {
      this.showToast(err.error?.message || err.message || 'Lỗi khi cấp mã hàng loạt', 'danger');
    } finally {
      this.isBulkCreating = false;
    }
  }

  downloadBulkResultCsv(): void {
    if (!this.bulkResult || this.bulkResult.created.length === 0) return;
    const rows = [
      ['Họ và tên', 'Số điện thoại', 'Mã đăng ký (6 số)', 'Thời điểm cấp', 'Thời điểm hết hạn', 'Trạng thái mã', 'Link truy cập'],
      ...this.bulkResult.created.map(c => [
        c.studentName,
        c.phone || '',
        c.code,
        this.formatDateTime(c.createdAt),
        this.formatDateTime(c.expiresAt),
        'Chưa sử dụng',
        this.getStudentAccessUrl(c),
      ]),
    ];

    this.downloadCsvBlob(rows, `DANH_SACH_MA_DANG_KY_HANG_LOAT_${Date.now()}.csv`);
  }

  // --- MODAL: PROGRESS REVIEW ---
  openProgressModal(code: StudentRegistrationCodeItem): void {
    if (!this.canViewProgress) return;
    this.selectedProgressCode = code;
    this.showProgressModal = true;
  }

  closeProgressModal(): void {
    this.showProgressModal = false;
    this.selectedProgressCode = null;
  }

  async changeProgressStatus(code: StudentRegistrationCodeItem, newStatus: string): Promise<void> {
    if (!this.canManageProgress) return;
    try {
      await this.regService.updateProgress(code.id, newStatus);
      code.progressStatus = newStatus as any;
      this.showToast('Đã cập nhật tiến độ hồ sơ học viên!');
      void this.loadData();
    } catch (err: any) {
      this.showToast(err.message || 'Lỗi cập nhật tiến độ.', 'danger');
    }
  }

  // --- REVOKE CODE ---
  openRevokeModal(code: StudentRegistrationCodeItem): void {
    if (!this.canRevoke) return;
    this.codeToRevoke = code;
    this.revokeReason = 'Học viên hủy hoặc đổi kế hoạch';
    this.showRevokeModal = true;
  }

  closeRevokeModal(): void {
    this.showRevokeModal = false;
    this.codeToRevoke = null;
  }

  async submitRevoke(): Promise<void> {
    if (!this.codeToRevoke) return;
    this.isRevoking = true;
    try {
      await this.regService.revokeCode(this.codeToRevoke.id, this.revokeReason);
      this.showToast(`Đã thu hồi mã ${this.codeToRevoke.code} thành công.`);
      this.closeRevokeModal();
      void this.loadData();
    } catch (err: any) {
      this.showToast(err.error?.message || err.message || 'Không thể thu hồi mã.', 'danger');
    } finally {
      this.isRevoking = false;
    }
  }

  // --- DELETE CODE ---
  openDeleteModal(code: StudentRegistrationCodeItem): void {
    if (!this.canDelete) return;
    this.codeToDelete = code;
    this.showDeleteModal = true;
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.codeToDelete = null;
  }

  async submitDelete(): Promise<void> {
    if (!this.codeToDelete) return;
    this.isDeleting = true;
    try {
      await this.regService.deleteCode(this.codeToDelete.id);
      this.showToast(`Đã xóa vĩnh viễn mã đăng ký ${this.codeToDelete.code}.`);
      this.closeDeleteModal();
      void this.loadData();
    } catch (err: any) {
      this.showToast(err.error?.message || err.message || 'Không thể xóa mã đăng ký.', 'danger');
    } finally {
      this.isDeleting = false;
    }
  }

  // --- REISSUE CODE ---
  async confirmReissue(code: StudentRegistrationCodeItem): Promise<void> {
    if (!this.canReissue) return;
    if (code.status === 'used') {
      this.showToast('Học viên đã nộp hồ sơ thành công, không thể cấp lại mã.', 'warning');
      return;
    }

    if (!window.confirm(`Bạn có chắc chắn muốn cấp lại mã mới (hiệu lực 3 ngày) cho học viên ${code.studentName}?`)) {
      return;
    }

    this.isLoading.set(true);
    try {
      const newRecord = await this.regService.reissueCode(code.id);
      this.showToast(`Đã cấp lại mã mới ${newRecord.code} thành công!`);
      void this.loadData();
      void this.openViewModal(newRecord);
    } catch (err: any) {
      this.showToast(err.error?.message || err.message || 'Không thể cấp lại mã.', 'danger');
    } finally {
      this.isLoading.set(false);
    }
  }

  // --- EXPORT CODES CSV ---
  async exportCodesCsv(): Promise<void> {
    if (!this.canExport) return;
    this.isLoading.set(true);
    try {
      const items = await this.regService.exportCodes({
        search: this.searchTerm,
        status: this.statusFilter,
        progressStatus: this.progressFilter,
      });

      const rows = [
        ['Họ và tên', 'Số điện thoại', 'Email', 'Mã đăng ký (6 số)', 'Thời điểm cấp', 'Thời điểm hết hạn', 'Trạng thái mã', 'Tiến độ hồ sơ', 'Phần trăm hoàn thành', 'Người phụ trách', 'Người tạo'],
        ...items.map(i => [
          i.studentName,
          i.phone || '',
          i.email || '',
          i.code,
          this.formatDateTime(i.createdAt),
          this.formatDateTime(i.expiresAt),
          i.status,
          i.progress,
          i.progressPercent,
          i.assignedStaffName,
          i.createdBy,
        ]),
      ];

      this.downloadCsvBlob(rows, `DANH_SACH_MA_DANG_KY_VIEJAP_${Date.now()}.csv`);
      this.showToast(`Đã xuất ${items.length} bản ghi mã đăng ký ra file CSV!`);
    } catch (err: any) {
      this.showToast(err.message || 'Lỗi khi xuất file.', 'danger');
    } finally {
      this.isLoading.set(false);
    }
  }

  private downloadCsvBlob(rows: (string | number)[][], filename: string): void {
    const csvContent = '\uFEFF' + rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    anchor.style.display = 'none';
    document.body.appendChild(anchor);
    anchor.click();
    setTimeout(() => anchor.remove(), 1000);
  }

  // --- AUDIT HISTORY ---
  async openHistoryModal(): Promise<void> {
    if (!this.canViewHistory) return;
    this.showHistoryModal = true;
    this.isLoadingHistory = true;
    try {
      const logs = await this.regService.getHistory();
      this.historyLogs.set(logs);
    } catch (err: any) {
      this.showToast(err.message || 'Lỗi tải nhật ký.', 'danger');
    } finally {
      this.isLoadingHistory = false;
    }
  }

  closeHistoryModal(): void {
    this.showHistoryModal = false;
  }

  // --- HELPERS ---
  formatDateTime(iso?: string | null): string {
    if (!iso) return '—';
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

  formatCountdown(expiresAtIso: string, status: string): string {
    if (status === 'used') return 'Đã sử dụng';
    if (status === 'revoked') return 'Đã thu hồi';
    if (status === 'expired') return 'Đã hết hạn';

    const diff = new Date(expiresAtIso).getTime() - Date.now();
    if (diff <= 0) return 'Đã hết hạn';

    const hours = Math.floor(diff / (1000 * 3600));
    const mins = Math.floor((diff % (1000 * 3600)) / (1000 * 60));

    if (hours >= 24) {
      const days = Math.floor(hours / 24);
      const remHours = hours % 24;
      return `Còn ${days} ngày ${remHours}h`;
    }
    return `Còn ${hours}h ${mins}p`;
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'pending': return 'badge-pending';
      case 'in_progress': return 'badge-progress';
      case 'used': return 'badge-used';
      case 'expired': return 'badge-expired';
      case 'revoked': return 'badge-revoked';
      default: return '';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'pending': return 'Chưa sử dụng';
      case 'in_progress': return 'Đang khai';
      case 'used': return 'Đã gửi hồ sơ';
      case 'expired': return 'Hết hạn';
      case 'revoked': return 'Đã thu hồi';
      default: return status;
    }
  }

  getProgressBadgeClass(progress: string): string {
    switch (progress) {
      case 'not_started': return 'prog-not-started';
      case 'filling': return 'prog-filling';
      case 'draft_saved': return 'prog-draft';
      case 'submitted': return 'prog-submitted';
      case 'checking': return 'prog-checking';
      case 'need_info': return 'prog-need-info';
      case 'approved': return 'prog-approved';
      default: return '';
    }
  }

  getProgressLabel(progress: string): string {
    switch (progress) {
      case 'not_started': return 'Chưa bắt đầu';
      case 'filling': return 'Đang khai';
      case 'draft_saved': return 'Đã lưu bản nháp';
      case 'submitted': return 'Đã gửi hồ sơ';
      case 'checking': return 'Đang kiểm tra hồ sơ';
      case 'need_info': return 'Cần bổ sung';
      case 'approved': return 'Đã duyệt';
      default: return progress;
    }
  }

  formatCreator(name?: string): string {
    if (!name) return 'Hệ thống';
    const lower = name.toLowerCase().trim();
    if (lower === 'admin' || lower === 'super_admin' || lower === 'superadmin') {
      return 'Ban quản trị';
    }
    return name;
  }

  showToast(message: string, type: 'success' | 'danger' | 'warning' = 'success'): void {
    this.actionToast.set(message);
    setTimeout(() => this.actionToast.set(''), 3500);
  }
}
