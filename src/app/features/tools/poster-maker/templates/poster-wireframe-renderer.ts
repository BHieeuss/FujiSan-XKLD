import { TemplateId } from '../models/poster-template.model';
import { POSTER_WIDTH, POSTER_HEIGHT } from '../poster-renderer';

const FONT_FAMILY = '"Be Vietnam Pro", "Noto Sans", Arial, sans-serif';

function setWireframeFont(
  ctx: CanvasRenderingContext2D,
  weight: number,
  size: number,
): void {
  ctx.font = `${weight} ${size}px ${FONT_FAMILY}`;
}

/**
 * Vẽ khối hộp Wireframe với nhãn trung tâm, icon, và viền chuyên nghiệp
 */
function drawWireframeBlock(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  options: {
    label: string;
    sublabel?: string;
    badge?: string;
    bgColor?: string;
    borderColor?: string;
    borderDashed?: boolean;
    borderWidth?: number;
    textColor?: string;
    fontSize?: number;
    radius?: number;
    iconType?: 'photo' | 'title' | 'salary' | 'list' | 'info' | 'qr' | 'slogan' | 'logo';
  },
): void {
  const {
    label,
    sublabel,
    badge,
    bgColor = '#FFFFFF',
    borderColor = '#94A3B8',
    borderDashed = true,
    borderWidth = 2,
    textColor = '#103B63',
    fontSize = 24,
    radius = 16,
    iconType,
  } = options;

  ctx.save();

  // 1. Nền
  ctx.fillStyle = bgColor;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, radius);
  ctx.fill();

  // 2. Viền
  if (borderWidth > 0 && borderColor) {
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = borderWidth;
    if (borderDashed) {
      ctx.setLineDash([8, 6]);
    } else {
      ctx.setLineDash([]);
    }
    ctx.stroke();
    ctx.setLineDash([]);
  }

  // 3. Badge góc trên trái (nếu có)
  if (badge) {
    ctx.save();
    setWireframeFont(ctx, 700, 15);
    const badgePadX = 14;
    const badgeH = 26;
    const badgeW = Math.min(w - 20, ctx.measureText(badge).width + badgePadX * 2);
    ctx.fillStyle = '#0B5F9E';
    ctx.beginPath();
    ctx.roundRect(x + 10, y + 10, badgeW, badgeH, 13);
    ctx.fill();

    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(badge, x + 10 + badgeW / 2, y + 10 + badgeH / 2 + 1);
    ctx.restore();
  }

  // 4. Biểu tượng đồ họa wireframe và văn bản trung tâm
  const centerY = badge ? y + h / 2 + 10 : y + h / 2;
  const hasSub = Boolean(sublabel);

  // Vẽ icon tương ứng nếu có
  if (iconType === 'photo') {
    drawCameraIcon(ctx, x + w / 2, centerY - (hasSub ? 42 : 32), 34, textColor);
  } else if (iconType === 'salary') {
    drawYenIcon(ctx, x + 36, centerY, 30, textColor);
  }

  // Nhãn chính
  ctx.textAlign = iconType === 'salary' ? 'left' : 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = textColor;
  setWireframeFont(ctx, 800, fontSize);

  const textX = iconType === 'salary' ? x + 72 : x + w / 2;
  const textY = iconType === 'photo' ? centerY + (hasSub ? 6 : 14) : hasSub ? centerY - 10 : centerY;
  ctx.fillText(label, textX, textY);

  // Nhãn phụ (sublabel)
  if (sublabel) {
    setWireframeFont(ctx, 500, Math.max(14, fontSize - 6));
    ctx.fillStyle = '#64748B';
    ctx.fillText(sublabel, textX, textY + fontSize + 4);
  }

  ctx.restore();
}

/**
 * Biểu tượng Máy ảnh / Khung ảnh wireframe
 */
function drawCameraIcon(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number,
  color: string,
): void {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 2.5;
  ctx.fillStyle = 'rgba(11, 95, 158, 0.08)';

  const w = size * 1.3;
  const h = size * 0.95;
  const x = cx - w / 2;
  const y = cy - h / 2;

  // Thân máy ảnh
  ctx.beginPath();
  ctx.roundRect(x, y + 6, w, h - 6, 8);
  ctx.fill();
  ctx.stroke();

  // Đỉnh gù máy ảnh
  ctx.beginPath();
  ctx.roundRect(cx - w * 0.25, y, w * 0.5, 9, 3);
  ctx.fill();
  ctx.stroke();

  // Vòng ống kính
  ctx.beginPath();
  ctx.arc(cx, y + 6 + (h - 6) / 2, (h - 6) * 0.32, 0, Math.PI * 2);
  ctx.stroke();

  ctx.restore();
}

/**
 * Biểu tượng Đồng Yên Nhật
 */
function drawYenIcon(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number,
  color: string,
): void {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 2.5;
  ctx.lineCap = 'round';

  const s = size * 0.45;
  ctx.beginPath();
  ctx.moveTo(cx - s, cy - s);
  ctx.lineTo(cx, cy - 2);
  ctx.lineTo(cx + s, cy - s);
  ctx.moveTo(cx, cy - 2);
  ctx.lineTo(cx, cy + s);

  ctx.moveTo(cx - s * 0.8, cy - s * 0.15);
  ctx.lineTo(cx + s * 0.8, cy - s * 0.15);

  ctx.moveTo(cx - s * 0.8, cy + s * 0.35);
  ctx.lineTo(cx + s * 0.8, cy + s * 0.35);
  ctx.stroke();
  ctx.restore();
}

