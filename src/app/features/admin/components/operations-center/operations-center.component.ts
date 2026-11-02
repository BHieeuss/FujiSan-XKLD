import { Component, EventEmitter, OnDestroy, OnInit, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OperationsCenterService } from './operations-center.service';
import {
  AdminActivityLogItem,
  AdminNotificationItem,
  AdminStaffItem,
  AdminTaskItem,
  NotificationCategory,
  NotificationPriority,
  OperationsDashboardPayload,
  TaskStatus,
} from './operations-center.models';
import { AdminToastService } from '../../services/admin-toast.service';

import { AdminPaginationComponent } from '../shared/admin-pagination/admin-pagination.component';

@Component({
  selector: 'app-operations-center',
  standalone: true,
  imports: [CommonModule, FormsModule, AdminPaginationComponent],
  templateUrl: './operations-center.component.html',
  styleUrls: ['./operations-center.component.scss'],
})
export class OperationsCenterComponent implements OnInit, OnDestroy {
  private readonly opsService = inject(OperationsCenterService);
  private readonly toast = inject(AdminToastService);

  @Output() navigateSection = new EventEmitter<{ section: string; id?: string }>();

  dashboard = signal<OperationsDashboardPayload | null>(null);
  loading = signal<boolean>(true);
  refreshing = signal<boolean>(false);

  // View Mode: Central Content Switcher (Single main view at a time)
  viewMode = signal<'feed' | 'trash' | 'detail' | 'tasks' | 'pending_profiles' | 'audit_logs'>('feed');
  selectedNotification = signal<AdminNotificationItem | null>(null);

  // Multi-select batch actions
  selectedNotificationIds = signal<Set<string>>(new Set<string>());

  // Pagination
  feedPage = 1;
  trashPage = 1;
  tasksPage = 1;
  profilesPage = 1;
  activitiesPage = 1;
  readonly pageSize = 10;

  get pagedNotifications(): AdminNotificationItem[] {
    const list = this.dashboard()?.notifications || [];
    const start = (this.feedPage - 1) * this.pageSize;
    return list.slice(start, start + this.pageSize);
  }

  get pagedTrashNotifications(): AdminNotificationItem[] {
    const list = this.dashboard()?.notifications || [];
    const start = (this.trashPage - 1) * this.pageSize;
    return list.slice(start, start + this.pageSize);
  }

  onTrashPageChange(page: number): void {
    this.trashPage = page;
  }

  get pagedTasks(): AdminTaskItem[] {
    const start = (this.tasksPage - 1) * this.pageSize;
    return this.filteredTasks.slice(start, start + this.pageSize);
  }

  get pagedPendingProfiles(): any[] {
    const list = this.dashboard()?.pendingProfiles || [];
    const start = (this.profilesPage - 1) * this.pageSize;
    return list.slice(start, start + this.pageSize);
  }

  get pagedActivities(): AdminActivityLogItem[] {
    const list = this.dashboard()?.activities || [];
    const start = (this.activitiesPage - 1) * this.pageSize;
    return list.slice(start, start + this.pageSize);
  }

  onFeedPageChange(page: number): void {
    this.feedPage = page;
  }

  onTasksPageChange(page: number): void {
    this.tasksPage = page;
  }

  onProfilesPageChange(page: number): void {
    this.profilesPage = page;
  }

  onActivitiesPageChange(page: number): void {
    this.activitiesPage = page;
  }

  // Filters
  activeTab: NotificationCategory | 'all' | 'unread' = 'all';
  selectedPriority: NotificationPriority | 'all' = 'all';
  searchQuery = '';

  // Task filter inside widget
  taskFilter: 'all' | 'pending' | 'overdue' = 'all';

  // Modals
  showCreateTaskModal = false;
  showAssignStaffModal = false;
  showDiffModal = false;

  selectedDiffLog: AdminActivityLogItem | null = null;
  selectedTargetForAssign: { type: 'student' | 'task'; id: string; name: string } | null = null;
  selectedStaffIdForAssign = 'staff-01';
  submittingAssign = false;

  // New task form state
  newTask = {
    title: '',
    description: '',
    category: 'student_check' as const,
    priority: 'medium' as NotificationPriority,
    assignedTo: 'staff-01',
    dueDate: '',
    notes: '',
  };
  submittingTask = false;

  private pollTimer?: number;

