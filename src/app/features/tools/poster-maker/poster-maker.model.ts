export interface RecruitmentPosterData {
  companyHeader: string;
  orderCode: string;
  title: string;
  jobDescription: string;
  salary: string;
  requirements: string;
  location: string;
  ageRange: string;
  interviewDate: string;
  departureDate: string;
  registrationLabel: string;
  registrationUrl: string;
  hotline: string;
  category?: string;
  quantity?: string;
  gender?: string;
  benefits?: string;
  age?: string;
  workLocation?: string;
  contactHotline?: string;
  contactUnit?: string;
}

export interface RecruitmentPosterAssets {
  logoSrc: string;
  backgroundSrc: string;
  primaryPhotoSrc: string;
  secondaryPhotoSrc: string;
  tertiaryPhotoSrc?: string;
}

/**
 * Trả về bộ 3 ảnh chuẩn mặc định theo đúng thứ tự Ảnh 1, Ảnh 2, Ảnh 3 (1.png, 2.png, 3.png).
 * Tuyệt đối không tự ý lấy ảnh khác ngoài danh mục chuẩn.
 */
export function getDefaultPosterPhotos(category?: string): {
  primaryPhotoSrc: string;
  secondaryPhotoSrc: string;
  tertiaryPhotoSrc: string;
} {
  const cat = (category || '').toLowerCase();
  if (cat.includes('ky-su') || cat.includes('kysu') || cat.includes('kỹ sư')) {
    return {
      primaryPhotoSrc: 'assets/images/KySu/1.png',
      secondaryPhotoSrc: 'assets/images/KySu/2.png',
      tertiaryPhotoSrc: 'assets/images/KySu/3.png',
    };
  }
  if (cat.includes('tokutei') || cat.includes('tkt') || cat.includes('đặc định')) {
    return {
      primaryPhotoSrc: 'assets/images/TKT/1.png',
      secondaryPhotoSrc: 'assets/images/TKT/2.png',
      tertiaryPhotoSrc: 'assets/images/TKT/3.png',
    };
  }
  if (cat.includes('du-hoc') || cat.includes('dhs') || cat.includes('du học')) {
    return {
      primaryPhotoSrc: 'assets/images/DHS/1.png',
      secondaryPhotoSrc: 'assets/images/DHS/2.png',
      tertiaryPhotoSrc: 'assets/images/DHS/3.png',
    };
  }
  // Mặc định chuẩn thực tập sinh (TTS) XKLĐ của VieJap: 1.png, 2.png, 3.png
  return {
    primaryPhotoSrc: 'assets/images/TTS/1.png',
    secondaryPhotoSrc: 'assets/images/TTS/2.png',
    tertiaryPhotoSrc: 'assets/images/TTS/3.png',
  };
}

export function createDefaultPosterAssets(category?: string): RecruitmentPosterAssets {
  const photos = getDefaultPosterPhotos(category);
  return {
    logoSrc: 'assets/images/logo.png',
    backgroundSrc: 'assets/images/poster/fuji-sakura-background.jpg',
    primaryPhotoSrc: photos.primaryPhotoSrc,
    secondaryPhotoSrc: photos.secondaryPhotoSrc,
    tertiaryPhotoSrc: photos.tertiaryPhotoSrc,
  };
}

export function createRecruitmentPosterData(): RecruitmentPosterData {
  return {
    companyHeader: 'CÔNG TY CUNG ỨNG NHÂN LỰC QUỐC TẾ VIEJAP',
    orderCode: 'TDTN21',
    title: 'LINH KIỆN ĐIỆN TỬ',
    jobDescription: 'Kiểm tra, đóng gói linh kiện điện tử dùng trong ô tô',
    salary: 'Lương cơ bản: 1.049 yên/giờ',
    requirements: [
      'Hỗ trợ sinh hoạt phí mỗi tháng',
      'Không có kinh nghiệm sẽ được đào tạo',
      'Tốt nghiệp cấp 2 trở lên',
    ].join('\n'),
    location: 'FUKUSHIMA',
    ageRange: '18–35',
    interviewDate: '2026-07-07',
    departureDate: '12/2026',
    registrationLabel: 'ĐĂNG KÝ HỒ SƠ',
    registrationUrl: 'https://zalo.me/0966966284',
    hotline: '0966 966 284',
  };
}
