import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminAuthService } from '../../services/admin-auth.service';
import { AdminToastService } from '../../services/admin-toast.service';
import {
  AdminRole,
  AdminUser,
  EffectivePermissionCalc,
  PermissionItem,
  UserAuditLog,
  UserOverride,
} from './users-admin.models';
import { UsersAdminService } from './users-admin.service';

import { AdminPaginationComponent } from '../shared/admin-pagination/admin-pagination.component';

export interface ModulePermissionGroup {
  module: string;
  moduleName: string;
  permissions: PermissionItem[];
}

@Component({
  selector: 'app-users-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, AdminPaginationComponent],
  templateUrl: './users-admin.html',
  styleUrls: ['./users-admin.scss'],
})
export class UsersAdminComponent implements OnInit {
  readonly auth = inject(AdminAuthService);
  private readonly usersService = inject(UsersAdminService);
  private readonly toast = inject(AdminToastService);

  // Active Tab
  activeTab: 'users' | 'roles' | 'overrides' | 'audit' = 'users';

  // Global State
  isLoading = signal<boolean>(false);
  users = signal<AdminUser[]>([]);
  roles = signal<AdminRole[]>([]);
  registry = signal<PermissionItem[]>([]);
  auditLogs = signal<UserAuditLog[]>([]);
  stats = signal<{ total: number; active: number; locked: number }>({ total: 0, active: 0, locked: 0 });

  // Pagination for Users
  usersPage = signal<number>(1);
  readonly usersPageSize = 10;
  readonly pagedUsers = computed<AdminUser[]>(() => {
    const page = this.usersPage();
    const start = (page - 1) * this.usersPageSize;
    return this.users().slice(start, start + this.usersPageSize);
  });

  // Pagination for Roles
  rolesPage = signal<number>(1);
  readonly rolesPageSize = 10;
  readonly pagedRoles = computed<AdminRole[]>(() => {
    const page = this.rolesPage();
    const start = (page - 1) * this.rolesPageSize;
    return this.roles().slice(start, start + this.rolesPageSize);
  });

  // Pagination for Audit Logs
  auditPage = signal<number>(1);
  readonly auditPageSize = 10;
  readonly pagedAuditLogs = computed<UserAuditLog[]>(() => {
    const page = this.auditPage();
    const start = (page - 1) * this.auditPageSize;
    return this.auditLogs().slice(start, start + this.auditPageSize);
  });

  onUsersPageChange(page: number): void {
    this.usersPage.set(page);
  }

  onRolesPageChange(page: number): void {
    this.rolesPage.set(page);
  }

  onAuditPageChange(page: number): void {
    this.auditPage.set(page);
  }

  // Filters for Users
  searchTerm = '';
  roleFilter = 'all';
  statusFilter: 'all' | 'active' | 'locked' = 'all';

  // User Form Modal (Create / Edit)
  showUserModal = false;
  isEditingUser = false;
  isUploadingAvatar = false;
  userForm: {
    id: string;
    username: string;
    fullName: string;
    email: string;
    phone: string;
    password: string;
    roleId: string;
    department: string;
    status: 'active' | 'locked';
    notes: string;
    avatarUrl: string;
  } = this.getInitialUserForm();
  userFormError = '';
  isSavingUser = false;

  // Password Reset Modal
  selectedUserForReset: AdminUser | null = null;
  resetPasswordInput = '';
  isResettingPassword = false;

  // Role Form Modal (Create / Edit)
  showRoleModal = false;
  isEditingRole = false;
  roleForm: {
    id: string;
    name: string;
    description: string;
    dataScope: 'own' | 'assigned' | 'team' | 'department' | 'all';
    permissions: string[];
  } = this.getInitialRoleForm();
  roleFormError = '';
  isSavingRole = false;

  // Copy Role Modal
  selectedRoleForCopy: AdminRole | null = null;
  copyRoleName = '';
  isCopyingRole = false;

