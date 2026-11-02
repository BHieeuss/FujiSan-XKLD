import * as QRCode from 'qrcode';
import { RecruitmentPosterAssets, RecruitmentPosterData } from './poster-maker.model';
import { PosterThemeColors, TemplateId } from './models/poster-template.model';
import { getTemplateById } from './templates/poster-template-registry';

// ═══════════════════════════════════════════════════════
// GLOBAL CONSTANTS & TOKENS
// ═══════════════════════════════════════════════════════

export const POSTER_WIDTH = 1080;
export const POSTER_HEIGHT = 1920;

const FONT_FAMILY = '"Be Vietnam Pro", "Noto Sans", Arial, sans-serif';

const S = { xs: 12, sm: 20, md: 32, lg: 48, xl: 64 } as const;

const C = {
  navy:       '#103B63',
  brand:      '#0B5F9E',
  lightBlue:  '#EAF3FA',
  white:      '#FFFFFF',
  neutral:    '#657487',
  warmAccent: '#F5A623',
  text:       '#12283E',
  hairline:   'rgba(16,59,99,0.12)',
} as const;

// ═══════════════════════════════════════════════════════
// IMAGE CACHE & FONT LOADER
// ═══════════════════════════════════════════════════════

const imageCache = new Map<string, Promise<HTMLImageElement>>();
let fontLoadPromise: Promise<void> | undefined;

async function ensurePosterFonts(): Promise<void> {
  if (fontLoadPromise) return fontLoadPromise;
  fontLoadPromise = (async () => {
    if (typeof FontFace === 'undefined' || typeof document === 'undefined') return;
    const fonts = [
      ['400', 'assets/fonts/be-vietnam-pro/BeVietnamPro-Regular.ttf'],
      ['500', 'assets/fonts/be-vietnam-pro/BeVietnamPro-Medium.ttf'],
      ['600', 'assets/fonts/be-vietnam-pro/BeVietnamPro-SemiBold.ttf'],
      ['700', 'assets/fonts/be-vietnam-pro/BeVietnamPro-Bold.ttf'],
      ['800', 'assets/fonts/be-vietnam-pro/BeVietnamPro-ExtraBold.ttf'],
    ] as const;
    await Promise.all(
      fonts.map(async ([weight, src]) => {
        try {
          const face = new FontFace('Be Vietnam Pro', `url("${src}")`, { style: 'normal', weight });
          const loaded = await face.load();
          document.fonts.add(loaded);
        } catch {
          // Fallback nếu thiếu font
        }
      }),
    );
  })().catch((err) => {
    fontLoadPromise = undefined;
    console.warn('[PosterRenderer] Font load failed, using fallback.', err);
  });
  return fontLoadPromise;
}

// ═══════════════════════════════════════════════════════
// MAIN RENDER ENTRY POINT
// ═══════════════════════════════════════════════════════

export async function renderRecruitmentPoster(
  canvas: HTMLCanvasElement,
  data: RecruitmentPosterData,
  assets: RecruitmentPosterAssets,
  templateId: TemplateId = 'japan_signature',
): Promise<void> {
  canvas.width = POSTER_WIDTH;
  canvas.height = POSTER_HEIGHT;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Trình duyệt không hỗ trợ Canvas.');
  }

  const template = getTemplateById(templateId);
  const theme = template.colors;

  const [logo, primaryPhoto, secondaryPhoto, tertiaryPhoto] = await Promise.all([
    loadImage(assets.logoSrc),
    loadOptionalImage(assets.primaryPhotoSrc),
    loadOptionalImage(assets.secondaryPhotoSrc),
    loadOptionalImage(assets.tertiaryPhotoSrc),
    ensurePosterFonts(),
  ]);

  ctx.textBaseline = 'top';
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // Safe non-null fallbacks for templates expecting HTMLImageElement
  const pPhoto = primaryPhoto || logo;
  const sPhoto = secondaryPhoto || primaryPhoto || logo;

  // Dispatch theo các Template thiết kế
  switch (template.id) {
    case 'editorial_hiring':
    case 'industrial_pro':
      await renderEditorialHiring(ctx, data, logo, primaryPhoto, secondaryPhoto, tertiaryPhoto, theme);
      break;

    case 'japan_engineering':
      await renderJapanEngineering(ctx, data, logo, pPhoto, sPhoto, theme);
      break;

    case 'japan_signature':
    default:
      await renderJapanSignature(ctx, data, logo, pPhoto, sPhoto, theme);
      break;
  }
}

// ═══════════════════════════════════════════════════════
// TEMPLATE 01: JAPAN SIGNATURE (Corporate Nhật Bản, uy tín)
// ═══════════════════════════════════════════════════════

async function renderJapanSignature(
  ctx: CanvasRenderingContext2D,
  data: RecruitmentPosterData,
  logo: HTMLImageElement,
  primaryPhoto: HTMLImageElement,
  secondaryPhoto: HTMLImageElement,
  theme: PosterThemeColors,
): Promise<void> {
  const grad = ctx.createLinearGradient(0, 0, 0, POSTER_HEIGHT);
  grad.addColorStop(0, theme.backgroundGradientStart || '#FFFFFF');
  grad.addColorStop(0.5, '#F6FAFD');
  grad.addColorStop(1, theme.backgroundGradientEnd || '#EDF4FB');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, POSTER_WIDTH, POSTER_HEIGHT);

  drawSignatureBrandHeader(ctx, data, logo, theme);
  const titleBottomY = drawSignatureJobTitle(ctx, data, theme);
  drawSignatureHeroImages(ctx, primaryPhoto, secondaryPhoto, theme, titleBottomY);
  drawSignatureSalary(ctx, data, theme);
  drawSignatureDetails(ctx, data, theme);
  drawSignatureFacts(ctx, data, theme);
  await drawStandardViejapFooter(ctx, data, theme);
}

function drawSignatureBrandHeader(
  ctx: CanvasRenderingContext2D,
  data: RecruitmentPosterData,
  logo: HTMLImageElement,
  theme: PosterThemeColors,
): void {
  const H = 136;
  const PAD = S.lg;

  ctx.fillStyle = C.white;
  ctx.fillRect(0, 0, POSTER_WIDTH, H);

  // Accent line phân tách dưới header (4px)
  ctx.fillStyle = theme.primaryBrand || C.navy;
  ctx.fillRect(0, H - 4, POSTER_WIDTH, 4);

  // Logo VieJap bên trái với tỉ lệ gốc bảo toàn
  const bounds = getImageContentBounds(logo);
  const targetH = 92;
  const targetW = 420;
  const scale = Math.min(targetW / bounds.sw, targetH / bounds.sh);
  const lw = Math.round(bounds.sw * scale);
  const lh = Math.round(bounds.sh * scale);
  const ly = Math.round((H - lh) / 2);
  ctx.drawImage(logo, bounds.sx, bounds.sy, bounds.sw, bounds.sh, PAD, ly, lw, lh);

  // Mã đơn hàng bên phải
  if (data.orderCode) {
    const codeText = data.orderCode.trim().toUpperCase();
    const fullLabel = `MÃ: ${codeText}`;

    ctx.save();
    setFont(ctx, 800, 24);
    const textMetrics = ctx.measureText(fullLabel);
    const badgeW = Math.max(168, Math.round(textMetrics.width + 38));
    const badgeH = 52;
    const badgeX = POSTER_WIDTH - PAD - badgeW;
    const badgeY = Math.round((H - badgeH) / 2);

    ctx.fillStyle = theme.badgeBackground || '#EAF3FA';
    ctx.beginPath();
    ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 26);
    ctx.fill();

    ctx.strokeStyle = `${theme.primaryBrand || C.navy}26`;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = theme.badgeText || theme.primaryBrand || C.navy;
    ctx.fillText(fullLabel, badgeX + badgeW / 2, badgeY + badgeH / 2 + 1);
    ctx.restore();
  }
}

function drawSignatureJobTitle(
  ctx: CanvasRenderingContext2D,
  data: RecruitmentPosterData,
  theme: PosterThemeColors,
): number {
  const PAD = S.lg;
  const TOP = 146;
  const AVAIL_W = POSTER_WIDTH - PAD * 2;

  // 1. Badge "JP ĐƠN HÀNG TUYỂN DỤNG CHÍNH THỨC" - màu xanh navy/brand và font giống ảnh
  ctx.save();
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillStyle = '#0B5F9E';
  setFont(ctx, 800, 24);
  ctx.fillText('JP ĐƠN HÀNG TUYỂN DỤNG CHÍNH THỨC', PAD, TOP);

  // Accent bar gạch chân dưới badge - màu xanh giống ảnh
  ctx.fillStyle = '#0B5F9E';
  ctx.beginPath();
  ctx.roundRect(PAD, TOP + 36, 64, 4, 2);
  ctx.fill();
  ctx.restore();

  // 2. Tiêu đề công việc
  const title = (data.title || 'ĐƠN TUYỂN MỚI').toUpperCase();
  const titleLines = wrapText(ctx, title, AVAIL_W, 70, 800).slice(0, 3);

  ctx.save();
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillStyle = '#103B63';
  setFont(ctx, 800, 70);

  const lineH = 80;
  const titleY = TOP + 52;
  titleLines.forEach((line, i) => {
    ctx.fillText(line, PAD, titleY + i * lineH);
  });
  ctx.restore();

  // 3. Nội dung công việc - màu xám xanh #64748B, font 32px giống ảnh
  let bottomY = titleY + titleLines.length * lineH;
  if (data.jobDescription) {
    const descY = bottomY + 12;
    ctx.save();
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillStyle = '#64748B';
    setFont(ctx, 500, 32);
    bottomY = drawWrappedText(ctx, data.jobDescription, PAD, descY, AVAIL_W, 44, 2);
    ctx.restore();
  }

  return bottomY;
}

