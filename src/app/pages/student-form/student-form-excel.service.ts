import { Injectable } from '@angular/core';
import JSZip from 'jszip';
import { StudentFormData, YesNo } from './student-form.model';

const SPREADSHEET_NS = 'http://schemas.openxmlformats.org/spreadsheetml/2006/main';
const DRAWING_NS = 'http://schemas.openxmlformats.org/drawingml/2006/spreadsheetDrawing';
const DRAWING_TEXT_NS = 'http://schemas.openxmlformats.org/drawingml/2006/main';
const RELATIONSHIP_NS = 'http://schemas.openxmlformats.org/package/2006/relationships';
const XML_NS = 'http://www.w3.org/XML/1998/namespace';

export interface StudentFormWorkbookFile {
  filename: string;
  blob: Blob;
}

@Injectable({ providedIn: 'root' })
export class StudentFormExcelService {
  private readonly templateUrl = 'assets/file/form-hocvien.xlsx';

  async download(data: StudentFormData, photo?: File): Promise<string> {
    const workbook = await this.build(data, photo);
    const url = URL.createObjectURL(workbook.blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = workbook.filename;
    anchor.style.display = 'none';
    document.body.appendChild(anchor);
    anchor.click();
    window.setTimeout(() => {
      anchor.remove();
      URL.revokeObjectURL(url);
    }, 30_000);

    return workbook.filename;
  }

  async build(data: StudentFormData, photo?: File): Promise<StudentFormWorkbookFile> {
    const templateBytes = await this.fetchBytes(this.templateUrl);
    const output = await this.createWorkbook(templateBytes, data, photo);
    const workbookBytes = new Uint8Array(output.byteLength);
    workbookBytes.set(output);

    return {
      filename: this.createFilename(data.fullName),
      blob: new Blob([workbookBytes.buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      }),
    };
  }

  async createWorkbook(
    templateBytes: Uint8Array,
    data: StudentFormData,
    photo?: File,
  ): Promise<Uint8Array> {
    const zip = await JSZip.loadAsync(templateBytes);
    const sheet = await this.readXml(zip, 'xl/worksheets/sheet1.xml');

    this.writeBasicInformation(sheet, data);
    this.writeHealthInformation(sheet, data);
    this.writeGoalsAndPersonality(sheet, data);
    this.writeEducation(sheet, data);
    this.writeWorkHistory(sheet, data);
    this.writeFamily(sheet, data);

    zip.file('xl/worksheets/sheet1.xml', this.serializeXml(sheet));
    await this.updateDrawing(zip, photo);

    return zip.generateAsync({
      type: 'uint8array',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 },
    });
  }

  private writeBasicInformation(sheet: XMLDocument, data: StudentFormData): void {
    this.setCell(sheet, 'D2', `Ngày khai Form: ${this.formatDate(data.formDate)}`);
    this.setCell(sheet, 'B3', this.uppercase(data.fullName));
    this.setCell(sheet, 'G3', `Số CMT/CCCD: ${this.clean(data.idNumber)}`);
    this.setCell(sheet, 'B4', this.formatDate(data.birthDate));
    this.setCell(sheet, 'G4', `Ngày cấp: ${this.formatDate(data.idIssueDate)}`);
    this.setCell(
      sheet,
      'C5',
      `${this.selected('Đã kết hôn', data.maritalStatus === 'married')}     ${this.selected(
        'Ly thân',
        data.maritalStatus === 'separated',
      )}`,
    );
    this.setCell(sheet, 'E5', this.selected('Đã ly hôn', data.maritalStatus === 'divorced'));
    this.setCell(sheet, 'G5', this.selected('Chưa kết hôn', data.maritalStatus === 'single'));
    this.setCell(sheet, 'B6', this.uppercase(data.address));
    this.setCell(sheet, 'J5', `TTS: ${this.clean(data.phone)}`);
    this.setCell(sheet, 'J6', `Người thân: ${this.clean(data.relativePhone)}`);
  }

