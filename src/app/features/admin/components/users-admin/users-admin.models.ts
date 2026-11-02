export interface AdminUser {
  id: string;
  username: string;
  fullName: string;
  email: string;
  phone?: string;
  roleId: string;
  roleName: string;
  department?: string;
  status: 'active' | 'locked';
  avatarUrl?: string;
  isSuperAdmin?: boolean;
  createdAt: string;
  lastLoginAt?: string | null;
  notes?: string;
}

export interface AdminRole {
  id: string;
  name: string;
  description: string;
  isSystem?: boolean;
  dataScope: 'own' | 'assigned' | 'team' | 'department' | 'all';
  permissions: string[];
  userCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface PermissionItem {
  key: string;
  name: string;
  description: string;
  module: string;
  moduleName: string;
  action: string;
  isSensitive: boolean;
}

export interface UserOverride {
  allowPermissions: string[];
  denyPermissions: string[];
  dataScope?: string;
  updatedAt?: string | null;
  updatedBy?: string | null;
  reason?: string;
}

export interface EffectivePermissionCalc {
  isSuperAdmin: boolean;
  dataScope: string;
  rolePermissions: string[];
  allowPermissions: string[];
  denyPermissions: string[];
  effectivePermissions: string[];
}

export interface UserAuditLog {
  id: string;
  actorName: string;
  actorRole: string;
  action: string;
  targetType: string;
  targetId: string;
  targetName: string;
  details: string;
  changes?: Array<{ field: string; fieldLabel: string; before: any; after: any }>;
  createdAt: string;
}

export interface UsersResponse {
  users: AdminUser[];
  total: number;
  stats: {
    total: number;
    active: number;
    locked: number;
  };
}

export interface UserDetailResponse {
  user: AdminUser;
  role?: AdminRole | null;
  override?: UserOverride;
  calculation: EffectivePermissionCalc;
}