/**
 * Vẽ thanh Skeleton giả lập dòng văn bản bố cục
 */
function drawSkeletonBar(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h = 16,
  color = '#E2E8F0',
  radius = 8,
): void {
  ctx.save();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, radius);
  ctx.fill();
  ctx.restore();
}

/**
 * Vẽ nền chung của bản vẽ kỹ thuật bố cục (Drafting Blueprint background)
 */
function drawBlueprintCanvasBase(
  ctx: CanvasRenderingContext2D,
  templateTitle: string,
  badgeText: string,
  photoCountNote: string,
): void {
  // 1. Nền canvas sạch sẽ
  ctx.fillStyle = '#F8FAFD';
  ctx.fillRect(0, 0, POSTER_WIDTH, POSTER_HEIGHT);

  // 2. Lưới kỹ thuật drafting grid mờ nhẹ (40px)
  ctx.save();
  ctx.strokeStyle = 'rgba(16, 59, 99, 0.035)';
  ctx.lineWidth = 1;
  for (let x = 40; x < POSTER_WIDTH; x += 40) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, POSTER_HEIGHT);
    ctx.stroke();
  }
  for (let y = 40; y < POSTER_HEIGHT; y += 40) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(POSTER_WIDTH, y);
    ctx.stroke();
  }

  // 3. Đường chỉ giới lề an toàn (Safe Margin: 48px)
  ctx.strokeStyle = 'rgba(11, 95, 158, 0.15)';
  ctx.lineWidth = 1.5;
  ctx.setLineDash([6, 6]);
  ctx.strokeRect(48, 48, POSTER_WIDTH - 96, POSTER_HEIGHT - 96);
  ctx.setLineDash([]);
  ctx.restore();

  // 4. Thanh Top Blueprint Header
  ctx.save();
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.roundRect(48, 20, POSTER_WIDTH - 96, 60, 12);
  ctx.fill();
  ctx.strokeStyle = '#CBD5E1';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Huy hiệu "BẢN VẼ BỐ CỤC DỰ KIẾN"
  ctx.fillStyle = '#103B63';
  ctx.beginPath();
  ctx.roundRect(60, 32, 210, 36, 8);
  ctx.fill();
  ctx.fillStyle = '#FFFFFF';
  setWireframeFont(ctx, 800, 15);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('SƠ ĐỒ BỐ CỤC DỰ KIẾN', 165, 50);

  // Tên mẫu & số ảnh cần
  ctx.textAlign = 'left';
  ctx.fillStyle = '#103B63';
  setWireframeFont(ctx, 800, 20);
  ctx.fillText(templateTitle, 286, 50);

  ctx.fillStyle = '#0B5F9E';
  setWireframeFont(ctx, 700, 16);
  ctx.textAlign = 'right';
  ctx.fillText(`${badgeText} • ${photoCountNote}`, POSTER_WIDTH - 64, 50);
  ctx.restore();
}

/**
 * ═══════════════════════════════════════════════════════
 * 1. WIREFRAME MẪU TIÊU CHUẨN (japan_signature)
 * 2 ảnh (ảnh chính lớn + ảnh phụ góc phải), dải lương chuẩn, 4 cột thông tin
 * ═══════════════════════════════════════════════════════
 */