  private writeHealthInformation(sheet: XMLDocument, data: StudentFormData): void {
    this.setCell(
      sheet,
      'A8',
      `Thị lực (Mắt): ${this.selected('Có kính', data.eyesight === 'glasses')}        ${this.selected(
        'Không kính',
        data.eyesight === 'no-glasses',
      )}`,
    );
    this.setCell(
      sheet,
      'F8',
      `Thuận tay: ${this.selected('Phải', data.handedness === 'right')}        ${this.selected(
        'Trái',
        data.handedness === 'left',
      )}`,
    );
    this.setCell(sheet, 'A9', `Mù màu: ${this.yesNoText(data.colorBlind)}`);
    this.writeYesNoCells(sheet, 'F9', 'J9', 'K9', 'Chân tay có dị tật không?', data.limbDisability);
    this.setCell(sheet, 'A10', `Chiều cao: ${this.clean(data.height)} cm`);
    this.setCell(sheet, 'C10', `Cân nặng: ${this.clean(data.weight)} kg`);
    this.writeYesNoCells(sheet, 'F10', 'J10', 'K10', 'Đã phẫu thuật lần nào chưa?', data.surgery);
    this.setCell(
      sheet,
      'A11',
      `Nhóm máu: ${(['A', 'B', 'AB', 'O'] as const)
        .map((type) => this.selected(type, data.bloodType === type))
        .join('        ')}`,
    );
    this.writeYesNoCells(sheet, 'F11', 'J11', 'K11', 'Có hình xăm không?', data.tattoo);
    this.setCell(
      sheet,
      'A12',
      `Gia đình có tiền sử bệnh lý không? ${this.yesNoText(data.familyMedicalHistory)}`,
    );
    this.writeYesNoCells(sheet, 'F12', 'J12', 'K12', 'Có uống bia, rượu không?', data.alcohol);
    this.setCell(
      sheet,
      'A13',
      `Chuyên ngành/chuyên môn đã được đào tạo\n${this.uppercase(data.trainedSpecialty)}`,
    );
    this.writeYesNoCells(sheet, 'F13', 'J13', 'K13', 'Có hút thuốc không?', data.smoking);
    this.setCell(sheet, 'F14', `Tôn giáo: ${this.clean(data.religion)}`);
    this.setCell(sheet, 'J14', '');
    this.setCell(sheet, 'K14', '');
  }

  private writeGoalsAndPersonality(sheet: XMLDocument, data: StudentFormData): void {
    this.setCell(sheet, 'F15', `Điểm mạnh (Trong tính cách): ${this.clean(data.strengths)}`);
    this.setCell(sheet, 'F16', `Điểm yếu (Trong tính cách): ${this.clean(data.weaknesses)}`);
    this.setCell(sheet, 'F17', `Sở thích: ${this.clean(data.hobbies)}`);
    this.setCell(sheet, 'C17', this.yesNoText(data.collectiveLiving));
    this.setCell(sheet, 'C18', this.yesNoText(data.canCook));
    this.setCell(sheet, 'F18', `Tự nhận xét về tính cách: ${this.clean(data.selfAssessment)}`);
    this.setCell(
      sheet,
      'C19',
      `${this.clean(data.personalIncome)}${data.personalIncome ? ' đồng/tháng' : 'đồng/tháng'}`,
    );
    this.setCell(
      sheet,
      'C20',
      `${this.clean(data.familyIncome)}${data.familyIncome ? ' đồng/tháng' : 'đồng/tháng'}`,
    );
    this.setCell(sheet, 'A21', `Lý do đi Nhật: ${this.clean(data.reasonJapan)}`);
    this.setCell(
      sheet,
      'A22',
      `Sau 3 năm Anh/chị muốn mang bao nhiêu tiền về Việt Nam? ${this.clean(data.savingsGoal)}`,
    );
    this.setCell(sheet, 'A23', `Dự định sau 3 năm: ${this.clean(data.futurePlan)}`);
    this.setCell(
      sheet,
      'D24',
      `${this.selected('Đã từng', data.abroadBefore === 'yes')}     Nước nào: ${this.clean(
        data.abroadCountry,
      )}     Năm nào: ${this.clean(data.abroadYear)}`,
    );
    this.setCell(sheet, 'J24', this.selected('Chưa từng', data.abroadBefore === 'no'));
    this.setCell(
      sheet,
      'A25',
      `Anh/chị đã từng làm thủ tục đăng ký xin VISA đi Nhật lần nào chưa?  ${this.selected(
        'Đã đăng ký',
        data.visaApplied === 'yes',
      )}`,
    );
    this.setCell(sheet, 'J25', this.selected('Chưa từng', data.visaApplied === 'no'));
  }

