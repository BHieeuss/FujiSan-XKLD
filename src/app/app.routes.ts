import { Routes } from '@angular/router';
import { adminAuthGuard, adminMatchGuard } from './admin/admin-auth.guard';

export const routes: Routes = [
  {
    path: '',
    title: 'VieJap - Đi Nhật có lộ trình, chuẩn bị nhẹ hơn',
    loadComponent: () => import('./pages/home/home').then((module) => module.Home),
  },
  {
    path: 'hoc-hiragana',
    title: 'Học Hiragana - VieJap',
    loadComponent: () =>
      import('./pages/hiragana/hiragana-page').then((module) => module.HiraganaPage),
  },
  {
    path: 'hoc-katakana',
    title: 'Học Katakana - VieJap',
    loadComponent: () =>
      import('./pages/katakana/katakana-page').then((module) => module.KatakanaPage),
  },
  {
    path: 'hoc-so-dem',
    title: 'Học số đếm tiếng Nhật - VieJap',
    loadComponent: () =>
      import('./pages/numbers/numbers-page').then((module) => module.NumbersPage),
  },
  {
    path: 'hoc-minna-bai-1',
    title: 'Minna no Nihongo Bài 1 - VieJap',
    loadComponent: () =>
      import('./pages/minna-lesson-1/minna-lesson-1-page').then(
        (module) => module.MinnaLesson1Page,
      ),
  },
  {
    path: 'form-hoc-vien',
    title: 'Khai sơ yếu lý lịch học viên - VieJap',
    loadComponent: () =>
      import('./pages/student-form/student-form-page').then(
        (module) => module.StudentFormPage,
      ),
  },
  {
    path: 'dang-nhap-quan-tri',
    title: 'Đăng nhập quản trị - VieJap',
    loadComponent: () =>
      import('./admin/admin-login-page').then((module) => module.AdminLoginPage),
  },
  {
    path: 'quan-tri-viejap',
    title: 'Quản trị - VieJap',
    canMatch: [adminMatchGuard],
    canActivate: [adminAuthGuard],
    loadComponent: () => import('./admin/admin-page').then((module) => module.AdminPage),
  },
  {
    path: 'faq',
    title: 'Câu hỏi thường gặp - VieJap',
    data: { pageKey: 'faq' },
    loadComponent: () =>
      import('./pages/support/support-page').then((module) => module.SupportPage),
  },
  {
    path: 'chinh-sach-bao-mat',
    title: 'Chính sách bảo mật - VieJap',
    data: { pageKey: 'privacy' },
    loadComponent: () =>
      import('./pages/support/support-page').then((module) => module.SupportPage),
  },
  {
    path: 'dieu-khoan',
    title: 'Điều khoản sử dụng - VieJap',
    data: { pageKey: 'terms' },
    loadComponent: () =>
      import('./pages/support/support-page').then((module) => module.SupportPage),
  },
  {
    path: 'huong-dan',
    title: 'Hướng dẫn đăng ký - VieJap',
    data: { pageKey: 'guide' },
    loadComponent: () =>
      import('./pages/support/support-page').then((module) => module.SupportPage),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