function drawSignatureHeroImages(
  ctx: CanvasRenderingContext2D,
  primary: HTMLImageElement,
  secondary: HTMLImageElement,
  theme: PosterThemeColors,
  titleBottomY = 340,
): void {
  // Ảnh chính mở rộng chiều cao (600px) lấp đầy không gian hài hòa, khoe môi trường làm việc
  const IMG_TOP = Math.max(386, Math.round(titleBottomY + 18));
  const IMG_H   = 600;

  ctx.save();
  ctx.beginPath();
  ctx.rect(0, IMG_TOP, POSTER_WIDTH, IMG_H);
  ctx.clip();
  drawImageCover(ctx, primary, 0, IMG_TOP, POSTER_WIDTH, IMG_H, 0.5, 0.35);

  const fadeBot = ctx.createLinearGradient(0, IMG_TOP + IMG_H * 0.65, 0, IMG_TOP + IMG_H);
  fadeBot.addColorStop(0, 'rgba(255,255,255,0)');
  fadeBot.addColorStop(1, 'rgba(255,255,255,0.92)');
  ctx.fillStyle = fadeBot;
  ctx.fillRect(0, IMG_TOP, POSTER_WIDTH, IMG_H);
  ctx.restore();

  const SEC_W = 340;
  const SEC_H = 236;
  const SEC_X = POSTER_WIDTH - SEC_W - S.lg;
  const SEC_Y = IMG_TOP + IMG_H - SEC_H - 20;

  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
  ctx.shadowBlur = 20;
  ctx.shadowOffsetY = 6;
  ctx.fillStyle = C.white;
  ctx.beginPath();
  ctx.roundRect(SEC_X - 6, SEC_Y - 6, SEC_W + 12, SEC_H + 12, 18);
  ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.beginPath();
  ctx.roundRect(SEC_X, SEC_Y, SEC_W, SEC_H, 14);
  ctx.clip();
  drawImageCover(ctx, secondary, SEC_X, SEC_Y, SEC_W, SEC_H, 0.5, 0.4);
  ctx.restore();

  ctx.save();
  ctx.fillStyle = 'rgba(255, 255, 255, 0.94)';
  ctx.beginPath();
  ctx.roundRect(SEC_X + 12, SEC_Y + 12, 196, 32, 16);
  ctx.fill();
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#103B63';
  setFont(ctx, 700, 14);
  ctx.fillText('MÔI TRƯỜNG LÀM VIỆC', SEC_X + 22, SEC_Y + 28);
  ctx.restore();
}

function drawSignatureSalary(
  ctx: CanvasRenderingContext2D,
  data: RecruitmentPosterData,
  theme: PosterThemeColors,
): void {
  // Ô lương cơ bản nhỏ gọn: nền Navy chính, vạch nhấn xanh, icon ¥ cyan giống ảnh
  const TOP = 1008;
  const PAD = S.lg;
  const W   = POSTER_WIDTH - PAD * 2;
  const H   = 114;

  ctx.save();
  ctx.fillStyle = '#103B63';
  ctx.beginPath();
  ctx.roundRect(PAD, TOP, W, H, 18);
  ctx.fill();
  ctx.restore();

  // Vạch nhấn bên trái màu xanh #0B5F9E (không dùng màu đỏ)
  ctx.save();
  ctx.fillStyle = '#0B5F9E';
  ctx.beginPath();
  ctx.roundRect(PAD, TOP, 6, H, [18, 0, 0, 18]);
  ctx.fill();
  ctx.restore();

  // Biểu tượng ¥: màu cyan #60A5FA giống ảnh, font đậm sắc nét
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#60A5FA';
  setFont(ctx, 800, 48);
  ctx.fillText('¥', PAD + 56, TOP + H / 2 + 1);
  ctx.restore();

  const contentX = PAD + 108;
  const contentW = W - 124;
  const rawSalary = (data.salary || 'Lương cơ bản: 1.049 yên/giờ').trim();
  const salLines = rawSalary.split(/\r?\n/).map((s) => s.trim()).filter(Boolean);

  ctx.save();
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';

  if (salLines.length === 1) {
    ctx.fillStyle = '#FFFFFF';
    setFont(ctx, 800, 42);
    fitSingleLine(ctx, salLines[0], contentX, TOP + H / 2, contentW, 42, 24, 800);
  } else {
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    setFont(ctx, 600, 22);
    fitSingleLine(ctx, salLines[0], contentX, TOP + H / 2 - 18, contentW, 22, 16, 600);

    ctx.fillStyle = '#60A5FA';
    setFont(ctx, 800, 40);
    fitSingleLine(ctx, salLines[1], contentX, TOP + H / 2 + 18, contentW, 40, 24, 800);

    if (salLines[2]) {
      ctx.fillStyle = 'rgba(255,255,255,0.7)';
      setFont(ctx, 500, 18);
      fitSingleLine(ctx, salLines[2], contentX, TOP + H / 2 + 42, contentW, 18, 14, 500);
    }
  }
  ctx.restore();
}

function drawSignatureDetails(
  ctx: CanvasRenderingContext2D,
  data: RecruitmentPosterData,
  theme: PosterThemeColors,
): void {
  const PAD = S.lg;
  const TOP = 1152;
  const W   = POSTER_WIDTH - PAD * 2;

  ctx.save();
  ctx.fillStyle = '#0B5F9E';
  ctx.beginPath();
  ctx.roundRect(PAD, TOP + 11, 48, 5, 2.5);
  ctx.fill();

  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillStyle = '#103B63';
  setFont(ctx, 800, 28);
  ctx.fillText('QUYỀN LỢI & YÊU CẦU', PAD + 64, TOP + 2);
  ctx.restore();

  const items = data.requirements
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 4);

  let curY = TOP + 52;
  const itemLineH = 46;
  const itemFontSize = 32;

  items.forEach((item, index) => {
    // Huy hiệu số thứ tự biên tập "01", "02", "03" giống ảnh
    const numBadge = String(index + 1).padStart(2, '0');
    const badgeSize = 36;
    const badgeX = PAD;
    const badgeY = curY + 4;

    ctx.save();
    ctx.fillStyle = '#EAF3FA';
    ctx.beginPath();
    ctx.arc(badgeX + badgeSize / 2, badgeY + badgeSize / 2, badgeSize / 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = 'rgba(11, 95, 158, 0.2)';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#0B5F9E';
    setFont(ctx, 800, 16);
    ctx.fillText(numBadge, badgeX + badgeSize / 2, badgeY + badgeSize / 2 + 1);

    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillStyle = '#1E293B';
    setFont(ctx, 600, itemFontSize);
    const nextY = drawWrappedText(ctx, item, PAD + 50, curY, W - 50, itemLineH, 2);
    ctx.restore();

    curY = nextY + 18;
  });
}

function drawSignatureFacts(
  ctx: CanvasRenderingContext2D,
  data: RecruitmentPosterData,
  theme: PosterThemeColors,
): void {
  const PAD  = S.lg;
  const TOP  = 1424;
  const W    = POSTER_WIDTH - PAD * 2;
  const H    = 196;

  ctx.save();
  ctx.fillStyle = '#F4F8FC';
  ctx.beginPath();
  ctx.roundRect(PAD, TOP, W, H, 20);
  ctx.fill();

  ctx.strokeStyle = 'rgba(16, 59, 99, 0.12)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.fillStyle = '#103B63';
  ctx.fillRect(PAD, TOP, W, 4.5);
  ctx.restore();

  const facts = [
    { iconName: 'location', label: 'ĐỊA ĐIỂM', value: (data.location || 'Đang cập nhật').toUpperCase() },
    { iconName: 'users', label: 'ĐỘ TUỔI', value: data.ageRange ? `${data.ageRange} tuổi` : 'Đang cập nhật' },
    { iconName: 'calendar', label: 'PHỎNG VẤN', value: formatDate(data.interviewDate) },
    { iconName: 'plane', label: 'XUẤT CẢNH', value: data.departureDate || 'Đang cập nhật' },
  ];

  const colW = W / 4;
  const ICON_SZ = 44;

  facts.forEach((fact, i) => {
    const cx = PAD + i * colW + colW / 2;
    drawLucideIcon(ctx, fact.iconName, cx - ICON_SZ / 2, TOP + 20, ICON_SZ, '#103B63');

    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    setFont(ctx, 700, 20);
    ctx.fillStyle = '#64748B';
    ctx.fillText(fact.label, cx, TOP + 72);

    setFont(ctx, 800, 32);
    ctx.fillStyle = '#082B49';
    fitSingleLine(ctx, fact.value, cx, TOP + 114, colW - 16, 32, 19, 800);
    ctx.restore();

    if (i < 3) {
      ctx.save();
      ctx.strokeStyle = 'rgba(16, 59, 99, 0.1)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(PAD + (i + 1) * colW, TOP + 24);
      ctx.lineTo(PAD + (i + 1) * colW, TOP + H - 24);
      ctx.stroke();
      ctx.restore();
    }
  });
}