  private writeEducation(sheet: XMLDocument, data: StudentFormData): void {
    data.education.forEach((entry, index) => {
      const row = 28 + index;
      const [majorStart, majorEnd] = this.splitText(entry.major, 38);
      this.setCell(sheet, `A${row}`, this.clean(entry.from));
      this.setCell(sheet, `B${row}`, this.clean(entry.to));
      this.setCell(sheet, `C${row}`, this.uppercase(entry.school));
      this.setCell(sheet, `F${row}`, this.clean(majorStart));
      this.setCell(sheet, `J${row}`, this.clean(majorEnd));
    });

    this.setCell(
      sheet,
      'A32',
      `Tình trạng học tập:   ${this.selected('Học muộn', data.studiedLate)}     ${this.selected(
        'Học sớm',
        data.studiedEarly,
      )}     ${this.selected('Học lại', data.repeatedGrade)}`,
    );
    this.setCell(sheet, 'J32', `Năm nào: ${this.clean(data.studyStatusYear)}`);
  }

  private writeWorkHistory(sheet: XMLDocument, data: StudentFormData): void {
    data.workHistory.forEach((entry, index) => {
      const row = 35 + index;
      this.setCell(sheet, `A${row}`, this.clean(entry.from));
      this.setCell(sheet, `B${row}`, this.clean(entry.to));
      this.setCell(sheet, `C${row}`, this.uppercase(entry.company));
      this.setCell(sheet, `F${row}`, this.uppercase(entry.job));
    });
  }

  private writeFamily(sheet: XMLDocument, data: StudentFormData): void {
    data.family.forEach((member, index) => {
      const row = 42 + index;
      this.setCell(sheet, `A${row}`, this.uppercase(member.fullName));
      this.setCell(sheet, `C${row}`, this.uppercase(member.relationship));
      this.setCell(sheet, `E${row}`, this.clean(member.birthYear));
      this.setCell(sheet, `F${row}`, this.uppercase(member.occupation));
      this.setCell(sheet, `H${row}`, member.livingStatus === 'together' ? 'X' : '');
      this.setCell(sheet, `I${row}`, member.livingStatus === 'separate' ? 'X' : '');
    });

    this.setCell(
      sheet,
      'J39',
      `Gia đình có đồng ý cho Anh/Chị đi thực tập sinh tại Nhật không?\n${this.yesNoText(
        data.familyConsent,
      )}`,
    );
    this.setCell(
      sheet,
      'A48',
      `Trong các thành viên trong gia đình khai trên: Ai đã từng xin VISA hoặc đã sang Nhật Bản chưa? ${this.clean(
        data.familyJapanHistory,
      )}`,
    );
  }

  private writeYesNoCells(
    sheet: XMLDocument,
    labelCell: string,
    yesCell: string,
    noCell: string,
    label: string,
    value: YesNo,
  ): void {
    this.setCell(sheet, labelCell, label);
    this.setCell(sheet, yesCell, this.selected('Có', value === 'yes'));
    this.setCell(sheet, noCell, this.selected('Không', value === 'no'));
  }

  private setCell(sheet: XMLDocument, reference: string, value: string): void {
    const cell = Array.from(sheet.getElementsByTagNameNS(SPREADSHEET_NS, 'c')).find(
      (candidate) => candidate.getAttribute('r') === reference,
    );
    if (!cell) {
      throw new Error(`Không tìm thấy ô ${reference} trong mẫu Excel.`);
    }

    while (cell.firstChild) {
      cell.removeChild(cell.firstChild);
    }
    cell.setAttribute('t', 'inlineStr');

    const inlineString = sheet.createElementNS(SPREADSHEET_NS, 'is');
    const text = sheet.createElementNS(SPREADSHEET_NS, 't');
    text.setAttributeNS(XML_NS, 'xml:space', 'preserve');
    text.textContent = value;
    inlineString.appendChild(text);
    cell.appendChild(inlineString);
  }

