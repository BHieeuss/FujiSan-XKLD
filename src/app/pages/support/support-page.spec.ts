import { TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { SupportPage } from './support-page';

describe('SupportPage', () => {
  it('should render the requested support content', async () => {
    await TestBed.configureTestingModule({
      imports: [SupportPage],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { data: { pageKey: 'faq' } } },
        },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(SupportPage);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('h1')?.textContent).toContain(
      'Những điều nên biết',
    );
    expect(fixture.nativeElement.querySelectorAll('.support-sections article').length).toBe(5);
  });
});