async function drawStandardViejapFooter(
  ctx: CanvasRenderingContext2D,
  data: RecruitmentPosterData,
  theme: PosterThemeColors,
): Promise<void> {
  const FOOTER_H = 260;
  const FOOTER_TOP = POSTER_HEIGHT - FOOTER_H; // 1660
  const PAD = S.lg; // 48

  // 1. NỀN FOOTER: Ưu tiên dùng asset footer-wave-bg.png (1080x260) chuẩn nhận diện thương hiệu
  const footerWaveBg = await loadOptionalImage('assets/images/poster/footer-wave-bg.png');
  if (footerWaveBg) {
    ctx.drawImage(footerWaveBg, 0, FOOTER_TOP, POSTER_WIDTH, FOOTER_H);
  } else {
    // Fallback: vẽ đường lượn sóng navy kèm viền highlight xanh sáng trên đỉnh
    ctx.save();
    ctx.fillStyle = theme.primaryBrand || '#103B63';
    ctx.beginPath();
    ctx.moveTo(0, FOOTER_TOP + 12);
    ctx.quadraticCurveTo(POSTER_WIDTH / 2, FOOTER_TOP - 8, POSTER_WIDTH, FOOTER_TOP + 8);
    ctx.lineTo(POSTER_WIDTH, POSTER_HEIGHT);
    ctx.lineTo(0, POSTER_HEIGHT);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = '#0B5F9E';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, FOOTER_TOP + 12);
    ctx.quadraticCurveTo(POSTER_WIDTH / 2, FOOTER_TOP - 8, POSTER_WIDTH, FOOTER_TOP + 8);
    ctx.stroke();
    ctx.restore();
  }

  // 2. HỌA TIẾT SÓNG BIỂN NHẬT BẢN (Seigaiha) tinh tế ở nền góc dưới trái
  drawSeigaihaWaves(ctx, 0, FOOTER_TOP + 8, 420, FOOTER_H - 8);

  // 3. KHỐI HOTLINE & ĐĂNG KÝ HỒ SƠ BÊN TRÁI: Chuẩn thiết kế tham khảo
  const hotlineX = PAD + 16; // 64
  const hotlineY = FOOTER_TOP + 32;

  // Icon điện thoại trắng dạng nét thanh lịch đi kèm tiêu đề
  drawInlinePhoneIcon(ctx, hotlineX, hotlineY + 2, 26, 'rgba(255, 255, 255, 0.9)');

  ctx.save();
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';

  // Dòng 1: HOTLINE TƯ VẤN 24/7 (ZALO)
  ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
  setFont(ctx, 700, 18);
  ctx.fillText('HOTLINE TƯ VẤN 24/7 (ZALO)', hotlineX + 36, hotlineY + 4);

  // Dòng 2: Số hotline lớn in đậm nổi bật
  const phoneStr = (data.hotline || '0966 966 284').trim();
  ctx.fillStyle = '#FFFFFF';
  setFont(ctx, 800, 54);
  ctx.fillText(phoneStr, hotlineX, hotlineY + 34);

  // Dòng 3: ĐĂNG KÝ HỒ SƠ NGAY HÔM NAY (Màu xanh cyan sáng chuẩn ảnh mẫu)
  ctx.fillStyle = '#90CDF4';
  setFont(ctx, 800, 22);
  ctx.fillText('ĐĂNG KÝ HỒ SƠ NGAY HÔM NAY', hotlineX, hotlineY + 104);
  ctx.restore();

  // 4. KHỐI QR BÊN PHẢI KÈM CHỮ NGHỆ THUẬT "Quét mã để đăng ký"
  const qrSize = 138;
  const qrX = POSTER_WIDTH - PAD - qrSize - 6; // 888
  const qrY = FOOTER_TOP + 28;

  const qrArrowAsset = await loadOptionalImage('assets/images/poster/quet-ma-dang-ky.png');
  if (qrArrowAsset) {
    const qw = 118;
    const qh = Math.round(qw * (qrArrowAsset.height / qrArrowAsset.width));
    const qx = qrX - qw - 10;
    const qy = qrY + 8;
    ctx.drawImage(qrArrowAsset, qx, qy, qw, qh);
  }

  // Khung bo góc trắng quanh mã QR
  ctx.save();
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.roundRect(qrX - 5, qrY - 5, qrSize + 10, qrSize + 10, 16);
  ctx.fill();
  ctx.restore();

  const qrTargetUrl = data.registrationUrl || 'https://zalo.me/0966966284';
  await drawQrCodeBox(ctx, qrTargetUrl, qrX, qrY, qrSize, theme.primaryBrand || '#103B63');

  // Text chú thích dưới QR code
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.88)';
  setFont(ctx, 700, 12.5);
  ctx.fillText('Quét mã đăng ký', qrX + qrSize / 2, qrY + qrSize + 10);
  ctx.restore();

  // 5. BRANDING CHÂN TRANG GÓC TRÁI DƯỚI (Favicon + VieJap.com)
  await drawAttribution(ctx);
}

function drawInlinePhoneIcon(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: string,
): void {
  ctx.save();
  ctx.translate(x, y);
  const scale = size / 24;
  ctx.scale(scale, scale);
  ctx.strokeStyle = color;
  ctx.lineWidth = 2.4;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(22, 16.92);
  ctx.lineTo(22, 19.92);
  ctx.bezierCurveTo(22.0, 20.48, 21.64, 20.98, 21.11, 21.14);
  ctx.bezierCurveTo(19.56, 21.62, 14.78, 21.0, 11.6, 18.04);
  ctx.bezierCurveTo(8.66, 15.35, 7.32, 11.56, 8.03, 9.07);
  ctx.bezierCurveTo(8.2, 8.52, 8.7, 8.15, 9.28, 8.15);
  ctx.lineTo(12.28, 8.15);
  ctx.bezierCurveTo(12.83, 8.15, 13.31, 8.54, 13.46, 9.07);
  ctx.bezierCurveTo(13.63, 9.72, 13.86, 10.38, 14.13, 11.02);
  ctx.bezierCurveTo(14.27, 11.37, 14.18, 11.77, 13.9, 12.03);
  ctx.lineTo(12.61, 13.32);
  ctx.bezierCurveTo(13.73, 15.41, 15.38, 16.88, 17.68, 17.91);
  ctx.lineTo(18.97, 16.62);
  ctx.bezierCurveTo(19.22, 16.34, 19.63, 16.26, 19.99, 16.41);
  ctx.bezierCurveTo(20.64, 16.68, 21.3, 16.91, 21.97, 17.1);
  ctx.bezierCurveTo(22.49, 17.25, 22.0, 16.92, 22, 16.92);
  ctx.stroke();
  ctx.restore();
}

// ═══════════════════════════════════════════════════════
// TEMPLATE 02: EDITORIAL HIRING — VIEJAP (CHUẨN THIẾT KẾ PHONG CÁCH NHẬT BẢN)
// ═══════════════════════════════════════════════════════

