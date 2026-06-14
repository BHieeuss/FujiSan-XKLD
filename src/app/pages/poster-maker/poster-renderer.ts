import * as QRCode from 'qrcode';
import { RecruitmentPosterAssets, RecruitmentPosterData } from './poster-maker.model';

export const POSTER_WIDTH = 1080;
export const POSTER_HEIGHT = 1620;

const FONT_FAMILY = '"Be Vietnam Pro", Arial, sans-serif';
const imageCache = new Map<string, Promise<HTMLImageElement>>();
let fontLoadPromise: Promise<void> | undefined;

type SummaryIcon = 'location' | 'age' | 'calendar' | 'plane';

export async function renderRecruitmentPoster(
  canvas: HTMLCanvasElement,
  data: RecruitmentPosterData,
  assets: RecruitmentPosterAssets,
): Promise<void> {
  canvas.width = POSTER_WIDTH;
  canvas.height = POSTER_HEIGHT;

  const context = canvas.getContext('2d');
  if (!context) {
    throw new Error('Trình duyệt không hỗ trợ Canvas.');
  }

  const [logo, background, primaryPhoto, secondaryPhoto] = await Promise.all([
    loadImage(assets.logoSrc),
    loadImage(assets.backgroundSrc),
    loadImage(assets.primaryPhotoSrc),
    loadImage(assets.secondaryPhotoSrc),
    ensurePosterFonts(),
  ]);

  context.textBaseline = 'top';
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = 'high';

  drawBackground(context, background);
  drawHeader(context, data);
  drawHero(context, data);
  await drawRegistrationQr(context, data);
  drawJobInformation(context, data);
  drawPhotoFrame(context, primaryPhoto, 625, 425, 410, 420, 54, 'HÌNH ẢNH CÔNG VIỆC');
  drawPhotoFrame(context, secondaryPhoto, 690, 790, 300, 230, 44, 'MÔI TRƯỜNG LÀM VIỆC');
  drawSummaryCard(context, data);
  drawFooter(context, data.hotline, logo);
  drawAttribution(context);
}

async function ensurePosterFonts(): Promise<void> {
  if (fontLoadPromise) {
    return fontLoadPromise;
  }

  fontLoadPromise = (async () => {
    if (typeof FontFace === 'undefined' || typeof document === 'undefined') {
      return;
    }

    const fonts = [
      ['400', 'assets/fonts/be-vietnam-pro/BeVietnamPro-Regular.ttf'],
      ['600', 'assets/fonts/be-vietnam-pro/BeVietnamPro-SemiBold.ttf'],
      ['700', 'assets/fonts/be-vietnam-pro/BeVietnamPro-Bold.ttf'],
      ['800', 'assets/fonts/be-vietnam-pro/BeVietnamPro-ExtraBold.ttf'],
    ] as const;

    await Promise.all(
      fonts.map(async ([weight, src]) => {
        const face = new FontFace('Be Vietnam Pro', `url("${src}")`, {
          style: 'normal',
          weight,
        });
        const loaded = await face.load();
        document.fonts.add(loaded);
      }),
    );
  })().catch((error) => {
    fontLoadPromise = undefined;
    console.warn('Không thể tải Be Vietnam Pro, poster sẽ dùng font dự phòng.', error);
  });

  return fontLoadPromise;
}