  // Overrides Tab State
  selectedUserForOverride: AdminUser | null = null;
  userOverrideCalc: EffectivePermissionCalc | null = null;
  overrideAllowSet = new Set<string>();
  overrideDenySet = new Set<string>();
  overrideDataScope = '';
  overrideReason = '';
  isSavingOverride = false;

  // Audit Diff Modal
  selectedLogForDiff: UserAuditLog | null = null;

  // Computed grouped permissions
  readonly groupedPermissions = computed<ModulePermissionGroup[]>(() => {
    const list = this.registry();
    const map = new Map<string, ModulePermissionGroup>();

    for (const item of list) {
      if (!map.has(item.module)) {
        map.set(item.module, {
          module: item.module,
          moduleName: item.moduleName,
          permissions: [],
        });
      }
      map.get(item.module)!.permissions.push(item);
    }

    return Array.from(map.values());
  });

  ngOnInit(): void {
    void this.initializeData();
  }

  async initializeData(): Promise<void> {
    this.isLoading.set(true);
    try {
      const [registryRes, rolesRes] = await Promise.all([
        this.usersService.getRegistry(),
        this.usersService.getRoles(),
      ]);

      this.registry.set(registryRes.registry);
      this.roles.set(rolesRes);
      await this.loadUsers();
    } catch (err: any) {
      this.toast.error(err.message || 'Không thể tải dữ liệu phân quyền.');
    } finally {
      this.isLoading.set(false);
    }
  }

  // -------------------------------------------------------------
  // TAB NAVIGATION
  // -------------------------------------------------------------
  selectTab(tab: 'users' | 'roles' | 'overrides' | 'audit'): void {
    this.activeTab = tab;
    if (tab === 'audit' && this.auditLogs().length === 0) {
      void this.loadAuditLogs();
    }
    if (tab === 'roles') {
      void this.loadRoles();
    }
  }

  // -------------------------------------------------------------
  // TAB 1: USERS MANAGEMENT
  // -------------------------------------------------------------
  async loadUsers(): Promise<void> {
    try {
      const res = await this.usersService.getUsers(this.searchTerm, this.roleFilter, this.statusFilter);
      this.users.set(res.users);
      this.stats.set(res.stats);
      if ((this.usersPage() - 1) * this.usersPageSize >= res.users.length && this.usersPage() > 1) {
        this.usersPage.set(Math.max(1, Math.ceil(res.users.length / this.usersPageSize)));
      }
    } catch (err: any) {
      this.toast.error(err.message || 'Lỗi tải danh sách người dùng.');
    }
  }

  onSearchChange(): void {
    this.usersPage.set(1);
    void this.loadUsers();
  }

  openCreateUserModal(): void {
    this.isEditingUser = false;
    this.userForm = this.getInitialUserForm();
    this.userFormError = '';
    this.showUserModal = true;
  }

  openEditUserModal(user: AdminUser): void {
    this.isEditingUser = true;
    this.userForm = {
      id: user.id,
      username: user.username,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone || '',
      password: '',
      roleId: user.roleId,
      department: user.department || 'Văn Phòng',
      status: user.status,
      notes: user.notes || '',
      avatarUrl: user.avatarUrl || '',
    };
    this.userFormError = '';
    this.showUserModal = true;
  }

