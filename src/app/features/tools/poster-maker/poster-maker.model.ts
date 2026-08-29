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
}

export interface RecruitmentPosterAssets {
  logoSrc: string;
  backgroundSrc: string;
  primaryPhotoSrc: string;
  secondaryPhotoSrc: string;
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