function drawBackground(context: CanvasRenderingContext2D, background: HTMLImageElement): void {
  const base = context.createLinearGradient(0, 0, POSTER_WIDTH, POSTER_HEIGHT);
  base.addColorStop(0, '#fbfdff');
  base.addColorStop(0.45, '#eff7fc');
  base.addColorStop(1, '#e7f0f7');
  context.fillStyle = base;
  context.fillRect(0, 0, POSTER_WIDTH, POSTER_HEIGHT);

  const heroImageHeight = (POSTER_WIDTH / background.naturalWidth) * background.naturalHeight;
  context.save();
  context.globalAlpha = 0.72;
  context.drawImage(background, 110, -35, POSTER_WIDTH, heroImageHeight);
  context.restore();

  const heroWash = context.createLinearGradient(0, 0, 920, 0);
  heroWash.addColorStop(0, 'rgba(252, 254, 255, 0.98)');
  heroWash.addColorStop(0.5, 'rgba(252, 254, 255, 0.76)');
  heroWash.addColorStop(1, 'rgba(252, 254, 255, 0.12)');
  context.fillStyle = heroWash;
  context.fillRect(0, 0, 930, 430);

  context.fillStyle = 'rgba(255, 255, 255, 0.64)';
  context.beginPath();
  context.moveTo(0, 372);
  context.bezierCurveTo(245, 315, 480, 410, 705, 365);
  context.bezierCurveTo(865, 333, 970, 295, POSTER_WIDTH, 320);
  context.lineTo(POSTER_WIDTH, 1125);
  context.bezierCurveTo(810, 1070, 520, 1160, 255, 1090);
  context.bezierCurveTo(145, 1060, 64, 1080, 0, 1115);
  context.closePath();
  context.fill();

  context.fillStyle = 'rgba(239, 82, 99, 0.08)';
  context.beginPath();
  context.moveTo(760, 940);
  context.bezierCurveTo(940, 870, 1080, 955, 1080, 1090);
  context.lineTo(1080, 1260);
  context.bezierCurveTo(945, 1215, 855, 1135, 760, 940);
  context.closePath();
  context.fill();

  context.fillStyle = 'rgba(9, 86, 151, 0.06)';
  context.beginPath();
  context.arc(65, 1290, 195, 0, Math.PI * 2);
  context.fill();
}

function drawHeader(context: CanvasRenderingContext2D, data: RecruitmentPosterData): void {
  context.save();
  context.shadowColor = 'rgba(9, 55, 96, 0.1)';
  context.shadowBlur = 24;
  context.shadowOffsetY = 7;
  drawRoundedRect(context, 28, 24, 785, 64, 32, 'rgba(255, 255, 255, 0.88)');
  context.restore();

  context.fillStyle = '#064c89';
  setFont(context, 800, 25);
  fitSingleLine(context, data.companyHeader.toUpperCase(), 45, 42, 760, 25, 18, 800);

  drawRoundedRect(context, 850, 34, 182, 48, 24, 'rgba(255, 255, 255, 0.9)');
  context.fillStyle = '#17324e';
  setFont(context, 700, 18);
  context.textAlign = 'center';
  context.fillText(`MÃ: ${data.orderCode || 'ĐANG CẬP NHẬT'}`, 941, 48);
  context.textAlign = 'left';

  context.fillStyle = '#ef5263';
  drawRoundedRect(context, 45, 96, 64, 5, 3, '#ef5263');
}

function drawHero(context: CanvasRenderingContext2D, data: RecruitmentPosterData): void {
  drawHeroNoticeIcons(context, 45, 126);

  const content = (data.title || 'ĐƠN TUYỂN MỚI').toUpperCase();
  const lines = wrapText(context, content, 650, 68, 800).slice(0, 3);
  const startY = 198 - Math.max(0, lines.length - 2) * 25;

  context.fillStyle = '#075693';
  setFont(context, 800, 68);
  lines.forEach((line, index) => {
    context.fillText(line, 48, startY + index * 76);
  });

  const accentY = startY + lines.length * 76 + 8;
  drawRoundedRect(context, 50, accentY, 74, 6, 3, '#ef5263');
  context.fillStyle = '#0c355b';
  setFont(context, 600, 17);
  context.fillText('Thông tin chương trình • Cập nhật mới', 145, accentY - 7);
}