export function renderJapanSignatureWireframe(ctx: CanvasRenderingContext2D): void {
  const PAD = 48;
  const W = POSTER_WIDTH - PAD * 2;

  drawBlueprintCanvasBase(
    ctx,
    'MẪU TIÊU CHUẨN',
    'Tiêu chuẩn Nhật',
    'Cần 2 ảnh',
  );

  // ─── KHU VỰC 1: HEADER THƯƠNG HIỆU ───
  drawWireframeBlock(ctx, PAD, 96, 420, 92, {
    label: '[ KHU VỰC LOGO CÔNG TY VIEJAP ]',
    sublabel: 'Tỷ lệ ngang 4.5:1 • Tự động co giãn sắc nét',
    badge: 'HEADER TRÁI',
    bgColor: '#FFFFFF',
    borderColor: '#94A3B8',
    textColor: '#103B63',
    fontSize: 20,
    radius: 14,
  });

  drawWireframeBlock(ctx, POSTER_WIDTH - PAD - 220, 114, 220, 56, {
    label: '[ MÃ ĐƠN HÀNG ]',
    badge: 'MÃ TUYỂN DỤNG',
    bgColor: '#EAF3FA',
    borderColor: '#0B5F9E',
    borderDashed: false,
    textColor: '#0B5F9E',
    fontSize: 18,
    radius: 28,
  });

  // ─── KHU VỰC 2: TIÊU ĐỀ ĐƠN HÀNG & MÔ TẢ ───
  const TITLE_TOP = 208;
  drawWireframeBlock(ctx, PAD, TITLE_TOP, W, 142, {
    label: '[ TIÊU ĐỀ ĐƠN HÀNG TUYỂN DỤNG ]',
    sublabel: 'Chữ in hoa cỡ lớn (70px) • Hiển thị 1 - 2 dòng nổi bật trên điện thoại',
    badge: 'KHỐI TIÊU ĐỀ CHÍNH',
    bgColor: '#FFFFFF',
    borderColor: '#0B5F9E',
    textColor: '#103B63',
    fontSize: 26,
    radius: 16,
  });

  // 2 thanh skeleton mô tả tóm tắt
  drawSkeletonBar(ctx, PAD, TITLE_TOP + 154, W * 0.75, 20, '#CBD5E1', 10);
  drawSkeletonBar(ctx, PAD, TITLE_TOP + 182, W * 0.48, 18, '#E2E8F0', 9);

  // ─── KHU VỰC 3: CỤM 2 ẢNH (ẢNH CHÍNH & ẢNH PHỤ MÔI TRƯỜNG) ───
  const IMG_TOP = 432;
  const MAIN_H = 488;

  // Ảnh chính lớn
  drawWireframeBlock(ctx, PAD, IMG_TOP, W, MAIN_H, {
    label: 'KHUNG ẢNH CHÍNH (CÔNG VIỆC THỰC TẾ)',
    sublabel: 'Slot 1: Ảnh ngang rộng • Bo góc mềm 24px • Tự động cắt căn giữa chuẩn khung',
    badge: 'ẢNH CHÍNH (SLOT 1)',
    bgColor: '#EFF6FC',
    borderColor: '#0B5F9E',
    borderWidth: 2.5,
    borderDashed: true,
    textColor: '#103B63',
    fontSize: 28,
    radius: 24,
    iconType: 'photo',
  });

  // Ảnh phụ môi trường (xếp đè lên góc phải dưới của ảnh chính)
  const SEC_W = 380;
  const SEC_H = 250;
  const SEC_X = POSTER_WIDTH - PAD - SEC_W;
  const SEC_Y = IMG_TOP + MAIN_H - SEC_H + 34;

  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.16)';
  ctx.shadowBlur = 18;
  ctx.shadowOffsetY = 6;
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.roundRect(SEC_X - 6, SEC_Y - 6, SEC_W + 12, SEC_H + 12, 20);
  ctx.fill();
  ctx.restore();

  drawWireframeBlock(ctx, SEC_X, SEC_Y, SEC_W, SEC_H, {
    label: 'ẢNH PHỤ (MÔI TRƯỜNG)',
    sublabel: 'Slot 2: Xí nghiệp / KTX / Đồng nghiệp',
    badge: 'MÔI TRƯỜNG LÀM VIỆC (SLOT 2)',
    bgColor: '#F1F5F9',
    borderColor: '#0B5F9E',
    borderWidth: 2,
    borderDashed: false,
    textColor: '#0B5F9E',
    fontSize: 22,
    radius: 16,
    iconType: 'photo',
  });

  // ─── KHU VỰC 4: DẢI MỨC LƯƠNG CHUẨN VIEJAP ───
  const SAL_TOP = IMG_TOP + MAIN_H + 46;
  const SAL_H = 114;

  drawWireframeBlock(ctx, PAD, SAL_TOP, W, SAL_H, {
    label: 'KHỐI HIỂN THỊ MỨC LƯƠNG (CƠ BẢN & THỰC LĨNH)',
    sublabel: 'Biểu tượng đồng Yên Nhật • Nền thẻ xanh thương hiệu VieJap nổi bật',
    badge: 'CHẾ ĐỘ ĐÃI NGỘ',
    bgColor: '#103B63',
    borderColor: '#0B5F9E',
    borderWidth: 2,
    borderDashed: false,
    textColor: '#FFFFFF',
    fontSize: 26,
    radius: 16,
    iconType: 'salary',
  });

  // ─── KHU VỰC 5: QUYỀN LỢI & YÊU CẦU ───
  const REQ_TOP = SAL_TOP + SAL_H + 24;

  ctx.save();
  ctx.fillStyle = '#0B5F9E';
  ctx.beginPath();
  ctx.roundRect(PAD, REQ_TOP + 8, 48, 6, 3);
  ctx.fill();
  ctx.fillStyle = '#103B63';
  setWireframeFont(ctx, 800, 26);
  ctx.fillText('QUYỀN LỢI & TIÊU CHUẨN TIẾP NHẬN', PAD + 64, REQ_TOP);
  ctx.restore();

  // 3 dòng skeleton với số thứ tự biên tập 01, 02, 03
  for (let i = 0; i < 3; i++) {
    const itemY = REQ_TOP + 46 + i * 50;
    // Huy hiệu số tròn
    ctx.save();
    ctx.fillStyle = '#EAF3FA';
    ctx.beginPath();
    ctx.arc(PAD + 18, itemY + 12, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#0B5F9E';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = '#0B5F9E';
    setWireframeFont(ctx, 800, 15);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`0${i + 1}`, PAD + 18, itemY + 13);
    ctx.restore();

    // Thanh mô tả
    const barWidths = [W - 60, W - 120, W - 90];
    drawSkeletonBar(ctx, PAD + 46, itemY + 2, barWidths[i], 22, '#E2E8F0', 11);
  }

  // ─── KHU VỰC 6: 4 CỘT THÔNG TIN TUYỂN DỤNG (FACTS GRID) ───
  const FACTS_TOP = 1430;
  const FACT_H = 104;
  const FACT_GAP = 16;
  const FACT_W = Math.round((W - FACT_GAP * 3) / 4);

  const facts = [
    { title: 'ĐỊA ĐIỂM', sub: 'Tỉnh / Thành phố' },
    { title: 'ĐỘ TUỔI', sub: 'Quy định tiếp nhận' },
    { title: 'PHỎNG VẤN', sub: 'Ngày thi tuyển' },
    { title: 'XUẤT CẢNH', sub: 'Dự kiến xuất cảnh' },
  ];

  facts.forEach((f, idx) => {
    const fx = PAD + idx * (FACT_W + FACT_GAP);
    drawWireframeBlock(ctx, fx, FACTS_TOP, FACT_W, FACT_H, {
      label: f.title,
      sublabel: f.sub,
      bgColor: '#FFFFFF',
      borderColor: '#CBD5E1',
      borderWidth: 1.5,
      borderDashed: false,
      textColor: '#103B63',
      fontSize: 18,
      radius: 12,
    });
  });

  // ─── KHU VỰC 7: FOOTER CHÂN TRANG & MÃ QR ───
  const FOOTER_TOP = 1570;
  const FOOTER_H = POSTER_HEIGHT - FOOTER_TOP - PAD;

  ctx.save();
  ctx.fillStyle = '#103B63';
  ctx.beginPath();
  ctx.roundRect(PAD, FOOTER_TOP, W, FOOTER_H, 20);
  ctx.fill();

  // Khối Hotline bên trái
  ctx.fillStyle = '#FFFFFF';
  setWireframeFont(ctx, 800, 28);
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText('HOTLINE TƯ VẤN 24/7', PAD + 36, FOOTER_TOP + 46);
  setWireframeFont(ctx, 600, 20);
  ctx.fillStyle = '#CBD5E1';
  ctx.fillText('0966 966 284  •  viejaptravinh@gmail.com', PAD + 36, FOOTER_TOP + 88);
  ctx.fillText('ĐĂNG KÝ HỒ SƠ NGAY HÔM NAY', PAD + 36, FOOTER_TOP + 124);

  // Khối QR bên phải
  const QR_SIZE = 170;
  const QR_X = POSTER_WIDTH - PAD - QR_SIZE - 32;
  const QR_Y = FOOTER_TOP + Math.round((FOOTER_H - QR_SIZE) / 2);

  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.roundRect(QR_X, QR_Y, QR_SIZE, QR_SIZE, 14);
  ctx.fill();

  ctx.strokeStyle = '#0B5F9E';
  ctx.lineWidth = 2;
  ctx.setLineDash([4, 4]);
  ctx.strokeRect(QR_X + 10, QR_Y + 10, QR_SIZE - 20, QR_SIZE - 20);
  ctx.setLineDash([]);

  ctx.fillStyle = '#103B63';
  setWireframeFont(ctx, 800, 17);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('QUÉT MÃ QR', QR_X + QR_SIZE / 2, QR_Y + QR_SIZE / 2 - 12);
  setWireframeFont(ctx, 600, 13);
  ctx.fillStyle = '#64748B';
  ctx.fillText('Đăng ký trực tiếp', QR_X + QR_SIZE / 2, QR_Y + QR_SIZE / 2 + 14);

  ctx.restore();
}

