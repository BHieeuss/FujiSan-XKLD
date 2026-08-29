import { Routes } from '@angular/router';
import { adminAuthGuard, adminMatchGuard } from './features/admin/guards/admin-auth.guard';

export const routes: Routes = [
  {
    path: '',
    title: 'VieJap - Đi Nhật có lộ trình, chuẩn bị nhẹ hơn',
    loadComponent: () => import('./features/public/home/home').then((module) => module.Home),
  },
  {
    path: 'hoc-hiragana',
    title: 'Học Hiragana - VieJap',
    loadComponent: () =>
      import('./features/learning/alphabet/hiragana/hiragana-page').then((module) => module.HiraganaPage),
  },
  {
    path: 'hoc-katakana',
    title: 'Học Katakana - VieJap',
    loadComponent: () =>
      import('./features/learning/alphabet/katakana/katakana-page').then((module) => module.KatakanaPage),
  },
  {
    path: 'hoc-so-dem',
    title: 'Học số đếm tiếng Nhật - VieJap',
    loadComponent: () =>
      import('./features/learning/lessons/numbers/numbers-page').then((module) => module.NumbersPage),
  },
  {
    path: 'hoc-kanji',
    title: 'Công cụ học Kanji - VieJap',
    loadComponent: () =>
      import('./features/learning/lessons/kanji/tools/kanji-tools-page').then((module) => module.KanjiToolsPage),
  },
  {
    path: 'hoc-kanji-n5',
    redirectTo: 'hoc-kanji-n5/bai-1',
    pathMatch: 'full',
  },
  {
    path: 'hoc-kanji-n5/:lessonSlug',
    title: 'Kanji N5 - VieJap',
    loadComponent: () =>
      import('./features/learning/lessons/kanji/kanji-n5/kanji-n5-page').then((module) => module.KanjiN5Page),
  },
  {
    path: 'hoc-minna-bai-1',
    title: 'Minna no Nihongo Bài 1 - VieJap',
    loadComponent: () =>
      import('./features/learning/lessons/minna/lesson-1/minna-lesson-1-page').then(
        (module) => module.MinnaLesson1Page,
      ),
  },
  {
    path: 'form-hoc-vien',
    title: 'Khai sơ yếu lý lịch học viên - VieJap',
    loadComponent: () =>
      import('./features/tools/student-form/student-form-page').then(
        (module) => module.StudentFormPage,
      ),
  },
  {
    path: 'don-hang',
    title: 'Đơn hàng đang tuyển - VieJap',
    loadComponent: () => import('./features/jobs/pages/jobs-page').then((module) => module.JobsPage),
  },
  {
    path: 'don-hang/:id',
    title: 'Thông tin đơn hàng - VieJap',
    loadComponent: () =>
      import('./features/jobs/pages/job-order-detail-page').then((module) => module.JobOrderDetailPage),
  },
  {
    path: 'dang-nhap-quan-tri',
    title: 'Đăng nhập quản trị - VieJap',
    loadComponent: () =>
      import('./features/admin/pages/admin-login-page').then((module) => module.AdminLoginPage),
  },
  {
    path: 'quan-tri-viejap',
    title: 'Quản trị - VieJap',
    canMatch: [adminMatchGuard],
    canActivate: [adminAuthGuard],
    loadComponent: () => import('./features/admin/pages/admin-page').then((module) => module.AdminPage),
  },
  {
    path: 'faq',
    title: 'Câu hỏi thường gặp - VieJap',
    data: { pageKey: 'faq' },
    loadComponent: () =>
      import('./features/public/support/support-page').then((module) => module.SupportPage),
  },
  {
    path: 'chinh-sach-bao-mat',
    title: 'Chính sách bảo mật - VieJap',
    data: { pageKey: 'privacy' },
    loadComponent: () =>
      import('./features/public/support/support-page').then((module) => module.SupportPage),
  },
  {
    path: 'dieu-khoan',
    title: 'Điều khoản sử dụng - VieJap',
    data: { pageKey: 'terms' },
    loadComponent: () =>
      import('./features/public/support/support-page').then((module) => module.SupportPage),
  },
  {
    path: 'huong-dan',
    title: 'Hướng dẫn đăng ký - VieJap',
    data: { pageKey: 'guide' },
    loadComponent: () =>
      import('./features/public/support/support-page').then((module) => module.SupportPage),
  },
  {
    path: 'luyen-the-te',
    title: 'Luyện chia Thể て - VieJap',
    loadComponent: () =>
      import('./features/learning/verb-forms/forms/te-form/te-form-page').then((module) => module.TeFormPage),
  },
  {
    path: 'luyen-the-ta',
    title: 'Luyện chia Thể quá khứ (た) - VieJap',
    loadComponent: () =>
      import('./features/learning/verb-forms/forms/ta-form/ta-form-page').then((module) => module.TaFormPage),
  },
  {
    path: 'luyen-the-nai',
    title: 'Luyện chia Thể phủ định (ない) - VieJap',
    loadComponent: () =>
      import('./features/learning/verb-forms/forms/nai-form/nai-form-page').then((module) => module.NaiFormPage),
  },
  {
    path: 'luyen-the-ru',
    title: 'Luyện chia Thể từ điển (る) - VieJap',
    loadComponent: () =>
      import('./features/learning/verb-forms/forms/ru-form/ru-form-page').then((module) => module.RuFormPage),
  },
  {
    path: 'luyen-the-y-chi',
    title: 'Luyện chia Thể ý chí (よう) - VieJap',
    loadComponent: () =>
      import('./features/learning/verb-forms/forms/volitional-form/volitional-form-page').then((module) => module.VolitionalFormPage),
  },
  {
    path: 'luyen-the-menh-lenh',
    title: 'Luyện chia Thể mệnh lệnh (命令形) - VieJap',
    loadComponent: () =>
      import('./features/learning/verb-forms/forms/imperative-form/imperative-form-page').then((module) => module.ImperativeFormPage),
  },
  {
    path: 'luyen-the-cam-chi',
    title: 'Luyện chia Thể cấm chỉ (禁止形 / な) - VieJap',
    loadComponent: () =>
      import('./features/learning/verb-forms/forms/prohibitive-form/prohibitive-form-page').then((module) => module.ProhibitiveFormPage),
  },
  {
    path: 'luyen-the-kha-nang',
    title: 'Luyện chia Thể khả năng (可能形) - VieJap',
    loadComponent: () =>
      import('./features/learning/verb-forms/forms/potential-form/potential-form-page').then((module) => module.PotentialFormPage),
  },
  {
    path: 'luyen-the-dieu-kien',
    title: 'Luyện chia Thể điều kiện (条件形 / ば) - VieJap',
    loadComponent: () =>
      import('./features/learning/verb-forms/forms/conditional-form/conditional-form-page').then((module) => module.ConditionalFormPage),
  },
  {
    path: 'luyen-the-bi-dong',
    title: 'Luyện chia Thể bị động (受身形) - VieJap',
    loadComponent: () =>
      import('./features/learning/verb-forms/forms/passive-form/passive-form-page').then((module) => module.PassiveFormPage),
  },
  {
    path: 'luyen-the-sai-khien',
    title: 'Luyện chia Thể sai khiến (使役形) - VieJap',
    loadComponent: () =>
      import('./features/learning/verb-forms/forms/causative-form/causative-form-page').then((module) => module.CausativeFormPage),
  },
  {
    path: 'luyen-the-sai-khien-bi-dong',
    title: 'Luyện chia Thể sai khiến bị động (使役受身形) - VieJap',
    loadComponent: () =>
      import('./features/learning/verb-forms/forms/causative-passive-form/causative-passive-form-page').then((module) => module.CausativePassiveFormPage),
  },
  {
    path: 'luyen-tap',
    title: 'Trung tâm Luyện chia Thể Động Từ - VieJap',
    loadComponent: () =>
      import('./features/learning/verb-forms/hub/practice-hub-page').then((module) => module.PracticeHubPage),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