  ngOnInit(): void {
    void this.loadDashboard(true);
    this.startPolling();
  }

  ngOnDestroy(): void {
    if (this.pollTimer) {
      clearInterval(this.pollTimer);
    }
  }

  startPolling(): void {
    // Check for updates every 25 seconds
    this.pollTimer = window.setInterval(async () => {
      try {
        const update = await this.opsService.checkUnread();
        const current = this.dashboard();
        if (current && update.unreadCount > current.unreadCount) {
          const diff = update.unreadCount - current.unreadCount;
          this.toast.show(
            `Hệ thống vừa ghi nhận ${diff} thông báo hoạt động mới.`,
            'info',
            'Hoạt động mới'
          );
          await this.loadDashboard(false);
        }
      } catch {
        // Silent fail on background poll
      }
    }, 25000);
  }

  // Confirmation Dialog State
  showConfirmModal = false;
  confirmTitle = '';
  confirmMessage = '';
  confirmBtnText = 'Xác nhận xóa vĩnh viễn';
  confirmDanger = true;
  pendingConfirmAction: (() => Promise<void>) | null = null;

  async loadDashboard(showLoading = false): Promise<void> {
    if (showLoading) {
      this.loading.set(true);
    } else {
      this.refreshing.set(true);
    }

    try {
      const currentView = this.viewMode() === 'trash' ? 'trash' : 'inbox';
      const data = await this.opsService.getDashboardData(
        this.activeTab,
        this.selectedPriority,
        this.searchQuery.trim(),
        50,
        0,
        currentView
      );
      this.dashboard.set(data);
    } catch (err: any) {
      this.toast.show(
        err?.message || 'Không thể tải dữ liệu điều hành.',
        'danger',
        'Lỗi đồng bộ'
      );
    } finally {
      this.loading.set(false);
      this.refreshing.set(false);
    }
  }

  async selectTab(tab: NotificationCategory | 'all' | 'unread'): Promise<void> {
    this.activeTab = tab;
    this.feedPage = 1;
    this.trashPage = 1;
    this.clearSelection();
    await this.loadDashboard(false);
  }

  async selectPriority(p: NotificationPriority | 'all'): Promise<void> {
    this.selectedPriority = p;
    this.feedPage = 1;
    this.trashPage = 1;
    this.clearSelection();
    await this.loadDashboard(false);
  }

  async onSearchSubmit(): Promise<void> {
    this.feedPage = 1;
    this.trashPage = 1;
    this.clearSelection();
    await this.loadDashboard(false);
  }

  async clearSearch(): Promise<void> {
    this.searchQuery = '';
    this.feedPage = 1;
    this.trashPage = 1;
    this.clearSelection();
    await this.loadDashboard(false);
  }

  // --- BATCH SELECTION HELPERS ---
  isSelected(id: string): boolean {
    return this.selectedNotificationIds().has(id);
  }

  toggleSelect(id: string, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    const current = new Set(this.selectedNotificationIds());
    if (current.has(id)) {
      current.delete(id);
    } else {
      current.add(id);
    }
    this.selectedNotificationIds.set(current);
  }

  isAllSelectedOnPage(): boolean {
    const list = this.viewMode() === 'trash' ? this.pagedTrashNotifications : this.pagedNotifications;
    if (list.length === 0) return false;
    const current = this.selectedNotificationIds();
    return list.every((item) => current.has(item.id));
  }

  toggleSelectAllOnPage(): void {
    const list = this.viewMode() === 'trash' ? this.pagedTrashNotifications : this.pagedNotifications;
    if (list.length === 0) return;

    const current = new Set(this.selectedNotificationIds());
    if (this.isAllSelectedOnPage()) {
      list.forEach((item) => current.delete(item.id));
    } else {
      list.forEach((item) => current.add(item.id));
    }
    this.selectedNotificationIds.set(current);
  }

  clearSelection(): void {
    this.selectedNotificationIds.set(new Set<string>());
  }