/**
 * ═══════════════════════════════════════════════════════
 * 2. WIREFRAME MẪU 1 (industrial_pro / Editorial Hiring)
 * CỤM 3 ẢNH BO LƯỢN, 2 SLOGAN THƯ PHÁP (Đỉnh & Đáy), Vệt cọ lương nghệ thuật
 * ═══════════════════════════════════════════════════════
 */
export function renderIndustrialProWireframe(ctx: CanvasRenderingContext2D): void {
  const PAD = 48;
  const W = POSTER_WIDTH - PAD * 2;

  drawBlueprintCanvasBase(
    ctx,
    'MẪU 1 — EDITORIAL HIRING',
    'Cơ khí & Điện tử',
    'Cần 3 ảnh',
  );

  // ─── KHU VỰC 1: HEADER TRÁI PHẢI ───
  drawWireframeBlock(ctx, PAD, 96, 380, 84, {
    label: '[ LOGO CÔNG TY VIEJAP ]',
    sublabel: 'Tỷ lệ co giãn thương hiệu chuẩn',
    badge: 'HEADER',
    bgColor: '#FFFFFF',
    borderColor: '#94A3B8',
    textColor: '#103B63',
    fontSize: 19,
    radius: 12,
  });

  drawWireframeBlock(ctx, POSTER_WIDTH - PAD - 200, 110, 200, 52, {
    label: '[ MÃ ĐƠN HÀNG ]',
    badge: 'MÃ TUYỂN',
    bgColor: '#EAF3FA',
    borderColor: '#0B5F9E',
    borderDashed: false,
    textColor: '#0B5F9E',
    fontSize: 17,
    radius: 26,
  });

  // ─── KHU VỰC 2: TIÊU ĐỀ BÊN TRÁI + SLOGAN THƯ PHÁP GÓC PHẢI TRÊN ───
  const TITLE_TOP = 198;
  const TITLE_W = 620;

  drawWireframeBlock(ctx, PAD, TITLE_TOP, TITLE_W, 148, {
    label: '[ TIÊU ĐỀ ĐƠN HÀNG EDITORIAL ]',
    sublabel: 'Bố cục chữ dạng tạp chí hiện đại • Khung chữ in hoa khổ lớn',
    badge: 'TIÊU ĐỀ CHÍNH',
    bgColor: '#FFFFFF',
    borderColor: '#0B5F9E',
    textColor: '#103B63',
    fontSize: 24,
    radius: 16,
  });

  // Slogan Thư Pháp 1 góc trên phải (đặc trưng của Mẫu 1)
  const SLOGAN1_W = W - TITLE_W - 20;
  const SLOGAN1_X = POSTER_WIDTH - PAD - SLOGAN1_W;
  drawWireframeBlock(ctx, SLOGAN1_X, TITLE_TOP, SLOGAN1_W, 148, {
    label: 'KHẨU HIỆU THƯ PHÁP 1',
    sublabel: '"Làm việc tại Nhật Bản"',
    badge: 'SLOGAN ĐỈNH',
    bgColor: '#FEF9F0',
    borderColor: '#F5A623',
    borderDashed: false,
    borderWidth: 2,
    textColor: '#B45309',
    fontSize: 20,
    radius: 16,
  });

  // ─── KHU VỰC 3: CỤM 3 ẢNH BO LƯỢN NGHỆ THUẬT (ĐẶC TRƯNG MẪU 1) ───
  const PHOTO_TOP = 368;
  const PHOTO1_W = 470;
  const PHOTO1_H = 590;
  const PHOTO2_X = PAD + PHOTO1_W + 20;
  const PHOTO2_W = W - PHOTO1_W - 20; // 494
  const PHOTO2_H = 285;

  // Ảnh 1: Dọc cao bên trái
  drawWireframeBlock(ctx, PAD, PHOTO_TOP, PHOTO1_W, PHOTO1_H, {
    label: 'KHUNG ẢNH 1 (DỌC CAO)',
    sublabel: 'Slot 1: Thao tác kỹ thuật / Công việc thực tế\nBo góc lượn nghệ thuật bất đối xứng',
    badge: 'ẢNH CHÍNH (SLOT 1)',
    bgColor: '#EFF6FC',
    borderColor: '#0B5F9E',
    borderWidth: 2.5,
    borderDashed: true,
    textColor: '#103B63',
    fontSize: 24,
    radius: 28,
    iconType: 'photo',
  });

  // Ảnh 2: Ngang trên bên phải
  drawWireframeBlock(ctx, PHOTO2_X, PHOTO_TOP, PHOTO2_W, PHOTO2_H, {
    label: 'KHUNG ẢNH 2 (MÔI TRƯỜNG)',
    sublabel: 'Slot 2: Xí nghiệp / Dây chuyền sản xuất',
    badge: 'ẢNH 2 (SLOT 2)',
    bgColor: '#F1F5F9',
    borderColor: '#0B5F9E',
    borderWidth: 2,
    borderDashed: true,
    textColor: '#103B63',
    fontSize: 22,
    radius: 20,
    iconType: 'photo',
  });

  // Ảnh 3: Ngang dưới bên phải
  drawWireframeBlock(ctx, PHOTO2_X, PHOTO_TOP + PHOTO2_H + 20, PHOTO2_W, PHOTO2_H, {
    label: 'KHUNG ẢNH 3 (HOẠT ĐỘNG)',
    sublabel: 'Slot 3: Đời sống học viên / Đội ngũ kỹ sư',
    badge: 'ẢNH 3 (SLOT 3)',
    bgColor: '#F1F5F9',
    borderColor: '#0B5F9E',
    borderWidth: 2,
    borderDashed: true,
    textColor: '#103B63',
    fontSize: 22,
    radius: 20,
    iconType: 'photo',
  });

  // ─── KHU VỰC 4: VỆT CỌ SƠN LƯƠNG NGHỆ THUẬT (MẪU 1) ───
  const SAL_TOP = PHOTO_TOP + PHOTO1_H + 26;
  const SAL_H = 120;
  const SAL_W = W - 140;

  drawWireframeBlock(ctx, PAD, SAL_TOP, SAL_W, SAL_H, {
    label: 'VỆT CỌ SƠN LƯƠNG NGHỆ THUẬT',
    sublabel: 'Lương cơ bản & Lương thực lĩnh hiển thị trên nét cọ uốn lượn phong cách Editorial',
    badge: 'DẢI LƯƠNG NGHỆ THUẬT',
    bgColor: '#EAF3FA',
    borderColor: '#0B5F9E',
    borderWidth: 2.5,
    borderDashed: false,
    textColor: '#103B63',
    fontSize: 24,
    radius: 20,
    iconType: 'salary',
  });

  // ─── KHU VỰC 5: QUYỀN LỢI & SLOGAN THƯ PHÁP 2 (GÓC PHẢI) ───
  const REQ_TOP = SAL_TOP + SAL_H + 26;
  const REQ_W = W - 320;

  ctx.save();
  ctx.fillStyle = '#0B5F9E';
  ctx.beginPath();
  ctx.roundRect(PAD, REQ_TOP + 8, 48, 6, 3);
  ctx.fill();
  ctx.fillStyle = '#103B63';
  setWireframeFont(ctx, 800, 26);
  ctx.fillText('QUYỀN LỢI & YÊU CẦU TUYỂN DỤNG', PAD + 64, REQ_TOP);
  ctx.restore();

  // 3 dòng tích tròn
  for (let i = 0; i < 3; i++) {
    const itemY = REQ_TOP + 46 + i * 48;
    // Dấu tích tròn navy
    ctx.save();
    ctx.fillStyle = '#103B63';
    ctx.beginPath();
    ctx.arc(PAD + 16, itemY + 11, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(PAD + 11, itemY + 11);
    ctx.lineTo(PAD + 15, itemY + 15);
    ctx.lineTo(PAD + 22, itemY + 7);
    ctx.stroke();
    ctx.restore();

    drawSkeletonBar(ctx, PAD + 42, itemY + 2, REQ_W - 50, 20, '#E2E8F0', 10);
  }

  // Khẩu hiệu thư pháp 2 góc phải ("Cơ hội việc làm tốt / Tại Nhật Bản")
  const SLOGAN2_X = POSTER_WIDTH - PAD - 290;
  drawWireframeBlock(ctx, SLOGAN2_X, REQ_TOP + 12, 290, 146, {
    label: 'KHẨU HIỆU THƯ PHÁP 2',
    sublabel: '"Cơ hội việc làm tốt\nTại Nhật Bản" (Kèm sóng)',
    badge: 'SLOGAN GÓC PHẢI',
    bgColor: '#FEF9F0',
    borderColor: '#0B5F9E',
    borderWidth: 2,
    borderDashed: false,
    textColor: '#103B63',
    fontSize: 19,
    radius: 14,
  });

  // ─── KHU VỰC 6: 4 KHỐI THÔNG TIN TUYỂN DỤNG ───
  const FACTS_TOP = 1430;
  const FACT_H = 104;
  const FACT_GAP = 16;
  const FACT_W = Math.round((W - FACT_GAP * 3) / 4);

  const facts = [
    { title: 'ĐỊA ĐIỂM', sub: 'Khu vực làm việc' },
    { title: 'ĐỘ TUỔI', sub: 'Nam / Nữ tiếp nhận' },
    { title: 'PHỎNG VẤN', sub: 'Hình thức & Ngày' },
    { title: 'XUẤT CẢNH', sub: 'Tiến độ xuất cảnh' },
  ];

  facts.forEach((f, idx) => {
    const fx = PAD + idx * (FACT_W + FACT_GAP);
    drawWireframeBlock(ctx, fx, FACTS_TOP, FACT_W, FACT_H, {
      label: f.title,
      sublabel: f.sub,
      bgColor: '#FFFFFF',
      borderColor: '#CBD5E1',
      borderWidth: 1.5,
      borderDashed: false,
      textColor: '#103B63',
      fontSize: 18,
      radius: 12,
    });
  });

  // ─── KHU VỰC 7: FOOTER DẢI SÓNG ĐÔI NGHỆ THUẬT ───
  const FOOTER_TOP = 1570;
  const FOOTER_H = POSTER_HEIGHT - FOOTER_TOP - PAD;

  ctx.save();
  ctx.fillStyle = '#082B49';
  ctx.beginPath();
  ctx.roundRect(PAD, FOOTER_TOP, W, FOOTER_H, 20);
  ctx.fill();

  // Dải sóng đôi minh họa
  ctx.strokeStyle = '#0B5F9E';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(PAD + 20, FOOTER_TOP + 30);
  ctx.bezierCurveTo(PAD + 300, FOOTER_TOP + 10, PAD + 600, FOOTER_TOP + 45, PAD + W - 20, FOOTER_TOP + 25);
  ctx.stroke();

  // Hotline
  ctx.fillStyle = '#FFFFFF';
  setWireframeFont(ctx, 800, 28);
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText('HOTLINE & TƯ VẤN XKLĐ', PAD + 36, FOOTER_TOP + 56);
  setWireframeFont(ctx, 600, 20);
  ctx.fillStyle = '#CBD5E1';
  ctx.fillText('0966 966 284  •  HỖ TRỢ 24/7', PAD + 36, FOOTER_TOP + 98);
  ctx.fillText('Đăng ký ngay hôm nay để nhận thông tin sớm', PAD + 36, FOOTER_TOP + 132);

  // Khung QR
  const QR_SIZE = 170;
  const QR_X = POSTER_WIDTH - PAD - QR_SIZE - 32;
  const QR_Y = FOOTER_TOP + Math.round((FOOTER_H - QR_SIZE) / 2);

  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.roundRect(QR_X, QR_Y, QR_SIZE, QR_SIZE, 14);
  ctx.fill();

  ctx.strokeStyle = '#0B5F9E';
  ctx.lineWidth = 2;
  ctx.setLineDash([4, 4]);
  ctx.strokeRect(QR_X + 10, QR_Y + 10, QR_SIZE - 20, QR_SIZE - 20);
  ctx.setLineDash([]);

  ctx.fillStyle = '#103B63';
  setWireframeFont(ctx, 800, 17);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('MÃ QR', QR_X + QR_SIZE / 2, QR_Y + QR_SIZE / 2 - 12);
  setWireframeFont(ctx, 600, 13);
  ctx.fillStyle = '#64748B';
  ctx.fillText('Quét camera Zalo', QR_X + QR_SIZE / 2, QR_Y + QR_SIZE / 2 + 14);

  ctx.restore();
}

/**
 * ═══════════════════════════════════════════════════════
 * 3. WIREFRAME MẪU 2 (japan_engineering / Corporate Premium)
 * 2 ẢNH (Ảnh chính bo sóng góc trái đáy + ảnh phụ), Dải cọ lương Navy, Slogan góc phải
 * ═══════════════════════════════════════════════════════
 */
export function renderJapanEngineeringWireframe(ctx: CanvasRenderingContext2D): void {
  const PAD = 48;
  const W = POSTER_WIDTH - PAD * 2;

  drawBlueprintCanvasBase(
    ctx,
    'MẪU 2 — CORPORATE PREMIUM',
    'Corporate Premium',
    'Cần 2 ảnh',
  );

  // ─── KHU VỰC 1: HEADER THƯƠNG HIỆU DOANH NGHIỆP ───
  drawWireframeBlock(ctx, PAD, 96, 420, 88, {
    label: '[ LOGO CÔNG TY VIEJAP ]',
    sublabel: 'Dải phân cách đáy Navy 4px chuẩn',
    badge: 'HEADER THƯƠNG HIỆU',
    bgColor: '#FFFFFF',
    borderColor: '#94A3B8',
    textColor: '#103B63',
    fontSize: 20,
    radius: 12,
  });

  drawWireframeBlock(ctx, POSTER_WIDTH - PAD - 220, 112, 220, 56, {
    label: '[ MÃ ĐƠN HÀNG ]',
    badge: 'MÃ TUYỂN DỤNG',
    bgColor: '#EAF3FA',
    borderColor: '#0B5F9E',
    borderDashed: false,
    textColor: '#0B5F9E',
    fontSize: 18,
    radius: 28,
  });

  // ─── KHU VỰC 2: TIÊU ĐỀ LỚN VỚI TIA SÁNG ───
  const TITLE_TOP = 208;
  drawWireframeBlock(ctx, PAD, TITLE_TOP, W, 142, {
    label: '[ TIÊU ĐỀ ĐƠN HÀNG DOANH NGHIỆP ]',
    sublabel: 'Hiệu ứng tia sáng đồ họa • Khối chữ in hoa công nghiệp mạnh mẽ',
    badge: 'TIÊU ĐỀ CÔNG VIỆC',
    bgColor: '#FFFFFF',
    borderColor: '#0B5F9E',
    textColor: '#103B63',
    fontSize: 26,
    radius: 16,
  });

  // Thanh skeleton mô tả
  drawSkeletonBar(ctx, PAD, TITLE_TOP + 154, W * 0.72, 20, '#CBD5E1', 10);
  drawSkeletonBar(ctx, PAD, TITLE_TOP + 182, W * 0.45, 18, '#E2E8F0', 9);

  // ─── KHU VỰC 3: ẢNH CHÍNH BO SÓNG ĐÁY & ẢNH PHỤ MÔI TRƯỜNG ───
  const IMG_TOP = 432;
  const MAIN_H = 490;

  // Ảnh chính với góc lượn sóng mềm ở đáy bên trái
  drawWireframeBlock(ctx, PAD, IMG_TOP, W, MAIN_H, {
    label: 'KHUNG ẢNH CHÍNH (ĐÁY BO SÓNG MỀM)',
    sublabel: 'Slot 1: Đường cong bo lượn nghệ thuật đặc trưng ở góc đáy trái\nẢnh công việc xí nghiệp / thi công xây dựng',
    badge: 'ẢNH CHÍNH (SLOT 1)',
    bgColor: '#EFF6FC',
    borderColor: '#0B5F9E',
    borderWidth: 2.5,
    borderDashed: true,
    textColor: '#103B63',
    fontSize: 27,
    radius: 24,
    iconType: 'photo',
  });

  // Vẽ minh họa đường sóng bo ở góc đáy trái ảnh chính
  ctx.save();
  ctx.strokeStyle = '#0B5F9E';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(PAD + 16, IMG_TOP + MAIN_H - 70);
  ctx.quadraticCurveTo(PAD + 40, IMG_TOP + MAIN_H - 10, PAD + 120, IMG_TOP + MAIN_H - 12);
  ctx.stroke();
  ctx.restore();

  // Ảnh phụ môi trường ở góc phải
  const SEC_W = 380;
  const SEC_H = 255;
  const SEC_X = POSTER_WIDTH - PAD - SEC_W;
  const SEC_Y = IMG_TOP + MAIN_H - SEC_H + 34;

  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.16)';
  ctx.shadowBlur = 18;
  ctx.shadowOffsetY = 6;
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.roundRect(SEC_X - 6, SEC_Y - 6, SEC_W + 12, SEC_H + 12, 18);
  ctx.fill();
  ctx.restore();

  drawWireframeBlock(ctx, SEC_X, SEC_Y, SEC_W, SEC_H, {
    label: 'ẢNH PHỤ (MÔI TRƯỜNG)',
    sublabel: 'Slot 2: Nơi làm việc / KTX / Đội ngũ',
    badge: 'MÔI TRƯỜNG LÀM VIỆC (SLOT 2)',
    bgColor: '#F1F5F9',
    borderColor: '#0B5F9E',
    borderWidth: 2,
    borderDashed: false,
    textColor: '#0B5F9E',
    fontSize: 22,
    radius: 14,
    iconType: 'photo',
  });

  // ─── KHU VỰC 4: DẢI LƯƠNG CỌ SƠN NAVY DOANH NGHIỆP ───
  const SAL_TOP = IMG_TOP + MAIN_H + 16;
  const SAL_H = 114;
  const SAL_W = W - 390;

  drawWireframeBlock(ctx, PAD, SAL_TOP, SAL_W, SAL_H, {
    label: 'DẢI CỌ SƠN LƯƠNG NAVY',
    sublabel: 'Lương cơ bản & Thực lĩnh hiển thị trên vệt cọ doanh nghiệp',
    badge: 'MỨC LƯƠNG CƠ BẢN',
    bgColor: '#103B63',
    borderColor: '#0B5F9E',
    borderWidth: 2,
    borderDashed: false,
    textColor: '#FFFFFF',
    fontSize: 22,
    radius: 14,
    iconType: 'salary',
  });

  // ─── KHU VỰC 5: QUYỀN LỢI & SLOGAN THƯ PHÁP KHÔI PHỤC ───
  const REQ_TOP = SAL_TOP + SAL_H + 24;

  ctx.save();
  ctx.fillStyle = '#0B5F9E';
  ctx.beginPath();
  ctx.roundRect(PAD, REQ_TOP + 8, 48, 6, 3);
  ctx.fill();
  ctx.fillStyle = '#103B63';
  setWireframeFont(ctx, 800, 26);
  ctx.fillText('QUYỀN LỢI & TIÊU CHUẨN TIẾP NHẬN', PAD + 64, REQ_TOP);
  ctx.restore();

  // 3 dòng yêu cầu với huy hiệu số tròn 01, 02, 03 (chiều rộng gọn W - 360 để nhường chỗ cho slogan)
  const ITEM_W = W - 360;
  for (let i = 0; i < 3; i++) {
    const itemY = REQ_TOP + 46 + i * 48;
    ctx.save();
    ctx.fillStyle = '#EAF3FA';
    ctx.beginPath();
    ctx.arc(PAD + 18, itemY + 12, 17, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#0B5F9E';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = '#0B5F9E';
    setWireframeFont(ctx, 800, 15);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`0${i + 1}`, PAD + 18, itemY + 13);
    ctx.restore();

    drawSkeletonBar(ctx, PAD + 46, itemY + 2, ITEM_W - 40, 20, '#E2E8F0', 10);
  }

  // Khẩu hiệu thư pháp nghệ thuật góc phải ("Cơ hội việc làm tốt / Tại Nhật Bản")
  const SLOGAN_W = 280;
  const SLOGAN_X = POSTER_WIDTH - PAD - SLOGAN_W - 10;
  drawWireframeBlock(ctx, SLOGAN_X, REQ_TOP + 14, SLOGAN_W, 146, {
    label: 'KHẨU HIỆU THƯ PHÁP',
    sublabel: '"Cơ hội việc làm tốt\nTại Nhật Bản" (Đường sóng xanh)',
    badge: 'SLOGAN GÓC PHẢI',
    bgColor: '#FEF9F0',
    borderColor: '#0B5F9E',
    borderWidth: 2,
    borderDashed: false,
    textColor: '#103B63',
    fontSize: 18,
    radius: 14,
  });

  // ─── KHU VỰC 6: 4 CỘT THÔNG TIN TUYỂN DỤNG ───
  const FACTS_TOP = 1430;
  const FACT_H = 104;
  const FACT_GAP = 16;
  const FACT_W = Math.round((W - FACT_GAP * 3) / 4);

  const facts = [
    { title: 'ĐỊA ĐIỂM', sub: 'Tỉnh làm việc' },
    { title: 'ĐỘ TUỔI', sub: 'Yêu cầu độ tuổi' },
    { title: 'PHỎNG VẤN', sub: 'Lịch phỏng vấn' },
    { title: 'XUẤT CẢNH', sub: 'Kế hoạch xuất cảnh' },
  ];

  facts.forEach((f, idx) => {
    const fx = PAD + idx * (FACT_W + FACT_GAP);
    drawWireframeBlock(ctx, fx, FACTS_TOP, FACT_W, FACT_H, {
      label: f.title,
      sublabel: f.sub,
      bgColor: '#FFFFFF',
      borderColor: '#CBD5E1',
      borderWidth: 1.5,
      borderDashed: false,
      textColor: '#103B63',
      fontSize: 18,
      radius: 12,
    });
  });

  // ─── KHU VỰC 7: FOOTER CHÂN TRANG ĐÔI VIEJAP ───
  const FOOTER_TOP = 1570;
  const FOOTER_H = POSTER_HEIGHT - FOOTER_TOP - PAD;

  ctx.save();
  ctx.fillStyle = '#103B63';
  ctx.beginPath();
  ctx.roundRect(PAD, FOOTER_TOP, W, FOOTER_H, 20);
  ctx.fill();

  ctx.fillStyle = '#FFFFFF';
  setWireframeFont(ctx, 800, 28);
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText('HOTLINE DOANH NGHIỆP', PAD + 36, FOOTER_TOP + 46);
  setWireframeFont(ctx, 600, 20);
  ctx.fillStyle = '#CBD5E1';
  ctx.fillText('0966 966 284  •  HỖ TRỢ TƯ VẤN 24/7', PAD + 36, FOOTER_TOP + 88);
  ctx.fillText('ĐĂNG KÝ HỒ SƠ NGAY HÔM NAY', PAD + 36, FOOTER_TOP + 124);

  const QR_SIZE = 170;
  const QR_X = POSTER_WIDTH - PAD - QR_SIZE - 32;
  const QR_Y = FOOTER_TOP + Math.round((FOOTER_H - QR_SIZE) / 2);

  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.roundRect(QR_X, QR_Y, QR_SIZE, QR_SIZE, 14);
  ctx.fill();

  ctx.strokeStyle = '#0B5F9E';
  ctx.lineWidth = 2;
  ctx.setLineDash([4, 4]);
  ctx.strokeRect(QR_X + 10, QR_Y + 10, QR_SIZE - 20, QR_SIZE - 20);
  ctx.setLineDash([]);

  ctx.fillStyle = '#103B63';
  setWireframeFont(ctx, 800, 17);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('MÃ QR', QR_X + QR_SIZE / 2, QR_Y + QR_SIZE / 2 - 12);
  setWireframeFont(ctx, 600, 13);
  ctx.fillStyle = '#64748B';
  ctx.fillText('Quét mã đăng ký', QR_X + QR_SIZE / 2, QR_Y + QR_SIZE / 2 + 14);

  ctx.restore();
}

/**
 * ENTRY POINT: Render bản vẽ kỹ thuật bố cục dự kiến (Wireframe Layout) theo từng mẫu
 */
export async function renderTemplateLayoutWireframe(
  canvas: HTMLCanvasElement,
  templateId: TemplateId | string = 'japan_signature',
): Promise<void> {
  canvas.width = POSTER_WIDTH;
  canvas.height = POSTER_HEIGHT;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Trình duyệt không hỗ trợ Canvas.');
  }

  ctx.textBaseline = 'top';
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  switch (templateId) {
    case 'editorial_hiring':
    case 'industrial_pro':
      renderIndustrialProWireframe(ctx);
      break;

    case 'japan_engineering':
      renderJapanEngineeringWireframe(ctx);
      break;

    case 'japan_signature':
    default:
      renderJapanSignatureWireframe(ctx);
      break;
  }
}
