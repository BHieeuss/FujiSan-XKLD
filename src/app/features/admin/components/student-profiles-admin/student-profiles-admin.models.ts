import { StudentFormData } from '../../../tools/student-form/student-form.model';

export type StudentProfileStatus = 'tiep_nhan' | 'dang_xu_ly' | 'hoan_tat' | 'tam_dung';

export type StudentProfileFileType = 'excel' | 'pdf' | 'document' | 'photo';

export interface StudentProfileFile {
  id: string;
  fileType: StudentProfileFileType;
  version: number;
  fileName: string;
  fileSize: number;
  mimeType?: string;
  createdAt: string;
}

export interface StudentProfileAuditLog {
  id: string;
  action: string;
  actor: string;
  details: string;
  createdAt: string;
}

export interface StudentProfileSummary {
  id: string;
  studentCode: string;
  fullName: string;
  birthDate: string;
  phone: string;
  idNumber: string;
  address: string;
  status: StudentProfileStatus;
  assignedTo?: string;
  assignedStaffName?: string;
  createdAt: string;
  updatedAt: string;
  files: StudentProfileFile[];
}

export interface StudentProfileDetail extends StudentProfileSummary {
  data: StudentFormData;
  auditLogs: StudentProfileAuditLog[];
}

export interface StudentProfileFilters {
  search: string;
  status: string;
  from_date: string;
  to_date: string;
  sort: 'newest' | 'oldest';
}

export const STUDENT_PROFILE_STATUS_MAP: Record<
  StudentProfileStatus,
  { label: string; badgeClass: string; icon: string }
> = {
  tiep_nhan: {
    label: 'Tiếp nhận mới',
    badgeClass: 'status-new',
    icon: 'fas fa-inbox',
  },
  dang_xu_ly: {
    label: 'Đang xử lý',
    badgeClass: 'status-processing',
    icon: 'fas fa-spinner fa-spin-pulse',
  },
  hoan_tat: {
    label: 'Hoàn tất hồ sơ',
    badgeClass: 'status-completed',
    icon: 'fas fa-circle-check',
  },
  tam_dung: {
    label: 'Tạm dừng / Hủy',
    badgeClass: 'status-halted',
    icon: 'fas fa-circle-pause',
  },
};