  // --- STATS CLICK SHORTCUTS ---
  filterByStat(statKey: string): void {
    if (statKey === 'unread') {
      this.switchViewMode('feed');
      this.feedPage = 1;
      this.selectTab('unread');
    } else if (statKey === 'trash') {
      this.switchViewMode('trash');
      this.trashPage = 1;
    } else if (statKey === 'pending_profiles') {
      this.viewMode.set('pending_profiles');
      this.profilesPage = 1;
    } else if (statKey === 'supplement') {
      this.navigateSection.emit({ section: 'students' });
    } else if (statKey === 'orders') {
      this.navigateSection.emit({ section: 'orders' });
    } else if (statKey === 'pending_tasks') {
      this.viewMode.set('tasks');
      this.taskFilter = 'pending';
      this.tasksPage = 1;
    } else if (statKey === 'overdue_tasks') {
      this.viewMode.set('tasks');
      this.taskFilter = 'overdue';
      this.tasksPage = 1;
    }
  }

  // --- CENTRAL CONTENT SWITCHER ---
  openNotificationDetail(item: AdminNotificationItem): void {
    if (!item.isRead) {
      void this.markAsRead(item);
    }
    this.selectedNotification.set(item);
    this.viewMode.set('detail');
  }

  backToFeed(): void {
    this.viewMode.set('feed');
    this.selectedNotification.set(null);
  }

  switchViewMode(mode: 'feed' | 'trash' | 'tasks' | 'pending_profiles' | 'audit_logs'): void {
    this.viewMode.set(mode);
    this.clearSelection();
    if (mode === 'feed') {
      this.feedPage = 1;
      this.selectedNotification.set(null);
      void this.loadDashboard(false);
    } else if (mode === 'trash') {
      this.trashPage = 1;
      this.selectedNotification.set(null);
      void this.loadDashboard(false);
    } else if (mode === 'tasks') {
      this.tasksPage = 1;
    } else if (mode === 'pending_profiles') {
      this.profilesPage = 1;
    } else if (mode === 'audit_logs') {
      this.activitiesPage = 1;
    }
  }

  // --- NOTIFICATION ACTIONS ---
  async markAsRead(item: AdminNotificationItem, event?: Event): Promise<void> {
    if (event) {
      event.stopPropagation();
    }
    if (item.isRead) {
      return;
    }

    item.isRead = true;
    try {
      const res = await this.opsService.markAsRead(item.id);
      const current = this.dashboard();
      if (current) {
        current.unreadCount = res.unreadCount;
        current.stats.unreadNotifications = res.unreadCount;
        this.dashboard.set({ ...current });
      }
    } catch {
      item.isRead = false;
    }
  }

  async toggleMarkRead(item: AdminNotificationItem, event?: Event): Promise<void> {
    if (event) {
      event.stopPropagation();
    }
    if (item.isRead) {
      try {
        const res = await this.opsService.markAsUnread(item.id);
        item.isRead = false;
        const current = this.dashboard();
        if (current) {
          current.unreadCount = res.unreadCount;
          current.stats.unreadNotifications = res.unreadCount;
          this.dashboard.set({ ...current });
        }
        this.toast.show('Đã chuyển thành chưa đọc.', 'info');
      } catch {
        this.toast.show('Không thể cập nhật trạng thái.', 'danger');
      }
    } else {
      await this.markAsRead(item, event);
      this.toast.show('Đã đánh dấu là đã đọc.', 'success');
    }
  }

  async markAllAsRead(): Promise<void> {
    try {
      await this.opsService.markAllAsRead();
      const current = this.dashboard();
      if (current) {
        current.notifications.forEach((n) => (n.isRead = true));
        current.unreadCount = 0;
        current.stats.unreadNotifications = 0;
        this.dashboard.set({ ...current });
      }
      this.toast.show('Đã đánh dấu tất cả thông báo là đã đọc.', 'success');
    } catch (err: any) {
      this.toast.show('Không thể đánh dấu đã đọc.', 'danger');
    }
  }

  async bulkMarkAsRead(): Promise<void> {
    const ids = Array.from(this.selectedNotificationIds());
    if (ids.length === 0) return;

    try {
      const res = await this.opsService.markMultipleAsRead(ids);
      const current = this.dashboard();
      if (current) {
        current.notifications.forEach((n) => {
          if (ids.includes(n.id)) n.isRead = true;
        });
        current.unreadCount = res.unreadCount;
        current.stats.unreadNotifications = res.unreadCount;
        this.dashboard.set({ ...current });
      }
      this.clearSelection();
      this.toast.show(`Đã đánh dấu ${ids.length} thông báo là đã đọc.`, 'success');
    } catch {
      this.toast.show('Không thể đánh dấu đã đọc hàng loạt.', 'danger');
    }
  }

