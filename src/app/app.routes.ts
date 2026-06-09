import { Routes } from '@angular/router';

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
    path: '**',
    redirectTo: '',
  },
];