async function renderEditorialHiring(
  ctx: CanvasRenderingContext2D,
  data: RecruitmentPosterData,
  logo: HTMLImageElement,
  primaryPhoto: HTMLImageElement | null,
  secondaryPhoto: HTMLImageElement | null,
  tertiaryPhoto: HTMLImageElement | null,
  theme: PosterThemeColors,
): Promise<void> {
  const PAD = S.lg; // 48
  const W = POSTER_WIDTH - PAD * 2; // 984

  // 1. NỀN POSTER: Nền sáng sạch kết hợp Núi Phú Sĩ & Hoa anh đào ở góc trên phải theo chuẩn ảnh mẫu
  const bgGrad = ctx.createLinearGradient(0, 0, 0, POSTER_HEIGHT);
  bgGrad.addColorStop(0, '#FFFFFF');
  bgGrad.addColorStop(0.35, '#F8FAFC');
  bgGrad.addColorStop(1, '#EDF4FB');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, POSTER_WIDTH, POSTER_HEIGHT);

  // Background Núi Phú Sĩ & Hoa anh đào góc trên phải theo chuẩn ảnh mẫu
  const fujiM1Bg = await loadOptionalImage('assets/images/poster/fuji-sakura-m1-bg.jpg');
  if (fujiM1Bg) {
    ctx.save();
    const bgW = 740;
    const bgH = Math.round(bgW * (fujiM1Bg.height / fujiM1Bg.width));
    const bgX = POSTER_WIDTH - bgW;
    const bgY = 70;
    ctx.drawImage(fujiM1Bg, bgX, bgY, bgW, bgH);

    // Chuyển tiếp mờ dần về nền trắng phía chân núi
    const fadeGrad = ctx.createLinearGradient(0, bgY + bgH - 150, 0, bgY + bgH);
    fadeGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
    fadeGrad.addColorStop(1, '#FFFFFF');
    ctx.fillStyle = fadeGrad;
    ctx.fillRect(bgX, bgY + bgH - 150, bgW, 150);

    // Chuyển tiếp mờ bên trái sang trắng tự nhiên
    const leftFadeGrad = ctx.createLinearGradient(bgX, 0, bgX + 240, 0);
    leftFadeGrad.addColorStop(0, '#FFFFFF');
    leftFadeGrad.addColorStop(0.4, 'rgba(255, 255, 255, 0.7)');
    leftFadeGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = leftFadeGrad;
    ctx.fillRect(bgX, bgY, 240, bgH);
    ctx.restore();
  }

  // ─── KHU VỰC A: HEADER ─────────────────────────────
  const H = 140;

  // Logo VieJap bên trái với tỉ lệ gốc bảo toàn
  const bounds = getImageContentBounds(logo);
  const targetH = 88;
  const targetW = 390;
  const scale = Math.min(targetW / bounds.sw, targetH / bounds.sh);
  const lw = Math.round(bounds.sw * scale);
  const lh = Math.round(bounds.sh * scale);
  const ly = 24;
  ctx.drawImage(logo, bounds.sx, bounds.sy, bounds.sw, bounds.sh, PAD, ly, lw, lh);

  // Subtitle dưới logo: "CÔNG TY HỢP TÁC LAO ĐỘNG NHẬT BẢN"
  ctx.save();
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillStyle = '#64748B';
  setFont(ctx, 700, 13);
  ctx.fillText('CÔNG TY HỢP TÁC LAO ĐỘNG NHẬT BẢN', PAD + 2, ly + lh + 6);
  ctx.restore();

  // Đường line ngang mỏng nối giữa khu vực logo và mã đơn hàng theo chuẩn ảnh mẫu
  const badgeW = 152;
  const badgeH = 38;
  const badgeX = POSTER_WIDTH - PAD - badgeW;
  const badgeY = 38;

  ctx.save();
  ctx.strokeStyle = 'rgba(16, 59, 99, 0.18)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(PAD + lw + 20, ly + 24);
  ctx.lineTo(badgeX - 20, ly + 24);
  ctx.stroke();
  ctx.restore();

  // Mã đơn hàng bên phải: Dòng chữ "MÃ ĐƠN HÀNG" phía trên + Capsule pill xanh navy đặc phía dưới
  if (data.orderCode) {
    const codeText = data.orderCode.trim().toUpperCase();

    ctx.save();
    ctx.textAlign = 'center';

    // Dòng trên: "MÃ ĐƠN HÀNG"
    ctx.fillStyle = '#103B63';
    setFont(ctx, 700, 13);
    ctx.textBaseline = 'top';
    ctx.fillText('MÃ ĐƠN HÀNG', badgeX + badgeW / 2, badgeY - 18);

    // Pill capsule xanh navy đặc
    ctx.fillStyle = '#103B63';
    ctx.beginPath();
    ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 19);
    ctx.fill();

    // Dòng dưới: Mã đơn to đậm màu trắng
    ctx.fillStyle = '#FFFFFF';
    setFont(ctx, 800, 22);
    ctx.textBaseline = 'middle';
    ctx.fillText(codeText, badgeX + badgeW / 2, badgeY + badgeH / 2 + 1);
    ctx.restore();
  }

  // ─── KHU VỰC B: TIÊU ĐỀ CHÍNH + SLOGAN GÓC PHẢI ─────
  const TOP_TITLE = 156;

  // Dòng nhãn: "● ĐƠN HÀNG TUYỂN DỤNG CHÍNH THỨC ──────" theo chuẩn ảnh mẫu
  ctx.save();
  const bulletX = PAD + 6;
  const bulletY = TOP_TITLE + 12;
  ctx.fillStyle = '#103B63';
  ctx.beginPath();
  ctx.arc(bulletX, bulletY, 6, 0, Math.PI * 2);
  ctx.fill();

  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  setFont(ctx, 800, 23);
  ctx.fillText('ĐƠN HÀNG TUYỂN DỤNG CHÍNH THỨC', PAD + 22, bulletY);

  const labelW = ctx.measureText('ĐƠN HÀNG TUYỂN DỤNG CHÍNH THỨC').width;
  ctx.strokeStyle = 'rgba(16, 59, 99, 0.2)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(PAD + 22 + labelW + 16, bulletY);
  ctx.lineTo(PAD + 22 + labelW + 120, bulletY);
  ctx.stroke();
  ctx.restore();

  // Tên công việc (bên trái, font cực lớn, cực đậm, màu Navy chính)
  // Giới hạn chiều rộng 500px để "LINH KIỆN ĐIỆN TỬ" ngắt đều 2 dòng đẹp chuẩn như ảnh mẫu
  const title = (data.title || 'LINH KIỆN ĐIỆN TỬ').toUpperCase();
  const titleLines = wrapText(ctx, title, 500, 72, 800).slice(0, 3);
  const lineH = 82;
  const titleY = TOP_TITLE + 40;

  ctx.save();
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillStyle = theme.textHeading || '#103B63';
  setFont(ctx, 800, 72);
  titleLines.forEach((line, i) => {
    ctx.fillText(line, PAD, titleY + i * lineH);
  });
  ctx.restore();

  // Thư pháp nghệ thuật góc trên phải (trong khoảng trời xanh phía trên sườn núi Phú Sĩ): "Làm việc tại Nhật Bản / Kiến tạo tương lai"
  const topSloganAsset = await loadOptionalImage('assets/images/poster/slogan-lam-viec-nhat-ban.png');
  if (topSloganAsset) {
    const sw = 330;
    const sh = Math.round(sw * (topSloganAsset.height / topSloganAsset.width));
    ctx.drawImage(topSloganAsset, POSTER_WIDTH - PAD - sw - 12, TOP_TITLE - 16, sw, sh);
  } else {
    ctx.save();
    ctx.translate(POSTER_WIDTH - PAD - 380, TOP_TITLE - 10);
    ctx.rotate(-0.06);
    ctx.fillStyle = '#103B63';
    setFontItalic(ctx, 700, 36);
    ctx.fillText('Làm việc tại Nhật Bản', 0, 0);
    ctx.fillText('Kiến tạo tương lai', 24, 42);
    ctx.restore();
  }

  // Mô tả công việc (Xám xanh #64748B, font 30px)
  let contentBottomY = titleY + titleLines.length * lineH;
  if (data.jobDescription) {
    const descY = contentBottomY + 10;
    ctx.save();
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillStyle = '#64748B';
    setFont(ctx, 500, 30);
    contentBottomY = drawWrappedText(ctx, data.jobDescription, PAD, descY, 520, 42, 2);
    ctx.restore();
  }

  // ─── KHU VỰC C: CỤM 3 ẢNH BO GÓC MỀM VIỀN TRẮNG NỔI BẬT ───
  const COLLAGE_TOP = Math.max(386, Math.round(contentBottomY + 16));
  const COLLAGE_H = 530;

  // Lớp nền xanh nhạt bo lượn mềm mại đỡ cụm 3 ảnh theo phong cách chuẩn ảnh mẫu
  ctx.save();
  const waveBgGrad = ctx.createLinearGradient(0, COLLAGE_TOP - 20, 0, COLLAGE_TOP + COLLAGE_H + 20);
  waveBgGrad.addColorStop(0, '#EAF3FB');
  waveBgGrad.addColorStop(1, '#EDF5FC');
  ctx.fillStyle = waveBgGrad;
  ctx.beginPath();
  ctx.moveTo(PAD - 10, COLLAGE_TOP + 32);
  ctx.quadraticCurveTo(PAD + W * 0.45, COLLAGE_TOP - 18, PAD + W + 10, COLLAGE_TOP + 14);
  ctx.lineTo(PAD + W + 10, COLLAGE_TOP + COLLAGE_H - 10);
  ctx.quadraticCurveTo(PAD + W * 0.5, COLLAGE_TOP + COLLAGE_H + 20, PAD - 10, COLLAGE_TOP + COLLAGE_H - 12);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // Ảnh 1 (Ảnh chính bên trái - Công việc)
  const w1 = 580;
  const h1 = COLLAGE_H;
  const x1 = PAD;
  const y1 = COLLAGE_TOP;
  drawPhotoCardWithWhiteBorder(
    ctx,
    primaryPhoto,
    x1,
    y1,
    w1,
    h1,
    28,
    '',
    'Chưa tải Ảnh 1 (Công việc chính)'
  );

  // Cột bên phải (2 ảnh)
  const w2 = W - w1 - 18; // 386
  const h2 = Math.round((COLLAGE_H - 16) / 2); // 257
  const x2 = PAD + w1 + 18; // 646
  const y2 = COLLAGE_TOP;

  // Ảnh 2 (Phải trên - Môi trường làm việc có badge xanh navy đặc chuẩn ảnh)
  drawPhotoCardWithWhiteBorder(
    ctx,
    secondaryPhoto,
    x2,
    y2,
    w2,
    h2,
    22,
    'MÔI TRƯỜNG LÀM VIỆC',
    'Chưa tải Ảnh 2 (Môi trường)'
  );

  // Ảnh 3 (Phải dưới - Thiết bị / chi tiết công việc)
  const h3 = COLLAGE_H - h2 - 16;
  const y3 = y2 + h2 + 16;
  drawPhotoCardWithWhiteBorder(
    ctx,
    tertiaryPhoto,
    x2,
    y3,
    w2,
    h3,
    22,
    '',
    'Chưa tải Ảnh 3 (Bổ sung)'
  );

  // ─── KHU VỰC D: LƯƠNG CƠ BẢN DẠNG VỆT CỌ NGHỆ THUẬT (BRUSH BANNER) ─
  const SAL_TOP = COLLAGE_TOP + COLLAGE_H + 20;
  const SAL_H = 114;

  drawBrushSalaryBanner(ctx, data, PAD, SAL_TOP, W - 60, SAL_H);

  // ─── KHU VỰC E: QUYỀN LỢI & YÊU CẦU + SLOGAN NGHỆ THUẬT 2 ─
  const REQ_TOP = SAL_TOP + SAL_H + 24;

  ctx.save();
  // Icon checklist clipboard theo chuẩn ảnh mẫu
  drawClipboardChecklistIcon(ctx, PAD, REQ_TOP + 2, 34, '#103B63');

  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillStyle = theme.textHeading || '#103B63';
  setFont(ctx, 800, 28);
  ctx.fillText('QUYỀN LỢI & YÊU CẦU', PAD + 46, REQ_TOP + 2);
  ctx.restore();

  const items = data.requirements
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 3);

  let curY = REQ_TOP + 52;
  const itemLineH = 46;
  const itemFontSize = 30;

  // Render danh sách quyền lợi với dấu tích tròn navy
  items.forEach((item) => {
    const iconR = 14;
    const iconX = PAD + iconR;
    const iconY = curY + 16;

    // Vòng tròn navy
    ctx.save();
    ctx.fillStyle = '#103B63';
    ctx.beginPath();
    ctx.arc(iconX, iconY, iconR, 0, Math.PI * 2);
    ctx.fill();

    // Dấu check trắng
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2.4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(iconX - 5, iconY);
    ctx.lineTo(iconX - 1, iconY + 4.5);
    ctx.lineTo(iconX + 6, iconY - 4);
    ctx.stroke();
    ctx.restore();

    // Nội dung chữ
    ctx.save();
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillStyle = '#1E293B';
    setFont(ctx, 600, itemFontSize);
    const nextY = drawWrappedText(ctx, item, PAD + 38, curY, W - 390, itemLineH, 2);
    ctx.restore();

    curY = nextY + 14;
  });

  // Khẩu hiệu thư pháp nghệ thuật góc phải: "Cơ hội việc làm tốt / Tại Nhật Bản"
  const slogan2Asset = await loadOptionalImage('assets/images/poster/slogan-co-hoi-viec-lam.png');
  if (slogan2Asset) {
    const sw = 270;
    const sh = Math.round(sw * (slogan2Asset.height / slogan2Asset.width));
    ctx.drawImage(slogan2Asset, POSTER_WIDTH - PAD - sw - 10, REQ_TOP + 45, sw, sh);
  } else {
    ctx.save();
    const slogan2X = POSTER_WIDTH - PAD - 290;
    const slogan2Y = REQ_TOP + 68;
    ctx.translate(slogan2X, slogan2Y);
    ctx.rotate(-0.06);
    ctx.fillStyle = '#103B63';
    setFont(ctx, 800, 30);
    ctx.fillText('Cơ hội việc làm tốt', 0, 0);
    ctx.fillText('Tại Nhật Bản', 44, 42);

    // Đường gạch chân nghệ thuật uốn nhẹ NẰM DƯỚI chữ (y = 86, không cắt qua chữ)
    ctx.strokeStyle = '#0B5F9E';
    ctx.lineWidth = 3.5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(34, 86);
    ctx.quadraticCurveTo(140, 96, 240, 82);
    ctx.stroke();
    ctx.restore();
  }

  // ─── KHU VỰC F: 4 CỘT THÔNG TIN TUYỂN DỤNG (Đồng bộ chuẩn Mẫu Tiêu Chuẩn & Mẫu 2) ───
  drawSignatureFacts(ctx, data, theme);

  // ─── KHU VỰC G: FOOTER ĐẬM CHẤT THƯƠNG HIỆU VIEJAP TIÊU CHUẨN ─────────
  await drawStandardViejapFooter(ctx, data, theme);
}