  async onAvatarFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) {
      return;
    }

    const file = input.files[0];
    if (file.size > 5 * 1024 * 1024) {
      this.toast.error('Dung lượng ảnh vượt quá 5 MB.');
      input.value = '';
      return;
    }

    this.isUploadingAvatar = true;
    try {
      const res = await this.usersService.uploadAvatar(file);
      this.userForm.avatarUrl = res.avatarUrl;
      this.toast.success('Đã tải ảnh đại diện lên thành công.');
    } catch (err: any) {
      this.toast.error(err.message || 'Lỗi khi tải ảnh đại diện.');
    } finally {
      this.isUploadingAvatar = false;
      input.value = '';
    }
  }

  removeAvatar(): void {
    this.userForm.avatarUrl = '';
  }

  closeUserModal(): void {
    this.showUserModal = false;
    this.userFormError = '';
  }

  async saveUser(): Promise<void> {
    this.userFormError = '';
    if (!this.userForm.fullName.trim()) {
      this.userFormError = 'Vui lòng nhập họ và tên.';
      return;
    }
    if (!this.userForm.email.trim()) {
      this.userFormError = 'Vui lòng nhập email.';
      return;
    }
    if (!this.userForm.username.trim()) {
      this.userFormError = 'Vui lòng nhập tên đăng nhập.';
      return;
    }
    if (!this.isEditingUser && (!this.userForm.password || this.userForm.password.length < 6)) {
      this.userFormError = 'Mật khẩu phải có ít nhất 6 ký tự.';
      return;
    }

    this.isSavingUser = true;
    try {
      if (this.isEditingUser) {
        const res = await this.usersService.updateUser(this.userForm.id, {
          username: this.userForm.username !== 'admin' ? this.userForm.username : undefined,
          fullName: this.userForm.fullName,
          email: this.userForm.email,
          phone: this.userForm.phone,
          roleId: this.userForm.roleId,
          department: this.userForm.department,
          status: this.userForm.status,
          notes: this.userForm.notes,
          avatarUrl: this.userForm.avatarUrl,
          password: this.userForm.password || undefined,
        });
        this.toast.success(res.message);
      } else {
        const res = await this.usersService.createUser({
          username: this.userForm.username,
          fullName: this.userForm.fullName,
          email: this.userForm.email,
          phone: this.userForm.phone,
          password: this.userForm.password,
          roleId: this.userForm.roleId,
          department: this.userForm.department,
          status: this.userForm.status,
          notes: this.userForm.notes,
          avatarUrl: this.userForm.avatarUrl,
        });
        this.toast.success(res.message);
      }

      this.closeUserModal();
      await this.loadUsers();
      await this.loadRoles();
    } catch (err: any) {
      this.userFormError = err.message || 'Lưu tài khoản thất bại.';
    } finally {
      this.isSavingUser = false;
    }
  }

  async toggleUserStatus(user: AdminUser): Promise<void> {
    if (user.isSuperAdmin || user.username === 'admin') {
      this.toast.error('Không thể khóa tài khoản Super Administrator.');
      return;
    }

    const actionText = user.status === 'active' ? 'khóa' : 'mở khóa';
    if (!confirm(`Bạn có chắc chắn muốn ${actionText} tài khoản "${user.fullName}" (${user.username})?`)) {
      return;
    }

    try {
      const res = await this.usersService.toggleUserStatus(user.id);
      this.toast.success(res.message);
      await this.loadUsers();
    } catch (err: any) {
      this.toast.error(err.message || 'Không thể đổi trạng thái tài khoản.');
    }
  }

  openResetPasswordModal(user: AdminUser): void {
    this.selectedUserForReset = user;
    this.resetPasswordInput = '';
  }

  closeResetPasswordModal(): void {
    this.selectedUserForReset = null;
    this.resetPasswordInput = '';
  }

  async submitResetPassword(): Promise<void> {
    if (!this.selectedUserForReset || !this.resetPasswordInput || this.resetPasswordInput.length < 6) {
      this.toast.error('Mật khẩu mới phải có ít nhất 6 ký tự.');
      return;
    }

    this.isResettingPassword = true;
    try {
      const res = await this.usersService.resetPassword(this.selectedUserForReset.id, this.resetPasswordInput);
      this.toast.success(res.message);
      this.closeResetPasswordModal();
    } catch (err: any) {
      this.toast.error(err.message || 'Đặt lại mật khẩu thất bại.');
    } finally {
      this.isResettingPassword = false;
    }
  }

  async deleteUser(user: AdminUser): Promise<void> {
    if (user.isSuperAdmin || user.username === 'admin') {
      this.toast.error('Không thể xóa tài khoản Super Administrator tối cao của hệ thống.');
      return;
    }

    if (!confirm(`CẢNH BÁO: Bạn có chắc chắn muốn xóa vĩnh viễn tài khoản "${user.fullName}" (${user.username})? Hành động này không thể hoàn tác!`)) {
      return;
    }

    try {
      const res = await this.usersService.deleteUser(user.id);
      this.toast.success(res.message);
      await this.loadUsers();
      await this.loadRoles();
    } catch (err: any) {
      this.toast.error(err.message || 'Xóa tài khoản thất bại.');
    }
  }

  goToOverridesForUser(user: AdminUser): void {
    this.activeTab = 'overrides';
    void this.selectUserForOverride(user);
  }

  // -------------------------------------------------------------
  // TAB 2: ROLES & PERMISSION MATRIX
  // -------------------------------------------------------------
  async loadRoles(): Promise<void> {
    try {
      const roles = await this.usersService.getRoles();
      this.roles.set(roles);
    } catch (err: any) {
      this.toast.error(err.message || 'Không thể tải danh sách vai trò.');
    }
  }

  openCreateRoleModal(): void {
    this.isEditingRole = false;
    this.roleForm = this.getInitialRoleForm();
    this.roleFormError = '';
    this.showRoleModal = true;
  }

  openEditRoleModal(role: AdminRole): void {
    this.isEditingRole = true;
    this.roleForm = {
      id: role.id,
      name: role.name,
      description: role.description,
      dataScope: role.dataScope || 'assigned',
      permissions: [...role.permissions],
    };
    this.roleFormError = '';
    this.showRoleModal = true;
  }

  closeRoleModal(): void {
    this.showRoleModal = false;
    this.roleFormError = '';
  }

  toggleRolePermission(key: string): void {
    const idx = this.roleForm.permissions.indexOf(key);
    if (idx >= 0) {
      this.roleForm.permissions.splice(idx, 1);
    } else {
      this.roleForm.permissions.push(key);
    }
  }

  isPermissionInRoleForm(key: string): boolean {
    return this.roleForm.permissions.includes(key);
  }

  toggleAllInModule(group: ModulePermissionGroup): void {
    const allKeys = group.permissions.map(p => p.key);
    const hasAll = allKeys.every(k => this.roleForm.permissions.includes(k));

    if (hasAll) {
      // Remove all
      this.roleForm.permissions = this.roleForm.permissions.filter(k => !allKeys.includes(k));
    } else {
      // Add missing
      for (const k of allKeys) {
        if (!this.roleForm.permissions.includes(k)) {
          this.roleForm.permissions.push(k);
        }
      }
    }
  }

  isAllSelectedInModule(group: ModulePermissionGroup): boolean {
    return group.permissions.every(p => this.roleForm.permissions.includes(p.key));
  }

  selectAllRolePermissions(): void {
    this.roleForm.permissions = this.registry().map(p => p.key);
  }

  deselectAllRolePermissions(): void {
    this.roleForm.permissions = [];
  }

  async saveRole(): Promise<void> {
    this.roleFormError = '';
    if (!this.roleForm.name.trim()) {
      this.roleFormError = 'Vui lòng nhập tên vai trò.';
      return;
    }

    this.isSavingRole = true;
    try {
      const res = await this.usersService.saveRole({
        id: this.isEditingRole ? this.roleForm.id : undefined,
        name: this.roleForm.name,
        description: this.roleForm.description,
        dataScope: this.roleForm.dataScope,
        permissions: this.roleForm.permissions,
      });
      this.toast.success(res.message);
      this.closeRoleModal();
      await this.loadRoles();
    } catch (err: any) {
      this.roleFormError = err.message || 'Lưu vai trò thất bại.';
    } finally {
      this.isSavingRole = false;
    }
  }

  openCopyRoleModal(role: AdminRole): void {
    this.selectedRoleForCopy = role;
    this.copyRoleName = `${role.name} (Bản sao)`;
  }

  closeCopyRoleModal(): void {
    this.selectedRoleForCopy = null;
    this.copyRoleName = '';
  }

  async submitCopyRole(): Promise<void> {
    if (!this.selectedRoleForCopy || !this.copyRoleName.trim()) {
      this.toast.error('Vui lòng nhập tên vai trò mới.');
      return;
    }

    this.isCopyingRole = true;
    try {
      const res = await this.usersService.copyRole(this.selectedRoleForCopy.id, this.copyRoleName.trim());
      this.toast.success(res.message);
      this.closeCopyRoleModal();
      await this.loadRoles();
    } catch (err: any) {
      this.toast.error(err.message || 'Sao chép vai trò thất bại.');
    } finally {
      this.isCopyingRole = false;
    }
  }

  async deleteRole(role: AdminRole): Promise<void> {
    if (role.isSystem) {
      this.toast.error('Không thể xóa vai trò hệ thống mặc định.');
      return;
    }

    if ((role.userCount ?? 0) > 0) {
      this.toast.error(`Vai trò này đang có ${role.userCount} tài khoản được gán. Hãy chuyển vai trò của họ trước khi xóa.`);
      return;
    }

    if (!confirm(`Bạn có chắc chắn muốn xóa vai trò "${role.name}"?`)) {
      return;
    }

    try {
      const res = await this.usersService.deleteRole(role.id);
      this.toast.success(res.message);
      await this.loadRoles();
    } catch (err: any) {
      this.toast.error(err.message || 'Xóa vai trò thất bại.');
    }
  }

  onOverrideUserChange(userId: string): void {
    const user = this.users().find(u => u.id === userId);
    if (user) {
      void this.selectUserForOverride(user);
    }
  }

  // -------------------------------------------------------------
  // TAB 3: USER OVERRIDES (RBAC + ALLOW / DENY)
  // -------------------------------------------------------------
  async selectUserForOverride(user: AdminUser): Promise<void> {
    this.selectedUserForOverride = user;
    this.isLoading.set(true);

    try {
      const detail = await this.usersService.getOverrides(user.id);
      this.userOverrideCalc = detail.calculation;
      this.overrideAllowSet = new Set(detail.override?.allowPermissions || []);
      this.overrideDenySet = new Set(detail.override?.denyPermissions || []);
      this.overrideDataScope = detail.override?.dataScope || '';
      this.overrideReason = detail.override?.reason || '';
    } catch (err: any) {
      this.toast.error(err.message || 'Không thể tải phân quyền riêng của người dùng.');
    } finally {
      this.isLoading.set(false);
    }
  }

  getOverrideState(permissionKey: string): 'role' | 'allow' | 'deny' {
    if (this.overrideDenySet.has(permissionKey)) {
      return 'deny';
    }
    if (this.overrideAllowSet.has(permissionKey)) {
      return 'allow';
    }
    return 'role';
  }

  setOverrideState(permissionKey: string, state: 'role' | 'allow' | 'deny'): void {
    if (state === 'role') {
      this.overrideAllowSet.delete(permissionKey);
      this.overrideDenySet.delete(permissionKey);
    } else if (state === 'allow') {
      this.overrideAllowSet.add(permissionKey);
      this.overrideDenySet.delete(permissionKey);
    } else if (state === 'deny') {
      this.overrideDenySet.add(permissionKey);
      this.overrideAllowSet.delete(permissionKey);
    }
  }

  isInheritedFromRole(permissionKey: string): boolean {
    if (!this.userOverrideCalc) return false;
    return this.userOverrideCalc.rolePermissions.includes(permissionKey);
  }

  isEffectivePermission(permissionKey: string): boolean {
    if (this.selectedUserForOverride?.isSuperAdmin) return true;
    if (this.overrideDenySet.has(permissionKey)) return false;
    if (this.overrideAllowSet.has(permissionKey)) return true;
    return this.isInheritedFromRole(permissionKey);
  }

  calculateTotalEffectiveCount(): number {
    if (!this.selectedUserForOverride) return 0;
    if (this.selectedUserForOverride.isSuperAdmin) return this.registry().length;

    let count = 0;
    for (const p of this.registry()) {
      if (this.isEffectivePermission(p.key)) {
        count++;
      }
    }
    return count;
  }

  async saveUserOverrides(): Promise<void> {
    if (!this.selectedUserForOverride) return;

    if (this.selectedUserForOverride.isSuperAdmin) {
      this.toast.error('Tài khoản Super Administrator luôn có toàn quyền và không thể bị ghi đè quyền.');
      return;
    }

    this.isSavingOverride = true;
    try {
      const res = await this.usersService.saveOverrides({
        userId: this.selectedUserForOverride.id,
        allowPermissions: Array.from(this.overrideAllowSet),
        denyPermissions: Array.from(this.overrideDenySet),
        dataScope: this.overrideDataScope || undefined,
        reason: this.overrideReason,
      });

      this.toast.success(res.message);
      await this.selectUserForOverride(this.selectedUserForOverride);
    } catch (err: any) {
      this.toast.error(err.message || 'Lưu phân quyền riêng thất bại.');
    } finally {
      this.isSavingOverride = false;
    }
  }

  async resetUserOverrides(): Promise<void> {
    if (!this.selectedUserForOverride) return;

    if (!confirm(`Khôi phục quyền tài khoản "${this.selectedUserForOverride.fullName}" về mặc định theo vai trò "${this.selectedUserForOverride.roleName}"?`)) {
      return;
    }

    this.isSavingOverride = true;
    try {
      const res = await this.usersService.resetOverrides(this.selectedUserForOverride.id);
      this.toast.success(res.message);
      await this.selectUserForOverride(this.selectedUserForOverride);
    } catch (err: any) {
      this.toast.error(err.message || 'Khôi phục quyền thất bại.');
    } finally {
      this.isSavingOverride = false;
    }
  }

  // -------------------------------------------------------------
  // TAB 4: AUDIT LOGS
  // -------------------------------------------------------------
  async loadAuditLogs(): Promise<void> {
    this.isLoading.set(true);
    try {
      const logs = await this.usersService.getAuditLogs(60);
      this.auditLogs.set(logs);
    } catch (err: any) {
      this.toast.error(err.message || 'Không thể tải nhật ký hoạt động.');
    } finally {
      this.isLoading.set(false);
    }
  }

  openDiffModal(log: UserAuditLog): void {
    this.selectedLogForDiff = log;
  }

  closeDiffModal(): void {
    this.selectedLogForDiff = null;
  }

  // Helpers
  private getInitialUserForm() {
    return {
      id: '',
      username: '',
      fullName: '',
      email: '',
      phone: '',
      password: '',
      roleId: 'admissions_officer',
      department: 'Phòng Tuyển Dụng XKLĐ',
      status: 'active' as const,
      notes: '',
      avatarUrl: '',
    };
  }

  private getInitialRoleForm() {
    return {
      id: '',
      name: '',
      description: '',
      dataScope: 'assigned' as const,
      permissions: [] as string[],
    };
  }

  getDataScopeLabel(scope: string): string {
    switch (scope) {
      case 'own': return 'Bản thân (Own)';
      case 'assigned': return 'Được phân công (Assigned)';
      case 'team': return 'Nhóm (Team)';
      case 'department': return 'Phòng ban (Department)';
      case 'all': return 'Toàn hệ thống (All)';
      default: return scope || 'Mặc định';
    }
  }

  getRoleBadgeClass(roleId: string): string {
    switch (roleId) {
      case 'super_admin': return 'badge-super-admin';
      case 'admin': return 'badge-admin';
      case 'recruitment_lead': return 'badge-lead';
      case 'document_specialist': return 'badge-specialist';
      case 'admissions_officer': return 'badge-officer';
      default: return 'badge-custom';
    }
  }
}
