import { Injectable } from '@angular/core';
import { StudentFormExcelService } from './student-form-excel.service';
import { StudentFormData } from './student-form.model';

export interface StudentFormSubmissionResult {
  submissionId: string;
  driveSaved: boolean;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class StudentFormSubmissionService {
  private readonly endpoint = 'api/student-form-submit.php';

  constructor(private readonly excelService: StudentFormExcelService) {}

  async submit(data: StudentFormData, photo?: File): Promise<StudentFormSubmissionResult> {
    const workbook = await this.excelService.build(data, photo);
    const payload = new FormData();
    payload.append('workbook', workbook.blob, workbook.filename);
    payload.append('fullName', data.fullName.trim());
    payload.append('phone', data.phone.trim());
    payload.append('idNumber', data.idNumber.trim());
    payload.append('consent', 'accepted');
    payload.append('website', '');

    const response = await fetch(this.endpoint, {
      method: 'POST',
      body: payload,
      credentials: 'same-origin',
      headers: {
        Accept: 'application/json',
      },
    });

    const result = (await response.json().catch(() => null)) as
      | Partial<StudentFormSubmissionResult>
      | null;

    if (!response.ok) {
      throw new Error(result?.message || 'Máy chủ không thể tiếp nhận hồ sơ.');
    }

    if (!result?.submissionId) {
      throw new Error('Phản hồi lưu hồ sơ từ máy chủ không hợp lệ.');
    }

    return {
      submissionId: result.submissionId,
      driveSaved: result.driveSaved === true,
      message: result.message || 'Hồ sơ đã được lưu.',
    };
  }
}