  // --- TRASH & DELETE ACTIONS ---
  async moveToTrash(item: AdminNotificationItem, event?: Event): Promise<void> {
    if (event) {
      event.stopPropagation();
    }
    try {
      const res = await this.opsService.moveToTrash(item.id);
      const current = this.dashboard();
      if (current) {
        current.notifications = current.notifications.filter((n) => n.id !== item.id);
        current.total = Math.max(0, current.total - 1);
        current.unreadCount = res.unreadCount;
        current.trashCount = res.trashCount;
        current.stats.unreadNotifications = res.unreadCount;
        if (current.stats.trashNotifications !== undefined) {
          current.stats.trashNotifications = res.trashCount;
        }
        this.dashboard.set({ ...current });
      }
      if (this.selectedNotification()?.id === item.id) {
        this.backToFeed();
      }
      this.toast.show('Đã chuyển thông báo vào thùng rác (lưu trữ 30 ngày).', 'info');
    } catch {
      this.toast.show('Không thể chuyển vào thùng rác.', 'danger');
    }
  }

  async bulkMoveToTrash(): Promise<void> {
    const ids = Array.from(this.selectedNotificationIds());
    if (ids.length === 0) return;

    try {
      const res = await this.opsService.bulkTrash(ids);
      const current = this.dashboard();
      if (current) {
        current.notifications = current.notifications.filter((n) => !ids.includes(n.id));
        current.total = Math.max(0, current.total - ids.length);
        current.unreadCount = res.unreadCount;
        current.trashCount = res.trashCount;
        current.stats.unreadNotifications = res.unreadCount;
        if (current.stats.trashNotifications !== undefined) {
          current.stats.trashNotifications = res.trashCount;
        }
        this.dashboard.set({ ...current });
      }
      this.clearSelection();
      this.toast.show(`Đã chuyển ${ids.length} thông báo vào thùng rác.`, 'info');
    } catch {
      this.toast.show('Không thể chuyển vào thùng rác.', 'danger');
    }
  }

  async restoreFromTrash(item: AdminNotificationItem, event?: Event): Promise<void> {
    if (event) {
      event.stopPropagation();
    }
    try {
      const res = await this.opsService.restoreFromTrash(item.id);
      const current = this.dashboard();
      if (current) {
        current.notifications = current.notifications.filter((n) => n.id !== item.id);
        current.total = Math.max(0, current.total - 1);
        current.unreadCount = res.unreadCount;
        current.trashCount = res.trashCount;
        current.stats.unreadNotifications = res.unreadCount;
        this.dashboard.set({ ...current });
      }
      this.toast.show('Đã khôi phục thông báo về hộp thư đến.', 'success');
    } catch {
      this.toast.show('Không thể khôi phục thông báo.', 'danger');
    }
  }

  async bulkRestoreFromTrash(): Promise<void> {
    const ids = Array.from(this.selectedNotificationIds());
    if (ids.length === 0) return;

    try {
      const res = await this.opsService.bulkRestore(ids);
      const current = this.dashboard();
      if (current) {
        current.notifications = current.notifications.filter((n) => !ids.includes(n.id));
        current.total = Math.max(0, current.total - ids.length);
        current.unreadCount = res.unreadCount;
        current.trashCount = res.trashCount;
        current.stats.unreadNotifications = res.unreadCount;
        this.dashboard.set({ ...current });
      }
      this.clearSelection();
      this.toast.show(`Đã khôi phục ${ids.length} thông báo về hộp thư đến.`, 'success');
    } catch {
      this.toast.show('Không thể khôi phục thông báo.', 'danger');
    }
  }

  // --- PERMANENT DELETE (CONFIRMATION REQUIRED) ---
  openConfirmModal(title: string, message: string, btnText: string, action: () => Promise<void>): void {
    this.confirmTitle = title;
    this.confirmMessage = message;
    this.confirmBtnText = btnText;
    this.confirmDanger = true;
    this.pendingConfirmAction = action;
    this.showConfirmModal = true;
  }

  closeConfirmModal(): void {
    this.showConfirmModal = false;
    this.pendingConfirmAction = null;
  }

  async executeConfirmAction(): Promise<void> {
    if (this.pendingConfirmAction) {
      const action = this.pendingConfirmAction;
      this.closeConfirmModal();
      await action();
    }
  }

