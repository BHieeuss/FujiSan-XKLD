import { TestBed } from '@angular/core/testing';
import { PosterMakerPage } from './poster-maker-page';

describe('PosterMakerPage', () => {
  it('should render the order image form and canvas', async () => {
    await TestBed.configureTestingModule({
      imports: [PosterMakerPage],
    }).compileComponents();

    const fixture = TestBed.createComponent(PosterMakerPage);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const canvas = compiled.querySelector('canvas');

    expect(compiled.querySelector('h1')?.textContent).toContain('Tạo đơn hàng tuyển dụng');
    expect(compiled.querySelectorAll('.form-panel').length).toBe(4);
    expect(canvas?.getAttribute('width')).toBe('1080');
    expect(canvas?.getAttribute('height')).toBe('1620');
  });

  it('should restore the default order content', async () => {
    await TestBed.configureTestingModule({
      imports: [PosterMakerPage],
    }).compileComponents();

    const fixture = TestBed.createComponent(PosterMakerPage);
    const component = fixture.componentInstance;
    component.data.title = 'Đơn đã sửa';

    component.resetPoster();

    expect(component.data.title).toBe('LINH KIỆN ĐIỆN TỬ');
    expect(component.data.registrationUrl).toContain('zalo.me');
  });
});
