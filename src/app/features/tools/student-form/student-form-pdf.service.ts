import { Injectable } from '@angular/core';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { StudentFormData } from './student-form.model';

export interface StudentFormPdfFile {
  blob: Blob;
  filename: string;
}

@Injectable({ providedIn: 'root' })
export class StudentFormPdfService {
  async build(data: StudentFormData, photo?: File | Blob | string): Promise<StudentFormPdfFile> {
    const filename = this.generateFilename(data.fullName);
    const photoDataUrl = await this.resolvePhotoDataUrl(photo);

    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.left = '-99999px';
    container.style.top = '0';
    container.style.width = '794px'; // Standard A4 width at 96 DPI
    container.style.height = '1123px'; // Standard A4 height at 96 DPI
    container.style.boxSizing = 'border-box';
    container.style.padding = '14px 20px';
    container.style.background = '#ffffff';
    container.style.color = '#000000';
    container.style.fontFamily = "'Times New Roman', Times, serif";
    container.style.fontSize = '8pt';
    container.style.lineHeight = '1.2';
    container.style.overflow = 'hidden';

    container.innerHTML = this.buildHtml(data, photoDataUrl);
    document.body.appendChild(container);

    try {
      // Small tick to ensure images & styles are settled
      await new Promise((r) => setTimeout(r, 80));

      const canvas = await html2canvas(container, {
        scale: 2.2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        width: 794,
        height: 1123,
      });

      const doc = new jsPDF({
        format: 'a4',
        unit: 'mm',
        orientation: 'portrait',
        compress: true,
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      doc.addImage(imgData, 'JPEG', 0, 0, 210, 297, undefined, 'FAST');
      const blob = doc.output('blob');

      return { blob, filename };
    } finally {
      if (container.parentNode) {
        document.body.removeChild(container);
      }
    }
  }

  async download(data: StudentFormData, photo?: File | Blob | string): Promise<string> {
    const { blob, filename } = await this.build(data, photo);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    window.setTimeout(() => {
      a.remove();
      URL.revokeObjectURL(url);
    }, 20_000);
    return filename;
  }

  private generateFilename(fullName: string): string {
    const raw = (fullName || 'HOC_VIEN').trim();
    const normalized = raw
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '')
      .toUpperCase();
    return `SO_YEU_LY_LICH_${normalized || 'HOC_VIEN'}.pdf`;
  }

  private async resolvePhotoDataUrl(photo?: File | Blob | string): Promise<string> {
    if (!photo) return '';
    if (typeof photo === 'string') return photo;
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve((reader.result as string) || '');
      reader.onerror = () => resolve('');
      reader.readAsDataURL(photo);
    });
  }

  private formatDate(val?: string): string {
    if (!val) return '';
    const parts = val.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return val;
  }

  private formatMonthYear(val?: string): string {
    if (!val) return '';
    const parts = val.split('-');
    if (parts.length >= 2) {
      return `${parts[1]}/${parts[0]}`;
    }
    return val;
  }

  private box(checked: boolean, label: string): string {
    const mark = checked ? 'X' : '&nbsp;';
    return `<span style="display:inline-flex;align-items:center;margin-right:8px;font-size:7.8pt;">
      <span style="display:inline-block;width:9px;height:9px;line-height:9px;border:1px solid #000;text-align:center;font-weight:bold;font-size:7.5pt;margin-right:2px;">${mark}</span>
      <span>${label}</span>
    </span>`;
  }

  private buildHtml(d: StudentFormData, photoUrl: string): string {
    const marital = d.maritalStatus || 'single';
    const eyesight = d.eyesight || 'no-glasses';
    const dominantHand = d.handedness || 'right';
    const colorBlind = d.colorBlind || 'no';
    const limb = d.limbDisability || 'no';
    const blood = (d.bloodType || 'A').toUpperCase();
    const surgery = d.surgery || 'no';
    const tattoo = d.tattoo || 'no';
    const medical = d.familyMedicalHistory || 'no';
    const alcohol = d.alcohol || 'no';
    const smoke = d.smoking || 'no';
    const living = d.collectiveLiving || 'yes';
    const cook = d.canCook || 'yes';
    const abroad = d.abroadBefore || 'no';
    const visa = d.visaApplied || 'no';
    const familyConsent = d.familyConsent || 'yes';

    // Education rows (strictly 4 rows, each has 11 cols: 1 + 1 + 5 + 4)
    const eduRows: string[] = [];
    for (let i = 0; i < 4; i++) {
      const e = d.education?.[i];
      eduRows.push(`
        <tr style="height:20px;">
          <td style="text-align:center;padding:2px 3px;font-size:7.5pt;border:1px solid #000;">${e?.from ? this.formatMonthYear(e.from) : '&nbsp;'}</td>
          <td style="text-align:center;padding:2px 3px;font-size:7.5pt;border:1px solid #000;">${e?.to ? this.formatMonthYear(e.to) : '&nbsp;'}</td>
          <td colspan="5" style="padding:2px 4px;font-size:7.5pt;text-transform:uppercase;border:1px solid #000;">${e?.school || '&nbsp;'}</td>
          <td colspan="4" style="padding:2px 4px;font-size:7.5pt;border:1px solid #000;">${e?.major || '&nbsp;'}</td>
        </tr>
      `);
    }

    // Work history rows (strictly 4 rows, each has 11 cols: 1 + 1 + 5 + 4)
    const workRows: string[] = [];
    for (let i = 0; i < 4; i++) {
      const w = d.workHistory?.[i];
      workRows.push(`
        <tr style="height:20px;">
          <td style="text-align:center;padding:2px 3px;font-size:7.5pt;border:1px solid #000;">${w?.from ? this.formatMonthYear(w.from) : '&nbsp;'}</td>
          <td style="text-align:center;padding:2px 3px;font-size:7.5pt;border:1px solid #000;">${w?.to ? this.formatMonthYear(w.to) : '&nbsp;'}</td>
          <td colspan="5" style="padding:2px 4px;font-size:7.5pt;text-transform:uppercase;border:1px solid #000;">${w?.company || '&nbsp;'}</td>
          <td colspan="4" style="padding:2px 4px;font-size:7.5pt;border:1px solid #000;">${w?.job || '&nbsp;'}</td>
        </tr>
      `);
    }

    // Family rows (strictly 6 rows, each has 11 cols: 3 + 2 + 1 + 3 + 1 + 1)
    const famRows: string[] = [];
    for (let i = 0; i < 6; i++) {
      const f = d.family?.[i];
      const isLiving = f?.livingStatus === 'together';
      const isNotLiving = f?.livingStatus === 'separate';
      famRows.push(`
        <tr style="height:20px;">
          <td colspan="3" style="padding:2px 4px;font-size:7.5pt;text-transform:uppercase;border:1px solid #000;">${f?.fullName || '&nbsp;'}</td>
          <td colspan="2" style="text-align:center;padding:2px 3px;font-size:7.5pt;text-transform:uppercase;border:1px solid #000;">${f?.relationship || '&nbsp;'}</td>
          <td style="text-align:center;padding:2px 3px;font-size:7.5pt;border:1px solid #000;">${f?.birthYear || '&nbsp;'}</td>
          <td colspan="3" style="padding:2px 4px;font-size:7.5pt;text-transform:uppercase;border:1px solid #000;">${f?.occupation || '&nbsp;'}</td>
          <td style="text-align:center;padding:2px 3px;font-weight:bold;font-size:7.5pt;border:1px solid #000;">${f && isLiving ? 'X' : '&nbsp;'}</td>
          <td style="text-align:center;padding:2px 3px;font-weight:bold;font-size:7.5pt;border:1px solid #000;">${f && isNotLiving ? 'X' : '&nbsp;'}</td>
        </tr>
      `);
    }

    return `
      <div style="width:100%;font-size:8pt;line-height:1.2;font-family:'Times New Roman',Times,serif;color:#000;">
        <!-- TITLE -->
        <div style="text-align:center;margin-bottom:4px;">
          <h1 style="font-size:13pt;font-weight:bold;margin:0;letter-spacing:1px;text-transform:uppercase;">SƠ YẾU LÝ LỊCH</h1>
          <div style="font-size:8pt;font-style:italic;">(Tự khai)</div>
        </div>

        <!-- MAIN TABLE (11 columns total) -->
        <table style="width:100%;border-collapse:collapse;border:1.5px solid #000;table-layout:fixed;" cellpadding="0" cellspacing="0">
          <colgroup>
            <col style="width:10%;" />
            <col style="width:8%;" />
            <col style="width:8%;" />
            <col style="width:11%;" />
            <col style="width:7%;" />
            <col style="width:11%;" />
            <col style="width:11%;" />
            <col style="width:10%;" />
            <col style="width:6%;" />
            <col style="width:9%;" />
            <col style="width:9%;" />
          </colgroup>

          <!-- HEADER 1 -->
          <tr style="background:#f0f0f0;font-weight:bold;">
            <td colspan="7" style="padding:2px 5px;font-size:8.5pt;text-transform:uppercase;border:1px solid #000;">THÔNG TIN CƠ BẢN</td>
            <td colspan="4" style="padding:2px 5px;text-align:right;font-size:7.5pt;border:1px solid #000;">Ngày khai Form: <b>${this.formatDate(d.formDate) || this.formatDate(new Date().toISOString().slice(0, 10))}</b></td>
          </tr>

          <!-- ROW 1: Họ tên, Số CMT/CCCD, Ảnh thẻ (rowspan 4) -->
          <tr>
            <td colspan="2" style="padding:2px 4px;font-weight:bold;border:1px solid #000;">Họ và tên</td>
            <td colspan="4" style="padding:2px 5px;font-weight:bold;font-size:9pt;text-transform:uppercase;border:1px solid #000;">${d.fullName || '&nbsp;'}</td>
            <td colspan="3" style="padding:2px 4px;font-size:8pt;border:1px solid #000;">Số CMT/CCCD: <b>${d.idNumber || '&nbsp;'}</b></td>
            <td colspan="2" rowspan="4" style="text-align:center;vertical-align:middle;padding:2px;background:#fafafa;border:1px solid #000;">
              ${
                photoUrl
                  ? `<img src="${photoUrl}" style="max-width:85px;max-height:105px;object-fit:cover;border:1px solid #555;" alt="Ảnh thẻ" />`
                  : `<div style="width:78px;height:98px;margin:auto;border:1px dashed #888;display:flex;align-items:center;justify-content:center;font-size:7.5pt;color:#666;">Ảnh 3x4</div>`
              }
            </td>
          </tr>

          <!-- ROW 2: Ngày sinh, Ngày cấp -->
          <tr>
            <td colspan="2" style="padding:2px 4px;font-weight:bold;border:1px solid #000;">N.T.Năm sinh</td>
            <td colspan="4" style="padding:2px 5px;border:1px solid #000;">${this.formatDate(d.birthDate) || '&nbsp;'}</td>
            <td colspan="3" style="padding:2px 4px;font-size:8pt;border:1px solid #000;">Ngày cấp: <b>${this.formatDate(d.idIssueDate) || '&nbsp;'}</b></td>
          </tr>

          <!-- ROW 3: Hôn nhân -->
          <tr>
            <td colspan="2" style="padding:2px 4px;font-weight:bold;border:1px solid #000;">Tình trạng hôn nhân</td>
            <td colspan="7" style="padding:2px 5px;border:1px solid #000;">
              ${this.box(marital === 'married', 'Đã kết hôn')}
              ${this.box(marital === 'separated', 'Ly thân')}
              ${this.box(marital === 'divorced', 'Đã ly hôn')}
              ${this.box(marital === 'single', 'Chưa kết hôn')}
            </td>
          </tr>

          <!-- ROW 4: Địa chỉ -->
          <tr>
            <td colspan="2" style="padding:2px 4px;font-weight:bold;border:1px solid #000;">Địa chỉ</td>
            <td colspan="7" style="padding:2px 5px;border:1px solid #000;">${d.address || '&nbsp;'}</td>
          </tr>

          <!-- ROW 5: SĐT & TTS / Người thân -->
          <tr>
            <td colspan="2" style="padding:2px 4px;font-weight:bold;border:1px solid #000;">Số điện thoại</td>
            <td colspan="4" style="padding:2px 5px;border:1px solid #000;"><b>${d.phone || '&nbsp;'}</b></td>
            <td colspan="3" style="padding:2px 4px;font-size:7.5pt;border:1px solid #000;">TTS: <b>${d.phone || '&nbsp;'}</b></td>
            <td colspan="2" style="padding:2px 4px;font-size:7.5pt;border:1px solid #000;">Người thân: <b>${d.relativePhone || '&nbsp;'}</b></td>
          </tr>

          <!-- ROW 6: Thị lực, Thuận tay -->
          <tr>
            <td colspan="2" style="padding:2px 4px;font-weight:bold;border:1px solid #000;">Thị lực (Mắt)</td>
            <td colspan="4" style="padding:2px 5px;border:1px solid #000;">
              ${this.box(eyesight === 'no-glasses', 'Không kính')}
              ${this.box(eyesight === 'glasses', 'Có kính')}
            </td>
            <td colspan="2" style="padding:2px 4px;font-weight:bold;border:1px solid #000;">Thuận tay</td>
            <td colspan="3" style="padding:2px 5px;border:1px solid #000;">
              ${this.box(dominantHand === 'right', 'Phải')}
              ${this.box(dominantHand === 'left', 'Trái')}
            </td>
          </tr>

          <!-- ROW 7: Mù màu, Dị tật -->
          <tr>
            <td colspan="2" style="padding:2px 4px;font-weight:bold;border:1px solid #000;">Mù màu</td>
            <td colspan="4" style="padding:2px 5px;border:1px solid #000;">
              ${this.box(colorBlind === 'yes', 'Có')}
              ${this.box(colorBlind === 'no', 'Không')}
            </td>
            <td colspan="3" style="padding:2px 4px;font-weight:bold;border:1px solid #000;">Chân tay có dị tật không?</td>
            <td colspan="2" style="padding:2px 5px;border:1px solid #000;">
              ${this.box(limb === 'yes', 'Có')}
              ${this.box(limb === 'no', 'Không')}
            </td>
          </tr>

          <!-- ROW 8: Chiều cao/Cân nặng, Đã phẫu thuật -->
          <tr>
            <td colspan="2" style="padding:2px 4px;font-weight:bold;border:1px solid #000;">Chiều cao / Cân nặng</td>
            <td colspan="4" style="padding:2px 5px;border:1px solid #000;"><b>${d.height || '---'}</b> cm &nbsp;/&nbsp; <b>${d.weight || '---'}</b> kg</td>
            <td colspan="3" style="padding:2px 4px;font-weight:bold;border:1px solid #000;">Đã phẫu thuật lần nào chưa?</td>
            <td colspan="2" style="padding:2px 5px;border:1px solid #000;">
              ${this.box(surgery === 'yes', 'Có')}
              ${this.box(surgery === 'no', 'Không')}
            </td>
          </tr>

          <!-- ROW 9: Nhóm máu, Hình xăm -->
          <tr>
            <td colspan="2" style="padding:2px 4px;font-weight:bold;border:1px solid #000;">Nhóm máu</td>
            <td colspan="4" style="padding:2px 5px;border:1px solid #000;">
              ${this.box(blood === 'A', 'A')}
              ${this.box(blood === 'B', 'B')}
              ${this.box(blood === 'AB', 'AB')}
              ${this.box(blood === 'O', 'O')}
            </td>
            <td colspan="3" style="padding:2px 4px;font-weight:bold;border:1px solid #000;">Có hình xăm không?</td>
            <td colspan="2" style="padding:2px 5px;border:1px solid #000;">
              ${this.box(tattoo === 'yes', 'Có')}
              ${this.box(tattoo === 'no', 'Không')}
            </td>
          </tr>

          <!-- ROW 10: Tiền sử bệnh lý, Bia rượu -->
          <tr>
            <td colspan="2" style="padding:2px 4px;font-weight:bold;border:1px solid #000;">Tiền sử bệnh lý GĐ</td>
            <td colspan="4" style="padding:2px 5px;border:1px solid #000;">
              ${this.box(medical === 'yes', 'Có')}
              ${this.box(medical === 'no', 'Không')}
            </td>
            <td colspan="3" style="padding:2px 4px;font-weight:bold;border:1px solid #000;">Có uống bia, rượu không?</td>
            <td colspan="2" style="padding:2px 5px;border:1px solid #000;">
              ${this.box(alcohol === 'yes', 'Có')}
              ${this.box(alcohol === 'no', 'Không')}
            </td>
          </tr>

          <!-- ROW 11: Chuyên môn & Hút thuốc -->
          <tr>
            <td colspan="2" rowspan="2" style="padding:2px 4px;font-weight:bold;vertical-align:top;border:1px solid #000;">Chuyên ngành / chuyên môn đã được đào tạo</td>
            <td colspan="4" rowspan="2" style="padding:2px 5px;vertical-align:top;border:1px solid #000;">${d.trainedSpecialty || 'Chưa qua đào tạo nghề'}</td>
            <td colspan="3" style="padding:2px 4px;font-weight:bold;border:1px solid #000;">Có hút thuốc không?</td>
            <td colspan="2" style="padding:2px 5px;border:1px solid #000;">
              ${this.box(smoke === 'yes', 'Có')}
              ${this.box(smoke === 'no', 'Không')}
            </td>
          </tr>

          <!-- ROW 12: Tôn giáo -->
          <tr>
            <td colspan="3" style="padding:2px 4px;font-weight:bold;border:1px solid #000;">Tôn giáo</td>
            <td colspan="2" style="padding:2px 5px;border:1px solid #000;">${d.religion || 'Không'}</td>
          </tr>

          <!-- ROW 13: Sống tập thể & Điểm mạnh -->
          <tr>
            <td colspan="2" style="padding:2px 4px;font-weight:bold;border:1px solid #000;">Có kinh nghiệm sống tập thể?</td>
            <td colspan="4" style="padding:2px 5px;border:1px solid #000;">
              ${this.box(living === 'yes', 'Có')}
              ${this.box(living === 'no', 'Không')}
            </td>
            <td colspan="2" style="padding:2px 4px;font-weight:bold;border:1px solid #000;">Điểm mạnh (tính cách)</td>
            <td colspan="3" style="padding:2px 5px;border:1px solid #000;">${d.strengths || '&nbsp;'}</td>
          </tr>

          <!-- ROW 14: Nấu ăn & Điểm yếu -->
          <tr>
            <td colspan="2" style="padding:2px 4px;font-weight:bold;border:1px solid #000;">Có biết nấu ăn không?</td>
            <td colspan="4" style="padding:2px 5px;border:1px solid #000;">
              ${this.box(cook === 'yes', 'Có')}
              ${this.box(cook === 'no', 'Không')}
            </td>
            <td colspan="2" style="padding:2px 4px;font-weight:bold;border:1px solid #000;">Điểm yếu (tính cách)</td>
            <td colspan="3" style="padding:2px 5px;border:1px solid #000;">${d.weaknesses || '&nbsp;'}</td>
          </tr>

          <!-- ROW 15: Thu nhập bản thân & Sở thích -->
          <tr>
            <td colspan="2" style="padding:2px 4px;font-weight:bold;border:1px solid #000;">Thu nhập bản thân</td>
            <td colspan="4" style="padding:2px 5px;border:1px solid #000;">${d.personalIncome || '0'} đồng/tháng</td>
            <td colspan="2" style="padding:2px 4px;font-weight:bold;border:1px solid #000;">Sở thích</td>
            <td colspan="3" style="padding:2px 5px;border:1px solid #000;">${d.hobbies || '&nbsp;'}</td>
          </tr>

          <!-- ROW 16: Thu nhập gia đình & Tự nhận xét -->
          <tr>
            <td colspan="2" style="padding:2px 4px;font-weight:bold;border:1px solid #000;">Thu nhập gia đình</td>
            <td colspan="4" style="padding:2px 5px;border:1px solid #000;">${d.familyIncome || '0'} đồng/tháng</td>
            <td colspan="2" style="padding:2px 4px;font-weight:bold;border:1px solid #000;">Tự nhận xét tính cách</td>
            <td colspan="3" style="padding:2px 5px;border:1px solid #000;">${d.selfAssessment || '&nbsp;'}</td>
          </tr>

          <!-- ROW 17: Lý do đi Nhật -->
          <tr>
            <td colspan="2" style="padding:2px 4px;font-weight:bold;border:1px solid #000;">Lý do đi Nhật</td>
            <td colspan="9" style="padding:2px 5px;border:1px solid #000;">${d.reasonJapan || '&nbsp;'}</td>
          </tr>

          <!-- ROW 18: Mục tiêu tiền & Dự định -->
          <tr>
            <td colspan="2" style="padding:2px 4px;font-weight:bold;border:1px solid #000;">Sau 3 năm mang về</td>
            <td colspan="4" style="padding:2px 5px;border:1px solid #000;">Khoảng: <b>${d.savingsGoal || '---'}</b></td>
            <td colspan="2" style="padding:2px 4px;font-weight:bold;border:1px solid #000;">Dự định sau khi về nước</td>
            <td colspan="3" style="padding:2px 5px;border:1px solid #000;">${d.futurePlan || '&nbsp;'}</td>
          </tr>

          <!-- ROW 19: Đã từng đi nước ngoài & VISA Nhật -->
          <tr>
            <td colspan="2" style="padding:2px 4px;font-weight:bold;border:1px solid #000;">Đã từng đi nước ngoài?</td>
            <td colspan="4" style="padding:2px 5px;border:1px solid #000;">
              ${this.box(abroad === 'yes', 'Đã từng')}
              ${this.box(abroad === 'no', 'Chưa từng')}
              ${d.abroadCountry ? `(Nước: ${d.abroadCountry}${d.abroadYear ? ' - ' + d.abroadYear : ''})` : ''}
            </td>
            <td colspan="3" style="padding:2px 4px;font-weight:bold;border:1px solid #000;">Đã từng xin VISA đi Nhật lần nào chưa?</td>
            <td colspan="2" style="padding:2px 5px;border:1px solid #000;">
              ${this.box(visa === 'yes', 'Đã từng')}
              ${this.box(visa === 'no', 'Chưa từng')}
            </td>
          </tr>

          <!-- SECTION 2: QUÁ TRÌNH HỌC TẬP -->
          <tr style="background:#f0f0f0;font-weight:bold;text-align:center;">
            <td colspan="11" style="padding:2px;font-size:8.5pt;text-transform:uppercase;border:1px solid #000;">QUÁ TRÌNH HỌC TẬP (Yêu cầu khai chính xác, trung thực)</td>
          </tr>
          <tr style="background:#fcfcfc;font-weight:bold;text-align:center;font-size:7.5pt;">
            <td style="padding:2px 3px;border:1px solid #000;">Từ tháng/năm</td>
            <td style="padding:2px 3px;border:1px solid #000;">Đến tháng/năm</td>
            <td colspan="5" style="padding:2px 4px;border:1px solid #000;">Tên trường</td>
            <td colspan="4" style="padding:2px 4px;border:1px solid #000;">Chuyên ngành / Bậc học</td>
          </tr>
          ${eduRows.join('')}
          <tr>
            <td colspan="7" style="padding:2px 5px;font-size:7.5pt;border:1px solid #000;">
              Tình trạng học tập:
              ${this.box(!!d.studiedLate, 'Học muộn')}
              ${this.box(!!d.studiedEarly, 'Học sớm')}
              ${this.box(!!d.repeatedGrade, 'Học lại')}
            </td>
            <td colspan="4" style="padding:2px 5px;font-size:7.5pt;border:1px solid #000;">
              Năm nào: <b>${d.studyStatusYear || '&nbsp;'}</b>
            </td>
          </tr>

          <!-- SECTION 3: QUÁ TRÌNH LÀM VIỆC -->
          <tr style="background:#f0f0f0;font-weight:bold;text-align:center;">
            <td colspan="11" style="padding:2px;font-size:8.5pt;text-transform:uppercase;border:1px solid #000;">QUÁ TRÌNH LÀM VIỆC (Yêu cầu khai chính xác, trung thực)</td>
          </tr>
          <tr style="background:#fcfcfc;font-weight:bold;text-align:center;font-size:7.5pt;">
            <td style="padding:2px 3px;border:1px solid #000;">Từ tháng/năm</td>
            <td style="padding:2px 3px;border:1px solid #000;">Đến tháng/năm</td>
            <td colspan="5" style="padding:2px 4px;border:1px solid #000;">Tên công ty hoặc nơi làm việc</td>
            <td colspan="4" style="padding:2px 4px;border:1px solid #000;">Nội dung công việc / Vị trí</td>
          </tr>
          ${workRows.join('')}

          <!-- SECTION 4: THÀNH PHẦN GIA ĐÌNH -->
          <tr style="background:#f0f0f0;font-weight:bold;text-align:center;">
            <td colspan="11" style="padding:2px;font-size:8.5pt;text-transform:uppercase;border:1px solid #000;">THÀNH PHẦN GIA ĐÌNH (Bố, Mẹ, Vợ/Chồng, Con, Anh/Chị/Em ruột)</td>
          </tr>
          <tr style="background:#fcfcfc;font-weight:bold;text-align:center;font-size:7.5pt;">
            <td colspan="3" style="padding:2px 4px;border:1px solid #000;">Họ và tên</td>
            <td colspan="2" style="padding:2px 3px;border:1px solid #000;">Quan hệ</td>
            <td style="padding:2px 3px;border:1px solid #000;">Năm sinh</td>
            <td colspan="3" style="padding:2px 4px;border:1px solid #000;">Nghề nghiệp</td>
            <td style="padding:2px 3px;border:1px solid #000;">Sống chung</td>
            <td style="padding:2px 3px;border:1px solid #000;">Không sống chung</td>
          </tr>
          ${famRows.join('')}

          <!-- GIA ĐÌNH ĐỒNG Ý & LỊCH SỬ NHẬT -->
          <tr>
            <td colspan="7" style="padding:2px 5px;font-size:7.5pt;border:1px solid #000;">
              Gia đình có đồng ý cho Anh/Chị đi thực tập sinh tại Nhật không?
              ${this.box(familyConsent === 'yes', 'Có')}
              ${this.box(familyConsent === 'no', 'Không')}
            </td>
            <td colspan="4" style="padding:2px 5px;font-size:7.5pt;border:1px solid #000;">
              Ai đã từng xin visa/sang Nhật: <b>${d.familyJapanHistory || 'Không'}</b>
            </td>
          </tr>

          <!-- CHỮ KÝ -->
          <tr style="height:52px;">
            <td colspan="6" style="vertical-align:top;padding:3px;text-align:center;font-size:7.5pt;border:1px solid #000;">
              <b>Người kê khai</b><br/>
              <span style="font-style:italic;font-size:7pt;">(Ký và ghi rõ họ tên)</span>
              <div style="margin-top:24px;font-weight:bold;text-transform:uppercase;font-size:8pt;">${d.fullName || ''}</div>
            </td>
            <td colspan="5" style="vertical-align:top;padding:3px;text-align:center;font-size:7.5pt;border:1px solid #000;">
              <b>Cán bộ tuyển dụng</b><br/>
              <span style="font-style:italic;font-size:7pt;">(Ký và ghi rõ họ tên)</span>
            </td>
          </tr>
        </table>
      </div>
    `;
  }
}