  permanentDelete(item: AdminNotificationItem, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.openConfirmModal(
      'Xác nhận xóa vĩnh viễn',
      `Bạn có chắc chắn muốn xóa vĩnh viễn thông báo "${item.title}"? Hành động này không thể hoàn tác.`,
      'Xóa vĩnh viễn',
      async () => {
        try {
          const res = await this.opsService.permanentDelete(item.id);
          const current = this.dashboard();
          if (current) {
            current.notifications = current.notifications.filter((n) => n.id !== item.id);
            current.total = Math.max(0, current.total - 1);
            current.unreadCount = res.unreadCount;
            current.trashCount = res.trashCount;
            current.stats.unreadNotifications = res.unreadCount;
            this.dashboard.set({ ...current });
          }
          this.toast.show('Đã xóa vĩnh viễn thông báo.', 'success');
        } catch {
          this.toast.show('Không thể xóa vĩnh viễn thông báo.', 'danger');
        }
      }
    );
  }

  bulkPermanentDelete(): void {
    const ids = Array.from(this.selectedNotificationIds());
    if (ids.length === 0) return;

    this.openConfirmModal(
      'Xác nhận xóa vĩnh viễn',
      `Bạn có chắc chắn muốn xóa vĩnh viễn ${ids.length} thông báo đã chọn? Hành động này sẽ xóa hoàn toàn và không thể hoàn tác.`,
      `Xóa vĩnh viễn ${ids.length} thông báo`,
      async () => {
        try {
          const res = await this.opsService.bulkPermanentDelete(ids);
          const current = this.dashboard();
          if (current) {
            current.notifications = current.notifications.filter((n) => !ids.includes(n.id));
            current.total = Math.max(0, current.total - ids.length);
            current.unreadCount = res.unreadCount;
            current.trashCount = res.trashCount;
            current.stats.unreadNotifications = res.unreadCount;
            this.dashboard.set({ ...current });
          }
          this.clearSelection();
          this.toast.show(`Đã xóa vĩnh viễn ${ids.length} thông báo khỏi hệ thống.`, 'success');
        } catch {
          this.toast.show('Không thể xóa vĩnh viễn thông báo.', 'danger');
        }
      }
    );
  }

  emptyAllTrash(): void {
    this.openConfirmModal(
      'Dọn sạch thùng rác',
      'Bạn có chắc chắn muốn xóa toàn bộ thông báo trong thùng rác không? Tất cả thông báo này sẽ bị xóa vĩnh viễn và không thể khôi phục.',
      'Dọn sạch tất cả',
      async () => {
        try {
          const res = await this.opsService.emptyTrash();
          const current = this.dashboard();
          if (current) {
            current.notifications = [];
            current.total = 0;
            current.trashCount = 0;
            if (current.stats.trashNotifications !== undefined) {
              current.stats.trashNotifications = 0;
            }
            this.dashboard.set({ ...current });
          }
          this.clearSelection();
          this.toast.show('Đã dọn sạch thùng rác thành công.', 'success');
        } catch {
          this.toast.show('Không thể dọn sạch thùng rác.', 'danger');
        }
      }
    );
  }

  async purgeExpiredTrash(): Promise<void> {
    try {
      const res = await this.opsService.purgeExpiredTrash();
      await this.loadDashboard(false);
      this.toast.show(res.message || 'Đã dọn dẹp các thông báo hết hạn 30 ngày.', 'info');
    } catch {
      this.toast.show('Không thể dọn dẹp thùng rác. Vui lòng thử lại.', 'danger');
    }
  }

  navigateToTarget(item: AdminNotificationItem, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    if (!item.isRead) {
      void this.markAsRead(item);
    }

    const target = item.target;
    if (target.type === 'student') {
      this.navigateSection.emit({ section: 'students', id: target.id });
    } else if (target.type === 'order') {
      this.navigateSection.emit({ section: 'orders', id: target.id });
    } else if (target.type === 'task') {
      this.viewMode.set('tasks');
    } else if (target.type === 'system') {
      this.navigateSection.emit({ section: 'security' });
    }
  }

  handleNotificationClick(item: AdminNotificationItem): void {
    this.openNotificationDetail(item);
  }

  // --- TASK ACTIONS ---
  get filteredTasks(): AdminTaskItem[] {
    const list = this.dashboard()?.tasks || [];
    if (this.taskFilter === 'overdue') {
      return list.filter((t) => t.isOverdue);
    }
    if (this.taskFilter === 'pending') {
      return list.filter((t) => t.status !== 'hoan_thanh');
    }
    return list;
  }