async function drawRegistrationQr(
  context: CanvasRenderingContext2D,
  data: RecruitmentPosterData,
): Promise<void> {
  const x = 810;
  const y = 126;
  const width = 222;
  const height = 258;

  context.save();
  context.shadowColor = 'rgba(8, 50, 87, 0.16)';
  context.shadowBlur = 30;
  context.shadowOffsetY = 12;
  drawRoundedRect(context, x, y, width, height, 44, 'rgba(255, 255, 255, 0.95)');
  context.restore();

  context.fillStyle = '#e8384f';
  setFont(context, 800, 20);
  context.textAlign = 'center';
  fitSingleLine(
    context,
    data.registrationLabel.toUpperCase(),
    x + width / 2,
    y + 19,
    width - 30,
    20,
    15,
    800,
  );

  const qrCanvas = document.createElement('canvas');
  await QRCode.toCanvas(qrCanvas, data.registrationUrl || 'https://viejap.com', {
    width: 174,
    margin: 1,
    errorCorrectionLevel: 'H',
    color: {
      dark: '#061a2dff',
      light: '#ffffffff',
    },
  });
  context.drawImage(qrCanvas, x + 24, y + 57, 174, 174);

  context.fillStyle = '#657b91';
  setFont(context, 600, 13);
  context.fillText('Quét mã để đăng ký', x + width / 2, y + 235);
  context.textAlign = 'left';
}

function drawJobInformation(context: CanvasRenderingContext2D, data: RecruitmentPosterData): void {
  const x = 45;
  const y = 435;
  const width = 540;
  const height = 565;

  context.save();
  context.shadowColor = 'rgba(7, 55, 94, 0.12)';
  context.shadowBlur = 36;
  context.shadowOffsetY = 16;
  drawRoundedRect(context, x, y, width, height, 48, 'rgba(255, 255, 255, 0.92)');
  context.restore();

  context.fillStyle = '#ef5263';
  context.beginPath();
  context.arc(x + width - 26, y + 30, 8, 0, Math.PI * 2);
  context.fill();

  drawIconBadge(context, x + 42, y + 41, '#e8f3fa', '#07559d', 'briefcase');
  context.fillStyle = '#0a355c';
  setFont(context, 800, 25);
  context.fillText('THÔNG TIN CÔNG VIỆC', x + 100, y + 48);

  context.fillStyle = '#d9e5ef';
  drawRoundedRect(context, x + 38, y + 105, width - 76, 2, 1, '#d9e5ef');

  context.fillStyle = '#152b40';
  setFont(context, 700, 25);
  let cursorY = drawWrappedText(context, data.jobDescription, x + 38, y + 132, width - 76, 36, 3);

  cursorY += 18;
  const salaryGradient = context.createLinearGradient(x + 38, cursorY, x + width - 38, cursorY);
  salaryGradient.addColorStop(0, '#e7f4fb');
  salaryGradient.addColorStop(1, '#f2f8fc');
  drawRoundedRect(context, x + 38, cursorY, width - 76, 68, 34, salaryGradient);
  drawYenIcon(context, x + 70, cursorY + 34, '#07559d');
  context.fillStyle = '#07559d';
  setFont(context, 800, 22);
  fitSingleLine(
    context,
    data.salary || 'Lương đang cập nhật',
    x + 108,
    cursorY + 20,
    width - 170,
    22,
    16,
    800,
  );
  cursorY += 92;

  const requirements = data.requirements
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 4);

  requirements.forEach((item) => {
    drawCheckIcon(context, x + 55, cursorY + 17);
    context.fillStyle = '#1b3044';
    setFont(context, 600, 21);
    cursorY = drawWrappedText(context, item, x + 91, cursorY, width - 135, 31, 1) + 11;
  });
}

function drawPhotoFrame(
  context: CanvasRenderingContext2D,
  image: HTMLImageElement,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
  caption: string,
): void {
  context.save();
  context.shadowColor = 'rgba(8, 47, 82, 0.18)';
  context.shadowBlur = 34;
  context.shadowOffsetY = 14;
  organicPhotoPath(context, x - 8, y - 8, width + 16, height + 16, radius + 8);
  context.fillStyle = '#ffffff';
  context.fill();
  context.restore();

  context.save();
  organicPhotoPath(context, x, y, width, height, radius);
  context.clip();
  drawImageCover(context, image, x, y, width, height, 0.5, 0.43);

  const overlay = context.createLinearGradient(0, y, 0, y + height * 0.44);
  overlay.addColorStop(0, 'rgba(4, 30, 52, 0.22)');
  overlay.addColorStop(1, 'rgba(4, 30, 52, 0)');
  context.fillStyle = overlay;
  context.fillRect(x, y, width, height * 0.44);

  setFont(context, 700, 14);
  const captionWidth = Math.min(width - 44, context.measureText(caption).width + 38);
  drawRoundedRect(context, x + 22, y + 22, captionWidth, 38, 19, 'rgba(255, 255, 255, 0.9)');
  context.fillStyle = '#075693';
  context.fillText(caption, x + 41, y + 33);
  context.restore();
}

