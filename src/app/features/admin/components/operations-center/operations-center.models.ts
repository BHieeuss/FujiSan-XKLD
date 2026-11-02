export type NotificationCategory =
  | 'orders'
  | 'students'
  | 'documents'
  | 'tasks'
  | 'staff'
  | 'system';

export type NotificationPriority = 'high' | 'medium' | 'low';

export interface AdminNotificationActor {
  id: string;
  name: string;
  role: string;
}

export interface AdminNotificationTarget {
  type: string;
  id: string;
  code?: string;
  name?: string;
  url?: string;
}

export interface AdminNotificationItem {
  id: string;
  eventType: string;
  category: NotificationCategory;
  title: string;
  message: string;
  actor: AdminNotificationActor;
  target: AdminNotificationTarget;
  priority: NotificationPriority;
  isRead: boolean;
  readAt?: string | null;
  createdAt: string;
  isTrash?: boolean;
  trashedAt?: string | null;
  trashExpiresAt?: string | null;
  daysRemaining?: number;
  humanExpiryLabel?: string;
  metadata?: Record<string, unknown>;
}

export interface AuditLogChangeItem {
  field: string;
  fieldLabel: string;
  before: string | null;
  after: string | null;
}

export interface AdminActivityLogItem {
  id: string;
  actorName: string;
  actorRole: string;
  action: string;
  targetType: string;
  targetId: string;
  targetName: string;
  details: string;
  changes: AuditLogChangeItem[];
  createdAt: string;
}

export type TaskStatus =
  | 'cho_xu_ly'
  | 'dang_xu_ly'
  | 'cho_bo_sung'
  | 'can_xac_nhan'
  | 'hoan_thanh';

export interface AdminTaskItem {
  id: string;
  title: string;
  description: string;
  category: 'student_check' | 'document_verify' | 'order_review' | 'supplement_followup' | 'general';
  priority: NotificationPriority;
  status: TaskStatus;
  targetType: string;
  targetId: string;
  targetName: string;
  targetUrl: string;
  assignedTo: string;
  assignedToName: string;
  assignedBy: string;
  dueAt: string;
  isOverdue?: boolean;
  completedAt?: string | null;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminStaffItem {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  avatarUrl: string;
  isActive: boolean;
  createdAt: string;
}

export interface AdminOperationsStats {
  unreadNotifications: number;
  trashNotifications?: number;
  pendingProfiles: number;
  needsSupplementProfiles: number;
  activeOrders: number;
  totalOrders: number;
  totalStudents: number;
  pendingTasks: number;
  overdueTasks: number;
  lastUpdatedAt: string;
}

export interface OperationsDashboardPayload {
  notifications: AdminNotificationItem[];
  total: number;
  unreadCount: number;
  trashCount?: number;
  view?: 'inbox' | 'trash';
  stats: AdminOperationsStats;
  tasks: AdminTaskItem[];
  activities: AdminActivityLogItem[];
  staff: AdminStaffItem[];
  pendingProfiles: Array<{
    id: string;
    studentCode: string;
    fullName: string;
    phone: string;
    status: string;
    assignedStaffName?: string;
    createdAt: string;
    files: Array<{ fileType: string; fileName: string; version: number }>;
  }>;
  serverTime: string;
}