/**
 * Vẽ khung ảnh bo góc mềm với viền trắng dày và bóng đổ nổi bật theo chuẩn ảnh mẫu
 */
function drawPhotoCardWithWhiteBorder(
  ctx: CanvasRenderingContext2D,
  photo: HTMLImageElement | null,
  x: number,
  y: number,
  w: number,
  h: number,
  radius: number,
  pillLabel: string,
  emptyMessage: string
): void {
  ctx.save();

  // Đổ bóng mềm tạo độ nổi (elevation)
  ctx.shadowColor = 'rgba(16, 59, 99, 0.18)';
  ctx.shadowBlur = 18;
  ctx.shadowOffsetY = 8;
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.roundRect(x - 4, y - 4, w + 8, h + 8, radius);
  ctx.fill();
  ctx.restore();

  if (photo) {
    // Clip ảnh và vẽ cover
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, radius);
    ctx.clip();
    drawImageCover(ctx, photo, x, y, w, h, 0.5, 0.38);
    ctx.restore();

    // Viền trắng dày nổi bật quanh ảnh
    ctx.save();
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, radius);
    ctx.stroke();
    ctx.restore();

    // Nhãn pill (nếu có, ví dụ "MÔI TRƯỜNG LÀM VIỆC")
    if (pillLabel) {
      ctx.save();
      const pillW = 208;
      const pillH = 36;
      const pillX = x + 12;
      const pillY = y + 12;

      // Nền xanh navy đặc theo chuẩn ảnh mẫu
      ctx.fillStyle = '#103B63';
      ctx.beginPath();
      ctx.roundRect(pillX, pillY, pillW, pillH, 18);
      ctx.fill();

      // Viền trắng mỏng tinh tế
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Icon nhà xưởng trắng
      drawLucideIcon(ctx, 'building', pillX + 12, pillY + 8, 20, '#FFFFFF');

      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#FFFFFF';
      setFont(ctx, 800, 13);
      ctx.fillText(pillLabel, pillX + 38, pillY + pillH / 2 + 1);
      ctx.restore();
    }
  } else {
    // Trạng thái trống chờ tải ảnh
    ctx.save();
    ctx.fillStyle = '#F8FAFC';
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, radius);
    ctx.fill();

    ctx.strokeStyle = 'rgba(16, 59, 99, 0.25)';
    ctx.lineWidth = 1.8;
    ctx.setLineDash([8, 8]);
    ctx.stroke();

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#94A3B8';
    setFont(ctx, 600, 16);
    ctx.fillText(emptyMessage, x + w / 2, y + h / 2);
    ctx.restore();
  }
}

/**
 * Vẽ dải lương dạng vệt cọ nghệ thuật (Brush Stroke) màu xanh navy với vòng tròn Yên Nhật nổi bật
 */
function drawBrushSalaryBanner(
  ctx: CanvasRenderingContext2D,
  data: RecruitmentPosterData,
  x: number,
  y: number,
  w: number,
  h: number,
): void {
  ctx.save();

  // Tạo hình vệt cọ loang tự nhiên bằng path với răng cưa nghệ thuật ở 2 đầu
  ctx.fillStyle = '#103B63';
  ctx.beginPath();
  // Bắt đầu từ góc trên bên trái với các tia cọ
  ctx.moveTo(x + 18, y);
  // Cạnh trên hơi lượn sóng tự nhiên
  ctx.quadraticCurveTo(x + w * 0.5, y - 3, x + w - 16, y);
  // Đầu cọ bên phải có các răng cọ xước
  ctx.lineTo(x + w, y + 18);
  ctx.lineTo(x + w - 8, y + 36);
  ctx.lineTo(x + w + 6, y + 58);
  ctx.lineTo(x + w - 10, y + 82);
  ctx.lineTo(x + w - 2, y + 104);
  ctx.lineTo(x + w - 24, y + h);
  // Cạnh dưới lượn sóng nhẹ
  ctx.quadraticCurveTo(x + w * 0.5, y + h + 3, x + 24, y + h);
  // Đầu cọ bên trái
  ctx.lineTo(x + 6, y + 90);
  ctx.lineTo(x - 8, y + 68);
  ctx.lineTo(x + 4, y + 42);
  ctx.lineTo(x - 6, y + 20);
  ctx.closePath();
  ctx.fill();

  // 2 vệt gạch chéo '//' đặc trưng phong cách nghệ thuật bên phải dải cọ
  ctx.strokeStyle = '#103B63';
  ctx.lineWidth = 10;
  ctx.lineCap = 'round';
  const slashX = x + w + 16;
  const slashY = y + 26;
  ctx.beginPath();
  ctx.moveTo(slashX, slashY + 48);
  ctx.lineTo(slashX + 22, slashY);
  ctx.moveTo(slashX + 22, slashY + 48);
  ctx.lineTo(slashX + 44, slashY);
  ctx.stroke();

  // Vòng tròn trắng nổi bật bên trái
  const circleR = 40;
  const circleX = x + 72;
  const circleY = y + h / 2;

  ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
  ctx.shadowBlur = 10;
  ctx.shadowOffsetY = 3;
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(circleX, circleY, circleR, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Ký hiệu Yên Nhật "¥" màu navy bên trong vòng tròn
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#103B63';
  setFont(ctx, 800, 48);
  ctx.fillText('¥', circleX, circleY + 2);

  // Nội dung lương bên phải vòng tròn
  const contentX = circleX + circleR + 24;
  let rawSalary = (data.salary || '1.049 yên/giờ').trim();
  rawSalary = rawSalary.replace(/^(Lương cơ bản|Lương)\s*[:：]\s*/i, '').trim();

  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';

  // Dòng 1: "LƯƠNG CƠ BẢN"
  ctx.fillStyle = '#FFFFFF';
  setFont(ctx, 700, 22);
  ctx.fillText('LƯƠNG CƠ BẢN', contentX, y + 20);

  // Dòng 2: Giá trị lương lớn in đậm
  setFont(ctx, 800, 48);
  ctx.fillText(rawSalary, contentX, y + 48);
  ctx.restore();
}

/**
 * Vẽ họa tiết sóng biển Seigaiha truyền thống Nhật Bản cho chân trang poster
 */
function drawSeigaihaWaves(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
): void {
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.lineWidth = 1.6;

  const R = 32;
  const dx = R * 2;
  const dy = R * 0.75;

  for (let row = 0; row < 6; row++) {
    const cy = y + h - row * dy;
    const offsetX = row % 2 === 0 ? 0 : R;
    for (let cx = x - R + offsetX; cx < x + w + R; cx += dx) {
      for (let r = 8; r <= R; r += 7) {
        ctx.beginPath();
        ctx.arc(cx, cy, r, Math.PI, Math.PI * 2);
        ctx.stroke();
      }
    }
  }
  ctx.restore();
}

/**
 * Utility set font chữ nghệ thuật có hỗ trợ đầy đủ tiếng Việt 100%, không bị vỡ font hay mất dấu
 */
function setFontItalic(ctx: CanvasRenderingContext2D, weight: number, size: number): void {
  ctx.font = `italic ${weight} ${size}px "Caveat", "Be Vietnam Pro", sans-serif`;
}
// ═══════════════════════════════════════════════════════
// TEMPLATE 03: MẪU 2 — CORPORATE PREMIUM (VIEJAP RECRUITMENT POSTER)
// Chuẩn thiết kế 100% theo ảnh tham khảo: Đường cong bo nét nghệ thuật,
// Asset dải lương vệt cọ chuẩn, Slogan thư pháp AI, Dải sóng footer đôi,
// Huy hiệu Môi trường làm việc & QR code với mũi tên cong
// ═══════════════════════════════════════════════════════

async function renderJapanEngineering(
  ctx: CanvasRenderingContext2D,
  data: RecruitmentPosterData,
  logo: HTMLImageElement,
  primaryPhoto: HTMLImageElement,
  secondaryPhoto: HTMLImageElement,
  theme: PosterThemeColors,
): Promise<void> {
  const PAD = S.lg; // 48
  const W = POSTER_WIDTH - PAD * 2; // 984

  // 1. NỀN POSTER: Nền sáng sạch, thanh lịch đồng bộ 100% với Mẫu Tiêu Chuẩn
  const bgGrad = ctx.createLinearGradient(0, 0, 0, POSTER_HEIGHT);
  bgGrad.addColorStop(0, theme.backgroundGradientStart || '#FFFFFF');
  bgGrad.addColorStop(0.5, '#F6FAFD');
  bgGrad.addColorStop(1, theme.backgroundGradientEnd || '#EDF4FB');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, POSTER_WIDTH, POSTER_HEIGHT);

  // ─── KHU VỰC A: HEADER THƯƠNG HIỆU (Thanh trắng + vạch Navy chuẩn Mẫu Tiêu Chuẩn) ───
  drawSignatureBrandHeader(ctx, data, logo, theme);

  // ─── KHU VỰC B: TIÊU ĐỀ CHÍNH & MÔ TẢ (Chuẩn Mẫu Tiêu Chuẩn) ─────
  const titleBottomY = drawSignatureJobTitle(ctx, data, theme);

  // ─── KHU VỰC C: ẢNH CHÍNH & ĐƯỜNG CONG BO LƯỢN NGHỆ THUẬT ───
  const IMG_TOP = Math.max(386, Math.round(titleBottomY + 18));
  const MAIN_H = 490;

  // 1. Ảnh chính với đường cong bo lượn mềm ở cạnh đáy góc trái
  drawCurvedPhotoCard(ctx, primaryPhoto, PAD, IMG_TOP, W, MAIN_H);

  // ─── KHU VỰC D: LƯƠNG CƠ BẢN ĐỒ HỌA CHUẨN THƯƠNG HIỆU VIEJAP ───
  const SAL_TOP = IMG_TOP + MAIN_H + 14;
  const SAL_H = 114;
  const actualSalH = SAL_H;
  const SAL_W = W - 390;

  drawBrushSalaryBannerCorporate(ctx, data, PAD, SAL_TOP, SAL_W, SAL_H);

  // 2. Ảnh phụ môi trường (nằm ở góc phải dưới, chồng nhẹ lên ảnh chính và vùng lương)
  if (secondaryPhoto) {
    const SEC_W = 380;
    const SEC_H = 255;
    const SEC_X = POSTER_WIDTH - PAD - SEC_W;
    const SEC_Y = IMG_TOP + MAIN_H - SEC_H + 34;

    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
    ctx.shadowBlur = 20;
    ctx.shadowOffsetY = 6;
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.roundRect(SEC_X - 6, SEC_Y - 6, SEC_W + 12, SEC_H + 12, 18);
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.beginPath();
    ctx.roundRect(SEC_X, SEC_Y, SEC_W, SEC_H, 14);
    ctx.clip();
    drawImageCover(ctx, secondaryPhoto, SEC_X, SEC_Y, SEC_W, SEC_H, 0.5, 0.4);
    ctx.restore();

    // Huy hiệu "MÔI TRƯỜNG LÀM VIỆC" trên ảnh phụ chuẩn Mẫu Tiêu Chuẩn
    ctx.save();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.94)';
    ctx.beginPath();
    ctx.roundRect(SEC_X + 12, SEC_Y + 12, 196, 32, 16);
    ctx.fill();
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#103B63';
    setFont(ctx, 700, 14);
    ctx.fillText('MÔI TRƯỜNG LÀM VIỆC', SEC_X + 22, SEC_Y + 28);
    ctx.restore();
  }

  // ─── KHU VỰC E: QUYỀN LỢI & YÊU CẦU (Đồng bộ số thứ tự 01, 02, 03 chuẩn Mẫu Tiêu Chuẩn) ───
  const REQ_TOP = SAL_TOP + actualSalH + 20;

  ctx.save();
  ctx.fillStyle = '#0B5F9E';
  ctx.beginPath();
  ctx.roundRect(PAD, REQ_TOP + 11, 48, 5, 2.5);
  ctx.fill();

  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillStyle = '#103B63';
  setFont(ctx, 800, 28);
  ctx.fillText('QUYỀN LỢI & YÊU CẦU', PAD + 64, REQ_TOP + 2);
  ctx.restore();

  const items = data.requirements
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 3);

  let curY = REQ_TOP + 50;
  const itemLineH = 44;
  const itemFontSize = 30;

  items.forEach((item, index) => {
    // Huy hiệu số thứ tự biên tập "01", "02", "03" chuẩn Mẫu Tiêu Chuẩn
    const numBadge = String(index + 1).padStart(2, '0');
    const badgeSize = 34;
    const badgeX = PAD;
    const badgeY = curY + 4;

    ctx.save();
    ctx.fillStyle = '#EAF3FA';
    ctx.beginPath();
    ctx.arc(badgeX + badgeSize / 2, badgeY + badgeSize / 2, badgeSize / 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = 'rgba(11, 95, 158, 0.2)';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#0B5F9E';
    setFont(ctx, 800, 16);
    ctx.fillText(numBadge, badgeX + badgeSize / 2, badgeY + badgeSize / 2 + 1);

    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillStyle = '#1E293B';
    setFont(ctx, 600, itemFontSize);
    const nextY = drawWrappedText(ctx, item, PAD + 48, curY, W - 360, itemLineH, 2);
    ctx.restore();

    curY = nextY + 16;
  });

  // Khẩu hiệu thư pháp nghệ thuật góc phải: "Cơ hội việc làm tốt / Tại Nhật Bản"
  const slogan2Asset = await loadOptionalImage('assets/images/poster/slogan-co-hoi-viec-lam.png');
  if (slogan2Asset) {
    const sw = 280;
    const sh = Math.round(sw * (slogan2Asset.height / slogan2Asset.width));
    ctx.drawImage(slogan2Asset, POSTER_WIDTH - PAD - sw - 10, REQ_TOP + 40, sw, sh);
  } else {
    ctx.save();
    const slogan2X = POSTER_WIDTH - PAD - 290;
    const slogan2Y = REQ_TOP + 65;
    ctx.translate(slogan2X, slogan2Y);
    ctx.rotate(-0.06);
    ctx.fillStyle = '#103B63';
    setFont(ctx, 800, 30);
    ctx.fillText('Cơ hội việc làm tốt', 0, 0);
    ctx.fillText('Tại Nhật Bản', 44, 42);

    // Đường gạch chân nghệ thuật uốn nhẹ NẰM DƯỚI chữ
    ctx.strokeStyle = '#0B5F9E';
    ctx.lineWidth = 3.5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(34, 86);
    ctx.quadraticCurveTo(140, 96, 240, 82);
    ctx.stroke();
    ctx.restore();
  }

  // ─── KHU VỰC F: 4 CỘT THÔNG TIN TUYỂN DỤNG (Chuẩn Mẫu Tiêu Chuẩn) ───
  drawSignatureFacts(ctx, data, theme);

  // ─── KHU VỰC G: FOOTER ĐẬM CHẤT THƯƠNG HIỆU VIEJAP TIÊU CHUẨN ─────────
  await drawStandardViejapFooter(ctx, data, theme);
}