function drawSummaryCard(context: CanvasRenderingContext2D, data: RecruitmentPosterData): void {
  const x = 45;
  const y = 1060;
  const width = 990;
  const height = 230;

  context.fillStyle = '#0c355b';
  setFont(context, 700, 15);
  context.fillText('THÔNG TIN CHƯƠNG TRÌNH', x + 8, y - 29);

  const rows: Array<{
    icon: SummaryIcon;
    label: string;
    value: string;
  }> = [
    {
      icon: 'location',
      label: 'ĐỊA ĐIỂM',
      value: data.location || 'ĐANG CẬP NHẬT',
    },
    {
      icon: 'age',
      label: 'ĐỘ TUỔI',
      value: data.ageRange || 'ĐANG CẬP NHẬT',
    },
    {
      icon: 'calendar',
      label: 'PHỎNG VẤN',
      value: formatDate(data.interviewDate),
    },
    {
      icon: 'plane',
      label: 'XUẤT CẢNH',
      value: data.departureDate || 'ĐANG CẬP NHẬT',
    },
  ];

  rows.forEach((row, index) => {
    const gap = 18;
    const cellWidth = (width - gap * 3) / 4;
    const cellX = x + index * (cellWidth + gap);
    const centerX = cellX + cellWidth / 2;

    context.save();
    context.shadowColor = 'rgba(5, 60, 103, 0.1)';
    context.shadowBlur = 24;
    context.shadowOffsetY = 10;
    drawRoundedRect(context, cellX, y, cellWidth, height, 38, 'rgba(255, 255, 255, 0.92)');
    context.restore();

    drawSummaryIcon(context, row.icon, centerX, y + 75);

    context.fillStyle = '#71879a';
    setFont(context, 700, 13);
    context.textAlign = 'center';
    context.fillText(row.label, centerX, y + 125);

    context.fillStyle = '#0a4f8d';
    setFont(context, 800, 22);
    fitSingleLine(context, row.value.toUpperCase(), centerX, y + 158, cellWidth - 28, 22, 16, 800);

    drawRoundedRect(
      context,
      cellX + cellWidth / 2 - 24,
      y + height - 25,
      48,
      4,
      2,
      index === 2 ? '#ef5263' : '#a9d1e8',
    );
  });
  context.textAlign = 'left';
}

function drawFooter(
  context: CanvasRenderingContext2D,
  hotline: string,
  logo: HTMLImageElement,
): void {
  const x = 45;
  const y = 1345;
  const width = 990;
  const height = 210;

  context.save();
  context.shadowColor = 'rgba(5, 55, 96, 0.12)';
  context.shadowBlur = 32;
  context.shadowOffsetY = 12;
  drawRoundedRect(context, x, y, width, height, 50, 'rgba(255, 255, 255, 0.94)');
  context.restore();

  context.fillStyle = '#e8384f';
  setFont(context, 700, 15);

  const phoneGradient = context.createLinearGradient(x + 38, y, x + 515, y);
  phoneGradient.addColorStop(0, '#075a9d');
  phoneGradient.addColorStop(1, '#0b76b5');
  drawRoundedRect(context, x + 38, y + 76, 480, 86, 43, phoneGradient);
  drawPhoneIcon(context, x + 82, y + 119);
  context.fillStyle = '#ffffff';
  setFont(context, 800, 29);
  context.fillText(hotline || 'LIÊN HỆ VIEJAP', x + 126, y + 96);

  context.fillStyle = '#b7c9d9';
  drawRoundedRect(context, x + 558, y + 35, 2, 140, 1, '#c8d8e4');

  drawLogo(context, logo, x + 605, y + 38, 330, 125);
}

