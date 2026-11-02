import { TestBed } from '@angular/core/testing';
import JSZip from 'jszip';
import { StudentFormExcelService } from './student-form-excel.service';
import { createStudentFormData } from './student-form.model';

const SPREADSHEET_NS = 'http://schemas.openxmlformats.org/spreadsheetml/2006/main';
const DRAWING_NS = 'http://schemas.openxmlformats.org/drawingml/2006/spreadsheetDrawing';
const DRAWING_TEXT_NS = 'http://schemas.openxmlformats.org/drawingml/2006/main';

describe('StudentFormExcelService', () => {
  let service: StudentFormExcelService;
  let templateBytes: Uint8Array;

  beforeAll(async () => {
    const response = await fetch('assets/file/form-hocvien.xlsx');
    templateBytes = new Uint8Array(await response.arrayBuffer());
  });

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StudentFormExcelService);
  });

  it('should fill the original Excel template with clean cell text and centered checkbox shapes', async () => {
    const data = createStudentFormData();
    data.fullName = 'Nguyễn Văn A';
    data.idNumber = '012345678901';
    data.phone = '0912345678';
    data.maritalStatus = 'single';
    data.colorBlind = 'no';
    data.education[0] = {
      from: '09/2018',
      to: '06/2021',
      school: 'THPT Nguyễn Du',
      major: 'Công nghệ thông tin',
    };

    const output = await service.createWorkbook(templateBytes, data);
    const zip = await JSZip.loadAsync(output);
    const sheet = parseXml(await zip.file('xl/worksheets/sheet1.xml')!.async('string'));
    const drawing = parseXml(await zip.file('xl/drawings/drawing1.xml')!.async('string'));

    // Clean cell text without stray 'X'
    expect(cellText(sheet, 'B3')).toBe('NGUYỄN VĂN A');
    expect(cellText(sheet, 'G3')).toContain('012345678901');
    expect(cellText(sheet, 'G5')).toBe('Chưa kết hôn');
    expect(cellText(sheet, 'J9')).toBe('Có');
    expect(cellText(sheet, 'K9')).toBe('Không');
    expect(cellText(sheet, 'C28')).toBe('THPT NGUYỄN DU');
    expect(cellText(sheet, 'F28')).toBe('Công nghệ thông tin');

    // Residual template rows are wiped clean
    expect(cellText(sheet, 'C29')).toBe('');
    expect(cellText(sheet, 'C30')).toBe('');

    // Checkbox shape tests: Shape 24 (single) and Shape 54 (colorBlind no) should have 'X'
    expect(shapeHasX(drawing, '24')).toBeTrue();
    expect(shapeHasX(drawing, '54')).toBeTrue();
    // Shape 22 (married) should NOT have 'X'
    expect(shapeHasX(drawing, '22')).toBeFalse();

    expect(zip.file('xl/worksheets/sheet2.xml')).toBeTruthy();
    expect(zip.file('xl/worksheets/sheet3.xml')).toBeTruthy();
    expect(zip.file('xl/media/image1.png')).toBeNull();
    expect(drawing.getElementsByTagNameNS(DRAWING_NS, 'pic').length).toBe(0);
  });

  it('should preserve the photo frame and replace the image when a photo is selected', async () => {
    const data = createStudentFormData();
    const pngBytes = Uint8Array.from(
      atob(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
      ),
      (character) => character.charCodeAt(0),
    );
    const photo = new File([pngBytes], 'photo.png', { type: 'image/png' });

    const output = await service.createWorkbook(templateBytes, data, photo);
    const zip = await JSZip.loadAsync(output);
    const drawing = parseXml(await zip.file('xl/drawings/drawing1.xml')!.async('string'));
    const embeddedPhoto = await zip.file('xl/media/image1.png')!.async('uint8array');

    expect(drawing.getElementsByTagNameNS(DRAWING_NS, 'pic').length).toBe(1);
    expect(Array.from(embeddedPhoto)).toEqual(Array.from(pngBytes));
  });
});

function parseXml(value: string): XMLDocument {
  return new DOMParser().parseFromString(value, 'application/xml');
}

function cellText(sheet: XMLDocument, reference: string): string {
  const cell = Array.from(sheet.getElementsByTagNameNS(SPREADSHEET_NS, 'c')).find(
    (candidate) => candidate.getAttribute('r') === reference,
  );
  return cell?.textContent ?? '';
}

function shapeHasX(drawing: XMLDocument, shapeId: string): boolean {
  const anchors = Array.from(drawing.documentElement.childNodes).filter(
    (node): node is Element => node.nodeType === 1,
  );
  for (const anchor of anchors) {
    const cNvPr =
      anchor.getElementsByTagNameNS(DRAWING_NS, 'cNvPr')[0] ||
      anchor.getElementsByTagName('xdr:cNvPr')[0];
    if (cNvPr?.getAttribute('id') === shapeId) {
      const txBody =
        anchor.getElementsByTagNameNS(DRAWING_NS, 'txBody')[0] ||
        anchor.getElementsByTagName('xdr:txBody')[0];
      return (txBody?.textContent || '').includes('X');
    }
  }
  return false;
}