/**
 * Vẽ khung ảnh chính bo cong lượn mềm nghệ thuật ở cạnh đáy góc trái
 */
function drawCurvedPhotoCard(
  ctx: CanvasRenderingContext2D,
  photo: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number,
): void {
  // Tạo path bo cong theo chuẩn ảnh mẫu
  function buildPath(c: CanvasRenderingContext2D) {
    c.beginPath();
    // Góc trên trái bo tròn
    c.moveTo(x + 28, y);
    // Cạnh trên
    c.lineTo(x + w - 28, y);
    c.arcTo(x + w, y, x + w, y + 28, 28);
    // Cạnh phải
    c.lineTo(x + w, y + h);
    // Cạnh đáy phẳng từ phải sang giữa
    c.lineTo(x + 420, y + h);
    // Vòm cong lượn mềm lên trên ở góc đáy trái
    c.bezierCurveTo(x + 300, y + h, x + 180, y + h - 110, x + 100, y + h - 110);
    c.bezierCurveTo(x + 45, y + h - 110, x, y + h - 60, x, y + h - 20);
    // Cạnh trái
    c.lineTo(x, y + 28);
    c.arcTo(x, y, x + 28, y, 28);
    c.closePath();
  }

  // Đổ bóng mềm chuẩn nhận diện
  ctx.save();
  ctx.shadowColor = 'rgba(16, 59, 99, 0.12)';
  ctx.shadowBlur = 18;
  ctx.shadowOffsetY = 6;
  ctx.fillStyle = '#FFFFFF';
  buildPath(ctx);
  ctx.fill();
  ctx.restore();

  // Vẽ ảnh vào bên trong path
  ctx.save();
  buildPath(ctx);
  ctx.clip();
  drawImageCover(ctx, photo, x, y, w, h, 0.5, 0.38);
  ctx.restore();

  // Viền trắng dày nổi bật quanh toàn bộ đường cong
  ctx.save();
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 5;
  buildPath(ctx);
  ctx.stroke();
  ctx.restore();
}

/**
 * Dải lương Corporate chuẩn nhận diện thương hiệu VieJap (đồng bộ Mẫu Tiêu Chuẩn)
 */
function drawBrushSalaryBannerCorporate(
  ctx: CanvasRenderingContext2D,
  data: RecruitmentPosterData,
  x: number,
  y: number,
  w: number,
  h: number,
): void {
  ctx.save();
  ctx.fillStyle = '#103B63';
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 18);
  ctx.fill();
  ctx.restore();

  // Vạch nhấn bên trái màu xanh #0B5F9E chuẩn thương hiệu
  ctx.save();
  ctx.fillStyle = '#0B5F9E';
  ctx.beginPath();
  ctx.roundRect(x, y, 6, h, [18, 0, 0, 18]);
  ctx.fill();
  ctx.restore();

  // Biểu tượng ¥: màu cyan #60A5FA giống Mẫu Tiêu Chuẩn
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#60A5FA';
  setFont(ctx, 800, 48);
  ctx.fillText('¥', x + 56, y + h / 2 + 1);
  ctx.restore();

  const contentX = x + 108;
  const contentW = w - 124;
  const rawSalary = (data.salary || 'Lương cơ bản: 1.049 yên/giờ').trim();
  const salLines = rawSalary.split(/\r?\n/).map((s) => s.trim()).filter(Boolean);

  ctx.save();
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';

  if (salLines.length === 1) {
    ctx.fillStyle = '#FFFFFF';
    setFont(ctx, 800, 42);
    fitSingleLine(ctx, salLines[0], contentX, y + h / 2, contentW, 42, 24, 800);
  } else {
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    setFont(ctx, 600, 22);
    fitSingleLine(ctx, salLines[0], contentX, y + h / 2 - 18, contentW, 22, 16, 600);

    ctx.fillStyle = '#60A5FA';
    setFont(ctx, 800, 40);
    fitSingleLine(ctx, salLines[1], contentX, y + h / 2 + 18, contentW, 40, 24, 800);

    if (salLines[2]) {
      ctx.fillStyle = 'rgba(255,255,255,0.7)';
      setFont(ctx, 500, 18);
      fitSingleLine(ctx, salLines[2], contentX, y + h / 2 + 42, contentW, 18, 14, 500);
    }
  }
  ctx.restore();
}

/**
 * Vẽ 3 tia phát sáng năng động
 */
function drawSparkleRays(ctx: CanvasRenderingContext2D, cx: number, cy: number, color: string, length = 20): void {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  const angles = [-0.35, 0, 0.35];
  angles.forEach((rad) => {
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(rad) * 6, cy + Math.sin(rad) * 6);
    ctx.lineTo(cx + Math.cos(rad) * (6 + length), cy + Math.sin(rad) * (6 + length));
    ctx.stroke();
  });
  ctx.restore();
}

/**
 * Vẽ icon checklist clipboard vector cho tiêu đề Quyền lợi & Yêu cầu
 */
function drawClipboardChecklistIcon(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string): void {
  ctx.save();
  ctx.translate(x, y);
  const s = size / 24;
  ctx.scale(s, s);
  ctx.strokeStyle = color;
  ctx.lineWidth = 2.2;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.strokeRect(3, 4, 18, 18);
  ctx.beginPath();
  ctx.moveTo(8, 4);
  ctx.lineTo(8, 2);
  ctx.lineTo(16, 2);
  ctx.lineTo(16, 4);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(8, 9); ctx.lineTo(16, 9);
  ctx.moveTo(8, 13); ctx.lineTo(16, 13);
  ctx.moveTo(8, 17); ctx.lineTo(14, 17);
  ctx.stroke();
  ctx.restore();
}