function drawAttribution(context: CanvasRenderingContext2D): void {
  context.fillStyle = 'rgba(28, 62, 91, 0.62)';
  setFont(context, 400, 10);
  context.textAlign = 'right';
  context.fillText(
    'Ảnh nền: Midori / Wikimedia Commons - CC BY 3.0',
    POSTER_WIDTH - 22,
    POSTER_HEIGHT - 18,
  );
  context.textAlign = 'left';
}

function drawLogo(
  context: CanvasRenderingContext2D,
  logo: HTMLImageElement,
  x: number,
  y: number,
  maxWidth: number,
  maxHeight: number,
): void {
  const ratio = Math.min(maxWidth / logo.naturalWidth, maxHeight / logo.naturalHeight);
  const width = logo.naturalWidth * ratio;
  const height = logo.naturalHeight * ratio;
  context.drawImage(logo, x + (maxWidth - width) / 2, y + (maxHeight - height) / 2, width, height);
}

function drawIconBadge(
  context: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  background: string,
  color: string,
  icon: 'briefcase',
): void {
  context.fillStyle = background;
  context.beginPath();
  context.arc(centerX, centerY, 27, 0, Math.PI * 2);
  context.fill();

  if (icon === 'briefcase') {
    drawBriefcaseIcon(context, centerX, centerY, color);
  }
}

function drawHeroNoticeIcons(context: CanvasRenderingContext2D, x: number, y: number): void {
  drawRoundedRect(context, x, y, 98, 48, 24, '#e8384f');

  context.save();
  context.strokeStyle = '#ffffff';
  context.fillStyle = '#ffffff';
  context.lineWidth = 3;
  context.lineCap = 'round';
  context.lineJoin = 'round';

  context.beginPath();
  context.moveTo(x + 17, y + 23);
  context.lineTo(x + 29, y + 17);
  context.lineTo(x + 29, y + 31);
  context.closePath();
  context.fill();

  context.beginPath();
  context.moveTo(x + 29, y + 17);
  context.lineTo(x + 43, y + 12);
  context.lineTo(x + 43, y + 36);
  context.lineTo(x + 29, y + 31);
  context.closePath();
  context.stroke();

  context.beginPath();
  context.moveTo(x + 20, y + 31);
  context.lineTo(x + 24, y + 39);
  context.lineTo(x + 31, y + 39);
  context.stroke();

  context.beginPath();
  context.moveTo(x + 48, y + 18);
  context.quadraticCurveTo(x + 54, y + 24, x + 48, y + 30);
  context.stroke();

  context.beginPath();
  context.arc(x + 75, y + 24, 13, 0, Math.PI * 2);
  context.stroke();

  setFont(context, 800, 20);
  context.textAlign = 'center';
  context.fillText('!', x + 75, y + 12);
  context.textAlign = 'left';
  context.restore();
}

function drawBriefcaseIcon(
  context: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  color: string,
): void {
  context.save();
  context.strokeStyle = color;
  context.lineWidth = 3;
  context.lineJoin = 'round';
  context.strokeRect(centerX - 13, centerY - 7, 26, 18);
  context.beginPath();
  context.roundRect(centerX - 7, centerY - 13, 14, 7, 3);
  context.stroke();
  context.beginPath();
  context.moveTo(centerX - 13, centerY);
  context.lineTo(centerX - 3, centerY + 4);
  context.lineTo(centerX + 3, centerY + 4);
  context.lineTo(centerX + 13, centerY);
  context.stroke();
  context.restore();
}

function drawYenIcon(
  context: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  color: string,
): void {
  context.save();
  context.strokeStyle = color;
  context.lineWidth = 3;
  context.beginPath();
  context.arc(centerX, centerY, 21, 0, Math.PI * 2);
  context.stroke();
  context.fillStyle = color;
  setFont(context, 800, 21);
  context.textAlign = 'center';
  context.fillText('¥', centerX, centerY - 14);
  context.textAlign = 'left';
  context.restore();
}

