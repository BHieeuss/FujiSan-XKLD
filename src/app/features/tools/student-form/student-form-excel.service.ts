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

    this.ensureFitToPage(sheet);
    this.writeBasicInformation(sheet, data);
    this.writeHealthInformation(sheet, data);
    this.writeGoalsAndPersonality(sheet, data);
    this.writeEducation(sheet, data);
    this.writeWorkHistory(sheet, data);
    this.writeFamily(sheet, data);

    zip.file('xl/worksheets/sheet1.xml', this.serializeXml(sheet));
    await this.updateDrawing(zip, data, photo);

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
    this.setCell(sheet, 'C5', 'Đã kết hôn     Ly thân');
    this.setCell(sheet, 'E5', 'Đã ly hôn');
    this.setCell(sheet, 'G5', 'Chưa kết hôn');
    this.setCell(sheet, 'B6', this.uppercase(data.address));
    this.setCell(sheet, 'J5', `TTS: ${this.clean(data.phone)}`);
    this.setCell(sheet, 'J6', `Người thân: ${this.clean(data.relativePhone)}`);
  }

  private writeHealthInformation(sheet: XMLDocument, data: StudentFormData): void {
    this.setCell(sheet, 'A8', 'Thị lực (Mắt):  Có kính:                 Không kính');
    this.setCell(sheet, 'F8', 'Thuận tay:             Phải              Trái       ');
    this.setCell(sheet, 'A9', 'Mù màu:                      Có                         Không');
    this.setCell(sheet, 'F9', 'Chân tay có dị tật không?');
    this.setCell(sheet, 'J9', 'Có');
    this.setCell(sheet, 'K9', 'Không');
    this.setCell(sheet, 'A10', `Chiều cao: ${this.clean(data.height)} cm`);
    this.setCell(sheet, 'C10', `Cân nặng: ${this.clean(data.weight)} kg`);
    this.setCell(sheet, 'F10', 'Đã phẫu thuật lần nào chưa?');
    this.setCell(sheet, 'J10', 'Có');
    this.setCell(sheet, 'K10', 'Không');
    this.setCell(sheet, 'A11', 'Nhóm máu:         A                B                AB                 O');
    this.setCell(sheet, 'F11', 'Có hình xăm không?');
    this.setCell(sheet, 'J11', 'Có');
    this.setCell(sheet, 'K11', 'Không');
    this.setCell(sheet, 'A12', 'Gia đình có tiền sử bệnh lý không? Có                   Không');
    this.setCell(sheet, 'F12', 'Có uống bia, rượu không?');
    this.setCell(sheet, 'J12', 'Có');
    this.setCell(sheet, 'K12', 'Không');
    this.setCell(
      sheet,
      'A13',
      `Chuyên ngành/chuyên môn đã được đào tạo\n${this.uppercase(data.trainedSpecialty)}`,
    );
    this.setCell(sheet, 'F13', 'Có hút thuốc không?');
    this.setCell(sheet, 'J13', 'Có');
    this.setCell(sheet, 'K13', 'Không');
    this.setCell(sheet, 'F14', `Tôn giáo: ${this.clean(data.religion)}`);
    this.setCell(sheet, 'J14', '');
    this.setCell(sheet, 'K14', '');
  }

  private writeGoalsAndPersonality(sheet: XMLDocument, data: StudentFormData): void {
    this.setCell(sheet, 'F15', `Điểm mạnh (Trong tính cách): ${this.clean(data.strengths)}`);
    this.setCell(sheet, 'F16', `Điểm yếu (Trong tính cách): ${this.clean(data.weaknesses)}`);
    this.setCell(sheet, 'F17', `Sở thích: ${this.clean(data.hobbies)}`);
    this.setCell(sheet, 'C17', 'Có                      Không');
    this.setCell(sheet, 'C18', 'Có                      Không');
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
      `Đã từng                      Nước nào: ${this.clean(data.abroadCountry)}                    Năm nào: ${this.clean(data.abroadYear)}`,
    );
    this.setCell(sheet, 'J24', 'Chưa từng');
    this.setCell(
      sheet,
      'A25',
      'Anh/chị đã từng làm thủ tục đăng ký xin VISA đi Nhật lần nào chưa?  Đã đăng ký',
    );
    this.setCell(sheet, 'J25', 'Chưa từng');
  }

  private writeEducation(sheet: XMLDocument, data: StudentFormData): void {
    for (let index = 0; index < 4; index++) {
      const row = 28 + index;
      const entry = data.education[index];
      if (entry && (entry.from || entry.to || entry.school || entry.major)) {
        const [majorStart, majorEnd] = this.splitText(entry.major, 38);
        this.setCell(sheet, `A${row}`, this.clean(entry.from));
        this.setCell(sheet, `B${row}`, this.clean(entry.to));
        this.setCell(sheet, `C${row}`, this.uppercase(entry.school));
        this.setCell(sheet, `F${row}`, this.clean(majorStart));
        this.setCell(sheet, `J${row}`, this.clean(majorEnd));
      } else {
        this.setCell(sheet, `A${row}`, '');
        this.setCell(sheet, `B${row}`, '');
        this.setCell(sheet, `C${row}`, '');
        this.setCell(sheet, `F${row}`, '');
        this.setCell(sheet, `J${row}`, '');
      }
    }

    this.setCell(
      sheet,
      'A32',
      'Tình trạng học tập:   Học muộn                                    Học sớm                                    Học lại',
    );
    this.setCell(sheet, 'J32', `Năm nào: ${this.clean(data.studyStatusYear)}`);
  }

  private writeWorkHistory(sheet: XMLDocument, data: StudentFormData): void {
    for (let index = 0; index < 4; index++) {
      const row = 35 + index;
      const entry = data.workHistory[index];
      if (entry && (entry.from || entry.to || entry.company || entry.job)) {
        this.setCell(sheet, `A${row}`, this.clean(entry.from));
        this.setCell(sheet, `B${row}`, this.clean(entry.to));
        this.setCell(sheet, `C${row}`, this.uppercase(entry.company));
        this.setCell(sheet, `F${row}`, this.uppercase(entry.job));
      } else {
        this.setCell(sheet, `A${row}`, '');
        this.setCell(sheet, `B${row}`, '');
        this.setCell(sheet, `C${row}`, '');
        this.setCell(sheet, `F${row}`, '');
      }
    }
  }

  private writeFamily(sheet: XMLDocument, data: StudentFormData): void {
    for (let index = 0; index < 6; index++) {
      const row = 42 + index;
      const member = data.family[index];
      if (member && (member.fullName || member.relationship || member.occupation)) {
        this.setCell(sheet, `A${row}`, this.uppercase(member.fullName));
        this.setCell(sheet, `C${row}`, this.uppercase(member.relationship));
        this.setCell(sheet, `E${row}`, this.clean(member.birthYear));
        this.setCell(sheet, `F${row}`, this.uppercase(member.occupation));
        this.setCell(sheet, `H${row}`, member.livingStatus === 'together' ? 'X' : '');
        this.setCell(sheet, `I${row}`, member.livingStatus === 'separate' ? 'X' : '');
      } else {
        this.setCell(sheet, `A${row}`, '');
        this.setCell(sheet, `C${row}`, '');
        this.setCell(sheet, `E${row}`, '');
        this.setCell(sheet, `F${row}`, '');
        this.setCell(sheet, `H${row}`, '');
        this.setCell(sheet, `I${row}`, '');
      }
    }

    this.setCell(
      sheet,
      'J39',
      'Gia đình có đồng ý cho Anh/Chị đi thực tập sinh tại Nhật không?\nCó                    Không',
    );
    this.setCell(
      sheet,
      'A48',
      `Trong các thành viên trong gia đình khai trên: Ai đã từng xin VISA hoặc đã sang Nhật Bản chưa? ${this.clean(
        data.familyJapanHistory,
      )}`,
    );
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

  private ensureFitToPage(sheet: XMLDocument): void {
    let sheetPr = sheet.getElementsByTagNameNS(SPREADSHEET_NS, 'sheetPr')[0];
    if (!sheetPr) {
      sheetPr = sheet.createElementNS(SPREADSHEET_NS, 'sheetPr');
      const root = sheet.documentElement;
      root.insertBefore(sheetPr, root.firstChild);
    }
    let pageSetUpPr = sheetPr.getElementsByTagNameNS(SPREADSHEET_NS, 'pageSetUpPr')[0];
    if (!pageSetUpPr) {
      pageSetUpPr = sheet.createElementNS(SPREADSHEET_NS, 'pageSetUpPr');
      sheetPr.appendChild(pageSetUpPr);
    }
    pageSetUpPr.setAttribute('fitToPage', '1');

    let pageSetup = sheet.getElementsByTagNameNS(SPREADSHEET_NS, 'pageSetup')[0];
    if (!pageSetup) {
      pageSetup = sheet.createElementNS(SPREADSHEET_NS, 'pageSetup');
      sheet.documentElement.appendChild(pageSetup);
    }
    pageSetup.setAttribute('paperSize', '9');
    pageSetup.setAttribute('fitToWidth', '1');
    pageSetup.setAttribute('fitToHeight', '1');
    pageSetup.setAttribute('orientation', 'portrait');
    pageSetup.removeAttribute('scale');
  }

  private async updateDrawing(
    zip: JSZip,
    data: StudentFormData,
    photo?: File,
  ): Promise<void> {
    const drawing = await this.readXml(zip, 'xl/drawings/drawing1.xml');

    // 1. Remove leftover sample textboxes
    const anchors = Array.from(drawing.documentElement.childNodes).filter(
      (node): node is Element => node.nodeType === 1,
    );
    for (const anchor of anchors) {
      const cNvPr =
        anchor.getElementsByTagNameNS(DRAWING_NS, 'cNvPr')[0] ||
        anchor.getElementsByTagName('xdr:cNvPr')[0];
      const name = cNvPr?.getAttribute('name') || '';
      if (name.startsWith('TextBox')) {
        drawing.documentElement.removeChild(anchor);
      }
    }

    // 2. Clone EyeGlasses & EyeNoGlasses shapes if missing
    this.ensureEyesightShapes(drawing);

    // 3. Compute active shape IDs for checkboxes
    const activeShapeIds = this.resolveActiveShapeIds(data);

    // 4. Update each shape in drawing
    const currentAnchors = Array.from(drawing.documentElement.childNodes).filter(
      (node): node is Element => node.nodeType === 1,
    );
    for (const anchor of currentAnchors) {
      const cNvPr =
        anchor.getElementsByTagNameNS(DRAWING_NS, 'cNvPr')[0] ||
        anchor.getElementsByTagName('xdr:cNvPr')[0];
      const shapeId = cNvPr?.getAttribute('id') || '';
      const sp =
        anchor.getElementsByTagNameNS(DRAWING_NS, 'sp')[0] ||
        anchor.getElementsByTagName('xdr:sp')[0];
      if (!sp) continue;

      // Remove any existing txBody
      const existingTx =
        sp.getElementsByTagNameNS(DRAWING_NS, 'txBody')[0] ||
        sp.getElementsByTagName('xdr:txBody')[0];
      if (existingTx) {
        sp.removeChild(existingTx);
      }

      // Update text rectangle boundary in custom geometry to match shape extents
      const ext =
        anchor.getElementsByTagNameNS(DRAWING_NS, 'ext')[0] ||
        anchor.getElementsByTagName('xdr:ext')[0];
      const cx = ext?.getAttribute('cx') || '113030';
      const cy = ext?.getAttribute('cy') || '121920';
      const rect =
        sp.getElementsByTagNameNS(DRAWING_TEXT_NS, 'rect')[0] ||
        sp.getElementsByTagName('a:rect')[0];
      if (rect) {
        rect.setAttribute('l', '0');
        rect.setAttribute('t', '0');
        rect.setAttribute('r', cx);
        rect.setAttribute('b', cy);
      }

      // If active, inject centered 'X' txBody
      if (activeShapeIds.has(shapeId)) {
        this.insertCenteredX(drawing, sp);
      }
    }

    // 5. Handle student portrait photo
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

  private ensureEyesightShapes(drawing: XMLDocument): void {
    let hasShape101 = false;
    let shape55: Element | null = null;

    for (const anchor of Array.from(drawing.documentElement.childNodes).filter(
      (node): node is Element => node.nodeType === 1,
    )) {
      const cNvPr =
        anchor.getElementsByTagNameNS(DRAWING_NS, 'cNvPr')[0] ||
        anchor.getElementsByTagName('xdr:cNvPr')[0];
      const id = cNvPr?.getAttribute('id');
      if (id === '101') {
        hasShape101 = true;
      }
      if (id === '55' || cNvPr?.getAttribute('name') === 'Shape 55') {
        shape55 = anchor;
      }
    }

    if (!hasShape101 && shape55) {
      // Shape 101: EyeGlasses
      const eyeGlasses = shape55.cloneNode(true) as Element;
      const pr1 =
        eyeGlasses.getElementsByTagNameNS(DRAWING_NS, 'cNvPr')[0] ||
        eyeGlasses.getElementsByTagName('xdr:cNvPr')[0];
      pr1.setAttribute('id', '101');
      pr1.setAttribute('name', 'Shape EyeGlasses');
      const row1 =
        eyeGlasses.getElementsByTagNameNS(DRAWING_NS, 'row')[0] ||
        eyeGlasses.getElementsByTagName('xdr:row')[0];
      row1.textContent = '7';
      const off1 =
        eyeGlasses.getElementsByTagNameNS(DRAWING_TEXT_NS, 'off')[0] ||
        eyeGlasses.getElementsByTagName('a:off')[0];
      off1.setAttribute('y', '1550035');
      drawing.documentElement.appendChild(eyeGlasses);

      // Shape 102: EyeNoGlasses
      const eyeNoGlasses = shape55.cloneNode(true) as Element;
      const pr2 =
        eyeNoGlasses.getElementsByTagNameNS(DRAWING_NS, 'cNvPr')[0] ||
        eyeNoGlasses.getElementsByTagName('xdr:cNvPr')[0];
      pr2.setAttribute('id', '102');
      pr2.setAttribute('name', 'Shape EyeNoGlasses');
      const col2 =
        eyeNoGlasses.getElementsByTagNameNS(DRAWING_NS, 'col')[0] ||
        eyeNoGlasses.getElementsByTagName('xdr:col')[0];
      col2.textContent = '3';
      const colOff2 =
        eyeNoGlasses.getElementsByTagNameNS(DRAWING_NS, 'colOff')[0] ||
        eyeNoGlasses.getElementsByTagName('xdr:colOff')[0];
      colOff2.textContent = '296926';
      const row2 =
        eyeNoGlasses.getElementsByTagNameNS(DRAWING_NS, 'row')[0] ||
        eyeNoGlasses.getElementsByTagName('xdr:row')[0];
      row2.textContent = '7';
      const off2 =
        eyeNoGlasses.getElementsByTagNameNS(DRAWING_TEXT_NS, 'off')[0] ||
        eyeNoGlasses.getElementsByTagName('a:off')[0];
      off2.setAttribute('x', '2753995');
      off2.setAttribute('y', '1550035');
      drawing.documentElement.appendChild(eyeNoGlasses);
    }
  }

  private resolveActiveShapeIds(data: StudentFormData): Set<string> {
    const ids = new Set<string>();

    // Marital Status (Row 5)
    switch (data.maritalStatus) {
      case 'married':
        ids.add('22');
        break;
      case 'separated':
        ids.add('56');
        break;
      case 'divorced':
        ids.add('23');
        break;
      case 'single':
        ids.add('24');
        break;
    }

    // Eyesight (Row 8)
    if (data.eyesight === 'glasses') {
      ids.add('101');
    } else if (data.eyesight === 'no-glasses') {
      ids.add('102');
    }

    // Handedness (Row 8)
    if (data.handedness === 'right') {
      ids.add('38');
    } else if (data.handedness === 'left') {
      ids.add('71');
    }

    // Color Blind (Row 9)
    if (data.colorBlind === 'yes') {
      ids.add('55');
    } else if (data.colorBlind === 'no') {
      ids.add('54');
    }

    // Limb Disability (Row 9)
    if (data.limbDisability === 'yes') {
      ids.add('3');
    } else if (data.limbDisability === 'no') {
      ids.add('65');
    }

    // Surgery (Row 10)
    if (data.surgery === 'yes') {
      ids.add('60');
    } else if (data.surgery === 'no') {
      ids.add('66');
    }

    // Blood Type (Row 11)
    switch (data.bloodType) {
      case 'A':
        ids.add('40');
        break;
      case 'B':
        ids.add('53');
        break;
      case 'AB':
        ids.add('8');
        break;
      case 'O':
        ids.add('41');
        break;
    }

    // Tattoo (Row 11)
    if (data.tattoo === 'yes') {
      ids.add('61');
    } else if (data.tattoo === 'no') {
      ids.add('67');
    }

    // Family Medical History (Row 12)
    if (data.familyMedicalHistory === 'yes') {
      ids.add('32');
    } else if (data.familyMedicalHistory === 'no') {
      ids.add('33');
    }

    // Alcohol (Row 12)
    if (data.alcohol === 'yes') {
      ids.add('62');
    } else if (data.alcohol === 'no') {
      ids.add('68');
    }

    // Smoking (Row 13)
    if (data.smoking === 'yes') {
      ids.add('63');
    } else if (data.smoking === 'no') {
      ids.add('69');
    }

    // Religion (Row 14)
    const rel = this.clean(data.religion).toLowerCase();
    if (rel && rel !== 'không' && rel !== 'khong' && rel !== 'none') {
      ids.add('64');
    } else if (data.religion) {
      ids.add('70');
    }

    // Collective Living (Row 17)
    if (data.collectiveLiving === 'yes') {
      ids.add('25');
    } else if (data.collectiveLiving === 'no') {
      ids.add('26');
    }

    // Can Cook (Row 18)
    if (data.canCook === 'yes') {
      ids.add('28');
    } else if (data.canCook === 'no') {
      ids.add('27');
    }

    // Abroad Before (Row 24)
    if (data.abroadBefore === 'yes') {
      ids.add('29');
    } else if (data.abroadBefore === 'no') {
      ids.add('30');
    }

    // Visa Applied (Row 25)
    if (data.visaApplied === 'yes') {
      ids.add('31');
    } else if (data.visaApplied === 'no') {
      ids.add('52');
    }

    // Study Status (Row 32)
    if (data.studiedLate) {
      ids.add('34');
    }
    if (data.studiedEarly) {
      ids.add('35');
    }
    if (data.repeatedGrade) {
      ids.add('36');
    }

    // Family Consent (Row 39/41)
    if (data.familyConsent === 'yes') {
      ids.add('72');
    } else if (data.familyConsent === 'no') {
      ids.add('73');
    }

    return ids;
  }

  private insertCenteredX(drawing: XMLDocument, sp: Element): void {
    const txBody = drawing.createElementNS(DRAWING_NS, 'xdr:txBody');

    const bodyPr = drawing.createElementNS(DRAWING_TEXT_NS, 'a:bodyPr');
    bodyPr.setAttribute('anchor', 'ctr');
    bodyPr.setAttribute('anchorCtr', '1');
    bodyPr.setAttribute('lIns', '0');
    bodyPr.setAttribute('tIns', '0');
    bodyPr.setAttribute('rIns', '0');
    bodyPr.setAttribute('bIns', '0');
    bodyPr.setAttribute('vert', 'horz');
    txBody.appendChild(bodyPr);

    const lstStyle = drawing.createElementNS(DRAWING_TEXT_NS, 'a:lstStyle');
    txBody.appendChild(lstStyle);

    const p = drawing.createElementNS(DRAWING_TEXT_NS, 'a:p');
    const pPr = drawing.createElementNS(DRAWING_TEXT_NS, 'a:pPr');
    pPr.setAttribute('algn', 'ctr');
    p.appendChild(pPr);

    const r = drawing.createElementNS(DRAWING_TEXT_NS, 'a:r');
    const rPr = drawing.createElementNS(DRAWING_TEXT_NS, 'a:rPr');
    rPr.setAttribute('lang', 'en-US');
    rPr.setAttribute('sz', '750');
    rPr.setAttribute('b', '1');

    const solidFill = drawing.createElementNS(DRAWING_TEXT_NS, 'a:solidFill');
    const srgbClr = drawing.createElementNS(DRAWING_TEXT_NS, 'a:srgbClr');
    srgbClr.setAttribute('val', '000000');
    solidFill.appendChild(srgbClr);
    rPr.appendChild(solidFill);

    const latin = drawing.createElementNS(DRAWING_TEXT_NS, 'a:latin');
    latin.setAttribute('typeface', 'Arial');
    rPr.appendChild(latin);

    r.appendChild(rPr);

    const t = drawing.createElementNS(DRAWING_TEXT_NS, 'a:t');
    t.textContent = 'X';
    r.appendChild(t);

    p.appendChild(r);
    txBody.appendChild(p);

    sp.appendChild(txBody);
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