// ═══════════════════════════════════════════════════════
// SHARED CANVAS HELPERS
// ═══════════════════════════════════════════════════════

interface ImageContentBounds {
  sx: number;
  sy: number;
  sw: number;
  sh: number;
}

const logoBoundsCache = new Map<HTMLImageElement, ImageContentBounds>();

function getImageContentBounds(img: HTMLImageElement): ImageContentBounds {
  const cached = logoBoundsCache.get(img);
  if (cached) return cached;

  const nw = img.naturalWidth || 1;
  const nh = img.naturalHeight || 1;

  try {
    if (typeof document !== 'undefined') {
      const c = document.createElement('canvas');
      c.width = nw;
      c.height = nh;
      const ctx = c.getContext('2d', { willReadFrequently: true });
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        const data = ctx.getImageData(0, 0, nw, nh).data;

        let minX = nw;
        let maxX = 0;
        let minY = nh;
        let maxY = 0;
        let found = false;

        for (let y = 0; y < nh; y++) {
          for (let x = 0; x < nw; x++) {
            const idx = (y * nw + x) * 4;
            const a = data[idx + 3];
            const r = data[idx];
            const g = data[idx + 1];
            const b = data[idx + 2];
            if (a > 20 && (r < 242 || g < 242 || b < 242)) {
              if (x < minX) minX = x;
              if (x > maxX) maxX = x;
              if (y < minY) minY = y;
              if (y > maxY) maxY = y;
              found = true;
            }
          }
        }

        if (found && maxX > minX && maxY > minY) {
          const padX = Math.round((maxX - minX) * 0.02);
          const padY = Math.round((maxY - minY) * 0.02);
          const sx = Math.max(0, minX - padX);
          const sy = Math.max(0, minY - padY);
          const sw = Math.min(nw - sx, (maxX - minX + 1) + padX * 2);
          const sh = Math.min(nh - sy, (maxY - minY + 1) + padY * 2);
          const bounds: ImageContentBounds = { sx, sy, sw, sh };
          logoBoundsCache.set(img, bounds);
          return bounds;
        }
      }
    }
  } catch {
    // Fallback
  }

  const fallback: ImageContentBounds = { sx: 0, sy: 0, sw: nw, sh: nh };
  logoBoundsCache.set(img, fallback);
  return fallback;
}

function drawChamferRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  c: number | [number, number, number, number],
): void {
  const [tl, tr, br, bl] = typeof c === 'number' ? [c, c, c, c] : c;
  ctx.moveTo(x + tl, y);
  ctx.lineTo(x + w - tr, y);
  ctx.lineTo(x + w, y + tr);
  ctx.lineTo(x + w, y + h - br);
  ctx.lineTo(x + w - br, y + h);
  ctx.lineTo(x + bl, y + h);
  ctx.lineTo(x, y + h - bl);
  ctx.lineTo(x, y + tl);
  ctx.closePath();
}

function drawCadCornerMarks(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  arm: number,
  color: string,
): void {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;

  // Top-left
  ctx.beginPath();
  ctx.moveTo(x - 6, y - 6 + arm);
  ctx.lineTo(x - 6, y - 6);
  ctx.lineTo(x - 6 + arm, y - 6);
  ctx.stroke();

  // Top-right
  ctx.beginPath();
  ctx.moveTo(x + w + 6 - arm, y - 6);
  ctx.lineTo(x + w + 6, y - 6);
  ctx.lineTo(x + w + 6, y - 6 + arm);
  ctx.stroke();

  // Bottom-right
  ctx.beginPath();
  ctx.moveTo(x + w + 6, y + h + 6 - arm);
  ctx.lineTo(x + w + 6, y + h + 6);
  ctx.lineTo(x + w + 6 - arm, y + h + 6);
  ctx.stroke();

  // Bottom-left
  ctx.beginPath();
  ctx.moveTo(x - 6 + arm, y + h + 6);
  ctx.lineTo(x - 6, y + h + 6);
  ctx.lineTo(x - 6, y + h + 6 - arm);
  ctx.stroke();

  ctx.restore();
}

async function drawQrCodeBox(
  ctx: CanvasRenderingContext2D,
  url: string,
  x: number,
  y: number,
  size: number,
  darkColor: string,
): Promise<void> {
  try {
    const qrCanvas = document.createElement('canvas');
    await QRCode.toCanvas(qrCanvas, url, {
      width: size,
      margin: 1,
      errorCorrectionLevel: 'H',
      color: { dark: `${darkColor}ff`, light: '#ffffffff' },
    });

    ctx.save();
    ctx.fillStyle = C.white;
    ctx.beginPath();
    ctx.roundRect(x - 8, y - 8, size + 16, size + 16, 16);
    ctx.fill();
    ctx.restore();

    ctx.drawImage(qrCanvas, x, y, size, size);

    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    setFont(ctx, 600, 15);
    ctx.fillText('Quét để đăng ký', x + size / 2, y + size + 11);
    ctx.restore();
  } catch {
    // Bỏ qua nếu lỗi
  }
}

function drawImageCover(
  context: CanvasRenderingContext2D,
  image: HTMLImageElement,
  x: number,
  y: number,
  width: number,
  height: number,
  focusX = 0.5,
  focusY = 0.5,
): void {
  const scale = Math.max(width / image.naturalWidth, height / image.naturalHeight);
  const sourceWidth = width / scale;
  const sourceHeight = height / scale;
  const maxSourceX = image.naturalWidth - sourceWidth;
  const maxSourceY = image.naturalHeight - sourceHeight;
  const sourceX = Math.max(0, Math.min(maxSourceX, maxSourceX * focusX));
  const sourceY = Math.max(0, Math.min(maxSourceY, maxSourceY * focusY));
  context.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, x, y, width, height);
}

function setFont(ctx: CanvasRenderingContext2D, weight: number, size: number): void {
  ctx.font = `${weight} ${size}px ${FONT_FAMILY}`;
}

function fitSingleLine(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  preferredSize: number,
  minimumSize: number,
  weight: number,
): void {
  let size = preferredSize;
  while (size > minimumSize) {
    setFont(ctx, weight, size);
    if (ctx.measureText(text).width <= maxWidth) break;
    size -= 1;
  }
  ctx.fillText(fitWithEllipsis(ctx, text, maxWidth), x, y);
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  fontSize: number,
  fontWeight: number,
): string[] {
  setFont(ctx, fontWeight, fontSize);
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (!words.length) return [''];

  const lines: string[] = [];
  let current = words[0];
  for (let i = 1; i < words.length; i++) {
    const candidate = `${current} ${words[i]}`;
    if (ctx.measureText(candidate).width <= maxWidth) {
      current = candidate;
    } else {
      lines.push(current);
      current = words[i];
    }
  }
  lines.push(current);
  return lines;
}

function drawWrappedText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxLines: number,
): number {
  const words = text.split(/\s+/).filter(Boolean);
  let current = '';
  let lineCount = 0;
  let curY = y;
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (ctx.measureText(candidate).width <= maxWidth) {
      current = candidate;
      continue;
    }
    if (lineCount + 1 >= maxLines) {
      ctx.fillText(fitWithEllipsis(ctx, candidate, maxWidth), x, curY);
      return curY + lineHeight;
    }
    ctx.fillText(current, x, curY);
    curY += lineHeight;
    lineCount++;
    current = word;
  }
  if (current) {
    ctx.fillText(current, x, curY);
    curY += lineHeight;
  }
  return curY;
}