  async toggleTaskStatus(task: AdminTaskItem, event?: Event): Promise<void> {
    if (event) {
      event.stopPropagation();
    }
    const newStatus: TaskStatus = task.status === 'hoan_thanh' ? 'cho_xu_ly' : 'hoan_thanh';
    const oldStatus = task.status;
    task.status = newStatus;

    try {
      const res = await this.opsService.updateTask(task.id, { status: newStatus });
      this.toast.show(
        newStatus === 'hoan_thanh'
          ? `Đã hoàn thành công việc: ${task.title}`
          : `Đã mở lại công việc: ${task.title}`,
        'success'
      );
      await this.loadDashboard(false);
    } catch {
      task.status = oldStatus;
      this.toast.show('Không thể cập nhật trạng thái công việc.', 'danger');
    }
  }

  openCreateTaskModal(): void {
    const defaultDue = new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 16);
    this.newTask = {
      title: '',
      description: '',
      category: 'student_check',
      priority: 'medium',
      assignedTo: this.dashboard()?.staff[0]?.id || 'staff-01',
      dueDate: defaultDue,
      notes: '',
    };
    this.showCreateTaskModal = true;
  }

  closeCreateTaskModal(): void {
    this.showCreateTaskModal = false;
  }

  async submitCreateTask(): Promise<void> {
    if (!this.newTask.title.trim()) {
      alert('Vui lòng nhập tiêu đề công việc.');
      return;
    }

    this.submittingTask = true;
    try {
      await this.opsService.createTask({
        title: this.newTask.title.trim(),
        description: this.newTask.description.trim(),
        category: this.newTask.category,
        priority: this.newTask.priority,
        assignedTo: this.newTask.assignedTo,
        dueAt: this.newTask.dueDate ? new Date(this.newTask.dueDate).toISOString().replace('T', ' ').slice(0, 19) : '',
        notes: this.newTask.notes.trim(),
      });
      this.toast.show('Đã phân công việc mới thành công!', 'success');
      this.closeCreateTaskModal();
      await this.loadDashboard(false);
    } catch (err: any) {
      this.toast.show(err?.message || 'Không thể tạo công việc.', 'danger');
    } finally {
      this.submittingTask = false;
    }
  }

  // --- STAFF ASSIGNMENT MODAL ---
  openAssignModal(type: 'student' | 'task', id: string, name: string, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.selectedTargetForAssign = { type, id, name };
    this.selectedStaffIdForAssign = this.dashboard()?.staff[0]?.id || 'staff-01';
    this.showAssignStaffModal = true;
  }

  closeAssignModal(): void {
    this.showAssignStaffModal = false;
    this.selectedTargetForAssign = null;
  }

  async submitAssignStaff(): Promise<void> {
    if (!this.selectedTargetForAssign) return;

    this.submittingAssign = true;
    try {
      const res = await this.opsService.assignStaff(
        this.selectedTargetForAssign.type,
        this.selectedTargetForAssign.id,
        this.selectedStaffIdForAssign
      );
      this.toast.show(res.message || 'Đã phân công thành công!', 'success');
      this.closeAssignModal();
      await this.loadDashboard(false);
    } catch (err: any) {
      this.toast.show(err?.message || 'Lỗi khi phân công nhân sự.', 'danger');
    } finally {
      this.submittingAssign = false;
    }
  }

  // --- DIFF BEFORE / AFTER MODAL ---
  openDiffModal(log: AdminActivityLogItem, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.selectedDiffLog = log;
    this.showDiffModal = true;
  }

  closeDiffModal(): void {
    this.showDiffModal = false;
    this.selectedDiffLog = null;
  }

  // --- PRESENTATION HELPERS (MÚI GIỜ VIỆT NAM GMT+7) ---
  parseVietnamTimestamp(dateStr: string): number {
    if (!dateStr) return NaN;
    const trimmed = String(dateStr).trim();
    // Nếu chuỗi đã có chỉ định múi giờ (Z hoặc +HH:mm hoặc -HH:mm)
    if (/[Z+-]\d\d:?\d\d?$/.test(trimmed) || trimmed.endsWith('Z')) {
      return new Date(trimmed).getTime();
    }
    // Định dạng "YYYY-MM-DD HH:mm:ss" -> quy chuẩn theo giờ Việt Nam (+07:00)
    const isoFormat = trimmed.replace(' ', 'T') + '+07:00';
    const parsed = new Date(isoFormat).getTime();
    return isNaN(parsed) ? new Date(trimmed).getTime() : parsed;
  }

  timeAgo(dateStr: string): string {
    if (!dateStr) return '';
    const time = this.parseVietnamTimestamp(dateStr);
    if (isNaN(time)) return dateStr;
    const diffSec = Math.floor((Date.now() - time) / 1000);

    if (diffSec < 60) return 'Vừa xong';
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin} phút trước`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `${diffHours} giờ trước`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'Hôm qua';
    if (diffDays < 7) return `${diffDays} ngày trước`;
    return new Date(time).toLocaleDateString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
  }

  formatDueCountdown(dueStr: string): { text: string; isOverdue: boolean } {
    if (!dueStr) return { text: 'Không thời hạn', isOverdue: false };
    const dueTime = this.parseVietnamTimestamp(dueStr);
    if (isNaN(dueTime)) return { text: dueStr, isOverdue: false };
    const now = Date.now();
    const diffMs = dueTime - now;

    if (diffMs < 0) {
      const overdueHours = Math.ceil(Math.abs(diffMs) / 3600000);
      if (overdueHours < 24) {
        return { text: `Quá hạn ${overdueHours} giờ!`, isOverdue: true };
      }
      const overdueDays = Math.floor(overdueHours / 24);
      return { text: `Quá hạn ${overdueDays} ngày!`, isOverdue: true };
    }

    const remainHours = Math.floor(diffMs / 3600000);
    if (remainHours < 24) {
      return { text: `Còn ${remainHours} giờ`, isOverdue: false };
    }
    const remainDays = Math.floor(remainHours / 24);
    return { text: `Còn ${remainDays} ngày`, isOverdue: false };
  }

  getCategoryMeta(cat: string): { label: string; icon: string; badgeClass: string } {
    const map: Record<string, { label: string; icon: string; badgeClass: string }> = {
      orders: { label: 'Đơn hàng', icon: 'fas fa-briefcase', badgeClass: 'cat-orders' },
      students: { label: 'Học viên', icon: 'fas fa-user-graduate', badgeClass: 'cat-students' },
      documents: { label: 'Tài liệu', icon: 'fas fa-file-pdf', badgeClass: 'cat-docs' },
      tasks: { label: 'Công việc', icon: 'fas fa-list-check', badgeClass: 'cat-tasks' },
      staff: { label: 'Nhân sự', icon: 'fas fa-users-gear', badgeClass: 'cat-staff' },
      system: { label: 'Hệ thống', icon: 'fas fa-shield-halved', badgeClass: 'cat-system' },
    };
    return map[cat] || { label: 'Khác', icon: 'fas fa-bell', badgeClass: 'cat-system' };
  }

  getPriorityMeta(p: string): { label: string; badgeClass: string; icon: string } {
    const map: Record<string, { label: string; badgeClass: string; icon: string }> = {
      high: { label: 'Khẩn cấp', badgeClass: 'prio-high', icon: 'fas fa-circle-exclamation' },
      medium: { label: 'Quan trọng', badgeClass: 'prio-med', icon: 'fas fa-triangle-exclamation' },
      low: { label: 'Tiêu chuẩn', badgeClass: 'prio-low', icon: 'fas fa-circle-info' },
    };
    return map[p] || { label: 'Tiêu chuẩn', badgeClass: 'prio-low', icon: 'fas fa-circle-info' };
  }

  getTaskStatusMeta(status: string): { label: string; badgeClass: string } {
    const map: Record<string, { label: string; badgeClass: string }> = {
      cho_xu_ly: { label: 'Chờ xử lý', badgeClass: 'task-pending' },
      dang_xu_ly: { label: 'Đang xử lý', badgeClass: 'task-progress' },
      cho_bo_sung: { label: 'Chờ bổ sung', badgeClass: 'task-supplement' },
      can_xac_nhan: { label: 'Cần xác nhận', badgeClass: 'task-verify' },
      hoan_thanh: { label: 'Đã hoàn tất', badgeClass: 'task-completed' },
    };
    return map[status] || { label: status, badgeClass: 'task-pending' };
  }
}

