import { Injectable } from '@angular/core';
import { StudentFormData } from './student-form.model';

export interface StudentVerifyResponse {
  success: boolean;
  message?: string;
  codeId?: string;
  code?: string;
  studentName?: string;
  phone?: string;
  email?: string;
  expiresAt?: string;
  sessionToken?: string;
  progressPercent?: number;
  currentStep?: number;
  draftData?: Partial<StudentFormData> | null;
  rateLimited?: boolean;
  remainingSeconds?: number;
}

export interface StudentDraftSaveResponse {
  success: boolean;
  message?: string;
  lastDraftSavedAt?: string;
}

export interface StudentSubmitResponse {
  success: boolean;
  message?: string;
  studentCode?: string;
  profileId?: string;
}

export interface StudentRegistrationSession {
  codeId: string;
  code: string;
  sessionToken: string;
  studentName: string;
  phone: string;
  email: string;
  expiresAt: string;
  progressPercent: number;
  currentStep: number;
}

const SESSION_STORAGE_KEY = 'viejap_student_reg_session';

@Injectable({
  providedIn: 'root',
})
export class StudentRegistrationService {
  private readonly apiEndpoint = '/student-api/student-registration.php';

  // Get active session from storage
  getActiveSession(): StudentVerifyResponse | null {
    if (typeof window === 'undefined') return null;
    try {
      const raw = sessionStorage.getItem(SESSION_STORAGE_KEY) || localStorage.getItem(SESSION_STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as StudentVerifyResponse;
      if (parsed.expiresAt && new Date(parsed.expiresAt).getTime() < Date.now()) {
        this.clearSession();
        return null;
      }
      return parsed;
    } catch {
      return null;
    }
  }

  saveSession(session: StudentVerifyResponse): void {
    if (typeof window === 'undefined') return;
    const json = JSON.stringify(session);
    sessionStorage.setItem(SESSION_STORAGE_KEY, json);
    localStorage.setItem(SESSION_STORAGE_KEY, json);
  }

  clearSession(): void {
    if (typeof window === 'undefined') return;
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
    localStorage.removeItem(SESSION_STORAGE_KEY);
  }

  async verifyCode(code: string): Promise<StudentVerifyResponse> {
    try {
      const res = await fetch(`${this.apiEndpoint}?action=verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ code }),
      });
      const data = (await res.json()) as StudentVerifyResponse;
      if (data.success && data.sessionToken) {
        this.saveSession(data);
      }
      return data;
    } catch (err: any) {
      return {
        success: false,
        message: err.message || 'Không thể kết nối đến máy chủ xác thực. Vui lòng thử lại.',
      };
    }
  }

  async verifyQr(token: string): Promise<StudentVerifyResponse> {
    try {
      const res = await fetch(`${this.apiEndpoint}?action=qr_verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ token }),
      });
      const data = (await res.json()) as StudentVerifyResponse;
      if (data.success && data.sessionToken) {
        this.saveSession(data);
      }
      return data;
    } catch (err: any) {
      return {
        success: false,
        message: err.message || 'Mã QR không hợp lệ hoặc đã hết hạn.',
      };
    }
  }

  async saveDraft(
    codeId: string,
    sessionToken: string,
    draftData: Partial<StudentFormData>,
    progressPercent: number,
    currentStep: number
  ): Promise<StudentDraftSaveResponse> {
    try {
      const res = await fetch(`${this.apiEndpoint}?action=save_draft`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          codeId,
          sessionToken,
          draftData,
          progressPercent,
          currentStep,
        }),
      });
      return (await res.json()) as StudentDraftSaveResponse;
    } catch (err: any) {
      return {
        success: false,
        message: err.message || 'Lưu bản nháp thất bại.',
      };
    }
  }

  async getDraft(codeId: string, sessionToken: string): Promise<any> {
    const res = await fetch(
      `${this.apiEndpoint}?action=get_draft&codeId=${encodeURIComponent(codeId)}&sessionToken=${encodeURIComponent(sessionToken)}`,
      { headers: { Accept: 'application/json' } }
    );
    return await res.json();
  }

  async submitProfile(
    codeId: string,
    sessionToken: string,
    formData: StudentFormData,
    photo?: File,
    documentPdf?: File,
    cvPdfBlob?: Blob,
    workbookBlob?: Blob
  ): Promise<StudentSubmitResponse> {
    const fd = new FormData();
    fd.append('codeId', codeId);
    fd.append('sessionToken', sessionToken);
    fd.append('consent', 'accepted');
    fd.append('fullName', formData.fullName || '');
    fd.append('phone', formData.phone || '');
    fd.append('idNumber', formData.idNumber || '');
    fd.append('birthDate', formData.birthDate || '');
    fd.append('address', formData.address || '');
    fd.append('data', JSON.stringify(formData));

    if (workbookBlob) {
      const safeName = (formData.fullName || 'HOC_VIEN')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-zA-Z0-9]+/g, '_')
        .toUpperCase();
      fd.append('workbook', workbookBlob, `HO_SO_${safeName}.xlsx`);
    }

    if (cvPdfBlob) {
      fd.append('cv_pdf', cvPdfBlob, 'CV_SYLL.pdf');
    }

    if (photo) {
      fd.append('photo', photo, photo.name);
    }

    if (documentPdf) {
      fd.append('document_pdf', documentPdf, documentPdf.name);
    }

    const res = await fetch(`${this.apiEndpoint}?action=submit`, {
      method: 'POST',
      body: fd,
    });
    const result = (await res.json()) as StudentSubmitResponse;

    // Submission succeeded, clear stored student registration code session
    if (result.success) {
      this.clearSession();
    }
    return result;
  }
}
