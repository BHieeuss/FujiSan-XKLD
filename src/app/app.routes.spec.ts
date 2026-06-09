import { routes } from './app.routes';

describe('Application routes', () => {
  it('should expose lazy home and Hiragana pages with a fallback', () => {
    expect(routes.find((route) => route.path === '')?.loadComponent).toBeDefined();
    expect(routes.find((route) => route.path === 'hoc-hiragana')?.loadComponent).toBeDefined();
    expect(routes[routes.length - 1].path).toBe('**');
    expect(routes[routes.length - 1].redirectTo).toBe('');
  });
});
