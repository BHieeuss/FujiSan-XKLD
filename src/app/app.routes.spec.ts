import { routes } from './app.routes';

describe('Application routes', () => {
  it('should expose lazy learning pages with a fallback', () => {
    expect(routes.find((route) => route.path === '')?.loadComponent).toBeDefined();
    expect(routes.find((route) => route.path === 'hoc-hiragana')?.loadComponent).toBeDefined();
    expect(routes.find((route) => route.path === 'hoc-katakana')?.loadComponent).toBeDefined();
    expect(routes.find((route) => route.path === 'hoc-so-dem')?.loadComponent).toBeDefined();
    expect(routes.find((route) => route.path === 'hoc-minna-bai-1')?.loadComponent).toBeDefined();
    expect(routes.find((route) => route.path === 'form-hoc-vien')?.loadComponent).toBeDefined();
    expect(routes.find((route) => route.path === 'dang-nhap-quan-tri')?.loadComponent).toBeDefined();
    expect(routes.find((route) => route.path === 'quan-tri-viejap')?.canActivate).toBeDefined();
    expect(routes.find((route) => route.path === 'quan-tri-viejap')?.canMatch).toBeDefined();
    expect(routes.find((route) => route.path === 'faq')?.data?.['pageKey']).toBe('faq');
    expect(routes.find((route) => route.path === 'chinh-sach-bao-mat')?.loadComponent).toBeDefined();
    expect(routes.find((route) => route.path === 'dieu-khoan')?.loadComponent).toBeDefined();
    expect(routes.find((route) => route.path === 'huong-dan')?.loadComponent).toBeDefined();
    expect(routes[routes.length - 1].path).toBe('**');
    expect(routes[routes.length - 1].redirectTo).toBe('');
  });
});
