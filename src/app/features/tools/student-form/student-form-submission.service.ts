import { Injectable } from '@angular/core';
import { StudentFormExcelService, StudentFormWorkbookFile } from './student-form-excel.service';
import { StudentFormData } from './student-form.model';

export interface StudentSubmissionFileItem {
  id: string;
  fileType: string;
  version: number;
  fileName: string;
  fileSize: number;
  downloadUrl: string;
}

export interface StudentFormSubmissionResult {
  success: boolean;
  profileId: string;
  studentCode: string;
  fullName: string;
  message: string;
  files: StudentSubmissionFileItem[];
  workbook: StudentFormWorkbookFile;
}

@Injectable({ providedIn: 'root' })
export class StudentFormSubmissionService {
  private readonly endpoint = '/student-api/student-form-submit.php';

  constructor(private readonly excelService: StudentFormExcelService) {}

  async submit(
    data: StudentFormData,
    photo?: File,
    documentPdf?: File,
    cvPdf?: Blob,
  ): Promise<StudentFormSubmissionResult> {
    const workbook = await this.excelService.build(data, photo);
    const payload = new FormData();
    payload.append('workbook', workbook.blob, workbook.filename);
    payload.append('fullName', data.fullName.trim());
    payload.append('phone', data.phone.trim());
    payload.append('idNumber', data.idNumber.trim());
    payload.append('birthDate', data.birthDate || '');
    payload.append('address', data.address.trim());
    payload.append('data', JSON.stringify(data));
    payload.append('consent', 'accepted');
    payload.append('website', '');

    if (photo) {
      const photoName = (photo as any).name || 'portrait.png';
      payload.append('photo', photo, photoName);
    }
    if (documentPdf) {
      payload.append('documentPdf', documentPdf, documentPdf.name);
    }
    if (cvPdf) {
      payload.append('cvPdf', cvPdf, 'so-yeu-ly-lich.pdf');
    }

    const response = await fetch(this.endpoint, {
      method: 'POST',
      body: payload,
      credentials: 'same-origin',
      headers: {
        Accept: 'application/json',
      },
    });

    const rawText = await response.text();
    let result: any = null;
    try {
      result = JSON.parse(rawText);
    } catch {
      console.error('[StudentSubmit] Failed to parse JSON, raw text:', rawText.slice(0, 500));
    }
    console.log('[StudentSubmit] response status:', response.status, 'parsed result:', result);

    if (!response.ok) {
      throw new Error(result?.message || 'Máy chủ không thể tiếp nhận hồ sơ.');
    }

    const profileId = result?.profileId || result?.submissionId;
    if (!profileId) {
      throw new Error('Phản hồi lưu hồ sơ từ máy chủ không hợp lệ.');
    }

    return {
      success: true,
      profileId,
      studentCode: result?.studentCode || 'HV-' + profileId.slice(0, 8).toUpperCase(),
      fullName: result?.fullName || data.fullName.trim(),
      message: result?.message || 'Hồ sơ đã được lưu trữ an toàn trong hệ thống của VieJap.',
      files: result?.files || [],
      workbook,
    };
  }
}
