const VIEJAP_DRIVE_FOLDER_ID = '__VIEJAP_DRIVE_FOLDER_ID__';
const VIEJAP_WEBHOOK_SECRET = '__VIEJAP_DRIVE_WEBHOOK_SECRET__';
const EXCEL_MIME_TYPE =
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
const MAX_FILE_BYTES = 10 * 1024 * 1024;

function doPost(event) {
  try {
    const payload = JSON.parse(event.postData.contents || '{}');
    if (!safeEquals_(String(payload.secret || ''), VIEJAP_WEBHOOK_SECRET)) {
      return json_({ ok: false, message: 'Không có quyền truy cập.' });
    }

    const fileName = sanitizeFileName_(payload.fileName);
    const bytes = Utilities.base64Decode(String(payload.base64 || ''));
    if (!fileName.endsWith('.xlsx') || bytes.length < 4 || bytes.length > MAX_FILE_BYTES) {
      return json_({ ok: false, message: 'File Excel không hợp lệ.' });
    }
    if (bytes[0] !== 0x50 || bytes[1] !== 0x4b) {
      return json_({ ok: false, message: 'Nội dung file không phải workbook Excel.' });
    }

    const root = DriveApp.getFolderById(VIEJAP_DRIVE_FOLDER_ID);
    const monthFolder = getOrCreateFolder_(root, Utilities.formatDate(
      new Date(),
      Session.getScriptTimeZone(),
      'yyyy-MM',
    ));
    const blob = Utilities.newBlob(bytes, EXCEL_MIME_TYPE, fileName);
    const file = monthFolder.createFile(blob);
    const metadata = payload.metadata || {};
    file.setDescription(
      [
        `Mã hồ sơ: ${String(metadata.submissionId || '')}`,
        `Họ tên: ${String(metadata.fullName || '')}`,
        `Số điện thoại: ${String(metadata.phone || '')}`,
        `CMT/CCCD: ***${String(metadata.idNumberLast4 || '')}`,
        `Gửi lúc: ${String(metadata.submittedAt || '')}`,
      ].join('\n'),
    );

    return json_({
      ok: true,
      fileId: file.getId(),
      message: 'Đã lưu file vào Google Drive.',
    });
  } catch (error) {
    console.error(error);
    return json_({ ok: false, message: 'Google Drive không thể lưu hồ sơ.' });
  }
}

function getOrCreateFolder_(parent, name) {
  const folders = parent.getFoldersByName(name);
  return folders.hasNext() ? folders.next() : parent.createFolder(name);
}

function sanitizeFileName_(value) {
  const name = String(value || 'ho-so-hoc-vien.xlsx')
    .replace(/[\\/:*?"<>|\u0000-\u001f]/g, '-')
    .slice(0, 180);
  return name.toLowerCase().endsWith('.xlsx') ? name : `${name}.xlsx`;
}

function safeEquals_(left, right) {
  if (!left || !right || left.length !== right.length) {
    return false;
  }
  let difference = 0;
  for (let index = 0; index < left.length; index += 1) {
    difference |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }
  return difference === 0;
}

function json_(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(
    ContentService.MimeType.JSON,
  );
}