  private async updateDrawing(zip: JSZip, photo?: File): Promise<void> {
    const drawing = await this.readXml(zip, 'xl/drawings/drawing1.xml');
    Array.from(drawing.getElementsByTagNameNS(DRAWING_TEXT_NS, 't')).forEach(
      (text) => (text.textContent = ''),
    );

    const pictureAnchor = Array.from(drawing.documentElement.children).find(
      (element) => element.getElementsByTagNameNS(DRAWING_NS, 'pic').length > 0,
    );

    if (photo) {
      zip.file('xl/media/image1.png', await this.photoToPng(photo));
    } else {
      pictureAnchor?.remove();
      zip.remove('xl/media/image1.png');

      const relationships = await this.readXml(zip, 'xl/drawings/_rels/drawing1.xml.rels');
      Array.from(relationships.getElementsByTagNameNS(RELATIONSHIP_NS, 'Relationship'))
        .filter((relationship) => relationship.getAttribute('Id') === 'rId1')
        .forEach((relationship) => relationship.remove());
      zip.file('xl/drawings/_rels/drawing1.xml.rels', this.serializeXml(relationships));
    }

    zip.file('xl/drawings/drawing1.xml', this.serializeXml(drawing));
  }

  private async photoToPng(file: File): Promise<Uint8Array> {
    if (file.type === 'image/png') {
      return new Uint8Array(await file.arrayBuffer());
    }

    const url = URL.createObjectURL(file);
    try {
      const image = new Image();
      image.src = url;
      await new Promise<void>((resolve, reject) => {
        image.onload = () => resolve();
        image.onerror = () => reject(new Error('Không thể đọc ảnh thẻ đã chọn.'));
      });

      const canvas = document.createElement('canvas');
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;
      const context = canvas.getContext('2d');
      if (!context) {
        throw new Error('Trình duyệt không hỗ trợ xử lý ảnh thẻ.');
      }
      context.drawImage(image, 0, 0);

      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (result) =>
            result ? resolve(result) : reject(new Error('Không thể chuyển đổi ảnh thẻ.')),
          'image/png',
        );
      });
      return new Uint8Array(await blob.arrayBuffer());
    } finally {
      URL.revokeObjectURL(url);
    }
  }

  private async readXml(zip: JSZip, path: string): Promise<XMLDocument> {
    const file = zip.file(path);
    if (!file) {
      throw new Error(`Mẫu Excel thiếu thành phần ${path}.`);
    }

    const xml = new DOMParser().parseFromString(await file.async('string'), 'application/xml');
    if (xml.getElementsByTagName('parsererror').length) {
      throw new Error(`Không thể đọc thành phần ${path} của mẫu Excel.`);
    }
    return xml;
  }

  private serializeXml(document: XMLDocument): string {
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>${new XMLSerializer().serializeToString(
      document.documentElement,
    )}`;
  }

  private selected(label: string, active: boolean): string {
    return `${label}${active ? ' X' : ''}`;
  }

  private yesNoText(value: YesNo): string {
    return `${this.selected('Có', value === 'yes')}        ${this.selected(
      'Không',
      value === 'no',
    )}`;
  }

  private splitText(value: string, maxLength: number): [string, string] {
    const words = this.clean(value).split(' ').filter(Boolean);
    const first: string[] = [];
    while (words.length) {
      const candidate = [...first, words[0]].join(' ');
      if (candidate.length > maxLength && first.length) {
        break;
      }
      first.push(words.shift()!);
    }
    return [first.join(' '), words.join(' ')];
  }

  private formatDate(value: string): string {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
    return match ? `${match[3]}/${match[2]}/${match[1]}` : this.clean(value);
  }

  private uppercase(value: string): string {
    return this.clean(value).toUpperCase();
  }

  private clean(value: unknown): string {
    return String(value ?? '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private createFilename(fullName: string): string {
    const safeName =
      fullName
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-zA-Z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .toLowerCase() || 'hoc-vien';
    return `so-yeu-ly-lich-${safeName}.xlsx`;
  }

  private async fetchBytes(url: string): Promise<Uint8Array> {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Không thể tải tài nguyên biểu mẫu: ${url}`);
    }
    return new Uint8Array(await response.arrayBuffer());
  }
}