function drawCheckIcon(context: CanvasRenderingContext2D, centerX: number, centerY: number): void {
  context.fillStyle = '#e8f4ee';
  context.beginPath();
  context.arc(centerX, centerY, 15, 0, Math.PI * 2);
  context.fill();

  context.strokeStyle = '#16835c';
  context.lineWidth = 3;
  context.lineCap = 'round';
  context.lineJoin = 'round';
  context.beginPath();
  context.moveTo(centerX - 6, centerY);
  context.lineTo(centerX - 1, centerY + 5);
  context.lineTo(centerX + 7, centerY - 6);
  context.stroke();
}

function drawSummaryIcon(
  context: CanvasRenderingContext2D,
  icon: SummaryIcon,
  centerX: number,
  centerY: number,
): void {
  context.fillStyle = '#e7f3fa';
  context.beginPath();
  context.arc(centerX, centerY, 34, 0, Math.PI * 2);
  context.fill();

  context.save();
  context.strokeStyle = '#0b609e';
  context.fillStyle = '#0b609e';
  context.lineWidth = 3;
  context.lineCap = 'round';
  context.lineJoin = 'round';

  if (icon === 'location') {
    context.beginPath();
    context.arc(centerX, centerY - 5, 8, 0, Math.PI * 2);
    context.stroke();
    context.beginPath();
    context.moveTo(centerX - 17, centerY - 6);
    context.bezierCurveTo(
      centerX - 17,
      centerY - 28,
      centerX + 17,
      centerY - 28,
      centerX + 17,
      centerY - 6,
    );
    context.bezierCurveTo(
      centerX + 17,
      centerY + 7,
      centerX + 7,
      centerY + 17,
      centerX,
      centerY + 25,
    );
    context.bezierCurveTo(
      centerX - 7,
      centerY + 17,
      centerX - 17,
      centerY + 7,
      centerX - 17,
      centerY - 6,
    );
    context.stroke();
  } else if (icon === 'age') {
    context.beginPath();
    context.arc(centerX, centerY - 10, 9, 0, Math.PI * 2);
    context.stroke();
    context.beginPath();
    context.arc(centerX, centerY + 22, 18, Math.PI * 1.05, Math.PI * 1.95);
    context.stroke();
  } else if (icon === 'calendar') {
    context.strokeRect(centerX - 19, centerY - 15, 38, 34);
    context.beginPath();
    context.moveTo(centerX - 19, centerY - 5);
    context.lineTo(centerX + 19, centerY - 5);
    context.moveTo(centerX - 10, centerY - 22);
    context.lineTo(centerX - 10, centerY - 10);
    context.moveTo(centerX + 10, centerY - 22);
    context.lineTo(centerX + 10, centerY - 10);
    context.stroke();
    [-9, 1, 11].forEach((offsetX) => {
      context.beginPath();
      context.arc(centerX + offsetX, centerY + 7, 2, 0, Math.PI * 2);
      context.fill();
    });
  } else {
    context.beginPath();
    context.moveTo(centerX - 24, centerY + 7);
    context.lineTo(centerX - 4, centerY + 1);
    context.lineTo(centerX + 10, centerY - 22);
    context.lineTo(centerX + 16, centerY - 20);
    context.lineTo(centerX + 8, centerY - 1);
    context.lineTo(centerX + 24, centerY + 6);
    context.lineTo(centerX + 21, centerY + 11);
    context.lineTo(centerX + 3, centerY + 7);
    context.lineTo(centerX - 7, centerY + 23);
    context.lineTo(centerX - 13, centerY + 21);
    context.lineTo(centerX - 9, centerY + 6);
    context.lineTo(centerX - 22, centerY + 12);
    context.closePath();
    context.fill();
  }
  context.restore();
}