function fitWithEllipsis(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string {
  if (ctx.measureText(text).width <= maxWidth) return text;
  let t = text;
  while (t.length > 0 && ctx.measureText(`${t}...`).width > maxWidth) {
    t = t.slice(0, -1).trimEnd();
  }
  return `${t}...`;
}

function formatDate(dateString: string): string {
  if (!dateString) return 'Đang cập nhật';
  const parts = dateString.split('-');
  if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
  return dateString;
}

function loadOptionalImage(src?: string): Promise<HTMLImageElement | null> {
  if (!src) return Promise.resolve(null);
  return loadImage(src).catch((err) => {
    console.warn('[PosterRenderer] Optional image load failed:', src, err);
    return null;
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  const cached = imageCache.get(src);
  if (cached) return cached;
  const p = new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload  = () => resolve(img);
    img.onerror = () => reject(new Error(`Không thể tải ảnh: ${src}`));
    img.src = src;
  });
  imageCache.set(src, p);
  return p;
}

async function drawAttribution(ctx: CanvasRenderingContext2D): Promise<void> {
  const hotlineX = 52;
  const bottomCenterY = POSTER_HEIGHT - 36;
  const iconSize = 38;

  ctx.save();
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';

  const favImg = await loadOptionalImage('assets/fav.png');
  let currentX = hotlineX;

  if (favImg) {
    const iconY = Math.round(bottomCenterY - iconSize / 2);
    ctx.drawImage(favImg, currentX, iconY, iconSize, iconSize);
    currentX += iconSize + 12;
  }

  // Link VieJap.com to rõ, nổi bật theo yêu cầu
  ctx.fillStyle = '#C7E4FD';
  setFont(ctx, 800, 26);
  ctx.fillText('VieJap.com', currentX, bottomCenterY);

  ctx.restore();
}

/**
 * Icon ghim vị trí (Pin) dạng đặc (solid) chuẩn thiết kế Nhật Bản
 */
function drawSolidPinIcon(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  sz: number,
  color: string,
): void {
  ctx.save();
  ctx.fillStyle = color;
  const cx = x + sz / 2;
  const r = sz * 0.38;
  const cy = y + r + 2;

  ctx.beginPath();
  ctx.arc(cx, cy, r, Math.PI * 0.78, Math.PI * 0.22);
  ctx.lineTo(cx, y + sz - 2);
  ctx.closePath();
  ctx.fill();

  // Chấm trắng ở giữa ghim
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.42, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/**
 * Icon người/độ tuổi (User) dạng đặc (solid) chuẩn thiết kế Nhật Bản
 */
function drawSolidUserIcon(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  sz: number,
  color: string,
): void {
  ctx.save();
  ctx.fillStyle = color;
  const cx = x + sz / 2;

  // Đầu
  const headR = sz * 0.22;
  ctx.beginPath();
  ctx.arc(cx, y + headR + 3, headR, 0, Math.PI * 2);
  ctx.fill();

  // Thân / vai bo tròn
  ctx.beginPath();
  ctx.moveTo(cx - sz * 0.42, y + sz - 2);
  ctx.quadraticCurveTo(cx - sz * 0.42, y + sz * 0.54, cx, y + sz * 0.54);
  ctx.quadraticCurveTo(cx + sz * 0.42, y + sz * 0.54, cx + sz * 0.42, y + sz - 2);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

/**
 * Icon lịch phỏng vấn (Calendar) dạng đặc chuẩn thiết kế Nhật Bản
 */
function drawSolidCalendarIcon(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  sz: number,
  color: string,
): void {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 2.4;

  const bx = x + 3;
  const by = y + 7;
  const bw = sz - 6;
  const bh = sz - 10;

  // Thân lịch
  ctx.beginPath();
  ctx.roundRect(bx, by, bw, bh, 5);
  ctx.stroke();

  // Thanh bar đầu lịch màu đặc
  ctx.beginPath();
  ctx.roundRect(bx, by, bw, bh * 0.32, [5, 5, 0, 0]);
  ctx.fill();

  // 2 móc cài trên đầu
  ctx.beginPath();
  ctx.roundRect(bx + bw * 0.25 - 2, y + 2, 4, 8, 2);
  ctx.roundRect(bx + bw * 0.75 - 2, y + 2, 4, 8, 2);
  ctx.fill();

  // Các ô ngày bên trong dạng chấm lưới
  const gridStartY = by + bh * 0.50;
  const gw = (bw - 14) / 3;
  const gh = (bh * 0.40) / 2;
  for (let r = 0; r < 2; r++) {
    for (let c = 0; c < 3; c++) {
      ctx.fillRect(bx + 7 + c * (gw + 1), gridStartY + r * (gh + 3), 4, 4);
    }
  }
  ctx.restore();
}

/**
 * Icon máy bay xuất cảnh (Airplane) dạng đặc nghiêng 45 độ chuẩn thiết kế Nhật Bản
 */
function drawSolidPlaneIcon(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  sz: number,
  color: string,
): void {
  ctx.save();
  ctx.fillStyle = color;
  ctx.translate(x + sz / 2, y + sz / 2);
  ctx.rotate(-Math.PI / 4);

  const s = sz * 0.48;
  ctx.beginPath();
  ctx.moveTo(0, -s); // Mũi máy bay
  ctx.lineTo(s * 0.18, -s * 0.2);
  ctx.lineTo(s * 0.95, s * 0.22); // Đầu cánh phải
  ctx.lineTo(s * 0.95, s * 0.36);
  ctx.lineTo(s * 0.18, s * 0.25);
  ctx.lineTo(s * 0.14, s * 0.76); // Thân
  ctx.lineTo(s * 0.46, s * 0.96); // Đuôi phải
  ctx.lineTo(s * 0.46, s * 1.08);
  ctx.lineTo(0, s * 0.92); // Tim đuôi
  ctx.lineTo(-s * 0.46, s * 1.08);
  ctx.lineTo(-s * 0.46, s * 0.96); // Đuôi trái
  ctx.lineTo(-s * 0.14, s * 0.76);
  ctx.lineTo(-s * 0.18, s * 0.25);
  ctx.lineTo(-s * 0.95, s * 0.36); // Đầu cánh trái
  ctx.lineTo(-s * 0.95, s * 0.22);
  ctx.lineTo(-s * 0.18, -s * 0.2);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawLucideIcon(
  ctx: CanvasRenderingContext2D,
  iconName: string,
  x: number,
  y: number,
  size: number,
  color: string,
): void {
  const scale = size / 24;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.strokeStyle = color;
  ctx.lineWidth = 2 / scale;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  switch (iconName) {
    case 'location':
      ctx.beginPath();
      ctx.moveTo(12, 2);
      ctx.bezierCurveTo(8.13, 2, 5, 5.13, 5, 9);
      ctx.bezierCurveTo(5, 13.25, 12, 22, 12, 22);
      ctx.bezierCurveTo(12, 22, 19, 13.25, 19, 9);
      ctx.bezierCurveTo(19, 5.13, 15.87, 2, 12, 2);
      ctx.closePath();
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(12, 9, 2.8, 0, Math.PI * 2);
      ctx.stroke();
      break;

    case 'users':
      ctx.beginPath();
      ctx.arc(9, 7, 4, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(2, 21);
      ctx.bezierCurveTo(2, 17, 5.13, 14, 9, 14);
      ctx.bezierCurveTo(12.87, 14, 16, 17, 16, 21);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(17, 3.34);
      ctx.bezierCurveTo(19.07, 3.93, 21, 5.67, 21, 7.5);
      ctx.bezierCurveTo(21, 9.82, 19.07, 11.07, 17, 11.66);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(22, 21);
      ctx.bezierCurveTo(22, 17.5, 20.18, 14.5, 17.5, 13.8);
      ctx.stroke();
      break;

    case 'calendar':
      ctx.strokeRect(3, 4, 18, 18);
      ctx.beginPath();
      ctx.moveTo(16, 2);
      ctx.lineTo(16, 6);
      ctx.moveTo(8, 2);
      ctx.lineTo(8, 6);
      ctx.moveTo(3, 10);
      ctx.lineTo(21, 10);
      ctx.stroke();
      break;

    case 'plane':
      ctx.save();
      ctx.translate(12, 12);
      ctx.beginPath();
      ctx.moveTo(0, -7);
      ctx.lineTo(-3.5, 5);
      ctx.lineTo(0, 2.5);
      ctx.lineTo(3.5, 5);
      ctx.closePath();
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-1, 1);
      ctx.lineTo(-7, 3);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-1, 4);
      ctx.lineTo(-4, 5.5);
      ctx.stroke();
      ctx.restore();
      break;

    case 'phone':
      ctx.beginPath();
      ctx.moveTo(22, 16.92);
      ctx.lineTo(22, 19.92);
      ctx.bezierCurveTo(22.0, 20.48, 21.64, 20.98, 21.11, 21.14);
      ctx.bezierCurveTo(19.56, 21.62, 14.78, 21.0, 11.6, 18.04);
      ctx.bezierCurveTo(8.66, 15.35, 7.32, 11.56, 8.03, 9.07);
      ctx.bezierCurveTo(8.2, 8.52, 8.7, 8.15, 9.28, 8.15);
      ctx.lineTo(12.28, 8.15);
      ctx.bezierCurveTo(12.83, 8.15, 13.31, 8.54, 13.46, 9.07);
      ctx.bezierCurveTo(13.63, 9.72, 13.86, 10.38, 14.13, 11.02);
      ctx.bezierCurveTo(14.27, 11.37, 14.18, 11.77, 13.9, 12.03);
      ctx.lineTo(12.61, 13.32);
      ctx.bezierCurveTo(13.73, 15.41, 15.38, 16.88, 17.68, 17.91);
      ctx.lineTo(18.97, 16.62);
      ctx.bezierCurveTo(19.22, 16.34, 19.63, 16.26, 19.99, 16.41);
      ctx.bezierCurveTo(20.64, 16.68, 21.3, 16.91, 21.97, 17.1);
      ctx.bezierCurveTo(22.49, 17.25, 22.0, 16.92, 22, 16.92);
      ctx.closePath();
      ctx.stroke();
      break;

    default:
      ctx.beginPath();
      ctx.arc(12, 12, 4, 0, Math.PI * 2);
      ctx.stroke();
  }

  ctx.restore();
}

// ═══════════════════════════════════════════════════════
// EXPORT UTILITIES (PNG, JPG, PDF)
// ═══════════════════════════════════════════════════════

export async function exportPosterAsBlob(
  canvas: HTMLCanvasElement,
  format: 'png' | 'jpg' | 'pdf' = 'png',
): Promise<Blob> {
  if (format === 'pdf') return exportPosterAsPdfBlob(canvas);
  const mimeType = format === 'jpg' ? 'image/jpeg' : 'image/png';
  const quality  = format === 'jpg' ? 0.95 : undefined;
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, mimeType, quality),
  );
  if (!blob) throw new Error(`Không thể tạo file ${format.toUpperCase()} từ poster.`);
  return blob;
}

export async function exportPosterAsPdfBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  const jpegBlob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, 'image/jpeg', 0.95),
  );
  if (!jpegBlob) throw new Error('Không thể xuất dữ liệu ảnh từ Canvas.');
  const jpegBytes = new Uint8Array(await jpegBlob.arrayBuffer());
  const enc   = new TextEncoder();
  const parts: Uint8Array[] = [];
  const offsets: number[]   = [];
  let currentOffset = 0;

  function write(str: string): void {
    const b = enc.encode(str);
    parts.push(b);
    currentOffset += b.length;
  }
  function writeBytes(bytes: Uint8Array): void {
    parts.push(bytes);
    currentOffset += bytes.length;
  }

  const W = POSTER_WIDTH;
  const H = POSTER_HEIGHT;
  write('%PDF-1.4\n%VieJap Recruitment Poster PDF\n');
  offsets.push(currentOffset);
  write('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n');
  offsets.push(currentOffset);
  write('2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n');
  offsets.push(currentOffset);
  write(`3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${W} ${H}] /Contents 4 0 R /Resources << /XObject << /Im1 5 0 R >> >> >>\nendobj\n`);
  const cs = `q\n${W} 0 0 ${H} 0 0 cm\n/Im1 Do\nQ\n`;
  offsets.push(currentOffset);
  write(`4 0 obj\n<< /Length ${cs.length} >>\nstream\n${cs}endstream\nendobj\n`);
  offsets.push(currentOffset);
  write(`5 0 obj\n<< /Type /XObject /Subtype /Image /Width ${W} /Height ${H} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpegBytes.length} >>\nstream\n`);
  writeBytes(jpegBytes);
  write('\nendstream\nendobj\n');
  const xrefOffset = currentOffset;
  write('xref\n0 6\n0000000000 65535 f \n');
  for (const o of offsets) write(o.toString().padStart(10, '0') + ' 00000 n \n');
  write(`trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`);
  return new Blob(parts as BlobPart[], { type: 'application/pdf' });
}