function drawPhoneIcon(context: CanvasRenderingContext2D, centerX: number, centerY: number): void {
  context.save();
  context.strokeStyle = '#ffffff';
  context.lineWidth = 6;
  context.lineCap = 'round';
  context.beginPath();
  context.moveTo(centerX - 12, centerY - 15);
  context.bezierCurveTo(
    centerX - 21,
    centerY - 4,
    centerX + 1,
    centerY + 19,
    centerX + 13,
    centerY + 12,
  );
  context.stroke();
  context.beginPath();
  context.moveTo(centerX - 15, centerY - 17);
  context.lineTo(centerX - 7, centerY - 10);
  context.moveTo(centerX + 10, centerY + 9);
  context.lineTo(centerX + 16, centerY + 16);
  context.stroke();
  context.restore();
}

function formatDate(value: string): string {
  if (!value) {
    return 'ĐANG CẬP NHẬT';
  }

  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('vi-VN').format(date);
}

function drawWrappedText(
  context: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxLines: number,
): number {
  const lines = wrapTextWithCurrentFont(context, text || 'Đang cập nhật', maxWidth);
  const visibleLines = lines.slice(0, maxLines);
  if (lines.length > maxLines && visibleLines.length) {
    visibleLines[visibleLines.length - 1] = truncateLine(
      context,
      `${visibleLines[visibleLines.length - 1]}…`,
      maxWidth,
    );
  }

  visibleLines.forEach((line, index) => {
    context.fillText(line, x, y + index * lineHeight);
  });
  return y + visibleLines.length * lineHeight;
}

function wrapText(
  context: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  fontSize: number,
  fontWeight: number,
): string[] {
  setFont(context, fontWeight, fontSize);
  return wrapTextWithCurrentFont(context, text, maxWidth);
}

function wrapTextWithCurrentFont(
  context: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
): string[] {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (!words.length) {
    return [''];
  }

  const lines: string[] = [];
  let currentLine = words[0];
  for (let index = 1; index < words.length; index += 1) {
    const candidate = `${currentLine} ${words[index]}`;
    if (context.measureText(candidate).width <= maxWidth) {
      currentLine = candidate;
    } else {
      lines.push(currentLine);
      currentLine = words[index];
    }
  }
  lines.push(currentLine);
  return lines;
}

function truncateLine(context: CanvasRenderingContext2D, text: string, maxWidth: number): string {
  let result = text;
  while (result.length > 1 && context.measureText(result).width > maxWidth) {
    result = `${result.slice(0, -2)}…`;
  }
  return result;
}

function fitSingleLine(
  context: CanvasRenderingContext2D,
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
    setFont(context, weight, size);
    if (context.measureText(text).width <= maxWidth) {
      break;
    }
    size -= 1;
  }
  context.fillText(truncateLine(context, text, maxWidth), x, y);
}

function setFont(context: CanvasRenderingContext2D, weight: number, size: number): void {
  context.font = `${weight} ${size}px ${FONT_FAMILY}`;
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

function drawRoundedRect(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
  fill: string | CanvasGradient,
): void {
  context.save();
  roundedRectPath(context, x, y, width, height, radius);
  context.fillStyle = fill;
  context.fill();
  context.restore();
}

function roundedRectPath(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
): void {
  const cappedRadius = Math.min(radius, width / 2, height / 2);
  context.beginPath();
  context.roundRect(x, y, width, height, cappedRadius);
}

function organicPhotoPath(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
): void {
  const r = Math.min(radius, width * 0.2, height * 0.2);
  context.beginPath();
  context.moveTo(x + r, y);
  context.lineTo(x + width - r * 1.35, y);
  context.quadraticCurveTo(x + width, y, x + width, y + r * 1.35);
  context.lineTo(x + width, y + height - r);
  context.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  context.lineTo(x + r * 1.5, y + height);
  context.quadraticCurveTo(x, y + height, x, y + height - r * 1.5);
  context.lineTo(x, y + r);
  context.quadraticCurveTo(x, y, x + r, y);
  context.closePath();
}

function loadImage(src: string): Promise<HTMLImageElement> {
  const cached = imageCache.get(src);
  if (cached) {
    return cached;
  }

  const promise = new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Không thể tải ảnh: ${src}`));
    image.src = src;
  });
  imageCache.set(src, promise);
  return promise;
}
